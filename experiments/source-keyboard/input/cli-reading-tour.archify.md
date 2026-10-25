# JSON写到哪里，导览又从哪里读取？ {#cli-reading-tour}

**`--json`打印后返回；`--no-serve`写文件后返回；正常路径才调用serve。** HTTP发送serve启动时准备的内存JSON字符串快照，不会因落盘文件变化而在这个handler中重读它。

- `--json`之前已有扫描日志进入stdout，整次stdout不是纯JSON。[](source:cli-scan)
- 写入文件与准备HTTP响应分别调用JSON.stringify，来源都是scan返回的codemap。[](source:write-file) [](source:http-snapshot)
- 浏览器加载成功后仍需用户点击Start；有tour数据才创建engine。[](source:start-guard)

@answer scope="固定Walkthrough源码 · 静态调用/分支阅读，非运行trace · 正常扫描/写入/监听成功 · 前端路径另需bundle与有效tour"
@meta locale=zh-CN repo_url=https://github.com/kyooosukedn/walkthrough repo_revision=a373526c92bd1d4c3953370b9a57f19e4fb15d08
@source cli-scan title="CLI：scan调用与stdout扫描日志" path=packages/cli/src/index.ts lines=47:60
@source json-return title="CLI：--json打印后return" path=packages/cli/src/index.ts lines=62:66
@source file-mode title="CLI：选择输出路径、写文件、no-serve早退" path=packages/cli/src/index.ts lines=68:80
@source write-file title="Scanner输出模块：实际writeFile" path=packages/scanner/src/output/json.ts lines=4:8
@source http-snapshot title="serve：先编码字符串，handler只发送快照" path=packages/cli/src/index.ts lines=84:98
@source no-bundle title="缺visualizer bundle时只返回raw HTML" path=packages/cli/src/index.ts lines=101:105
@source browser-fetch title="浏览器：fetch并解析响应" path=packages/visualizer/src/data/loader.ts lines=19:30
@source provider-state title="Provider：加载成功后保存data" path=packages/visualizer/src/data/context.tsx lines=30:43
@source start-guard title="App：用户Start回调与tour guard" path=packages/visualizer/src/App.tsx lines=36:40
@source start-run title="App：启动engine并进入tour模式" path=packages/visualizer/src/App.tsx lines=53:56
@source welcome-gate title="Welcome：按钮还要求tour.steps非空" path=packages/visualizer/src/App.tsx lines=95:103

## 先看哪条路径会提前返回 {#three-modes}

| 命令模式 | stdout | 落盘JSON | HTTP服务 |
| --- | --- | --- | --- |
| `--json` | 扫描日志后打印JSON | 此路径未调用writeCodeMap | 此路径未调用serve |
| `--no-serve`，且未设`--json` | 扫描日志与Written提示 | 调用writeCodeMap写outputPath | 写完后return |
| 两个flag都未设 | 扫描日志与后续状态提示 | 先调用writeCodeMap | 随后调用serve；正常监听成功后可接收请求 |

`--json`分支检查在前，即使两个flag同时给出也先从该分支返回。`outputPath`来自`--output`，缺省为目标目录的`codemap.json`。[](source:json-return) [](source:file-mode)

## 沿源码走一遍：在每个出口停下来 {#read-the-flow}

@workflow id=cli-paths title="源码控制流 · 箭头不是实测事件"
| lane cli | CLI：scan之后判断模式 |
| lane serving | 正常服务：内存响应 |
| lane browser | 前端：加载后由用户启动 |
| scan | scan返回codemap | backend | cli | source:cli-scan |
| json-mode | --json？ | backend | cli | source:json-return |
| stdout-return | 打印JSON并return | external | cli | source:json-return |
| file-write | writeCodeMap | database | cli | source:file-mode |
| no-serve-mode | --no-serve？ | backend | cli | source:file-mode |
| file-return | 写完并return | external | cli | source:file-mode |
| snapshot | serve准备快照 | backend | serving | source:http-snapshot |
| response | HTTP发送快照 | backend | serving | source:http-snapshot |
| browser-data | fetch并保存data | frontend | browser | source:browser-fetch |
| start | 用户Start并有tour | frontend | browser | source:start-guard |
| scan > json-mode | scan成功 |
| json-mode > stdout-return | 是 |
| json-mode > file-write | 否 |
| file-write > no-serve-mode | 写入成功 |
| no-serve-mode > file-return | 是 |
| no-serve-mode > snapshot | 否 |
| snapshot > response | GET codemap.json |
| response > browser-data | bundle可用，加载成功 |
| browser-data > start | 用户点击，有tour |

@steps id=reader-questions
| q-json | 打印JSON并return | 先看--json出口；此前console.log也写stdout。 | cli-paths | stdout-return |
| q-file | writeCodeMap | 找到实际writeFile，再看--no-serve的早退。 | cli-paths | file-write |
| q-memory | HTTP发送快照 | 区分启动serve时的字符串与磁盘JSON。 | cli-paths | response |
| q-user | 用户Start并有tour | fetch成功只更新data；用户回调再创建并启动engine。 | cli-paths | start |

悬停节点查看固定源码卡；来源编号提供固定行范围链接。步骤只引导阅读，不执行上游程序。图中scan内部分析算法、错误处理与静态资源细节收在范围之外。

## 同名codemap.json，实际有四次交接 {#data-ownership}

| 位置 | 谁创建或读取 | 这里的事实 |
| --- | --- | --- |
| 内存codemap | main等待scan返回 | 同一个返回对象交给写入与serve |
| 磁盘outputPath | writeCodeMap编码后调用writeFile | 文件是一个输出，不是HTTP handler的数据源。[](source:write-file) |
| HTTP响应 | serve先编码为codemapJson，handler发送它 | 这里没有按请求读取outputPath，也没有重新扫描。[](source:http-snapshot) |
| React provider.data | loadCodeMap fetch、解析和校验，成功后setState | 加载成功不自动开始tour。[](source:browser-fetch) [](source:provider-state) |

用户触发Start回调时，`data?.tour` guard通过才`new TourEngine(data.tour)`，随后`engine.start()`。Welcome的hasTour还检查steps非空。这里没有名为createTourEngine的函数调用。[](source:start-guard) [](source:start-run) [](source:welcome-gate)

## 这些结论证明到哪里？ {#scope}

@callout level=note title="源码事实与运行结果分开"
| 本页观察固定源码中的调用、参数、写入与return；流程图是作者按这些事实组织的阅读视图。没有执行Walkthrough、扫描用户仓库、起HTTP服务或运行它的浏览器界面。 |

正常前端路径要求visualizer bundle存在。缺bundle时CLI返回包含JSON的raw HTML，而不会加载这里画出的React tour链。目标不存在、scan/write失败、端口冲突和网络/数据校验失败未画成成功箭头。[](source:no-bundle)

本页只核这条工具自身的控制流，不证明其自动生成架构正确、任意仓库可被理解、性能数字或用户阅读速度。完整必要源文件、MIT许可、每文件SHA与本页source ranges随实验保留。
