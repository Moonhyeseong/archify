#!/usr/bin/env python3
"""Original Apache-2.0, fixed-file descriptive audit. No benchmark/statistical inference.
Read only hash-bound old/new/CSV below. Output JSON to stdout; no file writes.
"""
from pathlib import Path
import csv,hashlib,io,json,math,statistics
ROOT=Path(__file__).resolve().parent
DATA=ROOT/'upstream/cmd/benchstat/testdata'
FIXED={
 'old.txt':(1397,'db60f533bc3496b52bbe654c7b4acac8c0b5da141bc5f0cbf1d44978954eee00'),
 'new.txt':(1598,'0200be7b5bc8cb0e5edf22051d41895385fc248145db25fb7e646dfed8089ea0'),
 'csvOldNew.stdout':(357,'935a065791e15d41e4ceb1b10e5766af9891dc3cd20e11eebcbb5d61fee85fc6')}

def observe():
    texts={};bindings=[]
    for name,(size,sha) in FIXED.items():
        raw=(DATA/name).read_bytes()
        if len(raw)!=size or hashlib.sha256(raw).hexdigest()!=sha:
            raise ValueError('fixed input digest/length mismatch: '+name)
        texts[name]=raw.decode('utf8')
        bindings.append({'path':'upstream/cmd/benchstat/testdata/'+name,'bytes':size,'sha256':sha})
    observations=[]
    for filename in ['old.txt','new.txt']:
        for line_number,line in enumerate(texts[filename].splitlines(),1):
            for fmt in ['json','gob']:
                if line.startswith('BenchmarkEncode/format='+fmt+'-48'):
                    parts=line.split()
                    assert len(parts)==4 and parts[3]=='ns/op'
                    observations.append({'sourceFile':filename,'line':line_number,'format':fmt,
                        'benchmark':parts[0],'iterations':int(parts[1]),
                        'nsPerOp':int(parts[2]),'rawResultLine':line})
    assert len(observations)==40
    csv_rows=list(csv.reader(io.StringIO(texts['csvOldNew.stdout'])))
    assert len(csv_rows)==8 and csv_rows[4]==['','sec/op','CI','sec/op','CI','vs base','P']
    oracle_rows=csv_rows[5:7]
    assert [x[0] for x in oracle_rows]==['Encode/format=json-48','Encode/format=gob-48']
    summaries=[]
    for fmt,oracle in zip(['json','gob'],oracle_rows):
        groups={}
        for name in ['old.txt','new.txt']:
            values=[x['nsPerOp'] for x in observations if x['sourceFile']==name and x['format']==fmt]
            assert len(values)==10
            median=statistics.median(values)
            groups[name]={'records':len(values),'valuesNsPerOp':values,'medianNsPerOp':median,
                          'medianMicrosecondsPerOp':median/1000}
        # Only descriptive centers/unit conversion checked here; never p, CI or significance.
        assert math.isclose(groups['old.txt']['medianNsPerOp']*1e-9,float(oracle[1]),abs_tol=1e-18)
        assert math.isclose(groups['new.txt']['medianNsPerOp']*1e-9,float(oracle[3]),abs_tol=1e-18)
        summaries.append({'format':fmt,'descriptiveGroups':groups,
                          'upstreamExpectedCSVRow':oracle,'oracleSource':'committed csvOldNew.stdout, not generated this run'})
    assert oracle_rows[0][5:] == ['-17.20%','p=0.000 n=10']
    assert oracle_rows[1][5:] == ['~','p=0.446 n=10']
    assert csv_rows[7][0]=='geomean' and csv_rows[7][5]=='-8.94%'
    return {'kind':'original stdlib fixed-input descriptive observation; no benchmark or benchstat execution',
       'files':bindings,'rawObservations':observations,'groups':summaries,
       'upstreamGeomeanCSVRow':csv_rows[7],
       'historicalScope':{'json':'old Go1.16 / new Go1.17','gob':'old Go1.17 / new Go1.17','source':'new.txt first three lines, upstream description not independently verified environment'},
       'layers':{'nsPerOp':'saved raw result-line metric already per operation, not total elapsed time',
                 'iterations':'saved work iteration count per result line, not sample count',
                 'medianMicrosecondsPerOp':'this-round descriptive median and ns-to-us unit conversion',
                 'CI_p_n_delta_geomean':'upstream expected output only; not statistical computation in this run'},
       'limits':['not independent-sample or causal proof','no p/CI/Mann-Whitney/geomean recomputation',
                 'gob tilde does not establish equivalence','rounded p=0.000 is not zero; CI 0% is not zero uncertainty']}
if __name__=='__main__':print(json.dumps(observe(),ensure_ascii=False,indent=2))
