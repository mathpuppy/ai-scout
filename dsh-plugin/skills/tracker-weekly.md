# tracker-weekly — 周度追踪总编排（DeepSeek Harness 原生驱动）

一周一次的总编排：按顺序驱动三条线（harness-digest → line-trending → tracker-merge），随后渲染周报长图、机检产物、滚动归档。本技能替代原 `run-weekly.sh`——驱动者是 DeepSeek Harness 本身（你），不是 pi；pi 只是被跟踪的 harness 之一，不参与运行。

流程：① 定运行日与目录 → ② 依次执行三线 → ③ 渲染 + 机检 → ④ 滚动归档 → ⑤ 汇报。

> **本机执行环境（Windows / PowerShell）**：Harness 的 shell 是 pwsh，不是 bash。下述 `bash` 代码块请用 pwsh 等价命令执行；如需原样跑 bash，本机 Git Bash 位于 `C:\Program Files\Git\bin\bash.exe`。要点：
> - 环境变量：bash 的 `$DSH_TRACKER_SCRIPTS` / `$DSH_TRACKER_PYTHON` 在 pwsh 里写作 `$env:DSH_TRACKER_SCRIPTS` / `$env:DSH_TRACKER_PYTHON`。
> - 日期：`TODAY=$(date +%F)` → `$TODAY = Get-Date -Format 'yyyy-MM-dd'`。
> - 建目录：`mkdir -p a b` → `New-Item -ItemType Directory -Force a, b`。
> - 写日志：清空用 `Set-Content -Path <file> -Value ''`，追加用 `Add-Content -Path <file> -Value '...'`。
> - 抓取一律用 `curl.exe`（pwsh 的 `curl` 是 Invoke-WebRequest 别名）；Python 用 `$env:DSH_TRACKER_PYTHON`（本机 `python3` 是 Microsoft Store 占位符，不可用）。

## ① 定运行日与目录

- 固定一次运行日 `TODAY`（本地日期），全程统一使用，防跨午夜漂移。
- 建立目录并初始化日志：
  ```bash
  TODAY=$(date +%F)
  mkdir -p "raw/lines/$TODAY" "reports/$TODAY"
  : > "raw/lines/$TODAY/run.log"
  ```
- 可选加载仓库根 `.env`（若存在；已导出的同名变量优先，与旧 `run-weekly.sh` 的优先级一致）：
  ```bash
  [ -f .env ] && while IFS= read -r line; do
    case "$line" in ''|'#'*) continue;; esac
    k=${line%%=*}; v=${line#*=}
    case "$v" in '"'*'"') v="${v#\"}"; v="${v%\"}";; esac
    [ -z "${!k:-}" ] && export "$k=$v"
  done < .env
  ```
- 断点续跑：用户说「从 <line> 继续 / --from <line>」时，从该线开始，之前的线跳过（产物落盘即检查点）；此时**不清空** `run.log`，改为追加。起点取值：`harness-digest | line-trending | tracker-merge`。

## ② 依次执行三线

对每条线，按 `harness-digest` → `line-trending` → `tracker-merge` 顺序（从 `--from` 起点开始）：

1. 用 `skill` 工具加载 `<线名>` 技能，按该技能的指令完整执行本期（运行日 = `$TODAY`）。调脚本一律用插件注入的绝对路径 `$DSH_TRACKER_SCRIPTS/<脚本>`。
2. 该线产物落盘即成功（检查点）：
   - harness-digest → `raw/lines/$TODAY/agent-harness-brief-$TODAY.md`
   - line-trending → `raw/lines/$TODAY/trending-$TODAY.md`
   - tracker-merge → `reports/$TODAY/agent-tech-brief-$TODAY.md`
3. 落盘后追加一行日志：
   ```bash
   echo "[<线名>] OK · $(date '+%F %T')" >> "raw/lines/$TODAY/run.log"
   ```
4. 某线失败：如实向用户说明失败线与原因，停在此处（不继续下一条线），提示可用「从 <该线> 继续」断点重跑。

## ③ 渲染 + 机检（增强/机检产物：失败只告警，不阻塞）

周报 Markdown 落盘后（`BRIEF="reports/$TODAY/agent-tech-brief-$TODAY.md"`），在项目根执行：

- 一页信息图（**默认交付物**；playwright + chromium，1080×1440 定比。图片是增强产物，失败只告警不阻塞，无 brief 或缺 chromium 时跳过）：
  ```bash
  if [ -f "$BRIEF" ] && command -v node >/dev/null 2>&1; then
    node "$DSH_TRACKER_SCRIPTS/render-onepage.mjs" "$BRIEF" || echo "警告：一页信息图渲染失败（不影响 Markdown 产物）"
  fi
  ```
  - 产出 `reports/$TODAY/agent-tech-brief-$TODAY.png`，版式为「五家矩阵」：头部标题/期号 → 本期大盘导语 → 五家 harness × 本期关键动作（有「值得看/试」条目的家展开「怎么用」一行）→ 本周黑马星增条 → 观望/仅记录 chip 云。「## 出处」不进图。
  - 画布固定高度，脚本自带溢出检测与阶梯降级（星增条 5→3、收 chip、字号逐档 -2%）。**报告降级档位**；若打印「已到最紧档仍溢出」，说明本期条目过多，须提示用户删条或改出全量长图，不要当成成功。
- 全量长图（可选，需要逐条细节时才出）：`node "$DSH_TRACKER_SCRIPTS/render-brief.mjs" "$BRIEF"` → `agent-tech-brief-$TODAY-full.png`。
- 产物机检（告警不阻塞，退出码非 0 即有告警建议复核）：
  ```bash
  bash "$DSH_TRACKER_SCRIPTS/validate.sh" "$TODAY" || echo "警告：产物校验有告警，建议人工复核"
  ```

## ④ 滚动归档

成功后把非本期（目录名 ≠ `$TODAY`）的 `reports` 与 `raw/lines` 子目录整目录移入 `.archives/weekly-reports/$TODAY/`（gitignored），目录名加 `lines-`/`reports-` 前缀防撞：

```bash
for base in reports raw/lines; do
  for d in "$base"/*/; do
    [ -e "$d" ] || continue
    name=$(basename "$d")
    if [[ $name =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}(-[0-9]+)?$ && "$name" != "$TODAY" ]]; then
      mkdir -p ".archives/weekly-reports/$TODAY"
      mv "$d" ".archives/weekly-reports/$TODAY/$(basename "$base")-$name"
    fi
  done
done
```

## ⑤ 汇报

向用户报告最终周报路径 `reports/$TODAY/agent-tech-brief-$TODAY.md`（及一页信息图 `.png`、以及按需出的 `-full.png`），并简述本期三线成败、机检告警数与信息图降级档位。

## 依赖与环境

- 依赖：`curl.exe`、`$DSH_TRACKER_PYTHON`（harness 抓取预处理，uv 自建 .venv）、`node`（信息图/长图渲染）；`gh` 可选（潮流线补拉，缺则告警退匿名限流）。渲染另需 chromium：`npx playwright install chromium`（首次渲染前装一次）。
- `GH_TOKEN`（gh 认证，可选）与 `BRIEF_SCALE`（信息图倍率，默认 1x；长图用 `FLASH_SCALE`）由环境变量提供；无需 pi 相关变量。
- 脚本目录由插件注入的环境变量 `$DSH_TRACKER_SCRIPTS` 提供，调用脚本一律用它拼绝对路径。
