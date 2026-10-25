# Round 22：图阅读交互的四个新小来源，暂不新增实验

2026-10-25。**本轮建议0个新产品动作。** 四项确有可读源码、完整小输入或测试，但递归上下游、祖先展开、快捷键帮助已经被Archify现有能力覆盖；任意compound折叠的聚合边则需要额外图模型。没有发现值得为了本轮再加一个按钮、隐藏模式或图导入器的具体缺口。这是当前价值/成本判断，不是宣称图阅读已无改进空间，也没有测量用户效率。

只读GitHub固定tree、原始源码、一级README/许可和测试文本，没有执行上游程序、测试、安装、构建或浏览器。上游断言均写作expected，不是本轮实测。按research工作流将其中两项交给背景agent做一级来源核实，其结果与另两项合并在本报告；唯一仓库写入是本文件。

## 先排除已有方向

先扫描hub全部scouts的项目链接及交互关键词，再定向复读 [Graph reading round 5](graph-reading-round5.md)、[Local context](local-context-smalltools.md)、[Graph interaction round 14](graph-interaction-round14.md)、[Round 18 small graph interaction](round18-small-graph-interaction.md)、[Round 18 local reading](round18-local-reading-smalltools.md)、[dev overlap](product-overlap-dev-1731.md)，并核对hub当前43项实验表。四个owner/repo在既有scouts没有字面命中；这表示未发现此前深读，不证明所有历史间接链接都不存在。没有按star选项，旧项目也可入选。

Archify产品对照固定 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，独立分支与未发布原型分开：

| 已有合同/候选 | 本轮不能再声称的新能力 |
| --- | --- |
| [Route Probe/Journey](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/README.md#route-probe-contract)：沿authored方向BFS，DOM边顺序保留首个到达路径及精确edge，Journey逐站读；不是所有路径枚举 | 不把“高亮路径/逐步读路径”重新包装成新功能；上游全祖先后代集合也不能当单一路径。 |
| [Focus/Reach](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L183)：单节点上下游和方向、深度、精确边账目；Passport直接关系可读 | 递归上下游并非空白；已发布Relation reference补复制关系身份，Edge extras读原合同额外字段，不是新遍历模型。 |
| [Semantic Lens](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/semantic-lens.js#L1-L5)：一种kind读触及它的关系，两种kind读直接跨kind关系；[Radar](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/semantic-radar.js#L1-L5)已有语义总览+实时viewport | 不再做普通legend筛选、minimap或另一个邻域面板。kind、edge label和edge type是三种不同数据，不互换。 |
| [Tree](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/tree-branches.js#L24-L66)隐藏后代而不搬动节点，Finder选择隐藏节点揭示祖先；左右键有既有树合同 | 不为任意图引入Tree同名功能；单parent归属不同于任意DAG多parent可见性与compound边汇总。 |
| [Guide与快捷键](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/template.source.html#L450-L486)、Finder/Outline；独立Finder canvas/context、Source keyboard、Keyboard traversal分支 | Guide已经列出 / R M L F 及E/T/S/0/+/-/Esc。Source keyboard补Enter/Space动作，不能称新增Tab可达；Keyboard traversal是QA gate修正。 |
| hub已发布Line notes/Static uses/Hintful等内容；[Round18空间焦点候选](round18-small-graph-interaction.md)仍按hub记录为本地原型 | 不用“代码+图”换fixture充实验；屏内plain Arrow移动DOM focus已有专门候选，不再建议一次。 |

同日只读开放PR标题，并读取 [#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103)正文：它将Code Analysis已有事实投影到module/file/function层，连接回Classic证据。它仍是open draft，不是dev已有能力。[#1015](https://github.com/tt-a1i/archify/pull/1015)既有Explainer层级、code/source focus方向，以及#1027/#1076移动控件议题均不应改名成本轮候选。这里只是标题/相关正文排重，不宣称检索了所有关闭issue或证明没有重叠。

## 四个固定新来源

| 来源、固定revision、许可 | 完整官方小输入与owning consumer | 读者动作与结论 |
| --- | --- | --- |
| [pshickeydev/d3-graph-viz](https://github.com/pshickeydev/d3-graph-viz/tree/d968ca000c265de27325ef1a86464cb0ee2194ba) · `d968ca000c265de27325ef1a86464cb0ee2194ba` · [Apache-2.0](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/LICENSE) | 完整[test/data.test.mjs](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/test/data.test.mjs#L815-L836)内52节点、两parent fixture；[data.js reveal](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/data.js#L1368-L1395)与[实际node click](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/graph.js#L407-L429) | 搜索目标展开所有祖先；DAG一条parent关闭不保证child隐藏。不是有限路径展开，不能把childCount称隐藏数量。暂不移植。 |
| [khadirullah/diagview](https://github.com/khadirullah/diagview/tree/2348f89e342213dfffe991c7926ba9caabf02f4b) · `2348f89e342213dfffe991c7926ba9caabf02f4b` · [MIT](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/LICENSE) | 完整[off-layout-keyboard.html](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/tests/e2e/fixtures/off-layout-keyboard.html)1790B，含4个小SVG；[入口consumer](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/src/features/diagram-init.js#L401-L429)与[实际e2e测试源码](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/tests/e2e/verify-off-layout-keyboard.spec.mjs#L112-L149) | SVG入口Enter/Space开fullscreen、Esc回入口，help的焦点范围与返回有明确边界；Archify已有Guide和动作，不增help系统。 |
| [tintinweb/vscode-interactive-graphviz](https://github.com/tintinweb/vscode-interactive-graphviz/tree/1074d8c264b05c9460aeacf1027fc5c61e43ac29) · `1074d8c264b05c9460aeacf1027fc5c61e43ac29` · [GPL-3.0正文](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/LICENSE)，内置Graphviz SVG组件另有[MIT通知](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/Licenses/jquery.graphviz.svg.LICENSE.md) | 完整[12_multiplePaths.dot](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/test/corpi/12_multiplePaths.dot)25B与[50_clusters.dot](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/test/corpi/50_clusters.dot)220B；[selection入口](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/content/index.html#L362-L386)→[highlighting](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/content/highlighting.js) | 单选/累积选择、上游/下游/双向递归高亮。与Reach重叠；corpi存在不等于该文件有自动行为assertion。没有把平行边样例当精确多边身份已验证。 |
| [georgegui/visual-project-map](https://github.com/georgegui/visual-project-map/tree/7345cab24b0c5fd51fac46d98f434f5733588ae8) · `7345cab24b0c5fd51fac46d98f434f5733588ae8` · [MIT](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/LICENSE) | 完整[minimal.json](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/plugins/visual-project-map/examples/minimal.json)4073B，3module/8node/10edge；[loadGraph](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/plugins/visual-project-map/viewer/src/viewer.js#L8-L16)→validate/create compound节点→[CollapseManager](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/plugins/visual-project-map/viewer/src/expand-collapse.js) | module折叠后用代理端点重建meta边；trace收集全部上下游，不是单路径。机制有用，但已是第二个投影状态模型，不作轻量Archify补丁。 |

## DAG展开：可见性账目比“+数字”更重要

[d3-graph-viz data.js](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/data.js#L292-L310)按所有edge.from/to建立children/parents，rel不是层级过滤条件；childCount是outgoing edge数，parallel也可能计入。它不是隐藏节点数，也不证明点击后会新出现同样多节点。

[getVisible](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/data.js#L1301-L1339)在type允许时按任意已展开parent保留child，只有两端可见才保留edge；[reveal](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/data.js#L1368-L1395)BFS所有祖先并展开。完整test fixture通过seg1→repo1和team-0→repo1区分两个parent，expected是两parent都expanded、repo1 visible。50个team来自测试内生成表达式；这是官方构造测试，不是自然业务图或本轮执行结果。[collapse recursive](https://github.com/pshickeydev/d3-graph-viz/blob/d968ca000c265de27325ef1a86464cb0ee2194ba/js/data.js#L1280-L1296)还清除后代expanded状态，不应误称与Archify Tree保留独立状态完全一样。

可学习的问题是“我关掉这一支，为何这个共享节点还在”。但Archify Tree的单parent归属、Dependency map与Task occurrences内容已分别说明结构/共享identity；给Architecture默认隐藏再加提示将先制造新状态，尚无本地任务证明收益大于维护成本。本轮不加默认hide、hop slider或hidden-count badge，也不拿未执行expected宣称视觉/键盘可用。

## 快捷键可发现性：入口合同不同，不能只比按钮数量

DiagView面向任意SVG fullscreen壳。其[diagram-init](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/src/features/diagram-init.js#L401-L429)只在keydown的target恰好是外层入口且Enter/Space时打开，避免吞掉内部链接；入口可focus，内部有交互时语义group而非嵌套button。[help构建/关闭](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/src/ui/keyboard-help.js#L125-L251)保存opener，仅焦点仍在help/viewer/body相关范围时返回；[help trap](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/src/ui/focus-manager.js#L246-L296)不把背后viewer按钮纳入。测试明确包含有标题、无标题、Details内链、header布局，支持研究真实入口而非仅README宣传，但本轮未跑。

[keyboard.js](https://github.com/khadirullah/diagview/blob/2348f89e342213dfffe991c7926ba9caabf02f4b/src/features/keyboard.js#L14-L96)以首次非输入、非composing按键加dv-keys来显示key badge；这是启发式，不是物理键盘检测。Escape先help、再search/menu、最后modal，help打开时不把方向键用于图。Archify已有Guide；本轮没有发现用户无法知道动作的实际本地反例，不为了借这个启发式增加另一份帮助、输入法/触屏检测状态或modal优先级。

## 方向追踪和compound代理：保留端点与边身份边界

vscode-interactive-graphviz的[highlighting.js](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/content/highlighting.js#L12-L45)可由节点或edge选择追上/下游。其[linkedTo/linkedFrom](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/content/graphvizSvg/jquery.graphviz.svg.js#L437-L464)解析Graphviz name中的箭头与port，调用[findLinked递归](https://github.com/tintinweb/vscode-interactive-graphviz/blob/1074d8c264b05c9460aeacf1027fc5c61e43ac29/content/graphvizSvg/jquery.graphviz.svg.js#L367-L382)并以已有node集合止重；不能据此推成精确label/id的全平行边审计。小corpus完整读取，但没找到该输入对应自动高亮expected，因此它只为consumer提供格式实例，不冒充测试通过。

visual-project-map的[tracePath](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/plugins/visual-project-map/viewer/src/interactions.js#L635-L674)分别遍历所有incomers/outgoers，再保留集合内两端的edge；名字叫path不等于某两个端点间一条精确path，更不是运行trace。[collapse实现](https://github.com/georgegui/visual-project-map/blob/7345cab24b0c5fd51fac46d98f434f5733588ae8/plugins/visual-project-map/viewer/src/expand-collapse.js#L30-L115)保存originalEdges和被移除后代，按折叠祖先解析endpoint，删除src===tgt边，按解析后的端点对汇总meta边；label去重，≤2个拼接，更多显示第一个加+N。**这个N是其余不同label数，不是隐藏edge数。** 边details并非都进入聚合meta边；不能把缩略图当完整原关系。它有清楚的恢复模型，但不同于Archify在authored拓扑上透明变暗背景的Route/Lens。重写这套逻辑会影响平行边、自循环、源引用、导出与hash语义，当前收益不足以支持移植，也不推荐只抄一个视觉+N。

## 结论与后续触发条件

本轮不启动实现分支、内容示例或新schema。四个新来源满足调研数量，至少DiagView完整小fixture+实际consumer+浏览器test源码、d3-graph-viz完整官方fixture+data consumer+unit test源码能约束具体语义；“存在测试源码”始终不等于已运行。

若后续某份真实Archify图在现有Route/Reach/Lens/Finder下仍无法完成一个明确任务，例如需要知道某个已存在过滤动作确切隐藏了哪些关系，先保留固定HTML/节点与边ID并复现，再判断加局部文字账目还是新动作。不要先隐藏更多内容来证明需要hidden hint；也不把单一路径结果误标成唯一/全部路径。现在没有这样的已核反例，因此0建议是合适的结果。

## 原件指纹与未测范围

原件只读保存在checkout外临时研究目录；以下为完整文件SHA-256，不是摘录hash。两项Graphviz/visual-project-map共18原件另对固定tree的Git blob SHA-1逐项核同；另外两项原件/完整测试由背景agent核对并提供指纹。许可只读，不在本轮复制上游代码或素材进产品；GPL组件与MIT第三方通知分开记录，不假定整个extension是MIT。

| 项目 / 完整文件 | bytes | SHA-256 |
| --- | ---: | --- |
| d3-graph-viz `LICENSE` | 10766 | `7ace1eaf472a13ba21c4a832d1d5c5f044d7942fab043c5f16147bcc8069492c` |
| d3-graph-viz `test/data.test.mjs` | 62911 | `f04b3f21e71ac15521f6d8832de951527a91fa48a8d1e00b343311f435def85b` |
| d3-graph-viz `js/data.js` | 50923 | `0ba2a716f77ef93490428d22add01524082e82401858f700827d8f9a5d5e7332` |
| DiagView `LICENSE` | 1077 | `f33b52a2ef8bd000eeecd79bf3aeefe9accfb431ec983bdd1689e7b04bed6bff` |
| DiagView `tests/e2e/fixtures/off-layout-keyboard.html` | 1790 | `b5b6f0faf755edacf597d757916eb597f24c03c53ba16246e61f565c67d3d398` |
| DiagView `tests/e2e/verify-off-layout-keyboard.spec.mjs` | 6434 | `4d8b968f3d274ff0883231be77341d6ddc442b52da1e412fc45efaf4d2561eb6` |
| DiagView `src/features/diagram-init.js` | 24422 | `42b5d1375fe833e10fdc8ea08e632fb470cb7b102cb3154ed6af7ca3e0cc7557` |
| vscode-interactive-graphviz `LICENSE` | 35148 | `8b1ba204bb69a0ade2bfcf65ef294a920f6bb361b317dba43c7ef29d96332b9b` |
| vscode-interactive-graphviz `test/corpi/12_multiplePaths.dot` | 25 | `ce6d23c68b0896dedae2c4a06422bbce993fe53106f85a7e8d093169e79484c8` |
| vscode-interactive-graphviz `content/highlighting.js` | 1444 | `06dc539dd280eed9477c495608bbf01f73461d108a6a652eeeab2511132a2aa2` |
| visual-project-map `LICENSE` | 1067 | `a34409241704b2eb05b78a62ab9308803e1338857b64703e1801c65b369efd10` |
| visual-project-map `plugins/visual-project-map/examples/minimal.json` | 4073 | `91b512dfa76e99014dedc4189f664b2a4bcbc597f1cb96672a640e5307fdceb1` |
| visual-project-map `plugins/visual-project-map/viewer/src/expand-collapse.js` | 4986 | `0da259242458aa721d7797633828f0ddb3f638b636f0133e363d141ec9daa739` |

没有上游执行/安装、renderer生成、Ego或其他browser操作、AT、触屏、OS剪贴板、性能/用户收益证据；没有修改其他报告、产品、实验或hub README，没有commit/push。报告所述源码结论仅对上述固定revision成立。
