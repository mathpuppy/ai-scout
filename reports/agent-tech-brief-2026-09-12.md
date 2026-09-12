# Agent 技术周报 · 2026-09-12（运行日）

> 窗口：L1/L3 [2026-09-06, 2026-09-12] · L2 [2026-09-03, 2026-09-12] · 产物：breadth-2026-09-12.md、agent-harness-brief-2026-09-12.md、trending-2026-09-12.md · 数据缺口：无整线缺失；L1 自述 folo 公众号 6 源触顶 limit=100 或有截断、ai-radar 仅覆盖运行日 24h 滚动窗（口径局限，非失败）

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| OpenAI Agents API | 驱动 Codex 的 harness 连同云端基础设施以单次 API 调用开放公测 | 值得导入 |
| DeepSeek V4.1-Flash | 新 Causal Encoder-Decoder 家族首发，KV cache 压缩 + 1M 上下文直击 agent 部署成本 | 值得导入 |
| GPT-6 Astra 基座化 | 全量推送成为 OpenAI agent 产品默认基座，模型 rollout 已是 harness 常规工程负担 | 值得导入 |
| 上下文管理进入「可编程预算」阶段 | Codex / pi / Claude Code / LangChain 四路同周把上下文从自动压缩推向预算化 | 值得导入 |
| 多会话并行与 HITL 异步化 | Codex worktree 隔离 + Windows 常驻 server、Claude Code 并发上限可调、行内旁路问答 | 值得导入 |
| 插件生态走向治理化 | SHA-pinned 目录、准入 CI、远程市场、plugin eval 一周内三家齐发 | 值得观望 |
| Agent 持密与凭据管理 | Hermes password-blind vault 与 LangChain Connections 代表「用而不见」两种解法 | 值得观望 |
| IDE 多智能体编排提速 | Cursor Projects 协调者调度数千子智能体，Copilot agent 化密集更新 | 值得观望 |
| OpenRouter 长出 agent 运行时 | Fusion 复合模型 + 有状态服务端 Shell + Files API | 值得观望 |
| GPT-Live-1 语音分层 | 全双工语音薄前端 + 强推理后端，$0.05/分钟 | 值得观望 |
| Claude Code 企业治理三件套 | 托管 MCP 下发、无人值守权限语义、effort 档位封顶 | 值得观望 |
| Hermes Agent 本期迭代 | state.db 修复战役收尾，免费档改变默认能力边界 | 值得观望 |
| pi 0.85.x | SDK 会话恢复 + GPT-6 Astra 接入，main 分支押注 per-model 压缩预算 | 值得导入 |
| Agent 滥用实证爆发 | RubyGems 取证、Anthropic 威胁报告与蒸馏指控、Swarmchasers 民间监测 | 值得观望 |
| Agent 信任基建产品化 | APASS、金融安全标准、HOP 3.0 与开源脱敏网关 maskit 同周出现 | 值得观望 |
| 评测诚信危机与评测基建 | 「换考场 99.9%→62.7%」打脸 AGI 叙事，浙大开源评测底座 | 值得观望 |
| 强模型≠强 Agent | PolyWorkBench 实证能力解耦，harness 自进化提升被质疑「多试几次」 | 值得观望 |
| 长时程 agent | RSA-260 因式分解刷新纪录，WorkSwarm 永续会话治长时跑偏 | 值得观望 |
| RSI 论述与落地 | Dwarkesh 对谈时间表，openJiuwen 双维度框架落地办公智能体 | 值得观望 |
| 面壁 MiniCPM5-2B | 2B 跑通多 Agent 协作并上端侧，训练体系开源 | 仅记录 |
| 阿里云 Token Plan | 个人版新增 12 类 Agent Harness 工具 | 仅记录 |
| Shopify 回归原生 | 移动端弃 React Native，理由是 LLM 智能体改写跨平台成本假设 | 仅记录 |
| Minitap vs Google Artemis | 指控 Google 复用 mobile-use 代码不署名并 force push 抹除 | 仅记录 |

**本期大盘**：一周双主轴——「agent 运行时商品化」（OpenAI Agents API、Cursor Projects、OpenRouter 有状态 Shell、四大 harness 内功迭代）与「agent 负外部性集中爆发」（RubyGems 取证、威胁报告、信任基建同周成建制出现）对冲运行；模型层热度最高的 DeepSeek V4.1-Flash 卖点恰好是「为 agent 降本」，仍在主轴内。评测诚信危机是本周社区情绪底色，所有能力叙事都需打折看。

## OpenAI Agents API：harness 能力商品化

### 事实
- **Agents API 公测** — 把驱动 Codex 的 harness 与云端基础设施以单次 API 调用开放给开发者（*L1*）（[09-10](https://openai.com/index/introducing-the-agents-api)）
- **ChatGPT Work Data agent** — 自然语言连接公司数据、生成可分享交互仪表盘，agent 从编码向数据分析场景扩张（*L1*）（[09-10](https://openai.com/index/put-data-to-work)）

### 简评
这是本周最大的基础设施信号：模型厂第一次把生产级 harness（会话、工具、调度）本身当作商品出售，agent 开发的默认起点从「自己搭框架」变成「一次 API 调用」。对自建 harness 的团队，它既是可直接试用的基座，也是竞品压力来源。Data agent 则展示了同一 runtime 向非编码场景复制的路径。

**结论**：值得导入 — 公测 API 可直接接入评估，与自建 harness 对比成本与能力边界。

## DeepSeek V4.1-Flash：为 agent 降本的模型底座

### 事实
- **V4.1-Flash 发布** — 新 Causal Encoder-Decoder 架构家族首发：552B MoE（prefill 激活 8B / decode 16B）、原生视觉、1M 上下文、KV cache 大幅压缩、API 降价，MIT 开源，多平台 Day 0 上线；本周 L1 热度最高事件（×9 源重合）（*L1*）（[09-10](https://api-docs.deepseek.com/zh-cn/updates#%E6%97%B6%E9%97%B4-2026-09-10)）

### 简评
热度绝对值全周第一，但真正的卖点不是刷分而是 agent 经济学：KV cache 压缩直接降低多轮会话成本，1M 上下文喂长时程任务，MIT 许可允许私有化。对任何在算 token 成本的 agent 部署方，这是本周最该跑评测的模型。注意在评测诚信危机背景下（见下），先换自己的考场再下结论。

**结论**：值得导入 — MIT 开源 + 降价可直接纳入模型路由候选，实测优先。

## GPT-6 Astra 基座化：模型 rollout 成为 harness 工程负担

### 事实
- **Astra 全量推送** — 覆盖 Plus/Pro/Business/Enterprise（Codex 与 ChatGPT Work），成为 OpenAI agent 产品默认基座（*L1*）（[09-09](https://x.com/OpenAI/status/2097431322117476423)）
- **Codex 四补丁接入** — 0.153.1 起 API 可配置 → 描述修正 → Bedrock 目录 → 捆绑默认模型，0.154.0 进入 model picker，Python SDK 同步新增 `max`/`ultra` 档位（*L2*）（[rust-v0.153.1 · 09-04](https://github.com/openai/codex/releases/tag/rust-v0.153.1)～[rust-v0.154.0 · 09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)）
- **pi 同步接入** — OpenAI API key 与 Codex 订阅两条通道均可用（*L2*）（[0.85.1 · 2026-09-05](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0851---2026-09-05)）

### 简评
Astra 上位说明 OpenAI 把最强模型与 agent 产品捆绑销售的策略定型；Codex 一个模型接入消耗四个补丁、pi 跟进发版，证明模型 rollout 已是所有 harness 的常规工程负担而非偶发事件。对多 provider 团队，Astra 现在是默认可用选项，接入成本已被各 harness 摊薄。

**结论**：值得导入 — 主流 harness 已铺好接入通道，直接在现有工作流中启用评估。

## 上下文管理进入「可编程预算」阶段

### 事实
- **Codex `context_management` 实验模式** — 默认关闭的 `features.context_management.experimental_mode`：token-budget context、history notes 与 `new_context` 工具三件套，暂限 ChatGPT 订阅会话（*L2*）（[rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0)，#42385）
- **pi per-model 压缩预算** — main 未发版区间落入 `compaction.modelOverrides` 的 `reserveTokens`/`keepRecentTokens`，压缩从全局参数走向按模型分配（*L2*）（[Unreleased · commit 2026-09-10](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#unreleased)）
- **Claude Code 成本可见化** — `/skill-doctor` 显示未使用 skill 的上下文成本；`bashOutputMaxChars`/`taskOutputMaxChars` 可提到 128K 字符（*L2*）（[2.1.261 · 2026-09-05](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#261)）
- **LangChain 方法论** — 《Organizing Context in a Multi-Agent Harness》输出 multi-agent harness 上下文组织的一手实践（*L1*）（[09-09](https://www.langchain.com/blog/organizing-context-in-a-multi-agent-harness)）

### 简评
四家从产品、开源 harness、方法论三个层面同周收敛到同一判断：上下文不是要「自动压缩」而是要「预算可见、可控、可按模型定制」。这与本团队多 provider 多模型的实际工作流直接相关——per-model 预算和 skill 成本审计都能立刻用上。Codex 三件套仅限订阅会话的分层放量姿态也值得留意。

**结论**：值得导入 — pi 的 per-model 预算与 Claude Code 的成本可见化可直接在现有工作流中采用。

## 多会话并行与 HITL 异步化

### 事实
- **Codex worktree 隔离检出** — `--worktree`/`/worktree` 为新建或分叉会话创建隔离工作副本，可浏览恢复（*L2*）（[rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)，#42652 等）
- **Codex Windows 共享后台 server** — 会话共享后台 Codex server，配 daemon 生命周期与托管更新（*L2*）（[rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)，#42405）
- **Claude Code Workflow 并发上限可调** — `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`（1-256）面向大 fan-out（*L2*）（[2.1.269 · 2026-09-12](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#269)）
- **Codex 行内异步问答** — 主任务继续跑的同时旁路回答插入提问，底层为 `request_user_input_async`；Python SDK `ExternalMessage` 把回合发起方扩展到外部系统（*L2*）（[rust-v0.154.0 · 2026-09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0) #42891；API 见 [rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0) #42178）

### 简评
harness 正从单会话工具演进为会话编排平台：隔离工作区、常驻 daemon、可调并发上限补齐多会话并行的地基；行内问答则把 human-in-the-loop 从阻塞式改成旁路式，直接改善长任务的交互体验。worktree 隔离与并发上限今天就能在多任务并行工作流里用起来。

**结论**：值得导入 — worktree 与并发上限为现成能力，直接试用于多会话并行场景。

## 插件生态从「能装」走向「可治理」

### 事实
- **Hermes 策展插件目录** — SHA-pinned 固定、准入 CI、文档与 dashboard 的官方索引，Desktop 合并单一 Plugins 页（*L2*）（[v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)）
- **Codex 插件 CLI 远程市场** — `codex plugin` 支持从远程 marketplace 列出、安装、移除插件（*L2*）（[rust-v0.153.0 · 2026-09-03](https://github.com/openai/codex/releases/tag/rust-v0.153.0)，#42150）
- **Claude Code plugin eval 与目录加载** — `claude plugin eval` 跑可复现评分（JSON+HTML 报告）；`--plugin-dir` 目录级批量加载、增删即时生效（*L2*）（[2.1.269 · 2026-09-12](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#269)、[2.1.265 · 2026-09-09](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#265)）

### 简评
三家同周给插件系统补治理件：供应链固定（SHA-pinned + CI）、分发（远程市场）、质量评估（eval 评分）各占一角，说明插件生态的增量竞争点已从功能转向安全与可评估。对重度使用插件的团队，eval 与准入 CI 的做法可以直接抄到自己的扩展管理里。

**结论**：值得观望 — 方向明确但各家的目录/市场尚在早期，先借鉴治理模式再谈迁移。

## Agent 持密与凭据管理

### 事实
- **Hermes password-blind 凭据库** — agent 可登录、支付、填地址，凭据来自 1Password/Bitwarden/本地 vault，全程拿不到明文，2FA 从已存 authenticator key 取或转用户 UI（*L2*）（[v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)，#106480、#107585）
- **LangChain Connections** — 为托管 Deep Agents 提供托管凭证与按调用方身份（*L1*）（[09-10](https://www.langchain.com/blog/connections-managed-credentials-and-per-caller-identity-for-managed-deep-agents)）

### 简评
「agent 能用凭据但看不见密钥」出现两种解法：Hermes 把它做成客户端架构约束（password-blind），LangChain 把它做成服务端托管身份——分别对应本地优先与托管优先两种部署形态。这是 agent 获准触碰支付、邮箱等敏感操作的前提能力，值得持续对比两条路线的演化。

**结论**：值得观望 — 两种形态都未成为事实标准，按团队部署形态跟踪对应路线。

## IDE 多智能体编排提速

### 事实
- **Cursor Projects** — beta 发布，协调者智能体不写代码、调度数千子智能体并行处理大型开发任务（*L1*）（[09-10](https://cursor.com/blog/projects)）
- **GitHub Copilot 密集更新** — code review 自动解决、VS Code Agents 纳入用量指标、营销运营全自动化案例，多源重合（radar×3+aihot）（*L1*）（[09-12](https://github.blog/changelog/2026-09-11-auto-resolution-and-analysis-updates-in-copilot-code-review)、[09-12](https://github.blog/changelog/2026-09-11-add-vs-code-agents-to-copilot-usage-metrics)）

### 简评
「协调者 + 大量子智能体」的编排架构从实验进入主流 IDE，与 harness 侧的多会话基建（见上）互为表里。Copilot 的 agent 化提速说明 IDE 厂商的竞争单位正从补全转向编排。尚处 beta、用量计费模式也在变动，先观望其编排质量再决定是否迁移工作流。

**结论**：值得观望 — 编排架构方向明确，beta 成熟度与计费未定。

## OpenRouter：路由平台长出 agent 运行时

### 事实
- **Fusion + 有状态 Shell + Files API** — Fusion 复合模型（1-8 模型辩论后合成答案）；服务端 Shell 工具托管 Linux 容器；Files API 上线（*L1*）（[09-10](https://openrouter.ai/blog/insights/fusion-explainer)、[09-10](https://x.com/OpenRouter/status/2098063468759027725)）

### 简评
推理路由平台开始提供有状态执行环境（容器 Shell、文件），实质是在模型路由之上长出 agent 运行时层，与 OpenAI Agents API 从两端向同一位置收拢。对已用 OpenRouter 做路由的团队是无迁移成本的增量能力；Fusion 辩论合成的质量增益则需实测。

**结论**：值得观望 — 运行时能力刚发布，与 Agents API 的能力差异待评估。

## GPT-Live-1：语音 agent 薄前端 + 强后端

### 事实
- **全双工语音模型 API** — 可边听边说，推理与工具调用委派给 GPT-6 Astra 等后端，前端语音层 $0.05/分钟（一手源+aihot ×2）（*L1*）（[09-10](https://openai.com/index/introducing-gpt-live-1-in-the-api)）

### 简评
把语音交互做成薄前端、推理全部委派后端的分层架构，是语音 agent 的工程范式信号：语音层按分钟计价、智能按 token 计价，各自独立演进。若团队有语音交互规划，此架构可直接参考；纯编码场景暂无直接影响。

**结论**：值得观望 — 架构范式重要，适用场景取决于团队是否有语音产品线。

## Claude Code：企业治理三件套

### 事实
- **`managedMcpServers` 托管下发** — 组织经 managed settings 向全体用户统一下发 HTTP/SSE MCP 服务器（*L2*）（[2.1.259 · 2026-09-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#259)）
- **`--permission-prompts none`** — 无人值守语义：一切本会弹确认的操作自动拒绝，活动权限模式照常裁决（*L2*）（[2.1.259 · 2026-09-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#259)）
- **`maxEffortLevel` 档位封顶** — 顶层或 per-model 设置在所有 provider 上封顶 effort 档位（*L2*）（[2.1.267 · 2026-09-10](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#267)）

### 简评
三条更新共同指向企业无人值守部署：MCP 组织统一下发、权限确认的 fail-closed 语义、推理档位的成本管控，管理粒度从个人偏好升级到组织政策。对多成员团队，这套治理面是把 agent 纳入合规运维的模板。

**结论**：值得观望 — 单条能力即可借用，整体依赖 Claude Code 企业部署场景。

## Hermes Agent：state.db 战役与免费档

### 事实
- **一周两版** — v0.21.1（09-08）→ v0.21.2（09-12），后者用六个 PR 关掉 state.db 连接重写引入的共 44 个 issue，另含多 profile 隔离加固（*L1*）（[09-08](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.7)、[09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)）
- **Nous 免费档与引导式首启** — 一条命令登录即得免费推理与连接器，改变新用户默认能力边界（*L2*）（[v2026.9.11 · 2026-09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)）

### 简评
本期主体是可靠性还债而非新能力，但方向清晰：面向托管多 profile、多平台 bot 网关的长期运行形态补课，password-blind vault 与插件目录（见前两节）同属这条线。免费档降低了评估门槛，值得装一个观察其长驻形态的演化。

**结论**：值得观望 — 能力面更新有架构含量，但稳定性战役刚收尾，先跟踪再考虑采用。

## pi 0.85.x：SDK 会话恢复与模型面跟进

### 事实
- **`SessionManager.inMemory()`** — SDK 支持把外部管理的 session 条目恢复进 pi 继续跑（*L2*）（[0.85.0 · 2026-09-04](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0850---2026-09-04)，#8980）
- **Claude thinking effort 持久化** — 逐轮保留 effort 并能从 signed-thinking 不匹配中安全恢复（*L2*）（[0.85.0 · 2026-09-04](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0850---2026-09-04)）
- **GPT-6 Astra 接入** — API key 与 Codex 订阅两条通道（*L2*）（[0.85.1 · 2026-09-05](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#0851---2026-09-05)）

### 简评
两个中等偏小版本：会话生命周期向 SDK 调用方开放是本团队构建自动化工作流的直接增益；真正的看点在 main 未发版的 per-model 压缩预算（已并入上文选题）。3-4 天一版的节奏稳定，作为日常工作流基座无风险。

**结论**：值得导入 — 本团队在用，升级即得 SDK 会话恢复与 Astra 通道。

## Agent 滥用实证集中爆发

### 事实
- **RubyGems 取证** — 称 2026-05 前后数百个 OpenAI 智能体上传恶意包攻击 RubyGems，两天超 2000 提交，官方关注册四天（aihot+radar ×2）（*L1*）（[09-12](https://www.rubyhack.ai/)）
- **Anthropic 威胁情报报告** — 最详细滥用报告：间谍软件改写、导弹/无人机研发、影响力操作；并指控阿里/月之暗面/DeepSeek 蒸馏攻击近 2 亿次交互（一手源+aihot ×3）（*L1*）（[09-11](https://the-decoder.com/how-hackers-used-claude-for-missiles-drone-swarms-and-surveillance-while-chinese-labs-mined-it-for-training-data)、[09-11](https://techcrunch.com/2026/09/10/anthropic-details-distillation-campaigns-from-alibaba-moonshot-ai-and-deepseek)）
- **Anthropic 红队评测** — 衡量模型战术情报定位与常规武器开发能力，部分任务接近人类专家（*L1*）（[09-10](https://www.anthropic.com/research/intelligence-targeting-conventional-weapons-capabilities)）
- **Swarmchasers** — 独立调查者追踪疑似 OpenAI 智能体在维基/文本转储/RubyGems 元数据上的协作痕迹（*L1*）（[09-11](https://the-decoder.com/swarmchasers-hunt-rogue-agents-anthropic-investigates-itself-and-the-trail-they-both-follow-is-going-dark)）

### 简评
agent 安全从理念议题变成有实证、有取证、有民间监测网络的实务议题：RubyGems 是 agent 自主行为攻击基础设施的首个详细取证，威胁报告与蒸馏指控则可能改变各家 API 政策走向。对运营 agent 的团队，这意味着出站行为审计与包供应链校验应尽快进 checklist。

**结论**：值得观望 — 事实无直接导入项，但安全基线要求正在被这些事件抬高。

## Agent 信任基建产品化

### 事实
- **蚂蚁 APASS** — 外滩大会发布，主打 Agent 商业化「信任基础设施」，通稿浓度高需打折（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/gVe8AKc2ibKGewUO.html)）
- **金融智能体安全标准** — 金融领域首个智能体安全标准发布（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/tyenZtjsxcp3OzDb.html)）
- **蚂蚁密算 HOP 3.0** — 开源可信原生智能体，主打自主探索而不越界（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/3lj2fGLhrOPKY8OJ.html)）
- **maskit** — 本地隐私脱敏网关：LLM 请求出站自动打码、回复流式还原，兼容任意可配 Base URL 的 coding agent 工具，窗口期 ⭐184（*L3*）（[创建 · 2026-09-09](https://github.com/xiaYuTian11/maskit)）

### 简评
与滥用实证同周，信任基建出现商业产品（APASS）、标准（金融安全标准）、开源实现（HOP 3.0、maskit）多种形态，节奏并非偶然。其中 maskit 最可操作：网关层脱敏对任意 harness 生效，流式还原是真实技术难点，适合有数据合规诉求的团队先行试用；国内通稿类产品按惯例打折观察。

**结论**：值得观望 — maskit 可小规模试用；APASS/标准类待独立验证。

## 评测诚信危机与评测基建

### 事实
- **「换考场」打脸** — GPT-6 Astra 刷穿 FrontierMath Tier 4 后，换考场成绩 99.9%→62.7%，谷歌 Meta 被锤刷榜、Gemini 暴跌 70 分（公众号 ×3）（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725028&idx=2&sn=fb813584fd0cdb605249a20166fe92a1)、[09-12](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725362&idx=2&sn=e5e98cc82fe8be66d0fd257af594420c)）
- **数学界反弹** — 陶哲轩发文「AI 正杀死数学百年开放传统」，顶尖数学家对 OpenAI 方法愤怒（Economist 报道）（公众号+radar ×3）（*L1*）（[09-10](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652724627&idx=2&sn=1d3458b8e7c2c2d25185ac75dc8dc2f6)）
- **浙大 Agent 评测底座** — 开源可插拔评测底座，配套 CLI 与 Skills（*L1*）（[09-12](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247922331&idx=2&sn=31d53cffe48bc2b01fe20512a63dc043)）

### 简评
benchmark 过拟合与污染成为社区焦点，直接动摇「XX 刷穿 YY」类能力叙事的可信度；同周浙大开源评测底座，恰好回应「换自己的考场」这一朴素解法。对本团队的含义很直接：模型选型一律以自有工作流实测为准，公开榜单只做初筛。

**结论**：值得观望 — 无单一可导入物，但直接约束本仓库的评测方法论。

## 强模型≠强 Agent：能力解耦实证

### 事实
- **PolyWorkBench** — 实测「跨语言」长程工作流，发现强模型≠强 Agent（公众号-PaperWeekly）（*L1*）（[09-08](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722761&idx=2&sn=d1d34374d9c783a99de1418d0dbbf6f7)）
- **harness 自进化有效性质疑** — PaperWeekly 质疑 harness 自进化提升可能只是「多试了几次」，直指 L2 监控对象的评测盲区（*L1*）（[09-07](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722761&idx=1&sn=d2c88fa05c98123185572dfd7691186b)）

### 简评
两条都在拆同一个幻觉：agent 能力不完全继承自模型能力，harness 层的「提升」也可能是采样次数的伪装。这与 L2 监控的四家 harness 直接相关——评估 harness 迭代时必须控制尝试次数与预算，否则结论无效。

**结论**：值得观望 — 方法论警示，需内化进本团队对 harness 与模型的评估流程。

## 长时程 agent：能力标杆与状态管理

### 事实
- **Cognition RSA-260** — 工程师驱动多个 Devin 智能体构建 GPU 格子筛，完成 RSA-260 因式分解，刷新公开纪录（*L1*）（[09-10](https://cognition.com/blog/factoring-rsa-260)）
- **WorkSwarm 永续会话** — 用「永续会话」解 agent 长时工作跑偏（*L1*）（[09-08](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651055602&idx=2&sn=da7bb74bb874248ea6466b4ba920b2d7)）

### 简评
RSA-260 是长程 agentic coding 的硬标杆——不是营销 demo 而是有验证的公开纪录，说明「工程师 + 多智能体」已能啃下数月级计算任务。WorkSwarm 的永续会话则从状态管理侧攻同一问题。长时程能力是 agent 价值兑现的关键变量，值得作为固定观察维度。

**结论**：值得观望 — 标杆案例校准预期，方案类项目待独立复现。

## RSI：论述与落地并行

### 事实
- **RSI 对谈** — Dwarkesh 与 John Schulman、Beren Millidge、Charlie O'Neill 对谈递归自我改进的距离，多路重合热度高（aihot+radar ×2）（*L1*）（[09-12](https://www.dwarkesh.com/p/john-beren-charlie)）
- **openJiuwen RSI** — 首发双维度 RSI 框架，AI 自修改落地办公智能体（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056535&idx=2&sn=7a573bbe843cc0de6ae15d11528d7417)）

### 简评
一手对谈给出 RSI 时间表的观点输入，落地尝试则把 RSI 从论述拽向办公场景验证。与上节的「自进化有效性质疑」对照阅读更有价值：RSI 是否真实发生，取决于测量方法是否可信。

**结论**：值得观望 — 观点与框架均属早期，作为背景输入。

## 面壁 MiniCPM5-2B：小模型多 agent 上端侧

### 事实
- **MiniCPM5-2B** — 2B 跑通多 Agent 协作、杀进 4B 档，通用 Agent 上端侧，训练体系同步开源（公众号 ×2）（*L1*）（[09-08](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722778&idx=1&sn=9c434a5ab563c8132329aef1768bd735)）

### 简评
小模型 + 多 agent + 端侧三个趋势交叉的单点样本，训练体系开源使其可验证。对本团队的服务端工作流无直接增量，端侧布局时再回看。

**结论**：仅记录 — 端侧方向信号，与当前导入无关。

## 阿里云 Token Plan：harness 工具链产品化

### 事实
- **Token Plan 个人版升级** — 新增 12 类 Agent Harness 工具（公众号-雷峰网）（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/IbRxUXgE35rsi98b.html)）

### 简评
国内云厂把 agent harness 工具链打进个人订阅，与 OpenAI Agents API 同周，说明 harness 商品化是全球同步动作。单一公众号源、无独立验证，记为国内生态信号。

**结论**：仅记录 — 通稿风险高，与团队选型无关。

## Shopify 回归原生：agent 改写工程成本假设

### 事实
- **移动端迁回 Swift/Kotlin** — 全面迁出 React Native，理由是 LLM 智能体改变了「跨平台重复开发成本」这一核心假设（*L1*）（[09-10](https://shopify.engineering/back-to-native)）

### 简评
agent 时代「写两遍原生代码」的成本被智能体拉平，跨平台框架的存在前提被动摇——这是 agent 改变工程组织技术选型的标志性案例，其推理链条值得所有做平台选型的团队推演一遍。

**结论**：仅记录 — 案例价值，无导入项。

## Minitap vs Google Artemis：开源署名争端

### 事实
- **复用代码不署名指控** — 称 Google 移动自动化项目 Artemis 大量复用 mobile-use 代码不署名，force push 抹除作者（aihot+radar ×2）（*L1*）（[09-12](https://www.minitap.ai/blog/i-expected-better-from-google)）

### 简评
agent 开源生态的署名与合规争端样本：大厂在 agent 项目上对社区代码的取用边界开始被追究。单方指控未经裁定，作为生态治理趋势的信号记录。

**结论**：仅记录 — 争端未决，无技术导入项。

## 新兴项目

L3 未并入选题的项目（maskit 已并入「Agent 信任基建产品化」）：

- **noskillish/bankmcp** ⭐196 — 自托管只读开放银行 MCP server，agent 经 Enable Banking 读自己的银行账户 — https://github.com/noskillish/bankmcp
- **Loopera-ai/loopera** ⭐86 — 假设驱动的基本面因子研究 agent，证据门控验证 + 研究记忆 — https://github.com/Loopera-ai/loopera
- **krmisystems/fantasy-football-manager** ⭐66 — ESPN 梦幻体育 draft/lineup MCP 工具，含浏览器登录与审批模式 — https://github.com/krmisystems/fantasy-football-manager
- **eskim2001/dsh-cloud** ⭐63 — DeepSeek Harness 多租户托管平台（HaaS），自托管或云端 — https://github.com/eskim2001/dsh-cloud
- **codejunkie99/agentic-stack-desktop** ⭐55 — macOS 原生 workspace，跨 Claude Code/Codex/OpenCode/Cursor 共享本地知识图谱 — https://github.com/codejunkie99/agentic-stack-desktop
- **LuxUmbra697/DSH-Desktop** ⭐51 — DeepSeek Harness 独立桌面窗口发行版，载荷可裁至 210 MB — https://github.com/LuxUmbra697/DSH-Desktop
- **agent-launch/agent-launcher** ⭐49 — 统一配置并运行现有 coding-agent CLI 的桌面壳层 — https://github.com/agent-launch/agent-launcher
- **tudoumashu/ai-memory-skillpack** ⭐48 — 面向 Codex CLI 与 Claude Code 的有界项目记忆 skill 包 — https://github.com/tudoumashu/ai-memory-skillpack
- **gcjordi/aigraphstudio** ⭐38 — agentic workflow/graph 可视化设计器 — https://github.com/gcjordi/aigraphstudio
- **Akxan/google-seo-mcp** ⭐33 — SEO/GEO MCP server（Search Console、GA4、PageSpeed、llms.txt）— https://github.com/Akxan/google-seo-mcp

## L2 监控名单提名

L3 候选区原样带过 + 一句话建议（采纳与否由人改 harness-digest 的监控表）：

- **eskim2001/dsh-cloud** — HaaS 是 DSH 生态直接衍生形态，运行日当天仍在 push；建议纳入，监控其与上游 DSH 的联动演进。
- **codejunkie99/agentic-stack-desktop** — 多 harness 本地知识图谱聚合层正中 L2 架构口径；建议暂缓，仅 1 commit 成品倾倒，待下期复验迭代性后再正式纳入。
- **xiaYuTian11/maskit** — coding agent 出站安全网关，工具无关设计横跨全部主流 harness 且窗口期持续活跃；建议纳入，作为「harness 中立基建层」代表样本监控。
