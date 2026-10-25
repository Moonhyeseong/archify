# Round 18：空间方向浏览，与沿关系阅读分开

2026-10-25，只读研究。先读 hub README、全部 69 份 scouts 与 499 个 GitHub owner/repo 引用，并按项目名/重命名排重。Cytoscape/ReactFlow 家族、ELK/Dagre/Graphviz、D2（terrastruct/d2 与已读 d2lang/d2 同源）、maxGraph、Reagraph、round14 的 CoGraph/crgraph 均不重复计数。以下 **5 个新项目有已读完整许可**；Svelvet 另记为许可材料不完整的排除项。不按 stars 筛选，旧但具体的小工具也保留。没有运行上游、安装、浏览器/Ego、产物或远程写入；本轮只新增此报告。

**最多保留一个可独立分支验证的小机制：在已取得 DOM focus 的原生 SVG 节点上，用普通方向键把 DOM focus 移到当前可见区域内的几何邻居，仍由既有 Enter/Space 激活。** 不沿关系、不改变选择/Passport/pin/hash、不动相机；首轮排除 Tree。独立静态评估确认这不同于现有名单/关系顺序。它是有明确学习任务的原型候选，不是已经证明的可用性改进，也不是完整键盘模型迁移。

## 五个固定新来源

| 项目 / 固定 SHA / 许可 | 实际交互与 owning source | 借鉴/成本判断 |
| --- | --- | --- |
| [Foblex/f-flow@8ccfe9e32f0f990c955524eb8ab48abab0cf8735](https://github.com/Foblex/f-flow/tree/8ccfe9e32f0f990c955524eb8ab48abab0cf8735) · [MIT](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/LICENSE) | [f-a11y-navigation.ts](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/plugins/a11y/f-a11y-navigation.ts#L11-L68) 按面对的矩形边距+离轴距离评分，支持反方向回到记忆来源；[controller L511–569](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/plugins/a11y/f-a11y-controller.ts#L511-L569) 候选包含 node 与 connection midpoint，直接驱动 selection。 | 真正的新细节是按屏幕方向浏览，而非 DOM/名单顺序。只借动作，不搬 Angular、selection模型、role=application、连接编辑或整套评分/记忆状态。深读完整 fixture 见下。 |
| [reactodia/reactodia-workspace@8ea65d57e1c705f1c8540b4134a25796995ee2cd](https://github.com/reactodia/reactodia-workspace/tree/8ea65d57e1c705f1c8540b4134a25796995ee2cd) · [LGPL-2.1-or-later LICENSE](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/LICENSE.md) / [NOTICE](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/NOTICE.md) | [linksToolbox.tsx L405–487](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/src/widgets/linksToolbox.tsx#L405-L487) 按 relation type 三态 hidden / withoutLabel / visible；[standardLink.tsx L133–164](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/src/templates/standardLink.tsx#L133-L164) withoutLabel 留 path、不渲染标签。 | 比“高亮某类型”多一个动作，但要显式 type 身份、显隐状态、恢复/导出合同。当前 Archify 不默认按类型藏 label，未找到需要第二套类型控制的固定作品，不选此项。布局和语义数据的许可需分开，见下。 |
| [antvis/X6@dcce23f5eb50f387db78fd5e2921b181b523ae5c](https://github.com/antvis/X6/tree/dcce23f5eb50f387db78fd5e2921b181b523ae5c) · [MIT](https://github.com/antvis/X6/blob/dcce23f5eb50f387db78fd5e2921b181b523ae5c/LICENSE) | 完整 [label-along-path.ts](https://github.com/antvis/X6/blob/dcce23f5eb50f387db78fd5e2921b181b523ae5c/site/examples/edge/label/demo/label-along-path.ts) 用 textPath 跟随 smooth path、startOffset=50%；[attr/text.ts L51–64](https://github.com/antvis/X6/blob/dcce23f5eb50f387db78fd5e2921b181b523ae5c/src/registry/attr/text.ts#L51-L64) 解析 selector 并绑定实际 SVGPathElement。另有完整 multi-labels 构造。 | 沿曲线排字不是更准确关系；文本曲率、反向、缩放/导出/字体的成本高。现有 label placement/source labels 已能读原语义，不因演示好看替换布局。 |
| [jerosoler/Drawflow@ef8a88cdfbf2010cc0b641b94278be6db413938b](https://github.com/jerosoler/Drawflow/tree/ef8a88cdfbf2010cc0b641b94278be6db413938b) · [MIT](https://github.com/jerosoler/Drawflow/blob/ef8a88cdfbf2010cc0b641b94278be6db413938b/LICENSE) | [drawflow.js L1057–1086](https://github.com/jerosoler/Drawflow/blob/ef8a88cdfbf2010cc0b641b94278be6db413938b/src/drawflow.js#L1057-L1086) 双击 selected connection 加 reroute point、双击 point 删除；[L1100–1130](https://github.com/jerosoler/Drawflow/blob/ef8a88cdfbf2010cc0b641b94278be6db413938b/src/drawflow.js#L1100-L1130) 写回对应 output connection.points 并重绘。 | 这是真实编辑持久模型，不是局部阅读预览。Archify authored路由有自己的输入/验证/导出责任，不把静态 viewer 扩成 routing editor。 |
| [lewish/asciiflow@758bcb00fde489542baebcd0cabd2a4af1e586fe](https://github.com/lewish/asciiflow/tree/758bcb00fde489542baebcd0cabd2a4af1e586fe) · [MIT](https://github.com/lewish/asciiflow/blob/758bcb00fde489542baebcd0cabd2a4af1e586fe/LICENSE) | [draw/move.ts L20–110](https://github.com/lewish/asciiflow/blob/758bcb00fde489542baebcd0cabd2a4af1e586fe/client/draw/move.ts#L20-L110) 拖线段同时缩短/延长相连字符段；[L143–218](https://github.com/lewish/asciiflow/blob/758bcb00fde489542baebcd0cabd2a4af1e586fe/client/draw/move.ts#L143-L218) traceLine 按字符可连接方向找 attachments。[select.spec.ts L107–142](https://github.com/lewish/asciiflow/blob/758bcb00fde489542baebcd0cabd2a4af1e586fe/client/draw/select.spec.ts#L107-L142) 有完整小 ASCII 构造与移动预期。 | 连接保持有价值，但字符附件不是带 authored ID 的语义 edge。借它重建 ASCII/editor/model 层不值；不把几何重接称语义方向已验证。 |

另读 [Svelvet@a4a42eb5e5a6894156e7dcabaabbc235b593e484](https://github.com/open-source-labs/Svelvet/tree/a4a42eb5e5a6894156e7dcabaabbc235b593e484)：package.json 声明 MIT，README L395–397 的许可链接却指向另一 Svelvet-website 仓库的 moving main，当前完整 tree 未找到 LICENSE 正文。不是断言它闭源；本轮不以 badge/package 声明代替完整许可，也不把跨仓库 notice 套给此快照，故不列可复用来源或推荐依赖。

许可正文 bytes/SHA256：Foblex `1063 / 38131d068096ef2dc12dc701d5d221685fae66e0c3482a43e5a454f44809be3e`；Reactodia `24266 / 98ea297f5dbf967721aaa1c625ee8883e1ca75e3a4abd7ab586828a1f740c829`；X6 `1072 / d23f100d7fdde91467f13cf7ba97ae25191a2b28584f3961aaeea80f51ed30ab`；Drawflow `1067 / daf3d5445e32f01fd8c1fa52d1956daae15c506ef8a657b189837f60c2c6639c`；AsciiFlow `1069 / e314b46b42ba0e67f38d4472fd1f0eb111cd18b8e05bd55d90a4caac0cc49397`。没有复制上游实现或导入依赖。

## 深读一：空间方向不是拓扑方向

Foblex 完整 [f-a11y-navigation.spec.ts](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/plugins/a11y/f-a11y-navigation.spec.ts) 为 **3031B** / SHA256 `588f21a10613c65658472dbe1bc96a21d5e871e2abadef9af1bd2a1e97487d04`。这是已提交测试构造，包含矩形尺寸、近对角/远直线、高大节点、零大小 midpoint、preferred回程与中心距离tie等预期；不是独立图 dump，更不是本轮通过的测试。

owning 算法明确：先以矩形中心判断是否在目标方向，评分为面对边距加两倍离轴边距，tie 再看中心距离；preferredId 若合方向则优先返回。opposite箭头因此可有回程记忆，不保证每步都是无状态最近邻。某一测试命名“按边而非中心”不等于单个 fixture 能排除所有其他算法，实际评分定义以源码为据，不用测试名称当行为证明。

完整可读编辑例：[example.ts](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-examples/extensions/accessibility/example.ts) **2521B** / `3a741b4cd888bd97053214e20ec0ca853524e8e4dd8bf33c031ee886a2bf760b`，及 [example.html](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-examples/extensions/accessibility/example.html) **1525B** / `4259e4424faddabdbba4a939ebf10a0f23f22544ed42efffbe9550ced5f2185e`。四节点 Start(0,100)、Validate(240,0)、Process(240,200)、Finish(480,100)，只连 Start→Validate→Finish；Process 无边。它展示“空间可邻近，但未必相连”的自然对照。edge IDs 调 generateGuid，因此固定源码不等于固定运行时 ID；CSS/测量后rect也不能只凭position推断。未运行此例或生成图。

[controller L511–569](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/plugins/a11y/f-a11y-controller.ts#L511-L569) 把连接 midpoint 放进同一空间池，node→edge→node可成为操作序列。另 [L584–626](https://github.com/Foblex/f-flow/blob/8ccfe9e32f0f990c955524eb8ab48abab0cf8735/libs/f-flow/src/plugins/a11y/f-a11y-controller.ts#L584-L626) 的 Ctrl 拓扑 walk 找连接另一端，**不按 source→target 限定方向**，用几何选方向；byOther 按另一端node ID记connection，不能据此承诺任意平行边逐一可遍历。它不是 Archify authored Reach 的有向查询，也不是程序运行路径。

上游键盘层把 DOM focus 留在 host、selection随箭头变化、aria-activedescendant宣布当前项，还包括move/connect/delete。借读者动作不等于应搬整套 interaction model。本轮不能从源码文档宣称已经通过AT或WCAG验收。

## 深读二：藏标签、不藏边，仍需要额外模型合同

Reactodia 完整 [exampleDiagram.json](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/examples/resources/exampleDiagram.json) 为 **10723B** / SHA256 `f3fe4e2da73a73a341a4201f457ef57b6e1b4bf35bc61a84cc55797360e87669`，静态计数10 elements、13 links、6 relation types，含positions/expanded/vertices。它是实际 serialized layout，而非自足语义数据。

完整搭配 [orgOntology.ttl](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/examples/resources/orgOntology.ttl) 为 **84164B** / `903975a53b3613f9aa34ff9e4f6975d8a0b43d47941f717032548276cb1cd317`；[styleCustomization.tsx L12–13/L39–51](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/examples/styleCustomization.tsx#L39-L51) 用 bundled TTL 构造RdfDataProvider，再导入该layout（localStorage可替换）。此路径不需远端SPARQL，不能拿另一个basic例的moving master fetch冒充固定离线证据。**TTL L63另声明 PDDL1.0，不笼统套库的LGPL。** 本轮仅引其原声明与固定位置，未复制材料或对第三方数据原创性作保证。

实际链：linksToolbox从已有links列types → hidden/withoutLabel/visible按钮 → undo batch → [commands.ts L198–207](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/src/diagram/commands.ts#L198-L207) → [graph.ts L219–229](https://github.com/reactodia/reactodia-workspace/blob/8ea65d57e1c705f1c8540b4134a25796995ee2cd/src/diagram/graph.ts#L219-L229) 保存type状态/事件 → linkLayer调度 → standardLink只在visible渲染labels。serializedDiagram另保存visible/showLabel。这不是只改CSS文字opacity。邻近的 connectionsMenu 会调用connectedLinkStats/lookup并扩图，不能把 provider 查询/实体导入误说成这个本地label按钮成本。

当前Archify没有按relation-type持久显隐合同；raw label又不是可靠type ID。拿label或default/dashed样式当type会误分组。新建类型控制、隐藏账目和导出状态远比一个label开关多，本轮不选它。

## 另外三份可复查输入

- X6 label-along-path完整934B / `fa4948c3146ecc650655aff29f357acc5d6eddf0e2c48c29ed4ea0b1a84584e7`；multi-labels完整1780B / `3ebccd3a9ebc2b4563a644b3d785fa54c025c60726e937350ec58d6d0837f5a1`。它们是已提交TS构造，不是本轮SVG/截图。曲线文字不是视觉接受证据。
- Drawflow [docs/index.html](https://github.com/jerosoler/Drawflow/blob/ef8a88cdfbf2010cc0b641b94278be6db413938b/docs/index.html) 完整22802B / `d31b69005419afef69279527b448b2366567e5491b4f0265a6336c72a64abd71`。其中dataToImport是完整JSON字面：Home 8 nodes/6 output连接，Other 3/6，按outputs计数避免与inputs双计；docs把reroute设true，而constructor默认false。完整HTML有依赖/样式，不称独立安全图dump或执行结果。
- AsciiFlow [select.spec.ts](https://github.com/lewish/asciiflow/blob/758bcb00fde489542baebcd0cabd2a4af1e586fe/client/draw/select.spec.ts) 完整10806B / `1907ad48c1cf6907a8f2674ce97e283789aa49f2bf6fa738d96bc73bee9c6c26`。L107–142从三行字符box+箭头开始，平行移动缩短线、垂直移动增加bend并调整箭头。是上游构造/断言，未运行；不能把字符坐标换成source line或真实流程事件。

## 与固定 Archify 的实际差异

GitHub dev重新核为 **10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0**。直接读取 owning source：

| 已有行为 | 具体位置 | 是否覆盖候选 |
| --- | --- | --- |
| SVG节点 Enter/Space 激活 Passport | [focus.js L1684–1695](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L1684-L1695) | 不按几何方向移动节点DOMfocus。 |
| 关系hit overlay方向键/Home/End | [focus.js L1142–1168](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L1142-L1168) | 当前关系target的DOM列表顺序，不是空间邻居；必须保留它的作用域。 |
| Finder、Outline、Lens/Reach、overview、Tree独立折叠 | [node-outline.js](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/node-outline.js)、[tree-branches.js](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/tree-branches.js)与既有scouts | 不以换名字包装这些旧功能。Tree捕获左右键要优先，不混成新的“全图箭头遍历”。 |
| source-keyboard内容实验、keyboard-traversal QA实验 | 已有hub/对应研究与当前源码独立静态评估 | 前者来源激活，后者QA遍历预算，均非空间DOMfocus。不可因名称有keyboard认作重复，也不能声称原型已享有其浏览器证据。 |

[#1103](https://github.com/tt-a1i/archify/pull/1103) 同轮仍open draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；实际读Atlas源码未见此空间键盘控制，模块/文件/函数事实交接仍不重做。#1102已合入的Explain/drilldown/back与当前独立Relation reference不能被新键盘动作覆盖。open窄查 spatial navigation0、arrow keys0、edge labels15（含#248反向label、#1042 ink等），未见同题；只是该查询结果，不证明全局无重复。

## 唯一保留原型：viewport内移动焦点，不激活

新读者动作：**不离开当前画布，用右/下方向键找到眼前那个节点，再按既有Enter打开它；不先记名字到Finder、不按与视觉无关的Tab顺序逐项找。** 空间方向只指屏幕，不暗示依赖、因果或执行。教育性的原创小图即可验证动作，不需要先证明生产事故；但不能只截一张有节点的图就说导航有用。

建议原型边界由独立只读source评估收窄：只在exact event.target为原生SVG语义node自身且plain Arrow、非IME/defaultPrevented/非modifier时处理；不接管节点内链接/按钮/输入/contenteditable、关系hit/list、Route journey、Passport和页面全局键。Tree整图先排除。候选只取当前Viewer可见区域内完整可见的rendered node rect，按中心几何找目标；不导入Foblex评分/return-memory/connection-midpoint/selection模型，不引Angular。离屏目标不抢focus，没有目标时不造焦点。不会调用reveal（现有路径可能autozoom）、set/clear、hash或相机动作。

需要正视的现有边界：[viewer.css L4397–4405](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/viewer.css#L4397-L4405) 会把旧selection以外节点压到opacity .13；DOMfocus不能隐在暗处。若支持此状态，必须有仅focus-visible的临时清晰反馈，不能为了让目标亮起来清掉旧pin/selection。该条和几何导航不是一份新的选中状态。若修补需要扩成全局focus/相机状态机，停止此原型。

最小固定输入为原创4–6节点layout：DOM数组顺序刻意不同于屏幕顺序，包含同名不同ID、近右节点/远右节点、下方节点；可有关系，但焦点移动不读edges。保完整原生输入与正常生成HTML。真实键盘验收应逐项记录：从A右键到几何近邻B而非DOM下一项C；下键目标正确；DOMfocus改变但activeIds/Passport/pin/hash/camera不变；Enter仍按既有合同激活；内嵌interactive/IME/modifier/关系键不被接管；离屏/隐藏node不抢focus；已有选择下新焦点可见。截图用同viewport/theme/preset比照焦点落点及原pin保持，不宣称AT、跨浏览器或人类效率。

代码成本预计是一处scoped键处理/几何选择和最小可见焦点反馈，**不是“只加方向键”零成本**：共享Viewer仍需focused真实键盘、直接调用者和必要生成/包证据。独立分支可把结果判为保留/拒绝；若没有比Tab/Finder更清楚的固定阅读任务，允许0实施。当前推荐只到一个受控原型，无产品整合结论，无新branch/产物/commit/push。

来源分工：Reactodia由只读后台agent深读后，本作者复核three-state路径、完整layout/TTL与数据许可；其他四来源由本作者读owning位置与完整fixture。空间原型的currentdev键盘/冲突评估另由独立agent只读复核；均未上游执行、浏览器、实机AT或收益测量。不是并发/锁批注方向的延伸，也未动其他人的文件。
