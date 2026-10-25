#!/usr/bin/env python3
"""Fixed RustOwl content audit. Never compiles or runs Rust/RustOwl/MIR analysis."""
from pathlib import Path
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
REVISION = '607183668459e69f41871827c4d34df38117c427'
SNAPSHOT = 'crates/rustowl/tests/snapshots/algorithm__must_live_cond_init_v.snap'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def bound(path):
    data = path.read_bytes()
    return {'bytes': len(data), 'sha256': sha(data)}

manifest = json.loads((HERE / 'upstream/manifest.json').read_text())
assert manifest['revision'] == REVISION and manifest['license'] == 'MPL-2.0'
assert len(manifest['files']) == 11
assert {row['path'] for row in manifest['files']} >= {
    SNAPSHOT, 'LICENSE', 'crates/rustowl/src/lsp/decoration.rs',
    'crates/rustowl/src/bin/core/analyze/dataflow_analyzer/effect.rs'}
for row in manifest['files']:
    assert bound(HERE / 'upstream' / row['path']) == {'bytes': row['bytes'], 'sha256': row['sha256']}, row['path']

raw = (HERE / 'upstream' / SNAPSHOT).read_bytes()
assert len(raw) == 1168 and sha(raw) == 'fee579a7512a29b1cc118ffe8bb371b5ed102adac0f75462ad2e2540d1c8e5e6'
text = raw.decode()
plain = re.sub(r'\x1b\[[0-9;]*m', '', text)
assert '\x1b' not in plain
assert (HERE / 'derived/snapshot-without-sgr.txt').read_bytes() == plain.encode()
header = next(line for line in plain.splitlines() if line.startswith('=== Variable '))
assert header == "=== Variable 'v' (1/1) in function 'must_live::cond_init' ==="
selected = [header, '']
current = None
original_source_rows = []
for line in plain.splitlines():
    match = re.match(r'^\s*(\d+)\s+\|', line)
    if match:
        current = int(match[1])
        original_source_rows.append(current)
    if current is not None and 155 <= current <= 163 and (match or re.match(r'^\s*\|', line)):
        selected.append(line)
selected = '\n'.join(selected) + '\n'
assert original_source_rows == list(range(155, 166))
assert (HERE / 'derived/selected-snapshot.txt').read_bytes() == selected.encode()
assert '165 |' not in selected and 'does not compile' not in selected
assert 'does not compile' in plain
transform = json.loads((HERE / 'derived/transform.json').read_text())
assert transform['original'] == {'path': SNAPSHOT, 'bytes': len(raw), 'sha256': sha(raw)}
for row in transform['transforms']:
    assert bound(HERE / 'derived' / row['output']) == {'bytes': row['bytes'], 'sha256': row['sha256']}

# This decodes only the fixed snapshot's SGR-tagged underline segments into a byte audit.
# It is not a generic ANSI viewer or a Rust analysis implementation.
observations = []
current = None
for line in text.splitlines():
    no_sgr = re.sub(r'\x1b\[[0-9;]*m', '', line)
    match = re.match(r'^\s*(\d+)\s+\|', no_sgr)
    if match:
        current = int(match[1])
    if current is None or not (155 <= current <= 163) or not re.match(r'^\s*\|', no_sgr):
        continue
    segments = []
    for code, contents in re.findall(r'\x1b\[([0-9;]*)m([^\x1b]*)', line):
        if contents and set(contents) <= {'-', '~'}:
            assert code in {'92', '96'}, (current, code, contents)
            segments.append({'sgr': code, 'color': {'92': 'green', '96': 'cyan'}[code],
                             'glyphs': contents})
    assert segments
    observations.append({'sourceLine': current, 'segments': segments})
by_line = {entry['sourceLine']: entry['segments'] for entry in observations}
assert set(by_line) == {157, 158, 161, 162, 163}
assert {part['color'] for part in by_line[158]} == {'green', 'cyan'}
assert any(part['color'] == 'cyan' and part['glyphs'] == '--' for part in by_line[158])
for number in [161, 162, 163]:
    assert all(part['color'] == 'green' and set(part['glyphs']) == {'~'} for part in by_line[number])

fixture_data = (HERE / 'upstream/crates/rustowl/algo-tests/src/must_live.rs').read_bytes()
fixture_lines = fixture_data.decode().splitlines()
assert 'compiles' in fixture_lines[150] and 'does not compile' not in fixture_lines[150]
assert fixture_lines[151] == 'fn cond_init(c: bool) {'
assert fixture_lines[162] == '}' and 'does not compile' in fixture_lines[164]
assert 'r = &v;' in '\n'.join(fixture_lines[151:163])

html = (HERE / 'output/explanation.html').read_text()
match = re.search(r'<script\b[^>]*id="archify-explainer-prepared"[^>]*>(.*?)</script>', html, re.S)
assert match
prepared = json.loads(match[1])
draft = (HERE / 'question.archify.md').read_text()
assert prepared['sourceText'] == draft
assert not prepared.get('preparedDiagrams', {}).get('diagrams')
source_declarations = {}
url_declarations = {}
for line in draft.splitlines():
    match = re.match(r'^@source (\S+) .*?path=(\S+) lines=(\d+):(\d+)$', line)
    if match:
        source_id, path, first, last = match.groups()
        assert source_id not in source_declarations
        source_declarations[source_id] = (path, int(first), int(last))
    url = re.match(r'^@source (\S+) .*?url=(\S+)$', line)
    if url:
        url_declarations[url[1]] = url[2]
assert len(source_declarations) == 8 and set(url_declarations) == {'snapshot', 'mpl'}
sources = prepared['preparedSources']['sources']
assert set(sources) == set(source_declarations) | set(url_declarations)
for source_id, (path, first, last) in source_declarations.items():
    data = (HERE / 'upstream' / path).read_bytes()
    lines = data.decode().splitlines()
    assert 1 <= first <= last <= len(lines), (path, first, last, len(lines))
    actual = sources[source_id]
    assert (actual['path'], *actual['lines']) == (path, first, last)
    assert actual['revision'] == REVISION
    assert (actual['sha256'], actual['bytes']) == (sha(data), len(data))
    assert actual['text'] == '\n'.join(lines[first - 1:last])
for source_id, url in url_declarations.items():
    assert sources[source_id]['url'] == url and REVISION in url

panels = {panel['id']: panel for panel in prepared['document']['panels']}
snippets = [block for block in panels['snapshot-reading']['blocks'] if block['type'] == 'snippet']
assert len(snippets) == 1 and snippets[0]['text'].rstrip('\n') == selected.rstrip('\n')
comparison = next(block for block in panels['state-sets']['blocks'] if block['type'] == 'comparison')
assert len(comparison['rows']) == 3
assert [row['cells'][0]['text'] for row in comparison['rows']] == ['I', 'U', 'I ∪ U']
assert '作者' in draft and '不是工具 JSON' in draft and '精确 MIR' in draft
assert 'MPL-2.0' in draft and 'Apache-2.0 不覆盖' in draft
assert 'Ref 不作为 Move' in draft
assert b'/Users/' not in html.encode() and b'file:///' not in html.encode()

result = {'kind': 'derived-static-fixed-fixture-audit', 'revision': REVISION,
          'upstreamExecuted': False, 'rustCompiled': False, 'originalFiles': 11,
          'snapshot': bound(HERE / 'upstream' / SNAPSHOT),
          'selectedVariable': 'v', 'sourceFunctionRange': [152, 163],
          'upstreamCompilesCommentLine': 151, 'snapshotOriginalSourceRows': original_source_rows,
          'displaySourceRows': [155, 163], 'nextFunctionCommentLineExcludedFromDisplay': 165,
          'observedOriginalUnderlineSegments': observations,
          'conceptTableKind': 'author interpretation of source and algorithm, not emitted states or exact MIR locations',
          'checks': {'allOriginalBytes': 'pass', 'sgrOnlyRemoval': 'pass', 'explicitContextCrop': 'pass',
                     'greenCyanDistinction': 'pass', 'allSourceIdsAndRanges': 'pass',
                     'allPreparedFullFileDigestsAndExcerpts': 'pass', 'sourceText': 'pass',
                     'compiledSnapshotText': 'pass', 'threeConceptRows': 'pass', 'noNativeDiagram': 'pass',
                     'licenseBoundaryInArtifactSource': 'pass', 'privatePathScan': 'pass'},
          'artifacts': {name: bound(HERE / name) for name in
                        ['question.archify.md', 'output/explanation.html', 'derived/selected-snapshot.txt',
                         'derived/snapshot-without-sgr.txt', 'derived/transform.json']}}
print(json.dumps(result, ensure_ascii=False, indent=2))
