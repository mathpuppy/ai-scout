---
name: line-papers
description: 周度 Agent Harness 追踪的论文线：用 hf CLI 抓取 HuggingFace Daily Papers 日期页（窗口 [运行日−8, 运行日−2] 共 7 页），语义筛出 AI agent 相关论文，按 upvotes 热度取头部，再按权威机构白名单核验出品方（organization 字段机检 → hf papers info 补全 → 模型判读带标注），逐篇画像后落盘 raw/lines/<日期>/papers-<日期>.md。当用户要跑论文线、看本周 HF 热门 agent 论文时使用。
---

# line-papers — HuggingFace Daily Papers（hf CLI 官方封装）

职责：抓取 HF Daily Papers 一周窗口内的论文，筛出 **agent 相关 + 热门 + 权威机构出品** 的头部论文，画像后落盘。口径 = `--date` 日期页归属（窗口即抓的 7 个页；周末页常为空、其论文滚入下个 weekday 页；`submitted_at` 字段只是提交时间戳，与页归属不严格一致，不作窗口判据）。一篇论文只进一个周窗，无去重负担；upvotes 为抓取时快照。

流程：① 抓取 → ② 语义筛选与热度排序 → ③ 机构核验与画像 → ④ 落盘。保持轻量：hf CLI + python3 一行流，零新依赖、零认证。

## ① 抓取（7 次 ls + 汇总裁剪）

```bash
# D = 运行日；窗口 [D-8, D-2] 共 7 个日期页（当日/前一日页常未生成，实测为空，故避开）
hf papers ls --date <YYYY-MM-DD> --json 2>/dev/null   # 每页约 20-25 篇；空数组跳过
```

字段：`id`（arXiv 号）、`title`、`summary`、`upvotes`、`organization.fullname`（提交机构，可空）、`authors`（作者名）、`submitted_at`（日期页归属）。

汇总后裁剪成一张表再读（控制上下文）：每行 `日期 | id | upvotes | 机构 | 标题 | summary 前 160 字`。

- 已知边界（实测，勿踩）：`--week` 参数语义不干净（混入窗口外旧论文，配 `--sort trending` 时≈全站热度榜），**不用**；`--limit` 上限 100（日期页远小于此）；`--sort trending` 是服务端热度分 ≠ upvotes 降序，排序本地做。
- 抓取失败（改版 / 网络）：如实写缺口退空窗，不硬凑，不换数据源。
- 完成标准：窗口内全部论文的裁剪表在手（或缺口结论）。

## ② 语义筛选与热度排序（模型判断）

- 相关性口径：LLM agent 架构 / 多智能体 / tool use / agent RL 训练 / agent 评测与安全 / 记忆与自我改进 / agentic 推理规划。纯 CV/NLP/语音/扩散等非 agent 主题筛除（标题可判断的直判，拿不准读 summary）。
- 热度线：agent 相关池按 upvotes 降序取 **top 12**；不足 12 全收；**upvotes <10 不入选**。快照日期写进产物头。

## ③ 机构核验与画像（逐篇三档）

权威白名单（人可维护，直接改本文件）：

- **AI 厂商**：OpenAI、Anthropic、Google/DeepMind、Microsoft Research、Meta FAIR、NVIDIA、Apple、Amazon、Salesforce Research、IBM Research、Allen AI、Mistral、Cohere、DeepSeek、阿里（Qwen）、字节 Seed、腾讯、百度、Moonshot、智谱、MiniMax、上海 AI Lab、StepFun
- **高校/学术**：MIT、Stanford、CMU、Berkeley、Princeton、Caltech、Cornell、UW、UIUC、Georgia Tech、ETH、EPFL、Max Planck、Cambridge、Oxford、UCL、多伦多、滑铁卢、NUS、KAIST、SNU、东京大学、清华、北大、中科院、USTC、上交、复旦、南大、人大、浙大、港中文/港大/港科技

核验三档（标注跟着入选条目走）：

1. `organization` 命中白名单 → **机检通过**，无标注。
2. `organization` 空或不命中 → 逐篇补拉再核：
   ```bash
   hf papers info <arxiv-id> --json 2>/dev/null
   # 额外字段：authors[].orgs、github_repo、github_stars、ai_keywords、
   #          ai_summary、linked_models/datasets/spaces、project_page
   ```
   作者 orgs 或项目页可核出白名单机构 → 机检通过。
3. 仍无 → 模型按作者名判读（知名实验室研究员 / 团队可识别），入选但标**〔模型判读〕**；判读也撑不住 → 舍弃进筛除备注。

- info 补拉预算：合计 **≤12 次**（只拉热度线内的候选，每篇 1 次）。
- 白名单外但同等量级的机构可由模型判读后标注入选；认不准的一律舍弃——宁缺毋滥。
- 画像四项（写入事实条目）：一句话贡献（读了 summary / ai_summary 后自己概括）、机构、upvotes、开源情况（github_repo ⭐stars，无则写未附）。

## ④ 落盘 `raw/lines/<date>/papers-<date>.md`

产物契约（线产物通用三节，D 处填实际日期；条目按 upvotes 降序）：

```markdown
# 论文线 · YYYY-MM-DD

> 窗口：HF Daily Papers 日期页 [D-8, D-2]（实覆盖 N/7 天）· upvotes 快照 @D · 候选 <总> → agent 相关 <M> → 热度线 <J> → 入选 <K>

## 事实条目
- **<标题>**（<机构>〔模型判读〕· arXiv:<id> · upvotes <N>）— <一句话贡献> *纳入理由：…*（[paper](https://huggingface.co/papers/<id>)〔repo: <O/R> ⭐<N>〕）

## 本线研判
<一段话：本周 agent 论文的方向与共性，供合流段引用。>

## 筛除备注
- agent 无关：<M> 条（代表：<2-3 个标题>）
- 热度不足（upvotes <10）：<M> 条
- 机构不权威/不明：<M> 条（代表：<2-3 个标题>）
```

- `<date>` = 运行日；落 `raw/lines/YYYY-MM-DD/`（目录名 = 运行日，不存在则创建）；同日第二份起文件名追加 `-2`。
- 联动信号：github_repo 字段原样保留在条目里，供合流段与潮流线（GitHub 周榜）对上——论文 repo 同时上榜 = 多线点名，选题热度高。
- 审计：upvotes / 机构 / github 字段一律以 API 返回为准，不凭训练记忆补写；模型判读的机构必须显式标注〔模型判读〕。
