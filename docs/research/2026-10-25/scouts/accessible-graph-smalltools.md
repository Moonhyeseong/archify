# 图的可访问阅读：身份描述、键盘结构与非颜色证据

研究日期：2026-10-25。本轮只新增这份报告；未修改产品、运行第三方安装脚本、创建浏览器空间、执行屏幕阅读器验收或声称 WCAG 通过。采用 `archify-review` 的价值、成本、影响尺度。

产品代码参照 `82c7e0f089a02a4d514714adf37dc2061682da5f`。读取期间 hub HEAD 为 `e081821f1a9fdb27f4ba9caeef65eef21a30f132`；核对的 Finder、SVG helper、Waterfall 产品路径与上述基线没有差异。本文固定第三方源码 commit，避免把旧论文描述当作当前实现。

## 结论与去重

最值得继续的是 **让 Finder 按钮通过 `aria-describedby` 暴露它已经显示的身份副文字**。不改其 action name、搜索、选择、键盘或布局，不引入可访问性运行库。问题是已有内容在可访问描述中缺席，不是缺少另一个图导航器。

第二层仅保留一个条件候选：有明确失败/取消输入时，让 Waterfall 的实际状态能在非颜色文本中识别。当前没有取到自然失败 Waterfall 阅读任务，不能据此立即推动新绘制规则。通用图键盘重写、完整文本镜像、sonification、改 SVG 根 role 均不进入本轮实施建议。

已查 hub `graph-reading.md`、`interaction-smalltools.md`、`local-context-smalltools.md`、`source-navigation-smalltools.md`、`layout-reading-smalltools.md` 及其余 scout 的来源名。本轮九个来源未在已有 scout 中作为项目调研；不重复 Cytoscape、Sigma、Graphology、Graphviz、React Flow/ELK、Juggl、现有 Finder 匹配强调、Reach depth、阅读返回栈、源码 peek 和移动导航。

## 1. 已有能力与真实差异

| 表面 | 已核实实现 | 本轮判断 |
| --- | --- | --- |
| SVG 节点 | [`focusNodeAttrs:392–411`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/shared/cli.mjs#L392-L411) 有 role button、tabindex、pressed、标签与 sublabel/context/brand 组合名称。 | 不能写成“节点没有可访问名称”。原节点已经比 Finder 投影保留更多上下文。 |
| Finder | [`node-finder.js:151–170`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/node-finder.js#L151-L170) action aria-label 只使用 label 和关系数；可见 small meta 有 type、id、sublabel、tag，title 再含 context。 | 已显示的区别没有进入按钮 description。同名同 count 的现有 measured 示例已由协调人真实 AX 复现，见下文。 |
| Outline | [`node-outline.js`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/node-outline.js) 以原生按钮、分组、标签和副标签呈现，并同步 aria-current。 | 不另建一个侧栏或把它笼统称为“缺乏键盘入口”。 |
| 关系与路线 | [`focus.js`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/focus.js) 的关系 hit/list 已有方向键、Home/End、Enter/Space；Route/Finder 另有输入上下文。 | 新增全局箭头/快捷键会与既有作用域竞争，不是低成本补丁。 |
| Tree 折叠 | [`tree-branches.js:88–103`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/tree-branches.js#L88-L103) 已有左右收起/展开、aria-expanded 与祖先 reveal。 | “加左右键折叠树”是已覆盖能力。 |
| 通知 | [`template.source.html`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/template.source.html) 已有 Finder、Reach、Route、Lens、Radar、Intent Trace 的 status/live 区域。 | 不加一个通用 live region 重复播报所有状态。是否播报得当需要实际 AT，不是搜索 aria-live 就能判断。 |
| 色彩之外 | Waterfall 已有准确时长、父子导引、incomplete 的开边与下界文字；图例有服务名。 | 已有非颜色信息不能抹掉。error/cancelled 的逐行可读状态另见条件候选 B。 |

### 协调人的真实 Chromium 检查（本 agent 未亲自操作浏览器）

协调人在既有 Ego space 4 打开 `relation-reference/parallel-base.html`：两个可见 `Order API` 的副文字分别包含 `Frontend · api-primary · request producer` 和 `Backend · api-replica · request receiver`。Finder 按钮名称只保留标签与 2/3 connections；`aria-describedby`、`aria-description` 和按钮 title 为 null，`Accessibility.getFullAXTree` 中 description 未提供。

这证明该页面的身份副文字未暴露为按钮描述；**它不是“同名同 count 名称完全相同”的复现**，因为这个样例两者关系数不同。即使 count 不同，连接数量也不能替代 api-primary/api-replica 这样的身份事实。

随后协调人在基线 `82c7e0f0` 的既有 [`example-rebuild.waterfall.json`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/examples/example-rebuild.waterfall.json) 上确认了自然同名同 count 反例：`ex0_check` 至 `ex7_check` 共八个节点，原始 name 都为 `check-render-output.mjs`。本 agent 直接读取该源 JSON，确认这些 ID/name 与 `meta.evidence:"measured"`；本轮没有重新采样该历史运行。

已读取协调人的 `codex/lab-finder-context` 实验分支记录 `experiments/finder-context/screenshots/base-ax.json`：采集时间 `2026-10-25T05:44:20.988Z`，1440×1000，query 为 `check-render-output.mjs`，对应 source SHA-256 `4dc89cfefc54305319f42db08c7f89a40db7f844e311510bb711ab6e3f5eb149`。八行 AX 均为未忽略的 button，name 都是 `Focus check-render-output.mjs, 1 related connection`，description 全为 null；可见 text 各有不同 ID 和时间信息。这是现有输入的真实 Chromium 读取记录，不是本轮自编探针。记录位置是具体实验分支内路径；不假设该分支在调研时已经推送。

该 Waterfall 的 service/parent context 只进入 small.title；small.textContent 包含的是现有类型标签、ID 与时长等信息。候选 A 仅复用 textContent，**不承诺 context/title 中的所有内容也会被读取**，也不为已有类型标签额外背书业务语义。

同一真实 AX 树还包含 SVG 内部两个 `Order API` button，`ignored=false`，name/description 带 request producer/receiver。因而本轮已经获得反证：**不能把当前 `role="img"` 直接写成“此 Chromium 页面把所有子按钮压平”**。它不证明其他浏览器、导出嵌入形式或 AT 组合也相同。

## 2. 九个新来源：固定代码、许可与取舍

许可全文在本轮直接读取；不复制第三方实现。MAIDR/AutoVizuA11y 的许可与框架成本也是不直接接入的因素。Umwelt 的许可必须按包区分，不能用 GitHub 未识别 license 推断“无许可”或替整个 monorepo 作声明。

| 项目 / 固定 revision | 一手代码机制 | 许可与对 Archify 的判断 |
| --- | --- | --- |
| [Data Navigator](https://github.com/cmudig/data-navigator/tree/fa9ecb416ea209c0fe9d732275dcad4d6a4a3b54) `fa9ecb416ea209c0fe9d732275dcad4d6a4a3b54` | [`rendering.ts`](https://github.com/cmudig/data-navigator/blob/fa9ecb416ea209c0fe9d732275dcad4d6a4a3b54/packages/data-navigator/src/rendering.ts#L152-L186) 分父语义与子标签，每个渲染对象需明确 semantics.label；[`input.ts`](https://github.com/cmudig/data-navigator/blob/fa9ecb416ea209c0fe9d732275dcad4d6a4a3b54/packages/data-navigator/src/input.ts) 分开导航规则、输入映射与 focus。 | [MIT](https://github.com/cmudig/data-navigator/blob/fa9ecb416ea209c0fe9d732275dcad4d6a4a3b54/LICENSE)。借鉴“视觉图与导航结构不是同一层”；Archify 已有节点/关系 DOM，不引入第二份导航图、application 容器或 inspector。 |
| [Olli](https://github.com/umwelt-data/olli/tree/1311de5615772b921be5881e9b24e6117d55926f) `1311de5615772b921be5881e9b24e6117d55926f` | [`TreeItem.tsx:40–57`](https://github.com/umwelt-data/olli/blob/1311de5615772b921be5881e9b24e6117d55926f/packages/olli-render-solid/src/TreeItem.tsx#L40-L57) 提供 level、posinset、setsize、selected、expanded 与 roving tabindex；[`TreeView.tsx`](https://github.com/umwelt-data/olli/blob/1311de5615772b921be5881e9b24e6117d55926f/packages/olli-render-solid/src/TreeView.tsx) dispatch keybindings 与 focus。 | [BSD-3-Clause](https://github.com/umwelt-data/olli/blob/1311de5615772b921be5881e9b24e6117d55926f/LICENSE)。当前项目已经是 hypergraph、描述、导航、Solid renderer、adapter 分层体系，不能按旧论文当成“一小段自动 alt text”。不为 Finder 描述引入整套树投影。 |
| [Umwelt](https://github.com/umwelt-data/umwelt/tree/9b76f25932e5d1e3458d34346dcd1f8463dec584) `9b76f25932e5d1e3458d34346dcd1f8463dec584` | [`textualStructure.tsx:18–26,43–71`](https://github.com/umwelt-data/umwelt/blob/9b76f25932e5d1e3458d34346dcd1f8463dec584/packages/umwelt-solid/src/components/viewer/textualStructure.tsx#L18-L26) 明确防止其他视图的程序性 refocus 被再广播为用户导航，并防止旧异步结果覆盖新视图。 | [`umwelt-js/LICENSE`](https://github.com/umwelt-data/umwelt/blob/9b76f25932e5d1e3458d34346dcd1f8463dec584/packages/umwelt-js/LICENSE) 为 BSD-3-Clause；本次未确认全部 workspace 源码的许可覆盖。借鉴同步边界，不复制该组件。候选 A 只加描述引用，不调用 focus 或创建新的双向 selection 状态。 |
| [mermaid-a11y](https://github.com/inclunet/mermaid-a11y/tree/48ffcdd35fa1ab309b39b8e2063685e39fe37919) `48ffcdd35fa1ab309b39b8e2063685e39fe37919` | [`navigator.ts`](https://github.com/inclunet/mermaid-a11y/blob/48ffcdd35fa1ab309b39b8e2063685e39fe37919/src/core/navigator.ts#L108-L156) 分 host announce/live region 与焦点策略，避免 application surface 重复播报；[`announce.ts:104–130`](https://github.com/inclunet/mermaid-a11y/blob/48ffcdd35fa1ab309b39b8e2063685e39fe37919/src/core/announce.ts#L104-L130) 从节点、出入连接与回退能力生成描述。 | [MIT](https://github.com/inclunet/mermaid-a11y/blob/48ffcdd35fa1ab309b39b8e2063685e39fe37919/LICENSE)。小型语义导航的好对照，但只报 label+连接数也不能自动解决同名身份；不能直接照抄它的 announcement 当 Archify 修复。 |
| [MAIDR](https://github.com/xability/maidr/tree/4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682) `4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682` | [`description.ts`](https://github.com/xability/maidr/blob/4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682/src/service/description.ts) 从 active trace 取得描述并保持格式化；[`rotorNavigation.ts`](https://github.com/xability/maidr/blob/4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682/src/command/rotorNavigation.ts) 把导航单位与方向命令分开。 | [GPLv3 全文](https://github.com/xability/maidr/blob/4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682/LICENSE)，[`package.json`](https://github.com/xability/maidr/blob/4c8b0bf7ba814bf1e18ab915fe26268cdcf7f682/package.json) 声明 GPL-3.0-or-later。图表、多模态与音频体系远超一个 Finder 缺口，不引入运行库，不把其描述/AI 能力说成 Archify 已获得的事实。 |
| [AutoVizuA11y](https://github.com/feedzai/AutoVizuA11y/tree/b819e1e45a0c2958db56f934aa1c6de313ca4a2d) `b819e1e45a0c2958db56f934aa1c6de313ca4a2d` | [`AddAriaLabels.ts:31–34`](https://github.com/feedzai/AutoVizuA11y/blob/b819e1e45a0c2958db56f934aa1c6de313ca4a2d/src/components/navigation/AddAriaLabels.ts#L31-L34) 由数据项构造名称与 graphics-symbol/roledescription；[`NavigationKeyHandler.ts`](https://github.com/feedzai/AutoVizuA11y/blob/b819e1e45a0c2958db56f934aa1c6de313ca4a2d/src/components/navigation/NavigationKeyHandler.ts) 切换 chart/data 导航层。 | [AGPL-3.0](https://github.com/feedzai/AutoVizuA11y/blob/b819e1e45a0c2958db56f934aa1c6de313ca4a2d/LICENSE)。数据字段可进入可访问层值得参考，但不能 Object.values 一股脑朗读：Archify 应复用已有明确的 visible meta，不加入私有源码字段，也不搬 React 图表状态。 |
| [Patternomaly](https://github.com/ashiguruma/patternomaly/tree/5ca857ae7888aacaac9ecfc43f6b3e9859e40645) `5ca857ae7888aacaac9ecfc43f6b3e9859e40645` | [`patterns.js:3–45`](https://github.com/ashiguruma/patternomaly/blob/5ca857ae7888aacaac9ecfc43f6b3e9859e40645/src/patterns.js#L3-L45) draw 创建 CanvasPattern；generate 随机选择相邻不同 pattern。 | [MIT](https://github.com/ashiguruma/patternomaly/blob/5ca857ae7888aacaac9ecfc43f6b3e9859e40645/LICENSE)。证明还有色彩之外的纹理通道，但 CanvasPattern 不直接适配 native SVG；随机纹理也不适合作稳定服务身份。先显式文字，不能为了可访问性标签再造一套 pattern 系统。 |
| [remark-kroki-a11y](https://github.com/bartvanderwal/remark-kroki-a11y/tree/06edd309ad85fd1f535759051f0d45845c519147) `06edd309ad85fd1f535759051f0d45845c519147` | [`diagramTabs.js`](https://github.com/bartvanderwal/remark-kroki-a11y/blob/06edd309ad85fd1f535759051f0d45845c519147/src/diagramTabs.js) 管 source/description tab 与 aria-selected；[`classDiagramParser.js`](https://github.com/bartvanderwal/remark-kroki-a11y/blob/06edd309ad85fd1f535759051f0d45845c519147/src/parsers/classDiagramParser.js) 用受限语法提取类、属性、关系、multiplicity。 | [MIT](https://github.com/bartvanderwal/remark-kroki-a11y/blob/06edd309ad85fd1f535759051f0d45845c519147/LICENSE)。Archify 已有 typed JSON 和 source/Passport，不应从 SVG 或另一种 DSL 再猜一份描述。原始语法供阅读与正确语义描述是两种证据；此插件的解析器不能当任意 Mermaid 的真实关系证明。 |
| [Chart2Music](https://github.com/julianna-langston/chart2music/tree/b84854114264a56216322082b1e975698c75baa3) `b84854114264a56216322082b1e975698c75baa3` | [`keyboardManager.ts:62–72,116–117,221–246`](https://github.com/julianna-langston/chart2music/blob/b84854114264a56216322082b1e975698c75baa3/src/keyboardManager.ts#L62-L72) 只消费注册按键，注册表也用于生成帮助，再管理对话框焦点。 | [MIT](https://github.com/julianna-langston/chart2music/blob/b84854114264a56216322082b1e975698c75baa3/LICENSE)。同源快捷键帮助是可取机制，但 Archify 当前动作帮助是否漂移没有证据，不为此新建键位注册框架；声音不能代替文字身份，也不应自动播放。 |

这些来源共同支持“导航结构、名称、描述、输入状态分别有合同”，并不证明套一个库就会可访问。项目自述、源码机制、Archify 中的实际效果分开记录；本轮没有执行它们的 demos 或验证其可访问性宣传。

## 3. 候选 A：Finder 已有 meta → 可访问描述

**触发与价值**：节点同名或名称较短时，读者需要 id、类型或副标签才能选对对象。画面已经给出区别，当前 Finder 名称投影没有对应描述。优先修这条已确认的信息路径；无需先证明读者能在所有 AT 中完全操作图。

**最小机制**：复用每个结果现有的 small meta DOM，为它提供当前 DOM 中唯一的 ID；按钮用有效的 `aria-describedby` 引用。描述元素 ID 可以随查询重绘改变，例如按当前结果 index 分配；它不是节点稳定身份、共享链接或跨查询缓存的新合同。保留原 aria-label（Focus/route start/route target + count）、所有可见文本、结果排序、focus/reveal、键盘与 pointer 逻辑。优先描述可见 meta，不能把仅在 title 中的 context 悄悄变成新作者断言。没有 meta 时不生成空描述或借用别的结果。

这是名称与描述的分工，参照 [WAI-ARIA 1.2 的 aria-describedby](https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/#aria-describedby)。不用“追加一串所有内部属性”代替设计；描述也不应由邻居数猜角色或从色彩推出类型。若 AT 对描述朗读的设置不同，应如实记录，不能保证全部自动读出。

**范围与成本**：很小的 Viewer DOM 投影，可能不需要新增翻译，因为内容已存在；但仍需覆盖每次 query 重建、普通 Focus 与 Route 起终点上下文。不是 schema 或图模型变更。沿用项目 Viewer source → template 生成路径，不能手改生成模板，也不能遗留旧 IDREF。无新依赖、无新的 selector 历史、selection 状态或 URL 参数。

**最小正反例与验收**：

1. 先用协调人已经观察的两个 `Order API`，确认现有 name 不变、description 分别带各自 visible meta，引用元素在当前 DOM 中存在。
2. 使用已确认的 `example-rebuild` 八个 check 节点作同名同 count 主例。两个 accessible names 可以相同，但 description 必须指向各自可见 ID/时长副文字，不能偷换行或串到另一个节点。另加合成最小 probe 时须单独标示，不替代这个自然输入。
3. 输入筛选、清空、零结果、关闭重开、切到 Route source/target；核对描述内容和节点集合一一对应。缺少副标签的节点仍可用 ID/类型；没有任何有效 meta 时不补猜。
4. Tab/方向键/Enter/Space 与 IME 行为复用原测试，新增断言检查可访问描述和有效 IDREF，不能只匹配源码字符串。DOM/AX 检查与实际 AT 朗读分开。
5. 同一 viewport/theme/state 截 Finder 前后图；视觉应不变。再核 selection/hash/camera 与 canonical export 没有因描述改变。没有实际阅读任务证据前，只称信息对齐，不称定位速度提升。

**停止条件**：如果自然页面已经通过现有描述关联暴露同一信息，或加描述导致实际 AT 重复冗长、丢失 action name，应撤回或缩小方案。只有“名称没变化”不足以证明成功；也不能把 Chrome AX description 存在写成跨 AT 验收。

## 4. 条件候选 B：Waterfall 状态不是服务颜色身份

[`render-waterfall.mjs:152–157,319–334`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/renderers/waterfall/render-waterfall.mjs#L319-L334) 以 service 选色，error 覆盖为 red/security tone，cancelled 为 neutral；每行有 `data-waterfall-status`，但其 accessible name/Passport sublabel 主要是时长、detail 和 service/parent context。`incomplete` 已有下界文字，不应再发明一次。

搜索 Viewer JS，读到 status 的是 [`motion-governor.js`](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/viewer/motion-governor.js#L257-L259) 的动画样式；没有查到把 `data-waterfall-status` 另投影成行内状态文字的代码。这是静态阅读线索，**尚未用自然失败 trace 做浏览器复现**。不能把“存在 data 属性”当作用户已经听到/看到状态，也不能据没有 forced-colors CSS 就断言失败。

若有真实需求，最小探针是两个同名、相同 duration/service、不同显式 status 的 span：在 grayscale/forced-colors 与名称/描述读取中区分 error、cancelled，保持 incomplete 下界不变。先明确文字或短符号与可访问文本，再考虑纹理。所有标签只能来自显式状态；省略 status 或默认渲染 `ok` 不自动证明业务请求成功。不要把 `security` 色系名显示成错误类别，更不要把 service palette 当真实服务类型。

当前 bundled checkout 示例没有显式失败状态；本轮不为凑机会构造“自然故障”。因此 B 暂不实施，不扩展 Trace importer、critical path、状态采集或新 Renderer 合同。

## 5. 不做的事与已经否定的推断

- **不改 SVG 根 role。** [Graphics ARIA](https://www.w3.org/TR/graphics-aria-1.0/#graphics-document) 区分不可分 img 与可导航 graphics-document；[APG](https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/) 还说明 presentational 与可聚焦元素的例外。协调人的真实 Chromium AX 已显示内部按钮，不满足“已证实压平”的前提。改变共享 root role 会影响十种图、standalone SVG、嵌入与 AT 模式，成本远高于候选 A；需要不同浏览器/AT 的具体反例才讨论。
- 不把 application role 当可访问性开关。Data Navigator 的输入模型有进入/退出边界，不能把它的根 role 单独挪到 Archify、夺走浏览器/AT 原键位。
- 不再造全文本图、全局 roving tabindex、另一个图状态或自动 sonification。现有 Outline/Passport/关系列表优先。图中环、并行边与读者导航层级不同；可访问树的父子关系不能冒充业务 containment 或调用关系。
- 不用颜色变化、灰度截图或通过自动检查来宣布色觉、低视力、键盘或读屏“已支持”。本轮只有明确记载的源码、协调人 Chromium AX 观察与待验证方案。

## 6. 相关在途工作与交付边界

2026-10-25 用开放 issue/PR 搜索 `aria`、`screen reader`、`keyboard node`、`Finder description`、`duplicate label`、`aria-label`、`waterfall status`。没有查到同名 Finder description 修复；这是有限索引查询，不能证明不存在历史实现或未命中的分支。

- [#902](https://github.com/tt-a1i/archify/issues/902)、[#925](https://github.com/tt-a1i/archify/issues/925)、[PR #1093](https://github.com/tt-a1i/archify/pull/1093)：IME 与全局/面板按键，不改提交逻辑。
- [#898](https://github.com/tt-a1i/archify/issues/898)、[#909](https://github.com/tt-a1i/archify/issues/909)：toolbar 方向导航与 modified keys，不能把 roving 管理当新发现。
- [#1040](https://github.com/tt-a1i/archify/issues/1040)、[PR #1042](https://github.com/tt-a1i/archify/pull/1042)：明亮模式文字对比，不靠本次 description 工作宣称已解决。
- [#664](https://github.com/tt-a1i/archify/issues/664)：底部索引布局；[#221](https://github.com/tt-a1i/archify/issues/221)、[PR #225](https://github.com/tt-a1i/archify/pull/225)：关系探索与 Passport/相机。保持作用域分开。
- [#1022](https://github.com/tt-a1i/archify/issues/1022)、[PR #1030](https://github.com/tt-a1i/archify/pull/1030)：Waterfall incomplete 图例，不搭车修改。

本报告没有新增 renderer 测试或截图。若批准 A，最小后续是既有自然页面的描述投影对照、DOM/AX 引用与键盘回归，以及协调人在同一浏览器空间的真实截图。维护收益应是少一条身份信息丢失路径，不是积累可访问性组件或宣称全面合规。
