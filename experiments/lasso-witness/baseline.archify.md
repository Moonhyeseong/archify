# 为什么三步文本不是到 1.3 结束？ {#baseline}

原文在 `1.3` 前写明 `Loop starts here`：三步文本表示前缀加重复后缀。

@answer scope="上游固定反例选段 · 未运行 checker · 原始 patch"
@meta locale=zh-CN
@source witness title="上游原文 L23–37 @521fb9a" url=https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/example-input.txt#L23-L37
@source folding title="上游 padMissing：沿用上一次值" url=https://github.com/igor-buzhinsky/nusmv_counterexample_visualizer/blob/521fb9a1261c921519abb60a2b98c5c2cd5b321f/src/nusmv_counterexample_visualizer/Counterexample.java#L192-L198

## 同一份原文 {#original}

```text
-- specification  G (s ->  F r)  is false
-- as demonstrated by the following execution sequence
Trace Description: LTL Counterexample 
Trace Type: Counterexample 
  -> State: 1.1 <-
    s = TRUE
    r = TRUE
    u = FALSE
    v = FALSE
  -> State: 1.2 <-
    s = TRUE
    r = FALSE
  -- Loop starts here
  -> State: 1.3 <-
    u = TRUE
```

原文将属性标为 `is false`。这里引用该 fixture，不重新判定属性。[](source:witness)

## 只记录本步原始 patch {#patches}

| 原文位置 | s | r | u | v | 归属 |
| --- | --- | --- | --- | --- | --- |
| `1.1` | `TRUE` | `TRUE` | `FALSE` | `FALSE` | prefix |
| `1.2` | `TRUE` | `FALSE` | 本步未报告 | 本步未报告 | prefix |
| `1.3` | 本步未报告 | 本步未报告 | `TRUE` | 本步未报告 | loop 入口 |

“本步未报告”不表示 null、缺失状态或一次新观测。表中没有填充后的快照。

## 这页能解释到哪里？ {#limits}

作者依上游 carry-forward 语义解释：`1.3` 沿用 `r=FALSE`。loop 约定让此后缀无限重复。[](source:folding)

本页不求值 LTL，也不运行模型。模型 revision、checker 版本、命令与 fairness 配置均未知。

loop 闭合不是单独报告的 transition。没有为它补 action、时间或实测事件。

这是一条固定反例的阅读页，不是完整状态空间或实现正确性证明。
