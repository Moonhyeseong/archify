# 构建与基础设施小工具：条件、依赖类型和省略部分

调查日期：2026-10-25。只读官方仓库元数据、固定提交的 README/源码和 Archify issue/PR；没有执行 workflow、Make、Just、Ninja、Task、Terraform、容器或云调用，没有安装任何工具。本报告中的实验和截图均尚未实施。

本轮核对了 hub 当时已有8份 scout 文档的 GitHub repository 列表。下列15个仓库均未出现；其中14个核实了开源许可证，另1个仅是公开源码观察项，**不能作为许可证已明确的开源集成候选**。不重复统计已有 Bazel/trace、dependency-cruiser import map、Code Maat、FSM、DB schema 或迁移 DDL 方向。

## 最强建议

1. **GitHub Actions 条件与未知项阅读页**：显示 needs 的依赖、原始 if、隐式 success 门槛、未知矩阵/outputs/reusable workflow 的覆盖；重点解释“为什么单看 DAG 不能知道会不会运行”。不实现第二个表达式执行器或模拟 runner。
2. **既有 Terraform plan 的替换顺序与 unknown 解释页**：保留 `delete,create` 与 `create,delete` 的顺序差别，分开 unknown/null/redacted/deferred/complete。首版不推断 blast radius、不恢复 provider topology、不运行 Terraform。
3. **Just JSON 的 recipe 前/后依赖说明页**：`priors` 将依赖切成 before-body 与 after-body，不能像 imports 一样画成无差别 DAG。用原生 Workflow 解释 recipe 的三个阶段，明示导出中没有覆盖的内容。

Ninja/Make 是重要反例：现有图导出可能已经丢失 implicit、order-only、验证或递归 make 的语义。纯 DOT → 更漂亮的 DOT 转换不够有价值；不要再做一个与 dependency-map 相同的邻接表换皮。

## 查重与现有合同

已按 `CONTRIBUTING.md` 和 `.agents/skills/archify-review/SKILL.md` 的价值/成本/影响框架判断。当前研究 checkout 的先前记录基线为 `82c7e0f089a02a4d514714adf37dc2061682da5f`；这里没有声称远程分支已与该基线同步。

- [#251：repository-grounded workflow gates and recovery](https://github.com/tt-a1i/archify/issues/251) **OPEN**。正文已读：成功门槛却没有失败结果、泛化 retry loop 冒充所有阶段可恢复、布局验证与语义覆盖分开。**直接相关**：本轮只做独立解释 recipe/adapter 的输入范围与遗漏账目，不实现共享 semanticCoverage schema/validator，不把 showcase 通过当条件/控制流完整。
- [#286：preserve critical approval details](https://github.com/tt-a1i/archify/pull/286) **OPEN**，head `e182af0df49b4c848397fda5522fde8d3db80192`。是 approval initiator/approvers/deliverables/rework 合同与 Passport 展示，并非 CI job if 语义。不要占用其 approval 字段来存 CI 条件。
- [#663：community package registry](https://github.com/tt-a1i/archify/issues/663) **OPEN**。正文已读，明确把 Terraform state → architecture 作为 standalone wrapper 的例子，不是已实现 Terraform adapter，也不授权引入 in-process plugin API。
- [#998 code analysis](https://github.com/tt-a1i/archify/pull/998)、[#1075 Java](https://github.com/tt-a1i/archify/pull/1075)、[#573 repository explanation](https://github.com/tt-a1i/archify/pull/573) 是源码分析/仓库图方向，本轮不复制其抽取或 overlay。
- [#1044](https://github.com/tt-a1i/archify/issues/1044)/[#1049](https://github.com/tt-a1i/archify/pull/1049) 是读取已提交 Architecture snapshots 的 Git-ref 比较，本轮不做快照/rename/版本比较器。
- [#92](https://github.com/tt-a1i/archify/issues/92)/[#140](https://github.com/tt-a1i/archify/pull/140) 是 Mermaid flowchart importer，本轮不顺手写通用 DOT/Mermaid importer。
- [#816](https://github.com/tt-a1i/archify/issues/816)/[#795](https://github.com/tt-a1i/archify/pull/795) 的 unavailable 与0项区分适用于所有候选；[#730 Tracks](https://github.com/tt-a1i/archify/pull/730) 与既有 trace 实验不作为本轮构建耗时图重做。

搜索使用 GitHub 官方 API `search/issues`，查询覆盖正文、issue 与 PR：`terraform` 共3项，标题 `terraform` 0项；`Taskfile`/`Ninja`/`justfile`/`gha-graph` 各0项；`Makefile` 2项，均是 Viewer 相关；`actionlint` 12项主要是项目自身 CI；`workflow importer` 指向 #92/#140。广义 `GitHub Actions` 82项、`workflow needs` 118项，第一页并未穷尽；不能把关键词没命中说成没有任何重叠。这里特别阅读了确实相关的 #251、#286、#663。实现前应刷新具体候选和上述事项。

## 来源发现路线

不是只从大框架排行榜找名字：`gha-graph` README 明确定位为 actionlint 的补充，故追到 actionlint 的报告与官方 actions parser；`makefile2graph` README 的 **See also** 指向同作者 `j4make`，再核查其结构化 XML；InfraMap README 直接对比 `terraform graph`、展示 `--raw`/`--connections=false`，故查 provider 过滤与 graph.Clean；Terraform Visual/Rover 的输入都指向 plan JSON，再追到官方 `terraform-json` 数据类型和它明确写出的 round-trip 限制。只把官方 related/作者链接作为发现线索，事实仍以固定源码为准。

## 15个具体仓库与成本判断

所有 commit 是本次 API 获取的默认分支 HEAD；不是最新稳定版保证。日期为提交日期。除特别注明外均未归档；“未归档”不等于仍有维护承诺。

| 项目、固定 README 与 HEAD | 日期 / 许可证据 | 核实到的能力和最小数据 | 价值、成本与取舍 |
| --- | --- | --- | --- |
| [rhysd/actionlint](https://github.com/rhysd/actionlint/blob/011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7/README.md) `011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7` | 2026-04-19；[MIT / LICENSE.txt](https://github.com/rhysd/actionlint/blob/011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7/LICENSE.txt) | 静态 workflow checker，含 needs、表达式、runner等；[usage](https://github.com/rhysd/actionlint/blob/011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7/docs/usage.md) 的 `-format '{{json .}}'` 可产诊断 JSON，另有 JSONL。 | 可读既有诊断，作为条件解释页的 source diagnostic panel；**不是 job graph export**。不把空诊断数组等同完整 workflow 运行成功；不自动运行其 shellcheck/pyflakes。 |
| [actions/languageservices](https://github.com/actions/languageservices/blob/4043eda158e16579cc5fb1b0b07a4bce2a76f0b5/README.md) `4043eda158e16579cc5fb1b0b07a4bce2a76f0b5` | 2026-08-05；[MIT](https://github.com/actions/languageservices/blob/4043eda158e16579cc5fb1b0b07a4bce2a76f0b5/LICENSE) | 官方分立 npm packages：expressions、workflow-parser、language services；parser→IR→WorkflowTemplate，有错误 context。已读 if-condition converter。 | 用其合同核对默认 success 门槛，比自己猜语法可靠；本轮不引入整套语言服务器、不承诺自己支持所有 GitHub evaluator 行为。官方也说明它只是多实现之一。 |
| [feruzkarimovv/gha-graph](https://github.com/feruzkarimovv/gha-graph/blob/d3f156ec59279f134dff38c333f476e177706f9b/README.md) `d3f156ec59279f134dff38c333f476e177706f9b` | 2026-07-16；[MIT](https://github.com/feruzkarimovv/gha-graph/blob/d3f156ec59279f134dff38c333f476e177706f9b/LICENSE) | 小型静态 CLI，终端/HTML/SVG/Mermaid/JSON/SARIF。JSON有 workflows/diagnostics，graph job含 id/label/needs/matrixJobs。README明确 reusable workflow 未连跨文件图、动态矩阵/表达式未完整求值、literal矩阵计数不完整处理include/exclude。 | 适合消费现成 job DAG；**其输出 graph 没有 if 条件**，不能只导这个JSON就承诺“解释跳过原因”。必须同修订YAML或独立condition sidecar；否则显示条件未知。已有独立HTML，Archify差异必须是解释语义而非换皮。 |
| [bircni/actions-visualizer-extension](https://github.com/bircni/actions-visualizer-extension/blob/98c907642df904fb4e723d965f453a9b0ef23b27/README.md) `98c907642df904fb4e723d965f453a9b0ef23b27` | 2026-10-18；[MIT](https://github.com/bircni/actions-visualizer-extension/blob/98c907642df904fb4e723d965f453a9b0ef23b27/LICENSE) | VS Code/Gitea job图、静态event/ref预览、unknown条件、手动playthrough；model含condition、needs、matrix.isDynamic、outputs与source ranges；矩阵展开上限50且明示。 | 强参考：未运行/unknown/skip分离、切换情景不移走job。**不搬整个扩展或simulation engine**。已读evaluate.ts确认UNKNOWN传播与短路真值；实际与GitHub runner一致程度未复验，README“完整语言”不能直接成为Archify支持声明。 |
| [lindenb/makefile2graph](https://github.com/lindenb/makefile2graph/blob/9628f7a939c7363ce8010a5f887f82262c843ad8/README.md) `9628f7a939c7363ce8010a5f887f82262c843ad8` | 2026-04-20；[MIT](https://github.com/lindenb/makefile2graph/blob/9628f7a939c7363ce8010a5f887f82262c843ad8/LICENSE) | C小工具读取 GNU Make 英文 debug文本，出DOT/GEXF/PlantUML/Mermaid/最深dirty targets；源码匹配 Considering target file、Must remake target。README不支持sub-makefiles。 | 输入应为用户已有debug输出或GEXF，不在本轮执行 `make -Bnd`。dirty是报告事实，依赖箭头在例子是 prerequisite→target，**与 make-graph 相反**。单纯转换图不优先；完整记录递归make遗漏才有价值。 |
| [lindenb/j4make](https://github.com/lindenb/j4make/blob/9884c4f669d4d886345462986f393a6e03aa0455/README.md) `9884c4f669d4d886345462986f393a6e03aa0455` | 2021-04-15；[MIT](https://github.com/lindenb/j4make/blob/9884c4f669d4d886345462986f393a6e03aa0455/LICENSE) | 同作者Java版，提供XML/DOT/GEXF/RDF。XML有target name、prerequisite ref、shell/p，来自已有make debug输出。 | XML容易保留目标名/前置条件；**不搬JVM**，且shell字段不执行、不嵌入可运行脚本。老源码/英文debug格式维护成本高，优先使用冻结文件而非live parser。 |
| [theunrepentantgeek/make-graph](https://github.com/theunrepentantgeek/make-graph/blob/874c989a13fd5b7f2f7d5818f817832c10904c10/README.md) `874c989a13fd5b7f2f7d5818f817832c10904c10` | 2026-04-16；**许可证未核实**：API license为空、根目录无LICENSE，README无许可声明 | Go工具静态读Makefile，DOT/Mermaid；区分实线prerequisite与虚线 `$(MAKE)` recursive call，支持namespace/style/highlight。例子是target→prerequisite方向。 | 仅作公开源码观察项，不复制/分发实现。它提示“调用另一个make”和“文件依赖”不是一种边；不同工具图方向不能从画法猜测。无法核实许可证前不推荐作为实现依赖。 |
| [casey/just](https://github.com/casey/just/blob/d6fee036379c531369dc37f67f8d4640f6bf1e2d/README.md) `d6fee036379c531369dc37f67f8d4640f6bf1e2d` | 2026-10-19；[CC0-1.0](https://github.com/casey/just/blob/d6fee036379c531369dc37f67f8d4640f6bf1e2d/LICENSE) | runner作为格式上游：`--dump --dump-format json`，recipe.dependencies + priors切分before/after；dependency有recipe/arguments/star。源码serde会跳过disabled_recipes/absent_modules。 | **推荐窄JSON解释**，不移植runner、Rust或shell；parameters/star/module resolution需显式未求值。没有出现在dump的disabled recipe不能当作原始justfile不存在。 |
| [ninja-build/ninja](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/README.md) `3ccb2270e8ef5a84bb31c4651c0df84440f30362` | 2026-10-18；[Apache-2.0 / COPYING](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/COPYING) | 很小的build system，官方graphviz.cc已有DOT，manual区分 explicit/implicit/order-only/validation/dyndep；graphviz.cc以rule节点承载多入多出，部分order-only用dotted。 | 保留artifact→rule→artifact比压平成文件依赖更忠实。但DOT并不完备表达所有类型，单入单出优化还会省略rule节点；不要从无dotted推出“普通依赖”。只用已有导出，不跑build/browse。 |
| [go-task/task](https://github.com/go-task/task/blob/ad2782e1709f0bcf8fbbe0d8e00c2d239141e099/README.md) `ad2782e1709f0bcf8fbbe0d8e00c2d239141e099` | 2026-10-13；[MIT](https://github.com/go-task/task/blob/ad2782e1709f0bcf8fbbe0d8e00c2d239141e099/LICENSE) | 格式上游，AST明确分Deps、Cmds、Sources、Generates、Status、Preconditions、If、Run、Platforms；summary会单列deps/commands，secret vars遮蔽。 | 不能把deps与按顺序cmds/task calls压成同一种边；Taskfile包含模板与shell动态变量，full parser/compiler成本高。**不做首版**，仅消费用户冻结的resolved snapshot；未核实通用稳定JSON graph export，不能承诺一条 `--json` 就得到DAG。 |
| [28mm/blast-radius](https://github.com/28mm/blast-radius/blob/a7ec4ef78141ab0d2a688c65112f799adb9622ba/README.md) `a7ec4ef78141ab0d2a688c65112f799adb9622ba` | 2020-01-06；[MIT](https://github.com/28mm/blast-radius/blob/a7ec4ef78141ab0d2a688c65112f799adb9622ba/LICENSE) | Terraform图解释；SVG+JSON layout+D3，Graphviz/PyHCL/Python；有搜索/prune-to-selection/modules。正常入口读initialized Terraform目录，本轮未运行。 | 交互和省略范围可参考，但PyHCL/旧Terraform适配老化成本高；**不引入server或init**。名字blast radius不能当运行时故障影响证明。 |
| [cycloidio/inframap](https://github.com/cycloidio/inframap/blob/f02f224cb0d0d8f369f001405fa646c206614b21/README.md) `f02f224cb0d0d8f369f001405fa646c206614b21` | 2026-04-23；[MIT](https://github.com/cycloidio/inframap/blob/f02f224cb0d0d8f369f001405fa646c206614b21/LICENSE) | tfstate/HCL→provider-specific graph，raw/connection选择；tfstate依赖读dependencies，HCL读interpolation。README说支持provider但不识别relevant nodes时可能空图；源码Graph.Clean会删除孤立节点。 | 强烈提示必须列出“输入多少资源、为何忽略/合并”。但**不复制provider规则或默认清理孤立节点**；空图不证明无基础设施。prune命令宣传不能成为脱敏保证，不自动分享state。 |
| [hieven/terraform-visual](https://github.com/hieven/terraform-visual/blob/3ef0b2074babfc74613b527175209743e3ada0e6/README.md) `3ef0b2074babfc74613b527175209743e3ada0e6` | 2026-08-23；[MIT](https://github.com/hieven/terraform-visual/blob/3ef0b2074babfc74613b527175209743e3ada0e6/LICENSE) | plan JSON→网页/CLI报告。已核对IntermediateGraph有id/label/resource/children；原计划可关联TerraformPlanResourceChange。 | 有成熟plan图，Archify不应只重画。可做“替换顺序、unknown和覆盖说明”这一页；不安装React图工具链、不上传state/plan到在线站点。 |
| [im2nguyen/rover](https://github.com/im2nguyen/rover/blob/6257a19a32c0116eae05c91e3c295d07c54c3a05/README.md) `6257a19a32c0116eae05c91e3c295d07c54c3a05` | 2025-07-30；[MIT](https://github.com/im2nguyen/rover/blob/6257a19a32c0116eae05c91e3c295d07c54c3a05/LICENSE) | 可用provided plan，产rso/map/graph，本地server；graph JSON nodes[].data含id/label/type/parent/change，edges[].data含source/target。代码有attribute reference过滤/地址处理。 | **不把rso/map/graph当原plan的无损副本**。默认会init/plan，不能因`visualizer`名字就运行；已有plan方式也没有被本轮执行。不接其容器/云/网页栈。 |
| [hashicorp/terraform-json](https://github.com/hashicorp/terraform-json/blob/8f4894d138d0fe71436cba6dbc8f16577e9a9e7d/README.md) `8f4894d138d0fe71436cba6dbc8f16577e9a9e7d` | 2026-10-06；[MPL-2.0](https://github.com/hashicorp/terraform-json/blob/8f4894d138d0fe71436cba6dbc8f16577e9a9e7d/LICENSE) | 小型Go数据类型库，de facto show-json格式资料：Plan.resource_changes、Change.actions/after_unknown/*_sensitive/replace_paths、deferred_changes、Complete指针。README明确**会丢未知字段，不适合filter/round-trip**。 | **首选合同资料**，不是复制其decoder：只选稳定字段，在raw audit保留未知字段。它是MPL数据类型库，不能套用Terraform主仓库许可猜测；本轮也不包含Terraform引擎。 |

## 关键源码证据

### 1. DAG本身没有“会执行”的答案

[gha-graph/model.ts](https://github.com/feruzkarimovv/gha-graph/blob/d3f156ec59279f134dff38c333f476e177706f9b/src/model.ts) 的 GraphJob 仅有 `id/label/needs/matrixJobs`；ParsedWorkflow有raw，但公开GhaGraphReport里的workflows是WorkflowGraph[]，不能假定raw仍在报告。因此仅靠此报告不可恢复if。最小有用输入要么保留同修订YAML/源字段，要么接受外部标准化snapshot，同时记录缺少哪些条件事实。

[GitHub官方 if-condition.ts](https://github.com/actions/languageservices/blob/4043eda158e16579cc5fb1b0b07a4bce2a76f0b5/workflow-parser/src/model/converter/if-condition.ts) 明确：没有status function的条件被包成 `success() && (condition)`；空condition默认success()；判断是否含status function使用表达式AST而非子串。pre/post-if又有不同默认值。**不能通过字符串含“always”来决定恢复路径，也不能照抄job语义给所有step/hook**。

[Actions Visualizer/model.ts](https://github.com/bircni/actions-visualizer-extension/blob/98c907642df904fb4e723d965f453a9b0ef23b27/src/workflow/model.ts) 区分matrix.combinations可缺失与isDynamic，job condition与step condition分开；[evaluate.ts](https://github.com/bircni/actions-visualizer-extension/blob/98c907642df904fb4e723d965f453a9b0ef23b27/src/workflow/expression/evaluate.ts) 有 `UNKNOWN`、PartialRecord、true/false/unknown ConditionEvaluation、parse error返回unknown而非false。可以借鉴这个**结果合同**，不急于复制400多行求值器。

### 2. 相同两个节点之间的线不一定代表相同因果

[Ninja manual](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/doc/manual.asciidoc) 的order-only要求先完成，但其内容变化本身不触发目标rebuild；implicit则具有普通触发语义但不加入 `$in`。validation和dyndep还有额外语义。已读 [graphviz.cc](https://github.com/ninja-build/ninja/blob/3ccb2270e8ef5a84bb31c4651c0df84440f30362/src/graphviz.cc)：单入单出时直接画输入→输出，否则单独rule ellipse、多输入→rule→多输出，只有后者input loop检查order-only并画dotted；DOT ID甚至使用内存地址。不能靠它生成稳定语义ID或完整依赖分类。

[Just recipe.rs](https://github.com/casey/just/blob/d6fee036379c531369dc37f67f8d4640f6bf1e2d/src/recipe.rs) 的 `dependencies[..priors]` 与 `dependencies[priors..]` 分别是priors/subsequents，显示语法在分界输出 `&&`；[dependency.rs](https://github.com/casey/just/blob/d6fee036379c531369dc37f67f8d4640f6bf1e2d/src/dependency.rs) 序列化 `arguments/recipe/star`；[justfile.rs](https://github.com/casey/just/blob/d6fee036379c531369dc37f67f8d4640f6bf1e2d/src/justfile.rs) 导出recipes/modules/aliases/settings，但disabled_recipes、absent_modules带serde(skip)。对dump的覆盖声明必须比“全justfile”更窄。

### 3. Plan中的“没有值”有多种含义

[terraform-json/plan.go](https://github.com/hashicorp/terraform-json/blob/8f4894d138d0fe71436cba6dbc8f16577e9a9e7d/plan.go) 的 after_unknown 是结构化mask；before_sensitive/after_sensitive是防止UI泄露值所需的mask；replace_paths是导致replacement的属性路径；Complete是 `*bool`，旧计划可能根本没有此字段。deferred_changes也不在普通resource_changes计数里。

[action.go](https://github.com/hashicorp/terraform-json/blob/8f4894d138d0fe71436cba6dbc8f16577e9a9e7d/action.go) 明确单个Action不足以描述完整操作；`[delete,create]`和`[create,delete]`都可叫replace，但顺序不同。**这比只给资源染一个“changed”颜色更有用**。

[InfraMap graph.go](https://github.com/cycloidio/inframap/blob/f02f224cb0d0d8f369f001405fa646c206614b21/graph/graph.go) 存在Clean删除无边节点、Replace替换节点并重新连接、InvertEdge调整方向。转换其最终图后不能声称恢复了原tfstate资源和依赖；必须把coverage标为外部工具处理后的视图。

## 可证伪实验 A：一张CI图解释三个“不运行”的不同理由

**最小真实输入**：固定 [gha-graph realistic-release YAML](https://github.com/feruzkarimovv/gha-graph/blob/d3f156ec59279f134dff38c333f476e177706f9b/examples/realistic-release/.github/workflows/release.yml)。源码有quality的literal Node矩阵 `[20,22,24]`，package needs quality，publish needs package，并有 `github.event_name == 'push' && github.ref == 'refs/heads/main'`。只读此文件，不执行其中npm命令、不触发CI。

**第一刀**：只生成“声明事实解释”，不求值用户表达式：

```json
{
  "kind": "workflow-reading-snapshot",
  "source": { "commit": "d3f156ec59279f134dff38c333f476e177706f9b", "path": "examples/realistic-release/.github/workflows/release.yml" },
  "jobs": [
    { "id": "quality", "needs": [], "matrix": { "literalAxes": { "node": [20,22,24] }, "coverage": "literal-only" } },
    { "id": "package", "needs": ["quality"], "conditionSource": null },
    { "id": "publish", "needs": ["package"], "conditionSource": "github.event_name == 'push' && github.ref == 'refs/heads/main'", "assessment": "not-evaluated" }
  ],
  "coverage": { "execution": "not-run", "stepConditions": "not-inspected", "reusableWorkflows": "not-inspected" }
}
```

这段是**提案自定义最小格式**，不是任何上游工具承诺的export schema。源字段必须逐项回查；conditionSource缺失并不自动代表unconditional。原生Workflow显示needs；Explainer另列source-if、implicit success门槛、declared矩阵、未检查范围。若有情景结论，首版由外部求值器提供并记录其版本/输入，Archify只展示；没有外部结论则明确not-evaluated。不要自创runner-compatible评价器。

**证伪点**：把publish条件从push改为pull_request，改变的是条件说明而非拓扑；缺少源YAML时不能从gha-graph JSON补造if；动态matrix必须从“3组合”变成unknown而非0；invalid/missing needs/循环保留诊断，不能画一张“成功DAG”；缺workflow文件必须fail或明确unavailable。

**与既有实验的差异**：dependency-map保存imports，A解释job scheduling门槛与覆盖；trace实验显示真实发生过的时间，A只显示声明。不能将其not-evaluated当作某次run的skipped状态。

**截图**：1440×1000，同一浅色/同一preset；三job主图、publish原始if和“未运行/未求值”至少同屏。第二张展示unknown动态矩阵或缺少raw条件的变体，明确“未知”仍留在图中。深色检查unknown/declared区别。移动端一张确认condition文本可读。截图只证明阅读产物，不证明GitHub实际调度结果。

**成本**：低到中（静态reader+来源/coverage）；若发展成表达式解释器、matrix include/exclude展开、跨文件reusable解析和runner模拟，变成高成本，暂不做。#251共享语义覆盖合同留在既有讨论。

## 可证伪实验 B：Terraform replacement 不是一个changed色块

**输入**：用户已有脱敏plan JSON或官方terraform-json testdata；不运行show/plan/init。先原创6资源synthetic fixture，明确标synthetic：create、update、delete/create、create/delete、no-op、deferred各一项；其中unknown字符串、null、sensitive true mask和complete=false都有。真实fixture可从 [官方 config_resource_depends_on/plan.json](https://github.com/hashicorp/terraform-json/blob/8f4894d138d0fe71436cba6dbc8f16577e9a9e7d/testdata/config_resource_depends_on/plan.json) 只读检查后选取；本轮未导出或执行它。

**最小字段子集**：`format_version`、`resource_changes[].address/type/change.actions/after_unknown/before_sensitive/after_sensitive/replace_paths`、`deferred_changes`、`complete`。**不需要before/after值**也能做第一张解释页：只呈属性路径与mask类别，避免为了图把secret值嵌进raw receipt。确需保留raw输入时应另存本地受控文件，公开artifact只保留hash和经过review的安全投影；未知字段保留在审计计数/路径而不是无声忽略。

**原生输出**：Explainer结论“两个replacement的顺序不同；1项deferred；本次plan不是complete”；Workflow小图分两行 `delete → create`、`create → delete`，标签明确“该资源操作顺序，不是全局apply时间线”。其余资源用表格；不要伪造两资源间的跨资源调度。取一个资源展开unknown/redacted/null属性路径说明。资源address为稳定身份，不用UI的短label合并不同module/count实例。

**证伪点**：调换actions数组顺序必须改变可读顺序；after_unknown true与after=null显示不同；sensitive true的值不能出现在HTML/receipt；complete缺失显示not-provided而非true；deferred必须独立计数；未知action/format不推断“安全更新”；省略no-op资源必须记录数与理由。fromJSON丢新字段的adapter应在未知字段fixture暴露丢失，不能用terraform-json round-trip伪装完整保留。

**截图**：1440×1000浅色首屏同时显示两种replacement、complete/deferred状态；另一张属性路径说明，示例值不入图。深色核查unknown/redacted的区分。没有resource references证据时，不画“blast radius”；画图不等于计划有效或部署安全。

**成本**：低到中，只读选定字段。provider-specific关系、resource address语法覆盖、for_each实例推断、各种Terraform/OpenTofu版本全支持则高成本。与既有Postgres迁移DDL页区别在计划mask/动作组合/partial/deferred语义，不复用成“有序SQL执行器”。

## 可证伪实验 C：Just recipe 的before/body/after

**输入**：已有固定版本 `--dump --dump-format json`。消费`recipes`里name/dependencies/priors、dependency.recipe/arguments/star及必要module上下文。只为首版已核实的JSON形状建立严格子集，未知序列化形状拒绝；不执行Just、不求值backtick、env、shell/函数表达式。

**最小synthetic投影**：

```json
{
  "recipe": "release",
  "dependencies": [
    { "recipe": "lint", "arguments": [], "star": null },
    { "recipe": "package", "arguments": [], "star": null },
    { "recipe": "notify", "arguments": [], "star": null }
  ],
  "priors": 2,
  "body": "not executed / not expanded"
}
```

这也是**说明用投影**，不是完整Justfile dump。前两项是priors，最后一项是subsequent。原生Workflow把“前依赖满足→release body→后依赖”表达清楚；**不把前两项随意串成lint→package**，因为列表顺序本身不足以证明它们之间存在该依赖。遇到无法在原生图可靠表达的并发/调用参数关系，先列为分组卡片/receipt，别补一根虚构线。

**证伪点**：把priors从2改成1，package必须由before移到after，而不是输出完全一样的DAG；priors越界拒绝；有star/动态参数时显示未展开；相同short recipe name在不同module不合并；dump没有disabled_recipes时覆盖栏不能宣称检查全部recipe；不存在依赖/环报诊断，不靠“DAG”命名硬删边。

**截图**：1440×1000浅色显示before/body/after三段及底部“未执行/未展开”范围；第二张只改priors的对照，读者应能直接指出变化。保留整个原始dependency投影和SHA摘要供核查。成本低到中，价值在区分不同阶段；全量Just AST、module resolver、函数求值都不引入。

## 暂不做的方向与不确定性

- 不从Makefile源重写GNU Make语义；`make -n`不是这里的研究授权，不执行任何构建/解析配置命令。优先已有export/debug记录；recursive make、locale、pattern/implicit规则都需要coverage账目。
- 不仅根据Ninja DOT断言所有dependency类型；源码明确表明有有损简化。若用户能提供额外query/manifest投影，才评估order-only解释页，否则保留为研究反例。
- 不做基础设施发现、云资源拉取、state pull、自动Terraform init/plan，不运行Rover默认入口。所有input来源为已有公开/用户提供文件。
- 不将InfraMap prune当作充分脱敏，provider过滤后的空图不叫作资源为0；不从图中“下游可达”推断生产故障影响或安全批准。
- 不复制make-graph实现：公开可读不等于已核实可复用许可。其余项目也仅做事实调查；本轮没有复制源码或产fixture。
- 新字段/格式主版本、mask类型、matrix/reusable coverage不明时应停在unknown或明确refuse，不能为了出图填0/false。

已完成：15仓库身份核实（14明确许可证+1许可未知观察项）、官方README与针对性源码、hub排重、Archify当前相关事项查重、3个可证伪最小实验及截图方案。未完成：真实工具export运行、adapter、原生JSON/HTML/图片、测试、视觉或用户价值验证。只新增本文件，没有远程评论/消息/push。
