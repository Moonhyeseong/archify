# Compiler remarks：优化决策、源码位置与 IR 变化的证据范围

2026-10-25。先读取 hub 当时全部 33 份 scouts 的结论及 GitHub 来源，按 owner/repo 去重；已有 cargo-llvm-lines、symbol、profile、code/source 导览和 diagnostics 不重复作为新来源。未设置 star 门槛。本轮固定六个新项目，深读两份公开 LLVM IR/序列化备注测试 fixture；另外读到 LPTA 的 synthetic summary golden，明确不把它冒充实际 IR。只读 GitHub 源码、许可证正文和 fixture，没有执行 compiler、opt、JIT、上游代码、测试、安装或浏览器，没有上传源码、生成图片、commit/push；本文件是唯一新增报告。

**结论：0 个新增实施推荐，也不为了数量派发新内容实验。** LLVM 原生 opt-viewer、OptView2、cargo-remark 已提供源码旁的备注；IR viewer 已支持前后文本。现有 Archify Explainer/SourceCard 能把一条决策和多个精确位置摆在一起，没有找到需要新增 remarks parser、任意 LLVM IR 支持、pass pipeline 或新共享控件的实际问题。下面保留两组很小且可核对的阅读边界，供已有内容任务引用，不声称性能改进或真实用户收益。

## 去重及 Archify 已有能力

- `native-code-reading-smalltools.md` 研究过静态代码体积与 retained bytes，`profile-reading-smalltools.md` 已区分采样/计时/分母；本轮的 Hotness 不能再包装成性能监控。
- `symbol-evidence-smalltools.md` 已区分语法目标、解析目标、实际执行；`authoring-diagnostics` 已处理已有位置的显示；`source-navigation` / source-question-tour 已做问题驱动源码片段。只加 compiler 术语并不足以新开实现。
- `graph-comparison` / delta-values 已显示已有 old→new 字段；本轮不能以“IR 前后不同”再建议一个通用 diff viewer。
- 固定 Archify [`sources.mjs @82c7e0f089a02a4d514714adf37dc2061682da5f`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/sources.mjs#L192-L216) 已要求 Git source 的 path/lines、固定 revision 和同文档 revision 一致；冻结资源另有摘要。把 remark callsite 与 caller/callee 定义做成多个来源卡即可，不需把 line/column 路径猜成 call graph。此次未对源码卡进行新的浏览器验收。

## 六个来源：许可、输入与具体机制

commit 是本次读取快照，不等于发布版本。表内机制为源码可见行为；工具介绍中的“更快/更有效”不是本轮实测。LLVM 是语义参照，不把整个编译框架当“小依赖”。

| 来源与固定 revision | 实际许可 | 核对的源码/fixture | 边界与取舍 |
| --- | --- | --- | --- |
| [llvm/llvm-project](https://github.com/llvm/llvm-project/tree/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c) · `f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c` | [llvm/LICENSE.TXT](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/LICENSE.TXT)：Apache-2.0 WITH LLVM-exception，非 API NOASSERTION 所能替代 | [Remark.h](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/include/llvm/Remarks/Remark.h#L102-L132) 定义种类、可选 Loc/Hotness；Argument 可有自己的位置。两份 Inline `.ll` 带 YAML FileCheck 预期，详见后文。 | Passed 是某次优化决策成功，Missed 是某次尝试未成，Analysis 是分析信息；不是运行结果与效益分级。选段语义由协调 agent 独立复核。 |
| [OfekShilon/optview2](https://github.com/OfekShilon/optview2/tree/aec2d71f984e61884088834e3d2742c31a25bc12) · `aec2d71f984e61884088834e3d2742c31a25bc12` | 当前 tree 未找到 LICENSE/COPYING，所读 optrecord.py 无许可头；**复用许可未核实，仅公开源码观察，不复制实现** | [README](https://github.com/OfekShilon/optview2/blob/aec2d71f984e61884088834e3d2742c31a25bc12/README.md) 明确源自 LLVM opt-viewer，聚焦 missed、合并 index、去系统 header、限制每行重复项；[optrecord.py](https://github.com/OfekShilon/optview2/blob/aec2d71f984e61884088834e3d2742c31a25bc12/optrecord.py) 保存 Pass/Name/Function/Args/DebugLoc，缺 Hotness 默认成 0。 | 可借 source-adjacent 阅读机制，不能借其零值默认把“未提供 profile”解释为零热度。过滤后的列表不是完整 optimization record。根仓库“fork”说明不自动补足所有文件许可。 |
| [Kobzol/cargo-remark](https://github.com/Kobzol/cargo-remark/tree/3f45243c77b84e073e86924d330ce6ef46e4ea5d) · `3f45243c77b84e073e86924d330ce6ef46e4ea5d` | [MIT 正文](https://github.com/Kobzol/cargo-remark/blob/3f45243c77b84e073e86924d330ce6ef46e4ea5d/LICENSE) | [parse.rs](https://github.com/Kobzol/cargo-remark/blob/3f45243c77b84e073e86924d330ce6ef46e4ea5d/src/remark/parse.rs) 分 Missed/Analysis/Passed、可选 DebugLoc/Hotness、Caller/Callee/Reason/Other；[mod.rs](https://github.com/Kobzol/cargo-remark/blob/3f45243c77b84e073e86924d330ce6ef46e4ea5d/src/remark/mod.rs) 将含位置的 Args 变 AnnotatedString，Analysis 仅取 loop-vectorize，按 source availability/external/filter_kind 过滤。 | 输出是选择性解释，不是所有 remark。默认排除某些源和无位置记录会改变分母；不能将“没显示”当“没发生”。公开 analyze integration test 只检查生成页存在，不等于备注语义/收益验收。 |
| [sunxfancy/vscode-llvm](https://github.com/sunxfancy/vscode-llvm/tree/0fb6869dce665144ece1c0dcf827e9224f849e33) · `0fb6869dce665144ece1c0dcf827e9224f849e33` | [MIT 正文](https://github.com/sunxfancy/vscode-llvm/blob/0fb6869dce665144ece1c0dcf827e9224f849e33/LICENSE) | [pipeline-panel.ts](https://github.com/sunxfancy/vscode-llvm/blob/0fb6869dce665144ece1c0dcf827e9224f849e33/src/pipeline-panel.ts) dim 相同 IR 的 pass；双 pipeline 先比共同前缀，再按索引对照 pass name/before_ir/after_ir。 | 展示对齐不等于语义稳定 pass identity；pipeline 插入/重排后按位置配对需谨慎。浅读所选 renderer，不执行扩展或编译链。 |
| [afshin/llvm-explorer](https://github.com/afshin/llvm-explorer/tree/9fca774f0f45fd04c8b25557a37aacf81e31b08e) · `9fca774f0f45fd04c8b25557a37aacf81e31b08e` | [BSD-3-Clause](https://github.com/afshin/llvm-explorer/blob/9fca774f0f45fd04c8b25557a37aacf81e31b08e/LICENSE)；runtime 所带 LLVM/Graphviz 等各有许可文件，非一律 BSD | [compiler/types.ts](https://github.com/afshin/llvm-explorer/blob/9fca774f0f45fd04c8b25557a37aacf81e31b08e/src/compiler/types.ts) 把 language/target/optimization/pipeline 与 request 绑定；Artifact 有 build id/kind/path，Stage 分 status/commands/diagnostics/stdout/stderr/exitCode/duration。 | 产物绑定同一 build snapshot 是好机制；stage duration 是工具工作时长，不是生成程序 runtime。已有完整 workbench，不推荐 Archify 再建编译服务/浏览器 WASM compiler。 |
| [rithesh-4/LPTA](https://github.com/rithesh-4/LPTA/tree/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62) · `c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62` | [MIT 正文](https://github.com/rithesh-4/LPTA/blob/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/LICENSE) | [serve_dashboard.py](https://github.com/rithesh-4/LPTA/blob/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/serve_dashboard.py) 比较 metadata compatibility、pass effects、静态 instruction/codegen metrics；[04_ir_only golden](https://github.com/rithesh-4/LPTA/tree/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/tests/compare_golden/04_ir_only) 声明 IR change 却保持 unchanged verdict。 | 比较层 fixture 是 synthetic 摘要，不含真实 before/after IR bytes；不能冒充 LLVM remark 或实际运行性能。保留为旁证，不算第二份 raw IR 深读。 |

## 深读 A：两个 missed callsite，不是同一条重复备注

固定 [optimization-remarks-yaml.ll](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-yaml.ll) 同时包含公开 IR、debug/profile metadata、RUN 行和 YAML FileCheck 预期；本轮没有执行 RUN。

[预期 L50–77](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-yaml.ll#L50-L77) 有两个 `!Missed`，Pass 都为 inline、Name 都为 NoDefinition、Function 都为 baz。二者 remark 位置都在 `/tmp/s.c` 第5行，但列分别10与18，Callee 分别 foo/bar。Caller Arg 自己的 DebugLoc 是定义处第4行第0列，不是 remark 的 callsite。

若按 type/pass/function/line 合并，便会把两个有意义的调用位置压成一条；若把 caller 的定义行用作“失败发生处”，又会指错位置。两条源代码引用、各自列号及原始 Args 比更大的调用图更有帮助。源码路径只是 fixture metadata，本文未从本机 `/tmp/s.c` 读取或猜测它的当前内容。

[阈值测试 L8–18](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-yaml.ll#L8-L18) 将 hotness threshold 设100，预期 serialized file 为空。这证明过滤可能使记录消失，不证明没有 missed optimization。该 fixture 的 [末尾 profile metadata](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-yaml.ll#L105-L119) 手写 function_entry_count=30；producer 字符串是历史 clang4，不是本轮实际编译器 provenance。这不是一次真实 instrumentation workload 或性能 benchmark。

`NoDefinition` 只解释该 pass 在所给模块/阶段不能内联：没有 callee definition。它不证明任意配置下都不能优化，也不证明删去调用、改 API 或强制 inline 会加速。Hotness=30 不是 30ms、30%的 CPU，更不是“优化可节省30次调用”的直接收益结论。

## 深读 B：callee 被删后仍保留其定义位置

第二份实际 IR fixture 是 [optimization-remarks-passed-deleted-callee-yaml.ll](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-passed-deleted-callee-yaml.ll)。[L23–26](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-passed-deleted-callee-yaml.ll#L23-L26) 明确此处 foo 为 internal，内联后可删除，但备注应在删除前捕获其 DebugLoc。它不是用另一个 source snapshot 去猜已消失函数的位置。

[预期 L30–58](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-passed-deleted-callee-yaml.ll#L30-L58) 为 `!Passed / Inlined`，主要位置是 callsite 第4行第10列；Callee foo 定义在第1行第0列，Caller bar 定义在第3行第0列。三个位置各有角色，不能只留一个“sourceLocation”。同一文件还有相对 callsite 参数，用处与绝对 DebugLoc 也不同。

切换 annotate-inline-phase 后，Pass 标记由 inline 变 main-always-inline；这并没有在 fixture 中变成更大收益，反映的是记录阶段的标识。Cost 与 Threshold 是编译器模型量，FileCheck 用数值正则匹配；它们不是毫秒或测得 speedup。[L95](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/test/Transforms/Inline/optimization-remarks-passed-deleted-callee-yaml.ll#L95) 的 Hotness30 同样来自手工 metadata。

两份 LLVM fixture 都由本 agent 读取，协调 agent 另独立核对关键行。这里的“成功/未成功”是上游测试预期的优化记录种类，未宣称本轮跑过新 HEAD、跨平台通过或执行程序更快。

## LPTA 的旁证：IR change 标签与性能裁决分离

[base.json](https://github.com/rithesh-4/LPTA/blob/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/tests/compare_golden/04_ir_only/base.json) 与 [curr.json](https://github.com/rithesh-4/LPTA/blob/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/tests/compare_golden/04_ir_only/curr.json) 的 FooPass event 只把 ir_changed 从 false 改为 true，has_changes 仍 false，instruction count 仍100→100，passes_with_ir_changes 从0变1。[expected.json](https://github.com/rithesh-4/LPTA/blob/c7052b5a3f75e35cb9700fb7440eebf3bf3a3d62/tests/compare_golden/04_ir_only/expected.json) 标 newly_effectful，却仍判 unchanged、score0、improvements/regressions均0。

这是已提交的比较器 synthetic fixture：input_ir_hash 为短占位 aa，ir_before/ir_after 都 null，没有真实 IR diff；不能由 ir_changed 标志补画删了哪些指令。它支持“不同统计分项有不同合同”，不是独立性能 proof。该工具的 score 是其自定 regression heuristic，0 不等于机器运行无变化或程序最优；字段叫 improved 也不能转述实测 speedup。

## 应保留哪些证据，不额外造模型

| 字段/事实 | 正确阅读 | 不可声称 |
| --- | --- | --- |
| Passed / Missed / Analysis | producer 对特定 pass/action 的报告类型；Analysis 也有额外细分种类 | 绿色=程序快了，Missed=程序错误，Analysis=一定有优化 |
| Pass + Name + Function | 原始决策标识与报告函数上下文，保留版本/阶段 | pass 名永久稳定、每次出现都是同一执行实例 |
| remark Loc 与每个 Arg Loc | 分开保存 callsite/caller/callee 等角色；都可能缺失 | 任一位置都能替代其他位置，缺失位置可由同名函数猜出 |
| Hotness | 有对应 profile 时的执行次数/producer 估计范围，附 profile 来源和过滤阈值 | 毫秒、CPU份额、source 行总调用数、优化收益；缺值=0 |
| IR before/after | 固定 toolchain/target/pipeline/input 下的文本或结构差异，实际 bytes 存在才展示 | runtime 行为相同/不同、语义正确或性能提升 |
| 源码引用 | 与备注生成输入相匹配的 revision/content；SourceCard 可冻结片段 | 当前 checkout 中同一路径必然是编译时原文 |

可选位置、Hotness 与 Argument Loc 的规范来源为 [Remark.h](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/include/llvm/Remarks/Remark.h)。Hotness 说明针对 profile instrumentation run；真实读取应用仍需记录 profile 的时间、工作负载、采集/导入方式及与本次编译的关系，备注本身不总携带这些 provenance。未提供不能编写合理值填满表格。不同 profile 或编译 flags 的 remarks 数量也不能直接作为优劣分数。

cargo-remark 的两个选定 opt.yaml 读取呈空时，进一步 tree metadata 说明一个文件实际0字节，另一个2.85MB大文件的 Contents API没有内联内容。**没有把 API 空内容解读成“整个项目无优化备注”。** 本轮未下载/运行大样例，深读限定为上面两份 LLVM IR。第三方缺失或过滤的记录不计为零。

## 与已有 viewer 的差异与 Value / Cost / Impact

[原生 opt-viewer 的 SourceFileRenderer](https://github.com/llvm/llvm-project/blob/f17204bd4c24b4cf0ab7b9b041ddc0fe0529ca3c/llvm/tools/opt-viewer/opt-viewer.py#L50-L125) 已做源码注解，OptView2 把视线收窄到 missed，cargo-remark 还将 caller/callee 的 Args 做成可跳转消息；vscode-llvm/llvm-explorer 已有完整 pipeline/多产物工作台。Archify 的价值如果存在，应是为一次明确审阅问题写可分享的解释，而不是复制这些工具。当前没有用户问题证明原工具难以读，也没有 measured workload、对照耗时或理解正确率，因此不新开内容实验。

- **Value：** 两个固定 fixture 能防止误合并 callsite、误用 definition location、误读阈值空输出和 Hotness。已有源码卡、原文 snippet、事实表即可表达；不是发现产品缺少这一数据模型。
- **Cost：** 手工引用几条固定记录很低；引入 parser 会遇到 YAML标签/bitstream、optional和unknown字段、跨版本pass identity、内联/宏/源码快照、过滤覆盖、demangling与profile provenance，远高于本轮需求。
- **Impact：** 不改产品、不新增任意IR编译入口/JIT/framework、不接上游执行、不复用许可未明的代码。若未来真实任务要求导入既有优化记录，先取得完整可公开producer artifact、原源码revision与编译/profile配置，再单独定义输入合同；此报告不构成实现准入或性能验收。

结论维持0新增实施。未生成网页/图片、运行compiler或上游测试、做browser/视觉/人类收益验收，未 commit/push。
