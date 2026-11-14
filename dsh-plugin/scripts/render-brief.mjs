#!/usr/bin/env node
// render-brief.mjs — 把 agent-tech-brief-<date>.md 渲染成「全量长图」（卡片周刊风，滚动全长）
// 用法: node render-brief.mjs reports/2026-11-14/agent-tech-brief-2026-11-14.md
// 产出: 同目录 agent-tech-brief-<date>-full.png
// 说明: 默认交付物已改为一页信息图（render-onepage.mjs，1080×1440 定比）。本脚本保留为
//       「需要全量细节」的备用长图，需要时显式调用；两者共用同一个 brief.md，互不影响。
// 依赖: playwright（npx 解析全局安装即可）+ 已下载的 chromium
// 结构契约见 tracker-merge 技能④：四个 emoji 分组标题按关键词分色；「## 出处」节不画入图内。
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mdPath = resolve(process.argv[2] ?? '')
if (!mdPath.endsWith('.md')) {
  console.error('用法: node render-brief.mjs <brief.md 路径>')
  process.exit(1)
}
const md = readFileSync(mdPath, 'utf8')

// ── 极简 markdown → HTML（周报结构固定，够用且零依赖）──
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/〔(.+?)〕/g, '<span class="src">$1</span>')

const KEY_SPANS = [['是什么', 'what'], ['怎么用', 'how'], ['本周风向', 'wind']]
const keySpan = (s) => {
  for (const [label, cls] of KEY_SPANS) {
    if (s.startsWith(label + '：')) {
      return `<span class="key k-${cls}">${label}</span>：` + s.slice(label.length + 1)
    }
  }
  return s
}

const SEC_THEMES = [
  [/值得看/, 'go'],
  [/值得观望/, 'watch'],
  [/仅记录/, 'log'],
  [/本周热门/, 'hot'],
  [/其他动态/, 'plain'],
]

const lines = md.split('\n')
const body = []
let theme = ''
let i = 0
while (i < lines.length) {
  const line = lines[i].trimEnd()
  if (line.startsWith('## ')) {
    const text = line.replace(/^##\s*/, '')
    if (/^出处/.test(text)) break // 出处附录不进长图
    theme = SEC_THEMES.find(([re]) => re.test(text))?.[1] ?? ''
    body.push(`<h2 class="sec sec-${theme}">${inline(text)}</h2>`)
  } else if (line.startsWith('### ')) {
    const items = []
    while (i + 1 < lines.length && /^\s*[-*]\s+/.test(lines[i + 1].trimEnd())) {
      i++
      items.push(keySpan(inline(lines[i].trimEnd().replace(/^\s*[-*]\s+/, ''))))
    }
    body.push(
      `<div class="entry entry-${theme}"><h3>${inline(line.slice(4).trim())}</h3>` +
        (items.length ? `<ul class="eul">${items.map((t) => `<li>${t}</li>`).join('')}</ul>` : '') +
        '</div>'
    )
  } else if (/^\s*[-*]\s+/.test(line)) {
    body.push(
      `<ul class="ul-${theme}"><li>${keySpan(inline(line.replace(/^\s*[-*]\s+/, '')))}</li></ul>`
    )
  } else if (line.startsWith('# ')) {
    body.push(`<h1 class="title">${inline(line.replace(/^#\s*/, ''))}</h1>`)
  } else if (line.trim() !== '') {
    body.push(`<p class="para">${inline(line)}</p>`)
  }
  i++
}

const css = readFileSync(resolve(ROOT, 'scripts/brief-card.css'), 'utf8')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>${css}</style></head><body><div class="card"><div class="topbar"></div>${body.join('\n')}
<div class="foot">ai-scout 周度追踪 · 自动生成 · 完整出处见报告 Markdown</div></div></body></html>`

// ── 无头浏览器截长图 ──
// 输出倍率：默认 1x（750px 宽，体积小，企业 IM 可直接预览）；FLASH_SCALE=2 出 1500px 高清档
const SCALE = Math.min(4, Math.max(1, Number(process.env.FLASH_SCALE) || 1))
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 750, height: 1000 },
  deviceScaleFactor: SCALE,
})
await page.setContent(html, { waitUntil: 'networkidle' })
const card = page.locator('.card')
const outPath = mdPath.replace(/\.md$/, '-full.png')
mkdirSync(dirname(outPath), { recursive: true })
await card.screenshot({ path: outPath })
await browser.close()

const kb = (readFileSync(outPath).length / 1024).toFixed(0)
console.log(`✓ ${basename(outPath)} (${kb} KB)`)
