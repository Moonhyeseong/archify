# Model witness：反例、重复位置与lasso闭合的阅读

2026-10-25。先读研究中心及全部24份已有scouts，对237个唯一GitHub repo排重；以下8个来源未覆盖，不以stars筛选。只读官方GitHub源码、许可及fixture，没有执行陌生程序、model checker、Java jar、WebSocket server、模型或可视化脚本，没有提交/推送。

结论：最多保留一个内容级切口——**将liveness反例的有限前缀、循环段、明确闭合目标并排展示**。这比普通状态机声明或一条有限事件列表多一层语义；但尚未证明现有Archify authored图无法清楚表达，也没有用户阅读收益实测。拒绝引入通用TLA+/Alloy/Promela parser、LTL evaluator、solver或自动“因果解释”。

## 8个固定来源、许可与实际结构

输出字段指本次读到的源码/fixture结构，不是本次运行结果。TLC、Alloy、Spin、Apalache是官方语义参照，不能把它们包装成“小型前端依赖”。

| 来源与固定revision / 许可 | 实际输入、源码/fixture输出 | 机制与拒绝边界 |
| --- | --- | --- |
| [tlaplus/tlaplus](https://github.com/tlaplus/tlaplus/tree/2ef2af8c767b76e5db5cba2878f027ac07aad36c)，[MIT](https://github.com/tlaplus/tlaplus/blob/2ef2af8c767b76e5db5cba2878f027ac07aad36c/LICENSE) | TLC模型/配置→状态检查、错误轨迹。[CounterExample.java](https://github.com/tlaplus/tlaplus/blob/2ef2af8c767b76e5db5cba2878f027ac07aad36c/tlatools/org.lamport.tlatools/src/tlc2/value/impl/CounterExample.java#L69) record包含`state/action`（部分模式有console）；state元素是`<<stateNumber,stateRecord>>`，action元素是`<<from,actionRecord,to>>`，loopOrdinal>0时加last→指定state的闭合边。 | 状态值与轨迹位置身份分开；闭合目标由明确ordinal提供，不能由内容相同推断。不从一条反例推导完整状态空间或实现故障；通过检查的范围还受模型、配置、约束、检查方式及完成情况限制。 |
| [tlaplus/vscode-tlaplus](https://github.com/tlaplus/vscode-tlaplus/tree/881d990870ca593a68009dac353e27084806068b)，[MIT](https://github.com/tlaplus/vscode-tlaplus/blob/881d990870ca593a68009dac353e27084806068b/LICENSE) | checker错误对象→[Counterexample tab与逐位置树](https://github.com/tlaplus/vscode-tlaplus/blob/881d990870ca593a68009dac353e27084806068b/src/webview/checkResultView/errorTraceSection/errorTrace.tsx)，支持filter/展开/折叠；[state](https://github.com/tlaplus/vscode-tlaplus/blob/881d990870ca593a68009dac353e27084806068b/src/webview/checkResultView/errorTraceSection/errorTraceState.tsx) 显示num/title，CodeRangeLink绑定filePath/range，变量逐项显示。 | 每个位置可回action源位置很实用，但与Archify既有source preview接近；不是新增parser理由。debug按钮在仍运行或无trace文件时禁用，提示BFS trace需求；不能把无文件当可重放。 |
| [AlloyTools/org.alloytools.alloy](https://github.com/AlloyTools/org.alloytools.alloy/tree/ed89fdb16c58aea17a55e312c44f99e31aa63ee1)，[根许可声明当前MIT](https://github.com/AlloyTools/org.alloytools.alloy/blob/ed89fdb16c58aea17a55e312c44f99e31aa63ee1/LICENSE)，[Alloy许可文本](https://github.com/AlloyTools/org.alloytools.alloy/blob/ed89fdb16c58aea17a55e312c44f99e31aa63ee1/org.alloytools.alloy.dist/LICENSES/Alloy.txt) | Alloy command与scope→instance/temporal trace。[A4SolutionWriter](https://github.com/AlloyTools/org.alloytools.alloy/blob/ed89fdb16c58aea17a55e312c44f99e31aa63ee1/org.alloytools.alloy.core/src/main/java/edu/mit/csail/sdg/translator/A4SolutionWriter.java#L258) XML instance含bitwidth/maxseq/mintrace/maxtrace/command/filename/tracelength/looplength，sig atom与field tuple逐state输出。 | Atom身份、n元关系与时间位置不能压成普通二元状态图；run得到的satisfying instance与check得到的assertion counterexample需按command解释。根LICENSE首行明确Apache文本尚无效、当前MIT；随包solver有独立许可，不将整体依赖都称MIT。 |
| [alloy-js/sterling-ui](https://github.com/alloy-js/sterling-ui/tree/d5637637cd4409fb7347dec30b79e395bdf57699)，**该快照未找到LICENSE或package license字段** | Alloy instance→source/table/graph等视图；[alloyGraph](https://github.com/alloy-js/sterling-ui/blob/d5637637cd4409fb7347dec30b79e395bdf57699/src/alloy/alloyGraph.ts) node用atom.id/name，edge用tuple.id/name，图端点取tuple的first/last atom。 | 保留atom与tuple身份比显示名可靠，但n元tuple只取首尾的图形投影不能当完整关系。可观察多视图思想，未核可复用许可，**拒绝复制/引入**；也不执行其自定义可视化script。 |
| [informalsystems/apalache](https://github.com/informalsystems/apalache/tree/9a13950e0ebddcb3d7a79cb9e854b0866e1c5712)，[Apache-2.0](https://github.com/informalsystems/apalache/blob/9a13950e0ebddcb3d7a79cb9e854b0866e1c5712/LICENSE) | TLA+ bounded symbolic检查→counterexample。[ITF writer](https://github.com/informalsystems/apalache/blob/9a13950e0ebddcb3d7a79cb9e854b0866e1c5712/tla-io/src/main/scala/at/forsyte/apalache/io/itf/TlaToItfJson.scala) 产生`#meta`、可选params、vars、states；每state含index元数据和变量值，常量初始化与初态合并。 | 有类型/变量声明和位置index，便于离线阅读；该writer没有提供可直接借用的通用loop target字段，不能仅见states数组就推断lasso。不把一定深度内无反例说成全称证明，也不把ITF当普通JSON值随意抹去集合/函数类型。 |
| [nimble-code/Spin](https://github.com/nimble-code/Spin/tree/090f74209025a53297990ec17deca1bd51cb92a5)，[BSD三条款形式文本](https://github.com/nimble-code/Spin/blob/090f74209025a53297990ec17deca1bd51cb92a5/LICENSE) | Promela/生成verifier产生trail；[guided.c](https://github.com/nimble-code/Spin/blob/090f74209025a53297990ec17deca1bd51cb92a5/Src/guided.c#L199) 读取`depth:prno:nst`记录，depth=-1为cycle marker，输出START OF CYCLE，依model解析statement并显示line/proc，最后trail ends。repo另有optional_gui/ispin.tcl。 | trail不是完整状态快照，也不是任意程序执行日志，需要对应model/version；raw三元组不能凭值转换成变量变化。特殊负记录并非负时间或普通state；重放不等于重新证明。拒绝为分享图接C verifier/toolchain。 |
| [fabracht/tla-rs](https://github.com/fabracht/tla-rs/tree/20dc20f7da178d3ab3c2b48a308270cd640fa355)，[MIT](https://github.com/fabracht/tla-rs/blob/20dc20f7da178d3ab3c2b48a308270cd640fa355/LICENSE-MIT) OR [Apache-2.0](https://github.com/fabracht/tla-rs/blob/20dc20f7da178d3ab3c2b48a308270cd640fa355/LICENSE-APACHE) | TLA子集与scenario→checker/TUI探索；[trace_io](https://github.com/fabracht/tla-rs/blob/20dc20f7da178d3ab3c2b48a308270cd640fa355/src/trace_io.rs) 序列化state及值，model用`__model`、function用`__fn`、tuple用`__tuple`，set为array。真实[demo fixture](https://github.com/fabracht/tla-rs/blob/20dc20f7da178d3ab3c2b48a308270cd640fa355/test_cases/demo/Counter.demo.json) 有schema_version/title/variants/beats/scenario/expect。 | 同一scenario在不同常量配置下比较可帮助解释，但expect是预期断言，不能当已通过receipt。其JSON不是通用ITF；不用另一实现的相似名称假设TLC语义/支持集完全相同。新checker维护成本不属于Archify任务。 |
| [igor-buzhinsky/nusmv_counterexample_visualizer](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/tree/521fb9a1261c921519abb60a2b98c5c2cd5b321f)，[MIT](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/LICENSE) | NuSMV文本公式与稀疏counterexample→逐步变量表、子公式真假与高亮解释；[fixture](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/example-input.txt) 有Loop starts here；[Counterexample](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/src/nusmv_counterexample_visualizer/Counterexample.java) 存vars/values/length/loopPosition，支持循环展开、carry-forward。 | loop/prefix明确标注是本轮最直接机制。README列出不支持bounded operators、部分past-time算子、timed traces等；不能迁移成全LTL解释器。Reader还会自动给无loop有限输入补末态自环并警告；**不应把这个选择默默带入Archify**。 |

## 深读：位置、状态值、循环闭合是三件事

TLC [CounterExample](https://github.com/tlaplus/tlaplus/blob/2ef2af8c767b76e5db5cba2878f027ac07aad36c/tlatools/org.lamport.tlatools/src/tlc2/value/impl/CounterExample.java#L79) 把stateNumber和record一起纳入state元素，再以loopOrdinal-1指定闭合位置。这避免“仅凭显示字段相同就认作同一个发生位置”。两处状态显示相同可能是不同位置、不同action或投影隐藏了变量；不能hash显示值去重，也不能见重复值就自动画回边。

Alloy temporal XML则用tracelength和looplength表达有限trace与重复后缀；writer按`tracelength-backloop`计算looplength。该长度口径与TLC的1基ordinal不同，不能共用未说明的`loop`整数。原子identity、变量随state变化、重复的trace occurrence也要分开；不能把同名atom在不同state直接当一张静态对象图的完整证明。

NuSMV可视化器的[example-input第二条公式](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/example-input.txt#L23) 是实际现成小fixture：

```text
-- specification G (s -> F r) is false
State 1.1: s=TRUE, r=TRUE, u=FALSE, v=FALSE
State 1.2: s=TRUE, r=FALSE
-- Loop starts here
State 1.3: u=TRUE
```

上段为便于阅读对原fixture的紧凑转写，原文保留在链接中，并非另一次NuSMV运行。该fixture有公式、counterexample类型和loop入口，但没有随此段绑定可核验的模型revision、checker版本、命令、fairness配置或运行receipt；不能把它称为本次重现的checker结果。依[padMissing](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/src/nusmv_counterexample_visualizer/Counterexample.java#L192) 的carry-forward，1.3继承s=TRUE、r=FALSE，loop从1.3开始，末态闭合到1.3。有限文本之所以展示“请求之后永远不响应”，关键是这个无限重复后缀，而不是看到了两次r=FALSE。图若只线性画1.1→1.2→1.3并结束，会抹掉其liveness反例含义。这里1.3→1.3是由原文loop标记解释出的lasso闭合约定，用来展示无限后缀；原文没有单独报告一条带action/source位置的1.3→1.3 transition，更不是一次实测事件，不能为该边补action名称、时间或投递记录。

尤其不能把未知loop补成自环。[Reader](https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/src/nusmv_counterexample_visualizer/Reader.java#L40) 对没有loop的有限输入会打印警告并loop最后state；这是该工具为了评估公式采用的语义扩展，**不等于输入本身提供了闭合证据**。若Archify消费有限witness，必须原样有限；只有明确输入的back-edge才画闭合。stuttering也需来源显式声明，不能把无变化步骤自动解释为模型允许的stutter。

## 一条witness究竟支持什么

- 一条模型counterexample说明该模型行为违反给定属性，前提是producer及其模型/配置/语义可信；不自动证明真实实现或部署有此行为。只有额外refinement/trace validation证据才能建立对应。
- 一条satisfying instance/witness说明存在性，不证明所有行为满足属性。Alloy的run实例、check反例与unsat结论必须按实际command、scope、bitwidth、trace bound与solver模式解释；不可单凭漂亮图写“已验证正确”。
- 一个完成的有限状态穷举检查和一定深度的bounded check是不同覆盖范围。超时、未知、不支持、没有导出trace或一次scenario的expect都不是pass；全称结论仍限定所检查模型和假设，并非实现全局证明。
- 重放展示既有路径；循环展开只是把同一lasso展开多轮，不是发现更多独立witness，也不是增加状态覆盖。子公式高亮是工具的解释算法，不等于运行因果或最小原因证明。

这些不是要给Archify新增验证引擎，而是页面文案和来源元数据必须保留的语义。

## 与既有实验相比，唯一可考虑的小切口

[State contract](https://github.com/tt-a1i/archify/tree/cc8c75bc/experiments/state-contract) 展示声明的状态/事件矩阵，拒绝rich机器语义，没有运行验证。它不能替代一条有位置身份和闭合目标的checker witness。

[Delivery witness](https://github.com/tt-a1i/archify/tree/f2aa251e/experiments/delivery-witness) 已保留同msgId/同t的重复投递、seq与原始patch；本轮不能再以“保留重复位置”“显示变量变化”作为新功能。真正剩余区别只有**显式lasso重复后缀**：有限前缀之后的回边意味着无穷重复，普通事件结尾没有这种含义。

最多推荐一个零共享代码的authored阅读验证：问题为“为什么有限的三步显示能支持这个eventually属性的反例？”只选上面MIT fixture的第二条公式，不跑NuSMV、不解析任意输出、不计算LTL；使用现有原生图和紧邻Explainer表，位置节点标为1.1/1.2/1.3，显示“loop约定：末位置回1.3”的注解闭合；首版表只保留原始patch及prefix/loop归属，未在patch出现的值标为“本步未报告”，不混称null或自动填成新观测。若后续另列carry-forward折叠值，必须标为依据producer格式约定的派生展示，保留原patch，并单独验证fold。公式作为原文引用，解释由作者核对，不宣称自动判定。引用作者及固定fixture/license，明确“固定示例的既有反例，非本次验证”。

先用现有支持显式有向关系的原生图表达occurrence，不把图命名成完整Lifecycle或状态空间。循环不应复制多个额外节点假装多次独立检查；如果为了阅读展开一轮，应显式标“展示展开”、关联原occurrence。也不需要新schema、动画播放器、solver、模型导入器或past-time公式求值。

新增价值必须通过普通线性excerpt与“prefix+loop”同问题对照证明：读者是否能看出r将持续FALSE，以及闭合指向哪里？如果一段原文加一张现成表已经同样清楚，就拒绝增加图。**本轮尚未做此对照，故只给条件候选，不认定已改善阅读。** 其他方向全部拒绝：Sterling许可/高元投影、solver/parser维护、重复的source-preview/变量diff均没有适合当前引入的缺口。

## 检查与限制

源码许可直接查固定文件：Sterling未找到许可即保留未知，Alloy根文件状态与随包solver许可分别报告，Spin三条款按实际文本描述，tla-rs按Cargo双许可核对。本次未运行任何checker/上游脚本，未生成图片或验证receipt；源码/fixture阅读不等于算法正确性验证。纯研究文档按CONTRIBUTING选择链接、字面与语义核对，不跑renderer/fullsuite。只新增本报告，不改README、产品或他人文件，不commit/push。
