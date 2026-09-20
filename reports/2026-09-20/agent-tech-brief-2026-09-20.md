# Agent 技术周报 · 2026-09-20（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [2026-09-11, 2026-09-20] · 论文线 [2026-09-12, 2026-09-18] · 产物：agent-harness-brief-2026-09-20.md、trending-2026-09-20.md、papers-2026-09-20.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| Claude Code 八版连发 | 权限分类器定局服务端 + MCP v2 + AGENTS.md + 账号级技能同步，潮流线同周在榜（双线点名） | 值得导入 |
| pi 0.86.0 缓存经济整包 | cache warming、按模型压缩预算、改指令不丢缓存，长会话成本主线一版打包 | 值得导入 |
| Skills/插件生态工程化 | agent-skills 97k 星 + Anthropic/OpenAI 官方插件双入口同榜，Claude Code 同步开账号级技能（双线共振） | 值得导入 |
| Codex 0.155 | /voice 语音进实验通道 + Touch ID 硬件级验证 MCP 请求，交互与验证两端加码 | 值得观望 |
| 并行 agent 基建成形 | orca（agent 舰队 ADE）新上榜 + worktrunk 翻倍，与 Codex agents overview 同向（双线共振） | 值得观望 |
| open-code-review 混合架构登顶 | 阿里"确定性规则 + LLM Agent"代码评审工具周增 7 倍（+15,028）登顶全榜 | 值得观望 |
| RSI 递归自我改进谱系化 | 五篇论文从基座到 harness 层连发，Atria Dawn 414 票领衔 | 值得观望 |
| Harness 组件级实证 | Zoom × 清华 4 模型 × 176 组设置消融 planning/动作空间/上下文管理 | 值得观望 |
| Hermes v0.21.3 rollup | 338-PR 打包修复版，能力级内容第三次欠到 v0.22.0 curated notes | 仅记录 |

**本期大盘**：四家 harness 在连续两期空窗后同窗集中释放，主线收敛于缓存经济（长会话不重算）与权限安全执行（硬件级/架构级/语义级各择一路）；潮流线 skills 单品整体退潮，混合架构代码评审与并行 agent 基建接棒；论文线 RSI 谱系化爆发，harness 本身从工程博客进入论文议程。

## Claude Code 2.1.271～278：权限执行定局 + 生态兼容

### 事实
- **auto mode 权限分类器默认转服务端** — API / Enterprise / Bedrock / Vertex / Foundry / 网关会话默认用服务端分类器，不收分类器开销费，本地/服务端往返后定局（*harness*）（[2.1.278 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212178)）
- **MCP 栈升至 v2 client + MCP 2026-07-28 协商** — 全部安装渠道统一到新一代 MCP 客户端，`MCP_SDK_GENERATION=v1` 可退回（*harness*）（[2.1.274 · 2026-09-17](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212174)）
- **账号级 skills / plugins 同步进终端** — claude.ai 账号上启用的技能与插件同步到该账号登录的终端会话（*harness*）（[2.1.275 · 2026-09-18](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212175)）
- **AGENTS.md 支持** — 项目无 CLAUDE.md 时改读 AGENTS.md，`/config` 可切换（*harness*）（[2.1.277 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212177)）
- **子代理输出防注入标记** — 子代理结果以带 header 的缩进块送达，其文本无法伪装成会话自身指令（*harness*）（[2.1.277](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212177)）
- **auto mode 沙箱按命令域名审查** — Bash / PowerShell / Monitor 逐命令放行所需域名、其余拒绝，网络边界从会话级细化到命令级（*harness*）（[2.1.271 · 2026-09-15](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212171)）
- **anthropics/claude-code 本周 +1,999 星在榜** — 146.8k 总星，harness 线监控对象同周被潮流线点名（*潮流*）（[repo](https://github.com/anthropics/claude-code)）

### 简评
五天八版（2.1.271～2.1.278，09-15～09-19，含 2.1.272 纯修复与 2.1.276 单条 hotfix），流水密度为 9 月之最，此前担心的权限改动波纹已出清。两条主线清晰：权限执行（分类器定局服务端 + 命令级域名审查 + 子代理输出信任边界 + 插件供应链收紧）与生态兼容（v2 MCP、AGENTS.md、账号级技能同步）。双线点名（简报展开 + 周榜在榜）确认其热度，且全部改动随自动更新到位，AGENTS.md 与账号级技能同步对多工具混用场景即开即用。

**结论**：值得导入 — 成熟产品、更新自动到位；AGENTS.md、MCP v2、账号级技能同步都是零成本获得的能力增量。

## pi 0.86.0：缓存经济整包

### 事实
- **Prompt cache warming** — 工具长运行与空闲期间用成本感知的刷新保活高价 prompt 缓存，带可配模式与 `/session` 诊断（*harness*）（[0.86.0 · 2026-09-19](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0860---2026-09-19)）
- **Per-model compaction 预算** — `compaction.modelOverrides` 按模型配置 `reserveTokens` / `keepRecentTokens`，压缩策略从全局单一升级为按模型粒度（*harness*）（[#8133](https://github.com/earendil-works/pi-mono/issues/8133) · 0.86.0）
- **Transcript-aware 指令与工具更新** — 会话中途变更 system prompt / 工具定义后跨 resume 与分支保留，同时保住已缓存前缀（*harness*）（[#9548](https://github.com/earendil-works/pi/pull/9548) · 0.86.0）
- **`user_bash` fail-closed（Breaking）** — 错误或无效 defined 结果直接中止命令，安全语义收紧（*harness*）（[#9068](https://github.com/earendil-works/pi/issues/9068) · 0.86.0）
- **`/bug` 遥测报告系统** — 脱敏诊断、可选转录上传 Radius，崩溃持久化并在下次启动播报（*harness*）（0.86.0，见上 changelog 锚点）

### 简评
15 天憋出的整包，把上期预告的 Unreleased 区全部带出，四条能力（cache warming、按模型压缩预算、transcript-aware 更新、`/bug`）全部围绕"长会话下保住缓存前缀、压低重算成本"展开，是本期"缓存经济"主线里最系统的一版。开源 harness 升级即得，长会话与分支导航多的用法成本结构直接受益。

**结论**：值得导入 — 开源、升级成本低，缓存保温与按模型压缩对长会话成本是直接改善。

## Skills / 插件生态：工程化 + 官方双入口

### 事实
- **addyosmani/agent-skills 本周 +3,445 星** — Addy Osmani 出品的生产级工程 skills 库，97.1k 总星、fork 10.2k，MIT〔新建 created 2026-02-15〕（*潮流*）（[repo](https://github.com/addyosmani/agent-skills)）
- **anthropics/knowledge-work-plugins 本周 +1,034 星新上榜** — Anthropic 官方知识工作者插件库，面向 Claude Cowork，25.2k 总星（*潮流*）（[repo](https://github.com/anthropics/knowledge-work-plugins)）
- **openai/plugins 本周 +522 星续榜退潮** — OpenAI 官方插件仓库，上期 +1,181，7k 总星（*潮流*）（[repo](https://github.com/openai/plugins)）
- **Claude Code 账号级 skills 同步（2.1.275）** — 技能系统从单机配置升级为账号级跨端能力面，与潮流线 skills 生态同向（*harness*）（[2.1.275 · 2026-09-18](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212175)）

### 简评
双线共振的一个选题：harness 线显示 Claude Code 把技能做成账号级跨端同步，潮流线同周给出 skills 生态的三个信号——生产级工程 skills 库（agent-skills，97k 星量级）与两大厂官方插件入口（Anthropic 新上榜、OpenAI 续榜）同榜。对比上期 skills 单品扎堆、本期单品退潮（见热门榜），生态重心正从"玩法单品"移向"工程化库 + 官方分发"。

**结论**：值得导入 — agent-skills 即拿即用（MIT，挑需要的 skill 放进自己的 agent 即可）；官方双入口当能力面风向标持续跟踪。

## OpenAI Codex 0.155：语音交互 + 硬件级验证

### 事实
- **实验性 `/voice` 语音对话** — 经 `/experimental` 开启 WebRTC 实时语音：直播转录、麦克风控制条、可配置静音快捷键，四家 harness 中首个进官方实验通道的实时语音（*harness*）（[rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)）
- **Touch ID 验证 MCP 请求** — macOS 上经 Secure Enclave 签名，本地 TUI 会话的 MCP 请求需生物识别确认（*harness*）（rust-v0.155.0，#43624 / #43547 / #43568）
- **daemon 更新调度可配置** — 显式更新命令 + 可配置自动更新时刻，saved threads 与 active goals 重启后恢复（*harness*）（rust-v0.155.0，#43542 / #43562 / #44314）
- **agents overview 任务管理** — 任务隐藏 / 归档 / 删除，worktree 所有权详情与受管 worktree 确认删除，从"只能看"到"能治理"（*harness*）（rust-v0.155.0，#43942 / #44424 / #44433）

### 简评
上期预告的 0.155 稳定版如期落地，0.155.1 次日跟进单条修复。`/voice` 与 Touch ID 分押"交互通道"和"权限验证"两端，agents overview 的 worktree 治理则与潮流线的并行 agent 基建同向（见下题）。但 `/voice` 仍锁在实验开关后，Touch ID 限 macOS + 本地 TUI，方向信号强于即用价值；alpha 线已跑到 0.156.0-alpha.9，下期稳定版概率高。

**结论**：值得观望 — 能力面扩得快，但两条主打都偏实验 / 平台限定，等 0.156 与 `/voice` 转正再看。

## 并行 agent 基建成形：orca / worktrunk / firstmate

### 事实
- **stablyai/orca 本周 +5,404 星** — 面向 parallel agent fleet 的 ADE（Agent Development Environment），用自有订阅跑任意 coding agent，桌面 / 移动 / 远程三端，72.7k 总星，MIT〔新建 created 2026-03-17〕（*潮流*）（[repo](https://github.com/stablyai/orca)）
- **max-sixty/worktrunk 本周 +1,141 星（环比 ×1.9）** — 为并行 AI agent 工作流设计的 Git worktree 管理 CLI（Rust），8.1k 总星（*潮流*）（[repo](https://github.com/max-sixty/worktrunk)）
- **kunchenguid/firstmate 本周 +1,073 星** — "对话一个 agent，带一支 crew 干活"的多 agent 编排，6.8k 星挂 1,628 open issues，维护过载未缓解（*潮流*）（[repo](https://github.com/kunchenguid/firstmate)）
- **Codex agents overview 任务治理（0.155.0）** — 并行代理任务管理从"只能看"进到"能治理"，与潮流线并行基建同向（*harness*）（[rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)）

### 简评
潮流线本期的结构性换血之一：skill 单品退潮后，接棒的是 multi-agent 并行的外围工具层——fleet 管理（orca）、worktree 工程（worktrunk）、crew 编排（firstmate）同向共振，且与 harness 线 Codex 的 agents overview / worktree 治理呼应，说明"并行开发的外围工具层"正在成形而非单点热度。成熟度参差：orca 72.7k 星但 6,281 open issues，firstmate 维护过载是老问题，worktrunk 体量小但翻倍中、方向最具体。

**结论**：值得观望 — 品类成形是明确信号，但单体成熟度都未过线；worktree 管理思路可直接借鉴进自有工作流。

## alibaba/open-code-review：混合架构代码评审登顶

### 事实
- **本周 +15,028 星登顶全榜** — 较上期（+2,213）爆发 7 倍，37.7k 总星、fork 2.7k，Apache-2.0〔新建 created 2026-05-18〕（*潮流*）（[repo](https://github.com/alibaba/open-code-review)）
- **确定性管线 + LLM Agent 混合架构** — 内置 NPE / 线程安全 / XSS / SQL 注入多语言规则集，兼容 OpenAI / Anthropic（*潮流*）（[repo](https://github.com/alibaba/open-code-review)）

### 简评
本期全榜最大爆点：企业级"确定性规则 + LLM Agent"混合架构在 code review 垂直打出规模样本，四个月冲到 37.7k 星。它的信号价值在于给"混合架构"叙事提供了一个可拆解的参照物——规则层管确定性缺陷、agent 层管语义评审。爆发期项目成色待校准，潮流线也仅提名低优先监控。

**结论**：值得观望 — Apache-2.0、接入成本低，可小范围试用；但 7 倍周增属爆发期，观察其 agent 层架构迭代再定成色。

## RSI 递归自我改进：谱系化爆发（论文线）

### 事实
- **Atria Dawn: The Dawn of Agentic Superintelligence** — 面向科研与工程工作流的 agentic 基座模型，核心是 Verifiable Experience Pipeline：工具交互接入可执行环境、以外部可验证结果为奖励，16 个基准对标前沿 agent（*论文*）（InternLM·上海AI实验室 · upvotes 414 · [paper](https://huggingface.co/papers/2609.15818)〔repo: atria-asi/Atria-Dawn-Preview ⭐506〕）
- **Dream-RSI: Recursive Self-Improvement through Evolving Worlds** — 世界模型"做梦"式 rollout 演化探索策略，解固定策略无法随搜索空间扩展的难题（*论文*）（Google · upvotes 235 · [paper](https://huggingface.co/papers/2609.14858)〔repo: zhengkid/Dream-RSI ⭐863〕）
- **ModularRSI: Modular and Generalizable Recursive Harness Self-Improvement** — harness 递归自改进模块化：区分可复用改进与 benchmark 特化适配，提升改动跨任务迁移（*论文*）（〔模型判读〕CMU 等高校团队 · upvotes 189 · [paper](https://huggingface.co/papers/2609.14857)〔repo: IQuestLab/ModularRSI ⭐37〕）
- **SoL-Pi: Recursively Scaling Auto-Research Loops for Efficient Agent Harness** — 把 auto-research 循环递归扩展到更多样环境做 harness rollout，筛出四个可跨环境复用的改进机制（*论文*）（NVIDIA · upvotes 88 · [paper](https://huggingface.co/papers/2609.20519)〔repo: NVlabs/SoL-Pi ⭐2421〕）
- **RSIAgent: Autonomous Exploration for Recursive Self-improvement in New Environments** — 免训练三 agent 协作（curriculum/actor/verifier）对新环境递归自探索，因果关系沉淀为可复用记忆（*论文*）（〔模型判读〕NUS（Biwei Huang 团队）· upvotes 78 · [paper](https://huggingface.co/papers/2609.15364)〔repo: AetherLabsAI/RSIAgent ⭐356〕）

### 简评
本周论文最强主线：RSI 从基座层（Atria Dawn 可验证经验管线）到世界模型探索（Dream-RSI）、harness 层模块化/规模化（ModularRSI、SoL-Pi）、再到免训练环境自适应（RSIAgent）覆盖训练与推理两端，谱系在一个窗口内成形。开源联动强（SoL-Pi ⭐2421、Dream-RSI ⭐863），但五篇 repo 均未进本期 GitHub 周榜，无跨线对撞。落地节奏尚早，作为方向跟踪。

**结论**：值得观望 — 方向重要性高、谱系刚成形；SoL-Pi / ModularRSI 与 harness 迭代直接同题，repo 值得盯。

## Harness 组件级实证：176 组消融（论文线）

### 事实
- **An Empirical Study of Harness Design for Coding Agents** — 固定执行循环，消融 planning、动作空间、上下文管理三组件，4 个模型 × 176 组设置跑 SWE-Bench Verified 与 Terminal-Bench 2.1（*论文*）（〔模型判读〕Zoom AI × 清华 THUNLP 等 · upvotes 69 · [paper](https://huggingface.co/papers/2609.20804)〔repo 未附〕）

### 简评
"harness 即研究对象"从工程博客进入论文议程的直接证据：把 coding harness 拆到组件级做对照实验，正对本仓库追踪线的核心问题。对自研/自配 harness 的人，它的组件清单与消融方法可直接对照自查（planning 加不加、动作空间放多宽、上下文怎么管），是本周最"即读即用"的一篇论文。

**结论**：值得观望 — 结论可即刻对照自有 harness 设计参考，但单一论文、无 repo，看后续复现与引用再升级。

## Hermes Agent v0.21.3：338-PR rollup 与 v0.22.0 欠账

### 事实
- **v2026.9.14（v0.21.3）rollup patch** — 主体两条修复（远程网关 refresh token 并发轮换竞态、state.db 写句柄泄漏），tag 内含 338 个合并 PR、1,036 个非合并 commit（*harness*）（[v2026.9.14 · 2026-09-15](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.14)）
- **curated notes 第三次跳票至 v0.22.0** — JSON-RPC 线契约、Agent Sessions API、MCP OAuth 绑定签发方等能力级内容连跨两个 tag 未文档化（*harness*）（[Releases](https://github.com/NousResearch/hermes-agent/releases)）

### 简评
发布节奏加快（tag 间隔缩到 3 天）但全是修复级内容，真正的能力项（server→client JSON-RPC、Pydantic 契约注册表、Agent Sessions API）被官方压到 v0.22.0 curated notes，欠账已连跨两个 tag。下期窗口（覆盖至 09-29 前后）大概率命中，届时将是内容量最大的一期。

**结论**：仅记录 — 本体无可采用内容，等 v0.22.0 curated notes 落地再展开。

## 本周热门（潮流线）

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 本周 +6,265 · 263k — agent harness 性能优化系统（skills/instincts/memory/安全，跨 Claude Code / Codex 等四家）；单人仓库扛 263k 星，bus factor 风险
- [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — 本周 +5,589（上期 +16,740，-67%）· 48.8k — 驯服 agent 输出风格的 skill，上期全榜第一退潮中
- [Tencent/WeKnora](https://github.com/Tencent/WeKnora) — 本周 +4,867（环比 ×3.7）· 27.5k — 文档→RAG→自主推理 agent→自维护 Wiki 的知识平台
- [blader/humanizer](https://github.com/blader/humanizer) — 本周 +3,024（上期 +3,673）· 50.3k — 去 AI 写作痕迹 skill，品类热度持平微退
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) — 本周 +3,914 · 83.5k ·〔新建 created 2026-02-24〕— 给 agent 装互联网读取通道的 CLI（Twitter / Reddit / YouTube / B 站 / 小红书），零 API 费
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) — 本周 +2,498（上期 +5,146，-51%）— 写 HTML 渲染视频（built for agents），退潮中
- [mksglu/context-mode](https://github.com/mksglu/context-mode) — 本周 +1,359（上期 +2,102）· 23.7k — 工具输出沙箱化 + 会话记忆持久化 + 17 平台路由

## 本周论文（论文线）

- Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work — 〔模型判读〕UIUC（Wenhui Chen 团队）· upvotes 91 — 基于 Qwen3.6-35B-A3B 的低成本 co-work agent 模型，分阶段后训练主打能力-成本 Pareto 前沿 · [paper](https://huggingface.co/papers/2609.11977)〔repo: Accio-Lab/occamy ⭐59〕
- Confidence Comes from Experience: Experiential Confidence Estimation from Reasoning to Agents — University of Cambridge · upvotes 56 — XConf 置信度估计结合历史评分 episode 的经验记录，从推理推广到 agent 输出可信校准 · [paper](https://huggingface.co/papers/2609.17708)〔repo: caiqizh/xconf ⭐2〕
- ProgramDistill: From Interactive Web Apps to Verifiable Reference-Guided SWE Tasks — Microsoft Research · upvotes 49 — 从 26 个可交互参考应用蒸馏出 4,063 个可回放验证的 SWE 任务，考 agent"从能跑的软件反推行为再实现" · [paper](https://huggingface.co/papers/2609.18805)

## harness 监控名单提名

潮流线候选区原样带过：

- **stablyai/orca** — 提名进 harness-digest 监控名单：把 parallel agent fleet 管理 + 自有订阅复用做成 ADE 品类，正对 Codex agents overview、worktree 治理同一架构方向，公司背书且 pushed 活跃。
- **addyosmani/agent-skills** — 提名进 harness-digest 监控名单：生产级工程 skills 的头部候选，头部工程师维护、97k 星 10k fork，其目录变更即 skills 生态工程化风向。
- **anthropics/knowledge-work-plugins** — 提名进 harness-digest 监控名单：Anthropic 官方 Cowork 插件入口，与已监控的 openai/skills 对位，是 Claude 侧能力面变更的官方渠道。
- **alibaba/open-code-review** — 提名进 harness-digest 监控名单（低优先）：7 倍周增登顶全榜的混合架构（确定性管线 + LLM Agent）样本，观察其 agent 层架构迭代即可校准"混合架构"叙事的成色。
- **Panniantong/Agent-Reach** — 暂不提名：属 agent 工具生态（感知通道）而非 harness 架构线，体量大但方向偏应用，留档观察。
- **max-sixty/worktrunk** — 暂不提名：方向相关但体量尚小（8.1k），连续两期上榜且翻倍中，再涨一期即提名。

一句话建议：三项正式提名（orca / agent-skills / knowledge-work-plugins）与本期双线共振方向一致，建议采纳；open-code-review 先按低优先挂观察位；worktrunk 下期复看星增即可，是否采纳由人改 harness-digest 的监控表。
