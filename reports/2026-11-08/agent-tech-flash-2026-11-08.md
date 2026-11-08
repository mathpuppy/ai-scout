📡 Agent 技术周报速览 · 10-30～11-08

四家 harness 这周都在做同一件事：把新开的执行通道塞回原来的闸门里，同时让子代理和会话不再绑死主进程。GitHub 榜的重心从"再做一个 harness"转向围绕 harness 的指挥层和标准件；论文那边干脆把 harness 本身当成可训练、可蒸馏的东西来研究。

👉 值得看 / 试（2 条）

1. Claude Code 2.1.314 → 2.1.319（10-30 至 11-07）
   - 是什么：开启写入边界设置后，Write / Edit / NotebookEdit 会拒绝工作目录外的路径，bypass 模式也一样；子代理的推理强度可用环境变量单独配置。
   - 怎么用：两个开关改配置就能生效，已经进稳定版。跑多 agent、或者担心 agent 改到仓库外文件的，这周就可以打开试。

2. worktrunk（本周 +2,292 星，累计 1.2 万）
   - 是什么：给 git worktree 套了个 CLI，三条命令把 worktree 用得像分支，还带 hooks 和一份构建缓存复用。
   - 怎么用：解决多个 agent 同仓并行互踩的老问题。装上去一条命令开一个隔离目录，试错成本几乎为零。

👀 值得观望（6 条）

- Hermes Agent v0.23.0（11-06）：一个网关独占全部会话，CLI/TUI/Desktop/机器人/cron 统一作为客户端接入；Webapp、可插拔子代理后端、付费 MCP 工具计价同版交付。架构变化最值得跟，但整版几乎全是默认关的开关加一批破坏性改动，升级要逐项验。
- Codex 0.166 / 0.167（10-30 / 11-06）：多代理的状态变更动作开始走 Guardian 复核，会话能在不同后端之间搬，MCP 连接跨会话共享并加租约。同时管多个后端时才有感。
- t3code（本周 +17.1k，累计 5.1 万）：agent 控制面从手机端扩成手机 + Web + 桌面四端，自带常驻 server，已适配七家 harness。热度确是两周前的近十倍，但仓库描述被清空，读 README 再判断能不能自托管。
- claude-mem（本周 +7,482，累计 11.5 万）：把 agent 会话录下来、压缩、再注入下一次会话，声明兼容七家 harness。换 harness 不丢记忆是真需求，先上非关键项目。
- skills / spec 三连上榜：anthropics/skills（官方规范同仓）、github/spec-kit（官方先规格后实现流程）、obra/superpowers（20+ harness 上强制先出 spec 再写码，已含 pi 和 Hermes）。标准层方向确定了，但格式还在收敛，现在把流程绑死进去成本偏高。
- CoworkOS（论文，upvotes 100）：长程工作用的 harness，把任务策略和执行管理拆开，人在回路靠共享工件而不是对话，再配持续自动化后训练。开源仓已有 141 星，看它能不能真复现。

🔥 GitHub 本周热门（按周星增）

- 本周风向：agent 相关的项目仍占绝大多数，但重心从"再做一个 harness"转向围绕 harness 的控制面、记忆层和标准件，单用途设计类 skill 内容包也吸走不少星但不算架构增量。
- OpenMausBot 本周 +7,077 星（⭐1.7 万）：聊天应用里每个 bot 背后是一个本地跑的 agent，各有性格、模型和一台云电脑，人在聊天框里审批。
- pr-agent 本周 +1,576 星（⭐1.5 万）：自称原版开源 PR reviewer，自托管多模型，README 明确说不是 Qodo 的免费版。2023 年的老项目，迁名后重新走热。
- agent-browser 本周 +1,476 星（⭐4.7 万）：Vercel Labs 的浏览器自动化 CLI，把页面压成带编号引用的无障碍树，agent 按编号点击再回读校验。

📄 本周论文（HF 热榜 · 权威机构）

- Advances in Agentic Computer Graphics（University of Texas at Austin〔模型判读〕 · upvotes 143）：给"agent 写图形学代码再自己迭代"这件事建分类体系和文献地图，本周热度第一。
- From Autonomous Agents to Cognitive Symbionts（University of Oxford · upvotes 86）：立场论文，主张下一步不是更自主，而是共享人的情境与记忆，增强人的判断。唯一唱反调的一篇。
- Route Anything（National University of Singapore〔模型判读〕 · upvotes 79）：在模型 / 工具 / 策略池上做质量与成本的路由，学习式路由器在 16 个 benchmark 上整体优于手工规则，平均效率提升 8.82 倍。
- Video Generation Meets Agent Harness（Video Rebirth〔模型判读〕 · upvotes 78）：把 harness 那套（上下文、工具、状态、预算）搬到视频模型外面，顺手接上递归自我改进。
- FrontierPhysics（BenchFlow〔模型判读〕 · upvotes 56）：42 位物理学家按自己的研究出了 56 个端到端任务，要求 agent 从读文献一路做到验证，考的不是答题而是做研究。

📋 仅记录（2 条）

- pi 1.5.0（11-02）：工具参数校验统一到一个 schema 包里（破坏性），MCP 登录默认换用 CIMD。依赖 TypeBox 特化校验的扩展需检查迁移。
- Harness-S（论文，upvotes 63）：让同源的"兄弟 harness"接管失败的重试、再把能力蒸馏回单一策略，专门治换 harness 就跑不动。做训练的人有用，做部署的暂时用不上。

细节与出处（版本 / 日期 / 链接）：reports/2026-11-08/agent-tech-brief-2026-11-08.md
