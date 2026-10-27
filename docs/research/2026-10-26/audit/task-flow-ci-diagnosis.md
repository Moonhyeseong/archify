# #1121 Reader Layout CI 失败：只读诊断

结论：**没有发现 task-flow 实验引入该 Sequence 失败的代码路径；现有证据支持“未修改的共享浏览器门禁在这次 hosted run 失败”，但不足以把原因定为已知 resize race 或误报。** 本地 exact-head 复现未失败。最初 CI 失败仍然有效，本地通过不能替代它或后续远端 rerun。

## 精确身份与失败边界

- 被诊断 head：`843c877b251baf89925f99e11594fc5630c1c165`（#1121）。CI run `40423164172`，job `121922351456`，`browser-regression (2)`。
- [原 CI 摘录](task-flow-ci-failure.log) 的失败时间为 `2026-10-27T00:00:58Z`。位置是 `test/reader-layout-browser.test.mjs:657` 的 `compact automatic Sequence fits the initial desktop stage without shrinking source text`，内部 `fits` 第705行，由第811行的 `fits(shortWide)` 调用。
- 失败的是临时生成的 `short-wide-sequence`，viewport **1396×480**，source SVG **560×327**；不是实验的 Explainer 页面或 task-flow 原生图。
- `fits` 要求 SVG、stage、controls 全部位于 viewport 内，随后另检源文字不缩小和自动放大上限。CI 在第一个 containment 条件失败；已有数据仍显示文字 scale=1.5、宽840=560×1.5，不能把它描述为文字缩小或上限失效。

| 同一 short-wide 条件 | CI 失败观测 | 本地 exact-head 观测 |
| --- | ---: | ---: |
| SVG viewBox | 0 0 560 327 | 0 0 560 327 |
| viewport | 1396×480 | 1396×480 |
| SVG width / 最小文字 scale | 840 / 1.5 | 575 / 1.0267584 |
| SVG top / bottom | 67 / 557.5 | 67 / 402.75 |
| stage top / bottom | 58 / 626.5 | 58 / 471.75 |
| controls top / bottom | 421.5 / 463.5 | 412.75 / 454.75 |
| legend corner | true | false |

CI 的 SVG 和 stage bottom 超过480；controls 本身在 viewport 内。本地三者均满足 containment。legend corner 差异是观测，不单独判错：此 short-wide 部分只断言 `fits`，并未要求 corner。

## 归因证据

1. `git diff --name-only e837dc4cb83042d2b6c596e039692e25ec62c2da 843c877b251baf89925f99e11594fc5630c1c165` 全部在 `experiments/task-flow-tests/**`。对 `viewer test scripts archify package.json package-lock.json` 的 diff 为空。
2. 只读查询 #1120 得到 head `daf243ae7f40f4f989894f894bb354c5ec5a5660`，其 [browser-regression (2)](https://github.com/tt-a1i/archify/actions/runs/40422950420/job/121921646412) 为 `SUCCESS`。上述产品、测试、runner 与依赖路径在 #1120 和 #1121 两 head 间的 diff 同样为空。
3. 该 browser test 从固定 `test/fixtures/reader-readability/compact-roundtrip.sequence.json` 派生 wide 输入，在临时目录运行现有 Sequence render；它没有读取 `experiments/task-flow-tests/**`。测试内先做多个 viewport/zoom/presentation/print roundtrip，再重新导航 short-wide artifact，因此同进程历史状态值得检查，但尚无 CI 现场变量证明污染。
4. test `load()` 先设置 CDP viewport/media、等待 load，再调用 `stable()`。`stable()` 已等待 `document.fonts.ready`，并两次依次等待 Reader / Viewer Chrome 的 `whenStable()`。共享 `Archify.waitForStableLayout` 会调度布局，等待 pending 消失及连续三个相同 frame snapshot。不能未经证据就归咎于“完全没等 resize/字体”。

## 可疑分支与尚未证明的解释

`viewer/reader-layout.js:374–380` 根据可用高度判断 compact Sequence 能否以源字号首屏放下；不满足时选择 width-first reading scroll。`applyWidth` 在第270–275行把 SVG 放大限制为1.5倍；overflow settle 在第305行只有 `!readingScroll` 时缩窄。

**推断：** CI 的840宽、1.5倍文字、超高 stage 与“进入阅读宽度/scroll fallback 后被1.5倍 cap 限制”相符；本地575宽与首屏 fit 相符。可能的触发因素包括共享布局预算/Chrome reserve 的稳定状态、事件顺序或 Linux/Chrome 环境差异。日志没有 `readingScroll`、`fixedHeight`、`availableSvgHeight` 或后续再次稳定的 snapshot，故不能确认哪项导致分支，也不能确认追加一次等待就能恢复。

历史 commit `5e2c7ef671bbb0d5c3fa0f690167d39a0cce4715` 已引入 compact Sequence 首屏策略和相关测试；`docs/reading-evidence/compact-sequence/README.md` 记录过更早的840宽过度放大与后续 legend 修正。它说明这条共享路径有既有历史，**不证明本次是同一已知 defect 或已知 flake**。

## 本地检查、范围与结果

先读 `CONTRIBUTING.md` 的 Choose evidence by impact。未运行 full suite、完整 browser inventory、第三方上游或新 CI run；未改共享源码、测试、依赖或实验内容。

在 #1121 exact-head worktree，Node **v22.23.3**、macOS 本机 **Google Chrome 155.0.8059.85**，执行一次：

```sh
ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
ARCHIFY_READER_EVIDENCE=/tmp/task-flow-sequence-focus-evidence \
node --test \
  --test-name-pattern='Reader Layout preserves final-artifact behavior across its ownership boundaries|compact automatic Sequence' \
  test/reader-layout-browser.test.mjs
```

实际用现有官方 Node22 可执行文件启动。**过滤表达式匹配了 parent，因此实际执行该文件的全部17个 nested subtests**，并非只执行 compact child；TAP报告 tests18/pass18/fail0/skip0，包含 parent，总计77247.98ms。目标 child11通过（5519.54ms）。这仍是一个 Reader Layout 文件，未运行其他 browser test 文件。范围偏差在执行中识别并如实保留，没有再启动重复长跑。

本地 TAP 保留为 `/tmp/task-flow-sequence-focus.tap`；原始观测与截图在 `/tmp/task-flow-sequence-focus-evidence/`。上表从其 `reader-observations.json` 中 `short-wide-sequence` 记录提取，没有编辑 runtime 或注入几何。临时 evidence 不作为可跨 checkout 重用的 current provenance。

## 建议处置

保留初始 CI 红灯、本地单次绿灯、后续远端 rerun 为三个独立证据状态。产品/测试输入未变及同源门禁另一次 hosted pass，足以把调查对象限定在共享 Reader/测试环境；不应为这份实验扩展一个推测性的 race 修复。若需要继续调查，应在独立问题中采集失败时的 Reader/Chrome 布局预算与稳定后状态，或等待原 job 获准 rerun 的结果；本报告不发起该工作，也不把未完成的 rerun 记为通过。
