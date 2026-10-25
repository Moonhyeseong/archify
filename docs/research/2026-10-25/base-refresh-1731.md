# 17:31 GitHub dev 增量与实验基线

2026-10-25 17:29–17:31（Asia/Taipei）通过 GitHub API 核对。dev 当前为 `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`，main 仍为 `51a291770851ad27a400cca73c753c166b5e0c65`。[PR #1102](https://github.com/tt-a1i/archify/pull/1102) 于17:19:29合入；merge parents 为67f12389…和98efbfcb…。[固定完整差异](https://github.com/tt-a1i/archify/compare/67f12389212c54b3122da60e2813c7f8dab7ab2f...10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)涉及202文件，是此前维护整合批次。

| 范围 | 源码差异与含义 |
| --- | --- |
| Tree | renderer仅改layout-json stdout排空；普通HTML仍会因为shared Viewer/template新增explanation、drilldown等契约改变字节 |
| Explainer | reader.js、reader.css、sources.mjs未变，Clipboard outcome修复不在本次合入；render去除execution-only inputPath，prepared bundle digest/HTML可变；另有heading、workflow locale、chart行号及patch诊断修复 |
| finalize | 新增外部chart/diagram输入路径保护，防输出或sidecar覆写依赖 |
| State / Recipe | Lifecycle schema/renderer新增explanation、href/drilldowns/parentHref；recipes新增class/tree/timeline/waterfall。不能推定补证链同字节 |
| source citations | Explainer source resolver和repository-evidence核心未变；native Viewer与共享包装已变化 |

已经发布的 State、Recipe measured 与 Byte views 仍保留67f的实际产物、receipt和截图身份；不重写历史，也不称其已经验证新dev。后续新实验采用10b4基线。若确有当前行为验证需求，另按受影响范围生成，不为追新版本无差别重跑。

精确dev的[CI run 40180172440](https://github.com/tt-a1i/archify/actions/runs/40180172440)于17:26:42完成success，19项成功、2项部署skipped。这不是实验远端分支的CI结论，也不是发布或人工验收。

[#1103](https://github.com/tt-a1i/archify/pull/1103)在本次查询仍OPEN draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，目标`labs/code-analysis`，未进入dev；[该head CI](https://github.com/tt-a1i/archify/actions/runs/40177966042)success。Atlas的文件、模块、函数、依赖、复杂度和findings工作继续作为排重对象。

未合并、关闭、发布或更改GitHub状态。本文件是协调Agent根据API和独立Agent源码核对整理的时间点摘要，不是raw CI receipt。
