# Task flow CI：首次失败与单任务重跑

PR #1121 的 head 仍为 `843c877b251baf89925f99e11594fc5630c1c165`，产品基线仍为 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。先前 [Sequence 短视口失败诊断](task-flow-ci-diagnosis.md)及初始失败日志保留。本记录不推断根因，也不把本地通过代替 hosted 结果。

2026-10-27 00:24:17 UTC，run `40423164172` attempt 1 已完成，conclusion 为 failure。`webm-decode` job `121922351484` 实际成功完成；后续 `webm-artifact` job `121932335834` 失败于汇总条件。其日志明确 `BROWSER_RESULT=failure`、`WEBM_RESULT=success`，对应 `.github/workflows/ci.yml` 的 needs 和 shell 断言，不能称为第二个 WebM 解码错误。

在 workflow 已终止后，仅请求重跑原失败 browser job：

```sh
gh run rerun 40423164172 --job 121922351456
```

命令 exit 0，服务于 00:26:49 UTC 返回 queued。随后 00:28:17 UTC 读取同一个 run，attempt 2 为 in_progress：新的 `browser-regression (2)` job `121933285329` 于 00:26:53 UTC 开始。其余列出的成功 job 沿用 attempt 1 的原 startedAt/completedAt，不能写成全套重新执行。没有改实验源码、共享产品代码或测试，也没有启动新的全套 run。

上述 00:28 快照尚无 attempt 2 结果；随后持续查询同一 run，没有再次重启。

## Attempt 2 已完成

2026-10-27 00:31:02 UTC，同一 run 的 attempt 2 以 success 完成。`browser-regression (2)` job `121933285329` 于 00:30:55 UTC 成功结束；依赖它的汇总 job `webm-artifact` `121934784879` 于 00:31:01 UTC 成功结束。PR 精确 head 的最新检查清单为 19 success、2 deployment skipped。

这证明失败 job 在同一 head 的重跑通过，加上复用的其他成功 job 后 workflow 已通过；不证明首次失败不存在，也没有确定它的根因。原始 Sequence containment 失败与一次本地 Reader Layout 18/18 通过继续保留。没有以重复全套测试或扩大产品修改来消除红灯。
