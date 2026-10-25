#!/usr/bin/env python3
"""Original Apache-2.0 stdlib inspection of three fixed JSON files.
No notebook/nbdime execution, matcher or generic diff/patch implementation.
Only reads hash-bound files beside this script; writes JSON to stdout.
"""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent
FILES=ROOT/'upstream/nbdime/tests/files'
FIXED={
 'base':('multilevel-test-base.ipynb',1706,'13cd472a33d45987f715db064d51eb3f9fc26381f8aca876adb6a3d734446265'),
 'local':('multilevel-test-local.ipynb',1707,'2d88dbe05ac89d1b9617e97af4fd5c480c155edae6821cdd152e15816c13d6c2'),
 'oracle':('multilevel-test-base-local-diff.json',1754,'932b57033edbe76a4382ad1cd6a11d7e39f33939a5b648faeec18c748d98a2b3')}

def observe():
    documents={}; bindings=[]
    for role,(filename,size,sha) in FIXED.items():
        raw=(FILES/filename).read_bytes()
        if len(raw)!=size or hashlib.sha256(raw).hexdigest()!=sha:
            raise ValueError('fixed fixture digest/length mismatch: '+role)
        documents[role]=json.loads(raw)
        bindings.append({'role':role,'path':'upstream/nbdime/tests/files/'+filename,'bytes':size,'sha256':sha})
    before,after=documents['base'],documents['local']
    assert len(before['cells'])==len(after['cells'])==6
    assert {k:v for k,v in before.items() if k!='cells'}=={k:v for k,v in after.items() if k!='cells'}
    rows=[]
    for i in range(6):
        a,b=before['cells'][i],after['cells'][i]
        # This is a position comparison for exactly these two fixed snapshots.
        # It does not discover correspondence between arbitrary notebooks.
        changed=[k for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k) or (k in a)!=(k in b)]
        rows.append({'index':i,'basePointer':'/cells/'+str(i),'localPointer':'/cells/'+str(i),
                     'base':a,'local':b,'changedFields':changed})
    assert [r['changedFields'] for r in rows]==[[],['source'],['outputs'],[],[],[]]
    assert all('id' not in c for d in [before,after] for c in d['cells'])
    assert [c['execution_count'] for c in before['cells']]==[1,2,3,4,5,None]==[c['execution_count'] for c in after['cells']]
    assert len(before['cells'][0]['source'][0])==10 and ord(before['cells'][0]['source'][0][-1])==10
    expected=documents['oracle']
    assert len(expected)==1 and expected[0]['op']=='patch' and expected[0]['key']=='cells'
    patches=expected[0]['diff']
    assert [x['key'] for x in patches]==[1,2]
    source=patches[0]['diff'][0]
    assert source['key']=='source' and source['op']=='patch'
    source_line=source['diff'][0]
    assert source_line['key']==0 and source_line['op']=='patch'
    assert source_line['diff']==[{'length':1,'key':4,'op':'removerange'},{'key':4,'valuelist':'5','op':'addrange'}]
    output=patches[1]['diff'][0]
    assert output['key']=='outputs' and output['diff'][0]['key']==0
    data=output['diff'][0]['diff'][0]
    assert data['key']=='data'
    mime=data['diff'][0]
    assert mime['key']=='text/plain'
    assert mime['diff']==[{'length':1,'key':0,'op':'removerange'},{'key':0,'valuelist':'25','op':'addrange'}]
    return {'kind':'independent stdlib fixed-snapshot inspection; no notebook or nbdime execution',
            'files':bindings,'identityScope':'snapshot + array index only within this fixed pair; no cell IDs/stable-ID claim',
            'rows':rows,'executionCountsUnchanged':True,'nonCellNotebookFieldsUnchanged':True,
            'oracle':{'kind':'upstream committed expected diff; not generated in this run',
                      'sha256':FIXED['oracle'][2],'changedCellIndices':[1,2],
                      'sourceArrayElement':'/cells/1/source/0','sourceCharacterIndex':4,
                      'savedOutputMIMEPath':'/cells/2/outputs/0/data/text~1plain',
                      'savedOutputCharacterIndex':0},
            'limits':['no runtime dependencies or causality inferred','no execution history/freshness/correctness validation','cell 0 actual LF is preserved in source array and displayed using JSON escape','no generic notebook alignment or patch application']}
if __name__=='__main__':
    print(json.dumps(observe(),ensure_ascii=False,indent=2))
