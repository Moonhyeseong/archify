import fs from 'node:fs';
import path from 'node:path';
import {startPreview} from '../../../archify/bin/preview.mjs';
// Controlled original native Tree input; this script never opens external source files.
const directory=fs.mkdtempSync('/tmp/archify-diagnostic-preview-');
const input=path.join(directory,'tree.json'),output=path.join(directory,'tree.html');
const source={schema_version:1,diagram_type:'tree',meta:{title:'Last verified tree',output:'tree.html'},nodes:[{id:'root',label:'Dispatch'},{id:'worker',label:'Worker',parent:'root'}]};
fs.writeFileSync(input,JSON.stringify(source,null,2)+'\n',{flag:'wx'});
const preview=await startPreview({type:'tree',input,output,open:false,cwd:directory,pollMs:80,debounceMs:40});
async function waitFor(status){for(let n=0;n<250;n++){const state=await(await fetch(new URL('/state',preview.url))).json();if(state.status===status)return state;await new Promise(r=>setTimeout(r,80));}throw Error(`Preview did not reach ${status}.`);}
try{
 await waitFor('verified');
 source.nodes[1].parent='missing-parent';fs.writeFileSync(input,JSON.stringify(source,null,2)+'\n');
 const state=await waitFor('needs-fix');fs.writeFileSync(path.join(directory,'preview-state.json'),JSON.stringify(state,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({pid:process.pid,url:preview.url,status:state.status,revision:state.revision,rawDirectory:directory}));
}catch(error){await preview.stop({force:true});throw error;}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await preview.stop({force:true});process.exit(0);});
