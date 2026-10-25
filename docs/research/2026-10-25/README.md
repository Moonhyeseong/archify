# Archify 持续探索与实验分支

2026-10-25 启动。项目维护者要求持续寻找代码理解、图形表达与交互阅读项目，把有价值的点做成独立远程分支，附真实产物图片供审阅；直到维护者明确说停才停止。完成某一批并不结束目标。

**星数不作为门槛或排序依据。** 每个方向都看实际问题、现有能力、维护成本和来源证据；小项目、早期项目同样纳入。与已有 issue/PR 重复的方向先排除或明确剩余差异。

共同实验基线：[dev `82c7e0f0`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)，2026-10-25 已重新核对远端仍为该 revision。下面的“已推送”只表示远程实验分支可审查，不能等同于合入、发布或人类验收。

## 已推送的 20 个实验

分支里的 README 含实际图片、原始/示例输入、生成 JSON/HTML、复现命令、来源许可与验证边界。

| 实验与远程分支 | 具体价值 | 发布 revision | 实际图片 | 验证与限制 |
| --- | --- | --- | --- | --- |
| [Task review map](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map) | 借鉴 gtindo/task-view，把 Agent 的解释绑定固定 Git diff，列出未解释改动 | `b9e33974` | [遗漏示例](https://github.com/tt-a1i/archify/blob/codex/lab-task-review-map/experiments/task-review-map/screenshots/omitted.png) | 15 tests；validate/deliver/check 通过；当前 browser 未重跑，历史键盘遍历失败按旧 hash 保留 |
| [Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) | 把 dependency-cruiser 已有报告变成局部原生图，保留未解析与视图外账目 | `2be2ab55` | [官方样例](https://github.com/tt-a1i/archify/blob/codex/lab-dependency-map/experiments/dependency-map/screenshots/official.png) | 6 tests；两图 finalize 四阶段通过；synthetic 的三条绕行建议仍保留 |
| [Trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) | 把真实采集的 Chrome X 格式操作区间变成可分享瀑布图 | `8e65f150` | [真实采集](https://github.com/tt-a1i/archify/blob/codex/lab-trace-waterfall/experiments/trace-waterfall/screenshots/workload.png) | 9 tests；四阶段通过；仅 X 子集，不推断调用树或关键路径 |
| [Markdown outline](https://github.com/tt-a1i/archify/tree/codex/lab-markdown-outline/experiments/markdown-outline) | 标题与源行号直接转原生 Tree，保留文档层级 | `3f156e97` | [原生 PNG 导出](https://github.com/tt-a1i/archify/blob/codex/lab-markdown-outline/experiments/markdown-outline/screenshots/contributing-export.png) | 8 tests；三样例四阶段通过；公开 CONTRIBUTING.md 17 节点，受限 Markdown 子集 |
| [DBML ERD](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) | 从严格 DBML 子集保留键、关系方向和可空性 | `feab6ae6` | [4 表示例](https://github.com/tt-a1i/archify/blob/codex/lab-dbml-erd/experiments/dbml-erd/screenshots/order-payments.png) | 39 tests；四阶段通过；原创 synthetic，未验证完整 DBML 或真实数据库 |
| [Change coupling](https://github.com/tt-a1i/archify/tree/codex/lab-change-coupling/experiments/change-coupling) | 解释 Code Maat CSV 的对称共变分数及原始计数 | `44dc5cbc` | [原生证据图](https://github.com/tt-a1i/archify/blob/codex/lab-change-coupling/experiments/change-coupling/screenshots/coupling.png) | 13 tests；render/finalize 通过，自动 browser 未请求；synthetic，非调用或因果网络 |
| [Payload delta](https://github.com/tt-a1i/archify/tree/codex/lab-payload-delta/experiments/payload-delta) | 借鉴 PR Lens；把明确提供的 JSON 样本差异放在调用旁，区分 null、missing、类型和数组身份 | `823e8705` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-payload-delta/experiments/payload-delta/screenshots/review.png) | 10 tests；render/finalize 通过，单独 Explainer browser 通过；保留一条段落长度建议，不推断 schema 兼容性 |
| [Decision thread](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) | 保留异议、撤回与单方决定；决定不会抹掉尚未解决的异议 | `bdbdf9a9` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-decision-thread/experiments/decision-thread/screenshots/sequence.png) | 8 tests；两种产物四阶段通过；原创虚构对话，颜色图例已修正，不推断群体共识 |
| [Migration plan](https://github.com/tt-a1i/archify/tree/codex/lab-migration-plan/experiments/migration-plan) | 阅读 pg-schema-diff 已有计划中的顺序、timeout 配置与原始 hazard | `8a4a1cd4` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-migration-plan/experiments/migration-plan/screenshots/migration-plan.png) | 14 tests；render/finalize 通过，自动 browser 未请求；无 SQL/数据库执行，synthetic |
| [State contract](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | 把 robot3-viz flat 数据和显式 sidecar 转为 Lifecycle 与状态×事件声明矩阵 | `cc8c75bc` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-state-contract/experiments/state-contract/screenshots/state-contract.png) | 40 tests；两种产物四阶段通过；rich 语义拒绝，无机器执行，synthetic |
| [Finder canvas matches](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | 输入查询后，列表与画布同步显示匹配节点，保留既有选择与视图 | `94c165ee` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-finder-highlights/experiments/finder-highlights/screenshots/candidate-api-light.png) | 共享 Viewer；作者最终 browser 60/60、core 19/19、generated/ZIP 一致；独立 browser 17/17；有固定输入浅/深色前后图，无效率计时 |
| [CI conditions](https://github.com/tt-a1i/archify/tree/codex/lab-ci-conditions/experiments/ci-conditions) | 固定真实 workflow 的 needs、原始 if、隐式 status 门槛与未知矩阵 | `0ec0b834` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-ci-conditions/experiments/ci-conditions/screenshots/overview.png) | 10 tests；三份产物 finalize 四阶段通过；没有运行 CI 或预测 job 结果 |
| [Plan actions](https://github.com/tt-a1i/archify/tree/codex/lab-plan-actions/experiments/plan-actions) | 分别看两种 replacement 顺序，保留 unknown/sensitive/null 路径与 deferred/complete | `640fa6ff` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-plan-actions/experiments/plan-actions/screenshots/explainer.png) | 16 tests；render/finalize 通过，自动 browser 未请求；synthetic，所有 before/after 值不入产物 |
| [Recipe stages](https://github.com/tt-a1i/archify/tree/codex/lab-recipe-stages/experiments/recipe-stages) | Just dump 的 priors 只改一值，直观看出同一依赖由 before 移到 after | `10164864` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-recipe-stages/experiments/recipe-stages/screenshots/priors-2.png) | 10 tests；四份产物四阶段通过；固定上游形状的原创 synthetic，没有执行 Just |
| [Relation reference](https://github.com/tt-a1i/archify/tree/codex/lab-relation-reference/experiments/relation-reference) | 复制当前 pinned 关系的原始方向、标签、节点 ID 与明确身份，便于准确引用 | `6d7cd594` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-relation-reference/experiments/relation-reference/screenshots/candidate-light.png) | 共享 Viewer；focused 62/62，最后 Focus 16/16，core 19/19、generated/ZIP 一致；独立复核；真实 OS clipboard 与用户收益未验证 |
| [Test context map](https://github.com/tt-a1i/archify/tree/codex/lab-test-context-map/experiments/test-context-map) | 精确 context 映射到选择源码行，保留空标签、未知、缺失、排除和不可用 | `9d6b4e3a` | [实跑矩阵](https://github.com/tt-a1i/archify/blob/codex/lab-test-context-map/experiments/test-context-map/measured/screenshots/matrix.png) | 原18 tests复用；新增固定工具实跑原创fixture和逐字段复核；finalize通过，自动browser未请求；sidecar仍是声明，不补造缺失标签 |
| [Test failure map](https://github.com/tt-a1i/archify/tree/codex/lab-test-failure-map/experiments/test-failure-map) | 分开 setup/call/teardown 与 collection，显示提供的行号和缺少的定义文件 | `bb5e7bdb` | [实跑阶段](https://github.com/tt-a1i/archify/blob/codex/lab-test-failure-map/experiments/test-failure-map/measured/screenshots/phases.png) | 11 tests；4旧例四阶段通过，新增2实跑页面finalize通过但自动browser未跑；故意失败exit1/2保留；reader文案收窄、投影不变 |
| [Delta values](https://github.com/tt-a1i/archify/tree/codex/lab-delta-values/experiments/delta-values) | 选中既有 exact row 直接读取 SQL→SQL tx、orders→fraud 等 receipt 事实 | `4c35456b` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-delta-values/experiments/delta-values/screenshots/candidate-persist-order-light.png) | 独立 Delta shell；67 Node tests、5 browser + 独立5、generated/ZIP通过；真实窄屏横滚缺陷已修并保留旧图；不扩 diff 合同 |
| [Source question tour](https://github.com/tt-a1i/archify/tree/codex/lab-source-question-tour/experiments/source-question-tour) | 同5段固定源码按文件/4个问题组织，解释源码版本与Escape条件 | `94d6a4d0` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-source-question-tour/experiments/source-question-tour/screenshots/question-first-overview.png) | 零共享代码；两页finalize通过，自动browser未跑；源码逐字/摘要一致，root实际hover/Tab/Escape与原生图跳转；无效率结论 |
| [Diagnostic locations](https://github.com/tt-a1i/archify/tree/codex/lab-diagnostic-locations/experiments/diagnostic-locations) | 同文诊断显示已有行号/节点/路径，preview保留旧图并指出坏输入 | `67328d7d` | [实际连续预览](https://github.com/tt-a1i/archify/blob/codex/lab-diagnostic-locations/experiments/diagnostic-locations/screenshots/live-preview-needs-fix.png) | 29诊断、19core、2preview、7真实Chrome检查；独立6；JSON字节不变，双ZIP一致；同一浏览器验证rev1→needs-fix |

这二十项均经过另一位 Codex agent 的独立代码/证据复核，协调 agent 实际查看图片。测试数对应各实验自己的 focused tests，不是全仓测试；远端 CI、跨平台验证、实际用户效果与人类验收没有因此自动成立。生成 HTML/Markdown 保留原渲染器或适配器字节；源码 whitespace 检查与生成产物的既有空白分开记录。Payload test 和 State source 各清理了一处无语义影响空白，摘要同时保留实际测试 hash 与当前 hash。

GitHub CI 单独核实：截至 2026-10-25 13:01（台北），前 11 个精确远端 head 的 Actions runs/check-runs 均为 0。当前 [CI 配置](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/.github/workflows/ci.yml) 只对 main/dev push 自动运行，另外支持 PR/manual。这里的实验分支 push 没有提供远端 CI 通过证据；上表测试均按实际本地来源记录。

2026-10-25 13:17（台北）再次核实，main/dev 仍为 `25cf3708` / `82c7e0f0`；新增 CI conditions、Plan actions、Recipe stages、Relation reference 与未推荐 Relation return 的精确 head 也均为 Actions runs=0、check-runs=0。本地证据与远端 CI 始终分开。

2026-10-25 13:37（台北），main/dev未变；Test context map旧head `c02a74fd`、Test failure map旧head `82af4896`、Delta values `4c35456b`、Source question tour `94d6a4d0`、Diagnostic locations `67328d7d`的精确head也均为Actions runs=0、check-runs=0。之后两个测试分支分别补实跑证据到`9d6b4e3a` / `bb5e7bdb`，远端head已核对；新提交未单独查询CI，不沿用旧head作为新CI结论。

## 图片速览

以下四张直接来自对应分支的实际产物。点击名称查看完整说明；其余实验的图片见上表。

| [Finder：搜索对应画布节点](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | [DBML：键与关系](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) |
| --- | --- |
| <img width="540" alt="Finder：搜索对应画布节点 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/94c165ee6e5213c67e37a75a0b04496564980801/experiments/finder-highlights/screenshots/candidate-api-light.png"> | <img width="540" alt="DBML：键与关系 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/feab6ae685692630d6d837622dc7bdcb57a09679/experiments/dbml-erd/screenshots/order-payments.png"> |

| [State：声明与未声明](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | [Decision：保留异议](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) |
| --- | --- |
| <img width="540" alt="State：声明与未声明 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/cc8c75bc15484098bf64aead799a34870981ccac/experiments/state-contract/screenshots/state-contract.png"> | <img width="540" alt="Decision：保留异议 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/bdbdf9a9b5b97c556c5f85547279021b7446a05c/experiments/decision-thread/screenshots/sequence.png"> |

## 保留证据但暂不推荐的原型

[Relation return 分支](https://github.com/tt-a1i/archify/tree/codex/lab-relation-return/experiments/relation-return)（`e323d30f`）保留实际前后 HTML、[截图](https://github.com/tt-a1i/archify/blob/codex/lab-relation-return/experiments/relation-return/screenshots/candidate-destination-light.png)、可应用的候选 patch 与验证摘要。该分支只新增实验文件，**没有共享 Viewer 产品改动**。

在原有 production-deployment 图中，目标 Passport 的 Incoming 行本来就能一步回到来源；新增 Back 按钮同样是一步。既有代表性 Architecture 样例的检查也未找到来源行因长列表而被遮挡的实证。56/56 focused 与独立 18/18 Focus 说明兼容性边界，不能说明更好用，因此暂不引入额外状态和按钮；不为证明收益而另造极端场景。

[390px图内导航实测](evidence/mobile-nav/README.md)：横滚后全部缩放控件可命中，实际100%→125%，因此不把初始裁剪误作不可用，也不新增布局分支。物理触屏和可发现性尚未验证。

## 正在推进

| 方向 | 来源与目标 | 状态 |
| --- | --- | --- |
| 后续发现 | 源码证据、键盘阅读与执行步骤可视化 | 局部上下文与profile阅读调研已发布，未发现立即实施的缺口；新一轮继续寻找具体机制 |

## 一手调研报告

| 领域 | 报告 |
| --- | --- |
| Task-view 与改动审阅 | [Task-view](scouts/task-view.md) |
| 代码与依赖地图 | [Code maps](scouts/code-maps.md) |
| 图形探索与阅读 | [Graph reading](scouts/graph-reading.md) |
| 文本及结构数据转图 | [Text diagrams](scouts/text-diagrams.md) |
| 运行轨迹与时间线 | [Traces](scouts/traces-timelines.md) |
| Git 历史及架构证据 | [Git and architecture](scouts/git-architecture.md) |
| PRLens 与小型专用工具 | [PRLens and small tools](scouts/prlens-smalltools.md) |
| 协议、状态机与 schema 演化 | [Protocol/schema small tools](scouts/protocol-schema-smalltools.md) |
| CI、构建与基础设施小工具 | [Build/infra small tools](scouts/build-infra-smalltools.md) |
| Viewer 阅读交互与明确导出范围 | [Interaction small tools](scouts/interaction-smalltools.md) |
| 测试结果、上下文与代码证据 | [Test/code evidence small tools](scouts/test-code-evidence-smalltools.md) |
| 源码导航、上下文和问题导览 | [Source navigation small tools](scouts/source-navigation-smalltools.md) |
| 图差异、事实对照与视觉比较 | [Graph comparison small tools](scouts/graph-comparison-smalltools.md) |
| 布局、边与标签阅读的负面筛选 | [Layout reading small tools](scouts/layout-reading-smalltools.md) |
| 作者纠错、位置与关联诊断 | [Authoring diagnostics small tools](scouts/authoring-diagnostics-smalltools.md) |
| 架构约束、违规见证与检查范围 | [Architecture constraints small tools](scouts/architecture-constraints-smalltools.md) |
| 局部上下文、路径与折叠的负面筛选 | [Local context small tools](scouts/local-context-smalltools.md) |
| 性能图计量、比较与异步归因 | [Profile reading small tools](scouts/profile-reading-smalltools.md) |
| 当前 Archify 集成切口 | [Integration map](integration-map.md) |

报告中的上游声明、局部源码核实、计划中的实验和已经执行的结果分别标注。未推荐方向也保留原因，避免反复研究；没有把上游宣传、星数或作者截图当作 Archify 的效果证明。

## 证据约定

- 图片来自实际 HTML 浏览器截图或原生导出，不使用概念图冒充产物。
- 实测、公开上游样例、原创 synthetic 与作者声明分开标识。
- 来源和许可固定到可核对 revision；未复制实现时仍记录灵感来源。
- 原始含本机路径的 receipts 保存在 checkout 外；公开摘要明确说明是派生记录，保留实际阶段、hash 和失败。
- 修复独立审查发现的问题后再推送；明确限制不通过隐藏数据、关闭检查或改基线来伪装通过。
- 每个方向有独立分支。第一批适配器位于 experiments/，沿用原生 renderer，不扩大已安装 Skill 的公共 CLI。共享 Viewer 实验另外记录其更广影响。

AI 协助：Codex 负责调研、实现、截图及审查；通常 delegated model 为 gpt-6.1-sol medium，共享 Viewer 的复杂实现使用 high。以上不声明人类代码或视觉接受。
