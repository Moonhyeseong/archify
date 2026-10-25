# 运行记录、时序与任务执行：10 个开源项目调研

研究日期：2026-10-25。Archify 检查基线：`82c7e0f089a02a4d514714adf37dc2061682da5f`。本文件仅为调研建议；没有实现转换器，没有安装外部 profiler，没有运行外部项目，没有生成或声称已经审阅截图。按 `archify-review` 的价值、成本、影响尺度取舍。

## 结论

优先做一个 **Chrome Trace 完整事件 `X` → 现有 Waterfall 的离线、显式选段转换实验**，其次做 **单条 OTLP JSON trace → Waterfall**。第三个备选是 **Speedscope evented profile → Waterfall**，只收时间单位和平衡开闭事件。三者都不需要新的 renderer、数据库、采集后台或持续监控服务。采样栈不应被改写成函数的实测起止区间。

最小用户结果：用户交来一份自己已有的记录，Agent 选定 10–40 个可读 span，输出能离线分享、带来源与计时性质说明的 HTML。价值在沟通一次执行的并发与耗时，不在替代 Perfetto/Jaeger 的海量交互分析。需求频率目前没有用户数据支持，因此先作为独立实验，不提出核心默认能力。

## 当前源码已提供什么

- [`waterfall.schema.json`](../../../../archify/schemas/waterfall.schema.json) 与 [`Waterfall README`](../../../../archify/renderers/waterfall/README.md)：`meta.evidence` 必填，取 `measured|illustrative`；`unit` 是 `us|ms|s`；span 有 `id/name/start`，`end|duration`、`parent/service/status/detail/sources`。`incomplete` 无终点只画到最后已记录瞬间，标签为下界；inclusive 父时长不能与子时长相加。现有实测 `example-rebuild.waterfall.json` 是 25 span 的本地执行记录。
- [`Timeline README`](../../../../archify/renderers/timeline/README.md)：适合绝对日历事件；`at` 必须带时区；实录标记叫 **`observed`**，不是 Waterfall 的 `measured`。`layout.breaks:"none"` 可保持全轴比例。单调时钟 trace 不包含 Unix 起点时，不能伪造 ISO 日期。
- [`sequence.schema.json`](../../../../archify/schemas/sequence.schema.json)：消息 `y` 是布局坐标，activation 的 `from/to` 也是绘图值；没有通用的计时 schema。不能根据 span 父子关系推定跨服务请求/返回消息，更不能把消息纵距称为延迟。
- `rg` 检查 `archify/ integrations/ scripts/ test/` 的 `traceEvents/OTLP/Perfetto/speedscope/VizTracer/Jaeger`：未发现上述离线 importer；“OTLP”命中是架构图边标签，不是数据支持。

## 项目与一手资料

许可证来自本次直接读取的官方 `LICENSE`。链接的 `main/master` 是可变引用；若复制代码、fixture 或形成实现，应再固定 commit 与内容摘要。本方案建议独立写小转换器，不嵌入外部 UI。许可证不是导出数据可任意公开的证明，fixture 仍需检查其内容与分发权。

| 项目 | 官方资料与格式证据 | 可借鉴的具体点 / 不宜照搬 | 官方许可 |
| --- | --- | --- | --- |
| Perfetto | [格式接入](https://perfetto.dev/docs/getting-started/other-formats)、[FAQ](https://perfetto.dev/docs/faq)：Chrome JSON 的 `ts` 为微秒，`pid/tid/ph/name/cat/args`；支持 B/E、X、instant、counter、flow。原生是 protobuf TrackEvent。 | 一个共享比例轴、明确 track 和 slice；不做 protobuf 解码与 SQL engine。JSON 是 legacy best-effort，不能写“完整支持 Perfetto”。 | [Apache-2.0](https://github.com/google/perfetto/blob/main/LICENSE) |
| Catapult / Chrome Trace Viewer | [官方 README](https://github.com/catapult-project/catapult/blob/main/tracing/README.md) 明确是 Chrome about:tracing 前端，可将 JSON 转成独立 HTML；[Perfetto 对该格式的官方说明](https://perfetto.dev/docs/getting-started/other-formats) 解释 phase。 | 与 Archify 独立 HTML 分享目标吻合；只读 JSON 的窄子集，不复制 trace viewer 或声称实现所有 async/flow 语义。 | [BSD 风格三条款](https://github.com/catapult-project/catapult/blob/main/LICENSE) |
| Node.js | [Node 22 官方 tracing.md](https://github.com/nodejs/node/blob/v22.x/doc/api/tracing.md)：trace event 时间戳为微秒；`--trace-event-categories`、`node.perf` 等分类产生记录。该 API 标为 experimental。 | Archify 本身使用 Node，已有记录能直接验证本地开发流程；不把单调时钟转换成墙钟。实验采集只运行自己写的无敏感数据小程序。 | [MIT 主许可及第三方 notices](https://github.com/nodejs/node/blob/main/LICENSE) |
| VizTracer | [basic usage](https://github.com/gaogaotiantian/viztracer/blob/master/docs/source/basic_usage.rst)：生成 `result.json`，支持 JSON/gzip/HTML；[report_builder.py](https://github.com/gaogaotiantian/viztracer/blob/master/src/viztracer/report_builder.py) 直接处理 `traceEvents` 和 `ph == "X"`。 | 同一 X 转换路径可覆盖 Python 函数记录；不导入 locals/参数、不运行被测陌生 Python 仓库。多次运行对齐是单独语义，不能把它们接成一次执行。 | [Apache-2.0](https://github.com/gaogaotiantian/viztracer/blob/master/LICENSE) |
| Bazel | [JSON Trace Profile](https://bazel.build/advanced/performance/json-trace-profile)：生成 `.profile.gz`，可由 `--profile` 指定路径，能在 Chrome tracing 打开。 | 一次 build 的 analysis/execution/worker 并发非常适合 Waterfall；只接受解压后 JSON，首版不加入构建系统或 gzip 接口。没有 action 依赖信息就不标 critical path。 | [Apache-2.0](https://github.com/bazelbuild/bazel/blob/master/LICENSE) |
| OpenTelemetry proto / OTLP | [OTLP 规范](https://opentelemetry.io/docs/specs/otlp/)、[trace.proto](https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/trace/v1/trace.proto)、[官方 trace.json](https://github.com/open-telemetry/opentelemetry-proto/blob/main/examples/trace.json)：`resourceSpans[].scopeSpans[].spans[]`，Unix ns 时间，`traceId/spanId/parentSpanId`；JSON 64 位整数为十进制字符串。 | 结构最接近现有 span。先 BigInt 减 trace origin，再转相对 us；不建 Collector，不接远程 endpoint，不依赖某 SDK console 的非 OTLP 输出。 | [Apache-2.0](https://github.com/open-telemetry/opentelemetry-proto/blob/main/LICENSE) |
| Jaeger | [官方 API 文档](https://www.jaegertracing.io/docs/1.37/apis/) 将 `/api/traces/{id}` HTTP JSON 标为 internal、未文档化且可变。此处引用明确版本的接口边界，不作为当前 v2 接口契约。 | 借鉴服务分色、父子 span、局部失败。优先标准 OTLP 输入，推迟 Jaeger 内部 UI JSON adapter；接入前须另查实际导出文件。 | [Apache-2.0](https://github.com/jaegertracing/jaeger/blob/main/LICENSE) |
| Speedscope | [文件类型定义](https://github.com/jlfwong/speedscope/blob/main/src/lib/file-format-spec.ts)：`evented` 与 `sampled` 分离；evented 用 `O/C/at/frame`；shared frame table；`unit` 还可为 bytes/none。 | 只处理 evented 的时间单位，逐栈平衡生成父子区间；拒绝 bytes/none。保留实测与估计的区别，不把 sampled weights 平铺成实测调用。 | [MIT](https://github.com/jlfwong/speedscope/blob/main/LICENSE) |
| py-spy | [官方 README](https://github.com/benfred/py-spy/blob/master/README.md)：sampling profiler，可 `--format speedscope`，读取目标进程内存。 | 是“不能将采样变成精确 span”的反例；优先继续用 Speedscope 链接原 profile。无需 attach 用户进程、权限提升或运行生产采样。 | [MIT](https://github.com/benfred/py-spy/blob/master/LICENSE) |
| Firefox Profiler | [processed profile format](https://github.com/firefox-devtools/profiler/blob/main/docs-developer/processed-profile-format.md)：原 Gecko JSON 处理成按字段排列的数组表，便于分析；不是朴素 span 列表。 | 研究采样/marker 的区分和大数据虚拟化取舍；当前不接其多版本 profile，不能简单遍历 JSON 当 trace event。 | [MPL-2.0](https://github.com/firefox-devtools/profiler/blob/main/LICENSE) |

## 实验 A：Chrome 完整事件 → Waterfall（优先）

**范围**：仅本地 JSON，接受裸事件数组或 `{traceEvents:[...]}`。仅选择有限窗口内的 `ph:"X"`，要求 `name`、有限非负 `ts/dur`、明确 `pid/tid`；`M` 只可用于线程名称。`ts` 和 `dur` 用 us；减去所选记录的最早 `ts` 保留相对位置。唯一 ID 用 `span_1` 等合法 ID，不把任意原始名字当 ID。`service` 可填明示的 process/thread 组名，并写清它是 lane 分组，不是业务服务发现。

**父子边界**：首版可全部 root，避免把时间包含误报为语义父子。若实现视觉栈归属，只在同 pid/tid 的严格嵌套 X 区间上推导，并在说明标记“按区间包含推导”；跨线程绝不据时间包含赋 parent。相同起止、非嵌套 overlap 保留为独立 root。首版拒绝无 X 的文件，输出 unsupported phase 计数；不静默宣称 B/E、async、counter、flow 完整覆盖。

**fixture**：自写小 Node 程序使用公开的 performance 测量/trace 类别，做 2 个并发任务、嵌套步骤、一个短步骤，产生 10–25 条真实 X（采集方式需先检查当前 Node 实际输出 phase；若只得到 b/e，保留该事实，改选真实已有 X fixture，不伪造“Node X 已通过”）。另用手写 JSON 覆盖 0 duration、相同名字、跨线程交叠、负 duration、无限值/错误字段、未知 phase、空选段。手写内容必须标为 illustrative；这些是格式/边界检查，不能称真实执行证据。真实采集由采集人声明来源后标 measured，保留原文件摘要、选择窗口、事件计数、单位、运行命令、runtime 版本。

**验收**：独立核对原始 ts/dur 与输出 start/end，检查并发保留、短步骤可见、名字可读、没有推断 critical path。超过 1000 输入事件或 60 个选中 span 先明确报超范围，首版不截断、不声称海量数据支持。阈值是实验控制值，尚非经过性能研究的产品上限。

**价值 / 成本 / 影响**：一个读取器覆盖多个常见来源，成本低到中；数据范围与计时精度比 renderer 本身更容易出错。独立 script 与既有 schema 隔离；不修改 Viewer、不增加包依赖、不影响老 JSON。

## 实验 B：单 trace OTLP JSON → Waterfall（第二优先）

**范围**：只收标准 envelope，不收 SDK console 文本。必须显式选择一个 traceId；跨 resource/scope 收集该 trace 的 span。`spanId` 不能直接作 Archify ID（可能数字开头），用 `span_<hex>`；按 `resource.attributes` 的 `service.name` 填 service。`status.code == 2` 映射 error；UNSET 不等于业务成功，缺省状态含义在卡片写清“未标记错误”，不声称请求成功。原始 links 不映射为 parent。

**精度与缺失**：`BigInt(startTimeUnixNano) - origin` 后才转 us 数字，保留原 ns 字符串到独立 provenance 记录；从始至终不得先 `Number(epoch_ns)` 再相减。检查转为数值的安全精度/跨度。父 span 缺失时保留 root 并报告 `missingParents`，不能输出 dangling parent 让 renderer 失败。`end=0` 是不合法/未设置的输入，首版明确拒绝，不伪造成 duration 0；跨主机时钟偏移照录并披露，不偷偷挪动让子 span 落进父 span。

**fixture**：官方 `examples/trace.json` 只有一个带外部 parent 的 span，恰可验证缺父记录；它是官方示例，输出应标 illustrative，而非 measured。另造 >2^53 的纳秒字符串、100 ns 差值、跨资源父子、重复 ID、两个 traceId、缺失 service、ERROR/UNSET 的小型 fixture。真正 measured 截图需要一份已获公开授权、脱敏的实际 OTLP 文件；本调研未提供，不能用示例取代。

**Timeline 可选派生**：若只想讲重试、取消、恢复的记录事件，可把 span events 的 `timeUnixNano/name` 转绝对 UTC ISO `at/title`，标 `observed`；毫秒以下精度需在 detail 说明。不要为了第三种输出新增一套 pipeline；有明确事件沟通需求才做。Sequence 推迟，缺少已观测消息配对关系。

**价值 / 成本 / 影响**：对已有 OTel 用户一次执行解释价值高；比 A 多精度、时钟、截断与状态语义成本。仍可不改 schema；标准 OTLP 路径优于绑定 Jaeger internal API。

## 实验 C：Speedscope evented → Waterfall（候补）

只接受一个显式选择的 `type:"evented"` profile；时间单位换成 us/ms/s。按有序 O/C 事件维护 frame 栈，每次 O 建新 span ID，C 必须关闭栈顶对应 frame，递归同名也要不同 ID；parent 从栈得出。保留 startValue 作为原始参考而不是 Unix epoch。拒绝 sampled、bytes、none、不平衡、乱序、越界 frame，不估计未关闭函数结束时间。

fixture 采用自写事件序列验证递归、同一 frame 多次调用、零时长与坏栈；来源是人为时序时仍为 illustrative。真正实测样例必须来自 evented 记录器，不能用 py-spy 的 sampled profile 代替。该实验和 A 都解释单机调用树，价值部分重合，优先级低；除非用户已经有 evented 文件，否则不同时实现两套。

## 截图与验证方法（待实施，不是已完成证据）

1. 保存 `raw.json`、转换后的 typed JSON、单独 provenance（源 SHA256、转换器版本、筛选与丢弃计数）；真实文件仅保留允许公开字段。不要把本地路径或 HTTP headers 放进分享卡片。
2. 用当前公共 CLI：`node archify/bin/archify.mjs deliver waterfall <input.json> <output.html> --json`，再 `node archify/bin/archify.mjs visual-check <output.html> --json`。先核对当前 help 与本机 Chrome 可用性；browser skipped 必须如实写 skipped。
3. 截图固定 1440×900、相同主题与 zoom；主图 15–25 span，在 dark/light 各一张，再截短步骤、并发、error 和 provenance detail。截图产物由现有 visual-check receipts 定位，不另造无来源图片。手动打开 HTML 后再判断可读性；receipt 成功不等于视觉通过。
4. 把“读取正确”“计时精度正确”“browser 检查”“人工感知审阅”分栏记录。本阶段未执行任何截图。只改本文无需 renderer 测试；实现 A/B 后按 CONTRIBUTING 选择 importer focused tests、冻结 v1 smoke 与代表性 Waterfall 渲染；未改共享布局无需完整布局对照。

## GitHub 同类与交叉工作（2026-10-25 查询）

查询开放 issues/PR 的 trace、waterfall、profiler、OTLP，读取前 100 项开放列表，并单独读取 #730；没有查到这三种 importer 的开放实现。搜索是标题/正文索引和有限结果，不证明整个历史不存在。

- [PR #730 Tracks](https://github.com/tt-a1i/archify/pull/730)：新增 shared numeric/address axis interval schema 与 renderer，scope 尚未最终确定。它不是已有功能；本实验不依赖、复制或补做 Tracks，不引入 track axis 新 contract。
- [#1021](https://github.com/tt-a1i/archify/issues/1021) / [PR #1028](https://github.com/tt-a1i/archify/pull/1028)：大 start timing tolerance。本方案 origin 归零有利数值精度，但不宣称修复它；避免重复 renderer 改动。
- [#1022](https://github.com/tt-a1i/archify/issues/1022) / [PR #1030](https://github.com/tt-a1i/archify/pull/1030)：incomplete legend。新增数据通路应复用其状态语义，不顺手修改。
- [PR #824](https://github.com/tt-a1i/archify/pull/824)：nested service attribution 测试；OTLP mapping 应以当前实际 renderer 归属为准。
- [#93](https://github.com/tt-a1i/archify/issues/93) / [PR #387](https://github.com/tt-a1i/archify/pull/387)：Mermaid sequence importer，输入为描述性源码；与 runtime 证据不同，但若引入统一 import 命令需提前协调命名与 CLI 边界。
- [#1052](https://github.com/tt-a1i/archify/issues/1052)、[#1053](https://github.com/tt-a1i/archify/issues/1053)、[#1054](https://github.com/tt-a1i/archify/issues/1054)：artifact evidence index 方向。provenance 先局部文件，不再建一套索引/浏览器。

建议 A 先在独立实验分支验证真实输入与截图，再决定是否进入产品。B 依赖真实可公开 OTLP 输入；C 保留为已有 evented 用户的备选。未获得频次、数据规模和真实阅读收益证据之前，不扩展成通用 observability、trace live receiver 或自动依赖推断。
