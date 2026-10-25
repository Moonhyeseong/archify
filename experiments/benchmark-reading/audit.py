#!/usr/bin/env python3
"""Original Apache-2.0 fixed-input/rendered-content audit; no statistical inference."""
from pathlib import Path
from html.parser import HTMLParser
import base64,csv,hashlib,io,json,re
import observe
R=Path(__file__).resolve().parent
checks=[]
def check(name,value):
    if not value:raise AssertionError(name)
    checks.append(name)
m=json.loads((R/'upstream/source-manifest.json').read_text())
check('complete upstream bytes and digests retained',all(len((R/'upstream'/x['path']).read_bytes())==x['bytes'] and hashlib.sha256((R/'upstream'/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in m['files']))
o=json.loads((R/'observation.json').read_text())
check('recorded independent descriptive observation matches fixed inputs',o==observe.observe())
check('40 result records, 10 per format/file, iterations kept separate',len(o['rawObservations'])==40 and all(g['descriptiveGroups'][s]['records']==10 for g in o['groups'] for s in ['old.txt','new.txt']) and all(x['iterations']>100000 for x in o['rawObservations']))
medians=list(csv.DictReader(io.StringIO((R/'medians.csv').read_text())))
check('four chart numbers agree with descriptive medians in microseconds',len(medians)==2 and all(row['Format'].lower()==group['format'] and float(row['Old'])==group['descriptiveGroups']['old.txt']['medianMicrosecondsPerOp'] and float(row['New'])==group['descriptiveGroups']['new.txt']['medianMicrosecondsPerOp'] for row,group in zip(medians,o['groups'])))
class Tables(HTMLParser):
    def __init__(self):super().__init__();self.tables=[];self.table=None;self.row=None;self.cell=None
    def handle_starttag(self,t,a):
        if t=='table':self.table=[]
        elif t=='tr':self.row=[]
        elif t in ['td','th']:self.cell=[]
    def handle_data(self,d):
        if self.cell is not None:self.cell.append(d)
    def handle_endtag(self,t):
        if t in ['td','th'] and self.cell is not None:self.row.append(''.join(self.cell));self.cell=None
        elif t=='tr' and self.row is not None:
            if self.table is not None:self.table.append(self.row)
            self.row=None
        elif t=='table' and self.table is not None:self.tables.append(self.table);self.table=None
html=(R/'explainer.html').read_text();p=Tables();p.feed(html)
check('rendered comparison table preserves both CI/p/n/delta rows',len(p.tables)==3 and all(row[3:]==[g['upstreamExpectedCSVRow'][2]+' / '+g['upstreamExpectedCSVRow'][4],g['upstreamExpectedCSVRow'][5],g['upstreamExpectedCSVRow'][6]] for row,g in zip(p.tables[0][1:],o['groups'])))
expected=[]
for i in range(10):expected.append([str(i+1)]+[str(g['descriptiveGroups'][s]['valuesNsPerOp'][i]) for g in o['groups'] for s in ['old.txt','new.txt']])
check('actual rendered table retains all forty saved ns/op values',p.tables[2][1:]==expected)
prepared=json.loads(re.search(r'<script type="application/json" id="archify-explainer-prepared">(.*?)</script>',html,re.S)[1]);dep=prepared['dependencies'][0]
check('frozen chart dependency matches exact CSV bytes/SHA',len(prepared['dependencies'])==1 and dep['path']=='medians.csv' and base64.b64decode(dep['contentBase64'])==(R/'medians.csv').read_bytes() and dep['sha256']==hashlib.sha256((R/'medians.csv').read_bytes()).hexdigest())
labels=re.search(r'<g class="pele-data-labels".*?</g>',html,re.S)[0]
check('rendered existing bar chart has four correct point labels and unit',re.findall(r'<text[^>]*>(.*?)</text>',labels)==['1.718','3.0655','1.4225','3.07'] and 'µs/op' in html)
check('historical version and geomean caution retained',all(x in html for x in ['Go1.16','Go1.17','-8.94%','不按每行 p 门控','不是第三个统计确立的效果']))
check('rounding/tilde boundaries and no personal paths',all(x in html for x in ['不是性能判决','CI 0%','p=0.000','已证明相等/等价']) and '/Users/' not in html)
print(json.dumps({'status':'pass','scope':'fixed facts and rendered-content audit; no benchmark, stats inference or browser run','checks':checks},ensure_ascii=False,indent=2))
