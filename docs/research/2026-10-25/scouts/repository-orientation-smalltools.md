# Repository orientation：从入口读完一条真实源码流程

日期：2026-10-25。只读调研，未安装或运行候选CLI/服务、调用LLM、扫描用户仓库或打开浏览器。固定源码、已提交输入、作者截图与本次运行严格分开。先读完整36份scout并提取repo去重，以下8项均为新来源；同题机制可比较，但不重复计数CodeTour、Codecrumbs、Sourcetrail、既有source-navigation或code-flow项目。星数不是门槛。

**发现一个值得做的现有能力产物：Walkthrough自己的CLI reading tour。** 不依赖新parser，用固定调用与写入源码回答 `--json`、`--no-serve`、正常HTTP三条路径，以及落盘JSON与HTTP闭包数据的区别。已先同步协调agent，获准在独立实验目录实现；本报告先完成，报告中没有把尚未制作的页面当验收结果。

能力核对使用本次已更新的Archify dev `3f95f0349c8276db71509ca239461b6fe9d00f9f`；旧实验仍保留其原 `82c7e0f0` 证据，不改写历史。当前源码与文档已经支持Explainer的Workflow/Sequence、节点SourceCard、固定repo revision/行范围和 `@steps`。所谓QuestionTour在此指既有实验的问题组织方式，不是名为QuestionTour的新公共组件。

## 8个来源：读者动作、实际输入与边界

每个repo链接固定到本次读取SHA；下表记录真实实现/素材，不采信README的“几分钟理解全仓”等效果承诺。

| 项目与固定SHA | 许可 | 可复核实现与已提交输入 | 对读者的动作与局限 |
| --- | --- | --- | --- |
| [ahmedbutt2015/spine](https://github.com/ahmedbutt2015/spine/tree/c340b5d5a7758b251bc4628f0df735009d0d3bc6) `c340b5d5a7758b251bc4628f0df735009d0d3bc6` | [MIT](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/LICENSE) | [spine.ts](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/core/spine.ts)、[已提交ONBOARDING.md](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/ONBOARDING.md)、[Go小输入fixture](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/tests/fixtures/spine-go/main.go) | 选入口与少量spine文件，再给阅读顺序；“verified”是限定静态引用，不是实际调用链或职责全文已验证。深入A |
| [kyooosukedn/walkthrough](https://github.com/kyooosukedn/walkthrough/tree/a373526c92bd1d4c3953370b9a57f19e4fb15d08) `a373526c92bd1d4c3953370b9a57f19e4fb15d08` | [MIT](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/LICENSE) | [CLI](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/cli/src/index.ts)、[tour生成器](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/tour-generator.ts)、[import测试输入](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/imports.test.ts) | Next/Previous、节点focus与叙述已接线；自动tour多为目录/入口模板，不能当真实执行流。深入B，也是本次内容产物目标 |
| [0-uddeshya-0/archmap](https://github.com/0-uddeshya-0/archmap/tree/4fd32be52e31da6e49ce52c532a9b2296fcf3b02) `4fd32be52e31da6e49ce52c532a9b2296fcf3b02` | [MIT](https://github.com/0-uddeshya-0/archmap/blob/4fd32be52e31da6e49ce52c532a9b2296fcf3b02/LICENSE) | [self.archmap.json](https://github.com/0-uddeshya-0/archmap/blob/4fd32be52e31da6e49ce52c532a9b2296fcf3b02/demo/self.archmap.json)：20nodes/33edges，edge有ev/spec；[query.js](https://github.com/0-uddeshya-0/archmap/blob/4fd32be52e31da6e49ce52c532a9b2296fcf3b02/js/query.js) | 用最短import chain、上下游和章节读图；自然语言calls也映射到import reach，critical是已标注的静态spine，不是执行critical path |
| [beadnall/codemap](https://github.com/beadnall/codemap/tree/21aeff868b492a70295e96190cea9ce2f218d10a) `21aeff868b492a70295e96190cea9ce2f218d10a` | [MIT](https://github.com/beadnall/codemap/blob/21aeff868b492a70295e96190cea9ce2f218d10a/LICENSE) | [template.html](https://github.com/beadnall/codemap/blob/21aeff868b492a70295e96190cea9ce2f218d10a/assets/template.html)提交STATS/NODES/EDGES/REGIONS数据，SQLite例将组件与文档事实放一起；[verify.py](https://github.com/beadnall/codemap/blob/21aeff868b492a70295e96190cea9ce2f218d10a/scripts/verify.py)为静态结构检查 | 强调“任取三节点，能学到什么目录表没有的事实”；虚线REGIONS表达public repo之外的边界。动画dots承载作者选入的说明值，不是执行trace，静态检查也不验证SQLite事实本身 |
| [CodeBoarding/CodeBoarding](https://github.com/CodeBoarding/CodeBoarding/tree/647fe6a728169ac442ae24a5feeba50784ea2231) `647fe6a728169ac442ae24a5feeba50784ea2231` | [MIT](https://github.com/CodeBoarding/CodeBoarding/blob/647fe6a728169ac442ae24a5feeba50784ea2231/LICENSE) | [analysis.json](https://github.com/CodeBoarding/CodeBoarding/blob/647fe6a728169ac442ae24a5feeba50784ea2231/.codeboarding/analysis.json)有components、source references、relations、depth cap与coverage；固定文件包含339总files、176analyzed、163not analyzed | 从组件抽象下钻到source refs；保留覆盖账目比仅给宏观美图有用。LLM帮助命名/描述，不把生成component关系自动升级为观测运行；不复制其平台/agent/tool安装链 |
| [honow48-tech/CodeBread](https://github.com/honow48-tech/CodeBread/tree/e636bf5d3fb2e17e7c647a08d63762aa679252f5) `e636bf5d3fb2e17e7c647a08d63762aa679252f5` | [MIT](https://github.com/honow48-tech/CodeBread/blob/e636bf5d3fb2e17e7c647a08d63762aa679252f5/LICENSE) | [models.py](https://github.com/honow48-tech/CodeBread/blob/e636bf5d3fb2e17e7c647a08d63762aa679252f5/codebread/models.py)保留函数line/end_line、calls、code与HTTP元数据；[Flask输入](https://github.com/honow48-tech/CodeBread/blob/e636bf5d3fb2e17e7c647a08d63762aa679252f5/tests/fixtures/python/sample_flask.py) | 一次只画当前文件邻域并提供breadcrumb，文件展开为函数；描述来自docstring或heuristic，不是运行验证。已有Archify关系引用/局部路径能力部分重叠，不另造全源码浏览器 |
| [abbaing/code-map](https://github.com/abbaing/code-map/tree/d57c92bda4c3b1f62be8d2e75c9a45dddd430bb4) `d57c92bda4c3b1f62be8d2e75c9a45dddd430bb4` | [AGPL-3.0](https://github.com/abbaing/code-map/blob/d57c92bda4c3b1f62be8d2e75c9a45dddd430bb4/LICENSE) | [graph schema](https://github.com/abbaing/code-map/blob/d57c92bda4c3b1f62be8d2e75c9a45dddd430bb4/schemas/graph.schema.json)有confidence/source/evidence；[后端fixture](https://github.com/abbaing/code-map/blob/d57c92bda4c3b1f62be8d2e75c9a45dddd430bb4/tests/fixtures-architecture-backend.mjs)提交声明/控制器输入 | 可选submap和组件层级，保留证据字段值得参考；字段存在不证明每条关系均已验证。不复制AGPL实现或扩大Archify架构分析平台 |
| [mightbeanshuu/helix](https://github.com/mightbeanshuu/helix/tree/378a3c908d3dfd0dcd4e70c59432c1aa24ccc910) `378a3c908d3dfd0dcd4e70c59432c1aa24ccc910` | [MIT](https://github.com/mightbeanshuu/helix/blob/378a3c908d3dfd0dcd4e70c59432c1aa24ccc910/LICENSE) | [tour.ts](https://github.com/mightbeanshuu/helix/blob/378a3c908d3dfd0dcd4e70c59432c1aa24ccc910/packages/ai/src/tour.ts)选importance最高40文件摘要给模型，再parse steps的fileId/path/why/highlights；未找到本轮可核的完整静态tour输出fixture | 有“先看重要文件”的产品动作；schema parse验证形状，不验证叙述和真实执行。API/worker/storage/模型整链对本轮内容实验成本过大，不运行它来补一个样例 |

## 深入A：spine的“verified”究竟证明了什么

[src/types.ts](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/types.ts)中VerifiedEdge只有 `from/to/kind:"import"`，SpineAnalysis包含nodes/edges/entrySeeds/omittedEntryPoints。没有callsite、参数、运行事件、source line或逐边confidence。这个明确类型比宣传用词更能限定读法。

[spine.ts](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/core/spine.ts)的JS/TS import/export/require/dynamic-import提取使用regex并解析目标文件；Go/Python/Rust/PHP有各自有限规则。不要将其写成编译器调用图。节点选择按入口可达分数与小节点预算压缩，默认探索maxDepth4；未选到或解析不到的边不是不存在。

[diagram.ts](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/core/diagram.ts)从这组nodes/edges生成Mermaid，再用mermaid.parse验证语法。语法通过不验证“组件职责”或“真实执行了这条路径”。已提交[ONBOARDING.md](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/ONBOARDING.md)确有文件legend、reading order与小spine，但“main runtime handoff”等描述还要回源码核对，不能由import边直接推出。

[synthesis.ts](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/core/synthesis.ts#L366-L407)对LLM输出限制readingOrder/subsystem文件为允许path，检查mentalModel/gotchas等形状；它没有逐句证明why或模型叙述。保留source=deterministic/llm很重要，“有source标签”也不等于事实已经完成外部验证。阅读时间/节省工时为生成估计，不是本轮人类对照研究。

一个可直接看源码的良好边界是CLI：[runCli](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/cli.ts#L230-L274)先analyze，再在mapOnly各分支return，synthesizeTour在后；[analyzeRepository](https://github.com/ahmedbutt2015/spine/blob/c340b5d5a7758b251bc4628f0df735009d0d3bc6/src/core/analyze.ts)又明确调用detect/entry/spine/diagram/subsystem等。这比把ONBOARDING的import图当执行顺序可靠。它可作为阅读方法对照，此轮不再做第二个相近CLI页。

## 深入B：Walkthrough有导览交互，但自动tour不是源码执行流程

固定输入/输出事实：仓库[gitignore](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/.gitignore#L7)明确忽略codemap.json，本轮未发现已提交的完整codemap/tour golden。能核的是测试中写入的公开源码字符串，如[imports.test.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/imports.test.ts#L13-L45)、[express-routes.test.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/express-routes.test.ts#L14-L54)。没有运行这些测试，也不将临时写出的测试文件冒称已采集真实仓库图。

### 自动叙述与实际交互

- [tour-generator.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/tour-generator.ts)按Welcome、目录、入口、routes、子目录、配置、总结生成步骤；文件夹职责说明大多是模板。它不遍历程序实际执行路径。
- [TourEngine](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/tour/TourEngine.ts)提供start/next/previous/goToStep状态；[useTourTransitions](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/tour/useTourTransitions.ts)对有cameraPosition的步骤setViewport，否则fitView focusNodeIds，并降低非focus节点opacity。这证明代码中有导览动作，不证明交互实际无缺陷或5分钟学习成功。
- 普通生成器不填cameraPosition/codeSnippet；edgeHighlightIds类型存在但无消费实现。能力字段存在不等于生成输出使用。叙述面板可折叠；overview只铺有限目录层级，[layout.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/views/layout.ts)不是任意层递归折叠树。tour状态也只接入overview，不泛称routes/database等多视图同步。
- [imports.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/imports.ts)是regex；[Route.calls](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/analyzers/nextjs-routes.ts#L23-L39)来自import目标，不可升级为路由调用证据。types里没有完整revision/path/line/fact-vs-inference模型，scannedAt也不能代替source revision。

### 真正可做的内容：按调用/写入证据读这个工具自身

这次不导入一个猜测的codemap，而是直接读固定工具源码，回答具体用户问题：

| 读者问题 | Owning source证据 | 说明范围 |
| --- | --- | --- |
| 从命令到扫描在哪里发生？ | [cli/index.ts L11–51](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/cli/src/index.ts#L11-L51)调用scan；[scanner.ts L38–96](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/scanner.ts#L38-L96)调用文件树/import/入口及条件分析，再生成tour | 源码调用，不是目录推断或本次运行trace |
| `--json`还会写文件/起server吗？ | [CLI L61–79](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/cli/src/index.ts#L61-L79)在打印JSON后return；但此前扫描日志也进stdout，不能声称整次stdout只有纯JSON。默认才writeCodeMap；no-serve在写完后return | 明确两个早退，不把整个程序画成必然串行完成 |
| HTTP响应是在重读磁盘JSON吗？ | [CLI L84–139](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/cli/src/index.ts#L84-L139)的serve先序列化为codemapJson，handler发送闭包字符串快照，写入由[output/json.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/scanner/src/output/json.ts)负责 | 磁盘产物与服务内存来源分开，不发明文件监听/实时刷新 |
| 浏览器从哪里得到tour数据？ | [loader.ts](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/data/loader.ts#L18-L35)、[context.tsx](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/data/context.tsx)fetch并更新provider；[App.tsx](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/visualizer/src/App.tsx#L37-L64)在用户触发start且data.tour存在时new TourEngine；fetch成功不自动启动tour | 正常前端还要求bundle可用、steps非空；只解释所选调用，不声称本轮HTTP/browser运行 |

## 最小产物及与Archify现有能力比较

**采用现有能力做一个简明阅读页**：一份原生Workflow或Sequence＋Explainer SourceCards，用问题顺序引导上述三条CLI路径和数据交接。图节点绑定同一固定MIT上游commit的必要完整文件或明确行范围；图只表达可见call/write/return，不复制上游的动态导览框架或自动架构推断。

既有SourceCard解决“这个节点的证据在哪里”，QuestionTour实验解决按问题读源码；本次真实跨层CLI路径增加的内容是控制流早退和disk/closure/browser数据来源。现有关系引用可保留边的方向/标签；无需新增copy/导航状态。若要折叠抽象层，优先以概览节点＋源码卡展开细节，不为3个package再画冗余Tree；只有确实需要定位目录时才用现有Tree表达包含关系。

不要把“没有新parser”当作没有价值。这个产物可帮助读者准确回答：哪条路径写文件、哪条起server、HTTP到底读哪个codemap；它不是新增扫描平台。候选已获协调agent授权在 `experiments/cli-reading-tour/` 实施，基线为新dev3f95f；实现/截图/独立复核结果将留该分支，不在本报告预填成功。

可验收结果：首次页面清楚显示三个flags路径、return边界与disk/memory区别；每个实质调用都有固定SourceCard，snippet与原source字节/行范围相符；图节点与source-map一致；正常HTTP路径与错误/缺bundle路径的省略范围可见；缺bundle只返回raw HTML，不冒充同一前端tour链。public render/finalize后由协调agent实际截图与检查，自动browser gate单独记录。不把阅读速度/所有仓库onboarding效果作为未测的成功指标。

## 明确不做与后续判断

- 不装这些项目、运行server/LLM或扫描用户代码；不复制大型CodeBoarding/Helix平台，也不建立第二套import/call graph parser。
- 不将import reach、目录包含、框架依赖命中、作者叙述、静态源码调用与实际运行事件合成一种“已验证边”。
- 不复制ArchMap“critical”标签为执行关键路径；不把codemap动画的说明值当采集trace；不把source reference存在当作叙述逐句已证明。
- 八源广度筛选只对实际读过的实现/公开素材负责，主深读限spine与walkthrough；各README效率承诺未复核。

报告验证仅为固定SHA/许可、代码/类型/公开输入、既有能力与报告去重、静态内容和whitespace核对；walkthrough由另一位Sol medium agent只读深研。尚未做本轮产物、浏览器/运行或用户收益验证。无commit/push或GitHub消息。
