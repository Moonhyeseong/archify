#!/usr/bin/env python3
"""Original Apache-2.0 fixed-fact and generated-content audit, no upstream execution."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
import observe
R=Path(__file__).resolve().parent
checks=[]
def check(name,value):
    if not value:raise AssertionError(name)
    checks.append(name)
manifest=json.loads((R/'upstream/source-manifest.json').read_text())
check('complete upstream byte lengths and digests',all(len((R/'upstream'/x['path']).read_bytes())==x['bytes'] and hashlib.sha256((R/'upstream'/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in manifest['files']))
o=json.loads((R/'observation.json').read_text())
check('recorded independent observation equals fixed-input read',o==observe.observe())
check('only occurrence 1 source and occurrence 2 saved output changed', [x['changedFields'] for x in o['rows']]==[[],['source'],['outputs'],[],[],[]])
check('duplicate sources remain separate, later saved value stays 9',o['rows'][1]['base']['source']==o['rows'][3]['base']['source'] and o['rows'][2]['base']['source']==o['rows'][4]['base']['source'] and o['rows'][4]['local']['outputs'][0]['data']['text/plain']==['9'])
check('all six occurrences, empty last, absent IDs and unchanged counts',len(o['rows'])==6 and o['rows'][5]['base']['source']==[] and o['rows'][5]['local']['execution_count'] is None and all('id' not in row[side] for row in o['rows'] for side in ['base','local']) and o['executionCountsUnchanged'])
class Tables(HTMLParser):
    def __init__(self):super().__init__();self.tables=[];self.table=None;self.row=None;self.cell=None
    def handle_starttag(self,tag,attrs):
        if tag=='table':self.table=[]
        elif tag=='tr':self.row=[]
        elif tag in ['td','th']:self.cell=[]
    def handle_data(self,data):
        if self.cell is not None:self.cell.append(data)
    def handle_endtag(self,tag):
        if tag in ['td','th'] and self.cell is not None:self.row.append(''.join(self.cell));self.cell=None
        elif tag=='tr' and self.row is not None:
            if self.table is not None:self.table.append(self.row)
            self.row=None
        elif tag=='table' and self.table is not None:self.tables.append(self.table);self.table=None
page=(R/'explainer.html').read_text();p=Tables();p.feed(page);table=p.tables[0]
check('actual rendered table keeps exactly six ordered occurrence rows',len(table)==7 and [row[0] for row in table[1:]]==list(map(str,range(6))))
for actual,row in zip(table[1:],o['rows']):
    for col,side in [(1,'base'),(2,'local')]:
        assert json.loads(actual[col])==row[side]['source']
    for col,side in [(3,'base'),(4,'local')]:
        outputs=row[side]['outputs'];expected=outputs[0]['data']['text/plain'] if outputs else []
        assert json.loads(actual[col])==expected
check('rendered literal source/output JSON exactly decodes to fixed field values',True)
source0=json.loads(table[1][1])[0]
check('LF versus JSON escape verified by actual character values',ord(source0[-1])==10 and len(source0)==10 and (chr(92)+'n') in table[1][1] and (chr(92)*2+'n') not in table[1][1])
spec=json.loads((R/'notebook-occurrences.tree.json').read_text());nodes=spec['nodes']
check('Tree has only pair/snapshot/occurrence containment edges',len(nodes)==15 and all(n.get('parent') in ([None] if n['id']=='pair' else ['pair'] if n['id'] in ['base','local'] else [n['id'].split('_')[0]]) for n in nodes) and all(sum(n.get('parent')==side for n in nodes)==6 for side in ['base','local']))
prepared=json.loads(re.search(r'<script type="application/json" id="archify-explainer-prepared">(.*?)</script>',page,re.S)[1])
check('Explainer embeds exactly the same single native Tree model',list(prepared['preparedDiagrams']['diagrams'])==['occurrences'] and prepared['preparedDiagrams']['diagrams']['occurrences']['spec']==spec)
check('generated artifacts contain authored labels and no private path',all(n['label'] in (R/'notebook-occurrences.html').read_text() for n in nodes) and all('/Users/' not in (R/name).read_text() for name in ['notebook-occurrences.html','explainer.html']))
print(json.dumps({'status':'pass','scope':'fixed factual and rendered-content audit; no kernel/nbdime/browser run','checks':checks},ensure_ascii=False,indent=2))
