# 第17轮：15个离线适配器对dev10b4的实际影响

只读盘点，不做批量merge。结论：**未发现因dev10b4而已证实失效的适配器输出格式；有两个应优先处理的交付事实：Task的既有失败要拆分，5个build helper的新运行基线标签不能原样复用。** Dependency的code-source是能力缺口，不是本次兼容回归。其余固定输入的转换事实无需仅为追平HEAD而刷新。

## 固定范围和方法

- 对照[gallery39选择清单](../gallery/selection.json)中全部15条`offline`，逐一读取其固定发布提交、本地对应branch HEAD、顶层转换器/构建脚本、已发表README和原生JSON。15个本地HEAD均与该清单pin一致；未把正在刷新的12个product方向算作离线adapter。
- 当前目标固定为[dev10b4](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。本次实际`git ls-remote origin refs/heads/dev`仍返回该完整SHA；本地origin/dev相同，没有发现远端漂移。首次共同基线为[82c7e0f0](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)，DBML、State、Recipe已有较新补证，见表。
- 实际读`git diff 82c7e0f0 10b4dd5c -- archify/schemas archify/bin archify/explainer archify/renderers`及owning source。没有执行adapter、validate/render/finalize、上游程序、suite或浏览器；没有写任何实验WT、安装、checkout、fetch、merge、提交或推送。本报告的“未见破坏”是静态影响判断，不是假称新base运行通过。
- 15个顶层adapter/build均只导入Node内建模块或本实验文件；没有导入Archify内部compiler/prepare私有函数。调用共享产品的接口是公共CLI，或生成JSON/MD交给该CLI。

## 共同接口变化：哪些真正触达

1. **输入结构兼容。** [schema diff](https://github.com/tt-a1i/archify/compare/82c7e0f089a02a4d514714adf37dc2061682da5f...10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)中common/architecture/workflow/sequence/dataflow/lifecycle仅新增可选`explanation`、`drilldowns`、`href`、`meta.parentHref`及相应defs；Tree/ERD/Waterfall与Explainer schema无该范围变更。没有要求旧adapter补字段。相关renderer增加Passport解释/下钻；未提供这些字段的输出不因此成为下钻图。
2. **交付不再只保护入口文件。** [prepare.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/prepare.mjs)的`declaredExplainerInputPaths`、[archify.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/archify.mjs)的deliver保护声明的chart数据、diagram source及准备后的资源路径，阻止HTML/provenance/lock等覆盖输入。Change/Decision/State/CI/Recipe的MD确用`@diagram ... source=...json`；它们现有配方的JSON/MD/HTML互异，未发现别名冲突。安全拒绝更严格，不是输入格式破坏。若后续改输出路径碰到source，应该保留失败，不削弱保护。
3. **有界源码末行修复未普遍触发。** [finalize.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/finalize.mjs)仅在专门的repository-evidence越界、canonical JSON和绑定条件下改`end_line`；noncanonical候选原字节保留，失败重试要记回滚/sidecar结果。15项已保存native JSON/内嵌spec未见`meta.repository`或节点`sourceReferences`，顶层生成器也不构造这些native字段。因此不能把报告的文件路径、MD sources列表、snippet或sidecar revision升级为该验证器已核过的源码。更不能给原pass补一段autoRepair经历。
4. **HTML与包不是转换结果同一合同。** [software-notices.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/shared/software-notices.mjs)、[render.mjs](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/render.mjs)和新Viewer会改变重生成的HTML字节、软件声明及交互；旧HTML/PNG仍是固定旧版本记录。新输出需新hash/局部gates；原始输入与纯投影若不改，不必重采集上游数据。Apache迁移只按仓库声明记录；不是对旧实验/第三方许可的法律结论。
5. **10b4还没有keyboard-traversal候选修复。** 固定10b4的[checker](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/browser-check.mjs)仍用`controlCount+3`。已发布`c96e8aa7`候选在相同旧HTML的50个目标上得到0诊断，是候选检查器证据，不能写成“10b4已经解决”。新dev`nodeBlocks`原生入口/close等待等也不等于source-only keyboard候选已集成。

## 15项逐一归类

“无需刷新”指无需改适配器或重采集固定输入来回答此次base影响；不表示旧HTML已经验证10b4。所有旧测试/gate只绑定各自声明的head/hash。

| 固定发布方向 | 实际Archify接口/字段 | 判断与最小动作 |
| --- | --- | --- |
| [task-review-map `dcedd538`](https://github.com/tt-a1i/archify/blob/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/README.md) | architecture内嵌spec + Explainer JSON / nodeBlocks、steps、snippet、diff；build-demo调用finalize --browser-check | 需处理已知失败及构建摘要标签；见深查①。 |
| [dependency-map `2be2ab55`](https://github.com/tt-a1i/archify/blob/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map/README.md) | architecture JSON + mapping.receipt；手动public render/finalize | 转换语义可复用；没有native code-source，见深查②。 |
| [trace-waterfall `8e65f150`](https://github.com/tt-a1i/archify/blob/8e65f150b8db6947c98f9b12e37d970014e0ea7e/experiments/trace-waterfall/README.md) | waterfall JSON；手动public render/finalize | X区间、duration、pid/tid投影无需刷新；新HTML/notice另验。 |
| [markdown-outline `3f156e97`](https://github.com/tt-a1i/archify/blob/3f156e979476f068b1017eca7fe5539a0ddf11e1/experiments/markdown-outline/README.md) | tree JSON + 行号/来源cards；手动public render/finalize | 固定Markdown的17标题及源行号无需刷新；不是native repository verification。 |
| [dbml-erd `358c77e0`](https://github.com/tt-a1i/archify/blob/358c77e05eb54a3f10ad3bcbb8f196eb8f277ccd/experiments/dbml-erd/README.md) | erd JSON；public render/finalize | 358c已合3f95；primary key同义词49focused/四gate原证据可复用；无新增schema拒绝。 |
| [change-coupling `44dc5cbc`](https://github.com/tt-a1i/archify/blob/44dc5cbc324f3aaeff2b8de582412566f1f8b8ab/experiments/change-coupling/README.md) | architecture JSON + MD @diagram source；build调用render/finalize | 数据投影无需改；外部resource保护生效；build标签见③。 |
| [payload-delta `823e8705`](https://github.com/tt-a1i/archify/blob/823e8705aa0eeef90f46045f52e56651f0c81c1b/experiments/payload-delta/README.md) | Sequence JSON + Explainer MD；public render/finalize | missing/null/type/数组规则不涉及新schema；无新stats/diff接口。 |
| [decision-thread `bdbdf9a9`](https://github.com/tt-a1i/archify/blob/bdbdf9a9b5b97c556c5f85547279021b7446a05c/experiments/decision-thread/README.md) | Sequence JSON + MD @diagram source；public render/finalize | 撤回/异议投影及已修图例可复用；不是新dev重新验收。 |
| [migration-plan `b9fe3b9b`](https://github.com/tt-a1i/archify/blob/b9fe3b9b8cfd9e0819e4ae8ff23adc787ee132d0/experiments/migration-plan/README.md) | Workflow JSON + 内嵌spec Explainer JSON；build调用render/finalize | hazard/顺序/timeout数据无需改；build标签见③。 |
| [state-contract `f7269e09`](https://github.com/tt-a1i/archify/blob/f7269e096ac1891b434842cf7e16b9ffdd54cdf6/experiments/state-contract/README.md) | Lifecycle JSON + MD @diagram source；measured补证67f | 原getDAG实导出、观察对与声明投影可复用；不重跑机器/事件。 |
| [ci-conditions `0ec0b834`](https://github.com/tt-a1i/archify/blob/0ec0b8345fcfc97e49117b66fd7f99a198c96604/experiments/ci-conditions/README.md) | architecture JSON + MD @diagram source；public render/finalize | needs/原if/隐式状态门槛与未知矩阵投影无需改；不执行CI。 |
| [plan-actions `729d3a03`](https://github.com/tt-a1i/archify/blob/729d3a0374189234e1bdfe5d6fc7f7190c894e0e/experiments/plan-actions/README.md) | Workflow JSON + 内嵌spec Explainer JSON；build调用render/finalize | replacement/value-free规则不受可选字段新增影响；build标签见③。 |
| [recipe-stages `062dee5d`](https://github.com/tt-a1i/archify/blob/062dee5db6e10c1877427effff0d02b34699fbe1/experiments/recipe-stages/README.md) | Workflow JSON + MD @diagram source；measured补证67f | 真实dump及priors投影可复用；新resource安全保护不是新的Just执行。 |
| [test-context-map `9d6b4e3a`](https://github.com/tt-a1i/archify/blob/9d6b4e3a85f52f3f6c50ab30338358ebdb2597dd/experiments/test-context-map/README.md) | Tree JSON + 内嵌spec Explainer JSON；build调用render/finalize | sidecar revision/sha是适配器声明合同，非native verified source；build标签见③。 |
| [test-failure-map `bb5e7bdb`](https://github.com/tt-a1i/archify/blob/bb5e7bdb2995e977eeaf12dd8d6187a3ca676db9/experiments/test-failure-map/README.md) | Explainer MD；public finalize --browser-check | 阶段/行号/缺少definition-file投影无需改；原measured自动browser未跑仍未跑。 |

## 已知具体兼容风险：只深入三处

### ① Task review map：未解决ZIP与旧QA误报是不同问题

固定[review-map.mjs](https://github.com/tt-a1i/archify/blob/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/review-map.mjs)的`mapReview`有1MiB blob上限；PR1097约5.4MB ZIP仍unresolved，`mappingComplete=false`/exit1成立。`toExplainer`用内嵌Architecture spec + `nodeBlocks` + steps、snippet、diff和固定revision链接；它自己核Git引用，不配置native repository sources。dev10b4没有修改其1MiB上限，也不解析该ZIP，所以不能将新打包工具或浏览器通过等同于ZIP已记账。

[PR1097旧证据](https://github.com/tt-a1i/archify/blob/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/pr-1097/README.md)与手写布局派生应继续原字节保留。此前30条keyboard diagnostics被[新检查器固定输入对照](https://github.com/tt-a1i/archify/blob/c96e8aa74ff5e309cdab07a1b70d0242f33bed75/experiments/keyboard-traversal/refresh-dev-10b4/README.md)复现为10b4 base fail→候选0：1280/1440×双主题50/50，65/64步，页面未改；仅排除已证明的遍历过早停止误报。旧页面仍有历史diff行号/原布局问题，写入新CSS或重新finalize都会成为另一份HTML。也不能用该候选结果把所有原生浏览器诊断抹掉。

**最小下一步：** 若只是审原PR映射，继续展示完整unresolved ZIP与原退出1即可，不为追新base改adapter。若维护者要新base可分享产物，在全新输出目录生成同一review，先修第③项元数据；记录新source/HTML/gates，浏览器只补真实未决项。不要升高blob上限来制造完整记账，也不要顺便执行PR代码。需消除QA误报时以已审keyboard产品候选作独立整合决策，不能在adapter私改checker。

### ② Dependency map：没有原生code-source接口，不能追认来源已核

[convert.mjs](https://github.com/tt-a1i/archify/blob/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map/convert.mjs)的报告`modules[].source`用于精确身份/BFS/标签；原始路径、flags、全部报告保留在`mapping.receipt.json`。输出只是architecture components/connections/cards，没有`meta.repository`、component `sources`、nodeSources或nodeBlocks。报告不存在源行号/producer/analyzed commit时明确unknown；basename可同名，receipt保留全路径。新Passport Explain和source-card能力都不会从路径自动产生正确固定源码链接。

已冻结6tests和官方19记录、两份原base四gate继续证明2be2原转换；自依赖/平行记录单独列账并未因新dev变成native自环。10b4未改变该图的必需schema字段；未见必须改converter的证据。

**最小下一步：** 无需本轮刷新。真有读者需定位源码时，先要求提供可验证revision/path/line且保留unknown/refuse；那是另立输入合同，不是dev兼容补丁。若只要最新Viewer/notice，用一个现有官方map JSON在新目录单次validate/render/finalize，核节点ID、边方向/flags账目与新hash；不重跑dependency-cruiser、不声称报告覆盖完整。

### ③ 5个构建helper：新运行仍写82c7，会产生误标摘要

下列固定源码直接将portable summary基线常量写成82c7，并未读取实际执行产品revision：

- [Task build-demo.mjs](https://github.com/tt-a1i/archify/blob/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/build-demo.mjs)：`baseline`。
- [Change coupling build.mjs](https://github.com/tt-a1i/archify/blob/44dc5cbc324f3aaeff2b8de582412566f1f8b8ab/experiments/change-coupling/build.mjs)：`baseRevision:'82c7e0f0'`。
- [Migration plan build.mjs](https://github.com/tt-a1i/archify/blob/b9fe3b9b8cfd9e0819e4ae8ff23adc787ee132d0/experiments/migration-plan/build.mjs)：同上。
- [Plan actions build.mjs](https://github.com/tt-a1i/archify/blob/729d3a0374189234e1bdfe5d6fc7f7190c894e0e/experiments/plan-actions/build.mjs)、[Test context build.mjs](https://github.com/tt-a1i/archify/blob/9d6b4e3a85f52f3f6c50ab30338358ebdb2597dd/experiments/test-context-map/build.mjs)：`baseRevision`为完整82c7 SHA。

这些脚本在旧branch运行的历史摘要没有因此失真；**若把脚本复制/merge到10b4再原样运行，新摘要会错误绑定旧基线**。这是可直接从赋值与cwd/publicCLI调用推导的条件风险，本轮没有执行制造新错误摘要。最终`gates`/`visualReview`字段仍可从public finalize JSON读取，未发现依赖字段被移除；问题不是CLI改名或JSON接口崩溃。

**最小下一步：** 只有确实要新base重生成时，先使新运行记录实际产品commit/source hash与adapter commit，并与review的历史base/head、上游输入来源分列；保留旧摘要字节。可用一个已有小fixture做一次fresh-output build验证标签、真实exit/gates、resource互异和新HTML绑定；无需5方向全suite、无需先刷新15分支。若源树有未提交候选，用冻结文件hash而非HEAD冒充实现提交。

## 可复用冻结证据与无需刷新的范围

- 全15的原fixture/hash、范围/缺失/拒绝合同及纯转换断言可以继续引用于其固定发布head；DBML的primary-key新增接受、State/Recipe受控实导出和各原失败记录同样不因base移动消失。构造/静态关系不会变成运行因果、成功测试、业务架构或风险概率。
- 纯转换器不改时，不为这个盘点重复运行Git/pytest/coverage/Just/Robot3/Terraform/数据库/trace采集。来源许可原文本与固定上游字节不为新产品notice“清理”或重新许可。
- 没有fresh交付诉求的方向，按表保留即可，不需要机械merge、重生成或重拍；上文5个helper的条件风险也不要求现在重跑它们。没有任何一项被本轮盘点标成已跑通新base。
- 真正选择新交付base时，只补该图型/Explainer公共CLI局部验证与source/output保护，机器gate和root视觉分列；新receipt原件外置，portable摘录标明性质，旧receipt不改绑新HTML。本文没有提出新增framework、通用parser、统计引擎或12个产品候选的再刷新。

此次优先级：**先避免新运行的失实基线标签；Task按未决项精确处置；Dependency没有源码合同回归，不开展补丁。** 没有证据支持15分支一轮重base/全跑。
