# Agent Harness 更新简报 · 2026-11-14

> 时间窗：2026-10-25 ～ 2026-11-14 · 数据源：各项目官方 GitHub（链接见各节）
> 窗口扩大说明：上期简报运行日为 2026-10-25，距今 20 天（>9 天），起点前伸至上期运行日补洞。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.23.0「Hearth」发布，Desktop 工作区整体搬进浏览器、单一网关统一持有会话 | 统一网关/会话模型、Desktop 浏览器化 |
| pi | 1.5.0→1.5.2 小步快跑：免进会话的 auth、坏目录 fork 恢复、流式解析提速 | auth 命令、缓存预热 |
| OpenAI Codex | 终端工作区多侧聊、自定义模型供应商接入（含 device code） | 模型路由/网关 onboarding |
| Claude Code | 实验性 Code Mode（写 JS 调用工具）+ Fable 5.2 默认 + 工作目录外写入拦截 | Code Mode、块写入权限 |
| DeepSeek Harness | 多代理编排落地（SubAgent 多层、AgentTeam、subagent_oar）+ 会话导入 | 多代理、代码审查工作树、会话导入 |

**本期大盘**：五家都在往「多代理/多会话编排」与「把工作区/会话搬进更多界面形态」两个方向叠能力；权限与沙箱边界成为新战场（Claude Code 的工作目录外写入拦截、DeepSeek 的工作树隔离）；模型接入侧的「自定义 provider / 路由」在 Codex 与 pi 同时出现。

## Hermes Agent

窗口内版本：v0.23.1+canary.20261113T064447Z（11-13）、v0.23.1（11-10）、v0.23.0（11-06）、v0.22.7（11-04）、v0.22.6（11-03）

### 核心更新
- **v0.23.0「The Hearth Release」—— 单一网关统一会话** — 整个 Desktop 工作区可在浏览器标签页打开，由自建 gateway 提供；一个 gateway 统一持有每个 session，CLI/TUI/Desktop/编辑器/bots/cron 全部坐到同一张桌，不再各自跑自己的 agent。*纳入理由：会话/网关架构级收敛，改变多端协作的工作方式。* ([v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0))
- **Desktop 浏览器化（webapp + Web Access 面板）** — gateway 自带监听器对外提供 `hermes webapp`，Desktop 插件可在浏览器加载，并可通过 Nous 登录把面板暴露到自己网络或自有 URL。*纳入理由：把桌面能力面扩展到浏览器，属新交互/交付形态。* ([v0.22.6 · 2026-11-03](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.6))

其他动态：v0.23.1 修复插件目录超 2MiB 上限导致安装静默回退（上限提到 16MiB）；v0.22.7 为常规 patch 汇总。

### 评估
Hermes 本期重心是把「会话」从各端各自为政收拢到单一网关，并让 Desktop 工作区浏览器化，属架构级投入，方向是统一工作区入口 + 多端同会话。

## pi

窗口内版本：Unreleased（视作窗内）、1.5.2（11-10）、1.5.1（11-09）、1.5.0（11-02）

### 核心更新
- **免进会话的凭证命令 + 空闲缓存预热** — 新增 `pi auth login/logout <provider>`（API-key / 无浏览器登录），无需启动 session 即可管理凭证；空闲 prompt cache 在划算时最长保温 30 分钟。*纳入理由：凭证管理独立成 CLI 能力，缓存预热影响执行成本/延迟。* ([1.5.1 · 2026-11-09](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md))
- **流式解析提速** — 大型工具调用增量解析、代码密集回答与工具行渲染提速。*纳入理由：流式执行路径的确定性改进（弱，观望）。* ([1.5.0 · 2026-11-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md))

其他动态：Unreleased 增加 `deepseek-v4.1-flash` 系列 provider 与 Qwen Token Plan 密钥变量；1.5.2 支持 fork 目录已丢失的会话。

### 评估
pi 保持高频小步：本期集中在 CLI 凭证、流式性能与模型 provider 接入，无架构级改动，属稳中有进的补强周。

## OpenAI Codex

窗口内版本：rust-v0.169.0（11-13）、rust-v0.168.0（11-13）、rust-v0.167.2（11-12）、rust-v0.167.1（11-11）

### 核心更新
- **终端工作区多侧聊 + 自定义模型供应商接入** — 终端 workspace 支持多 side-chat tab，重启后可恢复本地侧聊；可从终端添加/编辑自定义模型 provider，配合 gateway onboarding 用 device code 在 SSH / 无本地浏览器场景开通。*纳入理由：模型路由能力下放到终端，多会话工作区形态扩展。* ([rust-v0.169.0 · 2026-11-13](https://github.com/openai/codex/releases/tag/rust-v0.169.0))
- **会话侧栏（tui_workspace）与多媒体能力** — 会话旁开 side conversation（可拖动分栏、`leader z` 缩放）；浏览/选择默认模型 provider；音频模型可附带录音并跳过已确认拒绝的录音；实验性动画 GIF 生成。*纳入理由：多路会话形态 + 音频/图像能力面扩展。* ([rust-v0.168.0 · 2026-11-13](https://github.com/openai/codex/releases/tag/rust-v0.168.0))

其他动态：v0.167.2 在 Vertex AI 上默认增量发送工具更新；v0.167.1 仅 changelog 无实质条目。

### 评估
Codex 本期把终端形态做厚：并行侧聊 + 模型供应商自管 + 多媒体，与 Hermes「多端同会话」同向，但 Codex 偏终端内多路而非跨端统一。

## Claude Code

窗口内版本：2.1.325（≈11-14）～ 2.1.311（≈10-27），共 11 节（日期为 commit 就近近似）；2.1.310（≈10-24）落在窗口外，不展开。

### 核心更新
- **Code Mode（实验性）** — Claude 写 JavaScript 来调用自身工具，可选开启（组织可关闭）。*纳入理由：工具调用执行模型的实验性新路径。* ([2.1.323 · 2026-11-13 近似](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md))
- **工作目录外写入拦截** — 新增 `permissions.blockWritesOutsideWorkingDirectories`：Write/Edit/NotebookEdit 在所有权限模式下拒绝工作目录外路径。*纳入理由：权限/沙箱边界显式化，直接影响安全模型。* ([2.1.314 · 2026-10-30 近似](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md))
- **Fable 5.2 成为默认模型** — 1M 上下文、$8/$40 每 Mtok、$0.20/Mtok cache 读。*纳入理由：默认模型能力面升级。* ([2.1.321 · 2026-11-10 近似](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md))

其他动态：插件声明 `engines["claude-code"]` 版本范围约束安装/更新；mod 的 `$.model.fork` 支持 `effort` 选项；gateway 侧 pooled group budgets、`assume_role`、groups 路由、OIDC `user_id_claim`；Vertex 快速模式、auto mode 服务端校验收紧；`/schedule` 连接器提示、发送邮箱前确认等。

### 评估
Claude Code 本期三条线并进：实验性 Code Mode（新执行模型）、权限边界硬化、企业网关/计费治理。权限「默认拒绝工作目录外写入」是安全姿态上的显式收紧。

## DeepSeek Harness

窗口内版本：dsh-v0.2.2-rc.3（11-13）、dsh-v0.2.2-rc.2（11-11）、dsh-v0.2.2-rc.1（11-04）、dsh-v0.2.2-alpha.3（11-03）、dsh-v0.2.1-rc.5（10-30）、dsh-v0.2.2-alpha.2（10-28）、dsh-v0.2.1-rc.4（10-28）

### 核心更新
- **多代理编排落地** — SubAgent 支持具名与多层协作，AgentTeam 可按会话开启、共用成员与任务面板；实验性 `subagent_oar` 工具可把独立任务交给本机 Codex 或 Claude CLI。*纳入理由：原生多代理协作 + 跨 agent 委托，是编排能力面的实质扩展。* ([dsh-v0.2.2-rc.2 · 2026-11-11](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2))
- **Git 工作树代码审查** — Git Worktree 支持按分支/提交/文件类型审阅改动，直接处理 GitHub 评审、同步已审阅进度与更新分支；实验性「变更请求与工作树」统一审查与工作树入口。*纳入理由：代码审查能力面 + 会话级工作隔离。* ([dsh-v0.2.2-rc.2 · 2026-11-11](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2) / [dsh-v0.2.2-alpha.3 · 2026-11-03](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-alpha.3))
- **实验性「DeepSeek 会话导入」插件** — 把 DeepSeek App 或网页版历史会话导入工作区并继续对话。*纳入理由：跨端会话迁移新能力。* ([dsh-v0.2.2-rc.3 · 2026-11-13](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.3))

其他动态：rc.1 与 alpha.2 汇总手机/平板适配、多语言（日/西/法/德/俄/葡）、插件管理第三方包更新与热更新回滚、历史会话复制为 Markdown、实验性「个性化推荐」「开发者统计」插件等；rc.5 仅思考内容展示优化；rc.4 为 ACP 模式诊断混入 stdout 的修复。

### 评估
DeepSeek 本期多代理 + 代码审查 + 跨端会话导入三线并进，编排与审阅能力是当前重心；发布节奏仍快（rc/alpha 双轨），功能先在 rc.1/alpha 系列铺开再收拢。

## 横向趋势

- **多代理/多会话编排成为共同主线**：DeepSeek 的 SubAgent 多层 + AgentTeam + subagent_oar、Hermes 的单网关统一多端会话、Codex 的终端多侧聊，三家各自落地「并行/分层 agent 协作」。
- **权限与沙箱边界显式化**：Claude Code 新增工作目录外写入拦截，DeepSeek 用 Git 工作树隔离会话，Codex/pi 在模型供应商与凭证管理上做路由管控——安全边界从「建议」走向「可配置硬约束」。
- **跨端会话/工作区形态扩张**：Hermes Desktop 浏览器化、DeepSeek 会话导入、Claude Code 的 Code Mode，都在把同一会话/工作区搬到更多界面与执行形态。
