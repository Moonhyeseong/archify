import { constants as C, openSync, fstatSync, readSync, closeSync, lstatSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const UPSTREAM = 'd6fee036379c531369dc37f67f8d4640f6bf1e2d';
export const LIMITS = Object.freeze({ bytes: 131072, nodes: 6000, depth: 14, string: 2000, modules: 8, recipes: 32, dependencies: 4 });
const own = (x, k) => Object.hasOwn(x, k);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const fail = text => { throw new Error(text); };
const NAME = /^[A-Za-z_][A-Za-z0-9_-]{0,23}$/;
const fullName = x => typeof x === 'string' && x.length <= 95 && x.split('::').every(p => NAME.test(p));
const MODULE_FIELDS = 'aliases assignments doc first groups module_path modules recipes settings source unexports warnings'.split(' ');
const RECIPE_FIELDS = 'attributes body dependencies doc name namepath parameters priors private quiet shebang'.split(' ');
const SETTINGS_BOOL = 'allow_duplicate_recipes allow_duplicate_variables default_list default_script dotenv_load dotenv_override dotenv_required export fallback guards ignore_comments lazy lists no_cd no_exit_message positional_arguments quiet unstable windows_powershell'.split(' ');
const SETTINGS_NULL = 'dotenv_filename dotenv_path indentation shell tempdir windows_shell working_directory'.split(' ');
const PARAM_FIELDS = 'default export flag help kind long max min multiple name pattern short value'.split(' ');
function exact(x, fields, label) {
  if (!object(x) || Object.keys(x).length !== fields.length || fields.some(k => !own(x, k))) fail(`${label}: unknown or missing fields (fixed Just subset)`);
}
function nullableString(x) { return x === null || typeof x === 'string'; }
function jsonBounds(x) {
  let count = 0;
  function visit(v, depth) {
    if (++count > LIMITS.nodes || depth > LIMITS.depth) fail('JSON node/depth bound exceeded');
    if (typeof v === 'string' && v.length > LIMITS.string) fail('JSON string bound exceeded');
    if (typeof v === 'number' && !Number.isSafeInteger(v)) fail('Only safe integer metadata is supported');
    if (v === null || ['string','boolean','number'].includes(typeof v)) return;
    if (Array.isArray(v)) { if (v.length > 100) fail('JSON array bound exceeded'); for (const child of v) visit(child, depth + 1); }
    else if (object(v)) { if (Object.keys(v).length > 100) fail('JSON object bound exceeded'); for (const [k, child] of Object.entries(v)) { if (k.length > 100) fail('JSON key bound exceeded'); visit(child, depth + 1); } }
    else fail('Not a JSON value');
  }
  visit(x, 0);
}
function expression(x) {
  if (typeof x === 'string') return;
  if (!Array.isArray(x) || !['evaluate','variable','call','concatenate','list'].includes(x[0])) fail('Unsupported expression serialization; not evaluated');
  const [tag, ...args] = x;
  if (['evaluate','variable'].includes(tag)) { if (args.length !== 1 || typeof args[0] !== 'string' || (tag === 'variable' && !NAME.test(args[0]))) fail('Invalid expression arity'); }
  else if (tag === 'call') { if (typeof args[0] !== 'string' || !NAME.test(args[0])) fail('Invalid call expression'); args.slice(1).forEach(expression); }
  else { if (tag === 'concatenate' && args.length !== 2) fail('Invalid concatenate expression'); args.forEach(expression); }
}
export function project(dump, target) {
  jsonBounds(dump);
  if (!fullName(target)) fail('Target must be an explicit qualified recipe name');
  const recipes = new Map(), modules = [];
  function module(m, context) {
    exact(m, MODULE_FIELDS, 'Module');
    if (m.module_path !== context) fail('module_path disagrees with nesting');
    modules.push(context);
    if (modules.length > LIMITS.modules) fail('Module count bound exceeded');
    if (!nullableString(m.doc) || !nullableString(m.first) || typeof m.source !== 'string') fail('Invalid module metadata');
    for (const k of ['groups','unexports','warnings']) if (!Array.isArray(m[k]) || m[k].some(x => typeof x !== 'string')) fail(`Invalid ${k}`);
    for (const k of ['recipes','modules','aliases','assignments']) if (!object(m[k])) fail(`Invalid ${k} map`);
    if (Object.keys(m.aliases).length || Object.keys(m.assignments).length) fail('Aliases and assignments are unsupported; provide a narrower frozen dump');
    exact(m.settings, [...SETTINGS_BOOL,...SETTINGS_NULL,'dotenv_command'], 'Settings');
    if (SETTINGS_BOOL.some(k => typeof m.settings[k] !== 'boolean') || SETTINGS_NULL.some(k => m.settings[k] !== null) || !Array.isArray(m.settings.dotenv_command) || m.settings.dotenv_command.length) fail('Only boolean settings plus null optional settings and empty dotenv_command are supported');
    for (const [key, r] of Object.entries(m.recipes)) {
      if (!NAME.test(key)) fail('Recipe name outside the ASCII subset');
      exact(r, RECIPE_FIELDS, 'Recipe');
      const qualified = context ? `${context}::${key}` : key;
      if (!fullName(qualified) || r.name !== key || r.namepath !== qualified) fail('Recipe namepath disagrees with module identity');
      if (recipes.has(qualified) || recipes.size >= LIMITS.recipes) fail('Duplicate recipe or recipe count bound exceeded');
      if (!nullableString(r.doc) || ['private','quiet','shebang'].some(k => typeof r[k] !== 'boolean')) fail('Invalid recipe metadata');
      if (!Array.isArray(r.attributes) || r.attributes.length) fail('Recipe attributes are unsupported; scheduling modes remain unexpanded');
      if (!Array.isArray(r.parameters)) fail('Invalid parameters');
      for (const p of r.parameters) { exact(p, PARAM_FIELDS, 'Parameter'); if (typeof p.name !== 'string' || !NAME.test(p.name) || !['singular','star','plus'].includes(p.kind) || ['export','flag','multiple'].some(k => typeof p[k] !== 'boolean') || ['default','help','long','short','value'].some(k => !nullableString(p[k])) || ['min','max'].some(k => p[k] !== null && (!Number.isSafeInteger(p[k]) || p[k] < 0)) || (p.pattern !== null && (!Array.isArray(p.pattern) || p.pattern.some(x => typeof x !== 'string')))) fail('Unsupported parameter shape'); }
      if (!Array.isArray(r.body) || r.body.length > 20) fail('Body line bound exceeded');
      for (const line of r.body) { if (!Array.isArray(line)) fail('Body line must be a fragment array'); for (const fragment of line) if (typeof fragment !== 'string') { if (!Array.isArray(fragment) || fragment.length !== 1) fail('Interpolation must wrap exactly one expression'); expression(fragment[0]); } }
      if (!Array.isArray(r.dependencies) || r.dependencies.length > LIMITS.dependencies || !Number.isSafeInteger(r.priors) || r.priors < 0 || r.priors > r.dependencies.length) fail('Invalid priors or dependency bound exceeded');
      const dependencies = r.dependencies.map((d, index) => {
        exact(d, ['arguments','recipe','star'], 'Dependency');
        if (!fullName(d.recipe) || !Array.isArray(d.arguments)) fail('Invalid dependency path or arguments');
        d.arguments.forEach(expression);
        if (d.star !== null && (!Number.isSafeInteger(d.star) || d.star < 0 || d.star >= d.arguments.length)) fail('Star index must reference an existing argument');
        return { index, stage: index < r.priors ? 'before' : 'after', recipe: d.recipe, qualified: context ? `${context}::${d.recipe}` : d.recipe, arguments: d.arguments, star: d.star, expansion: d.arguments.length || d.star !== null ? 'not-expanded' : 'no-arguments' };
      });
      recipes.set(qualified, { namepath: qualified, module: context, priors: r.priors, dependencies, body: r.body, parameters: r.parameters });
    }
    for (const [key, child] of Object.entries(m.modules)) { if (!NAME.test(key)) fail('Module name outside supported subset'); module(child, context ? `${context}::${key}` : key); }
    if (m.first !== null && !own(m.recipes, m.first)) fail('first must name a local dumped recipe');
  }
  module(dump, '');
  for (const r of recipes.values()) for (const d of r.dependencies) if (!recipes.has(d.qualified)) fail(`Missing dependency: ${d.qualified}`);
  const active = new Set(), done = new Set();
  function cycle(name) { if (active.has(name)) fail(`Dependency cycle: ${name}`); if (done.has(name)) return; active.add(name); for (const d of recipes.get(name).dependencies) cycle(d.qualified); active.delete(name); done.add(name); }
  for (const name of recipes.keys()) cycle(name);
  if (!recipes.has(target)) fail('Target recipe is absent from the frozen dump');
  const r = recipes.get(target);
  return { format: 'recipe-stages-lab/1', upstreamCommit: UPSTREAM, selected: r, before: r.dependencies.filter(d => d.stage === 'before'), after: r.dependencies.filter(d => d.stage === 'after'), inventory: [...recipes.keys()].sort(), coverage: { sourceRecipes: 'unknown: disabled_recipes omitted by Just serialization', absentModules: 'unknown: absent_modules omitted by Just serialization', execution: 'not-run', expressions: 'not-evaluated', dependentBodies: 'not-expanded', schedulingWithinGroups: 'not-modeled', invocationArguments: 'not-expanded', inspectedDumpRecipes: recipes.size, inspectedDumpModules: modules.length } };
}
const json = v => JSON.stringify(v, null, 2).replaceAll('`','\\u0060').replaceAll('<','\\u003c').replaceAll('>','\\u003e');
const literal = s => '`' + String(s).replace(/[\u0000-\u001f\u007f\u2028\u2029`]/gu,c=>`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).replaceAll('\\','\\\\').replaceAll('|','\\|') + '`';
export function documents(p) {
  const workflow = { schema_version: 2, diagram_type: 'workflow', meta: { title: `Recipe stages: ${p.selected.namepath}`, subtitle: `priors=${p.selected.priors}; frozen dump; no execution`, output: 'stages.html', animation: 'none' }, lanes: [{ id: 'recipe', label: 'Declared phase grouping; no order inferred within each group' }], nodes: [{ id:'before',lane:'recipe',col:0,type:'backend',label:`Before body: ${p.before.length} calls`,width:200,height:84 }, {id:'body',lane:'recipe',col:1,type:'backend',label:p.selected.namepath,width:200,height:84}, {id:'after',lane:'recipe',col:2,type:'backend',label:`After body: ${p.after.length} calls`,width:200,height:84}], edges: [{from:'before',to:'body',label:'phase boundary'}, {from:'body',to:'after',label:'phase boundary'}], cards: [{dot:'emerald',title:'Before body: qualified calls',items:p.before.length?p.before.map(d=>d.qualified):['No calls in this phase']},{dot:'orange',title:'After body: qualified calls',items:p.after.length?p.after.map(d=>d.qualified):['No calls in this phase']},{dot:'orange',title:'Coverage is bounded',items:['Dump recipes only; disabled recipes unknown','No Just, shell, env or backtick evaluation','Group membership only, not a runtime trace']}] };
  const lines = [`# What changes when priors is ${p.selected.priors}? {#recipe-stages}`, '', `${p.selected.namepath} has ${p.before.length} dependency calls before its body and ${p.after.length} after it. The frozen dump is read without executing Just, shell commands or expressions. Bundled examples use original synthetic data.`, '', '@answer scope="Pinned Just JSON subset; declared stages only; source coverage unknown"', '', '## Where does the recipe body sit? {#stages}', '', 'Each side is a dependency group. The arrows connect phases; they do not assert an edge, scheduling order or concurrency between recipes within a group.', '', '@diagram workflow id=recipe-phases source=stages.workflow.json title="Before, body, after from the explicit priors boundary"', '', '## Which dependency is in each group? {#calls}', '', '| Entry | Stage | Qualified identity | Raw dependency recipe | Arguments | Star | Expansion |', '| --- | --- | --- | --- | --- | --- | --- |'];
  for (const d of p.selected.dependencies) lines.push(`| dependency-${d.index} | ${literal(d.stage)} | ${literal(d.qualified)} | ${literal(d.recipe)} | ${literal(JSON.stringify(d.arguments))} | ${literal(JSON.stringify(d.star))} | ${literal(d.expansion)} |`);
  if (!p.selected.dependencies.length) lines.push('| no-calls | empty | None | None | None | None | Not applicable |');
  lines.push('', '## What is known and what remains unexpanded? {#coverage}', '', '- All recipes present in the accepted frozen dump are indexed with module-qualified identity.', '- Source coverage is unknown: Just omits disabled_recipes and absent_modules from this dump format.', '- Bodies, parameters, dependency arguments, shell text, backticks and env calls are never executed or evaluated.', '- This page does not model scheduler behavior, failure recovery, argument expansion or nested dependency bodies.', '', '## Preserve the selected dependency projection {#projection}', '', 'The ordered dependency list and priors value are reproduced as JSON. This is the selected recipe projection, not a complete Justfile dump or execution log.', '', '```json', json(p.selected), '```', '', '## Which dumped recipe identities remain distinct? {#inventory}', '', 'No short names are merged across modules. Source paths and settings are not copied into the public page.', '', '```json', json(p.inventory), '```');
  return { 'projection.json':json(p)+'\n', 'stages.workflow.json':json(workflow)+'\n', 'review.archify.md':lines.join('\n')+'\n' };
}
export function generate(inputPath, target, outputPath) {
  const fd = openSync(inputPath,C.O_RDONLY|C.O_NOFOLLOW|C.O_NONBLOCK); let raw;
  try { const st=fstatSync(fd); if(!st.isFile()||st.size>LIMITS.bytes)fail('Input must be a regular file at most 128 KiB');const buffer=Buffer.alloc(LIMITS.bytes+1);let n,size=0;while(size<buffer.length&&(n=readSync(fd,buffer,size,buffer.length-size,null)))size+=n;if(size>LIMITS.bytes)fail('Input grew beyond bound');raw=buffer.subarray(0,size); }finally{closeSync(fd);}
  const p=project(JSON.parse(raw.toString('utf8')),target),docs=documents(p);p.inputSha256=createHash('sha256').update(raw).digest('hex');docs['projection.json']=json(p)+'\n';
  if(Object.values(docs).some(x=>Buffer.byteLength(x)>1024*1024))fail('Generated document exceeds 1 MiB');
  const out=path.resolve(outputPath);for(let ancestor=path.dirname(out);;ancestor=path.dirname(ancestor)){const st=lstatSync(ancestor);if(!st.isDirectory()||st.isSymbolicLink())fail('Output ancestors must be real directories');if(ancestor===path.dirname(ancestor))break;}
  mkdirSync(out,{mode:0o700});for(const [name,data]of Object.entries(docs))writeFileSync(path.join(out,name),data,{flag:'wx',mode:0o600});
  return {before:p.before.length,after:p.after.length,inputSha256:p.inputSha256};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.length!==5)fail('Usage: node convert.mjs dump.json qualified-recipe NEW_OUTPUT_DIRECTORY');console.log(JSON.stringify(generate(...process.argv.slice(2))));}catch(error){console.error(error.message);process.exitCode=1;}
