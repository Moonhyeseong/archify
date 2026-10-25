# 安全报告的 code flow：步骤证据，不冒充运行轨迹

2026-10-25，只读研究。检索全部既有scouts并按owner/repo去重，本轮6个新来源；已有诊断/source/symbol报告不再重做。固定Archify base `82c7e0f089a02a4d514714adf37dc2061682da5f`。未运行扫描器、上游程序、样例目标或漏洞检测，没有真实目标扫描。

**结论：现有Explainer的有序步骤、原文snippet与来源已够做一个窄内容原型，尚无共享Viewer或通用SARIF parser的实施理由。** 最具体的机制是：以报告中的步骤出现位置为身份，保留原数组顺序；把源码位置作为证据，不拿它排序、去重或伪装运行时间。Semgrep公开fixture恰好能检验这个区别。

## 6个固定一手来源

日期为commit日期，不是release保证。OASIS是官方合同来源，不能当普通MIT开源库。SARIF可描述模拟或监测的程序执行；不能仅因文件名SARIF，就统一宣称静态或动态。

| 来源与固定commit | 许可 | 核实的具体机制与边界 |
| --- | --- | --- |
| [oasis-tcs/sarif-spec](https://github.com/oasis-tcs/sarif-spec/tree/1742a253eb654bf8a4ed7c60eaef7412b2c23553)，`1742a253eb654bf8a4ed7c60eaef7412b2c23553`，2026-10-15 | [OASIS仓库条款/IPR政策](https://github.com/oasis-tcs/sarif-spec/blob/1742a253eb654bf8a4ed7c60eaef7412b2c23553/LICENSE.md)，非MIT | 本报告固定读2.1 schema及prose，不把仓库2.2草案新字段混入2.1。threadFlow是可能路径；locations可省略中间位置且可重复，但已提供项须按展示问题的执行顺序排列。 |
| [microsoft/sarif-sdk](https://github.com/microsoft/sarif-sdk/tree/aaf860dff84137c7a6346f2bd6c4a5642a33b3c5)，`aaf860dff84137c7a6346f2bd6c4a5642a33b3c5`，2026-10-20 | [MIT全文](https://github.com/microsoft/sarif-sdk/blob/aaf860dff84137c7a6346f2bd6c4a5642a33b3c5/LICENSE)，API识别NOASSERTION不等于未许可 | 有run.threadFlowLocations缓存、单个位置index引用及局部覆盖的官方输入/期望输出。GH1002要求GitHub ingestion使用inline，是消费端profile限制，不是SARIF通用非法。 |
| [semgrep/semgrep](https://github.com/semgrep/semgrep/tree/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b)，`087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b`，2026-10-22 | [LGPL-2.1](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/LICENSE)根许可；不推及商业Pro服务 | 官方e2e expected SARIF有4个taint步骤：同一行两处不同表达式、后续传播与sink。对应test调用SARIF输出及--dataflow-traces；本轮只读，没有重跑。 |
| [microsoft/sarif-vscode-extension](https://github.com/microsoft/sarif-vscode-extension/tree/7b4a08983025ba37f545c6ced3ef40d5413edee4)，`7b4a08983025ba37f545c6ced3ef40d5413edee4`，2026-10-20 | [MIT](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/LICENSE) | details.tsx的Analysis Steps有序列表、nesting缩进、点步骤定位源码。实际只取codeFlows[0].threadFlows[0]，所以不能借用其UI就称展示全部路径。getOriginalDoc按扫描commit取原文，避免当前工作区漂移。 |
| [github/codeql-action](https://github.com/github/codeql-action/tree/3306ba4df796b6b5059316f3af8bdea1e2138c9b)，`3306ba4df796b6b5059316f3af8bdea1e2138c9b`，2026-10-23 | [MIT](https://github.com/github/codeql-action/blob/3306ba4df796b6b5059316f3af8bdea1e2138c9b/LICENSE)，不扩大为CodeQL引擎许可 | fingerprints.ts给finding添加primaryLocationLineHash，服务跨run追踪；这不是threadFlow中每次出现位置的身份。valid-sarif.sarif是公开ingestion fixture，但本轮所读该fixture没有codeFlows，不能当taint-path样例。 |
| [microsoft/sarif-web-component](https://github.com/microsoft/sarif-web-component/tree/d85d252f7bf651eb79047b5a63cec00b4574f8f3)，`d85d252f7bf651eb79047b5a63cec00b4574f8f3`，2026-10-16 | [MIT](https://github.com/microsoft/sarif-web-component/blob/d85d252f7bf651eb79047b5a63cec00b4574f8f3/LICENSE) | Snippet.tsx区分region/contextRegion，按line/column范围显示上下文；已读实现只处理有startLine的line/column范围，对offset/length情形回退；不据此证明支持全部columnKind。主要是finding/source列表，不把源码path cell称执行路径或全flow viewer。 |

## 合同：不要擅自补全的六件事

一手固定文本：[SARIF 2.1 schema](https://github.com/oasis-tcs/sarif-spec/blob/1742a253eb654bf8a4ed7c60eaef7412b2c23553/sarif-2.1/schema/sarif-schema-2.1.0.json)、[2.1 prose](https://github.com/oasis-tcs/sarif-spec/blob/1742a253eb654bf8a4ed7c60eaef7412b2c23553/sarif-2.1/prose/sarif-v2.1.0-committee-specification.htm)，§3.36–3.38。

- 一个codeFlow可含多个threadFlow；它们共同描述与finding有关的模式。不能全部拼成一条调用链，也不能仅显示第一条却隐瞒其余数量。不同codeFlow的路径也不可擅自合并。
- locations是**提供的有序位置**，不是完整每行执行记录。重复元素合法；循环模拟可重复到达同处。去重uri:line、按源码行列排序都会丢语义。步骤key可用run/result/codeFlow/threadFlow/location数组索引组成原始JSON pointer；它只定位本份报告，不能宣称跨run稳定身份。
- executionOrder用于有意义的跨thread相对顺序；缺省-1是未知，不是0步。不同thread同一值有合同意义，但只能表达生产者所报告的模式，不能升级成已观测真实并发。没有executionTimeUtc则没有实测UTC时间，更不能将数组索引变成ms。
- nestingLevel是包含层级，importance是理解路径的重要程度；它们不是递归调用深度证明、风险概率或可忽略事实。若折叠unimportant，必须保留原ordinal与隐藏条数，不能把省略前后两个位置画成新直接调用。
- 没有codeFlows表示**未提供路径**，不是“无数据流/确认安全”。缓存index、外部属性文件、artifacts索引或URI base尚未解析时，标unresolved；不能把缺location当空路径、零步骤或本机文件。不可为了显示而自动访问报告URL/本机绝对路径。
- location.region/snippet定位源码证据；需保留revision、run.columnKind、缺失列/终点等状态。UI默认列1不等于生产者提供了列1。state值是multiformatMessageString等报告内容，不是通用JSON状态快照，更不是程序堆内存的完整证明。

## 深读1：Semgrep四步fixture，正好会被“按行排序/去重”破坏

固定[expected results.sarif](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/snapshots/test_output_sarif/test_sarif_output_with_dataflow_traces/results.sarif)，SHA-256 `e56bbc86a088bbf196979098a932ed4abe70d81ddef749bd28078c449fe366db`；SARIF2.1、run0/result0/ruleId=rules.classic、1codeFlow/1threadFlow/4locations。这是官方测试输出快照，不是本次扫描，也不是生产漏洞验证。

| 原location ordinal | report message角色/片段 | targets/taint/taint.py位置 | 已提供元数据 |
| --- | --- | --- | --- |
| 0 | Source / source1() | L3 C9–18 | nestingLevel=0 |
| 1 | Propagator / a | L3 C5–6 | nestingLevel=0 |
| 2 | Propagator / b | L8 C9–10 | nestingLevel=0 |
| 3 | Taint reaches / sink1(b) | L9 C5–13 | nestingLevel=1 |

表中列号是原startColumn/endColumn字段，endColumn为不含端点；不是两个inclusive端点。四项均没有executionOrder、executionTimeUtc、importance字段；不补入“真实时间”“重要程度”或跨thread顺序。若按行去重，ordinal0/1会被合并；若按行列排序，C5会被放在C9前，颠倒原路径步骤。原始ordinal与完整span必须并列显示。

对应[测试函数](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/test_output_sarif.py)是test_sarif_output_with_dataflow_traces，输入[规则taint.yaml](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/rules/taint.yaml)与[源码taint.py](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/targets/taint/taint.py)。源码L4是`if True`，L6为sanitize1，L8却在else内；expected路径含L8。**不能把这个静态expected witness说成这段源码本次实际走过的分支。** 本轮未重跑工具，不由此诊断当前引擎误报；只证明输入/快照的证据种类不能被播放器升级。

可借鉴的一个机制：现有VSCode Analysis Steps把每个报告位置保留成一个可选行，消息/文件/行列邻近呈现，并跳转原源码；这比把变量误当服务参与者画Sequence更准确。[details.tsx](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/src/panel/details.tsx)还暴露“仅首flow首thread”的范围边界，内容原型须显式标明当前选择/总数，不照搬其隐含截取。

## 深读2：SDK缓存位置fixture，index不是步骤顺序

官方[GitHubIngestionVisitor输入ThreadFlowLocations.sarif](https://github.com/microsoft/sarif-sdk/blob/aaf860dff84137c7a6346f2bd6c4a5642a33b3c5/src/Test.UnitTests.Sarif/TestData/GitHubIngestionVisitor/Inputs/ThreadFlowLocations.sarif)，SHA-256 `8c25a8b4d726f832c9325ca58ae18832e60a72676e0a468de559f0862c4358f8`；[期望输出](https://github.com/microsoft/sarif-sdk/blob/aaf860dff84137c7a6346f2bd6c4a5642a33b3c5/src/Test.UnitTests.Sarif/TestData/GitHubIngestionVisitor/ExpectedOutputs/ThreadFlowLocations.sarif)，SHA-256 `026fc24c1df675d36ca631bb95305ddfe820b46d82f7008e975c47f86c9ca6b7`。

输入有run.threadFlowLocations三项缓存（collections/list.h L15/L18/L25），实际thread的三项出现分别用index0/1/2引用，并有局部message/state/properties。输出将其inline：第一项采用当前出现的“Variable ptr declared”消息及`state.ptr.text="null"`（报告字符串），而非缓存旧消息/旧state；第三项properties合并为b22/c3/d4，说明不能只取缓存对象，也不能把引用index当“第几步”或持久事件id。

中间项importance=unimportant、nestingLevel=1，前后为essential；原fixture还给了UTC字符串。但这是SDK单元测试的合成fixture，不是监测程序执行所得的时间证据，不能借其timestamp教学成“真实延迟”。run.columnKind=utf16CodeUnits，源码列单位与普通UTF-8字节offset不是一回事。

[GH1002实现](https://github.com/microsoft/sarif-sdk/blob/aaf860dff84137c7a6346f2bd6c4a5642a33b3c5/src/Sarif.Multitool.Library/Rules/GH1002.InlineThreadFlowLocations.cs)明确GitHub code scanning不显示依赖run缓存index的这类结果；其规则默认不启用。这是profile能力差异，不能把SARIF标准允许的index形式标成通用schema错误。Archify若只消费inline，应明确拒绝未解析引用；本轮不再实现一套完整解引用/覆盖/外部资源resolver。

## Archify是否需要新增能力

固定base源码检索archify/viewer/test未发现SARIF/codeFlows/threadFlows消费入口；同日GitHub标题SARIF issue检索为空，但这不证明没有其他相关提案。已有[Story](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/story-authoring.md)能按point顺序展示证据，并明确parallel呈现不证明并发；Explainer已有ordered steps、snippet与source revision/lines。Sequence箭头通常表示参与者交互，taint的表达式传播不是天然的进程调用；Lifecycle状态转换同样不等于安全报告的路径位置。不能为画图而重解释数据模型。

最多保留一个**内容实验候选**，不推荐产品实现：直接作者规范输入，把Semgrep上述4项做成Explainer有序步骤，旁边固定源码片段及“静态expected witness、不是本次运行”。保留ordinal0/1的不同列，明确只有1/1 flow被展示、其余未提供步骤数量未知；不加计时、程序运行器、路径推理或泛用parser。

可证伪任务只有三个：为什么同一行需要两步？能否按C5/C9排序？能否认定else被实际执行？候选必须让读者正确回答，且比原SARIF/现有Analysis Steps更容易；若只是换配色或原工具同样直接，停止。截图需完整显示4步、源码if/sanitizer/else与静态身份，固定1440×1000/390×844；不删掉让人困惑的分支来制造好图。本轮没有生成页面、截图或证明用户收益。

来源定位还要遵守[getOriginalDoc](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/src/extension/getOriginalDoc.ts)的教训：扫描commit与当前工作区可漂移；没有原revision不能默认为当前文件即原证据。[CodeQL fingerprints.ts](https://github.com/github/codeql-action/blob/3306ba4df796b6b5059316f3af8bdea1e2138c9b/src/fingerprints.ts)的finding追踪也不授权去重路径内的重复位置。[web Snippet.tsx](https://github.com/microsoft/sarif-web-component/blob/d85d252f7bf651eb79047b5a63cec00b4574f8f3/components/Snippet.tsx)对不支持的offset范围回退，比假装定位成功更诚实。来源URL、message markdown和snippet均是未信任内容，不执行/不自动抓取；literal显示即可。

本轮处置：**0个共享runtime/框架/parser实施建议，1个有条件内容原型**。读取快照不等于扫描成功、漏洞可利用、当前代码仍有问题或路径实际发生。只新增本报告，不改README/gallery/其他报告、不提交。
