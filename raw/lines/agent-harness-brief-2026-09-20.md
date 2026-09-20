# Agent Harness 更新简报 · 2026-09-20

> 时间窗：2026-09-11 ～ 2026-09-20（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠区处理：与上期（[agent-harness-brief-2026-09-14](agent-harness-brief-2026-09-14.md)，窗口 09-05 ～ 09-14）重叠 09-11 ～ 09-14，区内版本（Hermes v2026.9.11、Codex python-v0.154.0、Claude Code 2.1.270）均已在上期展开，本期列版本号带过。上期预告的三个前置信号本期兑现两个：Codex 0.155 稳定版、pi 含 per-model compaction 的新版本均落地；Hermes v0.22.0 curated notes 仍未兑现。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | 338-PR rollup patch（v0.21.3）落地，本体为修复级，curated notes 第三次跳票至 v0.22.0 | 无核心更新；JSON-RPC 线契约、Agent Sessions API 等官方自述内容待 v0.22.0 展开 |
| pi | 15 天憋出的 0.86.0 整包兑现上期 Unreleased 预告，缓存经济成主线 | prompt cache warming、per-model compaction 预算、transcript-aware 指令更新、`/bug` 遥测 |
| OpenAI Codex | 0.155.0 / 0.155.1 稳定版落地，`/voice` 开实验性语音交互面 | `/voice` 语音对话、Touch ID MCP 请求验证、daemon 更新调度、agents overview 任务管理 |
| Claude Code | 2.1.271 ～ 2.1.278 八版连发，auto mode 权限分类器在本地/服务端间往返后默认服务端 | server-side classifier 默认化、v2 MCP client + MCP 2026-07-28、账号级技能同步、AGENTS.md |

**本期大盘**：连续两期空窗后，四家在本期同窗集中释放，上期"体量反冲"的预期兑现——pi 一个 0.86.0 吞掉整个 Unreleased 区，Codex 落地 0.155 minor，Claude Code 八版连发，Hermes 打包 338 个 PR。方向高度收敛于两条线：以 prompt 缓存保温、压缩预算、转录感知更新为代表的"缓存经济"，和以服务端权限分类器、Touch ID 验证、子代理输出防注入为代表的"权限安全执行"。

## Hermes Agent
窗口内版本：v2026.9.14（09-15，即 v0.21.3）、v2026.9.11（09-12，上期已展开）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新
窗口内无架构 / 能力级核心更新。v0.21.3 官方定位即 patch：主体两条均为修复——远程网关 refresh token 并发轮换竞态（Desktop 唤醒突发不再触发 Portal 重用检测吊销整段会话）、长生命周期进程 state.db 写句柄泄漏。([v2026.9.14 · 2026-09-15](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.14)（published 2026-09-14T16:04:52Z，本地 09-15 00:04）)

### 评估
tag 节奏加快：08-31 → 09-08 → 09-12 → 09-15，间隔 8 / 4 / 3 天，且本 tag 是为让 Cloud 端自动更新拿到 sign-in 修复而打的 rollup——发布说明自述窗口内含 338 个合并 PR、1,036 个非合并 commit（+131,690 行）。真正的能力级内容被官方"故意不在 patch notes 展开"：server→client JSON-RPC 请求、Pydantic 线契约注册表（生成 TS/OpenRPC）、Agent Sessions API、MCP OAuth refresh token 绑定签发方、multiplexed-profile 隔离等，全部推给 v0.22.0 的完整 curated notes。该欠账已连跨 v0.21.2 / v0.21.3 两个 tag，v0.22.0 一旦落地将是内容量最大的一期，下期窗口（覆盖至 09-29 前后）大概率命中。

### 其他动态
官方自述窗口内亦含：reasoning-effort 全模型选择器接入、OpenRouter OAuth PKCE 登录、HEIF/HEIC/AVIF 解码、FAL 目录新增 Wan 3.0 / Kling 3.0 / MiniMax H3 Max Turbo / Gemini Omni Flash 1.1、Slack 粘贴表格与 Agent Sessions API（均未附细节，官方声明留待 v0.22.0 文档化）。

## pi
窗口内版本：0.86.0（09-20 入账，changelog 正文标注 09-19）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **Prompt cache warming** — 工具长运行与可选空闲期间用成本感知的刷新保活高价 prompt 缓存，带可配模式、模型缓存寿命元数据、`/session` 诊断与 `cache_warming_decision` 扩展事件。*纳入理由：全新能力面，直接改变长会话的成本结构与缓存生命周期管理。* ([0.86.0 · 2026-09-19](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0860---2026-09-19)（release commit [ecac0a9c](https://github.com/earendil-works/pi/commit/ecac0a9c4e)，入账 09-20 07:00 本地）)
- **Per-model compaction 预算** — `compaction.modelOverrides` 按模型配置 `reserveTokens` / `keepRecentTokens`，普通压缩设置作回退。*纳入理由：上期预告兑现，上下文压缩策略从全局单一配置升级为按模型粒度。* ([#8133](https://github.com/earendil-works/pi-mono/issues/8133) · 0.86.0)
- **Transcript-aware 指令与工具更新** — 会话中途变更 system prompt / 工具定义后跨 resume 与分支导航保留，同时保住已缓存前缀（`before_agent_start` 钩子 + 会话格式新条目类型）。*纳入理由：上下文管理架构级——指令演化首次成为会话转录的一等公民而非重启即丢。* ([#9548](https://github.com/earendil-works/pi/pull/9548) · 0.86.0)
- **`/bug` 遥测报告系统** — 脱敏诊断、可选转录或模型自写摘要上传 Radius（无需登录），崩溃记录于 `~/.pi/agent/crashes.json` 并在下次启动播报、附加进下一份报告。*纳入理由：新增官方遥测 / 诊断能力面，含崩溃持久化与上报管线。* (0.86.0，见上 changelog 锚点)
- **`user_bash` fail-closed（Breaking）** — 错误或无效 defined 结果直接中止命令，不再执行本地后续 handler；返回 `undefined` 才继续传播。*纳入理由：扩展权限钩子的安全语义收紧，属执行模型边界变更。* ([#9068](https://github.com/earendil-works/pi/issues/9068) · 0.86.0)

### 评估
上期"恢复发版则 Unreleased 整包入账"完全兑现：0.85.1 → 0.86.0 间隔 15 天（0.85 线以来最长），把上期逐条核对过的四个 Unreleased 项（per-model compaction、`ctx.modelRegistry.stream()`、strict JSON-schema 默认启用、Radius 目录）全部带出，另附三块新能力。主线清晰：cache warming、per-model 压缩预算、transcript-aware 更新、大量"cached prefixes"字样的修复，全部围绕"长会话下保住缓存前缀、压低重算成本"展开，配合 `user_bash` fail-closed 的安全收紧，0.86.0 是一次方向明确的整包。发版当天 Unreleased 区已重新开张（`/bug` 换行修复），流水恢复。

### 其他动态
`ctx.modelRegistry.stream()` / `streamSimple()` 扩展侧模型调用、`compat.allowedFallbackModels` 覆盖 Anthropic 服务端回退模型、内置工具 strict JSON-schema 采样默认启用（无需 `PI_EXPERIMENTAL`）、Fireworks Messages 原生 deferred tool loading、`pi.on()` 返回退订函数（Breaking 另含 `TranscriptContext` 流输入改造）。

## OpenAI Codex
窗口内稳定版：rust-v0.155.0（09-18）、rust-v0.155.1（09-19）；python-v0.154.0（09-11，上期已展开）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **实验性 `/voice` 语音对话** — 支持构建上经 `/experimental` 开启 WebRTC 实时语音：直播转录、麦克风控制条、可配置静音快捷键。*纳入理由：全新交互能力面，从文本 TUI 扩展到实时语音通道。* ([rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)（published 2026-09-17T23:14:43Z，本地 09-18 07:14）)
- **Touch ID 验证 MCP 请求** — macOS 上经 Secure Enclave 签名，本地 TUI 会话的 MCP 请求需用户生物识别确认，配套 TUI 验证提示组件与 user-verification RPC 适配层。*纳入理由：权限 / 沙箱能力面新增硬件级身份验证层。* (rust-v0.155.0，#43624 / #43547 / #43568)
- **daemon 更新调度可配置** — `codex app-server daemon update` 显式命令 + 可配置自动更新时刻，saved threads 与 active goals 可在 daemon 重启后恢复。*纳入理由：常驻 server 架构的生命周期管理成型（自更新 + 状态恢复）。* (rust-v0.155.0，#43542 / #43562 / #44314)
- **agents overview 任务管理** — 任务隐藏 / 归档 / 删除，worktree 所有权详情展示与干净受管 worktree 的确认删除。*纳入理由：并行代理任务编排的管理面从"只能看"进到"能治理"。* (rust-v0.155.0，#43942 / #44424 / #44433)

### 评估
上期预告的 0.155 稳定版如期落地（0.154 → 0.155 间隔 7.6 天，贴合 minor 节奏），0.155.1 次日跟进单条修复（新 TUI 会话 reasoning summary 默认回退 none）。本期四条能力线里，`/voice` 是四家 harness 中首个进入官方实验通道的实时语音交互；Touch ID + Secure Enclave 把 MCP 权限验证抬到硬件级；两者叠加上期已展开的 Guardian 上下文注册表系列 commit，显示 Codex 正在"交互通道 + 权限验证"两端同时加码。alpha 线已恢复高频：0.156.0 系列窗口内跑到 [alpha.9](https://github.com/openai/codex/releases/tag/rust-v0.156.0-alpha.9)（本地 09-20 08:17），按节奏 0.156 稳定版下期窗口落地概率高。

### 其他动态
Bedrock 支持从配置命令获取 AWS 凭据（带缓存与过期刷新）；TUI 状态行实时 reasoning summary 与完成时间戳；修复受限 WSL 沙箱的 Windows 进程逃逸并加固 brokered shell 快照防凭据暴露；MCP 过期 OAuth 凭据准确上报与重连引导。

## Claude Code
窗口内版本：2.1.271（09-15）、2.1.272（09-15）、2.1.273（09-16）、2.1.274（09-17）、2.1.275（09-18）、2.1.276（09-18）、2.1.277（09-19）、2.1.278（09-19）；2.1.270（09-13，上期已展开）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **auto mode 权限分类器默认转服务端** — API / Enterprise / Bedrock / Vertex / Foundry / 网关会话默认用服务端分类器（不收分类器开销费），`/status` 新增 Auto mode server 行；此前 2.1.273 曾把 Bedrock / Vertex / Foundry 默认切回本地。*纳入理由：auto mode 的权限执行架构在本地 / 服务端间往返后定局，执行路径本身变更。* ([2.1.278 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212178)（commit [bf7d404e](https://github.com/anthropics/claude-code/commit/bf7d404e26a5fb6167d21b46c93a2bf6c22ab274)）)
- **MCP 栈升至 v2 client + MCP 2026-07-28 协商** — Bedrock / Vertex / Foundry 及遥测禁用安装默认改用 v2 MCP 客户端与新版协议协商（`MCP_SDK_GENERATION=v1` 可退回）。*纳入理由：MCP 协议栈版本升级，全部安装渠道统一到新一代客户端。* ([2.1.274 · 2026-09-17](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212174)（commit [68ac8bbf](https://github.com/anthropics/claude-code/commit/68ac8bbf02)）)
- **账号级 skills / plugins 同步进终端** — claude.ai 账号上启用的技能与插件同步到该账号登录的终端会话（`syncClaudeAiSkills` / `syncClaudeAiPlugins` 可关）。*纳入理由：技能系统从单机配置升级为账号级跨端能力面。* ([2.1.275 · 2026-09-18](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212175)（commit [38035964](https://github.com/anthropics/claude-code/commit/38035964a7)）)
- **AGENTS.md 支持** — 项目无 CLAUDE.md 时改读 AGENTS.md，`/config` 的 Project instructions 可切换（Bedrock / Vertex / Foundry 暂缺）。*纳入理由：指令系统适配跨工具行业标准文件，改变项目指令的发现逻辑。* ([2.1.277 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212177)（commit [ca02e7de](https://github.com/anthropics/claude-code/commit/ca02e7deeb)）)
- **子代理输出防注入标记** — 子代理结果以带 header 的缩进块送达主代理，其文本无法伪装成会话自身指令；workflow 脚本计算的 `agent()` 提示词同样被框定为脚本作者文本，不再被安全分类器当作用户输入。*纳入理由：多代理架构的信任边界变更，属安全执行模型级。* (2.1.277，见上锚点)
- **auto mode 沙箱按命令域名审查** — Bash / PowerShell / Monitor 在 auto mode 沙箱下逐命令审查并放行所需域名，其余域名拒绝。*纳入理由：沙箱网络边界从会话级细化到命令级。* ([2.1.271 · 2026-09-15](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212171)（commit [f2ccbe27](https://github.com/anthropics/claude-code/commit/f2ccbe2794)）)

### 评估
八版连发（含 2.1.272 纯修复与 2.1.276 单条 hotfix——2.1.275 引入的 `advisor_20260301` beta 头在网关下全量 400，一天内修掉），流水密度为 9 月之最，且上期关注的"2.1.269 权限改动波纹"基本出清：后续版本未再出权限回归 hotfix。主线有二：权限执行（分类器定局服务端 + 命令级域名审查 + 子代理输出信任边界 + npm 插件 `--ignore-scripts` 供应链收紧）与生态兼容（v2 MCP client、AGENTS.md、账号级技能同步）。2.1.277 还移除了废弃的 TaskOutput 工具（改用 Read 读输出文件），背景任务接口在收敛。

### 其他动态
Remote 会话 fast mode（2.1.271）；LLM 网关 hint 请求头（含 `x-claude-code-compaction` 等，2.1.273）；`/code-review` 对无调优配置的模型改用精简 inline 提示、不再 spawn 多个 review 子代理（2.1.274）；remote-control 会话可从 Claude app fork 为本机后台会话（2.1.273）。

## 横向趋势
- **上期预告兑现 2 / 3，反冲如期而至**：连续两期空窗后四家同窗释放——pi 0.86.0 整包（15 天最长间隔）、Codex 0.155 minor、Claude Code 八版、Hermes 338-PR rollup。唯一未兑现的是 Hermes v0.22.0 curated notes，且已连欠两个 tag，成为四家中唯一"内容已备、文档未至"的一家。
- **缓存经济成为最明确的共同主线**：pi 把 cache warming、per-model 压缩预算、transcript-aware 指令更新打包成一个版本；Claude Code 本期十余条修复直接以"prompt-cache miss / cached prefixes"为关键词（如 compaction 后记忆文件年龄注变化导致的缓存未命中、resume 后附件重渲染丢缓存）；Codex 在 TUI 展示实时推理摘要。各家都在把"长会话不重算"当作一等工程问题。
- **权限安全执行同步加深且各择一路**：Codex 走硬件级（Touch ID / Secure Enclave）+ WSL 逃逸封堵；Claude Code 走架构级（分类器服务端化、子代理输出不可伪装为指令、插件 install script 不再执行）；pi 走语义级（`user_bash` fail-closed）。方向相同，层次互补。
- **MCP 与指令标准继续向行业共识收敛**：Claude Code 全渠道升 v2 MCP client + MCP 2026-07-28 协商、并支持 AGENTS.md；pi 稳定 MCP OAuth 刷新语义；Codex 完善 MCP 凭据上报与重连。MCP 已过"可用"线，进入"协议版本治理"阶段。
- **下期窗口（约 09-22 ～ 10-01）看点**：Hermes v0.22.0 curated notes（欠账上限压力最大）；Codex 0.156 稳定版（alpha 已至 .9）；pi 0.86.x 跟进节奏；Claude Code 服务端分类器是否有计费 / 回退争议的后续调整。
