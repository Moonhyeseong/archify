# 测试与代码之间的可解释证据：10 个新项目

2026-10-25，第六批只读研究。只新增本文件；未安装或执行上游工具、未运行用户测试、未执行数据库迁移、未生成实验产品或截图、未修改共享 schema、未提交或推送。

**优先候选：pytest 失败阶段与源位置核对页；第二候选：带测试上下文的已观测行关联矩阵。** 两者直接消费已有产物，不采集覆盖、不决定删测/跳测、不把运行栈恢复成完整调用图。普通模块覆盖汇总、依赖图与 Chrome X 时间线已由此前报告覆盖，本轮不重复。

## 方法与当前 Archify 范围

按项目 `archify-review` 的价值、成本、影响框架进行筛选，已读 `CONTRIBUTING.md` 与测试证据选择要求。使用认证 GitHub API 查默认分支 commit、README、许可正文和实际 reporter/storage 源码。固定 commit 是本次核查快照，不是运行验收；许可用于判断研究/复用成本，不代替未来具体文件审查。

去重覆盖现有 `code-maps`、`git-architecture`、`graph-reading`、`prlens-smalltools`、`protocol-schema-smalltools`、`task-view`、`text-diagrams`、`traces-timelines`、`build-infra-smalltools`、`interaction-smalltools`。**coverage.py 已在 git-architecture 出现，不计入本轮 10 个新项目**；第二候选只补查其 context 输出，与已有 LCOV→模块覆盖汇总有明确差异。没有通过 stars 排名。

产品比较基线为 `82c7e0f089a02a4d514714adf37dc2061682da5f`。hub 在核查期间 HEAD 为 `cbf2e020d1e59012a918f7044927926e2b12fd53`；`archify/bin/archify.mjs`、`repository-authoring.md`、`explainer-authoring.md` 相对该基线无差异。另读 `lab-ci-conditions` checkout 的实际 README（当时 HEAD `0ec0b8345fcfc97e49117b66fd7f99a198c96604`），它处理 needs/conditions/matrix 的静态声明，不是测试结果或逐测试执行覆盖。

本地已存在的能力：

- public CLI 的 render/finalize、native Tree/Architecture/Explainer；源码 `sources`、`@source`/`@code`、固定 revision 引用与可验证源范围。已有 source contract 区分“声明/源码出现”与“实际调用/执行”。
- `repository-authoring.md` 要求 source URL/revision 与 committed bytes 验证，不能把导出中的任意 fileName 直接升级为 verified source。`@code` 可以在明确仓库范围内读已提交源，但本研究没有读取用户业务代码来补报告。
- 未发现通用 pytest-reportlog/pytest JSON、逐测试 context 或 traceback 导入命令。源码 grep 不是对整个未来产品路线的否定。

当日开放工作核对：读取 open issues 全标题（limit 500）、open PR 标题（limit 150）与相关正文；关键词搜索仅为补充，不声称彻底排除其他措辞的工作。

- [#1052](https://github.com/tt-a1i/archify/issues/1052)、[#1053](https://github.com/tt-a1i/archify/issues/1053)、[#1054](https://github.com/tt-a1i/archify/issues/1054)：delivery provenance 的只读 evidence index。已读 #1053：M1 只判断 artifact 与既有 delivery receipt 绑定，不加入测试正确性维度。本轮不发明共享 evidence schema 或偷扩该接口。
- [#251](https://github.com/tt-a1i/archify/issues/251)：repository-grounded workflow gates/recovery 的语义覆盖；和测试行覆盖不是同一概念，不给其造新 schema。
- [PR #998](https://github.com/tt-a1i/archify/pull/998)：code-analysis 路线；不在其外重做源码索引、通用调用关系或 test-impact 引擎。
- [PR #367](https://github.com/tt-a1i/archify/pull/367)：ownership/locate/drilldown；不由测试路径猜所有权或复刻定位器。
- [PR #1015](https://github.com/tt-a1i/archify/pull/1015)：Explainer code focus、source card、交互说明等；本轮复用已允许的输出形态，不改阅读交互。
- [PR #1063](https://github.com/tt-a1i/archify/pull/1063)、[#865](https://github.com/tt-a1i/archify/pull/865)、[#624](https://github.com/tt-a1i/archify/pull/624) 涉及 source hosts/本地验证边界；报告路径映射不能绕过既有验证。

## 10 个新项目：固定源码、许可和真实产物

| 项目与固定 commit | 许可（一手正文） | 已核实的产物形状或事实 | 对本轮的判断 |
| --- | --- | --- | --- |
| [numirias/pytest-json-report](https://github.com/numirias/pytest-json-report/tree/c6f0bc93a174770e04b965e459d339a880005e78) · `c6f0bc93a174770e04b965e459d339a880005e78` | [MIT](https://github.com/numirias/pytest-json-report/blob/c6f0bc93a174770e04b965e459d339a880005e78/LICENSE) | [serialize.py](https://github.com/numirias/pytest-json-report/blob/c6f0bc93a174770e04b965e459d339a880005e78/pytest_jsonreport/serialize.py) 与 [plugin.py](https://github.com/numirias/pytest-json-report/blob/c6f0bc93a174770e04b965e459d339a880005e78/pytest_jsonreport/plugin.py)：根有 created/duration/exitcode/root/environment/summary；完整报告可有 collectors/tests。test 有 nodeid/lineno/outcome；setup/call/teardown 各有 outcome/duration，可有 crash/traceback/longrepr/streams/log。frame 为 path/lineno/message。 | **首选**，结构比抓整段终端日志可靠。总 outcome 与阶段 outcome 可能不同；summary-only 或 omit traceback 不是空栈的证明。 |
| [pytest-dev/pytest-reportlog](https://github.com/pytest-dev/pytest-reportlog/tree/a8ef021cf6250a0ed8c26bac2ac74b98474c2e8a) · `a8ef021cf6250a0ed8c26bac2ac74b98474c2e8a` | [MIT](https://github.com/pytest-dev/pytest-reportlog/blob/a8ef021cf6250a0ed8c26bac2ac74b98474c2e8a/LICENSE) | [plugin.py](https://github.com/pytest-dev/pytest-reportlog/blob/a8ef021cf6250a0ed8c26bac2ac74b98474c2e8a/src/pytest_reportlog/plugin.py) 写 JSONL；`$report_type` 区分 SessionStart/SessionFinish/TestReport/CollectReport/WarningMessage；TestReport 内容委托 pytest serialization hook。SessionFinish 含 exitstatus。 | 部分/中断运行可从 session 结束记录区分。需要同时钉 pytest 版本；未知 report type 可保留计数和原文，不可吞掉后宣称完整。首版不同时兼容两套 pytest 格式。 |
| [pytest-dev/pytest-cov](https://github.com/pytest-dev/pytest-cov/tree/a8cb1260170754f2aff9022cfd252c488098e813) · `a8cb1260170754f2aff9022cfd252c488098e813` | [MIT](https://github.com/pytest-dev/pytest-cov/blob/a8cb1260170754f2aff9022cfd252c488098e813/LICENSE) | [plugin.py](https://github.com/pytest-dev/pytest-cov/blob/a8cb1260170754f2aff9022cfd252c488098e813/src/pytest_cov/plugin.py) 的 TestContextPlugin 以 `item.nodeid + '|' + when` 切 context；phase 是 setup/run/teardown。[contexts.rst](https://github.com/pytest-dev/pytest-cov/blob/a8cb1260170754f2aff9022cfd252c488098e813/docs/contexts.rst) 说明参数化测试各自有 context。 | **第二候选的采集来源**，但 Archify 不负责采集。context 是执行归属证据，不是 assertion 充分性或逐测试独立性证明。 |
| [tarpas/pytest-testmon](https://github.com/tarpas/pytest-testmon/tree/dccc58d2ed8edec98096ff1974acb7c07d3e3482) · `dccc58d2ed8edec98096ff1974acb7c07d3e3482` | [MIT](https://github.com/tarpas/pytest-testmon/blob/dccc58d2ed8edec98096ff1974acb7c07d3e3482/LICENSE) | [testmon/db.py](https://github.com/tarpas/pytest-testmon/blob/dccc58d2ed8edec98096ff1974acb7c07d3e3482/testmon/db.py)：SQLite 的 test_execution、file_fp、test_execution_file_fp，含 environment、duration/failed、filename、method_checksums、文件指纹。不是简单测试→源码行 JSON。DB 初始化会检查格式并配置连接。 | 选择依据解释有价值，但不要 import DB 类后声称只读，不要接活跃 cache 或自动迁移。内部 schema/指纹解码维护成本偏高，本轮不做适配。 |
| [testtrim/testtrim](https://github.com/testtrim/testtrim/tree/1fcac04d812077db69913dbcd4191995bd388f95) · `1fcac04d812077db69913dbcd4191995bd388f95` | GPL-3.0-or-later；[固定 README](https://github.com/testtrim/testtrim/blob/1fcac04d812077db69913dbcd4191995bd388f95/README.md) 和相关 Rust 文件 SPDX 头明确；GitHub license API 为 null，未据此误判无许可 | [CommitCoverageData](https://github.com/testtrim/testtrim/blob/1fcac04d812077db69913dbcd4191995bd388f95/testtrim-cli/src/coverage/commit_coverage_data.rs)：all_existing_test_set、executed_test_set、executed_test_to_files_map 等，generic test key 用 HashMapToArray 序列化；[FullCoverageData](https://github.com/testtrim/testtrim/blob/1fcac04d812077db69913dbcd4191995bd388f95/testtrim-cli/src/coverage/full_coverage_data.rs) 可跨多次运行合并。 | 区分“存在测试/本次执行测试/历史合并关联”很有价值。原生 test ID 按语言泛型变化，不能凭 Rust struct 编出通用原生 JSON。网络依赖高级目标在 README 仍列为规划，不当已支持。 |
| [gliga/ekstazi](https://github.com/gliga/ekstazi/tree/b6ee1f2bed42c6bb343e74759078dbd6458f4f5a) · `b6ee1f2bed42c6bb343e74759078dbd6458f4f5a` | [Apache-2.0](https://github.com/gliga/ekstazi/blob/b6ee1f2bed42c6bb343e74759078dbd6458f4f5a/LICENSE.txt) | Java regression test selection；[TxtStorer.java](https://github.com/gliga/ekstazi/blob/b6ee1f2bed42c6bb343e74759078dbd6458f4f5a/org.ekstazi.core/src/main/java/org/ekstazi/data/TxtStorer.java) 存储 mode magic 与 URL/hash 行；另有 PrefixTxtStorer，不能当通用 CSV。 | 存储的是动态文件依赖/指纹，不是每次 assertion 或当前源码正确性。JVM agent、hash/cache 模式和环境假设使重实现选择器得不偿失。 |
| [Bachmann1234/diff_cover](https://github.com/Bachmann1234/diff_cover/tree/400061f02210cb0bb0af1edb65307903fbe731ba) · `400061f02210cb0bb0af1edb65307903fbe731ba` | [Apache-2.0](https://github.com/Bachmann1234/diff_cover/blob/400061f02210cb0bb0af1edb65307903fbe731ba/LICENSE) | 读取 XML/LCOV 与 diff；[官方 JSON fixture](https://github.com/Bachmann1234/diff_cover/blob/400061f02210cb0bb0af1edb65307903fbe731ba/tests/fixtures/add_json_report.json) 为 report_name/diff_name/src_stats、per-file covered_lines/violation_lines/violations、total_num_lines/violations/percent、num_changed_lines。 | 已有成熟 changed-line 阅读页；不要再造 diff parser。只显示现有 report 不能知道哪个测试触及某行，也不把 diff_name 文本当 verified refs。本轮不列为新实验，避免和已有覆盖汇总方向重复。 |
| [gcovr/gcovr](https://github.com/gcovr/gcovr/tree/b26bf8aa4744181abf69f8a00b57d96082c7f652) · `b26bf8aa4744181abf69f8a00b57d96082c7f652` | [BSD-3-Clause](https://github.com/gcovr/gcovr/blob/b26bf8aa4744181abf69f8a00b57d96082c7f652/LICENSE.txt)，正文核实；API 为 NOASSERTION | [JSON 文档源码](https://github.com/gcovr/gcovr/blob/b26bf8aa4744181abf69f8a00b57d96082c7f652/doc/source/output/json.rst) 与 [JSON 示例](https://github.com/gcovr/gcovr/blob/b26bf8aa4744181abf69f8a00b57d96082c7f652/doc/examples/example_json.json)：gcovr/format_version、files[file/lines/functions]，line 的 count/branches/calls/excluded。calls 是 source/destination block ID、returned 等；8.4 changed covered→returned。 | **重要反例**：call returned 次数不是已知 callee 名，更不是完整调用边。若没有测试 context，不能把这些 counts 关联某个 testcase；暂不做 C++ callgraph 适配。 |
| [gotestyourself/gotestsum](https://github.com/gotestyourself/gotestsum/tree/3cf14356a16c7931cfeacd7dfee585527618df3d) · `3cf14356a16c7931cfeacd7dfee585527618df3d` | [Apache-2.0](https://github.com/gotestyourself/gotestsum/blob/3cf14356a16c7931cfeacd7dfee585527618df3d/LICENSE) | --jsonfile 原样保存 go test/test2json JSONL；[execution.go](https://github.com/gotestyourself/gotestsum/blob/3cf14356a16c7931cfeacd7dfee585527618df3d/testjson/execution.go) 的 TestEvent 含 Time/Action/Package/Test/Elapsed/Output；同名测试可重复出现，package 可在没有 failing testcase 时失败。 | 适合后续 Go 失败交接，但主要是测试运行记录，不是函数调用覆盖。首版不把 Package fail 凭空归给某个测试，不把重复 Test 字符串合并掉重试身份。 |
| [stacktracejs/error-stack-parser](https://github.com/stacktracejs/error-stack-parser/tree/9f33c224b5d7b607755eb277f9d51fcdb7287e24) · `9f33c224b5d7b607755eb277f9d51fcdb7287e24` | [MIT](https://github.com/stacktracejs/error-stack-parser/blob/9f33c224b5d7b607755eb277f9d51fcdb7287e24/LICENSE) | [error-stack-parser.js](https://github.com/stacktracejs/error-stack-parser/blob/9f33c224b5d7b607755eb277f9d51fcdb7287e24/error-stack-parser.js) 从 Error.stack 解析 StackFrame(functionName/fileName/lineNumber/columnNumber/source)；按引擎处理，源码明确会去除部分 eval 信息。 | 现成结构化 stack frame 可作为后续输入；原始浏览器栈 parser 兼容成本高，不能称无损。fileName 可是 URL/anonymous/native，不能当本机安全路径或自动抓取 source map。 |

额外筛掉的 `grcov` 和 `tarpaulin` 虽都有可读覆盖 JSON，但本轮没有发现比“覆盖汇总”更直接的测试身份关系收益，因此不靠多种覆盖格式凑候选。需要这些语言时优先继续用其成熟原生报告。

## 两个不能混合的证据问题

### 测试失败的位置不是完整动态调用图

pytest-json-report 的 `test.lineno` 来自 `report.location[1]`，是测试定义位置；[pytest 官方 API](https://docs.pytest.org/en/stable/reference/reference.html#pytest.TestReport) 说明该位置的行号零基。`crash/traceback` 来自 ReprFileLocation，序列化时不再减一；[pytest 官方 traceback 实现](https://www.pytest.org/en/latest/_modules/_pytest/_code/code.html) 以 `entry.lineno + 1` 构造它。两种行号不能一律加一。

setup 失败可以使 call 不出现，teardown 失败可以与 call passed 同时存在；总 outcome 还可被 pytest status hook 调整。缺 stage、缺 traceback、被 omit、native traceback 无详细条目和真正“空集合”不能被合并成成功。框架栈可能已经过滤、折叠或截断；提供的 frame 顺序不是完整事件时间线，也不能证明所有相邻 frame 都是直接调用。

### 逐测试 context 是运行归属，不是因果或正确性

新项目 pytest-cov 负责命名/切换 context；已调查的 coverage.py 负责 JSON 载体。固定 [coverage/jsonreport.py @ 0e4f752b455bbf26fdad32ac29948d067c87dd62](https://github.com/nedbat/coveragepy/blob/0e4f752b455bbf26fdad32ac29948d067c87dd62/coverage/jsonreport.py) 明确写 meta.show_contexts，且仅开启时写 `files[path].contexts = contexts_by_lineno(...)`。JSON 的 line key 是对象字符串键；值是 context label 数组，不是测试执行次数。

[官方 context 文档](https://coverage.readthedocs.io/en/7.12.0/contexts.html) 说明空字符串可表示尚未设置动态 context 的代码，static/dynamic context 可再用 pipe 组合。故不能在第一个 pipe 切开猜 nodeid；参数化测试 ID 本身也可能含 pipe。首版要求提供精确 context→test/phase 映射，不猜覆盖采集器或命名规则。line 命中且没有测试归属，是 unattributed/unknown，不能改为未覆盖。

## 实验 A：失败阶段与源位置核对页（优先）

**用户问题。** CI 给出一份 pytest JSON，接手者需要马上分清“测试断言失败、fixture setup 失败、teardown 清理失败、收集失败”，并找到**提供的**源位置。当前整段 log 搜索容易错把最后一个日志位置当原因；单纯画一张失败状态图也无帮助。

**安全输入。** 一个由使用者在可信环境已导出的完整 pytest-json-report JSON；独立 sidecar 指定 exporter commit/version、pytest version、原报告 SHA-256、源码公开 repository URL 与精确 source revision、允许的相对路径映射、是否已省略 traceback/streams。原始报告的 environment/root/streams/log 可能含个人路径或凭据，默认不复制进可分享页面；本实验只投影测试身份、阶段、位置与安全文本字段，明确列出未展示的字段范围。不能读取报告中的绝对 path、file://、HTTP frame URL 来补内容。

最小说明性输入（原创 **synthetic**，只展示与本切片相关字段，不能声称为真实上游运行输出）：

```json
{
  "created": 1,
  "duration": 0.1,
  "exitcode": 1,
  "root": "/redacted",
  "environment": {},
  "summary": {"total": 1, "error": 1, "collected": 1},
  "tests": [{
    "nodeid": "tests/test_orders.py::test_total",
    "lineno": 9,
    "outcome": "error",
    "setup": {"duration": 0.01, "outcome": "failed", "crash": {"path": "tests/conftest.py", "lineno": 18, "message": "Synthetic fixture failure"}},
    "teardown": {"duration": 0.01, "outcome": "passed"}
  }]
}
```

**输出。** 原生 Explainer 的第一屏给 exporter/source revision、总体 outcome 与“setup failed / call not-provided / teardown passed”；表格给测试定义位置（显示 10，保留原始零基 9）、crash/frame 原始一基位置、消息、路径验证状态。原生 Tree 只组织 `test occurrence → stage → supplied frame`，箭头说明“报告包含关系”，不画直接调用边。没有 traceback 时显示 unavailable，仍展示 crash；collection errors 单独分区，不伪造成 test 函数失败。页面可链接经过既有 source contract 验证的 pinned source，未验证项只做字面引用。

**失败与限制。** summary-only、缺 tests/collectors 的报告不能生成“没有失败”的结论；重复 nodeid 的重跑身份丢失、未知阶段 shape、非法/负行号、路径越界、来源版本未支持，首版拒绝或给明确 unavailable 状态。longrepr/消息必须经 JSON 字面/inline code 编码，不能解释 Markdown 链接、HTML、终端 ANSI 或 @directive。未知 report 字段以“此切片未展示”账目处理，不宣称复原完整报告。最多 20 tests / 50 frames，超限要求显式选取测试及记录选择范围，不静默截断。

**验证与截图方案。** 优先取上游固定 commit 的现有公开 JSON fixture（若只有测试生成代码，就用 synthetic，不执行 pytest 来制造“真实”输出）；最终实际用户 fixture 必须已脱敏。至少覆盖 setup-only fail、call passed+teardown failed、collection-only、traceback omitted 四份状态。public render/finalize 后，1440×1000、light、100% zoom，图与表同屏，人工抽查测试定义 9→显示10、crash18保持18；第二图展示缺 traceback 的 unavailable。输入恶意链接、竖线、反引号、绝对路径时，实际渲染不能新增链接或读取外部文件。截图不是修复有效性或测试质量证明。

**维护成本。** 低到中：一个 exporter 版本、两个位置语义、几个 phase 表；不带 pytest runtime、不解析源码或原始栈、不做异常根因分类器。价值要通过实际失败交接是否减少定位时间验证；如果只是又一个 outcome 列表，应继续用原工具报告，而不进入产品。

## 实验 B：哪个测试观测到这几行？（第二优先）

**用户问题。** 修改前阅读一段代码时，想知道已有运行记录中哪些 testcase/phase 触及目标行，哪些已命中行没有 testcase 归属。它与此前“模块总覆盖率”不同，也不宣称推荐了充分的回归集合。

**安全输入。** 一份已导出的 coverage.py format 3 JSON，必须带 `meta.show_contexts=true` 和 file contexts；配套 exporter/version、source revision、报告 SHA-256、采集过滤范围、**精确 context map**、测试结果报告可选 digest。映射缺失 context 保持 unknown；禁止拿任意测试名子串或静态 imports 猜归属。第一版不打开 .coverage SQLite、不运行 coverage/pytest，不连接活跃 testmon/testtrim DB。

最小原格式片段与实验 sidecar（原创 **synthetic**，片段不是完整可导入报告）：

```json
{
  "meta": {"format": 3, "show_contexts": true},
  "files": {
    "src/orders.py": {
      "executed_lines": [12, 13],
      "missing_lines": [14],
      "excluded_lines": [],
      "contexts": {
        "12": ["tests/test_orders.py::test_total|run"],
        "13": [""]
      }
    }
  }
}
```

```json
{
  "contextMap": {
    "tests/test_orders.py::test_total|run": {"testId": "tests/test_orders.py::test_total", "phase": "run"}
  },
  "selectedSourceLines": {"src/orders.py": [12, 13, 14]}
}
```

**输出。** 原生 Explainer 的源码行×test/phase 矩阵；line12 为 observed+mapped，line13 为 observed+unattributed(empty context)，line14 为 reported-missing。未在报告出现的 file/line 单独为 unavailable，不显示 0%；excluded 单独标识，不掺入 covered/missing。每条格可追溯到原始 `files/path/contexts/line` 字段与报告 digest。原生 Tree 可组织被选 source file/line，不从观测归属创建模块依赖或函数调用图。只有另有同 run 的 test result，才显示该 test 的 pass/fail；context 本身不提供结果。

**失败与限制。** show_contexts=false/缺 contexts、格式不支持、重复/冲突 path、行集合相互矛盾、未知 context mapping phase、混入不同 revision/run 的报告，拒绝或明确 unknown，不补零。保留 empty context 与未映射非空 context 的区别。source 路径必须来自 sidecar 的允许映射，不读报告指向的文件；源码文本如需展示，走既有 verified source 途径或单独安全提供，不尝试 import Python。限制 10 contexts×20 被选行，超限明确拆页，保留选择账目；不从 missing line 反推出“应该新增哪条测试”。

**验证与截图方案。** 用同一份提供报告准备至少 mapped/unattributed/unknown/missing/excluded/unavailable 六格对照；另用有 pipe 的参数化 nodeid、static+dynamic context、空 context 验证不错误分割。public render/finalize 生成实际 HTML，1440×1000、light、同一版次，第一图展示六种状态及来源，第二图点击 pinned line 核验到正确 revision。输入缺 context 时必须无“所有测试未覆盖”结论；换 source revision 时不得复用旧 verified 标记。所有图片对应真实已读取 artifact，不能用手工填写矩阵声称适配成功。

**维护成本。** 中：来源与 context 命名差异、过滤和多 run 合并是主要成本，矩阵布局本身不难。先只接受一种 format 与一个显式映射 sidecar；不建设 coverage collector、test dependency DB、自动重测系统或共有 evidence schema。若真实产物没有 context，多语言推广先停止，不把静态依赖冒充逐测试执行归属。

## 暂不实施的 test-impact 方向

testmon / testtrim / Ekstazi 显示“为什么某测试被选择”很有用，但拿历史关联画一条“change→test”箭头，不足以证明本次未选择的测试安全。缓存可能来自不同环境、部分运行或跨 commit 合并；源码文件变化还可能影响未被采集的配置、常量或外部依赖。尤其 testtrim README 明确说明 Go 测试文件及非函数导出的限制，不能把工具愿景当已覆盖的保证。

后续只有在得到**外部工具已经生成的 selection reasons + base/head + cache provenance + executed/existing test sets** 的安全冻结导出时，才值得做纯只读理由页。不能凭内部 Rust/Python/Java 类型自己拼一个通用 JSON 后称原生集成，也不运行上游来填证据缺口。不推荐 Archify 自己计算删测/跳测集合。

## 本轮完成与未完成

完成：10 个此前未列项目的一手 commit/许可与格式核验、Archify 产品/实验/开放工作边界核对、两个有界候选及截图/失败方案。没有实现、没有上游执行、没有用户代码执行、没有测试通过或图片产出。实际成本和收益仍须独立实验验证；研究建议不等于允许改共享 schema 或发布测试结果。
