// Read-only checks for this fixed content experiment; not an object importer.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const here = new URL('./', import.meta.url);
const bytes = name => readFile(new URL(name, here));
const json = async name => JSON.parse(await bytes(name));
const sha = data => createHash('sha256').update(data).digest('hex');
const checks = [];
const manifest = await json('source/manifest.json');
for (const file of manifest.files) {
  const body = await bytes(file.localPath);
  assert.equal(body.length, file.bytes);
  assert.equal(sha(body), file.sha256);
}
checks.push('complete fixed upstream teaching source and BSD license match their bytes and hashes');
const source = await bytes('source/copy_mutable.py');
const construction = source.toString().split(/(?<=\n)/).slice(7, 13).join('');
const observer = (await bytes('observe.py')).toString();
const reused = observer.split('# BEGIN CONSTRUCTION\n')[1].split('# END CONSTRUCTION')[0];
assert.equal(reused, construction);
const observed = await json('observation.json');
assert.equal(observed.sourceSha256, sha(source));
assert.equal(observed.constructionSha256, sha(construction));
assert.equal(observed.mutationPerformed, false);
assert.equal(observed.upstreamToolImported, false);
assert.equal(observed.upstreamRenderCalled, false);
checks.push('observed stdout binds the exact copied construction; no upstream render or mutation is claimed');
assert.deepEqual(observed.variableBindings.map(v => v.variable), ['a', 'c1', 'c2', 'c3']);
assert.equal(observed.lists.length, 7);
assert.equal(new Set(observed.lists.map(v => v.symbol)).size, 7);
assert.equal(observed.listReferences.length, 6);
assert.equal(observed.rootPairs.length, 6);
assert.equal(observed.rootPairs.filter(p => p.sameObject).length, 1);
assert.deepEqual(observed.rootPairs.find(p => p.sameObject), {left:'a', right:'c1', sameObject:true, equalContents:true});
assert.ok(observed.rootPairs.every(p => p.equalContents));
checks.push('four variables have equal contents, but only a/c1 share the outer identity; seven lists and six index references');
const modelBytes = await bytes('copy-identity.architecture.json');
const model = JSON.parse(modelBytes);
assert.equal(model.diagram_type, 'architecture');
assert.equal(model.components.length, 11);
const tuple = edge => [edge.from, edge.to, edge.label].join('|');
const expected = [
  ...observed.variableBindings.map(v => ({from:`var-${v.variable}`, to:`list-${v.target}`, label:'绑定'})),
  ...observed.listReferences.map(v => ({from:`list-${v.from}`, to:`list-${v.to}`, label:`[${v.index}]`}))
].map(tuple).sort();
assert.deepEqual(model.connections.map(tuple).sort(), expected);
checks.push('native model preserves exactly four bindings and six index references without duplicate shared targets');
const html = (await bytes('output/explainer.html')).toString();
const prepared = JSON.parse(html.match(/<script[^>]+id="archify-explainer-prepared"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(prepared.sourceText, (await bytes('copy-identity.archify.md')).toString());
assert.equal(prepared.dependencies.length, 2); // One native JSON and one pinned source file.
const diagrams = prepared.dependencies.filter(d => d.relativePath === 'copy-identity.architecture.json');
assert.equal(diagrams.length, 1);
assert.equal(diagrams[0].sha256, sha(modelBytes));
assert.deepEqual(Buffer.from(diagrams[0].contentBase64, 'base64'), modelBytes);
const sourceDependency = prepared.dependencies.find(d => d.path === 'images/copy_mutable.py');
assert.equal(sourceDependency.revision, manifest.commit);
assert.deepEqual(Buffer.from(sourceDependency.contentBase64, 'base64'), source);
const card = prepared.preparedSources.sources.construction;
assert.equal(card.revision, manifest.commit);
assert.equal(card.path, 'images/copy_mutable.py');
assert.deepEqual(card.lines, [8, 13]);
assert.equal(card.text, construction.trimEnd());
assert.equal(card.sha256, sha(source)); // Card metadata binds the whole file, not just the excerpt.
assert.equal(card.bytes, source.length);
checks.push('Explainer freezes the one native JSON and exact Git-pinned source-card excerpt');
for (const name of ['output/copy-identity.html', 'output/explainer.html']) {
  assert.doesNotMatch((await bytes(name)).toString(), /\/Users\/|\/private\/|\/tmp\/|file:\/\/\//);
}
checks.push('both public HTML artifacts contain no local absolute filesystem paths');
process.stdout.write(JSON.stringify({ok:true, checks}, null, 2) + '\n');
