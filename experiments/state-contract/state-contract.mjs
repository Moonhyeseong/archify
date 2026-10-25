#!/usr/bin/env node
// Independent consumer of frozen robot3-viz R3Dag JSON. Never loads machine JS.
import { readFileSync, openSync, writeFileSync, closeSync, mkdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export class ContractError extends Error {
  constructor(code, message, path = '/') {
    super(message); this.code = code; this.path = path;
  }
}
const reject = (code, message, path) => { throw new ContractError(code, message, path); };
function object(value, keys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) reject('state/object', 'Expected a JSON object.', path);
  for (const key of Object.keys(value)) if (!keys.includes(key)) reject('state/unsupported-field', `Unsupported field ${JSON.stringify(key)}; refusing to drop semantics.`, `${path}/${key}`);
}
function text(value, path) {
  if (typeof value !== 'string' || !value.trim() || value.length > 80 || /[\u0000-\u001f\u007f]/u.test(value)) reject('state/text', 'Expected nonempty single-line text of at most 80 UTF-16 units.', path);
}
function numericId(value, path) {
  if (!Number.isSafeInteger(value) || value < 0) reject('state/id', 'R3Dag node IDs must be nonnegative safe integers.', path);
}

// A JSON literal in code is lossless and cannot become a link, directive or table boundary.
export function literalMarkdown(value) {
  const json = JSON.stringify(value).replace(/[<>&|`\[\]{}*_!]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `\`${json}\``;
}

export function buildContract(dag, sidecar) {
  object(dag, ['nodes', 'edges'], '');
  object(sidecar, ['initialState', 'expectedEvents', 'readingPath'], '/sidecar');
  if (!Array.isArray(dag.nodes) || dag.nodes.length < 2 || dag.nodes.length > 6) reject('state/node-count', 'This lifecycle experiment supports 2–6 flat states.', '/nodes');
  if (!Array.isArray(dag.edges) || dag.edges.length > 24) reject('state/edge-count', 'Expected an edges array with at most 24 entries.', '/edges');
  const nodes = new Map();
  dag.nodes.forEach((node, index) => {
    const path = `/nodes/${index}`;
    object(node, ['id', 'kind', 'label'], path);
    if (node.kind !== 'state') reject('state/unsupported-node', 'Only flat state nodes are accepted; guards, reducers, actions and invokes are not interpreted.', `${path}/kind`);
    numericId(node.id, `${path}/id`); text(node.label, `${path}/label`);
    if (nodes.has(node.id)) reject('state/duplicate-id', 'Duplicate state ID.', `${path}/id`);
    nodes.set(node.id, node);
  });
  dag.edges.forEach((edge, index) => {
    const path = `/edges/${index}`;
    object(edge, ['from', 'to', 'kind', 'label'], path);
    if (edge.kind !== 'event') reject('state/unsupported-edge', 'Only declared event edges are accepted; immediate and side-effect edges are unsupported.', `${path}/kind`);
    numericId(edge.from, `${path}/from`); numericId(edge.to, `${path}/to`); text(edge.label, `${path}/label`);
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) reject('state/unknown-endpoint', 'Each transition endpoint must name an existing state ID.', path);
  });
  numericId(sidecar.initialState, '/sidecar/initialState');
  if (!nodes.has(sidecar.initialState)) reject('state/unknown-initial', 'initialState must explicitly name a declared numeric node ID.', '/sidecar/initialState');
  if (!Array.isArray(sidecar.expectedEvents) || sidecar.expectedEvents.length < 1 || sidecar.expectedEvents.length > 6) reject('state/event-count', 'Provide 1–6 explicit expected event names.', '/sidecar/expectedEvents');
  const expected = new Set();
  sidecar.expectedEvents.forEach((event, index) => {
    text(event, `/sidecar/expectedEvents/${index}`);
    if (expected.has(event)) reject('state/duplicate-event', 'expectedEvents must not contain duplicates.', `/sidecar/expectedEvents/${index}`);
    expected.add(event);
  });
  let readingPath = [sidecar.initialState];
  if (sidecar.readingPath === undefined) {
    // Pick the first unvisited outgoing target, never invent a connecting edge.
    for (let current = sidecar.initialState;;) {
      const edge = dag.edges.find(candidate => candidate.from === current && !readingPath.includes(candidate.to));
      if (!edge) break;
      readingPath.push(edge.to); current = edge.to;
    }
  } else {
    if (!Array.isArray(sidecar.readingPath)) reject('state/reading-path', 'readingPath must be an array of numeric IDs.', '/sidecar/readingPath');
    readingPath = sidecar.readingPath.slice();
  }
  if (readingPath.length < 2 || readingPath[0] !== sidecar.initialState || new Set(readingPath).size !== readingPath.length) reject('state/reading-path', 'Native lifecycle needs a reading path of at least two distinct states, starting at explicit initialState.', '/sidecar/readingPath');
  readingPath.forEach((id, index) => {
    if (!nodes.has(id)) reject('state/reading-path', 'Unknown reading-path state ID.', `/sidecar/readingPath/${index}`);
    if (index && !dag.edges.some(edge => edge.from === readingPath[index - 1] && edge.to === id)) reject('state/reading-gap', 'Reading path contains an undeclared transition; no decorative edge will be added.', `/sidecar/readingPath/${index}`);
  });
  // Native lifecycle places branches by structural distance, so reject disconnected islands explicitly.
  const connected = new Set([sidecar.initialState]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of dag.edges) if (connected.has(edge.from) || connected.has(edge.to)) {
      for (const id of [edge.from, edge.to]) if (!connected.has(id)) { connected.add(id); changed = true; }
    }
  }
  if (connected.size !== nodes.size) reject('state/disconnected-layout', 'Disconnected state islands cannot be placed by this bounded lifecycle experiment.', '/nodes');
  const stateId = id => `state-${id}`;
  const rows = dag.nodes.map(node => ({
    stateId: node.id, stateLabel: node.label,
    cells: sidecar.expectedEvents.map(event => {
      const matches = dag.edges.flatMap((edge, index) => edge.from === node.id && edge.label === event ? [{ edgeIndex: index, to: edge.to }] : []);
      return { event, status: matches.length ? 'declared' : 'undeclared', transitions: matches };
    }),
  }));
  const eventsOutsideExpected = [...new Set(dag.edges.map(edge => edge.label))].filter(event => !expected.has(event));
  const lifecycle = {
    schema_version: 3, diagram_type: 'lifecycle',
    meta: { title: 'Declared state transitions', output: 'state-contract.lifecycle.html', subtitle: 'Static export only · reading order is not a success path', locale: 'en', animation: 'none', visual_preset: 'blueprint' },
    mainPath: readingPath.map(stateId),
    states: dag.nodes.map(node => ({ id: stateId(node.id), type: node.id === sidecar.initialState ? 'start' : 'neutral', label: node.label })),
    transitions: dag.edges.map((edge, index) => ({ id: `event-${index + 1}`, from: stateId(edge.from), to: stateId(edge.to), label: edge.label })),
    cards: [{ dot: 'amber', title: 'Static declarations only', items: [
      `Initial state comes from the supplied sidecar: numeric ID ${sidecar.initialState}.`,
      'Reading order uses declared edges. It does not mean business success or runtime reachability.',
      'No machine, guard, reducer, invocation or side effect was executed.',
    ] }],
  };
  const missing = rows.reduce((count, row) => count + row.cells.filter(cell => cell.status === 'undeclared').length, 0);
  const matrix = { initialState: sidecar.initialState, expectedEvents: sidecar.expectedEvents.slice(), rows, eventsOutsideExpected, totals: { declared: rows.length * expected.size - missing, undeclared: missing }, scope: 'Declared/undeclared refer only to the supplied flat export; neither denotes runtime acceptance, failure or success.' };
  const lines = [
    '# Which state-event pairs are declared? {#state-contract}', '',
    `${missing} of ${rows.length * expected.size} expected state-event pairs have no declaration in the supplied export.`, '',

    '@answer scope="Frozen flat export · no machine execution"', '@meta locale=en', '',
    '## What does the export declare? {#state-graph}', '',
    '@diagram lifecycle source=state-contract.lifecycle.json', '',
    `Initial state from the sidecar: ID ${literalMarkdown(sidecar.initialState)}, label ${literalMarkdown(nodes.get(sidecar.initialState).label)}.`, '',
    'The diagram preserves every supplied event edge, including cycles. Its reading order does not identify a business success path.', '',
    '## Which expected events are missing here? {#event-matrix}', '',
    `| State ID and label | ${sidecar.expectedEvents.map(literalMarkdown).join(' | ')} |`,
    `| --- | ${sidecar.expectedEvents.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${literalMarkdown(row.stateId)} ${literalMarkdown(row.stateLabel)} | ${row.cells.map(cell => cell.status).join(' | ')} |`), '',
    'Declared means at least one supplied transition has that source state and exact event name. Undeclared means no such transition was supplied.', '',
    '## Where do declared events point? {#transition-list}', '',
    '| Edge index | From ID | Event | To ID |', '| --- | --- | --- | --- |',
    ...dag.edges.map((edge, index) => `| ${index} | ${literalMarkdown(edge.from)} | ${literalMarkdown(edge.label)} | ${literalMarkdown(edge.to)} |`), '',
    '## What remains unknown? {#scope}', '',
    'Runtime reachability, handler behavior, guard outcomes and business success are not established by this static export.', '',
    `Events outside the supplied expected list: ${eventsOutsideExpected.length ? eventsOutsideExpected.map(literalMarkdown).join(', ') : 'none'}.`, '',
    'Labels and event names are displayed as JSON literals. Escaped Unicode notation preserves literal punctuation without making links.', '',
  ];
  return { lifecycle, matrix, explainer: lines.join('\n') };
}

export function writeFreshResults(outputDir, result) {
  // Creating a fresh directory is the output ownership boundary. Existing symlinks fail here.
  mkdirSync(outputDir);
  const ownedFiles = [];
  try {
    for (const [name, content] of [
      ['state-contract.lifecycle.json', `${JSON.stringify(result.lifecycle, null, 2)}\n`],
      ['state-contract.matrix.json', `${JSON.stringify(result.matrix, null, 2)}\n`],
      ['state-contract.archify.md', result.explainer],
    ]) {
      const path = join(outputDir, name);
      const fd = openSync(path, 'wx'); ownedFiles.push(path);
      try { writeFileSync(fd, content); } finally { closeSync(fd); }
    }
  } catch (error) {
    for (const path of ownedFiles.reverse()) unlinkSync(path);
    try { rmdirSync(outputDir); } catch { /* Leave any concurrently added, unowned files intact. */ }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [dagPath, sidecarPath, outputDir, ...extra] = process.argv.slice(2);
  if (!dagPath || !sidecarPath || !outputDir || extra.length) {
    console.error('Usage: node experiments/state-contract/state-contract.mjs <frozen-dag.json> <sidecar.json> <fresh-output-dir>'); process.exitCode = 2;
  } else {
    try {
      const result = buildContract(JSON.parse(readFileSync(dagPath, 'utf8')), JSON.parse(readFileSync(sidecarPath, 'utf8')));
      writeFreshResults(outputDir, result);
      console.log(JSON.stringify({ ok: true, outputDir, states: result.lifecycle.states.length, transitions: result.lifecycle.transitions.length, matrix: result.matrix.totals }));
    } catch (error) {
      console.error(JSON.stringify({ ok: false, diagnostics: [{ code: error.code === 'EEXIST' ? 'state/output-exists' : (error.code ?? 'state/input'), severity: 'error', message: error.message, subject: { path: error.path ?? '/' }, evidence: {}, supportedFixes: ['Provide only frozen flat state/event JSON, explicit initialState/expectedEvents, and a fresh output directory.'] }] }));
      process.exitCode = 1;
    }
  }
}
