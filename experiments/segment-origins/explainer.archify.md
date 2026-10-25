# 同一位置，为什么映回两处？

查询 `2:13` 没变，**选中的 segment 变了**：GLB 选生成列12，LUB 选生成列17，得到不同原点。

- 原点是映射段保存的位置，不自动加上查询与段起点之间的差。
- 返回全 null，只说明这次查询没有可用映射。
- 这是上游单元 fixture 的 expected，不是本轮执行结果。

@answer scope="固定普通 segment · 未运行映射库 · 不含生成代码全文"
@meta locale=zh-CN
@source oracle title="完整上游 fixture 与四条原断言" url=https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/test/trace-mapping.test.ts#L251-L286
@source map title="完整 decoded map 与 sourcesContent 字段" url=https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/test/trace-mapping.test.ts#L29-L71
@source consumer title="originalPositionFor：坐标、默认 bias 与 null" url=https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/src/trace-mapping.ts#L313-L353
@source selection title="选段与 rangeMappings 例外" url=https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/src/trace-mapping.ts#L548-L583

## 三次查询，各自返回什么？

这里 `行:列` 使用 originalPositionFor 的 API 口径：行从1开始，列从0开始。原点 source 均为 map 声明的 input.js；最后一行 source 也是 null。[](source:consumer)

| 查询 | 策略 / 段列 | 原点 | name |
| --- | --- | --- | --- |
| 2:13 {#query-glb} | 默认或 GLB / 12 | 2:14 | Error |
| 2:13 {#query-lub} | LUB / 17 | 2:10 | null |
| 100:13 | 默认 / 无可用段 | null | null |

默认和显式 GLB 是两条原断言，合并显示为第一行；LUB 和越界查询各一条。四条 expected 原件完整保留，未重新运行。[](source:oracle)

GLB 选不大于查询列的最近段；LUB 选不小于查询列的最近段。这里从12选到17，原点反而从14到10；生成位置和原始位置不是同一把尺。选段说明由作者对照 consumer 核实，不是上游 trace。[](source:selection)

## 生成行2，七个段怎样排？

以下原点采用 API 行号，便于与上表对照。`name=null` 是没有 names index，不是名字叫 null。[](source:map)

| 生成列 | 原始行:列 | name |
| --- | --- | --- |
| 4 | 2:4 | null |
| 8 | 2:10 | null |
| 12 | 2:14 | Error |
| 17 | 2:10 | null |
| 18 | 2:20 | null |
| 32 | 2:10 | null |
| 33 | 2:4 | null |

查询列13位于12与17之间。普通段给出保存的原点14，不能擅自算成 `14 + (13 − 12) = 15`。这个 fixture 没有 rangeMappings；带 range metadata 的另一条路径可计算偏移，不属于本页。[](source:consumer) [](source:selection)

## 完整六行，空行也保留

每个数组是原 decoded segment：`[生成列,source索引,原始行,原始列,可选name索引]`。数组内部行号从0开始；表左侧生成行号从1开始。这里只有 source index 0；names 依次是 foo、bar、Error。[](source:map)

| 生成行 | 完整原 segment 数组 |
| --- | --- |
| 1 | `[0,0,0,0]` `[9,0,0,9,0]` `[12,0,0,0]` `[13,0,0,13,1]` `[16,0,0,0]` `[18,0,0,33]` |
| 2 | `[4,0,1,4]` `[8,0,1,10]` `[12,0,1,14,2]` `[17,0,1,10]` `[18,0,1,20]` `[32,0,1,10]` `[33,0,1,4]` |
| 3 | `[0,0,2,1]` |
| 4 | `[]` |
| 5 | `[0,0,3,0,0]` `[3,0,3,3]` |
| 6 | `[0]` |

第4行没有段，第6行的单字段段明确没有 original 信息。两种结构不同；本页没有为它们追加查询执行。没有 sourcesContent 又是另一种情况，不可都叫“源码文件没了”。[](source:consumer)

## 这些位置，绑定了哪份文本？

map 声明 `file=output.js`、`sources=[input.js]`、`sourceRoot=https://astexplorer.net/`。其 source URL 是声明，不是本轮验证过的外站文件。fixture 没有提供生成代码全文，本页不补造双源码窗。[](source:map)

下面完整保留 map 内 sourcesContent[0] 的 JSON 字符串表示。`\n` 是 JSON 转义，解码后是 LF；它不是 Git 中已验证的 input.js 代码摘录。[](source:map)

```json title="map 提交字段 · JSON 字符串"
"function foo(bar: number): never {\n    throw new Error('Intentional.');\n}\nfoo();"
```

引用卡片只提供固定 GitHub 文件与行范围元数据，不含代码摘录。上游 test、MIT 与 consumer 原文均随实验完整保留。没有执行程序、编译器或映射库；位置对应不证明执行、精确字符来源或语义等价。
