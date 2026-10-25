# Source / diff / code 阅读窄审查

2026-10-25。**本轮没有发现值得另开实现、且尚未被现有实验或在审工作覆盖的具体用户可见问题。** 这不是三类块没有缺陷的证明，也不是一次浏览器验收。仅检查固定产品源码、已有真实实验输入与冻结 HTML；没有生成随机边界输入、运行产品测试、重渲染或占用 Ego。

## 基线与排重

产品固定为 GitHub dev [`67f12389212c54b3122da60e2813c7f8dab7ab2f`](https://github.com/tt-a1i/archify/commit/67f12389212c54b3122da60e2813c7f8dab7ab2f)，已通过 GitHub commit API 核对身份：该提交合并 #1100 source end-line repair。没有把 hub HEAD 或实验分支当作此产品版本。

先读 hub 的 33 项实验目录及 gallery manifest，排除 Clipboard outcome、Diff line numbers、Source question tour / CLI reading tour 已明确处理的 SourceCard 焦点与文案范围，也排除 Preview dashed ink 等图形工作。清单检查不是把全部 33 项逐页重验。

应用 [archify-review](../../../../.agents/skills/archify-review/SKILL.md) 的价值、成本、影响判断；遵循 CONTRIBUTING / REVIEWING，只调查可由现有内容触发的阅读问题。没有修改 shared code、实验输入、旧产物、截图或测试。

本轮借用已读小工具的细节作为问题，而非新增功能清单：

- [Source navigation](source-navigation-smalltools.md) 中 CodeTour 的 excerpt/target/truncated 区分：显示内容是否仍是固定源码，长摘录是否已经有明确的扩展工作？
- [Code-reading utilities round 4](code-reading-utilities-round4.md) 中 Linediff 的明确区间与 gron 的完整路径：diff 是否保持原文与两侧身份，源码位置是否和展示内容绑定？不把源码摘录包装成变更，不把作者声明当语义验证。

## 实际检查范围与结果

源码均使用上述完整产品 SHA 的 `git show` 读取：

| 路径 | 核查点 | 结果 |
| --- | --- | --- |
| [sources.mjs L207–295](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/sources.mjs#L207-L295) | 强制 code 来源、Git 读取、摘录范围、可选 citation 降级 | code 读取固定 Git 文件后切片；citation 无法验证时可以保持 plain reference，未将此称为有源码预览的成功。 |
| [render.mjs L79–84](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/render.mjs#L79-L84) | code 与 snippet/diff 是否混淆；文字 escaping | code 从 prepared source.text 渲染，caption 保留路径与范围；diff 使用解析后的 raw 行并转义。没有发现选定真实输入被替换或漏行。 |
| [diff.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/diff.mjs) | fragment / unified、行号、文件与 no-newline 标记 | fragment 不补造两侧行号，unified 按 hunk 计算；本轮真实 PR 的 raw 行均保留。不是 diff 解析器完备性审计。 |
| [reader.js L599–670](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/reader.js#L599-L670) | 同一份来源数据、14 行预览、链接、焦点条件 | 来源卡使用 prepared source.text；保留完整路径/range 与 pinned commit。Escape/Tab 已有状态逻辑，不另建弹层。 |
| [inline.mjs](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/inline.mjs) / [reader.css](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/explainer/reader.css) | citation 落点、完整 code 滚动与 diff 数字布局 | citation 指向 source-ID；code/pre 保留字面空白并允许滚动。diff 数字换行已有独立实验，不再重复。 |

与历史 base `82c7e0f089a02a4d514714adf37dc2061682da5f` 比较，reader.js、reader.css、sources.mjs、diff.mjs、inline.mjs 均无 diff；render.mjs 只有软件许可 notices 的 import/插入变化。因此旧实验中这些阅读路径的源码可用于本轮静态比较；**不将旧截图升级为 67f 当前浏览器验收**。

从固定 Git 对象读取下列 HTML，使用 Python 标准库 HTMLParser 检查真实 DOM 字面文本，并解析其中冻结 prepared JSON；没有执行 HTML 的脚本：

| 固定实验 / artifact | 实际核对 |
| --- | --- |
| [Task review map @dcedd538](https://github.com/tt-a1i/archify/blob/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/pr-1097/authored-layout/review.html) | 真实 PR #1097 输入的 7 个 diff 块，逐块 DOM code 文本与 authored block.text 的每一行一致，共 72 行；未把作者 why 声明当代码正确性。 |
| [Source question tour @94d6a4d0](https://github.com/tt-a1i/archify/blob/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour/question-first.html) | 5 个 code 块均等于 prepared 摘录，5 个 caption citation 都指向相应 source-ID；范围 244–263、599–611、638–649、615–626、654–668。这是源码内容示例，不是实时调用轨迹。 |
| [CLI reading tour @1dff88d3](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/output/tour.html) | 11 份真实上游源码 citation，均有固定完整 revision 链接及冻结摘录。该页没有 code 块，不为凑覆盖称有 11 个 code 块。 |
| [Copy identity @18d51b89](https://github.com/tt-a1i/archify/blob/18d51b8950a9c3713c72044dd6af8e12c9f33e24/experiments/copy-identity/output/explainer.html) | 1 个 code 块逐字等于上游教学构造 L8–13；SourceCard 与 code 共用 construction 来源。它是独立标准库观察示例，不是上游包执行 trace。 |

上述后三页共 **17 份 prepared source**：逐一核对 repository dependency 的 Base64 原字节、SHA/bytes、revision、完整提交链接，以及按声明行范围切出的 text，全部一致。6 个 code 块正文也逐字一致。此检查只证明这些冻结内容内部与字面阅读一致，不替代所有上游语义或浏览器可访问性验证。

为便于复核，四份读取的 HTML SHA-256：

```text
task-review-map  bf30fb5bda006c2d4a961bae4a0677c26aba91ec42379a816e5b7ffff15f28e6
question-first  b8803bb7eef4e2aba87b1adcb66ecb154786c26ae6c7a5218dce54a6b9e4ceee
cli-reading     7814b929dd002ea2b1083575899cf0739ce83effd84488251cf85addb7bce190
copy-identity   5678a1593654dc53cc496085b28322a0fee7f1744294a86fbdfa18eea7602bfc
```

## 最有力的具体 trigger，为何不另立实现

| 真实 trigger | 现有行为与可期望行为 | 价值 / 成本 / 处理 |
| --- | --- | --- |
| question-first 的 build-excerpt 是 20 行（244–263）；hover citation | SourceCard 先给 244–257 后显示省略号；完整 code 块仍显示 20 行，外链固定原范围。若阅读目标在末尾，卡内展开/居中有价值。 | 这是 [#1015](https://github.com/tt-a1i/archify/pull/1015) 的 code focus / SourceCard 展开复制范围。2026-10-25 经 GitHub API 重读仍 OPEN，不能重复实现，也不能声称它已发布。 |
| 真实 PR 的长代码行与三位数 diff 行号 | 固定产品 CSS 的数字列仍可能受长 code 的表格收缩影响。 | 已有 Diff line numbers 实验及 1280/390 前后证据；不是本轮新发现。本轮未另测宽度。 |
| source 图节点、citation、浮动链接之间切换 | 现有文案与实验已区分 hover、focus、仅当焦点在卡内时 Escape 返回。 | 不因“更像 IDE”新增第二套焦点或导航状态。若将来真实复现焦点丢失，应在原路径报告具体控件与步骤；本轮没有这样的新证据。 |

当前没有一个未覆盖 trigger 足以证明新增 schema、代码语法高亮器、跨文件导航索引、源码编辑器或 diff 模式值得维护。尤其“没有 focus 行号”与“截断前 14 行”不能绕开 #1015 重新包装成新实验。

## 证据缺口与结论边界

没有使用当前 67f runtime 对这些输入再打开页面，也没有对 OS clipboard、外链落地页、读屏、窄屏弹卡位置、打印或跨浏览器作新接受。因此不能据本轮静态一致性断言视觉、焦点或所有长行布局均通过。已发布实验的已有截图/交互记录保持其原提交身份。

没有发现需要 root 立即复验的新复现，所以不占用 p1，也不请求为潜在边界临时构造新页。后续若真实输入显示文本被遮挡/位置错误，最小证据应是该 artifact、原 block/source ID、viewport/theme、实际点击/焦点步骤及可见/DOM 对照；此时再决定是否超过已有 #1015 与实验范围。

本轮只新增本报告；未改产品或其他实验，未运行上游、产品测试或浏览器，未安装、commit、push、发 issue/PR/comment。GitHub 窄查询仅用于当前目标身份及重复范围核查，不据“未搜索到”宣称不存在相关问题。
