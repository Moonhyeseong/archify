#!/usr/bin/env python3
"""Audit this fixed fixture and its artifacts; do not run Rust, pip or a resolver."""
import email.parser
import gzip
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REVISION = '45c43e2616d97484dfb6b16e1d5cfee3626086b8'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def script(html, script_id):
    matches = re.findall(r'<script\b[^>]*id="' + re.escape(script_id) + r'"[^>]*>(.*?)</script>', html, re.S)
    assert len(matches) == 1, (script_id, len(matches))
    return json.loads(matches[0])

manifest = json.loads((HERE / 'upstream/manifest.json').read_text())
assert manifest['revision'] == REVISION
assert len(manifest['files']) == 6
for entry in manifest['files']:
    data = (HERE / 'upstream' / entry['path']).read_bytes()
    assert (len(data), sha(data)) == (entry['bytes'], entry['sha256']), entry['path']

source = (HERE / 'upstream/rust/tests/public_api/graph.rs').read_text()
function = source.split('pub(super) fn scoped_extra_site() -> PackageSite {', 1)[1].split('\n}\n', 1)[0]
records = {}
for call in re.findall(r'site\.write\((.*?)\);', function, re.S):
    literals = [json.loads(value) for value in re.findall(r'"(?:\\.|[^"\\])*"', call)]
    assert literals[0] not in records
    records[literals[0]] = ''.join(literals[1:])
assert len(records) == 4
assert set(records) == {p.parent.name for p in (HERE / 'input-derived').glob('*/METADATA')}
packages = {}
relations = []
for directory, text in records.items():
    assert (HERE / 'input-derived' / directory / 'METADATA').read_bytes() == text.encode()
    metadata = email.parser.Parser().parsestr(text)
    name = metadata['Name']
    assert name not in packages
    packages[name] = {'directory': directory, 'name': name, 'version': metadata['Version'],
                      'requires': metadata.get_all('Requires-Dist', []),
                      'providesExtra': metadata.get_all('Provides-Extra', []),
                      'bytes': len(text.encode()), 'sha256': sha(text.encode())}
    for requirement in packages[name]['requires']:
        match = re.fullmatch(r'([a-z0-9]+)(?:\[([^\]]+)\])?(?:;\s*(.*))?', requirement)
        assert match, requirement
        target, extras, predicate = match.groups()
        relations.append({'from': name, 'to': target, 'raw': requirement,
                          'requestedExtras': [] if extras is None else extras.split(','),
                          'predicate': predicate})
assert len(relations) == 3
assert all(relation['to'] in packages for relation in relations)

# Read the upstream parameterized assertion, not an invented producer export.
test = (HERE / 'upstream/rust/tests/public_api/graph/extras.rs').read_text()
function_at = test.index('fn scopes_extras_to_requesting_edges(')
case_at = test.rfind('#[rstest]', 0, function_at)
mode_function = test[case_at:test.index('\n#[test]', function_at)]
cases = re.findall(r'#\[case::(\w+)\("(\w+)", (true|false)\)\]', mode_function)
assert len(cases) == 2
assert 'branch_contains(&value, "selenium", "urllib3", "pysocks")' in mode_function
assert 'branch_contains(&value, "requests", "urllib3", "pysocks")' in mode_function
assert '(0, true, requests_socks, "")' in mode_function
modes = {mode: {'selenium': True, 'requests': flag == 'true'} for label, mode, flag in cases if label == mode}
assert len(modes) == 2

spec = json.loads((HERE / 'metadata.architecture.json').read_text())
assert spec['meta']['repository']['revision'] == REVISION
assert len(spec['components']) == len(packages)
assert {node['id'] for node in spec['components']} == set(packages)
for node in spec['components']:
    package = packages[node['id']]
    assert node['label'] == package['name'] + ' · ' + package['version']
    assert records[package['directory']] in node['explanation']
assert len(spec['connections']) == len(relations)
for relation in relations:
    matches = [edge for edge in spec['connections'] if (edge['from'], edge['to']) == (relation['from'], relation['to'])]
    assert len(matches) == 1
    assert matches[0]['label'] == (relation['predicate'] or relation['raw'])
    assert matches[0].get('variant', 'default') == 'default'

html = (HERE / 'output/explanation.html').read_text()
prepared = script(html, 'archify-explainer-prepared')
draft = (HERE / 'question.archify.md').read_text()
assert prepared['sourceText'] == draft
assert prepared['preparedDiagrams']['diagrams']['metadata-map']['spec'] == spec
child = prepared['preparedDiagrams']['diagrams']['metadata-map']
import base64
assert gzip.decompress(base64.b64decode(child['htmlGzip'])) == (HERE / 'output/metadata.html').read_bytes()
assert child['svg'] in (HERE / 'output/metadata.html').read_text()

# Require the entire authored source set and valid ranges; optional fallback may not disappear silently.
declarations = {}
for match in re.finditer(r'^@source (\S+) .*?path=(\S+) lines=(\d+):(\d+)$', draft, re.M):
    source_id, path, first, last = match.groups()
    assert source_id not in declarations
    declarations[source_id] = (path, int(first), int(last))
assert len(declarations) == 5
sources = prepared['preparedSources']['sources']
assert set(sources) == set(declarations)
for source_id, (path, first, last) in declarations.items():
    data = (HERE / 'upstream' / path).read_bytes()
    lines = data.decode().splitlines()
    assert 1 <= first <= last <= len(lines), (path, first, last, len(lines))
    actual = sources[source_id]
    assert (actual['path'], *actual['lines']) == (path, first, last)
    assert actual['revision'] == REVISION
    assert (actual['sha256'], actual['bytes']) == (sha(data), len(data))
    assert actual['text'] == '\n'.join(lines[first - 1:last])

comparison = next(block for panel in prepared['document']['panels'] if panel['id'] == 'mode-table'
                  for block in panel['blocks'] if block['type'] == 'comparison')
assert len(comparison['rows']) == 4
rows = {row['label']: [cell['text'] for cell in row['cells']] for row in comparison['rows']}
for mode, expected in modes.items():
    for requester, visible in expected.items():
        row = rows[mode + ' · ' + requester]
        incoming = next(relation['requestedExtras'] for relation in relations if relation['from'] == requester)
        assert row[0] == requester + ' → urllib3'
        assert row[1] == ('socks' if incoming else '空集')
        assert row[3] == ('是' if visible else '否')
        # Authored global-scope annotation, not execution of the producer algorithm.
        assert row[2] == ('socks' if mode == 'active' else '空集')

result = {'kind': 'derived-fixed-fixture-audit', 'upstreamExecuted': False,
          'revision': REVISION, 'originalFiles': len(manifest['files']),
          'metadata': list(packages.values()), 'declarationRelations': relations,
          'upstreamBooleanExpectations': modes, 'sourceRanges': declarations,
          'checks': {'originalBytes': 'pass', 'fourDecodedMetadata': 'pass', 'twoModeExpectations': 'pass',
                     'fourNodesThreeRelations': 'pass', 'allFivePreparedSourcesExact': 'pass',
                     'sourceRangesWithinOriginalFiles': 'pass', 'sourceText': 'pass',
                     'oneNativeSpec': 'pass', 'nativeHtmlAndSvgExact': 'pass', 'compiledFourRows': 'pass'},
          'artifacts': {name: {'bytes': len((HERE / name).read_bytes()), 'sha256': sha((HERE / name).read_bytes())}
                        for name in ['metadata.architecture.json', 'question.archify.md', 'output/metadata.html', 'output/explanation.html']}}
print(json.dumps(result, ensure_ascii=False, indent=2))
