# Archify 持续探索与实验分支

2026-10-25 启动。项目维护者要求持续寻找代码理解、图形表达与交互阅读项目，把有价值的点做成独立远程分支，附真实产物图片供审阅；直到维护者明确说停才停止。完成某一批并不结束目标。

**星数不作为门槛或排序依据。** 每个方向都看实际问题、现有能力、维护成本和来源证据；小项目、早期项目同样纳入。与已有 issue/PR 重复的方向先排除或明确剩余差异。

共同实验基线：[dev `82c7e0f0`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)，2026-10-25 已重新核对远端仍为该 revision。下面的“已推送”只表示远程实验分支可审查，不能等同于合入、发布或人类验收。

## 已可审阅的第一批

分支里的 README 含实际图片、原始/示例输入、生成 JSON/HTML、复现命令、来源许可与验证边界。

| 实验与远程分支 | 具体价值 | 发布 revision | 实际图片 | 验证与限制 |
| --- | --- | --- | --- | --- |
| [Task review map](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map) | 借鉴 gtindo/task-view，把 Agent 的解释绑定固定 Git diff，列出未解释改动 | `dae6c660` | [遗漏示例](https://github.com/tt-a1i/archify/blob/codex/lab-task-review-map/experiments/task-review-map/screenshots/omitted.png) | 15 tests；validate/deliver/check 通过；当前 browser 未重跑，历史键盘遍历失败按旧 hash 保留 |
| [Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) | 把 dependency-cruiser 已有报告变成局部原生图，保留未解析与视图外账目 | `2be2ab55` | [官方样例](https://github.com/tt-a1i/archify/blob/codex/lab-dependency-map/experiments/dependency-map/screenshots/official.png) | 6 tests；两图 finalize 四阶段通过；synthetic 的三条绕行建议仍保留 |
| [Trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) | 把真实采集的 Chrome X 格式操作区间变成可分享瀑布图 | `8e65f150` | [真实采集](https://github.com/tt-a1i/archify/blob/codex/lab-trace-waterfall/experiments/trace-waterfall/screenshots/workload.png) | 9 tests；四阶段通过；仅 X 子集，不推断调用树或关键路径 |
| [Markdown outline](https://github.com/tt-a1i/archify/tree/codex/lab-markdown-outline/experiments/markdown-outline) | 标题与源行号直接转原生 Tree，保留文档层级 | `3f156e97` | [原生 PNG 导出](https://github.com/tt-a1i/archify/blob/codex/lab-markdown-outline/experiments/markdown-outline/screenshots/contributing-export.png) | 8 tests；三样例四阶段通过；公开 CONTRIBUTING.md 17 节点，受限 Markdown 子集 |
| [DBML ERD](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) | 从严格 DBML 子集保留键、关系方向和可空性 | `feab6ae6` | [4 表示例](https://github.com/tt-a1i/archify/blob/codex/lab-dbml-erd/experiments/dbml-erd/screenshots/order-payments.png) | 39 tests；四阶段通过；原创 synthetic，未验证完整 DBML 或真实数据库 |
| [Change coupling](https://github.com/tt-a1i/archify/tree/codex/lab-change-coupling/experiments/change-coupling) | 解释 Code Maat CSV 的对称共变分数及原始计数 | `44dc5cbc` | [原生证据图](https://github.com/tt-a1i/archify/blob/codex/lab-change-coupling/experiments/change-coupling/screenshots/coupling.png) | 13 tests；render/finalize 通过，自动 browser 未请求；synthetic，非调用或因果网络 |

这六项均经过另一位 Codex agent 的独立代码/证据复核，协调 agent 实际查看图片。测试数对应各实验自己的 focused tests，不是全仓测试；远端 CI、跨平台验证、实际用户效果与人类验收没有因此自动成立。生成 HTML 保留原渲染器字节；源码 whitespace 检查与生成 HTML 的既有空白分开记录。

## 正在推进

| 方向 | 来源与目标 | 状态 |
| --- | --- | --- |
| Payload delta | PR Lens + JSON Semantic Diff；样本字段变化与明确数组匹配规则 | 实现和独立复核完成，正在补截图/发布；已修正字面 JSON 被 Markdown 解释的问题 |
| Decision thread | agent-chatter；保留异议、撤回、单方决定与原始消息 ID | 图例语义修正与截图复核中 |
| Migration plan | pg-schema-diff 已有 JSON；按原顺序阅读 DDL、超时配置与原始 hazard | 实现中；不连接数据库或执行 SQL |
| State contract | robot3-viz 静态数据；Lifecycle 与状态×事件声明矩阵 | 实现中；不执行机器源码或推断 guard 结果 |
| Finder highlights | Sigma 等的查询匹配反馈；Finder 结果同步到画布 | 共享 Viewer 实验，实现与固定输入前后验证中 |
| 后续发现 | CI/build/IaC 小工具、状态机与协议结构工具 | 持续调研，未通过筛选的不启动实现 |

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
