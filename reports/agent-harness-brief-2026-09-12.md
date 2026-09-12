# Agent Harness 更新简报 · 2026-09-12

> 时间窗：2026-09-03 ～ 2026-09-12（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。本期为首期，无上期重叠区。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | state.db 修复战役为主，但夹带密码盲凭据库、SHA-pinned 插件目录、免费档三条能力级更新 | password-blind 凭据库；插件目录 + 准入 CI；Nous 免费档 |
| pi | 两个小版本平稳迭代：模型接入跟进（GPT-6 Astra、Claude effort 持久化）+ SDK 会话恢复 | `SessionManager.inMemory()`；GPT-6 Astra；（main 未发版）per-model 压缩预算 |
| OpenAI Codex | 7 个稳定版密集发版，三条架构级更新落地 | `context_management` 实验模式；worktree 隔离会话；Windows 常驻 server |
| Claude Code | 9 个版本连发，插件治理化与上下文成本可见化是主线 | `claude plugin eval`；`managedMcpServers`；`/skill-doctor` |

**本期大盘**：上下文管理从"自动压缩"走向"可编程预算"、插件生态从"能装"走向"可治理"是两条共同主线；Codex 和 Claude Code 同时在为多会话并行与大 fan-out 补基础设施。GPT-6-Astra 的新模型接入消耗了 Codex 0.153 线整整四个补丁，说明模型 rollout 已成为 harness 的常规工程负担。

## Hermes Agent
窗口内版本：v2026.9.11（09-12，即 v0.21.2）、v2026.9.7（09-08，即 v0.21.1）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新
- **密码盲凭据库（password-blind credential vault）** — agent 可以登录、支付、填写地址，凭据来自 1Password / Bitwarden / 本地 Hermes vault，全程拿不到明文；两步验证码从已保存的 authenticator key 取，或转到用户 UI 询问。*纳入理由：把"agent 能用凭据但看不见密钥"做成了凭据访问的架构约束，属于权限/信任模型级的新能力面。* ([v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)，#106480、#107585)
- **策展插件目录 + 统一 Plugins 页** — 带 SHA-pinned 固定、准入 CI、文档与 dashboard 的官方插件索引；Desktop 端合并出单一 Plugins 页，管理 agent 与 desktop 插件的安装、目录和 per-commit 固定；Radio 以 opt-in SDK 插件形式发布。*纳入理由：第三方扩展从散装安装升级为带供应链治理的目录体系，是插件系统能力面的实质扩张。* ([v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)，#69446、#107212、#107314、#107321、#107072)
- **Nous 免费档与引导式首启** — 一条命令登录即得免费推理与连接器（Gmail、Linear、Notion 等经 `tool_search` 可搜），聊天内 `/login`，`HERMES_GUEST_ONBOARDING=1` 开启引导首启流程。*纳入理由：官方明确定位的新能力（零成本上手面），改变了新用户的默认能力边界。* ([v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)，#105258、#105260、#105261、#106842、#107697)

### 评估
本期主标题其实是可靠性：v0.21.0 对会话存储连接处理的大重写让部分安装的 `state.db` 变脆（写者互踩锁、健康库被误判损坏），v0.21.2 用六个 PR 关掉这一类共 44 个 issue；另有多 profile 隔离加固（修复副 profile 继承默认 profile 的 allow-list、vault 密钥、`.env` 等一串越权面）和 Desktop 后端 spawn 风暴修复——均为修复类，不计入核心更新。能力面靠上述三条推进，且方向一致：面向"托管多 profile、多平台 bot 网关"的长期运行形态补课。工程节奏上单个 patch 卷入 947 个非合并 commit，社区 salvage（把社区诊断转成 PR）机制是它的显著特色。

### 其他动态
- v2026.9.7（v0.21.1，[09-08](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.7)）：rollup tag，官方说明完整 curated notes 推迟到 v0.22.0；窗口含代码模块化、文件操作与启动性能、provider 更新、desktop 会话控制与浏览器注解、MCP 授权改进、cron 与 delegation 可靠性修复。
- v0.21.2 修复清单另含 agent loop 与压缩类修复（如 `/steer` 持久化为独立 user 行、context-overflow 后正确结束 turn），详见 release 页。

## pi
窗口内版本：0.85.1（09-05）、0.85.0（09-04）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **可恢复的内存会话（`SessionManager.inMemory()`）** — SDK 支持把外部管理的 session 条目恢复进 pi 继续跑。*纳入理由：会话的存储与生命周期管理向 SDK 调用方开放，是会话管理能力面的扩展。* ([0.85.0 · 2026-09-04](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0850---2026-09-04)，#8980)
- **Claude thinking effort 持久化** — 支持的 Anthropic 传输层逐轮保留 effort，并能从 signed-thinking 不匹配中安全恢复。*纳入理由：模型推理参数跨轮持久化涉及传输协议层语义，超出普通配置项。* ([0.85.0 · 2026-09-04](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0850---2026-09-04))
- **GPT-6 Astra 接入** — OpenAI API key 与 OpenAI Codex 订阅两条通道均可用。*纳入理由：模型路由面的扩张。* ([0.85.1 · 2026-09-05](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0851---2026-09-05))

### 评估
0.85.x 是两个中等偏小的版本：模型面跟进 GPT-6 Astra 与 Claude effort 持久化，SDK 面补外部会话恢复；其余为 TUI 打磨与大量 provider 修复（vLLM 优先级、Codex SSE 解析、Copilot Fable 5 推理档位等），符合其多 provider 聚合器的定位。真正值得盯的在 main 分支：9-10 已落入未发版区间的 per-model compaction 预算（`compaction.modelOverrides` 的 `reserveTokens`/`keepRecentTokens`）——上下文压缩从全局参数走向按模型分配，下个版本值得跟进。发版节奏约 3-4 天一版。

### 其他动态
- main 未发版区间（[Unreleased](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#unreleased)，commit 2026-09-10）：per-model compaction token 预算；扩展模型调用 API `ctx.modelRegistry.stream()`/`streamSimple()`；内置工具默认启用 strict JSON-schema 采样。
- 0.85.0 另含 vLLM 调度优先级、Responses 输出上限等继承模型设置与大量修复；0.85.1 修复了 0.85.0 误发布内部实验代码导致的 SDK 导入失败。

## OpenAI Codex
窗口内稳定版：rust-v0.153.0（09-03）、rust-v0.153.1 / v0.153.2（09-04）、rust-v0.153.3 / v0.153.4（09-05）、rust-v0.154.0（09-10）、python-v0.154.0（09-11）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **实验性上下文管理模式** — 新增默认关闭的 `features.context_management.experimental_mode`：对符合条件的 ChatGPT Plus/Pro/Pro Lite 会话启用 token-budget context、history notes 和 `new_context` 工具；API key 会话、自定义 provider、临时结构化线程暂不纳入。*纳入理由：上下文管理策略从固定压缩逻辑变为可启用的预算化架构，是执行模型级迭代。* ([rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0)，#42385)
- **Worktree 隔离检出** — `--worktree` 或 `/worktree` 为新建/分叉会话创建隔离工作副本，可浏览与恢复。*纳入理由：把"每会话独立工作区"变成一等能力，直接改变多会话并行的执行模型。* ([rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)，#42652、#43069、#43120、#43286)
- **行内异步问答** — Codex 继续干活时可直接回答用户插入的问题（建议选项或自定义文本），不丢主草稿；底层为 app-server 的 `request_user_input_async` 结构化异步提问 API。*纳入理由：human-in-the-loop 从阻塞式提问改为旁路式，交互/执行模型级变化。* ([rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0) #42891 等；API 见 [rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0) #42178)
- **Windows 共享后台 server** — Windows 会话共享一个后台 Codex server，配 daemon 生命周期命令与托管更新。*纳入理由：客户端/常驻 daemon 分离的架构变化，为长驻与多会话复用铺路。* ([rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)，#42405、#42392)
- **插件 CLI 远程市场** — `codex plugin` CLI 支持从远程 marketplace 列出、安装、移除插件。*纳入理由：插件分发能力面扩张。* ([rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0)，#42150)
- **GPT-6-Astra 全线接入** — 0.153.1 起经四个补丁完成：API 可配置 → 描述修正 → Bedrock 目录 → 捆绑默认模型；0.154.0 进入 model picker；Python SDK 同步新增 `max`/`ultra` 推理档位。*纳入理由：模型路由面的持续扩张。* ([rust-v0.153.1](https://github.com/openai/codex/releases/tag/rust-v0.153.1)～[rust-v0.153.4](https://github.com/openai/codex/releases/tag/rust-v0.153.4) · 09-04～09-05；[rust-v0.154.0 · 09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0) #42879；[python-v0.154.0 · 09-11](https://github.com/openai/codex/releases/tag/python-v0.154.0) #39662)

### 评估
本期最密集的一家：7 个稳定版，且架构级更新集中在两头。0.153.0 的 `context_management` 实验模式是 OpenAI 对"上下文预算可编程化"的首次正式落地（token 预算 + history notes + `new_context` 工具三件套），但限定 ChatGPT 订阅会话，API key 用户暂被排除——分层放量姿态明显。0.154.0 的 worktree + Windows 常驻 server + 行内问答共同指向多会话并行与长驻后台两个方向。0.153.1-4 四个补丁全部服务于 GPT-6-Astra 接入节奏。Python SDK 的 `ExternalMessage`（外部内容以工具级权限加入回合、独立事件流，[#44086](https://github.com/openai/codex/pull/44086)）也值得记录：它把"回合的发起方"从用户扩展到外部系统。

### 其他动态
- rust-v0.154.0 修复：MCP OAuth 刷新协调、启动前不跑工作区可控 helper、macOS 沙箱阻断终端输入注入、压缩后审批上下文保留（安全类修复，事实记录）。
- rust-v0.153.0 另含 `tui.auto_recap` 配置、用量余量提前告警、TUI 历史显示完整 patch；废弃的 `codex mcp-server` 入口已移除。

## Claude Code
窗口内版本：2.1.259（09-03）、2.1.260（09-04）、2.1.261（09-05）、2.1.263（09-06）、2.1.265（09-09）、2.1.266（09-09）、2.1.267（09-10）、2.1.268（09-11）、2.1.269（09-12）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **`claude plugin eval`** — 对插件跑 eval 套件并给出可复现的评分结果（JSON + HTML 报告）。*纳入理由：插件从"能装"到"可评估"，插件系统能力面的实质补齐。* ([2.1.269 · 2026-09-12](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#269))
- **`managedMcpServers` 托管设置** — 组织经 managed settings 向全体用户下发 HTTP/SSE MCP 服务器（条目结构与 `.mcp.json` 一致）。*纳入理由：MCP 供给模式从用户自配扩展到组织统一下发，管理能力面扩张。* ([2.1.259 · 2026-09-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#259))
- **`--permission-prompts none`** — 无人值守 headless 主机：一切本会弹权限确认的操作自动拒绝，同时活动权限模式（含 auto mode）照常裁决。*纳入理由：权限模型新增无人值守语义，改变 agent 在托管环境下的批准行为。* ([2.1.259 · 2026-09-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#259))
- **`/skill-doctor` 与输出预算控制** — 显示哪些已加载 skill 从未使用及其上下文成本，供裁剪；`bashOutputMaxChars` / `taskOutputMaxChars` 可把命令与后台任务的内联输出上限提到 128K 字符。*纳入理由：上下文占用的可见化与预算化，属上下文管理能力面。* ([2.1.261 · 2026-09-05](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#261))
- **`--plugin-dir` 目录级加载** — 指向一个插件文件夹：每个带 manifest 的子目录都加载，运行中增删子目录即时生效。*纳入理由：插件批量装载能力面扩张。* ([2.1.265 · 2026-09-09](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#265))
- **Workflow 并发上限可调** — `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`（1-256）提高 Workflow 工具单次运行的并发 agent 上限，面向推理受限的大 fan-out。*纳入理由：官方对并行子代理编排能力上限的正式扩展。* ([2.1.269 · 2026-09-12](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#269))
- **`maxEffortLevel` 推理档位上限** — 顶层或 per-model 设置，在所有 provider（含 Bedrock/Vertex/Foundry）上封顶 effort 档位，用户只能选更低。*纳入理由：模型路由的治理面（档位管控）而非普通偏好项。* ([2.1.267 · 2026-09-10](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#267))

### 评估
9 个版本连发但单版本粒度小，2.1.263 / 2.1.266 为纯修复，2.1.260 以 UI（/diff 面板）与诊断（/cost 的缓存未命中归因）为主。主线清晰：插件系统治理化（eval 评分、目录批量加载、组织管控）与上下文成本可见化（skill 成本、输出预算）。`managedMcpServers` 与 `--permission-prompts none` 明显服务企业无人值守部署；Workflow 并发上限可调说明官方开始正视大 fan-out 场景。发布节奏维持"每日 changelog 流"，与 Codex 的补丁串形成两种风格。

### 其他动态
- 2.1.260（[09-04](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#260)）：`!` bash 模式命令改为沙箱外执行（即使 strict sandbox 开启）；`/reload-plugins` 进入 headless 命令列表。
- 2.1.265（[09-09](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#265)）：工具结果落盘上限 1GB，截断时预告标注。
- 2.1.268（[09-11](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#268)）：gateway `pricing:` 同步费率到客户端 `/cost`；self-hosted-runner `--remove-session-state` 会话结束清理 per-session 目录；plugin CLI 各子命令补 `--json`。
- 2.1.269（[09-12](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#269)）：`/output-style` 支持 Remote Control 与 headless；压缩后告知当前而非会话开始时的 git status（修复类，上下文准确性）。

## 横向趋势
- **上下文管理进入"可编程预算"阶段**：Codex 的 token-budget context + `new_context` 工具（实验性）、pi 的 per-model 压缩预算（`reserveTokens`/`keepRecentTokens`，main 未发版）、Claude Code 的 `/skill-doctor` 成本可见化与输出预算上限——三家都在把上下文从"自动压缩"推向"预算可见、可控、可按模型定制"。
- **插件生态从"能装"走向"可治理"**：Hermes 上线 SHA-pinned 目录 + 准入 CI，Codex 插件 CLI 接入远程市场，Claude Code 补齐 plugin eval 与目录级批量加载——供应链安全与质量评估成为插件系统的标配关注点。
- **多会话并行基础设施加厚**：Codex 的 worktree 隔离检出 + Windows 常驻 server，Claude Code 的 Workflow 并发上限 1-256 可调——harness 正从单会话工具演进为会话编排平台。
- **human-in-the-loop 异步化**：Codex 行内问答不打断主任务（`request_user_input_async` API + TUI），Claude Code 修复 `/btw` 侧问的虚构工具调用——用户提问从阻塞式转向旁路式。
- **agent 持密出现两种解法**：Hermes 的 password-blind vault 把"用而不见"做成架构约束；Claude Code 与 Codex 则在沙箱语义（`!` 命令、macOS 输入注入阻断）与启动信任上持续打补丁。
