# Concurrency reading round 13：创建、上下文与取消不是同一条链

2026-10-25。使用 research 与 archify-review 方法，只读一手源码和完整官方 fixture。不按 star 过滤。本轮只纳入两个新项目，未达到六项上限不是缺项；没有运行上游程序、安装依赖、连接监控端口或操作浏览器。

**结论：零新增产品推荐；保留一个很小的阅读题，暂不派实现。** 本轮新增证据集中在“task 的创建者不决定显式 context 的值”和“取消请求记录不等于已取消结果”。Panicparse 的完整快照则证明：有创建栈、等待状态和时长，也未必有等待对象或持有者。它不是新增 waterfall/task-view 的理由。

## 范围与排重

开始时读取研究中心 README，提取该日期全部 Markdown 中 GitHub owner/repo 并作集合排重；缓存有462个唯一字符串（含 tt-a1i/archify 及少量非项目式链接，因此不称462个已深入审查项目）。`maruel/panicparse`、`aio-libs/aiomonitor` 均未出现。重点复读 [concurrency-evidence-smalltools](concurrency-evidence-smalltools.md)、[execution-reading-smalltools](execution-reading-smalltools.md) 与已完成实验表：历史锁序/现场等待边、ShiViz 向量时钟、Moirae 投递记录、tokio-console PollOp、jstack owner、Trace waterfall 和 task-view 均不重做。

研究时共享 checkout HEAD 已为 `c351d33c407c1c1a8a9bf2f0aee7d54e018fdef7`，不是派单所列 dev；本报告的产品能力对照仍明确固定为 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，通过 git show 读取，不把共享分支的新研究提交写成新产品基线。

同日通过 GitHub API 查询全部状态 issue/PR 标题中的 async、concurrency，均无命中；另读取开放 PR 列表，已有 [#730 Tracks](https://github.com/tt-a1i/archify/pull/730) 负责共享时间轴、[#1015 Explainer](https://github.com/tt-a1i/archify/pull/1015) 涉及代码阅读与交互层级。宽词搜索返回的路径 lock、发布过程和文件锁议题不能当并发阅读需求。检索只覆盖这些关键词与当时返回的开放列表，不宣称不存在不同措辞的相关工作。

固定基线的 [Story 合同](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/references/story-authoring.md#L48-L62) 已要求从来源导出配对和因果，parallel 只表示一起呈现；[Sequence](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/sequence/README.md#L48-L75) 的消息 y/间距是布局合同。现有 Explainer 表格与源码卡即可承载下面的题，不需要新图种或采集协议。

## 两个固定一手来源

| 项目与完整 SHA | 许可 | 实际阅读与边界 |
| --- | --- | --- |
| [maruel/panicparse](https://github.com/maruel/panicparse/tree/069e1ba2ab10f1945aefc639b3930641415f86b2) · `069e1ba2ab10f1945aefc639b3930641415f86b2` | 根 [LICENSE](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/LICENSE) Apache-2.0；本轮涉及源码均有相应版权头。未据此概括附带字体的许可。 | 完整 recorded panicweb dump、采集脚本、Signature、header parser、aggregation、benchmark consumer 和当前 workload。快照显示 goroutine 状态/栈/created-by；不提供完整资源 owner 图。 |
| [aio-libs/aiomonitor](https://github.com/aio-libs/aiomonitor/tree/73de9b00b2b7671237120328b45c39374b0810d0) · `73de9b00b2b7671237120328b45c39374b0810d0` | 根 [LICENSE](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/LICENSE) Apache-2.0 | 完整 cancellation/taskgroup examples、完整 test_monitor.py、task.py、monitor.py、types.py。创建链和取消链有不同 owning state；不是时间排序得到的链，也不是任意 asyncio 的完整 await 图。 |

## 深读一：71 条快照记录，不等于71个因果节点

完整 [static_panicweb.go](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/internal/internaltest/static_panicweb.go) 是已提交的 recorded fixture。文件头明确来自 panicweb；[采集脚本](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/internal/internaltest/static_panicweb.sh) 先启动示例程序、等待124秒，再取 pprof goroutine debug=2，并归一化 GOROOT/GOPATH。**这是官方控制工作负载的历史采集，不是生产事故、本轮采集或未经修改的机器路径。** 本轮只把完整 Go raw string 当文本读取，不运行 shell、Go 或其 parser。

对完整字面量逐行盘点得到71个 goroutine header：26条 `IO wait, 2 minutes`、26条 `select, 2 minutes`、14条 `chan receive, 2 minutes`、2条 `IO wait`，各1条 running、syscall+2 minutes、chan receive+2 minutes+locked to thread。首条ID135，之后ID1、34；文本次序不是ID递增序，更没有时间戳支持把它当发生顺序。这里的数量只是静态文本盘点，未核验当前工具解析结果。上游 [benchmark consumer](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/stack/context_test.go#L2166-L2198) 调用 ScanSnapshot，不能冒称本轮已跑通过。

可证伪任务：读者面对 [goroutine95完整记录](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/internal/internaltest/static_panicweb.go#L1114-L1120)，能否分别回答“是否锁定OS线程”“正在等待哪种操作”“谁创建了它”“谁持有其等待资源”？来源分别支持：locked to thread；chan receive；created by main.main 的调用位置；**没有可核 owner**。`created by main.main` 也没有 creator goroutine ID，不能将其无条件连到本快照ID1。

[Signature owning source](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/stack/stack.go#L639-L686) 把 State、CreatedBy、SleepMin/Max、Stack、Locked 分开；Locked 明确是锁定 OS thread，并非持有 mutex。[header parser](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/stack/context.go#L518-L552) 也只从 header 提取这三个状态分量。把 Locked 画成 goroutine→mutex 的持有边将直接改变事实。

[merge](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/stack/stack.go#L712-L730) 对相似 signature 合并 SleepMin/Max 并合并 stack；因此聚合结果中的范围不是某一个 goroutine 的连续计时区间，也不是两个样本间的wall-clock差。不能把它转换为 waterfall 起止时间或卡顿关键路径。

当前 [cmd/panicweb workload](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/cmd/panicweb/main.go) 和 [handler](https://github.com/maruel/panicparse/blob/069e1ba2ab10f1945aefc639b3930641415f86b2/cmd/panicweb/internal/internal.go) 可解释项目故意制造挂起请求的用途；但历史 dump 的 main.go 行号与当前源码已不匹配。未追回当年采集 commit，不能用当前源行替换快照行号、证明当前状态或补出精确等待对象。最小处理是原始记录+字段释义，不另写Go stack parser或deadlock analyzer。

## 深读二：创建链、context、取消请求和最终结果

完整 [examples/cancellation.py](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/examples/cancellation.py) 同时含 chain_main→chain1→chain2→chain3 的 create_task/finally-cancel 模式、自行 raise CancelledError 和 ZeroDivisionError workload；末尾还有保留历史与等待检查的循环。完整 [taskgroup.py](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/examples/taskgroup.py) 是另一个含第三方 aiotools TaskGroup 的示例，不能静态推断其与新标准库 TaskGroup 行为等价。本轮未运行任何示例，所以没有实际task ID、调用次数、取消次序或console截图。

创建关系由 [Monitor._create_task](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/aiomonitor/monitor.py#L514-L543) 在创建时取 current_task、保存弱引用及创建栈；format_running_task_stack 沿此链读取。它表示创建来源，不表示当前谁 await 谁。弱引用失效、没有 current task 或未被 hook 的创建，不能补成完整树；格式化路径本身也保留 No stack available。带上下文的task创建不等于一般函数的同步调用栈。

最小且比新任务图更具体的阅读题来自完整 [test_monitor_task_factory_with_context](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/tests/test_monitor.py#L181-L224)：ContextVar 默认42，创建任务的当前context先设为99，但 create_task 显式传新建 `contextvars.Context()`；测试期望子任务读取42，当前task仍读取99。**这些是上游测试断言，不是本轮运行观测。** 可证伪问题是“只凭创建者→子任务箭头，可否判子任务读到99？”答案不能；要查看显式 context 参数。owning source 将context原样传给TracedTask，且 [TracedTask.__init__](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/aiomonitor/task.py#L34-L50) 对低于3.11的版本另作参数处理；fixture自身也按3.11限制跳过。因此不能推广为所有Python版本的已验证合同。

另一可证伪问题是“有cancellation chain edge是否等于target最终cancelled？”[TracedTask.cancel](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/aiomonitor/task.py#L81-L94) 先检查 canceller 是否 TracedTask，先入队 target/canceller/stack，然后才调用 super.cancel 并返回bool。因此这条来源关系记录的是可追踪取消调用，不是该调用成功、目标终止或最终cancelled的证明。最终 [termination record](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/aiomonitor/task.py#L60-L79) 另取 self.cancelled 与 exception；自行raise也可能没有外部canceller edge。链缺失不能解释成“没有取消”。

[历史消费者](https://github.com/aio-libs/aiomonitor/blob/73de9b00b2b7671237120328b45c39374b0810d0/aiomonitor/monitor.py#L596-L625) 以target ID覆盖最近canceller状态，并在非persistent历史超过上限时清理记录；不是完整追加事件日志。示例把max_termination_history设为10，同时用decorator保留特定coroutine。若从控制台输出做阅读页，必须保留范围/缺失，不能把链尾称作最初根因，也不能用started_at和terminated_at补全链边。

## 价值、成本、影响与最小建议

- **独立价值：** 相比既有锁序与向量时钟报告，本轮给出两个新的具体错误边界：thread affinity不等于持锁；task创建关系不决定显式context值。取消请求与最终cancelled还分别有owning state，不依赖时间相关性推因果。
- **成本：** 完整采集器、跨版本stack parser、async运行时、通用await/cancel图会引入ID寿命、弱引用、history裁剪、回调与线程边界。两个小阅读题不足以支撑这些长期责任。
- **影响：** 普通Sequence容易暗示总序；创建树容易让人误读context继承或等待依赖。现有Explainer并列源码与事实表已可表达，不改schema、Story parallel、waterfall时间合同或共享Viewer。
- **最小建议：** 仅保留“当前task99 / 显式空context / 子task期望42”这一页源码阅读题作为以后真实需求的候选；不用它冒充运行trace。只有读者在真实上下文中出现同类误读，并能用固定同源材料比较正确回答，才考虑内容实验。目前没有这类使用证据，故不派实现、不新开平台、不以新repo数充作收益。

## 完整原件冻结与校验

原件仅放 `/tmp/archify-concurrency-r13/`，未放入发布包；均取自上表固定SHA的raw GitHub文件。SHA-256是完整文件字节摘要，不是文内摘录的摘要。没有复制运行时日志、个人数据或令牌。

| 来源 / 完整路径 | bytes | SHA-256 |
| --- | ---: | --- |
| panicparse `LICENSE` | 11347 | `3a3deabc706f2ddfec6c7c3242725e7dd33fbe71717f7cbe8625a5936d306ca0` |
| panicparse `internal/internaltest/static_panicweb.go` | 60855 | `99230f2487f6a410fea6dd606bae3ccfecabee3efdfc76137c2efc91d1cf475d` |
| panicparse `internal/internaltest/static_panicweb.sh` | 788 | `462778cf1ffc92ec3068f91c3b117be306b90dbe7b32bebe7226c114ff289904` |
| panicparse `stack/stack.go` | 24872 | `f16efa7a7fb544c34f87e175da548acb63f81424f387cc0e900ca605b689c5ee` |
| panicparse `stack/context.go` | 36128 | `1ca5c23a35a2239848bf00ae8b3f685b66540826515ba6a48ce9e129606ed63f` |
| panicparse `stack/context_test.go` | 69624 | `24c4944bac586f88955938f62417297d00f7fbcb00311f9b6a004dc21d9e2cf1` |
| panicparse `cmd/panicweb/main.go` | 4498 | `9e6a41e345ac10acf190ae3627446c62899bb0c86d493b7e0219c6ea6b36ef2f` |
| panicparse `cmd/panicweb/internal/internal.go` | 1547 | `e9291cfa39f164afad5880607d0dccb80ea21fbb0269620d0d8ce4f05b49b4ef` |
| aiomonitor `LICENSE` | 11310 | `98397c300949e0cc1ddc68b0e48e67b10f2d0a4ffada4903d891a1315fe04156` |
| aiomonitor `examples/cancellation.py` | 2752 | `ebcbe057df30f2818559b654a8de40b99afb81d8edc2b7f2dd660832686095b3` |
| aiomonitor `examples/taskgroup.py` | 633 | `857c2294b7e193dea0aa84e6ff7823c5c79d5a9ac2d9ed2b24fccb52e73e2187` |
| aiomonitor `tests/test_monitor.py` | 9098 | `fe625e410a931e5b2b796b1497b57b3df31d8423416a1f27735222ab8ceed239` |
| aiomonitor `aiomonitor/task.py` | 3532 | `457b0d4b7f55adc23a6beaba02d4714a66b85e880f45f77ef571329dc1a92ac8` |
| aiomonitor `aiomonitor/monitor.py` | 23593 | `7e22a8440a2b1427b26799acc76cc00c91c1ee0944c85a50a118582f1a7555c7` |
| aiomonitor `aiomonitor/types.py` | 1194 | `ddfdcd1a39fcfb1827f35e54479f8e9e8b8919e8124545f5b09f1d4a83ba422e` |

本轮只新写此报告，没有修改研究中心README、产品、上游程序、测试或他人文件；没有commit/push/issue评论。按CONTRIBUTING的repository-only prose范围做来源、文件摘要、链接与语义核查，不运行renderer测试。没有浏览器、视觉、性能、人类阅读收益或真实生产接受结论。
