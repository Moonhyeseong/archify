# 图差异与静态图比较：一个值得优先的小切口，两个暂缓机制

日期：2026-10-25。先读研究中心README及已有11份scout报告，核对来源仓库避免重复；已与source-navigation scout协调，本报告不研究代码定义/引用跳转、CodeTour或源码preview。调查10个此前未覆盖来源，固定官方commit/许可、输入输出与源码边界。没有运行上游程序、改实现、生成图片、commit或push。

**最值得优先的是现有Architecture Delta的selected change row显示已经存在的旧→新事实**：关系label和from/to。不是新graph diff、同步相机或更大规模平台。当前真实checkout样例已经有SQL→SQL tx与orders→fraud，不用为按钮制造极端case。同步pan/zoom、动画morph、pixel heatmap都可以实验，但本轮没有充分理由集成到共享Viewer。

Relation-return原型刚表明：新动作即使正确也可能只是重复既有一步操作。此处同样要求先给一个当前界面回答不了或需反复切图的问题，不能用更多控件、更多颜色或上游宣传当用户收益。

## 一、Archify已经会比较什么

固定基线：`82c7e0f089a02a4d514714adf37dc2061682da5f`。核心owning source为 [archify/delta/architecture-delta.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/delta/architecture-delta.mjs)，不是通用Viewer的Focus模块。

- `compareArchitecture()`已有按component/connection稳定ID、boundary kind+label的比较；没有共享component id会refuse，connection没有ID也refuse。不以label自动认同节点，不猜rename。
- `fieldChanges()`已按semantic/evidence/topology/geometry/scope分组，区分moved/rerouted/evidence-changed；repository provenance与presentation另列。不要重做“语义与布局分开”。
- `buildDeltaSvg()`已有removed、moved-from、旧路由/边等ghost及+/-/~符号；Before/Delta/After三个视图，Before/After保留native HTML iframe。
- `renderArchitectureDeltaHtml()`已有Exact authored changes列表、点击选中变化、Overview/Previous/Next、有限Review播放、reduced-motion分支、canonical export清理。
- `validateReview()`验证receipt形状、完整change集合与row identity；`targetsMatch()`在选择时核对真实Delta图的对应target签名；失配走`failReview()`，禁用review并给unavailable。不能再把“点击change定位/逐条审阅”当新功能。
- `rowHtml`目前显示kind、label、ID、classification、changedFields的**名字**，没有通用旧值/新值UI。`selectChange()`把目标强调并更新status，没有field值panel。

### 真正可用的数据与不可恢复的数据

| 既有receipt位置 | 当前保存内容 | 第一刀允许展示 | 不能冒充支持 |
| --- | --- | --- | --- |
| `changes.connections[i].base/head` | 每一存在侧有`from/to/label` | 对同一稳定关系ID展示before/after端点及label | variant、via、labelDy等旧新值没有保存，不能猜 |
| `changes.components[i].baseLabel/headLabel` | 两侧存在时的label | 将来可同样显示label；本轮可只做关系，缩小范围 | sublabel/tag/brand/sources/size旧新值不在该对象中 |
| `changedFields` | 如`/label`、`/from`、`/via` | 告诉读者哪些属性被比较器判成变化 | 不是JSON Patch操作或完整值diff |
| added/removed缺整个base/head侧 | 对应关系在该侧不存在 | 明确“Relationship absent in Before/After” | 不是该侧label缺失，更不是空字符串 |
| connection `label` | producer使用`before.label || ''` / `after.label || ''` | 空时显示“Empty or not supplied” | **missing与empty已经被归一化，不能恢复两者区别** |

源码证据：`compareArchitecture()`的connections describe只构造两侧from/to/label；`fieldChanges()`只返回classifications/changedFields。不是“receipt其实已有所有字段值，只差展示”。

## 二、查重与维护边界

阅读现有研究中心14个实验与interaction/graph-reading报告；不重复dependency-map、payload delta、Finder canvas matches、Reach depth、relation reference/return、trace或源码navigation。

GitHub官方API查`compare in:title`得13项，`delta field`/`delta filter`等广义查询存在较多正文噪音且第一页未穷尽；精准`graph compare in:title`、`delta old new in:title`、`xdot`、`pixelmatch`均0命中，不能据此声称无重叠。

- [#1044](https://github.com/tt-a1i/archify/issues/1044)/[#1049](https://github.com/tt-a1i/archify/pull/1049)仍是Git refs读取既有Architecture snapshots，不改比较算法；本轮不碰Git输入wrapper。
- [#600](https://github.com/tt-a1i/archify/issues/600)、[#603](https://github.com/tt-a1i/archify/pull/603)、[#656](https://github.com/tt-a1i/archify/pull/656)是meta.translations/presentation变化分类，不能把该已在途问题当新字段比较需求。本轮不改classification。
- [#434](https://github.com/tt-a1i/archify/pull/434)是baseline ghost arrowheads修复，不能画一张新overlay就说解决旧缺陷。
- [#413 Atlas](https://github.com/tt-a1i/archify/pull/413)拥有多图/history/camera方向；本轮不引入全局相机同步、阅读状态恢复或并排架构平台。
- [#225 relationship exploration](https://github.com/tt-a1i/archify/pull/225)、[#452 authored edge order](https://github.com/tt-a1i/archify/issues/452)、现有Focus/Route能力均不重写。changes的遍历顺序也不表示运行时顺序。
- [#229/#234](https://github.com/tt-a1i/archify/issues/229)有Share Card移除决策，当前基线Delta仍有卡片代码；这里不替它执行移除或新增卡片。

本报告建议只涉及Delta producer内嵌阅读UI和其focused tests。共享Viewer、schema、receipt contract、renderer geometry、CLI参数、安装、云、ZIP身份与版本都不因本报告获得修改授权。

## 三、10个新来源

commit为本次默认分支HEAD，不等于最新稳定release。许可证通过官方文件核对；dot-viewer的MIT仅在Cargo.toml声明，未返回独立LICENSE文本，单列这个证据层次。没有照搬实现。

| 来源、固定commit | 许可与日期 | 实际输入→输出/核实机制 | 对Archify的判断与边界 |
| --- | --- | --- | --- |
| [mathstuf/python-graph-diff](https://github.com/mathstuf/python-graph-diff/blob/959a846766c3707096d6cbefcdda03243d79aad0/docs/index.md) `959a846766c3707096d6cbefcdda03243d79aad0` | [MIT](https://github.com/mathstuf/python-graph-diff/blob/959a846766c3707096d6cbefcdda03243d79aad0/LICENSE)，2021-02-09 | 官方` samples/before.dot + after.dot → diff.dot`，可接Graph-Easy终端色彩；Python/pydot。源码以node label作集合身份、边为src/dest/label。 | 小工具是好对照，但不适合作Archify comparator。label重命名可能成为del/add；平行边set会失去逐条identity。源码还有label自比较笔误，不能把其结果当golden oracle；未运行复现，不在此断言某个具体输出必错。 |
| [jrfonseca/xdot.py](https://github.com/jrfonseca/xdot.py/blob/d2066a4bba06a66ae1c764a864e1fb9ffe76e953/README.md) `d2066a4bba06a66ae1c764a864e1fb9ffe76e953` | [LGPL-3.0 LICENSE.txt](https://github.com/jrfonseca/xdot.py/blob/d2066a4bba06a66ae1c764a864e1fb9ffe76e953/LICENSE.txt)，2026-03-19 | DOT→交互vector图；F查找、区域zoom、点击edge去source、Ctrl-click去destination；有sample.py与tests/graphs/viewport.gv。 | edge端点导航很具体，但Archify已有关系list/pin和明确from/to；组合键点击不一定比现状少操作，且触屏/发现成本高。**不推荐另加隐蔽Ctrl-click语义**，不引入GTK。 |
| [furiosa-ai/dot-viewer](https://github.com/furiosa-ai/dot-viewer/blob/657ee77c2e83745d1d976441bd62fe019dd78ef8/README.md) `657ee77c2e83745d1d976441bd62fe019dd78ef8` | [Cargo.toml声明MIT](https://github.com/furiosa-ai/dot-viewer/blob/657ee77c2e83745d1d976441bd62fe019dd78ef8/Cargo.toml)；独立LICENSE文本未核实，2023-10-11 | DOT→Rust TUI当前/前驱/后继列表；neighbors depth、search filter、subgraph各开新tab；导出当前view为DOT，再可调用xdot。 | 明确“当前view”与原图不同很重要。但Archify前批已经有bounded dependency input和Reach候选；不再造一份子图状态/重新layout，不捆绑Graphviz C库/xdot。 |
| [xuyangy/interactive-graphviz-preview.nvim](https://github.com/xuyangy/interactive-graphviz-preview.nvim/blob/e53a87a69b840366a6901b9b91e148bda1ee8d15/README.md) `e53a87a69b840366a6901b9b91e148bda1ee8d15` | [MIT](https://github.com/xuyangy/interactive-graphviz-preview.nvim/blob/e53a87a69b840366a6901b9b91e148bda1ee8d15/LICENSE)，2026-08-15 | DOT buffer→browser WASM SVG/独立HTML；reload保留view和仍存在的highlight；node/edge搜索；`f` fit highlighted集合；bad graph保留last good；可选cluster proxy语义zoom。 | 搜索匹配画布前批已做，不再推荐。图reload后按ID保留选择值得借鉴，但Archify preview已有last-good与输入更新保护；cluster proxy会改authored topology/导出语义，成本高，暂不集成。其SVG导出含当前view，与Archify canonical contract不同。 |
| [antvis/XFlow — diff模块](https://github.com/antvis/XFlow/blob/faa44bf048c92ac14108f10c0a9a3bffb5e4cd2f/packages/diff/src/components/DiffGraph/index.tsx) `faa44bf048c92ac14108f10c0a9a3bffb5e4cd2f` | [MIT](https://github.com/antvis/XFlow/blob/faa44bf048c92ac14108f10c0a9a3bffb5e4cd2f/LICENSE)，2026-01-04；README明确不再active维护 | `originalData/currentData {nodes,edges}`→左右graph，ADD/DEL/CHG attrs；[util](https://github.com/antvis/XFlow/blob/faa44bf048c92ac14108f10c0a9a3bffb5e4cd2f/packages/diff/src/util/index.ts)按id和JSON.stringify(data)比较，scale/translate双向同步有isSyncing guard。 | **核心启发是同一identity的before/after事实邻近阅读**，不是复制其comparator。它比较data而非Archify字段分组；坐标同步不等于语义位置对齐。项目已停止迭代，不引入React/X6。 |
| [magjac/d3-graphviz](https://github.com/magjac/d3-graphviz/blob/355158dc789ff8556549018a0c0f7a567ac0bfc3/README.md) `355158dc789ff8556549018a0c0f7a567ac0bfc3` | [BSD-3-Clause](https://github.com/magjac/d3-graphviz/blob/355158dc789ff8556549018a0c0f7a567ac0bfc3/LICENSE)，2024-10-14 | DOT序列→SVG morph、node/edge fade与path tween；keyMode默认title，另有id/index。[src/dot.js](https://github.com/magjac/d3-graphviz/blob/355158dc789ff8556549018a0c0f7a567ac0bfc3/src/dot.js)确按配置给datum.key。 | 说明identity先于视觉morph。Archify已有稳定ID，不用动画才能证明“同一项”。动画会引入中间非authored几何和Motion Governor耦合；本轮**不推荐morph对比**。 |
| [mirl-ucsb/mirl-collate](https://github.com/mirl-ucsb/mirl-collate/blob/83f1fdc9fbf863fb3da177bab581f77003a52830/README.md) `83f1fdc9fbf863fb3da177bab581f77003a52830` | [MIT](https://github.com/mirl-ucsb/mirl-collate/blob/83f1fdc9fbf863fb3da177bab581f77003a52830/LICENSE)，2026-09-09；README说active development、尚未announced | 2–4图片/IIIF→并排共享zoom、curtain/onion/blink/difference；PNG/项目JSON/marker CSV导出。默认public facade样例。 | 适合**视觉证据对照**，不能替代图语义diff。source coords是图像位置，不是节点identity；项目JSON本地image需重选文件。可借鉴side-by-side，先不做annotation/provenance平台。 |
| [openseadragon/openseadragon — viewport模块](https://github.com/openseadragon/openseadragon/blob/0866e108e9a383e173180ad639232c808f82f7d2/README.md) `0866e108e9a383e173180ad639232c808f82f7d2` | [BSD-3-Clause](https://github.com/openseadragon/openseadragon/blob/0866e108e9a383e173180ad639232c808f82f7d2/LICENSE.txt)，2026-10-22 | 影像tile source→deepzoom viewport，image/viewport坐标转换。MIRL Collate明确vendored使用它。 | 研究的是坐标转换与同步需要的界限；Archify是已有SVG camera，不引入tiles/image pyramid。它保证坐标映射，不知道两个不同版本图中哪个node对应哪个。 |
| [DessimozLab/phylo-io](https://github.com/DessimozLab/phylo-io/blob/2b00e3aa3cd03f79913f4f972b30cfb3b4038263/README.md) `2b00e3aa3cd03f79913f4f972b30cfb3b4038263` | [MIT LICENSE.txt](https://github.com/DessimozLab/phylo-io/blob/2b00e3aa3cd03f79913f4f972b30cfb3b4038263/LICENSE.txt)，2026-01-30 | 官方Newick字符串示例→两个container，compareMode/bound_container配对；可导出tree图、分享session。针对phylogenetic tree，不是通用code graph。 | 树的叶序调整/对应关系和code graph稳定ID不是同一个问题。不能把有向环/多父节点压成树，也不为“对齐”改变authored节点顺序；仅保留domain-specific comparison反例。 |
| [mapbox/pixelmatch](https://github.com/mapbox/pixelmatch/blob/ab76f526ef951c0ec6284e314a700e161b1800e6/README.md) `ab76f526ef951c0ec6284e314a700e161b1800e6` | [ISC](https://github.com/mapbox/pixelmatch/blob/ab76f526ef951c0ec6284e314a700e161b1800e6/LICENSE)，2026-10-06 | 等尺寸RGBA typed arrays/PNG→diff image+pixel count；有AA排除、per-pixel threshold、windowSize/ignoreMask；[index.js](https://github.com/mapbox/pixelmatch/blob/ab76f526ef951c0ec6284e314a700e161b1800e6/index.js)校验dimensions。 | **适合截图定位，不适合架构变化计数**。threshold是颜色距离容忍不是“允许10%图变化”；同语义重排会有大量像素差，改一条关系也可能视觉差很小。仅作review辅助，不变硬门槛。 |

沿官方链查找的例子：dot-viewer README直接要求xdot；MIRL技术章节指向OpenSeadragon，随后读其调用代码；d3-graphviz README的object-constancy章节指向src/dot.js；python-graph-diff自己的docs指向原yeger00/graph-diff来源，不把fork和原仓库重复算两个工具。搜索引擎/第三方索引仅找线索，功能判断以上表固定一手源码为准。

## 四、优先冻结切口：Delta关系旧→新值

### 真实最小用户任务

输入是仓库现有原字节，而非为本功能修改的fixture：

- [checkout-platform.base.architecture.json](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/examples/checkout-platform.base.architecture.json)
- [checkout-platform.head.architecture.json](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/examples/checkout-platform.head.architecture.json)

两个可直接问答的问题：

1. `persist-order`的关系文字到底从什么变成什么？**SQL → SQL tx**。
2. `authorize-payment`改了哪个端点？**from: orders → fraud，to: payments保持不变**；该条同时有geometry变化，不把它简化成只有换线位置。

当前Delta的Exact row告诉读者`/label`或`/from`，图上semantic-only label更改只显示head label，旧label不是该row的可读内容；要拿确切旧值需去Before图查找或读receipt。候选在选中这一行后把现成before/after内容列在该行/附近，**不需要自己打开两个详情、切图后重新找同一边或凭箭头猜端点**。这是真实回答任务的差异，不预先声称时间节省。

### 冻结行为

- 只读当前生产器已经绑定的receipt，先支持relationship行的`label/from/to`。component labels有数据但不是必须；不支持的字段明确“Values not recorded in this receipt”，不伪造完整field diff。
- 继续用现有change row selection、index、keyboard与Overview/Previous/Next。不要加第二套selected change状态、new index、autoplay或panel全局管理器。
- `label === ''`显示 **Empty or not supplied**；不能分别标missing/empty。关系整侧缺失按added/removed明确不存在；invalid/缺字段与空字符串分开，不能用`value || ''`把坏数据伪装成空。
- endpoint在有效producer输出中是必需字符串；不从geometry恢复端点、不把short display label代替node ID；同名节点仍按id区分。
- literal安全使用`textContent`/DOM文本节点。`<script>`、`</script>`、`&`、引号、CJK、`$&`/`$1`/`${...}`/反引号必须保留为文本，不进入innerHTML、模板求值或字符串replace替换解释。
- selection前继续走`validateReview()`/`targetsMatch()`；receipt/row/target身份不匹配走`failReview()`并**清空旧新值**，不能留下上一行值造成假对照。合法ID但值类型异常应显示unavailable或拒绝详情，不把对象`String()`成`[object Object]`。
- Overview、invalid selection、无变化、切换record后的详情生命周期必须明确；只渲染所选合法record。不要使隐藏的旧记录被误认成当前值。
- 这只沿用生产器和现有review的identity检查，**不宣称页面获得密码学防篡改证明**。不能把一个外部任意receipt拼进另一个HTML；source capture、hash、proofLevel等沿现有compare公共路径，不放宽。
- 不改变compare receipt schema/version、分类/计数、SVG、route、graph geometry、Before/After iframe、canonical export；没有新diff algorithm、重新解析源码或同步camera。

### Owning函数与focused测试入口

| 责任 | 当前入口 | 建议验证 |
| --- | --- | --- |
| 比较/receipt事实 | `compareArchitecture()`、`fieldChanges()`、`compareEntities()` | 复用既有receipt。确认新增UI不改变receipt JSON/count/classification，不为没有记录值的字段扩schema |
| HTML detail数据 | `renderArchitectureDeltaHtml()`的rowHtml与safeJson/esc | 只投影受支持事实；区分absence/normalized blank/unavailable，literal不执行 |
| selection和failclosed | 内嵌`validateReview()`、`targetsMatch()`、`selectChange()`、`overview()`、`failReview()` | identity失配时不显示旧新值；row选择/keyboard/Review切换仍同一记录；Overview清理 |
| Node行为/生成回归 | [test/architecture-delta.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/architecture-delta.test.mjs) | receipt合同、row身份、现有真实checkout用例，避免新建镜像算法测试 |
| literal边界 | [test/architecture-delta-literals.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/architecture-delta-literals.test.mjs) | 扩现有字面量矩阵，真实DOM里文本一致且无执行/破坏 |
| ghost/identity | [test/architecture-delta-markers.test.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/architecture-delta-markers.test.mjs) | 不改变old/new ghost与markers集合 |
| 真实browser review已有断言 | [test/webm-artifact.smoke.mjs](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/test/webm-artifact.smoke.mjs)里的`verifyArchitectureDeltaNavigator(file)`（约619行） | 已有真实浏览器row/Prev/Next/播放/mismatch检查可复用设计；当前脚本**没有Delta-only选择开关**，不要谎称已有独立命令，也不为这个小UI跑无关FFmpeg/WebM全套 |

最便宜的新增证据应落在当前delta Node/literal suites和一个严格聚焦的真实browser场景。编写测试是为了防止旧值配错行、空值误标、literal执行、identity失配泄露旧详情；不要冻结自动布局坐标或只匹配实现源码。

### 截图和证伪

固定同一对checkout输入、1440×1000、same preset/theme、Still。base/candidate分别选persist-order row，首张候选应一屏读到`SQL`与`SQL tx`且仍看见同一关系的Delta强调；第二张选authorize-payment，读到orders→fraud和payments未变。390×844核对ID/旧值不横向挤坏page，完整字符串可读或可明确展开。

合成只补边界：空/省略label、added/removed整侧、恶意literal、同名node不同ID、mismatched receipt/DOM targets。不用合成大图证明主要收益。候选如果仍要读者切Before/After才能回答上述两个问题，或新增详情遮住exact row/图，判定实验失败。

## 五、第二机制：同步画面不等于对齐同一对象（暂不推荐runtime）

XFlow的`syncGraph()`同步同一scale/translate，并用guard阻止反馈循环。MIRL [js/viewers.js](https://github.com/mirl-ucsb/mirl-collate/blob/83f1fdc9fbf863fb3da177bab581f77003a52830/js/viewers.js)更谨慎：viewport→image坐标，再除以content width/height变成fraction，映射到目标image，`EPS=1e-6`避免小误差循环。**二者都没有按node ID对齐**。

可证伪试验：用现成checkout before/head，锁定同一个`queue`，它的pos从`[430,400]`到`[430,420]`。原样同步屏幕坐标，旧/新queue并不会位于同一屏幕点；新增节点改变viewBox/长宽比时fraction同步也不代表同一个模块。再用仅theme/preset变化但topology相同的一对图，观察同步图像是否有额外价值。

如果真要做，应优先“选中同一个stable ID时分别reveal”，不是复制camera变换矩阵。那又涉及Before/After iframe初始化、缺失一侧、跨view控件和Atlas camera范围；相比上述窄值详情成本明显更大。当前没有读取任务证明必须两个panes同时存在，所以**只保留独立review证据页/人工对照思路，不建议共享Viewer同步相机**。

截图若将来实施：必须在同一张图标出输入identity、viewport和“coordinate-linked，not node-aligned”；移位queue的原始坐标可核对。不能通过先重排输入把失败藏起来，也不能把影像slider当成topology证明。

## 六、第三机制：像素差与authored差要分开回答（仅证据辅助）

Pixelmatch的等尺寸RGBA比较适合指出截图哪个区域改变；其per-pixel threshold/AA处理不能判断组件意义。d3-graphviz的keyMode又说明视觉连续性依赖identity：title/index/id不同策略，会把重命名或数组重排表现成不同动画。

可证伪试验不用新增产品功能：同一checkout JSON只改变主题，**语义delta应不变但pixel diff大**；仅移动queue，topology保持但pixel diff出现两处轮廓；把persist-order的SQL变SQL tx，精确label delta存在但像素差局部很小。固定viewport/fonts/preset/motion后采两张图，保存公开输入hash/图像hash与pixel参数；该结果只是辅助审图，不纳入“没有架构变化”或“可以merge”判据。

成本低的是研究产物或测试诊断附件；高成本的是自动registration、截图裁剪、ignore-mask维护及把像素分数做硬gate。Archify已有typed comparison与可复现render，不建议在本轮再加入pixelmatch runtime依赖或一个混淆语义的“图相似度”分数。

## 七、本轮负面筛选与交接

- 不复制python-graph-diff的label身份/集合策略，尤其不丢平行关系、重复label或方向。
- 不将phylogenetic tree算法套到有向code graph；不自动排列/折叠节点来制造“对比更整齐”。
- 不引入morph作为默认Review动画；它增加中间几何、reduced-motion、导出与身份匹配耦合，当前exact事实UI更小。
- 不把xdot edge click modifiers或dot-viewer新tab子图搬进已有Focus/Route；已有一动作能做到的事不再加第二按钮。
- 不复制已停更XFlow图引擎，不把component `data`对象比较当作Archify全部字段合同；不从npm/项目宣传推断维护保证。

**已完成**：10个新来源；固定commit、许可层次与官方样例/实际输入输出格式；当前Delta真实负责函数与测试入口；真实checkout两个问答；三个可证伪机制的收益/成本/限制；与source-navigation scout分工。**未完成**：上游运行、实现、browser验证、截图、实测定位/效率收益。报告冻结后优先交实施者“Delta关系旧→新值”这一刀；其余两个机制暂不推进runtime。
