# 第18轮：局部结构差异阅读，声明的中间态不等于真实修订

2026-10-25。深读五个此前未深入的项目，固定默认分支 revision、完整小输入、真实消费路径与许可正文；不按星数排序。research skill 的后台代理核前三项，主代理核后两项及去重，最终仅写本文。没有安装、执行上游、运行其测试/parser、应用patch、读取用户源码、打开Ego、改产品或创建实施分支。

**最多推荐一个 content-only 原型：Hintful edit stages。** 它回答“缩进全部变化时，patch为何还声明了一个不在最终文件中的中间文本？去掉数组项3是哪一步？”使用完整53B/61B文件和310B已提交patch，用现有code/table，必要时附三节点Workflow。不是接入格式、复刻结构diff算法、证明重构等价或新增语义比较器。其余四项保留边界证据，不另造实验。

## 先核既有范围

已读 hub 当前发布表，并复读 [PRLens](prlens-smalltools.md)、[图比较](graph-comparison-smalltools.md)、[比较阅读round5](comparison-reading-round5.md)、[Git/共变](git-architecture.md)、[源码小工具round4](code-reading-utilities-round4.md)及既有实验README。检索全部scouts的owner/repo与工具名，而非只看标题；未发现下面五仓已深入，检索不代表穷尽外部工具。

| 已有范围 | 已回答的问题 | 本轮不重复 |
| --- | --- | --- |
| PRLens / task-review-map | 独立声明与固定Git hunk/range映射，未覆盖/ZIP未知仍记账 | 不做PR平台、Agent解释服务或第二套scope账目 |
| payload-delta | 给定JSON两值的Pointer、类型、missing/null、明确index/idKey及数组顺序 | 不把无序列表/自动key matching改称新合同 |
| Delta values（已刷新10b4） | 读取已有稳定图ID/receipt里的SQL→SQL tx、orders→fraud；未保存的值不猜 | 不为结构代码匹配再造稳定ID、字段readout或导出格式 |
| diff-line-numbers | 原始两向文本diff行号完整、长代码可横滚 | 不再提行号/空白显示修复 |
| change-coupling | 共变计数/对称比例，非调用、原因或重构证明 | 不把共变当结构变化或影响结论 |
| Difftastic、Comby、ast-grep及已有比较round5 | 已筛语法差异、结构匹配、ANSI/空白、数组move等 | 不将旧来源重新计数，不引AST/语言parser工程 |

产品核对固定 [dev10b4](https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。现有 [diff.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/diff.mjs#L24-L109)只按两向unified/fragment核行、hunk和字面内容；Hintful的`<`/`>`行和带额外信息的hunk不属于该合同。**建议展示Hintful原文时用普通code块，不喂给`@diff`，也不扩它的parser。** [parse.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/parse.mjs)已有code/comparison/diagram承载，来源片段由既有SourceCard固定即可；有卡片不自动证明卡片描述的映射。

## 五项固定来源与处置

| 新来源 | 局部机制 | 本轮处置 |
| --- | --- | --- |
| diffsitter | 过滤后的叶子/grapheme序列再做edit script | 保留“过滤投影≠原文/行为相同”边界，不引擎整合 |
| astdiff | 同行多个声明分别比较；keyword负控制 | 最强的小回归pair，但不再开第二内容例/自动匹配器 |
| diffmantic.nvim | 多阶段tree matching后生成move/rename动作 | demo没有该pair的action golden，不假造运行输出 |
| diff-format | patch主动声明named snippet和中间步骤 | 唯一有条件的教育内容原型，零新parser |
| Graphtage | 比较策略改变列表/键的编辑成本与输出 | 与已有JSON比较合同重叠，不新增adapter |

## 新来源 A：diffsitter——过滤后的语法叶子，不是完整文本或行为等价证明

固定 [afnanenayet/diffsitter@a5a6681b0f50d1114f81aa8f3bbf61858b08e945](https://github.com/afnanenayet/diffsitter/tree/a5a6681b0f50d1114f81aa8f3bbf61858b08e945)，默认分支 main。实际 [LICENSE](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/LICENSE) 为 MIT，Copyright 2022 Afnan Enayet；全文1052B，SHA256 `0ee7ab7ce0ffdc23bbca9d7a7108440beb3cf4584a16d5c890c1833223e6f6a5`。依赖 parser 的许可不能由这份顶层许可包办；本轮未复制或引入 parser。

实际消费路径是 [CLI run_diff L94–135](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/src/bin/diffsitter.rs#L94-L135)：两个文件经 `generate_ast_vector_data`，再经 input processor，之后 [Myers edit script L782–790](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/src/diff.rs#L782-L790)，最后 renderer 消费 hunks 与原文件文本。它不是给原 AST 直接标一个“语义相同”布尔值。[input_processing L102–158](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/src/input_processing.rs#L102-L158)先取叶子/伪叶子，再按 kind include/exclude（exclude优先）及 grapheme/whitespace 配置处理；[L244–268](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/src/input_processing.rs#L244-L268)可剔除纯空白 grapheme。JSON renderer 输出的是这次 `DisplayData`，不是通用行为证明或可应用 patch。

完整小输入与 owning expected：

| 固定完整文件 | Bytes | SHA256 |
| --- | ---: | --- |
| [test_data/short/python/a.py](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/test_data/short/python/a.py) | 84 | `ca92681bf86313b259ea4a4025beef154f03c348f0f7af25df54b8a46afd34b4` |
| [test_data/short/python/b.py](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/test_data/short/python/b.py) | 105 | `f34d5ce6530695463215ccfcbdbb1b7e41e767fe65ccd141220f3f9fe4a9c7dd` |
| [当前 split_graphemes=true/strip_whitespace=true Python snapshot](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/tests/snapshots/regression_test__tests__short_python_split_graphemes_true_strip_whitespace_true.snap) | 405 | `af698bb071809f3f8c702625a20a6e4b6a1a86907b27e411b62bf91b6f55a4b2` |

[regression_test.rs L82–130](https://github.com/afnanenayet/diffsitter/blob/a5a6681b0f50d1114f81aa8f3bbf61858b08e945/tests/regression_test.rs#L82-L130)确实从该目录读完整pair、构造processor并断言命名快照。Python pair改了docstring中的换行/空白及 `not`，另加入赋值；当前快照只列 `not` 与赋值 token。不能因此宣称其余原文本未变、docstring值相同或程序行为等价。仓库还残留旧 `short_python_true.snap` / `short_rust_true.snap` 文件；本段选当前测试命名规则对应的快照，不能拿旧debug版当同次结果。

另核完整 Rust pair 45B/58B，SHA分别 `bf9ce315813af581df112a2ea7e0f3728e0e6ebc1a3e7bebc7e67d7ad6da1014` / `dc496c3765ab0c7ba303f8c8f05f369b67c6c05af7b757bf9afa15cd5cbc6a34`。其中a含无参数括号的 `fn add_one`，不是可据以宣称编译成功的重构案例；b也不只是格式化。这里有可核对的“过滤策略决定差异投影”问题，但不再开一个去空白/语义diff引擎；与已筛过的difftastic方向有较大维护面重叠，本段不提独立实施。

## 新来源 B：astdiff——一行内的两个 declaration，整行不等于一个结构单位

固定 [shcv/astdiff@239893cea43682c12ba4745c198ebe6fde412328](https://github.com/shcv/astdiff/tree/239893cea43682c12ba4745c198ebe6fde412328)，默认分支master。实际 [LICENSE](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/LICENSE) 为MIT，Copyright 2024 astdiff contributors；全文1076B，SHA256 `43582bbd06fbb7259d6eaecebca896c8015559303c75367b29c834c9a126af6f`。

完整已提交回归pair：

| 固定完整文件 | Bytes | SHA256 |
| --- | ---: | --- |
| [fixtures/regressions/one-line-old.js](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/fixtures/regressions/one-line-old.js) | 45 | `5f7c351bbfab7bf332ce954cd782e3e178381ea69eced2d77295824cce2940b7` |
| [fixtures/regressions/one-line-new.js](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/fixtures/regressions/one-line-new.js) | 45 | `83262f64d905e83c112386605800c13baa5f05ab08f3e180f24726ab10e03fa5` |
| [fixtures/regressions/keyword-old.js](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/fixtures/regressions/keyword-old.js) | 26 | `8b85c92b5aac0fc5972ce5fbbb9e54fec9ede2d6a6009b4f24f4e4864f6c0dc6` |
| [fixtures/regressions/keyword-new.js](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/fixtures/regressions/keyword-new.js) | 26 | `bc48c0425805b4a8b2702a08ab0f6b18035e9d8fb70c3e9b2358f043683c564a` |

45B文件都在同一行放a/b两个函数，a的正文保留，b的返回literal由2变3。[tests/correctness.rs L1–42](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/tests/correctness.rs#L1-L42)是直接owning消费：parse两份源码、extract declarations、compare，再断言只有1条change、path=`global.b`、classification=`Structural`。26B控制pair只把同一函数的 `true` 改为 `null`，测试明确不能因标识符归一而漏掉keyword literal。上述是提交的断言，不是本轮产生的输出或执行通过。

实际CLI [main.rs](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/src/main.rs)→[lib.rs run_diff L672–745](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/src/lib.rs#L672-L745)：完整read→JsParser→extract→match/compare→输出。[diff/mod.rs L256–309](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/src/diff/mod.rs#L256-L309)先校声明byte range可切片，再匹配，并把 `identical` 定义为changes为空；[classification L146–165](https://github.com/shcv/astdiff/blob/239893cea43682c12ba4745c198ebe6fde412328/src/diff/mod.rs#L146-L165)是该实现的归一化分类，不可提升为任意JavaScript行为等价。`global.b`是结构路径，不能当跨修订稳定ID或开发者确认的重命名。README另有lineage、命名审批、sourcemap等更大接口，不因小fixture而引入整套工具。

可供对照的新理解问题是“同一物理行改了，哪一个完整声明受影响？为何keyword literal不能和局部变量名一起抹掉？”这与diff-line-numbers的数字显示、Delta已有稳定图ID读值不同，但此处只保留证据/负控制，不另提第二个实验或实现AST matcher。

## 新来源 C：diffmantic.nvim——匹配后的move/rename动作不是原始文件事实

固定 [HarshK97/diffmantic.nvim@9dbfcfaaa7a99df63e2c2437ac801136ee7874d3](https://github.com/HarshK97/diffmantic.nvim/tree/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3)，默认分支main。实际 [LICENSE](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/LICENSE) 为MIT，Copyright 2026 Harsh Kapse；全文1068B，SHA256 `296078bba6cb0911a32f0452cab70543e7c0fe51cf6adc14c597ca621b4fd058`。

完整小对照为 [test/test1.lua](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/test/test1.lua) 142B / SHA256 `4966bc670ff136ab6b5ca6340089a079c3b73613180904c539388e70895889bf`，及 [test/test2.lua](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/test/test2.lua) 172B / `02e604f0d5fac78aee2101db20aa9739072d31fab213db89bd8f818e108497d7`。文本里add/subtract函数声明顺序互换、name字符串改变、print语句不再出现并增加multiply；不把这些静态文本观察说成已计算的move/rename动作或执行轨迹。

另读完整 [test/comparison/before.js](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/test/comparison/before.js) 869B / `acdd16b8edc374ed1103671eda53f02d19cc459f2b2a473b449d0503a8746c2b` 与 [after.js](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/test/comparison/after.js) 1042B / `03f813fb87cc18a381928b504907b20e286ba484f5d27363771ebdadfefde0d8`，混合声明移动、命名、constant、返回字段和权限分支修改，不能笼统标“纯重构”。本轮未找到这些短文件的已提交action golden/断言；它们只作为完整demo输入。**[test/benchmark.lua](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/test/benchmark.lua)自行生成synthetic buffers，不消费上述Lua/JS pair**，不能把该基准冒充pair的测试依据。

源码实际路径：[init.lua L77–142](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/lua/diffmantic/init.lua#L77-L142)接一/两个文件，经Neovim buffers/filetype选parser，parse两树，交core，再交UI。 [core.lua L125–190](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/lua/diffmantic/core.lua#L125-L190)依次pre/top-down/bottom-up/recovery，排序mappings，生成动作；[L102–121](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/lua/diffmantic/core.lua#L102-L121)另做rename promotion，[ui.lua](https://github.com/HarshK97/diffmantic.nvim/blob/9dbfcfaaa7a99df63e2c2437ac801136ee7874d3/lua/diffmantic/ui.lua)将actions送renderer。因此move/rename是具体匹配器的推导层，不是两个文本中自带的真实映射。parser/query前提、运行Neovim及多阶段维护面均超出本轮小内容实验；不推荐引入编辑器或导入该引擎。


## 新来源 D：diff-format——格式声明的中间文本，不是第三次真实提交

固定 [svenssonaxel/diff-format@826f50b9488b27058e0f29a38108c97ebc78790d](https://github.com/svenssonaxel/diff-format/tree/826f50b9488b27058e0f29a38108c97ebc78790d)，默认分支名 `master-syntax1`。不是读取浮动README图片来臆造fixture；该revision保留完整短文件与正式测试目录。

实际 [LICENSE.md](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/LICENSE.md) 是多选许可，明确包括Apache-2.0、MIT、BSD-3-Clause等；GitHub API的NOASSERTION不能替代正文。全文884B，SHA `e7260c06628bc478152847efb2ca4bd29730cdda048220cde365dd9fd693d5dc`；版权归属另在完整 [CONTRIBUTORS.md](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/CONTRIBUTORS.md)（40B，`527c704aab660b73057cb0f2ff762ce9528ef019afd8173c5a08c9ab82ad901f`）。若后续复制材料，应保留这两份原文件并明确采用的许可，不只写API许可证标签；本轮只读引用，不复制实现。

### 完整输入及反例

| 固定完整文件 | Bytes | SHA256 |
| --- | ---: | --- |
| [tests/001/a/file.py](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/001/a/file.py) | 53 | `1e99918f7dbe30fe1d61b00e37310b6096009e3a20b0f95a8c02e685b007b7c1` |
| [tests/001/b/file.py](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/001/b/file.py) | 61 | `7a6b16c1108e0ef29bb64112cee106de11206ecd766586b2c82fb46d2c46ebc7` |
| [tests/001/07-a-b.hintful.diff](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/001/07-a-b.hintful.diff) | 310 | `aaa1abddb4283af03f7af56ca60cbd7a82ecf1f93bb9b21a3e256eef04445f19` |
| [tests/001/11-a-b.invalid.hintful.diff](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/001/11-a-b.invalid.hintful.diff) | 311 | `1934717d10df8a8c786a27a47b12a27fd567f9187323177b4e065c6e0d32d634` |

A完整文件有列表字面值1/2/3；B加了`if True`包裹和相应缩进，列表只剩1/2。310B patch明确用同名 `enclosing if` snippet 分两段表达：先A→带包裹且仍含3的声明中间态，再该中间态→B删除3。**这个中间态不是第三份已提交源码、开发者真实编辑顺序或本轮运行日志。** 它是差异格式表达；这里也没有证明某种重构保持全部行为。

这不是凭名字猜映射：[MAIN.md L67–80](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/MAIN.md#L67-L80)规定左右snippet替代哪侧文件、空名如何返回文件流，以及同名内容必须一致；[L267–298](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/MAIN.md#L267-L298)说明snippet可以是中间形式，不必在最终文件里原样存在。[tests/README L22–45](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/README.md#L22-L45)将07明确归为两步中间态，并将11归为同名内容不一致的无效输入。11只把第二段的True改成False，说明**同名不等于可以无视内容**；不是某个Python运行结果失败。

### 源码真的怎样消费它

`implementations/python3/terminal-visualize-diff`、`validate-hintful-diff`在Git中是指向同一`implementation.py`的入口链接，不是17B的独立程序实现。统一入口按命令名选pipeline：[implementation.py L1196–1209](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/implementations/python3/implementation.py#L1196-L1209) stdin按latin1作字节保真读法，经glue/parse后串联处理；[parseHintfulHunk L281–359](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/implementations/python3/implementation.py#L281-L359)显式切换两侧snippet并积累内容；[validateSnippets L851–860](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/implementations/python3/implementation.py#L851-L860)用同名缓存检查内容相等；[pipeline L1128–1134、1175–1179](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/implementations/python3/implementation.py#L1128-L1179)分别去掉snippet转unified或执行格式验证。**它消费已有patch，不在这条路径自动理解Python或发现重构意图。**

Owning harness [tests/run-tests L239–325](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/run-tests#L239-L325)枚举数字目录和文件名，区分a/b内容、diff、invalid与派生`.gen`，实际把所选文件交给各validator；[L326–328、399–410](https://github.com/svenssonaxel/diff-format/blob/826f50b9488b27058e0f29a38108c97ebc78790d/tests/run-tests#L326-L410)还检查转换/展示路径。完整`implementation.py`为49381B / `c1032bfa84dc2b94694053fdc59a37d62361690d81863fc2a74acf9acb2f96b7`，`tests/run-tests`为30490B / `8422c10e6b3ff9993ce2e807acc6cea5f0ac4c0e349bbe15bc1b4ed2b06b2b51`，`MAIN.md`为25203B / `4107b9160c21bf85b7b004af862d7ea81b0eb9474bf319d02e6ddb28ecefebae`。这些是完整读取的owning文件，不是我们执行过的验证器或快照结果。

## 新来源 E：Graphtage——“没有编辑”取决于比较合同

固定 [trailofbits/graphtage@afa9b34ce09327bcd37bb40e9e61ca97c1baa80d](https://github.com/trailofbits/graphtage/tree/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d)，默认master。[LICENSE](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/LICENSE)为LGPL v3全文7652B / SHA `e3a994d82e644b03a792a930f574002658412f62407f5fee083f2555c5f23118`；[pyproject.toml](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/pyproject.toml#L1-L18)明确LGPL-3.0-or-later。这里只独立观察，不复制进Archify或引入库。

完整 [test/test_issue_56.py](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/test/test_issue_56.py)是1947B，SHA `b704659a9aa5afd76fb17380077e842f3ab1c7c08a360a07339fb175e7b996f8`。其中完整两个bytes literal `RULES` / `REORDERED_RULES`各306B，分别为 `159093c7a83c4d3a55595dfbcda942457c4d5e99ae46d8a1e1399bbc363f9f17` / `1c5de5d5994d9c0b87cec3cdb7bfaf8edbe17d424b779e7834b5b71462ac6ab8`。这是同一完整已提交测试里的常量，不冒称两份独立committed YAML文件。列表里一个macro位置从rule前移到rule后；默认选项断言cost>0，`ignore_list_order=True`断言cost=0且没有nonzero edits。**不表示这些规则在真实消费者中的执行效果或声明顺序总可忽略。** 本轮没有运行YAML loader、Graphtage、规则系统或测试。

实际路径不是README营销：fixture经`FILETYPES_BY_TYPENAME["yaml"].build_tree`→[yaml.py L31–42](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/graphtage/yaml.py#L31-L42)读取并解析，再交[json.py L68–91](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/graphtage/json.py#L68-L91)按选项构建ordered/unordered node、可编辑或固定key dict；TreeNode.diff结果由[CLI L377–406](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/graphtage/__main__.py#L377-L406) formatter/edit-digest输出并计算had_edits。这里的匹配成本和key对应策略不生成领域稳定身份。

它也确有源码结构路径：完整 [test/test_pydiff.py](https://github.com/trailofbits/graphtage/blob/afa9b34ce09327bcd37bb40e9e61ca97c1baa80d/test/test_pydiff.py) 8949B / `5711a07613c2fb3b20862fd757b5f84057f1649d4d667f4fd614f255285d5701` 中L22–30把两段Python源交stdlib `ast.parse`后建树/format，L109–111的完整短pair只改import alias。不能把“AST字段差异”推广为名称绑定/行为等价。由于列表/身份策略已经是payload-delta的明确输入合同，AST解析又引入新维护面，本轮不再制作这个例子或adapter。

## 唯一建议：Hintful edit stages，表格先于图

**读者任务：** 看这份完整310B patch，区分“原文件/最终文件里实际有什么”与“patch为了分解变化而声明的中间形式”，找到真正移除列表3的那一步。它不是问程序是否正确、不需要生产事故或用户工作负载先验；这里的教育价值在于不把格式的中间模型误读为真实修订史。

最小内容合同：

1. 保留53B A、61B B、310B patch三份完整原字节，以及原LICENSE/CONTRIBUTORS、owning规范/实现/测试引用。可带311B invalid反例，显示同名snippet必须一致，不能吞掉它当成功输入。
2. 页首先给三行表：A含1/2/3；命名中间态已包`if True`且仍含1/2/3；B保留包裹而只含1/2。前后源与patch用既有普通code/SourceCard显示。中间态明确标“按patch声明展开的说明”，不给它伪造的Git路径、commit、源码行号或原始文件hash。
3. 若确实有助于读者，可附三节点Workflow，箭头标签写“patch声明：包裹/缩进”和“patch声明：删3”；不是运行时间线、调用图或实际编辑顺序。表格和完整原文是主体，图可不做，不为图新造parser、schema、稳定ID或动画。
4. 只做固定事实和字面绑定审计：输入hash、code原文、snippet来源、表中元素与原文一致。没有运行上游就仍标未运行；普通渲染/finalize、真实截图、AT/人类收益分别记，不能将规范或上游测试的存在说成本轮执行通过。

**相对旧实验的独立增量：** payload-delta没有第三种声明形式；Delta values只消费已有receipt两侧字段；task-review-map的独立agent声明不是一个格式规定的中间文本；SourceCard解决位置绑定，不替读者区分格式里的“存在于文件”与“为了展示而声明”。因此可先做这个很窄的内容原型，但不建议把Hintful接入Archify `@diff`、开发格式转换器或结构merge工具。

**停止条件：** 若普通三行表加完整原文已经把问题讲清，就不增加Workflow或产品控件；若必须运行/重写上游、解析任意patch、猜matched entities或掩盖格式不一致才能展示，停在报告。原型没有承诺效率提升、行为保持、自动重构解释、通用semantic diff或部署正确。

## 初筛与研究限制

另外初筛了 [ivankovic/codediff@2242e0ec0fdcf0650497d361856a1f7605fada8f](https://github.com/ivankovic/codediff/tree/2242e0ec0fdcf0650497d361856a1f7605fada8f) 的目录/README：其消费面扩到压缩容器和广泛多格式corpus，未继续追这一层的所有fixture/许可，不计入上面五个深读项目，也不拿来建议新平台；它与已研究的esmuellert/codediff.nvim不是同一仓。

固定revision只说明本次读取身份，不说明未来HEAD不变。小fixture足以支持受限教学，不证明大仓适用性或工具正确性；反过来也不因它不是生产事故就拒绝教育内容。没有用星数、README截图、项目自称semantic、匹配器分类或零edit cost代替读者问题和证据。全文仅记录来源、界限和一个可能原型，没有产品修改、上游执行、安装、Ego、提交或推送。
