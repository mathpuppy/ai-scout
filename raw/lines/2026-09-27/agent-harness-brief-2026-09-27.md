# Agent Harness 更新简报 · 2026-09-27

> 时间窗：2026-09-18 ～ 2026-09-27（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠区处理：与上期（[agent-harness-brief-2026-09-20](../2026-09-20/agent-harness-brief-2026-09-20.md)，窗口 09-11 ～ 09-20）重叠 09-18 ～ 09-20，区内版本（pi 0.86.0、Codex rust-v0.155.0 / 0.155.1、Claude Code 2.1.275 ～ 2.1.278）均已在上期展开，本期列版本号带过。例外：pi 0.86.1 入账于 09-20 19:04，晚于上期运行时刻、上期未收录，本期完整展开。上期预告兑现情况：Codex 0.156 稳定版落地（且 0.157 同窗跟进）；pi 0.86.x 跟进节奏兑现为 0.87.0 / 0.87.1 两连发；Hermes v0.22.0 curated notes 仍未兑现，欠账已连跨四个 tag。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.21.4 / v0.21.5 两个 patch rollup 合计约 2,300 个 PR，官方自述里架构级内容密集但"故意不展开"，curated notes 欠账拖入第四个 tag | Desktop plugin SDK wave、per-profile multiplexer 生命周期、host 级 gateway 单例、`--format stream-json`、`skills.auto_load` |
| pi | 0.86.1 ～ 0.87.1 三连发：新 provider、canonical session context 架构级重构、新模型同窗全接入，Unreleased 区已现图像生成 / classifier 雏形 | canonical 上下文编辑（不重写历史）、`context_with_system`、Meta Muse provider、Opus 5.5 / GPT-6 Sol / Luna |
| OpenAI Codex | 0.156 / 0.157 两个 minor 同窗落地：语音默认开、daemon 自动启动默认、Guardian thread context 默认、worktree 默认 | 语音转默认、`/usage` 分析面板、daemon 自动启动、GPT-6 Sol / Luna 全线 + Bedrock |
| Claude Code | 2.1.280 ～ 2.1.283 四连发：Opus 5.5 接入即成默认且 Pro/Team 默认模型整体切 Opus，auto mode 两版双向扩张 | Opus 5.5 默认化、auto mode 服务端分类器 + 默认启动双扩张、MCP URL-mode elicitation、`/doctor prompt-audit` |

**本期大盘**：本窗口最大的事件是四家同窗接入同一批新模型（Opus 5.5、GPT-6 Sol / Luna、Grok 4.7），且两家把新模型直接推成默认——模型目录跟进速度与默认模型策略首次成为 harness 层面的显性竞争维度。能力主线上，上期"缓存经济"升级为"结构性上下文编辑"（pi canonical session context、Codex 从 compaction 边界恢复 + Guardian 默认、Claude Code resume 缓存保护修复群），"权限安全"升级为"默认值扩张"（Claude Code auto mode 双向推进、Codex 网络策略与 MCP 端点收紧）；后台常驻基础设施（daemon / SessionManager）从可选走向默认与单一权威。

## Hermes Agent
窗口内版本：v2026.9.21（本地 09-22 02:10，即 v0.21.4）、v2026.9.24（本地 09-24 18:09，即 v0.21.5）。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新

两个 tag 官方定位均为 patch rollup，完整 curated notes 再次推迟至 v0.22.0；但发布说明正文以"故意不在此文档化"的方式列出了能力级事实，以下纳入项均出自该正文，细节待 v0.22.0 展开。

- **Host 级 gateway 单例 + Desktop 附着运行中后端** — 主机范围内 gateway 单例锁（含 rendezvous 记录），Desktop 不再自行 spawn 第二个后端而是 attach 到运行中的 host backend。*纳入理由：进程架构级变更，Desktop 与 host 从双进程并存收敛为单后端多客户端。* ([v2026.9.21 · 2026-09-22](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.21))
- **Per-profile 生命周期纳入 host multiplexer** — 各 profile 可独立 stop / start / restart，`gateway.standalone` 可让单个 profile 退出多路复用。*纳入理由：多 profile 常驻架构的生命周期管理粒度到 profile 级。* ([v2026.9.24 · 2026-09-24](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.24))
- **Desktop plugin SDK wave** — composer draft API、session-list 与 row-decoration 插槽、sidebar 导航偏好、model-pill 标签 provider、typed settings / skills / toolsets / profiles 桥接、沙箱化 embed 原语、插件后端公共事件桥。*纳入理由：扩展系统从零散接口升级为一整套带类型桥接与沙箱原语的 SDK 面。* (v2026.9.24，见上链接)
- **CLI `--format stream-json`** — 结构化 JSONL 输出进入 CLI。*纳入理由：为编排方 / 上层系统提供机器可读通道，是自动化集成的新能力面。* ([v2026.9.21 · 2026-09-22](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.21))
- **`skills.auto_load` 钉入新会话** — 配置后将技能固定进每个新会话的 prompt。*纳入理由：技能系统从按需发现改为可配置的会话级预载。* (v2026.9.21，见上链接)
- **Connectors 页面取代 MCP tab，插件工具 / 技能全局生效** — 新装插件的 MCP 服务器可一键 "Connect now"，已安装插件的 tools 与 skills 进入每个打开的 chat。*纳入理由：MCP / 插件的连接模型从逐会话配置升级为全局连接面。* (v2026.9.24，见上链接)

### 评估
节奏继续加快：v0.21.3（09-15）→ v0.21.4（09-22，窗口内 1,812 个合并 PR、5,071 个非合并 commit）→ v0.21.5（09-24，460 个合并 PR、1,610 个非合并 commit）。curated notes 的欠账已连跨 v0.21.2 ～ v0.21.5 四个 tag，官方明确 v0.22.0 将"document everything from v0.21.0 onward"——两期窗口累计的未文档化体量已达 5,000+ PR 级，下期窗口（覆盖至 10-06 前后）命中概率进一步上升。本体方向上，两个 tag 的主线清晰：一是把 Hermes 从单实例工具推向"host 常驻 + 多 profile + 多客户端"的服务化架构（gateway 单例、per-profile 生命周期、stream-json）；二是把插件 / 连接器生态做成一等公民（plugin SDK wave、Connectors 页、webhook 投递入会话、catalog 网站化）。上期预告的"内容量最大的一期"仍未兑现，但欠账本身已经成为信号。

### 其他动态
v2026.9.21 官方自述另含：backend-owned connector 统一操作（Desktop / TUI / CLI setup card）、gateway `decline` 未授权 DM 行为、`mcp.discovery_concurrency` 并发上限、`session_search` 时间边界与 OR 放宽重试、`hermes sessions set-journal-mode`、LTX 2.5 / Kling O3 视频目录、十余个新社区插件。v2026.9.24 官方自述另含：Simple / Advanced 界面模式、法 / 德 / 西完整目录与 RTL / LTR 设置、composer 与设置面板自定义模型入口、F 键与听写语音快捷键、live dock 显示 `/goal` 与排队 prompt、webhook 投递镜像入目标会话、Bot Screen、GPT-6 Sol / Terra / Luna 与 Claude Opus 5.5 入目录、Blender Lab 官方集成与 NVIDIA 插件、config 加载 / 工具注册表 / gateway 消息处理 / 模型选择器热路径性能（均未附细节，官方声明留待 v0.22.0 文档化）。

## pi
窗口内版本：0.86.1（入账 09-20 19:04，上期未收录）、0.87.0（入账 09-22 00:31）、0.87.1（入账 09-23 03:28）；0.86.0（入账 09-20 07:00，上期已展开）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **Canonical session context 与扩展边界（0.87.0）** — 不重写历史即可编辑模型上下文：`ContextEditEntry` 追加式上下文编辑（`appendContextEdit(entryId, null)` 可让单条消息从后续请求中消失而不动原始转录）、可执行的 `turn_end` / `agent_before_settle` 生命周期边界、retain-none 压缩输入；Breaking 含 `SessionManager` 成为 `AgentSession` provider 上下文的唯一权威（直接赋值 `session.agent.state.messages` 不再生效）、`shouldStopAfterTurn` 移除改 `finishTurn`。*纳入理由：上下文管理架构级重构——"请求时上下文"与"原始历史"正式分离，且以缓存安全（cache-safe）为设计约束。* ([0.87.0 · 2026-09-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0870---2026-09-21)（release commit [16787ad5b](https://github.com/earendil-works/pi/commit/16787ad5b2dc748047f314ca1bfe7708f30f54f3)，入账 09-22 00:31 本地）)
- **`context_with_system` 全转录变换（0.87.0）** — 在含 system 消息的完整转录上运行的逐请求上下文变换扩展事件，结果原样发送。*纳入理由：扩展系统首次拿到 system 级改写权，与 `context` 钩子形成两级上下文管线。* (0.87.0，见上锚点)
- **Per-model image input limits（0.87.0）** — `inputLimits.images.resize` 按模型配置图片缩放，作用于附件、`read` 与工具结果图片，缓存安全。*纳入理由：多模态输入的按模型治理，与 per-model compaction 预算同一设计语言。* ([#9631](https://github.com/earendil-works/pi/issues/9631) · 0.87.0)
- **Meta Muse provider（0.86.1）** — `/login meta` OAuth 登录（自动 Model API key 刷新）或 `META_API_KEY` 接入 Muse Spark 模型。*纳入理由：新增一家官方 provider 通道，登录 / 凭据刷新管线同步扩展。* ([0.86.1 · 2026-09-20](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0861---2026-09-20)（release commit [13cbf77df](https://github.com/earendil-works/pi/commit/13cbf77df2396303013a41646bcfa77b4271ae56)，入账 09-20 19:04 本地）)
- **新模型同窗全接入（0.87.1）** — Claude Opus 5.5（含 adaptive thinking 与 1M 上下文）、GPT-6 Sol / Luna 经 Anthropic / OpenAI / GitHub Copilot 三条凭据通道接入，Grok 4.7 成为 xAI 新会话默认。*纳入理由：模型路由能力面——同一批新模型跨三家 provider 的继承式支持在一个 patch 版本内完成。* ([0.87.1 · 2026-09-22](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0871---2026-09-22)（release commit [f07218c4d](https://github.com/earendil-works/pi/commit/f07218c4d4bbc12bef056a7058c3dd49dfe41abe)，入账 09-23 03:28 本地）)

### 评估
0.86.0 之后一周内三连发，节奏从上期的"15 天憋整包"切回高频小步。0.87.0 是本期四家中最重的单项架构更新：它把上期 transcript-aware 指令更新开创的"历史不可变、请求时可变"路线推到完备——上下文编辑成为会话转录的一等条目类型、压缩边界可显式保留、扩展拿到含 system prompt 的全转录变换权，代价是一组面向 SDK 消费者的 Breaking（`SessionManager` 权威化、`finishTurn` 替代 `shouldStopAfterTurn`）。修复列表同样围绕该主题（context handler 过滤消息导致丢 prompt 与工具声明、缓存 warming 重建过期缓存）。Unreleased 区（09-23 后）已出现更大的信号：`ModelRuntime.generateImages()` 图像生成、`classify()` classifier 支持与内置 TypeSafe `jev-latest`、`provider_stream_event` 事件——模型运行时正从"对话通道"扩展为"对话 + 图像 + 分类"的多操作面，若下期落版将是新的能力线。

### 其他动态
0.86.1：Node persistent compile cache 降低重复启动耗时、WSL/容器 OSC 52 剪贴板回退、z.ai `Prompt too long` 识别为上下文溢出、Cerebras strict schema 误报修复。0.87.1：split-turn 压缩摘要被 Fable 5.1 拒绝的修复、`--mode` 非法值报错而非静默忽略。Unreleased：RPC prompt / steer / follow_up 的 per-input disposition、HTML 导出隐藏消息开关（H）、TypeScript 7 构建 + Node 原生 type stripping 运行源码。

## OpenAI Codex
窗口内稳定版：rust-v0.156.0（本地 09-23 03:51）、rust-v0.156.1（09-23 10:41）、rust-v0.157.0（09-25 10:31）、rust-v0.157.1（09-26 09:02）；rust-v0.155.0 / 0.155.1（09-18 / 09-19，上期已展开）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **语音对话默认启用（0.156.0）** — 上期进入实验通道的 `/voice` 转为默认开启：F8 开关、`/voice settings` 声音选择、Linux / Windows 捆绑音频运行时。*纳入理由：交互通道从实验特性到默认能力，四家中首个默认开的实时语音 harness。* ([rust-v0.156.0 · 2026-09-23](https://github.com/openai/codex/releases/tag/rust-v0.156.0)（published 2026-09-22T19:51:01Z，本地 09-23 03:51）)
- **`/usage` 分析面板（0.156.0）** — 账户用量、token 总量、插件与技能活动的分析视图。*纳入理由：新增官方遥测 / 用量归因能力面，插件与技能活动首次有可见度。* (rust-v0.156.0，#45764 / #45769)
- **Worktree 默认启用 + 任务中心治理（0.156.0）** — worktree 支持默认开，agent command center 支持按状态过滤任务并可直接创建 worktree 会话。*纳入理由：并行代理的隔离单元（worktree）与治理面同时升级为默认形态。* (rust-v0.156.0，#46839 / #45276 / #44870)
- **daemon 生命周期成型并默认自动启动（0.156.0 → 0.157.0）** — `/daemon` 管理本地后台 server 或 `--no-daemon` 绕过（0.156.0）；符合条件的交互会话默认自动启动后台 server，设置不兼容时给出恢复选择（0.157.0，#47179）。*纳入理由：常驻 server 架构从显式命令推进到默认常驻，是上期 daemon 系列的架构定局。* ([rust-v0.157.0 · 2026-09-25](https://github.com/openai/codex/releases/tag/rust-v0.157.0)（published 2026-09-25T02:31:06Z，本地 09-25 10:31）)
- **GPT-6 Sol / Luna 全线接入（0.156.1 → 0.157.0）** — 0.156.1 以 hotfix 先将 Sol / Luna 放入模型选择器，0.157.0 完整接入并含 Amazon Bedrock 支持与旧模型迁移提示，限流切换提示改为推荐 GPT-6 Luna。*纳入理由：模型路由能力面扩展，且 Bedrock 通道同步跟进企业侧。* ([rust-v0.156.1 · 2026-09-23](https://github.com/openai/codex/releases/tag/rust-v0.156.1)、[rust-v0.157.0 · 2026-09-25](https://github.com/openai/codex/releases/tag/rust-v0.157.0))
- **Guardian thread context 默认启用（0.157.0）** — 上期以 commit 形式铺垫的 Guardian 上下文注册表进入默认形态，另含 Guardian review 策略配置与 v2 classifier 的 workspace 路由（#47125 / #47162）。*纳入理由：Guardian 作为权限 / 审查子系统从在建组件转为默认架构层。* (rust-v0.157.0，#47275)
- **多代理运行时收敛（0.157.0）** — 多代理 spawn 统一走 `SpawnRequest`、`LocalAgentControl` 实现 `AgentControl` 并集中代理恢复处理、`close_agent` 返回代理快照、从最新 compaction 边界恢复模型上下文（#47365）。*纳入理由：并行代理的 spawn / 恢复 / 快照接口从分散实现收敛为单一控制面，上下文恢复以压缩边界为锚点。* (rust-v0.157.0，#47235 / #47244 / #47252 / #47271)

### 评估
上期预告的 0.156 如期落地，且 0.157 同窗跟进（0.154 → 0.155 → 0.156 → 0.157 间隔约 6 / 5.8 / 2.3 天，minor 节奏在加速）。两个 minor 的主题高度一致：把上期"已具备"的能力批量推为默认——语音默认开、worktree 默认开、daemon 默认自动启动、Guardian thread context 默认启用；四项默认化叠加 `LocalAgentControl` 收敛，勾勒出"常驻 server + 默认并行代理 + 默认监护"的目标形态。0.157.1 为无说明的纯 patch（release 高亮自动生成失败，tag compare 404），列版本号带过。GPT-6 Sol / Luna 的接入方式值得一提：先以 0.156.1 hotfix 进目录、次日 0.157.0 补全 Bedrock 与迁移路径，与 pi 0.87.1、Claude Code 2.1.280 同窗响应同一批模型发布。

### 其他动态
0.156.0：全屏 `/tui` UI（转录搜索、鼠标选择）、六款终端主题与 Mermaid / 公式渲染、沙箱隔离缺口封堵（Windows 入站连接、特权 Linux/macOS socket、macOS 只读句柄写入）、tmux / SSH 剪贴板修复。0.157.0：全屏转录默认启用、`f` 快捷键 fork 对话（保留草稿与排队 prompt）、`/import` 进 remote 与 daemon 会话、网络限制跨 redirects 与持续 HTTP/WebSocket 流量生效（策略撤销时取消连接）、Unix 本地 MCP server 限 stdio 描述符、MCP OAuth 授权端点限 HTTP(S)、云端技能目录跨轮复用并在轮首刷新。

## Claude Code
窗口内版本：2.1.280（入账 09-23 00:37）、2.1.281（09-24 03:18）、2.1.282（09-25 02:37）、2.1.283（09-26 05:49）；2.1.275 ～ 2.1.278（09-18 ～ 09-19，上期已展开）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **Opus 5.5 接入即成默认，Pro / Team Standard 默认模型整体切 Opus（2.1.280）** — `claude-opus-5-5` 上线即为默认 Opus 模型（1M 上下文，$4 / $20 per Mtok，$0.20 缓存读）；Pro 与 Team Standard 计划默认模型从 Sonnet 改为 Opus，对齐 Max / Team Premium / Enterprise。*纳入理由：模型路由默认值两级变更——既是新模型接入，又是全部主流付费档位的默认档迁移。* ([2.1.280](https://github.com/anthropics/claude-code/commit/56f36532530f88b572854538d685fcf781141e8c)（入账 09-23 00:37 本地）)
- **auto mode 双向扩张（2.1.282 / 2.1.283）** — 直连 Anthropic API 且 telemetry 关闭时会话默认改用服务端分类器（`CLAUDE_CODE_AUTO_MODE_SERVER=0` 退出，2.1.282）；第三方 provider 或 telemetry 关闭的交互会话在未配置权限模式时直接以 auto mode 启动（`permissions.defaultMode` 可覆盖，2.1.283）。*纳入理由：上期"分类器定局服务端"的延续——本轮把适用面扩到 telemetry-off 直连，并把 auto 本身推为无配置时的默认权限模式。* ([2.1.282 · 2026-09-25](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212182)（commit [ddcb43a29](https://github.com/anthropics/claude-code/commit/ddcb43a29b2d4da61fd22a55f6030c6d376b0545)）、[2.1.283 · 2026-09-26](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212183)（commit [7779afb12](https://github.com/anthropics/claude-code/commit/7779afb12e3635f46f56ec823979d68350ae000b)）)
- **MCP URL-mode elicitation（2.1.281）** — 2026-07-28 协议连接上，服务器可要求 Claude Code 打开浏览器流程完成引导，无确认通道时不留等待对话框。*纳入理由：MCP 新协议版本的能力面落地，elicitation 进入 URL 模式。* ([2.1.281 · 2026-09-24](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212181)（commit [d78be9481](https://github.com/anthropics/claude-code/commit/d78be9481b889e11186ec4578b4f5e9301396e25)）)
- **`/doctor prompt-audit`（2.1.283）** — 审计 CLAUDE.md、skills、agents、commands 中为旧模型写的提示模式。*纳入理由：新增提示工程诊断能力面，把"模型代际迁移"工具化。* (2.1.283，见上锚点)
- **模型治理 managed settings（2.1.283）** — `availableModelsMatch: "exact"` 使 `availableModels` 只放行所指版本（新模型默认阻塞直至列入）；`deniedModels` 可在允许列表之外显式封禁。*纳入理由：企业侧模型治理从白名单升级为精确版本控制 + 黑名单双轨。* (2.1.283，见上锚点)
- **apps gateway Bedrock 深度集成（2.1.281）** — Bedrock upstream 支持 `assume_role`（经 STS 假设 IAM 角色，可跨 AWS 账号、可选每开发者一会话）与 `guardrail: {id, version}`（对每个经过的请求应用 Bedrock guardrail）。*纳入理由：企业网关的 IAM 与合规层能力面，权限执行延伸到云侧身份与护栏。* (2.1.281，见上锚点)

### 评估
四连发全部落在 09-23 ～ 09-26，节奏与上期持平。主线有二：模型层一次到位（Opus 5.5 接入 + 默认 Opus 化 + 默认档迁移 + 治理键 + `/doctor prompt-audit` 的代际迁移工具，构成完整的"模型代际切换"套件），权限层持续推进（auto mode 两版扩张、`rm -rf "$(pwd)"` 类命令替换目标即使有 allow 规则也会询问、sandbox 排除命令匹配修复、`--setting-sources` 向 teammates / `/bg` / `claude agents` 子会话传递）。缓存经济线以修复群形态延续：resume 不再以变化形式重发历史（否则 API 丢弃 reasoning）、MCP 断连不再丢 prompt cache、宿主 app 中途切模型不再 cache miss、fork 子代理重发首个工具列表保缓存。2.1.282 曾保留 `claude-ai` 命名空间并在 2.1.283 撤销，属短期往返。VS Code 侧本版集中补齐 Status / Sandbox / `/plan` 等对话框，暂列观察。

### 其他动态
`x-claude-code-prompt-id` gateway hint header（LLM 网关可按用户 prompt 分组请求，2.1.283）；MCP 工具 / WebFetch / WebSearch 输出可进 OpenTelemetry span（2.1.283）；`/insights` 新增 auto mode 收益估算（2.1.281）；压缩摘要被拒时回退模型重试（2.1.282）；`maxProseWidth` 排版设置（2.1.282）；`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH`（2.1.280）；启动提速（`claude -p` 与 Remote 不加载交互 UI、分类器规则与 Artifact 工具按需加载，2.1.283）。

## 横向趋势
- **四家同窗接入同一批新模型，两家直接改默认**：Claude Code 2.1.280（Opus 5.5 即默认 Opus，Pro / Team Standard 整体切 Opus）、Codex 0.156.1 → 0.157.0（Sol / Luna 先 hotfix 进目录再全量 + Bedrock）、pi 0.87.1（同一批模型经三家 provider 凭据通道接入 + Grok 4.7 成 xAI 默认）、Hermes v0.21.5（Sol / Terra / Luna 与 Opus 5.5 入目录）。模型发布的"接入窗口"从周级压缩到天级，目录跟进速度与默认模型策略成为 harness 的显性竞争维度；pi 的"继承式 provider 支持"（新模型自动覆盖 Anthropic / OpenAI / Copilot 通道）是其中最体系化的路径。
- **常驻与会话生命周期基础设施从可选走向默认 / 单一权威**：Codex 两版把 daemon 从 `/daemon` 显式管理推进到默认自动启动，worktree 同时默认化；pi 0.87.0 把 `SessionManager` 立为 provider 上下文唯一权威、会话上下文结构化存储；Hermes 两个 tag 都在铺设 host 常驻 + 多 profile + 多客户端的服务化架构。上期的"daemon 可管理"本期升格为"daemon 即默认"。
- **上期"缓存经济"进阶为"结构性上下文编辑"**：pi 0.87.0 的 canonical session context 是标本——追加式上下文编辑、retain-none 压缩、`context_with_system` 全转录变换，全部以不破坏缓存前缀与原始历史为约束；Codex 0.157.0 以最新 compaction 边界为锚恢复模型上下文并让 Guardian thread context 默认化；Claude Code 用一批修复保证 resume / 断连 / 切模型不丢缓存。共同命题从"少重算"演进为"历史不可变前提下按请求组装上下文"。
- **权限与安全的默认值继续整体收紧**：Claude Code auto mode 双向扩张（服务端分类器覆盖 telemetry-off 直连 + 无配置默认 auto 启动）叠加上期服务端定局；Codex 把网络限制扩展到 redirects 与持续流量（策略撤销即断连）、Unix 本地 MCP 限 stdio、MCP OAuth 端点限 HTTPS；Claude Code 对命令替换目标的 `rm` 强制询问。三家的动作都在把"更严的默认"从实验开关变成出厂态。
- **下期窗口（约 09-29 ～ 10-08）看点**：Hermes v0.22.0 curated notes（欠账连跨四 tag、体量 5,000+ PR，兑现上限最高）；pi Unreleased 的 `generateImages()` / `classify()`（模型运行时多操作面，若落版是新能力线）；Codex 0.158 稳定版（minor 节奏已加速到 2.3 天，alpha 线继续前置）；Claude Code auto mode 全面默认化后的权限事件与计费反馈，以及 Opus 默认化对用量结构的实际影响。
