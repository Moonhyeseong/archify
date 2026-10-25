import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const hash = value => createHash('sha256').update(value).digest('hex');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = value => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value);
const target = (note, kind) => `expnote-${note.blockId}-${kind}-${kind === 'line' ? note.originalLine : note.noteId}`;

// This is an experiment-only transformation of one frozen normal CLI output.
// No public renderer, schema, source blob or embedded prepared input changes.
export function buildCandidate(baseline, sidecar, source) {
  const sourceSha256 = hash(source);
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) || [];
  const notes = sidecar.notes.map(note => ({...note, reasons:[]}));
  for (const note of notes) {
    if (![note.noteId,note.blockId,note.noteBlockId,note.sourceId].every(safe)) note.reasons.push('标识无效');
    if (sidecar.sourceId !== note.sourceId) note.reasons.push('来源标识不符');
    if (sidecar.sourceSha256 !== sourceSha256 || note.sourceSha256 !== sourceSha256) note.reasons.push('源码摘要不符');
    if (!Number.isSafeInteger(note.originalLine) || note.originalLine < 1 || note.originalLine > lines.length) note.reasons.push('行号越界');
    if (notes.filter(other => other.noteId === note.noteId).length !== 1) note.reasons.push('注释标识重复');
    if (notes.filter(other => other.blockId === note.blockId && other.originalLine === note.originalLine).length !== 1) note.reasons.push('同一片段的行绑定重复');
    if (notes.filter(other => other.noteBlockId === note.noteBlockId).length !== 1) note.reasons.push('解释块绑定重复');
    if (safe(note.blockId) && !baseline.includes(`id="${note.blockId}" data-block-type="snippet"`)) note.reasons.push('片段不存在');
    if (safe(note.noteBlockId) && !baseline.includes(`id="${note.noteBlockId}" data-block-type="prose"`)) note.reasons.push('解释块不存在');
  }
  let html = baseline;
  const blockIds = [...new Set(notes.filter(note=>safe(note.blockId)).map(note=>note.blockId))];
  for (const blockId of blockIds) {
    const pattern = new RegExp(`(<div class="block block-snippet" id="${blockId}" data-block-type="snippet">)([\\s\\S]*?)(</div>)`);
    if (!pattern.test(html)) continue;
    html = html.replace(pattern, (_,open,body,close) => {
      const code = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/.exec(body);
      if (!code || code[1] !== escape(source)) throw new Error(`${blockId}: displayed complete source differs from frozen blob`);
      const valid = notes.filter(note=>note.blockId===blockId && !note.reasons.length);
      const gutter = lines.map((line,index) => {
        const note = valid.find(note=>note.originalLine===index+1);
        return `<div class="expnote-gutter-row">${note ? `<a data-expnote-link href="#${target(note,'note')}" aria-label="查看${escape(note.label)}解释，${blockId}第${index+1}行">${index+1} ${escape(note.label)}</a>` : `<span aria-hidden="true">${index+1}</span>`}</div>`;
      }).join('');
      const codeLines = lines.map((line,index) => {
        const note = valid.find(note=>note.originalLine===index+1);
        const lf = line.endsWith('\n') ? '\n' : '';
        return `<span data-expnote-line="${index+1}"${note ? ` class="expnote-target" id="${target(note,'line')}" tabindex="-1"` : ''}>${escape(lf ? line.slice(0,-1) : line)}</span>${lf}`;
      }).join('');
      const replacement = `<div class="expnote-code-layout" data-expnote-occurrence="${blockId}" data-expnote-source-sha256="${sourceSha256}"><div class="expnote-gutter" aria-label="${blockId}行注释">${gutter}</div><pre><code class="language-js">${codeLines}</code></pre></div>`;
      return open + body.replace(code[0],replacement) + close;
    });
  }
  for (const note of notes.filter(note=>safe(note.noteBlockId))) {
    const pattern = new RegExp(`(<div class="block block-prose" id="${note.noteBlockId}" data-block-type="prose">)([\\s\\S]*?)(</div>)`);
    html = html.replace(pattern,(_,open,body,close) => open +
      `<div class="expnote-note${note.reasons.length ? ' expnote-invalid' : ' expnote-target'}" data-expnote-status="${note.reasons.length ? 'invalid' : 'valid'}"${note.reasons.length ? '' : ` id="${target(note,'note')}" tabindex="-1"`}>` + body +
      (note.reasons.length ? `<p class="expnote-status">引用无效：${escape(note.reasons.join('、'))}。保留解释，未建立跳转。</p>` : `<a class="expnote-return" data-expnote-link href="#${target(note,'line')}">返回 ${note.blockId === 'snippet-a' ? '片段 A' : '片段 B'} 第 ${note.originalLine} 行 ↑</a>`) + '</div>' + close);
  }
  const style = `<style id="expnote-styles">
.expnote-banner{margin:10px 0 20px;padding:9px 12px;border:1px solid var(--rule);border-radius:8px;background:var(--sunk);font-size:12px;color:var(--secondary)}
.expnote-code-layout{display:grid;grid-template-columns:4.5em minmax(0,1fr);min-width:0}
.expnote-gutter{padding:12px 0;font:12.5px/1.7 var(--mono);text-align:right;border-right:1px solid var(--rule);user-select:none}
.expnote-gutter-row{height:1.7em;padding-right:.6em;white-space:nowrap}
.expnote-gutter a{font-weight:650;text-decoration:underline;text-underline-offset:3px}
.expnote-gutter span{color:var(--faint)}
.expnote-code-layout pre{min-width:0;overflow:auto}
.expnote-target{scroll-margin-top:110px}
.expnote-target:target,.expnote-target:focus{background:color-mix(in srgb,var(--accent) 12%,var(--panel));outline:2px solid var(--accent);outline-offset:3px}
.expnote-note{padding:10px 12px;border-left:3px solid var(--rule);border-radius:5px;background:var(--sunk)}
.expnote-return{display:inline-block;font-size:12px;margin-top:6px}.expnote-status{font-size:12px;color:var(--secondary)}
</style>`;
  const runtime = `<script id="expnote-runtime">
(() => {
  const focusTarget = () => {
    if (!location.hash.startsWith('#expnote-')) return;
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.classList.contains('expnote-target')) return;
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'center',inline:'nearest'});
  };
  // Native fragment navigation owns the hash and history. No push/replaceState.
  addEventListener('hashchange',focusTarget);
  document.addEventListener('click',event=>{
    const link = event.target.closest('a[data-expnote-link]');
    // A different fragment gets one focus change from hashchange. Only a
    // same-fragment click needs a callback (it emits no hashchange).
    if (link && link.hash === location.hash) setTimeout(focusTarget,0);
  });
  if (location.hash.startsWith('#expnote-')) requestAnimationFrame(focusTarget);
})();
</script>`;
  html = html.replace('</head>',style+'</head>').replace('<main', '<div class="expnote-banner">实验后处理候选 · 点行号旁的编号读解释，再点“返回”回到该行。</div><main');
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd < 0) throw new Error('Missing closing document body');
  html = html.slice(0,bodyEnd) + runtime + html.slice(bodyEnd);
  return {html, audit:{sourceSha256,lines:lines.length,notes:notes.map(({noteId,blockId,originalLine,reasons})=>({noteId,blockId,originalLine,status:reasons.length?'invalid':'valid',reasons}))}};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const baseline = fs.readFileSync(path.join(directory,'baseline.html'),'utf8');
  const sidecar = JSON.parse(fs.readFileSync(path.join(directory,'input/notes.json'),'utf8'));
  const source = fs.readFileSync(path.join(directory,sidecar.sourcePath),'utf8');
  const result = buildCandidate(baseline,sidecar,source);
  fs.writeFileSync(path.join(directory,'candidate.html'),result.html);
  process.stdout.write(JSON.stringify({method:'experiment-only HTML post-processing; not normal finalize output',baselineSha256:hash(baseline),candidateSha256:hash(result.html),...result.audit})+'\n');
}
