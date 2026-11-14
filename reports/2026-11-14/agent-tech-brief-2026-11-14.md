# 📡 Agent 技术周报 · 10-25～11-14

本期大盘：五家 harness 都在往「多代理 / 多会话编排」和「把工作区 / 会话搬进更多界面形态」上叠能力；Agent Skills 成为分发 agent 能力的默认单元，官方规范、厂商产品化、个人沉淀三种来源同时上 GitHub 周榜；权限与沙箱边界从建议变成可配置的硬约束；自定义模型 provider / 路由在 Codex 与 pi 同时出现。

## 👉 值得看 / 试（5 条）

### DeepSeek 多代理协作（dsh-v0.2.2-rc.2 · 11-11）〔harness〕
- 是什么：SubAgent 支持起名与多层协作，AgentTeam 可按会话开启、共用成员与任务面板；实验性的 `subagent_oar` 工具还能把独立任务外派给本机 Codex 或 Claude CLI。原生多代理编排之上又叠了跨 agent 委托，是编排能力面的实质扩展。
- 怎么用：在 DeepSeek Harness 里开 AgentTeam，把大任务拆给多个 SubAgent 并行或分层跑；单人也能把子任务外派给本机已装的 Codex / Claude CLI 跑独立任务。

### DeepSeek Git 工作树审阅（dsh-v0.2.2-rc.2 / alpha.3）〔harness〕
- 是什么：按分支、提交或文件类型在工作树里审阅改动，能直接处理 GitHub 评审、同步已审阅进度并更新分支。另有实验性的「变更请求与工作树」把审查入口和工作树入口统一到一处；评审在独立工作树里做，会话级隔离，不踩手头工作区。
- 怎么用：审 PR 时用 Git Worktree 打开改动逐项看，审完的进度同步回 GitHub 并更新分支，不用来回切分支；日常开发与评审并行时，给评审单独开一棵工作树。

### Hermes Agent v0.23.0「Hearth」统一网关（11-06）〔harness〕
- 是什么：Desktop 工作区整个搬进浏览器标签页，一个自建网关统一持有每个会话，CLI、TUI、桌面、编辑器、机器人、定时任务坐同一张桌，不再各自跑 agent。此版代号「The Hearth Release」，属会话架构级收敛；配套的 `hermes webapp` 让 Desktop 插件在浏览器加载，还能通过 Nous 登录把面板暴露到自己网络或自有 URL。
- 怎么用：升级到 v0.23.0，用 gateway 把桌面会话带到浏览器里继续，多端共享同一会话；远端访问用 `hermes webapp` 起面板。

### Anthropic 官方 Agent Skills 仓库（anthropics/skills）〔潮流〕
- 是什么：Anthropic 官方公开的 Agent Skills 规范与样例仓库，本周 +6,169 星（⭐194,177），是各家技能系统的对标锚点。潮流线已提名它进 harness 监控名单——官方规范的演进会直接影响各家 harness 的技能系统。
- 怎么用：照官方规范与样例组织自己的技能包，或从仓库挑现成技能直接加载进 agent；自建技能系统时拿它当对照规范。

### 安全审计技能化（cloudflare/security-audit-skill）〔潮流〕
- 是什么：面向 coding agent 的多阶段安全审计技能，本周 +8,829 星（⭐71,982），产出经独立验证、机器可读的审计结论。安全审计从「读文档照建议」变成 agent 可直接加载执行的技能，是本周 skills 爆发里厂商产品化的代表。
- 怎么用：把它作为 skill 加载进 coding agent，让改完的代码过一遍安全审计，拿到可复核的结论；结论机器可读，适合作为合并前的一道固定检查。

## 👀 值得观望（4 条）
- **Claude Code Code Mode**〔harness〕：实验性玩法，Claude 写 JavaScript 来调用自身工具，可选开启、组织可关。工具调用执行模型的新路径，默认关闭，先看稳定性与生态接受度。
- **OpenAI Codex 自定义模型供应商 + 终端多侧聊**〔harness〕：终端里加 / 改模型 provider，配 device code 在 SSH 或无浏览器场景开通；终端工作区支持多 side-chat 标签。侧聊重启后可恢复本地记录；模型路由与多会话都下放到终端，与 Hermes 的多端同会话同向，但 Codex 偏终端内多路。
- **DeepSeek 会话导入插件（实验性）**〔harness〕：把 DeepSeek App 或网页版历史会话导入工作区继续对话。跨端会话迁移的雏形，标注实验性，先看导入格式兼容与保真度。
- **Vercel 电脑 / 浏览器自动化 CLI（agent-browser / agent-desktop）**〔潮流〕：computer use 从 SDK 下沉为可直接上手的 CLI，浏览器与桌面两条线。需要 agent 操控真实界面的场景可以先试浏览器线；潮流线已把 agent-browser 提名进 harness 监控名单。

## 📋 仅记录（3 条）
- **Claude Code 权限硬化 + Fable 5.2 默认**〔harness〕：新增「拒绝工作目录外写入」开关；Fable 5.2 成为默认模型（1M 上下文）。开关即 `permissions.blockWritesOutsideWorkingDirectories`，让 Write / Edit / NotebookEdit 在所有权限模式下拒绝工作目录外路径；Fable 5.2 定价 $8 / $40 每 Mtok，cache 读 $0.20 / Mtok。
- **pi 小幅步进**〔harness〕：新增 `pi auth login/logout` 与空闲缓存预热，流式解析提速。`pi auth login/logout <provider>` 支持 API-key 与无浏览器登录，免进会话即可管凭证；空闲 prompt cache 在划算时最长保温 30 分钟。
- **LobeHub 嵌入协作的 super-agent**〔潮流〕：在团队已有聊天里加一个能自主干活的 agent（本周 +1,126 星）。agent 以「团队成员」形态嵌入协作，是多人协作场景的产品化尝试（总 ⭐85,417）。

## 🔥 GitHub 本周热门（按周星增）
- 本周风向：Agent Skills 生态集中爆发，安全审计、官方规范、个人沉淀三种来源同榜；第二主轴是 computer use 从 SDK 下沉为 CLI。
- milind-soni/OpenMausBot 本周 +7,763 星（⭐22,232）：开源 Grok Bot 替代品，bot 跑在虚拟机沙箱里，是 agent 执行环境的一种落地形态。
- mattpocock/skills 本周 +7,599 星（⭐323,883）：开发者个人 `.agents` 目录沉淀的实用工程技能集。个人技能包高星走红，印证 skill 是 agent 能力的分发单元。
- google/elephant-goldfish-model 本周 +5,560 星（⭐18,668）：用 agent 做软件设计与评审的开源插件，把设计 / 评审这类人脑环节交给 agent。
- NVIDIA/auto-ontology 本周 +4,108 星（⭐12,587）：在数据上构建语义图推理层的 Python 框架，面向 LLM 与 agent 工作流。
- addyosmani/agent-skills 本周 +3,502 星（⭐117,185）：面向 coding agent 的生产级工程技能，编码场景的成体系技能包。

## 其他动态
- Hermes Agent：v0.23.1（11-10，修复插件目录超 2MiB 上限导致安装静默回退，上限提到 16MiB）、v0.22.7（11-04，常规 patch 汇总）、v0.22.6（11-03，webapp 与 Desktop 浏览器化起点）、v0.23.1+canary（11-13）
- OpenAI Codex：rust-v0.168.0（11-13，会话侧栏与多媒体能力）、rust-v0.167.2（11-12，Vertex AI 上默认增量发送工具更新）、rust-v0.167.1（11-11，仅 changelog 无实质条目）
- Claude Code：2.1.311～2.1.325 共 11 节（Code Mode、权限开关、默认模型以外未展开：插件 `engines` 版本范围约束，网关 pooled group budgets、`assume_role`、groups 路由、OIDC `user_id_claim`，Vertex 快速模式与 auto mode 校验收紧等）
- DeepSeek Harness：dsh-v0.2.2-rc.1（铺开手机/平板适配与多语言，插件热更新与回滚，历史会话复制为 Markdown，实验性个性化推荐 / 开发者统计插件）、dsh-v0.2.2-alpha.2、dsh-v0.2.1-rc.5（思考内容展示优化）、dsh-v0.2.1-rc.4（ACP 模式诊断混入 stdout 的修复）
- pi：1.5.2（fork 目录已丢失的会话）、Unreleased（接入 deepseek-v4.1-flash 系列 provider 与 Qwen Token Plan 密钥变量）
- 潮流线筛除：sherlock（OSINT 账号检索）、mujoco（物理仿真）、zed（编辑器）、daily_stock_analysis（LLM 行情应用）、claude-quickstarts（教程合集）

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
