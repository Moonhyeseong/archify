import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'source-manifest.json'),'utf8'));
for(const entry of manifest.files){
 const bytes=fs.readFileSync(path.join(root,entry.path));
 assert.equal(bytes.length,entry.bytes,entry.path);
 assert.equal(hash(bytes),entry.sha256,entry.path);
}
const sourceText=fs.readFileSync(path.join(root,'explainer.json'),'utf8');
const document=JSON.parse(sourceText);
const html=fs.readFileSync(path.join(root,'review.html'),'utf8');
const bundle=JSON.parse(html.match(/<script type="application\/json" id="archify-explainer-prepared">([\s\S]*?)<\/script>/)[1]);
assert.equal(bundle.sourceText,sourceText,'artifact keeps the complete authored input');
assert.equal(bundle.document.meta.repository.revision,manifest.revision);
let excerpts=0;
for(const source of Object.values(bundle.preparedSources.sources)){
 if(!source.path)continue;
 const bytes=fs.readFileSync(path.join(root,'upstream',source.path));
 assert.equal(source.sha256,hash(bytes),source.id);
 assert.equal(source.bytes,bytes.length,source.id);
 const lines=bytes.toString('utf8').split('\n');
 assert.equal(source.text,lines.slice(source.lines[0]-1,source.lines[1]).join('\n'),source.id);
 assert.equal(source.revision,manifest.revision,source.id);
 excerpts++;
}
assert.equal(excerpts,6);
const table=document.panels[0].blocks.find(block=>block.id==='layer-table');
assert.equal(table.rows.length,3);
assert.deepEqual(bundle.document.panels[0].blocks.find(block=>block.id==='layer-table'),table);
const fixture=fs.readFileSync(path.join(root,'upstream/tests/error-context.rs'),'utf8');
assert.ok(fixture.includes('assert_error!(figment.extract_inner::<Bounds>("limits"), at ["limits"], from ["new"]);'));
assert.ok(fixture.includes('Its metadata has no source,'));
assert.ok(fixture.includes('(raw.min <= raw.max).then_some(Bounds)'));
assert.ok(!html.includes('/Users/')&&!html.includes('/tmp/'),'portable HTML has no machine paths');
console.log(JSON.stringify({kind:'source-and-artifact-binding-check',sourceFiles:manifest.files.length,verifiedExcerpts:excerpts,declaredProviderRows:table.rows.length,completeInputPreserved:true,artifactSha256:hash(Buffer.from(html)),upstreamExecuted:false}));
