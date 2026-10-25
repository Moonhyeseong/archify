import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const required = ['entity', 'coupled', 'degree', 'average-revs'];
const verbose = ['first-entity-revisions', 'second-entity-revisions', 'shared-revisions'];
const fail = message => { throw new Error(message); };

// A bounded CSV state machine, written for this experiment; no upstream code.
export function parseCsv(text) {
  if (Buffer.byteLength(text) > 200_000) fail('CSV exceeds 200000 bytes');
  text = text.replace(/^\uFEFF/, '');
  const rows = []; let row = [], field = '', state = 'start';
  const finishField = () => { row.push(field); field = ''; state = 'start'; };
  const finishRow = () => { finishField(); if (row.some(v => v !== '')) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (state === 'quoted') {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else state = 'quoted-end'; }
      else field += c;
      continue;
    }
    if (c === ',') { finishField(); continue; }
    if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; finishRow(); continue; }
    if (state === 'quoted-end') { if (c !== ' ' && c !== '\t') fail('Unexpected character after closing CSV quote'); continue; }
    if (c === '"') { if (state !== 'start' || field) fail('Quote inside unquoted CSV field'); state = 'quoted'; }
    else { field += c; state = 'unquoted'; }
  }
  if (state === 'quoted') fail('Unterminated CSV quote');
  if (field || row.length || state === 'quoted-end') finishRow();
  return rows;
}

function integer(value, name, row, max = 1_000_000_000) {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > max) fail(`Row ${row}: invalid ${name}`);
  return Number(value);
}
function fileName(value, row) {
  if (!value || value.length > 120 || /[\x00-\x1f\x7f`|]/.test(value)) fail(`Row ${row}: empty, overlong or unsupported path (control, backtick or pipe)`);
  return value;
}
export function convert(csv, metadata) {
  if (!metadata || !['synthetic', 'provided-report'].includes(metadata.kind)) fail('Metadata kind must be synthetic or provided-report');
  const rows = parseCsv(csv);
  if (!rows.length) fail('Missing CSV header');
  const header = rows.shift().map(v => v.trim());
  if (new Set(header).size !== header.length || required.some(k => !header.includes(k))) fail('Missing or duplicate required CSV columns');
  if (header.some(k => ![...required, ...verbose].includes(k))) fail('Unsupported CSV column');
  const hasCounts = verbose.every(k => header.includes(k));
  if (!hasCounts && verbose.some(k => header.includes(k))) fail('Verbose counts must be supplied together');
  if (rows.length > 30) fail('At most 30 data rows; no silent truncation');
  const pairs = new Map(); let duplicates = 0;
  rows.forEach((values, index) => {
    const rowNumber = index + 2;
    if (values.length !== header.length) fail(`Row ${rowNumber}: column count mismatch`);
    const r = Object.fromEntries(header.map((k, i) => [k, values[i]]));
    let a = fileName(r.entity, rowNumber), b = fileName(r.coupled, rowNumber);
    if (a === b) fail(`Row ${rowNumber}: self-pair`);
    const degree = integer(r.degree, 'degree', rowNumber, 100);
    const average = integer(r['average-revs'], 'average-revs', rowNumber);
    if (average < 1) fail(`Row ${rowNumber}: average-revs must be positive`);
    let counts = null;
    if (hasCounts) {
      const first = integer(r[verbose[0]], verbose[0], rowNumber);
      const second = integer(r[verbose[1]], verbose[1], rowNumber);
      const shared = integer(r[verbose[2]], verbose[2], rowNumber);
      if (!first || !second || shared > Math.min(first, second)) fail(`Row ${rowNumber}: impossible revision counts`);
      if (average !== Math.ceil((first + second) / 2) || degree !== Math.floor(200 * shared / (first + second))) fail(`Row ${rowNumber}: degree/average inconsistent with verbose counts`);
      counts = { first, second, shared };
    }
    if (a > b) { [a, b] = [b, a]; if (counts) [counts.first, counts.second] = [counts.second, counts.first]; }
    const pair = { a, b, degree, average, counts };
    const key = JSON.stringify([a, b]);
    if (pairs.has(key)) {
      if (JSON.stringify(pairs.get(key)) !== JSON.stringify(pair)) fail(`Row ${rowNumber}: conflicting duplicate pair`);
      duplicates++;
    } else pairs.set(key, pair);
  });
  if (pairs.size > 6) fail('At most 6 unique pairs for this small visual experiment');
  const ordered = [...pairs.values()].sort((a, b) => a.a.localeCompare(b.a, 'en') || a.b.localeCompare(b.b, 'en'));
  const evidence = {
    adapter: 'change-coupling/1', kind: metadata.kind,
    inputSha256: createHash('sha256').update(csv).digest('hex'),
    suppliedMetadata: metadata,
    semantics: 'Symmetric co-change score; not calls, causality, conditional probability or predicted impact.',
    scope: 'Only supplied rows. Missing pairs and files are unknown; empty report means no supplied pairs.',
    duplicatesCollapsed: duplicates, pairs: ordered,
  };
  const components = [], connections = [];
  ordered.forEach((p, i) => {
    const id = `pair-${i + 1}`;
    components.push(
      { id: `${id}-a`, type: 'backend', label: p.a, sublabel: 'File member', size: [340, 92], row: i, col: 0 },
      { id, type: 'external', label: `Pair ${i + 1} · score ${p.degree}`, sublabel: p.counts ? `shared ${p.counts.shared} · revs ${p.counts.first}/${p.counts.second}` : 'shared/revision counts unknown', size: [340, 92], row: i, col: 1 },
      { id: `${id}-b`, type: 'backend', label: p.b, sublabel: 'File member', size: [340, 92], row: i, col: 2 },
    );
    for (const member of ['a', 'b']) connections.push({ id: `${id}-member-${member}`, from: id, to: `${id}-${member}`, label: 'member', variant: 'dashed' });
  });
  if (!ordered.length) components.push({ id: 'empty', type: 'external', label: 'No supplied pairs', sublabel: 'Other relationships remain unknown', size: [340, 92], row: 0, col: 0 });
  const graph = {
    schema_version: 1, diagram_type: 'architecture',
    meta: { title: `${metadata.kind === 'synthetic' ? 'Synthetic' : 'Provided'} co-change evidence`, output: 'coupling.html', subtitle: 'One pair per row; shared files repeat. Pair → file = membership, not calls or conditional probability.', quality_profile: 'standard', legend: { entries: { backend: { label: 'File member' }, external: { label: 'Pair evidence' } } } },
    layout: { mode: 'grid', cols: 3, cellW: 340, cellH: 92, gapX: 110, gapY: 95 },
    components, connections,
    cards: [{ title: 'Evidence boundary', dot: 'amber', items: ['Each pair is symmetric; arrows mean membership only.', 'Files repeat across pair rows. Missing pairs are unknown.', metadata.kind === 'synthetic' ? 'Original synthetic fixture; no repository was measured.' : 'User-provided report; producer execution is not verified.'] }],
  };
  const table = ordered.map((p, i) => `| ${i + 1} | \`${p.a}\` | \`${p.b}\` | ${p.degree} | ${p.average} | ${p.counts?.first ?? 'unknown'} / ${p.counts?.second ?? 'unknown'} | ${p.counts?.shared ?? 'unknown'} |`).join('\n');
  const markdown = `# Co-change evidence, with its limits {#change-coupling}\n\n${metadata.kind === 'synthetic' ? 'This original synthetic fixture demonstrates the adapter; no repository was measured.' : 'This supplied report describes observed co-change; its producer execution is not verified.'}\n\n- Scores are symmetric and do not imply calls, causality, conditional probability or predicted change impact.\n- Missing files and pairs remain unknown. An empty report proves no absence of coupling.\n\n@answer scope="${ordered.length} supplied pairs; ${duplicates} identical duplicate rows collapsed; sampling window is recorded only in evidence.json when provided."\n@meta locale=en\n@source formula title="Code Maat logical coupling source" url=https://github.com/adamtornhill/code-maat/blob/50537abb8dffa1b1ba4e91a605ee5c558c01b224/src/code_maat/analysis/logical_coupling.clj\n\n## Which files belong to each observed pair? {#pairs}\n\n@diagram architecture source=coupling.architecture.json\n\nPair nodes point to their two members. These arrows express membership only. Repeated file labels are the same file shown in separate pairs.\n\n## What are the original counts? {#counts}\n\n${ordered.length ? `| Pair | File A | File B | Score | Average revisions | A / B revisions | Shared |\n| --- | --- | --- | --- | --- | --- | --- |\n${table}` : 'No supplied pairs. The report may be empty or filtered; other relationships remain unknown.'}\n\nScore equals the integer part of 200 times shared revisions divided by the sum of both revision counts. Average revisions is rounded up.[](source:formula) Counts omitted by the default CSV stay unknown; the score alone cannot recover them.\n\n## What should a reader check? {#review}\n\n- [ ] Check the supplied report window and filters in evidence.json. Their absence means unknown.\n- [ ] Read the paired source files before making a design decision.\n- [ ] Check broad commits, generated files and renames before interpreting co-change.\n`;
  return { evidence, graph, markdown };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [csvFile, metaFile, output] = process.argv.slice(2);
    if (!csvFile || !metaFile || !output || process.argv.length !== 5) fail('Usage: node adapter.mjs report.csv metadata.json output-directory');
    const result = convert(fs.readFileSync(csvFile, 'utf8'), JSON.parse(fs.readFileSync(metaFile, 'utf8')));
    // All parsing and consistency checks finish before writing any output.
    // A fresh destination prevents following any pre-existing output symlink.
    fs.mkdirSync(output);
    for (const [name, value] of [['evidence.json', result.evidence], ['coupling.architecture.json', result.graph]]) fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    fs.writeFileSync(path.join(output, 'coupling.archify.md'), result.markdown, { flag: 'wx' });
    console.log(JSON.stringify({ pairs: result.evidence.pairs.length, output: path.resolve(output), inputSha256: result.evidence.inputSha256 }));
  } catch (error) { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; }
}
