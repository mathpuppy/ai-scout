# Agent 技术周报 · 2026-09-27（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [2026-09-18, 2026-09-27] · 论文线 [2026-09-19, 2026-09-25]（实覆盖 5/7 天，周末页空） · 产物：agent-harness-brief-2026-09-27.md、trending-2026-09-27.md、papers-2026-09-27.md · 数据缺口：无

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| Claude Code 2.1.280～283 四连发 | Opus 5.5 接入即默认、Pro/Team 整体切 Opus，auto mode 推为无配置默认权限模式，潮流线同周在榜（双线点名） | 值得导入 |
| Codex 0.156/0.157 默认化浪潮 | 语音、worktree、daemon 自动启动、Guardian 四项批量转默认，常驻 server + 默认并行代理架构定局 | 值得导入 |
| pi 0.86.1～0.87.1 结构性上下文编辑 | canonical session context：不重写历史即可编辑模型上下文，"历史不可变、请求时可变"路线推到完备 | 值得导入 |
| Hermes v0.21.4/v0.21.5 服务化架构 | host 常驻 + 多 profile + 多客户端 + plugin SDK wave，约 2,300 个 PR 的能力级内容"故意不展开"、欠到 v0.22.0 | 值得观望 |
| Agent 记忆/知识沉淀成赛道 | hindsight 登顶周榜（+7,282），论文线自演化本体/代码抽技能/用时策展三篇同窗（双线共振） | 值得观望 |
| Harness 成为优化对象（论文） | RRSI 让 agent 递归改写自己的 harness（本周最高分 206），Harness-Zero 反向把 harness 蒸馏进模型 | 值得观望 |
| Skill 工程化 + Anthropic 官方生态三层 | Cloudflare 多阶段安全审计 skill 登至第二，Anthropic 三仓同榜从通用 harness 铺到垂直行业包 | 值得导入 |
| 存量软件 agent 化 | univer 重定位"Office Harness for AI Agents"、CLI-Anything 给存量 CLI 生成 agent 接口，路线分岔的新叙事 | 值得观望 |
| Fleet 编排稳态 | orca 两连涨（+20%）验证稳态赛道，paperclip 以 87k 总星把 fleet 治理推到组织管理平面 | 值得观望 |
| Agent RL 环境程序化合成（论文） | CodeMidas 从代码造 RL 环境、Qwen 造混合 CUA 环境、阿里按类别迭代训专家，同解训练环境稀缺瓶颈 | 值得观望 |

**本期大盘**：本窗口最大事件是四家 harness 同窗接入同一批新模型（Opus 5.5、GPT-6 Sol / Luna、Grok 4.7）且两家直接改默认，模型目录跟进速度与默认模型策略首次成为 harness 层面的显性竞争维度；能力主线上，"缓存经济"升级为"结构性上下文编辑"，daemon / worktree 等常驻基础设施从可选走向默认。潮流线记忆基建登顶全榜、skill 转向工程化 + 官方化；论文线"harness 本身成为优化对象"成母题，与工程侧四家高频迭代互为镜像。

## Claude Code 2.1.280～283：Opus 5.5 默认化 + 权限默认启动

### 事实
- **Opus 5.5 接入即成默认，Pro / Team Standard 整体切 Opus（2.1.280）** — `claude-opus-5-5` 上线即为默认 Opus 模型（1M 上下文，$4 / $20 per Mtok，$0.20 缓存读）；Pro 与 Team Standard 计划默认模型从 Sonnet 改为 Opus（*harness*）（[2.1.280 · 2026-09-23](https://github.com/anthropics/claude-code/commit/56f36532530f88b572854538d685fcf781141e8c)）
- **auto mode 双向扩张（2.1.282 / 2.1.283）** — 直连 Anthropic API 且 telemetry 关闭时会话默认改用服务端分类器；第三方 provider 或 telemetry 关闭的交互会话在未配置权限模式时直接以 auto mode 启动（*harness*）（[2.1.282 · 2026-09-25](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212182)、[2.1.283 · 2026-09-26](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212183)）
- **`/doctor prompt-audit`（2.1.283）** — 审计 CLAUDE.md、skills、agents、commands 中为旧模型写的提示模式，把"模型代际迁移"工具化（*harness*）（[2.1.283 · 2026-09-26](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212183)）
- **模型治理 managed settings（2.1.283）** — `availableModelsMatch: "exact"` 只放行所指版本（新模型默认阻塞直至列入），`deniedModels` 显式封禁（*harness*）（[2.1.283 · 2026-09-26](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212183)）
- **apps gateway Bedrock 深度集成（2.1.281）** — `assume_role` 经 STS 假设 IAM 角色（可跨 AWS 账号）、`guardrail: {id, version}` 对每个请求应用 Bedrock guardrail（*harness*）（[2.1.281 · 2026-09-24](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212181)）
- **MCP URL-mode elicitation（2.1.281）** — MCP 2026-07-28 协议连接上，服务器可要求打开浏览器流程完成引导（*harness*）（[2.1.281 · 2026-09-24](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#212181)）
- **anthropics/claude-code 本周 +1,744 星续榜** — 148.2k 总星，harness 线监控对象同周被潮流线点名（*潮流*）（[repo](https://github.com/anthropics/claude-code)）

### 简评
四连发全部落在 09-23～09-26，两条主线：模型层"代际切换套件"一次到位（默认化 + 治理键 + prompt 审计 + Bedrock 网关），权限层把 auto mode 推为无配置时的默认启动模式（叠加上期服务端分类器定局）。在四家同窗接入同一批新模型的竞赛中，Claude Code 是动作最深的一家——不仅接入还整体迁移了主流付费档位的默认档。双线点名（简报四连发 + 周榜在榜）确认热度。

**结论**：值得导入 — 全部改动随自动更新到位；Opus 5.5 默认化即生效（留意计费结构变化），`/doctor prompt-audit` 可即刻跑一遍自家 CLAUDE.md 与 skills，治理键与 Bedrock 网关对组织侧直接可用。

## Codex 0.156 / 0.157：四项默认化，常驻 server 架构定局

### 事实
- **语音对话默认启用（0.156.0）** — 上期实验通道的 `/voice` 转为默认开启：F8 开关、声音选择、Linux / Windows 捆绑音频运行时，四家中首个默认开的实时语音（*harness*）（[rust-v0.156.0 · 2026-09-23](https://github.com/openai/codex/releases/tag/rust-v0.156.0)）
- **daemon 默认自动启动（0.156.0 → 0.157.0）** — `/daemon` 管理本地后台 server 或 `--no-daemon` 绕过；符合条件的交互会话默认自动启动后台 server，常驻架构从显式命令推进到默认常驻（*harness*）（[rust-v0.157.0 · 2026-09-25](https://github.com/openai/codex/releases/tag/rust-v0.157.0)，#47179）
- **Worktree 默认启用 + 任务中心治理（0.156.0）** — worktree 支持默认开，agent command center 按状态过滤任务并可直接创建 worktree 会话（*harness*）（rust-v0.156.0，#46839 / #45276 / #44870）
- **Guardian thread context 默认启用（0.157.0）** — Guardian 上下文注册表进入默认形态，另含 review 策略配置与 v2 classifier 的 workspace 路由（*harness*）（rust-v0.157.0，#47275 / #47125 / #47162）
- **多代理运行时收敛（0.157.0）** — spawn 统一走 `SpawnRequest`、`LocalAgentControl` 集中代理恢复、`close_agent` 返回代理快照、从最新 compaction 边界恢复模型上下文（*harness*）（rust-v0.157.0，#47235 / #47244 / #47252 / #47271 / #47365）
- **GPT-6 Sol / Luna 全线接入（0.156.1 → 0.157.0）** — 先以 hotfix 进模型选择器，次日完整接入含 Amazon Bedrock 支持与旧模型迁移提示（*harness*）（[rust-v0.156.1 · 2026-09-23](https://github.com/openai/codex/releases/tag/rust-v0.156.1)、[rust-v0.157.0 · 2026-09-25](https://github.com/openai/codex/releases/tag/rust-v0.157.0)）
- **`/usage` 分析面板（0.156.0）** — 账户用量、token 总量、插件与技能活动的分析视图，插件与技能活动首次有可见度（*harness*）（rust-v0.156.0，#45764 / #45769）

### 简评
两个 minor 同窗落地（0.154 → 0.157 间隔 6 / 5.8 / 2.3 天，节奏在加速），主题高度一致：把上期"已具备"的能力批量推为默认——语音、worktree、daemon、Guardian 四项默认化叠加多代理运行时收敛，勾勒出"常驻 server + 默认并行代理 + 默认监护"的目标形态。Sol / Luna 先 hotfix 进目录、次日补全 Bedrock 的两步走，与 pi、Claude Code 同窗响应同一批模型发布。

**结论**：值得导入 — 默认形态升级即得，无需配置动作；语音、daemon、worktree 对日常使用是直接能力增量，企业侧 Bedrock 通道同步跟进。

## pi 0.86.1～0.87.1：canonical session context，改上下文不重写历史

### 事实
- **追加式上下文编辑（0.87.0）** — `ContextEditEntry` 让单条消息从后续请求中消失而不动原始转录，压缩边界可显式保留（retain-none），全部以缓存安全为设计约束（*harness*）（[0.87.0 · 2026-09-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0870---2026-09-21)）
- **`context_with_system` 全转录变换（0.87.0）** — 扩展系统首次拿到含 system prompt 的全转录改写权，与 `context` 钩子形成两级上下文管线（*harness*）（[0.87.0 · 2026-09-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0870---2026-09-21)）
- **`SessionManager` 成为唯一权威（0.87.0，Breaking）** — provider 上下文统一由 SessionManager 供给，直接赋值 `session.agent.state.messages` 不再生效；`shouldStopAfterTurn` 移除改 `finishTurn`（*harness*）（[0.87.0 · 2026-09-21](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0870---2026-09-21)）
- **Per-model image input limits（0.87.0）** — `inputLimits.images.resize` 按模型配置图片缩放，缓存安全（*harness*）（[#9631](https://github.com/earendil-works/pi/issues/9631) · 0.87.0）
- **新模型三通道同版接入（0.87.1）** — Claude Opus 5.5（adaptive thinking、1M 上下文）、GPT-6 Sol / Luna 经 Anthropic / OpenAI / GitHub Copilot 三条凭据通道接入，Grok 4.7 成为 xAI 新会话默认（*harness*）（[0.87.1 · 2026-09-22](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0871---2026-09-22)）
- **Meta Muse provider（0.86.1）** — `/login meta` OAuth（自动 key 刷新）或 `META_API_KEY` 接入 Muse Spark 模型（*harness*）（[0.86.1 · 2026-09-20](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0861---2026-09-20)）

### 简评
一周三连发，0.87.0 是本期四家中最重的单项架构更新：把上期 transcript-aware 更新开创的"历史不可变、请求时可变"路线推到完备——上下文编辑成为会话转录的一等条目类型、扩展拿到全转录变换权。0.87.1 在一个 patch 版本内完成同一批新模型跨三家 provider 的继承式接入，是四家模型竞赛中最体系化的路径。Unreleased 区已现 `generateImages()` / `classify()` 雏形，模型运行时正向多操作面扩展。

**结论**：值得导入 — 开源 harness 升级即得，长会话上下文管理直接受益；SDK 消费者注意 0.87.0 的 Breaking 变更。

## Hermes Agent v0.21.4 / v0.21.5：host 常驻服务化 + plugin SDK wave

### 事实
- **Host 级 gateway 单例 + Desktop 附着运行中后端（v2026.9.21）** — 主机范围内 gateway 单例锁，Desktop 不再自行 spawn 第二个后端而是 attach 到运行中的 host backend（*harness*）（[v2026.9.21 · 2026-09-22](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.21)）
- **Per-profile 生命周期纳入 host multiplexer（v2026.9.24）** — 各 profile 可独立 stop / start / restart，`gateway.standalone` 可让单个 profile 退出多路复用（*harness*）（[v2026.9.24 · 2026-09-24](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.24)）
- **Desktop plugin SDK wave（v2026.9.24）** — composer draft API、session-list 与 row-decoration 插槽、typed settings / skills / toolsets / profiles 桥接、沙箱化 embed 原语、插件后端公共事件桥（*harness*）（[v2026.9.24 · 2026-09-24](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.24)）
- **CLI `--format stream-json`（v2026.9.21）** — 结构化 JSONL 输出进入 CLI，为编排方提供机器可读通道（*harness*）（[v2026.9.21 · 2026-09-22](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.21)）
- **`skills.auto_load` 钉入新会话（v2026.9.21）** — 配置后将技能固定进每个新会话的 prompt（*harness*）（[v2026.9.21 · 2026-09-22](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.21)）
- **Connectors 页面取代 MCP tab（v2026.9.24）** — 插件 MCP 服务器一键 "Connect now"，已安装插件的 tools 与 skills 进入每个打开的 chat，连接模型从逐会话配置升级为全局连接面（*harness*）（[v2026.9.24 · 2026-09-24](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.24)）
- **curated notes 欠账连跨四个 tag** — v0.21.4（1,812 个合并 PR）+ v0.21.5（460 个合并 PR）合计约 2,300 个 PR，官方"故意不在此文档化"，累计未文档化体量 5,000+ PR 级，承诺 v0.22.0 "document everything"（*harness*）（[Releases](https://github.com/NousResearch/hermes-agent/releases)）

### 简评
两个 patch rollup 的主线清晰：一是把 Hermes 从单实例工具推向"host 常驻 + 多 profile + 多客户端"的服务化架构，二是把插件 / 连接器生态做成一等公民。能力级事实密集但细节被官方压到 v0.22.0 curated notes，欠账本身已成信号；下期窗口（覆盖至 10-06 前后）命中概率进一步上升。

**结论**：值得观望 — `stream-json`、`skills.auto_load` 等配置面可用，但架构级细节待 v0.22.0 文档化再展开；下期重点盯 curated notes 兑现。

## Agent 记忆 / 知识沉淀成赛道：hindsight + 三篇论文

### 事实
- **vectorize-io/hindsight 本周 +7,282 星登顶全榜** — "Agent Memory That Learns"：从交互中持续提炼的学习型记忆层；32.3k 总星，MIT，created 2025-10-30；风险：vectorize.io 为向量数据库公司，记忆层可能绑定自家存储，与 mem0 / Letta 同赛道拥挤（*潮流*）（[repo](https://github.com/vectorize-io/hindsight)）
- **EvoOntology（中国人民大学 RUC-DataLab · upvotes 153）** — 为 data agent 增设自演化本体层，沉淀异构数据操作的结构化知识并随使用自动演化〔repo: ruc-datalab/EvoOntology ⭐420〕（*论文*）（[paper](https://huggingface.co/papers/2609.15779)）
- **Code2Skill（ant-international〔模型判读〕 · upvotes 115）** — 在交互经验积累之前，直接从源代码大规模抽取可验证的程序性技能〔repo: ant-intl/Code2Skill ⭐52〕（*论文*）（[paper](https://huggingface.co/papers/2609.05571)）
- **Just-in-Time Memory（Salesforce AI Research · upvotes 34）** — agent 记忆策展从写入时改为使用时（read-time curation），按当前任务动态整编记忆再取用（*论文*）（[paper](https://huggingface.co/papers/2609.27334)）

### 简评
双线共振：潮流线本周全榜第一是记忆基建（hindsight），论文线"过程性知识的程序化沉淀"一线（自演化本体 / 代码抽技能 / 用时策展）同窗成形，memory 作为 harness context 能力面的独立品类得到量级确认。hindsight 有 MIT 与公司背书可试用，但绑定风险与赛道拥挤是成色变量。

**结论**：值得观望 — 品类量级确认，单体成熟度待看；hindsight 可小范围试用，论文线作为知识沉淀方向持续跟踪。

## Harness 成为优化对象：RRSI 自改 + Harness-Zero 蒸馏（论文线）

### 事实
- **RRSI: Regularized Recursive Self-Improvement of Agent Harnesses（Google · upvotes 206）** — 冻结 LLM 权重，让 agent 递归改写自己的 harness（提示词 / 控制流 / 工具 / 记忆 / 上下文管理），用正则化策略稳定自改过程，使 harness 能力随迭代持续增益〔repo: google-research/rrsi ⭐353〕（*论文*）（[paper](https://huggingface.co/papers/2609.24972)）
- **Harness-Zero: Harness Distillation via Agent-as-Harness（北京大学 · upvotes 36）** — 提出 Agent-as-Harness，把外部 harness 的增益蒸馏进模型自身，使 agent 摆脱对运行时 harness 的依赖〔repo: metaevo-ai/harness-zero ⭐44〕（*论文*）（[paper](https://huggingface.co/papers/2609.24974)）

### 简评
本周 agent 论文最高分母题：一增一减两条路线同窗上榜——RRSI 让 harness 可自我改写，Harness-Zero 反向消灭 harness，社区正从"训模型"转向"训外壳"。与工程侧四家 harness 的高频迭代互为镜像，两篇均未进 GitHub 周榜、无跨线对撞，落地节奏尚早。

**结论**：值得观望 — 方向信号强、与 harness 线直接同题；google-research/rrsi repo 值得盯。

## Skill 工程化定型 + Anthropic 官方生态三层

### 事实
- **cloudflare/security-audit-skill 本周 +6,474 星，全榜第二〔新建 created 2026-06-18〕** — 多阶段安全审计 coding-agent skill，产出独立验证、机器可读的 findings；22.0k 总星（3 个月），MIT（*潮流*）（[repo](https://github.com/cloudflare/security-audit-skill)）
- **addyosmani/agent-skills 本周 +2,510 星续榜（环比 -27%）** — 生产级工程 skills 库，99.3k 总星，MIT（*潮流*）（[repo](https://github.com/addyosmani/agent-skills)）
- **anthropics/financial-services 本周 +2,633 星新上榜** — Anthropic 官方金融服务行业包（金融场景 agents / skills），37.7k 总星（*潮流*）（[repo](https://github.com/anthropics/financial-services)）
- **anthropics/knowledge-work-plugins 本周 +664 星续榜** — 官方知识工作者插件库，面向 Claude Cowork，25.7k 总星（*潮流*）（[repo](https://github.com/anthropics/knowledge-work-plugins)）

### 简评
上期"skill 单品退潮"的判断本周进一步兑现为分化：单品全部掉榜，但 skill 品类以"工程品 + 官方品"形态留在头部——Cloudflare 把 skill 做成多阶段流水线 + 可验证产物，Anthropic 三仓同榜（claude-code + knowledge-work-plugins + financial-services），从通用 harness → 知识工作者插件 → 垂直行业包三层铺开，官方分发颗粒度在变细。

**结论**：值得导入 — security-audit-skill 即拿即用（MIT，放进任意 coding agent 即可跑安全审计）；官方行业包当能力面风向标持续跟踪。

## 存量软件 agent 化：univer + CLI-Anything

### 事实
- **dream-num/univer 本周 +4,660 星** — "The Office Harness for AI Agents"：表格 / 文档 / 幻灯 / 画布 / 关系表 / PDF 一体化运行时，老牌文档引擎（2022）整体重定位为 agent 操控 office 文档的底座；19.3k 总星，Apache-2.0（*潮流*）（[repo](https://github.com/dream-num/univer)）
- **HKUDS/CLI-Anything 本周 +1,055 星〔新建 created 2026-03-08〕** — "Making ALL Software Agent-Native"：为存量 CLI 软件生成 agent 可用接口，配 CLI-Hub 聚合；50.6k 总星，Apache-2.0，港大 HKUDS 出品（LightRAG 同门）；风险：CLI-Hub 中心化服务存在单点依赖（*潮流*）（[repo](https://github.com/HKUDS/CLI-Anything)）

### 简评
潮流线本周标记的新叙事："把存量软件改造成 agent 运行时"——univer 是老牌引擎整体转向的标杆样本，CLI-Anything 是接入层路线代表（不造新工具而是给存量软件生成接口），与"造新 harness"形成路线分岔。两者同向同周上榜说明叙事有初步热度，但 agent 接口的实际采用度均待验证。

**结论**：值得观望 — 叙事刚起、样本只有两个；若下一阶段更多存量软件跟进重定位，即升级为趋势线。

## Fleet 编排稳态：orca 两连涨 + paperclip 管理平面

### 事实
- **stablyai/orca 本周 +6,503 星（上期 +5,404，环比 +20%）** — parallel agent fleet 的 ADE，用自有订阅跑任意 coding agent；79.0k 总星，MIT，6,966 open issues；两连涨验证 fleet 编排是稳态赛道而非脉冲（*潮流*）（[repo](https://github.com/stablyai/orca)）
- **paperclipai/paperclip 本周 +5,376 星〔新建 created 2026-03-02〕** — "管理工作场所 agents"的开源应用：把个人用 agent 变成团队 / 组织可管理、可审计的 agent 群；87.5k 总星（6 个月），MIT，5,748 open issues；风险：公司背景较新、商业模式不明（*潮流*）（[repo](https://github.com/paperclipai/paperclip)）

### 简评
并行编排线进入稳态：orca 环比再涨 20%，paperclip 以 87k 总星把 fleet 治理从编排器推到组织管理平面（审批 / 审计 / 团队维度）。与 harness 线 Codex 的 worktree 默认化 + 多代理运行时收敛（见上题）同向，说明"多 agent 并行"的供给端与治理端在同步成形。两家 open issues 都在数千级，维护压力待观察。

**结论**：值得观望 — 品类稳态确认，单体治理与维护成熟度未过线。

## Agent RL 环境程序化合成（论文线）

### 事实
- **CodeMidas（Xiaomi MiMo〔模型判读〕 · upvotes 134）** — 从开源代码库自动规模化合成带可靠验证器的 coding RL 任务，把 agent RL 环境从人工 benchmark 转向程序化生产（*论文*）（[paper](https://huggingface.co/papers/2609.22068)）
- **RecreationWorld（阿里 Qwen · upvotes 77）** — 为混合型 CUA（GUI 图形交互 + 代码 / 命令行）构建可扩展可验证的环境，弥合 computer-use agent 两条技术路线〔repo: QwenLM/RecreationWorld ⭐84〕（*论文*）（[paper](https://huggingface.co/papers/2609.22000)）
- **One to More, More to One（阿里巴巴 · upvotes 48）** — 针对 repo 级 SWE agent RL 中异构任务类别进展不均，按类别迭代训练专家再合并，改进 pooled agentic RL〔repo: alibaba/AgenticBigBang ⭐40〕（*论文*）（[paper](https://huggingface.co/papers/2609.23377)）

### 简评
论文线第二条主线：三家大厂团队同窗回应"训练环境稀缺"这一 agent RL 规模化瓶颈——环境从人工构造转向程序化合成，覆盖 coding、CUA、SWE 三类任务。对应用层是间接信号：agent 能力的下一波提升押在训练环境供给上。

**结论**：值得观望 — 训练侧基建，无即用价值；关注其产出的开源环境是否流入评测基准。

## 本周热门（潮流线）

- [affaan-m/ECC](https://github.com/affaan-m/ECC) — 本周 +5,522（环比 -12%）· 268.0k — agent harness 性能优化系统（skills / instincts / memory / 安全，跨四家 harness）；单人仓库扛 268k 星，bus factor 风险持续
- [alibaba/open-code-review](https://github.com/alibaba/open-code-review) — 本周 +4,310（上期 +15,028，环比 -71%）· 41.6k — 确定性管线 + LLM Agent 混合架构代码评审，上期 7 倍爆发后退潮中
- [Tencent/WeKnora](https://github.com/Tencent/WeKnora) — 本周 +3,015（环比 -38%）· 30.4k — 文档→RAG→自主推理 agent→自维护 Wiki 的知识平台
- [superdesigndev/treg](https://github.com/superdesigndev/treg) — 本周 +1,773〔新建 created 2026-07-15〕· 3.5k（本周占 51%）— "OpenRouter for agent tools"：工具统一路由层；license 非标准（NOASSERTION）、背景不明
- [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) — 本周 +1,142 · 31.9k — Claude Code 配置与监控 CLI，harness 配置管理需求的旁证
- [TencentCloud/Octop](https://github.com/TencentCloud/Octop) — 本周 +951〔新建 created 2026-07-08〕· 5.1k — 腾讯云自托管多用户多 agent 助手平台，仅 2.5 个月、成熟度待观察

## 本周论文（论文线）

- The Tasteful Agent: Measuring and Improving Taste in Long-Horizon Tasks — Microsoft · upvotes 149 — 定义并测量长程任务中 agent 的"品味"（中间决策质量），配 TasteBench 评测 · [paper](https://huggingface.co/papers/2609.25804)〔repo: wbopan/tastebench ⭐15〕
- GameHorizon Suite: Multi-Horizon Data and Evaluation in Gameplay — 腾讯 · upvotes 130 — gameplay agent 多视野数据与评测套件，视觉 / 规划 / 操作长程联合考察 · [paper](https://huggingface.co/papers/2609.25001)〔repo: TencentARC/GameHorizon ⭐270〕
- VideoGen-Agent: Reinforcing Video Generation Agents — Princeton University · upvotes 70 — 视频生成模型封装为多轮推理-生成循环的 agent 并用 RL 强化 · [paper](https://huggingface.co/papers/2609.24997)
- onPanda: Efficient Annotation of On-Policy Alignment Data for LLMs and Agents — StepFun 阶跃星辰 · upvotes 55 — token 级修正的交互式标注工具，服务 agent 轨迹 on-policy 标注 · [paper](https://huggingface.co/papers/2609.24983)〔repo: on-panda/on-panda ⭐42〕

## harness 监控名单提名

潮流线候选区原样带过：

- **vectorize-io/hindsight** — 提名进 harness-digest 监控名单：本周全榜第一的记忆层基建，memory 是 harness context 能力面核心组件，vectorize.io 公司背书 + MIT，其架构迭代即记忆赛道风向。
- **cloudflare/security-audit-skill** — 提名进 harness-digest 监控名单：skill 工程化的标杆样本（多阶段 + 独立验证产物），基础设施大厂官方 skill 渠道，可校准 skills 生态从内容向工程演进的成色。
- **dream-num/univer** — 提名进 harness-digest 监控名单（低优先）："Office Harness" 定位若成立，将成为 agent 操控 office 文档的事实运行时，观察其 agent 接口层的架构迭代。
- **HKUDS/CLI-Anything** — 提名进 harness-digest 监控名单（低优先）：存量软件 agent 化的接口层路线代表，与 MCP 形成互补 / 竞争关系，港大 HKUDS 工程基建连续成功率高。
- **paperclipai/paperclip** — 暂不提名：体量够（87k）但属 agent 管理平面（组织 / 审计）而非 harness 架构线，方向偏应用，留档观察（判例同上期 Agent-Reach）。
- **superdesigndev/treg** — 暂不提名：工具路由方向值得关注，但 license 非标准、背景不明、仅 3.5k 星，连续再上榜即提名。

一句话建议：两项正式提名（hindsight / security-audit-skill）与本期双线共振的"能力层基建 + skill 工程化"方向一致，建议采纳；univer / CLI-Anything 按低优先挂观察位，看"存量软件 agent 化"叙事是否续热；paperclip、treg 留档，是否采纳由人改 harness-digest 的监控表。
