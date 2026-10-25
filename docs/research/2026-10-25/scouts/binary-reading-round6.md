# Binary reading round 6：同一字节的多种解释，不是更多存储

2026-10-25。起始对hub全部44份scouts、385个唯一GitHub owner/repo排重；下列6个仓库未覆盖，不按stars筛选。已有data-layout研究对象槽位/padding，grammar研究语法推导，payload研究JSON差异；本轮只看**具体文件字节、位范围及解析结果**。未安装或执行上游、二进制、图像生成器、debugger、服务或浏览器，没有产品改动、分支、commit或push。

**保留一个低成本内容候选：用完整97B PNG与上游golden，解释四个1-bit flags为何不增加文件长度。** 现有Tree＋范围表足够，不需要binary parser、hex renderer或新schema。其余来源用于边界核对；不建议通用converter或二进制编辑器集成。

## 六个固定来源

| 来源 / 固定revision / 许可 | 已核实际机制和owning source | 对Archify的判断 |
| --- | --- | --- |
| [fq](https://github.com/wader/fq/tree/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a) · `b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a` · [MIT](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/LICENSE) | [PNG完整输入及dv golden](https://github.com/wader/fq/tree/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/testdata)保留层级、原始范围、值与校验标签；[range接口](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/pkg/interp/decode.go#L578-L594)提供位单位的`_start/_len/_stop`。 | 最适合固定内容解释；golden不是本轮fq实测。不能把dot后的bit offset当十进制小数字节，也不从raw leaf推断已完成语义解析。 |
| [Kaitai Struct Web IDE](https://github.com/kaitai-io/kaitai_struct_webide/tree/c72e3f331fb923d8593b023763fae74eb35d6c9f) · `c72e3f331fb923d8593b023763fae74eb35d6c9f` · [根GPL v3文本](https://github.com/kaitai-io/kaitai_struct_webide/blob/c72e3f331fb923d8593b023763fae74eb35d6c9f/LICENSE)，另有第三方许可清单 | [ParsedMap](https://github.com/kaitai-io/kaitai_struct_webide/blob/c72e3f331fb923d8593b023763fae74eb35d6c9f/src/ParsedMap.ts#L16-L54)把exported value的ioOffset与start/end结合，转为显示interval，并维护unparsed范围。 | 解析对象树与hex选区同步值得借鉴，但其显示end是`ioOffset+end−1`，不能直接与fq半开stop混用。lazy/部分对象和buffer边界须保留，不把可见map当完整解析证明。 |
| [Kaitai console visualizer](https://github.com/kaitai-io/kaitai_struct_visualizer/tree/23ec082a066d1ac593cedb96bbccda7ad999a3ff) · `23ec082a066d1ac593cedb96bbccda7ad999a3ff` · [根GPL v3文本](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/LICENSE) | [7字节输入](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/input/7bytes.bin)、[grammar](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/formats/partial_seq.ksy)、[成功/EOF预期](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/parser_spec.rb#L15-L44)明确保留partial parse与缺失end。 | 两个Kaitai工具分属不同前端，此处不再把compiler算第三个项目。EOF后仍可解释已完成字段；不能把nil或缺end转成零长度/已知null。无需运行Ruby/compiler。 |
| [ImHex](https://github.com/WerWolv/ImHex/tree/34483cb90527cd71c92049ef3b1b2cc27936a1d4) · `34483cb90527cd71c92049ef3b1b2cc27936a1d4` · [根GPL v2文本](https://github.com/WerWolv/ImHex/blob/34483cb90527cd71c92049ef3b1b2cc27936a1d4/LICENSE)；[libimhex另为LGPL2.1文本](https://github.com/WerWolv/ImHex/blob/34483cb90527cd71c92049ef3b1b2cc27936a1d4/lib/libimhex/LICENSE) | [字段选择回调](https://github.com/WerWolv/ImHex/blob/34483cb90527cd71c92049ef3b1b2cc27936a1d4/plugins/builtin/source/content/views/view_pattern_data.cpp#L72-L81)分别向hex editor发送offset/size、向pattern editor发送source line；[列显示](https://github.com/WerWolv/ImHex/blob/34483cb90527cd71c92049ef3b1b2cc27936a1d4/plugins/ui/source/ui/pattern_drawer.cpp#L118-L148)另处理bit与inclusive end。 | “选中字段”关联两种坐标，而非把offset冒充源码行。provider/base-address上下文不能丢；Pattern Language是执行/解释系统，不复制或引入Archify。 |
| [hexyl](https://github.com/sharkdp/hexyl/tree/6ecc29b9c8c84d08a7e860f7f69c22b113b480ea) · `6ecc29b9c8c84d08a7e860f7f69c22b113b480ea` · [MIT](https://github.com/sharkdp/hexyl/blob/6ecc29b9c8c84d08a7e860f7f69c22b113b480ea/LICENSE-MIT) OR [Apache-2.0](https://github.com/sharkdp/hexyl/blob/6ecc29b9c8c84d08a7e860f7f69c22b113b480ea/LICENSE-APACHE) | [完整ASCII输入](https://github.com/sharkdp/hexyl/blob/6ecc29b9c8c84d08a7e860f7f69c22b113b480ea/tests/examples/ascii)与[预期hex/ASCII输出](https://github.com/sharkdp/hexyl/blob/6ecc29b9c8c84d08a7e860f7f69c22b113b480ea/tests/integration_tests.rs#L32-L50)，另有length等输出窗口测试。 | 字节原样与文本视图并排，适合校对，不提供协议字段归属。不能将颜色/分栏当已解析字段；没有理由为固定表新增hex-grid产品。 |
| [REHex](https://github.com/solemnwarning/rehex/tree/0727b33720e3b4a6197aef562e7a59b257ef4e19) · `0727b33720e3b4a6197aef562e7a59b257ef4e19` · [根GPL v2文本](https://github.com/solemnwarning/rehex/blob/0727b33720e3b4a6197aef562e7a59b257ef4e19/LICENSE.txt) | [BitOffset](https://github.com/solemnwarning/rehex/blob/0727b33720e3b4a6197aef562e7a59b257ef4e19/src/BitOffset.hpp#L56-L84)明确bit精度；[real/virtual mapping](https://github.com/solemnwarning/rehex/blob/0727b33720e3b4a6197aef562e7a59b257ef4e19/src/document.cpp#L1336-L1352)保留两个地址空间及length，并拒绝已有映射冲突。 | 文件位置、bit位置与虚拟地址是不同坐标。表格可保留origin/unit，不能看到一个address列就当当前文件offset；不引编辑器、Lua模板或进程能力。 |

## 深入A：fq的完整97B合成PNG与重叠解释

固定完整输入为[`format/png/testdata/4x4_palette.png`](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/testdata/4x4_palette.png)，97 bytes，SHA-256 `508a58c0563252e935d3a0112131f236c81a4db2e161deb203659f0ca1d8cf39`。完整[4x4_palette.fqtest](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/testdata/4x4_palette.fqtest#L1-L66)为6808 bytes，SHA-256 `fa371aa307933d647567c4c511118f38c00c4322948eb78461fa8b862c2a23c0`。它是上游提交的`fq dv`命令和golden，不是本轮执行或新采集结果。

**来源与许可不只靠根文件猜测。** PNG与golden在[首次引入提交bfc977b8](https://github.com/wader/fq/commit/bfc977b810b01246e242f1082f111e3196db7cfa)同时added；[当时golden第1行](https://github.com/wader/fq/blob/bfc977b810b01246e242f1082f111e3196db7cfa/format/png/testdata/4x4_palette.fqtest#L1)自带GraphicsMagick生成命令，输入为内置4×4双色gradient，没有外部图片路径。初始PNG与当前PNG同97B/hash。检查format/png目录及相关来源说明未发现PNG Suite或单独第三方声明。可称“上游带生成命令的合成渐变fixture”，不能称已复现生成、已证明原创或公有领域；后续保留完整MIT notice及来源记录，不自行运行该命令。

golden提供的文件账目完整：signature `[0,8)`；IHDR `[8,33)`；PLTE `[33,57)`；IDAT `[57,85)`；IEND `[85,97)`。五段长度8+25+24+28+12=97B。若解释页只选IHDR，另外72B是**视图外**，不是“unknown/未解析/不存在”。

以下范围来自golden，统一以原文件为origin，使用半开区间：

| 项目 | 范围 | 怎样读 |
| --- | --- | --- |
| IHDR chunk | bytes `[8,33)` | 整段25B |
| length字段 | bytes `[8,12)` | 存的值是13，表示data长度，不是整个chunk长13B |
| type | bytes `[12,16)`，即bits `[96,128)` | 4B字符串IHDR，原值字节为49/48/44/52（hex） |
| ancillary / private / reserved / safe_to_copy | bits `[98,99)` / `[106,107)` / `[114,115)` / `[122,123)` | 四个1-bit解释均false，全部位于type已有32bits内 |
| data与CRC | data13B＋CRC4B | chunk共有4+4+13+4=25B，不再加flags占用 |

[png.go L87–102](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/png.go#L87-L102)先读4B type，再SeekRel回退32bits读取这些flags，给出重叠的直接owning依据。它们既不是4个额外bytes，也不是额外0.5B；这是**同一存储区间上的解释视图**。Tree能表达字段组织，不能因此将所有子节点length相加当物理文件大小。

内部range单位是bits，接口名实际为`_start/_len/_stop`；[包含条件](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/pkg/interp/decode.jq#L108-L111)为start≤p<stop，不发明`_end`。显示里的`0xc.2`表示byte12另加2bits，见[格式化实现](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/internal/mathx/num.go#L61-L74)，不是12.2B。

这个97B fixture没有gap节点，但[IDAT仍走raw分支](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/png.go#L222-L227)，不能声称已解释像素。raw leaf是有范围的原数据，不等同于[FillGaps生成的FlagGap](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/pkg/decode/decode.go#L331-L370)。golden的CRC valid也只引用上游预期，本轮未验证CRC或运行decoder。

压缩子流不要塞入首例：同源[4x4.fqtest L109–123](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/format/png/testdata/4x4.fqtest#L109-L123)的zTXt把文件`[265,278)`压缩数据解成新buffer `[0,5)`的文本；[实现](https://github.com/wader/fq/blob/b3645a5ee7ab64316117f2bf9dd0abf63a1a9f1a/pkg/decode/decode.go#L1200-L1218)创建新reader。新buffer零点不是PNG signature，也不能按长度比例推回原文件。候选首例不含这个额外坐标系，避免扩成解压工具。

## 深入B：完整7B输入，EOF后不是“零长度bar”

Kaitai console visualizer完整[`7bytes.bin`](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/input/7bytes.bin)就是7字节ASCII `1234567`，SHA-256 `8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414`。完整[parser_spec.rb](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/parser_spec.rb)为4899B，SHA-256 `156b6ecaace8a54f57c4bc7cc0a1481991d8f949c0237693d5c8979538f33064`。这是库自己的小测试fixture/expected，不是生产协议包。

[simple.ksy](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/formats/simple.ksy)声明u1及6B字段；测试预期foo值49、range `[0,1)`，bar文本234567、range `[1,7)`。改用[partial_seq.ksy](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/spec/formats/partial_seq.ksy)要求5B＋5B时，预期EOFError，但foo仍为12345、range `[0,5)`；bar为nil，debug只有start5，**没有end**。[Parser.load](https://github.com/kaitai-io/kaitai_struct_visualizer/blob/23ec082a066d1ac593cedb96bbccda7ad999a3ff/lib/kaitai/struct/visualizer/parser.rb#L24-L37)保留data并返回读取异常，确实允许部分结果继续被阅读。

正确表述是“foo完成；bar请求从5开始但未完成，end未报告”。不能画成已观察`[5,10)`，不能把bar当零长度或已知null，也不能把剩余两个物理字节称padding。输入仍有7B；完成字段覆盖5B不代表其余2B不存在。这里不运行编译器/Ruby，也不把测试expected写成当前通过；GPL fixture仅作来源阅读，不复制其parser实现。

## 与67f、在审工作和旧方向比较

能力固定比较dev `67f12389212c54b3122da60e2813c7f8dab7ab2f`：[Tree schema](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/schemas/tree.schema.json)与[Explainer](https://github.com/tt-a1i/archify/blob/67f12389212c54b3122da60e2813c7f8dab7ab2f/archify/references/explainer-authoring.md)已能展示父子组织、表、原文与固定文本SourceCard。本候选没有新Viewer缺口，也不使用字节offset作为`@source lines`：二进制文件按digest＋field path＋stream＋bit range定位；SourceCard只能另外链接decoder/fixture文本中的源码行。

本次实际刷新并读取在审源：[PR1102](https://github.com/tt-a1i/archify/pull/1102)非draft open，head `98efbfcb625b1ecfa813e131c52370b9c2dc83e6`，[focus.js](https://github.com/tt-a1i/archify/blob/98efbfcb625b1ecfa813e131c52370b9c2dc83e6/viewer/focus.js#L387-L458)已有explanation及后续drilldown；[PR1103](https://github.com/tt-a1i/archify/pull/1103)仍draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，[Atlas](https://github.com/tt-a1i/archify/blob/f0be206acbc90eb7c6c6b636030e3eb28963d284/archify/modules/code-analysis/overlay/atlas.mjs#L58-L145)是代码facts/依赖/度量投影并回Classic证据。本例不重建inspector/源码交接，也不把字节包含树说成函数依赖图；PR存在不等于已合入67f。

它与retained-size/data-layout有相似的“不能直接求和”提醒，但证据对象不同：retained涉及支配/根，data-layout涉及ABI槽位和padding；这里文件长度已固定，type与flags**重读同一bits**。无需堆、编译器模型或对象布局计算。与payload的未知/null也不同：这里要保留physical bytes、parser error、未报告范围与视图外账目，不为它们设计统一missing schema。

## 候选、成本与最小验收

**只推荐一个authored解释页，待维护者决定实施。** 题目：“IHDR的四个flags已经在type里，为何不能再算长度？”输入保留完整97B PNG、完整6808B golden、生成命令来源与MIT许可；固定手工映射golden的IHDR、type、4flags及envelope。Tree只是组织视图，旁边表格带origin/unit/半开区间，明确重叠；完整文件与视图外72B账目同时保留。不要写任意PNG/golden parser，亦不新增bit-grid、上传入口、图像预览或decoder依赖。

验收逐项核：原文件/golden/source SHA；type `[12,16)`与四flags的bit范围都在同一原始buffer；四flags为解释叠加而非新增存储；13B data与25B chunk不混；原input97B未裁切；IDAT raw与CRC预期的边界说明保留。输出若引用另一native JSON则核单一模型；截图只证明表/树可读，不证明fq实跑、PNG完整有效或用户收益。标准库独立字节切片如将来被授权，也只能作为另记的局部核验，不能冒充完整decoder。

成本低在内容审计与一张Tree/表，不在runtime；主要风险是单位、重叠、end口径与来源许可被简化。Kaitai EOF例可作未来解释材料，本轮不另立第二实验。若一张原golden＋短表已经够读，就接受零新增产物；没有证据支持通用binary importer、debugger、主动pattern执行或完整协议编辑器。

完成范围：仅新增本报告，不修改README/gallery/产品/别人文件；没有上游执行、图像生成、浏览器、全仓测试或发布。fq由只读后台agent深读后，作者再核完整golden/hash、首次PNG字节与owning source；Kaitai完整输入/预期和ImHex坐标回调由作者读取。静态字段/区间核对不称测试运行，来源未证明之处明确保留未知。
