# GitHub 状态与下一轮实验查重（16:35）

核对窗口：2026-10-25 16:32–16:35 Asia/Taipei（UTC+08）。一手来源为 `tt-a1i/archify` GitHub API/PR/issue；只读，不 fetch/改 refs、不评论、不触发 CI。正文所述 PR scope 来自实际正文与 changed-file 列表，不等于本轮源码或浏览器验收。Research 子 agent 辅助窄读 open issue。

## 基线：没有再次推进

| 分支 | API 当前完整 SHA | 此 head 的实际 Actions |
| --- | --- | --- |
| [main](https://github.com/tt-a1i/archify/tree/main) | `51a291770851ad27a400cca73c753c166b5e0c65` | [CI](https://github.com/tt-a1i/archify/actions/runs/40173401042) waiting；[DSH integration](https://github.com/tt-a1i/archify/actions/runs/40173401072) success |
| [dev](https://github.com/tt-a1i/archify/tree/dev) | `67f12389212c54b3122da60e2813c7f8dab7ab2f` | [CI](https://github.com/tt-a1i/archify/actions/runs/40174081342) success；[DSH integration](https://github.com/tt-a1i/archify/actions/runs/40174081327) success |

main 的 24 check-runs 中 deployment Pages/Cloudflare 两项仍 waiting、adapter release skipped，其余 21 success；这是部署等待，不能把整个 workflow 写成完成成功，也不是测试失败。dev 的 24 check-runs 为 21 success、三项 skipped（两个部署、adapter release），无当前失败/等待。CI 是该精确 head 的自动证据，不代表人工验收或安装。

与 root 已知 dev `67f12389` 相同，**本次无需新基线处理**。既有 `3f95f034` clipboard 冻结实验仍保留原身份；未来新实现应使用最新 dev，不能将未合入 PR 当成 dev。

最近已合入：[#1100](https://github.com/tt-a1i/archify/pull/1100) 于15:47:01合入 dev，修 source end line 越 EOF（merge `67f12389…`）；[#1098](https://github.com/tt-a1i/archify/pull/1098) 于15:36:06合入 dev（`3f95f034…`），[#1099](https://github.com/tt-a1i/archify/pull/1099) 于15:36:19合入 main（`51a29177…`），两者为 Apache-2.0/历史 MIT notices。另 [#1096](https://github.com/tt-a1i/archify/pull/1096) 于14:30:04合入 **labs/code-analysis** 的 `25b767c72e9463a89e9e89b696d26a52318189b3`，不是 dev。

## 近期 PR 与实验重叠

API 当前开放 PR **148**、开放 issue（排除 PR）**135**。以下是相关切片，不是全仓 triage。

| 已有工作 | 当前身份/进度 | 对下一轮实验的实际边界 |
| --- | --- | --- |
| [#1103 Add an Atlas view to Code Analysis](https://github.com/tt-a1i/archify/pull/1103) | **新 draft**，16:29:51更新；`a0348855a217c7c0098a7d2079f470dc8cfa02b8` → `labs/code-analysis`；[CI](https://github.com/tt-a1i/archify/actions/runs/40176838171) 未完成（本次末查询 queued，先前多个 job 已成功/仍执行；可能处于后续 job 队列，不能记 pass） | Canvas Atlas 投影 modules/files/functions、resolved file dependencies、complexity/findings、cycle路径；finding跳回 Classic 源码证据。不要重复做另一套全局图与finding→source hand-off。正文明确未抽取 function-call graph、unresolved records 不画曲线而显示数量；没有已提交截图，原工具声明的绘制耗时不是本轮复测。此 Atlas 与 #413 的跨图 Atlas 是不同机制。 |
| [#1102 Integrate reviewed maintenance fixes and Viewer contracts into dev](https://github.com/tt-a1i/archify/pull/1102) | draft，16:28:31更新；`3b5b16c0d8924e2d6ab26f2d18ec50453cde2390` → dev，base67f；[CI](https://github.com/tt-a1i/archify/actions/runs/40176750904) in_progress | 包含28 PR，其中 #398 authored node explanation/Passport、#281 cross-diagram drilldown、#603 authored translation compare，以及短 viewport Passport 修复。正文仍列 n8n route/label 待处理。未合入，不把能力算进当前 dev，但新实验必须避开其已在整合的相同行为。 |
| [#998 Code analysis Main branch](https://github.com/tt-a1i/archify/pull/998) | open，`labs/code-analysis` → dev，head `25b767c72e9463a89e9e89b696d26a52318189b3`；14:30:18更新 | code-analysis 整体还在独立分支。#1096 已在该分支记录 extractor logic revision：语言级 revision变化或未记录→当前值应标不可比，不能把抽取器变化当代码变化。不要新增一套相同的比较可信度层。 |
| [#1049 Git refs snapshots](https://github.com/tt-a1i/archify/pull/1049) / [#1044 issue](https://github.com/tt-a1i/archify/issues/1044) | open PR head `7184b99b01768349840f93b4de83ff206d202c33` → dev | 已实现读取同一 repo-relative Architecture JSON 在两本地 refs 的 blobs、固定 commits、复用现有 Delta。明确无 fetch/执行、无源码→snapshot、rename/稳定ID推断、runtime impact/merge safety。新的比较阅读动作应定位到 Delta 展示缺口，别再包 Git-ref CLI。 |
| [#1015 Explainer visual comprehension](https://github.com/tt-a1i/archify/pull/1015) | draft → main，head `fe4f80d2195e0a7b49b7cfe6d3ba7ffd31a7ac8` | 已提出 source/code focus lines、source-card展开/Copy、reason→panel关联、step锁定和metric delta。避免把相同 reveal/聚焦控件包装成全新机制；本轮没独立重测其实现。 |
| [#413 Architecture Atlas](https://github.com/tt-a1i/archify/pull/413) | draft → dev，head `5a0c069f600be305f34d48c6ac45ab28c4dfe2a7` | 多个独立验证图的嵌套阅读、directory/history/camera恢复/guide/export，不等同 #1103 的代码事实canvas。不要重复跨图持久阅读容器。 |
| [#367 stable identity / locate](https://github.com/tt-a1i/archify/pull/367) | draft → dev，head `cc1b33a7a02351347842dad4ebe9c13278afc166` | repo-path ownership分类、unclaimed/ambiguous、Git change range、manifest-bound child diagrams；不推断runtime impact或review order。代码归属导航不能再另做等价locate。 |
| [#795 relationship query availability](https://github.com/tt-a1i/archify/pull/795) / [#816](https://github.com/tt-a1i/archify/issues/816) | open但正文明确 paused；head `793c4a441b7a463788e1cdd9ea3be38a50b01bef` | 自定义SVG无完整关系图时，用显式声明使Finder/Route/Reach/Passport等诚实表未知，不发明零关系。尚待具体generic workflow/renewed scope；不要把暂停误报可直接整合，也不要重复补通用未知状态平台。 |

其余旧 PR 本轮仅核 open/head/scope，未刷新所有 CI；没有“未查到 checks = pass”的结论。

## 近期 open issue 的具体已有切口

| Issue | 最近更新（台北） | 去重结论 |
| --- | --- | --- |
| [#1082 workflow lane locale](https://github.com/tt-a1i/archify/issues/1082) | 10-25 01:13:50 | 可见 lane、aria-label/title/context语言问题，已有 #1095 和 #1102整合；不要另起分支上下文本地化。 |
| [#1068 standalone reading](https://github.com/tt-a1i/archify/issues/1068) | 10-24 20:03:41 | P0窄屏toolbar/menu containment已有 #1076；compact身份披露P1、update notice P2 deferred，开放不等于全scope授权。 |
| [#1074 pie diagnostic position](https://github.com/tt-a1i/archify/issues/1074) | 10-24 17:27:44 | Archify pieLegend吞换行偏移，有 #1097和#1102；并非所有Pele frontmatter/comment映射。 |
| [#1023 subsecond break](https://github.com/tt-a1i/archify/issues/1023) | 10-22 21:24:17 | 397ms实际间隔显示≈0s，已有 #1029；不要作为全新精度读取bug。 |
| [#1026 native mobile navigation](https://github.com/tt-a1i/archify/issues/1026) | 10-21 08:25:08 | nav overflow、Route遮挡、presentation开头clipping有 #1027；不涵盖Explainer/RTL/zoom pan math。 |
| [#1019 cross-year timeline identity](https://github.com/tt-a1i/archify/issues/1019) | 10-21 03:57:55 | 两年同月日显示相同已有 #1032；原报告是synthetic，不是线上用户事故。 |
| [#1034 GHE source links](https://github.com/tt-a1i/archify/issues/1034) | 10-20 18:22:39 | 固定revision/line的GHES/GHE.com链接有 #1063；不能重复Enterprise SourceCard支持。 |

## 下一轮选择建议

优先找**某个真实固定输入中、用户无法分辨或恢复的一步读取动作**，先在现有 SourceCard/Explainer/Passport/Delta 展示缺口，再决定最小改动。当前不应再起全局代码Atlas、跨图导航、ownership locate、Git-ref比较wrapper、通用关系未知层，或另一套source focus/reveal控件。具体新候选仍需独立源码与输入证据；本轮GitHub快照不构成实现授权，也不宣称所有邻近研究已穷尽。
