# Agent 技术周报 · 2026-09-20（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [2026-09-11, 2026-09-20] · 产物：agent-harness-brief-2026-09-20.md、trending-2026-09-20.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| 并行 agent 基建成形 | Codex 任务治理落地与 orca / worktrunk / firstmate 同向共振，multi-agent 并行的外围工具层成形 | 值得观望 |
| pi 0.86.0 缓存经济 | cache warming、per-model 压缩预算、transcript-aware 更新整包兑现，长会话不重算成为一等工程问题 | 值得导入 |
| Claude Code 八版连发 | 权限分类器定局服务端、v2 MCP client、AGENTS.md、账号级同步，流水密度 9 月之最 | 值得导入 |
| skills 生态官方工程化 | 单品 skill 退潮，addyosmani 库与双厂官方插件入口起量，生态从玩法转向基建 | 值得导入 |
| Codex 0.155 交互与验证 | 四家 harness 首个实验通道实时语音 + Touch ID 硬件级 MCP 验证 | 值得观望 |
| alibaba/open-code-review 爆发登顶 | 确定性管线 + LLM Agent 混合架构周增 7 倍登顶全榜 | 值得观望 |
| Hermes 338-PR rollup | v0.21.3 本体修复级，curated notes 第三次跳票至 v0.22.0 | 仅记录 |
| Tencent/WeKnora 加速 | 文档→RAG→agent→Wiki 知识平台周增环比 ×3.7 | 仅记录 |

**本期大盘**：harness 侧连续两期空窗后四家同窗集中释放，方向收敛于"缓存经济"与"权限安全执行"两条线；潮流线 skills 单品整体退潮，接棒的是并行 agent 基建、混合架构 code review 与官方 skills/plugins 分发——官方迭代与社区风向在本周罕见地对齐到同一组方向上。

## 并行 agent 基建成形
### 事实
- **Codex agents overview 任务治理** — 任务隐藏 / 归档 / 删除，worktree 所有权详情展示与干净受管 worktree 的确认删除，并行任务管理从"只能看"进到"能治理"（*harness*）（[rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)，#43942 / #44424 / #44314）
- **stablyai/orca** — 面向 parallel agent fleet 的 ADE，用自有订阅跑任意 coding agent，桌面 / 移动 / 远程三端运行时；本周 +5,404 星〔新建 created 2026-03-17〕，72.7k 总星，6,281 open issues（*潮流*）（[repo](https://github.com/stablyai/orca)）
- **max-sixty/worktrunk** — 为并行 AI agent 工作流设计的 Git worktree 管理 CLI（Rust）；本周 +1,141 星（上期 +588，环比 ×1.9），8.1k 总星（*潮流*）（[repo](https://github.com/max-sixty/worktrunk)）
- **kunchenguid/firstmate** — "对话一个 agent，带一支 crew 干活"的多 agent 编排；本周 +1,073 星（上期 +778），6.8k 星挂 1,628 open issues，维护过载未缓解（*潮流*）（[repo](https://github.com/kunchenguid/firstmate)）

### 简评
官方与社区在同一周向同一方向收敛：Codex 在 harness 内把 worktree 所有权和任务生命周期做成治理面，社区侧 orca 把 agent fleet + 订阅复用做成独立品类，worktrunk 翻倍、firstmate 续涨。这是 multi-agent 并行开发从"能力演示"进入"工程配套"阶段的信号。但社区工具成熟度参差——orca open issues 六千余、firstmate 维护过载、worktrunk 体量尚小。

**结论**：值得观望 — 方向明确且两线共振，但社区侧尚无稳定成熟选项；先跟踪 Codex agents overview 与 orca 的架构迭代，worktree 管理 CLI 可小规模试用。

## pi 0.86.0：缓存经济整包落地
### 事实
- **Prompt cache warming** — 工具长运行与可选空闲期间用成本感知的刷新保活高价 prompt 缓存，带可配模式、模型缓存寿命元数据、`/session` 诊断与 `cache_warming_decision` 扩展事件（*harness*）（[0.86.0 · 2026-09-19](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0860---2026-09-19)）
- **Per-model compaction 预算** — `compaction.modelOverrides` 按模型配置 `reserveTokens` / `keepRecentTokens`，普通压缩设置作回退（*harness*）（[#8133](https://github.com/earendil-works/pi-mono/issues/8133) · 0.86.0）
- **Transcript-aware 指令与工具更新** — 会话中途变更 system prompt / 工具定义后跨 resume 与分支导航保留，同时保住已缓存前缀（*harness*）（[#9548](https://github.com/earendil-works/pi/pull/9548) · 0.86.0）
- **`user_bash` fail-closed（Breaking）** — 错误或无效 defined 结果直接中止命令，不再执行本地后续 handler（*harness*）（[#9068](https://github.com/earendil-works/pi/issues/9068) · 0.86.0）

### 简评
15 天憋出的 0.86.0 是一次方向明确的整包：cache warming、按模型压缩预算、transcript-aware 更新全部围绕"长会话下保住缓存前缀、压低重算成本"，与 Claude Code 本期十余条 cached-prefixes 修复互为印证——缓存经济已是 harness 赛道的共同主线。对直接使用 pi 的团队，升级即得成本收益；唯一注意点是 `user_bash` fail-closed 属 breaking，自定义扩展需要检查钩子语义。

**结论**：值得导入 — 升级 0.86.0 即可采用，缓存保温对长会话成本直接有效；升级前核查自定义 `user_bash` 钩子。

## Claude Code 八版连发：权限定局与生态兼容
### 事实
- **auto mode 权限分类器默认转服务端** — API / Enterprise / Bedrock / Vertex / Foundry / 网关会话默认用服务端分类器（不收分类器开销费）；此前 2.1.273 曾把 Bedrock / Vertex / Foundry 默认切回本地（*harness*）（[2.1.278 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212178)）
- **MCP 栈升至 v2 client + MCP 2026-07-28 协商** — Bedrock / Vertex / Foundry 及遥测禁用安装默认改用 v2 MCP 客户端与新版协议协商（`MCP_SDK_GENERATION=v1` 可退回）（*harness*）（[2.1.274 · 2026-09-17](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212174)）
- **AGENTS.md 支持** — 项目无 CLAUDE.md 时改读 AGENTS.md，`/config` 的 Project instructions 可切换（Bedrock / Vertex / Foundry 暂缺）（*harness*）（[2.1.277 · 2026-09-19](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212177)）
- **子代理输出防注入标记** — 子代理结果以带 header 的缩进块送达主代理，文本无法伪装成会话自身指令；workflow 脚本计算的 `agent()` 提示词同样被框定为脚本作者文本（*harness*）（2.1.277，见上锚点）
- **auto mode 沙箱按命令域名审查** — Bash / PowerShell / Monitor 逐命令审查并放行所需域名，其余域名拒绝，网络边界从会话级细化到命令级（*harness*）（[2.1.271 · 2026-09-15](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212171)）
- **在榜事实** — 本周 +1,999 星，146.8k 总星，harness L1 已监控对象（*潮流*）（[repo](https://github.com/anthropics/claude-code)）

### 简评
窗口内 2.1.271～2.1.278 八版连发，流水密度为 9 月之最，上期关注的权限改动波纹基本出清。主线两条：权限执行（分类器定局服务端 + 命令级域名审查 + 子代理输出信任边界）与生态兼容（v2 MCP client、AGENTS.md）。AGENTS.md 适配意味着项目指令文件可以一份跨 Claude Code 与其他工具复用。

**结论**：值得导入 — 升级即可用；顺手把项目指令迁移到 AGENTS.md，一次配置多工具受益。

## skills 生态：单品退潮，官方工程化接棒
### 事实
- **addyosmani/agent-skills** — Addy Osmani 出品的生产级工程 skills 库；本周 +3,445 星〔新建 created 2026-02-15〕，97.1k 总星，fork 10.2k（*潮流*）（[repo](https://github.com/addyosmani/agent-skills)）
- **anthropics/knowledge-work-plugins** — Anthropic 官方知识工作者插件库，面向 Claude Cowork；本周 +1,034 星，25.2k 总星（*潮流*）（[repo](https://github.com/anthropics/knowledge-work-plugins)）
- **openai/plugins** — OpenAI 官方插件仓库续榜但退潮中；本周 +522 星（上期 +1,181），7k 总星（*潮流*）（[repo](https://github.com/openai/plugins)）
- **i-have-adhd 退潮** — 上期全榜第一的输出风格 skill 本周 +5,589 星（上期 +16,740，环比 -67%），印证"skill 即内容"是短周期热度（*潮流*）（[repo](https://github.com/ayghri/i-have-adhd)）
- **Claude Code 账号级 skills / plugins 同步** — claude.ai 账号上启用的技能与插件同步到该账号登录的终端会话（`syncClaudeAiSkills` / `syncClaudeAiPlugins` 可关）（*harness*）（[2.1.275 · 2026-09-18](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212175)）

### 简评
单品 skill 热度周期走完（i-have-adhd -67%，humanizer / hyperframes 同退），接棒的是工程化与官方化两股力量：头部工程师维护的生产级 skills 库月级冲到近十万星，两大厂同时把 skills/plugins 当作 harness 能力面的官方分发出口经营。skills 正从"内容玩法"沉淀为"工程基建"，账号级同步则让技能资产开始跨端流动。

**结论**：值得导入 — agent-skills 库可直接筛选并入团队技能集；官方双入口保持关注，其目录变更即生态风向。

## Codex 0.155：语音交互与硬件级验证
### 事实
- **实验性 `/voice` 语音对话** — 支持构建上经 `/experimental` 开启 WebRTC 实时语音：直播转录、麦克风控制条、可配置静音快捷键；四家 harness 中首个进入官方实验通道的实时语音交互（*harness*）（[rust-v0.155.0 · 2026-09-18](https://github.com/openai/codex/releases/tag/rust-v0.155.0)）
- **Touch ID 验证 MCP 请求** — macOS 上经 Secure Enclave 签名，本地 TUI 会话的 MCP 请求需用户生物识别确认，配套 TUI 验证提示组件与 user-verification RPC 适配层（*harness*）（rust-v0.155.0，#43624 / #43547 / #43568）
- **daemon 更新调度可配置** — `codex app-server daemon update` 显式命令 + 可配置自动更新时刻，saved threads 与 active goals 可在 daemon 重启后恢复（*harness*）（rust-v0.155.0，#43542 / #43562 / #44314）
- **0.155.1 次日跟进** — 单条修复：新 TUI 会话 reasoning summary 默认回退 none（09-19）

### 简评
Codex 在"交互通道 + 权限验证"两端同时加码：语音把 harness 从文本 TUI 扩到实时音频，Touch ID 把 MCP 权限验证抬到硬件级，与 Claude Code 的架构级、pi 的语义级安全路线形成互补。但 `/voice` 需要构建开关且属实验通道，Touch ID 限 macOS。

**结论**：值得观望 — 方向信号强于即用价值；跟进 0.156 稳定版（alpha 已至 .9）与语音通道的稳定化。

## alibaba/open-code-review：混合架构爆发登顶
### 事实
- **周增 7 倍登顶全榜** — 本周 +15,028 星（上期 +2,213），37.7k 总星，Apache-2.0，fork 2.7k〔新建 created 2026-05-18〕；确定性管线 + LLM Agent 混合架构的代码评审工具，内置 NPE / 线程安全 / XSS / SQL 注入多语言规则集，兼容 OpenAI / Anthropic（*潮流*）（[repo](https://github.com/alibaba/open-code-review)）

### 简评
企业级"确定性规则 + LLM Agent"混合架构在 code review 垂直打出规模样本：规则管线保下限，agent 补上下文，这与 harness 线的权限执行思路同构。爆发第一周，热度和工程质量都待回稳验证。

**结论**：值得观望 — 周增 7 倍登顶说明需求真实存在，可小规模试用其评审管线，正式导入等热度回稳、观察其 agent 层架构迭代。

## Hermes Agent：338-PR rollup，curated notes 三跳
### 事实
- **v0.21.3 修复级 rollup** — 远程网关 refresh token 并发轮换竞态与长生命周期进程 state.db 写句柄泄漏两条修复；tag 内含 338 个合并 PR、1,036 个非合并 commit（+131,690 行），能力级内容官方故意不在 patch notes 展开（*harness*）（[v2026.9.14 · 2026-09-15](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.14)）
- **curated notes 第三次跳票** — JSON-RPC 线契约、Agent Sessions API、MCP OAuth 绑定签发方等全部推给 v0.22.0，欠账已连跨 v0.21.2 / v0.21.3 两个 tag（*harness*）（[Releases](https://github.com/NousResearch/hermes-agent/releases)）

### 简评
tag 节奏加快（间隔 8 / 4 / 3 天）但本体为修复级，真正的能力级内容（server→client JSON-RPC、Pydantic 线契约注册表、Agent Sessions API）持续积压在 v0.22.0 的 curated notes 里。一旦落地将是内容量最大的一期，下期窗口大概率命中。

**结论**：仅记录 — 本期无核心更新可采，等 v0.22.0 curated notes 兑现再展开。

## Tencent/WeKnora：知识平台加速走量
### 事实
- **周增环比 ×3.7** — 本周 +4,867 星（上期 +1,302），27.5k 总星，license 非标准（NOASSERTION）；文档→RAG→自主推理 agent→自维护 Wiki 的知识平台（*潮流*）（[repo](https://github.com/Tencent/WeKnora)）

### 简评
大厂知识平台连续两期上榜且明显加速，把 RAG 与自主推理 agent 串成闭环是它与通用 RAG 项目的差异点。但方向偏知识管理应用，与团队 harness 导入线无直接交集，license 非标准也需注意。

**结论**：仅记录 — 有信息价值的方向样本，与团队导入无关。

## 本周热门（潮流线）

- **affaan-m/ECC** 本周 +6,265（上期 +7,264）· 263k · agent harness 性能优化系统（skills / instincts / memory / 安全），跨 Claude Code / Codex / Opencode / Cursor；单人仓库扛 263k 星，bus factor 极低（[repo](https://github.com/affaan-m/ECC)）
- **Panniantong/Agent-Reach** 本周 +3,914 · 83.5k〔新建 created 2026-02-24〕· 一个 CLI 读 / 搜 Twitter、Reddit、YouTube、GitHub、B 站、小红书，零 API 费，agent 感知边界的平民化扩展（[repo](https://github.com/Panniantong/Agent-Reach)）
- **blader/humanizer** 本周 +3,024（上期 +3,673）· 50.3k · 去 AI 写作痕迹 skill，品类热度持平微退（[repo](https://github.com/blader/humanizer)）
- **heygen-com/hyperframes** 本周 +2,498（上期 +5,146，环比 -51%）· 写 HTML 渲染视频，built for agents，退潮中（[repo](https://github.com/heygen-com/hyperframes)）
- **mksglu/context-mode** 本周 +1,359（上期 +2,102）· 23.7k · 工具输出沙箱化（降 98%）+ 会话记忆持久化 + 17 平台路由，上期已提名 L2（[repo](https://github.com/mksglu/context-mode)）

## harness 监控名单提名

潮流线候选区原样带过：

- **stablyai/orca** — 提名进 harness-digest 监控名单：把 parallel agent fleet 管理 + 自有订阅复用做成 ADE 品类，正对 Codex agents overview、worktree 治理同一架构方向，公司背书且 pushed 活跃。
- **addyosmani/agent-skills** — 提名进 harness-digest 监控名单：生产级工程 skills 的头部候选，头部工程师维护、97k 星 10k fork，其目录变更即 skills 生态工程化风向。
- **anthropics/knowledge-work-plugins** — 提名进 harness-digest 监控名单：Anthropic 官方 Cowork 插件入口，与已监控的 openai/skills 对位，是 Claude 侧能力面变更的官方渠道。
- **alibaba/open-code-review** — 提名进 harness-digest 监控名单（低优先）：7 倍周增登顶全榜的混合架构（确定性管线 + LLM Agent）样本，观察其 agent 层架构迭代即可校准"混合架构"叙事的成色。
- **Panniantong/Agent-Reach** — 暂不提名：属 agent 工具生态（感知通道）而非 harness 架构线，体量大但方向偏应用，留档观察。
- **max-sixty/worktrunk** — 暂不提名：方向相关但体量尚小（8.1k），连续两期上榜且翻倍中，再涨一期即提名。

一句话建议：本期四个正式提名（orca、agent-skills、knowledge-work-plugins、open-code-review）与两条线共振方向高度吻合，建议全部采纳进监控表；worktrunk 设再观察一期。
