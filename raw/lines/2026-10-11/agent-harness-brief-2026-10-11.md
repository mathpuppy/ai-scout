# Agent Harness 更新简报 · 2026-10-11

> 时间窗：2026-10-02 ～ 2026-10-11（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 补录区说明：本期与上期（[agent-harness-brief-2026-09-27](../2026-09-27/agent-harness-brief-2026-09-27.md)，窗口 09-18 ～ 09-27）实际间隔 14 天，默认 10 天窗口与之不重叠，09-27 上期运行时刻之后 ～ 10-02 之间存在 4 天缺口；该区版本（Codex 0.158.0 ～ 0.159.3、pi 0.99.0 ～ 0.99.2、Claude Code 2.1.284 ～ 2.1.286）上期未收录，按"上期未收录照常完整收录"规则本期补录展开。上期预告兑现情况：pi Unreleased 的 `generateImages()` / `classify()` / `provider_stream_event` 全部兑现于 0.99.0；Codex 0.158 如期落地；**Hermes v0.22.0 curated notes 仍未兑现，欠账连跨第五个 tag**；pi 另以 0.99 直跳 1.0 完成版本线里程碑。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.21.6 一个 tag 滚动 ~2,100 个 PR：新稳定发布管线首切、三组外部报告的安全修复，语音与插件隔离以"故意不文档化"方式落地 | live transcription、`auxiliary.voice_chat` 独立语音模型、per-profile 插件宿主、git filter / dashboard auth / email sender 硬化 |
| pi | 0.99.0 ～ 1.1.0 九连发冲上 **1.0**：codemode+MCP+tool search 内置扩展化、虚拟模型、classifier/图像生成进 ModelRuntime，1.1.0 与 Claude Code 同周落地 OSC 7501 | codemode（QuickJS 沙箱跑模型写的 JS）、virtual models、`generateImages()`/`classify()`、fullscreen 默认、OSC 7501、GPT-6 Luna classifier |
| OpenAI Codex | 补录区 0.158/0.159 + 窗口内 0.160 ～ 0.162 共十发：instant_interrupt 抢占执行循环、GPT-6.1 Sol 两级默认化、managed worktrees 工具化 | `instant_interrupt`、GPT-6.1 Sol 即默认、Guardian review 上下文扩展、managed Git worktrees 工具、ranked tool search |
| Claude Code | 2.1.284 ～ 2.1.296 十三连发：**Claude Mods** 开放插件修改深层行为、Sonnet 5.5 / Haiku 5.5 上线即默认、auto mode 默认化收官、hooks fail-closed | Claude Mods + You should know、Sonnet 5.5 / Haiku 5.5 即默认、auto mode 全 provider 默认、`onFailure: "block"`、OSC 7501 |

**本期大盘**：pi 在九个版本内完成从 0.87 到 1.1.0 的跨越，把上期预告的"模型运行时多操作面"（图像生成、分类、虚拟模型路由）全部落成 1.0 的一部分，是本期最大的单家事件；Claude Code 以 Mods 系统开放深层行为修改权，与 pi 的 codemode/extension API、Codex 的 Code Mode 工具搜索同向，"可编程 agent 内核"成为三家共同的主战场。模型层第二次出现"上线即默认"的同窗集中切换（Sonnet 5.5、Haiku 5.5、GPT-6.1 Sol），安全面则从"默认收紧"走向"fail-closed"（Claude Code `onFailure: "block"`、Codex Daybreak 全面 opt-in 化、Hermes 三组外部报告修复）。OSC 7501 终端状态协议在 Claude Code 与 pi 同周落地，是本期最干净的跨家趋同信号。

## Hermes Agent
窗口内版本：v0.21.6（本地 10-08 19:51）。补录区无（v2026.9.24 即 v0.21.5 已在上期展开）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新

v0.21.6 官方定位仍是 patch rollup，完整 curated notes 继续推迟至 v0.22.0；发布说明延续"故意不在此文档化"体例，以下纳入项出自该正文，细节待 v0.22.0 展开。

- **实时转写进入三端语音线（`stt.streaming`）** — 说话过程中即出转写文本，覆盖 CLI / TUI / Desktop。*纳入理由：语音交互从"说完再转"升级为流式通道，是交互执行模型的实时化。* ([v0.21.6 · 2026-10-08](https://github.com/NousResearch/hermes-agent/releases/tag/v0.21.6))
- **语音轮次独立模型路由（`auxiliary.voice_chat`）** — 口语音轮次路由到专用模型，默认关闭 reasoning。*纳入理由：按交互通道的模型路由策略——为延迟敏感通道单独配模型与推理档，是路由面的新粒度。* (v0.21.6，见上链接)
- **Per-profile 插件宿主隔离（`plugins.isolation: host`）** — 第三方插件运行在按 profile 划分的独立插件宿主中，Settings ▸ Plugins 集中托管其设置页。*纳入理由：插件从主进程共驻走向按 profile 的进程级隔离，扩展系统的沙箱边界升级。* (v0.21.6，见上链接)
- **三组外部报告的安全修复：dashboard 认证、git filter、邮件网关** — Tenable 报告的 4 项 dashboard 认证缺陷（`X-Forwarded-For` 伪造重置限流、审计日志无界写入、`/auth/` 无体积上限、登录码可重定向到非回环地址致会话接管）；不可信仓库自身的 clean/smudge/process filter 程序可在首次 prompt 前被自动 git 调用执行（会话快照、subagent worktree、kanban 等）；邮件网关 `From` 显示名伪造可绕过发件人白名单。*纳入理由：均属执行面 / 边界安全——git filter 一项是不可信仓库的代码执行路径，权重最高。* (v0.21.6，见上链接)

### 评估
节奏上 v0.21.5（09-24）→ v0.21.6（10-08）间隔 14 天，窗口内 2,106 个合并 PR、8,867 个非合并 commit，与上期同量级；v0.22.0 curated notes 欠账已连跨 v0.21.2 ～ v0.21.6 五个 tag，"document everything from v0.21.0 onward" 的承诺仍在后移。本期真正的架构信号有两个：一是 v0.21.6 是新 stable release pipeline 切出的第一个版本（attempt ref + 受测 Docker 镜像 + 发布回执 tag），Desktop / Termux / Store 留在旧构建随下次捆绑发布——发布工程从单轨走向"稳定轨 + 捆绑轨"双轨；二是语音线在一个 tag 内完成"流式转写 + 专用模型路由"两级跳，直接对标上期 Codex 语音默认化，Hermes 的差异化在语音通道的模型/推理档独立配置。安全修复密度（三组、六项、全部外部报告）是四家中本期最高的。

### 其他动态
v0.21.6 官方自述另含：收藏/置顶模型、订阅用量 chip 与限流原因提示、`hermes model` 本地模型 + llama.cpp CUDA（Linux x64/arm64）、核心/Desktop/TUI 分层语言包、summary-first `hermes status`、review-pane diff 范围选择器、cron store 不可写告警、凭据上传与不可见 Unicode 的审批标志、Discord 安装校验、统一 Kanban workflow 定义、`activate.fish`、GPT-6.1 Sol 与 Claude Sonnet 5.5 / Haiku 5.5 入目录、数十个新社区插件（均未附细节，官方声明留待 v0.22.0 文档化）。

## pi
窗口内版本：1.0.0（入账 10-02 02:52）、1.0.1（10-03 20:20）、1.0.2（10-04 08:41）、1.0.3（10-05 16:21）、1.0.4（10-06 03:22）、1.1.0（10-08 05:33）；补录区：0.99.0（09-30 01:04）、0.99.1（09-30 02:06）、0.99.2（10-01 03:12）。版本号自 0.87.1 直接跳至 0.99.0，无 0.88 ～ 0.98。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **codemode + MCP + tool search 内置扩展化（0.99.0，补录）** — `codemode` 工具在 QuickJS 沙箱中运行模型编写的 JavaScript 并并行调用 pi 工具；MCP（stdio / streamable HTTP / OAuth，`mcp.json` 全局或项目级、`/mcp` 与 `pi mcp` 管理）；`tool_search` 按需声明未暴露给模型的工具；三者均以 built-in extension 形态交付，可全局或按项目禁用。*纳入理由：执行模型级新增——模型从"逐工具调用"扩展为"写脚本编排工具"，且整套能力以可拆卸扩展形态进入内核。* ([0.99.0 · 2026-09-30](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0990---2026-09-29)（release commit [4b060d3a9](https://github.com/earendil-works/pi/commit/4b060d3a9)，入账 09-30 01:04 本地）)
- **虚拟模型：逐请求物理模型路由（0.99.0，补录）** — 扩展经 `pi.registerVirtualModel()` 注册虚拟模型，为每个请求挑选物理模型与 thinking 档；footer 显示实际路由，`/session` 按物理模型计成本，内置 `jev-router` 示例用 Jev 分类器路由。*纳入理由：模型路由从"会话选一个"进化为"每请求可编程"，是路由面的架构级扩展。* (0.99.0，见上锚点)
- **ModelRuntime 多操作面：`generateImages()` 与 `classify()`（0.99.0，补录）** — 图像生成与分类进入模型运行时，运行时解析凭据（存储凭据 / OAuth / 运行时 key / `models.json` headers）；llama.cpp 聊天模型全部获得基于 next-token 标签概率的分类器形态，内置 TypeSafe `jev-latest`；pi.dev 目录请求带 `types=chat,image,classifier`。*纳入理由：上期 Unreleased 预告全额兑现——模型运行时从对话通道扩展为"对话 + 图像 + 分类"多操作面，扩展模型列表可按操作类型替换 provider 目录。* (0.99.0，见上锚点)
- **扩展工具编排 API（0.99.0，补录）** — `exposure`（direct / model-only / codemode / deferred / hidden）、`namespace`、`prepareLoadout()`、`ctx.executeTool()` 嵌套工具调用（带 `parentToolCallId` 事件与 `nestedCalls` 有界记录）、`outputSchema` + `structuredContent`。*纳入理由：工具系统获得"谁能调用、以何种通道调用"的显式分层，嵌套调用成为一等公民。* (0.99.0，见上锚点)
- **GPT-6.1 Sol 接入并成 Codex provider 默认（0.99.1，补录）** — OpenAI / Azure OpenAI Responses / OpenAI Codex 三 provider 接入 `gpt-6.1-sol`，Codex provider 默认模型即切。*纳入理由：新模型同窗跟进 + 默认档迁移，模型路由能力面。* ([0.99.1 · 2026-09-30](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0991---2026-09-29)（release commit [d86654abb](https://github.com/earendil-works/pi/commit/d86654abb)，入账 09-30 02:06 本地）)
- **MCP 默认不阻塞、按需发现（0.99.2，补录）** — 默认 `codemode` exposure 的 MCP 服务器不再进入 `codemode` 描述、不再阻塞首条 prompt，改由 `mcp_servers` 系统提示段一行摘要，脚本用 `searchTools()` / `describeNamespace()` 按需发现；另加 `oauth.clientName` 与 provider token 直通 bearer 认证。*纳入理由：MCP 与上下文经济学的结构性整合——服务器清单从工具描述移入系统提示，连接从同步阻塞改后台化。* ([0.99.2 · 2026-10-01](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0992---2026-09-30)（release commit [005af57d8](https://github.com/earendil-works/pi/commit/005af57d8)，入账 10-01 03:12 本地）)
- **1.0.0 里程碑：fullscreen 默认 + codemode 瘦身（1.0.0）** — TUI 默认全屏（`tuiMode: "regular"` 回退）；codemode 描述减约 40% prompt token（GPT-5.6 默认工具下 ~5,300 → ~3,300 token），错误信息自带恢复指引；`models.generateImages()` 进入 codemode 脚本（会话凭据、成本计入会话）；MCP OAuth 硬化（RFC 9207 `iss` 校验、按服务器存凭据、step-up 保留已授权 scope）。*纳入理由：1.0 定版将"全屏 + 低 token codemode"立为出厂默认，图像生成从 ModelRuntime 打通到脚本层。* ([1.0.0 · 2026-10-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#100---2026-10-01)（release commit [a13d35a74](https://github.com/earendil-works/pi/commit/a13d35a74)，入账 10-02 02:52 本地）)
- **项目级 MCP 覆盖 + CIMD 客户端标识（1.0.1）** — `.pi/mcp.json` 可为用户级服务器按项目覆盖 `enabled` / `exposure`；`oauth.clientRegistration: "cimd"` 以 Client ID Metadata Document（pi.dev 托管）替代动态注册，授权服务器可按 URL 放行。*纳入理由：MCP 配置获得项目级覆盖层，OAuth 客户端身份从动态注册升级为可审计的稳定标识。* ([1.0.1 · 2026-10-03](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#101---2026-10-03)（release commit [a7229ddc2](https://github.com/earendil-works/pi/commit/a7229ddc2)，入账 10-03 20:20 本地）)
- **OSC 7501 程序状态上报 + 分类器再扩容（1.1.0）** — 支持 OSC 7501 的终端与 agent dashboard 可见 pi 的工作 / 等待对话框 / 完成 / 失败状态；GPT-6 Luna 经 OpenAI Decisions API 成为 classifier，`models.classify()` 接受图像输入；llama.cpp 0.6.0+ 的 Julia-1 / Laya / Kev / lev / OpenJev 经 `/v1/systemone` 原生决策模型形态接入；Claude Haiku 5.5（adaptive thinking 至 xhigh/max）。*纳入理由：与 Claude Code 2.1.295 同周落地同一终端状态协议；分类器线扩到图像输入与原生决策模型。* ([1.1.0 · 2026-10-08](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#110---2026-10-07)（release commit [abe508e1b](https://github.com/earendil-works/pi/commit/abe508e1b)，入账 10-08 05:33 本地）)

### 评估
本期 pi 是四家中体量与节奏之最：12 天九连发（0.99.0 → 1.1.0），且 0.99.0 单版本承载了上期 Unreleased 预告的全部——codemode、MCP、tool search、虚拟模型、classifier、图像生成、`provider_stream_event` 一并落地。路线清晰可辨：第一步把执行面从"模型逐工具调用"扩展为"模型写 JS 编排工具"（QuickJS 沙箱 + 1 MiB 结构化 bash 结果 + 16 MiB 输出上限等配套），第二步把这条通道的成本做下去（0.99.2 MCP 移出描述、1.0.0 codemode 描述减 40%），第三步把模型运行时做成多操作面（chat / image / classifier 三类目录与凭据解析）。1.0 的定版选择（fullscreen 默认、codemode 低 token 默认）表明这条线已是产品主干而非实验分支。虚拟模型是其中最具前瞻性的一步：配合 Jev 分类器示例，逐请求路由已具备完整可编程形态。风险面同样存在——0.99.0 的 Breaking（内置扩展 `builtin:<name>` 命名、`--no-extensions` 连带禁用 llama.cpp）与 1.0.3 的 Azure provider 改名（旧会话缓存不复用）对存量用户不友好。

### 其他动态
0.99.0：ChatGPT 订阅登录（OpenAI provider）、system theme 默认从终端调色板取色、`fullscreenWheelScrollLines`、RPC `prompt`/`steer`/`follow_up` per-input disposition、HTML 导出隐藏消息开关、TypeScript 7 + Node 原生 type stripping 构建、bash/powershell 结构化结果扩到 1 MiB。1.0.2：`samplingParamsByThinkingLevel`（按 thinking 档配采样参数）。1.0.3：Azure provider 改名 `azure` 并新增 Foundry Chat Completions 部署（`azure/deepseek-v4-pro`）、codemode `image()` 图片落盘。1.0.4：`--tools` 通配模式与 `--no-mcp`、`tools.read()` 图像闭环、QuickJS 冻结内建防原型污染。

## OpenAI Codex
窗口内稳定版：rust-v0.160.0（本地 10-02 04:19）、rust-v0.160.1（10-06 02:29）、rust-v0.161.0（10-07 23:58）、rust-v0.162.0（10-09 02:55）、rust-v0.162.1（10-10 03:44）；补录区：rust-v0.158.0（09-28 13:07）、rust-v0.159.0（09-29 16:05）、rust-v0.159.1（09-30 04:32）、rust-v0.159.2（09-30 07:57）、rust-v0.159.3（10-01 06:57）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **`instant_interrupt` 抢占式执行循环（0.159.0，补录）** — opt-in 开启后，新用户输入可在模型响应进行中或长时间 code-mode 调用中直接转向 Codex。*纳入理由：执行循环从"等回合结束"变为"输入即抢占"，是打断-转向语义的架构级变化。* ([rust-v0.159.0 · 2026-09-29](https://github.com/openai/codex/releases/tag/rust-v0.159.0)（published 2026-09-29T08:05:42Z，本地 09-29 16:05）)
- **Terminal input approval 默认启用（0.158.0，补录）** — 以提权运行的命令默认启用终端输入审批，runtime-only 授权不再触发多余审查。*纳入理由：权限面的默认值扩张——提权命令的键盘输入通道纳入审批域。* ([rust-v0.158.0 · 2026-09-28](https://github.com/openai/codex/releases/tag/rust-v0.158.0)（published 2026-09-28T05:07:23Z，本地 09-28 13:07）)
- **MCP 认证与企业通道硬化（0.158.0，补录）** — 支持预注册 OAuth client secret 的 MCP 服务器（`codex mcp add --oauth-client-secret`）；exec-server 直连 WebSocket 以 bearer token 加固。*纳入理由：MCP 接入面补齐企业 OAuth 形态，远程执行通道默认带认证。* (rust-v0.158.0，见上链接)
- **GPT-6.1 Sol 两级默认化 + Bedrock 多代理（0.159.1 → 0.161.0）** — 0.159.1 以 hotfix 先将 GPT-6.1 Sol 设为 bundled 与 Bedrock Mantle / Runtime 目录默认；0.161.0 全量确认，同时 Amazon Bedrock 支持多代理 V2 与 Ultra reasoning，Mantle 接受 GovCloud 区域。*纳入理由：模型路由默认档迁移 + 并行代理编排上企业云通道，两条能力线在同一个 minor 里合流。* ([rust-v0.159.1 · 2026-09-30](https://github.com/openai/codex/releases/tag/rust-v0.159.1)、[rust-v0.161.0 · 2026-10-08](https://github.com/openai/codex/releases/tag/rust-v0.161.0)（published 2026-10-07T15:58:45Z，本地 10-07 23:58）)
- **Guardian review 上下文扩展（0.160.0）** — opt-in 的 Guardian review 能力可检索更早的用户指令，并纳入 agent handoff 上下文。*纳入理由：监护子系统的可见上下文从当前轮扩展到会话史与代理交接，审查面的信息结构升级。* ([rust-v0.160.0 · 2026-10-02](https://github.com/openai/codex/releases/tag/rust-v0.160.0)（published 2026-10-01T20:19:13Z，本地 10-02 04:19）)
- **Managed Git worktrees 工具化 + 任务置顶（0.162.0）** — 新增从受信本地项目创建与列出受管 Git worktree 的内置工具（worktrees 特性启用时）；agent Command Center 支持 `p` 置顶任务并进入共享 Pinned 组。*纳入理由：并行代理的隔离单元（worktree）从配置项升级为 agent 可直接调用的工具，治理面同步加置顶分组。* ([rust-v0.162.0 · 2026-10-09](https://github.com/openai/codex/releases/tag/rust-v0.162.0)（published 2026-10-08T18:55:59Z，本地 10-09 02:55）)
- **Code Mode 升级：流式 promise 与 ranked tool search（0.162.0）** — JavaScript helper 支持在 promise 结果落定时流式返回；Code Mode 获 opt-in 的带排序 tool search。*纳入理由：脚本编排通道的并发返回与工具发现能力，对位 pi codemode 的 searchTools 体系。* (rust-v0.162.0，见上链接)
- **自定义 Responses provider 能力协商（0.162.0）** — 自定义 Responses 兼容 provider 可配置 live web access 与远程压缩（remote compaction）能力。*纳入理由：第三方 provider 首次可声明联网与云端压缩能力，provider 生态的能力面从"推理通道"扩展到工具与上下文服务。* (rust-v0.162.0，见上链接)

### 评估
补录区五发 + 窗口内五发，minor 节奏稳定在 2 ～ 4 天一版，本期十版合计两个 minor 线（0.159 / 0.160 ～ 0.162）。主线有三：一是执行循环的响应性（`instant_interrupt` 抢占、排队消息断线续传），二是 Guardian 从"默认启用"（上期）走向"上下文加深"（本期 opt-in 检索会话史与 handoff），三是并行代理基础设施继续硬化（managed worktrees 工具、`AgentControl` 收敛延续、多代理 V2 上 Bedrock）。GPT-6.1 Sol 的"hotfix 先行 + minor 全量"双级默认化与上期 Sol / Luna 的推送手法一致，已成固定套路。值得留意的是 0.161.0 里 Daybreak 被全面收紧为显式 opt-in（`--enable cli_daybreak`，默认隐藏控件、无 `/daybreak`、无自动 Cyber 路由），配合 per-turn `--cyber-access-program`，方向是把这个受限能力从默认路径上摘干净。0.160.1 / 0.162.1 为单点修复 patch，0.159.2 / 0.159.3 亦小（Windows console 抑制、账号安全提醒），均列版本号带过。

### 其他动态
0.158.0：图像生成支持透明背景与文件输入、fullscreen TUI 复制/粘贴配置、Mermaid 渲染补齐。0.159.0：紧凑欢迎屏、`.aws` 目录默认纳入写根保护、app-server thread 分页锚点、移除 prompt suggestions 与 bundled `plugin-creator` skill。0.161.0：`/mcp login <name>` 会话内 MCP 登录、语音输入输出设备选择。0.162.0：`/copy` 转录块导航、审批头等处 URL 可点击、签名 PowerShell 安装器。

## Claude Code
窗口内版本：2.1.287（入账 10-02 01:59）、2.1.288（10-03 04:19）、2.1.289（10-04 07:06）、2.1.290（10-06 07:32）、2.1.291（10-06 11:54）、2.1.292（10-07 02:59）、2.1.293（10-08 02:10）、2.1.294（10-08 13:03）、2.1.295（10-09 03:48）、2.1.296（10-10 03:28）；补录区：2.1.284（09-29 02:01）、2.1.285（09-30 03:27）、2.1.286（10-01 03:09）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **Sonnet 5.5 上线即默认 Sonnet（2.1.284，补录）** — `claude-sonnet-5-5` 上线即为 Anthropic API 默认 Sonnet 模型（1M 上下文，$2 / $10 per Mtok，$0.20 缓存读）。*纳入理由：模型代际切换 + 默认档迁移一步到位，与上期 Opus 5.5 的推送手法一致。* ([2.1.284](https://github.com/anthropics/claude-code/commit/8364969e9)（入账 09-29 02:01 本地）)
- **auto mode 默认化收官：全 plan / 全 provider（2.1.284 / 2.1.285，补录）** — 交互终端与 VS Code 会话在未配置权限模式时一律以 auto mode 启动（2.1.284）；`claude -p` 与 Python Agent SDK 会话在第三方 provider 或 telemetry 关闭时同样默认 auto 启动（2.1.285，`--permission-mode` 可覆盖）。*纳入理由：上期启动的双向扩张在本期补录区完成闭环——auto mode 从"实验默认"走完"全通道默认"。* ([2.1.285](https://github.com/anthropics/claude-code/commit/ec44ca97d)（入账 09-30 03:27 本地）)
- **Claude Mods：插件可修改深层行为（2.1.287）** — 插件系统升级为 Mods，可介入更深层的行为面；后续版本连续扩充 API：`$.ui.selection()`（2.1.288）、`prompt.autocomplete` 与 `$.model.complete`（带 prompt caching，2.1.292）、`$.ui.notify` 与 Button 子元素（2.1.295）、`tool.check` 的 `ceiling`（组织审批级别）与 `agentId`（2.1.290）、`agent.spawn`（teammates，2.1.289）、`turn.step` 的 `serverToolUses`（2.1.290）、`isDeferred`（2.1.293）。*纳入理由：扩展系统从"加工具/加命令"升级为覆盖 UI、prompt、模型调用、权限检查、代理生命周期的深度修改权，是本期四家中最大的扩展面单点升级。* ([2.1.287](https://github.com/anthropics/claude-code/commit/816ec211a)（入账 10-02 01:59 本地）)
- **"You should know" 内置监护 mod（2.1.287）** — 内置 side agent 持续观察会话、标记你或 Claude 可能忽略的问题（`/plugin enable cc-plugin-you-should-know@builtin`，一方 telemetry-on 会话可用）。*纳入理由：并行监护代理以内置 mod 形态产品化，对位 Codex Guardian。* (2.1.287，见上链接)
- **Haiku 5.5 上线即默认 Haiku（2.1.293）** — `claude-haiku-5-5` 上线即为默认 Haiku（1M 上下文，$0.10 / $0.50 per Mtok，100K 以上 $0.50 / $2.50）。*纳入理由：第二次"上线即默认"的代际切换，低价档位同步换代。* ([2.1.293](https://github.com/anthropics/claude-code/commit/79babc372)（入账 10-08 02:10 本地）)
- **Hooks fail-closed：`onFailure: "block"`（2.1.295）** — 命令与 HTTP hook 无法启动、超时或异常退出码时直接阻断动作而非放行；2.1.294 同向修复了指令式 prompt/agent hooks"应拦截未拦截"的缺陷。*纳入理由：hook 安全模型从 fail-open 转向 fail-closed，权限执行面的默认语义反转。* ([2.1.295](https://github.com/anthropics/claude-code/commit/602df92bf)（入账 10-09 03:48 本地）)
- **OSC 7501 程序状态协议（2.1.295）** — 实现该协议的终端可显示 Claude Code 的工作 / 等待用户 / 完成状态。*纳入理由：终端集成标准化能力面，与 pi 1.1.0 同周落地同一协议。* (2.1.295，见上链接)
- **子代理治理三件套（2.1.292 / 2.1.296）** — Agent tool 新增 `effort` 参数按代理指定推理档（2.1.292）；`autoCompactWindow` 进入 subagent frontmatter 与 `--agents` 定义，子代理可先于主会话自动压缩（2.1.296）；`CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 统一 workflow 代理模型（2.1.296）。*纳入理由：并行代理获得独立的推理档、压缩窗口与模型配置三层粒度。* ([2.1.292](https://github.com/anthropics/claude-code/commit/fbe20e00e)（入账 10-07 02:59 本地）、[2.1.296](https://github.com/anthropics/claude-code/commit/2301018b1)（入账 10-10 03:28 本地）)
- **Teammates 编排事件统一（2.1.289）** — `agent.spawn` hook 覆盖 teammates，插件 hook 事件获得统一 agent id，`$.agent.list()` 增加 idle / waiting 状态。*纳入理由：多代理生命周期对扩展系统全程可观测、可拦截。* ([2.1.289](https://github.com/anthropics/claude-code/commit/2bfb629df)（入账 10-04 07:06 本地）)
- **1M 上下文默认化（2.1.287 / 2.1.285 补录）** — Opus 4.7+ 与 Fable 在 Bedrock / Vertex / Foundry / apps gateway 默认 1M 上下文（`CLAUDE_CODE_DISABLE_1M_CONTEXT=1` 保留 200K，2.1.287）；自定义 `ANTHROPIC_BASE_URL` 会话同样默认启用 1M（2.1.285）。*纳入理由：上下文窗口档位的出厂默认从 200K 迁到 1M。* (2.1.287、2.1.285，见上链接)

### 评估
十三个版本（含补录区三个）延续日均一版节奏，但本期结构比上期更清晰：Mods 是主轴——从 2.1.287 的总纲到 2.1.296，mods API 覆盖了 UI、prompt 补全、模型调用（含缓存）、权限检查、代理 spawn、服务器工具调用可见性，等于把 pi 扩展系统 + Codex Guardian/app-server 的开放面合并进一个插件体系，"You should know" 则示范了 mods 能承载常驻监护代理。模型线一月内完成 Opus 5.5 → Sonnet 5.5 → Haiku 5.5 三档"上线即默认"，全目录默认代际迁移收口。权限线 auto mode 默认化收官后，安全重心转向 fail-closed（`onFailure: "block"`、指令式 hook 拦截缺陷修复、sandbox 项目设置不可放宽管理端配置）。2.1.288 中 auto mode 分类器上下文过长时自动压缩、忽略 5.5 pin 回落 Sonnet 5，说明分类器自身的上下文管理已成为独立工程问题。VS Code 侧（bookmarks、Questions 行、文件卡片）与 Claude Tag / Code Review 子产品条目占比继续升高，主 CLI 的条目密度相对下降。

### 其他动态
2.1.284：`/mcp reconnect all`、auto mode 增加"Yes, but ask again next time"、gateway spend limit 金额化、auto-memory 加载中和不可见字符与伪造标记。2.1.285：`allowedProviders` managed setting、`claude --desktop`、`claude plugin configure` 与 `.mcpb` 安装时配置。2.1.286：`--bare` 最小模式（仅命令行指定 MCP、无 system reminders、无后台任务）、API 重试预算化（单次调用至多 14 请求）、`verify` skill 挂入提交前流程。2.1.288：后台命令限时仅适用于无人值守会话、`/autocompact` 按模型保存。2.1.290：WebSearch 预算改为 100 次/小时滚动补充、`/claude-api managed-agents-onboard`。2.1.292：`--marketplace` 一键装插件、MCP stdio 协议 2026-07-28 默认。2.1.296：Read `allow_large`、MCP 工具描述上限 2048 → 4096、gateway `managed.policies[]` 增加 `code` 键。

## 横向趋势
- **pi 以 1.0 定版把"可编程 agent 内核"推成主战场，三家同向跟进**：pi 0.99.0 ～ 1.1.0 的 codemode（QuickJS 沙箱跑模型写的 JS）、Codex 0.162.0 的 Code Mode ranked tool search 与流式 promise、Claude Code 2.1.287 的 Mods 深层行为修改权——三家都在把"模型写代码编排工具 / 修改宿主行为"做成一等能力，差异在沙箱取向：pi 选语言级沙箱（QuickJS + 冻结内建），Claude Code 选能力声明（hook 事件 + fail-closed），Codex 靠工具面收敛。
- **"上线即默认"第二次同窗集中发生，默认档策略完全固化**：Sonnet 5.5（Claude Code 2.1.284）、GPT-6.1 Sol（Codex 0.159.1 hotfix → 0.161.0 全量，pi 0.99.1 同步设 Codex provider 默认）、Haiku 5.5（Claude Code 2.1.293，pi 1.1.0 接入）——新模型从接入到默认的延迟已压缩到 0 天，hotfix-先行的两段式推送成为标准操作。
- **OSC 7501 在 Claude Code 2.1.295 与 pi 1.1.0 同周落地**：终端状态上报（working / waiting / done / failed）首次出现跨 harness 的协议级趋同，agent dashboard 与终端集成的标准化开始；此前 MCP 协议版本（2026-07-28 / 2025-11-25）的跟进也呈同样的"一家定、各家跟"模式。
- **安全语义从"默认收紧"进入"fail-closed"阶段**：Claude Code `onFailure: "block"`（hook 失败即阻断）与指令式 hook 拦截缺陷修复、Codex Daybreak 全面 opt-in 化（默认隐藏、无自动路由）、Hermes v0.21.6 三组外部报告修复（dashboard 认证、不可信仓库 git filter 执行、邮件发件人伪造）、pi MCP OAuth RFC 9207 / per-server 凭据 / CIMD——四家同期把"失败时更安全"与"不可信输入默认拒绝"写进默认行为。
- **子代理与多代理治理继续细化到参数级**：Claude Code 的 per-agent `effort` / `autoCompactWindow` / workflow 统一模型、Codex 的 managed worktrees 工具化 + Command Center 置顶 + Guardian handoff 上下文、pi 的虚拟模型逐请求路由、Hermes 的 per-profile 插件宿主——隔离单元、模型档、压缩窗口、监护范围都已成为独立可配维度。
- **下期窗口（约 10-12 ～ 10-21）看点**：Hermes v0.22.0 curated notes（欠账连跨五 tag、累计未文档化体量已过万 PR，兑现上限仍最高）；Claude Code Mods API 的第二批形态（`$.model.complete` 是否长出完整 agent 内嵌 API）；pi 1.1 之后的 Unreleased 走向（codemode 多模态输出能否闭环到语音/视频）；Codex 0.163 与 `instant_interrupt` 是否从 opt-in 转默认。
