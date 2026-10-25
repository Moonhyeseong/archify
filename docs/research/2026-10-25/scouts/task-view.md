# task-view 与相邻项目调研

调研日期：2026-10-25。Archify 本地比较基准：`82c7e0f089a02a4d514714adf37dc2061682da5f`。本报告只做只读调查，没有安装或执行上游软件，没有远程写入，没有实现实验。判断使用项目 `archify-review` 的价值、成本、影响框架。

## 结论

首选实验是 **“按变更解释的审阅地图”**：Agent 提交变更节点与原因，程序核对这些节点对应的 Git 文件/范围，并显著列出“变更了但没解释”的 hunk；点击节点看原因、真实 diff 与相关测试。它补上 Archify 从“理解系统”到“审阅这次改动”的用户任务，且不要求新增一套多语言解析器。

第二优先级是同作者 Flowmap 的 **一跳展开与局部聚焦**，用于控制复杂图的阅读负担。MDView 的 **保留最后一次成功图** 很实用，但 Archify 已有 #927，适合补证据/沿现有 issue 推进，不另开平行实验。暂不引入 3D 代码城市或整套架构 DSL。

以上是基于源码与文档的产品建议，没有用户实验数据证明能缩短审阅时间。

## 目标辨认与来源

确认目标为 [gtindo/task-view](https://github.com/gtindo/task-view)，不是同名项目管理软件 Gimanh/taskview-community。GitHub 用户仓库列表、官方 README 和作者发布文章相互吻合。作者文章仅用作发现线索；下文能力判断依官方仓库。

- 锁定源码：[`f27b8bef63ec336b8e3487e90ccd484a2fa7a235`](https://github.com/gtindo/task-view/tree/f27b8bef63ec336b8e3487e90ccd484a2fa7a235)。查询时 main，GitHub `pushed_at=2026-10-24T18:58:12Z`。
- [README](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/README.md)、[审阅模型 types.go](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/internal/review/types.go)、[引用验证 refs.go](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/internal/engine/refs.go)、[Git 适配器](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/internal/gitx/git.go)、[Reader app.js](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/internal/render/assets/app.js)。本次实际读取了这些内容。
- [MIT LICENSE](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/LICENSE)。Reader 携带 Cytoscape.js、cytoscape-elk 的 MIT 许可与 ELK 的 EPL-2.0；见 [vendor/LICENSES.txt](https://github.com/gtindo/task-view/blob/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/internal/render/assets/vendor/LICENSES.txt)。不能把“项目 MIT”扩大为“所有 vendored 内容 MIT”。建议借鉴交互并独立实现，不直接搬 vendored renderer。
- README 明示这是个人工具，不接收 issues/PR，鼓励 fork。实验不以等待上游接受集成为前提。

## 实际数据模型与交互

### 模型：事实指针与 Agent 叙述分开

`Review` schema version 为 1，包括 `summary/repos/nodes/edges/flows/claims/notes`。

| 实体 | 实际字段/语义 | 可借鉴之处 |
| --- | --- | --- |
| Repo | `id/path/role/commits/languages`；role 可为 changed/context；`WORKTREE` 是未提交状态 | 变更上下文可以跨仓库，context repo 不冒充发生改动 |
| Node | `id/kind/label/change/ref/why/meta`；change 为 added/modified/deleted/unchanged | 一块可理解的改动，而不是固定“一文件一节点” |
| Edge | `from/to/kind/ref` | 关系可有引用；引用缺席时保留声明性质 |
| Flow | `id/title/path[]/tests[]` | 有序用户路径与图拓扑共用节点 ID |
| Claim | `text/about[]/evidence[]` | 将结论与支持它的引用放在一起 |
| Ref | file/range/site/hunk/commit，带 repo、file、lines、line、contains、SHA、at 等 | 指向能被验证的具体代码事实 |

引用检查并非语义证明：检查文件是否存在、范围是否有效、节点 change 是否与 diff 一致、指定行是否包含字串、commit 是否在声明链里。`site` 字串允许 ±2 行漂移并产生 `site_offset` 提示。删除节点默认从 initial state 取内容，其余默认 final state，显式 `at` 可选声明链中的提交。

**关键限制：即便 evidence 引用全部可解析，也不能据此说 claim 的自然语言语义已被证实，更不能说测试执行成功。** 原工具 README 已提醒代码正确性仍由审阅者判断。Archify 若借鉴，应把状态文案写成“引用吻合”，不要给整个结论挂一个泛化的“已验证”。

### 四种视图共用选中状态

1. **Graph**：按仓库分组；默认降低测试、文档、import、未改动节点的噪声；搜索与节点/邻居聚焦。
2. **Flows**：每条路径按 `path[]` 顺序展示；`tests` edge 将测试挂到该路径中它关联的第一个 step；没有关联 step 的测试单列，空测试明确显示，没有当成通过。
3. **Diff map**：每文件的 hunk 条带，标出全部/部分/未解释；这是防 Agent 遗漏解释的阅读入口，不是代码质量或测试覆盖率。
4. **Claims**：声明卡片与可展开的代码/commit 引用。Inspector 可从节点、edge、hunk、finding 打开，切换 Diff/After。

状态与变更颜色是两个独立维度：verified / contradicted / unresolved / agent statement 表示引用核对状态，added / modified / deleted / unchanged 表示变更事实。`app.js` 的 `agentAccountSection`、`testRow` 显式标 `agent says`。测试命令/结果是展示数据，工具不执行测试。

已核读 Git 适配器使用固定只读子命令，设置 `GIT_OPTIONAL_LOCKS=0`，diff 带 `--no-ext-diff`。没有完整安全审计或运行验证，不能由这些局部检查宣称所有边界安全。尤其不能直接复制它的进程封装作为 Archify 的安全模板：它仍继承 `os.Environ()`，Archify 已有隔离 Git selector 的约定和 #1049 相关实现，应复用自己已审过的边界。

### 已有真实图证据

上游发布的 [在线 demo](https://gtindo.github.io/task-view/) 与 [错误声明 demo](https://gtindo.github.io/task-view/broken.html) 可直接查看，不必安装。以下是**作者随仓库发布的截图**，本次未独立运行复现、未进行浏览器交互验收；不是 Archify 实验产物。

- [Graph 原图](https://raw.githubusercontent.com/gtindo/task-view/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/docs/images/graph.png)
- [Inspector 原图](https://raw.githubusercontent.com/gtindo/task-view/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/docs/images/inspector.png)
- [Flows 原图](https://raw.githubusercontent.com/gtindo/task-view/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/docs/images/flows.png)
- [Diff map 原图](https://raw.githubusercontent.com/gtindo/task-view/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/docs/images/diff-map.png)
- [错误与遗漏原图](https://raw.githubusercontent.com/gtindo/task-view/f27b8bef63ec336b8e3487e90ccd484a2fa7a235/docs/images/findings.png)

## Archify 重叠检查

2026-10-25 用 `gh issue list` / `gh pr list` 获取 open 标题，并读取下表关键 issue/PR 正文。不是仅靠历史记忆判断；状态仍是查询时快照。列表按前 100 条读取，并未宣称穷尽所有历史工作。

| 当前工作 | 与实验的关系 | 应保留的边界 |
| --- | --- | --- |
| [#1044](https://github.com/tt-a1i/archify/issues/1044)、开放 [PR #1049](https://github.com/tt-a1i/archify/pull/1049) Git refs compare | 已有“两个 Git refs 取 Architecture JSON snapshot，再走 Delta” | 不再实现 Git snapshot compare；review-map 核对真实代码 hunk，而非比较两份 Archify JSON |
| 开放 [PR #998](https://github.com/tt-a1i/archify/pull/998)、[PR #1075 Java](https://github.com/tt-a1i/archify/pull/1075) | code analysis 工作正在进行 | 不增一套 AST/符号抽取；最初手写/Agent 叙述节点并核对引用 |
| [#1052](https://github.com/tt-a1i/archify/issues/1052)、[#1053](https://github.com/tt-a1i/archify/issues/1053)、[#1054](https://github.com/tt-a1i/archify/issues/1054) evidence M1 | M1 只做交付 provenance，明确不含 source analysis、Viewer、browser/visual/human evidence | 不把 review-map 塞入 M1，不从 sidecar 缺失推断成功 |
| 开放 [PR #1015](https://github.com/tt-a1i/archify/pull/1015) | source/code focus、可展开源码、step locking 已有候选 | 独立实验先展示 diff/why，不再发一套泛用 code focus 控件 |
| [#1068](https://github.com/tt-a1i/archify/issues/1068)、开放 [PR #1069](https://github.com/tt-a1i/archify/pull/1069)、[PR #1076](https://github.com/tt-a1i/archify/pull/1076) | 独立产物 Reader 体验与窄屏菜单正在推进 | 实验读者界面不改共享 toolbar，不借机重做 Native/Explainer |
| [#927](https://github.com/tt-a1i/archify/issues/927) | 已提出 preview 保留最后一次有效图 | MDView 灵感应回到此缺口，不另起同题功能 |
| 开放 [PR #653](https://github.com/tt-a1i/archify/pull/653) | C4 leveled architecture generation | LikeC4 的层级视图只作比较，不重做 C4 DSL |

本地 `authoring-contract.md` 已有 repository evidence 与 revision/source-link 约定；review 实验应映射/复用，不能将 task-view 的 ref 形状直接加进正式 schema-v1。

## 三个可实施实验

成本是相对工程估计，不是排期承诺；都先独立远程实验分支，待审查再讨论正式接口。

### A. Review map：变更、原因、遗漏清单（首选）

- **用户价值**：审阅 Agent 多文件修改时，在一页看到“改了什么、为何改、哪里没解释”，少做手工重建调用链。适用性目前是合理推断。
- **最小范围**：一个 repo、固定 base/head 的已提交变更、一份独立 review JSON、5–15 个节点、少量显式关系。HTML 左边图，右边 why/diff，底部未解释 hunk 列表。初版不支持 WORKTREE、多仓库、自动 AST、完整四视图。
- **核对**：固定 commit、引用文件和行范围；从真实 diff 算“解释范围覆盖”，空/缺失引用不算覆盖。大范围 file-level 节点要单列为粗粒度说明，不能让“一节点声明整文件”显示成高质量全覆盖。
- **状态**：`reference matches / mismatch / unavailable / agent statement`；测试执行另列证据来源，本实验未执行的显示未执行。检查只确认代码指针，不确认自然语言推论。
- **实现路径**：实验目录中建立独立 adapter 与 renderer，映射到已有图节点 ID；先复用 Archify 的证据/HTML生成能力。生产 schema、统一 CLI、ZIP、Skill 暂不改。
- **成本/影响**：中；主要成本是 Git diff 的删除/重命名行号和安全读取，不是画节点。共享图渲染影响应维持为零。
- **真实验收/图片**：用本仓一个真实、固定提交做页面；另加一个故意漏掉 CSS hunk 的实验 fixture。产出同尺寸 `overview.png`、点击节点后的 `inspector.png`、遗漏状态 `unexplained.png`；保存 review JSON、base/head SHA 和实际截图命令/viewport。图片从浏览器对实际 HTML 截取，不用设计稿冒充实现。
- **失败界限**：解释范围过宽导致绿条失真、源码绑定错误、页面让人误会“测试已过”，任一出现就应修正模型/文案后再评估。

### B. Flow 与测试关联：从变更地图走完一条用户路径

- **用户价值**：将一条请求/修复路径按执行叙述顺序排列，把测试关联到具体步骤，读者能发现没有解释的分支和没有测试关联的步骤。
- **最小范围**：在 A 的同一份节点数据加 `flows[{title,path,testIds}]`；一个真实行为路径和一个失败路径；点击 step 同步图中节点与 inspector。测试只显示引用与状态来源。
- **成本/影响**：低到中；新增投影视图而非第二份节点状态。与 #1015 step locking 存交集，实验应自己命名和收边，不改共享 Explainer。
- **验收/图片**：同一真实变更的 flow 页面，分别截图选中 step、无测试关联、Agent 声称 passed 但无执行凭证三种状态。验证没有真实运行证据也不会呈绿勾“通过”。
- **顺序**：A 可读且对遗漏有用以后再做 B，避免先做漂亮的流程图却没有真实变更绑定。

### C. Flowmap 式一跳阅读：只展开要读的关系

- **用户价值**：大图首次只展示所选节点的一跳；读者逐步展开邻居，不被整图压垮。
- **最小范围**：独立 Viewer 实验以现有真实 architecture JSON 作输入；聚焦/一跳展开/折叠；保留另一展开路径仍需要的节点，复用现有查找入口；不新做解析器。
- **成本/影响**：中；影响选择状态、节点可见性、布局稳定性与键盘焦点，需要真实 browser 验证。不能以减少 SVG 元素为由删除 authored 数据或导出内容。
- **验收/图片**：同一 30–60 节点输入在 overview、focus、expand、collapse 的实际截图；验证收起 A 路径不会吞掉仍被 B 路径引用的节点；导出意图明确区分完整图与当前视图。
- **优先级**：低于 A，先判断 Archify 当前 Finder/关系聚焦是否已经满足场景；若满足则不值得再加入口。

## 五个相邻开源项目

这里的能力级证据来自各项目官方 README；未运行、未审计完整源码。许可来自 GitHub 仓库 metadata/官方 README，复用代码前仍须审查对应文件及依赖许可证。

| 项目 / 锁定 commit | 已有能力证据 | 适合借鉴的最小能力 | 价值 / 成本 / 影响 / 建议 |
| --- | --- | --- | --- |
| [gtindo/flowmap](https://github.com/gtindo/flowmap/tree/1f8a8a37f61e19fc1405d8941647279f242ea425)；MIT；`1f8a8a37f61e19fc1405d8941647279f242ea425` | [README](https://github.com/gtindo/flowmap/blob/1f8a8a37f61e19fc1405d8941647279f242ea425/README.md) 明确 Go/JS/TS 静态图、one-hop、Changes、Git diff、Tests toggle；动态边是候选，不是运行轨迹 | 渐进一跳与诚实标注动态/未解析关系 | 价值高；成本中；Viewer 状态影响中。推荐作为 C 的交互参照，不移植解析引擎 |
| [gtindo/md-viewer](https://github.com/gtindo/md-viewer/tree/b6015d51e4ead5cb270d4c58564cdfe12598bcd3)；MIT；`b6015d51e4ead5cb270d4c58564cdfe12598bcd3` | [README](https://github.com/gtindo/md-viewer/blob/b6015d51e4ead5cb270d4c58564cdfe12598bcd3/README.md)：diagram pan/zoom、expand、minimap、search、split edit；出错保留上一次成功图 | 错误态保留已验证预览；页滚动与图滚动不互相困住 | 价值高；成本低中；preview 状态影响中。回 #927 补比较证据；不要做桌面 App |
| [likec4/likec4](https://github.com/likec4/likec4/tree/5ad0ce604740d6c6d018f31bc8900a55606fab22)；MIT；`5ad0ce604740d6c6d018f31bc8900a55606fab22` | [README](https://github.com/likec4/likec4/blob/5ad0ce604740d6c6d018f31bc8900a55606fab22/README.md)：架构建模语言，自定义元素/notation、多级嵌套；有官方 demo | 同一模型的不同层级视图 | 有价值但不是新增 DSL 的理由；成本高中；schema/layout 影响高。仅研究，先避开 #653 |
| [sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser/tree/60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c)；MIT；`60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c` | [README](https://github.com/sverweij/dependency-cruiser/blob/60f8a7ef72cbd69a01f62c61c8efcedd8a67d83c/README.md)：依赖验证、自定义 forbidden rules、循环/孤儿/生产引用测试等；输出 JSON/HTML/Mermaid | 把已有 violation JSON 投影成高亮边/约束解释，而非重写检查器 | 价值中高；只做 importer 成本低中；独立 adapter 影响低。适合后续单独小实验，先选一类真实 rule violation |
| [MaibornWolff/codecharta](https://github.com/MaibornWolff/codecharta/tree/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466)；BSD-3-Clause；`bd1fe9b40f987cfdc34cf169b7fb220e5ea69466` | [README](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/README.md)：metrics city/domain/dependencies 三视图；hotspots、temporal coupling、filter/focus；有官方 Web Studio | 平面图的变更/复杂度热点叠层，数值来源透明 | 有明确指标源才有价值；导入成本中，3D 成本高。只考虑数据投影，当前不做 3D 或指标采集平台 |

检索中出现的错误仓库猜测 `pahen/dependency-cruiser`、`softvis-research/codecharta`、`abanteai/code-charter` 均返回 404，已纠正或排除，没有把猜测当成项目。

## 实验交付要求与下一步

最小决策只需做 A：一个真实提交、一份 review JSON、一张可点击图、一份真实 diff 与未解释清单，再给三张实际页面截图。A/B 是任务审阅表面，C 是阅读交互，应该用独立实验分支分别评估，不能打成一次共享 Viewer 大改。

本报告提供了上游原图 URL 和可复现产图步骤，但没有生成 Archify 实验图片。后续实现者应在最终实验 revision 上用仓库现有真实浏览器工具截图，记录运行环境；静态 HTML 检查、浏览器交互、视觉审阅分别报告。未知状态保持未知，不把截图存在当作功能通过，也不把绿色引用状态当作代码正确。
