# 样式阅读第九轮：选择器贡献、变量来源与布局适用性

2026-10-25。**本轮0项实施推荐。** 七个新来源中，深入specificity的贡献片段映射和css-noop-checker的上下文解释规则。它们分别回答“哪些selector片段增加specificity”和“当前样式组合是否符合某条no-op规则”，都不单独回答“这个DOM最终值来自哪条声明”。现有Explainer/SourceCards与已完成preview修复的源码、computed-color账目足够承载本轮说明，未发现值得新建CSS引擎/通用inspector的独立任务。

只读固定源码和完整公开fixture/期望；未运行上游、parser、扩展、浏览器、CSS扫描器或测试，未安装工具。文中上游测试是提交中的断言，不是本轮实跑结果。

## 去重、真实问题和比较基线

对开始时hub **52份 scouts** 的仓库引用排重；下列七项目此前未列入。多个specificity项目是同一机制家族，不因仓库数就称四种新需求，不按stars选择。已有layout-reading关于路由/标签几何、authoring-diagnostics关于错误位置、SourceCard/源码导览等仍属重复边界。

Archify固定[dev `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`][archify]，已合#1102。当前[#1103][pr1103]读取head `f0be206acbc90eb7c6c6b636030e3eb28963d284`、OPEN，Atlas按模块/文件/函数依赖和finding交接Classic；它不是CSS cascade追踪器，不能因没有这类能力就声称存在产品缺陷。

真实任务边界来自已完成[Preview dashed ink `ca4baa1d739b1a2e2c8b863a517383147952620d`][preview]：相同Plan-actions关系在原生图可读，在Explainer浅色预览中过淡。修复已通过三个针对label/path/marker的CSS映射，让关系阅读墨色进入正确属性，同时保留节点边框、inline优先级等既有行为。这是已完成实验修复，不在本轮重报或重做；其新dev/旧历史证据分别保留，不把实验分支说成已合dev。以下只用它判断哪类解释能辅助读者，**不重复验证该修复或沿用为新工具效果**。

## 七个固定新来源

| 来源 / SHA | 许可、实际实现与公开材料 | 对本任务的解释力与取舍 |
| --- | --- | --- |
| [keeganstreet/specificity][specificity] `cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b` | [完整MIT][specificity-license]；[calculate.ts][specificity-source]输出A/B/C及贡献源范围；完整[calculate.test][specificity-test]和[details test][specificity-details] | 深读。把数字解释回selector片段，比只显示分数更可核；但不匹配DOM、不解析winner/变量值或布局。现有源码卡+表已能说明，不引入parser |
| [bramus/specificity][bramus] `fb7646605b67558539b243f9e311d414911a4e18` | [完整MIT][bramus-license]；[calculate][bramus-source]、[compare][bramus-compare]按a/b/c逐项比较 | 与前者同家族，不另立功能；tuple比较不是完整cascade排序。工具库可独立使用不等于Archify需要集成 |
| [pocketjoso/specificity-graph][graph] `a00621606d4a48810128cfe20ff0b73b384887f0` | [完整MIT][graph-license]；[generateCssData.js][graph-source]和[lineChart][graph-view]；完整[test.css][graph-fixture] | 将stylesheet位置与selector分数对应，hover读具体selector。先beautify再取line，故line是处理后位置，不可当原输入行号。早期标量分值也不应替代tuple比较或winner判断 |
| [isellsoap/specificity-visualizer][visualizer] `470c5b8c806b03df932c3d0f93aee335b242eb35` | [完整MIT][visualizer-license]；[charts/index.js][visualizer-chart]用scatter/分类轴/tooltip展示selector；[main][visualizer-source]整理输入 | 可缩放看分布，仍是stylesheet统计，不是选中DOM的规则链。Highcharts等依赖许可需另按组件核，不能把仓库MIT覆盖整个分发栈。不因新图表接入Chart框架 |
| [projectwallace/css-analyzer][wallace] `5e4c1ed12f2f7649f392df2e518c403bcf91d5d3` | [完整MIT][wallace-license]；[DefinedUsed][wallace-source]与[完整test][wallace-test]记录defined/used/unused/unknown | 集合关系有明确边界，适合说明“输入中提及/定义”不同于“此DOM实际生效”。不能据静态unknown宣称运行变量必缺失，或据unused删除CSS |
| [CSSStats][cssstats] `1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5` | [完整MIT][cssstats-license]；[specificity mapping][cssstats-source]，完整[small.css][cssstats-fixture]及[small.json结果][cssstats-result]、[custom properties test][cssstats-test] | 提供声明/属性/selector统计，fixture与输出可复核；没有DOM匹配/级联环境，不是computed style报告。与分布图同类，不新增CSS报告adapter |
| [css-noop-checker][noop] `b921e58c46d2ce7d054dd2429ae7076cf28e1a91` | [完整MIT][noop-license]；[eval script][noop-eval]读取computed/context，[rules engine][noop-engine]应用规则；完整[examples/test.html][noop-fixture] | 深读。why/suggestion与匹配条件并列值得注意；未追踪winning declaration，未做布局反事实。测试只证明规则告警预期，不证明完整CSS因果或任意可删声明 |

## 深读一：让specificity的每一份贡献回到源片段

[specificity calculate.ts L12–35][specificity-increment]每次增加A/B/C时，同时记录该AST节点的start/end line/column；[L60–101][specificity-pseudo]对`:is/:not/:has`取参数最大贡献、`:where`不增加贡献、`:nth-child`将自身与of-selector贡献分别处理。`calculateWithDetails`启用parser位置，再返回`total/contributingParts`。这里的对象是**selector语法**，没有HTML元素、origin、layer、importance、media、变量或布局输入。

完整[calculateWithDetails.test.ts][specificity-details] **2673 bytes**，SHA256 **`d4065f5eb029ef9e78f5b17edafba5121ab274d9f1a77293ad2f0608cb2830cd`**；配对完整[calculate.test.ts][specificity-test] **6490 bytes**，SHA256 `1f052e85bbdf3dfb02418a62cb4bdd9b4dbd0259ff1a68058560bc22ce7410a2`。它们包含以下完整selector输入/期望：

| selector | tuple测试期望 | details测试指回的贡献文本 |
| --- | --- | --- |
| `:is(em, #foo)` | A1/B0/C0 | A=`#foo`，不把em也加上 |
| `.qux:where(em, #foo#bar#baz)` | A0/B1/C0 | 仅B=`.qux`；视觉上有三个ID也不增加贡献 |
| `:nth-child(even of li, .item)` | A0/B2/C0 | 自身伪类B + `.item`的B |
| `:not(em, strong#foo)` | A1/B0/C1 | `strong`的C与`#foo`的A |

details测试用原selector的`substring(start.column-1,end.column-1)`逐项核文本，因此不仅冻结一个分数，也核每个位置到底指了哪个片段。它不等于多语言通用坐标编码保证，更不是DOM元素匹配证据。本轮未运行这些测试；表是上游断言，不是本地calculator输出。

这种**总量→贡献片段**解释可供代码审阅借鉴；但具体到已完成preview修复，关键证据已经是固定规则/变量映射加实际computed颜色与同源图。加一个分数图不能证明颜色更可读，也不能验证inline样式、状态、节点遮罩或所有diagram modes。因此不为三映射再建specificity转换器。

另一个负面细节：[pocketjoso generateCssData][graph-source]先beautify输入，再读取parser行号；还把四位specificity按1000/100/10/1加权成一个标量。这个数是可视化指标，不应一般化为任意长度元组的精确比较；足够多低位分量会进位，不能用它替代[bramus的逐分量比较][bramus-compare]。没有证据表明图上的尖峰就是某个真实元素上的CSS冲突或性能瓶颈。

## 深读二：声明有效、computed值存在与布局适用不是一回事

css-noop-checker的[build-eval-script.ts L7–47][noop-eval]从DevTools当前元素读取`getComputedStyle`、父级上下文及少量inline属性；[engine L55–58][noop-engine]对规则flatMap。[inline-no-dimensions L12–39][noop-rule]以display=inline、非replaced、width/height非auto等条件给warning，由模板把当前值、适用条件和建议并列；[WarningCard][noop-card]分开呈现title/ruleId/details/suggestion。

完整上游 [examples/test.html][noop-fixture] **163249 bytes**，SHA256 **`072c55ecfcdedf42bb72f23eab79bb3b7d703768b831f2075fa1bd3127662117`**。它是有其它样式与多个case的整页输入，不把下面两段摘录称独立完整环境：

| 原完整fixture中的case | 上游预期 | 这项期望实际保护什么 |
| --- | --- | --- |
| L1146–1149，span只有`width:200px` | expect-warn，rule为inline-no-dimensions | 该样式/上下文匹配规则 |
| L1179–1182，span为`display:inline-block;width:200px` | expect-ok | 同一规则在此上下文不告警 |

消费整页的[e2e L42–98][noop-test]读取真实computed styles后调用analyzeElement，再筛ruleId，要求warn数量>0或0。它**没有**断言目标bounding box、截图、移除width后的几何差异，亦未冻结完整why文案。[unit test][noop-unit]更窄：mock inline/width=200px，检查warning数量、id和title含width；不冒充浏览器实测。本轮两套均未运行。

再看[positioned-no-float][noop-float]：因为absolute/fixed的computed float会变none，它额外检查inline float，并明说不检查stylesheet float。这不是winning declaration追踪；即便读到inline值，也没有因此证明复杂!important/layer环境里该声明赢得层叠。**warning是适用条件规则的判断，不是一般CSS布局因果证据，无warning也不证明有效。**

“computed width文字为200px是否必然等于最终占宽200px”是可读的概念问题，但没有当前Archify自然失败要求做它，且不是preview颜色映射同一责任。既有Explainer可以并列值/上下文/规则解释；若真要声称视觉差，仍需独立几何与实际图片。本轮不引入规则引擎、扩展、MCP/server或DOM扫描器，也不为两case专开内容分支。

## 变量和cascade来源的明确证据层

[DefinedUsed][wallace-source]只是对名字做集合差；[test][wallace-test]完整输入`define('--foo');use('--foo');use('--baz')`期望unknown包含baz、unused为空。这是**输入分析范围内**的定义/使用，不是完整页面作用域、继承、var fallback路径或computed value证明。CSSStats自定义属性测试同理：字符串统计与声明集合不能代替当前DOM选中的规则链。

规范参考采用[CSS Cascade 5的2022-01-13 CR快照][cascade-spec]和[Variables 1的2022-06-16 CR快照][variables-spec]，不是笼统把最新草案当已实现保证。它们区分级联排序、继承、computed/used等值处理，以及自定义属性替换。selector specificity只是其中一环；即使某项tuple更高，仍需检查条件匹配、来源/重要性/层、以及最终属性是否适用，才能解释具体页面。这里不实现规范或宣称浏览器全部符合快照。

| 要回答的问题 | 足够的最小证据 | 本轮工具不能替代的部分 |
| --- | --- | --- |
| 某selector分数来自哪里 | 原selector+精确贡献范围/tuple | 不证明匹配哪个DOM |
| 某变量在输入中是否定义/提及 | 完整分析输入/范围+定义/使用集合 | 不证明页面继承/替换后实际值 |
| 这条声明为何胜出 | 固定DOM/伪状态/媒体环境+匹配声明的origin/layer/important/source order等 | 统计图与no-op规则未给完整winner链 |
| 值是否造成此布局/视觉差 | 实际computed/used/几何及可比条件下的观察 | 仅有源码数字、tuple或warning不够 |

## 当前Archify责任与采用结论

- dev10b的[Explainer/SourceCard][archify-reader]已能把固定CSS片段、条件和观察表放近；#1102已有解释/下钻。不是缺少新的可点击source inspector。
- 既有Preview dashed ink已经有完整同输入对照、三处映射、颜色/遮罩观察、inline保留边界和root实际图片。用本轮工具再报告“虚线不清楚”会重复已完成工作；计算一个高specificity值也不能替代这些证据。
- layout-reading已要求关系/标签/几何分开、不能靠隐藏事实“清爽”；本轮不再提出全局布局引擎。Atlas PR1103不负责DOM样式来源，不构成需要扩Atlas的理由。

**0项新实施推荐。** 可迁移的写法是“结果旁给贡献位置/适用条件/缺失边界”，现有表/SourceCards足够。只有将来确有读者无法从一份固定样式证据辨认某条winner，且现有说明仍迫使其手动跨文件找规则，才考虑一页窄解释内容；优先保留原DOM/环境/原始观察，不自动猜cascade或造全格式CSS parser。本轮没有这种新增任务，也无效率/读者正确率证据。

按CONTRIBUTING的prose影响只核来源、许可、摘要、链接与重复边界，不运行renderer/fullsuite。所有fixture和expected来自上游已提交材料，未宣称当前环境通过。只新增本报告，不改README/索引/其他报告/产品，不commit/push。

[specificity]: https://github.com/keeganstreet/specificity/tree/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b
[bramus]: https://github.com/bramus/specificity/tree/fb7646605b67558539b243f9e311d414911a4e18
[graph]: https://github.com/pocketjoso/specificity-graph/tree/a00621606d4a48810128cfe20ff0b73b384887f0
[wallace]: https://github.com/projectwallace/css-analyzer/tree/5e4c1ed12f2f7649f392df2e518c403bcf91d5d3
[cssstats]: https://github.com/cssstats/cssstats/tree/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5
[noop]: https://github.com/purupurupu/css-noop-checker/tree/b921e58c46d2ce7d054dd2429ae7076cf28e1a91
[visualizer]: https://github.com/isellsoap/specificity-visualizer/tree/470c5b8c806b03df932c3d0f93aee335b242eb35
[specificity-license]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/LICENSE
[specificity-source]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/src/calculate.ts
[specificity-test]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/src/calculate.test.ts
[specificity-details]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/src/calculateWithDetails.test.ts
[specificity-increment]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/src/calculate.ts#L12-L35
[specificity-pseudo]: https://github.com/keeganstreet/specificity/blob/cb7ebda2143e05a7a53b3b9970c8d65b4a34ab6b/src/calculate.ts#L60-L101
[bramus-license]: https://github.com/bramus/specificity/blob/fb7646605b67558539b243f9e311d414911a4e18/LICENSE
[bramus-source]: https://github.com/bramus/specificity/blob/fb7646605b67558539b243f9e311d414911a4e18/src/core/calculate.js
[bramus-compare]: https://github.com/bramus/specificity/blob/fb7646605b67558539b243f9e311d414911a4e18/src/util/compare.js
[graph-license]: https://github.com/pocketjoso/specificity-graph/blob/a00621606d4a48810128cfe20ff0b73b384887f0/LICENSE-MIT
[graph-source]: https://github.com/pocketjoso/specificity-graph/blob/a00621606d4a48810128cfe20ff0b73b384887f0/lib/generateCssData.js
[graph-view]: https://github.com/pocketjoso/specificity-graph/blob/a00621606d4a48810128cfe20ff0b73b384887f0/lib/lineChart.js
[graph-fixture]: https://github.com/pocketjoso/specificity-graph/blob/a00621606d4a48810128cfe20ff0b73b384887f0/test.css
[visualizer-license]: https://github.com/isellsoap/specificity-visualizer/blob/470c5b8c806b03df932c3d0f93aee335b242eb35/LICENSE.md
[visualizer-chart]: https://github.com/isellsoap/specificity-visualizer/blob/470c5b8c806b03df932c3d0f93aee335b242eb35/src/scripts/charts/index.js
[visualizer-source]: https://github.com/isellsoap/specificity-visualizer/blob/470c5b8c806b03df932c3d0f93aee335b242eb35/src/scripts/main.js
[wallace-license]: https://github.com/projectwallace/css-analyzer/blob/5e4c1ed12f2f7649f392df2e518c403bcf91d5d3/license
[wallace-source]: https://github.com/projectwallace/css-analyzer/blob/5e4c1ed12f2f7649f392df2e518c403bcf91d5d3/src/defined-used.ts
[wallace-test]: https://github.com/projectwallace/css-analyzer/blob/5e4c1ed12f2f7649f392df2e518c403bcf91d5d3/src/defined-used.test.ts
[cssstats-license]: https://github.com/cssstats/cssstats/blob/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5/license
[cssstats-source]: https://github.com/cssstats/cssstats/blob/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5/packages/cssstats/lib/get-specificity-values.js
[cssstats-fixture]: https://github.com/cssstats/cssstats/blob/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5/packages/cssstats/test/fixtures/small.css
[cssstats-result]: https://github.com/cssstats/cssstats/blob/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5/packages/cssstats/test/results/small.json
[cssstats-test]: https://github.com/cssstats/cssstats/blob/1bfbf3ae54ff8086cb068eecb5ce958a9509b1c5/packages/cssstats/test/custom-properties-test.js
[noop-license]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/LICENSE
[noop-eval]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/sidebar/hooks/build-eval-script.ts#L7-L47
[noop-engine]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/rules/engine.ts#L55-L58
[noop-fixture]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/examples/test.html
[noop-rule]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/rules/inline-no-dimensions.ts#L12-L39
[noop-card]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/sidebar/components/WarningCard.tsx#L7-L18
[noop-test]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/e2e/integration/rules-against-real-styles.test.ts#L42-L98
[noop-unit]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/rules/__tests__/inline-no-dimensions.test.ts
[noop-float]: https://github.com/purupurupu/css-noop-checker/blob/b921e58c46d2ce7d054dd2429ae7076cf28e1a91/src/rules/positioned-no-float.ts#L11-L32
[archify]: https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0
[archify-reader]: https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js
[pr1103]: https://github.com/tt-a1i/archify/pull/1103
[preview]: https://github.com/tt-a1i/archify/tree/ca4baa1d739b1a2e2c8b863a517383147952620d/experiments/preview-dashed-ink/refresh-dev-10b4
[cascade-spec]: https://www.w3.org/TR/2022/CR-css-cascade-5-20220113/#cascade-sort
[variables-spec]: https://www.w3.org/TR/2022/CR-css-variables-1-20220616/
