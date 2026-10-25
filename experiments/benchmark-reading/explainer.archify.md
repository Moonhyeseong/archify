# 柱高变了，为什么比较结果仍是 ~？

JSON 的上游比较是 **-17.20%**，gob 则是 **~**。四根柱只显示中位数；比较结论还要读旁表的 CI、p 和 n。

- 每组 n=10 是十条结果记录，不是行内数十万 iterations。
- gob 的新中位数略高，但上游比较仍是 ~，并未证明两组等价。
- JSON 比较 Go1.16/1.17；gob 两边都是1.17，不能合称一次升级效果。

@answer scope="固定上游示例与 expected · 本轮只做描述性核对 · 未运行 benchmark"
@meta locale=zh-CN
@source input title="完整 old.txt / ns per op" url=https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/old.txt
@source provenance title="完整 new.txt 与历史口径说明" url=https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/new.txt
@source oracle title="上游已提交 CSV expected" url=https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/csvOldNew.stdout
@source compare title="p/n 格式化与 delta 分支" url=https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/sample.go#L164-L195

## 中位数描述了什么，比较又说了什么？

@chart type=bar data=medians.csv x=Format y=Old,New unit=µs/op title="保存观察的中位数 · 不是性能判决"

Old 与 New 是两份文件，单位统一为 µs/op。图不画 CI，不靠颜色判定变快或变慢；完整比较信息保留如下。[](source:oracle)

| 格式与历史口径 | Old median µs/op | New median µs/op | 原 CSV CI old/new | 原 vs base | 原比较字段 |
| --- | --- | --- | --- | --- | --- |
| JSON：Go1.16 → Go1.17 | 1.7180 | 1.4225 | 1% / 1% | -17.20% | p=0.000 n=10 |
| gob：Go1.17 → Go1.17 | 3.0655 | 3.0700 | 0% / 2% | ~ | p=0.446 n=10 |

new.txt 明说数据用于包含显著与不显著的例子；这是上游历史材料，不是本轮测量。历史环境/版本说明按原文件引用，未独立复现。[](source:provenance)

## 为什么这些小符号不能省略？

| 显示项 | 应怎样读 | 不支持的解释 |
| --- | --- | --- |
| n=10 | 每组十条结果记录 | 数十万 iterations 就是数十万个独立样本 |
| p=0.000 | 上游将非零 p 舍入到三位小数 | 数学上 p=0，或本轮重算检验 |
| CI 0% | median 区间相对幅度的舍入显示 | 零不确定性，或每个观察都相等 |
| gob ~ | 默认 alpha=.05 下，此比较未给数值 delta | 已证明相等/等价，或无变化概率44.6% |

上游默认以 median 汇总、双侧 Mann–Whitney 比较，CI level=.95。P 大于 alpha 时显示 ~；本轮只保留其 expected，不重新计算 p、CI 或显著性。[](source:compare)

原 CSV 还有 geomean：Old `2.294891936453654e-06` sec/op，New `2.089754770302007e-06` sec/op，vs base `-8.94%`。它不按每行 p 门控，是中心汇总，不是第三个统计确立的效果。不能把两种不同版本口径合称总体升级快8.94%。完整 CSV 原字节保留。[](source:oracle)

## 四组观察怎样对账？

下表完整保留40个保存值，单位为原始 ns/op。行号是每组文件中的出现次序，四列并排不是 paired 设计或独立性证明。ns/op 已是每操作指标，不是批次总耗时。[](source:input) [](source:provenance)

| 组内次序 | JSON Old ns/op | JSON New ns/op | gob Old ns/op | gob New ns/op |
| --- | --- | --- | --- | --- |
| 1 | 1726 | 1423 | 3069 | 3075 |
| 2 | 1723 | 1416 | 3075 | 3065 |
| 3 | 1707 | 1411 | 3069 | 3059 |
| 4 | 1707 | 1413 | 3067 | 3065 |
| 5 | 1713 | 1412 | 3207 | 3060 |
| 6 | 1729 | 1426 | 3064 | 3081 |
| 7 | 1736 | 1422 | 3064 | 3186 |
| 8 | 1707 | 1424 | 3058 | 3135 |
| 9 | 1705 | 1447 | 3059 | 3087 |
| 10 | 1774 | 1425 | 3062 | 3062 |

每格对应原文件一条结果行；完整 benchmark 名、iterations 与原始行号在本轮观察 JSON 和原文件中保留。标准库脚本只核固定 hash、十条计数、中位数以及 ns/op、sec/op、µs/op 的单位换算。

上游 CSV expected 与本轮描述性算术分开记账。没有运行 benchstat、Go benchmark、统计检验或新的性能测量；没有速度因果、独立样本、真人阅读或学习收益结论。
