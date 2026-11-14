#!/usr/bin/env node
// render-onepage.mjs — 把 agent-tech-brief-<date>.md 渲染成「一页信息图」（1080×1440 · 3:4 定比）
// 用法: node render-onepage.mjs reports/2026-11-14/agent-tech-brief-2026-11-14.md
// 依赖: playwright（仓库根 package.json）+ 已下载 chromium
//
// 版式（B 五家矩阵）：头部标题/期号 → 本期大盘导语 → 五家 harness × 本期关键动作矩阵
//   （有价值条目即「值得看/试」的家展开「怎么用」一行，其余一行速览）→ 本周黑马星增条
//   → 观望/仅记录 chip 云 → 页脚。「## 出处」不入图。
//
// 定比契约：画布固定 1440px 高，绝不拉伸。内容超出时按阶梯降级（星增条 5→3 → 收 chip → 缩字号 4%/档），
//   全档仍溢出才裁切并大声告警——静默裁切比出长图更糟。
import { readFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CANVAS_W = 1080
const CANVAS_H = 1440
const BASE_PX = 16

const mdPath = resolve(process.argv[2] ?? '')
if (!mdPath.endsWith('.md')) {
  console.error('用法: node render-onepage.mjs <brief.md 路径>')
  process.exit(1)
}
const md = readFileSync(mdPath, 'utf8')

// ────────────────────────── 解析周报 ──────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** 行内格式：转义 + `code`；反引号被截断成奇数个时整体降级为纯文本，避免露出半个反引号 */
const inlineFmt = (s) => {
  const t = esc(s)
  const parts = t.split('`')
  if (parts.length % 2 === 0) return t.replace(/`/g, '')
  return parts.map((p, i) => (i % 2 ? `<code>${p}</code>` : p)).join('')
}

/** 去掉条目标题里的噪声：家名前缀、括号补充、〔tag〕、前导版本号 */
const cleanTitle = (s, stripRe) =>
  s
    .replace(/〔[^〕]*〕/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(stripRe ?? /^$/, '')
    .replace(/^v?\d+(\.\d+)+[-\w.]*\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

const trunc = (s, n) => { const v = String(s ?? ''); return v.length <= n ? v : v.slice(0, n - 1).replace(/[，、,;\s]+$/, '') + '…' }

/** 智能截断：优先在「，、；与」处收尾（只缩短不增长），避免把词切成「SubAge…」「与空…」 */
const truncSmart = (s, n) => {
  const v = String(s ?? '')
  if (v.length <= n) return v
  const cut = v.slice(0, n)
  const minKeep = Math.max(8, Math.round(n * 0.6))
  for (const re of [/^.*[，、；]/, /^.*与/, /^.*\s/]) {
    const m = cut.match(re)
    if (m && m[0].length >= minKeep) return m[0].replace(/[，、；与\s]+$/, '')
  }
  return trunc(v, n)
}

const lines = md.split('\n')
const model = { title: '', period: '', hero: '', go: [], watch: [], log: [], hot: [], wind: '', other: [] }
let sec = ''

for (const raw of lines) {
  const line = raw.trimEnd()
  if (!line.trim()) continue

  if (line.startsWith('# ')) {
    const t = line.replace(/^#\s*/, '').replace(/^[^\p{L}\p{N}]+/u, '')
    const m = t.match(/^(.*?)\s*[·•]\s*(.+)$/)
    model.title = (m?.[1] ?? t).trim()
    model.period = (m?.[2] ?? '').trim()
    sec = 'title'
    continue
  }
  if (line.startsWith('## ')) {
    const t = line.replace(/^##\s*/, '')
    if (/^出处/.test(t)) break                       // 出处附录不进图
    if (/值得看/.test(t)) sec = 'go'
    else if (/值得观望/.test(t)) sec = 'watch'
    else if (/仅记录/.test(t)) sec = 'log'
    else if (/热门/.test(t)) sec = 'hot'
    else if (/其他动态/.test(t)) sec = 'other'
    else sec = ''
    continue
  }
  if (line.startsWith('### ')) {
    model.go.push({ title: line.slice(4).trim(), what: '', how: '' })
    continue
  }

  const li = line.match(/^[-*]\s+(.*)$/)
  if (!li) {
    // 标题下的第一段 = 本期大盘
    if (!model.hero && /^(大盘|本期)/.test(line)) model.hero = line.replace(/^[^：]*：/, '')
    else if (!model.hero && sec === 'title') model.hero = line
    continue
  }
  const body = li[1]

  if (sec === 'go') {
    const cur = model.go[model.go.length - 1]
    if (!cur) continue
    const w = body.match(/^是什么[：:]\s*(.*)$/)
    const h = body.match(/^怎么用[：:]\s*(.*)$/)
    if (w) cur.what = w[1]
    else if (h) cur.how = h[1]
    continue
  }
  if (sec === 'watch' || sec === 'log') {
    const m = body.match(/^\*\*(.+?)\*\*\s*(?:〔([^〕]*)〕)?\s*[：:]\s*(.*)$/)
    if (m) model[sec].push({ title: m[1].trim(), tag: m[2] ?? '', desc: m[3] })
    else model[sec].push({ title: body.replace(/^\*\*|\*\*$/g, ''), tag: '', desc: '' })
    continue
  }
  if (sec === 'hot') {
    const w = body.match(/^本周风向[：:]\s*(.*)$/)
    if (w) { model.wind = w[1]; continue }
    const m = body.match(/^(\S+)\s+本周\s+\+\s*([\d,]+)\s*星\s*（⭐\s*([\d,]+)）\s*[：:]\s*(.*)$/)
    if (m) model.hot.push({ repo: m[1], delta: +m[2].replace(/,/g, ''), stars: +m[3].replace(/,/g, ''), desc: m[4] })
    continue
  }
  if (sec === 'other') {
    const m = body.match(/^([^：:]+)[：:]\s*(.*)$/)
    if (m) model.other.push({ name: m[1].trim(), items: m[2] })
    continue
  }
}

// ────────────────────────── 家名分桶 ──────────────────────────
const BUCKETS = [
  { id: 'DeepSeek', label: 'DeepSeek', note: 'Harness', strip: /^(DeepSeek|DSH)\s*/i, re: /(DeepSeek|dsh-v)/i },
  { id: 'Hermes', label: 'Hermes', note: 'Agent', strip: /^Hermes(\s+Agent)?\s*/i, re: /Hermes/i },
  { id: 'Codex', label: 'Codex', note: 'OpenAI', strip: /^(OpenAI\s+)?Codex(\s+CLI)?\s*/i, re: /Codex/i },
  { id: 'Claude', label: 'Claude Code', note: 'Anthropic', strip: /^Claude(\s+Code)?\s*/i, re: /Claude/i },
  { id: 'pi', label: 'pi', note: 'coding agent', strip: /^pi\s*/i, re: /(^|[^A-Za-z])pi([^A-Za-z]|$)/ },
  { id: 'eco', label: '生态 / 潮流', note: 'skills · 社区', strip: /^(Anthropic|Vercel|lobehub|LobeHub)\s*/i, re: /./ },
]
const pick = (text) => BUCKETS.find((b) => b.re.test(text)) ?? BUCKETS[BUCKETS.length - 1]

for (const b of BUCKETS) { b.go = []; b.watch = []; b.log = []; b.other = null }
// 先给每条算出压缩后的「动作短语」，再按家名分桶（桶里存引用，chip 与矩阵共用同一份）
for (const e of model.go) e.act = cleanTitle(e.title, pick(e.title).strip)
for (const e of model.watch) e.act = cleanTitle(e.title, pick(e.title).strip)
for (const e of model.log) e.act = cleanTitle(e.title, pick(e.title).strip)
for (const e of model.go) pick(e.title).go.push(e)
for (const e of model.watch) pick(e.title).watch.push(e)
for (const e of model.log) pick(e.title).log.push(e)
for (const o of model.other) {
  if (/筛除/.test(o.name)) continue        // 「潮流线筛除」是筛选备注，不属于任何追踪对象
  pick(o.name).other = o
}

/** 性质标签：结论符号（▲可试/◆观望/·记录）+ 一句话性质词
 *  词表按「最能代表本期性质」排序：能力 > 实验 > 维护 > 配置 > 分发 > 形态。
 *  注意：不把 Code Mode 归入能力（它是 Claude 的实验玩法）、不把 rc/canary 版本号当实验信号。 */
const NATURE_WORDS = [
  [/SubAgent|AgentTeam|subagent|多代理|多会话|编排/, '能力'],
  [/实验性|实验|canary|beta/i, '实验'],
  [/提速|预热|缓存|性能|流式|步进/, '维护'],
  [/供应商|provider|配置|权限|auth|登录|默认模型/, '配置'],
  [/技能|skill|审计|规范|分发/i, '分发'],
  [/网关|浏览器|工作区|桌面|界面|Desktop|标签页/, '形态'],
]
function nature(b) {
  // 只看本家条目正文；「其他动态」是版本号清单，会把 rc/canary 误判成"实验"，故排除
  const pool = [...b.go, ...b.watch, ...b.log]
    .map((e) => e.title + ' ' + (e.what ?? '') + ' ' + (e.desc ?? ''))
    .join(' ')
  const word = NATURE_WORDS.find(([re]) => re.test(pool))?.[1] ?? (b.go.length ? '能力' : '记录')
  const sym = b.go.length ? '▲' : b.watch.length ? '◆' : '·'
  const cls = b.go.length ? 'n-go' : b.watch.length ? 'n-watch' : 'n-log'
  return { text: sym + word, cls }
}

/** 家名行的版本动态计数（来自「其他动态」）；无版本号形态则不计，避免把筛除名单当版本 */
function versionCount(b) {
  if (!b.other) return ''
  const items = b.other.items
  const explicit = items.match(/共\s*(\d+)\s*[节个]/)     // 「2.1.311～2.1.325 共 11 节」
  if (explicit) return `${explicit[1]} 个版本`
  const n = items.split('、').map((s) => s.trim()).filter((s) => /\d+\.\d+/.test(s)).length
  return n ? `${n} 个版本` : ''
}

/** 动作短语太泛（"小幅步进"之类）时，退回条目的第一句说明，保证矩阵每行都有信息 */
function deriveAct(e) {
  if (e.act && !/步进|迭代|杂项|小幅|常规/.test(e.act)) return e.act
  const d = (e.desc ?? '').replace(/^新增\s*/, '').split(/[，。；]/)[0].trim()
  return d || e.act || '常规迭代'
}

// ────────────────────────── 组装 HTML ──────────────────────────
const rows = BUCKETS.filter((b) => b.go.length || b.watch.length || b.log.length || b.other)

/** 一行 = 一家。有「值得看/试」条目的家展开（标题 + 怎么用）；其余只留最深的那个动作。
 *  不在矩阵里补「另 N 项」——观望/仅记录的完整清单统一放在底部 chip 云，避免同一信息出现两次。 */
function renderRow(b, opt) {
  const nat = nature(b)
  const vc = versionCount(b)
  let act
  if (b.go.length) {
    act = b.go
      .slice(0, opt.maxGo)
      .map((e) => `<div class="m-act"><b>${inlineFmt(e.act)}</b>` +
        (opt.showHow && e.how ? `<span class="m-how">${inlineFmt(truncSmart(e.how, opt.howLen))}</span>` : '') + '</div>')
      .join('')
  } else {
    const one = b.watch[0] ?? b.log[0]
    act = `<div class="m-act"><b>${inlineFmt(truncSmart(deriveAct(one ?? {}), opt.compactLen))}</b></div>`
  }
  return `<div class="m-row">
    <div class="m-name">${esc(b.label)}<span>${esc(b.note)}</span></div>
    <div>${act}</div>
    <div class="m-nature ${nat.cls}">${esc(nat.text)}${vc ? `<span class="n-note">${esc(vc)}</span>` : ''}</div>
  </div>`
}

function renderHTML(opt) {
  const heroHtml = esc(trunc(model.hero, opt.heroLen))
  const hotTop = model.hot.slice(0, opt.hotCount)
  const maxDelta = Math.max(1, ...hotTop.map((h) => h.delta))

  const hotRows = hotTop
    .map((h, i) => `<div class="h-row">
      <div class="h-rank">${i + 1}</div>
      <div class="h-repo">${esc(h.repo)}</div>
      <div class="h-bar"><i style="width:${Math.max(6, Math.round((h.delta / maxDelta) * 100))}%"></i></div>
      <div class="h-delta">+${(h.delta / 1000).toFixed(1)}k</div>
    </div>`)
    .join('')

  const chip = (e, cls) => `<span class="chip ${cls}">${inlineFmt(truncSmart(deriveAct(e), opt.chipLen))}</span>`
  const watchChips = model.watch.length
    ? `<div class="c-line"><div class="c-tag">观望 <em>${model.watch.length}</em></div><div class="c-wrap">${model.watch.slice(0, opt.chipCount).map((e) => chip(e, 'chip-watch')).join('')}</div></div>`
    : ''
  const logChips = model.log.length
    ? `<div class="c-line"><div class="c-tag">记录 <em>${model.log.length}</em></div><div class="c-wrap">${model.log.slice(0, opt.chipCount).map((e) => chip(e, 'chip-log')).join('')}</div></div>`
    : ''

  const footR = `${model.go.length + model.watch.length + model.log.length} 条条目 · ${BUCKETS.length} 个追踪对象`

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="card">
  <div class="topbar"></div>
  <div class="body">
    <div class="head">
      <div>
        <div class="h-title">${esc(model.title || 'Agent 技术周报')}</div>
        <div class="h-sub">AI SCOUT · WEEKLY TRACKER</div>
      </div>
      <div class="h-period">${esc(model.period)}<small>本期要点一页版</small></div>
    </div>
    ${heroHtml ? `<div class="hero">${heroHtml}</div>` : ''}
    <section class="matrix">
      <div class="label">五家动向 · 本期关键动作</div>
      <div class="m-head"><div>Harness</div><div>关键动作</div><div class="m-nature">性质</div></div>
      ${rows.map((b) => renderRow(b, opt)).join('')}
    </section>
    ${hotRows ? `<section class="hot">
      <div class="label">本周黑马 · 按周星增${model.wind ? '' : ''}</div>
      ${hotRows}
    </section>` : ''}
    ${watchChips || logChips ? `<section class="chips">${watchChips}${logChips}</section>` : ''}
  </div>
  <div class="foot"><div>ai-scout 周度追踪 · 自动生成</div><div>${esc(footR)} · 完整出处见 Markdown</div></div>
</div></body></html>`
}

// ────────────────────────── 渲染 + 溢出阶梯降级 ──────────────────────────
const CSS = readFileSync(resolve(ROOT, 'scripts/brief-onepage.css'), 'utf8')
const SCALE = Math.min(3, Math.max(1, Number(process.env.BRIEF_SCALE) || 1))
const outPath = mdPath.replace(/\.md$/, '.png')
mkdirSync(dirname(outPath), { recursive: true })

// 降级阶梯：先删内容，再收 chip，最后缩字号（字号一缩，整页等比重排）
const STEPS = [
  { hotCount: 5, chipCount: 9, maxGo: 2, showHow: true,  howLen: 56, compactLen: 30, heroLen: 190, chipLen: 20, fit: 1 },
  { hotCount: 5, chipCount: 9, maxGo: 2, showHow: true,  howLen: 52, compactLen: 28, heroLen: 180, chipLen: 19, fit: 0.98 },
  { hotCount: 5, chipCount: 9, maxGo: 2, showHow: true,  howLen: 48, compactLen: 26, heroLen: 170, chipLen: 18, fit: 0.96 },
  { hotCount: 4, chipCount: 8, maxGo: 2, showHow: true,  howLen: 44, compactLen: 24, heroLen: 150, chipLen: 16, fit: 0.94 },
  { hotCount: 4, chipCount: 7, maxGo: 1, showHow: true,  howLen: 38, compactLen: 22, heroLen: 130, chipLen: 15, fit: 0.92 },
  { hotCount: 3, chipCount: 7, maxGo: 1, showHow: true,  howLen: 34, compactLen: 20, heroLen: 120, chipLen: 14, fit: 0.90 },
  { hotCount: 3, chipCount: 6, maxGo: 1, showHow: false, howLen: 0,  compactLen: 18, heroLen: 110, chipLen: 13, fit: 0.88 },
  { hotCount: 3, chipCount: 6, maxGo: 1, showHow: false, howLen: 0,  compactLen: 16, heroLen: 100, chipLen: 12, fit: 0.85 },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: CANVAS_W, height: CANVAS_H }, deviceScaleFactor: SCALE })

let used = null
let over = 0
let fill = 0
const trace = []
for (const [i, opt] of STEPS.entries()) {
  await page.setContent(renderHTML(opt), { waitUntil: 'networkidle' })
  await page.evaluate((px) => { document.documentElement.style.fontSize = px + 'px' }, BASE_PX * opt.fit)
  const h = await page.evaluate(() => {
    const body = document.querySelector('.body')
    const top = body.getBoundingClientRect().top
    const last = body.lastElementChild
    const contentH = last ? Math.round(last.getBoundingClientRect().bottom - top) : 0
    return { scroll: body.scrollHeight, client: body.clientHeight, contentH }
  })
  // 用「最后一个元素的底边」而非 scrollHeight：尾随 margin 会被算进 scrollHeight，误报溢出
  over = h.contentH - h.client
  fill = h.contentH / h.client
  trace.push({ 档: i + 1, fit: opt.fit, 内容高: h.contentH, 可用高: h.client, 占比: fill.toFixed(3), 溢出: over })
  if (over <= 0) { used = { opt, i, h }; break }
  if (i === STEPS.length - 1) used = { opt, i, h }
}
if (process.env.DEBUG) console.table(trace)

const card = page.locator('.card')
await card.screenshot({ path: outPath })
await browser.close()

const kb = (statSync(outPath).size / 1024).toFixed(0)
const lv = used.i + 1
if (over > 0) {
  console.warn(`⚠ 一页已到最紧档仍溢出 ${over}px（画布 ${CANVAS_W}×${CANVAS_H}）——内容已裁切，建议本期删条或改用 --full 长图`)
} else {
  console.log(`✓ ${basename(outPath)} (${kb} KB · ${CANVAS_W}×${CANVAS_H} · 降级档 ${lv}/${STEPS.length} · 余量 ${-over}px)`)
}
process.exit(over > 0 ? 2 : 0)
