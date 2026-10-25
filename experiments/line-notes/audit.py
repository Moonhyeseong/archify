"""Independent HTML readback; no browser or upstream program execution."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import subprocess

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)
    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c, Node):
                yield from c.walk()

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(node)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break
    def handle_data(self, text):
        self.stack[-1].children.append(text)

def audit():
    here = Path(__file__).resolve().parent
    source = (here/'source/revision.mjs').read_bytes()
    original = subprocess.check_output(['git','show','10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0:archify/explainer/revision.mjs'], cwd=here)
    assert source == original
    pages = [Page((here/name).read_text()).root for name in ['baseline.html','candidate.html']]
    for page in pages:
        ids = [n.attrs['id'] for n in page.walk() if 'id' in n.attrs]
        assert len(ids) == len(set(ids)), 'duplicate DOM IDs'
        for block_id in ['snippet-a','snippet-b']:
            block = next(n for n in page.walk() if n.attrs.get('id') == block_id)
            code = next(n for n in block.walk() if n.tag == 'code' and n.attrs.get('class') == 'language-js')
            assert code.text().encode() == source, (block_id, 'complete source and trailing LF')
            assert not any(n.tag == 'a' for n in code.walk()), 'copy payload contains link text'
    for script in [n for n in pages[0].walk() if n.tag == 'script']:
        peer = [n for n in pages[1].walk() if n.tag == 'script' and n.attrs == script.attrs]
        assert len(peer) == 1 and peer[0].text() == script.text(), 'original runtime/prepared input changed'
    sidecar = json.loads((here/'input/notes.json').read_text())
    ids = {n.attrs['id']: n for n in pages[1].walk() if 'id' in n.attrs}
    links = [n for n in pages[1].walk() if 'data-expnote-link' in n.attrs]
    assert len(links) == 6
    for n in links:
        assert n.attrs['href'][1:] in ids
    for note in sidecar['notes']:
        prefix = 'expnote-'+note['blockId']
        line = ids[prefix+'-line-'+str(note['originalLine'])]
        note_node = ids[prefix+'-note-'+note['noteId']]
        assert line.text() == source.decode().splitlines()[note['originalLine']-1]
        assert note['text'] in note_node.text()
        assert line.attrs['tabindex'] == note_node.attrs['tabindex'] == '-1'
    return {'originalGitBlobExact':True,'sourceSha256':hashlib.sha256(source).hexdigest(),
            'twoCodePayloadsExactInEachArm':True,'blankLinesAndFinalLfExact':True,
            'gutterAndNotesOutsideCode':True,'originalScriptsAndPreparedInputExact':True,
            'validRoundtripLinks':6,'uniqueDomIds':True,'browserBehavior':'separate evidence'}

if __name__ == '__main__':
    print(json.dumps(audit(), ensure_ascii=False, indent=2))
