# Benchmark reading round 12：柱高变了，为什么比较结果仍是 `~`？

2026-10-25，只读调查。先排重 hub README 与当时全部 58 份 scouts、456 个 GitHub owner/repo；已有 profile/query-plan、时间线、rebuild 和图形质量 benchmark 不重复。下面六个来源此前未作为研究项目列入，不以 stars 排序。遵循 research / archify-review，深读 benchstat 与 pyperf 完整已提交输入/expected 和 owning source。没有安装、运行 benchmark、benchstat、pyperf 或统计检验，没有浏览器或产物；只新增本报告。

**保留一个低成本内容实验：用 benchstat 官方完整 old/new/CSV golden，回答“两个中位数柱高都变了，为什么只有 JSON 报数值 delta，而 gob 是 `~`？”** 现有 Explainer bar + 邻接表足够；图描述中心值，表保留单位、CI、p、n 和上游结论。零新 benchmark 平台、统计 API、误差线组件或性能改善证明。pyperf 的 run/value/loop 归一化作为第二种阅读边界，不为数量再派第二实验。

## 六个固定一手来源

| 固定项目、许可 | 实际读取机制 / owning source | 借鉴与成本判断 |
| --- | --- | --- |
| [golang/perf@be2c69fb417e05de5fec05c732911f4c5f172606](https://github.com/golang/perf/tree/be2c69fb417e05de5fec05c732911f4c5f172606) · [BSD-3-Clause LICENSE](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/LICENSE) | [benchmath/anone.go](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/anone.go#L15-L44) 默认 median + Mann–Whitney U；[sample.go L164–195](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/sample.go#L164-L195) 分别格式化 p/n 与 delta，P 大于 alpha 时给 `~`。 | 深读下述完整 fixture。中心、区间、统计比较分层，避免把 bar 自动染成“更快/更慢”。不移植统计实现。 |
| [BurntSushi/critcmp@51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7](https://github.com/BurntSushi/critcmp/tree/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7) · [MIT](https://github.com/BurntSushi/critcmp/blob/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7/LICENSE-MIT) OR [Unlicense](https://github.com/BurntSushi/critcmp/blob/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7/UNLICENSE) | [data.rs L24–73](https://github.com/BurntSushi/critcmp/blob/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7/src/data.rs#L24-L73) 读 criterion_benchmark_v1 / estimates_v1，含 point estimate/CI/standard error；[L148–154](https://github.com/BurntSushi/critcmp/blob/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7/src/data.rs#L148-L154) 显示耗时取 mean estimate，不是 slope/median。 | [README](https://github.com/BurntSushi/critcmp/blob/51f1b5f88bfd4f7286213ba0a73ba46a1d177bf7/README.md) 明示读取 Criterion 未文档化内部格式。export 不是 raw repetitions，CI 不是样本数组；不写一个版本脆弱的 importer。 |
| [sharkdp/hyperfine@c5161524980522320c7d3425e714cc0965a869a5](https://github.com/sharkdp/hyperfine/tree/c5161524980522320c7d3425e714cc0965a869a5) · [MIT](https://github.com/sharkdp/hyperfine/blob/c5161524980522320c7d3425e714cc0965a869a5/LICENSE-MIT) OR [Apache-2.0](https://github.com/sharkdp/hyperfine/blob/c5161524980522320c7d3425e714cc0965a869a5/LICENSE-APACHE) | [export/json.rs L15–60](https://github.com/sharkdp/hyperfine/blob/c5161524980522320c7d3425e714cc0965a869a5/src/export/json.rs#L15-L60) 固定版本 schema=2，measurement 与 summary 分开，unit/count/optional stddev 保留；[完整 single-run snapshot](https://github.com/sharkdp/hyperfine/blob/c5161524980522320c7d3425e714cc0965a869a5/tests/snapshots/integration_tests__json_export_single_run.snap) 明列 debug-mode、runs=1、summary stddev=null。 | 不能沿用记忆里的旧 JSON schema，也不能把单次 null stddev 补成零方差。此快照是上游 debug 测试期望，不是本轮 sleep 性能采集；已有表足够，不做命令执行器。 |
| [psf/pyperf@00556e18777c36cfd96c91fdf1cd6bf70dd8c276](https://github.com/psf/pyperf/tree/00556e18777c36cfd96c91fdf1cd6bf70dd8c276) · [MIT COPYING](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/COPYING) | [_worker.py L70–90](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_worker.py#L70-L90) 把 raw value 除 loops×inner_loops；[_bench.py L213–242](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_bench.py#L213-L242) 反推 raw values 与读取 duration 有不同路径；[_compare.py L31–49](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_compare.py#L31-L49) normalized mean 又是 changed/ref 的比率。 | 两种 normalized 不可混：每 loop 单位归一化 ≠ 相对基线比率。深读完整 JSON 见下，不导入其命令或生成 speedup。 |
| [airspeed-velocity/asv@f6e462e3b34e34b493c75482be353af1502ca1b5](https://github.com/airspeed-velocity/asv/tree/f6e462e3b34e34b493c75482be353af1502ca1b5) · [BSD-3-Clause LICENSE.rst](https://github.com/airspeed-velocity/asv/blob/f6e462e3b34e34b493c75482be353af1502ca1b5/LICENSE.rst) | [compare.py L70–100](https://github.com/airspeed-velocity/asv/blob/f6e462e3b34e34b493c75482be353af1502ca1b5/asv/commands/compare.py#L70-L100) 区分 None failed / NaN skipped；有足够 stats 时检查 is_different，再用 factor，repeat=1 特例只看 factor；[L278–293](https://github.com/airspeed-velocity/asv/blob/f6e462e3b34e34b493c75482be353af1502ca1b5/asv/commands/compare.py#L278-L293) 保留 machine/env key。 | “超 factor”与有统计证据不总同义，失败/跳过不画为0；跨 machine/env 不能凭 benchmark 名合并。无需重建跨版本结果数据库。 |
| [ionelmc/pytest-benchmark@07d519672687402e6c3fac1a543fbefd810d1e5b](https://github.com/ionelmc/pytest-benchmark/tree/07d519672687402e6c3fac1a543fbefd810d1e5b) · [BSD-2-Clause LICENSE](https://github.com/ionelmc/pytest-benchmark/blob/07d519672687402e6c3fac1a543fbefd810d1e5b/LICENSE) | [stats.py L49–98](https://github.com/ionelmc/pytest-benchmark/blob/07d519672687402e6c3fac1a543fbefd810d1e5b/src/pytest_benchmark/stats.py#L49-L98) data 每 round 一值、rounds=len(data)；[L249–264](https://github.com/ionelmc/pytest-benchmark/blob/07d519672687402e6c3fac1a543fbefd810d1e5b/src/pytest_benchmark/stats.py#L249-L264) 可导出 data/iterations，update 把 duration 除 iterations。 | 不把 iterations 当样本量、不再次归一化 data。不运行用户 pytest，也不把本仓 test-results 适配器扩成 benchmark 平台。 |

## 深读 A：同一张图有两种比较结论

固定 benchstat 完整输入与上游完整 expected，原始文本以 `ns/op`，CSV 中规范单位是 `sec/op`。本轮只做标准库静态读取和描述性 median 核对，不执行 benchstat 或重新计算 p/CI。

| 完整路径，相对 golang/perf | bytes | SHA256 |
| --- | --- | --- |
| [cmd/benchstat/testdata/old.txt](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/old.txt) | 1397 | `db60f533bc3496b52bbe654c7b4acac8c0b5da141bc5f0cbf1d44978954eee00` |
| [cmd/benchstat/testdata/new.txt](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/new.txt) | 1598 | `0200be7b5bc8cb0e5edf22051d41895385fc248145db25fb7e646dfed8089ea0` |
| [cmd/benchstat/testdata/csvOldNew.stdout](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/csvOldNew.stdout) | 357 | `935a065791e15d41e4ceb1b10e5766af9891dc3cd20e11eebcbb5d61fee85fc6` |
| [LICENSE](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/LICENSE) | 1453 | `911f8f5782931320f5b8d1160a76365b83aea6447ee6c04fa6d5591467db9dad` |

new.txt 开头明确：JSON old 为 Go1.16 / new 为1.17；gob 两边均为1.17，用来包含显著与不显著的例子。这不是共同前后版本或一次通用升级效果，也不是本轮实跑。“PASS”是保存文本，不是本轮测试通过。每格式、每文件各10条结果记录；行内数十万 benchmark iterations 是每条测量的工作重复数，不是 n。[_builder.Add L75–105](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/internal/benchtab/builder.go#L75-L105) 每条 Result 为相应 cell append 一个 Value。[main_test.go L16–18/L61–95](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/main_test.go#L16-L18) 把 old/new 与此 CSV golden 绑定；未运行该测试。

| 格式 | old median，µs/op | new median，µs/op | CSV CI old/new | 上游 vs base | 上游比较字段 |
| --- | --- | --- | --- | --- | --- |
| JSON | 1.7180 | 1.4225 | 1% / 1% | -17.20% | p=0.000 n=10 |
| gob | 3.0655 | 3.0700 | 0% / 2% | ~ | p=0.446 n=10 |

两根 gob 柱高确实略有差异，但点估计差异不自动成为数值结论。default alpha=.05，default CI=.95；[anone.go L111–133](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/anone.go#L111-L133) 做双侧 Mann–Whitney 比较并保留 p/n/warnings；[sample.go L184–195](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/sample.go#L184-L195) 在 P>Alpha 时显示 `~`。不能把 `~` 翻成已证明相等/等价；p=.446 也不是“无变化概率44.6%”。实现 P==Alpha 走数值分支，若说明阈值应按实际源码，不把文档“below alpha”泛化为严格小于。

格式化信息也必须保留：[sample.go L164–176](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/sample.go#L164-L176) 的 p 三位小数说明 `0.000` 不是数学上0；[L114–137](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/benchmath/sample.go#L114-L137) 把区间相对偏差舍入成百分比，CI 0% 不证明零不确定性。CI 是 median 区间的显示摘要，不是所有单次观察范围。CSV geomean -8.94% 来自中心与中心比率汇总，[builder.go L285–345](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/internal/benchtab/builder.go#L285-L345) 不按每行 p 门控；不能再把它当第三个统计确立的效果或把两种不同版本口径笼统合成“升级总体快8.94%”。

一个完整小反例辅助限定：已提交 [smallSample.txt](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/smallSample.txt) 74B / SHA256 `8b1497db9066fdcd439ec70d6d6c9109c76ddad92eff653f0397149e9baaead8`，与 [smallSample.stdout](https://github.com/golang/perf/blob/be2c69fb417e05de5fec05c732911f4c5f172606/cmd/benchstat/testdata/smallSample.stdout) 301B / `057d463c6f3cb351b3483913c74418f616446ce95af3bfd7ece1cae193bc3f24`：单个100/101ns观察显示±∞、`~ p=1.000 n=1`，保留需要≥6样本形成.95有限CI、≥4检测.05差异的 warning。不能用漂亮柱状图消掉不足以判断的信息。本轮只作为边界，不追加第二个展示项目。

## 深读 B：21 个 run records，为何有60个值？

固定 pyperf 完整 [mult_list_py36.json](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/tests/mult_list_py36.json) 35289B / SHA256 `1b3360682e33e51cf9b4ea39a5ac5e36f88166eda6b7105b2bee31eb18d62712`，与完整 [mult_list_py37.json](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/tests/mult_list_py37.json) 34915B / `56ea23fb92e5e40d93d705e5d1af7a75409658bc39fcc25ee51e2ac7c6baf903`。它们 metadata 记录历史 pyperf2.0.1、Python3.6.12/3.7.9、相同公开机型、unit=second、inner_loops=1024、format version=1.0；源码固定 SHA 是本轮读取版本，不冒充这些数据的当时 producer SHA 或完整采集命令。

首 benchmark `[1]*1000`，每文件21个 run records：第0个只有 calibration warmups、没有 values，另20个各3 values，共60；包括 calibration 在内共有30个 warmup 项，均不能并进60个测量值。benchmark metadata loops=64。py36 第一个保存 value 是 `2.087224121094522e-06` second，约2.087µs/内层操作。[_worker.py L70–90](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_worker.py#L70-L90) 已做 raw/(64×1024)，不可再除1024或65536。[_bench.py L219–242](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_bench.py#L219-L242) 可反乘构造 batch 等效耗时，但 `metadata.duration` 优先读另一项 duration，不能把它当同一个值或声称反乘是原始计时器实录。旧格式 warmups 另有版本转换分支 [L257–278](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_bench.py#L257-L278)，不能跨版本默默混 raw/normalized。

这里60是保存值数量，不承诺60个独立进程或独立同分布样本；同一 run 的三个值不能因画成60根柱就变成独立重复。`_compare.compute_normalized_mean` 的 normalized 又指 changed mean/reference mean，比每 loop 归一化多一层比较。源码对单值对和统计异常有特例 [L5–20](https://github.com/psf/pyperf/blob/00556e18777c36cfd96c91fdf1cd6bf70dd8c276/pyperf/_compare.py#L5-L20)，更不适合把一个工具布尔值搬成通用统计保证。本轮不运行 compare、不声称Python版本差异的普遍 speedup，也不从这些记录推物理独立性。

## Archify 当前能力与已有工作

固定 dev **10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0**。[Explainer authoring L194–221](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/references/explainer-authoring.md#L194-L221) 已支持同目录 CSV/JSON 驱动 bar/line/pie、数值标注、表、literal/source；它显示数值，不替读者计算检验。此问题不需要新图类型、自动 CI、stats 运行器或 flamegraph。原始 observations 表和 upstream-summary 表分列即足够。

同轮 GitHub 实读确认 [#1102](https://github.com/tt-a1i/archify/pull/1102) 已 merged、head98efbfcb625b1ecfa813e131c52370b9c2dc83e6；[#1103](https://github.com/tt-a1i/archify/pull/1103) 仍 draft/open、headf0be206acbc90eb7c6c6b636030e3eb28963d284，Atlas 代码事实/Classic交接不提供 benchmark 统计。open 窄查询 benchstat0、hyperfine0、performance comparison1（#382）；benchmark45，其中 [#1058](https://github.com/tt-a1i/archify/issues/1058) 已读原文，关注绘图正确/美观/用量与可选人评的统一基线。候选不扩写 #1058 的评分系统、不优化 Archify，也不把耗时下降当绘图质量收益。无命中不是完全无重复的证明。

区别已有 query-plan 行数例：其字段是平均/累计输出，不涉及重复样本统计；profile 的累计/占比也不是 median CI/p/n。这里图文解释的是四组固定保存观察与一个上游比较 oracle，不能把持续采样/火焰图换色充数。

## 最小内容实验，止于一个阅读任务

**任务：指认哪一行可引用上游数值 delta，哪一行仍是 `~`，并给出每组 n、单位与 CI。** 固定保留 old.txt/new.txt/csvOldNew.stdout 和完整 BSD。一个现有 Explainer、一个已有 bar（四个 median 柱，统一 µs/op）及邻表即可；不需要加 native 节点图。表完整列出两个 row 的 CI、p、n、上游 delta，并标清 JSON1.16→1.17 / gob1.17→1.17。CSV geomean 另列“不做新统计结论”，原完整文件不裁切。把 median 柱命名为“保存观察的描述性中心”，不要颜色编码成性能判决。

若获准实施，原创 stdlib 小脚本只读固定 hash 输入：数各10条、核原始 ns/op、中位数与CSV中心经单位转换一致；绑定原CSV oracle，保留全部40个观察。它不运行 benchstat、不重算 p/CI/Mann–Whitney、不做通用 benchmark parser。所有派生字段标明 raw-result-line / normalized-unit / upstream-expected / 本轮描述性 arithmetic；不把大 iterations 当 n，不给丢失单位填默认。原始文件/许可证字节保留，receipts 外置，公开摘要派生且无个人路径。

验收核完整 bytes/SHA、四个 median 与单位、10/10记录、既有 oracle 的 `~`/p/n/CI0%原样、CSV geomean边界和历史版本口径。真实 public render/finalize 与 root截图单独绑定；截图看柱/表在同一阅读范围且小CI/`~`不丢，不据此称统计重新通过、真实用户收益或本轮 speedup。若并排原CSV加两句已足以回答，不追加交互或平台。

本轮仅报告：一个内容候选，零新增产品建议，未建分支/产物或 commit/push。benchstat 由只读后台 agent 深读，作者复核完整 old/new/CSV、小样本 expected 与关键 owning 格式化/样本计数源码；其他五项目上述 owning source、完整 pyperf两JSON及 hyperfine完整snapshot由作者读取。没有上游执行，静态算 median/count 不称性能测量或统计验证。
