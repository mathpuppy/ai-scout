📡 Agent 技术周报速览 · 09-06～09-12

本周一句话：agent 运行时开始被当商品卖（OpenAI 把驱动 Codex 的整套 harness 开放成公测 API），同周 agent 的安全债集中爆雷（RubyGems 遭智能体集群攻击取证）；热度最高的 DeepSeek V4.1-Flash 卖点恰好是「为 agent 降本」。

👉 值得看 / 试（6 条）

1. OpenAI Agents API 公测（09-10）
   - 是什么：驱动 Codex 的整套 harness + 云端基础设施以单次 API 调用开放；同日的 ChatGPT Work Data agent 用自然语言连公司数据、生成可分享仪表盘
   - 对我们：模型厂首次把生产级 harness 当商品卖，agent 起点从「自己搭框架」变「一次调用」；公测可直接接入，与自建 harness 对比成本与能力边界

2. DeepSeek V4.1-Flash（09-10）
   - 是什么：新架构家族首发——552B MoE（prefill 激活 8B / decode 16B）、原生视觉、1M 上下文、KV cache 大幅压缩、API 降价、MIT 开源；本周热度第一（9 个源同报）
   - 对我们：卖点是 agent 经济学——多轮会话成本、长时程上下文、可私有化三项全中，直接进模型路由候选实测（评测诚信风波下，先换自己的考场再下结论）

3. GPT-6 Astra 全量基座化（09-09）
   - 是什么：全量推送到 Plus/Pro/Business/Enterprise，成为 OpenAI agent 产品默认基座；Codex 用四个补丁（0.153.1→0.154.0）完成接入，pi 0.85.1 同步跟进
   - 对我们：最强模型与 agent 产品捆绑销售定型，接入成本已被各 harness 摊薄；现有工作流里直接启用评估即可

4. 上下文管理进入「可编程预算」（Codex 0.153.0 / pi main / Claude Code 2.1.26x / LangChain）
   - 是什么：Codex 实验模式三件套（token 预算 + history notes + new_context 工具，暂限订阅会话）；pi 走 per-model 压缩预算；Claude Code 让 skill 上下文成本可见、输出上限可提至 128K 字符；LangChain 出多 agent 上下文组织方法论
   - 对我们：四家同周收敛到「上下文要预算可见、可控、按模型定制」；pi 的 per-model 预算与 Claude Code 成本可见化在现有工作流可直接采用

5. 多会话并行与 HITL 异步化（Codex 0.154.0 / Claude Code 2.1.269）
   - 是什么：Codex worktree 隔离检出（每会话独立工作副本）+ Windows 常驻后台 server；Claude Code 子 agent 并发上限可调（1-256）；Codex 行内旁路问答，主任务不停
   - 对我们：harness 正在变成会话编排平台；worktree 与并发上限是现成能力，多任务并行场景今天就能用

6. pi 0.85.x（09-04 / 09-05 两版）
   - 是什么：SessionManager.inMemory() 让 SDK 调用方把外部 session 恢复进 pi 续跑；Claude effort 持久化；GPT-6 Astra 双通道接入
   - 对我们：本团队在用的基座，升级即得；main 分支押注的 per-model 压缩预算下期发版值得盯

👀 值得观望（13 条）
- 插件生态治理化：SHA-pinned 目录、准入 CI、远程市场、plugin eval，一周三家齐发
- Agent 持密与凭据管理：Hermes「密码盲」vault 与 LangChain Connections 两种「用而不见」解法
- IDE 多智能体编排提速：Cursor Projects 一个协调者调度数千子 agent；Copilot agent 化密集更新
- OpenRouter 长出 agent 运行时：Fusion 复合模型 + 有状态服务端 Shell + Files API
- GPT-Live-1 语音分层：全双工语音薄前端 + 强推理后端，$0.05/分钟
- Claude Code 企业治理三件套：托管 MCP 下发、无人值守权限语义、effort 档位封顶
- Hermes Agent 本期迭代：state.db 修复战役收尾，免费档改变默认能力边界
- Agent 滥用实证爆发：RubyGems 取证、Anthropic 威胁报告与蒸馏指控、Swarmchasers 民间监测
- Agent 信任基建产品化：APASS、金融安全标准、HOP 3.0 与开源脱敏网关 maskit 同周出现
- 评测诚信危机：「换考场 99.9%→62.7%」打脸 AGI 叙事；浙大开源评测底座
- 强模型 ≠ 强 Agent：PolyWorkBench 实证能力解耦，harness 自进化被质疑「多试几次」
- 长时程 agent：RSA-260 因式分解刷新纪录；WorkSwarm 永续会话治长时跑偏
- RSI 论述与落地：Dwarkesh 对谈时间表；openJiuwen 双维度框架落地办公智能体

📋 仅记录（4 条）
- 面壁 MiniCPM5-2B：2B 跑通多 Agent 协作并上端侧，训练体系开源
- 阿里云 Token Plan：个人版新增 12 类 Agent Harness 工具
- Shopify 回归原生：移动端弃 React Native，理由是 LLM 智能体改写跨平台成本假设
- Minitap vs Google Artemis：指控复用 mobile-use 代码不署名并 force push 抹除

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-12.md
