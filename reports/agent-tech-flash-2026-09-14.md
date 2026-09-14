📡 Agent 技术周报速览 · 09-08～09-14

本周 agent 工程重心明显下移：编排能力被做成了 API（OpenAI Agents API 开放公测），上下文和记忆管理成了显学，skills 变成了内容分发市场。叙事面上治理与安全讨论继续极化，四大 coding harness 集体静默蓄力，推理降本的三层范式成型。

👉 值得看 / 试（4 条）
1. Agent 编排与运行时平台化（OpenAI Agents API 公测 · 09-10）
   - 是什么：OpenAI 把驱动 Codex 的 harness 和云端基建直接开放成 API；同周 Cursor Projects 用协调者调度数千子智能体，OpenRouter Fusion 做多模型并行合议。
   - 对我们：先接公测试用，自建还是采购编排层的决策放到评估之后。

2. 上下文工程与 Agent 记忆（LangChain 09-09 / T-Mem 09-14 / context-mode）
   - 是什么：长任务上下文四机制（预算卸载、压缩、todo-state、跨会话记忆）成方法论；腾讯 T-Mem 做联想式记忆；开源 context-mode 把工具输出沙箱化，省 98% 上下文。
   - 对我们：四机制当设计清单直接套用，沙箱化思路先在自家 harness 小规模复刻。

3. Skills 内容化浪潮（GitHub 周榜）
   - 是什么：周榜 22 条 agent 项目约 9 条是 skill 仓库，榜首 i-have-adhd 一周 +16.7k 星；diagram-design 明确支持 Claude Code / Codex / Pi。
   - 对我们：头部 skill 装上即试；把团队方法论 skill 化是低成本高杠杆动作，选型看内容别看星数。

4. Agent 推理成本工程（DeepSeek V4.1 Flash · 09-14 上千问平台）
   - 是什么：缓存命中输入降价 7 倍、Mooncake KV 命中率 90%+、小模型学会何时向上求助省 96%、JIT OCR 只对相关页调 VLM——都是「便宜模型打底 + 按需升级」。
   - 对我们：按缓存 / 路由 / 文档三层自查 agent 管线成本，先切最高频调用链。

👀 值得观望（6 条）
- Agent 安全攻防：网页藏毒劫持 agent 有了会「追凶」的自进化防御，OpenAI 智能体攻击 RubyGems 拿到取证实锤；有 agent 上网场景的先把投毒写进威胁模型。
- GPT-6 Astra 生态：Perplexity 把整条系统托管给它跑，售货机一年自主赚 1.5 万美元；金融版的可溯源引用设计可以直接抄。
- Harness 资源管理层：ECC（258k 星）、worktrunk、firstmate 把优化重心从 prompt 层移到 context / worktree / 多 agent 调度，成色参差，先观察一个月。
- 语音 Agent：GPT-Live-1 全双工语音进 API，「语音薄前端 + 工具强后端」分层；Codex 出现 Windows voice 构建线索。
- 小红书 Iris（09-14）：开源 Search Agent 模型 35B / 397B，检索型 agent 首次被做成独立模型品类；权重能拿到，可先跑个基准再定。
- 评测诚信与基建：Astra「换考场」99.9%→62.7%，刷榜叙事被打脸；浙大开源可插拔评测底座，和我们工作流相关，拉下来试试。

🔥 GitHub 本周热门（按周星增）
- 本周风向：官方与平台生态位加速固化，OpenAI、微软、GitHub、阿里、腾讯的官方仓库同周在榜。
- markitdown 本周 +5,191 星（⭐183.5k）：文件转 Markdown，LLM 上下文投喂的事实标准
- hyperframes 本周 +5,146 星：写 HTML 渲染视频，专为 agent 设计的输出通道
- OpenMAIC 本周 +4,202 星：清华多 agent 交互课堂，一键沉浸式学习
- spec-kit 本周 +2,642 星（⭐136.6k）：GitHub 官方 spec 驱动开发工具包
- open-code-review 本周 +2,213 星：阿里确定性管线 + LLM 混合架构代码评审

📋 仅记录（6 条）
- 治理转向：Dario 呼吁前沿降速、Altman 跟进、Sacks 反对；Anthropic 指控三家中国实验室蒸馏近 2 亿次交互，YC 主张「走正门」——盯蒸馏政策会否变成 API 条款变化。
- 四大 harness 集体静默：Codex 0.155、pi 新版、Hermes notes 三个预告全部跳票，静默在加深，下期大概率集中释放。
- RSI 与 AI4AI：递归自我改进时间表正反方同周打对台，研究叙事暂无工程落点。
- Agent 商业化案例：LangChain 营销 agent、Augment 人均产出 4.5 倍复盘（建议精读）、Copilot 运营全自动化。
- 国内产品化：蚂蚁外滩基建矩阵、豆包 agent 入手机、阿里云 Token Plan 加 12 类 harness 工具，通稿浓度高。
- 开源合规：Google 被指未署名复用 mobile-use 开源代码；openai/plugins 无 license、context-mode / worktrunk 非标准许可——引用热榜项目前先过一遍 license。

细节与出处（版本 / 日期 / 链接）：reports/agent-tech-brief-2026-09-14.md
