# Profile 阅读小机制：先讲清分母，再谈热点与因果

日期：2026-10-25。Archify 核对基准：82c7e0f089a02a4d514714adf37dc2061682da5f。只读调研；未安装/运行外部 profiler、attach 进程、采集用户程序、执行示例脚本或制作截图。仅新增本文件，不修改 runtime、parser、schema、Skill 或既有实验。

## 结论

发现了值得保留的**计量解释机制**，但没有证据支持新建 flamegraph renderer、profile importer 或共享 Viewer 功能。最多两个候选：

1. **有条件推荐：同一份 profile 比较的“绝对值、分母、份额、归一化”对照 Explainer。** 用户已有可公开报告数值时，可直接用现有 comparison/来源/Tree 做 authored 页面，先验证是否减少读者误读。它不计算新的 profile、不把 sample 变成 span。
2. **保留研究：await 时间归因与真实异步因果的并排解释。** 现有材料能证明两者不同，不能提供一份已核实的真实因果链。没有完整的公开关联事件输入时，不启动实现，更不从父子 span 或 await 百分比推 critical path。

本轮不建议立刻改核心产品，也不把两个内容候选称为已验证收益。如果没有实际 profile 审查任务，第 1 项也应留在研究里。

## 排重与 Archify 当前能力

已读 traces-timelines.md，并从全部 scouts 提取 171 个既有 GitHub repository 身份排重；下表 canonical repo 不在当时清单中。trace-waterfall 的 Chrome X/OTLP/evented 转换、已有 payload-delta，以及 Speedscope、py-spy、Perfetto、Firefox Profiler、VizTracer 均不另计新发现或再开同题转换器。没有把 FlameScope 当成新名字的 Waterfall importer。

直接读取了当前 owning source：

- [Waterfall README](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/waterfall/README.md)：共用线性时间轴；父时长 inclusive，Passport 明写占 wall-clock 的比例；已有“不相加父子”的规则，且明确不画缺乏依赖证据的 waiting/critical path。因此这些并不是新缺口。
- [Tree README](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/tree/README.md)：单根、单父的 authored containment，已有折叠和隐藏数；不是带权 flamegraph，不表达通用调用图的环或跨分支调用。节点宽度依文字排版，不代表 samples 或时间。
- [Explainer schema](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/schemas/explainer.schema.json)：已有 comparison、metric、code、原生图与来源，可以先做计量解释，不需要依赖开放 PR 中的新 metric-delta 控件。
- [实际 example-rebuild Waterfall](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/examples/example-rebuild.waterfall.json)：记录一轮 child-process 开始/退出与并发 worker，可用于核对区间；没有 CPU samples、await context、vector clock 或消息因果关联。不能借其 measured 标签填补这些缺失字段。

GitHub 搜索 flamegraph、profile sampling 没有返回议题；critical path 返回已关闭 [#692 execution waterfall](https://github.com/tt-a1i/archify/issues/692)，已读正文，其要求本来就包括分母、inclusive 与因果证据边界。搜索不是穷尽证明，也不授权重做现有实验或开放 Tracks 工作。

## 新项目与实际输出语义

以下 commit 为本次查询的默认分支固定身份，不当作稳定发行版；许可证按实际选读文件核对。只借鉴机制，不建议带入这些 UI、采集器或依赖。

| 新来源 / 固定 commit / 许可 | 已核实的一手输入→输出与阅读行为 | 对 Archify 的取舍 |
| --- | --- | --- |
| [brendangregg/FlameGraph](https://github.com/brendangregg/FlameGraph/tree/41fee1f99f9276008b7cd112fca19dc3ea84ac32)，41fee1f99f9276008b7cd112fca19dc3ea84ac32，2024-10-20；**按文件混合许可** | folded stack 加权重→可点击 SVG；横轴不是事件时间。difffolded 输出同一栈的两个计数，缺失列补 0；归一化可改变比较问题。官方有真实 perf/dtrace 示例与生成 SVG。 | 小脚本很适合研究输出合同；不要将折叠栈画成实测起止 Waterfall，也不重复其 zoom/search。许可证不能笼统叫 MIT，见下文。 |
| [joerick/pyinstrument](https://github.com/joerick/pyinstrument/tree/e0d3dba24dedb13923c0f7f7c4533cb359f0101f)，e0d3dba24dedb13923c0f7f7c4533cb359f0101f，2026-10-12；[BSD-3-Clause](https://github.com/joerick/pyinstrument/blob/e0d3dba24dedb13923c0f7f7c4533cb359f0101f/LICENSE) | statistical stack samples→处理后的 call tree、HTML/console/JSON；按 wall-clock 归因，包含 I/O 等待，另给 CPU time；支持 timeline 与聚合视图。 | 核心启发是把采集与归因模式写在读者看得到的位置，不是“再加一个树视图”。隐藏库帧已有完整上游交互，Archify 不照搬 profiler。 |
| [jrfonseca/gprof2dot](https://github.com/jrfonseca/gprof2dot/tree/5cbab290f056ee05b98f401d346c10f7914e357c)，5cbab290f056ee05b98f401d346c10f7914e357c，2026-08-05；[LGPL-3.0](https://github.com/jrfonseca/gprof2dot/blob/5cbab290f056ee05b98f401d346c10f7914e357c/LICENSE.txt) | 多类 profiler 输出→DOT；节点同时显示 total/self，边带传播时间/次数；可按阈值省略节点/边，支持近似相同结构的两图比较。 | 精确区分 inclusive/self 比换色更有用；其递归处理与归因启发式不能当成业务调用事实。不要引入 Graphviz 或再做多格式解析；README 明示维护时间有限。 |
| [google/pprof](https://github.com/google/pprof/tree/1facf8f91b50fbab03aa6cb249e0397d91449f9f)，1facf8f91b50fbab03aa6cb249e0397d91449f9f，2026-10-16；[Apache-2.0](https://github.com/google/pprof/blob/1facf8f91b50fbab03aa6cb249e0397d91449f9f/LICENSE) | profile.proto 的 sample.value 列由 sample_type 的类型/单位定义；文本、图、源码与交互报告；不同的 base/diff_base/normalize 影响百分比分母。 | 只选读比较合同与 schema，不把大型 symbolization/protobuf/web server 带入 Archify。CPU、allocation bytes、样本 count 不能混为同一数字。 |
| [Netflix/flamescope](https://github.com/Netflix/flamescope/tree/be26595f1395c32eef71c88a06cb9c8c87f270c2)，be26595f1395c32eef71c88a06cb9c8c87f270c2，2022-04-21；[Apache-2.0](https://github.com/Netflix/flamescope/blob/be26595f1395c32eef71c88a06cb9c8c87f270c2/LICENSE) | perf 栈→subsecond-offset 热图；选时间区间后只为该区间生成 flamegraph，README 声明包括 page faults/context switches 等记录。 | **选区改变样本总体**是有效提醒；已存在选段 trace 实验，本轮不另做热图 brush 或 local server。未归档不等于近期活跃；本次未运行其旧依赖链。 |
| [Mode7Labs/raceway](https://github.com/Mode7Labs/raceway/tree/c217f744147af008db58337c87309c690b9800f0)，c217f744147af008db58337c87309c690b9800f0；[MIT](https://github.com/Mode7Labs/raceway/blob/c217f744147af008db58337c87309c690b9800f0/LICENSE) | 选读 SDK/web 类型：事件有 event/trace/parent ID、timestamp、causality_vector、task/future 等字段；web 类型另有 critical-path 分析输出。 | 是“因果需要额外证据”的对照，**不是小型 Archify 候选**。没有审计其 vector-clock/critical-path 算法正确性，不采信宣传中的检测保证。多语言 SDK、server/storage/web 全栈成本不合适。 |

另核 [ChronoSynnc/chrono-sync](https://github.com/ChronoSynnc/chrono-sync/tree/c7edc719518f6bf4cfdd2687ae1be29d82e0dc40)：GitHub license metadata 未识别许可；固定树中的 examples/basic-trace/trace.json、README.md 实际为空。不能把 README 的因果可视化描述当成已提供的真实输入/可复现输出，不推荐引用其 fixture 或复制代码。检索猜测的 felixge/deltaflame 返回 404，已排除，没有当作有效项目。

## 三个必须保留的输出区别

### 1. 两种 differential flame graph 的“宽”不是一个量

[FlameGraph difffolded.pl 10–21](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/difffolded.pl#L10-L21) 写明，通常的 differential SVG **宽度来自第 2 个 folded 文件**，颜色表示增减。完全消失的栈可能没有可见宽度，因此注释建议同时反向输入、反转色相生成基于第 1 份宽度的图。它不是一次执行的时间线。

[pprof 文档 diff mode 482–491](https://github.com/google/pprof/blob/1facf8f91b50fbab03aa6cb249e0397d91449f9f/doc/README.md#L482-L491) 定义另一种呈现：子树中一项减 150、另一项增 200，box 宽度按 150+200，阴影按净变化 50。不能看见相近的“flamegraph”外形，就在 Archify 中统一解释为“后一次耗时宽度”或“净 delta 宽度”。

这也说明只展示父节点净值会掩盖子项方向相反的变化。它是解释上的实际风险，不证明 Archify 目前已有错误的 profile compare 实现。

### 2. 绝对权重、占比变化、归一化变化回答不同问题

[pprof 比较合同 291–314](https://github.com/google/pprof/blob/1facf8f91b50fbab03aa6cb249e0397d91449f9f/doc/README.md#L291-L314)：diff_base 的百分比基于 base 总样本；base 用于累计 profile 相减时，分母是两次总量之差；normalize 会先把 source 总量缩放到 base 再减。这个模式名必须和百分比一起保留。

[FlameGraph difffolded.pl 108–114](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/difffolded.pl#L108-L114) 的 -n 则把第 1 份权重按 total2/total1 缩放并取整。两个工具的“normalize”方向/舍入不应假定完全相同，不能复制一个泛化公式而不记录来源算法。

一个**人为计量反例，不是实测性能结论**：函数权重 100→80，总权重 1000→400。函数绝对权重减少 20%，占比却从 10%→20%，上升 10 个百分点。没有采样率、采集窗口、请求数/负载与指标单位，不能由任一变化断言程序更快/更慢。计数可能是 samples、bytes 或 CPU nanoseconds；[profile.proto 的 sample_type/value](https://github.com/google/pprof/blob/1facf8f91b50fbab03aa6cb249e0397d91449f9f/proto/profile.proto#L49-L55) 正是在声明这些单位。

### 3. Call tree 的 await 归因不是跨任务因果图

[Pyinstrument how-it-works](https://github.com/joerick/pyinstrument/blob/e0d3dba24dedb13923c0f7f7c4533cb359f0101f/docs/how-it-works.md#L93-L135) 明确计的是 wall-clock；async enabled/strict 将离开 context 的时间归到暂停的 await。disabled 可混入其他 coroutine/event-loop 工作，strict 将部分外部 context 记成 out-of-context。这不是“await 那一行烧了这么多 CPU”。

[processors.py 59–66](https://github.com/joerick/pyinstrument/blob/e0d3dba24dedb13923c0f7f7c4533cb359f0101f/pyinstrument/processors.py#L59-L66) 明示 aggregate_repeated_calls 合并同一路径的多次调用，丢失时间线性；[JSONRenderer](https://github.com/joerick/pyinstrument/blob/e0d3dba24dedb13923c0f7f7c4533cb359f0101f/pyinstrument/renderers/jsonrenderer.py#L24-L87) 输出处理后的 tree，含 time/await_time/children 和 session duration/sample_count/cpu_time。不能把 children 遍历序列重建成事件 chronology，不能把被隐藏帧等同于没执行。

对照 [Raceway web Event 类型 73–90](https://github.com/Mode7Labs/raceway/blob/c217f744147af008db58337c87309c690b9800f0/web/src/types.ts#L73-L90)，它另要求事件身份与 causality_vector；[AsyncSpawn/AsyncAwait 类型](https://github.com/Mode7Labs/raceway/blob/c217f744147af008db58337c87309c690b9800f0/sdks/typescript/src/types.ts#L45-L59) 还携 task/future 信息。即使具备这些字段也还要审计解释规则；缺它们的单纯时间包含/栈父子关系，更不能升级成确定 happens-before。

## 候选 A：带计量合同的 profile 比较解释页（有条件推荐）

**具体用户任务**：已有两份 profile 报告，代码审查时有人把更红/占比更大直接说成“变慢”。将少量可公开报告项及其采集条件放在一页，先回答这次比较究竟是绝对成本、份额，还是归一化后差异。

**最小产物**：同一个明确指标类型，3–6 行用户已导出的 summary，保留工具版本/命令、sample_type/unit、两次总量、采集范围、是否归一化、选择窗口与过滤/隐藏条件。使用当前 Explainer comparison 展示 base/head 绝对值、各自分母、占比及百分点差；来源链接回报告项。另列净变化和相反方向子项，不自动把父子 inclusive 相加。

**图的边界**：只有原报告明确给了 calling context 才加原生 Tree；每个路径出现使用独立节点身份，不能按函数名去重。Tree 仅表达调用上下文，不让节点宽度冒充权重；递归调用图或多父关系不能硬塞单父树。没有这样的上下文就只用表和来源，不为视觉强造一张图。绝不走 Architecture Delta 来冒充 profile 数值差分。

**对照与证伪**：A0 把相同计量合同/分母放在附表，A1 将它们放在对应绝对值与百分比旁；两者信息及来源相同，只比较组织方式。先用上面 100/80 的 illustrative 反例检验计算和措辞，再等一份获准公开的真实比较作为实际 artifact。读者应能说对“绝对权重方向、份额方向、能否推速度、有没有丢失栈”。只有作者自测/截图，没有读者数据时不宣称减少误读。真实输入缺失则停止在 authored 示例，不补采集器。

**价值/成本/影响**：潜在价值中高，实施/维护成本低、共享代码影响零；但“用户常误读”目前不是经频次研究证明的需求。必须先确认是一次真实审查任务，不把通用 metric passport 扩成新格式或证据平台。暂不新增测试套件；核原始数值、分母、单位与实际渲染即可。

## 候选 B：await 栈归因与因果记录的对照阅读（仅保留研究）

问题很具体：某 await 节点占 wall-clock 大，究竟是 CPU 热点、在等外部工作，还是同 context 内另一个任务？Pyinstrument 的归因模式能解释观察视角，却不能独自回答真实跨任务依赖。

若将来用户给出公开的 profile 及明确关联的 spawn/await/send/receive 事件，可以用现有 Explainer/Sequence 分开表达“上游已报告的时间归因”和“哪些边有具体关联 ID”；未证实处保留 unknown。必须先有这份数据，不从 elapsed 重建事件关系，不把 profile 聚合树送进 Waterfall。

**当前不实施**：本轮没有一份已核实、可公开且带完整关联依据的 paired input。Pyinstrument 的 [async_example_simple.py](https://github.com/joerick/pyinstrument/blob/e0d3dba24dedb13923c0f7f7c4533cb359f0101f/examples/async_example_simple.py) 是代码示例，不是实际运行结果；Raceway 类型与宣传也不替代记录。为补缺口装 SDK、跑 server 或写新 trace parser，成本/语义风险远高于这次解释页的已知价值。

## 许可证与证据状态

FlameGraph 是本轮最容易标错许可的来源：[flamegraph.pl 文件头](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/flamegraph.pl#L64-L85) 为 CDDL-1.0，[difffolded.pl 文件头](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/difffolded.pl#L35-L51) 为 GPL-2.0-or-later；GitHub repository license metadata 为 null 不等于这两个文件无许可。拟议内容实验只独立叙述机制，不复制其 Perl、SVG 脚本或依赖。

已验证：项目身份/固定 SHA、上述选定 README/类型/代码语义、许可证文件/文件头、Archify 对应合同、有限议题搜索。未验证：这些 profiler 的安装或运行、输出与真实程序完全一致、时间归因算法正确性、浏览器交互、真实 profile 比较输入、视觉质量或用户收益。FlameGraph 的 [example-perf.svg](https://github.com/brendangregg/FlameGraph/blob/41fee1f99f9276008b7cd112fca19dc3ea84ac32/example-perf.svg) 和 FlameScope 的 [官方截图](https://github.com/Netflix/flamescope/blob/be26595f1395c32eef71c88a06cb9c8c87f270c2/docs/screenshot-flamescope-02-annotated.png) 是上游发布产物，不是本次生成或亲测证据。

没有发现可直接在当前 Archify artifact 上证明的新共享 runtime 缺陷。可行动的最小部分是候选 A 的有真实输入前提的 authored 解释；其余保留研究，不用新增功能填满一轮。
