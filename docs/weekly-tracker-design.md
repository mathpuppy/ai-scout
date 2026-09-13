# 周度 Agent 技术追踪系统 · 设计笔记

> 状态：v2.2（2026-09-12，砍重定稿：聚合器 + 筛选评估）
> 定位：一周一次的**信息聚合器 + 筛选评估**——判断 Agent 技术是否值得团队跟进。纳入标准一句话：**技术有价值、够趋势 → 纳入选题**。不做情报融合、不做交叉验证、不做佐证计数。

## 设计原则（简洁轻量，优先级最高）

1. **最少件数**：1 个编排脚本 + 3 个新建技能 + 既有 harness-digest + Markdown 产物。没有数据库、注册表、自研服务。
2. **只用现成 CLI**：folocli / curl / gh / python3 一行流。零 pi 扩展、零 MCP、零新 npm/pip 依赖。
3. **运行边界写死**：系统运行 = pi + 本仓库 `.agents/skills/`（folo / ai-radar / aihot / harness-digest / line-breadth / line-trending / tracker-merge）+ 裸 CLI。开发者（ZCode）的工具只在开发期用，不进系统。
4. **状态即文件**：`raw/lines/`（线产物）+ `reports/`（简报）。线产物契约 = 三个固定小节：①事实条目（三元组 + 纳入理由）②本线研判一段 ③候选提名区（有则写，无则省略）。
5. **按需演进**：以下默认不建，痛点出现再加——确定性归并脚本、模型分层路由、三线并发、第二个 folo 列表、缓存、群发 webhook 推送。

## 总体架构

```text
run-weekly.sh（首版手动跑，1-2 期顺了再挂 cron）
  pi -p "/skill:line-breadth"     → raw/lines/breadth-<date>.md
  pi -p "/skill:harness-digest"   → reports/agent-harness-brief-<date>.md（零改动）
  pi -p "/skill:line-trending"    → raw/lines/trending-<date>.md
  pi -p "/skill:tracker-merge"    → reports/agent-tech-brief-<date>.md
```

失败恢复 = 手动重跑当线那条命令；每线产物落盘即检查点。

## 窗口口径

| 线 | 窗口 | 说明 |
|---|---|---|
| L1 / L3 | 严格 7 天 [运行日−6, 运行日]，本地时区 | 无重叠，无去重负担 |
| L2 | 10 天 [运行日−9, 运行日]，刻意 ~3 天重叠 | 沿用 harness-digest 既有设计，重叠区去重其技能内自理 |

## 三条采集线

| 线 | 职责 | 数据源 | 状态 |
|---|---|---|---|
| L1 融合线 | 本周事件全景 + 选题 | folo agent-weekly 列表 + folo 公众号 6 源 + aihot（window=7d）+ ai-radar（仅覆盖运行日前 24h，已知边界） | `.agents/skills/line-breadth/` |
| L2 harness 深度线 | 4 个 harness 版本级深析 | GitHub API 直连（既有 SOP） | `.agents/skills/harness-digest/`，**真·零改动** |
| L3 GitHub 潮流线 | 新兴热门 Agent 项目画像 + L2 监控名单提名 | `gh api search/repositories`（created > 窗口起点，stars 排序） | `.agents/skills/line-trending/` |

- L1「重合即佐证」降级为提示词一句话：同一事件多个源都提 = 热度高，优先纳入。不是机制。
- L2 是给人看的简报，merge 直读它，不要求额外机读产物。
- L3 候选提名区是 L2 监控名单演化的唯一入口；采纳与否由人改 harness-digest 的监控表。

## 合流段（tracker-merge → 周报 + 群发速览）

- 输入：三份当期产物，各取文件名日期最新一份；缺哪条线就跳过并标注，**merge 自身零网络请求**，事实只能来自输入文件。
- 第二份产物 **`reports/agent-tech-flash-<date>.md`（群发速览）**：自足的要点概览，读者不看周报即可掌握全部核心要点——全部选题按结论标签分三组，详略两档：导入条目 3 行（标题带日期/版本 + 是什么 + 对我们），观望/仅记录各一行；无表格、正文不内嵌链接、零新增事实；行文按「说给同事听」口径——行业黑话换日常词（基座化→成为默认模型、HITL 异步化→边干活边提问），短句直说。默认落盘人工粘贴，webhook 推送见设计原则 5。
- 按选题归并（模型判断），每选题：事实三元组 + 2-3 句简评 + **结论标签**：
  - **值得导入**——对团队当前项目可直接试用/采用
  - **值得观望**——方向重要，成熟度或适配未明，保持关注
  - **仅记录**——有信息价值，与团队导入无关
- 审计铁律沿用：三元组原样来自产物、缺口如实标注、不凭记忆补写。

## 已确认的采集细节

- folo 列表 agent-weekly：listId `1285748401379344384`；公众号 6 源走 `timeline --category "AI 公众号"`；解析坑：条目嵌套 `entries[].entries`。
- 运行前提：folo 认证（`FOLO_TOKEN` 或 folocli login 存储态，实测后者已配好）；`gh` 已登录。
- 待复核源已有结论（2026-09-12）：Databricks Blog、X @GeminiApp **都不加**。

## 运行载体（pi 评估结论，2026-09-12）

- pi（earendil-works/pi，TS/Node）合适。pi 自动发现 cwd 到 git root 下的 `.agents/skills/`，本仓库技能零配置可用。
- 无官方 Python SDK（维护者拒绝，issue #4174）；需要 Python 时走 `pi -p --mode json` / rpc 子进程。本系统用不到。
- 调度外部化（cron 后置），顺序执行四条技能调用，段间以落盘文件交接。
- **技能白名单**：pi 默认还会加载 `~/.agents/skills/` 全局目录（exa / last30days / zhihu 等开发者自用技能），违反运行边界。已用 `pi -p --no-skills --skill <仓库/.agents/skills>` 组合强制只挂仓库技能（已实测生效）。无头运行时技能显式调用 `/skill:<name>`，不赌 description 路由。
- **迁移配置（env 即契约）**：LLM 配置由环境变量驱动，clone 到新机器设好即跑——`PI_PROVIDER` / `PI_MODEL`（支持 `provider/id:thinking` 组合）/ `PI_API_KEY` / `PI_THINKING` 映射为 pi 的同名 flag；全部未设置时继承 pi 本机 `~/.pi/agent/` 默认。认证类：`FOLO_TOKEN`（folo）、`GH_TOKEN`（gh，不配则 L3 退匿名限流）。**配置来源优先级：命令行环境变量 > 仓库根 `.env`（模板 `.env.example`，gitignore 不入库；run-weekly.sh 启动时解析白名单键）> pi 本机默认**。注意三点：pi 的 auth.json 已存 key 优先级高于环境变量；pi 也原生认 provider 级变量（如 `ANTHROPIC_API_KEY`）；`FOLO_TOKEN` 一旦设置会覆盖 folocli 存储登录态，本机已 login 的场景留空。

## 建件顺序与首版运行

1. tracker-merge（先定三线共同契约）
2. line-breadth
3. line-trending
4. run-weekly.sh（仓库根目录）
5. 首版**手动**跑 1-2 期，口径顺了再挂 cron（届时再定周几几点）
