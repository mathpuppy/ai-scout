#!/usr/bin/env bash
# 周度 Agent Harness 追踪 · 轻量版（设计见 docs/weekly-tracker-design.md）
# 两线采集：harness 官方 release（Claude Code / Codex / Hermes / pi / DeepSeek）+ GitHub 官方周榜。
# 失败恢复：set -e 停在失败那条；修复后 ./run-weekly.sh --from <skill> 从该条断点重跑（产物落盘即检查点）。
#
# 用法：
#   ./run-weekly.sh                        # 全量运行
#   ./run-weekly.sh --from line-trending   # 断点重跑：从 harness-digest|line-trending|tracker-merge 开始
#   ./run-weekly.sh -h                     # 帮助
#
# 迁移到新机器：clone 本仓库后备齐以下环境变量/依赖即可跑（LLM 项全部可选，
# 未设置时用 pi 本机默认配置 ~/.pi/agent/settings.json + auth.json）：
#   PI_PROVIDER   LLM provider 名（如 zai-coding-cn / anthropic / openai）
#   PI_MODEL      模型名，支持 provider/id:thinking 组合（如 glm-5.3:high）
#   PI_API_KEY    API key（也可改用 provider 原生变量如 ANTHROPIC_API_KEY；
#                 注意 auth.json 里已存的 key 优先级高于环境变量）
#   PI_THINKING   思考档位（off/minimal/low/medium/high/xhigh/max）
#   GH_TOKEN      gh 认证（或先 gh auth login；不配则潮流线补拉退匿名限流）
#   FLASH_SCALE   周报长图倍率（默认 1x=750px 宽，企业 IM 友好；设 2 出 1500px 高清档）
# 依赖：node/npx（pi 需要）、pi、curl、python3（harness 抓取预处理）；gh 可选（潮流线补拉，缺则告警）。
# 长图渲染另需 chromium：npx playwright install chromium（首次渲染前装一次即可）。
#
# 配置来源优先级（高到低）：命令行环境变量 > 仓库根 .env 文件 > pi 本机默认。
# .env 模板见 .env.example：复制为 .env 填写，.env 已 gitignore 不入库。
set -euo pipefail
cd "$(dirname "$0")"

# ── 参数：--from 断点重跑 ──
FROM="harness-digest"
case "${1:-}" in
  "")
    ;;
  --from)
    FROM="${2:?用法: ./run-weekly.sh --from <harness-digest|line-trending|tracker-merge>}"
    ;;
  -h|--help)
    sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *)
    echo "未知参数：$1（支持 --from <skill> / -h）" >&2
    exit 2
    ;;
esac

# ── .env 支持：仓库根有 .env 则加载白名单键；已导出的环境变量优先，.env 不覆盖 ──
if [ -f .env ]; then
  while IFS= read -r _line || [ -n "$_line" ]; do
    _line="${_line%$'\r'}"
    case "$_line" in
      ''|\#*) continue ;;
      PI_PROVIDER=*|PI_MODEL=*|PI_API_KEY=*|PI_THINKING=*|GH_TOKEN=*|FLASH_SCALE=*)
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

# ── 依赖预检：缺啥报啥，避免跑到中途才发现；gh 可选仅告警 ──
_missing=()
for _cmd in pi curl node python3; do
  command -v "$_cmd" >/dev/null 2>&1 || _missing+=("$_cmd")
done
if [ "${#_missing[@]}" -gt 0 ]; then
  echo "错误：缺少依赖：${_missing[*]}（pi 需要 node/npx）" >&2
  exit 1
fi
command -v gh >/dev/null 2>&1 || echo "警告：gh 未安装或不在 PATH，潮流线补拉将退匿名限流" >&2
echo "==> pi $(pi --version 2>/dev/null || echo 版本未知)"

# ── 运行日与目录：固定一次 TODAY，防跨午夜漂移 ──
TODAY=$(date +%F)
mkdir -p "raw/lines/$TODAY" "reports/$TODAY"
LOG="raw/lines/$TODAY/run.log"

# 技能白名单：只挂本仓库 .agents/skills，屏蔽 ~/.agents/skills 等全局目录
SKILLS_DIR="$(pwd)/.agents/skills"

# LLM 配置：环境变量存在才传对应 flag，否则继承 pi 本机默认
PI_ARGS=(-p --no-skills --skill "$SKILLS_DIR")
[ -n "${PI_PROVIDER:-}" ] && PI_ARGS+=(--provider "$PI_PROVIDER")
[ -n "${PI_MODEL:-}" ]    && PI_ARGS+=(--model "$PI_MODEL")
[ -n "${PI_API_KEY:-}" ]  && PI_ARGS+=(--api-key "$PI_API_KEY")
[ -n "${PI_THINKING:-}" ] && PI_ARGS+=(--thinking "$PI_THINKING")

log_run() {
  echo "[$1] $2 · $((SECONDS - $3))s · $(date '+%F %T')" >> "$LOG"
}

run() {
  echo "==> [$1] $(date '+%F %T')"
  local _t0=$SECONDS
  if pi "${PI_ARGS[@]}" "/skill:$1"; then
    log_run "$1" OK "$_t0"
  else
    local _rc=$?
    log_run "$1" "FAIL(rc=$_rc)" "$_t0"
    echo "失败于 $1（日志：$LOG）。修复后可用：./run-weekly.sh --from $1" >&2
    exit "$_rc"
  fi
}

# ── 按序执行（--from 决定起点）──
LINES=(harness-digest line-trending tracker-merge)
_started=0
for _line in "${LINES[@]}"; do
  [ "$_line" = "$FROM" ] && _started=1
  [ "$_started" = 1 ] && run "$_line"
done
if [ "$_started" = 0 ]; then
  echo "未知起点：$FROM（可用：${LINES[*]}）" >&2
  exit 2
fi

BRIEF_MD="reports/$TODAY/agent-tech-brief-$TODAY.md"

# 周报长图（卡片周刊风，增强产物：失败只告警不阻塞，无 brief md 或缺 chromium 时跳过）
if [ -f "$BRIEF_MD" ] && command -v node >/dev/null 2>&1; then
  echo "==> [render-brief] $(date '+%F %T')"
  _t0=$SECONDS
  if node scripts/render-brief.mjs "$BRIEF_MD"; then
    log_run render-brief OK "$_t0"
  else
    log_run render-brief FAIL "$_t0"
    echo "警告：周报长图渲染失败（不影响 markdown 产物），可手动重跑：node scripts/render-brief.mjs $BRIEF_MD" >&2
  fi
fi

# 产物校验（机检一道：告警不阻塞，详见 scripts/validate.sh）
if [ -f "$BRIEF_MD" ] && [ -x scripts/validate.sh ]; then
  echo "==> [validate] $(date '+%F %T')"
  _t0=$SECONDS
  if bash scripts/validate.sh "$TODAY"; then
    log_run validate OK "$_t0"
  else
    log_run validate FAIL "$_t0"
    echo "警告：产物校验有告警，见上方输出（不影响产物，建议人工复核）" >&2
  fi
fi

# 滚动存档：成功结束后，非本期（目录名非今日）的 reports 与 raw/lines 子目录整目录移入
# .archives/weekly-reports/<今日>/（gitignored），目录名加 lines-/reports- 前缀防撞
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

echo "==> 完成 $(date '+%F %T') → $BRIEF_MD"
