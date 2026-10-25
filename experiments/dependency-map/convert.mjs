#!/usr/bin/env node
// Offline experiment: report conversion only; never loads analyzed repository code.
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const hash = text => createHash('sha256').update(text).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function need(condition, message) { if (!condition) throw new Error(message); }
function text(value, field) {
  need(typeof value === 'string' && value.length > 0 && value.length <= 1024 && !/[\x00-\x1f\x7f]/u.test(value), `Invalid ${field}`);
  return value;
}
function integer(value, min, max, name) {
  need(Number.isInteger(value) && value >= min && value <= max, `${name} must be an integer from ${min} to ${max}`);
}
function category(value) {
  if (value.couldNotResolve) return 'unresolved';
  if (value.coreModule || value.dependencyTypes?.some(t => t === 'core' || t.startsWith('npm'))) return 'external';
  if (value.matchesDoNotFollow || value.followable === false) return 'not-followed';
  return 'internal';
}

/** The returned receipt retains every original dependency, including excluded ones. */
export function convert(report, options = {}) {
  need(object(report) && Array.isArray(report.modules) && report.modules.length > 0 && object(report.summary), 'Expected nonempty dependency-cruiser modules and summary');
  need(report.modules.length <= 50000, 'Report exceeds experiment limit of 50000 module records');
  const depth = options.depth ?? 1;
  const maxNodes = options.maxNodes ?? 8;
  integer(depth, 0, 6, 'depth');
  integer(maxNodes, 1, 12, 'maxNodes');
  if (options.title !== undefined) text(options.title, 'title');
  const modules = new Map();
  const edges = [];
  for (const module of report.modules) {
    need(object(module) && Array.isArray(module.dependencies), 'Invalid module record');
    const source = text(module.source, 'module source');
    need(!modules.has(source), `Duplicate module source: ${source}`);
    for (const key of ['coreModule', 'followable', 'couldNotResolve', 'matchesDoNotFollow']) {
      if (key in module) need(typeof module[key] === 'boolean', `Invalid module ${key}`);
    }
    if ('dependencyTypes' in module) need(Array.isArray(module.dependencyTypes) && module.dependencyTypes.every(t => typeof t === 'string'), 'Invalid module dependencyTypes');
    modules.set(source, module);
    for (const dep of module.dependencies) {
      need(object(dep), 'Invalid dependency record');
      text(dep.module, 'dependency module');
      text(dep.resolved, 'dependency resolved target');
      need(Array.isArray(dep.dependencyTypes) && dep.dependencyTypes.every(t => typeof t === 'string'), 'Invalid dependencyTypes');
      for (const key of ['coreModule', 'followable', 'couldNotResolve']) need(typeof dep[key] === 'boolean', `Missing or invalid ${key}`);
      for (const key of ['circular', 'dynamic', 'typeOnly', 'matchesDoNotFollow', 'preCompilationOnly', 'valid']) {
        if (key in dep) need(typeof dep[key] === 'boolean', `Invalid ${key}`);
      }
      edges.push({ index: edges.length, from: source, to: dep.resolved, category: category(dep), raw: dep });
    }
  }
  need(edges.length <= 200000, 'Report exceeds experiment limit of 200000 dependencies');
  if (options.entry !== undefined) need(modules.has(options.entry), 'entry must exactly match a module source in the report');
  const entry = options.entry ?? null;
  const allNames = [...new Set([...modules.keys(), ...edges.map(e => e.to)])].sort();
  const outgoing = new Map();
  const incoming = new Map();
  for (const edge of edges) {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    outgoing.get(edge.from).push(edge);
    incoming.get(edge.to).push(edge);
  }
  // BFS is over reported edge direction, regardless of type-only / unresolved status.
  // Without an entry all nodes are candidates, sorted lexically.
  const distances = new Map();
  if (entry) {
    distances.set(entry, 0);
    let frontier = [entry];
    for (let d = 0; d < depth; d++) {
      const next = [...new Set(frontier.flatMap(name => (outgoing.get(name) ?? []).map(e => e.to)))].sort();
      frontier = next.filter(name => !distances.has(name));
      for (const name of frontier) distances.set(name, d + 1);
    }
  } else for (const name of allNames) distances.set(name, 0);
  const candidates = [...distances.keys()].sort((a, b) => distances.get(a) - distances.get(b) || (a < b ? -1 : a > b ? 1 : 0));
  const selected = new Set(candidates.slice(0, maxNodes));
  const nodes = allNames.map(name => {
    const id = `m-${hash(name).slice(0, 20)}`;
    const record = modules.get(name);
    const inbound = incoming.get(name) ?? [];
    const kind = inbound.some(e => e.category === 'unresolved') ? 'unresolved'
      : (record && category(record) !== 'internal' ? category(record)
        : inbound.some(e => e.category === 'external') ? 'external'
          : record ? 'internal' : 'missing-record');
    return { source: name, id, category: kind, selected: selected.has(name), disposition: selected.has(name) ? 'shown' : distances.has(name) ? 'max-nodes' : 'outside-entry-depth', moduleRecordPresent: Boolean(record) };
  });
  const byName = new Map(nodes.map(n => [n.source, n]));
  const connections = [];
  for (const edge of edges) {
    edge.id = `e-${edge.index}`;
    if (!selected.has(edge.from) || !selected.has(edge.to)) edge.disposition = 'outside-selected-view';
    else if (edge.from === edge.to) edge.disposition = 'self-dependency-listed';
    else {
      edge.disposition = 'drawn';
      const labels = ['imports'];
      if (edge.raw.typeOnly) labels.push('type only');
      if (edge.raw.dynamic) labels.push('dynamic');
      if (edge.category === 'unresolved') labels.push('unresolved');
      if (edge.raw.circular) labels.push('cycle');
      // Repeated imports between one pair remain separate records in receipt.
      const samePair = connections.find(c => c.from === byName.get(edge.from).id && c.to === byName.get(edge.to).id);
      if (samePair) { edge.disposition = 'parallel-record-listed'; edge.connectionId = samePair.id; }
      else {
        edge.connectionId = edge.id;
        connections.push({ id: edge.id, from: byName.get(edge.from).id, to: byName.get(edge.to).id, label: labels.join(' · '), variant: edge.raw.typeOnly || edge.category === 'unresolved' ? 'dashed' : 'default' });
      }
    }
  }
  const shown = nodes.filter(n => n.selected);
  const basename = name => name.split('/').at(-1);
  const counts = {
    moduleRecords: modules.size, allTargetsAndModules: nodes.length, shownNodes: shown.length,
    omittedNodes: nodes.length - shown.length, dependencyRecords: edges.length,
    drawnConnections: connections.length, unresolvedRecords: edges.filter(e => e.category === 'unresolved').length,
    externalRecords: edges.filter(e => e.category === 'external').length,
    notFollowedRecords: edges.filter(e => e.raw.followable === false || e.raw.matchesDoNotFollow).length,
    selfDependencyRecords: edges.filter(e => e.from === e.to).length,
    reportedCircularRecords: edges.filter(e => e.raw.circular).length,
    omittedRecords: edges.filter(e => e.disposition === 'outside-selected-view').length,
    parallelRecords: edges.filter(e => e.disposition === 'parallel-record-listed').length
  };
  const special = edges.filter(e => e.disposition === 'self-dependency-listed' || e.disposition === 'parallel-record-listed');
  const spec = {
    schema_version: 1, diagram_type: 'architecture',
    meta: { title: options.title ?? 'Static import map', subtitle: `${entry ? basename(entry) : 'Report overview'} · ${shown.length}/${nodes.length} nodes · ${counts.omittedRecords} edge records outside view`, output: 'map.html', locale: 'en', quality_profile: 'showcase', legend: { mode: 'hidden' } },
    layout: { mode: 'grid', cols: Math.min(3, shown.length), cellW: 240, cellH: 96, gapX: 110, gapY: 100 },
    components: shown.map((n, index) => ({ id: n.id, type: n.category === 'internal' ? 'backend' : 'external', icon: 'none', label: basename(n.source), sublabel: n.category, tag: `node ${nodes.indexOf(n) + 1}`, size: [240, 96], row: Math.floor(index / 3), col: index % 3 })),
    connections,
    cards: [
      { dot: 'cyan', title: 'Read the arrows', items: ['Importer → imported module; static report, not runtime calls or business architecture.', 'Type-only and unresolved edges stay labelled. Full paths and all flags: mapping.receipt.json.'] },
      { dot: 'rose', title: 'Coverage stays visible', items: [`${counts.omittedNodes} nodes / ${counts.omittedRecords} edge records outside this selected view.`, `${counts.unresolvedRecords} unresolved; ${counts.externalRecords} external; ${counts.notFollowedRecords} not followed (whole input).`, `Selection: ${entry ? `entry ${basename(entry)}, depth ${depth}` : 'lexical report overview'}; max ${maxNodes} nodes. Coverage of the original scan is unknown.`] },
      ...(special.length ? [{ dot: 'amber', title: 'Listed instead of duplicate/self arrows', items: special.map(e => `${e.id}: ${basename(e.from)} → ${basename(e.to)} (${e.disposition}); full record in receipt.`) }] : [])
    ]
  };
  return { spec, receipt: { format: 'archify-experiment/dependency-map@1', semantics: 'Reported static imports only; absence is not proof of no dependency.', inputCoverage: 'Only the supplied report is known. Scan completeness and producer version are not inferred.', selection: { entry, depth, maxNodes, traversal: 'outgoing reported dependencies, then depth/lexical order' }, counts, nodes, edges, originalReport: report } };
}

async function main(args) {
  const options = {};
  const accepted = new Set(['input', 'out', 'entry', 'depth', 'max-nodes', 'title']);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/u, '');
    need(args[i]?.startsWith('--') && accepted.has(key) && args[i + 1] !== undefined && !args[i + 1].startsWith('--') && !Object.hasOwn(options, key), 'Usage: node convert.mjs --input report.json --out new-directory [--entry exact-path --depth 1 --max-nodes 8 --title text]');
    options[key] = args[i + 1];
  }
  need(options.input && options.out, '--input and --out are required');
  const input = await readFile(options.input);
  need(input.length <= 32 * 1024 * 1024, 'Report exceeds 32 MiB input limit');
  const { spec, receipt } = convert(JSON.parse(input), { entry: options.entry, depth: options.depth === undefined ? undefined : Number(options.depth), maxNodes: options['max-nodes'] === undefined ? undefined : Number(options['max-nodes']), title: options.title });
  receipt.inputSha256 = hash(input);
  receipt.producerIdentity = 'not supplied; no tool version or analyzed commit inferred';
  // An existing directory is refused before any output, including symlinks.
  const out = resolve(options.out);
  try { await lstat(out); throw new Error('--out must be a new directory; existing output is preserved'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(out);
  await writeFile(resolve(out, 'map.architecture.json'), JSON.stringify(spec, null, 2) + '\n', { flag: 'wx' });
  await writeFile(resolve(out, 'mapping.receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ output: out, inputSha256: receipt.inputSha256, counts: receipt.counts }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(`dependency-map: ${error.message}`); process.exitCode = 1; });
}
