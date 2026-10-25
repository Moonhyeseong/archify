# 正则与匹配过程阅读：可能路径、接受条件与执行证据

2026-10-25，只读第8轮。**6个新一手来源，深读2个模拟器及完整公开测试文件；当前0个实施候选。** 最有用的发现不是再画一个FSM，而是三处不能混用的证据：接受态与终止态、完整输入接受与子串匹配、结构允许的路径与某个实现实际记录的步骤。

固定Archify基线 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。已读CONTRIBUTING/REVIEWING，按research流程用只读后台agent核Regulex/RegJSParser，作者另读两套模拟器源码及测试。本轮未安装、运行上游parser/正则/recipes、运行Archify测试或浏览器；没有生成新的匹配记录或图片。下文源码推导、已提交expected与本轮实际执行严格分开。

## 排重与筛选

读取 [grammar-reading](grammar-reading-smalltools.md)、[model-witness](model-witness-smalltools.md)、[protocol-schema](protocol-schema-smalltools.md)、[text-diagrams](text-diagrams.md) 及研究中心34项实验；全文检索scouts中的仓库名。Peggy/Ohm/Nearley/Lark/Jison/Bison、railroad、Robot3/各种FSM库、TLA/Alloy/NuSMV已研究，不作为新来源。State contract、Delivery witness、CI conditions、Recipe stages已分别承担声明矩阵、事件occurrence、条件与实际导出来源；本轮不复制这些内容页。

发现路径从官方正则可视化项目README到engine、steps与fixtures，而非按star筛选。`jex/regulex`并不存在，本轮核到实际仓库为`CJex/regulex`。以下固定版本是本次实际读取的源码对象，不将旧分支、默认分支和发布二进制混同。

| 新来源 / 固定revision | 许可、现状 | 实际机制与判断 |
| --- | --- | --- |
| [ndcorder/regex-railroad](https://github.com/ndcorder/regex-railroad/tree/aea7ebffcac284bb42ed83da716c073666f9fa25) `aea7ebffcac284bb42ed83da716c073666f9fa25` | [MIT](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/LICENSE)，未归档 | AST位置与输入位置并存，记录match/fail/backtrack及captureState，另有truncated。源码是自实现递归匹配器，不是宿主JS/Python/PCRE运行时trace。深读见下。 |
| [Abdalla-Eldoumani/regex-fsm](https://github.com/Abdalla-Eldoumani/regex-fsm/tree/f1fb27e0c127e710923c68822ad0c5ded7ed923c) `f1fb27e0c127e710923c68822ad0c5ded7ed923c` | [MIT](https://github.com/Abdalla-Eldoumani/regex-fsm/blob/f1fb27e0c127e710923c68822ad0c5ded7ed923c/LICENSE)，未归档 | 每个输入位置保存λ闭包active-set，再按集合身份对应DFA状态；完整输入后判接受。ComputationTree的实际合并比注释所称“逐分支”更强，见下。 |
| [jviereck/regjsparser](https://github.com/jviereck/regjsparser/tree/18a904e4501e99c1690e62a5dafb4ca4c1d7d4a4) `18a904e4501e99c1690e62a5dafb4ca4c1d7d4a4` | [BSD-2-Clause](https://github.com/jviereck/regjsparser/blob/18a904e4501e99c1690e62a5dafb4ca4c1d7d4a4/LICENSE.BSD)，未归档 | [parser创建节点](https://github.com/jviereck/regjsparser/blob/18a904e4501e99c1690e62a5dafb4ca4c1d7d4a4/parser.js#L458)保留type/behavior、range/raw、min/max/greedy；[完整lookbehind fixture](https://github.com/jviereck/regjsparser/blob/18a904e4501e99c1690e62a5dafb4ca4c1d7d4a4/test/test-data-lookbehind.json)包含`(?<=\$)\d+(\.\d*)?`及expected AST。结构和原文可互相定位，但parse成功不是match成功，range是JS字符串下标，不是字节或仓库行号。 |
| [CJex/regulex legacy](https://github.com/CJex/regulex/tree/dc1e9c8c18b9840292348709dd5b6d7ee978de75) `dc1e9c8c18b9840292348709dd5b6d7ee978de75` | [MIT](https://github.com/CJex/regulex/blob/dc1e9c8c18b9840292348709dd5b6d7ee978de75/LICENSE)，仓库未归档，legacy为2019年对象 | [repeat renderer](https://github.com/CJex/regulex/blob/dc1e9c8c18b9840292348709dd5b6d7ee978de75/src/visualize.js#L302)区分重复、零次跳过与非贪婪偏好；静态结构不等于走过。默认master `1d0995b70641bdd0f804ae30089d6b792ad59c94`的[visualize按钮](https://github.com/CJex/regulex/blob/1d0995b70641bdd0f804ae30089d6b792ad59c94/src/web/main.ts#L13)仅console.log，不能把legacy完整能力当当前master已完成。 |
| [slevithan/regex-colorizer](https://github.com/slevithan/regex-colorizer/tree/03c34c74d61b5db4cc823e616fb6476da71f09c5) `03c34c74d61b5db4cc823e616fb6476da71f09c5` | [MIT](https://github.com/slevithan/regex-colorizer/blob/03c34c74d61b5db4cc823e616fb6476da71f09c5/LICENSE)，未归档 | [README完整同式对照](https://github.com/slevithan/regex-colorizer/blob/03c34c74d61b5db4cc823e616fb6476da71f09c5/README.md)用`(?<=\d)\p{L}\8`分别带/不带u flag，展示语法解释依赖flavor/flags；错误hover有解释。它是高亮器，不是执行验证；不为一段代码引入独立正则高亮运行时。 |
| [gskinner/regexr](https://github.com/gskinner/regexr/tree/d18630d02372b38614f220576bd1888326cf8e78) `d18630d02372b38614f220576bd1888326cf8e78` | [GPL-3.0许可文本](https://github.com/gskinner/regexr/blob/d18630d02372b38614f220576bd1888326cf8e78/LICENSE)，[本次源码头](https://github.com/gskinner/regexr/blob/d18630d02372b38614f220576bd1888326cf8e78/dev/src/views/tools/Explain.js#L1-L18)声明3-or-later；未归档 | [Explain.js](https://github.com/gskinner/regexr/blob/d18630d02372b38614f220576bd1888326cf8e78/dev/src/views/tools/Explain.js#L44-L107)从token区间产生解释行，hover联动表达式、点击Reference。说明与语法片段对应有价值；已有SourceCard/Passport方向重叠，未核其键盘体验，不能照搬mouseover设计或GPL实现。 |

## 深读一：同一位置的一组状态，不是一个“当前执行节点”

regex-fsm的完整公开 [dfaStateForNfaSet.test.ts](https://github.com/Abdalla-Eldoumani/regex-fsm/blob/f1fb27e0c127e710923c68822ad0c5ded7ed923c/tests/core/algorithms/dfaStateForNfaSet.test.ts)包含显式`endsInAbNfa`：3状态q0/q1/q2，q0有a和b自环、a到q1、q1经b到q2，start=q0、acceptStates=[q2]、alphabet={a,b}。它是官方测试输入，不是本轮运行产物。

对输入`a`，该文件expected active-set包含q0和q1；对`aab`逐step核subset身份。另有空集合到trap-state、输入排序无关、找不到集合返回null的测试。这里“DFA节点对应NFA集合”由 [dfaStateForNfaSet.ts](https://github.com/Abdalla-Eldoumani/regex-fsm/blob/f1fb27e0c127e710923c68822ad0c5ded7ed923c/src/core/algorithms/dfaStateForNfaSet.ts)按集合大小与成员比较，不是按label猜测或只看包含关系。

[simulate.ts L26–60](https://github.com/Abdalla-Eldoumani/regex-fsm/blob/f1fb27e0c127e710923c68822ad0c5ded7ed923c/src/core/algorithms/simulate.ts#L26-L60)的初始记录symbol=null是λ闭包初始化，不是消费一个空字符。之后每步先move再closure，记录currentStates/nextStates；全部input循环结束，才用active-set与acceptStates相交判accepted。中途经过接受态不能直接标整串接受。DFA缺失transition会返回false与空nextStates。循环用JS input[i]/length，不能无证据称任意Unicode grapheme步进。

**源码与“树”命名需分开。** [computationTree.ts](https://github.com/Abdalla-Eldoumani/regex-fsm/blob/f1fb27e0c127e710923c68822ad0c5ded7ed923c/src/core/algorithms/computationTree.ts)注释称genuine branching/configuration DAG，但实际root只有一个closure-set；每个parent将所有state的move union成一个rawMove，再closure形成单个child，没有按transition或run分叉。由此静态归纳，从单root开始每层至多一个set节点。它能显示逐位置active-set，**不能直接拿来当独立路径分叉树**；这不是本轮运行观察。它的node ID含level与sorted states也提醒：同一个集合在不同输入位置是不同occurrence，不能按state名字去重成一张运行图。

可借鉴的是“共享输入位置＋明确集合对应”，不是新增播放按钮。真要画多条可能运行，来源必须保留每个分支的转移身份及合并规则；只有active-set不能倒推出唯一branch history。

## 深读二：Match、No match与truncated分别支持什么

regex-railroad的完整 [simulator.test.ts](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/tests/unit/simulator.test.ts)有可复核的多种输入：`abc`在`xabcy`得到span{1,4}；`a+ab`在`aaab`预期有backtrack；`".*"`与`".*?"`在`"hello" "world"`得到{0,15}/{0,7}；`(a+)+b`在`aaaaaaaaaaaaaaaaac`且limit1000预期truncated=true。本轮读了整个文件，没有执行其中任何正则。

[SimEngine.run L35–65](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/src/lib/engine/simulator.ts#L35-L65)从每个startPos尝试，自首个成功返回matched与matchSpan，因此是子串查找合同，与上面整串语言接受不同。[addStep L67–93](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/src/lib/engine/simulator.ts#L67-L93)保存patternPosition、stringPosition、astNodeId、captureState和action；到stepLimit设truncated。未找到match且已truncated的false，不足以证明穷尽搜索后不匹配。

它的 [Debugger.svelte L163–171](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/src/components/Debugger.svelte#L163-L171)显示Match/No match并追加(truncated)。值得借鉴的是截断事实保留；若借其内容解释，结论宜写“预算内未找到，搜索截断”，不能只拿红色No match当确定性拒绝。

README虽称“NFA debugger”，实际 [tryMatchSeq](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/src/lib/engine/simulator.ts#L121-L155)使用递归continuation处理group/alternation/greedy/lazy；这是一套工具自己的模拟器。它同时宣称多flavor解析，不等于已运行宿主Python/PCRE引擎。官方 [crosscheck测试](https://github.com/ndcorder/regex-railroad/blob/aea7ebffcac284bb42ed83da716c073666f9fa25/tests/unit/simulator-crosscheck.test.ts#L1-L45)会与JS RegExp.exec比较span/capture，却去掉g，并在native不能parse时直接return。不能把测试存在升级成全flavor/全部flag/逐步调度等价证明。

Regulex legacy的 [NFA.input](https://github.com/CJex/regulex/blob/dc1e9c8c18b9840292348709dd5b6d7ee978de75/src/NFA.js#L175)提供另一边界：输出acceptable/lastIndex/lastState，acceptable最终仅按state是否在accepts中决定，仍须结合lastIndex与调用者语义看是否处理完整输入。[完整NFATest.js](https://github.com/CJex/regulex/blob/dc1e9c8c18b9840292348709dd5b6d7ee978de75/tests/NFATest.js)含余数3状态、空串/0/012/12等固定输入，也含随机循环；没有把后者说成本轮测试。

### 固定字节审计

以下都是官方fixed-SHA完整文件，临时只读保存，未复制进产品或运行。

| 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| regex-fsm src/core/algorithms/simulate.ts | 2376 | `af94bfcbbf83b49eca5672ba52d77984ba8ebd0ca0658b55d7ecc37b7bd17fc9` |
| regex-fsm tests/core/algorithms/dfaStateForNfaSet.test.ts | 5163 | `d30bcb404d9aa4df3bd7834d7ce1a9ff296d9e2d484043fcc2785971873b74c9` |
| regex-fsm src/core/algorithms/computationTree.ts | 7702 | `f73aba8762f7e40434db4aaae287910d8f0fd58b8a076e7ad16bdb068bd44a46` |
| regex-railroad src/lib/engine/simulator.ts | 22664 | `3bf9af2c4fa5466485a1b210d466aad08d6a2acd6837163655240b03a48d1689` |
| regex-railroad tests/unit/simulator.test.ts | 13097 | `e86ede4f974bf275e75d191144b9fd3675b27c02e41edad1b023c8a087bf7ae7` |

## Archify现有能力与不能直接映射的部分

**Lifecycle终态不是正则接受态。** 当前 [renderer L201–202](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/lifecycle/render-lifecycle.mjs#L201-L202)以没有出边判断isFinal；[README的Legend合同](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/lifecycle/README.md#L60-L71)将它画为双框，首mainPath状态有initial marker。NFA的接受态可以有出边，甚至起点接受空串后仍继续消费；直接把acceptStates套成此final标记会失真。这是两个领域的合同差异，**不是本轮发现Lifecycle违反自己的合同**。不能为方便套三节点图就改产品final含义，也不能用success色掩盖接受条件。

**Route Probe给一条结构最短路，不是匹配或执行引擎。** [shortestDirectedPath L307–333](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/route-probe.js#L307-L333)按compiled endpoints做BFS，previous每节点只记首次访问；没有输入symbol、guard求值、反复visit或capture状态。它可以解释静态关系，不能用其Journey动画说明“这个regex实际这样回溯”。新增all-path枚举也不能自动补齐这些证据。

**文本定位、条件与中断已有独立实验。** RegJSParser/RegExr的表达式区间联动与Source question tour已验证的固定SourceCard相近；本轮按要求不再扩SourceCard node focus。Budget截断不等于false的原则与CI conditions/finalize阶段说明有交集；State contract已区分声明与未执行，Model witness已区分存在性witness、全称检查和未知。这里只保留正则匹配特有的full-input/search/accept状态边界，不再造第三份泛用条件页。

本轮再次用官方API核：[PR #1102](https://github.com/tt-a1i/archify/pull/1102)为MERGED，mergeCommit10b4；节点说明、drilldown、焦点/IME等已纳入基线。[PR #1103](https://github.com/tt-a1i/archify/pull/1103)仍OPEN/draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；Atlas是Code Analysis的模块/file/function度量与findings导航，不是regex path/trace consumer。本轮既不重复Atlas，也不把其静态依赖曲线称真实调用或匹配轨迹；未重审整个PR实现。

## 推荐与停止条件

本轮**0个立即实施候选**。没有公开用户任务证明现有Archify需要匹配器、NFA importer、regex schema或播放器；上游完整工具已经能完成演示。把两套图画得更漂亮不构成新增价值，没必要为三个状态另开内容分支。

仅保留一个以后可证伪的入口：若出现**已有公开、冻结、非本轮手造的producer轨迹**，实际读者需要回答“哪个输入区间因哪个分支/断言失败、最终是未匹配还是预算中断”，才考虑最小静态解释。必须先具备pattern+flavor+flags、完整input、producer版本、匹配模式(full/search)、span口径、完整性/limit、逐occurrence身份及实际step数据。AST/可能路径图不能代替这些字段，缺失就保留未知；不得根据结构倒造steps。

届时先用现有Explainer表/代码引用比较原始trace的可读性：如果表已回答问题，停止；只有清楚的区间或分支对应阅读失败才补输入层表达，不先造parser/执行器。若想用Lifecycle，必须避开accept/final冲突或明确只画流程阶段；不能悄改共享合同。效果须在同一真实问题上比较，未有读者数据前不能称节时、提升正确率或生产验证。

本轮只新增本报告，无产品/README/他人文件修改，无commit/push；读到的测试和expected没有被写成本轮通过，源码分析也没有被写成实际引擎执行。
