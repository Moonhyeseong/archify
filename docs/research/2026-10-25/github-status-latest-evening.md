# Archify GitHub 晚间状态

固定读取窗口：**2026-10-25 19:20:16–19:21:16 Asia/Taipei（UTC+08）**。官方`tt-a1i/archify` GitHub API为准；原始branch/release/PR/commit/Actions/check-runs响应留在checkout外临时目录。本轮仅新增此报告，未fetch/改refs、跑测试、触发CI、评论、merge或push。状态是读取时快照。

## 当前基线与部署

| 分支 | 完整SHA / 来源 | 精确head的结果 |
| --- | --- | --- |
| main | [`51a291770851ad27a400cca73c753c166b5e0c65`](https://github.com/tt-a1i/archify/commit/51a291770851ad27a400cca73c753c166b5e0c65)；[branch API](https://api.github.com/repos/tt-a1i/archify/branches/main) | [CI40173401042](https://github.com/tt-a1i/archify/actions/runs/40173401042) **waiting**，无整体success；[DSH40173401072](https://github.com/tt-a1i/archify/actions/runs/40173401072) success。24check-runs：21success、1skip、2waiting。 |
| dev | [`10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`](https://github.com/tt-a1i/archify/commit/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0)；[branch API](https://api.github.com/repos/tt-a1i/archify/branches/dev) | [CI40180172440](https://github.com/tt-a1i/archify/actions/runs/40180172440) completed/success，最后更新17:26:42；21check-runs：19success、2deploy skipped，无失败/等待。本head仅1个Actions run。 |

main等待的是[deploy-pages](https://github.com/tt-a1i/archify/actions/runs/40173401042/job/121110043410)与[deploy-cloudflare](https://github.com/tt-a1i/archify/actions/runs/40173401042/job/121110043201)，adapter release skipped。其余测试/包/网站等自动检查成功，**不能据此说当前main的双站部署已完成**，也不等于测试失败。[main精确checks](https://api.github.com/repos/tt-a1i/archify/commits/51a291770851ad27a400cca73c753c166b5e0c65/check-runs?per_page=100)、[dev精确checks](https://api.github.com/repos/tt-a1i/archify/commits/10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0/check-runs?per_page=100)。本轮不验证线上站点实际内容、安装或人类验收。

相对17:29记录，main/dev均未推进：**无需新基线处理**。已冻结/刷新到10b4的Clipboard等证据不因这次GitHub读取失效；仍固定在67f或3f95的历史证据也不被重标成当前head验收。实验分支自己的push/CI须独立绑定，不借dev成功替代。

## 最近合入与发布

最新dev变更仍是[#1102](https://github.com/tt-a1i/archify/pull/1102)于**17:19:29**合入为10b4（父提交67f、98ef），维护批次包含node explanation/drilldown及来源/交付保护等；此后无新dev提交。main最后变更仍是[#1099](https://github.com/tt-a1i/archify/pull/1099) Apache-2.0许可迁移（15:36:19）。[#1098](https://github.com/tt-a1i/archify/pull/1098)为dev许可迁移，随后[#1100](https://github.com/tt-a1i/archify/pull/1100)在15:47:01修source-range/finalize。维护子PR晚些被标merged不表示dev又产生一轮新变更，应以branch SHA判断。

[GitHub latest release](https://api.github.com/repos/tt-a1i/archify/releases/latest)仍为正式非prerelease的[v3.2.0](https://github.com/tt-a1i/archify/releases/tag/v3.2.0)，发布于**2026-10-19 08:43:00台北**，tag解析到完整commit [`208acba8d412335185b2056fedf54b3405df43fb`](https://github.com/tt-a1i/archify/commit/208acba8d412335185b2056fedf54b3405df43fb)。当前main/dev均不是该tag；不能把最新源码维护变化称已随v3.2.0发布。

该tag精确commit的[Release run39180320315](https://github.com/tt-a1i/archify/actions/runs/39180320315) success（10-19 08:43:06更新），另有[CI39140565403](https://github.com/tt-a1i/archify/actions/runs/39140565403)和[DSH39140565176](https://github.com/tt-a1i/archify/actions/runs/39140565176) success。Release附[archify.zip](https://github.com/tt-a1i/archify/releases/download/v3.2.0/archify.zip)，API报5,271,959 bytes；本轮未下载、重建或验其bytes，也不视为当前dev包。

## 指定PR：精确身份与近期变化

| PR | 当前身份 | head精确CI/检查 |
| --- | --- | --- |
| [#1103 Add an Atlas view to Code Analysis](https://github.com/tt-a1i/archify/pull/1103) | OPEN，**draft=true**，未merge；base `labs/code-analysis`，head branch `claude/code-atlas`，完整head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；最后PR更新10-25 16:46:41。 | [CI40177966042](https://github.com/tt-a1i/archify/actions/runs/40177966042) success（16:53:18更新）；精确head1run、21check-runs：19success、2deploy skipped。 |
| [#1015 Explainer visual comprehension](https://github.com/tt-a1i/archify/pull/1015) | OPEN，**draft=true**，未merge；base `main`，head branch `cursor/explainer-visual-comprehension-ed94`，完整head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`；最后PR更新10-19 20:16:09。 | [CI39248491381](https://github.com/tt-a1i/archify/actions/runs/39248491381) success（10-19 20:04:12更新）；精确head1run、21check-runs：19success、2deploy skipped。是旧head自动证据，不宣称在新dev通过。 |
| [#998 Code analysis Main branch](https://github.com/tt-a1i/archify/pull/998) | OPEN，draft=false，未merge；base `dev`，head branch `labs/code-analysis`，完整head `25b767c72e9463a89e9e89b696d26a52318189b3`；最后PR更新10-25 14:30:18。 | [精确head Actions查询](https://api.github.com/repos/tt-a1i/archify/actions/runs?head_sha=25b767c72e9463a89e9e89b696d26a52318189b3&per_page=20) **total_count=0**；[check-runs](https://api.github.com/repos/tt-a1i/archify/commits/25b767c72e9463a89e9e89b696d26a52318189b3/check-runs?per_page=100) **total_count=0**。没有可标pass的当前head记录。 |

PR REST一手身份：[1103](https://api.github.com/repos/tt-a1i/archify/pulls/1103)、[1015](https://api.github.com/repos/tt-a1i/archify/pulls/1015)、[998](https://api.github.com/repos/tt-a1i/archify/pulls/998)。上表check-runs不包含GitHub StatusContext（例如CodeRabbit）；本报告不把run成功等同所有外部review或branch protection接受。

- **1103**：相对早期a034，新增[ffcbe483035f390e2650f1189d38808525f8c0d0](https://github.com/tt-a1i/archify/commit/ffcbe483035f390e2650f1189d38808525f8c0d0)（16:46:05，Atlas motion，改atlas模块/docs/browser test）及[f0be206…](https://github.com/tt-a1i/archify/commit/f0be206acbc90eb7c6c6b636030e3eb28963d284) package刷新（16:46:25）。相对17:29已知f0be并无再次推进。本轮核commit和files，不重做motion运行或视觉验收。Atlas模块/file/function概览及Classic证据交接仍是研发中去重对象，**不算dev已交付能力**。
- **1015**：最近三提交仍是10-19的视觉理解、source expand/backlinks、再移除冗余progress/badges的重构；最终head commit时间19:58:16台北，没有新晚间推进。source/code focus、source-card展开/Copy、reason-to-panel、metric delta等仍在draft中；不能靠旧CI认为已进main/dev。**纠正旧16:35报告的SHA转录漏字：以本表当前API完整`fe4f80…d3dba7…`为准**，旧报告未改写。
- **998**：最新head是[合入#1096的commit](https://github.com/tt-a1i/archify/commit/25b767c72e9463a89e9e89b696d26a52318189b3)（14:30:03），记录extractor revision、comparison不可比原因及fixture；仍在labs分支。没有因其head被1103用作base就意味着998合入dev，也不能把1103的CI转移给998精确head。

本轮未发现触发再次刷新产品实验的dev变化；下一轮研究仍应避免把三个未合入PR的同一控件/提议另做一遍。报告仅作时间点状态，不给PR、不推送、不代替最终整合验收。
