# Round 15：行为证据、样本与推测的阅读边界

2026-10-25；只读发现。先核研究中心README与全部scouts，当次去重索引含472个GitHub repository路径，以下4个项目未在索引中出现。未设star门槛或按star排序。固定源码/README/完整fixture由GitHub contents与tree API读取；**没有安装、执行被研究程序、运行其测试或打开浏览器**。上游测试中的expected和已提交生成页不称本轮实跑，也不因固定commit就获得可信执行证明。

结论：**0个立即实施推荐。** 可保留两条作者阅读原则：把“写出/完成顺序”与“调用进入顺序”分开，把“总次数”与“样本值”分开。下列来源已经提供原生阅读入口，尚无具体证据证明再做一份Archify页面可以省掉关键阅读动作。没有理由新增trace parser、采集器、runtime overlay或公共CLI。

## 4个新来源及输入合同

| 项目 / 固定SHA / 许可 | 完整输入或已提交输出 | 真实机制与语义上限 | 现有Archify表达与取舍 |
| --- | --- | --- | --- |
| [mihneadb/python-execution-trace](https://github.com/mihneadb/python-execution-trace/tree/c4397a5342e51e7451c4c85b538d047636f391b0)；`c4397a5342e51e7451c4c85b538d047636f391b0`；[MIT](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/LICENSE) | `execution_trace/tests/functions/f_recursive.py` 是完整小fixture：decorated函数、args与完整expected_trace；consumer为`tests/test_record.py`。不是独立采集JSON。 | AST插桩记录函数局部状态，值先转`repr`；输出首行source，随后每行一个调用帧的data。递归帧在finally写出，所以expected最内层先写。没有提供完整caller/entry事件关系。 | 可用Explainer表明确“输出记录序号/局部源行/repr值”。不能直接把记录顺序做成调用Sequence；原viewer已有每帧源码行与状态步进，无缺口就不再包装。 |
| [yananchuk/exec_tracer](https://github.com/yananchuk/exec_tracer/tree/2f06c3f18dd3d9727a70db3dd8034737b88c60fa)；`2f06c3f18dd3d9727a70db3dd8034737b88c60fa`；[MIT](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/LICENSE) | `examples/loops/`完整demo.py、worker.py、已提交trace.md与trace_sequence.md；本轮只读，不产生新trace。 | 同一采集对象可出aggregate调用图和按调用事件展开的sequence；默认图限制边数，函数表用首次参数/首次返回；序列压缩连续调用。已提交loop例中x100与四个展示样本/96省略共存。 | 原生Architecture可承载带计数边；Sequence可承载已报告调用/返回，但不能凭aggregate补出每次。上游两种输出已正面回答“为什么x100不是100条箭头”，不建议新converter或内容实验。 |
| [aborjan1/flowcli](https://github.com/aborjan1/flowcli/tree/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07)；`f93df8dc722789fc3c0d0144de3c7bf1b47dfc07`；[MIT](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/LICENSE) | 完整`tests/fixtures/traceproj/`两文件及`tests/test_tracer.py`。另有完整`MODEL/report.json`，其meta明确`simulated=true`、`has_runtime=false`；不是该fixture实跑report。 | 静态模拟与runtime capture分开；模拟值标`~`，运行结果存dynamic。采集只覆盖root过滤后Python帧，有5个repr样本、8种类型、2000条事件等上限；源码明确异常展开可能与返回None混同。 | 可用Explainer同表分“声明/静态推导/采集”，没有采集值写未知；无timestamp的边序列不能变瀑布图。当前无可直接复用的已提交完整runtime输出，拒绝拿静态MODEL替代，亦不为了补证授权执行。 |
| [kangtegong/pyftrace](https://github.com/kangtegong/pyftrace/tree/a7fe9057a1da28b4ca8b35fc22bec72d01d7b79f)；`a7fe9057a1da28b4ca8b35fc22bec72d01d7b79f`；[MIT](https://github.com/kangtegong/pyftrace/blob/a7fe9057a1da28b4ca8b35fc22bec72d01d7b79f/LICENSE) | `examples/module_trace/`完整3个文件；README保留完整basic/path两种示例输出，不称机器receipt。 | 打印call/return，path模式把callee定义位置与caller位置分别列出；Python版本与argument选项影响monitoring/setprofile backend。stdout中也含被测程序print，不能把每行都识别成trace事件。 | Sequence+source表足以表达所列call/return及两种位置；不能据return文字断言业务成功/异常不存在，过滤也不等于调用未发生。现文本已读得清楚，没有新增可验证阅读缺口。 |

## 深读一：递归expected为什么先出现x=0？

精确fixture：[f_recursive.py全文](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/tests/functions/f_recursive.py)。输入args为2，递归到0后返回；expected由三个data对象组成，对应x=0、1、2，辅助return值分别为1、2、3。文件自身已有注释解释最内层先列；此处只核源码/expected，没有执行它。

生产者的[record.py L34–46](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/record.py#L34-L46)把局部值转为repr字符串；[L116–140](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/record.py#L116-L140)在调用栈上push记录，并在finally dump再pop。[L266–284](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/record.py#L266-L284)按顶部帧写一行。因而上游expected的对象顺序是完成/写出顺序；不能标成三次调用的进入顺序。局部`lineno`对应随记录保存的函数source，不能无来源映射就假装是仓库绝对行号。

consumer [test_record.py L63–78](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/tests/test_record.py#L63-L78)会在上游测试中调用fixture并比较expected；这是工具自有测试意图，不是本轮测试通过。viewer [viewer.js L24–54](https://github.com/mihneadb/python-execution-trace/blob/c4397a5342e51e7451c4c85b538d047636f391b0/execution_trace/viewer/static/js/viewer.js#L24-L54)已有选中帧、状态、源码行定位；值也不是可重新求值的原Python对象。

可复用作者原则：在表头写“记录帧序号”和“帧内步骤”，不要写无证据的全局执行时间。若未来已有真实capture，需保留原source、完整NDJSON、采集范围与文件摘要；缺caller/entry/time就保持缺失，不从函数名补调用边。**本轮不推荐实验**：原fixture注释已经回答问题，Archify新页面的独立价值尚未建立。

## 深读二：x100、首次样本与省略96次各自证明什么？

[loops/demo.py](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/examples/loops/demo.py)完整调用四组worker，代码中的循环上界为2、4、10、100；[worker.py](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/examples/loops/worker.py)含四个完整函数。已提交[trace.md](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/examples/loops/trace.md)画四条聚合边并标各计数；函数表不是列出这116次worker调用的所有参数和返回。

生产者 [exec_tracer.py L135–141](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/exec_tracer.py#L135-L141)专门保存首参数、首返回与首返回时locals；这些是展示样本，不是输入输出全集。尤其通用递归场景下，首进入与首返回不能擅自当同一occurrence配对；本例worker均为非递归直返，仍只按上游展示陈述。

[trace_sequence.md](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/examples/loops/trace_sequence.md)对step_four显示前2次和后2次，并明确中间96次省略；对step_three把i=0..9范围合在loop中，没有给出每一次返回值。[L478–503](https://github.com/yananchuk/exec_tracer/blob/2f06c3f18dd3d9727a70db3dd8034737b88c60fa/exec_tracer.py#L478-L503)是实际压缩输出逻辑。范围标签是展示约定，不是新增一条真实事件；相同函数调用计数也不证明这些调用都成功。这里读的是producer已提交生成结果，不伪称原始事件序列已由本轮采集/复验。

因此一个可能的作者合同是同时列“aggregate=100 / displayed samples=4 / omitted=96 / values仅样本”。但上游sequence已直接写清省略且提供完整call/return样本，转换为Archify没有已证实的新定位或操作收益。**拒绝立即实现**；更不能把省略区间手工补齐成96条所谓观察事件。

## 另外两项目的证据成本边界

flowcli的[静态模拟说明](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/README.md#L268-L283)与[runtime/tracer.py](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/src/flowcli/runtime/tracer.py#L1-L32)把两种来源区分得很具体。`simulate.py`产生按源行深度优先的模拟call order，并设迭代/值/事件上限；runtime则通过profile callback记录样本。看起来都能播放，不代表是同一证据。[template.py L1671](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/src/flowcli/output/template.py#L1671)也标示simulated调用点。[MODEL/report.json](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/MODEL/report.json)已经提交，但所查meta是simulation，不拿它作为observed call graph。

其[test_tracer.py](https://github.com/aborjan1/flowcli/blob/f93df8dc722789fc3c0d0144de3c7bf1b47dfc07/tests/test_tracer.py)包含样本上限、过滤、递归、hook恢复等断言，完整`traceproj`两文件可定位。要拿到真实runtime report需另行运行采集，这会越过本轮只读发现；不先增加runner/执行器，也不搬大份自分析静态报告充数。

pyftrace的[README path示例](https://github.com/kangtegong/pyftrace/blob/a7fe9057a1da28b4ca8b35fc22bec72d01d7b79f/README.md#L192-L219)分别给出callee定义行与caller调用行，是可借鉴的两种位置角色。实现[setprofile L22–60](https://github.com/kangtegong/pyftrace/blob/a7fe9057a1da28b4ca8b35fc22bec72d01d7b79f/pyftrace/engine/pyftrace_setprofile.py#L22-L60)会编译并执行用户脚本，输出还混有脚本自己的print；本轮没有调用它。`tracer.py`会根据Python版本及argument开关选择backend，不能将某段README输出无条件称所有backend一致。只有README示例、没有单独完整原stdout receipt及采集元数据时，不能靠“Returning … None”补造正常/异常状态。已存在的简短文本已够阅读，不推荐替换成页面。

## 与Archify已做方向的边界

- 不是test-context：没有把测试名覆盖映射到源行；`未采到`仍可能是过滤/未运行/截断，不等于未覆盖。
- 不是test-failure：没有把pytest阶段/错误位置做另一份图；不把profile return当测试结论或异常判定器。
- 不是task-occurrences/task-review-map：前者保计划树位置与task身份，后者是改动声明账目；本轮考察的是帧写出顺序与采样范围，不能套计划关系称执行。
- 不是source-question-tour或#1015：不增加源码卡/peek/展开。源码引用可以说明producer怎样采集，但不会把推断升级为观测。
- #1103 Atlas是代码关系导航；本轮不建议新的静态call graph，也不把flowcli模拟边搬入Atlas当运行证据。
- 已有trace-waterfall仅接受完整X区间子集。本轮没有时间戳/完整区间的fixture不符合该合同，不能为了可视化编duration或用序号冒充时间。

现有Archify的Explainer表、代码卡、引用和原生Sequence/Architecture足以表达受限事实。唯一可能的新增读者问题是“这一个值是否代表全部调用、这一个顺序到底是什么顺序”；四项目中已有相应注释/展示，或缺少可复用完整采集输入。故保留研究原则，**无产品代码和无立即content实验推荐**；若后续出现真实评审者误读或带完整raw capture的自然问题再评估，当前不虚构收益。

## 完整fixture与输出字节账目

以下是固定GitHub文件的原bytes/hash，不是本轮运行收据。源码均按上述各自固定commit与MIT许可阅读；没有复制第三方图片。

| 项目 / 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| python-execution-trace / `execution_trace/tests/functions/f_recursive.py` | 1085 | `07e2c06a370a15240d2019372b645524a698289631780571e6a321fd328f08c4` |
| 同 / `execution_trace/tests/test_record.py` | 6077 | `ca2d5952d28e170dcd30789ffa99d93b133030d5cc177b6e04f76990c752e508` |
| exec_tracer / `examples/loops/demo.py` | 915 | `99a5868bd5b43bb569f2afc79a8efd4858e555b955aea4633f2736cfd443f816` |
| 同 / `examples/loops/worker.py` | 153 | `797e58378e7f99515805f94be8f915693e4dcfbd404229ffc5cba5950aa803f4` |
| 同 / `examples/loops/trace.md` | 941 | `b85d85afc97c7793b20efad03b0886dad1ad9165ce51133423e34aed37730824` |
| 同 / `examples/loops/trace_sequence.md` | 1782 | `319a694ed91e8ed2aaf421369d77d70c6f4586762cf7df61518d3b09842c3f1f` |
| flowcli / `tests/fixtures/traceproj/__init__.py` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 同 / `tests/fixtures/traceproj/work.py` | 660 | `fbad03f9deef7c118e95b244187acf6ed8ecfc610eeff063040a04b4412688e7` |
| 同 / `tests/test_tracer.py` | 2599 | `fc1b2016d7b37fce0e2b0f49bb0a8e5238f31867257fef202a10f4099a71a47b` |
| 同 / `MODEL/report.json`，simulation | 827163 | `efc851da3ff174eecf4ead76db6fe35b6431c83f538bfb1ca8b6ac2792e80829` |
| pyftrace / `examples/module_trace/main_script.py` | 218 | `096d45246f9d461427ced5a4b5cbcf103022e3f70cf257081d2ebeaf1263a4f3` |
| 同 / `module_a.py` | 72 | `7fee0864f6abad7801aadd519631cdb78463c14b981610c71f6310baa3431dc2` |
| 同 / `module_b.py` | 72 | `bbea109e297ea6a24d795ff545024a037f3122dd221d2fced365b463a4dd630f` |
| 同 / `README.md`，包含完整展示输出 | 10413 | `f17ff57a93fdd4f4a935e57165b59e75a8de4f35b4f9b3f9aa10c47e16afa95d` |

本轮仅新增本报告；同工作区gallery及其他人的变更保持原状，不提交、不推送、不安装live Archify。
