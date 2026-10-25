# Repository onboarding：符号与调用点的可核验证据

2026-10-25。只读研究，未运行上游安装器、索引器、hooks、项目代码或 LLM；未新增 parser、产品接口或实验产物。按研究中心既有 18 份 scouts 的 GitHub owner/repo 去重，以下 9 个来源未在既有报告列入；不以 stars 筛选。大型基础设施只作为字段与语义对照，不等同于推荐引入。

结论：最多保留两个可取点，其中只有第一个值得考虑一个很小的 authored 示例。**先把“这里确有一处调用表达式”“生产者把目标解析成谁”“它是否真实执行过”分开阅读**。已有 source-question-tour、dependency-map 与 Code Analysis 已覆盖不少相邻能力，没有发现需要再造完整 repo-map 或 symbol parser 的依据。本轮没有实测作者修复时间、阅读效率或用户收益。

## 9 个固定来源与真实输入/输出

每行 commit 是本次查看的一手源码快照；许可链接指向同一快照。字段来自源码或协议时明确注明；README 的宣传不当作精度验证。

| 来源与固定 commit / 许可 | 输入与实际输出 | 可借鉴的阅读机制、不能声称的语义 |
| --- | --- | --- |
| [benwelker/callscope](https://github.com/benwelker/callscope/tree/660671c4c8eecefb1a011257fc81d6180dd095bf)，[MIT](https://github.com/benwelker/callscope/blob/660671c4c8eecefb1a011257fc81d6180dd095bf/LICENSE) | Python 文件，经 stdlib AST；输出自包含 HTML 或 JSON。JSON 顶层 `project/stats/functions/modules`；函数含 `n/q/m/f/l/c/d/src/calls/callers`，调用元组含目标、源码片段相对行、列范围、approx 标记、原始 token。见 [export 及 resolver](https://github.com/benwelker/callscope/blob/660671c4c8eecefb1a011257fc81d6180dd095bf/callscope.py#L279)。 | 直接在调用文本开下一源码窗，保留反向 caller；区分近似与未解析。独特价值是**逐调用点**而非只有函数间一条边。静态 resolver 的非近似结果仍不等于动态语言运行时唯一 callee。 |
| [algorisys-oss/repograph](https://github.com/algorisys-oss/repograph/tree/397ecf78d3ffabb46ccea1f2cbfe5fff88ba0d8c)，[MIT](https://github.com/algorisys-oss/repograph/blob/397ecf78d3ffabb46ccea1f2cbfe5fff88ba0d8c/LICENSE) | repo 文件；regex 基线，可选 ctags/tree-sitter/SCIP。Markdown map 与 graph JSON；[序列化](https://github.com/algorisys-oss/repograph/blob/397ecf78d3ffabb46ccea1f2cbfe5fff88ba0d8c/repograph.py#L1446) 文件含 `path/language/lines/hash/doc/symbols/imports`，可选 `edges/ibind/vtypes/gitsha/bk`；edge `src/dst/kind/line`，可选 `recv/did`。 | `hash` 和 backend build key 能提醒“地图来自什么提取”。不同 backend/层次能力不相同，SCIP 名称不保证精确；regex 某路径去重不含 line，不能数全调用点。`init` 会安装 hooks/调整 Git 行为，本轮未运行。 |
| [ast-grep/ast-grep](https://github.com/ast-grep/ast-grep/tree/aaa80f08698dee907402f844da06850c435c431e)，[MIT](https://github.com/ast-grep/ast-grep/blob/aaa80f08698dee907402f844da06850c435c431e/LICENSE) | 源文件和 AST pattern/rule；[JSON printer](https://github.com/ast-grep/ast-grep/blob/aaa80f08698dee907402f844da06850c435c431e/crates/cli/src/print/json_print.rs) 输出 `text/range/file/lines/charCount/language`，可选 `replacement/replacementOffsets/metaVariables`。Range 有半开 byteOffset 及零基 start/end；捕获值分 single/multi/transformed。 | pattern 的命中文本与捕获值可以复核“为何认为这是调用”；同名匹配不构成符号解析。rewrite 建议也不表示已应用。本轮只查字段，不运行 rewrite。 |
| [universal-ctags/ctags](https://github.com/universal-ctags/ctags/tree/82494361bb3e7d4f7cf1d2bdc0d0e9001c926e45)，[GPL v2 文本](https://github.com/universal-ctags/ctags/blob/82494361bb3e7d4f7cf1d2bdc0d0e9001c926e45/COPYING) | 源文件→tags 或 JSON Lines。官方 [JSON 规范](https://github.com/universal-ctags/ctags/blob/82494361bb3e7d4f7cf1d2bdc0d0e9001c926e45/docs/man/ctags-json-output.5.rst) 示例 `_type/name/path/pattern/language/kind/scope/scopeKind`；字段由参数及 parser 决定，`end` 可选。`ptag` 与真实 tag 必须分开，版本从 pseudo-tag 读取。 | 定义目录可帮助找入口；tags 不是通用 references 或 call graph。缺少 end 不能猜整函数。仅研究协议，不复制 GPL parser，不建议 Archify 承担语言覆盖。 |
| [vitsalis/PyCG](https://github.com/vitsalis/PyCG/tree/8d5dc40837803beef1d8d379fbf2cdad6cd94641)，[Apache-2.0](https://github.com/vitsalis/PyCG/blob/8d5dc40837803beef1d8d379fbf2cdad6cd94641/LICENCE) | Python 源与入口→静态 call graph。[simple formatter](https://github.com/vitsalis/PyCG/blob/8d5dc40837803beef1d8d379fbf2cdad6cd94641/pycg/formats/simple.py) 输出 node→target 数组；[FASTEN formatter](https://github.com/vitsalis/PyCG/blob/8d5dc40837803beef1d8d379fbf2cdad6cd94641/pycg/formats/fasten.py) module 有 sourceFile，namespace metadata 有 first/last。 | adjacency 不包含逐 call-site 行号；定义区间不能冒充调用区间。assignment graph 是另一产物。README 明确不再开发，不建议为新增导览维护其分析器。 |
| [Technologicat/pyan](https://github.com/Technologicat/pyan/tree/ea91473f7dd77a269a64228a588cda9a00a57470)，[GPL v2 许可文件](https://github.com/Technologicat/pyan/blob/ea91473f7dd77a269a64228a588cda9a00a57470/LICENSE.md) | Python AST/symtable→define/use 图、DOT/yEd/plain list；[Node](https://github.com/Technologicat/pyan/blob/ea91473f7dd77a269a64228a588cda9a00a57470/pyan/node.py) 保存 namespace/name/AST/filename 与 flavor；namespace None 可表示未知节点，结构 scope 可无 AST。 | “uses”不全是调用，未知节点不应隐藏成确定 callee；结构 scope 不应当作业务执行组件。不移植 GPL 分析器。README badge 的 GPLv2+ 与文件标题口径不同，若复制代码需进一步逐文件核许可，本轮不复制。 |
| [github/stack-graphs](https://github.com/github/stack-graphs/tree/fcb7705d5b38ae13b3665a9b2c882e5a97243d44)，[MIT](https://github.com/github/stack-graphs/blob/fcb7705d5b38ae13b3665a9b2c882e5a97243d44/LICENSE-MIT) OR [Apache-2.0](https://github.com/github/stack-graphs/blob/fcb7705d5b38ae13b3665a9b2c882e5a97243d44/LICENSE-APACHE) | 语言规则与源文件→可拼接的名称解析图。[graph serde](https://github.com/github/stack-graphs/blob/fcb7705d5b38ae13b3665a9b2c882e5a97243d44/stack-graphs/src/serde/graph.rs) 按 PushSymbol/PopSymbol 等类型保存 symbol、is_reference/is_definition，并加载 source_info span/syntax_type。 | 可解释引用到定义的解析路径；该路径是名称解析机制，不是应用调用链或运行轨迹。项目已归档，语言规则和增量索引成本过高，否决引入。 |
| [scip-code/scip](https://github.com/scip-code/scip/tree/d556dd3c24b3c1787e0b62cd31f25188300e3098)，[Apache-2.0](https://github.com/scip-code/scip/blob/d556dd3c24b3c1787e0b62cd31f25188300e3098/LICENSE) | 索引器产出 protobuf index；[scip.proto](https://github.com/scip-code/scip/blob/d556dd3c24b3c1787e0b62cd31f25188300e3098/scip.proto) 顶层 metadata/documents/external_symbols；Document 有 relative_path/occurrences/symbols/position_encoding，Occurrence 有 symbol/symbol_roles/range 或 typed range；Relationship 分 is_reference/is_implementation/is_type_definition/is_definition。 | 协议严格区分 occurrence role、symbol relationship、位置编码；reference 不等于 call。协议开头明确生产者可从编译器到语法启发式，不能由“SCIP”推导精度或当前源码新鲜度。这是协议来源，不是小型索引器推荐。 |
| [jarvis-intelligence/jarvis-index](https://github.com/jarvis-intelligence/jarvis-index/tree/c7f775091a5883301ba29aefc76965cd8539af44)，[plugin MIT](https://github.com/jarvis-intelligence/jarvis-index/blob/c7f775091a5883301ba29aefc76965cd8539af44/plugin/LICENSE) | README/插件公开 goToDefinition/findReferences/callHierarchy/documentSymbols/indexRepo/getIndexStatus 等工具合同，见 [tool roster](https://github.com/jarvis-intelligence/jarvis-index/blob/c7f775091a5883301ba29aefc76965cd8539af44/plugin/skills/jarvis-use/references/tool-roster.md)。 | 把索引状态和问答查询分开值得注意；但 README 明确这个仓库是发行面而非 backend 源码。MIT 只在 plugin 内核实，不能把预编译 backend 宣称为 MIT 开源、已审计或已验证精确。列为边界反例，不推荐安装。 |

## 深读：三个机制的真实边界

### 1. Callscope：把一条关系拆回可读的调用点

[FunctionInfo 与 AST collector](https://github.com/benwelker/callscope/blob/660671c4c8eecefb1a011257fc81d6180dd095bf/callscope.py#L57) 保存源片段、函数行以及每处 call 的 token 与列范围；[JSON export](https://github.com/benwelker/callscope/blob/660671c4c8eecefb1a011257fc81d6180dd095bf/callscope.py#L352) 将调用行转换为相对 `src_start` 的行。Reader 因而能在代码文本上点调用，而不是面对只有 `caller → callee` 的全局图。

Resolver 会尝试当前模块、导入、类等，最后以唯一简单名称/方法名候选作为近似 fallback；`approx` 必须随结果展示，`target=None` 必须保留为未解析。JSON 的 `l` 是函数位置，call tuple 中行号是源片段相对位置，二者不可混用。列坐标还需与前端字符编码核对，不能直接假设为浏览器字符串下标。已检查的 export 没有绑定 commit/file hash，使用冻结片段时应额外记录来源 revision，不把旧 snippet 与新文件拼接。

这里值得借鉴的是阅读动作；没有证据证明其 resolver 覆盖率或准确率，故不推荐搬进 Archify。

### 2. Repograph：来源口径比“有一份图”更关键

[内部记录](https://github.com/algorisys-oss/repograph/blob/397ecf78d3ffabb46ccea1f2cbfe5fff88ba0d8c/repograph.py#L172) 中 Symbol `name/kind/line/end` 的 end=0 表示未知；FileNode 有 content_hash/gitsha/build_key。对外 JSON 用 `hash/gitsha/bk`，不是内部属性名。backend 改变会改变图的含义；ctags 路径可只替换 symbols 而保留 regex imports/docs，不能把整份文件笼统叫“精确提取”。

[regex edge extraction](https://github.com/algorisys-oss/repograph/blob/397ecf78d3ffabb46ccea1f2cbfe5fff88ba0d8c/repograph.py#L643) 的 seen key 对部分调用为 `(cur,name,recv)`，不包含调用行；重复调用会折叠为关系。这是一个具体提醒：若导航 UI 声称“所有调用点”，必须先证明 producer 实际保留每次 occurrence，不能从压缩图逆推。只显示已返回条目，并标注是否去重。

### 3. Ast-grep / SCIP：匹配、引用、解析不能共用一个笼统“证据”标签

Ast-grep 的 MatchJSON 保留命中文本、原文件、byte range 和 metavariable 值，足以让人检查一个语法模式命中了什么；不能凭 `$F(...)` 就宣称 `$F` 唯一指向某函数。SCIP 用 role bits 和独立 Relationship 表达 reference/definition/implementation，也并未定义“每个 reference 都是调用”。[SCIP 文档位置编码](https://github.com/scip-code/scip/blob/d556dd3c24b3c1787e0b62cd31f25188300e3098/scip.proto) 可为 UTF-8/16/32；不统一坐标原点与编码会造成看似正确的高亮指错 token。

所以一个证据卡至少要让读者识别：这是 producer 的语法命中、名称解析结论，还是作者对固定代码的解释；运行事实需要另有 trace，本轮没有。

## 与 Archify 现状对照

- [source-question-tour](https://github.com/tt-a1i/archify/tree/94d6a4d0/experiments/source-question-tour) 已用 authored Explainer/source preview 围绕真实代码回答一个边界问题。继续写导览无需自动 repo map。它没有宣称自动发现符号关系，本轮也不把这个当缺陷。
- [dependency-map](https://github.com/tt-a1i/archify/tree/2be2ab55/experiments/dependency-map) 表达 dependency-cruiser 文件依赖与未解析/视图外账目；文件 import 不是函数 call-site，不能靠改标签扩展语义。
- [#998 Code Analysis](https://github.com/tt-a1i/archify/pull/998)，本次核查 head `d013f79af0dfbe4df493d606ffec0c940d7edb99`：[raw-facts schema](https://github.com/tt-a1i/archify/blob/d013f79af0dfbe4df493d606ffec0c940d7edb99/archify/modules/code-analysis/schemas/raw-facts.schema.json) 已有 repository root/revision/baseRevision/sourceKind/snapshotId/language/adapter；`calls` 明确 **Reserved for M2 (Call Graph)**，不能说已实现逐调用点导航。`symbols` 是 Python module-scope bindings，不是跨语言完整 symbol index。
- 同 head [module-graph schema](https://github.com/tt-a1i/archify/blob/d013f79af0dfbe4df493d606ffec0c940d7edb99/archify/modules/code-analysis/schemas/module-graph.schema.json) 的 edge 已有 `from/to/weight/kinds/evidence`，evidence 含 file/line/to 及条件标记且最多5条。因此“给依赖边附源码行”并非新机会，也不能用其截断列表宣称全部调用点。
- [#1015](https://github.com/tt-a1i/archify/pull/1015) 已覆盖 SourceCard focus/展开/复制、交互细节；不重复提出 focus/peek、源码抽屉或新的导航栈。
- [#1096](https://github.com/tt-a1i/archify/pull/1096) 正讨论 extractor logic revision 与比较口径。不能把 backend 变动当业务代码关系变化，也不另建平行 provenance 子系统。以上 PR 状态是本次查询快照，不能当作已合入 base `82c7e0f0`。

## 最多两个可取点与验证切口

**1. 可考虑：同一条关系的“两个调用点 + 一个同名非调用”阅读样例。** 用户问题是“这两个位置都在调用该函数吗？这条图边为什么只画一次？”先选固定 revision 中一个作者能逐行确认的很小真实边界，使用现有原生图与紧邻 SourceCard/表格，列出每处 occurrence 的原文件行、原始 token、种类（call/reference/definition）、确认方式；若使用某 producer 的结论，原样保留 approximate/unresolved。同名字符串或变量引用作为负例，不能画成 call。使用 authored 内容和固定 source excerpt，**不实现 parser、通用 importer、edge 点击协议或新 schema**。若 source-question-tour 的现有写法已经让读者一次看清，不继续增加结构。

最小验收：源码片段与固定文件逐字一致；两个 occurrence 均能被读者找到，图聚合不丢其来源；非调用项未被图暗示为调用；没有把静态关系称运行成功。通过同一问题的普通导览与证据版截图比较，记录具体少了哪次查找；若只有装饰差别或仍要靠全文搜索，结论为不值得。尚未选择并实测真实源码，所以此处不是已证实的功能改善，也不是实施指令。

**2. 只推荐作为已有输出的审阅要求：producer 与位置口径就地说明。** 如果未来消费冻结 call-site 报告，至少随内容保留 source revision/hash（生产者提供时）、producer/backend、坐标原点/编码、重复调用是否合并、未解析/截断范围。没有的字段写 unknown，不补造；空结果不等于零引用。优先复用 #998 的 snapshot/adapter 和 #1096 的比较工作，而不是为本轮增加 metadata 系统。SCIP/ctags 的版本字段与 repograph build key 是启发，不能拼成一个未验证的新合同。

## 本轮证据与限制

核查方法是 GitHub 一手 commit、许可、README、序列化/解析源码与 Archify 当前 PR schema；未执行上游程序，故表中“输出”指已读源码/协议定义，而非本次实跑 receipt。没有源码复制，没有新增第三方运行依赖，没有截图或性能数据。只新增本报告；不修改研究中心 README、其他 scout、产品、lockfile 或远端状态。纯研究文档按 CONTRIBUTING 的 prose 影响选择检查来源与链接，不运行 renderer/fullsuite。
