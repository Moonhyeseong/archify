# 同一个包，为何两条路径的子依赖不同？ {#edge-extras}

差别在入边携带的 `socks`，不是两份 `urllib3`。

- `selenium` 请求 `urllib3[socks]`，`requests` 只请求 `urllib3`。[](source:fixture)
- `explicit` 沿各自请求展开；`active` 在此例把 `socks` 作为全局展示上下文。[](source:modes)[](source:selection)
- 这是官方临时 METADATA 测试。版本 `1` 非真实发行版；本轮未运行上游。[](source:fixture)[](source:harness)

@answer scope="固定 pipdeptree 官方受控 fixture · 上游期望而非本轮 stdout · 无安装或运行历史"
@meta locale=zh-CN repo_url=https://github.com/tox-dev/pipdeptree repo_revision=45c43e2616d97484dfb6b16e1d5cfee3626086b8
@source fixture title="四份完整 METADATA 字面量" path=rust/tests/public_api/graph.rs lines=400:421
@source modes title="explicit / active 的完整布尔期望" path=rust/tests/public_api/graph/extras.rs lines=352:369
@source selection title="按 incoming / global extras 选择后继" path=rust/src/graph/mod.rs lines=660:687
@source active title="active 展示集合的计算" path=rust/src/graph/extras.rs lines=83:122
@source harness title="临时写入 dist-info，不安装包" path=rust/tests/public_api/common.rs lines=303:326

## 两条路径各会显示什么？ {#mode-table span=12}

表中“显示”是原测试的 `branch_contains` 布尔期望。不是实际运行日志。[](source:modes)

| 模式与路径 | 当前入边 | 入边 extras | urllib3 的 global extras | 显示 pysocks？ |
| --- | --- | --- | --- | --- |
| explicit · selenium | selenium → urllib3 | socks | 空集 | 是 |
| explicit · requests | requests → urllib3 | 空集 | 空集 | 否 |
| active · selenium | selenium → urllib3 | socks | socks | 是 |
| active · requests | requests → urllib3 | 空集 | socks | 是 |

`selected_children` 看入边 extras，也看 global extras。于是同一 `urllib3` 记录，可在两条路径上展开不同后继。[](source:selection)

## 哪些声明始终没有变？ {#declarations span=12}

四个节点分别对应一份临时 METADATA。两条请求都抵达同一个 [urllib3 · 1](node:metadata-map.urllib3)。

@diagram architecture id=metadata-map source=metadata.architecture.json title="同一身份，入边上下文不同"

条件边保留原谓词 `extra == 'socks'`。图画声明关系，表画展示策略；切换模式并不改写 METADATA。[](source:fixture)

## 原始输入在哪里？ {#original span=12}

以下完整函数写入四份记录。它没有下载真实包，也不是本轮执行结果。[](source:harness)

@code source=fixture

`Provides-Extra: socks` 描述可选能力；有这行不等于当初安装时请求过它。

## active 能证明什么？ {#limits span=12}

`active` 按已有 target 与嵌套 extra 关系计算全局展示集合。它不记录当初用户请求，也不证明运行代码使用过该依赖。[](source:active)

| 这里有的证据 | 不据此声称 |
| --- | --- |
| 一份 urllib3 METADATA，两条请求关系 | 两份安装或两个运行对象 |
| explicit / active 的上游布尔期望 | 本轮 pipdeptree 测试已通过 |
| 条件依赖与 target 存在性 | 所有版本约束均满足 |
| 本轮人工编排图与表 | 安装历史、运行调用或读者收益已验证 |

版本冲突有单独检查。`active` 的这一步不调用它。读表时先确认模式，再看入边携带的 extra。[](source:active)
