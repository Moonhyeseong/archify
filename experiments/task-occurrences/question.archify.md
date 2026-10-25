# 打印了 11 处，为何只有 10 个任务？ {#task-occurrences}

同一 `:compileJava` 被两个父任务依赖，所以**打印了两处**。

- 位置 5、7 指向同一任务身份。
- 根工程与 `includedProject` 的同名任务分开计数。
- 星号表示先前已打印，不记录执行次数。[](source:expected)

@answer scope="固定上游测试 expected · 计划依赖投影 · 未运行 Gradle"
@meta locale=zh-CN repo_url=https://github.com/dorongold/gradle-task-tree repo_revision=84cda7f0ce2363c96b1b26713ad34558519bdf05
@source expected title="官方完整 expected" path=src/test/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskTest.groovy lines=365:386
@source identity title="TaskDetails 按 path 判断身份" path=src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy lines=69:79
@source print title="重复与深度截断分别处理" path=src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy lines=140:178
@source plan title="从 executionPlan 构造依赖树" path=src/main/groovy/com/dorongold/gradle/tasktree/TaskTreeTaskBase.groovy lines=82:119
@source skip title="只禁用尚未执行的任务" path=src/main/groovy/com/dorongold/gradle/tasktree/TaskTreePlugin.groovy lines=59:76

## 每个打印位置指向谁？ {#positions span=12}

点任务路径可定位图中身份。位置 5 和 7 会指向同一个 `compileJava`。身份按完整 path 判断。[](source:identity)

| 打印位置 | 完整 task path | 原树父位置对应的任务 | 标记 |
| --- | --- | --- | --- |
| 1 | [:dependsOnIncluded](node:task-map.t1) | `入口` | 首次打印 |
| 2 | [:assemble](node:task-map.t2) | `:dependsOnIncluded` | 首次打印 |
| 3 | [:jar](node:task-map.t3) | `:assemble` | 首次打印 |
| 4 | [:classes](node:task-map.t4) | `:jar` | 首次打印 |
| 5 | [:compileJava](node:task-map.t5) | `:classes` | 首次打印 |
| 6 | [:processResources](node:task-map.t6) | `:classes` | 首次打印 |
| 7 | [:compileJava](node:task-map.t5) | `:jar` | `*` · 与位置 5 同一身份 |
| 8 | [:includedProject:taskInIncludedProject](node:task-map.t7) | `:dependsOnIncluded` | 首次打印 |
| 9 | [:includedProject:build](node:task-map.t8) | `:includedProject:taskInIncludedProject` | 首次打印 |
| 10 | [:includedProject:assemble](node:task-map.t9) | `:includedProject:build` | 首次打印 |
| 11 | [:includedProject:check](node:task-map.t10) | `:includedProject:build` | 首次打印 |

11 个打印位置减去 1 个重复引用，得到 10 个任务身份。此例的 `compileJava` 是叶子；星号没有藏起后续任务。[](source:print)

## 哪两个父任务共享它？ {#shared span=12}

`classes` 和 `jar` 的依赖箭头都指向同一个 `compileJava`。所有箭头都表示父任务依赖目标任务；不是执行先后。

@diagram architecture id=task-map source=task-identities.architecture.json title="10 个身份，10 条依赖关系"

根工程的 `:assemble` 与 `:includedProject:assemble` 是不同身份。图中每个标签均为完整 task path，表格和节点说明保留原打印位置。

## 官方 expected 原本怎样打印？ {#original span=12}

下面保留完整树与原图例。显示文本从固定 Groovy expected 字面量派生，处理双反斜线；不是本轮工具 stdout。[](source:expected)

```text
------------------------------------------------------------

:dependsOnIncluded
+--- :assemble
|    \--- :jar
|         +--- :classes
|         |    +--- :compileJava
|         |    \--- :processResources
|         \--- :compileJava *
\--- :includedProject:taskInIncludedProject
     \--- :includedProject:build
          +--- :includedProject:assemble
          \--- :includedProject:check


(*) - subtree omitted (printed previously)
```

`*` 与深度截断的 `(...)` 含义不同；这份 expected 只含重复打印标记。原工具已有明确图例。[](source:print)

## 这份图能证明执行了吗？ {#scope span=12}

| 证据层 | 这里有什么 | 能回答什么 |
| --- | --- | --- |
| 固定输入 | 完整 8 文件多项目 fixture | 当前工程和 included build 的来源 |
| 上游 expected | invocation 计划依赖树 | 打印位置、任务身份、依赖关系 |
| 本轮产物 | 人工编排表与图，附派生账目 | 同一原位置与图节点如何对应 |
| 实际执行 | 未提供 | 次数、调度顺序、耗时与成功状态均未知 |

生产者从 `executionPlan` 读取依赖。插件禁用尚未执行的任务；已提前执行的任务另有日志。不能将此机制说成调用 Gradle 时绝无代码执行。[](source:plan)[](source:skip)
