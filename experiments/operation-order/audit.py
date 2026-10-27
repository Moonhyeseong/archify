"""Audit only the fixed README example and its three sequential candidates."""
from itertools import permutations
from pathlib import Path

here = Path(__file__).resolve().parent
source = (here / 'upstream/README.md').read_text()
expected = [
    '{Kind: porcupine.CallEvent, Value: registerInput{false, 200}, Id: 0, ClientId: 0}',
    '{Kind: porcupine.CallEvent, Value: registerInput{true, 0}, Id: 1, ClientId: 1}',
    '{Kind: porcupine.ReturnEvent, Value: 200, Id: 1, ClientId: 1}',
    '{Kind: porcupine.CallEvent, Value: registerInput{true, 0}, Id: 2, ClientId: 2}',
    '{Kind: porcupine.ReturnEvent, Value: 0, Id: 2, ClientId: 2}',
    '{Kind: porcupine.ReturnEvent, Value: 0, Id: 0, ClientId: 0}',
]
example = source[source.index('Now, suppose we have another history:'):source.index('See [`porcupine_test.go`]')]
positions = [example.index(event) for event in expected]
assert positions == sorted(positions) and len(set(positions)) == 6
assert 'return 0' in source and 'return true, regInput.value' in source and 'output == state' in source
assert '// returns false' in example
results = {}
for order in permutations(('W', 'R200', 'R0')):
    if order.index('R200') > order.index('R0'):
        continue
    state = 0
    mismatch = None
    for op in order:
        if op == 'W':
            state = 200
        elif (200 if op == 'R200' else 0) != state:
            mismatch = (op, state)
            break
    results[order] = mismatch
assert results == {('W', 'R200', 'R0'): ('R0', 200), ('R200', 'W', 'R0'): ('R200', 0), ('R200', 'R0', 'W'): ('R200', 0)}
page = (here / 'candidate.archify.md').read_text()
assert '不是时间、时长或测量' in page and '本页没有执行 Porcupine' in page
assert '不是观察到的调用环、死锁或因果环' in page
assert all(edge in page for edge in ('| write > read200 | 模型：读200 | |', '| read200 > read0 | 实时：先返回 | |', '| read0 > write | 模型：读0 | |'))
print('PASS: six ordered upstream events, model, stated result, three candidates, boundaries and three edge labels')
