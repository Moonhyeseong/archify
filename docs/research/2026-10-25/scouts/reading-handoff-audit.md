# 阅读交接窄审：source-only 预览节点缺少键盘入口

2026-10-25。只读检查固定 dev [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0) 与已发布实验的真实输入/HTML/证据。没有浏览器、测试、上游程序执行、代码修改或提交。本报告只新增本文件。

**保留 1 个候选：给已有 `nodeSources`、没有 `nodeBlocks` 的 Explainer 预览节点提供与鼠标来源卡等价的键盘入口。** 这不是新增 SourceCard、Passport、图导航历史或代码搜索；不是整页源码不可访问，也不是所有 SVG 节点都必须进入 Tab 顺序。它是已有映射的操作入口不对称。当前属于有现场触发与源码依据的改进候选，尚未做最新 dev 上的新浏览器复现或用户收益测量。

## 真实产物与用户动作

固定已发布实验：[CLI reading tour `1dff88d331679319442277a4ffc7cd3637bccee2`](https://github.com/tt-a1i/archify/tree/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour)。不是本轮新造输入。

| 资料 | 位置与 SHA-256 | 本轮核实 |
| --- | --- | --- |
| 完整 authored 输入 | [cli-reading-tour.archify.md](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/cli-reading-tour.archify.md)；6754 B；`5eec8481a740baec23a8898d6f4885315c5f327551aa156592d25afbf789275d` | 10 个 Workflow 节点各有 `source:`，没有任何 `block:`。固定上游 Walkthrough revision `a373526c92bd1d4c3953370b9a57f19e4fb15d08`，不执行其代码。 |
| 实际 HTML | [output/tour.html](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/output/tour.html)；686303 B；`7814b929dd002ea2b1083575899cf0739ce83effd84488251cf85addb7bce190` | `.diagram-preview` 有 10 个 `data-node-sources` 映射，没有 `data-node-blocks`。`g[data-node-id=response]` 无 tabindex/role=button。 |
| 已有现场与范围说明 | [README](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/README.md)；5911 B；`0227c5f8b668658934974a27df0dc8ad07f9bfeb35038c0f245e10e6d4245180` | 原协调 agent 实际发现预览节点没有 Tabstop，已把未验证的“悬停或聚焦节点”改为“悬停＋来源编号”；当时没有改产品。 |
| 实际 hover 观察 | [screenshots/capture.json](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/screenshots/capture.json)；2101 B；`28fca3017da96c5aadb615d816e8e942b6b7bda130026ddffce10834a2c794a8` | Start Walk → Next 两次至 3/4；hover `response` 显示固定源码卡，Escape 隐藏。记录明确不声称 preview-node keyboard Tab 支持。没有点外链、运行扫描/服务或验证用户效率。 |

具体问题：读者正看 `HTTP发送快照` 节点，想核对“HTTP handler 是否重读落盘文件”。鼠标 hover 此节点会得到固定源码卡；键盘读者想从**同一个图节点**进入相同来源和 `Open source` 链接，却无法先把 Tab 焦点移到这个节点。

精确目标是 `#cli-paths .diagram-preview [data-node-id="response"]`。其 HTML 属性为 `data-node-label="HTTP发送快照"`、`data-node-context="正常服务：内存响应"`，只有 `aria-label="聚焦HTTP发送快照，正常服务：内存响应"`，没有 Tabstop 或 button role。单有 aria-label 不会创建 Tab 入口。

对应源卡数据已存在：`response → http-snapshot`，`packages/cli/src/index.ts` L84–98，固定上游 `a373526c…`，source title 是“serve：先编码字符串，handler只发送快照”。映射不是本轮推断。Native spec 的同一节点仅有 id/label/type/width/lane/col，没有这份 `nodeSources` 或源码引用。

## owning code：入口为什么缺失

| 固定 dev owning source | 现有行为 | 剩余差异 |
| --- | --- | --- |
| [render.mjs L162–170](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs#L162-L170) `staticSvg` | 预览前缀化 DOM IDs，保留 semantic node/edge ID；移除原生 SVG 的 tabindex、button role、aria-pressed。原始 native HTML 不改。 | 不能靠 native 原先可聚焦来假定 Explainer preview 也可聚焦；此处不建议给所有静态节点保留 native tabindex。 |
| [reader.js L638–651](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L638-L651) `setupSourceCards` | 两种映射都会注册 hover/focus → 同一 `show`；但仅 `if(blockId)` 设置 tabindex=0、button role、name、aria-describedby 和 Enter/Space。 | source-only 已有 focus listener，却没有让普通键盘导航实际取得焦点的入口。`blockId` 是另一个合同，不应为补键盘而伪造 paragraph block。 |
| [reader.js L654–663](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L654-L663) | 来源卡 footer 链接支持 Tab/Shift+Tab；Escape 在焦点位于卡内时回 opener，再隐藏。 | 不需要第二套来源浮层、pin 状态或全局焦点栈；缺的是上游 opener 能被键盘到达。 |
| [reader.js L376–384](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L376-L384) | 单击节点打开已有 native Viewer 并 focus exact node；modal close 返回 viewerOpener。无 tabindex 节点当前回 Explore 按钮。 | 给 source-only 加 tabindex 会影响这个 opener 选择，必须明确并验证鼠标关闭后的返回位置变化，不能只加一行 tabindex 后说完全没有兼容影响。 |

这是源码/实际 HTML 的可判定差异；现场记录来自已发布 `3f95` 基线实验。最新 `10b4` 上未新生成/打开页面，因此不能把旧浏览器记录改称本轮最新 runtime 实测。修复前由 root 用同一完整输入和当前 runtime 复验即可，不需要人为极端图。

## 既有入口为什么既有帮助、又没有完全替代

1. **来源编号能解决源码内容读取。** 此页本来有 `http-snapshot` citation，键盘可以沿编号查看同一固定片段/外链。不能声称源码不可访问、数据丢失或全页没有键盘路径。候选价值只在图节点到其来源映射的直接关联，不是新增一份源码。
2. **Explore / steps / Walk 已能进入原图。** 它们不是故障。现有 [Viewer Passport source evidence](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L345-L370) 需要 native repository/sourceEvidence；本例 source mapping 属于外层 Explainer，native spec 没这份来源，因此“去 Passport 就有相同源码”不成立。也不建议把所有外层来源迁入 native schema 来绕过一个焦点入口。
3. **静态语义列表保留节点与关系。** 列表没有在每个节点旁暴露这份 source ID 对应关系；它保住图事实，不代表鼠标 hover 的来源交接已具有同一局部键盘操作。
4. **直接补一个 blockId 是内容 workaround，不是同义修复。** `block:<id>` 会复用 paragraph、添加对应描述/Read this paragraph；此页本来只引用固定代码来源。为获得 Tabstop 新造段落会改变 authored 语义与可维护内容，不宜成为每位作者的默认负担。

## 查重结果

- **已集成 #997 的 blockId 路径必须保留。** [原 PR #997](https://github.com/tt-a1i/archify/pull/997) 明确扩展 paragraph reuse。当前 dev 的 `test/explainer-browser.test.mjs` 中 `retry layout and referenced node explanations remain readable and keyboard accessible after a prose edit`（L35 起）专门验证 `nodeBlocks:{check:'claim'}`，包含实际 card text、AX description、Tab/Shift+Tab、Escape、Enter/Space 开 native 与关闭返回。它没有 source-only 例，不把此覆盖算作候选已解决。
- **#1015 不重复实现。** 当时为 open/draft、target main，精确 head [`fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`](https://github.com/tt-a1i/archify/blob/fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8/archify/explainer/reader.js)。其 source focus lines、居中、expand/copy 是另一个范围；本轮实际读该 head 的 `setupSourceCards`，source node 仅 mouseenter/mouseleave，没有 focus/Tabstop/Enter/Space。不能只因 PR 标题含 interactive 就判定该差异已修。也不把本候选扩成 #1015 的预览或复制实现。
- **#1103 Atlas 不重复。** 最新只读 API 核对 head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，open/draft、target `labs/code-analysis`，变更在 Atlas payload/canvas 与 Classic findings hand-off；[PR #1103](https://github.com/tt-a1i/archify/pull/1103)。这个图内 source-card opener 不需要 Atlas/history/跨图导航。#998 是相关 code-analysis 工作，不能作为此 reader 缺口的已实现证据。
- **Keyboard traversal 实验不重复。** 已发布 [`d930863147cd6adfb5d4275f011c06caf4b24f92`](https://github.com/tt-a1i/archify/tree/d930863147cd6adfb5d4275f011c06caf4b24f92/experiments/keyboard-traversal) 修已声明 controls 的 bounded traversal 假阳性。当前 dev [browser-check.mjs L56](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/browser-check.mjs#L56) 与实验版都先枚举 a/button/role/tabindex 等；一个连 role/tabindex 都没有的 source-only SVG 节点不会成为 initial required control。不能靠门禁通过证明不存在该遗漏，也不需要改 gate 去把所有装饰图节点变成控件。
- **Source question tour 不重复。** 已发布 [`94d6a4d0`](https://github.com/tt-a1i/archify/tree/codex/lab-source-question-tour/experiments/source-question-tour) 的真实 `question-first.html` 本轮静态核对：6 个 nodeSources 同时有 6 个 nodeBlocks，source-only 为 0。其实际 citation Tab/Escape、node hover 和 native step 证据有价值，但不覆盖 CLI tour 这 10 个 source-only 节点。
- GitHub issue/PR 搜索 `SourceCard` / `nodeSources` / `Explainer keyboard` 命中 #997/#998、#1068/#1076 等；未找到精确 source-only Tab 修复。#1068 的整体 interaction initiative 与 #1076 的窄屏菜单/toolbar containment 不应被复制为新的大 initiative。本轮不发 GitHub 消息，也不声称搜索证明不存在任何未公开方案。

## 建议的最小行为合同（未实施）

采用已经研究的 source preview / goto 分离机制：保留 Sourcetrail、goto-preview、CodeTour 类工具所强调的“先看证据，再选择跳走”，本仓已有 card 与 native Viewer 各司其职。本候选只让相同 opener 能由键盘到达，不复制其 parser/indexer/历史系统。对应来源见既有 [source-navigation 调研](source-navigation-smalltools.md)，本轮不引入依赖。

| 用户动作 | 最小可观察结果 | 保留边界 |
| --- | --- | --- |
| 正常 Tab 到有合法 source 映射的 preview node | `response` 可被到达；实际 AX role/name 是可激活控件及原节点名字；同一 card 显示相同固定 revision/path/range。 | 未绑定节点继续是静态预览；不全体加 Tabstop，不复制源码或新造 blockId，不覆盖节点身份为源文件名。源码卡与可操作链接应实际可被辅助技术找到，不能只断言有属性。 |
| Tab 从 focused node 前进 | 进入既有 card 的 Open source 等有效链接；Shift+Tab 回该 node；最后一链接后继续正常文档顺序。 | 复用既有 opener/card；没有可操作 footer 时应继续文档，不制造空焦点圈或 trap。 |
| Escape 在来源卡链接内 | 隐藏 card 并回到这个 node；随后 Tab 正常前进而不循环重开卡。 | “固定来源”指已有 revision，不新增 card pin/history 状态。仅 hover 且焦点在卡外时保留现有不强行移焦条件。 |
| Enter / Space 激活 source-only node | 走既有“开原生图并 focus exact node”动作；Space 不滚页、只激活一次；关 modal 后回键盘触发 node。 | 不把 Enter 偷换为自动打开 GitHub；真正 Open source 仍是 card 中明确的外链。保留 hash 校验、原生 iframe 与现有焦点返回。 |
| 鼠标 hover / click | hover 仍显示同一 source card；click 仍开同一 native focus。 | 当前无 tabindex 的鼠标 click 关闭 modal 回 Explore；如果要求鼠标行为严格不变，应保留这个返回位置。实现必须检查 `node.hasAttribute('tabindex')` 对 viewerOpener 的间接影响，不能无说明改变。 |
| 同时 nodeSources + nodeBlocks | 源码和 paragraph 仍共用原 card，保留 paragraph aria-describedby 和 Read this paragraph。 | 既有 #997 行为必须继续通过，不用新 helper 框架替换整个 reader。 |

是否把新 source-only focus 视为 button action，应由实际 AX 与 Enter/Space 行为一起验证；不要只靠源字符串或 `tabindex` 属性断言完成。这里没有承诺每次 Tab 自动读出完整代码，也不引入全局 ARIA live narration。

## 验证责任与 root 可复验动作

实现 owner 最窄应是 `archify/explainer/reader.js` 的 source-node 初始化与必要的 activation/opener 区分。renderer 的 `staticSvg` 总体静态边界保留；若必须动 render，应先证明为什么只在 runtime 为有映射节点补操作不够。不要改 schema、native Passport、Atlas、source parser 或 keyboard gate。

- **真实固定对照**：沿用上面的完整 CLI tour authored source 与 frozen prepared bundle/完整 HTML，分别绑定 base `10b4` 与候选 reader，不改 source bytes、10 节点、11 个 pinned source 或 mapping。重生成需要官方固定 Git 对象时只由 Archify 读取，不能运行 Walkthrough CLI/server。
- **root 浏览器动作**：先在原实际页 hover response 确认既有来源卡及 pinned a373 / L84–98；指针移出来源目标，再用真正 Tab 追踪能否进入 response。随后用当前 dev 同输入重生结果验证仍有该差异。候选只新增该关联的键盘访问；记录 node→footer→Escape 与 node→Enter/Space→native focus→close 返回。不要用 `element.focus()` 成功充当真实 Tab 可达证据。
- **focused test owner**：`test/explainer-browser.test.mjs` 的已有 paragraph-source-card 用例可扩成 source-only / block-only / both 的小矩阵，保留源码 byte/path/revision、真 Tab、AX role/name、Space 不滚动、native exact node、关闭返回与鼠标 click 的既有结果。source-only 可直接取真实 CLI tour 的 response/source mapping；不造超大图。无需每种 diagram type 再复制一套同样 matrix。
- **现有 render contract**：`test/explainer-renderer.test.mjs` 的 `resources fail closed and native previews preserve identity without leaking styles` 可复用，不改静态节点 DOM 身份/原生子图 bytes。若实现只动 reader，不新增会冻结 private implementation 的源码断言。
- **回归范围**：source-only 无 footer、未映射节点、共享一个 source 的两个节点、双映射节点、Escape card 外焦点的行为属于相邻失败边界；选择能区分结果的少量场景即可。`source-question-tour` 的 block+source 产物作为兼容样本，不当本缺口的成功例。已有 keyboard-traversal 修复的 bounded checks 如需复用须标精确 revision，不能以改预算掩盖新的焦点循环。

此处没有测试运行结果或新截图，只有只读来源/产物核对与过去现场记录的准确引用。对这个输入存在的局部键盘等价差异有依据；最新 runtime 的实际焦点顺序、辅助技术效果以及是否值得新增 10 个 Tabstop，仍由受控浏览器对照决定。

## 后续实施范围

协调 Agent 在用户已授权的实验范围内开始独立分支实现，并选择复用现有 opener 判断；这不是人类维护者已审核或验收的声明。具体变化是：source-only 成为可聚焦节点后，鼠标点击原图的关闭返回点也由 Explore 按钮变为实际节点。鼠标 hover/click 的目标不变；这是明确接受、需要实测的焦点一致性变化，不为保留旧返回点新增输入模式/history 状态。上文严格保留 Explore 返回的讨论是审计时的兼容选项，不是最终必须实现的合同。审计本身未运行浏览器或测试。
