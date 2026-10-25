# 图的阅读与探索：10 个开源项目对照

调研日期：2026-10-25。Archify 比较基线：`82c7e0f089a02a4d514714adf37dc2061682da5f`。本轮只读代码、官方文档和 GitHub 状态，没有运行外部产品的交互验收，没有修改 Viewer，没有生成截图；下文是供独立实验分支执行的固定输入方案。使用项目 `archify-review` 的价值、成本、影响框架；项目功能属来源核实，Archify 收益属待验证假设。

结论：优先实验 **Finder 查询结果在画布中同步强调**；其次实验 **Reach 的 1/2/全部跳数阅读切片**。两者均复用当前 SVG、语义 ID 和相机，只借鉴行为，不引入下面的渲染库。普通搜索、邻居高亮、小地图、路径播放、类型筛选已经存在，不值得再造一套。

## 先确认当前产品和在途工作

检查过 `viewer/README.md`、`node-finder.js`、`focus.js`、`route-probe.js`、`semantic-lens.js`、`semantic-radar.js`，并读取 `gh issue list --state open --limit 500` 与 `gh pr list --state open --limit 100`。远端状态为当日快照，不是集成授权。

| 能力 | 当前已实现 | 真正剩余的差异 |
| --- | --- | --- |
| Finder | 按 ID、标签、类型、元信息、品牌、源码引用做大小写无关子串匹配；结果计数；点击后 Focus + 相机 reveal；Route 起终点上下文 | `render(query)` 只更新列表，尚未把整个匹配集合显示到画布；结果按钮只有 click 监听 |
| Focus / Reach | 单节点邻居、选择集合、出入关系预览/固定、upstream/downstream 有向 BFS；已有每节点 `data-reach-depth`、结果 `maxDepth` | Reach 目前给出全部可达集，没有读者可调的跳数上限 |
| Route / Journey | 有向最短跳数 BFS、起终点 Finder、全路径、逐节点手动/自动播放、深链接、语义卡片 | 不应再提“新增路径探索/逐步播放” |
| Lens | 单类型邻接、双类型跨类型关系；图例 hover/focus 临时预览与点击固定分开 | 3+ 类型比较是既有议题，不作为新实验 |
| Radar / overview | 节点矩形、当前视口、活动状态；可拖动视口、节点定位；面板空间适配 | 不应再提新增 minimap 或再接 React Flow |

必须绕开的现有范围：

- [#83 多角色比较和一致预览](https://github.com/tt-a1i/archify/issues/83)：已经讨论 3–4 项比较及 Reach hover/focus 预览。本报告不把这些写作新发现。
- [#221 关系探索避开 Passport](https://github.com/tt-a1i/archify/issues/221)：涉及相机安全区、紧凑 Passport、点击才 reveal；本报告两个实验均不接管其相机和面板策略。
- [#664 底部 Node index 分组换行](https://github.com/tt-a1i/archify/issues/664)：与 Finder 列表布局是不同表面，不搭车重排底部索引。
- [#816 查询不可用不能写零关系](https://github.com/tt-a1i/archify/issues/816)、[PR #795](https://github.com/tt-a1i/archify/pull/795)：跳数实验必须沿用“未知/不可用”结果，不把它归入“0 项”。
- [PR #1093 IME 全局快捷键](https://github.com/tt-a1i/archify/pull/1093)、[#902 Finder IME Enter](https://github.com/tt-a1i/archify/issues/902)、[#925 面板组合输入](https://github.com/tt-a1i/archify/issues/925)：Finder 实验不改变键盘提交、输入组合、全局快捷键。
- [PR #1051 缩小时保留长图顶部](https://github.com/tt-a1i/archify/pull/1051)、[#1001 相机容器视口](https://github.com/tt-a1i/archify/pull/1001)、[#1027 移动端导航与面板](https://github.com/tt-a1i/archify/pull/1027)：与候选可能共享视觉表面，固定基线比较，不复制修复。

## 项目证据与机会/成本

许可来自官方文档或仓库 LICENSE/README。当日匿名 GitHub API 曾限流，随后用已认证 `gh api` 核实；未把 GitHub 的单一 license 检测当作双许可项目的完整结论。这里不提供许可兼容性法律结论，也不建议复制实现代码。

| 项目与许可 | 一手可核实功能 | 对 Archify 的机会、成本和判断 |
| --- | --- | --- |
| [Cytoscape.js](https://js.cytoscape.org/)，[MIT](https://github.com/cytoscape/cytoscape.js/blob/unstable/LICENSE) | `neighborhood/closedNeighborhood` 返回邻居和连接边；`display:none` 与 `visibility:hidden` 对边、fit、布局有不同语义 | 邻居高亮已覆盖。借鉴“选择和显示范围分开”，但不要用隐藏节点破坏 authored 布局或导出。接入整个库成本高，无需引入。 |
| [cytoscape.js-view-utilities](https://github.com/iVis-at-Bilkent/cytoscape.js-view-utilities)，MIT | [官方 demo](https://ivis-at-bilkent.github.io/cytoscape.js-view-utilities/demo.html) 有 Highlight Neighbors、Show Hidden Neighbors、Zoom to Selected、框选/套索 | 渐进揭示是有用模式；套索和可见性管理需新增选择状态，不如先用已有 Reach depth。保留行为灵感，不采用其依赖。 |
| [Sigma.js](https://www.sigmajs.org/get-started/add-interactivity/)，[MIT](https://github.com/jacomyal/sigma.js/blob/main/LICENSE.txt) | 官方交互教程同时展示 hover 邻居保色、其余变灰，以及搜索匹配强调、选择结果后相机定位 | 最直接机会：将 Finder 列表中的匹配集合与画布对应起来。Archify 已有选择后定位，剩余是提交前反馈。低到中成本；先做全体匹配强调，暂不叠加 hover 相机。 |
| [Graphology](https://graphology.github.io/standard-library/traversal.html)，[MIT](https://github.com/graphology/graphology/blob/master/LICENSE.txt) | BFS/DFS callback 提供 depth；return true 可停止从当前节点继续扩展；方向默认 outbound。[shortest-path](https://graphology.github.io/standard-library/shortest-path.html) 支持无路径返回 null | 证明深度上限可以是简单遍历约束，不需要“图数据库”。Archify 已有 BFS 和 depth，应直接复用；引入新图模型反而重复状态。 |
| [Graphviz](https://www.graphviz.org/)，[EPL-2.0](https://www.graphviz.org/license/) | [tooltip 属性](https://www.graphviz.org/docs/attrs/tooltip/) 面向节点、边、cluster、graph 的交互输出；[URL](https://www.graphviz.org/docs/attrs/URL/) 可用于 SVG 链接 | 说明静态布局与轻交互能共存；源码链接和 Passport 已覆盖大部。浏览器原生 tooltip 不能替代可键盘操作的详情，优先级低。 |
| [Eclipse ELK](https://eclipse.dev/elk/)，[EPL-2.0](https://github.com/eclipse-elk/elk/blob/master/LICENSE.md) | 官方明确 ELK 计算位置/尺寸而不渲染；支持 ports、hierarchical nodes；[Layout View](https://eclipse.dev/elk/documentation/tooldevelopers/usingeclipselayout/layoutviewsupport.html) 明确大量技术选项更适合开发者/高级用户 | 本轮不把“换 ELK”当阅读改善。可借鉴对普通读者隐藏布局参数；重排将影响显式几何、路由、验证，成本超出阅读实验。 |
| [React Flow](https://reactflow.dev/)，MIT（[官方许可声明](https://reactflow.dev/)） | [MiniMap](https://reactflow.dev/api-reference/components/minimap) 显示 viewport，可开启 pannable/zoomable；[示例页](https://reactflow.dev/examples) 区分 MIT 示例与 Pro 示例，含 contextual zoom、save/restore | Radar 已覆盖 minimap；contextual zoom 有可读性潜力，但 Archify authored 文本与 canonical export 需稳定，暂不加缩放时删除细节。React/编辑器模型不适合替换独立 HTML Viewer。 |
| [Juggl / Obsidian 插件](https://github.com/HEmile/juggl)，[GPL-3.0](https://github.com/HEmile/juggl/blob/main/LICENSE) | [Workspace](https://juggl.io/features/workspace-mode/workspace-mode.html) 可 expand/collapse 邻居、锁定位置、选中后 fit、保存/加载工作区；[Local Graph 文档](https://juggl.io/features/local-graph-mode.html) 的 depth-slider 只是计划，不能算已实现 | “先局部再展开”值得借鉴；不要照搬可编辑工作区或保存布局。Obsidian 本体不作为开源项目计数；只统计开源 Juggl。 |
| [vis-network](https://visjs.github.io/vis-network/docs/network/)，[Apache-2.0 或 MIT](https://github.com/visjs/vis-network#license) | 官方 API 有 cluster/openCluster、selectNodes、focus/fit，cluster 保留其内部节点引用 | 聚合/展开可降低密度，但 Archify 除 tree 外没有通用折叠后的 authored 几何契约，不能低成本替换成 cluster 节点。拒绝先引入物理布局或聚类图。 |
| [AntV G6](https://github.com/antvis/G6)，[MIT](https://github.com/antvis/G6/blob/v5/LICENSE) | [v5 hover-activate 源码](https://github.com/antvis/G6/blob/v5/packages/g6/src/behaviors/hover-activate.ts) 明确 `degree` 表示 n 度关系，`direction` 支持 both/in/out，inactiveState 与 active state 分开 | 强证据支持“范围”和“强调状态”是两个简单维度；复用 Reach depth 比再造通用 Behavior 管理器便宜。官网一条文档路径返回营销页，故此项以源码为准。 |
| [Gephi](https://gephi.org/)，[CDDL-1.0 或 GPL-3.0](https://github.com/gephi/gephi#license) | [官方 Quickstart](https://gephi.org/quickstart/) 有拓扑/属性过滤与 Degree Range；[官方 Toolkit 教程](https://gephi.org/tutorials/gephi-tutorial-toolkit.pdf) 的 Ego filter 支持 depth，MAX 表示连通分量 | 跳数作为读者控制有成熟先例；不借用完整 filter pipeline、graph copies 或复杂查询 UI。保留 1/2/全部即够实验。 |

这里列 11 项，其中 Cytoscape extension 作为独立开源项目；若只计算独立生态则为 10 个。

## 候选 A：Finder 查询匹配同步到画布（优先）

**用户动作**：输入 `API` 或 `platform`，无需先点结果，就能看到这些结果在整个图中的分布；Enter/点击仍是唯一提交选中节点的动作。清空查询、关闭 Finder、离开普通 focus 上下文即撤销匹配强调。

**现有缺口**：Finder 已经算出 `visibleItems`，但只刷新列表。读者需要逐个点击才能知道相似结果位于不同 AZ、子网或功能区域。Sigma 的搜索强调支持这个行为，收益仍须以 Archify 截图与任务记录验证。

**最小实验**：仅在普通 Finder 且 query 非空时，为匹配节点添加独立 `data-finder-match`，画布中保留匹配节点颜色，其余节点和边减弱；不要调用 Focus.set、Camera.reveal、写 URL 或动 Lens/Route 的 pinned state；不新增模块/依赖。匹配结果超过某一数量先不做“智能挑选”，完整展示同一可核实集合。对当前活动 Focus 的冲突，第一版只在无 Focus/Route/Lens 时开启；被阻止就维持现状，而不是隐式清除读者状态。

**成本与影响**：偏低，但需要 Finder、CSS、Export cleanup 三处明确责任；不要复用 Focus 的 selection 属性冒充选择。普通 Finder 不应影响 Route endpoint picker。风险为 dim 叠加、关闭后的残留、IME 重绘与 canonical export 夹带临时属性。若为了这一行为必须引入跨模块协调器，实验应降级为仅候选节点外描边，不做全图 dim。

**固定输入和图片方案**：使用 `archify/examples/production-deployment.architecture.json` 原字节；先记录 SHA-256。1440×900、100% 浏览器缩放、dark、blueprint、Still、初始 Fit；Finder 输入 `API`，应匹配 `gateway`、`api_a`、`api_b`（以当前索引实际结果为准，记录清单，不能硬改输入凑结果）；再输入 `platform` 检验隐藏在 tag 的匹配分布。基线/候选各截完整同状态图与 1 张 800px 宽局部；再截 390×844 light 的重叠/溢出状态。文件建议 `finder-api.base.png`、`finder-api.candidate.png`、`finder-platform.*.png`。输出图中必须同时看见查询、结果数和匹配节点；关闭后再截一张证明可恢复。

**验收门槛**：列表结果 ID 集合等于画布匹配 ID 集合；零匹配明确显示 0，不代表图无关系；查询不改变选中节点、相机、hash；点击保留原选择行为；canonical SVG/PNG 无临时匹配状态。用实际键盘输入和 pointer 点击，而非仅函数调用。对未提交候选的定位速度是否改善，没有真实任务证据前只称视觉改善假设。

## 候选 B：Reach 的 1 / 2 / 全部跳数切片（第二优先）

**用户动作**：选中节点并点 Downstream 后，读者可在同一范围控件选 1、2、全部，先读直接依赖，再读传递影响。文本明确“显示 2 跳内 X 项 / 总可达 Y 项”，不能让人误以为后续依赖不存在。

**现有缺口**：Focus 有完整 BFS、depth/maxDepth，但 Reach 仅全量强调。Graphology 的 bounded BFS、G6 的 degree/direction、Gephi Ego depth 提供一手先例。这是渐进阅读范围，不是 #83 的 hover preview，也不改 #221 的相机安全区。

**最小实验**：在 Reach 已激活后显示 1/2/全部按钮，默认全部，保留现有输出。先从现有完整结果 depth 派生视觉切片，不改拓扑、不做布局、不隐藏 SVG 元素、不修改完整 Reach traversal。只强调端点均在范围内的边，边是否跨层仍按真实 authored 关系处理；方向/循环/平行边不得由视觉猜测。先不新增 deep-link 语法，范围仅临时阅读状态。

**成本与影响**：中等。已有严格 `reachabilitySnapshot()` 验证标记、depth 和边，直接改既有 `data-reach-*` 会使卡片失败或误导。第一版用单独的 slice 状态，只在屏幕上强调，Share Card 明确沿用全部 Reach，或范围激活时暂不可用并解释；不能把局部截图标成全量分析。若产品要求切片也可分享，需要单独定义快照/URL契约，不纳入这轮最低成本实验。Camera 保持完整 Reach fit，先单独判断减噪收益，避免与 #221 重叠。

**固定输入和图片方案**：使用 `checkout-platform.head.architecture.json` 原字节，origin=`checkout`、direction=downstream。固定 1440×900、dark、signal-flow、Still、相机完全相同；基线是全部，候选依次 1、2、全部。1 跳应有 `fraud/orders/queue`，2 跳额外 `payments/worker`，这来自当前输入的 authored directed edges；截图前从实际结果断言集合。图片建议 `reach-checkout-all.base.png`、`reach-checkout-1.candidate.png`、`reach-checkout-2.candidate.png`、`reach-checkout-all.candidate.png`。另用 production-deployment 的 `gateway` 验证更大图是否真的减少干扰。循环、自环、不可用语义、并行边采用最小受控 fixture 做行为验证，不把合成图冒充真实使用。

**验收门槛**：1/2/全部结果与真实 BFS depth 一致；显示局部范围和总数；来回切换可恢复；canonical export、完整快照、Route/Lens 保持原契约；小图或全部深度≤1时不显示无用控件。若实际图都很浅、用户仍需要全量结果，停止此方向，不能只凭“按钮更多”判定有益。

## 本轮不建议的方向

不重写 SVG Viewer、不切 React/WebGL、不引入 Cytoscape/Graphology 的第二套运行时图状态、不启用力导布局、不做通用聚类/通用过滤语言、不把 Juggl 的未实现 slider 写成已上线能力。不把已有小地图、邻居 hover、类型 Lens、Route Journey 重新命名成新功能。阅读历史/书签可能有价值，但这一轮没有找到足够具体且低维护的直接证据，不进入前两项。

## 实验结果应如何报告

两条实验应各有独立分支与图片，钉住相同 base SHA、输入 SHA-256、candidate SHA、浏览器版本、viewport、theme/preset、motion、zoom、查询或选中状态。对照同一已渲染输入的 Viewer 差异；不要用重排后的输入证明交互改善。执行产品改动前再核对对应 open issue/PR 最新状态。研究记录不等于批准、实现、测试通过、用户接受或远端发布；本文件没有这些结果。
