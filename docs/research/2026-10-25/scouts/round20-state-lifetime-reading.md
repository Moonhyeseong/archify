# 第20轮：变量“还活着”、借用区间与运行事件不是同一种状态

2026-10-25，只读研究。**最多推荐一个有界内容候选：读懂 RustOwl 的绿色实线／波浪线——变量在某些路径上有值，不等于每条路径上都已初始化。** 用完整短函数、官方快照、状态集合表解释，不引编译器服务、IDE、后台、借用检查器或新的播放器。教育内容不需要先有生产事故；价值在一个明确的新理解动作，尚不声称已验证阅读收益。

## 排重与证据范围

先读 type-reading-round8、visual-explanation、round19-control-data、execution/behavior、traces、retained-size/byte-views相关报告，检索本日期全部scouts。RustViz与Aquascope已在[类型阅读第8轮](type-reading-round8.md)固定源码浅核，不再当新来源凑数；Flowistry/Python Tutor类平台也不重列。Copy identity解释别名，Retained size解释字节/支配关系，Control-data解释静态use/控制依赖；本轮另问**在控制流汇合处，一个变量有哪些可能状态，图形的确定性标记究竟代表什么**。

使用research流程：后台只读代理筛查BorrowScope/OwnSight/栈帧演示及空壳，作者核RustOwl/BORIS，并再次读取BorrowScope完整消费者/测试及事件。所有仓库仅读取固定源码、许可、完整fixture和已提交输出；没有运行编译、测试、宏、程序、分析器、包管理器或浏览器，没有安装、上传源代码、commit或push。快照是上游已提交expected，不是本轮生成trace。

Archify对照固定 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。现有Explainer源码引用、表格与原生图足以承载内容；没有发现必须改产品的缺陷。

## 五个新来源与不同的“状态”合同

| 来源与固定revision | 完整许可／实际输入与consumer | 判断 |
| --- | --- | --- |
| [cordx56/rustowl](https://github.com/cordx56/rustowl/tree/607183668459e69f41871827c4d34df38117c427) `607183668459e69f41871827c4d34df38117c427` | [MPL-2.0全文](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/LICENSE)。完整must_live.rs、algorithm.rs、ANSI snapshots和CFG状态实现均已读。 | 唯一可选内容方向。静态多路径状态与源码下划线，不是运行时heap/栈时间线；不移植nightly/rustc/Polonius分析链。 |
| [ChristianSchott/boris](https://github.com/ChristianSchott/boris/tree/f543db37b1211180862dcad0e1e0337f4c4a605d) `f543db37b1211180862dcad0e1e0337f4c4a605d` | 当前完整tree未见根LICENSE/COPYING，已读workspace及analysis Cargo.toml也未给license。**未核实可复用许可。** 完整[ownership.rs](https://github.com/ChristianSchott/boris/blob/f543db37b1211180862dcad0e1e0337f4c4a605d/example/src/ownership.rs)与[预分析JSON](https://github.com/ChristianSchott/boris/blob/f543db37b1211180862dcad0e1e0337f4c4a605d/example/export/bodies/ownership.json)，[viewer consumer](https://github.com/ChristianSchott/boris/blob/f543db37b1211180862dcad0e1e0337f4c4a605d/project/boris_viewer/src/examples.rs)直接嵌入export/bodies并反序列化。 | producer/viewer可分离，但不是通用runtime导出。[Readme](https://github.com/ChristianSchott/boris/blob/f543db37b1211180862dcad0e1e0337f4c4a605d/Readme.md)明确无borrow checker、复杂lifetime注解限制、async/unsafe等缺口。只有输入和图不证明借用正确；缺许可，拒绝复制/再分发其实现与产物。 |
| [mehmet-ylcnky/BorrowScope](https://github.com/mehmet-ylcnky/BorrowScope/tree/a830a6743431cf750df5e67ea423133fca5849b4) `a830a6743431cf750df5e67ea423133fca5849b4` | [Apache-2.0全文](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/LICENSE)。完整drop-order.ts、drop-order.test.ts、macro-integration源码/18项events.json已读。 | event创建→drop区间、region嵌套与静态借用寿命分开；具体边界见深读B。不接collector/LSP/宏平台。 |
| [dedsecrattle/OwnSight](https://github.com/dedsecrattle/OwnSight/tree/98c3c788dfdc859d4a2c5d199e6087a9c816e672) `98c3c788dfdc859d4a2c5d199e6087a9c816e672` | [Cargo.toml](https://github.com/dedsecrattle/OwnSight/blob/98c3c788dfdc859d4a2c5d199e6087a9c816e672/Cargo.toml)声明MIT OR Apache-2.0，但tree无完整许可正文，**不能称复用许可核实**。[simple_move.rs](https://github.com/dedsecrattle/OwnSight/blob/98c3c788dfdc859d4a2c5d199e6087a9c816e672/tests/snapshots/simple_move.rs)只有源输入，目录名不构成expected输出。 | [simple_analyzer](https://github.com/dedsecrattle/OwnSight/blob/98c3c788dfdc859d4a2c5d199e6087a9c816e672/crates/ownsight-driver/src/simple_analyzer.rs#L30)逐行字符串启发式，scope_id全0，独立右括号时对全var_map合成Drop。不能称rustc借用分析或真实运行事件；排除。 |
| [rivian96/stack-frame-visualizer](https://github.com/rivian96/stack-frame-visualizer/tree/6ab6feeca920521cdb0c2ede34a5f13f3d2cabf9) `6ab6feeca920521cdb0c2ede34a5f13f3d2cabf9` | [GPLv3全文](https://github.com/rivian96/stack-frame-visualizer/blob/6ab6feeca920521cdb0c2ede34a5f13f3d2cabf9/LICENSE)。完整[stack-frame.html](https://github.com/rivian96/stack-frame-visualizer/blob/6ab6feeca920521cdb0c2ede34a5f13f3d2cabf9/stack-frame.html)同时含七指令输入与execute switch。 | 它是自定义教学模型：push用4字节格保存old_rbp描述字符串、add rsp主动清格、pop把字符串读回。不能当ABI或真实内存trace，也不能由栈指针上移推物理清零。指令前后并排机制已有，排除。 |

这些项目调查时均未归档；未用stars或README界面宣传作功能证明。另排除rust-borrow-visualizer：固定 `cb323c57428ec7b3cb85066b8b2d2c1d1d6a2d60` 的完整src/lib.rs只有info字符串与打印测试，不把名称当已有可视化；不计第六个实质来源。

## 深读A：RustOwl的绿色波浪线不是某次执行的半个值

完整[algo-tests/src/must_live.rs](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/algo-tests/src/must_live.rs)中，`cond_init`原函数L152–163如下。L151原注释标compiles，本轮没有编译确认：

```rust
fn cond_init(c: bool) {
    let other = String::from("o");
    let v;
    let r;
    if c {
        v = String::from("v");
        r = &v;
    } else {
        r = &other;
    }
    println!("{r}");
}
```

[对应官方snapshot](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/tests/snapshots/algorithm__must_live_cond_init_v.snap)选择的是变量`v`，不是`r`。L161汇合、L162输出`r`时，`v`对应绿色波浪标记；legend将其称maybe live。此前赋值分支中的标记为实线。不能把“正在打印r”理解成“无论哪条路径都在读v”；另一条路径的r指向other。

consumer[algorithm.rs L195–204](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/tests/algorithm.rs#L195-L204)调用`get_rustowl_output("must_live::cond_init", "v")`并作snapshot断言；文件前部harness会构建rustowl、运行`show --path ... function variable`。本轮没有执行这些命令。快照保留ANSI颜色控制字节，不是本轮生成的截图，也不据它宣称当前机器编译通过。

owning [dataflow_analyzer.rs](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/bin/core/analyze/dataflow_analyzer.rs#L1-L21)明确：沿MIR CFG传播place状态集合，在join处取并集直到固定点。[state.rs](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/bin/core/analyze/dataflow_analyzer/state.rs)的variant为Uninitialized/Initialized/Moved/Dropped；Assign清掉旧集合并写Initialized，Move写Moved，Drop只替换其中Initialized分量。[places.rs](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/bin/core/analyze/dataflow_analyzer/places.rs)的States::join按place作set union，不是播放顺序。下面是根据完整源码与算法作的**作者解释账目**，不是工具导出的原始状态JSON：

| 源码位置／路径 | 对v的路径状态解释 | 汇合后能否称definitely initialized？ |
| --- | --- | --- |
| c为真，赋值后 | Initialized | 仅此路径可这样说 |
| c为假，未给v赋值 | Uninitialized | 否 |
| 未固定c的CFG汇合 | Initialized ∪ Uninitialized | 否；仍含Initialized，所以是maybe范围 |

[get_definitely_lives](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/bin/core/analyze/dataflow_analyzer.rs#L171-L201)仅接受exact `{Initialized}`；get_maybe_initialized接受包含Initialized的集合，包含definite子集，不能把函数名误读为“只含不确定点”。最终[CLI映射](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/visualize.rs#L216-L253)将DefinitelyLive画绿实线、MaybeInitialized画绿波浪，snapshot是具体显示结果。 显示还经过[decoration.rs的顺序与裁剪](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/lsp/decoration.rs#L463-L542)：MaybeInitialized顺序1、DefinitelyLive顺序2；后者可覆盖前者重叠范围，低顺序片段被裁剪/标overlapped，CLI不绘制overlapped片段。get_maybe包含definite，不能直接把整个maybe函数输出称最终波浪区。snapshot本身只含源行155–165，165是下一函数的does-not-compile注释，不属于cond_init；完整函数由原文件152–163补足。若派生展示去SGR/裁去164–165，须保留完整原ANSI文件并明确绿实线/绿波浪/青借用含义；r=&v不是Move。

边界不可省略：[analyze.rs](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/src/bin/core/analyze.rs#L162-L183)对reference local另用Polonius reference live范围覆盖，所以不能把上述局部变量v的解释泛化为所有引用；state.rs::whole还明确注释fragment可能在不同路径初始化，合并存在over-approximation。**maybe不是概率、运行采样、heap驻留时长或“类型只有一半”；是此工具建模范围内的路径状态信息。**

对照[cond_move snapshot](https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/tests/snapshots/algorithm__must_live_cond_move_a.snap)：原函数L166–173一条分支`drop(a)`、之后仍使用借用r，上游源明确标does-not-compile。汇合绿波浪与后来红线可同时出现。绿线不是“程序安全”的总判定，红线也不是本轮观察到程序崩溃。这个反例只作范围护栏，候选主例仍选无错误的cond_init，避免把不编译的程序画成已运行trace。

## 深读B：BorrowScope叫lifetime的字段其实需要事件身份和单位证据

完整[drop-order.test.ts L53–65](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/borrowscope-vscode/src/test/suite/drop-order.test.ts#L53-L65)有六项合成事件：x创建，RegionEnter，y创建，y drop，RegionExit，x drop。consumer断言y的scope_depth=1、x=0。[drop-order.ts](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/borrowscope-vscode/src/drop-order.ts)按完全相同var_id关联创建/Drop，找不到创建则lifetime_ns=-1。-1应是未知，不是0长度；region depth也不是borrow checker的静态region。

完整[macro-integration main.rs](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/examples/macro-integration/src/main.rs)与[18项events.json](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/examples/macro-integration/events.json)不是上述合成fixture的同一producer记录。这里创建guard_7、Drop guard；borrow owner=owner_2而RcNew=rc_data_2，consumer不会自动证明它们是同一身份。0…17时间值也不能因consumer字段叫lifetime_ns就当成实测纳秒。没有运行宏或程序，不能补上丢失的身份/单位/创建事件。

[early-drop case](https://github.com/mehmet-ylcnky/BorrowScope/blob/a830a6743431cf750df5e67ea423133fca5849b4/borrowscope-vscode/src/test/suite/drop-order.test.ts#L127-L142)将早创建a先于b释放记作non-LIFO；实现的violations仅表达这个顺序模型偏离，不是Rust借用错误或运行错误证明。显式提前释放不能自动标成语言违规。因此不把这份example适配成“借用错误图”，也不为固定六事件另开内容页；已有Trace/事件身份账目已涵盖大部分机制。

## 唯一可选的有界内容试验

**问题：代码仍在作用域里，变量就一定有值吗？为什么同一个v会出现绿色波浪线？** 让读者做三个具体动作：

1. 先确认snapshot选择的是v而不是r，再从源码指出哪条分支给v赋值。
2. 对比“每条到达路径都Initialized”与“有些路径Initialized”的集合，解释汇合标记；不选一条静态路径伪称运行了它。
3. 识别snapshot是producer的静态分析expected；没有输入c、wall-clock、堆值或运行成功receipt，不能补这些事实。

只需现有Explainer：完整短函数的pinned引用、官方原snapshot文件、明确标为作者派生的三行状态表。必要时加一张小Workflow表示“分析状态分支→join并集”，副标题写静态分析，不画执行时间、不添加计算器；如果表已经清楚，就不用原生图。不是再做普通生命周期状态机，也不做RustOwl importer、ANSI通用播放器或源码下划线Viewer。

和既有内容的独立增量：Copy identity问引用抵达哪个对象；Retained size问删除关系与字节；Control-data问某使用是否在静态分析中出现。这里问**同一程序位置的状态信息为何是多路径集合，以及实线/波浪表示的确定性**。这是教育解释动作，不要求生产事故；但也不能仅凭新术语宣布阅读更快或分析更准。

最低事实验收：原完整must_live.rs/algorithm.rs/snapshot/实现/许可字节固定；对source range与snapshot行号逐一核对；保留原ANSI字节，若为阅读去SGR须另标derived且绑定原hash；表的集合是作者按owning算法解释，不冒充工具JSON。内容可正常public render/finalize，机器browser与root实际截图分列，不新增编译器/服务或重跑上游。若静态表仍不能清楚区分v与r，先修内容，不扩产品；若完整原代码加legend已足够，允许不启动。

成本与影响：最多一个本地静态内容目录，现有代码引用/表格足够；无共享schema、Viewer、产品CLI或安装变化。新编译服务会带nightly版本、MIR/Polonius、宏、语言覆盖和执行信任面；其成本不属于本次内容试验。没有建议复制缺许可的BORIS/OwnSight，也没有借GPL栈帧演示重做执行器。

## 完整文件字节账目与未验证项

以下SHA256对固定revision下载到的完整文件计算，未修改ANSI控制字节，也没有把源码、期望和执行收据混写。BorrowScope最小scope case是完整测试函数中的六事件合成输入；RustOwl则保存完整输入文件与官方snapshot/harness，主函数不是本轮自造。没有新截图或运行记录。

RustOwl，fixed6071836完整原文件：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| LICENSE | 16774 | `53f84da786bc2a9d4ca80813015c2064bee21e7cd5653c3a431deaa6dfea92e5` |
| crates/rustowl/algo-tests/src/must_live.rs | 3993 | `a201dd3fedd9fa0e6198c306756d860871649b54a055e388f09c62ab9f845d17` |
| crates/rustowl/tests/algorithm.rs | 6106 | `406d4bce23532271bc4865adeace466db5e5b23a0fbdda72437e583ba2db7472` |
| crates/rustowl/tests/snapshots/algorithm__must_live_cond_init_v.snap | 1168 | `fee579a7512a29b1cc118ffe8bb371b5ed102adac0f75462ad2e2540d1c8e5e6` |
| crates/rustowl/tests/snapshots/algorithm__must_live_cond_move_a.snap | 1376 | `c0c74e797feda6eb3e7e8ba2fbf4a1a8516c0bd3a0fab961967f5b486a152ad9` |
| crates/rustowl/src/bin/core/analyze/dataflow_analyzer.rs | 8783 | `606c196cc641d289c6b9e8429148315e6ee789d97202c9db56871972507aca76` |
| crates/rustowl/src/bin/core/analyze/dataflow_analyzer/state.rs | 2762 | `f669e7716260e09cb338bf2965b08a58f15e1a48fbb5cc6cc9b905ee7de6936a` |
| crates/rustowl/src/bin/core/analyze/dataflow_analyzer/places.rs | 3550 | `0647970e9dd528ba0c15e77edf6b20884d8d268d092db7211b4b5505ad5ffa94` |
| crates/rustowl/src/bin/core/analyze.rs | 11300 | `a0baefdeb224a9b654e63aeb1525979588b557838eecf77114fc08f6136e7e7b` |
| crates/rustowl/src/visualize.rs | 20190 | `4931ccaa731710b1e15ad0106a9d9ad927dbae0115f009158ea933ade90f0ac0` |

BorrowScope，fixeda830a67完整原文件：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| LICENSE | 11357 | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| borrowscope-vscode/src/drop-order.ts | 6658 | `319e2523059aee709ccb211b57cc2b98310c9b7dade403c9b4b9a0a75daf023f` |
| borrowscope-vscode/src/test/suite/drop-order.test.ts | 8748 | `327d7e8aa3be69fadb4a2be816a18691e40b7b9036f5eda8d907bba2829f9fac` |
| examples/macro-integration/events.json | 2300 | `be4c938c6219ecce7aaa057fb3a69d6c17957c6512891f0cfe73616485a88768` |
| examples/macro-integration/src/main.rs | 1268 | `5df1f3f7a5e4d765ea7eb188a14e8089093c74b07f9dfb3671c8e253a84dace1` |

BORIS，仅观察固定原字节，不授权复制：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| example/src/ownership.rs | 254 | `ab358b7df2bcb0927b8945427556b988ea9528a40bf649f0dcd8b3466e09f9b9` |
| example/export/bodies/ownership.json | 4501 | `8c96f18c30c58268516f32917b8c3b44b0264841c184218ffadb380147f2b827` |
| project/boris_viewer/src/examples.rs | 837 | `950bba6f5dc8339cdf7cfbd96a01363c10d7acdcbc20a3c2f35a32680f50041d` |

静态分析的join覆盖其建模CFG路径，不是路径可行性求解或语言实现的完整正确性证明；源码已存在的fragment over-approximation不能从叙述中删掉。BorrowScope事件关系/时间单位未经本轮运行绑定，OwnSight和教学栈模型不提升为真实编译器/硬件证据。所提内容候选尚未生成Archify HTML、验证、截图或发布，本轮只新增此报告，保留其他人的工作树修改。
