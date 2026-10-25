# PRLens 与小型审阅、diff、Agent 工作证据工具

调研时间：2026-10-25。范围：只读 GitHub API、官方 README、树、选定源文件与许可；未安装、运行陌生项目、推送、评论或发布。没有把 star 作为发现或入选门槛，也没有据 star 排优先级。以下 star 只是确认“低星工具也进入了视野”的当日快照。工具声明、已读代码支持的机制与 Archify 的建议分开记录；没有实测效果或截图验收。

## 结论与第二批首选

1. **边上的请求/响应契约变化**：PR Lens 的独特细节不是再画一张 PR 结构图，而是点箭头看到 request/response 的 shape/sample、字段增删。结合 JSON Semantic Diff，可做有稳定字段路径的 before/after 契约卡。首个边界只接人工/Agent 提供的两份小 JSON 和明确的匹配键，显示新增/删除/修改；不推断运行时流量或破坏性变更。价值：审 API 变更时能回答“这条调用到底多带了哪个字段”。
2. **会话间异议与决定的证据小图**：agent-chatter 发现多 Agent 的关键讨论藏在互发消息里。Archify 可先接显式提供的脱敏消息 JSON，用 sequence 展示提出→反对→修订→决定，节点连原始消息 ID；只有明确文本事件，没有隐式思维推断。与首批 task-review map 和 Chrome trace waterfall 的信息粒度不同。
3. **阅读状态与批注绑定内容版本**：Markport 的已读状态随 revision 变化失效，plannotator-tui 的锚点有原始文本、前后文与 blob 版本。可先为审阅页做本地状态/导出 feedback JSON；同一锚点内容变更显示待重审，不能把历史“已读”算作当前接受。这是很小的实用行为，但要先核对现有 Viewer/Explainer 的反馈能力，避免新建平行状态系统。

另一个有力方向是 differential 的**语义阅读包与稳定顺序**：给大 diff 分组、明确未分组内容、对输入哈希固定组。它不是首批“画结构图”的同义词，但引入模型分组和长期状态成本高于上述三项，宜先做只读导入其导出的分组信息。

## PRLens 同名消歧

用户仅给名字，没有 URL，不能把以下任何一个认定为用户所指。最符合本次架构/数据流可视化语境的是第一项。

| 一手项目 | 确认功能和作者主体 | 判定 |
| --- | --- | --- |
| [coldteadotai/pr-lens](https://github.com/coldteadotai/pr-lens) | Coldtea；自有 renderer，animated architecture/data-flow、change delta、edge payload、walkthrough、可交互 canvas；CLI/Skill/Action/App 等入口。 | 重点候选。项目 API 当日 2,235 stars，不属于低星，但不能因此排除。 |
| [zier-one/pr-lens](https://github.com/zier-one/pr-lens) | zier-one；Gitea PR→预算化 diff snapshot→本地 Codex 两份 Markdown，以及可复现 context.md；无可视化 renderer。 | 名字相同，产品问题不同；3 stars，未见明确 LICENSE。只借鉴 scope notice 思路。 |
| [VTorres09/PRLens](https://github.com/VTorres09/PRLens) | VTorres09；Even Realities G2 眼镜上的 GitHub PR 状态列表。 | 0 stars，未见明确 LICENSE；与架构理解弱相关，不建议为 Archify 扩展眼镜端。 |
| [PRLens Chrome 扩展](https://chromewebstore.google.com/detail/prlens/dmcnjjplikhlmnkdapknmhigahpfjhpb) | 商店作者 Ankush Ware / anks.ware11；AI 风险评分及报告。 | 只确认同名存在；未建立官方源仓库与许可链，不纳入可复用代码清单。商店营销不是有效性证据。 |

PR Lens README 的“100X”等为产品宣传，未作为结论。选读的 [example.graph.json](https://github.com/coldteadotai/pr-lens/blob/39750d165efd824d1203df7793ecbfed35b6361e/packages/agent-skill/references/example.graph.json) 明确有 provenance/base/head、lanes、节点 delta 和 files；[payload.graph.json](https://github.com/coldteadotai/pr-lens/blob/39750d165efd824d1203df7793ecbfed35b6361e/packages/schema/examples/payload.graph.json) 是进一步可审的载荷案例。示例里的 repo、SHA 和数据属于项目案例，不证明此研究已对那个业务仓库完成比对。

## 从 gtindo 关联找到的真实小项目

通过 [gtindo 官方仓库列表](https://api.github.com/users/gtindo/repos) 找到四个直接相关的自有项目。没有把用户的 fork 当原创候选。

- [task-view](https://github.com/gtindo/task-view)：Agent 写 functions/components/tests、理由、flows；检查 Git 引用与未描述 changed lines，离线 HTML。1 star。它是首批已选方向，只作来源锚点。作者明确 test results 和 explanation 仍是 Agent 的话，不能转称测试实跑或正确性证明。
- [flowmap](https://github.com/gtindo/flowmap)：Go/JS/TS 静态函数级图，一跳展开、签名与 contract、Git flux；2 stars。作者明确动态/接口候选边和 unresolved，静态 may-call 不等于执行事实。与首批 dependency map、现有 Code Analysis 重叠，第二批不再复制一套。
- [gt-weave](https://github.com/gtindo/gt-weave)：1 star，持续跨会话上下文、项目拥有的 Skills/说明/MAP/spec。选读 [code-map 示例](https://github.com/gtindo/gt-weave/blob/5a3fa03e559461370f7a453946b162c599768f17/examples/sample-project/.agents/skills/code-map/SKILL.md) 明确 map 是导航，避免重复实现说明。可借鉴“导航位置/已决定事项/待办证据分开”的 artifact 组织；不是需要迁入 Archify 的运行框架。
- [md-viewer](https://github.com/gtindo/md-viewer)：0 star，解决 Markdown 大 Mermaid 变成邮票的问题，有缩放、全窗、minimap/search、编辑错误保留最后正确图。选读 [engine.ts](https://github.com/gtindo/md-viewer/blob/b6015d51e4ead5cb270d4c58564cdfe12598bcd3/core/src/mermaid/engine.ts) 可见 Mermaid 串行队列、按 source/theme/config 缓存及 strict security。Archify 已有 Viewer，适合检查 reader 的局部体验缺口，不宜嵌入新桌面壳。

## 第二批小工具清单（14 项，按问题而非 star）

以下各项的 README 与选定代码/manifest 已读，版本和许可在末表。除特别注明，描述是上游声明加局部机制检查，没有运行验收。

| 工具（当日 stars） | 用户的具体问题 / 核对机制 | Archify 最小机会与成本边界 | 之后怎样取得截图证据 |
| --- | --- | --- | --- |
| gt-weave（1） | 会话后找不回决定和代码入口；项目拥有导航和协议。 | 用已有 Explainer 展示一个 MAP 的入口与决策来源；不接管 Agent 编排。成本低，但与文档导航重叠。 | 先用 sample-project 的 MAP/文档做固定输入，截入口跳转和来源卡，不运行 setup。 |
| md-viewer（0） | 大 Mermaid 标签小，修语法会丢失阅读状态。 | 核对局部图放大/回位、last-good + error 标记，避免新 diagram type。成本中。 | 上游 README 有功能图；后续用同一大图固定缩放、错误输入前后各截一张。 |
| [hunk-gh](https://github.com/modem-dev/hunk-gh)（10） | 想直接从 PR/commit/compare URL 开审，无需切上下文。选读 src/github.ts 有响应字节上限和取消路径。 | 只读 URL→下载 diff/provenance→已有 reader 的薄入口；先只 github.com、公开 PR，失败保留旧产物。成本中；不是另写 diff UI。 | 已有 assets/hunk-gh.png/gif 可先看；实现后固定公开 fixture URL，截图 URL、head SHA、scope。 |
| [hunk-lens](https://github.com/modem-dev/hunk-lens)（5） | Split diff 一行太宽，眼睛要左右追踪。index.tsx 只有三行固定底部镜片 old/new，依赖 public pane API。 | Explainer code/diff 中选中一行，固定显示 old-above/new-below。明确有窄屏/长行案例才做，避免无用新增面板。成本低。 | 上游 assets/hunk-lens.png/gif；后续用 160 字符改动行、窄窗口及无选中态三图。 |
| [plannotator-tui](https://github.com/plannotator/plannotator-tui)（203） | 在终端读计划，选句评论并把编号反馈交给 Agent。anchor.rs 区分 rendered quote、raw byte range、version 与前后文。 | 对现有 Explainer 选区导出 feedback JSON；只本地，不接自动发信/Agent命令。需要确定 stale/ambiguous 行为，成本中。 | README 有 ASCII 操作示例；固定两处相同句子、一次上游文本改动，截图已定位/歧义/过期状态。 |
| [differential](https://github.com/thepartly/differential)（17） | 按文件读大 diff 看不出意图和先后顺序。spec/grouping.md 使用机械 classes，模型只合并/标记 class IDs，遗漏可回填；ADR0009 用内容哈希固定分组。 | 导入分组、只呈现阅读包→依赖顺序→未覆盖内容。先不内建模型或 AST 引擎；组是建议不是事实。成本中。 | README 视频为现成入口；后续用固定 3组/1未分组 fixture，截组选择与SHA变化的失效提示。 |
| [lazydiff](https://github.com/Ataraxy-Labs/lazydiff)（165） | Terminal PR queue、语义 entity 变化和轻量本地 review 状态；仍 alpha。src/app.rs 可见 unified diff、selection、local state 等边界。 | 借鉴 entity change list→图元素定位；单个已有 parser 输出适配。Archify Code Analysis 已存在，不能再引入平行 parser。成本中。 | README 已有界面截图；后续以一次方法移动+实质修改说明 entity 分类和源代码回链。 |
| [sdrev](https://github.com/finallyclearsky/sdrev)（0） | 每个 hunk 的解释和原代码分离；自包含 HTML 对齐两者。schema 明确 direct/merge-base、originalBase、model 与 codeDiff/semanticDiff。 | 薄导入 JSON 展示“解释对应哪个 hunk”、缺失解释显式标记。无明确许可，不抄源码；作者仓库名与 README installer owner 不同，后续须核实分发源。成本低至中。 | README screenshot 先看；未来同一 diff 内一个有解释/一个无解释，再换 base，截图对齐及来源。 |
| [agent-chatter-visualizer](https://github.com/jasmeetsb/agent-chatter-visualizer)（1） | 跨会话提出/争论/决定埋在互发消息，commit不记录讨论轨迹；Python标准库、fictional demo，摘要网络功能 opt-in。 | 脱敏事件 JSON→sequence/decision cards→原始消息ID。先不扫描家目录、不做自动总结、不导出完整会话。成本低至中。 | 上游 docs/img/dashboard.png 与 demo JSONL 可先审，后续仅使用 fictional mesh fixture，截争议→决定和原文来源。 |
| [otel-agent-trace](https://github.com/mii012345/otel-agent-trace)（6） | 不知工具调用在等什么；parse_session.py 转 session/turn/tool_call，刻意不记录会话、路径、命令。 | 第二批优先借鉴“只导出指标属性”的数据边界；timing importer 已被首批 Chrome trace 覆盖，暂不再立同类。README称MIT但仓库未见LICENSE文件，代码复用前补确认。 | 不启动Docker；先审README示例。后续合成时间戳且缺失结果事件，截 unknown duration，不填零。 |
| [coding-agent-visualizer](https://github.com/everettjf/coding-agent-visualizer)（19） | JSONL不可读；graph、waterfall、token flame、file heatmap、session compare。export.ts 可输出自包含HTML/Markdown并截断工具结果。 | 首批 timing 之外，值得看“同一任务两次run文件触达/工具行为比较”。只统计显式字段，缺token/价格应unknown；不导入reasoning文本。成本中。 | assets/screenshots/graph.png、flame.png、stats.png；后续用2份合成session，截工具差异与缺失token，不拿真实工作会话。 |
| [markport](https://github.com/yomon8/markport)（2） | Agent产物散落文件夹，读过的diff在新改动后仍像已审。web/src/review.ts以rootId+path保存revision，同路径revision变化删除已读。 | 将同一内容哈希绑定阅读标记，内容变动提示重审；只localStorage、支持重置，不等同审批。无明确许可，独立实现行为。成本低。 | 固定同路径v1/v2的fixture，三张：已读→内容变化→待重审；不需运行上游。 |
| [json-semantic-diff](https://github.com/cchandurkar/json-semantic-diff)（11） | Array重排让行diff充满噪声；可组合key匹配，含置信度/人工覆盖。identity-inference.ts 明确质量项、波动字段惩罚、阈值。 | 配合payload delta先要求明确idKey，显示数组顺序变动与字段变化；自动猜身份是后续可选，不能悄悄把低置信匹配当事实。成本中。独立core要求Node>=22，不能直接突破Archify运行契约。 | docs/screenshots/main.png/how-is-score-calculated.png；后续同一inventory重排+一字段变化，截稳定键和歧义匹配对照。 |
| zier-one/pr-lens（3） | 大diff受预算截断，人以为审了全部。src/diff.rs / output.rs 对应过滤/输出边界；README明确ignored/truncated/omitted。 | 任何review导入都展示“包含/忽略/截断/省略”scope notice；复用现有diagnostics，不另建完整Gitea审阅服务。无明确许可。成本低。 | 构造1 omitted、1truncated、1ignored fixture，截图范围说明与主图同时可见；不需要调用Codex。 |

成熟对照而非“小工具凑数”：[Hunk](https://github.com/modem-dev/hunk)（9,678）说明 terminal inline annotation 的成熟边界；[Plannotator](https://github.com/backnotprop/plannotator)（9,622）说明广泛 harness hook/feedback 是完整产品，不该全搬；[sem](https://github.com/Ataraxy-Labs/sem)（3,422）是 LazyDiff 的 entity diff 来源，32-language parser/CLI/MCP 的维护面很大。这里关注低成本接口和小体验，不按热度推测价值。

## Archify 当前工作去重

已检查 `gh pr list --state all --limit 100`，并另用 GitHub issue search 对全部PR查 payload/annotation/session/semantic/review/compare，再读取以下相关 PR 正文。检索词不能证明绝无其他重叠，正式实施仍需再次刷新。

- [#1049 Git refs snapshots](https://github.com/tt-a1i/archify/pull/1049) OPEN：已做本地 Git refs→Architecture Delta；不能再提“两个ref一键比较”作为独特机会。payload字段卡是在其上展示数据契约层，仍需确认 schema。
- [#367 ownership map / locate / drilldown](https://github.com/tt-a1i/archify/pull/367) OPEN Draft：路径归属、unclaimed/ambiguous、manifest-bound children。避免把 review coverage 与 ownership coverage 混称。语义阅读包应只消费分组事实，不再造locate。
- [#398 authored node explanations](https://github.com/tt-a1i/archify/pull/398) OPEN：Passport已有可选 authored explanation提案。sdrev导入应使用既有说明承载，不新增同义字段。
- [#1015 Explainer comprehension](https://github.com/tt-a1i/archify/pull/1015) OPEN：含代码focus/source展开、step locking、flow animation；hunk-lens必须先证明“超长单行旧新上下对照”剩余缺口，不能当作普通code-focus新功能。
- [#1056 artifact evidence index](https://github.com/tt-a1i/archify/pull/1056) CLOSED：存在delivery provenance查询工作；闭合状态不代表已合并。Agent消息证据链要复用身份/来源概念，不宣称本项目没有证据索引。
- [#1063 GHE source links](https://github.com/tt-a1i/archify/pull/1063) OPEN、[#865 Gitea](https://github.com/tt-a1i/archify/pull/865) OPEN：不要重复provider link支持；hunk-gh学习的是薄入口与预算，不是新增forge全面集成。
- [#730 Tracks](https://github.com/tt-a1i/archify/pull/730) OPEN、[#150 cognition](https://github.com/tt-a1i/archify/pull/150) OPEN：session trace/decision证据尽量用现有sequence/lifecycle，不立新type，也不把消息来源误装成内部推理路线。
- Code Analysis已有[#979](https://github.com/tt-a1i/archify/pull/979)、[#1007](https://github.com/tt-a1i/archify/pull/1007)合入记录，当前[#998](https://github.com/tt-a1i/archify/pull/998)、[#1075 Java](https://github.com/tt-a1i/archify/pull/1075)仍OPEN。flowmap/sem类建议必须基于现有模块，不再启动解析器工程。

首批 task review map、dependency map、Chrome trace waterfall、Markdown heading tree、DBML ERD、change coupling 不计作此次第二批交付；上面的引用只是明确边界。

## 固定版本与许可证据

许可读取方式：GitHub仓库metadata + license端点；双许可证项目再看Cargo.toml。未见LICENSE并不等于确认无其他授权，只代表此次不能建立代码复用许可链。MIT项目复用也须保留通知，且第三方/vendor资产另查，不能只用仓库顶层许可包办。

| 项目 | 查验 source commit | 许可 |
| --- | --- | --- |
| coldteadotai/pr-lens | `39750d165efd824d1203df7793ecbfed35b6361e` | [MIT](https://github.com/coldteadotai/pr-lens/blob/39750d165efd824d1203df7793ecbfed35b6361e/LICENSE) |
| gtindo/task-view | `f27b8bef63ec336b8e3487e90ccd484a2fa7a235` | [MIT](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/LICENSE) |
| gtindo/flowmap | `1f8a8a37f61e19fc1405d8941647279f242ea425` | [MIT](https://github.com/gtindo/flowmap/blob/1f8a8a37f61e19fc1405d8941647279f242ea425/LICENSE) |
| gtindo/gt-weave | `5a3fa03e559461370f7a453946b162c599768f17` | [MIT](https://github.com/gtindo/gt-weave/blob/5a3fa03e559461370f7a453946b162c599768f17/LICENSE) |
| gtindo/md-viewer | `b6015d51e4ead5cb270d4c58564cdfe12598bcd3` | [MIT](https://github.com/gtindo/md-viewer/blob/b6015d51e4ead5cb270d4c58564cdfe12598bcd3/LICENSE) |
| modem-dev/hunk-gh | `bdf6f9613f575b286d3af6edafc733249e933ddf` | [MIT](https://github.com/modem-dev/hunk-gh/blob/bdf6f9613f575b286d3af6edafc733249e933ddf/LICENSE) |
| modem-dev/hunk-lens | `60646ae8bd45f8682bedde803c5f10aebf7f19ed` | [MIT](https://github.com/modem-dev/hunk-lens/blob/60646ae8bd45f8682bedde803c5f10aebf7f19ed/LICENSE) |
| plannotator/plannotator-tui | `196cb1dcdccbbf0cb71c84bd226eb9f0772d1a86` | [MIT](https://github.com/plannotator/plannotator-tui/blob/196cb1dcdccbbf0cb71c84bd226eb9f0772d1a86/LICENSE) |
| thepartly/differential | `f262ca231f02de7e782969a2d4a3ca8e01ae39ec` | [MIT OR Apache-2.0（Cargo）](https://github.com/thepartly/differential/blob/f262ca231f02de7e782969a2d4a3ca8e01ae39ec/Cargo.toml) |
| Ataraxy-Labs/lazydiff | `bf8d6e672dd70537488e0d912c2b998707231637` | [MIT](https://github.com/Ataraxy-Labs/lazydiff/blob/bf8d6e672dd70537488e0d912c2b998707231637/LICENSE) |
| finallyclearsky/sdrev | `7feeb53a243c908b6d4b08c05ff8483d955ae6cc` | 本次API未见LICENSE；[源码树](https://github.com/finallyclearsky/sdrev/tree/7feeb53a243c908b6d4b08c05ff8483d955ae6cc) |
| jasmeetsb/agent-chatter-visualizer | `87c144adabc5a0a4ad1efd062c9706ffa74c3f4c` | [MIT](https://github.com/jasmeetsb/agent-chatter-visualizer/blob/87c144adabc5a0a4ad1efd062c9706ffa74c3f4c/LICENSE) |
| mii012345/otel-agent-trace | `01c859aae714dde7fbf4a9c7105ee99fd634fa24` | [README声称MIT](https://github.com/mii012345/otel-agent-trace/blob/01c859aae714dde7fbf4a9c7105ee99fd634fa24/README.md)，未见LICENSE文件 |
| everettjf/coding-agent-visualizer | `6048af3a53d71e517c47454a681a3802651e082f` | [MIT](https://github.com/everettjf/coding-agent-visualizer/blob/6048af3a53d71e517c47454a681a3802651e082f/LICENSE) |
| yomon8/markport | `9046ac56fbb553954fbd602c1cead7c3b8c6990a` | 未见LICENSE；[已读状态源文件](https://github.com/yomon8/markport/blob/9046ac56fbb553954fbd602c1cead7c3b8c6990a/web/src/review.ts) |
| cchandurkar/json-semantic-diff | `6ef190d735cf67c57534f97299ea98022f8c7d0f` | [MIT](https://github.com/cchandurkar/json-semantic-diff/blob/6ef190d735cf67c57534f97299ea98022f8c7d0f/LICENSE) |
| zier-one/pr-lens | `a22bccf921f740dd05c676d7da5eb9e1a90348f6` | 未见LICENSE；[源码树](https://github.com/zier-one/pr-lens/tree/a22bccf921f740dd05c676d7da5eb9e1a90348f6) |
| VTorres09/PRLens | `8e3d99a74abc40585c6e4fb60b871f5db5a86712` | 未见LICENSE；[源码树](https://github.com/VTorres09/PRLens/tree/8e3d99a74abc40585c6e4fb60b871f5db5a86712) |
| modem-dev/hunk（成熟对照） | `051d33c0a6c47e9964315c13bcf98033b39b464f` | MIT |
| backnotprop/plannotator（成熟对照） | `2f1d1af13c0dac1cc817c8e9351361c551ff6fe0` | 树中LICENSE-APACHE、LICENSE-MIT，复用前按包确认 |
| Ataraxy-Labs/sem（成熟对照） | `f7fa398c69b9e33d9a69b3490d02097edbe5c8dc` | 树中LICENSE-APACHE、LICENSE-MIT，复用前按包确认 |

## 后续可证伪的验收问题

- Payload卡是否让审阅者找到真实新增字段，而不是只看颜色感觉“更懂了”？固定同一变更，用普通diff与契约卡比较定位时间/错误；不以动画喜好替代理解收益。
- 消息证据图是否准确保留异议和撤回，不把模型summary写成事实？每个结论必须能点回明确事件；缺失消息显示未知。
- 已读标记在内容更新后是否失效，同路径不同内容、同内容移动、重复quote如何解释？先写清规则再实现，不能新增“已验收”语义。
- 截图统一用公开/虚构fixture，固定版本、主题、视口、状态；上游截图是作者演示，不能当Archify集成效果。本轮没有生成或接受新实现。
