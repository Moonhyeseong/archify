import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectOutline } from './outline-to-tree.mjs';
const project = text => projectOutline(text, { source: 'sample.md' });

test('heading order, hierarchy, repeated labels and source positions survive projection', () => {
  const { tree, receipt } = project('# Root\n\nprose\n\n## Same\n### Child\n## Same\n');
  assert.deepEqual(tree.nodes.map(({ id, label, parent }) => [id, label, parent]), [['h1','Root',undefined],['h2','Same','h1'],['h3','Child','h2'],['h4','Same','h1']]);
  assert.deepEqual(receipt.mapping.map(h => h.line), [1,5,6,7]);
  assert.deepEqual(receipt.omittedNonemptyLines, [3]);
});
test('fences suppress fake headings and a longer matching closer is accepted', () => {
  const { tree } = project('# Root\n~~~js\n## Fake\n```\n~~~~\n## Real\n');
  assert.deepEqual(tree.nodes.map(h => h.label), ['Root','Real']);
});
test('ATX spacing, closing hashes, CRLF, BOM and Setext ranges are preserved', () => {
  const { tree, receipt } = project('\uFEFFRoot\r\n====\r\n\r\nChild\r\n-----\r\n\r\n### Leaf ###\r\n##hashtag\r\n');
  assert.deepEqual(tree.nodes.map(h => h.label), ['Root','Child','Leaf']);
  assert.deepEqual(receipt.mapping.map(h => [h.line,h.endLine,h.syntax]), [[1,2,'setext'],[4,5,'setext'],[7,7,'atx']]);
});
test('inline syntax is literal and excluded containers are reported', () => {
  const { tree, receipt } = project('# Root\n## **literal**\n> ## Quote\n    ## Code\n- ## List\n');
  assert.equal(tree.nodes[1].label,'**literal**');
  assert.equal(tree.nodes.length,2);
  assert.equal(receipt.warnings.filter(w => w.code === 'outline/container-omitted').length,3);
  assert.equal(receipt.warnings[0].code,'outline/literal-inline');
});
test('ambiguous or invalid structures fail with actionable source lines', () => {
  for (const [source, code, line] of [
    ['# Root\n### Jump','outline/level-jump',2],
    ['# A\n# B','outline/multiple-roots',2],
    ['## Child','outline/root-level',1],
    ['ordinary text','outline/no-headings',1],
    ['# Root\n```\n## Hidden','outline/unclosed-fence',2],
    ['# Root\n<!--\n## Hidden','outline/html-block',2],
    ['# Root\nfirst\nsecond\n---','outline/multiline-setext',4],
    ['# Root\n## <b>HTML</b>','outline/heading-html',2],
    ['# Root\n##','outline/empty-heading',2]
  ]) assert.throws(() => project(source), e => e.code === code && e.line === line, `${code} at ${line}`);
});
test('CLI writes native JSON and receipt, refuses overwrite, and leaves failed targets untouched', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'archify-outline-'));
  try {
    const input = path.join(dir,'input.md'), output = path.join(dir,'out.json');
    fs.writeFileSync(input,'# Root\n## Child\n');
    const run = () => spawnSync(process.execPath, [new URL('./outline-to-tree.mjs',import.meta.url).pathname,input,output], { encoding:'utf8' });
    assert.equal(run().status,0);
    const bytes = fs.readFileSync(output,'utf8');
    assert.equal(JSON.parse(bytes).nodes[1].parent,'h1');
    assert.equal(JSON.parse(fs.readFileSync(`${output}.receipt.json`)).mapping[1].line,2);
    assert.equal(run().status,1); assert.equal(fs.readFileSync(output,'utf8'),bytes);
    fs.writeFileSync(input,'# Root\n### Missing parent');
    assert.equal(run().status,1); assert.equal(fs.readFileSync(output,'utf8'),bytes);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});

test('closing hashes that consume the whole label fail rather than becoming a fake node', () => {
  for (const source of ['# ###', '# Root\n## ###', '# Root\n## ###   ']) {
    assert.throws(() => project(source), error => error.code === 'outline/empty-heading');
  }
  assert.equal(project('# Root\n## C#').tree.nodes[1].label, 'C#');
});

test('exclusive outputs protect real victims through aliases and receipt failures', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'archify-outline-victim-'));
  try {
    const input = path.join(dir,'source.md'), victim = path.join(dir,'victim.txt');
    const source = '# Root\n## Child\n', sentinel = 'keep this unrelated content';
    fs.writeFileSync(input, source); fs.writeFileSync(victim, sentinel);
    const run = output => spawnSync(process.execPath, [new URL('./outline-to-tree.mjs',import.meta.url).pathname,input,output], { encoding:'utf8' });
    assert.equal(run(input).status,1); assert.equal(fs.readFileSync(input,'utf8'),source);
    assert.equal(run(victim).status,1); assert.equal(fs.readFileSync(victim,'utf8'),sentinel);
    const link = path.join(dir,'linked.json'); fs.symlinkSync(victim,link);
    assert.equal(run(link).status,1); assert.equal(fs.readFileSync(victim,'utf8'),sentinel); assert.ok(fs.lstatSync(link).isSymbolicLink());
    const hardlink = path.join(dir,'hard.json'); fs.linkSync(input,hardlink);
    assert.equal(run(hardlink).status,1); assert.equal(fs.readFileSync(input,'utf8'),source);
    for (const kind of ['file','symlink']) {
      const output = path.join(dir,`${kind}.json`), receipt = `${output}.receipt.json`;
      if (kind === 'file') fs.writeFileSync(receipt,sentinel); else fs.symlinkSync(victim,receipt);
      assert.equal(run(output).status,1);
      assert.equal(fs.existsSync(output),false,'only newly created output is rolled back');
      assert.equal(fs.readFileSync(receipt,'utf8'),sentinel);
      assert.equal(fs.readFileSync(victim,'utf8'),sentinel);
    }
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
