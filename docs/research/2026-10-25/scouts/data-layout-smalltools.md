# 数据布局小工具：字段槽位、padding与对象大小

日期：2026-10-25。只读源码和已提交文本/JSON，未执行编译器、二进制、JVM、Go工具或上游样例，未读用户进程内存、heap dump或用户对象。本轮只新增本报告，没有浏览器、渲染或图片验收。

**结论：本轮0实施。** 找到6个未覆盖来源，深入核实一个Go布局golden与一个JOL已提交输出例。它们足以说明统计/布局边界，尚未发现需要Archify增加parser、byte-map renderer、编译探测或内存采集的用户缺口。现有表格＋来源卡＋Explainer可表达这些固定事实；已有工具本身也提供布局表/ASCII图或diff，不因“能再画一张图”增加维护项。

## 去重与实际阅读任务

完整读取本目录当时34份scout，并抽取全部GitHub repo引用排重。下面6个repo均未出现；`native-code-reading`中的Twiggy、profile/trace工具以及已覆盖的Wavedrom/bytefield-svg不重新计作发现。搜索沿struct layout/padding/offset、Go structlayout关联工具、DWARF布局和JOL官方文档展开，未按stars筛选。

| 阅读任务 | 真正需要的证据 | 现有表达是否足够 |
| --- | --- | --- |
| 找到某字段前后的具体空隙 | 同一布局的字段offset、size、完整对象size和模型上下文 | 有原字段表就能列半开区间；不必重算语言ABI或绘制新组件 |
| 审查ABI变更 | 同一目标的compiler/version/target/flags、可比布局报告 | 两个声明文本或不同尺寸模型不足以证明ABI兼容；本轮没有真实ABI审查输入 |
| 解释对象48B为什么不等于整个数据结构只占48B | 头部、字段槽位、引用关系/roots与不同计量对象 | 表和Explainer能先澄清shallow与可达对象；没有证据支持抓heap或重做dominator分析 |

## 6个固定来源与筛选

| 来源与固定revision | 许可 | 实际能力和公开素材 | 判断 |
| --- | --- | --- | --- |
| [dominikh/go-tools：structlayout](https://github.com/dominikh/go-tools/tree/8371db75e9daf10073dc2ba684c2a24a1d6ead95/cmd/structlayout) `8371db75e9daf10073dc2ba684c2a24a1d6ead95` | [MIT](https://github.com/dominikh/go-tools/blob/8371db75e9daf10073dc2ba684c2a24a1d6ead95/LICENSE)，子目录另有Go第三方许可 | [README](https://github.com/dominikh/go-tools/blob/8371db75e9daf10073dc2ba684c2a24a1d6ead95/cmd/structlayout/README.md)和[Field类型](https://github.com/dominikh/go-tools/blob/8371db75e9daf10073dc2ba684c2a24a1d6ead95/structlayout/layout.go)：JSON `name/type/start/end/size/align/is_padding`，pretty和optimize是同repo的消费端 | 已有专用工具能处理布局展示；无需将三条命令算三个项目或新增Archify JSON importer |
| [peczenyj/structalign](https://github.com/peczenyj/structalign/tree/237f811ce22d87683c83951e570b59c11439912e) `237f811ce22d87683c83951e570b59c11439912e` | [MIT](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/LICENSE) | 显示当前布局和重排diff；[inspect golden](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/testdata/inspect_mixed.json.golden)、[diff golden](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/testdata/diff_mixed.json.golden) | 深入素材A；重点是明确模型和padding区间，不移植Go分析器 |
| [arvidn/struct_layout](https://github.com/arvidn/struct_layout/tree/be8a124b3b91128443bf5c169e5f99295e838c7c) `be8a124b3b91128443bf5c169e5f99295e838c7c` | [BSD-3-Clause](https://github.com/arvidn/struct_layout/blob/be8a124b3b91128443bf5c169e5f99295e838c7c/LICENSE) | [README](https://github.com/arvidn/struct_layout/blob/be8a124b3b91128443bf5c169e5f99295e838c7c/README.md)给出104B C++类型的嵌套文本与padding；从对象/二进制DWARF的dwarfdump输出重建，不是仅看声明 | 示例没有绑定原始binary digest/完整目标上下文；可参考阅读方式，不执行dwarfdump/dsymutil或开发新DWARF reader |
| [openjdk/jol](https://github.com/openjdk/jol/tree/db2cc744485031c8149991a004ab02f2ea9b24dd) `db2cc744485031c8149991a004ab02f2ea9b24dd` | [GPLv2＋Classpath exception](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/LICENSE#L324-L347)，[pom声明](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/pom.xml#L49-L54)；不能简化成MIT | [README](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/README.md)含internals、模拟模型与footprint等已提交输出 | 深入素材B；只读类型/对象布局与graph语义，不引JVM或复制实现 |
| [essentialkaos/aligo](https://github.com/essentialkaos/aligo/tree/aa12fb197a8eb2dfe0ea690658e545134e28c234) `aa12fb197a8eb2dfe0ea690658e545134e28c234` | [Apache-2.0](https://github.com/essentialkaos/aligo/blob/aa12fb197a8eb2dfe0ea690658e545134e28c234/LICENSE) | [README](https://github.com/essentialkaos/aligo/blob/aa12fb197a8eb2dfe0ea690658e545134e28c234/README.md)有alignment检查/图与Action；[inspect](https://github.com/essentialkaos/aligo/blob/aa12fb197a8eb2dfe0ea690658e545134e28c234/inspect/inspect.go)使用Go类型尺寸信息 | 适合Go自身工作流；作者截图和“可提升性能”说明不是本次性能证据，不再深入第三份fixture |
| [ShizukuWhite/c-struct-xray](https://github.com/ShizukuWhite/c-struct-xray/tree/64578f59e063726fb8e75c863e341325855548af) `64578f59e063726fb8e75c863e341325855548af` | 未声明；[README License节](https://github.com/ShizukuWhite/c-struct-xray/blob/64578f59e063726fb8e75c863e341325855548af/README.md#license)明确source-available，非自动可复用开源许可 | 声明ABI模型/packing/bit-field字节图、JSON及可选compiler probe；同时明确不是完整C compiler，生产target规则才权威 | **负面记录**：不复制实现或fixture，不执行verify/编译探针，不为它增加adapter |

## 先区分四类来源

1. **源码声明**：字段的名字/类型/书写顺序，不自动给出某个二进制的offset；还需要语言representation、target ABI和编译选项。
2. **尺寸模型的计算结果**：Go的go/types尺寸、JOL HotSpot模拟器、手选ABI计算器。这些报告可以自洽，但不是本轮对具体binary或运行对象的观测。
3. **调试信息或VM introspection**：DWARF来自某个已编译对象；JOL CurrentLayouter查询当前VM。仍需绑定binary/VM版本与选项，缺少上下文就不能推广到所有构建。
4. **heap对象图/快照与retained memory**：对象集合、引用/roots和GC保留关系是另一层问题。单对象字段表不含全堆根集；可达footprint也不自动等于retained。此前Twiggy的retained是二进制图语义，不能直接套成Java heap可回收字节。

这不是把所有报告合成一种“memory layout JSON”的理由。同样写size，可能指字段槽位、一个对象、整张可达图或某项支配子树；字段名相同不证明同口径。

## 深入A：structalign的Mixed布局golden

固定[完整695B JSON](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/testdata/inspect_mixed.json.golden)，SHA256 `bf810558542e418b761a1353bceb795ad98d0078bec09b11cd1a9fe3b7926c54`。根字段是 `version/mode/layouts`；布局有 `package/name/size/align/padding/fields`，字段有 `name/type/offset/size/align/padding`。它是上游UI测试预期，**不是本次编译输出或生产布局采集**。

来源链可复核：[json_test.go](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/json_test.go)调用Inspector→RenderJSON对比golden；[printer_test.go的sampleSrc](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/printer_test.go#L33-L48)声明bool/int64/bool；[testutil.Target](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/testutil/testutil.go)在测试中做类型检查并固定amd64；[sizes.ForArch](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/sizes/sizes.go)调用 `types.SizesFor("gc", goarch)`。本轮没有运行这些函数。

| 字段 | 原offset | 原size | 原align | 原padding | 由完整记录确定的区间 |
| --- | ---: | ---: | ---: | ---: | --- |
| A / bool | 0 | 1 | 1 | 7 | 字段 `[0,1)`，随后空隙 `[1,8)` |
| B / int64 | 8 | 8 | 8 | 0 | 字段 `[8,16)`，没有随后空隙 |
| C / bool | 16 | 1 | 1 | 7 | 字段 `[16,17)`，尾部空隙 `[17,24)` |

总size24、align8、padding14。这里两段7B来自**逐字段offset＋size和下一边界**，不是将 `24−(1+8+1)=14` 任意均分。[computeLayout](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/layout/layout.go#L155-L195)确实把每字段结束至下一字段offset（末字段至total）的差计入该字段padding。因此C的7B是尾部padding，不是“C内部存了7B”。

JSON中的 `version=v0.7.0-test` 是测试传入标签，不是独立验证的部署版本。golden自身没有arch字段，但上述测试来源明确选gc/amd64；具体Go toolchain build未随golden完整记录。生产Loader使用[packages.TypesSizes](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/loader/loader.go)，不能把这份固定测试模型说成所有Go目标均为24B。

另一[diff golden](https://github.com/peczenyj/structalign/blob/237f811ce22d87683c83951e570b59c11439912e/internal/ui/testdata/diff_mixed.json.golden)提供oldSize24/newSize16/bytesSaved8及字段重排文本。这是分析器建议，不能据此称运行更快、heap减少8B×任意实例数、ABI安全或序列化兼容。本报告没有把建议编译成另一套新offset。泛型Inspector还会使用代表类型并附assume/note；这些近似说明若丢掉就会把模型伪装成具体实例布局。

## 深入B：JOL的HashMap已提交输出与模拟输出

固定[README internals例](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/README.md#L56-L87)标明64-bit VM、压缩普通引用与class pointers、8B对象对齐，且说明通过默认构造函数创建了sample instance。它是**上游已提交的示例输出**，不是测试golden，也不是本次JVM测量；完整JVM build/启动flags与原始采集文件digest未提供。

该例的instance size为48B，头部为8B mark＋4B class。所有字段按offset列出，最后一个reference槽位 `entrySet` 为offset40/size4；随后 `[44,48)` 是4B尾空隙。源码[FieldLayout](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/info/FieldLayout.java#L37-L65)将offset/size分别定义为对象内字节位置与字段占用；[ClassLayout](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/info/ClassLayout.java#L137-L153)按完整字段边界统计内部/末尾空隙。

| 容易误读的数 | 此固定例中的含义 | 不能补造的结论 |
| --- | --- | --- |
| offset36、size4的table reference槽位 | `[36,40)`是该对象内一格引用 | 不是地址36，也不是Node array及其所有节点只占4B |
| 64-bit VM＋4B普通引用 | 当前示例明确启用压缩引用；[Model64](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/datamodel/Model64.java#L42-L105)分开建模引用、class指针与alignment | 地址宽度64-bit不等于每格reference必为8B |
| internal loss0、external loss4 | JOL将最后字段至实例尾部的4B称external loss | 不是对象外heap碎片，也不是泄漏/可节省内存证明 |
| instance size48B | 单个sample对象的布局大小 | 不含所有引用目标的大小，不等于整个HashMap数据结构的retained memory |

同一README后面的Integer 24/16/8B表明确标为HotSpot Layout Simulation，值列为N/A；其中JDK99/Lilliput标签是模拟目标，不能当作已发布JVM或当前实测。对应[HotSpotLayouter](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/layouters/HotSpotLayouter.java#L39-L99)以DataModel和jdkVersion模拟布局。

[CurrentLayouter](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/layouters/CurrentLayouter.java#L42-L90)则查询当前VM的字段offset/size、array base/index scale；仍留有trailing Contended情形size计算的TODO，不能描述成无条件精确。两种模式必须保留标签，不能单按表头相同混比。

JOL另有GraphLayout/heapdump操作，并不让字段表变成heap snapshot。[GraphWalker](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/info/GraphWalker.java#L50-L121)从给定roots沿引用遍历、按对象identity去重；[GraphLayout.totalSize](https://github.com/openjdk/jol/blob/db2cc744485031c8149991a004ab02f2ea9b24dd/jol-core/src/main/java/org/openjdk/jol/info/GraphLayout.java#L255-L285)求访问到对象size之和。它没有在此求完整heap dominator或排除其它roots仍引用的对象，所以是给定roots的可达footprint，不能标成GC retained size。本轮也未读取任何heap输入。

## 对Archify的取舍：0实施，保留阅读准则

[现有Explainer](../../../../archify/references/explainer-authoring.md)已支持表格、facts、来源与固定源码卡。上述两个问题都可用“结论＋一张offset/size/对齐/边界表＋模型说明”表达。没有证据表明用户需要另一个位图交互、自动重排或跨语言布局导入；现有工具本就有其专用布局可视化。

若以后出现具体审查任务，应先拿现成报告，保留工具revision、目标/模型、模式（声明/模拟/DWARF/VM/heap）、完整size与逐字段边界；offset按对象/记录相对位置显示。仅以报告digest＋出现位置做本报告内定位，不把offset、字段名或type名当对象指针/稳定身份。嵌套类型、union、bit-field、零size字段、packed、压缩引用与共享子对象均可能破坏简单“所有size相加”的假设；不在缺数据时补平缺口或均摊padding。

若将来仅需手写固定解释页，仍可复用现有表/SourceCard；这不是本轮推荐的新实验。若没有明确阅读问题，就不建adapter、byte-grid schema、布局模拟器、compiler probe、进程/heap采集器或retained-memory分析器。本轮未生成HTML，因而没有截图或渲染验收；来源截图与README输出不冒充本次产物。

## 与旧研究和已有议题的区别

- protocol/schema报告的bytefield/bitfield面向协议字段声明，不提供某个编译器或VM实例的实际布局证据；不再包装一次相同byte-map功能。
- native-code/retained-size研究的是二进制代码项目及其支配大小；这里是字段槽位/对象布局，不能把retained名称跨图转用。
- profile/trace研究的是采样权重、span或时间归因；字段offset没有时间轴，也不是runtime事件或对象identity。
- Source question tour与现有Explainer已经提供固定来源阅读方式；本轮没有发现其展示字段表的明确缺陷。

GitHub API本轮搜索 `"struct layout"` 返回0；`"memory layout"`只命中open [#480](https://github.com/tt-a1i/archify/pull/480)（renderer入口相关），`padding in:title`、`bytefield`返回0。没有因此证明绝无重叠，也不把渲染器边距padding与数据布局padding混为一类；现阶段不发issue/PR。

验证范围：固定repo/SHA/许可、两个已提交素材和owning源码语义、golden的静态区间/加总核对、已有报告与有限议题去重；JOL另由一位Codex agent只读核对。未验证候选安装/编译/运行、真实用户二进制、性能效果、浏览器/图片或任何用户收益。报告仅需来源/内容及whitespace核对，不运行全仓测试。
