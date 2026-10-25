# 每次3行，为什么累计约1056次行输出？ {#plan-row-counts}

**每次平均3行 × 352次循环 ≈ 1056次行输出。** 该Index Scan的每次估计也是3行。不能拿累计1056与每次估计3比较，称它出现了352倍估计偏差。

- `Actual Rows`是报告中的每次平均值，循环次数单独给出。[](source:pg-rules)
- 累计行输出可包含重复记录；这里不推断唯一记录数。
- 本页只解释已提交样例的局部计划，没有执行SQL或测量性能。

@answer scope="PEV2 upstream committed sample · 局部三节点 · 数据库版本/采集时间/SQL参数未知 · 非本次执行"
@meta locale=zh-CN
@source sample title="PEV2：plan_many_ctes完整样例" url=https://github.com/dalibo/pev2/blob/e41d4e8b3006c479f9364d68a5d538d81cb7d110/example/src/samples.ts
@source pg-rules title="PostgreSQL18：按nloops输出平均值的字段规则" url=https://github.com/postgres/postgres/blob/3d6a828938a5fa0444275d3d2f67b64ec3199eb7/src/backend/commands/explain.c#L1827-L1857

## 先统一口径，再比较数字 {#same-basis}

| Index Scan指标 | 报告原值 | 应怎样读 |
| --- | --- | --- |
| `Plan Rows` | 3 | 每次估计输出3行 |
| `Actual Rows` | 3 | 每次平均输出3行 |
| `Actual Loops` | 352 | 该节点执行352次 |
| 推导累计行输出 | 3 × 352 ≈ 1056 | 由报告均值推导，含重复输出且可能受舍入影响 |

@callout level=warning title="累计输出不是唯一记录数"
| 1056不是唯一记录数，也不是与每次估计3可直接比较的同口径值。这个节点的每次估计和报告均值相同，不证明整份计划估计准确。 |

## 这352次循环位于哪个输入？ {#local-plan}

@diagram tree id=selected-plan source=plan-row-counts.tree.json title="局部计划：父节点与两个输入"

@prose
父Nested Loop提供actual1056行、loops1。两个直接输入分别为Outer Hash Join与Inner Index Scan。树线表示父节点与输入关系，不代表行流方向或全局执行顺序；输入内部的其它节点未展示。

| 所选节点 | Parent Relationship | 每次估计行数 | 每次actual均值 | loops |
| --- | --- | --- | --- | --- |
| Nested Loop | Outer（相对于视图外父节点） | 528 | 1056 | 1 |
| Hash Join | Outer | 176 | 352 | 1 |
| Index Scan | Inner | 3 | 3 | 352 |

其它两行也保留原估计与actual差异。本页不判断其成因，不给索引或SQL调优建议，也不推导时间或关键路径。

## 怎样回到同一份原始报告？ {#provenance}

@facts
| 来源分类 | Upstream committed sample，不是本次运行或手写synthetic |
| PEV2固定revision | `e41d4e8b3006c479f9364d68a5d538d81cb7d110` |
| 完整报告SHA256 | `a1c79b5782086474c73bd5ad2f7dd3265d73663f9030f5769638a4c2633cf6b4` |
| 原始常量 | `samples.ts`中的`plan_many_ctes`，静态字节抽取，未执行TypeScript |

| 节点 | 完整报告中的JSON pointer |
| --- | --- |
| Nested Loop | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0` |
| Hash Join | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0/Plans/0` |
| Index Scan | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0/Plans/1` |

报告digest与pointer一起定位本报告内的出现位置。节点名称、表名和索引名都不是跨计划稳定ID。独立Tree与本页引用同一JSON模型。

数据库版本、采集时间、SQL、参数及ANALYZE/TIMING选项未核实，均保留未知。PG18源码只用于核对字段规则，不能当成这份样例的生成版本。原文件、完整抽取报告、许可与逐项映射随实验保留。
