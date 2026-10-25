# Round 24：补丁的应用状态、目标文本与比较合同

2026-10-25。四个此前未深入的新来源，**最多保留一个content-only候选：“两个true，为什么结果不是B？”** 用diff-match-patch官方完整测试中的A、期望目标B、另一份应用输入I、官方expected结果E，解释“补丁片段应用成功”与“结果等于最初目标”是不同问题。它不是发现上游缺陷，也不要求先有生产事故；有价值的是读者能正确解释一份具体结果。不接入补丁引擎、不开发parser/求值器、不新增Archify diff模式；普通Explainer code+table足够，默认不加图。

本轮只读固定Git tree、原文件、许可、一级README与测试源码；没有执行上游程序/测试、安装、编译、Git patch或浏览器。所有expected是上游已提交断言，**不是本轮运行收据**。按research工作流，背景agent核两项补丁库及其原件，另两项由主研究核；结果归于本报告，原件和来源清单留在checkout外临时研究目录，不写入产品。

## 先排重：不是再做一份两侧diff

扫描hub README与全部scouts的owner/repo和diff/patch/merge阅读词，并复读 [Round18 structural diff](round18-structural-diff-reading.md)、[PRLens](prlens-smalltools.md)、[Graph comparison](graph-comparison-smalltools.md)、[dev overlap](product-overlap-dev-1731.md)。四个项目名称没有既有深读命中；此为本地字面/相关报告核对，不证明所有历史间接链接都不存在。未按star排序，也没有把大型semantic平台的宣传算实现证据。

| 既有实验/研究 | 本轮避免重复的边界 |
| --- | --- |
| [Line notes](https://github.com/tt-a1i/archify/blob/079d562915a701f8c76b6479e59622432f81ee79/experiments/line-notes/README.md) | 绑定完整固定源码行与作者解释、来回定位，不是patch应用合同；本轮不加另一种注释或源码卡交互。 |
| [Hintful stages](https://github.com/tt-a1i/archify/blob/8d698ceec15a2ea24012135632c4612e5a58e7b5/experiments/hintful-stages/README.md) | named snippet S是patch声明中间文本，非第三Git revision；本轮DMP没有命名S，问题是同patch作用于不同I时的expected E及flags。 |
| [Delta values](https://github.com/tt-a1i/archify/tree/a0a9ba77cb59e3e3a97be0713ca626df63a3234d/experiments/delta-values)、Payload delta | 前者显示既有receipt确实保存的字段前后值，后者显式JSON样本的missing/null/array身份；均不负责执行patch或证明目标文本身份，不给它们引入模糊匹配。 |
| [Task review map / PR1097](https://github.com/tt-a1i/archify/tree/dcedd53856b82d3e403a9651dca0e15840496942/experiments/task-review-map/pr-1097)、PRLens/task-view | 声明与Git hunk覆盖、source引用、未解析ZIP和tests未执行的分层，不是patch状态的字面含义；不另写review工作流或agent verdict。 |
| Difftastic、diffsitter、astdiff、diffmantic、Graphtage、Comby/ast-grep | 已读语法匹配、过滤合同、数组顺序、move/rename推断；本轮不再引语言parser/ASTmatcher，不把字符串编辑叫通用semantic diff或行为保持证明。 |

## 四个固定来源

| 固定来源与实际许可 | 完整官方输入、expected及owning consumer | 独特理解点与取舍 |
| --- | --- | --- |
| [google/diff-match-patch](https://github.com/google/diff-match-patch/tree/62f2e689f498f9c92dbc588c58750addec9b1654) · `62f2e689f498f9c92dbc588c58750addec9b1654` · [Apache-2.0](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/LICENSE) | 完整[test.js](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/tests/diff_match_patch_test.js#L892-L913)39223B含A/B/I/E与exact/partial/failed expected；[patch_apply](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/diff_match_patch_uncompressed.js#L1811-L1914)实际消费patch和text | 成功应用保留I中不同的上下文，E不必等于B。**唯一窄内容候选**，不用移植库。成熟小算法库，不假称新项目或新发现的缺陷。 |
| [kpdecker/jsdiff](https://github.com/kpdecker/jsdiff/tree/e33914cae9fbaf34cd9855c5edd08975867011da) · `e33914cae9fbaf34cd9855c5edd08975867011da` · [BSD-3-Clause](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/LICENSE) | 完整[reverse tests](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/test/patch/reverse.js#L103-L134)6410B内copy输入及expected inverse；[reverse.ts](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/src/patch/reverse.ts#L17-L28)4435B解释缺失信息并实际处理 | reverse一个copy patch不能凭空恢复目的文件全文；输出deletion header不等于可应用inverse。不另做第二份patch页面。 |
| [bhousel/node-diff3](https://github.com/bhousel/node-diff3/tree/8226c27e074909241d72276c21215505a931665f) · `8226c27e074909241d72276c21215505a931665f` · [MIT，含Synchrotron原作者/来源通知](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/LICENSE.md) | 完整[diff3Merge.test.js](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/test/diff3Merge.test.js)5521B内O/A/B及expected；[diff3Merge](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/src/diff3.mjs#L323-L380)实际消费三侧region | 相同两侧编辑可以按选项作为false conflict消除或保留；冲突是具体region/配置结果，不等于代码必错。可教育但不另选内容，避免同时展开多个补丁合同。 |
| [White-Green/semdiff](https://github.com/White-Green/semdiff/tree/65ceeb1f01f1e75c2ad4d632063ad488efe383f2) · `65ceeb1f01f1e75c2ad4d632063ad488efe383f2` · README明示二选一：[Apache-2.0](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/LICENSE-Apache)/[MIT](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/LICENSE-MIT) | 完整[JSON tests](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/crates/semdiff-differ-json/src/tests.rs#L193-L225)9227B内expected/actual/ignore path与断言；[JsonDiffCalculator](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/crates/semdiff-differ-json/src/lib.rs#L73-L112)实际消费文件和配置 | Equal允许ignored difference，但仍保存两侧差值。与已有“比较合同决定投影”/Payload/Graphtage研究较重叠，不引JSONPath引擎。 |

## 唯一候选：两个true，为什么结果不是B？

官方[testPatchApply L892–913](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/tests/diff_match_patch_test.js#L892-L913)先设 `Match_Distance=1000`、`Match_Threshold=0.5`、`Patch_DeleteThreshold=0.5`，以A/B调用patch_make，再将同一patch应用到不同I。下面是该测试中完整literal的角色表，不是四个独立Git文件，不伪造四个path/revision/sourcehash：

| 角色 | 完整decoded字符串 | 字节数/本轮地位 |
| --- | --- | --- |
| A：生成补丁的基准 | `The quick brown fox jumps over the lazy dog.` | 44B，官方测试literal，无末尾LF |
| B：生成补丁的目标 | `That quick brown fox jumped over a lazy dog.` | 44B，官方测试literal，无末尾LF |
| I：另一次应用的输入 | `The quick red rabbit jumps over the tired tiger.` | 48B，官方测试literal，无末尾LF |
| E：该次官方expected输出 | `That quick red rabbit jumped over a tired tiger.` | 48B，expected，非本轮执行结果 |
| 该次官方expected flags | `[true, true]` | 应用状态，不是E===B断言 |

E保留I里的`red rabbit`和`tired tiger`，同时接受patch要改的`The→That`、`jumps→jumped`、`the→a`。读者能从原文直接看出E与B不同；**这不是bug，也不是“模糊算法证明两程序等价”**。库处理字符串，不知道fox/rabbit或代码的业务意义。

[owning implementation](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/diff_match_patch_uncompressed.js#L1819-L1914)深拷贝、padding、splitMax，再按expected位置和前段delta找match；完全匹配直接替换，不完全匹配用diff_xIndex将编辑投向I。results在split之后按片段写true/false，因此一般不能把布尔下标直接等同用户原始hunk或文件下标，更不是最终文件相等/可编译/正确的证明。

同一完整test的[testPatchMake L799–810](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/tests/diff_match_patch_test.js#L799-L810)另给相同A/B的serialized expectedPatch：decoded94B，SHA-256 `124efbe2874a6ad8972ec8c8531e22d3710175b467975c2d4bf3677889113249`。它**是另一个测试内的expected字符串，非独立已提交.patch文件，也非本轮输出**。若内容页需要展开，应从固定literal提取并保留context尾空格与末尾LF；DMP header是字符范围，不标成Git统一diff的行号。最小页面可以省略patch正文，展示调用和4角色表已经足够。

### 实施边界：仅内容，不改比较器

一页现有Explainer，首屏回答“两个true只报告片段应用；结果仍保留异文输入的上下文”。主内容是四角色表、完整测试调用/expected和consumer的匹配分支SourceCard。默认无Workflow：这里不是A→B→I→E真实编辑时间线，也没有第三个Git revision；串成四节点容易误导。

完整保留原test、uncompressed consumer、runner HTML和LICENSE；原HTML harness说明后续测试依赖先前测试，不把剪出的case宣称为独立可运行验证。代码块行号绑定原文件，不把摘录hash代替完整blobhash，不把提取literal包装成独立上游文件。本轮只提案，尚未生成页面/renderer收据或截图。后续如获实施授权，审计只核固定原bytes、四literal/flags、引用范围、嵌入呈现，不复刻算法expected；页面使用正常公共CLI，明确“上游断言未在本轮执行”，实际gates与视觉各自记录。

另有[完全失败](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/tests/diff_match_patch_test.js#L910-L912)expected保留该失败case自身输入字符串（`I am the very model of a modern major general.`）+[false,false]和[另一长例部分成功](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/tests/diff_match_patch_test.js#L918-L922)的[false,true]。不将别的长输入/参数拼入这条成功链，也不画整个文件pass：API不是全有或全无事务。为保持读者任务单一，最初内容可仅脚注这些边界。

**与已有实验的独立增量：** Hintful区分patch声明的S与Git文件事实；这里区分“片段被应用”和“产物等于原目标B”。Delta展示receipt已有值，无法自动回答一个库的success语义；task-review的coverage不等于执行，而本例更具体地解释了为什么即使所有flags true也不宣称目标身份。需要的是一次合同阅读，不是加警告、fuzzy模式或patch importer。预期能避免把flags误读成目标相等，尚无用户效率数据。若现有纯Markdown表已足够，停止在内容；若实现需要运行上游、制造通用patch evaluator或强加新schema，停止不做。

## 其余三项：保留正面机制，不再开实验

**jsdiff：反向变换需要哪些信息。** 官方[copy tests L103–134](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/test/patch/reverse.js#L103-L134)有完整copy patch与expected inverse，含有hunk和无hunk两个case；[reverse.ts L73–99](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/src/patch/reverse.ts#L73-L99)将copy目的地作为待删old、新侧/dev/null并清空hunks。它不能从部分原copy差异恢复整个目的文件，故只给deleted file mode；源码注释明说通常会被git apply拒绝。这里没有本轮真实git apply失败收据。普通替换的[反向再apply expected](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/test/patch/reverse.js#L10-L27)能回file1，也不能将copy限制泛化成所有reverse失效。它是有意义的信息完整性问题，但与本轮DMP同为patch合同教学，不再选第二份相近内容。

另读[apply tests](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/test/patch/apply.js#L528-L546)：fuzzFactor99也不能删除不存在的bar；[apply.ts](https://github.com/kpdecker/jsdiff/blob/e33914cae9fbaf34cd9855c5edd08975867011da/src/patch/apply.ts#L270-L309)的匹配限制与任一hunk不fit返回false，不等同DMP的逐片段结果。不要把两个库的状态合同混拼。未运行JS/TS或Git。

**node-diff3：同样两侧文本的分类取决于三侧与选项。** 官方[false conflict tests L101–127](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/test/diff3Merge.test.js#L101-L127)完整O=`AA ZZ`，A=B=`AA a b c ZZ`：默认expected一个ok数组；设置excludeFalseConflicts=false则expected两侧相同的a/b/c冲突区。consumer在[diff3Merge L329–375](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/src/diff3.mjs#L329-L375)默认按空白拆字符串，严格比较两侧region的元素序列以消除false conflict。这是上游术语，不是说真实作者有冲突或程序行为等价。

完整[相邻两行YAML case](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/test/diff3Merge.test.js#L142-L158)中A只改description、B只改title，但按换行分割的expected是包含两行的同一conflict region；它提醒读者“不同修改行”不自动保证此算法无冲突。不能据此说YAML语义不可合并或本轮已执行merge。另[mergeDigIn expected](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/test/mergeDigIn.test.js#L21-L54)将冲突区两侧再作共同/差异拆分；不同展示边界不是另一段真实历史。纯表可解释，但为避免再建合并平台/多候选，本轮不实施。

**semdiff：Equal仍可保留差值。** [JSON test L194–210](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/crates/semdiff-differ-json/src/tests.rs#L194-L210)完整expected `{stable:true, volatile:1}` / actual `{stable:true, volatile:2}` 与ignore path `$.volatile`：断言全行is_equal_for_result，同时ignored行两侧仍分别显示1/2。consumer将Ignored与Unchanged都计入[相等判定](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/crates/semdiff-differ-json/src/lib.rs#L155-L163)，但[Equal body保留ignored_lines](https://github.com/White-Green/semdiff/blob/65ceeb1f01f1e75c2ad4d632063ad488efe383f2/crates/semdiff-differ-json/src/lib.rs#L96-L112)。这是一种诚实的“按合同忽略但仍可审计”设计，不是零变化。另完整sample_data expected/actual modified.json各75B已读，但没有把sample目录的expected角色与上面unit assertion混称同一fixture；本报告主证据是完整unit test literal。该主题已接近Graphtage比较合同与Payload差值边界，当前不接JSONPath求值器或另做ignored status系统。

## 原始证据与指纹

原meta/tree、完整原文件、标准库提取literal的派生记录均留在checkout外；主研究15件、背景研究13件完整原件对固定tree Git blob逐项核同。只读test runner不是运行runner；提取/哈希脚本不调用上游patch/merge函数。另初筛randlee/roslyn-diff只取得tree/metadata，未深读consumer，不算第五个完成项目，也不作为候选。

| 项目 / 完整文件 | bytes | SHA-256 |
| --- | ---: | --- |
| DMP `LICENSE` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| DMP `javascript/tests/diff_match_patch_test.js` | 39223 | `8fa7cd7c9c3681cace8dc0d50a68a694b57ad1fd5c5d322b4a957de2bc017a8c` |
| DMP `javascript/diff_match_patch_uncompressed.js` | 78511 | `9a79cf031ac7c2e366416181051acb3e6d2cacf79c5354148f4c71ea20c7e4a3` |
| jsdiff `LICENSE` | 1546 | `eda81a415869e67809f6a9f3fd6056062cb83a462118e07eec5e92b2e0c40ce9` |
| jsdiff `test/patch/reverse.js` | 6410 | `c931be98884d4a4db27215a8d2c47f26d3aa2870353952c121a834fca7312ab9` |
| jsdiff `src/patch/reverse.ts` | 4435 | `593c8ac1d118d380054fdfddb19cb7619e7aa9629f899425308f9bce8b8c3dab` |
| node-diff3 `LICENSE.md` | 1449 | `91b143397ff4e7ae81fcedec96140607189c620bda4fbb85882534922fab0965` |
| node-diff3 `test/diff3Merge.test.js` | 5521 | `868705582c6f378145b21b1cf70a0f1492756ccca3d309e12a84a12b09892f0c` |
| node-diff3 `src/diff3.mjs` | 15276 | `91c4048e99cb1aa7081eeab8304d765ea439151dadaf0d71daf780f4d2cdd013` |
| semdiff `LICENSE-Apache` | 11357 | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| semdiff `LICENSE-MIT` | 1068 | `9f6d267906688c7d7aa54b74fffd2e201ee63c486c7a53d74877daf0cadb5f10` |
| semdiff `crates/semdiff-differ-json/src/tests.rs` | 9227 | `d4b49b96b83fdee8c3bbf6e11f23a30e3ee63cd918620ec45724a56622030374` |
| semdiff `crates/semdiff-differ-json/src/lib.rs` | 39735 | `a5c49777cff59fcd93675537ada45c333c3e50c51bac81f8eca2fd790e811d5b` |

未运行不可信代码、上游测试、renderer、浏览器或安装；没有通用semantic/重构等价、编译、部署、真实用户收益或性能结论。本轮唯一仓库写入是本报告，不改hub README、产品、既有实验或他人文件，不commit/push；所有源码结论仅对应表内固定revision。
