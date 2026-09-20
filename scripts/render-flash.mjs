#!/usr/bin/env node
// render-flash.mjs — 把 agent-tech-flash-<date>.md 渲染成微信长图 PNG
// 用法: node scripts/render-flash.mjs reports/2026-09-20/agent-tech-flash-2026-09-20.md
// 依赖: playwright（npx 解析全局安装即可）+ 已下载的 chromium
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mdPath = resolve(process.argv[2] ?? '')
if (!mdPath.endsWith('.md')) {
  console.error('用法: node scripts/render-flash.mjs <flash.md 路径>')
  process.exit(1)
}
const md = readFileSync(mdPath, 'utf8')

// ── 极简 markdown → HTML（flash 结构固定：标题/粗体/列表/分组行，够用且零依赖）──
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')

const lines = md.split('\n')
const body = []
let inList = false
let para = []
let pCount = 0
const NUM_RE = /^\d+[.、)]\s/                       // 编号条目导语：1. / 2、/ 3)
const EMOJI_RE = /^[\p{Extended_Pictographic}️‍]/u  // emoji 开头的短行视为分组标题
const flushPara = (cls = '') => {
  if (!para.length) return
  pCount++
  let klass = cls
  if (!klass) {
    if (pCount === 1) klass = 'flash-title'          // 文档第一段 = 大标题
    else if (pCount === 2) klass = 'intro'           // 第二段 = 导语
    else if (para.length === 1 && EMOJI_RE.test(para[0]) && para[0].length <= 40) klass = 'section'
  }
  let html = para.map(inline).join('<br>')
  if (klass === 'num') html = html.replace(/^(\d+)([.、)])/, '<span class="n">$1$2</span>')
  body.push(`<p${klass ? ` class="${klass}"` : ''}>${html}</p>`)
  para = []
}
for (const raw of lines) {
  const line = raw.trimEnd()
  if (/^\s*[-*]\s+/.test(line)) {
    flushPara()
    if (!inList) { body.push('<ul>'); inList = true }
    body.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
  } else if (line === '') {
    if (inList) { body.push('</ul>'); inList = false }
    flushPara()
  } else if (line.startsWith('#')) {
    flushPara(); if (inList) { body.push('</ul>'); inList = false }
    const level = line.match(/^#+/)[0].length
    body.push(`<h${level}>${inline(line.replace(/^#+\s*/, ''))}</h${level}>`)
  } else if (NUM_RE.test(line)) {
    if (inList) { body.push('</ul>'); inList = false }
    flushPara(); para.push(line); flushPara('num')   // 编号导语独立成段，不与分组标题合并
  } else {
    if (inList) { body.push('</ul>'); inList = false }
    para.push(line)
  }
}
if (inList) body.push('</ul>')
flushPara()
// 最后一个无类名的段落视为页脚（出处说明）
for (let i = body.length - 1; i >= 0; i--) {
  if (body[i].startsWith('<p ')) break
  if (body[i].startsWith('<p>')) { body[i] = body[i].replace('<p>', '<p class="foot">'); break }
}

const css = readFileSync(resolve(ROOT, 'scripts/flash-card.css'), 'utf8')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>${css}</style></head><body><div class="card"><div class="topbar"></div>${body.join('\n')}</div></body></html>`

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
const outPath = mdPath.replace(/\.md$/, '.png')
mkdirSync(dirname(outPath), { recursive: true })
await card.screenshot({ path: outPath })
await browser.close()

const kb = (readFileSync(outPath).length / 1024).toFixed(0)
console.log(`✓ ${basename(outPath)} (${kb} KB)`)
