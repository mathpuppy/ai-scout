# Agent 技术周报 · 2026-11-08（运行日）

> 窗口：GitHub 官方周榜 · harness 线 [2026-10-30, 2026-11-08] · 论文线 [2026-10-31, 2026-11-06] · 产物：`raw/lines/2026-11-08/agent-harness-brief-2026-11-08.md`、`raw/lines/2026-11-08/trending-2026-11-08.md`、`raw/lines/2026-11-08/papers-2026-11-08.md` · 数据缺口：无（论文线日期页实覆盖 5/7 天，10-31 / 11-01 两页为空；热度 top 12 经机构核验后入选 11 篇，不补位；harness 线 Codex `releases?per_page=100` 端点 500 后改 20 条抓取，窗口起点未受影响）

## TL;DR

| 选题 | 一句话 | 结论 |
|---|---|---|
| Hermes Agent v0.23.0 | 单网关独占全部会话，一次结清整窗 notes，Webapp / 可插拔 delegation / MCP 计价同版交付 | 值得观望 |
| Claude Code 2.1.314 → 2.1.319 | 工作目录外写入提为硬边界，子代理拿到独立 effort，Monitor 并入统一 Bash 闸门 | 值得导入 |
| OpenAI Codex 0.166.0 / 0.167.0 | Guardian 复核扩到原生多代理动作，会话跨后端可迁移，MCP 连接共享加租约 | 值得观望 |
| pi 1.5.0 | 工具参数校验统一到 pi-schema（破坏性），MCP OAuth 默认改走 CIMD | 仅记录 |
| pingdotgg/t3code | 单周 +17.1k，把 agent 控制面从移动端扩成四端 + 常驻 server | 值得观望 |
| thedotmack/claude-mem | 跨会话记忆层，声明兼容七家 harness，累计 11.5 万星 | 值得观望 |
| skills / spec 标准件三连 | superpowers、spec-kit、anthropics/skills 同周上榜，skills 成可迁移流程资产 | 值得观望 |
| max-sixty/worktrunk | 三命令把 git worktree 用得像分支，专治多 agent 同仓互踩 | 值得导入 |
| CoworkOS（论文） | 策略与执行管理解耦的长程工作 harness，配持续自动化后训练 | 值得观望 |
| Harness-S（论文） | 把 harness 组合当训练信号，蒸馏回单一策略以抗 harness 过拟合 | 仅记录 |

**本期大盘**：四家 harness 这一周都在做同一件事——把新开的执行通道收进既有闸门（Codex 多代理动作进 Guardian、Claude Code 的 Monitor 进 Bash 规则、Hermes 把工具成本塞进审批卡），同时把子代理和会话从主进程里解耦出来。GitHub 榜的重心也从「再做一个 harness」转向围绕 harness 的指挥层与标准件；论文侧则把 harness 本身当成可训练、可蒸馏、可自我改进的研究对象，两边在同一周指向了同一结论。

## Hermes Agent v0.23.0「The Hearth」

### 事实
- **单网关持有每一个会话** — 每个 profile 本机只跑一个 gateway，CLI、TUI、Desktop、ACP 编辑器、机器人、cron 全部改为 client 接入，一个会话一份队列一份历史（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）
- **Desktop 工作区搬进浏览器标签（Webapp）** — `webapp.enabled` 打开后由 gateway 自身监听器提供整套 Desktop 工作区，可局域网访问或经 Nous 登录挂公网 URL；单用户、默认关闭（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）
- **可插拔 delegation 后端正式落地** — `delegation.backend` 决定每个 `delegate_task` 如何变成子 run，`advanced-delegation` 插件提供 model-map 与 per-profile 路由，`delegation.prefix_stagger_seconds` 让批量子代理复用 prompt cache（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）
- **付费 MCP 工具的标价与每会话消费上限** — 服务器可声明单次调用成本与每会话额度，审批卡显示单价与此会话累计，超限即使在 YOLO 模式或已信任服务器上也要先问（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）
- **技能锁定与插件版本地板** — `hermes curator lock` 后 agent 无法经 `skill_manage`、文件编辑或终端改动该技能（`--yolo` 亦然），插件自更新配 `requires_hermes` 强制生效，目录从约 600 涨到 1,050+（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）
- **opt-in prepared compaction** — `compression.prepare_ahead: true` 时临近触发点后台预写摘要，压缩不再中断回合，不确定断言需列在 `UNVERIFIED:` 行（*harness*）（[v0.22.6 · 2026-11-03](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.6)）
- **breaking：浏览器工具收窄** — 移除 agent-browser 与 10 个 `browser_*` 工具（只剩 `browser_exec`），`hermes mcp serve` 改名 `hermes mcp-serve` 并移入插件，Desktop 需 Electron 44（*harness*）（[v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)）

### 简评
v0.23.0 是约 10,080 commits / 1,950 PR 的一次性结算，也是四家里唯一明确改执行模型的一版：会话所有权从「各表面各跑一份 agent 写同一份会话」变成「单写者 + 多客户端」，同时结清上期就挂账的架构收尾项，并直接为 Webapp 铺路。第二主轴是生态治理——插件自更新、版本地板、Verified tier、技能锁定，说明扩展规模到千级以后「谁能改什么、能升到哪版」必须内置。整版几乎全是 opt-in 且默认关，加一批 breaking 项，能力铺满了但默认行为仍保守。

**结论**：值得观望 — 单网关是本期最值得跟的架构级变化，但一次性升级需逐项验证 breaking 面与默认关闭的开关。

## Claude Code 2.1.314 → 2.1.319

### 事实
- **工作目录外写入成为硬边界** — `permissions.blockWritesOutsideWorkingDirectories` 让 Write / Edit / NotebookEdit 在任何权限模式（含 bypass）下都拒绝工作目录外路径（*harness*）（[2.1.314 · 2026-10-30](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21314)）
- **子代理推理预算独立** — `CLAUDE_CODE_SUBAGENT_EFFORT` 在未另行指定时决定子代理 effort 而不再继承会话；2.1.318 让 `$.model.fork` 支持 `effort` 并回报实际发出的 effort（*harness*）（[2.1.316 · 2026-10-31](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21316) / [2.1.318 · 2026-11-04](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21318)）
- **后台子代理 3 分钟转后台保缓存** — 子代理的 shell 命令在所有 provider 上跑满 3 分钟即转后台，避免 prompt cache 在等待期间过期（*harness*）（[2.1.318 · 2026-11-04](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21318)）
- **Monitor 纳入统一 Bash 权限闸门** — WebSocket watch 从此逐条遵循 Bash 规则，ask 规则下 Monitor 的 allow、bypass 或 auto 模式都不再跳过提示，Monitor 起的 shell 命令也会触发 Bash hooks（*harness*）（[2.1.319 · 2026-11-07](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21319)）
- **沙箱与信任的传播规则收紧** — `--trust-workspace false` 同时阻止仓库 settings 里的 hooks 与 skills 运行，修复经 worktree 的沙箱逃逸，`--add-dir` 目录要自身信任后才注册 plugin marketplace（*harness*）（[2.1.319 · 2026-11-07](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21319)）
- **MCP tasks 转默认能力** — 终端内 MCP 后台任务不再依赖 feature-flag 拉取，Bedrock / Vertex / Foundry / 网关 / `DISABLE_TELEMETRY` 场景均可用，可用 `CLAUDE_CODE_DISABLE_MCP_TASKS=1` 关（*harness*）（[2.1.319 · 2026-11-07](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21319)）
- **SDK hook 改为失败关闭** — Agent SDK 的 hook 回调新增 `onFailure: "block"`，回调失败即阻断动作而不是继续执行（*harness*）（[2.1.317 · 2026-11-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21317)）

### 简评
五连发的重心从上期「安全与身份」转向闸门一致化与预算独立：2.1.314 把工作目录外写入提为配置层硬约束，2.1.319 把 Monitor 这条新执行通道收进同一套 Bash 规则并逐条收紧信任传播，两者首尾呼应；2.1.316 / 2.1.318 则把子代理当作有独立预算与时序约束的执行单元来设计。中间两版主体是云端会话、gateway 与 self-hosted runner 的可靠性与成本报表，属企业侧运维增量。

**结论**：值得导入 — 两个开关（写入边界、子代理 effort）即配即用且已进稳定版，不需要等新架构。

## OpenAI Codex 0.166.0 / 0.167.0

### 事实
- **Guardian 复核铺到原生多代理调用** — 0.166.0 把状态变更类 multi-agent 调用路由进 Guardian 复核并集中分类，0.167.0 再加入 recorded exec calls 的直接复核与前置 `PreToolUse` hooks（*harness*）（[rust-v0.166.0 · 2026-10-30](https://github.com/openai/codex/releases/tag/rust-v0.166.0) / [rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)）
- **托管命令检查点要求全新人工批准** — 新增托管命令检查点与 `permissions.network` 托管网络约束，`prompt-user` 类命令规则要求新的人工批准（*harness*）（[rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)）
- **MCP 连接跨会话共享 + 每 chat 租约** — 符合条件的本地 stdio MCP 连接在多个 chat 间复用并按调用方隔离输入与超时，0.167.0 补上 per-chat lease（*harness*）（[rust-v0.166.0 · 2026-10-30](https://github.com/openai/codex/releases/tag/rust-v0.166.0) / [rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)）
- **跨后端会话切换** — 终端 session picker 可在已连接的不同 backend 之间切换并保留草稿，`codex queue --resume` 可在排队消息时指定恢复未加载线程（*harness*）（[rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0) / [rust-v0.166.0 · 2026-10-30](https://github.com/openai/codex/releases/tag/rust-v0.166.0)）
- **Code Mode 输出有界化与协商式截断** — 有界输出收集与渲染接入 codemode runtime，服务端截断可经协议协商（*harness*）（[rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)）
- **provider 身份与托管接入扩展** — TUI onboarding 加 Google Cloud Vertex AI（ADC 或凭证文件），gateway OAuth 凭据可落盘存储并在 token rotation 后安全重载（*harness*）（[rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)）

### 简评
两版延续「安全与身份」主线并往前推一格：审批闸门的一致性与时效被当作独立议题处理，与 Claude Code 本期把 Monitor 并入统一规则是同向动作。第二条线是会话可迁移——跨后端 picker 加 `queue --resume`，说明在多后端（本地 / 远程 app-server / 云）并存的现实下，会话正从进程附属物升为一等对象。第三条是把「多会话共用昂贵资源」收成显式契约：MCP 共享连接配租约、Code Mode 有界输出配协商截断。

**结论**：值得观望 — 会话可迁移与多代理复核两项要同时管理多个后端/多个 agent 时才显出价值，单机单会话收益有限。

## pi 1.5.0

### 事实
- **工具参数校验统一到 pi-schema（破坏性）** — `@earendil-works/pi-schema` 接管工具参数校验，超出 JSON Schema 的 TypeBox 特性不再作用于工具参数；普通 JSON Schema 工具（含 MCP 工具）首次获得与 TypeBox 工具相同的强制转换（*harness*）（[1.5.0 · 2026-11-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#150---2026-11-02)）
- **MCP OAuth 默认改用 Client ID Metadata Document** — 授权服务器支持公共客户端时用 pi 自身托管的 CIMD 做客户端身份，否则退为动态注册，`oauth.clientRegistration` 可控（*harness*）（[1.5.0 · 2026-11-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#150---2026-11-02)）
- **扩展包更新后可审阅 changelog** — 包可在 `pi.changelogPath` 或包根 `CHANGELOG.md` 声明，pi 在下次冷启动把高于「上次所见版本」的条目显示在 "Extension Updates" 下（*harness*）（[1.5.0 · 2026-11-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#150---2026-11-02)）
- **未发版观察（`[Unreleased]`，不计入本期）** — Anthropic 会话改 message threads：每次只发新增消息、由服务端续接，会话变更时回退整包发送（*harness*）（[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)）

### 简评
1.5.0 是收敛期的收尾：新版特性只有四条，三条是能力面，真正有分量的是入口一致性——工具参数校验从 TypeBox 私有语义迁到独立包，使 MCP 工具与内置工具拿到同一套强制转换与错误文案；MCP OAuth 默认从动态注册改为优先用自家 CIMD。其余大幅条目集中在稳定性与渲染性能，节奏仍是「两周一小步」。

**结论**：仅记录 — 变化正确但幅度小，只有自建扩展或依赖 TypeBox 特化的工具参数需要因破坏性变更做迁移。

## pingdotgg/t3code — agent 控制面扩到四端

### 事实
- **本周 +17,100 星，累计 5.1 万星** — 用 iOS/Android、Web app 与 Electron 桌面端控制本机 agent，走用户自有订阅，已适配 Claude Code、Codex、Cursor、Grok Build、OpenCode、Antigravity、fx；仓库描述字段已清空，定位以 README 为准；上期（10-25）周增 +1,778（*潮流*）（[repo](https://github.com/pingdotgg/t3code) · 抓取于 2026-11-08）

### 简评
榜上唯一直接改造「人如何指挥 agent」的项目：控制面从移动端远程扩成四端，并内置常驻 server（`t3 service install`）。两周内周星增约为上期快照的 9.6 倍，热度确凿，但仓库描述被清空说明定位仍在调整，适配面（七家 harness）比架构文档先跑在前面。

**结论**：值得观望 — 指挥层的方向明确且热度已在，但仓库自述缺失，需读 README 与源码再判断能否自托管。

## thedotmack/claude-mem — 跨 harness 的记忆层

### 事实
- **本周 +7,482 星，累计 11.5 万星** — 录制 agent 会话全过程，AI 压缩后把相关记忆注入后续会话，声明兼容 Claude Code、Codex、Gemini、Hermes、Copilot、OpenCode、OpenClaw（*潮流*）（[repo](https://github.com/thedotmack/claude-mem) · 抓取于 2026-11-08）

### 简评
记忆是四家 harness 都会碰到的横切能力，claude-mem 把它做成可跨 harness 复用的独立层，正好对应「换 harness 不丢记忆」这个真实需求，Apache-2.0 也便于自托管。要注意它靠压缩后注入来工作，记忆质量取决于压缩策略，且主要维护者单一。

**结论**：值得观望 — 需求真实、代码可自托管，但多维护者与长期稳定性未知，适合先非关键项目试。

## skills / spec 成为可迁移的标准件（潮流三连）

### 事实
- **obra/superpowers 本周 +4,466 星，累计 31.4 万星** — 一组可组合 skills 加启动指令，强制 agent 先出 spec 再写码，覆盖 20+ harness（Claude Code、Codex、Cursor、Pi、Hermes、Gemini CLI、OpenCode 等）（*潮流*）（[repo](https://github.com/obra/superpowers) · 抓取于 2026-11-08）
- **github/spec-kit 本周 +4,280 星，累计 14.8 万星** — GitHub 官方 SDD 工具包：结构化流程、可复用模板与留痕产出，bug fixing / idea assessment 为可选扩展，也可自造流程（*潮流*）（[repo](https://github.com/github/spec-kit) · 抓取于 2026-11-08）
- **anthropics/skills 本周 +2,796 星，累计 18.9 万星** — `skills/` 示例与生产用文档技能（docx/pdf/pptx/xlsx）、`spec/` Agent Skills 规范、`template/` 模板同仓；自述示例「仅供演示与教学」，仓库级无 license（各技能多为 Apache-2.0）（*潮流*）（[repo](https://github.com/anthropics/skills) · 抓取于 2026-11-08）

### 简评
三家同周上榜不是巧合：官方规范（anthropics/skills 的 `spec/`）、官方流程原语（spec-kit）、跨 20+ harness 的方法论（superpowers）同时走热，说明 skills/spec 正从各家私有格式收敛为可迁移的流程资产，其中 superpowers 已把 pi 与 Hermes 列入安装目标。风险是格式仍在收敛期，且 anthropics/skills 明示示例为教学用途，采用须按技能逐个验证。

**结论**：值得观望 — 标准层方向确定值得读规范，但格式与实现尚未定型，现在把流程绑死到某一套里成本偏高。

## max-sixty/worktrunk — 并行 agent 的 worktree 隔离

### 事实
- **本周 +2,292 星，累计 1.2 万星** — git worktree 管理 CLI，三个核心命令把 worktree 用得像分支，配 hooks 自动化与 copy-on-write 构建缓存，为并行跑 AI agent 设计（*潮流*）（[repo](https://github.com/max-sixty/worktrunk) · 抓取于 2026-11-08）

### 简评
多个 agent 同仓并行会互踩，worktree 是现成的物理隔离手段，但原生 git 的 worktree 命令难用；这个项目把隔离层压到三条命令，还顺手解决重复构建的成本问题，定位比通用 worktree 工具更垂直。能力面窄、可替代性强，但立刻能用。

**结论**：值得导入 — 上手成本低、解决的是并行的硬需求，试错代价几乎为零。

## CoworkOS（论文）

### 事实
- **CoworkOS: Scaling Agent Coworkers for Real-world Automation** — 面向长程生产力工作的通用 harness：把任务策略与执行管理解耦，用共享工件支撑人在回路协作，并靠持续自动化后训练稳定提升模型（*论文*）（Renmin University of China，[paper](https://huggingface.co/papers/2611.03178) · arXiv:2611.03178 · upvotes 100 · 快照 2026-11-08）
- **开源侧信号** — 论文附 repo `RUC-NLPIR/CoworkOS`（⭐141），为论文线本周开源头部件之一（*论文*）

### 简评
本周 upvotes 第二，也是论文线里唯一把 harness 设计、共享工件与数据飞轮一起交出的工作：策略与执行管理解耦、人在回路靠工件而非对话，这两点在工程上都有直接对应物。开源仓库已有一定关注度，可当作观察到 harness 论文落地的锚点。

**结论**：值得观望 — 是本期最可能被直接借鉴的 harness 设计，但要先看长期任务上的实际成功率与数据飞轮是否真能复现。

## Harness-S（论文）

### 事实
- **Harness-S: Learning from Sibling Harnesses for Generalizable Agent Training** — 观察到 harness 演化具有局部性、互补性与非平稳性，于是让同源的「兄弟 harness」选择性接管基础 harness 的失败 rollout，再把能力蒸馏回单一策略，使换 harness 后仍有效（*论文*）（Shanghai JiaoTong University，[paper](https://huggingface.co/papers/2611.04277) · arXiv:2611.04277 · upvotes 63 · 快照 2026-11-08）
- **开源侧信号** — 附 repo `DeepExperience/Harness-S`（⭐57）（*论文*）

### 简评
首个把「harness 组合」当训练信号的方法论，直指 agent 训练对单一 harness 的过拟合——这与工程侧「换 harness 就跑不动」的体感是同一个问题。方法本身是训练侧的，不改变推理时的部署形态。

**结论**：仅记录 — 对做 agent 训练的人有直接价值，做部署和 harness 选型的人暂时用不上。

## 本周热门（潮流线）

- **milind-soni/OpenMausBot** 本周 +7,077 星（⭐1.7 万）：聊天应用里每个 bot 背后是一个本地运行的 Claude/Codex agent，各自有 personality、模型、云电脑与已连应用，Electron 跨三平台 — [repo](https://github.com/milind-soni/OpenMausBot)
- **The-PR-Agent/pr-agent** 本周 +1,576 星（⭐1.5 万）：自称原版开源 PR reviewer，自托管、多模型，README 明确声明不是 Qodo 免费版；2023 年建，仓库迁名/所有权变更后重新走热 — [repo](https://github.com/The-PR-Agent/pr-agent)
- **vercel-labs/agent-browser** 本周 +1,476 星（⭐4.7 万）：Vercel Labs 的 Rust 浏览器自动化 CLI，`snapshot` 把页面转成带 `@e1` 引用的紧凑无障碍树，agent 按引用点击再读页面校验，浏览器跨命令常驻 — [repo](https://github.com/vercel-labs/agent-browser)

## 本周论文（论文线）

- **Advances in Agentic Computer Graphics**（University of Texas at Austin〔模型判读〕· upvotes 143）：为「LLM agent 写图形学代码并迭代精修」建立统一分类体系与文献系统，梳理人机协作与长程规划的开放问题 — [paper](https://huggingface.co/papers/2611.01860)
- **From Autonomous Agents to Cognitive Symbionts**（University of Oxford · upvotes 86）：立场论文，主张下一步不是更强自主性，而是共享人的情境、历史与记忆的「认知共生体」，增强而非替代判断 — [paper](https://huggingface.co/papers/2611.05376)
- **Route Anything**（National University of Singapore〔模型判读〕· upvotes 79）：异构专家模型 / 工具 / 策略池上的质量-成本路由，学习式路由器在 16 个 benchmark 上稳定优于手工规则，平均效率提升 8.82× — [paper](https://huggingface.co/papers/2611.05275)〔repo: InfRec-Cardinal/route-anything ⭐18〕
- **Video Generation Meets Agent Harness**（Video Rebirth〔模型判读〕· upvotes 78）：用 harness（构上下文、暴露工具、维护状态、路由反馈、管预算）包住视频模型，同时充当世界模型交互运行时并接入递归自我改进 — [paper](https://huggingface.co/papers/2610.40191)〔repo: agentic-videogen/awesome-agentic-videogen ⭐57〕
- **FrontierPhysics**（BenchFlow〔模型判读〕· upvotes 56）：42 位物理学家自建 56 个端到端任务，要求 agent 走完文献综述到验证全过程，配确定性验证器 + 专家 rubric — [paper](https://huggingface.co/papers/2611.06910)
- **Axion 1.0**（ByteDance〔repo 归属核验〕· upvotes 48）：完全开源的 agent 基座模型，训练只走「两阶段 SFT + RL」，明确不做 mid-training / DPO / on-policy distillation — [paper](https://huggingface.co/papers/2611.03233)〔repo: bytedance/axion1_0 ⭐61〕
- **R²Orch**（Chinese University of Hong Kong, Shenzhen · upvotes 48）：编排器训练不依赖手工课程，内循环自选任务自博弈、外循环内化技能并做技能退出，缓解优势塌陷与单点评测噪声 — [paper](https://huggingface.co/papers/2610.22740)〔repo: beita6969/R2Orch ⭐48〕
- **CUA-Master**（Beijing University of Posts and Telecommunications〔模型判读〕· upvotes 46）：嵌套双环递归改进，外层「世界-数据模型飞轮」扩语料、内层快照回滚重试与双路轨迹重建提质，OSWorld Verified 达 80.2 — [paper](https://huggingface.co/papers/2611.03126)〔repo: xlyu0106/CUA-Master ⭐124〕
- **IdeaTaste**（Carnegie Mellon University · upvotes 46）：以 2025 年文献快照让模型写提案、用 2026 年真实发表打分，AI agent 在「大方向」上与人一致，具体方法与成功预期明显落后 — [paper](https://huggingface.co/papers/2611.03424)〔repo: cxcscmu/IdeaTaste ⭐27〕

## harness 监控名单提名

- **pingdotgg/t3code** — 提名进 harness-digest 监控名单（上期已提名，本期重申）：已从「移动控制面」长成四端 + 常驻 server 的完整控制面，单周 +17.1k，值得在深度线跟踪其 provider 适配与远端执行架构。
- **thedotmack/claude-mem** — 提名进 harness-digest 监控名单：跨 harness 记忆层是名单内四家（Hermes / pi / Codex / Claude Code）都会碰到的横切能力，适合作为「记忆线」观察对象；注意主要维护者单一。
- **milind-soni/OpenMausBot** — 提名进 harness-digest 监控名单：本地 agent + 每 bot 云 VM + 聊天审批的组合是 agent 编排的应用层新形态，可观察其 VM 隔离与多 bot 调度是否形成可复用架构。
- **vercel-labs/agent-browser** — 提名进 harness-digest 监控名单（备选）：Vercel Labs 出品的浏览器原语已进入多家 harness 的工具链讨论，作为能力层候选跟踪；优先级低于上三条。

建议：先采纳前三条进监控表；agent-browser 作为备选挂起，等它在名单内任一 harness 的官方工具链里出现再升级。
