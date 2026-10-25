# 第十四轮：图交互、代码定位与变更审阅

2026-10-25，只读发现。**本轮建议零实施。** 找到两个可具体追到源码的阅读机制：CoGraph 的跨文件关系抑制与邻接恢复；crgraph 的层级连线聚合与成员回查。它们值得记录，但没有证明当前 Archify 的真实作品存在一个尚未覆盖、值得低成本修复的问题。没有为凑数量再做教学图、adapter 或新平台。

初始排重读取本日 README 和全部 scouts，共 62 份文件、463 个外部 GitHub 仓库引用；又按下列 owner/repo 与项目名全文查询。六项在该快照均未覆盖。搜索优先最近活跃项目，不设 stars 门槛；仓库搜索结果只是发现线索，不是质量或许可证据。本轮只对下列 **6 个项目**读取一手源码/README/许可，深入其中两份完整已提交输入。未运行上游、安装、测试、浏览器、AI provider 或本机会话采集。

产品对照固定为 GitHub dev [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，已重新核对 GitHub ref。公开实验候选与 dev 区分；没有把新分支里的改动说成 dev 已提供。

## 六个固定来源

| 来源 / 固定 SHA / 许可 | 具体阅读操作与核到的边界 | 本轮判断 |
| --- | --- | --- |
| [thraenbe/cograph](https://github.com/thraenbe/cograph/tree/80822650cc1ca9fca088273b63d65cc9431e78b0) · `80822650cc1ca9fca088273b63d65cc9431e78b0` · [MIT](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/LICENSE) | same-file-only 开关抑制跨文件线；hover 当前函数临时恢复邻接线，特定节点有隐藏关系虚线环。click 按 node.file/line 打开定义或 popup。完整 fixture 与具体条件见下。 | 机制具体；不是每条调用边都有 callsite。Archify 已能局部读关系，没有先加默认隐藏再补提示的必要。 |
| [lukisk/crgraph](https://github.com/lukisk/crgraph/tree/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1) · `1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1` · [MIT](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/LICENSE) | Modules/Files/Symbols 切层，点击聚合连线回查 underlying connections；Before/Merged/After 过滤原图状态；搜索会揭示祖先并调整相关筛选。 | 最有价值的新细节是“一个可见线条保留其成员集合”，但它依赖专用层级投影；与在审 Atlas 相邻，不是 Archify 现有边被漏画的证据。 |
| [derekdshaw/agent-work-visualizer](https://github.com/derekdshaw/agent-work-visualizer/tree/6b78ec0a88501425919db68873e8dd82a677ec94) · `6b78ec0a88501425919db68873e8dd82a677ec94` · [MIT](https://github.com/derekdshaw/agent-work-visualizer/blob/6b78ec0a88501425919db68873e8dd82a677ec94/LICENSE) | 编辑目标 reticle、邻居逐 hop 点亮、事件 replay。实际 [load.ts L105–172](https://github.com/derekdshaw/agent-work-visualizer/blob/6b78ec0a88501425919db68873e8dd82a677ec94/web/src/graph/load.ts#L105-L172) 把两方向调用压到一条无向邻接并另存方向 bits，BFS hop 用的是该邻接；[reduce.ts](https://github.com/derekdshaw/agent-work-visualizer/blob/6b78ec0a88501425919db68873e8dd82a677ec94/web/src/session/reduce.ts) 按事件时间折叠当前读/改目标。 | 不是新的有向影响分析；Archify 已有 Reach/关系追踪。采集器、3D 和事件时间状态不是静态作品的免费增强，不新增实时会话平台，也未读取本机 transcript。 |
| [debnathSD/spectra](https://github.com/debnathSD/spectra/tree/94462ccf960818c1289d8707970ecffeba5c659c) · `94462ccf960818c1289d8707970ecffeba5c659c` · [MIT](https://github.com/debnathSD/spectra/blob/94462ccf960818c1289d8707970ecffeba5c659c/LICENSE) | [CodeRef.jsx L4–44](https://github.com/debnathSD/spectra/blob/94462ccf960818c1289d8707970ecffeba5c659c/src/components/CodeRef.jsx#L4-L44) 显示 file:line、工具内打开文件、可选 VS Code 链接；按名称定位的行显式加 `≈` 与说明，没有把它伪装 sourcemap 行。README 指向同产品的 Progen Labs 命名空间，本轮不另计一个新项目。 | 可借鉴位置质量可见性，但 Archify 当前固定 Git ranges/来源、Diagnostic locations 等已有路径；没有读取到现有 Archify 输入带“推测行”却被 UI 宣称已核验的案例。其浏览器性能测量/自动改代码工作流不在本轮范围。 |
| [xadupre/onnx-light-viewer](https://github.com/xadupre/onnx-light-viewer/tree/bee6fcb128d5d3cd95b8664e9a4afb80a7332329) · `bee6fcb128d5d3cd95b8664e9a4afb80a7332329` · [Apache-2.0](https://github.com/xadupre/onnx-light-viewer/blob/bee6fcb128d5d3cd95b8664e9a4afb80a7332329/LICENSE) | [viewer.js L1145–1206](https://github.com/xadupre/onnx-light-viewer/blob/bee6fcb128d5d3cd95b8664e9a4afb80a7332329/media/viewer.js#L1145-L1206) 做 node/operator 搜索建议和结果定位，navigate 发送图内 path；[pathHistory.ts](https://github.com/xadupre/onnx-light-viewer/blob/bee6fcb128d5d3cd95b8664e9a4afb80a7332329/src/pathHistory.ts) 的历史是模型文件/目录来源历史，不能把文件打开历史误读为节点探索历史。 | 搜索和子图入口不是新缺口；引入模型格式/C++ backend/编辑器消息桥成本过高，不为借这些通用操作扩 ONNX 平台。没有运行模型或生成器。 |
| [mohamedsamman991/CodeScope](https://github.com/mohamedsamman991/CodeScope/tree/3c7f48c6d6e6bb8bbb9018a71b6113db63ef5be2) · `3c7f48c6d6e6bb8bbb9018a71b6113db63ef5be2` · **未找到完整许可** | 固定 tree 只有 README.md、codescope.py；[README](https://github.com/mohamedsamman991/CodeScope/blob/3c7f48c6d6e6bb8bbb9018a71b6113db63ef5be2/README.md) 许可段仍提示作者补充许可证。没有独立输入 fixture；不能把泛称 visual overview/AI explanation 当作验证过的图交互合同。 | 仅作发现后排除项。GitHub 可见不等于获得实现复用许可，不复制实现，也不把它当第 3 个深读样例。 |

许可正文已读取；非 GitHub metadata 猜测。完整 LICENSE 的 bytes / SHA-256：CoGraph `1061 / d509929698a6b3ef11e94bfd323b7d7c16539ee7c384ef1200705dbc6b0428d7`；crgraph `1063 / c62da480f992358d7468b6fb9928070c4f531c49e884edd9efe4375d8ee4b17f`；agent-work-visualizer `1067 / 026867002c8ce8857ee476fc2a15a45b208f26f47cfc1fadd32f8c542f2a0d96`；Spectra `1078 / 650a9b641a775d822afb00fa828c4908fb9f081ef7c0dc6ffc528c1908a759e6`；ONNX Light Viewer `11360 / 6913f15c3015d2a27470002b8ba9eb4a2e22e69b7967120bdbfcab39f1b389fa`。

## 完整输入一：CoGraph 的隐藏邻接恢复

固定 [src/test/suite/mcpFixture.ts](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/test/suite/mcpFixture.ts) 全文件 **4638 bytes**，SHA-256 `998b2419bf7413beff07001c04cca424302bf2212871fded1e7feb8e20c61169`。这是已提交的**完整测试构造源码**，不是独立 dump JSON、自然项目输出或本轮分析器运行。字面构造有六份源文件字符串、14 nodes、12 edges，含同文件链、跨文件调用、环、两个不同定义行的同名 cli、library 与故意 dangling target；没有删掉不兼容项后宣称支持完整真实调用图。

明确的读者操作是：保留 same-file-only，hover 一个函数，再沿出现的跨文件邻接看去处。实际实现链为：

1. [controls.js L147–151](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/controls.js#L147-L151) 只改设置并应用显隐，不重跑分析器。
2. [rendering.js L542–560](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/rendering.js#L542-L560) 标 `xfile` / `same-file-only`；[CSS L1418–1424](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/styles.css#L1418-L1424) 隐藏跨文件线，hover 的 `.cg-hl` 邻接例外。边仍在 DOM，不是修改原拓扑。
3. [crossLinks.js L167–217](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/crossLinks.js#L167-L217) 的 `hiddenOnly` 必须同时满足“有隐藏邻接、零同文件邻接”，并非所有跨文件节点；[CSS L1453–1462](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/styles.css#L1453-L1462) 避免覆写已有 Git outline。file `↗` count 又只统计流向其他已知 project file 的边，按 `_count` 加权，不包括 library/unknown/self-loop。
4. [hoverIndex.js L15–80](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/hoverIndex.js#L15-L80) 以 node ID 索引边元素，只处理该节点邻接；这是源码复杂度描述，不是本轮性能测量。

按 fixture 静态推导：`Svc.start → helper` 具备 hidden-only 条件；`helper_py` 虽跨文件调用 leaf，但另有同文件 run→helper_py，所以不是同一种提示。未运行构造或观察 DOM，不能把这个推导写成浏览器实测。

源码定位也有具体边界：[rendering.js L600–608](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/webview/rendering.js#L600-L608) 发送 node.file / node.line，宿主 [graphProvider.ts L1046–1055](https://github.com/thraenbe/cograph/blob/80822650cc1ca9fca088273b63d65cc9431e78b0/src/graphProvider.ts#L1046-L1055) 将一基定义行减一打开编辑器。GraphEdge 没有 callsite 范围。不能据此建议 Archify 补一个“每条调用边返回调用点”按钮而不先提供位置数据。

**价值/成本判断：** Archify 并不默认按 file 隐藏普通边。先加过滤再加“隐藏提示”没有已证明收益，却会新增 file/library/aggregate 身份、counts、导出清理与 search/reveal 状态。保留为未来真实引入过滤时的要求，不做新的语义教学作品或 VS Code bridge。

## 完整输入二：crgraph 的聚合线成员回查

固定 [tests/data/nested_layout_crash.json](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/tests/data/nested_layout_crash.json) 全文件 **9041 bytes**，SHA-256 `da3130a341bfa8cd24884bc5679e4ad76995fd797f5b7c7c5eea66b25d5e7aeb`。字面数据为 36 nodes（8 modules、9 files、8 classes、11 functions）和 4 calls edges（3 removed、1 added）。[test_html.py L299–326](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/tests/test_html.py#L299-L326) 明称它是 names masked 的匿名化布局崩溃回归图；测试另加 range/stats/findings 等外壳。因此它是完整已提交 **graph fixture**，不是完整独立 report.json 或本轮新采集的真实仓库输出。只用标准库读 JSON 计数，没有运行上游渲染、测试或 git 分析。

读者操作是：切 Files 层，看 `file:f73 → file:f44` 的合并线，再点这条线区分其底下的关系。固定数据中 `sym:s329 → sym:s174` 是 added，`sym:s330 → sym:s174` 是 removed；两者分别经各自 parent 链落到同一对文件。以下是静态源码推导，未声称实际打开页面：

- [report.js L14–16](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L14-L16) 用 src/dst/kind 计算原模型边 ID；不是用户 authored UUID，也不能套到任意平行边身份合同。
- [L67–85](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L67-L85) 先按 Before/Merged/After 和状态/测试/focus 条件决定 visible，再把端点 lift 到可见祖先。
- [L153–199](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L153-L199) 按可见有向端点聚合，保留 `ids[]` 与 count；[L143–150](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L143-L150) 把 added/removed 混合线归为 modified，不把增加一次调用说成首次新增依赖。同一个可见端点的内部边会被省略，这不是原模型没有关系。
- [L450–474](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L450-L474) 点击线，按 `ids[]` 回查 kinds/statuses、原 src/dst，最多列 40 项并提示更多；不是把聚合线冒充单条调用。该 fixture 中上述两个成员会各自保留 added/removed。
- [L119–140](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L119-L140) 还会抑制可由其他路径解释的 unchanged module dependency；这是该阅读投影的专用取舍，不能直接移植到保留 authored edges 的原生图。

搜索/[finding reveal L395–411](https://github.com/lukisk/crgraph/blob/1f1b84f26df0417525be23d3ad1ffc3fbc29d8d1/src/crgraph/render/assets/report.js#L395-L411) 不只移动相机：必要时会改变 focus、tests、statuses 和 before/after mode，再展开祖先。这个“能找到”依赖整套过滤状态合同，不是一个无状态快捷键。上游 Playwright 测试有层级切换和 mixed-status 线的期望，但本轮没有执行；不借它们声称图已实测可读。

**价值/成本判断：** 成员回查有具体价值，但 Archify 当前没有同类通用 module/file/symbol 折叠聚合 view。若引入，要同时定义可见边与原边的身份、多种状态汇总、筛选恢复、导出和交互历史；不是复制一个颜色函数或 count 标签即可完成。其图概览又和 #1103 Atlas 的 module/file 依赖投影相邻，应先在那条在审范围内讨论，而不是启动平行代码审阅平台。

## 与当前 Archify 和 open PR 排重

- [Focus / Reach @10b4 L183](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L183)、[relationshipsFor L614](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L614) 已能选节点读直接关系、沿 authored 上下游追踪；Route、Finder、Outline 不是空白能力。没有证据表明需要把 agent-work-visualizer 的无向 hop 动画再移进来。
- [Tree reveal/collapse @10b4](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/tree-branches.js#L24-L66) 已保持原拓扑、隐藏后代、按选择揭示祖先；它不是任意调用图的合并线投影。此前 [graph-reading round 5](graph-reading-round5.md) 已深入动态折叠/布局与稳定阅读，不能把本轮再包装成同义切口。
- [SourceCard @10b4 L599–625](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L599-L625) 已读 prepared 的固定 Git path/range/revision；新 dev 的节点 Explain 与 drilldown 已提供叙述/子图入口。[source-block-reading audit](source-block-reading-audit.md) 与 [code-navigation round 5](code-navigation-round5.md) 也已处理来源范围/调用位置，未找到新的真实输入反例。
- GitHub 本轮重读 [#1103](https://github.com/tt-a1i/archify/pull/1103)：**OPEN、draft 讨论范围**，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，不是已发布能力。其 Atlas 文件/函数概览、module/file 依赖、finding→Classic evidence handoff 与本轮聚合阅读相邻；它又明确尚无函数调用图，不能把 crgraph 或 CoGraph 的调用边宣称已覆盖。[#998](https://github.com/tt-a1i/archify/pull/998) 也仍 OPEN，head `25b767c72e9463a89e9e89b696d26a52318189b3`。
- [#1015](https://github.com/tt-a1i/archify/pull/1015) 已有 code focus / SourceCard 展开复制范围；[关系数据 unavailable #795](https://github.com/tt-a1i/archify/pull/795) 本轮 body 明确 **按维护者要求暂停**，等待具体 generic workflow 和重新范围同意。不能因为外部工具存在 hidden/dangling 数据，就擅自恢复它或把未知覆盖改成零关系。
- 既有 Relation reference、Finder matches/context、Clipboard outcome、Source keyboard 等实验和刷新各自有固定证据；没有把它们又计作本轮新发现，也不复用旧 test 计数作为本轮执行结果。

## 处置与证据缺口

**没有发现足以立即给 root 提交新 before/after 实施案的缺口。** 本轮的 before/after 仅能描述外部产品自己的开关/层级操作，尚没有一张当前 Archify 真实作品证明同样动作失效。维护成本较高的方案是过滤/聚合、静态分析器/编辑器桥、事件采集或专用模型平台；低成本的邻接阅读、来源定位、检索揭示又已存在或在审。零实施比先造一份受限图再声称缺能力更符合现有证据。

若以后真实使用要求聚合隐藏关系，最小新证据应是现有作品、明确的 reader 动作、原始边与可见边成员账目、筛选前后状态和保真导出要求，再与 Atlas 范围对齐。当前不制作新教学样例，不引入依赖，也不启动另一套 graph reader。

所有原件只留临时目录；仅新增本报告，未改产品、README、其他 agent 文件、refs 或 GitHub 状态，未评论、commit 或 push。research 技能要求的一个后台代理只深读 CoGraph；本代理独立负责排重、其余五项、crgraph 完整输入与当前产品/PR 对照。源码阅读、作者测试期望、静态数据计数和未进行的浏览器/用户接受始终分开。
