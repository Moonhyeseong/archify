# 执行、算法与协议的分步阅读：固定记录与播放不是同一件事

2026-10-25，只读新批次。固定Archify base `82c7e0f089a02a4d514714adf37dc2061682da5f`。已检索hub全部既有scouts中的项目排重，不重复state-contract、payload-delta、Chrome/OTLP/Speedscope、FSM库或既有Journey/Guide。

**本轮不建议新增运行器或通用trace player。** 两个可保留方向分别是“单消息的发送/投递/重复事实卡”和“两个事件的逻辑顺序证据”；前者可能只需现有Explainer静态表，后者若转成普通Sequence会强加并不存在的总序。都需先证明读者任务收益，不直接派runtime实现。

本轮未执行上游程序、配置、安装脚本、trace播放器或陌生算法；未安装依赖、未生成图片或运行浏览器。源码事实不是实际协议正确性、人类理解或运行验收。

## 一手版本、许可及真实数据

日期是固定commit时间，非release承诺。小项目有好机制但没有许可时，不当作可复用开源源码。

| 来源与固定commit | 许可 | 实际输入→输出/实现 | 判断与限制 |
| --- | --- | --- | --- |
| [pchrysostomou/moirae](https://github.com/pchrysostomou/moirae/tree/a289c00cedb8716bd4a6db6b47042b875c22936b)，`a289c00cedb8716bd4a6db6b47042b875c22936b`，2026-09-22 | [Apache-2.0](https://github.com/pchrysostomou/moirae/blob/a289c00cedb8716bd4a6db6b47042b875c22936b/LICENSE) | 用户Process与模拟配置→versioned JSONL→独立Studio。只研究已有trace：header v/unit、事件t/seq/kind、send msgId/from/to/msg、deliver dup、drop reason、state patch、fault、violation。 | 文件合同能和运行器分离。保留send≠deliver、seq≠时间；不运行simulate、不重建Raft或信任seed即协议正确。 |
| [DistributedClocks/shiviz](https://github.com/DistributedClocks/shiviz/tree/ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a)，`ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a`，2021-12-01 | [主源码MIT，附第三方例外](https://github.com/DistributedClocks/shiviz/blob/ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a/LICENSE.txt)：JS docs CC-BY-SA、D3 BSD、jQuery另列 | 带host/vector clock/event的日志+正则解析→部分序DAG；parser/modelGraph/vectorTimestamp做解析、事件节点、父子关系与clock一致性核验。 | 不是给普通timestamp排序的UI。没有向量时钟或有效instrumentation，不能补造happens-before。不能把整个distribution称MIT。 |
| [ongardie/raftscope](https://github.com/ongardie/raftscope/tree/5b0c10ab51f873721895e7470b49e04c94bf826f)，`5b0c10ab51f873721895e7470b49e04c94bf826f`，2015-07-08 | [Stanford permissive notice，ISC式文本](https://github.com/ongardie/raftscope/blob/5b0c10ab51f873721895e7470b49e04c94bf826f/LICENSE)，GitHub识别NOASSERTION，不擅自改成MIT | 模拟state→checkpoints/current/maxTime；state.js seek可rewind/advance，fork截断未来checkpoints，export/import JSON。 | fork是改变模拟未来，不是普通返回上一步。Archify Journey只读既有关系/步序，不把“可逆播放”扩大成分支模拟历史。 |
| [algorithm-visualizer/tracers.js](https://github.com/algorithm-visualizer/tracers.js/tree/4db510da800039a9f544e02d32b454428f682c8f)，`4db510da800039a9f544e02d32b454428f682c8f`，2022-04-13 | [MIT](https://github.com/algorithm-visualizer/tracers.js/blob/4db510da800039a9f544e02d32b454428f682c8f/LICENSE) | instrumented JS tracer calls→commands[{key,method,args}]，Tracer.delay插分步边界；Commander以JSON roundtrip冻结args，设命令/对象数量上限。 | command replay不是每步完整state；不能把delay当实测耗时。Commander在未设置ALGORITHM_VISUALIZER环境变量时有beforeExit向官方API发commands并打开链接的路径，故不import/执行；只读机制，不引SDK。 |
| [latentflip/loupe](https://github.com/latentflip/loupe/tree/ce336bc8db31ebbd46f6659ac8e26019cfa11fde)，`ce336bc8db31ebbd46f6659ac8e26019cfa11fde`，2014-11-17 | [package.json声明ISC](https://github.com/latentflip/loupe/blob/ce336bc8db31ebbd46f6659ac8e26019cfa11fde/package.json)，未核实独立许可全文 | JS输入→事件循环/调用栈教育可视化；本轮只核实仓库与package元数据，未深读运行路径。 | 不据宣传断言sandbox安全/完整JS执行语义，不列为已验证机制，不引执行器。 |
| [adam-s/algoviz](https://github.com/adam-s/algoviz/tree/716820c1c81fad4eee37a35bcad0d36f143b2827)，`716820c1c81fad4eee37a35bcad0d36f143b2827`，2026-10-01 | 未找到LICENSE或package许可，**排除源码复用** | core/trace.ts collect(gen)对yield出的state/stack/events structuredClone，记录Frame.index；player读frame。 | “生成器继续变更对象会篡改历史”的机制可读，但无许可不复制。完整snapshot不代表真实采集，算法自己yield的教育步骤应标为authored。 |
| [Unikiel/algo-visual](https://github.com/Unikiel/algo-visual/tree/409381f49640ef170b744629102f2046fccfca7e)，`409381f49640ef170b744629102f2046fccfca7e`，2026-07-19 | 未找到LICENSE或package许可，**排除源码复用** | engine/types Step(state/line/description等)、player.ts通过index走Step[]，setTimeout控制展示speed；依赖变化重建steps。 | 播放steps/s是读者节奏，不是代码耗时。能回退不证明程序可逆；不把README“源码三语言”理解为三个真实运行器。 |

四个深入来源：[Moirae trace.ts](https://github.com/pchrysostomou/moirae/blob/a289c00cedb8716bd4a6db6b47042b875c22936b/packages/core/src/trace.ts)、[Studio model.ts](https://github.com/pchrysostomou/moirae/blob/a289c00cedb8716bd4a6db6b47042b875c22936b/apps/studio/src/trace/model.ts)；[ShiViz vectorTimestamp.js](https://github.com/DistributedClocks/shiviz/blob/ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a/js/model/vectorTimestamp.js)、[modelGraph.js](https://github.com/DistributedClocks/shiviz/blob/ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a/js/model/modelGraph.js)；[RaftScope state.js](https://github.com/ongardie/raftscope/blob/5b0c10ab51f873721895e7470b49e04c94bf826f/state.js)；[tracers Commander.ts](https://github.com/algorithm-visualizer/tracers.js/blob/4db510da800039a9f544e02d32b454428f682c8f/src/Commander.ts)。未运行这些文件。

## Archify现状：展示顺序已有，不承担执行状态

- [viewer/route-probe.js](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/route-probe.js)已有Journey的Prev/Next、pause/play/replay、Overview、按稳定edge显示步序；这是authored directed path，不是代码执行记录。新增另一套stepper没有独立价值。
- [story-authoring.md](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/story-authoring.md)已有scene/point顺序、anchor/via/focus、trace/parallel/relation；并明确“Simultaneous presentation does not prove concurrent execution”。不能把上游同时高亮当新“并发”能力。
- [Sequence README](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/sequence/README.md)的messages y与segments/activation都是布局像素；不自动等于ms或Lamport clock。单条from→to箭头不能完整表达发送与抵达两个不同时刻，更不能省略drop/dup后冒充完整协议trace。
- [Lifecycle README](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/lifecycle/README.md)已有状态、主路径、loops/skips、transition label/note，但不是按事件fold任意变量store。前批state-contract已区分声明矩阵与实际运行；payload-delta已能展示显式JSON样本变化，不能为state换名字重复造adapter。

以上是源码核对，不是browser执行。相关既有验证入口为test/route-probe-browser.test.mjs与现有sequence/lifecycle schema及renderer tests；本轮没有运行，不引用历史pass数充当新证据。

## 候选A：单消息的投递证据与同刻状态行（仅静态实验，待价值验证）

自然一手输入：[Moirae官方engine.jsonl](https://github.com/pchrysostomou/moirae/blob/a289c00cedb8716bd4a6db6b47042b875c22936b/crates/moirae-trace/tests/fixtures/engine.jsonl)，这是官方模拟engine fixture，不是生产流量，不能称真实线上trace。其msgId=0：t=10/seq=5 send 1→2；t=15/seq=12 deliver；seq=14 node2 state.patch got=1；t=15/seq=15 deliver dup=true；seq=17 node2 patch got=2。相同t有多个事件，seq与t分别保留；不把两次deliver去重或合成一次调用。

最低有用产物是一个**静态消息事实卡**：原send行、按原seq列出的所有deliver/drop、明确units、记录终止时仍无终态者标pending/unknown，以及相邻原始state patch行；将原消息payload与两个patch的字段值原样放近。不要自动写“此deliver导致got变化”，相邻记录不是因果证明。图只可用已有Sequence帮助辨认参与方，必须在旁边说明示意交互，不用箭头数量冒充投递次数。Explainer表格可能已足够，不强求native图。

具体任务：“msg0被收到一次还是两次？got从1变2发生在不同毫秒吗？”候选应一屏给出两次、同t=15但seq不同的事实，原JSONL对照需找5行。记录找行次数/答错数，不能只以新增一个播放按钮称收益。固定输入/报告hash，1440×1000、390×844都可读原seq/t和dup；截图必须保留“模拟fixture”标记。若原Moirae Studio或简单grep同样直接答出，停止，不做新产品功能。

剩余差异很窄：Archify现有Journey没有消息delivery身份与重复账目；但不应为此扩Journey。可消费已冻结报告投影成一次性Explainer，维护成本低中。未知kind、unknown unit、不安全整数、孤儿msgId、重复seq、边界截断需要拒绝或明确unresolved，不静默排序/丢弃。**不建议现在集成；仅当读者证明确需便携静态说明时做可丢弃实验。**

关键反例：Studio model.ts的stateAt(node,t)按t折叠同刻全部patch，不能借来假装“截至seq14”的精确状态；state patch的null表示删除字段，不是业务null。重建任意state需独立合同，第一刀只保留原始patch，不实现fold。v2-extras fixture还有ns和超safe整数表示，不能用Number粗略转化后宣称完整支持。

## 候选B：两个事件的逻辑顺序证据，优先静态说明、不泛化日志导入

[ShiViz simple-reliable-broadcast.log](https://github.com/DistributedClocks/shiviz/blob/ea00d3d48b2e4a2adc3c87c27d2f0119100ce36a/log/simple-reliable-broadcast.log)有墙钟、host、vector和原文事件。选两条原始日志即可构成自然对照：node1的RBDeliver vector `{node0:2,node1:3}`；稍后的node0“Sending ... to node2” vector `{node0:3}`。尽管前者墙钟14:37:20.548早于后者.549，按缺失维度为0的向量解释，二者分别一维较大、一维较小，不能由这些时钟证明happens-before。

最小任务是让读者回答“较早墙钟是否证明先行关系？”候选只将两条原文、原始vectors与逐维比较并排，输出before/after/incomparable/equal或invalid，不把incomparable当真实时间同时执行。**不能直接复制ShiViz compareTo作为通用比较器**：它文档返回0含concurrent/equal两者，且已读循环对缺失维度有特定实现行为；上游ModelGraph还做完整clock一致性校验。只选两行无法证明整份log instrumentation正确，图上不得标成已验证真实因果。

Sequence可作为参与方示意，但从上到下的像素总序不等于partial order，不把两条独立事件强画成通信箭头；Lifecycle也不能凭无边画“并发分支”并声称全部可选执行。现有Explainer可直接承载表格，若需新的vector-clock validator/parser或source instrumentation，成本超过这轮收益，拒绝实现。只在真实用户拿这类日志解释因果时考虑一页静态对照；不做全格式导入器、不改Story parallel语义。

## 共同停止条件

运行器产生的数据、作者编排的步骤、协议模拟fixture、真实采集日志分别标注；播放速度、渲染duration、模拟t、event seq、vector clock和wall clock都不能互换。分支选择改变未来输入/故障，不是只读Journey；fork后旧未来失效不应变成Viewer历史功能。回退到完整snapshot也不是逆执行。

本轮没有证据要求共享Viewer改动。优先复用已有Story/Explainer和payload-delta的事实表达；A/B若不比原工具或静态表更容易正确回答，就保留负面结论。只新增本人研究报告，不改其他文件、不提交。
