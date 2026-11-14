# 周度 Agent Harness 追踪系统 · 设计笔记（轻量版）

> 状态：v3.4（2026-11-06，合流产物合并为一份 + 轻归并条目预算 + 长图改卡片周刊风，记录见文末）
> 定位：一周一次的**信息聚合器 + 筛选评估**，做两件事——五大 harness 官方 release 的主要功能更新盘点 + GitHub 官方周榜的 Agent 相关项目筛选。纳入标准一句话：**技术有价值、够趋势 → 进周报**。不做情报融合、不做交叉验证、不做佐证计数。
> 版本关系：v2.2 全量版（含 folo/aihot/ai-radar 聚合线）见 git 历史；现行为轻量版，砍掉全部聚合器信源，零第三方服务依赖。

## 设计原则（简洁轻量，优先级最高）

1. **最少件数**：1 个编排脚本 + 2 个采集技能 + 1 个合流技能 + Markdown 产物。没有数据库、注册表、自研服务。
2. **只用现成 CLI**：curl / gh 一行流。零 pi 扩展、零 MCP、零新 npm/pip 依赖、零外部账号（folo 等聚合器全部退场）。例外仅两处：周报长图渲染用 playwright（devDependency，见合流段）、harness 抓取预处理用 python3 标准库脚本 `scripts/fetch-harness.py`（零新依赖，见采集线表）。
3. **运行边界写死**：系统运行 = pi + 本仓库 `.agents/skills/`（harness-digest / line-trending / tracker-merge）+ 裸 CLI。开发者（ZCode）的工具只在开发期用，不进系统。
4. **状态即文件**：`raw/lines/<运行日>/`（线产物，一期一目录）+ `reports/<运行日>/`（简报，一期一目录），**只保留最新一期**——run-weekly.sh 成功结束后自动把非本期产物移入 `.archives/weekly-reports/<归档日>/`（gitignored，git 历史仍全量可溯）。潮流线产物契约 = 三个固定小节：①事实条目（三元组 + 纳入理由）②本线研判一段 ③候选提名区（有则写，无则省略）。
5. **不设团队上下文**：系统不维护团队项目 / 技术栈信息，结论标签按技术本身的成熟度与适用面做中立判断（2026-09-20 定，用户拍板）。周报不写「对团队」「对我们要不要用」——落地判断留给读者。日后需要时再建 team-focus 文件接线，属加法不改架构。
6. **按需演进**：以下默认不建，痛点出现再加——确定性归并脚本（产物校验已有 scripts/validate.sh，进一步自动化再说）、模型分层路由、多线并发、缓存、群发 webhook 推送。想加回广度聚合线时，从 git 历史恢复 v2.2 的 line-breadth 及其源技能；论文线恢复路径见 v3.2 记录。

## 总体架构

```text
run-weekly.sh（手动跑；口径稳定后可挂 cron）
  pi -p "/skill:harness-digest"   → raw/lines/<date>/agent-harness-brief-<date>.md
  pi -p "/skill:line-trending"    → raw/lines/<date>/trending-<date>.md
  pi -p "/skill:tracker-merge"    → reports/<date>/agent-tech-brief-<date>.md
  node scripts/r` → reports/<date>/agent-tech-brief-<date>.png（一页信息图，增强产物）
```

失败恢复 = `./run-weekly.sh --from <skill>` 断点重跑（--from 之前已落盘的线跳过）；每线产物落盘即检查点，运行日志在 `raw/lines/<date>/run.log`。

## 窗口口径

| 线 | 窗口 | 说明 |
|---|---|---|
| 潮流线 | GitHub 官方周榜口径（since=weekly，GitHub 自算） | 无本地推算，无重叠去重负担 |
| harness 线 | 起点 = min(运行日−9, 最新一期简报运行日)，终点 = 运行日 | 无历史简报时起点 = 运行日−9；上期运行距今超 9 天（漏跑）时窗口前伸补洞，与上期重叠区去重其技能内自理 |

## 两条采集线

| 线 | 职责 | 数据源 | 状态 |
|---|---|---|---|
| harness 深度线 | 5 个 harness（Claude Code / Codex / Hermes Agent / pi / DeepSeek）版本级深析，筛出架构迭代 / 新能力级更新 | GitHub API + raw CHANGELOG，经 `scripts/fetch-harness.py` 预处理成紧凑摘要（窗口过滤 + 正文截断） | `.agents/skills/harness-digest/`，SOP 沿用 v2.2 |
| GitHub 潮流线 | 本周 GitHub 热门（官方周榜）中 Agent 相关项目的筛选、画像 + harness 线监控名单提名 | `github.com/trending?since=weekly` 页面轻量抓取（curl，无官方 API） | `.agents/skills/line-trending/` |

- 潮流线候选提名区是 harness 线监控名单演化的唯一入口；采纳与否由人改 harness-digest 的监控表。
- harness 线是给人看的简报，merge 直读它，不要求额外机读产物。

## 合流段（tracker-merge → 一份周报 + 一页信息图）

- 输入：两份当期产物，各取文件名日期最新一份；缺哪条线就跳过并标注，**merge 自身零网络请求**，事实只能来自输入文件。
- 唯一产物 **`reports/<date>/agent-tech-brief-<date>.md`**（2026-11-06 起 brief/flash 双产物合并为一份，用户拍板）：自足、可群发、可渲染一页信息图。结构 = 标题（窗口日期）→ 本期大盘 1-2 句 → 按结论标签分三组（值得看/试、值得观望、仅记录，空组写「无」）→ 本周热门 → 其他动态 → 出处附录。
- **条目化与轻归并（只做单线、单 harness 内，不做跨线归并）**：harness 线同一 harness 同类更新合一条（多个 patch 合成「八连发」式）、架构/能力级单独成条、同一功能多候选版本只取最新一条，每 harness 最多 2-3 条；潮流线有价值项目出条目 ≤4 条、其余进「本周热门」清单。**条目预算三组合计约 10-12 条**（实测 10-25 期输入 harness 24 条 + 潮流 17 条，直出条目远超 IM 舒适长度），超出降档进「其他动态」一行（只列版本号/项目名）。
- 详略两档：值得看/试条目 3 行（标题带日期/版本 → 是什么 → 怎么用），观望/仅记录各 1 行；**正文不内嵌链接**（链接集中出处附录，逐条对应）；行文按「说给同事听」口径——行业黑话换日常词（基座化→成为默认模型、HITL 异步化→边干活边提问），短句直说。默认落盘人工粘贴，webhook 推送见设计原则 6。
- **周报长图（2026-11-06 改版，卡片周刊风）**：`run-weekly.sh` 末尾调 `scripts/r``（playwright 无头 chromium）把周报渲染成同目录 `agent-tech-brief-<date>.png`（750px 设计宽，默认 1x 输出、`FLASH_SCALE=2` 出 1500px 高清档；样式在 `scripts/brief-card.css`：渐变横幅、彩色分组标题徽章、结论标签分色条目卡——绿=值得看/试、琥珀=观望、灰=仅记录、橙=热门、是什么/怎么用键标签；出处附录不画入图内）。渲染失败只告警不阻塞（图片是增强产物）。选型记录：IM 图片通道只收位图（SVG 只能当文件发），故走 markdown → HTML → 无头浏览器截长图；satori/Takumi 代码级渲染需自备中文字体且要写结构化模板，doocs/md 只出富文本不出图，均已否。
- **一页信息图（2026-11-14 改版，五家矩阵）**：默认交付物由滚动长图改为**定比单页**——`render-onepage.mjs` + `brief-onepage.css` 出 `agent-tech-brief-<date>.png`（1080×1440，3:4）。触发原因（用户拍板：「长图的模式不适合最终的阅读，真实的阅读体验不够好」）：旧长图 750×6498（1:8.66，手机上 4 屏多、IM 缩略图里正文等效 ~7px），且 17 条同字号同级、无 5 秒扫描层。改版要点：① 定比画布（固定 1440px 高，绝不拉伸）；② **双层字号**（大字号速览层 + 小字号细读层，缩略图也能认出本期骨架）；③ **内容减法**——按家名把条目聚合成「五家 harness × 本期关键动作」矩阵，有值得看/试的家展开「怎么用」一行，观望/仅记录压成底部 chip 云，算法派生「性质」列（▲可试/◆观望/·记录 + 能力/实验/维护/配置/分发/形态），其他动态只计版本数；④ 本周黑马用星增条形替代文字列表；⑤ **溢出检测 + 阶梯降级**（星增条 5→3、收 chip、字号逐档 −2%，共 8 档），全档仍溢出才裁切并大声告警（退出码 2），绝不静默裁切。旧长图保留为 `render-brief.mjs` → `-full.png`（需全量细节时显式调用）。矩阵里的家名/性质/星增均由周报 Markdown 自动派生，**md 仍是唯一事实来源**，不新增字段。

- **一页信息图 v2：两块版式**（2026-11-14 同日返工，用户拍板：「信息更密集丰富一些，维持两个板块：harness 追踪、GitHub 潮流，每个板块的内容要点至少丰富一些，不要让人只看个标题然后不知所云」）：v1 把潮流条目当成矩阵第 6 行、又把观望/记录压成只剩名字的 chip 云，信息密度低。v2 改为**按条目的 〔harness〕/〔潮流〕 标签分板**（标签本就写在周报里，无需新增字段，匹配不到家名的兜底归潮流板）：① Harness 追踪——5 家每行给「本期动作 + 是什么 + 怎么用」正文，观望/仅记录降为同行「另：…（观望）」注脚，性质列与版本数保留；② GitHub 潮流——星增主榜每条带一句话说明，下接「生态看点」（官方规范类/技能类的项目带星数徽章与怎么用，观望/记录做成一行式）。随之删掉 chip 云与「五家矩阵」的混排行。阶梯降级改为「先压正文行数 → 再删榜尾条目 → 最后整页缩字号」。
- 结论标签（中立口径，见设计原则 5）：
  - **值得看 / 试**——成熟度足够、上手成本低，可直接试用/采用
  - **值得观望**——方向重要，成熟度或适用场景未明，保持关注
  - **仅记录**——有信息价值，无近期采用价值
- 审计铁律沿用：三元组原样来自产物、出处附录链接必须能在输入产物中找到、缺口如实标注、不凭记忆补写。

## 已确认的采集细节

- 潮流线最终口径（2026-09-14 定，用户拍板「按官方界面轻量抓取，不用做的那么重」）：直接抓 `github.com/trending?since=weekly` 官方周榜页——1 次 curl + HTML 解析，约 25 条，周星增为 GitHub 官方口径；语义筛 Agent 相关 + 架构/能力级评估，画像细节可逐仓 `gh api repos/O/R` 补拉（≤10 次）。已知边界：官方周榜只收大涨幅仓库，agent 长尾新星（百星级周增）进不了榜，接受。
- harness 抓取口径（2026-11-06 定，轻量化实测钉死）：模型不直接 curl 原始数据，先跑 `scripts/fetch-harness.py <起点> <终点> raw/lines/<运行日>/harness-fetch.md`，读摘要作为全部原始事实。脚本确定性完成：规则过滤（Codex 只留稳定版；DeepSeek 只剔 draft；Hermes 剔 draft）、窗口过滤（本地时区）、正文截断（release 800 字 / CHANGELOG 400 字）、重试与缺口（不可达退避重试、403/429 等 60 秒、大文件断流续传）、GH_TOKEN 自动带认证。已知边界：Claude Code 版本节无日期且 commits 消息不带版本号，摘要保留前 12 节 + commits 对照表（40 条），日期归因就近近似；Codex releases 端点响应大（assets 元数据每条约 340KB）且偶发 504，per_page 取 15；CHANGELOG 文件大（pi 693KB / Claude Code 1.15MB），Range 只取头部 300KB（覆盖远超 12 节）。实测 10 天窗口摘要约 20KB（原始数据 8MB+）。
- 运行前提：`gh` 已登录（不配则潮流线补拉退匿名限流）；无需 folo / aihot / ai-radar 等任何第三方账号。run-weekly.sh 启动时预检依赖（pi / curl / node / python3，gh 缺则告警不阻断）。

## 运行载体（pi 评估结论，2026-09-12，轻量版仍适用）

- pi（earendil-works/pi，TS/Node）合适。pi 自动发现 cwd 到 git root 下的 `.agents/skills/`，本仓库技能零配置可用。
- 调度外部化（cron 后置），顺序执行三条技能调用，段间以落盘文件交接。
- **技能白名单**：pi 默认还会加载 `~/.agents/skills/` 全局目录（exa / last30days / zhihu 等开发者自用技能），违反运行边界。已用 `pi -p --no-skills --skill <仓库/.agents/skills>` 组合强制只挂仓库技能（已实测生效）。无头运行时技能显式调用 `/skill:<name>`，不赌 description 路由。
- **迁移配置（env 即契约）**：LLM 配置由环境变量驱动，clone 到新机器设好即跑——`PI_PROVIDER` / `PI_MODEL`（支持 `provider/id:thinking` 组合）/ `PI_API_KEY` / `PI_THINKING` 映射为 pi 的同名 flag；全部未设置时继承 pi 本机 `~/.pi/agent/` 默认。认证类：`GH_TOKEN`（gh，不配则潮流线退匿名限流）。**配置来源优先级：命令行环境变量 > 仓库根 `.env`（模板 `.env.example`，gitignore 不入库；run-weekly.sh 启动时解析白名单键）> pi 本机默认**。注意：pi 的 auth.json 已存 key 优先级高于环境变量；pi 也原生认 provider 级变量（如 `ANTHROPIC_API_KEY`）。

## v2.2 → v3.0 改造记录（2026-09-20）

- 砍 L1 融合线：删除 `.agents/skills/line-breadth/` 及其专属源技能 `folo/`、`aihot/`、`ai-radar/`（连同样技能登记的 `skills-lock.json`）。git 历史可溯，恢复路径见设计原则 6。
- `run-weekly.sh`：去掉 folo 认证前置检查、`.env` 白名单里的 `FOLO_TOKEN` 键、`run line-breadth` 一行；依赖清单相应缩减。
- `tracker-merge`：三线合流改两线合流，选题热度信号降为「两条线同时点名」。
- `line-trending`：文案去 L2/L3 层级编号，语义与产物契约不变。
- `harness-digest`：SOP 不动（监控名单、窗口、筛选口径全部沿用）。
- 退出团队视角（同日二次定稿）：结论标签改中立口径（成熟度 + 适用面），简评与速览不再写「对团队 / 落到团队动作」，速览第三行改「怎么用」。系统本就没有团队项目信息，此前「值得导入 = 对团队当前项目可直接试用」实为无据判断，退掉后口径自洽。

## v3.0 → v3.1 改造记录（2026-09-20）

- 新增第三条采集线 `line-papers`：HF Daily Papers 的 agent 论文追踪（agent 相关 + upvotes 热门 top 12 + 权威机构白名单三档核验），产物 `raw/lines/<date>/papers-<date>.md`。数据源与口径见「已确认的采集细节」论文线条目。
- `run-weekly.sh`：挂 `run line-papers`（潮流线之后、合流之前），依赖清单加 `hf`。
- `tracker-merge`：两线合流改三线合流——产物定位表加论文线、选题热度信号改「≥2 条线同时点名」、论文条目 `repo:` 字段与潮流线上榜仓库可对上（同一选题）、周报加「本周论文（论文线）」小节、速览加「本周论文」固定模块。
- `line-trending` / `harness-digest`：不动。
- 论文线首期运行实绩（2026-09-20）：131 候选（5/7 天实覆盖）→ agent 相关 36 → 热度线 12 → 入选 9；审计 9 篇 upvotes/机构逐项对快照全数一致，info 补拉 12 次恰在预算内。
- 产物目录化（2026-09-20）：每期线产物落 `raw/lines/<运行日>/`、报告落 `reports/<运行日>/`（目录名 = 运行日，文件名仍带日期）；`run-weekly.sh` 存档逻辑改为非本期子目录整目录滚动移入 `.archives/`（目录名加 `lines-`/`reports-` 前缀防撞）；速览长图由输入路径旁路输出，落同目录。

## v3.1 → v3.2 改造记录（2026-11-06）

- **砍论文线 line-papers**（用户拍板）：删除 `.agents/skills/line-papers/`（git 历史可溯，恢复时从 v3.1 版本取回即可）；`tracker-merge` 回两线合流——周报去「本周论文」节、速览去「本周论文」模块、`repo:` 联动信号一并移除；`run-weekly.sh` 去 `run line-papers` 行，依赖清单去 hf / python3。
- **harness 深度线纳入 DeepSeek Harness**（用户拍板）：监控名单新增 `deepseek-ai/deepseek-harness`，权威源 = GitHub Releases API（仓库无 CHANGELOG；release notes 中英双语、结构化「新增功能/体验优化」）。口径特殊性：全部版本为 prerelease（alpha/rc 双轨，稳定版未发布），故**只过滤 `draft`，prerelease 照收**（与 Codex 相反）；发布节奏快（数天一版），筛选从严——UI / 体验优化类条目归「其他动态」。
- **运维增强**：`run-weekly.sh` 加 `--from <skill>` 断点重跑、依赖预检（pi / curl / node 必检，gh 缺则告警）与 `pi --version` 留痕；`TODAY` 固定一次防跨午夜目录漂移；每线成败/耗时追加 `raw/lines/<date>/run.log`；merge 后接 `scripts/validate.sh` 产物机检（存在性 + TL;DR=选题数 + URL 可溯源到 raw 产物，告警不阻塞）；新增根目录 README.md（依赖、配置、跑法、迁移），并写明 `npx playwright install chromium` 首次渲染前置步骤。
- **harness 线防漏跑**：窗口起点改 `min(运行日−9, 最新一期简报运行日)`——上期距今超 9 天（漏跑）时窗口自动前伸补洞，简报头注明窗口扩大。
- **harness 线轻量化**（用户拍板，同日）：抓取与裁剪确定化——新增 `scripts/fetch-harness.py`（python3 标准库）把五个渠道的原始数据预处理成 ~20KB 紧凑摘要（窗口过滤、规则过滤、正文截断、重试/缺口、GH_TOKEN 认证），模型不再读全文 JSON / CHANGELOG；文案收紧——harness 评估 3-5 句 → 2-3 句、横向趋势 3-5 条 → 2-3 条。实测 10 天窗口：原始数据 8MB+ → 摘要约 20KB。口径细节见「已确认的采集细节」。
- **文档修正**：main 分支/版本关系表述过时（v2.2 早已不在 main 保留）已改；tracker-merge「两份产物」残留表述随论文线移除而回归正确。

## v3.2 → v3.3 改造记录（2026-11-06）

- **合流段砍跨线归并**（用户拍板）：论文线下线后两线事实基本不相交，跨线归并判断失去稳定输入。`tracker-merge` 流程 5 步改 4 步（删「归并选题」），周报改按线分节条目化——「harness 更新」节逐条核心更新出条目，「本周热门」节对有独立评估价值的潮流线项目出条目、其余一行清单；TL;DR 表加「线」列，字段口径从「选题」改「条目」，简评 2-3 句收为 1-2 句。同一项目被两线点名时各按本线口径写条目，不做合并判断。产物结构与 validate.sh 机检项（TL;DR=结论数、URL 溯源、速览覆盖）不变。

## v3.3 → v3.4 改造记录（2026-11-06）

- **合流产物合并为一份**（用户拍板：「本质上只要一份就行了」）：砍 brief/flash 双产物，`tracker-merge` 只产出 `agent-tech-brief-<date>.md`——按结论标签分三组的自足周报（值得看/试 3 行、观望/仅记录 1 行、本周热门、其他动态、出处附录），正文不内嵌链接（链接集中出处附录，渲染不画入图内）。`run-weekly.sh` 去 flash 渲染分支改渲染周报本身；`render-flash.mjs` / `flash-card.css` 改名重做为 `r`` / `brief-card.css`；validate.sh 机检项改（分组结构、条目三件行、出处、URL 溯源）。
- **轻归并 + 条目预算**（用户拍板）：砍跨线归并后条目直出会膨胀（实测 10-25 期输入 harness 24 条更新 + 潮流 17 条，直出条目远超 IM 舒适长度），加单 harness 内轻归并（同类更新合条、能力级单独成条、多候选版本取最新，每 harness 最多 2-3 条）+ 三组合计 10-12 条预算，超出降档「其他动态」一行。
- **长图视觉改版（卡片周刊风）**（用户拍板：「图片格式简陋，不太让人有读下去的欲望」）：渐变横幅 + 彩色分组标题徽章 + 结论标签分色条目卡（绿=值得看/试、琥珀=值得观望、灰=仅记录、橙=本周热门）+ 是什么/怎么用键标签 + 来源徽章；出处附录不画入图内。

## v3.4 → v3.5 改造记录（2026-11-13）

- **运行载体迁移：pi → DeepSeek Harness 原生驱动**（用户拍板）：删除 `.agents/skills/`（三条技能）与 `run-weekly.sh`（pi 驱动的顺序编排），新增 `dsh-plugin/`——一个可安装进 DSH 的插件 bundle（`package.json` + `cordis.patch.yml` + `index.js`），在 `apply` 里用 `ctx.effect` 注册四条 runtime 技能（`harness-digest` / `line-trending` / `tracker-merge` / 新增 `tracker-weekly`），并注入 `shellEnv` 变量 `DSH_TRACKER_SCRIPTS`（脚本目录绝对路径）。
- **总编排 DSH 化**：原 `run-weekly.sh` 的「定运行日/建目录 → 顺序跑三线 → 渲染+机检 → 滚动归档 → 汇报」逻辑迁入 `tracker-weekly` 技能，驱动者是 DSH 自己——用 `skill` 工具依次加载三线，每线产物落盘即检查点、追加 `run.log`；渲染（`r``）与机检（`validate.sh`）失败只告警不阻塞；非本期目录滚动归档逻辑（`.archives/weekly-reports/<today>/`，`lines-`/`reports-` 前缀）原样保留。
- **脚本打包进插件**：`scripts/`（`fetch-harness.py` / `r`` / `brief-card.css` / `validate.sh`）复制进 `dsh-plugin/scripts/`；技能内引用从 `scripts/<脚本>` 改为 `"$DSH_TRACKER_SCRIPTS/<脚本>"`；`validate.sh` 的项目根定位从「脚本上一级」改为「默认 `$PWD`（DSH shell 在项目根执行），第 2 参数可覆盖」。
- **技能登记去 frontmatter**：原 `.agents/skills/*/SKILL.md` 的 YAML frontmatter（name/description）迁入 `index.js` 的 `SKILLS` 数组作为注册字段，技能正文只保留 Markdown 内容。同名 runtime 技能与项目技能并存时项目技能优先，故删除 `.agents/skills/` 使插件成为唯一事实来源。
- **配置契约简化**：`.env` 白名单只保留 `GH_TOKEN` / `FLASH_SCALE`（去掉 `PI_PROVIDER`/`PI_MODEL`/`PI_API_KEY`/`PI_THINKING`）；`tracker-weekly` 启动时加载仓库根 `.env`（已导出同名变量优先，与原优先级一致）。`.agents/AGENTS.md` 去掉 pi Context7 规则，改指 DSH 插件用法。
- **已知边界**：`playwright` 依赖经 `node_modules` 向上解析——插件位于本仓库内时能解析到仓库 `node_modules`；被复制/打包到 DSH profile 目录后需另行安装 playwright（渲染失败只告警不阻塞）。`python3`/`curl`/`bash [[ ]]`/`date +%F` 假定 bash 兼容 shell（Windows 用 Git Bash / WSL）。
