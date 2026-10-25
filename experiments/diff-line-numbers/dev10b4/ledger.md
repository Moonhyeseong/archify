# 证据层级

| 层 | 固定身份 / 含义 |
| --- | --- |
| 历史实验 | 旧候选88b0dcb0与82c7基线，保存上层旧HTML/输入/source/check/observations/evidence/ledger/截图原字节；上层README仅追加刷新说明 |
| 新产品基线 | 固定dev10b4dd5c，git archive完整源码正常finalize同一完整输入，非候选反向删CSS生成 |
| 新候选 | 合并工作树相对dev仅reader.css行号nowrap及正常重建ZIP；merge未提交时由源码、ZIP和HTML hash识别 |
| 同一输入 | 原060fe053…字节未变；引用吻合不是语义/测试/包验证，原ZIP unresolved保留 |
| 新页面对照 | base/candidate去唯一nowrap后逐字相同；页面携带新dev Apache-2.0软件声明 |
| 原生机器结果 | 外置raw stdout、delivery/finalize及Chrome、测试、包日志，公开摘要只列选定字段和相对键名hash/bytes |
| 派生DOM摘要 | 8臂实际测量的数值/几何；省略完整源码行文本，原脚本已逐项deepEqual；完整stdout hash仍保存 |
| 包验证 | 双canonical构建、所有成员CRC、包内CSS exact；实际解包finalize同输出目录结构HTMLexact；不同目录初probe的诊断相对路径差异另列，不隐去 |
| 未刷新输出 | 四份docs/cases历史HTML相对dev不变；basefresh仅复用已有差异证据，不声称本候选生成或通过 |
| 图片 | root已实际截图、逐张查看并绑定冻结HTML；机器几何通过与实际看图、读者效果、AT验收分开 |

逐项hash/bytes由[evidence.json](evidence.json)绑定，不在该JSON内自引用它自己的hash。当前未提交merge不能称新commit或远端已发布；完整browser gate未运行，7个writing warnings未清除。
