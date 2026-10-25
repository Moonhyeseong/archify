# 15:41 基线刷新：保留旧证据，按需重新整合

记录日期：2026-10-25（台北）。只读核对本地已 fetch 的固定 Git 对象，未运行新基线测试、生成器或上游程序，未修改任何实验分支。本文覆盖协调者所指的30个实验，不重新评判各实验的收益。

## 结论

本轮实验共同基线仍是 [82c7e0f089a02a4d514714adf37dc2061682da5f](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)。15:41:33 协调者观察 dev 已推进到 [3f95f0349c8276db71509ca239461b6fe9d00f9f](https://github.com/tt-a1i/archify/commit/3f95f0349c8276db71509ca239461b6fe9d00f9f)，合入 [PR #1098](https://github.com/tt-a1i/archify/pull/1098)。本地对象间差异为102个文件，包含许可证迁移与声明保留相关代码、生成产物、测试；不能概括为“只有文档变化”。

未发现这次 diff 修改图布局算法、路由、控件资格、键盘遍历、Explainer reader CSS 或 Workflow compiler。**生成与导出行为确有变化**：新 HTML 含软件声明，导出 SVG 附声明 metadata，package 校验和 ZIP 更新。旧实验的行为发现、固定输入、失败记录及字节绑定继续是原版本证据；没有任何一次旧 pass 自动成为3f95版的验证。

main 同时为 [51a291770851ad27a400cca73c753c166b5e0c65](https://github.com/tt-a1i/archify/commit/51a291770851ad27a400cca73c753c166b5e0c65)，合入 [PR #1099](https://github.com/tt-a1i/archify/pull/1099)。它的第一父提交是 `25cf37080fc8b1dbe758a4efc3935b55f3327083`，不是旧 dev；不得把 dev→main 的跨分支差异视为本次迁移新增行为。后续实验整合以明确选择的目标分支为准。

## 仓库现在声明什么

以下是仓库文本的陈述，不是法律意见或对任一实验的许可裁定。

- [LICENSE](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/LICENSE) 与 `archify/LICENSE` 改为 Apache-2.0；新增 [LICENSE-MIT](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/LICENSE-MIT) 保留历史 MIT 通知。
- [NOTICE](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/NOTICE) 指明截至82c7的 MIT 代码/贡献仍按原条款提供，旧发布保留原许可；不撤销历史 MIT grants、不代表历史贡献者作新专利授权。第三方组件保留各自许可。声明针对嵌入 runtime/templates，不宣称拥有用户内容、业务数据或源码仓库。
- [CONTRIBUTING.md](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/CONTRIBUTING.md#license) 将新贡献默认声明为 Apache-2.0，并保留维护者明确接受的例外。不要把旧实验 README 中的 MIT 描述原地改写成“从未如此”；新整合版本应写明新的 source/base 和适用仓库声明。
- 独立版本 DeepSeek Harness adapter 仍声明 MIT；其 bundled Skill 跟随 release.json 固定来源。不是整个仓库每个文件一律重标。

## 输出与包装的实际变化

| 入口 | 固定源码与具体差异 | 对实验的影响 |
| --- | --- | --- |
| 共用声明 | [software-notices.mjs](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/renderers/shared/software-notices.mjs) 读 NOTICE/LICENSE/LICENSE-MIT/THIRD_PARTY_NOTICES，JSON字符串中的 `<` 转义为 `\u003c`，放入非执行 application/json script | 新生成 HTML 的字节/hash必变；新增文件是实际 runtime 输入，不能只摘取 import 而漏带文件 |
| Native renderer / Explainer | [shared/cli.mjs](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/renderers/shared/cli.mjs) 在模板 head 插入声明；[explainer/render.mjs](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/explainer/render.mjs) 同样插入 | 即便作者 JSON/几何相同，新 HTML 不与旧截图/receipt hash绑定；不是新的布局改进证据 |
| Preview / QA / Delta / Story | preview shell、visual-check contact sheet、architecture-delta HTML、story HTML/attachment增加声明，attachment已有声明时不重复插入 | 仅重跑 QA 也可能生成不同 contact-sheet；旧 snapshot 与新 source 要分别标注 |
| SVG export | [viewer/export.js](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/viewer/export.js)、生成模板及 Delta SVG export 将声明放进 `metadata#archify-software-notices` | 导出字节变，不宜声称所有 export 行为完全未变；本次只读未验证 raster/浏览器导出表现 |
| package | [stage-clean-skill.mjs](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/scripts/stage-clean-skill.mjs) 对 Apache-2.0 package 要求LICENSE/LICENSE-MIT/NOTICE存在、被跟踪且根/Skill字节一致；历史非Apache manifest跳过这项新增校验 | 新整合包须用当前打包路径生成，不能拿旧实验ZIP覆盖。嵌套package.json/lock只有license字段变，未在该diff增加runtime依赖 |

直接读取两个 Git blob 内 ZIP：旧包221项，5,425,022 bytes，SHA-256 `a47b4e7cf500581f882e7a786fc0af8ccc13b57ca83669f262f3f926163dd7e3`；新包224项，5,556,084 bytes，SHA-256 `6d7188099b7b5875dcc2ce4ca2f44d8e92bfc9ff461500a0675a02c78a99a912`。这是对象/ZIP清单核对，不是重新构建或包内运行结果。

## 三个最新产品分支的具体影响

三个 head 的直接父提交均为82c7。逐文件集合比较：它们各自对旧 base 的改动与此次上游变动的**路径交集仅为 `archify.zip`**。这不保证自动整合无冲突或测试必过，但没有理由把三项修复问题判定为已经被迁移解决。

| 固定候选 | 保留的事实 | 整合新 base 时最低必要工作 |
| --- | --- | --- |
| [Preview dashed ink 36cc35fb446c697046d4f0522253fd7010b2303d](https://github.com/tt-a1i/archify/commit/36cc35fb446c697046d4f0522253fd7010b2303d) | 改 `archify/explainer/reader.css`、相关browser测试及生成case；迁移未改这些作者源码。旧HTML/截图/四阶段收据只证明该head；名称preview不表示它修改了此次变动的live-preview shell | 在新base保留5行CSS意图与测试；用新render重生需要发布的case/候选HTML与ZIP，更新hash，针对虚线前景色的实际受影响图作窄视觉核验，不能只换基线文本 |
| [Keyboard traversal d930863147cd6adfb5d4275f011c06caf4b24f92](https://github.com/tt-a1i/archify/commit/d930863147cd6adfb5d4275f011c06caf4b24f92) | 上游未改 `browser-check.mjs` 或 `test/explainer-browser.test.mjs`。final focused11、v3 full19复用、原bf30 HTML四视口50/50仍可作该版本证据；新notice不会自动补旧 mapping/provenance | 合并checker与tests后跑相关focused负例/host边界；若以新生成HTML作比较，固定它的新hash并重新记录浏览器结果。保留原bf30证据，不把它改称新base render；重打ZIP、核包内checker及新声明 |
| [Diff line numbers 88b0dcb069d89657798e5f1208a90bb2b768fe98](https://github.com/tt-a1i/archify/commit/88b0dcb069d89657798e5f1208a90bb2b768fe98) | 旧单条CSS、生成产物、1280/390浅深对照仍证实旧候选的行号修复；此次未改reader CSS，亦未引入keyboard修复 | 保留CSS意图/聚焦断言，在新renderer重生成需要交付的HTML，窄核三位行号与长代码横滚；重打ZIP，不照抄旧byte inventory结论 |

不要求为迁移而重复三项所有历史测试；一旦选定实际整合head，再按最终diff与上述变化确定局部验证。合并多个产品修复也是新组合，不能把各独立分支结果相加当组合已过。

## 30实验证据与下一步

1. **先保存历史，不批量刷新。** 固定commit链接、PNG字节、synthetic/官方输入分类、失败/未运行记录及gallery历史浏览器绑定不因dev前移而失效。它们应继续写“基于82c7/该候选head”。既有gallery不因renderer变化而必须重建；若刷新其引用，也需重新绑定其实际版本。
2. **内容/离线适配实验**：原始输入→作者JSON的实验语义发现可继续参考；但新base render/finalize尚未做。仅在选择继续交付某项时，在新base用同一固定输入做局部render/check/finalize；保留旧receipt，生成新receipt、hash与必要截图。不得给30项统一补“3f95已验证”。
3. **产品实验**：先在隔离整合分支rebase或cherry-pick必要源码/test；共同改ZIP应从当前源重建，不二进制择一。必要生成物也从当前源生成。旧原型、负面筛选项无需仅为追dev而重做。
4. **许可/归属说明**：为新包按当前仓库NOTICE与第三方来源实际文本核对；不要重新标记或删除第三方许可证，也不把新仓库声明扩成用户内容归属结论。本文不给法律结论。
5. **仍未完成**：新base focused/full/browser/finalize/包双构建/CI均未由本次只读调查执行；未rebase、重生成、提交、推送或安装30个分支。README远端“仍为82c7”的时间点陈述由协调者更新，本报告不改该文件。

可复核命令：`git diff --name-status 82c7e0f089a02a4d514714adf37dc2061682da5f 3f95f0349c8276db71509ca239461b6fe9d00f9f`；分别对三个固定候选运行同样的 `git diff --name-only` 并求路径交集；`git show <revision>:<path>`读取源码/ZIP。没有checkout、执行上游程序或重新测试。
