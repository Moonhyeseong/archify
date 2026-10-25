# Source 阅读窄审计：长路径、长代码行与多来源交接

日期：2026-10-25。固定产品源码：`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。本轮只读源码、完整既有输入与已生成产物，不开浏览器、不运行测试、不改产品。结论：**0 个已复现的新缺陷，暂不建议实现。** 下文的几何疑点是待浏览器验证项，不是失败结论；也不将已有预览限制改称源码丢失。

## 真实输入与确定项

使用两份已经发布的完整输入，不增加极端字符串或改写来源关系：

| 输入/产物 | 固定来源与本地位置 | 字节 / SHA-256 |
| --- | --- | --- |
| CLI tour 完整 Markdown | [1dff88d3](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/cli-reading-tour.archify.md)；`lab-cli-reading-tour/archify/experiments/cli-reading-tour/cli-reading-tour.archify.md` | 6754 / `5eec8481a740baec23a8898d6f4885315c5f327551aa156592d25afbf789275d` |
| CLI tour 原 HTML | 同一实验 `output/tour.html`；这是历史发布产物，不假称由本轮 dev 重建 | 686303 / `7814b929dd002ea2b1083575899cf0739ce83effd84488251cf85addb7bce190` |
| Source question tour 完整 Markdown | [94d6a4d0](https://github.com/tt-a1i/archify/blob/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour/question-first.archify.md)；`lab-source-question-tour/archify/experiments/source-question-tour/question-first.archify.md` | 4840 / `9f5e7248ad180c02ddbc3d774b66fc97a43743eaba8ad12fa0eab9e45440ae0b` |
| Question-first 原 HTML | 同一实验 `question-first.html`，历史产物 | 867550 / `b8803bb7eef4e2aba87b1adcb66ecb154786c26ae6c7a5218dce54a6b9e4ceee` |

本地 worktree 名称相对于共同的 worktrees 目录；报告不嵌作者个人绝对路径。CLI tour 引用 Walkthrough `a373526c92bd1d4c3953370b9a57f19e4fb15d08` 的 MIT 源码；question tour 引用 Archify `82c7e0f089a02a4d514714adf37dc2061682da5f` 的 MIT 源码。这里核对已有摘录，不运行这些程序。

另只读 `lab-source-keyboard/archify/experiments/source-keyboard/base/prepared-page.json` 中已冻结的来源数据，统计 CLI tour 11 个 prepared sources：全部有固定原文 URL；最长路径是 `packages/visualizer/src/data/context.tsx`，40 字符，不能作为“长路径已溢出”的证据。`no-bundle` 的真实代码行最长 201 字符，`http-snapshot` 是 84–98 共15行；这些提供自然检查入口，而非已经证实的布局失败。

## 当前 owner 与排除理由

1. **长路径不是静态可证的截断。** [reader.css L303–319](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.css#L303-L319) 的 `.source-head` 有 `min-width:0`，`.source-where` 有 `overflow-wrap:anywhere`。标题没有独立的强制任意断行，但所检查的真实标题没有提供“连续超长 identifier 被遮住”的实例；不为证明问题拼一个新标题。
2. **长代码行有既有滚动入口。** 全局 `pre` 的 `overflow:auto`、`max-width:100%` 与 source-card 行的 `white-space:pre` 同时存在（reader.css L254、311–313）。因此201字符代码行的存在不等于行尾不可读。需要真正观察 scrollWidth/clientWidth 与横向滚动后的行尾，不能从截图只见左半段就推断丢失。
3. **预览14行不等于完整声明范围不可读。** [reader.js L615–626](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L615-L626) 明确 `slice(0,14)`，超过则显示省略号。CLI `http-snapshot` 第98行不在前14行，但卡上原路径仍写84–98，footer提供固定源码 URL。Question tour正文明确“预览最多14行”，五个 `@code` 保留完整声明范围；[render.mjs L80](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs#L80) 直接渲染完整 `source.text`。不能据此新增另一套展开控件。
4. **多来源没有静默折叠的证据。** CLI结论“写入文件与准备HTTP响应分别调用JSON.stringify”已经有相邻的 `write-file` 与 `http-snapshot` 两个citation；两者来源不同，用户分别focus/hover原编号即可。`nodeSources` 是单节点到单来源ID的现有合同（[schema L488–496](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/schemas/explainer.schema.json#L488-L496)）；真实输入把两处证据分别绑定到两个节点。没有用户必须在一个节点读取未表达的第二来源的实际失败，不建议扩成数组/多卡状态。
5. **完整引用身份已有入口。** 卡底只显示revision前7位，但页尾Sources的location包含完整revision/path/range，[render.mjs L107–113](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs#L107-L113)。不能把短pin标记当成唯一证据身份，也不能把外部网络可达当成本轮已验证事实。

## PR 与已做实验排重

本轮 GitHub 一手API查询：#1015、#1103 均 OPEN。未执行PR代码。PR元数据、files列表和#1015固定reader源码只读取得；本地尚无相应head路径对象时使用GitHub contents API，未据失败的本地 `git show` 推断文件不存在。

- [#1015](https://github.com/tt-a1i/archify/pull/1015)，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`：其 [reader.js L725–749](https://github.com/tt-a1i/archify/blob/fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8/archify/explainer/reader.js#L725-L749) 已有focus范围居中、`Show all N lines`、源码复制；定位也已有 `Math.max(8 + scrollY, ...)` 顶部夹取。dev卡在below不够时直接放above、没有同样top clamp只是静态疑点（L628–633），已存在相关在审实现，不能另造同功能分支。这里不替#1015声称实际视觉通过；它也不等于已合入dev。
- [#1103](https://github.com/tt-a1i/archify/pull/1103)，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`：files列表新增 `archify/modules/code-analysis/overlay/atlas.mjs` 等，处理Atlas代码图导航/Classic交接；本轮不再建议repo-map、module/file/function导航或来源索引。
- Passport属于native图节点关系阅读；本轮没有发现它能够或必须替代Explainer源码卡。已发布 source-question-tour 正是完整代码块补足预览的内容级做法。
- source-keyboard 已处理AX动作与Enter/Space；Tab可达和焦点阴影原本存在，不再次申报。Clipboard outcome 与diff行号分支也不属本轮。

## 可选最小浏览器检查计划（尚未运行）

当前不需要为报告另占浏览器。若协调Agent认为值得，仅在现有CLI tour与question-first原产物检查以下动作，并先确认其历史runtime与dev10b差异；需要dev结论时必须由完整既有输入正常生成新基线，不能换两行脚本后假称同一产物。

| 实际输入与动作 | 要观察的事实 | 失败门槛与现有解决入口 |
| --- | --- | --- |
| CLI tour正文 `no-bundle` citation，focus卡，再横向滚动201字符那行 | 卡/代码区clientWidth、scrollWidth、真实行尾是否可达；路径是否全字保留 | 若现有滚动能到行尾，则无缺口；不可只看初始左端截图 |
| CLI tour相邻 `write-file` / `http-snapshot` 两个citation，依次focus | 每次卡的path/range/固定URL是否分别对应原来源 | 两张卡准确切换即满足，不需要新多来源模型 |
| Question-first图 `git` 或 `bind` mixed节点，focus后阅读card与页内完整code | header、paragraph、pre、footer的实际bounding boxes与viewport关系，实际还能否到footer | 若只是卡预览少行，使用既有@code/固定链接；若实际卡顶越出viewport，优先归并#1015定位范围，不直接实施重复修复 |

没有实际bounds/动作记录前，不能称长路径溢出、尾行不可达、来源混淆或视口遮挡已复现；也没有阅读效率、理解收益或真人可访问验收结论。本轮明确保持研究，不添加content页面、parser、schema、来源状态或共享产品代码。

## 固定源码指纹

| dev10b文件 | SHA-256 |
| --- | --- |
| archify/explainer/reader.js | `e495d020eb932cbb5894bffcc683788ac3b9ff895ad56a47cd98c1b87a9e1097` |
| archify/explainer/reader.css | `1f2a0b589b39f08af36012e9fadad79a7939ec8c52e2e0cb53018d9431aee1fd` |
| archify/explainer/render.mjs | `e672ef1dbed8955f8424a0a64383033201940588f013c1bb0e7ec00b281af8ed` |
| archify/explainer/validate.mjs | `0167697bb8201c3268b014323f291deed0ed689b041117969da9906695dd908c` |
