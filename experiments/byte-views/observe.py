#!/usr/bin/env python3
"""Original Apache-2.0 fixed-input observation; not a PNG decoder or fq execution.
Reads only the committed, hash-bound 97-byte fixture. JSON goes to stdout.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parent
PNG = ROOT / 'upstream/format/png/testdata/4x4_palette.png'
EXPECTED = '508a58c0563252e935d3a0112131f236c81a4db2e161deb203659f0ca1d8cf39'

def observe():
    b = PNG.read_bytes()
    if len(b) != 97 or hashlib.sha256(b).hexdigest() != EXPECTED:
        raise ValueError('fixed fixture length/SHA256 mismatch; no other input supported')
    fields = []
    for name, lo, hi in [('length',8,12), ('type',12,16), ('data',16,29), ('crc',29,33)]:
        fields.append({'field':name,'byteRange':[lo,hi],'bytes':hi-lo,'hex':b[lo:hi].hex()})
    flags = []
    for name, position in [('ancillary',98),('private',106),('reserved',114),('safe_to_copy',122)]:
        byte, msb_index = divmod(position, 8)
        flags.append({'name':name,'bitRange':[position,position+1], 'sourceByte':byte,
                      'msbIndex':msb_index,'value':bool((b[byte] >> (7-msb_index)) & 1)})
    return {'kind':'independent fixed-byte observation; upstream fq/GraphicsMagick not run',
            'fileSHA256':EXPECTED,'fileBytes':len(b),
            'coordinates':{'origin':'original PNG file byte 0','interval':'half-open [start,stop)',
                           'bitOffset':'8 * byte offset + MSB-first bit index (0..7)'},
            'selectedByteRange':[8,33],'selectedBytes':25,
            'outsideSelectedBytes':72,'physicalFields':fields,
            'lengthValueBigEndian':int.from_bytes(b[8:12],'big'),
            'typeASCII':b[12:16].decode('ascii'),'interpretations':flags,
            'crcScope':'stored bytes observed only; CRC not recalculated',
            'imageScope':'no decompression, pixel decode or PNG conformance validation'}

if __name__ == '__main__':
    print(json.dumps(observe(),ensure_ascii=False,indent=2))
