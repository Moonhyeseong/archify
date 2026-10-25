#!/usr/bin/env python3
"""Original Apache-2.0 byte/presentation audit for a single frozen fixture.

Does not parse TS, decode source maps, select segments, or execute upstream code.
Projection accuracy is independently source-reviewed, not proved by this audit.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
R=Path(__file__).resolve().parent
checks=[]
def check(name,value):
    if not value:raise AssertionError(name)
    checks.append(name)
def sha(data):return hashlib.sha256(data).hexdigest()
manifest=json.loads((R/'upstream/source-manifest.json').read_text())
check('five complete fixed upstream source/license byte bindings',len(manifest['files'])==5 and manifest['revision']=='b7600158f4de012d246b7834a73c7c2190e75136' and all(len((R/'upstream'/r['path']).read_bytes())==r['bytes'] and sha((R/'upstream'/r['path']).read_bytes())==r['sha256'] for r in manifest['files']))
projectionBytes=(R/'fixture-projection.json').read_bytes()
check('frozen authored projection identity, independently source-reviewed',sha(projectionBytes)=='15640485f982da4c816ef0a4906d099f8e4a201c242cda6fa4db84cda878f1b5')
p=json.loads(projectionBytes);m=p['decodedMap'];a=p['upstreamAssertions']
class Rendered(HTMLParser):
    def __init__(self):super().__init__();self.tables=[];self.table=None;self.row=None;self.cell=None;self.pre=None;self.pres=[]
    def handle_starttag(self,t,attrs):
        if t=='table':self.table=[]
        elif t=='tr':self.row=[]
        elif t in ['td','th']:self.cell=[]
        elif t=='pre':self.pre=[]
    def handle_data(self,d):
        if self.cell is not None:self.cell.append(d)
        if self.pre is not None:self.pre.append(d)
    def handle_endtag(self,t):
        if t in ['td','th'] and self.cell is not None:self.row.append(''.join(self.cell));self.cell=None
        elif t=='tr' and self.row is not None:
            if self.table is not None:self.table.append(self.row)
            self.row=None
        elif t=='table' and self.table is not None:self.tables.append(self.table);self.table=None
        elif t=='pre' and self.pre is not None:self.pres.append(''.join(self.pre));self.pre=None
html=(R/'explainer.html').read_text();render=Rendered();render.feed(html)
# Expected display fields are copied from frozen upstream assertions. No mapper is run.
expected=lambda x:'null' if x['line'] is None else f"{x['line']}:{x['column']}"
check('three displayed queries retain all four upstream expected assertions',len(render.tables)==3 and render.tables[0][0]==['查询','策略 / 段列','原点','name'] and a[0]['expected']==a[1]['expected'] and render.tables[0][1:]==[['2:13','默认或 GLB / 12',expected(a[0]['expected']),a[0]['expected']['name']],['2:13','LUB / 17',expected(a[2]['expected']),'null'],['100:13','默认 / 无可用段','null','null']])
# This converts declared segment fields to API display bases; it does not select a segment.
seven=[[str(s[0]),f'{s[2]+1}:{s[3]}',m['names'][s[4]] if len(s)==5 else 'null'] for s in m['mappings'][1]]
check('seven displayed segments preserve declared fields and line-base conversion',len(seven)==7 and render.tables[1][1:]==seven)
compact=lambda s:json.dumps(s,separators=(',',':'))
full=[[str(i+1),' '.join(compact(s) for s in row) if row else '[]'] for i,row in enumerate(m['mappings'])]
check('all six generated lines preserved, including empty and one-field forms',len(full)==6 and render.tables[2][1:]==full and m['mappings'][3]==[] and m['mappings'][5]==[[0]])
check('rendered JSON string decodes to complete map sourcesContent with three LF',len(render.pres)==1 and json.loads(render.pres[0])==m['sourcesContent'][0] and m['sourcesContent'][0].count('\n')==3)
check('range and virtual-source boundaries remain explicit; no private paths',all(x in html for x in ['rangeMappings','未重新运行','不含生成代码全文','不是 Git 中已验证','不含代码摘录']) and '/Users/' not in html and '/private/tmp/' not in html)
print(json.dumps({'status':'pass','scope':'fixed byte identity and rendered-content binding only; not source-map evaluation, upstream test execution or browser acceptance','checks':checks},ensure_ascii=False,indent=2))
