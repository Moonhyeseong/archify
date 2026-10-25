# Parser 阅读第13轮：没有输出节点、多个解和共享歧义点

2026-10-25，只读研究。**新核2个项目，深读2组完整上游测试/语法文件和 owning source；0个立即实施候选。** 当前最有用的知识是：成功匹配不保证输出一个节点；森林中的歧义点数不等于完整解析树数；取第一棵树也不代表消除了歧义。现有 Archify Tree、Explainer 表和固定源码引用已足以解释这些事实，没有发现需要新 parser、AST schema 或 forest Viewer 的产品缺口。

本轮使用 research 与 archify-review 的一手来源、价值/成本/影响流程；作为已委派的只读研究任务完成，不再递归分派。已读 AGENTS.md、CONTRIBUTING.md、REVIEWING.md。产品判断固定在 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)；研究工作树读取时 HEAD 是 `c351d33c407c1c1a8a9bf2f0aee7d54e018fdef7`，不把文档提交的 HEAD 混称产品验证版本。没有安装/运行上游程序、semantic actions、grammar、测试或浏览器，没有生成解析记录、HTML或图片。

## 发现与排重

先读取 hub README，并对其与全部 scouts 的 GitHub owner/repo 引用做集合排重，得到462个唯一仓库名；这是本轮读取时的共享目录快照计数，不能代替各项目覆盖深度。另深读 [grammar-reading](grammar-reading-smalltools.md) 与 [matching-reading-round8](matching-reading-round8.md)，其中已经覆盖 Peggy、Ohm、Nearley、Lark、Jison、Bison、正则 AST、回溯模拟与 railroad 等。不能把“再找到一个 parser”当作新增产品价值。

本轮通过实时网页搜索发现以下两个未覆盖项目，再通过 GitHub REST API 解析默认分支完整 SHA，读取固定 SHA 的原文件。没有按 star 筛选；共核两个新项目，没有为了凑六个而扩展列表。以下 push 时间是 API 仓库元数据，不是 release 日期、质量或仍有人使用的证明。

| 新项目 / 完整 revision | 许可与状态 | 实际阅读任务 / 判断 |
| --- | --- | --- |
| [pest-parser/pest](https://github.com/pest-parser/pest/tree/66a059c9ba755ae1ca6626420ecd453b20a31b33) · `66a059c9ba755ae1ca6626420ecd453b20a31b33` | [pest/Cargo.toml](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/pest/Cargo.toml#L1-L14)声明 `MIT OR Apache-2.0`，两份[MIT](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/LICENSE-MIT)/[Apache](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/LICENSE-APACHE)正文已读；API未归档、push `2026-10-16T03:42:59Z` | 读同一输入为何因规则修饰符得到不同 Pair 树，以及哪个范围仍已被匹配。小型对照可用现有 Tree＋表；不用执行 grammar，也不用建立 importer。 |
| [igordejanovic/parglare](https://github.com/igordejanovic/parglare/tree/f2615c81a8419d0f53c33a192e95669b2aafe430) · `f2615c81a8419d0f53c33a192e95669b2aafe430` | [MIT](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/LICENSE)；API未归档、push `2026-10-04T16:44:41Z` | 分清 SPPF 共享歧义点、完整树数量、按 index 取树与实际删除 possibilities。现有表已能说明，通用 forest 可视化成本不合算。 |

## 深读一：pest 的叶节点不意味着内部没有匹配

完整 [`derive/tests/grammar.pest`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/derive/tests/grammar.pest) 与完整 [`derive/tests/grammar.rs`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/derive/tests/grammar.rs)是上游已有回归输入和 expected，不是本轮构造样例或实跑产物。重点完整读取相邻 `sequence_compound`、`sequence_atomic`、`sequence_non_atomic`、`sequence_atomic_compound`、nested 及 whitespace 失败测试：

| 上游入口与完整输入 | 测试中的 expected | 能回答的问题 |
| --- | --- | --- |
| `sequence_compound = ${ string ~ string }`，`abcabc` | 父 Pair `[0,6)`，两个 `string` 子 Pair `[0,3)`、`[3,6)` | compound atomic 保留内部节点；两个匹配 occurrence 不能按同名 `string` 合并。 |
| `sequence_atomic = @{ string ~ string }`，同一个 `abcabc` | 只有父 Pair `[0,6)` | 内部规则仍参与匹配，但输出 Pair 被抑制；叶子不能被改写成“这里没有子结构”。 |
| `sequence_non_atomic = @{ sequence }`，`abc   abc`，其中 `sequence = !{ string ~ string }` | 外层和 `sequence` 均 `[0,9)`，子 Pair `[0,3)`、`[6,9)` | non-atomic 内层可以恢复内部行为；父范围包含空白，子跨度不覆盖全部父范围并不表示解析失败。 |
| `sequence_atomic_compound = @{ sequence_compound }`，`abcabc` | 外层、compound 内层及两个 `string` 都存在 | atomic 不是可简单沿祖先传播并永久删除后代的视觉样式；具体修饰符和调用位置必须保留。 |

以上 expected 位于 [grammar.rs L110–220](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/derive/tests/grammar.rs#L110-L220)。ASCII fixture 的区间容易人工核对；不据此宣称任意 Unicode 坐标已经验证。拥有行为的实现是 [`generator/src/generator.rs L330–380`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/generator/src/generator.rs#L330-L380)：silent 分支直接生成表达式，不包 `state.rule`；atomic 把匹配闭包放入 Atomic 状态；compound atomic 在相应状态里建立自己的 rule；non-atomic 则显式改变状态。不是后期渲染器看见空子列表才猜测省略。

实际输出队列由 [`ParserState::rule L740–861`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/pest/src/parser_state.rs#L740-L861)控制：只有无 lookahead 且不处于 Atomic 时才推入开始/结束 token，失败还会回退队列。因此仅凭最终 Pair 树不能倒推出所有尝试、失败分支或匹配调用次数。`Pair::as_str/as_span`读取 token 对应的输入起止，`into_inner`取队列中的内部范围，见 [pair.rs](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/pest/src/iterators/pair.rs#L114-L119)、[as_span](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/pest/src/iterators/pair.rs#L203-L207)、[into_inner](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/pest/src/iterators/pair.rs#L241-L250)。该位置指向被解析输入，不是 grammar 源文件行号。

完整 [`implicit.pest`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/derive/tests/implicit.pest) 与 [`implicit.rs`](https://github.com/pest-parser/pest/blob/66a059c9ba755ae1ca6626420ecd453b20a31b33/derive/tests/implicit.rs)补充了实际标签消费者：`program`和`term`为 silent；`a a` expected 有 head/tail、两次 one_and/one_comp/one_array，`a a a` expected 两次 tail。测试受 `grammar-extras` feature 条件限制。本轮不补画它没有提交的完整树，不声称当前机器开启 feature 或测试通过。标签 occurrence、规则 occurrence、输入区间和 grammar 行号是不同身份。

这一发现与旧 Ohm/Lark 的“输出树可过滤符号”原理重叠，新增的是 atomic/compound/non-atomic 的具体受控反例。不能据此开通用节点隐藏/展开功能：缺少节点可能是生产者根本没输出，并没有可供展开的隐藏数据。

## 深读二：parglare 的三个歧义点如何对应五棵树

完整 [`tests/func/parsing/test_glr_forest.py`](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/tests/func/parsing/test_glr_forest.py)含完整 grammar：`E: E "+" E | E "*" E | "(" E ")" | Number;`，`Number: /\d+/;`。它没有为这些运算符提供通常算术优先级；因此不把某一棵树标“正确算术结果”。该文件固定 expected：

| 完整输入 | `forest.solutions` expected | `forest.ambiguities` expected |
| --- | ---: | ---: |
| `2 + 3 * 5` | 2 | 1 |
| `2 + 3 * 5 + 4` | 5 | 3 |
| `2 + 3 * 5 + 4 *1` | 14 | 6 |

森林的共享点数不是完整组合数，更不是错误数。[`Parent.ambiguities`](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/parglare/glr.py#L810-L843)按对象身份 visited 去重，并仅对 `possibilities` 长度大于1的 Parent 加一；[`Parent.solutions`](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/parglare/glr.py#L845-L866)对 Parent 求子结果的和，对其它节点求乘积。两个统计的 owning source 明确不同。不能将 DAG 投影成 Tree 后按可见徽章重新统计，上游共享身份也不能被显示标签替代。

[`Forest`](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/parglare/trees.py#L285-L379)的 `get_tree(idx)`返回 lazy tree，`get_first_tree()`沿每个 Parent 的 `possibilities[0]`解包；它是取一个结果的便利入口，不是声明 grammar 无歧义。测试还明确 `get_first_tree().to_str() == forest[0].to_str()`。没有 index 与完整覆盖声明时，分享一棵树不能让读者误以为这是唯一结果。[官方 forest 文档](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/docs/parse_forest_trees.md)提供迭代、逐树比较和 `to_dot` 方法；本轮未调用它们，也没有从图片反推 forest 身份。

另一份完整 [`test_glr_forest_disambiguation.py`](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/tests/func/parsing/disambiguation/test_glr_forest_disambiguation.py)包含完整 document grammar、13个 part 标题输入及完整剩余树 expected。它的规则是不允许同类 part 递归嵌套；不是根据缩进解释层级。expected 在过滤前是415 solutions、46 ambiguities，调用 `forest.disambiguate(disambiguate)`后为1 solution。拥有行为的 [Forest.disambiguate](https://github.com/igordejanovic/parglare/blob/f2615c81a8419d0f53c33a192e95669b2aafe430/parglare/trees.py#L340-L356)遍历多 possibilities 的 Parent，回调实际改写 `parent.possibilities`；这与仅取 index0 有根本区别。

该 expected 中 `parts_opt[39->39]`等零宽节点仍存在，说明空产生式节点不是缺失节点；文档 layout 与 token 区间也不能混为一谈。它给定完整树，理论上可手工映射现有 Tree，但节点多、生成辅助规则多，没有读者任务证明复制整棵树比现有 `to_str` 更有价值。本轮没有执行消歧回调，没有验证415/46/1是本机运行结果，更不推断所有输入都能唯一消歧。

## 固定文件审计

所有文件只读下载到 `/tmp/parser-round13/`，没有复制上游实现或 fixture 进仓库。下面均为 fixed-SHA 完整原文件字节摘要，便于后续重取核对，不依赖临时目录永久存在。

| 项目 / 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| pest `derive/tests/grammar.pest` | 3093 | `fed7f34edbbb9cb1a95a6027a71dc8d1468138794f71277c7af1615ea00bb49e` |
| pest `derive/tests/grammar.rs` | 19250 | `3a004af1ce1485f2b4f2bae002c6c3fa6cea7179643aa768e929e29c1b45f4c8` |
| pest `derive/tests/implicit.pest` | 430 | `18cd082b71214f7d6bbf32fcf4cd9e3a0b10f99212a640db5327deddb434925e` |
| pest `derive/tests/implicit.rs` | 1881 | `b2d31774061608d86940e23a572f24f8f7dfc4694cdbda4d2b598f025788b80c` |
| pest `generator/src/generator.rs` | 44603 | `8b3d62f8d9ad6cafb3090fbb33236512e97dfc2a3175d6832fab40ffadabd335` |
| pest `pest/src/parser_state.rs` | 77709 | `ac7a83cb77b0f92b33c8dd3c7487e1218a39caf7e691ca59c3050cc25116e256` |
| pest `pest/src/iterators/pair.rs` | 13526 | `6b8ebd985f3c7c3ab7d471af075dda04af30127708ad77def5f10971d476f529` |
| pest `LICENSE-MIT` | 1023 | `23f18e03dc49df91622fe2a76176497404e46ced8a715d9d2b67a7446571cca3` |
| pest `LICENSE-APACHE` | 10847 | `a60eea817514531668d7e00765731449fe14d059d3249e0bc93b36de45f759f2` |
| parglare `tests/func/parsing/test_glr_forest.py` | 5013 | `68ded5c3966af4bef267c1d3fa31c49f87dd32da58290674ac039fdcad9fd000` |
| parglare `tests/func/parsing/disambiguation/test_glr_forest_disambiguation.py` | 4567 | `7fca48ff761ecd7be957aabc52ca3d9fd038a5f6e12f42de233bbc143f941874` |
| parglare `parglare/trees.py` | 12113 | `52774fa7e60f023bb34251d8bf88c5b90542a5e48f6b02c870e9c119d68bc6ae` |
| parglare `parglare/glr.py` | 38637 | `70b64fcf6b044b06c82640eb01eb5dbe4858fd0c249dff7b3842af61ff090130` |
| parglare `docs/parse_forest_trees.md` | 5690 | `940c2cec73f3b4a1b42e17b2adb0cf2f369824464a15f521ac220ebfb1a7c4b5` |
| parglare `LICENSE` | 1097 | `27d634d884fc0782ff6ac40843fda4748055bf401ba9c9b19d602b4761b31007` |

## 与 Archify 现有能力和工作排重

固定基线的 [Tree schema](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/tree.schema.json)为每节点一个 parent，可附 sources；[Explainer authoring](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/references/explainer-authoring.md)已有 `@tree`、表、literal fence、固定源码摘录/引用。前者文件 SHA-256 `65c794a1f522ce336afe787bd59adb63a81f57a5bba3ac266f2bae5c3a07b8c3`，后者 `b82c5cf7c75772f6f876feb49077d29206422cb4baa3e519f3fd4ca97dad47d7`；这些是读取证据，不是新 renderer 测试结果。

有限 Pair 树可逐 occurrence 映射；同 label 不等于同节点。packed forest 是共享 DAG，单 parent Tree 不保留全部共享关系；分别画已选树可以，但必须标结果 index、来源和覆盖范围。无需为两个例子改 schema、导入任意 JSON或遍历所有树。原始跨度放表即可；没有输入文本坐标联动也没有阻止该解释，不能把它包装成当前产品缺陷。

实时 GitHub CLI 只读检索 all issues 的 `grammar OR parser OR forest OR AST`、精确 `"parse forest"`，以及 open PR 列表和 all PR 的精确词。精确 forest 检索均空；这是关键词结果，不保证不存在同义工作。已见 [#1083](https://github.com/tt-a1i/archify/issues/1083) CLOSED（Explainer heading parser），与外部 grammar 阅读不同；[#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) OPEN、head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，属于 Code Analysis 导航，不是 forest consumer。未重审该 PR 全部实现，不据此宣布完全无重叠。此前 [grammar-reading](grammar-reading-smalltools.md)已经决定不做 parser importer/grammar schema，本轮证据没有推翻这一成本判断。

## 唯一条件内容候选与停止条件

**当前0个产品实施候选，0个已启动内容实施。** 若之后有具体读者问“为什么这个成功匹配的叶子没有内部节点”，可考虑一个固定 pest 内容页：保留上述完整 grammar/test文件及许可，选同一 `abcabc` 的 atomic/compound 两个已提交 expected，以两棵小 Tree＋区间表说明输出策略。基线应是原始 expected＋grammar，候选只加解释；原始文本不得被替换。反例仅作注记，不顺势扩成教学平台。

价值是防止把输出省略当未匹配，成本是固定几项 occurrence/跨度的手工核对；已有 Ohm/Lark 研究使增量价值有限。先验证普通表是否已足够回答问题，足够就停止，不为图而图。不新增执行器、上传入口、source mapper、折叠数据恢复、trace动画或 forest 枚举。不以成功 render/finalize证明 parser 运行或读者节时；若制作，必须另列真实 render、静态检查、实际浏览器和用户理解证据。

本轮只写本报告；不改 README、产品、其他 agent 文件或 live installation，不 commit/push。报告中的数字均为上游提交 expected 或直接源码合同，没有本轮解析成功/测试通过的暗示。
