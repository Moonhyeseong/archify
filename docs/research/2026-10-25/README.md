# Archify 持续探索与实验分支

2026-10-25 启动。项目维护者要求持续寻找代码理解、图形表达与交互阅读项目，把有价值的点做成独立远程分支，附真实产物图片供审阅；直到维护者明确说停才停止。完成某一批并不结束目标。

**星数不作为门槛或排序依据。** 每个方向都看实际问题、现有能力、维护成本和来源证据；小项目、早期项目同样纳入。与已有 issue/PR 重复的方向先排除或明确剩余差异。

前 30 项首次产出的共同实验基线：[dev `82c7e0f0`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)。2026-10-25 15:41（台北）重新核对 GitHub，dev 已推进到 [`3f95f034`](https://github.com/tt-a1i/archify/commit/3f95f0349c8276db71509ca239461b6fe9d00f9f)，main 为 [`51a29177`](https://github.com/tt-a1i/archify/commit/51a291770851ad27a400cca73c753c166b5e0c65)，分别合入 #1098 / #1099 的 Apache-2.0 与软件声明更新。已有产物及测试继续绑定原基线，不能据此宣称已验证新 dev；后续新实验从更新后的 dev 开始；DBML后续更新已纳入新dev，版本与证据另列。下面的“已推送”只表示远程实验分支可审查，不能等同于合入、发布或人类验收。

同次 GitHub 核对中，#1098 / #1099 分别于 15:36:06 / 15:36:19（台北）合入；最新正式 Release 仍为 [v3.2.0](https://github.com/tt-a1i/archify/releases/tag/v3.2.0)（2026-10-19 发布）。分支更新不等于新版本发布。

2026-10-25 16:18（台北）再次核对：dev 已合入 [#1100](https://github.com/tt-a1i/archify/pull/1100)，推进到 [`67f12389`](https://github.com/tt-a1i/archify/commit/67f12389212c54b3122da60e2813c7f8dab7ab2f)，main 仍为 `51a29177`。这次修改 finalize 的源码范围修复、候选文件保留及相关交付逻辑；Copy identity、CLI reading tour 和 Clipboard outcome 保留实际冻结的 `3f95f034` 基线，不把既有结果改称新 dev 验证。

## 已推送的 35 个实验

分支里的 README 含实际图片、原始/示例输入、生成 JSON/HTML、复现命令、来源许可与验证边界。

[离线图片浏览页](gallery/README.md)：当前固定快照含34项的34张原始PNG，可按分组和关键词筛选、展开完整图；下载`gallery/index.html`后可独立打开。已加入Byte views，并将State/Recipe主图换为官方fixture实导出/实际Just dump。固定提交和图片摘要见manifest；本版桌面与390px浅深色、三项完整图和筛选均经过实际检查，七张截图已查看。历史33/29/27快照及各自证据继续按固定提交保留。第35项Source keyboard activation见下表；待两项旧候选刷新完成后，统一更新下一版画廊。

| 实验与远程分支 | 具体价值 | 发布 revision | 实际图片 | 验证与限制 |
| --- | --- | --- | --- | --- |
| [Task review map](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map) | 固定Git改动对应独立声明；真实PR #1097的5hunk已记账与ZIP未解析并列 | `dcedd538` | [真实PR前后布局](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map/pr-1097) | 原15 tests复用；新增完整4文件证据，映射exit1；只手工改9坐标修阅读性，原输出保留；3静态gate通过，仍30键盘诊断；未跑PR代码 |
| [Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) | 把 dependency-cruiser 已有报告变成局部原生图，保留未解析与视图外账目 | `2be2ab55` | [官方样例](https://github.com/tt-a1i/archify/blob/codex/lab-dependency-map/experiments/dependency-map/screenshots/official.png) | 6 tests；两图 finalize 四阶段通过；synthetic 的三条绕行建议仍保留 |
| [Trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) | 把真实采集的 Chrome X 格式操作区间变成可分享瀑布图 | `8e65f150` | [真实采集](https://github.com/tt-a1i/archify/blob/codex/lab-trace-waterfall/experiments/trace-waterfall/screenshots/workload.png) | 9 tests；四阶段通过；仅 X 子集，不推断调用树或关键路径 |
| [Markdown outline](https://github.com/tt-a1i/archify/tree/codex/lab-markdown-outline/experiments/markdown-outline) | 标题与源行号直接转原生 Tree，保留文档层级 | `3f156e97` | [原生 PNG 导出](https://github.com/tt-a1i/archify/blob/codex/lab-markdown-outline/experiments/markdown-outline/screenshots/contributing-export.png) | 8 tests；三样例四阶段通过；公开 CONTRIBUTING.md 17 节点，受限 Markdown 子集 |
| [DBML ERD](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) | 保留键、关系方向和可空性；接受官方primary key同义写法 | `358c77e0` | [官方主键示例](https://github.com/tt-a1i/archify/blob/codex/lab-dbml-erd/experiments/dbml-erd/primary-key-acceptance/screenshots/primary-key.png) | 已纳新dev；49focused、旧parser两新例失败/新版本通过；完整36B官方输入接受与四阶段通过，127B simple-table仍拒绝；旧拒绝与4表证据不变；未执行数据库 |
| [Change coupling](https://github.com/tt-a1i/archify/tree/codex/lab-change-coupling/experiments/change-coupling) | 解释 Code Maat CSV 的对称共变分数及原始计数 | `44dc5cbc` | [原生证据图](https://github.com/tt-a1i/archify/blob/codex/lab-change-coupling/experiments/change-coupling/screenshots/coupling.png) | 13 tests；原生图仅render，Explainer finalize通过/browser未请求；synthetic，非调用或因果网络 |
| [Payload delta](https://github.com/tt-a1i/archify/tree/codex/lab-payload-delta/experiments/payload-delta) | 借鉴 PR Lens；把明确提供的 JSON 样本差异放在调用旁，区分 null、missing、类型和数组身份 | `823e8705` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-payload-delta/experiments/payload-delta/screenshots/review.png) | 10 tests；render/finalize 通过，单独 Explainer browser 通过；保留一条段落长度建议，不推断 schema 兼容性 |
| [Decision thread](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) | 保留异议、撤回与单方决定；决定不会抹掉尚未解决的异议 | `bdbdf9a9` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-decision-thread/experiments/decision-thread/screenshots/sequence.png) | 8 tests；两种产物四阶段通过；原创虚构对话，颜色图例已修正，不推断群体共识 |
| [Migration plan](https://github.com/tt-a1i/archify/tree/codex/lab-migration-plan/experiments/migration-plan) | 阅读 pg-schema-diff 已有计划中的顺序、timeout 配置与原始 hazard | `b9fe3b9b` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-migration-plan/experiments/migration-plan/screenshots/migration-plan.png) | 14 tests；Workflow仅render，Explainer finalize通过/browser未请求；无 SQL/数据库执行，synthetic；新提交仅澄清文案 |
| [State contract](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | 固定官方机器定义实导出，再核两个观察到的toggle声明 | `f7269e09` | [官方fixture实导出](https://github.com/tt-a1i/archify/blob/codex/lab-state-contract/experiments/state-contract/measured/screenshots/explainer-overview.png) | 补证基线67f；40focused、原版getDAG实导出2状态2边、两页四阶段通过；2declared/0undeclared仅观察事件集；没有运行事件/回调；旧synthetic/rich拒绝记录保留 |
| [Finder canvas matches](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | 输入查询后，列表与画布同步显示匹配节点，保留既有选择与视图 | `94c165ee` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-finder-highlights/experiments/finder-highlights/screenshots/candidate-api-light.png) | 共享 Viewer；作者最终 browser 60/60、core 19/19、generated/ZIP 一致；独立 browser 17/17；有固定输入浅/深色前后图，无效率计时 |
| [CI conditions](https://github.com/tt-a1i/archify/tree/codex/lab-ci-conditions/experiments/ci-conditions) | 固定真实 workflow 的 needs、原始 if、隐式 status 门槛与未知矩阵 | `0ec0b834` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-ci-conditions/experiments/ci-conditions/screenshots/overview.png) | 10 tests；三份产物 finalize 四阶段通过；没有运行 CI 或预测 job 结果 |
| [Plan actions](https://github.com/tt-a1i/archify/tree/codex/lab-plan-actions/experiments/plan-actions) | 分别看两种 replacement 顺序，保留 unknown/sensitive/null 路径与 deferred/complete | `729d3a03` | [官方完整fixture](https://github.com/tt-a1i/archify/blob/codex/lab-plan-actions/experiments/plan-actions/upstream-example/screenshots/explainer.png) | 原16tests复用；官方1资源delete→create完整输入通过，Workflow render/Explainer三阶段通过；before/after值不入输出模型，native字节扫描保留一处静态注释普通词重合；未执行Terraform |
| [Recipe stages](https://github.com/tt-a1i/archify/tree/codex/lab-recipe-stages/experiments/recipe-stages) | 官方Just dump保留priors边界：a在空主体b前，c在后 | `062dee5d` | [实际工具输出解释页](https://github.com/tt-a1i/archify/blob/codex/lab-recipe-stages/experiments/recipe-stages/measured/screenshots/explainer-overview.png) | 补证基线67f；官方test有效输入实dump、10tests、两页四阶段通过；自然完整示例因assignments拒绝；公开副本只改/source并保留真实输入sha区别；无recipe执行，旧synthetic不变 |
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
| [Preview dashed ink](https://github.com/tt-a1i/archify/tree/codex/lab-preview-dashed-ink/experiments/preview-dashed-ink) | Explainer预览的虚线关系文字、线和箭头使用可读颜色，保留节点边框 | `36cc35fb` | [浅色修复后](https://github.com/tt-a1i/archify/blob/codex/lab-preview-dashed-ink/experiments/preview-dashed-ink/screenshots/candidate-light.png) | 3条CSS映射；2browser/56focused、基线失败、候选四阶段及抽包通过；4张实际浅深对照图；4份旧生成物的既有freshness更新单列，不称全模式可访问性验收 |
| [Copy identity](https://github.com/tt-a1i/archify/tree/codex/lab-copy-identity/experiments/copy-identity) | 内容相等仍可能共享不同对象：别名、浅拷贝、深拷贝的引用对照 | `18d51b89` | [实际引用图](https://github.com/tt-a1i/archify/blob/codex/lab-copy-identity/experiments/copy-identity/screenshots/native.png) | 新dev3f95；标准库独立观察4变量/7list/10引用、6内容检查、两产物四阶段通过；3张实际图；上游教学构造，未运行上游工具/未观察整个heap |
| [CLI reading tour](https://github.com/tt-a1i/archify/tree/codex/lab-cli-reading-tour/experiments/cli-reading-tour) | 沿真实源码区分三个CLI出口、磁盘JSON、HTTP快照与用户启动 | `1dff88d3` | [实际阅读页](https://github.com/tt-a1i/archify/blob/codex/lab-cli-reading-tour/experiments/cli-reading-tour/screenshots/overview.png) | 新dev3f95；7固定源、11SourceCards、10节点9边；三静态阶段通过/自动browser未请求；实际Walk、hover/Escape及3图；未运行上游服务或scanner |
| [Clipboard outcome](https://github.com/tt-a1i/archify/tree/codex/lab-clipboard-outcome/experiments/clipboard-outcome) | 复制不可用时保留可选择的内容，恢复后重试不重复包装问题 | `68866954` | [实际失败恢复](https://github.com/tt-a1i/archify/blob/codex/lab-clipboard-outcome/experiments/clipboard-outcome/screenshots/missing-ask-candidate.png) | 基线3f95；8种API边界、邻近32/core19、canonical双ZIP/抽包通过；同一真实PR输入基线/候选三阶段通过；API受控注入实测，未写OS clipboard；自动browser未请求 |
| [Byte views](https://github.com/tt-a1i/archify/tree/codex/lab-byte-views/experiments/byte-views) | 分清IHDR的25B物理字段与已有type内的4个bit解释，避免重复求和 | `b844ecb2` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-byte-views/experiments/byte-views/screenshots/explainer-overview.png) | 固定67f；完整97B官方fixture/golden、独立字节观察8事实检查；Tree四阶段/Explainer三静态阶段通过，root四图及citation hover/Escape；未运行fq/CRC/解压 |
| [Source keyboard activation](https://github.com/tt-a1i/archify/tree/codex/lab-source-keyboard/experiments/source-keyboard) | 同一源码预览节点的Enter/Space执行已有鼠标开原图动作，AX提供button语义 | `d81830d3` | [实际Enter打开结果](https://github.com/tt-a1i/archify/blob/codex/lab-source-keyboard/experiments/source-keyboard/screenshots/candidate-enter-viewer.png) | 基线10b4；6browser/15renderer/19core、生成/235项ZIP通过；真实前后AX/按键/返回与5图；Tab及focus原本已有，误判已撤回；4docs继承freshness单列，无AT接受 |

这三十三项均经过另一位 Codex agent 的独立代码/证据复核，协调 agent 实际查看图片。测试数对应各实验自己的 focused tests，不是全仓测试；远端 CI、跨平台验证、实际用户效果与人类验收没有因此自动成立。生成 HTML/Markdown 保留原渲染器或适配器字节；源码 whitespace 检查与生成产物的既有空白分开记录。Payload test 和 State source 各清理了一处无语义影响空白，摘要同时保留实际测试 hash 与当前 hash。

GitHub CI 单独核实：截至 2026-10-25 13:01（台北），前 11 个精确远端 head 的 Actions runs/check-runs 均为 0。当前 [CI 配置](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/.github/workflows/ci.yml) 只对 main/dev push 自动运行，另外支持 PR/manual。这里的实验分支 push 没有提供远端 CI 通过证据；上表测试均按实际本地来源记录。

2026-10-25 13:17（台北）再次核实，main/dev 仍为 `25cf3708` / `82c7e0f0`；新增 CI conditions、Plan actions、Recipe stages、Relation reference 与未推荐 Relation return 的精确 head 也均为 Actions runs=0、check-runs=0。本地证据与远端 CI 始终分开。

2026-10-25 13:37（台北），main/dev未变；Test context map旧head `c02a74fd`、Test failure map旧head `82af4896`、Delta values `4c35456b`、Source question tour `94d6a4d0`、Diagnostic locations `67328d7d`的精确head也均为Actions runs=0、check-runs=0。之后两个测试分支分别补实跑证据到`9d6b4e3a` / `bb5e7bdb`，远端head已核对；新提交未单独查询CI，不沿用旧head作为新CI结论。

2026-10-25 13:56（台北）增量核对：main/dev仍未变；Finder result descriptions `5b7701c1` 与 Delivery witness `f2aa251e` 两个精确远端head同样都是Actions runs=0、check-runs=0。

2026-10-25 14:09:48（台北），main/dev仍未变；Waterfall status text `e20acd6d`、Retained size `a0c76fc8` 及两个补充实跑证据后的head Test context map `9d6b4e3a`、Test failure map `bb5e7bdb` 均核对远端一致，精确head的Actions runs=0、check-runs=0。

2026-10-25 14:26:57（台北），main/dev仍未变；Lasso witness `900fe5a3`、Task review map补充PR证据后 `dcedd538`、Workflow self-loop `eb299b15`、Plan row counts `91e2ffad` 远端head均匹配，精确head的Actions runs=0、check-runs=0。这里不把未运行CI写成通过。

## 图片速览

以下四张直接来自对应分支的实际产物。点击名称查看完整说明；其余实验的图片见上表。

| [Finder：搜索对应画布节点](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | [DBML：原四表 synthetic 键与关系](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) |
| --- | --- |
| <img width="540" alt="Finder：搜索对应画布节点 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/94c165ee6e5213c67e37a75a0b04496564980801/experiments/finder-highlights/screenshots/candidate-api-light.png"> | <img width="540" alt="DBML：原四表 synthetic 键与关系 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/feab6ae685692630d6d837622dc7bdcb57a09679/experiments/dbml-erd/screenshots/order-payments.png"> |

| [State：官方fixture实导出](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | [Decision：保留异议](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) |
| --- | --- |
| <img width="540" alt="State：官方fixture实导出 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/f7269e096ac1891b434842cf7e16b9ffdd54cdf6/experiments/state-contract/measured/screenshots/explainer-overview.png"> | <img width="540" alt="Decision：保留异议 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/bdbdf9a9b5b97c556c5f85547279021b7446a05c/experiments/decision-thread/screenshots/sequence.png"> |

## 保留证据但暂不推荐的原型

[Relation return 分支](https://github.com/tt-a1i/archify/tree/codex/lab-relation-return/experiments/relation-return)（`e323d30f`）保留实际前后 HTML、[截图](https://github.com/tt-a1i/archify/blob/codex/lab-relation-return/experiments/relation-return/screenshots/candidate-destination-light.png)、可应用的候选 patch 与验证摘要。该分支只新增实验文件，**没有共享 Viewer 产品改动**。

在原有 production-deployment 图中，目标 Passport 的 Incoming 行本来就能一步回到来源；新增 Back 按钮同样是一步。既有代表性 Architecture 样例的检查也未找到来源行因长列表而被遮挡的实证。56/56 focused 与独立 18/18 Focus 说明兼容性边界，不能说明更好用，因此暂不引入额外状态和按钮；不为证明收益而另造极端场景。

[390px图内导航实测](evidence/mobile-nav/README.md)：横滚后全部缩放控件可命中，实际100%→125%，因此不把初始裁剪误作不可用，也不新增布局分支。物理触屏和可发现性尚未验证。

2026-10-25 14:56（台北）核对DBML新head `d0472cc3`、Plan actions新head `729d3a03`；15:03核对Diff line numbers `88b0dcb0`：远端head均吻合，Actions runs/check-runs均为0。本地验证不替代远端CI。

2026-10-25 15:26（台北）核对Keyboard traversal `d9308631`：远端head吻合，Actions runs/check-runs均为0；本地浏览器观察与远端CI分别记录。

2026-10-25 15:41（台北）核对Preview dashed ink `36cc35fb`：远端head吻合，Actions runs/check-runs均为0。此次同时发现main/dev已更新，旧基线证据保留原身份。

2026-10-25 16:08核对DBML新head `358c77e0`；16:18核对Copy identity `18d51b89` 与CLI reading tour `1dff88d3`，远端head均一致，Actions runs/check-runs均为0。Migration plan的 `b9fe3b9b` 只澄清render/finalize所属产物，旧测试/图片不变。

2026-10-25 16:30:20（台北）核对Clipboard outcome `68866954`：远端head一致，Actions runs/check-runs均为0；受控浏览器API实测与OS clipboard验收分开。

2026-10-25 16:35的[GitHub状态与查重](github-status-1635.md)确认main/dev未再变；dev精确head CI成功，main测试完成但部署仍等待。新draft #1103与#1102的已有工作已列入下一轮查重，不把它们当成dev已合入能力。

2026-10-25 16:50–16:53再次核main/dev未变；PR #1102 head `98efbfcb`已转非draft但仍OPEN未合入，精确head Actions CI成功、CodeRabbit尚pending。相对先前`3b5b16c0`只改n8n图JSON/HTML，不与当前State/Recipe补证源码交叉。

2026-10-25 17:02:57核State contract新head `f7269e09`：已纳固定dev67f，远端head一致，Actions runs/check-runs均为0；本地真实导出与两产物四阶段通过分开记账。

2026-10-25 17:17:13核Recipe stages新head `062dee5d`：已纳固定dev67f，远端head一致，Actions runs/check-runs均为0。17:15重新核GitHub main/dev仍为51a29177/67f12389。

2026-10-25 17:30:01核Byte views新head `b844ecb2`：远端head一致，Actions runs/check-runs均为0。该产物和截图仍绑定67f；17:29核GitHub dev已推进到 `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`（#1102合入），main仍51a29177，后续新实验从新dev开始；[范围核对](base-refresh-1731.md)记录Viewer/Explainer/finalize影响与精确dev CI。已有分支产物不因此自动获得新dev验证。

2026-10-25 18:07:06核Source keyboard activation `d81830d3`：远端head一致，Actions runs/check-runs均为0，本地验证与远端CI分列。17:59:53重新查GitHub，dev仍10b4、main仍51a29177，latest Release仍v3.2.0（2026-10-19发布）。

## 正在推进

| 方向 | 来源与目标 | 状态 |
| --- | --- | --- |
| 新内容实验 | fq字节区间与位解释视图 | byte-views已推b844ecb2，计入第34项；完整97B官方fixture/golden与四张真实截图，冻结67f基线 |
| 新产品实验 | source-only图节点的键盘激活 | d81830d3已推，计入第35项；真实基线可Tab但Enter/Space不激活，候选补等价动作与button角色；5图及独立审查完成 |
| 已有候选刷新 | Diff行号 / Preview虚线文字 | 两条既有分支已在本地整合固定dev10b4，新同输入前后图/包/直接测试完成，正在最后审查，尚未推送新head |
| 新一轮发现 | 调试回放与图内标注阅读 | 第7轮14个新来源，4个深入源码；本轮0直接实施建议，保留具体再评估条件；图节点到来源的键盘交接正在核查 |
| 既有实验真实输出 | Recipe stages / State contract | State官方fixture实导出已推f7269e09；Recipe官方test有效输入dump已推062dee5d，自然完整示例拒绝并保留；历史synthetic不改称实跑 |
| 新发现修复 | Explainer复制结果与手工恢复 | Clipboard outcome已推送68866954，来源、基线/候选和实际截图见第33项 |
| 浏览页更新 | 第35项及两项CSS候选的新基线图片 | 当前固定34版完整可用；待两项刷新分支发布后一起生成35版，不把当前19项浏览器观察自动算到下一版 |
| 既有实验补证据 | DBML与Plan actions | DBML已补上primary key同义写法接受；原拒绝记录保留；完整plan fixture转换证据不变 |
| 已排除的重复实现 | Mutation报告reader | 原viewer已有文件搜索、状态筛选、diff、测试关联和单HTML打包；只保留研究，不另建reader |
| 新dev影响核对 | 许可声明与finalize源范围修复 | [15:41迁移](base-refresh-1541.md) / [16:18交付逻辑](base-refresh-1618.md)：分别核对实际diff；旧证据保留原身份，新整合按影响验证 |
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
| 真实入口流程与仓库导读 | [Repository orientation small tools](scouts/repository-orientation-smalltools.md) |
| 值、对象身份与局部计算解释 | [Visual explanation small tools](scouts/visual-explanation-smalltools.md) |
| 渐进解释、分叉判断与表达式上下文 | [Adjacent discovery round 3](scouts/adjacent-discovery-round3.md) |
| 范围比较与条件上下文 | [Code-reading utilities round 4](scouts/code-reading-utilities-round4.md) |
| 代码导航与多调用点 | [Code navigation round 5](scouts/code-navigation-round5.md) |
| 折叠状态、汇总边与层级阅读 | [Graph reading round 5](scouts/graph-reading-round5.md) |
| 比较策略、移动身份与空白阅读 | [Comparison reading round 5](scouts/comparison-reading-round5.md) |
| 既有来源、diff、code块静态窄核 | [Source block reading audit](scouts/source-block-reading-audit.md) |
| 字节范围、位字段与重叠解释 | [Binary reading round 6](scouts/binary-reading-round6.md) |
| Git父关系与图中路由点 | [Git graph reading round 6](scouts/git-graph-reading-round6.md) |
| 调试缓冲、栈补齐与重新执行 | [Debugging reading round 7](scouts/debugging-reading-round7.md) |
| 标注、完整文字与局部导出 | [Annotation reading round 7](scouts/annotation-reading-round7.md) |
| 新dev与11项产品候选的行为交集 | [Product overlap at dev10b4](scouts/product-overlap-dev-1731.md) |
| 图节点、来源卡与键盘交接的实际缺口 | [Reading handoff audit](scouts/reading-handoff-audit.md) |
| 类型展开、回指与求解候选 | [Type reading round 8](scouts/type-reading-round8.md) |
| 匹配过程、接受条件与截断 | [Matching reading round 8](scouts/matching-reading-round8.md) |
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
