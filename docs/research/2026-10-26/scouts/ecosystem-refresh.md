# 代码理解与图交互：已有方向刷新与排重

审计于客户端日期 2026-10-26 开始，2026-10-27 写入本报告；目录沿用启动日期，不把旧快照说成 27 日新核。用户已恢复持续探索目标；2026-10-25 历史报告中的暂停仅描述当时状态，不是当前停止指令。

**结论：这组熟悉来源没有提供值得新增实现的缺口。** 可继续发现新问题，但不为凑数量重做导览、过滤或无限画布。以下是只读来源核验和排除判断，不是产品实现、合并、发布或使用效果证明。没有安装、运行上游项目、修改产品、提交或写 GitHub；本文件是唯一写入范围。

## 产品与实验排重

已读本 checkout 的 PRODUCT.md 和 ROADMAP.md：便携、可核实的 authored 关系是主线；通用编辑器 chrome、凭运动暗示活动、第二套自动布局运行时不合适。ROADMAP 的历史段落不代替当前分支事实。

核对过 origin 远程 ref 名称及研究中心树，研究账本固定为 [`714c1d3ca691499684a1e89842e3188f85bdabea`](https://github.com/tt-a1i/archify/tree/714c1d3ca691499684a1e89842e3188f85bdabea/docs/research/2026-10-25)，含 49 个实验的汇总。重点读取 source-navigation-smalltools、graph-reading、graph-interaction-round14、code-maps 等报告；没有把整个来源列表都冒充本轮重新深读。

读取的不只是实验标题：

- `origin/codex/lab-source-question-tour` 的 `question-first.archify.md` 与 README：五段固定 Git 摘录、四个问题、原生 Workflow 与 steps，以及按文件组织对照。阅读顺序不被偷换成运行调用顺序；浏览器不查当前工作树。
- `origin/codex/lab-dependency-map` 的 README、文件树：已有报告转局部原生图、保留未显示记录与逐边 receipt 的实验。不再建议另一个通用依赖导入器。
- `origin/codex/lab-finder-highlights:viewer/node-finder.js`：`clearMatches()` 清理 `data-finder-match`，普通 focus Finder 的非空查询把同一 visibleItems 集合标到节点。搜索结果画布强调已是实验，不是新候选。
- `origin/labs/code-analysis` 固定 [`25b767c72e9463a89e9e89b696d26a52318189b3`](https://github.com/tt-a1i/archify/tree/25b767c72e9463a89e9e89b696d26a52318189b3/archify/modules/code-analysis)：读取 ARCHITECTURE.md 并检索 presentation 源文件；已有捕获源码片段、全文切换、返回与组件定位。它是实验分支，不能称作 stable 已交付。

相邻远程方向另有 `labs/infinite-canvas@7e6a1228bed1f82c8d7860929c5d3c4b275d5224`、`labs/subarchitecture@3e19b07c9b8a5ebbac88131409a40ed1990fd9a6`、`integration/architecture-atlas@5a0c069f600be305f34d48c6ac45ab28c4dfe2a7`。这些 refs 只证明存在相关工作，不代表本轮完整复核其正确性或交付状态。

## 固定一手来源与取舍

以下 SHA 来自本轮 GitHub API 默认分支查询；CodeTour、Codecrumbs 当前 HEAD 与昨日固定来源一致。xyflow、tldraw 的具体示例与完整许可正文重新读取；CodeTour、Codecrumbs 的具体机制同时对照此前完整来源研究，不把重新查 HEAD 当成重新运行。

| 来源、固定 SHA、许可 | 用户工作与实际源码合同 | Archify 对照、最小实验与排除理由 |
| --- | --- | --- |
| [Microsoft CodeTour](https://github.com/microsoft/codetour/tree/29955a004445d3fd2ad5df35dd00f9cc0400ba7d) · `29955a004445d3fd2ad5df35dd00f9cc0400ba7d` · [MIT](https://github.com/microsoft/codetour/blob/29955a004445d3fd2ad5df35dd00f9cc0400ba7d/LICENSE.txt) | 新人按理解问题跨文件阅读；steps 附说明，可带 file/line/ref。并非每步都有可核实位置，命令 URI/终端能力不应随导入进入只读页面。 | 最小实验已是 source-question-tour 的同源「按文件 / 按问题」两页。新写播放器、tour parser 或再做一份截图没有新价值；剩余是读者实际使用证据。 |
| [Codecrumbs](https://github.com/CodecrumbsIO/codecrumbs/tree/31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b) · `31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b` · [BSD-3-Clause](https://github.com/CodecrumbsIO/codecrumbs/blob/31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b/LICENSE) | 源码注释标出跨文件功能路径；flow 编号是作者叙述顺序，不是采集调用栈或发生时间。 | authored steps、固定源码引用和原生关系已能表达此工作。最小内容例仍与 source-question-tour 重叠；维护注释提取器、watcher 与语言规则不值得。 |
| [xyflow](https://github.com/xyflow/xyflow/tree/8523d8dd9f1551954bc221dccabd6a3119ef9e22) · `8523d8dd9f1551954bc221dccabd6a3119ef9e22` · [MIT](https://github.com/xyflow/xyflow/blob/8523d8dd9f1551954bc221dccabd6a3119ef9e22/LICENSE) | [Subflow 示例](https://github.com/xyflow/xyflow/blob/8523d8dd9f1551954bc221dccabd6a3119ef9e22/examples/react/src/examples/Subflow/index.tsx) 用 parentId 与 hidden 切子节点；[Hidden 示例](https://github.com/xyflow/xyflow/blob/8523d8dd9f1551954bc221dccabd6a3119ef9e22/examples/react/src/examples/Hidden/index.tsx) 给节点与边批量设置 hidden。它们不提供聚合线成员回查或完整省略账目。 | 读者先看模块再看成员的工作已与 Atlas/subarchitecture 相邻。只有真实作品证明过密时，才考虑同一输入的全部 / 单模块 authored 投影并列出省略关系。成本至少中等：聚合身份、跨边、搜索揭示与导出范围都需维护。当前无缺口证据，不新增过滤状态或第二套图运行时。 |
| [tldraw](https://github.com/tldraw/tldraw/tree/12921f6d3996b4330688113371cd88890b673ab5) · `12921f6d3996b4330688113371cd88890b673ab5` · [自定义 tldraw license](https://github.com/tldraw/tldraw/blob/12921f6d3996b4330688113371cd88890b673ab5/LICENSE.md) | [FocusModeExample.tsx](https://github.com/tldraw/tldraw/blob/12921f6d3996b4330688113371cd88890b673ab5/apps/examples/src/examples/editor-api/focus-mode/FocusModeExample.tsx) 只设置 isFocusMode，默认 UI 隐藏到退出按钮。根许可有生产使用限制；不能把当前 SDK 叫 MIT 开源组件。各子目录另有许可，不扩大根许可结论到所有包。 | Archify 的 canvas-first、Presentation 与 viewer shell 已覆盖主要阅读工作。若以后有具体遮挡案例，先复用 Presentation 做对照即可。无新阅读机制，不引入 SDK，也不因为一项 UI flag 复制编辑器状态。 |

本轮未对 Sourcegraph/SCIP 再做一份浅层比较：已有 scouts 覆盖定义/引用与匹配证据边界，未发现新的具体输入问题。该句只说明排重，不表示本轮验证过 Sourcegraph 当前源码与许可。

此前 graph-interaction-round14 已研究 CoGraph 隐藏邻接恢复、crgraph 聚合成员回查，结论为没有当前真实缺口。xyflow 示例未推翻它；不可把隐藏、聚合、成员证据三个不同合同合并成一个「折叠很简单」建议。

## 独立范围复核：原创 Python ExceptionGroup 小例

另读取历史 round27-error-reading.md。其暂停是 25 日历史状态；当前父任务提出的是**新写原创 stdlib 构造并实际测量**，不是运行上游 fixture，也不是把旧 f-string expected 展开后冒称原始 stderr。

这一方向可以保留为一个有界内容实验：同一异常对象为什么在打印中出现多处？对象组包含关系与显式 cause 分别是什么？现有 native Architecture 图可保留共享身份与回环，Explainer 承载源代码、原始输出和三行关系表。没有新增 parser、采集服务、schema、Viewer 或运行时依赖的必要。

许可来源灵感为 [agronholm/exceptiongroup@8ee4bfcf7d6706ac6328c2e7a3840556180099de](https://github.com/agronholm/exceptiongroup/tree/8ee4bfcf7d6706ac6328c2e7a3840556180099de)，[完整 LICENSE](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/LICENSE) 同时含 MIT 与复制 CPython 部分的 PSF 通知。若只写独立原创 Python 例和转述关系，不必复制上游 formatter/expected；如有复制材料，则完整保留相应通知，不能一概标 MIT。

范围判断：**没有阻止这个微型内容实验的实质异议，但下列边界决定它是否仍然低成本。**

1. 只针对一个已记录的 Python 3.11+ 解释器运行，保留准确 version、源码 bytes、原始输出、退出码；实际未执行前不写 measured。不要扩跨版本一致性或 backport 兼容性。
2. 对象图来自同一次构造的明确属性检查，例如 children 的 `is`、`__cause__ is`、`__context__` 与 suppress 标记；输出字符串只展示，不反向解析出对象身份。绑定标签只在本次构造内有效。
3. 边从对象指向其属性值：group→child 表示 exceptions 包含，raised→cause 表示 __cause__ 指向。图上标清方向；显示先后不能解释成发生先后。关系回环不等于递归调用、重试或两个异常发生。
4. 不用 Tree 复制共享节点，不把 ExceptionGroup children 套成 Witness groups 的共同/替代语义；不套用 Workflow 泳道的执行含义。若 Architecture 类型视觉暗示服务，应以图题、节点标签和边说明明确这只是对象关系投影。
5. 读者价值仅为能核对两种关系及重复打印，不声称理解更快、生产事故修复或用户接受。若最终图比三行表更难读，保留表与原文，不为一张图扩产品。

语义复核参考 Python 官方 [exception context](https://docs.python.org/3/library/exceptions.html#exception-context) 与 [ExceptionGroup](https://docs.python.org/3/library/exceptions.html#exception-groups) 文档；它们是滚动文档，不冒称运行环境版本。实际运行解释器与本地源码仍须在实验中固定。本报告没有执行该例、生成页面或作视觉验收。

AI 协助：Codex / gpt-6.1-sol 进行只读检索、来源核对、排重与写作。没有人类使用效果或最终接受结论。
