# 四个 flags 为什么不增加 IHDR 长度？

四个 flags 重读 `type` 内的四位。IHDR 仍是 **25 字节**：`4 + 4 + 13 + 4`。

- `length = 13` 只计 data，不是整个 chunk 长度。
- `type` 占 4 字节；四个 flags 都在它的 32 位以内。
- 树按存储字段和解释视图组织，节点数不能当字节数。

@answer scope="固定 97B PNG · IHDR 局部 · 独立字节观察 · 未运行 fq"
@meta locale=zh-CN
@source golden title="fq 固定完整 golden：既有期望" url=https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/testdata/4x4_palette.fqtest
@source decoder title="fq decoder：回退 32 bits 后重读 flags" url=https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/png.go#L87-L102

## 哪些是存储，哪些是解释？

@diagram tree id=byte-views source=byte-views.tree.json

IHDR 到四字段表示存储分解；type 到 flags 表示重叠解释。第二层不增加存储。[](source:decoder)

## 25 字节怎样对账？

| 存储字段 | 原文件 byte 区间 | 大小 | 固定输入观察 |
| --- | --- | --- | --- |
| length | `[8,12)` | 4 B | `00 00 00 0d`，大端值 13 |
| type | `[12,16)` | 4 B | `49 48 44 52`，ASCII IHDR |
| data | `[16,29)` | 13 B | 仅记录原字节，不解码像素 |
| CRC | `[29,33)` | 4 B | `d4 9f 76 ed`，本轮不重算 |
| 合计 | `[8,33)` | 25 B | 其余 72 B 保留在完整输入，未展开 |

完整文件 97 B：signature 8、IHDR 25、PLTE 24、IDAT 28、IEND 12。上游 golden 报告这些范围与 CRC valid；这是上游既有期望，不是本轮 fq 实跑结果。[](source:golden)

## 四位具体在哪里？

| 解释名 | 原文件 bit 区间 | 所在 byte | MSB 起算索引 | 值 |
| --- | --- | --- | --- | --- |
| ancillary | `[98,99)` | 12 | 2 | false |
| private | `[106,107)` | 13 | 2 | false |
| reserved | `[114,115)` | 14 | 2 | false |
| safe_to_copy | `[122,123)` | 15 | 2 | false |

所有区间为半开区间。bit offset 等于 byte offset 乘 8，再加最高位起算索引。type 对应 bit `[96,128)`，四位全部落在其中。golden 的 `0xc.2` 是 byte 12 加 2 bits，不是十进制 12.2 字节。

本轮原创标准库脚本只读固定 SHA256 输入，独立记录字节与位值。没有运行 fq、GraphicsMagick、通用 parser、解压或图像有效性检查。byte offset 不是源码行号。上游图像生成命令使用内置 gradient；本轮未重现其生成过程，也不宣称图像属公有领域。
