📡 Agent 技术周报速览 · 09-11～09-20

四家 coding agent 工具在连续两周空窗后集中发版，主线是长会话省 token（缓存保温）和权限安全收紧。GitHub 这边 skills 内容单品集体退潮，接棒的是代码评审工具和并行 agent 基建。

👉 值得看 / 试（3 条）
1. pi 0.86.0（09-19 发布）
   - 是什么：整包更新——prompt 缓存保温（工具跑久了也不让缓存凉掉）、按模型分别设压缩预算、会话中途改指令不再丢缓存，另加 /bug 诊断上报。
   - 怎么用：长会话、多模型混用场景直接升级就有收益；自己写过扩展的注意两处不兼容改动（user_bash 出错即中止等）。
2. Claude Code 2.1.271～278（09-15～09-19 八版连发）
   - 是什么：权限分类器定局服务端（不收分类器费用）、MCP 客户端升 v2、支持读 AGENTS.md、claude.ai 账号的技能和插件自动同步到终端。
   - 怎么用：自动更新即得；项目指令可以统一写 AGENTS.md，让多个工具读同一份。
3. alibaba/open-code-review（本周 +15,028 星登顶周榜）
   - 是什么：阿里开源的代码评审工具，确定性规则打底 + LLM Agent 补语义，内置多语言安全规则集（注入 / XSS / 线程安全等），兼容 OpenAI / Anthropic 模型。
   - 怎么用：挑一两个仓库跑一次评审、和现有流程对比，合适再进 CI；项目今年 5 月才建，先小范围验证。

👀 值得观望（4 条）
- Codex 0.155（09-18）：上了实验性 /voice 语音对话和 macOS Touch ID 验证 MCP 请求，亮点都在实验开关或平台限定后面，随升级体验即可。
- 并行 agent 基建（orca / worktrunk / firstmate）：多 agent 并行干活的外围工具层成形，与 Codex 的任务治理同向，但各家都年轻，先看着。
- skills 生态换血：内容型 skill 退潮（上期第一的 i-have-adhd 周增 -67%），工程化 skills 库（agent-skills，97.1k 星）和 Anthropic / OpenAI 官方插件入口接棒。
- ECC：跨 harness 的性能优化层持续高热（本周 +6,265 星），但单人仓库扛 263k 星，维护风险没解。

🔥 GitHub 本周热门（按周星增）
- 本周风向：榜单大换血——skills 单品退潮，混合架构代码评审和并行 agent 基建接棒。
- humanizer 本周 +3,024 星（⭐50.3k）：去 AI 写作痕迹的 skill，热度微退
- hyperframes 本周 +2,498 星：写 HTML 渲染视频、给 agent 用，环比 -51% 退潮中
- context-mode 本周 +1,359 星（⭐23.7k）：工具输出沙箱化 + 会话记忆 + 17 平台路由

📋 仅记录（3 条）
- Hermes v0.21.3（09-15）：338 个 PR 打包的修复版，能力级内容欠到 v0.22.0 的文档再说。
- Agent-Reach：CLI 让 agent 零 API 费读 / 搜 Twitter、Reddit、GitHub、B 站、小红书，应用层工具，留档。
- Tencent/WeKnora：文档→RAG→agent→Wiki 知识平台，周增 ×3.7 走量，license 非标准，先看着。

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-20.md
