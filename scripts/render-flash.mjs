#!/usr/bin/env node
// render-flash.mjs — 把 agent-tech-flash-<date>.md 渲染成微信长图 PNG
// 用法: node scripts/render-flash.mjs reports/agent-tech-flash-2026-09-20.md
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
const flushPara = () => {
  if (para.length) { body.push(`<p>${para.map(inline).join('<br>')}</p>`); para = [] }
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
  } else {
    if (inList) { body.push('</ul>'); inList = false }
    para.push(line)
  }
}
if (inList) body.push('</ul>')
flushPara()

const css = readFileSync(resolve(ROOT, 'scripts/flash-card.css'), 'utf8')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>${css}</style></head><body><div class="card">${body.join('\n')}</div></body></html>`

// ── 无头浏览器截长图 ──
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 750, height: 1000 },
  deviceScaleFactor: 2, // 2x 产出 1500px 宽，规避 IM 压缩模糊
})
await page.setContent(html, { waitUntil: 'networkidle' })
const card = page.locator('.card')
const outPath = mdPath.replace(/\.md$/, '.png')
mkdirSync(dirname(outPath), { recursive: true })
await card.screenshot({ path: outPath })
await browser.close()

const kb = (readFileSync(outPath).length / 1024).toFixed(0)
console.log(`✓ ${basename(outPath)} (${kb} KB)`)
