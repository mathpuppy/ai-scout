📡 Agent 技术周报速览 · 09-07～09-13

本周最热闹的不是产品：Anthropic 的 Dario 发文要全行业放慢前沿、给第三方评估者常驻访问权限，OpenAI 的 Altman 马上跟进——安全检查可能从论文论述变成固定制度。技术面上，上下文管理有了成套方法，agent 省钱路线出了两个能直接抄的模式。

👉 值得看 / 试（4 条）

1. 上下文工程有了成套方法（09-09 / 09-13）
   - 是什么：LangChain 讲了多 agent 系统里上下文怎么组织；另一篇拆出长任务防上下文溢出的四招——按预算卸载、压缩、todo 状态复述、跨会话记忆
   - 对我们：四家工具同方向在途（Codex 实验模式、pi 按模型设压缩预算还没发版），这套框架现在就能拿来检查自己的工作流

2. 小模型边干活边求助，成本降 96%（09-11～09-13）
   - 是什么：小模型学会「什么时候该向上求助」，成本降 96% 性能反超大模型；LlamaIndex 的文档处理同一思路——便宜解析器粗读全文，只对相关页面调贵模型精读；配套的 Mooncake 日均处理万亿 token、KV 缓存命中率破 90%
   - 对我们：两个模式（分级求助、按需精读）可以直接搬进自己的 agent 管线省钱

3. DeepSeek V4.1 Flash 实测续报（09-10～09-11）
   - 是什么：评测 40 分超过 V4 Pro 成新旗舰；实测缓存命中时输入降价 7 倍，v4-pro 将强制路由
   - 对我们：用 API 的多轮 agent 场景可进选型实测（评测造假风波没平，先拿自己的任务跑一遍再定）

4. OpenAI Agents API 公测（09-10）
   - 是什么：驱动 Codex 的整套框架加云端设施打包成一个 API；同日的 Data agent 能用自然语言连公司数据、出交互仪表盘
   - 对我们：公测可直接接入，跟自建方案比一比成本和能力边界

👀 值得观望（9 条）
- 治理转向：Dario 发文《We Must Pace the Frontier》要放慢前沿，Altman 跟进，两家都承诺给第三方评估者员工级常驻访问；Anthropic 同周出了最详细的滥用报告（导弹软件、无人机蜂群、蒸馏指控）
- GPT-6 Astra 绑定越来越深：全量推送后 Perplexity 把端到端准确率交给它托管，金融垂直版上线（带可溯源引用）
- 评测诚信：Astra 刷穿 FrontierMath 后换考场 99.9%→62.7%；Real-SWE 用私企代码库做基准，是对评测污染的首个规模化回应
- AI4AI/RSI 落地：阿里浙大 Astar、首篇综述、openJiuwen 办公智能体，从对谈走向框架
- 多 agent 编排产品化：Cursor Projects 一个协调者调度数千子 agent；OpenRouter Fusion 并行问 1-8 个模型、比较后合成答案
- GPT-Live-1：能同时听说的语音层，推理和工具调用交给后端模型，$0.05/分钟
- agent 失效与取证：Bengio 发文《agent 为何说谎、作弊、协作》；RubyGems 遭智能体攻击的取证、民间监测组织 Swarmchasers 都在延续
- Augment 软件工厂复盘：需求/工单/PR/生产四环节部署 agent，人均产出增 4.5 倍
- 「harness 中立」配套层成型：脱敏网关 maskit、银行只读 bankmcp、统一启动器、记忆 skill 包连续第二周扎堆，高星榜中文社区项目近半

🆕 GitHub 新项目（本周新建、星标快涨）
- 本周风向：不造新 agent、专给现有工具做配套（启动/托管/记忆/脱敏）的项目连续第二周扎堆
- loopera ⭐136：假设驱动的金融研究 agent（假设→证据验证→研究记忆），本周增速第一
- Baize ⭐68：国产多后端 AI Coding Agent CLI，工具/技能/子代理/压缩/沙箱全齐
- dsh-cloud ⭐63：DeepSeek Harness 的自托管多用户云平台，一周 48 commits
- jolo ⭐30：agent 编码工作区（桌面+CLI+共享任务），一周 72 commits 高强度开发

📋 仅记录（2 条）
- Harness 四强空窗蓄力：Claude Code 2.1.270 纯修 bug、Codex 0.155 两天 8 个 alpha 后转静默、pi 停更 8 天、Hermes 正常周节拍；三家的下个大版本都可能挤在下期窗口
- 国内速览：蚂蚁 APASS 信任设施、金融智能体安全标准、阿里云 Token Plan 加 12 类 harness 工具、清华教育 agent 半年百万门课；另有 Minitap 指控 Google 复用其代码不署名

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-13.md
