# Notebook：对象别名、派生值与 stale 证据的阅读边界

2026-10-25，只读一手调查。先读取本目录当时全部 26 份 scouts 的结论与来源清单，检索 notebook/reactive/stale 及相关范围排重；不按 star 筛选。下列六个项目此前未作为来源列入；nbsafety-project/nbsafety 当前 API 重定向至 ipyflow，因此不另计一个新工具。另用 nbformat 规范限定保存格式的身份与计数。未安装或执行任何上游代码、notebook、kernel、server、测试或示例；未生成 Archify 图、截图或用户收益证据。本文为唯一新增文件。

**最多保留一个条件内容实验：在一张小 Explainer 中并排说明“对象别名已随原对象更新”与“物化派生值仍基于旧对象内容”。** 不推荐 notebook importer、Python/Julia/Rust/Haskell analyzer、staleness evaluator 或 reactive scheduler。当前没有自然 Archify 用户 notebook 阅读任务，也没有证据表明现有 Explainer 无法表达；若只画 cell DAG，拒绝该方向。

## 去重后的实际差异

- `code-maps.md` 的 dependency-map 已表达生产者/消费者、未解析与过滤账目；本轮不再制作 cell dependency converter。
- `traces-timelines.md` 与 trace-waterfall 已表达已有记录的执行区间；本轮没有时间区间，不将 cell 顺序或 execution count 造成年表/瀑布图。
- `symbol-evidence-smalltools.md` 已区分语法出现、解析目标、实际执行；`lineage-evidence-smalltools.md` 已区分值来源、间接影响及未知来源。这些区别本身不能再算新功能。
- `test-code-evidence-smalltools.md` 的 observed context 矩阵、state-contract 的事件声明已覆盖“已观察”和“声明”基本分层。本轮唯一额外机制是**同一次 mutation 对 alias 与 copy-derived value 的不同 stale 结果**，需要对象身份与物化时点，普通相同拓扑无法单独回答。

Archify 基线仍引用 dev [`82c7e0f089a02a4d514714adf37dc2061682da5f`](https://github.com/tt-a1i/archify/tree/82c7e0f089a02a4d514714adf37dc2061682da5f)。此调查不改变产品合同，不把当前研究授权解释为正式实现/PR/安装授权。

## 六个固定来源与许可证

版本为本次读取的默认分支快照，不等于 release 或支持承诺。所有许可均实际读取同 SHA 的许可正文。表内“机制”来自选定源码/fixture，不是本次运行结果。

| 来源与固定 SHA | 许可 | 已核对输入、状态与实际 fixture | 判断与边界 |
| --- | --- | --- | --- |
| [marimo-team/marimo](https://github.com/marimo-team/marimo/tree/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe) · `a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe` | [Apache-2.0](https://github.com/marimo-team/marimo/blob/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe/LICENSE) | Python cell source/global definitions+references → graph；[FAQ](https://github.com/marimo-team/marimo/blob/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe/docs/faq.md#L137-L150) 明确是 static analysis。[graph.py](https://github.com/marimo-team/marimo/blob/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe/marimo/_runtime/dataflow/graph.py) 分 stale、disabled、errored，注册时传播 ancestor stale/disabled；enable 返回 stale 且可运行的集合。 | 图边不是 runtime read trace；disabled 不等于 stale，也不等于执行失败。已有依赖面板，不值得复制一张 DAG。 |
| [ipyflow/ipyflow](https://github.com/ipyflow/ipyflow/tree/7eb0251739ee27725d92cc26f22b8906029e8cf1) · `7eb0251739ee27725d92cc26f22b8906029e8cf1` | [BSD-3-Clause](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/LICENSE.txt) | [Cell model](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/core/ipyflow/data_model/cell.py#L78-L158) 分 frontend cell_id、cell_ctr、position、current_content/executed_content、static/dynamic parent；dirty 是 current 与 executed 内容不同。[staleness tests](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/core/test/test_staleness_propagation.py) 有 alias、subscript granularity、branch 和外部调用边界。 | 最有价值的是 stale witness，非泛化“精准全追踪”。静态/动态两类边必须保留来源；测试预期不等于本次验证。 |
| [JuliaPluto/Pluto.jl](https://github.com/JuliaPluto/Pluto.jl/tree/90dc3cfe6bdaaf9ae3ff9a96e785ea70762c11d7) · `90dc3cfe6bdaaf9ae3ff9a96e785ea70762c11d7` | [MIT](https://github.com/JuliaPluto/Pluto.jl/blob/90dc3cfe6bdaaf9ae3ff9a96e785ea70762c11d7/LICENSE) | [DependencyCache.jl](https://github.com/JuliaPluto/Pluto.jl/blob/90dc3cfe6bdaaf9ae3ff9a96e785ea70762c11d7/src/analysis/DependencyCache.jl) 按 symbol 返回直接 upstream/downstream cells，GUI cache 含 UUID 与 precedence heuristic；[Basic no cell order.jl](https://github.com/JuliaPluto/Pluto.jl/blob/90dc3cfe6bdaaf9ae3ff9a96e785ea70762c11d7/sample/Basic%20no%20cell%20order.jl) 的消费 cell 排在定义 n/seq 之前。 | 文件/视觉排列不等于依赖执行序。precedence heuristic 不是实测起止时间；原工具已提供依赖阅读，不推荐适配。 |
| [davidbrochart/akernel](https://github.com/davidbrochart/akernel/tree/9a9c9607bd0e612816cc252bc9acb80ea6ae8d7c) · `9a9c9607bd0e612816cc252bc9acb80ea6ae8d7c` | [MIT](https://github.com/davidbrochart/akernel/blob/9a9c9607bd0e612816cc252bc9acb80ea6ae8d7c/LICENSE) | 当前 [README](https://github.com/davidbrochart/akernel/blob/9a9c9607bd0e612816cc252bc9acb80ea6ae8d7c/README.md) 是 AnyIO async Python kernel，区分 process/task/thread 与中断限制；[test_execution.py](https://github.com/davidbrochart/akernel/blob/9a9c9607bd0e612816cc252bc9acb80ea6ae8d7c/tests/test_execution.py) 测 compile/prepare/execute、共享 globals 和错误定位。 | 不拿旧 reactive 演示推断当前版本具有依赖 DAG/stale exporter；本次检查路径没有提供这类产物合同，排除。async 不自动意味着 reactive dependency。 |
| [ml-rust/venus](https://github.com/ml-rust/venus/tree/5ad7bc524ecded09c82b9e353096814f5ce04c55) · `5ad7bc524ecded09c82b9e353096814f5ce04c55` | [Apache-2.0](https://github.com/ml-rust/venus/blob/5ad7bc524ecded09c82b9e353096814f5ce04c55/LICENSE) | [graph/types.rs](https://github.com/ml-rust/venus/blob/5ad7bc524ecded09c82b9e353096814f5ce04c55/crates/venus-core/src/graph/types.rs) 以函数参数名寻找 producer，dependency 保存 is_ref/is_mut，CellId 为递增 usize；[notebook_execution.rs](https://github.com/ml-rust/venus/blob/5ad7bc524ecded09c82b9e353096814f5ce04c55/crates/venus-core/tests/notebook_execution.rs) 有 base→doubled→plus_ten 与 diamond fixture。 | 签名依赖不等于已观察 Rust side effects；递增 ID 不应直接作为跨文件改版的稳定身份。重做参数 DAG 与 dependency-map 重复，不推荐。 |
| [DataHaskell/sabela](https://github.com/DataHaskell/sabela/tree/f657cdfd92c29a0abef11bb266b31dad00e0b5d7) · `f657cdfd92c29a0abef11bb266b31dad00e0b5d7` | [MIT](https://github.com/DataHaskell/sabela/blob/f657cdfd92c29a0abef11bb266b31dad00e0b5d7/LICENSE) | [Topo.hs](https://github.com/DataHaskell/sabela/blob/f657cdfd92c29a0abef11bb266b31dad00e0b5d7/src/Sabela/Topo.hs) 分 ordered/cycle/blocked，按定义/引用及 provider/mutator 建边；[Order.hs](https://github.com/DataHaskell/sabela/blob/f657cdfd92c29a0abef11bb266b31dad00e0b5d7/test/Test/TopoSpec/Order.hs) 测逆序链、first-wins redefinition、循环及不相关 cell。 | 同一名字多处定义不是所有 kernel 都采用“最近执行者”策略；这里 first-wins 是特定实现合同。拓扑计划不是实际完成记录，不引入 Haskell runtime。 |

## 具体源码/fixture 核对

### 1. 图相似，更新后的值却不同：唯一条件候选

ipyflow 的 `test_same_pointer` 使用原列表 a、其别名 b、由 b 拼接生成的新列表 c，之后原地修改 a 的第一个元素。测试依次检查：读取 b 不应检测 stale，读取 c 应检测 stale。对应 [固定上游测试 L695–709](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/core/test/test_staleness_propagation.py#L695-L709)，该函数没有 skip decorator。同文件 [L27–43 helper](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/core/test/test_staleness_propagation.py#L27-L43) 实际检查并清除 waiter usage detected 标记：这是“使用时 stale dependency detection”的上游期望，不是生产者导出的每 cell stale-status JSON。该位置与 BSD 许可由同轮协调 agent 独立复核，本 agent 也已读取此函数及 helper。

这不是“每条从 a 出发的边都脏”：b 与 a 仍指同一对象，c 是更早时刻由内容产生的新值。只显示 a→b→c 的 cell 或变量 DAG，容易让读者把这两类关系视作相同；仅播放执行顺序，也不会自动解释差异。另有 `test_subscript_dependency_fp` 表明读取 lst[0] 的结果不应因 lst[1] 改动就 stale；不能只按变量名涂整片红。

可证伪的小内容实验限于一张现有 Explainer：左边显示原始操作顺序和固定测试出处，右边用两行事实表分别说明 alias 对象身份与 c 的物化依赖版本；问题只问“改 a 后，b/c 哪个沿用旧计算内容，为什么”。用文字/关系标签明确 alias 与 derived-copy，不把现有 Dataflow 的 dashed 默认语义改成 alias。若没有更复杂生产 notebook，不扩大节点数或引入运行器；与当前普通 DAG 的阅读对照若不能提高事实回答准确性，就停止。

**来源性质必须醒目：这是上游 synthetic regression 的预期，不是本轮运行的 notebook 记录，更不是实际用户遇到的事故。** 如后续实施，不能伪造 kernel timestamp、真实 object address、execution receipt 或绿色 stale 判断；只对固定 fixture 解释已断言的结果。没有 notebook exporter 合同就不要把手写 derived JSON 宣称 ipyflow 原生报告。

### 2. dirty、stale、disabled、failed 不是一组通用枚举

ipyflow `Cell.is_dirty` 只比较 current/executed source；其 CheckerResult 另保留 unresolved refs、used/live cells。dirty 源码与依赖已 stale 可以独立发生。marimo [test_set_stale](https://github.com/marimo-team/marimo/blob/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe/tests/_runtime/test_dataflow.py#L326-L350) 则对静态后继传播 stale、保留不相关 cell；[test_register_with_stale_ancestor](https://github.com/marimo-team/marimo/blob/a61726dcda47eb1c8f0ded3d1e732fe7f177ebbe/tests/_runtime/test_dataflow.py#L408-L426) 说明新增 consumer 也继承已 stale ancestor。graph.py 单独设置 disabled-transitively，判断 error 又检查 run_result_status。不可统一压成“失败/待执行”。

上游状态不能从 ipynb 的输出存在、execution_count 大小或当前源代码单独推断。[nbformat 格式说明，固定 cfb73afdd2a7f358953f2a34f747fd0d0e9d6288](https://github.com/jupyter/nbformat/blob/cfb73afdd2a7f358953f2a34f747fd0d0e9d6288/docs/format_description.rst#L106-L116) 只允许 code cell 的 execution_count 为整数或 null；[4.5 cell ID 规则](https://github.com/jupyter/nbformat/blob/cfb73afdd2a7f358953f2a34f747fd0d0e9d6288/docs/format_description.rst#L332-L343) 要求 notebook 内唯一 ID。[BSD-3-Clause](https://github.com/jupyter/nbformat/blob/cfb73afdd2a7f358953f2a34f747fd0d0e9d6288/LICENSE)。此规范参考由同轮协调 agent 固定核对：保存的 prompt count 不是 cell 身份、依赖证明或完整执行历史；本文没有独立执行其验证器。

### 3. 静态定义、动态读取与副作用覆盖必须分列

marimo 的静态图、Venus 的参数图与 ipyflow 的 tracer graph 不能无损共用一种“真实依赖”标签。ipyflow 同一个 Cell 对象已分别存 raw_static_parents 与 raw_dynamic_parents；其 [test_cell_dag.py](https://github.com/ipyflow/ipyflow/blob/7eb0251739ee27725d92cc26f22b8906029e8cf1/core/test/test_cell_dag.py#L38-L54) 专门断言 nested mutation 的 virtual symbol。实际 stale 测试还有已知失败标记、false-positive/false-negative helper，以及未追踪 pyccolo.exec 修改的反例；不能从大量测试推断任意 extension、I/O、反射、native library 或外部系统都被追踪。

Sabela first-wins 重定义测试与 ipyflow 多执行版本不同，也不能把相同 source line 当通用 cell 身份。Pluto sample 的 UUID 与 Venus 的分配 ID 更不能通过位置自动对齐。若日后拿两个 notebook snapshot 比较，必须先规定生产者 identity 与 revision；不使用 source hash 冒充永久 ID（相同内容可在多个 cell 出现，编辑也会改变 hash）。

## 不推荐的扩展与验证边界

拒绝：自动运行用户 notebook 采依赖；从源码猜完整 side effects；接 kernel/Jupyter server；把 static descendants 当必须重跑集合；从已有输出猜 fresh；全语言统一 defs/uses 解析；重做依赖图/拓扑排序；凭截图认定运行正确。

本轮推荐强度为**一个有条件的原创阅读对照**，不是新增产品接口。现有 Archify 能用关系标签、表格与源码引用表达全部所需内容；没有实施、浏览器、可访问性、人类阅读、效率或真实 notebook 验收。若协调人继续，先确认是否存在实际 notebook 交接中的 alias/copy 误读；无此需求时不必为了凑实验新增 converter。
