# 第15轮：为何重建、缓存没命中与变化传播的解释边界

2026-10-25，只读上游研究。**本轮建议0项启动；保留三个可以迁移的阅读约定，不新建内容页或解析器。** 已有 rebuild-evidence 的 redo stamp/ccache、Task occurrences、Recipe stages 已占据最有证据的小问题。新来源确有细节，但尚未发现 Archify 现有产物需要修复的具体错误，也没有读者需求足以证明再开一页的价值。

Archify对照固定 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，本地 origin/dev仍指向该值；这是核对身份，不称未来最新版本。排重阅读 [rebuild-evidence](rebuild-evidence-smalltools.md)、[build-infra](build-infra-smalltools.md)、[第10轮](build-reading-round10.md)、notebook/execution/trace相关报告，并检索全部scouts中的owner/repo。以下主体来源此前未深读；不按stars筛选。按research Skill由后台代理独立筛查Zinc/Cargo/Tup/build2，作者核nix-diff与Turbo；只读取官方固定源码、完整fixture与许可。没有运行上游工具、构建、测试、recipe、缓存查询、Nix求值、compiler、浏览器或安装程序。下载及哈希计算是读取证据，不是上游执行成功。

## 已有方向为何不再启动

- redo 已具体回答“子项重跑但stamp相同，父项为何不重跑”，此次不换工具重画传播链。
- ccache 已区分direct miss、预处理hit与完整编译；sccache/BuildXL已有策略与错误分类，不把所有miss归因于输入摘要变化。
- Task occurrences 已区分打印位置/身份/依赖，Recipe stages已有声明分段与实际执行边界；不是再接一个DAG exporter。
- Trace waterfall/CI conditions已有观察时序与条件求值范围；本轮不新增scheduler、critical-path模型或条件播放器。

## 深读A：nix-diff的完整golden是计划对比，不是缓存运行证明

固定 [`Gabriella439/nix-diff@f81271839b02a8107ded57a9e8e8bcf47458d79a`](https://github.com/Gabriella439/nix-diff/tree/f81271839b02a8107ded57a9e8e8bcf47458d79a)，[LICENSE](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/LICENSE)为BSD-3-Clause。完整读取simple old/new目录的全部6文件，另读取所有4份golden expected、consumer与Diff/Types/Transformations；不是摘取README图来假设行为。

[两个drv.nix](https://github.com/Gabriella439/nix-diff/tree/f81271839b02a8107ded57a9e8e8bcf47458d79a/golden-tests/derivations/simple)共同有顶层drv、second/third共享soft_from_SW，以及改名/输出集合变更。旧→新改了参数、source集合/内容、soft_from_SW的platform/builder/env等。[Golden.Tests](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/test/Golden/Tests.hs)明确human-readable与json用同一simple、包含environment比较；[Golden.Utils](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/test/Golden/Utils.hs)上游测试会调用nix-instantiate，再对派生路径作diff。本轮完全未调用。它的初始化成功条件写为两个exit的OR，因此不由这段harness泛称两边总已成功；此处只核已提交expected。

[human-readable](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/golden-tests/expected-outputs/human-readable)与[JSON](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/golden-tests/expected-outputs/json)可完整公开复查，无需重现旧Nix环境：顶层builder/platform没变，但嵌套soft_from_SW变了；共享分支再出现时为AlreadyCompared。**“本层没有直接字段差异”不能读成“整棵依赖不变”；AlreadyCompared不能读成equal或执行跳过。** 但“共享位置”已被Task occurrences充分覆盖，不再以它作新卖点。

源码[Diff.hs](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/src/Nix/Diff.hs#L433-L490)按左右路径及输出集合记录visited；同路径返回same，已访问pair返回AlreadyCompared。输入按名字分组，只有可配成单对时递归，多对保留SomeDerivationsDiff，不能假装知道一一身份映射。source单对且两边存在时才读内容；不存在则保留无内容差异信息，不能补“内容相同”。[输出比较](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/src/Nix/Diff.hs#L211-L228)有意不比较output路径/hash；它解释输入侧，并不验证输出字节。[Types](https://github.com/Gabriella439/nix-diff/blob/f81271839b02a8107ded57a9e8e8bcf47458d79a/src/Nix/Diff/Types.hs#L80-L99)中envDiff缺省意味着该比较被跳过，与显式EnvironmentsAreEqual不同。

适合现有Explainer的机制是“直接字段差异 / 依赖传入差异 / 未比较或无法配对”分栏，Tree只表达嵌套比较范围；没有cache lookup事件、baseline可用性或执行结果时，不能画成“该节点miss导致下游实际重建”。这是可迁移写作约定，不是现有产品缺陷。上游已有清楚文本与JSON，不认为换成Archify本身产生收益。

完整simple原文件字节账目（SHA256；相对golden-tests/derivations/simple）：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| old/drv.nix | 917 | `28a8592e01d4b334472ecd4bf5b57d71070d4293f6cc17fc9c815cd0e174c7f8` |
| old/changed-file | 8264 | `9240783604038797552094222f6fdd27f81e2383a576c57b1fedda675af11a16` |
| old/missing-file | 24 | `6dbbb91385594eb6f4f27791b40093598573f44969acfef7c53ddf38508f63a9` |
| new/drv.nix | 907 | `a8a07a197bec5daa52efe0397840c3353efb3edb2e93cf4689ce1bc4735e3a11` |
| new/changed-file | 8264 | `660630af92b82187f6203207aea17734b4e3118b9cb6e05072699da5f067bb09` |
| new/new-file | 20 | `09b54bc7b32ac92a103a508ff1c5b9cbe139d741db1a752e88b1b8f39411bfd8` |

对应完整human-readable为11617B/`023d51af17a9199dcd5677ded955ea742bf633316a275a15fa0766ed7b945995`，json为90420B/`6e7b156c455f5599264bb7e332f69065b48529c9644be3861f0afa7979247c6d`。完整LICENSE为1533B/`72acabcde2829ac55e22000bd7666c5758962cc95029d4b5266f2c9560774156`。这些是提交中的golden，不是本轮生成结果；不重托管README外链截图，也没有新的截图验收。

## 深读B：Turbo的remote=false未必表示远程miss

固定 [`vercel/turborepo@8003ff0fe919160f68367cd08465b179410e0692`](https://github.com/vercel/turborepo/tree/8003ff0fe919160f68367cd08465b179410e0692)，[LICENSE](https://github.com/vercel/turborepo/blob/8003ff0fe919160f68367cd08465b179410e0692/LICENSE)为MIT（1055B/`f7ac4712aa30551de5b97b30215010515d783638107f207bcce32a85bfffc05e`）。

[TaskCacheSummary源码](https://github.com/vercel/turborepo/blob/8003ff0fe919160f68367cd08465b179410e0692/crates/turborepo-run-summary/src/task.rs#L185-L212)已经明确指出local/remote布尔字段有误导性并标deprecated：local命中时remote=false，可能只是没有查远程，并不是已证明远程没有条目。status/source指明得到的hit来源，不是双层查询receipt。另一路HashTracker转换保留metadata的两个值，不能假设所有producer路径均是同一取值算法。cache_miss的time_saved=0也是序列化默认值，不能当实测节省0毫秒。

完整[run_summary.rs](https://github.com/vercel/turborepo/blob/8003ff0fe919160f68367cd08465b179410e0692/crates/turborepo/tests/run_summary.rs)6075B/`443aabf6f315c66d84e4cbb8e5fc9b4c40907cafd2934923638efc478aebe417`，配套[basic_monorepo目录](https://github.com/vercel/turborepo/tree/8003ff0fe919160f68367cd08465b179410e0692/turborepo-tests/integration/fixtures/basic_monorepo)全部10文件共1684B已读：空.env.local、两文本输入、root package/package-lock/turbo.json、my-app/util/another包与.gitignore。my-app/util有build，another仅dev；测试期望首轮2 attempted/0cached/2success，后轮my-app HIT/local=true，而another#build不存在。失败case又明确MISS仍可以执行失败。**这些是上游测试的断言，不是本轮运行过两次的summary。** 145B snapshot只固定external dependencies hash，不能把它称完整运行JSON。

原始fixture的turbo.json有JSON注释，$TURBO_DEFAULT$与.env.local、globalDependencies foo.txt/globalEnv等；不要用普通JSON parser读取后声称全部完整兼容。root workspace依赖与实际任务依赖也不能凭包图猜出执行顺序。官方[缓存文档](https://github.com/vercel/turborepo/blob/8003ff0fe919160f68367cd08465b179410e0692/apps/docs/content/docs/crafting-your-repository/caching.mdx#L283-L310)已建议比较两次run summaries并列出第三方viewer；不是一个尚无人解决的UI需求。

此机制可用于日后已有Explainer的证据表：observed local HIT / remote not established，而非给remote画红色MISS。当前Archify没有Turbo importer或错误展示这组字段的已知输入；只为三个字段再写页面收益不足。若将来获得两次完整公开summary与具体困惑，可先做原文并排差异，再决定是否需Tree。remote来源、force、disabled、未查询与未保留均需各自证据，不能由false推断。

## 四个额外新来源与深读C：Zinc的API传播

后台代理对以下四个owner/repo作全部scouts排重，并读固定许可正文/具体源码，不把API许可标签代替正文。四者调查时均未归档；提交身份不是本轮执行版本声明。

| 来源 / 固定SHA / 许可 | 已核机制与证据边界 | 价值、成本与处理 |
| --- | --- | --- |
| [sbt/zinc](https://github.com/sbt/zinc/tree/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a) `64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a` / [Apache-2.0](https://github.com/sbt/zinc/blob/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/LICENSE) | [IncrementalCommon](https://github.com/sbt/zinc/blob/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/internal/zinc-core/src/main/scala/sbt/internal/inc/IncrementalCommon.scala#L189-L225)每轮后按API变化计算下一轮失效，空则收敛；完整less-inter-inv fixture见下。 | 区别于脚本stamp的具体API合同；可用现有关系图+轮次表，但没有观察trace就不画逐类重编译动画。暂不启动。 |
| [gittup/tup](https://github.com/gittup/tup/tree/c6f565e216a0820e39d65fa84ddaf830be03a476) `c6f565e216a0820e39d65fa84ddaf830be03a476` / [GPL v2 COPYING](https://github.com/gittup/tup/blob/c6f565e216a0820e39d65fa84ddaf830be03a476/COPYING) | 完整[t2028-ghost-node.sh](https://github.com/gittup/tup/blob/c6f565e216a0820e39d65fa84ddaf830be03a476/test/t2028-ghost-node.sh)先探测缺失ghost输出nofile；创建ghost=alive后update，断言输出alive。 | “不存在”也可以是被跟踪状态，不等于没有依赖。与既有BuildXL probe重叠；未深读所有tracer/平台实现，不复制GPL实现，不扩为新缺失文件监控器。 |
| [rust-lang/cargo](https://github.com/rust-lang/cargo/tree/b57863321f8d0a0f76fcf9ad636b6e39b024d0c0) `b57863321f8d0a0f76fcf9ad636b6e39b024d0c0` / [Cargo.toml明确MIT OR Apache-2.0](https://github.com/rust-lang/cargo/blob/b57863321f8d0a0f76fcf9ad636b6e39b024d0c0/Cargo.toml) | [dirty_reason.rs](https://github.com/rust-lang/cargo/blob/b57863321f8d0a0f76fcf9ad636b6e39b024d0c0/src/compiler/fingerprint/dirty_reason.rs)分features/env/rustflags、missing/read-error/checksum、forced/fresh/NothingObvious；[report rebuilds测试](https://github.com/rust-lang/cargo/blob/b57863321f8d0a0f76fcf9ad636b6e39b024d0c0/tests/testsuite/cargo_report_rebuilds/mod.rs)with_dependencies期望1根变化+4级联影响。 | 根变化与受影响数分开，unknown保留。此SHA仍是nightly/-Zbuild-analysis，不称stable CLI；未完整追fingerprint消费者，不做通用原因推断/导入。与既有原因分型重叠。 |
| [build2/build2](https://github.com/build2/build2/tree/4daf07bbdb7613c992748f63b7bd25d80239be2a) `4daf07bbdb7613c992748f63b7bd25d80239be2a` / [MIT](https://github.com/build2/build2/blob/4daf07bbdb7613c992748f63b7bd25d80239be2a/LICENSE) | [depdb.hxx](https://github.com/build2/build2/blob/4daf07bbdb7613c992748f63b7bd25d80239be2a/libbuild2/depdb.hxx)按rule/version→选项→源文件→动态头依赖保存，前项变化会使后续记录失效；[完整parser+depdb fixture](https://github.com/build2/build2/blob/4daf07bbdb7613c992748f63b7bd25d80239be2a/libbuild2/build/script/parser%2Bdepdb.test.testscript)核语法/诊断。 | 多个差异未必多个独立根因；parser测试不能说成重建结果。与已有hash/stamp范围重叠，维护新build2 importer不值。 |

Zinc完整[less-inter-inv目录](https://github.com/sbt/zinc/tree/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/zinc/src/sbt-test/source-dependencies/less-inter-inv)有七文件：A.x原为Int 3；B extends A，C extends B；D把c.x.toString显式作为String API；E检验D.x为字符串3。替换文件把A.x变成String。test先run、替换、再次run，严格断言累计compiler iterations=3。[IncHandler](https://github.com/sbt/zinc/blob/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/internal/zinc-scripted/src/test/scala/sbt/internal/inc/IncHandler.scala#L443)实际读取analysis.compilations.allCompilations.size，不是运行耗时、目标数或调用次数。

其注释解释初始1轮、修改后2轮；direct dependencies的API不再变化，所以没有更多轮。**这不是每轮class集合的断言，不能进一步宣称E绝未编译，也不能编造A/B/C各自的实际时间条。** [MemberRefInvalidator](https://github.com/sbt/zinc/blob/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/internal/zinc-core/src/main/scala/sbt/internal/inc/MemberRefInvalidator.scala)还有implicit/macro/annotation等更保守分支；[IncrementalCommon](https://github.com/sbt/zinc/blob/64ff4a8c7e88a62e81fcc13eabf7d2972a0a0d8a/internal/zinc-core/src/main/scala/sbt/internal/inc/IncrementalCommon.scala#L504)也处理classfile碰撞/macro等额外失效。不能抽象成“API相同总不传播”。它比redo的任意stdin stamp更细，但未证明另一个内容页的读者收益。

完整fixture字节（SHA256，相对less-inter-inv目录）：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| A.scala | 23 | `c99f346cea739421a7d0b3278269d0f1206ad855c94e091d23510c3e1f23b04a` |
| B.scala | 18 | `47b17eabd8d1c7543afcd745828a173a6c41d1ab7ebd98a91cf5c27987b0545c` |
| C.scala | 18 | `6730a389d8627b883f8cee134347132788e24f21d70e31b21a0b5ed337e81db5` |
| D.scala | 60 | `8d9bd3ea5a4153e0a8f2596d1f3c920e9bb08ad4cb17661dc201d898f0eb0fb8` |
| E.scala | 45 | `e53cb8721ea13c8a463cb71d4810ac9fad7767f05c82f15440c540399770f925` |
| changes/A2.scala | 25 | `502dcc9c48670ebae2f19cf9f85177da8732f1e2c38ee919827df86bdbfcc496` |
| test | 276 | `0415e21eba9836cec1767798003c501ed74e4a7209acf7af780aa8e94eb81d4d` |

完整LICENSE11358B/`cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`；IncrementalCommon.scala41582B/`e089855cdef172733601ec9d02f634e44554ff9d86c901755da3240cebaa7c1e`；IncHandler.scala40158B/`9737490044cce2b792965ceb15bf48953db9f84dc81625b88f0a72f7cbd64e3c`。这些记录使未来有需要时可公开重取完整输入，未运行Scala测试或重新编译。

## 适合现有产物的机制与停止条件

| 阅读问题 | 现有Explainer/Tree能做什么 | 必须保留的界限 / 当前决定 |
| --- | --- | --- |
| 为什么父项计划不同，即使本层代码未改？ | 原文差异表+嵌套input comparison Tree；直接差异/继承差异/未比较分列 | 这是计划或producer解释，不是cache server的miss事件或实际重建；nix-diff本身已有清楚输出，暂不新页 |
| local hit为何remote=false？ | 一行来源表：已有local HIT，remote是否查询未知；附原字段/owning source | 不补remote MISS，不用producer默认0制造时长数据；无Archify现存错误样例，不为三字段造新converter |
| 为什么源变了但编译传播会停？ | 固定A–E关系与初始/修改后轮次表，引用API比较源码 | 没有每轮集合就不编执行轨迹；与redo已有传播说明相邻，暂不启动Zinc对照 |

若后续出现**已有Archify产物把“未查询”画成miss**，优先修那一页的字段文案/证据，而非开发新组件。若取得公开完整、固定producer的两份缓存summary及实际困惑，可先做并排原文说明，只有它无法回答问题才考虑小Tree。若取得Zinc真实逐轮分析记录与具体交接任务，可重新评估API变化与编译集合对照。缺这些证据则停止，0启动是本轮结论。

不值得承担的新产品成本：Nix store/求值/远程缓存访问，Turbo多版本summary importer与secret/env处理，Scala compiler analysis解码，Tup tracer/ghost节点采集，以及跨工具统一“根因”求值器。它们各自的观察范围、身份与失效合同不同；相似树形状不能建立统一执行语义。本轮仅新增本报告，无产品修改、截图、测试成功或用户验收声明，未commit/push。
