# Agent Harness 更新简报 · 2026-11-08

> 时间窗：2026-10-30 ～ 2026-11-08（本地时区 CST） · 数据源：各项目官方 GitHub（链接见各节）
> Hermes / Codex 为 release `published_at`（UTC 转本地）；pi / Claude Code 为 changelog 入账 commit 日期（UTC 转本地）。
> 重叠处理：上期为 [agent-harness-brief-2026-10-25](https://github.com/mathpuppy/ai-scout/blob/a605c9595527ef63cdce7ed9081ab2fd84590e86/raw/lines/2026-10-25/agent-harness-brief-2026-10-25.md)（窗口 10-16 ～ 10-25），与本期间隔 10-26 ～ 10-29 四天，无重叠版本，本期全部为首次收录。
> 抓取备注：Codex 的 `releases?per_page=100` 端点连续三次返回 GitHub 500 页（Unicorn），改为 `per_page=20` 后成功，已覆盖到 10-27 的 rust-v0.165.0，窗口起点 10-30 未受影响，无数据缺口。Codex alpha 线（0.167.0-alpha.*、0.168.0-alpha.*、0.169.0-alpha.3）按名单规则不进简报。

## TL;DR

| Harness | 本期一句话 | 值得关注 |
|---|---|---|
| Hermes Agent | v0.22.6/0.22.7 两 patch + v0.23.0 一次性兑现整窗 curated notes：单网关独占会话 + Desktop 上浏览器 | 单网关持有全部会话、Webapp、可插拔 delegation 正式落地、付费 MCP 工具计价与消费上限 |
| pi | 1.5.0 单版，收敛期结束但幅度不大，主线是工具层 schema 语义统一与 MCP 身份默认切换 | 工具参数校验迁到 pi-schema（破坏性）、MCP OAuth 默认走 CIMD、扩展包更新可看 changelog |
| OpenAI Codex | 0.166.0 / 0.167.0 两稳定版，审批闸门铺到多代理与托管策略，会话变成可迁移对象 | Guardian 复核覆盖原生多代理调用、托管命令检查点、跨后端会话切换、Code Mode 输出有界化 |
| Claude Code | 2.1.314 → 2.1.319 五版（315 跳号），两次有架构含量：写入硬边界与 MCP tasks 转默认 | 工作目录外写入禁令、子代理独立 effort、Monitor 纳入统一 Bash 权限闸门、沙箱信任传播收紧 |

**本期大盘**：四家节奏明显分化——Hermes 用一次大版本把上期押后的整窗内容一次交付并完成了"单网关"这一架构收尾，Codex 与 Claude Code 各两/五版持续在**权限闸门一致化 + 会话可迁移 + 子代理预算**三条线上小步推进，pi 则进入以兼容性修正为主的单版周期。共同指向是"闸门收口"：新增的执行通道（Monitor、多代理动作、codemode 输出、工作目录外写入）都被逐一纳入既有的权限或配额体系，而不是各开一套。

## Hermes Agent
窗口内版本：v0.22.6（11-03 01:18）、v0.22.7（11-04 05:53）、v0.23.0（11-06 05:32）。三者均本期首次收录，且两版 patch 的正文明确"curated notes 随 v0.23.0 一并发布"，故本节以 v0.23.0 一次性展开的条目为准。[Releases](https://github.com/NousResearch/hermes-agent/releases)

> 上期预告兑现：上期判断"curated notes 整窗押后到 v0.23.0、内核增量藏在暂不展开清单里、核心架构未见收尾信号"——本期 v0.23.0 正文以 "The Hearth Release" 交付了 v0.22.1–v0.22.7 的完整说明，并明确宣布单网关架构（上期挂账的收尾项）已完成。

### 核心更新
- **单网关持有每一个会话** — 每个 profile 在本机只跑一个 gateway，CLI、TUI、Desktop、ACP 编辑器、机器人、cron 全部改为 client 接入：一个会话一份队列、一份历史，在 Desktop 里 steer/edit 排队中的 prompt 不会被执行两次。*纳入理由：会话所有权从"各表面各跑一份 agent 写同一份会话"改为"单写者 + 多客户端"，是多入口 harness 的执行模型级重构，也是上期挂账的收尾项。* ([v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0)（published 2026-11-05T21:32:33Z，本地 11-06 05:32）)
- **Desktop 工作区搬进浏览器标签（Webapp）** — `webapp.enabled` 打开后由 gateway 自身监听器提供整套 Desktop 工作区（同一批 chat、Group Chat、插件与设置），可局域网访问或经 Nous 登录挂公网 URL；单用户、默认关闭，Docker 与 Nix 包已内置。*纳入理由：新增"对自身生态外提供服务面"的能力，同时引入浏览器侧身份与 CSP 边界，属新能力面。* (v0.23.0，见上链接)
- **可插拔 delegation 后端正式落地** — `delegation.backend` 决定每个 `delegate_task` 如何变成子 run，默认策略本身已被抽成内置插件；官方 `advanced-delegation` 插件提供 model-map 与 per-profile 路由，`/delegation <mode>` 存档到下一会话、`--now` 立即生效，另加 `delegation.prefix_stagger_seconds` 让批量子代理复用 prompt cache。*纳入理由：上期仅从 patch 的一句话清单推断到这条，本期正式兑现——子代理派生从核心固定逻辑变成可替换后端 + 显式路由，多代理执行宿主的架构级变化。* (v0.23.0，见上链接；上期版本见 [v0.22.5](https://github.com/mathpuppy/ai-scout/blob/a605c9595527ef63cdce7ed9081ab2fd84590e86/raw/lines/2026-10-25/agent-harness-brief-2026-10-25.md))
- **付费 MCP 工具的标价与每会话消费上限** — MCP 服务器（插件包或 `config.yaml`）可声明每个工具单次调用成本与每会话额度，审批卡显示单价与该会话累计，将超限的调用即使在 YOLO 模式或已信任服务器上也要先问；未信任服务器的 "Allow for this session / Always" 也真正生效并在提示里遮蔽参数密钥。*纳入理由：成本从"事后账单"变成审批闸门的一部分，是与权限并列的第三种资源约束。* (v0.23.0，见上链接)
- **Group Chats 自治与机器人环路封顶** — Bot Mode 房间可用 lead bot 或 `auto` 路由决定谁回答无人点名的消息，cron 可投递到房间（`deliver: room:<id>@<profile>`）只唤醒被 @ 的机器人，房间有 purpose 与 shared notes，机器人互聊以 `max_hops`（默认 4）封顶且不再收到 runtime 通知。*纳入理由：多代理协作从"人类点名"升级为"房间自调度 + 环路治理"，是编排层的机制新增。* (v0.23.0，见上链接)
- **插件自更新与版本地板** — `hermes plugins update`（无参数即列出所有可更新项）配合 `plugins.auto_apply` 自动更新开关（默认关），目录条目的 `requires_hermes` 在安装与更新时强制生效，新增 Verified tier（由产品厂商自建）；目录规模从约 600 涨到 1,050+。*纳入理由：插件生态从"人工安装 + 手工升版本"变为自维护供应链，并补上版本兼容闸门这一能力面。* (v0.23.0，见上链接)
- **技能锁定（`hermes curator lock`）** — 锁定后 agent 无法通过 `skill_manage`、文件编辑或终端写入改动该技能，`--yolo` 也不例外，curator 也不会归档它；同时内置技能从 58 收敛到 44（Word/PPT/Excel 合并为 `microsoft-office`），12 个长尾技能改为可选安装，压缩删掉的技能一律留 reload marker。*纳入理由：技能系统首次引入"人写内容不可覆盖"的权限语义，并重建了技能集的加载契约，属能力面 + 上下文策略。* (v0.23.0，见上链接)
- **opt-in prepared compaction** — `compression.prepare_ahead: true` 时临近触发点就在后台写好下一份摘要，压缩不再中断回合，期间到达的消息逐字保留在尾部；摘要要求把不确定断言列在 `UNVERIFIED:` 行上。*纳入理由：压缩从同步阻塞改成预写 + 尾部直通，是上下文管理策略的结构性调整。* ([v0.22.6 · 2026-11-03](https://github.com/NousResearch/hermes-agent/releases/tag/v0.22.6)（published 2026-11-02T17:18:36Z，本地 11-03 01:18）/ v0.23.0 展开)
- **插件 SDK 进入回合生命周期** — 新增 `ctx.post_message`（发消息并可原地编辑）、`ctx.side_question`（回合后向本会话 agent 提附加问题，需用户同意）、`pre_llm_call` 可阻断整回合、`hold_stream`（等改写钩子跑完再放流）、`post_compaction`、`on_session_delete`；插件可声明 OAuth client，由 Hermes 代跑登录并只在声明域名上附带令牌。*纳入理由：插件从"工具扩容器"变成可参与推理前后与流式时机的执行参与者，扩展面能力级扩容。* (v0.23.0，见上链接)
- **MCP 事件反向推送（实验，opt-in）** — `mcp_servers.<name>.events: true` 时服务器可主动通知 Hermes，每个事件经 gateway 的 webhook 监听器起一次 agent run；配合工具进度流式化与"服务器声明的更长 deadline 不再被通用超时截断"。*纳入理由：MCP 由"工具拉取"变为"事件驱动一次 agent run"，是把 MCP 从工具层拉进触发层的能力面变化。* ([v0.23.0 · 2026-11-06](https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0))

### 评估
v0.23.0 是对 v0.22.0 以来约 10,080 commits / 1,950 PR 的一次性结算，也是本期四家里唯一明确改变执行模型的一版：**单网关持有会话**把此前"CLI/TUI/Desktop/ACP/机器人/cron 各自跑一份 agent 写同一库"的隐患收口，顺带把上期就挂账的核心架构收尾项结清，并直接为 Webapp（同一会话在浏览器标签里可见）铺路。第二主轴是**生态治理**——插件自更新 + `requires_hermes` 版本地板 + Verified tier + 技能锁定，说明 Hermes 的扩展规模（600 → 1,050+）已经逼出"谁能改什么、能升到哪一版"的治理需求。第三是**成本与触发**从边缘走入核心：付费 MCP 工具计价进审批卡、MCP 事件可反向起 run、`pre_llm_call` 可阻断推理前回合。值得注意的是本期几乎所有新增开关都是 opt-in 且默认关（Webapp、自动更新、prepared compaction、MCP events），与此前几版的高频 patch 风格一致——先铺能力面，默认行为仍保守。

### 其他动态
v0.23.0 breaking changes：移除 agent-browser 与 10 个 `browser_*` 工具（浏览器自动化只剩 `browser_exec`）、`hermes mcp serve` 改名 `hermes mcp-serve` 并移入插件、Electron 44（Desktop 需 macOS 13+ / 64 位 Windows）、Webapp 默认关闭。默认模型从 GLM-5.2 移到 GLM-5.3；新增 GPT-6.1 Terra、DeepSeek V4.1 Flash 1017、Gemini 4 Argon；Daybreak（OpenAI Trusted Access for Cyber）按账号 Codex 目录逐请求校验。TUI/CLI 终端内嵌图片（kitty/Ghostty/iTerm2/WezTerm/Konsole 真像素，其余色块）；`/rewind`（Esc Esc）回溯早前消息后编辑重发或从该点 fork，原会话不变，TUI 支持回合中 `/new` 让旧回合转后台。Desktop 多 gateway 同屏、终端的宿主机归属、Kanban 固定为快捷标签；Telegram `dm_topic_auto_transfer`、Discord 更长审批超时、Signal/Weixin/BlueBubbles/QQ/Yuanbao/WhatsApp Cloud 全部改为内置平台插件；`patch`/`write_file` 开 LSP 后单次编辑 10.1s → 0.06s；`hermes sessions refresh-prompts` 让续接会话在下一回合吃到改过的 `SOUL.md`/技能；`--cpu-profile PATH`；安装脚本改为默认 checkout 最新稳定版。v0.22.6 / v0.22.7 的 patch 清单（`/model reset`、cron cancel + missed-run 策略、OS keychain 存 vault key、ElevenLabs 声线由 agent 自选、群聊重命名/解散/@mention、Desktop 更新错误框）已并入上述 v0.23.0 条目或属交互细节，不再单列。

## pi
窗口内版本：1.5.0（入账 2026-11-02，commit `f9a2636556` "Release v1.5.0" 于 2026-11-02T10:38:21Z，本地 11-02 18:38）。[CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)

> 上期收录到 1.4.0（入账 10-22）。1.5.0 之后至 11-06 的提交仍在 `[Unreleased]` 段，尚未发版，仅作观察不入账。

### 核心更新
- **工具参数校验统一到 pi-schema（破坏性）** — `@earendil-works/pi-schema` 接管工具参数校验：超出 JSON Schema 的 TypeBox 特性（`Type.Refine()`、`BigInt()`、`Undefined()`、codec、`Format.Set()`）不再作用于工具参数；普通 JSON Schema 工具（含 MCP 工具）首次获得与 TypeBox 工具相同的强制转换（数字字符串、单值包装成数组）；校验失败文案改为 `- path: missing` 形式。*纳入理由：agent 工具调用入口的 schema 语义被单一化，且明确列为 breaking，属工具层架构变更而非修复。* ([1.5.0 · 2026-11-02](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md#150---2026-11-02))
- **MCP OAuth 默认改用 Client ID Metadata Document** — 授权服务器支持公共客户端时，pi 用自身托管的 CIMD 做客户端身份，否则退为动态注册；`oauth.clientRegistration: "auto" | "dcr"` 控制，`pi mcp add --oauth-client-registration` 可覆盖，旧注册在其 redirect URI 未变时继续沿用。*纳入理由：MCP 身份获取策略换默认，与 Codex / Claude Code / opencode 的公共客户端做法对齐，属 MCP 能力面的架构调整。* (1.5.0，见上链接)
- **扩展包更新后可审阅 changelog** — 包可用 `package.json` 的 `pi.changelogPath` 或包根 `CHANGELOG.md`，pi 在下次冷启动把高于"上次所见版本"的条目显示在 "Extension Updates" 下，`collapseChangelog` 可压缩成每包一行。*纳入理由：扩展生态补上"更新内容可审计"这一能力面，此前扩展升级对用户是不透明的。* (1.5.0，见上链接)

### 评估
1.5.0 是收敛期的收尾而非扩张：新版特性只有四条，其中三条是能力面（schema 校验、MCP 身份、扩展 changelog），第四条是模型目录（GPT-6.1 Terra）。真正有分量的两条都落在**入口一致性**上——把工具参数校验从 TypeBox 私有语义迁到独立 schema 包，使 MCP 工具与内置工具获得同一套强制转换与错误文案；把 MCP OAuth 的默认从"动态注册"改为"优先用自家 CIMD"。这与上期"pi 在补 MCP OAuth URL 校验"是同一条线的延续：身份与校验逐步向主流实现靠拢。其余大幅条目集中在稳定性（`pi.exec()` 的缓冲区/SIGKILL/UTF-8、Windows 路径大小写、session 写入失败导致的续接丢历史）与渲染性能（大 tool call 增量解析）。节奏上 pi 从上期的单版 1.4.0 到本期单版 1.5.0，仍是"两周一小步"。

### 其他动态
GPT-6.1 Terra 进目录（OpenAI / Azure OpenAI Responses / OpenAI Codex，Codex 侧 500K 上下文，支持 tool search 与回合中改 thinking 级别）；OpenAI 默认模型 `gpt-5.5` → `gpt-6.1-sol`；模型目录换 models.dev v2（realtime 与 image-only 模型不再作为 chat 模型提供）；系统提示词有收紧（changelog 未展开细节）；`PI_SELF_UPDATE_COMMAND` / `selfUpdateCommand` 支持用 wrapper 或其他包管理器自更新；`blocked` 选项从 overlay 扩到 inline `ctx.ui.custom()` 组件并附带 OSC 7501 程序状态上报（宿主可感知"pi 正在等用户输入"）；`pi.exec()` 加 `maxBuffer` 与 `truncated`；`Usage.cost.totalFromProvider`、`responseModel`、`MarkdownTransformContext` 的 `messageId` / `timestamp`；安全面修了 MCP OAuth 元数据拒非 `http(s)` URL、登录与设备码 URL 的控制字符注入、glob 放大 DoS、bash abort 未先停进程组；图片缩放改用更小体积编码；`--model <provider>/<id>` 支持带斜杠的 provider ID。
**未发版观察（`[Unreleased]`，不计入本期）**：Anthropic 会话改为 message threads——每次请求只发新增消息、由服务端续接上一回复，会话变更（压缩、工具列表变动）时回退为整包发送，默认在 `api.anthropic.com` 上对 `anthropic` provider 开启；另有 `pi auth login/logout <provider>`、Markdown transformer 新增 `messageTypes` 选择（custom/summary/changelog 表面）、`GrepOperations.readFile` 被移除。这些若随下一版本发布，将是比 1.5.0 更强的架构级变化。

## OpenAI Codex
窗口内稳定版：rust-v0.166.0（10-30 03:47）、rust-v0.167.0（11-06 09:40）。[Releases](https://github.com/openai/codex/releases)

> 只取 `prerelease=false && draft=false`。窗内 alpha 线（0.167.0-alpha.2/3/3.1/3.2/4/5、0.168.0-alpha.*、0.169.0-alpha.2/3、libcap-v2.75）按名单规则不展开。

### 核心更新
- **Guardian 复核铺到原生多代理调用** — 0.166.0 将状态变更类 multi-agent 调用路由进 Guardian 复核，保留原生多代理调用历史并集中分类（#57451、#57455、#57448、#57430）；0.167.0 再加入 recorded exec calls 的直接复核，以及直接复核前执行 `PreToolUse` hooks（#58028、#58368）。*纳入理由：审批闸门从"单次工具调用"扩到"跨代理的状态变更动作"，安全架构的覆盖面变化。* ([rust-v0.166.0 · 2026-10-30](https://github.com/openai/codex/releases/tag/rust-v0.166.0) / [rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0))
- **托管式命令检查点要求全新人工批准** — 新增托管命令检查点与 `permissions.network` 托管网络约束；其中 `prompt-user` 类命令规则要求新的人工批准（#58045、#58182）。*纳入理由：托管策略下"批准时效"被显式收紧，是审批模型层的变化。* ([rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0))
- **MCP 连接跨会话共享 + 每 chat 租约** — 0.166.0 让符合条件的本地 stdio MCP 连接在多个 chat 间复用，并按调用方隔离输入与超时（#57211、#57196）；0.167.0 为共享连接补上 per-chat lease（#57978）。*纳入理由：MCP 连接由"每 chat 一份"变成共享资源池 + 租约隔离，多会话资源模型变化。* ([rust-v0.166.0 · 2026-10-30](https://github.com/openai/codex/releases/tag/rust-v0.166.0) / [rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0))
- **跨后端会话切换** — 终端 session picker 可在已连接的不同 backend 之间切换并保留草稿（#58457、#58280）；同版还让 `codex agents --no-daemon` 打开 agent 命令中心并在选择器标记未读结果（#58238、#58263、#58264）。*纳入理由：会话从"绑定单一后端进程"变成可迁移对象，会话层架构变化。* ([rust-v0.167.0 · 2026-11-06](https://github.com/openai/codex/releases/tag/rust-v0.167.0)（published 2026-11-06T01:40:00Z，本地 11-06 09:40）)
- **Code Mode 输出有界化与协商式截断** — 引入有界输出收集与渲染并接入 codemode runtime，服务端截断可经协议协商（#57848、#57850、#57870、#58125、#58159）。*纳入理由：codemode 执行输出的资源边界被协议化，属执行模型层面的约束设计而非单点修复。* (rust-v0.167.0，见上链接)
- **provider 身份与托管接入扩展** — TUI onboarding 增加 Google Cloud Vertex AI 设置（ADC 或凭证文件，`gcp_setup_wizard`，#57857），登录方式归入 "Sign in another way" 子菜单（#58427），gateway OAuth 凭据改为可落盘存储并在 token rotation 后安全重载（#58219、#58251、#58343）。*纳入理由：模型/provider 身份的获取与生命周期被当作独立能力面在建设，延续上期"安全与身份"主线。* (rust-v0.167.0，见上链接)
- **排队消息可恢复已卸载线程** — `codex queue --resume` 在排队消息时指定恢复一个未加载的线程（#57232）。*纳入理由：队列与线程加载生命周期解耦，是会话可迁移路线的配套能力面。* (rust-v0.166.0，见上链接)

### 评估
两版稳定版延续了上期"安全与身份"的主线并把它往前推了一格：Guardian 从"复核单次工具调用"扩到"复核跨代理的状态变更动作"，加上托管命令检查点必须每次重新批准，等于把**审批闸门的一致性与时效**当作独立议题来处理——这与 Claude Code 本期把 Monitor 纳入统一 Bash 规则是同向动作。第二条线是**会话可迁移**：跨后端 session picker + `queue --resume` + 命令中心未读标记，说明 Codex 在多后端（本地/远程 app-server/云）并存的现实下，正在把"会话"从进程附属物提升为可搬运的一等对象。第三条是资源边界：MCP 连接共享 + per-chat lease、Code Mode 有界输出与协商截断，都是把"多会话共用昂贵资源"的系统性风险收进显式契约。发布节奏上稳定版仍是每 7–8 天一版，alpha 线继续高频（窗口内 10 余个 alpha tag），但正文仅 25 字符不留信息，本期无从评估。

### 其他动态
v0.166.0：终端键盘驱动转录选择（词/行/页 + 集成搜索 + 可配快捷键）、异步问题与回复统一渲染 Markdown、GPT-6.1 Terra 进 bundled / Vertex AI / Amazon Bedrock 目录、安全策略阻断给出解释与可选的更安全改写建议、`codex doctor --network-only`、Bazel 切到源码构建 V8、独立 executor 进 CLI 与 app-server 发布包、进程级 session index 变更串行化、加载最多 8 个插件并发。
v0.167.0：本地图片附件缩略图预览与转录内可点击路径、`Ctrl+L` 清屏但保留历史（`Ctrl+T` 可回看）、`/experimental` 开放系统代理、审批提示里可内联展开 patch、上下文压缩估算把失败回复的保留输出与缺失 usage 的回复计入、插件进程宿主（有界 IPC + 生命周期）、增量 skill catalog（`skill_catalog_deltas`）、MCP 消息板工具适配器、托管 OpenTelemetry 配置与 PEM 客户端身份、`codex-exec-server` 独立二进制改为不随发布包分发、Linux musl 构建降低 jemalloc arena。

## Claude Code
窗口内版本：2.1.314（10-30 09:06）、2.1.316（10-31 09:01）、2.1.317（11-03 09:25）、2.1.318（11-04 08:00）、2.1.319（11-07 01:03）。版本号 2.1.313、2.1.315 在 changelog 中不存在（跳号）。以上为 CHANGELOG 入账 commit 的 committer 日期（UTC 转本地），非 release 时间。[CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

### 核心更新
- **工作目录外写入成为硬边界（2.1.314）** — 新增 `permissions.blockWritesOutsideWorkingDirectories`：Write、Edit、NotebookEdit 在**任何**权限模式（含 bypass）下都拒绝工作目录外的路径。*纳入理由：写入边界从"随权限模式浮动"变为配置声明的硬约束，属权限模型级变化。* ([2.1.314 · 2026-10-30](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21314))
- **空闲压缩进入 IDE 表面（2.1.314）** — VS Code 与 Claude Desktop 的 Code 标签获得 idle compaction：200K+ token 会话空闲即摘要，若 prompt cache 已过期，下一句直接用该摘要。*纳入理由：压缩策略从"终端内触发即阻塞"扩为"空闲预压缩 + 缓存过期后复用"，上下文管理策略的结构性扩展。* (2.1.314，见上链接)
- **子代理推理预算独立（2.1.316）** — 新增 `CLAUDE_CODE_SUBAGENT_EFFORT`，在未另行指定时决定子代理的 effort，而不再继承会话；2.1.318 进一步让 mod 的 `$.model.fork` 支持 `effort` 选项（侧任务可固定 `low` 并回报实际发出的 effort），且子代理为不同模型时改用该模型已保存或默认的 effort。*纳入理由：子代理从"跟随主会话预算"变成"有独立可配推理预算"，多代理执行的成本/行为模型变化。* ([2.1.316 · 2026-10-31](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21316) / [2.1.318 · 2026-11-04](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21318))
- **后台子代理转后台保缓存（2.1.318）** — 后台子代理的 shell 命令在所有 provider 上跑满 3 分钟即转后台，避免 prompt cache 在等待期间过期；在 "Ask each time" 设置下子代理改为停止而不切模型。*纳入理由：子代理执行时序开始受缓存寿命约束，属执行策略级调整。* (2.1.318，见上链接)
- **SDK hook 改为失败关闭（2.1.317）** — Agent SDK 的 hook 回调新增 `onFailure: "block"`，回调失败即阻断该动作，而不是让它继续执行。*纳入理由：托管 hook 从"尽力而为"变成"fail-closed"，扩展面的语义级变化。* ([2.1.317 · 2026-11-03](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21317))
- **MCP 拒绝名单从名字扩到上游 URL（2.1.318）** — `deniedMcpServers` 的 URL 条目现在也封禁 Anthropic 自带的、上游 URL 匹配的服务器，以及在云会话与 self-hosted runner 上按连接器自身 URL 接入的条目。*纳入理由：MCP 权限面从"按名封禁"扩到"按源封禁"，是权限模型的覆盖范围变化。* (2.1.318，见上链接)
- **MCP tasks 在终端转默认能力（2.1.319）** — 终端内 MCP 后台任务不再依赖 feature-flag 拉取（Bedrock / Vertex / Foundry / LLM 网关 / `DISABLE_TELEMETRY` 场景下均可用），可用 `CLAUDE_CODE_DISABLE_MCP_TASKS=1` 关闭；同版把链接卡、表单卡等云端交互卡逻辑延续到 MCP 请求。*纳入理由：MCP 后台任务从实验特性转为默认能力面，覆盖场景一次性扩大。* ([2.1.319 · 2026-11-07](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21319))
- **Monitor 纳入统一 Bash 权限闸门（2.1.319）** — Monitor 的 WebSocket watch 从此逐条遵循 Bash 命令规则：deny 直接拒绝，ask 规则下 Monitor 的 allow、bypass 模式或 auto 模式都不再跳过提示；Monitor 起的 shell 命令也会触发匹配 Bash 的 hooks（可阻断或询问，但不能批准或改写）。*纳入理由：一条新的执行通道被并入既有权限体系而非豁免，是闸门一致化的架构动作。* (2.1.319，见上链接)
- **沙箱与信任的传播规则收紧（2.1.319）** — self-hosted runner 的 `--trust-workspace false` 现在同时阻止仓库 settings 文件里的 hooks 与 skills 运行；修复经 worktree 的沙箱逃逸；`--add-dir` 目录要自身信任对话被接受后才注册 plugin marketplace；开启 Bash sandbox 时嵌套 `.claude/skills` 只在起始目录或 `/cd` 处加载。*纳入理由：信任与沙箱从"按路径"变为"按来源传播"，多处架构级边界修正。* (2.1.319，见上链接)

### 评估
五连发的重心从上期的"安全与身份"（企业 MCP OAuth、凭据遮蔽）转向**闸门一致化与预算独立**：2.1.314 把工作目录外写入提为配置层硬边界，2.1.319 把 Monitor 这条新执行通道收进同一套 Bash 规则并把信任传播规则逐条收紧，两者构成一次首尾呼应的权限收口；2.1.316 的 `CLAUDE_CODE_SUBAGENT_EFFORT` 与 2.1.318 的 3 分钟转后台，则在把子代理当作有独立预算与时序约束的执行单元来设计。中间两版（2.1.316/2.1.317）主体是云端会话、Claude apps gateway 与 self-hosted runner 的可靠性与成本报表，属企业侧运维增量。值得注意的是本期几乎每版都有 auto mode 的判定一致性修补（无结论时的提示、403/422 处理、云端未标记失败），说明自动模式的服务端判定仍在多网关环境下反复对齐——bug 修复密度仍是四家最高，但架构级条目比上期更集中、更成体系。

### 其他动态
2.1.316：pooled group budgets（团队成员共享月度预算叠加个人额度）、`managed.policy_mode: layered`（所有匹配的网关策略按序叠加合并而非只取第一条）、`guardrail.input_tagging`（Bedrock guardrail 的 prompt-attacks 过滤所需的输入标签）、`CLAUDE_CODE_DISABLE_ULTRATHINK`、`--restricted` 会话不再上传工作目录外文件、Opus 4.8 fast mode 自 2026-10-30 起弃用（11-30 移除，迁移到 Opus 5.5）、`--restricted` / SDK `register_repo_root` 修正。
2.1.317：Claude apps gateway 成本报表 API（`GET /v1/organizations/analytics/cost`，可按总量/开发者/日/IdP 组）、每日记录开发者 IdP 组、OTel 新增 `anthropic.plan`/`seat_type`/`provider`/`custom_base_url`、Web/Shell 工具外发账号邮箱前先确认、`CLAUDE_CODE_DISABLE_NESTED_SESSION_ID`、移除 Read 工具的 "file unchanged since your last Read" 桩（重读未变文件直接返回内容）。
2.1.318：`assume_role` 支持 mantle upstream（跨 AWS 账号与按开发者归因成本）、`claude auth status` 暴露 `loginExpiresAt`、`claude -p` JSON 暴露 `credential_expires_at` 且到期前 10 天在 stderr 警告、云端会话新增 "No repository" 选项、`/claude-api managed-agents-onboard` 的内置工具默认 `auto` 权限策略。
2.1.319：self-paced `/loop` 在回合结束未重排时结束（不再排 fallback wakeup，`CLAUDE_CODE_LOOP_KEEPALIVE=1` 保留旧行为）、PostToolUse hooks 在被打断的 tool call 上运行（最多 10 秒）、移除 Claude in Chrome 的 `shortcuts_list` 与 `shortcuts_execute`、artifact database 行保存加隐藏标记文件以免覆盖他人写入、`claude -p` 在 auto 模式无安全判定可用时改为 exit 1、`/context` 表格收敛（每列表最多 10 行、按需 MCP 工具按服务器合并一行）。
2.1.314：Claude apps gateway upstream 增加 `groups`（按 IdP 组只把指定开发者路由到该 upstream，failover 亦然）、`guardrail_trace`、`claude -p` 启动失败时打印错误并 exit 1、多个平台侧的模型回退与 `Invalid effort level` 自动降档重试、PreCompact hook 输出截到 10,000 字符、`~/.claude/skills/.trash` 与 plugins trash 各限约 1024 条、长 headless/SDK 回合不再把每个子代理的 tool 结果留到回合结束。

## 横向趋势
1. **审批闸门一致化，而非平行扩张。** 本期四家都在把"新增执行通道"并入既有权限体系：Codex 把原生多代理调用与托管命令检查点送进 Guardian，Claude Code 把 Monitor 的 WebSocket watch 与 hooks 纳入 Bash 规则、把写入边界提为配置层硬约束，Hermes 把付费 MCP 工具成本并入审批卡，pi 把工具参数校验统一到一个 schema 包。共同点是不为新通道开新特例——这是四家对"多入口、多代理"现实的统一回应。
2. **子代理从"复制主会话"变成"有独立预算与路由的单元"。** Hermes 的 `delegation.backend`（含 model-map / per-profile 路由与 `prefix_stagger_seconds` 缓存复用）、Claude Code 的 `CLAUDE_CODE_SUBAGENT_EFFORT` 与 3 分钟转后台保缓存、pi 未发版的 Anthropic message threads（只发增量消息、服务端续接）、Codex 的多代理动作走复核，指向同一件事：子代理的模型、effort、时序与上下文要从主会话里解耦出来。
3. **会话成为可迁移对象。** Hermes 用"单网关持有全部会话、其余表面做 client"解决多入口写同一会话的根性问题；Codex 用跨后端 session picker + `queue --resume` 允许多后端并存下的会话搬运；Claude Code 用 idle compaction 让 IDE 表面也能在缓存过期后接续上下文。方向是会话状态与运行进程、运行表面逐渐解耦。
4. **MCP 从"工具接入"走向"资源与身份治理"。** Codex 共享连接 + per-chat lease + 协商式截断，pi 默认改用 CIMD 身份，Hermes 让付费工具声明成本并支持事件反向起 run，Claude Code 让 MCP 拒绝名单覆盖上游 URL、MCP tasks 转默认能力。MCP 已不是"能装几个服务器"的问题，而是连接配额、身份、成本与触发方式的问题。
5. **扩展生态开始自维护、可审计、带版本地板。** Hermes 插件自更新 + `requires_hermes` 强制 + Verified tier + 技能锁定，pi 扩展包更新后可看 changelog，Codex 增加插件进程宿主与增量 skill catalog，Claude Code 补上插件新增依赖的安装。生态规模到千级以后，"谁能改什么、能升到哪、更新里有什么"成为必须内置的能力，而非文档约定。
