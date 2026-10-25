# dev 10b4 与 11 个产品候选的行为交集

2026-10-25，只读排重与价值检查。**11 项核心行为均仍独立；本轮未发现可以因 #1102 已覆盖而关闭的候选，也没有足够依据把其中一项称为核心合同已部分交付。** 有多处共享文件和相邻用户动作交集，需要刷新整合，不能把这个结论理解为旧分支可直接合入。

## 固定身份与方法

- 目标为 [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)。已用 GitHub commit API 核对：父提交为 `67f12389212c54b3122da60e2813c7f8dab7ab2f` 和 PR #1102 head `98efbfcb625b1ecfa813e131c52370b9c2dc83e6`。
- 从 gallery `selection.json` 的 `group=product` 选出下表 11 项，逐项核对对应 `lab-<id>/archify` 本地 HEAD 与清单完整 SHA 一致；审查时 11 个工作树均 clean。没有用不相干的内容/adapter 分支凑数。
- 阅读每项相对其真实共同基线的产品 diff，再读新 dev owning source 与 `67f→10b4` 的实际变化；检查直接生成/复制/格式化路径。不是按“commit 未包含”判未包含。
- 依照 [archify-review](../../../../.agents/skills/archify-review/SKILL.md)、CONTRIBUTING / REVIEWING，以用户动作、成本与影响为单位。未运行测试、渲染、浏览器或重新测量性能/可访问性；只新增本报告。
- 协调者已确认新 dev 精确 CI 成功；此事实不转移给旧实验 head，也不证明旧 ZIP、截图或整合后行为已验证。以下是源码排重结论，不是最终接受。

| 实验 | 固定候选完整 HEAD |
| --- | --- |
| Finder canvas matches | `94c165ee6e5213c67e37a75a0b04496564980801` |
| Relation reference | `6d7cd59492240952c8ade422ec9014de76fb4164` |
| Delta values | `4c35456b23b5452ca3f620672a8b52545979c945` |
| Diagnostic locations | `67328d7de5cdf7bd894bfb526682cff9fdc2d10b` |
| Finder context | `5b7701c170dabf5d204f3d220ebdb9d39fe178d2` |
| Waterfall status text | `e20acd6d6c0083f6b6ddecaf7bb250becfbca228` |
| Workflow self-loop | `eb299b1568327fb77ce7e8a6dcaab610e2b6af0c` |
| Diff line numbers | `88b0dcb069d89657798e5f1208a90bb2b768fe98` |
| Keyboard traversal | `d930863147cd6adfb5d4275f011c06caf4b24f92` |
| Preview dashed ink | `36cc35fb446c697046d4f0522253fd7010b2303d` |
| Clipboard outcome | `68866954a19cfe3b6599f3c27ff3cb10427f7d44` |

## 逐项最小位置与处置

下表链接均固定 revision。**独立**只表示目标行为未由此次 dev 实现，不自动证明候选值得直接合入。

| 候选核心行为与其实现 | 新 dev 实际行为 / #1102 交集 | 结论与最小后续 |
| --- | --- | --- |
| **Finder matches**：输入非空查询，在画布给结果节点临时 `data-finder-match`，关闭清除；[候选 node-finder.js](https://github.com/tt-a1i/archify/blob/94c165ee6e5213c67e37a75a0b04496564980801/viewer/node-finder.js) 的 clearMatches/render/close，加 CSS outline 与 export cleanup。 | [dev node-finder.js L136–170](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/node-finder.js#L136-L170) 仍只过滤列表，该文件逐字等于 82c7；没有查询画布标记。#1102 的 Finder test 增量保护 IME composing 全局快捷键，不是结果同步。export cleanup 新增恢复 drilldown authored href，与清除 Finder runtime 属性是两项责任。 | **独立，保留候选**。需在新 Viewer CSS / cleanup 上整合，保留 drilldown 清理；刷新查询/关闭/导出与 IME 相邻行为证据即可，不以新 dev 的 IME 测试冒充 matches 已验证。 |
| **Relation reference**：复制 pinned relation 的原始 from/label/to、authored ID、同方向平行边序号，区别 artifact 顺序与稳定身份；[候选 focus.js](https://github.com/tt-a1i/archify/blob/6d7cd59492240952c8ade422ec9014de76fb4164/viewer/focus.js) `copyRelationshipReference` 及独立按钮。 | [dev L710–724](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L710-L724) 仍切换原 copy 按钮文案；[L1631–1648](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/focus.js#L1631-L1648) 复制 `readerLink(relation=…/focus=…)`。新增 Explain 是作者提供的**节点**解释；drilldown 是子图导航，不生成关系事实文本。 | **独立，保留候选**。此项整合成本相对高：focus.js、template、locales 和 Passport 布局都已变化。先在新 Passport 评估按钮位置/窄屏空间，再刷新 pinned parallel / unlabelled / clear / copy evidence；不得因有 Explain 就删除原始身份引用能力。 |
| **Delta values**：当前 selected exact row 显示真实 before/after 字段；窄屏保持完整可横滚；[候选 architecture-delta.mjs](https://github.com/tt-a1i/archify/blob/4c35456b23b5452ca3f620672a8b52545979c945/archify/delta/architecture-delta.mjs) 的 review-values 及选择更新路径。 | [dev L230–250](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/delta/architecture-delta.mjs#L230-L250) 新增 `meta.translations` presentation-change 分类；shell [L785–810](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/delta/architecture-delta.mjs#L785-L810) 仍只有 review status，没有 selected values 面板。翻译差异被识别不等于字段值能就地阅读。 | **独立，保留候选**。刷新时保留 translations 分类；旧 receipt/screenshot 不能绑定新 shell。重点复用真实 selected row 与移动横滚场景，不扩大 Delta 格式合同。 |
| **Diagnostic locations**：CLI/preview 文本呈现已有 subject 的 line/column/path/node 等，同时保留 literal escaping/preview redaction；[候选 diagnostics.mjs](https://github.com/tt-a1i/archify/blob/67328d7de5cdf7bd894bfb526682cff9fdc2d10b/archify/renderers/shared/diagnostics.mjs)、CLI 镜像及 preview formatter。 | [dev CLI L2788](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/archify.mjs#L2788) / [shared L136](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/shared/diagnostics.mjs#L136) 仍拼 severity/code/message/fix；[preview L600–606](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/bin/preview.mjs#L600-L606) 仍逐条拼 code/message/fix。#1102 增加 input-publication/provenance 保护和 JSON diagnostics，并未将已有 subject 投影到文本。 | **独立，保留候选**。CLI 同文件有较多新交付逻辑，避免覆盖；formatter 与 preview 仍可小范围接入。需新基线核真实同文不同 subject、缺值不造值、Windows quoted path 脱敏与保留旧图；不扩诊断规则。 |
| **Finder context**：既有 small meta 文本与按钮 `aria-describedby` 关联；[候选 L164–176](https://github.com/tt-a1i/archify/blob/5b7701c170dabf5d204f3d220ebdb9d39fe178d2/viewer/node-finder.js#L164-L176)。 | [dev L145–169](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/viewer/node-finder.js#L145-L169) action 仍只有 name/count；small 有可见 type/id/sublabel/tag，context 仍仅 title，没有 describedby。新节点 Explain 不关联 Finder 行说明。 | **独立，保留候选**。与 Finder matches 可以在同一 render 函数整合，但两项合同不互相替代。核 filtered rerender ID/ref、重复 label 的 AX 描述和键盘选中；不要声称 title-only context 都会读出。 |
| **Waterfall status**：error/cancelled 附到现有 duration label，经 SVG/Passport/Outline/Finder 逐行可读；[候选 render-waterfall.mjs L210–216](https://github.com/tt-a1i/archify/blob/e20acd6d6c0083f6b6ddecaf7bb250becfbca228/archify/renderers/waterfall/render-waterfall.mjs#L210-L216)。 | [dev L213–218](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/waterfall/render-waterfall.mjs#L213-L218) 仍只生成 duration/incomplete；[L235](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/waterfall/render-waterfall.mjs#L235) 全局 legend 与 tone 不等于逐行 status。#1102 在同 renderer 只修末尾 layout-json stdout drain，不改 label。 | **独立，保留候选**。低成本源码移植仍需保留新 stdout drain；新 Viewer Passport/说明布局改变，应刷新 constructed 3-row 的可读/AX证据，继续不声称自然 workload 收益，也不顺修 incomplete #1030。 |
| **Workflow self-loop**：同节点双端角色只豁免合法首/末接触，仍挡中段/其他障碍；必要 immediate reversal 守卫阻止塌缩候选；[候选 compiler](https://github.com/tt-a1i/archify/blob/eb299b1568327fb77ce7e8a6dcaab610e2b6af0c/archify/renderers/workflow/workflow-compiler.mjs) 的两 clearance 函数及 selfLoopBacktrackSegment。 | [dev firstRouteNodeCollision L3347](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/workflow/workflow-compiler.mjs#L3347) 仍是 from 优先的互斥 endpointRole；[routeClearsEndpointNodes L3428](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/renderers/workflow/workflow-compiler.mjs#L3428) 未支持 same-node 双角色，无 companion guard。#1102 compiler 增量是 renderNode drilldown/anchor，未修 routing clearance。 | **独立，保留候选**。勿遗漏 companion guard，也勿只移第一处端点豁免。新 node wrapper/semantic 输出需重新绑定真实 explicit loop；routing 聚焦边界与旧 auto 成功/真实失败责任可复用为待跑场景，本轮未跑。 |
| **Diff line numbers**：数字 gutter 不拆成多行，code 可横滚；[候选 CSS](https://github.com/tt-a1i/archify/blob/88b0dcb069d89657798e5f1208a90bb2b768fe98/archify/explainer/reader.css#L262) 的 nowrap。 | [dev CSS L262](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.css#L262) 仍无 nowrap；reader.css 逐字等于 82c7。#1102 的 charts/parse/render 修复没有替代表格数字布局。 | **独立，保留候选**。源改动小；新 Explainer prepare/render/发布保护已变，刷新 HTML/ZIP 与同输入 1280/390 布局证据，旧截图保留原身份。 |
| **Keyboard traversal**：按实际 DOM identity/额外 Tab stop 推进，预算与未证实可达分开；[候选 browser-check.mjs L67–150](https://github.com/tt-a1i/archify/blob/d930863147cd6adfb5d4275f011c06caf4b24f92/archify/explainer/browser-check.mjs#L67-L150)。 | [dev L67–88](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/browser-check.mjs#L67-L88) 仍是 `controlCount+3` 循环，文件逐字等于 82c7。#1102 修改 explainer-browser test 的 `closeStep` 只等待 dialog 的异步 close/焦点恢复；Finder IME 与 drilldown 键盘支持也不改变 QA 遍历算法。 | **独立，保留候选**。重点合并新 test 的 close 等待，不能以扩 traversal 掩盖真实 race；刷新 fixed PR 页的实际到达与 trap/budget 负例，别借成功 dev CI 宣称新算法已跑。 |
| **Preview dashed ink**：preview 中 dashed label/path/marker 一起用可读中性 ink，保留 database border/inline/focus 优先级；[候选 CSS L213–217](https://github.com/tt-a1i/archify/blob/36cc35fb446c697046d4f0522253fd7010b2303d/archify/explainer/reader.css#L213-L217)。 | [dev CSS L212–213](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.css#L212-L213) 只有 default edge ink 规则，无三个 dashed 覆盖。native 节点 drilldown 及新 static preparation 不会自动改变这些 preview token。 | **独立，保留候选**。与 Diff nowrap 可同源整合但保留两项独立价值；须在新 native wrapper/Explainer 输出上刷新官方 Plan 同输入三部件颜色/几何与对照，而非只看旧 82c7 产物。 |
| **Clipboard outcome**：Explainer copy API 缺失/拒绝不报成功，完整问题保留可手工复制，重试不重复包装；[候选 reader.js L525–586](https://github.com/tt-a1i/archify/blob/68866954a19cfe3b6599f3c27ff3cb10427f7d44/archify/explainer/reader.js#L525-L586)。 | [dev L526](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L526) 与 [L568](https://github.com/tt-a1i/archify/blob/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/archify/explainer/reader.js#L568) 仍用 `Promise.resolve(navigator.clipboard?.writeText(...))`；缺 API 会走 fulfillment。reader.js 逐字等于 82c7。native Passport 的 copyReaderText 不是 Explainer code/Ask 的调用路径。 | **独立，保留候选**。源路径未冲突，但 test/explainer-browser 新 close 等待应保留。刷新 8 种 API 边界与失败→手工→恢复场景；继续明确受控 API 注入不等于写 OS clipboard。 |

## 整合优先级与成本

最需要先处理共享面的，是 **Relation reference / 新 Passport**：新 dev 有 Explain、子图入口、返回路径、紧凑视口高度与焦点恢复，旧按钮不应机械叠进旧布局。其次是两项 Finder 的同函数组合、export cleanup 两种责任的并存，以及 browser test 新 close 等待与三个 Explainer 候选测试的并存。它们是整合成本，不是删除候选价值的证据。

最小源码移植面仍是 Diff nowrap、Preview dashed 三规则、Waterfall label。但共享生成物必须用新 base 正常生成；不可用旧实验 ZIP 覆盖 #1102 的 Viewer、drilldown、许可、stdout/交付修复。**全部 11 项若进入新 dev，都应重新评估必要 generated/ZIP 与直接行为证据；本轮不据此授权或启动任何刷新。**

新 dev 的 Delta translations、输入依赖保护、stdout drain、节点解释、drilldown、IME 和 camera 修复各自保留明确价值。这里没有建议关掉它们或把其测试删成旧候选断言；同样不能因为它们让相邻文件变多，就称候选已被部分覆盖。

## 结论限制

没有发布/合并/关闭任何候选，没有改分支或重写旧证据；未检查每个候选完整兼容性和 CI 状态，不承诺这些候选在新基线上仍全部通过。下一步最有价值的是按上述共同 ownership 小批整合后，以最终 revision 做直接行为接受，而非再开同义实验或把旧 test 计数相加。若要关闭某候选，仍需证明其具体动作已被新实现满足；本轮未出现这种证据。
