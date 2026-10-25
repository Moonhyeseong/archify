# Archify 持续探索与实验分支

2026-10-25 启动。项目维护者要求持续寻找代码理解、图形表达与交互阅读项目，把有价值的点做成独立远程分支，附真实产物图片供审阅；直到维护者明确说停才停止。完成某一批并不结束目标。

**星数不作为门槛或排序依据。** 每个方向都看实际问题、现有能力、维护成本和来源证据；小项目、早期项目同样纳入。与已有 issue/PR 重复的方向先排除或明确剩余差异。

共同实验基线：[dev `82c7e0f0`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)，2026-10-25 已重新核对远端仍为该 revision。下面的“已推送”只表示远程实验分支可审查，不能等同于合入、发布或人类验收。

## 已推送的 29 个实验

分支里的 README 含实际图片、原始/示例输入、生成 JSON/HTML、复现命令、来源许可与验证边界。

[离线图片浏览页](gallery/README.md)：当前固定快照含 29 张原始 PNG，可按分组和关键词筛选、展开完整图；下载 `gallery/index.html` 后可独立打开。固定提交/图片摘要保留在 manifest，桌面与 390px 实际检查见浏览页说明。

| 实验与远程分支 | 具体价值 | 发布 revision | 实际图片 | 验证与限制 |
| --- | --- | --- | --- | --- |
| [Task review map](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map) | 固定Git改动对应独立声明；真实PR #1097的5hunk已记账与ZIP未解析并列 | `dcedd538` | [真实PR前后布局](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map/pr-1097) | 原15 tests复用；新增完整4文件证据，映射exit1；只手工改9坐标修阅读性，原输出保留；3静态gate通过，仍30键盘诊断；未跑PR代码 |
| [Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) | 把 dependency-cruiser 已有报告变成局部原生图，保留未解析与视图外账目 | `2be2ab55` | [官方样例](https://github.com/tt-a1i/archify/blob/codex/lab-dependency-map/experiments/dependency-map/screenshots/official.png) | 6 tests；两图 finalize 四阶段通过；synthetic 的三条绕行建议仍保留 |
| [Trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) | 把真实采集的 Chrome X 格式操作区间变成可分享瀑布图 | `8e65f150` | [真实采集](https://github.com/tt-a1i/archify/blob/codex/lab-trace-waterfall/experiments/trace-waterfall/screenshots/workload.png) | 9 tests；四阶段通过；仅 X 子集，不推断调用树或关键路径 |
| [Markdown outline](https://github.com/tt-a1i/archify/tree/codex/lab-markdown-outline/experiments/markdown-outline) | 标题与源行号直接转原生 Tree，保留文档层级 | `3f156e97` | [原生 PNG 导出](https://github.com/tt-a1i/archify/blob/codex/lab-markdown-outline/experiments/markdown-outline/screenshots/contributing-export.png) | 8 tests；三样例四阶段通过；公开 CONTRIBUTING.md 17 节点，受限 Markdown 子集 |
| [DBML ERD](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) | 从严格 DBML 子集保留键、关系方向和可空性 | `d0472cc3` | [4 表示例](https://github.com/tt-a1i/archify/blob/codex/lab-dbml-erd/experiments/dbml-erd/screenshots/order-payments.png) | 原39 tests/四阶段证据复用；原创synthetic；新增两完整官方fixture均明确拒绝且无输出，保留约束缺口，未扩parser/执行数据库 |
| [Change coupling](https://github.com/tt-a1i/archify/tree/codex/lab-change-coupling/experiments/change-coupling) | 解释 Code Maat CSV 的对称共变分数及原始计数 | `44dc5cbc` | [原生证据图](https://github.com/tt-a1i/archify/blob/codex/lab-change-coupling/experiments/change-coupling/screenshots/coupling.png) | 13 tests；render/finalize 通过，自动 browser 未请求；synthetic，非调用或因果网络 |
| [Payload delta](https://github.com/tt-a1i/archify/tree/codex/lab-payload-delta/experiments/payload-delta) | 借鉴 PR Lens；把明确提供的 JSON 样本差异放在调用旁，区分 null、missing、类型和数组身份 | `823e8705` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-payload-delta/experiments/payload-delta/screenshots/review.png) | 10 tests；render/finalize 通过，单独 Explainer browser 通过；保留一条段落长度建议，不推断 schema 兼容性 |
| [Decision thread](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) | 保留异议、撤回与单方决定；决定不会抹掉尚未解决的异议 | `bdbdf9a9` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-decision-thread/experiments/decision-thread/screenshots/sequence.png) | 8 tests；两种产物四阶段通过；原创虚构对话，颜色图例已修正，不推断群体共识 |
| [Migration plan](https://github.com/tt-a1i/archify/tree/codex/lab-migration-plan/experiments/migration-plan) | 阅读 pg-schema-diff 已有计划中的顺序、timeout 配置与原始 hazard | `8a4a1cd4` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-migration-plan/experiments/migration-plan/screenshots/migration-plan.png) | 14 tests；render/finalize 通过，自动 browser 未请求；无 SQL/数据库执行，synthetic |
| [State contract](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | 把 robot3-viz flat 数据和显式 sidecar 转为 Lifecycle 与状态×事件声明矩阵 | `cc8c75bc` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-state-contract/experiments/state-contract/screenshots/state-contract.png) | 40 tests；两种产物四阶段通过；rich 语义拒绝，无机器执行，synthetic |
| [Finder canvas matches](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | 输入查询后，列表与画布同步显示匹配节点，保留既有选择与视图 | `94c165ee` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-finder-highlights/experiments/finder-highlights/screenshots/candidate-api-light.png) | 共享 Viewer；作者最终 browser 60/60、core 19/19、generated/ZIP 一致；独立 browser 17/17；有固定输入浅/深色前后图，无效率计时 |
| [CI conditions](https://github.com/tt-a1i/archify/tree/codex/lab-ci-conditions/experiments/ci-conditions) | 固定真实 workflow 的 needs、原始 if、隐式 status 门槛与未知矩阵 | `0ec0b834` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-ci-conditions/experiments/ci-conditions/screenshots/overview.png) | 10 tests；三份产物 finalize 四阶段通过；没有运行 CI 或预测 job 结果 |
| [Plan actions](https://github.com/tt-a1i/archify/tree/codex/lab-plan-actions/experiments/plan-actions) | 分别看两种 replacement 顺序，保留 unknown/sensitive/null 路径与 deferred/complete | `729d3a03` | [官方完整fixture](https://github.com/tt-a1i/archify/blob/codex/lab-plan-actions/experiments/plan-actions/upstream-example/screenshots/explainer.png) | 原16tests复用；官方1资源delete→create完整输入通过，Workflow render/Explainer三阶段通过；before/after值不入输出模型，native字节扫描保留一处静态注释普通词重合；未执行Terraform |
| [Recipe stages](https://github.com/tt-a1i/archify/tree/codex/lab-recipe-stages/experiments/recipe-stages) | Just dump 的 priors 只改一值，直观看出同一依赖由 before 移到 after | `10164864` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-recipe-stages/experiments/recipe-stages/screenshots/priors-2.png) | 10 tests；四份产物四阶段通过；固定上游形状的原创 synthetic，没有执行 Just |
| [Relation reference](https://github.com/tt-a1i/archify/tree/codex/lab-relation-reference/experiments/relation-reference) | 复制当前 pinned 关系的原始方向、标签、节点 ID 与明确身份，便于准确引用 | `6d7cd594` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-relation-reference/experiments/relation-reference/screenshots/candidate-light.png) | 共享 Viewer；focused 62/62，最后 Focus 16/16，core 19/19、generated/ZIP 一致；独立复核；真实 OS clipboard 与用户收益未验证 |
| [Test context map](https://github.com/tt-a1i/archify/tree/codex/lab-test-context-map/experiments/test-context-map) | 精确 context 映射到选择源码行，保留空标签、未知、缺失、排除和不可用 | `9d6b4e3a` | [实跑矩阵](https://github.com/tt-a1i/archify/blob/codex/lab-test-context-map/experiments/test-context-map/measured/screenshots/matrix.png) | 原18 tests复用；新增固定工具实跑原创fixture和逐字段复核；finalize通过，自动browser未请求；sidecar仍是声明，不补造缺失标签 |
| [Test failure map](https://github.com/tt-a1i/archify/tree/codex/lab-test-failure-map/experiments/test-failure-map) | 分开 setup/call/teardown 与 collection，显示提供的行号和缺少的定义文件 | `bb5e7bdb` | [实跑阶段](https://github.com/tt-a1i/archify/blob/codex/lab-test-failure-map/experiments/test-failure-map/measured/screenshots/phases.png) | 11 tests；4旧例四阶段通过，新增2实跑页面finalize通过但自动browser未跑；故意失败exit1/2保留；reader文案收窄、投影不变 |
| [Delta values](https://github.com/tt-a1i/archify/tree/codex/lab-delta-values/experiments/delta-values) | 选中既有 exact row 直接读取 SQL→SQL tx、orders→fraud 等 receipt 事实 | `4c35456b` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-delta-values/experiments/delta-values/screenshots/candidate-persist-order-light.png) | 独立 Delta shell；67 Node tests、5 browser + 独立5、generated/ZIP通过；真实窄屏横滚缺陷已修并保留旧图；不扩 diff 合同 |
| [Source question tour](https://github.com/tt-a1i/archify/tree/codex/lab-source-question-tour/experiments/source-question-tour) | 同5段固定源码按文件/4个问题组织，解释源码版本与Escape条件 | `94d6a4d0` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-source-question-tour/experiments/source-question-tour/screenshots/question-first-overview.png) | 零共享代码；两页finalize通过，自动browser未跑；源码逐字/摘要一致，root实际hover/Tab/Escape与原生图跳转；无效率结论 |
| [Diagnostic locations](https://github.com/tt-a1i/archify/tree/codex/lab-diagnostic-locations/experiments/diagnostic-locations) | 同文诊断显示已有行号/节点/路径，preview保留旧图并指出坏输入 | `67328d7d` | [实际连续预览](https://github.com/tt-a1i/archify/blob/codex/lab-diagnostic-locations/experiments/diagnostic-locations/screenshots/live-preview-needs-fix.png) | 29诊断、19core、2preview、7真实Chrome检查；独立6；JSON字节不变，双ZIP一致；同一浏览器验证rev1→needs-fix |
| [Finder result descriptions](https://github.com/tt-a1i/archify/tree/codex/lab-finder-context/experiments/finder-context) | 8个同名搜索结果通过既有ID/类型/耗时说明获得不同可访问描述 | `5b7701c1` | [实际UI与AX证据](https://github.com/tt-a1i/archify/tree/codex/lab-finder-context/experiments/finder-context/screenshots) | 13browser/toolbar、19core、2generatedfocused、golden/ZIP通过；8条实际AX与键盘选择核实；非VoiceOver/NVDA接受 |
| [Delivery witness](https://github.com/tt-a1i/archify/tree/codex/lab-delivery-witness/experiments/delivery-witness) | 同msgId、同t的两次投递保留seq/dup与原始patch，不以时间去重 | `f2aa251e` | [实际证据页](https://github.com/tt-a1i/archify/blob/codex/lab-delivery-witness/experiments/delivery-witness/screenshots/witness.png) | 零共享代码；固定官方模拟fixture选段；2页四阶段通过，独立源/语义复核；小字与错误图例已修，旧图保留；非本次运行/用户收益 |
| [Waterfall status text](https://github.com/tt-a1i/archify/tree/codex/lab-waterfall-status/experiments/waterfall-status) | 已提供error/cancelled同时显示在行尾、节点说明和可访问名称 | `e20acd6d` | [实际前后图](https://github.com/tt-a1i/archify/tree/codex/lab-waterfall-status/experiments/waterfall-status) | 局部renderer；34focused/core、2产物四阶段、ZIP/package通过；两个旧例byte-identical；实际AX/Passport/浅深色；构造输入，非真人AT |
| [Retained size](https://github.com/tt-a1i/archify/tree/codex/lab-retained-size/experiments/retained-size) | Twiggy自身165B+直接支配子项4B=保留169B，避免跨层重复计数 | `a0c76fc8` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-retained-size/experiments/retained-size/screenshots/explanation.png) | 零共享代码；固定上游golden；Tree四阶段、Explainer三阶段通过/自动browser未跑；单一模型绑定已修，旧图保留；非删减实测 |
| [Lasso witness](https://github.com/tt-a1i/archify/tree/codex/lab-lasso-witness/experiments/lasso-witness) | 三位置反例保留有限前缀和无限后缀的显式闭合入口 | `900fe5a3` | [实际原文与图对照](https://github.com/tt-a1i/archify/tree/codex/lab-lasso-witness/experiments/lasso-witness) | 零共享代码；固定上游选段；3页四阶段通过；实际回环遮挡已通过输入修复，旧图保留；未运行checker/未验证用户收益 |
| [Workflow self-loop](https://github.com/tt-a1i/archify/tree/codex/lab-workflow-self-loop/experiments/workflow-self-loop) | 同一节点同时作为起点和终点，正确外绕回接不再被误拒 | `eb299b15` | [实际回环](https://github.com/tt-a1i/archify/blob/codex/lab-workflow-self-loop/experiments/workflow-self-loop/screenshots/explicit-loop.png) | 局部compiler；145focused/core、独立8、四旧例逐字一致、ZIP/抽包四阶段通过；必要折返守卫，既有auto候选也可用，未扩搜索 |
| [Plan row counts](https://github.com/tt-a1i/archify/tree/codex/lab-plan-row-counts/experiments/plan-row-counts) | 每次平均3行×352循环≈1056次输出，保留局部估计差异 | `91e2ffad` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-plan-row-counts/experiments/plan-row-counts/screenshots/explainer.png) | 零共享代码；固定PEV2样例3节点；Tree四阶段、Explainer三阶段通过/自动browser未跑；非SQL执行/unique rows/调优证明 |
| [Diff line numbers](https://github.com/tt-a1i/archify/tree/codex/lab-diff-line-numbers/experiments/diff-line-numbers) | diff行号保持完整单行，长代码仍可横向滚动 | `88b0dcb0` | [1280px修复后](https://github.com/tt-a1i/archify/blob/codex/lab-diff-line-numbers/experiments/diff-line-numbers/screenshots/candidate-1280-light.png) | 单条CSS；25focused/19core/generated、canonical双ZIP、1280/390浅深8组DOM对照通过；30拆行→0；4实际前后图；完整browsergate未跑，未修改键盘检查 |
| [Keyboard traversal](https://github.com/tt-a1i/archify/tree/codex/lab-keyboard-traversal/experiments/keyboard-traversal) | 纳入实际Tab额外停点，末尾可达控件不再因过早停止被误报 | `d9308631` | [实际第65步到达footer](https://github.com/tt-a1i/archify/blob/codex/lab-keyboard-traversal/experiments/keyboard-traversal/screenshots/tab-65-footer.png) | 最终focused11、v3算法整file19复用、core19、canonical双ZIP/抽包通过；固定HTML四视口均50/50且0诊断；iframe/date/trap/无限焦点边界保留；非PR验收 |

这二十九项均经过另一位 Codex agent 的独立代码/证据复核，协调 agent 实际查看图片。测试数对应各实验自己的 focused tests，不是全仓测试；远端 CI、跨平台验证、实际用户效果与人类验收没有因此自动成立。生成 HTML/Markdown 保留原渲染器或适配器字节；源码 whitespace 检查与生成产物的既有空白分开记录。Payload test 和 State source 各清理了一处无语义影响空白，摘要同时保留实际测试 hash 与当前 hash。

GitHub CI 单独核实：截至 2026-10-25 13:01（台北），前 11 个精确远端 head 的 Actions runs/check-runs 均为 0。当前 [CI 配置](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/.github/workflows/ci.yml) 只对 main/dev push 自动运行，另外支持 PR/manual。这里的实验分支 push 没有提供远端 CI 通过证据；上表测试均按实际本地来源记录。

2026-10-25 13:17（台北）再次核实，main/dev 仍为 `25cf3708` / `82c7e0f0`；新增 CI conditions、Plan actions、Recipe stages、Relation reference 与未推荐 Relation return 的精确 head 也均为 Actions runs=0、check-runs=0。本地证据与远端 CI 始终分开。

2026-10-25 13:37（台北），main/dev未变；Test context map旧head `c02a74fd`、Test failure map旧head `82af4896`、Delta values `4c35456b`、Source question tour `94d6a4d0`、Diagnostic locations `67328d7d`的精确head也均为Actions runs=0、check-runs=0。之后两个测试分支分别补实跑证据到`9d6b4e3a` / `bb5e7bdb`，远端head已核对；新提交未单独查询CI，不沿用旧head作为新CI结论。

2026-10-25 13:56（台北）增量核对：main/dev仍未变；Finder result descriptions `5b7701c1` 与 Delivery witness `f2aa251e` 两个精确远端head同样都是Actions runs=0、check-runs=0。

2026-10-25 14:09:48（台北），main/dev仍未变；Waterfall status text `e20acd6d`、Retained size `a0c76fc8` 及两个补充实跑证据后的head Test context map `9d6b4e3a`、Test failure map `bb5e7bdb` 均核对远端一致，精确head的Actions runs=0、check-runs=0。

2026-10-25 14:26:57（台北），main/dev仍未变；Lasso witness `900fe5a3`、Task review map补充PR证据后 `dcedd538`、Workflow self-loop `eb299b15`、Plan row counts `91e2ffad` 远端head均匹配，精确head的Actions runs=0、check-runs=0。这里不把未运行CI写成通过。

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

2026-10-25 14:56（台北）核对DBML新head `d0472cc3`、Plan actions新head `729d3a03`；15:03核对Diff line numbers `88b0dcb0`：远端head均吻合，Actions runs/check-runs均为0。本地验证不替代远端CI。

2026-10-25 15:26（台北）核对Keyboard traversal `d9308631`：远端head吻合，Actions runs/check-runs均为0；本地浏览器观察与远端CI分别记录。

## 正在推进

| 方向 | 来源与目标 | 状态 |
| --- | --- | --- |
| 新发现修复 | Explainer静态预览的dashed关系可读性 | 已确认同主题关系文字被映为边框色，局部label/path/marker修复实施中，保留节点边框与其他variant |
| 浏览页更新 | 新增两产品修复及两既有分支证据 | 29项新固定快照已完成真实浏览器检查；历史27版证据保留固定提交链接 |
| 既有实验补证据 | DBML与Plan actions | 两项补证据均已推送：官方DBML明确拒绝；完整plan fixture转换通过；各自边界见README |
| 已排除的重复实现 | Mutation报告reader | 原viewer已有文件搜索、状态筛选、diff、测试关联和单HTML打包；只保留研究，不另建reader |
| 保留候选 | Notebook别名与派生值的不同stale预期 | 6项目只读报告完成；目前无实际notebook交接任务，暂不扩成converter |

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
| 符号、调用点与来源证据 | [Symbol evidence small tools](scouts/symbol-evidence-smalltools.md) |
| 图的可访问性、身份与键盘阅读 | [Accessible graph small tools](scouts/accessible-graph-smalltools.md) |
| 执行步骤、消息投递与逻辑顺序 | [Execution reading small tools](scouts/execution-reading-smalltools.md) |
| 数据血缘与变换证据 | [Lineage evidence small tools](scouts/lineage-evidence-smalltools.md) |
| Rust/Go代码阅读与构建解释 | [Native code reading small tools](scouts/native-code-reading-smalltools.md) |
| 离线图交换、关系身份与来源链接 | [Graph exchange small tools](scouts/graph-exchange-smalltools.md) |
| 模型检查反例、位置与循环闭合 | [Model witness small tools](scouts/model-witness-smalltools.md) |
| SQL查询计划与统计口径 | [Query plan small tools](scouts/query-plan-smalltools.md) |
| Notebook别名、物化值与stale证据 | [Notebook evidence small tools](scouts/notebook-evidence-smalltools.md) |
| 组件身份、包坐标与出现位置 | [Component identity small tools](scouts/component-identity-smalltools.md) |
| Mutation状态、源码与测试关联 | [Mutation evidence small tools](scouts/mutation-evidence-smalltools.md) |
| 静态代码路径与步骤位置 | [Codeflow evidence small tools](scouts/codeflow-evidence-smalltools.md) |
| 语法树、冲突与失败位置 | [Grammar reading small tools](scouts/grammar-reading-smalltools.md) |
| 增量构建、缓存与失效传播 | [Rebuild evidence small tools](scouts/rebuild-evidence-smalltools.md) |
| 并发程序的锁序与等待证据 | [Concurrency evidence small tools](scouts/concurrency-evidence-smalltools.md) |
| 编译器优化备注、位置与采样来源 | [Compiler remarks small tools](scouts/compiler-remarks-smalltools.md) |
| 字段offset、padding与对象布局 | [Data layout small tools](scouts/data-layout-smalltools.md) |
| 相邻项目的审阅小动作 | [Adjacent discovery round 2](scouts/adjacent-discovery-round2.md) |
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
