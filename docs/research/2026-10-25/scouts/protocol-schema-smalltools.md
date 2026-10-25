# 协议、状态机与Schema演化：14个具体工具的第三批发现

2026-10-25，只读调研；未安装工具、未运行第三方脚本、未连数据库、未执行SQL、未改产品、未外发消息或推送。延续 `archify-review` 的价值/成本/影响判断。只新增本报告。

**最值得继续的两个实验是“迁移计划风险阅读页”和“状态机事件合同检查页”；字段位区间检查作为第三候选。** 增益分别是把有序变更与风险绑定、暴露事件遗漏及未知条件、发现字段重叠/宽度不符，而不是再实现一个图形工具。

## 发现路径与去重

已读取 `scouts/` 的7份报告并抽取所有GitHub仓库URL去重：`code-maps.md`、`git-architecture.md`、`graph-reading.md`、`prlens-smalltools.md`、`task-view.md`、`text-diagrams.md`、`traces-timelines.md`。下表14个项目均未出现在这些报告的项目清单中。没有以stars排序，也没有设置星数门槛。

具体沿官方来源扩展：

- Robot README的Tools → `jbreckmckye/robot3-viz` → `getDAG`公开API/类型，而非泛搜“状态机图”。
- Squawk README的Related projects → `stripe/pg-schema-diff`、`AdmTal/PostgreSQL-Query-Lock-Explainer` → 有序计划JSON与真实执行边界。
- WaveDrom寄存器例子 → 同组织的bitfield；bytefield-svg README → 作者用于DJ Link协议分析文档的真实背景。协议字段结构不是runtime trace。
- 另核对SchemaCrawler许可文件只有外部licensing options链接、API为NOASSERTION，未把它当作许可清楚的低成本候选；migra README明确deprecated、最终版本在2022年，也未推荐继续集成。

## 一手固定版本与能力

通过认证GitHub API核验repo默认分支HEAD、README与许可元数据。许可列用于筛选，不是完整依赖许可审计；没有复制上游实现。源码链接固定commit，日期为该commit的UTC日期。

| 官方项目与README | HEAD commit | 日期 | 许可 | 实际能力 | 边界/价值判断 |
| --- | --- | --- | --- | --- | --- |
| [wavedrom/wavedrom](https://github.com/wavedrom/wavedrom/blob/142dd41870bcca7450f55c970d9e3c8070deeb05/README.md) | `142dd41870bcca7450f55c970d9e3c8070deeb05` | 2026-08-31 | MIT | WaveJSON/JSON5到SVG；数字波形、寄存器等 | 从官方README到其bitfield组件。硬件信号时序，不是分布式trace。已有成熟渲染，Archify无需再实现波形引擎。 |
| [wavedrom/bitfield](https://github.com/wavedrom/bitfield/blob/003bfa5e11dc96af2a859b53728de83f68ed61a1/README.md) | `003bfa5e11dc96af2a859b53728de83f68ed61a1` | 2024-02-22 | MIT | 字段bits/name/attr数组到寄存器SVG；有CLI、方向翻转和位宽设置 | 适合字段区间/位宽合同核验。32位示例、原始JSON可脱离硬件运行；位号和字节端序不能混为一谈。 |
| [Deep-Symmetry/bytefield-svg](https://github.com/Deep-Symmetry/bytefield-svg/blob/810748a4efd8d74904a5be0c998c010c5ce680bc/README.md) | `810748a4efd8d74904a5be0c998c010c5ce680bc` | 2025-03-24 | EPL-2.0 | Node模块，用Clojure DSL生成byte-field SVG | 真实用途是协议逆向/字节字段文档，可嵌HTML。基于SCI解释器；本轮不运行DSL、不引入新的执行语言，优先显式JSON字段。 |
| [luismartingarcia/protocol](https://github.com/luismartingarcia/protocol/blob/4e8326ea6c2d288be5464c3a7d9398df468c0ada/README.txt) | `4e8326ea6c2d288be5464c3a7d9398df468c0ada` | 2019-05-28 | GPL-3.0 | 小型命令行ASCII RFC风格协议头生成器；内置协议和自定义字段宽度 | 直观看字段布局，无法证明协议解析正确。最后HEAD较旧但非archived，不能推断仍接受维护；不复制GPL实现。 |
| [jakesgordon/javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine/blob/2ae84bbbaad13103be43b3e0a24c077002e2301a/README.md) | `2ae84bbbaad13103be43b3e0a24c077002e2301a` | 2025-06-01 | MIT | JS有限状态机；visualize插件导出Graphviz DOT | 官方docs/visualization.md展示DOT。生命周期回调和动态to函数不能在静态导出中自动证明；可消费用户冻结数据，不能import执行仓库JS。 |
| [pytransitions/transitions](https://github.com/pytransitions/transitions/blob/bd42b38f3627e6bca7274fb4d9af2e105f75da7c/README.md) | `bd42b38f3627e6bca7274fb4d9af2e105f75da7c` | 2025-09-09 | MIT | Python FSM与hierarchical/async/locked扩展；GraphMachine出Mermaid/Graphviz图 | 已读README diagrams章节；支持show_conditions/ROI等。并发/嵌套语义不能压平；输入静态JSON才适合小型适配。 |
| [fgmacedo/python-statemachine](https://github.com/fgmacedo/python-statemachine/blob/ec5d8173f740b37941818df13727db9d64ef498d/README.md) | `ec5d8173f740b37941818df13727db9d64ef498d` | 2026-10-16 | MIT | Python声明式状态机，图生成组件和类级图信息 | 已核对statemachine/contrib/diagram/graphviz.py存在。业务执行、验证与可视化是一套库；不能把图上条件当已执行条件。 |
| [matthewp/robot](https://github.com/matthewp/robot/blob/bde04654c082c3ba4a54ed57c29d91fbc59e54a9/readme.md) | `bde04654c082c3ba4a54ed57c29d91fbc59e54a9` | 2026-10-05 | BSD-2-Clause | 较小的functional/immutable FSM库，含UI集成 | 官方README Tools直接推荐robot3-viz，由此沿作者链接找到窄图数据接口；库本身不是PNG工具。 |
| [jbreckmckye/robot3-viz](https://github.com/jbreckmckye/robot3-viz/blob/5e931694734445b3cd91d20dfc916901035f31c8/README.md) | `5e931694734445b3cd91d20dfc916901035f31c8` | 2026-06-01 | BSD-2-Clause | Robot3到SVG/React；暴露getDAG/getDagre可换renderer | 已读getDAG及类型定义，有state/guard/reduce节点和event/immediate边。含循环FSM仍叫DAG，消费者不能假设无环；初始状态未编码在R3Dag字段。 |
| [k1LoW/tbls](https://github.com/k1LoW/tbls/blob/dd4bf04384b7d4aca779af785a7df83e34906c16/README.md) | `dd4bf04384b7d4aca779af785a7df83e34906c16` | 2026-10-15 | MIT | 数据库文档、ER图、lint；可导出/读回schema JSON | README提供tbls out -t json和JSON schema。对已有离线schema可读，但再做关系ERD收益有限，容易重复此前DBML方向；不连数据库。 |
| [schemaspy/schemaspy](https://github.com/schemaspy/schemaspy/blob/408e05b7dfdfb8958061b07f101b8f57b451ea44/README.md) | `408e05b7dfdfb8958061b07f101b8f57b451ea44` | 2026-03-05 | LGPL-3.0 | 数据库元数据分析与HTML关系图/文档 | JDBC/Java与Graphviz生态；范围比窄工具大，作为现有成熟方案对照，不引入整套运行环境。没有把它当新的Archify优先集成。 |
| [sbdchd/squawk](https://github.com/sbdchd/squawk/blob/240403f085c9e4b1d3a5b63023b6d75fcb035e10/README.md) | `240403f085c9e4b1d3a5b63023b6d75fcb035e10` | 2026-10-25 | Apache-2.0 | Postgres迁移/SQL linter，json reporter、PG版本和事务假设 | 沿README related找到pg-schema-diff和Lock Explainer。可解释已有报告的操作限制；空JSON数组不含检查文件数，不能等同全仓通过。 |
| [stripe/pg-schema-diff](https://github.com/stripe/pg-schema-diff/blob/9ada4710c28718312557c84cca1be4b2557eed54/README.md) | `9ada4710c28718312557c84cca1be4b2557eed54` | 2026-08-06 | MIT | Postgres在线迁移计划；顺序DDL、超时和hazards；可单独生成计划 | 源码Plan/Statement有可核验JSON形状。Archify只读已有计划和保留顺序/风险，不重做schema差异、planner或执行器。 |
| [AdmTal/PostgreSQL-Query-Lock-Explainer](https://github.com/AdmTal/PostgreSQL-Query-Lock-Explainer/blob/4699cd30b611370a9e536abd9b74f17b56c8fd8a/README.md) | `4699cd30b611370a9e536abd9b74f17b56c8fd8a` | 2023-12-08 | MIT | 在BEGIN内执行给定SQL、检查锁，再ROLLBACK并显示关系/锁表 | 来自Squawk related，是小而具体工具。README明确不用于生产；rollback不等于没执行，不能作为安全静态分析自动调用，只消费用户已有测试结果。 |

## 和Archify当前工作如何避重

本轮用GitHub issues搜索核对标题及特定工具名，搜索不是“所有历史工作不存在”的证明：

- [#94](https://github.com/tt-a1i/archify/issues/94)、[#388](https://github.com/tt-a1i/archify/pull/388) 均open，已经覆盖Mermaid stateDiagram → typed lifecycle IR。已读#388正文：不猜终态成功/失败；拒绝合成/并发等语义。不要再开一个Mermaid状态语法导入器。
- [#738](https://github.com/tt-a1i/archify/pull/738)、[#589](https://github.com/tt-a1i/archify/pull/589) 是closed的Lifecycle布局/schema变更。当前本地 `archify/examples/agent-run.lifecycle.json` 已是schema_version 3、使用mainPath；旧PR描述的v1容量/几何不适用于本次输入合同。
- [#244](https://github.com/tt-a1i/archify/issues/244) open，提示Lifecycle decorative rail在交互时可能显示假直连。任何状态机候选都要检查实际边和focus，不靠截图静态“看起来有路”。
- 搜索 `migration/schema` 的标题命中 [#206](https://github.com/tt-a1i/archify/pull/206)、[#497](https://github.com/tt-a1i/archify/issues/497)、[#821](https://github.com/tt-a1i/archify/issues/821)，内容是Archify自身Workflow schema迁移，并非Postgres迁移计划可视化。
- 全文特定词 `WaveDrom`、`bitfield`、`bit-field`、`robot3`、`squawk`、`pg-schema-diff`、`tbls` 本次搜索均0命中；protocol标题只有[#607](https://github.com/tt-a1i/archify/pull/607)原子交付协议文档。后续实现前仍要刷新。

不进入此前的DBML/Markdown/trace/dependency/coupling/task-review/payload差异实验；不创建新的SQL差异算法或通用状态机运行平台。

## 候选一：已有Postgres迁移计划 → 有序风险阅读页

### 超出“再画图”的价值

评审者需要知道风险属于哪条DDL、超时配置是什么、顺序有没有被图形整理改掉，以及“无hazard”到底是否表示安全。用现成计划而非分析数据库，能提供可核对、可离线阅读的交接材料。

已读 [pg-schema-diff Plan/Statement](https://github.com/stripe/pg-schema-diff/blob/9ada4710c28718312557c84cca1be4b2557eed54/pkg/diff/plan.go)：JSON根含 `statements`、`current_schema_hash`；每条含 `ddl`、`timeout_ms`、`lock_timeout_ms`、`hazards`，每个hazard含 `type/message`。源码 `SkipValidation` **不进入Statement.MarshalJSON结果**，因此缺失该字段不能称作“已通过计划验证”。源码说明构建concurrent index不能在事务里，timeout使用session层；Archify不能自动改写执行语义。

最小可核验输入例（原创synthetic，非上游实际执行输出）：

```json
{
  "current_schema_hash": "synthetic-not-a-database-hash",
  "statements": [
    {
      "ddl": "CREATE INDEX CONCURRENTLY customer_email_idx ON customer(email)",
      "timeout_ms": 1200000,
      "lock_timeout_ms": 3000,
      "hazards": [{"type":"INDEX_BUILD","message":"Synthetic plan: concurrent index build may consume resources."}]
    },
    {
      "ddl": "ALTER TABLE customer ADD CONSTRAINT email_not_null CHECK(email IS NOT NULL) NOT VALID",
      "timeout_ms": 5000,
      "lock_timeout_ms": 3000,
      "hazards": []
    }
  ]
}
```

**最小输出**：用现有Workflow顺序链 `statement-1 → statement-2`，图内只写编号/短标题；解释页表格和代码块保留完整DDL、原始hazard消息和毫秒单位。映射语义是“计划执行顺序”，不是依赖因果。超时不是实际耗时，不能转成Timeline/Waterfall时长。空hazards显示“提供计划中无hazard条目”，不标安全/可发布。

**低成本边界**：单纯读取JSON，不解析DDL来猜表依赖；不生成plan、不连DB、不apply、不在事务中试跑、不自动补审批。unknown hazard type原样展示并标unknown，绝不吞掉。缺失与空数组区分；重复SQL保留索引身份和顺序。最多10条语句，超限明确拆页或失败。`current_schema_hash`是上游指纹，不称作SHA-256、不代替数据库当下验证。

**有用的附加核验**：同一个hazard必须出现在所属语句详情中；超时0/缺失/负值不合并；为空计划显示“无提供语句，未验证目标数据库状态”；不根据风险字段自动发起任何外部动作。

**截图验收**：用真实上游生成但已脱敏的plan再做一个synthetic；保存其来源版本、运行范围与输入digest。1280×900首屏看清顺序、每条hazard与计划边界，详情能读全DDL。任选两条从JSON核对顺序/超时/风险消息；未知hazard保持可见。工具没有执行时只称格式适配演示。本轮没有生成图片或运行planner。

Squawk可作为后续独立来源，但不混同于planner：已读 [reporter.rs](https://github.com/sbdchd/squawk/blob/240403f085c9e4b1d3a5b63023b6d75fcb035e10/crates/squawk/src/reporter.rs)，JSON是扁平violation数组，file/line/column/rule_name/message/help等；内部line/column为零基，GitHub annotation才加1。空数组不带files_checked，因此不能推出“全部迁移已检查”。这是风险阅读来源候选，不是本轮再做PR review页面。

## 候选二：状态机静态事件合同页

### 超出“再画图”的价值

单纯把Robot3图换皮价值很小。更有用的是同时显示“每个状态接受哪些事件、哪些事件在该状态未声明、guard是否未知”，让接手者发现具体遗漏，并明确静态结构不等于运行可达。

[robot3-viz R3Dag类型](https://github.com/jbreckmckye/robot3-viz/blob/5e931694734445b3cd91d20dfc916901035f31c8/src/types/dag.ts) 给出 `nodes/edges`。节点kind有state/guard/reduce/invoke-machine/invoke-promise/action；边kind有event/immediate/side-effect。已读 [getDAG实现](https://github.com/jbreckmckye/robot3-viz/blob/5e931694734445b3cd91d20dfc916901035f31c8/src/lib/dag.ts)：其guard/reducer标签为泛称，不足以恢复函数逻辑；初始状态不在R3Dag根字段，必须通过sidecar提供。虽然名字叫DAG，机器可以包含toggle循环，不能运行拓扑排序强迫无环。

**最小输入**：用户已经在自己的可信环境导出的nodes/edges JSON、显式initialState、显式expectedEvents列表。适配器不import/require机器源码，不执行guard/reducer。第一轮只接受flat state/event边；遇guard、invoke、reducer、immediate、side-effect时应明确unsupported或用有据的workflow辅助节点，不得静默丢弃后称完整机器。

两状态toggle的原生可渲染候选（只表示flat structure，原创说明性IR，未实际渲染）：

```json
{
  "schema_version": 3,
  "diagram_type": "lifecycle",
  "meta": {"title":"Synthetic toggle event contract","output":"toggle.html","quality_profile":"standard"},
  "mainPath": ["off", "on"],
  "states": [
    {"id":"off","type":"start","label":"Off"},
    {"id":"on","type":"active","label":"On"}
  ],
  "transitions": [
    {"id":"turn-on","from":"off","to":"on","label":"toggle"},
    {"id":"turn-off","from":"on","to":"off","label":"toggle"}
  ],
  "cards": [{"dot":"amber","title":"Static contract","items":["Synthetic example, no machine executed.","Edges declare accepted events; runtime guards remain unknown."]}]
}
```

将该JSON另存 `toggle.lifecycle.json` 可使用现有公共CLI：`node archify/bin/archify.mjs finalize lifecycle toggle.lifecycle.json toggle.html --quality standard --json`。这里提供可渲染输入形状，未声称命令已运行或gate通过。

**最小输出**：Lifecycle图加“状态×expectedEvents”矩阵，每格是declared/undeclared/unknown；只在明确提供事件全集时评估缺口。未声明事件不代表runtime一定报错，各库可能忽略/处理方式不同。选择mainPath只用于阅读，不代表业务成功路径；循环和回退原样保留。由纯结构搜索得到的结论写“拓扑上有路径/无路径”，不得写“guard能通过/运行可达”。

**成本与影响**：flat数据映射和矩阵计算较低，嵌套/并行/回调解释成本高；超过flat范围就停止。与#388合并点是复用相同Lifecycle输出与诊断合同，而非复刻Mermaid parser。若原生Lifecycle语义不能容纳guard就不发明新state kind。

**截图验收**：一份由上游可信环境导出的两状态toggle；一份明确expectedEvents为toggle/reset但缺reset的synthetic对照。图片中初态来源、两条toggle循环边和reset未声明都可见；focus后不能出现decorative rail假边。匿名函数/unknown条件不能被绿色“通过”样式掩盖。需保存输入与矩阵核对记录；本轮未执行导出、未截图。

## 候选三：字段bit区间合同 → 原生结构页

### 超出“再画图”的价值

现成工具已经能画漂亮寄存器/协议头。Archify能做的小增益是把字段宽度、累计区间、保留位和声明总宽的算术证据放在一起，帮助改协议的人发现遗漏/重叠，而不制造新的bitfield renderer。

官方 [bitfield README](https://github.com/wavedrom/bitfield/blob/003bfa5e11dc96af2a859b53728de83f68ed61a1/README.md) 的数组例包含 `bits/name/attr/type`；可取其形状并原创一个明确标记为synthetic的小头部：

```json
{
  "kind":"synthetic",
  "totalBits":16,
  "indexConvention":"lsb-first-explicit",
  "byteEndianness":"unknown",
  "fields":[
    {"name":"version","bits":3},
    {"name":"reserved","bits":5},
    {"name":"length","bits":8}
  ]
}
```

该wrapper是实验自定义sidecar，**不是上游原生格式**；`fields`才对应bitfield的数组结构。`hflip/vflip`属于显示选项，不能用于推断网络byte order。上述显式约定下字段区间是 `[0,3)`、`[3,8)`、`[8,16)`，宽度和16相等；只证明位布局算术，不证明报文语义或编码器正确。

**最小输出**：现有Tree根“16-bit header”，子节点字段；解释页表格给name/bits/start/end/reserved/attr原始值。原生图表示组成层级，表表示精确bit位置，不冒充等比例字节图。可选已有Sequence展示作者提供的解码步骤，但不从字段宽度自动推断真实解析流程。离散字段相加/重叠检查独立出结构化诊断，unknown endianness可见。

**边界**：只处理正整数宽度、确定长字段与显式indexConvention；变长TLV/union/条件字段/表达式拒绝或保留unsupported。名字重复不能默默覆盖；空名是保留位要显式赋生成身份但保留原值。若仅需漂亮bitfield SVG，继续用上游工具更合适。不要执行bytefield-svg Clojure DSL，也不需要整套WaveDrom runtime。

**截图验收**：一个16位synthetic正常输入和一个bits总和17但totalBits16的失败输入；后者应无新HTML，显示具体sum与字段范围。同一张图内能识别unknown endianness、保留位和精确区间。用真实协议需固定规范版本与字段来源，不能用自编字段宣称标准协议兼容。本轮只给验收合同，没有图片。

## 不应自动执行的工具与不值得扩张的范围

[Query Lock Explainer README](https://github.com/AdmTal/PostgreSQL-Query-Lock-Explainer/blob/4699cd30b611370a9e536abd9b74f17b56c8fd8a/README.md) 清楚描述BEGIN → 执行查询 → 检查锁 → ROLLBACK。可把用户已有的测试环境结果连到计划说明，但“回滚了”不是“没执行”，不自动探测任何数据库。此处是来源事实导致的范围限制，不是运行工具后再要求用户接受风险。

SchemaSpy/tbls已有数据库文档生态，重建整库ERD会重复DBML方向；通用状态机运行器、硬件仿真、协议字节解析、SQL parser与数据库迁移执行器维护成本都高于本轮收益。先验证一个明确输入、一张原生图、一页可核对证据，再判断是否需要正式集成。

## 证据状态

本轮已做：14仓库固定commit/README/许可元数据、重点源码字段检查、7报告去重、Archify相关issue/PR搜索及#388正文检查。没有产品代码变化，因此没有运行产品测试。文中JSON是候选示例；真实上游执行、public render/finalize、PNG截图、浏览器行为和人读任务收益均未执行，不能把文档中的验收条目标为通过。
