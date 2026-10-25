# 邻近开放发现第三轮：先作判断，再看分叉证据

2026-10-25。开始时读取 hub 全部 36 份 scout 的结论与来源，按 326 个唯一 GitHub owner/repo 去重。不是只按 notebook/trace/diff 等关键词排除：同样处理代码的工具，如果阅读动作不同，仍进入初筛。不以 stars 设门槛或排序。此次将图上渐进叙事、表达式值、源码局部信息流与可携带文档同时比较；下面区分 README 初筛、选定源码核实和固定输入。

**唯一保留的条件候选是一个现有能力即可制作的内容对照：让读者先判断一个有源码依据的局部分叉，再跳到证据揭晓。** 它不是给全页加考试、不隐藏顶层结论、不以答对作为理解/验收指标，也不要求 quiz schema 或新运行时。CodeSee 的“选答案后揭示”比普通下一步多了一个明确的思考动作；Archify 已有 Walk/SourceCard，因此先做可跳过的内容对照最便宜。

本报告只新增此文件。没有执行上游、compiler、Python、Rust、agent、server、watcher、安装或浏览器，没有读取私有代码/运行日志/数据库，没有发消息到外部服务、生成截图或 commit/push。固定 fixture 是公开已提交输入，不是本轮运行结果；作者的产品叙事不升级为实际效果。

## 产品比较基线与当前工作重叠

本轮不能继续用早先 82c7e0f0 作为当前 dev。协调 agent 已刷新并读取新 dev [`3f95f0349c8276db71509ca239461b6fe9d00f9f`](https://github.com/tt-a1i/archify/tree/3f95f0349c8276db71509ca239461b6fe9d00f9f)：Explainer [reader.js](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/explainer/reader.js) 的 Walk 直接显示选定步骤，现有 [schema](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/schemas/explainer.schema.json) 没有 quiz/prediction 判分状态。协调 agent 进一步核实 [render.mjs L76](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/explainer/render.mjs#L76) 会写出所有steps/detail，[reader.css L186–188](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/explainer/reader.css#L186-L188) 只淡化非当前步；Walk不是隐藏/揭晓。现有details用于diagram semantics，也不是通用Q/A控件。这里缺少quiz状态不等于必须加它。

2026-10-25 15:43（台北）的窄 GitHub 查询：开放 quiz 为0；predict只命中不相关 #618/#522。walkthrough是宽词，命中94项，不能由此宣称全面无重叠。独立读取 [#1015](https://github.com/tt-a1i/archify/pull/1015) 当前仍 open、head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`，其源码 focus/source card/展开复制要避让。已知 [#1045](https://github.com/tt-a1i/archify/issues/1045) 当前 closed，内容是原生 Story playback/video proposal，不能写成仍开放的quiz工作；也不能仅由issue关闭推出所有部署或人类验收。

已有 source-question-tour 问题组织、Journey/Walk 和 Story 解决叙事次序；Finder/Reach/Focus 解决既有图上的局部定位。新候选只针对“在看答案前，主动判断一处fork”的内容节奏。不会再做源码图平台、Python debugger、运行记录采集器或通用图播放器。

## 初筛来源

所有固定 SHA 为本轮读取快照，不等于 release。Birdseye 选定实现/测试由本 agent 深读，CodeSee 由协调 agent 独立深读；其余只初筛 README/许可，能力保留“作者描述”限定，不声称已证明其实现或准确性。

共 **10 个新来源、2 个深读**。许可列来自同一固定revision的实际文件正文；许可不代表README能力已核实。

| 来源 / 固定 revision | 实际许可 | 深度与结论 |
|---|---|---|
| [Kaka-cheaper/codeSee · `b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07`](https://github.com/Kaka-cheaper/codeSee/tree/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07) | [MIT](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/LICENSE) | 深读：选择→揭示的tour状态与已提交demo；唯一内容候选，见下。 [README](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/README.md) |
| [alexmojaki/birdseye · `753f6648db380c808534089ead648409dd94abc2`](https://github.com/alexmojaki/birdseye/tree/753f6648db380c808534089ead648409dd94abc2) | [MIT](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/LICENSE.txt) | 深读：固定表达式选择，切换保留的loop迭代值；不引运行采集。 [README](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/README.md) |
| [alexmojaki/heartrate · `e6cab2c5123bde194d5de2654b2f39938fd2be13`](https://github.com/alexmojaki/heartrate/tree/e6cab2c5123bde194d5de2654b2f39938fd2be13) | [MIT](https://github.com/alexmojaki/heartrate/blob/e6cab2c5123bde194d5de2654b2f39938fd2be13/LICENSE) | 初筛：作者描述逐行命中、最近命中与当前stack；thread/file范围有限，不是耗时profile或全进程完整记录。已有trace/profile相邻。 [README](https://github.com/alexmojaki/heartrate/blob/e6cab2c5123bde194d5de2654b2f39938fd2be13/README.md) |
| [willcrichton/flowistry · `693ceda925bd1d39d8de413ce239cfa6a87bb665`](https://github.com/willcrichton/flowistry/tree/693ceda925bd1d39d8de413ce239cfa6a87bb665) | [MIT](https://github.com/willcrichton/flowistry/blob/693ceda925bd1d39d8de413ce239cfa6a87bb665/LICENSE) | 初筛：作者描述选表达式后双向静态信息流focus；明确interior mutability、overapproximation与nested函数边界。不等于运行影响；compiler插件成本高。 [README](https://github.com/willcrichton/flowistry/blob/693ceda925bd1d39d8de413ce239cfa6a87bb665/README.md) |
| [codetheorist/understand-anything · `fe8c5bc591716aafd79b4765549328f08ef5a52e`](https://github.com/codetheorist/understand-anything/tree/fe8c5bc591716aafd79b4765549328f08ef5a52e) | [MIT](https://github.com/codetheorist/understand-anything/blob/fe8c5bc591716aafd79b4765549328f08ef5a52e/LICENSE) | 初筛：作者描述全库结构图/guided tour pipeline。与已有源码问题导览相邻，完整平台不引入。 [README](https://github.com/codetheorist/understand-anything/blob/fe8c5bc591716aafd79b4765549328f08ef5a52e/README.md) |
| [Plaintext-Gmbh/projectmind · `713d325dfed4cd4e38c04872392ebaa065863133`](https://github.com/Plaintext-Gmbh/projectmind/tree/713d325dfed4cd4e38c04872392ebaa065863133) | [MPL-2.0](https://github.com/Plaintext-Gmbh/projectmind/blob/713d325dfed4cd4e38c04872392ebaa065863133/LICENSE) | 初筛：作者描述architecture browser、quiz、presentation/PDF、MCP与desktop；16种图与性能叙述未经本轮验证。未找到比选定候选更小的新增动作。 [README](https://github.com/Plaintext-Gmbh/projectmind/blob/713d325dfed4cd4e38c04872392ebaa065863133/README.md) |
| [bushans/okfgen · `96d8883549d87c034fb3c11bb2d1da59135dfa65`](https://github.com/bushans/okfgen/tree/96d8883549d87c034fb3c11bb2d1da59135dfa65) | [Apache-2.0](https://github.com/bushans/okfgen/blob/96d8883549d87c034fb3c11bb2d1da59135dfa65/LICENSE) | 初筛：作者描述多源bundle到single-HTML graph；与exchange/provenance已有工作相邻，不以README当离线/保真验证。 [README](https://github.com/bushans/okfgen/blob/96d8883549d87c034fb3c11bb2d1da59135dfa65/README.md) |
| [UpayanGhosh/tldr-skill · `f6d5d3662c8e9bea9b9522f615db42f0585c3058`](https://github.com/UpayanGhosh/tldr-skill/tree/f6d5d3662c8e9bea9b9522f615db42f0585c3058) | [Apache-2.0（仅repo-tour包）](https://github.com/UpayanGhosh/tldr-skill/blob/f6d5d3662c8e9bea9b9522f615db42f0585c3058/repo-tour/LICENSE.txt) | 初筛：模块/flow/graph文档与source-question/outline相邻。根无LICENSE，不能把子包许可泛化全库；optional CDN声明不是离线证明。 [README](https://github.com/UpayanGhosh/tldr-skill/blob/f6d5d3662c8e9bea9b9522f615db42f0585c3058/README.md) |
| [tt-a1i/lore · `41ff4684bca4ad56632f0fec2e6ff6612daeb909`](https://github.com/tt-a1i/lore/tree/41ff4684bca4ad56632f0fec2e6ff6612daeb909) | [Apache-2.0](https://github.com/tt-a1i/lore/blob/41ff4684bca4ad56632f0fec2e6ff6612daeb909/LICENSE) | 初筛：作者描述git line→attributed session/why与决策替换；作者评估不是独立结果。与decision-thread/lineage相邻，不读取私有session。 [README](https://github.com/tt-a1i/lore/blob/41ff4684bca4ad56632f0fec2e6ff6612daeb909/README.md) |
| [D2KLab/KG-to-Story · `ab7d78ddbc2d5edf124a5da76edeb14ff652104d`](https://github.com/D2KLab/KG-to-Story/tree/ab7d78ddbc2d5edf124a5da76edeb14ff652104d) | [GPL-3.0正文](https://github.com/D2KLab/KG-to-Story/blob/ab7d78ddbc2d5edf124a5da76edeb14ff652104d/LICENSE) | 初筛：作者描述六stage event subgraph→LLM历史叙事；Story/lineage已有相邻能力，不引完整pipeline。 [README](https://github.com/D2KLab/KG-to-Story/blob/ab7d78ddbc2d5edf124a5da76edeb14ff652104d/README.md) |


## 深读一：CodeSee 的先判断、后揭示

CodeSee 的真实动作由两个状态层配合：[TourMode.tsx L76–82](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/viewer/src/graph/TourMode.tsx#L76-L82)、[L126–189](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/viewer/src/graph/TourMode.tsx#L126-L189) 在ask阶段提供选项，未选择时reveal按钮disabled；选择错误也可reveal，并非必须答对才允许读证据。[tourLogic.ts L58–80](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/viewer/src/graph/tourLogic.ts#L58-L80) 的ask阶段不把本步focus加入累计可见节点，揭示后再加入；布局仍基于full graph。这让读者对一个局部分叉先作判断，再看到对应节点，而不是图上多一个next按钮。

可复查输入是已提交的 [features.json L2576–2593](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/viewer/public/features.json#L2576-L2593)：第3步先问不同规模项目是否用同一扫描方式，三个选项、answer索引1，随后揭示轻/重扫描分流；[L2626–2642](https://github.com/Kaka-cheaper/codeSee/blob/b32f6f5257f6dbd05c17d7cfc3a63d5cc5c0ea07/viewer/public/features.json#L2626-L2642) 第8步用检查点同步作类似问题。它是仓库作者已提交的自述demo，含AI provenance，**答案字段仅证明demo如何编码问题，不独立证明系统始终保持新鲜、同步偏差上限或学习收益**。本轮未运行viewer，不把文本quiz当代码覆盖证明。

机制值得保留，但原工具已经提供完整quiz与图状态。Archify的当前Walk只定位/淡化步骤，不能直接声称具有“先隐藏、再揭示”的同等交互。下面的最小内容实验因此仅借用“先判断一个具体分叉”的写作动作：现有两步Walk依次给出问题和固定源码证据，不设置强制答题，不添加评分、累计解锁、quiz schema或新运行时。若未来确需遮住答案，需另评估实验HTML的局部details包装；本报告不把尚不存在的控件当现有能力。


## 深读二：固定表达式，切换已保存的迭代去比较

Birdseye [`753f6648db380c808534089ead648409dd94abc2`](https://github.com/alexmojaki/birdseye/tree/753f6648db380c808534089ead648409dd94abc2) 的阅读不是另一条时间瀑布图。源码表达式被分配 tree index；读者点选多个表达式，保持 selection，然后改变一个 loop 的当前迭代，inspector 同时显示这些表达式在该迭代的已记录值。

具体实现：[call.js L244–249](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/birdseye/static/js/call.js#L244-L249) 保留 selected_boxes；[L254–345](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/birdseye/static/js/call.js#L254-L345) 从 node_values/node_loops/loop_iterations 根据当前嵌套迭代路径取值，统一刷新已选表达式的 inspector。不必反复hover找同一个子表达式，也不把整行最终值当所有中间值。

可公开复查的固定输入是 [test_middle_iterations](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/tests/test_birdseye.py#L632-L650)：20×20 nested loop 中，只有 i=10 且 j≥12 的分支使用一个表达式。上游测试期望外层保留索引 `[0,1,2,10,17,18,19]`，选中外层10后内层保留 `[0,1,2,12,13,17,18,19]`。这是实际已提交的测试代码/断言，未在本轮调用Python。

[固定 tips L49–56](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/docs/tips.rst#L49-L56) 明确只保证first/last3及每个node有至少两次命中时的保留策略；不是完整记录400个执行点。[bird.py](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/birdseye/bird.py) 的 NodeValue 又限制对象深度、长度等，额外值不一定全部展开。[tracer.py L188–190](https://github.com/alexmojaki/birdseye/blob/753f6648db380c808534089ead648409dd94abc2/birdseye/tracer.py#L188-L190) 明确拒绝 async 函数，不能由README的支持版本推全部Python语义适用。

**为什么暂不派实现：** 选择表达式+固定loop上下文这个动作有价值，区别已有 Chrome timing trace、profile采样、notebook别名/stale。但原工具已经实现，需要运行期采集、对象repr/隐私/截断与call身份。Archify目前没有同类自然公开运行输入，新增picker会把产品推成debugger。若未来用户已有少量公开value记录，先用现有表格/snippet对照表达式与iteration即可，不新增collector或执行用户代码。未保留/未执行/值为None也必须分开，不能补成零。

## 唯一条件候选：现有 Explainer 的分叉判断内容对照（本轮不实施）

选定一个可核对答案的实际生产分支：ccache direct lookup miss 后是否必然完整编译。固定 [ccache.cpp L3180–3259](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/src/ccache/ccache.cpp#L3180-L3259) 在read_only_direct=false且depend mode=false时继续preprocessor lookup，命中可返回preprocessed_cache_hit，尚未进入to_cache完整编译；可能执行预处理，不能写成完全没有调用compiler。对应公开 [direct.bash L75–94](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/test/suites/direct.bash#L75-L94) 的corrupt-manifest fixture是受控回归测试，未本轮运行，非自然线上事故。该来源已在rebuild-evidence报告深读，本轮只复用为内容输入，不计第11个新来源；许可核实与范围沿用 [rebuild-evidence-smalltools.md](./rebuild-evidence-smalltools.md)。问题与答案来自固定条件分支，不采用CodeSee自述quiz作为Archify技术答案。主结论仍在页首，局部问题按阅读顺序放在答案前；答案仍在文档内，可直接浏览，不声称已隐藏。内容结构可以完全使用当前panel/source/Walk：

1. 展示问题、分叉前的少量上下文和两到三个明确选项；读者可以先心里判断，也可以直接去下一panel。
2. 下一panel解释实际分支，连到固定revision的条件与结果代码，说明其他选项为何不适用；保留不知道/证据不足的情况，不以编造原因补齐。
3. 允许直接阅读全图、跳过或返回问题，不强制解锁、不存答题分、不增加对读者的理解/接受标签。

协调结论：root已启动另外两项内容实验，本轮仅记录此条件候选，**不新增第三份近似Walk产物，也不派产品实现**。若后续真实需求仍需要区分这个分支，这个对照才用于检验叙事内容是否有额外价值；**不是把CodeSee quiz/单选状态复制进schema**。若要真正遮住答案后由按钮揭晓，必须在内容对照显示收益后再独立评估；研究文档不授权加入新控件。也不隐藏已有source link、全图或reader导出入口来制造差异。

对照应固定同一问题、相同拓扑/文字/源码revision：A直接给局部分叉答案，B先问再给同样答案。两边都保留整页结论与同样浏览入口；记录读者是否能准确说明分叉条件/引用正确证据，以及是否选择跳过。不能用“下一步点完”“答对一道题”“节点都揭开”当理解、验收或留存。当前没有做这个对照、浏览器截图或人类试读，推荐只到可审查内容实验，不声称已改善产品。

## Value / Cost / Impact 与不做的部分

**Value：** CodeSee的关键新意是把“观察答案”变成一次可跳过的“先作判断”，用原图和固定源码立即纠正具体误解；有别于仅next/previous和内容高亮。Birdseye则让相同表达式的上下文保持固定，避免在重复行/循环中靠记忆比较。这两个机制分别清楚，但当前只推荐前者的内容对照，不为广度同时实施两套交互。

**Cost：** 使用既有panel/Walk/source cards很低，内容可独立审查；完整CodeSee quiz-gated graph或Birdseye runtime会引入新schema、进度/评分/采集、identity、覆盖与同步状态，成本高且没有本轮依据。只做现有能力产物有助于在产品改动前证伪收益。

**Impact：** 不修改产品代码、共享Viewer、renderer、typed输入、Skill或安装；不运行研究来源中的agent命令、hook、scanner或compiler。后续内容仍须准确标明source evidence和人工/AI写作边界；如果真实任务的普通说明已足够，就结束，不扩大为教学平台、检验理解的系统或新报表parser。
