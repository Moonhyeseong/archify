# 局部上下文、路径与折叠：第十轮小工具核对

2026-10-25，只读研究，固定Archify base `82c7e0f089a02a4d514714adf37dc2061682da5f`。检索hub现有16份scouts的全部GitHub owner/repo排重，不重复Finder、relation-return、Guide、Reach深度、Graphology、Juggl、Sigma、G6、dot-viewer或现有dependency-map。

**本轮没有值得立即实施的候选。** 自然输入确有同长路径，但现有“shortest path/最短路径”并未承诺唯一，完整UI也明确方向，维护文档明确取first reached path。单加“一条”没有实质歧义或阅读收益证据，不单开实验。第二个候选“路径旁局部上下文”同样缺收益证据。通用compound折叠需要元边与双图状态，其成本高于当前证据。

本轮只取得一手固定源码、README、许可；没有执行上游程序、安装依赖、运行浏览器、生成图片或改实现。下文区分源码核对、输入数据核对和待做的浏览器任务。

## 新来源与许可

没有数量门槛，不为补足数量把未许可项目写成开源推荐。日期是commit committer日期，非release保证。

| 来源、固定commit | 许可 | 具体输入→输出与实现事实 | 对Archify的边界 |
| --- | --- | --- | --- |
| [jsexauer/networkx_viewer](https://github.com/jsexauer/networkx_viewer/tree/1802506eba7eb7b47675307ff0db7483a42f768a)，`1802506eba7eb7b47675307ff0db7483a42f768a`，2024-05-27 | [GPL-3.0](https://github.com/jsexauer/networkx_viewer/blob/1802506eba7eb7b47675307ff0db7483a42f768a/LICENSE) | nx.Graph/nx.MultiGraph→Tk GUI。`plot_path()`先nx.shortest_path，再取path节点levels邻域并标出path；Grow/Hide/Hide Behind；未完全展开的节点label灰显。 | 路径与周边是两个集合，有用的阅读模型。但python/Tk、spring重排与lambda filter不进入Archify；不复制GPL实现。README明确Graph/MultiGraph，不扩大声称DiGraph能力。 |
| [reaviz/reagraph — collapse/path模块](https://github.com/reaviz/reagraph/tree/d2f4f0822e54c8cb0866d51ccb26f08e9fe0a3fe)，`d2f4f0822e54c8cb0866d51ccb26f08e9fe0a3fe`，2026-06-25 | [Apache-2.0](https://github.com/reaviz/reagraph/blob/d2f4f0822e54c8cb0866d51ccb26f08e9fe0a3fe/LICENSE) | nodes{id}/edges{id,source,target}→React/WebGL。`findPath()`委托graphology bidirectional返回一个路径；collapse对有其他可见incoming来源的子节点保留显示，使用完整图而不是已折叠可见图计算。 | 非树折叠不能无条件隐藏所有后继。Archify authored geometry、循环、多父关系与导出合同增加成本；不引Graphology/React/WebGL，不增通用collapse状态。 |
| [iVis-at-Bilkent/cytoscape.js-expand-collapse](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/tree/e01588bec1f31c76046faa6fb681eee37b78334e)，`e01588bec1f31c76046faa6fb681eee37b78334e`，2024-11-27 | [MIT](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/blob/e01588bec1f31c76046faa6fb681eee37b78334e/LICENSE) | compound graph→collapsed nodes/meta edges；保留originalEnds、collapsedEdges，聚合可区分edgeType/directionType，expand恢复。README明确已不再维护，转向统一框架。 | 已有Cytoscape来源不等于已查此独立模块。具体启发是聚合边必须保留原边账目，不能把双向/不同语义压成普通新边；不接入停更扩展。 |
| [iVis-at-Bilkent/cmgm](https://github.com/iVis-at-Bilkent/cmgm/tree/5e86751ac77826cc7240d7ba7ee6bf510f29fdc4)，`5e86751ac77826cc7240d7ba7ee6bf510f29fdc4`，2023-10-27 | [MIT](https://github.com/iVis-at-Bilkent/cmgm/blob/5e86751ac77826cc7240d7ba7ee6bf510f29fdc4/LICENSE) | compound node/edge IDs+parent→main/visible双图；filter、hide、collapse分别维护；getHiddenNeighbors返回main图邻域中isVisible=false的节点/边。 | 区分过滤/隐藏/折叠很有价值，但双图与meta edges是完整复杂度管理模型。Archify Tree已有安全的祖先隐藏与计数，当前不增加第二图模型。 |
| [GabrieleAngeli/graph-hop-analyzer](https://github.com/GabrieleAngeli/graph-hop-analyzer/tree/8ab316518ae31f687d25425b47c2c49d1f2cb083)，`8ab316518ae31f687d25425b47c2c49d1f2cb083`，2026-01-04 | **无已授予的开源许可**：README要求作者自行选择并补LICENSE，不是MIT授权 | 单文件edge list→BFS距离/不可达表、示例最短路径。README明确ties may exist，unweighted；shortest-path高亮仍列roadmap。 | 仅作为发现线索/负面筛选，不统计为许可完整开源项目，不复制代码或宣称roadmap完成。Archify已有方向BFS/不可达语义，无需新importer。 |

实现读取：[networkx graph_canvas.py](https://github.com/jsexauer/networkx_viewer/blob/1802506eba7eb7b47675307ff0db7483a42f768a/networkx_viewer/graph_canvas.py)的`_neighbors()`、`plot_path()`；[Reagraph collapse/utils.ts](https://github.com/reaviz/reagraph/blob/d2f4f0822e54c8cb0866d51ccb26f08e9fe0a3fe/src/collapse/utils.ts)、[paths.ts](https://github.com/reaviz/reagraph/blob/d2f4f0822e54c8cb0866d51ccb26f08e9fe0a3fe/src/utils/paths.ts)；[expandCollapseUtilities.js](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/blob/e01588bec1f31c76046faa6fb681eee37b78334e/src/expandCollapseUtilities.js)；[cmgm auxiliary.js](https://github.com/iVis-at-Bilkent/cmgm/blob/5e86751ac77826cc7240d7ba7ee6bf510f29fdc4/src/complexityManagement/auxiliary.js)的getTargetNeighborhoodElements末尾按isVisible过滤。许可证阅读不授权把上游运行指令当本任务指令。

## 当前Archify路径核对：能力已存在

- [viewer/route-probe.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/route-probe.js)：renderer-owned稳定node IDs与edge endpoints；`shortestDirectedPath()`无权重BFS，按authored DOM edge顺序确定同长选择，返回一组nodes/edges。`reachableFrom()`与`hopDistancesFrom()`已有；Finder目标筛选、不可达反馈、Prev/Next/Journey、share/exportSnapshot均不是新缺口。
- [viewer/viewer.css](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/viewer.css) Route active时非路径节点与边opacity=0.11、路径=1，**保留了背景上下文**；`showResult()`只reveal路径节点，includeNeighbors=false。要区分“背景仍在”和“视口主动包含邻居”。
- [viewer/focus.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/focus.js)的computeReachability已有方向、depths、node/edge集合；邻域/可达不是运行影响。
- [viewer/tree-branches.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/tree-branches.js)完整树预布局，collapse仅隐藏后代、不移动可见节点；Finder/Outline/共享链接选择会reveal祖先；canonical export完整树。[tree renderer](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/tree/render-tree.mjs)已有descendantCount、折叠数字pill与aria文本。因此“折叠隐藏数量”也不是新候选。

以上是源码事实，不是browser验收。现有测试入口：[route-probe-browser.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/route-probe-browser.test.mjs)有directed BFS顺序、parallel edges、重排同长路线、不可达和严格snapshot；[tree-branches-browser.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/tree-branches-browser.test.mjs)、[authored-reachability.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/authored-reachability.test.mjs)是相关入口。本轮没有重跑这些测试，不引用旧通过数作为新验证。

## 候选1：澄清“一条最短有向路径”，负面筛选，不开实验

自然输入：[production-deployment.architecture.json](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/examples/production-deployment.architecture.json)。本轮用Python只读JSON，按有向关系枚举gateway到events的最短简单路径，得到：

```text
gateway → api_a → events   2 hops
gateway → api_b → events   2 hops
```

该输入的gateway→api_a先于gateway→api_b，结合Route的DOM顺序合同应选择api_a一支；这是**输入+源码推断**，尚未在浏览器操作确认。两条路径是真实仓库例图的作者关系，不是新造的高degree极端fixture，也不是实际网络路由观测。

当前[en locale](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/locales/en.json)的viewer.route.overview.status为`{nodes} · {hops} · shortest path`，[zh-CN](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/locales/zh-CN.json)为`{nodes} · {hops} · 最短路径`。这并非数学错误；潜在问题是读者误认为显示了唯一或全部通路。最小候选只改为诸如`one shortest directed path`/`一条最短有向路径`，若空间允许以简短说明解释同长时按作者顺序选择。最终措辞由维护者判断；不能把“不确定有无替代”说成“已发现多条”。

可证伪任务：“Gateway到Event Bus只能经过AZ-a吗？屏幕高亮代表全部可达关系吗？”先固定原图、原相机、1440×1000、Full、Still，base与候选都使用同一gateway/events选择。正确回答应为不能证明唯一、这里只是一条作者有向最短路径。测的是错误理解，不是点击数。若base读者已经正确理解或文案无改善，就不改。390×844核对状态行不会被更长文本挤坏；不要求新控件、图算法、alternative计数、路径history或camera同步。

完整UI的`viewer.route.instructions`已写“Click a start, then an end. Paths follow the arrows.”，不可达状态也写“along the arrows”；它没有说unique/only/all paths。[viewer/README.md Route Probe contract](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/README.md#route-probe-contract)明确“BFS follows directed DOM edge order, keeping the first reached path and exact edge references”。文案单数并不承诺唯一；把有两个同长路径直接称成用户歧义会放大问题。**当前没有实质歧义证据，拒绝为加one单开实现/分支。** 仅保留自然输入供将来真实读者问题复核，不主动枚举/计数替代路径。若未来确有误读，最小责任也仅是locale及原有i18n/Route UI断言；不改BFS/receipt/edge identity。

## 候选2：路径加一跳邻域，当前不实施

NetworkX Viewer的plot_path将path节点周边levels与path标记分开，是具体而非口号式上下文。但Archify Route已保留背景，Reach能回答方向可达，Lens能看类型关系。新增“context=1”必须维护路径/上下文/外部三种集合，还要考虑reveal范围、移动端字号、分享与导出是否含旁路，不是简单把opacity调高。

同一production图，gateway→events路径旁边有api_b、Redis、PostgreSQL、Workers等角色；可测试读者“这是唯一路径吗？api_a另连哪个存储？”先用现有Route+背景和已有Reach完成。如果只是需要清楚显示另一支，点现有Overview/Focus就足够，则新context UI不省操作。候选只有在自然输入中旁支在视口外导致持续错读、且显示一跳能降低错误时才成立；不能为按钮临时加几十条边。

最小数据仍是Route已有activeNodeIds/activeEdges与完整authored graph；邻居来源需明确in/out/both，不能用无向neighbor代替有向可达，不能改canonical geometry。截图需包含全视口、两端与上下文边界，并明确未纳入的外部边；把旧背景藏掉再称清爽不算收益。本轮没有用户/browser证据，**拒绝立即实现**。

## 不做通用折叠/隐藏边界的新状态模型

CMGM的main/visible双图及meta edges解决的是完整复杂度管理。Reagraph保留有其他可见入边的子节点，说明一般有向图不能按树后代简单collapse。Archify Architecture boundary是作者frame，可能嵌套/部分共享语义；将它变成聚合节点会改端点、label、多重边和export含义。Tree已足够的地方不引入该模型；尚无自然任务证明其成本值得。

报告仅冻结研究。候选1的自然输入已确认，但没有实质歧义证据，当前与候选2、通用fold一起保持负面结论。不为了数量制造实验；只有未来出现真实读者任务失败才重开。没有浏览器验收或收益验证。本轮只新增本人报告，不改README、产品或提交。
