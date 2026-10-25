# SBOM 与锁文件：组件记录、包坐标、出现位置和关系路径

2026-10-25。只读调查；先读取 hub 当时全部 27 份 scouts 的结论与来源清单，检索 SBOM/CycloneDX/SPDX/lockfile/purl/bom-ref 排重，不设 star 门槛。下列六个来源此前未作为项目研究列入。固定 GitHub commit、许可正文、相关实现及已提交 fixture；没有运行 scanner、包管理器、viewer、测试或上游代码，没有安装依赖、上传 BOM、连接漏洞服务、生成图片或执行被分析的程序。本文件是唯一新增报告。上游文件名中的 valid 表示它在上游测试中的角色，不代表本次调用 schema validator 通过。

**结论：本轮推荐新增实现为 0。** 可保留的审阅机制是把“BOM 元素身份、包坐标、出现位置、关系类型、路径条数”分开核对。官方 fixture 足以说明这些层次，但没有取得自然交接任务中“同 purl、不同 bom-ref 应如何阅读”的明确受损结果。单独缺边账目、普通 package tree 或版本重复列表都与已做 dependency-map 重复；不为凑一个实验制造同坐标的双组件记录，不引入 SBOM/lockfile importer。

## 去重及现有能力边界

`code-maps.md` / dependency-map 已消费成熟 producer 的局部依赖报告，保留未解析、过滤与视图外账目；不能把 npm package 改画成节点就称新价值。`build-infra-smalltools.md` / plan-actions 已区分声明计划与实际执行；本轮不能以 lockfile 预期解析布局冒充 installed tree。`graph-exchange-smalltools.md` 已要求关系数量、身份、类型分别核对；`symbol-evidence`、`lineage-evidence` 已覆盖来源、未知与实际执行的区别。本轮对组件身份的细化仅作为以后阅读约定，不新增一套图形产品。

Archify 产品对照继续固定 [`82c7e0f089a02a4d514714adf37dc2061682da5f`](https://github.com/tt-a1i/archify/tree/82c7e0f089a02a4d514714adf37dc2061682da5f)。本轮没有发现必须改 renderer、schema、Viewer 或公共 CLI 的缺口；现有带源码引用的 Explainer 表格即可承载下面的事实。

## 六个来源、固定版本及许可

下表“输出/机制”为本次读源码和 fixture 所能支持的事实，不是本次运行或安全验收。规范仓库是语义参照，不是建议安装的依赖；工具的线上能力宣传不作为已核实的离线/隐私合同。

| 来源 / 固定 revision | 实际许可 | 选定机制与证据 | 判断 |
| --- | --- | --- | --- |
| [CycloneDX/specification](https://github.com/CycloneDX/specification/tree/ad83dae28b236b8760286399da4daba77592de86) · `ad83dae28b236b8760286399da4daba77592de86` | [Apache-2.0](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/LICENSE) | [1.6 JSON schema](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/schema/bom-1.6.schema.json) 定义 bom-ref、purl、dependencies/provides、evidence.occurrences；有实际 dependency 与 evidence golden。 | 最可靠的身份/关系语义来源。JSON schema-valid 不是 BOM 真实、完整或生成正确的保证。只读取稳定 1.6 所选字段，不由 HEAD 推断全部新版。 |
| [spdx/spdx-spec](https://github.com/spdx/spdx-spec/tree/ab5896386a867afe385173b9a3f46cf581909a9a) · `ab5896386a867afe385173b9a3f46cf581909a9a` | [LICENSE](https://github.com/spdx/spdx-spec/blob/ab5896386a867afe385173b9a3f46cf581909a9a/LICENSE) 明确规范为 Community-Spec-1.0，特定历史材料为 CC-BY-3.0；`bin/pull-license-list.py` 单独 MIT。API 为 NOASSERTION 不能覆盖此分项。 | [2.3 schema](https://github.com/spdx/spdx-spec/blob/ab5896386a867afe385173b9a3f46cf581909a9a/schemas/spdx-schema-2-3.json) 分 SPDXID、documentNamespace、versionInfo、externalRefs 和有类型的 relationships。 | SPDXID 是元素引用，不等于 package coordinate 或现场实例。规范材料不能笼统改标为 MIT 软件。只核对 2.3，不将其模型套用 3.x JSON-LD。 |
| [hristiy4n/bom-view](https://github.com/hristiy4n/bom-view/tree/9012c3bf0e43e0f8cd4fb705e3fbc2c137fe5d21) · `9012c3bf0e43e0f8cd4fb705e3fbc2c137fe5d21` | [MIT 正文](https://github.com/hristiy4n/bom-view/blob/9012c3bf0e43e0f8cd4fb705e3fbc2c137fe5d21/LICENSE) | [parser.ts](https://github.com/hristiy4n/bom-view/blob/9012c3bf0e43e0f8cd4fb705e3fbc2c137fe5d21/src/lib/sbom/parser.ts) 用 bom-ref/SPDXID 查表，package id 附 sourceName；[DependencyTree](https://github.com/hristiy4n/bom-view/blob/9012c3bf0e43e0f8cd4fb705e3fbc2c137fe5d21/src/components/DependencyTree.tsx) 投影仅 name/version/children。 | 图投影丢弃引用键和关系类型；无记录与空数组都成为 children=[]。不据此声称整个 app 错误、已发生事故或作者不应简化 UI；具体边界见后文。 |
| [NavneetHegde/SBOMViewer](https://github.com/NavneetHegde/SBOMViewer/tree/37e3c9a270264cb751ec874ba656124f03fe46be) · `37e3c9a270264cb751ec874ba656124f03fe46be` | [MIT 正文](https://github.com/NavneetHegde/SBOMViewer/blob/37e3c9a270264cb751ec874ba656124f03fe46be/LICENSE) | [ComponentRowExtractor](https://github.com/NavneetHegde/SBOMViewer/blob/37e3c9a270264cb751ec874ba656124f03fe46be/src/SBOMViewer.Blazor/Services/ComponentRowExtractor.cs) 枚举 components/packages→name/version/type/license/purl 行；[CycloneDX 1.6 full sample](https://github.com/NavneetHegde/SBOMViewer/blob/37e3c9a270264cb751ec874ba656124f03fe46be/samples/cyclonedx-1.6-full.json) 有根、八个包、typed refs 和显式 leaf。 | 表格行不是无损组件身份表示；此 extractor 没保存 bom-ref/SPDXID，不代表整个应用所有视图均丢失它。fixture 是上游演示 BOM，不能称真实生产扫描。 |
| [moritzmyrz/tracepack](https://github.com/moritzmyrz/tracepack/tree/81f6741c2287f6b99f79c9e8171391633c85b341) · `81f6741c2287f6b99f79c9e8171391633c85b341` | [MIT 正文](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/LICENSE) | [lockfile resolver](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/src/resolvers/lockfile.ts) 以 normalized location 构建 id，version 可 null，edge 保留 specifier/type；[resolver tests](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/test/resolvers.test.ts) 分 lockfile、manifest、installed、workspace，并测 hoisted multipath。 | 最有实物的 location-vs-path 参照。lockfile source 不可改称已安装；installed Arborist 测试存在也不等于本次跑过。拒绝重做 package graph adapter。 |
| [compulim/lock-walker](https://github.com/compulim/lock-walker/tree/7b7faa4a58a37cc2b8f051f0c91f0637245bd635) · `7b7faa4a58a37cc2b8f051f0c91f0637245bd635` | 当前 tree 未见 LICENSE/COPYING；[package.json](https://github.com/compulim/lock-walker/blob/7b7faa4a58a37cc2b8f051f0c91f0637245bd635/package.json) 无 license 字段。**仅公开源码观察，未核实复用许可。** | [Visualizer.js](https://github.com/compulim/lock-walker/blob/7b7faa4a58a37cc2b8f051f0c91f0637245bd635/src/ui/Visualizer.js) 把旧 package-lock dependencies 递归展平，按 name@version 建键，并按 requires 字符串建目标。 | 坐标 key 会失去 location 区别；requires 字符串也不能自动解释为 resolved version。只观察历史设计，不复制/分发实现，不为它新增旧 lockfile 兼容层。 |

## 1. 实际 fixture：同一组件记录可以有多个出现位置

CycloneDX 的 [valid-evidence-1.6.json](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/tools/src/test/resources/1.6/valid-evidence-1.6.json) 中，findbugs-project 3.0.0 只有一个 component 对象及一个 Maven purl，`evidence.occurrences` 却有两项，各有自己的 bom-ref 和不同 location。还有 identity 的 field/method/confidence：这些是 producer 声明的证据属性，不是本轮对准确率的测量。fixture 内 LGPL 等 licenses 字段描述 FindBugs 组件；该 fixture 文件所属规范仓库采用 Apache-2.0，二者不能混用。

[Schema L877–881](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/schema/bom-1.6.schema.json#L877-L881) 将 component bom-ref 的唯一性限制在 BOM 内；[L971–975](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/schema/bom-1.6.schema.json#L971-L975) 把 purl 作为 asserted component identity；[L2108–2125](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/schema/bom-1.6.schema.json#L2108-L2125) 单列 occurrences/individual instances/location。以上精确 schema 行由同轮协调 agent 独立读取核对；本 agent 直接读取了此 golden。

因此不能将“component row 数”“purl 去重数”“occurrences 数”混用。更不能把两条 occurrence location 声明直接说成当前机器两份安装已存在：fixture 本身是示例，没有本轮 filesystem inventory、时间绑定或现场验证。反过来，同 purl 的两个 bom-ref 也不能自动合并；如果真实输入出现这种情况，应先保留原引用、来源文档与 occurrence 证据，再决定是 producer 重复、不同记录还是有独立实例。**本文没有构造双 bom-ref 输入，也没有把公开 issue 中可疑 producer duplicate 当合法安装事实。**

SPDX 的 [schema L233–235](https://github.com/spdx/spdx-spec/blob/ab5896386a867afe385173b9a3f46cf581909a9a/schemas/spdx-schema-2-3.json#L233-L235) 同样给元素标识；[L215–218](https://github.com/spdx/spdx-spec/blob/ab5896386a867afe385173b9a3f46cf581909a9a/schemas/spdx-schema-2-3.json#L215-L218) 用 documentNamespace 解决跨文档引用。不要跨文件仅按 SPDXRef-... 字符串或 name/version 合并。versionInfo 也不是文档版本或现场路径。

## 2. 实际 fixture：两条反向链可以抵达同一个 location

Tracepack 的 [lockfile-hoisted-multipath/package-lock.json](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/test/fixtures/lockfile-hoisted-multipath/package-lock.json) 声明 alpha 与 beta→gamma 都引用 shared，所有解析均可抵达同一个 `node_modules/shared` entry。[resolvers.test.ts](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/test/resolvers.test.ts) 明确期望两个 reverse path 的 matchId 相同，nodeIds 分别经过 alpha 与 beta/gamma。这是**两个关系路径、一个锁文件 location 记录**，不是两份 shared 的安装现场，也不是两个运行调用栈。

另一个 [lockfile-duplicates fixture](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/test/fixtures/lockfile-duplicates/package-lock.json) 才有两个 nested shared entries，分别 version 1.0.0 与 2.0.0；测试断言 occurrenceCount=2、versionCount=2。把它和 hoisted fixture 并读可防止用路径条数推实例数，但再画一棵树并不新增 Archify 能力。

[lockfile.ts](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/src/resolvers/lockfile.ts) 的 edge 来自 dependency 声明加其 location 解析逻辑；找不到目标时记录 warning 并跳过，而不是插入“不存在依赖”事实。支持 v2/v3、拒绝 v1；link targets 与 normal entries 分开处理。[shared.ts](https://github.com/moritzmyrz/tracepack/blob/81f6741c2287f6b99f79c9e8171391633c85b341/src/resolvers/shared.ts) 把 source/warnings 放在 meta 中。读者需要知道“源是 lockfile/manifest/installed”的差异；不同 source 的同名 node 不能无条件跨快照对齐。

同轮协调 agent 另核对官方 [npm package-lock 文档，固定 311ff5effbb1f96181c89a1ce6ebfe0c369e1ec1](https://github.com/npm/cli/blob/311ff5effbb1f96181c89a1ce6ebfe0c369e1ec1/docs/lib/content/configuring-npm/package-lock-json.md#L87-L106)：packages 键是 relative location，link 指向另一 target；[package-spec alias 段](https://github.com/npm/cli/blob/311ff5effbb1f96181c89a1ce6ebfe0c369e1ec1/docs/lib/content/using-npm/package-spec.md#L31-L43) 区分 node_modules alias 与 registry package 名。此为规范补充，不另计小工具；[LICENSE](https://github.com/npm/cli/blob/311ff5effbb1f96181c89a1ce6ebfe0c369e1ec1/LICENSE) 对 npm app 为 Artistic-2.0，依赖各自另许可。本文未执行 npm 安装或 Arborist。

## 3. 缺边与空数组不同，但这不是足够的新实验

官方 [valid-dependency-1.6.json](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/tools/src/test/resources/1.6/valid-dependency-1.6.json) 提供一个无需自造的对照：library-a 有明确 `dependsOn: []`；library-b 明确引用 library-c；library-c 存在于 components，但没有自己的 dependency entry。

[Schema L1833–1865](https://github.com/CycloneDX/specification/blob/ad83dae28b236b8760286399da4daba77592de86/schema/bom-1.6.schema.json#L1833-L1865) 说明缺 entry 可能是依赖未知，不能按 dependency-free 解释；`provides` 表示提供 capability/实现，不自动意味着使用它。由提供边推 consumer 使用边属于新增推断。显式空数组也只表示该 BOM 的 dependency 声明，不证明运行中没有动态装载、外部服务或其他未覆盖关系。

bom-view 的 parser 对缺 entry 使用 `dependencyMap.get(bomRef) || []`，其 tree 仅保存 name/version/children；因此就这条代码投影而言，a 与 c 都会成为无 children 的叶。本文没有执行该 app，也不据静态代码宣布整款工具存在利用漏洞或不适用所有场景。此例说明分享图应保留原始 entry 存在性和覆盖来源，而非加一条“未知依赖”虚构边。既有 dependency-map 已有未解析/覆盖账目，单为这种区别再加 converter 不值得。

SPDX [relationships schema](https://github.com/spdx/spdx-spec/blob/ab5896386a867afe385173b9a3f46cf581909a9a/schemas/spdx-schema-2-3.json#L710-L734) 有显式 source/related element/type，其中 CONTAINS、DEPENDS_ON、DEPENDENCY_OF、STATIC_LINK 等不是可互换的普通箭头。bom-view 把 CONTAINS 与 DEPENDS_ON 同向放入一个 children map、将 DEPENDENCY_OF 反向后也放进去；原始类型随后不再存在于 tree 节点。可以借它提醒“缩成树会有损”，不能从 containment 推 runtime call。

## 拒绝新增实现的理由

目前拿到的都是上游演示/测试输入，不是实际用户提交给 Archify 的包交接问题。官方 occurrence golden 和 tracepack multipath golden 能支持准确的身份说明，却没有证明当前 Archify 的关系标签、源码卡与表格不足以交付。检索中的 duplicate-component issue 也可能是 producer 异常，不能借它声称两个同坐标条目就是两个真实安装实例。

不推荐 SBOM aggregator、cross-document identity merger、PURL canonicalizer、扫描器、版本/漏洞判断器、lockfile resolver、ordinary package tree 或新的依赖图控件。SBOM 可以有 vulnerability/callstack 字段，但仅 components/dependencies 不构成漏洞存在、可达利用或运行调用证据；本轮未核安全评分、外部服务准确性或任何现场。

若以后出现自然任务，先用现有 Explainer 回答一个可检验问题：**某两条关系到底引用同一文档元素，还是仅名称/坐标相同；实例位置的证据是否存在？** 必须同时保留输入 revision/hash、原始 refs、relationship type、source/coverage 与有无 occurrence。只有这一步实际减少误读且原界面无法完成，才讨论适配。当前无需为数量新增实验；推荐数量为 0。
