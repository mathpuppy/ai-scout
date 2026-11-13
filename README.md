# ai-scout · 周度 Agent Harness 追踪

一周一次的信息聚合器 + 筛选评估：盘点五大 harness（Claude Code / Codex / Hermes Agent / pi / DeepSeek Harness）官方 release 的主要更新，筛选 GitHub 官方周榜中的 Agent 相关项目，合流出**一份**可群发、可渲染长图的周报。

驱动方式已从 pi 迁移到 **DeepSeek Harness 原生驱动**：整个周度流程由一个 `tracker-weekly` 技能编排（替代原 `run-weekly.sh`），三条采集线 + 渲染 + 机检 + 归档全部由 DSH 自己执行。本仓库同时是一个可安装的 **DSH 插件**（`dsh-plugin/`），安装后即获得四条技能与脚本目录注入。

## 快速开始（DeepSeek Harness 原生驱动）

1. **安装插件**：在 DSH 的插件管理中安装本仓库 `dsh-plugin/` 这个 bundle（`package.json` 声明 `dsh.bundle.patch`，安装即挂载）。

2. **依赖**：`curl`、`python3`（harness 抓取预处理）、`node`（长图渲染）；`gh` 可选（潮流线补拉，缺则告警退匿名限流）。长图渲染首次前装一次 chromium：

   ```bash
   npx playwright install chromium
   ```

3. **跑一期**：对 DSH 说「跑周报 / 跑本周追踪」，或用 `skill` 工具加载 `tracker-weekly`。

   - 断点续跑：「从 tracker-merge 继续」。
   - 配置（可选）：复制 `.env.example` 为 `.env`，填 `GH_TOKEN`、`FLASH_SCALE`。

## 产物

```
raw/lines/<运行日>/                     # 线产物 + run.log（运行日志）
  agent-harness-brief-<运行日>.md       # harness 深度线简报
  harness-fetch.md                      # harness 抓取摘要（预处理中间产物）
  trending-<运行日>.md                  # GitHub 潮流线
reports/<运行日>/                       # 合流产物（唯一周报）
  agent-tech-brief-<运行日>.md          # 周报：按结论标签分组的条目 + 出处附录，可群发
  agent-tech-brief-<运行日>.png         # 周报长图（卡片周刊风，FLASH_SCALE=2 出高清档）
```

只保留最新一期，历史期次由总编排自动滚入 `.archives/`（git 历史全量可溯）。

## 特性

- **断点续跑**：失败停在当条线，修复后「从 <skill> 继续」（`harness-digest | line-trending | tracker-merge`）。
- **漏跑补洞**：harness 线窗口起点 = `min(运行日−9, 最新一期简报运行日)`，隔周未跑自动前伸。
- **抓取轻量化**：harness 线原始数据由插件脚本 `fetch-harness.py` 预处理成 ~20KB 紧凑摘要（窗口过滤 + 正文截断 + 重试/缺口），模型不再读全文 JSON / CHANGELOG。
- **单份周报**：按结论标签分三组（值得看/试 3 行、观望/仅记录 1 行）+ 本周热门 + 出处附录。
- **产物机检**：merge 后自动跑 `validate.sh`（存在性、分组结构、条目三件行、URL 可溯源到 raw 产物），告警不阻塞。
- **零第三方服务**：curl / gh + Markdown，无数据库、无聚合器账号。

## 插件结构（`dsh-plugin/`）

- `index.js`：`apply(ctx)` 用 `ctx.effect` 注册四条 runtime 技能（`harness-digest` / `line-trending` / `tracker-merge` / `tracker-weekly`），并注入 `shellEnv` 变量 `DSH_TRACKER_SCRIPTS`（脚本目录绝对路径）。
- `skills/*.md`：技能正文（name/description 在 `index.js` 的 `SKILLS` 数组里登记）。
- `scripts/`：`fetch-harness.py`、`render-brief.mjs`、`brief-card.css`、`validate.sh`。
- `cordis.patch.yml`：loader 补丁，`insert` 本 bundle 进 profile。

> 已知边界：`python3`/`curl`/`bash [[ ]]`/`date +%F` 假定 bash 兼容 shell（Windows 用 Git Bash / WSL）。`render-brief.mjs` 的 `playwright` 依赖经 `node_modules` 向上解析——插件位于本仓库内时能解析到仓库 `node_modules`；若被复制/打包进 DSH profile 目录，需在 DSH 环境另行 `npm i playwright`（渲染失败只告警不阻塞）。

## 更多

- 设计笔记：[docs/weekly-tracker-design.md](docs/weekly-tracker-design.md)
- 失败排查：看 `raw/lines/<运行日>/run.log` 与各线落盘产物。
