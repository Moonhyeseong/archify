# 类型阅读第八轮：类型展开、证明候选与运行值

2026-10-25。**本轮0项实施推荐。** 核查六个新一手来源，深入 ts-type-explorer 和 Argus。类型展开回指、trait证明候选、运行时对象引用是不同关系；不能因为都能画成树就合成一种“代码图”。现有Class/Tree/Explainer足够做明确标注的静态说明，当前没有实际Archify读图失败或完整上游输出支持新适配器。本轮未运行类型检查器、Rust编译器、上游程序、测试或浏览器，未安装工具。

## 查重和当前能力基线

对本轮开始时 **50份 scouts** 的仓库引用排重，定向复读grammar/native/symbol/code-maps等结论。既有ts-arch、TsUML2、pretty-ts-errors、SCIP、stack-graphs、Rust/Go分析、Copy identity不重新计入；本轮不是把symbol/reference或UML换名再做一套。六个下列仓库均未出现在引用索引中，stars不作为门槛。

固定Archify [dev `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`][archify]，已合入#1102，包含node explanation/drilldown等维护批次能力。[#1103][pr1103] 当前读取head `f0be206acbc90eb7c6c6b636030e3eb28963d284`、OPEN；其Atlas module/file/function依赖、复杂度/findings→Classic源码范围继续排重，不把它称编译器证明树或dev已有能力。

## 六个新来源

| 来源 / 固定revision | 实际许可、实现 | 完整公开材料和采用判断 |
| --- | --- | --- |
| [ts-type-explorer][explorer] `3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4` | [API package.json][explorer-package] 声明MIT；实际完整[LICENSE][explorer-license]只找到VSCode子包，不能无条件称所有根级fixture均已核完整许可。[tree.ts][explorer-tree] 从checker结果生成type/reference/max_depth | 完整[recursive.ts][explorer-fixture]及[tree][explorer-baseline]/[localized baseline][explorer-localized]，测试做ID/路径规范化。深读，保留回指与省略边界；授权范围及无真实读图任务使新内容/复用暂不推荐 |
| [Argus][argus] `8d41733c313e97f87c6bf390ec59f2701e4e41d9` | [完整MIT][argus-license]；[serialize.rs][argus-serialize] Goal→Candidate→子Goal，[types.rs][argus-result] 区分四种求解状态 | 完整[missing-marker.test][argus-fixture]；未找到该输入对应已提交序列化树golden。深读，不能把作者解释图冒充solver实测输出；拒绝新proof adapter |
| [ts-visualizer][visualizer] `2f47ed39c986e4a87b9109e2046e22b19adb7e74` | [完整MIT][visualizer-license]；[graphModel.ts][visualizer-model] 为继承/实现建边，[compositionResolver][visualizer-composition] 从属性类型文字提取候选名 | 完整[deepInheritance.ts][visualizer-fixture]。继承图与Class能力重叠；属性类型引用被画作composition，不自动证明运行对象所有权/生命周期。不是通用类型推导过程或调用图，不移植resolver |
| [Aquascope][aqua] `f2d0a06034b86765a91f10b7c8e40ec31ecb87a6` | [完整MIT][aqua-license]；[permissions/output.rs][aqua-permissions] 基于Polonius facts，另有解释执行路径 | [moved_0.test][aqua-fixture] 是完整Rust输入，声明可变引用后move再使用。该文件本身不是输出快照；不能由权限图推运行heap值。需要指定nightly/rustc-private/Miri的分析链，不给离线Archify引入 |
| [RustViz][rustviz] `dfd4d0e7a4a3b4beddac50a85902a38af85230f0` | [根LICENSE MIT][rustviz-license]；[svg_generator/data.rs][rustviz-data] 区分Owner/StaticRef/MutRef及Copy等字段，vendored资源许可另需按文件核 | 提交的[mdBook示例HTML][rustviz-example]及SVG是可读产物，不是本次生成。当前实现依赖固定nightly插件；不把旧annotation版的能力套到当前版，不把ownership轨迹当一般type solver |
| [TypeScript analyze-trace][analyze] `534b0a1d225d25a56cd71c363490bcc349580c59` | [完整MIT][analyze-license]；[get-type-tree.ts][analyze-tree] 从types数据递归展开type相关字段并抑制祖先环，[analyze-trace-file][analyze-core] 分析compiler trace | [官方README][analyze-readme] 的hotspot例是说明文字，未找到完整配套trace fixture。目标是编译器耗时热点/最小复现，不是应用运行耗时，也不是类型成立证明；不再开profile/trace converter |

## 深读一：递归类型的reference不等于对象环

完整[tests/cases/recursive.ts][explorer-fixture]只有一行：

```typescript
type Recursive = { a: { b: Recursive } }
```

原文件40 bytes，SHA256 **`17254ed65b90c6349b5480a4df807651b0b66b3974f842ee0a24bb1668e0f14d`**。这是类型声明的测试输入，没有提交任何运行时对象、地址、变量值或堆观察。因此不能从这份图回答“当前heap是否有环”“有几个对象”或“a/b是否同一引用”。Copy identity实验回答运行观察中的别名/复制，两者不能互相代替。

完整[recursive.tree][explorer-baseline]为17286 bytes，SHA256 `09d2b53962a876dd56b3e7b8b1d67c09cf37be507d736fc4553848befe827ecf`；完整[recursive.localized.tree][explorer-localized]为12555 bytes，SHA256 `bf4763021ba30ce7fd8f3698febf7db73be27bd48c75c02c0526aad0d3de4d08`。两文件各包含`Recursive/a/b/Recursive`四个符号位置的基线条目，**不是单个JSON文档或一次raw compiler dump**。若将整文件当JSON读取，必须拒绝或按已声明多条目格式处理，不能静默只取首项当完整报告。

首个tree条目中，`/properties/0/properties/0/properties/0`是`kind=reference`、name=a、id=1；它回指类型展开中已经见过的项，不是额外的运行实例。具体机制：

- [tree.ts L195–232][explorer-seen] 用getTypeId和seen避免无限展开；可按定义位置生成reference，也可按已见ID回指。超深在[L133–141][explorer-depth]返回`max_depth`，与真正没有子项不同。
- [getTypeId L306–317][explorer-id] 组合checker type/symbol/node内部ID，不是文件digest或跨版本稳定身份。[normalize.ts][explorer-normalize] 又把基线ID按遍历重新编号、规范路径；localized的重复项被替换为reference。不能把基线id=1称TypeScript原始ID，亦不能拿同ID跨两次编译对齐。
- [resolveTree.ts L194–238][explorer-resolve] 对带location的引用调用retrieveTypeInfo，对不带location的在typeInfoMap找id。展开是取已有类型资料/重新请求类型信息，不是执行目标程序，也不是时间回放。

API清单只给TypeScript开发依赖范围`^4.8.4`，这不证明某份已提交baseline由精确4.8.4生成；没有运行receipt/锁定编译环境时版本来源未知。本轮可核的是固定提交中的输入、规范化方法和期望文件，未声称在当前TypeScript重现一致。

**采用判断**：现有Explainer原文+小表能说明“reference指向什么”，Class可表达作者明确声明的类型关系；不需要新增循环对象图/类型schema。源码位置和本报告摘要只能定位这份类型资料，不把显示name当稳定身份。若要分发API/根级测试原文，先解决完整许可覆盖证据；本轮不复制源码到实验、不引运行依赖。

## 深读二：trait候选不等于满足约束，未决不等于失败

完整[contained/missing-marker.test][argus-fixture]是407 bytes Rust源码，SHA256 **`e742193c67515cb9bb38f1fc801aec21a5e1f72c495e042b137d634fb465b5ad`**。它定义`Functionality<T>`、`Marker`，两个Functionality impl，其中一个有`T: Marker`前提；`Elem`没有实现Marker，源码注释给出可取消注释的impl，末尾调用`v.func(&v)`。这些声明与注释都可核，但本轮未编译，不把注释当本环境成功/失败结果。

[proof_tree/mod.rs][argus-model] 明确区分Goal、Candidate、Result；[serialize.rs L167–205][argus-serialize] 给目标接候选，再从候选接nested goals。它还在[L224–243][argus-filter]划分成功/非成功并过滤error sources，故不能称未经选择的全部solver事件。候选impl是证明途径，**不是执行过的函数、观察到的对象值或调用顺序**。

| 原始状态/缺失 | 固定源码含义 | 不可简化 |
| --- | --- | --- |
| `yes` | 确定成立 | 不是程序已运行或测试pass |
| `no` | NoSolution | 不是任意runtime异常 |
| `maybe-overflow` | 求解可能溢出/资源限制 | 不能改写为no |
| `maybe-ambiguity` | rustc无法决定 | 不能改写为no或yes |
| Candidate的直接result为undefined | [TreeInfo nodeResult][argus-node-result] 对Candidate不返回Goal结果 | 字段不适用/未给，不等于solver maybe-ambiguity |

四状态映射在[types.rs L427–454][argus-result]及[Node提示][argus-node-ui]可互核；展开动作在[Directory.tsx][argus-directory]只是读取已加载topology。[TopDown L17–39][argus-sort] 将no/overflow/ambiguity等优先排序，是展示顺序，不可转为Timeline或执行Sequence。

**关键停止证据**：未找到此fixture对应已提交序列化树/精确状态golden。[obligations.rs][argus-test]及[test_utils][argus-test-util]检查必要obligation可找到树；[stabililty.rs][argus-stable]对同输入重复检查hash一致。二者都不约束一个作者手画树的具体predicate、节点状态和拓扑。不能用源码推理补一份“Argus真实输出”，或将注释替换成solver成功标签。

Argus虽有完整MIT和完整源码输入，本轮仍不足以制作声称消费上游结果的原生产物。最多可以写注明“按源码整理、未执行”的约束表；在没有现成Archify阅读任务前，不以可写表为理由另开内容分支，更不增proof viewer/实时编译器。

## 与现有Archify与报告的重复边界

| 已有能力或研究 | 本轮剩余差异/限制 |
| --- | --- |
| dev10b [Class schema][archify-class]已有dependency/association/inheritance/realization/composition/aggregation | 足够画作者已核实的关系；属性类型提及A不自动证明UML composition所有权，也不能把extends/implements/type-reference共用一个箭头含义 |
| [Tree/Explainer/SourceCards][archify-schemas]与已合#1102 explanation/drilldown | 可组织类型展开或候选前提并指向固定来源；没有证明checker→图的通用映射所需数据。引用循环/重用需明确，不能无限展开或复制成多个真实对象 |
| grammar-reading | 已区分推导树、冲突后缀与解析结果；类型约束不是语法推导树，不能因为都叫derivation就共用事实合同。新增来源不意味着需要新增renderer |
| symbol-evidence/code-maps | 已区分语法命中、符号解析和实际执行；本轮补的是type reference/solver candidate具体例子，不重做symbol index/call graph |
| native-code / retained-size / data-layout / Copy identity | retained bytes、offset、对象引用、编译时类型是不同观察量，不能由一种图推其他量；现有实验不因换语言失效，也不复制一次值图 |
| PR1103 Atlas | 模块/文件/函数及依赖/findings，不提供类型推导证据；无需把缺少solver看作Atlas缺陷，也不为类型图另建repository平台 |

## 结论与后续门槛

**0项新实施推荐，保留三条具体审阅要求**：①类型展开的回指/深度上限与运行时对象循环分开；②Goal、Candidate、结果及字段不适用分开；③继承、属性类型引用、所有权和求解耗时分开。它们在现有原生图/表/SourceCards上能写清楚，不需要先扩schema、类型检查器或状态分类框架。

如果将来有读者拿一份完整类型/证明输出无法解释某条边，最低成本先是固定该完整输入、编译器/工具版本与配置，附上游状态oracle，用既有Explainer仅回答那条边。对所选Argus例，本轮缺对应输出；对ts-type-explorer，许可范围和baseline规范化不能省略。当前没有实际读图失败或收益对照，因此不为了“类型也能画”做converter或换例子的内容分支。

本轮按CONTRIBUTING的prose影响核链接、来源、摘要与重复边界，不跑产品测试或上游工具。公开fixture/期望属于上游提交，不是本轮实跑；没有新图、截图、用户效益测量或运行值观察。只新增本报告，不改README/索引/其他报告/产品，不commit/push。

[explorer]: https://github.com/mxsdev/ts-type-explorer/tree/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4
[argus]: https://github.com/cognitive-engineering-lab/argus/tree/8d41733c313e97f87c6bf390ec59f2701e4e41d9
[visualizer]: https://github.com/51p50x/ts-visualizer/tree/2f47ed39c986e4a87b9109e2046e22b19adb7e74
[aqua]: https://github.com/cognitive-engineering-lab/aquascope/tree/f2d0a06034b86765a91f10b7c8e40ec31ecb87a6
[rustviz]: https://github.com/rustviz/rustviz/tree/dfd4d0e7a4a3b4beddac50a85902a38af85230f0
[analyze]: https://github.com/microsoft/typescript-analyze-trace/tree/534b0a1d225d25a56cd71c363490bcc349580c59
[explorer-package]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/package.json
[explorer-license]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/typescript-explorer-vscode/LICENSE
[explorer-tree]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/src/tree.ts
[explorer-fixture]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/tests/cases/recursive.ts
[explorer-baseline]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/tests/baselines/reference/recursive.tree
[explorer-localized]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/tests/baselines/reference/recursive.localized.tree
[explorer-seen]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/src/tree.ts#L195-L232
[explorer-depth]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/src/tree.ts#L133-L141
[explorer-id]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/src/util.ts#L306-L317
[explorer-normalize]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/tests/lib/normalize.ts
[explorer-resolve]: https://github.com/mxsdev/ts-type-explorer/blob/3b0bb21f574ebb0d70aac84c37e81e1df0b1d9e4/packages/api/src/resolveTree.ts#L194-L238
[argus-license]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/LICENSE
[argus-serialize]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/src/proof_tree/serialize.rs#L167-L205
[argus-filter]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/src/proof_tree/serialize.rs#L224-L243
[argus-result]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/src/types.rs#L427-L454
[argus-fixture]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/tests/contained/missing-marker.test
[argus-model]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/src/proof_tree/mod.rs
[argus-node-result]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/ide/packages/common/src/TreeInfo.ts#L318-L334
[argus-node-ui]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/ide/packages/panoptes/src/TreeView/Node.tsx#L20-L45
[argus-directory]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/ide/packages/panoptes/src/TreeView/Directory.tsx
[argus-sort]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/ide/packages/panoptes/src/TreeView/TopDown.tsx#L17-L39
[argus-test]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/tests/obligations.rs#L5-L31
[argus-test-util]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/src/test_utils.rs#L81-L109
[argus-stable]: https://github.com/cognitive-engineering-lab/argus/blob/8d41733c313e97f87c6bf390ec59f2701e4e41d9/crates/argus/tests/stabililty.rs#L19-L45
[visualizer-license]: https://github.com/51p50x/ts-visualizer/blob/2f47ed39c986e4a87b9109e2046e22b19adb7e74/LICENSE
[visualizer-model]: https://github.com/51p50x/ts-visualizer/blob/2f47ed39c986e4a87b9109e2046e22b19adb7e74/src/model/graphModel.ts
[visualizer-composition]: https://github.com/51p50x/ts-visualizer/blob/2f47ed39c986e4a87b9109e2046e22b19adb7e74/src/resolver/compositionResolver.ts
[visualizer-fixture]: https://github.com/51p50x/ts-visualizer/blob/2f47ed39c986e4a87b9109e2046e22b19adb7e74/test/fixtures/deepInheritance.ts
[aqua-license]: https://github.com/cognitive-engineering-lab/aquascope/blob/f2d0a06034b86765a91f10b7c8e40ec31ecb87a6/LICENSE
[aqua-permissions]: https://github.com/cognitive-engineering-lab/aquascope/blob/f2d0a06034b86765a91f10b7c8e40ec31ecb87a6/crates/aquascope/src/analysis/permissions/output.rs
[aqua-fixture]: https://github.com/cognitive-engineering-lab/aquascope/blob/f2d0a06034b86765a91f10b7c8e40ec31ecb87a6/crates/aquascope/tests/boundaries/moved_0.test
[rustviz-license]: https://github.com/rustviz/rustviz/blob/dfd4d0e7a4a3b4beddac50a85902a38af85230f0/LICENSE
[rustviz-data]: https://github.com/rustviz/rustviz/blob/dfd4d0e7a4a3b4beddac50a85902a38af85230f0/rustviz-plugin/src/svg_generator/data.rs
[rustviz-example]: https://github.com/rustviz/rustviz/blob/dfd4d0e7a4a3b4beddac50a85902a38af85230f0/mdbook-rustviz/test-book/book/borrowing.html
[analyze-license]: https://github.com/microsoft/typescript-analyze-trace/blob/534b0a1d225d25a56cd71c363490bcc349580c59/LICENSE
[analyze-tree]: https://github.com/microsoft/typescript-analyze-trace/blob/534b0a1d225d25a56cd71c363490bcc349580c59/src/get-type-tree.ts
[analyze-core]: https://github.com/microsoft/typescript-analyze-trace/blob/534b0a1d225d25a56cd71c363490bcc349580c59/src/analyze-trace-file.ts
[analyze-readme]: https://github.com/microsoft/typescript-analyze-trace/blob/534b0a1d225d25a56cd71c363490bcc349580c59/README.md
[archify]: https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0
[pr1103]: https://github.com/tt-a1i/archify/pull/1103
[archify-class]: https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/class.schema.json#L210-L244
[archify-schemas]: https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas
