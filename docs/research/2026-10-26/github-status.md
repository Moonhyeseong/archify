# GitHub 增量与下一批选题排重

读取窗口：**2026-10-26 05:34–05:35 UTC**（台北13:34–13:35）。来源为 `gh` 读取官方 `tt-a1i/archify` REST/GraphQL API；对照 [昨日22:07快照](../2026-10-25/github-status-2207.md)。本轮只做公开状态核对，不复查49个实验CI，不将贡献者声明当作独立复验。

## 基线已前进，release未变

| 项目 | 当前事实 | 相对昨日增量 |
| --- | --- | --- |
| [dev](https://github.com/tt-a1i/archify/commit/e837dc4cb83042d2b6c596e039692e25ec62c2da) | `e837dc4cb83042d2b6c596e039692e25ec62c2da` | [旧head以来14 commits](https://github.com/tt-a1i/archify/compare/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0...e837dc4cb83042d2b6c596e039692e25ec62c2da)：合入 [#876 crossing分析预算](https://github.com/tt-a1i/archify/pull/876)及 [#1113历史Explainer证据精简](https://github.com/tt-a1i/archify/pull/1113) |
| [main](https://github.com/tt-a1i/archify/commit/81c6be8d87090670c45d08a8f97f9d29c5af0bec) | `81c6be8d87090670c45d08a8f97f9d29c5af0bec` | [仅1 commit](https://github.com/tt-a1i/archify/compare/51a291770851ad27a400cca73c753c166b5e0c65...81c6be8d87090670c45d08a8f97f9d29c5af0bec)：[#1105微信群二维码](https://github.com/tt-a1i/archify/pull/1105) |
| [正式release](https://github.com/tt-a1i/archify/releases/tag/v3.2.0) | 仍 `v3.2.0`，`2026-10-19T00:43:00Z`；非draft、非prerelease | 无新release；不推断部署结果 |

#876涉及 `archify/bin/archify.mjs`、`archify/scripts/check-render-output.mjs` 与相关测试/ZIP；不是新的阅读交互。#1113只精简 `docs/research/2026-10-23-artifact-reader-baseline/` 中的历史证据；[#1069](https://github.com/tt-a1i/archify/pull/1069)已CLOSED、未合入，保留的内容经#1113进入dev，不能把它说成移动阅读功能交付。

## 代码理解与阅读交互：实际变化和边界

| 工作 | 当前状态 / 变化 | 下一批应避免的重叠 |
| --- | --- | --- |
| [#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) | **OPEN、已由draft转ready**；head仍 `f0be206acbc90eb7c6c6b636030e3eb28963d284`，base `labs/code-analysis`。[维护评论](https://github.com/tt-a1i/archify/pull/1103#issuecomment-6399931421)记录限定集成到labs的审查与实机Chrome验证；尚未merge | 模块/文件依赖总览、复杂函数选中、cycle路径及Atlas→Classic finding源码证据往返已有候选；不要再包装同一能力为新实验 |
| [#998 Code analysis](https://github.com/tt-a1i/archify/pull/998)、[#1015 Explainer](https://github.com/tt-a1i/archify/pull/1015) | 身份/head未变：前者OPEN→dev `25b767c…`；后者OPEN、draft→main `fe4f80d…` | Classic源证据与Explainer代码focus/details仍为邻近开放工作；都不等于dev已具备 |
| [#1027 Viewer移动导航](https://github.com/tt-a1i/archify/pull/1027) | OPEN，head `c393fc7…`；[新增维护回复](https://github.com/tt-a1i/archify/pull/1027#issuecomment-6407503514)明确暂缓merge：专门移动适配非优先事项，要求真实手机场景、本人代码/视觉检查与更小必要修复价值 | toolbar可达、dock避让、Passport/overlay、presentation滚动有现成候选；不要据green CI推断方向已认可 |
| [#1076 Explainer移动工具栏](https://github.com/tt-a1i/archify/pull/1076) | OPEN、draft，head刷新为 `cd50794…`；作者报告窄屏换行/Style、Export菜单定位已验证，人工确认仍待 | 与#1068 CSS P0直接重叠；[#1068](https://github.com/tt-a1i/archify/issues/1068)自身没有新评论或状态进展 |
| [#1042 默认关系标签亮色文字](https://github.com/tt-a1i/archify/pull/1042) | OPEN、draft；[作者新回复](https://github.com/tt-a1i/archify/pull/1042#issuecomment-6407058618)称正在rebase并请求范围确认 | 关系标签对比度不应重复；该PR与已合入#1055 reader文字对比度有范围区别 |

## 新增/推进的选题冲突

- **[#1104 输出介质/最终字号](https://github.com/tt-a1i/archify/issues/1104)**：仍OPEN、0评论、最后更新仍 `2026-10-25T13:21:44Z`；本轮未发现对应新PR或范围采纳。slide/print profile、最终尺寸字号warning与此直接相邻，不能当作空白方向。
- **[#1111 classic SVG grid不一致](https://github.com/tt-a1i/archify/issues/1111)**：新bug，Viewer/PNG隐藏grid而SVG保留，报告指向 `serializeSvg` 的CSS筛选；[已有贡献者认领意向](https://github.com/tt-a1i/archify/issues/1111#issuecomment-6408724414)。避免重复导出一致性修复；未见正式范围同意或新PR。
- **[#1112 隐藏长描述](https://github.com/tt-a1i/archify/issues/1112)**：新proposal、0评论；建议 `meta.description` 只写SVG `<desc>`，优先于subtitle与默认翻译，解决长无障碍描述与可见副标题耦合。与语义阅读/导出描述schema实验直接相邻；尚未采纳。
- **[#1024 文件名](https://github.com/tt-a1i/archify/issues/1024#issuecomment-6403139474)**：新贡献者评论给出fork候选策略：生成页优先header h1；旧/custom页保留完整document.title，不猜测剥离“Diagram”。作者提供实际下载测试和安装验证声明，非本轮独立复验；避免重做locale标题清理。
- 新PR [#1106 workflow编译性能](https://github.com/tt-a1i/archify/pull/1106)、[#1108 Explainer outgoing-edge索引](https://github.com/tt-a1i/archify/pull/1108)（draft）、[#1109 dataflow索引扫描](https://github.com/tt-a1i/archify/pull/1109)均OPEN；[#1110 浮点port probing终止](https://github.com/tt-a1i/archify/pull/1110)新draft对应#1072。与相关布局/编译性能或终止保护实验排重。
- 证据链接方向：[GitHub Enterprise #1063](https://github.com/tt-a1i/archify/pull/1063)仍OPEN；[Gitea #865](https://github.com/tt-a1i/archify/pull/865)已CLOSED、未合入；[字体scale #578](https://github.com/tt-a1i/archify/pull/578)也已CLOSED、未合入。关闭不代表其能力已在dev。

开放计数现在为**121 issues（排除PR）、118 PRs**（昨日118/118）。下一批可优先考虑与上述实现范围明确分离的研究：任务/变更/证据的时序或状态关系、可解释中间态、源码位置与图上语义的双向定位；这些仅为本次有界去重后的候选边界，仍需对照本地49项实验及具体源文件，不能声称全仓无重叠。后续实现应以最新dev或明确指定实验基线记录差异。本报告未fetch、测试、安装、评论、merge、推送、审批或修改其他研究文件。
