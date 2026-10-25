# source-only预览节点的键盘激活缺口

2026-10-25，固定dev [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。本报告先作源码排重，随后用相同完整输入和当前runtime重新生成页面、实际操作浏览器，修正静态推断。

**保留一个候选：已有source-only节点可以Tab到达、显示来源卡，也有焦点阴影，但Enter/Space没有完成鼠标点击已有的打开原图动作。** 修复只应复用现有按钮角色与键盘激活；不把Tab或来源卡说成新增能力，不增加样式、来源状态或新的Viewer。

## 固定输入与实际基线

输入来自已发布[CLI reading tour `1dff88d331679319442277a4ffc7cd3637bccee2`](https://github.com/tt-a1i/archify/tree/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour)，没有另造极端图。

| 证据 | 固定身份与范围 |
| --- | --- |
| [完整authored Markdown](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/cli-reading-tour.archify.md) | 6754B，SHA256 `5eec8481a740baec23a8898d6f4885315c5f327551aa156592d25afbf789275d`；10个nodeSources、没有nodeBlocks；11个固定源码引用 |
| [旧实验HTML](https://github.com/tt-a1i/archify/blob/1dff88d331679319442277a4ffc7cd3637bccee2/experiments/cli-reading-tour/output/tour.html) | 686303B，SHA256 `7814b929dd002ea2b1083575899cf0739ce83effd84488251cf85addb7bce190`；这是旧3f95基线，不用它冒充新dev结果 |
| 本轮重新生成的base/tour.html | dev10b4重新prepare native图、render外层；697086B，SHA256 `947c4a479f7a9cc4c36aec045411d5d9e8e6eca8be496ecfb274984ca13a5c5e`。原完整document及preparedSources来自固定输入，不运行Walkthrough服务 |
| 具体节点与来源 | `cli-paths`图的`response`，名字“HTTP发送快照”；`http-snapshot`指向[Walkthrough a373526c的index.ts L84–98](https://github.com/kyooosukedn/walkthrough/blob/a373526c92bd1d4c3953370b9a57f19e4fb15d08/packages/cli/src/index.ts#L84-L98) |

协调Agent在Ego Chromium、1440×1100、light/Clean实际观察：先hover确认同一固定源码卡；移走指针，从已有Explore按钮开始按真实Tab，经每个节点及来源链接，顺序到response。没有用`element.focus()`把预览节点强行设为焦点。作者的自动Chrome也独立观察到Tab可达。

| 基线动作 | 本轮实际结果 |
| --- | --- |
| Explore后连续Tab | 可到scan、来源链接、后继节点，最终到response；不是“节点无法Tab到达” |
| response聚焦 | 来源卡显示固定revision/path/range；`:focus-visible`为true，实际截图已有阴影反馈 |
| 辅助功能树 | response实际role为group，name为“聚焦HTTP发送快照，正常服务：内存响应”，focusable/focused均true；没有button action语义 |
| Enter | 没有打开任何dialog，焦点仍在response |
| Space | 没有打开dialog，页面scrollY从0到283.5；焦点仍在response |
| 鼠标hover | 同一来源卡正常出现；现有click owning handler仍负责打开native图，不把此路径当缺失 |

原始激活观察记录时间：2026-10-25T09:49:40.210Z，SHA256 `91181375384eea366b17542d5df94312a5d9eb2eaf8d6daf970729851b217604`；包含15步真实Tab轨迹、AX摘录和两个按键观察，保存在checkout外。三张基线截图均已实际查看，后续实验包绑定其原字节。这是派生摘要，不是raw receipt；没有实体辅助技术或人类验收。

## 修正静态推断

初审从缺少显式tabindex推断缺少Tab入口，这个推断已被真实浏览器反证并撤回。Chromium在此实际DOM和focus listener组合中仍将节点纳入导航，不能把“无属性”等同于“不可达”。最初自动断言只检查outline也过窄：native scoped CSS已经提供focus-visible阴影；不能为让断言通过增加重复样式。瞬时computed filter读数也不替代实际截图。

第一次root浏览器脚本使用了错误theme属性选择器，在操作前停止；读取实际DOM后改用data-theme-choice继续。这是驱动错误，不是产品失败。以上修正都保留，后续before/after只比较实际不同的角色、Enter/Space激活与返回行为。

## 最小owner与合同

[reader.js的setupSourceCards](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L638-L651)已经为source/block节点注册相同hover/focus来源卡；仅`if(blockId)`内部设置button语义和Enter/Space→既有click。source-only可以复用这一动作，`aria-describedby`仍只指真实paragraph。

[现有card Tab/Escape管理](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L654-L663)应保留；[现有native Viewer opener](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L376-L384)会因节点具有显式tabindex而在关闭后返回实际节点。这个与block节点一致的鼠标返回位置变化需要明确验证，不另造输入模式状态来维持旧Explore返回点。

| 范围 | 必要观察 |
| --- | --- |
| 真实source-only输入 | 基线Enter/Space不打开，候选打开native exact response；Space不滚页、只激活一次，关闭回该节点；AX角色/名称与动作一致 |
| 既有来源阅读 | 两侧均保留真实Tab到达、相同源码卡/固定引用、footer Tab/ShiftTab/Escape与正常后继顺序，不形成焦点循环 |
| block-only与mixed | 保留paragraph描述与Read this paragraph，mixed仍同一card拥有paragraph/source链接，未映射节点不扩成新控件 |
| 鼠标与静态图 | hover/click目标保持；明确关闭返回点一致性变化。图数据、原生子图、源码字节、CSS不因这个修复改变 |

用户已授权持续独立实验；协调Agent选择在`codex/lab-source-keyboard`实施上述最小范围。这里不声明人类维护者已审核、合入或验收。基线失败/候选通过、直接兼容测试和实际截图齐全前，不计入已发布实验。

## 查重与价值边界

- [#997](https://github.com/tt-a1i/archify/pull/997)已集成的paragraph复用覆盖blockId键盘激活；现有browser test保护这条路径，不覆盖source-only动作。
- [#1015固定head fe4f80d2](https://github.com/tt-a1i/archify/blob/fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8/archify/explainer/reader.js)的focus lines、居中、expand/copy改变源码卡内容操作；当次查询仍open/draft，实际source-only初始化未提供这一按键动作。不复制其功能。
- [#1103](https://github.com/tt-a1i/archify/pull/1103)在当次查询仍open/draft，head f0be206acbc90eb7c6c6b636030e3eb28963d284，目标labs/code-analysis；Atlas与Classic findings交接不是此Explainer handler。
- [Keyboard traversal d9308631](https://github.com/tt-a1i/archify/tree/d930863147cd6adfb5d4275f011c06caf4b24f92/experiments/keyboard-traversal)修QA的bounded traversal；本候选不改gate或预算，不用gate通过证明按钮激活已经等价。
- [Source question tour](https://github.com/tt-a1i/archify/tree/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour)六节点同时有nodeSources/nodeBlocks，已有按键路径不能代表source-only。

灵感仍沿既有[source-navigation调研](source-navigation-smalltools.md)中Sourcetrail/goto-preview/CodeTour的预览证据与跳转分工。本仓已经有这两种操作；价值是补齐同一节点的键盘激活，不引入parser/indexer或新的导览平台。正文citation始终能读取同一源码，不能宣称修复了整页源码不可访问。没有效率、理解收益、跨浏览器或读屏接受结论。
