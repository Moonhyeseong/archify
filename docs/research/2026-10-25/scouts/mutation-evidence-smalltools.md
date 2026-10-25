# Mutation evidence：测试没区分哪个替换？

2026-10-25。对研究中心27份已有scouts、264个唯一GitHub repo排重，以下8项未覆盖；不按stars筛选。只读一手固定源码、许可、现成report/fixture与测试断言。**没有运行mutation、项目测试、扫描器、报告server或源码重建器。** 下文结果都是上游fixture记录或按其字段作出的阅读核算，不是本次运行凭证。

**追加价值核查后，当前建议不做离线reader，也不做替代viewer的Explainer实验。** 原Elements已在同一个文件页默认突出Survived/NoCoverage，提供精确diff与测试关联；Stryker还已有嵌入viewer和report的单HTML交付。最初“并排看两类测试缺口”的候选有新增信息，但信息已由原工具自然提供，尚无另造reader的具体缺口。以下保留来源、合同与否决依据。Survived不能推导程序已有bug，Killed也不能证明整体正确。

## 8个新来源与固定证据

| 来源、revision / 许可 | 实际输入→输出，源码/fixture | 可取机制及边界 |
| --- | --- | --- |
| [stryker-mutator/mutation-testing-elements](https://github.com/stryker-mutator/mutation-testing-elements/tree/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a)，[Apache-2.0](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/LICENSE) | mutation report JSON→HTML组件及metrics。[schema](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/report-schema/src/mutation-testing-report-schema.json) 顶层schemaVersion/thresholds/files，file有source/language/mutants；mutant必需id/mutatorName/location/status，可选replacement/description/statusReason/coveredBy/killedBy/testsCompleted等。现成[tests-example report](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/tests-example/mutation-report.json) 含source、82个test条目、161个mutant。 | 最适合小型离线阅读：同一文件里的源码范围和replacement及测试关联齐全。位置1基、start inclusive/end exclusive，不能拿0基编辑器坐标直接切片；缺coveredBy不等于空列表。该schema是格式，不保证producer运行完整。 |
| [stryker-mutator/stryker-js](https://github.com/stryker-mutator/stryker-js/tree/c18ed458dc9defe1e4d7162cdec345d5073bff38)，[Apache-2.0](https://github.com/stryker-mutator/stryker-js/blob/c18ed458dc9defe1e4d7162cdec345d5073bff38/LICENSE) | JS/TS代码与配置、tests→mutant及report；[json-reporter](https://github.com/stryker-mutator/stryker-js/blob/c18ed458dc9defe1e4d7162cdec345d5073bff38/packages/core/src/reporters/json-reporter.ts) 与[report helper](https://github.com/stryker-mutator/stryker-js/blob/c18ed458dc9defe1e4d7162cdec345d5073bff38/packages/core/src/reporters/mutation-test-report-helper.ts) 负责对外报告；reporters e2e有add/circle源及验证快照。 | producer与独立viewer分开，Archify不需执行代码便可消费已有证据。incremental/resume或中断结果不能假装全仓全量；本轮没有运行producer，也不把其test关联当永久测试依赖。 |
| [hcoles/pitest](https://github.com/hcoles/pitest/tree/f7fe5adfa5fb6e727c12d2403a48f5e4e9dd2fc6)，[Apache-2.0](https://github.com/hcoles/pitest/blob/f7fe5adfa5fb6e727c12d2403a48f5e4e9dd2fc6/LICENSE.txt) | JVM bytecode/测试→XML、HTML等；[真实XML fixture](https://github.com/hcoles/pitest/blob/f7fe5adfa5fb6e727c12d2403a48f5e4e9dd2fc6/pitest-aggregator/src/test/resources/full-data/mutations.xml) mutation attrs有detected/status/numberOfTestsRun，子字段sourceFile/mutatedClass/mutatedMethod/methodDescription/lineNumber/mutator/indexes/killingTest/description/blocks。 | 一行可有多个bytecode mutation，file+line不是唯一id；XML描述不是精确source replacement。NO_COVERAGE fixture有numberOfTestsRun=1，也不能仅用该数字反推覆盖；原状态优先保留。 |
| [boxed/mutmut](https://github.com/boxed/mutmut/tree/86564d8bbabd7efff0f22cdfe82020e292610956)，[BSD-3-Clause](https://github.com/boxed/mutmut/blob/86564d8bbabd7efff0f22cdfe82020e292610956/LICENSE) | Python mutation缓存及退出码→[browse TUI](https://github.com/boxed/mutmut/blob/86564d8bbabd7efff0f22cdfe82020e292610956/src/mutmut/ui/browse.py)：按mutant name/status显示，选择后懒加载代码diff，可查看测试信息；有killed/survived/timeout/no tests/suspicious/unknown等描述。 | “选中一个才读取diff”减少阅读噪声，但现有Archify source-question-tour已能局部源码阅读，不值得移植TUI。browse还能apply mutant到磁盘，不能把查看流程顺手扩成源码修改；本轮未执行。 |
| [sixty-north/cosmic-ray](https://github.com/sixty-north/cosmic-ray/tree/f6550adf46ead19865285f18db528fcc4e38a3a7)，[MIT](https://github.com/sixty-north/cosmic-ray/blob/f6550adf46ead19865285f18db528fcc4e38a3a7/LICENCE.txt) | session数据库→HTML/文本；[work_item](https://github.com/sixty-north/cosmic-ray/blob/f6550adf46ead19865285f18db528fcc4e38a3a7/src/cosmic_ray/work_item.py) MutationSpec含module_path/operator_name/occurrence/start_pos/end_pos/operator_args/definition_name；WorkResult分worker_outcome与test_outcome、output/diff。[HTML](https://github.com/sixty-north/cosmic-ray/blob/f6550adf46ead19865285f18db528fcc4e38a3a7/src/cosmic_ray/tools/html.py) 显示位置、operator、diff及PyCharm链接。 | worker异常、未运行与测试判定分层很重要；一项WorkItem还能含多mutation。`is_killed`便利属性不是仅等于TestOutcome.KILLED，不能拿它跨工具归一化。session数量与测试已给出verdict数量不相同。 |
| [infection/infection](https://github.com/infection/infection/tree/552535cba6fd93976ceeb601a0c0c67746bff071)，[BSD-3-Clause](https://github.com/infection/infection/blob/552535cba6fd93976ceeb601a0c0c67746bff071/LICENSE) | PHP变体与测试/静态分析→文本、JSON、HTML/Stryker报告；[Calculator](https://github.com/infection/infection/blob/552535cba6fd93976ceeb601a0c0c67746bff071/src/Metrics/Calculator.php) 接收killed/error/timedOut等counts及timeoutsAsEscaped；[StrykerReporter](https://github.com/infection/infection/blob/552535cba6fd93976ceeb601a0c0c67746bff071/src/Reporter/StrykerReporter.php) 可发完整report或只有mutationScore。 | 同样叫MSI也受timeout配置影响，且killed来源可含静态分析；不能改称全部由测试断言杀死。HTTP dashboard reporter涉及API key/环境变量，本轮不调用，也不建议接入。 |
| [davidteren/mutineer](https://github.com/davidteren/mutineer/tree/9dc9d4cd6d3c9fca7b87676b0fb1415b933397aa)，[MIT](https://github.com/davidteren/mutineer/blob/9dc9d4cd6d3c9fca7b87676b0fb1415b933397aa/LICENSE) | Ruby受控变体结果→JSON/HTML/文本；[reporter](https://github.com/davidteren/mutineer/blob/9dc9d4cd6d3c9fca7b87676b0fb1415b933397aa/lib/mutineer/reporter.rb) survivor含subject/file/line/operator/id/token/diff，summary分attempted/no_verdict/score；no_coverage、uncapturable、unplaceable、ran_at_load另列。[JSON tests](https://github.com/davidteren/mutineer/blob/9dc9d4cd6d3c9fca7b87676b0fb1415b933397aa/test/json_reporter_test.rb) 核all-error时score为null、矩阵complete、scoped baseline等。 | 无verdict与真正无覆盖分开，比只给高分诚实。score为killed/(killed+survived)，排除了noCoverage和timeout，不能当Stryker同分母分数；scoped score不可当全项目。diff保留原/变体代码，不需要Archify再解析Ruby。 |
| [assert-lab/PITMuS](https://github.com/assert-lab/PITMuS/tree/9773699d41799c2c7f01415970f9326de819c00e)，[Apache-2.0](https://github.com/assert-lab/PITMuS/blob/9773699d41799c2c7f01415970f9326de819c00e/LICENSE) | PIT XML+bytecode index/javap及源码→重建source mutant CSV/Java和evaluation；[README](https://github.com/assert-lab/PITMuS/blob/9773699d41799c2c7f01415970f9326de819c00e/README.md) 区分重建、编译/bytecode faithfulness评估与skip；有[真实skip样本](https://github.com/assert-lab/PITMuS/blob/9773699d41799c2c7f01415970f9326de819c00e/evaluation/evaluation_results/jsoup_results/skipped-reconstructions-samples-jsoup.txt)。 | 明确证明“报告的bytecode变体”与“展示的source变体”需要额外对应证据。JDK编译变化会改变映射；不能仅按描述生成看似精确的source diff。重建工具成本大，本轮拒绝引入，不运行javap/编译/测试。 |

## 深读一：状态不能简化成pass/fail，分母不通用

Stryker的[官方状态及metrics](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/docs/mutant-states-and-metrics.md)与[实现](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/calculateMetrics.ts)口径：

| 原状态 | 这个report能说明的事 | 该口径的计数 |
| --- | --- | --- |
| Killed | mutant激活时至少一个测试失败 | detected |
| Survived | 所运行测试未杀死该mutant | undetected；不是bug证明 |
| NoCoverage | producer判为无覆盖 | undetected；与“有覆盖但未区分”分开 |
| Timeout | mutant测试超时；不保证就是无限循环 | detected，但不是普通assertion kill |
| RuntimeError / CompileError | 运行器或变体错误，未得普通测试判定 | invalid，排除valid分母 |
| Ignored / Pending | 忽略或尚待处理 | 单独保留，排除valid分母 |

`detected = killed + timeout`，`undetected = survived + noCoverage`，`valid = detected + undetected`；mutation score为detected/valid。covered-code score分母是detected+survived，会排除NoCoverage，因此在同一report里通常不同。分母为零时不得自行显示100%；这里未运行metrics实现，不扩大其空集合返回行为。

PIT [DetectionStatus](https://github.com/hcoles/pitest/blob/f7fe5adfa5fb6e727c12d2403a48f5e4e9dd2fc6/pitest/src/main/java/org/pitest/mutationtest/DetectionStatus.java) 的detected=true还包括NON_VIABLE、MEMORY_ERROR、RUN_ERROR、EQUIVALENT等，并非全是测试杀死；不能对它应用上表Stryker规则。Cosmic Ray [WorkResult.is_killed](https://github.com/sixty-north/cosmic-ray/blob/f6550adf46ead19865285f18db528fcc4e38a3a7/src/cosmic_ray/work_item.py#L50) 是test_outcome不等于SURVIVED；[survival_rate](https://github.com/sixty-north/cosmic-ray/blob/f6550adf46ead19865285f18db528fcc4e38a3a7/src/cosmic_ray/tools/survival_rate.py) 再基于session results数量算比例，不能直接改名为Killed精确数。

Mutineer则明确以killed+survived作为score分母；error/timeout/uncapturable属于no_verdict，纯无覆盖与未成功提取覆盖又分开。它的JSON测试证明**同为50分，可能只评到很小一部分attempted mutants**，所以有独立完整性门槛。Infection还可配置timeout计法。这些机制值得保留，但不值得在Archify发明跨工具“统一质量分”。

## 深读二：代码位置与变体证据要能回核

最合适的冻结阅读输入是Elements的[tests-example/mutation-report.json](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/tests-example/mutation-report.json)。固定bytes为117,017，SHA-256 `21c1dc14acb49aa7e9a4864a8c6b0d9150bd263951dd55c04f9b51a5266b6acb`；schemaVersion为1.5，11个file entries、82个test条目。这里只读JSON并计数，没有跑其中测试。

其中`errors.ts`两条原记录可直接对照：

| mutant | 原字段证据 | 解释边界 |
| --- | --- | --- |
| id `72` | ConditionalExpression；line10，column14到36；replacement=`true`；Survived；testsCompleted=4；coveredBy=`16,17,70,71` | 有覆盖记录且未杀死；不能等同没执行任何测试，也不能证明原分支错误 |
| id `81` | BlockStatement；start17:10/end19:4；replacement=`{}`；NoCoverage；testsCompleted=0 | 测试触达问题与前者不同；未返回coveredBy字段不擅自补成“测量为空” |

id72的ASCII源行是`  } else if (error instanceof Error) {`；按1基半开区间，原token为`error instanceof Error`，replacement是`true`。可显示前后两行，说明只有这处条件被替换，不把mutated代码当修复建议。id81为多行块替换，不能只标行17就声称整行或整函数都被删除。

coveredBy ids能回到同report的testFiles：16/17是regular error与无stack trace转换，70/71是inner error/message测试。它们是该次report给出的关联，不是永久依赖或完整运行日志。killedBy可能因bail-on-first只列最早杀手，缺列表不能证明没有其他测试也能杀死。

整份fixture的状态数为Killed147、Survived7、NoCoverage4、Timeout3，总161；按Stryker该口径，detected150/valid161≈93.17%，covered-code口径150/157≈95.54%。这些是**本次对上游fixture字段的核算**，不是本仓分数，不是新扫描结果；选出的两个mutant不能独自充当全报告分母。

还有一个有用的负面筛选：同repo的旧[simple-example](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/simple-example/mutation-report.json) 顶层写mutationScore=50，但可见记录为1Killed、2Survived，且缺当前schema必需的schemaVersion。不能因为文件叫report就当当前有效合同或悄悄把它“修正”为33.33%；本轮候选不用该legacy样例，也不据此声称产品有计分bug。

PIT XML不同：一个source line可能对应多个bytecode index；只有描述和line，不一定有source replacement。PITMuS专门重建并检验faithfulness，说明这里不能省掉的证据步骤。若没有原始replacement或可靠重建结果，应只显示原描述和位置，拒绝生成伪精确diff。

## 与test-context / test-failure的具体区别

既有test-context回答“某行由哪些测试上下文覆盖”，test-failure回答“既有测试哪里失败及有何日志”；两者都不足以说明**某个受控代码替换激活时，测试是否能区分它与原程序**。id72有覆盖但Survived，正是这个新增问题；id81则仍可能只是覆盖空白，不需要把它发明成新图类型。

不过原Elements viewer、mutmut browse、Cosmic Ray HTML和Mutineer已提供源码/diff及状态。把其report换成Archify配色，既不创造证据，也不自动节省步骤。已有source-question-tour、Explainer代码卡/表格及test-context局部关系可复用，不需要新的扫描器、通用位置parser、覆盖矩阵框架或Mutation专门Viewer。

## 原条件候选与拒绝门槛（追加核查后收回实施建议）

如果维护者确有“把一处测试敏感性缺口发给不装runner的评审者”的场景，可以做一个**零共享代码的两变体审阅页**：固定上述同一report及license，选id72/id81；保留原id/状态/location/replacement/可选测试关联，将原源码与变体并排，明确原工具与report来源未知run绑定。整份report的状态计数和分母独立放一栏，选段不是全项目分数。原文件key可能是producer绝对路径，展示alias不应假装同一basename永远唯一；保留raw身份映射，不泄漏本机新路径。

不自动给“该补哪个assertion”下结论，不把Survived当真实bug，不把Killed或高分当整体正确，不自动标equivalent或删除难杀mutant。Timeout、error、pending与ignored都保留各自状态；没有source hash/版本、测试命令、配置或run元数据就写未知，不能补造。

最小对照是原report查找id72，再看局部解释页，是否省掉定位token、解释状态和查测试关联中的具体一步？若原viewer同样一次可达，这个候选就不做；若表达式替换不能按位置忠实回核，就拒绝展示精确mutated源码。当前没有完成实机阅读对照，后文源码核查已确认原viewer自然覆盖该任务；**收回实施建议，不宣称已提高阅读或测试质量，也不启动实现。** 其他方向全部拒绝：跨工具统一分数、PIT source重建、mutation执行/自动修复均超出当前价值证据。

## 受限合同备查：若未来另有实际缺口才考虑

**存在减少证据转抄的技术复用点，但追加核查确认原viewer已提供这些关系，当前不推荐实施。** 手写页容易在换第二个mutant时抄错range、replacement或测试名字；一个只消费固定report、显式选择file+mutant ids的离线reader，可以机械保留原始状态和原文位置，并把无法解析的关联列出来。增量是减少证据转抄，不是增加新的mutation能力。它必须与原Elements viewer的同一问题对照；若已有viewer的file搜索、状态筛选和diff已一步完成，单做另一套reader不值得。

已核字段细节：当前官方schema要求顶层schemaVersion/thresholds/files，file必须language/source/mutants；mutant必须id/mutatorName/location/status。**replacement不是必需字段**，coveredBy/killedBy/testsCompleted/static也都不是必需。testFiles可缺，test source/location可缺，存在的test定义则必须id/name。不存在没有schema默认值，不可用空数组、0、false、空replacement覆盖未知；replacement若明确为空字符串，反而可表示真实删除，必须与未报告区分。

源码与坐标的准确边界如下：

- schema明确line与column均1基，start含/end不含；原片段必须从同report的files原source取，不回读本机同名文件或新HEAD。
- 官方[computeLineStarts](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/helpers/text.ts) 用JS charCodeAt扫描LF/CRLF/CR及Unicode行分隔；[getMutationLines](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/model/file-under-test-model.ts#L49) 在JS string上按column-1截取。实现因此使用UTF-16 code unit口径，但schema本身没有额外编码字段，不该扩称所有producer均一致。最小实验可先限定所选范围为LF+ASCII，拒绝或只原样显示其他坐标，避免假精确高亮。
- getMutationLines在replacement缺失时会回退description或mutatorName作显示文本；该fallback不一定是可执行mutated代码。受限reader应保留“替换源码未报告”，只显示原描述，不把fallback拼进代码后称真实mutation。
- [calculateMutationTestMetrics](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/calculateMetrics.ts) 将整份report所有testFiles的tests按id建立同一Map；[MutantModel](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/model/mutant-model.ts) 共享这份map再解析coveredBy/killedBy。引用不是按被测文件局部重置的id。schema的unique id描述也不能代替重复检测；小reader遇重复test id应拒绝名字解析，不能后写覆盖前写或猜是哪一个。
- MutantModel的便利getter会跳过未找到id、去重，并可能返回undefined；小reader不能用它生成“全部关联均解析成功”的表。应保留原id列表、逐个匹配结果和unresolved ids；coveredBy未报告、明确空、存在但无法解析是三种状态。
- 选择mutant时用原file key+id，禁止只用basename或line。即使schema说id可跨report关联，也不自行假定旧新report是同一变体；本实验不做baseline diff、历史身份或重命名匹配。

一个**仅供实验的最小消费合同**可以是：

| 边界 | 最小要求；不代表上游schema的全部能力 |
| --- | --- |
| 输入 | 固定schemaVersion=1.5的JSON、原始文件SHA和选择清单；先只验证上述官方fixture，不宣称支持所有1.x/2.x或其他producer |
| 选择 | 精确file key+最多几个mutant ids，缺失/重复/歧义明确拒绝；源身份由raw key保留，展示alias另列 |
| 输出 | 原status、mutatorName、原range及口径、同report source原片段、replacement原值/未报告、coveredBy/killedBy原id与解析结果；无求值、代码运行或测试推荐 |
| 源码范围 | 验证行/列为正整数、start不晚于end、均在source内；首版LF+ASCII范围；空replacement保留，未报告replacement不造代码，越界不clamp或静默修复 |
| 状态 | 八种官方status原样保留；unknown status拒绝，不降为Survived/Killed；不把测试没完成或未报告归成无覆盖 |
| 指标 | 首版只列全report原状态计数和选段计数，不必评分；若要给Stryker分数，必须显式detected/valid与covered分母，pending/ignored/error单列，分母0显示不可计算 |
| 交付 | 本地只读JSON；source/replacement/statusReason都按字面编码，拒绝图片/链接注入解释；严格字节/文件/选择数量bounds，新输出目录、wx不跟随symlink，不读report中的projectRoot磁盘路径 |
| 范围外 | runner、磁盘apply、AST/bytecode重建、mutation生成、LTL/表达式求值、实时流、HTTP/dashboard、自动修复、跨run可比性和全仓扫描 |

主要维护成本是schema版本漂移、不同producer坐标/缺省口径、status映射、旧fixture兼容、test id关联歧义和HTML字面安全，不是图布局。首版若为了显示两条变体就必须引入通用schema兼容层或重写原report viewer，应停止。建议把实验保留在独立目录，先证明“选择清单换id不会转抄错误、未知不会被吞掉、评审少哪一步”；只有这个收益出现后，才由维护者决定要不要长期保留。**此处仍是只读合同建议，未新增reader或公共CLI，也没有运行任何mutant。**

## 最小价值对照：固定版本原viewer已经能交付什么？

本节为固定Elements `9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a` 源码核对；**未打开浏览器、未实际点击、未构建或安装。** 不能把下面的代码路径写成测得的点击数或效率收益。

| 评审要做的事 | 固定源码已提供的机制 | 对新reader的判断 |
| --- | --- | --- |
| 找到errors.ts | [file-picker](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/components/file-picker/file-picker.component.ts) 提供搜索输入、匹配列表、文件/测试视图入口、键盘选择；[router](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/lib/router.ts) 用hash导航 | 不需重新生成文件目录或另写file picker |
| 同时看到72和81这两类缺口 | [file.component](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/components/file/file.component.ts#L233) 默认启用Survived/NoCoverage/Timeout；当前errors.ts里有1Survived、1NoCoverage、23Killed，没有Timeout，因此默认留下所选两条 | 这不是需要手动设置很多过滤才能找到的特殊用例，不再为它另做subset reader |
| 看准确原片段和变体 | 同一file组件按location给原source标记mutation；点击后高亮原行并插入getMutatedLines结果，Escape可取消，前后按钮切mutant | 原/变体代码阅读已经存在；新实现只会重复range截取和显示风险 |
| 知道有覆盖却survived | [drawer-mutant](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/components/drawer-mutant/drawer-mutant.component.ts#L50) 直接显示Covered by N tests，Survived时加yet still survived；详情列匹配到的测试名、可用位置、killedBy、statusReason | 核心解释不是原viewer缺失；fixture72的4个id都有定义可匹配 |
| 把文件位置交给别人 | [README](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/README.md) 记录anchor deep linking；app按view与file path找context，文件链接可留在同一HTML的fragment | 可发原报告并说明errors.ts、line10和17；不需要对两条变体生成第二份拓扑或新证据格式 |
| 让没有runner的人打开 | Stryker [HTML reporter](https://github.com/stryker-mutator/stryker-js/blob/c18ed458dc9defe1e4d7162cdec345d5073bff38/packages/core/src/reporters/html-reporter.ts) 读取Elements已构建IIFE脚本，内嵌scriptContent，再把完整report绑定到app.report；样式源码也采用[inline CSS](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/style/index.ts) | 已有单HTML打包机制，接收方无需安装runner或重新mutation；未实际离线断网验证，不扩大为所有环境零网络保证 |

按已读逻辑，一条可自然复用的阅读路径是：从报告文件页深链接进入errors.ts（或搜索该文件），保持默认过滤，分别点line10的Survived条件与line17的NoCoverage块，查看diff和抽屉。这里是**源码推导的操作顺序**，并非本次测得“一两步完成”。尤其不把file搜索、两个变体选择、抽屉展开混算成一次点击。即便需要逐条点选，这也没有证据说明新reader更省事。

### 仍存在的边界，但不足以启动新reader

当前已查app/file/drawer/router没有选定mutant集合的导出按钮；router保存的是view+文件路径，file组件的selectedMutant是本地状态，没有在本次已查代码中同步id72/81或status checkbox到URL。因此不能宣称一个链接会同时固定两条展开diff与过滤状态。它能交付文件级入口，精确id/range可附一段文字。

测试关联getter会丢掉无法匹配的id，抽屉只显示解析到的关系；未报告coveredBy、明确空数组和无法匹配并不都在UI中独立显式展示。对未知元数据的完整审计，raw report仍是权威。**本fixture的72关联都能匹配，81状态明确NoCoverage且缺coveredBy；没有构造出会让原viewer误导该评审任务的实际失败。** 不为未来可能存在的坏报告另造reader。交接时可直接附raw JSON/hash，并写明81未报告coveredBy、模型/命令/source revision等字段没有提供。

Stryker的standalone生成函数是该reporter模块内部函数，不是一个已经公开的“JSON转HTML”CLI；本次不会虚构命令调用它。现有用户若已经有HTML报告，直接复用。只有JSON时，Elements官方支持src加载或app.report绑定，使用本地已构建脚本即可复用原viewer；不需要实现新的字段解释器。Stryker这段代码证明了打包模式，但不能证明它精确依赖版本就是本次Elements commit；若实际验证应明确冻结Elements bundle来自本次源码。

### 如root要交互验证：准确预览路线与执行成本

当前不发起安装或构建。固定源码已有[tests-example/index.html](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/tests-example/index.html)，通过app.src取相邻JSON，脚本路径为`/mutation-test-elements.js`。[Vite config](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/vite.config.ts) 在开发模式将该路径映射到src/index.ts；不能直接用file协议双击这个fixture声称可离线。

若维护者决定值得验证，可在**单独的上游checkout**固定上述Elements SHA，按其[package scripts](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/package.json) 与[Nx依赖](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/nx.json)准备依赖并构建类型，再启动本地Vite：

```sh
# 仅供root决定后执行；本轮未执行。工作目录必须是固定的上游checkout。
# 上游packageManager声明pnpm@12.4.2；先确保该工具链可用，不在本报告自动安装。
pnpm install --frozen-lockfile
pnpm exec nx run root:build:tsc
CI=1 pnpm --filter mutation-testing-elements start --host 127.0.0.1 --port 4173 --strictPort
```

对应预览是`http://127.0.0.1:4173/testResources/tests-example/index.html#mutant/errors.ts`。文件路径由[normalize/commonBasePath](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/metrics/src/helpers/file.ts)与当前fixture文件集合推得，**未实际导航验证**；失效时使用file picker搜索errors.ts。`CI=1`抑制Vite自动打开浏览器，由root统一使用现有EgoSpace4。

这些命令会获取依赖并执行第三方安装/代码生成/TypeScript/Vite源码，即使没有运行mutation，也不是“只读JSON”或零上游执行；root可以选择不做。按已查Nx配置，build:tsc依赖schema生成，start依赖build:tsc，不是test/stryker目标；不加test、stryker、all、release或下载增量报告脚本。实际是否启动、构建兼容性与浏览器交互都尚未验证。

当前建议：**到此停止reader实施，只保留研究。** 若日后原viewer真不能在实际交接条件下使用，先验证复用官方app.report的离线打包，不新增Archify公共CLI。尚没有具体缺口需要提出“1脚本+1Explainer”的替代合同，前节合同只是未来边界备查，不是实施建议。

## 验证边界

所有引用为一手GitHub固定revision源码/fixture；许可直接查对应文件。PITMuS API许可识别为NOASSERTION，本次LICENSE与README明确Apache-2.0，未把API结果当无许可。只用本地JSON读取/算术核对现成字段，没有执行upstream程序、测试、编译或网络报告器。纯研究文档按CONTRIBUTING检查来源、链接、口径与字面，没有产品测试或截图。仅新增本报告，不改研究中心README、产品或他人文件，不commit/push。
