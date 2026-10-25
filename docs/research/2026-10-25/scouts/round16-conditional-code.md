# Round 16：存在的源码、给定宏下的代码与实际构建

2026-10-25，只读研究。先查研究中心README和全部scouts；本轮四个repository没有既有命中，不设star门槛。固定GitHub commit、原许可、完整fixture与consumer源码均只读获取。**未运行预处理器、compiler、测试、扩展、数据库或构建工具；未使用Ego，未安装live Skill。** 上游expected不是本轮stdout，指定宏也不是构建实际采用它的证明。

结论：**0个立即实施推荐。** 最具体的可取点是把“未提供/未知宏”“明确undef”“已知数值”分开，并给processed/unprocessed结果标明配置集合。现有Explainer代码、表和引用已经足够表达这层区别，尚未找到自然读者问题证明新增页面或共享功能有独立价值。

## 四个新项目

| 项目与固定commit | 许可原文 | 真实输入/输出/consumer | 具体读者问题与取舍 |
| --- | --- | --- | --- |
| [fanf2/unifdef](https://github.com/fanf2/unifdef/tree/08d12cd3059fe072929ea001ad9833f5487fd355) `08d12cd3059fe072929ea001ad9833f5487fd355` | [COPYING](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/COPYING)：实现与此tests为BSD-2-Clause；手册/FreeBSD支持代码为BSD-3-Clause，不能把GitHub NOASSERTION当无许可 | 完整`tests/if1.c`、同名.sh/.expout/.experr/.exprc；脚本显式-D/-U，harness比较三种输出。不是编译或执行结果。 | “没给BAR”和“-UBAR”是否一样？不一样；未知分支保留，已知分支可消去。可用源码/expected对照表，但没有必要新加preprocessor或通用diff模型。 |
| [ned14/pcpp](https://github.com/ned14/pcpp/tree/988cc2f5eab4d23234cfdfc987e3dcb48faa8221) `988cc2f5eab4d23234cfdfc987e3dcb48faa8221` | [LICENSE.txt](https://github.com/ned14/pcpp/blob/988cc2f5eab4d23234cfdfc987e3dcb48faa8221/LICENSE.txt)：BSD-3-Clause式三条件文本，含Niall Douglas、David Beazley归属 | 完整`tests/passthru.py`包含subclass/runner与输入、expected字符串；不是单独已采集report。默认API与partial模式行为不同。 | “输出还留#if，是失败还是有意未知？”必须同时看hook/mode。Explainer能列模式与未决条件；不应创建一个自动把未决当false的判断器。 |
| [dspinellis/cscout](https://github.com/dspinellis/cscout/tree/4b6f1b6f32b455ab729af6e158982ccab31e67f9) `4b6f1b6f32b455ab729af6e158982ccab31e67f9` | [LICENSE.txt](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/LICENSE.txt)：GNU GPL v3文本；不复制实现或网页资产 | `src/test/cpp/cpp28-if.c`完整小预处理fixture与.out/.err；runtest.sh构造workspace并运行-E路径。另有真实多project consumer，按project设置PRJ2。 | “一行被处理过，是否某个指定配置一定采用？”要分跨project并集与per-project位图。工具已有两种记录和workspace，未发现Archify需要另做配置导航层。 |
| [BastienJbn/c-cpp-preprocessors-visualizer](https://github.com/BastienJbn/c-cpp-preprocessors-visualizer/tree/38509eb9a4d4464b0ad935b6781468410e637c31) `38509eb9a4d4464b0ad935b6781468410e637c31` | [LICENSE.txt](https://github.com/BastienJbn/c-cpp-preprocessors-visualizer/blob/38509eb9a4d4464b0ad935b6781468410e637c31/LICENSE.txt)：**CC BY-NC 4.0**，不是MIT/Apache，不建议搬源码或素材 | 完整`src/test/test-samples/file.c`包含嵌套/elif/define/undef/故意坏行；parser/DirectiveGroup生成配对与层级。extension.test.ts只有模板assert，不能当功能验证。 | “光标所在代码受哪组#if包围？”这只是结构匹配，不等于已配置宏求值或当前编译器判断。现有代码引用可附原条件；没有明确新缺口，不引入编辑器/正则parser。 |

## 深读一：unifdef的未知不是false，exit 1也不是程序失败

固定[if1.c](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/tests/if1.c)是完整375B源码；[if1.sh](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/tests/if1.sh)指定FOO=1、FOOB=42、BAR明确undef。同名[expout](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/tests/if1.expout)保留foo、bar与main正文，条件指令和不取分支被删除；两个include仍原样，不宣称stdlib内容已经分析。FOOB未在此源码中使用，给了参数也不代表它影响输出。

[unifdef.1 L73–108](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/unifdef.1#L73-L108)规定：只有足够确定的控制表达式才处理；未指定控制宏的ifdef/ifndef、未知或无法解析的if/elif可原样通过。默认对纯常量条件也有保留规则，-k才改变该行为。因此不能在展示中把每个保留分支都染成“启用”，也不能把“没传-D”擅自改成显式-U。`tests/if1-k.c`与其同名.sh/.expout是另一个完整fixture，含纯常量与未知条件；它不是if1.c仅改一个flag的严格同输入对照，不混作测量实验。

[手册退出码 L422–442](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/unifdef.1#L422-L442)与[if1.exprc](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/tests/if1.exprc)一致：默认exit1表示输出有变化，0表示原样，2才表示错误。consumer [scripts/runtests.sh](https://github.com/fanf2/unifdef/blob/08d12cd3059fe072929ea001ad9833f5487fd355/scripts/runtests.sh)把stdout/stderr/exitcode分别与expected比较；不能把该fixture的1记作测试失败或构建失败。本轮仅阅读这些断言，没有运行它们。

**可受限表达但不实施：** Explainer表列“宏假设/原条件/expected保留与删除”，代码卡保完整原文和expected，exit单独按工具合同解释。不能称运行时分支覆盖、已验证构建采用、编译成功、死代码全局证明或删掉的代码永不可能使用。既有代码/表已经做到，不加工具执行器或共享代码。

## 深读二：pcpp同一unknown标识的两种合同

默认[parser.py L289–309](https://github.com/ned14/pcpp/blob/988cc2f5eab4d23234cfdfc987e3dcb48faa8221/pcpp/parser.py#L289-L309)的unknown-defined hook返回False，unknown表达式标识hook返回0；这是默认C预处理语义。完整[test pasthrough runner](https://github.com/ned14/pcpp/blob/988cc2f5eab4d23234cfdfc987e3dcb48faa8221/tests/passthru.py#L5-L49)则主动override这几种hook并返回None，要求在尽可能展开已知部分后保留未知表达式。这是明确模式差别，不能用一种模式的expected替另一种证明。

该同一文件的test2保留整个UNKNOWN if/else；test4把已知ALSO_UNKNOWN展开成1，但仍保留UNKNOWN及其后续条件；test5展开为0后删除可判false的elif正文，同时留下未决if和else。它们的完整输入/expected字面量都在文件中，并由runner比较完整输出与return_code；**不是本轮生成了三个新结果，也不是三个相同输入配置变体的计时对照。**

生产者[preprocessor.py L969–1087](https://github.com/ned14/pcpp/blob/988cc2f5eab4d23234cfdfc987e3dcb48faa8221/pcpp/preprocessor.py#L969-L1087)维护enable/iftrigger/ifpassthru与条件栈；只给一个“当前选中了A”标签会丢掉其保留/部分化状态。README的[partial preprocessing](https://github.com/ned14/pcpp/blob/988cc2f5eab4d23234cfdfc987e3dcb48faa8221/README.rst#L41-L79)也明确unfound include和passthru选项，不能把未展开include画成已分析真实依赖。

可借鉴的是“已知部分被替换，未知部分继续留原文”这一阅读规则；若输入没有提供最终输出，则只展示条件与模式，不能在Archify页内自行求值。**拒绝新parser/importer**：这会引入预处理器宏展开、include搜索与hook配置合同，而当前需求没有明确真实使用者或必须新增的产品能力。

## CScout：并集与指定project是两个已有owner合同

一手实现[Filedetails.h L98–101、169–178](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/filedetails.h#L98-L101)区分across-project processed_lines与proj_processed_lines；[filedetails.cpp L132–165](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/filedetails.cpp#L132-L165)对已有位做OR更新。故“在所分析集合中至少处理过一次”和“在指定project的处理记录”不能混同。即使指定project内，重复处理的位仍可OR累积；它也不是某一次独立编译 invocation 的完整trace。

[doc/file.xml L66–75](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/doc/file.xml#L66-L75)已有unprocessed区域阅读入口，并建议多次不同预处理选项扩大workspace覆盖。本轮没有操作其UI；不声称当前某个页面一定只显示全局并集或缺少project选择。源码同时提供两类查询，不能从灰色概念推断产品缺陷。

自然consumer [runtest.sh L320–343](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/runtest.sh#L320-L343)把同一个传入源码放入Prj1和定义PRJ2的Prj2，后者还加入prj2.c；这是不同project上下文，不等于两次运行程序。用于本轮完整小fixture的[cpp28-if.c](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/test/cpp/cpp28-if.c)及同名[out](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/test/out/cpp28-if.c.out)/err由[makecs_cpp、runtest_cpp](https://github.com/dspinellis/cscout/blob/4b6f1b6f32b455ab729af6e158982ccab31e67f9/src/runtest.sh#L348-L402)的预处理路径消费。expected含测试环境的dummy声明，不是原始文本简单删行；没有把它冒充独立编译通过或整个CScout构建环境已复现。

本轮先查到c16-cond.c，其实际主要测试C条件表达式/宏而非所需多配置导航，已改查上述预处理fixture；不能因为文件名cond就说找到了条件编译案例。CScout已有更完整代码导航/宏/项目关系，新增一个低保真Archify配置浏览层没有明确剩余价值，**拒绝移植**。

## Visualizer：配对标记不是宏值求解

[parser.ts的patterns与parseLine](https://github.com/BastienJbn/c-cpp-preprocessors-visualizer/blob/38509eb9a4d4464b0ad935b6781468410e637c31/src/parser.ts#L86-L112)按directive类型识别文本；条件组由层级栈配对，condition保留字符串。[DirectiveGroup.ts](https://github.com/BastienJbn/c-cpp-preprocessors-visualizer/blob/38509eb9a4d4464b0ad935b6781468410e637c31/src/DirectiveGroup.ts)只保ID/directives/level/completed。所读consumer不消费编译命令、宏定义集合或求值结果。因此“条件链被outline”只能说明匹配结构，不能说明分支当前为真/假。

完整[file.c](https://github.com/BastienJbn/c-cpp-preprocessors-visualizer/blob/38509eb9a4d4464b0ad935b6781468410e637c31/src/test/test-samples/file.c)是官方嵌套/elif/缩进/坏行示例，不保证是可编译程序。`extension.test.ts`仍是模板数组indexOf断言；本轮不把它写成功能测试通过。未操作VSCode，所以不报告实际装饰效果或导航动作通过。其CC BY-NC 4.0也是保留研究、避免直接复制实现/图片的成本边界，不能只读GitHub Other就擅自按MIT复用。

若只是想读清一个长条件链，现有Explainer可以引用完整源码与条件串，但源编辑器本就有更直接的就地配对动作；没有真实Archify读者被阻塞的例子，不建议另一套SourceCard hover/focus或条件装饰框架。

## 与既有路线区分与最低可消费合同

- Config origins已有值及origin层级；这里的宏defined/undef/未知及条件预处理，不是同一来源优先级问题。不重做origin表。
- CI conditions已有声明if、needs和未知矩阵；不把C宏公式套成job状态，也不再做另一个通用条件求值器。
- Atlas/#1103与dependency-map处理代码关系导航；未展开include、未处理分支或未覆盖配置不能悄悄补为真实依赖或关系不存在。单个配置图也不能声称整个repo全部关系。
- 不做Viewer过滤功能。把未采用节点隐藏本身不提供为什么/在哪个配置下的证据；保留原条件和明确分析范围比添加一个filter更重要。

若将来确有完整自然变体报告，最低内容合同应是：固定source bytes/revision；明确工具/模式；原始-D/-U/定义文件/搜索路径（原报告没有就标未知）；expected或实际输出二选一明确标注；每行/每边结论的project或invocation身份；未解析/保留条件原文。**analysis配置身份不等于实际构建采用身份，更不等于执行行为。** 当前不为此加schema。完整公式与来源文本可放Explainer代码/表；只有上游确实报告依赖边时才用Architecture，不能从保留include或词法条件生成新边。

四项目都没有给出必须新增Archify产品能力的真实阻塞，或者原工具已经有更合适的局部阅读入口。0建议是成本/证据结论，不是这些项目无价值；本轮留下完整来源与可验证合同，未创建实验或执行任何被研究源码。

## 固定完整fixture字节账目

| 项目 / 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| unifdef / tests/if1.c | 375 | `20b9af8ea0f6bd80550fa2bc679ce32e7849b3eb9032e5569faad103b5870474` |
| unifdef / tests/if1.sh | 38 | `2db18d4ac6d7933d0a686ee25c2b450216ff959d8810531e689815da71d4c968` |
| unifdef / tests/if1.expout | 253 | `78e07cb45ec35958bd5e24695ecc448dc0fb63ebdc652684efd8d7b9630a020d` |
| unifdef / tests/if1.experr | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| unifdef / tests/if1.exprc | 2 | `4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865` |
| pcpp / tests/passthru.py，含完整runner/input/expected | 6801 | `c2eed68b4628eef3d8f5847fe4162dd68d3b47f9eab1362d2315ad0112e0a7cc` |
| CScout / src/test/cpp/cpp28-if.c | 379 | `69508723ec62db2867f66af772415cd7e2a45b9aafa1064c553caafa76368213` |
| CScout / src/test/out/cpp28-if.c.out | 139 | `1a623b698bf391ce848044a6e921c80c5afcf1686c0eb2b8df6c240f9cc92451` |
| CScout / src/test/out/cpp28-if.c.err | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| CScout / src/runtest.sh，consumer原文只读未执行 | 13826 | `056b2b8fd4cad15a606387fc8213f2a13ff3777e7fa22475b84df90f3956e056` |
| Visualizer / src/test/test-samples/file.c | 669 | `58b49882b5401521ed397f72ac652b77a607087e6c31f3ea1cb23ac16a2f9e82` |
| Visualizer / src/test/extension.test.ts | 459 | `01620e51ccb2919d33fdedb05ccc005a27d55ab92e107c894eda4edc1c781f88` |

来源发现中`pod-o-mart/coan`未能定位到可读repository，不将它计入项目或冒认搜索到的镜像为官方。固定tree中不存在的CScout `doc/processing.xml`也未引用，改读实际的file/wsp文档。网络一次EOF后只重试只读API成功，没有转而运行安装器。只新增本报告，其他agent工作保持原样，不commit/push。
