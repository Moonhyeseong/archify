# 代码地图与仓库理解：10 个开源项目的一手调查

核实日期：2026-10-25。Archify 本地研究基线：`82c7e0f089a02a4d514714adf37dc2061682da5f`。本报告只读取官方仓库 README、选定源码、许可证标识和 GitHub issue/PR；没有安装或运行这些项目，没有生成图片。下文实验是可实施方案，不能作为已完成验收。范围不包含复制整个 IDE、索引服务器或新代码分析平台。

## 结论

最值得做两个独立最小实验：**dependency-cruiser JSON → 可携带的 Archify 原生局部依赖图与未解析清单**；**Code Maat coupling CSV → 共变更证据 Explainer**。前者复用现有成熟分析产物，后者补足单个源码快照无法提供的历史关系。不要在本轮另写 TS/Python/Java 分析器、循环检查器、边界规则引擎、Git-ref snapshot wrapper 或通用代码地图服务器。

第三个候选是 **Grimp/import-linter 最短违规导入链 → 3–8 节点证据页**。它适合已有 Grimp 用户，但与 #998 的 boundary findings 明显重叠；只在已有外部报告需求下做数据导入，不应单独引入 Python/Rust 环境。代码地图的「全库毛线球」不是默认交付目标。

## 先查重：当前 Archify 已有与在做的工作

已阅读 `CONTRIBUTING.md` 与 `.agents/skills/archify-review/SKILL.md`，按价值、成本、影响判断。本次仅记录建议，不发表范围评论、不发 PR。

| 当前工作 | 2026-10-25 核实状态、版本与范围 | 本轮边界 |
| --- | --- | --- |
| [PR #998 Code analysis Main branch](https://github.com/tt-a1i/archify/pull/998) | OPEN，head `4553a4e0e63e49b3eead1d1b9f260a3ca30d47b7`。官方 [README](https://github.com/tt-a1i/archify/blob/4553a4e0e63e49b3eead1d1b9f260a3ca30d47b7/archify/modules/code-analysis/README.md) 说明 JS/TS、Python 抽取、模块归并、cycle/coupling/complexity/boundary、图上 overlay、源码片段与 AI tasks、前次运行比较，支持本地服务和无图 check。 | 不重做这些能力；外部 JSON 适配不要冒充其 `raw-facts`。其 [schema](https://github.com/tt-a1i/archify/blob/4553a4e0e63e49b3eead1d1b9f260a3ca30d47b7/archify/modules/code-analysis/schemas/raw-facts.schema.json) 要求 sourceText、line、snapshotId、working-tree 来源，dependency-cruiser/madge 并非都具备。`calls` 仍注明 Reserved for M2，不能据此占用其规划中的调用图方向。 |
| [Issue #1044](https://github.com/tt-a1i/archify/issues/1044) / [PR #1049](https://github.com/tt-a1i/archify/pull/1049) | 两者 OPEN；#1044 是 issue，不是 PR。#1049 head `7184b99b01768349840f93b4de83ff206d202c33`。同一路径的已提交 Architecture JSON 从两个本地 Git refs 读取、固定 commit，然后复用已有 Delta。明确不从 code-only refs 自动抽取架构。 | 不做同一个 wrapper；外部转换输出可成为后续快照输入，但不能宣称具备 rename/运行时影响推断。 |
| [PR #1075 Java support](https://github.com/tt-a1i/archify/pull/1075) | OPEN，head `b21b90bb8635c158d5706df05bacbe533de49e46`，目标为 `labs/code-analysis`。源码依赖、复杂度、cycles/hubs 与现有页复用，无需 JDK/build。 | 不用「新增 Java 理解」作为新方向。PR 作者的测试/人工检查是其自述，本轮没有复跑。 |
| [PR #573 repository explanation](https://github.com/tt-a1i/archify/pull/573) | OPEN，head `cdebd72231ccef7a9a5983708b716828749978ab`。检查文件清单及 [scan.mjs](https://github.com/tt-a1i/archify/blob/cdebd72231ccef7a9a5983708b716828749978ab/archify/scan/scan.mjs)：已有 Python/JS 扫描、可达服务、模块归并、布局和 GitHub Action。 | 不能把「源码 imports → 图」当成没有人做的新能力。 |
| [#614](https://github.com/tt-a1i/archify/issues/614)、[#816](https://github.com/tt-a1i/archify/issues/816)、[#1052](https://github.com/tt-a1i/archify/issues/1052) | OPEN 列表分别涉及不可达模块被描为活跃、不可用 graph query 与零边混淆、只读 artifact evidence index。此处只核实标题和状态。 | 未解析/未覆盖/图中省略必须可见；不另造全局 evidence index。 |

查重方法：`gh issue list --state open --limit 100`、`gh pr list --state open --limit 100`，再读取上述目标。返回接近分页上限，不能声称穷尽所有历史/开放事项；实现前仍应按具体功能关键词进一步查重。

本地已核对 `architecture.schema.json` 的 components、connections、sources、boundaries，以及 Explainer 的原生 diagram panel、nodeSources/nodeBlocks、changes。能沿用现有 schema 完成小图+说明，不需要新 renderer。Architecture connection 没有任意来源字段；逐边审计证据应在 Explainer 中列明，而非偷偷添加 schema 未支持字段。

## 项目清单：固定核实修订与许可证

下面的 tag 是查询到的 tag，不等同于 npm/PyPI 最新稳定版。全文分析针对给出的完整 commit。许可证通过 GitHub metadata/许可证路径核实；Code Maat 的 GitHub license API 没有识别，另读了 README 与 project.clj。

| 项目、一手文档与核实 commit | tag / 身份 | 许可证与状态 | 对 Archify 的具体启发、成本、取舍 |
| --- | --- | --- | --- |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser/blob/60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c/README.md)，`60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c` | 查询首个 tag `v18.8.0-beta-1`；head 2026-10-19 | [MIT](https://github.com/sverweij/dependency-cruiser/blob/60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c/LICENSE)，未归档 | **首选外部数据源**。现成 JS/TS 解析、规则、JSON/CSV/图报告；[输出 schema](https://github.com/sverweij/dependency-cruiser/blob/60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c/src/schema/cruise-result.schema.json) 有 source/dependencies/resolved、couldNotResolve、followable、dynamic、typeOnly、cycle 等。仅导入 JSON，不把其解析依赖带进 Archify runtime；不要复制规则引擎。 |
| [madge](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/README.md)，`456057b85c2d063dad9c10147d7686ded4fc5ce5` | `v8.0.0` 与 head 相同；2024-08-05 | [MIT](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/LICENSE)，未归档 | **轻量次选**。`--json` / [obj()](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/lib/api.js) 是邻接表，另有 circular、depends、orphans、leaves、warnings().skipped。转换便宜，但裸邻接表没有行号/未解析信息，必须附带 coverage 或明确 unknown；不要由无入边推断代码死掉。 |
| [code2flow](https://github.com/scottrogowski/code2flow/blob/c2c22afe5e12f969cc256373bf8f4eec592dc762/README.md)，`c2c22afe5e12f969cc256373bf8f4eec592dc762` | README 2.5.1；API tag 列表为空；2023-01-08 | [MIT](https://github.com/scottrogowski/code2flow/blob/c2c22afe5e12f969cc256373bf8f4eec592dc762/LICENSE)，未归档；README 注明 2021 重写前 LGPL 历史 | Python/JS/Ruby/PHP 调用图，以 AST 找函数再匹配调用。支持 target-function/downstream-depth，适合小入口子图；[engine.py](https://github.com/scottrogowski/code2flow/blob/c2c22afe5e12f969cc256373bf8f4eec592dc762/code2flow/engine.py) 对多个候选返回 ambiguous，而非总有确定目标。**暂不整合**：动态调用近似、额外语言解析器、Graphviz 和 #998 M2 重叠；可借鉴 bounded focus 交付方式。 |
| [pydeps](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/README.rst)，`9f086edb4edc1ad5cafc56d26f36d16c116baafa` | 查询 tag `v3.0.9`；head 2026-10-01 | [BSD-2-Clause](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/LICENSE)，未归档 | `--show-deps`/`--deps-output` 中间分析、max-bacon、最大模块深度、折叠第三方 clusters 值得参考。通过 bytecode import-opcodes 找依赖，只发现可找到且被导入的文件，不能把未出现文件说成没依赖。**不作首个 adapter**：图外文件覆盖与 Python 环境约束增加解释成本，且 Python 分析在 #998。 |
| [import-linter](https://github.com/seddonym/import-linter/blob/857ae28bc9cb383ce9c831e7e8345eb9b40667ae/README.md)，`857ae28bc9cb383ce9c831e7e8345eb9b40667ae` | 查询 tag `v2.15`；head 2026-10-13 | [BSD-2-Clause](https://github.com/seddonym/import-linter/blob/857ae28bc9cb383ce9c831e7e8345eb9b40667ae/LICENSE)，未归档 | 已有 Python 导入约束与浏览器架构探索界面。最有用是将一次合同违反解释成具体导入链；**不移植 UI/合同引擎**，避免与 #998 boundary 重复。尚未核实稳定机器报告格式，不承诺直接支持其终端文本解析。 |
| [Grimp](https://github.com/python-grimp/grimp/blob/6876d13858defacefce5522e8fa610d8d3742dd0/README.rst)，`6876d13858defacefce5522e8fa610d8d3742dd0` | 原 seddonym/grimp 已重定向 python-grimp/grimp；查询 tag `v3.17`；head 2026-10-23 | [BSD-2-Clause](https://github.com/python-grimp/grimp/blob/6876d13858defacefce5522e8fa610d8d3742dd0/LICENSE)，未归档 | `build_graph`、查直接导入、最短链、层级违反查询；已核对 [graph.py](https://github.com/python-grimp/grimp/blob/6876d13858defacefce5522e8fa610d8d3742dd0/src/grimp/application/graph.py) 的 find_shortest_chain(s) 与 illegal dependencies。**条件推荐**：已有外部数据者输出 3–8 节点链证据页，不将 Rust 后端引入 Archify，也不在本轮写通用 Python launcher。 |
| [Archan](https://github.com/pawamoy/archan/blob/2aad4808576942048f5bd9c24dbc341be34f12ca/README.md)，`2aad4808576942048f5bd9c24dbc341be34f12ca` | 查询 tag `v2.0.1`；head 2024-01-11 | [ISC](https://github.com/pawamoy/archan/blob/2aad4808576942048f5bd9c24dbc341be34f12ca/LICENSE)，**已归档** | DSM CSV、entities/categories 可分开数据供应与检查逻辑。可借鉴把密集模块依赖放矩阵、只突出违反的小图；**不集成评分系统**：归档、插件成本，以及体系结构「强度」分数解释困难。现有原生图先做小子图即可，不为 DSM 新建 renderer。 |
| [Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/README.md)，`4b1b0e4fd19c4af235fef12b0564c05348f5f6d3` | head 2021-12-13；tag 查询首项是 archive 分支名，**不能当稳定版** | [GPL-3.0](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/LICENSE.txt)，**已归档**；名称商标另有说明 | 离线 graph + source 联动的体验有参考价值，但 C++/Qt/LLVM/JVM 等桌面索引栈维护过重。**不整合**代码、二进制、数据库/UI；Archify 的 standalone evidence 页面只做精确小范围导航。 |
| [Code Maat](https://github.com/adamtornhill/code-maat/blob/50537abb8dffa1b1ba4e91a605ee5c558c01b224/README.md)，`50537abb8dffa1b1ba4e91a605ee5c558c01b224` | 查询 tag `v1.0.4`；[project.clj](https://github.com/adamtornhill/code-maat/blob/50537abb8dffa1b1ba4e91a605ee5c558c01b224/project.clj) 为 `1.0.5-SNAPSHOT`；head 2025-07-03 | README/project.clj 声明 **GPLv3**；GitHub SPDX 识别为空；未归档 | **首选非重叠方向**：VCS 逻辑耦合 `entity,coupled,degree,average-revs` CSV，verbose 有各自/共享 revision 数，可解释为什么两个文件应一起审查。只接受用户已有 CSV，独立编写转换，不捆绑 JVM/Clojure 或复制 GPL 算法。源码 import 与历史共变更必须分图/标明语义。 |
| [codescope](https://github.com/MalyisGreat/codescope/blob/d6e61f5e45247e116ad4906bb0f0719643e9118a/README.md)，`d6e61f5e45247e116ad4906bb0f0719643e9118a` | [package.json](https://github.com/MalyisGreat/codescope/blob/d6e61f5e45247e116ad4906bb0f0719643e9118a/package.json) `0.2.0`；无 tag；head 2026-07-08 | [MIT](https://github.com/MalyisGreat/codescope/blob/d6e61f5e45247e116ad4906bb0f0719643e9118a/LICENSE)，未归档 | 文件与符号两视图，`--out graph.json`；[graph.ts](https://github.com/MalyisGreat/codescope/blob/d6e61f5e45247e116ad4906bb0f0719643e9118a/src/graph.ts) 区分 import/reexport/call/new， [indexer.ts](https://github.com/MalyisGreat/codescope/blob/d6e61f5e45247e116ad4906bb0f0719643e9118a/src/indexer.ts) 使用 ts-morph 解析。**暂不引入全套**：Cytoscape/fcose + server + ts-morph 已是另一个地图产品，和 #998 索引/UI 重叠；将来可只接其离线 payload 作聚焦调用路径，但不能用「真实调用图」宣传词替代动态调用覆盖验证。 |

## 实验 A：成熟依赖报告 → 原生局部地图

**用户问题**：团队已在 CI 产出 dependency-cruiser JSON，评审者仍要装 Graphviz 或阅读大 JSON；需要一个能发给同事的局部图，保留扫描范围与未解析事实。

**最小输入**：固定一个公开仓库 commit（第一轮可用上述 madge 自身 `456057b…` 的 `lib/`，或 Archify 固定基线的一个独立目录），外部产出 `cruise.json`，额外提供来源 repo/commit、生产命令、工具版本、include/exclude 范围。为了验证适配器，先人工构造严格符合已核对 schema 的小输入：`entry → parser → renderer`；`parser → unknown-adapter` 为 couldNotResolve；有一个 typeOnly import 和一个外部 core module。**合成 fixture 与真实分析结果必须分别标记**。

**转换与输出**：只读 JSON，不执行 repo 配置或安装工具；按相对路径生成稳定 component IDs，resolved internal deps 为 connection；typeOnly 另列或清晰标记；external/unknown/doNotFollow 不静默删除。默认 focus 一个入口，一跳或两跳上限，记录全输入数、展示数和省略规则。输出 `dependency-map.architecture.json`、`dependency-map.explainer.json`、独立 HTML 和转换 receipt。收据记录输入 SHA256、外部工具身份、显式用户提供的 commit（未核实则标为声明），不伪造 source lines。

**承载方式**：Explainer 上部说明「静态 imports，非运行时调用」，原生 architecture panel 放 6–12 节点，第二 panel 列出未解析/未跟随项，第三 panel 写来源和覆盖。Diagram 节点 sources 只在有真实、固定修订的文件依据时加入。裸 JSON 不能证明 source 与 commit 一致，需要核对公开 commit 的目标文件后才做已验证来源声明。

**真正收益**：单个外部报告生成可分享图；不新增分析器、规则引擎和 Web server。成本主要是格式验证、路径规范化、稳定 ID、局部选择与信息保留；属于独立 adapter 脚本的范围。不要为首版同时接入十种格式。Madge 邻接表可作为后续第二格式，但其 unknown coverage 需独立处理。

**最小验证**：实际转换一份外部报告，核对全图各 resolved internal edge 的前后集合；focus 只省略未展示项且 receipt 数一致；couldNotResolve、typeOnly、重复/路径碰撞、未知 format fail/unknown 保留各选一个；CLI render/validate + 实际浏览器截图。禁止通过改变用户 topology 让图「更好看」。

**截图**：1440×1000、浅色、同一 preset、页面顶端、图 fit-to-width；第一张图必须同时显示图标题和 unresolved/coverage 数，第二张点开一个节点来源。再拍暗色图以检查 unknown/typeOnly 的图例可辨性。可用现有 Viewer PNG 导出或当前仓库认可的浏览器 capture，不为本实验新增通用 headless PNG CLI（[#974](https://github.com/tt-a1i/archify/issues/974) 已在跟踪）。截图是渲染结果，不证明解析覆盖正确。

## 实验 B：Code Maat CSV → 共变更证据页

**用户问题**：一个改动碰到 A，静态 imports 没有指向 B，但过去 A/B 经常一起改；希望评审时能看出应一起检查哪些文件，并知道分析分母。

**最小输入**：固定公开 repo 的一个 commit 范围与时间窗；由外部 Code Maat `-a coupling --verbose-results` 生成 CSV，同时保存版本、命令、最大 changeset/最少共享提交阈值、输入 log digest。README 的基本列已核实；verbose 精确列名仍需在选定版本实际运行后确认，不能按猜测实现。第一轮可以先支持基本四列并要求 sidecar 提供过滤参数；没有分母时明确写「未提供」，不推算样本量。

**转换与输出**：CSV 中每行保留 entity/coupled/degree/average-revs；选择一个 focal 文件和 3–5 个相邻项。原生 Architecture 图两端使用文件名；边标签写「共变更 78%」而不是 import/calls。原生 connection 是有方向的，因此必须解释方向仅表示 CSV row 的 entity/coupled 顺序，**不表示代码依赖方向**；如果不能让读者稳定理解，首版用原生 Workflow 小图展示「改 A → 一起核查 B」并把统计关系放明细表，避免制造假的架构边。输出 Explainer + 独立图 JSON + HTML + 输入/配置 receipt。

**最有用的版式**：一句结论「修改解析器时，把 renderer 的回归场景一起核查」；一张小关系图；一份原始 row 的可核对明细；底部给时间窗、范围、过滤阈值、样本缺失和批量格式化造成的共变更偏差。不能将统计关系解释成因果或修复优先级。不要做作者排行榜、自动提重构任务或计算一个「健康分」。

**价值/成本/影响**：与 #998 静态单快照有清晰差异，且不触碰 #1044/1049 的 authored snapshot compare。只导入报告的成本低；若顺手实现 Git history miner、rename detection、merge normalization，会急剧扩大范围，先不做。不复制 GPL 程序实现；只消化公开/用户提供输出。README 指向商业 CodeScene 不影响本实验用开源 Code Maat CSV，但不要声称实现了 CodeScene 的能力。

**实验验收**：CSV quote/path 含逗号、degree 范围和非法数字、重复反向配对、阈值遗漏、空结果各核对；数值逐行与输入相符。真实 repo CSV 至少手工核查三对 files 的共同提交，明确 rename/merge 处理沿用外部工具；不把过滤后的 0 行叫作没有耦合。截图固定1440×1000浅/暗，图与明细首三行同屏，来源窗与阈值必须在完整页图可读。

## 实验 C：Grimp 最短导入链解释（条件候选）

**最小输入**：已有 Grimp graph 的调用方提供 importer/imported 和最短链，例如 `pkg.ui → pkg.application → pkg.infrastructure.sql`；每一步附文件与实际行号（没有则仅显示模块名），固定 repo commit 和 Grimp 版本。`find_shortest_chain` 与 `find_shortest_chains` 已由源码核实；不能把返回的一条最短链描述为全部违规链，也不依赖尚未核实的 import-linter 文本格式。

**输出**：一个 3–8 节点原生 diagram，Explainer 列明「期望规则」「实际路径」「逐步源码证据」，只展示所选规则和一条最短解释链；无路径、分析失败、模块未覆盖分开。截图在一屏显示规则、路径、第一条来源，另拍 source panel。若采用 synthetic Python fixture，必须标明 synthetic，不把它算真实用户仓库收益。

**推荐限制**：这个表达能力可作为 A 的 recipe，而不值得为了它维护第二套 boundary analyzer。#998 已经有 import/file/module cycles 与 boundary findings。只有当用户已经产生 Grimp 报告、需要离线分享时，才优先做；否则先做 A/B。import-linter 新版 README 已提供浏览器探索功能，不应把「有 UI」当 Archify 独有价值。

## 不推荐的扩大范围

- 不导入 Sourcetrail desktop/索引数据库，不移植 codescope 的 Cytoscape viewer，也不把 CodeSee 文档当仍可用开源实现。
- 不把 code2flow 近似边、codescope type-checker 解析边或 import graph 宣称为完整运行时调用图。
- 不把 bytecode 未发现、madge skipped、dependency-cruiser followable=false 解释成无依赖/安全。
- 不新建 `raw-facts` 兼容层来凑 #998 schema：缺失 sourceText/line/snapshotId 无法可靠补齐。
- 不把全库图节点数作为收益指标。先要求一个真实审查问题、可读的局部产物和可核对的来源，再扩到多格式。

## 证据状态与下一步交接

完成：10 个具体项目的 commit/状态/许可路径核实、官方 README 与部分关键 schema/源码阅读、Archify 当前相关开放工作查重、两个最小实验和一个条件实验的输入/输出/截图标准。

未完成：外部工具实际安装/运行、真实报告生成、adapter 实现、Archify CLI 验证、浏览器/图片、人类视觉验收、独立远程分支。GitHub 无认证 API 在树查询时曾触发限流，后改用已有认证的 `gh api` 完成 Grimp/codescope 源码定位；这不影响以上已取得的 commit/许可数据，但不能据此宣称所有目录或历史已查尽。

建议集成者首先只选 A 或 B，在单独分支形成真实公开输入与 HTML/PNG，再依据具体结果判断值不值得产品化；本报告没有任何安装/发布/评论行为。
