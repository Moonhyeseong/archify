# 离线实验图片索引

直接打开 [index.html](index.html)。页面收录固定 hub 快照中的已推送实验与原始 PNG，可按产品交互、离线适配、内容示例分组筛选并用关键词搜索。数量由实际记录推导，显示于页面与 manifest；Relation return 清晰单列为暂缓，不计入已发布数量。

原 PNG bytes 用 data URI 嵌入，没有下载、编辑、缩图重绘、远程字体、分析或自动网络请求。卡片预览仅以 CSS 裁切并明确标注；点击后可看完整图，切换原始尺寸，或主动打开固定 GitHub 提交中的原图。GitHub 说明同时提供固定提交链接与分支链接。页面不加载别的实验 HTML，也不执行其代码。

每项卡片的价值与验证限制来自固定 hub 表格，原实验 README 用于核对来源与图片语义。[manifest.json](manifest.json) 记录 repo-relative path、完整 commit、Git blob、SHA-256、PNG 原始尺寸与字节数；[selection.json](selection.json) 固定所选图片和分组。没有把 synthetic 改称实测，也没有统一绿色状态、评分、CI 或用户验收声明。

视觉词汇取自本仓 `website/src/styles/site.css`、`index.css` 和 `gallery.css`：浅暖灰底、白色内容面、橙色强调、细边框与系统字体。读取的固定版本及文件摘要在 manifest 中；没有引入网站依赖或动画。

## 复现与更新

仅使用 Python 标准库与现有 Git/Node。参数 `--worktree-root` 是本地输入，指向包含 `lab-*/archify` 的父目录；其实际值不会写入产物。

```sh
python3 docs/research/2026-10-25/gallery/build.py --worktree-root '<worktree-parent>'
python3 docs/research/2026-10-25/gallery/verify.py --node '<node-executable>'
```

构建读取 selection 中固定 hub commit 的表格，逐项要求当前 HEAD、origin 跟踪 revision 与固定提交相同，并核对实际 README/PNG 文件字节与该 Git 对象一致。它不 checkout、fetch、安装或运行其他 worktree 的脚本。HTML 由 [template.html](template.html) 生成；应打开 `index.html`，而非模板。

更新时先明确修改 selection 的固定 hub/实验提交和图片路径，再重新构建。来源仍须是 hub 已发布项。标题、总数、分组按钮、筛选结果与静态核验均从 selection/实际记录计算，不需要在模板里同步维护数字。构建不自动扫描、挑选最新图片，也不把暂缓项加进成功列表。一次构建覆盖本目录的派生 index/manifest；源图片不变。

## 验证边界

[verification.json](verification.json) 是静态字节与语法核验：卡片/PNG/实际分组和按钮数量一致、每张嵌入 PNG 与 manifest SHA 一致、固定提交和分支链接存在、没有外部资源引用、内联 JS 语法有效。构建与静态核验没有打开浏览器，也不证明布局、dialog 焦点、触屏、辅助技术或真人接受；协调 Agent 的实际浏览器检查应另行记录。

各实验自己的失败与未运行阶段保留在卡片及固定来源中。例如 Task review map 的 ZIP unresolved 和键盘遍历失败，不会因为有截图而变为通过。

## 当前 34 版的静态绑定

本次固定 hub 为 `f3e91a0f3d0461a06e09841fc581b6aeaaa08453`：34 项 / 34 张原始 PNG，实际分组为 11 / 15 / 8。新增 Byte views，使用完整 97B 官方生成 fixture 与固定字节观察解释 IHDR 的 25B 物理字段及 type 内重叠 bit 解释；没有运行 fq、CRC 重算或解压，也不是实际用户工作负载。

State 主图更新为官方机器 fixture 的实际 getDAG 导出：构造机器但没有执行事件或回调，矩阵只覆盖观察到的 toggle 声明。Recipe 主图更新为官方 test 有效输入的真实 Just dump：a 在空主体 b 前、c 在后；未执行 recipe，自然完整示例仍因 assignments 拒绝。其公开 dump 是仅移除来源位置的派生副本，不冒充原始 export。两项历史 synthetic 证据仍由各分支保留；其余 31 张既有主图的 PNG bytes 与上一版逐 SHA/Git blob 相同。

当前 `index.html` SHA-256：`71465bb0454f266a0368c3cebd442995930fdb2c909ecb78c2af9902666176f1`；manifest SHA-256：`ffb82caaff39d688cf7150699c5c3701833fd33061a58f9a17b80a5a40848dde`。34 项固定 HEAD、origin 跟踪、README 与 PNG Git blob/原字节全部核对；卡片、过滤按钮和分组数量一致，嵌图解码 SHA、固定链接与 JS 语法核验通过。HTML 为 10,354,355 bytes，34 张原 PNG 共 7,699,466 bytes，没有远程资源引用。

协调 Agent 已在当前 HTML/manifest hash 实际检查 1440×1100 与 390×844 浅/深色、34/11/15/8 筛选、State/Recipe/Byte 各一个关键词结果、三项完整图片的原始尺寸元数据与固定来源、三次 Esc 返回 opener、空结果与清空后查询框焦点。四个视口/主题状态的页面内容宽均等于视口宽，没有页面横向溢出。七张新截图均由协调 Agent 实际查看；[browser-evidence.json](browser-evidence.json) 记录 19 项观测与原始记录摘要、当前 HTML/manifest 和七张 PNG 的 SHA/bytes/尺寸绑定。独立 Agent 隔离重建三份静态派生产物逐字一致。

本轮没有重测原始尺寸 End 滚动与精细 modal Tab 遍历；历史观测仍只属于各自固定版本。这里只检查图片浏览页，没有执行各实验 HTML；外链只核对未打开。这些是 Chromium 鼠标/键盘与 CSS 视口模拟证据，不代表实体触屏、读屏器或人类验收。实验各自的未运行阶段与拒绝边界不因浏览页检查而改变。

![34项桌面浏览页](screenshots/desktop-light.png)

![Byte views完整原图弹窗](screenshots/byte-views-dialog.png)

![390px浏览页](screenshots/mobile-dark.png)

## 历史 33 版浏览器检查

固定 [33 版提交 `16739d87`](https://github.com/tt-a1i/archify/tree/16739d87811896012fe1827331f322270d8bcfbd/docs/research/2026-10-25/gallery) 的 `index.html` SHA-256 为 `d37bd42fa244011d841877c2bfcf70ff82f7688ac0f758b634e7ecbc5a6f1569`，manifest 为 `55892d8c3b2296d93663f85d6acde33d1a354dabafd7514c7dbb513e6c7eb55e`。协调 Agent 当时实际检查 1440×1100 与 390×844 浅/深色、33/11/15/7 筛选、四个新增项与 DBML 的关键词定位、DBML/Clipboard 完整原图及固定来源、Esc 返回 opener、空结果与清空；390px 没有页面横向溢出。七张图实际查看，独立 Agent 核对摘要与原始观测、图片字节及绑定；隔离重建三份派生产物逐字一致。

[该版浏览器摘要](https://github.com/tt-a1i/archify/blob/16739d87811896012fe1827331f322270d8bcfbd/docs/research/2026-10-25/gallery/browser-evidence.json) · [桌面图片](https://github.com/tt-a1i/archify/blob/16739d87811896012fe1827331f322270d8bcfbd/docs/research/2026-10-25/gallery/screenshots/desktop-light.png) · [复制恢复完整图](https://github.com/tt-a1i/archify/blob/16739d87811896012fe1827331f322270d8bcfbd/docs/research/2026-10-25/gallery/screenshots/clipboard-dialog.png) · [390px 图片](https://github.com/tt-a1i/archify/blob/16739d87811896012fe1827331f322270d8bcfbd/docs/research/2026-10-25/gallery/screenshots/mobile-dark.png)。这轮没有重复原始尺寸 End 滚动和详细 modal Tab 检查，也不代表实体触屏、读屏器或人类验收。

## 历史 29 版浏览器检查

固定 [29 版提交 `a94bd25b`](https://github.com/tt-a1i/archify/tree/a94bd25bdcf33c386f0e920142c61309e1e8b499/docs/research/2026-10-25/gallery) 的 `index.html` SHA-256 为 `7fc4a81cc0d06b31f74588813d784f7361e2e8b4d5e8863793a4c83aba37e959`。当时实际检查了 1440×1100 与 390×844 浅深色、29/9/15/5 数量、两个新项关键词定位、完整图与固定来源、Esc 返回 opener、空结果与清空；390px 无页面横向溢出。六张图已由协调 Agent 查看，独立 Agent 重建并核对固定来源与字节。

[该版浏览器摘要](https://github.com/tt-a1i/archify/blob/a94bd25bdcf33c386f0e920142c61309e1e8b499/docs/research/2026-10-25/gallery/browser-evidence.json) · [桌面图片](https://github.com/tt-a1i/archify/blob/a94bd25bdcf33c386f0e920142c61309e1e8b499/docs/research/2026-10-25/gallery/screenshots/desktop-light.png) · [键盘实验搜索图](https://github.com/tt-a1i/archify/blob/a94bd25bdcf33c386f0e920142c61309e1e8b499/docs/research/2026-10-25/gallery/screenshots/keyboard-result.png) · [390px 图片](https://github.com/tt-a1i/archify/blob/a94bd25bdcf33c386f0e920142c61309e1e8b499/docs/research/2026-10-25/gallery/screenshots/mobile-dark.png)。这些历史观测没有验证实体触屏、读屏器或人类接受，原始尺寸滚动和 native modal 更细 Tab 观测也未在该轮重测。

## 历史 27 版浏览器检查

固定 [27 版提交 `50cc320a`](https://github.com/tt-a1i/archify/tree/50cc320adffef212f046f065eb2e9e702610a27d/docs/research/2026-10-25/gallery) 的 `index.html`（SHA-256 `731877a954e904d3c73a9c7ae754bc75a810b174cd792e8c4fed87774d1f48eb`）曾实际检查 1440×1100 与 390×844、浅/深色、7/15/5 分组、关键词交集、空结果与清空、完整图片、原始尺寸和 Esc 后焦点返回。390px 页面没有横向溢出；长图原始尺寸滚动区可用键盘 End 到达底部。原生 modal 的 Tab 可进入浏览器 chrome，再回到弹窗首控件；没有误称自定义闭环焦点陷阱。这些观测只属于该固定版本，不自动成为刷新后页面的验收。

[历史浏览器摘要与截图绑定](https://github.com/tt-a1i/archify/blob/50cc320adffef212f046f065eb2e9e702610a27d/docs/research/2026-10-25/gallery/browser-evidence.json) 与 builder 静态核验分开；这些是 Chromium 鼠标/键盘和视口模拟观测，未验证实体触屏、读屏器或人类接受。未打开外链或执行各实验产物代码。当时另一位 Agent 独立核对固定 Git 对象/图片字节，并重建出逐字相同的 index 与 manifest。

[历史桌面图片](https://github.com/tt-a1i/archify/blob/50cc320adffef212f046f065eb2e9e702610a27d/docs/research/2026-10-25/gallery/screenshots/desktop-light.png) · [历史 390px 图片](https://github.com/tt-a1i/archify/blob/50cc320adffef212f046f065eb2e9e702610a27d/docs/research/2026-10-25/gallery/screenshots/mobile-dark.png)。
