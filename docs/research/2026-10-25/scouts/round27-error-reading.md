# Round 27：异常打印里的分组、cause 与重复呈现

2026-10-25，只读研究。**本批结束后暂停；本报告冻结后不启动实现、工作树或下一轮。** 最多保留一个内容方向，状态为研究待定，不是已授权产品候选。

本轮先搜索当时全部 scouts 和实验索引中的 stack/traceback/cause/suppressed 及项目名，再读四个此前未深读项目。没有按 stars 筛选。研究过程中 root 告知现有实验最终增至49项；本轮没有因此扩大来源或追加实施。

已排除的重复方向：既有 Trace waterfall 是采集区间而非异常链；Test failure map 分 setup/call/teardown、collection 与字面位置；Source maps/来源阅读处理位置映射与代码引用。本轮不再做这些 adapter，也不把 formatter、synthetic traceback 或组合后的错误文本称为新的真实运行轨迹。Copy identity 已讲对象别名，本轮若保留对象身份，只用于区分**异常包含关系与显式 cause**；Witness groups 的共同/替代语义不能移用到 ExceptionGroup。

没有执行上游 Python/JavaScript、测试、异常 fixture、数据库或 formatter，没有安装、浏览器操作或 live Skill 变更。用于取文件和核摘要的本地工具只读取固定源字节。原件仅留在临时证据区，公开报告不含本机个人路径；没有改产品、README、gallery、别人的实验或报告。

## 四个固定来源与取舍

| 项目、固定 revision | 实际许可、完整材料 | Owning consumer 与观察 | 取舍 |
| --- | --- | --- | --- |
| [agronholm/exceptiongroup](https://github.com/agronholm/exceptiongroup/tree/8ee4bfcf7d6706ac6328c2e7a3840556180099de) `8ee4bfcf7d6706ac6328c2e7a3840556180099de` | [完整 LICENSE](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/LICENSE)，3704B，含 MIT **及**复制 CPython 部分的 PSF LICENSE VERSION 2 通知，不能只写 MIT。完整 `tests/test_formatting.py`、formatter、版本入口与 README 已保存。 | `test_exceptiongroup_loop` 有完整构造和 f-string expected；`_formatting.py` 分别读取 cause/context/group children，chain 分派与 group 递归是两层；新 Python 分支用 builtin。 | 唯一可保留的内容方向：同一异常为什么打印两处。仅研究待定。 |
| [cknd/stackprinter](https://github.com/cknd/stackprinter/tree/7a07a51a806e70c273a96071c87d19289bc0c69e) `7a07a51a806e70c273a96071c87d19289bc0c69e` | [MIT LICENSE.txt](https://github.com/cknd/stackprinter/blob/7a07a51a806e70c273a96071c87d19289bc0c69e/LICENSE.txt)，1075B。完整 `tests/test_formatting.py`、`tests/source.py`、两个 chain/group demo、`formatting.py` 与入口已保存。 | [format_exc_info L115–201](https://github.com/cknd/stackprinter/blob/7a07a51a806e70c273a96071c87d19289bc0c69e/stackprinter/formatting.py#L115-L201) 先显式 cause，再未 suppress 的 context；可反转呈现和附 summary。`suppressed_exceptions` 控制指定类型的简略栈显示，**不是 Java suppressed 异常列表**。当前 ExceptionGroup 名称分支退回 stdlib。 | 不开新方向：完整测试只钉部分普通输出、None 值及合成无行号 traceback；chain demo 没有配套完整 expected，group demo 也不能当专门 group formatter 支持。 |
| [Qix-/better-exceptions](https://github.com/Qix-/better-exceptions/tree/b928ff9e2c933cdd3b27321c766ce68bfa60826c) `b928ff9e2c933cdd3b27321c766ce68bfa60826c` | [MIT LICENSE.txt](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/LICENSE.txt)，1077B。完整 `test/test_chaining.py`、`test/test.py`、一份完整无色 UTF-8 golden、`test_all.sh` 与 formatter 已保存。 | [formatter L296–331](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/better_exceptions/formatter.py#L296-L331) 用 seen identity 防重复链，cause 优先 context，尊重 suppress；frame 另读取源码和局部变量。Golden 是 [test_all.sh](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/test_all.sh) 多用例经地址/路径归一化后的拼接输出。 | 不选：harness **明确注释掉 chaining 用例**；现有 golden 不能冒充该链 fixture 的预期输出。不是读取到一个 golden 就能给另一用例补“验证”。 |
| [sindresorhus/aggregate-error](https://github.com/sindresorhus/aggregate-error/tree/d1e6d15cf8856d9a06735953fd4c89afb33790d9) `d1e6d15cf8856d9a06735953fd4c89afb33790d9` | [MIT license](https://github.com/sindresorhus/aggregate-error/blob/d1e6d15cf8856d9a06735953fd4c89afb33790d9/license)，1117B。完整 `index.js`、`test.js`、README/package 文件已读。 | [index.js](https://github.com/sindresorhus/aggregate-error/blob/d1e6d15cf8856d9a06735953fd4c89afb33790d9/index.js) 接受 Error/string/object 数组，把非 Error 转成新 Error，将清理后的各 stack 或 `String(error)` 缩进拼入 message，再调用父 Error；errors getter 返回数组副本。[test.js](https://github.com/sindresorhus/aggregate-error/blob/d1e6d15cf8856d9a06735953fd4c89afb33790d9/test.js) 对 mixed/无栈/空栈/内部帧清理有完整构造与断言，但主要是结构和 regex，不是完整固定 stderr。 | 有“组合文本不等于一次调用链”的提醒价值，证据和阅读动作不比主候选更强，不另开页面或 JS parser。 |

以上四个项目都实际读取了许可全文，不从 GitHub license metadata 推断条款。没有 GPL 项目被选入复制方案；若未来出现 GPL 或缺完整许可的材料，研究链接与原创转述不构成复制进 Apache-2.0 HTML 的授权。本轮不复制上述库实现进产品。

## 唯一研究待定：同一个 eg0 为何出现两处？

最强材料是 ExceptionGroup 的完整 [test_exceptiongroup_loop L141–176](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/tests/test_formatting.py#L141-L176)。它不是生产事故，也不是作者补造的新错误日志。

固定构造把三个符号绑定到异常对象：普通异常 `e0`、含 `e0` 的 `eg0`、含 `eg0` 的 `eg1`；随后执行语句的原文为 `raise eg0 from eg1`。本轮只读该源码，未执行这条语句。

完整 expected 模板先显示 eg1 的子结构 eg0/e0，再经显式 cause 分隔文本显示最终 eg0/e0。因此，读者不能把打印中的两处 eg0 当成两个异常对象或两次独立运行。构造代码支持以下**原创关系投影**，不需要解析栈文本：

| 源码绑定 | 明确关系 | 目标绑定 |
| --- | --- | --- |
| eg0 | group 的 `exceptions` 包含 | e0 |
| eg1 | group 的 `exceptions` 包含 | eg0 |
| eg0 | 显式 `__cause__`，来自 `raise … from …` | eg1 |

这里组合起来有对象关系回环，但不是递归调用已经发生、无限重试或执行时间回环的证据。绑定名只在这个 fixture 内标识对象，不是地址、跨运行 ID 或发生次数。

尤其不能把 ExceptionGroup 的 children 当作 Witness groups 的“组内共同／组间替代”：它是被包含的异常集合；cause 又是另一种关联。表格比统一画成一棵 Tree 更忠实。若强画 Tree，就不得不复制同一对象而掩盖共享身份，或把 cause 误写成 contains；本轮不建议为此新造图类型。

### Expected 和版本边界

L154–176 是 f-string 模板断言，含 `__file__`、`lineno`、`module_prefix`，不是仓库提交的一次原始 stderr，也不是本轮采集。不能填一个临时路径或解出某环境前缀后，把人为展开文本叫“真实 trace”。未来页面如获授权，应保留模板原文及其标签；源码位置147可作固定源码位置引用，不能据此伪造一次运行帧。

[版本入口 L18–41](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/src/exceptiongroup/__init__.py#L18-L41) 在 Python <3.11 用 backport 异常/格式化，新版本用 builtin 异常和 stdlib traceback。因此不能把当前 backport formatter 说成所有版本实际使用的同一段实现。

对 backport，实际消费链为：

- [_formatting.py L352–362](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/src/exceptiongroup/_formatting.py#L352-L362)：默认 hook 时 patch/安装格式化路径；是否 patch 还受入口环境条件影响。
- [L143–217](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/src/exceptiongroup/_formatting.py#L143-L217)：捕获 `__suppress_context__`、cause/context 与 group exceptions，链捕获使用 seen 防循环，不从屏幕缩进猜关系。
- [L219–244](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/src/exceptiongroup/_formatting.py#L219-L244)：chain 开启时 cause 优先，否则取未 suppress 的 context，并按链展示；这是呈现选择，不是采集到的完整调用时序。
- [L245–306](https://github.com/agronholm/exceptiongroup/blob/8ee4bfcf7d6706ac6328c2e7a3840556180099de/src/exceptiongroup/_formatting.py#L245-L306)：另行递归 group children，有 depth/width 截断。一般打印文本不保证展示全部异常对象。

### 如未来重新授权，最小内容范围

现阶段**不启动**。可以留待下一次明确授权的内容问题是：“原文 eg0/e0 出现两处，为什么不等于两次运行？”现有 Explainer 的原文 code、来源卡和三行表已经足够，无需产品改动。

最低证据应是：完整测试文件、完整混合 LICENSE、固定版本入口与 formatter 原件；原构造、未展开的完整 expected 模板和上表一一对应。检查仅保护固定源码字节、引用范围、三种关系和页面原文字面，没有 SQL、栈 parser、对象采集器、求值器、异步恢复运行器或动态变量读取。不能为补一张图运行上游，也不能把人工拼接的 JSON/栈叫官方实际输出。

收益是假设的内容阅读价值：减少把排版重复误读为发生次数的风险；尚无读者效果、生产使用、跨版本实测或人类验收。成本主要是解释版本与对象关系边界，维护为一页固定材料。自动集成则需承担 Python formatter/版本/省略/变量隐私及结构恢复成本，不值得在本方向启动。

## 其他材料进一步核对后的边界

### Stackprinter 不是异常事件采集器

[公共 format 入口](https://github.com/cknd/stackprinter/blob/7a07a51a806e70c273a96071c87d19289bc0c69e/stackprinter/__init__.py) 在 except 内可取当前异常，其他情况下也可读当前 frame。格式化会取代码上下文和变量值；这不意味着它独立记录过完整执行事件。`add_summary` 可以在全文之外再附摘要，`reverse` 可改呈现顺序；重复输出或顺序不应被当成新的调用或时间。

完整 [test_formatting.py](https://github.com/cknd/stackprinter/blob/7a07a51a806e70c273a96071c87d19289bc0c69e/tests/test_formatting.py) 对 frame 有固定 expected 列表，但第一行只比较后缀，函数表示行只比较前缀；异常测试只断言开头/末尾，没有为 [demo_chained_exceptions.py](https://github.com/cknd/stackprinter/blob/7a07a51a806e70c273a96071c87d19289bc0c69e/demo_chained_exceptions.py) 提供完整固定输出。`test_tb_with_none_lineno` 还手工构造 TracebackType，不能冒充真实异常运行采集。它与旧 Failure map 的位置／缺失框架重复，不保留新实验。

### Better-exceptions 的 golden 已被归一化，而且不含所选链用例

完整 [test_chaining.py](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/test/test_chaining.py) 名称可能误导：名为 cause 的函数隐式重新抛出，名为 context 的函数却使用显式 `from e`。关系应以语句与对象属性判断，不能从函数名字猜 cause/context。

完整 [test_all.sh](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/test_all.sh) 会归一化地址和绝对路径，再将多条 test_case 拼到 golden；chaining 相关调用被注释，注释说明在多数版本 CI 不稳定。已读的 [完整 golden](https://github.com/Qix-/better-exceptions/blob/b928ff9e2c933cdd3b27321c766ce68bfa60826c/test/output/python3-dumb-UTF-8-nocolor.out) 开头对应 `test/test.py` 的浅/深函数变量示例，不是 chaining fixture。不能把它冒充未执行链测试的 expected；没有为凑数造出缺失材料。

### Aggregate-error 的单条长文本不证明连续调用链

其 formatter 在聚合时保留已传入 Error 对象，但为 string/object 新建 Error；这些 frame 可以在聚合位置才捕获。多个错误 stack 先经外部 clean-stack 和本模块内部帧过滤，再拼入父错误 message。`errors` 数组顺序来自输入数组，不证明发生先后、并发或 causal chain；缺 stack/空 stack 会回退到字符串，不等于无错误。

本模块完整测试里的 mixed fixture 只断言 message regex 与 errors 结构，另有无栈／空栈用例；没有完整固定输出可直接作为新“运行记录”。README 的完整使用示例属于文档示意，含作者环境路径，不复制进本报告或另一个公开 HTML。这里停止于具体边界，不引入其 clean-stack/indent-string 依赖，不做聚合文本导入。

## 关键完整原件指纹

所有材料为固定官方源的原字节，存于临时原件区；不是本轮生成的异常输出。另有各项目 README、测试辅助材料及 API tree/meta；不把只下载未深读的辅助文件计为额外来源。

| 固定来源 / 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| exceptiongroup LICENSE | 3704 | `6e5070d765031e0ad403a1cbf90ae6d19a0228f802e320b7acff460aa72ed47c` |
| exceptiongroup tests/test_formatting.py | 20407 | `d1981b5bbee36bdf565cd94b0944c123bd69e78618c7eba32cbac6385fbff743` |
| exceptiongroup src/exceptiongroup/_formatting.py | 21081 | `8ef12e0f2f25c754952656b6e9b5a81a40c914b00a3c70dd0eb5cec0f067e065` |
| exceptiongroup src/exceptiongroup/__init__.py | 1049 | `2ee6233ec2d6de206c6a8daecec696a2c83acf5bce1d1b5a0b6cd8b6772de097` |
| cknd/stackprinter LICENSE.txt | 1075 | `5a96deb30cab61efb3a55dc1c7e1df44960f1ea54d9b4a85e1a33e3353006246` |
| cknd/stackprinter tests/test_formatting.py | 2876 | `eaed320e3a2abcf755d51a9f0c5145c5a0ac4523dcbcc758e5651a9363cb2879` |
| cknd/stackprinter tests/source.py | 2162 | `a01e2811b3fedb879154096f1cb5dd59d20d72a0c2041c1ca0dc5aa334e59ad6` |
| cknd/stackprinter stackprinter/formatting.py | 9014 | `cb8983839c552a03bfb4d48565974a352971c59b7a69d642e5d30fab2ba3e639` |
| cknd/stackprinter demo_chained_exceptions.py | 292 | `9697a0f63b12e66c9bdb00ea732ce796fcecf8ac40c2408e63eb4701ea365a7d` |
| Qix-/better-exceptions LICENSE.txt | 1077 | `d941ab46ceb5e77d7a3caa2795d14e507047d6abdf59a4e6b95e026b5b366ad7` |
| Qix-/better-exceptions test/test_chaining.py | 348 | `123c420260f30438be32bb58b2faf678f638fdbd1029e0bf4a804d2d437fae39` |
| Qix-/better-exceptions test/output/python3-dumb-UTF-8-nocolor.out | 8456 | `4ceba9e75b7e60c3a79bd47909683960d8c5a602a02d6809544b21670ac7140c` |
| Qix-/better-exceptions test_all.sh | 2457 | `b4f9e9030b997423b91b27aba20f54664d96074736277fd6e0e658fd4af75c88` |
| Qix-/better-exceptions better_exceptions/formatter.py | 11297 | `b43bc82f3b5bc95dc3341801bd5d29184c4f54f30de41cc15d75d5ab986902a8` |
| sindresorhus/aggregate-error license | 1117 | `5c932d88256b4ab958f64a856fa48e8bd1f55bc1d96b8149c65689e0c61789d3` |
| sindresorhus/aggregate-error index.js | 1173 | `8bbfc31efb4626196613693b4e624d48066e221bdf45ca5ee08fa0618f167c6e` |
| sindresorhus/aggregate-error test.js | 2338 | `ab3d48fd7dfd527ce0cebf65157bf0c10eda340f0e523867e0a7125f7447d43b` |

## 收尾状态

按 root 转达的用户明确指令，本批到此停止：不实施研究待定内容，不创建工作树、产品候选或下一轮，不发外部评论，不 commit/push。唯一已启动的 ExceptionGroup 后台研究已完成并停止；本代理树没有其他运行中的后台任务。既有其他代理文件保持不动。
