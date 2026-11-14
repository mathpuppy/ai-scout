# 📡 Agent 技术周报 · 10-25～11-14

本期大盘：五家 harness 都在往「多代理 / 多会话编排」和「把工作区 / 会话搬进更多界面形态」上叠能力；Agent Skills 成为分发 agent 能力的默认单元；安全与权限边界从建议变成可配置的硬约束。

## 👉 值得看 / 试（5 条）

### DeepSeek 多代理协作（dsh-v0.2.2-rc.2 · 11-11）〔harness〕
- 是什么：SubAgent 支持起名与多层协作，AgentTeam 可按会话开启、共用成员与任务面板；实验性的 subagent_oar 工具还能把独立任务交给本机 Codex 或 Claude CLI。
- 怎么用：在 DeepSeek Harness 里开 AgentTeam，把大任务拆给多个 SubAgent 并行或分层跑；单人也能把子任务外派给本机 CLI。

### DeepSeek Git 工作树审阅（dsh-v0.2.2-rc.2 / alpha.3）〔harness〕
- 是什么：按分支、提交或文件类型在工作树里审阅改动，能直接处理 GitHub 评审、同步已审阅进度并更新分支。
- 怎么用：审 PR 时用 Git Worktree 打开改动逐项看，审完的进度同步回 GitHub，不用来回切分支。

### Hermes Agent v0.23.0「Hearth」统一网关（11-06）〔harness〕
- 是什么：Desktop 工作区整个搬进浏览器标签页，一个自建网关统一持有每个会话，CLI、TUI、桌面、编辑器、机器人、定时任务坐同一张桌，不再各自跑 agent。
- 怎么用：升级到 v0.23.0，用 gateway 把桌面会话带到浏览器里继续，多端共享同一会话。

### Anthropic 官方 Agent Skills 仓库（anthropics/skills）〔潮流〕
- 是什么：Anthropic 官方公开的 Agent Skills 规范与样例仓库，本周 +6,169 星（⭐194,177），是各家技能系统的对标锚点。
- 怎么用：照官方规范与样例组织自己的技能包，或从仓库挑现成技能直接加载进 agent。

### 安全审计技能化（cloudflare/security-audit-skill）〔潮流〕
- 是什么：面向 coding agent 的多阶段安全审计技能，本周 +8,829 星（⭐71,982），产出经独立验证、机器可读的审计结论。
- 怎么用：把它作为 skill 加载进 coding agent，让改完的代码过一遍安全审计，拿到可复核的结论。

## 👀 值得观望（4 条）
- **Claude Code Code Mode**〔harness〕：实验性玩法，Claude 写 JavaScript 来调用自身工具，可选开启、组织可关。
- **OpenAI Codex 自定义模型供应商 + 终端多侧聊**〔harness〕：终端里加 / 改模型 provider，配 device code 在 SSH 或无浏览器场景开通；终端工作区支持多 side-chat 标签。
- **DeepSeek 会话导入插件（实验性）**〔harness〕：把 DeepSeek App 或网页版历史会话导入工作区继续对话。
- **Vercel 电脑 / 浏览器自动化 CLI（agent-browser / agent-desktop）**〔潮流〕：computer use 从 SDK 下沉为可直接上手的 CLI，浏览器与桌面两条线。

## 📋 仅记录（3 条）
- **Claude Code 权限硬化 + Fable 5.2 默认**〔harness〕：新增「拒绝工作目录外写入」开关；Fable 5.2 成为默认模型（1M 上下文）。
- **pi 小幅步进**〔harness〕：新增 `pi auth login/logout` 与空闲缓存预热，流式解析提速。
- **LobeHub 嵌入协作的 super-agent**〔潮流〕：在团队已有聊天里加一个能自主干活的 agent（本周 +1,126 星）。

## 🔥 GitHub 本周热门（按周星增）
- 本周风向：Agent Skills 生态集中爆发，安全审计、官方规范、个人沉淀三种来源同榜。
- milind-soni/OpenMausBot 本周 +7,763 星（⭐22,232）：开源 Grok Bot 替代品，bot 带 VM 沙箱。
- mattpocock/skills 本周 +7,599 星（⭐323,883）：开发者个人 .agents 目录沉淀的实用工程技能集。
- google/elephant-goldfish-model 本周 +5,560 星（⭐18,668）：用 agent 做软件设计与评审的开源插件。
- NVIDIA/auto-ontology 本周 +4,108 星（⭐12,587）：在数据上构建语义图推理层的 Python 框架。
- addyosmani/agent-skills 本周 +3,502 星（⭐117,185）：面向 coding agent 的生产级工程技能。

## 其他动态
- Hermes Agent：v0.23.1（11-10）、v0.22.7（11-04）、v0.22.6（11-03）、v0.23.1+canary（11-13）
- OpenAI Codex：rust-v0.168.0（11-13）、rust-v0.167.2（11-12）、rust-v0.167.1（11-11）
- Claude Code：2.1.311～2.1.325 共 11 节（Code Mode、权限开关、默认模型以外未展开）
- DeepSeek Harness：dsh-v0.2.2-rc.1、dsh-v0.2.2-alpha.2、dsh-v0.2.1-rc.5、dsh-v0.2.1-rc.4
- pi：1.5.2（fork 目录已丢失的会话）、Unreleased 接入 deepseek-v4.1-flash
- 潮流线筛除：sherlock、mujoco、zed、daily_stock_analysis、claude-quickstarts

## 出处
- DeepSeek 多代理 / 工作树审阅：https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2 https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-alpha.3
- DeepSeek 会话导入：https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3
- Hermes v0.23.0：https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0
- Claude Code：https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- OpenAI Codex：https://github.com/openai/codex/releases/tag/rust-v0.169.0
- pi：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md
- anthropics/skills：https://github.com/anthropics/skills
- cloudflare/security-audit-skill：https://github.com/cloudflare/security-audit-skill
- vercel-labs/agent-browser：https://github.com/vercel-labs/agent-browser
- vercel-labs/agent-desktop：https://github.com/vercel-labs/agent-desktop
- milind-soni/OpenMausBot：https://github.com/milind-soni/OpenMausBot
- mattpocock/skills：https://github.com/mattpocock/skills
- google/elephant-goldfish-model：https://github.com/google/elephant-goldfish-model
- NVIDIA/auto-ontology：https://github.com/NVIDIA/auto-ontology
- addyosmani/agent-skills：https://github.com/addyosmani/agent-skills
- lobehub/lobehub：https://github.com/lobehub/lobehub
