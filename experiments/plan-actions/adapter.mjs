import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
export const contract={repository:'https://github.com/hashicorp/terraform-json',commit:'8f4894d138d0fe71436cba6dbc8f16577e9a9e7d',license:'MPL-2.0',files:['plan.go','action.go']};
const has=(o,k)=>Object.hasOwn(o,k);
const fail=message=>{throw new Error(message);};
function object(v,where){if(!v||typeof v!=='object'||Array.isArray(v))fail(`${where}: expected object`);}
function literal(v,where,max=300){if(typeof v!=='string'||!v.trim()||v.length>max||/[\x00-\x1f\x7f]/u.test(v)||!v.isWellFormed())fail(`${where}: invalid metadata string`);return v;}
function array(v,where,max){if(!Array.isArray(v)||v.length>max)fail(`${where}: expected array of at most ${max} entries`);return v;}
const actionSets=new Set(['no-op','create','read','update','delete','forget','delete,create','create,delete']);
function actions(v,where){array(v,where,2);if(!v.every(x=>['no-op','create','read','update','delete','forget'].includes(x))||!actionSets.has(v.join(',')))fail(`${where}: unsupported action sequence`);return [...v];}
function pathPart(v,where){if(typeof v==='string')return literal(v,where,200);if(Number.isSafeInteger(v)&&v>=0)return v;fail(`${where}: path segments must be strings or nonnegative safe integers`);}
function maskPaths(v,where){
 const result=[];let visited=0;
 function visit(x,p,depth){if(++visited>5000||depth>12)fail(`${where}: mask complexity limit`);if(x===true){result.push(p);return;}if(x===false)return;if(x===null||typeof x!=='object')fail(`${where}: invalid boolean mask`);for(const [k,c] of Object.entries(x)){const part=Array.isArray(x)?Number(k):pathPart(k,where);visit(c,[...p,part],depth+1);}}
 visit(v,[],0);return result;
}
const prefix=(a,b)=>a.length<=b.length&&a.every((v,i)=>v===b[i]);
function nullPaths(value,redacted,unknown){
 const result=[];let visited=0;
 function visit(x,p,depth){if(++visited>5000||depth>12)fail('value structure complexity limit');if([...redacted,...unknown].some(a=>prefix(a,p)))return;if(x===null){result.push(p);return;}if(x&&typeof x==='object')for(const [k,c] of Object.entries(x))visit(c,[...p,Array.isArray(x)?Number(k):pathPart(k,'value attribute path')],depth+1);}
 visit(value,[],0);return result;
}
function projectChange(change,where){
 object(change,where);
 const result={actions:actions(change.actions,`${where}.actions`),valuePolicy:'All before/after values omitted, including non-sensitive scalar values.'};
 for(const [field,key] of [['after_unknown','unknownAfterPaths'],['before_sensitive','sensitiveBeforePaths'],['after_sensitive','sensitiveAfterPaths']])result[key]={status:has(change,field)?'provided':'not-provided',paths:has(change,field)?maskPaths(change[field],`${where}.${field}`):[]};
 result.explicitNullBefore={status:has(change,'before')?'inspected-for-null-paths-only':'not-provided',paths:has(change,'before')?nullPaths(change.before,result.sensitiveBeforePaths.paths,[]):[]};
 result.explicitNullAfter={status:has(change,'after')?'inspected-for-null-paths-only':'not-provided',paths:has(change,'after')?nullPaths(change.after,result.sensitiveAfterPaths.paths,result.unknownAfterPaths.paths):[]};
 result.replacePaths={status:has(change,'replace_paths')?'provided':'not-provided',paths:has(change,'replace_paths')?array(change.replace_paths,`${where}.replace_paths`,30).map((p,i)=>array(p,`${where}.replace_paths[${i}]`,12).map(x=>pathPart(x,where))):[]};
 const selected=['actions','after_unknown','before_sensitive','after_sensitive','before','after','replace_paths'];
 result.unprojectedFieldCount=Object.keys(change).filter(k=>!selected.includes(k)).length;
 return result;
}
function resource(v,where,optionalChange=false){
 object(v,where);literal(v.address,`${where}.address`);literal(v.type,`${where}.type`);
 const out={address:v.address,type:v.type};if(has(v,'deposed'))out.deposed=literal(v.deposed,`${where}.deposed`,100);
 out.change=has(v,'change')?projectChange(v.change,`${where}.change`):optionalChange?null:fail(`${where}.change: required`);
 out.unprojectedFieldCount=Object.keys(v).filter(k=>!['address','type','deposed','change'].includes(k)).length;return out;
}
export function convert(plan,kind){
 if(!['synthetic','provided-plan'].includes(kind))fail('kind must be synthetic or provided-plan');object(plan,'plan');
 if(!['1.0','1.1','1.2'].includes(plan.format_version))fail('Unsupported format_version; this experiment accepts only 1.0, 1.1 and 1.2');
 if(!['resource_changes','deferred_changes','complete'].some(k=>has(plan,k)))fail('No supported plan indicator; state-only or ambiguous input is refused');
 if(has(plan,'complete')&&typeof plan.complete!=='boolean')fail('complete must be boolean when provided');
 const resources=has(plan,'resource_changes')?array(plan.resource_changes,'resource_changes',6).map((v,i)=>({ordinal:i+1,...resource(v,`resource_changes[${i}]`)})):[];
 const deferred=has(plan,'deferred_changes')?array(plan.deferred_changes,'deferred_changes',6).map((v,i)=>{object(v,`deferred_changes[${i}]`);return {ordinal:i+1,reason:has(v,'reason')?literal(v.reason,'deferred reason'):null,resource:has(v,'resource_change')?resource(v.resource_change,`deferred_changes[${i}].resource_change`,true):null,unprojectedFieldCount:Object.keys(v).filter(k=>!['reason','resource_change'].includes(k)).length};}):[];
 const projection={adapter:'plan-actions/1',kind,formatVersion:plan.format_version,contract,complete:has(plan,'complete')?plan.complete:'not-provided',resourceChangesStatus:has(plan,'resource_changes')?'provided':'not-provided',deferredChangesStatus:has(plan,'deferred_changes')?'provided':'not-provided',resources,deferred,unprojectedRootFieldCount:Object.keys(plan).filter(k=>!['format_version','complete','resource_changes','deferred_changes'].includes(k)).length,coverage:'Actions and attribute-path categories only. Every before/after value and every unselected field value is omitted; not a filtered plan or full plan audit.'};
 const nodes=[],edges=[];
 resources.forEach(r=>{r.change.actions.forEach((a,i)=>nodes.push({id:`r-${r.ordinal}-a-${i}`,lane:`r-${r.ordinal}`,col:i,type:'backend',label:a,sublabel:`Resource ${r.ordinal}`,tag:r.change.actions.length===2?'replacement sequence':'single reported action'}));if(r.change.actions.length===2)edges.push({from:`r-${r.ordinal}-a-0`,to:`r-${r.ordinal}-a-1`,label:'then, for this resource',variant:'dashed'});});
 if(!resources.length)nodes.push({id:'no-resources',lane:'empty',col:0,type:'external',label:'No supplied resources',sublabel:has(plan,'resource_changes')?'empty list, not full infra':'resource_changes not provided'});
 const workflow={schema_version:2,diagram_type:'workflow',meta:{title:`${kind==='synthetic'?'Synthetic':'Provided'} per-resource actions`,subtitle:'Each row is one resource. No cross-resource execution timeline or blast-radius inference.',output:'actions.html',quality_profile:'standard',legend:{entries:{backend:{label:'Reported action'},external:{label:'Coverage boundary'}}}},lanes:resources.length?resources.map(r=>({id:`r-${r.ordinal}`,label:`Resource ${r.ordinal}`})):[{id:'empty',label:'Input coverage'}],nodes,edges,cards:[{dot:'amber',title:'Action order, not global scheduling',items:[`complete: ${String(projection.complete)} · deferred records: ${deferred.length}`,'Deferred records are listed separately; not scheduled as action rows.','No Terraform, cloud query or apply was executed.']}]};
 // Only presentation changes below: full workflow and safe projection remain authoritative.
 const literalInline=value=>[...String(value)].map(c=>"\\`*_[]()!<>~|".includes(c)?'\\'+c:c).join('');
 const pathText=(entry,empty)=>entry.status==='not-provided'?'not-provided':entry.paths.length?entry.paths.map(p=>JSON.stringify(p)).join('; '):empty;
 const identity=r=>`${r.address} · ${r.type}${r.deposed?` · deposed ${r.deposed}`:''}`;
 const replacements=resources.filter(r=>r.change.actions.length===2);
 const replacementLanes=new Set(replacements.map(r=>`r-${r.ordinal}`));
 const replacementView={...workflow,meta:{...workflow.meta,title:'Replacement order · selected rows',subtitle:`${replacements.length} replacement rows shown; ${resources.length-replacements.length} other supplied resource rows omitted from this view. Full actions.html retains all rows.`,output:'replacement-view.html'},lanes:workflow.lanes.filter(l=>replacementLanes.has(l.id)),nodes:workflow.nodes.filter(n=>replacementLanes.has(n.lane)),cards:[{dot:'amber',title:'Subset, not global scheduling',items:[`${replacements.length} replacement rows; ${resources.length-replacements.length} other supplied rows omitted here.`,'Actions connect only within one resource. Deferred records are not scheduled.']}]};
 const resourceTable={id:'resource-summary',type:'comparison',labelColumn:'Resource',columns:['Identity','Actions','Unknown after paths'],rows:resources.map(r=>({id:`resource-row-${r.ordinal}`,label:`Resource ${r.ordinal}`,cells:[{text:literalInline(identity(r))},{text:r.change.actions.join(' then ')},{text:literalInline(pathText(r.change.unknownAfterPaths,'none marked'))}]}))};
 const pathsTable={id:'path-summary',type:'comparison',labelColumn:'Resource',columns:['Sensitive mask paths','Literal null paths','Replacement paths'],rows:resources.map(r=>({id:`paths-row-${r.ordinal}`,label:`Resource ${r.ordinal}`,cells:[{text:literalInline(`Before: ${pathText(r.change.sensitiveBeforePaths,'none marked')}; After: ${pathText(r.change.sensitiveAfterPaths,'none marked')}`)},{text:literalInline(`Before: ${pathText(r.change.explicitNullBefore,'none observed')}; After: ${pathText(r.change.explicitNullAfter,'none observed')}`)},{text:literalInline(pathText(r.change.replacePaths,'empty supplied list'))}]}))};
 const panels=[
  {id:'actions',title:'Replacement order and plan coverage',blocks:[
   {id:'completeness',type:'comparison',labelColumn:'Input fact',columns:['Supplied status'],rows:[{id:'complete',label:'complete',cells:[{text:String(projection.complete)}]},{id:'resource-count',label:'resource_changes',cells:[{text:`${resources.length} supplied · ${projection.resourceChangesStatus}`}]},{id:'deferred',label:'deferred_changes',cells:[{text:`${deferred.length} separate records · ${projection.deferredChangesStatus}`}]}]},
   ...(replacements.length?[{id:'replacement-graph',type:'diagram',diagramType:'workflow',spec:replacementView}]:[{id:'no-replacements',type:'prose',text:'No replacement sequences were supplied; other action types remain in the resource table.'}]),
   {id:'order-boundary',type:'prose',text:`This small view shows ${replacements.length} replacement rows and omits ${resources.length-replacements.length} other supplied resource rows. Full actions.html retains every resource row. Arrows mean only that resource action order, never a global apply timeline or blast radius.`}
  ]},
  {id:'resources',title:'Every supplied resource: actions and unknowns',blocks:resources.length?[resourceTable]:[{id:'no-resource-rows',type:'prose',text:'No resource rows supplied; this does not assert that the infrastructure is empty.'}]},
  {id:'paths',title:'Sensitive, literal null and replacement paths',blocks:[
   ...(resources.length?[pathsTable]:[]),
   {id:'paths-boundary',type:'prose',text:'Paths are JSON arrays: string keys and numeric indexes stay distinct; an empty path means the root. None marked means no true leaf in that supplied mask; not-provided means the mask was absent. Literal null excludes supplied unknown or sensitive ancestors. No before/after values are displayed.'}
  ]},
  {id:'deferred-records',title:'Deferred records: separate from action rows',blocks:[
   ...(deferred.length?[{id:'deferred-table',type:'comparison',labelColumn:'Deferred record',columns:['Resource identity','Reason','Reported actions, not scheduled'],rows:deferred.map(d=>({id:`deferred-row-${d.ordinal}`,label:`Deferred ${d.ordinal}`,cells:[{text:literalInline(d.resource?identity(d.resource):'not-provided')},{text:literalInline(d.reason??'not-provided')},{text:d.resource?.change?d.resource.change.actions.join(' then '):'not-provided'}]}))}]:[{id:'no-deferred',type:'prose',text:`No deferred records supplied; collection status is ${projection.deferredChangesStatus}.`}]),
   {id:'deferred-boundary',type:'prose',text:'Any actions in these records remain deferred evidence. Missing details stay unknown; deferred mask paths remain in the complete value-free projection.json file.'}
  ]},
  {id:'coverage',title:'What this projection leaves unknown',blocks:[
   {id:'categories',type:'list',items:['complete is the supplied flag, not a deployment approval. Missing, false and true remain distinct.','Literal null is not unknown or redacted. Missing masks do not prove runtime knownness.','All before/after values and all unselected field values are omitted. Metadata and path names are retained.','The complete value-free projection.json preserves mask status, full deferred path details and unprojected field counts. It is not a round-trip Terraform plan.']},
   {id:'source',type:'prose',text:'The pinned official data types define the actions and masks.[](source:contract-source) No Terraform, provider or cloud command was run.'}
  ]}
 ];
 const explainer={schema_version:1,diagram_type:'explainer',meta:{id:'plan-actions',title:kind==='synthetic'?'Synthetic Terraform plan: replacement order and unknowns':'Terraform plan projection: replacement order and unknowns',locale:'en'},answer:{summary:kind==='synthetic'?'This synthetic input demonstrates per-resource action order and value-free path categories. No infrastructure was measured or changed.':'Read the reported per-resource action order; this projection does not establish global scheduling or plan completeness.',reasons:['delete then create differs from create then delete.','Unknown, explicit null and sensitive paths remain distinct.','Deferred records and the supplied complete flag keep their own status.'],scope:`${resources.length} resource records · ${deferred.length} deferred records · complete ${String(projection.complete)} · all before/after values omitted`},panels,sources:[{id:'contract-source',title:'Fixed official Terraform JSON plan data types',url:`${contract.repository}/blob/${contract.commit}/plan.go`}]};
 return {projection,workflow,explainer};
}
export function readInput(file){const fd=fs.openSync(file,'r');try{if(!fs.fstatSync(fd).isFile())fail('Input must be a regular file');const b=Buffer.alloc(500001);let n=0;while(n<b.length){const c=fs.readSync(fd,b,n,b.length-n,null);if(!c)break;n+=c;}if(n>500000)fail('Input exceeds 500000 bytes');return b.subarray(0,n);}finally{fs.closeSync(fd);}}
export function publish(raw,kind,out){if(Buffer.byteLength(raw)>500000)fail('Input exceeds 500000 bytes');const decoded=typeof raw==='string'?raw:new TextDecoder('utf-8',{fatal:true}).decode(raw);let plan;try{plan=JSON.parse(decoded);}catch{fail('Input is not valid UTF-8 JSON');}const result=convert(plan,kind);result.projection.inputSha256=createHash('sha256').update(raw).digest('hex');fs.mkdirSync(out);for(const [name,data]of[['projection.json',result.projection],['actions.workflow.json',result.workflow],['actions.explainer.json',result.explainer]])fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n',{flag:'wx'});return result;}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{if(process.argv.length!==5)fail('Usage: node adapter.mjs plan.json synthetic|provided-plan new-output-directory');const[input,kind,out]=process.argv.slice(2);const r=publish(readInput(input),kind,out);console.log(JSON.stringify({ok:true,resources:r.projection.resources.length,deferred:r.projection.deferred.length}));}catch(error){console.error(JSON.stringify({ok:false,error:error.message}));process.exitCode=1;}}
