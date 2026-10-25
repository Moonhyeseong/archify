"""Original fixed-fact audit, standard library only. Never loads upstream JS."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re
ROOT = Path(__file__).resolve().parent
def read(name): return (ROOT/name).read_bytes()
def sha(b): return hashlib.sha256(b).hexdigest()
checks = []
def checked(name, predicate):
    assert predicate, name
    checks.append(name)
manifest = json.loads(read('source-manifest.json'))
facts = json.loads(read('facts.json'))
revision = '62f2e689f498f9c92dbc588c58750addec9b1654'
checked('fixed repository and revision', manifest['repository']=='https://github.com/google/diff-match-patch' and manifest['revision']==revision and facts['revision']==revision)
anchors = {
 'LICENSE': (11358,'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30'),
 'javascript/tests/diff_match_patch_test.js':(39223,'8fa7cd7c9c3681cace8dc0d50a68a694b57ad1fd5c5d322b4a957de2bc017a8c'),
 'javascript/diff_match_patch_uncompressed.js':(78511,'9a79cf031ac7c2e366416181051acb3e6d2cacf79c5354148f4c71ea20c7e4a3')}
for path,(n,digest) in anchors.items():
    b=read('upstream/'+path)
    assert len(b)==n and sha(b)==digest
for item in manifest['files']:
    b=read('upstream/'+item['path'])
    assert len(b)==item['bytes'] and sha(b)==item['sha256']
    assert hashlib.sha1(('blob '+str(len(b))+'\0').encode()+b).hexdigest()==item['gitBlob']
checked('six complete fixed Git blobs, Apache terms and both runner inputs retained',len(manifest['files'])==6)
for value in facts['values']:
    line=read('upstream/'+value['sourcePath']).splitlines(keepends=True)[value['sourceLine']-1]
    lo,hi=value['columnBytes']
    assert line[lo-1:lo]==b"'" and line[hi:hi+1]==b"'"
    assert line[lo:hi].decode('ascii')==value['value'] and hi-lo==value['bytes']
checked('four complete literals are exact observations of fixed source byte spans', [x['role'] for x in facts['values']]==['A','B','I','E'] and [x['bytes'] for x in facts['values']]==[44,44,48,48])
flags=facts['expectedFlags'];line=read('upstream/'+flags['sourcePath']).splitlines()[flags['sourceLine']-1].decode()
checked('true/true is the upstream expected assertion, not an execution result', flags['value']==[True,True] and line=="  assertEquivalent(['"+facts['values'][3]['value']+"', [true, true]], results);" and set(facts['execution'].values())=={'not-run'})
checked('expected E differs from original target B',facts['values'][3]['value']!=facts['values'][1]['value'])
document=json.loads(read('explainer.json'));html=read('explainer.html').decode()
prepared=json.loads(re.search(r'<script type="application/json" id="archify-explainer-prepared">([\s\S]*?)</script>',html)[1])
checked('public HTML embeds the complete authored input without rewriting',prepared['document']==document)
for source in document['sources']:
    if 'path' not in source: continue
    lo,hi=source['lines'];expected='\n'.join(read('upstream/'+source['path']).decode().split('\n')[lo-1:hi])
    actual=prepared['preparedSources']['sources'][source['id']]
    assert actual['text']==expected and actual['revision']==revision and actual['lines']==[lo,hi]
    assert actual['url'].endswith('/'+source['path']+f'#L{lo}-L{hi}')
checked('three fixed Git excerpts and source URLs match full original files',True)
class Reader(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.row=None;self.cell=False;self.text=[];self.cells={};self.pre=False;self.code=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='tr' and attrs.get('id','').startswith('role-'): self.row=attrs['id']
        if tag=='td' and self.row: self.cell=True;self.text=[]
        if tag=='pre': self.pre=True
    def handle_endtag(self,tag):
        if tag=='td' and self.cell: self.cells[self.row]=''.join(self.text);self.cell=False
        if tag=='tr': self.row=None
        if tag=='pre': self.pre=False
    def handle_data(self,data):
        if self.cell:self.text.append(data)
        if self.pre:self.code.append(data)
r=Reader();r.feed(html)
checked('four rendered table cells preserve complete literal text',r.cells=={'role-'+x['role'].lower():x['value'] for x in facts['values']})
checked('rendered code retains the whole declared test context', ''.join(r.code)==prepared['preparedSources']['sources']['apply-test']['text'])
checked('authored input has no diagram or serialized patch and output contains no personal paths',not prepared['preparedDiagrams']['diagrams'] and len(document['panels'])==3 and not any(marker in html for marker in ['/Users/','/var/folders/','file:///','/tmp/archify-']))
print(json.dumps({'kind':'fixed-source and rendered-content audit; no upstream execution','status':'pass','checks':checks,'count':len(checks),'htmlSha256':sha(read('explainer.html')),'inputSha256':sha(read('explainer.json'))},ensure_ascii=False,indent=2))
