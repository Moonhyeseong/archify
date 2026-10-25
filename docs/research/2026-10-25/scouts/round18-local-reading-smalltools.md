# Round 18：2026本地代码阅读小工具与一项行注释往返候选

2026-10-25。按研究中心README与全部scouts提取owner/repo去重，起始集合492个链接字符串（并非492个完整深读项目）；下列六项此前未深读，全部在2026年创建，未按star筛选。另初筛一项无许可的人工轨迹工具。只下载固定提交的源码/许可/完整小fixture到`/tmp/archify-round18-local-reading/`，没有运行上游程序、测试、安装、模型、构建、浏览器或网络服务；唯一仓库写入是本报告。

**保留一个小候选：固定源码行与作者解释的双向往返。** 读者从某行去看“为什么”，再从解释回到那一行；它补的是阅读动作，不是新的代码图平台。这里没有要求先发生生产事故，也不把尚未测量的阅读收益写成已验证事实。其余五项保留机制和边界，不因没有事故一概判无价值。

## 现有能力与PR排重

同日读取GitHub开放PR及[#1015](https://github.com/tt-a1i/archify/pull/1015)、[#1103](https://github.com/tt-a1i/archify/pull/1103)正文/files，二者仍OPEN。#1015覆盖结论→面板关联、step locking、code/source focus、SourceCard展开/复制；#1103是在Code Analysis上增加module/file/function Atlas并回到Classic证据，不是手写行注释往返。不能把这两项重命名成新建议。

本地产品能力对照固定dev [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)：[snippet renderer](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs#L78)呈现完整escaped block.text及复制按钮；[SourceCard](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L599)已有来源摘录与源行号。已有Source question tour/CLI reading tour按问题或步骤组织代码；本轮不再做普通导览、弹出卡、图中选节点开Passport或新图谱。GitHub“code notes”及annotation/line文本检索未提供同义实现的明确命中；搜索有噪声，不能据此证明所有讨论都无重叠。

## 六个固定新来源

表内日期为同日GitHub repository metadata的created_at日期，不代表功能首发日，也不证明commit在某日发布；所有fixed tree调查时均未归档。完整原件含测试expected，只读expected不是本轮执行结果。

| 固定来源 / 完整SHA / 创建日期 | 许可原文 | 完整小输入与consumer | 具体机制、读者问题和取舍 |
| --- | --- | --- | --- |
| [onmax/comark-ui](https://github.com/onmax/comark-ui/tree/ec5769238df1f8523f836317817c4076e376be42) · `ec5769238df1f8523f836317817c4076e376be42` · 2026-10-12 | [MIT代码；包LICENSE另含Lucide ISC/Feather MIT通知](https://github.com/onmax/comark-ui/blob/ec5769238df1f8523f836317817c4076e376be42/packages/code-notes/LICENSE) | [完整fixture入口](https://github.com/onmax/comark-ui/blob/ec5769238df1f8523f836317817c4076e376be42/packages/code-notes/test/code-notes.test.ts)；[owning consumer](https://github.com/onmax/comark-ui/blob/ec5769238df1f8523f836317817c4076e376be42/packages/code-notes/src/index.ts) | 行末编号↔解释编号的本地双向anchor。**唯一小候选**，见下文；不引入Comark/Shiki或其标记解析器。 |
| [inixiative/atlas](https://github.com/inixiative/atlas/tree/fca2990a5470a5b478d2810fd49ed1acc548d342) · `fca2990a5470a5b478d2810fd49ed1acc548d342` · 2026-06-11 | [MIT](https://github.com/inixiative/atlas/blob/fca2990a5470a5b478d2810fd49ed1acc548d342/LICENSE) | [完整fixture入口](https://github.com/inixiative/atlas/blob/fca2990a5470a5b478d2810fd49ed1acc548d342/test/fixtures/mini/.atlas/concepts.ts)；[owning consumer](https://github.com/inixiative/atlas/blob/fca2990a5470a5b478d2810fd49ed1acc548d342/src/registry/invert.ts) | 手写concept→module/docs再求逆索引；文件的partOf与uses分轴。不是AST调用证据。保留人工声明/实测关系分层，暂不做另一个Atlas。 |
| [fredrikolis/annotated-tree](https://github.com/fredrikolis/annotated-tree/tree/98e024b4232abcd950e17893063448b9a35a5d37) · `98e024b4232abcd950e17893063448b9a35a5d37` · 2026-07-10 | [MIT](https://github.com/fredrikolis/annotated-tree/blob/98e024b4232abcd950e17893063448b9a35a5d37/LICENSE) | [完整fixture入口](https://github.com/fredrikolis/annotated-tree/blob/98e024b4232abcd950e17893063448b9a35a5d37/tests/fixtures/charter/grouping/.annotation)；[owning consumer](https://github.com/fredrikolis/annotated-tree/blob/98e024b4232abcd950e17893063448b9a35a5d37/src/charter.rs) | Concern / Non-concern / IO是一种有边界的目录说明；校验格式不能证明描述真实。现有Tree说明即可承载，不装git hook或改整个repo源码头。 |
| [duanzheng/meta-bonsai](https://github.com/duanzheng/meta-bonsai/tree/f2431a8f9ed3c09457f051c1cd731fc341f602c1) · `f2431a8f9ed3c09457f051c1cd731fc341f602c1` · 2026-01-28 | [MIT](https://github.com/duanzheng/meta-bonsai/blob/f2431a8f9ed3c09457f051c1cd731fc341f602c1/LICENSE) | [完整fixture入口](https://github.com/duanzheng/meta-bonsai/blob/f2431a8f9ed3c09457f051c1cd731fc341f602c1/tests/tree.test.ts)；[owning consumer](https://github.com/duanzheng/meta-bonsai/blob/f2431a8f9ed3c09457f051c1cd731fc341f602c1/src/core/tree.ts) | 只保留标注的文件和其祖先；祖先保留不等于祖先也被标注。适合作作者筛选的阅读清单，现有Tree已足够，不再写遍历器。 |
| [flancast90/chorograph](https://github.com/flancast90/chorograph/tree/37ae56bf1ba1500831c3aff07bc7d1c0839045a8) · `37ae56bf1ba1500831c3aff07bc7d1c0839045a8` · 2026-07-17 | [MIT](https://github.com/flancast90/chorograph/blob/37ae56bf1ba1500831c3aff07bc7d1c0839045a8/LICENSE) | [完整fixture入口](https://github.com/flancast90/chorograph/blob/37ae56bf1ba1500831c3aff07bc7d1c0839045a8/examples/streamline/services/orders.ts)；[owning consumer](https://github.com/flancast90/chorograph/blob/37ae56bf1ba1500831c3aff07bc7d1c0839045a8/packages/chorograph/src/core/annotations.ts) | doc-comment声明calls/reads/writes/emits与why→离线图。名称可解析不证明真实代码执行了调用；与现有Architecture和#1103关系导航重叠，不移植分析器。 |
| [abdul-hamid-achik/codemap](https://github.com/abdul-hamid-achik/codemap/tree/12e20426cad17607b6a394303267aa5b67f71f1f) · `12e20426cad17607b6a394303267aa5b67f71f1f` · 2026-06-23 | [MIT](https://github.com/abdul-hamid-achik/codemap/blob/12e20426cad17607b6a394303267aa5b67f71f1f/LICENSE) | [完整fixture入口](https://github.com/abdul-hamid-achik/codemap/blob/12e20426cad17607b6a394303267aa5b67f71f1f/specs/annotations.yml)；[owning consumer](https://github.com/abdul-hamid-achik/codemap/blob/12e20426cad17607b6a394303267aa5b67f71f1f/internal/app/service_annotations.go) | symbol或from→to path上附note/data，悬空仍保存并告警、允许retarget。可取是人工知识不因暂时失配丢失；不可由name端点存在推断整条调用链稳定，不引DB/daemon/MCP。 |

## 深读一：code-notes确实多一个动作，但它修改了展示源码

完整 `packages/code-notes/test/code-notes.test.ts` 6539B包含runner、完整小fence与编号list、expected HTML和错误边界。其首个fixture是两行`const a = 1 // <1>`、`const b = 2 // keep this <2>`加两条解释；它是上游构造的机制输入，不是自然项目的代码正确性证明。完整测试还将同一fence放两遍，并期望各自独立ID；缺note、缺marker、没有紧邻list、Markdown嵌套fence、Shiki顺序分别有声明断言，本轮均未运行。

[owning parse/draw source](https://github.com/onmax/comark-ui/blob/ec5769238df1f8523f836317817c4076e376be42/packages/code-notes/src/index.ts)实际执行路径是：先识别fence末尾的comment marker，在list紧邻时strip marker→让高亮器处理剩余代码→在行span后放链接→将ordered list改为notes。`link()`给marker `href=#uid-note`，`notesOf()`给note反向 `href=#uid-note-ref`。这是本地HTML anchor，不依赖JS后台；client.ts只注入样式。不能把静态HTML断言称真实键盘、焦点恢复或浏览器已接受。

两个细节不能省略：

- 一个note编号出现在多行时，只有首次marker取得反向target ID，反向链接回第一个，不保证回到读者刚刚点击的那一次出现。未来小实验先限制一note一行，不谎称任意多对多往返。
- `strip()`会移除示例原文里的标记及部分comment内容；“复制不含数字”是其作者格式的合同，**不等于固定仓库源码逐字保真**。Archify研究/SourceCard常需精确引用，因此不能直接把这个parser挂到来源文本上，更不能把修改后显示行的hash说成原blob的hash。

本轮源码为MIT；`packages/code-notes/LICENSE`还带Lucide ISC和Feather MIT通知，不能把整份包材料笼统只写MIT。候选不复制其icon/font/框架资产，只借阅读动作；若以后直接复制实现片段，仍需保留对应通知与来源。

## 深读二：人写concept、结构祖先与真实依赖必须分开

inixiative/atlas的完整mini fixture共有11个文件，包含`.atlas/{concepts,config,kinds}.ts`、BILLING文档及7个源码/测试文件。`concepts.ts`明确registry由repo拥有：feature:billing映射module billing/docs BILLING；createInvoice源码声明`@partOf feature:billing`与`@uses primitive:authz`。[invert](https://github.com/inixiative/atlas/blob/fca2990a5470a5b478d2810fd49ed1acc548d342/src/registry/invert.ts)只是按声明字段反转到value→concept，并排序保证稳定；[query test](https://github.com/inixiative/atlas/blob/fca2990a5470a5b478d2810fd49ed1acc548d342/test/query.test.ts)另明确未标注legacy文件得到kind/partOf/uses空数组。空数组是未声明，不是文件没有作用，也不是authz真的被执行。

这类人工概念导览对跨目录交接有合理预期价值。但在Archify中先用既有Tree/Architecture标签与来源即可验证一份内容，不先引registry、hook、全repo覆盖门槛或另一个Atlas UI。#1103处理分析器已有事实；此项目处理作者声明，两者都可能有用，但不能在同图里悄悄升格声明为实测。

annotated-tree也有类似边界：完整grouping fixture是`.annotation`加widget_a.py/widget_b.py，目录注释说明“groups reusable widgets / 不实现widget / IO none”。`tests/charter.rs`断言目录有breadcrumb时用目录自己的charter，entry file保留自身注释；只有格式/存在校验不能保证“不能腐化”的宣传语义。meta-bonsai的完整tests/tree.test.ts通过写临时目录构造未标注/深路径/目录+文件标注三例，tree.ts仅保留有description的file及剩余祖先。两者都适合读者先看到作者选择的责任边界；不能把未选文件视为不存在或安全删除。

## 其余来源的最小证据与成本

- **Chorograph：** 已完整读取11个`examples/streamline/`源文件，以及annotations.ts/annotations.test.ts和load.ts。示例将系统、领域、服务、数据和事件关系写进doc comments；load只读文件再交给buildGraph。其边是作者显式声明，检查target可解析并不证明实现中真的发出event/执行调用。若要看“为什么连这条边”，Archify已有label、描述与SourceCard；无需再做注释scanner或复制独立HTML renderer。
- **Codemap：** 完整`specs/annotations.yml`含一段建立Login/Auth小Go项目、添加node/path note、查看impact/path再snapshot的受控runner，以及4个expected contains。只读它，没有执行其中shell或重设任何环境变量；fixture里的postgres/avg_ms=12是作者附加的opaque测试数据，不能称数据库实测。service_annotations.go明确保存暂时不匹配的target并给matched=false，CLI还有retarget；匹配只是name/FQN或两个端点存在，不证明所有同名符号唯一、路径内容没变、注释仍语义正确。该持久层需要project registry/SQLite，超出本轮轻量页面，不建议移植。
- **额外初筛排除：** [ISOMER20070606/agent-review-workbench@edcc06d8165a3d14c21e025e3c6b5bb069fb740b](https://github.com/ISOMER20070606/agent-review-workbench/tree/edcc06d8165a3d14c21e025e3c6b5bb069fb740b)，创建2026-10-18；README与完整单HTML只读可见本地人工judgment/AI judgment并排比较和step高亮，但固定tree没找到LICENSE，故许可未知，不复制源码、baseline轨迹或素材。它的“问AI/翻译”另有网络路径，不把整个应用概括为永不联网。未深读baseline配对，不能称其证据链接可靠。这一项只算初筛，不充作第七个已完成fixture验证的来源。

## 唯一小候选：代码行—作者注释—原行的往返

**读者问题：** 作者解释一个已有片段的第3和第11行。读者点行号旁的编号查看远处解释后，想回到刚才那条原文继续比对。普通SourceCard回答“来源是什么”，code focus回答“哪行重要”，导览回答“接下来读哪里”；这些不自动提供“一条解释明确绑定哪行，再从解释回到那行”的双向动作。

**有界内容实验，最多这一项：** 单份固定完整源码片段、至多3条作者解释，每条显式给出`sourceId + sourceSha + originalLine`与note ID，HTML静态链接双向跳转。只在新独立实验产物中加行anchor与notes，零共享schema/Viewer/SourceCard改动，先看真实产物再决定是否进入产品；不做Comark importer、宏求值器、代码分析器、编辑器插件、存储后端或人工review平台。行注释是作者说法，不能由其编号推断source支持、测试通过或团队已确认。

**必要保真：** 不把`// <1>`插入或从固定source删除；注释作为sidecar元数据，拷贝仍复制原片段完整字节。新页面只有两个code block也需各自命名空间，重复文本不自动共享anchor；原始行超范围或来源hash不一致时显式不建立有效链接，保留原注释并指出无效引用，不自动模糊重绑到新源码。先一note一行，避免上游首次ref的多处歧义。

**最小比较：** 同一个完整fixture与同三条作者解释，基线用现有snippet+注释列表，候选只加行↔note链接；检查从第2条解释能回到第2个确切行、两个相同片段不串跳、复制源码不带marker、缺失line不造target、窄屏/键盘/返回位置的实际表现。此处列的是待验证行为，不是本轮已跑；不要为proposal新建复杂测试平台。若基线通过普通panel链接已能同样清楚地完成这个任务，可以停止，不追加功能。

**预期收益与成本：** 预期减少读者在解释与精确源码位置之间重新定位；不要求事先有生产事故，也不声称已测得定位更快。成本是一页小原型和少量固定anchor/sidecar，且不触及上游parser；将其泛化为公共notes schema、版本迁移或用户可编辑持久批注的成本明显更高，当前不建议。它比已有动作多的是精确行级往返，而不是再显示一次why。

## 固定完整文件摘要与限制

原件目录位于`/tmp/archify-round18-local-reading/<owner_repo>/`，每个meta.json保存repo完整SHA、created_at与tree。下表只列关键完整文件，不把摘录/派生输入冒充原件；上面说明的fixture目录均已完整取得，未执行。完整upstream test文件内的runner仍只是文本。

| 项目 / 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| onmax/comark-ui `packages/code-notes/LICENSE` | 4341 | `b1f6ed88695aa633c5b85d7881f64f81364c5a47fcf928d81f7c323278630af7` |
| onmax/comark-ui `packages/code-notes/test/code-notes.test.ts` | 6539 | `4c3493a4b9b2fed58066a2af515ae646296f922d0b671e6cb1d6bd5aee0fbf64` |
| onmax/comark-ui `packages/code-notes/src/index.ts` | 10802 | `e3eb36c8b5307579d8f7e3829644487016a4257229836d06800971704060140c` |
| inixiative/atlas `test/query.test.ts` | 2854 | `bf0e2e136e51bc782f6c09f95024ef04e4d5a04d5d3192dcb5692269945f207c` |
| inixiative/atlas `src/registry/invert.ts` | 912 | `508fdebc15bf2d9f49d79e75b373e9dee1ff992f38184d082732bc4438236719` |
| duanzheng/meta-bonsai `tests/tree.test.ts` | 2373 | `bb4218d99b7d68231c170c67a002670d88536fa03d4adc301b66db157a7a9f56` |
| fredrikolis/annotated-tree `tests/fixtures/charter/grouping/.annotation` | 115 | `64fb4a6ab4f538cdca99951f2918aee44c5773ad7599ac77eefd50391746aeff` |
| flancast90/chorograph `examples/streamline/services/orders.ts` | 2510 | `b060f9214bf1908c5f16da278f425c4a270491116442d03c1059f92a22e51906` |
| abdul-hamid-achik/codemap `specs/annotations.yml` | 2356 | `b45be6fe0e891d57f92c0fb7427363c6b3e32d95d0d0dcdfcaa1d4cb08995cde` |

未运行renderer、上游测试、browser/Ego、安装或构建；没有截图、键盘/AT、跨平台、用户收益或实测性能结论。本文只提出一个内容级小候选，未启动产品修改、公开issue、commit/push或live Skill操作；未修改研究中心README和他人报告。
