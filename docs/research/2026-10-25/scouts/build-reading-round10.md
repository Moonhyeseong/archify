# 构建阅读第10轮：打印位置、任务身份与观察记录

2026-10-25，只读研究。**6个新一手来源，深入Gradle完整多项目fixture和ninjatracing完整输入/expected文件；最多保留1个有固定输入的内容候选。** 候选不是另画一张requires图，而是把同一官方输出的11个打印位置与10个task identity逐项并列，解释两个父任务为什么共享一个compileJava。当前没有用户损失或阅读收益数据，原工具图例本来明确；若不能超出“原树加一句说明”，推荐0实施。

Archify固定基线为 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，#1102已合入，#1103仍draft。按CONTRIBUTING/REVIEWING以价值、成本、影响判断。使用research流程：后台只读agent调查Gradle/MSBuild，作者核其余来源和Gradle完整fixture，另由独立agent评估候选与既有实验重叠。**没有运行上游build、测试、脚本、parser、converter、日志播放器或浏览器，未安装或上传日志。** 以下expected是已提交的上游回归资料，不能称本轮执行记录。

## 排重后的六源

先读 [build-infra](build-infra-smalltools.md)、[rebuild-evidence](rebuild-evidence-smalltools.md)、[traces-timelines](traces-timelines.md)、[execution-reading](execution-reading-smalltools.md) 及研究中心34项实验，再全文检索owner/repo。已覆盖Ninja/Bazel格式资料、Make、Just、Task、redo、Rattle/Shake/Mill、BuildXL、ccache/sccache，不以新语言或新renderer名重做。CI conditions、Recipe stages、Dependency map、Trace waterfall、Copy identity各有既定责任。本轮不引通用构建parser、调度器或critical-path求值器。

| 新的一手来源 / 固定revision | 实际许可 / 状态 | 小机制与筛选结论 |
| --- | --- | --- |
| [dorongold/gradle-task-tree](https://github.com/dorongold/gradle-task-tree/tree/84cda7f0ce2363c96b1b26713ad34558519bdf05) `84cda7f0ce2363c96b1b26713ad34558519bdf05` | [Apache-2.0](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/LICENSE)，未归档 | 按executionPlan投影依赖树，重复身份与depth截断有不同标记，included-build读取失败可能省略子树。完整fixture足以做双层账目候选，见下；不是实际执行次数。 |
| [nico/ninjatracing](https://github.com/nico/ninjatracing/tree/fc2924576c9338ff0721f539e6dfa2f3983ae2db) `fc2924576c9338ff0721f539e6dfa2f3983ae2db` | [Apache-2.0](https://github.com/nico/ninjatracing/blob/fc2924576c9338ff0721f539e6dfa2f3983ae2db/LICENSE)，未归档 | .ninja_log→Chrome trace，重建build边界、输出分组、合成tid；完整fixture揭示投影与记录差异。单纯转换waterfall已重叠，不另开adapter。 |
| [KirillOsenkov/MSBuildStructuredLog](https://github.com/KirillOsenkov/MSBuildStructuredLog/tree/9e88d23c91db7ad09dd89f7e1873f30653468406) `9e88d23c91db7ad09dd89f7e1873f30653468406` | [MIT](https://github.com/KirillOsenkov/MSBuildStructuredLog/blob/9e88d23c91db7ad09dd89f7e1873f30653468406/LICENSE)，未归档；整体不是小型插件 | skipped事件保留当前与原始context，按原context过滤仍应保留复用来源。完整合成binlog fixture有明确expected；不新增二进制日志平台。 |
| [EngFlow/bazel_invocation_analyzer](https://github.com/EngFlow/bazel_invocation_analyzer/tree/118a359c56f909df0087b07849c52c21fda21d95) `118a359c56f909df0087b07849c52c21fda21d95` | [Apache-2.0](https://github.com/EngFlow/bazel_invocation_analyzer/blob/118a359c56f909df0087b07849c52c21fda21d95/LICENSE)，未归档 | [critical-path queue provider](https://github.com/EngFlow/bazel_invocation_analyzer/blob/118a359c56f909df0087b07849c52c21fda21d95/analyzer/java/com/engflow/bazel/invocation/analyzer/dataproviders/remoteexecution/CriticalPathQueuingDurationDataProvider.java)先按name/时间及pid/tid关联，再汇总关键路径内queue；没有critical path返回缺失原因。不是所有queue累计都能从wall time扣除；建议不等于实测优化。只借证据关联规则，不跑Bazel/上传profile。 |
| [facebook/buck2](https://github.com/facebook/buck2/tree/c157439fc457e7b796c4c62b7b38ab4780f9f951) `c157439fc457e7b796c4c62b7b38ab4780f9f951` | [MIT](https://github.com/facebook/buck2/blob/c157439fc457e7b796c4c62b7b38ab4780f9f951/LICENSE-MIT) OR [Apache-2.0](https://github.com/facebook/buck2/blob/c157439fc457e7b796c4c62b7b38ab4780f9f951/LICENSE-APACHE)，源码头明确双许可；未归档 | [critical-path CLI](https://github.com/facebook/buck2/blob/c157439fc457e7b796c4c62b7b38ab4780f9f951/app/buck2_cmd_log_client/src/critical_path.rs#L33-L100)区分total/user/potential improvement与slowest path。[完整golden](https://github.com/facebook/buck2/blob/c157439fc457e7b796c4c62b7b38ab4780f9f951/tests/core/build/test_critical_path_data/events.golden.json)15项的time_span全是[null,null]，不能画观测耗时。大型构建系统不是本轮引擎候选。 |
| [nrwl/nx](https://github.com/nrwl/nx/tree/7c8e7070e404fba91954a51e932cea3e86970b69) `7c8e7070e404fba91954a51e932cea3e86970b69` | [MIT](https://github.com/nrwl/nx/blob/7c8e7070e404fba91954a51e932cea3e86970b69/LICENSE)，未归档 | [完整task-graph fixture](https://github.com/nrwl/nx/blob/7c8e7070e404fba91954a51e932cea3e86970b69/graph/client-e2e/src/fixtures/nx-examples-task-graphs.json)有39tasks、dependencies/continuousDependencies/roots；[scheduleTasks](https://github.com/nrwl/nx/blob/7c8e7070e404fba91954a51e932cea3e86970b69/packages/nx/src/tasks-runner/tasks-schedule.ts#L173-L225)另管running、parallelism、排序等。图不是schedule/成功/cache receipt，不另做Nx graph importer。 |

所有commit为本次实际读取的固定对象，不宣称最新release；未归档不等于积极维护。没有按star选择。只读大型来源的窄模块，不将其整体包装为低成本小工具。

## 深读一：完整Gradle题的11位置与10身份

固定输入是整个 [samples/multiproject目录](https://github.com/dorongold/gradle-task-tree/tree/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/test/resources/samples/multiproject)，本次按官方tree取得全部8原文件：4个Gradle配置与4个Java文件。不是只抽取dependsOn一行，配置中Java插件生成的依赖也不能冒充全由这行直接声明。

根 [build.gradle L30](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/test/resources/samples/multiproject/build.gradle#L30)注册dependsOnIncluded，依赖当前工程assemble与includedProject的taskInIncludedProject；根settings包含api/shared/services:personService并includeBuild。includedProject用base插件，自己的taskInIncludedProject依赖build。Java源文件完整保存只为fixture边界，不编译、不执行。

[测试调用与断言 L146–166](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/test/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskTest.groovy#L146-L166)使用指定Gradle测试版本、multiproject样例、`:dependsOnIncluded :taskTree`，断言output contains [完整expected L365–386](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/test/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskTest.groovy#L365-L386)。这里保存的是上游expected，不是本轮产生stdout或某生产构建记录。

该expected含11个打印位置、10个不同task path、10条显示父子关系：

- 根`:dependsOnIncluded`分到`:assemble`与`:includedProject:taskInIncludedProject`。
- assemble→jar；jar→classes与compileJava；classes→compileJava与processResources。所以同一`:compileJava`出现两处，一处带`*`。
- includedProject分支为taskInIncludedProject→build，再分到assemble/check；这些完整身份有includedProject前缀，不与根工程assemble合并。

[TaskDetails L69–79](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy#L69-L79)以path作equals/hash；[renderTreeRecursive L140–178](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy#L140-L178)保存rendered集合，`*`表示先前已经打印、`(...)`表示超过depth。**这个expected的compileJava本身是叶子。** 不可虚构它被省略了哪些后续任务，也不能把重复打印次数称执行次数。原expected已有明确legend，不能声称原工具语义含糊或读者已受损。

### 它既不是原始声明，也不是执行轨迹

[calculateReportModel](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy#L82-L119)从Gradle executionPlan.entryNodes开始，以task identityPath构造report；[TaskGraphUtils](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/main/groovy/utils/TaskGraphUtils.groovy#L28-L64)取dependencySuccessors，并unwrap included-build node。它是该次invocation计划依赖的投影，不能仅称静态扫描build.gradle。

[插件skipAllTasks](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/main/groovy/com/dorongold/gradle/tasktree/TaskTreePlugin.groovy#L59-L76)禁用尚未executed的任务；已经提前执行的会记日志。因此不能把“taskTree跳过任务执行”扩成“调用Gradle绝无配置/其他代码执行”。本轮没有调用它。

另外，included-build unwrap异常会返回空set并记录INFO；画出来的叶子可能表示读取失败，而非真实无依赖。这个错误分支是另一组[source/fixture](https://github.com/dorongold/gradle-task-tree/blob/84cda7f0ce2363c96b1b26713ad34558519bdf05/src/test/groovy/utils/TaskGraphUtilsTest.groovy#L50)，不是正常11位置expected里已发生的错误；不能为讲未知而添加一项虚假失败。

## 深读二：ninjatracing的线程与多构建时间不是原日志原样字段

本次完整读取 [ninjatracing_test](https://github.com/nico/ninjatracing/blob/fc2924576c9338ff0721f539e6dfa2f3983ae2db/ninjatracing_test)及[实现](https://github.com/nico/ninjatracing/blob/fc2924576c9338ff0721f539e6dfa2f3983ae2db/ninjatracing)，没有运行。这里ninjatracing.py与ninjatracing_test.py是仓库里的别名链接内容，真实实现/测试是无扩展名文件；没有把读取到的短链接内容当完整源码。

完整test_simple与test_last_only共用两行v5 log：先100–200的my_output，再50–120的my_first_output，command hash不同。showall=false expected只留下后者，ts50000/dur70000；showall=true expected前者ts100000/dur100000，后者ts250000/dur70000。第二组时间已经加上上一build的200，**不是原日志观察到它在250开始**。

对应 [read_targets L42–75](https://github.com/nico/ninjatracing/blob/fc2924576c9338ff0721f539e6dfa2f3983ae2db/ninjatracing#L42-L75)以end回退推断新build；showall时假设它紧接前build，将build_start累加。固定README还提醒混合build会影响并行解释，但实际当前源码/expected已含顺序offset；不能只照README把所有showall输出统称原始重叠时间，须按所读版本/转换口径解释。

[Threads.alloc L77–90](https://github.com/nico/ninjatracing/blob/fc2924576c9338ff0721f539e6dfa2f3983ae2db/ninjatracing#L77-L90)按区间分配可用worker，用来重建可视化并行轨道；输出tid不是原始worker ID。完整test_multiple_outputs将同hash、同start/end的output与other_output合并成一个command event。这个测试仅支持该固定场景；实际read_targets用cmdhash作为key，没有额外按时间构造独立occurrence身份，因此不能泛称每一行都保留为一次独立执行。

完整test_trace还明确过滤非X、Total及短事件，并重写pid/tid、按target开始时间平移ts。此类派生trace若再转Archify，必须标出过滤与合成字段，不能反推原日志覆盖完整、真实线程数、调度因果或依赖图。现有Trace waterfall已有完整记录投影责任，为这一工具再写parser没有新阅读收益证据。

## 其余来源的窄证据

MSBuild的 [CreateFilteredReplayStream L824–881](https://github.com/KirillOsenkov/MSBuildStructuredLog/blob/9e88d23c91db7ad09dd89f7e1873f30653468406/src/StructuredLogger.Tests/BinaryLoggerTests.cs#L824-L881)是完整合成gzip binlog构造：context101的message、202的warning，和当前303、OriginalBuildEventContext101的TargetSkipped。skip明确PreviouslyBuiltSuccessfully/OriginallySucceeded=true，不是一次新的target执行。[完整过滤断言 L163–213](https://github.com/KirillOsenkov/MSBuildStructuredLog/blob/9e88d23c91db7ad09dd89f7e1873f30653468406/src/StructuredLogger.Tests/BinaryLoggerTests.cs#L163-L213)按当前或原context匹配101，expected保留message及单个skip、排除warning。可借鉴“过滤时保留复用来源身份”，暂不把合成记录画成实测耗时，也不新增binlog读取器。

Buck2 [test_critical_path.py](https://github.com/facebook/buck2/blob/c157439fc457e7b796c4c62b7b38ab4780f9f951/tests/core/build/test_critical_path.py)保存构建命令及expected kind/name顺序，且区分execution_kind只适用于action。与events.golden配对可解释观测日志中的不同节点类别，却不能从null time_span捏造timing；potential-improvement是生产者模型指标，不是承诺节省时长。EngFlow同样依赖profile中critical path的name/time/thread对应，缺失资料不能补零。Nx taskGraph只说明任务与依赖，scheduler还有batch/parallelism/running/排序条件，不从39节点图断言实际执行39次或全都cache miss。

## 完整fixture与字节账目

Gradle multiproject目录共8文件，以下相对路径全部基于其官方目录。已完整取得并读过；不会执行其中Gradle/Java代码。若后续做内容实验，应附8原文件、LICENSE、test与expected的原文来源，另标手写投影，不能把节选当完整项目dump。

| 相对路径 | bytes | SHA-256 |
| --- | ---: | --- |
| build.gradle | 638 | `59124b8ea6e61744963ce382483bea501e398cde7d861b5608196046320de7bc` |
| settings.gradle | 119 | `e8c7a7c613f628e32e0c21ea219cedba45302b1e0fc1c38652be795c34a9b554` |
| includedProject/build.gradle | 210 | `dfb75cb28a1036eabf4b1a26d8a5116938b54dcc9aac16612ee966bafeee849c` |
| includedProject/settings.gradle | 38 | `290eeca4243910b04902f920dda91df0e240e3de5845dbe5400af0fa331cb391` |
| api/src/main/java/org/gradle/sample/api/Person.java | 112 | `23db36dec5b1d14211c246a66677d576273fe45c350bdef3ad07cd1dd78fcfbc` |
| api/src/main/java/org/gradle/sample/apiImpl/PersonImpl.java | 759 | `95e490091fd72fb541afb26099c8835dd432c3c340a3f9730de2759890a11a17` |
| services/personService/src/main/java/org/gradle/sample/services/PersonService.java | 359 | `a88cfd057d902a9e4dd0f0e833803195a2b9292d3093dbd62737d1ce5665091b` |
| shared/src/main/java/org/gradle/sample/shared/Helper.java | 156 | `f3760eb3c786236c817c1704995c28b0bdcd4724ecc00c2f975f5dc3d9cc641b` |

完整supporting文件：Gradle TaskTreeTaskTest.groovy 25033B/`b5e241184c0128c9b1f3dbf2c0e14d84d3f57867c2abd609b718e4b45a56bdab`；ninjatracing 7633B/`74408b5bd80160d7f7822bb955900c71cd3aa64061fb9384a9c2ec3ab6d00a4f`；ninjatracing_test 4728B/`3a8ca4b0adad6c6d120f867337cfefdc6c4236d151c4c23c8a708e82ab2880fa`；MSBuild BinaryLoggerTests.cs 44314B/`c2d60b27511f8723a74f3754b0e51021ad9bc05c8123a490cff16ff03020decc`（保留原CRLF）；Nx task-graphs fixture12432B/`3bb44232c205d528b337a1a743ae2d839e9fc48ced9ef551523f2d9bef5052dc`。本轮没有将这些支持文件的所有功能都深审一遍。

## 唯一条件候选：从打印树回到共享任务，再回到原位置

**具体输入/问题**就是上述完整Gradle fixture，而非新造三节点。可尝试用现有Architecture/Explainer做一页paired authored阅读：左侧保留完整expected原树及legend，右侧10个task identity＋10条明确“depends on”的父子边，并列11条原打印位置→task path映射。当前工程与included build分组；边方向以“父任务依赖子任务”明确命名，不伪装调度时间顺序。两个compileJava位置指向同一task组件，各自原位置仍留账；根assemble和includedProject:assemble则保持不同身份。

这项候选的新增点是**双层账目**，不是图形转换。Dependency map关注导入边覆盖，Recipe stages关注priors/body/subsequents，Copy identity关注Python运行对象身份；此处task identity由生产者path合同定义，打印occurrence由树展开决定，计划依赖来自executionPlan，实际执行未提供。三层放在一起有小而具体的阅读题，但不能借另一种工具名掩盖重叠。

实施成本低且局限于内容：无Gradle运行、无parser/importer、无新schema/索引/Viewer控件；手写10节点、10边和11行映射，保留完整原文/许可与source hashes，原生render/finalize即可检查产物。风险主要是把expected称实测、把parent→dependency称先后执行、混淆included build身份，或丢掉重复位置。需要独立核10个身份、10条有源关系、11位置全覆盖；这种固定内容不值得另造测试框架。

**停止条件也很具体：** 原树已有清楚的`*`图例，compileJava是叶子；如果原文加一句“两个引用、一个任务身份，未提供执行次数”已能回答问题，就不实施新页。如果只输出去重后的10任务图，没有11位置回链/账目，则推荐0；它只是又一个requires图。如果将来要显示included-build读取失败，须另用真实失败fixture并明确分开，不能添到正常expected里。

可以批准一次很小的内容对照，但尚无相同问题的读者测量、用户收益或生产需求。当前阶段仅提出这个可审查方向，不声称已经实现、提速或获得人类验收；也不建议将它自动升级成新实验分支。

## 最新产品边界与本轮完成范围

10b4的现有Architecture/Explainer已经能承载这个固定图、原文、来源和对照表，无共享产品缺口；Tree渲染器的节点身份/单parent模型不宜通过复制同ID来伪装DAG。选择Architecture是为保留共享目标与两条真实输入边，不改变图引擎。

[#1102](https://github.com/tt-a1i/archify/pull/1102)已合入，Passport说明与drilldown等视为基线；[#1103](https://github.com/tt-a1i/archify/pull/1103)在本轮所用已核状态为OPEN/draft、head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，Atlas的代码模块/file/function度量及findings导航不是构建执行记录。本轮不扩Atlas、不重做source inspector、timeline或all-path播放器。

仅新增本报告，无README/其他报告/产品修改，无commit/push。固定源码、已提交expected、本轮未执行、未来内容假设分别记账；他人进行中的gallery等修改没有触碰。
