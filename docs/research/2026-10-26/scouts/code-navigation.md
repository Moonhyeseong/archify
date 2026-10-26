# 代码导航：同符号强调与位置历史预览

2026-10-26，只读研究。**本轮零实施候选，不开分支或制作内容页。** 两个未覆盖来源有明确交互，但尚未证明比 Archify 现有阅读入口更有价值；新增历史或索引服务会先增加维护责任。没有把“存在类似插件”当用户需求，也没有用低 star 或项目数量替代价值判断。

## 范围与去重

先检索 2026-10-25 全部 scouts、研究中心 README 和 gallery/manifest.json（其中 policy 明确为49个已发布实验），再复读 source-navigation-smalltools、code-navigation-round5、interaction-smalltools。CodeTour、Glance、goto-preview、dropbar、Quicker、Harpoon、Code Hike、Flash、litee-calltree、navigator、KDAB/codebrowser 已覆盖，不再深读。Gallery 的 Finder highlights、Finder context、relation return 与源码问题导览同样计入重复边界；发布实验与当前 dev 能力分别判断。

本轮深读两项此前 owner/repo 未命中的项目；未按 stars 筛选。Sourcegraph 的 `repos/sourcegraph/sourcegraph/commits/HEAD` 本次 GitHub API 返回404，仅记录无法固定该入口，不推断项目整体已消失，不用旧材料补成第三项。

Archify 当前远端 dev 固定为 [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/tree/e837dc4cb83042d2b6c596e039692e25ec62c2da)，下面均为源码静态核查；没有启动浏览器或证明实际交互成功。

## 一、vim-illuminate：强调同一对象的其他出现位置

固定来源 [`RRethy/vim-illuminate@1cc33d347c574c3bd21a4852fc9ffed677c1c58c`](https://github.com/RRethy/vim-illuminate/tree/1cc33d347c574c3bd21a4852fc9ffed677c1c58c)，[完整 MIT LICENSE](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/LICENSE)。实际触发是编辑器光标落在一个名字上，希望辨认其他出现位置，并在 provider 提供信息时区分 read/write。

完整相关 consumer 链：

- [engine.lua](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/lua/illuminate/engine.lua) 的 `get_provider` 按配置顺序选择首个 ready provider，`refresh_references` 调用其请求/结果并交给 highlighter；不是混合多个 provider 后宣称完整引用集。
- [LSP provider](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/lua/illuminate/providers/lsp.lua) 实际请求 `textDocument/documentHighlight`，合并各 client 返回结果，保留 kind；这是当前文档强调范围，不是跨库全部 references 或运行调用证据。
- [regex provider](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/lua/illuminate/providers/regex.lua) 按当前 word 在整个 buffer 匹配，将每个结果标 Text；同字面词可能是不同符号，不能把 fallback 的输出标“同一变量”。
- [highlight.lua](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/lua/illuminate/highlight.lua) 将 Text/Read/Write 映射到不同 highlight group，并通过 extmark 显示。

Fixture 核查：固定树有完整 [foo.txt](https://github.com/RRethy/vim-illuminate/blob/1cc33d347c574c3bd21a4852fc9ffed677c1c58c/foo.txt)，31行反复的 hello，含 `hello world`、`hello hello`；但未找到测试目录或把这个文件消费为 oracle 的测试。它不能证明同名遮蔽、read/write、Unicode offset 或 AST/LSP 结果正确。因此没有把随仓文本或 README 动图当实证 fixture。

**Archify 剩余差异与成本。** 当前 [node-finder.js](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/node-finder.js) 已搜索节点身份、文字、context 和源码路径/行，选择结果时 reveal+focus；gallery 另有 Finder canvas matches 强调实验。当前 [reader.js setupSourceCards](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/archify/explainer/reader.js#L599-L668) 的摘录只有逐行内容，没有符号绑定。把同词全亮只是另一个文本搜索；要称同一符号、read/write 则需要作者字段或编译器证据、offset合同和验收数据，成本高于本轮证明的剩余问题。作者已有 focus 范围/源码卡实验也不能换名重做。

最小复现应先是一个**现有页面的真实定位失败**：同一摘录里同名局部与外层变量并存，读者要找出某次写入影响的读取。只有提供固定 parser/LSP 输出及完整源码，才可对照“文本匹配”和“同符号强调”；本轮没有这组输入与失败记录，不为补齐候选而合成宣传页。拒绝实现。

## 二、portal.nvim：先看位置历史，再决定跳哪一处

固定来源 [`cbochs/portal.nvim@77d9d53fec945bfa407d5fd7120f1b4f117450ed`](https://github.com/cbochs/portal.nvim/tree/77d9d53fec945bfa407d5fd7120f1b4f117450ed)，[完整 MIT LICENSE](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/LICENSE)。真实触发是在多个文件跳转后，不确定历史里的哪一项才是想回的位置；先并排/依次看小预览，用标签选择。

完整相关 consumer 链：

- [builtin/jumplist.lua](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/lua/portal/builtin/jumplist.lua) 读取 Neovim `getjumplist()`，以当前 index、方向、lookback、filter 生成 Content，保留与原 jumplist 的 distance。选择回调执行相应次数 Ctrl-O/Ctrl-I；不是自建语义调用历史。
- [search.lua](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/lua/portal/search.lua) 消费 iterator，可按 slots predicate 留第一个符合项；`portals` 生成带标签窗口，`select` 等待 label/escape。预览结果不自动成为正式跳转。
- [window.lua](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/lua/portal/window.lua) 用真实 buffer 创建非焦点浮窗、定位 cursor；`select` 才调 Content 的动作。显示的是当前 buffer，不能据此推导固定 Git revision 的历史摘录。

完整已提交 fixture/oracle：[search_spec.lua](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/tests/spec/portal/search_spec.lua)，33行。完整三个测试输入均为 `{1,2,3}`：无 slots 原样返回；谓词 `v>1` 返回 `{2}`；三个 predicates 等于1/5/3返回稀疏 `{[1]=1,[3]=3}`。这支持 search 选择语义的可检查契约，**不覆盖真实 jumplist/预览/键盘跳回**；同 SHA 的 [window_spec.lua](https://github.com/cbochs/portal.nvim/blob/77d9d53fec945bfa407d5fd7120f1b4f117450ed/tests/spec/portal/window_spec.lua) 只有空 describe，不能报成窗口测试通过。本轮未运行上游。

**Archify 剩余差异与成本。** 当前 [focus.js](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/focus.js) 已有关系预览/固定、explanation 返回、父图返回和 hash 定位；SourceCard 保留 opener，Escape 在卡内有焦点时返回。Gallery 又已有 relation-return。Portal 的潜在差异是“任意最近访问位置列表带快照预览”，而不是一次关系返回。但 Archify 的 authored 图、Explainer、源码卡与跨页面 drilldown 没有 Neovim 统一 jumplist；直接移植要新增历史的采集边界、状态对象、恢复语义和多种预览。尚无证据说明读者经常在现有返回方式中迷路，也没有证明这些成本值得。

最小复现应先记录一次真实链：节点A→关系→节点B→来源卡→另一正文/图，现有控件无法辨认目标历史位置；再用同一输入比较最小最近位置菜单能否正确返回，核对焦点、viewport、所选实体和来源revision，而非只看菜单出现。若普通返回链接足够，则不增加历史。当前没有这条失败链，不实施多位置历史框架或“历史导览”内容页。

## 结论与验证边界

两个方向都保留了“预览与正式跳转分开”的好合同，但该合同已经存在于 Archify。最强观察是 Portal 的历史候选预览；它仍不足以成为实施候选。新的源码解析、持久书签、跨图 breadcrumbs/history 或文本强调不应因为上游有功能就进入产品。

本次只读取 GitHub 当前commit/tree、固定源码、完整许可与上述完整小fixture；未运行上游、安装依赖、启动服务、浏览器、生成图片、创建 worktree 或修改产品。没有性能、理解收益、真实用户接受或交互成功结论。此报告为纯研究文字，按 CONTRIBUTING 的 prose 影响只核来源、能力与重复边界，不运行 renderer/full suite。之后若有现有页面的真实失败记录，再对具体行为选浏览器验收；没有更优实证就停止本方向。
