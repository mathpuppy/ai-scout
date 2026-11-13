// @ai-scout/tracker — ai-scout 周度 Agent Harness 追踪，作为 DeepSeek Harness 插件原生驱动。
//
// 注册 4 个运行时技能（harness-digest / line-trending / tracker-merge / tracker-weekly），
// 并把本插件捆绑的脚本目录注入 shell 环境变量 DSH_TRACKER_SCRIPTS，供技能以绝对路径调用。
// 总编排由 tracker-weekly 技能承担（替代原 run-weekly.sh 的 pi 驱动）。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const scriptsDir = join(here, 'scripts')

export const inject = ['skills', 'shellEnv']

const SKILLS = [
  {
    name: 'harness-digest',
    file: 'skills/harness-digest.md',
    description:
      '抓取热门 Agent Harness（Hermes Agent、pi、OpenAI Codex、Claude Code、DeepSeek Harness）官方 GitHub 发布渠道在指定时间窗内的更新，语义筛选出 Agent 架构迭代与新能力发布（排除 bug 修复、小功能、交互调整），生成带来源标注的中文评估简报到 raw/lines/<运行日>/。当用户想了解 coding agent / agent harness 的最新动态、要周报或简报、提到 harness 更新盘点、agent 新功能对比时使用——即使用户没说出 "harness-digest" 这个词。',
  },
  {
    name: 'line-trending',
    file: 'skills/line-trending.md',
    description:
      '周度 Agent Harness 追踪的 GitHub 潮流线：轻量抓取 GitHub Trending 官方周榜（github.com/trending?since=weekly，无官方 API，curl 抓页面解析），语义筛出 Agent 相关且价值高的项目，画像并提名 harness-digest 监控名单候选，落盘 raw/lines/<日期>/trending-<日期>.md。当用户要跑潮流线、看本周 GitHub 热门时使用。',
  },
  {
    name: 'tracker-merge',
    file: 'skills/tracker-merge.md',
    description:
      '周度 Agent Harness 追踪的合流段：读取两线当期落盘产物（raw/lines/<日期>/agent-harness-brief-<日期>.md、raw/lines/<日期>/trending-<日期>.md），单线内轻归并成一份周报 reports/<日期>/agent-tech-brief-<日期>.md——按结论标签分三组（值得看/试、值得观望、仅记录），值得看/试条目三件行（是什么/怎么用），文末出处附录集中列链接，可群发也可渲染长图。当用户要跑周度追踪的最后一段、合流两线产物、出周报时使用。',
  },
  {
    name: 'tracker-weekly',
    file: 'skills/tracker-weekly.md',
    description:
      '周度 Agent Harness 追踪的总编排（DeepSeek Harness 原生驱动，替代原 run-weekly.sh）：按序驱动 harness-digest → line-trending → tracker-merge 三线，随后渲染周报长图、机检产物并滚动归档。当用户要跑一整期周度追踪、说「跑周报」「跑本周追踪」「run weekly」或想一键出周报时使用。',
  },
]

export function apply(ctx) {
  ctx.effect(() =>
    ctx.shellEnv.register({
      name: 'ai-scout-tracker',
      variables: {
        DSH_TRACKER_SCRIPTS: {
          description:
            'ai-scout tracker 插件捆绑脚本目录（fetch-harness.py / render-brief.mjs / brief-card.css / validate.sh）',
        },
      },
      resolve() {
        return { DSH_TRACKER_SCRIPTS: scriptsDir }
      },
    })
  )

  for (const skill of SKILLS) {
    const content = readFileSync(join(here, skill.file), 'utf8')
    ctx.effect(() =>
      ctx.skills.register({
        name: skill.name,
        description: skill.description,
        source: 'runtime',
        content,
        invocation: { modelInvocable: true, userInvocable: true },
      })
    )
  }
}
