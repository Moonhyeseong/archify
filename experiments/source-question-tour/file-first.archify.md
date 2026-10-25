# 源码卡：按文件核对同一组事实 {#source-file-control}

图节点中的源码卡使用构建时固定提交的摘录。它不会在浏览器里读取当前工作树。按 Escape 时，这个来源卡处理器只在焦点位于卡内时尝试把焦点交回 opener，然后隐藏卡片；不能概括为“总会返回”。

- Build 阶段从固定 Git 对象读文件，并把摘录、revision 和文件 digest 嵌入产物。[](source:build-excerpt)
- Read 阶段只读 prepared data；节点的 hover/focus 与来源引用共用 show。[](source:node-map)
- 来源卡预览最多显示 14 行；下面的代码块保留完整声明范围。[](source:card-preview)
- Escape 的条件由 card.contains(document.activeElement) 决定。[](source:escape-return)

@answer scope="Archify @ 82c7e0f · Source card handler · 既有功能的 authored 阅读对照"
@meta locale=zh-CN repo_url=https://github.com/tt-a1i/archify repo_revision=82c7e0f089a02a4d514714adf37dc2061682da5f
@source build-excerpt title="Build：固定 Git 摘录与文件 digest" path=archify/explainer/sources.mjs lines=244:263
@source card-init title="Read：来源卡与 prepared data" path=archify/explainer/reader.js lines=599:611
@source card-preview title="Read：14 行预览与固定提交标记" path=archify/explainer/reader.js lines=615:626
@source node-map title="Read：节点 hover/focus 映射" path=archify/explainer/reader.js lines=638:649
@source escape-return title="Read：Escape 条件返回与 Tab" path=archify/explainer/reader.js lines=654:668

## sources.mjs · 固定来源并截取行范围 {#sources-file}

@prose id=note-build
固定 Git 提交决定源码内容；读取后才截取声明范围。sha256/bytes 属于整份文件，不是 20 行摘录。浏览器只收到这些数据，不执行 git show。

@code id=code-build source=build-excerpt language=js

## reader.js · 来源卡初始化与内容 {#reader-content}

@prose id=note-map
preparedSources 提供来源，节点 ID 通过 nodeSources 找到来源 ID。mouseenter 与 focus 共用 show；这里不做新的代码查找，也不读取本机工作树。本例的五个 @code 来源都有已验证摘录，不能推及所有可选 citation。

@code id=code-init source=card-init language=js

@prose id=note-preview
卡片用 source.text 与起始行号组装预览，slice(0,14) 是硬上限。超出范围显示省略号；固定提交标记与 Open source 链接来自准备数据。完整声明范围仍可在下方 @code 阅读。

@code id=code-preview source=card-preview language=js

## reader.js · 节点事件映射 {#reader-events}

@code id=code-map source=node-map language=js

## reader.js · Escape 与 Tab {#reader-keys}

@prose id=note-escape
本 source-card handler 在 Escape 时先检查 card 是否含 activeElement，满足条件才调用 opener?.focus()，随后清除定时器并隐藏卡片。仅 hover 且焦点在卡外时，它不主动移焦。此结论不覆盖页面其他 Escape 处理器。

@code id=code-escape source=escape-return language=js

## 同一张 Build / Read 图 {#file-map}

@workflow id=source-path title="Build 固定数据，Read 消费数据"
| lane build | Build · 生成 HTML 时 |
| lane read | Read · 浏览器读产物时 |
| git | 读取固定提交 | backend | build | source:build-excerpt | block:note-build |
| bundle | 嵌入来源数据 | database | build | source:build-excerpt | block:note-build |
| init | 创建来源卡 | frontend | read | source:card-init | block:note-map |
| bind | 绑定节点来源 | backend | read | source:node-map | block:note-map |
| show | 展示来源卡 | frontend | read | source:card-preview | block:note-preview |
| esc | Escape 条件返回 | frontend | read | source:escape-return | block:note-escape |
| git > bundle | 摘录与摘要 |
| bundle > bind | 产物数据交接 |
| init > bind | 初始化后注册 |
| bind > show | hover / focus |
| show > esc | 按 Escape |
