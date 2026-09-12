#!/usr/bin/env bash
# 周度 Agent 技术追踪 · 顺序编排（设计见 docs/weekly-tracker-design.md）
# 失败恢复：set -e 停在失败那条，手动重跑对应 pi 命令即可（产物落盘即检查点）。
set -euo pipefail
cd "$(dirname "$0")"

# L1 需要 folo 认证：FOLO_TOKEN 或 folocli login 存储态，二者有其一即可
npx --yes folocli@latest whoami >/dev/null 2>&1 \
  || { echo "folo 未认证：设置 FOLO_TOKEN，或运行 npx --yes folocli@latest login" >&2; exit 1; }

mkdir -p raw/lines reports

# 技能白名单：只挂本仓库 .agents/skills，屏蔽 ~/.agents/skills 等全局目录
SKILLS_DIR="$(pwd)/.agents/skills"

run() {
  echo "==> [$1] $(date '+%F %T')"
  pi -p --no-skills --skill "$SKILLS_DIR" "/skill:$1"
}

run line-breadth     # L1 融合线 → raw/lines/breadth-<date>.md
run harness-digest   # L2 深度线 → reports/agent-harness-brief-<date>.md
run line-trending    # L3 潮流线 → raw/lines/trending-<date>.md
run tracker-merge    # 合流     → reports/agent-tech-brief-<date>.md

echo "==> 完成 $(date '+%F %T') → reports/agent-tech-brief-$(date +%F).md"
