📡 Agent 技术周报速览 · 09-06～09-12

本周一句话：agent 运行时开始被当商品卖（OpenAI 把驱动 Codex 的整套 harness 开放成公测 API），同周 agent 的安全债集中爆雷（RubyGems 遭智能体集群攻击取证）；热度最高的 DeepSeek V4.1-Flash 卖点恰好是「为 agent 降本」。

👉 值得看 / 试（6 条）
1. OpenAI Agents API——驱动 Codex 的 harness 连同云端基础设施以单次 API 调用开放公测，自建 agent 基座多了官方选项
2. DeepSeek V4.1-Flash——新架构家族首发，KV cache 压缩 + 1M 上下文，直击 agent 部署成本
3. GPT-6 Astra 基座化——全量推送成为 OpenAI agent 产品默认基座，模型 rollout 已是 harness 常规工程负担
4. 上下文管理进入「可编程预算」——Codex / pi / Claude Code / LangChain 四家同周把上下文从自动压缩推向预算化，自建 harness 可抄思路
5. 多会话并行与 HITL 异步化——Codex worktree 隔离会话 + Windows 常驻 server、Claude Code 并发上限可调、行内旁路问答
6. pi 0.85.x——SDK 会话恢复 + GPT-6 Astra 接入；main 分支押注 per-model 压缩预算

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
