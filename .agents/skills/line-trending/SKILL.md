---
name: line-trending
description: 周度 Agent Harness 追踪的 GitHub 潮流线：轻量抓取 GitHub Trending 官方周榜（github.com/trending?since=weekly，无官方 API，curl 抓页面解析），语义筛出 Agent 相关且价值高的项目，画像并提名 harness-digest 监控名单候选，落盘 raw/lines/trending-<日期>.md。当用户要跑潮流线、看本周 GitHub 热门时使用。
---

# line-trending — GitHub 周榜（官方 Trending 页）

职责：抓取 GitHub Trending 官方周榜，筛出 Agent 相关、价值高的项目，画像 + 提名进 harness-digest 监控名单。口径 = 官方周榜（GitHub 自算的本周星增），不做本地推算。

流程：① 抓取 → ② 语义筛选与画像 → ③ 落盘。保持轻量，不引入搜索池、基线、走页等本地机制。

## ① 抓取（1 次 curl，无官方 API）

```bash
curl -s "https://github.com/trending?since=weekly"
```

- 服务端渲染页面，无登录无 Key，约 25 条。解析提示（实测可用）：

  ```bash
  grep -oE 'href="/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/stargazers"'   # 仓库名
  grep -oE '[0-9,]+ stars this week'                              # 本周星增
  ```

  描述、语言、总星数等其余字段从 HTML 自行解析。
- 抓取或解析失败（改版 / 网络）：如实写缺口退空窗，不硬凑，不用其他数据源替代。
- 完成标准：本周榜单条目（仓库 + 本周星增 + 描述）在手，或缺口结论。

## ② 语义筛选与画像（模型判断）

- 相关性：与 Agent / harness / LLM / MCP 生态相关才入选；无关条目在「筛除」一行带过（数量 + 代表名字）。
- 沿用「架构/能力级」口径：真实可用的项目 / 框架 / 工具，有差异化定位；纯 demo、套壳、教程仓库舍弃。
- 每个入选项目画像四项：
  - **定位**：一句话。
  - **差异化**：与现有同类比新在哪。
  - **活跃度**：本周星增为主；需要细节（总星数、created_at、commit、贡献者）可逐仓 `gh api repos/O/R` 补拉，**合计 ≤10 次调用**，窗口内创建的标〔新建〕。
  - **风险**：单维护者、许可证缺失、公司背景不明等。
- 每个入选项目回答：**是否值得提名进 harness-digest（harness 深度线）监控名单**。

## ③ 落盘 `raw/lines/trending-<date>.md`

产物契约（线产物通用三节，D 处填实际日期）：

```markdown
# 潮流线 · YYYY-MM-DD

> 窗口：GitHub 官方周榜（since=weekly，抓取于 D）· 候选 <N> → 入选 <K>

## 事实条目
- **<owner/repo>** 本周 +<N> 星〔新建〕— <一句话定位> *纳入理由：…*（[repo](URL)）

## 本线研判
<一段话：本周榜单里 Agent 相关项目的方向。>

## 候选提名
- **<owner/repo>** — 提名进 harness-digest 监控名单：<一句话理由>
```

- `<date>` = 运行日；`raw/lines/` 不存在则创建；同日第二份起文件名追加 `-2`。
- 审计：周星增以页面为准，补拉数据以 API 返回为准，不凭训练记忆补写。
