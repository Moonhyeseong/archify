# GitHub 状态增量：2026-10-25 22:07–22:09（Asia/Taipei）

只读官方 `tt-a1i/archify` API。相对20:53快照，**main/dev、最新release及三项重点PR身份均未改变；无需新基线处理**。新增的是 #1104 输出介质提案及部分旧issue/PR的更新元数据，没有发现新开PR或新增合入代码。原API JSON保留在本机临时目录，本报告只记公开事实与来源，不提交含本机路径的原件。

## 分支、精确head CI与部署

| 分支 | 精确head | 当前精确head检查 |
| --- | --- | --- |
| [main](https://github.com/tt-a1i/archify/commit/51a291770851ad27a400cca73c753c166b5e0c65) | `51a291770851ad27a400cca73c753c166b5e0c65` | [CI 40173401042](https://github.com/tt-a1i/archify/actions/runs/40173401042)仍 **waiting**；合计24 check-runs：21 success、1 skipped、2 waiting。另[DSH 40173401072](https://github.com/tt-a1i/archify/actions/runs/40173401072) success |
| [dev](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0) | `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0` | [CI 40180172440](https://github.com/tt-a1i/archify/actions/runs/40180172440) completed/success；21 check-runs：19 success、2部署 skipped |

main的[Pages job](https://github.com/tt-a1i/archify/actions/runs/40173401042/job/121110043410)与[Cloudflare job](https://github.com/tt-a1i/archify/actions/runs/40173401042/job/121110043201)本轮重新读取仍为waiting，conclusion=null。不能声称本次main已部署完成，也不以旧部署替代当前run。没有触发或批准部署。

最新正式release仍为 [v3.2.0](https://github.com/tt-a1i/archify/releases/tag/v3.2.0)，publishedAt `2026-10-19T00:43:00Z`（台北08:43），draft=false、prerelease=false。本次没有下载或复验release包。

## 重点开放PR：身份未变

| PR | 当前状态 / base ref | 精确head | 精确head Actions/check-runs |
| --- | --- | --- | --- |
| [#1103 Atlas view](https://github.com/tt-a1i/archify/pull/1103) | OPEN、draft；base `labs/code-analysis` | `f0be206acbc90eb7c6c6b636030e3eb28963d284` | [40177966042](https://github.com/tt-a1i/archify/actions/runs/40177966042) success；21 checks（19 success、2 skipped） |
| [#1015 Explainer visual comprehension](https://github.com/tt-a1i/archify/pull/1015) | OPEN、draft；base `main` | `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8` | [39248491381](https://github.com/tt-a1i/archify/actions/runs/39248491381) success；21 checks（19 success、2 skipped），是旧head证据 |
| [#998 Code analysis](https://github.com/tt-a1i/archify/pull/998) | OPEN、非draft；base `dev` | `25b767c72e9463a89e9e89b696d26a52318189b3` | **0 Actions runs / 0 check-runs**，不能计作通过或借用#1103结果 |

三者mergedAt均null。#1103最后updatedAt仍台北16:46:41；#998仍14:30:18；#1015仍10月19日20:16:09。Atlas/Code analysis仍在开放分支，draft或green CI均不等于已进入dev或人工验收。

## 本轮实际增量与排重

开放数量经GitHub search API核得：**118个issue（排除PR）、118个PR**。按created排序的最新10个开放PR仍为 #1103、#1101、#1086、#1076、#1069、#1066、#1063、#1049、#1042、#1032；最新创建者仍#1103（台北16:29:43），没有20:53之后新开的PR。

- **新issue [#1104](https://github.com/tt-a1i/archify/issues/1104)**，台北21:21:44创建/更新，OPEN、0评论。作者报告书稿/幻灯片最终尺寸文字过小，提议可选 `meta.output_profile`（slide或print column）及按最终缩放检查文字下限，初期warning；声明已有私有原型，愿另行公开。其数值/32示例字节不变/33书稿图为作者报告，**本轮未独立执行验证，也未见对应公开PR或范围采纳**。它与屏幕阅读/导出可读性相邻，但不等同于spatial-focus方向焦点、Line notes源码往返、Hintful中间态或gallery原PNG浏览；若开展输出介质/字体/导出新工作，应先在此排重。
- **[#1024](https://github.com/tt-a1i/archify/issues/1024)** 台北21:32:24新增维护评论：Unicode文件名保存已由#1039/#1102交付，剩余范围是剥离生成的locale装饰而不误删作者标题中的“Diagram”等合法词，需兼顾旧/custom页面fallback。仍OPEN，不能把整个issue说成已修完。
- **[#1072](https://github.com/tt-a1i/archify/issues/1072)** 台北21:32:22新增维护评论：报告在dev10b4有界复现极大width的validate超时，欢迎隔离浮点进展/终止guard的窄PR，保留普通routing与原始尺寸；不要求随意schema上限，不与#1070/#1071打包。本轮只读取该评论，未重跑其复现，也未见新PR。
- 旧PR [#1028](https://github.com/tt-a1i/archify/pull/1028)、[#1029](https://github.com/tt-a1i/archify/pull/1029)、[#1030](https://github.com/tt-a1i/archify/pull/1030)、[#1031](https://github.com/tt-a1i/archify/pull/1031)、[#1032](https://github.com/tt-a1i/archify/pull/1032)的updatedAt为台北21:32–21:33，涉及Waterfall容差/legend、Timeline时长/年份、root SVG扫描。此处仅确认更新元数据与仍OPEN，不将updatedAt解释为新代码提交或已合入；未发现新代码理解/图交互方案替代当前实验。

#1103的Atlas导航、#1015的代码focus/details仍是需要对照的邻近阅读能力，身份和范围与上轮一致。这个有界增量查询没有重读全部历史issue/PR或48个实验CI，因此不作“全仓绝无重叠”结论。

## 证据边界

读取窗口约22:07:56–22:09（台北）。API原件包括分支、release、精确head Actions/check-runs、重点PR、按updated/created排序列表、issue与评论及搜索数量；均为读取时快照。没有评论、关闭、merge、dispatch、审批或仓库测试；没有修改README/gallery。无CI不等于绿、deploy waiting不等于完成、draft不等于dev能力。
