#!/usr/bin/env bash
# 周度 Agent 技术追踪 · 顺序编排（设计见 docs/weekly-tracker-design.md）
# 失败恢复：set -e 停在失败那条，手动重跑对应 pi 命令即可（产物落盘即检查点）。
#
# 迁移到新机器：clone 本仓库后备齐以下环境变量/依赖即可跑（LLM 项全部可选，
# 未设置时用 pi 本机默认配置 ~/.pi/agent/settings.json + auth.json）：
#   PI_PROVIDER   LLM provider 名（如 zai-coding-cn / anthropic / openai）
#   PI_MODEL      模型名，支持 provider/id:thinking 组合（如 glm-5.3:high）
#   PI_API_KEY    API key（也可改用 provider 原生变量如 ANTHROPIC_API_KEY；
#                 注意 auth.json 里已存的 key 优先级高于环境变量）
#   PI_THINKING   思考档位（off/minimal/low/medium/high/xhigh/max）
#   FOLO_TOKEN    folo 认证（或先 npx --yes folocli@latest login 存登录态）
#   GH_TOKEN      gh 认证（或先 gh auth login；不配则 L3 退匿名限流）
# 依赖：node/npx、pi、python3、curl
set -euo pipefail
cd "$(dirname "$0")"

# L1 需要 folo 认证：FOLO_TOKEN 或 folocli login 存储态，二者有其一即可
npx --yes folocli@latest whoami >/dev/null 2>&1 \
  || { echo "folo 未认证：设置 FOLO_TOKEN，或运行 npx --yes folocli@latest login" >&2; exit 1; }

mkdir -p raw/lines reports

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

run line-breadth     # L1 融合线 → raw/lines/breadth-<date>.md
run harness-digest   # L2 深度线 → reports/agent-harness-brief-<date>.md
run line-trending    # L3 潮流线 → raw/lines/trending-<date>.md
run tracker-merge    # 合流     → reports/agent-tech-brief-<date>.md

echo "==> 完成 $(date '+%F %T') → reports/agent-tech-brief-$(date +%F).md"
