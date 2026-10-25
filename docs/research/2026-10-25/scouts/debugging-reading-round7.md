# 调试阅读第七轮：缓冲事件、补齐栈和重新执行

2026-10-25。**本轮0项实施推荐。** 六个此前未覆盖的一手来源中，深入 Hunter 与 space-tracer 的实现和完整公开测试。可迁移的是来源标记和观察范围的审阅要求；没有发现足够证据支持新 recorder、replay、causal viewer 或 converter。所有阅读在固定源码上完成，未运行上游、用户代码、编译器、调试器、测试或浏览器，未安装工具。

## 查重与当前基线

对本轮开始时 hub **46份 scouts** 的仓库引用排重，再复读 execution-reading、adjacent-discovery-round3 的相关机制。Birdseye、heartrate、VizTracer、Moirae、ShiViz、RaftScope、Loupe、Speedscope、Perfetto等已覆盖，不重新计为新发现。Birdseye 的表达式选择与保留迭代采样已有深入源码和 fixture，本轮只核查索引后停止；它的邻近项目 snoop 是不同仓库，但同类行日志机制不因此算独立产品机会。

比较最新已合入 [dev `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`][archify]，**#1102已合入**，不能再按未合入候选扣除。当前 [#1103][pr1103] 读取 head `f0be206acbc90eb7c6c6b636030e3eb28963d284`、OPEN，仍按Atlas module/file/function依赖/findings→Classic来源范围排重；不把它称dev已有或runtime因果查看。

## 六个新来源：范围、固定版本与许可

| 官方来源 / 固定 SHA | 许可和实际实现 | 公开输入与阅读动作；采用判断 |
| --- | --- | --- |
| [Hunter][hunter] `b29fb483a14db7cedbb68d354ffd6188c0415c68` | [完整BSD-2-Clause][hunter-license]；[Backlog predicates.py][hunter-backlog]、对应[Cython实现][hunter-cython] | [test_backlog][hunter-test] + [sample7args.py][hunter-fixture] 完整公开。触发条件到达时，先显示有限缓冲和补齐调用上下文，再交给正常action；不是倒放程序。深读，保留审阅规则，不建事件importer |
| [space-tracer / live-py-plugin][space] `97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a` | [完整MIT][space-license]；[code_tracer.py][space-instrument] 插桩、[report_builder.py][space-builder] 按原行号横向追加 | [loops完整测试文件][space-test] 同时含源码和期望。将同一行多次迭代值并排；编辑后新运行，不是重放。深读后与既有Birdseye迭代阅读重叠，拒绝新增模型/内容分支 |
| [snoop][snoop] `f2f345f3ccc67e170b5329d345acd82e146a62b1` | [完整MIT][snoop-license]；[tracer.py][snoop-core] 保存frame/line上下文并处理call/line/exception/return | [完整exception.py][snoop-input] 与 [Python3.11期望文本][snoop-output] 可对照。嵌套行日志和异常文字是观察表示，不是可恢复状态；不把固定12:34占位时间称实际采集时间，不新建日志平台 |
| [PySnooper][pysnoop] `4be5c156ffc3315011c42ba521c4d8487052d289` | [完整MIT][pysnoop-license]；[tracer.py L505–586][pysnoop-core] 对比局部变量repr、输出异常/返回 | [samples/exception.py][pysnoop-input] 内有完整输入及expected_output。`Call ended by exception`与return事件需区分；repr相同不证明对象身份或全部状态未变。与snoop属相近机制，不把两仓算两种实施方向 |
| [PuDB][pudb] `59405ab54d9f804fe5bd656f86c4bfb56c458bd4` | [实际MIT/X Consortium文本][pudb-license]（API为NOASSERTION）；[debugger.py][pudb-core] 当前frame导航、断点/交互状态 | [manual test-postmortem.py][pudb-input] 是完整已提交小例，但文件明确manual，不冒充自动通过。选栈帧不是回到过去的完整进程状态；现有SourceCard能读片段，Archify不需要活动调试会话 |
| [rr][rr] `c145f2f80e63e9627b79deed6e0d3eae0d658e38` | [LICENSE][rr-license] 主体MIT式文本并列BSD及特定third-party/GPLv2条款，不能笼统说整仓MIT；[ReplayTimeline.h][rr-timeline] 管理Mark/checkpoint及反向执行 | [reverse_continue_breakpoint.c][rr-input] 与 [对应GDB脚本][rr-test] 是公开测试程序/断言，不是完整已提交trace。这是较大的原生记录重放系统，作为负面对照；不复制/部署runtime，也不把它降格为日志步骤按钮 |

## 深读一：Hunter 的输出不全是“当时捕获的call事件”

### 完整公开输入和机器期望

固定 [tests/sample7args.py][hunter-fixture] **1189 bytes**，SHA256 `04c4776d882f178a1c57ddbfc0c9026a75b0fcbf4865ee471ed62c49be87bf85`。完整 [tests/test_integration.py][hunter-test-file] **38258 bytes**，SHA256 `37416b879c88a5b34c1a88b6db5d41617b9607324ab6edf910dbac9cbfdb76bc`。其中 [L660–730 test_backlog][hunter-test] 设 `size=19`、`stack=5/6`、`vars=False`，条件为源码包含 `return i`，过滤函数six，并连续调用one两次检验可复用。

它的期望文本是LineMatcher模式，包含通配符；**不是一份本轮采集的逐字raw log**。前部期望一条`depth=0 calls=-1`的one调用，后有原缓冲行以及不带backlog后缀的`return i`触发行。`calls=-1`来自构造栈上下文，不能理解成负数次调用或一次真实计数。测试专用 [DebugCallPrinter][hunter-printer] 显式输出depth/calls；普通printer未必带这个标记，不可据此设计适用于任意Hunter文本的隐式分类parser。

### 实现如何产生三种不同证据

| 输出组成 | 固定实现事实 | 读者不可推导 |
| --- | --- | --- |
| 触发前缓冲事件 | [Backlog L653–679][hunter-backlog] 用`deque(maxlen=size)`；未命中时detach并入队，超出容量会丢旧项 | 看见前19项不代表这是函数/进程完整历史，缺行不表示未执行 |
| 补齐的栈上下文 | [L688–720][hunter-fill] 从仍可用frame链构造call事件，`calls=-1`；`vars=False`时其locals/globals为空 | 这些行提供栈层级，不是声称该call事件在所保留窗口中被捕获，不能给它补造时间戳 |
| 条件匹配事件 | [测试L665–674][hunter-test] Backlog predicate返回条件结果，外层另配置正常action | 缓冲flush的显示顺序≠程序逆向执行，也不证明触发事件由所有前置项共同导致 |

[Cython版本L669–719][hunter-cython] 与所读Python路径同样构造`calls=-1`并flush队列，不依赖只读到纯Python备用代码得出结论。flush后队列无条件clear；`strip`另在depth<1清理。docstring对strip的描述不能替代此实际控制流，本轮没有运行来提出通用bug结论。

还有两个小而重要的边界：过滤six不等于five源码中三处`six()`未执行；显示源码赋值文字`a=b=...='effect'`也不等于保留了变量快照，因为测试明确vars=False。`Event.detach`的[实现/文档][hunter-detach] 说明未提供value_filter时arg/globals/locals不保留；Backlog还重新保存frame供栈补齐，因此不能笼统把它当一个脱离进程、可序列化的无引用事件库。

**可移植的只是审阅问题**：“某条call是窗口内捕获、栈上下文补齐，还是正文源码？”这比泛化“看前几步”更具体，但当前没有Archify用户持有这种输入的任务。缺少独立raw trace/可携合同，且默认printer未稳定暴露分类，不建议把测试匹配文本转成新图。

## 深读二：space-tracer 是按行对齐的重新执行报告

完整 [test_code_tracer_loops.py][space-test-file] **6077 bytes**，SHA256 `a17e37b1ceaf6aede910c3f8954c1854e1da7f68611a0895a2dfe21d2058b409`。其 [test_loop L11–24][space-test] 提交的完整输入是`i=1; for j in range(3): i+=j`三行代码；期望按行是初值`i=1`、三列`j=0/1/2`、三列`i=1/2/4`。这是上游测试的期望，未在本轮执行。不能称真实用户调试记录或由本轮实际观察确认的结果。

[visit_For L417–433][space-instrument] 在每轮body入口插start_block并记录循环target；[report_builder L67–92][space-columns] 找原行区间的最大现有宽度，补空格加pipe，再追加下一轮。[add_message L180–194][space-add] 按`line_number-1`写行字符串。因此横轴是此循环的显示分组，不是时间间隔；嵌套测试 L111–127也有完整outer/inner分组断言，不应把第n列在全文件所有行都当同一个全局时刻。

编辑后的链路是 [Sublime更新 L302–320 / Popen L70–80][space-editor]→当前源码输入→[main新ReportBuilder][space-run]→[module_importers compile/exec][space-exec]。**新显示来自新执行，不是同一次recording上的历史查询，也不保证撤回外部副作用。** [report_builder get_repr][space-repr] 还能把长repr缩略为头尾及`[N chars]`；repr失败回退类名。未执行分支、过滤或截断都可能使单元空白，不能当作null/0；[message/width限制测试L187–220][space-limit] 明确期望RuntimeError，而不是完整运行成功。

同一源码位置的迭代值并排确实可读，但 [adjacent-discovery-round3](adjacent-discovery-round3.md) 已深入Birdseye的固定表达式选择、嵌套迭代路径、采样与截断，附完整测试。space-tracer只把组织方式换成源码旁字符串列，没有新的自然Archify阅读问题。直接给既有Explainer一张表即可；不推荐新迭代播放器、值历史schema或实时执行器，也不为这三行再开内容分支。

## 与 Archify 已有能力及其他报告的边界

| 现有责任 | 本轮对照 |
| --- | --- |
| dev10b已有[Explainer Walk/SourceCards][archify-reader]，#1102含node explanation/drilldown | Walk定位作者步骤与图；不是恢复执行状态。固定源码、期望文本与边界可放正文/来源卡，不需要新debug inspector |
| [Timeline/Waterfall/Sequence schemas][archify-schemas] | 可表达明确给出的时间区间/消息交互，不自动获得调用栈、因果、重放或完整变量状态；本轮没有duration/稳定messageId输入，不把日志行强画时间瀑布 |
| Trace waterfall、Test failure/context、Copy identity等既有实验 | 已有受限输入/来源和观察边界；本轮不重复异常页面、事件浏览器或对象别名图。局部变量repr变化不能证明完整heap身份/修改来源 |
| [execution-reading](execution-reading-smalltools.md) 的Moirae/ShiViz | 已区分seq与时间、重复投递、相邻state patch与因果、vector partial order。本轮不重复“时间线不等于因果图”；Hunter的新增事实仅是补齐栈事件的来源分类 |
| PR1103 Atlas | 按依赖/complexity/findings到Classic源码，不是runtime记录。没有理由为了调试阅读复制另一套canvas/平台；也不能因它不重放程序就称产品缺陷 |

## 价值、成本和停止条件

本轮保留**两条审阅要求，零实施候选**：①记录/显示中存在补齐项、过滤/容量省略时，必须按实际字段说明，不能宣称完整捕获；②同源码不同迭代/新运行必须分开，repr与完整值、观察先后与因果必须分开。这些是针对所读实现的证据边界，不是新增统一metadata合同。

若以后真的收到一份可分享的Hunter报告，需要先确认它是否显式带stack-fill标记、捕获上限、filter、来源revision及完整原记录；没有就标未知，不从缩进/消息文字猜。现有Explainer的原文+小表+SourceCards应先尝试解决。只有它仍不能让读者判断某一条记录的来源，且有固定失败/改善证据，才值得讨论一个窄内容样例；本轮没有这样的用户输入或对照，不为凑数建converter。

rr提供的真正反向执行依赖原生recording/checkpoint/调试状态，PuDB依赖活动或postmortem frame；都不适合为离线说明页引入。SourceCard能展示源码不等于能重放进程，步骤按钮存在也不等于拥有程序运行状态。没有产品改动、图或截图，未验证效率/理解正确率或用户收益。

## 本轮检查

按CONTRIBUTING的prose影响，只核内容、固定链接、许可、原fixture摘要及与当前base的一致性，不运行产品测试/fullsuite。所有上游测试只读其源码/断言，未声称本机通过；也未安装/执行未知上游代码。只新增本报告，不修改README/索引/其他报告或远端状态。

[hunter]: https://github.com/ionelmc/python-hunter/tree/b29fb483a14db7cedbb68d354ffd6188c0415c68
[space]: https://github.com/donkirkby/live-py-plugin/tree/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a
[snoop]: https://github.com/alexmojaki/snoop/tree/f2f345f3ccc67e170b5329d345acd82e146a62b1
[pysnoop]: https://github.com/cool-RR/PySnooper/tree/4be5c156ffc3315011c42ba521c4d8487052d289
[pudb]: https://github.com/inducer/pudb/tree/59405ab54d9f804fe5bd656f86c4bfb56c458bd4
[rr]: https://github.com/rr-debugger/rr/tree/c145f2f80e63e9627b79deed6e0d3eae0d658e38
[hunter-license]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/LICENSE
[hunter-backlog]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/src/hunter/predicates.py#L621-L737
[hunter-fill]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/src/hunter/predicates.py#L688-L720
[hunter-cython]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/src/hunter/_predicates.pyx#L669-L719
[hunter-fixture]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/tests/sample7args.py
[hunter-test-file]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/tests/test_integration.py
[hunter-test]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/tests/test_integration.py#L660-L730
[hunter-printer]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/tests/utils.py#L8-L19
[hunter-detach]: https://github.com/ionelmc/python-hunter/blob/b29fb483a14db7cedbb68d354ffd6188c0415c68/src/hunter/event.py#L115-L165
[space-license]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/license.txt
[space-instrument]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/code_tracer.py#L417-L433
[space-builder]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/report_builder.py
[space-test-file]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/test/PySrc/tests/test_code_tracer_loops.py
[space-test]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/test/PySrc/tests/test_code_tracer_loops.py#L11-L24
[space-columns]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/report_builder.py#L67-L92
[space-add]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/report_builder.py#L180-L194
[space-editor]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/sublime/python_live_coding.py
[space-run]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/main.py#L422-L438
[space-exec]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/module_importers.py#L203-L225
[space-repr]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/plugin/PySrc/space_tracer/report_builder.py#L238-L258
[space-limit]: https://github.com/donkirkby/live-py-plugin/blob/97da4f67d526ef426dcf0f3de8d60c8fc0f3f93a/test/PySrc/tests/test_code_tracer_loops.py#L187-L220
[snoop-license]: https://github.com/alexmojaki/snoop/blob/f2f345f3ccc67e170b5329d345acd82e146a62b1/LICENSE.txt
[snoop-core]: https://github.com/alexmojaki/snoop/blob/f2f345f3ccc67e170b5329d345acd82e146a62b1/snoop/tracer.py#L230-L280
[snoop-input]: https://github.com/alexmojaki/snoop/blob/f2f345f3ccc67e170b5329d345acd82e146a62b1/tests/samples/exception.py
[snoop-output]: https://github.com/alexmojaki/snoop/blob/f2f345f3ccc67e170b5329d345acd82e146a62b1/tests/sample_results/3.11/exception.txt
[pysnoop-license]: https://github.com/cool-RR/PySnooper/blob/4be5c156ffc3315011c42ba521c4d8487052d289/LICENSE
[pysnoop-core]: https://github.com/cool-RR/PySnooper/blob/4be5c156ffc3315011c42ba521c4d8487052d289/pysnooper/tracer.py#L505-L586
[pysnoop-input]: https://github.com/cool-RR/PySnooper/blob/4be5c156ffc3315011c42ba521c4d8487052d289/tests/samples/exception.py
[pudb-license]: https://github.com/inducer/pudb/blob/59405ab54d9f804fe5bd656f86c4bfb56c458bd4/LICENSE
[pudb-core]: https://github.com/inducer/pudb/blob/59405ab54d9f804fe5bd656f86c4bfb56c458bd4/pudb/debugger.py
[pudb-input]: https://github.com/inducer/pudb/blob/59405ab54d9f804fe5bd656f86c4bfb56c458bd4/manual-tests/test-postmortem.py
[rr-license]: https://github.com/rr-debugger/rr/blob/c145f2f80e63e9627b79deed6e0d3eae0d658e38/LICENSE
[rr-timeline]: https://github.com/rr-debugger/rr/blob/c145f2f80e63e9627b79deed6e0d3eae0d658e38/src/ReplayTimeline.h#L23-L108
[rr-input]: https://github.com/rr-debugger/rr/blob/c145f2f80e63e9627b79deed6e0d3eae0d658e38/src/test/reverse_continue_breakpoint.c
[rr-test]: https://github.com/rr-debugger/rr/blob/c145f2f80e63e9627b79deed6e0d3eae0d658e38/src/test/reverse_continue_breakpoint.py
[archify]: https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0
[archify-reader]: https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L474-L488
[archify-schemas]: https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas
[pr1103]: https://github.com/tt-a1i/archify/pull/1103
