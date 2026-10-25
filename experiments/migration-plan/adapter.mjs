import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

export const source = {
  repository: 'https://github.com/stripe/pg-schema-diff',
  commit: '9ada4710c28718312557c84cca1be4b2557eed54',
  format: 'pkg/diff/plan.go Plan and Statement.MarshalJSON',
  license: 'MIT',
};
const knownHazards = new Set([
  'ACQUIRES_ACCESS_EXCLUSIVE_LOCK', 'ACQUIRES_SHARE_LOCK', 'ACQUIRES_SHARE_ROW_EXCLUSIVE_LOCK',
  'CORRECTNESS', 'DELETES_DATA', 'HAS_UNTRACKABLE_DEPENDENCIES', 'INDEX_BUILD', 'INDEX_DROPPED',
  'IMPACTS_DATABASE_PERFORMANCE', 'IS_USER_GENERATED', 'UPGRADING_EXTENSION_VERSION', 'AUTHZ_UPDATE',
]);
const fail = message => { throw new Error(message); };
const has = (obj, key) => Object.hasOwn(obj, key);
function object(value, location, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${location}: expected object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${location}: unsupported property ${JSON.stringify(key)}`);
}
function text(value, location, limit, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > limit) fail(`${location}: expected ${allowEmpty ? '' : 'non-empty '}string up to ${limit} characters`);
  // Snippets faithfully preserve ordinary Unicode and newlines, but not invisible controls or lone surrogates.
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u.test(value) || !value.isWellFormed()) fail(`${location}: unsupported control or malformed Unicode`);
  return value;
}
function timeout(statement, field, index) {
  if (!has(statement, field)) return null;
  const value = statement[field];
  if (!Number.isSafeInteger(value) || value < 0) fail(`statements[${index}].${field}: expected nonnegative safe integer milliseconds`);
  return value;
}
export function convert(plan, kind) {
  if (!['synthetic', 'provided-plan'].includes(kind)) fail('kind must be synthetic or provided-plan');
  object(plan, 'plan', ['statements', 'current_schema_hash']);
  if (!has(plan, 'statements')) fail('plan.statements: required, array or null');
  if (plan.statements !== null && !Array.isArray(plan.statements)) fail('plan.statements: expected array or null');
  if (has(plan, 'current_schema_hash')) text(plan.current_schema_hash, 'current_schema_hash', 2000, true);
  const inputStatements = plan.statements ?? [];
  if (inputStatements.length > 6) fail('At most 6 statements; no silent truncation');
  const statements = inputStatements.map((s, i) => {
    object(s, `statements[${i}]`, ['ddl', 'timeout_ms', 'lock_timeout_ms', 'hazards']);
    text(s.ddl, `statements[${i}].ddl`, 8000);
    const timeoutMs = timeout(s, 'timeout_ms', i), lockTimeoutMs = timeout(s, 'lock_timeout_ms', i);
    if (has(s, 'hazards') && s.hazards !== null && !Array.isArray(s.hazards)) fail(`statements[${i}].hazards: expected array, null or absent`);
    if ((s.hazards?.length ?? 0) > 10) fail(`statements[${i}].hazards: at most 10 entries`);
    const hazards = (s.hazards ?? []).map((h, n) => {
      object(h, `statements[${i}].hazards[${n}]`, ['type', 'message']);
      text(h.type, `statements[${i}].hazards[${n}].type`, 300);
      text(h.message, `statements[${i}].hazards[${n}].message`, 4000, true);
      return { ...h, recognizedAtPinnedVersion: knownHazards.has(h.type) };
    });
    return {
      id: `statement-${i + 1}`, ordinal: i + 1, ddl: s.ddl,
      timeoutMs, lockTimeoutMs,
      hazardsStatus: !has(s, 'hazards') ? 'absent' : s.hazards === null ? 'null' : s.hazards.length ? 'provided' : 'empty',
      hazards,
    };
  });
  const workflow = {
    schema_version: 2, diagram_type: 'workflow',
    meta: { title: kind === 'synthetic' ? 'Synthetic migration plan · not executed' : 'Provided migration plan · not executed here', output: 'plan.html', quality_profile: 'standard', legend: { entries: { backend: { label: 'Planned statement' }, external: { label: 'No supplied statements' } } } },
    lanes: [{ id: 'plan', label: 'Supplied statement order' }],
    ...(statements.length >= 2 ? { mainPath: statements.map(s => s.id) } : {}),
    nodes: statements.length ? statements.map((s, i) => ({ id: s.id, lane: 'plan', col: i, type: 'backend', label: `Statement ${s.ordinal}`, sublabel: `${s.hazards.length} risk entries`, tag: s.hazards.some(h => !h.recognizedAtPinnedVersion) ? 'unknown risk type' : s.hazards.length ? 'see supplied risks' : 'no risk entries supplied' })) : [{ id: 'no-statements', lane: 'plan', col: 0, type: 'external', label: 'No statements', sublabel: plan.statements === null ? 'null input · not verified' : 'empty array · not verified' }],
    edges: statements.slice(1).map((s, i) => ({ from: statements[i].id, to: s.id, label: 'then', variant: 'dashed' })),
    cards: [{ dot: 'amber', title: 'Read-only plan evidence', items: ['Order comes from the supplied array; duplicate SQL remains separate.', 'Timeouts are configuration, not measured durations.', 'No SQL, database or planner was executed by this adapter.'] }],
  };
  const hazardStatus = s => s.hazardsStatus === 'empty' ? 'No risk entries supplied; not a safety verdict.' : s.hazardsStatus === 'absent' ? 'Risks unknown: hazards property absent.' : s.hazardsStatus === 'null' ? 'Risks unknown: hazards is null.' : `${s.hazards.length} supplied risk entries; unknown types stay visible.`;
  const panels = [
    { id: 'order', title: 'What is the supplied order?', blocks: [
      { id: 'ordered-plan', type: 'diagram', diagramType: 'workflow', spec: workflow },
      { id: 'order-boundary', type: 'prose', text: 'Arrows mean the next statement in the supplied plan. They do not infer table dependencies, success, approval or actual execution.' },
    ] },
    { id: 'configuration', title: 'Which timeout values were provided?', blocks: [
      ...(statements.length ? [{ id: 'timeouts', type: 'comparison', labelColumn: 'Statement', columns: ['Statement timeout', 'Lock timeout', 'Risk entries'], rows: statements.map(s => ({ id: `timeout-${s.ordinal}`, label: `Statement ${s.ordinal}`, cells: [{text: s.timeoutMs === null ? 'unknown: absent' : `${s.timeoutMs} ms`}, {text: s.lockTimeoutMs === null ? 'unknown: absent' : `${s.lockTimeoutMs} ms`}, {text: s.hazardsStatus === 'empty' ? 'No entries supplied' : ['absent','null'].includes(s.hazardsStatus) ? `unknown: ${s.hazardsStatus}` : `${s.hazards.length} supplied; ${s.hazards.filter(h=>!h.recognizedAtPinnedVersion).length} unknown types`} ] })) }] : [{ id:'no-statements-note',type:'prose',text:'No statements were supplied. This does not verify database state or prove that no migration is needed.' }]),
      { id:'time-boundary', type:'callout', level:'note', title:'Configuration values only',text:'Milliseconds are supplied configuration. Zero remains zero; absent remains unknown. Nothing here measures query duration or estimates lock duration.' },
    ] },
    ...statements.map(s => ({ id:`detail-${s.ordinal}`, title:`Statement ${s.ordinal}: literal SQL and supplied risks`, blocks:[
      { id:`ddl-${s.ordinal}`,type:'snippet',language:'sql',title:`Statement ${s.ordinal} · not executed`,text:s.ddl },
      { id:`risk-status-${s.ordinal}`,type:'prose',text:hazardStatus(s) },
      ...s.hazards.map((h,n) => ({ id:`hazard-${s.ordinal}-${n+1}`,type:'snippet',language:'json',title:`Risk entry ${n+1} · ${h.recognizedAtPinnedVersion ? 'known at pinned source' : 'unknown type preserved'}`,text:JSON.stringify({type:h.type,message:h.message},null,2) })),
    ] })),
    { id:'provenance', title:'What does this plan prove?', blocks:[
      {id:'hash-caption',type:'prose',text:'The following is the upstream schema fingerprint as provided. Its algorithm is not assumed to be SHA-256, and the current database state has not been checked.'},
      {id:'schema-fingerprint',type:'snippet',language:'json',title:'Supplied schema fingerprint',text:JSON.stringify(has(plan,'current_schema_hash') ? {current_schema_hash:plan.current_schema_hash} : {status:'unknown: current_schema_hash absent'},null,2)},
      {id:'verification-boundary',type:'callout',level:'warning',title:'Validation and approval remain unknown',text:'The pinned exporter does not serialize SkipValidation. Its absence is not evidence that the plan was validated. Empty hazards do not imply safety. This adapter does not connect to a database, execute SQL, run a planner or grant approval.'},
    ] },
  ];
  const explainer = {
    schema_version:1,diagram_type:'explainer',meta:{id:'migration-plan',title:kind === 'synthetic' ? 'Synthetic migration plan: read the order and risk evidence' : 'Migration plan: read supplied order and risk evidence',locale:'en'},
    answer:{summary:kind === 'synthetic' ? 'This original synthetic plan demonstrates evidence reading; no database or planner was run.' : 'Read this supplied plan in its original order; execution, database state and approval are not verified.', reasons:['Repeated SQL keeps separate statement identity.','Risk entries and unknown types stay attached to their statement.','Timeout settings remain separate from measured duration.'],scope:`${statements.length} supplied statements; read-only adapter; no database connection or SQL execution.`},
    panels,sources:[{id:'plan-format',title:'Pinned pg-schema-diff Plan and Statement JSON source',url:`${source.repository}/blob/${source.commit}/pkg/diff/plan.go`}],
  };
  const evidence = { adapter:'migration-plan/1',kind,formatSource:source,semantics:'Supplied plan order and fields, not runtime dependency, safety, validation or approval.',statementsStatus:plan.statements === null ? 'null' : statements.length ? 'provided' : 'empty',originalPlan:plan,statements };
  return {workflow,explainer,evidence};
}

export function readPlan(raw) {
  if (Buffer.byteLength(raw) > 200_000) fail('Input exceeds 200000 UTF-8 bytes');
  const decoded = typeof raw === 'string' ? raw : new TextDecoder('utf-8', { fatal: true }).decode(raw);
  return JSON.parse(decoded);
}
export function publish(raw, kind, output) {
  const result = convert(readPlan(raw),kind);
  result.evidence.inputSha256 = createHash('sha256').update(raw).digest('hex');
  fs.mkdirSync(output); // Existing directory, file or symlink is refused, before any file writes.
  for (const [name,value] of [['plan.workflow.json',result.workflow],['plan.explainer.json',result.explainer],['evidence.json',result.evidence]]) fs.writeFileSync(path.join(output,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  return result;
}
export function readInput(file) {
  const fd = fs.openSync(file, 'r');
  try {
    if (!fs.fstatSync(fd).isFile()) fail('Input must be a regular file');
    const buffer = Buffer.alloc(200001);
    let length = 0;
    while (length < buffer.length) {
      const count = fs.readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > 200000) fail('Input exceeds 200000 UTF-8 bytes');
    return buffer.subarray(0, length);
  } finally { fs.closeSync(fd); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [input,kind,output] = process.argv.slice(2);
    if (process.argv.length !== 5) fail('Usage: node adapter.mjs plan.json synthetic|provided-plan new-output-directory');
    const r = publish(readInput(input),kind,output);
    console.log(JSON.stringify({ok:true,statements:r.evidence.statements.length,output}));
  } catch(error) { console.error(JSON.stringify({ok:false,error:error.message}));process.exitCode=1; }
}
