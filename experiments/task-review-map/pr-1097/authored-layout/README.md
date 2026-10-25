# 手写布局派生 · 内容保持不变

这是同一份真实 PR mapping 之后的手写布局修订，不是 adapter 自动布局能力改进。原始自动生成的 JSON/HTML 和本次失败仍保留在 [../output](../output/review.html)。

仅将嵌入图中的 component.pos 改为两列三行：x=40/360，y=60/220/380。节点尺寸仍为 240×86，内容、ID、六个 why/ref、四条关系、六个步骤、nodeBlocks、diff 和 unresolved ZIP 均未修改。生成时移除精确允许路径上的 pos 后，完整 JSON 对象逐字段相等；嵌入 spec 与独立 diagram 也完全相等。[layout-proof.json](layout-proof.json) 保存允许路径、实际差异与前后 hash。

原始三列图 viewBox 宽 1012，1280 视口内预览可用 1182px，但最小关系文字仍约 9.34px。既有 Reader 在所需放大宽度超过容器时报告 insufficient。本修订缩短图宽，让现有自动放大机制有空间满足文字门槛；没有改 Viewer、CSS、文字门槛或删除焦点项。

[派生页面](review.html) · [派生 Explainer](explainer.json) · [布局图](diagram.json)。实际 finalize/browser 结果单独记录在 [../evidence.json](../evidence.json)，不覆盖原始失败证据。不执行 PR 代码或测试，不表示原作者认可或人类验收。

派生实际结果：validate/deliver/check 通过；browser-check 仍失败，仅剩 keyboard-traversal 30 条，readability/diagram-fit/diagram-text 本次未再报告。保持这项键盘失败，没有删除控件或修改 Viewer。原始失败与派生失败分别绑定不同 hash；派生 HTML SHA-256：`bf30fb5bda006c2d4a961bae4a0677c26aba91ec42379a816e5b7ffff15f28e6`。

协调 Agent 已实际捕获并逐图查看 [1280px 图与步骤](../screenshots/diagram-and-summary-1280.png) 和 [ZIP 未解析区](../screenshots/unresolved-package-1280.png)。图片绑定当前派生 HTML；前后对照及 hash 见 [证据账目](../ledger.md)。键盘失败与人类验收边界不变。
