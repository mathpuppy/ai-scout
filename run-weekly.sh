#!/usr/bin/env bash
# 周度 Agent Harness 追踪 · 轻量版（设计见 docs/weekly-tracker-design.md）
# 三线采集：harness 官方 release（Claude Code / Codex / Hermes / pi）+ GitHub 官方周榜 + HF Daily Papers 论文线。
# 失败恢复：set -e 停在失败那条，手动重跑对应 pi 命令即可（产物落盘即检查点）。
#
# 迁移到新机器：clone 本仓库后备齐以下环境变量/依赖即可跑（LLM 项全部可选，
# 未设置时用 pi 本机默认配置 ~/.pi/agent/settings.json + auth.json）：
#   PI_PROVIDER   LLM provider 名（如 zai-coding-cn / anthropic / openai）
#   PI_MODEL      模型名，支持 provider/id:thinking 组合（如 glm-5.3:high）
#   PI_API_KEY    API key（也可改用 provider 原生变量如 ANTHROPIC_API_KEY；
#                 注意 auth.json 里已存的 key 优先级高于环境变量）
#   PI_THINKING   思考档位（off/minimal/low/medium/high/xhigh/max）
#   GH_TOKEN      gh 认证（或先 gh auth login；不配则潮流线补拉退匿名限流）
# 依赖：node/npx（pi 需要）、pi、python3、curl、hf（论文线：huggingface_hub CLI，免认证）
#
# 配置来源优先级（高到低）：命令行环境变量 > 仓库根 .env 文件 > pi 本机默认。
# .env 模板见 .env.example：复制为 .env 填写，.env 已 gitignore 不入库。
set -euo pipefail
cd "$(dirname "$0")"

# .env 支持：仓库根有 .env 则加载白名单键；已导出的环境变量优先，.env 不覆盖
if [ -f .env ]; then
  while IFS= read -r _line || [ -n "$_line" ]; do
    _line="${_line%$'\r'}"
    case "$_line" in
      ''|\#*) continue ;;
      PI_PROVIDER=*|PI_MODEL=*|PI_API_KEY=*|PI_THINKING=*|GH_TOKEN=*)
        _key="${_line%%=*}" _val="${_line#*=}"
        case "$_val" in
          \"*\") _val="${_val#\"}"; _val="${_val%\"}" ;;
          \'*\') _val="${_val#\'}"; _val="${_val%\'}" ;;
        esac
        if [ -z "${!_key:-}" ]; then export "$_key=$_val"; fi
        ;;
      *) echo "警告：.env 忽略未识别的键：${_line%%=*}" >&2 ;;
    esac
  done < .env
fi
unset _line _key _val

mkdir -p "raw/lines/$(date +%F)" "reports/$(date +%F)"

# 技能白名单：只挂本仓库 .agents/skills，屏蔽 ~/.agents/skills 等全局目录
SKILLS_DIR="$(pwd)/.agents/skills"

# LLM 配置：环境变量存在才传对应 flag，否则继承 pi 本机默认
PI_ARGS=(-p --no-skills --skill "$SKILLS_DIR")
[ -n "${PI_PROVIDER:-}" ] && PI_ARGS+=(--provider "$PI_PROVIDER")
[ -n "${PI_MODEL:-}" ]    && PI_ARGS+=(--model "$PI_MODEL")
[ -n "${PI_API_KEY:-}" ]  && PI_ARGS+=(--api-key "$PI_API_KEY")
[ -n "${PI_THINKING:-}" ] && PI_ARGS+=(--thinking "$PI_THINKING")

run() {
  echo "==> [$1] $(date '+%F %T')"
  pi "${PI_ARGS[@]}" "/skill:$1"
}

run harness-digest   # harness 深度线 → raw/lines/<date>/agent-harness-brief-<date>.md
run line-trending    # GitHub 潮流线 → raw/lines/<date>/trending-<date>.md
run line-papers      # 论文线     → raw/lines/<date>/papers-<date>.md
run tracker-merge    # 合流     → reports/<date>/agent-tech-brief-<date>.md

# 群发速览渲染长图（增强产物：失败只告警不阻塞，无 flash md 或缺 node/playwright 时跳过）
FLASH_MD="reports/$(date +%F)/agent-tech-flash-$(date +%F).md"
if [ -f "$FLASH_MD" ] && command -v node >/dev/null 2>&1; then
  echo "==> [render-flash] $(date '+%F %T')"
  node scripts/render-flash.mjs "$FLASH_MD" \
    || echo "警告：速览长图渲染失败（不影响 markdown 产物），可手动重跑：node scripts/render-flash.mjs $FLASH_MD" >&2
fi

# 滚动存档：成功结束后，非本期（目录名非今日）的 reports 与 raw/lines 子目录整目录移入
# .archives/weekly-reports/<今日>/（gitignored），目录名加 lines-/reports- 前缀防撞
TODAY=$(date +%F)
for base in reports raw/lines; do
  for d in "$base"/*/; do
    [ -e "$d" ] || continue
    name=$(basename "$d")
    if [[ $name =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}(-[0-9]+)?$ && "$name" != "$TODAY" ]]; then
      mkdir -p ".archives/weekly-reports/$TODAY"
      mv "$d" ".archives/weekly-reports/$TODAY/$(basename "$base")-$name"
      echo "==> 存档 $base/$name"
    fi
  done
done

echo "==> 完成 $(date '+%F %T') → reports/$(date +%F)/agent-tech-brief-$(date +%F).md"
