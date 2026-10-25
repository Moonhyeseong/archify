"""Read this fixed fixture and HTML; never execute SQL or a provenance evaluator."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
REVISION = '96227fbfc6dd6084d6041f4a11c59093e8155520'
checks = []
sha = lambda b: hashlib.sha256(b).hexdigest()


class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ''.join(c.text() if isinstance(c, Element) else c for c in self.children)

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


manifest = json.loads((ROOT / 'source-manifest.json').read_text())
assert manifest['revision'] == REVISION and len(manifest['files']) == 16
for entry in manifest['files']:
    data = (ROOT / entry['path']).read_bytes()
    assert len(data) == entry['bytes'] and sha(data) == entry['sha256'], entry['path']
    assert hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest() == entry['gitBlob']
assert sha((ROOT / 'upstream/LICENSE').read_bytes()) == 'a7256d215dc8c236c0baa6c8095d6b31697593e979fadf656fb8536ef7332cb0'
checks.append('sixteen complete original Git blobs and MIT license')

facts = json.loads((ROOT / 'facts.json').read_text())
which = (ROOT / 'upstream/test/expected/sr_which.out').read_text().splitlines()
why = (ROOT / 'upstream/test/expected/sr_why.out').read_text().splitlines()
assert which[4:9] == ['city|which', 'Berlin|{Ellen,Susan}', 'New York|{John,Paul}', 'Paris|{Dave,Magdalen,Nancy}', '(3 rows)']
assert why[4:9] == ['city|why', 'Berlin|{{Ellen,Susan}}', 'New York|{{John,Paul}}', 'Paris|{{Dave,Magdalen},{Dave,Nancy},{Magdalen,Nancy}}', '(3 rows)']
assert facts['whichLabels'] == ['Dave', 'Magdalen', 'Nancy']
assert facts['whyGroups'] == [['Dave', 'Magdalen'], ['Dave', 'Nancy'], ['Magdalen', 'Nancy']]
assert which[7] == 'Paris|{' + ','.join(facts['whichLabels']) + '}'
assert why[7] == 'Paris|{' + ','.join('{' + ','.join(pair) + '}' for pair in facts['whyGroups']) + '}'
checks.append('both first official result sections and three grouped witnesses exact')

seed = (ROOT / 'upstream/test/sql/add_provenance.sql').read_text().splitlines()
assert seed[13:21] == [
    'INSERT INTO personnel (name,position,city,classification) VALUES',
    "  ('John','Director','New York','unclassified'),",
    "  ('Paul','Janitor','New York','restricted'),",
    "  ('Dave','Analyst','Paris','confidential'),",
    "  ('Ellen','Field agent','Berlin','secret'),",
    "  ('Magdalen','Double agent','Paris','top_secret'),",
    "  ('Nancy','HR','Paris','restricted'),",
    "  ('Susan','Analyst','Berlin','secret');",
]
for name, line in facts['parisSeedLines'].items():
    assert seed[line - 1].startswith("  ('" + name + "',") and "'Paris'" in seed[line - 1]
qwhich = (ROOT / 'upstream/test/sql/sr_which.sql').read_text().splitlines()
qwhy = (ROOT / 'upstream/test/sql/sr_why.sql').read_text().splitlines()
assert qwhich[6:10] == qwhy[6:10] == ['FROM personnel p1, personnel p2', 'WHERE p1.city = p2.city AND p1.id < p2.id', 'GROUP BY p1.city', 'ORDER BY p1.city;']
checks.append('complete seven-row seed and shared first-query clauses; no SQL evaluated')

input_bytes = (ROOT / 'explainer.json').read_bytes()
document = json.loads(input_bytes)
html_bytes = (ROOT / 'explainer.html').read_bytes()
html = html_bytes.decode()
matches = re.findall(r'<script[^>]*id="archify-explainer-prepared"[^>]*>(.*?)</script>', html, re.S)
assert len(matches) == 1
prepared = json.loads(matches[0])
assert prepared['document'] == document and prepared['sourceText'].encode() == input_bytes
sources = prepared['preparedSources']['sources']
assert set(sources) == {s['id'] for s in document['sources']} and len(sources) == 9
for declaration in document['sources']:
    source = sources[declaration['id']]
    data = (ROOT / 'upstream' / declaration['path']).read_bytes()
    lines = data.decode().splitlines()
    first, last = declaration['lines']
    assert 1 <= first <= last <= len(lines)
    assert source['path'] == declaration['path'] and source['lines'] == [first, last]
    assert source['revision'] == REVISION and source['sha256'] == sha(data) and source['bytes'] == len(data)
    assert source['text'] == '\n'.join(lines[first - 1:last])
assert prepared.get('preparedDiagrams', {}).get('diagrams', {}) == {}
checks.append('complete input, all nine declared sources, in-bounds excerpts and no diagram')

page = Page(html).root
ids = [n.attrs['id'] for n in page.walk() if 'id' in n.attrs]
assert len(ids) == len(set(ids))
by_id = {n.attrs['id']: n for n in page.walk() if 'id' in n.attrs}
for block_id, source_id in [('which-code', 'which'), ('why-code', 'why'), ('query-code', 'query')]:
    codes = [n for n in by_id[block_id].walk() if n.tag == 'code']
    assert len(codes) == 1 and codes[0].text() == sources[source_id]['text']
rows = [n for n in by_id['witness-table'].walk() if n.tag == 'tr'][1:]
assert len(rows) == 3
for index, (row, pair) in enumerate(zip(rows, facts['whyGroups'])):
    assert next(n for n in row.walk() if n.tag == 'th').text() == '组合 ' + str(index + 1)
    assert next(n for n in row.walk() if n.tag == 'td').text() == ' + '.join(pair)
checks.append('actual rendered three code blocks and three non-flattened table groups')

for needle in ['/Users/', '/var/folders/', 'file:///']:
    assert needle not in html
assert '未运行 SQL' in document['answer']['scope']
assert facts['upstreamRevision'] == REVISION
checks.append('public artifact has no private paths and execution boundary is explicit')
print(json.dumps({'kind': 'fixed source and rendered-content audit; not a SQL parser, evaluator or test run',
                  'status': 'pass', 'upstreamExecuted': False, 'checks': checks,
                  'input': {'bytes': len(input_bytes), 'sha256': sha(input_bytes)},
                  'html': {'bytes': len(html_bytes), 'sha256': sha(html_bytes)}}, ensure_ascii=False, indent=2))
