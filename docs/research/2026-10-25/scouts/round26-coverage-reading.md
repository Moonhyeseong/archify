# Round26：覆盖数字背后的计量对象

日期：2026-10-25。结论：深读三个此前未深读来源，保留 **1 个有限内容候选**，不建议增加覆盖率 importer、collector、runner、语言 parser 或共享 Viewer 功能。问题收窄为：**Kcov 导出的 `branch-rate="1.0"` 能否证明所有分支都已执行？** 固定 writer 的答案是否定的：该值是源码字面常量，逐行输出实际来自行命中计数。这里查的是生产者合同，不是声称发现了某个用户的错误报告。

## 排重与现有能力

本轮先全文检索研究中心 README 与全部 scouts 的覆盖率／branch／condition／MC/DC 及候选 owner/repo，再复读 [test-code-evidence](test-code-evidence-smalltools.md)、[git-architecture](git-architecture.md)、[mutation-evidence](mutation-evidence-smalltools.md)。coverage.py、nyc、gcovr 已深读，不重新计数；grcov、tarpaulin 已被旧报告筛过，也没有拿来凑来源。三个下表仓库在此次检索中均无既有深读条目；不按 stars 设门槛。

既有 Test context map 解决行→精确测试／阶段归属；Test failure map 区分 setup/call/teardown/collection；Mutation 解释受控替换能否被测试区分；模块覆盖页解释分母与 unknown。本轮不再做这些矩阵、结果聚合或 trace。本文候选只需普通 Explainer 原创说明、表格与固定 URL 引用，不嵌入上游代码。

同轮只读 GitHub 窄查 `coverage in:title`：issue [#251](https://github.com/tt-a1i/archify/issues/251) open、[#237](https://github.com/tt-a1i/archify/issues/237) closed，属于 repository-grounded semantic coverage；PR #950/#883 已合并，属 CI 范围，#239 closed。另核 [#1015](https://github.com/tt-a1i/archify/pull/1015) open，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`，以及 [#1103](https://github.com/tt-a1i/archify/pull/1103) open，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`。这里复用其已研究的代码聚焦／Atlas 导航范围，不给其增加覆盖率后台。标题检索不是全站无重复证明，也未重新审完整 PR diff。

## 三个固定一手来源

| 项目 / 完整 revision | 实际许可文件 | 完整 fixture、expected、consumer 与判断 |
| --- | --- | --- |
| [RPGillespie6/fastcov](https://github.com/RPGillespie6/fastcov/tree/607b479c9948405494195f8f4dcd56a8f1c4469c) · `607b479c9948405494195f8f4dcd56a8f1c4469c` | [LICENSE](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/LICENSE)，MIT 正文 | 完整 branches.cpp、branch_test.cpp，以及两份 expected.info；run_all.sh 的 ctest_3→两种 filter→cmp 消费链。分母可随报告过滤改变，不能把更高比率归因为多跑了测试。不建 LCOV 比较器。 |
| [jacoco/jacoco](https://github.com/jacoco/jacoco/tree/64d0ef7a0bd19ae0716da7b0e3545c377f561003) · `64d0ef7a0bd19ae0716da7b0e3545c377f561003` | [LICENSE.md](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/LICENSE.md) 声明 EPL-2.0；同提交 [epl-2.0.html](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.doc/docroot/doc/epl-2.0.html) 是完整条款；所读 Java 文件带 EPL-2.0 头 | 完整 BooleanExpressionsTarget 与 Test、Stubs；expected 在 target 行尾断言，由 ValidationTestBase 真正解释。`assertFullyCovered` 的前半判断是 instruction status，并不承诺分支全覆盖。原 HTML 已有独立分支提示，不复制原报告。 |
| [SimonKagstrom/kcov](https://github.com/SimonKagstrom/kcov/tree/460cd988eaaa2271b682bbf1702443e90fb45c5e) · `460cd988eaaa2271b682bbf1702443e90fb45c5e` | [COPYING](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/COPYING) 完整 GPLv2；[COPYING.spdx](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/COPYING.spdx) 明确 kcov GPL-2.0-only，另列前端第三方许可 | 完整 Python main/second.py、test_accumulate.py 断言与 Cobertura XML helper；writer 的行计数和固定 branch 字段。唯一有限内容候选：先看 field producer，再判断它有没有测量该量。无本轮运行 XML。 |

本轮将固定 revision 的完整 Git archive 与所选完整原文件保存在 checkout 外临时目录。源码深读集中在下述 owning 方法；不声称审完三个仓库所有实现或验证所有平台。许可依据实际文件，非 GitHub license API 标签，也不在本报告给跨许可复制代码的法律结论。

## Fastcov：同一 fixture，分母可因过滤不同

完整 [branches.cpp](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/cmake_project/src/branches.cpp) 有初始化列表、if/else、for/while、throw/catch 和 switch；[branch_test.cpp](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/cmake_project/test/branch_test.cpp) 只传 hello、xvy、throw 三个字符串。[CMake consumer](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/cmake_project/test/CMakeLists.txt) 将它注册为 ctest_3；[run_all.sh L159–173](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/run_all.sh#L159-L173) 清计数、运行该测试，再将生成文件与完整 expected 用 cmp 比较。本轮仅读脚本和原件，没有执行。

| 提交中的 expected 文件 | 分支命中 / 分母 | 行命中 / 分母 | 能说明什么 |
| --- | --- | --- | --- |
| [filter_branches.expected.info](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/expected_results/filter_branches.expected.info) | BRH17 / BRF23 | LH30 / LF34 | smart branch filtering 后保留的 branch 记录 |
| [include_branches_sw.expected.info](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/test/functional/expected_results/include_branches_sw.expected.info) | BRH8 / BRF10 | LH30 / LF34 | 仅保留以 if/else 起始行的 branch 记录 |

两份行记录相同、分支统计不同，官方命令也没有在这两次导出间再执行 ctest。这支持“此比率变化可由分母过滤造成”，不支持声称测试质量提高或两种分支全集相同。[distillLine/filterExceptionalBranches L968–1033](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/fastcov.py#L968-L1033) 按 throw 标记及初始化列表启发式过滤；[源文本过滤 L797–823](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/fastcov.py#L797-L823) 删除不合起始字符串的 branch 项；[dumpBranchCoverage L713–726](https://github.com/RPGillespie6/fastcov/blob/607b479c9948405494195f8f4dcd56a8f1c4469c/fastcov.py#L713-L726) 再从剩余 counts 计算 BRF/BRH。不能把启发式称为所有编译器下精确的语言条件分类，也不能从缺失 BRDA 推断分支不存在。

## JaCoCo：FullyCovered 的对象必须读清

[完整 target](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core.test.validation.java5/src/org/jacoco/core/test/validation/java5/targets/BooleanExpressionsTarget.java) 比较普通布尔运算与短路表达式，[完整 Test](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core.test.validation.java5/src/org/jacoco/core/test/validation/java5/BooleanExpressionsTest.java) 把它交给 ValidationTestBase。[Stubs](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core.test/src/org/jacoco/core/test/validation/targets/Stubs.java) 的 f/t 分别返回 false/true，nop 方法为空。行尾断言是官方 expected，而非装饰性示例：consumer [L183–204](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core.test/src/org/jacoco/core/test/validation/ValidationTestBase.java#L183-L204) 解析它们；[L254–286](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core.test/src/org/jacoco/core/test/validation/ValidationTestBase.java#L254-L286) 独立比较 instruction status、missedBranches、coveredBranches。

| 原 target 中的行 | 提交中的断言 | 精确读法 |
| --- | --- | --- |
| `if (f() & f())` | assertFullyCovered(1,1) | instruction FULLY；branch 1 missed、1 covered |
| `if (f() && f())` | assertPartlyCovered(3,1) | instruction PARTLY；branch 3 missed、1 covered |
| `if (t() && f())` | assertFullyCovered(2,2) | instruction FULLY；branch 2 missed、2 covered |

不能仅看到 FullyCovered 方法名就改写为全部分支覆盖。[LineImpl.getStatus](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.core/src/org/jacoco/core/internal/analysis/LineImpl.java) 合并 instruction 与 branch 状态；[SourceHighlighter L90–125](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.report/src/org/jacoco/report/internal/html/page/SourceHighlighter.java#L90-L125) 根据该状态着色，再从 branch counter 给独立提示。因此原 Viewer 已自然呈现此区别，本轮不声称发现其缺陷或操作更慢。

[固定 counters 文档](https://github.com/jacoco/jacoco/blob/64d0ef7a0bd19ae0716da7b0e3545c377f561003/org.jacoco.doc/docroot/doc/counters.html) 将 line executed 定义为该行至少一个 instruction 执行；branch 计量基于 class 文件，exception handling 不计入该 branch 定义。以上不是 MC/DC 证据，不能把字节码分支数直接等同于源表达式独立条件数、输入组合总数或条件独立影响证明。没有构造 MC/DC evaluator，也未编译该 target。

## Kcov：branch 字段来自常量，不是该 writer 测得的分支

[完整 writer](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/src/writers/cobertura-writer.cc) 构成最直接的 producer 证据：

- L27–35 选择 cobertura.xml／cov.xml 文件名，L46–81 汇总并写出；[main L259–267](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/src/main.cc#L259-L267) 实际注册此 writer，不是孤立字符串样例。
- L97–121 的 sumOne 从 reporter 的 lineIsCode 与 LineExecutionCount.m_hits 算行分母、非零命中行；[reporter L87–110](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/src/reporter.cc#L87-L110) 提供行 hits、possibleHits、order。本页只解释 writer 用到的字段，不把 order 当完整执行 trace。
- L125–164 的 writeOne 为每行写 number/hits；HITS_SINGLE 模式将非零 hits 饱和为1。因此连 hits 也不能脱离 parser 模式一律读成精确执行次数。class 的 branch-rate 与 complexity 则直接写字符串1.0。
- L166–194 的 getHeader 计算 line-rate，branch-rate、branches-covered、branches-rate、complexity 仍直接写1.0。字段拼写原样记录，不擅自改成 branches-valid，也不从这些常量制造实测分母。这里只断言**这个固定 writer 没有按分支观测计算这些字段**，不泛化为 Cobertura 格式天生不支持分支，也不声称审完 Kcov 所有输出格式。

完整自然 fixture 为 [tests/python/main](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/tests/python/main) 及它导入的 [second.py](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/tests/python/second.py)。main 第15行按是否有参数分流，L16 是无参数提示，L19 调 fn。官方 [test_accumulate.py L5–48](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/tests/tools/test_accumulate.py#L5-L48) 的两类测试保存如下 expected：

| 官方场景 | L16 hits | L19 hits | L14 hits |
| --- | --- | --- | --- |
| 第一次无参数 | 1 | 0 | 1 |
| 同输出目录再传5，默认累积 | 1 | 1 | 2 |
| 另一测试的第二次传5且 --clean | 0 | 1 | 1 |

这是上游**断言中的预期值**，不是本轮运行结果，也没有提交现成黄金 XML。完整 [cobertura.py helper](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/tests/tools/libkcov/cobertura.py) 解析 XML、按 class 名前缀及 line number 取 hits，不验证 branch-rate；[reporter L386–405](https://github.com/SimonKagstrom/kcov/blob/460cd988eaaa2271b682bbf1702443e90fb45c5e/src/reporter.cc#L386-L405) 在非 clean 情况读取已有 coverage.db。故两次都曾命中不等于同一次运行走过所有路径；这里不用累计行命中反向恢复每次分支走向。

## 唯一轻量候选：先问 branch-rate 的生产者

候选尚未实施。若以后另获实施授权，只做一个正常 Explainer 有限内容页，标题可为“branch-rate 是1，为什么不能说分支全测了？”以原创说明与小表并列“line-rate 的实际计数来源／branch 字段字面来源”；官方 main 场景及 accumulate 的 line-hit 预期值只作作者转述，明确是提交断言。引用只保存 title/url，URL 固定完整 SHA 并可定位 owning 方法；不含源码 excerpt，不使用 SourceCard 代码弹层，不用 `@source` path 或 `@code` 自动嵌入。公开 facts 可保存源 path、line、hash 元数据；GPL-2.0-only 原件及完整 archive 只留私有研究材料，不复制或嵌入 Apache Viewer／HTML。无需新 XML、parser、交互、Workflow、跨语言覆盖 schema 或 importer；这项实施边界不是法律兼容性接受结论。

**新增价值是一次具体的合同阅读：从看数字，前进一步核对该字段是否来自相应计量。** 它与“有执行不等于正确”、测试身份归属、Mutation survive 或缺失数据的通用提示不同；这里字段存在且值为1，却不能据此声称生产者测量了所有分支。预期能帮助阅读 CI 导出文件或交接指标的人避免这一特定误读，尚无真实用户收益、阅读效率或事故证据；不要求先伪造一个生产事故才允许做内容。

成本低，仅 authored 内容与来源绑定；维护只需固定 writer／fixture revision。若后续必须安装运行 Kcov、发明完整 XML expected、显示四插件式运行顺序、统一多语言分母或增共享 Viewer，立即收窄而不扩平台。没有当场修改产品；也没有把上游常量行为定为 bug、向上游发 issue 或声称所有使用者都被误导。JaCoCo 与 Fastcov 留在研究对照，不一起塞进一个庞大解释页。

本批次按用户要求只收尾研究报告，随后暂停；不创建候选 worktree、页面或新一轮。scout_task_view 已独立只读核 Kcov writer／reporter／main 注册、accumulate／XML helper 与实际许可，核心事实无阻塞；没有运行上游或浏览器，候选不等于产品准入。

## 固定原件指纹与方法边界

以下均为下载后完整原文件的 SHA-256／bytes，非抽取段落摘要；链接中的 revision 已固定。不同仓库的同名字段不作标准化。完整 archive 和原文件保存在 checkout 外，报告不公开个人路径。只执行读取、GitHub API/CLI、解包及本方字节摘要，不执行任何第三方源码、Python/Java/C++程序、测试、包安装、coverage collector 或 browser；没有 CI、实机 UI、AT、覆盖提升或人类阅读接受结论。

| 仓库 / 完整相对路径 | bytes | SHA-256 |
| --- | ---: | --- |
| fastcov / `LICENSE` | 1085 | `146151949528753b8bc98a75c537b4ab4f2bcf3e31c5e1407965b14b38ead7c0` |
| fastcov / `test/functional/cmake_project/src/branches.cpp` | 1050 | `7959ff8695606de2351de9c9f144bb44b4fee72ec35ee8ab6616066e00f977f3` |
| fastcov / `test/functional/cmake_project/test/branch_test.cpp` | 169 | `4c4acb022fb8e4f2021635e19d3944a80a0865ca762ec3640c1c0523e44861b2` |
| fastcov / `test/functional/expected_results/filter_branches.expected.info` | 867 | `38f0ccf7a53999171c1a0e6b3b9a9c95d4fcb3fd09816ca466e4133a112e1a9e` |
| fastcov / `test/functional/expected_results/include_branches_sw.expected.info` | 683 | `b9b7a7a0f1449277131cc1f461c1a4ab925e91f1c866f9035ef39fce40333be1` |
| fastcov / `test/functional/cmake_project/test/CMakeLists.txt` | 641 | `95086ec7d8d8c7ad2cd94aded92c188c174a4ad094e90b93c83b4c65cd7f5f2a` |
| fastcov / `test/functional/run_all.sh` | 14002 | `d1cdbb3e40b857ebb64e0d5167710b02b6445fd4a1d4e0489668c0868145afaf` |
| fastcov / `fastcov.py` | 58651 | `9e4ceb27390a28531a1a415cf1774c0c196672859bca53c5a9c8393e4578648e` |
| jacoco / `LICENSE.md` | 673 | `c1169c6a71e0b59da9435afac9e5d19b9529106954f0cd9faf16f9efd15ac0fe` |
| jacoco / `org.jacoco.doc/docroot/doc/epl-2.0.html` | 14545 | `443b6fe2c8af07f9bb17409865df8c6c28d4af4fad2f19f4b676aead9ce2322b` |
| jacoco / `org.jacoco.core.test.validation.java5/src/org/jacoco/core/test/validation/java5/targets/BooleanExpressionsTarget.java` | 3322 | `ff9fad5de2490060d94c07f0f3c667b5de66c28f61cf9b4660c7db46d8795611` |
| jacoco / `org.jacoco.core.test.validation.java5/src/org/jacoco/core/test/validation/java5/BooleanExpressionsTest.java` | 923 | `410f03fca85ca56d697c36022ff78dfce95481a2d7d0ddd8add9b7baa2384c7f` |
| jacoco / `org.jacoco.core.test/src/org/jacoco/core/test/validation/ValidationTestBase.java` | 10512 | `80d6df81dc18bc37c5a22958fd13a5a1d661948ac9edbc9da20e644647fc6295` |
| jacoco / `org.jacoco.core.test/src/org/jacoco/core/test/validation/targets/Stubs.java` | 3775 | `82198e00e3136add70b3622c537492cf8617491e3db3410a131a04d939ef6200` |
| jacoco / `org.jacoco.core/src/org/jacoco/core/internal/analysis/LineImpl.java` | 4301 | `38b844d1def2210f20ea69dde55d9e0db384e351598727f63afd10523a80046f` |
| jacoco / `org.jacoco.report/src/org/jacoco/report/internal/html/page/SourceHighlighter.java` | 4003 | `860c7ffc7b0c1d71eb568e4643391207aca7c02b1c9261db03affe97b3804306` |
| jacoco / `org.jacoco.doc/docroot/doc/counters.html` | 6798 | `02a588264c52503c69668b9368882f20c12bde5d2752a1305623d5f6a0757f1e` |
| kcov / `COPYING` | 18092 | `8177f97513213526df2cf6184d8ff986c675afb514d4e68a404010521b880643` |
| kcov / `COPYING.spdx` | 92 | `34af10adc29df709e2db94148342e48cb9f6a0261cd15a95fb7928db1e7a8a12` |
| kcov / `tests/python/main` | 547 | `ac164243c3d297115c0be2b822ee0163529972fa1f9c66be233ce86ee8b1a110` |
| kcov / `tests/python/second.py` | 1114 | `12748f692f51dadf0ebf9fe6147534fd792d42f072a5c3c3296683c4b35efea1` |
| kcov / `tests/tools/test_accumulate.py` | 5349 | `0c2cb2580d7a9188865879810b3b8f1bb7214cd78e565a79a294dc24432d09c2` |
| kcov / `tests/tools/libkcov/cobertura.py` | 1216 | `f05a03e55601c0ab41714f5872bb52cecc3592c7eb5ebb7c1a636fa00c5634aa` |
| kcov / `src/writers/cobertura-writer.cc` | 5420 | `28ae848de4610221fc75374901e1939508003a59abe3af89cfeec2056f8022e2` |
| kcov / `src/reporter.cc` | 17614 | `2b14eb9dd369ccfe694471464515539310e8fa92216079944dd03c4fa409db16` |
| kcov / `src/main.cc` | 14911 | `0f344b8c5f86c6640a818387ee14bf6ac808e6e83417ec29a7fbf26dfca1cb79` |

AI assistance：Codex GPT-6.1-Sol 完成排重、官方来源阅读、字节核对和报告；未宣称人类复核或运行上游。
