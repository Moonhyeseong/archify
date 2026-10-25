# PR #1097 证据账目

固定公开 Git 对象、原声明与六个 Codex 阅读声明分离。下列结果来自实际命令/捕获，不执行该 PR 的代码或测试，不表示原作者认可或人类验收。

| 层级 | 实件 | 实际结果 |
| --- | --- | --- |
| 来源 | [source.json](source.json)、[输入](review.json) | 固定 base/head；原 PR 必要声明与 body hash 单列 |
| 映射 | [mapping.json](output/mapping.json) | exit 1；4 文件、5 hunks、6 引用；文本行全部记账，ZIP 超 1 MiB unresolved |
| 原始自动输出 | [HTML](output/review.html) | validate/deliver/check pass；browser fail：finalize 42 条，底层 browser 54 条 |
| 手写位置派生 | [layout-proof.json](authored-layout/layout-proof.json)、[HTML](authored-layout/review.html) | 仅 9 坐标叶值变化；内容全等；前三 gate pass，browser 30 条 keyboard-traversal 失败 |
| 原始真实截图 | [capture](screenshots-before/capture.json) | 完整页及 1280×900 overview，绑定原始 HTML |
| 派生真实截图 | [capture](screenshots/capture.json) | 1280×900 overview/全页；1280×1400 图与六步骤/ZIP 区，绑定派生 HTML |

截图由协调 Agent 实际捕获、逐图查看：派生图未出现 fit 提示，六个步骤可读，ZIP 限额文字仍可见。截图不抵消键盘失败，也不证明用户收益。

原始 HTML SHA-256：`97a603834f49fa6c9d53d46f60ce488cb8cd97f6c4b14450c7f482fab89bacaf`。

派生 HTML SHA-256：`bf30fb5bda006c2d4a961bae4a0677c26aba91ec42379a816e5b7ffff15f28e6`。

每张图片、capture、输入/JSON/HTML、原始与派生的外置 raw receipts/stdout/stderr 的 SHA-256 均记录在 [evidence.json](evidence.json)。原始 raw receipts 位于 checkout 外，仅发布摘要/指纹；它们不是 PR 测试通过证据。
