# 配置来源、叠加与插值：第11轮阅读发现

核对于2026-10-25（最后本地时钟18:37 Asia/Taipei）。产品比较基线固定 [dev10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0](https://github.com/tt-a1i/archify/tree/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。只读GitHub primary source/API和本地拥有的文档；未运行上游代码、测试、配置求值、模板、server、browser，未安装依赖或获取本机环境值。原始文件只读下载至checkout外，保留原bytes并计算SHA-256；本报告不冒充运行receipt。Research子agent独立深读Figment/koanf，其余由本agent读取。

结论：**推荐1个零产品改动的内容实验**——用Figment已提交测试回答“哪个provider加入过、哪个值幸存、错误究竟归谁”。其余项目只借鉴证据边界，不做配置parser、配置平台或自动provenance推断。

## 去重与现有边界

先对hub全部scouts检索六个repo名与config/overlay/interpolation，并检查相关报告：`comparison-reading-round5.md`的dyff是两份文档结构/多行scalar差异，`lineage-evidence-smalltools.md`是producer实际消费值，`build-infra-smalltools.md`是plan声明/unknown，`shell-reading-round9.md`已分Shell语法/展开/环境。六个repo未在本次检索的scouts中出现；“未命中名字”不是机制未重叠的充分证据，所以本轮拒绝普通package tree、diff-values、pipeline/plan导入以及通用替换依赖图。

[当前Explainer render](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs)已有table/facts/code/source相关块，[sources](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/sources.mjs)验证固定来源并提取源码；这些能力足够表达本轮证据。SourceCard指向源码并不执行该程序，也不自动证明配置求值。

[#1102](https://github.com/tt-a1i/archify/pull/1102)已经合入10b4，node explanation/drilldown不是新缺口。[#1103](https://github.com/tt-a1i/archify/pull/1103)是labs/code-analysis的draft Atlas，不重复模块/file/function图与Classic交接。官方窄搜open issue `config provenance`为0；`configuration`只返回locale/DSH等不相关条目，open PR同词也无本主题明确方案。这是词项搜索边界，不宣称穷尽；既有[#1015](https://github.com/tt-a1i/archify/pull/1015) source focus/reveal同样不另做。

## 六个新来源（不按stars筛）

| Primary source / 固定完整SHA | 实际许可 | 本轮实际阅读机制及界限 |
| --- | --- | --- |
| [SergioBenitez/Figment](https://github.com/SergioBenitez/Figment/tree/26d3e531c2055bd0ae8524bebc69f31fe3757ba5) `26d3e531c2055bd0ae8524bebc69f31fe3757ba5` | [MIT](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/LICENSE-MIT) OR [Apache-2.0](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/LICENSE-APACHE)，Cargo声明二选一，不沿用API单列许可 | provider metadata、tag及错误origin；merge/join/admerge语义不同。深读A。不是通用“最后文件获胜”，metadata可缺source。 |
| [knadh/koanf](https://github.com/knadh/koanf/tree/05e9d6b1830700d173444422c50cdd83ec8b66ef) `05e9d6b1830700d173444422c50cdd83ec8b66ef` | [MIT](https://github.com/knadh/koanf/blob/05e9d6b1830700d173444422c50cdd83ec8b66ef/LICENSE) | strict merge在copy上尝试、成功后提交；失败加载不能画成已生效覆盖。最终key map不能反推完整provider历史。 |
| [lightbend/config](https://github.com/lightbend/config/tree/a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7) `a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7` | [Apache-2.0完整正文](https://github.com/lightbend/config/blob/a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7/LICENSE-2.0.txt) | [Config API](https://github.com/lightbend/config/blob/a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7/config/src/main/java/com/typesafe/config/Config.java#L190-L244)要求先组成fallback stack再resolve且从root解释路径；optional缺失值也不等于null。补充fixture见下。 |
| [omry/omegaconf](https://github.com/omry/omegaconf/tree/7c59029719ccab7aeece3587455635062a17e9a1) `7c59029719ccab7aeece3587455635062a17e9a1` | [BSD-3-Clause](https://github.com/omry/omegaconf/blob/7c59029719ccab7aeece3587455635062a17e9a1/LICENSE)，另含ANTLR等独立依赖许可，不将顶层许可概括所有依赖 | lazy interpolation与显式resolve/materialization不同，保留所属root/context及callback side effects边界。深读B。 |
| [sksamuel/hoplite](https://github.com/sksamuel/hoplite/tree/14112f392fc40ca244ce4a34fd3f5d114a8f9af8) `14112f392fc40ca244ce4a34fd3f5d114a8f9af8` | [Apache-2.0](https://github.com/sksamuel/hoplite/blob/14112f392fc40ca244ce4a34fd3f5d114a8f9af8/LICENSE) | [README cascading](https://github.com/sksamuel/hoplite/blob/14112f392fc40ca244ce4a34fd3f5d114a8f9af8/README.md#L370-L398)：先列出的prod文件优先；不是所有工具统一的later-wins。[ReferenceContextResolver](https://github.com/sksamuel/hoplite/blob/14112f392fc40ca244ce4a34fd3f5d114a8f9af8/hoplite-core/src/main/kotlin/com/sksamuel/hoplite/resolver/context/ReferenceContextResolver.kt)仅从parsed root取scalar并转string，不能把声明的env/remote resolver当本轮已读取。 |
| [rust-cli/config-rs](https://github.com/rust-cli/config-rs/tree/ebde4917663d27a6c79288afd3802d785bd7022e) `ebde4917663d27a6c79288afd3802d785bd7022e` | [MIT](https://github.com/rust-cli/config-rs/blob/ebde4917663d27a6c79288afd3802d785bd7022e/LICENSE-MIT) OR [Apache-2.0](https://github.com/rust-cli/config-rs/blob/ebde4917663d27a6c79288afd3802d785bd7022e/LICENSE-APACHE)，README二选一 | [config.rs](https://github.com/rust-cli/config-rs/blob/ebde4917663d27a6c79288afd3802d785bd7022e/src/config.rs#L53-L78)：defaults→sources→explicit overrides的cache构建；不是只按文件顺序。README明确不负责把改动写回配置源；不新增万能source-history UI。 |

最初请求的`rust-cli/confique` API 404，未计来源；替换为实际可核config-rs。六项均为库/工具本身的一手实现或fixture，未把配置库冒称已有图形viewer。

## 深读A：Figment的错误归属不是加载历史

完整fixture：[tests/error-context.rs](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/tests/error-context.rs)，14,505 bytes，SHA-256 `b7058b21bda2d134b84d4ef4d0b1529753ba64988f9d8d467a8d974dbfc0658b`。读取全文件，包括Mock、错误helper、约束、merge/array的上下文；不是截一个字符串当独立运行案例。

[L144–161](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/tests/error-context.rs#L144-L161)给出的完整操作片段：`old(min=1)` → `merge new(min=10,max=5)` → `join ignored(max=20)`。[Bounds定义L23–35](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/tests/error-context.rs#L23-L35)在min>max时整体失败；上游断言错误path为`limits`、origin仅`new`，不是min/max各自的类型错误；加入了ignored，并不意味着它的max20生效或应该成为这条错误的来源。邻近array测试普通merge仅留下second；admerge可连接first/second，索引1的错误仍只归second。

[coalesce.rs](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/src/coalesce.rs#L26-L48)证明dict递归合并、merge冲突取incoming、join取已有，普通数组替换、adjoin/admerge连接；因此不能把同一次调用中的所有provider画成每个key的祖先。[figment.rs](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/src/figment.rs#L160-L185)调用provider.data并打tag，[profile合并](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/src/figment.rs#L371-L382)还有default/selected/global层级，不用单一线性优先级替代它。

**来源精度限制**：[Mock定义/helper](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/tests/error-context.rs#L11-L83)故意只给name、没有source。[Metadata](https://github.com/SergioBenitez/Figment/blob/26d3e531c2055bd0ae8524bebc69f31fe3757ba5/src/metadata.rs#L75-L87)允许source/provide_location缺省；provider被加入的caller位置不是每个键的配置文件行。本轮只能显示“测试中的provider名称/源码位置/断言的origin”，不能给old/new虚构文件名或部署来源。这是上游构造测试，不伪称真实用户事故或生产配置求值。

对照完整 [koanf strict_merge_test.go](https://github.com/knadh/koanf/blob/05e9d6b1830700d173444422c50cdd83ec8b66ef/tests/strict_merge_test.go)：1,948 bytes，SHA-256 `d20b3e721acdcc9df4ac0b36f60c179233d3d40207f90df2651a29f3d4d3b6d5`。L11–42尝试冲突加载时同时改count/加new，断言Raw/All/Keys/KeyMap保持原值且new不存在；L44–59合法同类型加载才生效。[koanf.go](https://github.com/knadh/koanf/blob/05e9d6b1830700d173444422c50cdd83ec8b66ef/koanf.go#L449-L479)先copy再strict merge成功提交。它拒绝“出现过的overlay就已应用”的推断，不因此增加第二个实施候选。

## 深读B：相同插值文本，所属上下文不同

完整fixture：[tests/interpolation/test_resolve_materialization.py](https://github.com/omry/omegaconf/blob/7c59029719ccab7aeece3587455635062a17e9a1/tests/interpolation/test_resolve_materialization.py)，11,264 bytes，SHA-256 `bb0b2d2d4c5198f233d0ddf64d671054ae01b7556c7fbdf08f87489620221189`；全文件读至recursive failure。导入dataclass/attrs/pytest和上游测试环境依赖也属于fixture，未抽出并执行单行。

- L79–102参数化consumer先/后声明：注册make回调、consumer引用made的child，显式`OmegaConf.resolve(cfg)`后断言consumer3、materialized容器和callback只调用一次。**排列顺序不是求值先后或调用计数证据**；这是测试断言，本轮没有运行采样。
- [L158–171](https://github.com/omry/omegaconf/blob/7c59029719ccab7aeece3587455635062a17e9a1/tests/interpolation/test_resolve_materialization.py#L158-L171)：foreign配置`x=2,src.child=${x}`；本地配置有`x=1`，make返回foreign.src。上游expected consumer和made.child都是2，foreign.src仍保持插值。看字符串`${x}`和本地x1不能得出结果1；需要保留所属context。
- L136–155、L174以后区分owned结果、alias和materialization；文件末测试lazy resolver返回native list时直接child引用会报InterpolationResolutionError，recursive materialized child也报错。不能把同样外观的`${...}`都画成可直接追踪的一条值边。
- [官方concept](https://github.com/omry/omegaconf/blob/7c59029719ccab7aeece3587455635062a17e9a1/website/docs/concepts/interpolation.md#L6-L26)明确lazy access；L93–101区分in-place resolve与resolve=True的输出。callback可以是任意用户代码；本轮不调用它，也不从源码声明推断本机环境/时刻/文件内容。

补充HOCON原bytes：`equiv04/missing-substitutions.conf`为68 bytes，SHA `16938464b4962f1081e93fd69a9b109ca619cdb54326fc4a69fb2cc013233fc9`；[完整文件](https://github.com/lightbend/config/blob/a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7/config/src/test/resources/equiv04/missing-substitutions.conf)仅三条optional substitution（a/b/c）。相邻[original.json](https://github.com/lightbend/config/blob/a9e5a9d1c6c9e73a520628a0d30ac92eb41a66d7/config/src/test/resources/equiv04/original.json)5 bytes，SHA `60536a3ce2c7d65fe6c682a5dabc229acb5597dcda69138151ac482dd0f157ba`为`{}`；这是提交的equivalence fixture，不是本机环境证明NOT_DEFINED_ANYWHERE不存在。缺键、显式null、未解析引用必须分开。

## 唯一候选：一页“为什么不是max20”的源码阅读产物

**用户动作**：先看三层声明，判断limits错误应归哪些provider；再从同一页表格与固定SourceCard核对“new只提供min10/max5，join ignored的max20未覆盖它，error origins只new”。不用quiz评分、解锁、Next新控件，也不把原生Walk说成reveal。

最小内容提纲：

1. Answer：加入过provider不等于其值参与最终错误。适用范围是固定测试，非生产诊断。
2. 表：操作 / incoming字段 / 在此测试幸存字段 / 上游断言 / 仍未知。old保留历史声明，new为幸存min10/max5，ignored.max20未成为结果；“文件位置/外部环境”明确未提供。
3. 两张SourceCard：原fixture操作与assert_origins、coalesce冲突规则；可选第三张Mock说明source=None。关系图若使用，只标“merge/join声明与证明的取舍”，不画成运行trace。
4. 一个短对照句引koanf：加载失败可能完全不提交。不要把它导入为第二套数据。
5. 边界：原bytes SHA、完整上游许可链接、fixture synthetic、未执行；原工具已给错误origins，Archify增加的是把声明/幸存/错误范围并列解释，不宣称比原工具自动诊断更强。

**价值**：读者容易把第三个layer的max20当最新值，而该fixture能在很小范围反证它；无需真实秘密配置或人工造事故。**成本**：一份固定内容页和2–3个源码引用，使用现有Explainer，无产品/schema/parser依赖；需要root若实施再核SourceCard引用与实际阅读结果。**影响**：新产物从10b4独立分支制作；不改现有renderer/Reader，不把67f历史产物重标新base。若并列表已让读者一眼答对，则无需新交互。

OmegaConf上下文规则虽更惊讶，但引入resolver/alias/materialization更多概念，与既有lineage/identity内容实验接近，**本轮拒绝第二产物**。Hoplite/config-rs普通优先级、HOCONoptional替换、koanf失败保留均可用现有prose/table说明，不足以维护新parser或配置解释平台。此轮未实施，不commit/push；原始文件不经格式化或换行归一，若后续摘录只引用所需范围并保留上游版权/许可，不能把报告的推导当执行输出。
