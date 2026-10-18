# Agent Harness 更新简报 · 2026-10-18

> 时间窗：2026-10-09 ～ 2026-10-18（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠处理：本期与上期（[agent-harness-brief-2026-10-11](../2026-10-11/agent-harness-brief-2026-10-11.md)，窗口 10-02 ～ 10-11）重叠 10-09 ～ 10-11 三天，重叠区版本（Codex 0.162.0/0.162.1、Claude Code 2.1.295/2.1.296）已在上期正文展开，本期仅列版本号带过。
> 上期预告兑现情况：**Hermes v0.22.0 curated notes 全额兑现**（欠账连跨五 tag 后一次性清零）；Codex `instant_interrupt` 如期从 opt-in 转默认；pi 1.1 之后走向"收敛期"（Unreleased 安静、1.2/1.3 主打缓存与工具依赖细化）；Claude Code Mods 线未长出完整内嵌 API，本期以 bug 修复为主。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.22.0 "The Threshold Release"：约 6,080 PR / 2,520 贡献者的最大窗口，curated notes 欠账一次性清零 | Connectors（agent 进托管 SaaS 应用）、本机模型一键化、单网关/单后端、live subagents、Bot Screen 人机接管 |
| pi | 1.2.0 → 1.3.0 两连发，从九连发节奏转入 1.0 后收敛期 | `reachesTools` 工具依赖图、clean model switching、GPT-6 thinking 切换保缓存 |
| OpenAI Codex | 0.163.0 一版定音：抢占执行循环默认化、并行只读工具、Daybreak 反转、OSC 7501 | `instant_interrupt` 转默认、并行只读工具、Daybreak 重新默认、沙箱完整性校验 |
| Claude Code | 2.1.299 → 2.1.302 四连发，bug 修复密度为本期四家之最，mods 线收敛 | idle compaction、fork 子代理默认、`/advisor`、OTEL GenAI + classifier 判决入 telemetry |

**本期大盘**：节奏整体放缓（pi 从九连发降到两连发、Claude Code 转入 bug 修复为主），但 Hermes 以 v0.22.0 兑现了跨五 tag 的 curated notes 欠账，成为本期最大单家事件；"执行循环响应性"（Codex instant_interrupt 默认、Hermes live subagents、Claude Code fork 子代理默认）与"上下文经济学"（idle compaction、clean model switching、GPT-6 缓存保持）成为两条贯穿线，OSC 7501 第三家落地继续兑现终端集成标准化。

## Hermes Agent
窗口内版本：v0.21.7（本地 10-12 13:53）、v0.22.0（10-14 11:21）、v0.22.1（10-15 07:59）、v0.22.2（10-15 16:21）。四者均本期首次收录。[Releases](https://github.com/NousResearch/hermes-agent/releases)

### 核心更新

v0.22.0 官方定位为 "The Threshold Release"，rollup 并全文档化 v0.21.1～v0.21.7 的全部 patch（自 v0.21.0 起约 24,200 commit / 6,080 PR / 2,520 贡献者，体量约为 v0.21.0 周期的 2.5 倍）。以下纳入项出自 v0.22.0 正文，除非另有标注。

- **Connectors：agent 进入托管 SaaS 应用** — 经 Nous tool gateway 在 Linear、Notion 等托管应用内直接操作：选应用、浏览器一次登录、同一轮即可用工具；无需 Nous 账号起步，首次使用自动建免费 connectors-only identity；Desktop 新增 Connectors 页（取代原 MCP tab，把托管应用与本地 MCP 服务器并成一表），支持同应用多命名账号（`work`/`home`），`/connectors` / `hermes connectors` 管理。*纳入理由：能力面从"本机工具 + MCP"扩展到"经网关操作的托管 SaaS 应用"，且以免费 guest identity 拆掉 agent 进入第三方应用的门槛。* ([v0.22.0 · 2026-10-14](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.0))
- **本机模型一键化（受管 llama.cpp 运行时）** — 一键在本机跑开放模型，无账号无 key：按硬件（CPU/CUDA/Metal/Vulkan/ROCm）选引擎、按 GPU/RAM 评级推荐最高质量可跑模型、下载断点续传、引擎一键更新；目录含 Qwen3.8 27B、Qwen3.8 Flash Next（MTP speculative head）、DeepSeek V4 Flash 及任意 HF GGUF。*纳入理由：本地推理从"手动配 Ollama/LM Studio"升级为受管运行时 + 硬件自适应推荐，部署面新能力。* (v0.22.0，见上链接)
- **单网关 + 单桌面后端服务所有 profile** — 每机器一个 messaging gateway + 一个 desktop backend 服务全部 profile，替代每 profile 一进程；建 profile 即 bot 上线无需重启，各 profile 独立凭据/allowlist/cron/会话，`hermes update` 自动迁移存量。*纳入理由：多 profile 的进程架构从"每 profile 一进程"收敛为 multiplexed 单进程（token 无冲突），是执行宿主架构级变化。* (v0.22.0，见上链接)
- **Live subagents：实时可见、可 steer/stop** — 运行中子代理常驻 composer 上方（CLI F6 / TUI Ctrl+T / Desktop），显示任务、耗时、实时 transcript 与 Steer/Stop 按钮；`/stop` 可达后台子代理并交回部分成果；`delegate_task` 可把截图/mock 传给视觉子代理。*纳入理由：子代理从"提交-等待"升级为实时可观测、可中途干预，并行代理治理的能力面。* (v0.22.0，见上链接)
- **Bot Screen：人机接管点** — 跑在 Linux gateway 的 bot 有独立桌面并经 Hermes Desktop 直播；遇登录/2FA/CAPTCHA 时人接管屏幕完成再交还，bot 继续原会话；Docker/SSH/Singularity 后端下屏幕、computer use、浏览器均跑在沙箱内而非宿主机。*纳入理由：human-in-the-loop 的接管/交还机制，把"卡住即失败"改为"卡住即交接"，执行模型的人机协同升级。* (v0.22.0，见上链接)
- **密码管理器登录（凭据对模型不可见）** — 浏览器 agent 可用 1Password / Bitwarden / Hermes 自带加密 vault 登录网站，模型从不看到密码；一次性验证码不进入对话即填入，结账卡号/地址填写需确认。*纳入理由：浏览器自动化获得凭据注入能力，且凭据对模型不可见，隐私边界设计。* (v0.22.0，见上链接)
- **Reasoning replay 默认化** — 对所有能读 reasoning 的 provider 默认重放先前的 reasoning（跨 resume、分支、compaction），长链路任务保持思维链。*纳入理由：上下文连续性策略从"部分 provider 可选"升级为全局默认。* (v0.22.0，见上链接)

### 评估
v0.22.0 是本期四家中最大的单家事件，但拆开看有两层：内核层（Connectors、live subagents、Bot Screen、单网关、密码管理器登录）与分发层（stable release channel、签名桌面包、统一包管理器 `hermes pm`、MSIX-only Windows、Python 3.14 运行时）。内核层的共同点是**把 agent 塞进更多宿主**——托管 SaaS 应用（Connectors）、本机硬件（受管 llama.cpp）、第三方桌面前端（Bot Screen）、多 profile（单网关）；这与上期 Hermes 的"语音通道差异化"形成对照，本期更偏"部署面 + 交互面"扩张而非执行模型迭代。分发层则是 Hermes 独有的重投入：从 v0.21.6 首个 stable pipeline 切版到 v0.22.0 的 SemVer + 签名包 + 统一包管理器，发布工程在四家中独树一帜。v0.21.7（stable channel 落地、reasoning 跨 resume 存活、防火墙后更新修复）是 v0.22.0 的分发预告；v0.22.1 / v0.22.2 为 patch（Windows Store/MSIX 修复、插件目录更新），但 v0.22.1 的 commit 序列显示单网关架构的持久层仍在落地（authenticated session authority、原子 mutation receipts、durable outbox），说明"单后端"是进行中的架构迁移而非一次性切换。安全面延续上期密度：凭证不落入子进程/argv、redaction 先于截断、SSRF guard 扩面、文件权限 owner-only、opt-in 共享指标默认关。

### 其他动态
v0.22.0 另有：首次启动引导聊天（免费 `nous/welcome` 模型，无需 key）+ `set_theme` 工具；600 插件目录（reviewed、按 commit 钉住）；Claude 5.5 全系 / GPT-6 全系 / Gemini 4 Argon 入目录；模型选择器显示订阅余量/限流解除时间；16 语言全量翻译目录；代码库 −34%（1.06M → 698K 行）、约 19 个低频工具按需加载、固定 prompt 再减 ~2.1k token。升级注意：Python 3.14 为托管运行时、Windows 桌面 MSIX-only（需 Win11 22H2+）、旧会话自动清理（90 天默认开）、memory providers（Honcho/Supermemory/Hindsight/Mem0/OpenViking/Holographic）迁往插件目录。v0.22.1/v0.22.2：Nemotron 3.5 Super VL 默认参数、韩语/葡语语言包、若干社区插件（openinvest、hermes-agent-mixer、teamorouter 等）入目录。

## pi
窗口内版本：1.2.0（入账 10-13 06:46）、1.3.0（入账 10-16 02:57）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **`reachesTools`：工具声明可达工具集（1.2.0）** — 工具定义新增 `reachesTools`，声明一次调用可能触达哪些工具（如 `codemode`、`tool_search`）；MCP 扩展据此等待调用所需服务器就绪、并判断替代的 `codemode`/`tool_search` 是否能触达 MCP 工具；另给工具 namespace 加 `aliases`（`describeNamespace()` 与 `searchTools()` 的 `namespace` 选项匹配）。*纳入理由：工具编排的依赖图从隐式变为显式声明，脚本/MCP 调用能按依赖等待就绪，工具系统执行模型细化。* ([1.2.0 · 2026-10-12](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#120---2026-10-12)（release commit [06a4669355](https://github.com/earendil-works/pi/commit/06a4669355)，入账 10-13 06:46 本地）)
- **Per-key OpenRouter 模型列表（1.2.0）** — 持 OpenRouter key 时只列该 key 可用模型，带该 key 的 context size / max output / 价格（含 `models.json` 的区域端点与 guardrails），列表离线缓存。*纳入理由：模型目录从"全局目录"细化为"按凭据裁剪的目录"，路由面更精确。* (1.2.0，见上锚点)
- **扩展事件生命周期收口（1.2.0）** — `before_agent_start` 对 `pi.sendMessage(..., { triggerTurn: true })` 触发的 run 同样触发（事件改为按 `messageType` 的 union）；会话在 run 启动期计为 busy（`ctx.isIdle()` 为 false、`sendMessage()` 入队而非"Agent is already processing"）。*纳入理由：扩展触发 run 与用户 prompt 走同一生命周期、会话状态机边界收紧，扩展编程模型一致性升级。* (1.2.0，见上锚点)
- **发布配置 schema（1.2.0）** — settings/models/keybindings/themes 发布 `$schema`（`pi.dev/schemas/*.schema.json`），编辑器校验与补全；theme schema 迁移并统一启动期校验。*纳入理由：配置面从"无契约"升级为"可校验 schema"，开发者体验能力面（配套 Breaking：旧 theme 需改 `$schema` 与 `vars`）。* (1.2.0，见上锚点)
- **Clean model switching（1.3.0）** — 切换模型时丢弃上一模型的 thinking 块，而非作为纯文本喂给新模型（此前新模型会把旧推理写进可见回答）。*纳入理由：跨模型上下文卫生策略，直接影响切换后回答质量，上下文管理能力面。* ([1.3.0 · 2026-10-15](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#130---2026-10-15)（release commit [71023aec15](https://github.com/earendil-works/pi/commit/71023aec15)，入账 10-16 02:57 本地）)
- **GPT-6 thinking 切换保缓存 + Kimi Code 协议迁移（1.3.0）** — OpenAI GPT-6 会话中改 thinking level 不再失效 prompt cache；`kimi-coding` 迁到 OpenAI Chat Completions（`https://api.kimi.com/coding/v1`，`models.json` base URL 需带 `/v1`），会话中加工具不再失效缓存。*纳入理由：缓存经济学——把"改配置/加工具"从缓存杀手变为缓存保持，上下文成本管理。* (1.3.0，见上锚点)
- **Resumed sessions 保留活动工具（1.3.0）** — 恢复会话还原会话中激活的工具，`--tools +name/-name` 在其上叠加（显式选工具时除外）。*纳入理由：会话状态持久化完整性——工具集随会话恢复，跨恢复的工作流不再丢工具。* (1.3.0，见上锚点)

### 评估
pi 本期从"九连发冲 1.0"明确转入收敛期：12 天两版，且 1.2.0 体量（一个 New Features 组 + 三个 Breaking）明显小于上期 0.99.0 单版。主轴是两条收尾线：一是把 codemode/tool_search 的工具编排系统补上依赖语义（`reachesTools`、namespace `aliases`），让"MCP 服务器何时就绪、替代工具能否触达"从猜测变为声明；二是上下文经济学精细化——上期做"把 MCP/codemode 移出描述省 token"，本期做"把 thinking 切换、模型切换、加工具从缓存失效源变成缓存保持点"（clean model switching、GPT-6/Kimi 缓存保持、`serializeConversation` 省略 thinking 块）。Breaking 密度不低（schema 校验、`before_agent_start` union 化、实验性 server/client/plugin 栈与 `@earendil-works/chord` 依赖移除），对扩展作者不友好的一面仍在。1.3.0 其余为目录与兼容修复（默认 NVIDIA 模型切 Nemotron 3.5 Super VL、OpenCode Go 迁 inference 端点、Claude Haiku 5.5/Opus 5 的 `off` thinking 档、Codex `gpt-6.1-sol` 上下文窗 272K→500K），Unreleased 区安静（仅 models.json schema 参考文档生成与 summary 输出上限调整），无下期大动作预告。

### 其他动态
1.2.0：`PI_CLIPBOARD_OSC52=1` 远程会话剪贴板、codemode 工具声明显示约束（整数/最小最大/默认）与耗时行、`before_agent_start` breaking 详注。1.3.0：`sessionShareDestination`（auto/gist/radius）选 `/share` 目标、MCP 结果类型 `structuredContent` 放宽为任意 JSON 值、Anthropic 严格工具集拒绝时回退非严格重试、Nix flake 与 Node PATH 修复、内部依赖 pin 精确化。

## OpenAI Codex
窗口内稳定版：rust-v0.162.0（本地 10-09 02:55，已上期展开）、rust-v0.162.1（10-10 03:44，已上期展开）、rust-v0.163.0（10-16 05:30）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **`instant_interrupt` 转默认 + Code Mode 中断默认（0.163.0）** — 响应进行中可发 follow-up 立即转向 Codex；打断一轮同时停掉活动的 Code Mode cell 及其嵌套工具调用。*纳入理由：上期 opt-in 的抢占式执行循环本期默认化（#51812/#51835），执行模型响应性成为出厂默认。* ([rust-v0.163.0 · 2026-10-16](https://github.com/openai/codex/releases/tag/rust-v0.163.0)（published 2026-10-15T21:30:38Z，本地 10-16 05:30）)
- **并行只读工具执行（0.163.0）** — Codex 可并行跑独立的只读工具，含 skill、memory、conversation-history 查找。*纳入理由：工具执行从串行走向并行（限定只读、可判定独立），执行模型吞吐面升级。* (rust-v0.163.0，见上链接)
- **Daybreak 重新默认化（0.163.0）** — 上期（0.161.0）收紧为显式 opt-in 的 Daybreak，本期对 eligible 账号默认开启，`codex exec` 可用 OpenAI API key 在服务器放行时选择。*纳入理由：受限能力面默认值反转（与 0.161.0 方向相反），值得单列。* (rust-v0.163.0，见上链接)
- **OSC 7501 终端状态上报（0.163.0）** — 终端程序状态经 OSC 7501 上报（#52725）。*纳入理由：与 Claude Code 2.1.295、pi 1.1.0 同协议，本期第三家落地，跨家终端集成趋同信号。* (rust-v0.163.0，见上链接)
- **沙箱完整性校验（0.163.0）** — policy-based 文件内容完整性检查，Linux 走 bubblewrap 后端、macOS 走 Seatbelt 后端，命令与文件系统操作前先跑完整性检查。*纳入理由：沙箱从"路径隔离"升级为"内容完整性校验"，安全面新粒度。* (rust-v0.163.0，见上链接)
- **搜索式 `/config` 偏好面板（0.163.0）** — TUI 内跨类别搜索偏好、支持即时生效并标注哪些需重启。*纳入理由：配置发现面从"翻分类"升级为"搜索 + 即时生效"，交互能力面（弱）。* (rust-v0.163.0，见上链接)

### 评估
0.163.0 是本期 Codex 唯一的新版本，但单版信息密度高：三条执行模型线同步收口——上期预告的 `instant_interrupt` opt-in → 默认兑现，并顺手把 Code Mode 中断默认化（停 cell + 嵌套调用）；并行只读工具执行把"独立只读查找"（skill/memory/history）从串行路径摘出来并行化；Daybreak 在 0.161.0 收紧、0.163.0 又默认化，方向摆动说明该受限能力仍在"默认开/默认关"之间试探，最终以"eligible 账号默认 + API key 可经服务器放行"的折中落地。安全线延续上期 fail-closed 之后的"完整性"主题：policy-based 文件内容完整性校验（bubblewrap/Seatbelt 双后端）把沙箱校验从"能读能写"细化到"内容未被篡改"。OSC 7501 的落地（#52725 未进 New Features 摘要、只在 changelog 列表）让 Codex 成为本期第三家接入终端状态协议，延续"一家定、各家跟"的协议趋同。其余为 TUI 交互（leader key、`/daemon` 重启、`/side` 回切）与工程（GPT-6 迁移文档、Linux/macOS 包符号裁剪、去掉 patched zsh）。

### 其他动态
0.163.0：leader key（默认 Ctrl+X）、`/daemon` 重启受管后台服务、恢复线程还原权限与网络审批、代理 Command Center 行稳定化、WSL/Windows 剪贴板、远程 V2 投机/异步 compaction 基础设施（#53595～#53620）、MXC 沙箱迁移 1.0.0 SDK。

## Claude Code
窗口内版本：2.1.295（入账 10-09 03:48，已上期展开）、2.1.296（10-10 03:28，已上期展开）、2.1.299（10-14 10:49）、2.1.300（10-15 02:24）、2.1.301（10-16 03:21）、2.1.302（10-17 04:52）。无 2.1.297/2.1.298 条目（changelog 跳号）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **Idle compaction：缓存过期前主动压缩（2.1.299，2.1.302 可配置）** — 200K+ token 会话闲置约 54 分钟即在 1h prompt cache 过期前自动压缩，避免下一条消息重新处理全部上下文；`CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS` 调阈值、`idleCompaction: false` 关闭；2.1.302 在 `/config` 加 Idle compaction 行并显示关闭指引。*纳入理由：上下文管理从"手动/阈值触发"进化为"缓存过期前主动压缩"，缓存经济学驱动的自动化。* ([2.1.299](https://github.com/anthropics/claude-code/commit/db93774d73)（入账 10-14 10:49 本地）)
- **fork 子代理全通道默认 + 子代理后台化（2.1.302）** — `subagent_type: "fork"` 在 `claude -p`、Agent SDK、桌面与 VS Code 默认开启（终端早已默认，`CLAUDE_CODE_FORK_SUBAGENT=0` 关闭）；桌面与 VS Code 主会话的子代理默认后台运行（终端一致），子代理自己的 Agent 调用在 `claude -p`/SDK/桌面/VS Code 默认前台。*纳入理由：fork 型子代理执行模型从终端扩展为全通道默认，子代理后台化收官。* ([2.1.302](https://github.com/anthropics/claude-code/commit/c017428c8c)（入账 10-17 04:52 本地）)
- **`/advisor` 上 Claude Platform on AWS（2.1.300）** — 新增 `/advisor` 工具（`advisorModel`/`--advisor` 选型，`CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1` 关闭），默认不跑 advisor 直到显式选择。*纳入理由：新工具能力面（advisor），企业云通道首发。* ([2.1.300](https://github.com/anthropics/claude-code/commit/94506ff0d3)（入账 10-15 02:24 本地）)
- **Mods API 继续扩展（2.1.300 ～ 2.1.302）** — `$.ui.view({ agentId })` 在主视图显示指定代理 transcript、`virtualText` 提示框装饰文本（不进草稿/提交）、`prompt.change` hook（历史召回/清空/撤销/插件填充时触发）、`agent.spawn` hook 可改写 workflow agent 的 `prompt` 与 `model`（此前只能拒绝）、`$.prompt.media` / `$.session.identity()`（managed settings 装 mod 可读附件字节与会话身份）。*纳入理由：mods 深层行为修改权继续覆盖 UI 视图、提示框、代理生命周期改写，上期"可编程 agent 内核"线的延续。* (2.1.300/2.1.301/2.1.302，见上链接)
- **OTEL GenAI 语义约定 + classifier 判决入 telemetry（2.1.300/2.1.301）** — trace span 加 `gen_ai.*` 属性（provider/conversation/tool/error）；`tool_decision` 事件加 `classifier_verdict`、`permission_mode`、`classifier_category`，auto mode 分类器决策首次可与权限规则区分。*纳入理由：可观测性标准化——分类器决策与权限规则在 telemetry 中可分离，治理面。* (2.1.300/2.1.301，见上链接)
- **本地 transcript 记录 system prompt/tools/参数（2.1.300）** — 本地会话 transcript 记录每次 API 请求的 system prompt、工具与参数，分享的 transcript 可精确复现请求。*纳入理由：审计/可复现能力面。* (2.1.300，见上链接)
- **`CLAUDE_CODE_AUTO_MODE_MODEL`（2.1.302）** — 可选客户端 auto mode 分类器所用模型（不改服务端 auto mode 的模型）。*纳入理由：auto mode 分类器从固定实现变为可配置模型，治理面新旋钮。* (2.1.302，见上链接)

### 评估
本期 Claude Code 进入"消化期"：四版合计的 bug 修复密度为四家之最（2.1.299 单版约 150 条修复，覆盖 sandbox symlink/glob、MCP 命名/重定向、reftable 仓库、CJK 排版等），mods 线从上期的"总纲 + 多 API 连发"收敛为定点扩展（`$.ui.view`/`prompt.change`/`agent.spawn` 改写），未见上期预告的"完整 agent 内嵌 API"。真正的新能力面有三个：idle compaction（缓存过期前自动压缩，且下版即加开关，说明已在产品化而非实验）、fork 子代理全通道默认（执行模型的收敛收官）、`/advisor`（企业云新工具）。可观测性成为本期隐线——OTEL GenAI 语义约定、classifier 判决入 telemetry、本地 transcript 可复现，三者共同指向"让 auto mode/代理行为可审计"。2.1.299 的一条变化值得注意：`UserPromptSubmit` hook 提前到 skill/slash 展开之前运行，配合 2.1.302 的"prompt/agent hook 至多 12 个并发、其余排队"，说明 hook 系统自身在执行时序与并发上也在收紧。2.1.302 另将 `claude -p`/SDK 在第三方 provider 或 telemetry 关闭时的默认权限模式改回 `default`（上期 auto 默认化的部分回调），auto mode 默认范围在边界处微调。

### 其他动态
2.1.299：`CLAUDE_CODE_DISABLE_FILE_MENTIONS`（@ 文件只给路径不给内容）、`--disallow-tools`/`disallowed_tools` 从 `claude plugin eval` 剔除内置工具、sandbox 大量 symlink/glob 修复、`claude plugin eval` 拒绝超深嵌套值（28,000 层上限）。2.1.300：`CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST` 忽略 CA-bundle 等 TLS 变量、`$.ui.view({})` 返回、`agent.spawn` 事件带 `resume`。2.1.301：`%` vim 跳括号、mod `Input` 多行 `rows`、切更小模型时由上一模型先摘要。2.1.302：`/design-sync` 关闭预告（2026-12-14）、Read 拒 >128MB 图片、后台会话 idle compaction 通知、Claude Tag Slack Connect 频道/语音片段。

## 横向趋势
- **执行循环响应性从"实验"走向"出厂默认"**：Codex `instant_interrupt` 与 Code Mode 中断默认化（0.163.0）、Hermes live subagents 实时 steer/stop（v0.22.0）、Claude Code fork 子代理全通道默认（2.1.302）——三家在同窗把"打断-转向 + 子代理中途干预"从 opt-in 或单端收为默认能力，人机协同的 steering 成为 agent 内核的一等面。
- **OSC 7501 第三家落地，终端集成标准化继续兑现**：Codex 0.163.0（#52725）加入 Claude Code 2.1.295 与 pi 1.1.0 的阵营，上期"一家定、各家跟"的预判在两周内三连兑现；同期 MCP 协议版本（2026-07-28）的跟进也呈同样模式。
- **上下文经济学成为各家共识主战场**：Claude Code idle compaction（缓存过期前自动压缩 + 可开关）、pi clean model switching + GPT-6/Kimi 缓存保持 + `serializeConversation` 省略 thinking、Codex 远程 V2 投机/异步 compaction 基础设施——"缓存、压缩、thinking 卫生"从被动应对升级为主动管理，与上期"把 MCP/codemode 移出描述省 token"一脉相承。
- **安全粒度从路径隔离走向内容完整性与凭据卫生**：Codex 沙箱完整性校验（policy-based、bubblewrap/Seatbelt 双后端）、Claude Code 密集 sandbox symlink/glob 修复、Hermes 凭证不落入子进程/argv + 密码管理器凭据对模型不可见——"不可信输入默认拒绝"之后，各家开始校验"内容未被篡改"与"凭据不出边界"。
- **多代理治理与可观测性双升**：Hermes 单网关 multiplexed + live subagents、Claude Code OTEL GenAI conventions + classifier 判决入 telemetry + 本地 transcript 可复现、Codex multi-agent V2 idle eviction——子代理的隔离单元、生命周期、可观测事件都成为独立工程对象，"auto mode 决策可审计"从口号走向 telemetry 字段。
- **分发/发布工程成为 Hermes 本期主轴（单家）**：Hermes v0.22.0 的 stable release channel + 统一包管理器 + 签名桌面包（MSIX-only）是发布工程而非 agent 内核，pi 也在做 Nix pin / 依赖 exact 化；说明 harness 的"可升级性/可审计性"开始进入各家视野，但深度上 Hermes 明显领先。
- **下期窗口（约 10-19 ～ 10-28）看点**：Hermes v0.22.x 后续 patch 与单网关架构迁移收尾（v0.22.1 的 session authority/mutation receipts 落地节奏）；pi 1.4 是否重新提速、`reachesTools` 依赖图是否会驱动 codemode 多工具编排；Codex 0.164 与 Daybreak 默认化的稳定性、`instant_interrupt` 默认后的打磨；Claude Code Mods 线是否重回扩张（`$.model.complete` 类内嵌 API）、idle compaction 阈值的产品化走向。
