// Original Apache-2.0 fixed-fact audit. Reads only this SHA-bound bundle.
// Explicit byte spans are observations of one example, not a patch parser.
// No Python, upstream code, validator, patch application or browser is run.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parse} from 'parse5';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const checks=[];
function checked(name,fn){fn();checks.push(name);}
const manifest=JSON.parse(read('source-manifest.json'));
const facts=JSON.parse(read('facts.json'));
const fixed={
 'upstream/tests/001/a/file.py':[53,'1e99918f7dbe30fe1d61b00e37310b6096009e3a20b0f95a8c02e685b007b7c1'],
 'upstream/tests/001/b/file.py':[61,'7a6b16c1108e0ef29bb64112cee106de11206ecd766586b2c82fb46d2c46ebc7'],
 'upstream/tests/001/07-a-b.hintful.diff':[310,'aaa1abddb4283af03f7af56ca60cbd7a82ecf1f93bb9b21a3e256eef04445f19'],
 'upstream/tests/001/11-a-b.invalid.hintful.diff':[311,'1934717d10df8a8c786a27a47b12a27fd567f9187323177b4e065c6e0d32d634'],
};
checked('four complete fixed fixtures match independently recorded lengths and SHA',()=>{
 for(const [name,[bytes,digest]] of Object.entries(fixed)){
  const data=read(name);assert.equal(data.length,bytes);assert.equal(sha(data),digest);
 }
});
checked('ten full upstream blobs, copyright files and chosen Apache terms retained',()=>{
 assert.equal(manifest.files.length,10);
 for(const entry of manifest.files){
  const bytes=read(entry.path);assert.equal(bytes.length,entry.bytes);assert.equal(sha(bytes),entry.sha256);
  assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),entry.gitBlob);
 }
 const license=manifest.externalLicenseText;assert.equal(sha(read(license.path)),license.sha256);
 assert.equal(read(license.path).length,license.bytes);
});
// Byte intervals and LF flags below were authored for this fixed dataset.
// They never interpret operators, accept user input or validate a format.
function stitch(bytes,spans){
 return Buffer.concat(spans.flatMap(span=>{
  assert.ok(Number.isSafeInteger(span.byteStart)&&Number.isSafeInteger(span.byteEnd));
  assert.ok(span.byteStart>=0&&span.byteEnd>=span.byteStart&&span.byteEnd<=bytes.length);
  return [bytes.subarray(span.byteStart,span.byteEnd),...(span.appendLF?[Buffer.from('\n')]:[])];
 })).toString('utf8');
}
const patch=read(facts.validPatch),spans=facts.fixedByteSpans;
const right=stitch(patch,spans.rightS),left=stitch(patch,spans.leftS);
checked('explicit valid byte ranges reconstruct complete A and B and identical named S',()=>{
 assert.equal(stitch(patch,spans.A),read('upstream/tests/001/a/file.py').toString());
 assert.equal(stitch(patch,spans.B),read('upstream/tests/001/b/file.py').toString());
 assert.equal(right,left);
 assert.equal(right,'if True:\n    for a in [1,\n              2,\n              3]:\n        print(a)\n');
 assert.equal(facts.stages[1].derivedText,right);
 assert.deepEqual(facts.stages.map(x=>x.items),[[1,2,3],[1,2,3],[1,2]]);
 assert.deepEqual(facts.stages.map(x=>x.wrapper),[null,'if True','if True']);
 assert.equal(facts.validDeclaration.deletionIn,'second declaration');
});
checked('S stays derived, with no invented Git file or source digest',()=>{
 assert.match(facts.stages[1].kind,/derived/);
 for(const field of ['sourcePath','revision','sha256','gitBlob'])assert.equal(Object.hasOwn(facts.stages[1],field),false);
});
checked('invalid example has same name but True versus False content; no rejection executed',()=>{
 const example=facts.invalidExample,bytes=read(example.path);
 assert.equal(stitch(bytes,example.fixedByteSpans.rightS),right);
 assert.equal(stitch(bytes,example.fixedByteSpans.leftS),right.replace('if True','if False'));
 assert.notEqual(stitch(bytes,example.fixedByteSpans.rightS),stitch(bytes,example.fixedByteSpans.leftS));
 assert.equal(example.sameContent,false);assert.match(example.classification,/no upstream validator execution/);
 const implementation=read('upstream/implementations/python3/implementation.py').toString().split('\n');
 assert.ok(implementation.slice(1174,1179).join('\n').includes('validateSnippets'));
 assert.ok(!implementation.slice(1190,1194).join('\n').includes('validateSnippets'));
});
const sourceText=read('explainer.json').toString(),document=JSON.parse(sourceText),html=read('explainer.html').toString();
const prepared=JSON.parse(html.match(/<script type="application\/json" id="archify-explainer-prepared">([\s\S]*?)<\/script>/)[1]);
checked('HTML preserves complete authored input and eleven Git excerpts at exact ranges',()=>{
 assert.equal(prepared.sourceText,sourceText);assert.deepEqual(prepared.document,document);
 let excerpts=0;
 for(const source of Object.values(prepared.preparedSources.sources)){
  if(!source.path)continue;
  const bytes=read('upstream/'+source.path);assert.equal(sha(bytes),source.sha256);assert.equal(bytes.length,source.bytes);
  assert.equal(source.revision,manifest.revision);
  assert.equal(source.text,bytes.toString().split('\n').slice(source.lines[0]-1,source.lines[1]).join('\n'));excerpts++;
 }
 assert.equal(excerpts,11);assert.ok(!prepared.preparedSources.sources.S);
});
const dom=parse(html),children=node=>node.childNodes||[];
function all(node,predicate){return [...(predicate(node)?[node]:[]),...children(node).flatMap(child=>all(child,predicate))];}
function text(node){return node.nodeName==='#text'?node.value:children(node).map(text).join('');}
const byId=id=>all(dom,n=>(n.attrs||[]).some(a=>a.name==='id'&&a.value===id))[0];
checked('three original code blocks render exact excerpt text, including markers and indentation',()=>{
 for(const [id,source] of [['code-a','a'],['code-b','b'],['valid-patch','valid']]){
  const codes=all(byId(id),n=>n.tagName==='pre').flatMap(pre=>all(pre,n=>n.tagName==='code'));
  assert.equal(codes.length,1);assert.equal(text(codes[0]),prepared.preparedSources.sources[source].text);
 }
});
checked('rendered three-row A/S/B comparison keeps literal item and wrapper facts',()=>{
 const rows=all(byId('stage-table'),n=>n.tagName==='tr').slice(1).map(row=>all(row,n=>n.tagName==='td').map(text));
 // The row label is a TH; TDs are wrapper, items, then source references.
 assert.equal(rows.length,3);assert.deepEqual(rows.map(row=>row[1]),['1 / 2 / 3','1 / 2 / 3','1 / 2']);
 assert.deepEqual(rows.map(row=>row[0]),['没有外层 if','if True','if True']);
});
checked('no diagram, fake S source, runtime claim or personal paths in public HTML',()=>{
 assert.equal(document.panels.flatMap(p=>p.blocks).filter(b=>b.type==='diagram').length,0);
 assert.deepEqual(Object.keys(prepared.preparedDiagrams?.diagrams||{}),[]);
 for(const needle of ['/Users/','/var/folders/','file://'])assert.ok(!html.includes(needle));
 assert.ok(document.answer.scope.includes('未运行Python或validator'));
});
console.log(JSON.stringify({kind:'independent fixed-byte and rendered-content audit; not upstream validation',status:'pass',checks},null,2));
