# Git历史、架构治理与测试覆盖：10个开源项目调研

调研日期：2026-10-25。只读研究；未安装这些工具、未执行分析器、未创建产品实现、未推送或发表评论。按 `archify-review` 的价值、成本、影响评估。已读本工作区 `CONTRIBUTING.md`。所有仓库使用认证 GitHub API 核验当前默认分支HEAD、README与许可元数据；重点候选另读具体源码。下面是可复核的固定版本，不把README演示等同于本次验收。

**建议先做 Code Maat CSV → 共变关系解释图，次选已有 LCOV → 模块覆盖解释页。规则违规见证图保留为第三项。** 三者均以外部生成的结构化事实为输入，复用Archify图/解释页与交付检查，避免新建索引、托管分析、持续监控平台。

## 已有工作边界

- [#1044：read Architecture snapshots from two Git refs](https://github.com/tt-a1i/archify/issues/1044) 当前是 open issue；其提案从两个本地ref读取同一路径的已提交Architecture JSON，记录resolved commits并复用Delta。明确不从源代码自动推断架构。研究实验不应再写Git ref快照比较包装器，也不将提交共变画成Architecture Delta。
- [#998：Code analysis Main branch](https://github.com/tt-a1i/archify/pull/998) 当前open，正文只有Claude artifact和roadmap指针，本次未读取其外链内容或完整实现。不能断言所有代码分析已完成。需要避免在该PR之外另做通用源码解析、稳定组件身份、自动影响分析平台；实验仅消费显式CSV/覆盖报告/失败见证。
- 仓库已有 `repository-authoring.md`、`authoring-contract.md` 的源码证据边界，以及 `explainer-authoring.md` 的解释页/图表能力。优先输出这些既有输入合同接受的内容；不能为展示热度而临时扩展Architecture schema。

## 固定版本与实际能力

“许可”主要为GitHub识别结果及项目声明，供引入成本筛选；这里不复制上游实现代码，也不将许可标签当作完整依赖清单。

| 项目/固定源码 | HEAD commit | 提交日期UTC | 许可 | 实际能力 | 与Archify结合及边界 |
| --- | --- | --- | --- | --- | --- |
| [acaudwell/Gource](https://github.com/acaudwell/Gource/tree/70db547c6b8b40745fb41a8db7e8d28897be1a9e) | `70db547c6b8b40745fb41a8db7e8d28897be1a9e` | 2026-03-06 | GPL-3.0 | 提交活动的目录树动画；支持Git与自定义事件日志，PPM帧输出 | 目录是树枝、文件是叶；作者在提交时出现。OpenGL原生渲染需求使其不适合作为Archify浏览器依赖。可借鉴事件与快照分离，不复制动画引擎。 |
| [adamtornhill/code-maat](https://github.com/adamtornhill/code-maat/tree/50537abb8dffa1b1ba4e91a605ee5c558c01b224) | `50537abb8dffa1b1ba4e91a605ee5c558c01b224` | 2025-07-03 | GPL-3.0（README和源码声明；API未识别） | VCS日志挖掘；coupling、revisions、churn、age、ownership等CSV | 最适合首个适配：直接读取coupling CSV。Java/Clojure分析由使用者独立运行；Archify不承担挖掘器、作者排名和CodeScene平台。 |
| [erikbern/git-of-theseus](https://github.com/erikbern/git-of-theseus/tree/961bda027ffa9fcd8bbe99d5b8809cc0eaa86464) | `961bda027ffa9fcd8bbe99d5b8809cc0eaa86464` | 2023-11-25 | Apache-2.0 | 按代码引入年代、作者、扩展名统计留存；输出JSON与堆叠/存活图 | cohorts.json、authors.json、exts.json、survival.json有现成数据；全历史分析可能昂贵。代码存活不是模块稳定性或质量，折线/堆叠图更适合解释页而非架构边。 |
| [github/git-sizer](https://github.com/github/git-sizer/tree/56a6df5afb9ea48de2302b9c1b70cf49e36f0d00) | `56a6df5afb9ea48de2302b9c1b70cf49e36f0d00` | 2026-10-06 | MIT | Git对象、路径、历史形状与检出规模；可选机器可读JSON v1/v2 | 适合仓库体积解释卡。不是业务依赖图、热度或影响分析；不应把对象大小阈值映射成架构健康。与Archify定位关联较弱。 |
| [ts-arch/ts-arch](https://github.com/ts-arch/ts-arch/tree/4f08dc3b853976aa28909f04768273632bffd6ec) | `4f08dc3b853976aa28909f04768273632bffd6ec` | 2026-03-26 | MIT | TS/JS文件与slice依赖约束、循环检测；可对PlantUML架构检查；读取Nx graph | 可以借鉴“允许边+实测违规见证”的表达。不是现成稳定JSON报告器：已读顶层Violation为空接口，适配需要进一步绑定具体结果类型。 |
| [TNG/ArchUnit](https://github.com/TNG/ArchUnit/tree/5f0884eb24991b46c20dff1d8876c5d3792fcfe2) | `5f0884eb24991b46c20dff1d8876c5d3792fcfe2` | 2026-10-22 | Apache-2.0 | Java字节码导入后检查类/包依赖、layers、slices与循环 | 适合外部规则执行器的失败证据图；不把Java编译和字节码解析带进Archify，也不把所有语言抽象成新的治理框架。 |
| [CoatiSoftware/Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail/tree/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3) | `4b1b0e4fd19c4af235fef12b0564c05348f5f6d3` | 2021-12-13 | GPL-3.0 | 桌面代码索引与交互导航；图、搜索、源码上下文协同 | 已归档，不能作为活跃依赖推荐；Qt、Boost和语言索引构建链较重。仅借鉴点击局部关系同时展示源码出处，不复刻索引IDE。 |
| [istanbuljs/nyc](https://github.com/istanbuljs/nyc/tree/908620475199fa7b9ea0ea8b21d6d8ad6921e3ae) | `908620475199fa7b9ea0ea8b21d6d8ad6921e3ae` | 2026-05-17 | ISC | JS插桩测试覆盖；支持子进程、Babel/TS source map及多reporter | 可以消费用户已有LCOV或汇总结果。默认只收集测试访问文件，all配置影响分母；缺失文件不能显示为0%或100%。 |
| [linux-test-project/lcov](https://github.com/linux-test-project/lcov/tree/1fc9bafa43e1df4af08e4e61d521bf645752b931) | `1fc9bafa43e1df4af08e4e61d521bf645752b931` | 2026-10-24 | GPL-2.0 | 覆盖数据采集/转换、合并与HTML；目录层级、差异覆盖、日期/owner分组 | LCOV是跨语言输入候选，支持gcov、llvm-cov等来源；Archify只做模块汇总解释。原工具已有完整HTML，若只重复列表价值很低。 |
| [nedbat/coveragepy](https://github.com/nedbat/coveragepy/tree/0e4f752b455bbf26fdad32ac29948d067c87dd62) | `0e4f752b455bbf26fdad32ac29948d067c87dd62` | 2026-10-24 | Apache-2.0 | Python行/分支覆盖，JSON与LCOV输出 | 已读jsonreport.py：format=3，files、totals、executed/missing/excluded_lines与可选分支。可作为跨语言后续输入；首轮不同时支持两种格式。 |

一手来源：上表仓库链接均固定到commit；各仓库根README说明其能力。Code Maat声明其分析思路演进为CodeScene，但**不能据此将商业CodeScene视为开源项目**。本调研以开源Code Maat作为该方向证据。

## 影响判断中最容易误读的细节

### 共变分数不是条件概率，也不是调用关系

[Code Maat logical_coupling.clj](https://github.com/adamtornhill/code-maat/blob/50537abb8dffa1b1ba4e91a605ee5c558c01b224/src/code_maat/analysis/logical_coupling.clj) 中的计算为：

`degree = int(100 * shared-revisions / average(first-entity-revisions, second-entity-revisions))`。

输出默认字段为 `entity,coupled,degree,average-revs`，verbose额外含双方revision数和shared数。degree是对称分数；README口语描述容易被误读成“修改A有X%概率必须改B”，实验不沿用这项推断。大提交、格式化、生成产物、目录重命名以及所选时间窗都会影响共变。即使分数100，也不能推出运行时调用、缺陷、组织边界错误或必须重构。

### 覆盖率的分母必须可见

[nyc README](https://github.com/istanbuljs/nyc/blob/908620475199fa7b9ea0ea8b21d6d8ad6921e3ae/README.md) 说明默认只采集测试触及文件，`all`决定是否考虑其他文件。覆盖报告中的未出现路径是unknown，除非报告和文件清单能证明其在采集范围内且无命中。

[coverage.py jsonreport.py](https://github.com/nedbat/coveragepy/blob/0e4f752b455bbf26fdad32ac29948d067c87dd62/coverage/jsonreport.py) 当前format=3；行、分支、excluded、contexts不同维度，不可把 `percent_covered` 与行覆盖简单混为一谈。coverage.py仓库已迁往coveragepy组织；这里固定旧入口解析返回的同一源码SHA。

### 治理规则的图与实测图应区分

[TSArch README](https://github.com/ts-arch/ts-arch/blob/4f08dc3b853976aa28909f04768273632bffd6ec/README.md) 的PlantUML是规范输入，运行检查才产生是否违背的结果。不能把规范边画成已验证源码依赖。已读 [Violation接口](https://github.com/ts-arch/ts-arch/blob/4f08dc3b853976aa28909f04768273632bffd6ec/src/common/assertion/violation.ts) 本身为空，暂不能声称提供现成稳定机器输出格式。

## 实验A：共变证据图（优先）

**用户价值**：维护者拿到Code Maat表格后，快速确认哪些路径常在同一提交里一起变化、数据采集范围是什么，以及下一步应读哪些文件；可离线交付给评审者。比单纯的活动动画更接近实际代码阅读任务。

**最小输入**：一份现成的coupling CSV（建议verbose），一个sidecar JSON记录仓库公开URL、基准commit、时间区间、分析命令/版本、路径排除、最大changeset过滤及输入digest。首轮按文件节点；模块聚合只能接受使用者显式映射，不根据路径猜业务层。

```csv
entity,coupled,degree,average-revs,first-entity-revisions,second-entity-revisions,shared-revisions
src/render.mjs,src/validate.mjs,50,10,12,8,5
```

该行是手工说明格式的合成数据，不是Archify仓库测量。

**最小输出**：图上文件名、无方向共变关系、degree与shared次数；旁边显示数据窗口、过滤和事实边界。可用现有图绘制对称关系，如当前模式强制箭头，则在标签/图例明确对称并避免呈现为架构调用。路径详情链接固定commit源码。输出原始CSV/sidecar、生成的既有类型JSON或解释页Markdown、HTML、PNG和现有交付收据，不改变CLI核心。

**范围与维护成本**：一个独立实验目录的纯数据适配脚本、样例输入及说明；不执行Code Maat、不增加Java依赖、不拉取仓库、不做重命名历史统一、不模拟CodeScene Code Health，不复制GPL源码。生成HTML的数据必须转义，限制行数/文件数，超限明确失败或列出截断范围；绝不能静默只显示部分关系再称为“完整架构”。

**图像验收**：先做8–15节点的公开仓库真实窗口，保留Code Maat的真实输出和commit；另有上面合成CSV只验证字段。1280×900同主题截图中能读清完整路径/标签，关系不会覆盖节点，图例明确“同提交共变”；任抽3条关系从CSV核对两端/degree/shared。零关系显示“无满足过滤的关系”，不是“无耦合”。本调研未生成该图，验收尚未执行。

## 实验B：模块覆盖解释页（次选）

**用户价值**：已有测试覆盖数据时，回答“这个系统哪些显式模块有已观测覆盖空白”，并能把薄弱模块连回已有架构和源码证据。不是自动推荐测试、质量评分或测试充分性证明。

**最小输入**：一份现成LCOV文件；显式模块→相对源码路径映射；同一次运行的报告revision、命令与采集范围；可选已有Architecture JSON。首轮只解释行覆盖 `SF/DA/LF/LH`，不承诺所有LCOV扩展。重复SF和重复DA必须先定义一致的合并规则或拒绝；不用百分比平均来汇总模块，按命中行/可执行行求和。分母=0显示N/A；映射文件未在报告中出现显示unknown。不要通过读本机绝对路径补齐源码，避免路径泄漏与越界读。

**最小输出**：一张既有架构图或模块关系图，覆盖为旁证标注；另附模块表格：covered/total、unknown文件数量、排除范围。没有已有关系证据时只画模块容器/列表，不从覆盖数据发明边。解释页醒目写明“行被执行 ≠ 行为正确”。HTML、截图、原始报告与收据共同交付。

**范围与维护成本**：只支持一个报告格式、一个明确映射；复用Archify现有解释页能力，不建立新的图表引擎、测试运行器、覆盖采集器或CI服务。LCOV本身已有成熟HTML；只有将覆盖和已有模块语义联系起来才有增益，否则继续使用genhtml即可。

**图像验收**：公开小仓库的一次真实测试运行覆盖报告，冻结源码revision与报告digest；展示有命中、0命中、unknown、N/A四种互不混淆状态。模块汇总数字与原始记录抽样核对；颜色之外还要有文字/数值。浏览器图清晰且附真实PNG，但不据此宣称跨运行、跨语言或功能正确性验收。本调研未运行测试或生成图。

## 实验C：架构违规的最小见证图（待补证）

**用户价值**：测试失败时，在允许规则背景下显示实际违规的两端路径/类和来源位置，避免评审者在大量日志里找违规路线。

**最小输入**：自含 `ruleId, ruleDescription, from, to, evidencePath, evidenceLine, revision` 的使用者提供JSON。第一轮不声称是ArchUnit/TSArch原生格式；需要一个真实测试失败结果与具体API的适配证据后，才能称上游集成。

**最小输出**：仅画失败见证所需的3–8节点，区分“规则声明”和“观测依赖”；引用精确revision出处。未验证规则执行结果显示provided/unverified；空数组表示输入无见证，不代表所有规则通过。

**成本/影响**：小图本身便宜，支持两种语言分析器的失败格式和版本变化昂贵，因此优先级低于A/B。不要新增完整策略语言、自动修复、CI门禁或通用源码索引。若真实工具没有稳定导出接口，停止在手工解释页样例，不包私有API。

**图像验收**：使用真正的一个失败与一个通过案例，确认图中的违规边来自执行结果；修正规则或依赖后，不再保留过时红边。用固定布局、同主题截图比较；规则图和实测图的含义在截图内直接可读。本次只提出验收合同，未实际接入上游。

## 不建议本轮做

Gource式全仓动画、Sourcetrail式索引IDE、CodeScene式健康/团队治理平台维护面过大；git-of-theseus和git-sizer图表与业务架构关系弱，可在具体解释页任务按需使用。共变与覆盖都不应直接变成风险总分；这会把采集缺口、统计相关与系统语义混合成不可解释结论。

## 证据与复现记录

本轮通过 `gh api repos/<repo>`、`commits/<default_branch>`、`readme` 和重点源码 `contents/<path>?ref=<sha>` 读取一手资料；未克隆大型仓库。匿名GitHub API遇到403限流后改用现有认证的只读gh调用，未读取或打印凭证。许可标签中Code Maat由README和源码注释确认；Sourcetrail归档状态由仓库API确认。

真实产品图、工具执行结果、浏览器验收与收益测量均为待做事项。此文是选择实验的证据，不是实现完成报告，也不替代#998完整差异检查。独立实验前应将边界记入研究索引；正式行为PR仍按仓库贡献流程处理。
