# 第19轮：控制路径、数据依赖与实际执行分开阅读

结论：保留 **1个可选的内容实验**，不建议新增分析器、通用parser、IDE或播放状态。最小问题是：静态use-chain为什么同时包含条件表达式的两个分支，即使源码给了常量？现有Explainer＋原生局部有向图已经足够表达；没有证据要求改共享Viewer。其他来源只保留具体机制或负面筛选。

## 范围、去重与证据性质

先检索全部既有scouts的slicing/control dependence/dataflow、项目名称及仓库；排除已深入的Semgrep/SARIF codeFlows、pyan、code2flow、dependency-cruiser、NetworkX Viewer等。本轮5个项目未在现有报告命中。研究以本轮固定commit的完整README、根许可、owning实现和所列测试为依据；星数未查询、未作门槛。

GitHub匿名API遇到403限流，改用只读`git ls-remote ... HEAD`固定SHA，再下载该SHA的codeload源码到checkout外临时目录。只读取字节，没有运行项目代码、测试、编译、程序样例或安装依赖；没有Ego/浏览器验证。下述expected是上游提交的断言，不是本轮重新得到的分析结果，也不是程序实际运行trace。

当前Archify比较基线仍为[10b4dd5c](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。本轮不做新接口调查或广泛PR重查，复用已核的Explainer snippet/原生图/表格能力；与既有codeflow研究区别在表达式def-use/CFG/CDG关系，而非另一份安全报告位置列表。

## 5个一手来源

| 项目、固定revision、根许可 | 真实输入→输出及consumer | 可借鉴机制／筛选 |
| --- | --- | --- |
| [serge-sans-paille/beniget `c0f03c00a4b737916a3dcfe9849fc177d1e1fe88`](https://github.com/serge-sans-paille/beniget/tree/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88)；[BSD-3-Clause](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/LICENSE) | Python AST/gast→定义/使用链。tests/test_chains.py::checkChains构建StrictDefUseChains，visit后对normalize_chain(dump_chains)作完整assertEqual；test_ifexp_chain有一行源码及完整expected。 | 把同名的定义、条件使用、真分支使用、假分支使用区分为occurrence；不是顺序执行。唯一候选，见下。 |
| [acheshkov/program_slicing `124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260`](https://github.com/acheshkov/program_slicing/tree/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260)；[MIT](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/LICENSE) | Java源码→CDG，再转CFG/DDG/PDG；test/graph/convert/test_cdg.py构造expected各类图并以NetworkX is_isomorphic比较转换结果。 | 同一源程序可以有多种边；但to_pdg将CDG与DDG加进普通DiGraph，未在这些add_edge处保存edge kind。只拿合并图不能可靠恢复“每条边是哪种”。不推荐此轮适配。 |
| [windelbouwman/ppci `f0e9aa0bd83dd96aae876e73051f2263dea390bc`](https://github.com/windelbouwman/ppci/tree/f0e9aa0bd83dd96aae876e73051f2263dea390bc)；[BSD-2-Clause](https://github.com/windelbouwman/ppci/blob/f0e9aa0bd83dd96aae876e73051f2263dea390bc/license.txt) | 显式DiGraph节点与边→immediate-dominator字典；test/graph/test_lt.py::test_appel_example_19_4完整声明7节点8边和6项expected idom。cfg.py还提供post_dominates/immediate_post_dominator。 | 支配树关系不等于直接CFG边；静态必经相对指定入口/建模图。测试是作者引用Appel图例，不是可运行源程序fixture，不把它补称CDG或实测路径；不选内容实验。 |
| [coetaur0/staticfg `ef3172950f459394101fc2cb311d36a2f6eebf6b`](https://github.com/coetaur0/staticfg/tree/ef3172950f459394101fc2cb311d36a2f6eebf6b)；[Apache-2.0](https://github.com/coetaur0/staticfg/blob/ef3172950f459394101fc2cb311d36a2f6eebf6b/LICENSE) | Python源→CFGBuilder→Block/Link→Graphviz DOT/图片。README含完整fib源与assets/example_cfg.png；examples/build_cfg.py是consumer；builder.visit_If构造条件与反条件出口。 | 边是允许的控制转移/条件，而非数据使用。现有Workflow可以讲此概念，但仅一张README图片不是独立的机器expected edge ledger；Python AST兼容与Graphviz维护成本无必要，不迁移工具。 |
| [romanofski/programslice `685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6`](https://github.com/romanofski/programslice/tree/685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6)；[GPLv3（setup.py声明）](https://github.com/romanofski/programslice/blob/685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6/LICENSE) | Python2.7源→AST visitor→Graph→forward slice；programslice/tests/test_slice_forward.txt为完整doctest，slice_string返回四个name,line,column三元组，另有TextOutputFormatter期望。 | criterion含变量名与位置，不只是整行；scope和列位置有用。但术语Graph.edges实际是名/行/列对象keys，不能把这些返回条目逐项当成有向关系。只有forward slicing合同，不推广为完整双向slice；不移植实现。 |

## 深读①：Beniget的完整短expected说明了什么

完整输入（官方`test_ifexp_chain`）：

```python
a = 1; a + 1 if a else - a
```

来源与consumer：[tests/test_chains.py](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/tests/test_chains.py) L33–67；owning [beniget/beniget.py](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/beniget/beniget.py) 的`visit_IfExp`L1335–1340显式visit test/body/orelse并分别add_user，未在此按`a=1`消去分支。`dump_chains`L508–512输出locals中的定义链；测试末尾`normalize_chain`只规范平台/弃用名字，不是执行路径过滤。[README.rst](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/README.rst)将其定位为compile-time AST分析，也明确eval/globals可使分析失准。

官方expected的结构可逐边转述如下，保留各次`a`的角色，不以字符串相等去重：

| 起点 | 终点 | 证据种类 |
| --- | --- | --- |
| 定义a | 条件中的a、加法中的a、负号中的a（3条） | 官方use-chain |
| 条件中的a | IfExp | 官方use-chain |
| 加法中的a | BinOp；BinOp→IfExp | 官方use-chain |
| 负号中的a | UnaryOp；UnaryOp→IfExp | 官方use-chain |

共7个阅读节点、8条use关系。这是对完整expected的内容投影，不是本轮调用Beniget导出的JSON；节点角色/阅读ID由作者编写，upstream expected字符串没有提供稳定外部ID或图坐标。常量1不在这份expected链中，不补造一条来自常量的工具边。

**关键边界：** use关系不表示发生过调用，也不表示控制流先后；三个分支/条件使用不能画成Sequence三次求值。源码的条件值可由Python语义解释，但本轮没有运行，不能把手工解释称动态trace。图保留`-a`只证明该分析合同保留了这个静态使用，不足以证明可行执行必经过它，也不能据此宣称工具错误。

与既有内容的差异：SARIF页解释报告提供的路径位置与缺步；Notebook解释source/saved output分层；这里没有报告位置序列、输出快照或run，问题是**同一静态expected包含多个表达式分支**。它可以作为教育内容，但尚没有用户收益测量。

## 深读②：合并PDG若丢失边类型，画得清楚仍会误导

[program_slicing/graph/convert/cdg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/program_slicing/graph/convert/cdg.py)的`to_pdg`先计算DDG，再遍历CDG与DDG successor，均用不带属性的`pdg.add_edge(node, successor)`；[program_slicing/graph/pdg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/program_slicing/graph/pdg.py)继承`networkx.DiGraph`。对同一有序节点对，最终图也不能单凭这份边集知道它来自一种或两种依赖。

可核输入和expected位于[test/graph/convert/test_cdg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/test/graph/convert/test_cdg.py)：`__get_cdg_0`内是完整Java循环/continue/break/return，`__get_cfg_0`有11条基本块边，`__get_ddg_0`列变量到使用，`__get_pdg_0`合并依赖；`test_convert_cdg_to_*_isomorphic`确实消费这些expected。`assertIsomorphic`调用普通`networkx.is_isomorphic`，不是带源码标签/edge-kind匹配的完整事实比对，不能扩大为每个名字及来源属性均已核验。另[test/graph/convert/test_ddg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/test/graph/convert/test_ddg.py)三个反向转换测试只是`pass`，[test/graph/parse/test_pdg_java.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/test/graph/parse/test_pdg_java.py)只断言entry数量；不把这些叫完整正确性证据。

阅读机制值得保留：先给CFG、control dependence、data dependence各自的关系定义，再展示带kind的并集；同一对节点若有两种边，应两种都记账。但当前来源会要求手工按中间图重建typed edge ledger和Statement/BasicBlock映射，fixture约30条数据边且有辅助scope节点，成本超出此轮窄内容。**不推荐实施，也不为填数量另造简化Java fixture冒充官方完整图。**

## 唯一可选内容实验：静态use不等于执行分支

只用上述Beniget一行输入＋官方完整expected，直接编写Explainer作者输入和一张7节点8边局部图，不引入Beniget/gast或新parser。图标题明确“官方测试的静态use关系”；连线只写use，不写调用/执行。可以用现有Architecture原生有向连接承载关系，但首屏明确不是业务架构；没有为def-use强行新增diagram_type。原expected完整保留在紧邻snippet，旁表列definition/test/body/orelse角色与未提供的运行证据。

现有[Architecture schema](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/architecture.schema.json)的components/connections、[Explainer schema](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/explainer.schema.json)的snippet/comparison/native diagram及现有Markdown表格解析足够。若不能在一屏同时辨认三次a，先改内容布局或仅保表，不扩Finder/Route/Lens/Focus或执行器。

可证伪任务只有三问：

1. 图里的三个a使用是否同一次求值？预期能指出条件/body/orelse的三个静态occurrence，而非三个依次事件。
2. 图有UnaryOp分支，是否证明执行了它？预期回答没有运行证据，且此分析的IfExp访客保留两分支。
3. 哪些边是数据/表达式使用，哪些是工具给出的控制转移？预期指出本例只有use关系，没有提供CFG边；不能依图从a走一条路径就称实际运行轨迹。

最低验收：逐条8边与expected结构对账、不合并三次同名使用；原fixture/测试文件SHA与许可留账；public render/finalize只做内容scope所需gates，自动browser与root截图分开。拟截图宽屏一屏含输入/图/边界，窄屏检查角色不被裁掉；root若实际看图再记capture，不拿上游PNG冒充Archify产物。只做静态内容，无“分析更准/节省时间/安全发现”结论。若一张原expected＋表已经回答三问，**可以不做图实验**。

## 固定文件字节账目与未验证项

以下是本轮下载后读取的完整源文件SHA-256；不是本轮上游测试日志。后续若复制上游测试摘录，保留对应根许可/版权/条件；PPCI的Appel图来源注明上游原注释，不把根许可扩展成对教材全部图的授权判断。没有复制任何上游runtime进Archify。

| 项目 | 完整文件 | SHA-256 |
| --- | --- | --- |
| beniget | [LICENSE](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/LICENSE) | `e0b021e890014fff3f0eca73233f1317ca940ba56f085a644665771361ce4b9f`|
| beniget | [tests/test_chains.py](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/tests/test_chains.py) | `f0ba63aec94472a7166597b88f0f91ca7bf6d376f6c4a01f7ce9babab470ad42`|
| beniget | [beniget/beniget.py](https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/beniget/beniget.py) | `ebca8a5e4ee6fe6975baa81b662d1590cd4132766d541de4d750d46e0dde2d32`|
| program_slicing | [LICENSE](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/LICENSE) | `6eb1af22c7a77c97c947ddd0aed212e393c514810c68c73167086058bddced6d`|
| program_slicing | [test/graph/convert/test_cdg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/test/graph/convert/test_cdg.py) | `caf385bff0735d86fd32362cd47be46d4b9188eb45b055050d67372fea5187a7`|
| program_slicing | [program_slicing/graph/convert/cdg.py](https://github.com/acheshkov/program_slicing/blob/124d2dcf6c9c2cd8e505b96f4f47f3ea98f0a260/program_slicing/graph/convert/cdg.py) | `7f8af7686b08fd6965fb847620975f1cb2c73363a2b82ac7b8393c9028227497`|
| ppci | [license.txt](https://github.com/windelbouwman/ppci/blob/f0e9aa0bd83dd96aae876e73051f2263dea390bc/license.txt) | `389de8cf48de0bf4e75dc17cd2c3cf0ff42d7cad0b6b5fcb92e57ce4ebeac39a`|
| ppci | [test/graph/test_lt.py](https://github.com/windelbouwman/ppci/blob/f0e9aa0bd83dd96aae876e73051f2263dea390bc/test/graph/test_lt.py) | `b7b265fe70e3f2414ef4a62890ff1c12dad95c99a1202d37d549a4328e400404`|
| staticfg | [LICENSE](https://github.com/coetaur0/staticfg/blob/ef3172950f459394101fc2cb311d36a2f6eebf6b/LICENSE) | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`|
| staticfg | [README.md](https://github.com/coetaur0/staticfg/blob/ef3172950f459394101fc2cb311d36a2f6eebf6b/README.md) | `ab58ef608e0718861b746f6a089411648f6b98b3e5bfacefe7b00597b21c6b12`|
| staticfg | [staticfg/builder.py](https://github.com/coetaur0/staticfg/blob/ef3172950f459394101fc2cb311d36a2f6eebf6b/staticfg/builder.py) | `d9297b81677f79f5150f6a45bde833bb8028a79fe00f040d7e30e914eb43dc6c`|
| programslice | [LICENSE](https://github.com/romanofski/programslice/blob/685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6/LICENSE) | `8ceb4b9ee5adedde47b31e975c1d90c73ad27b6b165a1dcd80c7c545eb65b903`|
| programslice | [programslice/tests/test_slice_forward.txt](https://github.com/romanofski/programslice/blob/685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6/programslice/tests/test_slice_forward.txt) | `dad01d99cc0d6e0e7368b95dd54c9cf4351821eee39f19f792d14d7acc3ffcb4`|
| programslice | [programslice/graph.py](https://github.com/romanofski/programslice/blob/685b96dc297cccec0c0d4cac5eb5c1e1b2baeca6/programslice/graph.py) | `0aef5a8e450f75a0f9c64d17f774c7be47e070e16c73895131e35e032e7290b4`|

本次核了固定source、实际consumer、完整短expected及关键实现边界。未验证这些工具在当前Python/Java环境能运行、输出与所有程序语义一致、Archify生成物/视觉、AT/设备或读者收益。只有一个待评内容候选；没有产品改动建议或适配器实现。
