# Visual explanation：共享对象、局部对应与逐步阅读

2026-10-25。开始时对hub全部36份scouts的326个唯一GitHub owner/repo排重；以下7个新仓库此前未覆盖，不按stars筛选。已排除已有latentflip/loupe、算法动画、普通时间线、railroad、依赖图和source-question-tour的重复切口。只读源码、许可、已提交示例和expected，没有安装或运行外部服务、编译器、debugger、模型或用户代码；上游的播放界面不是本轮实际执行。

本轮有一个值得继续的固定内容候选：**同样内容的四个变量，分别指向哪些列表对象？** memory_graph有完整小输入和已提交图片，许可明确，原生Architecture可表达共享引用，Explainer可保留代码与身份表；不需要Tree、parser或内存采集器。另一个有启发但暂不实施的机制是Compiler Explorer的一对多source对应，缺失source的行必须保留为缺失。其它项目主要提供交互观察，不能仅因界面丰富就复制其整套运行环境。

## 七个新来源及实际机制

固定的是本次读取的commit，不宣称最新release。

| 项目 / 固定revision / 许可 | 一手源码或公开示例 | 借鉴、成本与边界 |
| --- | --- | --- |
| [memory_graph](https://github.com/bterwijn/memory_graph/tree/97f39f7832c795ba74da442fb3bb06cdcf506674) · `97f39f7832c795ba74da442fb3bb06cdcf506674` · [BSD-2-Clause](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/LICENSE.txt)；示例另含Bas Terwijn版权/SPDX | [copy_mutable.py](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/images/copy_mutable.py)与[已提交PNG](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/images/copy_mutable.png)；[identity去重](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/memory_graph/memory_to_nodes.py#L35-L58)与[reference ports](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/memory_graph/html_table.py#L75-L103)。 | 箭头汇入同一对象，能解释变量别名、浅拷贝的子对象共享。固定内容成本低；不要引入任意Python对象遍历、Graphviz runtime或通用memory importer。 |
| [VS Code Debug Visualizer](https://github.com/hediet/vscode-debug-visualizer/tree/96c26e5388eda9ed81a488f1d95a26a9af166214) · `96c26e5388eda9ed81a488f1d95a26a9af166214` · [根GPL v3文本](https://github.com/hediet/vscode-debug-visualizer/blob/96c26e5388eda9ed81a488f1d95a26a9af166214/LICENSE.md)，子目录另有许可文件 | [custom-visualizer示例](https://github.com/hediet/vscode-debug-visualizer/blob/96c26e5388eda9ed81a488f1d95a26a9af166214/demos/js/custom-visualizer.js#L5-L24)从Map抽取table rows；extractor有id/name/priority，再返回结构化展示数据。 | 同一值可以选择合适投影，而非全对象JSON。extractData是可执行代码，不是无副作用纯数据；不接debug session、不复制GPL扩展到Archify，也不把候选extractor名称当已观测事实。 |
| [hediet/visualization](https://github.com/hediet/visualization/tree/9e6dc9a5add14fe6468ac761ceea0aede2bb1de6) · `9e6dc9a5add14fe6468ac761ceea0aede2bb1de6` · [MIT](https://github.com/hediet/visualization/blob/9e6dc9a5add14fe6468ac761ceea0aede2bb1de6/LICENSE.md) | [graph合同](https://github.com/hediet/visualization/blob/9e6dc9a5add14fe6468ac761ceea0aede2bb1de6/visualization-bundle/src/visualizers/graph/sGraph.ts#L14-L38)显式nodes、edges、id和kind；[playground示例](https://github.com/hediet/visualization/blob/9e6dc9a5add14fe6468ac761ceea0aede2bb1de6/playground/src/demo.editable.json)保存不同kind数据与preferred visualization。 | 数据模型和展示选择分开，有利于同一输入切换视图。与GPL的debugger扩展不是同一许可；Archify已有typed native JSON，不必再引semantic-json或第二套renderer registry。 |
| [Observable Inspector](https://github.com/observablehq/inspector/tree/dba0354491fae7873d72f7cba485c356bac7c8fe) · `dba0354491fae7873d72f7cba485c356bac7c8fe` · [ISC文本](https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/LICENSE) | [expanded.js](https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/expanded.js#L52-L88)先列20项，再按more分批展开；[已提交HTML输出](https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/test/output/fulfilledArrayOpen.html)可核展开展示形状。 | 渐进披露不是丢弃其余项目，应保留more入口；不因此让Archify从截断预览推断完整数据。[valueof](https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/object.js#L18-L25)读取实际对象属性，不能把它当安全的静态JSON浏览器直接接入用户对象。 |
| [Compiler Explorer](https://github.com/mattgodbolt/compiler-explorer/tree/02855b7e2dcee52676787da3d0b28b5caa6fbb9a) · `02855b7e2dcee52676787da3d0b28b5caa6fbb9a` · [BSD-2-Clause](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/LICENSE) | [gcc-sum.asm](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/test/filters-cases/gcc-sum.asm)与[过滤expected JSON](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/test/filters-cases/gcc-sum.asm.directives.json)；[hover handler](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/static/panes/compiler.ts#L3582-L3616)仅在有source映射且找到editor时发关联事件。 | 一条source对应多条输出行；缺映射的输出行仍存在。投影与来源定位值得借鉴，编译器服务、多语言debug-format parser和性能评价不在Archify范围。 |
| [CNN Explainer](https://github.com/poloclub/cnn-explainer/tree/d0971f9447ed9806022a3d47587b62394682bc51) · `d0971f9447ed9806022a3d47587b62394682bc51` · [MIT](https://github.com/poloclub/cnn-explainer/blob/d0971f9447ed9806022a3d47587b62394682bc51/LICENSE) | [Convolutionview](https://github.com/poloclub/cnn-explainer/blob/d0971f9447ed9806022a3d47587b62394682bc51/src/detail-view/Convolutionview.svelte)把选中input/kernel带入局部卷积和步进显示，有stride、暂停及退出；仓库另含model和演示素材。 | 从全图进入一个具体输出的局部算式，避免只看“层→层”抽象箭头。这里有浏览器计算，不是既有推理trace；未运行模型，不复制图片/字体素材，也不由根代码MIT推断所有第三方素材权利。 |
| [OpenRefine](https://github.com/OpenRefine/OpenRefine/tree/d66a10ee55e88eb982196543a459a5c35e24f00b) · `d66a10ee55e88eb982196543a459a5c35e24f00b` · [BSD三条款文本](https://github.com/OpenRefine/OpenRefine/blob/d66a10ee55e88eb982196543a459a5c35e24f00b/LICENSE.txt) | [history-panel](https://github.com/OpenRefine/OpenRefine/blob/d66a10ee55e88eb982196543a459a5c35e24f00b/main/webapp/modules/core/scripts/project/history-panel.js#L69-L80)区分past/future、已undo内容；[GetOperationsCommand](https://github.com/OpenRefine/OpenRefine/blob/d66a10ee55e88eb982196543a459a5c35e24f00b/main/src/com/google/refine/commands/history/GetOperationsCommand.java#L61-L83)的operation可缺省，条目与操作不完全等价。 | 显示“当前位于哪一步，哪些已撤销”比把全部历史当已应用更诚实。操作配方也不等于各步数据快照；Archify不需要导入整个清洗工作台或执行历史。 |

## 深读一：四个变量、七个列表，为何打印相同仍有不同共享关系

固定[copy_mutable.py](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/images/copy_mutable.py#L8-L15)只有一份嵌套列表构造、直接赋值、浅拷贝、深拷贝和最后的render调用。完整文件398 bytes，SHA-256为`ea76c0f64542e239a7ab77e468564d5e3c358d8abdef80ba7b932c69ba2bd31b`。这是已提交教学输入，不是自然用户程序或本轮实跑。

其拓扑应按身份而不是内容相等表达：a/c1共用一个外层；c2拥有不同外层，但两个元素仍引用原来的两份子列表；c3的外层及两个子列表都不同。只选这四个变量时，有七份list身份：三个外层、四个子列表。为阅读分配的A/B/C/P/Q/R/S只是symbolic labels，不是实际内存地址，也不承诺跨运行稳定。

源码证据很直接：[递归建图](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/memory_graph/memory_to_nodes.py#L35-L58)按`id(data)`复用节点并记录parent/index；[HTML cell reference](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/memory_graph/html_table.py#L95-L103)为各引用保存独立port与边。因此两个父节点可以汇入同一对象，不能用单parent Tree替代；把相同打印内容合并会把深拷贝也错误归为共享。

同时，[默认嵌入类型](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/memory_graph/config_default.py#L143-L158)包含int/str等。该图重点是list引用，不是每一个标量的对象身份或驻留策略；不能因图中两个数字相同就回答其Python identity。

仓库保留PNG及[生成脚本引用](https://github.com/bterwijn/memory_graph/blob/97f39f7832c795ba74da442fb3bb06cdcf506674/images/create_images.sh#L8-L15)，没有对应已提交DOT/GV/JSON。本轮未成功展开该PNG像素；以上拓扑由固定代码与建图实现静态核对，不能称已视觉核验上游输出，更不是执行收据。

可以做自然且有意义的固定解释页：问题只问“外层别名、子列表共享、内容相等分别在哪里？”先看代码/四行变量表，再看七列表共享引用图。初版无需修改数据；如果另问“修改c2的子列表会影响谁”，要么明确标作者推论，要么新增标准库独立观察并保留before/after，不能称为上游已有mutation trace。

## 深读二：一对多source对应，也必须允许没有source

Compiler Explorer的固定[原asm](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/test/filters-cases/gcc-sum.asm)有`.file/.loc`与debug信息；文件3893 bytes，SHA-256 `cc0b0e50f127bd89bd5fda8fa8ddb2ea764c605ab45a9e0e66b50a1aacbd37c3`。对应[expected](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/test/filters-cases/gcc-sum.asm.directives.json)为4831 bytes，SHA-256 `2e92efa3833fb72dcb573d25876be1f037db9501ac892da5f20da2f73f023441`。

expected的asm数组有39个展示行，21行有source对象、18行source为null；source第4行对应其中7条汇编行。这是过滤fixture的提交数据，不是本次编译输出、机器指令执行次数或热度。数组还含label/注释，不应把39称为39条已执行指令。

读者hover一条已映射汇编行时，[handler](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/static/panes/compiler.ts#L3582-L3616)提取line/column并确认editor；[colouring](https://github.com/mattgodbolt/compiler-explorer/blob/02855b7e2dcee52676787da3d0b28b5caa6fbb9a/static/line-colouring.ts#L55-L70)也只处理有效source。可借的是“局部对应，缺失就不连”，而非每行强制着相同颜色。

该expected中的file=null仍不能由Archify自由填成某个当前文件。原asm里的临时源路径也不是当前checkout身份；这里没有随同核实对应源文件内容、compiler选项和运行receipt。因此暂不做自动source mapper或新的编译对照实验。已有SourceCard可以显示明确固定的源码片段，但它不自动证明source-map产生关系，更不证明优化前后语义等价。

## 对Archify的具体机会

能力基准更新为`origin/dev`的`3f95f0349c8276db71509ca239461b6fe9d00f9f`。新dev根软件许可为Apache-2.0；既有旧实验仍绑定82c7，不改其证据。现有Architecture可表达共享有向关系，Finder/局部关系查询可定位对象，Explainer已有原生图引用、SourceCard、表格和固定代码摘录；[authoring合同](https://github.com/tt-a1i/archify/blob/3f95f0349c8276db71509ca239461b6fe9d00f9f/archify/references/explainer-authoring.md#L104-L112)已有节点→来源/解释块，不需要新hover系统。

**优先一个内容实验：copy identity。** 固定完整BSD教学fixture及许可，用现有Architecture明确标注“变量绑定/列表元素引用”，画四变量入口和七list对象；保留数组索引，不能将共享目标复制成两节点，也不能把新对象按相等内容合并。Explainer保留源代码、symbolic身份表与范围说明，同一native JSON被引用；不引入上游运行器、Graphviz、parser、通用heap schema或新产品kind。

最小验收不是截图好看，而是四个绑定、各索引引用和七list identity逐项匹配；若另作标准库观察，输出同对象/异对象关系矩阵而非公开进程地址，并明确该观察程序与原示例的复用/差别。原代码最后调用上游render，不应为了证据而执行它；可读完源后只复用标准库构造作独立观察。未知或未观察的部分不补造。本报告本身没有执行这一步。

建议截图同一1440px宽度：原生全图要看到两条变量边收敛外层、浅拷贝与原外层的子引用收敛、深拷贝相同内容但不同节点；解释页要能同时看见代码与身份表。再用现有Finder选一个共享子列表，确认节点身份不会因显示内容相同而混选；是否启用Lens以实际图上可读性为准，不新增交互。截图、模型核对、独立观察与CLI验证分别记账，不称人类学习收益或用户工作负载。

**不立即做产品改动。** Inspector的more、debugger的view选择、CNN的局部算式和OpenRefine的历史游标都很有用，但Archify已有渐进披露/细节块，尚无固定Archify输入证明需要新的控件。直接接入live object、debug adapter、编译器或神经网络runtime会显著扩大维护面。先完成上述小内容任务，若现有Lens/SourceCard足以解释则接受零runtime改动；若实际出现可复现的阅读障碍，再单独记录最小问题。

## 研究完成范围

仅新增本报告，不修改README、gallery或其他人的文件，不commit/push，不安装或运行上游。memory_graph的固定fixture与identity实现由只读后台agent先深读，作者再次读取完整输入与对应实现；Compiler Explorer固定asm/JSON的形状和数量由只读脚本核对。所有教学示例、expected、源码推导与本轮执行明确区分。后续获授权的内容实验是独立工作，不把研究结论提前写成已交付产物或已证明收益。
