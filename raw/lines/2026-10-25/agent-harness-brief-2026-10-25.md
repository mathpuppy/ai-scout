# Agent Harness 更新简报 · 2026-10-25

> 时间窗：2026-10-16 ～ 2026-10-25（本地时区） · 数据源：各项目官方 GitHub（链接见各节）
> Claude Code / pi 的日期为 changelog 入账 commit 日期（UTC 转本地）；Hermes / Codex 为 release 发布时间。
> 重叠处理：本期与上期（[agent-harness-brief-2026-10-18](../2026-10-18/agent-harness-brief-2026-10-18.md)，窗口 10-09 ～ 10-18）重叠 10-16 ～ 10-18 三天，重叠区版本（Codex rust-v0.163.0、pi 1.3.0、Claude Code 2.1.302）已在上期正文展开，本期仅列版本号带过。
> 上期预告兑现情况：**Hermes v0.22.x 后续 patch 如期三连发但 curated notes 整窗押后到 v0.23.0**；pi 1.4 已发但仍是收敛期单版（转向 classifier 图像输入 + codemode 并发）；Codex 0.164 已发、Daybreak 未见新动作、重心转向 MCP OAuth 与凭据遮蔽；Claude Code Mods 线未出大内嵌 API，仅增量（decider person / isReadOnly / settings.read 分层）。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.22.3/0.22.4/0.22.5 三连发全为 patch，curated notes 押后至 v0.23.0，内核增量藏在"暂不展开"清单里 | 可插拔 delegation 后端、Hermes 化身为 MCP server、插件 OAuth client |
| pi | 1.4.0 单版，收敛期继续，能力面转向非 LLM classifier 与执行并发 | classifier 图像输入、codemode 排队 + worker 上限、summary 去固定上限 |
| OpenAI Codex | 0.164.0 一版定音：安全与 MCP 身份 | 企业 MCP OAuth、远程凭据遮蔽、`/presets` + 内联 `/model`/`/permissions` |
| Claude Code | 2.1.303 ～ 2.1.310 八连发（两版占位），bug 修复密度仍四家之最 | Monitor tool 上云、`safety_event` 遥测、`/auto-mode-setup`、mods `decider: "person"` |

**本期大盘**：节奏分化——Hermes（3 版）与 Claude Code（8 版）高频 patch，pi / Codex 各 1 版；主轴从上期"执行循环响应性"切换到**安全与身份**（Codex 企业 MCP OAuth + 凭据遮蔽、Claude Code 沙箱加固 + `safety_event`、pi MCP OAuth URL 校验、Hermes 插件 OAuth），MCP 同步走向"身份化 + 双向化"（Codex 接入企业身份、Hermes 暴露自身为 MCP server），多代理治理与上下文可靠性继续各自细化。

## Hermes Agent
窗口内版本：v0.22.3（10-21 20:21）、v0.22.4（10-22 02:49）、v0.22.5（10-23 13:28）。三者均本期首次收录。[Releases](https://github.com/NousResearch/hermes-agent/releases)

> 注：三版正文均标注为 patch release，并明确"Full curated release notes for this window ship with v0.23.0"。以下纳入项出自各 release 正文中"undocumented here on purpose"的一句话清单，原文未展开。

### 核心更新
- **可插拔 delegation 后端（v0.22.5）** — 子代理可按模型映射或 profile 路由，且可 per-session 切换。*纳入理由：子代理分发从固定后端升级为可插拔路由，多代理执行宿主的架构级变化。* ([v0.22.5 · 2026-10-22](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.5)（published 2026-10-23T05:28:45Z，本地 10-23 13:28）)
- **Hermes 化身为 MCP server（v0.22.4 入目录，v0.22.5 迁出核心）** — `mcp-serve`（Hermes as an MCP server）作为插件入目录；v0.22.5 起 `hermes mcp serve` 与 Singularity 后端一并移出核心进插件。*纳入理由：Hermes 从"调用方"变为"可被其他 agent 经 MCP 引用的一方"，能力面对外开放。* ([v0.22.4 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.4) / [v0.22.5](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.5))
- **插件 OAuth clients（v0.22.3）** — 插件可声明 OAuth client，由 Hermes 代为 sign-in 并 refresh 令牌。*纳入理由：插件获得托管式 OAuth 身份能力，第三方集成门槛降低。* ([v0.22.3 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.3)（published 2026-10-21T12:21:11Z，本地 10-21 20:21）)
- **`post_compaction` plugin hook（v0.22.3）** — 压缩完成后触发的新插件生命周期钩子。*纳入理由：插件 hook 面从会话/工具扩展到压缩生命周期。* (v0.22.3，见上链接)
- **MCP progress notifications 流式化为 live tool progress（v0.22.3）** — MCP 进度通知作为实时工具进度流式展示。*纳入理由：MCP 工具执行从"静默等待"升级为"可观测进度"，执行可观测性。* (v0.22.3，见上链接)

### 评估
三连发全为 patch，Hermes 刻意把 v0.22.2 之后整窗的 curated notes 押后到 v0.23.0（正文明言"Nothing in this window is skipped"），因此本期正文颗粒度低、只能从一句话清单推断。真正的内核增量是两条：一是**多代理治理**（可插拔 delegation 后端——子代理路由可插拔、per-session 切换，延续上期 live subagents 与单网关的治理线）；二是**把自己变成被集成的对象**（Hermes as MCP server、插件 OAuth、`hermes import-agent`/OpenClaw 迁移），说明 Hermes 开始建设"被别的 agent / 生态引用"的接口面，而不只是调用方。发布工程线继续（Microsoft Store 自动上架、Electron 44、依赖安全 bump）。核心架构（单网关/单后端）未见新的收尾信号，需等 v0.23.0 一次性兑现。

### 其他动态
v0.22.3：本地运行时新模型（Nemotron 3.5 Bolt、单槽 DFlash drafts）、session auto-prune 回到 opt-in（磁盘不足时一次性提示）、capabilities catalog、Desktop 引导式 subagent 模型/provider 选择器、steer/edit 排队中的 prompt、live `/loop` 倒计时。v0.22.4：bubblewrap / Singularity / Apptainer 后端插件、agent-importers（`hermes import-agent` 新增 Cursor）、Telegram Business 迁往社区 tier。v0.22.5：Nous sign-in 重做（统一 device login、guest 交接）、usage-window plan 支持（plan gauges / limit cards / model-switch recovery）、plugin slash commands 支持弹出选项、`hermes import-agent` / OpenClaw 迁移、实验性 webhook-mode MCP events client。

## pi
窗口内版本：1.3.0（入账 10-16 02:57，上期已展开）、1.4.0（入账 10-22 06:29）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

### 核心更新
- **Classifier 图像输入（1.4.0）** — codemode `models.classify()` 接受 `images`，用于 TypeSafe Jev / Cloudflare Clef（`typesafe`、`cloudflare-workers-ai`、OpenRouter），provider 级 `compat` 对 classifier 同样生效（含 `imageInput`/`sendImageOptInHeader`）。*纳入理由：非 LLM classifier 从纯文本扩展到图像输入，codemode 分类能力面新增。* ([1.4.0 · 2026-10-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#140---2026-10-21)（release commit [4a080252f06c](https://github.com/earendil-works/pi/commit/4a080252f06caf63a525d7873c5d94d3c23887e0)，入账 10-22 06:29 本地）)
- **Summary 去掉固定输出上限（1.4.0）** — compaction 与 branch summary 改用模型 output limit，长 reasoning 不再因固定 cap 失败；`generateSummary()`/`generateSummaryWithUsage()` 忽略 `reserveTokens`，`compaction.reserveTokens` 只管何时开始压缩。*纳入理由：上下文压缩从"固定 token 上限"改为"跟随模型输出上限"，长推理下压缩可靠性。* (1.4.0，见上锚点)
- **Codemode 等待空闲 worker + `PI_CODEMODE_MAX_WORKERS`（1.4.0）** — 并行脚本与进程内子代理在 worker 满时排队（最多等 60s）而非立即失败，`PI_CODEMODE_MAX_WORKERS` 可调默认两个 worker 的上限。*纳入理由：codemode 并发执行从"竞争即失败"升级为"排队等待 + 可调并发"，执行模型并发治理。* (1.4.0，见上锚点)
- **Rex 终端支持（1.4.0）** — OSC 8 超链接、truecolor、inline images。*纳入理由：终端集成面向新终端（Rex）扩展（弱）。* (1.4.0，见上锚点)

### 评估
pi 继续收敛期：单版 1.4.0，主题从上期"工具编排 + 缓存经济学"转向两条新线——**非 LLM 模型能力面**（classifier 图像输入，配合上期 `reachesTools`/codemode 编排系统，classifier 正在成为一等公民）与**执行并发治理**（codemode 排队、summary 去固定上限，都是"极端情况下不崩"的可靠性工程）。安全线首次出现 MCP OAuth URL 校验（Unreleased 区：拒绝 `file:`/自定义协议的 OAuth 元数据 URL），与 Codex / Claude Code 本期 MCP 安全动作同频。Breaking 面收敛（仅 provider attribution headers 迁往 pi-ai client identity，对扩展的 `before_provider_headers` 可见）。Unreleased 区无大动作预告，1.5 动向不明。

### 其他动态
1.4.0：Models Configuration reference（schema 生成）、默认模型切换（GitHub Copilot `gpt-5.4`→`gpt-6.1-sol`、NVIDIA→`nemotron-3.5-super-vl-120b-a12b`、Xiaomi→`mimo-v2.6-pro`）、Grok 4.3/4.5 增加 `xhigh` thinking、`MiniMax-M3.1-Flash` 入目录。Unreleased：device-code login 按 Enter 打开验证页并复制 code、`/model` 显示模型名、`pi install/remove` symlink 嵌套 lockfile 修复、MCP OAuth URL 白名单校验、fd/rg 自动下载架构修复。

## OpenAI Codex
窗口内稳定版：rust-v0.163.0（本地 10-16 05:30，已上期展开）、rust-v0.164.0（10-23 12:48）。[Releases](https://github.com/openai/codex/releases)

### 核心更新
- **企业 MCP OAuth 认证（0.164.0）** — 用 eligible Codex account grants 或专属 sign-in 认证企业 MCP 连接，含需要 secret 的 OAuth clients。*纳入理由：MCP 接入从"本地/免密"扩展到"企业身份 + OAuth"，企业 MCP 服务器接入的能力面。* ([rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)（published 2026-10-23T04:48:10Z，本地 10-23 12:48）)
- **远程凭据遮蔽（0.164.0）** — 受支持的远程 Bash 命令与 Zsh snapshot 会话中遮蔽凭据，含自定义 provider 的凭据。*纳入理由：远程执行链路凭据不落明文，安全面。* (rust-v0.164.0，见上链接)
- **`/presets` 可复用提示词 / 斜杠命令（0.164.0）** — 10 个编号槽位保存可复用 prompt 与 slash command，键盘菜单速取。*纳入理由：提示词复用成为一等命令面（弱）。* (rust-v0.164.0，见上链接)
- **内联 `/model` 与 `/permissions` 参数（0.164.0）** — 直接带参设 model / reasoning effort / speed / permission profile。*纳入理由：配置面从面板/搜索转向内联参数（弱）。* (rust-v0.164.0，见上链接)

### 评估
Codex 单版 0.164.0，重心从 0.163.0 的"执行循环默认化"转向**安全与 MCP 身份**：企业 MCP OAuth（account grants / 专属 sign-in / 需 secret 的 OAuth client）把 MCP 接入推进到企业身份体系；远程凭据遮蔽覆盖 Bash / Zsh snapshot 与自定义 provider。上期预告的 Daybreak 默认化稳定性本期无新动作（0.164.0 New Features 无 Daybreak 条目）。后台基础设施继续滚动（content provenance 贯穿 prompt assembly/compaction #53831、background compaction 接入 turn lifecycle #53800、Guardian V2 异步分类默认 conversation mode #53733、V2 executor capability inventory #53736），"内容溯源 + 异步分类"仍是 Codex 后台主线。

### 其他动态
0.164.0：全屏 transcript 图片预览（Kitty/Sixel）、Amazon Bedrock setup wizard 默认开启、`-c`/`--config` 多层级覆盖保留、macOS 大小写变体元数据路径与可替换 symlink 的沙箱加固、Windows HTTPS/WebSocket 代理认证（Negotiate/NTLM）、未用安装裁剪与 daemon 日志限界。

## Claude Code
窗口内版本：2.1.302（入账 10-17 04:52，已上期展开）、2.1.303（10-19 06:26）、2.1.304（10-20 05:34）、2.1.305（10-21 04:46）、2.1.306（10-21 11:16）、2.1.307（10-22 06:16）、2.1.308（10-22 12:34）、2.1.309（10-23 06:18）、2.1.310（10-24 07:38）。无跳号（2.1.303 / 2.1.308 为 "Bug fixes and reliability improvements" 占位）。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **Monitor tool + plugin monitors 上云（2.1.310）** — Monitor tool 与 plugin monitors 扩展到 Bedrock、Vertex、Foundry，以及 telemetry / 非必要流量关闭时；长前台 sleep 在这些环境也被阻断。*纳入理由：Monitor 工具面从 Anthropic 自有后端扩展到多云与 telemetry-disabled 环境。* ([2.1.310](https://github.com/anthropics/claude-code/commit/b70dc4113ad72e0ee44f7b1b95afaf510b53ee98)（入账 10-24 07:38 本地）)
- **`claude_code.safety_event` OTEL 事件（2.1.307）** — 每个被 permission rule、auto mode、safety check、hook 或 sandbox 拦下 / 提示 / 驳回的工具调用都发一条 `safety_event`。*纳入理由：安全判决从散落各机制统一为可观测事件流，治理 / 审计能力面。* ([2.1.307](https://github.com/anthropics/claude-code/commit/1132b8a98e93300bb3822197fb7eee12ce4fb906)（入账 10-22 06:16 本地）)
- **`/auto-mode-setup`（2.1.304）** — 引导式设置读取项目与近期会话，教 auto mode 认识环境；扩展到 Bedrock、Vertex、Foundry、Claude apps gateway 与 telemetry-disabled 会话。*纳入理由：auto mode 从"开箱即用"升级为"可按项目定制"，能力面新工具。* ([2.1.304](https://github.com/anthropics/claude-code/commit/772c6bee5c36f58be43bbb2b182862aeb22aceff)（入账 10-20 05:34 本地）)
- **mods `tool.check` 增强：`decider: "person"` + `e.isReadOnly`（2.1.304）** — `decider: "person"` 强制只有权限对话框或宿主回调可批准（无人可问时以 mod 的理由拒绝）；`e.isReadOnly` 标记只读工具调用。*纳入理由：mods 权限模型新增"人必须裁决"档位，mods 线延续。* (2.1.304，见上链接)
- **`sandbox.allowNestedUserNamespaces`（2.1.305）** — Linux 沙箱内命令可创建 user namespace（Chromium、rootless podman），代价是可绕过沙箱文件保护。*纳入理由：沙箱能力面新旋钮（显式放行嵌套命名空间）。* ([2.1.305](https://github.com/anthropics/claude-code/commit/49b8c35f8c57493c2f0eba1429ccaa9638ab8712)（入账 10-21 04:46 本地）)

### 评估
Claude Code 本期 8 连发（2.1.303 ～ 2.1.310），其中 2.1.303 / 2.1.308 为占位版，实质 6 版。bug 修复密度仍四家之最——sandbox（startup files 越界执行、symlink 下 denyWrite、MCP config 写入防护）、权限检查（Bash redirect / compound cd / Set-Location）、工作树隔离（locale / arithmetic / replace refs）几乎每版都在收口，说明沙箱 + 权限边界仍在"打补丁式"加固而非系统性重写。真正的新能力面三个：Monitor tool 上云、`safety_event` 遥测（把"谁拦了这次工具调用"统一成事件）、`/auto-mode-setup`（auto mode 可定制）。mods 线本期为增量（`decider: "person"` / `e.isReadOnly` / `settings.read` 按层重写 merged settings），未见上期预告的大内嵌 API。治理线明显增强（Cloud sessions RBAC、Code Review 评审等级、`claude ultrareview` 要求 workspace trust、`/claude-api managed-agents-secure` 安全比对），Claude Code 持续从"个人 CLI"向"企业治理面"扩张。

### 其他动态
2.1.304：Code Review 评审等级（Quick / Standard / Deep）+ 全 org 仓库自动纳入、compaction 后重发 skill 列表、`/reload-skills` 只发新增/变更、skill hooks 上限（每源 1,024 hooks / 16,384 matcher 字符）。2.1.307：`/claude-api api-version`（迁 API 版本 2026-10-21）、fork 子代理启动自识别、不可解析工具调用最多重试两次、`@claude review stop`。2.1.309：`claude ultrareview` 要求 workspace trust、`rm`/`rmdir` bypass 模式直接拒绝并给 rewrite 提示、Managed Agents 子代理团队默认动态 workflow（`multiagent_20261001`）、大量 sandbox / 权限 / 工作树隔离修复。2.1.310：[Cloud sessions] Cloud sessions 与 Remote Control 权限进 Enterprise 自定义角色、Bedrock / Vertex / Foundry 上 Monitor tool。

## 横向趋势
- **安全与身份成为本期主轴**：Codex 企业 MCP OAuth + 远程凭据遮蔽、pi MCP OAuth URL 白名单校验、Claude Code sandbox 打补丁加固 + `safety_event` 遥测、Hermes 插件 OAuth client——四家不约而同把"MCP 身份 / 凭据边界"当成本周主战场，比上期"内容完整性"更进一步。
- **MCP 从"能力接入"走向"身份化 + 双向化"**：Codex 企业 MCP OAuth（进）与 Hermes `hermes mcp serve`（出）同窗出现——MCP 不仅是 agent 消费工具的方式，也成了 agent 暴露自身、接入企业身份体系的接口。
- **多代理治理继续分层细化**：Hermes 可插拔 delegation 后端（per-session 路由）、pi codemode 排队 + worker 上限、Claude Code fork 子代理自识别 + Monitor tool 扩展——子代理的"路由 / 并发 / 监控"各自成为独立工程对象。
- **上下文经济学从"省 token"转向"可靠性"**：pi summary 去固定上限（长推理不再失败）、Claude Code compaction 后重发 skill 列表 + 超大 CLAUDE.md 截断、Codex content provenance + background compaction 入 turn lifecycle——本期不再是"缓存保持"的精细化，而是"压缩 / 溯源在极端情况下不崩"的可靠性工程。
- **分化明显，趋同点收窄到 MCP 安全与多代理治理**：Hermes 押注"发布工程 + 被集成面"（curated notes 押后、MCP server 化），Codex 押注"安全 + 企业接入"，Claude Code 押注"沙箱加固 + 企业治理面"，pi 押注"非 LLM classifier + 执行并发"。
- **下期看点（约 10-26 ～ 11-04）**：Hermes v0.23.0 curated notes（一次性兑现 v0.22.3 ～ 0.22.5 全部未展开条目）；pi 1.5 是否延续 classifier / 并发线；Codex 0.165 的 Daybreak 与 MCP OAuth 稳定性；Claude Code Monitor tool 的产品化走向与 sandbox 加固是否转向系统性重写。
