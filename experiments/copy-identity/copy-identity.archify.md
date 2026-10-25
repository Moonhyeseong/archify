# 打印内容相同，哪些列表仍被共享？ {#copy-identity}

`a` 与 `c1` 指向同一外层。`c2` 换了外层，仍共享两个子列表；`c3` 的子列表也独立。

- 四个变量按内容比较均相等。
- 只有 `a` 与 `c1` 是同一外层对象。
- 共享要看箭头的目标，不能只看框里的值。

@answer scope="固定教学构造 · 标准库独立观察 · 只统计 list 身份"
@meta locale=zh-CN repo_url=https://github.com/bterwijn/memory_graph repo_revision=97f39f7832c795ba74da442fb3bb06cdcf506674
@source construction title="memory_graph：原始构造 L8–13" path=images/copy_mutable.py lines=8:13

## 三种复制，改变了哪一层？ {#construction-panel}

@code source=construction language=python

标准库观察程序逐字复用这六行构造。完整上游源文件另含工具导入与 `mg.render`，本次没有执行它们。[](source:construction)

## 沿引用找到同一个目标 {#references-panel}

@diagram architecture id=copy-graph source=copy-identity.architecture.json title="四个变量与七个列表对象"

箭头表示变量绑定或列表索引引用，不表示创建顺序。字母是阅读代号，不是内存地址或跨运行身份。

## 内容相等，不等于同一对象 {#identity-panel}

| 变量 | 外层身份 | 索引 0 | 索引 1 |
| --- | --- | --- | --- |
| `a` | A | P | Q |
| `c1` | A | P | Q |
| `c2` | B | P | Q |
| `c3` | C | R | S |

P 与 R 都含 `[1, 2]`，却是不同列表。Q 与 S 的值也相等，身份不同。

@callout level=note title="七个 list，不是整个对象堆"
| 整数和字符串只内嵌为值，没有观察其对象身份。这里没有修改列表，也没有生成 mutation trace。 |

观察结果来自本次标准库程序，既有上游教学代码是其来源；两者不是上游工具的执行收据。图和此页共用同一份原生 JSON。
