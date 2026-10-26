# 2026-10-26 持续探索恢复索引

今日曾按用户要求恢复；昨日49项批次暂停和今日恢复均保留为历史。**按最新要求收尾本批后暂停，当前只补第50项gallery，不启动新研究或实施；尚未完成收尾，不提前记作已暂停。**[历史主索引与全部50个已推实验](../2026-10-25/README.md)继续作为总账。本日报初次索引收尾时间点为 `2026-10-26T05:48:55Z`；当前仍在本批收尾阶段，不表示目标完成或已暂停。

本轮只读研究先给出0个已证实值得实施的新候选，图关系报告只保留一个可证伪的问题。协调者随后在现成Web App与RAG图上实际比较既有入口，才选定第50项Relation search；这是已有示例上的有界复现与实验选择，不是自然发生的用户痛点或效率收益证明。

| 本轮来源 | 结论与边界 |
| --- | --- |
| [GitHub状态](github-status.md) | dev推进至 `e837dc4cb83042d2b6c596e039692e25ec62c2da`；Atlas、移动阅读、输出介质、长描述等开放工作分别排重，不将draft或green CI当已集成 |
| [代码导航](scouts/code-navigation.md) | 同符号强调与位置历史预览的静态研究，0实施候选 |
| [图与关系检查](scouts/graph-inspection.md) | 保留“已知关系含义、不知端点”的待验证问题；静态索引缺项本身不是用户痛点 |
| [已知项目增量](scouts/named-project-refresh.md) | task-view未前进；PR Lens提交增量不自动构成新阅读功能；未执行或复制上游 |

## 第50项：Relation search

固定远端分支：[`codex/lab-relation-search`](https://github.com/tt-a1i/archify/tree/codex/lab-relation-search)，精确head `e87a858d220c25c97aee4b5920cf59ab77723b41`，基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。协调者报告远端精确一致且工作区clean、独立终审READY；[固定实验说明](https://github.com/tt-a1i/archify/blob/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/README.md)保留来源、测试、实际观察与失败边界。

![实际enqueue关系检索截图](https://raw.githubusercontent.com/tt-a1i/archify/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/screenshots/candidate-enqueue.png)

按关系label或ID直接查找，结果显示两端并调用已有精确pin。空查询仍浏览node，Route端点与受限入口保持node-only。root实际操作中，`enqueue`从base的0节点结果变为candidate的1关系；Enter精确pin `enqueue-job`。RAG的`ANN search`、`grounded answer`、`parsed text`分别选中既有精确关系ID；Route实际操作仍通过。base直接点线已可pin，因此这是新增查询入口，不是修复关系检查。root查看5张原始PNG，8份原始safe观察按实验记录绑定。

行为借鉴 `lambdasistemi/graph-browser` 的固定源码；该上游未见LICENSE，只借鉴行为、独立编写Archify代码，没有复制实现。

验证：Finder9、Focus/Route22、locale37、core19通过；Semantic5pass/1skip，generated与ZIP/macOS抽包smoke通过。主authored SVG与base均为29,943B，SHA-256 `902de0677920b4e320ea54061a998a7120286248c79999eeac2bd4eb49f4f8a8`，不推断运行时camera或像素相同。生成RAG HTML保留来自base模板的15条空白warning，其他源码scoped check通过，不能称full whitespace clean。无移动、真人AT、全平台或效率证据；精确head Actions runs=0、check-runs=0，不能称远端CI绿，也未合入、发布、部署或安装。

## 图片总览边界

原49项gallery继续绑定source hub `735250ac02664b1d6cd4c5f6f63d63d1b38bf96e`、HTML SHA-256 `5d20fafcb518d59472a3466333bcbd9fb9940ac4229c364417301b9e4086c319`。第50项正在补入，尚未完成；上面的固定branch图片不等于50项gallery已生成或验收。前49项主表的head、价值与限制全部保留。
