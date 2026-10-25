# 文本、数据与叙事图工具调研

核查日：2026-10-25。Archify 比较基线：`82c7e0f089a02a4d514714adf37dc2061682da5f`。本文件是研究建议，没有实现、渲染、截图、测试或上游提交；下文截图是交给实验执行者的方案，不能视为已完成证据。

结论：优先试一个严格的 Markdown 标题大纲 → 原生 Tree 转换器；第二选择是 DBML 基础模型 → 原生 ERD。两者解决已有资料重新录入成本，复用现有 schema、布局、Viewer 和交付门禁。不要扩张成通用语言兼容层。Mermaid 导入、C4 多层以及 Explainer 交互已有开放 PR，本轮不重复。

## Archify 已有能力与真实缺口

已读 `CONTRIBUTING.md`、`.agents/skills/archify-review/SKILL.md`，按用户价值、成本、影响评估。本任务授权的是隔离实验；正式 PR 仍须处理仓库既有范围约定流程。

| 能力 | 当前拥有源码与证据 | 判断 |
| --- | --- | --- |
| Mermaid 输入 | `archify/SKILL.md` 的 Mermaid input 明确要求 Agent 读拓扑、重新写 typed JSON；README 明确自动 Mermaid parsing 不在当前范围 | 能接受语义需求不等于已提供自动 parser |
| import / migrate | `archify/bin/archify.mjs` 的 COMMAND_USAGE 没有 import；migrate 仅为 workflow v1 → v2 | 新实验应独立放 lab adapter，避免把 migrate 偷换成外部格式导入 |
| Tree | `archify/renderers/tree/README.md`、tree schema 与 payment-platform.tree.json：单根、有序 children、parent、sublabel、collapsed、sources，down/right 布局；现有展开折叠、Finder 自动展开祖先、导出完整树 | Markmap 式“树图 + 折叠”已经存在，缺的是标题大纲的确定性入口 |
| ERD | `archify/schemas/erd.schema.json`、orders.erd.json：实体、属性、pk/fk/uk、references、关系基数、网格布局 | DBML 实验无需创造 ERD 类型或复制布局器 |
| Explainer | `archify/references/explainer-authoring.md` 已有 @tree、@erd、@sequence、@steps、@source、block 引用、面板 patch；支持部分 Mermaid 数字图表 fences | 不建议重新做“图文结合”、节点解释复用或点击步骤高亮 |
| Story | `archify/references/story-authoring.md`：scan/draft/attach、scene/point、anchor/via/focus、trace/parallel/relation、源码片段、视频导出 | 不建议再提“带解说的架构游览”；parallel 展示也不应被解释成并发执行证明 |

## 十个官方项目：功能、许可与取舍

以下功能来自官方仓库或文档；许可核对了仓库 LICENSE 原文，Pikchr 核对源码头部。链接是调研日的可变分支快照，并非固定版本审计。没有复制第三方代码、主题或样例资产。

| 项目与官方来源 | 已核实许可 | 当前现实功能 / 可借鉴点 | 对 Archify 的价值、成本、影响 |
| --- | --- | --- | --- |
| [D2 源码](https://github.com/d2lang/d2)、[Containers](https://d2lang.com/tour/containers/)、[LICENSE](https://github.com/d2lang/d2/blob/master/LICENSE.txt) | MPL-2.0 | 文本声明图，嵌套 map 描述容器，父级引用表达跨容器关系 | 可以借鉴“结构先于外观”。完整 D2 兼容要支持 scopes、styles、layouts，成本高；不接入 Go/布局依赖，不复制源文件 |
| [Mermaid 源码](https://github.com/mermaid-js/mermaid)、[LICENSE](https://github.com/mermaid-js/mermaid/blob/develop/LICENSE) | MIT | Markdown 风格文本描述 flowchart/sequence 等多种图 | 迁移需求直接，但 Archify 已有语义重写和三条 importer PR；本轮止于重叠检查 |
| [Structurizr Java 源码](https://github.com/structurizr/java)、[DSL 文档](https://docs.structurizr.com/dsl)、[LICENSE](https://github.com/structurizr/java/blob/master/LICENSE) | Java 库 Apache-2.0；不能外推到其 hosted/server 产品 | 一个模型生成多种 C4 views；DSL 文档包含 identifiers、implied relations、ADRs 与导出 | 同模型多视角有价值，但 Archify #653 已实现层级探索方案。引入 workspace 模型、隐式关系会扩大语义合同，不做 |
| [PlantUML 源码](https://github.com/plantuml/plantuml)、[Sequence 文档](https://plantuml.com/sequence-diagram)、[LICENSE](https://github.com/plantuml/plantuml/blob/master/LICENSE) | 当前 master 根 LICENSE 为 GPL-3.0；GitHub API 元数据返回 LGPL-3.0，与正文冲突，不能按元数据判断复用条件 | actor/participant、声明顺序、消息方向、self-message 等丰富时序语义 | 值得保留“顺序即语义”的迁移原则；完整预处理、includes、主题与 Java runtime 均不适合小实验。不复制其实现 |
| [Markmap 源码](https://github.com/markmap/markmap)、[README](https://raw.githubusercontent.com/markmap/markmap/master/README.md)、[LICENSE](https://github.com/markmap/markmap/blob/master/LICENSE) | MIT | Markdown 转 mindmap，并有编辑器生态 | 最直接低成本入口。借鉴输入习惯，输出 Archify Tree，而非复制其 renderer。只处理明确标题层级，避免承诺完整 Markdown/Markmap 兼容 |
| [DBML 源码](https://github.com/holistics/dbml)、[语法](https://dbml.dbdiagram.io/docs/)、[LICENSE](https://github.com/holistics/dbml/blob/master/LICENSE) | Apache-2.0 | Table、列、键、Ref、nullability、复合索引等数据库模型，SQL/JS 工具链 | 现有 ERD 可承接基础表列关系；较小子集也必须明确拒绝复杂模型，不能静默丢约束。dbdiagram SaaS 不因 DBML 开源而被视作开源 |
| [Pikchr 文档](https://pikchr.org/home/doc/trunk/homepage.md)、[源码与许可头](https://github.com/drhsqlite/pikchr/blob/master/pikchr.y) | 0BSD / Zero-Clause BSD | Markdown fence 中 PIC 式程序生成 SVG，适合技术文档局部示意 | 小而封闭的语法很有启发；直接引入 C/WASM runtime 只得到几何图，缺少 Archify 节点语义，因此不实现 |
| [Svgbob 源码](https://github.com/ivanceras/svgbob)、[README](https://raw.githubusercontent.com/ivanceras/svgbob/master/README.md)、[LICENSE](https://github.com/ivanceras/svgbob/blob/master/LICENSE) | Apache-2.0 | ASCII 线条草图转 SVG，CLI 接收文本输出 SVG | 对已有 ASCII 文档有迁移价值，但从线条推断节点/连接有歧义；引入 Rust/WASM 或仅嵌 SVG 都不利于原生交互。本轮不做 ASCII parser |
| [Railroad Diagrams 源码](https://github.com/tabatkins/railroad-diagrams)、[README](https://raw.githubusercontent.com/tabatkins/railroad-diagrams/gh-pages/README.md)、[LICENSE](https://github.com/tabatkins/railroad-diagrams/blob/gh-pages/LICENSE) | MIT | JS/Python 组合语法构造器生成铁路语法图，SVG/Unicode 输出 | 对 DSL 文档有价值，但无法无损映射为 tree/workflow；将要求新图种与 grammar schema。本轮只借鉴组合语义，不增加 renderer |
| [Typst 源码](https://github.com/typst/typst)、[README](https://raw.githubusercontent.com/typst/typst/main/README.md)、[LICENSE](https://github.com/typst/typst/blob/main/LICENSE) | Apache-2.0 | 标记语言排版，函数组合、数学、书目、增量编译与本地 CLI | 借鉴小语法组合；Archify 已有 Explainer，不需要扩成通用文档排版器或另一个脚本运行环境 |

许可结论仅用于选择研究方式；若未来复制代码或捆绑依赖，需针对准确版本、具体文件及 NOTICE 再核对。当前候选都可独立编写小转换器，不需要复用上游实现。

## 开放工作重叠（2026-10-25 实时查询）

使用 `gh issue list` / `gh pr list` 查询 `tt-a1i/archify`；读取了 #653 和 #1015 正文。标题检索不是全量无重叠证明。

- [#92](https://github.com/tt-a1i/archify/issues/92) / [#140](https://github.com/tt-a1i/archify/pull/140)：Mermaid flowchart → architecture typed IR。
- [#93](https://github.com/tt-a1i/archify/issues/93) / [#387](https://github.com/tt-a1i/archify/pull/387)：Mermaid sequence importer。
- [#94](https://github.com/tt-a1i/archify/issues/94) / [#388](https://github.com/tt-a1i/archify/pull/388)：Mermaid lifecycle importer。
- [#407](https://github.com/tt-a1i/archify/issues/407)：请求 Mermaid 风格 ERD；与 DBML 入口不是同格式，但同属关系模型迁移，正式范围需解释区别。
- [#653](https://github.com/tt-a1i/archify/pull/653)：C4 levels，新 manifest、导航、共享 Viewer；不再另做 C4 多层。
- [#1015](https://github.com/tt-a1i/archify/pull/1015)：Explainer reason-to-panel、step locking、动画流、metric delta、code focus、source card 等，避免重复。
- [#1070](https://github.com/tt-a1i/archify/issues/1070) / [#1091](https://github.com/tt-a1i/archify/pull/1091)：treeView fence 指向 native tree 的诊断修复。Markdown 标题入口应在外部 adapter 独立试，不顺手改该诊断。
- `DBML`、`Markmap` 名称查询的开放 issue 均无命中；此事实不等于不存在其他措辞的相关需求。

## 实验 A：标题大纲 → 原生 Tree（优先）

**真实任务形状。** 用户已有产品分解/目录规划/文章提纲，希望可折叠地讲给别人看。现在要让 Agent 再写每行 parent/ID，重新引入抄写和挂错父节点的机会。合成探针只能证明可行性，不能据此宣称已有真实用户采用。

**最小切片。** 一个 lab-only `outline-to-tree.mjs`，只读 UTF-8 文本，只接受 `#` 至 `######` 的 ATX 标题、空行与可选明确 ID；输出现有 schema v1 Tree JSON。单根，标题不得跳级；重复 label 可以存在，显式 ID 不得重复。按原输入顺序构建 parent，明确 ID 优先，默认 ID 可用标题路径生成并处理冲突。非标题正文报带行号的“不支持”，不要悄悄把正文丢掉。初版甚至可只支持显式 ID，使身份规则最容易核验。

**成本/影响。** 低到中；新输入适配器，不改 schema/renderer/Viewer。验证重点是语义保真、拒绝输入、可编辑输出；折叠与导出的现有证据可复用。正式 public CLI 与 Skill 路由是额外合同，先不放进实验。

输入（自编合成资料，不复制 Markmap 示例）：

```md
# 支付平台 {#platform}
## 订单 {#orders}
### 创建订单 {#create}
### 取消订单 {#cancel}
## 支付 {#payments}
### 银行卡 {#card}
### 钱包 {#wallet}
## 运营 {#operations}
### 退款 {#refund}
### 对账 {#reconcile}
```

可渲染的目标最小输入（已有 CLI，无实验代码也能作为布局预检）：

```json
{"schema_version":1,"diagram_type":"tree","meta":{"title":"支付平台","locale":"zh-CN","output":"outline-tree.html"},"layout":{"direction":"right"},"nodes":[{"id":"platform","label":"支付平台"},{"id":"orders","label":"订单","parent":"platform"},{"id":"create","label":"创建订单","parent":"orders"},{"id":"cancel","label":"取消订单","parent":"orders"},{"id":"payments","label":"支付","parent":"platform"},{"id":"card","label":"银行卡","parent":"payments"},{"id":"wallet","label":"钱包","parent":"payments"},{"id":"operations","label":"运营","parent":"platform"},{"id":"refund","label":"退款","parent":"operations"},{"id":"reconcile","label":"对账","parent":"operations"}]}
```

**截图/核验方案。** 使用同一台浏览器、1440×1000、light、100% 初始 zoom。before 截图为真实源大纲展示；after 为由转换器输出并由原生 CLI 渲染的 Tree。另拍折叠 payments 分支、Finder 打开 wallet 后祖先展开，证明复用了现有交互。截图不能单独证明 parser 保真：比较节点数 10、parent 关系 9、声明顺序、中文标签和 ID；用缺根、跳级、重复 ID、正文、fence 内假标题验证拒绝边界。若用现有 JSON 手写渲染，只能标“目标视觉预演”，不能标“转换成功”。

**不做。** 完整 Markdown、HTML、图片、链接执行、数学公式、任意嵌套列表、Markmap options、动态布局、拖拽重排、阅读顺序推断。

## 实验 B：基础 DBML → 原生 ERD（备选）

**真实任务形状。** 已维护 DBML 的团队希望把表关系放到可讲解、可分享的 Archify 页面。价值是减少模型重写，同时明确转换保留了什么，而不是引入另一个数据库建模平台。

**最小切片。** 独立 lab adapter 接受未加引号的表/字段名、`Table`、基本类型、`[pk]` / `[unique]` / `[not null]` 与独立 `Ref` 的简单单字段关系。输出 ERD JSON。初版严格要求 Ref 的列存在；复合关系、索引、Enum、TablePartial、跨 schema、注释 Note、默认值表达式全部拒绝并给行号。不能按分号/正则大拆 DBML 再声称支持通用 DBML；只为公开定义的小 grammar 写 tokenizer。原生 ERD 已有 `fromOptional` / `toOptional`，可表达关系最小基数；必须从 Ref 方向和 FK 可空性准确映射。非关系字段的 NOT NULL 不是现有属性合同，初版拒绝此类额外约束，避免静默丢失。

**成本/影响。** 中；语义和异常输入比布局更难。无需 @dbml/core runtime，但自己维护 parser 仍有成本，必须有清楚的子集说明。实体列及 FK 可走现有 schema；采用 2 列网格避免造新布局器。单个合成模型验证成功后，只有拿真实开源 DBML 样本核对语义覆盖，才值得进入产品。

输入（自编）：

```dbml
Table users {
  id bigint [pk]
  email varchar(255) [unique]
}
Table orders {
  id bigint [pk]
  user_id bigint
}
Ref: orders.user_id > users.id
```

注意：DBML 默认列可空；这里未加 not null，因此不能把每笔订单“必须”属于某用户当作被模型证明的事实。已有 ERD `fromOptional` / `toOptional` 可以保留两端可选性：以 orders → users 为方向，设置 many / one、fromOptional=true、toOptional=true，表达用户可无订单，订单可无关联用户。不能把它渲染成强制关系。

目标原生输入应显式携带可选性（更适合作为转换器验收目标）：

```json
{"schema_version":1,"diagram_type":"erd","meta":{"title":"用户与订单","locale":"zh-CN","output":"dbml-erd.html"},"layout":{"mode":"grid"},"entities":[{"id":"users","label":"users","row":0,"col":0,"attributes":[{"name":"id","type":"bigint","key":"pk"},{"name":"email","type":"varchar(255)","key":"uk"}]},{"id":"orders","label":"orders","row":0,"col":1,"attributes":[{"name":"id","type":"bigint","key":"pk"},{"name":"user_id","type":"bigint","key":"fk","references":"users.id"}]}],"relationships":[{"id":"order_user","from":"orders","to":"users","fromCardinality":"many","toCardinality":"one","fromOptional":true,"toOptional":true,"label":"user_id"}]}
```

以下 Explainer 仅是图文形式预演，其紧凑 many:one 行未表达 optional，不能用于 DBML 语义保真验收；最终应引用上述 native spec，而非用此简写交付：

```md
# 订单通过 user_id 关联用户 {#order-model}

这是基础键与外键的结构投影，不作为数据库约束完整描述。

@answer scope="合成样本 · 只展示字段与关联"
@meta locale=zh-CN

## 哪个字段建立关联？ {#relations}

@erd id=orders-erd title="用户与订单"
| entity users | users |
| entity orders | orders |
| users.id | bigint | pk |
| users.email | varchar(255) | uk |
| orders.id | bigint | pk |
| orders.user_id | bigint | fk | users.id |
| orders > users | many:one | user_id |
```

**截图/核验方案。** before 展示 DBML 原文；after 展示原生实体字段、PK/UK/FK 和关系，放在同 viewport/light/theme 中。另拍点击 orders.user_id 后的信息卡；若无卡片功能，不补造交互。比较 2 表、4 字段、1 Ref、键和引用目标；检查未声明列、重复表、复合 Ref、Enum/Note、quoted identifier、nullability 都有明确结果。手写 Explainer 的视觉预检不能证明 DBML adapter 已完成。真实截图路径应在实验执行者生成后补充。

**不做。** SQL 多方言 parser、数据库连接、反向 DDL、迁移执行、约束猜测、自动 schema diff、dbdiagram 登录/云服务、全量 DBML 兼容。

## 选择建议

先完成 A；它的语义更封闭，也最能在少量代码内展现“已有文档立即变成可探索图”的用户价值。B 先验证 nullability/复合键等语义边界；若小子集只能在很少样本上工作，保留为 lab 结果，不进入主 CLI。两者都不需要更换渲染器、增加 runtime dependency 或修改 live Skill。
