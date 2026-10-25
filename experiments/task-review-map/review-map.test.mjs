import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { mapReview, toExplainer, build } from './review-map.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-map-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const run = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  run('init', '-q'); run('config', 'user.name', 'Fixture'); run('config', 'user.email', 'fixture@example.invalid');
  const write = (file, content) => fs.writeFileSync(path.join(dir, file), content);
  write('change.txt', 'old\nstable\n'); write('deleted.txt', 'removed\n');
  write('literal[1].txt', 'before\n'); write('.gitattributes', '*.txt diff=experiment\n');
  run('add', '.'); run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'base'); const base = run('rev-parse', 'HEAD');
  write('change.txt', 'new\nstable\n'); write('added.txt', 'added\n');
  write('literal[1].txt', 'after\n'); fs.rmSync(path.join(dir, 'deleted.txt'));
  run('add', '.'); run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'head'); const head = run('rev-parse', 'HEAD');
  const ref = (id, file, side, start = 1, end = 1) => ({ id, label: id, why: 'Agent statement, not execution evidence.', ref: { path: file, side, start, end } });
  const review = { version: 1, title: 'Fixture', repository: 'https://github.com/example/fixture', author: 'Test author', base, head,
    nodes: [ref('before', 'change.txt', 'base'), ref('after', 'change.txt', 'head'), ref('added', 'added.txt', 'head'), ref('removed', 'deleted.txt', 'base'), ref('literal-before', 'literal[1].txt', 'base'), ref('literal-after', 'literal[1].txt', 'head')], edges: [] };
  return { dir, run, write, review };
}

test('real Git changes map both sides, additions, deletion and literal bracket path', t => {
  const { dir, review } = fixture(t); const report = mapReview(dir, review);
  assert.equal(report.mappingComplete, true); assert.equal(report.summary.hunks, 4);
  assert.equal(report.summary.referenceMatches, 6); assert.equal(report.testExecution, 'not-run');
  assert.ok(report.hunks.every(h => h.coverage === 'range-accounted'));
  assert.equal(report.nodes.find(n => n.id === 'removed').excerpt, 'removed');
  assert.equal(report.nodes.find(n => n.id === 'literal-after').excerpt, 'after');
});

test('head-only explanation leaves removed lines partial; absent node leaves hunk unexplained', t => {
  const { dir, review } = fixture(t); review.nodes = review.nodes.filter(n => !['before', 'added'].includes(n.id));
  const report = mapReview(dir, review);
  assert.equal(report.mappingComplete, false); assert.equal(report.summary.unexplainedHunks, 2);
  const changed = report.hunks.find(h => h.path === 'change.txt');
  assert.equal(changed.coverage, 'partial'); assert.deepEqual(changed.unexplainedLines.base, [1]);
  assert.equal(report.hunks.find(h => h.path === 'added.txt').coverage, 'unexplained');
  const page = toExplainer(review, report);
  assert.ok(page.panels.find(p => p.id === 'unexplained').blocks.some(b => b.type === 'diff' && b.caption.includes('added.txt')));
});

test('unchanged lines and out-of-bounds refs never gain matches or coverage', t => {
  const { dir, review } = fixture(t); review.nodes[1].ref.start = 2; review.nodes[1].ref.end = 2;
  review.nodes[2].ref.end = 99;
  const report = mapReview(dir, review); assert.equal(report.summary.invalidReferences, 2);
  assert.equal(report.nodes[1].status, 'mismatch'); assert.equal(report.nodes[2].status, 'mismatch');
  assert.equal(report.hunks.find(h => h.path === 'added.txt').coverage, 'unexplained');
});

test('missing and wrong-side references remain visible as failures', t => {
  const { dir, review } = fixture(t); review.nodes[0].ref.path = 'not-changed.txt'; review.nodes[2].ref.side = 'base';
  const report = mapReview(dir, review); assert.equal(report.summary.invalidReferences, 2);
  assert.equal(report.nodes[0].status, 'mismatch'); assert.equal(report.nodes[2].status, 'unavailable');
});

test('traversal, absolute, control, metadata and pathspec injection fail before output writes', t => {
  const { dir, review } = fixture(t);
  for (const bad of ['../outside', '/etc/passwd', 'C:/secret', 'a\\b', '.git/config', 'a/../b', 'a\nb', ':(glob)**']) {
    const value = structuredClone(review); value.nodes[0].ref.path = bad;
    const input = path.join(dir, 'review.json'), output = path.join(dir, 'output'); fs.writeFileSync(input, JSON.stringify(value));
    // A literal Git pathspec-looking filename is safe but absent; it must never expand.
    if (bad === ':(glob)**') { assert.equal(build(dir, input, output).nodes[0].status, 'mismatch'); fs.rmSync(output, { recursive: true }); }
    else { assert.throws(() => build(dir, input, output), /Unsafe/); assert.equal(fs.existsSync(output), false); }
  }
});

test('fixed commits required; duplicate IDs and invalid edges rejected', t => {
  const { dir, review } = fixture(t);
  const short = structuredClone(review); short.base = 'HEAD~1'; assert.throws(() => mapReview(dir, short), /full lowercase/);
  const duplicate = structuredClone(review); duplicate.nodes[1].id = duplicate.nodes[0].id; assert.throws(() => mapReview(dir, duplicate), /duplicate/);
  const edge = structuredClone(review); edge.edges = [{ from: 'after', to: 'absent', label: 'claim' }]; assert.throws(() => mapReview(dir, edge), /endpoint/);
});

test('external diff, textconv, fsmonitor, replacement refs and inherited Git selectors do not change reads', t => {
  const { dir, review, run, write } = fixture(t);
  const marker = path.join(dir, 'EXECUTED'); write('driver.sh', '#!/bin/sh\ntouch "' + marker + '"\n'); fs.chmodSync(path.join(dir, 'driver.sh'), 0o755);
  run('config', 'diff.experiment.command', path.join(dir, 'driver.sh'));
  run('config', 'diff.experiment.textconv', path.join(dir, 'driver.sh'));
  run('config', 'core.fsmonitor', path.join(dir, 'driver.sh')); run('replace', review.base, review.head);
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { GIT_DIR: '/does-not-exist', GIT_WORK_TREE: '/does-not-exist', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.fsmonitor', GIT_CONFIG_VALUE_0: path.join(dir, 'driver.sh') });
    const report = mapReview(dir, review); assert.equal(report.mappingComplete, true); assert.equal(report.nodes[0].excerpt, 'old');
  } finally { for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key]; Object.assign(process.env, saved); }
  assert.equal(fs.existsSync(marker), false);
});

test('symlink and binary changes remain unresolved, never read filesystem targets', t => {
  const { dir, review, run, write } = fixture(t);
  fs.symlinkSync('/etc/passwd', path.join(dir, 'link')); write('binary.dat', Buffer.from([0, 1, 2]));
  run('add', 'link', 'binary.dat'); run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'unsupported');
  review.head = run('rev-parse', 'HEAD');
  review.nodes.push({ id: 'link-node', label: 'link', why: 'Agent statement.', ref: { path: 'link', side: 'head', start: 1, end: 1 } });
  const report = mapReview(dir, review); assert.equal(report.mappingComplete, false);
  assert.equal(report.summary.unresolvedFiles, 2); assert.equal(report.nodes.at(-1).status, 'unavailable');
  assert.equal(JSON.stringify(report).includes('root:'), false);
});

test('CLI nonzero receipt for incomplete mapping and no publication on malformed input', t => {
  const { dir, review } = fixture(t); review.nodes.pop();
  const input = path.join(dir, 'review.json'), output = path.join(dir, 'output'); fs.writeFileSync(input, JSON.stringify(review));
  const cli = new URL('./review-map.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [cli, dir, input, output], { encoding: 'utf8' });
  assert.equal(result.status, 1); assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'mapping.json'))).mappingComplete, false);
  fs.writeFileSync(input, '{'); const badOutput = path.join(dir, 'bad-output');
  assert.equal(spawnSync(process.execPath, [cli, dir, input, badOutput]).status, 2); assert.equal(fs.existsSync(badOutput), false);
});

test('agent prose is literal and code is passed to native escaped snippet/diff blocks', t => {
  const { dir, review } = fixture(t); review.nodes[0].why = '<script>alert(1)</script> [fake](javascript:alert) `x`';
  const page = toExplainer(review, mapReview(dir, review));
  const why = page.panels.find(p => p.id === 'node-before').blocks[0].text;
  assert.ok(why.includes('\\<script\\>')); assert.ok(why.includes('\\[fake\\]'));
  assert.ok(page.panels.some(p => p.blocks.some(b => b.type === 'diff' && b.text.includes('-old'))));
  assert.equal(JSON.stringify(page).includes(dir), false);
});

test('existing output, input alias and symlink destinations cannot overwrite a victim', t => {
  const { dir, review } = fixture(t);
  const input = path.join(dir, 'review.json'); fs.writeFileSync(input, JSON.stringify(review));
  const victim = path.join(dir, 'victim.json'); fs.writeFileSync(victim, 'KEEP');
  const existing = path.join(dir, 'existing'); fs.mkdirSync(existing); fs.symlinkSync(victim, path.join(existing, 'mapping.json'));
  assert.throws(() => build(dir, input, existing), /EEXIST/);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'KEEP');
  const alias = path.join(dir, 'alias'); fs.symlinkSync(existing, alias);
  assert.throws(() => build(dir, input, alias), /EEXIST/);
  assert.throws(() => build(dir, input, input), /EEXIST/);
  assert.equal(fs.readFileSync(input, 'utf8'), JSON.stringify(review));
  assert.equal(fs.readFileSync(victim, 'utf8'), 'KEEP');
});

test('partial output failure removes only owned files and preserves foreign entries', t => {
  const { dir, review } = fixture(t);
  const input = path.join(dir, 'review.json'); fs.writeFileSync(input, JSON.stringify(review));
  const output = path.join(dir, 'failure-output');
  const original = fs.writeFileSync; let writes = 0;
  const mock = t.mock.method(fs, 'writeFileSync', function(target, value, ...options) {
    if (typeof target === 'number' && ++writes === 2) {
      original.call(fs, target, 'partial');
      original.call(fs, path.join(output, 'foreign.txt'), 'KEEP');
      throw new Error('injected write failure');
    }
    return original.call(fs, target, value, ...options);
  });
  try { assert.throws(() => build(dir, input, output), /injected write failure/); }
  finally { mock.mock.restore(); }
  assert.deepEqual(fs.readdirSync(output), ['foreign.txt']);
  assert.equal(fs.readFileSync(path.join(output, 'foreign.txt'), 'utf8'), 'KEEP');
});

test('source URLs encode parentheses and punctuation in real Git paths', t => {
  const { dir, review, run, write } = fixture(t);
  const file = 'odd )!(name.txt'; write(file, 'new line\n'); run('add', '--', file); run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'punctuation');
  review.head = run('rev-parse', 'HEAD');
  review.nodes.push({ id: 'odd', label: 'odd', why: 'Agent statement.', ref: { path: file, side: 'head', start: 1, end: 1 } });
  const report = mapReview(dir, review); assert.equal(report.nodes.at(-1).status, 'reference-matches');
  const page = toExplainer(review, report), link = page.panels.find(p => p.id === 'node-odd').blocks.find(b => b.id === 'link-odd').text;
  assert.ok(link.includes('odd%20%29%21%28name.txt'));
});

test('repository ignoreSubmodules config cannot hide changed gitlinks from the ledger', t => {
  const { dir, review, run, write } = fixture(t);
  const oldTarget = review.base, newTarget = review.head;
  run('update-index', '--add', '--cacheinfo', `160000,${oldTarget},sub`);
  run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'base gitlink'); review.base = run('rev-parse', 'HEAD');
  write('change.txt', 'final\nstable\n'); run('add', 'change.txt');
  run('update-index', '--cacheinfo', `160000,${newTarget},sub`);
  run('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'head gitlink'); review.head = run('rev-parse', 'HEAD');
  review.nodes = review.nodes.filter(n => ['before', 'after'].includes(n.id));
  const normal = mapReview(dir, review);
  assert.equal(normal.summary.files, 2); assert.equal(normal.summary.unresolvedFiles, 1); assert.equal(normal.mappingComplete, false);
  run('config', 'diff.ignoreSubmodules', 'all');
  const configured = mapReview(dir, review);
  assert.equal(configured.summary.files, 2); assert.equal(configured.summary.unresolvedFiles, 1); assert.equal(configured.mappingComplete, false);
  assert.equal(configured.unresolvedFiles[0].path, 'sub');
});

test('relative diff config and a nested caller cannot narrow repository coverage', t => {
  const { dir, review, run } = fixture(t); fs.mkdirSync(path.join(dir, 'nested'));
  run('config', 'diff.relative', 'true');
  const report = mapReview(path.join(dir, 'nested'), review);
  assert.equal(report.mappingComplete, true); assert.equal(report.summary.files, 4);
  assert.equal(report.summary.referenceMatches, 6);
  assert.equal(report.nodes[0].excerpt, 'old');
  const page = toExplainer(review, report);
  assert.ok(page.answer.scope.includes('example/fixture')); assert.equal(page.answer.scope.includes('Archify 公开历史'), false);
});
