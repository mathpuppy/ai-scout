# Agent 技术周报 · 2026-10-18（运行日）

> 窗口：GitHub 官方周榜（since=weekly，抓取于 2026-10-18）· harness 线 [2026-10-09, 2026-10-18] · 论文线 [2026-10-10, 2026-10-16]（实覆盖 5/7 天，10-10 / 10-11 周末页为空）· 产物：agent-harness-brief-2026-10-18.md、trending-2026-10-18.md、papers-2026-10-18.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| Hermes v0.22.0「The Threshold Release」 | 约 6,080 PR / 2,520 贡献者的最大窗口一次性清零 curated notes 欠账：Connectors 进托管 SaaS、live subagents 实时 steer、Bot Screen 人机接管、单网关 + 本机模型一键化 | 值得观望 |
| pi 1.2.0 / 1.3.0 | `reachesTools` 把工具依赖图变显式声明；clean model switching 与 GPT-6/Kimi 缓存保持把「改配置/加工具」从缓存杀手变缓存保持点 | 值得导入 |
| OpenAI Codex 0.163.0 | `instant_interrupt` 转默认、并行只读工具、Daybreak 重新默认、OSC 7501 第三家落地、沙箱完整性校验 | 值得导入 |
| Claude Code 2.1.299 ～ 2.1.302 | idle compaction 缓存过期前主动压缩、fork 子代理全通道默认、`/advisor` 上 AWS、OTEL GenAI + classifier 判决入 telemetry | 值得导入 |
| harness 插件化（官方插件目录同频） | Anthropic 官方插件目录与 Cursor 插件规范同周上榜，头部 harness 把扩展能力标准化成插件市场 | 值得观望 |
| agent 上下文工程（context-mode） | 宣称 98% 压缩的上下文窗口优化层、跨 17 平台 MCP 路由，直击 harness 上下文成本，与各家缓存经济学同窗共振 | 值得观望 |
| agent 驱动逆向工程（rea） | 把 Claude Code / Codex / MCP / Ghidra 编排成「逆向 agent」，本周 +24 万星近乎指数级出圈 | 值得观望 |
| System One 决策原生模型（论文） | Jeva / VideoJev / MJev-Spatial 三篇把「做决定」从自回归文本拆出，单次前向直接输出结构化决策 | 值得观望 |
| computer-use 开源全栈 + 合成环境（论文） | 阿里 OpenGCUA / MAI-Gym、腾讯 Player-1、上交 SoftwareGym 把 harness、合成环境、在线 RL 打通 | 值得观望 |
| harness 递归自我改进 RSI（论文） | Google Harness^2 与中关村学院/中科大 Self-Evolving Agent Harness 都在固定权重下让 harness 自演化 | 值得观望 |
| agent 评测转向「最后一公里」（论文） | AgentSWE 检验交付 agent 是否忠实于需求，Agent-Reflex 教反思恢复，阿里合成 long-horizon 终端数据 | 值得观望 |

**本期大盘**：节奏整体放缓（pi 从九连发降到两连发、Claude Code 转入 bug 修复为主），但 Hermes v0.22.0 以 6,080 PR 兑现跨五 tag 欠账、成为本期最大单家事件；「执行循环响应性」（Codex instant_interrupt 默认、Hermes live subagents、Claude Code fork 子代理默认）与「上下文经济学」（idle compaction、clean model switching、context-mode）两条线贯穿，OSC 7501 第三家落地继续兑现终端集成标准化。潮流线集中在插件化、上下文工程、能力外延（逆向 / 视频）；论文线主线是 System One 决策原生、computer-use 开源栈、harness-RSI。

## Hermes v0.22.0「The Threshold Release」

### 事实
- **Connectors：agent 进入托管 SaaS 应用** — 经 Nous tool gateway 在 Linear、Notion 等托管应用内直接操作，免费 guest identity 起步、同应用多命名账号（`work`/`home`）（*harness*）（[v0.22.0 · 2026-10-14](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.0)）
- **本机模型一键化（受管 llama.cpp 运行时）** — 无账号无 key 在本机跑开放模型：按硬件选引擎、按 GPU/RAM 评级推荐，目录含 Qwen3.8 27B、DeepSeek V4 Flash 及任意 HF GGUF（*harness*）（v0.22.0，见上链接）
- **单网关 + 单桌面后端服务所有 profile** — 每机器一个 messaging gateway + 一个 desktop backend 服务全部 profile，multiplexed 单进程替代每 profile 一进程（*harness*）（v0.22.0，见上链接）
- **Live subagents：实时可见、可 steer/stop** — 运行中子代理常驻 composer 上方，显示任务、耗时、实时 transcript 与 Steer/Stop 按钮，`/stop` 可达后台子代理并交回部分成果（*harness*）（v0.22.0，见上链接）
- **Bot Screen：人机接管点** — Linux gateway 的 bot 有独立桌面并经 Hermes Desktop 直播，遇登录/2FA/CAPTCHA 人接管完成再交还（*harness*）（v0.22.0，见上链接）
- **密码管理器登录（凭据对模型不可见）** — 浏览器 agent 可用 1Password / Bitwarden / 自带加密 vault 登录，模型从不看到密码，验证码不进入对话即填入（*harness*）（v0.22.0，见上链接）
- **Reasoning replay 默认化** — 对所有能读 reasoning 的 provider 默认重放先前 reasoning（跨 resume、分支、compaction）（*harness*）（v0.22.0，见上链接）

### 简评
v0.22.0 官方定位 "The Threshold Release"，rollup 并全文档化 v0.21.1 ～ v0.21.7 全部 patch（约 24,200 commit / 6,080 PR / 2,520 贡献者，体量约为 v0.21.0 周期的 2.5 倍），是本期四家中最大的单家事件。内核层（Connectors、live subagents、Bot Screen、单网关、密码管理器登录）的共同点是「把 agent 塞进更多宿主」——托管 SaaS、本机硬件、第三方桌面前端、多 profile；分发层（stable release channel、签名桌面包、统一包管理器 `hermes pm`）在四家中独树一帜。注意「单后端」是进行中的架构迁移而非一次性切换：v0.22.1 的 commit 序列显示 session authority / mutation receipts / durable outbox 仍在落地。

**结论**：值得观望 — 人机协同 + 部署面扩张方向重要、单家事件体量最大，但单网关迁移仍在进行中，Connectors / 本机模型等新能力的成熟度需看后续 patch 稳定。

## pi 1.2.0 / 1.3.0：工具依赖图与缓存保持

### 事实
- **`reachesTools`：工具声明可达工具集（1.2.0）** — 工具定义声明一次调用可能触达哪些工具（如 `codemode`、`tool_search`），MCP 扩展据此等待服务器就绪、判断替代工具能否触达；namespace 加 `aliases`（*harness*）（[1.2.0 · 2026-10-12](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#120---2026-10-12)）
- **Per-key OpenRouter 模型列表（1.2.0）** — 持 OpenRouter key 时只列该 key 可用模型，带该 key 的 context size / max output / 价格，列表离线缓存（*harness*）（1.2.0，见上锚点）
- **扩展事件生命周期收口（1.2.0）** — `before_agent_start` 对扩展 `triggerTurn` 触发的 run 同样触发，会话在 run 启动期计为 busy（*harness*）（1.2.0，见上锚点）
- **发布配置 schema（1.2.0）** — settings/models/keybindings/themes 发布 `$schema`，编辑器校验与补全（*harness*）（1.2.0，见上锚点）
- **Clean model switching（1.3.0）** — 切换模型时丢弃上一模型的 thinking 块，而非作为纯文本喂给新模型（*harness*）（[1.3.0 · 2026-10-15](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#130---2026-10-15)）
- **GPT-6 thinking 切换保缓存 + Kimi Code 协议迁移（1.3.0）** — OpenAI GPT-6 会话中改 thinking level 不再失效 prompt cache；`kimi-coding` 迁到 OpenAI Chat Completions，会话中加工具不再失效缓存（*harness*）（1.3.0，见上锚点）
- **Resumed sessions 保留活动工具（1.3.0）** — 恢复会话还原会话中激活的工具，`--tools +name/-name` 在其上叠加（*harness*）（1.3.0，见上锚点）

### 简评
pi 从「九连发冲 1.0」明确转入收敛期：12 天两版，1.2.0 体量明显小于上期 0.99.0 单版。主轴是两条收尾线：一是给 codemode/tool_search 的工具编排补上依赖语义（`reachesTools`、namespace `aliases`），让「MCP 何时就绪、替代工具能否触达」从猜测变声明；二是上下文经济学精细化——把 thinking 切换、模型切换、加工具从缓存失效源变成缓存保持点。Breaking 密度不低（schema 校验、`before_agent_start` union 化、实验性 server/client/plugin 栈移除），对扩展作者不友好的一面仍在。

**结论**：值得导入 — 开源 harness 升级即得，`reachesTools` 依赖图与缓存保持开箱可用；自写扩展注意 Breaking 变更。

## OpenAI Codex 0.163.0：抢占式执行循环默认化 + OSC 7501

### 事实
- **`instant_interrupt` 转默认 + Code Mode 中断默认（0.163.0）** — 响应进行中可发 follow-up 立即转向 Codex；打断一轮同时停掉活动 Code Mode cell 及其嵌套工具调用（*harness*）（[rust-v0.163.0 · 2026-10-16](https://github.com/openai/codex/releases/tag/rust-v0.163.0)）
- **并行只读工具执行（0.163.0）** — 并行跑独立的只读工具，含 skill、memory、conversation-history 查找（*harness*）（rust-v0.163.0，见上链接）
- **Daybreak 重新默认化（0.163.0）** — 上期收紧为 opt-in 的 Daybreak 对 eligible 账号默认开启，`codex exec` 可用 API key 在服务器放行时选择（*harness*）（rust-v0.163.0，见上链接）
- **OSC 7501 终端状态上报（0.163.0）** — 终端程序状态经 OSC 7501 上报（#52725），本期第三家落地（*harness*）（rust-v0.163.0，见上链接）
- **沙箱完整性校验（0.163.0）** — policy-based 文件内容完整性检查，Linux 走 bubblewrap、macOS 走 Seatbelt 后端，命令与文件系统操作前先跑完整性检查（*harness*）（rust-v0.163.0，见上链接）

### 简评
0.163.0 是本期 Codex 唯一新版本，但单版信息密度高：上期 opt-in 的 `instant_interrupt` 兑现默认化，并顺手把 Code Mode 中断默认化；并行只读工具把独立只读查找（skill/memory/history）从串行路径摘出并行化；Daybreak 在 0.161.0 收紧、0.163.0 又默认化，方向摆动说明该受限能力仍在试探，最终以「eligible 账号默认 + API key 经服务器放行」折中落地。OSC 7501 让 Codex 成为本期第三家接入终端状态协议，延续「一家定、各家跟」；安全线从路径隔离升级为内容完整性校验。

**结论**：值得导入 — 自动更新到位，执行循环响应性默认化、并行只读工具直接可用；Daybreak 默认范围按账号 eligible 折中落地。

## Claude Code 2.1.299 ～ 2.1.302：idle compaction 与 fork 子代理默认

### 事实
- **Idle compaction：缓存过期前主动压缩（2.1.299，2.1.302 可配置）** — 200K+ token 会话闲置约 54 分钟即在 1h prompt cache 过期前自动压缩；`CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS` 调阈值、`idleCompaction: false` 关闭（*harness*）（[2.1.299](https://github.com/anthropics/claude-code/commit/db93774d73)）
- **fork 子代理全通道默认 + 子代理后台化（2.1.302）** — `subagent_type: "fork"` 在 `claude -p`、Agent SDK、桌面与 VS Code 默认开启，桌面与 VS Code 主会话子代理默认后台运行（*harness*）（[2.1.302](https://github.com/anthropics/claude-code/commit/c017428c8c)）
- **`/advisor` 上 Claude Platform on AWS（2.1.300）** — 新增 `/advisor` 工具（`advisorModel`/`--advisor` 选型），默认不跑直到显式选择（*harness*）（[2.1.300](https://github.com/anthropics/claude-code/commit/94506ff0d3)）
- **Mods API 继续扩展（2.1.300 ～ 2.1.302）** — `$.ui.view({ agentId })` 显示指定代理 transcript、`prompt.change` hook、`agent.spawn` hook 可改写 workflow agent 的 prompt 与 model（*harness*）（2.1.300/2.1.301/2.1.302，见 2.1.300 链接）
- **OTEL GenAI 语义约定 + classifier 判决入 telemetry（2.1.300/2.1.301）** — trace span 加 `gen_ai.*` 属性；`tool_decision` 事件加 `classifier_verdict`、`permission_mode`、`classifier_category`（*harness*）（2.1.300/2.1.301，见 2.1.300 链接）
- **本地 transcript 记录 system prompt/tools/参数（2.1.300）** — 本地会话 transcript 记录每次 API 请求的 system prompt、工具与参数，分享的 transcript 可精确复现请求（*harness*）（2.1.300，见上链接）

### 简评
本期 Claude Code 进入「消化期」：四版 bug 修复密度为四家之最（2.1.299 单版约 150 条修复），mods 线从上期总纲收敛为定点扩展。真正的新能力面有三个：idle compaction（下版即加开关，已产品化而非实验）、fork 子代理全通道默认（执行模型收敛收官）、`/advisor`（企业云新工具）。可观测性成为隐线——OTEL GenAI 语义约定、classifier 判决入 telemetry、本地 transcript 可复现，共同指向「auto mode / 代理行为可审计」。

**结论**：值得导入 — 自动更新到位；idle compaction、fork 子代理默认直接受益，长会话用户可留意阈值配置开关。

## harness 插件化：官方插件目录同频上线

### 事实
- **anthropics/claude-plugins-official 本周 +3,581 星** — Anthropic 官方管理的 Claude Code 高质量插件目录，Apache-2.0、公司背书、总星 4.2 万；官方策展 + MCP/skills 分发标准（*潮流*）（[repo](https://github.com/anthropics/claude-plugins-official)）
- **cursor/plugins 本周 +1,536 星** — Cursor 插件规范与官方插件集；风险：无 LICENSE、总星 1.2 万偏小（*潮流*）（[repo](https://github.com/cursor/plugins)）

### 简评
两家头部 harness 的插件生态同周上榜——Anthropic 官方策展目录与 Cursor 插件规范，构成「harness 插件化」趋势，与 Claude Code 本期 mods API 的定点扩展同向，扩展能力从「加工具」走向「插件市场标准化」。共同点仍是锚定 MCP 作为能力分发 / 编排底座。风险集中在 cursor/plugins 无 LICENSE。

**结论**：值得观望 — 官方策展 + 分发标准信号明确，但生态供给刚起步、插件规范演进（协议能力、API 边界）待跟踪。

## agent 上下文工程（context-mode）

### 事实
- **mksglu/context-mode 本周 +4,438 星** — 面向 AI 编码 Agent 的上下文窗口优化层：沙箱化工具输出（宣称 98% 压缩）、持久化会话记忆、经 MCP + hooks 在 17 个平台间路由；风险：NOASSERTION（许可证不明）+ 单维护者（*潮流*）（[repo](https://github.com/mksglu/context-mode)）
- **上下文经济学成为各家共识主战场（harness 横向趋势）** — Claude Code idle compaction（缓存过期前自动压缩）、pi clean model switching + GPT-6/Kimi 缓存保持 + `serializeConversation` 省略 thinking、Codex 远程 V2 投机/异步 compaction 基础设施——「缓存、压缩、thinking 卫生」从被动应对升级为主动管理（*harness*）

### 简评
context-mode 直击 harness 上下文成本这一核心瓶颈，跨 Claude Code / Codex / Cursor / Pi 等 17 平台、属能力级基础设施；与各家本期缓存经济学（idle compaction、clean model switching、缓存保持）同窗共振，说明「上下文管理」已成共识主战场。风险是 NOASSERTION 许可证 + 单维护者，社区项目稳定性存疑。

**结论**：值得观望 — 方向重要、能力级，但许可证不明 + 单维护者，成熟度待验证；已提名监控名单。

## agent 驱动逆向工程（rea）

### 事实
- **morluto/rea 本周 +239,923 星** — 用 Agent 做逆向工程的一站式框架：从应用行为一路编排到原生二进制反编译/静态分析，编排 Claude Code / Codex / MCP / Ghidra / Hopper；总星 31.5 万、MIT、5 名核心贡献者，本周近乎指数级出圈（*潮流*）（[repo](https://github.com/morluto/rea)）

### 简评
rea 把逆向工程从「人工 + 脚本流」升级为「agent 驱动 RE」，架构级差异；本周 +24 万星是潮流线唯一的新能力外延类强信号。价值在它示范了 agent 编排可以整链路接管一个专业领域（逆向工程），而非只写代码。适用面收窄于逆向 / 安全工程，通用 agent 用户上手有门槛。

**结论**：值得观望 — 方向新、出圈快，但 agent 驱动 RE 的成熟度与适用场景需观察；已提名监控名单。

## System One 决策原生模型（论文线）

### 事实
- **Jeva: System One Models from First Principles**（新加坡国立大学 NUS · upvotes 415）— 决策原生 System One 架构，联合强制 null 感知、排列不变性、选项可扩展与跨请求缓存，单次前向直接输出结构化决策而非序列化文本（*论文*）（[paper](https://huggingface.co/papers/2610.18773)〔repo: LiQiiiii/Jeva ⭐93〕）
- **VideoJev**（南京大学 MCG · upvotes 364）— 视频观测直接转结构化决策（对时间区间与文本选项打分），复用缓存推理，视觉 agent 低延迟「边看边做决定」（*论文*）（[paper](https://huggingface.co/papers/2610.18615)〔repo: MCG-NJU/VideoJev ⭐162〕）
- **MJev-Spatial**（Mind Lab〔模型判读〕· upvotes 353）— 单次前向分类式决策统一空间推理，速度与精度超自回归 VLM；团队与 VideoJev 共享作者，判为南大系实验室出品（*论文*）（[paper](https://huggingface.co/papers/2610.22276)〔repo: Fr0zenCrane/MJev-Spatial ⭐10〕）

### 简评
三篇高赞论文把「做决定」从自回归文本生成里拆出来，改为单次前向直接输出结构化决策，充当 LLM「System Two」的快速行动层——本周 System One / 决策原生模型的开山之作，重塑 agent 的「行动层」。配套 JevAgentHarness、DecisionRobust 等佐证该范式正在进入 agent loop。研究前沿、无即用价值，但方向对 harness 行动层设计有长期牵引。

**结论**：值得观望 — 研究前沿、无即用价值；「决策原生行动层」若成立将改变 harness 的行动层设计，持续跟踪。

## computer-use 开源全栈 + 合成环境（论文线）

### 事实
- **OpenGCUA**（阿里 Tongyi-MAI · upvotes 316）— 开源通用 computer-use 全栈：视觉 + 程序化接口、harness-to-model 决策迁移、代码执行与跨设备 SDK，OSWorld-v2 提效（*论文*）（[paper](https://huggingface.co/papers/2610.22200)〔repo: Tongyi-MAI/OpenGCUA ⭐95〕）
- **Player-1**（腾讯 ARC Lab · upvotes 334）— 游戏轨迹 SFT + 合成环境（MineDojo-300/ViZDoom-10/GameWorld）RL，让 computer-use agent 学会持续键盘鼠标游戏操作（*论文*）（[paper](https://huggingface.co/papers/2610.20584)〔repo: TencentARC/Player-1 ⭐118〕）
- **MAI-Gym**（阿里 Tongyi-MAI · upvotes 154）— 统一 GUI agent 评测/数据采集/在线 RL 的开源平台，跨手机/电脑/网页环境，训出 9B 开源 SOTA agent（*论文*）（[paper](https://huggingface.co/papers/2610.20939)〔repo: Tongyi-MAI/MAI-Gym ⭐24〕）
- **SoftwareGym**（上海交大 SJTU · upvotes 113）— 自动合成多样可执行 GUI 应用，为 computer-use agent 提供规模化训练数据，提升 OOD 基准泛化（*论文*）（[paper](https://huggingface.co/papers/2610.12611)〔repo: MrKiing-Jin/SoftwareGym ⭐19〕）

### 简评
阿里 Tongyi-MAI 连出 OpenGCUA、MAI-Gym，腾讯出 Player-1，上交出 SoftwareGym——主线是把 harness、合成环境、在线 RL 打通，computer-use / GUI agent 训练走向开源全栈 + 合成环境规模化。开源栈（OpenGCUA / MAI-Gym）有即用价值，合成环境（Player-1 / SoftwareGym）是数据飞轮的关键一环。

**结论**：值得观望 — 研究前沿 + 开源基础设施；OpenGCUA / MAI-Gym 可直接试用，合成环境规模化方向持续跟踪。

## harness 递归自我改进 RSI（论文线）

### 事实
- **Harness^2: Recursive Agent Harnessing for an Open World**（Google · upvotes 110）— 递归 harness 自我改进（RSI），让 agent harness 在开放世界持续自我提升，模型与 harness 协同演进（*论文*）（[paper](https://huggingface.co/papers/2610.14224)〔repo: google-research/harness2 ⭐1444〕）——注：论文线标注「与潮流线可对上、多线点名」，但本期潮流线产物（榜单仅返回 10 条）未实际收录该仓库
- **Self-Evolving Agent Harness**（中关村学院 + 中科大 USTC〔项目页核出〕· upvotes 199）— 模型权重固定下，用反馈驱动修订 + 进化优化让 agent harness（提示/记忆/工作流/可执行组件）自演化，并给出 PAC 泛化界（*论文*）（[paper](https://huggingface.co/papers/2610.18813)〔repo: zgcagi/Harness-RSI ⭐173〕）

### 简评
两篇论文都在固定权重下让 harness（提示 / 记忆 / 工作流 / 可执行组件）自演化——Google 给递归 RSI 框架，中关村 / 中科大给 PAC 泛化界，正中本线追踪主题（harness 本体成为优化对象）。配合潮流线 harness 项目热，说明「模型外的脚手架」已被学界当作可优化资产而非固定基建。

**结论**：值得观望 — 研究前沿、无即用价值；harness 自演化若成立将改变 harness 的工程形态，与潮流线提名同题。

## agent 评测转向「最后一公里」（论文线）

### 事实
- **AgentSWE: Can Coding Agents Build the Agent You Actually Want?**（智源 BAAI + 中科院自动化所 + 人大〔项目页核出〕· upvotes 234）— 首个「agent 软件工程」基准：让 coding agent 按自然语言需求造 agent（创建/编辑/优化三阶段），在 held-out 用例上检验交付 agent 是否忠实于需求（*论文*）（[paper](https://huggingface.co/papers/2610.13361)〔repo: VectorSpaceLab/AgentSWE ⭐40〕）
- **Agent-Reflex: Teaching Language Agents to Act Reflectively**（人大 NLPIR · upvotes 210）— 反思技能发现 + 反思 SFT + on-policy 反思优化，教 agent 从 MCP 工具噪声反馈与用户纠错中反思并恢复，提升长程 tool-use（*论文*）（[paper](https://huggingface.co/papers/2610.17953)〔repo: RUC-NLPIR/Agent-Reflex ⭐230〕）
- **Scaling Agentic Data for Long-Horizon Terminal Intelligence**（阿里 · upvotes 162）— 重建缺失工作环境 + 渐进扩任务，自动化合成 long-horizon 终端 agent 数据，Qwen3.5-27B 在编码/生产/推理基准显著提升（*论文*）（[paper](https://huggingface.co/papers/2610.13166)〔未附 repo，project: zs1314.github.io/TerminalHorizon〕）

### 简评
评测侧整体转向「最后一公里」——AgentSWE 从「改 patch 得分」转向「交付的 agent 是否如你所愿」，Agent-Reflex 教 agent 从噪声反馈与用户纠错中反思恢复，阿里用合成数据规模化 long-horizon 终端智能。三者互补：评测（是否忠实需求）+ 能力（反思恢复）+ 数据（合成规模化）。

**结论**：值得观望 — 研究前沿、无即用价值；评测视角从 patch 转向「交付是否如你所愿」值得工程侧借鉴。

## 本周热门（潮流线）

- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) — 本周 +5,639 · 6.6 万 — 「写 HTML、渲染成视频」的声明式视频渲染框架（MCP 接入），HeyGen 公司背书、Apache-2.0；潮流线判为媒体方向、非 harness 架构级，不提名

## 本周论文（论文线）

本期论文线 12 篇全部并入选题（System One 决策原生 / computer-use 开源栈 / harness-RSI / 评测最后一公里四组），无未并入条目。

## harness 监控名单提名

潮流线候选区原样带过：

- **morluto/rea** — 提名进 harness-digest 监控名单：Agent 驱动逆向工程框架，本周 +24 万星，MCP/Claude Code/Codex 多底座，架构级新能力
- **mksglu/context-mode** — 提名进 harness-digest 监控名单：上下文优化 + 跨 17 平台 MCP 路由，直击 harness 成本瓶颈，能力级
- **anthropics/claude-plugins-official** — 提名进 harness-digest 监控名单：官方插件目录，harness 插件生态标准化信号
- **cursor/plugins** — 提名进 harness-digest 监控名单：插件规范，与 Claude 插件目录共同构成「harness 插件化」趋势（注意无 LICENSE）
- **heygen-com/hyperframes** — 不提名：agent 工具生态（MCP 视频渲染）但属媒体方向，非 harness 架构级

一句话建议：rea / context-mode 分别对应本期「能力外延」与「上下文经济学」主线，claude-plugins-official / cursor/plugins 对应「插件化」趋势，均建议采纳；cursor/plugins 采纳时标注无 LICENSE 风险，hyperframes 维持不提名。采纳与否由人改 harness-digest 的监控表。
