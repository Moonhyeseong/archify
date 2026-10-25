# 静态 use 关系不等于分支执行 {#static-uses}

图中保留假分支的 `- a`，并不证明程序执行过它。这里读取官方测试的静态期望，不是一次程序运行。

- 完整输入：`a = 1; a + 1 if a else - a`。
- 四个 `a` 是一个定义和三次读取，不能按同名合并。
- expected 三次展开 `IfExp`，图里仍是同一个表达式节点。
- 这里只投影以模块局部定义 `a` 为根的 use-chain。

@answer scope="固定官方测试期望；未运行 Beniget/Python；非完整 AST、CFG 或执行证据"
@meta locale=zh-CN
@source test title="完整官方 test_ifexp_chain 与 consumer" url=https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/tests/test_chains.py#L36-L67
@source visitor title="IfExp 同时访问 test/body/orelse" url=https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/beniget/beniget.py#L1335-L1340
@source shared title="共享节点在文本中按分支展开" url=https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/beniget/beniget.py#L207-L219
@source constant title="工具保留 Constant 定义" url=https://github.com/serge-sans-paille/beniget/blob/c0f03c00a4b737916a3dcfe9849fc177d1e1fe88/beniget/beniget.py#L1422-L1424

## 四次 a 如何汇入同一个表达式？ {#projection span=12}

@diagram architecture id=uses source=use-chain.architecture.json title="以模块局部定义 a 为根的静态 use-chain 投影"

箭头只表示 `use`，没有求值先后或已发生调用。局部关系借用原生图展示，不是业务架构。[](source:visitor)

偏移从 0 开始，按源字符串字符计数，由作者标注。现有 Live 动效只是阅读装饰，不是求值顺序；可切换 Still。

## 官方输入与完整期望是什么？ {#official span=5}

```python title="官方 source 字符串"
a = 1; a + 1 if a else - a
```

```text title="官方 expected 原始相邻字符串片段"
                "a -> ("
                "a -> (<IfExp> -> ()), "
                "a -> (<BinOp> -> (<IfExp> -> ())), "
                "a -> (<UnaryOp> -> (<IfExp> -> ()))"
                ")"
```

以上是完整 expected 的字符串片段；相邻字面量按源码顺序连接。没有执行测试。[](source:test)

`IfExp` 的重复文本来自每条链各自展开，共享节点没有复制。[](source:shared)

## 哪些关系有证据，哪些没有？ {#limits span=7}

| 阅读问题 | 本页能确认 | 不能据此声称 |
| --- | --- | --- |
| 为什么保留假分支？ | IfExp 访客访问两种分支 | 本次执行走过两种分支 |
| 哪些 a 相同？ | 一个定义、三次独立读取 | 同名等于同一次读取 |
| IfExp 有几个？ | 三处文本展开、一个共享节点 | 三个先后执行的表达式 |
| 常量 1 在哪里？ | 此根 expected 没有列出 | 工具不跟踪常量 |

工具有 `visit_Constant`；本图只截取一个根的使用链。[](source:constant)

| 关系 ID | 起点 | 终点 | 原 expected 分支 |
| --- | --- | --- | --- |
| use-1 | 定义 a | 条件读取 a | 条件 |
| use-2 | 定义 a | 真分支读取 a | body |
| use-3 | 定义 a | 假分支读取 a | orelse |
| use-4 | 条件读取 a | IfExp | 条件 |
| use-5 | 真分支读取 a | BinOp | body |
| use-6 | BinOp | IfExp | body |
| use-7 | 假分支读取 a | UnaryOp | orelse |
| use-8 | UnaryOp | IfExp | orelse |

节点 ID、角色标签和坐标由作者编写。官方没有提供外部图 ID、布局或运行记录。
