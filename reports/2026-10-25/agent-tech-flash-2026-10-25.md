📡 Agent 技术周报速览 · 10-16～10-25

本期大盘：主线从「执行循环响应性」切到「安全与身份」——四家 harness 不约而同主攻 MCP 身份/凭据边界，MCP 同步走向身份化 + 双向化；agent skills/插件生态在 GitHub 周榜爆发，长程 agent 的记忆/上下文与评测成论文热点。

👉 值得看 / 试（1 条）
1. agent skills / 插件生态爆发（GitHub 周榜 · 2026-10-25）
   - 是什么：Anthropic 官方插件目录 + 知识工作插件、Google Android skills、Cloudflare 安全审计 skill 同周上榜，大厂把 agent 能力打包成可复用、可审计的 skill 单元，官方目录成了分发渠道。
   - 怎么用：官方出品的 skill/插件上手成本低，可直接装进 Claude Code 或现有 agent 试用；Cloudflare 安全审计 skill 直接跑，就能拿到机器可读的发现。

👀 值得观望（6 条）
- 安全与身份（MCP 身份化 + 双向化）：Codex 企业 MCP OAuth + 凭据遮蔽、pi OAuth URL 白名单、Claude Code safety_event、Hermes 插件 OAuth 同频，Hermes 还把自己变成可被其他 agent 引用的 MCP server。
- Hermes Agent v0.22.x 三连发（10-21～10-23）：全为 patch，可插拔 delegation 后端是内核增量，整窗笔记押后到 v0.23.0。
- OpenAI Codex 0.164.0（10-23）：单版定音，重心转向安全与企业 MCP 身份，Daybreak 无新动作。
- Claude Code 2.1.303~2.1.310（10-19～10-24）：八连发 bug 修复密度最高，新能力面 Monitor 上云 / safety_event / auto-mode-setup。
- agent 运行/控制层新形态：orca（本周 +9,828 星）fleet 编排、t3code 移动控制面、ruflo 多 agent swarm、opencode（本周 +6,857 星）开源 coding agent。
- 长程 agent 的上下文/记忆/评测：BizBench（upvotes 494）/ Into the Unknown 诚实体检 + CarryOn/OpenVLHarness 新抽象 + ai-memory/graphify 跨厂商记忆与知识图谱。

🔥 GitHub 本周热门（按周星增）
- 本周风向：官方周榜「agent 技能与插件生态爆发」，14 条里 12 条与 agent 直接相关；头部项目多数已并入上面选题。
- heygen-com/hyperframes 本周 +5,633 星：HeyGen 官方的 HTML→视频渲染原语，给 agent 加视频生成能力。
- vllm-project/vllm 本周 +1,371 星：LLM 推理/服务引擎，非 agent 专用、边缘相关。

📄 本周论文（HF 热榜 · 权威机构）
- SpatialScout（北京大学 · upvotes 165）：首个 VLM agent 主动探索并构建 3D 地图的基准，精确建图仍是显著短板。
- S-Agent 2.0（NTU〔模型判读〕 · upvotes 106）：给通用 coding agent 加持久场景记忆与 3D 感知工具，显著提升空间推理。

📋 仅记录（2 条）
- pi 1.4.0：收敛期单版，classifier 图像输入 + codemode 排队 + summary 去固定上限。
- harness 成为论文研究对象：脑-体失配（CoEvo-RSI）、极薄 harness（HexaShell）、agentic CLI 基础模型（IQuest-Q1）、KV 缓存工程（Cache Engineering）。

细节与出处（版本 / 日期 / 链接）：reports/2026-10-25/agent-tech-brief-2026-10-25.md
