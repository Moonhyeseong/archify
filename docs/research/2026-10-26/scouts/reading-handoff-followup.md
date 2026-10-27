# 阅读交接复核：维持 relation-return 延后

2026-10-27；只读源码和已有实验，不运行浏览器、不改产品。Hub `c0903e6efd3daf40dba3b5703839b358c6138fc1`，本地 `origin/dev` 为 `e837dc4cb83042d2b6c596e039692e25ec62c2da`，历史研究 `60342aa9`，延后原型 [`e323d30f`](https://github.com/tt-a1i/archify/tree/e323d30f1ebf159d992d8f0426296de872ed61b7/experiments/relation-return)。**结论：这四个新内容没有提供重开 relation-return 的具体阅读失败；不建议另建实现或重复实验。** 这不是用户研究或当前浏览器验收。

## 原型为何延后

原型保留源码补丁和成对 HTML，不集成运行时。固定 production deployment 输入里，从 API Gateway 点出边到 API Pods / AZ-a 后，目标 Passport 的 Incoming `VPC route` 行本来就能一击回到 Gateway；新增 Back 也是一击。历史截图比较了两个动作，未同步相机，不能证明视觉或效率收益。代表性 Architecture 输入的已检查最大度数为 5，没有发现来源行因长列表滚动而隐藏的自然例子。候选仍需临时来源 ID、替换/清除规则、树节点 reveal、隐藏节点处理、键盘、locale 和模式交互；原型测试通过只证明兼容边界，不证明价值。参见[原型 README](https://github.com/tt-a1i/archify/blob/e323d30f1ebf159d992d8f0426296de872ed61b7/experiments/relation-return/README.md)。

历史 [reading-handoff](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/reading-handoff-audit.md) 是另一问题：source-only 预览节点 Tab 可达和来源卡已存在，但 Enter/Space 未触发已有打开动作；已有 source-keyboard 实验，不能把它重述为 return 问题。[source-reading audit](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/source-reading-audit-round10.md) 没有复现新的源码阅读缺陷；14 行预览不等于完整来源丢失。local-context 与 graph-interaction 调研也没有证实路径旁额外状态或通用折叠的当前收益。

## 四份内容能否改变结论

- [task-flow-tests](https://github.com/tt-a1i/archify/tree/codex/lab-task-flow-tests/experiments/task-flow-tests/final)：作者编写的路径和测试关联，非运行轨迹。所检 `flows.json` 两步 `guard → report`；同一张图复用以比较声明。现有关系行、步骤及固定引用已提供对应入口，数据不构成长关系列表的自然证据。
- [trace-flow-evidence](https://github.com/tt-a1i/archify/blob/codex/lab-trace-flow-evidence/experiments/trace-flow-evidence/final/candidate.archify.md)：历史 Catapult 原始 trace 中两个明确 flow 端点；图仅一条边，两个端点有 source 和 paragraph 绑定。卡片和正文已有各自证据入口；没有长列表或丢失返回路径的证据。
- [oci-whiteouts](https://github.com/tt-a1i/archify/blob/codex/lab-oci-whiteouts/experiments/oci-whiteouts/final/native.json)：原创固定 tar 与规范推导，图中所检关系为成对解释，不是容器运行结果。它说明来源与推导要分清，未说明关系回跳困难。
- [operation-order](https://github.com/tt-a1i/archify/blob/codex/lab-operation-order/experiments/operation-order/candidate.archify.md)：固定 Porcupine README 说明例上作者推导的三节点约束环，不是自然采集或运行 checker。每节点一入一出，关系回跳可由对向行表达；短环本身不是需要历史栈的证据。

以上是对声明数据及源码的审阅，不等同于对四个生成页面的手动可用性测试。无证据说明任务频率或真实用户理解速度。

## 现有能力和查重

当前 dev 的 `archify/explainer/reader.js` `setupSourceCards` 为 citation 和节点注册 hover/focus 卡，含源码路径、最多 14 行摘录、固定来源链接，以及存在 block 时的正文链接；卡的 Tab/Escape 有专门处理。SourceCard 是来源预览，不是关系导航。既有 Passport 的 Incoming/Outgoing 行用于已编写关系的节点跳转；Finder 用名称/ID 查节点；Route 选起点和可达终点查询有向路径。这些各有合同，不能因为它们不提供通用浏览历史就推定缺陷。也不能凭静态源码把卡片位置或某次键盘行为当作实际失败。

2026-10-27 GitHub open PR 查询中，[#413](https://github.com/tt-a1i/archify/pull/413) 已涉及 Atlas 导航；[#795](https://github.com/tt-a1i/archify/pull/795) 涉及关系查询不可用状态；[#225](https://github.com/tt-a1i/archify/pull/225) 涉及关系探索；[#1063](https://github.com/tt-a1i/archify/pull/1063) 涉及来源链接。它们各自的范围及状态不应被当成当前 dev 已具备对应改动。历史 #1015 来源卡展开/定位与 #1103 Atlas 交接需查当前 head 后再作具体排重；这里没有提议实现。

**重新打开的门槛：** 固定一个真实内容与具体阅读任务，实际跟随关系到目标后，记录回到原点所需可见动作、滚动/焦点状态及结果；先试目标反向关系行、Finder，以及适用的正文链接。如果目标行可直接完成且不造成实际任务困难，则否定新增 Back 的价值；如果自然内容确实让原关系难以定位，再比较最小的既有控件改善与原型，并记录额外状态和维护成本。当前四份样本并未达到门槛，因此不建议占用共享浏览器复测或引入新状态。
