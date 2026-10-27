# Reactive notebook 阅读：依赖、阻塞与 stale 的证据边界

2026-10-27，只读调查；hub `4671df2c578925f4c70a7ec7abd68ada93a0d472`，协调人提供的 dev 基线 `e837dc4c`。**结论：不建议新建 reactive notebook 导入器或通用状态模型；只保留一个条件性的静态阅读对照，先验证它是否比同事实表有价值。** 本轮未运行上游代码、notebook、kernel 或 Archify，未制作截图，所有上游测试结果均为源码中的断言，不是本次运行结果。

## 排重与价值

2026-10-25 [notebook evidence](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261025/docs/research/2026-10-25/scouts/notebook-evidence-smalltools.md) 已调查 marimo、Pluto、ipyflow 等，区分静态依赖、dirty、stale、disabled 和实际运行；其唯一候选是 alias 与物化派生值，尚无阅读收益证据。[Notebook occurrences](https://github.com/tt-a1i/archify/tree/2090b0ff144b7bc3425d52821655f659858f5d6a/experiments/notebook-occurrences) 只比较保存的 cell source/output，不推断依赖或执行。[Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) 已画生产者/消费者；[state contract](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) 已区分机器声明和观察；[trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) 表达已采集区间。画 DAG、展示状态或者添加时间轴本身都不是新价值。历史 gallery 的 notebook 浏览器 gate 未完整运行；不能把其截图当本实验验证。

本轮查了现有 2026-10-27 PR/远端分支清单，并用 `gh pr list --state open --limit 200` 查 notebook/reactive/dependency/dataflow/state；匹配的 #1109 是 dataflow 性能，#388 是 Mermaid 状态导入，没有发现同题 open PR。该检索不保证发现未命名或私人工作；当前批次 task-flow-tests、exception-identity、trace-flow-evidence、oci-whiteouts、operation-order 亦非此 notebook 状态问题。既有 `codex/lab-notebook-occurrences` 和 `codex/lab-state-contract` 是主要重叠。

## 固定一手来源

- [marimo `23162ed14182afdcec9272c022870e710e41f645` 测试](https://github.com/marimo-team/marimo/blob/23162ed14182afdcec9272c022870e710e41f645/tests/_runtime/test_dataflow.py#L970-L1044)，[完整 Apache-2.0 许可](https://github.com/marimo-team/marimo/blob/23162ed14182afdcec9272c022870e710e41f645/LICENSE)。该测试构造 `0 → 1 → 2`，禁用 0 后 1、2 标记为传递禁用；单独标记 1 stale，重新启用 0 后断言 `enable_cell` 返回 `{1}`。第二段禁用 1、标记 2 stale，返回 `{1, 2}`。这是图对象单元测试的断言和返回集合，不是 notebook 实际运行或完成顺序。注释与断言有时措辞不同，应以断言和对应操作为准。
- [marimo reactivity 文档](https://docs.marimo.io/guides/reactivity/) 描述 lazy 模式、禁用及依赖图；这是可变文档，不能替代固定测试。禁用和 stale 是不同维度，不能根据保存输出或 cell 排列判断任何状态。
- [Observable runtime `d52584db5b76d7ab0fd5a47189dddb85893ec45f` README](https://github.com/observablehq/runtime/blob/d52584db5b76d7ab0fd5a47189dddb85893ec45f/README.md#modulevariableobserver)，[完整 ISC 许可](https://github.com/observablehq/runtime/blob/d52584db5b76d7ab0fd5a47189dddb85893ec45f/LICENSE)。无 observer 的变量仅当其传递输出被观察时才按需计算；observer 的 pending/fulfilled/rejected 是异步通知。不要把 marimo 的 stale/disabled 套成 Observable 通用状态，也不能把图边或位置当作实际执行记录。

## 唯一条件候选：同一链的两个控制快照

只用上述 marimo 测试的第一段，手写固定事实而不声称是 marimo 原生导出：链 `0 → 1 → 2`；操作顺序是禁用 0、标记 1 stale、重新启用 0；在重新启用前，0 是显式禁用、1 和 2 是传递禁用，1 另被显式标记 stale；重新启用后的测试断言返回待运行集合 `{1}`。**集合不是实际运行顺序或完成记录**，测试没有提供这两者。状态事实只按测试中显式断言和操作填写，未被断言的状态标未知。

读者任务：① 禁用 0 时哪些节点被传递禁用？② 哪个节点被显式标 stale？③ 恢复后测试返回什么集合，是否能得出运行顺序？④ 依赖边和状态各来自哪里？预期答案分别是 1、2；1；{1}，不能；固定测试的图构造及断言。不要仅凭图推出未断言状态，也不要把源代码执行顺序称为运行日志。

公平基线是同样源码链接、相同四问题和事实的短表：一行每个阶段，列出操作、显式禁用、传递禁用、显式 stale 标记和返回集合；缺证据标未知。实验组使用现有 Explainer 的一幅链和可选阶段切换/对照表，不能改变事实或隐藏源码。两组均需静态文字和非颜色状态，键盘可达，打印/导出可读。图的假设优势是让读者同时定位被禁用传播和独立 stale 标记；如果同样信息的表已同样清楚，该差异不足以维护新交互。

## 可复现计划与停止条件

如后续获协调人采用，在独立 `codex/` 分支、固定当前 dev 上仅建立内容实验，不修改 renderer 或新增分析器；保存测试链接、逐项事实清单、表基线和图版，运行项目现有的适用验证并记录版本、命令、结果与跳过项。两版以相同视口截图、实际 DOM/键盘检查留证；截图证明呈现，不证明理解。以相同问题、独立读者和交叉顺序记录答案、耗时及错误，保留原始答案；样本不足仅报告观察，不作统计泛化。预先判失败：图版任何事实错误、暗示执行顺序或不能独立理解；或者不能在正确率、定位时间或可解释性上提供可观察优势时，停止，不引入产品能力。没有读者时仅能完成可用性和事实审计，不能宣称提升理解。

成本是手工核对两个快照、构造两版与浏览器/无障碍验证；每次上游版本变更都需要重新核对，故固定源码并限定一次示例。现有原生图、表与链接足够；接运行器、自动采集状态、跨 notebook 身份对齐、给所有 reactive runtime 统一枚举或推断副作用均超出范围。真实用户需求和收益频率未知，此候选只是小规模可证伪研究，不是实施承诺。
