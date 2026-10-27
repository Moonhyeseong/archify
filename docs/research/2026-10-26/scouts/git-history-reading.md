# Git bisect 的候选集合：阅读研究

2026-10-27，只读源码和已有研究；未运行上游、创建图、安装或修改 Git 历史。建议**保留一个低成本、条件性的内容实验**，不建议新 Git 导入器或模拟器。问题是：一次 bisect 因不可测试提交而结束时，哪些提交仍可能是首次出现目标性质的位置，哪些是已知 good / bad，为什么不能指定唯一 culprit？现有 Git 输出已直接列出候选，图必须证明有额外价值，否则停在文本。

## 排重

- 上轮 [Git 图阅读](https://github.com/tt-a1i/archify/blob/714c1d3ca691499684a1e89842e3188f85bdabea/docs/research/2026-10-25/scouts/git-graph-reading-round6.md) 已深入 git-sim、git2graph、visigit：ordered parents、绘图拐点、折叠链及 rebase origin 与 parent 的区别。再画分叉或重做压缩视图是重复；本文侧重 **bisect 观测状态和候选集合**，不推断拓扑之外的关系。
- [change-coupling](https://github.com/tt-a1i/archify/tree/44dc5cbc324f3aaeff2b8de582412566f1f8b8ab/experiments/change-coupling) 是 Code Maat 共变计数，不是属性测试和候选排除；现有 [Architecture Delta](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/archify/delta/architecture-delta.mjs) 和 [Git refs 快照比较 #1049](https://github.com/tt-a1i/archify/pull/1049) 比较架构输入，不是提交的 bisect。`task-review-map` 映射声明与变更 hunk，不能证明某提交首次引入性质。
- 检查本批 [50 项索引](../audit/prior-experiments-20261027.json)、[远端分支快照](../audit/remote-branches-round3.tsv)、当前 scout/README 和上轮研究树。GitHub issues/PR 搜索 `bisect` 得到宽泛非相关结果；关键词有限，不能断言语义穷举或其他未索引工作不存在。本批 operation-order 是并发操作约束，不是 Git 版本测试。

## 固定来源与事实

1. Git 官方 [v2.51.0 源码 c44beea485f0f2feaf460e2ac87fdd5608d63cf0](https://github.com/git/git/tree/c44beea485f0f2feaf460e2ac87fdd5608d63cf0)，[bisect 文档](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/Documentation/git-bisect.adoc#L264-L296)明确 skip 邻近目标可能使首次 bad 无法确定；[run 退出码](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/Documentation/git-bisect.adoc#L329-L343)中 125 代表不可测试，不是测试通过或性质失败；[first-parent](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/Documentation/git-bisect.adoc#L375-L378) 改变 merge 上搜索范围。许可看完整 [COPYING](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/COPYING)，Git 项目 GPL-2.0，文件也可能有各自声明；不复制代码或带入依赖。
2. Git [porcelain 测试](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/t/t6030-bisect-porcelain.sh#L252-L293) 的已提交断言：HASH1 good、HASH4 bad，跳过 HASH3 和 HASH2 时 exit 2，输出包含 HASH2、HASH3、HASH4 而不含 HASH1；另一个测试只跳过 HASH3、标 HASH2 good 时，候选为 HASH3、HASH4。它也有 skip 后仍能找到唯一结果的测试；**skip 本身不必然导致歧义**。这是静态阅读上游断言，不是本轮执行结果。[日志预期](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/t/t6030-bisect-porcelain.sh#L984-L1001) 亦逐个记录 possible first bad。
3. [git-branchless@f37244cb30c481ec9bec44b43cdcab12f6284137](https://github.com/arxanas/git-branchless/tree/f37244cb30c481ec9bec44b43cdcab12f6284137) 的 [README](https://github.com/arxanas/git-branchless/blob/f37244cb30c481ec9bec44b43cdcab12f6284137/README.md#L129-L142) 描述 smartlog 展示 commit history 和被 rewrite 后需处理的后代；这是上游对工具的说明，不是此次 UI 或运行观察，也不证明其处理 bisect 候选。完整 [MIT](https://github.com/arxanas/git-branchless/blob/f37244cb30c481ec9bec44b43cdcab12f6284137/LICENSE-MIT) 与 [Apache-2.0](https://github.com/arxanas/git-branchless/blob/f37244cb30c481ec9bec44b43cdcab12f6284137/LICENSE-APACHE) 随仓库提供；不移植工具。git-sim 已被上轮固定源码研究，此处不再冒称新发现。

## 唯一候选与判定

做原创、可重建的四提交线性临时仓库，固定 Git 版本、提交身份/时间和文件内容；运行时用 Git 实际记录 parents、完整 `git bisect log`、终止 stdout/stderr/退出码、命令及 commit ID。按 Git 官方两候选测试的状态，在已知 good 后、已知 bad 前标记一个 skip，记录实际结果并与源码预期核对；若实际输出或版本不同，以实测为准，不预填。另以无歧义例对照，防止将 skip 一律画成候选。仅在临时仓库执行、明确 reset；不可操作用户仓库。记录原始日志和 hash，按同一数据独立制作两种阅读材料：

- **文本基线**：原始完整 bisect log 和终止输出，加同样的简短状态说明与阅读问题；保留命令、候选原文及退出码，不删减 Git 已有解释。可附同一完整 parents 列表，以保证两臂证据相同。
- **图版**：现有 Architecture/Explainer 加四个提交、明确 child→parent 和 good / skipped / bad 标签；候选集合明确来自终止结果，区分观测标记和候选推论。保留相同原文和来源链接，静态图自足；不将 skip 标成 bad、将候选排序当概率、用箭头暗示缺陷因果，亦不将已知 bad 自动称为首次 bad。

在同一题与数据下问读者：候选集合是什么？哪项实测 good/bad、哪项不可测试？为何无法唯一确定？若补测何处可能缩小集合？记录两臂首稿、时间、答案及错误，并交替顺序；样本不足时只报告观察，不能声称普遍提效。独立复核图中每个提交、parent、标记和候选与日志一致，渲染/截图及可访问性另记，失败不覆盖。**否决门槛**：若图版对这些问题没有更清楚的可观察优势，或误读/作者成本高于文本，或语义不能保持，停止，不加入产品；仅凭截图漂亮不算成功。没有自然仓库证据也可做此原创 fixture，但不能据此声称实际使用收益。

价值是帮助分享不确定的定位结论；成本为一次可复现的 Git 会话、两份同证据材料及阅读检查。Git 已直接列出集合，四节点线性图很可能只是重复文本，因此此候选优先级低，价值尚未证明。范围不包含 bisect 算法、执行器、任意 merge DAG、自动读取用户仓库或 bug 根因推断。搜索依赖所选边界、路径和测试性质及其在历史上的行为；单次结果不证明真实因果或所有版本行为单调。此文是研究与方案，非实现、验收或上游测试报告。
