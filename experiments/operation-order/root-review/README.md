# 真实页面观察 · 2026-10-27

本记录绑定实现提交 `ef3e751c1649be36dbf390c3b471c39572a9ea70`。随后只添加文档、截图和证据摘要，两份 HTML 未改。文件摘要和每张 PNG 的 SHA-256 见 [observations.json](observations.json)。浏览器为 macOS Chrome 156.0.8078.48；截图来自 Ego Browser 的实际页面，没有图像生成或后期修图。

## 同源对照

独立源码复核读取 Porcupine 固定 README 原始事件与 register model，核对六行事件、实时约束和三种候选的首个不符。图版删去 constraints 面板、统一文档 ID 后与文字源稿相同。图环是模型与实时顺序的推导，不是调用环或实际执行轨迹。上游 checker 返回 false 只是 README 声明；本轮未执行 Porcupine。

| 观察 | 文字基线 | 加约束图 |
| --- | --- | --- |
| 1440×900 首屏，light | [截图](baseline-overview-light.png) | [截图](candidate-overview-light.png) |
| 核心解释，1440×900 light | [三句解释与枚举](baseline-explanation-light.png) | [约束环与枚举](candidate-constraints-light.png) |
| 390×844 dark | [文字直接可读](baseline-mobile-dark.png) | [小图提示打开](candidate-mobile-dark.png) |

协调者逐张查看以上截图，以及[1440 深色](candidate-constraints-dark.png)和[实际打开后的交互图](candidate-modal-dark.png)。三条边与文字标签可见，说明文字明确将环限定为顺序约束。两个 mobile 页面测得 innerWidth / scrollWidth 均为 390。

实际动作：切深色、点击 constraints 标题锚点、打开交互图、按 Escape 关闭。Escape 后无 open dialog，焦点回到“打开交互图”按钮。已检查可见来源为固定 Porcupine commit 的 README 锚点，没有点击外链或执行上游。移动端只检查页面预览，没有测试移动端图内缩放、触屏操作或 AT。

## 成本与保留决定

同一 1440×900 浏览器条件下，文字页面总高 1526px，图版 1805px；源 HTML 156572 / 541210 bytes。图版多出一块原生交互图，增加 279px 文档长度、384638 bytes。手机上约束标签很小，页面显示打开交互图的提示；文字基线可直接读完三条规则。原生交互图仍显示通用的“后端”图例，作为操作节点的类别不贴切，本实验不修改共享 Viewer。

这支持“可以表达矛盾约束环”，不支持“比三句话更易理解”。本轮保留对照分支、不创建 Draft PR。没有人类读者速度、理解正确率、自然事故或普适模型检查结果。审查没有发现当前固定内容的语义阻塞项；唯一审计范围提醒已收窄为 README 中的明确覆盖说明，没有增加通用 parser 或猜测性防御测试。
