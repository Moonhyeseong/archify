# 来源与许可

本目录的叙述、映射、图及校验脚本由 Codex agent 按固定资料编排。它们是阅读实验，不代表上游作者认可，也不声称用户收益。

`upstream/source/` 保留 dorongold/gradle-task-tree 固定提交 `84cda7f0ce2363c96b1b26713ad34558519bdf05` 的原始文件字节。完整 Apache License 2.0 位于 [upstream/source/LICENSE](upstream/source/LICENSE)；原源码版权与许可声明均保留。本次固定提交未找到独立 NOTICE 文件；本文件是实验作者的归属说明，不冒充上游 NOTICE。

完整 multiproject fixture 为原目录全部 8 文件；另附官方测试与报告消费源码用于追溯，并非复制完整上游仓库。逐文件来源、byte length、SHA-256 和角色见 [upstream/manifest.json](upstream/manifest.json)。

`expected-literal.txt` 是官方测试中完整三单引号 expected 的原字面内容。`expected-tree.txt` 仅将该固定字面内容中的双反斜线解码为一个反斜线；最小公共缩进为 0，故 `stripIndent()` 不再改变字符。这是明确的文本派生，不是本轮 Gradle stdout。`mapping.json`、表与图是后续派生，未运行 Gradle、Groovy 或 Java。

Archify 生成器固定到本仓库 `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`，其软件版本与 Apache-2.0 软件声明由原生 CLI 保留在 HTML 中。上游原文件与本实验原创内容的来源分别记账，不将来源声明或软件许可当执行验证。
