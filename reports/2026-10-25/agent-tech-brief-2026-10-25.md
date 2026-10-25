# Agent 技术周报 · 2026-10-25（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [10-16, 10-25] · 论文线 [10-17, 10-23] · 产物：agent-harness-brief-2026-10-25.md、trending-2026-10-25.md、papers-2026-10-25.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| 安全与身份：MCP 身份化 + 双向化 | 四家 harness 不约而同主攻 MCP 身份/凭据边界，MCP 从「能力接入」走向「身份化 + 双向化」，安全审计外溢成官方 skill 与论文新范式 | 值得观望 |
| Hermes Agent v0.22.x 三连发 | 三连发全为 patch，可插拔 delegation 后端是内核增量，curated notes 押后至 v0.23.0 | 值得观望 |
| pi 1.4.0 | 收敛期单版，classifier 图像输入 + codemode 排队 + summary 去固定上限 | 仅记录 |
| OpenAI Codex 0.164.0 | 单版定音，重心转向安全与企业 MCP 身份，Daybreak 无新动作 | 值得观望 |
| Claude Code 2.1.303~2.1.310 八连发 | 八连发 bug 修复密度最高，新能力面 Monitor 上云 / safety_event / auto-mode-setup | 值得观望 |
| agent skills / 插件生态爆发 | 大厂把 agent 能力打包成可复用、可审计的 skill 单元，官方目录成分发渠道 | 值得导入 |
| agent 运行/控制层新形态 | fleet 编排、移动控制面、多 agent swarm 构成 harness 层新竞争 | 值得观望 |
| 长程 agent 的上下文、记忆与真实评测 | 记忆/上下文方案与真实世界评测成论文热点，跨厂商记忆与知识图谱成工程热点 | 值得观望 |
| harness 成为论文研究对象 | 脑-体失配、极薄 harness、agentic CLI 基础模型、缓存工程登上论文主线 | 仅记录 |

**本期大盘**：主线从「执行循环响应性」切到「安全与身份」——四家 harness 不约而同主攻 MCP 身份/凭据边界，MCP 同步走向身份化 + 双向化；同时 agent skills/插件生态在 GitHub 周榜爆发，长程 agent 的记忆/上下文与评测成为论文热点。

## 安全与身份：MCP 从「能力接入」走向「身份化 + 双向化」
### 事实
- **Codex 企业 MCP OAuth 认证** — 用 eligible Codex account grants 或专属 sign-in 认证企业 MCP 连接，含需 secret 的 OAuth clients（*harness*）（[rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)）
- **Codex 远程凭据遮蔽** — 受支持的远程 Bash 命令与 Zsh snapshot 会话中遮蔽凭据（*harness*）（[rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)）
- **pi MCP OAuth URL 白名单校验** — 拒绝 `file:`/自定义协议的 OAuth 元数据 URL（*harness*）（Unreleased 区，[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)）
- **Claude Code `claude_code.safety_event` OTEL 事件** — 每个被 permission rule / auto mode / safety check / hook / sandbox 拦下 / 提示 / 驳回的工具调用都发一条事件（*harness*）（[2.1.307 · 2026-10-22](https://github.com/anthropics/claude-code/commit/1132b8a98e93300bb3822197fb7eee12ce4fb906)）
- **Hermes 插件 OAuth clients** — 插件可声明 OAuth client，由 Hermes 代 sign-in 并 refresh 令牌（*harness*）（[v0.22.3 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.3)）
- **Hermes 化身为 MCP server** — `hermes mcp serve` 与 Singularity 后端一并移出核心进插件（*harness*）（[v0.22.4 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.4) / [v0.22.5](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.5)）
- **Cloudflare security-audit-skill** — 面向 coding agent 的多阶段安全审计 skill，本周 +12,680 星（榜一）（*潮流*）（[repo](https://github.com/cloudflare/security-audit-skill)）
- **Right Screen, Wrong Transition** — 免解码、动作条件化的 GUI 世界模型直接校验「屏幕跳转」，低延迟识别 GUI agent 被劫持的攻击（*论文*）（[paper](https://huggingface.co/papers/2610.11942)〔repo: jiamingzhang94/lgwm ⭐3〕）

### 简评
四家 harness 不约而同把「MCP 身份 / 凭据边界」当成本周主战场：Codex 企业 OAuth + 凭据遮蔽、pi URL 白名单校验、Claude Code 沙箱加固 + `safety_event` 遥测、Hermes 插件 OAuth，安全从散落机制走向统一可观测。同时 MCP 双向化——Hermes 从「调用方」变成「可被其他 agent 经 MCP 引用的一方」。安全审计进一步外溢为官方 skill（Cloudflare，榜一）与论文新范式（GUI 世界模型做跳转校验）。

**结论**：值得观望 — 方向重要且是持续主线，但各家工具仍在快速迭代，具体形态未定型。

## Hermes Agent v0.22.x 三连发
### 事实
- **可插拔 delegation 后端** — 子代理可按模型映射或 profile 路由，且可 per-session 切换（*harness*）（[v0.22.5 · 2026-10-22](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.5)）
- **`post_compaction` plugin hook** — 压缩完成后触发的新插件生命周期钩子（*harness*）（[v0.22.3 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.3)）
- **MCP progress notifications 流式化为 live tool progress** — MCP 工具执行从「静默等待」升级为「可观测进度」（*harness*）（[v0.22.3 · 2026-10-21](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.3)）
- **curated notes 押后至 v0.23.0** — 三版均标注 patch release，正文明言整窗「Nothing in this window is skipped」，纳入项出自「undocumented here on purpose」一句话清单（*harness*）（[Releases](https://github.com/NousResearch/hermes-agent/releases)）

### 简评
三连发全为 patch，正文颗粒度低、只能从一句话清单推断。真正的内核增量是两条：可插拔 delegation 后端（多代理治理，延续上期 live subagents 线）与「被集成面」建设（MCP server 化、插件 OAuth、import-agent/OpenClaw 迁移）。核心架构（单网关/单后端）未见新的收尾信号。

**结论**：值得观望 — 等 v0.23.0 一次性兑现整窗未展开条目后再判断。

## pi 1.4.0
### 事实
- **Classifier 图像输入** — codemode `models.classify()` 接受 `images`，provider 级 `compat` 对 classifier 同样生效（*harness*）（[1.4.0 · 2026-10-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#140---2026-10-21)）
- **Summary 去掉固定输出上限** — compaction 与 branch summary 改用模型 output limit，长 reasoning 不再因固定 cap 失败（*harness*）（[1.4.0 · 2026-10-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#140---2026-10-21)）
- **Codemode 等待空闲 worker + `PI_CODEMODE_MAX_WORKERS`** — worker 满时排队（最多等 60s）而非立即失败，上限可调（*harness*）（[1.4.0 · 2026-10-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#140---2026-10-21)）

### 简评
收敛期单版，主题转向两条新线：非 LLM classifier 一等公民化（图像输入）与执行并发治理（排队 + worker 上限 + summary 去固定上限），都是「极端情况下不崩」的可靠性工程。安全线首次出现 MCP OAuth URL 校验（见「安全与身份」选题），与 Codex / Claude Code 本期动作同频。

**结论**：仅记录 — 单 harness 收敛期增量，能力面窄，非 pi 用户难直接落地。

## OpenAI Codex 0.164.0
### 事实
- **企业 MCP OAuth 认证** — 已在「安全与身份」选题展开（*harness*）（[rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)）
- **远程凭据遮蔽** — 已在「安全与身份」选题展开（*harness*）（同上链接）
- **`/presets` 可复用提示词 / 斜杠命令** — 10 个编号槽位保存可复用 prompt 与 slash command，键盘菜单速取（*harness*）（[rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)）
- **内联 `/model` 与 `/permissions` 参数** — 直接带参设 model / reasoning effort / speed / permission profile（*harness*）（[rust-v0.164.0 · 2026-10-23](https://github.com/openai/codex/releases/tag/rust-v0.164.0)）

### 简评
单版定音，重心从 0.163.0 的「执行循环默认化」转向安全与 MCP 身份：企业 MCP OAuth 把 MCP 接入推进到企业身份体系，远程凭据遮蔽覆盖 Bash / Zsh snapshot 与自定义 provider。上期预告的 Daybreak 默认化稳定性本期无新动作；后台「内容溯源 + 异步分类」仍是主线。

**结论**：值得观望 — 企业 MCP OAuth 是把 MCP 推进企业身份体系的关键一步，但生态成熟度待观察。

## Claude Code 2.1.303~2.1.310 八连发
### 事实
- **Monitor tool 上云** — Monitor tool 与 plugin monitors 扩展到 Bedrock、Vertex、Foundry 及 telemetry 关闭时（*harness*）（[2.1.310 · 2026-10-24](https://github.com/anthropics/claude-code/commit/b70dc4113ad72e0ee44f7b1b95afaf510b53ee98)）
- **`/auto-mode-setup`** — 引导式设置读取项目与近期会话，教 auto mode 认识环境，扩展到多云与 telemetry-disabled 会话（*harness*）（[2.1.304 · 2026-10-20](https://github.com/anthropics/claude-code/commit/772c6bee5c36f58be43bbb2b182862aeb22aceff)）
- **mods `tool.check` 增强：`decider: "person"` + `e.isReadOnly`** — 强制人必须裁决的档位 + 只读工具调用标记（*harness*）（[2.1.304 · 2026-10-20](https://github.com/anthropics/claude-code/commit/772c6bee5c36f58be43bbb2b182862aeb22aceff)）
- **`sandbox.allowNestedUserNamespaces`** — Linux 沙箱内命令可创建 user namespace（代价是可绕过沙箱文件保护）（*harness*）（[2.1.305 · 2026-10-21](https://github.com/anthropics/claude-code/commit/49b8c35f8c57493c2f0eba1429ccaa9638ab8712)）
- **`claude_code.safety_event`** — 已在「安全与身份」选题展开（*harness*）（[2.1.307 · 2026-10-22](https://github.com/anthropics/claude-code/commit/1132b8a98e93300bb3822197fb7eee12ce4fb906)）

### 简评
八连发（2.1.303 / 2.1.308 为占位版），bug 修复密度仍四家之最——沙箱 + 权限边界在「打补丁式」加固而非系统性重写。真正的新能力面三个：Monitor 上云、`safety_event` 遥测、`/auto-mode-setup`。治理线明显增强（Cloud sessions RBAC、Code Review 评审等级、`claude ultrareview` 要求 workspace trust），持续从「个人 CLI」向「企业治理面」扩张。

**结论**：值得观望 — 治理面增强明显，但沙箱加固尚未见系统性收口。

## agent skills / 插件生态爆发
### 事实
- **anthropics/claude-plugins-official** — Anthropic 官方管理的 Claude Code 高质量插件目录，本周 +3,232 星（*潮流*）（[repo](https://github.com/anthropics/claude-plugins-official)）
- **anthropics/knowledge-work-plugins** — 面向知识工作者的 Claude Cowork 插件开源仓库（官方），本周 +2,631 星（*潮流*）（[repo](https://github.com/anthropics/knowledge-work-plugins)）
- **android/skills** — Google 官方 Android skills：AI 优化的模块化指令/资源，帮 agent 遵循 Android 开发最佳实践，本周 +1,317 星（*潮流*）（[repo](https://github.com/android/skills)）
- **cloudflare/security-audit-skill** — 已在「安全与身份」选题展开（*潮流*）（[repo](https://github.com/cloudflare/security-audit-skill)）

### 简评
Anthropic（插件目录 + 知识工作插件）、Google（Android skills）、Cloudflare（安全审计 skill）同周上榜，大厂正把 agent 能力打包成可复用、可审计的 skill 单元，官方目录成为分发渠道。这是本周 GitHub 周榜最大的结构性方向。

**结论**：值得导入 — 官方出品的 skill / 插件目录上手成本低，可直接试用。

## agent 运行/控制层新形态
### 事实
- **stablyai/orca** — agent fleet 运行平台：用自有订阅跑任意 coding agent，桌面/移动/远程运行时，本周 +9,828 星（*潮流*）（[repo](https://github.com/stablyai/orca)）
- **anomalyco/opencode** — 开源 coding agent（TypeScript，MIT），本周 +6,857 星（*潮流*）（[repo](https://github.com/anomalyco/opencode)）
- **ruvnet/ruflo** — 自称「the original agent harness」：多 agent swarm、自适应记忆、联邦、向量 RAG，本周 +3,241 星（*潮流*）（[repo](https://github.com/ruvnet/ruflo)）
- **pingdotgg/t3code** — 「agent harness control surface」：用移动 app 控制本机上的 agent，本周 +1,778 星（*潮流*）（[repo](https://github.com/pingdotgg/t3code)）

### 简评
harness 层新竞争形态：fleet 编排 + 自有订阅计费（orca）、移动端控制面（t3code）、多 agent swarm harness（ruflo）、主流开源 coding agent（opencode）。除 opencode 外多为新项目或单维护者，可持续性待观察。

**结论**：值得观望 — 形态新颖，但成熟度与可持续性未明。

## 长程 agent 的上下文、记忆与真实评测
### 事实
- **BizBench** — 以可执行业务工具、资源约束、时序依赖与严格成功判据构建的长程智能体基准，暴露企业真实部署的隐性挑战，upvotes 494（*论文*）（[paper](https://huggingface.co/papers/2610.20424)〔repo: ant-intl/BizAgentBench ⭐54〕）
- **Into the Unknown** — 让 agent 从未发表方向续写科研论文，发现无一达专家水准、多数捏造与证据矛盾，upvotes 159（*论文*）（[paper](https://huggingface.co/papers/2610.19159)〔repo: prometheus-eval/into-the-unknown ⭐20〕）
- **Pack Light, CarryOn** — 对象化上下文运行时，围绕可复用任务对象组织长程 agent 延续，upvotes 124（*论文*）（[paper](https://huggingface.co/papers/2610.18784)〔repo: Ethannju/carryon ⭐5〕）
- **OpenVLHarness** — Apple：持久多模态记忆 + 异构工具接口 + 迭代证据合成的视觉 agent 框架，upvotes 119（*论文*）（[paper](https://huggingface.co/papers/2610.26860)〔repo: uclanlp/OpenVLHarness ⭐243〕）
- **akitaonrails/ai-memory** — coding agent CLI 的长期记忆 + 跨厂商 handoff（Rust），本周 +3,541 星（*潮流*）（[repo](https://github.com/akitaonrails/ai-memory)）
- **Graphify-Labs/graphify** — 把任意代码库转为可查询知识图谱，本地确定性 AST 解析、无向量库，本周 +6,868 星（*潮流*）（[repo](https://github.com/Graphify-Labs/graphify)）

### 简评
长程 agent 的记忆/上下文与评测下沉到真实世界：企业与科研考场做「诚实体检」（BizBench 暴露部署隐性挑战、Into the Unknown 显示无一达专家水准），上下文新抽象（对象化 CarryOn、多模态记忆 OpenVLHarness）与跨厂商记忆/知识图谱（ai-memory、graphify）成工程热点。

**结论**：值得观望 — 方向重要，但记忆/上下文方案与评测基准均未定型。

## harness 成为论文研究对象
### 事实
- **Cache Engineering for Agents** — AKV：以 drop/repos 操作管理 LLM agent 的 KV 缓存，配协同推理引擎，upvotes 153（*论文*）（[paper](https://huggingface.co/papers/2610.28577)〔repo: thu-nics/AKV ⭐56〕）
- **HexaShell** — 用极薄 harness 让 VLM coding agent 经自写工具直接操控双臂机器人，RoboDojo 登顶但接触密集任务仍吃力，upvotes 122（*论文*）（[paper](https://huggingface.co/papers/2610.23479)〔repo: HexaFuture/HexaShell ⭐144〕）
- **CoEvo-RSI** — 针对递归自我改进中的「脑-体失配」，用双向历史继承让模型能力对齐不断演进的 harness，仅靠 SFT 即达强结果，upvotes 120（*论文*）（[paper](https://huggingface.co/papers/2610.25078)〔repo: SuJQ0722/CoEvo-RSI ⭐8〕）
- **IQuest-Q1** — 320B 稀疏 MoE（15B 激活）agentic 基础模型，预训/中训/后训三阶段强化 agentic CLI 编码，upvotes 96（*论文*）（[paper](https://huggingface.co/papers/2610.30949)〔repo: 未附〕）

### 简评
harness（训练与执行脚手架）从工具升级为研究对象：脑-体失配（CoEvo-RSI）、极薄 harness 探具身边界（HexaShell）、把基础模型训练对准 agentic CLI（IQuest-Q1）、把 KV 缓存当 agent 推理的一等工程（Cache Engineering）。

**结论**：仅记录 — 有研究价值，无近期采用价值。

## 本周热门（潮流线）
> 注：潮流线输入仅含「本周星增」口径，无当前 stars 数字，以下照原样带过。

- **heygen-com/hyperframes** 本周 +5,633 星 — 「Write HTML. Render video. Built for agents.」面向 agent 的 HTML→视频渲染原语（HeyGen 官方）（[repo](https://github.com/heygen-com/hyperframes)）
- **vllm-project/vllm** 本周 +1,371 星 — 高吞吐、低内存 LLM 推理/服务引擎（非 agent 专用，边缘相关）（[repo](https://github.com/vllm-project/vllm)）

## 本周论文（论文线）
> 按 upvotes 降序；〔模型判读〕标注照原样保留。

- **SpatialScout**（北京大学 · upvotes 165）— 首个评估 VLM agent 主动探索并构建度量级 3D 地图能力的基准，揭示精确建图仍是显著短板（[paper](https://huggingface.co/papers/2610.26659)〔repo: JesseZZZZZ/SpatialScout ⭐10〕）
- **S-Agent 2.0**（NTU〔模型判读〕 · upvotes 106）— 为通用 coding agent 加持久场景记忆与自然语言解读，配合 3D 感知工具显著提升空间推理（[paper](https://huggingface.co/papers/2610.28354)〔repo: Ropedia/S-Agent-2.0 ⭐29〕）

## harness 监控名单提名
> 潮流线候选区原样带过，采纳与否由人改 harness-digest 的监控表。

- **ruvnet/ruflo** — 提名进 harness-digest 监控名单：直接以 agent harness 定位（多 agent swarm/联邦/多框架集成），是深度线应持续跟踪的 harness 候选；注意单维护者风险。
- **stablyai/orca** — 提名进 harness-digest 监控名单：agent fleet 运行层 + 自有订阅计费模型，属 harness 能力级新形态。
- **pingdotgg/t3code** — 提名进 harness-digest 监控名单：harness 控制面（移动端）形态新颖，值得监控后续架构迭代。
- **anomalyco/opencode** — 提名进 harness-digest 监控名单（若名单未覆盖）：主流开源 coding agent，本周 +6.8k，能力迭代频繁。
- **akitaonrails/ai-memory** — 提名进 harness-digest 监控名单：跨厂商 agent 记忆/handoff，属 harness 层关键能力（memory 线）。

一句话建议：五个候选里 orca（fleet + 自有订阅计费）与 ai-memory（memory 线）最具方向代表性，建议优先纳入监控；ruflo 单维护者风险较高，可降级为「观察」。
