# 异步追踪阅读：flow、嵌套和时间先后分别证明什么？

2026-10-27；只读调研。结论：**选择一个固定原始 trace 的证据阅读页，拒绝通用 async/flow importer、采集器或共享 Waterfall 改动。** 现在找到了上轮欠缺的公开原始 flow 数据；它只支持局部仪器化关联，不支持完整 happens-before、critical path、CPU、网络或等待时长结论。报告本身不证明阅读效率。

## 去重

已读上轮 `traces-timelines.md`、`profile-reading-smalltools.md`、`concurrency-reading-round13.md`，以及当前 hub README、ecosystem-refresh、304 条远程 ref 快照及开放 PR/issue 快照。检索本地全部 53 条 `origin/codex/lab-*` ref 名称，相关实现是：

- [`lab-trace-waterfall@8e65f150`](https://github.com/tt-a1i/archify/tree/8e65f150b8db6947c98f9b12e37d970014e0ea7e/experiments/trace-waterfall)：已实现 `X` 区间与共同时间轴，原创 Node workload 实测10区间。明确拒收 B/E、async/flow，不造 parent、dependency、critical path。再做时间区间 importer 是重复。
- [`lab-task-occurrences@caffb4aa`](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences)：11打印位置→10任务身份，依赖边来自 Gradle expected，不表示调度顺序。这里需要的是原始仪器化 flow 端点，不是再解释重复打印/共享对象。
- 上轮 profile 报告把 await 归因与因果链分开，因没有可核原始关联输入而未派实现；本轮的变化仅是找到了有 flow 端点的固定来源。新项目数量不是推荐理由。

固定产品基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da` 的现有 Waterfall 没有通用依赖模型；README 明确不画等待/critical path。Architecture、Sequence、Explainer 的来源、步骤和表格已足够承载局部解释；Sequence 纵向距离仍是绘图坐标，不能充当按比例时间轴。开放 Tracks 工作也不是本实验前置依赖。

## 新核的一手来源

默认分支 SHA 是本轮 API 查询身份，不是稳定发行版承诺。未安装、执行、编译或打开这些上游应用；只读取源码与原始数据。

| 来源 / 固定 SHA | 实际支持的阅读合同 | 许可与维护判断 |
| --- | --- | --- |
| [Perfetto](https://github.com/google/perfetto/tree/6f3b7c1269c8b47927f55f8d6c6f766a55060b4d) · `6f3b7c1269c8b47927f55f8d6c6f766a55060b4d` · 2026-10-26 | [TrackEvent proto L212–280](https://github.com/google/perfetto/blob/6f3b7c1269c8b47927f55f8d6c6f766a55060b4d/protos/perfetto/trace/track_event/track_event.proto#L212-L280)：显式 flow IDs 连接事件，同 flow 内的时间戳决定方向；terminating IDs 允许后续复用。correlation ID 只表示同一逻辑操作，即使彼此没有因果连接，也可以同色/联动。 | [LICENSE](https://github.com/google/perfetto/blob/6f3b7c1269c8b47927f55f8d6c6f766a55060b4d/LICENSE) 主体 Apache-2.0，正文另列 Chromium 等文件例外，不概括所有内容为单一许可。活跃大项目；引入 protobuf/SQL engine/UI 的维护成本与本题不匹配。 |
| [Speedscope](https://github.com/jlfwong/speedscope/tree/fe804e6281cf847713448c2c3e0faec3e1f62b2d) · `fe804e6281cf847713448c2c3e0faec3e1f62b2d` · 2026-05-15 | [trace-event importer L11–25](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/import/trace-event.ts#L11-L25) 明确只取 B/E/X，其余忽略；CPU profile 另有优先路径。[本身格式](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/src/lib/file-format-spec.ts) 区分 evented O/C 栈和 sampled 权重，没有这些格式可证明的跨任务 flow 因果模型。 | [MIT](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/LICENSE)。不把“没有展示 flow”当 bug；它是明确的产品子集。新建 evented importer 与旧 scout 重复，拒绝。 |
| [Catapult / Trace Viewer](https://github.com/catapult-project/catapult/tree/6fd8bbe723677254ff1130a1a416988b8b3e285e) · `6fd8bbe723677254ff1130a1a416988b8b3e285e` · 2025-11-18 | [Flow API v1/v2 importer](https://github.com/catapult-project/catapult/blob/6fd8bbe723677254ff1130a1a416988b8b3e285e/tracing/tracing/extras/importer/trace_event_importer.html#L2107-L2350) 实际分别处理原始 s/t/f、bind_id、端点绑定。提供完整 Chrome 历史 flow trace。 | [BSD-3-Clause 风格 LICENSE](https://github.com/catapult-project/catapult/blob/6fd8bbe723677254ff1130a1a416988b8b3e285e/LICENSE)。这是成熟 legacy 输入的语义参照，不意味着移植其旧 JS/HTML 栈合适；只独立解释少数原始记录。 |

[Perfetto Track events 官方说明](https://perfetto.dev/docs/instrumentation/track-events) 同样区分 slice、counter、flow；该页面是滚动文档，固定合同以 proto 为准。Chrome 的 Google Docs Trace Event Format 在非浏览器文本读取中只返回需要 JavaScript，未冒称读到了正文；这里的 Chrome v1 配对/绑定结论直接来自固定 Catapult importer。

## 找到的原始 fixture 与可核事实

完整原件：[Catapult `tracing/test_data/flow.json`](https://github.com/catapult-project/catapult/blob/6fd8bbe723677254ff1130a1a416988b8b3e285e/tracing/test_data/flow.json)。**690902 bytes**，完整 SHA-256：`b17fa02df4a8584d230ad1014ef3578c2f141795681a8c682a644cf7eaf9d1f2`。本轮直接读取全部 JSON，在内存统计，没有运行 trace viewer 或输入里的任何代码。

`clientInfo.version` 为 `Chrome/30.0.1574.0`，command_line 为 `out/Release/chrome --flag-switches-begin --flag-switches-end`；原件带 Chrome 进程/线程 metadata、真实形态的源码位置和长事件序列，选它作为**上游发布的历史原始 trace fixture**，不是手写 SenderA/SenderB 小例。原采集命令/机器环境未独立复现，不称本轮实测、不推定它是生产事故，也不验证仪器化与原执行完全一致。

完整5017记录：s=866、f=886、B=1625、E=1622、M=18。原数组不是全局时间排序；索引按原件零起始 `traceEvents[index]`，不按函数名合并。

按所选 legacy v1 importer 使用的 `(cat,name,id)` 检查完整文件，有4组恰为一条s、一条f并跨线程。下面一组作为最小锚点，不对其余复用/缺失ID做启发式配对：

| 原始数组索引 | pid / tid | ph | ts（原微秒值） | name / id 或含义 |
| --- | --- | --- | ---: | --- |
| 2077 | 23924 / 23924 | B | 1496640971725 | SyncChannel::SendWithTimeout 开始 |
| 2078 | 23924 / 23924 | s | 1496640971731 | MessageLoop::PostTask，id=`0xafbe9607544ea9db`，cat=`task` |
| 2079 | 23924 / 23924 | E | 1496640971745 | SyncChannel::SendWithTimeout 结束 |
| 2082 | 23924 / 23930 | f | 1496640971809 | 同 cat/name/id，args.queue_duration=`0` |
| 2083 | 23924 / 23930 | B | 1496640971814 | MessageLoop::RunTask 开始，src_func=`Send` |
| 2084 | 23924 / 23930 | E | 1496640971839 | MessageLoop::RunTask 结束 |

可复核的端点差：`1496640971809 − 1496640971731 = 78 us`。源 slice 为20us，目标 slice 为25us。它们是三个不同量；78us只叫**flow记录端点的时间戳差**。不能给它贴 queue、CPU、网络、blocking 或 critical-path 名称。原始 `queue_duration=0` 仅照录；其仪器化单位、舍入和计算方法未审计，不以0否定78，也不以78覆盖0。

这个小段直接展示两种不同关联：s 位于同线程的 B/E 区间中；f 则出现在另一个线程的 RunTask B 之前5us。固定 [importer L2144–2159](https://github.com/catapult-project/catapult/blob/6fd8bbe723677254ff1130a1a416988b8b3e285e/tracing/tracing/extras/importer/trace_event_importer.html#L2144-L2159) 在该 `task` / 无 bp 的 v1情况下绑定**下一 slice**，不是“找包含它的区间”。不能用时间包含代替端点绑定合同。

原件也包含故意不应简化的负面材料：索引0、4、7共享 `(task,MessageLoop::PostTask,0xafbf7fb30669feb0)`，但阶段为 s/f/f；索引22、24在结束前再出现s。不能把相同id全局去重成一个任务，不能取最近同名事件补关系。上游 importer 会针对未开启/重复开启报告 warning；本轮没有运行它，不能给整份 trace 写“全部配对成功”。本段不是 `correlation_id` 示例；Perfetto correlation 区别来自 proto 定义，不能声称这份旧 trace 同时观察到了该新字段。

## 最小候选：固定选段的 flow 证据页

用户问题：看到跨线程两段工作时，哪条连接有明确flow端点，哪种关系只是嵌套，时间差究竟能叫什么？

建议只做一页：完整来源hash/版本 + 上述6个原始记录索引和原字段 + 两个记录端点间的明示 flow 关系；相邻B/E做上下文表。节点身份使用**记录索引**，不是复用的raw ID。图边只叫“原记录flow关联”，不叫一般 happens-before 或业务调用证明。可加同一页的“时间先后/同名/嵌套不能额外造边”阅读说明；不把未记录的箭头画成否定证据。

保持完整原件摘要与选段账目，输出明确“6条选择，原件5017条；其余未投影”，不假装完整执行。实际实施时应保存完整许可与来源通知；若只保存选段，逐字段拷贝精确原值并注明派生，禁止重写原ts。原件是否随分支分发应明确，不把重新格式化后的JSON hash叫原始hash。

测试只需：完整输入摘要一致；指定索引原字段一致；所选flow在完整文件里只有预期s/f；跨tid、同cat/name/id、方向保留；78us不是queue字段；无依据的边不存在。不要写通用async matcher或以大量合成fixture扩实现。更不要为了一个例子解析B/E全文件、适配新版protobuf、重建调度栈或采集用户进程。

**维护估计：低，限一个固定fixture的数据投影和原生图/Explainer；两三百行以内的原创生成/核对逻辑通常足够，不是排期承诺。** 若扩大为通用importer，scope/id寿命、同刻排序、open/closed状态、缺失记录、bp、v1/v2、溢出及trace版本都会成为长期责任，成本至少中高，应另立真实需求。当前不实施这些范围。

与已有X Waterfall的独立价值是保留**输入明确记录的跨线程flow关联**及端点证据，而非再画耗时条。与task-occurrences的独立价值是事件出现次数不作业务对象身份，phase/端点方向另有合同。真正用户收益仍未知；如果六行表已足够，就保留内容例，不升级新产品功能。

## 本轮证据状态

已核：3个默认分支固定SHA、选定源文件/许可、完整原始JSON hash/记录计数、上表原字段及算术、旧实验明确排除范围。未核：上游trace processor运行、原始Chrome30采集复现、protobuf/Chrome全格式兼容、浏览器视觉、端点映射在所有版本的一致性、生产因果或读者节时。未安装/运行上游，未修改产品/Skill/现有实验或远程状态。

此调研阶段只写入本报告；后续实现获单独授权后，在另一个隔离工作树与独立实验目录进行。AI assistance：Codex / gpt-6.1-sol 调研和写作；不代表人类验收。
