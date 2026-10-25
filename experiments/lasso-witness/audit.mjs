// Content evidence only. No SQL/TLA/Promela parser, checker, or LTL evaluator.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, dir));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const checks = [];
const manifest = JSON.parse(await read('upstream/source-manifest.json'));
for (const f of manifest.files) {
  const bytes = await read(f.localPath);
  assert.equal(bytes.length, f.bytes);
  assert.equal(sha(bytes), f.sha256);
}
assert.equal(sha(await read('upstream/example-input.txt')), '449c0607d964769e503cd57628fb81edd660b2bfc65f89ed343e96b144dc19ee');
checks.push('four frozen upstream files match recorded bytes and SHA-256');
const full = await read('upstream/example-input.txt');
const selected = Buffer.from(full.toString('utf8').split(/(?<=\n)/).slice(22, 37).join(''));
assert.deepEqual(await read('upstream/selected-lines-23-37.txt'), selected);
assert.equal(sha(selected), 'bbb08046f14913f5877c72147a69a729ec78b22e8aef63ade3dec4a19cde30fa');
for (const name of ['baseline', 'candidate']) {
  const text = (await read(`${name}.archify.md`)).toString();
  assert.equal(text.match(/```text\n([\s\S]*?)```/)[1], selected.toString());
}
checks.push('both pages retain exact selected source bytes');
const baseText = (await read('baseline.archify.md')).toString();
const candidateText = (await read('candidate.archify.md')).toString();
const patchTable = text => text.match(/\| 原文位置 \|[\s\S]*?\n\n/)[0];
assert.equal(patchTable(baseText), patchTable(candidateText));
assert.match(patchTable(candidateText), /\| `1\.3` \| 本步未报告 \| 本步未报告 \| `TRUE` \| 本步未报告 \| loop 入口 \|/);
checks.push('paired raw-patch tables match, and 1.3 has only reported u=TRUE');
const specBytes = await read('lasso.lifecycle.json');
const spec = JSON.parse(specBytes);
assert.equal(spec.states.length, 3);
assert.deepEqual(spec.states.map(s => s.label), ['位置 1.1', '位置 1.2', '位置 1.3']);
assert.equal(spec.transitions.length, 3);
const close = spec.transitions.find(e => e.id === 'lasso-closure');
assert.equal(close.from, 'pos-13'); assert.equal(close.to, 'pos-13');
assert.match(spec.states.find(s => s.id === close.to).tag, /loop 闭合约定/);
assert.ok(spec.cards.some(c => c.items.some(t => /不是新增观测、action 或实测 transition/.test(t))));
checks.push('three positions only; closure targets original 1.3 and is labelled a convention');
const html = (await read('candidate.html')).toString();
const prepared = JSON.parse(html.match(/<script[^>]+id="archify-explainer-prepared"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(prepared.dependencies.length, 1);
assert.equal(prepared.dependencies[0].relativePath, 'lasso.lifecycle.json');
assert.equal(prepared.dependencies[0].sha256, sha(specBytes));
assert.deepEqual(Buffer.from(prepared.dependencies[0].contentBase64, 'base64'), specBytes);
checks.push('Explainer freezes the exact standalone native JSON, without a second topology');
for (const n of ['baseline','candidate','lasso']) {
  const bytes = await read(n + '.html');
  assert.doesNotMatch(bytes.toString(), /\/Users\/|\/private\/|\/tmp\//);
}
checks.push('all three public HTML artifacts contain no local absolute paths');
process.stdout.write(JSON.stringify({ok:true, checks}, null, 2) + '\n');
