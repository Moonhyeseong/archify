# Round 16：Preview 重新打开边界，0 启动

记录日期：2026-10-25。固定产品基线：`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。
本轮采用 archify-review 的价值、成本、影响判断，只读源码、既有测试、GitHub 决策及 root 已采集的浏览器证据；没有改产品、执行测试、操作预览服务或打开浏览器。

## 结论

**不启动新候选。** 当服务已有上一份已验证图，但新客户端首次连接时当前构建为 `needs-fix`／`checking`，Preview 仍可能显示空白等待页。这确实限制了刷新、重新打开时的阅读体验，但它是先前明确接受的产品边界，不是本轮发现的新遗漏。

去重命中 [issue #927](https://github.com/tt-a1i/archify/issues/927)、已关闭的 [PR #930](https://github.com/tt-a1i/archify/pull/930) 和已合入的 [PR #991](https://github.com/tt-a1i/archify/pull/991)。Root 确认本轮按 0 启动处理：不把已知范围限制另造为缺陷，不新建恢复功能分支。

## 固定 dev 的实际责任边界

对应入口是 `archify/bin/preview.mjs`，不是 Viewer 模块下的 `preview.mjs`。

| 位置 | 当前实际行为 |
| --- | --- |
| [previewPage / render，L111–134](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L111-L134) | 只有收到 `status === 'verified'` 才设置 iframe `src`、记住本客户端 `lastRevision` 并显示图。`needs-fix` 保留已挂载 iframe，状态文案依据本客户端的 `lastRevision`。 |
| [初始状态与 SSE，L405–425、L483–490](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L405-L425) | 服务初始 revision 为 0、`lastVerified` 为 null；每个新 SSE 客户端立即收到当前状态，而不是先重放过去的 verified 事件。 |
| [artifact.html，L472–480](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L472-L480) | 没有内存 `artifactBuffer` 时返回 404；有则提供保留的已验证 HTML，不要求当前状态仍为 verified。它不从当前无效输入或任意磁盘 HTML 临时生成内容。 |
| [发布失败，L616–635](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L616-L635) | 只更新 `status`、failure 诊断并广播；不清空上一份 buffer、revision 或 `lastVerified`。 |
| [成功发布，L638–716](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L638-L716) | 校验 receipt 的 SHA／bytes 与捕获文件身份，确认当前源没有被后续编辑替代，完成已有原子发布后才更新 buffer 和已验证状态；不同 artifact 才增加 revision。 |
| [构建完成回调，L804–839](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L804-L839) | 仅未停止、未过时、退出 0 且 receipt.ok 的结果进入提交路径。失败或过时构建不能作为新已验证图发布。 |

所以“服务保留已验证图”和“某个新页面已经加载了它”是两个事实。空白客户端的 `no verified revision` 描述的是本页没有显示的 revision，并不宣称服务没有 `lastVerified`。同一个页面先见过 verified 再进入失败，仍保留旧图。

已有 shell 回归明确保护这一边界：

- [preview-shell-status.test.mjs L109–117](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/test/preview-shell-status.test.mjs#L109-L117)：首次在 needs-fix 连接的客户端不声称已显示某 revision，`hasArtifact=false`、`src=null`。
- [同文件 L119–135](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/test/preview-shell-status.test.mjs#L119-L135)：先收到 verified 的客户端在 needs-fix 中继续命名原显示 revision，重新验证后更新它。这是执行真实 shell 脚本的最小 DOM／EventSource VM 检查，不是浏览器可视验收。
- [preview.test.mjs L217–276](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/test/preview.test.mjs#L217-L276)：真实服务在输入删除、JSON 无效、schema 错误时保留旧输出和 `/artifact.html`，修好后发布新图。这保护服务留图，不要求晚连接页面自动挂载。

本轮只读这些测试，没有重跑，也没有借用 dev CI 作为新候选验收。

## 已有决策时间线

以下是当前 GitHub 原记录，时间保留 UTC：

| 时间 | 决策／状态 |
| --- | --- |
| 2026-10-16 02:51:25 | [#930 的维护者关闭说明](https://github.com/tt-a1i/archify/pull/930#issuecomment-6206943802)：接受在 checking／失败时重新打开出现等待或空页；当时认为恢复旧图的实际收益不足以承担实现和回归维护，关闭恢复功能 PR。说明允许未来有更广泛使用证据时重看，未指控实现质量。 |
| 2026-10-16 02:51:30 | #930 关闭，未合入。该 PR 曾提出的正是把 `lastVerified` 恢复与当前状态展示分开；本轮不能将同一方案作为无历史的新修复。 |
| 2026-10-16 03:32:40 | [#927 的范围收窄说明](https://github.com/tt-a1i/archify/issues/927#issuecomment-6207467175)：只保留“空页却声称正在显示旧 revision”的文案问题，明确不请求恢复图或扩状态模型。 |
| 2026-10-20 07:39:50 | [#991](https://github.com/tt-a1i/archify/pull/991) 合入。仅让 needs-fix 状态使用已有 `lastRevision`，并增加三项 shell 回归及同步 ZIP；不改变 `/state`、`/artifact.html` 或服务发布规则。 |
| 2026-10-25 07:40:27 | [#927 最终关闭说明](https://github.com/tt-a1i/archify/issues/927#issuecomment-6394984023)：确认 #991 已在 dev `82c7e0f0`，仅完成约定的文案范围；再次说明恢复 `lastVerified` 被明确排除。issue 于 07:40:29 关闭。 |

固定 dev 10b4 仍具有上述 shell 条件及三项回归。因此本轮实际观察没有揭示 #991 失效，也不能因 #930 未被合入就认定恢复功能仍是待补 bug。

## 本轮自然入口观察：Diagnostic 候选，不是原 dev 浏览器重跑

Root 在 Diagnostic 刷新候选上运行自己的临时 Tree 输入；该产品候选只改变已有诊断位置的文本呈现，不改变 Preview 的挂载逻辑。Root 控制的预览服务和同一页面构成两条观察路径：

| 观察阶段 | Root 实际记录／报告 | 能支持的结论 |
| --- | --- | --- |
| 晚打开 | generation 2，needs-fix，revision 1；服务 `lastVerified.sha256=6a4e412993e731b02694f0945d4067bfd0cc3e611d5d9a46ae44a75385d9783a`、854346 bytes、9/9 checks；新页面 iframe src 为 null，显示 needs-fix／no verified revision 和等待占位。 | 服务已有上一图，但新客户端没有挂载。JSON 与原 PNG 均已只读检查；PNG 中诊断可见，画布为空。 |
| 恢复 valid | Root 恢复同一份已经验证过的 valid 输入；`observed-restored-state.json` 实际为 generation 2、verified、revision 1，页面随之加载该图。因为源恢复为已验证内容，这一步不增加 generation。 | 这为随后同页保留旧图建立真实前提，不是把服务过去验证过等同于页面已经看过。 |
| 再次 invalid | `native-observations-corrected.json` 实际为 generation 3、needs-fix／showing rev 1；iframe src 为 `/artifact.html?revision=1&sha=6a4e412993e7`，原图正常保留；未改变产品 source。 | 同页已经加载后保留旧图的既有路径正常；与晚打开空页形成对照。 |

证据范围：本轮没有在原 dev 10b4 启动浏览器；对其相同逻辑的结论来自固定源码和 owner 测试。上述实际 UI 来自 root 的 Diagnostic 候选运行，不能写成 dev 原版 browser red/green，也不是新实现的 after 图。本报告也实际查看了 root 后续 `native-needs-fix-retains-verified.png`：Generation 3 诊断、showing rev 1 与 Dispatch→Worker 旧图同时可见。该图片与 late-open 空页是不同页面阶段，不是恢复功能修复的 before／after。Root 之后已停止其服务，本轮不继续操作。

读取时原件留在 root 临时证据目录，不复制到公开报告目录；以下仅保留 basename 与实际字节指纹：

| 原件 basename | bytes | SHA-256 |
| --- | ---: | --- |
| `late-open-observations.json` | 1668 | `d0d7d60f997e561300942fcdd0ff2446cfa4c4defb6b083af32c8c4f58433a6c` |
| `late-open-no-mounted-revision.png` | 223309 | `f3b9fe6a10382f6bb05e64e3584a69d9b407d5ef6db517258501162cad85d429` |
| `observed-restored-state.json` | 282 | `8afc22ce6210aaf2f894d1f0564d54ca85ccd68795ad322023bcc5e120d1e3aa` |
| `native-observations.json`（保留原先错误 note） | 1754 | `69a58c47f9aa2fc73c1ee2c4a1d9d4f04756fcd8a935eaef1c0da3c15d8c1359` |
| `native-observations-corrected.json` | 2156 | `92fc043650649baf6e6ac81495750ad360066660294aa5599f2c259abc6b9c83` |
| `native-needs-fix-retains-verified.png` | 77142 | `96db9c539d559d94517be8d3fb380b3a0302989e074dd60ac6d549b2046da94b` |

更正记录明确保留：root 首次口述和 `native-observations.json` 的 note 把恢复／再失败猜成 generation 3／4，真实 JSON 记录为恢复时 generation 2、再失败 generation 3。最终依据更正派生文件；其 `annotationCorrection.sourceSha256` 匹配保留原件。本报告已核 corrected 与 original 的 `ui`、`response` 完全相同，仅 note 更正并增加说明，没有改写实际观测字段。单独的 restored-state JSON 只证明服务 verified；页面已挂载的后续事实另由 iframe src 与实际保留图截图支持。

## 价值、维护成本及未来重新讨论的条件

晚打开时保留旧图可能有具体价值：重载页面、稍后返回或第二个本地客户端查看时，能同时读上一份可用图与当前失败诊断。它也可能造成上一图与当前输入的时效混淆，需要持续保证失败状态仍明显。此前产品取舍已评估过这对收益和回归成本，本轮一个已知入口重现不足以自动推翻它。

若未来有实际需求，重新讨论应先提供：

1. 哪类真实阅读／编辑任务需要在无效输入期间重新打开，当前空页怎样阻断该任务，以及现有已打开页保留图为何不足；避免只重复同一个实现可行性演示。
2. 明确恢复的是服务保留的已验证 artifact，不是把当前无效输入标为 verified；当前 checking／needs-fix 状态及诊断必须继续显著展示。
3. 在已有 shell 上把挂载判断与状态展示分离的最小范围评估，不增加另一套状态、磁盘读取或源求值。复用现有 server `lastVerified`、revision 与本客户端 `lastRevision` 来避免同 revision 反复刷新；不牵连 Diagnostic 文本实验、Viewer 或渲染器。
4. 真实回归按受影响边界选择：从未验证时保持空页；首次在 needs-fix／checking 连接时显示保留图；同 revision 不重建 iframe／丢失 Viewer 状态；新 verified revision 正常更新；失败诊断继续可见；服务的失败／过时构建仍不能发布为新图。

实现细节不能夸大现有保护：当前 iframe URL 携带 `revision` 和 SHA 前缀，但 `/artifact.html` 路由不校验这两个查询参数，它们不是按旧 revision 取图的独立协议。服务器始终返回当时内存中最近已验证的 buffer。若未来恢复功能要求“状态消息与取回内容逐字节同 revision”，必须单独明确该要求及必要成本，不能把现有 cache token 描述成服务器身份验证。

目前维持已约定的简单行为，记录此限制；不写产品、不开候选、不发布外部评论、不更改 issue／PR 状态。
