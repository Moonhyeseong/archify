# Archify research continuation · 2026-10-26–27

本批从远程现状开始去重，再为有明确阅读价值的剩余问题制作小实验。用户已授权持续调研、隔离实现、独立 `codex/` 远程分支和适当的 Draft PR；不自动合并、发布版本、部署或安装。此前研究记录中的暂停属于上一轮历史，本次明确继续。

## 开始前核对

- 新实验共同基线：`dev` [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/commit/e837dc4cb83042d2b6c596e039692e25ec62c2da)。其中已含 Explainer reader baseline #1113；旧实验的截图、测试与浏览器失败不改称新基线证据。
- 上一轮总账：[`codex/research-lab-20261025@714c1d3c`](https://github.com/tt-a1i/archify/tree/714c1d3ca691499684a1e89842e3188f85bdabea/docs/research/2026-10-25)，已有 49 项实验。保存了[逐项去重索引](audit/prior-experiments.json)，其 gallery 原始来源可能早于最新远程 head；以本批[远程分支快照](audit/remote-branches.tsv)分别核对。
- GitHub connector 查询只返回前 100 条，随后用分页 API 补齐：本批开始时 [118 个开放 PR](audit/open-prs.tsv)、[121 个开放 issue](audit/open-issues.tsv)。快照是当时状态，不代表后续没有变化。未改动现有贡献者分支。
- 主工作区已有网站赞助等未提交修改；实验使用独立 worktree，未将这些修改混入分支。

## 筛选结果

| 方向 | 具体读者问题 | 去重与成本判断 | 本批决定 |
| --- | --- | --- | --- |
| Task-view：行为路径与测试关联 | 一段改动说明中的哪一步关联了测试源码？哪些步骤没有声明关联？ | 既有 task-review-map 已有真实 Git 引用与遗漏 hunk；但其步骤只是节点数组，没有结构化 flow/test 关联。只读固定 mapping，加有限 sidecar 投影，不复制 Git adapter 或上游 renderer。 | 独立实验 `codex/lab-task-flow-tests`，关联声明与测试执行分开。 |
| ExceptionGroup：打印位置与对象身份 | 同一异常打印两处，是否代表两次错误？group 包含与显式 cause 有何不同？ | 延续上一轮 Round 27 未实现研究。原创 stdlib fixture 实跑，保存 traceback 与对象关系；用现有图和解释页，不增加栈解析器、变量采集或产品 schema。 | 独立实验 `codex/lab-exception-identity`；明确为刻意构造示例，非生产事故。 |
| CodeTour / Codecrumbs | 按理解问题跨文件阅读 | 现有 source-question-tour 已有同源对照；上游 HEAD 与既有固定版本相同。新的页面不能证明理解效率。 | 不新建实验；保留[来源与判断](scouts/ecosystem-refresh.md)。 |
| xyflow 隐藏节点／子图 | 先看模块再看细节 | 已有 Focus/Reach/Lens、Atlas 与相关实验；上游示例未提供折叠聚合边的证据语义，增加成本中等。 | 无新缺口证据，不实施。 |
| tldraw focus mode | 暂时隐藏工具界面 | 当前 Presentation 已覆盖主要阅读任务；SDK 自定义许可另有限制，独立借鉴也没有新价值证据。 | 不引入 SDK，不新建实验。 |

Task-view 确认为 [`gtindo/task-view@f27b8bef63ec336b8e3487e90ccd484a2fa7a235`](https://github.com/gtindo/task-view/tree/f27b8bef63ec336b8e3487e90ccd484a2fa7a235)。本次核对仍是同一源码版本，不能把重新发现当新增能力。项目 MIT 与 vendored ELK 的 EPL-2.0 分别记账；实验只独立实现有限投影，不复制依赖。

两个方向的价值目前是有来源支持的阅读假设。通过产图或自动检查不代表真人阅读更快，也不代表适合直接加入正式产品。各分支应保存输入、实际产物、来源许可、复现命令、失败与验证范围，完成独立检查后再决定是否值得 Draft PR。

## 交付进度

截至 2026-10-27，本批两个方向已分别完成隔离实现、独立复核、真实浏览器检查和远程推送，均为 Draft PR，目标 `dev`。研究总账另存于 `codex/research-lab-20261026`。两项产物复用的产品代码仍是冻结基线 `e837dc4c`；不存在对新产品基线的验证声明。

| 实验 / Draft PR | 独立分支与最终 head | 已完成的证据 | 保留的限制 |
| --- | --- | --- | --- |
| [Exception identity · #1120](https://github.com/tt-a1i/archify/pull/1120) | [`codex/lab-exception-identity`](https://github.com/tt-a1i/archify/tree/codex/lab-exception-identity/experiments/exception-identity) · `daf243ae7f40f4f989894f894bb354c5ec5a5660` | 原创 Python 3.13.16 fixture 实跑；5 项语义测试；showcase finalize 四阶段与四组 capture 通过；独立 review；实际 Finder→inner→cause→outer、Escape、主题切换 | 刻意构造的对象关系，非生产事故或完整运行轨迹；说明卡需滚动；没有读者效率或人类验收结论 |
| [Task flow/tests · #1121](https://github.com/tt-a1i/archify/pull/1121) | [`codex/lab-task-flow-tests`](https://github.com/tt-a1i/archify/tree/codex/lab-task-flow-tests/experiments/task-flow-tests) · `843c877b251baf89925f99e11594fc5630c1c165` | 固定 mapping 原字节复用；9 项测试；finalize 三个静态阶段通过；实际逐步看、测试源码跳转、明暗/390px截图；47次Tab到达页脚 | visual-check 仍失败：四状态共16条 keyboard-traversal 诊断。实际 Tab 证据单列，不覆盖自动失败；历史测试未执行；手机图为带打开入口的小预览 |

### 真实产物图片

![Exception identity：同一对象、两次打印、不同关系](https://raw.githubusercontent.com/tt-a1i/archify/daf243ae7f40f4f989894f894bb354c5ec5a5660/experiments/exception-identity/evidence/root-overview.png)

![Task flow：每一步的测试关联与未执行状态](https://raw.githubusercontent.com/tt-a1i/archify/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests/root-review/overview-light.png)

修正记录也保留在各分支：异常图首次自动通过，但核心次数藏在默认不显示的 tag 中，改为始终可见的 sublabel；测试路径的硬编码摘要被单路径反例推翻，已改为实际输入驱动，并新增相应检查。前稿、失败 TAP、截图和机器诊断没有改成成功。

两个 Draft PR 均附 immutable head 图片与复现入口。创建时远程 CI 仍在运行；#1120 当时部分 package/core/ZIP/website 检查通过，不能据此称完整 CI 通过。下一批应先刷新两个精确 head 的 CI 与反馈，再决定补证或继续筛选。无需重新创建相同研究分支。

研究和实验没有合并、发布版本、部署或安装；持续目标仍在进行。后续依旧先查远程与现有研究，对没有新缺口的项目明确排除，不以新增分支数量代替用户价值。

## 27 日续批

[新的远程快照与逐项排重](audit/20261027-refresh.md) 已计入历史第 50 项 Relation search、开放 #1119 Task checklist 和 #1117 SVG 导出修复。304 条 ref 中有 53 条 `codex/lab-*`：50 项旧 gallery、1 项 deferred prototype、上批自己的 2 项。不会把 ref 数当成已验收成果数。

| 新调研 | 筛选结论 | 制作范围 |
| --- | --- | --- |
| [Perfetto / Speedscope / Catapult](scouts/async-trace-reading.md) | 找到公开历史 trace 的明确 s/f 端点，能展示 flow 关联、嵌套与时间先后的区别；不是再做 X 区间投影。 | [Draft #1122](https://github.com/tt-a1i/archify/pull/1122)：6 条固定来源记录与一个明确关联，保留全件摘要、未投影范围及来源许可；端点差不称排队或 CPU 时间。 |
| [dive / container-diff / nix-tree / OCI](scouts/layer-and-closure-reading.md) | 保留 whiteout 的下层作用范围问题；Nix 共享闭包与已有 retained-size 重复，排除。 | [Draft #1123](https://github.com/tt-a1i/archify/pull/1123)：原创两层 tar 的实测成员清单，加明确标注为规范推导的可见性；不运行容器，不写 unpacker。 |

本轮内容例使用现有图和 Explainer，不改共享 Viewer 或 schema。源码、第一稿、语义核对与真实页面观察已完成后推送，四个实验分支和 `dev` 都用 `git ls-remote` 核对身份。新建 PR 时 CI 尚无结论，Draft 与用户接受仍是分开的状态。

| 新实验 | 最终远程 head | 实际证据与保留的失败 |
| --- | --- | --- |
| [codex/lab-trace-flow-evidence](https://github.com/tt-a1i/archify/tree/codex/lab-trace-flow-evidence/experiments/trace-flow-evidence) | `9f9f9dacf58832f1c8784a1a24f6e04c456a4881` | 完整 Catapult 原件与 BSD 通知；6 项语义测试及独立复跑；三静态门通过；visual-check 保留 12 条键盘诊断。root 实际逐步看、下一步、结束、来源跳转，Tab 31–33 到达来源/页脚；1440 明暗、390 深色，窄屏页面无横向溢出。 |
| [codex/lab-oci-whiteouts](https://github.com/tt-a1i/archify/tree/codex/lab-oci-whiteouts/experiments/oci-whiteouts) | `5f37aaa707567a4004317cad12fc4c02cb2f27b6` | 原创 tar 与完整 inventory；7 项检查及独立复跑；native 四门、Explainer 三静态门通过；额外浏览器门保留 16 条键盘诊断。root 实际打开图/Escape 焦点返回，Tab 32–36 到达复制/来源/页脚；1440 明暗、390 明暗。 |

两项最后的提交只添加 root 图片、记录与文档。独立源码审查分别绑定 `05f2f243` / `2db99eb8`；对应最终 HTML SHA 仍为 `4cc2274999e58b9f75b717c053528a85964e3545b3cb0a8fe638b8cdf246dff1` / `5b4790c282740cf6d94e71e4b072ad7a3d2b5daab90228e73340c2d716815043`。实际截图不能覆盖键盘门失败，也没有读者效率、真人 AT 或容器执行结论。

![Trace：明确记录的 flow 关联](https://raw.githubusercontent.com/tt-a1i/archify/9f9f9dacf58832f1c8784a1a24f6e04c456a4881/experiments/trace-flow-evidence/root-review/final-light.png)

![OCI：下层被隐藏，同层新增保留](https://raw.githubusercontent.com/tt-a1i/archify/5f37aaa707567a4004317cad12fc4c02cb2f27b6/experiments/oci-whiteouts/root-review/final-light.png)

### 上批 CI 跟进

[本轮第一次完整检查快照](audit/ci-first-refresh-20261027.json)：#1120 的精确 head 有 19 项成功，两个部署任务跳过；CodeRabbit 只报告 Draft 跳过 review。#1121 的 `browser-regression (2)` 失败于共享 Sequence 的 1396×480 短视口首屏 containment，[原失败摘录](audit/task-flow-ci-failure.log) 与[只读诊断](audit/task-flow-ci-diagnosis.md)保存。

#1121 产品、测试、依赖与同样基线上的 #1120 对应路径相同，且测试不读实验输入。本地 exact-head 的 Reader Layout 文件 18/18 通过（17 个 nested subtests 加 parent）；这不能证明已知竞态或覆盖 hosted 红灯。仅尝试重跑失败 job 时远端返回 `job cannot be rerun`，workflow 的 webm-decode 仍在运行；未修改共享代码或启动全套重跑。后续刷新该 run 完成状态后再判断是否能执行单 job 重跑，不把未执行记作通过。

## 27 日第三批：约束阅读与复用已有候选

开始先刷新远程，`dev` 仍为 `e837dc4c`，历史 gallery 的第 50 项 Relation search 已计入排重。收尾时再次保存[306 条远程分支](audit/remote-branches-round3.tsv)、[124 个开放 PR](audit/open-prs-round3.tsv)和[122 个开放 issue](audit/open-issues-round3.tsv)。其中 56 条 `codex/lab-*` 包含历史候选与本批实验，不能当成 56 个已验收能力。

| 调研 | 判断与实际交付 |
| --- | --- |
| [Porcupine / Knossos / Elle](scouts/operation-history-reading.md) | 选 Porcupine 固定 README 的三操作说明例做同源对照。区分实时先后和模型推导，不把区间重叠当因果，不将上游声明的 checker 结果称为本轮执行。 |
| [ESLint Config Inspector / ripgrep ignore](scouts/rule-matching-reading.md) | 找到“匹配否定 glob，但最终没有配置”的具体问题；原工具已有相应阅读入口，目前没有额外价值证据，不新建实现。 |

[操作顺序实验](https://github.com/tt-a1i/archify/tree/4d0d21c6db1530e274fc1b0487ce65329c4574de/experiments/operation-order)已推送到独立 `codex/lab-operation-order`，head `4d0d21c6db1530e274fc1b0487ce65329c4574de`。两版共享六事件、模型、三句解释与枚举表；图版只增加三条约束成环的面板。固定原文、MIT 许可、首稿、独立语义复核、可复现命令、两份 HTML、八张实际截图及便携证据均保留。

两版 finalize 三静态门与独立 browser-check 通过，写作提示保留。实际 1440×900 比较：文字页高 1526px / 156572 bytes，图版 1805px / 541210 bytes；多出 279px 与 384638 bytes。390px 下文字直接可读，图预览需要打开交互图才能细看。原生图默认“后端”图例也不适合操作节点。图能表达矛盾，但没有证据表明它胜过三句文字；本轮保留对照分支，暂不开 Draft PR，不增加共享功能。独立审查绑定 `ef3e751c`，最后提交只添加证据和文档，HTML 字节保持一致。

![三条不同依据的顺序约束组成矛盾](https://raw.githubusercontent.com/tt-a1i/archify/4d0d21c6db1530e274fc1b0487ce65329c4574de/experiments/operation-order/root-review/candidate-constraints-light.png)

已有远程 `codex/lab-keyboard-traversal@c96e8aa7` 被用于[三份冻结 HTML 的限定验证](audit/keyboard-current-artifacts.md)：Task 40/40、Trace 27/27、OCI 29/29 必达目标均通过，四种视口/主题状态零诊断，原 HTML 前后相同。该结果证明旧候选能处理这些输入，不表示当前 dev 已集成；原来的 16/12/16 条失败继续保留。没有创建重复修复分支。临时 validation worktree 已归档，原始回执留在外部目录，公开的派生摘要和原件 SHA 已入库。

### 精确 head 的 CI 与反馈

[第二次完整快照](audit/ci-second-refresh-20261027.json)中，#1120、#1122、#1123 各有 19 项成功、2 个部署任务跳过。#1121 有 16 项成功、`browser-regression (2)` 失败、`webm-decode` 运行中。仅重跑失败 job 的先前请求未成功，此轮没有再次提交；继续等待 workflow 完成状态后再判断。四个 PR 的讨论均只有 CodeRabbit 的 Draft 跳过通知，没有新的人类反馈或实质审查结论。

本轮继续保持目标 active。下一步先刷新已有 PR 的精确 head 与 CI，再筛选新的阅读缺口；不把重复调研、图能生成或 CI 绿灯当作用户价值证明。

AI assistance：Codex（GPT-6.1-Terra 与 GPT-6.1-Sol 子代理）参与调研、实验实现、验证和文档；本记录不声称维护者已完成个人审查或验收。
