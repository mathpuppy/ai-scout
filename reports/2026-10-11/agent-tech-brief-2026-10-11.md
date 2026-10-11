# Agent 技术周报 · 2026-10-11（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [2026-10-02, 2026-10-11]（含补录区 09-28 ～ 10-01：上期运行后存在 4 天缺口，Codex 0.158 ～ 0.159.3、pi 0.99.0 ～ 0.99.2、Claude Code 2.1.284 ～ 2.1.286 按补录规则完整收录） · 论文线 [2026-10-03, 2026-10-09]（实覆盖 5/7 天，10-03 / 10-04 周末页为空） · 产物：agent-harness-brief-2026-10-11.md、trending-2026-10-11.md、papers-2026-10-11.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| pi 九连发冲上 1.0（0.99.0 ～ 1.1.0） | codemode 让模型写 JS 编排工具、虚拟模型逐请求路由、图像/分类进模型运行时，1.0 把全屏 + 低 token codemode 立为出厂默认 | 值得导入 |
| Claude Code 2.1.284 ～ 2.1.296：Mods | 插件从"加工具"升级为可改 UI / prompt / 模型调用 / 权限 / 代理生命周期的深层行为，auto mode 默认化收官、hooks 转 fail-closed | 值得导入 |
| Codex rust-v0.158 ～ 0.162 十连发 | instant_interrupt 输入即抢占执行循环、Guardian 审查加深到会话史、Code Mode 补齐带排序工具搜索、MCP 企业认证 | 值得导入 |
| 模型"上线即默认"第二次集中切换 | Sonnet 5.5、Haiku 5.5、GPT-6.1 Sol 三家同窗上线当天切默认，接入到默认的延迟压缩到 0 天 | 值得导入 |
| Skills 成为独立分发品类 | mattpocock/skills 单目录 8 个月 28.5 万星，与 text-to-cad、asd-ste100-skill 三种形态同现周榜（harness 线分发渠道同期成型） | 值得导入 |
| Hermes Agent v0.21.6 | 一个 tag 滚动约 2,100 个 PR：语音流式转写 + 独立模型路由、插件按 profile 隔离、三组外部报告安全修复；curated notes 欠账连跨五 tag | 值得观望 |
| 上下文与记忆持久化 | claude-mem 跨 harness 记忆层（+4,035）、Claude Code 1M 上下文默认化、pi 把 MCP 清单移出工具描述——多会话持久化仍是最大未解痛点 | 值得观望 |
| 多代理编排：治理细化到参数级 | worktree 从配置项变成 agent 可调用工具、子代理可单独配推理档 / 压缩窗口 / 模型，openrig 用第三方身份跨 harness 组网 | 值得观望 |
| OSC 7501 终端状态协议 | Claude Code 2.1.295 与 pi 1.1.0 同周落地同一协议，终端状态上报首次跨 harness 协议级趋同 | 值得观望 |
| Agent 经验学习与环境制造（论文） | 环境制造与经验蒸馏同周密集上榜，harness 首次成批成为论文一等研究对象 | 值得观望 |
| nanoMuse 个人 agent 开源对标 | 浙大开源对标 Meta Muse 的跨设备个人 agent，repo ⭐833 为论文线入选条目最高 | 值得观望 |

**本期大盘**：pi 12 天九连发（0.99.0 → 1.1.0，版本号 0.87 直跳 0.99 再上 1.0）是本期最大单家事件，"可编程 agent 内核"成为三家共同主战场（pi codemode 语言级沙箱、Claude Code Mods 深层行为修改权、Codex Code Mode 工具面收敛）；模型层第二次"上线即默认"同窗集中切换，安全语义从"默认收紧"走向"fail-closed"（Claude Code hook 失败即阻断、Codex Daybreak 全面 opt-in 化、Hermes 三组外部修复），OSC 7501 则是本期最干净的跨家协议趋同信号。潮流线周榜 Agent 浓度 12 条中 9 条，harness 竞争焦点转向 skills 资产化、记忆持久化、跨 harness 互操作三层基建；论文线主线"经验从哪来、怎么变成能力"（环境制造 × 经验蒸馏），与工程侧高频迭代互为镜像。

## pi 冲上 1.0：codemode 可编程执行面 + 模型运行时多操作面（0.99.0 ～ 1.1.0）

### 事实
- **codemode + MCP + tool search 内置扩展化（0.99.0，补录）** — `codemode` 工具在 QuickJS 沙箱中运行模型编写的 JavaScript 并并行调用 pi 工具；MCP（stdio / streamable HTTP / OAuth，`mcp.json` 全局或项目级）与 `tool_search` 按需声明未暴露工具，三者均以可拆卸的 built-in extension 形态交付（*harness*）（[0.99.0 · 2026-09-30](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0990---2026-09-29)）
- **虚拟模型：逐请求物理模型路由（0.99.0，补录）** — 扩展经 `pi.registerVirtualModel()` 注册虚拟模型，为每个请求挑选物理模型与 thinking 档；footer 显示实际路由、`/session` 按物理模型计成本，内置 `jev-router` 示例（*harness*）（0.99.0，见上锚点）
- **ModelRuntime 多操作面：`generateImages()` 与 `classify()`（0.99.0，补录）** — 图像生成与分类进入模型运行时，上期 Unreleased 预告全额兑现；llama.cpp 聊天模型全部获得基于 next-token 标签概率的分类器形态（*harness*）（0.99.0，见上锚点）
- **扩展工具编排 API（0.99.0，补录）** — `exposure`（direct / model-only / codemode / deferred / hidden）、`namespace`、`prepareLoadout()`、`ctx.executeTool()` 嵌套工具调用（带 `parentToolCallId` 与 `nestedCalls` 有界记录）、`outputSchema` + `structuredContent`（*harness*）（0.99.0，见上锚点）
- **1.0.0 定版：fullscreen 默认 + codemode 瘦身（1.0.0）** — TUI 默认全屏；codemode 描述减约 40% prompt token（GPT-5.6 默认工具下 ~5,300 → ~3,300 token）；`models.generateImages()` 进入 codemode 脚本；MCP OAuth 硬化（RFC 9207 `iss` 校验、按服务器存凭据）（*harness*）（[1.0.0 · 2026-10-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#100---2026-10-01)）
- **项目级 MCP 覆盖 + CIMD 客户端标识（1.0.1）** — `.pi/mcp.json` 可为用户级服务器按项目覆盖 `enabled` / `exposure`；`oauth.clientRegistration: "cimd"` 以 Client ID Metadata Document 替代动态注册，授权服务器可按 URL 放行（*harness*）（[1.0.1 · 2026-10-03](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#101---2026-10-03)）
- **分类器再扩容（1.1.0）** — GPT-6 Luna 经 OpenAI Decisions API 成为 classifier、`models.classify()` 接受图像输入；llama.cpp 0.6.0+ 的原生决策模型形态接入；Claude Haiku 5.5 接入（*harness*）（[1.1.0 · 2026-10-08](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#110---2026-10-07)）

### 简评
12 天九连发，上期预告的能力（codemode、MCP、tool search、虚拟模型、classifier、图像生成、`provider_stream_event`）在 0.99.0 一个版本内全额落地。路线三步清晰可辨：先扩展执行面（模型从逐工具调用变为写 JS 编排工具），再把这条通道的成本做下去（MCP 移出描述、codemode 减 40% token），最后把模型运行时做成 chat / image / classifier 多操作面。1.0 的定版选择（全屏默认、低 token codemode 默认）表明这条线已是产品主干而非实验分支；虚拟模型配合逐请求路由是其中最前瞻的一步。风险面：0.99.0 的 Breaking（内置扩展 `builtin:<name>` 命名、`--no-extensions` 连带禁用 llama.cpp）与 1.0.3 Azure provider 改名（旧会话缓存不复用）对存量用户不友好。

**结论**：值得导入 — 开源 harness 升级即得，codemode / 虚拟模型 / 图像与分类多操作面开箱可用；自写扩展与脚本的用户注意 Breaking 变更与 Azure provider 改名。

## Claude Code 2.1.284 ～ 2.1.296：Mods 开放深层行为修改权

### 事实
- **Claude Mods：插件可修改深层行为（2.1.287）** — 插件系统升级为 Mods；后续版本连续扩充 API：`$.ui.selection()`（2.1.288）、`prompt.autocomplete` 与 `$.model.complete`（带 prompt caching，2.1.292）、`$.ui.notify` 与 Button 子元素（2.1.295）、`tool.check` 的 `ceiling`（组织审批级别）与 `agentId`（2.1.290）、`agent.spawn`（teammates，2.1.289）、`turn.step` 的 `serverToolUses`（2.1.290）、`isDeferred`（2.1.293），覆盖 UI、prompt、模型调用、权限检查、代理生命周期（*harness*）（[2.1.287 · 2026-10-02](https://github.com/anthropics/claude-code/commit/816ec211a)）
- **"You should know" 内置监护 mod（2.1.287）** — 内置 side agent 持续观察会话、标记你或 Claude 可能忽略的问题（`/plugin enable cc-plugin-you-should-know@builtin`）（*harness*）（2.1.287，见上链接）
- **auto mode 默认化收官：全 plan / 全 provider（2.1.284 / 2.1.285，补录）** — 交互终端与 VS Code 会话未配置权限模式时一律以 auto mode 启动；`claude -p` 与 Python Agent SDK 会话在第三方 provider 或 telemetry 关闭时同样默认 auto 启动（`--permission-mode` 可覆盖）（*harness*）（[2.1.284 · 2026-09-29](https://github.com/anthropics/claude-code/commit/8364969e9)、[2.1.285 · 2026-09-30](https://github.com/anthropics/claude-code/commit/ec44ca97d)）
- **Hooks fail-closed：`onFailure: "block"`（2.1.295）** — 命令与 HTTP hook 无法启动、超时或异常退出码时直接阻断动作而非放行；2.1.294 同向修复指令式 prompt/agent hooks"应拦截未拦截"缺陷（*harness*）（[2.1.295 · 2026-10-09](https://github.com/anthropics/claude-code/commit/602df92bf)）

### 简评
Mods 是本期四家中最大的扩展面单点升级：扩展系统从"加工具 / 加命令"升级为对宿主 UI、prompt 补全、模型调用（含缓存）、权限检查、代理生命周期的深度修改权，与 pi codemode / Codex Code Mode 同向，"可编程 agent 内核"由此成为三家主战场。"You should know" 示范了 mods 能承载常驻监护代理，产品化对位 Codex Guardian。权限线上 auto mode 走完"全通道默认"后，安全重心转向 fail-closed（hook 失败即阻断）。十三个版本里 VS Code 侧与 Claude Tag / Code Review 子产品条目占比继续升高，主 CLI 条目密度相对下降，重心在向外围扩散。

**结论**：值得导入 — 更新随自动更新到位；Mods 生态刚起步，可先经官方市场装 mod 观察能力边界；自有 hook 需按"失败即阻断"的新语义复核。

## Codex rust-v0.158 ～ 0.162：抢占式打断 + Guardian 加深 + Code Mode 升级

### 事实
- **`instant_interrupt` 抢占式执行循环（0.159.0，补录）** — opt-in 开启后，新用户输入可在模型响应进行中或长时间 code-mode 调用中直接转向 Codex，执行循环从"等回合结束"变为"输入即抢占"（*harness*）（[rust-v0.159.0 · 2026-09-29](https://github.com/openai/codex/releases/tag/rust-v0.159.0)）
- **Guardian review 上下文扩展（0.160.0）** — opt-in 的 Guardian review 可检索更早的用户指令，并纳入 agent handoff 上下文（*harness*）（[rust-v0.160.0 · 2026-10-02](https://github.com/openai/codex/releases/tag/rust-v0.160.0)）
- **Code Mode 升级：流式 promise 与 ranked tool search（0.162.0）** — JavaScript helper 支持在 promise 结果落定时流式返回；Code Mode 获得 opt-in 的带排序 tool search（*harness*）（[rust-v0.162.0 · 2026-10-09](https://github.com/openai/codex/releases/tag/rust-v0.162.0)）
- **MCP 认证与企业通道硬化（0.158.0，补录）** — 支持预注册 OAuth client secret 的 MCP 服务器（`codex mcp add --oauth-client-secret`）；exec-server 直连 WebSocket 以 bearer token 加固（*harness*）（[rust-v0.158.0 · 2026-09-28](https://github.com/openai/codex/releases/tag/rust-v0.158.0)）
- **Terminal input approval 默认启用（0.158.0，补录）** — 以提权运行的命令默认启用终端输入审批，提权命令的键盘输入通道纳入审批域（*harness*）（rust-v0.158.0，见上链接）
- **自定义 Responses provider 能力协商（0.162.0）** — 自定义 Responses 兼容 provider 可配置 live web access 与远程压缩（remote compaction）能力，第三方 provider 首次可声明联网与云端压缩（*harness*）（rust-v0.162.0，见 rust-v0.162.0 链接）

### 简评
补录区五发 + 窗口内五发共十版，主线三条：执行循环响应性（`instant_interrupt` 抢占、排队消息断线续传）、Guardian 从上期"默认启用"走向本期"上下文加深"（检索会话史与 handoff）、脚本编排通道补齐并发返回与工具发现。GPT-6.1 Sol 的"hotfix 先行 + minor 全量"两段式已成固定套路；同期 Daybreak 被全面收紧为显式 opt-in（默认隐藏控件、无 `/daybreak`、无自动 Cyber 路由），受限能力从默认路径上摘干净，与 fail-closed 大方向一致。

**结论**：值得导入 — 十版随自动更新到位；`instant_interrupt`、ranked tool search 均为 opt-in 按需开启，预注册 OAuth 的企业 MCP 形态直接可用。

## Hermes Agent v0.21.6：语音两级跳 + 插件隔离 + 三组安全修复

### 事实
- **实时转写进入三端语音线（`stt.streaming`）** — 说话过程中即出转写文本，覆盖 CLI / TUI / Desktop，语音交互从"说完再转"升级为流式通道（*harness*）（[v0.21.6 · 2026-10-08](https://github.com/NousResearch/hermes-agent/releases/tag/v0.21.6)）
- **语音轮次独立模型路由（`auxiliary.voice_chat`）** — 口语音轮次路由到专用模型，默认关闭 reasoning，为延迟敏感通道单独配模型与推理档（*harness*）（v0.21.6，见上链接）
- **Per-profile 插件宿主隔离（`plugins.isolation: host`）** — 第三方插件运行在按 profile 划分的独立插件宿主中，Settings ▸ Plugins 集中托管其设置页（*harness*）（v0.21.6，见上链接）
- **三组外部报告的安全修复：dashboard 认证、git filter、邮件网关** — Tenable 报告的 4 项 dashboard 认证缺陷（`X-Forwarded-For` 伪造重置限流、审计日志无界写入、`/auth/` 无体积上限、登录码可重定向到非回环地址致会话接管）；不可信仓库自身的 clean/smudge/process filter 程序可在首次 prompt 前被自动 git 调用执行（会话快照、subagent worktree、kanban 等）；邮件网关 `From` 显示名伪造可绕过发件人白名单（*harness*）（v0.21.6，见上链接）

### 简评
v0.21.6 官方定位仍是 patch rollup，一个 tag 滚动约 2,100 个合并 PR；它也是新 stable release pipeline 切出的第一个版本（attempt ref + 受测 Docker 镜像 + 发布回执，发布工程走向"稳定轨 + 捆绑轨"双轨）。语音线在一个 tag 内完成"流式转写 + 专用模型路由"两级跳，直接对标上期 Codex 语音默认化，差异化在按交互通道独立配模型与推理档；三组安全修复中 git filter 一项是不可信仓库的代码执行路径，是四家本期权重最高的单项安全修复。curated notes 欠账连跨五个 tag（v0.21.2 ～ v0.21.6），"document everything" 承诺仍在后移，细节评估仍受阻于"故意不文档化"。

**结论**：值得观望 — 语音 / 插件隔离方向重要，但文档化欠账影响采用评估；现有用户应尽快升级获取安全修复，架构细节待 v0.22.0 curated notes 兑现。

## 模型"上线即默认"第二次集中切换：Sonnet 5.5 / Haiku 5.5 / GPT-6.1 Sol

### 事实
- **Sonnet 5.5 上线即默认 Sonnet（Claude Code 2.1.284，补录）** — `claude-sonnet-5-5` 上线即为 Anthropic API 默认 Sonnet 模型（1M 上下文，$2 / $10 per Mtok，$0.20 缓存读）（*harness*）（[2.1.284 · 2026-09-29](https://github.com/anthropics/claude-code/commit/8364969e9)）
- **Haiku 5.5 上线即默认 Haiku（Claude Code 2.1.293）** — `claude-haiku-5-5` 上线即为默认 Haiku（1M 上下文，$0.10 / $0.50 per Mtok，100K 以上 $0.50 / $2.50）（*harness*）（[2.1.293 · 2026-10-08](https://github.com/anthropics/claude-code/commit/79babc372)）
- **GPT-6.1 Sol 两级默认化（Codex 0.159.1 → 0.161.0）** — 0.159.1 以 hotfix 先将 GPT-6.1 Sol 设为 bundled 与 Bedrock Mantle / Runtime 目录默认，0.161.0 全量确认（同时 Amazon Bedrock 支持多代理 V2 与 Ultra reasoning，Mantle 接受 GovCloud 区域）（*harness*）（[rust-v0.159.1 · 2026-09-30](https://github.com/openai/codex/releases/tag/rust-v0.159.1)、[rust-v0.161.0 · 2026-10-07](https://github.com/openai/codex/releases/tag/rust-v0.161.0)）
- **pi 同步接入 GPT-6.1 Sol 并设 Codex provider 默认（0.99.1，补录）** — OpenAI / Azure OpenAI Responses / OpenAI Codex 三 provider 接入 `gpt-6.1-sol`，Codex provider 默认模型即切（*harness*）（[0.99.1 · 2026-09-30](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0991---2026-09-29)）

### 简评
继上期 Opus 5.5 / GPT-6 Sol / Luna / Grok 4.7 之后，"上线即默认"第二次同窗集中发生：新模型从接入到默认的延迟压缩到 0 天，"hotfix 先行 + 全量确认"两段式推送成为标准操作。Claude 系一个月内完成 Opus 5.5 → Sonnet 5.5 → Haiku 5.5 三档代际迁移收口，低价档同步换代。对用户是零动作收益，但计费结构变化（Haiku 5.5 在 100K 上下文以上单价升到 $0.50 / $2.50）与旧会话 pin 回落行为（2.1.288 中 auto mode 分类器上下文过长时忽略 5.5 pin 回落 Sonnet 5）需要留意。

**结论**：值得导入 — 默认档随各家更新自动生效、直接可用；长上下文会话注意按档位核价与 pin 行为。

## Skills 成为独立分发品类：28.5 万星单目录 + 垂直与治理两分支

### 事实
- **mattpocock/skills 本周 +9,179 星** — Matt Pocock（TS 教育界名人）公开的个人 `.agents` 目录：面向"真工程师"的 agent skills 集合；285,712 总星、建于 2026-02（8 个月）、MIT（*潮流*）（[repo](https://github.com/mattpocock/skills)）
- **earthtojake/text-to-cad 本周 +2,369 星** — "Give your agent CAD superpowers"：让 agent 生成工程 CAD 模型的 skill / 工具；19,159 总星、建于 2026-04（6 个月）、MIT（*潮流*）（[repo](https://github.com/earthtojake/text-to-cad)）
- **danyuchn/asd-ste100-skill 本周 +945 星** — 将 ASD-STE100 简明技术英语规范改写为 Claude Code skill，用于消除 agent 面向文本的歧义；4,383 总星、建于 2026-07、MIT（*潮流*）（[repo](https://github.com/danyuchn/asd-ste100-skill)）
- **分发渠道同期成型：Claude Code `--marketplace` 一键装插件（2.1.292）** — 官方市场渠道进入稳定版，插件安装降为一键动作（*harness*）（[2.1.292 · 2026-10-07](https://github.com/anthropics/claude-code/commit/fbe20e00e)）

### 简评
三条同现周榜分别代表三种 skill 形态——个人工作流公开化、垂直专业能力、指令语言治理，印证 harness 的能力单元正从 prompt / tool 配置走向可 star、可 fork 的仓库级资产。harness 侧分发渠道（`--marketplace` 一键安装、Hermes v0.21.6 数十个新社区插件）同期成型，供给侧与渠道侧同时到位。上期"skill 从单品向工程品 + 官方品分化"的判断本周进一步收敛为"品类独立"：单目录 8 个月 28.5 万星是最直接的量级证据。

**结论**：值得导入 — skills 是零成本能力资产，放进自己的 coding agent 即可用；垂直包（CAD、受控技术写作）直接找现成安装。

## 上下文与记忆：1M 默认化、token 经济与跨 harness 记忆层

### 事实
- **thedotmack/claude-mem 本周 +4,035 星** — 跨 harness 的会话持久记忆层：录制 agent 全程操作 → AI 压缩 → 按需注入后续会话，官方声明兼容 Claude Code / Codex / Gemini / Copilot / OpenCode 等；99,586 总星、建于 2025-08、Apache-2.0（*潮流*）（[repo](https://github.com/thedotmack/claude-mem)）
- **ranxianglei/billion-context 本周 +259 星** — 面向小上下文窗口的压缩插件：宣称 100K 窗口够用、省 5 倍 token、单会话可跑数月 / 数十亿 token；858 总星、建于 2026-08、许可证未标明（*潮流*）（[repo](https://github.com/ranxianglei/billion-context)）
- **Claude Code 1M 上下文默认化（2.1.287 / 2.1.285，补录）** — Opus 4.7+ 与 Fable 在 Bedrock / Vertex / Foundry / apps gateway 默认 1M 上下文（`CLAUDE_CODE_DISABLE_1M_CONTEXT=1` 保留 200K）；自定义 `ANTHROPIC_BASE_URL` 会话同样默认启用（*harness*）（[2.1.287 · 2026-10-02](https://github.com/anthropics/claude-code/commit/816ec211a)、[2.1.285 · 2026-09-30](https://github.com/anthropics/claude-code/commit/ec44ca97d)）
- **pi MCP 默认不阻塞、按需发现（0.99.2，补录）** — MCP 服务器清单从工具描述移入系统提示一行摘要，连接后台化不再阻塞首条 prompt，脚本用 `searchTools()` / `describeNamespace()` 按需发现（*harness*）（[0.99.2 · 2026-10-01](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0992---2026-09-30)）

### 简评
多会话持久化仍是 harness 最大未解痛点：第三方记忆层以"every agent"定位跨 harness 适配（与上期 hindsight 同赛道），"录制 → 压缩 → 注入"的策略对正确性的影响尚无定论。harness 侧两条路线并行：窗口档位默认放大（1M 出厂默认）与结构性省 token（MCP 清单移出工具描述、codemode 描述减 40%）。窗口、压缩、记忆三种手段同窗推进，恰好说明问题远未收敛。

**结论**：值得观望 — 记忆层方案未定型；claude-mem 已提名监控名单，跟踪其压缩 / 注入策略对正确性与长期会话质量的影响。

## 多代理编排：治理细化到参数级 + 跨 harness 组网实验

### 事实
- **Codex managed Git worktrees 工具化 + 任务置顶（0.162.0）** — 新增从受信本地项目创建与列出受管 Git worktree 的内置工具（worktrees 特性启用时）；agent Command Center 支持 `p` 置顶任务并进入共享 Pinned 组（*harness*）（[rust-v0.162.0 · 2026-10-09](https://github.com/openai/codex/releases/tag/rust-v0.162.0)）
- **Claude Code 子代理治理三件套（2.1.292 / 2.1.296）** — Agent tool 新增 `effort` 参数按代理指定推理档；`autoCompactWindow` 进入 subagent frontmatter 与 `--agents` 定义，子代理可先于主会话自动压缩；`CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 统一 workflow 代理模型（*harness*）（[2.1.292 · 2026-10-07](https://github.com/anthropics/claude-code/commit/fbe20e00e)、[2.1.296 · 2026-10-10](https://github.com/anthropics/claude-code/commit/2301018b1)）
- **Teammates 编排事件统一（2.1.289）** — `agent.spawn` hook 覆盖 teammates，插件 hook 事件获得统一 agent id，`$.agent.list()` 增加 idle / waiting 状态（*harness*）（[2.1.289 · 2026-10-04](https://github.com/anthropics/claude-code/commit/2bfb629df)）
- **mvschwarz/openrig 本周 +2,068 星** — 把 Claude Code / Codex / Pi 组成持久 agent 团队：角色分工、共享上下文、归属工作单元的多 harness 编排网络；6,868 总星、建于 2026-04、Apache-2.0（*潮流*）（[repo](https://github.com/mvschwarz/openrig)）

### 简评
隔离单元（worktree）从配置项升级为 agent 可直接调用的内置工具，推理档、压缩窗口、模型配置成为 per-agent 独立维度，多代理生命周期对扩展系统全程可观测——治理粒度已细化到参数级。openrig 以第三方身份回答"harness 之间如何组网"，与 Cursor 官方插件规范（见热门区）一民间一官方同题。单 harness 内的治理已可用，跨 harness 组网则尚无标准形态。

**结论**：值得观望 — 单 harness 内 worktree / 子代理治理随版本直接可用；跨 harness 组网仍处实验期，看 openrig 的"持久团队 + 共享上下文"设计是否被验证。

## OSC 7501：终端状态协议首次跨 harness 同周落地

### 事实
- **Claude Code 实现协议（2.1.295）** — 实现该协议的终端可显示 Claude Code 的工作 / 等待用户 / 完成状态（*harness*）（[2.1.295 · 2026-10-09](https://github.com/anthropics/claude-code/commit/602df92bf)）
- **pi 同周落地（1.1.0）** — 支持 OSC 7501 的终端与 agent dashboard 可见 pi 的工作 / 等待对话框 / 完成 / 失败状态（*harness*）（[1.1.0 · 2026-10-08](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#110---2026-10-07)）

### 简评
终端状态上报（working / waiting / done / failed）首次出现跨 harness 的协议级趋同；此前 MCP 协议版本的跟进也呈"一家定、各家跟"模式，OSC 7501 是第二个样本，agent dashboard 与终端集成的标准化开始。当前收益是终端里的状态可视化，长期价值取决于终端模拟器与工具链的采纳广度。

**结论**：值得观望 — 协议方向重要，当下是显示层增益，随终端生态采纳程度再评估。

## Agent 经验学习与环境制造（论文线）

### 事实
- **Self-Retrospection Distillation（Salesforce AI Research · upvotes 156）** — 提出 prospective learning：当 RLVR 组内 rollout 同酬导致奖励信号消失时，用事后轨迹（hindsight）监督"行动前的预见预测"，把 agent 经验蒸馏成事前判断力〔repo: SalesforceAIResearch/SRD ⭐7〕（*论文*）（[paper](https://huggingface.co/papers/2610.08077)）
- **AgentGarten: Code Worlds for Evolving Agents（MirroS Lab（清华 / 港科大等）〔模型判读〕 · upvotes 149）** — 模拟器 + 游戏引擎 + 共享神经渲染器构建实时代码定义交互环境，保证持久世界状态与真实视觉分布，为 agent 探索式进化提供练习场〔repo: MirroS-Lab/AgentGarten ⭐145〕（*论文*）（[paper](https://huggingface.co/papers/2610.12374)）
- **Learn2Play Bench（National University of Singapore · upvotes 135）** — 全新设计的文字游戏基准，规则刻意不出现在预训练语料中，把"从交互中学习"与"调用既有知识推理"解耦评测〔repo: liushiliushi/Learn2Play-Bench ⭐12〕（*论文*）（[paper](https://huggingface.co/papers/2610.08215)）
- **Trace2Env（Nanyang Technological University〔模型判读〕 · upvotes 105）** — 免训练框架，把历史交互轨迹重建为有状态、可复用的"语言世界模型"，由世界模型 agent 扮演环境来训练 / 评测任务 agent〔repo: ruyue0001/trace2env ⭐40〕（*论文*）（[paper](https://huggingface.co/papers/2610.06100)）
- **Recursive Self-Rewrite / RSR（Tencent Hunyuan · upvotes 103）** — 用单一基座模型在专用 harness 下发现困难任务的成功解，再由 planner / critic / executor 递归重写为通用 harness 下的训练轨迹，剔除验证器泄漏（*论文*）（[paper](https://huggingface.co/papers/2610.02826)）
- **MiMo-V2.6（Xiaomi MiMo〔模型判读〕 · upvotes 72）** — 全模态系列技术报告：多模态中训打底后，沿大批量异步 RL、课程、自生成任务三个维度扩 RL 算力逼近自我改进（*论文*）（[paper](https://huggingface.co/papers/2610.11959)）
- **Questioning the Questions（University of Michigan / Washington University in St. Louis〔模型判读〕 · upvotes 70）** — 定位推理模型自进化崩塌根因：自生成问题中无效题与重复变体逐轮累积，提出治理方案维持自训练循环（*论文*）（[paper](https://huggingface.co/papers/2610.04299)）

### 简评
本周 agent 论文主线是"经验从哪来、怎么变成能力"：环境侧（AgentGarten 代码世界、Trace2Env 轨迹重建环境、Learn2Play 陌生环境评测）与训练侧（SRD 事后经验蒸馏、RSR 轨迹跨 harness 重构、MiMo-V2.6 RL 扩算力）同步升温。harness 一词开始作为一等研究对象成批出现在论文标题与摘要里（RSR、Recursive Game Creator），社区已把"模型外的脚手架"当作可优化资产而非固定基建——与潮流线的 harness 项目热、工程侧三家的"可编程内核"是同一波峰的三个切面。

**结论**：值得观望 — 研究前沿、无即用价值；AgentGarten / Trace2Env 的"环境制造"思路与 RSR 的跨 harness 轨迹重构值得工程侧持续跟踪。

## nanoMuse：个人 agent 的开源对标（论文线）

### 事实
- **nanoMuse: An Open-Source Personal Agent for Every Device You Own（Zhejiang University · upvotes 101）** — 对标 Meta Muse 的开源个人 agent：以"五个问题、三个阶段"定义跨设备、带长期记忆、可主动发起对话的个人 agent 软件形态（强调是软件而非模型）〔repo: nano-muse/nanoMuse ⭐833〕（*论文*）（[paper](https://huggingface.co/papers/2610.08699)）

### 简评
论文线入选条目中 repo 星数最高（833），是本周最强的工程落地信号；个人 agent 的软件形态定义（跨设备、长期记忆、主动对话）与潮流线的记忆持久化议题同向。跨设备编排 + 长期记忆的实现路径尚处早期，适合作为个人 agent 架构的参考实现跟踪。

**结论**：值得观望 — 软件形态早期、无即用价值；repo 活跃度使其成为个人 agent 架构演进的观察样本。

## 本周热门（潮流线）

- [tester-army/e2e](https://github.com/tester-army/e2e) — 本周 +6,564 · 8,904 — 自述"开源 AI 测试框架"的新一代 web / 移动端 e2e 测试框架（TesterArmy 出品，Apache-2.0）；AI 属性依据 README 自述、topics 未含 AI 标签
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) — 本周 +4,081 · 60,711 — "Write HTML. Render video."：HTML 声明式生成视频，口号 "Built for agents"，HeyGen 官方（Apache-2.0）
- [cursor/plugins](https://github.com/cursor/plugins) — 本周 +1,110 · 10,855 — Cursor 官方插件规范 + 官方插件集，harness 开放性的风向标；注意暂无许可证

（本周周榜窗口内无新建仓库。）

## 本周论文（论文线）

- Recursive Game Creator: An Agentic Product-Level Experience-Oriented Game Harness — The University of Hong Kong · upvotes 86 — Designer / Builder / Player / Reviewer 四角色递归开发的 agentic 游戏创作 harness，优化目标从"程序能跑"转向"玩家体验" · [paper](https://huggingface.co/papers/2610.08621)〔repo: IMBALDY/RecursiveGameCreator ⭐42〕
- DecepEval: A Benchmark for Evaluating Deception in LLM Agents — 西安交大 / 港中文〔模型判读〕 · upvotes 74 — 1532 实例、28 个职业场景的 agent 欺骗行为基准，提出 LLM Deception Diamond 框架 · [paper](https://huggingface.co/papers/2610.07967)〔repo: functy/DECEPEVAL ⭐4〕
- SuperNav: An Agentic Navigation System for Any Task in Any Scene — 浙江大学（zju3dv） · upvotes 71 — MLLM 只负责理解请求 / 场景与决策、导航执行交给经典系统，任意任务 × 任意场景的服务机器人导航 · [paper](https://huggingface.co/papers/2610.12126)〔repo: zju3dv/SuperNav ⭐103〕

## harness 监控名单提名

潮流线候选区原样带过：

- **thedotmack/claude-mem** — 提名进 harness-digest 监控名单：跨 harness 记忆层直接触碰 harness 架构核心（上下文管理），且已适配主流 harness 清单，其压缩 / 注入策略值得深度线持续追踪
- **mvschwarz/openrig** — 提名进 harness-digest 监控名单：罕见地以第三方视角做 Claude Code / Codex / Pi 跨 harness 编排，其"持久团队 + 共享上下文"设计对多 agent 架构演进有参考价值
- **cursor/plugins** — 提名进 harness-digest 监控名单：Cursor 官方插件规范是 harness 开放性的风向标，规范演进（协议能力、API 边界）应在深度线跟踪；注意其暂无许可证

一句话建议：三项提名与本期"可编程内核 / 记忆持久化 / 跨 harness 组网"三条主线一一对应，建议采纳；cursor/plugins 采纳时标注无许可证风险，是否采纳由人改 harness-digest 的监控表。
