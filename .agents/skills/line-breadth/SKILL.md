---
name: line-breadth
description: 周度 Agent 技术追踪系统的 L1 融合线：拉取 folo agent-weekly 一手源列表、folo「AI 公众号」6 源、AIHOT（window=7d）、AI Radar 日报四路信源，压成事实清单并筛出本周 Agent 技术选题，落盘 raw/lines/breadth-<日期>.md 供合流。当用户要跑 L1、广度收集、融合线、拼本周 Agent 事件全景时使用。
---

# line-breadth — L1 融合线

职责：拼出本周 Agent 技术事件的全景并筛出选题。窗口严格 7 天 [运行日−6, 运行日]，本地时区，无重叠。

运行前提：folo 已认证（环境变量 `FOLO_TOKEN`，或 `npx --yes folocli@latest login` 的存储登录态）。

流程：① 时间窗 → ② 四路拉取 → ③ 压缩成事实清单 → ④ 筛选题 → ⑤ 落盘。

## ② 四路拉取

铁律：大 JSON 先落 `/tmp` 用 python3 过滤，只把过滤结果带进上下文。

1. **folo 一手源**（agent-weekly 列表）：
   `npx --yes folocli@latest timeline --list 1285748401379344384 --limit 100 --format json`
2. **folo 公众号 6 源**：
   `npx --yes folocli@latest timeline --category "AI 公众号" --limit 100 --format json`
   分类名改动导致空结果时：`npx --yes folocli@latest subscription list` 确认分类名，修正后重试一次。
3. **AIHOT**（匿名 API）：
   `curl -s "https://aihot.virxact.com/api/v1/items?mode=selected&window=7d&limit=30"`
   `.agents/skills/aihot/.aihot-actor-id` 存在且为合法 UUID 时，按 aihot 技能规则以 `aihot-actor/<uuid>` 追加进 User-Agent。
4. **AI Radar**：
   `BASE_URL=https://news.learnprompt.pro/data`；`curl -fsSL "$BASE_URL/daily-brief.json" -o /tmp/radar-brief.json` 后 python3 过滤；先看 `generated_at`，超 48h 照常使用但在产物里标注。
   已知边界：ai-radar 公开数据是 24h 滚动窗，只覆盖运行日当天，产物头部必须注明。

- folo timeline 解析坑：条目本体嵌套在 `entries[].entries`（title / url / publishedAt），所属源在 `entries[].feeds`。
- 各路失败：重试一次；仍失败则该路标注数据缺口，其余路继续。
- 完成标准：四路各有过滤后的窗口内事实清单（或缺口注明），窗口外条目已剔除。

## ③ 压缩成事实清单

每条一行：**主体**（项目 / 公司 / 模型）+ 事件一句话 + 日期 + URL + 来源路。同一事件多路出现 → 合并为一条并标出现次数 N。

## ④ 筛选题（模型判断）

纳入标准一句话：**技术有价值、够趋势 → 纳入选题**。多路重合 = 热度高，优先纳入。纯流量八卦、融资花边、与 Agent 技术无关的条目舍弃。

## ⑤ 落盘 `raw/lines/breadth-<date>.md`

产物契约（三线通用三节，D 处填实际日期）：

```markdown
# L1 融合线 · YYYY-MM-DD

> 窗口：[D−6, D] · 数据缺口：<路名，有则写；ai-radar 仅覆盖 24h 必写>

## 事实条目
- **<主体>** — <事件一句话>（<来源路>[×N]）*纳入理由：…*（[日期](URL)）

## 本线研判
<一段话：本周全景定性、热度集中在哪。>

## 候选提名
<L1 默认省略此节。>
```

- `<date>` = 运行日；`raw/lines/` 不存在则创建；同日第二份起文件名追加 `-2`。
- 审计：日期 / URL 来自抓取结果原文，不凭训练记忆补写。
