# 旧 keyboard-traversal 候选对三份新 HTML 的限定验证

**现有候选能处理这三份当前冻结输入：三次 `runBrowserCheck` 均 exit0、零 diagnostics，四个视口/主题组合均完成全部初始目标的真实键盘遍历。HTML 前后逐字不变。** 这是旧候选的新输入验证，不是当前 dev 已集成、重新交付或旧失败已被改写的证据。

## 源码与兼容范围

- validation checkout detached HEAD：`c96e8aa74ff5e309cdab07a1b70d0242f33bed75`，读取其 `experiments/keyboard-traversal/README.md` 与 `refresh-dev-10b4/README.md` 后按现有直接 API 命令执行。
- 候选已合并基线 / 与当前 dev 的 merge-base：`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。本轮通过 GitHub `branches/dev` 只读 API 核到当前 dev 为 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。没有 rebase、merge 或新分支。
- `archify/bin/visual-check.mjs` 的 `runBrowserCheck` 只转发到已有 `runBrowserEvidence`，为 Explainer 实际调用 `inspectExplainerBrowser`。该 orchestrator、`archify/explainer/check.mjs`、两组 manifests/lockfiles 与当前 dev **字节相同**；完整 SHA-256 比较在 [compatibility.json](keyboard-current-artifacts/compatibility.json)。
- `archify/explainer/browser-check.mjs` 是待验证的旧候选差异。当前 dev 还多了 crossing-budget 的独立 checker 与 CLI diagnostic helper：`archify/scripts/check-render-output.mjs` 和 `archify/bin/archify.mjs` 也与旧候选不同。本轮直接 API 没有调用这两个路径，因此结果不能升级为所有当前 dev CLI/strict-check 集成已验证。
- 候选相对其10b4基线的产品/测试变更仅为 Explainer browser checker 与直接测试；本轮不修改它们。既有 README 的历史完整测试、ZIP、负例等证据属于各自记录的 revision，本轮没有重复运行或重新包装。

## 实际算法与成功条件

执行前读了现有 `keyboardTraversal`：它冻结初始控件 DOM 身份，发送 CDP 真实 Tab / radio ArrowRight，只有真实到达才计数；后续 clone、隐藏或移除不能缩减初始要求。每到新必达目标后重置无进展循环判断；普通 native leaf 无进展重复才判 focus-cycle。总工作预算为 `count + min(initial DOM elements,1024) + 3`，耗尽仍失败并标可达性未确认。

本轮没有程序化 focus 补达、改 HTML、删控件、调整 tabindex、屏蔽诊断或增加算法预算。现有函数起点含 `activeElement.blur()` / scroll reset，这与 root 以真实 pointer 设起点的人工 Tab 观察不同，步数不混用。

## 三个 exact 输入与实际结果

| 固定 HTML | bytes | SHA-256（前后相同） |
| --- | ---: | --- |
| task-flow-tests/final/review.html | 554553 | `f8c908b1d9e4e2eccf127387d886eba425aa06106448fbd212eac931f6f4b17b` |
| trace-flow-evidence/final/review.html | 545470 | `4cc2274999e58b9f75b717c053528a85964e3545b3cb0a8fe638b8cdf246dff1` |
| oci-whiteouts/final/explainer.html | 583634 | `5b4790c282740cf6d94e71e4b072ad7a3d2b5daab90228e73340c2d716815043` |

每页各跑 **1280×900、1440×900 × light/dark** 四臂。下列 reached/steps/limit 在该页四臂一致；每臂 termination 均为 `complete`。

| 输入 | 历史 baseline keyboard diagnostics | 候选实际到达 | 实际动作 / 工作上限 | 本次 exit / diagnostics |
| --- | ---: | ---: | ---: | --- |
| [task-flow](keyboard-current-artifacts/task-flow.json) | 16 | 40/40 | 47 / 394 | 0 / 0 |
| [trace-flow](keyboard-current-artifacts/trace-flow.json) | 12 | 27/27 | 33 / 442 | 0 / 0 |
| [OCI whiteouts](keyboard-current-artifacts/oci-whiteouts.json) | 16 | 29/29 | 36 / 467 | 0 / 0 |

历史16/12/16来自既有产品基线回执，本轮没有重跑 baseline，也没有把历史失败 receipt、旧摘要或 root 实际 Tab 轨迹改成通过。这里对照的是相同冻结 HTML 的新 checker 观测；不同视口重复诊断不是不同坏控件的数量。

三次结果还记录 containment、readability、Viewer Chrome、theme、交互、references、no-JavaScript 和 print 检查均通过。主动作是现有 `runBrowserCheck`：没有执行 finalize/deliver、没有捕获新图片、没有 current delivery provenance 声明。负例、完整 checker test suite、ZIP、Windows、AT 与真实读者效果不在本轮新增覆盖内。

## 可复现命令与证据保留

读取精确原 HTML，而不是复制后重渲染。使用现有 candidate checkout、官方 Node **v22.23.3**；浏览器可执行文件在运行后立即核得 **Google Chrome 156.0.8078.48**（macOS/arm64）。两组已有 lockfile 依赖分别用 `npm ci --ignore-scripts --no-audit --no-fund` 准备；未改 manifests/locks，也没有 live Skill 安装。

下面是本轮所用现有 API 形状；artifactPath 分别选上表三份已核 SHA 的绝对路径，每个 outDir 必须新建在 checkout 外：

```js
import {runBrowserCheck, findChrome} from './archify/bin/visual-check.mjs';
const result = await runBrowserCheck({
  artifactPath: exactFinalizedHtml,
  outDir: freshExternalDirectory,
  chromePath: findChrome()
});
```

每次执行前后都读取原字节并验 SHA-256；三次 `Buffer.equals` 均 true。调用未传 deliveryProvenance，也未绕 public CLI 补造交付状态。默认真实浏览器测量仍保留；`runBrowserCheck` 使用其已有私有 snapshot/原件绑定机制，而原 HTML 与相邻 delivery receipt 未被本次覆写。

完整原始 `*.result.json`、本次新 browser-check receipts 和 binding.json 保留在 checkout 外的 `/tmp/keyboard-current-artifacts.oXOWXG/`。上述 JSON 是选字段的 **portable derived summary**，不冒充原始 receipt；[raw-manifest.json](keyboard-current-artifacts/raw-manifest.json) 记录外部原件的相对文件名、bytes 与 SHA。公开摘要省略机器路径、临时 snapshot URL、重复正文与无关 DOM 内容，但保留输入身份、各臂计数、termination、工作预算、命令结果与原件摘要。

validation checkout 最终保持源码 clean。没有 Ego 操作、CI rerun、push、PR、新产品修复或共享代码修改。原始证据已外置，协调者可在取用后归档该临时 validation worktree。
