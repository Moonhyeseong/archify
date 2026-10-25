import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
export const contracts = {
  coverage: { repository: 'https://github.com/coveragepy/coveragepy', commit: '0e4f752b455bbf26fdad32ac29948d067c87dd62', file: 'coverage/jsonreport.py', license: 'Apache-2.0' },
  pytestCov: { repository: 'https://github.com/pytest-dev/pytest-cov', commit: 'a8cb1260170754f2aff9022cfd252c488098e813', file: 'src/pytest_cov/plugin.py', license: 'MIT' },
};
const fail = message => { throw new Error(message); };
const has = (object, key) => Object.hasOwn(object, key);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const literalInline = value => [...String(value)].map(c => '\\`*_[]()!<>~|'.includes(c) ? '\\' + c : c).join('');
function object(value, location) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${location}: expected object`); }
function text(value, location, limit = 300, empty = false) {
  if (typeof value !== 'string' || (!empty && !value.length) || value.length > limit || /[\x00-\x1f\x7f]/u.test(value) || !value.isWellFormed()) fail(`${location}: invalid bounded literal string`);
  return value;
}
function relative(value, location) {
  text(value, location, 200);
  if (value.includes('\\') || value.includes(':') || value.split('/').some(p => ['', '.', '..'].includes(p))) fail(`${location}: expected an explicit relative path, never a URL or external path`);
  return value;
}
function list(value, location, max) { if (!Array.isArray(value) || value.length > max) fail(`${location}: expected array of at most ${max} entries`); return value; }
function line(value, location) { if (!Number.isSafeInteger(value) || value < 1 || value > 10_000_000) fail(`${location}: expected positive bounded line number`); return value; }
function uniqueLines(values, location) {
  const result = list(values, location, 20000).map(v => line(v, location));
  if (new Set(result).size !== result.length) fail(`${location}: duplicate line number`);
  return new Set(result);
}
function binding(value, location) {
  object(value, location);
  text(value.runId, `${location}.runId`, 100);
  if (typeof value.sourceRevision !== 'string' || !/^[0-9a-f]{40}$/.test(value.sourceRevision)) fail(`${location}: expected full source revision`);
}
function loadJson(raw, label, maximum) {
  if (Buffer.byteLength(raw) > maximum) fail(`${label}: input exceeds byte limit`);
  try { return JSON.parse(typeof raw === 'string' ? raw : new TextDecoder('utf-8', { fatal: true }).decode(raw)); }
  catch { fail(`${label}: invalid UTF-8 JSON`); }
}
export function convert(report, sidecar, actualReportDigest) {
  object(report, 'report'); object(report.meta, 'report.meta'); object(report.files, 'report.files'); object(sidecar, 'sidecar');
  if (report.meta.format !== 3 || report.meta.show_contexts !== true) fail('Only coverage.py format 3 with meta.show_contexts=true is supported');
  text(report.meta.version, 'report.meta.version', 100);
  if (sidecar.schemaVersion !== 1 || !['synthetic', 'provided-report'].includes(sidecar.kind)) fail('Unsupported sidecar schemaVersion/kind');
  binding(sidecar.reportBinding, 'reportBinding'); binding(sidecar.selectionBinding, 'selectionBinding');
  if (!/^[0-9a-f]{64}$/.test(actualReportDigest) || sidecar.reportBinding.sha256 !== actualReportDigest || sidecar.selectionBinding.reportSha256 !== actualReportDigest) fail('Report digest binding mismatch');
  if (sidecar.reportBinding.runId !== sidecar.selectionBinding.runId || sidecar.reportBinding.sourceRevision !== sidecar.selectionBinding.sourceRevision) fail('Run or revision binding mismatch');
  if (sidecar.reportBinding.exporterVersion !== report.meta.version) fail('Exporter version binding mismatch');
  const filters = list(sidecar.reportBinding.collectionFilters, 'collectionFilters', 20).map(v => text(v, 'collectionFilter', 300));
  const fileEntries = Object.entries(report.files);
  if (fileEntries.length > 50) fail('At most 50 report files');
  const files = new Map();
  for (const [fileName, data] of fileEntries) {
    relative(fileName, 'report file key'); object(data, 'report file'); object(data.contexts, 'report file contexts');
    const executed = uniqueLines(data.executed_lines, 'executed_lines');
    const missing = uniqueLines(data.missing_lines, 'missing_lines');
    const excluded = uniqueLines(data.excluded_lines, 'excluded_lines');
    if ([...executed].some(n => missing.has(n) || excluded.has(n)) || [...missing].some(n => excluded.has(n))) fail('Contradictory executed/missing/excluded sets');
    const contexts = new Map(); const entries = Object.entries(data.contexts);
    if (entries.length > 20000) fail('Too many context line entries');
    for (const [rawLine, labels] of entries) {
      if (!/^[1-9]\d*$/.test(rawLine)) fail('Context line keys must be canonical positive integers');
      const n = line(Number(rawLine), 'context key');
      const values = list(labels, 'line contexts', 100).map(v => text(v, 'context label', 500, true));
      if (new Set(values).size !== values.length) fail('Duplicate context label on one line');
      if (missing.has(n) && values.length) fail('Missing line contradicts observed context labels');
      contexts.set(n, values);
    }
    for (const n of executed) if (!contexts.has(n) || contexts.get(n).length === 0) fail('Executed line has missing/empty contexts; context attribution is unavailable');
    files.set(fileName, { executed, missing, excluded, contexts });
  }
  const fileMap = new Map(); const reportPaths = new Set();
  for (const entry of list(sidecar.fileMap, 'fileMap', 10)) {
    object(entry, 'fileMap entry'); relative(entry.sourcePath, 'fileMap sourcePath'); relative(entry.reportPath, 'fileMap reportPath');
    if (fileMap.has(entry.sourcePath) || reportPaths.has(entry.reportPath)) fail('Duplicate/conflicting file mapping');
    fileMap.set(entry.sourcePath, entry.reportPath); reportPaths.add(entry.reportPath);
  }
  const contextMap = new Map();
  for (const entry of list(sidecar.contextMap, 'contextMap', 10)) {
    object(entry, 'contextMap entry'); text(entry.context, 'contextMap context', 500); text(entry.testId, 'contextMap testId', 500);
    if (!['setup', 'run', 'teardown'].includes(entry.phase)) fail('Unsupported contextMap phase');
    if (contextMap.has(entry.context)) fail('Duplicate/conflicting exact context mapping');
    contextMap.set(entry.context, { testId: entry.testId, phase: entry.phase });
  }
  const selectedFiles = new Set(); const rows = []; const selectedLabels = new Set(); const groupMap = new Map();
  for (const selection of list(sidecar.selections, 'selections', 10)) {
    object(selection, 'selection'); relative(selection.sourcePath, 'selection sourcePath');
    if (selectedFiles.has(selection.sourcePath) || !fileMap.has(selection.sourcePath)) fail('Duplicate or unmapped selected file path');
    selectedFiles.add(selection.sourcePath);
    const numbers = list(selection.lines, 'selected lines', 20).map(v => line(v, 'selected line'));
    if (!numbers.length || new Set(numbers).size !== numbers.length) fail('Selected lines must be non-empty and unique');
    const reportPath = fileMap.get(selection.sourcePath), data = files.get(reportPath), fileOrdinal = selectedFiles.size;
    for (const n of numbers) {
      if (rows.length >= 20) fail('At most 20 selected source lines; no silent truncation');
      const row = { id: `line-${rows.length + 1}`, fileId: `F${fileOrdinal}`, sourcePath: selection.sourcePath, line: n, states: [], labels: [], mapped: [], unknownLabels: [], unattributedEmpty: false, sourceStatus: 'not-verified', provenance: { reportPath, contextLookupPointer: `/files/${reportPath.replaceAll('~', '~0').replaceAll('/', '~1')}/contexts/${n}`, contextLookupPath: ['files', reportPath, 'contexts', String(n)], contextLookupPresent: data?.contexts.has(n) ?? false, reportSha256: actualReportDigest } };
      if (!data) { row.states = ['unavailable']; row.reason = 'file not present in report'; }
      else if (data.excluded.has(n)) { row.states = ['excluded']; row.reason = 'reported excluded; not attributed to test columns'; }
      else if (data.missing.has(n)) { row.states = ['missing']; row.reason = 'reported missing; no test selection inferred'; }
      else if (!data.executed.has(n)) { row.states = ['unavailable']; row.reason = 'line not classified by reported line sets'; }
      else {
        row.labels = [...data.contexts.get(n)];
        for (const label of row.labels) {
          selectedLabels.add(label);
          if (selectedLabels.size > 10) fail('At most 10 distinct context labels on selected executed lines');
          if (label === '') row.unattributedEmpty = true;
          else if (!contextMap.has(label)) row.unknownLabels.push(label);
          else {
            const mapped = contextMap.get(label), groupKey = JSON.stringify([mapped.testId, mapped.phase]);
            if (!groupMap.has(groupKey)) groupMap.set(groupKey, { id: `T${groupMap.size + 1}`, ...mapped, contexts: [] });
            const group = groupMap.get(groupKey);
            if (!group.contexts.includes(label)) group.contexts.push(label);
            if (!row.mapped.includes(group.id)) row.mapped.push(group.id);
          }
        }
        if (row.mapped.length) row.states.push('mapped');
        if (row.unattributedEmpty) row.states.push('unattributed');
        if (row.unknownLabels.length) row.states.push('unknown');
      }
      const filePointer = `/files/${reportPath.replaceAll('~', '~0').replaceAll('/', '~1')}`;
      if (!data) row.provenance.classificationEvidence = [{ lookupPointer: filePointer, present: false }];
      else {
        const membership = [['executed_lines', data.executed], ['missing_lines', data.missing], ['excluded_lines', data.excluded]];
        const matched = membership.find(([, numbers]) => numbers.has(n));
        row.provenance.classificationEvidence = matched
          ? [{ pointer: `${filePointer}/${matched[0]}/${[...matched[1]].indexOf(n)}`, value: n }]
          : membership.map(([field]) => ({ pointer: `${filePointer}/${field}`, containsSelectedLine: false }));
      }
      rows.push(row);
    }
  }
  if (!rows.length) fail('Explicitly select at least one source line');
  const groups = [...groupMap.values()];
  const projection = { adapter: 'test-context-map/1', kind: sidecar.kind, contracts, reportSha256: actualReportDigest, reportBinding: { sha256: actualReportDigest, runId: sidecar.reportBinding.runId, sourceRevision: sidecar.reportBinding.sourceRevision, exporterVersion: sidecar.reportBinding.exporterVersion }, selectionBinding: { reportSha256: actualReportDigest, runId: sidecar.selectionBinding.runId, sourceRevision: sidecar.selectionBinding.sourceRevision }, bindingStatus: 'matching sidecar claims; no source or run independently verified', sourceStatus: 'not-verified', testResults: 'not-consumed; no pass/fail inference', collectionFilters: filters, selectedLineCount: rows.length, selectedFileCount: selectedFiles.size, reportFileCount: files.size, contextGroups: groups, rows, coverage: 'Explicit selected rows only; no coverage percentage, test ranking, automatic selection or correctness conclusion. File keys are data and are never opened.' };
  const treeNodes = [{ id: 'selection', label: 'Selected source locations', sublabel: 'Structure only · source not verified' }];
  for (const [i, sourcePath] of [...selectedFiles].entries()) {
    const fileId = `F${i + 1}`; treeNodes.push({ id: fileId, parent: 'selection', label: fileId, sublabel: 'Sidecar file identity' });
    for (const row of rows.filter(r => r.sourcePath === sourcePath)) treeNodes.push({ id: row.id, parent: fileId, label: `Line ${row.line}`, sublabel: row.states.join(' + ') });
  }
  const tree = { schema_version: 1, diagram_type: 'tree', meta: { title: 'Selected source locations · not verified', subtitle: 'Contains relationships only; not test calls or module dependencies.', output: 'selection.html', quality_profile: 'standard' }, layout: { direction: 'down' }, nodes: treeNodes };
  const mappedCells = row => groups.map(g => ({ text: row.mapped.includes(g.id) ? 'observed' : row.states.some(s => ['missing', 'excluded', 'unavailable'].includes(s)) ? 'n/a' : '—' }));
  const panels = [
    { id: 'matrix', title: 'Which context observed each selected line?', blocks: [
      { id: 'observations', type: 'comparison', labelColumn: 'Selected location', columns: ['State', ...groups.map(g => `${g.id} / ${g.phase}`), 'Empty label', 'Unknown non-empty'], rows: rows.map(r => ({ id: `matrix-${r.id}`, label: `${r.fileId}:${r.line}`, cells: [{ text: r.states.join(' + ') }, ...mappedCells(r), { text: r.unattributedEmpty ? 'unattributed' : '—' }, { text: r.unknownLabels.length ? `${r.unknownLabels.length} unmapped` : '—' }] })) },
      { id: 'matrix-meaning', type: 'prose', text: 'Observed means an exact supplied context maps to that test and phase. A dash means not listed in this row, not proof of no execution in other runs. Missing, excluded and unavailable are not zero-percent coverage. No test results were consumed.' },
    ] },
    { id: 'identities', title: 'Read the file and exact context identities', blocks: [
      { id: 'file-key', type: 'comparison', labelColumn: 'File ID', columns: ['Selected source path', 'Source verification'], rows: [...selectedFiles].map((file, i) => ({ id: `file-key-${i}`, label: `F${i + 1}`, cells: [{ text: literalInline(file) }, { text: 'not verified; sidecar location only' }] })) },
      ...(groups.length ? [{ id: 'context-key', type: 'comparison', labelColumn: 'Matrix column', columns: ['Test ID', 'Phase', 'Exact context labels'], rows: groups.map(g => ({ id: `group-${g.id}`, label: g.id, cells: [{ text: literalInline(g.testId) }, { text: g.phase }, { text: literalInline(JSON.stringify(g.contexts)) }] })) }] : [{ id: 'no-mapped', type: 'prose', text: 'No mapped test/phase columns in this explicit selection. Empty and unknown contexts retain their separate states.' }]),
      { id: 'unknown-key', type: 'comparison', labelColumn: 'Location', columns: ['Unknown non-empty context labels'], rows: rows.filter(r => r.unknownLabels.length).map(r => ({ id: `unknown-${r.id}`, label: `${r.fileId}:${r.line}`, cells: [{ text: literalInline(JSON.stringify(r.unknownLabels)) }] })) },
    ] },
    { id: 'provenance', title: 'Binding, scope and what was not verified', blocks: [
      { id: 'binding-facts', type: 'comparison', labelColumn: 'Claim', columns: ['Supplied value'], rows: [
        { id: 'report-digest', label: 'Report SHA-256', cells: [{ text: actualReportDigest }] },
        { id: 'run-id', label: 'Run ID', cells: [{ text: literalInline(sidecar.reportBinding.runId) }] },
        { id: 'source-revision', label: 'Source revision', cells: [{ text: sidecar.reportBinding.sourceRevision }] },
        { id: 'exporter-version', label: 'Exporter version', cells: [{ text: literalInline(report.meta.version) }] },
        { id: 'filter-scope', label: 'Collection filters', cells: [{ text: literalInline(JSON.stringify(filters)) }] },
      ] },
      { id: 'provenance-boundary', type: 'list', items: ['Digest and selection bindings match the supplied report bytes. Revision and run ID remain sidecar claims, not verified source facts.', 'Exact contextMap entries define identity. No pipe splitting or substring matching is used; parameterized test IDs may themselves contain pipes.', 'Empty string context is unattributed; a non-empty unmapped label is unknown. Neither is a failing test.', 'Locations and report field pointers are preserved in projection.json. No source file, URL, SQLite database, test runner or coverage collector was opened.', 'Coverage observations do not establish test outcomes, assertion quality, sufficient regression selection or source correctness.'] },
      { id: 'contract-note', type: 'prose', text: 'The fixed coverage.py reporter emits the line context arrays.[](source:coverage-format) pytest-cov supplies test context naming; this experiment does not decode that name.[](source:pytest-context)' },
    ] },
  ];
  // An empty unknown-label lookup is absence of rows, not a schema-invalid empty comparison.
  if (!rows.some(r => r.unknownLabels.length)) panels[1].blocks = panels[1].blocks.filter(b => b.id !== 'unknown-key');
  const explainer = { schema_version: 1, diagram_type: 'explainer', meta: { id: 'test-context-map', title: sidecar.kind === 'synthetic' ? 'Synthetic test contexts × selected source lines' : 'Test contexts × selected source lines', locale: 'en' }, answer: { summary: sidecar.kind === 'synthetic' ? 'This synthetic input demonstrates context attribution and unavailable boundaries. No tests or source files were executed or verified.' : 'Read only the explicitly selected line observations; test outcomes and source correctness remain unknown.', reasons: ['Exact supplied context mappings preserve test ID and phase.', 'Empty and unknown context labels remain different.', 'Missing, excluded and unavailable never become zero coverage or failed tests.'], scope: `${rows.length} selected lines · ${groups.length} mapped test/phase columns · source not verified · no automatic test selection` }, panels, sources: [{ id: 'coverage-format', title: 'Fixed coverage.py format 3 reporter', url: `${contracts.coverage.repository}/blob/${contracts.coverage.commit}/${contracts.coverage.file}` }, { id: 'pytest-context', title: 'Fixed pytest-cov context naming', url: `${contracts.pytestCov.repository}/blob/${contracts.pytestCov.commit}/${contracts.pytestCov.file}` }] };
  return { projection, tree, explainer };
}
export function publish(reportBytes, sidecarBytes, output) {
  const report = loadJson(reportBytes, 'report', 500000), sidecar = loadJson(sidecarBytes, 'sidecar', 100000);
  const result = convert(report, sidecar, digest(reportBytes)); result.projection.sidecarSha256 = digest(sidecarBytes);
  fs.mkdirSync(output);
  for (const [name, value] of [['projection.json', result.projection], ['selection.tree.json', result.tree], ['matrix.explainer.json', result.explainer]]) fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  return result;
}
export function readInput(file, limit) {
  const fd = fs.openSync(file, 'r');
  try { if (!fs.fstatSync(fd).isFile()) fail('Input must be a regular file'); const bytes = Buffer.alloc(limit + 1); let length = 0; while (length < bytes.length) { const count = fs.readSync(fd, bytes, length, bytes.length - length, null); if (!count) break; length += count; } if (length > limit) fail('Input exceeds byte limit'); return bytes.subarray(0, length); }
  finally { fs.closeSync(fd); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { if (process.argv.length !== 5) fail('Usage: node adapter.mjs report.json selection-sidecar.json new-output-directory'); const [report, sidecar, output] = process.argv.slice(2); const r = publish(readInput(report, 500000), readInput(sidecar, 100000), output); console.log(JSON.stringify({ ok: true, selectedLines: r.projection.rows.length, mappedColumns: r.projection.contextGroups.length })); }
  catch (error) { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
}
