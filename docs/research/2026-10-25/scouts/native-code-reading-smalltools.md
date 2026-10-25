# Rust / Go 小型代码阅读与构建解释工具

调研日期：2026-10-25。Codex 只读研究；未安装或执行候选工具，未编译 Rust/Go 项目，未生成 Archify 新产物。以下源码样例是上游已提交的测试预期或 README 示例，不是本次实际运行。截图验收是后续实验要求，尚未执行。

结论：最值得保留的是 Twiggy 的 **shallow / retained bytes 与直接支配树**：回答“一个很小的项目为何关联保留这么多字节”，已有通用依赖图和性能时间线不回答这个问题。Goda 的配置限定包集合也有用，但单做 GraphML 转图不值得新增适配器；只有配置证据齐全、能回答某个具体平台差异问题时再考虑。此批不依据宣传立即增加实验。

## 去重与检索方法

先读取本目录已有 22 份 scout 和主索引的 22 个实验，再沿官方 README 的 related links、仓库迁移地址和源码目录查找。发现路径包括 cargo-modules → cargo-arc 的相关项目、Go 包图 → goda/go-callvis/godepgraph，以及代码体积 → cargo-bloat/cargo-llvm-lines/Twiggy。未按 stars 排序；非 archived 也不代表仍有人提供支持。

本批 13 个唯一项目未作为前述 scout 的主要调查对象重复纳入。`ofabry/go-callvis` 重定向到 `ondrajz/go-callvis`，只计一项；`rustwasm/twiggy` 当前返回 `AlexEne/twiggy`，固定来源采用后者。下面 SHA 是本次 API 读取的 revision，日期不是维护活跃度评分。

## 广泛筛选：固定来源与处置

每行链接固定到该 SHA 的官方 README；许可来自仓库声明/许可文件，存在差异时注明。这里记录能力边界，不代表测试了工具。

| 项目 / 固定官方来源 | 许可 | 可核对的实际入口或输出 | Archify 处置 |
| --- | --- | --- | --- |
| [cargo-modules](https://github.com/regexident/cargo-modules/blob/48455ca5961ccfc3196b5d6bd5dd3efec97374c0/README.md) `48455ca5961ccfc3196b5d6bd5dd3efec97374c0` | MPL-2.0 | Rust 模块层级、可见性与 uses 关系；DOT、focus、features/cfg 选择 | 模块/导入图与已有 dependency map、repository index 重叠；不新增 Rust 分析器 |
| [cargo-depgraph](https://github.com/jplatte/cargo-depgraph/blob/ec94991baba7fb9ad6898e8b27c07edcd698f95e/README.md) `ec94991baba7fb9ad6898e8b27c07edcd698f95e` | 本次未核实当前迁移源许可 | GitHub 已 archived，README 指向 Codeberg；GitHub API license=null | 负面记录，未复制源码/测试数据，不把 API null 说成项目必然无许可 |
| [cargo-llvm-lines](https://github.com/dtolnay/cargo-llvm-lines/blob/d08bcd4d116abfea9e50141d5d68aae6a120e868/README.md) `d08bcd4d116abfea9e50141d5d68aae6a120e868` | MIT OR Apache-2.0（README 双许可，API 只显示 Apache） | IR Lines、Copies、Function 表；单态化副本与 IR 大小 | 不是编译耗时或运行热点；额外编译与解析维护成本暂不值得 |
| [cargo-bloat](https://github.com/RazrFalcon/cargo-bloat/blob/69ccabda2b1671c4fd675e9a660af29ee985506f/README.md) `69ccabda2b1671c4fd675e9a660af29ee985506f` | MIT | 二进制函数/crate 大小表，声明 `--message-format table/json` | 可作体积阅读来源；本轮不再深挖第二套体积合同 |
| [Twiggy](https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/README.md) `a624909e389fcb12d6b3b66f1b789b986c681786` | Apache-2.0 / MIT（包 Cargo.toml）；已 archived | Wasm 代码体积、dominators、JSON/CSV | 深入机制 A；仅已有离线报告候选，不引入运行/安装链 |
| [goda](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/README.md) `efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4` | MIT | Go 包集合表达式、平台/tag/test 上下文、reach 查询，GraphML 等图输出 | 深入机制 B；有条件保留，不为格式新增 adapter |
| [go-callvis](https://github.com/ondrajz/go-callvis/blob/67a26605e208542065d44b34a28948dde3af8d1c/README.md) `67a26605e208542065d44b34a28948dde3af8d1c` | MIT | SSA/指针分析静态调用图；goroutine/defer/dynamic 调用样式，DOT | 不能把静态可能调用当观测时序；未核实稳定 JSON 合同，暂不适配 |
| [godepgraph](https://github.com/kisielk/godepgraph/blob/7a3cd9aa776736b0356ddd90b70ac6f64139c8ae/README.md) `7a3cd9aa776736b0356ddd90b70ac6f64139c8ae` | MIT | 包 import 图，DOT/Mermaid、忽略标准库/指定包 | 更换语言的依赖图，增量价值低 |
| [depscheck](https://github.com/divan/depscheck/blob/d54c5bee1b1181c8ab963144bd9b15199d8be8a9/README.md) `d54c5bee1b1181c8ab963144bd9b15199d8be8a9` | MIT | 外部符号、LOC、累计 LOC、调用计数等文本摘要 | README 的 Depth 是依赖个数，不能画成真实栈深度；不引入新指标推断 |
| [cargo-udeps](https://github.com/est31/cargo-udeps/blob/354ce235b6a527cdb72cf6aefb1fcb4b5dbad07c/README.md) `354ce235b6a527cdb72cf6aefb1fcb4b5dbad07c` | MIT OR Apache-2.0（Cargo.toml，API 为 NOASSERTION） | 编译辅助的 unused dependencies 检查，需要相应 nightly/toolchain | 不是安全删除证明；本轮不执行，不新增工具链依赖 |
| [cargo-machete](https://github.com/bnjbvr/cargo-machete/blob/fb7ff0f4aa2a60cf75ab656d27f67d47d719b830/README.md) `fb7ff0f4aa2a60cf75ab656d27f67d47d719b830` | MIT | `--json` 报告 `crates[].package_name/manifest_path/unused/ignored_used`；无发现为 `{}` | 源码启发式，不把空报告当全配置无需依赖；简单 findings 表已足够 |
| [cargo-arc](https://github.com/seflue/cargo-arc/blob/a94067c5b078f1041aea07704f8056be5b11cb4b/README.md) `a94067c5b078f1041aea07704f8056be5b11cb4b` | Apache-2.0 | Rust 模块图、架构规则；官方明确 cfg 未求值，为所有配置的并集 | 互斥 cfg 可产生单个构建不存在的环；不能称构建实况；规则图与已有架构约束调研重叠 |
| [reftools](https://github.com/davidrjenni/reftools/blob/34b10582faa4220d684a595b3e1237f244707e23/Readme.md) `34b10582faa4220d684a595b3e1237f244707e23` | BSD-2-Clause | Go 重构工具集合，面向源码变换 | 本批只读解释任务不需要重构执行能力，停止深入 |

## 机制 A：Twiggy 的“自身大小”和“保留大小”

### 一手合同

[概念定义](https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/guide/src/concepts/dominators-and-retained-size.md)：从模型根到 B 的每条路径均经过 A，才称 A 支配 B。直接支配关系构成树；retained size 递归包括该项自身 shallow size 和被它直接支配的子树。这是已分析二进制的图模型，不能等同函数调用树、源码目录树、实际删除安全性或重编译后减少的文件字节。

[构造分析](https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/analyze/analyses/dominators/mod.rs) 先计算 dominator tree/retained sizes，再选所有根或指定 name/regex；[JSON emitter](https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/analyze/analyses/dominators/emit.rs) 给出真实字段：

| 字段 | 含义与不能补造的内容 |
| --- | --- |
| `items[]` | 被选根列表；不保证是全二进制完整视图 |
| `name` | 显示名；JSON 不含稳定 item ID，不能按 name 去重或合并 |
| `shallow_size`, `shallow_size_percent` | 本项字节与其占全体分析项总大小 `items.size()` 的比例 |
| `retained_size`, `retained_size_percent` | 支配子树保留字节与其占同一 `items.size()` 的比例；跨层不可直接相加 |
| `children[]` | 直接支配子项；缺失不能推断“没有调用者” |
| 可选 `summary[]` | unreachable 汇总项只有 name 与 retained 两字段；不是 shallow=0 的源码函数 |

JSON emitter 的递归没有读取 `max_rows` / `max_depth`（文本 emitter 有检查），上游分析构造也未按这两个选项裁剪树。若未来消费 JSON，应在 reader 自己设置节点数、深度和字节数限额；不能以文本 CLI 限制当 JSON 安全边界。CSV 另有 ID 字段，本轮不把它和 JSON 合成未经声明的新身份合同。

### 可复核例子

官方[已提交的 subtree JSON golden](https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/twiggy/tests/all/expectations/dominators_wee_alloc_subtree_json) 包含如下两项（仅摘字段，不是本次运行）：

```json
{"items":[{"name":"hello","shallow_size":165,"retained_size":169,
"retained_size_percent":5.999290024849131,"children":[
{"name":"type[5]: () -> i32","shallow_size":4,"retained_size":4}]}]}
```

这回答“hello 自身 165B，为什么保留 169B”：子项占 4B，165+4=169。不能把 retained 父169与子4再求和成173；所选 subtree 的 retained 百分比仍约6%，分母是全体分析项的 `items.size()`，不能改成100%后冒充上游比例；此处未独立核实该总量与原始磁盘文件长度完全相同。

### 最小离线实验候选

输入只接受固定形状的已有 dominators JSON，加显式 sidecar 记录报告 SHA256、工具 revision、输入二进制 digest（缺失就未知）、原始选择参数和数据来源分类。无需读取二进制、源码文件、URL，也不执行 Twiggy。报告 JSON occurrence pointer + 报告 digest 可以成为本报告内的展示身份；它不承诺跨构建符号稳定。

输出用原生 Tree 表达直接支配关系，节点同时显示 shallow/retained bytes；Explainer 首屏解释165→169和百分比分母，并以小表保留原字段。unreachable 摘要独立放表，不加虚构父边。若出现多根重复子树，不跨根求总数；只保留选择视图，不发明全局统计。原始安全投影文件供核验，不铺巨型 JSON 卡片。

真正新增价值是防止把大小排序误读为“函数自身占用”或把 retained 跨层相加；不复制 Wasm parser、支配算法、treemap renderer。上游 archived 增加兼容维护风险，因此只固定一个离线格式，版本未知就拒绝或注明 unsupported，不能承诺持续跟随。

后续验收应包含：重复显示名不合并；165+4保留169；百分比不重算；summary缺shallow不补零；多根不可加；未知字段/负数/超深输入明确拒绝；恶意名称作为字面数据；fresh输出目录。真实 public render/finalize 后，截图须同时看见165/169/4、关系语义与“非调用/非删减实测”说明；目前均未执行。

## 机制 B：Goda 的配置限定包集合，而不是“所有配置的图”

### 一手合同

[官方 README](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/README.md) 支持平台、测试与 tag 上下文和集合差，例如以下**待复核命令示例，不是本次执行记录**：

```sh
goda list "goos=windows(github.com/loov/goda/...:all) - goos=linux(github.com/loov/goda/...:all)"
goda graph -std "reach(github.com/loov/goda/...:all, flag)"
```

[Context.Config](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/internal/pkgset/context.go) 确实把环境和 tags 传给 `packages.Config`，并设置 Tests；[求值器](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/internal/pkgset/calc.go) 初始继承进程环境。因此显式 GOOS 并不表示所有其余环境均已固定，必须记录 GOARCH/CGO/Go版本/工作目录与未提供的值。README 明说语法尚未最终固定，不能当稳定公共协议。

[图命令](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/internal/graph/cmd.go) 支持 dot/graphml/mermaid/digraph/edges/tgf，没有原生 JSON 图合同；默认不含标准库，`-std` 才保留。集合先计算再移除标准包，视图缺项不能反推项目未依赖它。

[GraphML emitter](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/internal/graph/graphml.go) 的真实结构是 node `id`、`data key=label`、可选 `data key=module`，edge `source`/`target`。边由 importer 的 `ImportsNodes` 发出，因此方向是“导入方→被导入方”。yfiles 图形数据只用于外观，不能变成新语义。默认 emitter **没有独立 provenance 字段**携带完整 query、GOOS/GOARCH、tag、Tests、过滤标准库状态或源 revision；不能靠解析默认图把它们恢复出来。自定义 label template 可能写入上下文文字，但不构成这些字段的结构化合同。

### 可复核例子与条件式切口

官方[GraphML golden](https://github.com/loov/goda/blob/efb7643e6dc71bf3dca8d9e8028d3dd4e77addb4/internal/graph/testdata/graphml.golden) 有8个 node、9条 edge。例如 `alpha.test/cmd/client → alpha.test/rpc`，`alpha.test/service → alpha.test/database`，节点 module 为 `alpha.test`。这是官方测试预期，不是这次平台差异实测，也不能用它证明 Windows 与 Linux 有差异。

只有先拿到两份合法已有报告及各自完整采集声明，才可能做“为什么这个包只出现在所提供的 Windows 选择集合”：页面并列给出表达式与环境声明、原始 membership、显式选中包的导入证据，未知配置醒目标注。membership 差异本身不解释 build tag 原因；没有源码/上游 witness 就不能补造“因为某文件的标签”。不执行 Go loader，不重新实现集合表达式/路径分析，不声称全配置架构。

若做小实验，仅消费限定 Goda GraphML 子集和 sidecar，禁止 DTD/外部实体/网络引用，限制节点与字符串长度；不做通用 GraphML 导入器。原生 Architecture 只显示提供的 importer→imported，Explainer 将平台/过滤条件放在图上方；颜色不能暗示运行平台已被验证。两个报告的 ID 碰撞、重复边和缺节点应有明确定义。

后续截图必须同时看清“两份选择集合”的范围、同一包是否出现和一条实际提供的导入边，原始环境声明与未验证边界同屏可读。若没有真正不同且有来源的输入，就只保留研究/recipe，不造平台差异 fixture 来宣称实际用户价值。

## 与现有实验和 Archify 工作的差异

核对依据是[本批主索引](../README.md)已列出的22实验；下面比较的是问题和合同，不把不同语言当新增价值。

| 既有工作 | 本批必须保持的差异或停止理由 |
| --- | --- |
| Dependency map；架构约束、符号与局部路径等 scouts | Goda 单图转换仍是提供的依赖图，重复；只有显式配置/选择证据可能增加解释价值。go-callvis/modules/arc 不因此各加 adapter |
| Trace waterfall、profile-reading | Twiggy 是静态二进制字节与支配，不是 X 区间、CPU样本、runtime对象内存、关键路径或性能改进证明 |
| Markdown outline / Source question tour | 原生 Tree 布局可复用；Twiggy 树边是直接支配，不能借目录层级语义；也不做源码阅读器 |
| Change coupling / Test context / Test failure | 不把图上的引用当历史共变、测试覆盖、测试结果；本批没有执行上游测试工具 |
| CI conditions / Recipe stages / Plan actions | Goda 配置属于提供的静态分析上下文，不是全局执行顺序/执行结果；本轮未找到值得另立实验的真实构建阶段输出 |
| Snapshot/Delta/Relation/Delivery witness 等其余实验 | 不扩 diff 合同、共享 Viewer 状态或事件时序；报告局部身份不能冒充稳定跨版本符号身份 |

2026-10-25 重新通过 GitHub API 核实：[PR #540](https://github.com/tt-a1i/archify/pull/540)（inspect-repo inventory / Level2 import graph / Level3 evidence pack）closed、merged=false；[PR #998](https://github.com/tt-a1i/archify/pull/998) Code analysis 仍 open；[issue #1044](https://github.com/tt-a1i/archify/issues/1044) Git refs Architecture snapshot comparison 仍 open。#540虽未合入，已说明不要重建仓库扫描/导入分析平台；#998处于重叠方向，不将本轮演化成Rust/Go代码分析产品；#1044已有snapshot差异目标，不因Goda两份报告重做diff框架。另搜索 Rust/cargo/Go/call graph/binary size 等关键词，未找到Twiggy专门入口；关键词检索缺项不是“绝无重叠”的证明。

## 推荐顺序与当前证据

1. **保留候选：Twiggy retained-size解释页**。先用固定上游golden做语义核验，再决定是否值得实现；若公开复制golden，附MIT/Apache许可与归属。真正运行采集另立来源说明，不能把已有golden称本次生成。
2. **暂缓：Goda 配置限定证据页**。先取得完整声明的实际配置报告，确认现有dependency-map无法直接表达的阅读问题；不要先写GraphML适配器等场景。
3. 其余11项维持筛选记录；无许可/迁移未核实的来源不进入实现。此轮没有新增产品能力或收益证明。

本文件由Codex调研编写，附只读来源复核；未运行候选二进制、未创建新分支实验、未执行render/browser。仅文档 whitespace与来源/样例静态核对适用，不为研究笔记重跑全仓测试。
