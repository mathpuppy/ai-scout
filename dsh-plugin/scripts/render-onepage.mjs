#!/usr/bin/env node
// render-onepage.mjs — 把 agent-tech-brief-<date>.md 渲染成「一页信息图」（1080×1440 · 3:4 定比）
// 用法: node render-onepage.mjs reports/2026-11-14/agent-tech-brief-2026-11-14.md
// 依赖: playwright（仓库根 package.json）+ 已下载 chromium
//
// 版式 v2（两块，按条目的〔harness〕/〔潮流〕标签分板）：
//   头部标题/期号 → 本期大盘 → ① Harness 追踪（5 家 × 是什么/怎么用，观望·记录降为同行注脚）
//   → ② GitHub 潮流（星增主榜带一句话说明 + 生态看点含怎么用）→ 页脚。「## 出处」不入图。
//
// 定比契约：画布固定 1440px 高，绝不拉伸。内容超出时按阶梯降级（先压正文行数，再删榜尾条目，
//   最后整页缩字号），全档仍溢出才裁切并大声告警（退出码 2）——静默裁切比出长图更糟。
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

// ────────────────────────── 文本工具 ──────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** 行内格式：转义 + `code`；反引号被截成奇数个时整体降级纯文本，避免露出半个反引号 */
const inlineFmt = (s) => {
  const t = esc(s)
  const parts = t.split('`')
  if (parts.length % 2 === 0) return t.replace(/`/g, '')
  return parts.map((p, i) => (i % 2 ? `<code>${p}</code>` : p)).join('')
}
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

/** 按分句预算取前若干小句（逗号/顿号为界），凑不成整句再退化为智能截断。
 *  单行卡片只能放一句，拼出来的才读得顺，不会切在词中间。 */
function clause(s, n) {
  const v = String(s ?? '').replace(/^新增\s*/, '').trim()
  if (!v) return ''
  if (v.length <= n) return v
  const parts = v.split(/[。；]/)[0].split(/[，、]/).map((p) => p.trim()).filter(Boolean)
  // 跳过「升级到 v0.x」这类纯版本号小句，优先给有动作内容的那句
  const usable = parts.filter((p, i) => !(i === 0 && /^(升级到|更新到|发布)\s*v?\d/.test(p)))
  let out = ''
  for (const p of usable) {
    const next = out ? `${out}，${p}` : p
    if (next.length > n) break
    out = next
  }
  return out || truncSmart(usable[0] ?? v, n)
}

/** 去掉条目标题里的噪声：〔tag〕、括号补充、家名前缀、前导版本号 */
const cleanTitle = (s, stripRe) =>
  s
    .replace(/〔[^〕]*〕/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(stripRe ?? /^$/, '')
    .replace(/^v?\d+(\.\d+)+[-\w.]*\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

/** 从条目文本里抽出「本周 +N 星（⭐M）」并返回去掉数字后的正文，供徽章与正文分工 */
function extractStars(s) {
  const d = s.match(/本周\s*\+\s*([\d,]+)\s*星/)
  const t = s.match(/⭐\s*([\d,]+)/)
  const clean = s
    .replace(/本周\s*\+\s*[\d,]+\s*星/, '')
    .replace(/（\s*⭐\s*[\d,]+\s*）/, '')
    .replace(/[，、]\s*[，、]/g, '，')
    .replace(/[（(]\s*[）)]/g, '')                   // 抽掉数字后可能留下空括号
    .replace(/\s{2,}/g, ' ')
    .replace(/[，、\s]+$/, '')
    .replace(/^[，、\s]+/, '')
  return { delta: d?.[1] ?? '', stars: t?.[1] ?? '', clean: clean.trim() }
}

// ────────────────────────── 解析周报 ──────────────────────────
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
    const title = line.slice(4).trim()
    const tag = title.match(/〔([^〕]*)〕/)?.[1] ?? ''
    model.go.push({ title, tag, what: '', how: '' })
    continue
  }

  const li = line.match(/^[-*]\s+(.*)$/)
  if (!li) {
    if (!model.hero && sec === 'title') model.hero = line.replace(/^[^：]*：/, '')
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
    if (m) model.hot.push({ repo: m[1], delta: +m[2].replace(/,/g, ''), stars: m[3], desc: m[4] })
    continue
  }
  if (sec === 'other') {
    const m = body.match(/^([^：:]+)[：:]\s*(.*)$/)
    if (m) model.other.push({ name: m[1].trim(), items: m[2] })
    continue
  }
}

// ────────────────────────── 分板：① Harness ② 潮流 ──────────────────────────
const HARNESS = [
  { id: 'DeepSeek', label: 'DeepSeek', note: 'Harness', strip: /^(DeepSeek|DSH)\s*/i, re: /(DeepSeek|dsh-v)/i },
  { id: 'Hermes', label: 'Hermes', note: 'Agent', strip: /^Hermes(\s+Agent)?\s*/i, re: /Hermes/i },
  { id: 'Codex', label: 'Codex', note: 'OpenAI', strip: /^(OpenAI\s+)?Codex(\s+CLI)?\s*/i, re: /Codex/i },
  { id: 'Claude', label: 'Claude Code', note: 'Anthropic', strip: /^Claude(\s+Code)?\s*/i, re: /Claude/i },
  { id: 'pi', label: 'pi', note: 'coding agent', strip: /^pi\s*/i, re: /(^|[^A-Za-z])pi([^A-Za-z]|$)/ },
]
for (const h of HARNESS) { h.go = []; h.watch = []; h.log = []; h.other = null }
const trend = { go: [], watch: [], log: [] }

/** 归属判定：带〔潮流〕标签的进潮流板；否则按家名匹配 harness，匹配不到也归潮流板（生态项目兜底） */
const bucketOf = (e) => {
  if (/潮流/.test(e.tag)) return null
  return HARNESS.find((h) => h.re.test(e.title)) ?? null
}

for (const e of model.go) {
  const b = bucketOf(e)
  e.act = cleanTitle(e.title, b?.strip)
  if (b) b.go.push(e); else trend.go.push(e)
}
for (const e of model.watch) {
  const b = bucketOf(e)
  e.act = cleanTitle(e.title, b?.strip)
  if (b) b.watch.push(e); else trend.watch.push(e)
}
for (const e of model.log) {
  const b = bucketOf(e)
  e.act = cleanTitle(e.title, b?.strip)
  if (b) b.log.push(e); else trend.log.push(e)
}
for (const o of model.other) {
  if (/筛除/.test(o.name)) continue                // 「潮流线筛除」是筛选备注，不属于任何追踪对象
  const b = HARNESS.find((h) => h.re.test(o.name))
  if (b) b.other = o
}

/** 性质词：能力 > 实验 > 维护 > 配置 > 分发 > 形态（不把 Code Mode 归能力，不把 rc/canary 当实验） */
const NATURE_WORDS = [
  [/SubAgent|AgentTeam|subagent|多代理|多会话|编排/, '能力'],
  [/实验性|实验|canary|beta/i, '实验'],
  [/提速|预热|缓存|性能|流式|步进/, '维护'],
  [/供应商|provider|配置|权限|auth|登录|默认模型/, '配置'],
  [/技能|skill|审计|规范|分发/i, '分发'],
  [/网关|浏览器|工作区|桌面|界面|Desktop|标签页/, '形态'],
]
/** 单条目的性质标签：符号由结论定（▲可试/◆观望/·记录），词由该条目自身文本推断 */
function cardNature(entry, kind) {
  const pool = `${entry.title ?? ''} ${entry.what ?? ''} ${entry.desc ?? ''}`
  const word = NATURE_WORDS.find(([re]) => re.test(pool))?.[1] ?? (kind === 'go' ? '能力' : '记录')
  const sym = kind === 'go' ? '▲' : kind === 'watch' ? '◆' : '·'
  return sym + word
}

function versionCount(b) {
  if (!b.other) return ''
  const items = b.other.items
  const explicit = items.match(/共\s*(\d+)\s*[节个]/)
  if (explicit) return `${explicit[1]} 个版本`
  const n = items.split('、').map((s) => s.trim()).filter((s) => /\d+\.\d+/.test(s)).length
  return n ? `${n} 个版本` : ''
}

/** 动作短语太泛（"小幅步进"之类）时，退回条目第一句说明，保证每行都有信息 */
function deriveAct(e) {
  if (e.act && !/步进|迭代|杂项|小幅|常规/.test(e.act)) return e.act
  const d = (e.desc ?? '').replace(/^新增\s*/, '').split(/[，。；]/)[0].trim()
  if (!d) return e.act || '常规迭代'
  // 首句过长又没有逗号时（如「pi auth login/logout 与空闲缓存预热」）在「与」处断开，标题只取前半
  if (d.length > 22) {
    const head = d.split('与')[0].trim()
    if (head.length >= 8 && head.length < d.length) return head
  }
  return d
}

// ────────────────────────── 组装 HTML ──────────────────────────
const rows = HARNESS.filter((b) => b.go.length || b.watch.length || b.log.length || b.other)

/** 单行卡片的两段正文按「实测宽度」分配后裁到分句边界：
 *  量出动作/性质/正文/怎么用的自然宽度 → 怎么用最多占一半，其余给正文 → 各自裁到分句边界。
 *  比按字符数猜预算准，中英混排、代码片段、不同家名长度都能自适应。 */
const FIT_CARDS = () => {
  const GAP = 7
  const PAD = 24          // .hcard 左右各 12px
  const SAFETY = 8        // 留一点余量，避免四舍五入后挤到换行/滚动
  const fit = (el) => {
    const full = el.textContent
    const box = el.clientWidth
    if (el.scrollWidth <= box) return 'ok'
    const measure = (t) => { el.textContent = t; return el.scrollWidth }
    // 二分找「最长且带省略号还放得下」的字符数，避免分句粒度太粗浪费空间
    let lo = 0
    let hi = full.length
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2)
      if (measure(full.slice(0, mid) + '…') <= box) lo = mid
      else hi = mid - 1
    }
    // 若切点前不太远处有分句边界，退到边界上，读起来更完整
    let cut = lo
    const seg = full.slice(0, cut)
    const m = seg.match(/^[\s\S]*[，、；]/)
    if (m && m[0].length >= Math.floor(cut * 0.75)) cut = m[0].length
    el.textContent = full.slice(0, cut).replace(/[，、；\s]+$/, '') + '…'
    return 'cut'
  }
  const stats = {}
  const bump = (k) => { stats[k] = (stats[k] ?? 0) + 1 }
  for (const c of document.querySelectorAll('.hcard')) {
    const act = c.querySelector('.hc-act')
    const w = c.querySelector('.hc-what')
    const h = c.querySelector('.hc-how')
    const nat = c.querySelector('.hc-nat')
    const nGaps = GAP * ((w ? 1 : 0) + (h ? 1 : 0) + 1)
    const avail = c.clientWidth - PAD - (act?.scrollWidth ?? 0) - (nat?.scrollWidth ?? 0) - nGaps - SAFETY
    if (w && h) {
      const howW = Math.min(h.scrollWidth, Math.floor(avail * 0.5))
      h.style.width = howW + 'px'
      w.style.width = Math.max(80, avail - howW) + 'px'
    } else if (w) {
      w.style.width = Math.max(80, avail) + 'px'
    }
    if (h) bump('how_' + fit(h))
    if (w) bump('what_' + fit(w))
    if (c.scrollWidth > c.clientWidth + 1) bump('card_over')
    ;(stats.cards ??= []).push({
      t: (act?.textContent ?? '').slice(0, 10),
      cw: c.clientWidth, act: act?.scrollWidth ?? 0, nat: nat?.scrollWidth ?? 0,
      avail, wset: w?.style.width ?? '', hset: h?.style.width ?? '',
      wuse: w?.clientWidth ?? 0, huse: h?.clientWidth ?? 0,
    })
  }
  return stats
}

/** 一个条目 = 一张单行卡片：动作 · 是什么(一句) ▸ 怎么用(一句) [性质]；超出宽度由 FIT_CARDS 裁。 */
function cardHTML(entry, kind, opt) {
  const act = kind === 'go' ? entry.act : deriveAct(entry)
  const rawWhat = kind === 'go' ? (entry.what ?? '') : (entry.desc ?? '')
  const st = extractStars(rawWhat)
  // 说明开头就是标题本身时（如 pi）去掉重复部分，避免同一句话说两遍
  let whatSrc = st.clean.replace(/^新增\s*/, '')
  if (act && whatSrc.startsWith(act)) whatSrc = whatSrc.slice(act.length).replace(/^[与和，、：:\s]+/, '')
  const what = clause(whatSrc, opt.whatLen)
  const how = kind === 'go' && opt.showHow && entry.how ? clause(entry.how, opt.howLen) : ''
  return `<div class="hcard hc-${kind}">` +
    `<span class="hc-act">${inlineFmt(truncSmart(act, opt.actLen))}</span>` +
    (what ? `<span class="hc-what">${inlineFmt(what)}</span>` : '') +
    (how ? `<span class="hc-how">${inlineFmt(how)}</span>` : '') +
    `<span class="hc-nat">${esc(cardNature(entry, kind))}</span>` +
    `</div>`
}

/** 一家一组：左侧家名 + 版本数只出现一次，右侧堆它的单行卡片（可试 > 观望 > 记录） */
function renderHarnessGroup(b, opt) {
  const vc = versionCount(b)
  const cards = [
    ...b.go.slice(0, opt.maxGo).map((e) => cardHTML(e, 'go', opt)),
    ...b.watch.map((e) => cardHTML(e, 'watch', opt)),
    ...b.log.map((e) => cardHTML(e, 'log', opt)),
  ].join('')
  return `<div class="hgroup">
    <div class="hg-label"><b>${esc(b.label)}</b><span>${esc(b.note)}${vc ? `<br>${esc(vc)}` : ''}</span></div>
    <div class="hg-cards">${cards}</div>
  </div>`
}

function renderTrend(opt) {
  const miniLen = opt.miniLen ?? Math.round(opt.descLen * 1.7)   // mini 行是「名字 + 一句说明」，比榜单单行更宽裕
  const hotTop = model.hot.slice(0, opt.hotCount)
  const maxDelta = Math.max(1, ...hotTop.map((h) => h.delta))
  const hotHtml = hotTop.map((h, i) => {
    // 榜单列宽固定：过长的 owner/repo 去掉 owner，保留更有辨识度的仓库名
    const shown = h.repo.length > 24 && h.repo.includes('/') ? h.repo.split('/').slice(1).join('/') : h.repo
    return `<div class="h-row">
      <div class="h-rank">${i + 1}</div>
      <div class="h-repo">${esc(shown)}</div>
      <div class="h-bar"><i style="width:${Math.max(5, Math.round((h.delta / maxDelta) * 100))}%"></i></div>
      <div class="h-delta">+${(h.delta / 1000).toFixed(1)}k</div>
      <div class="h-desc">${inlineFmt(truncSmart(h.desc, opt.descLen))}</div>
    </div>`
  }).join('')

  const ecoHtml = trend.go.map((e) => {
    const st = extractStars(e.what ?? '')
    const repo = e.title.match(/（([^）]*\/[^）]*)）|\(([^)]*\/[^)]*)\)/)
    const repoName = (repo?.[1] ?? repo?.[2] ?? '').trim()
    const badge = st.delta || st.stars
      ? `<span class="t-badge">${st.stars ? `★${st.stars}` : ''}${st.delta ? ` +${st.delta}` : ''}</span>`
      : ''
    return `<div class="t-row">
      <div class="t-h"><span class="t-name">${inlineFmt(e.act)}</span>` +
      (repoName ? `<span class="t-repo">${esc(repoName)}</span>` : '') + badge + `</div>` +
      (st.clean ? `<div class="t-w">${inlineFmt(truncSmart(st.clean, opt.whatLen))}</div>` : '') +
      (opt.showHow && e.how ? `<div class="t-how">${inlineFmt(truncSmart(e.how, opt.howLen))}</div>` : '') +
      `</div>`
  }).join('')

  const miniHtml = [...trend.watch.map((e) => ({ e, k: 'w', label: '观望' })),
                     ...trend.log.map((e) => ({ e, k: 'l', label: '记录' }))]
    .map(({ e, k, label }) => {
      const st = extractStars(e.desc ?? '')
      const star = st.delta ? `<span class="t-mini-star">+${st.delta}★</span>` : ''
      const body = st.clean ? `<span>— ${inlineFmt(truncSmart(st.clean, miniLen))}</span>` : ''
      return `<div class="t-mini"><span class="tag ${k}">${label}</span>` +
        `<b>${inlineFmt(truncSmart(deriveAct(e), opt.compactLen ?? opt.actLen))}</b>${body}${star}</div>`
    })
    .join('')

  if (!hotHtml && !ecoHtml && !miniHtml) return ''
  const windLine = model.wind
    ? `<div class="t-wind">${inlineFmt(clause(model.wind, opt.windLen ?? 72))}</div>`
    : ''

  return `<section class="board board-trend">
    <div class="board-head">
      <span class="board-no">②</span>
      <span class="board-title">GitHub 潮流</span>
      <span class="board-note">社区项目 · 按周星增</span>
    </div>
    ${windLine}
    ${hotHtml}
    ${ecoHtml || miniHtml ? `<div class="t-label">生态看点</div>${ecoHtml}${miniHtml}` : ''}
  </section>`
}

function renderHTML(opt) {
  const heroHtml = esc(truncSmart(model.hero, opt.heroLen))
  const total = model.go.length + model.watch.length + model.log.length
  const footR = `${total} 条条目 · ${HARNESS.length} 家 harness + 潮流榜`

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
    <section class="board board-harness">
      <div class="board-head">
        <span class="board-no">①</span>
        <span class="board-title">Harness 追踪</span>
        <span class="board-note">官方发布渠道 · 本期关键动作</span>
      </div>
      ${rows.map((b) => renderHarnessGroup(b, opt)).join('')}
    </section>
    ${renderTrend(opt)}
  </div>
  <div class="foot"><div>ai-scout 周度追踪 · 自动生成</div><div>${esc(footR)} · 完整出处见 Markdown</div></div>
</div></body></html>`
}

// ────────────────────────── 渲染 + 溢出阶梯降级 ──────────────────────────
const CSS = readFileSync(resolve(ROOT, 'scripts/brief-onepage.css'), 'utf8')
const SCALE = Math.min(3, Math.max(1, Number(process.env.BRIEF_SCALE) || 1))
const outPath = mdPath.replace(/\.md$/, '.png')
mkdirSync(dirname(outPath), { recursive: true })

// 降级阶梯：单行卡片的正文长度由 FIT_CARDS 按实测宽度裁，这里的 whatLen/howLen 只是"最多给多少"的上限
const STEPS = [
  { actLen: 22, whatLen: 110, howLen: 52, descLen: 34, ecoLen: 100, miniLen: 58, windLen: 92, heroLen: 200, maxGo: 2, showHow: true,  showSib: true,  hotCount: 5, fit: 1 },
  { actLen: 20, whatLen: 100, howLen: 48, descLen: 32, ecoLen: 92,  miniLen: 54, windLen: 84, heroLen: 190, maxGo: 2, showHow: true,  showSib: true,  hotCount: 5, fit: 0.98 },
  { actLen: 18, whatLen: 92,  howLen: 44, descLen: 29, ecoLen: 84,  miniLen: 48, windLen: 76, heroLen: 175, maxGo: 2, showHow: true,  showSib: true,  hotCount: 5, fit: 0.96 },
  { actLen: 17, whatLen: 84,  howLen: 40, descLen: 26, ecoLen: 74,  miniLen: 42, windLen: 68, heroLen: 155, maxGo: 2, showHow: true,  showSib: true,  hotCount: 4, fit: 0.94 },
  { actLen: 16, whatLen: 76,  howLen: 36, descLen: 23, ecoLen: 64,  miniLen: 36, windLen: 60, heroLen: 140, maxGo: 1, showHow: true,  showSib: true,  hotCount: 4, fit: 0.92 },
  { actLen: 15, whatLen: 66,  howLen: 0,  descLen: 21, ecoLen: 54,  miniLen: 30, windLen: 52, heroLen: 125, maxGo: 1, showHow: false, showSib: true,  hotCount: 3, fit: 0.90 },
  { actLen: 14, whatLen: 56,  howLen: 0,  descLen: 19, ecoLen: 46,  miniLen: 26, windLen: 46, heroLen: 112, maxGo: 1, showHow: false, showSib: false, hotCount: 3, fit: 0.88 },
  { actLen: 13, whatLen: 46,  howLen: 0,  descLen: 17, ecoLen: 40,  miniLen: 22, windLen: 40, heroLen: 100, maxGo: 1, showHow: false, showSib: false, hotCount: 3, fit: 0.85 },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: CANVAS_W, height: CANVAS_H }, deviceScaleFactor: SCALE })

let used = null
let fitStats = null
let over = 0
let fill = 0
const trace = []
for (const [i, opt] of STEPS.entries()) {
  await page.setContent(renderHTML(opt), { waitUntil: 'networkidle' })
  await page.evaluate((px) => { document.documentElement.style.fontSize = px + 'px' }, BASE_PX * opt.fit)
  fitStats = await page.evaluate(FIT_CARDS)     // 单行卡片：按实测宽度分配 + 裁到分句边界
  const h = await page.evaluate(() => {
    const body = document.querySelector('.body')
    const top = body.getBoundingClientRect().top
    const last = body.lastElementChild
    const contentH = last ? Math.round(last.getBoundingClientRect().bottom - top) : 0
    return { client: body.clientHeight, contentH }
  })
  // 用「最后元素底边」而非 scrollHeight：尾随 margin 会被算进 scrollHeight，误报溢出
  over = h.contentH - h.client
  fill = h.contentH / h.client
  trace.push({ 档: i + 1, fit: opt.fit, 内容高: h.contentH, 可用高: h.client, 占比: fill.toFixed(3), 溢出: over })
  if (over <= 0) { used = { opt, i, h }; break }
  if (i === STEPS.length - 1) used = { opt, i, h }
}
if (process.env.DEBUG) {
  console.table(trace)
  if (fitStats?.cards) console.table(fitStats.cards)
}

await page.locator('.card').screenshot({ path: outPath })
await browser.close()

const kb = (statSync(outPath).size / 1024).toFixed(0)
const lv = used.i + 1
if (over > 0) {
  console.warn(`⚠ 一页已到最紧档仍溢出 ${over}px（画布 ${CANVAS_W}×${CANVAS_H}）——内容已裁切，建议本期删条或改出 --full 长图`)
} else {
  console.log(`✓ ${basename(outPath)} (${kb} KB · ${CANVAS_W}×${CANVAS_H} · ${HARNESS.length} 家 + 潮流 · 降级档 ${lv}/${STEPS.length} · 填充 ${Math.round(fill * 100)}%)`)
}
process.exit(over > 0 ? 2 : 0)
