# Grammar reading：树、冲突与失败位置分别是什么证据

2026-10-25，只读研究。开始时对本目录29份scout报告抽取279个唯一GitHub owner/repo排重；下列6个来源此前均未列入（Nearley的实际仓库是`kach/nearley`）。不按star选择。未安装或运行上游parser、grammar action、测试、生成器、图形界面或用户代码；以下结果均来自固定提交的源码、文档和已提交expected，不是本次解析记录。

结论：**不建议新增产品实现、parser importer或grammar schema。** 最值得保留的是“同一输入的两棵推导树”与“只能给出两个不同后缀的冲突例”之间的区别；现有Tree＋Explainer足以表达。若需要继续，最多做一个固定内容阅读对照，先验证普通原文是否已足够清楚。最远失败位置的显示已与authoring-diagnostics方向重叠，不再开一套错误Viewer。

## 六个新来源：固定版本、许可与实际机制

固定的是本次读取的commit，不宣称最新发布版；许可按对应快照文件判断。

| 来源 / revision / 许可 | 一手机制与可核实输入输出 | 借鉴与限制 |
| --- | --- | --- |
| [Peggy](https://github.com/peggyjs/peggy/tree/643957df9cfd539ccaac18f800c8fd1a80f58e0f) · `643957df9cfd539ccaac18f800c8fd1a80f58e0f` · [MIT](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/LICENSE) | [生成parser的行为测试](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/test/behavior/generated-parser-behavior.spec.js#L2908-L2993)保存右端失败、expected类型、found及消息的断言；[tracer测试](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/test/api/generated-parser-api.spec.js#L114-L174)是有序`rule.enter/rule.fail/rule.match`，含rule、输入location及可选result。 | 失败位置旁保留生产者expected，而不是只有红色。trace含失败尝试，不能画成最终parse tree或程序调用事实；semantic action可能执行JS，拒绝在Archify中接入运行器。 |
| [Ohm](https://github.com/ohmjs/ohm/tree/43c345b920c98b3eb13ce6b12df2b6ebd400b63b) · `43c345b920c98b3eb13ce6b12df2b6ebd400b63b` · [MIT](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/LICENSE) | [失败fixture](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/test/test-errors.js#L19-L41)有grammar、输入、精确消息和rightmost offset；[Trace](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/src/Trace.js#L56-L67)保留输入区间、expr、bindings、children、成功标记；[toAST测试](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/test/extras/test-toAST.js#L24-L86)对同一match给出不同mapping的AST。 | 输入匹配区间、语法规则来源和AST投影是三层证据。可以并排读，不能仅用同一rule名称猜源行，或把CST删去的符号说成未匹配。 |
| [Nearley](https://github.com/kach/nearley/tree/96f1da12acdb986e8279355d3d34cf5b139ab268) · `96f1da12acdb986e8279355d3d34cf5b139ab268` · [MIT](https://github.com/kach/nearley/blob/96f1da12acdb986e8279355d3d34cf5b139ab268/LICENSE.txt) | [parser文档](https://github.com/kach/nearley/blob/96f1da12acdb986e8279355d3d34cf5b139ab268/docs/md/parser.md#L39-L67)的results为可能解析结果数组，用`xyz`两种切分解释歧义；[grammar文档](https://github.com/kach/nearley/blob/96f1da12acdb986e8279355d3d34cf5b139ab268/docs/md/grammar.md#L65-L99)说明默认嵌套数组及postprocessor返回自定义对象。 | 多个结果与一个结果的多children不能混同；results元素可能已是任意postprocessor值，不是带完整token和源跨度的CST。拒绝执行postprocessor来取得可视化输入。 |
| [Lark](https://github.com/lark-parser/lark/tree/9a4fb9c7458e8155636773a3cded0016d52516da) · `9a4fb9c7458e8155636773a3cded0016d52516da` · [MIT](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/LICENSE) | [fruitflies.py](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/examples/fruitflies.py#L13-L58)提交了grammar、输入和`_ambig`下两棵树的注释expected；[树构造规则](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/docs/tree_construction.md#L16-L40)说明默认过滤标点；[冲突文档](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/docs/how_to_use.md#L77-L109)区分默认shift、debug告警和strict拒绝。 | 同一终结符可因lexing、grammar配置、过滤而在输出树中不同。接受grammar不等于无冲突，默认shift不是消除了歧义；此处没有运行注释中的示例。 |
| [Jison](https://github.com/zaach/jison/tree/cbf9d933677fb14b8526ee146586348139e2fb73) · `cbf9d933677fb14b8526ee146586348139e2fb73` · [package.json声明MIT](https://github.com/zaach/jison/blob/cbf9d933677fb14b8526ee146586348139e2fb73/package.json#L1-L6) | [reduce_conflict.jison](https://github.com/zaach/jison/blob/cbf9d933677fb14b8526ee146586348139e2fb73/examples/reduce_conflict.jison)的文件说明限定LR(1)与其它构造；[表构建代码](https://github.com/zaach/jison/blob/cbf9d933677fb14b8526ee146586348139e2fb73/lib/jison.js#L816-L845)按state和lookahead检查action、保存resolution并在默认消解时计conflict。 | 读“在哪个state、哪个lookahead、哪两个action”比单一冲突总数有用。但该grammar文件不是已运行的冲突receipt，不能自己补状态号或警告输出。此快照仅核到package许可声明，不将缺少独立根LICENSE当复制许可文本齐全。 |
| [GNU Bison](https://github.com/akimd/bison/tree/25b3d0e1a3f97a33615099e4b211f3953990c203) · `25b3d0e1a3f97a33615099e4b211f3953990c203` · [本次fixture明确GPL-3.0-or-later](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/tests/counterexample.at#L3-L16) | [counterexample.at](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/tests/counterexample.at#L43-L75)保存grammar和stderr expected，含冲突token、共同Example、Shift/Reduce derivation及产生式编号；[测试宏](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/tests/counterexample.at#L20-L35)核对`-Wcounterexamples`输出。 | 两棵树与共同token串的对应最有阅读价值。不复制GPL实现到MIT runtime；fixture也不是生成parser skeleton的例外许可对象。若保留其文件做内容实验，须随附原许可、来源及适用范围，不能只套实验根MIT。 |

## 深读一：Bison为什么不把所有冲突都叫歧义

[Unifying S/R fixture](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/tests/counterexample.at#L43-L75)的expected把lookahead标为B，冲突点位于A之后。两份推导都得到终结符串ABC：Shift分支先将AB归入y，再接c；Reduce分支先把A规约为a，再接产生BC的x。产生式编号及各自树形均有expected依据，而非本研究根据“1个conflict”补画。

完整`tests/counterexample.at`本次只读取得29,443 bytes，SHA-256为`f7e03ccff615df0eacbbd31edad7400f964e722a991238f648f529d9ec4b64fc`。原expected还包含某条规则因冲突而在生成parser中无用的警告；它也应保留。语法有两种推导，不表示默认消解后的parser实际会返回两份结果。

这能支持“同一输入有两种推导”的解释，但不支持一条实际parser运行轨迹。fixture没有给完整LR状态号、item set、ACTION/GOTO表或解析栈；图中不能创造这些字段。点是输入串中的冲突位置，rule编号是这份grammar内身份，不是全仓稳定ID；输入B作为lookahead也不是一条已消费token事件。

对照[Non-unifying Unambiguous S/R](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/tests/counterexample.at#L250-L290)：生产者为两种选择列出不同的完整后缀。它说明当前决定需要的信息不足，不能作为“同一完整输入有两种解析”的证据。[手册相邻说明](https://github.com/akimd/bison/blob/25b3d0e1a3f97a33615099e4b211f3953990c203/doc/bison.texi#L10348-L10423)进一步区分需要更多lookahead、LR与LALR等情形。因此不能用一个红色“ambiguous”徽章统一所有冲突，也不能用默认shift当作修复完成。

以上是仓库提交的测试及expected；测试宏虽把生成器stderr纳入比对，本轮没有运行它，未验证当前机器上的生成结果或测试通过情况。它是上游教学/回归fixture，不是用户工作负载。

## 深读二：Peggy与Ohm的失败位置不是“应修改的位置”

Peggy的[右端失败测试](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/test/behavior/generated-parser-behavior.spec.js#L2908-L2915)让第一分支在较早位置失败、第二分支走得更远；expected只保留后者要求的字面项。合理的小阅读动作是显示输入中相应位置，再列“生产者在此报告的预期项”，同时保留分支尝试与最终错误的区别。这个测试没有逐事件trace，不能据此伪造一份trace receipt。

同文件的[named expression测试](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/test/behavior/generated-parser-behavior.spec.js#L218-L240)会用描述型`other` expectation代替内部项；[EOF测试](https://github.com/peggyjs/peggy/blob/643957df9cfd539ccaac18f800c8fd1a80f58e0f/test/behavior/generated-parser-behavior.spec.js#L2949-L2960)把found=null用于输入结束。展示时不能把描述当terminal枚举，也不能把null改写为“未知字符”。

Ohm的[最小失败fixture](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/test/test-errors.js#L19-L41)明确绑定grammar、输入、消息与offset：较短输入结束后期待下一项；另一个输入则已经匹配grammar，却因剩余输入而期待EOF。两种失败都需要保留。更细的[arithmetic fixture](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/test/test-errors.js#L273-L303)还区分完整rightmost failures集合与过滤后的non-fluffy项；只读人类消息不能还原全部失败集合。

这些字段都不证明用户的原意。最远失败点不等于最早写错处，expected不是自动修复候选的完备集合，更不是一定成功的替换建议。输入offset/line/column应按producer坐标单位保留；不能把JavaScript字符串offset无说明当UTF-8字节。该坐标指向待解析输入，也不能拿来链接grammar文件同一行。

## 深读三：CST、AST、尝试trace不能用一种“语法树”混装

Ohm的[toAST回归](https://github.com/ohmjs/ohm/blob/43c345b920c98b3eb13ce6b12df2b6ebd400b63b/packages/ohm-js/test/extras/test-toAST.js#L24-L86)对同一加法match展示默认数字键、命名字段、显式保留运算符及删除字段的mapping。这是明确的投影：AST少了某符号，不代表CST未匹配它，更不代表原始源码没有它。缺少某可选项时的null也由该mapping合同定义，不能套用Peggy EOF的null语义。

Lark的[fruitflies fixture](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/examples/fruitflies.py#L13-L58)有同一自然语言短句的两棵预期树，能解释词性分配差异；但[默认tree构造](https://github.com/lark-parser/lark/blob/9a4fb9c7458e8155636773a3cded0016d52516da/docs/tree_construction.md#L16-L40)过滤部分终结符。因此把图称“按该producer配置生成的parse tree”比“完整源码AST”准确。Nearley的postprocessor又可把匹配数组变成任意值；没有源跨度/grammar引用的结果对象，不能反推完整推导。

规则→源行的最低合同是固定grammar文件内容、规则 occurrence和生产者给出的grammar区间，或作者逐行核对的显式映射。Peggy tracer的rule名和输入location并不满足这一合同；Ohm Trace的input interval也不是grammar line。宏展开、重复规则名、导入与生成规则尤其不能只按名字搜索猜线。首版可以只给固定源链接，不需要自动source mapper。

## 与Archify现有能力及工作排重

基准仍是`82c7e0f089a02a4d514714adf37dc2061682da5f`。[Tree schema](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/schemas/tree.schema.json)已有单parent层级及source引用；[Explainer authoring](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/archify/references/explainer-authoring.md)已有原生图引用、literal fence、固定源链接和代码摘录。单棵有限推导树不需要新renderer。歧义forest若共享子树是DAG，不能硬塞为一棵单parent Tree；固定两棵树可以分别表达，不声称保留完整packed forest或指数数量的结果。

既有`text-diagrams`已覆盖railroad diagrams；`source-question-tour`已验证固定源码卡；`authoring-diagnostics-smalltools`已有“显示生产者实际给出的subject位置”；`symbol-evidence`已区分源码位置与执行证据。这里不再把铁路图、SourceCard、错误红线或规则名列表当作新产品方向。

本次只读检索open issues/PR的grammar/parser/AST/conflict关键词；检索结果包括[Explainer heading parser崩溃#1083](https://github.com/tt-a1i/archify/issues/1083)及[对应修复#1088](https://github.com/tt-a1i/archify/pull/1088)，是现有文稿parser正确性，不能拿来为通用grammar工具授权。既有[Mermaid flowchart importer #140](https://github.com/tt-a1i/archify/pull/140)和[sequence importer #387](https://github.com/tt-a1i/archify/pull/387)也有各自格式范围；本研究不扩展它们。关键词检索不是所有工作无重叠的保证。

## 唯一条件候选：冲突证据是否真是同一个完整输入

**当前不实施。** 若继续，使用上述Bison两个已提交fixture，题目固定为“这里证明了歧义，还是只展示了当前lookahead下的选择冲突？”baseline完整保留原grammar与stderr expected；candidate只增加两棵原生Tree及并排表，保留共同/不同token串、冲突点、lookahead、产生式编号和固定grammar行链接。原ASCII expected不能被“更漂亮”的树替换掉。

读入只允许作者预先挑选、固定SHA的纯文本与手工核对映射，不提供任意grammar上传、parser或action执行、自动冲突求解、运行栈动画、修复按钮。不给没有上游记录的state号、时间、用户错误率或性能结论。GPL fixture若复制须有独立原许可与范围说明；若无法处理其分发边界，则停止该候选，而不是换成无许可标识的摘录。

验收用固定输入，1440×1000、同theme与相同字体条件拍baseline/candidate：两棵树的叶子按序必须与各自expected串一致；共同例能看出同一ABC，非统一例不得被标成同一输入歧义；lookahead不能被误画成已经消费。源行/片段hash逐项核对，未知state/stack必须不出现。实际render/finalize与浏览器截图分开记录；截图可证明排版和标签，不能证明生成器运行或人类理解收益。若原文加一张表已经同样清楚，则不保留图。

成本：固定内容审计低至中，主要是两份推导及许可核对；产品维护成本只有不引入运行器时才低。通用parse forest、LR item浏览器、grammar-source自动映射、UTF位置协调及可执行semantic actions的成本显著更高，本轮没有相称用户证据。最远失败点样例和CST→AST投影可以作为作者知识，暂不再开第二/第三个实验。

## 完成范围

仅新增本报告；没有复制实现源码、生成HTML/截图、运行上游或全仓测试、修改README/gallery/runtime、commit或push。来源与fixture阅读由Codex完成，其中Bison固定fixture/许可/expected由一个只读后台agent独立深读；作者本人核对了其结论及相邻反例。现阶段产品实现推荐为零，固定内容实验仅是上述附条件候选，不称已证明有收益。
