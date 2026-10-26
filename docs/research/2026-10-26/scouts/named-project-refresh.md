# task-view 与 PR Lens 增量核对

2026-10-26，只读官方 GitHub API 与固定源码。延续用户给出的 `gtindo` 和 PRLens 线索，不按 stars 筛选。没有执行、安装或复制这些项目的实现。

## task-view 没有新 revision

[`gtindo/task-view`](https://github.com/gtindo/task-view/commit/f27b8bef63ec336b8e3487e90ccd484a2fa7a235) 当前最近提交仍为 `f27b8bef63ec336b8e3487e90ccd484a2fa7a235`（2026-10-24 18:57:09 UTC），与[上一批固定来源](../../2026-10-25/scouts/task-view.md)一致。该事实来自当次 commits API，不依赖搜索引擎摘要。

已有 Task review map 实验已经借鉴声明与 Git 引用核对，原有执行、解释正确性和未覆盖范围限制继续保留。本次没有新的源码增量可作为重做同一 adapter 的理由；也不把未变化的上游提交写成 Archify 候选已通过当前 dev 验证。

## PR Lens 前进了 11 commits，但不等于多了 11 个阅读功能

最贴合图形审阅语境的来源仍是 [`coldteadotai/pr-lens`](https://github.com/coldteadotai/pr-lens/tree/132ff8bd7d86a318a06965377f8511a267808a5a)；用户没有给定 URL，因此仍不认定它必然是用户所指的同名项目。

当前固定 revision 为 `132ff8bd7d86a318a06965377f8511a267808a5a`。[相对昨日 `39750d1` 的官方比较](https://github.com/coldteadotai/pr-lens/compare/39750d165efd824d1203df7793ecbfed35b6361e...132ff8bd7d86a318a06965377f8511a267808a5a)为 11 commits，主要是中文 README、renderer/CLI 版本、依赖与 JSON schema 日期格式、GitLab/Bitbucket 发布配置。renderer 的改动集中在 package/version；没有由此证明新增了图上阅读交互。

其中 CLI 0.13.3 提交提到接受 `glossary`，值得进一步分辨：

- [`packages/schema/src/config.ts` L75–82](https://github.com/coldteadotai/pr-lens/blob/132ff8bd7d86a318a06965377f8511a267808a5a/packages/schema/src/config.ts#L75-L82)定义可选的非空字符串，内容是仓库 Markdown 文件路径，可带 `#heading`，用于系统团队术语。它不是结构化术语表、源码符号身份或浏览器 tooltip 合同。
- [完整 `glossary-config.test.ts`](https://github.com/coldteadotai/pr-lens/blob/132ff8bd7d86a318a06965377f8511a267808a5a/packages/schema/test/glossary-config.test.ts)只断言配置缺省、接受两个路径字符串、拒绝空字符串和若干非字符串值。未执行这些测试；测试源码也不证明文件存在、heading 解析、术语应用效果或 reader 交互。
- 上述 config 与测试不在这 11 commits 的改动清单中。不能从新的 CLI release 文案推断术语机制刚刚出现。
- 已读取根及 schema 包的完整 [MIT LICENSE](https://github.com/coldteadotai/pr-lens/blob/132ff8bd7d86a318a06965377f8511a267808a5a/LICENSE)。本轮只写原创分析与固定链接，没有移植实现或下载展示其图片。

## 取舍

保留的启发是作者可以用仓库既有术语文件减少同一概念的多种叫法。现有 Archify 作者已能读取这类上下文并使用明确标签；本轮没有找到一份固定输入能证明缺少专用 `glossary` 配置导致现有流程无法完成任务。因此不新增配置、schema 字段、自动文件发现或第二套术语展示状态，也不为它单独造一个内容页。

这不是“术语统一没有价值”的结论；当前缺的是可复现的 Archify 使用缺口与相对于既有作者上下文的增益。若后续获得实际材料，再比较原流程和候选，而不是把上游字段名当作集成价值。

本轮没有新的实现分支或图片。以前的 49 项实验及图片保持各自固定身份；未重测、合入、发布 release 或安装 live Skill。
