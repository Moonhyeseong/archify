# 阅读交互小工具：先排除已有功能，再找三个微实验

核实日期：2026-10-25。只读官方 README/选定源码/许可证与 Archify 当前 dev、issue、PR；没有执行上游程序，没有修改 Viewer，没有浏览器交互验收或图片。

本轮14个新仓库都未出现在 hub 当时现有9份报告的 GitHub repository 清单中。其中12个许可证明确；KDAB Code Browser 是带非商业限制的公开源码，any-jump.vim 未核实许可，**这两项只作产品行为观察，不计入12个已明确开源项目，不建议复制实现**。星数没有作为选择条件。

结论：没有理由再做一种 Finder、Route、Lens、Focus、边 inspector 或 minimap。最小值得证伪的是 **复制选中关系的可读文本引用**、**导出前说明导出的范围**；**从关系列表跳走后单步返回来源节点**仅作为条件候选，需要避免与 Atlas/history 工作分叉。持久化书签、完整导航栈、搜索preview相机跟随、选择区域导出，成本和冲突都比表面看起来高，不进入本轮优先项。

## 1. 当前 Archify：以 dev 为准，不能拿另一个 checkout 当 dev

GitHub API 核实远程 `dev`：`82c7e0f089a02a4d514714adf37dc2061682da5f`（2026-10-24）。获准读取的 最初任务 checkout 是 detached `25cf37080fc8b1dbe758a4efc3935b55f3327083`。对 Viewer 做了两者diff：共有9增89删，包含IME guards移除、motion简化和注释变化；**这些本地差异不能转述为dev已部署行为**。随后在协调者提供的 `lab-ci-conditions/archify` 确认HEAD正是固定`82c7e0f`，直接复核Focus关系跳转、Copy Link与Export文案。纯研究，没有恢复或修改任何实现文件。

阅读了 [viewer/README](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/README.md)、Focus、Finder、Route、Outline、Export、Export cleanup、Guided Views 和 shell 的相关路径。上一批`graph-reading.md`已提出的Finder匹配画布强调、Reach 1/2/全部不再作为新发现。

| 已有行为与 owning source | 本轮必须承认的事实 | 本轮真正可能的缺口 |
| --- | --- | --- |
| [node-finder.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/node-finder.js) | 按ID/label/meta/source等查找，结果列表、Enter选择、focus-and-reveal、Route起终点picker | 不重做代码搜索、通用fuzzy索引、搜索边栏；结果画布强调已是前批候选 |
| [focus.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/focus.js) | 单点/多点、上下游Reach、关系列表、pointer/keyboard关系preview、图上relationship hit targets、pin；有from/to/id/raw label记录，拒绝冲突的key/id | pinned关系目前复制的是reading link；没有发现直接复制from→label→to纯文本引用动作。列表点击邻居会set新节点，未发现单图单步返回来源动作 |
| [route-probe.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/route-probe.js) | 有向BFS、平局按authored DOM顺序选路、Journey逐步播放、#route链接、实际edge identity快照 | 不把“解释路径/逐步播放”重命名成新功能；也不把最短跳数说成最短时延/唯一因果路径 |
| [node-outline.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/node-outline.js) | 按外层context分组；pointer/focus可Intent Trace；当前选中aria-current；图上hover会同步并滚到outline项 | Neovim的“附近符号高亮/树侧栏”大部已覆盖，不再提一个outline组件 |
| [guided-views.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/guided-views.js)、Focus、Lens | 已有#focus/#relation/#reach/#route/#lens、view/beat moment等reading地址；native Copy Link | 单个bookmark/deep link不是新能力；持久化多书签还需artifact身份、失效和存储范围合同 |
| [export.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/export.js)、[export-cleanup.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/export-cleanup.js) | 普通输出clone去掉pan/zoom/focus/lens/route等阅读状态，恢复完整图；Route/Reach share card另有显式snapshot通路 | menu的普通PNG提示是Lossless image、Copy diagram是PNG to clipboard；可以只澄清“完整图，不是当前focus”，不新增导出类型或裁剪算法 |

**特别容易误判的实现**：`copyFocusLink()`在pinned关系有authored id时复制`#relation=id`，没有id则回退source node；不能写成“现有Viewer不支持复制关系链接”。`relationshipHitRecords()`同时保留raw `labelValue`与fallback显示label；纯文本引用必须区分两者，避免把“connects to”默认文案伪装成作者关系标签。固定`82c7e0f`的Viewer全文查找`FocusBack/focusBack/lastFocus/navigationHistory/pushState/history.back/history.go/backTo`未发现相应导航功能；`previousFocus`命中是Guided Views计算前后beat的stay/leave集合，`originNode`命中是Reach snapshot核验，均不是返回选择来源的栈。关系列表click直接set目标、再reveal；目前URL写入是replaceState。这支持“单步返回当前来源可能是实际缺口”，仍不证明Atlas分支没有同一实现。

## 2. 当前议题与冲突边界

GitHub官方API全文检索包括history/viewer、bookmark、back/navigation、copy/relationship、export/scope、preview/Finder；宽查询有分页，结果不是全部议题的穷尽证明。

- [#413 Atlas navigation](https://github.com/tt-a1i/archify/pull/413) **OPEN Draft**，head `5a0c069f600be305f34d48c6ac45ab28c4dfe2a7`。正文明确有nested diagram、camera/history restoration、persistent reading体验。**不独立设计全局history/跨图bookmark系统**；若单步返回也应由Atlas统一拥有，放弃另做Viewer实现是合理结果。
- [#280](https://github.com/tt-a1i/archify/issues/280)/[#281](https://github.com/tt-a1i/archify/pull/281) 是跨HTML drilldown/parentHref和Back。已读#280：显式上级返回，并不等于当前单图选择历史；本轮候选不新增href或parent schema。
- [#808 reading addresses](https://github.com/tt-a1i/archify/pull/808) **MERGED**。正文核实host-owned page与native state分工，Focus/Relationship/Reach/Route/Lens链接可在srcdoc host恢复。不要将一般“share state URL”作为新功能，不复制clipboard helper。
- [#862 fallback copy focus](https://github.com/tt-a1i/archify/pull/862) **OPEN**，已读当前正文：fallback clipboard成功/失败都要恢复原控件focus。纯文本引用必须复用现有`copyReaderText`、保留其策略，后续与此PR合并验证，不顺手另写一份fallback。
- [#229 retire share cards](https://github.com/tt-a1i/archify/issues/229)/[#234](https://github.com/tt-a1i/archify/pull/234) **OPEN**。#229正文已有移除普通/Route/Reach/Delta Share Card、只保留完整Copy diagram的方向，但当前dev源码仍存在Route/Reach卡片。**决策文本、当前实现、集成状态不同**。本轮导出范围文案只针对仍存在的普通PNG/SVG/Copy diagram，不新增或扩大卡片能力，也不擅自执行移除。
- [#180 full diagram page](https://github.com/tt-a1i/archify/issues/180) **OPEN**：title+diagram+cards合成新图。本轮不做页面导出；不要把普通SVG图像文案写成“包含完整页面”。
- [#452 author-ordered relationships](https://github.com/tt-a1i/archify/issues/452) **OPEN**，正文已读：新增authored order与按顺序highlight。不从关系数组或显示顺序推断运行顺序，不做关系排序/自动播放。
- [#83](https://github.com/tt-a1i/archify/issues/83)、[#221](https://github.com/tt-a1i/archify/issues/221)、[#664](https://github.com/tt-a1i/archify/issues/664)、[#816](https://github.com/tt-a1i/archify/issues/816)/[#795](https://github.com/tt-a1i/archify/pull/795)，以及IME与mobile/camera PR，沿用前批边界，不搭车重写。

查询`bookmark`与标题copy+relation均0命中，但不能以此保证没有另用名称的实现。当前remote #1075已显示closed（与早批open快照不同），也说明旧状态不能当当前事实。

## 3. 14个新项目：实际好点子与不适用之处

以下commit为本轮默认分支HEAD，不宣称最新稳定release。日期为提交日期。只借鉴行为，不引入编辑器、LSP、React、Graphviz或第二套图状态。

| 项目、固定来源 | 提交日期 / 许可 | 已核实的具体行为 | 对Archify的判断 |
| --- | --- | --- | --- |
| [stevearc/aerial.nvim](https://github.com/stevearc/aerial.nvim/blob/28fe6e822ae344544c379d60fcb13c9519a1f08a/README.md) `28fe6e822ae344544c379d60fcb13c9519a1f08a` | 2026-06-02；[MIT](https://github.com/stevearc/aerial.nvim/blob/28fe6e822ae344544c379d60fcb13c9519a1f08a/LICENSE) | 文档/API区分select的jump=false、next/prev、上下级导航；支持symbol sidebar和cursor位置同步。读取navigation.lua定位其模块，没有运行插件。 | 源码符号树与图上拓扑不是同一层级；Archify outline/current/preview已覆盖大部。不能据此再提一个outline或next/prev toolbar。 |
| [liuchengxu/vista.vim](https://github.com/liuchengxu/vista.vim/blob/1e90efad6e32c4f7d16b1ca8f49bf63d0693802e/README.md) `1e90efad6e32c4f7d16b1ca8f49bf63d0693802e` | 2024-12-11；[MIT](https://github.com/liuchengxu/vista.vim/blob/1e90efad6e32c4f7d16b1ca8f49bf63d0693802e/LICENSE) | nearby tag突出、浮动preview、jump可blink，ctags/LSP来源区别；[jump.vim](https://github.com/liuchengxu/vista.vim/blob/1e90efad6e32c4f7d16b1ca8f49bf63d0693802e/autoload/vista/jump.vim)可配置centering和close-on-jump。 | 值得保留“确认跳转”和“预览”分开；Archify已有这一原则。不要给hover加自动相机中心移动；不接LSP/ctags。 |
| [hedyhli/outline.nvim](https://github.com/hedyhli/outline.nvim/blob/d8e48fe265fa9c33364809bf9cf32a1f032a8ac1/README.md) `d8e48fe265fa9c33364809bf9cf32a1f032a8ac1` | 2026-10-10；[MIT](https://github.com/hedyhli/outline.nvim/blob/d8e48fe265fa9c33364809bf9cf32a1f032a8ac1/LICENSE) | `goto_location`、`peek_location`、`goto_and_close`、`toggle_preview`独立；restore_location是**把outline cursor对回源码当前位置**。 | 一个关键反例：restore_location不是“撤销跳转/返回origin”。不拿名字来支持history功能。展开树不代表图依赖展开；不搬floating live editor。 |
| [oskarrrrrrr/symbols.nvim](https://github.com/oskarrrrrrr/symbols.nvim/blob/b22e987c69749adcf1342e8040312e9318083d4a/README.md) `b22e987c69749adcf1342e8040312e9318083d4a` | 2025-08-19；[MIT](https://github.com/oskarrrrrrr/symbols.nvim/blob/b22e987c69749adcf1342e8040312e9318083d4a/LICENSE) | symbol details默认可隐藏；单独details/preview；preserve folds是“most of the time”；LSP和Tree-sitter双来源，默认TS优先；peek不等于goto。 | 减噪不一定靠删节点，可先把不常用细节保留在现有Passport。Archify已经渐进披露，不需要一套详情popover；不能照搬其默认语言过滤来隐藏authored图事实。 |
| [bassamsdata/namu.nvim](https://github.com/bassamsdata/namu.nvim/blob/69106f89d0d3f8c013a0185ec64ff734ae223410/README.md) `69106f89d0d3f8c013a0185ec64ff734ae223410` | 2026-10-01；[MIT](https://github.com/bassamsdata/namu.nvim/blob/69106f89d0d3f8c013a0185ec64ff734ae223410/LICENSE) | live preview、tree guides、可选jump labels；Favorites保存file-backed路径/位置而非buffer id，跨session存search/selection/folds/scroll；[bookmarks/init.lua](https://github.com/bassamsdata/namu.nvim/blob/69106f89d0d3f8c013a0185ec64ff734ae223410/lua/namu/bookmarks/init.lua)将picker位置交给store。 | 对Archify是存储身份的提醒：不同HTML共用node id，不能仅存id作全局bookmark。持久化metadata/失效/隐私成本高，**不推荐首版favorites**；现有Copy Link足够多数一次性分享。 |
| [SmiteshP/nvim-navbuddy](https://github.com/SmiteshP/nvim-navbuddy/blob/a34786c77a528519f6b8a142db7609f6e387842d/README.md) `a34786c77a528519f6b8a142db7609f6e387842d` | 2025-05-01；[Apache-2.0 / LICENSE.md](https://github.com/SmiteshP/nvim-navbuddy/blob/a34786c77a528519f6b8a142db7609f6e387842d/LICENSE.md) | [actions.lua](https://github.com/SmiteshP/nvim-navbuddy/blob/a34786c77a528519f6b8a142db7609f6e387842d/lua/nvim-navbuddy/actions.lua)：close恢复start_cursor；select先恢复origin并设jump mark，再到新位置；yank_name/yank_scope是明确独立动作。 | 最直接的小模式：探索有一个可返回origin；导航与引用复制是不同动作。只借鉴这两点，不搬三栏LSP UI、editable源码或Neovimjumplist。 |
| [folke/trouble.nvim](https://github.com/folke/trouble.nvim/blob/bd67efe408d4816e25e8491cc5ad4088e708a69a/README.md) `bd67efe408d4816e25e8491cc5ad4088e708a69a` | 2025-10-31；[Apache-2.0](https://github.com/folke/trouble.nvim/blob/bd67efe408d4816e25e8491cc5ad4088e708a69a/LICENSE) | pinned绑定source buffer与follow cursor分开；auto_preview默认开、auto_jump默认关；[actions.lua](https://github.com/folke/trouble.nvim/blob/bd67efe408d4816e25e8491cc5ad4088e708a69a/lua/trouble/config/actions.lua)的cancel回main，不关闭结果列表。 | “固定来源而不是跟着每次hover换语境”有价值，但Archify关系pin已经存在。可借鉴不把preview当commit；不加入通用filter/formatter framework。 |
| [kevinhwang91/nvim-bqf](https://github.com/kevinhwang91/nvim-bqf/blob/c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7/README.md) `c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7` | 2026-04-02；[BSD-3-Clause](https://github.com/kevinhwang91/nvim-bqf/blob/c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7/LICENSE) | quickfix preview可独立滚动、恢复preview原位置、开关auto-preview；signs过滤生成新list；README把history list切换标TODO。 | 不能把TODO当已有history。可用于判断preview本身也会失去上下文，但Archify不展示源码buffer，不直接搬preview窗。新增第二结果集合会增加状态，暂不做。 |
| [bumbu/svg-pan-zoom](https://github.com/bumbu/svg-pan-zoom/blob/667095a7901677e8557b6640a8f960777118320d/README.md) `667095a7901677e8557b6640a8f960777118320d` | 2026-01-16；[BSD-2-Clause](https://github.com/bumbu/svg-pan-zoom/blob/667095a7901677e8557b6640a8f960777118320d/LICENSE) | beforePan/onPan/beforeZoom hooks、limit pan、fit/center/reset、custom touch events；有synchronized两个SVG示例。 | Archify已有camera transactions和Radar，不值得换库。同步比较画布是可能方向，但需几何/身份对齐，成本高，且有Delta/Atlas范围，**不作低成本推荐**。 |
| [anseki/leader-line](https://github.com/anseki/leader-line/blob/34f59beb51739bc5d61fdc341c3308154e19f082/README.md) `34f59beb51739bc5d61fdc341c3308154e19f082` | 2025-04-11；[MIT](https://github.com/anseki/leader-line/blob/34f59beb51739bc5d61fdc341c3308154e19f082/LICENSE)；**archived** | mouseHoverAnchor临时显线、captionLabel/pathLabel区分endpoint/middle/沿path；label attachment有生命周期/能否共享区别。 | Archify已有relationship hover/pin/token，**不是缺线条库**。path label文字方向不是关系真实方向，不能据此推断语义；不引入归档DOM geometry manager。 |
| [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw/blob/b7de45e88111f5680ae4bb3c3f3541c7d3b279fe/README.md) `b7de45e88111f5680ae4bb3c3f3541c7d3b279fe` | 2026-10-23；[MIT](https://github.com/excalidraw/excalidraw/blob/b7de45e88111f5680ae4bb3c3f3541c7d3b279fe/LICENSE) | **只研究ImageExportDialog微模块**：拿elements/appState snapshot，`exportSelectionOnly`初始为hasSelection，显式Only selected开关，准备exportedElements后做preview。 | 借鉴“导出的是哪个范围在点击前说清楚”，**不移植选区导出**。Archify focus是阅读状态，不能照搬Excalidraw选择即编辑集合的默认值。 |
| [jgraph/drawio](https://github.com/jgraph/drawio/blob/84487b4891cbc0f32d7e30f34cf878c87cb1f414/README.md) `84487b4891cbc0f32d7e30f34cf878c87cb1f414` | 2026-10-23；[Apache-2.0](https://github.com/jgraph/drawio/blob/84487b4891cbc0f32d7e30f34cf878c87cb1f414/LICENSE)；品牌/第三方icons另有条款 | **只读Dialogs.js的输出/复制小模块**：按mimeType选择图像或text clipboard，支持file data preview和显式Copy；不是全面评审此editor。 | 明确动作的内容类型比一个含混Copy有用。Archify已有Copy Link/Copy diagram，不统一成单一Copy；不搬mxGraph/model/editor/服务器。也不覆盖已有[#72 drawio exporter](https://github.com/tt-a1i/archify/pull/72)。 |
| [KDAB/codebrowser](https://github.com/KDAB/codebrowser/blob/ebe91a86e4d06a23f5f7709d081f83e2cc14ef26/README.md) `ebe91a86e4d06a23f5f7709d081f83e2cc14ef26` | 2026-04-06；[CC-BY-NC-SA-3.0 / 商业许可另议](https://github.com/KDAB/codebrowser/blob/ebe91a86e4d06a23f5f7709d081f83e2cc14ef26/LICENSE)；**不计入开源项目数** | 原woboq/woboq_codebrowser重定向此仓库；跨项目references和编译源码成HTML，项目source/revision身份明确。README明确非商业限制，不是API metadata的“Other”就随便当MIT。 | 仅观察“引用必须带来源/版本”。不运行generator、不复制NC代码；Archify不应为它引入Clang编译数据库和源码浏览器。 |
| [pechorin/any-jump.vim](https://github.com/pechorin/any-jump.vim/blob/f95674d9a4251ac02f452d5f1861e4422f4652c7/README.md) `f95674d9a4251ac02f452d5f1861e4422f4652c7` | 2024-03-22；**许可证未核实**：API license未返回、README无许可；不计入开源项目数 | rg/ag正则定义/引用查找；AnyJumpBack、AnyJumpLastResults；首批10结果，用户可load next N/all；preview与open独立，group by file可开关。 | 产品小模式很明确：返回来源、重开结果、明示剩余。不能将启发式引用当语义证明，不能复制未许可实现；更不能从max10结果推断图的完整引用集合。 |

发现链：Namu README致谢明确链接mini.pick的getchar思路和作者jump-label贡献；outline生态的README/usage区分peek/goto/restore，用来源追查避免名称误读；Any-jump README链接dumb-jump.el，仅作发现线索，未把后者重复加入本轮数量。各项来源仍以表中固定commit为准。

## 4. 三个可证伪微实验

三个都是**实验提案**，未实施/未验证收益。优先级为A、B，再考虑C；如果A的文本引用没有实际使用场景，或B的文案没有改善范围判断，就停止，不以新增按钮为成功。

### A. pinned关系：Copy reference，而不是另一种图上inspect

**具体问题**：用户能复制关系链接，但在issue/聊天中仍要手工抄“哪个节点→哪个节点、哪个标签”。同名节点、双向边、平行边使手工描述容易不精确。

**借鉴**：Navbuddy的yank_name/yank_scope把“到这里”与“引用这段”分成不同动作；Drawio按输出内容类型提供明确Copy。Archify已有pinnedRelationshipRecord，没有必要新增索引、popover或metadata schema。

**最小候选**：仅pinned关系存在时，在现有Passport提供一个明确的`Copy reference`动作，复用`copyReaderText`，复制例如：

```text
API [api] → Orders DB [orders-db]
Relationship: persist order
Authored relation ID: api-persist-order
```

文本按真实from/to，不能因当前focus在目标节点而倒置；没有authored id则写“not provided”或省略该行，**不能把内部data-edge-key当跨版本稳定ID**。原始label为空要写“Unlabelled relationship”，不能复制本地化fallback的“connects to”冒充作者标签。自环两端一样照实。已有Copy Link完全保留；不把此动作加到每一条列表行，不生成一堆永久按钮。

**成本/影响**：偏低，Focus里取已存在record、1个按条件显示的button、locale文案和当前clipboard回归扩展。共享copy helper和#862在途行为需要合并验证；没有许可复制外部代码的必要。会改变共享Viewer/ZIP生成输入，不能因为是小按钮跳过正常PR范围协议与生成检查。

**证伪输入与行为**：同名label不同ID、A→B/B→A、同端点不同label/id、无label、无authored id、loop各一个最小fixture；复制文本必须和当前pin精确对应，invalid duplicate relation id不能得到误导引用；失败反馈不得写Copied；fallback后焦点保留在动作控件，原selection/hash/camera不变。canonicalSVG不得含这个动作或临时状态。测试实际按钮路径与受控clipboard边界，不用source断言冻结实现。

**图片**：固定1440×900，light/dark各一张选中平行边的Passport与边；一张将所得文本放在审查用安全文本板的组合图，显示方向/label/ID的对应关系。移动390×844确认第二个copy动作不挤掉close。图片能证明可读性，不能证明真实系统剪贴板或用户节省时间；应另记录复制结果与边记录一致性。

### B. PNG/SVG导出前只澄清scope，不做新exporter

**具体问题**：用户focus/zoom到局部后打开Export，普通选项写Lossless image，可能以为它会导出当前局部；实际cleanExportClone移除阅读状态，得到完整图。既有Route/Reach卡片又是另一种范围。

**借鉴**：Excalidraw ImageExportDialog在snapshot上明确Only selected，其当前实现值得学习的是**范围可见**，不是其选区默认值。

**最小候选**：只在普通PNG/JPEG/WebP/SVG/Copy diagram所在组增加简短可读scope说明，例如`Full diagram; reading focus and zoom are not included`。不改serializeSvg、不新建预览canvas、不加裁剪、不要写“完整页面”；不增加/改造Route/Reach卡片。若#229按现有决策先退休卡片，这句说明仍有用；不替#229作集成决策。

**成本/影响**：最低，仅existing menu文案/布局和locale；若要显示节点数，需要一个canonical语义集合且不同diagram模式有边碎片/隐藏legend等差异，首版**不加动态数量**。避免为了一个提示引入export preflight状态机。

**证伪条件**：同一固定图先focus一个node再zoom，普通PNG仍包含完整authored node/edge identity集合；新scope说明与实际输出一致。截图前后同一input、sameView/theme/motion；如果文案造成移动菜单溢出或把SVG auto-theme说成当前screen颜色，判失败。新文案不得改变已有导出字节/完成后selection保留。#180标题/cards页面导出仍然不在范围内。

**图片/任务**：1440×900、390×844，在明显局部focus状态打开Export，base/candidate截图并排；再放实际普通PNG，确认不会误认为局部图。让审阅者在不下载前回答“将得到局部还是完整图”，候选若没提高判断准确度，不继续增加UI。

### C. 只从关系列表跳转提供一次“回到来源节点”（条件候选）

**具体问题**：读者在A的关系列表点B，Passport切换成B；想回看A时需要重新Finder/在图上找。浏览器Back不是可靠方案，因为当前focus用history.replaceState而不是每次pushState。

**借鉴**：Navbuddy.close恢复origin、select保存jump mark；AnyJumpBack也是观察到的小交互，但其许可未知，不复制。**outline.restore_location不支持这个结论**，它只是同步outline位置。

**最小候选**：在**普通单节点**的relationship-list click这一条路径，记录一个originNodeId；导航后现有Passport显示`Back to A`，点击一次复用Focus.set与view.reveal回A，然后清空origin。不是浏览器history、不是“上一viewport”，不保存pan/zoom、scroll、Route、Reach、Lens、pinned edge、多selection、跨HTML；其他新的semantic动作开始后失效。hover/focus preview不记history。没有必要localStorage、sessionStorage或全局bookmarks。

**先决判断**：#413 Atlas明确拥有history/camera restoration；#280/281拥有跨图Back。如果实现者认为这个单图origin也应归Atlas，**不做独立实验**，将任务送回该工作。为了“完整返回”而扩成各种mode快照/URL parser协调器，成本就不再低，停止。

**成本/影响**：低到中，主要是避免把程序性Focus.set、hashchange和pointer preview误记为导航；新增清理条件不完整会造成错误Back对象。不能声称它恢复“完整阅读状态”，按钮文案应只承诺回节点。

**证伪fixture**：A→B跳转、B→A返回；A→B后选择C应清旧origin；hover B不出现Back；当前route endpoint picker拒绝的selection不得记origin；不存在/hidden tree node的恢复按当前reveal合同处理或明确不可用，不能清当前B后报错；keyboard路径和pointer路径一致。不开额外global快捷键，IME/输入和#862复制焦点互不改动。

**图片/任务**：固定生产deployment图，1440×900 light，选`gateway`关系跳到某API实例，记录A/B/back三个状态。要在图中读到来源与当前目标而非只拍一个Back按钮；移动端确认其不会挤压Passport。记录读者是否能一动作回到原节点，不假装camera恢复；如果图的已有邻居直接点击就足够，无额外收益时取消该候选。

## 5. 本轮明确不推进

- 普通邻域、路径逐步解释、edge hover/pin、minimap、来源链接、share-state URL已存在；不再换名字新增一套。
- 不接Neovim/LSP/ctags/React/mxGraph，不保存第二份node/edge模型，不做新的code indexer；code heuristic不能成为图语义证据。
- 不做跨artifact永久favorites：必须同时绑定artifact身份/来源revision，处理缺节点、改ID、不同文件同ID，持久化范围和失效UI成本不低。先用已有native Copy Link。
- 不把Preview视为已选择，不让每个hover自动pan相机；现有#221 camera安全区和#83多角色preview范围留给原议题。
- 不把节点/边显示顺序叫作调用顺序；#452明确要求authored order，不能从几何/array index猜。
- 不照搬编辑器Only selected导出；Archify的Focus是阅读选择，canonical完整导出是既有合同。选区新exporter和full page属于另议题。
- 不把NC/未核实license的公开代码列作可复用开源依赖。14个调查对象中有12个已核实开放许可，两个反例保留帮助后续避免误用。

完成：14新仓库固定提交/许可判断、current dev与获准checkout版本区分、owning Viewer代码和当前相关issue/PR阅读、3个小而可证伪的实验。未完成：实现、上游程序试用、native生成、截图、browser/OS clipboard/用户验收。仅新增本报告，没有commit、push或远程发布。
