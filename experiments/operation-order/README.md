# 操作顺序约束：文字与图的对照

[三句文字基线](baseline.html) · [文字加约束图](explanation.html) · [源稿](candidate.archify.md) · [独立复核](audit.py)

Porcupine README 的说明例中，一次长写覆盖两次读取，但实时顺序与寄存器模型无合法排列。两个页面共用同一六行事件、初态、模型、三句解释和三候选枚举；后者增加三节点约束图。图边表示必须先于，带实时或模型依据，不表示调用、死锁或因果。事件位置是 ordinal，不是时间。上游 README 声明 checker 返回 false；本轮未运行 Porcupine。

这是固定内容实验，潜在价值是让读者一眼看到不同依据组成的矛盾；是否比三句文字更容易理解，尚未有读者比较。若无增益就保留文字，不主张新增共享功能。没有通用 parser、checker、上游依赖、schema 或 Viewer 修改。

来源 [Porcupine README @ 97cd067defd99df172053ba7f4ca5bbae57fe446](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#L56-L162)；完整原文和 [MIT 许可](upstream/LICENSE.md) 原字节保留于 upstream。README SHA-256 `4e79c7c7abe2ffc1d7888d7f24f91bf61f6f247d1041e54976c5045fbbdb3a58`，许可证 SHA-256 `a017c16b0beadd6686670ad3609a0130570e02fd8bd4f2d0ad18f46cedf76d1c`。README 的第三方 Jepsen 日志未复制。

## 复核与运行

基线 Archify `e837dc4cb83042d2b6c596e039692e25ec62c2da`，Node `/opt/homebrew/opt/node@22/bin/node`。`audit.py` 核对六事件原始顺序、模型、上游声明、全部三个满足实时先后的排列与首个不符，以及页面的证据标签和三条边。它不是通用模型检查器，也不执行上游。

```sh
python3 experiments/operation-order/audit.py
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs finalize explainer experiments/operation-order/candidate.archify.md experiments/operation-order/explanation.html --quality standard --json
/opt/homebrew/opt/node@22/bin/node archify/bin/archify.mjs finalize explainer experiments/operation-order/baseline.archify.md experiments/operation-order/baseline.html --quality standard --json
```

两次 finalize 的 validate、deliver、check 均通过，未请求 browser-check；首稿未改，保存在 draft-1。图版有三条写作提示、基线有两条，限定说明刻意保留。自动检查不证明视觉质量或用户收益。浏览器单独检查结果见后续记录；感知检查由协调人进行。

单独对两个生成 HTML 执行 `browser-check --json --require-provenance`，均返回 pass、0 diagnostics、current provenance；这只是自动浏览器证据，未做感知检查。图版 HTML SHA-256 `50127c55650797a2713ca2d09bcb74f0e14396db9fd9c9f4eb37da83918e459a`；基线 HTML SHA-256 `23f9b8bac86f37e888e6067f3ad4fa000d3de5a86797a4227f74c314faf58de6`。原始 receipts 含本机路径，留在 `/tmp/archify-operation-order-receipts/`，此处是派生摘要。
