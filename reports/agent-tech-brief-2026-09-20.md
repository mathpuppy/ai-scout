# Agent 技术周报 · 2026-09-20

> 窗口：GitHub 官方周榜（抓取 2026-09-20）· harness 线 [09-11, 09-20] · 产物：agent-harness-brief-2026-09-20.md / trending-2026-09-20.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| pi 0.86.0：缓存经济整包 | 15 天憋出的整包：缓存保温、按模型压缩预算、指令演化进会话转录 | 值得导入 |
| Claude Code 2.1.271～278 八版连发 | 权限分类器定局服务端 + v2 MCP + AGENTS.md + 账号级技能同步 | 值得导入 |
| alibaba/open-code-review 周榜登顶 | 确定性规则 + LLM Agent 的代码评审工具，周增 ×7 爆发登顶 | 值得导入 |
| Codex 0.155：语音交互 + 硬件级验证 | 首个进官方实验通道的实时语音 /voice，Touch ID 验证 MCP 请求 | 值得观望 |
| 并行 agent 基建层成形 | orca（agent fleet ADE）+ worktrunk（worktree CLI）+ firstmate 同向共振 | 值得观望 |
| skills 生态换血 | 内容单品集体退潮，工程化 skills 库与两大厂官方插件入口接棒 | 值得观望 |
| ECC 热度延续 | 跨 harness 性能优化层周增 +6,265，但单人仓库扛 263k 星 | 值得观望 |
| Hermes v0.21.3 rollup | 338-PR 修复级打包，能力级内容连欠两个 tag 推给 v0.22.0 | 仅记录 |
| Panniantong/Agent-Reach | CLI 让 agent 零 API 费读/搜多平台，应用层感知通道 | 仅记录 |
| Tencent/WeKnora | 文档→RAG→agent→Wiki 知识平台，周增 ×3.7 走量 | 仅记录 |

**本期大盘**：连续两期空窗后四家 harness 同窗集中释放，主线收敛于「长会话不重算」的缓存经济与层层加码的权限安全执行；潮流线同步大换血——skills 内容单品退潮，接棒的是混合架构代码评审与并行 agent 基建，两条线在「多 agent 并行」方向首次明显共振。

## pi 0.86.0：缓存经济整包
### 事实
- **Prompt cache warming** — 工具长运行与可选空闲期间，用成本感知的刷新保活高价 prompt 缓存；可配模式、模型缓存寿命元数据、`/session` 诊断与 `cache_warming_decision` 扩展事件（*harness*）（[0.86.0 · 2026-09-19](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0860---2026-09-19)）
- **Per-model compaction 预算** — `compaction.modelOverrides` 按模型配置 `reserveTokens` / `keepRecentTokens`，普通压缩设置作回退（*harness*）（[#8133](https://github.com/earendil-works/pi-mono/issues/8133) · 0.86.0）
- **Transcript-aware 指令与工具更新** — 会话中途变更 system prompt / 工具定义后，跨 resume 与分支导航保留，同时保住已缓存前缀（`before_agent_start` 钩子 + 会话格式新条目类型）（*harness*）（[#9548](https://github.com/earendil-works/pi/pull/9548) · 0.86.0）
- **`/bug` 遥测 + `user_bash` fail-closed（Breaking）** — 脱敏诊断、可选转录或模型自写摘要上传 Radius，崩溃持久化并于下次启动播报；defined 结果错误或无效直接中止命令，不再执行本地后续 handler（*harness*）（0.86.0，见上 changelog 锚点 / [#9068](https://github.com/earendil-works/pi/issues/9068)）

### 简评
0.85.1 → 0.86.0 间隔 15 天（0.85 线以来最长），一次带出上期预告的全部整包：缓存保温、按模型压缩预算、指令演化成为会话转录的一等公民，全部围绕"长会话下保住缓存前缀、压低重算成本"。对长会话、多模型混用场景是直接的成本与上下文管理收益，升级即得；自写扩展需注意两处 Breaking（`user_bash` fail-closed、`TranscriptContext` 流输入改造）。

**结论**：值得导入 — 稳定版整包，升级即用，成本收益直接，仅 Breaking 项需自查扩展。

## Claude Code 2.1.271～278：八版连发
### 事实
- **auto mode 权限分类器默认服务端** — API / Enterprise / Bedrock / Vertex / Foundry / 网关会话默认用服务端分类器（不收分类器开销费）；2.1.273 曾短暂切回本地，2.1.278 定局（*harness*）（[2.1.278 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212178)）
- **MCP 栈升至 v2 client + MCP 2026-07-28 协商** — 全部安装渠道统一到新一代 MCP 客户端，`MCP_SDK_GENERATION=v1` 可退回（*harness*）（[2.1.274 · 2026-09-17](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212174)）
- **AGENTS.md 支持 + 账号级 skills / plugins 同步** — 项目无 CLAUDE.md 时改读 AGENTS.md（`/config` 可切换）；claude.ai 账号启用的技能与插件同步到终端会话（*harness*）（[2.1.277 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212177) / [2.1.275 · 2026-09-18](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212175)）
- **子代理输出防注入 + 命令级域名审查** — 子代理结果以带 header 的缩进块送达、文本无法伪装成会话自身指令；auto mode 沙箱逐命令审查放行所需域名，其余拒绝（*harness*）（2.1.277，见上锚点 / [2.1.271 · 2026-09-15](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212171)）
- **周榜在榜** — 本周 +1,999 星，总星 146.8k（*潮流*）（[repo](https://github.com/anthropics/claude-code)）

### 简评
八版连发为 9 月密度之最，两条主线清晰：权限执行定局（分类器服务端化 + 命令级域名审查 + 子代理输出信任边界）与生态兼容（AGENTS.md、v2 MCP、账号级技能同步）。全部随自动更新落地，AGENTS.md 让项目指令文件向跨工具行业标准再进一步；上期关注的权限回归波纹已出清。

**结论**：值得导入 — 自动更新即得，AGENTS.md 与 v2 MCP 对多工具 / MCP 用户是即时收益。

## alibaba/open-code-review：周榜登顶
### 事实
- **周增 ×7 登顶全榜** — 本周 +15,028 星（上期 +2,213），总星 37.7k，Apache-2.0，fork 2.7k，created 2026-05-18〔新建〕（*潮流*）（[repo](https://github.com/alibaba/open-code-review)）
- **混合架构定位** — 确定性管线 + LLM Agent 混合架构的代码评审工具，内置 NPE / 线程安全 / XSS / SQL 注入多语言规则集，兼容 OpenAI / Anthropic（*潮流*）

### 简评
确定性规则打底、LLM Agent 补语义的混合架构，在企业代码评审这个垂直场景打出了规模样本；规则集成型、兼容主流模型，接入试用的成本低。项目 5 月才新建、热度本周才爆发，成熟度未经时间检验，建议先在一两个仓库跑评审对比现有流程，合适再进 CI。

**结论**：值得导入 — 垂直场景直接可用、试用成本低；热度刚爆发，先小范围验证再定去留。

## Codex 0.155：语音交互 + 硬件级验证
### 事实
- **实验性 `/voice` 语音对话** — 经 `/experimental` 开启 WebRTC 实时语音：直播转录、麦克风控制条、可配置静音快捷键；四家 harness 中首个进官方实验通道的实时语音交互（*harness*）（[rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)）
- **Touch ID 验证 MCP 请求** — macOS 上经 Secure Enclave 签名，本地 TUI 会话的 MCP 请求需生物识别确认（*harness*）（rust-v0.155.0，#43624 / #43547 / #43568）
- **daemon 更新调度 + agents overview 治理** — 显式更新命令与可配置自动更新时刻，重启后恢复 saved threads / active goals；任务可隐藏 / 归档 / 删除，worktree 所有权详情与受管 worktree 确认删除（*harness*）（rust-v0.155.0，#43542 / #43562 / #44314 / #43942 / #44424 / #44433）
- **版本节奏** — 0.155.0（09-18）+ 0.155.1（09-19 单条修复）；0.156 线 alpha 已至 [alpha.9](https://github.com/openai/codex/releases/tag/rust-v0.156.0-alpha.9)（本地 09-20），0.156 稳定版下期窗口落地概率高（*harness*）（[Releases](https://github.com/openai/codex/releases)）

### 简评
0.155 在"交互通道 + 权限验证"两端同时加码：/voice 把 harness 从文本 TUI 扩到实时语音，Touch ID 把 MCP 权限验证抬到硬件级，daemon 生命周期与并行任务治理也在成型。但语音仍在实验开关后面、Touch ID 限 macOS，能力面虽新、适用面未明，随升级附带体验即可。

**结论**：值得观望 — 亮点能力在实验开关与平台限定之后，等稳定开放与跨平台落地再评估。

## 并行 agent 基建层成形
### 事实
- **stablyai/orca** — 本周 +5,404 星〔新建 created 2026-03-17〕；面向 parallel agent fleet 的 ADE（Agent Development Environment），用自有订阅跑任意 coding agent，桌面 / 移动 / 远程三端；72.7k 总星，MIT，6,281 open issues（*潮流*）（[repo](https://github.com/stablyai/orca)）
- **max-sixty/worktrunk** — 本周 +1,141 星（上期 +588，环比 ×1.9）；为并行 AI agent 工作流设计的 Git worktree 管理 CLI（Rust）；8.1k 总星（*潮流*）（[repo](https://github.com/max-sixty/worktrunk)）
- **kunchenguid/firstmate** — 本周 +1,073 星（上期 +778）；"对话一个 agent，带一支 crew 干活"的多 agent 编排；6.8k 星挂 1,628 open issues，维护过载未缓解（*潮流*）（[repo](https://github.com/kunchenguid/firstmate)）

### 简评
运行环境、worktree 管理、crew 编排逐块补齐，"多个 agent 并行干活"的外围工具层正在成形，与 Codex 本期 agents overview 的任务治理、worktree 所有权管理是同一架构方向（两线共振）。但品类刚起步：orca 六千多 open issues、worktrunk 体量小且 license 非标、firstmate 维护过载，选型言之尚早。

**结论**：值得观望 — 方向与 harness 并行化共振明确，工具成熟度参差，保持关注。

## skills 生态换血：工程化 + 官方分发接棒
### 事实
- **addyosmani/agent-skills** — 本周 +3,445 星〔新建 created 2026-02-15〕；Addy Osmani 出品的生产级工程 skills 库；97.1k 总星，MIT，fork 10.2k（*潮流*）（[repo](https://github.com/addyosmani/agent-skills)）
- **anthropics/knowledge-work-plugins** — 本周 +1,034 星；Anthropic 官方知识工作者插件库，面向 Claude Cowork；25.2k 总星（*潮流*）（[repo](https://github.com/anthropics/knowledge-work-plugins)）
- **openai/plugins 续榜退潮** — 本周 +522 星（上期 +1,181）；官方插件仓库，7k 总星，无 license（*潮流*）（[repo](https://github.com/openai/plugins)）
- **i-have-adhd 退潮** — 上期全榜第一，本周 +5,589 星环比 -67%（48.8k 总星）；skills 单品整体退潮——humanizer 微退、hyperframes -51%，archify / ponytail / superpowers / spec-kit 等上期常客全部掉榜（*潮流*）（[repo](https://github.com/ayghri/i-have-adhd)）

### 简评
"skill 即内容"被验证为短周期热度：内容型单品集体退潮，接棒的是生产级工程 skills 库与官方分发双入口（knowledge-work-plugins 新上榜与 openai/plugins 续榜对读，两大厂都把 skills / plugins 当 harness 能力面的官方出口经营）。工程库可直接挂载试用，官方入口则是能力面变更的风向标。

**结论**：值得观望 — 生态位切换进行中：工程库可顺手试，官方入口值得盯。

## ECC：热度延续，风险未解
### 事实
- **affaan-m/ECC** — 本周 +6,265 星（上期 +7,264）；跨 Claude Code / Codex / Opencode / Cursor 的 agent harness 性能优化系统（skills、instincts、memory、安全、research-first）；263k 总星，MIT，fork 39.4k〔created 2026-01-18〕；风险：单人仓库扛 263k 星，bus factor 极低（*潮流*）（[repo](https://github.com/affaan-m/ECC)）

### 简评
跨 harness 的性能优化层连续两期高热（上期已提名 L2），说明这类"外挂式增强"有真实需求。但单人维护扛 263k 星，可持续性是最大问号；作为优化思路与参考实现有价值，深度依赖需谨慎。

**结论**：值得观望 — 方向与热度都够，维护风险未解，先看能不能长出团队化维护。

## Hermes Agent v0.21.3：338-PR rollup
### 事实
- **v2026.9.14（v0.21.3）修复级 rollup** — 窗口内含 338 个合并 PR、1,036 个非合并 commit（+131,690 行），主体两条修复：远程网关 refresh token 并发轮换竞态、长生命周期进程 state.db 写句柄泄漏；能力级内容（JSON-RPC 线契约、Agent Sessions API、MCP OAuth 绑定签发方等）官方留待 v0.22.0 curated notes，已连欠 v0.21.2 / v0.21.3 两个 tag（*harness*）（[v2026.9.14 · 2026-09-15](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.14)）

### 简评
tag 节奏加快（间隔缩至 3 天）但本期无核心更新，真正的能力级欠账全部押在 v0.22.0——一旦落地将是内容量最大的一期，下期窗口（覆盖至 09-29 前后）大概率命中。本期无采用动作。

**结论**：仅记录 — patch 级修复，信息价值在 v0.22.0 curated notes 的兑现预期。

## Panniantong/Agent-Reach：agent 的互联网读取通道
### 事实
- **周榜新面孔** — 本周 +3,914 星〔新建 created 2026-02-24〕；一个 CLI 读 / 搜 Twitter、Reddit、YouTube、GitHub、B 站、小红书，零 API 费；83.5k 总星，MIT（*潮流*）（[repo](https://github.com/Panniantong/Agent-Reach)）

### 简评
给 agent 装互联网读取通道，国内平台覆盖是差异点；属感知通道的应用层工具而非 harness 架构线，潮流线判定留档观察。需要外部信息源的 agent 场景可以试，与 harness 演进主线关系弱。

**结论**：仅记录 — 应用层工具，非架构线，留档。

## Tencent/WeKnora：知识平台加速走量
### 事实
- **周榜续榜** — 本周 +4,867 星（上期 +1,302，环比 ×3.7）；文档 → RAG → 自主推理 agent → 自维护 Wiki 的知识平台；27.5k 总星，license 非标准（NOASSERTION）（*潮流*）（[repo](https://github.com/Tencent/WeKnora)）

### 简评
大厂知识平台加速走量，方向偏知识管理而非 harness；license 非标准，正式采用前需过法务审。

**结论**：仅记录 — 走量信号有信息价值，非标 license 谨慎。

## 本周热门（潮流线）

- [blader/humanizer](https://github.com/blader/humanizer) 本周 +3,024 星（上期 +3,673）· 50.3k 总星 — 去 AI 写作痕迹 skill，写作风格品类热度持平微退
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) 本周 +2,498 星（上期 +5,146，环比 -51%）— 写 HTML 渲染视频，built for agents，退潮中（总星输入未载）
- [mksglu/context-mode](https://github.com/mksglu/context-mode) 本周 +1,359 星（上期 +2,102）· 23.7k 总星 — 工具输出沙箱化（降 98%）+ 会话记忆持久化 + 17 平台路由，上期已提名 L2

未纳入说明：harness 线各家「其他动态」（pi 的 strict JSON-schema 默认启用、Codex 的 Bedrock 凭据与 WSL 沙箱加固、Claude Code 的 fast mode / 网关 hint 头等）属次级修复 / 配置项，本周期未单独立题，详见原简报；潮流线筛除的 6 条（卫星模拟、家居自动化、Postgres 平台、transformers、LibreChat、markitdown）与 Agent 生态无关或无本周方向信息，按原判舍弃。

## harness 监控名单提名

潮流线候选区原样带过：

- **stablyai/orca** — 提名进 harness-digest 监控名单：把 parallel agent fleet 管理 + 自有订阅复用做成 ADE 品类，正对 Codex agents overview、worktree 治理同一架构方向，公司背书且 pushed 活跃。
- **addyosmani/agent-skills** — 提名进 harness-digest 监控名单：生产级工程 skills 的头部候选，头部工程师维护、97k 星 10k fork，其目录变更即 skills 生态工程化风向。
- **anthropics/knowledge-work-plugins** — 提名进 harness-digest 监控名单：Anthropic 官方 Cowork 插件入口，与已监控的 openai/skills 对位，是 Claude 侧能力面变更的官方渠道。
- **alibaba/open-code-review** — 提名进 harness-digest 监控名单（低优先）：7 倍周增登顶全榜的混合架构（确定性管线 + LLM Agent）样本，观察其 agent 层架构迭代即可校准"混合架构"叙事的成色。
- **Panniantong/Agent-Reach** — 暂不提名：属 agent 工具生态（感知通道）而非 harness 架构线，体量大但方向偏应用，留档观察。
- **max-sixty/worktrunk** — 暂不提名：方向相关但体量尚小（8.1k），连续两期上榜且翻倍中，再涨一期即提名。

建议：优先采纳 orca 与 agent-skills 两条（正对本期"并行基建 + skills 工程化"两条主线），knowledge-work-plugins 与 open-code-review 可低成本一并纳入；采纳与否由人改 harness-digest 的监控表。
