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

AI assistance：Codex（GPT-6.1-Sol 子代理）参与调研、实验实现、验证和文档；本记录不声称维护者已完成个人审查或验收。
