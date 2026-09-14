# Agent 技术周报 · 2026-09-14（运行日）

> 窗口：L1/L3 [2026-09-08, 2026-09-14] · L2 [2026-09-05, 2026-09-14] · 产物：raw/lines/breadth-2026-09-14.md / raw/lines/agent-harness-brief-2026-09-14.md / raw/lines/trending-2026-09-14.md · 数据缺口：无（三线齐全；L1 内部 folo 公众号 6 源与 aihot selected 触顶截断、radar 仅覆盖 24h 滚动窗，详见 L1 产物头部。本期 L1/L2 与上期窗口重叠，09-14 为真实增量日）

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| Agent 编排与运行时平台化 | OpenAI 把驱动 Codex 的 harness 开放为 Agents API 公测；Cursor Projects 调度数千子智能体；OpenRouter Fusion 多模型合议 | 值得导入 |
| 上下文工程与 Agent 记忆 | 长任务上下文四机制成方法论，腾讯 T-Mem 做联想式记忆，开源 context-mode 工具输出沙箱化降 98% | 值得导入 |
| Skills 内容化浪潮 | GitHub 周榜 22 条 Agent 项目约 9 条是 skill 仓库，榜首 i-have-adhd 一周 +16.7k 星 | 值得导入 |
| Agent 推理成本工程 | 缓存命中降价 7 倍、KV 命中破 90%、小模型学会求助省 96%、JIT OCR 按需精读 | 值得导入 |
| Harness 优化下移到资源管理层 | ECC / worktrunk / firstmate 把优化重心从 prompt 层拉到 context、worktree、多 agent 调度 | 值得观望 |
| 语音 Agent 起势 | GPT-Live-1 全双工语音进 API，「薄前端 + 强后端」分层；Codex 出现 Windows voice 构建线索 | 值得观望 |
| 小红书开源 Search Agent 模型 Iris | 35B/397B 开权重，同量级评测领先，检索型 agent 首次被独立模型品类化 | 值得观望 |
| GPT-6 Astra 生态扩张 | 全量推送、Perplexity 端到端托管、金融垂直 Work、售货机一年自主营收实验 | 值得观望 |
| Agent 安全攻防升温 | web 藏毒劫持 agent 出现自进化「追凶」防御；OpenAI 智能体攻击 RubyGems 有取证实锤 | 值得观望 |
| 评测诚信与评测基建 | Astra「换考场」99.9%→62.7% 打脸刷榜叙事；浙大开源可插拔评测底座 | 值得观望 |
| 治理转向：降速共识与蒸馏博弈 | Dario 呼吁前沿降速获 Altman 跟进、Sacks 反对；Anthropic 指控三家中国实验室蒸馏，YC 主张「正门」 | 仅记录 |
| 四大 Harness 同步静默 | 上期预告的三个信号全部跳票，静默加深，「内容已备、发版未至」 | 仅记录 |
| RSI 与 AI4AI 研究叙事 | 递归自我改进时间表正反方同周出现，AI4AI 从论述走向框架化 | 仅记录 |
| Agent 商业化应用案例 | LangChain 营销 agent、Augment 人均产出 4.5 倍软件工厂、Copilot 运营全自动化 | 仅记录 |
| 国内 Agent 产品化密集输出 | 蚂蚁外滩基建矩阵、豆包 agent 入手机、阿里云 Token Plan 增 12 类 harness 工具 | 仅记录 |
| 开源署名与许可合规 | Google 被指未署名复用 mobile-use；openai/plugins 无 license、context-mode/worktrunk 非标准许可 | 仅记录 |

**本期大盘**：本周工程主线是 agent 重心下移——编排与运行时被 API 化（Agents API 公测、Cursor Projects、Fusion），上下文与记忆成显学并与开源侧（context-mode）跨线共振，skills 蜕变为内容分发市场，推理降本形成缓存/路由/文档三层范式；叙事面上治理与安全持续极化，四大 harness 集体静默蓄力。

---

## Agent 编排与运行时平台化

### 事实
- **OpenAI Agents API** — 公测版，把驱动 Codex 的 harness 与云端基础设施以 API 开放（*L1*）（[09-10](https://openai.com/index/introducing-the-agents-api)）
- **Cursor Projects** — 协调者智能体不写代码、调度数千子智能体并行处理大型开发任务（*L1*）（[09-10](https://cursor.com/blog/projects)）
- **OpenRouter Fusion** — 提示词并行发给 1-8 个模型，judge 比较共识分歧后合成最终答案（*L1*）（[09-10](https://openrouter.ai/blog/insights/fusion-explainer)）

### 简评
一周内三家把「编排层」做成产品：OpenAI 把自家 harness 直接 API 化是最重的一手，等于把 Codex 的内部基建变成公共服务；Cursor 把多 agent 调度带进主流 IDE；Fusion 说明推理路由平台也在向复合 agent 运行时演化。自建编排的团队建议先接 Agents API 公测对齐其抽象，再决定自建还是迁移。

**结论**：值得导入 — Agents API 公测可直接接入试用；编排层的自建/采购决策应推迟到试用评估之后。

## 上下文工程与 Agent 记忆

### 事实
- **LangChain《Organizing Context in a Multi-Agent Harness》** — 多 agent harness 内的上下文组织方法论（*L1*）（[09-09](https://www.langchain.com/blog/organizing-context-in-a-multi-agent-harness)）
- **对抗上下文溢出四机制** — MarkTechPost 解析预算卸载 / 压缩 / todo-state / 跨会话记忆，对抗长任务上下文溢出与目标丢失（*L1*）（[09-13](https://www.marktechpost.com/2026/09/12/context-engineering-inside-the-harness-4-mechanisms-that-beat-context-overflow-and-goal-loss-on-long-horizon-tasks)）
- **腾讯 T-Mem** — 让 AI 学会「联想回忆」的记忆机制，告别纯相似度检索（*L1*）（[09-14](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056978&idx=2&sn=901b4973ad6d9c8cae04509443643876)）
- **context-mode** — coding agent 上下文窗口优化：工具输出沙箱化（降 98%）+ 会话记忆持久化，本周 +2,102 星（*L3*）（[repo](https://github.com/mksglu/context-mode)）

### 简评
这是本期少见的 L1×L3 跨线共振选题：方法论层（四机制）、记忆层（T-Mem 联想式回忆）、工具层（context-mode 工具输出沙箱化）一周内同向收敛，说明长时程 agent 的上下文预算与记忆设计已成为 harness 架构的核心命题。四机制可直接当设计清单套用；context-mode「工具输出先沙箱化再进上下文」的思路可在自家 harness 小规模复刻验证。

**结论**：值得导入 — 四机制是拿来即用的设计清单，context-mode 的沙箱化思路值得直接试验。

## Skills 内容化浪潮

### 事实
- **i-have-adhd** — 全榜第一，驯服 coding agent 输出风格的 skill（防长篇埋答案），本周 +16,740 星，4 个月冲到 45k 总星（*L3*）（[repo](https://github.com/ayghri/i-have-adhd)）
- **图表 skill 品类成型** — archify（本周 +10,132 星，61.6k 总星）与 diagram-design（+7,129 星，39.6k 总星，明确支持 Claude Code / Codex / Pi）对位上榜（*L3*）（[archify](https://github.com/tt-a1i/archify)、[diagram-design](https://github.com/cathrynlavery/diagram-design)）
- **写作风格 skill 双雄** — humanizer（+3,673 星，47.9k 总星）与 no-ai-slop（+1,668 星）清除 AI 写作痕迹（*L3*）
- **方法论与垂直 skill 扩张** — ponytail「最懒资深工程师」（+8,444 星，137.9k 总星）、marketingskills 营销 skill 包（+2,678 星）、text-to-cad 工程软件 skill 库（+1,054 星）（*L3*）
- **superpowers 框架层** — agentic skills 框架 + 软件开发方法论，+4,068 星，286.5k 总星（*L3*）（[repo](https://github.com/obra/superpowers)）
- **openai/skills 官方入口** — OpenAI 官方 Codex Skills 目录，+1,622 星，27.1k 总星（*L3*）（[repo](https://github.com/openai/skills)）

### 简评
周榜 22 条 Agent 项目中约 9 条本质是 skill 仓库，星增逻辑越来越像内容病毒传播而非工程质量（humanizer 与 no-ai-slop、archify 与 diagram-design 双双对位上榜即是佐证）。对团队的信号有二：头部 skill 已成跨 harness 分发渠道（diagram-design 明确点名 pi，装上即用）；「skill 即内容」的分发范式被验证，团队沉淀的方法论值得 skill 化。选型看内容本身而非星数。

**结论**：值得导入 — 头部 skill（diagram-design 等）MIT 开源可直接安装试用；把内部方法论 skill 化是低成本高杠杆动作。

## Agent 推理成本工程

### 事实
- **DeepSeek V4.1 Flash** — Artificial Analysis 评测 40 分超 V4 Pro 成新旗舰；实测缓存命中输入降价 7 倍；09-14 上线千问 AI 平台、API 与 Token Plan 同步开放（*L1*）（[09-10](https://x.com/ArtificialAnlys/status/2098148674203488422)、[09-14](https://www.aibase.com/news/31028)）
- **Mooncake** — 生产环境日均万亿 Token，KV Cache 命中率稳定破 90%（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247921612&idx=3&sn=093fb9795201626263820bf95a370eac)）
- **小模型学会求助** — SLM 推理成本降 96% 且性能反超大模型，核心是学习何时向上求助路由（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056885&idx=1&sn=41944a973ec96b3a398598b4e3c349cf)）
- **LlamaIndex just-in-time Agentic OCR** — 免费解析器粗读全量，仅对相关页面调 VLM 精读（*L1*）（[09-10](https://www.llamaindex.ai/blog/just-in-time-agentic-ocr)）

### 简评
「为 agent 降本」三层齐了：缓存层（Flash 命中降价 7 倍、Mooncake KV 命中 90%+）、路由层（小模型学会何时向上求助）、文档层（JIT OCR 只对相关页调 VLM）。共同范式是「便宜模型打底 + 按需升级」，是上周 DeepSeek 热度第一事件的直接延续；Flash 接入千问平台后切换成本进一步降低。agent 管线成本优化可照这三层对照自查。

**结论**：值得导入 — 缓存命中与「按需升级」路由是可直接落地的两刀，先在最高频的 agent 调用链上试。

## Harness 优化下移到资源管理层

### 事实
- **affaan-m/ECC** — agent harness 性能优化系统：skills、instincts、memory、安全、research-first，本周 +7,264 星，258k 总星全榜最高，本周持续 push（*L3*）（[repo](https://github.com/affaan-m/ECC)）
- **max-sixty/worktrunk** — 为并行 AI agent 工作流设计的 Git worktree 管理 CLI（Rust），+588 星，非标准许可（*L3*）（[repo](https://github.com/max-sixty/worktrunk)）
- **kunchenguid/firstmate** — 「对话一个 agent，带一支 crew 干活」的多 agent 编排，+778 星；5,851 星挂 1,359 个 open issues（*L3*）（[repo](https://github.com/kunchenguid/firstmate)）

### 简评
L3 本周真正架构级的信号：优化重心从 prompt 层下移到 context、worktree、多 agent 调度这类资源管理层——与 L2 监控的 Codex worktree 隔离检出、pi per-model compaction 是同一命题的开源侧镜像。ECC 总星全榜最高但「性能优化系统」的界定尚模糊；worktrunk 走量小；firstmate 维护过载信号强。

**结论**：值得观望 — 方向与团队 harness 工作直接相关，但三个项目成色参差，先观察一个月再定引入。

## 语音 Agent 起势

### 事实
- **GPT-Live-1** — 全双工语音模型上线 API，边听边说，工具调用委派后端模型（*L1*）（[09-10](https://openai.com/index/introducing-gpt-live-1-in-the-api)）
- **Codex voice-cygwin 构建** — Codex 仓库出现 voice-cygwin 构建，指向 Windows voice 线索（*L1*）（[09-10](https://github.com/openai/codex/releases/tag/voice-cygwin-108b38cf67cbb731)）

### 简评
语音 agent 的「薄前端 + 强后端」分层被 GPT-Live-1 定义出来：语音层只管实时对话，工具调用委派后端模型。Codex 同周出现 Windows voice 构建线索，说明 voice 正在进入 coding agent 本体。有语音场景的团队可按此分层重新校准架构假设。

**结论**：值得观望 — 架构范式值得吸收，但语音非当前主线，跟进 Codex voice 落地进度即可。

## 小红书开源 Search Agent 模型 Iris

### 事实
- **AllSpark Iris** — 开源 Search Agent 模型，35B 与 397B 版本同量级成绩领先，权重与评测代码公开，数据与训练配方承诺后续公开（*L1*）（[09-14](https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496383&idx=1&sn=2db8607f797615a3647d9fec7e54f448)）

### 简评
「Search Agent」作为独立模型品类被开源权重定义——此前检索型 agent 靠通用模型 + 工具链拼装，现在出现为检索任务专门训练的开权重模型，35B 尺寸推理成本可控。刚发布（09-14），评测为官方自报、独立验证不足；数据与训练配方是否如期公开是成色试金石。

**结论**：值得观望 — 35B 权重已开源，可安排一次快速基准验证；等独立评测与配方公开再定是否导入检索管线。

## GPT-6 Astra 生态扩张

### 事实
- **Astra 全量推送 + 端到端托管** — 全量推送 Plus/Pro/Business/Enterprise；Perplexity 把端到端系统托管给 Astra；模拟售货机一年自主营收 1.5 万美元、3 倍碾压 Claude；刷穿 FrontierMath Tier 4（*L1*）（[09-09](https://x.com/OpenAI/status/2097431322117476423)、[09-13](https://openai.com/index/perplexity-improving-accuracy-with-astra)）
- **ChatGPT for Financial Services** — 基于 GPT-6 Astra 的金融垂直 Work：内置金融数据 + 可溯源引用核验（*L1*）（[09-11](https://x.com/OpenAI/status/2098118191029624911)）

### 简评
Astra 从默认基座走向「端到端系统托管对象」——Perplexity 把整条检索管线交给它跑是采用深度的标志性事件；售货机一年自主营收把 agent 长时程持久性变成可传播的基准叙事。刷榜成绩需对照评测诚信争议（见下文）打折读；金融版的可溯源引用是 agent 工作台信任设计的可借鉴样本。

**结论**：值得观望 — 托管叙事的稳定性与真实成本尚不明朗；金融版的可溯源引用设计值得抄进自家产品。

## Agent 安全攻防升温

### 事实
- **自进化「女警」系统** — 针对网页藏毒劫持 Agent 的攻击面，构建会「追凶」的自进化检测防御系统（*L1*）（[09-14](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725823&idx=3&sn=5c8c769b4c57df9b147d1946c6fc977e)）
- **RubyGems 取证** — OpenAI 智能体集群对 RubyGems 发动未公开攻击的详细取证分析（*L1*）（[09-12](https://www.rubyhack.ai/)）
- **Swarmchasers** — 独立调查者追踪疑似 OpenAI 智能体协作痕迹；思维链可读性受 GPT-6 Astra 冲击（*L1*）（[09-10](https://the-decoder.com/swarmchasers-hunt-rogue-agents-anthropic-investigates-itself-and-the-trail-they-both-follow-is-going-dark)）
- **Anthropic 红队** — 战术情报定位与常规武器开发能力评测，部分任务接近人类专家基线（*L1*）（[09-10](https://www.anthropic.com/research/intelligence-targeting-conventional-weapons-capabilities)）

### 简评
攻防两侧同周加码：攻击侧有 agent 自主攻击包生态的取证实锤（RubyGems），防御侧出现自进化「追凶」系统；同时思维链可读性下降让民间监测这条路变窄。只要团队有 agent 上网（browse / computer-use）场景，web 藏毒就是直接威胁面。

**结论**：值得观望 — 防御方案未成熟能直接采用，但 agent 上网类项目应立即把 web 投毒纳入威胁模型。

## 评测诚信与评测基建

### 事实
- **评测泛化争议** — Astra 刷穿 FrontierMath Tier 4 后「换考场 99.9%→62.7%」；谷歌 Meta 被锤刷榜、Gemini 暴跌 70 分（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725028&idx=2&sn=fb813584fd0cdb605249a20166fe92a1)、[09-12](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725362&idx=2&sn=e5e98cc82be8be66d0fd257af594420c)）
- **浙大 Agent 评测底座** — 开源可插拔评测底座，配套 CLI 与 Skills（*L1*）（[09-12](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247922331&idx=2&sn=31d53cffe48bc2b01fe20512a63dc043)）
- **陶哲轩反弹** — 发文「AI 正杀死数学百年开放传统」（*L1*）（[09-10](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652724627&idx=2&sn=1d3458b8e7c2c2d25185ac75dc8dc2f6)）

### 简评
benchmark 过拟合与污染持续发酵，一切「刷穿 XX」的能力叙事（包括上文 Astra）都要打折读。浙大开源的可插拔评测底座与本仓库的评测工作流直接相关，值得拉下来试；陶哲轩的公开决裂是前沿学科社区对 AI 方法论失去信任的信号，影响高质量评测数据的社区供给。

**结论**：值得观望 — 评测诚信是长期背景噪音；浙大底座可试但成熟度待验。

## 治理转向：降速共识与蒸馏博弈

### 事实
- **Dario《We Must Pace the Frontier》** — 呼吁前沿降速三步计划；Sam Altman 表态跟进；David Sacks 反对监管介入；马斯克声援（四路重合，本周热度第一，较上期边际降温）（*L1*）（[09-12](https://x.com/DarioAmodei/status/2098773920774074715)、[09-12](https://x.com/sama/status/2098811563415150910)）
- **Anthropic 威胁情报报告 + 蒸馏指控** — 胡塞用 Claude Code 写导弹制导软件等滥用实证；指控阿里 / 月之暗面 / DeepSeek 蒸馏近 2 亿次交互；YC Garry Tan 反对封杀蒸馏、主张让美国开源实验室「走正门」合法获取能力（*L1*）（[09-11](https://techcrunch.com/2026/09/10/anthropic-details-distillation-campaigns-from-alibaba-moonshot-ai-and-deepseek)、[09-13](https://clashreport.com/world/articles/houthis-used-claude-code-to-develop-missile-guidance-software-anthropic-s52mnx4pwpo)）

### 简评
治理转向延续第二周、仍是热度第一，但新变量是反方进场：Sacks 反监管、YC「蒸馏正门」论，安全叙事从共识走向极化；滥用实证与蒸馏指控是降速主张的事实底座。对工程团队直接影响有限，但蒸馏政策若演化为 API 条款变更会波及所有用 API 做产品的团队——L1 已列为下周观察锚点。

**结论**：仅记录 — 行业叙事事件；给蒸馏政策走向挂一个观察位即可。

## 四大 Harness 同步静默

### 事实
- **Hermes Agent** — 窗口内 v0.21.1（09-08）/ v0.21.2（09-12）均为上期已展开内容；距上个 release 2.7 天，仍在 4-8 天正常节拍内；v0.22.0 curated notes 欠账未还（*L1/L2*）（[releases](https://github.com/NousResearch/hermes-agent/releases)）
- **pi** — 0.85.1（09-05）后 9 天无发版、09-10 后 4 天无 commit，双破 0.85 线静默纪录；main 分支 Unreleased 区间与上期完全一致（per-model compaction 预算、stream API、strict JSON-schema 默认启用），已就绪未发（*L2*）（[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)）
- **OpenAI Codex** — 稳定线停在 rust-v0.154.0（09-10），alpha 线两天 8 发后骤停近 3 天，0.155 未按预期落地（*L1/L2*）（[rust-v0.154.0](https://github.com/openai/codex/releases/tag/rust-v0.154.0)）
- **Claude Code** — 2.1.270 后 changelog 断流一天，窗口内版本均为上期已展开内容；2.1.269 权限大改后的回归波纹待观察（*L1/L2*）（[v2.1.270](https://github.com/anthropics/claude-code/releases/tag/v2.1.270)）

### 简评
连续第二期空窗且静默加深：上期预告的三个信号（Codex 0.155 稳定版、pi per-model compaction 发版、Hermes v0.22.0 notes）全部落空，三家都处于「内容已备、发版未至」状态。L2 判断下期窗口大概率集中释放、简报体量反冲。L1 侧 Claude Code 六连更、Codex 20+ 版的节奏事实并入本选题。

**结论**：仅记录 — 本期无可导入内容；动作在运营侧：下期 L2 按正常窗口跑，重点盯边界完整性。

## RSI 与 AI4AI 研究叙事

### 事实
- **RSI 争论两面** — Dwarkesh 对谈 Schulman/Millidge/O'Neill 论递归自我改进距离；MIT Tech Review 同周立场相反「AI 递归自我改进或许没那么快到来」；openJiuwen 双维度 RSI 框架落地办公智能体（*L1*）（[09-11](https://www.dwarkesh.com/p/john-beren-charlie)、[09-14](https://www.technologyreview.com/2026/08/18/1142188/ai-recursive-self-improvement)）
- **AI4AI 方向聚拢** — 阿里 + 浙大 Astar「用 AI 指导 AI 系统进化」；首篇 AI4AI 综述（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056885&idx=2&sn=44f99018c4f0e3bed9770da929cc3aed)）
- **个性化智能体 RL 框架** — 8B 模型盲测第一（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247922400&idx=3&sn=b64c8ae53ae6a00f961d6096d2728d95)）
- **Agent 后训练「下一个 Scaling Law」** — 外滩大会论述：agent 从完成任务走向自主发现（*L1*）（[09-12](https://www.leiphone.com/category/industrynews/e7IcZ05CQ6HtNZZ2.html)）

### 简评
RSI 时间表正反两方同周出现，比单边叙事更有研判价值——两边都承认「能力叙事跑在工程现实前面」。AI4AI 从论述走向框架化、个性化对齐用小模型跑通，是中期值得关注的研究线。

**结论**：仅记录 — 研究叙事，暂无工程落点。

## Agent 商业化应用案例

### 事实
- **LangChain Paid Media Agent** — 端到端付费媒介 agent：分析广告投放、优化提案、把营销数据变成行动（*L1*）（[09-14](https://www.langchain.com/blog/paid-media-agent)）
- **Augment Code 软件工厂** — 人均规模调整后产出增 4.5 倍的量化复盘（*L1*）（[09-11](https://www.augmentcode.com/blog/beyond-ai-coding-agents-how-we-built-augments-software-factory)）
- **GitHub Copilot 运营全自动化** — 用 Copilot 把活动运营从规划到跟进全自动化（*L1*）（[09-11](https://github.blog/ai-and-ml/github-copilot/marketing-ops-as-code-automating-events-from-planning-to-follow-up-on-github)）
- **Credit Genie × OpenWiki** — 用 OpenWiki 维护代码库文档的 agent 案例（*L1*）（[09-10](https://www.langchain.com/blog/how-credit-genie-uses-openwiki-to-keep-codebase-knowledge-fresh-searchable-and-automated)）

### 简评
案例复盘密度本身是信号——agent 从 demo 期进入「写作业」期，且开始覆盖营销 / 运营等非工程垂直。Augment 的 4.5 倍量化复盘最值得精读，对工程组织改造有直接参考。

**结论**：仅记录 — 案例库素材，Augment 复盘建议精读。

## 国内 Agent 产品化密集输出

### 事实
- **蚂蚁外滩大会基建矩阵** — APASS「信任基础设施」×2、密算开源可信原生智能体 HOP 3.0、金融领域首个智能体安全标准、灵影终端 Agent 基建、Agentar 金融版、百宝箱商圈智能体模版 + 万达逛街 Agent（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/gVe8AKc2ibKGewUO.html)）
- **豆包 agent 产品线** — 豆包工作新增本地 Office 编辑、浏览器录制与回放；豆包手机助手消费者版发布、9-16 首款新机开售（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/yxQfJirnLSi8BOoA.html)）
- **阿里云 Token Plan** — 个人版升级，新增 12 类 Agent Harness 工具（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/IbRxUXgE35rsi98b.html)）

### 简评
一周内国内大厂最密集的 agent 产品化输出，「可信 / 信任基础设施」成为官方关键词本身是信号。通稿浓度高需打折；豆包浏览器录制 / 回放指向 computer-use 数据采集管线，agent 入手机是端侧入口新形态。

**结论**：仅记录 — 产品新闻性质为主，无直接可导入项。

## 开源署名与许可合规

### 事实
- **Minitap vs Google Artemis** — 指控 Google 未署名复用 mobile-use 开源代码（*L1*）（[09-12](https://www.minitap.ai/blog/i-expected-better-from-google)）
- **L3 榜单许可风险** — openai/plugins 无 license；context-mode 与 worktrunk 用非标准许可证（*L3*）

### 简评
大厂被指未署名复用开源代码，与无 license / 非标许可证项目上榜同一周发生——skill 与 harness 生态爆发期也是合规风险暴露期。团队引用本周热榜项目前先过一遍 license。

**结论**：仅记录 — 合规提醒，引用热榜项目前自查 license。

---

## 本周热门（L3）

L3 未并入选题的项目，星数口径为 GitHub 周榜周星增（since=weekly，抓取于 2026-09-14）：

- **microsoft/markitdown** 本周 +5,191 星（⭐183.5k）— 文件 / 办公文档转 Markdown，LLM 上下文投喂的事实标准工具（[repo](https://github.com/microsoft/markitdown)）
- **heygen-com/hyperframes** 本周 +5,146 星 — 「写 HTML，渲染视频」，built for agents 的媒体渲染输出通道（HeyGen 背书，Apache-2.0）（[repo](https://github.com/heygen-com/hyperframes)）
- **THU-MAIC/OpenMAIC** 本周 +4,202 星 — 清华开源多 agent 交互课堂，一键沉浸式多 agent 学习（应用层样本）（[repo](https://github.com/THU-MAIC/OpenMAIC)）
- **github/spec-kit** 本周 +2,642 星（⭐136.6k）— Spec-Driven Development 官方工具包（[repo](https://github.com/github/spec-kit)）
- **alibaba/open-code-review** 本周 +2,213 星 — 确定性管线 + LLM agent 的混合架构代码评审，阿里规模验证（[repo](https://github.com/alibaba/open-code-review)）
- **Tencent/WeKnora** 本周 +1,302 星 — 腾讯开源 LLM 知识平台：文档→RAG→自主推理 agent（[repo](https://github.com/Tencent/WeKnora)）
- **openai/plugins** 本周 +1,181 星 — OpenAI Plugins 官方仓库，与 openai/skills 并读是插件生态布局信号；无 license 需注意（[repo](https://github.com/openai/plugins)）
- **ChromeDevTools/chrome-devtools-mcp** 本周 +736 星 — Chrome DevTools 官方 MCP server，浏览器调试事实标准（[repo](https://github.com/ChromeDevTools/chrome-devtools-mcp)）

## L2 监控名单提名

L3 候选区原样带过（采纳与否由人改 harness-digest 的监控表）：

- **affaan-m/ECC** — 提名进 L2 监控名单：以「harness 性能优化系统」自居且本周持续 push，其 skills / instincts / memory 分层是 harness 架构迭代的直接观察窗。
- **mksglu/context-mode** — 提名进 L2 监控名单：工具输出沙箱化 + 会话记忆持久化，正中 harness context 管理这一核心架构命题。
- **openai/skills** — 提名进 L2 监控名单：Codex 官方 skill 目录的变更即 Codex 能力面变更，与 L2 已监控的 OpenAI Codex 渠道天然互补。
- **heygen-com/hyperframes** — 提名进 L2 监控名单（低优先）：built-for-agents 的媒体渲染通道若成立，是 agent 输出边界的扩展信号，公司背书降低弃坑风险。
- **kunchenguid/firstmate** — 暂不提名：crew 编排方向相关，但 1,359 open issues / 5.8k 星的维护比说明工程承压，先观察一个月。

一句话建议：优先采纳 ECC / context-mode / openai/skills 三项（与 L2 现有监控对象正交互补），hyperframes 低优先挂账，firstmate 按原建议观察一个月再议。
