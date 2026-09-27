📡 Agent 技术周报速览 · 9-18～9-27

四家 coding agent 工具这周接了同一批新模型（Opus 5.5、GPT-6 Sol / Luna），Claude Code 和 Codex 还直接改了默认模型，模型跟进速度成了工具间的新竞争点。GitHub 上 agent 记忆库登顶周榜、Cloudflare 官方下场做安全审计 skill；论文圈这周开始把 harness 本身当优化对象——一边让 agent 自己改 harness，一边想办法把 harness 蒸馏进模型。

👉 值得看 / 试（4 条）
1. Claude Code 四连发（09-23～09-26，2.1.280→2.1.283）
   - 是什么：Opus 5.5 一上线就是默认模型，Pro / Team 付费档整体从 Sonnet 切到 Opus；没配权限模式时会话直接以 auto mode 启动；新增 /doctor prompt-audit，能扫出 CLAUDE.md 和 skills 里为旧模型写的提示词。
   - 怎么用：自动更新即得；建议跑一遍 /doctor prompt-audit 自查提示词；Opus 默认化后留意计费变化。
2. Codex 0.156 / 0.157（09-23 / 09-25）
   - 是什么：两个版本把语音对话、worktree 并行、后台 daemon、Guardian 审查四项全部改成默认开；GPT-6 Sol / Luna 全线接入（含 Bedrock 企业通道）；新增 /usage 用量面板，插件和技能的活动首次可见。
   - 怎么用：升级即得、无需配置；语音按 F8 开；常跑并行任务或需要管多 agent 的直接受益。
3. pi 0.86.1～0.87.1（一周三版）
   - 是什么：0.87.0 让「改上下文不用重写历史」成为一等能力——单条消息可以从后续请求里消失而不动原始记录，缓存前缀保住；0.87.1 一个版本接入 Opus 5.5 / GPT-6 Sol / Luna / Grok 4.7（Grok 成 xAI 默认）。
   - 怎么用：开源，升级即得；长会话、多分支的用法 token 成本直接受益；自己写扩展的注意 SessionManager 的 Breaking 变更。
4. Cloudflare 安全审计 skill（本周 +6,474 星，全榜第二）
   - 是什么：官方出品的多阶段安全审计 coding-agent skill，产出独立验证、机器可读的安全发现；上线 3 个月 22k 星，MIT。
   - 怎么用：放进任意 coding agent 即可跑安全审计，即拿即用。

👀 值得观望（6 条）
- Hermes v0.21.4 / v0.21.5：两个版本约 2,300 个 PR，主线是常驻后台 + 多账号 + 插件 SDK，但官方故意不写细节、全欠到 v0.22.0 文档，下期大概率落地。
- Agent 记忆赛道：hindsight（会学习的记忆层）+7,282 星登顶周榜，论文侧自演化本体 / 代码抽技能 / 用时策展三篇同窗；品类确认，单体成色待看。
- 「训外壳」论文：RRSI（206 分，本周最高）让 agent 自己改写 harness，北大的 Harness-Zero 反向把 harness 增益蒸进模型；方向重要，落地尚早。
- 存量软件 agent 化：univer 老牌文档引擎重定位成「Office Harness」，CLI-Anything 给存量命令行软件生成 agent 接口；新叙事，采用度待验证。
- Fleet 编排稳态：orca 两连涨（+20%）、paperclip 87k 星把 agent 舰队管理推到组织层（审批 / 审计）；两者 open issues 都数千级，维护压力待看。
- RL 环境程序化合成：小米 / Qwen / 阿里三篇同解训练环境稀缺，环境从人工造转向代码里产；训练侧信号，暂无即用价值。

🔥 GitHub 本周热门（按周星增）
- 本周风向：skill 玩法单品全部掉榜，接棒的是更重的能力层基建（记忆、工具路由）和工程化的官方 skill。
- ECC 本周 +5,522 星（⭐268.0k）：agent harness 性能优化系统，跨四家工具通用；单人维护扛 26 万星是隐患
- open-code-review 本周 +4,310 星（⭐41.6k）：阿里的代码评审（确定性规则 + LLM agent），上期 7 倍爆发后退潮中
- WeKnora 本周 +3,015 星（⭐30.4k）：腾讯知识平台，文档→RAG→agent→自维护 Wiki
- treg 本周 +1,773 星（⭐3.5k，新建）：「agent 工具的 OpenRouter」，工具统一路由层；license 和背景待查

📄 本周论文（HF 热榜 · 权威机构）
- The Tasteful Agent（Microsoft · upvotes 149）：定义并测量长程任务里 agent 的「品味」——中间决策选哪个方案的质量，配 TasteBench 评测
- GameHorizon Suite（腾讯 · upvotes 130）：gameplay agent 多视野评测套件，视觉 / 规划 / 操作长程联合考察
- VideoGen-Agent（Princeton University · upvotes 70）：把视频生成模型封装成多轮推理-生成循环的 agent 再用 RL 强化
- onPanda（StepFun 阶跃星辰 · upvotes 55）：token 级修正的标注工具，给 agent 轨迹做 on-policy 标注

细节与出处（版本 / 日期 / 链接）：reports/2026-09-27/agent-tech-brief-2026-09-27.md
