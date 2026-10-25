# Graph reading round 5：折叠、局部探查与语义放大的剩余价值

2026-10-25。先读hub当前README和全部40份scouts，从361个唯一GitHub owner/repo排重；下列8项此前未覆盖。Markmap、Cytoscape expand-collapse/view-utilities、G6、Sigma、Reagraph、Vis Network及Graphviz等已覆盖，不重新计数。不按stars设门槛。全程只读源码、许可、公开fixture和GitHub PR，没有运行上游、安装服务、启动浏览器、创建产品分支或修改产品。

本轮结论为**不立新实现项**。jsMind的嵌套折叠fixture值得保留，compound graph的meta-edge也给出了更清楚的语义边界；但当前Archify已有稳定折叠、祖先揭示、Lens、Route和overview。新的LOD或compound folding需要改变显示拓扑与身份合同，维护成本不低；Atlas/Classic交接也已有实际PR拥有。可复验的最小问题留在文末，不能把“有一个新项目”直接变成“需要加一个新控件”。

## 八个新来源：固定SHA、许可与实际代码

固定的是本次读取的commit，不等同于发布版或本轮执行结果。

| 来源 / 固定revision / 许可 | 已核机制与一手位置 | 对Archify的取舍 |
| --- | --- | --- |
| [ForceGraph](https://github.com/vasturiano/force-graph/tree/0f059c894bf5b7504460b7028b00bc6e4d95f0d9) · `0f059c894bf5b7504460b7028b00bc6e4d95f0d9` · [MIT](https://github.com/vasturiano/force-graph/blob/0f059c894bf5b7504460b7028b00bc6e4d95f0d9/LICENSE) | [highlight示例](https://github.com/vasturiano/force-graph/blob/0f059c894bf5b7504460b7028b00bc6e4d95f0d9/example/highlight/index.html#L24-L68)预建neighbors/links，hover节点只亮一跳邻居和接边，hover边只亮两端；每次先清旧集合。 | 很小的transient preview机制，但邻居在示例中按双向加入，不等同于有向reach；不能抄成调用方向。示例前段随机生成输入，不能把源码固定说成图实例或layout固定。当前Lens/关系预览已覆盖相邻需求，不另引force simulation。 |
| [jsMind](https://github.com/hizzgdev/jsmind/tree/2aeca49716c549e4957535632602bf0cece198b8) · `2aeca49716c549e4957535632602bf0cece198b8` · [BSD三条款原文](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/LICENSE#L1-L10) | [嵌套fixture](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/example/data_example.json#L64-L82)保留expanded:false及完整children；[折叠实现](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.layout_provider.js#L399-L421)只改状态/visibility并局部重排。 | 父展开后仍尊重子分支原折叠状态，是可核的细节。其重排＋scroll补偿不比Archify固定完整布局天然更好；隐藏节点也没有Finder式自动揭示祖先。GitHub许可metadata不明确，本文按实际LICENSE，不沿用NOASSERTION标签。 |
| [Cytoscape complexity-management](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/tree/29601906a13ee8d21126ef2fbee126cd3a9b2fd1) · `29601906a13ee8d21126ef2fbee126cd3a9b2fd1` · [MIT](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/LICENSE) | [hidden-neighbor API](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/src/complexity-management.js#L428-L445)从removedEles按ID找回隐藏邻居；[meta-edge创建](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/src/complexity-management.js#L313-L330)保留summary的source/target/size/compound字段。 | hidden不等于不存在，是可取的解释层。完整compound框架涉及显示图/原图同步和聚合边，不能作为一个低成本Viewer小补丁引入，也不重复旧expand-collapse addon的研究。 |
| [maxGraph](https://github.com/maxGraph/maxGraph/tree/c4f0df48682dc3f9f57b91fbf9edb4a26b570829) · `c4f0df48682dc3f9f57b91fbf9edb4a26b570829` · [Apache-2.0](https://github.com/maxGraph/maxGraph/blob/c4f0df48682dc3f9f57b91fbf9edb4a26b570829/LICENSE) | [FoldingMixin](https://github.com/maxGraph/maxGraph/blob/c4f0df48682dc3f9f57b91fbf9edb4a26b570829/packages/core/src/view/mixin/FoldingMixin.ts#L88-L156)在model里setCollapsed并swapBounds，可选递归；[Folding示例](https://github.com/maxGraph/maxGraph/blob/c4f0df48682dc3f9f57b91fbf9edb4a26b570829/packages/html/stories/Folding.stories.ts)与[单元测试](https://github.com/maxGraph/maxGraph/blob/c4f0df48682dc3f9f57b91fbf9edb4a26b570829/packages/core/__tests__/view/mixin/FoldingMixin.test.ts)是已提交材料。 | 显式区分“折叠状态”和替代边界尺寸有用，但它是编辑器model事务，不是简单CSS隐藏。迁移到authored SVG要定义组、端点和导出合同，不是只加一个三角按钮。 |
| [d3-zoom](https://github.com/d3/d3-zoom/tree/c8df708b78b46553bc4a0fbf1baf4ffc10cef8bd) · `c8df708b78b46553bc4a0fbf1baf4ffc10cef8bd` · [ISC](https://github.com/d3/d3-zoom/blob/c8df708b78b46553bc4a0fbf1baf4ffc10cef8bd/LICENSE) | [wheel处理](https://github.com/d3/d3-zoom/blob/c8df708b78b46553bc4a0fbf1baf4ffc10cef8bd/src/zoom.js#L234-L268)以pointer位置及其逆变换坐标作anchor，受scale extent约束；[translate/scale](https://github.com/d3/d3-zoom/blob/c8df708b78b46553bc4a0fbf1baf4ffc10cef8bd/src/zoom.js#L141-L150)保持该点对应。 | 保留关注点是具体机制，但并非需要引D3。当前Viewer按钮缩放/页面纵向滚动有自己的合同；新增wheel zoom还要处理trackpad、页面滚动与快捷键，且现有camera修复正在整合。 |
| [LTSVisualizer](https://github.com/dbera/LTSVisualizer/tree/bb2c875edcb2d094c6b1ec4c8519c021634b4341) · `bb2c875edcb2d094c6b1ec4c8519c021634b4341` · [MIT](https://github.com/dbera/LTSVisualizer/blob/bb2c875edcb2d094c6b1ec4c8519c021634b4341/LICENSE) | [App hover](https://github.com/dbera/LTSVisualizer/blob/bb2c875edcb2d094c6b1ec4c8519c021634b4341/frontend/src/App.tsx#L1553-L1568)只在未pin时替换inspector；[node/edge tap](https://github.com/dbera/LTSVisualizer/blob/bb2c875edcb2d094c6b1ec4c8519c021634b4341/frontend/src/App.tsx#L1619-L1637)固定本次检查对象；[示例JSON](https://github.com/dbera/LTSVisualizer/blob/bb2c875edcb2d094c6b1ec4c8519c021634b4341/sample-data/example.json)有nodes/edges及marking_raw等数据。 | 将hover观察与已选路径分开是细粒度阅读动作；不能因此把LTS路径称为真实程序执行。当前Passport/SourceCard、Route以及在审Atlas已覆盖大量邻近动作；未核出现有用户任务需要独立pin一份旧inspector。 |
| [MSAGLJS](https://github.com/microsoft/msagljs/tree/98a5e2a989f2b1ba2f82538b067f701db926b448) · `98a5e2a989f2b1ba2f82538b067f701db926b448` · [MIT](https://github.com/microsoft/msagljs/blob/98a5e2a989f2b1ba2f82538b067f701db926b448/LICENSE) | [WebGL renderer](https://github.com/microsoft/msagljs/blob/98a5e2a989f2b1ba2f82538b067f701db926b448/modules/renderer-webgl/src/renderer.ts#L90-L104)保留tile pyramid/LOD，搜索定位要降到包含目标的层；[node layer](https://github.com/microsoft/msagljs/blob/98a5e2a989f2b1ba2f82538b067f701db926b448/modules/renderer-webgl/src/layers/get-node-layers.ts#L21-L35)按层插值节点尺寸、明确细层为粗层节点的超集。 | 这是真正改变可见节点集合和尺寸的semantic LOD，不只是隐藏sublabel。成本在多级布局、路由、搜索揭示和状态一致性；不能从当前屏幕没节点推断原图没节点。Archify不应为少量SVG图引入tile/WebGL引擎。 |
| [Cytoscape navigator](https://github.com/cytoscape/cytoscape.js-navigator/tree/a7507f067eb4c7f3c11ec298992ec0c578b8c175) · `a7507f067eb4c7f3c11ec298992ec0c578b8c175` · [MIT文本](https://github.com/cytoscape/cytoscape.js-navigator/blob/a7507f067eb4c7f3c11ec298992ec0c578b8c175/LICENSE) | [实现及options](https://github.com/cytoscape/cytoscape.js-navigator/blob/a7507f067eb4c7f3c11ec298992ec0c578b8c175/cytoscape-navigator.js#L1-L9)分开控制拖动时pan更新与thumbnail rerender节流；overview是另一个阅读层。 | 小地图不应每次pointer移动重画整图，但当前semantic-radar已有视窗框和节点定位；不建议第二套overview，也不拿500ms rerender配置宣传“始终实时”。 |

另排除 [ApexTree@9bf93b2bd6b7ce90965d44afdfa3375310aa13d9](https://github.com/apexcharts/apextree/tree/9bf93b2bd6b7ce90965d44afdfa3375310aa13d9)：其README声明semanticZoom以固定geometry切换卡片细节，值得作为产品观察；但[该快照LICENSE](https://github.com/apexcharts/apextree/blob/9bf93b2bd6b7ce90965d44afdfa3375310aa13d9/LICENSE.md)明确商业Pro许可、没有免费tier，试用watermark仅供评估。本轮不把它列为可复用的开源依赖，不复制minified实现，也未验证其宣传效果。

## 深读一：jsMind的嵌套折叠保留了什么

[data_example.json L64–82](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/example/data_example.json#L64-L82)中，父分支powerful为expanded:false，仍有powerful1/2/3；powerful3本身也为expanded:false，并保存powerful31/32/33。这是实际已提交的嵌套输入，适合检验“父展开后，原先折叠的子分支是否仍折叠”。不是运行日志或本次浏览器结果。

[layout_provider](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.layout_provider.js#L528-L543)沿保留的children恢复visibility时尊重子节点expanded状态；[view绘边](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.view_provider.js#L704-L724)清画布后跳过不可见child。原始parent/children没有删除，也没有为隐藏后代创建一条新的“汇总关系”。

这里的稳定性不能说成“位置都不动”。[局部布局](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.layout_provider.js#L492-L518)重算对应侧纵向offset；[toggle](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.js#L260-L278)配合[save/restore location](https://github.com/hizzgdev/jsmind/blob/2aeca49716c549e4957535632602bf0cece198b8/src/jsmind.view_provider.js#L518-L529)补偿scroll，让操作节点留在原观察位置。本轮未跑浏览器，未验证缩放状态下补偿的实际效果。

它还把选中与折叠分开：mousedown选节点，点击expander才toggle；root不可toggle。隐藏节点的select/center路径拒绝该节点，没有Archify Finder式祖先揭示。借鉴应只取独立状态和anchor意识，不因为另一个工具有动态重排就替换当前更稳定的完整树布局。

## 深读二：隐藏关系、原始关系与meta-edge是三层对象

complexity-management的[removedEles查询](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/src/complexity-management.js#L428-L445)说明图中看不到的邻居仍有原ID可找回。其[demo/sample-graphs.js](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/demo/sample-graphs.js)确有compound输入：node.data.parent与位置仍在，而非把所有分组都预先压成单节点。完整文件本次只读取得1,777,040 bytes，SHA-256 `d44bdc410b743d33aae8cd5a7296c47164e6898fb1dd058452dd74c82124eb1b`；没有执行其中的window赋值或demo。

聚合边的含义也很明确：[创建处](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/src/complexity-management.js#L313-L330)刻意暂关add监听，因为这是complexity-management引起的显示变化，不是原始topology新增。[collapseEdges分组](https://github.com/iVis-at-Bilkent/cytoscape.js-complexity-management/blob/29601906a13ee8d21126ef2fbee126cd3a9b2fd1/src/complexity-management.js#L663-L687)以两端ID排序分组，明确忽略方向，再让底层管理器返回meta-edge。不能把这样的source/target与size直接改名成原始有向调用边及调用次数。

这不是声称该工具有bug；它是在做它声明的抽象。对Archify而言，若未来让Architecture group折叠，至少要明确原边集合、汇总边身份/方向、跨边界关系、可见/过滤/隐藏账目、展开恢复和导出。现有Tree只隐藏后代，不承担这些合同。只加UI按钮并不能低成本获得compound folding。

## 固定到指定dev的能力比较

本轮目标严格为GitHub dev **`67f12389212c54b3122da60e2813c7f8dab7ab2f`**，不把hub工作树HEAD当当前。后台agent最初读到25cf3708；作者随后实际比较25cf→67f owning files：tree-branches、Tree README及tree browser tests无变化；Finder和semantic-radar只有IME guards/换行差异，不影响以下折叠、祖先揭示与overview结论。最终引用均固定到67f。

| 新来源提示 | 67f owning source已做什么 | 剩余差异与判断 |
| --- | --- | --- |
| 父展开不重置子折叠 | [tree-branches.js L24–66](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/tree-branches.js#L24-L66)保存各branch的collapsed状态；visibility由祖先状态决定；reveal只删除目标祖先的collapsed项 | 嵌套独立状态已有，不立新API。 |
| 折叠时保持阅读位置 | [Tree合同L69–90](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/renderers/tree/README.md#L69-L90)一次布局完整树、隐藏后代/links、计数叠卡、独立focusable toggle；Finder/Outline/shared-link先揭示祖先 | 不换成jsMind动态重排；全树导出与屏幕折叠也已有明确区别。 |
| 临时邻域/关系突出 | [semantic-lens](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/semantic-lens.js#L175-L220)已有legend hover/focus预览；[选择逻辑](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/semantic-lens.js#L371-L404)保留方向计数；[Route](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/route-probe.js)读compiled有向语义 | ForceGraph的双向邻居演示不是更精确的方向解释，不改现有reach为无向邻接。 |
| 小地图反馈当前视窗 | [semantic-radar L367–383](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/semantic-radar.js#L367-L383)同步logical viewport及缩放/可见范围文字 | 不新增navigator；没有实测显示当前这层就是性能瓶颈。 |
| 以关注点为anchor缩放 | [viewer-camera](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/viewer-camera.js#L289-L307)按钮zoom保留既有中心对应，并有centerAt路径 | pointer-wheel与按钮中心确实不同；不能为模仿D3把页面滚轮默认抢成zoom，现有camera缺陷与在审修复先处理。 |

现有测试只作为覆盖意图阅读，未执行：[tree-branches-browser.test](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/test/tree-branches-browser.test.mjs)已保护位置稳定、键盘、揭示、完整导出与共享链接。没有把读到测试源码写成新dev本地pass。

## 实际在审工作排重，不从旧基线另开一套视图

- [PR #1103](https://github.com/tt-a1i/archify/pull/1103)，本次读取head `a0348855a217c7c0098a7d2079f470dc8cfa02b8`，目标labs/code-analysis，仍为draft。已读实际[atlas.mjs](https://github.com/tt-a1i/archify/blob/a0348855a217c7c0098a7d2079f470dc8cfa02b8/archify/modules/code-analysis/overlay/atlas.mjs#L58-L145)：buildAtlas读取raw facts、已解析file依赖、函数度量与finding；unresolved另计，不画成曲线。模块/file/function层级、complexity、cycle突出及回Classic源码证据已有实现。这里不另提Atlas、bundled dependency overview或一套source inspector，也不将其函数spike误称function call graph。代码存在、作者测试陈述与合入/人类视觉验收是不同状态。
- [PR #1102](https://github.com/tt-a1i/archify/pull/1102)，本次读取head `3b5b16c0d8924e2d6ab26f2d18ec50453cde2390`，目标dev，仍为draft。除body/变更文件外，已读实际[focus.js](https://github.com/tt-a1i/archify/blob/3b5b16c0d8924e2d6ab26f2d18ec50453cde2390/viewer/focus.js#L387-L458)的explanation与[drilldown surface](https://github.com/tt-a1i/archify/blob/3b5b16c0d8924e2d6ab26f2d18ec50453cde2390/viewer/focus.js#L485-L611)。因此不把局部说明、跨图深入、返回交接或compare翻译当本轮新发现；LTS pinned inspector也要先证明现有Passport与该批集成不能满足实际任务。
- 只读检索open issue标题还看到[font/legibility #631](https://github.com/tt-a1i/archify/issues/631)、[camera stage #1000](https://github.com/tt-a1i/archify/issues/1000)、[tall zoom #1041](https://github.com/tt-a1i/archify/issues/1041)。这些是已有owner/讨论，不以“semantic zoom”新名称绕过。关键词检索不是全量无重复保证。

## 可复验的小方向与停止条件

**现在不实现，也不新增仅为凑数的fixture。** 如后续确有折叠状态回归，可从jsMind固定公开powerful/powerful3分支人工选一份极小Tree：先折子、再折父、再展父，子仍折；接着Finder选隐藏孙节点，只有其祖先被揭示，节点ID不变，完整导出不丢后代。基线已经声明这些行为，应先复用现有tests和实际输入，只有真实遗漏或回归才补一个结果级检查，不为每个新来源镜像一套测试。

如未来真实任务需要密集Architecture group缩略或semantic LOD，最小可比实验应先固定一个真实现有图，分别记录原始/显示节点边账目、搜索结果、可见标签与完整导出，然后比较读者是否更容易回答同一个关系问题。不能用随机force graph当Archify工作负载，不能隐藏标签后仅凭画面变干净就声称可读性提升，也不能把meta-edge当原边。这个前提目前未满足。

本轮没有公开输入证明一个小Viewer改动比既有能力或在审工作更有价值。新增折叠引擎、LOD布局、独立pin-inspector、wheel接管或另一overview都引入状态和可访问性成本；保持零产品实现是这次代码/范围比较的结论，不是默认拒绝探索。

## 完成边界

仅新增本报告，没有改README/gallery、运行上游、创建产品分支、commit或push。jsMind固定fixture/交互由只读后台agent深读；作者以指定67f owning source核对版本漂移，并读取compound wrapper、LOD、hover及实际PR。上游代码行为的静态判断、已提交fixture、作者声明、本轮实际运行（无）分别保留，没有新截图或用户收益结论。
