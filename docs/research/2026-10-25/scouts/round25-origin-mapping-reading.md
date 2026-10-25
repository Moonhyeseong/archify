# Round 25：映射原点是查询结果，不一定是字符的精确来源

2026-10-25，只读发现。先检索当前 hub README、全部 scouts 与45项实验索引，排除已有 Compiler Explorer asm/source 对照、Line notes、Diff numbers、源码导航、types 和 Copy identity。此次读取3个此前未深入的许可完整项目，另记录2个缺完整许可的筛除项；不按 stars 选择。原始源码、完整许可与完整 fixture 只读取得，没有运行第三方 JS/TS/Rust、宏、编译器、测试、source-map consumer 或安装工具。下列 expected 均为上游已提交断言，不是本轮 stdout。

**结论：最多推荐1个固定内容实验，0个共享产品改动。** 用既有 Explainer 的表与代码引用回答：“同一个 generated `L2/C13`，为何会得到两个 original 位置？返回 null 又能说明什么？”其新增阅读动作是对照**查询位置、策略、实际选中 segment、expected 原点**，不是重新做源码链接。没有证据支持通用 source-map 导入器、双编辑器、宏展开服务或新图类型。

## 来源与排重

能力比较固定 `dev 10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。当前 [Explainer sources](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/sources.mjs#L178-L260) 已核 Git revision/path/正整数行范围并冻结代码字节；它没有把 generated segment 解码为 original 的合同。SourceCard 可引用真实 test/consumer 行，不能把 map 内声明的 `input.js` 或 URL 当作已验证 checkout 文件。

GitHub 实际窄查 `sourcemap in:title,body` 的 open issues/PR，以及 `"generated code"` issues、`"original position"` PR，均无命中；宽查 `source map` 出现 [#196 多仓证据](https://github.com/tt-a1i/archify/issues/196)、[#1053 provenance](https://github.com/tt-a1i/archify/issues/1053)、[#367 ownership/locate](https://github.com/tt-a1i/archify/pull/367)，其输入分别是 Git 仓库/交付/路径归属，不是生成列→原始列查询。检索不证明完全无重复。再次核实 [#1102 已合入](https://github.com/tt-a1i/archify/pull/1102)，[#1103](https://github.com/tt-a1i/archify/pull/1103) 仍 draft、head `f0be206acbc90eb7c6c6b636030e3eb28963d284`：Atlas 的 module/file/function 事实与 Classic hand-off 不提供本轮 segment/bias 解读。

| 新来源，固定 Git | 完整许可与实际读取范围 | 可借鉴机制 / 判断 |
| --- | --- | --- |
| [jridgewell/sourcemaps](https://github.com/jridgewell/sourcemaps/tree/b7600158f4de012d246b7834a73c7c2190e75136) `b7600158f4de012d246b7834a73c7c2190e75136` | [trace-mapping/LICENSE](https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/LICENSE)，MIT。完整 test 含 decoded map、原始文本与 expected；consumer `src/trace-mapping.ts`、binary-search、segment tuple 已核。 | 默认 GLB、显式 LUB、缺失 segment 不能混成精确字符映射。唯一内容候选，详下。该仓是已迁入的 monorepo，不把旧独立 trace-mapping 仓另算项目。 |
| [Rich-Harris/magic-string](https://github.com/Rich-Harris/magic-string/tree/993d27d8aee16d2ca46646a5c3c0b290c8084323) `993d27d8aee16d2ca46646a5c3c0b290c8084323` | [LICENSE](https://github.com/Rich-Harris/magic-string/blob/993d27d8aee16d2ca46646a5c3c0b290c8084323/LICENSE)，MIT。完整 `tests/MagicString/generate-map.test.ts`、remove test；`src/MagicString.ts`、`utils/Mappings.ts`、SourceMap 已取。 | 修改操作用 original indices，generated 列随删改变化；intro/outro 只推进 generated 位置，不自动产生原始来源。可解释，但不再另做一个删改动画，避免与 Hintful stages 重叠。 |
| [getsentry/rust-sourcemap](https://github.com/getsentry/rust-sourcemap/tree/713106c63ee21a178e5ea9f508e5897453c0e290) `713106c63ee21a178e5ea9f508e5897453c0e290` | [LICENSE](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/LICENSE)，BSD-3-Clause。完整 regular test；Hermes input/module/output.map/README/test 与 `src/types.rs`、`hermes.rs`、decoder。 | consumer 的 closest-token 合同可回到前一行；Hermes bytecode offset、源码行列和函数名是分层查询。不能把 JS consumer 的缺失规则当所有工具通则。无第二个实施推荐。 |

## 另两源：机制可读，许可或 fixture gate 不满足

- [evanw/source-map-visualization `f3e9dfec20e7bfd9625d03dd0d427affa74a9c43`](https://github.com/evanw/source-map-visualization/tree/f3e9dfec20e7bfd9625d03dd0d427affa74a9c43) 的完整 tree 仅 README/code.js/index.html/style.css，没有 LICENSE 或完整许可。完整 [code.js](https://github.com/evanw/source-map-visualization/blob/f3e9dfec20e7bfd9625d03dd0d427affa74a9c43/code.js) 81865B，SHA256 `d9ff4ead70dcec5acd628208e4f3ce569a23af889807868e25045368e20ca780`；内含 exampleJS/exampleMap 常量，不是独立 input/expected fixture 对。`analyzeLine` L1160–1193、`rangeOfMapping` L1215–1245 将同一 generated 行内的段组织成 `[start,nextStart)`；mousemove 选中范围、mousedown 滚向另一侧 anchor，并可切 original 文件。画区间不是逐字符双射，空 mapping 行也不借前一行。未做浏览器验收，无完整许可，不复制示例/交互代码。
- [Rich-Harris/sorcery `f3d28054ca7744ea34b01785713860288489d1b5`](https://github.com/Rich-Harris/sorcery/tree/f3d28054ca7744ea34b01785713860288489d1b5) 只有 README/package 的 MIT 声明，没有完整 grant/disclaimer/LICENSE。已完整读 [CLI fixture `test/cli/creates-new-file`](https://github.com/Rich-Harris/sorcery/tree/f3d28054ca7744ea34b01785713860288489d1b5/test/cli/creates-new-file)：command、CoffeeScript54B、中间 JS182B/map267B、min JS112B/map168B，expected min JS112B/map279B。[consumer test L472–530](https://github.com/Rich-Harris/sorcery/blob/f3d28054ca7744ea34b01785713860288489d1b5/test/sorcery.test.js#L472-L530) trim 文本并 parse JSON 比较，不能称原字节一致。[Node.trace L129–188](https://github.com/Rich-Harris/sorcery/blob/f3d28054ca7744ea34b01785713860288489d1b5/src/Node.js#L129-L188) 非 exact 列匹配回退行首项、column=null，不是普通 GLB；[Chain.apply](https://github.com/Rich-Harris/sorcery/blob/f3d28054ca7744ea34b01785713860288489d1b5/src/Chain.js#L43-L58) 丢弃无法追踪项，不等于输出显式 unmapped marker。代理的自写数据解码仅作独立静态观察，非运行 sorcery；没有许可 gate，不复制资产，也不实施其特殊 fallback。

## 深读 A：同一个针点，GLB 与 LUB 都不是自动逐字符插值

完整 [trace-mapping.test.ts](https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/test/trace-mapping.test.ts#L29-L71) 内定义整个 decoded map：`file:output.js`、`sources:[input.js]`、`sourceRoot:https://astexplorer.net/`、names 和6个 generated 行数组，另有完整 `sourcesContent` 字符串。它是上游合成单元 fixture；**没有随例提供 generated output.js 的完整文本**，所以只能画 segment 坐标/表，不能补写“生成后的代码”并标成原始产物。

第二个 generated 行中相邻两段是 `[12,0,1,14,2]` 与 `[17,0,1,10]`：第一个数是 generated column；source index=0；original line 内部为0-based；最后的2是 names index `Error`。本例的 [expected](https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/test/trace-mapping.test.ts#L251-L286) 是：

| 查询 API 的 generated 位置 | 策略 | expected original（API 表示） | 它能回答什么 |
| --- | --- | --- | --- |
| line=2, column=13 | 默认，或显式 GLB | `https://astexplorer.net/input.js`，line=2，column=14，name=`Error` | 选中 generated col12 的段，原点仍是 col14，不加 `13−12` 变成15。 |
| 同样 2:13 | LUB | 同一 source，line=2，column=10，name=null | 选中后方 generated col17 的段；“后方”不表示 original 列也更大。 |
| 100:13 | 默认 | source/line/column/name 全 null | 该输入在此 query 没有可用映射；不能推断文件被删除、代码不存在或程序没执行。 |

[originalPositionFor L313–353](https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/src/trace-mapping.ts#L313-L353) 明确 API line 是1-based、column 是0-based，先把 line 减1再查；`traceSegment` 的 line/column 则均0-based。`segment == null` 与仅 `[generatedColumn]` 的 unmapped segment 都返回全 null。**没 segment、单字段明确 unmapped、没有 sourcesContent，是不同状态**；不能统一涂成“源码缺失”。原 fixture 第4行为空数组、第6行为 `[[0]]`，但上表只将 upstream 实际断言过的查询称 expected；本轮未额外执行查询。

[traceSegmentInternal L548–583](https://github.com/jridgewell/sourcemaps/blob/b7600158f4de012d246b7834a73c7c2190e75136/packages/trace-mapping/src/trace-mapping.ts#L548-L583) 给出按列查找与 bias；普通段返回保存的原点。该 fixed revision 另有 `rangeMappings` 分支，会按 range 规则计算偏移，故不能概括“所有 sourcemap 永不插值”。候选只限上述没有 range metadata 的原 fixture，不引入新 range 引擎，也不混入其后另一组 range tests。这里是位置查询 expected，不是原代码执行、语义等价或编译成功证明；URL 只是 map 的来源声明，不请求外站。

## 深读 B：换一个 consumer，缺失边界和坐标单位就可能不同

完整 [test_regular.rs](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/test_regular.rs) 包含一个完整 JSON map 和所有查询 expected。其断言 `lookup_token(0,1000)` 乃至 `lookup_token(1000,0)` 都返回最后 token 对应的 `coolstuff.js,2,8,None`；不是输入真有1001行或第1001列。[lookup_token L711–727](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/src/types.rs#L711-L727) 对整个 `(dst_line,dst_col)` 序列做 greatest-lower-bound，API 两个坐标均0-based。**它返回 closest token 的事实，不能包装成该字符精确来源已验证**。此合同与前述同一行的普通段查找不同，不将两个库的查询结果混成一份 oracle。

还深入完整 [Hermes fixture README](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/fixtures/react-native-hermes/README.md)、[input.js](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/fixtures/react-native-hermes/input.js)、[module.js](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/fixtures/react-native-hermes/module.js)、[output.map](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/fixtures/react-native-hermes/output.map) 及 [test_hermes.rs](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/tests/test_hermes.rs)。README 留有生成/组合命令和示例 stack，**本轮一个都没跑**。map 有6个 source 路径、无 sourcesContent，原生/Metro 依赖只是名字，不是已经取得的全部源内容。

上游 test 对 rewrite 后 map 断言 `lookup_token(0,11939) → (module.js,1,10,None)`，另一个 API 才给 enclosing function `foo`；`11947` 得 original column4而函数名仍 `foo`。[hermes.rs L94–121](https://github.com/getsentry/rust-sourcemap/blob/713106c63ee21a178e5ea9f508e5897453c0e290/src/hermes.rs#L94-L121) 明说这个输入是 **bytecode offset**，再由 token 的原位置查 Facebook function map。不能把11939叫 source column、源文件 byte offset 或普通 JS 生成列，更不能由 enclosing function 得到动态调用边。完整输出与消费源码可复查，但重做 stack symbolicator 的执行信任面与坐标合同不值得带入 Archify。

## 补充：MagicString 说明“原索引”与“生成列”不能只加一个行号偏移

完整 [generate-map test L8–48](https://github.com/Rich-Harris/magic-string/blob/993d27d8aee16d2ca46646a5c3c0b290c8084323/tests/MagicString/generate-map.test.ts#L8-L48) 的原字符串是 `abcdefghijkl`，操作 `remove(3,9)`，hires=true；断言完整 encoded map，且 generated 1:4 查询到 original 1:10。另一完整 prepend case 原文 `x`、LF、`q`，插入 `y`、LF 后，expected mappings 是 `;AAAA;AACA`。不能据开头分号把新加 y 的来源指到 original 第一行。

[MagicString._generateMappings](https://github.com/Rich-Harris/magic-string/blob/993d27d8aee16d2ca46646a5c3c0b290c8084323/src/MagicString.ts#L374-L405) 对 intro/outro 调 `advance`，未改 chunk 调 `addUneditedChunk`，改过 chunk 调 `addEdit`；[Mappings](https://github.com/Rich-Harris/magic-string/blob/993d27d8aee16d2ca46646a5c3c0b290c8084323/src/utils/Mappings.ts) 又区分 hires/boundary/experimental-range。这些是 producer 策略，不可拿一份 hires ASCII fixture 推断 Unicode byte offset、所有 compiler 映射精度或运行因果。现有 Hintful stages 已解释变换前后阶段，本轮不再用这例另建删改播放页。

## 唯一可选实验：给查询结果标出它选中的段

内容限定完整 trace-mapping test、完整 MIT、所引完整 consumer 源文件，不执行 TS、encode/decode 或上游 test。不做 parser/importer，只把固定 decoded literal 与**三条 upstream expected**转为作者明确标注的派生数据；用标准库独立读取该有限 JSON 投影核对字段/indices/expected bytes，原 test 全文保留并 hash 绑定。任何自动提取若越出固定 fixture/断言边界即失败，不把正则做成通用 TS 读取器。

既有 Explainer：结论→上表→generated line2 的7段坐标表→真实 test/consumer SourceCard。读者逐行对照 query13、GLB选择12/LUB选择17和各自 original 字段；null 行单列，完整6行 mappings（包括空行与单字段 unmapped）保留在输入/附表，不悄悄删除。无需 native 图；若加图也只表达“查询策略选段”，不画调用/数据依赖。图表不能为缺少的 output.js 补造字节；map 中的 sourcesContent 用明确的提交数据字段/JSON literal 展示，不能冒充 Git 中实际 `input.js` 片段。

与既有实验的剩余差异：Line notes 是作者注释与同一源行往返；Diff numbers 是旧/新 diff 坐标；Diagnostic locations 是报告位置与 source 证据；本例是**同一 generated 针点经不同查询策略选不同 segment**，其中无映射也不等于 source 文件没了。它不改变 SourceCard、Viewer、schema 或 source evidence 验证流程。成本是一份固定小内容目录、三行 expected 与7段局部表的维护，不是运行期 mapping 库。若没有读者需要解释这种歧义，停在报告即可，不为凑实验增加页面。

验收只需正常 CLI 的静态 render/finalize、raw/公开派生回执分离，独立核全部输入与三条 oracle；root 实际截图须能同时看见相同 query、不同 bias、选中段和 original 差异，null 与不明来源说明清楚。不得宣称浏览器自动定位原始字符、真实故障已修复、统计/速度提升、上游执行或用户收益已验证。

## 完整原件账目

下表 SHA-256 对应固定 Git raw 完整 bytes，非本轮生成结果。完整 fixture 的 input/expected 在 test 内联时保留整份 test，不只取有利片段；consumer 已按上文 owning path 固定。

| 项目 / 完整路径 | bytes | SHA-256 |
| --- | ---: | --- |
| trace-mapping `packages/trace-mapping/LICENSE` | 1080 | `769d154fbde32a915af110b1123650bc79f4cbe675acc66e005265bf069c6c6c` |
| trace-mapping `packages/trace-mapping/test/trace-mapping.test.ts` | 34534 | `e8e50397fc96d6fac2b534be35057e867d1745bef10ba0b4d330872b9cd25972` |
| trace-mapping `packages/trace-mapping/src/trace-mapping.ts` | 24934 | `e45736cfe634564cbd3fc54f746fc23104f4e8ae82014dd492ad62384e7befa4` |
| MagicString `LICENSE` | 1051 | `1cbe51b907662f6cb1492b16c359384a595180bf0e4d101603ed525e75c4e484` |
| MagicString `tests/MagicString/generate-map.test.ts` | 22726 | `62932bf0bf5a4b90528753e876c298abcbc9587ebdf43a7def94e28149266a7e` |
| MagicString `src/MagicString.ts` | 50277 | `648409609d7baf4d934b1d04be98544109fd01eacbaa97a4a96c30d3f552326a` |
| MagicString `src/utils/Mappings.ts` | 7125 | `a620d8cab359254a66f3e7119ac1818b31d6268173d3e363e4fde3f46be0d24e` |
| rust-sourcemap `LICENSE` | 1493 | `7516e1cf340213f60d96bca77bb012882dbf80e7cca5922c914174f605d9ef71` |
| rust-sourcemap `tests/test_regular.rs` | 1507 | `70ff90a5fe9316fd08271f4453b7a6da11933c887b17f862ba37ed04d9837242` |
| rust-sourcemap `tests/fixtures/react-native-hermes/README.md` | 1016 | `59c461aa21ec29799658b7c4b87a13ec38b0a304e90b57c82f576e2494df30e6` |
| rust-sourcemap `tests/fixtures/react-native-hermes/input.js` | 42 | `35cebdb1911a4e364d63f460ea32ccdf9a91af650cd9e598bb82416e763fe95f` |
| rust-sourcemap `tests/fixtures/react-native-hermes/module.js` | 62 | `86ee93a337b317ef6b67c689ffa78abed48a7fb27e717262f3174b329a8fb15a` |
| rust-sourcemap `tests/fixtures/react-native-hermes/output.map` | 16982 | `aa003cfa02dd5e218562115c2f1a4cec2fd0a3f3983d6b6efbb86d37e4f97e7b` |
| rust-sourcemap `tests/test_hermes.rs` | 1797 | `70392564abf7dafeca8b32516526bc275943b67bd052d589cd76e03b2b10319d` |
| rust-sourcemap `src/types.rs` | 68915 | `f85fbc21806143dbc4672573ce298b371f0bc89d6f01209d2fcfef4a294653bd` |
| rust-sourcemap `src/hermes.rs` | 7371 | `652e653e26f83620e694008f98ca5b0d2359991221f5d8ac571f2fd4871e3047` |
