# Agent Harness 更新简报 · 2026-09-14

> 时间窗：2026-09-05 ～ 2026-09-14（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠区处理：与上期（[agent-harness-brief-2026-09-13](agent-harness-brief-2026-09-13.md)，窗口 09-04 ～ 09-13）重叠 09-05 ～ 09-13，重叠区内全部版本均已在上期正文展开，本期列版本号带过、不重复展开。本期真实新增观察日仅 09-14 一天，四家当日零产出，连续第二期空窗，各节以静默形态与前置信号核对为主。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | 距上 tag 2.7 天，处正常周节拍中段；窗口内两版本均为上期已展开内容 | 无新增；v0.22.0 curated notes 承诺仍未兑现 |
| pi | 0.85.1 后满 9 天无发版、09-10 后 4 天无 commit，静默继续拉长 | 无新增；Unreleased 区间与上期完全一致 |
| OpenAI Codex | 稳定线停 0.154.0；alpha 线两天 8 发后骤停已近 3 天，0.155 未按预期落地 | 无新增（alpha 信号见该节） |
| Claude Code | 2.1.270 后流水断流一天，窗口内版本均为上期已展开内容 | 无新增；断流有 09-07/08 先例，暂属正常波动 |

**本期大盘**：本期窗口较上期仅前进一天（新增 09-14），四家当日零产出，连续第二期空窗。上期预告的三个前置信号——Codex 0.155 稳定版、pi 含 per-model compaction 的新版本、Hermes v0.22.0 curated notes——全部未兑现，各家静默反而在延长（Codex alpha 线骤停近 3 天、pi 无 commit 满 4 天）。蓄力期比预期更长，下期窗口大概率迎来集中释放，届时简报体量可能反冲。

## Hermes Agent
窗口内版本：v2026.9.11（09-12，即 v0.21.2）、v2026.9.7（09-08，即 v0.21.1）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新
窗口内无新核心更新。两个版本的完整评估（password-blind 凭据库、策展插件目录 + 准入 CI、Nous 免费档与引导式首启等）见上期简报，本期不重复展开：

- [v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)（published 2026-09-11T19:20:31Z，本地 09-12 03:20）
- [v2026.9.7 · 2026-09-08](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.7)（published 2026-09-07T22:17:01Z，本地 09-08 06:17）

### 评估
截至运行时（09-14 晚）距上个 release 2.7 天，仍处正常周节拍内：近期 tag 序列为 08-31 → 09-08 → 09-12，间隔 8 天、4 天，当前间隔尚未越过历史区间。v2026.9.7 官方说明中推迟到 v0.22.0 的完整 curated notes 仍未兑现，且 09-12 的 v0.21.2 也未附带——两个版本的内容欠账都指向下一个 tag 可能是内容量较大的 rollup，下期窗口（覆盖至 09-23 前后）落点概率高。

## pi
窗口内版本：0.85.1（09-05，上期已展开）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
窗口内无新核心更新。0.85.1 的完整评估（`SessionManager.inMemory()`、Claude thinking effort 持久化、GPT-6 Astra 接入）见上期简报：

- [0.85.1 · 2026-09-05](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0851---2026-09-05)（release commit [d981de12](https://github.com/earendil-works/pi/commit/d981de12)，入账 09-05 19:54 本地）

### 评估
静默继续拉长：0.85.1 发版至今 9 天无新版本，最后一条 commit（[46bde88a](https://github.com/earendil-works/pi/commit/46bde88a)，per-model compaction 预算，09-10 14:37 本地）之后 4 天无动静，两项均刷新 0.85 线以来的静默纪录。main 分支 [Unreleased](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#unreleased) 区间本期逐条核对，与上期记录完全一致（`compaction.modelOverrides` 的 `reserveTokens`/`keepRecentTokens`、`ctx.modelRegistry.stream()`/`streamSimple()`、内置工具 strict JSON-schema 默认启用），零新增。已就绪未发版的能力面持续堆积，恢复发版时值得整包跟进。

## OpenAI Codex
窗口内稳定版：rust-v0.153.3 / v0.153.4（09-05）、rust-v0.154.0（09-10）、python-v0.154.0（09-11）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
窗口内无新核心更新。稳定版的完整评估（`context_management` 实验模式、worktree 隔离检出、行内异步问答、Windows 常驻 server、插件远程市场、GPT-6-Astra 全线接入）见上期简报：

- [rust-v0.153.3 · 09-05](https://github.com/openai/codex/releases/tag/rust-v0.153.3) / [rust-v0.153.4 · 09-05](https://github.com/openai/codex/releases/tag/rust-v0.153.4)
- [rust-v0.154.0 · 09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0) / [python-v0.154.0 · 09-11](https://github.com/openai/codex/releases/tag/python-v0.154.0)

### 评估
上期"下期窗口有望迎来 0.155.0 稳定版"的预期落空：稳定线停在 0.154.0 已 3.6 天，prerelease 线最后一个 [rust-v0.155.0-alpha.3.10](https://github.com/openai/codex/releases/tag/rust-v0.155.0-alpha.3.10)（本地 09-11 23:52）之后也骤停近 3 天。结合 0.153→0.154 约 7 天的 minor 节奏，alpha 线 8 发后静默 3 天更像在攒一次体量较大的 0.155 合并落地而非打磨尾声。alpha 内容按规则不进简报，不做评估。

## Claude Code
窗口内版本：2.1.261 ～ 2.1.270（09-05 ～ 09-13，均已在上期展开）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
窗口内无新核心更新。2.1.261 ～ 2.1.270 的完整评估（`claude plugin eval`、`managedMcpServers`、`--permission-prompts none`、`/skill-doctor`、`--plugin-dir`、Workflow 并发上限、`maxEffortLevel`、2.1.270 hotfix）见上期简报。本期无任何新版本入账（最后一条 changelog commit [2b40e76d](https://github.com/anthropics/claude-code/commit/2b40e76d)，09-13 03:45 本地）。

### 评估
每日 changelog 流水在 09-14 断流一天。回看 9 月序列（09-02 起逐日更新，中间 09-07/09-08 也曾断过两天），断流一天属正常波动，尚不构成信号；真正值得继续观察的是 2.1.269 大版本（70+ 条）之后的权限回归波纹是否已随 2.1.270 出清——若下期再出权限相关 hotfix，则说明该改动仍在震荡。

## 横向趋势
- **连续第二期空窗，结构成因相同**：两期窗口重叠 9 天，本期真实新增观察日仅 09-14，四家当日零产出。空窗是窗口重叠机制与各家同步静默的叠加结果，而非数据缺口——本期六路抓取全部成功。
- **静默在加深而非缓解**：Codex alpha 线两天 8 发后骤停近 3 天（此前 alpha 线从未停超过一天）；pi 无 commit 满 4 天、无发版满 9 天，双破 0.85 纪录；Claude Code 流水断流。四家中仅 Hermes 的静默（2.7 天）仍在其 4 ～ 8 天正常 tag 间隔内。
- **上期三个前置信号全部落空**：Codex 0.155 稳定版、pi per-model compaction 发版、Hermes v0.22.0 curated notes 均未兑现。连续两期"预期下期反冲"而未反冲，说明本轮蓄力的体量在变大——pi 的 Unreleased 区间已就绪未发、Codex 0.155 系 alpha 停在 3.10、Hermes 欠两版 notes，三家都处于"内容已备、发版未至"状态。
- **下期窗口（约 09-12 ～ 09-21）压力进一步累积**：Codex 若延续 minor 节奏 0.155 应在窗口内落地；Hermes 当前间隔即将触顶历史区间；pi 恢复发版则 Unreleased 整包入账。若三家同窗释放，下期简报体量将显著反冲，建议下期按正常窗口运行、重点盯边界完整性。
