# 改的是哪个 cell，哪些保存输出一起变了？

源变化发生在 **cells[1]**，保存输出变化发生在 **cells[2]**。后面文本相同的 cells[3]、cells[4] 都未变。

- 不按相同源文本合并 occurrence，完整六个位置都保留。
- source 与保存输出分开比较；空 cell 也不消失。
- 上游已提交 diff 与本轮固定 JSON 观察分列，不推运行因果。

@answer scope="固定上游回归快照 · 0-based 位置 · 未运行 notebook/nbdime"
@meta locale=zh-CN
@source base title="完整 Base snapshot" url=https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-base.ipynb
@source local title="完整 Local snapshot" url=https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-local.ipynb
@source oracle title="上游已提交 expected diff" url=https://github.com/jupyter/nbdime/blob/744c97897e2c33a1b3f04f5834ee6e70478219a2/nbdime/tests/files/multilevel-test-base-local-diff.json

## 六个位置，各自哪一层改变？

| cells index | Base source 数组 | Local source 数组 | Base 保存 text/plain | Local 保存 text/plain | 改变 |
| --- | --- | --- | --- | --- | --- |
| 0 | `["def f(x):\n", "    return x**2"]` | `["def f(x):\n", "    return x**2"]` | `[]` | `[]` | 未变 |
| 1 | `["x = 3"]` | `["x = 5"]` | `[]` | `[]` | 源变化 |
| 2 | `["f(x)"]` | `["f(x)"]` | `["9"]` | `["25"]` | 保存输出变化 |
| 3 | `["x = 3"]` | `["x = 3"]` | `[]` | `[]` | 未变 |
| 4 | `["f(x)"]` | `["f(x)"]` | `["9"]` | `["9"]` | 未变 |
| 5 | `[]` | `[]` | `[]` | `[]` | 未变 |

空数组在输出列表示 outputs=[]，没有 text/plain。其余两行显示完整保存的 text/plain 数组，不是本轮计算结果。source 数组中的 JSON `\n` 表示实际 LF；原文件、数组形状与字段值完整保留。两份快照作为固定对照，不宣称相同 index 是通用匹配规则。[](source:base) [](source:local)

## 相同文本为什么还要保留两个 occurrence？

@diagram tree id=occurrences source=notebook-occurrences.tree.json

cells[1] 与 cells[3] 在 Base 都是 `x = 3`，但只有 cells[1] 改源。cells[2] 与 cells[4] 都是 `f(x)`，但只有 cells[2] 改保存输出。边仅表示归属；没有画 cells[1] 到 cells[2] 的执行依赖。

## 上游 oracle 与本轮观察，分别证明什么？

| 材料 | 已核事实 | 未证明 |
| --- | --- | --- |
| 上游完整 expected diff | 只 patch cells[1] 的 source 与 cells[2] 的保存输出 | 本轮运行了 nbdime |
| 本轮原创标准库观察 | 读取固定三 JSON，按六位置比较；其余四 cells 全字段未变 | 通用对齐、自动识别 cell 身份或 patch 应用 |
| 两份保存 metadata/count | 无 cell IDs；counts 均为 `[1,2,3,4,5,null]` | 本轮顺序、重跑、fresh/stale 或计算正确 |

oracle 源叶 `/cells/1/source/0`：字符位置 4 删除 `3`，加入 `5`。保存输出 MIME 路径 `/cells/2/outputs/0/data/text~1plain`：字符位置 0 删除 `9`，加入 `25`。`~1` 是 JSON Pointer 对 `/` 的转义，不是源码行号。完整 diff 是上游既有期望。[](source:oracle)

原始三文件和 BSD-3-Clause 许可完整保留。本轮只运行原创标准库固定输入检查，没有运行 notebook、kernel 或 nbdime；没有实际依赖、对象别名、运行因果或学习收益结论。
