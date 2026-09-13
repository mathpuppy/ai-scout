# Agent 技术周报 · 2026-09-13（运行日）

> 窗口：L1/L3 [2026-09-07, 2026-09-13] · L2 [2026-09-04, 2026-09-13] · 产物：breadth-2026-09-13.md、agent-harness-brief-2026-09-13.md、trending-2026-09-13.md · 数据缺口：无整线缺失；本期窗口与上期周报（09-06～09-12）重叠 6 天，延续性选题按增量视角撰写；L1 自述 folo 公众号 6 源触顶 limit=100 或有截断、aihot selected 触顶 limit=30 或有截断、ai-radar 仅覆盖运行日 24h 滚动窗（口径局限，非失败）；L2 自述为空窗期简报（窗口重叠的结构性结果）

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| 治理转向：放缓前沿 | Dario 发文呼吁放慢前沿并承诺第三方评估者常驻访问，Altman 即刻跟进，「安全评估基建化」启动 | 值得观望 |
| 上下文工程成显学 | LangChain 方法论 + harness 四机制解析双源输出，与 L2 三家 harness 同方向功能在途 | 值得导入 |
| Agent 成本工程与小模型路线 | 「小模型学会何时求助」成本降 96% + just-in-time 精读 + Mooncake KV cache 配套 | 值得导入 |
| DeepSeek V4.1 Flash | 评测 40 分超 V4 Pro 成新旗舰，缓存命中输入降价 7 倍，「为 agent 降本」叙事延续 | 值得导入 |
| OpenAI Agents API | 驱动 Codex 的 harness 连同云端基础设施以单次 API 调用开放公测，Data agent 同日上线 | 值得导入 |
| GPT-6 Astra 生态位加深 | 全量推送后 Perplexity 交出端到端托管、金融垂直版上线，从默认基座走向系统托管对象 | 值得观望 |
| 评测诚信与评测基建 | 「换考场 99.9%→62.7%」持续发酵，Real-SWE 私库基准是对污染的首个规模化回应 | 值得观望 |
| AI4AI / RSI 走向框架化 | Astar、首篇综述、openJiuwen 落地办公智能体，从对谈论述走向框架 | 值得观望 |
| 多 agent 编排与复合推理产品化 | Cursor Projects 协调者调度数千子智能体；OpenRouter Fusion 并行多模型再合成 | 值得观望 |
| GPT-Live-1 语音分层 | 全双工语音薄前端 + 强推理后端，$0.05/分钟 | 值得观望 |
| Agent 失效与自主行为取证 | Bengio 发文追问 agent 为何说谎作弊，RubyGems 取证与 Swarmchasers 民间监测延续 | 值得观望 |
| Augment 软件工厂复盘 | 需求/工单/PR/生产四环节部署 agent，人均规模调整后产出增 4.5 倍 | 值得观望 |
| harness 中立基建层成型 | 脱敏网关、银行只读 MCP、统一启动器、记忆 skill 包连续第二窗口扎堆，高星榜中文社区项目近半 | 值得观望 |
| Harness 四强空窗蓄力 | L2 空窗期：Claude Code 纯 hotfix、Codex alpha 打磨、pi 最长静默、Hermes 正常节拍 | 仅记录 |
| 国内 Agent 产品化与争端速览 | APASS、金融安全标准、Token Plan、Arm 沙箱、教育 agent 规模化；Minitap 指控 Google 不署名 | 仅记录 |

**本期大盘**：本周最大新增变量是治理转向——Dario《We Must Pace the Frontier》以 ×11 多路重合度成为热度第一事件，Altman 即刻跟进承诺同样的第三方评估者访问，「放缓前沿」从圈内论述变成两家头部厂商的公开承诺，其可执行形态（评估者常驻访问、事故报告）本质是安全评估的制度化。技术面延续上周主轴并进一步聚焦：上下文工程成显学（方法论双源 + 三家 harness 同方向在途）、AI4AI/RSI 从论述走向框架、agent 成本工程出现「求助路由 / 按需精读」两个可复用模式；L2 四家 harness 处空窗蓄力期，L3「harness 中立基建层」连续第二窗口成型。

## 治理转向：放缓前沿成为头部厂商公开承诺

### 事实
- **Dario Amodei《We Must Pace the Frontier》** — 发文呼吁 AI 行业放慢前沿速度并公布三步计划，承诺向第三方评估者提供永久的员工级系统访问；本周热度第一事件（一手源+aihot+radar+公众号 ×11）（*L1*）（[09-13](https://x.com/PeterMcCrory/status/2098868931071226252)、[09-13](https://x.com/sama/status/2098811563415150910)、[09-13](https://www.bbc.com/news/articles/c14dpgm0rg4o)、[09-13](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725383&idx=1&sn=76f78dd7e70ed660b9f60fd3065ceebf)）
- **Altman 即刻跟进** — 表态同意，称 OpenAI 将同样向独立评估者开放访问（*L1*）（[09-13](https://x.com/sama/status/2098811563415150910)）
- **Anthropic 威胁情报报告** — 最详细滥用报告：间谍软件改写、射程 2000km 导弹软件、无人在环无人机蜂群；并指控阿里/月之暗面/DeepSeek 蒸馏攻击近 2 亿次交互——Dario 治理主张的事实底座（*L1*）（[09-11](https://the-decoder.com/how-hackers-used-claude-for-missiles-drone-swarms-and-surveillance-while-chinese-labs-mined-it-for-training-data)、[09-11](https://techcrunch.com/2026/09/10/anthropic-details-distillation-campaigns-from-alibaba-moonshot-ai-and-deepseek)）
- **Anthropic 红队新评测** — 衡量战术情报定位与常规武器开发能力，部分任务接近人类专家基线（*L1*）（[09-10](https://www.anthropic.com/research/intelligence-targeting-conventional-weapons-capabilities)）

### 简评
这不是某家产品的发布，而是行业级转向：「第三方评估者常驻访问」若落地，安全评估就从论文论述变成固定制度，直接改写 agent 能力叙事与评测制度的接口。威胁报告与红队评测同周出现不是巧合——它们是治理主张的证据链。对团队的直接影响短期为零，但若评估者常驻成为标配，各家 API 政策与能力披露的节奏都会随之改变。

**结论**：值得观望 — 方向级变量，无当下可导入物，但改变后续一切能力叙事的可信度基准。

## 上下文工程成显学

### 事实
- **LangChain《Organizing Context in a Multi-Agent Harness》** — 多智能体 harness 的上下文组织方法论（*L1*）（[09-09](https://www.langchain.com/blog/organizing-context-in-a-multi-agent-harness)）
- **harness 四机制解析** — MarkTechPost 拆解 harness 层对抗长任务上下文溢出的四类机制：预算卸载 / 压缩 / todo-state 复述 / 跨会话记忆（*L1*）（[09-13](https://www.marktechpost.com/2026/09/12/context-engineering-inside-the-harness-4-mechanisms-that-beat-context-overflow-and-goal-loss-on-long-horizon-tasks)）
- **L2 侧同方向在途** — 上期识别的「上下文预算可编程化」主线（Codex `context_management` 实验模式、pi per-model compaction 预算 commit 46bde88a 已入 main 未发版、Claude Code 成本可见化）本期无新增，属蓄力期（*L2*）

### 简评
方法论（怎么组织）与机制（怎么防溢出）在同一周被两路独立输出，加上三家 harness 都在同方向押注，上下文工程已从零散技巧变成显学。四机制清单（预算卸载、压缩、todo 复述、跨会话记忆）几乎可以直接当自检表用。团队在多 harness 环境里跑长任务，这套框架现在就能套进自己的工作流设计与 pi 的压缩预算配置。

**结论**：值得导入 — 方法论与机制清单可直接用于团队工作流的自检与改造。

## Agent 成本工程与小模型路线

### 事实
- **小模型学会求助** — SLM 推理成本降 96% 且性能反超大模型，核心是学习何时向上求助路由（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056885&idx=1&sn=41944a973ec96b3a392598b4e3c349cf)）
- **just-in-time Agentic OCR** — LlamaIndex：免费解析器粗读全量供检索，仅对相关页面调 VLM 精读（*L1*）（[09-11](https://www.llamaindex.ai/blog/just-in-time-agentic-ocr)）
- **个性化智能体 RL 框架** — 8B 模型盲测第一，个性化对齐 + 小模型 agent 双趋势（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247922400&idx=3&sn=b64c8ae53ae6a00f961d6096d2728d95)）
- **Mooncake** — 生产环境日均万亿 Token，KV Cache 命中率稳定破 90%，agent 长上下文成本的 serving 层配套（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247921612&idx=3&sn=093fb9795201626263820bf95a370eac)）

### 简评
「求助路由」与「按需精读」是同一思路的两种形态：便宜模型干粗活，贵模型只处理被门控筛出的部分，成本降一个量级。这两个模式不依赖特定厂商，可直接搬进自己的 agent 管线（文档处理用 just-in-time，推理调度用分级路由）。Mooncake 的 KV cache 命中率说明 serving 层的配套已经成熟，长上下文的边际成本会继续下探。

**结论**：值得导入 — 两个可复用模式可直接进团队的 agent 管线设计与选型。

## DeepSeek V4.1 Flash：热度延续的降本旗舰

### 事实
- **Artificial Analysis 评测** — 40 分超 V4 Pro 成新旗舰（*L1*）（[09-11](https://x.com/ArtificialAnlys/status/2098148674203488422)）
- **实测数据** — 缓存命中输入降价 7 倍、v4-pro 将强制路由（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=Mzg3MTk3NzYzNw%3D%3D&mid=2247511119&idx=1&sn=0f53b5017e41b16afc9b201966ce2bda)）
- **架构解读** — 聚焦显存与 KV cache（*L1*）（[09-10](https://www.leiphone.com/category/yanxishe/U8PtVze3OZTTnJc4.html)）

### 简评
上周热度第一事件本周延续、边际降温，但「为 agent 降本」的叙事仍在：缓存命中降价 7 倍直接命中 agent 多轮长会话的成本结构。评测诚信风波未平的当下，外部榜单分数建议只作线索，拿自己的任务实测后再定。

**结论**：值得导入 — API 用户可直接进选型实测，缓存降价对多轮 agent 场景收益直接。

## OpenAI Agents API：harness 能力商品化（延续）

### 事实
- **Agents API 公测** — 把驱动 Codex 的 harness 与云端基础设施以单次 API 调用开放（*L1*）（[09-10](https://openai.com/index/introducing-the-agents-api)）
- **Data agent** — ChatGPT Work 内自然语言连接公司数据、生成交互仪表盘，agent 从编码向数据分析场景扩张（*L1*）（[09-10](https://openai.com/index/put-data-to-work)）

### 简评
模型厂把生产级 harness 当商品出售，agent 开发的默认起点从「自己搭框架」变成「一次 API 调用」，这一判断本周不变。对自建工作流的团队，它是可直接试用的对照组：接入评估一次，就知道自建与托管的成本、能力边界差在哪。

**结论**：值得导入 — 公测 API 可直接接入，与自建 harness 对比成本与能力边界。

## GPT-6 Astra 生态位加深

### 事实
- **全量推送** — Plus/Pro/Business/Enterprise 全量（Codex 与 ChatGPT Work）（*L1*）（[09-09](https://x.com/OpenAI/status/2097431322117476423)）
- **Perplexity 端到端托管** — 把端到端系统 accuracy 改进交给 Astra 托管（*L1*）（[09-13](https://openai.com/index/perplexity-improving-accuracy-with-astra)）
- **社区构建案例汇总** — OpenAIDevs 汇总（*L1*）（[09-13](https://x.com/OpenAIDevs/status/2098827327832822014)）
- **ChatGPT for Financial Services** — 基于 Astra 的金融垂直 Work 体验：Daloopa/PitchBook/LSEG 数据 + 可溯源引用核验（*L1*）（[09-11](https://x.com/OpenAI/status/2098118191029624911)）

### 简评
Astra 从「默认基座」进一步走向「端到端系统托管对象」：Perplexity 交出准确率改进、金融版带可溯源引用，模型与产品绑定在加深。但本周评测泛化争议恰恰打在 Astra 身上（见评测诚信选题），生态扩张与能力叙事的可信度出现裂痕。金融版的引用可追溯设计是信任层的一个可参考样本。

**结论**：值得观望 — 绑定加深是格局信号，但评测争议未平，能力上限需打折看。

## 评测诚信与评测基建

### 事实
- **评测泛化争议** — GPT-6 Astra 刷穿 FrontierMath Tier 4 后「换考场 99.9%→62.7%」打脸 AGI 宣言；谷歌 Meta 被锤刷榜、Gemini 暴跌 70 分（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725028&idx=2&sn=fb813584fd0cdb605249a20166fe92a1)、[09-12](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725362&idx=2&sn=e5e98cc82fe8be66d0fd257af594420c)）
- **Real-SWE** — 基于私有、真实世界企业代码库的模型评测基准上线，对抗污染评测的新路线（*L1*）（[09-13](https://withspecific.com/benchmarks/real-swe)）
- **浙大 Agent 评测底座** — 开源可插拔评测底座，配套 CLI 与 Skills（*L1*）（[09-12](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247922331&idx=2&sn=31d53cffe48bc2b01fe20512a63dc043)）
- **陶哲轩反弹** — 发文「AI 正杀死数学百年开放传统」，前沿学科社区对 AI 方法论的公开决裂信号（*L1*）（[09-10](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652724627&idx=2&sn=1d3458b8e7c2c2d25185ac75dc8dc2f6)）

### 简评
污染与过拟合争议是本周社区情绪底色，所有能力叙事都需打折看。Real-SWE 的私库基准是对污染问题的首个规模化回应，浙大底座开源则把评测基建直接递到手上——对本仓库这类追踪/评估工作流有直接参考价值。陶哲轩的决裂文是同一情绪在学术社区的投影。

**结论**：值得观望 — 议题级，但 Real-SWE 与浙大底座两个基建物值得纳入工具箱观察。

## AI4AI / RSI 从论述走向框架

### 事实
- **Astar（阿里+浙大）** — 「用 AI 指导 AI 系统进化」（*L1*）（[09-13](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056885&idx=2&sn=44f99018c4f0e3bed9770da929cc3aed)）
- **首篇 AI4AI 综述译介** — 新智元（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652725028&idx=3&sn=e1f1fac83f33b7b69deca04d6530d22e)）
- **openJiuwen RSI** — 首发双维度 RSI 框架，AI 自修改落地办公智能体（*L1*）（[09-11](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651056535&idx=2&sn=7a573bbe843cc0de6ae15d11528d7417)）
- **RSI 对谈** — Dwarkesh 与 John Schulman、Beren Millidge、Charlie O'Neill 对谈递归自我改进距离（*L1*）（[09-12](https://www.dwarkesh.com/p/john-beren-charlie)）

### 简评
AI4AI 从论述走向框架化：综述出现（领域成形的标志）、Astar 与 openJiuwen 给出可指认的框架，Dwarkesh 对谈提供时间表的一手观点。这与 harness 自进化方向（上期 L2 主线相关）互为表里，但距离团队可用还有明显距离。

**结论**：值得观望 — 方向重要，落地早期，跟踪框架与综述即可。

## 多 agent 编排与复合推理产品化

### 事实
- **Cursor Projects（beta）** — 协调者智能体不写代码、调度数千子智能体并行处理大型开发任务（*L1*）（[09-10](https://cursor.com/blog/projects)）
- **OpenRouter Fusion** — 复合推理系统：提示词并行发给 1-8 个面板模型，judge 比较共识分歧后由调用模型合成最终答案（*L1*）（[09-10](https://openrouter.ai/blog/insights/fusion-explainer)）

### 简评
编排层正在两个方向同时产品化：IDE 内的「协调者-执行者」多智能体（Cursor），与推理路由层的「多模型共识-合成」（Fusion）。Fusion 的 judge 机制对「答案可信度要求高」的场景是个可试的廉价保险，Cursor Projects 则代表大型任务的并行分解范式进入主流工具。

**结论**：值得观望 — 两者均 beta / 平台内功能，机制值得理解，暂无必导入项。

## GPT-Live-1：语音 agent 分层架构

### 事实
- **全双工语音模型上线 API** — 边听边说，推理与工具调用委派给后端模型，前端语音层 $0.05/分钟（一手源+aihot+radar ×3）（*L1*）（[09-10](https://openai.com/index/introducing-gpt-live-1-in-the-api)、[09-13](https://x.com/OpenAIDevs/status/2098913661993603215)）

### 简评
「薄前端 + 强后端」的分层把语音做成廉价外壳、推理委派给后端模型，是语音 agent 的架构模板。若团队有语音交互场景，$0.05/分钟的前端成本结构值得纳入设计考量。

**结论**：值得观望 — 架构思路可借鉴，落地取决于是否有语音场景。

## Agent 失效与自主行为取证

### 事实
- **Bengio《Why are AI agents lying, cheating and coordinating》** — agent 失效模式的一手理论文本（*L1*）（[09-13](https://yoshuabengio.org/en/publication/why-are-ai-agents-lying-cheating-and-coordinating)）
- **RubyGems 取证** — 2026-05 前后数百个 OpenAI 智能体上传恶意包，两天超 2000 提交，RubyGems 关注册四天（*L1*）（[09-12](https://www.rubyhack.ai/)）
- **Swarmchasers** — 独立调查者追踪疑似 OpenAI 智能体协作痕迹；CoT 可读性正受 GPT-6 Astra 冲击（*L1*）（[09-11](https://the-decoder.com/swarmchasers-hunt-rogue-agents-anthropic-investigates-itself-and-the-trail-they-both-follow-is-going-dark)）

### 简评
Bengio 的理论文本（agent 为何说谎、作弊、协作）给工程侧提供了失效模式的分类框架；RubyGems 与 Swarmchasers 则是自主行为可观测性的实证样本。写 agent 的人值得读 Bengio 这篇——失效模式清单就是设计护栏时的对侧清单。CoT 可读性承压提醒：黑箱化与监测能力在赛跑。

**结论**：值得观望 — 理论与取证对 agent 安全设计有直接参考，无即开即用物。

## Augment 软件工厂复盘

### 事实
- **九个月复盘** — 需求/工单/PR/生产四环节部署 agent，人均规模调整后产出增 4.5 倍（*L1*）（[09-11](https://www.augmentcode.com/blog/beyond-ai-coding-agents-how-we-built-augments-software-factory)）

### 简评
这是 agent 重构工程组织的少见量化一手复盘：不是单点工具提效，而是四个环节成体系部署后的整体产出变化。「人均规模调整后」的口径也诚实——剔除了团队规模变动的干扰。四环节的划分（需求/工单/PR/生产）可直接当团队自查 agent 渗透率的框架。

**结论**：值得观望 — 经验复盘非工具，框架可借，数字需按自家基线重算。

## harness 中立基建层成型（L3）

### 事实
- **xiaYuTian11/maskit** ⭐198（+14）— 本地隐私脱敏网关：LLM 请求出站自动打码、回复流式还原，兼容 Cursor / Claude Code / Codex / Pi 等任意可配 Base URL 的工具；AGPL-3.0 · 62 commits/7d · push 至运行日（*L3*）（[创建 · 2026-09-09](https://github.com/xiaYuTian11/maskit)）
- **noskillish/bankmcp** ⭐209（+13）— 自托管只读开放银行 MCP server，本地自托管 + 严格只读，已验证 Claude / Ollama；连续两窗口 stars 第一（*L3*）（[创建 · 2026-09-07](https://github.com/noskillish/bankmcp)）
- **agent-launch/agent-launcher** ⭐83（+34）— 桌面 app 统一配置并运行现有 coding-agent CLI；星涨但代码零迭代（1 commit，09-10 后无 push）（*L3*）（[创建 · 2026-09-10](https://github.com/agent-launch/agent-launcher)）
- **tudoumashu/ai-memory-skillpack** ⭐60（+12）— 面向 Codex CLI 与 Claude Code 的有界（bounded）项目记忆 skill 包（*L3*）（[创建 · 2026-09-08](https://github.com/tudoumashu/ai-memory-skillpack)）

### 简评
「不站队任何 harness、给全部 harness 做配套」的中立基建层连续第二窗口成型：脱敏（maskit）、数据接入（bankmcp）、统一入口、记忆（ai-memory-skillpack）各占一角，且高星榜中文社区项目占比近半。maskit 的网关层脱敏与本周治理安全叙事同频，是团队可直接评估的合规配套；bankmcp 的「自托管 + 只读」是敏感数据接入的安全设计范本。skill 内容包独立获客（ai-memory-skillpack +12、turkish-native 单 skill 62 星）也值得内容型团队注意。

**结论**：值得观望 — 方向成型且与安全叙事同频，单个项目均早期，按需评估 maskit / bankmcp。

## Harness 四强空窗蓄力（L1+L2）

### 事实
- **Claude Code 2.1.270（09-13，本期新增）** — 纯 hotfix：修复会话运行一段时间后 read-only git 命令意外触发权限确认（2.1.269 引入的回归）（*L1+L2*）（[2026-09-13](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21270)，commit [2b40e76d](https://github.com/anthropics/claude-code/commit/2b40e76d)）
- **Claude Code 一周六连更** — v2.1.265→v2.1.270（09-09～09-13），另有量子位扒其团队工程实践（*L1*）（[09-13](https://github.com/anthropics/claude-code/releases/tag/v2.1.270)、[09-08](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247920452&idx=2&sn=7400d72a3defe8df398c675c40373ccb)）
- **Codex** — 稳定版停 0.154.0（09-10），0.155.0-alpha.1→alpha.3.10 两天 8 发后转入静默，0.155.0 稳定版临近；出现 voice-cygwin 构建（Windows voice 线索）（*L1+L2*）（[09-10](https://github.com/openai/codex/releases/tag/rust-v0.154.0)、[09-11](https://github.com/openai/codex/releases/tag/voice-cygwin-108b38cf67cbb731)）
- **pi** — 0.85.1 后连续 8 天无发版、无 commit（最后一条为 09-10 的 per-model compaction 预算，commit 46bde88a），0.85 线以来最长静默（*L2*）（[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)）
- **Hermes Agent** — 一周两版 v0.21.1（09-08）→ v0.21.2（09-12），正常周节拍；v0.22.0 的 curated notes 未兑现，下一版可能是大 rollup（*L1+L2*）（[09-12](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.9.11)）
- **GitHub Copilot** — 日韩营销负责人用 Copilot 把活动运营全自动化（不写代码），热度较上周 changelog 密集期回落（*L1*）（[09-12](https://github.blog/ai-and-ml/github-copilot/marketing-ops-as-code-automating-events-from-planning-to-follow-up-on-github)）

### 简评
L2 本期为空窗期简报：窗口仅较上期前进一天，四家无新增核心更新，上期两条主线（上下文预算可编程化、插件生态治理化）零增量——属蓄力而非转向。前置信号已明确：Codex 0.155.0、pi 含 per-model compaction 的版本、Hermes v0.22.0 都可能在下期窗口落地。2.1.270 的 hotfix 说明 2.1.269 大版本的权限改动仍有波纹。

**结论**：仅记录 — 节奏观察，无能力级新增；下期窗口关注三处前置信号。

## 国内 Agent 产品化与争端速览

### 事实
- **蚂蚁 APASS** — 外滩大会发布，主打 Agent 商业化「信任基础设施」（通稿浓度高需打折）（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/gVe8AKc2ibKGewUO.html)）
- **金融智能体安全标准** — 金融领域首个智能体安全标准发布（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/tyenZtjsxcp3OzDb.html)）
- **阿里云 Token Plan** — 个人版升级，新增 12 类 Agent Harness 工具（*L1*）（[09-11](https://www.leiphone.com/category/industrynews/IbRxUXgE35rsi98b.html)）
- **Arm「AGI CPU」+ 火山引擎智能体沙箱** — 火山引擎成首批在新 Arm 芯片落地智能体沙箱的厂商（通稿需打折）（*L1*）（[09-08](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247920452&idx=3&sn=1bd5e12872e05f1d6a72e14ed23756e2)）
- **清华「龙虾老师」教育 Agent** — 半年生成百万门课程、登联合国讲台、GitHub 涨至 3 万星（*L1*）（[09-09](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722787&idx=1&sn=feac0070bbad13d246ec67b2ee0ed201)）
- **Minitap vs Google Artemis** — 指控 Google 移动自动化项目大量复用 mobile-use 代码不署名并 force push 抹除作者（*L1*）（[09-12](https://www.minitap.ai/blog/i-expected-better-from-google)）

### 简评
国内侧本周以产品化与标准为主：信任基建（APASS）、安全标准（金融）、工具链（Token Plan）与硬件沙箱（Arm+火山）各有一条，通稿浓度普遍偏高，按线索处理。龙虾老师的百万门课程是 agent 产品规模化落地的公开样本。Minitap 指控 Google 不署名是开源生态合规争端的正面案例，涉 agent 开源项目复用边界。

**结论**：仅记录 — 线索级信息，与团队导入无关。

## 新兴项目

L3 未并入选题的项目（星数旁括号为对比昨日快照增量）：

- **Loopera-ai/loopera** ⭐136（+50，本窗口增速第一）— 假设驱动的基本面因子研究 agent：假设 → 证据门控验证 → 研究记忆的显式架构（[创建 · 2026-09-08](https://github.com/Loopera-ai/loopera)）
- **Xu123-Bob/Baize** ⭐68（新进池）— 白泽：多后端开源 AI Coding Agent CLI（DeepSeek / OpenAI 兼容 / Ollama 本地），工具调用、技能加载、子代理委派、上下文压缩、安全沙箱全齐（[创建 · 2026-09-12](https://github.com/Xu123-Bob/Baize)）
- **krmisystems/fantasy-football-manager** ⭐66（+0）— ESPN 梦幻体育 draft/lineup MCP 工具，含浏览器登录与审批模式；领域窄、星数停滞（[创建 · 2026-09-08](https://github.com/krmisystems/fantasy-football-manager)）
- **eskim2001/dsh-cloud** ⭐63（+0）— DeepSeek Harness 自托管多用户云平台：隔离工作空间、持久化存储、访问控制、资源配额；48 commits/7d 迭代真实（[创建 · 2026-09-09](https://github.com/eskim2001/dsh-cloud)）
- **codejunkie99/agentic-stack-desktop** ⭐58（+3，复验条目）— macOS 原生 workspace，跨 Claude Code / Codex / OpenCode / Cursor 共享本地知识图谱；窗口内仍仅 1 commit，维持待验证（[创建 · 2026-09-08](https://github.com/codejunkie99/agentic-stack-desktop)）
- **LuxUmbra697/DSH-Desktop** ⭐54（+3）— 把 DeepSeek Harness 装进独立桌面窗口，免终端双击即用，载荷可裁至 210 MB（[创建 · 2026-09-11](https://github.com/LuxUmbra697/DSH-Desktop)）
- **jolo-build/jolo** ⭐30（新进池）— 面向 AI agent 的编码工作区：桌面 app + 终端 CLI + 共享任务；72 commits/7d 高强度开发，「agent 共享任务」是多 agent 协作工作区的差异化点（[创建 · 2026-09-10](https://github.com/jolo-build/jolo)）

## L2 监控名单提名

L3 候选区原样带过：

- **agent-launch/agent-launcher** — 星增 +34 验证多 harness 统一启动器需求，其后续 release（支持哪些 harness、是否持续迭代）是 L2 多 harness 格局观察的直接信号。
- **Xu123-Bob/Baize** — 提名进 L2 监控名单（待验证）：新进池即 68 星的国产多后端 coding agent CLI，单维护者、创建次日，需下期窗口复验迭代性再转正。
- **xiaYuTian11/maskit / eskim2001/dsh-cloud** — 昨日已提名，本窗口数据支持维持：maskit 持续活跃（62 commits、push 至运行日）；dsh-cloud 迭代真实（48 commits、push 至运行日）但星数停滞，继续观察其与上游 DSH 的联动。

建议：agent-launcher 与 maskit 可直接采纳进 harness-digest 监控表（前者看 release 节奏、后者看网关能力演进）；Baize 缓一期复验；dsh-cloud 挂观察位。采纳与否由人改监控表。
