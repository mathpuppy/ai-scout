---
name: line-trending
description: 周度 Agent 技术追踪系统的 L3 GitHub 潮流线：用 gh api search/repositories 找窗口期内新建且 stars 快涨的 Agent 相关项目，确定性降噪（排 awesome/template 类）后语义筛选，给入选项目画像并提名 L2（harness-digest）监控名单候选，落盘 raw/lines/trending-<日期>.md。当用户要跑 L3、潮流线、挖新兴 Agent 项目时使用。
---

# line-trending — L3 GitHub 潮流线

职责：发现窗口期内冒头的 Agent 相关新项目，画像 + 提名进 L2 监控名单。窗口严格 7 天 [运行日−6, 运行日]，本地时区。

流程：① 检索 → ② 确定性降噪 → ③ 语义筛选与画像 → ④ 落盘。

## ① 检索（配置区）

窗口起点 = 运行日 − 6。star 门槛默认 30。topic 白名单逐个查询，结果按 `full_name` 合并去重：

```bash
gh api "search/repositories?q=created:>YYYY-MM-DD+stars:>=30+topic:agent&sort=stars&order=desc&per_page=30"
```

- topic 白名单：`agent` / `ai-agent` / `llm` / `mcp` / `coding-agent`。
- `gh` 未登录时退回 `curl "https://api.github.com/search/repositories?q=..."`（匿名限流 10 次/分，5 个查询在额度内）。
- 结果为空：如实写空窗，不硬凑。GitHub trending 页无官方 API，不用。
- 完成标准：白名单 5 个 topic 都查完，去重后的候选池在手上（或空窗结论）。

## ② 确定性降噪

python3 一行流（内联，非独立脚本）：

- 按名称与描述排除：awesome / template / boilerplate / starter / course / list / resources / curated / 教程。
- 剩余按 stars 降序取前 30。

## ③ 语义筛选与画像（模型判断）

沿用「架构/能力级」口径：真实可用的 agent 项目 / 框架 / 工具，有差异化定位；纯 demo、套壳、教程仓库舍弃。

每个入选项目画像四项：

- **定位**：一句话。
- **差异化**：与现有同类比新在哪。
- **活跃度**：stars 数、近期提交频率、贡献者数。
- **风险**：单维护者、许可证缺失、公司背景不明等。

每个入选项目回答：**是否值得提名进 L2（harness-digest）监控名单**。

## ④ 落盘 `raw/lines/trending-<date>.md`

产物契约（三线通用三节，D 处填实际日期）：

```markdown
# L3 潮流线 · YYYY-MM-DD

> 窗口：[D−6, D] · 检索：created:>D−6 + stars:>=30 + topic 白名单

## 事实条目
- **<owner/repo>** ⭐<N> — <一句话定位> *纳入理由：…*（[创建 · 日期](repo URL)）

## 本线研判
<一段话：本周新项目集中冒头的方向。>

## 候选提名
- **<owner/repo>** — 提名进 L2 监控名单：<一句话理由>
```

- `<date>` = 运行日；`raw/lines/` 不存在则创建；同日第二份起文件名追加 `-2`。
- 审计：stars / 创建日期 / URL 以 API 返回为准，不凭训练记忆补写。
