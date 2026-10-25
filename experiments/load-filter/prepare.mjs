import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const revision='849be420e44d47218156adec6ccd9bfa77c4659e';
const upstream='/tmp/archify-round21-symbol/stevedore';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const originals={
  'LICENSE':'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30',
  'stevedore/tests/test_enabled.py':'4da45c8ea50e88575ff057998827a3a11619b14fcb411559957d48969837fac2',
  'stevedore/enabled.py':'894cd4833adefc6c67ae58d65ba253347f9da0146d534e3ce11a97d4dc461e4c',
  'stevedore/extension.py':'09c1f96fc982f1568f44495bc4bf3b3efebb43fe5cb0e49ba689c297ec84a7cf',
  'stevedore/tests/test_extension.py':'661eb30afcd24c0096ec5d78957a51e357d3557d0312ee6721e2992a7ecd58e5',
  'pyproject.toml':'487d888a41cd0e52ff0c85f19e11416fa1691e8ba0a39aa97ea2abed8b1ad7c8',
};
const files=[];
for(const [relative,expected] of Object.entries(originals)){
  const destination=path.join(root,'source',relative);
  const bytes=fs.existsSync(destination)?fs.readFileSync(destination):fs.readFileSync(path.join(upstream,relative));
  if(sha(bytes)!==expected)throw new Error('Frozen source mismatch: '+relative);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
  files.push({path:relative,local:'source/'+relative,bytes:bytes.length,sha256:sha(bytes),url:`https://github.com/openstack/stevedore/blob/${revision}/${relative}`});
}
const excerpt=(relative,first,last)=>{
  const rows=fs.readFileSync(path.join(root,'source',relative),'utf8').split('\n');
  return rows.slice(first-1,last).join('\n');
};
const source=(id,title,relative,first,last)=>({id,title,url:`https://github.com/openstack/stevedore/blob/${revision}/${relative}#L${first}-L${last}`});
const snippet=(id,title,relative,first,last)=>({id,type:'snippet',title,language:'python',text:excerpt(relative,first,last)});
const cell=text=>({text});
const doc={schema_version:1,diagram_type:'explainer',meta:{id:'load-filter',title:'只见 t2，能说明 t1 没被加载吗？',locale:'zh-CN',quality_profile:'standard'},
  answer:{summary:'不能。check 在加载之后；显式启用 invoke 时，plugin 调用也在 check 之前。',
    reasons:['最终名单只列出保留的 Extension。','默认不 invoke，仍会先调用 ep.load()。','这里读源码和官方断言，没有加载插件。'],scope:'Stevedore 固定提交 · 源码条件顺序 · 未运行 Python'},
  panels:[
    {id:'official',title:'官方测试的 expected 只有 t2',span:12,blocks:[
      {id:'official-intro',type:'prose',text:'两个测试都显式传 `invoke_on_load=True`，参数为 `(\'a\',)` 和 `{\'b\': \'B\'}`。下面是上游提交中的断言，不是本轮运行输出。[查看测试](source:enabled-tests)'},
      {id:'expected-table',type:'comparison',labelColumn:'官方测试',columns:['check_func','提交中的 expected'],rows:[
        {id:'name-check',label:'test_enabled',cells:[cell("ep.name == 't2'"),cell("len(extensions) == 1；names() == ['t2']")]},
        {id:'object-check',label:'test_enabled_after_load',cells:[cell("ext.obj and ext.name == 't2'"),cell("len(extensions) == 1；names() == ['t2']")]},
      ]},
      snippet('official-code','完整 TestEnabled 类｜test_enabled.py:17–44','stevedore/tests/test_enabled.py',17,44),
      {id:'fixture-scope',type:'prose',text:'namespace 来自安装环境；pyproject 声明 t1、t2 指向同一个 FauxExtension 类。相同类路径不等于同一实例，也不是实际加载次数记录。[声明](source:entrypoints) [构造器](source:test-plugins)'},
    ]},
    {id:'order',title:'名称检查在父 loader 返回之后',span:12,blocks:[
      {id:'order-intro',type:'prose',text:'对一个被发现的 entry point，父类先 load，再按参数选择是否 invoke。返回 Extension 后，子类才 check。[父类](source:parent-load) [子类](source:enabled-load)'},
      snippet('parent-code','父类 ExtensionManager｜extension.py:329–341','stevedore/extension.py',329,341),
      snippet('enabled-code','子类 EnabledExtensionManager｜enabled.py:90–103','stevedore/enabled.py',90,103),
      {id:'order-table',type:'comparison',labelColumn:'阶段',columns:['动作','名单能说明什么'],rows:[
        {id:'load-stage',label:'load',cells:[cell('先调用 ep.load()'),cell('不能：check 还没开始')]},
        {id:'invoke-stage',label:'可选 invoke',cells:[cell('True 才调用 plugin；False 则 obj=None'),cell('不能：True 时调用在 check 前')]},
        {id:'check-stage',label:'check 与保留',cells:[cell('check 假则返回 None；非空 Extension 才 append'),cell('只说明是否保留，不是前置动作的回滚')]},
      ]},
      {id:'rejection-reason',type:'prose',text:'给定测试中的 True：若 t1 正常构造后被名称检查拒绝，它仍可缺席。e1 的构造器抛 OSError，则到不了 check。最终缺席本身不能区分这两条条件路径。[构造器](source:test-plugins) [异常处理](source:load-loop)'},
    ]},
    {id:'default',title:'默认 False 只省去 invoke',span:12,blocks:[
      {id:'default-intro',type:'prose',text:'默认值是 False；两种参数都先调用 ep.load()。下表读的是源码分支，不是另一次插件测试结果。[默认参数](source:defaults)'},
      {id:'mode-table',type:'comparison',labelColumn:'invoke_on_load',columns:['显式调用 plugin','正常返回给 check 的 obj'],rows:[
        {id:'default-mode',label:'False（默认）',cells:[cell('不调用'),cell('None')]},
        {id:'explicit-mode',label:'True（官方两测试显式）',cells:[cell('调用；异常时不进入 check'),cell('plugin 的返回值')]},
      ]},
      {id:'obj-check-default',type:'prose',text:'因此，在默认 False 下，第二个测试的对象检查会因 obj=None 而拒绝正常返回的 Extension。这是条件源码推断，不是上游给出的另一份 expected。'},
      {id:'exception-scope',type:'prose',text:'范围：除下述重抛情形，load、invoke 或 check 的 Exception 都进入父类 failure callback／日志。callback 自己再抛时，初始化可能中断；不保证总有最终名单。[异常处理](source:load-loop)'},
      {id:'exception-exclusions',type:'prose',text:'KeyboardInterrupt、AssertionError 直接重抛；SystemExit 等非 Exception 异常也不在普通捕获范围。propagate_map_exceptions 只影响 map。[map 边界](source:map-errors)'},
      {id:'no-execution',type:'prose',text:'筛选不会替此前动作作回滚。这里没有运行插件，也不推断 fixture 实际产生了什么副作用。'},
    ]},
  ],sources:[
    source('enabled-tests','官方两个测试与完整 expected','stevedore/tests/test_enabled.py',17,44),
    source('entrypoints','entry-point 声明（不是本轮环境快照）','pyproject.toml',38,42),
    source('test-plugins','FauxExtension 与 BrokenExtension','stevedore/tests/test_extension.py',30,41),
    source('parent-load','父 loader：先 load，再可选 invoke','stevedore/extension.py',329,341),
    source('enabled-load','子类：父 loader 返回后 check','stevedore/enabled.py',90,103),
    source('defaults','invoke_on_load 默认 False','stevedore/enabled.py',61,87),
    source('load-loop','遍历、append 与异常捕获','stevedore/extension.py',290,324),
    source('map-errors','propagate_map_exceptions 的使用位置','stevedore/extension.py',413,429),
  ]};
fs.writeFileSync(path.join(root,'input.explainer.json'),JSON.stringify(doc,null,2)+'\n');
fs.writeFileSync(path.join(root,'source-manifest.json'),JSON.stringify({repository:'https://github.com/openstack/stevedore',revision,license:'Apache-2.0; full unchanged source/LICENSE',files,shownSnippets:[{id:'official-code',path:'stevedore/tests/test_enabled.py',lines:[17,44]},{id:'parent-code',path:'stevedore/extension.py',lines:[329,341]},{id:'enabled-code',path:'stevedore/enabled.py',lines:[90,103]}],boundary:'Complete selected original files; not a reproduced installed environment. Snippets are literal fixed-file slices; URL source metadata is not CLI verified repository evidence.'},null,2)+'\n');
console.log(JSON.stringify({files:files.length,snippets:3,sourceRevision:revision,upstreamExecuted:false}));
