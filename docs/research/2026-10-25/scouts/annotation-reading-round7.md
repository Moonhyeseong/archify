# 图内标注、长标签、单位与局部导出：第7轮小工具筛选

2026-10-25，只读研究。**结论：8个新来源、2个源码深读；本轮0个立即实施候选。** 有用机制是“说明的锚点与标题分开”和“文字装不下时显式报告”；最新 Archify 已有对应能力。局部导出与表达式解释尚未找到足以证明产品改动价值的自然失败，不新增第35个同义内容页。

本轮固定产品基线为 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)，即已合入 #1102 的 dev。hub旧报告的82c7/3f95/67f都是各自历史证据，不能覆盖为本轮验证。只读取 GitHub 官方源码、README、许可证和现有仓库文件；未安装、运行上游、运行产品测试、打开浏览器或产生新截图。以下“已验证”指静态源码/文件事实，读到上游测试不等于本轮执行通过。

## 排重与来源

先读研究中心34实验表，并在全部scouts中检索owner/repo和机制。具体对照 [layout-reading-smalltools](layout-reading-smalltools.md)、[graph-reading-round5](graph-reading-round5.md)、[graph-exchange-smalltools](graph-exchange-smalltools.md)、[interaction-smalltools](interaction-smalltools.md)、[visual-explanation-smalltools](visual-explanation-smalltools.md) 与代码阅读各轮。已有D3-Labeler、d3fc-label-layout、labelgun、avoid-overlap、WebCola/Adaptagrams及泛用图引擎不再列作新发现。Diff line numbers、Preview dashed ink、Source question tour、Retained size、Delivery witness、Recipe stages也不换名重做；Clipboard outcome另有负责分支，不重复。

以下8个项目在本次scout全文检索中未出现。SHA固定到本次取得的默认分支对象；“未归档”不代表积极维护，“push日期”不等于该SHA提交日期。许可证链接均指向实际文件，未复制源码进入Archify。

| 新的一手来源（固定SHA） | 许可/现状 | 实际机制与本轮判断 |
| --- | --- | --- |
| [susielu/d3-annotation](https://github.com/susielu/d3-annotation/tree/18c85b076387b99dc9a196d5bd0b9073198fab39) `18c85b076387b99dc9a196d5bd0b9073198fab39` | [Apache-2.0](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/LICENSE)；未归档，API记录push至2022-12-03 | note title/label、subject、connector与dx/dy分开；深读见下。借鉴结构，不加拖动标注编辑器。 |
| [d3plus/d3plus-text](https://github.com/d3plus/d3plus-text/tree/33d4ff4129662a7915b9b4db3873c86613c8957b) `33d4ff4129662a7915b9b4db3873c86613c8957b` | [MIT](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/LICENSE)；已归档，push至2024-03-26 | textWrap返回原句、行、宽度、truncated；TextBox可缩字/省略。深读见下；不以省略原文换取验收通过。 |
| [susielu/d3-legend](https://github.com/susielu/d3-legend/tree/74043086842cf3edeb52ce6ca7be5f26e3d1d6f4) `74043086842cf3edeb52ce6ca7be5f26e3d1d6f4` | [Apache-2.0](https://github.com/susielu/d3-legend/blob/74043086842cf3edeb52ce6ca7be5f26e3d1d6f4/LICENSE)；未归档，push至2024-07-22 | [color.js](https://github.com/susielu/d3-legend/blob/74043086842cf3edeb52ce6ca7be5f26e3d1d6f4/src/color.js)暴露labelFormat/labelWrap。图例文案要说明实际编码；Archify已有meta.legend覆盖，Recipe measured已用Recipe phase纠正Agent logic，不需新库。 |
| [nytimes/svg-crowbar](https://github.com/nytimes/svg-crowbar/tree/f41f811dba84c6e522c5c213361e6fe65a0b8313) `f41f811dba84c6e522c5c213361e6fe65a0b8313` | [MIT](https://github.com/nytimes/svg-crowbar/blob/f41f811dba84c6e522c5c213361e6fe65a0b8313/LICENSE)；已归档，push至2017-02-28 | [README](https://github.com/nytimes/svg-crowbar/blob/f41f811dba84c6e522c5c213361e6fe65a0b8313/README.md)与[源码](https://github.com/nytimes/svg-crowbar/blob/f41f811dba84c6e522c5c213361e6fe65a0b8313/svg-crowbar.js)提取SVG并带样式。Archify导出已收集CSS/主题/变量并清理瞬态；bookmarklet不能带来新增阅读能力。 |
| [exupero/saveSvgAsPng](https://github.com/exupero/saveSvgAsPng/tree/96484668c131d8a4babd82faa8a9d5bfdcaed64a) `96484668c131d8a4babd82faa8a9d5bfdcaed64a` | [MIT](https://github.com/exupero/saveSvgAsPng/blob/96484668c131d8a4babd82faa8a9d5bfdcaed64a/LICENSE)；已归档 | [prepareSvg](https://github.com/exupero/saveSvgAsPng/blob/96484668c131d8a4babd82faa8a9d5bfdcaed64a/src/saveSvgAsPng.js#L225)支持元素及left/top/width/height；[viewboxtest.html](https://github.com/exupero/saveSvgAsPng/blob/96484668c131d8a4babd82faa8a9d5bfdcaed64a/viewboxtest.html)是公开输入。注意先inlineImages原el再clone，不能直接移植为纯导出。裁局部图不等于裁语义子图。 |
| [google/mathsteps](https://github.com/google/mathsteps/tree/9d370c30f2d9c2b3650883e942f97c8abe6805f8) `9d370c30f2d9c2b3650883e942f97c8abe6805f8` | [Apache-2.0](https://github.com/google/mathsteps/blob/9d370c30f2d9c2b3650883e942f97c8abe6805f8/LICENSE)；已归档，push至2023-06-26 | [README完整示例](https://github.com/google/mathsteps/blob/9d370c30f2d9c2b3650883e942f97c8abe6805f8/README.md)输出oldNode/newNode/changeType/substeps，区分结果与变换说明。它是真实代数求解器；Archify现有百分比/容量注释没有引入它的必要。 |
| [sharkdp/insect](https://github.com/sharkdp/insect/tree/d19e4f15f788a4c1bd277e1ef3bd5a5e3228bdd3) `d19e4f15f788a4c1bd277e1ef3bd5a5e3228bdd3` | [MIT](https://github.com/sharkdp/insect/blob/d19e4f15f788a4c1bd277e1ef3bd5a5e3228bdd3/LICENSE)；已归档 | [Interpreter](https://github.com/sharkdp/insect/blob/d19e4f15f788a4c1bd277e1ef3bd5a5e3228bdd3/src/Insect/Interpreter.purs#L142)解释不兼容单位并给base units；[公开测试](https://github.com/sharkdp/insect/blob/d19e4f15f788a4c1bd277e1ef3bd5a5e3228bdd3/test/Main.purs#L867)含km/cm转换。可借鉴保留单位与分母，不能为阅读器引入表达式运行时。 |
| [silentmatt/expr-eval](https://github.com/silentmatt/expr-eval/tree/6e889e0e75c50ac37d70c35388602025650e0c50) `6e889e0e75c50ac37d70c35388602025650e0c50` | [MIT](https://github.com/silentmatt/expr-eval/blob/6e889e0e75c50ac37d70c35388602025650e0c50/LICENSE.txt)；未归档，默认分支该对象为2021年提交 | [simplify.js](https://github.com/silentmatt/expr-eval/blob/6e889e0e75c50ac37d70c35388602025650e0c50/src/simplify.js)只替换已知变量、保留未知；[公开case](https://github.com/silentmatt/expr-eval/blob/6e889e0e75c50ac37d70c35388602025650e0c50/test/expression.js#L315-L361)。不是逐步证明引擎。当前图没有未定参数求值任务，暂不接入。 |

## 深读一：标注的说明、锚点与连接线应保持不同身份

[d3-annotation官方docs.js L143–153](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/docs/docs.js#L143-L153)已有可复核输入：note含短title和长label，x/y定位subject，dx/dy把说明放到外侧。这是作者提供的演示数据，不是自然生产图或本轮运行结果。

实际实现位于 [Types-d3.js](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/src/Types-d3.js#L258-L279)：noteAlignment读bbox、offset、orientation、align、padding；改说明位置并不改subject数据。[drawText L460–549](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/src/Types-d3.js#L460-L549)先排title再label，量title BBox，把label移到其后，背景随真实bbox加padding。其[alignment测试](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/test/note.test.js)覆盖上/左、align和padding；未执行，也不据此声称避碰全局最优。

重要限制：[wrap L654–688](https://github.com/susielu/d3-annotation/blob/18c85b076387b99dc9a196d5bd0b9073198fab39/src/Types-d3.js#L654-L688)默认按空白分词，用getComputedTextLength量当前tspan；仅在line.length>1时换行。一个无空格长标识符不因此自动拆字，不是Archify长路径/ID的现成修复；依赖实际DOM测量也不能无条件替代离线确定性布局。

**可迁移的机制**是“锚点身份不变，解释另有标题/正文”，不是一根注释箭头。10b4的 [focus.js explanationFor及Passport](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L387-L458)已经提供节点解释面，[drilldowns](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L485-L611)还有跨图深入。没有现有图证明需要在canvas再叠一套注释框、拖动状态、键盘顺序和导出规则。本轮停止于研究。

## 深读二：完整文本、装不下的事实与显示策略是三件事

[d3plus textWrap.js](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/src/textWrap.js#L24-L100)返回lines、sentence、truncated、widths和words。字超过可用宽/高/maxLines时显式truncated，调用者可选择策略。它没有证明文字完整显示；尤其首词过宽且overflow=false时会停止。公开[textWrap-test](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/test/textWrap-test.js)保留原句、空格和换行；[textSplit-test](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/test/textSplit-test.js)含中文“里句。”及日文等输入，标点跟随前字符。[textSplit](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/src/textSplit.js)是自有字符range/分词规则，不是任意语言的通用grapheme合同。

[官方resizing-text输入](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/example/resizing-text.md)把同样200×100边界的两段英文分别resize与不resize；默认fontMin8、fontMax50。[TextBox.js L128–171](https://github.com/d3plus/d3plus-text/blob/33d4ff4129662a7915b9b4db3873c86613c8957b/src/TextBox.js#L128-L171)在装不下时递减字号，到下限后加ellipsis；关闭resize也可能省略。因此“图清爽、无溢出”不等于完整阅读。

Archify当前 [text-fit.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/shared/text-fit.mjs#L1-L48)已把字号拟合与最小可读宽度分开：node label/sublabel/tag保持单行，到minimum后由验证报告不可救的宽度；不是静默截字。[dataflow label-capacity](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/dataflow/label-capacity.mjs#L13-L40)只对被阻塞且未pin标签尝试完整两行，使用Intl.Segmenter有限候选。引入D3plus会增加测量/分词差异，并改变现有合同，尚无收益依据。

深读文件字节审计（通过官方固定raw取得，仅临时保存；未执行）：

| 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| d3-annotation src/Types-d3.js | 20073 | `bb634dedff82b24c250604cf8d4a23cff8453a9c92c33d418db5dd0c789a4bf7` |
| d3-annotation test/note.test.js | 1146 | `7bb568089025331bc4d7115ea65170b69a1fb24c828f0228f57fe330344a53c8` |
| d3plus-text src/textWrap.js | 5754 | `585b52543a917edf9488151ab35f5ce52526f5e6da7bfc6138e1c590739c78a6` |
| d3plus-text test/textSplit-test.js | 1169 | `e1247974797243d67d124d7b34cea92338643f0882e8b15af53d9e7584e27571` |
| d3plus-text example/resizing-text.md | 1176 | `697186be9c113f3480673b3f4007530b195b2681b80afbd36a650686be2d0b36` |

## 局部导出、单位与表达式：还有什么真实差异

**局部导出有边界差异，但没有新缺陷证据。** saveSvgAsPng的矩形crop、DOM子元素导出，和“从A到B的已验证路径/某方向可达集合”不是同一任务。10b4 [export.js L244–267](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/export.js#L244-L267)clone原SVG、清理瞬态状态、验证route/reach snapshot，保留viewBox，随后嵌入CSS/主题变量；[share-card L643–698](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/export.js#L643-L698)已有含方向、节点、链接与hop的摘要。任意矩形截取会遇到关系箭头被裁、标签失去端点、defs/clipPath/font归属；如果只有拍一张图的需求，现有根截图也可完成。不能把库有crop参数直接当产品收益。

**单位精度已经有具体保护。** [waterfall formatter L130–149](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/waterfall/render-waterfall.mjs#L130-L149)对微小数用有效数字、对duration附单位、share以wall为分母；[timeNumber](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/waterfall/render-waterfall.mjs#L195-L207)按tick/最短span分辨率处理绝对时刻。没有构造一个“显示为0”的故事来推荐新formatter。Insect的单位不相容解释有价值，但本轮没有相应Archify计算输入。

**公式逐步解释可以是内容，不能自称计算验证。** mathsteps的old/new/changeType可以启发“原式→带单位代入→结果/未知项”。Retained size已明确165+4=169、百分比分母与direct-dominator边；Recipe measured也已用来源表区分raw/derived/test effective输入。再加一页同义公式没有新增阅读动作。expr-eval的未知变量保留值得未来参数化预算任务参考，现在不扩求值/证明/单位系统。

## 与最新集成及在审工作的界限

本次官方API核对：[PR #1102](https://github.com/tt-a1i/archify/pull/1102)已于2026-10-25 09:19:29Z合入，mergeCommit就是10b4。它纳入节点explanation、drilldown/parentHref、fallback焦点、tall zoom、非拉丁导出名、IME等维护工作；这些已是基线，不能再作为未实现的小机制。已有实验分支则仍按各自固定软件/receipt理解，不因dev推进自动获得新版验证。

[PR #1103](https://github.com/tt-a1i/archify/pull/1103)本次读取仍OPEN/draft，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`。它在Code Analysis中引入Atlas模块/file/function度量视图及返回Classic findings源码证据；作者body中unique-shortest-label测试陈述不是本轮运行。这里不另提缩略代码地图、复杂度spikes、模块label压缩或一套source inspector，也不把函数度量图误称调用图。本轮没有独立审其整个实现，后续更新应重核状态。

## 可行动结论与停止条件

本轮不建议新建实验分支。若要继续，只保留两个可证伪入口：

1. **完整标签的失败反馈**：先找一份现存公开输入，在当前dev确实通过验证却损失原文或侵入邻居；固定完整label/字号下限/已有诊断，再看需修具体caller还是仅需改作者尺寸。没有这个触发，不引D3plus、不新建通用wrap系统、不把省略后的绿色receipt当成功。影响涉及共享文字合同，潜在成本中等，当前新增用户价值未证实。
2. **真正有任务的局部导出**：必须先有“现有route/reach/share-card不能保留所需问题范围”的真实公开图，定义端点、方向、被裁边和标题应如何处理。比较完整图与现有语义导出后，只有仍需手工重新标注才能回答同一问题，才做输入层/导出层最小试验；先不承诺矩形crop UI。影响到canonical export和状态清理，成本中等，当前不值得承担。

这两个是后续找证据的条件，不是已批准的功能或本轮实施候选。没有浏览器/读者比较、生产使用或效率数据；本轮仅新增本报告，没有改产品、hub索引或他人文件，也没有commit/push。
