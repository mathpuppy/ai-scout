📡 Agent 技术周报速览 · 10-09～10-18

这周整体踩了刹车：pi 从九个版本降到两个，Claude Code 转去修 bug 为主，但 Hermes 一个 v0.22.0 结清了攒了五个版本的文档欠账，是本周最大单家事件。两条主线：一是「边干活边打断、边接管」成了各家出厂默认（Codex 抢占打断、Hermes 实时子代理、Claude Code fork 子代理），二是「上下文省成本」成了共识主战场（idle compaction、clean model switching、context-mode 98% 压缩）。OSC 7501 迎来第三家 Codex，终端状态上报继续一家定、各家跟。

👉 值得看 / 试（3 条）
1. pi 1.2.0 / 1.3.0（10-12 / 10-15）
   - 是什么：工具声明加了「可达工具集」（reachesTools），MCP 服务器按依赖等就绪、替代工具能不能触达从靠猜变成声明；切换模型时丢掉上一个模型的 thinking 块，改 thinking 档、加工具都不再让缓存失效，恢复会话还保留当时激活的工具。
   - 怎么用：开源工具升级即得，依赖图和缓存保持开箱可用；自己写扩展的注意这版 Breaking 不少（schema 校验、事件生命周期收口）。

2. Codex 0.163.0（10-16）
   - 是什么：抢占式打断（instant_interrupt）转成出厂默认，打断一轮同时停掉 Code Mode cell 和嵌套调用；只读工具（skill / memory / 历史）并行跑；OSC 7501 终端状态上报第三家落地；沙箱加了内容完整性校验。
   - 怎么用：自动更新到位，打断响应、并行只读直接可用；Daybreak 对符合条件的账号默认开，按账号 eligible 折中。

3. Claude Code 2.1.299～2.1.302（10-14～10-17）
   - 是什么：闲置约 54 分钟就赶在缓存过期前自动压缩上下文（idle compaction，可配阈值 / 关闭）；fork 子代理全通道默认、桌面和 VS Code 主会话子代理默认后台跑；新增 /advisor 上 AWS；OTEL GenAI 约定 + 分类器判决进 telemetry，auto mode 行为可审计。
   - 怎么用：自动更新到位，idle compaction 和 fork 子代理直接受益；长会话可调 idle compaction 阈值。

👀 值得观望（8 条）
- Hermes v0.22.0（10-14）：6,080 个 PR 一次结清文档欠账，Connectors 让 agent 直接进 Linear/Notion、live subagents 实时可打断、Bot Screen 遇验证码人接管再交还、本机模型一键跑；体量最大，但单网关迁移还在进行中。
- harness 插件化：Anthropic 官方插件目录（+3,581）和 Cursor 插件规范（+1,536）同周上榜，扩展能力从「加工具」走向「插件市场」；生态刚起步，cursor/plugins 还没 LICENSE。
- context-mode（+4,438）：宣称 98% 压缩工具输出、跨 17 平台 MCP 路由的上下文优化层，直击上下文成本；但许可证不明 + 单维护者。
- rea（+24 万）：把 Claude Code / Codex / MCP / Ghidra 编排成「逆向 agent」，本周近乎指数出圈；方向新，适用面在逆向 / 安全圈。
- System One 决策原生模型：Jeva / VideoJev / MJev-Spatial 三篇把「做决定」从自回归文本拆出来，单次前向直接出结构化决策，重塑 agent 行动层；研究前沿，暂无即用价值。
- computer-use 开源全栈：阿里 OpenGCUA / MAI-Gym、腾讯 Player-1、上交 SoftwareGym 把 harness、合成环境、在线 RL 打通；OpenGCUA / MAI-Gym 可直接试用。
- harness 递归自我改进 RSI：Google Harness^2 和中关村 / 中科大 Self-Evolving 都在固定权重下让 harness 自己进化；研究前沿，暂无即用价值。
- agent 评测转向「最后一公里」：AgentSWE 检验交付的 agent 是否如你所愿，Agent-Reflex 教反思恢复，阿里合成 long-horizon 终端数据；评测视角从 patch 转向交付。

🔥 GitHub 本周热门（按周星增）
- 本周风向：harness 插件化、上下文工程、能力外延（逆向 / 视频）三个方向，共同锚定 MCP 作能力分发底座。本周官方周榜只返回 10 条（往期约 25 条），Agent 相关 5 条。
- hyperframes 本周 +5,639 星（⭐66,299）：写 HTML 渲染成视频的声明式视频渲染框架，HeyGen 出品、MCP 接入（媒体方向，未提名监控）
- 其余 4 个已并入上方选题，不重复列：rea +239,923（⭐314,862）、context-mode +4,438（⭐30,604）、claude-plugins-official +3,581（⭐42,264）、cursor/plugins +1,536（⭐12,503）

📄 本周论文（HF 热榜 · 权威机构）
- 本期论文线入选 12 篇，已全部并入上方四个论文选题，不重复单列。upvotes 头部：Jeva（NUS · 415）、VideoJev（南大 MCG · 364）、MJev-Spatial（Mind Lab〔模型判读〕· 353）、Player-1（腾讯 ARC · 334）、OpenGCUA（阿里 Tongyi-MAI · 316）。完整条目与出处见周报。

细节与出处（版本 / 日期 / 链接）：reports/2026-10-18/agent-tech-brief-2026-10-18.md
