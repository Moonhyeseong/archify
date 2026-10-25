# 首批外部灵感实验：最小集成地图

调研日期：2026-10-25。实际 HEAD：`82c7e0f089a02a4d514714adf37dc2061682da5f`（dev 基线）。仅静态读源及本地工具版本查询；未运行测试、渲染、浏览器或打包，未修改产品文件。下文示例是实现起点，未声称已通过最终交付门禁。

## 推荐边界

首批 4–6 个实验都可采用 **repo-only 独立转换 CLI → schema-versioned JSON → 现有 public CLI → 独立证据目录**。各实验拥有自己的 source parser、转换规则、fixture、README 和失真清单；不新增产品 schema、不注册 CLI 命令、不修改 renderer/Viewer、不安装实时 Skill。

最小共同约定是 `node labs/<experiment>/convert.mjs <source> <candidate.json>`；这是建议的新约定，并非仓库已有 labs API。建议让转换器只生成 JSON，由调用方显式运行现有渲染命令。这样外部 parser 错误与产品布局/交付错误各有清晰边界，且无需把外部依赖引入运行时。

## 1. CLI、适配器与实验惯例

- `archify/bin/archify.mjs:2190` 的 `COMMAND_USAGE` 与文件末尾 dispatch 是现有 CLI 边界；没有外部格式 `import` 命令或 import adapter registry。`rendererPath()` 把类型映射到 `archify/renderers/<type>/render-<type>.mjs`。`render`/`validate`/`deliver`/`finalize` 是适配后最小调用面。
- renderer 的 `render-*.mjs` 是有顶层读取 argv/写文件行为的 CLI，不是安全的库入口。不要从 labs 直接 import 它们。`archify/renderers/workflow/workflow-compiler.mjs` 是可导入的编译层，且 `test/renderer-import-isolation.test.mjs` 明确保护 host argv/env/listeners，但首批适配器仍可统一用 CLI 避免内部耦合。
- `benchmarks/diagram-quality/adapters.mjs` 导出 `parseSource(format, source, options)`，目前只接受 `archify`；作用是把 IR 抽成 comparison graph，并非把第三方输入转成 Archify。它把 tree/waterfall 等扩展 collection 标为未完全验证。不能靠它取得导入正确性或 typed 属性正确性的证据。
- `experiments/node-index-rows/` 展示仓库已有的隔离实验方式：README、独立 compare.mjs、CSS、observations 与 screenshots，说明与生产差异及未覆盖项；输出命令推荐写到 checkout 外。
- `experiments/v3-mermaid-validation/` 使用 sources、theme、A/B/C output、INDEX/RESULT 记录外部对照。`experiments/visual-evolution/` 使用独立 prototype.mjs/html。仓库没有统一实验 runner 或 labs packaging contract。

## 2. 四类 IR 的最小路径

权威 shape 是 `archify/schemas/<type>.schema.json`，渲染附加规则见各 `archify/renderers/<type>/README.md` 与 renderer。`archify/schemas/README.md` 存在历史性的“五类”描述和过宽的“每类 meta.output 必需”陈述，不能拿概述替代当前 schema：tree/waterfall 当前 schema 的 meta.output 可选，workflow/sequence 必需。为了跨类型一致与可复现，所有实验均建议显式生成 portable `meta.output: "reports/<name>.html"`，同时给 CLI 显式绝对输出路径。

| 类型 | 最小 source→IR 映射 | 已知边界 | 可用种子 |
|---|---|---|---|
| workflow | `schema_version:2`；一个 `lanes:[{id,label}]`；`nodes:[{id,lane,col,type,label}]`；`edges:[{from,to}]` | col 是 0..5 的逻辑 rank，不能直接塞外部像素 x；`type` 采用 componentType 枚举；phases/groups/mainPath 可省略，若 mainPath 出现至少两个节点。新输入不要选 v1 固定几何。 | `archify/examples/agent-tool-call.workflow.json` |
| tree | `schema_version:1`；`nodes:[{id,label,parent?}]` | 恰好一个无 parent 的 root；parent 必须存在、不得成环；声明顺序决定 children 顺序。没有跨分支 edge；多根不能默默伪装成单根。 | `archify/examples/payment-platform.tree.json`；`archify/examples/archify-repository.tree.json` |
| waterfall | `schema_version:1`；meta 必须有 `evidence:"measured"或"illustrative"`；`spans:[{id,name,start,end或duration,parent?}]` | 所有时间同一个 trace origin/unit；end 与 duration 同时给时须相符；多个 root 合法；只有 incomplete 可无结束。不能推断 critical path 或累加父子 duration；外部样例造的时间须 illustrative。 | `archify/examples/checkout-request.waterfall.json`；`archify/examples/example-rebuild.waterfall.json` |
| sequence | `schema_version:1`；至少两个 `participants:[{id,type,label}]`；至少一条 `messages:[{from,to,y,label}]` | y 是像素位置，不是 timestamp；消息需不同 endpoints，self-call 虽可过 shape 但 renderer 拒绝。初始可按保留的事件顺序分配 y=180+index×60，再据文字/notes诊断扩画布；不要宣称这是测量时间。segments 与 activations 是可选像素区间。 | `archify/examples/cache-miss-request.sequence.json` |

最小候选结构（分别写成独立 JSON；均还需后续 CLI 实测）：

```json
{"schema_version":2,"diagram_type":"workflow","meta":{"title":"Flow experiment","output":"reports/flow.html"},"lanes":[{"id":"system","label":"System"}],"nodes":[{"id":"a","lane":"system","col":0,"type":"backend","label":"Start"},{"id":"b","lane":"system","col":1,"type":"backend","label":"Done"}],"edges":[{"from":"a","to":"b"}]}
```

```json
{"schema_version":1,"diagram_type":"tree","meta":{"title":"Tree experiment","output":"reports/tree.html"},"nodes":[{"id":"root","label":"Root"},{"id":"child","label":"Child","parent":"root"}]}
```

```json
{"schema_version":1,"diagram_type":"waterfall","meta":{"title":"Trace experiment","output":"reports/trace.html","evidence":"illustrative","unit":"ms"},"spans":[{"id":"request","name":"Request","start":0,"duration":100}]}
```

```json
{"schema_version":1,"diagram_type":"sequence","meta":{"title":"Sequence experiment","output":"reports/sequence.html"},"participants":[{"id":"a","type":"frontend","label":"Caller"},{"id":"b","type":"backend","label":"Service"}],"messages":[{"from":"a","to":"b","y":180,"label":"Request"}]}
```

所有类型禁止未知属性；额外 source metadata 应保存在实验自己的 mapping receipt，不能往 IR 塞扩展字段。语义 ID 必须符合 `^[a-zA-Z][a-zA-Z0-9_-]*$`。外部 ID 需要确定性转换与一对一回溯表；unsupported 与 dropped 字段应明确记录，不能仅凭成功渲染称“完整导入”。repo sources 需要 revision-pinned repository 和 `--repo-root`，不适合对未知来源自动补造。

## 3. 可复用交付、截图与导出

以下从 repository root 执行，`<type>` 为上述四种之一；推荐每个实验/候选使用独立的 `<out>` 目录。

```sh
node archify/bin/archify.mjs render <type> <candidate.json> <out>/diagram.html --quality standard
node archify/bin/archify.mjs validate <type> <candidate.json> --json
node archify/bin/archify.mjs finalize <type> <candidate.json> <out>/diagram.html --quality showcase --out-dir <out>/evidence --json
ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node archify/bin/archify.mjs visual-check <out>/diagram.html --summary --require-provenance --out-dir <out>/captures
```

`render` 是快速查看，不能替代最终交付；`validate` 仅用于聚焦诊断，完整候选直接 `finalize`。权威流程见 `archify/references/delivery-contract.md:257` 和 `:499`。finalize 依次覆盖 validate/deliver/check/browser-check，输出 HTML、delivery receipt、finalize receipt/summary 与 browser-check receipt；默认不截图。visual-check 在可信 HTML 上复用浏览器观测并输出 light/dark、1440×900/2048×1320 四张 PNG、contact sheet 和 JSON receipt。成功截图仍需人/agent实际查看；不要把 browser gate 当审美认可。修改候选后使用新 evidence 目录保留旧证据绑定。

更轻的独立 DOM 对照可参考 `benchmarks/diagram-quality/browser.mjs:8` 的 `observeArtifact({artifactPath,graph,chromePath,screenshotPath})`：它复用 `ChromeVisualBrowser`，阻断网络，等待 font/layout settle，1440×900 页面截图。它返回独立观察，不读取 source/native pass receipt；适合实验对照，但不是 finalizer 的替代品。首次实验可以只复用 public CLI，避免引入 benchmark 的观察模型。

产品 CLI 没有通用 `export --format ...` 命令。standalone HTML 内 Viewer 的 `Archify.exportMenu.run(format)` 与 Export menu 支持现有导出，逻辑在 `viewer/export.js`/`viewer/export-cleanup.js`，浏览器用例见 `test/export-browser.test.mjs`。程序化复用应通过浏览器驱动真实菜单并捕获下载；不要假设可从 Node import export.js。Page screenshot PNG 是页面证据，和 Viewer 导出的干净 SVG/PNG 等图形资产不同。tree 导出完整树，即便当前有 collapsed 节点（tree README）。

## 4. labs 验证与包隔离

`CONTRIBUTING.md` 要求按行为选证据。首批转换器的直接影响是 labs 输入处理和生成 IR：

1. 正例需独立验证原 source→IR 的节点、边、顺序、父子关系或时长，不能只断言 converter 自己输出的 receipt；覆盖决定性 ID 映射与可重复输出。
2. 失败边界覆盖缺失引用、非法/重复 ID、cycle、多根 tree、不支持的 sequence self-call、不完整/错误 timing、输入格式坏数据。拒绝或明确 report lossy；不能静默丢数据。
3. 对每种实际输出类型复用 public CLI `finalize`，查看 screenshots；`standard` exploration 与 `showcase` delivery 的成败分别记录。实验自测可放各 labs 目录并用显式命令运行，不把 root test runner/依赖 manifest 作为首批切口。
4. 保证 diff 不触及 `archify/`、viewer、root lockfiles 或现有测试，就能保持 shipped runtime 输入不变。`scripts/stage-clean-skill.mjs:67` 仅枚举 tracked `archify/`，root `labs/`/`experiments/`/`docs/research/` 天然不会入 Skill ZIP；不要把实验放进 `archify/labs/`，也不需为 root labs 修改 stager。
5. `scripts/build-zip.sh` 可输出临时 archive，再由 `scripts/package-smoke.mjs <extracted-root>/archify` 核验无依赖包。单纯 repo-only labs 无需为了证明没有 runtime diff 而更新 `archify.zip`。如需 canonical ZIP byte比较，必须官方 Node22且 bundled zlib `1.3.1-e00f703`；当前本机 Homebrew Node22不符合，见工具部分。
6. 注意 CI 隔离与包隔离不同：`scripts/ci-scope.mjs` 当前对未知 root labs/experiments 路径选择 full gates；docs/research 走 website responsibility。不能声称新增 labs 会自动获得轻量 CI。首批无需改 classifier，保留现有 conservative gate；若未来要优化是独立流程/测试基础设施范围。

实际调研没有执行以上 checks。实现者应先阅读 test-value 对 affected tests 的要求；不应为这份代码定位文档运行 renderer suite。

## 5. 本机工具（仅路径/版本查询）

- 当前 PATH 的 `node`：`/opt/homebrew/bin/node`，实测 `v26.12.0`，不是 canonical Node22。
- 本地可显式使用 `/opt/homebrew/opt/node@22/bin/node`，实测 Node `22.23.3`，zlib `1.2.12`。可用于 labs runtime/CLI 实验；**不能通过当前 build-zip.sh 的 canonical zlib gate**。
- 本机应用内置 Node 实测 `v24.19.0`，也不是 canonical ZIP toolchain。
- Chrome 可执行文件存在且有 executable mode：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。未启动、未证明当前 browser gate可跑。产品 `findChrome()` 位于 `archify/bin/visual-check.mjs:1316`，`ARCHIFY_CHROME` 优先于系统候选。
- Node22需要贯穿子进程：public CLI 的 runNode 使用 `process.execPath`，用 Node22显式启动 CLI即可；如调用 shell `scripts/build-zip.sh`，必须令 PATH 中 node 为符合 canonical Node/zlib 的分发版。
