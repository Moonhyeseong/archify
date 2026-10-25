# 比较阅读 round 5：保留字面证据，暂不新增比较器

2026-10-25，只读研究。按 hub README 与现有全部 scouts 的 GitHub 仓库路径排重，本轮 7 个来源均未在已有报告出现；`oug-t/difi` 的 GitHub API 实际重定向为 `xguot/difi`，只计一次。不采集星数，不按热度排序。使用 research 的一手来源方法；这里只新增本文，没有安装、运行上游工具/测试/服务、打开 Ego、复制上游图片、创建实现分支或修改产品。

**结论：目前没有足够证据再做一个产品比较器或内容实验。** 最接近的机制是“把不可见空白显形”，但本轮已提交的短 fixture 没有证明 Archify 现有阅读入口丢失了需要新交互才能辨认的信息。JSON 数组移动箭头有清楚实现，却与既有 payload-delta 的身份/顺序范围重叠；不为箭头重做差分算法。

## 基线与重复边界

产品核对固定到 [dev `67f12389212c54b3122da60e2813c7f8dab7ab2f`](https://github.com/tt-a1i/archify/commit/67f12389212c54b3122da60e2813c7f8dab7ab2f)。本轮用 `git show` 读取该 revision 的源码，不把其他实验分支能力视为已合入。

- [diff.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/diff.mjs) 保存 `raw`、`text`、`ending`、old/new 行号，接受 two-way unified/fragment，明确拒绝 combined/binary，不把原文改造成另一个 diff。解析时分离 diff 文本本身的 CRLF，并不等于知道源文件的全部换行语义。
- [render.mjs L84](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/render.mjs#L84) 以 `escape(row.raw)` 输出每行，保留 `+/-/ ` 前缀与旧/新行号；[reader.css L256–267](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/reader.css#L256) 采用 `white-space:pre`、滚动容器、整行增删底色。没有看到字内 diff 或可见空白开关，但**缺少开关不是已证缺陷**；普通 snippet 与旁注本来能解释字面证据。
- 已有 task-review-map 提供 hunk/range 记账；payload-delta 保留 JSON Pointer、类型、missing/null、显式数组 index/idKey；diff-line-numbers 修不换行的行号；copy-identity/关系引用处理身份；delta-values 是已有 receipt 的值读取。这里不重复这些合同。
- 实际核对 [draft PR #1102](https://github.com/tt-a1i/archify/pull/1102)，head `3b5b16c0d8924e2d6ab26f2d18ec50453cde2390`、base dev：其 nodeExplanation/drilldown/compare translation 集成不是空白显示机制；该 head 的 [Explainer render.mjs](https://github.com/tt-a1i/archify/blob/3b5b16c0d8924e2d6ab26f2d18ec50453cde2390/archify/explainer/render.mjs#L84) 仍是同一 `escape(row.raw)` 路径。没有因为 draft 未合入就把其工作重新列为机会。
- 实际核对 [draft PR #1103](https://github.com/tt-a1i/archify/pull/1103)，head `a0348855a217c7c0098a7d2079f470dc8cfa02b8`、target `labs/code-analysis`：变更集中在 Atlas payload/canvas、Classic hand-off 与相关浏览器测试。[atlas.mjs](https://github.com/tt-a1i/archify/blob/a0348855a217c7c0098a7d2079f470dc8cfa02b8/archify/modules/code-analysis/overlay/atlas.mjs) 展示 module/file/function、依赖、复杂度/cycle/findings，不是文本/JSON 比较页。不扩大本轮研究成代码分析新视图。两个 PR 当时均 open/draft；这不是通过或合入判断。

## 七个新来源：输入、实际输出与边界

下面的实现位置和 fixture 均从固定 GitHub revision 取原始文件核读；许可证也读了文件正文，没有只依赖 API 的 SPDX 标签。输出说明来自代码/已提交 fixture，**未实际运行其交互**。

| 来源 | 固定 revision / 许可 | 输入→实际输出 | 小机制与实现位置 | 不能据此声称 |
| --- | --- | --- | --- | --- |
| [benjamine/jsondiffpatch](https://github.com/benjamine/jsondiffpatch/commit/a60db8a232f92ee4b987c14f43f77402885d1a5a) | `a60db8a232f92ee4b987c14f43f77402885d1a5a`；[MIT](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/MIT-LICENSE.txt) | JS/JSON 左右值→结构 delta、HTML/annotated/JSON Patch 等 formatter | 把已判定 move 的旧位置画到目标 index；[packages/jsondiffpatch/src/filters/arrays.ts](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/filters/arrays.ts)、[packages/jsondiffpatch/src/formatters/html.ts](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/formatters/html.ts) | 不是业务身份发现；箭头不证明真实事件/数据流 |
| [josephburnett/jd](https://github.com/josephburnett/jd/commit/15edb8bff471ef94917614193b1c892eb80e305e) | `15edb8bff471ef94917614193b1c892eb80e305e`；[MIT](https://github.com/josephburnett/jd/blob/15edb8bff471ef94917614193b1c892eb80e305e/LICENSE) | JSON/YAML 左右值与 options→带路径的 jd hunks；有 Web presenter | 把 SET/MULTISET/precision 选项写在输出头；[spec/cases/options.json](https://github.com/josephburnett/jd/blob/15edb8bff471ef94917614193b1c892eb80e305e/spec/cases/options.json)、[v2/internal/web/presenter/presenter.go](https://github.com/josephburnett/jd/blob/15edb8bff471ef94917614193b1c892eb80e305e/v2/internal/web/presenter/presenter.go) | 相同输出可能依赖容差/集合规则，不等于字节相同 |
| [homeport/dyff](https://github.com/homeport/dyff/commit/8801e8ed76df99e67fd56c3ebdda8d058a5313a7) | `8801e8ed76df99e67fd56c3ebdda8d058a5313a7`；[MIT](https://github.com/homeport/dyff/blob/8801e8ed76df99e67fd56c3ebdda8d058a5313a7/LICENSE) | 两份 YAML/JSON 文档→带 document path 的紧凑人类报告 | 结构路径之外，多行 scalar 仍展示内层文本 diff/省略上下文；[pkg/dyff/output_human.go](https://github.com/homeport/dyff/blob/8801e8ed76df99e67fd56c3ebdda8d058a5313a7/pkg/dyff/output_human.go)、[assets/kubernetes/configmaps/expected-dyff-spruce.human](https://github.com/homeport/dyff/blob/8801e8ed76df99e67fd56c3ebdda8d058a5313a7/assets/kubernetes/configmaps/expected-dyff-spruce.human) | YAML scalar 内容不是自动解析出的嵌套 schema，也不是部署影响 |
| [jeffkaufman/icdiff](https://github.com/jeffkaufman/icdiff/commit/e8dd4a3041baeb66a11589e308362608c88cdd47) | `e8dd4a3041baeb66a11589e308362608c88cdd47`；[LICENSE 含 PSF v2 与历史 Python 许可链；API 为 NOASSERTION](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/LICENSE) | 两份文本→ANSI side-by-side 与字内标色 | 空白片段用背景/反色而非不可见字色；tab 先保留区别再扩展；[icdiff.py](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/icdiff.py)、[test.sh](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/test.sh) | 终端颜色/宽度和tabsize不是 HTML 阅读实证；不直接移植其许可复杂代码 |
| [so-fancy/diff-so-fancy](https://github.com/so-fancy/diff-so-fancy/commit/7dca929b2468ccb296a08c92e7e39b7754d63a8e) | `7dca929b2468ccb296a08c92e7e39b7754d63a8e`；[MIT](https://github.com/so-fancy/diff-so-fancy/blob/7dca929b2468ccb296a08c92e7e39b7754d63a8e/LICENSE) | 已有 Git/diff 文本→ANSI 阅读输出 | 给增删空行标可见色块，属于显示层；[diff-so-fancy](https://github.com/so-fancy/diff-so-fancy/blob/7dca929b2468ccb296a08c92e7e39b7754d63a8e/diff-so-fancy)、[test/fixtures/add_remove_empty_lines.diff](https://github.com/so-fancy/diff-so-fancy/blob/7dca929b2468ccb296a08c92e7e39b7754d63a8e/test/fixtures/add_remove_empty_lines.diff) | 显示重写不是可重放 patch，也不是语义/正确性检查 |
| [yoshiko-pg/difit](https://github.com/yoshiko-pg/difit/commit/82a765c037ec28fe7fe90ab2f1e4b5748032b4fa) | `82a765c037ec28fe7fe90ab2f1e4b5748032b4fa`；[MIT](https://github.com/yoshiko-pg/difit/blob/82a765c037ec28fe7fe90ab2f1e4b5748032b4fa/LICENSE) | Git revision/range 的文件与hunk→本地Web review与comment prompt | 评论携带 file/old-new side/line，可加 requested/resolved range；[src/client/components/DiffChunk.tsx](https://github.com/yoshiko-pg/difit/blob/82a765c037ec28fe7fe90ab2f1e4b5748032b4fa/src/client/components/DiffChunk.tsx)、[src/utils/commentFormatting.ts](https://github.com/yoshiko-pg/difit/blob/82a765c037ec28fe7fe90ab2f1e4b5748032b4fa/src/utils/commentFormatting.ts)、[public/site-data/snapshots/7d40fd4...a72112f-comments.json](https://github.com/yoshiko-pg/difit/blob/82a765c037ec28fe7fe90ab2f1e4b5748032b4fa/public/site-data/snapshots/7d40fd4...a72112f-comments.json) | 评论是人工声明；不能成为已验证缺陷或PR通过 |
| [xguot/difi](https://github.com/xguot/difi/commit/06702b73c0b1f96afdc511e920e2d8dbc3b11fc2) | `06702b73c0b1f96afdc511e920e2d8dbc3b11fc2`；[MIT](https://github.com/xguot/difi/blob/06702b73c0b1f96afdc511e920e2d8dbc3b11fc2/LICENSE) | Git/Hg目标与changed files→终端文件树/diff/editor定位 | VCS接口明确DiffCmd、CalculateFileLine、OpenEditorCmd，减少重新找文件；[internal/vcs/interface.go](https://github.com/xguot/difi/blob/06702b73c0b1f96afdc511e920e2d8dbc3b11fc2/internal/vcs/interface.go)、[internal/ui/update.go](https://github.com/xguot/difi/blob/06702b73c0b1f96afdc511e920e2d8dbc3b11fc2/internal/ui/update.go)、[internal/ui/view.go](https://github.com/xguot/difi/blob/06702b73c0b1f96afdc511e920e2d8dbc3b11fc2/internal/ui/view.go) | 不是离线单HTML交付或源代码语义证明；需仓库/editor上下文 |

## 深读一：icdiff 的空白显形，为什么暂不能转成产品需求

[icdiff.py L136–157](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/icdiff.py#L136-L157) 在比较前把真实 space 暂时隐藏，再把 tab 展开的每一位保留为 tab 占位，避免过早把 tab 与 space 混成相同输入。[L470–526](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/icdiff.py#L470-L526) 根据 whitespace-only/change 片段切换反色或背景；这不是“把点号写进文件”。其中注释与分支不宜只读一句推断：实际返回的 ANSI 样式以及 `--show-no-spaces` / `--show-all-spaces` 共同决定可见性。

本轮专门核对了它已有、完整提交的短输入，而不是造一个很极端的空白案例：

| 固定 fixture | 原始 bytes / SHA-256 | 能证明什么 |
| --- | --- | --- |
| [tests/input-8.txt](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/tests/input-8.txt) | 9 B；`409fd0f6032493bbbc0e3feb4d6481ed4b84b99e14860874af061d261b4bdb21` | JSON 转义表示为 `"\tabc\tdef\n"` |
| [tests/input-9.txt](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/tests/input-9.txt) | 9 B；`90c24698163c25f22111b8896f17be2df971a755404ec19dd9074d3bf3f30dc0` | `"\taQc\tdQf\n"`；只把两个字符改成 Q，tab位置相同 |
| [测试命令 L149–150](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/test.sh#L149-L150) / [tests/gold-tabs-4.txt](https://github.com/jeffkaufman/icdiff/blob/e8dd4a3041baeb66a11589e308362608c88cdd47/tests/gold-tabs-4.txt) | 用上述两文件，比较默认 tabsize 与 `--tabsize=4` | 是对齐/字内字符标色的测试，不能当 tab→space 变化或 Archify 不可读的证据 |
| [test/fixtures/add_remove_empty_lines.diff](https://github.com/so-fancy/diff-so-fancy/blob/7dca929b2468ccb296a08c92e7e39b7754d63a8e/test/fixtures/add_remove_empty_lines.diff) | 128 B；`09a581bb0d5d3ac89a2dcf6fd27b9814c5fa795afa39dccd2a45a238f89193cb` | `1` 后增空行、`3` 后删空行；原 hunk 是 `@@ -1,5 +1,5 @@` |

对后一个现成 unified diff，Archify 当前 parser/render 路径保留新增空行的 `+`、删除空行的 `-`，以及对应 old/new 行号；因此不需要再加色块才能知道哪一行变动。对 icdiff 的 9B 成对文本，先转 unified diff 才能进入 Archify：这是输入格式适配，不是原工具显示失败；两个 Q 仍属于可见字符变化。这两个候选都未构成“现有原文+行号仍无法辨认”的自然反例。

本轮还只读查看了两项目提交的整个测试 fixture 集合，寻找 tab↔space 或行尾空白单独变化。没有找到可推荐的短成对自然实例。icdiff 的较长编码压力文本确有尾空白，但它同时含编码/控制字符问题，不拿其尾空白截取另造一个正常工作流，也没有声称穷尽所有上游问题。`diff-so-fancy` 的 header 尾 tab/空context行同样不能冒充源代码尾空白修改。

Archify 固定 dev 的 [docs/cases/explainer/tls-first-visit.html](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/docs/cases/explainer/tls-first-visit.html#L481) L481/L492/L1039/L1050 确有四条只含六个 space 的原始行（本地只读字节检查）；这说明生成文件允许保留空白，**不说明出现一个需要比较阅读的实际变化**。本会话生成 freshness 的 diff-check 曾遇到空白提示，也不能倒推为所有读者需要新增开关。不要为了让研究有产物去删原始生成字节或包装新页面。

最小条件候选仍可表述为：将来若有一份真实、完整、许可清楚的 whitespace-only change 交接，先用现有 diff block + 同位置短 snippet（JSON 转义文本、明确旧/新 side+行号）解释，原文仍可复制；在相同 viewport/字体下比较是否还有不可辨认的信息。只标 `\t`、ASCII space 的数量/位置；不能自动 normalize，不能把 Unicode不可见字符、换行、字节offset、UTF-16 column混为同一合同。当前既没有该自然对照，也没有读者验证，因此**不实施 content experiment，更不加共享 reader 状态、CSS 或公共 CLI**。

## 深读二：jsondiffpatch 的移动箭头有前提，不是更聪明的身份

[固定 movements fixture L854–866](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/test/examples/diffpatch.ts#L854-L866) 的源/目标序列是：

```text
left  = [1,2,3,4,5,6,7,8,9,10]
right = [1,2,3,7,5,6,8,9,4,10]
delta = {_t:"a", _3:["",8,3], _6:["",3,3]}
```

这里 `_3` / `_6` 是原数组位置，目标 index8/index3，尾部3是 move 标签。并非所有“看起来重排”都会得到同一 delta：[matchItems L48–75](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/filters/arrays.ts#L48-L75) 先比较 `===`，对象另依 `objectHash` 或显式/推导的 matchByPosition。[arrays 文档](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/docs/arrays.md) 自己说明没有对象身份匹配会退回位置；文档中的 `name || id || _id || index` 示例不能直接采用为 Archify 的唯一身份规则。

[format_moved L175–205](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/formatters/html.ts#L175-L205) 输出目标 index 与 SVG 箭头，[adjustArrows L257–292](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/formatters/html.ts#L257-L292) 再根据实际 DOM 的垂直位置调整。它展示的是该差分算法选择的序列对齐结果，不是操作历史、API流量、因果边或用户真的把元素拖动了。

与现有 payload-delta 比，新增收益只可能是把同一 id 的 oldIndex/newIndex 就地连起来；但现有实验已让数组策略在图中可见，并拒绝重复/缺失 idKey，避免猜身份。移植算法会引入对象哈希、LCS tie、重复值匹配和 DOM箭头布局责任；仅为两条移动画图不值这个成本。若任务只是解释“同一对象重排且字段变更”，现有 payload-delta 的 adjacent before/after 与 Pointer 表已能表达，不再做一个 JSON reader。

`jd` 的现成 fixture 进一步说明**比较策略本身也是证据**：[spec/cases/options.json](https://github.com/josephburnett/jd/blob/15edb8bff471ef94917614193b1c892eb80e305e/spec/cases/options.json) 中 `[1,2,3]`→`[3,1,2]` 配 `SET` 时 expected_output 是空串；另一个 tags 示例明确在头部输出 `^ "SET"`。precision 容差也可能抑制数值差异。这适合检查研究声明是否隐藏规则，不是给 payload-delta 添加 SET/precision 的理由；Archify 不能把“该规则无差异”说成原始 JSON 相等。

## 其余取舍与最终建议

- **dyff：不新建 nested-config reader。** 已提交 configmap fixture 将 `data.pinniped.yaml` 作为多行文本，报告 `renewBeforeSeconds` 从2160000到12160000，并省略五行未变上下文。它不推断内层 YAML 的 schema。现有 Explainer prose+diff 已足够呈现“一处结构路径+局部文本改动”；没有值得维护的新导入合同。
- **difit：不新建 comment-to-agent 框架。** 固定源码已将 requested/resolved revision、old-side/line 与 comment codeSnapshot分开；有无范围头取决于是否 working/staged/stdin 等。其提交的演示 snapshot 有 `revision/diff/blobs/blobUrls/comments`，comments 含 `position.side/new line` 和 `codeSnapshot`。这些是作者/评论证据，不是测试结果。Archify task-review-map/source preview 已保留固定来源；把交付消息做准确可用，优先用已有固定来源与 Clipboard outcome 的复制结果约束，不能假定新增评论入口有价值。
- **difi：不做终端工作流复制。** 它的收益依赖本地仓库、目标 branch 与 editor，VCS接口不提供可独立交付的机器证明。Archify 的离线说明用途不同，不能仅因文件树方便就搬一个常驻 sidebar。
- **diff-so-fancy：不改写可复制原文。** 空行色块是终端渲染选择；Archify保留前缀/行号已有信息。若未来只借显示灵感，应让装饰与原文分开，并检查复制/选择/辅助技术结果；本轮没有实施理由。

因此本轮推荐 **0 项立即实施**。保留一个条件问题“真实 whitespace-only diff 的可读性是否不足”，无需新 parser、converter 或产品开关。后续只有在完整自然 fixture、现有入口不足与同条件阅读对照三者到位后再决定。没有浏览器截图、效率测量或用户收益结论；源码能力、已提交 golden 和本地字节核对不冒充实际交互通过。

AI 协助：Codex / GPT-6.1-Sol medium，一手源码检索、排重、字节核对与本报告写作。原始下载只用于只读研究，未执行上游代码；正文只链接固定 revision，不发布个人路径或原始本机 receipts。
