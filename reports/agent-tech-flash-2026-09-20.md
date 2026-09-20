📡 Agent 技术周报速览 · 9-11～9-20

四家 harness 时隔两期同窗集中发版，方向收敛在两条线上：长会话不重算的"缓存经济"，和服务端分类器、Touch ID、防注入这些"权限安全执行"。社区侧 skills 单品整体退潮，接棒的是并行 agent 基建和混合架构 code review，官方迭代和社区风向本周罕见地对齐了。

👉 值得看 / 试（3 条）
1. pi 0.86.0（09-19）
   - 是什么：cache warming 给高价 prompt 缓存保温、按模型配压缩预算、中途改指令不再丢缓存，整包围绕"长会话不重算"。
   - 对我们：升级即得成本收益，注意 user_bash 钩子改 fail-closed，自定义扩展先核查再升。
2. Claude Code 八版连发（2.1.271～278，09-15～09-19）
   - 是什么：权限分类器定局默认服务端、MCP 客户端升 v2、支持 AGENTS.md、子代理输出不可再伪装成指令。
   - 对我们：升级后顺手把项目指令迁到 AGENTS.md，一份配置多工具复用。
3. skills 生态官方工程化
   - 是什么：单品 skill 退潮（i-have-adhd 周增 -67%），Addy Osmani 生产级 skills 库（97k 星）和 Anthropic / OpenAI 官方插件入口起量，Claude Code 还加了账号级技能同步。
   - 对我们：从 agent-skills 库筛一批进团队技能集，官方双入口当生态风向标盯。

👀 值得观望（3 条）
- 并行 agent 基建：Codex 把任务/worktree 治理做进 harness，社区 orca、worktrunk、firstmate 同向共振，工具层成形但成熟度参差，先跟架构迭代。
- Codex 0.155（09-18）：四家里第一个进官方实验通道的实时语音 /voice，加 Touch ID 硬件级验证 MCP 请求，方向信号强于即用价值，等 0.156。
- alibaba/open-code-review：确定性规则 + LLM Agent 混合架构做 code review，周增 7 倍（+15,028）登顶全榜，可小规模试，正式导入等热度回稳。

🔥 GitHub 本周热门（按周星增）
- 本周风向：skills 单品全面退潮，重的工程线（并行基建、混合架构评审）接棒。
- ECC 本周 +6,265 星（⭐263k）：跨四大 harness 的性能优化系统，单人仓库 bus factor 低。
- Agent-Reach 本周 +3,914 星（⭐83.5k〔新建〕）：一个 CLI 读/搜 Twitter、Reddit、B 站、小红书，零 API 费。
- humanizer 本周 +3,024 星（⭐50.3k）：去 AI 写作痕迹 skill，微退。
- context-mode 本周 +1,359 星（⭐23.7k）：工具输出沙箱化降 98% + 会话记忆持久化。

📋 仅记录（2 条）
- Hermes v0.21.3：338-PR rollup 但本体修复级，能力级内容全推给 v0.22.0，已连跳三次，下期大概率兑现。
- Tencent/WeKnora：知识平台周增环比 ×3.7（+4,867），方向偏应用，与导入线无关。

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-20.md
