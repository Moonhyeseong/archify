# 规则匹配与最终决策：阅读调研

2026-10-27；对当前 hub `7dd5d815`、dev `e837dc4c` 和前一 hub `origin/codex/research-lab-20261025` 做只读比较。**结论：本轮不推荐新增实验或产品能力。** 保留一个可验证的阅读问题：为什么文件的否定 glob 匹配了，文件仍没有匹配到任何配置？这是一个有完整上游断言的小案例，但原工具本身已有匹配配置和 glob 的阅读入口，尚无证据说明 Archify 的额外页面比它或一张表更有用。

## 已有内容与排重

前一 hub 的 `config-reading-round11` 和远端 `origin/codex/lab-config-origins` `14867942a81542c1ce1b0d4aae38c6e7b9ddddef` 已用 Figment 的 merge/join 解释 provider 声明、幸存值与错误归属；其 README 记录现有 Explainer 页面、来源及浏览器观察。`style-reading-round9` 已区分 selector 分数、上下文条件和最终计算样式；`parser-reading-round13` 及 `round16-conditional-code` 已区分静态结构、未知与实际执行。`matching-reading-round8` 已指出静态匹配路径不能当执行轨迹。这些不直接解答下面 ESLint 的 global ignore 小案例，但现有 SourceCard、代码和表可以表达它，不证明需要新引擎。

2026-10-27 通过 GitHub 读取 open issues/PR 的标题与正文，搜索 rule、policy、conditional、eslint、gitignore、config；结果大量为宽泛关键词，无明确同一案例。`git ls-remote --heads origin` 同词过滤仅发现 `codex/lab-config-origins` 和 `codex/review-cost-policy`。这是关键词范围内的去重，不是全仓语义穷举，也不将 #1103 Atlas 的静态代码导航说成规则求值器。

## 一手来源及许可

| 来源 | 固定 revision / 完整许可 | 实际阅读及界限 |
| --- | --- | --- |
| [ESLint Config Inspector](https://github.com/eslint/config-inspector/tree/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62) | `3edebcc5a08f733b16a6e9f60dc91a4b6e670f62`；[Apache-2.0 完整文本](https://github.com/eslint/config-inspector/blob/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62/LICENSE)，[package 声明](https://github.com/eslint/config-inspector/blob/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62/package.json) | `matchFile` 借 `@eslint/config-array` 得到状态与匹配配置索引，又独立收集正负 glob；其输出不是 lint rule 实际执行记录。下述测试是提交的断言，本轮未运行。依赖的许可不能由项目顶层许可代替。 |
| [ripgrep / ignore crate](https://github.com/BurntSushi/ripgrep/tree/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30) | `6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30`；[COPYING](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/COPYING) 明确二选一：[Unlicense 全文](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/UNLICENSE) OR [MIT 全文](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/LICENSE-MIT) | [matcher](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/src/gitignore.rs) 的 `matched_path_or_any_parents` 先检查路径再检查父级；[walk](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/src/walk.rs) 的遍历代码可跳过被排除目录。两者合同不同，不能将前者单路径返回值自动解释成后者的实测访问日志。 |

## 唯一保留的阅读问题：文件匹配了否定 glob，为什么仍无配置？

[完整上游测试](https://github.com/eslint/config-inspector/blob/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62/tests/shared_configs.test.ts#L4-L53) 对同一路径 `tests/folder/foo.test.ts` 给出两组 global ignores：

| 上游测试输入 | 提交的预期输出 | 合理阅读范围 |
| --- | --- | --- |
| `tests/**`, `!tests/**/*.test.ts`, `tests/other/**` | 匹配 glob 包含前两条，`configs: []` | 文件否定 glob 在返回集合中，不等于文件获得配置；测试标题说明目录仍被忽略。 |
| `tests/**/*`, `!tests/**/*/`, `!tests/**/*.test.ts`, `tests/other/**` | `configs: [0]`；返回匹配 glob 亦包含正向文件规则与文件否定 glob | 这组显式包含对子目录的 unignore；它与第一组也改变了首条模式，**不是仅改变一个字符的严格因果对照**。 |

[实现](https://github.com/eslint/config-inspector/blob/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62/shared/configs.ts#L20-L94)明确 `getMatchedGlobs` 对数组条目使用每项都匹配的交集；`matchFile` 先从 `getConfigWithStatus` 获得结果，再以 `matched` 状态、已匹配的 config index 与正向 glob 决定是否收录 config；无论是否收录，都会加入匹配的 negative globs。因此 `globs` 列表既不是全部规则的执行日志，也不能仅凭最后一个字符串推断最终配置。这里的“rule”是配置匹配条件；不能将其冒称 `no-console` 等 lint 规则已对源码执行。

事实：以上为固定源码与上游 expected；本轮未运行上游，也未操作 inspector UI。测试的 `process.cwd()`、上游依赖版本与配置数组实现是语义上下文；不能将其当所有 gitignore 工具的通用合同。推论：并列显示匹配 glob、最终配置索引和被忽略目录的条件可能帮助读者避免把列表当最终决策。尚无读者对照证明其节时或提高准确率，亦不能据这两组期待值还原内部每一求值步骤。

上游的 [files e2e 测试](https://github.com/eslint/config-inspector/blob/3edebcc5a08f733b16a6e9f60dc91a4b6e670f62/tests/e2e/specs/files.spec.ts) 已要求展示 matched files、configs specific to files、matched globs，点击文件转到带路径过滤的 configs 页。是提交的 UI 测试断言，不是本轮浏览器观察。已有工具至少设计了接近该问题的入口，不能仅凭不同视觉设计宣称 Archify 有独立价值。

## 最低成本与停止条件

若后续出现真实读者确实不能从原工具回答该问题，可先仅用现有 Explainer 制一页：完整固定测试、两列输入与预期、源码定位，以及“匹配集合 / 最终配置 / 求值过程未知”三行说明；原始表格作为同题对照，记录答题正确性、阅读时间、误解和第一次草稿，保留来源及完整 Apache 许可。只在该对照中暴露明确阅读障碍时考虑交互；表能回答就停止。无需新 glob parser、上游执行或安装，也无需从结果反推逐步轨迹。此处只是实验协议，**没有制作页面或测量收益**。

ripgrep 的 [完整测试与 fixture](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/tests/gitignore_matched_path_or_any_parents_tests.rs) 及[配套 ignore 文件](https://github.com/BurntSushi/ripgrep/blob/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30/crates/ignore/tests/gitignore_matched_path_or_any_parents_tests.gitignore) 是 path/parent matcher 的预期结果，并非目录遍历访问轨迹。本轮没有发现可与访问记录配对的自然小 fixture，故不将其作为第二候选。

仅创建本报告；没有运行上游代码、安装、修改产品、推送或评论。所有链接固定 revision；公开源码被读取，不在本报告中复制许可正文或实现。
