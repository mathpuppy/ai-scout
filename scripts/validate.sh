#!/usr/bin/env bash
# validate.sh — 周报产物轻量机检（告警不阻塞主流程；退出码非 0 即"有告警，建议人工复核"）
# 检查项：线产物存在与结构、周报存在、分组结构与条目三件行、出处附录、URL 可溯源到 raw 产物。
# 用法: scripts/validate.sh [运行日，默认今天]
set -uo pipefail

DATE="${1:-$(date +%F)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RAW="raw/lines/$DATE"
REPORTS="reports/$DATE"
warnings=0

warn() { echo "校验：$1"; warnings=$((warnings + 1)); }

# 取目录内同名前缀的最新一份（同日第二份带 -2 后缀）
latest() { ls -1 "$2"/"$1"-"$DATE"*.md 2>/dev/null | sort -V | tail -1; }

HARNESS=$(latest agent-harness-brief "$RAW")
TRENDING=$(latest trending "$RAW")
BRIEF=$(latest agent-tech-brief "$REPORTS")

# ── 存在性 ──
[ -n "$HARNESS" ] || warn "缺 harness 线产物 raw/lines/$DATE/agent-harness-brief-$DATE.md"
[ -n "$TRENDING" ] || warn "缺潮流线产物 raw/lines/$DATE/trending-$DATE.md"
[ -n "$BRIEF" ] || warn "缺周报 reports/$DATE/agent-tech-brief-$DATE.md"

# ── 线产物结构 ──
if [ -n "$HARNESS" ]; then
  grep -q '^## TL;DR' "$HARNESS" || warn "harness 简报缺 TL;DR 节：$HARNESS"
  grep -q '^## 横向趋势' "$HARNESS" || warn "harness 简报缺横向趋势节：$HARNESS"
fi
if [ -n "$TRENDING" ]; then
  grep -q '^## 事实条目' "$TRENDING" || warn "潮流线产物缺事实条目节：$TRENDING"
  grep -q '^## 本线研判' "$TRENDING" || warn "潮流线产物缺本线研判节：$TRENDING"
fi

# ── 周报结构与一致性 ──
if [ -n "$BRIEF" ]; then
  for _h in '👉 值得看' '👀 值得观望' '📋 仅记录' '🔥 GitHub 本周热门'; do
    grep -q "^## $_h" "$BRIEF" || warn "周报缺分组节：$_h"
  done
  grep -q '^## 出处' "$BRIEF" || warn "周报缺出处附录：$BRIEF"

  # 值得看/试条目三件行：### 条目数 = 是什么数 = 怎么用数
  _block=$(sed -n '/^## 👉 值得看/,/^## 👀 /p' "$BRIEF")
  _entries=$(printf '%s\n' "$_block" | grep -c '^### ' || true)
  _whats=$(printf '%s\n' "$_block" | grep -c '^- 是什么：' || true)
  _hows=$(printf '%s\n' "$_block" | grep -c '^- 怎么用：' || true)
  if [ "$_entries" -gt 0 ] && { [ "$_entries" -ne "$_whats" ] || [ "$_entries" -ne "$_hows" ]; }; then
    warn "值得看/试条目三件行不齐（条目 $_entries / 是什么 $_whats / 怎么用 $_hows）"
  fi

  # URL 可溯源：周报里每个 URL 必须出现在本期 raw 目录的线产物中（防幻觉链接的最后一道机检）
  if [ -d "$RAW" ]; then
    for u in $(grep -oE 'https?://[^ )>"]+' "$BRIEF" | sort -u); do
      grep -rqF --include='*.md' "$u" "$RAW" || warn "URL 未见于线产物（疑似新增链接）：$u"
    done
  fi
fi

if [ "$warnings" -eq 0 ]; then
  echo "校验：通过（$DATE，两份线产物 + 周报，URL 全部可溯源）"
else
  echo "校验：告警 $warnings 条（产物不受影响，建议人工复核）"
fi
exit $((warnings > 0))
