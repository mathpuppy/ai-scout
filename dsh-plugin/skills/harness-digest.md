# harness-digest — Agent Harness 更新简报

抓取固定名单内 Agent Harness 的官方 GitHub 发布渠道，筛出"架构迭代 / 新能力"级别的更新，产出中文评估简报。定位为**一周运行一次的周度分析任务**：默认窗口从 `min(运行日 − 9, 最新一期简报运行日)` 到运行日，刻意比周间隔多出约 3 天，用窗口重叠兜住边界附近的遗漏；上期距今超 9 天（漏跑）时窗口自动前伸补洞。

流程：① 确定时间窗 → ② 抓取 → ③ 语义筛选 → ④ 撰写简报 → ⑤ 落盘 `raw/lines/<运行日>/`。

## 监控名单（配置区）

增删名单直接改这张表，改动只影响之后的运行。各渠道的具体 URL 与抓取命令统一见 ②，此处不重复。

| Harness | 仓库 | 权威数据源 | 注意事项 |
|---|---|---|---|
| Hermes Agent | NousResearch/hermes-agent | GitHub Releases API | 官方渠道只有这个 Releases；hermes-ai.net 等社区站不采用 |
| pi | earendil-works/pi | 仓库内 `packages/coding-agent/CHANGELOG.md` | 原仓库 badlogic/pi-mono 已迁移至此；GitHub Releases 页说明过于简短，仅作版本号对照 |
| OpenAI Codex | openai/codex | GitHub Releases API | **只取 `prerelease=false && draft=false` 的稳定版**，alpha 线不进简报 |
| Claude Code | anthropics/claude-code | 仓库内 `CHANGELOG.md` | Releases 页滞后严重，不采用 |
| DeepSeek Harness | deepseek-ai/deepseek-harness | GitHub Releases API | 仓库无 CHANGELOG，release notes 中英双语、结构化（新增功能/体验优化），是唯一官方渠道；**全部版本为 prerelease（alpha/rc 双轨，稳定版未发布），故只过滤 `draft`，prerelease 照收**（与 Codex 相反）；发布节奏快（数天一版），筛选从严——UI / 体验优化类条目归「其他动态」 |

## ① 确定时间窗

- 默认窗口 = [起点, 运行日]，起点 = `min(运行日 − 9, 最新一期简报的运行日)`，本地时区。**防漏跑**：上期运行距今超过 9 天时起点前伸到上期运行日补洞（正文头部注明窗口扩大及原因），无历史简报时起点 = 运行日 − 9。按周运行时与上期窗口重叠约 3 天，属刻意设计，处理方式见下条。
- 用户传参则覆盖：接受日期区间（"2026-08-01 到 2026-08-15"）与相对说法（"最近两周"、"上个月"）。
- 窗口与上期简报重叠属预期，重叠的目的是兜住上期边界附近漏收的版本。`raw/lines/` 各日期目录已有历史简报时，先读最新日期目录里的一份确认重叠区：已在上期正文展开过的版本不重复展开（列版本号带过即可），上期未收录、或日期归因有变的照常完整收录。用户显式指定窗口时照办。
- 时间窗写进简报头部；正文只收录发布时间落在窗内的版本。

## ② 抓取（scripts/fetch-harness.py 预处理 → 紧凑摘要）

模型**不直接 curl 原始数据**，先跑预处理脚本（脚本由 ai-scout 插件提供，绝对路径在环境变量 $DSH_TRACKER_SCRIPTS；在项目根执行，产物落盘路径相对 cwd）：

> pwsh 下环境变量写作 `$env:DSH_TRACKER_PYTHON` / `$env:DSH_TRACKER_SCRIPTS`，Python 用 `$env:DSH_TRACKER_PYTHON`（本机 `python3` 是 Microsoft Store 占位符，不可用）；兜底 curl 一律用 `curl.exe`（pwsh 的 `curl` 是 Invoke-WebRequest 别名）。

```bash
"$DSH_TRACKER_PYTHON" "$DSH_TRACKER_SCRIPTS/fetch-harness.py" <窗口起点> <窗口终点> raw/lines/<运行日>/harness-fetch.md
```

脚本确定性完成以下工作（Python 标准库，零新依赖；api.github.com 共 4 次调用，匿名 60 次/小时额度内，重试翻倍也在额度内；raw.githubusercontent.com 不占额度）：

- 五个渠道抓取 + 重试：不可达退避重试、403/429 等 60 秒再试、大文件断流续传，仍失败写「缺口」。
- 规则过滤：Codex 只留稳定版（prerelease=false && draft=false）；DeepSeek 只剔 draft（prerelease 照收，alpha/rc 双轨并列）；Hermes 剔 draft。
- 窗口过滤（本地时区，含端点）：release 正文截断 800 字、CHANGELOG 版本节截断 400 字；pi 版本头自带日期，窗口过滤确定化；Claude Code 版本节无日期，保留前 12 节 + commits 对照表（40 条）。
- GH_TOKEN 存在时自动带认证（提升额度）。

然后**读 `raw/lines/<运行日>/harness-fetch.md`——它即是本期全部原始事实**。渠道缺口照写进简报对应节；**不得凭训练记忆补写版本号或功能描述**。

兜底命令（脚本失败、或某条正文被截断需要全文判断时，单独补拉；注意 Codex 端点响应大、偶发 504，用 per_page=15）：

```bash
curl.exe -s "https://api.github.com/repos/NousResearch/hermes-agent/releases?per_page=30"
curl.exe -s "https://api.github.com/repos/openai/codex/releases?per_page=15"
curl.exe -s "https://api.github.com/repos/deepseek-ai/deepseek-harness/releases?per_page=30"
curl.exe -s "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
curl.exe -s "https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/CHANGELOG.md"
```

日期归因规则：

- API 时间戳（`published_at`、`committer.date`）均为 UTC，脚本已统一转本地时区日期；简报中的日期用本地日期。
- pi 版本头自带日期；Claude Code 版本节无日期（commits 消息不带版本号），用摘要里 commits 对照表就近近似（第 i 节 ≈ 第 i 行，约每日一更），简报中注明"日期为 commit 就近近似"。
- DeepSeek 双轨发版：同一功能的多个候选版本（alpha/rc）只取**最新一条**展开（其余列版本号带过），避免重复；release body 分「新增功能 / 体验优化 / 修复」小节，筛选口径同全局——「新增功能」中改变工作方式/能力面的条目纳入，体验优化与修复类条目在「其他动态」一行带过。

## ③ 语义筛选（模型判断，不设硬规则）

对窗内每个版本的条目，按"这是否改变了 agent 的工作方式，或新增了能力面"来判断：

- **纳入**：架构 / 执行模型迭代（新的规划-执行循环、并行子代理、上下文管理策略等）；新工具或新能力面（记忆、MCP、权限 / 沙箱、检查点、模型路由、技能系统等）；官方明确定位的全新能力。
- **排除**：bug 修复、性能小优化、纯 UI / 交互 / 快捷键调整、文档、依赖升级、内部重构。
- 拿不准的倾向排除，可在该节末尾用一行"其他动态"带过（只列事实，不写评估）。
- 每条纳入项必须给一句纳入理由（为什么算架构 / 能力级）。

## ④ 撰写简报

- 全文中文；写入 `raw/lines/YYYY-MM-DD/agent-harness-brief-YYYY-MM-DD.md`（两个 YYYY-MM-DD 均为运行日，目录不存在则创建；历史简报保留，不覆盖；同一运行日生成第二份时文件名追加 `-2`、`-3` 序号）。
- 结构骨架（照此填内容）：

```markdown
# Agent Harness 更新简报 · YYYY-MM-DD

> 时间窗：YYYY-MM-DD ～ YYYY-MM-DD · 数据源：各项目官方 GitHub（链接见各节）

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| <名单内每个 harness 一行> | <一句概括本周定性> | <1-3 个能力点> |

**本期大盘**：<1-2 句跨 harness 总判断。只许压缩自各节评估与"横向趋势"，不得出现正文没有的论断。>

## Hermes Agent
窗口内版本：v0.20.6（08-27）、…

### 核心更新
- **<能力标题>** — <一句话描述>。*纳入理由：…* ([v0.20.6 · 2026-08-27](<release url>))

### 评估
<2-3 句：动向说明该 harness 在补哪块能力，节奏与强度如何。>

## （其余 harness 同构）

## 横向趋势
<2-3 条跨 harness 观察：各家在卷什么、趋同点、分化点。>
```

- 窗口内没有核心更新的 harness：如实写"窗口内无核心更新"，只列版本号清单，不硬凑。
- **审计要求**：每条更新必须带真实抓取到的版本号、日期、URL 三元组并内联在报告里，且三元组能在 `harness-fetch.md`（或兜底补拉结果）中找到对应条目；链接指向对应 release / changelog 锚点。