# 16:18 dev 刷新：finalize 的有界源范围修复

2026-10-25 16:18:28（台北）协调者已核远端并 fetch：dev 为 [67f12389212c54b3122da60e2813c7f8dab7ab2f](https://github.com/tt-a1i/archify/commit/67f12389212c54b3122da60e2813c7f8dab7ab2f)，来自 [PR #1100](https://github.com/tt-a1i/archify/pull/1100)；main 仍为 `51a291770851ad27a400cca73c753c166b5e0c65`。本文只读比较 [3f95f0349c8276db71509ca239461b6fe9d00f9f](https://github.com/tt-a1i/archify/commit/3f95f0349c8276db71509ca239461b6fe9d00f9f) 与新 dev，未运行新测试或重生成实验。

## 实际变化

净 diff 只有8个文件：`archify.zip`、`archify/bin/finalize.mjs`、delivery-contract、atomic-output、repository-evidence及三个测试文件。finalize是343行新增/164行删除（507行改动），不是改了507行产品渲染算法。未改Viewer、Explainer reader、clipboard逻辑、CSS、schema、软件notice或许可证。

[repository-evidence.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/renderers/shared/repository-evidence.mjs) 的越界诊断现在带原 `line` / `endLine`。起点有效而终点超过固定文件长度时，修法具体给出文件末行；起点本身无效则要求重读文件选真实行。诊断仍不证明引用内容的事实正确。

[finalize.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/bin/finalize.mjs) 新增一次受限修复机会：

- 只在第一轮嵌入validate失败，且所有诊断都是 `repository-evidence/line-out-of-range` 时考虑。必须有非空文件、已存在的正整数起点、明确越界终点；诊断pointer、path、line、end_line须与候选吻合，候选身份/字节也须未变。
- 只把已有引用的 `end_line` 收至固定文件末行；不换path/revision/start，不补不存在文件、不选择新的事实范围，不修混合错误。
- 候选必须逐字等于 `JSON.stringify(parsed, null, 2)` 加一个LF。compact、CRLF、BOM、会被JS解析再序列化改写的超精度整数或指数写法都不自动修复，保持原字节交给作者处理。这个限制是避免修源范围时顺带改变格式或数字。
- 修复后完整gates只重试一次；通过才保留新候选。完整和compact receipts均包含 `autoRepair`、原/新hash和范围账目。失败诊断及 `specification`描述被检查的retry，而 `autoRepair.outcome`另说原候选是否恢复，不能把两者混为一份字节。
- retry后任一失败或异常尝试恢复原始字节；使用绑定identity与字节的私有暂存/原子发布，并只失效本retry的current-delivery sidecar。外部编辑不覆盖；不能安全恢复时明确 `restore-failed`。异常仍是命令失败，磁盘receipt可能停在较早阶段，不是最终handoff。

[atomic-output.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/renderers/shared/atomic-output.mjs) 的 `publishRegularFileBinding` 增加可选expectedPreviousSha256/Bytes，供上述candidate替换核旧字节；未给该选项的既有caller不因此新增一套必填合同。[delivery-contract](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/references/delivery-contract.md) 已明文记录触发、保留与回滚边界。

## 对已冻结实验的解释

| 实验/目前可核身份 | 这次更新的影响 |
| --- | --- |
| [Copy identity `18d51b8950a9c3713c72044dd6af8e12c9f33e24`](https://github.com/tt-a1i/archify/commit/18d51b8950a9c3713c72044dd6af8e12c9f33e24) | 基于3f95，只新增内容实验；对3f95的路径集合与本轮8文件无交集。原标准库观察、引用拓扑、固定L8–13 source excerpt和已通过的最终gates继续证明该head。新finalize不是新的对象身份观察，也不能把旧source引用说成自动修复后结果。 |
| [CLI reading tour `1dff88d331679319442277a4ffc7cd3637bccee2`](https://github.com/tt-a1i/archify/commit/1dff88d331679319442277a4ffc7cd3637bccee2) | 同样与8文件无路径交集。11份固定source ranges、完整源码SHA、三出口/两份JSON来源解释及原finalize结果仍是3f95实验事实。新功能不重新解释其静态图为运行trace，也不自动修正文中任何事实。若重跑命中新修复，须记录新 `autoRepair`，不能仍宣称原作者JSON毫无改动。 |
| Clipboard outcome（本地3f95 worktree的未提交候选） | 当前HEAD仍是3f95，tracked变更为reader.js、test/explainer-browser及生成case/ZIP；还没有可引用的实现提交，不能以3f95当候选head。与本轮路径交集只有ZIP。复制成功/失败反馈和真实OS clipboard验收边界不会因finalize修复而改变；候选身份继续用冻结source/HTML hash，旧本地测试不能冒充67f组合已验证。 |

已有pass不含越界失败，不能仅因新功能存在就给它补一段自动修复经历；旧失败也不能追认成现在通过。旧HTML、PNG、sourceCards、delivery receipts和软件notice字节保持原版本记录即可，不需为这次base移动全部重拍。

## 后续整合只补真正受影响的检查

选择67f作为交付base时，记录实际新head，并重新完成该候选的相关finalize/receipt绑定；若用了范围修复，核原/新hash、范围及最终outcome。若需要发布ZIP，从组合源码重建，不能用旧clipboard包覆盖新finalize。没有发生范围修复时，不要求重复代码内容审计或标准库观察；被改的输入/产物另按实际变化验证。

本次新增 [finalize tests](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/test/finalize.test.mjs) 明确涵盖通过重试、noncanonical保留、无效/缺失/混合失败，以及retry/check/browser/异常/外部编辑/sidecar/receipt失败恢复；[candidate-replacement tests](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/test/candidate-replacement.test.mjs)覆盖暂存、同inode编辑及恢复ownership。这是对测试源码的阅读，不是本次执行通过证据，也不代表我完成对PR1100所有安全实现的独立审查。

只读复核命令为 `git diff --stat 3f95f0349c8276db71509ca239461b6fe9d00f9f 67f12389212c54b3122da60e2813c7f8dab7ab2f`、对上述固定文件 `git diff` / `git show`，以及对两个已提交内容实验求路径交集。本次没有rebase、改已发分支、重建、运行全suite或改hub README。
