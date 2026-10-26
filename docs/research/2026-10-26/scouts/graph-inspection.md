# 图与关系检查：把“只知道关系含义”留作一个有界验证问题

2026-10-26，只读研究。**尚无已证实值得实施的新增功能；保留一个可在既有图上证伪的问题：读者知道关系含义、但不知道端点时，是否需要通过关系文本定位一条已有关系？** Finder 的节点索引确实不含边文本，但源码缺项本身不是用户痛点。现有小图上的肉眼查找、浏览器查找和 Passport 必须先参与对照；若它们已经足够，不做另一个 Finder 或关系过滤器。

本报告按 research 与 archify-review 的来源、价值/成本/影响要求完成。唯一仓库写入是本文件；原件完整下载到 checkout 外临时目录供静态读取。没有运行上游、安装、浏览器、renderer、测试、建 worktree、评论、PR、push 或产品实现。

## 排重及当前产品对照

当前研究 checkout HEAD 为 `714c1d3ca691499684a1e89842e3188f85bdabea`。实际读取 `2026-10-25/gallery/manifest.json`：49 项，13 product / 15 offline / 21 content；relation-return deferred 不计入。扫描全部 scouts，再复读 round22-graph-reading-interactions、graph-interaction-round14、round18-small-graph-interaction 与相关搜索命中。下列三个 owner/repo 在已有 scouts 未命中；这不是对全部互联网或历史别名的穷尽证明。广搜 GitHub/Web 未设 star 门槛，最多深读这三项；星数仅记本次 API 快照（0、1、4），不是筛选条件。

产品依据固定到当前 [`dev e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/tree/e837dc4cb83042d2b6c596e039692e25ec62c2da)，不是把本地实验的修改说成已集成能力：

- [`node-finder.js` L57–81](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/node-finder.js#L57-L81) 按 `[data-node-id]` 建索引，搜索 id、label、type、sublabel、context、tag、source 路径/行、节点 textContent、brand。它计数邻接，但没有将 `data-edge-label` 或 edge details 加入该搜索串。这里是静态合同核实，未在浏览器实际输入查询。
- [`focus.js`](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/focus.js) 已有节点 Passport 的 incoming/outgoing/self-loop 关系与精确关系记录、关系预览及 pinned 状态；已知一个端点时，先选节点读关系是现成路径。Relation reference 实验解决复制身份，不能混称关系检索。
- Route/Journey 解决已知端点间的 authored 方向路径；Reach 解决节点上下游；Semantic Lens 依据 node kind，不等同任意 edge label 文本检索。Finder canvas highlights、Finder context、Spatial focus、Delta values、Edge extras、Task occurrences 都不重复提案。也不新增 collapse/meta-edge、history、minimap 或常驻 inspector。

## 三个新来源：两个不同合同，一个早停排除

| 来源与固定 SHA | 完整输入 / 实际消费者 / 许可 | 判断 |
| --- | --- | --- |
| [lambdasistemi/graph-browser](https://github.com/lambdasistemi/graph-browser/tree/e39706a22f5b66a0f61b14e1408d97f5d727f61d) · `e39706a22f5b66a0f61b14e1408d97f5d727f61d` | 完整 [`example/data/graph.json`](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/example/data/graph.json) 为 6 节点 / 6 边的官方自解释示例；另读完整实际 [`data/rdf/graph.ttl`](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/data/rdf/graph.ttl)。完整 [`Search.purs`](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/src/Graph/Search.purs) + [`Viewer.purs`](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/src/Viewer.purs) 是实际搜索与点击 consumer，非仅 README 宣传。固定 recursive tree 没有 LICENSE/COPYING，README/package.json/spago.yaml 没找到许可声明；**许可未确认，不能复制其代码/fixture入产品**。 | 唯一保留的行为参照：输入边的语义文本，在结果中看 source → target 与 label，再读该关系。独立实现可讨论行为，不把无许可源码当可移植资产；示例本身不证明真实用户困难。 |
| [bizbrf/tangle](https://github.com/bizbrf/tangle/tree/4cdbfd9bb9a297640ef45a42c4e693634094abc8) · `4cdbfd9bb9a297640ef45a42c4e693634094abc8` | 完整 [`cross-sheet.xlsx`](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/tests/fixtures/cross-sheet.xlsx) 原件的 sheet1.xml 含 `Sheet2!A1`，完整 [`generate.ts`](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/tests/fixtures/generate.ts) 为构造输入；完整 [`GraphView.tsx`](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/src/components/Graph/GraphView.tsx)、[`EdgeKindFilterBar.tsx`](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/src/components/Graph/EdgeKindFilterBar.tsx)、graph.ts 与 graph-controls.spec.ts。实际 [`LICENSE`](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/LICENSE) 为 MIT，Chase Stoker 2025–2026。 | 有关系种类开关，但 search 仍是 node label/sheet/workbook/namedRange/table，**不是 edge 全文搜索**。Excel 跨表依赖问题是 README 的产品定位；已读 xlsx 是官方构造测试，不是客户工作簿。不为借一种过滤动作引入 Excel parser 或图导入。 |
| [jkomoros/adjacency-map](https://github.com/jkomoros/adjacency-map/tree/db69c133790381ce41da62ec79dec10797e12073) · `db69c133790381ce41da62ec79dec10797e12073` | 完整 [`LICENSE`](https://github.com/jkomoros/adjacency-map/blob/db69c133790381ce41da62ec79dec10797e12073/LICENSE) 为 Apache-2.0；完整 README 的 distinct-across-type / distinct-within-type 描述边是否合并；已读完整 graph.ts 和 [`stub.SAMPLE.ts`](https://github.com/jkomoros/adjacency-map/blob/db69c133790381ce41da62ec79dec10797e12073/data/stub.SAMPLE.ts)。 | stub 只有空 RawMapDefinition，不是可对比的完整非空关系输入；graph.ts 是拓扑计算而非上述显示动作 consumer。因此在证据不足处早停，不把 README 的显示选项算成已核阅读机制，也不补造输入凑实验。 |

### graph-browser 的确切行为及局限

[`Search.purs` L46–67](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/src/Graph/Search.purs#L46-L67) 对每条 edge 匹配 label、description、source label、target label，大小写无关的 contains；不是 regex 或结构化关系查询。注释称可搜 kind，但 edge 分支没有 kind，不能直接转述成 edge type 查询。

[`Viewer.purs` L293–350](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/src/Viewer.purs#L293-L350) 将节点与边结果放进同一列表，只取前 12 项；Search 模块先拼 nodeResults 再 edgeResults，所以节点命中多时会挤掉边结果。它并不是值得原样照搬的完整检索产品。

[`Viewer.purs` L638–677](https://github.com/lambdasistemi/graph-browser/blob/e39706a22f5b66a0f61b14e1408d97f5d727f61d/src/Viewer.purs#L638-L677) 输入时调用 search；选 EdgeResult 后选中 source 节点，hoveredEdge 保存两端 id/label、关系 label/description/predicateRef，清空查询后 renderGraph。**这证明结果可进入关系阅读状态；不证明有精确 edge identity 高亮，更不证明平行边身份保留、键盘可达或真实阅读效率。** 本轮没有执行上述代码。

### Tangle 的关系过滤并不补齐上述查询

[`GraphView.tsx` L434–450](https://github.com/bizbrf/tangle/blob/4cdbfd9bb9a297640ef45a42c4e693634094abc8/src/components/Graph/GraphView.tsx#L434-L450) 仅遍历 nodes；L623–670 依据独立 edgeKindFilter 删除显示边，再叠加选择/路径/搜索变暗。EdgeKindFilterBar 的 Cross-File Only 同时关 internal/external/named-range/table，Show All 恢复前三类但保留 named-range/table 原状态；不能将按钮字面解读为无条件显示全部原边。graph-controls.spec.ts 主要断言布局切换与节点保留，没有为这个过滤动作给出完整行为 expected。已有测试源码也没有在本轮运行。

## 一个有界验证任务，当前不等于实施批准

固定既有 [`examples/rag-pipeline.architecture.json @dev`](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/examples/rag-pipeline.architecture.json)，不另造上游 fixture 教学页。它有 12 节点、13 关系以及现成 HTML：

| 只给读者的关系短语 | 原件内可核答案 | 静态边界 |
| --- | --- | --- |
| `ANN search` | `retriever-to-vectordb`，Retriever → Vector Store | 短语不在节点的 label/sublabel/tag 等字段；Finder 当前节点索引无 edge 数据。 |
| `grounded answer` | `llm-response`，LLM → Orchestrator | 反向绕线；不要用节点 kind 推断方向。 |
| `parsed text` | `loader-to-chunker`，Loader → Chunker | 目标是关系定位，不是找名为 parsed text 的节点。 |

这是已存在的代表性 showcase，**尚未证明是自然用户报告的查找失败**；12 节点小图也可能一眼读出答案。问题的来源要诚实保留为“源码检查发现的可测试覆盖差异”。不把本报告里的答案表展示给参与对照的读者后再声称检索更快。

最小 before/after：同一固定 HTML、同 viewport、同初始 camera/selection，从只提供上述一个短语开始。基线允许现有 Finder、浏览器页面查找、肉眼看线、选节点读 Passport；记录完成到“确切边 id、方向、两端”的实际动作及错误。只有基线出现实质障碍，再做**单个局部行为草案**：查询已有 edge label（是否扩到 details 由真实输入决定），结果呈现 `from → to · label`，选择后复用现成精确关系预览/固定路径。对照保留重复 label 的不同边，不能只选到 source 就算完成。

需要两类真实图验证：一个未知端点但已知关系短语的实际读图任务；一个较密、含重复 label / 平行边 / 自环的已有图，检查结果身份与选中对象。禁止为证明需求先增密或删节点 label。RAG 小图若现有动作足够，就在这里停止；单张自动构造截图或另一个“官方 fixture 解释页”不构成改善。

**收益**：可能省去猜端点或逐节点展开关系的步骤，但未测量。**成本**：即便复用 Finder 与 Passport，也要区分 node/edge 结果、匹配依据、同 label 的精确边身份、键盘选择和清空/关闭；若影响共享 Viewer，还需跨 diagram 与导出装饰清理的针对验证。无需新图模型、parser、schema、历史栈或持久化索引。**影响**：节点 Finder 作为 Route endpoint picker 的既有合同必须保留；edge 结果不应混入端点选择器。先验更简单替代是现有 Passport/页面查找或原图的文字调整，实际收益不足则不做。

## 可追查原件指纹

以下均为完整下载文件的 SHA-256；记录是材料身份，不是上游测试通过或行为验收。许可未确认的 graph-browser 原件留在临时研究目录，不加入仓库分发。

| 完整原件 | bytes | SHA-256 |
| --- | ---: | --- |
| graph-browser src/Graph/Search.purs | 1816 | `1de296782b039d9e495c76e01fba6d0b4400564e17738c62f061438163ed2d10` |
| graph-browser src/Viewer.purs | 52136 | `92f77dae0796f3a9605173b3befd6e7cb687d2555d322bb6cbcedb60d7150546` |
| graph-browser example/data/graph.json | 3342 | `aaf52ef6c051cd30ecf1a2bd1bcb5e28485f329e90bf757d5b0633170ca17f19` |
| graph-browser data/rdf/graph.ttl | 108985 | `d1d9c16bf35a3e88aea55a104b32b98d6ca24a7a82164a79c23492d104383947` |
| Tangle LICENSE | 1074 | `7cd8854539c684929019b736fed8909677feb7dfd42c24b552da5523c7c876fc` |
| Tangle tests/fixtures/cross-sheet.xlsx | 16771 | `f259a7897e0ef4edca07d3aedf3b06ce01fe352d5d8a34e9a850560d73c1e124` |
| Tangle tests/fixtures/generate.ts | 17200 | `7f0ed987b93219f99b2b3722d62c1b8a3f91ec343ac3f5b6d7950edf80fb75d2` |
| Tangle src/components/Graph/GraphView.tsx | 41794 | `dfa7063e960c71ead61d0ff3bd62ddf2165f92b676072b56667722ca394c1a8e` |
| Tangle src/components/Graph/EdgeKindFilterBar.tsx | 3539 | `3aed422f209e2d7372f7c6df337b579082a23029fcd612306fe18986e693f898` |
| Tangle src/lib/graph.ts | 50510 | `1eabc7575b4128370a127387197457783e911848a4e9a9d2aeae006186ab3926` |
| adjacency-map LICENSE | 11357 | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| adjacency-map data/stub.SAMPLE.ts | 137 | `4a4a4c0776739c0a9d4983515b9cdb74c6da5f2b92830806f1b18983e83253d9` |

没有产品/视觉/键盘/用户效率实测；没有对许可作超出原件的推断；没有新增产品方向的既定结论。当前交付是一个有明确停止条件的验证入口，若无实证改进则建议不做。
