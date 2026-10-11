📡 Agent 技术周报速览 · 10-02～10-11

本期最大事件：pi 十二天九个版本冲上 1.0，「让模型自己写代码来编排工具」成了正式版核心能力，Claude Code（Mods）和 Codex（Code Mode）同周都在往同一方向使劲——agent 内核「可编程」是三家共同的主战场。GitHub 周榜 12 条里 9 条与 agent 相关，skills 资产化、记忆持久化、跨 harness 组网是三层新基建；论文圈主线是「经验从哪来、怎么变成能力」。

👉 值得看 / 试（5 条）
1. pi 冲上 1.0（09-30～10-08，0.99.0→1.1.0 九连发）
   - 是什么：codemode 让模型在 QuickJS 沙箱里写 JavaScript、并行编排 pi 工具；虚拟模型按每个请求挑物理模型；图像生成和分类进了模型运行时；MCP 和工具搜索全部内置扩展化。1.0 起全屏界面和低 token codemode 是出厂默认（描述瘦身 40%）。
   - 怎么用：开源工具升级即得；要省 token 的脚本编排、多模型路由直接开箱用；自己写扩展的注意 0.99.0 起的 Breaking 改动和 Azure provider 改名。
2. Claude Code 2.1.284～2.1.296（十三个版本）
   - 是什么：插件系统升级为 Mods，能改 UI、prompt 补全、模型调用、权限检查、子代理生成这些深层行为；内置「You should know」监护 mod 全程盯会话；auto mode 成为无配置时的默认权限模式；hook 失败从放行改成阻断。
   - 怎么用：自动更新到位；用 --marketplace 一键装 mod 体验新扩展面；自己写了 hook 的按「失败即阻断」重新过一遍语义。
3. Codex 0.158～0.162（十连发）
   - 是什么：instant_interrupt 开了之后，新输入能直接打断正在跑的模型回合；Guardian 审查能看会话史和代理交接上下文；Code Mode 支持流式 promise 和带排序的工具搜索；MCP 支持预注册 OAuth client secret。
   - 怎么用：升级即得；instant_interrupt 和 ranked tool search 都是 opt-in，按需开；企业 MCP 认证通道直接可用。
4. 新模型上线即默认（10 月上旬）
   - 是什么：Sonnet 5.5（09-29）和 Haiku 5.5（10-08）上线当天就分别是各自档位的默认；GPT-6.1 Sol 由 Codex「hotfix 先行 + 全量确认」两级设为 bundled 和 Bedrock 目录默认，pi 同步设为 Codex provider 默认。从接入到默认的延迟已经是 0 天。
   - 怎么用：三家工具更新后默认档自动生效，直接可用；长上下文会话注意核价——Haiku 5.5 超过 100K 上下文单价升到 $0.50 / $2.50。
5. Agent skills 成了独立分发品类（本周）
   - 是什么：mattpocock/skills（TS 名人公开的个人 .agents 目录）本周 +9,179 星、8 个月攒到 28.5 万星；text-to-cad 给 agent 加 CAD 能力、asd-ste100-skill 用受控英语规范治指令歧义，三种形态同现周榜。
   - 怎么用：skills 是零成本能力资产，放进自己的 coding agent 就能用；垂直需求（CAD、技术写作）先找现成的装。

👀 值得观望（6 条）
- Hermes v0.21.6：语音流式转写 + 口语轮次独立模型路由、插件按 profile 隔离、三组外部报告安全修复；一个 tag 约 2,100 个 PR 但官方故意不写文档，欠账连跨五个版本，细节等 v0.22.0。
- OSC 7501 终端状态协议：Claude Code 和 pi 同周落地，终端能显示 agent 在干活 / 等输入 / 完成 / 失败；首个跨工具协议级趋同，价值看终端生态采纳。
- 上下文与记忆：claude-mem 跨 harness 记忆层本周 +4,035 星、Claude Code 把 1M 上下文设成默认、pi 把 MCP 清单移出工具描述省 token；多会话持久化还没有公认方案。
- 多代理编排：worktree 变成 agent 可直接调用的工具、子代理可单独配推理档 / 压缩窗口 / 模型，openrig 用第三方身份把 Claude Code / Codex / Pi 组成持久团队；方向定了、形态未定。
- 经验学习论文：环境制造（AgentGarten 代码世界、Trace2Env 轨迹重建环境）与经验蒸馏（SRD 把事后经验变事前判断）同周密集上榜，harness 首次成批成为论文一等研究对象。
- nanoMuse：浙大开源对标 Meta Muse 的个人 agent，跨设备 + 长期记忆 + 主动对话，repo 833 星是论文线最高；软件形态早期，当参考实现跟踪。

🔥 GitHub 本周热门（按周星增）
- 本周风向：周榜 12 条里 9 条与 agent 相关，skills 资产化、记忆持久化、跨 harness 组网三层基建走热。
- tester-army/e2e 本周 +6,564 星（⭐8,904）：AI 原生 web / 移动端 e2e 测试框架，AI 属性依据其 README 自述
- heygen-com/hyperframes 本周 +4,081 星（⭐60,711）：用 HTML 声明式生成视频，口号 Built for agents，HeyGen 官方出品
- cursor/plugins 本周 +1,110 星（⭐10,855）：Cursor 官方插件规范 + 官方插件集，harness 开放性风向标（暂无许可证）

📄 本周论文（HF 热榜 · 权威机构）
- Recursive Game Creator（The University of Hong Kong · upvotes 86）：四角色递归开发的 agentic 游戏创作 harness，优化目标从「程序能跑」转向「玩家体验」
- DecepEval（西安交大 / 港中文〔模型判读〕 · upvotes 74）：28 个职业场景的 agent 欺骗行为基准，刻画欺骗何时更易发生
- SuperNav（浙江大学 zju3dv · upvotes 71）：MLLM 只管理解和决策、导航执行交给经典系统，任意任务任意场景

细节与出处（版本 / 日期 / 链接）：reports/2026-10-11/agent-tech-brief-2026-10-11.md
