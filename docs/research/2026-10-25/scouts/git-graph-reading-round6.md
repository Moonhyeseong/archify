# Git 图阅读第六轮：parent、彩线与拐点分别代表什么

2026-10-25。只读研究，未运行上游程序/测试、Git 历史修改、编译器或浏览器；未安装工具、读取用户仓库或改产品。**保留一个低成本内容候选，不建议新 Git 平台或通用适配器**：用完整公开三提交 fixture 解释“图里有弯折/分叉，为什么只有三个 commit；哪一个节点才是 merge”。候选只需要既有 Architecture + Explainer/SourceCards，是否实施由维护者按阅读价值决定。

## 查重与范围

读取 hub 索引，并对本轮开始时全部 **44份 scouts** 的仓库引用去重。既有 Gource、git-of-theseus、git-sizer、Code Maat cochange、Architecture snapshot/Git-ref compare 不重新计入。本轮六来源均未出现在引用索引；`regebro/git-dag`、`gitgraphjs/gitgraph.js` 猜测入口直连不可用，未拿名称凑数。比较基线固定为 Archify dev [`67f12389212c54b3122da60e2813c7f8dab7ab2f`][archify]。

不把“有图”当价值：关注提交的有序 parents、引用标签、绘图 lane 和中间拐点是否被读者混淆。上游 fixture 是已提交教学/测试材料，**不是本次 Git 命令执行结果、真实用户项目历史或生产效果证据**。

## 六个新来源

| 官方项目 / 固定 revision | 许可与已核实现 | 真实可读输入/输出与取舍 |
| --- | --- | --- |
| [git2graph][g2g] `208395f28f8d1b74dc35bf8ffc4598cf93e9a962` | [完整 MIT][g2g-license]；[git2graph.go][g2g-core] 保存 parents 顺序，生成 column/color/parentPaths；[renderer][g2g-renderer] 分开画 path 与 commit circle | [完整 test_003.json][g2g-fixture] + [Test3 布局 oracle][g2g-test]，适合最小内容候选。输入 id 是教学 `1/2/3`，不是 commit hash；不能宣称实际仓库 merge/rebase已采集 |
| [visigit][visigit] `b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9` | [GPLv3 许可文本][visigit-license]；[builder.py L151–228][visigit-builder] 可折叠 first-parent 链，保留 all-parent edges | 完整 [complex_normal.dot][visigit-fixture] 与 [complex_branch.dot][visigit-branch] 是已提交 golden；normal 图的一个显示节点可概括多个提交。只研究，不复制 GPL 实现，不建立 DOT importer |
| [git-graph][gitgraph] `aff556afb1272f12828eb66f47d3ec17c10416e5` | [MIT][gitgraph-license]；[branch_assignment 文档][gitgraph-assignment] 与 [SVG renderer][gitgraph-svg] | 明确按可配置 persistence/first-parent 给 commit 分配显示 branch，再做列调度；这不是 Git commit 自带的唯一 branch 身份。未找到独立完整数据 fixture，不以 README 图片冒充 oracle；拒绝移植分支布局策略 |
| [visualizing-git][school] `f9298612c2236f52d801d11c760e177c21ce1b29` | [MIT][school-license]；[demos.js][school-data] 是已提交 commitData，[historyview.js][school-core] 用 parent/parent2 排图，[controlbox][school-control] 处理模拟命令 | 教学状态与 parent/parent2 可静态复核；只表达该模拟器模型，不是真实 Git 完整语义，尤其不能因最多两个字段而限制 Git 合并父数。已有 simulator 足够，不在 Archify 再建交互 Git 沙箱 |
| [git-sim][sim] `1ac6d1ff09522977ced8a2a9f47befbc373f3ee0` | [GPLv2 许可文本][sim-license]；[rebase.py][sim-rebase] 区分新提交的 parent 与重放源的 origin 线 | [merge-no-ff.json][sim-fixture]、[rebase.json][sim-rebase-fixture] 是完整已提交验证 golden，含 before/after/phase/step/refs。`origin` 线不是 parent；不把模拟截图称真实执行历史。不复制源码、引入 Python 渲染栈或运行其操作 |
| [VS Code Git Graph][vscode] `d7f43f429a9e024e896bac9fc65fdc530935c812` | [当前 LICENSE][vscode-license] **限制衍生作品发布/分发/再许可/出售**，不是通用 MIT；[dataSource][vscode-data] 读取 `%H/%P`，[graph.ts][vscode-graph] 把 parents 变成排线路径/颜色 | [dataSource.test.ts][vscode-test] 有已提交命令输出 mock；还可生成“未提交变化”虚拟行，不全是 Git commit。仅负面/机制对照，不建议复用代码或以开源许可泛称之 |

## 深读一：git2graph 的三提交、三父边、两个额外绘图角

完整输入 [test_003.json][g2g-fixture] 为104 bytes，SHA256 **`cc450203c084de3a16b1d67db986c7198e4dc51320cdbdd6e6f464f48a02aebd`**：

```json
[
  {"id":"1","parents":["3","2"]},
  {"id":"2","parents":["3"]},
  {"id":"3","parents":[]}
]
```

逐项核到 [Test3 L203–235][g2g-test] 的预期，未执行测试：

| 语义事实 | 上游布局预期 | 能/不能从画面读出什么 |
| --- | --- | --- |
| 1 的第一父是3，第二父是2 | 输入 row0/1/2、column0/1/0；1→3 点 `(0,0,0),(0,2,0)`，色0 | 第一父次序来自 JSON，不能按左右位置猜 |
| 1→2 是第二父边 | `(0,0,0),(1,0,2),(1,1,0)`，色1 | 中间 `(1,0,2)` 是路由角，不是第四个 commit |
| 2→3 是另一父边 | `(1,1,0),(1,2,1),(0,2,0)`，色1 | 中间 `(1,2,1)` 同样不是 commit；同色不等于同命名分支 |
| 3 在此完整 fixture 中无父 | 无 parent path | 不能把一般分页/浅克隆视图的边缘端点都当真实根 |

[src L724–731][g2g-parents] 按输入 parents 顺序存储；[L805–855][g2g-process] 给第一父排线优先，并为其他父产生 Fork 等路由点。Pipe/MergeBack/Fork/MergeTo 是**绘图路径类型**，不是四种 Git 对象。因为此图由新向旧读，真实 merge commit 1 的两条父边会向下“分出去”；视觉分叉并不证明在那里创建了 branch。

[renderer L94–123][g2g-renderer] 每个 parentPath 画 path，节点圆点另由输入 tree 条目生成；路径没有箭头，必须补 child→parent 阅读约定。[颜色管理 L105–128][g2g-colors] 释放后可再次使用颜色；[Test28][g2g-color-test] 两段合并结构重复用色1。颜色是资源，不是命名 branch 或作者/所有权事实。输入顺序影响 row，也没有时间戳字段；纵向间隔不可读成耗时。

[Git 官方 commit-tree 文档][git-parents]（v2.51.0 固定 `c44beea485f0f2feaf460e2ac87fdd5608d63cf0`）说明 parent 数可为任意数量；0父为根，1父普通提交，多父为 merge。该 fixture 恰有两父，不代表 Git 只允许两父，也不证明上游该布局实现覆盖 octopus。不存在分支名字段时，不补造“main/feature”。

## 深读二：visigit 的线条可能跨越被隐藏的提交

[builder.py L159–205][visigit-builder] 的 normal 模式沿 first-parent 链行走，同时递归非第一父并输出所有 parent 边；[L354–359][visigit-boring] 只有1父、1子、0ref才允许折叠。`_emit_boring_run` 将多项概括为一个节点，标签 `last (N) first`；接到链外下一节点的边仍显示 `parent`。所以它的**显示边可概括一条链**，不必是当前显示 id 对象中的直接 parent。这是读者必须知道的压缩，不是原始 DAG。

完整 [complex_normal.dot][visigit-fixture]（5001 bytes，SHA256 `a2f65a64dcc1fcbf09fd706a37ff4fefd1cbc4ae8498edd13a771bc4cde54c6b`）包含 `b8e06 (2) 34f57` 聚合标签及 merge `de59f…` 的两条父线；不能把聚合标签中的2理解成同一对象计数或两父。完整 branch-mode [golden][visigit-branch]（2492 bytes，SHA256 `642ad5fbd7f80c01f2bc9d2a6f0a321d55654af69ffc9405976eabe9b1ce8677`）提供不同压缩/展示视图；这两份都是输出 oracle，**不是完整原始 commit 对象集合**，不从 DOT 反推丢失提交。

同一 [builder L109–149][visigit-refs] 还区分 HEAD→branch ref、branch ref→commit、annotated tag ref→tag object→commit。这些边与 commit→parent 不是同一种关系；彩线若不标边类型会误导。对浅边界，测试也记录 parents 可能为空；不能不加输入边界地说“空 parents 一定证明完整历史根”。本轮不消费 raw Git 或复制 GPL 实现；仅借鉴显示压缩和边类型必须就地说明这一要求。

## 变基/合并图中的其他防误读规则

- git-sim 的 [merge-no-ff golden][sim-fixture] 新 merge 项明确有两父，`phase=after`/`step=1` 是模拟记录，不是父边或时间。[rebase.py][sim-rebase] `setup_and_draw_parent` 后另画 `kind="origin"` 连重放源；**重放对应线不等于 parent**，不能画成“旧对象移动后仍同一 commit”。golden 按消息名作 key，不是完整 Git 对象格式；不能把它用来证明 hash/patch 等价或真实冲突是否发生。
- git-graph 把 commit 归到一条显示分支，是其 persistence/first-parent/列调度策略。一个 commit 可从多个 refs 可达，界面中的 lane 分配不应作为唯一历史分支归属证据。
- 图的几何交叉/汇合不能代替 parents；只有共同的 commit 端点和输入父关系列表才说明此处共享对象/merge。分页未载入祖先、折叠链和无 parent 真实根需分开；普通图中的 parent 边还要与 ref、tag、工作树虚拟行、rewrite 对应线分开。

## Archify 能力和现有 PR 的重复边界

比较固定 dev67f 的 schemas/renderers/Delta；PR 信息是本轮 GitHub只读快照，**OPEN不等于已合入**，以下是 scope 判断，不声称本轮执行或验证这些PR。

| 已有能力/工作 | 范围 | 本轮剩余价值与限制 |
| --- | --- | --- |
| [Architecture schema][architecture-schema] | components + connections，可手写多父有向关系，坐标只是布局 | 足够画3commit/3parent，边写第一父/第二父，颜色保持中性；不需新Git图类型 |
| [Timeline schema][timeline-schema] | lanes/events及事件时间表达 | 本fixture无timestamp；不可捏造时间轴，也不因row顺序叫真实时间线 |
| [Tree schema][tree-schema] | 节点单个parent层级 | Git共享祖先/多父不是单父树；不能复制同commit当多个真实对象。此候选优先Architecture |
| [Architecture Delta][delta] | 比较两个Architecture快照 | before/after模型差异不是Git父关系或rebase对应关系；本轮不扩Delta |
| [#1049][pr1049] `7184b99b01768349840f93b4de83ff206d202c33` | 从两个Git refs读同一已提交Architecture快照，复用Delta | refs在这里定位两份输入，不提供commit DAG；不重做Git-ref compare |
| [#367][pr367] `cc1b33a7a02351347842dad4ebe9c13278afc166` | ownership sidecar/locate Git change range/drilldown bundle | 路径归属分类和子图导航不回答parent vs routing点；不新增ownership或Git操作 |
| [#1102][pr1102] `98efbfcb625b1ecfa813e131c52370b9c2dc83e6` | 维护批次含node explanation/drilldown/compare整合 | 复用已有来源/解释能力，不另造面板；不是merge/rebase模拟器 |
| [#1103][pr1103] `f0be206acbc90eb7c6c6b636030e3eb28963d284` | Atlas module/file/function依赖/findings→Classic证据 | repository代码图不等于commit DAG；不把历史任务改成另一个Atlas |

## 与既有 graph-exchange / layout-reading 的差异

[graph-exchange](graph-exchange-smalltools.md) 已区分关系条数、身份、类型，并建议原文+局部图+逐边证据表；因此“保留原数据/原始edge、不要把路径反解成关系”不是本轮新方法。[layout-reading](layout-reading-smalltools.md) 已要求保留语义边及作者几何，讨论label与routing/平行边分离；本轮也不重新提出routing框架。

剩余的**具体内容问题**是Git特有的有序parents与反向阅读：在一个完整三提交oracle中，真实两父merge从新向旧看恰好分叉，第二父路径的Fork/折角不是branch创建或新commit；输入甚至没有branch名字。既有两报告没有这个parents列表、first/second-parent次序及对应oracle。它是新的可核内容切口，**不是已证实的新交互/导入需求**。若只剩“语义与几何不同”的泛化说明，现有两报告已经足够，应拒绝实施；此处能保留的增量限于三项输入与具体预期一一对照，无用户失败或效果数据。

## 唯一候选：哪些点是提交，哪条线是父关系

**具体阅读问题**：“上游三节点图里两条彩线出现拐点，节点1向下分叉；它是branch创建、合并，还是纯排线？”此问题不涉及cochange、架构演化或两个ref的结构diff，也不依赖当前PR尚未交付的新交互。

最低成本是**手写内容**：保留完整104B MIT输入及原始SHA/许可，再引用Test3相关完整源文件或明确摘录范围。一个Architecture spec显示1/2/3三个提交和三条child→parent关系；正文表将第一父/第二父与上游routing点逐项对应。解释页只复用该同一spec，避免两套节点ID。**绝不把两个routing点建成Archify语义节点来凑图；routepoints只在来源oracle表中逐项列出。** Archify图按已核parents手工编写，不重现或验证git2graph算法的排线，也不把Archify自动布局称上游算法实跑。1/2/3标“上游教学ID，非Git hash”；无branch refs、时间或patch数据写未提供。不要实现Go/JSON通用reader、取Git历史、克隆/运行仓库或layout engine。

相对于既有报告的内容增量仅是**同一个完整输入的有序parents事实与上游路径坐标可以逐项对照**，不是“再画Git”。验收应让读者明确回答：commit数3、父边数3、1为两父merge、3有两个直接child、两个中间拐点非提交、色1不证明命名branch。若原有Explainer的一张表已足够，不必新增图/功能；没有实际用户效果数据时不声称省时或降低错误率。

若获授权，render/finalize验证同一spec及JSON/source摘要，root真实截图首屏与来源卡；不把静态gate叫浏览器验收。**当前只有研究与公开oracle核对，没有Archify新产物、截图或上游实跑。** 不推荐rebase模拟内容作为首项：它需要before/after对象及origin/parent双语义，教学模拟记录不适合冒充真实操作结果，成本和误导风险更高。

## 证据范围

只新增本报告；研究材料在checkout外临时目录。git2graph和visigit深入到实现/完整fixture/oracle；其余来源按表列路径做有界静态核查。GitX等大型GUI不扩入本轮。所有“expected/golden”均属于上游提交，不代表本机复现通过。原fixture摘要、许可和当前PR head都按实际读取记录，不改旧scout或既有实验的固定证据。

[g2g]: https://github.com/alaingilbert/git2graph/tree/208395f28f8d1b74dc35bf8ffc4598cf93e9a962
[visigit]: https://github.com/rcronk/visigit/tree/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9
[gitgraph]: https://github.com/mlange-42/git-graph/tree/aff556afb1272f12828eb66f47d3ec17c10416e5
[school]: https://github.com/git-school/visualizing-git/tree/f9298612c2236f52d801d11c760e177c21ce1b29
[sim]: https://github.com/initialcommit-com/git-sim/tree/1ac6d1ff09522977ced8a2a9f47befbc373f3ee0
[vscode]: https://github.com/MHutchie/vscode-git-graph/tree/d7f43f429a9e024e896bac9fc65fdc530935c812
[g2g-license]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/LICENSE-MIT
[g2g-core]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph.go
[g2g-fixture]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/data/test_003.json
[g2g-test]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph_test.go#L203-L235
[g2g-renderer]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/tools/renderer/index.html#L94-L123
[g2g-parents]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph.go#L724-L731
[g2g-process]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph.go#L805-L855
[g2g-colors]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph.go#L105-L128
[g2g-color-test]: https://github.com/alaingilbert/git2graph/blob/208395f28f8d1b74dc35bf8ffc4598cf93e9a962/git2graph/git2graph_test.go#L1582-L1625
[visigit-license]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/LICENSE
[visigit-builder]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/visigit/builder.py#L151-L228
[visigit-fixture]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/tests/golden/complex_normal.dot
[visigit-branch]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/tests/golden/complex_branch.dot
[visigit-boring]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/visigit/builder.py#L354-L359
[visigit-refs]: https://github.com/rcronk/visigit/blob/b21ee74f0acf8c0f1003fdd31aa8acecff6f40d9/visigit/builder.py#L109-L149
[gitgraph-license]: https://github.com/mlange-42/git-graph/blob/aff556afb1272f12828eb66f47d3ec17c10416e5/LICENSE
[gitgraph-assignment]: https://github.com/mlange-42/git-graph/blob/aff556afb1272f12828eb66f47d3ec17c10416e5/docs/branch_assignment.md
[gitgraph-svg]: https://github.com/mlange-42/git-graph/blob/aff556afb1272f12828eb66f47d3ec17c10416e5/src/print/svg.rs
[school-license]: https://github.com/git-school/visualizing-git/blob/f9298612c2236f52d801d11c760e177c21ce1b29/LICENSE.md
[school-data]: https://github.com/git-school/visualizing-git/blob/f9298612c2236f52d801d11c760e177c21ce1b29/js/demos.js
[school-core]: https://github.com/git-school/visualizing-git/blob/f9298612c2236f52d801d11c760e177c21ce1b29/js/historyview.js
[school-control]: https://github.com/git-school/visualizing-git/blob/f9298612c2236f52d801d11c760e177c21ce1b29/js/controlbox.js
[sim-license]: https://github.com/initialcommit-com/git-sim/blob/1ac6d1ff09522977ced8a2a9f47befbc373f3ee0/LICENSE
[sim-rebase]: https://github.com/initialcommit-com/git-sim/blob/1ac6d1ff09522977ced8a2a9f47befbc373f3ee0/src/git_sim/rebase.py
[sim-fixture]: https://github.com/initialcommit-com/git-sim/blob/1ac6d1ff09522977ced8a2a9f47befbc373f3ee0/tests/validation/golden/merge-no-ff.json
[sim-rebase-fixture]: https://github.com/initialcommit-com/git-sim/blob/1ac6d1ff09522977ced8a2a9f47befbc373f3ee0/tests/validation/golden/rebase.json
[vscode-license]: https://github.com/MHutchie/vscode-git-graph/blob/d7f43f429a9e024e896bac9fc65fdc530935c812/LICENSE
[vscode-data]: https://github.com/MHutchie/vscode-git-graph/blob/d7f43f429a9e024e896bac9fc65fdc530935c812/src/dataSource.ts
[vscode-graph]: https://github.com/MHutchie/vscode-git-graph/blob/d7f43f429a9e024e896bac9fc65fdc530935c812/web/graph.ts
[vscode-test]: https://github.com/MHutchie/vscode-git-graph/blob/d7f43f429a9e024e896bac9fc65fdc530935c812/tests/dataSource.test.ts
[archify]: https://github.com/tt-a1i/archify/tree/67f12389212c54b3122da60e2813c7f8dab7ab2f
[architecture-schema]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/schemas/architecture.schema.json
[timeline-schema]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/schemas/timeline.schema.json
[tree-schema]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/schemas/tree.schema.json
[delta]: https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/delta/architecture-delta.mjs
[pr1049]: https://github.com/tt-a1i/archify/pull/1049
[pr367]: https://github.com/tt-a1i/archify/pull/367
[pr1102]: https://github.com/tt-a1i/archify/pull/1102
[pr1103]: https://github.com/tt-a1i/archify/pull/1103
[git-parents]: https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/Documentation/git-commit-tree.adoc#L30-L33
