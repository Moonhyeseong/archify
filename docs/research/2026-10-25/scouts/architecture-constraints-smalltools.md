# 架构约束的命中证据与盲区：第九轮7个新来源

2026-10-25，一手只读研究。Archify固定基线 `82c7e0f089a02a4d514714adf37dc2061682da5f`。未执行上游分析器、PHP配置、Go构建、Rust程序或云端show；没有实现、图片或人类收益验证。

**最值得保留的是“违规见证与检查盲区同屏”，不是另一个全仓依赖图。** go-arch-lint提供可核对的import端点、行号、未匹配文件、扫描能力与省略计数，适合一个很窄的离线解释页；Arch-Go的coverage是规则触达包的覆盖率，不能写成测试覆盖或架构安全率。两项都先要求真实用户报告中的阅读任务收益。现有dependency-map已经完成依赖图、方向与过滤账目，本轮不再写同类converter。

## 排重及当前边界

检索hub当前全部scouts的GitHub owner/repo，排除dependency-cruiser、TSArch、ArchUnit、Import Linter、Grimp、Archan、Code Maat及既有测试选择/覆盖来源。ArchUnitNET为不同代码库，本轮只研究其Freeze的描述身份/基线存储模块，不重复Java ArchUnit规则引擎。没有按star筛选。

同日远端标题检索`architecture constraint`未命中issue，`violation`开放PR只返回无关geometry/delivery项；这不是完整无重复证明。已有[#998](https://github.com/tt-a1i/archify/pull/998)代码分析、[#1049](https://github.com/tt-a1i/archify/pull/1049)Git-ref snapshot与此前dependency-map范围仍需遵守。本轮不新增扫描器、符号解析器、规则引擎、影响概率、自动修代码或测试执行器。

## 固定一手来源

日期为commit committer时间，不等于release。以下许可均实际取得仓库许可文件；能力事实来自固定README与下文源码，未从营销页推断。

| 来源与固定commit | 日期、许可 | 真实输入→输出/小机制 | 限制与成本判断 |
| --- | --- | --- | --- |
| [deptrac/deptrac](https://github.com/deptrac/deptrac/tree/66595d1ca307afff492d99501ffaeba147e848b0)<br>`66595d1ca307afff492d99501ffaeba147e848b0` | 2026-09-20<br>[MIT](https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/LICENCE.md) | PHP源码+层collector/ruleset→JSON/Graphviz/Mermaid。JSON按file保存line/type/message；Report区分Violations、Skipped violations、Uncovered、Allowed、Warnings、Errors。 | JSON端点/层被嵌入message，regex提取不是结构化证据。原工具已有图；只复刻layer graph收益低。不推荐单独adapter。 |
| [phparkitect/arkitect](https://github.com/phparkitect/arkitect/tree/40e7427540e416ec3acb10f57fa0f2db46d4ec32)<br>`40e7427540e416ec3acb10f57fa0f2db46d4ec32` | 2026-10-19<br>[MIT](https://github.com/phparkitect/arkitect/blob/40e7427540e416ec3acb10f57fa0f2db46d4ec32/LICENSE) | ClassSet+PHP Rule selector/check/because→JSON totalViolations与按FQCN的details[{error,line?}]；debug:expression可查选择器实际选中类。 | because是作者理由，不是程序证明。JsonPrinter仅error/可选line，缺独立target/rule ID；不执行PHP配置或从error反推边。 |
| [arch-go/arch-go](https://github.com/arch-go/arch-go/tree/6cb436f84fc8c3800ab9e4f014813c35e871b3d3)<br>`6cb436f84fc8c3800ab9e4f014813c35e871b3d3` | 2026-02-13<br>[MIT](https://github.com/arch-go/arch-go/blob/6cb436f84fc8c3800ab9e4f014813c35e871b3d3/LICENSE) | Go包+YAML规则→.arch-go/report.json，summary/compliance/coverage，按dependencies/functions/contents/naming分组，保留package与details。 | coverage是包被任一类规则触达，不是测试覆盖；details为字符串，不能制造细粒度边。候选B先做范围解释。 |
| [javierbrea/eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries/tree/0a67877427adb7c9cabd7c63588a07f90f31f973)<br>`0a67877427adb7c9cabd7c63588a07f90f31f973` | 2026-10-23<br>[MIT](https://github.com/javierbrea/eslint-plugin-boundaries/blob/0a67877427adb7c9cabd7c63588a07f90f31f973/LICENSE) | JS/TS imports+element/file/module分类与policies→ESLint诊断。Dependencies.ts evaluatePolicies保留ruleIndex/matchResult，policy message优先于全局message。 | 内部有命中信息，但context.report仅message+node，无稳定外部trace。新exporter侵入上游，不解析文案臆造matched policy。 |
| [fe3dback/go-arch-lint](https://github.com/fe3dback/go-arch-lint/tree/bf473afb033c7c3eb7aba68dc399cf919287131e)<br>`bf473afb033c7c3eb7aba68dc399cf919287131e` | 2026-09-07<br>[MIT](https://github.com/fe3dback/go-arch-lint/blob/bf473afb033c7c3eb7aba68dc399cf919287131e/LICENSE) | Go包/可选静态deep scan+YAML组件/deps→Type=models.Check JSON；source component/file、ResolvedImportName、Reference及NotMatched/DeepScan/OmittedCount/Qualities分开。 | 优先候选A：局部违规见证附盲区。import报告没有target component/命中规则ID；不重演glob规则。deep scan为AST注入关系，不是执行trace。 |
| [gauge-sh/tach](https://github.com/gauge-sh/tach/tree/bc92d71520a1acdb9aacd1f2362ca49b58259dda)<br>`bc92d71520a1acdb9aacd1f2362ca49b58259dda` | 2026-10-06<br>[MIT](https://github.com/gauge-sh/tach/blob/bc92d71520a1acdb9aacd1f2362ca49b58259dda/LICENSE) | Python imports+tach.toml模块/public interface/layers→check诊断、report uses、map JSON或DOT；map分dependencies/dependents方向，支持extra_dependencies。 | map将解析import和配置extra deps并入同一集合，丢逐边来源/行号；不能叫实际调用影响。show --web发送配置，本轮不运行；不推荐新adapter。 |
| [TNG/ArchUnitNET](https://github.com/TNG/ArchUnitNET/tree/f439e0d2e9a45fe9f6a70fea1b05b7c1cbbf465b)<br>`f439e0d2e9a45fe9f6a70fea1b05b7c1cbbf465b` | 2026-10-24<br>[Apache-2.0](https://github.com/TNG/ArchUnitNET/blob/f439e0d2e9a45fe9f6a70fea1b05b7c1cbbf465b/LICENSE) | C#已编译assembly+规则→测试结果；JsonViolationStore按ArchRuleDescription保存Violations字符串ID来Freeze历史违规。 | 描述文本是冻结身份，重复描述报错；baseline不是修复/批准。存储不是逐边JSON报告；不引入.NET字节码导入。 |

## A：一条违规import的见证，旁边保留未检查范围（有条件候选）

固定原始证据：[go-arch-lint test/check/arch1_warnings_json.ct](https://github.com/fe3dback/go-arch-lint/blob/bf473afb033c7c3eb7aba68dc399cf919287131e/test/check/arch1_warnings_json.ct)是一条CLI golden transcript，不是直接JSON文件。其输入为[arch1_warnings.yml](https://github.com/fe3dback/go-arch-lint/blob/bf473afb033c7c3eb7aba68dc399cf919287131e/test/check/project/arch1_warnings.yml)，输出包含：

```json
{
  "Type": "models.Check",
  "Payload": {
    "ArchHasWarnings": true,
    "ArchWarningsDeps": [{
      "ComponentName": "c",
      "FileRelativePath": "/internal/c/c1.go",
      "ResolvedImportName": "github.com/fe3dback/go-arch-lint/test/check/project/internal/a",
      "Reference": {"Valid": true, "Line": 3, "Offset": 8}
    }],
    "OmittedCount": 0,
    "Qualities": [
      {"ID": "component_imports", "Used": true},
      {"ID": "vendor_imports", "Used": true},
      {"ID": "deepscan", "Used": false}
    ]
  }
}
```

上面只是便于阅读的**摘录**，省略了绝对路径、ExecutionWarnings、NotMatched和其他字段，不能冒充上游完整输出。完整golden还列3个NotMatched文件：`internal/c/not_covered/c1nc.go`、`internal/d/not_covered.go`、`internal/not_covered/nc.go`。原始Reference含File、Line、Offset，[internal/models/opr_check.go](https://github.com/fe3dback/go-arch-lint/blob/bf473afb033c7c3eb7aba68dc399cf919287131e/internal/models/opr_check.go)明确JSON可用字段与隐藏字段。FileRelativePath虽名字relative却以`/`开头，不应直接当绝对本机路径打开。

最小用户任务：“哪一个源文件的哪一个import被报告违规？检查还漏了哪些文件/扫描能力？”目前用户须在长JSON的Deps、NotMatched、Qualities、OmittedCount之间找。候选用一条native Architecture边把**源文件→目标import path**放一起，label写“reported forbidden import”，侧栏逐字显示源行和`ComponentName=c`，再完整列出未匹配文件、未启用能力与omitted。目标节点只叫“resolved import path”，不能未经mapping证据标成component a；配置中确有a定义也不授权converter重演匹配器。为何违规的解释只能写“上游报告为违规”；若要展示精确policy原因，需另附带版本/hash的上游结构化rule trace，不能读YAML后自行评判glob。

**与dependency-map区别**：该产物不追求完整依赖图/entry-depth遍历，而把单条报告命中和检查盲区绑在一起。若实际读者看原始三块JSON同样快，局部图没有增加价值，应停止。报告只有一条关系时，表格可能比图更好；不为满足图形产物制造额外节点。

最小可证伪实验：先从官方transcript提取JSON时明确记录SHA/来源、行区间和`derived`，不执行分析器。生成native graph+Explainer和逐记录receipt；读者必须正确答出c1.go:3→internal/a，且不能把3个NotMatched和deepscan=false读为“通过”。新增已知`OmittedCount>0`的**synthetic边界变体**只验证不可称完整，不能冒充真实故障。unknown Type/Qualities/无效Reference应显式拒绝或标不可定位，不能默认line0、扫描全开。deep scan记录有Gate/Dependency/Target三类定位，第一刀暂不收；保留未支持条数并拒绝声称全量支持。

输出必须literal-safe；不把path当HTML/可执行链接、不读取报告里的绝对路径；截图前用派生portable输入明确脱敏，而非修改原始证据。截图1440×1000一屏同时看见违规边与3个未匹配文件/能力标记，390×844验证全路径可展开。输入hash/逐记录索引/原文消息和省略数要可复核。原生图也须public render/finalize；它们通过只说明产物合同通过，不说明规则正确、运行影响或人类收益。

成本：Node离线JSON投影可低，但版本/字段枚举与完整性边界需维护。**仅建议先做可丢弃实验，不接共享Viewer或CLI，不支持自动规则推理；未获得自然用户任务收益前不推动集成。**

## B：把“coverage通过”拆成到底检查了哪类规则（解释候选，图可省）

[Arch-Go report model](https://github.com/arch-go/arch-go/blob/6cb436f84fc8c3800ab9e4f014813c35e871b3d3/internal/reports/model/types.go)保留`coverage.details[{package,contentsRules,dependenciesRules,functionsRules,namingRules,covered}]`；[coverage_resolver.go](https://github.com/arch-go/arch-go/blob/6cb436f84fc8c3800ab9e4f014813c35e871b3d3/internal/reports/coverage_resolver.go)先将module全部packages设false，再从四类verification更新，rate为整数`100*coveredPackages/totalPackages`。因此一个包仅受命名检查，也可能进入coverage分子；不是该包依赖规则已检查，更不是测试执行覆盖。`.arch-go/report.json`由[generator.go](https://github.com/arch-go/arch-go/blob/6cb436f84fc8c3800ab9e4f014813c35e871b3d3/internal/reports/json/generator.go)生成，不是stdout机器JSON。

最小数据直接消费上述report，不扫描Go源码。输出包×规则类型矩阵+原始rate/threshold/pass，区分`dependenciesRules=0`、covered=false、details缺失；不从omitted details推断0。只用已报告字段，不重算项目健康总分。若matrix旁边放局部架构图，节点只标“此报告未记录依赖规则检查”，不标“危险”“违规”或“未测试”。

可证伪任务：“coverage=100且pass时，能否证明依赖方向都受约束？”正确答案由details决定，coverage本身不能证明。用一个明确synthetic的两包报告：一个仅namingRules=1，另一个dependenciesRules=1，都covered=true；同屏显示原率和矩阵，再与原报告JSON/上游HTML比较判断错误率。若现有HTML已经让读者同样直接答出，则不新增产物。此项解释不是此前LCOV/测试覆盖adapter，不把两个分母放同一色阶。

成本低但用户价值待证：原项目已有HTML和JSON；**优先文档说明或Explainer单页，不做通用coverage平台，不必为了图而画边**。

## 其余来源为什么不转为适配器

- [Deptrac JsonOutputFormatter](https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/src/DefaultBehavior/OutputFormatter/JsonOutputFormatter.php)与[expected-json-report_5.json](https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/tests/Supportive/OutputFormatter/data/expected-json-report_5.json)：skipped显示warning、真violation为error、uncovered为warning，Report总计与files.violations不是同一概念。不能把files里名为violations的计数都画红色违规。若做解释仅保留原消息/status，价值可能不够抵消新格式维护。[concepts](https://github.com/deptrac/deptrac/blob/66595d1ca307afff492d99501ffaeba147e848b0/docs/concepts.md)允许skip_violations；skip不证明修复或架构合理。
- [PHPArkitect JsonPrinter](https://github.com/phparkitect/arkitect/blob/40e7427540e416ec3acb10f57fa0f2db46d4ec32/src/CLI/Printer/JsonPrinter.php)只输出error及可选line；[ViolationMessage](https://github.com/phparkitect/arkitect/blob/40e7427540e416ec3acb10f57fa0f2db46d4ec32/src/Rules/ViolationMessage.php)拼接描述。缺target就保留文本，不从“but”拆语义。
- [Boundaries Dependencies.ts](https://github.com/javierbrea/eslint-plugin-boundaries/blob/0a67877427adb7c9cabd7c63588a07f90f31f973/packages/eslint-plugin/src/Rules/Dependencies.ts)确有内部命中信息，但外部报告不是这一结构。除非上游提供稳定trace，不跟随其内部matcher写版本绑定插件。
- [Tach map.rs](https://github.com/gauge-sh/tach/blob/bc92d71520a1acdb9aacd1f2362ca49b58259dda/src/dep_map/map.rs)中process_file将normalized imports和extra_dependencies并入HashSet，build_map可翻为dependents，write_json仅导出map。由此得到的是配置+静态解析混合图，不能声称每条边均实测import。过滤type-checking imports/source roots/exclude/respect_gitignore影响边集合。再转Archify只重复已有dependency-map且更易丢来源，拒绝。
- [ArchUnitNET JsonViolationStore](https://github.com/TNG/ArchUnitNET/blob/f439e0d2e9a45fe9f6a70fea1b05b7c1cbbf465b/ArchUnitNET/Fluent/Freeze/JsonViolationStore.cs)按rule.Description查找/存储，多个相同描述抛错。冻结标识没有稳定边端点；不把baseline的新旧字符串差当Architecture Delta身份。

## 共同证据边界与停止条件

“静态依赖可达”“名称/选择器匹配”“某条规则命中”“被基线跳过”分别陈述，不写成运行触发、故障传播、风险概率或测试必须运行。未解析/未匹配/未启用/被省略/未提供是不同状态；不能统一为0条或通过。规则层关系与实际源码边分开，作者because与机器命中证据分开。

本轮只新增本报告。没有新的自然用户报告证明收益，A/B均不直接进入产品；若原报告或现有HTML足够，保留负面结论。后续获准实验时只读取固定公开报告，先守住原字段和遗漏账目，再考虑画图，不运行陌生配置或构建链。
