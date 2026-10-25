import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const ID = /^[a-z][a-z0-9-]{0,39}$/;
const LIMIT = 2 * 1024 * 1024;
const inline = value => String(value).replace(/[\\`*_[\]()!<>~|]/g, character => '\\' + character);
const digest = text => createHash('sha256').update(text).digest('hex');
const fail = message => { throw new Error(message); };
const text = (value, name, max = 4000) => typeof value === 'string' && value.trim() && value.length <= max ? value : fail(`Invalid ${name}`);

// Same trust boundary as repository evidence: raw local objects, no checkout/fetch.
// Also remove inherited repository selectors and config injection, including replacements.
export function git(repo, args) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: process.platform === 'win32' ? 'NUL' : '/dev/null',
    GIT_NO_LAZY_FETCH: '1', GIT_ALLOW_PROTOCOL: '', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', LC_ALL: 'C' });
  const result = spawnSync('git', ['--no-pager', '--no-replace-objects', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-C', repo, ...args],
    { env, maxBuffer: LIMIT, timeout: 15000, windowsHide: true });
  if (result.error || result.status !== 0) fail(`Git object read failed (${args[0]}): ${result.error?.code || result.status}`);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(result.stdout); }
  catch { fail('Unsupported non-UTF-8 Git content'); }
}

export function checkPath(value) {
  text(value, 'repository-relative path', 1000);
  if (/^[a-z]:/i.test(value) || value.startsWith('/') || /[\\\u0000-\u001f\u007f]/.test(value) || value.split('/').some(p => !p || p === '.' || p === '..' || p.toLowerCase() === '.git')) fail('Unsafe repository-relative path');
  return value;
}

function validate(review) {
  if (!review || review.version !== 1) fail('Expected review version 1');
  if (!SHA.test(review.base) || !SHA.test(review.head) || review.base === review.head) fail('Use two distinct full lowercase 40-character commit SHAs');
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(review.repository)) fail('Use a public GitHub repository URL without credentials/query');
  text(review.title, 'title', 160); text(review.author, 'statement author', 160);
  if (!Array.isArray(review.nodes) || review.nodes.length < 1 || review.nodes.length > 20) fail('Expected 1–20 declared nodes');
  const ids = new Set();
  for (const node of review.nodes) {
    if (!ID.test(node.id) || ids.has(node.id)) fail('Invalid or duplicate node ID');
    ids.add(node.id); text(node.label, 'node label', 100); text(node.why, 'agent statement');
    const r = node.ref;
    if (!r || !['base', 'head'].includes(r.side)) fail('Reference side must be base or head');
    checkPath(r.path);
    if (!Number.isSafeInteger(r.start) || !Number.isSafeInteger(r.end) || r.start < 1 || r.end < r.start || r.end - r.start > 200) fail('Invalid or excessively broad line range (max 201 lines)');
  }
  if (!Array.isArray(review.edges) || review.edges.length > 30) fail('Expected at most 30 declared edges');
  for (const edge of review.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) fail('Invalid edge endpoint');
    text(edge.label, 'declared relation', 100);
  }
}

function blob(repo, revision, file) {
  const entry = git(repo, ['ls-tree', '--full-tree', '-z', revision, '--', `:(top,literal)${file}`]);
  if (!entry) return { status: 'missing' };
  const match = entry.match(/^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)\0$/);
  if (!match || match[3] !== file) return { status: 'unsupported', reason: 'Not a regular file (symlink, submodule or directory)' };
  const size = Number(git(repo, ['cat-file', '-s', match[2]]).trim());
  if (size > 1024 * 1024) return { status: 'unsupported', reason: 'Blob exceeds 1 MiB experiment limit' };
  const content = git(repo, ['cat-file', 'blob', match[2]]);
  if (content.includes('\0')) return { status: 'unsupported', reason: 'Binary blob' };
  const lines = content.split('\n');
  if (content.endsWith('\n')) lines.pop();
  if (!content) lines.length = 0;
  return { status: 'read', content, lines, sha256: digest(content) };
}

// Parse only hunk headers and changed lines; paths come from NUL-separated Git output.
function parseHunks(patch, file) {
  const hunks = [];
  let current;
  for (const line of patch.split('\n')) {
    const header = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (header) {
      current = { id: `${file}:${hunks.length + 1}`, path: file,
        base: { start: Number(header[1]), count: Number(header[2] ?? 1) },
        head: { start: Number(header[3]), count: Number(header[4] ?? 1) }, diff: line, explainedBy: [], changed: { base: [], head: [] } };
      hunks.push(current);
    } else if (current && (/^[+\- ]/.test(line) || line.startsWith('\\ No newline'))) {
      current.diff += '\n' + line;
    }
  }
  for (const hunk of hunks) {
    let oldLine = hunk.base.start, newLine = hunk.head.start;
    for (const line of hunk.diff.split('\n').slice(1)) {
      if (line.startsWith('-')) hunk.changed.base.push(oldLine++);
      else if (line.startsWith('+')) hunk.changed.head.push(newLine++);
      else if (line.startsWith(' ')) { oldLine++; newLine++; }
    }
  }
  return hunks;
}

export function mapReview(repo, review) {
  validate(review);
  for (const revision of [review.base, review.head]) {
    if (git(repo, ['rev-parse', '--verify', `${revision}^{commit}`]).trim() !== revision) fail('Commit unavailable or not a commit object');
  }
  const paths = git(repo, ['diff', '--ignore-submodules=none', '--no-relative', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-only', '-z', review.base, review.head, '--']).split('\0').filter(Boolean);
  if (!paths.length || paths.length > 30) fail('Expected 1–30 changed files');
  const files = paths.map(file => {
    checkPath(file);
    const states = { base: blob(repo, review.base, file), head: blob(repo, review.head, file) };
    const unsupported = Object.values(states).find(value => value.status === 'unsupported');
    const patch = git(repo, ['diff', '--ignore-submodules=none', '--no-relative', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color', '--unified=0', '--inter-hunk-context=0', '--diff-algorithm=myers', '--no-indent-heuristic', review.base, review.head, '--', `:(top,literal)${file}`]);
    const hunks = unsupported ? [] : parseHunks(patch, file);
    return { path: file, states, hunks, unsupported: unsupported?.reason || (!hunks.length ? 'No text hunks (mode-only change or binary diff attributes)' : null) };
  });
  const hunks = files.flatMap(file => file.hunks);
  if (hunks.some(h => h.diff.length > 18000)) fail('A hunk exceeds the 18000-character display limit');
  if (hunks.length > 60) fail('At most 60 hunks supported by this experiment');
  const nodes = review.nodes.map(node => {
    const { ref } = node;
    const file = files.find(file => file.path === ref.path);
    const state = file?.states[ref.side];
    const matched = hunks.filter(hunk => hunk.path === ref.path && hunk.changed[ref.side].some(line => line >= ref.start && line <= ref.end));
    const status = !file ? 'mismatch' : !state || state.status !== 'read' || file.unsupported ? 'unavailable' : ref.end > state.lines.length || !matched.length ? 'mismatch' : 'reference-matches';
    if (status === 'reference-matches') for (const hunk of matched) hunk.explainedBy.push(node.id);
    const reason = status === 'reference-matches' ? 'Range contains changed lines in the stated Git side. Semantic meaning and test results are not checked.'
      : !file ? 'Referenced path is not changed between these commits.' : state?.status === 'missing' ? 'File does not exist on the stated side.'
        : file.unsupported || state?.reason || (ref.end > state?.lines?.length ? 'Range exceeds the Git blob.' : 'Range contains no changed line.');
    return { ...node, status, reason, matchedHunks: status === 'reference-matches' ? matched.map(h => h.id) : [],
      excerpt: status === 'reference-matches' ? state.lines.slice(ref.start - 1, ref.end).join('\n') : null,
      blobSha256: state?.sha256 || null };
  });
  // A touched hunk is not fully explained until every changed line on BOTH sides
  // is covered. Deletions and additions are separate evidence, never interchangeable.
  for (const hunk of hunks) {
    const covers = (side, line) => nodes.some(node => node.status === 'reference-matches' && node.ref.path === hunk.path && node.ref.side === side && node.ref.start <= line && line <= node.ref.end);
    hunk.unexplainedLines = Object.fromEntries(['base', 'head'].map(side => [side, hunk.changed[side].filter(line => !covers(side, line))]));
    hunk.coverage = !hunk.explainedBy.length ? 'unexplained' : Object.values(hunk.unexplainedLines).some(lines => lines.length) ? 'partial' : 'range-accounted';
  }
  const unresolvedFiles = files.filter(file => file.unsupported).map(file => ({ path: file.path, reason: file.unsupported }));
  const report = { version: 1, experiment: 'task-review-map', repository: review.repository, base: review.base, head: review.head,
    reviewSha256: digest(JSON.stringify(review)), repositoryIdentity: 'Author-declared public URL; remote object availability is not checked or authenticated.', statementAuthor: review.author,
    scope: 'Local committed objects only; no checkout, fetch, AST or test execution. Renames are delete/add.',
    meaning: 'reference-matches means changed-line reference agreement only. Why and relations remain agent statements. range-accounted is not semantic completeness or test coverage.',
    nodes, edges: review.edges, hunks, unresolvedFiles,
    summary: { files: files.length, hunks: hunks.length, referenceMatches: nodes.filter(n => n.status === 'reference-matches').length,
      invalidReferences: nodes.filter(n => n.status !== 'reference-matches').length,
      unexplainedHunks: hunks.filter(h => h.coverage !== 'range-accounted').length, unresolvedFiles: unresolvedFiles.length },
    testExecution: 'not-run' };
  report.mappingComplete = !report.summary.invalidReferences && !report.summary.unexplainedHunks && !unresolvedFiles.length;
  return report;
}

export function toExplainer(review, report) {
  const prose = (id, value) => ({ id, type: 'prose', text: inline(value) });
  const link = (file, side, start, end) => `${review.repository}/blob/${review[side]}/${file.split('/').map(part => encodeURIComponent(part).replace(/[!'()*]/g, character => '%' + character.charCodeAt(0).toString(16).toUpperCase())).join('/')}#L${start}-L${end}`;
  const diagram = { schema_version: 1, diagram_type: 'architecture', meta: { output: 'change-map.html', title: '声明的变更关系 · 点击节点读 why', subtitle: '关系由 Agent 编写，未通过静态或运行分析验证' },
    components: review.nodes.map((node, i) => ({ id: node.id, type: 'backend', label: node.label, sublabel: 'Agent 声明', pos: [40 + (i % 3) * 380, 60 + Math.floor(i / 3) * 180], size: [240, 86] })),
    connections: review.edges.map(edge => ({ from: edge.from, to: edge.to, label: edge.label })) };
  const nodeBlocks = Object.fromEntries(review.nodes.map(node => [node.id, `why-${node.id}`]));
  const panels = [{ id: 'map', title: '先看这次改动，再看尚未解释的部分', span: 12, blocks: [
    { id: 'warning', type: 'callout', level: 'warning', title: '引用吻合 ≠ 语义正确 ≠ 测试通过', text: inline(`why 与关系均为 ${review.author} 的声明；本工具只核对固定 Git 对象和变更行。测试：未执行。`) },
    prose('overview', `${report.summary.files} 个文件 · ${report.summary.hunks} 个 hunk · ${report.summary.referenceMatches} 个引用吻合 · ${report.summary.invalidReferences} 个无效引用 · ${report.summary.unexplainedHunks} 个未完整解释 hunk · ${report.summary.unresolvedFiles} 个不支持的文件。`),
    { id: 'change-map', type: 'diagram', diagramType: 'architecture', spec: diagram, nodeBlocks },
    { id: 'tour', type: 'steps', items: report.nodes.map(node => ({ id: `step-${node.id}`, text: inline(node.label), detail: inline(`${node.status} · ${node.why}`), target: { diagram: 'change-map', node: node.id } })) }
  ] }];
  for (const node of report.nodes) {
    const blocks = [prose(`why-${node.id}`, `Agent 声明（${review.author}）：${node.why}`),
      { id: `status-${node.id}`, type: 'callout', level: node.status === 'reference-matches' ? 'note' : 'warning', title: node.status === 'reference-matches' ? '引用吻合' : '引用未吻合', text: inline(`${node.reason} 引用：${node.ref.side}:${node.ref.path}:${node.ref.start}–${node.ref.end}。`) }];
    if (node.excerpt !== null) blocks.push({ id: `code-${node.id}`, type: 'snippet', title: inline(`${node.ref.side} · ${node.ref.path} · L${node.ref.start}–L${node.ref.end}`), language: 'text', text: node.excerpt || '(empty line)' },
      { id: `link-${node.id}`, type: 'prose', text: `[查看固定 revision 的源码](${link(node.ref.path, node.ref.side, node.ref.start, node.ref.end)})` });
    for (const [i, hunkId] of node.matchedHunks.entries()) {
      const hunk = report.hunks.find(h => h.id === hunkId);
      blocks.push({ id: `diff-${node.id}-${i}`, type: 'diff', caption: inline(`真实 Git diff · ${hunk.path} · ${hunk.coverage}`), text: hunk.diff });
    }
    panels.push({ id: `node-${node.id}`, title: node.label, span: 12, blocks });
  }
  const gaps = report.hunks.filter(h => h.coverage !== 'range-accounted');
  panels.push({ id: 'unexplained', title: `尚未解释 · ${gaps.length} 个 hunk`, span: 12, blocks: [
    prose('gap-meaning', '范围记账要求 base 的删除行与 head 的新增行都被声明覆盖。范围覆盖不衡量解释质量；请审查 why 是否准确。'),
    ...(gaps.length || report.unresolvedFiles.length ? [] : [prose('no-gaps', '未发现范围记账缺口；仍需人工审查语义与真实执行证据。')]),
    ...gaps.map((h, i) => ({ id: `gap-${i}`, type: 'diff', caption: inline(`${h.path} · ${h.coverage} · 未解释 base 行 ${h.unexplainedLines.base.join(',') || '无'}；head 行 ${h.unexplainedLines.head.join(',') || '无'}`), text: h.diff })),
    ...report.unresolvedFiles.map((file, i) => ({ id: `unsupported-${i}`, type: 'callout', level: 'warning', text: inline(`${file.path}: ${file.reason}`) }))
  ] });
  return { schema_version: 1, diagram_type: 'explainer', meta: { id: 'task-review-map', title: review.title, locale: 'zh-CN', style: 'clean' },
    answer: { summary: report.mappingComplete ? '变更范围已记账，代码仍待审阅。' : '这次改动仍有待解释或核对的部分。',
      reasons: ['点击图中节点查看 Agent 的 why，下面保留真实 Git diff。', '先处理未解释 hunk，再判断声明是否正确。', '本实验未执行历史测试，不表示变更已通过验收。'],
      scope: `${review.repository.slice('https://github.com/'.length)} · 作者声明 · ${review.base.slice(0, 8)} → ${review.head.slice(0, 8)}` }, panels, sources: [] };
}

export function build(repo, reviewPath, output) {
  if (fs.statSync(reviewPath).size > LIMIT) fail('Review JSON exceeds 2 MiB limit');
  const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
  const report = mapReview(repo, review);
  if (report.nodes.some(n => n.excerpt?.length > 18000)) fail('An excerpt exceeds the 18000-character display limit');
  const explainer = toExplainer(review, report);
  // Refuse any existing destination, including aliases/symlinks. Every write is
  // exclusive; rollback touches only files this invocation successfully created.
  fs.mkdirSync(output);
  const owned = [];
  try {
    const payloads = {
      'mapping.json': report,
      'explainer.json': explainer,
      'diagram.json': explainer.panels[0].blocks.find(b => b.type === 'diagram').spec
    };
    for (const [name, value] of Object.entries(payloads)) {
      const destination = path.join(output, name);
      const descriptor = fs.openSync(destination, 'wx');
      try {
        const identity = fs.fstatSync(descriptor);
        owned.push({ destination, dev: identity.dev, ino: identity.ino });
        fs.writeFileSync(descriptor, JSON.stringify(value, null, 2) + '\n');
      } finally { fs.closeSync(descriptor); }
    }
  } catch (error) {
    for (const item of owned) {
      try {
        const current = fs.lstatSync(item.destination);
        if (current.isFile() && current.dev === item.dev && current.ino === item.ino) fs.unlinkSync(item.destination);
      } catch { /* Preserve indeterminate paths. */ }
    }
    try { fs.rmdirSync(output); } catch { /* Keep anything not owned by this run. */ }
    throw error;
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [repo, reviewFile, output, ...extra] = process.argv.slice(2);
    if (!repo || !reviewFile || !output || extra.length) fail('Usage: node review-map.mjs <local-repo> <review.json> <output-directory>');
    const report = build(repo, reviewFile, output);
    console.log(JSON.stringify(report.summary));
    process.exitCode = report.mappingComplete ? 0 : 1;
  } catch (error) {
    console.error(JSON.stringify({ status: 'failed', message: error.message }));
    process.exitCode = 2;
  }
}
