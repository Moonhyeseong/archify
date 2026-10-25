# 第七轮：源码位置、局部上下文与问题导览

调查日期：2026-10-25。只研究，未安装插件、执行上游代码、启动 LSP/MCP、运行 tour commands、创建产物或修改共享产品。读取研究中心 README 和全部现有 scouts 的仓库链接后排重。本轮新增核对 **10 个项目**，未读取或使用 star 作为门槛或排序；其中部分项目本身已较成熟，这里评价的是一个明确机制，而非建议引入整套系统。

判断依据：官方 GitHub metadata、固定提交 README、许可文件或 package metadata、相关源文件。README 的“更快”“更容易”是作者陈述，不是本轮测得的效果。以下没有声称做过浏览器/人类阅读验收。

## 先给结论

**本轮最值得做的不是再加一个报告格式转换器，而是两项成本接近零的阅读对照实验：**

1. 同一份真实源码与同一张原生图，比较“按文件罗列”与“每站回答一个具体问题”的导览。复用现有 `@source`、`@code`、`@steps`，不解析 CodeTour 格式、不加 MCP/语音/新播放器。
2. 同一文件里相邻的证据命中，比较“多张重复摘录卡”与“合并局部上下文、仍明确标出每个原始锚点”的阅读。先用现有源码引用手工编排；不增加自动搜仓库或合并 source 身份的 converter。

第三项可作为候补：把“同名但用途不同”的源码位置按 **定义/调用点/配置/示例** 明确分组。other.nvim 提醒我们：这些组可以是作者或命名规则提供的导航建议，不能自动升级成调用关系或测试覆盖。先验证角色标签是否减少误选，不新增规则库。

**暂不建议引入**：源码 hover/peek 的另一套弹层、另一套 tour runtime、LSP/TS 编译器、为导航写入生产源码注释、跨图 breadcrumbs/history。当前 Archify 已有大量对应能力或在审工作；没有证据证明额外状态值得维护。

## 1. 新项目、输入输出与不应声称的语义

每项的固定 revision/许可证见末表。表中的源码链接均固定提交。

| 项目 | 具体问题与输入 → 输出 | 已核对机制 | Archify 切口与语义边界 |
| --- | --- | --- | --- |
| [microsoft/codetour](https://github.com/microsoft/codetour) | 新人按文件树找不到理解顺序；tour JSON 中 steps、description、file/line/selection/directory/ref → VS Code 逐站引导或导出 tour。 | [schema.json](https://github.com/microsoft/codetour/blob/29955a004445d3fd2ad5df35dd00f9cc0400ba7d/schema.json) 包含逐站定位、1-based selection、可选 `pattern`；还包含 `commands` 与作为 JS 求值的 `when`。选读 [player commands](https://github.com/microsoft/codetour/blob/29955a004445d3fd2ad5df35dd00f9cc0400ba7d/src/player/commands.ts) 证实有 terminal 发送入口。 | 借鉴“描述在定位点旁、每站承担一个问题”。不要承诺完整导入 tour；不能执行 commands/when，也不能把 regex 匹配位置当原始固定行号。作者顺序不等于 runtime 调用顺序。 |
| [CodecrumbsIO/codecrumbs](https://github.com/CodecrumbsIO/codecrumbs) | 跨文件功能路径隐藏；源码中的 `cc:`/`codecrumb:` 注释与代码 → 文件/crumb 图、flow 编号和说明。旧 `Bogdan-Lyashenko/codecrumbs` 链接重定向到该 canonical repo。 | [默认注释提取器](https://github.com/CodecrumbsIO/codecrumbs/blob/31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b/src/server/code-parse/language/default/codecrumbs.js) 解析 `flow#step`、名称、`+linesRange`、details；节点ID由 path 和行号构成；[JS 示例](https://github.com/CodecrumbsIO/codecrumbs/blob/31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b/example-project/languages/js-lang.js) 只有一个原创注释入口。README 区分开源 v1 与独立 v2 产品。 | 图与源码旁的解释可以一起读；不建议为 Archify 要求修改生产源码加注释。编号是作者叙事，不证明执行路径；行号变化使 path-lines ID 变化，不是稳定语义身份；不能把 v2 网站功能算作此固定源码的实现。 |
| [code-hike/codehike](https://github.com/code-hike/codehike) | 文档滚到新概念时，远处代码还停在旧位置；Markdown/MDX、代码块及 annotations → React 文档布局/代码高亮/滚动选择。 | [scrollycoding 页面](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/apps/web/demos/scrollycoding/page.tsx) `Selectable selectOn=[click,scroll]` 与 sticky `Selection` 共享 index；[注释拆分](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/packages/codehike/src/code/extract-annotations.tsx) 把 comment annotations 与 code 拆开，再处理 start/end markers。 | 可借鉴“当前解释和对应代码不失联”；Archify 已有 steps/spotlight，先做同题阅读实验。不要为此引入 React/MDX；显示动画不证明 snippet 来自仓库或解释正确；高亮注释清理后的坐标不能直接冒充原文件坐标。 |
| [Bekaboo/dropbar.nvim](https://github.com/Bekaboo/dropbar.nvim) | 看局部代码后忘了当前文件/符号层级；path、LSP/Tree-sitter、Markdown/terminal sources → breadcrumbs、下拉 sibling 菜单、keyboard pick。 | [configs.lua](https://github.com/Bekaboo/dropbar.nvim/blob/f7c6fa21e2a7c32576e7a1791774a3736987f467/lua/dropbar/configs.lua) 明确 Markdown 专用来源，以及 path + LSP/Tree-sitter fallback；[bar.lua](https://github.com/Bekaboo/dropbar.nvim/blob/f7c6fa21e2a7c32576e7a1791774a3736987f467/lua/dropbar/bar.lua) 有 truncate 与 pick；[menu.lua](https://github.com/Bekaboo/dropbar.nvim/blob/f7c6fa21e2a7c32576e7a1791774a3736987f467/lua/dropbar/menu.lua) 明确 byte-indexed 点击区与显示宽度分离。 | 方向是可见的“我在何处”，不是另画依赖图。Symbol containment、文件路径、diagram wrapping 和调用方向不是同一层级。GPL-3.0：不复制进当前 MIT 产品，交互观察与代码复用分开；本轮不建议新做跨图 breadcrumbs。 |
| [rmagatti/goto-preview](https://github.com/rmagatti/goto-preview) | 想看定义但不想离开阅读位置；原生 LSP definition/type/implementation/declaration/references → 浮动代码预览，可嵌套/关闭。 | [入口](https://github.com/rmagatti/goto-preview/blob/d2d6923c9b9e0e43f0b9b566f261a8b1ae016540/lua/goto-preview.lua) 对 `targetUri/uri`、`targetRange/range` 作兼容，有 focus_on_open、nested previews 与 capable clients 选择；无range时有默认位置回退。 | 借鉴“先看再决定是否跳走”。Archify 已有 pinned source hover/focus 卡与 Escape 回 opener，不新增另一套 peek。LSP结果不是完整调用图；默认首行回退不是有效源码定位；列偏移编码也不能直接套作HTML字符offset。 |
| [DNLHC/glance.nvim](https://github.com/DNLHC/glance.nvim) | 多处引用要在列表与各文件间来回跳；LSP locations → 列表+同处源码 preview，可编辑。 | [lsp.lua](https://github.com/DNLHC/glance.nvim/blob/5a8eab1c1c48bfa19a33b556328a3c553138366e/lua/glance/lsp.lua) 分定义/类型/实现/引用方法，第一批非空结果会取消其他请求；[preview.lua](https://github.com/DNLHC/glance.nvim/blob/5a8eab1c1c48bfa19a33b556328a3c553138366e/lua/glance/preview.lua) 管理 parent window、buffer attach/detach 与预览位置。 | 候选是多个位置的就地比较，不是离线复刻IDE。不能把首个非空server结果称作全部references；预览可编辑不代表仍是固定commit。Archify页只读，必须沿用已有 source revision/bytes 证据。 |
| [stevearc/quicker.nvim](https://github.com/stevearc/quicker.nvim) | grep/diagnostic只有单行，看不出附近guard/分支；quickfix entries + loaded files → 可加减上下文、折叠、保持当前命中；另有可编辑buffer。 | [context.lua:95–164](https://github.com/stevearc/quicker.nvim/blob/4a6883cb13fe097a20a046eb55f6dffd239276e3/lua/quicker/context.lua#L95) 计算前后窗口，跳过同line重复、处理同buffer重叠，保留命中当前位置；额外context行标 `valid=0`，不冒充原始诊断命中。 | **本轮最细而有价值的机制**：保留锚点与补充上下文的身份区别，合并重复阅读。只考虑只读显示；不要把相邻行都当查询命中，不引入可写quickfix，不把buffer内容当固定Git证据。 |
| [rgroli/other.nvim](https://github.com/rgroli/other.nvim) | 写/读一个文件后想找对应view/model/test，却要再猜文件名；当前filename+用户mapping/transformer/context → alternative file、多个候选picker、记住选择。 | [init.lua](https://github.com/rgroli/other.nvim/blob/1d48e090f6d1d53dda9fb5094af3f2006ebbb858/lua/other-nvim/init.lua) 明确 `FileMatch{context,filename,exists}`，按mapping找候选，0/1/many分流，rememberBuffers及hooks可重排。 | 对原图中的“相关位置”按角色标示即可先试，沿用source引用。约定匹配不等于静态依赖或测试覆盖；多个候选不能偷偷选中一个后称唯一对应；`exists=false`也不能标“仓库已无测试”。 |
| [twoslashes/twoslash](https://github.com/twoslashes/twoslash) | 文档中表达式类型只能靠猜，跳TS Playground又失去上下文；TypeScript样本+编译器环境+`^?`等标注 → hover/query/error/completion/highlight节点。 | [nodes.ts](https://github.com/twoslashes/twoslash/blob/e88c8708deb8d63349f48d840b1cd74cb807a7ce/packages/twoslash-protocol/src/types/nodes.ts) 分 `start/length`、0-based line/character、hover/query/error等；README说明是从 TypeScript 网站原实现延续的独立项目。 | 可以显示已提供且绑定样本/编译器版本的类型解释；目前**不值得**为Archify增加TS编译器/VFS依赖。推导类型不是运行时值，编译器error也不是测试失败；virtual sample坐标不自动等于原仓库行列。 |
| [benstaniford/CodeTour](https://github.com/benstaniford/CodeTour) | Agent解释代码和屏幕展示经常不同步；GitHub PR/local source/git changes + MCP show_step/show_code → 浏览器文件树、代码/差异、caption/TTS，调用等待narration完成。 | 与Microsoft项目同名但独立。[source.py](https://github.com/benstaniford/CodeTour/blob/b229b4d928ca4e4e518803d47d1b0576b572af4e/src/codetour/source.py) 明确自己读要展示的代码，Excerpt分 line_start/end、total_lines、target range、truncated/note；source excerpt转context-only hunk时旧侧count=0，不能叫它代码改动。 | 只借鉴“展示内容由同一读取路径取得，source excerpt与diff分开”。Archify已做固定commit源码摘录，不需要引入WebSocket/MCP/TTS运行期；Agent叙述仍不是语义证据。许可metadata声明MIT但缺独立完整LICENSE，复用代码前还需确认通知。 |

## 2. 深入机制：固定证据位置与阅读动作分开

### A. CodeTour 的“站点”适合表达理解顺序，却不等于图中的调用顺序

Microsoft CodeTour schema 的最小约束实际上只有 tour `title/steps`、每个 step 的 `description`。`file`、`directory`、`uri`、`line`、`pattern`、`selection` 可选，故**不是每一站都拥有可验证代码位置**。tour还可带命令URI、terminal发送和JS条件。这些是 IDE 自动化能力，不能随“导入tour”带入只读分享页。

适合保留的是小合同：**这一站回答什么、展示哪份固定代码、下一站为何相关**。与 Archify 的原生边语义分开：原图的连线仍表达既有调用/数据/依赖关系，导览顺序写在 `@steps`，不能为配合叙事补造调用边。Codecrumbs 的 flowStep也只是作者编号；把它当栈轨迹会产生同一问题。

benstaniford/CodeTour是另一个有用对照：它不让LLM在show_code调用里任意贴一份与源文件不同的代码，而由SourceReader读取真实摘录，且Excerpt有target range和truncated。Archify已有比“任意粘贴”更强的固定Git读取路径，应该复用，不能为了更流畅而退回不绑定的代码块。

### B. Quicker 的context不是“更多命中”

选读实现把匹配行保留为原quickfix item，把新增上下文行建成 `valid=0` item，且避免同文件相邻窗口重叠重复显示，修正扩展后原选中行的位置。这里最值得学的不是某个UI控件，而是两条阅读合同：

- 用户必须仍然知道原来命中的是哪一行；补充行只提供上下文。
- 两个相邻锚点可以共用一个阅读窗口，但不能因此变成同一个引用/诊断/语义实体。

Glance进一步显示局部列表与源码共处的收益来源：比较候选时不必每次正式跳走。不过其LSP请求会采用第一批非空结果取消其他请求，所以列表完整性不能仅凭“看起来有references”来保证。Archify若以后从索引服务取来源，也要明确当前provider与覆盖，不能把0个返回值说成源码没有关系。

### C. Code Hike 的同步选择是显示协调，Twoslash的类型则是另一种证据

Code Hike示例用同一个selection index把解释段落与sticky代码面板同步。控制变量是**解释与代码是否同时在视野中**，不是动画好不好看。Twoslash的hover/type/error则来自编译器，这与作者代码comment不是同一可信度。两者合用在文档中很自然，但对Archify成本不对等：同步选择可复用steps；引入编译器与虚拟文件系统会扩展支持矩阵、版本/坐标映射与缓存责任，当前没有必要。

## 3. Archify 实际能力与排重

研究中心当时共有14个已推送实验，外加 relation reference / relation return。以上10个canonical项目未出现在此前scouts的仓库链接清单。`nvim-navic`与已研究的Navbuddy同家族、能力高度相关，因此没有凑作第11项。

对当前 owning source作只读检查：

- [explainer-authoring.md @source/steps](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/explainer-authoring.md)：图节点可绑定source，`@source path+lines`、`@code`有固定commit摘录，`@steps`可关联diagram/node/route。**不能说Archify缺少代码tour、源码位置或就地预览。**
- [sources.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/sources.mjs)：实际从Git revision读取文件，固定path/lines/text及文件digest；工作树内容不是等价替代。
- [reader.js setupSourceCards](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/reader.js)：已有hover/focus来源卡、最多先呈14行、Open source、Escape回opener和浮动链接的Tab流程。另建goto-preview式弹层会重复状态与焦点责任。
- [#1015](https://github.com/tt-a1i/archify/pull/1015) **OPEN**，正文已重新读取：代码focus区间、source-card按focus居中、Show all N lines/Copy、step locking等都在其中。不能把“目标行没进前14行”或“展开摘录”再另立同义实验。
- [#1036](https://github.com/tt-a1i/archify/pull/1036) 已有native HTML walkthrough/video工作；本轮不做另一个播放/语音/视频服务。
- [#367](https://github.com/tt-a1i/archify/pull/367)、[#413](https://github.com/tt-a1i/archify/pull/413)、[#461](https://github.com/tt-a1i/archify/pull/461)、[#653](https://github.com/tt-a1i/archify/pull/653) 对应ownership/drilldown、Atlas、分层阅读与C4。已搜相关open PR并读取#653正文。Dropbar的“当前层级”不应扩成新的跨图层级管理工程。
- Finder match高亮实验与新的relation return仍是现有工作；本轮不再做查询高亮或回关系来源节点，只评价源码位置之间的阅读安排。

这些判断基于当日GitHub状态和基线源码，不证明在审PR已合入，也不把当前研究分支HEAD当成产品发布revision。

## 4. 两项优先实验与一个候补：先证明阅读便利

### 实验A：同题、同代码、不同导览安排

**问题**：四个固定源码位置之间，读者是否能更快、少出错地找出一个行为的定义、进入条件、实际调用与失败分支？

**第一刀**：选择一个已有公开小模块，固定commit和四处真实source ranges。写两份人工检查过的Explainer：A0按文件标题列出四份相同的 `@code`；A1按四个具体问题编排 `@steps`，将同一批source关联到原生图节点。两者的源码字节、引用范围、图拓扑、配色和可用控件保持相同；不自动抽取控制流，不新增任何schema或converter。不为了讲故事补造边。

**每站的可核问题**例如：“哪个条件让该调用不发生？”“这里返回的错误在哪里被改写？”这些问题需要读源码，不能只从tour标题抄答案。先由不参与页面编写的reviewer从代码制定答案与反例，再给另一位reader做盲测；交叉分配任务，避免先看过A0的记忆帮助A1。

**记录**：正确定位文件/行、回答是否引用正确代码、外部tab/正式跳转次数、无关滚动与总耗时；若用Agent读者，只叫Agent pilot，不声称人类理解收益。没有真实对照就只报告产物与交互能否完成。

**放弃条件**：A1只是把文件名改成问题但仍要反复找代码；答案正确率没改善且多了一层步骤；或者现有作者内容重排已经足够——那就把结果作为authoring示例，不加新功能。成本：极低；不维护tour importer、播放器、LSP、MCP或TTS。

### 实验A的具体真实输入：图节点的源码预览来自哪儿，Escape回哪儿？

可立即交给独立示例作者的问题是：**“预览里的源码是不是当前工作树文件？按Escape关闭时，键盘焦点何时回到来源？”** 这读的是一个已有边界，不是新增peek能力。

固定仓库 `tt-a1i/archify`、commit `82c7e0f089a02a4d514714adf37dc2061682da5f`。已用 `git show <commit>:<path>` 核对下列行号：

| 要回答的子问题 | 固定真实source | 应能从源码得出的答案 |
| --- | --- | --- |
| 交付时从哪份文件读取？ | [sources.mjs L244–263](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/sources.mjs#L244-L263) | `git show revision:path`读取并保存text、revision、文件digest；`@code`是验证过的Git片段，不能以未提交工作树内容替换。 |
| 浏览器取的是哪份数据？ | [reader.js L599–611](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/reader.js#L599-L611) 与 [L615–626](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/reader.js#L615-L626) | 从preparedSources和source.text构造已有来源卡；此处不在浏览器重新读本机Git/工作树，预览先显示14行。 |
| 图节点如何走同一套预览？ | [reader.js L638–649](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/reader.js#L638-L649) | node source映射触发mouseenter/focus时进入同一个show；不创建第二套preview状态。 |
| Escape是不是总把焦点拉回节点？ | [reader.js L654–668](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/explainer/reader.js#L654-L668) | 只有来源卡包含当前activeElement时才opener.focus，随后隐藏卡；hover但焦点在外时不强行迁移焦点。 |

**最小作者工作**：A0按文件列出相同source片段；A1编排四站问题和一个原生Workflow。用 `@meta repo_url=... repo_revision=<full SHA>` 和 `@source path=... lines=...`，每份展示源码都用已有 `@code`，生成时传同一仓库root。图分Build与Read两lane：Build的“固定Git验证/读取→嵌入摘录”经明确artifact数据交接到Read的“hover/focus显示→按条件返回”。这是跨交付阶段的数据传递，不是浏览器运行Git的调用图，也不是一次实测执行轨迹。节点可绑定相应source以复用既有来源卡；不改schema/Viewer/公共CLI。

**必须保留的细节**：一般的可选citation在无法验证/读取时可能只剩plain reference，不能把本例使用强制验证`@code`的结论扩成“所有citation都有内嵌源码”。`Escape`条件不能被叙事简化掉。14行预览、focus居中和展开的增强已有#1015，不在本例实现。

**最低对照任务**：读者指出那一行固定Git读取、指出浏览器取数据的位置、区分“卡内链接有焦点”与“只是鼠标hover”的Escape行为。记录源码定位是否正确和是否离开当前页面；若只演示控件能用，就只叫可操作示例，不能称认知或效率改善。

### 实验B：相邻命中共享上下文，但每个锚点仍可核查

**问题**：同文件里两处相邻调用分别摘录时，重复代码是否导致读者反复确认同一guard？合并局部窗口能否帮助判断二者是否在同一分支内？

**第一刀**：真实固定文件取三个位置，前两个窗口确实重叠，第三个在另一函数。B0三份独立摘录；B1把前两处放到一个共享上下文块，保留两个独立source引用、原始行号与“这是命中/这是上下文”的说明，第三处仍独立。手工编排已有 `@source/@code`，不发明输入格式、不改变source身份，也不要求先合并引用数据结构。焦点/展开能力先复用现有或在审#1015，不重复实现。

**记录**：读者能否指出两个调用是否由同一个guard包裹；两个原始锚点是否都找得到；重复行阅读量、上下文不足造成的Open source次数与错误。只比较同一代码字节；不能把上下文窗口按猜测跨越不同commit、不同文件或同名symbol合并。

**放弃条件**：合并后锚点被隐藏、读者把整个窗口当一个调用点、或广窗口反而遮挡主体。即使只减少重复行，不提高定位/判断，也不据此扩展共享Viewer。成本：极低的内容实验；自动按revision+path合并范围属于后续可选实现，当前没有授权或实现。

### 候补C：相关位置按角色分组，避免同名的默认误选

借鉴other.nvim的context和0/1/many候选保留，在同一张图节点旁用已有source列表/说明，明确“定义”“被引用位置”“配置”“示例”；两处同名实现或候选时完整保留，允许未提供该类来源。对照只比较有无角色标签，不建立命名模式库，不引入source/test配对converter。

证伪问题是：读者是否误把示例当生产实现、把命名匹配test文件当测试覆盖？如果角色标签没有减少这种误选，或表中的信息已经足够，**不值得添加导航菜单**。不能称这是新发现的测试证据机制；第六批已经研究覆盖/测试上下文，这里只评价选择位置的便利。

## 5. 固定commit与许可

| Canonical repo | 查验commit | 许可一手来源 |
| --- | --- | --- |
| microsoft/codetour | `29955a004445d3fd2ad5df35dd00f9cc0400ba7d` | [MIT / LICENSE.txt](https://github.com/microsoft/codetour/blob/29955a004445d3fd2ad5df35dd00f9cc0400ba7d/LICENSE.txt) |
| CodecrumbsIO/codecrumbs | `31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b` | [BSD-3-Clause](https://github.com/CodecrumbsIO/codecrumbs/blob/31ca6f4a7831ef5d2af5a6890e8e1bab30aa726b/LICENSE) |
| code-hike/codehike | `cd81d8af1c503b699cbf0458d504e4578bcb9c74` | [MIT / lowercase license](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/license) |
| Bekaboo/dropbar.nvim | `f7c6fa21e2a7c32576e7a1791774a3736987f467` | [GPL-3.0](https://github.com/Bekaboo/dropbar.nvim/blob/f7c6fa21e2a7c32576e7a1791774a3736987f467/LICENSE) |
| rmagatti/goto-preview | `d2d6923c9b9e0e43f0b9b566f261a8b1ae016540` | [Apache-2.0](https://github.com/rmagatti/goto-preview/blob/d2d6923c9b9e0e43f0b9b566f261a8b1ae016540/LICENSE) |
| DNLHC/glance.nvim | `5a8eab1c1c48bfa19a33b556328a3c553138366e` | [MIT](https://github.com/DNLHC/glance.nvim/blob/5a8eab1c1c48bfa19a33b556328a3c553138366e/LICENSE) |
| stevearc/quicker.nvim | `4a6883cb13fe097a20a046eb55f6dffd239276e3` | [MIT](https://github.com/stevearc/quicker.nvim/blob/4a6883cb13fe097a20a046eb55f6dffd239276e3/LICENSE) |
| rgroli/other.nvim | `1d48e090f6d1d53dda9fb5094af3f2006ebbb858` | [MIT](https://github.com/rgroli/other.nvim/blob/1d48e090f6d1d53dda9fb5094af3f2006ebbb858/LICENSE) |
| twoslashes/twoslash | `e88c8708deb8d63349f48d840b1cd74cb807a7ce` | [MIT](https://github.com/twoslashes/twoslash/blob/e88c8708deb8d63349f48d840b1cd74cb807a7ce/LICENSE) |
| benstaniford/CodeTour | `b229b4d928ca4e4e518803d47d1b0576b572af4e` | [pyproject.toml声明MIT](https://github.com/benstaniford/CodeTour/blob/b229b4d928ca4e4e518803d47d1b0576b572af4e/pyproject.toml)；固定树无独立LICENSE文件，GitHub license API未识别。没有把metadata声明冒充已核实完整许可文本。 |

读取过的许可证只覆盖相应仓库授权，不能自动覆盖网站图片、第三方依赖或另一个商业版本。本轮没有复制代码或图片，也未判断任何项目整体的安全性、性能或跨平台可用性。

完成：10个新项目一手身份/版本/许可与特定源码核对，现有能力/PR排重，三项可证伪阅读实验。未完成：实验HTML、对照阅读数据、截图、实现、发布或人类接受。只新增本报告。
