# 为什么打印 r 时，选中的 v 仍是绿色波浪？ {#maybe-initialized}

因为只有一条分支给 `v` 赋值。汇合后，分析保留了两种可能状态。

- 快照选中的是 `v`，打印的却是 `r`。[](source:fixture)[](source:consumer)
- `c` 为假时，`r` 指向 `other`；不需要读取 `v`。[](source:fixture)
- 绿色波浪表示此工具的静态 maybe 范围，不是某次执行“半活着”。[](source:analysis)[](source:colors)

@answer scope="RustOwl 固定官方 expected · 选中局部变量 v · 未运行 Rust、编译器或上游分析器"
@meta locale=zh-CN repo_url=https://github.com/cordx56/rustowl repo_revision=607183668459e69f41871827c4d34df38117c427
@source fixture title="完整 cond_init 与它自己的 compiles 注释" path=crates/rustowl/algo-tests/src/must_live.rs lines=151:163
@source consumer title="选择 cond_init 的 v 作 snapshot 断言" path=crates/rustowl/tests/algorithm.rs lines=195:198
@source analysis title="definite 与 maybe 的集合条件" path=crates/rustowl/src/bin/core/analyze/dataflow_analyzer.rs lines=171:201
@source join title="CFG 汇合按 place 取集合并集" path=crates/rustowl/src/bin/core/analyze/dataflow_analyzer/places.rs lines=84:101
@source order title="装饰显示顺序" path=crates/rustowl/src/lsp/decoration.rs lines=463:478
@source clip title="重叠范围裁剪" path=crates/rustowl/src/lsp/decoration.rs lines=534:542
@source colors title="绿色实线、波浪与青色借用" path=crates/rustowl/src/visualize.rs lines=216:253
@source effects title="Ref 不作为 Move 操作数" path=crates/rustowl/src/bin/core/analyze/dataflow_analyzer/effect.rs lines=32:56
@source snapshot title="完整原始 ANSI snapshot · MPL-2.0" url=https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/crates/rustowl/tests/snapshots/algorithm__must_live_cond_init_v.snap
@source mpl title="RustOwl 完整 MPL-2.0 许可" url=https://github.com/cordx56/rustowl/blob/607183668459e69f41871827c4d34df38117c427/LICENSE

## 打印 r，是否一定读了 v？ {#function span=12}

下面是完整函数。原注释在 L151 标为 `compiles`；这是上游说明，本轮没有编译。源码语法高亮不代表 RustOwl 下划线。[](source:fixture)

@code source=fixture

L158 的 `r = &v` 是借用，不是把 `v` 移走。L160 则让 `r` 指向 `other`。[](source:effects)

## 原快照到底标了什么？ {#snapshot-reading span=12}

以下是官方 expected 的派生纯文本：仅去掉 SGR 颜色控制，并选出源行155–163及其下划线。完整原始字节随实验保留。[](source:snapshot)

```text
=== Variable 'v' (1/1) in function 'must_live::cond_init' ===

 155 |     let r;
 156 |     if c {
 157 |         v = String::from("v");
     |         -                   -
 158 |         r = &v;
     |         --- --
 159 |     } else {
 160 |         r = &other;
 161 |     }
     |     ~
 162 |     println!("{r}");
     |     ~~~~~~~~~~~~~~~
 163 | }
     | ~
```

| 原快照观察 | 颜色与形状 | 阅读含义 |
| --- | --- | --- |
| L157、158 的绿色片段 | 绿色实线 | definitely live 装饰 |
| L158 的 `&v` 片段 | 青色实线 | immutable borrow，不是 Move |
| L161、162、163 的绿色片段 | 绿色波浪 | maybe live 装饰 |

纯文本中的 `-` 无法独自区分绿与青，必须结合上表。原快照还含 L165 下一函数的注释；展示裁去了它，不能把它归给本例。[](source:colors)

## 汇合后为什么只是 maybe？ {#state-sets span=12}

令 `I` 表示 Initialized，`U` 表示 Uninitialized。下表是作者按源码与算法写的概念解释，不是工具 JSON，也不指定精确 MIR 位置。[](source:analysis)[](source:join)

| 路径或范围 | v 的概念状态 | 每条路径都有值？ |
| --- | --- | --- |
| c 为真，赋值后 | I | 仅此分支可以 |
| c 为假，未赋值 | U | 不可以 |
| 未固定 c 的汇合 | I ∪ U | 不可以，但仍有 I |

`get_maybe_initialized` 包含 definite 子集，并非只返回波浪区域。显示层先按顺序处理 MaybeInitialized=1、DefinitelyLive=2，再裁剪重叠装饰；不能只凭函数名推最后的字形。[](source:analysis)[](source:order)[](source:clip)

这里讨论普通局部变量 `v`。引用变量另有 live 范围处理；不能把这张表套给所有引用、字段或程序。

## 哪些结论仍然未知？ {#scope span=12}

| 这里保留的证据 | 不据此声称 |
| --- | --- |
| 官方输入、完整原 snapshot 与消费者 | 本轮 RustOwl 测试或编译已通过 |
| 静态 CFG 的路径状态集合 | 某次执行选了哪条路径或概率多少 |
| 源码位置和装饰 | 堆占用时长、运行栈帧或内存值 |
| 本轮作者解释页 | 编译器分析完整正确或读者收益已验证 |

本页 RustOwl 源码摘录、snapshot 派生文本及其嵌入表示保留 MPL-2.0 材料身份。完整原文件和 LICENSE 随实验提供，也可由固定来源取得。Archify 软件 notices 与原创说明的 Apache-2.0 不覆盖这些上游材料。[](source:mpl)
