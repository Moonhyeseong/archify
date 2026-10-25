# Diff 行号证据账目

| 层级 | 实件 | 结果与范围 |
| --- | --- | --- |
| 固定来源 | [source.json](source.json)、[完整输入](input.explainer.json) | PR1097 已发布实验的完整 spec；两臂输入原字节相同，无 PR 代码/测试执行 |
| 基线 public finalize | [base.html](base.html) | validate/deliver/check pass；完整 browser gate not-run |
| 候选 public finalize | [candidate.html](candidate.html) | 相同输入，只有共享 diff 行号 nowrap；前三 gate pass，完整 browser gate not-run |
| 实际 DOM | [观测](browser-observations.json)、[可复现检查](check-browser.mjs) | 1280/390 浅深 8 臂；30 折行→0；65 数字与全部 diff 文本保留；497 字符代码仍局部横滚可达 |
| 源码兼容 | [portable evidence](evidence.json) | closest parser/renderer 25、core 19、0skip；generated pass；未跑全仓 |
| canonical 包 | 根 archify.zip | 官方 Node22.23.2 / bundled zlib；两次 byte-identical，包内 CSS 与源码相同；未安装 |
| 实际图片 | [capture](screenshots/capture.json) | root 逐图查看 4 张浅色 1280/390 前后图；相同滚动指令，桌面锚点自然 clamp 不同 |

原始 finalize/delivery、完整 Chrome DOM 输出、测试和构建日志保留 checkout 外；[evidence.json](evidence.json) 仅公开实际结果和全部 raw 文件指纹，以及输入、脚本、HTML、截图 SHA。原始 gate 未运行不能写成通过；focused DOM 不等于全浏览器、触屏、辅助技术或人类验收。
