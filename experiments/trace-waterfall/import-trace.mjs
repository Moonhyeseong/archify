import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const LIMITS = Object.freeze({ bytes: 2 * 1024 * 1024, events: 1000, spans: 60 });
const fail = message => { throw new Error(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identity = value => (typeof value === 'string' && value.length > 0) || (Number.isSafeInteger(value) && value >= 0);

// A trace file does not establish its own measurement provenance. The caller
// must explicitly choose measured (recorded run) or illustrative (authored input).
export function convertTrace(input, { evidence, title = 'Recorded Node workload' } = {}) {
  if (!['measured', 'illustrative'].includes(evidence)) fail('Choose evidence: measured or illustrative.');
  const events = Array.isArray(input) ? input : object(input) ? input.traceEvents : undefined;
  if (!Array.isArray(events)) fail('Expected an event array or {traceEvents: []}.');
  if (events.length > LIMITS.events) fail(`Event limit ${LIMITS.events} exceeded; no events were truncated.`);
  const unsupported = new Map();
  const complete = [];
  const names = new Map();
  for (const [index, event] of events.entries()) {
    if (!object(event) || typeof event.ph !== 'string' || !event.ph) fail(`Event ${index}: missing phase.`);
    if (event.ph === 'M' && event.name === 'thread_name' && identity(event.pid) && identity(event.tid) && typeof event.args?.name === 'string') {
      names.set(JSON.stringify([event.pid, event.tid]), event.args.name);
    }
    if (event.ph !== 'X') {
      unsupported.set(event.ph, (unsupported.get(event.ph) || 0) + 1);
      continue;
    }
    if (typeof event.name !== 'string' || !event.name.trim()) fail(`Event ${index}: missing name.`);
    if (!identity(event.pid) || !identity(event.tid)) fail(`Event ${index}: pid/tid must be nonempty strings or nonnegative safe integers.`);
    if (![event.ts, event.dur].every(n => Number.isFinite(n) && n >= 0) || !Number.isFinite(event.ts + event.dur)) fail(`Event ${index}: invalid ts/dur (microseconds).`);
    // Bound precision rather than letting huge numbers silently lose intervals.
    if (event.ts > Number.MAX_SAFE_INTEGER || event.dur > Number.MAX_SAFE_INTEGER || event.ts + event.dur > Number.MAX_SAFE_INTEGER) fail(`Event ${index}: timing exceeds safe numeric range.`);
    complete.push({ event, index });
  }
  if (complete.length === 0) fail(`No complete X events; unsupported phases: ${JSON.stringify(Object.fromEntries(unsupported))}.`);
  if (complete.length > LIMITS.spans) fail(`Span limit ${LIMITS.spans} exceeded; select a smaller trace explicitly.`);
  // Producers may flush completed operations in completion order. Reading in
  // start order makes concurrency visible without inventing a call hierarchy.
  complete.sort((a, b) => a.event.ts - b.event.ts || a.index - b.index);
  const origin = Math.min(...complete.map(({ event }) => event.ts));
  const spans = complete.map(({ event, index }, i) => {
    const key = JSON.stringify([event.pid, event.tid]);
    const label = names.get(key);
    return {
      id: `span_${i + 1}`, name: event.name, start: event.ts - origin, duration: event.dur,
      service: `pid ${event.pid} / tid ${event.tid}${label ? ` · ${label}` : ''}`,
      detail: `Chrome Trace event ${index}; recorded ts=${event.ts} us, dur=${event.dur} us. Group denotes process/thread, not a discovered business service. No parent inferred.`,
    };
  });
  const report = {
    format: 'chrome-trace-X-subset', inputEvents: events.length, convertedSpans: spans.length,
    originUs: origin, unit: 'us', evidence,
    unsupportedPhases: Object.fromEntries([...unsupported].sort(([a], [b]) => a.localeCompare(b))),
    metadataPolicy: 'M may label a thread; all non-X phases remain counted as unsupported for timing conversion.',
    parentPolicy: 'All spans are roots; temporal containment and overlap do not establish causality.',
    limits: LIMITS,
  };
  return {
    diagram: { schema_version: 1, diagram_type: 'waterfall', meta: {
      title, evidence, unit: 'us', output: 'workload.html',
      subtitle: `${spans.length} ${evidence === 'measured' ? 'recorded' : 'illustrative'} intervals · elapsed wall time, including waits · all spans are roots; no call hierarchy inferred`,
    }, spans },
    report,
  };
}

export function readTrace(file) {
  const fd = fs.openSync(file, 'r');
  try {
    if (!fs.fstatSync(fd).isFile()) fail('Input must be a regular file.');
    if (fs.fstatSync(fd).size > LIMITS.bytes) fail(`File limit ${LIMITS.bytes} bytes exceeded.`);
    // Bounded read also covers growth after the stat check.
    const buffer = Buffer.alloc(LIMITS.bytes + 1);
    let length = 0;
    while (length < buffer.length) {
      const n = fs.readSync(fd, buffer, length, buffer.length - length, null);
      if (n === 0) break;
      length += n;
    }
    if (length > LIMITS.bytes) fail(`File limit ${LIMITS.bytes} bytes exceeded.`);
    const bytes = buffer.subarray(0, length);
    return { input: JSON.parse(bytes.toString('utf8')), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: length };
  } finally { fs.closeSync(fd); }
}

export function writeFreshOutputs(entries) {
  const owned = [];
  try {
    for (const [file, value] of entries) {
      // Exclusive creation refuses regular files, input aliases and even
      // dangling symlinks. Writing via the fd cannot follow a swapped path.
      const fd = fs.openSync(file, 'wx');
      try {
        const stat = fs.fstatSync(fd);
        owned.push({ file, dev: stat.dev, ino: stat.ino });
        fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n');
      } finally { fs.closeSync(fd); }
    }
  } catch (error) {
    for (const entry of owned.reverse()) {
      try {
        const stat = fs.lstatSync(entry.file);
        if (stat.isFile() && stat.dev === entry.dev && stat.ino === entry.ino) fs.unlinkSync(entry.file);
      } catch { /* Preserve the original error; never remove a replacement. */ }
    }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [source, output, evidence, ...extra] = process.argv.slice(2);
    if (!source || !output || !evidence || extra.length) fail('Usage: node import-trace.mjs <trace.json> <waterfall.json> <measured|illustrative>');
    const raw = readTrace(source);
    const { diagram, report } = convertTrace(raw.input, { evidence });
    const reportPath = `${output}.import-report.json`;
    if (fs.existsSync(output) || fs.existsSync(reportPath)) fail('Output already exists; choose fresh output paths.');
    writeFreshOutputs([
      [reportPath, { ...report, sourceSha256: raw.sha256, sourceBytes: raw.bytes }],
      [output, diagram],
    ]);
    process.stdout.write(JSON.stringify({ output, report: reportPath, ...report }) + '\n');
  } catch (error) { process.stderr.write(`trace-import: ${error.message}\n`); process.exitCode = 1; }
}
