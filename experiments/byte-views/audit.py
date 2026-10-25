#!/usr/bin/env python3
"""Original Apache-2.0 read-only audit of this authored fixed example."""
from pathlib import Path
import hashlib,json,re,struct
import observe
R=Path(__file__).resolve().parent
checks=[]
def check(name, condition):
    if not condition: raise AssertionError(name)
    checks.append(name)
manifest=json.loads((R/'upstream/source-manifest.json').read_text())
check('complete upstream files bound to manifest bytes/SHA256', all(
    len((R/'upstream'/x['path']).read_bytes())==x['bytes'] and
    hashlib.sha256((R/'upstream'/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in manifest['files']))
o=json.loads((R/'observation.json').read_text())
check('recorded observation equals current fixed-byte observation', o==observe.observe())
b=observe.PNG.read_bytes()
check('independent struct header and physical partition', struct.unpack('>I4s',b[8:16])==(13,b'IHDR') and sum(x['bytes'] for x in o['physicalFields'])==25 and b[29:33].hex()=='d49f76ed' and o['outsideSelectedBytes']==72)
check('case-bit masks agree and overlap type, not extra storage', all((b[i]&0x20)==0 for i in range(12,16)) and all(96<=x['bitRange'][0]<x['bitRange'][1]<=128 for x in o['interpretations']) and len({x['bitRange'][0] for x in o['interpretations']})==4)
g=(R/'upstream/format/png/testdata/4x4_palette.fqtest').read_text()
check('complete golden retains expected original ranges and generator command', all(x in g for x in ['gradient:#ff00ff-#00ff00','0x8-0x21 (25)','0xc-0x10 (4)','0xc.2-0xc.3 (0.1)','0xd.2-0xd.3 (0.1)','0xe.2-0xe.3 (0.1)','0xf.2-0xf.3 (0.1)','data: raw bits 0x41-0x51 (16)']))
spec=json.loads((R/'byte-views.tree.json').read_text()); nodes={x['id']:x for x in spec['nodes']}
check('tree has exactly physical field branches and nested interpretation views',len(nodes)==9 and {n['id'] for n in nodes.values() if n.get('parent')=='ihdr'}=={'length','type','data','crc'} and {n['id'] for n in nodes.values() if n.get('parent')=='type'}=={'ancillary','private','reserved','safe_to_copy'})
s=(R/'explainer.html').read_text(); prepared=json.loads(re.search(r'<script type="application/json" id="archify-explainer-prepared">(.*?)</script>',s,re.S)[1])
check('explainer embeds the same single native Tree spec',prepared['preparedDiagrams']['diagrams']['byte-views']['spec']==spec)
check('frozen native HTML retains authored names and no private paths',all(n['label'] in (R/'byte-views.html').read_text() for n in nodes.values()) and all('/Users/' not in (R/p).read_text() for p in ['byte-views.html','explainer.html']))
print(json.dumps({'status':'pass','scope':'fixed-input factual/artifact audit; no fq, CRC, image decoder or browser execution','checks':checks},ensure_ascii=False,indent=2))
