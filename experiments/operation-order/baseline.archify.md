# 长写覆盖两次读取，为什么仍不能合法排序？ {#operation-order-baseline}

**没有合法顺序。** 两次读取的实时先后与寄存器模型要求组成矛盾。

- 上游 Porcupine README 的说明例；不是自然采集，也不是本轮运行。
- README 声明 checker 返回 `false`；本页没有执行 Porcupine。[](source:readme)
- 以下位置是事件顺序编号，不是时间、时长或测量。

@answer scope="上游说明例 · 顺序位置非时间 · checker结果为README声明"
@meta locale=zh-CN
@source readme title="Porcupine固定README：模型与三操作" url=https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#L56-L162

## 六条原始事件 {#events span=12}

寄存器初态为 `0`。`put(v)` 写入 v；`get` 必须返回当前值且不改变状态。输入中的 `true, 0` 是 get 的输入，输出另见 return。[](source:readme)

| 位置 | 客户端 / ID | 类型 | 原值 |
| --- | --- | --- | --- |
| 1 | C0 / 0 | Call | `registerInput{false, 200}` |
| 2 | C1 / 1 | Call | `registerInput{true, 0}` |
| 3 | C1 / 1 | Return | `200` |
| 4 | C2 / 2 | Call | `registerInput{true, 0}` |
| 5 | C2 / 2 | Return | `0` |
| 6 | C0 / 0 | Return | `0` |

W 是 C0 的 put；R200 是 C1 的 get；R0 是 C2 的 get。W 覆盖两个读取的调用与返回，但没有记录内部写入瞬间。

## 三句话解释矛盾 {#baseline span=12}

1. 实时：R200 返回后 R0 才调用，因此 R200 必须排在 R0 之前。
2. 模型：初态为 0 且只有 W 写入 200，R200 返回 200 要求 W 排在 R200 之前。
3. 模型：R0 返回 0 要求 R0 排在 W 之前；三条要求互相矛盾。

## 本实验独立枚举 {#enumeration span=12}

只列出满足 R200 在 R0 之前的全部三个排序，逐项模拟上面的寄存器模型。以下是本实验复核，不是运行 Porcupine，也不是通用 checker。

| 候选顺序 | 首个不符 |
| --- | --- |
| W → R200 → R0 | R0 读到 0，但状态为 200 |
| R200 → W → R0 | R200 读到 200，但状态为 0 |
| R200 → R0 → W | R200 读到 200，但状态为 0 |

其他三个排列违反已记录的实时先后。此结论依赖示例的完整三操作、初态和模型，不说明系统内部执行或故障原因。
