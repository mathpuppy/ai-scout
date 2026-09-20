---
name: harness-digest
description: 抓取热门 Agent Harness（Hermes Agent、pi、OpenAI Codex、Claude Code）官方 GitHub 发布渠道在指定时间窗内的更新，语义筛选出 Agent 架构迭代与新能力发布（排除 bug 修复、小功能、交互调整），生成带来源标注的中文评估简报到 raw/lines/<运行日>/。当用户想了解 coding agent / agent harness 的最新动态、要周报或简报、提到 harness 更新盘点、agent 新功能对比时使用——即使用户没说出 "harness-digest" 这个词。
---

# harness-digest — Agent Harness 更新简报

抓取固定名单内 Agent Harness 的官方 GitHub 发布渠道，筛出"架构迭代 / 新能力"级别的更新，产出中文评估简报。定位为**一周运行一次的周度分析任务**：默认时间窗 10 天，刻意比周间隔多出约 3 天，用窗口重叠兜住边界附近的遗漏。

流程：① 确定时间窗 → ② 抓取 → ③ 语义筛选 → ④ 撰写简报 → ⑤ 落盘 `raw/lines/<运行日>/`。

## 监控名单（配置区）

增删名单直接改这张表，改动只影响之后的运行。各渠道的具体 URL 与抓取命令统一见 ②，此处不重复。

| Harness | 仓库 | 权威数据源 | 注意事项 |
|---|---|---|---|
| Hermes Agent | NousResearch/hermes-agent | GitHub Releases API | 官方渠道只有这个 Releases；hermes-ai.net 等社区站不采用 |
| pi | earendil-works/pi | 仓库内 `packages/coding-agent/CHANGELOG.md` | 原仓库 badlogic/pi-mono 已迁移至此；GitHub Releases 页说明过于简短，仅作版本号对照 |
| OpenAI Codex | openai/codex | GitHub Releases API | **只取 `prerelease=false && draft=false` 的稳定版**，alpha 线不进简报 |
| Claude Code | anthropics/claude-code | 仓库内 `CHANGELOG.md` | Releases 页滞后严重，不采用 |

## ① 确定时间窗

- 默认最近 10 天，即 [运行日 − 9, 运行日]，本地时区。按周运行时与上期窗口重叠约 3 天，属刻意设计，处理方式见下条。
- 用户传参则覆盖：接受日期区间（"2026-08-01 到 2026-08-15"）与相对说法（"最近两周"、"上个月"）。
- 窗口与上期简报重叠属预期，重叠的目的是兜住上期边界附近漏收的版本。`raw/lines/` 各日期目录已有历史简报时，先读最新日期目录里的一份确认重叠区：已在上期正文展开过的版本不重复展开（列版本号带过即可），上期未收录、或日期归因有变的照常完整收录。用户显式指定窗口时照办。
- 时间窗写进简报头部；正文只收录发布时间落在窗内的版本。

## ② 抓取

用 curl 直接打 GitHub API / raw 文件，一次性抓完。只有 api.github.com 计入匿名 60 次/小时额度（本流程共 6 次调用，重试翻倍也在额度内）；raw.githubusercontent.com 不占额度：

```bash
# Hermes Agent：发布列表（自带 published_at）
curl -s "https://api.github.com/repos/NousResearch/hermes-agent/releases?per_page=30"

# Codex：抓 100 条后本地过滤稳定版
curl -s "https://api.github.com/repos/openai/codex/releases?per_page=100"

# Claude Code / pi：变更记录正文
curl -s "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
curl -s "https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/CHANGELOG.md"
```

- CHANGELOG.md 的版本条目通常不带日期。用提交历史确定每个版本的入账日期，简报中注明是 commit 日期：

```bash
curl -s "https://api.github.com/repos/anthropics/claude-code/commits?path=CHANGELOG.md&per_page=40"
curl -s "https://api.github.com/repos/earendil-works/pi/commits?path=packages/coding-agent/CHANGELOG.md&per_page=40"
```

日期归因规则：

- 版本入账日期 = 首个包含该版本条目的 commit 的日期；一个 commit 打包多个版本时，这些版本共用该日期。
- API 返回的时间戳（`published_at`、`committer.date`）均为 UTC，统一转本地时区日期后再与窗口比较，简报中的日期也用本地日期。
- 40 条 commit 覆盖不到窗口起点时，`per_page` 提到 100，仍不够则 `&page=2` 翻页；翻页后仍覆盖不到的，覆盖到的部分正常入账，并在简报中注明日期为 commit 就近近似。

- 某渠道不可达时重试一次；确认被限流（HTTP 403/429）则等 60 秒再试一次；仍失败则在简报对应节标注"数据缺口及原因"，**不得凭训练记忆补写版本号或功能描述**。

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
<3-5 句：动向说明该 harness 在补哪块能力，节奏与强度如何。>

## （其余 harness 同构）

## 横向趋势
<3-5 条跨 harness 观察：各家在卷什么、趋同点、分化点。>
```

- 窗口内没有核心更新的 harness：如实写"窗口内无核心更新"，只列版本号清单，不硬凑。
- **审计要求**：每条更新必须带真实抓取到的版本号、日期、URL 三元组并内联在报告里；链接指向对应 release / changelog 锚点。
