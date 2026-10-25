# 代码导航第五轮：选区、调用位置和符号位置

2026-10-25。只读研究；未运行 Neovim、Tree-sitter、LSP、Go 程序或其他上游程序，未安装插件、启动服务、读取用户代码或打开浏览器。以下“测试”指读到的上游测试源码，不表示本次执行通过。

**结论：本轮不建议新增功能或独立内容分支。** 范围选择和调用位置导航有可借鉴机制，但与既有 symbol-evidence 候选、source-question-tour、PR #1102/#1103 比较后，没有建立一个新的单一阅读问题。下文完整给出一个可复核 Go fixture（1处 `measure` 声明、4处静态调用、3个 caller），供既有候选以后需要实证输入时使用；不把换一个例子当作新产品价值。现有原生图、正文引用和 SourceCards 足够表达，不需要 LSP、parser、关系 schema 或新的导航框架，也不推断接口运行时目标。

## 去重和比较基线

读取本轮开始时 hub README、40份 scouts 名单与全文仓库引用索引，按 owner/repo 不区分大小写去重；再定向复读导航/符号报告及 source-question-tour 实验正文。既有 source-navigation、local-context、repository-orientation、code-reading-utilities-round4 等报告已覆盖 Glance、Navbuddy、dropbar、Aerial、Outline、symbols、namu、CodeTour、Walkthrough、ctrlsf、matchup、treesitter-context/textobjects 等；本轮不重新计入。Hop 只计 smoka7 这一延续仓，不把 phaazon 原仓另算一项。8 个下列仓库均未出现在既有仓库索引中，其中 Leap 仅作迁移负面记录，其余 7 个核到实现源码。

Archify 比较对象严格固定为 GitHub dev [`67f12389212c54b3122da60e2813c7f8dab7ab2f`][archify]；没有把本轮未合入的实验当作 dev 能力。另核对两个 draft 的当前 head，避免把待合入工作重复推荐：

- [PR #1102][pr1102]，head `3b5b16c0d8924e2d6ab26f2d18ec50453cde2390`：维护批次已含 node explanation、drilldown 及其共享 Passport；此处不再建议节点下钻或解释面板。PR body 与文件清单已核，未重跑其测试。
- [PR #1103][pr1103]，head `a0348855a217c7c0098a7d2079f470dc8cfa02b8`：已读固定 head 的 [atlas.mjs][atlas-source]、[inject.mjs][inject-source]，Atlas 的 module/file/function 投影、依赖/复杂度/findings 与 Classic 源码证据交接属于现有候选范围；不再建议代码地图或从图跳源码。它仍是 draft，不能写成 dev 已有能力。
- hub 已有 Finder、Relation reference、Copy identity 和 CLI reading tour 等独立实验；本轮不重做搜索标签、复制身份、一般流程 walkthrough。

## 8 个新来源：具体动作和取舍

表内 SHA 固定本次读取版本，许可链接指对应版本；GitHub 的 license API 标签不是唯一依据，Hop 和 litee 的例外另列。

| 项目 / 固定 SHA | 许可与实际实现 | 读者具体动作、公开输入与边界 | 对 Archify 的取舍 |
| --- | --- | --- | --- |
| [flash.nvim][flash] `5f0f270fdc7c5b0c21d903ee85b9cb06f2ac636a` | [Apache-2.0][flash-license]；[treesitter.lua L14–104][flash-ts] 收集光标处 named node 和父节点、范围去重、生成标签 | 原位选择祖先范围；[jump_spec.lua][flash-test] 有三行 `foo` 的已提交 buffer 输入与跳转/选区断言，但不是 TS 祖先选择的黄金输出 | 深读。标签是临时定位键，不能变成节点稳定身份。现有 Finder/Walk 已有定位入口，不增加另一套字母提示 |
| [nvim-treesitter-textsubjects][subjects] `9e3edd38e44c8f3af5634c5e30a33ebd79227f11` | [Apache-2.0][subjects-license]；[select/prev_select L104–191][subjects-core] 与[语言 query][subjects-query] | 重复选择更大且严格包含原选区的 query 范围；可退回旧选区。公开材料是源码/query/README，未找到已提交执行 fixture/golden | 深读。启发作者把“调用表达式”和“所在函数”分开；不把它移植为离线 AST 编辑器 |
| [hop.nvim][hop] `6e83486f351066e38c3ae9daad2a4f01dfb262ad` | [LICENSE 原文][hop-license]为 BSD 三条件文本（API 为 NOASSERTION）；[jump_target.lua][hop-target] 从窗口/行/正则生成位置及排序分数 | 给可见候选加键提示；[hop_spec.lua][hop-test] 提交了重复字母、空行及移动方向输入。分数用于提示优先级，不是程序语义距离 | 输入是编辑窗口，Archify 是 authored 图；与 Finder canvas matches 重叠，不移植 |
| [nvim-various-textobjs][various] `dfbf0e9ccab4bad3c87961e1de3c8dc09d8f337a` | [MIT][various-license]；[linewise.lua L100–147][various-line] 按缩进/空行寻找边界 | 选择当前缩进块；inner/outer 处理边界不同，遇不到 outer 边界会返回 false。此机制依据排版，不声称语法或词法作用域 | 可借鉴边界明确性，不能用缩进给源码关系作事实证明；不增加自动作用域 |
| [harpoon][harpoon] `1bc17e3e42ea3c46b33c0bbad6a880792692a1b3` | [MIT][harpoon-license]；[mark.lua][harpoon-mark] `create_mark` 保存 filename/row/col，`add_file` / `store_offset` 管理标记 | 用户自己维持少量文件/位置入口。`manage-a-mark.lua` 只有 TODO/注释，不把它算已验证 fixture；此 SHA 不代表 harpoon2 分支 | 用户标记≠作者指定 tour。没有已证实离线页回访任务，不增加持久书签/本地存储 |
| [litee-calltree.nvim][litee] `b50c809d136ad479caf761a7f030da98c56c7976` | [help L3–5][litee-help] 写 MIT license；tracked tree 未见完整 LICENSE/COPYING，仅作机制研究，不复制源码；[handlers L84–107][litee-handler] | 树节点保存符号位置和多个 `fromRanges`，选调用位置与 Enter 跳符号是不同动作。未见测试/fixture/CI，contrib PNG 不能冒充数据输入 | 深读。只保留“调用发生位置与目标符号位置分开”的证据组织；拒绝 LSP 服务、调用树/history 平台 |
| [navigator.lua][navigator] `48a620e04cfbf8855ce670dd1f980bd680f224cb` | [MIT][navigator-license]；[hierarchy.lua L49–104][navigator-hierarchy] 从 from/to 建项，位置用 `selectionRange` | call hierarchy 浮窗/面板与源码来回读；[interface.go][navigator-fixture] 是完整公开 fixture。测试实际依赖 gopls；其中 `eq(ret, ret)` 不证明调用边正确 | 是既有内容候选可用的一份具体输入。不能把插件随机显示 id 或测试自比较当符号稳定性/正确性证明 |
| [leap.nvim GitHub 旧入口][leap] `42005994667fec7c4a318fc8441fe02e1a70186b` | [MIT][leap-license]；该 commit tracked tree 只有 LICENSE、README、doc/tags，没有 Lua 实现 | README 明确迁往 Codeberg。没有拿旧口碑填补当前源码，也未在本轮追 Codeberg 的新 revision | 负面记录，未深入、未纳入可复用实现候选；仅保留迁移事实 |

## 深读一：相邻范围不是“把 AST 父节点一直展开”

textsubjects 的 [select L104–151][subjects-core] 遍历 query 的 `@range`，只接受严格包住当前选区的范围，再在可比较的包围范围间保留更小者。它随后执行空白启发式：独占整行时可变为行选区并纳入相邻空行，不能说输出总等于原 AST range。语言规则决定哪些层能被选择；[Python query][subjects-query] 明确列函数、类、控制语句、参数/实参和集合元素，还记录文件首尾注释组的 TODO。因此“下一个范围”不是无条件父节点，也不能把不同 query 的层级当统一语义。

[prev_select L153–191][subjects-core] 保存 per-buffer 选区栈及 `changedtick`，修改文本后丢弃不匹配历史；这只是选区恢复，不是跨文件调用探索历史。公开 query 可以复核“哪些语法类别参与”，却不能在未运行 parser 时承诺某个光标位置必然给出哪串范围。本轮没有从 README 动图倒推 golden。

Flash 的 [get_nodes L14–104][flash-ts] 则对当前光标范围取 named node，沿 `node:parent()` 走祖先，按实际起止范围去重，给每个候选加标签。无 parser 时警告并返回空结果；Tree-sitter 模式显式 `multi_window=false`。[jump L107–149][flash-ts] 支持在本轮候选里 next/prev/确认。这种即时范围菜单适合编辑器，但离线 Archify 页面没有活动 buffer、光标或 parser；仅为了照搬动作增加这三个前提，维护成本超过本轮证明的价值。

可复核的真实输入：[Flash jump test][flash-test] 的三行 `line1 foo` / `line2 foo` / `line3 foo`，分别用 `pos={1,6}`、`end_pos={1,8}` 检查跳转/选区。完整文件 SHA256 `300995ec226274e6ebc6c53b56d04fffdc89be86262a1bc3f65643b462f26e9d`（2456 bytes）。这只证明上游提交了这些测试和输入；既不是本次执行结果，也不覆盖 TS query 或复杂范围选择。

**可迁移的写作方法**：给读者分别提供“这次调用表达式”“包含它的函数”“目标函数声明”三个明确来源范围；不需要让卡片自动扩张。范围关系由作者核对固定源码，不能叫自动作用域推导。

## 深读二：调用发生位置与符号自身位置分离

litee 的 [handlers L84–107][litee-handler] 同时保存 `location={uri,range}` 和 `references=fromRanges`；incoming 的 `from`、outgoing 的 `to` 是不同方向的 CallHierarchyItem。选中树项后，[buffer L37–43][litee-buffer] 触发 highlight；outgoing 在 [autocmds L177–199][litee-autocmd] 跳调用 buffer 中第一个 fromRange，`n` 在 [L81–125][litee-next] 遍历多处引用。Enter 则在 [init L283–319][litee-enter] 跳节点 location：这是 server item 的 `range`，没有再发 definition 请求，也不等同于精确 identifier 的 `selectionRange`。

重要限制：它有按需展开、折叠和将节点重设为 root，但 Next/Prev 最终只是树窗口光标上下移动，未找到本插件独立实现的 Back/Forward 历史。incoming 只在找到 caller 窗口时移动；高亮 buffer 的选用及深层 outgoing 复用 invoking buffer 有静态疑点，本轮未运行，不能给可靠跨层定位背书。服务端结果是静态分析事实/近似，不是已执行路径、调用次数或时间；重复调用位置也不等于运行次数。

用 navigator 交叉核对，不能把两个插件的行为混为一谈：[hierarchy.lua L73–96][navigator-hierarchy] 只把 from/to item 的 `selectionRange` 变成面板行列；该段并未投影 `fromRanges`。显示 id 来自随机数，不是源码身份。[call_hierarchy_spec.lua][navigator-test] 打开 Go fixture 并等待 gopls，部分断言只是面板存在和 `eq(ret,ret)`，所以本轮候选不把它的 UI 返回当调用图真值。

## Archify 当前能力与候选剩余差异

| 阅读任务 | dev 67f123 的已核实现 | 本轮结论 |
| --- | --- | --- |
| 保留当前节点，查看近邻/上下游 | [viewer/focus.js][archify-focus] 已有邻域、reachability、关系方向/目标、预览/固定关系 | 不新增邻域图、调用树 UI 或搜索标签 |
| 阅读固定源码 | [sources.mjs][archify-sources] 验证 path/lines/revision 并提供摘录；[reader.js L599–650][archify-reader] SourceCard 展示位置/revision、最多14行、固定来源链接 | 一处调用和定义可以各有一个来源编号/卡片，已足够承载内容候选 |
| 节点来源与关系来源归属 | Focus 的 node evidence 按 node id；关系条目本身不自动枚举 `fromRanges`。SourceCard `nodeSources` 每节点映射单个 source id，正文可放多个引用 | 不因此扩关系 schema：固定阅读页用正文“调用点1/2”及引用逐项列明，图不伪装自动 call hierarchy |
| 键盘进入来源 | `reader.js` 给引用链接 focus handler；仅有 nodeSources 的静态预览节点不会因 handler 自动取得 Tabstop，nodeBlocks 另有 tabindex | 验收优先正文来源编号。不能写“每个图节点都可 Tab 聚焦” |
| 折叠抽象层和图到源码 | Draft #1102 drilldown，#1103 Atlas/Classic handoff；已有 CLI reading tour | 不再提同类通用功能。本候选仅补“同一目标的多处调用证据”这一阅读问题 |

## 重复核查：不把 fixture 具体化称为新阅读问题

- 既有 [symbol-evidence-smalltools.md](symbol-evidence-smalltools.md) 的 Callscope 深读已经区分调用位置、函数声明、approx/unresolved，并提出“同一关系两个调用点 + 同名非调用”的 authored 样例。这里的四调用 fixture **属于该候选的输入具体化**，不是新的机制。它甚至没有自然的“同名非调用”负例，不能宣称覆盖旧候选全部验收；不得改写原 fixture 来伪装上游输入。
- [source-question-tour 的已推实验](https://github.com/tt-a1i/archify/tree/94d6a4d0/experiments/source-question-tour) 回答固定 Git 摘录/工作树内容、14行预览、Escape 条件等问题；同5片段比较问题顺序与文件顺序，已经证明现有 authored 内容可以组织多个来源。它的具体问题与 measure 不同，但“用问题串起 SourceCards”并非本轮新方法。CLI reading tour 则已读三出口与数据边界，本轮也不重做。
- PR #1103 的 Atlas 解决 repository 层级概览和 finding 到 Classic；#1102 包含 explanation/drilldown。四处调用的逐范围核对不是这两 PR 的同一展示，但单靠未重复 PR 并不足以立项，还要扣除前述 scout/内容实验重复。

因此没有成立的“单一新问题”。若未来继续既有 symbol-evidence 候选，唯一保留的问题是：**聚合成一条 caller→callee 关系后，如何核实没有漏掉同一 caller 的第二处调用？** 下面给出它的固定输入与最小投影，作为后续评估材料；本轮不建议另开分支。

## 可复核输入：四处调用与一处声明

读者看“调用 measure”边时，可以核对目标声明和每处表达式；作者只声明源码直接可见的关系，不把接口派发当作已解析的调用目标。

**完整最小输入**：[navigator 官方 `tests/fixtures/interface.go`][navigator-fixture]，固定 `48a620e04cfbf8855ce670dd1f980bd680f224cb`，MIT，962 bytes，SHA256 `4d70cd474f6e546e2be25c237bde42edbcf1e2adbf22a5404c98d9a1da01e24f`。这是上游已提交的测试源文件；本次未执行它，也未调用 gopls，没有上游调用层级 JSON 可以冒充采集输出。

| 作者核对的事实 | 完整文件行范围 | 不应推导 |
| --- | --- | --- |
| `measure(g geometry)` 声明及函数体 | 44–49 | 函数地址/符号稳定 ID、运行次数 |
| `m2` 里调用 `measure(rect{...})` | 51–53，调用点52 | 自动符号解析/成功运行 |
| `M2` 里同形调用 | 55–57，调用点56 | 与 `m2` 合并为同一函数；Go 大小写名有区别 |
| `runinterface` 的两处 `measure(r)` / `measure(c)` | 59–66，调用点62/63 | 把两处折叠为一处、把调用位置数称运行次数 |
| `main` 里 `M2()` / `m2()` / `runinterface()` | 68–72 | 图形排列是执行 trace、各分支执行成功 |
| `measure` 中 `g.area()` / `g.perim()` | 44–49 | 自动把接口派发连到 rect/circle 实现；本轮不解析、不画这些目标边 |

**既有候选若被继续时的最小投影**：一页 Explainer，首屏直接回答“1处声明、4个静态调用位置、来自3个 caller”；一张小型原生图保留 m2/M2/runinterface→measure 三条 authored 关系，runinterface 边可写“2处静态调用”。图非 execution trace、不声称调用层级采集；正文表列52/56/62/63及声明范围，各 SourceCard 绑定同一完整文件 SHA 与 revision。只用既有 SourceCard/正文引用；不重复 CLI reading tour 的分支解释，不增加多选历史、自动展开或关系模型。

**验收门槛**（仅供既有候选未来评估，本轮不实施）：

1. 保留完整原 fixture 和 MIT LICENSE；逐项核对完整文件摘要、行范围、原字面文本。SourceCard 片段不跨 revision；来源编号提供键盘可达入口。图中的作者关系要标“源码人工核对”，不能写 LSP 实测。
2. 一个有意做错的阅读反例应能看出来：把52与56合并会漏 caller；把62与63合并会漏调用位置；把44–49当调用证据会混淆声明与使用。所有这三个问题都应在页内有现成证据回答，而非迫使读者依赖宣传。
3. public render/finalize 后，root 实际截图首屏、四调用表、调用点与定义卡片；证据账目绑定最终 HTML/hash。不得以静态 gate 代替浏览器验收，也不声称省时或理解正确率提高。当前没有此产物、截图或效率测量。

本轮选择拒绝新实施：已有报告已提出同一调用点阅读问题，现有内容能力能表达它；没有证据支持新功能，也没有实际读者任务证明值得再开相似内容分支。固定 fixture 和各范围保留供复用，不用“低成本”替代价值证明。

## 调研证据边界

读取官方 repo 元数据、固定 Git tree、README/LICENSE、上述实现与测试文件；40份本地 scout 仅用于去重。研究材料仅下载到 checkout 外临时目录，仓库只新增本报告。没有运行上游 tests、解析器、编译器、LSP、数据库、用户扫描或服务，没有浏览器验收；没有覆盖率、速度、正确率或真实用户效果结论。litee 许可正文/fixture 缺失和 Leap 当前无实现已作为负面证据保留，不借其他版本补齐。

[archify]: https://github.com/tt-a1i/archify/tree/67f12389212c54b3122da60e2813c7f8dab7ab2f
[pr1102]: https://github.com/tt-a1i/archify/pull/1102
[pr1103]: https://github.com/tt-a1i/archify/pull/1103
[flash]: https://github.com/folke/flash.nvim/tree/5f0f270fdc7c5b0c21d903ee85b9cb06f2ac636a
[subjects]: https://github.com/RRethy/nvim-treesitter-textsubjects/tree/9e3edd38e44c8f3af5634c5e30a33ebd79227f11
[hop]: https://github.com/smoka7/hop.nvim/tree/6e83486f351066e38c3ae9daad2a4f01dfb262ad
[various]: https://github.com/chrisgrieser/nvim-various-textobjs/tree/dfbf0e9ccab4bad3c87961e1de3c8dc09d8f337a
[harpoon]: https://github.com/ThePrimeagen/harpoon/tree/1bc17e3e42ea3c46b33c0bbad6a880792692a1b3
[litee]: https://github.com/ldelossa/litee-calltree.nvim/tree/b50c809d136ad479caf761a7f030da98c56c7976
[navigator]: https://github.com/ray-x/navigator.lua/tree/48a620e04cfbf8855ce670dd1f980bd680f224cb
[leap]: https://github.com/ggandor/leap.nvim/tree/42005994667fec7c4a318fc8441fe02e1a70186b
[flash-license]: https://github.com/folke/flash.nvim/blob/5f0f270fdc7c5b0c21d903ee85b9cb06f2ac636a/LICENSE
[flash-ts]: https://github.com/folke/flash.nvim/blob/5f0f270fdc7c5b0c21d903ee85b9cb06f2ac636a/lua/flash/plugins/treesitter.lua
[flash-test]: https://github.com/folke/flash.nvim/blob/5f0f270fdc7c5b0c21d903ee85b9cb06f2ac636a/tests/search/jump_spec.lua
[subjects-license]: https://github.com/RRethy/nvim-treesitter-textsubjects/blob/9e3edd38e44c8f3af5634c5e30a33ebd79227f11/LICENSE
[subjects-core]: https://github.com/RRethy/nvim-treesitter-textsubjects/blob/9e3edd38e44c8f3af5634c5e30a33ebd79227f11/lua/nvim-treesitter/textsubjects.lua
[subjects-query]: https://github.com/RRethy/nvim-treesitter-textsubjects/blob/9e3edd38e44c8f3af5634c5e30a33ebd79227f11/queries/python/textsubjects-smart.scm
[hop-license]: https://github.com/smoka7/hop.nvim/blob/6e83486f351066e38c3ae9daad2a4f01dfb262ad/LICENSE
[hop-target]: https://github.com/smoka7/hop.nvim/blob/6e83486f351066e38c3ae9daad2a4f01dfb262ad/lua/hop/jump_target.lua
[hop-test]: https://github.com/smoka7/hop.nvim/blob/6e83486f351066e38c3ae9daad2a4f01dfb262ad/tests/hop/hop_spec.lua
[various-license]: https://github.com/chrisgrieser/nvim-various-textobjs/blob/dfbf0e9ccab4bad3c87961e1de3c8dc09d8f337a/LICENSE
[various-line]: https://github.com/chrisgrieser/nvim-various-textobjs/blob/dfbf0e9ccab4bad3c87961e1de3c8dc09d8f337a/lua/various-textobjs/textobjs/linewise.lua
[harpoon-license]: https://github.com/ThePrimeagen/harpoon/blob/1bc17e3e42ea3c46b33c0bbad6a880792692a1b3/LICENSE
[harpoon-mark]: https://github.com/ThePrimeagen/harpoon/blob/1bc17e3e42ea3c46b33c0bbad6a880792692a1b3/lua/harpoon/mark.lua
[litee-help]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/doc/litee-calltree.txt#L3-L5
[litee-handler]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/lua/litee/calltree/handlers.lua#L84-L107
[litee-buffer]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/lua/litee/calltree/buffer.lua#L37-L43
[litee-autocmd]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/lua/litee/calltree/autocmds.lua#L177-L199
[litee-next]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/lua/litee/calltree/autocmds.lua#L81-L125
[litee-enter]: https://github.com/ldelossa/litee-calltree.nvim/blob/b50c809d136ad479caf761a7f030da98c56c7976/lua/litee/calltree/init.lua#L283-L319
[navigator-license]: https://github.com/ray-x/navigator.lua/blob/48a620e04cfbf8855ce670dd1f980bd680f224cb/LICENSE
[navigator-hierarchy]: https://github.com/ray-x/navigator.lua/blob/48a620e04cfbf8855ce670dd1f980bd680f224cb/lua/navigator/hierarchy.lua#L49-L104
[navigator-fixture]: https://github.com/ray-x/navigator.lua/blob/48a620e04cfbf8855ce670dd1f980bd680f224cb/tests/fixtures/interface.go
[navigator-test]: https://github.com/ray-x/navigator.lua/blob/48a620e04cfbf8855ce670dd1f980bd680f224cb/tests/call_hierarchy_spec.lua
[leap-license]: https://github.com/ggandor/leap.nvim/blob/42005994667fec7c4a318fc8441fe02e1a70186b/LICENSE.md
[archify-focus]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/viewer/focus.js
[archify-sources]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/sources.mjs
[archify-reader]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/reader.js#L599-L650
[atlas-source]: https://github.com/tt-a1i/archify/blob/a0348855a217c7c0098a7d2079f470dc8cfa02b8/archify/modules/code-analysis/overlay/atlas.mjs
[inject-source]: https://github.com/tt-a1i/archify/blob/a0348855a217c7c0098a7d2079f470dc8cfa02b8/archify/modules/code-analysis/overlay/inject.mjs
