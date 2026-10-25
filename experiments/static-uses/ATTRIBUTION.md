# 来源与归属

本实验是 Archify 新内容原型，没有集成或运行 Beniget runtime；完整源码副本只作只读证据。

完整固定上游文件来自 serge-sans-paille/beniget：
`c0f03c00a4b737916a3dcfe9849fc177d1e1fe88`。
完整 BSD-3-Clause 版权、条件与免责声明保留在
[upstream/beniget/LICENSE](upstream/beniget/LICENSE)。
该文件版权为 Copyright (c) 2025, Serge Guelton；其不背书条款明确提到
HPCProject、Serge Guelton 与 contributors。字节与固定来源见
[upstream/source-manifest.json](upstream/source-manifest.json)。

作者人工编写 projection-ledger、原生布局与中文 Explainer，依据官方
`test_ifexp_chain` 的 source/expected 和 owning visitors；这些不是上游导出。
`source-input.txt` 是测试中 source 字符串的完整内容；`expected-chain.txt`
是作者按相邻字面量源码顺序连接的完整 expected 内容，均不加末尾换行。
`selected-test.txt` 保留原文件 L56–67 完整测试片段。完整测试文件及 owning
实现均另存，没有以片段冒充完整文件。

其他本实验作者文件沿 Archify 基线的 Apache-2.0 仓库许可提供。
本说明由实验作者编写，不冒充上游 NOTICE，也不更改上游许可。
