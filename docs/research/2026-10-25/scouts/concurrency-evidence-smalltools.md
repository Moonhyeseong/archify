# Concurrency evidence：锁序环、等待环与死锁声明不能混画

2026-10-25。开始时对hub全部32份scouts提取298个唯一GitHub owner/repo排重；以下6项未被覆盖。不按stars筛选，只读固定源码、协议和已提交fixture，没有安装或运行检测器、测试、上游JS/Rust/Go/C代码、数据库、活进程采集或浏览器。

结论：**零新增产品实现推荐，本轮也不凑新的内容实验。** 已找到可借鉴的阅读机制和两个很小的公开证据反例，但没有核实其为自然用户事故或完整现场采集。现有原生有向图、Sequence、Lifecycle和Explainer已经足够表达固定关系；缺口主要是把关系的证据类型写清楚，不是再做并发检测器。等待环也不能改装成普通耗时时间线。

## 六个固定来源与可核合同

| 来源 / 固定revision / 许可 | 实际读取到的结构与机制 | 阅读借鉴及边界 |
| --- | --- | --- |
| [go-deadlock](https://github.com/sasha-s/go-deadlock/tree/222d9c980ff78f4810f9da6dd8426b4c7eefc851) · `222d9c980ff78f4810f9da6dd8426b4c7eefc851` · [Apache-2.0](https://github.com/sasha-s/go-deadlock/blob/222d9c980ff78f4810f9da6dd8426b4c7eefc851/LICENSE) | [Readme](https://github.com/sasha-s/go-deadlock/blob/222d9c980ff78f4810f9da6dd8426b4c7eefc851/Readme.md#L30-L54)区分不一致锁序与实际是否能同时发生；[TestLockOrder](https://github.com/sasha-s/go-deadlock/blob/222d9c980ff78f4810f9da6dd8426b4c7eefc851/deadlock_test.go#L62-L92)两段goroutine依次完成，仍期望potential回调一次。 | 先标历史acquisition-order，不要把检测名称直接翻成“现场死锁”。timeout告警是另一依据；只支持所instrument的mutex，不把channel等待补成锁边。 |
| [lock_ordering](https://github.com/akonradi/lock-ordering/tree/1d7d23e7665be0600262ba4fe1eabaf54bf42be6) · `1d7d23e7665be0600262ba4fe1eabaf54bf42be6` · [Cargo.toml声明MIT](https://github.com/akonradi/lock-ordering/blob/1d7d23e7665be0600262ba4fe1eabaf54bf42be6/Cargo.toml#L1-L9)；该tree未见独立LICENSE文件 | [类型级关系说明](https://github.com/akonradi/lock-ordering/blob/1d7d23e7665be0600262ba4fe1eabaf54bf42be6/src/lib.rs#L83-L100)用marker level及before/after trait约束取锁；[compile-fail输入](https://github.com/akonradi/lock-ordering/blob/1d7d23e7665be0600262ba4fe1eabaf54bf42be6/tests/fail/lock-out-of-order.rs#L8-L40)和[expected stderr](https://github.com/akonradi/lock-ordering/blob/1d7d23e7665be0600262ba4fe1eabaf54bf42be6/tests/fail/lock-out-of-order.stderr)指出缺少所需trait与源行。 | 这是声明的静态顺序约束及类型检查预期，不是observed wait-for。不能推断所有绕过wrapper、外部锁或其它阻塞路径都被证明安全；不复制缺少完整许可文本的源码作为实验材料。 |
| [parking_lot](https://github.com/Amanieu/parking_lot/tree/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91) · `85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91` · [MIT](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/LICENSE-MIT) OR [Apache-2.0](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/LICENSE-APACHE) | [固定check_deadlock合同](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/core/src/parking_lot.rs#L1189-L1205)返回当前互相死锁的thread components；[实现](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/core/src/parking_lot.rs#L1323-L1336)先近似扫描，发现环后再作一致快照核验。 | 近似图中出现环不能直接展示成确认死锁；[公开线程记录](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/core/src/parking_lot.rs#L1234-L1249)只有thread ID/backtrace，不足以还原所有资源端点。不要为了画完整wait-for图自行从栈猜owner/锁ID。 |
| [tokio-console](https://github.com/tokio-rs/console/tree/b59758e5a6effe3a9df3ec84a2f28d319d178234) · `b59758e5a6effe3a9df3ec84a2f28d319d178234` · [MIT](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/LICENSE) | [resources.proto](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/resources.proto#L95-L114)的PollOp关联resource/task/async-op并记录ready/pending；[async_ops.proto](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/async_ops.proto#L68-L76)有awaiting task与poll统计。 | 区分task、operation、resource，不能把async task当OS thread、把pending当“被某线程持有mutex”。协议是增量update，并有dropped_events；只有关联ID不等于owner或死锁证明。 |
| [Valgrind/Helgrind固定源码的非官方镜像](https://github.com/tklengyel/valgrind/tree/971c165fc4335bf04bedf58e0800a12776fce408) · `971c165fc4335bf04bedf58e0800a12776fce408` · [源码GPL v2文本](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/COPYING)，[文档另有GFDL1.2文本](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/COPYING.DOCS) | [tc13_laog1.c](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/tests/tc13_laog1.c)与[stderr expected](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/tests/tc13_laog1.stderr.exp)逐一关联先前建立的顺序、相反顺序与源行；[手册源码](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/docs/hg-manual.xml#L179-L248)解释锁序检测。 | 双向lock-order可出现在单一thread且先后完成，不等于两个thread互相等。镜像身份与固定版本明确保留，不称其为官方最新源码；工具、文档、fixture复用许可不能统一写成MIT。 |
| [jstack-review](https://github.com/jstack-review/jstack-review/tree/692cba56b4214a9e13da785a7d491f22a3a1ff85) · `692cba56b4214a9e13da785a7d491f22a3a1ff85` · [Apache-2.0](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/LICENSE.txt) | [测试内dump片段](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/tests.js#L431-L460)提供BLOCKED waiter、对象引用、inline owner及堆栈；[解析代码](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/jtdajs.js#L341-L365)只抓同步状态/对象ID/类名。 | 阅读时同时保留“原文报告什么”和“viewer模型保留什么”。这个片段没有完整owner线程记录或JVM deadlock声明，不能因投影缺holder就补死锁。 |

## 深读一：有环的历史锁序，也可以没有现场等待环

go-deadlock的[TestLockOrder](https://github.com/sasha-s/go-deadlock/blob/222d9c980ff78f4810f9da6dd8426b4c7eefc851/deadlock_test.go#L62-L92)先让一段goroutine按a→b取锁并解锁，调用WaitGroup.Wait后，再运行按b→a取锁的另一段。测试关闭timeout，期望potential callback被调用一次。这里两段不是同时互等；该fixture已经足以反驳“检测到锁序环必然表示这次运行卡死”。但它只是已提交的测试及预期，本次未运行，不能把callback次数写成本机观察。

Helgrind的[tc13 fixture](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/tests/tc13_laog1.c#L10-L32)更直接：只有main thread，先取得mx1/mx2并释放，之后以相反顺序取得并释放。expected将两次建立/违反顺序的调用栈都列出。图上正确的边是锁对象之间的历史acquisition-order；若把它画成thread→lock→thread的当前等待闭环，就改变了证据类型。

这份expected还把原始地址、thread号归一化成占位符，**不能把不同的`0x........`当成同一个真实锁ID**，也不能凭fixture源码里的mx1/mx2变量名伪造运行时地址。可以按已核源码行标注“本fixture的mx1/mx2”，同时说明这是作者映射、并非expected自身提供的唯一地址。完整C文件SHA-256为`dddcb12d990145b0b8fa0504c257beb6c9fc36dc793c9ad1c2d64ec4dc0ed883`；expected为`12ecfaeb3b034763bd83ba173286b3bb9aa7868ad0eb1f35b628070a7754cd28`，均只读取得。

与之相对，lock_ordering的[compile-fail fixture](https://github.com/akonradi/lock-ordering/blob/1d7d23e7665be0600262ba4fe1eabaf54bf42be6/tests/fail/lock-out-of-order.rs#L8-L40)由作者声明First/Second levels，expected指出在持Second时请求First缺少所需trait。它没有运行时thread ID、锁地址、owner或等待状态。静态规则图、动态历史锁序图、当前wait-for图必须使用不同图例和结论，即使三者都能画成箭头。

## 深读二：原文有owner，投影没有，不等于owner未知或死锁

jstack-review的[测试输入L433–444](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/tests.js#L433-L445)只有一份完整线程记录：waiter名为`http-5525-116`，原ID写作`t@151`，状态BLOCKED。等待行给出对象引用`259a4a41`及inline owner `http-5525-127` / `t@162`。这是原文报告的持有者引用，不是我们根据类名或栈推导的owner。

owner本人的完整线程记录不在片段里；因此能表达waiter→锁、锁→原文引用owner，不能补owner还在等什么，也不能闭环。片段末尾的ownable synchronizers为None只描述这份waiter记录，不是宣告全局没有持有者。这里没有JVM的Java-level deadlock声明。

该快照的[同步行regex](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/jtdajs.js#L341-L365)不保留owner后缀；[交叉引用逻辑](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/jtdajs.js#L206-L223)仅从included线程的locksHeld设置holder；[分类分支](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/jtdajs.js#L250-L255)把存在lockWaiters而无lockHolder的情况标为DEADLOCKED。**这是静态源码路径推导，未执行parser，不称已复现UI错误。** 原fixture断言只核线程数、等待对象和类名，没有证明owner被保留或死锁结论可靠。

此外[备用线程头解析](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/jtdajs.js#L438-L455)会把`t@151`存入内部字段tid；不能因此在来源栏写“原dump含tid=151”，更不能补nid。线程名、producer内部tid字段、原始ID字符串及OS线程ID不一定是同一个标识空间。

完整tests.js是55,547 bytes，SHA-256 `979271101794fbef0914c3e9a8f2156641b6e46d3837ee4aa35220596e401bb8`；jtdajs.js是31,061 bytes，SHA-256 `ea354e3401b02389a616f92933261cfd50fd81fcc5a98a1b8e76a114b2f85f56`。fixture位于JS字符串数组，不能执行整个test文件获取输入。若以后需要数据，按固定字面量静态解码并以LF连接，明确派生字节与原file字节的区别。

本轮没有找到该片段的采集者、原完整dump、运行版本、时间或事故说明；它可能是构造、截取或转录，不冒称自然用户现场。项目其它[deadlock测试](https://github.com/jstack-review/jstack-review/blob/692cba56b4214a9e13da785a7d491f22a3a1ff85/tests.js#L935-L987)直接构造分析对象，也不能代替JVM原始报告。

## 等待、持有与ID寿命：图必须保留这些边界

1. **同一观测范围。** parking_lot固定实现先用可能混合不同时刻状态的近似图发现候选环，再作一致快照核验；不能截取第一阶段就宣布死锁。其公开API返回component内的thread/backtrace，没有资源边，不能为了可视化从栈恢复不存在的完整wait-for数据。该固定[API合同](https://github.com/Amanieu/parking_lot/blob/85827ffa2ffb0b60d416e2e2a091f36b0e8e5a91/core/src/parking_lot.rs#L1189-L1198)还排除带deadline的等待，并说明报告会移除相关parking队列项；不能当无副作用的通用进程快照接口。本轮没有调用它。
2. **类型和寿命。** Tokio的[task ID](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/tasks.proto#L70-L80)、[resource ID](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/resources.proto#L40-L57)、[async-op ID](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/async_ops.proto#L35-L65)均只承诺在当前live集合中唯一。不能按一个裸数字合并不同类型、不同session或已drop后重现的对象；协议没有承诺跨生命周期永久身份。原始thread名/地址也不自动成为跨dump稳定键；不确定寿命时保留各dump occurrence，不强行连同一条泳道。
3. **地址重用证据不能夸大。** Helgrind的[tc15_lockdel fixture](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/tests/tc15_laog_lockdel.c#L41-L77)意图说明同地址destroy/re-init后应有新identity，但其文件末尾明确承认测试可能没有证明所声称的行为。只能引用这一设计意图和缺陷，不能用它给“身份回收正确”盖章；本轮也没有执行它。
4. **async operation不是mutex owner。** Tokio的[创建说明](https://github.com/tokio-rs/console/blob/b59758e5a6effe3a9df3ec84a2f28d319d178234/console-api/proto/async_ops.proto#L14-L32)明确创建不等于已poll；Stats.task_id表明哪个task await该op，PollOp.is_ready记录ready/pending。resource可能是timer/semaphore等，通用关联字段没有证明某个OS thread持有mutex。dropped_events非零意味着采集丢事件；零也只覆盖该instrumentation范围，不证明整个应用都被采集。
5. **wait-for不是happens-before。** 锁序图的before表示取锁约束/历史嵌套，不是跨thread的HB。当前被谁阻塞也不是已完成的同步交接。[Helgrind手册的HB说明](https://github.com/tklengyel/valgrind/blob/971c165fc4335bf04bedf58e0800a12776fce408/helgrind/docs/hg-manual.xml#L417-L510)根据同步建立部分序；不能用墙钟、相同栈、图上左右顺序或task→op关联补造它。data-race报告、potential lock-order cycle、timeout等待、producer确认的deadlock component应分别保留分类。

## 可借鉴的阅读动作，而非新检测器

最小机制是按问题切换证据，而不是换一种颜色：选中一条边时看到“它是声明的order、过去在持A时申请B、当前等待、还是报告原文引用的owner”，并看到固定来源行。展开一条锁序告警时，把“之前建立的顺序”和“此次相反顺序”并排；不要把先后发生的两段自动合并成当前环。owner仅有引用时，显示“原文引用，完整记录未提供”，保留引用ID与原文，既不删掉它，也不虚构该owner的第二条等待边。

现有Explainer表格、literal代码块、固定source引用和原生有向关系已能表达这些动作的大部分内容。Sequence适合有证据的acquire/release片段，但声明顺序图和快照wait-for图不应凭空加时间；Lifecycle只能表达所选对象的已声明状态变化，不能把所有BLOCKED线程画成不可恢复终态。没有可靠owner链的输入，本来就不应画闭环。

与hub已有方向排重：`execution-reading-smalltools`的ShiViz已处理vector clock/HB，不再做时间排序或通用事件DAG；`profile-reading-smalltools`已有async/task与采样边界；`protocol-schema-smalltools`的Query Lock Explainer会执行SQL，本轮不调用、不连接数据库；`component-identity-smalltools`的lock-walker是package锁文件，与程序互斥锁不同。未知owner/未包含记录也与既有“unavailable不等于zero”的证据规则相邻，不足以单独证明需要新产品接口。

如果以后有**可公开、许可明确、带完整身份与观测范围的自然dump**，可只写一页固定关系图加原文表，问题限定为“这条报告究竟证实了一条等待链还是一个死锁环？”先比原文＋表与加图后是否更清楚。验收要核每条wait/hold边对应原字段、snapshot/session、原ID格式、owner引用是否有完整记录、是否有producer deadlock声明；截图只能证明文字与箭头可读，不能证明检测算法正确或用户诊断更快。缺任一关键端点就保留缺失，不为凑环填边。当前没有这样的自然fixture，所以不建议立即新增示例。

## 范围与成本判断

固定关系阅读的成本在证据核对，原生图无需修改；全格式jstack importer、跨dump ID归并、锁模式/可重入/条件变量/线程退出建模、HB重建、async资源owner猜测、活进程attach和死锁检测都有远高于图形收益的维护面。尤其不能用一个测试片段决定通用缺owner即deadlock规则。零实现推荐是证据与成本判断，不是声称此领域没有用户问题。

仅新增本报告，不修改README、gallery、产品或别人文件；未执行上游、全仓测试、浏览器、commit或push。jstack-review固定fixture及投影由一个只读后台agent深读，本报告作者再次读取对应原文、regex和分类分支；结论区分源码推导、仓库expected、未知现场与本次实际执行（后者无）。
