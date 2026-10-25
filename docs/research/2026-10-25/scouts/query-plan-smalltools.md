# 查询计划小工具：先解释统计口径，再决定是否画图

2026-10-25。Codex 只读调研，未启动数据库、执行 SQL、安装候选工具或运行上游脚本。下面的 JSON、测试预期与示例均来自固定上游提交，不是本次执行结果，也不是已证明的生产工作负载。

**最多保留一个内容实验：解释同一 Postgres 节点的“每次平均行数”和“累计行输出”。** PEV2 官方 JSON 样例有 `Plan Rows=3`、`Actual Rows=3`、`Actual Loops=352`；由已报告值推导约1056次行输出，不意味着352倍估计错误或1056条唯一记录。用现有 Tree＋紧凑表说明足够；不建议新增数据库计划解析器、exclusive-time 算法或调优建议系统。

## 去重与检索范围

完整读取本目录当时25份 scout，提取全部 GitHub repo 引用去重。已覆盖的 `AdmTal/PostgreSQL-Query-Lock-Explainer` 排除；它是执行 SQL 后检查锁的工具，与此次读取已有执行计划不同。DBML、migration plan、trace/profile、lineage 和 retained-size 的已做方向不重新计作发现。

检索沿 PostgreSQL 官方 Using EXPLAIN / Performance Analysis Tools 指向 PEV、PEV2、depesz，再沿 PEV2 README 找 Dalibo service；DuckDB 官方 profiling 文档指向 Tübingen visualizer；SQLite 官方 EQP/profile 文档交叉核对两款小 viewer。星数未作为门槛。以下8项固定源码来源未出现在此前 scout 的 repo 清单中；别名/前后端不当作独立创新机制。

## 固定源码、许可、真实样例与筛选

这里的“样例”表示实际存在于官方仓库的文件；没有自动上升为“真实采集生产计划”。每个链接固定到本次读取 revision。

| 项目与固定 revision | 许可 | 可核对的输入/样例 | 处置 |
| --- | --- | --- | --- |
| [dalibo/pev2](https://github.com/dalibo/pev2/tree/e41d4e8b3006c479f9364d68a5d538d81cb7d110) `e41d4e8b3006c479f9364d68a5d538d81cb7d110` | [PostgreSQL](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/LICENSE) | [samples.ts](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/example/src/samples.ts)：JSON/text；[loops test](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/src/services/__tests__/02-actual-duration-loops.spec.ts)、[parallel JSON test](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/src/services/__tests__/04-actual-duration-parallel.spec.ts) | 深入统计口径；不引入整个 Vue viewer或分析器 |
| [dalibo/explain.dalibo.com](https://github.com/dalibo/explain.dalibo.com/tree/9bb16e2a3400698f0a54f6905d35c7c525b0afdc) `9bb16e2a3400698f0a54f6905d35c7c525b0afdc` | [PostgreSQL](https://github.com/dalibo/explain.dalibo.com/blob/9bb16e2a3400698f0a54f6905d35c7c525b0afdc/LICENSE) | [Flask service README](https://github.com/dalibo/explain.dalibo.com/blob/9bb16e2a3400698f0a54f6905d35c7c525b0afdc/README.md)、[共享计划样例](https://github.com/dalibo/explain.dalibo.com/blob/9bb16e2a3400698f0a54f6905d35c7c525b0afdc/app/static/js/samples.ts) | 与PEV2不是第二套指标机制；不复制计划托管/数据库/账户平台 |
| [AlexTatiyants/pev](https://github.com/AlexTatiyants/pev/tree/a5f5bfab054b48425d20b477a509ccf7983e4574) `a5f5bfab054b48425d20b477a509ccf7983e4574` | [MIT](https://github.com/AlexTatiyants/pev/blob/a5f5bfab054b48425d20b477a509ccf7983e4574/LICENSE) | [orders.json](https://github.com/AlexTatiyants/pev/blob/a5f5bfab054b48425d20b477a509ccf7983e4574/src/samples/orders.json)、[analyze.ts](https://github.com/AlexTatiyants/pev/blob/a5f5bfab054b48425d20b477a509ccf7983e4574/src/lib/analyze.ts) | 当前源码已是React/TS实现，不能照抄旧介绍称其必然停更；其parallel/CTE/InitPlan修正说明通用解释器维护成本 |
| [mgartner/pg_flame](https://github.com/mgartner/pg_flame/tree/d2071a4e861874aac835e69881bc8d2854546ef5) `d2071a4e861874aac835e69881bc8d2854546ef5` | [Apache-2.0](https://github.com/mgartner/pg_flame/blob/d2071a4e861874aac835e69881bc8d2854546ef5/LICENSE) | [plan.json](https://github.com/mgartner/pg_flame/blob/d2071a4e861874aac835e69881bc8d2854546ef5/docs/plan.json)、[cte.json](https://github.com/mgartner/pg_flame/blob/d2071a4e861874aac835e69881bc8d2854546ef5/docs/cte.json) | 小型JSON→flamegraph路径，但固定源存在统计合同局限；拒绝照搬时间宽度 |
| [DBatUTuebingen/duckdb-explain-visualizer](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/tree/0b3633baf3826b5d56f899ce37e618949e78a77f) `0b3633baf3826b5d56f899ce37e618949e78a77f` | [自带许可文本](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/blob/0b3633baf3826b5d56f899ce37e618949e78a77f/LICENSE)：PostgreSQL式授权/免责，Tübingen版权；GitHub SPDX为NOASSERTION，不自行改标MIT | [README最小GENERATE_SERIES样例](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/blob/0b3633baf3826b5d56f899ce37e618949e78a77f/README.md)、[字段枚举](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/blob/0b3633baf3826b5d56f899ce37e618949e78a77f/src/enums.ts) | 深入不同引擎计量边界；不将其profiling映射到Postgres loops或Waterfall |
| [agneum/plan-exporter](https://github.com/agneum/plan-exporter/tree/432e0907611b8a5f4543554bb0b46f188cbb8cbb) `432e0907611b8a5f4543554bb0b46f188cbb8cbb` | [MIT](https://github.com/agneum/plan-exporter/blob/432e0907611b8a5f4543554bb0b46f188cbb8cbb/LICENSE) | [psql输出扫描测试](https://github.com/agneum/plan-exporter/blob/432e0907611b8a5f4543554bb0b46f188cbb8cbb/pgscanner/pgscanner_test.go)；README定义dalibo/depesz/tensor targets | 解决上传分享而非计划语义；不执行或外发，Archify已有离线HTML交付足够 |
| [TabularisDB/explain-plan](https://github.com/TabularisDB/explain-plan/tree/7186a70ff197dba9b91608a9157dac774138ea86) `7186a70ff197dba9b91608a9157dac774138ea86` | [Apache-2.0](https://github.com/TabularisDB/explain-plan/blob/7186a70ff197dba9b91608a9157dac774138ea86/LICENSE) | [SQLite temp-btree样例](https://github.com/TabularisDB/explain-plan/blob/7186a70ff197dba9b91608a9157dac774138ea86/src/samples/sqlite-temp-btree.txt)、[文本解析器](https://github.com/TabularisDB/explain-plan/blob/7186a70ff197dba9b91608a9157dac774138ea86/src/lib/parse/sqlite-text.ts) | 保留raw detail旁解释模式；不将有限文本解析当SQLite稳定交换协议 |
| [simonw/tools：sqlite-query-explainer](https://github.com/simonw/tools/blob/e410e25efd604bf897b476443f406da47b578264/sqlite-query-explainer.html) `e410e25efd604bf897b476443f406da47b578264` | [Apache-2.0](https://github.com/simonw/tools/blob/e410e25efd604bf897b476443f406da47b578264/LICENSE) | [原始HTML中的确定性示例SQL/data](https://github.com/simonw/tools/blob/e410e25efd604bf897b476443f406da47b578264/sqlite-query-explainer.html)、[示例交互测试](https://github.com/simonw/tools/blob/e410e25efd604bf897b476443f406da47b578264/tests/test_sqlite_query_explainer.py)；未核实静态captured plan文件 | 运行Pyodide/SQL及自动教学推断超出本轮范围，拒绝作为执行或性能解释基础 |

额外负面来源：[depesz作者项目页](https://www.depesz.com/projects/) 指向当前GitLab网站/解析库；尝试的旧GitHub路径不存在。本轮没有固定其当前GitLab revision和许可，因此不复制其实现/fixture，不把“网站可免费访问”当开源许可结论。官方帮助中的inclusive/exclusive列只作为检索线索，不作为本实验算法合同。

## Postgres：真实字段不等于现成的全局时间线

Owning source固定到 PostgreSQL18发布标签对应 [3d6a828938a5fa0444275d3d2f67b64ec3199eb7 explain.c](https://github.com/postgres/postgres/blob/3d6a828938a5fa0444275d3d2f67b64ec3199eb7/src/backend/commands/explain.c#L1827-L1857)，不是假定上面的旧样例由PG18产生。官方 [Using EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html) 与 [EXPLAIN选项](https://www.postgresql.org/docs/18/sql-explain.html) 补充命令边界。

| 原始字段 | 正确读法 | 必须保留的未知/边界 |
| --- | --- | --- |
| `Plan Rows` | 对该节点的估计输出行数，比较时与同口径actual平均值对照 | 不因实际总行输出大就直接判优化器错；LIMIT/提前停止也会改变可比性 |
| `Actual Rows` / `Actual Loops` | owning source将instrument tuples除以nloops输出平均值，同时输出loops；可能有显示舍入 | `平均值×loops`是由报告推导的累计行输出，不必精确，更不是唯一表行数 |
| `Actual Startup Time` / `Actual Total Time` | 原始节点启动/总耗时的每次平均值，毫秒；不是绝对开始/结束时间戳 | `TIMING OFF`可以保留actual rows却没有节点time；缺失不能补0 |
| `Startup Cost` / `Total Cost` | planner成本，任意成本单位 | 不能以毫秒显示，也不能与actual time直接作“误差百分比” |
| `Plans[]` / `Parent Relationship` | 所提供计划的输入/子计划结构，含Outer/Inner/InitPlan等 | 数组顺序不构成跨进程全局执行顺序；不能给它发明Waterfall的ts |
| `Workers Planned` / `Workers Launched` / `Workers[]` | 计划worker数、实际启动worker数、提供的worker明细分别保留 | planned不等于launched；缺worker明细不表示0工作；不能再把明细累加到已聚合节点上 |

`ANALYZE`会执行SQL；本轮只读既有输出，没有运行这个命令。字段中有actual只是“该上游报告提供了actual”，不建立本次执行真实性或环境可比性。PG18源也明确将analyze下未执行节点输出0循环，不能把plain EXPLAIN缺actual与never-executed混成一个状态。对于任意缺字段/扩展节点，先保留unknown，不靠节点名称推断运行结果。

### 可复核的串行例子：一次3行，重复352次

PEV2 [samples.ts中的 `plan_many_ctes`](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/example/src/samples.ts) 是可直接静态读取的已提交JSON字符串。定位路径：

```text
/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0/Plans/1
```

该节点是Index Scan（Inner），提供：

```json
{"Node Type":"Index Scan","Plan Rows":3,"Actual Rows":3,
 "Actual Loops":352,"Actual Total Time":0.003}
```

其父Nested Loop提供Actual Rows1056、loops1。这份样例的节点平均actual3与estimated3相同；3×352约为1056次累计行输出。不能拿1056与估计3比较后称“352倍估计错误”；也不能由该局部一致证明整份计划估计准确。原样例没有在本次重新执行，数据库版本/负载/数据生成来源未核实。

独立的 [loops测试](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/src/services/__tests__/02-actual-duration-loops.spec.ts) 则使用Materialize平均100行、loops402，而底层Seq Scan只loops1；由此可见重复输出不等于重复读取40200条唯一底层记录。它是测试中text常量，不冒充原始JSON捕获。

### Inclusive / exclusive 与并行：为什么不直接移植算法

[PEV2 plan-service](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/src/services/plan-service.ts) 的exclusive duration是派生值：调整loops与Gather启动worker数后减去子节点，负值截0；还另有CTE时间修正与InitPlan特殊处理。带星号的派生字段不能伪装数据库原始独立计时。当前 [PEV analyze.ts](https://github.com/AlexTatiyants/pev/blob/a5f5bfab054b48425d20b477a509ccf7983e4574/src/lib/analyze.ts) 同样区分参与进程和loops，并处理InitPlan归因。只做“父时间减子时间”不足以建立通用self-time真值。

PEV2 [parallel JSON fixture](https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/src/services/__tests__/04-actual-duration-parallel.spec.ts) 的Gather Merge提供计划/启动worker各2；其Sort子节点ActualRows3333333、loops3、平均total2020.558ms。测试期望的派生exclusive不是机械乘3，而采用其worker口径修正后再扣Seq Scan时间。两条Workers记录仅含Sort方式/空间，没有每worker actual time/rows，不能补造完整worker统计。

3333333×3=9999999，而Gather提供10000000行；这说明报告均值的显示精度不保证可逆为精确计数，不能自动判“丢1行”。[Postgres Parallel Plans](https://www.postgresql.org/docs/18/parallel-plans.html) 还区分partial work、leader汇总和不同join的重复工作。因此多进程累计工作量不能当wall-clock，worker时间也不能画成同一串行轨迹。

作为负面参照，[pg_flame Node结构](https://github.com/mgartner/pg_flame/blob/d2071a4e861874aac835e69881bc8d2854546ef5/pkg/plan/plan.go) 将Actual Rows设为int，未建模Workers；[convertPlanNode](https://github.com/mgartner/pg_flame/blob/d2071a4e861874aac835e69881bc8d2854546ef5/pkg/html/html.go) 直接用ActualTotalTime作为宽度值，未乘ActualLoops，并对InitPlan另加值。这是固定源码静态局限，不是本轮跑出的故障；不足以支撑fractional rows、多loops与parallel的通用转换。

## DuckDB：逻辑计划、物理计划与profiling不能混一个格式

Tübingen [字段枚举](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/blob/0b3633baf3826b5d56f899ce37e618949e78a77f/src/enums.ts) 明确对应 `children`、`operator_cardinality`、`operator_timing`、`cpu_time`、`cumulative_cardinality`、`latency` 等，估计行数位于 `extra_info["Estimated Cardinality"]`。其[plan-service](https://github.com/DBatUTuebingen/duckdb-explain-visualizer/blob/0b3633baf3826b5d56f899ce37e618949e78a77f/src/services/plan-service.ts) 依据cpu_time是否出现区分处理路径；这不是跨版本或所有可配置profiling结果的已证明充分条件。

官方DuckDB1.5 [metrics固定文档源](https://github.com/duckdb/duckdb-web/blob/622854258f903badad6a8a0e4395a8b1a3fe9910/docs/1.5/dev/metrics.md) 将operator timing、cpu time与latency列为不同指标；cpu_time是递归累计operator timings，latency是query root的整条查询时间。二者不能相加；父/子cpu_time再相加会重复计数。该文档分别声明单位，不能把所有带timing的字段统一套Postgres毫秒。

官方 [profiling文档源](https://github.com/duckdb/duckdb-web/blob/622854258f903badad6a8a0e4395a8b1a3fe9910/docs/1.5/dev/profiling.md) 与 [EXPLAIN/ANALYZE文档源](https://github.com/duckdb/duckdb-web/blob/622854258f903badad6a8a0e4395a8b1a3fe9910/docs/1.5/sql/statements/profiling.md) 区分未执行计划与执行统计。逻辑表达/物理operator树也要声明来源模式；不能从外观相似的树反推某项实际执行、物理线程分配或join先后。没有pipeline事件就不做全局时间线。

README的GENERATE_SERIES例子只有 `name/children/extra_info`，是无actual的示例；不是profiling capture。metrics文档的JSON示意含省略号，也不是可直接解析的完整fixture。未为“有样例”而把示意拼成实测输入，故此轮不新增DuckDB适配实验。

## SQLite：EQP结构可读，但不是实际指标协议

官方 [EQP合同](https://sqlite.org/eqp.html) 明确面向交互调试，格式可跨版本改变。四列是id、parent、未使用整数、detail；CLI字符树只是呈现。普通EQP没有实际行数/loops/time。官方 [profile说明](https://sqlite.org/profile.html) 的实际scanstats需要相应编译支持和执行后指标；cycles不能当毫秒，节点值也不能随意求和成整条查询时间。

可复核官方回归来源是 SQLite [9626d89e02f0a4226d52572629bd2f3220cb60d9 / eqp.test](https://github.com/sqlite/sqlite/blob/9626d89e02f0a4226d52572629bd2f3220cb60d9/test/eqp.test)，[公共领域声明](https://github.com/sqlite/sqlite/blob/9626d89e02f0a4226d52572629bd2f3220cb60d9/LICENSE.md)。它是预期fixture，部分标识符被规范化为 `xxxxxx`；不称原始生产采集。

Tabularis的[有限文本解析器](https://github.com/TabularisDB/explain-plan/blob/7186a70ff197dba9b91608a9157dac774138ea86/src/lib/parse/sqlite-text.ts) 解析字符树/有限分隔列，不能代替SQLite承诺的稳定grammar。其底层包在[独立固定monorepo源码](https://github.com/TabularisDB/tabularis/blob/0670bbc4403f6b35ce200439accec81027428681/packages/explain/src/parsers/sqlite.ts) 保留 `execution_time_ms=null` / `has_analyze_data=false` 是正确缺失语义；但细分detail有损（如TEMP B-TREE统一成Sort、空格切分对象名）。该HEAD也未证明与页面依赖的发布包完全一致，故不作为本实验parser基础。

simonw单文件在[源码](https://github.com/simonw/tools/blob/e410e25efd604bf897b476443f406da47b578264/sqlite-query-explainer.html) 中用execute＋fetchmany(201)计时，显示至多200行；该时间不保证覆盖完整结果消耗，更不是每operator统计。其相关子查询教学文案说2000次搜索，但SQL有LIMIT10，未由scanstats验证。此处静态记录，未执行示例；只参考raw detail旁附解释的阅读方式，不引入Pyodide执行和泛化优化建议。

## 唯一条件式候选：同一节点“每次3行 / 累计约1056次输出”解释页

用户问题是审阅现有计划时混比单位，不是缺少另一款完整SQL viewer。最小方案与retained-size一样只做**手写固定原生Tree＋Explainer**，不先造通用adapter。使用 `plan_many_ctes` 的完整上游文件/选择常量作为来源，保留许可与SHA；图只保留该Nested Loop和明确提供的两个输入子节点，标注局部片段，其余计划不展示但不声称不存在。

首屏同表展示estimated per execution=3、actual per execution=3、loops=352、由报告值推导约1056次行输出；关系只表示计划输入，不叫函数调用/执行时间线。不计算exclusive、关键路径、全局unique rows、跨worker平均或“建议加索引”；原始time如保留也单列为每次平均毫秒，不以总条形宽度暗示wall-clock。

原报告digest＋JSON occurrence pointer定位所选节点，不用Relation Name或Index Name当稳定节点ID。数据库版本、采集时间、SQL/参数、ANALYZE/TIMING配置未核实就写未知；只把样例称upstream committed sample。无actual或loops0应分别解释，不能补造为成功运行。若后续加入其他report，需要另行审查输入合同，这个固定样例不形成通用支持承诺。

图像验收（尚未执行）：同一首屏可看到3/3/352/约1056与局部范围；打开内嵌图和独立图必须复用同一JSON模型；显示原数据和推导式，不能仅靠颜色；来源pointer、舍入/重复输出边界可读。运行public render/finalize，保留原始receipts在checkout外和明确的portable摘要；实际截图后再判断教学价值。没有用户比较实测，不称提升诊断效率。

## 与现有工作及PR的区别

- DBML/schema/migration说明对象结构或DDL动作；本候选只读单份已有计划统计，不连库、不分析锁、不执行SQL。
- trace/profile已有采样与时间归因研究；本次新增的是Postgres每次平均值/loops/输出行的数据库口径，不将计划树伪装span或采样calling context。
- retained-size同样防止错误求和，可复用其内容组织和单一spec做法；数据语义不同，不新增Tree或图布局能力。
- 此轮GitHub API搜索 `"query plan"` 只命中已关闭[#269](https://github.com/tt-a1i/archify/pull/269)（subarchitecture），`DuckDB`命中0；`EXPLAIN`因大量Explainer议题产生315个噪声命中，不能拿来证明无重叠。通用代码/依赖分析[#998](https://github.com/tt-a1i/archify/pull/998)不是数据库运行器；本研究不扩它的合同。关键词结果缺项不是绝无重复的证明。

本轮不建议共享产品修改，只保留上面一个固定内容候选，其余来源作负面/边界记录。作者与另一个Codex agent只读核对官方SQLite合同与两款viewer源码；未做DB、上游工具、浏览器或用户工作流验证。研究文档只需来源/内容和whitespace核对，不为它跑全仓测试。
