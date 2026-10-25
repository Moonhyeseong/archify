# 第16轮：包身份之外，解析上下文与关系激活还剩什么

2026-10-25，只读研究，五个此前未深入的一手来源。**建议0项启动。** 新发现中最具体的是pipdeptree的edge-scoped extras：同一份urllib3记录，经不同入边抵达时可以显示不同后继。这确实不同于单纯“两个打印位置对应一个身份”，但目前证据是完整官方受控fixture，并非自然用户交接环境；原工具已有明确模式与断言，未发现Archify当前产物误读它。保留机制与重开条件，不为四个包另造解析器或内容页。

先读 [component-identity](component-identity-smalltools.md)、[code-maps](code-maps.md)、[graph-exchange](graph-exchange-smalltools.md)、[build-infra](build-infra-smalltools.md)、[round15](round15-build-explanation.md)，并检索全部scouts的lockfile/SBOM/requirements及owner/repo。CycloneDX、SPDX、tracepack、lock-walker、npm包位置/alias、Task occurrences、Dependency map均不重新计数。Archify对照固定 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，不由本轮研究宣称所有后续分支状态。

使用research流程：后台只读代理筛查pipdeptree/dep-graph/packaging，作者另取pipdeptree完整原文件并核消费者，主读guppy/pnpm固定源码、完整fixture和许可。没有运行上游程序、包管理器、resolver、测试、安装、compiler、marker evaluator或浏览器；只有下载、文本/JSON读取与字节哈希。以下expected不是本轮实跑结果，所有五个仓库调查时均未归档。

## 五个新来源

| 固定来源与revision | 实际许可 | 新关系维度与处理 |
| --- | --- | --- |
| [tox-dev/pipdeptree](https://github.com/tox-dev/pipdeptree/tree/45c43e2616d97484dfb6b16e1d5cfee3626086b8) `45c43e2616d97484dfb6b16e1d5cfee3626086b8` | [MIT](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/LICENSE)，完整1064B/`611bc7a9f93574c2fef86067b73a55f754e06f6acf081c1c8652a68f8686f289` | 同一installed package的后继可受incoming extras与显示策略影响；深读A。此SHA已Rust重写，不拿历史Python实现当消费者。最具体，但没有自然交接需求，暂不启动。 |
| [guppy-rs/guppy](https://github.com/guppy-rs/guppy/tree/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a) `5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a` | [MIT](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/LICENSE-MIT) OR [Apache-2.0](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/LICENSE-APACHE) | feature节点与package节点、host/target、required/optional声明不是同一维度；弱feature不自动启用optional dependency。深读B，不引Cargo resolver。 |
| [pnpm/pnpm](https://github.com/pnpm/pnpm/tree/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12) `60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12` | [MIT](https://github.com/pnpm/pnpm/blob/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12/LICENSE) | package基础记录不等于带peer上下文的snapshot；optional peer satisfaction边还受importer/依赖组影响。深读C。大系统只取小机制，不称独立小viewer或推荐集成整个包管理器。 |
| [snyk/dep-graph](https://github.com/snyk/dep-graph/tree/7066bd071a98585dfbda6699e474afee5fdef3d9) `7066bd071a98585dfbda6699e474afee5fdef3d9` | [Apache-2.0正文](https://github.com/snyk/dep-graph/blob/7066bd071a98585dfbda6699e474afee5fdef3d9/LICENSE)，API的NOASSERTION不能替代正文 | 完整[plain-dep-graph.json](https://github.com/snyk/dep-graph/blob/7066bd071a98585dfbda6699e474afee5fdef3d9/test/fixtures/plain-dep-graph.json)12node/11pkg，同c@1.0.0两个nodeId分别依赖不同d版本。[createFromJSON](https://github.com/snyk/dep-graph/blob/7066bd071a98585dfbda6699e474afee5fdef3d9/src/core/create-from-json.ts#L34)按nodeId建图并保留pkgId→nodeIds集合。只是抽象schema fixture，后缀不能擅称peer context/文件位置；与既有bom-ref/pkg坐标分层重叠，不开新例。 |
| [pypa/packaging](https://github.com/pypa/packaging/tree/f124fb7f2a18e41a5593f4c5c47d63db6f49f0d1) `f124fb7f2a18e41a5593f4c5c47d63db6f49f0d1` | [LICENSE声明](https://github.com/pypa/packaging/blob/f124fb7f2a18e41a5593f4c5c47d63db6f49f0d1/LICENSE) Apache-2.0 OR BSD-2-Clause，两个许可正文均已读 | [marker context tests](https://github.com/pypa/packaging/blob/f124fb7f2a18e41a5593f4c5c47d63db6f49f0d1/tests/test_markers.py#L600-L654)：同membership表达式在lock_file缺省空extras为False，metadata/requirement缺变量会报错。[evaluate](https://github.com/pypa/packaging/blob/f124fb7f2a18e41a5593f4c5c47d63db6f49f0d1/src/packaging/markers.py#L510)有context默认值；这是条件求值范围，不是选版本/安装证明。与CI/泛条件边界重叠，不做新evaluator。 |

## A. 最具体的新题：同一个urllib3，为什么两条分支后继不同？

完整官方fixture是[graph.rs L400–424](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/tests/public_api/graph.rs#L400-L424)。四份完整METADATA内容都在函数中，全部version=1：

| dist-info记录 | 完整声明的关键关系 | 含义 |
| --- | --- | --- |
| selenium-1 | Requires-Dist: urllib3[socks] | 入边请求socks |
| requests-1 | Requires-Dist: urllib3 | 入边没有请求extra |
| urllib3-1 | Requires-Dist: pysocks; extra == 'socks'，Provides-Extra: socks | 有条件关系，不能直接当无条件运行依赖 |
| pysocks-1 | 无Requires-Dist | 本fixture声明范围内无依赖 |

[PackageSite](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/tests/public_api/common.rs#L303-L326)写临时dist-info/METADATA，不下载或安装真实selenium/requests。这是上游作者的完整受控输入，不能称真实生产环境快照，也不能把version1对应到真实发行版本。本文未执行该函数。

完整[scopes_extras_to_requesting_edges断言](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/tests/public_api/graph/extras.rs#L352-L373)明示：

| producer显示模式 | selenium→urllib3分支含pysocks | requests→urllib3分支含pysocks |
| --- | --- | --- |
| explicit | 是 | 否 |
| active | 是 | 是 |

这里只有一份urllib3 package记录。不是两个node版本、不在证明两份安装，更不是两个运行对象。与Tracepack的多路径同location相比，新增的是**路径携带的extra上下文会改变可见后继**；与Task occurrences相比，不仅是多个位置指同一身份。反向explicit断言也只期望pysocks、urllib3、selenium，不包含requests，不能把反向树直接换成无条件的所有可达父节点。

[Graph::selected_children](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/src/graph/mod.rs#L660-L687)合并mandatory、incoming_extras与global_extras控制的optional边；[extras.rs](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/src/graph/extras.rs#L83)的active策略从图中target存在与嵌套extras可满足性求集合，再作为全局extra展示。它不是安装历史日志。该步骤也没有调用另列的is_conflicting版本约束检查，不能把“active”扩成所有版本约束正确或真实运行时使用。原工具已经提供两种可解释模式，不把区别冒充它的bug。

另两个完整上游case作边界参照：[duplicate requirement edges](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/tests/public_api/graph.rs#L97-L115)中child已装1，但root分别约束==0.5与>=2，expected保留两条并warn-fail；[distinct extras](https://github.com/tox-dev/pipdeptree/blob/45c43e2616d97484dfb6b16e1d5cfee3626086b8/rust/tests/public_api/graph.rs#L118-L152)同一child的两个extra原因分别保留。约束字符串不能替代installed version，也不能为了同名而把冲突原因去掉。本轮没有实跑这些断言。

如有真实阅读任务，现有Explainer可以先做“单份package记录＋两条请求关系＋explicit/active表”，现有Architecture只承载声明/请求边，不把不同视图画成不同安装事实。成本低于做Python环境探测器、extras parser或动态切换器。但当前四包上游测试已经把问题回答得很短；没有额外交接任务时，启动另一个页面的独立收益不足。

## B. Guppy：feature名、依赖名与host/target不可互换

完整[weak-namespaced-features.json](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/fixtures/small/weak-namespaced-features.json)为32410B单文件，consumer[weak_namespaced.rs](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/guppy/tests/graph-tests/weak_namespaced.rs#L93-L110)明确期望命名feature arrayvec存在，但同名可选package arrayvec未被激活。不是package消失或resolver失败。[测试构造](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/guppy/tests/graph-tests/weak_namespaced.rs#L431-L456)从该固定metadata取feature set，再用指定CargoOptions，而非本轮执行cargo。

另完整[builddep.json](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/fixtures/small/builddep.json)40237B，与[weak_required.rs](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/guppy/tests/graph-tests/weak_required.rs#L201-L249)及[fixture binding](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/fixtures/src/json.rs#L39-L61)对应：normaldep-weak单独启用时，target normaldep有alloc/std，但host normaldep为None；再启用normaldep时，optional build声明才激活，host也有这些features。None和空feature集合Some("")不同。host/target不是两版本，也不是运行时/部署环境。

[source weak.rs](https://github.com/guppy-rs/guppy/blob/5fe5dd62ff04a6a96c6bbc2482f9c0cf9e79108a/guppy/src/graph/feature/weak.rs#L4-L21)把弱feature边按required/optional声明分半；可选半边在前向遍历等待dep:foo激活。这是**声明上下文＋激活条件**，不能无条件抹平成一个package→package箭头。测试文件另有明确说明从未由cargo metadata产生、仅patch JSON构造的NEVER_OPTIONAL_CASES；本轮不拿它们当自然有效Cargo输入。

完整workspace/weak-features目录也已读取，但其当前源与历史builddep.json不是同一份字节/路径，不能将前者称后者本轮重新导出的原项目；报告只用消费者明确绑定的完整metadata。metadata中fakeuser路径属于上游fixture身份，不是当前机器采集。即便制作展示，也须保留package ID、feature label、声明种类、platform、resolver选项，成本已超过普通图换皮。没有具体Archify误读样例，研究保留。

## C. Pnpm：基础package记录与peer snapshot不是同一个引用域

固定SHA同时有新Rust pnpm与pnpm11历史实现；必须按文件所属实现说话。完整[pnpm11 peer-variant-missing-resolution目录](https://github.com/pnpm/pnpm/tree/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12/pnpm11/installing/deps-restorer/test/fixtures/peer-variant-missing-resolution)五文件未经修改：lockfile注释明确这是pruner丢失基础resolution的回归形状，不能把它称正常完整lockfile。它恰好说明带peer后缀的variant与基础resolution不是可以互换的单个键；本轮不据此推断安装成功、peer已满足或生产事故。

更直接的当前Rust[peer_variants.rs](https://github.com/pnpm/pnpm/blob/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12/pnpm/crates/cli/tests/suite/lockfile_resolution_reuse/peer_variants.rs)完整测试：将只以peer-suffixed snapshot出现的transitive abc提升为direct dependency，importer edge必须指向存在的带peer snapshot，不能只拿packages块的裸abc@1.0.0作目标。上游harness会调用install/mock registry；本轮只读，没有执行，因此没有实际导出新lockfile或安装树。

还有比“同名不同ID”更细的[peer-edges实现](https://github.com/pnpm/pnpm/blob/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12/pnpm11/lockfile/peer-edges/src/index.ts#L5-L18)：optional peer的snapshot entry可能只是满足来自importer的peer上下文，production过滤不能无条件跟随dev dependency提供的满足边；required peer与“另一路实际提供target”有不同处理。[完整filter测试](https://github.com/pnpm/pnpm/blob/60b73b9c2d7e40dd4c4fa52a5bc48e03b5ca4b12/pnpm11/lockfile/filtering/test/optionalPeerSatisfactionEdges.ts#L72-L113)明确prod-only移除peer-c，另一保留路径或ALL则不变。这是producer自己的过滤合同，不是Archify该重做的算法。

若未来真实lockfile交接出现“为何同name/version需要不同peer context”的问题，先用现有表格写importer ref→snapshot key→package base resolution三层，图上每条边标清引用域。不要仅按name@version合并，也不要把constraint/ref当实际安装。当前完整小fixture是有意损坏的回归输入，新Rust测试又需mock registry才能产生实际结果；缺正常、固定、完整输出与具体读者任务，暂不做内容例。

## 完整字节与可复核边界

下列SHA256对下载到的完整官方文件计算，均未改字节。pipdeptree四份METADATA嵌在完整graph.rs的scoped_extra_site中，未生成本轮export；Guppy两个metadata是完整文件，不将源workspace误当重新生成的证明；pnpm回归fixture性质保留。没有截图或上游实跑receipt，因此只能按固定源码和expected复核，不称视觉/安装验收。

pipdeptree（固定45c43e2完整原文件）：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| rust/tests/public_api/graph.rs | 14343 | `9db09320c8cf8bf1d077f9eeee7f10b4b0f6a08732c5953f36ef3ffaacda44b3` |
| rust/tests/public_api/graph/extras.rs | 11200 | `452438706d5b708d84915012b077514c27e77dcd6c462364be4b0a7622f63a06` |
| rust/tests/public_api/common.rs | 10049 | `7c569cc198a4a68f42e353b324b43b2de7e768cd08af77bbf7f8bc4fb75148e7` |
| rust/src/graph/mod.rs | 26908 | `1f1d706068c4d5b9887e503b8c44eb5125c1ede4571bf43a9720b96ddc287742` |
| rust/src/graph/extras.rs | 4659 | `c795a93ffef7827a487d43164af2a28648d9eda46694891ec106eb806dfdd846` |

Guppy（固定5fe5dd6完整metadata、consumer与许可）：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| fixtures/small/weak-namespaced-features.json | 32410 | `0e84a4baa03ff5b8fdbd6a5345d88737107efc6527bbbe3eff6090126ac541cb` |
| fixtures/small/builddep.json | 40237 | `ce797f86889323a13999a4002e7a13997da49f7da5d75f2331e87f72e1876211` |
| guppy/tests/graph-tests/weak_namespaced.rs | 16175 | `1097f6230592961183bace11426b2472454981f4f976bd70b5bf70c2b6a72175` |
| guppy/tests/graph-tests/weak_required.rs | 42591 | `a31df91826e974114c3e73cdb497a7376ea833388bda9c149ac9b78450cf654d` |
| guppy/src/graph/feature/weak.rs | 8039 | `a287baf75960367af0867158fd627bd04733d5827d716d6e1905ee53fb02cb6c` |
| LICENSE-MIT | 1067 | `a07ed064ba702ac8a8398823a32ec32b701c274df8427a96b0acb125d38371e4` |
| LICENSE-APACHE | 10847 | `a60eea817514531668d7e00765731449fe14d059d3249e0bc93b36de45f759f2` |

pnpm11损坏回归fixture（固定60b73b9的完整五文件；相对该fixture目录）：

| 文件 | bytes | SHA256 |
| --- | ---: | --- |
| package.json | 141 | `a44cce3fd023224f029a70c4a0e47959b511b616cf16aeec733ed8ea43abad9f` |
| packages/peer/package.json | 62 | `b8756c99192f64bd7998fd1bfa3051f0c7ddb3dd7cc0035c89c76ab1be0fd162` |
| packages/pkg-a/package.json | 112 | `f56c822003564d0f316d8128f9e8cfb8e7e16fde30c31d964eddf9549f8a41cb` |
| pnpm-lock.yaml | 1363 | `8fe27c6bc165b2e5c583a85659deb566c16e03fd393c3126bde4a3cacde220d2` |
| pnpm-workspace.yaml | 57 | `cbd84efc06a9a259623b9cf0bf52d23e18bcc85de731262030e8cb2dde378799` |

## 本轮决定与重开条件

- **唯一值得记住的小题是edge-scoped extras，但本轮0启动。** 如果出现真实交接问题“为什么从requests展开时看不到已存在的pysocks”，先用同一producer输入/模式表解释，再考虑现有Architecture的请求边＋Explainer条件表；不得把active当安装历史。完整上游四包测试不自动证明需要另一页。
- Guppy的关系维度确实超出package identity，但host/target、feature selection、required/optional与platform不能拆掉后再宣称无损。已有Explainer可承载固定比较；新增通用resolver/analysis importer的成本不值得。
- Pnpm需先取得正常且完整的公开lockfile及对应上下文，不拿专门损坏的fixture证明正常布局；snapshot与resolution引用域可作阅读约定，不先做修复/自动合并器。
- Snyk是组件/节点身份分层旁证，packaging是缺上下文与False的旁证；与既有报告高度重叠，不独立开页面。版本范围满足也不是被选版本、installed inventory、执行关系或安全证明。

本轮没有发现需要修改Archify schema、Viewer、节点身份、引用动作或产品CLI的实际缺陷。没有新parser、resolver、环境探测、依赖安装或运行验证；未改其他文件、commit或push。0启动来自证据与增量判断，不表示这些工具没有用户价值。
