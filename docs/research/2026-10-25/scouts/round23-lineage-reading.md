# Round 23：从来源清单到“哪些输入共同见证一个输出”

2026-10-25，只读发现。先查hub README、全部scouts及已列实验；下列4个repository此前未深入，不按stars筛选。与既有lineage-evidence、DBML、SQL plan/rowcounts、static uses、payload、Config origins排重。只读取固定GitHub源码、完整fixture/expected及许可；**没有连接数据库、运行SQL/Python/测试/扩展、安装依赖或使用浏览器。** 上游expected不是本轮执行回执。

最多保留一个新阅读动作：**把同一输出的平面来源集合，与“组内共同参与、组间替代”的见证组并排读。** 候选来自ProvSQL的完整受控SQL测试；可以只用现有Explainer代码与表，不引入PostgreSQL/semiring evaluator/SQL parser或新Viewer。它不是发现产品缺陷，也没有读者效率或人类验收结论。其余来源不建议分支。

## 四个新来源

| 来源 / 固定revision | 实际许可与完整输入 | 消费者、输出语义与取舍 |
| --- | --- | --- |
| [PierreSenellart/provsql](https://github.com/PierreSenellart/provsql/tree/96227fbfc6dd6084d6041f4a11c59093e8155520) `96227fbfc6dd6084d6041f4a11c59093e8155520` | [MIT LICENSE](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/LICENSE)，1083B；完整test/sql/sr_which.sql、sr_why.sql及对应expected；personnel输入来自共享add_provenance.sql，不能说每个query自包含 | 已提交同一查询的两种provenance投影：which为一个标签集合，why为见证集合的集合。实际SQL wrapper→compiled evaluator→Which/Why类可追。唯一内容候选，绝不部署或执行数据库扩展。 |
| [propstore/provenance-semiring](https://github.com/propstore/provenance-semiring/tree/ea2cdd2fdada652d911a2d0bcb99dd414a428661) `ea2cdd2fdada652d911a2d0bcb99dd414a428661` | [MIT LICENSE](https://github.com/propstore/provenance-semiring/blob/ea2cdd2fdada652d911a2d0bcb99dd414a428661/LICENSE)；完整test_provenance_projection_properties.py、test_polynomial_provenance_preserved_through_combine.py | 抽象polynomial→boolean/count/minimal why support/tropical等投影；完整测试给定输入与断言，不是SQL输出记录。能提醒计数与support有损投影，但没有具体业务tuple来源或采集链，不推荐增加抽象代数页面。 |
| [sfu-db/lineagex](https://github.com/sfu-db/lineagex/tree/788c14a84b03767eca872c9e3c99a884c6ee26e8) `788c14a84b03767eca872c9e3c99a884c6ee26e8` | 完整github_example/table1.sql、table2.sql；pyproject.toml声明MIT，但该固定tree未见项目LICENSE全文。这里只读引用，不按缺失条款假设可复制代码或原素材 | ColumnLineageNoConn经SQLGlot产生column_dict；外层输出列映射分直接贡献/WHERE等引用。这个机制与既有lineage-evidence报告重复；有连接模式还可能建立依赖表。没有启动或连接服务。拒绝新parser/环境集成。 |
| [sumanakkisetty/data-lineage](https://github.com/sumanakkisetty/data-lineage/tree/86b3c5efe6464fb7b1ffceba436202441b48b244) `86b3c5efe6464fb7b1ffceba436202441b48b244` | 完整28080B sample_metadata.json及12194B生成源码；未见LICENSE文件，README License节只写internal tooling/demonstration，未提供通用开源许可 | 静态JS按列选择、高亮上下游并发lineage-selected事件，来源/目标及edgeType可读；sample支持手写边与SQL字段。edgeType不是实际算值/执行证明。已有局部导航模式，无独立新增动作且许可未清，不复制实现、图或样本。未打开hr.db或执行setup。 |

## 深读：一条Paris输出不是三个人必须同时参与

ProvSQL共享输入的[add_provenance.sql](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/sql/add_provenance.sql)完整创建personnel并插入7条受控记录。Paris三条为Dave、Magdalen、Nancy，Berlin两条为Ellen/Susan，New York两条为John/Paul；随后add_provenance并建立personnel_name映射。这些是官方测试资料，不是真实人员/数据库现场或本轮执行。

[sr_which.sql](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/sql/sr_which.sql)和[sr_why.sql](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/sql/sr_why.sql)首个SELECT均以p1/p2自连接，条件为同city且p1.id < p2.id，再按city分组。只改变所读的provenance投影函数；这里不把两份包含后续round-trip用例的完整脚本说成逐字相同SQL。

两份完整expected的首个结果：

| city | sr_which：平面集合 | sr_why：见证分组 |
| --- | --- | --- |
| Berlin | {Ellen,Susan} | {{Ellen,Susan}} |
| New York | {John,Paul} | {{John,Paul}} |
| Paris | {Dave,Magdalen,Nancy} | {{Dave,Magdalen},{Dave,Nancy},{Magdalen,Nancy}} |

来源分别是[完整sr_which.out](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/expected/sr_which.out)和[完整sr_why.out](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/expected/sr_why.out)。一张普通“Dave、Magdalen、Nancy→Paris”平面图没有表达内层集合的联合与外层集合的替代。读者可以核对哪两条输入构成一组，而不错误地把三条一起当成唯一组合。**三个见证不代表三次真实SQL执行、耗时、概率或三个业务输出行。** 这也不是关于城市/人的真实因果解释。

两份完整SQL/expected还各含structured leaf round-trip测试，which另含底值⊥测试；这些不删改、不混成首个结果的一部分。0（无见证）与含空见证的1不是同一个值，不能借“空集合”一词把它们合并；本内容候选可不展开该进阶话题，但必须保留原材料。

### 实际consumer与共享测试边界

不是从论文名推断行为：[sql/provsql.common.sql L11912–11949](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/sql/provsql.common.sql#L11912-L11949)的两个wrapper调用compiled evaluator并分别传why/which；[provenance_evaluate_compiled.cpp L506–508](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/src/provenance_evaluate_compiled.cpp#L506-L508)分派到对应semiring类。

[Why.h](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/src/semiring/Why.h)保留set<set<label>>：plus对外层集合并集，times对各见证作笛卡尔组合并合并组内标签。[Which.h](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/src/semiring/Which.h)只保单个label集合（另有无推导底值），plus/times都把贡献标签并入集合。因此which丢掉“分成哪些组”的信息是具体数据结构/操作的性质，不是一个渲染bug。

[Makefile.internal L60–69](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/Makefile.internal#L60-L69)使用pg_regress及test/schedule；[schedule.common](https://github.com/PierreSenellart/provsql/blob/96227fbfc6dd6084d6041f4a11c59093e8155520/test/schedule.common#L18-L46)先setup、add_provenance、remove_add_provenance和映射测试，再运行这些投影。它们依赖共享测试状态；**两份query+expected并非一个可独立直接运行的完整数据库环境**。本轮读全相关seed、调度、查询/expected与consumer，未尝试构造数据库或复现整套状态，也不把上游断言写成本轮pass。

### 一个名称不保证同一种why语义

propstore的[projections.py](https://github.com/propstore/provenance-semiring/blob/ea2cdd2fdada652d911a2d0bcb99dd414a428661/src/provenance_semiring/projections.py#L83-L126)明确把项转为squarefree supports，再去重并只保subset-minimal supports。ProvSQL的Why则保存见证set并集，源码明确不是同样的absorptive简化。不能因为都叫why-provenance，就把其中一个的“最小见证”术语强加给另一个；本候选只读该固定ProvSQL expected的三组，不声称它们是一般意义的最小/必要/充分现实原因。

propstore完整[test_provenance_projection_properties.py](https://github.com/propstore/provenance-semiring/blob/ea2cdd2fdada652d911a2d0bcb99dd414a428661/tests/test_provenance_projection_properties.py)的固定case构造a*b，trusted={a,b}为true、{a}为false；另一个a*b+c的tropical cost用3/4/10得到7。计数投影只求term coefficient之和，cost是用户赋值，不是可信度、实测耗时或SQL行计数。这些是抽象代数断言，不提供变量到真实数据的来源绑定；即使本轮执行它们也不能自动获得SQL证据，所以不引入其库。

## 另外两条路线为什么不做

LineageX的[README输出合同](https://github.com/sfu-db/lineagex/blob/788c14a84b03767eca872c9e3c99a884c6ee26e8/README.md#L37-L60)把每列输出值依赖与WHERE/GROUP BY等引用分成两列表。完整table1.sql输出column1/column2、WHERE使用column3；table2.sql只把二列rename。`ColumnLineageNoConn.py`真实调用SQLGlot解析并构建column_dict，`LineageXNoConn.py`组装tables/columns/table_name/sql。它不等于观察输出tuple为什么存在。这个“值来源vs过滤影响”已是旧lineage-evidence明确主题；又有dialect/schema/库版本和许可完整条款问题，不开新分支。未获取或使用连接凭据，未运行有连接模式、建表或EXPLAIN。

data-lineage的完整sample_metadata.json同时保留对象SQL/body_sql与显式lineage数组，生成脚本的computed/aggregate/case标签本就有作者输入；不能把一个edge_type当作系统已经验证表达式的证据。[diagram.js L342–374](https://github.com/sumanakkisetty/data-lineage/blob/86b3c5efe6464fb7b1ffceba436202441b48b244/static/js/diagram.js#L342-L374)的真实动作是按所选列筛入/出边，发事件让info bar显示source/target/edgeType；不含逐项输出值解释。它与已有局部图阅读/依赖导航重复，且README没有授予明确开源许可，不复制样本/代码/图片，不接数据库或运行器。

## 最多一个候选：which清单与why分组的对照页

**问题：** “Paris这条expected里为什么列了三个人，但每个见证只要两人？”这里“只要”限于该查询的见证集合，不泛化为数据修改后实际结果必然如何。

最低内容scope：

1. 仅一个独立实验目录，现有Explainer代码/表/固定引用。保留完整MIT许可、共享seed/相关调度/查询/两份expected及owning consumer原件；选首个Paris结果做阅读焦点，明确完整SQL不是本轮运行且有共享状态前置。
2. 并排which平集合和why三组原文，再列三行见证：Dave+Magdalen、Dave+Nancy、Magdalen+Nancy。组内标签为共同参与，组间为替代见证。可引用原seed行，不伪造expected中不存在的UUID或稳定事件ID；这些name是此fixture唯一标签，不保证一般SQL可用姓名标识行。
3. 默认不画仅三条入边的平面Dataflow，否则会再次丢掉分组。若图确有必要，只使用明确标注的“共同/替代”计算节点和本图图例，不借用默认异步虚线、时序箭头或给记录补duration。表格已经能回答时停止于表。
4. 审计仅固定原字节、原query/expected片段、受控7行seed与三组对应、引用range、页面字面绑定；不实现SQL parser、provenance或semiring evaluator。不能用本地人工算出的新结果冒充上游expected，也不运行数据库扩展来给这个内容页凑通过。

这与旧列血缘不同：不是查某列来自哪个表达式；与rowcounts不同：不是局部算子输出次数；与static uses不同：不是代码引用；与payload/config不同：不是值前后变化或来源优先级。与delivery/lasso witness相比，这里保留的是同一关系查询结果的替代tuple组合，而不是一次路径或行为证据。**内容教育价值可试，产品代码/集成不推荐**；没有自动新建分支或承诺理解收益。若为讲清此例必须引入运行平台、重写producer或猜共享测试状态，则保持研究，不实施。

## 完整输入与输出指纹

均为固定GitHub文件原bytes；不是本轮生成输出。共享前置脚本不宣称穷尽整个regression运行环境。

| 来源 / 完整文件 | bytes | SHA-256 |
| --- | ---: | --- |
| ProvSQL test/sql/add_provenance.sql | 3019 | `562c0b2f692240ff7ad217fad27da2f9bd6e92a15f408b35ee3756ec54768c93` |
| ProvSQL test/sql/setup.sql | 777 | `40b9aeb12870ada67bb6e376c42877e91e6e1b5a860c43bd6487c928a48bdc1f` |
| ProvSQL test/sql/remove_add_provenance.sql | 215 | `66171af318ece005fda74755a2111bd5a941e9babb2350f8b3c12b8dfb786789` |
| ProvSQL test/sql/create_provenance_mapping.sql | 2118 | `30d0b5044aa62bdca58b5885a617a4fec371778ac81ae3faf8708c2ef9082152` |
| ProvSQL test/schedule.common | 8241 | `8681ade2054f156f4e2e898e8188ebdb72ae79402921c9e761445ff1c1e1b5af` |
| ProvSQL test/sql/sr_which.sql | 1550 | `b2fb705be163bd51bac91bdd8664f9472d4258e95d62fa66bfb6934f5701bb7d` |
| ProvSQL test/expected/sr_which.out | 498 | `c715e9770538471fd6afcf8b5ea42ef3641f541bd763e142c2105c9b23956273` |
| ProvSQL test/sql/sr_why.sql | 1041 | `31279c2a70307e5a8ec66212cd7c430e22267f1062003766929bf1749d2503b1` |
| ProvSQL test/expected/sr_why.out | 636 | `0ee4c42a538fd1ddf0a25347e39cad2c0e82f17a8e08955f765f73d5e514f372` |
| provenance-semiring tests/test_provenance_projection_properties.py | 4941 | `4d4923ceccc4576d22278d05041c78de7bb0d8840f80c4cb42f656f139e03d54` |
| 同 tests/test_polynomial_provenance_preserved_through_combine.py | 1362 | `565f986ca13c07bffe58b5365ec92f182d9b9017f935d11f1e34cf99aa915881` |
| LineageX lineagex/examples/github_example/table1.sql | 76 | `db2cd37e76ee2104d7c520d4b4e1de14583cb302f2605ad883f8e9ca39438eb0` |
| 同 table2.sql | 75 | `fb35c359e2ce0aba87af900d279d378e7990ff180ca0a54c2e6b559d037d9a63` |
| 同 pyproject.toml，只有许可声明 | 430 | `9b69bd11692fc5f1c05098639ecd27d9f6075cf83052201db8417ec1a8bcce1b` |
| data-lineage sample_metadata.json | 28080 | `67545c9cc491ddf289b24017efe78e6b598bc8bd743b2a4b1e5ca387b4d23c6b` |
| 同 generate_sample_json.py | 12194 | `e0d67849dd17587dfe25b49d19f8073e3c682d6d1876f5907c2d43c0e9cd7db6` |

未修改hub README、其他报告、产品或依赖；只新增本报告，不commit/push。所有fixture源代码只作证据材料，未执行。
