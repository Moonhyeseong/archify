# 第八轮：作者诊断、错误位置与渐进纠错

调查日期：2026-10-25。读取研究中心及现有13份scout的仓库清单后排重，不设star门槛。本轮核对 **11个新来源**：9项有固定版本明确许可证，2项仅公开源码、未找到许可声明，单列观察边界。只读上游源码，没有安装或运行这些工具，没有修改Archify产品；为验证自然失败的最小重现，只在checkout外创建临时文本并调用现有只读 `validate`。本报告是唯一新增仓库文件。

## 结论：一个有实际重现的最小切口

**Archify已经生成了位置，文本呈现却丢掉了位置。** 在固定产品基线 `82c7e0f089a02a4d514714adf37dc2061682da5f`：

- [公共CLI formatDiagnostics，L2788–2796](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/bin/archify.mjs#L2788-L2796) 只拼 `[code] message + supportedFixes`，不呈现subject。
- [preview.publishFailure，L599–605](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/bin/preview.mjs#L599-L605) 对前12条诊断也作同样投影；不是缺少诊断协议。
- [shared diagnostics](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/shared/diagnostics.mjs) 已保留 `subject/evidence/supportedFixes`，且明确只对完全相同code/message/subject去重。**不能按同message把不同位置合并掉。**

作者在Payload delta实验中自然遇到重复表格第一列导致`explainer/duplicate-id`。旧raw失败receipt确有三条不同位置，但原始Markdown后来已被生成器替换，旧receipt又没有specSha，因此不能把后来文件当成旧输入证明。本轮另建了**明确标注的最小重现**，对同一输入分别采实际text和JSON输出，确认：text三条同文，JSON三条分别有行13/14/15及独立row pointer。

第一刀应该只是**把已有subject位置显示出来**：line/column/path/node/id等有值才显示，缺失不猜，不新增规则、不新增数据格式、不读另一份可能漂移的源文件、不做自动修复。不需要引入本轮任何Rust诊断库、LSP或错误消息parser。

## 1. 11个新来源：输入输出与可借鉴机制

固定commit与许可在末表；源码链接均固定revision。描述区分上游声明与局部源码核对，没有把截图或项目名当效果证明。

| 来源 | 真实输入 → 输出 | 已核实的小机制 | 对Archify的价值与不能声称的语义 |
| --- | --- | --- | --- |
| [zkat/miette](https://github.com/zkat/miette) | Rust Diagnostic/error + source spans/labels/help/related → graphical或narrated诊断打印。 | [protocol.rs](https://github.com/zkat/miette/blob/e853bbf9bc78bbe0b225995de54a3108d77dcaf8/src/protocol.rs) 分code、help、URL、labels、related及diagnostic_source；LabeledSpan有primary标志。README明确fancy feature会额外拉依赖，另有面向screen reader的输出。 | **错误内容与显示方式分离**，当前Archify协议已足够；学投影，不引入库。related不自动等于cause；好看不能替代真实位置和失败状态。 |
| [zesterer/ariadne](https://github.com/zesterer/ariadne) | Source/cache + report +多个跨行/跨文件labels → 终端诊断图。 | [label.rs](https://github.com/zesterer/ariadne/blob/5e62913d34dabf34140ad812448dc8faae5abf15/src/label.rs) 验证span方向，分label order与priority；README有multifile例，固定GitHub仓库说明上游已移Codeberg。 | 可参考“主位置+关联位置”的阅读顺序，不复制完整终端布局。label priority是显示优先级，不是错误severity或修复先后因果。README badge说双许可，但当前Cargo和完整LICENSE都为MIT，以实际固定文件为准；不把GitHub镜像称最新上游。 |
| [brendanzab/codespan](https://github.com/brendanzab/codespan) | 文件集合 + Diagnostic{severity,code,message,labels,notes} → 源码框和主/次标记；另有LSP适配。 | [diagnostic.rs](https://github.com/brendanzab/codespan/blob/b56329354ce0ecbe4afe7c85f7b76417678a5ef8/codespan-reporting/src/diagnostic.rs) 明确Primary/Secondary、file_id、**byte range**，不靠错误消息猜来源。 | 本轮最直接启发：显示已有定位比增加一段泛化建议有用。Byte offset、LSP字符列、JSON Pointer、HTML元素不是同一坐标；没有源字节绑定时不画“精确错误下划线”。 |
| [ajv-validator/ajv-errors](https://github.com/ajv-validator/ajv-errors) | JSON Schema的errorMessage + Ajv原始errors → 定制说明及`params.errors`中的原始诊断。 | [src/index.ts](https://github.com/ajv-validator/ajv-errors/blob/7efe8c29c3ea461eef29335e0199742dbc18e791/src/index.ts) `singleError`可拼说明，`keepErrors`决定顶层保留；被消费的errors仍可在生成message的params内保留，匹配基于instancePath/schemaPath等。 | **人读说明不能抹掉机器证据**。当前Archify已有schema与语义诊断，不为改文案引入plugin/重编validators。不能按相同message判为同因，也不能把聚合成一条当作修复了一部分错误。 |
| [DavidAnson/vscode-markdownlint](https://github.com/DavidAnson/vscode-markdownlint) | 文档+markdownlint结果/ruleInformation/errorRange/fixInfo → VS Code范围诊断、rule链接与有条件quickfix。 | [extension.mjs L647–709](https://github.com/DavidAnson/vscode-markdownlint/blob/21618bcf521a277bb0d2c98e6656da8af1ab255f/extension.mjs#L647-L709) 将1-based行/范围转编辑器坐标，code可连rule URL，只有存在fixInfo才给修复action。 | 借鉴“定位、规则解释、可执行修复是三层”。Archify supportedFixes通常是建议，不应伪装成已验证TextEdit；不导入Markdown规则引擎，也不从文案生成自动编辑。 |
| [rachartier/tiny-inline-diagnostic.nvim](https://github.com/rachartier/tiny-inline-diagnostic.nvim) | Neovim诊断集合+cursor/severity/display opts → 当前位置的inline虚拟文本、相关说明、可切换视图。 | [filter.lua](https://github.com/rachartier/tiny-inline-diagnostic.nvim/blob/46ae9b3c8f3039e96ff4497d190ad0aee091f30d/lua/tiny-inline-diagnostic/filter.lua) 分severity过滤与位置过滤，并显式处理zero-width诊断；[override.lua](https://github.com/rachartier/tiny-inline-diagnostic.nvim/blob/46ae9b3c8f3039e96ff4497d190ad0aee091f30d/lua/tiny-inline-diagnostic/override.lua) 打开float时暂关inline，关闭后只在原先启用时恢复，避免重复提示和覆盖用户开关。 | 阅读焦点可以局部，但总体失败列表必须保留；“现在没显示”不是“已修复”。本轮没有Archify编辑器内光标诊断的自然需求，不建议新建overlay或接Neovim。 |
| [dgagn/diagflow.nvim](https://github.com/dgagn/diagflow.nvim) | LSP diagnostics + cursor/line范围 +窗口尺寸 → 右上或inline消息。 | [init.lua](https://github.com/dgagn/diagflow.nvim/blob/b13321b517ff64bf42eeac2214085d3c76d83a0d/lua/diagflow/init.lua) 区分更新事件`DiagnosticChanged/BufReadPost`与展示事件`CursorMoved/WinResized`，有scope和最大宽高。 | 学“数据更新与显示焦点分开”，不能把cursor移走后的隐去叫错误消失。固定树无LICENSE/package许可声明，**仅公开源码观察项，不作可复用开源代码推荐**。 |
| [3rd/diagram.nvim](https://github.com/3rd/diagram.nvim) | Markdown/Neorg中的diagram blocks → renderer外部进程 → image.nvim图像。 | [init.lua](https://github.com/3rd/diagram.nvim/blob/54d71d6ae72afa236eedb2a918a35d7414ba39f6/lua/diagram/init.lua) render_buffer先clear旧图，再查询/调renderer，轮询job完成才render_image。README列外部mmdc/PlantUML/D2/gnuplot依赖。 | 这是**反例**：不能因“实时预览”就推断保留last-good，更不能运行陌生renderer探是否安全。Archify已有更明确的last-verified身份，无需复制进程/图像栈。固定树只有README和lua，未见许可声明。 |
| [qjebbs/vscode-plantuml](https://github.com/qjebbs/vscode-plantuml) | 当前PlantUML块+local/server renderer → processing/error/default预览、导出图或错误图。 | [previewer.ts L151–207](https://github.com/qjebbs/vscode-plantuml/blob/7bc1758ed73dc269f5721d78c6c6c01f461d7cb0/src/providers/previewer.ts#L151-L207) task完成/失败前检查canceled，失败分error text和imageError；processing可显示既有export缓存。 | “显示旧图”与“当前生成成功”要分开。取消旧任务避免晚结果覆盖新状态，但不等于强证据绑定；本轮不引入Java/服务端render/include processor，也没有向远端发送图。 |
| [mjbvz/vscode-markdown-mermaid](https://github.com/mjbvz/vscode-markdown-mermaid) | Mermaid fenced/container blocks → Markdown preview/webview中的图与交互。 | [shared-md-mermaid](https://github.com/mjbvz/vscode-markdown-mermaid/blob/9f4d37ded0cc7fdf05bbab17fb082a6fc118e269/src/shared-md-mermaid/index.ts) 明确Markdown插件只识别块，实际render在webview；[diagramManager.ts](https://github.com/mjbvz/vscode-markdown-mermaid/blob/9f4d37ded0cc7fdf05bbab17fb082a6fc118e269/src/shared-mermaid/diagramManager.ts) 按instance ID保存/清理视图状态。 | 有解析、渲染、视图三层，错误位置必须说明属于哪层，不能把render fail都叫Markdown语法错。固定README明确deprecated并称已并入VS Code 1.121；本轮未验证具体安装版，不建议依赖已退休扩展。`bierner.markdown-mermaid`是Marketplace ID，不是GitHub owner路径。 |
| [yoavbls/pretty-ts-errors](https://github.com/yoavbls/pretty-ts-errors) | 来自已支持TS/JS诊断provider的复杂类型错误 → 结构化hover/sidebar、pin/copy等人读呈现。 | [diagnostics.ts](https://github.com/yoavbls/pretty-ts-errors/blob/447966d8f418c9b3e3b13bd50378ce63e1b89e12/apps/vscode-extension/src/diagnostics.ts) 只处理已支持source；[cache key](https://github.com/yoavbls/pretty-ts-errors/blob/447966d8f418c9b3e3b13bd50378ce63e1b89e12/packages/vscode-formatter/src/format/getDiagnosticCacheKey.ts) 同时包含message、range、code和related location/text。 | 格式化缓存不能只用message，位置或related信息变化必须改变key。Archify短错误不需要TS消息解析器；只借鉴不丢定位/关联信息的投影原则。美化不代表类型错误已解决。 |

## 2. 深读：对作者有用的三条合同

### A. 主位置、相关位置和修复建议互不替代

Codespan的Primary/Secondary和miette的labels/related/help表明，“发生在哪儿”“还涉及哪儿”“建议怎么修”应保持可区分。Ariadne的order/priority用于排版，不负责推断因果。把所有label都排成一份线性“先改这里再改那里”的清单，可能误导作者。

对于Archify当前自然duplicate-id失败，最低信息已经存在：`subject.line/column/component/path`。先把它们以普通文本呈现即可，**不需要源码codeframe**。缺少end range时不猜划线长度，缺少源码hash时不声称carat对应当前工作树。JSON Pointer中的转义和控制字符也需按字面显示，不能把它解析成Markdown/终端控制序列。

### B. 人读摘要可以缩短，原始错误与不同位置不能减少

ajv-errors提供不同message聚合选项，同时能保留底层errors。pretty-ts-errors把范围和related位置纳入cache key。对应到Archify，应坚持：同一message的不同subject是不同记录；“作者只需做一次布局调整”不代表只有一处错误。

另一份真实记录来自Recipe stages的迭代：三个节点都报`workflow/sublabel-readability`，画布1253px，要求8.1px，但supported slot最多8px，建议压到1240px以内。三个subject分别是`before/body/after`与各自JSON Pointer。可以做**作者说明示例**：“这次三条失败共享同一画布约束，三个位置都受影响”，但不能把这种结论泛化成同code/同fix的通用去重器。原始三个错误仍完整保留；实际最后修法是调整实验表达、把qualified names放在cards/table，不能从诊断声称自动验证任何缩宽都能通过。

该失败spec SHA为`126d18f56b0ab6f2124522d5e095d302a37a88cf5bf21b6728bdc6f5045d2515`；最终通过spec SHA为`0d568ad3379b8680324acc5e47144f80a744e7010cc8eb033b4e671f9cf89b80`。这些是作者本地实际记录，**不是本轮新跑的修复效果实验**，也不能拿最终源码当旧失败源码。

### C. 预览状态与当前诊断各有自己的身份

PlantUML的canceled检查说明异步结果有过期问题；diagram.nvim先清图说明实时更新也可能丢last-good。Archify已有更强的候选hash、generation/epoch和lastVerified区分：

- [preview render，L112–129](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/bin/preview.mjs#L112-L129) 明示`Verified rev`或`Needs fix · showing rev`，Checking又是独立状态。
- `commitCandidate`和runLoop检查当前source hash、generation epoch，保留last-verified而不是把旧图涂成新成功。
- [#930](https://github.com/tt-a1i/archify/pull/930) CLOSED、[#991](https://github.com/tt-a1i/archify/pull/991) MERGED，状态已刷新；#991就是给needs-fix显示所载revision。

所以**不再建议last-good预览feature**。若后续需要作者示例，直接展示已有“旧verified图仍在、当前generation失败、错误对应新输入”的三重事实，不新加预览服务。

## 3. 具体可复现输入与实际输出绑定

### 自然来源与这次重现的区别

Payload delta最初把`modified/removed/added`当表格首列，重复label被restricted authoring的comparison行身份生成规则复用，导致三个`duplicate-id`。旧receipt记录行21/22/23及`/panels/1/blocks/1/rows/{2,3,4}/id`，但没有输入hash，原文件后来替换，**原始输入证据链不完整**。

下列是本轮冻结的**最小重现，不是旧原件**。它保留同一种自然作者错误，删除无关diagram和payload详情：

```md
# Which payload fields changed? {#payload-fields}

Compare the original synthetic samples by field. This minimized reproduction preserves the repeated first-column labels observed during payload-delta authoring.

## Which field changed? {#changes}

Each row shows one sample change. These first-column labels intentionally repeat to reproduce the authoring failure.

| Kind | Before | After |
| --- | --- | --- |
| modified | string count | number count |
| removed | cursor null | missing |
| modified | original item order | reordered items |
| modified | stock 4 | stock 6 |
| removed | legacy true | missing |
| added | missing | next null |
```

UTF-8、LF、末尾一个LF，共646bytes。Input SHA-256：`fc47419405dd0f47be7e8ce6caebfc6974fd3979f0023759ef82ba9c4a722aec`。

实际执行：Node 22.23.3，`validate explainer <same-file>`与加`--json`各一次，两次退出码均1，前后输入hash相同。研究checkout相对基线的`archify/**`源码diff为空；只读验证未生成/替换HTML。

| 输出 | bytes | 实际SHA-256 | 结果 |
| --- | --- | --- | --- |
| text stderr | 463 | `ceb797f6c29bd1b1d972b875c3b45967b81e37cb4455b74861b5a316b39d3679` | 三条同文duplicate-id，没有subject位置 |
| JSON stdout | 2339 | `60df02417b4fbe8b71575bf473209c9a2886ce5d3b3df6fad183d26b582cf51b` | 三条不同subject，行13/14/15、column1、component comparison、`/panels/0/blocks/1/rows/{2,3,4}/id` |

原始JSON包含临时本机输入路径，保存在checkout外，未作为公开报告附件。其raw SHA用于审计本次实际输出，并不声称把此文件移到另一个目录能得到相同raw SHA。重放时应比较diagnostic code、line/column/path/component、数量和exit，另外绑定重放者自己的input/output hash。text stdout和JSON stderr均为空。

## 4. 最低实现切口与测试入口（本轮没有实施）

**建议的下一实验：diagnostic locations text projection。** 对上述同一输入保留相同3条诊断，文本在各条message旁呈现已有位置，例如“reported line 13:1 · comparison · /panels/.../rows/2/id”。不是新错误规则，不新增diagnostic字段，不改变JSON、exit、校验接受条件或失败时旧产物保护。

最小边界：

- `line/column`仅当已有正整数时显示；缺少column就只显示line。node/id/component/panel/path只取已存在且合适类型的字段，缺失就省略，不填“第1行”替代未知，不推断范围或调用关系。
- 字面显示控制字符、换行、引号、Unicode与JSON Pointer；不把subject当format string、Markdown或URL解释。人读位置称“reported”，不夸大成源码span已重新验证。
- 不为了新增位置读磁盘文件；默认不把私有绝对路径带进分享产物。预览沿用已有redaction，不能先redact旧文字、再把原始subject路径补回去绕过脱敏。
- 维持现有诊断数量与顺序；相同message不同subject不合并。无subject诊断仍能读，generic fallback不崩溃。
- 最小实现可先只改公共CLI formatter证明价值；若扩到renderer直跑和preview，应跟踪三个现有formatter调用边界，避免只修一条路径却声称所有作者入口已完成。

已读取的最直接测试入口：

| 入口 | 现有保护 | 应增加/复用的最低证据 |
| --- | --- | --- |
| `test/explainer-cli.test.mjs` | 已有“parse and semantic failures preserve existing artifact and actionable locations”，断言JSON的subject.line/component与失败不覆盖HTML。 | 加真实公共text validate/deliver的同输入对照：3个位置都可辨、JSON字段未丢、exit不变。复用已有失败保护，不另起大矩阵。 |
| `test/render-failure-diagnostics.test.mjs` | public/direct renderer失败的code、stderr/stdout边界、不暴露stack及victim保护。 | 若触及direct renderer formatter，覆盖带subject与无subject各一真实路径；不要冻结整段文案或源代码字符串。 |
| `test/preview-shell-status.test.mjs` | 用served shell实际脚本验证checking/verified/needs-fix与当前载入revision。 | 若改preview呈现，只增加已有诊断位置信息被显示、旧verified身份仍不变的验证；不把mock状态当真实browser验收。 |
| `test/preview.test.mjs` / `test/preview-contract.test.mjs` | 实际预览服务状态、候选提交与资源/输出责任。 | 只在该formatter路径被修改时选相应focused case；不因此无差别跑所有浏览器/renderer矩阵。 |

**验收应看作者能否更快定位正确行**：独立reader拿同一失败text，是否直接找到正确三处而无需先重跑JSON；不得只以多了几个数字、snapshot更新或tests green称已降低修复成本。机器测试可保护不丢位置，人类或明确标记的Agent pilot才能补充定位便利证据。

## 5. 不应扩大与已有工作排重

- [#1089](https://github.com/tt-a1i/archify/pull/1089) OPEN，正文已读：patch explainer保留`archifyDiagnostics`而非给错误压缩payload建议。它修的是诊断在异常边界丢失；本轮切口是已有subject未显示，不复制其bug修复。
- [#891](https://github.com/tt-a1i/archify/pull/891) OPEN，正文已读：补sequence canvas层typed diagnostics与verified repair；不在本轮给更多validator自动生成修复建议。
- [#308](https://github.com/tt-a1i/archify/pull/308) 现有verified elbow repair方向；不以miette/help为理由另写通用geometry自动修复。
- 第七轮question-first源码导览与当前source-question-tour是源码阅读；这里是作者收到failure时的位置投影，不是另一个source-report converter。
- md-viewer的last-good机制已在早期报告研究，本轮没有再计数；Neovim overlay和Markdown/PlantUML完整编辑器也不引入Archify。
- 未找到“必须先写语言服务/通用codeframe/自动修复协议才能降低作者成本”的证据。大部分候选机制只值得参考，当前产品数据结构已经覆盖主要信息。

## 6. 固定revision与许可证

| 项目 | 查验commit | 实际许可来源 |
| --- | --- | --- |
| zkat/miette | `e853bbf9bc78bbe0b225995de54a3108d77dcaf8` | [Apache-2.0](https://github.com/zkat/miette/blob/e853bbf9bc78bbe0b225995de54a3108d77dcaf8/LICENSE)，Cargo同声明 |
| zesterer/ariadne | `5e62913d34dabf34140ad812448dc8faae5abf15` | [MIT](https://github.com/zesterer/ariadne/blob/5e62913d34dabf34140ad812448dc8faae5abf15/LICENSE)，Cargo为MIT；没有照搬README旧badge的双许可说法 |
| brendanzab/codespan | `b56329354ce0ecbe4afe7c85f7b76417678a5ef8` | [Apache-2.0](https://github.com/brendanzab/codespan/blob/b56329354ce0ecbe4afe7c85f7b76417678a5ef8/LICENSE) |
| ajv-validator/ajv-errors | `7efe8c29c3ea461eef29335e0199742dbc18e791` | [MIT](https://github.com/ajv-validator/ajv-errors/blob/7efe8c29c3ea461eef29335e0199742dbc18e791/LICENSE) |
| DavidAnson/vscode-markdownlint | `21618bcf521a277bb0d2c98e6656da8af1ab255f` | [MIT](https://github.com/DavidAnson/vscode-markdownlint/blob/21618bcf521a277bb0d2c98e6656da8af1ab255f/LICENSE) |
| rachartier/tiny-inline-diagnostic.nvim | `46ae9b3c8f3039e96ff4497d190ad0aee091f30d` | [MIT](https://github.com/rachartier/tiny-inline-diagnostic.nvim/blob/46ae9b3c8f3039e96ff4497d190ad0aee091f30d/LICENSE) |
| dgagn/diagflow.nvim | `b13321b517ff64bf42eeac2214085d3c76d83a0d` | 固定树未见LICENSE或package许可；[源码树](https://github.com/dgagn/diagflow.nvim/tree/b13321b517ff64bf42eeac2214085d3c76d83a0d)，仅观察项 |
| 3rd/diagram.nvim | `54d71d6ae72afa236eedb2a918a35d7414ba39f6` | 固定树未见LICENSE；[源码树](https://github.com/3rd/diagram.nvim/tree/54d71d6ae72afa236eedb2a918a35d7414ba39f6)，仅观察项 |
| qjebbs/vscode-plantuml | `7bc1758ed73dc269f5721d78c6c6c01f461d7cb0` | [MIT / LICENSE.txt](https://github.com/qjebbs/vscode-plantuml/blob/7bc1758ed73dc269f5721d78c6c6c01f461d7cb0/LICENSE.txt) |
| mjbvz/vscode-markdown-mermaid | `9f4d37ded0cc7fdf05bbab17fb082a6fc118e269` | [MIT](https://github.com/mjbvz/vscode-markdown-mermaid/blob/9f4d37ded0cc7fdf05bbab17fb082a6fc118e269/LICENSE)；固定README标deprecated |
| yoavbls/pretty-ts-errors | `447966d8f418c9b3e3b13bd50378ce63e1b89e12` | [MIT](https://github.com/yoavbls/pretty-ts-errors/blob/447966d8f418c9b3e3b13bd50378ce63e1b89e12/LICENSE) |

完成：11个新来源、特定源码与许可核实，3个机制的深入边界，实际自然问题来源审计和新冻结最小输入的两次公共validate输出绑定，现有能力/PR排重和最小实现/测试入口。未实施：产品formatter变更、修复后对照、HTML/截图、用户定位效率验证、任何上游插件安装执行或远程发布。实现由另一个独立工作区负责。
