# 布局、边与标签阅读：9个新来源，第八轮负面筛选

2026-10-25，只读调研。固定 Archify 基线 `82c7e0f089a02a4d514714adf37dc2061682da5f`。本轮没有执行上游程序、安装依赖、改产品、生成图片或验证读者收益。以下截图/实验均为待实施方案。

**结论：当前没有值得立刻新增的布局功能。** 最接近的小机制——固定障碍、有限标签候选、平行边外侧放置——Archify已经实现。新引擎的接入与显式几何合同成本明显；靠隐藏标签获得清爽会损失作者提供的文字。三项可证伪实验优先核实现有能力与真实输入，不预设要改代码。若没有自然失败和可重复收益，应结束该方向，而不是制造更密集的图来证明功能。

## 去重、发现路径与现有责任

读取研究中心README，检索当前全部scout报告并提取GitHub owner/repo排重。本轮没有重复ELK、Cytoscape、Sigma、Graphology、G6、vis-network、D2、Graphviz交互预览、d3-graphviz或前轮图比较来源。与 source-navigation/authoring diagnostics 研究者协调：对方负责source-span、关联诊断和修复后反馈，本报告只研究空间放置与阅读，不另提诊断分组UI。

发现路径是一手项目间的关系：WebCola README指向Adaptagrams；Adaptagrams将libvpsc/libcola/libavoid区分；D3-Labeler与d3fc分别给出退火与有限候选；avoid-overlap明确fixed/choices/nudge三种行为。地图标签与图边标签有相似矩形冲突，但标签归属、方向和平行边语义不同，不能因为demo更清爽就等同适配成功。星数没有参与筛选。

固定基线已覆盖：

- [shared/automatic-labels.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/shared/automatic-labels.mjs)：`placeAutomaticLabels()`不移动节点、不改route、不扩canvas、不重写输入；有spatial grid、障碍边界导出的`slidingCandidates`，并非只采固定fraction。`gridCandidates`考虑近处平行边，优先远离邻边的一侧；显式labelAt/labelDx/labelDy/labelSegment保留。
- [dataflow/label-capacity.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/dataflow/label-capacity.mjs)：`wrapBlockedFlowLabels()`只尝试被阻塞且未pin的完整文字，两行shape最多8种、探测最多64次，不移动有效标签或路线，不删字。
- [dataflow/joint-label-routing.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/dataflow/joint-label-routing.mjs)：已有受限label与route联合修复，排除pin，按被阻route数、ownDistance、move排序，再验证。不能把“联合优化”当新发现。
- [architecture/routing.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/architecture/routing.mjs)：已有独立port/候选corridor、resolved-route冲突与可读性选择；[labels.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/architecture/labels.mjs)负责预留label。

2026-10-25远端检查：开放[PR #843](https://github.com/tt-a1i/archify/pull/843) head `6c5204892689473c3473b98d5cfdc70193577b9a`专门保护label fallback不能离所属route太远，作者明确是测试覆盖缺口而非已观察生产故障；不要复制。开放[PR #1042](https://github.com/tt-a1i/archify/pull/1042) head `9f4bf07e0875ba7588da123a0a09a32fcf69d628`处理light/print默认关系label的ink对比度，不用新布局方案掩盖颜色问题。开放[PR #838](https://github.com/tt-a1i/archify/pull/838)标题为workflow member-preserving group placement；本轮只核实列表与标题，未审实现，不另提自动group移动。标题搜索`label overlap`仅找到closed #199，`label routing`未命中；这些查询不构成完整“不存在”证明。

## 固定来源与具体数据合同

commit日期指GitHub该commit的committer日期，不代表正式release或维护承诺。许可证API null时继续读取文件/README/package声明，明确证据强度。

| 新来源与固定版本 | 许可 | 输入→输出与已读机制 | 成本、语义边界和结论 |
| --- | --- | --- | --- |
| [dagrejs/dagre](https://github.com/dagrejs/dagre/tree/877ead2bb0d5822daeb44ccb4396be1ebccbc9e4)<br>`877ead2bb0d5822daeb44ccb4396be1ebccbc9e4`<br>2026-10-24 | [MIT](https://github.com/dagrejs/dagre/blob/877ead2bb0d5822daeb44ccb4396be1ebccbc9e4/LICENSE) | 节点width/height、带name的多重边与label width/height/labelpos/labeloffset→节点坐标、edge points和label x/y。已读lib/layout.ts和test/layout-test.ts；先为label留rank空间，injectEdgeLabelProxies，后fixup偏移。 | 有价值的是先量文字再留空间。整套layered layout会改现有几何、ports、pin；不作为局部阅读插件。候选A只做容量对照。 |
| [tgdwyer/WebCola](https://github.com/tgdwyer/WebCola/tree/39539f2dccb04cb321fa9e2ee9532f9e1a9b456d)<br>`39539f2dccb04cb321fa9e2ee9532f9e1a9b456d`<br>2026-04-30 | [MIT](https://github.com/tgdwyer/WebCola/blob/39539f2dccb04cb321fa9e2ee9532f9e1a9b456d/LICENSE) | 矩形、links、separation约束→位置；src/rectangle.ts的removeOverlaps先X约束求解、再Y；src/layout.ts要求avoidOverlaps时给width/height。 | 矩形分离是布局问题，不只是label CSS。移动节点会让现有via/边框/端点失效；不导入力导向引擎。固定节点的weight也不应被误当成绝对pin合同。 |
| [mjwybrow/adaptagrams](https://github.com/mjwybrow/adaptagrams/tree/840ebcff20dbba36ad03a2160edf7cbaf9859984)<br>`840ebcff20dbba36ad03a2160edf7cbaf9859984`<br>2025-10-29 | [LGPL-2.1-or-later（根README；libavoid附v2.1文本）](https://github.com/mjwybrow/adaptagrams/blob/840ebcff20dbba36ad03a2160edf7cbaf9859984/cola/libavoid/LICENSE.LGPL) | libavoid的shape polygons+connector endpoints/checkpoints→避障polyline/orthogonal routes。已读cola/libavoid/README、connector.h、router.h；有idealNudgingDistance与nudgeSharedPathsWithCommonEndPoint开关。 | 平行边分离值得研究，但nudge涉及共享端点、checkpoints和shape边界，不是随意偏移SVG。C++/绑定及路线合同成本高，只读机制，不引入。 |
| [tinker10/D3-Labeler](https://github.com/tinker10/D3-Labeler/tree/6de86705a8bbdebb00282aaa61755686f7309b31)<br>`6de86705a8bbdebb00282aaa61755686f7309b31`<br>2014-10-18 | [MIT](https://github.com/tinker10/D3-Labeler/blob/6de86705a8bbdebb00282aaa61755686f7309b31/LICENSE) | label{x,y,width,height,name}+anchor{x,y,r}+边界+sweeps→修改后的label位置；labeler.js能量包含label碰撞/anchor碰撞、距离、leader交叉及方向。 | Math.random驱动退火且无本次已读API的seed入口；结果不是无冲突保证。默认1000 sweeps乘label数的成本，不引进不可重复的运行时布局。 |
| [Geovation/labelgun](https://github.com/Geovation/labelgun/tree/9229eeb2a82fded9ba1bfd3260268972f21f4982)<br>`9229eeb2a82fded9ba1bfd3260268972f21f4982`<br>2017-09-17 | [MIT（README及package.json声明；未找到独立许可全文）](https://github.com/Geovation/labelgun/blob/9229eeb2a82fded9ba1bfd3260268972f21f4982/README.md) | label bbox+weight+hide/show callback→可见/隐藏集合；src/labelgun.js提供getHidden/getShown/getCollisions，使用空间索引。 | 有明确范围账目优点，但根本机制是隐藏，不移动文字。静态完整图不能静默删label。只可作为地图低优先级标注对照，不推荐进入Archify。 |
| [d3fc/d3fc](https://github.com/d3fc/d3fc/tree/55ee5942a0885ea073838afaaa89eba24cefab15)<br>`55ee5942a0885ea073838afaaa89eba24cefab15`<br>2024-07-30 | [MIT](https://github.com/d3fc/d3fc/blob/55ee5942a0885ea073838afaaa89eba24cefab15/LICENSE) | 仅研究packages/d3fc-label-layout：label矩形→位置矩形/hidden；greedy枚举8方位，annealing随机改变候选，removeOverlaps把最大冲突项hidden。 | 纯矩形strategy可小到几十行，但8方位围绕点，缺所属折线路段和端点约束。Archify已有更合适的route-aware候选；拒绝为了少碰撞隐藏label。 |
| [kevinschaul/avoid-overlap](https://github.com/kevinschaul/avoid-overlap/tree/0fed58e5c5742559776a0603347e0b5fb4bc5a48)<br>`0fed58e5c5742559776a0603347e0b5fb4bc5a48`<br>2026-03-16 | [MIT（package.json声明；未找到独立许可全文）](https://github.com/kevinschaul/avoid-overlap/blob/0fed58e5c5742559776a0603347e0b5fb4bc5a48/package.json) | DOM elements+fixed/choices/nudge组→DOM位置/移除；src/index.ts预量choices bbox，用seedrandom默认42；allowRemove默认true、最终可调用node.remove。 | 最有用是固定障碍和有限候选分类。需明确allowRemove:false，但即便禁删仍没有图边归属合同；DOM choices会临时修改元素且引入测量依赖。独立复用原则，不引库。 |
| [jdfekete/reorder.js](https://github.com/jdfekete/reorder.js/tree/821121d2a6eb4bea7d0ae9d24176bfb6194de0c8)<br>`821121d2a6eb4bea7d0ae9d24176bfb6194de0c8`<br>2026-10-24 | [BSD-3-Clause](https://github.com/jdfekete/reorder.js/blob/821121d2a6eb4bea7d0ae9d24176bfb6194de0c8/LICENSE) | 矩阵/graph→行列或vertex permutation；已读src/graph2mat.js：directed矩阵逐边赋值，value假值用1，平行边会写同一cell。 | 密图矩阵可减少线交叉，但丢逐边label/identity且引入另一个视图。不能直接把此转换用于多重关系或value=0事实；不推荐本轮新增matrix reader。 |
| [curran/d3-area-label](https://github.com/curran/d3-area-label/tree/484d141d86613df94c238f119bb927c313d69358)<br>`484d141d86613df94c238f119bb927c313d69358`<br>2024-03-01 | [BSD-3-Clause](https://github.com/curran/d3-area-label/blob/484d141d86613df94c238f119bb927c313d69358/LICENSE) | area{x,y0,y1}+文本bbox→translate/scale；README解释二分搜索能放入区域的最大同长宽比矩形，可增插值密度换成本。 | 用于面积图区域而非折线边；缩字会损害Read字号且不存在边方向语义。不把“最大能塞下的字”当可读性保证，不用于边label。 |

## 深读A：完整标签的有限候选，优先保留作者几何（当前不新增）

一手对照：[d3fc placements](https://github.com/d3fc/d3fc/blob/55ee5942a0885ea073838afaaa89eba24cefab15/packages/d3fc-label-layout/src/util/placements.js)给出八个点周围位置；[greedy](https://github.com/d3fc/d3fc/blob/55ee5942a0885ea073838afaaa89eba24cefab15/packages/d3fc-label-layout/src/greedy.js)按矩形碰撞面积加越界面积评分；[avoid-overlap src/index.ts](https://github.com/kevinschaul/avoid-overlap/blob/0fed58e5c5742559776a0603347e0b5fb4bc5a48/src/index.ts)将fixed与choices分开、预量每个候选，seed默认为42，但未解冲突的可删除项仍能被node.remove。二者的最低分都不保证无碰撞，也不保证读者能看出文字属于哪一条边。

最小实验输入不是新DSL：从现有renderer获得`{labelId, relationId, rect, ownRoutePoints, foreignRoutes, fixedNodeRects, titleRects, pinned, viewBox}`；输出仅在实验receipt里记录`{labelId, originalRect, chosenRect, candidateCount, changed, blockers}`。这只是离线评估数据，不建议新增公共schema。完整文字与关系ID必须一一对应。

自然输入首选既有[test/fixtures/architecture-label-repair/worldscope.json](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/fixtures/architecture-label-repair/worldscope.json)：8节点9关系，已有维护者场景型fixture，包含“事实检索/证据检索/写入证据”等文字。它仍是仓库输入，不是生产读者失败记录。辅助的joint-label-routing.dataflow.json大量占位文本，应明确为synthetic回归fixture，不能拿它证明自然任务收益。

可证伪任务：读者分别指出“事实检索”和“证据检索”指向哪个库、来自哪个组件，作者在完整文字不变的前提下交付图。固定原JSON，不加新节点、不增长文字。比较base已实现候选与任何候选变更的：错误归属数、读者寻找时间、手动labelAt/labelDx/labelDy/labelSegment修复次数、render耗时、route/node/pin改变数。**没有base失败、没有修复次数降低就拒绝改动**；即使冲突更少，只要文字被藏、变小或离所属边更近于别的边，也判失败。

现有验证入口：[test/automatic-label-slots.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/automatic-label-slots.test.mjs)、[test/architecture-automatic-labels.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/architecture-automatic-labels.test.mjs)、[test/dataflow-label-capacity.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/dataflow-label-capacity.test.mjs)。这些是语义保护入口，不代表本轮运行过。预期无需新增测试，除非发现未覆盖的真实失败。

截图方案：1440×1000、Full、Still、同preset/theme和相机，base全图+同一局部裁剪；候选必须用同样范围。保存输入hash、完整label清单、native导出，不能只展示局部清爽区域；390×844再看可读字号。现状已充分覆盖，**优先级低，不派实现**。

## 深读B：平行边分离必须保留每条关系身份（待自然失败，拒绝全局nudge）

[libavoid router.h](https://github.com/mjwybrow/adaptagrams/blob/840ebcff20dbba36ad03a2160edf7cbaf9859984/cola/libavoid/router.h)明示shape连接段、共享端点和checkpoints的nudge受不同开关影响；[connector.h](https://github.com/mjwybrow/adaptagrams/blob/840ebcff20dbba36ad03a2160edf7cbaf9859984/cola/libavoid/connector.h)保留连接与checkpoint合同。这说明“把平行线错开一点”可能改变ports与作者路径，不能只按视觉距离处理。

最小输入为已有`connections[{id,from,to,label,fromSide,toSide,via,...}]`和resolved points；输出评估表逐id记录`sameEndpointGroup, direction, old/new points, ownLabelDistance, nearestForeignRouteDistance, pinned`。双向关系不是一条无向边，同端点不同label不是可合并重复。不能用reorder.graph2mat的单cell赋值代表多重边；不能把bus共享读成多个独立调用已合并。

可证伪实验先扫描仓库真实examples中同端点多条关系，挑最多三条的自然案例；没有案例就停止，不能人工加十条平行边。任务是读出每条label的方向/目的，记录错认与作者手动route控制次数。基线先试现有distinct ports、parallel-aware标签侧选择；只有仍存在可复现错认，才考虑局部un-pinned候选，且不跨越节点、frame、不改变显式via/channel/side。截图必须同时显示两端、箭头与全部label，不能只截边中间来隐藏端点改变。

现有相关责任：[test/architecture-readable-routing-labels.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/architecture-readable-routing-labels.test.mjs)检查readability sweep、label预留、原场景范围与pinned路线；Lifecycle README已经规定同lower row最多5条parallel及增大lane/row间距，[render-lifecycle.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/lifecycle/render-lifecycle.mjs)已有专门处理。**目前不引libavoid/WASM，不新增平行lane参数，不改Lifecycle容量上限**。

## 深读C：局部清爽不能靠静默隐藏事实（建议仅做负面对照）

[labelgun src/labelgun.js](https://github.com/Geovation/labelgun/blob/9229eeb2a82fded9ba1bfd3260268972f21f4982/src/labelgun.js)的getHidden/getShown提供诚实账目；[d3fc removeOverlaps](https://github.com/d3fc/d3fc/blob/55ee5942a0885ea073838afaaa89eba24cefab15/packages/d3fc-label-layout/src/removeOverlaps.js)反复隐藏最大冲突矩形；[D3-Labeler labeler.js](https://github.com/tinker10/D3-Labeler/blob/6de86705a8bbdebb00282aaa61755686f7309b31/labeler.js)则通过移动和距离罚项减少拥挤。这三者不是同一种结果，不能仅按截图空白面积比较。

最低成本可证伪实验无需新UI：对同一WorldScope图生成评估清单`{totalLabels, shownLabelIds, hiddenLabelIds, reason}`，把“隐藏低权重label”作为明确标注的负面对照，而不是交付物。用户任务改为回答完整读取路径和采集路径；即使隐藏版本看起来更清爽，只要遗漏或误答提高就拒绝。Archify现有Focus/Reach/Finder已提供局部强调，不应再造权重选择器、保存scope或第二套可见性模型；相关UI收益必须跟这些现状比。

如果未来用户明确请求局部导出，必须标注“当前范围”并给外部/省略关系清单；前批dependency-map已有bounded选择与receipt，不再次提出相同adapter。canonical完整图导出仍应保留全体作者文字。原图与对照图同尺寸/相机、同时列完整label与隐藏项；不给“更清爽”单图作为成功证据。**本轮不推荐隐藏label策略进入产品**。

## 成本与停止条件

没有增加维护依赖的理由：Dagre/WebCola会改变layout ownership；libavoid引入C++/绑定；D3-Labeler和d3fc退火有随机性；avoid-overlap虽有seed仍依赖DOM测量与变更；矩阵重排需要另一套identity/平行边表达。可以借鉴“障碍与候选分离”和“省略项明确”原则，但这两项在Archify已经能找到相应责任。

本报告只冻结研究，不声称人类测试、浏览器验收或图片已完成。后续若无自然输入证明作者修复负担下降，就保留负面结论。不要新增通用layout adapter、自动压字/删字、全局重排或只为demo好看而制造极端case。
