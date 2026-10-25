# Round21：符号候选、插件筛选与查询结果的证据层

结论：本轮5个新来源中，**最多保留一个Stevedore内容候选**：最终enabled列表不等于执行前筛选。现有Explainer＋一条条件源码流程已足够；不建议再做符号解析器、插件扫描器、查询平台或共享Viewer新功能。Jedi候选集合很具体，但与刚完成Static uses内容相邻，不再为它单开实验。

## 范围与当前状态

已读研究中心README（当前42实验、gallery仍是39项独立快照）及现有scouts，检索候选owner/name，排除已覆盖的pyan、code2flow、Grimp、pydeps、ast-grep、SCIP、Callscope、Twoslash等。以下5个仓库未在已有scouts深入；没有查询stars或据此排序。

本轮用只读`git ls-remote <官方GitHub仓库> HEAD`取得完整SHA，再下载该SHA源码到checkout外读取README、完整根许可、owning source和tests；不是使用移动main链接作证。Archify远端`refs/heads/dev`实际仍为`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。不把实验分支候选已推送当dev已集成，不重查或臆测相关旧PR状态。

没有执行任何第三方仓库程序、安装/构建/测试/插件加载、索引或浏览器。本轮只写本报告；上游断言是提交中的expected，不是本轮观测结果。所有下述“先/后”若来自代码，均是源码控制顺序，不是运行时间戳。

## 5个固定来源及机制

| 来源／完整commit／根许可 | 输入、consumer与输出合同 | 可借鉴／拒绝边界 |
| --- | --- | --- |
| [davidhalter/jedi `c7ceec72f1876b9f69482fe9427f8fea4c1e5220`](https://github.com/davidhalter/jedi/tree/c7ceec72f1876b9f69482fe9427f8fea4c1e5220)；[MIT](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/LICENSE.txt) | Python source＋光标位置→Script.infer/goto返回Name列表；test/test_api/test_api.py::test_no_statement_parent给完整短source与两个description的完整expected。 | 保留候选集合、definition/inference与follow_imports参数；结果列表不是唯一运行目标或调用已发生。与Static uses相邻，不选第二个内容原型。 |
| [pytest-dev/pluggy `ba2eaa2f76ce1882f34f9d1f4a47406bd985f633`](https://github.com/pytest-dev/pluggy/tree/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633)；[MIT](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/LICENSE) | PluginManager注册/阻止/解除阻止→registry与hook实现集合；testing/test_pluginmanager.py::test_set_blocked逐步断言get_plugins/is_registered/is_blocked。 | 同名槽位为None可表示blocked，不等同于未见过；unregister blocked name仍blocked，unblock才移除哨兵。可借鉴状态账目，不把registry列表画成hook已调用。 |
| [openstack/stevedore `849be420e44d47218156adec6ccd9bfa77c4659e`](https://github.com/openstack/stevedore/tree/849be420e44d47218156adec6ccd9bfa77c4659e)；[Apache-2.0](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/LICENSE) | entry-point namespace＋check_func＋invoke_on_load→EnabledExtensionManager.extensions/names；tests/test_enabled.py完整consumer期待只返回t2。 | enabled过滤发生在父loader之后，且invoke_on_load=True时构造早于check。最有价值的条件内容候选，见下；不加载真实插件。 |
| [google/importlab `9751bfc27d5bde83b117c85eee48cb9b6cc0d652`](https://github.com/google/importlab/tree/9751bfc27d5bde83b117c85eee48cb9b6cc0d652)；[Apache-2.0](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/LICENSE) | AST import statements＋环境解析→resolved/unresolved graph；tests/test_graph.py::FakeImportGraph/SIMPLE_DEPS有完整stub输入，实际graph consumer断言unresolved。 | 未解析不等于不存在；find_spec可能抛任意异常，代码降为unresolved。它不是只读纯源码算法：import_finder需子进程/Python环境解析；不集成第二个import扫描器。 |
| [livegrep/livegrep `923d5ad71dfe60900e6c2017b2fa4a5ff902ad71`](https://github.com/livegrep/livegrep/tree/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71)；[BSD-2-Clause](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/COPYING) | regex/query＋index→SearchResult含tree/version/path/line/context/bounds，SearchStats另有结束原因；web MatchView将命中与前后文分别渲染。 | 同文件多命中可按上下文裁重，但保命中位置；结果计数非完整时加“+”，不谎称全量。只借界面完整性提示，不重做Archify Finder或部署搜索服务。 |

## 可核链①：Jedi的一次查询可以返回两个候选

完整fixture与consumer在[test/test_api/test_api.py](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/test/test_api/test_api.py) `test_no_statement_parent`：source声明一个函数f、一个class C，条件表达式把其中一个赋给variable；随后对source指定列调用`infer`，按line排序后assertEqual description列表恰为两个候选。对应[jedi/api/__init__.py](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/jedi/api/__init__.py)的`infer` L217–260将推断values转Name，并在API层set去重、排序；`goto` L263起另有follow_imports/follow_builtin_imports参数。

这份完整短fixture的重要边界：条件中的random名称没有在source里导入；它不是一份本轮可执行程序或已采样随机选择记录。expected里的两个候选说明推断API结果，不能变成两次调用、概率各半、某个实际分支。consumer还排序了结果，所以列表位置不是“最可能目标”或解析器的confidence排名。

阅读机制：同一次query把候选并列，每项保留definition位置/类型和query参数，而不是把第一项高亮成唯一callee。Archify已有表、snippet、来源位置及局部图可表达这种并列；Finder的同名节点ID/上下文描述解决的是找已编写节点，不是语义解析。没有理由让它自动解析Python或为所有图引入ambiguous状态。

## 可核链②：Stevedore的最终过滤列表不是加载前门槛

固定[stevedore/tests/test_enabled.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/tests/test_enabled.py)的`test_enabled`和`test_enabled_after_load`均提供完整consumer：namespace为stevedore.test.extension，invoke_on_load=True，参数a/B，check只接受名称t2；完整expected为len(extensions)=1、names仅t2。后者check还读取ext.obj，明确对象存在后再判。测试第一个check的参数虽名为ep，实际收到的是Extension，不要与metadata EntryPoint混称。

输入声明在[pyproject.toml](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/pyproject.toml) L38–42：t1/t2都指向FauxExtension，e1指向BrokenExtension，e2指向未找到模块；[stevedore/tests/test_extension.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/tests/test_extension.py)定义FauxExtension只保存args/kwds，BrokenExtension构造器抛OSError。测试通过安装环境取得该namespace，不是提交了一份完整实跑entry-point清单/执行日志；本轮不声称当前机器安装或加载了这四项。

owning [stevedore/enabled.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/enabled.py) `_load_one_plugin` L90–103先调用super，再执行check_func；父类[stevedore/extension.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/extension.py) L329–341先ep.load，invoke_on_load=True才调用plugin参数，最后构造Extension返回。父`_load_plugins` L290–320按entry遍历并仅append非空返回值；普通异常进入failure callback或日志，KeyboardInterrupt/AssertionError重抛。

因此可以按条件代码路径作下表，不需要执行插件，也不伪造每项观测：

| 条件／对象 | 源码支持的边界 | 官方expected能单独证明什么 |
| --- | --- | --- |
| 一个entry point成功load，invoke_on_load=True | 先调用plugin，再运行check_func | expected不是构造调用次数日志 |
| 成功构造的t1 Extension | 名称check会拒绝加入最终列表 | 不能由最终无t1推断此前从未加载／尝试构造 |
| 成功构造的t2 Extension | 名称check接受后才进入extensions | 两测试最终名单只含t2 |
| load或构造抛异常 | 无法走到其后的check；父loader处理异常 | 单项缺席不能区分异常和check拒绝 |
| t1/t2指同一class路径 | 声明目标文本相同，名字仍不同 | 不证明同一个运行实例，也不是别名对象观测 |

这不是安全漏洞判定；只是这个callback在合同中的执行位置。也不把“源码会调用”称本次确已调用。插件间遍历顺序来自环境metadata，不按pyproject文本行顺序发明时间线；源码for循环也不表示并发。

## 另外三项为什么不实施

**Pluggy：** [src/pluggy/_manager.py](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/src/pluggy/_manager.py) `set_blocked` L323–327先unregister，再在_name2plugin写None；register L183–212对blocked返回None，list_name_plugin L556–558直接返回items。[testing/test_pluginmanager.py](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/testing/test_pluginmanager.py) L105–136完整测试里，被阻止名字上的unregister不会解除阻止，unblock才解除。这个机制能提醒registry视图不要只看get_plugins就误报“没有注册历史”；但本fixture没有hook调用，给它再做Lifecycle会重叠State contract与普通状态表，收益不足。

**Importlab：** [tests/test_graph.py](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/tests/test_graph.py) L16–57的FakeImportGraph与SIMPLE_DEPS明确是stub，不是采集；同文件测试断言unresolved含e。[importlab/import_finder.py](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/importlab/import_finder.py) `visit_Import/ImportFrom`只收相应AST语法，Python3 resolve用find_spec，异常返回None；任意动态import字符串或插件注册不由这个visitor自动产生边。未解析原因可能是环境/异常，不能写成已确认不存在模块。与Dependency map既有unknown/未解析/视图外账目重叠，重建scanner增加环境与执行成本，不推荐。

**Livegrep：** [src/proto/livegrep.proto](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/src/proto/livegrep.proto)区分SearchResult、FileResult、SearchStats；后者结束原因含TIMEOUT/MATCH_LIMIT，响应还给index_name/index_time。[web/src/codesearch/codesearch_ui.js](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/web/src/codesearch/codesearch_ui.js) L175–200分别构造context与match，L756–766统计命中，why非NONE则加“+”。小UI事实有价值：上下文不是额外命中、N+不是完整N。bounds的编码单位本轮未核，不直接转作Archify源码列。[client/test/integration_test.go](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/client/test/integration_test.go)需test.repo并建立索引，对patterns运行比较；未给test.repo会skip，不把patterns文件称完整固定输出oracle。运行服务/索引代价大，现有Finder/Code snippets无需接入它；不制造synthetic命中来凑实验。

## 唯一候选：过滤名单为何不等于执行前筛选

若维护者认为这个插件阅读问题值得展示，只做独立content-only候选，不复制loader或导入metadata。保完整test_enabled.py、enabled.py、extension.py、test_extension.py、pyproject与许可，固定同commit；官方expected与源码推断表分两栏，不生成“本轮插件运行记录”。

可用现有Explainer三个小块：官方consumer＋完整expected；**单个entry point**条件路径（load→可选invoke→check→append/ignore）；声明与最终名单之间的信息缺口表。借现有Workflow可显示源码分支，但不画四插件并发或时间泳道，不输出calls/spans/durations。若一张表已经说清，就不加图。没有新增diagram_type、parser、注册表采集器或共享Viewer改动。

可证伪任务：读者看到expected只有t2时，能否正确回答“t1没出现是否证明它从未被加载/构造？”答案不能；检查位置在父loader之后。再问“e1和t1缺席是否同一原因？”也不能只由names列表作答；必须回到loader异常与check拒绝两条路径。第三问“本轮实际加载了几次？”应回答未运行、没有这项观测，不能从源码补数字。

相比Static uses，这里不是静态图保留不可执行分支，而是**一个运行期API的返回集合，只保留后处理结果，抹不掉此前可能完成的动作**。相比Config origins，不是值来源覆盖；相比State contract，不是两个observed事件是否声明，而是discovery/load/invoke/filter四层合同。收益仍是候选假设，没有读者效率或真实插件运行验证。

最小验证若获批：完整源/许可hash、consumer expected逐字、流程节点全部标“源码条件顺序”、公开页面无本机路径；常规render/finalize只针对内容。Root实际截图单列，不能拿静态gates宣称UI/人类验收。当前尚未实现，不为保持分支数量立即开工。

## 完整文件字节账目

以下SHA是本轮读到的完整源文件，不是运行回执。根许可只说明该仓库文本声明，未扩大覆盖外部Python分发、插件或依赖实现。

| 来源 | 完整固定文件 | bytes | SHA-256 |
| --- | --- | --- | --- |
| jedi | [LICENSE.txt](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/LICENSE.txt) | 1241 | `78e60cd0b8f28694f30195482c33d76908d846b0d15278deb7332aa22ba8e412` |
| jedi | [test/test_api/test_api.py](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/test/test_api/test_api.py) | 15872 | `c7d3e49efd0243cc2096e20fbe9f79660adbda1e833ef3e193ce3532b5a63b69` |
| jedi | [jedi/api/__init__.py](https://github.com/davidhalter/jedi/blob/c7ceec72f1876b9f69482fe9427f8fea4c1e5220/jedi/api/__init__.py) | 32702 | `6a4db65f1917ef332e4853a8b9d182e5d073e3d66a87ad09090c80848e60a974` |
| pluggy | [LICENSE](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/LICENSE) | 1110 | `d6b65e6c213a5d0b577911d34d6e5949b9f59d76c238c5071a2f3fc16cfb2606` |
| pluggy | [testing/test_pluginmanager.py](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/testing/test_pluginmanager.py) | 37810 | `3685e68a2e1c929e8531020476ca4ffbf0bebac3cddb11d9e417549d42b1b08c` |
| pluggy | [src/pluggy/_manager.py](https://github.com/pytest-dev/pluggy/blob/ba2eaa2f76ce1882f34f9d1f4a47406bd985f633/src/pluggy/_manager.py) | 26416 | `6b640339e62b43445771f41496d3fc7557f84cbecae5b4718531670fd9600ed4` |
| stevedore | [LICENSE](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/LICENSE) | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| stevedore | [stevedore/tests/test_enabled.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/tests/test_enabled.py) | 1506 | `4da45c8ea50e88575ff057998827a3a11619b14fcb411559957d48969837fac2` |
| stevedore | [stevedore/enabled.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/enabled.py) | 4173 | `894cd4833adefc6c67ae58d65ba253347f9da0146d534e3ce11a97d4dc461e4c` |
| stevedore | [stevedore/extension.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/extension.py) | 16895 | `09c1f96fc982f1568f44495bc4bf3b3efebb43fe5cb0e49ba689c297ec84a7cf` |
| stevedore | [stevedore/tests/test_extension.py](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/stevedore/tests/test_extension.py) | 12982 | `661eb30afcd24c0096ec5d78957a51e357d3557d0312ee6721e2992a7ecd58e5` |
| stevedore | [pyproject.toml](https://github.com/openstack/stevedore/blob/849be420e44d47218156adec6ccd9bfa77c4659e/pyproject.toml) | 2407 | `487d888a41cd0e52ff0c85f19e11416fa1691e8ba0a39aa97ea2abed8b1ad7c8` |
| importlab | [LICENSE](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/LICENSE) | 11357 | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| importlab | [tests/test_graph.py](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/tests/test_graph.py) | 10961 | `64d95ff998cdbc90d9e9576b335a4ead95fab82f59ca3f0e17708f9463a25877` |
| importlab | [importlab/import_finder.py](https://github.com/google/importlab/blob/9751bfc27d5bde83b117c85eee48cb9b6cc0d652/importlab/import_finder.py) | 5424 | `05ca81c7fbfea01ff776e78913e03f1ed94a3666f4e2ac44be03b601a5e669d6` |
| livegrep | [COPYING](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/COPYING) | 1508 | `cdef8170c03e3e62a21576be36b55d7992241ff82233792c5a9471b515579954` |
| livegrep | [src/proto/livegrep.proto](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/src/proto/livegrep.proto) | 1921 | `8b2011fbbfa2f5352cc1be8472ff8993cd69f12219d3db43c907a0f8658ef075` |
| livegrep | [web/src/codesearch/codesearch_ui.js](https://github.com/livegrep/livegrep/blob/923d5ad71dfe60900e6c2017b2fa4a5ff902ad71/web/src/codesearch/codesearch_ui.js) | 31362 | `ede73bff886066f72afa613675d1f4dd2ee3e055ecd4e87b837142b31cfad36b` |

边界：以上为固定source/consumer/expected阅读；没有第三方执行、安装、扫描、live插件、浏览器、视觉可读性或实际用户收益证据。只给一个条件内容建议，其余明确不实施。
