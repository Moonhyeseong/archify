# Notebook reading round 10：哪个 cell 改了，哪个保存输出一起改了？

2026-10-25，只读调研。开始时排重 hub README 与全部 54 份 scouts、438 个 GitHub owner/repo 引用；marimo、Pluto、ipyflow、akernel、Venus、Sabela 与 nbformat 已在 notebook-evidence 报告，不重复计数。下面六个此前未列入的新来源不按 stars 筛选。遵循 research 与 archify-review，以 owning source、完整已提交 fixture 和现有能力判断价值；未安装、执行上游、启动 kernel/服务、打开浏览器或生成产物。只新增本报告。

**保留一个小内容实验，不新增产品能力：解释 nbdime 固定两快照里“首个赋值源文本改变、紧随保存输出改变、后面重复文本 cell 未变”。** 读者能回答具体哪个 occurrence 改了，而不是只听“不等于执行”。完整 base/local/diff 是可审计 oracle；它们没有 runtime dependency 或执行历史。现有 Explainer 表、literal/@diff 与原生 Tree 的 snapshot→occurrence 组织足够，不需要 notebook importer、通用 JSON patcher、kernel 或计算平台。

## 六个新来源

| 固定项目 / 许可 | 读取的实际机制与源码位置 | 可借鉴与排除边界 |
| --- | --- | --- |
| [jupyter/nbdime@744c97897e2c33a1b3f04f5834ee6e70478219a2](https://github.com/jupyter/nbdime/tree/744c97897e2c33a1b3f04f5834ee6e70478219a2) · [BSD-3-Clause LICENSE.md](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/LICENSE.md) | [notebooks.py L294–384](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/diffing/notebooks.py#L294-L384) 按 type/source、可选 output、存在的 ID 比较 cell；[L521–556](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/diffing/notebooks.py#L521-L556) 配置多级 sequence 对齐、source line diff 与独立 output diff。 | 深读下述三文件。保留相同文本的不同 occurrence，源变化和保存输出变化分列；对齐不是永久身份或执行因果。 |
| [jupyter/nbclient@0811ff44c63c9853c4d6ba7265d7042ca7f8742a](https://github.com/jupyter/nbclient/tree/0811ff44c63c9853c4d6ba7265d7042ca7f8742a) · [BSD-3-Clause LICENSE](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/LICENSE) | [client.py L961–1000](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/nbclient/client.py#L961-L1000) 在发送 execute 前返回非 code、空源或 skip-tag cell；默认 tag [L182–188](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/nbclient/client.py#L182-L188) 为 skip-execution。 | 深读完整 513B fixture 与 test hookup。空输出不能单独证明 skipped；上游明确分支/配置才支持该解释。无需给 Archify 接 kernel。 |
| [nteract/papermill@e4e4ddd362037309c53ab5230541759707779687](https://github.com/nteract/papermill/tree/e4e4ddd362037309c53ab5230541759707779687) · [BSD-3-Clause LICENSE](https://github.com/nteract/papermill/blob/e4e4ddd362037309c53ab5230541759707779687/LICENSE) | [parameterize.py L88–125](https://github.com/nteract/papermill/blob/e4e4ddd362037309c53ab5230541759707779687/papermill/parameterize.py#L88-L125) 插入或替换 injected-parameters cell，不重写原参数 cell；[官方固定文档 L67–94](https://github.com/nteract/papermill/blob/e4e4ddd362037309c53ab5230541759707779687/docs/usage-parameterize.rst#L67-L94) 明示 inter-dependent 参数不会自动重算。 | 完整 binder input/output 保存 msg=None → 注入 msg="Hello" → 保存 Hello 的形状。可讲注入层，不能把普通赋值覆盖画成 reactive propagation；与已有 stale 派生值话题接近，本轮不另立实验。 |
| [mwouts/jupytext@932bcdb243842598acb00f6ab861b645bfc98b6a](https://github.com/mwouts/jupytext/tree/932bcdb243842598acb00f6ab861b645bfc98b6a) · [MIT LICENSE](https://github.com/mwouts/jupytext/blob/932bcdb243842598acb00f6ab861b645bfc98b6a/LICENSE) | [combine.py L36–116](https://github.com/mwouts/jupytext/blob/932bcdb243842598acb00f6ab861b645bfc98b6a/src/jupytext/combine.py#L36-L116) 把一份 notebook 的 source/metadata 与另一份的 outputs/metadata 合并；[L122–180](https://github.com/mwouts/jupytext/blob/932bcdb243842598acb00f6ab861b645bfc98b6a/src/jupytext/combine.py#L122-L180) 先按 type/内容匹配，再用未匹配输出、后缀和位置回退；内容比较去掉格式字符。 | 保留“保存的输出来自另一份材料”的 provenance，匹配结果不是 fresh 证明。不复制 heuristics，也不把 format-insensitive matching 当严格源码等价。 |
| [ploomber/ploomber@0659c8a030f3a439dd606f2aaa7f5352717dd2d0](https://github.com/ploomber/ploomber/tree/0659c8a030f3a439dd606f2aaa7f5352717dd2d0) · [Apache-2.0 LICENSE](https://github.com/ploomber/ploomber/blob/0659c8a030f3a439dd606f2aaa7f5352717dd2d0/LICENSE) | [python.py L70–137](https://github.com/ploomber/ploomber/blob/0659c8a030f3a439dd606f2aaa7f5352717dd2d0/src/ploomber/static_analysis/python.py#L70-L137) 从参数 cell 找 upstream 赋值，返回键集合；其 extract_variable 实际调用 eval 取得 RHS，非安全纯 JSON 解析。 | “声明/抽取的 upstream”不等于 observed read。不能因模块叫 static_analysis 就安全执行陌生 cell。已有依赖图方向覆盖，排除导入或运行此 extractor。 |
| [vatlab/sos-notebook@a770bbdf1069972adf64b33e6b2a4f9e7bc643bb](https://github.com/vatlab/sos-notebook/tree/a770bbdf1069972adf64b33e6b2a4f9e7bc643bb) · [BSD-3-Clause LICENSE](https://github.com/vatlab/sos-notebook/blob/a770bbdf1069972adf64b33e6b2a4f9e7bc643bb/LICENSE) | [kernel.py L452–489](https://github.com/vatlab/sos-notebook/blob/a770bbdf1069972adf64b33e6b2a4f9e7bc643bb/src/sos_notebook/kernel.py#L452-L489) 与 [L527–580](https://github.com/vatlab/sos-notebook/blob/a770bbdf1069972adf64b33e6b2a4f9e7bc643bb/src/sos_notebook/kernel.py#L527-L580) 显式 get/put 分派到语言模块，保留 kernel、变量、as 名与异常边界；[README](https://github.com/vatlab/sos-notebook/blob/a770bbdf1069972adf64b33e6b2a4f9e7bc643bb/README.md) 明示 classic 前端已迁往 JupyterLab，本仓仍为 backend。 | kernel/source-language/变量名应分开；同名变量不是跨 kernel 同一对象。没有固定语言转换记录就不推 copy/alias/type 等价，亦不把旧前端宣传当当前实现。 |

## 深读 A：六个 occurrence，两个不同层面的 patch

固定 nbdime 三份完整原文件，均位于 `nbdime/tests/files/`；完整 [LICENSE.md](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/LICENSE.md) 为 2885B，SHA256 `e1f09fb826f2849211dd2e58d9541faf88fb3db04dee89c468f09a59dd00f8b9`。

| 完整文件 | bytes | SHA256 |
| --- | --- | --- |
| [multilevel-test-base.ipynb](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-base.ipynb) | 1706 | `13cd472a33d45987f715db064d51eb3f9fc26381f8aca876adb6a3d734446265` |
| [multilevel-test-local.ipynb](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-local.ipynb) | 1707 | `2d88dbe05ac89d1b9617e97af4fd5c480c155edae6821cdd152e15816c13d6c2` |
| [multilevel-test-base-local-diff.json](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-base-local-diff.json) | 1754 | `932b57033edbe76a4382ad1cd6a11d7e39f33939a5b648faeec18c748d98a2b3` |

以下 index 均为文件 `cells` 数组的 **0-based occurrence**，不是稳定 cell ID。两份 nbformat 4.0 snapshot 都无 cell IDs；counts 同为 `1,2,3,4,5,null`。重复文本不能以源码 hash 合成一个 cell。

| occurrence | Base → Local 保存源 | Base → Local 保存输出 | 本次差异结论 |
| --- | --- | --- | --- |
| 0 | 同一两元素 source 数组 | 空数组 → 空数组 | 未变；第一元素末尾是 LF；保留数组，以 JSON 的 `\n` 表示 |
| 1 | `x = 3` → `x = 5` | 空数组 → 空数组 | 源字符 patch |
| 2 | `f(x)` → `f(x)` | text/plain 数组 `['9']` → `['25']` | 源不变，保存输出 patch |
| 3 | `x = 3` → `x = 3` | 空数组 → 空数组 | 与 occurrence 1 相同旧文本，但未改 |
| 4 | `f(x)` → `f(x)` | text/plain 数组 `['9']` → `['9']` | 与 occurrence 2 同源文本，但保存输出未改 |
| 5 | 空源 → 空源 | 空数组 → 空数组 | 未变，count 为 null |

oracle 是上游**已提交 diff**，不是本轮运行 nbdime 得到：外层 patch key 为 cells，其下仅 occurrence 1 与 2。源叶路径 `/cells/1/source/0` 在字符 index 4 remove 1 / add `5`；输出叶路径 `/cells/2/outputs/0/data/text~1plain` 在字符 index 0 remove 1 / add `25`。后者是 MIME 路径的 JSON Pointer 转义，不是源代码行。完整 diff/完整 snapshots 同时保留，不能只截两行改变就隐去后面重复项。上游 [CLI tests L66–82](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/test_cli_apps.py#L66-L82) 引用这些 fixture；这是源码中的预期关系，本轮未跑测试。

对齐为何不等于 identity：owning [snakes.py L33–71](https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/diffing/snakes.py#L33-L71) 从高优先 predicate 对齐，再在空隙递归较弱 predicate。cell approximate 比较明确忽略 metadata/count/output；ID 比较只有双方存在 ID 才有意义。此 fixture 没有移动，不能作为 move detection 演示。即便 counts 保持或输出一起改，也不证明哪个 kernel 执行、是否重跑、为何变化、fresh/stale、实际依赖或计算正确。cell 0 的 JSON `\n` 解码为实际 LF（末字符 ord=10），不能把 JSON 转义当两个字面字符；这项字段事实也不证明成功执行。

## 深读 B：skip-tag 的证据来自分支，不来自空输出

完整 [Skip Execution with Cell Tag.ipynb](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/tests/files/Skip%20Execution%20with%20Cell%20Tag.ipynb) 为 513B，SHA256 `4d84e529db1d6df3f303fe1841f146ef4da3e2eecefb28289abcf6f32886ad55`。它保存两个 code cells：0 的源为打印 long running cell、tag 为 skip-execution、count=null、outputs=[]；1 打印 ok，保存 count=1 与 stdout `ok` 换行。不是自然用户长任务采集，本轮没有 kernel 执行。

[client.py L961–1000](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/nbclient/client.py#L961-L1000) 先触发 on_cell_start hook，再在非 code/空源、skip-tag 时返回；真正 `kc.execute` 与随后清空 outputs 在返回分支之后。因此“on_cell_start 曾调用”不等于 execute 已送出；skip 分支也不清掉历史输出，不能把一般 notebook 的输出存在误当本次执行。默认 skip tag 是配置项，不能脱离配置泛化任意 tag 名。[tests/test_client.py L340–373](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/tests/test_client.py#L340-L373) 把完整 fixture 列入执行后与保存预期比较；本轮只读其断言，不报告通过。

error 也有独立合同：[client.py L138–178](https://github.com/jupyter/nbclient/blob/0811ff44c63c9853c4d6ba7265d7042ca7f8742a/nbclient/client.py#L138-L178) 的 allow_errors/allow_error_names/force_raise_errors 与 raises-exception tag 不能统一压成绿/红“整本成功”。缺少运行配置与回复事件时，Archify 不应推断 pass/fail。这个例子可写短说明，新增 Lifecycle/Scheduler 没有额外价值，本轮不另做第二实验。

Papermill 还核了完整 [simple_input.ipynb](https://github.com/nteract/papermill/blob/e4e4ddd362037309c53ab5230541759707779687/binder/cli-simple/simple_input.ipynb) 923B / SHA256 `e35719434f4a8fc49e07de1055dbd53d123557dd4e6fc5c4bebc8ebf2e1014a4`，与 [simple_output.ipynb](https://github.com/nteract/papermill/blob/e4e4ddd362037309c53ab5230541759707779687/binder/cli-simple/simple_output.ipynb) 3338B / `f0e2d763de737166d97640a975c66158fa24059dd8eb868f7a118ded5bc0152d`：原 msg=None 参数 cell 仍在，另插 msg="Hello"，保存输出 Hello。这里只说明已提交材料与注入源码一致，不声称这两文件的生成命令/环境或运行真实性已验证。

## 对照当前 Archify，而非另建 notebook 平台

基准固定 **dev `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`**，已直接 `git show` owning schemas/authoring reference 与 viewer/focus.js。现有 [Explainer authoring](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/references/explainer-authoring.md#L229-L237) 有表、@comparison、@diff、literal、@diagram；[Tree](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/tree.schema.json) 可组织 snapshot→occurrence，但不承担跨快照匹配。亦不需要借 Dataflow 边假装 observed read。

同轮 GitHub 读取确认 #1102 已合入 dev（head `98efbfcb625b1ecfa813e131c52370b9c2dc83e6`），node explanation/drilldown 等是现有能力；[#1103](https://github.com/tt-a1i/archify/pull/1103) 仍 draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，target labs/code-analysis，Atlas 是 module/file/function 代码事实与 Classic 来源交接，不提供 notebook snapshot 对齐/执行。open issue/PR 窄查询 nbdime、notebook、papermill、"cell diff" 各 0 命中；这是查询时结果，不证明没有任何重复需求。

与已有实验区别：copy-identity 用实际标准库观察说明对象共享；本候选没有对象 identity 或运行观察。payload-delta 核 JSON Patch 前置条件/原子应用；本候选不重做 patch engine，重点是**六个 notebook occurrence 中，源与保存输出两层变化的定位**。已有 notebook-evidence 则是 alias/物化值的 stale 预期；本候选不推 stale。若最后只是两个字符替换且读者不需要重复项上下文，一张表已经足够，不应强加图。

## 一个可实施的固定内容实验

读者任务：**“这次保存修改涉及哪个 cell 的源、哪个 cell 的输出？后面两个看起来一样的 cell 有没有变？”** 正确回答 occurrence 1 / 2 / 3–4 未变；不是“影响了哪些 runtime downstream”。

输入完整保留上表 base/local/diff、完整 BSD 许可与 owning 对齐源码（或固定可核来源），每文件 SHA/bytes 绑定。原创 stdlib 脚本只读固定三 JSON：核摘要、数组 occurrence 和源/输出逐项差异，再核上游 nested diff 只指向这两个叶；不执行 cells、不 import nbdime、不做通用 diff/parser/patcher。source 数组及其中实际 LF 的 JSON 转义、text/plain 的数组形状与 metadata/count 原样保留；字符串 literal 编码显示，不能静默规范化。

产物限一份原生 Tree JSON（只画 snapshot→occurrence 归属）供 standalone 与 Explainer 共用，六行 before/after 表主导；每个 occurrence 明示 snapshot+index、源/保存输出，变化两层分开，重复未变项完整可见。节点来源指回 notebook 的文本行/JSON Pointer；不能把 execution_count 当 ID，不能从顺序补 f(x) 的数据依赖箭头。Explainer 以六行表和两处局部 patch 支撑图；若图不比表更易回答，保留内容而停止追加交互。

验收只针对这份材料：完整 bytes/SHA；源变化叶与保存输出叶准确；其余四 occurrence 全字段未变；两快照无 cell IDs；counts 未改；所有 literal 保真；原生模型单一；真实 render/finalize receipts 与 root 固定截图分别记账。截图检查重复项不合并、源/输出标签和对应边可读；不宣称读屏、真人学习收益或实际执行。原始 receipts 外置，公开派生摘要不带个人路径。没有通用导入入口、依赖解析器或 notebook 执行，维护成本主要是小型固定内容/来源审计，可随时停止，无平台耦合。

报告收尾更正：曾误读 tool JSON 外层转义，现已用字符 ord 核 cell 0 末值为 LF；原 fixture 始终未修改。

本报告到此冻结：一个内容候选、零新增产品建议；未建实验、分支或产物，未 commit/push。nbdime 由只读后台 agent 深读后，本作者复核完整三 JSON、LF/JSON 转义细节、owning 对齐源码与 hash；nbclient/Papermill/Jupytext/Ploomber/SoS 的以上 owning 位置由本作者读取。保存 fixture 与测试预期均未称本轮实跑。
