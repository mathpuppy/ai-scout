# Agent Harness 更新简报 · 2026-09-13

> 时间窗：2026-09-04 ～ 2026-09-13（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠区处理：与上期（[agent-harness-brief-2026-09-12](agent-harness-brief-2026-09-12.md)，窗口 09-03 ～ 09-12）重叠 09-04 ～ 09-12。重叠区内全部版本均已在第一期正文展开，本期列版本号带过、不重复展开。本期四家均无上期未收录的核心更新，属空窗期简报，各节以发布节奏观察为主。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | 距上 tag 不足两天，处正常周节拍内；窗口内两个版本均为上期已展开内容 | 无新增 |
| pi | 0.85.1 后连续 8 天无发版、无 commit，为 0.85 线以来最长静默 | 无新增 |
| OpenAI Codex | 稳定版停在 0.154.0；0.155 两天内密集迭代 8 个 alpha 后亦转入静默 | 无新增（alpha 信号见该节） |
| Claude Code | 每日 changelog 流持续，新增 2.1.270 为纯 hotfix | 无能力级新增 |

**本期大盘**：本期窗口相对上期仅前进一天（新增 09-13），四家 harness 的产出全部落在上期窗口内，重叠机制未捕获任何新遗漏——间接验证上期覆盖完整。上期识别的两条主线（上下文预算可编程化、插件生态治理化）本期均无推进，各家的静默形态不同（hotfix 流水 / alpha 打磨 / 完全停更），下期窗口大概率恢复正常产出。

## Hermes Agent
窗口内版本：v2026.9.11（09-12，即 v0.21.2）、v2026.9.7（09-08，即 v0.21.1）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新
窗口内无新核心更新。两个版本的完整评估（password-blind 凭据库、策展插件目录 + 准入 CI、Nous 免费档与引导式首启等）见上期简报，本期不重复展开：

- [v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)（published 2026-09-11T19:20:31Z，本地 09-12）
- [v2026.9.7 · 2026-09-08](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.7)（published 2026-09-07T22:17:01Z，本地 09-08）

### 评估
截至运行时（09-13 晚）距上个 release 不足两天，处正常节拍内：近期 tag 序列为 08-31 → 09-08 → 09-12，间隔 8 天、4 天。值得盯的是 v2026.9.7 官方说明中推迟到 v0.22.0 的完整 curated notes 尚未兑现，下一个版本可能是一次内容量较大的 rollup。

## pi
窗口内版本：0.85.1（09-05）、0.85.0（09-04）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
窗口内无新核心更新。两个版本的完整评估（`SessionManager.inMemory()`、Claude thinking effort 持久化、GPT-6 Astra 接入）见上期简报：

- [0.85.1 · 2026-09-05](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0851---2026-09-05)
- [0.85.0 · 2026-09-04](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0850---2026-09-04)

### 评估
0.85.1 之后连续 8 天无发版、无新 commit（最后一条为 09-10 14:37 本地的 per-model compaction 预算，commit 46bde88a），是 0.85 线以来最长的静默期。main 分支 [Unreleased](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#unreleased) 区间内容与上期记录一致（`compaction.modelOverrides` 的 `reserveTokens`/`keepRecentTokens`、`ctx.modelRegistry.stream()`/`streamSimple()`、内置工具 strict JSON-schema 默认启用），无新增。per-model 压缩预算仍未发版，下个版本落地时值得跟进。

## OpenAI Codex
窗口内稳定版：rust-v0.153.1 / v0.153.2（09-04）、rust-v0.153.3 / v0.153.4（09-05）、rust-v0.154.0（09-10）、python-v0.154.0（09-11）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
窗口内无新核心更新。7 个稳定版的完整评估（`context_management` 实验模式、worktree 隔离检出、行内异步问答、Windows 常驻 server、插件远程市场、GPT-6-Astra 全线接入）见上期简报：

- [rust-v0.153.1 · 09-04](https://github.com/openai/codex/releases/tag/rust-v0.153.1) / [rust-v0.153.2 · 09-04](https://github.com/openai/codex/releases/tag/rust-v0.153.2) / [rust-v0.153.3 · 09-05](https://github.com/openai/codex/releases/tag/rust-v0.153.3) / [rust-v0.153.4 · 09-05](https://github.com/openai/codex/releases/tag/rust-v0.153.4)
- [rust-v0.154.0 · 09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0) / [python-v0.154.0 · 09-11](https://github.com/openai/codex/releases/tag/python-v0.154.0)

### 评估
稳定线停在 0.154.0。活跃信号集中在 prerelease 线：本地时间 09-10 19:06 至 09-11 22:52 两天内连续产出 rust-v0.155.0-alpha.1 至 alpha.3.10 共 8 个 alpha（[列表](https://github.com/openai/codex/releases)），随后 09-12 ～ 09-13 稳定与 alpha 线同时静默。两天 8 个 alpha 的密度说明 0.155 处于密集打磨尾声，按其 0.153→0.154 的节奏（约一周一个 minor），下期窗口有望迎来 0.155.0 稳定版。alpha 内容按规则不进简报，不做评估。

## Claude Code
窗口内版本：2.1.260 ～ 2.1.269（09-04 ～ 09-12，均已在上期展开）、**2.1.270（09-13，本期新增）**。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
窗口内无新核心更新。2.1.260 ～ 2.1.269 的完整评估（`claude plugin eval`、`managedMcpServers`、`--permission-prompts none`、`/skill-doctor`、`--plugin-dir`、Workflow 并发上限、`maxEffortLevel`）见上期简报。本期新增的 2.1.270 仅含一条修复，不构成能力级更新，见"其他动态"。

### 评估
每日 changelog 流保持，但 2.1.270 是典型的 hotfix：上期的 2.1.269 是 70+ 条的大版本，270 只为其善后（权限判定改动的回归），说明 269 中 deny/ask 规则与权限相关的一揽子改动仍有波纹，此类大版本后的补丁值得在后续窗口继续观察。

### 其他动态
- 2.1.270（[2026-09-13](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21270)，commit [2b40e76d](https://github.com/anthropics/claude-code/commit/2b40e76d)，入账 09-13 03:45 本地）：修复会话运行一段时间后 read-only git 命令意外触发权限确认（2.1.269 引入的回归）。

## 横向趋势
- **空窗是窗口重叠的结构性结果**：本期窗口较上期仅前进一天（09-13），四家在 09-13 的唯一产出是 Claude Code 的一条 hotfix。重叠机制本期未捕获任何新遗漏，间接验证上期简报对窗口边界的覆盖是完整的。
- **四种静默形态并存**：Claude Code 保持每日流水但退化为 hotfix 善后；Codex 稳定线停在 0.154.0、alpha 线两天 8 发后骤停（0.155 打磨期的典型节奏）；pi 完全无 commit 停更 8 天；Hermes 距上 tag 不足两天、处正常周节拍。同为静默，各自的信号含义不同。
- **上期两条主线均无推进**：上下文预算可编程化（Codex `context_management` / pi per-model compaction / Claude Code 成本可见化）与插件治理化（Hermes 目录 / Codex 市场 / Claude Code eval）本期零增量，属蓄力期而非转向。
- **下期窗口的预期压力点**：Codex 0.155.0 稳定版、pi 含 per-model compaction 预算的新版本、Hermes 承诺 curated notes 的 v0.22.0，三者都已在上期或本期出现前置信号，若同窗落地，下期简报体量可能反冲。
