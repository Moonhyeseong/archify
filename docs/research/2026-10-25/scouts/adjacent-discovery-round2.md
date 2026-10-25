# 邻近开放发现第二轮：审阅动作的边界比再加一个视图重要

2026-10-25。先对 hub 当时 35 份 scouts、316 个唯一 GitHub owner/repo 排重，沿 task-view、PRLens 与代码理解/审阅/图形阅读线索做开放搜索；未预选编程语言或 parser 类别，不按 star 筛选。第一批实际命中较多 diff/review 工具，因此另与协调 agent 的非 diff 发现交叉筛选，不能把这一批称为整个领域的穷尽调查。

**结论：0 新增实施，也不为了数量新增内容实验。** 深读的三个动作分别是：①关注点与“我已读过”的标记按不同粒度跨修订保留；②对选中源码范围直接查看历史；③在疑似移动代码的配对端点之间跳转。原工具已把它们放进各自的 Git/review 上下文；Archify 已有 pinned source、Task review map、关系引用/定点跳转与已研究的版本绑定阅读状态。尚无自然任务证明要新增共享控件或第二套审阅状态。

本轮只读取官方 GitHub README、固定源码、许可正文及已提交测试/示例；没有运行上游程序、agent、Git mutation、server、安装、浏览器或用户项目，没有发 GitHub 消息、生成产物或 commit/push。本文件是唯一新增报告。上游测试的断言不称为本次运行通过，作者宣传不当收益测量。

## 初筛：先看具体动作，再决定是否值得深读

commit 是本次读取快照，不等于 release。总计10个新来源、其中3项深读；下面7个仅初筛项的来源能力主要由 README 支持；不宣称已检查其所有实现、安全或性能。

| 来源与固定 SHA | 实际许可 / 核对深度 | 原工具解决的动作 | 与 Archify 的剩余差异及去留 |
| --- | --- | --- | --- |
| [vintasoftware/pr-review-canvas](https://github.com/vintasoftware/pr-review-canvas/tree/0c26950e7d3bb2be71478b5c254b57cd64040b05) · `0c26950e7d3bb2be71478b5c254b57cd64040b05` | [Apache-2.0 正文](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/LICENSE)；**深读** carry-marks 实现/测试、ADR0003及固定公开review fixture | 把 PR diff 按主题层组织，保留 attention points、comment 和显式 review marks；跨版本按证据粒度决定什么能跟随。 | 细粒度 claim 可以比全文件 mark 更容易保留，但 Markport/plannotator 已覆盖版本绑定状态；不另造 review server/schema。 |
| [esmuellert/codediff.nvim](https://github.com/esmuellert/codediff.nvim/tree/09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e) · `09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e` | [MIT 正文](https://github.com/esmuellert/codediff.nvim/blob/09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e/LICENSE)；**深读** range history source/fixture | 在正在阅读的行范围上过滤 commit 列表，再进具体版本/diff；不是先离开文件搜索全历史。 | “只看这几行怎么变的”动作很具体，但 Git -L 已提供事实；Archify 没有现场 Git workspace context，不为此增加历史查询器。 |
| [gold-silver-copper/ghtui](https://github.com/gold-silver-copper/ghtui/tree/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5) · `b24ac77d89e2dd76442653c5d3d7a948b9d91eb5` | [MIT](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/LICENSE-MIT) 或 [Apache-2.0](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/LICENSE-APACHE)，Cargo 声明；**由协调 agent 独立深读** | 已配对的疑似 move 两端直接跳转，同时切换 old/new diff side，减少手工找另一端。 | 配对不是语义身份。Archify 原生关系端点/SourceCard 已能定点去来源，无自然 diff 交接任务需要 move engine。 |
| [dlvhdr/diffnav](https://github.com/dlvhdr/diffnav/tree/c8597082e0db0398f252ef224eb585c782a6df33) · `c8597082e0db0398f252ef224eb585c782a6df33` | [MIT 正文](https://github.com/dlvhdr/diffnav/blob/c8597082e0db0398f252ef224eb585c782a6df33/LICENSE.txt)；README/目录初筛 | delta diff pager 外加文件树定位。 | 原工具已解决导航；Archify 已有 outline/index，单做文件树没有额外机制，停止深挖。 |
| [Wilfred/difftastic](https://github.com/Wilfred/difftastic/tree/44fe6642617de7a9baca5a702a3a3057d4c0fea6) · `44fe6642617de7a9baca5a702a3a3057d4c0fea6` | [MIT 正文](https://github.com/Wilfred/difftastic/blob/44fe6642617de7a9baca5a702a3a3057d4c0fea6/LICENSE)，vendored parser 各自许可；README初筛 | 用 syntax 比较并突出格式变化中的实质 token 差异；未知扩展名退到 line-oriented diff。 | README明确不产可应用patch、不做AST merge，且有大变更性能/内存代价；不引入 AST differ，仅“结构化 diff”与 sem/已有图比较研究重复。 |
| [ushironoko/octorus](https://github.com/ushironoko/octorus/tree/15afd59f3937baae39ec0e125f59274557087a8f) · `15afd59f3937baae39ec0e125f59274557087a8f` | [Cargo.toml](https://github.com/ushironoko/octorus/blob/15afd59f3937baae39ec0e125f59274557087a8f/Cargo.toml) 与README声明MIT；根tree未见相应完整LICENSE，**仅声明，复用许可正文未核实**。只初筛 | TUI同处查看PR/local diff/repo/symbols，加可选AI review/fix。 | “无需LSP”的symbol浏览仍依赖另一索引库，完整审阅/fix平台超出Archify；不运行，不复用代码。 |
| [dandavison/delta](https://github.com/dandavison/delta/tree/3c2269c6b845913965575f11b0196d70ef5352f3) · `3c2269c6b845913965575f11b0196d70ef5352f3` | [MIT 正文](https://github.com/dandavison/delta/blob/3c2269c6b845913965575f11b0196d70ef5352f3/LICENSE)；README/固定example目录初筛 | syntax/word高亮、side-by-side、section导航、Git color-moved、去diff marker复制代码。 | 文本pager已有成熟动作，不能把更好看当审阅正确；没有新控件/新parser价值，停止。 |
| [Tyr9102/project-map](https://github.com/Tyr9102/project-map/tree/9d72624f3e4016a389d7b7d08fdbfdfdb099b5a1) · `9d72624f3e4016a389d7b7d08fdbfdfdb099b5a1` | [MIT正文](https://github.com/Tyr9102/project-map/blob/9d72624f3e4016a389d7b7d08fdbfdfdb099b5a1/LICENSE)；协调 agent 只初筛README/许可，未核实现 | README描述在项目tile上写note、成批Send给Claude以更新图。 | tile上就地提问动作可辨，但“发给session/唤醒agent”是执行桥接而非普通阅读；与task-view/decision-thread/已有批注版本范围相邻，不运行watcher，不建议新增桥接。 |
| [cosmtrek/mindwalk](https://github.com/cosmtrek/mindwalk/tree/77cd79596a1b7f9f62256ea06485e15182a09566) · `77cd79596a1b7f9f62256ea06485e15182a09566` | [MIT正文](https://github.com/cosmtrek/mindwalk/blob/77cd79596a1b7f9f62256ea06485e15182a09566/LICENSE)；协调 agent 只初筛README/许可 | README描述session记录转3D代码图，选visit-row改变playhead。 | 可观察的文件触达不等于agent注意力或理解程度。已有Agent trace/source map来源，不读用户私session、不增加3D或第二trace player。 |
| [protheuslabs/Lensmap](https://github.com/protheuslabs/Lensmap/tree/1f87755121ceb3865f7ff6c110d37262979ba0ad) · `1f87755121ceb3865f7ff6c110d37262979ba0ad` | [MIT正文](https://github.com/protheuslabs/Lensmap/blob/1f87755121ceb3865f7ff6c110d37262979ba0ad/LICENSE)；协调 agent 只初筛README/许可 | README描述source anchor ID、AST fingerprint、span、fuzzy fallback和sidecar notes。 | README的 canonical implementation stack (target) 是计划并指本机路径，不能当已实现证据。即使实现，锚点方向与既有plannotator/blob/version研究重复，不再deep。 |

这三个非diff来源由协调 agent 提供独立初筛快照；没有把它们的README提案、演示或本机路径当成可执行产品/已验证机制。筛选保留了不进入深读的理由，避免报告只因搜索结果偏向diff工具而遗漏图上批注和session阅读这类相邻方向。

## 深读一：同一文件里的关注点可沿用，不代表整文件仍“已审阅”

Canvas 的 [ADR0003](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/docs/adr/0003-carry-attention-points-by-their-lines.md) 区分一个容易混淆的 claim：attention point 只说几行的事，而 file reviewed mark 声称读过整份 patch。文件别处变了时，不必每次让生成器重新判断原本不变的点；但它不能因此继续显示整个文件已读。

该 ADR 的条件很具体：point自己的每一行文本以及 diff row role（新增/删除/context）都不变，且块作为整体移动，才可沿用 point 原话。new-side point 用 head side、old-side point 用 merge-base side比较。重复文本存在多种配对时，用最短编辑脚本选择的确定路径；这不是唯一语义身份的保证。缺旧版本或改动超过 MAX_LINE_EDITS 就回到重新判断；fold/annotation 仍按整个文件条件保留。

[carry-marks.ts](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/src/review/carry-marks.ts) 对 reviewed mark 用更强条件：

| 标记承载的 claim | 代码中的继承条件 | 不可转述为 |
| --- | --- | --- |
| 文件已读 | 同 layer key 中仍有相同 path，patch byte-identical | 这几个关键信息没变，所以整个文件已验收 |
| 整层已读 | 文件集合相同，且每个文件都 unchanged | 层标题没变，所以原review有效 |
| 跨canvas标记 | 可沿 basis lineage 找回 reviewer原canvas，当前/原diff可读，merge-base身份满足条件 | 新canvas作者/AI把上一轮已读标记发布给所有人 |

[carry-marks.test.ts](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/src/review/carry-marks.test.ts) 是实际公开synthetic测试：把 src/app.ts 的新增行 y=2 改为y=3后，只保留未变 app.test.ts 的mark；layer新增文件、改key、丢basis、同head换merge base等都有拒绝继承断言。这里是测试期望，本轮没跑Vitest，更没代表人类点过review。

[carry-over.test.ts](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/src/review/carry-over.test.ts) 进一步区分相同diff和移动hunk；两个空changeset不能因为“都没东西”就声称已匹配。文档可沿用与review mark可沿用并不是同一个状态问题。公开 [pr-278/review.json](https://github.com/vintasoftware/pr-review-canvas/blob/0c26950e7d3bb2be71478b5c254b57cd64040b05/__fixtures__/pr-278/review.json) 有真实PR来源URL、head/merge-base、42个文件及hunk定位，是可核对输入；其中PR body的测试和人类checklist是原作者声明，本文不采信为独立验收，也不将demo当当前PR状态。

**对Archify的增量判断：不实施。** `prlens-smalltools.md` 已推荐Markport revision变化清除已读，plannotator anchors已带blob/version，本轮不是首次发现版本绑定状态。Canvas的特别之处是“不同claim粒度，用不同继承门槛”，可作为未来已有审阅页的设计约束；但 task-review-map 目前不是协作review状态平台，没有理由为了精细carry-over先添加持久化marks和完整diff lineage。

## 深读二：对正在看的行范围查看历史，而不伪称找到了原因

CodeDiff 的 [history.lua](https://github.com/esmuellert/codediff.nvim/blob/09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e/lua/codediff/core/git/history.lua) 在有path+line_range时构造 Git log -L；普通单文件历史才用 --numstat/--follow，两套参数不能混用。返回commit hash、subject、source path以及按patch计的插入删除，界面继续在当前选区范围内导航。

[history_lines_spec.lua](https://github.com/esmuellert/codediff.nvim/blob/09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e/tests/integration/core/git/history_lines_spec.lua) 创建四个synthetic commit：初始文件、改foo、改bar、改header。固定range4–6只预期初始与改foo两项，不带line_range时预期全部四项；对bar/header分别有自己的两项预期。这是实际提交的测试fixture，不是本轮新造仓库或运行Git所得结果。

[command handler](https://github.com/esmuellert/codediff.nvim/blob/09d9ebef2cc5a5c04db7a349cd6c61bdf84ecc8e/lua/codediff/commands/handlers/history.lua) 默认no_merges=true，没有显式range时limit100。因而“未列出”可能只是范围/merge/数量限制；不是完整历史不存在。Git的行追踪也不保证跨文件语义移动、重写后符号身份或作者真实意图。Commit subject是作者文字，不等于已经证明为什么改、改得对还是运行影响。

**对Archify的增量判断：不实施。** 这个就地小动作比“一张更大的repo map”明确，但原工具已解决。SourceCard的固定revision使离线页能引用原文，不意味着它拥有目标仓库全部Git对象与历史。增加跨revision查询、line tracking、rename与history scope会扩大输入合同；现有Git客户端可以完成事实查询，Agent可把已确认的少量历史用现有Timeline/Explainer说明，不值得复制Git history UI。

## 深读三：已经配对的移动片段两端直接跳转

该项由协调 agent 独立只读核对固定 ghtui revision，本 agent未重复展开源码。其 [moves.rs](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/diff/moves.rs#L1-L17) / [L37–109](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/diff/moves.rs#L37-L109) 做 trim 后连续文本匹配，至少3行、30字符，greedy longest并避免重复占用added片段。[L119–150测试](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/diff/moves.rs#L119-L150) 有跨文件/重缩进/忽略trivial等synthetic输入。

[diff_screen.rs L880–901](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/diff_screen.rs#L880-L901) 的 JumpMove 根据配对mv/from到另一端，切Old/New side；在moved row按Enter也走同动作。可读的价值是“已有对应端就直接去”，不是把检测出的move宣称纯搬迁、语义相同或无需review。[检测时机测试](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/state/tests/diff/better.rs#L3-L41) 与 [stale job隔离测试](https://github.com/gold-silver-copper/ghtui/blob/b24ac77d89e2dd76442653c5d3d7a948b9d91eb5/src/state/tests/diff/better.rs#L43-L75) 分别检查全部file完成后detect与过期job处理；这不构成大仓性能或交互验收。

**对Archify的增量判断：不实施。** 原生关系引用已有方向、source链接已有固定位置，source-question-tour可连同一个问题的多个片段。若已有真实Git diff要找移动两端，ghtui本身已能做；没有自然输入显示Archify需要第二个move matcher。前轮relation-return也证明新增按钮即使正确，仍可能只重复现有一步动作。本轮不重做move engine、Git review客户端或新的History状态。

## Value / Cost / Impact 与停止条件

**Value：** 三个小动作都比“再加图/再加AI总结”具体；最值得保留的机制是claim粒度与继承证据对应、历史查询显式保留scope、配对端点直接跳而不推语义同一。这些是审阅约定，不是已测收益。task-view式diff引用匹配只能证明引用存在，不能证明解释正确、遗漏为零或人类接受。

**Cost：** 与现有Git/review上下文集成的原工具可以复用repo对象、old/new side、diff rows与reviewer本地状态。Archify若独立引入它们，必须新增clone/fetch/版本identity、merge-base/lineage、查询scope、持久化/失效和diff matching维护责任；不是几个按钮的成本。没有依据为低成本名义先搭平台。

**Impact：** 本轮不改产品/公共schema/Viewer/Skill/安装，不把未验证许可代码复制进项目。既有Explainer、SourceCard、Task review map、Delta与关系定点跳转保持现状；任何未来行为变更仍要以自然任务和当前实现缺口重新划定范围。

可执行的后续不是自动再派新实现：只有实际审阅中出现“已有定位却找不到对应端”“已读claim因更新继承错误”“全历史掩盖正在读的范围”等具体问题，并证明原工具/当前Archify入口不能直接解决，才继续。当前三个方向都缺这份实证，结论为0实施；没有浏览器截图、用户效率、真实屏幕阅读器或人类接受证据。
