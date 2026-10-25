# 增量构建：为何检查、为何重跑，以及结果是否继续失效

2026-10-25。先读 hub 当时全部 29 份 scouts 的结论与来源清单，对全部 GitHub owner/repo 排重。不以 stars 筛选；Ninja、Bazel、Make、Just、Task、Terraform 与现有 dependency-map/trace-waterfall 不再列为新发现。本轮核对六个新来源，深读两组实际提交的测试 fixture；只读官方 GitHub 源码、许可及文档，没有运行上游 build、测试、compiler、cache server、scanner 或陌生代码，没有安装依赖、读取私仓或上传日志。本报告是唯一新增文件。

**最多保留一个条件内容实验：用 redo 的固定 stamp fixture 解释“子目标确实重跑，但其声明 stamp 未变，因此父目标没有重跑”。** 它需要把决策阶段、执行事实与结果传播分列，普通依赖 DAG/执行瀑布图不单独回答。当前 Archify 的 Explainer 表格与源码引用已能表达；不推荐新 build parser、cache evaluator、调度器、dashboard 或共享 Viewer 控件。未证明自然读者任务收益前，可直接不实施。

## 去重后的范围

`build-infra-smalltools.md` 已做 CI conditions/recipe stages/plan actions，说明依赖关系和条件不等于执行；`traces-timelines.md` 已做完整事件时间线；`native-code-reading-smalltools.md` 已区分文件体积的计量边界；`notebook-evidence-smalltools.md` 已解释更新与派生 stale 的不同。此次只关注**构建工具在同一次检查中如何先得到“不确定”、执行一个子项、再抑制父项失效**，不是换语言重画一张 DAG。

当前产品引用固定基线 [`82c7e0f089a02a4d514714adf37dc2061682da5f`](https://github.com/tt-a1i/archify/tree/82c7e0f089a02a4d514714adf37dc2061682da5f)。没有发现公共 CLI 或 renderer 缺少能力；也没有把研究授权解释成正式功能准入。采用 archify-review 的 Value/Cost/Impact 尺度，结论见末节。

## 六个固定来源与实际许可证

commit 是调查时的源码快照，不等于 release。许可从同 revision 的正文读取；API 的 NOASSERTION 不用来替代许可正文。下面的“机制”来自选定实现/测试，不是本轮执行结果。

| 来源与固定 SHA | 许可 | 核对的输入、决策与实际证据 | 对 Archify 的判断 |
| --- | --- | --- | --- |
| [ccache/ccache](https://github.com/ccache/ccache/tree/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350) · `a71fe22a9f480e9c785ee65997c2fcaeeb8bc350` | [LICENSE.adoc](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/LICENSE.adoc) 明确整体 GPL-3.0-or-later；个别文件另许可，不泛化为 MIT | [direct.bash](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/test/suites/direct.bash) 有坏 manifest 后预处理命中；[stats_log.bash](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/test/suites/stats_log.bash) 断言按 source 分组的多项 stats event；manual 区分 common/direct/preprocessor hash 输入。 | stage miss 不等于最终完整编译；累计统计不能直接当每个命令的 receipt。只借阅读机制，不复用 GPL 实现。 |
| [mozilla/sccache](https://github.com/mozilla/sccache/tree/a24b0582abf89d0f2159480ae3305a966e30def9) · `a24b0582abf89d0f2159480ae3305a966e30def9` | [Apache-2.0 正文](https://github.com/mozilla/sccache/blob/a24b0582abf89d0f2159480ae3305a966e30def9/LICENSE) | [compiler.rs](https://github.com/mozilla/sccache/blob/a24b0582abf89d0f2159480ae3305a966e30def9/src/compiler/compiler.rs#L1229-L1269) 分 Normal/ForcedNoCache/ForcedRecache/TimedOut/CacheReadError；CompileResult 另分 Hit/Miss/NotCached/NotCacheable/CompileFailed。 | Normal miss 只说没找到，不自动归因源文件变化；缓存策略、可缓存性、编译失败和读取错误不能统称 key mismatch。仅浅核 selected source，不声称全编译器支持。 |
| [ndmitchell/shake](https://github.com/ndmitchell/shake/tree/526051c894aa88addb845e3e6b52b02a69becf8a) · `526051c894aa88addb845e3e6b52b02a69becf8a` | [BSD-3-Clause 正文](https://github.com/ndmitchell/shake/blob/526051c894aa88addb845e3e6b52b02a69becf8a/LICENSE) | [Manual](https://github.com/ndmitchell/shake/blob/526051c894aa88addb845e3e6b52b02a69becf8a/docs/Manual.md) 的 need/neededMakefileDependencies/getDirectoryFiles 是不同来源的 tracked dependency；[Rebuild.hs](https://github.com/ndmitchell/shake/blob/526051c894aa88addb845e3e6b52b02a69becf8a/src/Test/Rebuild.hs) 同一 a→b→c 链显式测试 --rebuild/--skip 与后续检查。 | 执行策略可覆盖一般变化检查；跳过不是证明 fresh。该测试的 timestamp 是写入内容的 marker，不是实际墙钟采样。本轮不接 Haskell engine。 |
| [com-lihaoyi/mill](https://github.com/com-lihaoyi/mill/tree/e4af3db91cb90f42f1c4a5b555197491989c9a69) · `e4af3db91cb90f42f1c4a5b555197491989c9a69` | [MIT 正文](https://github.com/com-lihaoyi/mill/blob/e4af3db91cb90f42f1c4a5b555197491989c9a69/LICENSE) | [InvalidationForest.scala](https://github.com/com-lihaoyi/mill/blob/e4af3db91cb90f42f1c4a5b555197491989c9a69/core/internal/src/mill/internal/InvalidationForest.scala) 为 mill-invalidation-tree.json 合并 task invalidation 与 method codesig forest，并把同一特殊 reason 的 task 分组；[ExtendsInvalidation.scala](https://github.com/com-lihaoyi/mill/blob/e4af3db91cb90f42f1c4a5b555197491989c9a69/integration/feature/extends-invalidation/src/ExtendsInvalidation.scala) 修改 package build 后重新解析命令。 | reason tree 很贴近题目，但它是 producer 的依赖/代码签名解释，不是实际 syscall/call trace，也不是每条边的 wall-clock 顺序。本轮只核机制与 fixture，没有取得运行生成的 forest golden，不推荐 parser。 |
| [ndmitchell/rattle](https://github.com/ndmitchell/rattle/tree/3c935ca004ec8557ad6edb92d42f8bdf5bc78f46) · `3c935ca004ec8557ad6edb92d42f8bdf5bc78f46` | [BSD-3-Clause 或 Apache-2.0，用户可选](https://github.com/ndmitchell/rattle/blob/3c935ca004ec8557ad6edb92d42f8bdf5bc78f46/LICENSE) | [Types.hs](https://github.com/ndmitchell/rattle/blob/3c935ca004ec8557ad6edb92d42f8bdf5bc78f46/src/Development/Rattle/Types.hs) 把 fsatrace read/query/write/delete/move/touch 投影到 Touch；[Server.hs](https://github.com/ndmitchell/rattle/blob/3c935ca004ec8557ad6edb92d42f8bdf5bc78f46/src/Development/Rattle/Server.hs) 保存 trace (filename,modtime,hash)，分 required/speculation，发现 hazard 可无 speculation 重试。 | 观测触达与声明 need 不同；Query 归 read 是内部简化，不可声称都是内容读取。执行重试/hazard 也不等于 cache key 改变。仅选段源码，不运行 fsatrace。 |
| [apenwarr/redo](https://github.com/apenwarr/redo/tree/7f00abc36be15f398fa3ecf9f4e5283509c34a00) · `7f00abc36be15f398fa3ecf9f4e5283509c34a00` | [Apache-2.0 正文](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/LICENSE) | [deps.py](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/redo/deps.py) 的 isdirty 返回 CLEAN/DIRTY/先构建目标列表三种；[s60-stamp fixture](https://github.com/apenwarr/redo/tree/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp) 用实际日志计数断言重跑与传播。 | 唯一条件内容候选。stamp 是脚本指定 stdin 的摘要，不自动覆盖所有输出/side effects。例子老而具体，不把历史提交称当前跨平台支持。 |

## 深读 A：direct miss 后仍命中预处理缓存

固定 [direct.bash L75–94](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/test/suites/direct.bash#L75-L94) 的测试先产生一次缓存 miss；随后删除 manifest 并以 touch 建一个空文件，下一次调用的 expected preprocessed_cache_hit 变为 1，cache_miss 累计仍为 1。再下一次调用 expected direct_cache_hit 为 1，preprocessed hit 累计仍为 1。这是上游受控损坏 fixture，不是本轮发生的构建事故。

正确阅读必须分开：

| 阶段 | fixture 的可核对证据 | 不可扩大成 |
| --- | --- | --- |
| 首次准备 | 完整 miss 累计为 1，缓存产生 manifest/result | 没有任何缓存服务运行/存储错误的普遍保证 |
| manifest 破坏后的调用 | 预处理 hit 累计增加，而完整 cache_miss 未增加 | “direct miss 所以完整编译重跑了” |
| 后续调用 | direct hit 累计增加 | 新执行记录证明任意源/header 都没变 |

[Manual L1677–1679](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/doc/manual.adoc#L1677-L1679) 说明通常 direct 失败会回退 preprocessor mode，depend mode 例外；[L1697–1708](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/doc/manual.adoc#L1697-L1708) 说明该阶段可运行 compiler -E 预处理。因此不能写“compiler 完全没有运行”；准确说命中缓存避免了完整编译，仍可能有预处理工作。上述 fixture 与精确手册位置由同轮协调 agent 独立复核，本 agent 也读取了测试。

[Manual L1534–1544](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/doc/manual.adoc#L1534-L1544) 的 counters 是累计并可 reset。表中变化是从 fixture 相邻断言作比较，不冒充每 invoke 的独立 JSON receipt、原始时间序列或实测节省秒数。`stats_log.bash` 同一次源文件调用可以产生 cache_miss、direct_cache_miss、多个 storage read miss 等多个 event；不能把这些相加算成多次编译失败。

[Cache debugging](https://github.com/ccache/ccache/blob/a71fe22a9f480e9c785ee65997c2fcaeeb8bc350/doc/manual.adoc#L1857-L1870) 建议比较注解过的 common/direct/preprocessor input 与同次 log；单看最终 hash 不会给出哪个输入、策略或存储步骤导致结果。本文不改编译参数、不运行破坏性 cache 操作，也不依宣传估算性能。

## 深读 B：子项执行，stamp 未变，父项保留

真实输入是固定 [t/s60-stamp](https://github.com/apenwarr/redo/tree/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp)，各文件互相解释，不能只截一条 echo：

- [stampy.do](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp/stampy.do) 声明依赖 inp 与 bob；执行时往 stampy.log 追加记录，输出 inp，并把 inp 作为 redo-stamp 的 stdin。
- [usestamp.do](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp/usestamp.do) 声明依赖 stampy；真正执行时才往 usestamp.log 追加记录。
- [stamptest.do L27–41](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp/stamptest.do#L27-L41) 在 redo bob 后检查：stampy 日志行数从前一步 2 增到 3，usestamp 仍为 1；再次检查两者计数不变。
- [L45–57](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp/stamptest.do#L45-L57) 真正改变 inp 内容后，stampy 先重跑，下一次请求才令 usestamp 从 1 增到 2。删除 stampy 再同内容生成的 [L59–66](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/t/s60-stamp/stamptest.do#L59-L66) 也保留父计数。

这些计数是**上游测试的预期断言**，未在本轮运行。fixture 的 L17 会 source `skip-if-minimal-do.sh`；不得由读源码声称所有 redo 实现/平台均通过。记录有独立 agent 复核，但这仍不是人类验收或运行结果。

[deps.py L83–139](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/redo/deps.py#L83-L139) 解释为什么：被检查对象可能只是需要先构建，才能知道父项是否 dirty。该“必须先问子项”的列表不能压扁成 true；否则图会错误宣称整个上游必重跑。[cmd_stamp.py](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/redo/cmd_stamp.py) 对 stdin 做 SHA-1、比较旧 csum，changed 时更新 changed 标记，否则仅 set_checked。此处 hash 是构建工具选择的变化标记，不是安全完整性证明。

[redo-stamp 文档](https://github.com/apenwarr/redo/blob/7f00abc36be15f398fa3ecf9f4e5283509c34a00/docs/redo-stamp.md) 明确 stdin 可以是目标内容、文件名清单或其他任意数据。因此“stamp 相同”只能解释这套脚本的失效合同；不能说整个工作目录、所有 side effects、网络结果或日志都没变。这里 stampy.log 明明增加了，但它不是该 stamp 的输入。

## 解释所需的证据层次

仅作为未来阅读约定，不另造通用 schema：

| 层次 | 可接受来源 | 保留的未知与不能做的推断 |
| --- | --- | --- |
| 声明依赖 | rule 的 need/redo-ifchange/配置 | 没声明不等于没读取；声明了不等于本次实际读取 |
| 观测触达 | producer 的 read/query/write trace，含运行范围 | probe 与内容读取不同，过去记录不保证覆盖未来分支/外部状态 |
| fingerprint | producer 的带作用域输入项、值/摘要、配置、工具版本 | 不同 hash 只说明被 hash 内容不同；没有 input data/baseline 时不补“某源文件导致” |
| 决策 | exact action 的 cache status、reason、依赖检查结果 | miss、not-cacheable、forced recache、读错、未执行都分开；Normal miss 无更细归因 |
| 执行及结果传播 | 真实 command/target event、退出状态、producer 输出/stamp 决策 | 检查≠执行，执行≠输出变，输出变≠所有父项执行；顺序图也不证明原因 |

sccache [Normal miss 定义](https://github.com/mozilla/sccache/blob/a24b0582abf89d0f2159480ae3305a966e30def9/src/compiler/compiler.rs#L1229-L1240) 本来就不包含更细根因；[L776–797](https://github.com/mozilla/sccache/blob/a24b0582abf89d0f2159480ae3305a966e30def9/src/compiler/compiler.rs#L776-L797) 又区分编译成功后不缓存与不具可缓存性。不能把所有分支重写成“输入 digest 变了”。Mill forest 则是对 producer 理由的整理，引用路径不等于实际执行方法的调用栈；树形 spanning view 也不应被称完整多路径图。

同轮协调 agent 独立核对的大系统参考：[BuildXL cache miss analysis，固定 a10d36c6d8d6aa9da5d95c6db849a1bf215d6d2e](https://github.com/microsoft/BuildXL/blob/a10d36c6d8d6aa9da5d95c6db849a1bf215d6d2e/Documentation/Wiki/Advanced-Features/Cache-Miss-Analysis.md#L3-L14)，[MIT](https://github.com/microsoft/BuildXL/blob/a10d36c6d8d6aa9da5d95c6db849a1bf215d6d2e/LICENSE)。它要求 fingerprint input data 与明确 baseline；[L79–96](https://github.com/microsoft/BuildXL/blob/a10d36c6d8d6aa9da5d95c6db849a1bf215d6d2e/Documentation/Wiki/Advanced-Features/Cache-Miss-Analysis.md#L79-L96) 区分 dirty observed file/probe 和一个后来验证不存在、**不构成 cache miss cause** 的 potentially added 文件。过滤后缺基线资料也不等于成功归因。本轮未深读或执行 BuildXL，不把该大型平台计为第七个“小工具”推荐。

## 唯一条件内容候选与 Value / Cost / Impact

候选问题只问：**bob 变化后，为什么 stampy 跑了，usestamp 却没跑？之后改 inp 为什么结论不同？** 用现有 Explainer 的一张小关系图、三列事实表与 pinned source 卡即可；每一行同时写“请求/检查”“实际执行计数的上游断言”“stamp/父项决策”。不制作时间条，没有测得时长就不填 0，不合成 log collector 输出。ccache 仅作不能把局部 miss 当完整重编译的旁证，不再推荐第二实验。

- **Value：** 上游 fixture 有具体且可核对的两阶段决策，能纠正“上游变了所以整条链都重跑”的错误解释。尚无自然 Archify 用户交接任务或效率对照，收益仍是假设。
- **Cost：** 一页 authored 内容很低；接多个工具则必须维护 target identity、缓存层、累计计数分组、输入覆盖、脚本定义的 stamp 与版本语义，显著超过当前证据。拒绝运行器、统一 parser/dashboard。
- **Impact：** 内容实验无需产品行为变更，不改变 typed schema/renderer/Viewer/安装。若将来要引入工具导出适配器，则是新的输入合同，须另论维护者范围和真实 producer 证据，不能复用此报告作为准入。

最小证伪办法是拿同一固定 fixture，比较普通 DAG 与“执行/声明 stamp/父决策”并排说明是否更准确回答上述两个问题。若现有页面已能清楚回答，或没有真实交接需要，停止该方向；不为增加实验数量新增 parser 或控件。本轮未实施页面、图、浏览器、跨平台或用户验收，未 commit/push。
