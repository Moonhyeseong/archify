# hello 自身 165 B，为什么保留 169 B？ {#retained-size}

**165 B 自身 + 4 B 直接支配子项 = 169 B retained。** 本页采用 Twiggy 已提交的子树报告。169 B 约占全体分析项的 6%。这不是本次删除效果实测。

- 树边表示直接支配关系，不表示调用。[](source:concept)
- 百分比分母是全体分析项的 `items.size()`，不是选中的子树。[](source:emitter)
- 本页手工解释固定 golden，未执行 Twiggy、读取二进制或测量性能。

@answer scope="Upstream committed golden · 选择 hello 子树 · 二进制 digest 未采集 · 非本次工具运行"
@meta locale=zh-CN
@source golden title="Twiggy：完整原始 golden" url=https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/twiggy/tests/all/expectations/dominators_wee_alloc_subtree_json
@source selection title="官方测试：选择 hello 的参数" url=https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/twiggy/tests/all/dominators_tests.rs
@source emitter title="JSON emitter：字段与百分比分母" url=https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/analyze/analyses/dominators/emit.rs
@source concept title="Twiggy：支配与 retained size 定义" url=https://github.com/AlexEne/twiggy/blob/a624909e389fcb12d6b3b66f1b789b986c681786/guide/src/concepts/dominators-and-retained-size.md

## 165 + 4 = 169：子项已经算在 retained 内 {#arithmetic}

@diagram tree id=dominator-tree source=retained-size.tree.json title="直接支配树 · 不是调用树"

| 项目 | 自身 shallow | 保留 retained | 原 retained 百分比 |
| --- | --- | --- | --- |
| `hello` | 165 B | 169 B | 5.999290024849131% ≈ 6% |
| `type[5]: () -> i32` | 4 B | 4 B | 0.1419950301739439% |

@callout level=warning title="不要跨层相加"
| 169 B 已包括子项的 4 B。169 + 4 = 173 B 会重复计算。此处也不把约6%改算成100%。 |

## 这两个数能说明什么？ {#meaning}

@prose
从模型根到一个项目的每条路径都经过另一个项目，才形成支配关系。直接支配关系组织成树，retained 包含自身和被支配子树。它不是运行轨迹，也不证明安全删除后能减少169 B。

| 项目 | 本页证据边界 |
| --- | --- |
| 百分比分母 | JSON emitter 使用 `items.size()`，即全体分析项总大小；未核实它与磁盘文件长度完全一致 |
| 原始选择 | 官方测试声明 `dominators ./fixtures/wee_alloc.wasm -f json hello`；本次未执行 |
| 视图范围 | 只展示选中的 hello 子树，不补造其它项目或 unreachable 汇总 |
| 二进制身份 | digest 未采集；不能把源码 commit 当二进制 digest |
| 使用场景 | 阅读已有体积证据；没有运行性能、用户收益或删除效果实测 |

## 如何核对同一个项目？ {#identity}

名字不是稳定ID。下面的 pointer 只有和同一报告 digest 一起，才能定位本报告内的出现位置；不承诺跨构建身份。

| 出现位置 | 对应项目 |
| --- | --- |
| `/items/0` | `hello` |
| `/items/0/children/0` | `type[5]: () -> i32` |

@facts
| 原始报告 SHA256 | `5d26ff44bc544f820490bf3a2c52e53b7f66f110fe2f6ea57243f04a9ea1907f` |
| 上游 revision | `a624909e389fcb12d6b3b66f1b789b986c681786` |
| 来源分类 | Upstream committed golden；不是本次运行或手写 synthetic |
| 许可与归属 | Apache-2.0 / MIT；The Rust Project Developers，完整许可随实验保留 |

完整313字节原文件、精确百分比、逐项字段和官方选择参数保存在本实验的 upstream 与 evidence 文件中。两份图是手工编写的固定阅读样例，没有通用转换器。
