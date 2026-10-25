import { constants as C, openSync, fstatSync, readSync, closeSync, mkdirSync, lstatSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMITS = Object.freeze({ bytes: 65536, nodes: 3000, depth: 12, array: 100, keys: 100, string: 1000, changes: 300 });
const own = (o, k) => Object.hasOwn(o, k);
const type = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
const pointer = (p, k) => `${p}/${String(k).replaceAll('~', '~0').replaceAll('/', '~1')}`;
const fail = message => { throw new Error(message); };
function identity(item, key) {
  if (!item || type(item) !== 'object' || !own(item, key) || !['string', 'number'].includes(type(item[key]))) fail(`idKey ${key}: every array item needs an own string/number key`);
  return `${type(item[key])}:${JSON.stringify(item[key])}`;
}
export function compare(input) {
  if (type(input) !== 'object') fail('Input must be an object');
  const allowed = ['caller', 'callee', 'operation', 'arrayMode', 'idKey', 'before', 'after'];
  if (Object.keys(input).some(k => !allowed.includes(k)) || allowed.slice(0, 4).some(k => !own(input, k)) || !own(input, 'before') || !own(input, 'after')) fail('Unknown or missing input field');
  for (const k of ['caller', 'callee', 'operation']) if (typeof input[k] !== 'string' || !/^[A-Za-z0-9 /_.:-]{1,70}$/.test(input[k])) fail(`Invalid ${k}: use 1–70 plain ASCII label characters`);
  if (!['index', 'id'].includes(input.arrayMode)) fail('arrayMode must explicitly be index or id');
  if (input.arrayMode === 'id' ? typeof input.idKey !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(input.idKey) : own(input, 'idKey')) fail('id mode requires idKey; index mode forbids idKey');
  let nodes = 0;
  function validate(v, depth = 0) {
    if (++nodes > LIMITS.nodes || depth > LIMITS.depth) fail('Payload node/depth bound exceeded');
    const t = type(v);
    if (t === 'number' && (!Number.isFinite(v) || (Number.isInteger(v) && !Number.isSafeInteger(v)))) fail('Numbers must be finite and integers safely representable');
    if (t === 'string' && v.length > LIMITS.string) fail('String bound exceeded');
    if (!['object', 'array', 'null', 'string', 'boolean', 'number'].includes(t)) fail('Not a JSON value');
    if (t === 'array') {
      if (v.length > LIMITS.array) fail('Array bound exceeded');
      if (input.arrayMode === 'id') { const ids = v.map(x => identity(x, input.idKey)); if (new Set(ids).size !== ids.length) fail('Duplicate idKey in array'); }
      v.forEach(x => validate(x, depth + 1));
    } else if (t === 'object') {
      if (Object.keys(v).length > LIMITS.keys) fail('Object key bound exceeded');
      for (const [k, x] of Object.entries(v)) { if (k.length > 100) fail('Key bound exceeded'); validate(x, depth + 1); }
    }
  }
  validate(input.before); validate(input.after);
  const changes = [];
  function add(kind, bp, ap, a, b, note) {
    if (changes.length >= LIMITS.changes) fail('Change bound exceeded');
    changes.push({ kind, beforePointer: bp, afterPointer: ap, before: bp === null ? { present: false } : { present: true, type: type(a), value: a }, after: ap === null ? { present: false } : { present: true, type: type(b), value: b }, ...(note ? { note } : {}) });
  }
  function walk(a, b, bp, ap) {
    if (type(a) !== type(b)) return add('modified', bp, ap, a, b);
    if (type(a) === 'object') {
      for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
        if (!own(a, k)) add('added', null, pointer(ap, k), undefined, b[k]);
        else if (!own(b, k)) add('removed', pointer(bp, k), null, a[k], undefined);
        else walk(a[k], b[k], pointer(bp, k), pointer(ap, k));
      }
    } else if (type(a) === 'array') {
      if (input.arrayMode === 'index') {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          if (i >= a.length) add('added', null, pointer(ap, i), undefined, b[i]);
          else if (i >= b.length) add('removed', pointer(bp, i), null, a[i], undefined);
          else walk(a[i], b[i], pointer(bp, i), pointer(ap, i));
        }
      } else {
        const ak = a.map(x => identity(x, input.idKey)), bk = b.map(x => identity(x, input.idKey));
        // Record exact order separately. This is an observed array value change, not a field edit.
        if (JSON.stringify(ak) !== JSON.stringify(bk)) add('modified', bp, ap, a, b, `Array membership/order changed; matching by ${input.idKey}`);
        const ai = new Map(ak.map((k, i) => [k, i])), bi = new Map(bk.map((k, i) => [k, i]));
        for (const k of new Set([...ak, ...bk])) {
          if (!ai.has(k)) add('added', null, pointer(ap, bi.get(k)), undefined, b[bi.get(k)]);
          else if (!bi.has(k)) add('removed', pointer(bp, ai.get(k)), null, a[ai.get(k)], undefined);
          else walk(a[ai.get(k)], b[bi.get(k)], pointer(bp, ai.get(k)), pointer(ap, bi.get(k)));
        }
      }
    } else if (a !== b) add('modified', bp, ap, a, b);
  }
  walk(input.before, input.after, '', '');
  return { format: 'payload-delta-lab/1', provenance: 'Original synthetic samples; no runtime traffic or schema compatibility inference', call: { caller: input.caller, callee: input.callee, operation: input.operation }, arrayPolicy: { mode: input.arrayMode, ...(input.idKey ? { idKey: input.idKey } : {}) }, changes };
}
const pretty = value => JSON.stringify(value, null, 2).replaceAll('`', '\\u0060').replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
// Table grammar consumes one escape layer before inline parsing. A code span
// prevents payload text from becoming links/images/emphasis. Encode backticks
// and controls visibly, double backslashes for the row parser, escape pipes.
const cell = s => '`' + String(s).replace(/[\u0000-\u001f\u007f\u2028\u2029`]/gu, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).replaceAll('\\', '\\\\').replaceAll('|', '\\|') + '`';
const shown = v => !v.present ? 'MISSING' : `${v.type}: ${JSON.stringify(v.value)}`;
export function documents(input, delta) {
  const policy = input.arrayMode === 'id' ? `idKey=${input.idKey}; exact string/number identity; no guessing` : 'index; array positions are compared directly';
  const sequence = { schema_version: 1, diagram_type: 'sequence', meta: { title: 'Synthetic API sample comparison', subtitle: `${input.operation} | arrays: ${input.arrayMode}${input.idKey ? ` (${input.idKey})` : ''}`, output: 'call.html', animation: 'none' }, participants: [{ id: 'caller', label: input.caller, type: 'frontend' }, { id: 'callee', label: input.callee, type: 'backend' }], messages: [{ id: 'operation', from: 'caller', to: 'callee', y: 170, label: input.operation, variant: 'emphasis' }, { id: 'policy', from: 'callee', to: 'caller', y: 235, label: `Sample delta: ${delta.changes.length} records; arrays: ${input.arrayMode}`, variant: 'return' }] };
  const lines = ['# What changed in this API payload sample? {#payload-delta}', '', `The two original synthetic samples for ${input.operation} differ in ${delta.changes.length} records. Compare the named call with its nearby JSON Pointer table. Array policy: ${policy}.`, '', '@answer scope="Synthetic payload values only; not a schema compatibility verdict or captured traffic"', '', '## Which call do these samples describe? {#call}', '', `Caller: ${input.caller}. Callee: ${input.callee}. Operation: ${input.operation}. Array policy: ${policy}.`, '', '@diagram sequence id=sample-call source=call.sequence.json title="Named synthetic call and explicit array policy"', '', '## Which exact values changed? {#changes}', '', 'Table code cells are literal; backticks and control characters use visible Unicode escapes, with exact raw pointers and values retained in delta.json. Pointers are displayed as JSON strings using RFC 6901 escaping; the empty JSON string denotes the root. JSON string escaping distinguishes control characters from literal backslashes. Old and new pointers are shown separately when id matching moves an item. MISSING means absent, distinct from null. Array membership/order records include the whole array and overlap the detailed field records; these are records, not a count of independent edits.', '', '| Record | Kind | Before pointer | After pointer | Before (type and value) | After (type and value) | Note |', '| --- | --- | --- | --- | --- | --- | --- |'];
  for (const [index, c] of delta.changes.entries()) lines.push(`| change-${index + 1} | ${c.kind} | ${cell(c.beforePointer === null ? 'MISSING' : JSON.stringify(c.beforePointer))} | ${cell(c.afterPointer === null ? 'MISSING' : JSON.stringify(c.afterPointer))} | ${cell(shown(c.before))} | ${cell(shown(c.after))} | ${cell(c.note || 'Value comparison')} |`);
  if (!delta.changes.length) lines.push('| unchanged | unchanged | (root) | (root) | Same JSON values | Same JSON values | Object key order ignored |');
  lines.push('', '## Before sample {#before}', '', '```json', pretty(input.before), '```', '', '## After sample {#after}', '', '```json', pretty(input.after), '```', '', '## What can this page establish? {#limits}', '', 'It compares the explicitly supplied values using the displayed policy. It does not infer required fields, runtime reachability, traffic, schema breaking changes, test coverage or approval. Caller, callee and operation are supplied labels, not repository-derived facts.');
  return { 'delta.json': pretty(delta) + '\n', 'call.sequence.json': pretty(sequence) + '\n', 'review.archify.md': lines.join('\n') + '\n' };
}
export function generate(inputPath, outputPath) {
  const fd = openSync(inputPath, C.O_RDONLY | C.O_NOFOLLOW);
  let input;
  try { const st = fstatSync(fd); if (!st.isFile() || st.size > LIMITS.bytes) fail('Input must be a regular file at most 64 KiB'); const raw = Buffer.alloc(LIMITS.bytes + 1); let size = 0, n; while (size < raw.length && (n = readSync(fd, raw, size, raw.length - size, null))) size += n; if (size > LIMITS.bytes) fail('Input grew beyond bound'); input = JSON.parse(raw.subarray(0, size).toString('utf8')); } finally { closeSync(fd); }
  const delta = compare(input), docs = documents(input, delta);
  if (Object.values(docs).some(s => Buffer.byteLength(s) > 2 * 1024 * 1024)) fail('Generated document exceeds 2 MiB bound');
  const target = path.resolve(outputPath);
  // Refuse every existing symlink in the destination chain before creating a fresh leaf.
  for (let p = path.dirname(target); ; p = path.dirname(p)) { const st = lstatSync(p); if (!st.isDirectory() || st.isSymbolicLink()) fail('Output ancestors must be real directories'); if (p === path.dirname(p)) break; }
  mkdirSync(target, { mode: 0o700 });
  for (const [name, data] of Object.entries(docs)) writeFileSync(path.join(target, name), data, { flag: 'wx', mode: 0o600 });
  return { records: delta.changes.length, output: target };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { if (process.argv.length !== 4) fail('Usage: node compare.mjs input.json NEW_OUTPUT_DIRECTORY'); console.log(JSON.stringify(generate(process.argv[2], process.argv[3]))); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
