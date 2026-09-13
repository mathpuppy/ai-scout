📡 Agent 技术周报速览 · 09-06～09-12

本周一句话：各家开始把 agent 的底层框架当服务卖——OpenAI 把驱动 Codex 的整套系统开放成了公测 API；同周 agent 惹的祸也集中曝光，RubyGems 遭智能体集群攻击、留下完整取证。热度最高的 DeepSeek V4.1-Flash，卖点正是给 agent 省钱。

👉 值得看 / 试（6 条）

1. OpenAI Agents API 公测（09-10）
   - 是什么：驱动 Codex 的整套框架 + 云端设施，打包成一个 API 对外开放；同日还发了 Data agent，用自然语言连公司数据、生成可分享的仪表盘
   - 对我们：第一次有模型厂把成熟的 agent 框架当产品卖，搭 agent 的起点从「自己写框架」变成「一次调用」；公测可直接接入，跟自建方案比比成本和能力边界

2. DeepSeek V4.1-Flash（09-10）
   - 是什么：新架构首发——552B 混合专家模型、能看图、100 万 token 上下文、KV 缓存大幅压缩、API 降价、MIT 开源；9 个信息源同报，本周热度第一
   - 对我们：解决的是 agent 的成本问题——多轮对话更便宜、长任务放得下、开源可私有部署；可以进选型名单实测（这周评测造假风波多，先拿自己的任务跑一遍再下结论）

3. GPT-6 Astra 成为 OpenAI 默认模型（09-09）
   - 是什么：向所有付费档全量推送，成为 OpenAI 各 agent 产品的默认模型；Codex 连发四个补丁完成接入（0.153.1→0.154.0），pi 0.85.1 同步跟上
   - 对我们：模型和 agent 产品捆绑销售的模式定型；各家工具都已接好，在现有工作流里直接开起来评估就行

4. 上下文管理转向「按预算控制」（Codex 0.153.0 / pi main / Claude Code 2.1.26x / LangChain）
   - 是什么：Codex 出实验模式三件套（token 预算 + 历史摘要 + new_context 工具，暂限订阅会话）；pi 在做按模型分别设预算；Claude Code 能显示每个 skill 占多少上下文、输出上限可提到 128K 字符；LangChain 发了多 agent 上下文组织的方法论
   - 对我们：四家同一周走到同一个方向——上下文用量看得见、可设上限、可按模型分别设；pi 的按模型预算和 Claude Code 的成本显示，现有工作流里就能直接用

5. 多会话并行 + 边干活边提问（Codex 0.154.0 / Claude Code 2.1.269）
   - 是什么：Codex 支持 worktree 隔离（每个会话一份独立工作副本）、Windows 上有常驻后台服务；Claude Code 的子 agent 并发上限可调（1-256）；Codex 提问不再打断主任务
   - 对我们：coding agent 正在从单会话工具变成会话编排平台；worktree 和并发上限是现成功能，多任务并行的场景今天就能用上

6. pi 0.85.x（09-04 / 09-05 两版）
   - 是什么：外部程序管理的会话可以直接恢复进 pi 接着跑（SDK 新接口）；Claude 的 effort 档位逐轮保留；接入 GPT-6 Astra（API key 和 Codex 订阅两条通道）
   - 对我们：我们团队在用的基座，升级就有；main 分支正在做的「按模型设压缩预算」下期发版，值得盯

👀 值得观望（13 条）
- 插件生态走向规范管理：版本锁定、准入检查、远程市场、质量评分工具，三家同周发布
- agent 用密码但看不到明文：Hermes「密码盲」凭据库与 LangChain 托管凭据两条路线
- IDE 编排提速：Cursor Projects 一个协调者调度数千子 agent；Copilot 密集更新
- OpenRouter 也做起运行环境：多模型组合调用 + 服务端 Shell + 文件 API
- GPT-Live-1 语音模型：能同时听说的语音层 + 背后调 GPT-6 推理，$0.05/分钟
- Claude Code 企业管理三件套：组织统一下发 MCP、无人值守自动拒绝高危操作、推理档位可设上限
- Hermes Agent：主体在修稳定性（一周关掉 44 个 issue），新增免费档
- agent 滥用有了实锤：RubyGems 攻击取证、Anthropic 威胁报告与蒸馏指控、民间监测组织出现
- agent 信任产品扎堆：APASS、金融安全标准、HOP 3.0、开源脱敏网关 maskit 同周出现
- 评测造假风波：换个测试集成绩从 99.9% 掉到 62.7%；浙大开源评测底座
- 模型强 ≠ agent 强：实测发现两者会脱节；部分「自我改进」效果被质疑只是多试了几次
- 超长任务：多智能体协作完成 RSA-260 因式分解刷新纪录；WorkSwarm 用「永续会话」治长任务跑偏
- 递归自我改进（RSI）：对谈给出时间表预期；openJiuwen 把框架落到办公 agent

📋 仅记录（4 条）
- 面壁 MiniCPM5-2B：2B 小模型跑通多 agent 协作并上端侧，训练体系开源
- 阿里云 Token Plan：个人版新增 12 类 Agent 工具
- Shopify 弃 React Native 回归原生：理由是 AI 智能体把重复开发成本拉平了
- Minitap 指控 Google Artemis：复用其开源代码不署名，还用 force push 抹除痕迹

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-12.md
