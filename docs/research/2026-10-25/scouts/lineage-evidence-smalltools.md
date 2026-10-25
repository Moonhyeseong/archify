# Lineage：列变换、间接影响与未知来源的证据阅读

2026-10-25。先按研究中心全部21份已有 scouts 的 GitHub owner/repo 排重，共208个唯一 repo；下列8个来源此前未列入。不按stars筛选；SQLGlot、OpenLineage、Hamilton为语义/输出参照，其规模不应被描述成“小依赖”。只读 GitHub README、固定源码与测试，**没有安装或执行上游代码，没有数据库连接、凭据、云服务或SQL执行**。本报告只新增研究文档，不提出立即引入SQL parser。

结论：最多保留两个内容机制：①区分输出值的列来源与filter/join等间接影响；②把定义表达式与尚未解析的来源同时摆在关系旁。现有Archify Dataflow/Explainer能表达这两点，适合先做一个原创手写示例；没有证据证明需要第三方集成、专门lineage模式或新交互。尚未实测阅读收益，不能把本轮调研说成产品改善。

## 固定来源、许可与实际输出

下面的“输出”是已读源码/协议的结构，**不是本次实跑结果**。固定commit是调查时点快照；表内每项都链接一手实现和许可。

| 来源、commit / 许可 | 输入→实际输出 | 值得看的机制与边界 |
| --- | --- | --- |
| [reata/sqllineage](https://github.com/reata/sqllineage/tree/7b0d89a9cc821f8df5384ffa78b6abf75d935388)，[MIT](https://github.com/reata/sqllineage/blob/7b0d89a9cc821f8df5384ffa78b6abf75d935388/LICENSE) | SQL文本、dialect、可选metadata provider→source/target/intermediate tables；[runner](https://github.com/reata/sqllineage/blob/7b0d89a9cc821f8df5384ffa78b6abf75d935388/sqllineage/runner.py#L171) 的 `get_column_lineage` 返回 `list[tuple[Column,...]]` 路径，可选目标列及是否排除subquery列/终点，另有Cytoscape输出。 | 不必一次画全仓，围绕目标列追路径；过滤选项会改变可见覆盖。metadata能帮助展开`*`及归属未限定列；不能把无metadata的结果当完整列集合，也不能把路径当执行顺序。 |
| [tobymao/sqlglot](https://github.com/tobymao/sqlglot/tree/78b24a744adb8d5dc0eb285f067087338b60f266)，[MIT](https://github.com/tobymao/sqlglot/blob/78b24a744adb8d5dc0eb285f067087338b60f266/LICENSE) | 输出列名或None、SQL/AST、schema、sources映射、dialect→[Node或输出列到Node映射](https://github.com/tobymao/sqlglot/blob/78b24a744adb8d5dc0eb285f067087338b60f266/sqlglot/lineage.py#L23)。Node有 `name/expression/source/downstream/source_name/reference_node_name/payload`；HTML节点是 `id/label/title/group`，edge为 `from/to`。 | transformation与所在query同时可读，目标列局部展开。Node的downstream沿“输出→来源”追溯，不能直接当数据移动方向；HTML id是进程对象id，不是稳定数据身份。缺来源可产生Placeholder，不应涂成确知源表。 |
| [macbre/sql-metadata](https://github.com/macbre/sql-metadata/tree/93453e707c0f8c8dd756f36c5f7e7841ca531eea)，[MIT](https://github.com/macbre/sql-metadata/blob/93453e707c0f8c8dd756f36c5f7e7841ca531eea/LICENSE) | SQL→[README展示的Parser属性](https://github.com/macbre/sql-metadata/blob/93453e707c0f8c8dd756f36c5f7e7841ca531eea/README.md)：`tables/columns/columns_dict/columns_aliases_names/columns_aliases`等；columns_dict分select/where/order_by/group_by/join/insert/update，aliases映射可展开表达式的输入列。该快照README明确底层为sqlglot。 | 按出现子句区分列用途，很适合提醒WHERE列不等于输出值列。元数据清单不是完整output→input lineage，alias resolution也不保证数据库真实列存在；不能据此生成所有变换边。 |
| [Oisix/dbt-column-lineage](https://github.com/Oisix/dbt-column-lineage/tree/20288c6d670d8bbdc386d5ec1caae834908ea580)，[MIT](https://github.com/Oisix/dbt-column-lineage/blob/20288c6d670d8bbdc386d5ec1caae834908ea580/LICENSE) | 既有manifest/catalog及compiled SQL→[React Flow node/edge](https://github.com/Oisix/dbt-column-lineage/blob/20288c6d670d8bbdc386d5ec1caae834908ea580/src/dbt_column_lineage/lineage.py#L277)：node data `name/materialized/schema/columns/first/last/docsUrl`；edge `id/source/target/sourceHandle/targetHandle`。CTE附加记录含 `column/nextColumns/nextSources/reference`。 | 从一个列逐步加列，按CTE看局部变换，避免只读全局DAG。节点column列表可合并，不是数据样本；部分解析错误被日志记录后继续，不能把空图当零依赖或完整成功。设计模式手工草图也不能冒充现有dbt事实。本轮不运行docs generate或Looker连接。 |
| [b-ned/dbt-colibri](https://github.com/b-ned/dbt-colibri/tree/d976fa092511273364ba9ebe0871a7a0f1327a69)，[MIT，含SQLGlot原作及修改版权](https://github.com/b-ned/dbt-colibri/blob/d976fa092511273364ba9ebe0871a7a0f1327a69/LICENSE) | manifest/catalog→`colibri-manifest.json`与独立HTML；[lineage Node](https://github.com/b-ned/dbt-colibri/blob/d976fa092511273364ba9ebe0871a7a0f1327a69/src/dbt_colibri/lineage_extractor/lineage.py#L21) 在expression/source/downstream外有lineage_type；[extractor结构结果](https://github.com/b-ned/dbt-colibri/blob/d976fa092511273364ba9ebe0871a7a0f1327a69/src/dbt_colibri/lineage_extractor/extractor.py#L1371) 返回 `lineage:{parents,children}` 与 `errors`，错误含node_id/error_type/error_message。 | pass-through/rename/transformation分类与错误列表就地保留，比只画成功边实用。但分类是语法派生方式，不是兼容性、数值相同或隐私保证；不要把其内部Node当最终manifest规范。API自动许可识别为NOASSERTION，本次直接读LICENSE确认MIT。 |
| [tgerke/dplyneage](https://github.com/tgerke/dplyneage/tree/ef3d30d9f8a055c55065fb804256ad8b2e299da0)，[MIT](https://github.com/tgerke/dplyneage/blob/ef3d30d9f8a055c55065fb804256ad8b2e299da0/LICENSE.md) | dplyr/lazy pipeline或SQL→lineage对象、HTML widget、JSON/OpenLineage；[lineage_edges](https://github.com/tgerke/dplyneage/blob/ef3d30d9f8a055c55065fb804256ad8b2e299da0/R/lineage_api.R#L42) 返回 `source_table/source_column/target_table/target_column/transformation/expression`，手工edge无推导表达式时为NA；原对象edge有source/target/handles/data。 | identity/aggregation/transformation和indirect filter/join/group_by/sort分开；表达式在旁而非让人猜。dataframe可能仅保留第一个间接kind，全套在JSON/OpenLineage，不能以简化表冒充无损输出。不同engine不通用，不能编译到SQL的pipeline遇不支持操作会拒绝而非猜。 |
| [OpenLineage/OpenLineage](https://github.com/OpenLineage/OpenLineage/tree/0ead16e415e828447b7134e099bfb12839de4c25)，[Apache-2.0](https://github.com/OpenLineage/OpenLineage/blob/0ead16e415e828447b7134e099bfb12839de4c25/LICENSE) | instrumented producer事件→run/job/dataset及facets。[ColumnLineageDatasetFacet](https://github.com/OpenLineage/OpenLineage/blob/0ead16e415e828447b7134e099bfb12839de4c25/spec/facets/ColumnLineageDatasetFacet.json) 的fields映射输出列→inputFields，input字段 `namespace/name/field/transformations`；另有dataset级影响。每个transformation含type，及可选subtype/description/masking。 | DIRECT/INDIRECT和dataset级影响不混同；[ExtractionErrorRunFacet](https://github.com/OpenLineage/OpenLineage/blob/0ead16e415e828447b7134e099bfb12839de4c25/spec/facets/ExtractionErrorRunFacet.json) 记录totalTasks/failedTasks/errors。规范存在不等于每个集成都发完整列级关系，更不等于观察到逐行/逐值因果。大型标准只借概念，不推荐接运行服务。 |
| [apache/hamilton](https://github.com/apache/hamilton/tree/fa786eae13145af0961238b823b3aa8112199f43)，[Apache-2.0](https://github.com/apache/hamilton/blob/fa786eae13145af0961238b823b3aa8112199f43/LICENSE)（旧DAGWorks-Inc地址转向此repo） | Python函数定义及配置构图→[HamiltonNode.as_dict](https://github.com/apache/hamilton/blob/fa786eae13145af0961238b823b3aa8112199f43/hamilton/graph_types.py#L115) 输出 `name/tags/output_type/required_dependencies/optional_dependencies/source/documentation/version`；默认不输出任意optional default值。 | 数据变换节点旁保留来源函数、required/optional；配置选择后的图不等于所有可能图，也不是已执行的run。构建它涉及导入Python模块，本轮没有运行，不推荐为画图执行陌生pipeline；只读既有冻结输出或原创声明。 |

## 深读：三个容易误画的边界

### 一、表达式与query上下文必须相邻，但不是原文定位保证

SQLGlot Node同时携带`expression`与`source`。[to_html](https://github.com/tobymao/sqlglot/blob/78b24a744adb8d5dc0eb285f067087338b60f266/sqlglot/lineage.py#L47) 把表达式作为label、所在source重新序列化为tooltip并加粗对应表达式。它解决的是“这条列边是如何算出来的”，不是仅“源表与目标表相关”。例如 `SUM(amount * rate) AS revenue` 的两个值输入和聚合步骤都有可读解释。

源码经qualify、sources expand、trim等处理，显示SQL是AST重新序列化结果，**不是保证逐字对应原文件的行号/字节span**。未来若做证据页，应把原始SQL卡和producer显示表达式分开，不能给重写SQL安上虚构source位置。`on_node/payload`是caller注入数据能力，不是自动来源证明。

未知也有具体表示：[to_node末端](https://github.com/tobymao/sqlglot/blob/78b24a744adb8d5dc0eb285f067087338b60f266/sqlglot/lineage.py#L493) 在没有source时以Placeholder形成叶子；另有单一named source推定分支。图能终止不意味着已经到达真实物理源。将Placeholder统一换成“原始数据表”会丢掉这个区别。

### 二、列的值来源与影响结果集的条件不同

dplyneage的[公开accessor说明](https://github.com/tgerke/dplyneage/blob/ef3d30d9f8a055c55065fb804256ad8b2e299da0/R/lineage_api.R#L42) 区分：输出定义的identity/aggregation/transformation及expression；开启include_indirect后，filter/join/group_by/sort按用途分类。OpenLineage新facet也将fields和dataset级影响分开，DIRECT/INDIRECT记录在每个输入字段transformation中。

示意：`SELECT SUM(o.amount * r.rate) AS revenue ... WHERE o.active = TRUE`。amount和rate参与数值计算；active影响哪些行进入聚合。若把三者均标成“revenue取值”，会误导；若只画前两者又不说明过滤范围，会遗漏关键解释。正确做法可以是同一张原生Dataflow中的计算operation与条件卡，图例清楚说明这仍是SQL静态依赖，而非活跃流量。

不能机械映射：OpenLineage `type` 的JSON schema类型是string，DIRECT/INDIRECT写在description而非enum；消费未知type时应保留原值/明确不支持，不能静默归到DIRECT。其旧transformationDescription/transformationType已deprecated，不能只取旧字段丢掉每个inputFields的transformations。两种工具的分类粒度也不同，不编造一套无损统一枚举。

### 三、缺schema、未展开星号和提取失败不是“无来源”

SQLLineage的[未限定列测试](https://github.com/reata/sqllineage/blob/7b0d89a9cc821f8df5384ffa78b6abf75d935388/tests/sql/column/test_metadata_unqualified_column.py) 和[星号测试](https://github.com/reata/sqllineage/blob/7b0d89a9cc821f8df5384ffa78b6abf75d935388/tests/sql/column/test_metadata_wildcard.py) 都显式传metadata provider。测试断言体现需要列目录帮助归属/展开；不能从读过测试升级成已验证全部dialect正确。

Colibri的extractor有fallback、unresolved column warning、model级错误并继续，最终错误数组比仅成功边更重要。dplyneage的[engine路由](https://github.com/tgerke/dplyneage/blob/ef3d30d9f8a055c55065fb804256ad8b2e299da0/R/lineage_engines.R) 则对不能由另一个engine接管的unsupported操作明确终止；不是任何pipeline均能转SQL。两者给出的启发是：局部可读不应抹平整体覆盖债务。错误缺失、unknown及合法常量列无输入必须分别标注。

## 与Archify现有范围比较

[Dataflow authoring defaults @82c7e0f0](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/authoring-defaults.md#L47) **已经要求**从输出反追producer实际消费值，raw payload和derived config分别输入；computed in-memory结果使用产生它的backend operation，只有有证据的存储端点用database。它也要求每条flow有label，default/dashed/security各有既定图例语义。因此本轮不是发现“Archify缺lineage”。条件依赖不能随意使用默认代表async batch的dashed，若自定义视觉约定，必须同时改本图明确图例。

[Dataflow](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/authoring-contract.md#L326) stages/rows/nodes/flows能展示小段变换；[Explainer](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/explainer-authoring.md) 已能以同目录spec嵌入Dataflow及放代码、表格。没有必要新增列handle Viewer、SQL执行器或producer registry。

既有DBML ERD表达表结构、键/引用/可空性；foreign key不是计算血缘，schema里的列也不证明查询使用。既有dependency-map表达文件依赖；不能直接换SQL列标签宣称列级解析。payload-delta是两个小样本的值差异，不是列血缘或schema兼容性；trace-waterfall有实际区间时序，也不是逐字段数值因果。只有运行事件可以支持特定run的观察，静态SQL或manifest不足以证明运行成功、输出数值、完整流量与数据新鲜度。

## 最多两个可取点：先用现有能力，不做parser

**1. 优先可试：一个指标的“值计算与筛选影响”问题页。** 用户问题为“revenue由哪些值计算，哪个条件只影响纳入哪些记录？”用原创synthetic SQL和手工核对的明确列映射；保留SQL原文与限定输入schema，Dataflow只画amount/rate→乘法→SUM→revenue，并在相邻条件operation/卡解释active及join key的角色。若用独立线型，显式图例，不把它画成异步。Explainer放逐列角色与表达式表；不生成第三方格式，不执行SQL，不推断来源。

最小对照是同一SQL的普通表级图与列角色版，看读者能否从图回答amount/rate/active分别做什么，而不把active当收入值。如果普通Explainer代码注释已一样清楚，则不增加结构；本轮没有完成这个对照，不能先声称减少阅读时间。

**2. 次选，仅内容变体：“已解析到哪一层”账目。** 同一小样例额外提供缺schema/`SELECT *`或外部UDF定义缺失的冻结说明，输出卡明确“未展开”“来源未知”“常量无输入”“提取失败”各自状态。只展示明确提供的事实，不由Archify解析SQL或猜列。已知变换仍可读，未知来源不偷偷连到某表；若producer只给成功边而没有覆盖信息，标“覆盖未知”。可使用原生节点和紧邻表格，无需新合同。

第二点与第一点可以合成一个示例的证据栏，不值得分别做两个converter或共享产品改动。没有真实失败/误读证据之前，**不推荐引入SQLGlot、dbt artifact parser、OpenLineage collector或Hamilton执行环境**。维护dialect、catalog freshness、compiled/source SQL对应、partial parser错误和node identity的成本远高于这个阅读验证。

## 证据限制与交付检查

固定来源以GitHub commit和源码路径为准；许可证直接查文件，未依赖徽章或API的NOASSERTION判断。只读public材料，未运行任何README命令，也未调用metadata provider。未生成图、HTML、数据库或云端运行凭证；没有performance、coverage或用户效果结论。纯研究文档依据CONTRIBUTING的prose范围核查来源、语义与链接，不运行产品测试。没有修改hub README、他人报告、shared code、CI或lockfile，没有commit/push。
