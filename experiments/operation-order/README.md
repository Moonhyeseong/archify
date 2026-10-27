# 操作顺序约束：文字与图的对照

[三句文字基线](baseline.html) · [文字加约束图](explanation.html) · [源稿](candidate.archify.md) · [独立复核](audit.py)

Porcupine README 的说明例中，一次长写覆盖两次读取，但实时顺序与寄存器模型无合法排列。两个页面共用同一六行事件、初态、模型、三句解释和三候选枚举；后者增加三节点约束图。图边表示必须先于，带实时或模型依据，不表示调用、死锁或因果。事件位置是 ordinal，不是时间。上游 README 声明 checker 返回 false；本轮未运行 Porcupine。

这是固定内容实验，潜在价值是让读者一眼看到不同依据组成的矛盾；是否比三句文字更容易理解，尚未有读者比较。若无增益就保留文字，不主张新增共享功能。没有通用 parser、checker、上游依赖、schema 或 Viewer 修改。

来源 [Porcupine README @ 97cd067defd99df172053ba7f4ca5bbae57fe446](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#L56-L162)；完整原文和 [MIT 许可](upstream/LICENSE.md) 原字节保留于 upstream。README SHA-256 `4e79c7c7abe2ffc1d7888d7f24f91bf61f6f247d1041e54976c5045fbbdb3a58`，许可证 SHA-256 `a017c16b0beadd6686670ad3609a0130570e02fd8bd4f2d0ad18f46cedf76d1c`。README 的第三方 Jepsen 日志未复制。

## 复核与运行

基线 Archify `e837dc4cb83042d2b6c596e039692e25ec62c2da`，Node 22.23.3。`audit.py` 核对上游六事件字符串的相对顺序、模型关键字符串和结果声明，独立枚举硬编码模型的三个候选，以及图版源稿的限定语和三条边字符串。它不解析或绑定页面中的事件表、枚举表，也不校验基线共用段落；这些在本次独立源码复核中逐项核对。它不是通用模型检查器，也不执行上游。

```sh
python3 experiments/operation-order/audit.py
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs finalize explainer experiments/operation-order/candidate.archify.md experiments/operation-order/explanation.html --quality standard --json
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs finalize explainer experiments/operation-order/baseline.archify.md experiments/operation-order/baseline.html --quality standard --json
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs browser-check experiments/operation-order/explanation.html --json --require-provenance
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs browser-check experiments/operation-order/baseline.html --json --require-provenance
```

两次 finalize 的 validate、deliver、check 均通过，未请求 browser-check；首稿未改，保存在 draft-1。图版有三条写作提示、基线有两条，限定说明刻意保留。自动检查不证明视觉质量或用户收益。

单独对两个生成 HTML 执行 `browser-check --json --require-provenance`，均返回 pass、0 diagnostics、current provenance。图版 HTML SHA-256 `50127c55650797a2713ca2d09bcb74f0e14396db9fd9c9f4eb37da83918e459a`；基线 HTML SHA-256 `23f9b8bac86f37e888e6067f3ad4fa000d3de5a86797a4227f74c314faf58de6`。原始 receipts 含本机路径，留在 `/tmp/archify-operation-order-receipts/`；公开的[验证摘要与原件摘要](evidence/verification.json)是选字段派生记录，不冒充原始 receipt。

## 实际对照与决定

协调者实际打开两页、查看八张原始截图，并操作图版的主题、交互图和 Escape。详见[图片、范围和独立审查](root-review/README.md)。同为 1440×900 时，基线文档高 1526px、图版 1805px；文件分别为 156572 / 541210 bytes。新增图版块带来 279px 阅读长度和 384638 bytes 文件体积。

图把三条不同依据的约束画成可见环；三句文字与枚举表已能解释矛盾。390px 下文字基线仍直接可读，图版的小预览提示打开交互图。原生图的默认“后端”图例也不适合操作节点，应计为该表达复用的局限，不能据此扩展共享 schema。

本轮保留独立实验分支供比较，暂不创建 Draft PR 或提出共享功能。没有读者实验、理解速度或偏好结论；后续只有在更复杂的真实阅读任务中出现具体缺口时再评估。AI assistance：GPT-6.1-Terra 制作与调研，GPT-6.1-Sol 独立复核及浏览器观察。
