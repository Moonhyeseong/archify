# Shell命令阅读：原始引用、语法结构与运行参数分层

2026-10-25，第9轮只读研究。**6个此前未列入scouts的一手来源，深入mvdan/sh的完整展开fixture、explainshell/bashlex的引用范围与完整测试case，并窄读ShellCheck的诊断条件。当前0个实施候选。** 最值得保留的是“原始命令字符、去引号的word、实际argv和程序输出不是同一层”；不是再画一个三节点管道。

Archify固定基线为 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，#1102已合入。研究只读取官方API、源码、许可与已提交fixture；后台只读agent核explainshell/bashlex，作者核其余来源与Archify owning source。**没有运行任何上游shell命令、parser、展开器、生成器、shellcheck或未知程序**，未安装、生成图、使用浏览器或运行Archify测试。工具命令仅用于读文件、取官方文本、hash和本报告写入；fixture中的命令全部当文本。

## 排重与六个新来源

先读 [build-infra](build-infra-smalltools.md)、[execution-reading](execution-reading-smalltools.md)、[code-reading-utilities-round4](code-reading-utilities-round4.md)、[source-navigation](source-navigation-smalltools.md) 和研究中心34项实验，再全文检索仓库名。Just priors/subsequents、实际dump来源、CI条件、CLI reading tour和Source question tour已有独立责任；不将其重新包装为shell解释器。也不将一般syntax AST、shell依赖DAG或代码高亮本身算作新阅读价值。

| 固定来源与revision | 真实许可/本次状态 | 小机制及判断 |
| --- | --- | --- |
| [idank/explainshell](https://github.com/idank/explainshell/tree/827ebe38da9822a10e89946551e377330a9de35e) `827ebe38da9822a10e89946551e377330a9de35e` | [完整GPL v3文本](https://github.com/idank/explainshell/blob/827ebe38da9822a10e89946551e377330a9de35e/LICENSE)，未归档 | 原命令区间与所选manpage解释关联；quoted `-foo`不随便当短选项，未解释段保留。深读见下；manpage对应不等于程序接受/执行证明。 |
| [idank/bashlex](https://github.com/idank/bashlex/tree/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62) `3f6b76c4c8462f4b90d9b1c73a555c45cde42f62` | [LICENSE为GPL v3文本](https://github.com/idank/bashlex/blob/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62/LICENSE)，[README明确v3+](https://github.com/idank/bashlex/blob/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62/README.md#L113)；未归档，固定默认分支提交2024-04-08 | word保留去引号结果及原pos，substitution另有node；parser不执行，不完整支持arithmetic/复杂parameter expansion。适合学证据边界，不新增AST importer。 |
| [mvdan/sh](https://github.com/mvdan/sh/tree/7afdecf9c6edadb30d1e35492d867b4df5e9ed11) `7afdecf9c6edadb30d1e35492d867b4df5e9ed11` | [BSD-3-Clause](https://github.com/mvdan/sh/blob/7afdecf9c6edadb30d1e35492d867b4df5e9ed11/LICENSE)，未归档 | syntax/expand/interp职责分开；Literal、Fields、Document用途不同，环境/目录/命令替换显式依赖Config。深读见下，不因有parser就暗中运行expand/interp。 |
| [koalaman/shellcheck](https://github.com/koalaman/shellcheck/tree/cd9072643932ee2008e454e2cd990e25c1dc9d49) `cd9072643932ee2008e454e2cd990e25c1dc9d49` | [GPL v3文本](https://github.com/koalaman/shellcheck/blob/cd9072643932ee2008e454e2cd990e25c1dc9d49/LICENSE)，[Analytics源码头声明v3+](https://github.com/koalaman/shellcheck/blob/cd9072643932ee2008e454e2cd990e25c1dc9d49/src/ShellCheck/Analytics.hs#L1-L20)；未归档 | SC2086不仅看有无引号，还看上下文及CFG变量状态；诊断是静态风险，不能写成实测argv。不要搬GPL实现或新增本地扫描器。 |
| [vorpaljs/bash-parser](https://github.com/vorpaljs/bash-parser/tree/67a05de4238e4fea016677c308ce101070e9c4e8) `67a05de4238e4fea016677c308ce101070e9c4e8` | [MIT](https://github.com/vorpaljs/bash-parser/blob/67a05de4238e4fea016677c308ce101070e9c4e8/license)，未归档 | [完整pipe.js](https://github.com/vorpaljs/bash-parser/blob/67a05de4238e4fea016677c308ce101070e9c4e8/test/fixtures/pipe.js)将`run | cry`转为Pipeline下两个SimpleCommand；[单引号替换fixture](https://github.com/vorpaljs/bash-parser/blob/67a05de4238e4fea016677c308ce101070e9c4e8/test/fixtures/command-subst-single-quotes.js)的反引号保留为Word字面值。这是expected AST，不是命令执行。 |
| [bashly-framework/bashly](https://github.com/bashly-framework/bashly/tree/3cf4064103b934de28ec4c5131610d4207ada76c) `3cf4064103b934de28ec4c5131610d4207ada76c` | [MIT](https://github.com/bashly-framework/bashly/blob/3cf4064103b934de28ec4c5131610d4207ada76c/LICENSE)，未归档 | [完整minimal YAML](https://github.com/bashly-framework/bashly/blob/3cf4064103b934de28ec4c5131610d4207ada76c/examples/minimal/src/bashly.yml)描述required source/optional target/force flag；[独立body](https://github.com/bashly-framework/bashly/blob/3cf4064103b934de28ec4c5131610d4207ada76c/examples/minimal/src/root_command.sh)才是执行实现。CLI声明/生成help/body应分别读；与既有CLI tour重叠，不运行Ruby生成器或shell body。 |

固定SHA是本次读到的对象，不等于已发布版；未归档也不代表持续维护。没有以star作筛选或收益证据。GPL源码/fixture若以后保存进实验，必须按具体来源许可办理，不能套Archify当前Apache声明；本轮只保存报告和链接，没有搬源码。

## 深读一：引号还在原文中，word却可能已不含它

explainshell [test_matcher.py L267附近完整case](https://github.com/idank/explainshell/blob/827ebe38da9822a10e89946551e377330a9de35e/tests/test_matcher.py#L267)分别使用`bar -b '-foo'`、双引号版和`bar -b '-7 days'`，expected将选项及带引号参数关联到同一解释区间[4,13)或[4,16)。这不是简单按空格拆分、再把所有以减号开头的片段当选项。

[matcher.py L604附近](https://github.com/idank/explainshell/blob/827ebe38da9822a10e89946551e377330a9de35e/explainshell/matcher.py#L604)比较原span长度与去引号word长度，保留是否quoted的上下文。[嵌套command/process substitution处理](https://github.com/idank/explainshell/blob/827ebe38da9822a10e89946551e377330a9de35e/explainshell/matcher.py#L470)记录内部范围，当前expansionlimit=1；它不提供替换命令的stdout，也不能据此说所有嵌套内容都解释完了。解释帮助还依赖选中的命令/manpage版本、选项规则和匹配覆盖；“找到了帮助”并不证明真实binary会接受这些参数。

底层bashlex的 [parser.py](https://github.com/idank/bashlex/blob/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62/bashlex/parser.py#L131)保留原token起止范围，而word值可能已经去引号。[完整test_word_expansion](https://github.com/idank/bashlex/blob/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62/tests/test_parser.py#L692)含单/双引号、拼接词`a"b"'c'd`与`'$(a)' "$(b)"`：前者是字面文本，后者包含command-substitution子树。相近的屏幕字符有不同语法身份，不能拿去引号word长度回算原文source range；范围口径也不能自动当UTF-8 byte offset。

[完整pipeline测试](https://github.com/idank/bashlex/blob/3f6b76c4c8462f4b90d9b1c73a555c45cde42f62/tests/test_parser.py#L168)区分`a | b`和`! a | b`的节点。这里的管道图是连接结构；不能画成“a全部完成后才执行b”，也没有实际流入字节、退出状态、pipefail设置或成功证据。README明确不执行，并承认特定展开语法不支持；不因“complete AST”一句话就宣称完整Bash语义。

**可迁移机制**：把原命令完整保留，说明片段带独立原区间与来源，未解释片段不消失。它适合手写固定说明的审阅规则，不足以支持Archify运行parser、抓manpage数据库或做一套命令编辑器。现有source ranges/Passport已有大部分承载能力；当前没有具体复杂命令输入需要这一额外交互。

## 深读二：展开输出必须绑定环境与文件系统

mvdan [expand_test.go完整文件](https://github.com/mvdan/sh/blob/7afdecf9c6edadb30d1e35492d867b4df5e9ed11/expand/expand_test.go)本次完整取得并读完，包含以下可复核配置/输入/expected。本轮没有执行其Go测试，也没有运行任何case里的shell片段。

- `TestConfigNils`先在测试代码设置EXPAND_GLOBAL=value，nil Config与零Config展开同一变量expected都是空；只有显式`Env: ListEnviron(os.Environ()...)`得到value。这是上游测试设置与expected，不是本机变量读取。
- `TestFieldsEscapedGlob`提供完整mock目录a.go/b.go和PWD=/：`*.go` expected为两个field；`"*".go`、`'*'.go`和转义星号expected为单个字面`*.go`，另有方括号与尾星号case。不是本机目录扫描，更不是将未引用表达式的图写成已观测文件列表。
- `TestFieldsIdempotency`对`{1..4}`/`a{1..4}`各调用两次，expected分别为四个field；fixture记录展开行为，不记录之后任何外部程序是否启动或成功。

[Config定义 L29–82](https://github.com/mvdan/sh/blob/7afdecf9c6edadb30d1e35492d867b4df5e9ed11/expand/expand.go#L29-L82)明确Env、CmdSubst、ProcSubst、ReadDir/ReadDir2依赖；nil CmdSubst遇命令替换返回UnexpectedCommandError，nil目录回调禁用globbing。部分用户home查找还有fallback，**不能把“零配置”概括为所有形式都没有外部读取**，也不能把未展开的glob称实际无匹配。

[Literal/Document](https://github.com/mvdan/sh/blob/7afdecf9c6edadb30d1e35492d867b4df5e9ed11/expand/expand.go#L262-L303)和 [FieldsSeq](https://github.com/mvdan/sh/blob/7afdecf9c6edadb30d1e35492d867b4df5e9ed11/expand/expand.go#L557-L615)分别面向赋值单字符串、heredoc体、命令参数fields。不能把一条统一“空格分词→去引号→执行”的Workflow当每个语法上下文的完整过程；更不能仅提供Env就假设command substitution、glob及实际argv已知。库具备expand/interp API并不授权调用它们，本轮完全未调用。

这比加一个参数气泡更有价值的地方是证据依赖：**只知道源码时展示语法；拥有冻结环境与目录snapshot时才讨论确定的展开expected；拥有真实producer记录时才称实际argv/输出。** 缺失环境不能自动补当前本机值；模拟配置也不冒充自然生产运行。

## ShellCheck：风险诊断与实际argv还差一步

[Analytics.hs L2230–2248](https://github.com/koalaman/shellcheck/blob/cd9072643932ee2008e454e2cd990e25c1dc9d49/src/ShellCheck/Analytics.hs#L2230-L2248)的完整内嵌case将`a='cow moo'; echo $a`列为verify，引用变量版与`[[ $a ]]`等列为verifyNot。后续case还区别赋值、算术、command-name、数组及控制流后变量状态。这里verify/verifyNot是上游断言的存在/不存在，不是本轮扫描或某命令成功/失败。

[checkSpacefulnessCfg' L2301–2342](https://github.com/koalaman/shellcheck/blob/cd9072643932ee2008e454e2cd990e25c1dc9d49/src/ShellCheck/Analytics.hs#L2301-L2342)先判needsQuoting与上下文，再取CFG incoming state和变量properties；不知道state时isClean走保守false。SC2086是静态诊断及fix建议，不是运行后确实产生多个argv的receipt；也不能把没报该码称所有展开安全、脚本语义正确或程序已执行。

这与现有Archify“引用吻合≠语义正确/测试通过”的边界一致。若以后展示已有ShellCheck JSON，应保留code、severity、原始range、shell/config/版本及覆盖范围；不在本轮引入扫描命令、fix应用或通用shell安全判断。

## 固定字节复核

仅官方fixed-SHA完整原文件，私有临时保存，未执行或复制进产品。深读case的全部输入与expected以上游完整链接为准，不以挑选片段冒充完整工具支持集。

| 原文件 | bytes | SHA-256 |
| --- | ---: | --- |
| mvdan/sh expand/expand.go | 43305 | `0aa750160e4699983f37a349b762dc07d293507ab5d42c48d1d9317af2f8a74b` |
| mvdan/sh expand/expand_test.go | 5150 | `50258e30edc469f4e24d0efa854cbd1955233290a7b0d67fce24bce8a5d3a203` |
| ShellCheck src/ShellCheck/Analytics.hs | 280762 | `ad2440e71e02831054e391332a1b0311c162ce1424b459e2fb0f9813470abf3e` |
| bash-parser test/fixtures/pipe.js | 361 | `018906f1e3429d52e2726a6c28790afce5ebec0c3d8d413d4e8795307eaefb3f` |
| bash-parser test/fixtures/command-subst-single-quotes.js | 278 | `9d38b6303b6db3fdc38e245de462c9b0d114e20c465ccefd6548a8e3f49125cb` |

## 现有产品与实验的剩余差异

当前 [agent-tool-call.workflow.json L30–42](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/examples/agent-tool-call.workflow.json#L30-L42)只把Tool Call概括为“shell / browser / MCP”，并未声称shell AST/argv/管道轨迹。本轮读取examples的shell/pipeline/quote命中，没有找到一个真实复杂命令解释的失败样例；这不等于证明所有文档命令都无问题。不能凭该概括节点虚构一个parser缺口。

Recipe stages已经区别声明依赖前后边界、空body与实际Just dump来源；它没有解析或执行body中的shell，更不需要借Bashly生成一遍CLI。CLI reading tour侧重公开CLI合同与使用问题，Source question tour侧重源码证据是否固定版本；重新画原文→AST→help的三节点页不会自动增加阅读价值。CI conditions已有未知条件/实际执行边界，不能把shell静态检查包装成另一套CI结果预测。

[PR #1102](https://github.com/tt-a1i/archify/pull/1102)已合入10b4，Passport说明、drilldown、复制焦点等是基线。本轮官方API再次核 [PR #1103](https://github.com/tt-a1i/archify/pull/1103)仍OPEN/draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；Atlas负责Code Analysis模块/file/function度量与findings，不是shell展开运行时。此处不复刻Atlas或新增source inspector，也不声称审查了整个PR。

## 推荐、成本与停止条件

本轮**0个立即实施候选**。引用span与未解释账目可直接作为未来内容审阅原则；parser/manpage对齐、globbing环境、substitution回调、shell/flavor与真实执行记录会迅速扩大平台责任。现有公开任务未证明这笔维护成本值得。

仅当出现一条已有公开的复杂命令，读者实际无法回答“这一段是字面量还是替换、这一项为什么是一个参数、管道箭头究竟代表什么”时，再做最小内容比较：固定完整命令与所属shell/版本、原字节；按原区间手写少量语法/帮助说明，未解释片段明确留空或unknown，用现有Explainer原文与panel承载。不要先导入AST或求值。若原文加短说明已能回答，就停止；不为展示工具能力加新converter。

若问题要求实际argv、glob命中文件、替换输出、管道字节或exit状态，必须先有可信的冻结producer记录和配置；缺失时保留未知，本轮不主动执行命令补齐。任何语法图都不替代运行或安全结论，也不能把manpage解释当当前binary接受证明。未有相同阅读问题的对照数据前，不声称节时、理解率或用户验收。

仅新增本报告，没有改README、其他报告或产品，无commit/push；上游fixture、源码推导、实际执行（本轮无）分别记账。
