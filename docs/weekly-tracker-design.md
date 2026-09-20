# 周度 Agent Harness 追踪系统 · 设计笔记（轻量版）

> 状态：v3.1（2026-09-20，加论文线 line-papers：HF Daily Papers 热门权威机构 agent 论文，三线合流）
> 定位：一周一次的**信息聚合器 + 筛选评估**，做三件事——四大 harness 官方 release 的主要功能更新盘点 + GitHub 官方周榜的 Agent 相关项目筛选 + HF Daily Papers 热门权威机构 agent 论文筛选。纳入标准一句话：**技术有价值、够趋势 → 纳入选题**。不做情报融合、不做交叉验证、不做佐证计数。
> 版本关系：main 分支保留 v2.2 三线全量版（含 folo/aihot/ai-radar 聚合线）；本分支为轻量版，砍掉全部聚合器信源，零第三方服务依赖。

## 设计原则（简洁轻量，优先级最高）

1. **最少件数**：1 个编排脚本 + 3 个采集技能 + 1 个合流技能 + Markdown 产物。没有数据库、注册表、自研服务。
2. **只用现成 CLI**：curl / gh / hf / python3 一行流。零 pi 扩展、零 MCP、零新 npm/pip 依赖、零外部账号（folo 等聚合器全部退场）。唯一例外：速览长图渲染用 playwright（devDependency，见合流段）。
3. **运行边界写死**：系统运行 = pi + 本仓库 `.agents/skills/`（harness-digest / line-trending / line-papers / tracker-merge）+ 裸 CLI。开发者（ZCode）的工具只在开发期用，不进系统。
4. **状态即文件**：`raw/lines/<运行日>/`（线产物，一期一目录）+ `reports/<运行日>/`（简报，一期一目录），**只保留最新一期**——run-weekly.sh 成功结束后自动把非本期产物移入 `.archives/weekly-reports/<归档日>/`（gitignored，git 历史仍全量可溯）。潮流线产物契约 = 三个固定小节：①事实条目（三元组 + 纳入理由）②本线研判一段 ③候选提名区（有则写，无则省略）。
5. **不设团队上下文**：系统不维护团队项目 / 技术栈信息，结论标签按技术本身的成熟度与适用面做中立判断（2026-09-20 定，用户拍板）。周报不写「对团队」「对我们要不要用」——落地判断留给读者。日后需要时再建 team-focus 文件接线，属加法不改架构。
6. **按需演进**：以下默认不建，痛点出现再加——确定性归并脚本、模型分层路由、多线并发、缓存、群发 webhook 推送。想加回广度聚合线时，从 main 分支的 v2.2 设计恢复 line-breadth 及其源技能。

## 总体架构

```text
run-weekly.sh（手动跑；口径稳定后可挂 cron）
  pi -p "/skill:harness-digest"   → raw/lines/<date>/agent-harness-brief-<date>.md
  pi -p "/skill:line-trending"    → raw/lines/<date>/trending-<date>.md
  pi -p "/skill:line-papers"      → raw/lines/<date>/papers-<date>.md
  pi -p "/skill:tracker-merge"    → reports/<date>/agent-tech-brief-<date>.md
                                              + reports/<date>/agent-tech-flash-<date>.md
```

失败恢复 = 手动重跑当线那条命令；每线产物落盘即检查点。

## 窗口口径

| 线 | 窗口 | 说明 |
|---|---|---|
| 潮流线 | GitHub 官方周榜口径（since=weekly，GitHub 自算） | 无本地推算，无重叠去重负担 |
| harness 线 | 10 天 [运行日−9, 运行日]，刻意 ~3 天重叠 | 沿用 harness-digest 既有设计，重叠区去重其技能内自理 |
| 论文线 | 7 个日期页 [运行日−8, 运行日−2]（HF `--date` 页归属） | 当日/前一日页常未生成故避开；周末页常空（论文滚入下个 weekday 页），实覆盖 5/7 天为常态；一篇论文只进一个周窗，无去重负担 |

## 三条采集线

| 线 | 职责 | 数据源 | 状态 |
|---|---|---|---|
| harness 深度线 | 4 个 harness（Claude Code / Codex / Hermes Agent / pi）版本级深析，筛出架构迭代 / 新能力级更新 | GitHub API + raw CHANGELOG 直连（curl） | `.agents/skills/harness-digest/`，SOP 沿用 v2.2 |
| GitHub 潮流线 | 本周 GitHub 热门（官方周榜）中 Agent 相关项目的筛选、画像 + harness 线监控名单提名 | `github.com/trending?since=weekly` 页面轻量抓取（curl，无官方 API） | `.agents/skills/line-trending/` |
| 论文线 | HF Daily Papers 一周窗口内 agent 相关 + 热门（upvotes top 12）+ 权威机构（白名单三档核验）论文的筛选与画像 | `hf papers ls --date` 日期页（HF 官方 API 封装，免认证）+ `hf papers info` 补拉（≤12 次） | `.agents/skills/line-papers/` |

- 潮流线候选提名区是 harness 线监控名单演化的唯一入口；采纳与否由人改 harness-digest 的监控表。
- harness 线是给人看的简报，merge 直读它，不要求额外机读产物。

## 合流段（tracker-merge → 周报 + 群发速览）

- 输入：三份当期产物，各取文件名日期最新一份；缺哪条线就跳过并标注，**merge 自身零网络请求**，事实只能来自输入文件。
- 第二份产物 **`reports/<date>/agent-tech-flash-<date>.md`（群发速览）**：自足的要点概览，读者不看周报即可掌握全部核心要点——全部选题按结论标签分三组，详略两档：导入条目 3 行（标题带日期/版本 + 是什么 + 怎么用），观望/仅记录各一行；无表格、正文不内嵌链接、零新增事实；行文按「说给同事听」口径——行业黑话换日常词（基座化→成为默认模型、HITL 异步化→边干活边提问），短句直说；固定含「GitHub 本周热门」模块（3-5 个：周星增头部 + 方向代表，新建标「新建」，已并选题的不重复，首行一句本周风向）与「本周论文」模块（论文线在产物中时，3-5 篇：upvotes 头部 + 方向代表，已并选题的不重复）。默认落盘人工粘贴，webhook 推送见设计原则 6。
- **速览长图（2026-09-20 增）**：markdown 速览之外，`run-weekly.sh` 末尾调 `scripts/render-flash.mjs`（playwright 无头 chromium）把速览渲染成同目录 `agent-tech-flash-<date>.png` 微信长图（750px 设计宽，输出倍率默认 1x——750px 宽、体积小，企业 IM 可直接预览；`FLASH_SCALE=2` 出 1500px 高清档；样式在 `scripts/flash-card.css`）。双产物并存：文本版可复制，图片版群发观感好；渲染失败只告警不阻塞主流程（图片是增强产物）。选型记录：IM 图片通道只收位图（SVG 只能当文件发），故走 markdown → HTML → 无头浏览器截长图；satori/Takumi 代码级渲染需自备中文字体且要写结构化模板，doocs/md 只出富文本不出图，均已否。
- 按选题归并（模型判断），每选题：事实三元组 + 2-3 句简评 + **结论标签**（中立口径，见设计原则 5）：
  - **值得导入**——成熟度足够、上手成本低，可直接试用/采用
  - **值得观望**——方向重要，成熟度或适用场景未明，保持关注
  - **仅记录**——有信息价值，无近期采用价值
- 审计铁律沿用：三元组原样来自产物、缺口如实标注、不凭记忆补写。

## 已确认的采集细节

- 潮流线最终口径（2026-09-14 定，用户拍板「按官方界面轻量抓取，不用做的那么重」）：直接抓 `github.com/trending?since=weekly` 官方周榜页——1 次 curl + HTML 解析，约 25 条，周星增为 GitHub 官方口径；语义筛 Agent 相关 + 架构/能力级评估，画像细节可逐仓 `gh api repos/O/R` 补拉（≤10 次）。已知边界：官方周榜只收大涨幅仓库，agent 长尾新星（百星级周增）进不了榜，接受。
- 论文线口径（2026-09-20 定，实测钉死）：数据源 = `hf papers ls --date <D> --json`（huggingface_hub CLI，底层 `GET /api/daily_papers`）；upvotes 快照排序本地做；权威机构三档核验 = `organization` 字段命中白名单（机检）→ `hf papers info` 补拉 authors.orgs / linked_*（机检）→ 模型判读（显式标注），认不准舍弃。已知边界：`--week` 参数语义不干净（混入窗口外旧论文，配 `--sort trending` ≈ 全站热度榜）不用；arXiv / OpenAlex / S2 对新论文的作者机构覆盖差，故机构判读以 HF organization 字段为主、模型判读兜底；`organization` 有值 ≠ 权威（混有小公司账号），白名单匹配必要。周预算 ≤7 次 ls + ≤12 次 info，全免认证。
- 运行前提：`gh` 已登录（不配则潮流线补拉退匿名限流）；`hf` CLI 在 PATH（论文线，免认证）；无需 folo / aihot / ai-radar 等任何第三方账号。

## 运行载体（pi 评估结论，2026-09-12，轻量版仍适用）

- pi（earendil-works/pi，TS/Node）合适。pi 自动发现 cwd 到 git root 下的 `.agents/skills/`，本仓库技能零配置可用。
- 调度外部化（cron 后置），顺序执行四条技能调用，段间以落盘文件交接。
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
