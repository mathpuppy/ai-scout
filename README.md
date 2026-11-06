# ai-scout · 周度 Agent Harness 追踪

一周一次的信息聚合器 + 筛选评估：盘点五大 harness（Claude Code / Codex / Hermes Agent / pi / DeepSeek）官方 release 的主要更新，筛选 GitHub 官方周榜中的 Agent 相关项目，合流出**一份**可群发、可渲染长图的周报。

## 快速开始

依赖：`node`/`npx`（pi 需要）、`pi`、`curl`、`python3`（harness 抓取预处理）；`gh` 可选（潮流线补拉用，缺则告警退匿名限流）。长图渲染另需 chromium，首次渲染前装一次：

```bash
npx playwright install chromium
```

LLM 配置全部可选，缺省用 pi 本机默认。需要覆盖时复制 `.env.example` 为 `.env` 填写（优先级：命令行环境变量 > `.env` > pi 本机默认）。

```bash
./run-weekly.sh                    # 全量运行（两线采集 + 合流 + 长图渲染）
./run-weekly.sh --from tracker-merge   # 断点重跑：从指定技能继续
```

## 产物

```
raw/lines/<运行日>/                     # 线产物 + run.log（运行日志）
  agent-harness-brief-<运行日>.md       # harness 深度线简报
  harness-fetch.md                      # harness 抓取摘要（预处理中间产物，简报事实的唯一来源）
  trending-<运行日>.md                  # GitHub 潮流线
reports/<运行日>/                       # 合流产物（唯一周报）
  agent-tech-brief-<运行日>.md          # 周报：按结论标签分组的条目 + 出处附录，可群发
  agent-tech-brief-<运行日>.png         # 周报长图（卡片周刊风，FLASH_SCALE=2 出高清档）
```

只保留最新一期，历史期次由脚本自动滚入 `.archives/`（git 历史全量可溯）。

## 特性

- **断点重跑**：失败停在当条线，修复后 `--from <skill>` 续跑（`harness-digest | line-trending | tracker-merge`）。
- **漏跑补洞**：harness 线窗口起点 = `min(运行日−9, 最新一期简报运行日)`，隔周未跑自动前伸。
- **抓取轻量化**：harness 线原始数据由 `scripts/fetch-harness.py` 预处理成 ~20KB 紧凑摘要（窗口过滤 + 正文截断 + 重试/缺口），模型不再读全文 JSON / CHANGELOG。
- **单份周报**：brief/flash 已合并——按结论标签分三组（值得看/试 3 行、观望/仅记录 1 行）+ 本周热门 + 出处附录；单 harness 内轻归并，条目预算 10-12 条。
- **产物机检**：merge 后自动跑 `scripts/validate.sh`（存在性、分组结构、条目三件行、URL 可溯源到 raw 产物），告警不阻塞。
- **零第三方服务**：curl / gh + Markdown，无数据库、无聚合器账号。

## 更多

- 设计笔记：[docs/weekly-tracker-design.md](docs/weekly-tracker-design.md)
- 失败排查：看 `raw/lines/<运行日>/run.log` 与终端输出；`pi --version` 在每次运行头部留痕。
