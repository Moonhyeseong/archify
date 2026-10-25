#!/usr/bin/env python3
"""Audit this one pinned authored sample, without running Gradle or Groovy.

The oracle is the bundled official expected literal, not the authored node array.
This is a fixed-fixture extraction/coverage check, not a general Gradle parser.
"""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
REVISION = '84cda7f0ce2363c96b1b26713ad34558519bdf05'
TEST = 'src/test/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskTest.groovy'
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((ROOT / 'upstream/manifest.json').read_text())
assert manifest['revision'] == REVISION
assert len([f for f in manifest['files'] if f['role'] == 'complete multiproject fixture']) == 8
for item in manifest['files']:
    path = ROOT / 'upstream' / item['path']
    assert path.resolve().is_relative_to((ROOT / 'upstream/source').resolve())
    data = path.read_bytes()
    assert sha(data) == item['sha256'] and len(data) == item['bytes'], item['upstreamPath']
source = (ROOT / 'upstream/source' / TEST).read_text()
start = source.index("'''", source.index('static String expectedOutputWithIncludedBuildTask() {')) + 3
end = source.index("'''.stripIndent()", start)
literal = source[start:end]
assert (ROOT / 'expected-literal.txt').read_text() == literal
rendered = literal.replace('\\\\', '\\')
assert '\\' not in literal.replace('\\\\', '')  # no other escapes in this fixed literal
assert min(len(s) - len(s.lstrip()) for s in rendered.splitlines() if s.strip()) == 0
assert (ROOT / 'expected-tree.txt').read_text() == rendered
stack, rows, identities = [], [], {}
for offset, line in enumerate(rendered.splitlines()):
    match = re.fullmatch(r'((?:\|    |     )*)(?:\+--- |\\--- )(:[^ ]+)( \*)?', line)
    if line.startswith(':'):
        path, depth, repeated = line, 0, False
    elif match:
        path, depth, repeated = match[2], len(match[1]) // 5 + 1, bool(match[3])
    else:
        continue
    assert depth <= len(stack)
    seen = path in identities
    if not seen:
        identities[path] = {'nodeId': 't' + str(len(identities) + 1), 'firstPosition': len(rows) + 1}
    assert repeated == seen
    rows.append({'position': len(rows) + 1, 'taskPath': path, 'nodeId': identities[path]['nodeId'],
                 'parentPath': stack[depth - 1] if depth else None, 'depth': depth,
                 'printedPreviously': repeated, 'firstPosition': identities[path]['firstPosition'],
                 'expectedLine': offset + 1, 'sourceLine': source[:start].count('\n') + offset + 1})
    stack = stack[:depth] + [path]
ledger = json.loads((ROOT / 'mapping.json').read_text())
assert ledger['occurrences'] == rows and ledger['identities'] == identities
edges = [{'fromPath': r['parentPath'], 'toPath': r['taskPath']} for r in rows if r['parentPath']]
assert ledger['edges'] == edges
assert len(rows) == 11 and len(identities) == 10 and len(edges) == 10
assert ledger['observedExecutionCount'] is None
compile_rows = [r for r in rows if r['taskPath'] == ':compileJava']
assert [r['position'] for r in compile_rows] == [5, 7]
assert {r['parentPath'] for r in compile_rows} == {':classes', ':jar'}
assert not any(e['fromPath'] == ':compileJava' for e in edges)
spec = json.loads((ROOT / 'task-identities.architecture.json').read_text())
assert len(spec['components']) == 10 and len(spec['connections']) == 10
assert spec['meta']['repository']['revision'] == REVISION
assert spec['meta']['legend']['entries']['backend']['label'] == '任务身份'
assert {n['id'] for n in spec['components']} == {i['nodeId'] for i in identities.values()}
for node in spec['components']:
    path = next(path for path, identity in identities.items() if identity['nodeId'] == node['id'])
    assert node['label'] == path
    assert node['explanation'].startswith('任务身份：' + path + '。')
    refs = [r for r in rows if r['taskPath'] == path]
    assert node['sources'] == [{'path': TEST, 'line': refs[0]['sourceLine'],
                                'end_line': refs[0]['sourceLine'], 'label': '官方 expected 原行'}]
assert {(e['from'], e['to']) for e in spec['connections']} == {
    (identities[e['fromPath']]['nodeId'], identities[e['toPath']]['nodeId']) for e in edges}
assert all('label' not in e for e in spec['connections'])
assert spec['meta']['subtitle'].startswith('所有箭头：父任务依赖目标任务。')
draft = (ROOT / 'question.archify.md').read_text()
for row in rows:
    task_link = '[' + row['taskPath'] + '](node:task-map.' + row['nodeId'] + ')'
    assert any(line.startswith('| ' + str(row['position']) + ' | ' + task_link + ' |')
               for line in draft.splitlines())
result = {'kind': 'derived fixed-fixture source audit', 'status': 'pass',
          'sourceRevision': REVISION, 'sourceFilesVerified': len(manifest['files']),
          'completeFixtureFiles': 8, 'expectedLiteralSha256': sha(literal.encode()),
          'expectedDisplaySha256': sha(rendered.encode()), 'printedPositions': len(rows),
          'taskIdentities': len(identities), 'dependencies': len(edges),
          'compileJavaPositions': [5, 7], 'compileJavaParents': [':classes', ':jar'],
          'compileJavaIsLeafInExpected': True, 'observedExecutions': None,
          'limits': 'Text extraction and authored coverage only; no Gradle/Groovy execution or reader-benefit test.'}
page = ROOT / 'output/explanation.html'
native = ROOT / 'output/dependencies.html'
if page.exists() and native.exists():
    import base64
    import gzip
    html = page.read_text()
    prepared = json.loads(re.search(r'<script[^>]*id="archify-explainer-prepared"[^>]*>(.*?)</script>', html, re.S)[1])
    assert prepared['sourceText'] == draft
    child = prepared['preparedDiagrams']['diagrams']['task-map']
    assert child['spec'] == spec
    assert gzip.decompress(base64.b64decode(child['htmlGzip'])) == native.read_bytes()
    assert child['svg'] == re.search(r'(<svg\b.*?</svg>)', native.read_text(), re.S)[1]
    table = next(b for b in prepared['document']['panels'][0]['blocks'] if b['type'] == 'comparison')
    assert len(table['rows']) == len(rows)
    for actual, expected in zip(table['rows'], rows):
        assert actual['label'] == str(expected['position'])
        assert actual['cells'][0]['text'] == '[' + expected['taskPath'] + '](node:task-map.' + expected['nodeId'] + ')'
        assert actual['cells'][1]['text'] == '`' + (expected['parentPath'] or '入口') + '`'
    declared_sources = {
        m[1]: {'path': m[2], 'lines': [int(m[3]), int(m[4])]}
        for m in re.finditer(r'^@source ([a-z]+) .*?path=([^ ]+) lines=(\d+):(\d+)$', draft, re.M)
    }
    assert len(declared_sources) == 5
    prepared_sources = prepared['preparedSources']['sources']
    assert set(prepared_sources) == set(declared_sources)
    for source_id, source in prepared_sources.items():
        assert source['id'] == source_id
        assert source['path'] == declared_sources[source_id]['path']
        assert source['lines'] == declared_sources[source_id]['lines']
        data = (ROOT / 'upstream/source' / source['path']).read_bytes()
        first, last = source['lines']
        assert 1 <= first <= last <= len(data.decode().splitlines())
        assert source['revision'] == REVISION
        assert source['sha256'] == sha(data) and source['bytes'] == len(data)
        assert source['text'] == '\n'.join(data.decode().splitlines()[first - 1:last])
    for dependency in prepared['dependencies']:
        if dependency['kind'] == 'repository':
            data = (ROOT / 'upstream/source' / dependency['path']).read_bytes()
            assert base64.b64decode(dependency['contentBase64']) == data
    assert '/Users/' not in html and '/Users/' not in native.read_text()
    result['artifacts'] = {'singleSpecMatchesEmbedded': True, 'embeddedChildHtmlEqualsStandalone': True,
                           'embeddedSvgEqualsStandalone': True, 'draftTextMatchesPreparedSourceText': True,
                           'compiledTableMatchesAll11Occurrences': True, 'repositoryExcerptsAndFullFileDigestsMatch': True, 'preparedSourceIds': sorted(prepared_sources),
                           'declaredAndPreparedSourcesExactlyMatch': True, 'allSourceRangesInBounds': True,
                           'nativeSha256': sha(native.read_bytes()), 'explainerSha256': sha(page.read_bytes())}
print(json.dumps(result, ensure_ascii=False, indent=2))
