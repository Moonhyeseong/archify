# 镜像层与闭包阅读：只保留 whiteout 的一个小问题

2026-10-27 只读研究，目录沿用持续审计的启动日期。当前用户已恢复持续探索；历史 25 日报告里的暂停不适用于本轮。**建议至多保留一个内容实验：为什么上层 tar 里已有新文件，随后出现的 opaque whiteout 不应把它删掉？** 不建议写镜像导入器、OCI unpacker、Nix closure analyzer 或新的 Viewer。

本轮读取固定上游源码、完整许可、测试构造和完整 tar fixture；用 Python 标准库在内存中列出两个已提交 tar 的成员，未提取到文件系统。没有运行或安装 dive、container-diff、Nix、Guix、Docker/Podman，没有拉取或启动镜像，没有运行上游测试，没有实施候选、commit、push 或发评论。唯一新增文件是本报告。

## 排重与产品边界

先核对 origin 的 50 余个 `codex/lab-*` 名称，研究中心固定为 [`60342aa9e40618aeb7c33bdb8d65889fea3a588e`](https://github.com/tt-a1i/archify/tree/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25)。新发现的 [`lab-relation-search@e87a858d220c25c97aee4b5920cf59ab77723b41`](https://github.com/tt-a1i/archify/tree/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search) 是搜索已有关系并进入原 Pin 的候选，不重做搜索/关系导航。

读取 retained-size、byte-views、relation-search 的实验正文，检索历史 scouts 的 container-diff/dive/whiteout/Nix store/镜像层关键词。只发现普通语言闭包、正则闭包等无关命中，没有找到同一镜像 whiteout 阅读题。当前 27 日 audit 中相关标题是 #410 组件容器层级、#359 layer-band 布局、#1001 相机容器视口，均与镜像 filesystem changeset 不同。标题检索不能证明穷尽所有 issue 正文；现阶段没有据此创建产品 PR。

具体差异：

- **retained-size** 已解释支配子树与自身/retained 字节，不能又用 Nix 共享闭包做一个近似求和提醒。
- **byte-views** 已解释相同物理 bits 的多种字段解释；whiteout 问题是跨层路径可见性和标记作用范围，不是存储视图重复计数。
- **dependency-map** 是报告有向依赖及视图外账目；whiteout 既不是 import edge，也不应被叫成依赖分析。
- **来源映射实验**解决位置/生成来源身份。此处同一路径在不同 layer 是不同的归档成员，不可按 basename 去重，最终可见树又是另一个投影。

PRODUCT.md 的便携、精确 authored 关系和渐进阅读允许一页固定解释；它不授权一个长期同步镜像、计算磁盘回收收益或扫描真实机器的系统。

## 新核一手来源与完整许可

下面 SHA 都来自本轮官方 GitHub 默认分支 commit 查询。许可证读取完整正文，不以 API 的 license 名称替代条款。固定源码状态与本轮运行证据严格分开。

| 来源 / 固定 SHA | 许可与实际读取材料 | 用户工作、 owning consumer 与取舍 |
| --- | --- | --- |
| [wagoodman/dive](https://github.com/wagoodman/dive/tree/d6c691947f8fda635c952a17ee3b7555379d58f0) · `d6c691947f8fda635c952a17ee3b7555379d58f0`，未归档 | [MIT LICENSE](https://github.com/wagoodman/dive/blob/d6c691947f8fda635c952a17ee3b7555379d58f0/LICENSE)，Alex Goodman；完整 file_tree.go/file_tree_test.go，定向读 file_node.go 的 AddChild/IsWhiteout/Path；完整多层 Dockerfile。 | 阅读每层添加/修改/删除及累计文件树。file_tree.go 的 Stack 消费上层节点，普通 whiteout 走 RemovePath；file_node.go 的 Path 去掉 leaf `.wh.` 前缀。**当前 filetree 明确忽略 `.wh..wh..` 标记**，TestStack 还断言 opaque 标记不加入节点；不能拿这段内部模型当完整 OCI opaque 行为的 oracle，也不据此未经运行指控整个 dive 所有路径有 bug。Dockerfile 的 rm/overwrite 是自然的已提交测试构造，但不是本轮镜像构建输出。 |
| [GoogleContainerTools/container-diff](https://github.com/GoogleContainerTools/container-diff/tree/b90c99c638e3ab0185d264c448ca22d349d93972) · `b90c99c638e3ab0185d264c448ca22d349d93972`，已归档 | [Apache-2.0 LICENSE](https://github.com/GoogleContainerTools/container-diff/blob/b90c99c638e3ab0185d264c448ca22d349d93972/LICENSE)；完整 util tar/image test wrappers、定向读 pkg/util/image_utils.go 与 tar_utils.go；完整两个 la-croix tar，读取 layer-analysis golden 仅开头及完整下载字节，未深读全部大 golden。 | 区分 image filesystem 与 individual layer。GetFileSystemForImage 先消费 go-containerregistry 的 mutate.Extract，再普通 unpackTar；不能只看 unpackTar 没有 `.wh.` 分支就说它实现完整合并，或从完整图层分析 JSON 猜最终目录。固定 tar 可说明显式删除，但没有 opaque+同层新文件反例；大 golden 与旧远程镜像来源不适合作为最小页面。 |
| [utdemir/nix-tree](https://github.com/utdemir/nix-tree/tree/4baa2a0f808bbb229a1ef4a35882d763a2b6add4) · `4baa2a0f808bbb229a1ef4a35882d763a2b6add4`，未归档 | [BSD-3-Clause LICENSE](https://github.com/utdemir/nix-tree/blob/4baa2a0f808bbb229a1ef4a35882d763a2b6add4/LICENSE)，Utku Demir；完整 PathStats.hs、InvertedIndex.hs。 | PathStats 用 Map union 去重引用计算 totalSize；addedSize 是当前根集合总量减去排除给定 path 后可达集合总量。这个数依赖选定 root graph，不等于整个机器删路径可释放的磁盘字节。维护 Nix Store 查询、GC roots、nar size 与磁盘共享口径成本高；同一共享/retained 说明已被旧实验覆盖，**不做第二候选**。搜索索引也不应重复 relation-search。 |
| [opencontainers/image-spec](https://github.com/opencontainers/image-spec/tree/4feed4a6674e59d301b9294f187ac46acb2de99f) · `4feed4a6674e59d301b9294f187ac46acb2de99f`，未归档 | [Apache-2.0 LICENSE](https://github.com/opencontainers/image-spec/blob/4feed4a6674e59d301b9294f187ac46acb2de99f/LICENSE)，与上述 container-diff 根 LICENSE 字节一致；读取完整 layer.md，重点核对 228–345。 | 规范明确 layers 是 changesets，应 apply 而非简单 untar。whiteout 只影响下层；opaque 隐藏目录中所有下层子项；同层新增内容不能被同层标记隐藏。最后一个具体例还明确 marker 的 tar 成员顺序不改变这个范围。**选它作为行为定义**，工具 UI 只是问题发现来源。 |

Guix 未深读，本轮不把它列为第五个核验来源。未复制上述工具代码进 Archify；如后续复制规范段落、原件或 fixture，保留对应完整许可证和归属，不能给历史第三方数据重新标原创 Apache-2.0。

## 完整自然输入：小归档可核实，但不足以冒称 OCI 运行

实际内存读取的两个完整上游文件来自同一个 container-diff 固定 SHA：

| 原路径 | bytes / SHA-256 | 全部成员（目录也保留） |
| --- | --- | --- |
| [util/testTars/la-croix2.tar](https://github.com/GoogleContainerTools/container-diff/blob/b90c99c638e3ab0185d264c448ca22d349d93972/util/testTars/la-croix2.tar) | 8704 / `f1d54a667e9c5354f259316838c4119493b8636ac3ee31726c6cc7a455c4ab30` | passionfruit.txt、lime.txt、nest/、peach-pear.txt、nest/f1.txt |
| [util/testTars/la-croix-wh.tar](https://github.com/GoogleContainerTools/container-diff/blob/b90c99c638e3ab0185d264c448ca22d349d93972/util/testTars/la-croix-wh.tar) | 7168 / `135f4c6ff81325a12757b7a61d6a741db17923836a66895a6ae64062dd5bd609` | nest2/、.wh.lime.txt、.wh.nest、nest2/hello |

所有 regular file payload 都是 0 B；tar 长度不是有效文件载荷求和。按 OCI 规则，把第二份当后层时，lime.txt 与 nest/f1.txt 应不可见，标记本身也不可见，新增 nest2/hello 可见；这是**规范推导**，本轮没有 mount/unpack 得到真实 merged filesystem。仓库还有 `la-croix-wh-actual/` 目录，但没有找到本轮读取的现行小 test wrapper 把这两份 tar 明确联为同一次 assertion，故不能给这个组合编造「官方实跑 expected」或「本轮 container-diff 输出」。

这两个归档都没有 opaque 标记，也没有非零 payload，不能据此宣称删文件仍保留多少 MB、更小镜像或减少下载；不把它们包装成生产工作负载。为避免用一大份镜像或追踪旧工具测试遗产，**推荐的唯一实验采用原创固定输入**，上面原件仅留作发现/对照来源。

## 唯一候选：同层新文件为什么不被 opaque 标记隐藏？

读者工作：审阅层列表时分清「归档里有什么」与「合并后哪些路径可见」，尤其避免将 tar 成员顺序误读为逐条全局 `rm`。这是一个可以由小图和表回答的问题；不是替代 dive 或构造容器工具。

原创固定输入可只保留两层、六个 regular entries（目录显式记录，不计为 regular 文件）：

| 层 | tar 中声明的成员 | 规范解释 |
| --- | --- | --- |
| lower | app/config.txt、app/cache/old.txt、app/keep.txt，各一份固定的无秘密短文本 | 三个下层资源；不读取用户机器 |
| upper | app/.wh.config.txt（空）、app/cache/new.txt（短文本）、app/cache/.wh..wh..opq（空）；故意使 new 在 opaque 之前 | config 的显式删除标记；cache 的 opaque 标记只遮蔽 lower children；new 属于 upper，仍应保留 |
| authored final projection | app/keep.txt 取 lower，app/cache/new.txt 取 upper；config、cache/old 与两个标记不可见 | 这是由固定规范逐项核对的可见性投影，不是本轮 Docker/overlayfs 采集 |

最小实施只有一个独立实验目录：原创 Python stdlib 生成两个确定性小 tar，固定成员、mtime/uid/gid/模式和 payload；观察脚本只列成员、摘要与顺序，不解压、不接收任意用户路径、不调用 Docker。一个手写原生 Architecture spec 直接被同一 Explainer 引用，区分 lower archive、upper archive、spec-derived visible projection；边标明「隐藏下层目标」或「保留到可见投影」，不用 Workflow 动画暗示实际执行。表格同时保留逐项账目，不能只画两个删除箭头却漏掉 same-layer survivor。

**证据标注是接受条件**：实际测量只能称 tar bytes、成员类型/顺序/payload digest；final projection 是规范推导。如果协调者要求「实测最终挂载文件系统」，当前禁止 Docker/上游运行且没有独立 apply 消费者的范围便不满足，应暂缓候选，而不是偷偷写一个完整 unpacker 再自证。一个已知输入的小 set 投影最多是模型演示，不升级成 OCI 兼容验证。

最低复核覆盖：固定原始 tar digest 与完整成员清单、whiteout payload 为零、显式删除与 opaque 范围分别正确、new 在 marker 前后两种成员顺序的**规范推导**相同、两视图共用一个 spec、静态产物与公开摘要/图片绑定。无需全仓 suite、格式 fuzzing 或复制安全 extraction 测试矩阵；没有一般 extraction 入口就没有理由构造另一个沙箱平台。

成本低于通用 adapter，但高于纯文案：主要成本是两种成员身份与可见性语义的说明、可复现原始 tar，以及图表不误导。只做这一页，不扩 image manifest/config/digest chain、压缩格式、hardlink/symlink、xattr、Windows layers 或 registry。若要覆盖这些边界，维护责任会迅速超出这道阅读题，停止扩展。

拒绝/停止条件：不能在默认阅读尺度区分两个层和 final projection；必须用 runtime 新能力才能展示；仍把推导写作实测；或最终三行表已经充分回答问题而原生图仅添装饰。尚无读者效率、人类接受、生产用途或容器运行验证，本报告没有这些结论。

## 关键原件指纹

| 来源文件 | bytes | SHA-256 |
| --- | ---: | --- |
| dive LICENSE | 1069 | `080b4830ca506c8b460b08ba8319951d718a43e5d249bc8523c1c5eeccb25329` |
| dive dive/filetree/file_tree.go | 11976 | `0c0bc3a5f62a2813593983871a7b11c04d918a4a88790c124781809e722bf22c` |
| dive dive/filetree/file_tree_test.go | 21630 | `194686ac8290d8adc74497ddde5ee4d24f8c3497f951c50698a742cdf5fa420a` |
| dive multi-layer Dockerfile | 550 | `583c6c8be9ecb86267e1bfc95f2407b3171b3d542bb785b3d43108f46ff19d29` |
| container-diff LICENSE / image-spec LICENSE（相同 bytes） | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| container-diff pkg/util/image_utils.go | 9082 | `66a02388f37d1e27791ae59f0039267168f4dc187c3cddec64db87798630f072` |
| nix-tree LICENSE | 1455 | `bfcd68e3d434ddda659e715d89833734dd3e59ce34755f370f4aa544fb266b95` |
| nix-tree src/NixTree/PathStats.hs | 6632 | `b72f793de2231459189088a97e33c49743b489f3ab446414f4393c66ee00270c` |
| OCI layer.md | 15348 | `e4bcea539746c5a63d707d9b7d1dab55990a7d2dc33a2d181d87b7636aa8092f` |

原件本轮从固定 raw URL 读入内存，未作为新 fixture vendoring，也没有生成实验页面。AI 协助：Codex / gpt-6.1-sol 做来源读取、固定 tar 成员观察、排重和写作；内容实验是否实施由协调任务选择。
