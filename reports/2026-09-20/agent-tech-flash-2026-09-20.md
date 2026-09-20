📡 Agent 技术周报速览 · 9-11～9-20

四家 coding agent 工具憋了两周后这周集中发版，都在拼两件事：长会话不重算（缓存保温、按模型压缩）和权限更安全（硬件验证、防伪装指令）。GitHub 上 skill 类单品整体退潮，代码评审和并行 agent 的工具接棒；论文圈这周「递归自我改进」（agent 自己改进自己）扎堆成谱系。

👉 值得看 / 试（3 条）
1. Claude Code 八版连发（09-15～09-19，2.1.271→2.1.278）
   - 是什么：五天发八版（09-15～09-19）。权限判断定局走服务端、MCP 客户端升 v2、支持读 AGENTS.md、claude.ai 上启用的技能自动同步到终端、子代理输出不能再伪装成指令。
   - 怎么用：已是用户就自动获得；项目里放一份 AGENTS.md 即可被读到，多工具混用的项目建议直接用起来。
2. pi 0.86.0（09-19 发版）
   - 是什么：开源 harness 的缓存整包——prompt 缓存保温（cache warming）、按模型配压缩预算、会话中途改指令不再丢缓存前缀。
   - 怎么用：升级即得；长会话、多分支导航的用法 token 成本直接下降。
3. agent-skills 生产级 skills 库（97.1k 星）
   - 是什么：Addy Osmani 维护的工程 skills 库，MIT 开源；同周 Anthropic 官方插件库新上榜、OpenAI 官方插件库续榜，Claude Code 也刚开账号级技能同步。
   - 怎么用：挑需要的 skill 直接放进自己的 agent；两家官方仓库当能力风向标看。

👀 值得观望（5 条）
- Codex 0.155：/voice 语音对话进实验通道（要 /experimental 开启）、Touch ID 验证 MCP 请求（限 macOS），方向信号强、即用价值一般，等 0.156。
- 并行 agent 工具层：orca（多 agent 舰队管理，本周 +5.4k）新上榜、worktrunk（worktree 管理 CLI）周增翻倍，跟 Codex 的任务治理面板同向；单体成熟度都还没过线。
- open-code-review：阿里的代码评审工具（确定性规则 + LLM agent），周增 1.5 万星登顶全榜，Apache-2.0 可试用，爆发期成色待看。
- 递归自我改进论文谱系：五篇连发（Atria Dawn 414 票领衔），从模型层铺到 harness 层，方向重要、落地尚早。
- Harness 组件实证：Zoom × 清华 176 组对照实验，拆解 planning / 动作空间 / 上下文管理各自值多少分，自己调 harness 的人可直接对照。

🔥 GitHub 本周热门（按周星增）
- 本周风向：skill 单品整体退潮（上期第一名周增 -67%），更重的工具线接棒。
- ECC 本周 +6,265 星（⭐263k）：agent harness 性能优化系统，跨四家工具通用；单人维护扛 26 万星是隐患
- i-have-adhd 本周 +5,589 星（⭐48.8k）：驯服 agent 输出风格的 skill，上期第一退潮中
- WeKnora 本周 +4,867 星（⭐27.5k）：腾讯的知识平台，文档→RAG→agent→自维护 Wiki
- Agent-Reach 本周 +3,914 星（⭐83.5k，新建）：一个 CLI 让 agent 直接读 Twitter / Reddit / B 站 / 小红书，零 API 费
- humanizer 本周 +3,024 星（⭐50.3k）：去 AI 写作痕迹的 skill

📄 本周论文（HF 热榜 · 权威机构）
- Occamy-1.0（UIUC〔模型判读〕 · upvotes 91）：开源 35B co-work agent 模型，主打能力-成本平衡
- XConf（Cambridge · upvotes 56）：用历史经验记录给 agent 输出校准置信度
- ProgramDistill（Microsoft Research · upvotes 49）：从能跑的网页应用蒸馏出 4 千多个可回放验证的编程任务

📋 仅记录（1 条）
- Hermes v0.21.3：338 个 PR 打包的修复版，能力级内容欠到 v0.22.0 curated notes（已连欠两版），下期窗口大概率落地。

细节与出处（版本 / 日期 / 链接）：reports/2026-09-20/agent-tech-brief-2026-09-20.md
