import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export class OutlineError extends Error {
  constructor(code, line, message) { super(message); this.code = code; this.line = line; }
}
const fail = (code, line, message) => { throw new OutlineError(code, line, message); };

// A deliberately bounded heading projection, not a Markdown/CommonMark parser.
export function projectOutline(text, { source = 'input.md', sourceUrl = '', output = 'outline.html' } = {}) {
  if (text.includes('\0')) fail('outline/nul', 1, 'NUL bytes are unsupported.');
  const lines = text.replace(/^\uFEFF/u, '').split(/\r\n|\n|\r/u);
  const headings = [], omitted = [], warnings = [];
  let fence = null, paragraph = [];
  const add = (level, label, line, endLine = line, syntax = 'atx') => {
    label = label.trim();
    if (!label) fail('outline/empty-heading', line, 'A heading must have visible text.');
    if (/[<>]/u.test(label)) fail('outline/heading-html', line, 'HTML in headings is unsupported; use plain text.');
    // Preserve punctuation literally rather than pretending to resolve inline Markdown.
    if (/[`*_\[\]\\&]/u.test(label)) warnings.push({ code: 'outline/literal-inline', line, message: 'Inline markup/entities remain literal in this heading.' });
    headings.push({ level, label, line, endLine, syntax }); paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], n = i + 1;
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u);
    if (fence) {
      const close = line.match(/^ {0,3}(`+|~+)\s*$/u);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
      omitted.push(n); continue;
    }
    if (marker) {
      if (marker[1][0] === '`' && marker[2].includes('`')) fail('outline/fence-info', n, 'Backtick fence info may not contain backticks.');
      fence = { char: marker[1][0], length: marker[1].length, line: n }; paragraph = []; omitted.push(n); continue;
    }
    if (/^ {0,3}</u.test(line)) {
      fail('outline/html-block', n, 'HTML blocks/comments are unsupported because they can hide heading-like text.');
    }
    const atx = line.match(/^ {0,3}(#{1,6})(?:[\t ]+(.*)|[\t ]*)$/u);
    if (atx) { add(atx[1].length, (atx[2] || '').replace(/(?:^|[\t ]+)#+[\t ]*$/u, ''), n); continue; }
    const setext = line.match(/^ {0,3}(=+|-+)[\t ]*$/u);
    if (setext && paragraph.length) {
      if (paragraph.length !== 1) fail('outline/multiline-setext', n, 'Only single-line Setext headings are supported.');
      add(setext[1][0] === '=' ? 1 : 2, paragraph[0].text, paragraph[0].line, n, 'setext');
      continue;
    }
    if (/^(?: {4,}|\t| {0,3}>| {0,3}[-+*]\s| {0,3}\d+[.)]\s)/u.test(line)) {
      if (/#|={3,}|-{3,}/u.test(line)) warnings.push({ code: 'outline/container-omitted', line: n, message: 'Indented/list/blockquote content is excluded from the top-level heading outline.' });
      paragraph = []; omitted.push(n); continue;
    }
    if (!line.trim() || setext) paragraph = [];
    else paragraph.push({ text: line.trim(), line: n });
    omitted.push(n);
  }
  if (fence) fail('outline/unclosed-fence', fence.line, 'Close the fenced code block before importing.');
  if (!headings.length) fail('outline/no-headings', 1, 'No supported top-level headings found.');
  if (headings[0].level !== 1) fail('outline/root-level', headings[0].line, 'Start with one H1 root heading.');
  const stack = [], nodes = [], mapping = [];
  for (const h of headings) {
    if (nodes.length && h.level === 1) fail('outline/multiple-roots', h.line, 'Use one H1 root; separate documents require separate outlines.');
    if (h.level > stack.length + 1) fail('outline/level-jump', h.line, 'Heading levels may only deepen by one; add the missing parent.');
    stack.length = h.level - 1;
    const id = `h${nodes.length + 1}`;
    const node = { id, label: h.label, ...(h.level > 1 ? { parent: stack[h.level - 2] } : {}), sublabel: `${path.basename(source)}:${h.line}${h.endLine !== h.line ? `–${h.endLine}` : ''} · H${h.level}` };
    nodes.push(node); mapping.push({ id, ...h }); stack.push(id);
  }
  const headingLines = new Set(headings.flatMap(h => Array.from({ length: h.endLine - h.line + 1 }, (_, i) => h.line + i)));
  const omittedLines = [...new Set(omitted)].filter(n => !headingLines.has(n) && lines[n - 1].trim());
  const revision = sourceUrl.match(/\/blob\/([a-f0-9]{7,40})\//u)?.[1].slice(0, 8);
  const sourceName = sourceUrl ? decodeURIComponent(sourceUrl.split('/').at(-1)) : path.basename(source);
  return {
    tree: { schema_version: 1, diagram_type: 'tree', meta: { title: headings[0].label, subtitle: `${sourceName}${revision ? ` · ${revision}` : ''} · headings only · source lines retained`, output }, layout: { direction: 'right' }, nodes,
      cards: [{ dot: 'slate', title: 'Source and scope', items: [sourceUrl || source, 'Only top-level ATX and single-line Setext headings. Prose and code are intentionally omitted.', 'Line numbers are visible on nodes; editable native JSON and source mapping accompany this artifact.'] }] },
    receipt: { version: 1, experiment: 'markdown-outline', source, sourceUrl, sourceSha256: createHash('sha256').update(text).digest('hex'), scope: 'top-level ATX and single-line Setext heading projection', mapping, omittedNonemptyLines: omittedLines, warnings }
  };
}

export function main(args) {
  if (args.length < 2 || args.length > 3) fail('outline/usage', 1, 'Usage: node outline-to-tree.mjs input.md output.tree.json [pinned-source-url]');
  const [input, output, sourceUrl = ''] = args;
  const text = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(input));
  const result = projectOutline(text, { source: input, sourceUrl, output: path.basename(output).replace(/\.json$/u, '.html') });
  // Exclusive descriptors reject files, hard links, symlinks and input aliases.
  // Cleanup checks inode identity so it never removes a replacement owned by someone else.
  const receiptPath = `${output}.receipt.json`;
  const owned = [];
  try {
    for (const [file, value] of [[output, result.tree], [receiptPath, result.receipt]]) {
      const fd = fs.openSync(file, 'wx');
      const identity = fs.fstatSync(fd);
      owned.push({ file, fd, identity });
      fs.writeFileSync(fd, `${JSON.stringify(value, null, 2)}\n`);
    }
  } catch (error) {
    for (const entry of owned) {
      try {
        const current = fs.lstatSync(entry.file);
        if (current.dev === entry.identity.dev && current.ino === entry.identity.ino) fs.unlinkSync(entry.file);
      } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') error.cleanupError = cleanupError.message; }
    }
    throw error;
  } finally { for (const entry of owned) fs.closeSync(entry.fd); }
  console.log(JSON.stringify({ ok: true, output, receipt: receiptPath, nodes: result.tree.nodes.length, warnings: result.receipt.warnings.length }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(JSON.stringify({ ok: false, code: error.code || 'outline/io', line: error.line || null, message: error.message })); process.exitCode = 1; }
}
