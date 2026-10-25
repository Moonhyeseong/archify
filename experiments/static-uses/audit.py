#!/usr/bin/env python3
"""Original Apache-2.0 fixed-content audit. Does not import or run Beniget/AST/gast."""
from pathlib import Path
from html.parser import HTMLParser
import base64,gzip,hashlib,json,re
R=Path(__file__).resolve().parent
checks=[]
def check(name,value):
    if not value:raise AssertionError(name)
    checks.append(name)
def digest(data):return hashlib.sha256(data).hexdigest()
m=json.loads((R/'upstream/source-manifest.json').read_text())
check('four complete upstream files retain fixed bytes and SHA',len(m['files'])==4 and all(len((R/'upstream/beniget'/x['path']).read_bytes())==x['bytes'] and digest((R/'upstream/beniget'/x['path']).read_bytes())==x['sha256'] for x in m['files']))
lines=(R/'upstream/beniget/tests/test_chains.py').read_text().splitlines(keepends=True)
source='a = 1; a + 1 if a else - a'
tokens=['a -> (','a -> (<IfExp> -> ()), ','a -> (<BinOp> -> (<IfExp> -> ())), ','a -> (<UnaryOp> -> (<IfExp> -> ()))',')']
check('complete official selected test and source literal preserved', ''.join(lines[55:67])==(R/'selected-test.txt').read_text() and lines[56].strip()=='code = "'+source+'"' and (R/'source-input.txt').read_bytes()==source.encode())
check('all five official expected literals preserved without running Python',all(line.strip()=='"'+token+'"' for line,token in zip(lines[60:65],tokens)) and (R/'expected-chain.txt').read_bytes()==''.join(tokens).encode())
ledger=json.loads((R/'projection-ledger.json').read_text());spec=json.loads((R/'use-chain.architecture.json').read_text())
expected={('def-a','load-test'),('def-a','load-body'),('def-a','load-else'),('load-test','ifexp'),('load-body','binop'),('binop','ifexp'),('load-else','unaryop'),('unaryop','ifexp')}
node_ids={'def-a','load-test','load-body','load-else','binop','unaryop','ifexp'}
check('seven nodes and eight static-use relations equal fixed expected projection',len(spec['components'])==7 and {n['id'] for n in spec['components']}==node_ids and len(spec['connections'])==8 and {(e['from'],e['to']) for e in spec['connections']}==expected and all(e['label']=='use' and e['variant']=='default' for e in spec['connections']))
check('ledger binds same seven nodes and eight edges without adding runtime edges',{n['id'] for n in ledger['nodes']}==node_ids and {(e['from'],e['to']) for e in ledger['edges']}==expected and all(e['kind']=='static use' for e in ledger['edges']))
check('four distinct a occurrences and one shared IfExp are preserved',{n['sourceSpan'][0] for n in ledger['nodes'] if n['id'] in {'def-a','load-test','load-body','load-else'}}=={0,7,16,25} and sum(n['id']=='ifexp' for n in ledger['nodes'])==1 and all(source[slice(*n['sourceSpan'])]==n['sourceText'] for n in ledger['nodes']))
class Contents(HTMLParser):
    def __init__(self):super().__init__();self.code=[];self.in_code=False;self.buf=[];self.rows=[];self.row=None;self.cell=None
    def handle_starttag(self,t,a):
        if t=='code':self.in_code=True;self.buf=[]
        if t=='tr':self.row=[]
        if t in ['td','th']:self.cell=[]
    def handle_data(self,d):
        if self.in_code:self.buf.append(d)
        if self.cell is not None:self.cell.append(d)
    def handle_endtag(self,t):
        if t=='code' and self.in_code:self.code.append(''.join(self.buf));self.in_code=False
        if t in ['td','th'] and self.cell is not None:self.row.append(''.join(self.cell));self.cell=None
        if t=='tr' and self.row is not None:self.rows.append(self.row);self.row=None
html=(R/'explainer.html').read_text();native=(R/'use-chain.html').read_text();p=Contents();p.feed(html)
prepared=json.loads(re.search(r'<script type="application/json" id="archify-explainer-prepared">(.*?)</script>',html,re.S)[1]);child=prepared['preparedDiagrams']['diagrams']['uses']
check('page sourceText equals authored MD and native spec is exact',prepared['sourceText']==(R/'explainer.archify.md').read_text() and child['spec']==spec)
check('embedded native HTML equals standalone final artifact bytes',gzip.decompress(base64.b64decode(child['htmlGzip']))==(R/'use-chain.html').read_bytes())
check('source dependency is exact fixed native JSON',len(prepared['dependencies'])==1 and base64.b64decode(prepared['dependencies'][0]['contentBase64'])==(R/'use-chain.architecture.json').read_bytes())
check('actual rendered source and complete expected literal excerpt retained',source in p.code and ''.join(lines[60:65]).rstrip() in [c.rstrip() for c in p.code])
rows=[row for row in p.rows if row and re.fullmatch(r'use-[1-8]',row[0])]
check('all eight relation rows actually rendered exactly once',len(rows)==8 and {row[0] for row in rows}=={f'use-{i}'for i in range(1,9)})
check('standalone SVG exposes exact graph identity and eight path relations',set(re.findall(r'<g[^>]+data-node-id="([^"]+)"',native))==node_ids and len(re.findall(r'<path[^>]+data-edge-id="use-[1-8]"',native))==8)
check('scope, offsets, shared-expression and effective Live caveats remain public',all(x in html for x in ['未运行 Beniget/Python','同一个表达式节点','从 0 开始','不是求值顺序','visit_Constant']) and 'data-animation="trace"' in native and 'animation' not in spec['meta'])
check('public generated HTML contains no personal file path',all('/Users/' not in h and 'file:///' not in h for h in [html,native]))
print(json.dumps({'status':'pass','scope':'fixed official fixture/expected projection and rendered content only; no upstream execution or browser','checks':checks},ensure_ascii=False,indent=2))
