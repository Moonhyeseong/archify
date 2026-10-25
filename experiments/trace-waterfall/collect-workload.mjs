// Original, bounded workload. No external target is executed or instrumented.
import { performance } from 'node:perf_hooks';
import { threadId } from 'node:worker_threads';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const output = process.argv[2];
if (!output || process.argv.length !== 3) throw new Error('Usage: node collect-workload.mjs <new-trace.json>');
const events = [{ ph: 'M', name: 'thread_name', pid: process.pid, tid: threadId, args: { name: 'Node main event loop' } }];
const measured = async (name, run) => {
  const start = performance.now() * 1000;
  try { return await run(); }
  finally {
    const end = performance.now() * 1000;
    events.push({ ph: 'X', cat: 'archify-original-workload', pid: process.pid, tid: threadId, name, ts: start, dur: end - start });
  }
};
const startedAt = new Date().toISOString();
const directory = await mkdtemp(path.join(os.tmpdir(), 'archify-trace-workload-'));
try {
  await measured('Entire workload', async () => {
    const data = await measured('Build 5000 public sample rows', async () => JSON.stringify(Array.from({ length: 5000 }, (_, i) => ({ id: i, label: `sample-${i}` }))));
    await measured('Concurrent branches (inclusive)', async () => {
      await Promise.all([
        measured('Branch A: file roundtrip and timer', async () => {
          await measured('Write temporary JSON', () => writeFile(path.join(directory, 'sample.json'), data));
          await measured('Read temporary JSON', () => readFile(path.join(directory, 'sample.json')));
          await measured('Timer A (requested 35 ms)', () => delay(35));
        }),
        measured('Branch B: digest and timer', async () => {
          await measured('SHA-256 x 200', async () => {
            for (let i = 0; i < 200; i++) createHash('sha256').update(data).digest('hex');
          });
          await measured('Timer B (requested 65 ms)', () => delay(65));
        }),
      ]);
    });
  });
} finally { await rm(directory, { recursive: true, force: true }); }
const payload = {
  collector: { name: 'archify-original-node-workload', node: process.version, startedAt,
    clock: 'performance.now() * 1000; process-relative microseconds; not Unix epoch',
    scope: 'Elapsed intervals only around explicitly wrapped operations in this original program. Timers measure actual elapsed waits, not requested delays. Not a V8, CPU, OS-thread, or automatic call trace.',
    evidence: 'measured', operationCount: events.filter(e => e.ph === 'X').length,
  }, traceEvents: events,
};
await writeFile(output, JSON.stringify(payload, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output, ...payload.collector }));
