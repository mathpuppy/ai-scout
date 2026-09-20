# 周度 Agent Harness 追踪系统 · 设计笔记（轻量版）

> 状态：v3.0（2026-09-20，轻量版定稿：砍 L1 融合线，分支 feature/minimal-harness-version）
> 定位：一周一次的**信息聚合器 + 筛选评估**，只做两件事——四大 harness 官方 release 的主要功能更新盘点 + GitHub 官方周榜的 Agent 相关项目筛选。纳入标准一句话：**技术有价值、够趋势 → 纳入选题**。不做情报融合、不做交叉验证、不做佐证计数。
> 版本关系：main 分支保留 v2.2 三线全量版（含 folo/aihot/ai-radar 聚合线）；本分支为轻量版，砍掉全部聚合器信源，零第三方服务依赖。

## 设计原则（简洁轻量，优先级最高）

1. **最少件数**：1 个编排脚本 + 2 个采集技能 + 1 个合流技能 + Markdown 产物。没有数据库、注册表、自研服务。
2. **只用现成 CLI**：curl / gh / python3 一行流。零 pi 扩展、零 MCP、零新 npm/pip 依赖、零外部账号（folo 等聚合器全部退场）。
3. **运行边界写死**：系统运行 = pi + 本仓库 `.agents/skills/`（harness-digest / line-trending / tracker-merge）+ 裸 CLI。开发者（ZCode）的工具只在开发期用，不进系统。
4. **状态即文件**：`raw/lines/`（线产物）+ `reports/`（简报），**只保留最新一期**——run-weekly.sh 成功结束后自动把非本期产物移入 `.archives/weekly-reports/<归档日>/`（gitignored，git 历史仍全量可溯）。潮流线产物契约 = 三个固定小节：①事实条目（三元组 + 纳入理由）②本线研判一段 ③候选提名区（有则写，无则省略）。
5. **按需演进**：以下默认不建，痛点出现再加——确定性归并脚本、模型分层路由、两线并发、缓存、群发 webhook 推送。想加回广度聚合线时，从 main 分支的 v2.2 设计恢复 line-breadth 及其源技能。

## 总体架构

```text
run-weekly.sh（手动跑；口径稳定后可挂 cron）
  pi -p "/skill:harness-digest"   → raw/lines/agent-harness-brief-<date>.md
  pi -p "/skill:line-trending"    → raw/lines/trending-<date>.md
  pi -p "/skill:tracker-merge"    → reports/agent-tech-brief-<date>.md
                                              + reports/agent-tech-flash-<date>.md
```

失败恢复 = 手动重跑当线那条命令；每线产物落盘即检查点。

## 窗口口径

| 线 | 窗口 | 说明 |
|---|---|---|
| 潮流线 | GitHub 官方周榜口径（since=weekly，GitHub 自算） | 无本地推算，无重叠去重负担 |
| harness 线 | 10 天 [运行日−9, 运行日]，刻意 ~3 天重叠 | 沿用 harness-digest 既有设计，重叠区去重其技能内自理 |

## 两条采集线

| 线 | 职责 | 数据源 | 状态 |
|---|---|---|---|
| harness 深度线 | 4 个 harness（Claude Code / Codex / Hermes Agent / pi）版本级深析，筛出架构迭代 / 新能力级更新 | GitHub API + raw CHANGELOG 直连（curl） | `.agents/skills/harness-digest/`，SOP 沿用 v2.2 |
| GitHub 潮流线 | 本周 GitHub 热门（官方周榜）中 Agent 相关项目的筛选、画像 + harness 线监控名单提名 | `github.com/trending?since=weekly` 页面轻量抓取（curl，无官方 API） | `.agents/skills/line-trending/` |

- 潮流线候选提名区是 harness 线监控名单演化的唯一入口；采纳与否由人改 harness-digest 的监控表。
- harness 线是给人看的简报，merge 直读它，不要求额外机读产物。

## 合流段（tracker-merge → 周报 + 群发速览）

- 输入：两份当期产物，各取文件名日期最新一份；缺哪条线就跳过并标注，**merge 自身零网络请求**，事实只能来自输入文件。
- 第二份产物 **`reports/agent-tech-flash-<date>.md`（群发速览）**：自足的要点概览，读者不看周报即可掌握全部核心要点——全部选题按结论标签分三组，详略两档：导入条目 3 行（标题带日期/版本 + 是什么 + 对我们），观望/仅记录各一行；无表格、正文不内嵌链接、零新增事实；行文按「说给同事听」口径——行业黑话换日常词（基座化→成为默认模型、HITL 异步化→边干活边提问），短句直说；固定含「GitHub 本周热门」模块（3-5 个：周星增头部 + 方向代表，新建标「新建」，已并选题的不重复，首行一句本周风向）。默认落盘人工粘贴，webhook 推送见设计原则 5。
- 按选题归并（模型判断），每选题：事实三元组 + 2-3 句简评 + **结论标签**：
  - **值得导入**——对团队当前项目可直接试用/采用
  - **值得观望**——方向重要，成熟度或适配未明，保持关注
  - **仅记录**——有信息价值，与团队导入无关
- 审计铁律沿用：三元组原样来自产物、缺口如实标注、不凭记忆补写。

## 已确认的采集细节

- 潮流线最终口径（2026-09-14 定，用户拍板「按官方界面轻量抓取，不用做的那么重」）：直接抓 `github.com/trending?since=weekly` 官方周榜页——1 次 curl + HTML 解析，约 25 条，周星增为 GitHub 官方口径；语义筛 Agent 相关 + 架构/能力级评估，画像细节可逐仓 `gh api repos/O/R` 补拉（≤10 次）。已知边界：官方周榜只收大涨幅仓库，agent 长尾新星（百星级周增）进不了榜，接受。
- 运行前提：`gh` 已登录（不配则潮流线补拉退匿名限流）；无需 folo / aihot / ai-radar 等任何第三方账号。

## 运行载体（pi 评估结论，2026-09-12，轻量版仍适用）

- pi（earendil-works/pi，TS/Node）合适。pi 自动发现 cwd 到 git root 下的 `.agents/skills/`，本仓库技能零配置可用。
- 调度外部化（cron 后置），顺序执行三条技能调用，段间以落盘文件交接。
- **技能白名单**：pi 默认还会加载 `~/.agents/skills/` 全局目录（exa / last30days / zhihu 等开发者自用技能），违反运行边界。已用 `pi -p --no-skills --skill <仓库/.agents/skills>` 组合强制只挂仓库技能（已实测生效）。无头运行时技能显式调用 `/skill:<name>`，不赌 description 路由。
- **迁移配置（env 即契约）**：LLM 配置由环境变量驱动，clone 到新机器设好即跑——`PI_PROVIDER` / `PI_MODEL`（支持 `provider/id:thinking` 组合）/ `PI_API_KEY` / `PI_THINKING` 映射为 pi 的同名 flag；全部未设置时继承 pi 本机 `~/.pi/agent/` 默认。认证类：`GH_TOKEN`（gh，不配则潮流线退匿名限流）。**配置来源优先级：命令行环境变量 > 仓库根 `.env`（模板 `.env.example`，gitignore 不入库；run-weekly.sh 启动时解析白名单键）> pi 本机默认**。注意：pi 的 auth.json 已存 key 优先级高于环境变量；pi 也原生认 provider 级变量（如 `ANTHROPIC_API_KEY`）。

## v2.2 → v3.0 改造记录（2026-09-20）

- 砍 L1 融合线：删除 `.agents/skills/line-breadth/` 及其专属源技能 `folo/`、`aihot/`、`ai-radar/`（连同样技能登记的 `skills-lock.json`）。git 历史可溯，恢复路径见设计原则 5。
- `run-weekly.sh`：去掉 folo 认证前置检查、`.env` 白名单里的 `FOLO_TOKEN` 键、`run line-breadth` 一行；依赖清单相应缩减。
- `tracker-merge`：三线合流改两线合流，选题热度信号降为「两条线同时点名」。
- `line-trending`：文案去 L2/L3 层级编号，语义与产物契约不变。
- `harness-digest`：SOP 不动（监控名单、窗口、筛选口径全部沿用）。
