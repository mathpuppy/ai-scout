#!/usr/bin/env python3
"""fetch-harness.py — harness-digest 抓取预处理器（python3 标准库，零新依赖）

用法: python3 scripts/fetch-harness.py <窗口起点> <窗口终点> [输出文件]

职责：抓取 5 个 harness 官方发布渠道，按窗口（本地时区，含端点）过滤，按各渠道规则过滤
（Codex 只留稳定版 prerelease=false && draft=false；DeepSeek 只剔 draft、prerelease 照收；
Hermes 剔 draft），正文截断（release 800 字、CHANGELOG 版本节 400 字），输出紧凑 Markdown
摘要到 stdout（给第三参数则同时落盘该文件）。

缺口处理：渠道不可达重试一次；HTTP 403/429 等 60 秒重试一次；仍失败如实写缺口，不换数据源。
GH_TOKEN 存在时用于 api.github.com 请求（提升额度），否则匿名（60 次/小时）。

已知边界：Claude Code 的 CHANGELOG 版本节无日期、其 commits 消息不带版本号（"chore: Update
CHANGELOG.md"），日期归因保留模型就近近似（摘要给 commits 对照表）；pi 版本头自带日期，
窗口过滤确定化。Codex releases 端点响应大（assets 元数据每条约 340KB，per_page=15 即 6MB+）
且偶发 504/断流：per_page 取 15 并宽捕获网络异常走重试/缺口。CHANGELOG 文件大（pi 693KB、
Claude Code 1.15MB），用 Range 只取头部 300KB（最新版本节在顶部，覆盖远超 12 节），
断流时用已读到的部分数据继续解析。
"""

import http.client
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime

API = "https://api.github.com"
HEADERS = {"User-Agent": "ai-scout-fetch-harness", "Accept": "application/vnd.github+json"}

RELEASE_CLIP = 800
CHANGELOG_CLIP = 400
CHANGELOG_MAX_SECTIONS = 12
CHANGELOG_HEAD_BYTES = 300_000


def http_get(url, api=False, max_bytes=None, partial_ok=False):
    """返回 (status, text, bytes)。max_bytes：Range 只取头部 N 字节；partial_ok：断流时续传拼接。"""
    headers = dict(HEADERS)
    token = os.environ.get("GH_TOKEN")
    if api and token:
        headers["Authorization"] = "Bearer " + token
    buf = b""
    for attempt in range(3):
        req_headers = dict(headers)
        if max_bytes:
            req_headers["Range"] = "bytes=%d-%d" % (len(buf), max_bytes - 1)
        try:
            with urllib.request.urlopen(
                urllib.request.Request(url, headers=req_headers), timeout=60
            ) as r:
                data = buf + r.read()
                return r.status, data.decode("utf-8", "replace"), len(data)
        except urllib.error.HTTPError as e:
            if e.code in (403, 429) and attempt == 0:
                time.sleep(60)
                continue
            return e.code, "", 0
        except http.client.IncompleteRead as e:
            if partial_ok and e.partial:
                buf += e.partial
                if len(buf) >= max_bytes or attempt == 2:
                    return 206, buf.decode("utf-8", "replace"), len(buf)
                time.sleep(2)
                continue
            if attempt < 2:
                time.sleep((3, 8)[attempt])
                continue
            return -1, "", 0
        except Exception:
            # URLError / 断流 / 超时等：退避重试，仍失败如实记缺口
            if attempt < 2:
                time.sleep((3, 8)[attempt])
                continue
            return -1, "", 0
    return -1, "", 0


def to_local_date(iso):
    s = iso.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.now().astimezone().tzinfo)
    return dt.astimezone().date()


def clip(text, limit):
    if not text:
        return "（无正文）"
    text = text.replace("\r", "").strip()
    if len(text) <= limit:
        return text
    return text[:limit] + f"\n…（已截断，原文 {len(text)} 字）"


def fetch_releases(repo, per_page, keep, gaps):
    code, raw, _ = http_get(f"{API}/repos/{repo}/releases?per_page={per_page}", api=True)
    if code != 200:
        gaps.append(f"{repo} releases 抓取失败（HTTP {code}）")
        return []
    try:
        rels = json.loads(raw)
    except json.JSONDecodeError:
        gaps.append(f"{repo} releases 响应非 JSON（HTTP {code}）")
        return []
    return [r for r in rels if keep(r)]


def releases_section(name, repo, per_page, keep, start, end, gaps):
    rels = fetch_releases(repo, per_page, keep, gaps)
    in_window = []
    skipped = 0
    for r in rels:
        d = to_local_date(r.get("published_at") or "")
        if d is None or not (start <= d <= end):
            skipped += 1
            continue
        in_window.append((r.get("tag_name") or "?", d, r.get("html_url") or "", r.get("body") or ""))
    out = [f"## {name}（{repo} · Releases API）", f"响应 {len(rels)} 条 → 窗口内 {len(in_window)} 条（窗口外 {skipped} 条）"]
    if not in_window:
        newest = rels[0] if rels else None
        if newest:
            d = to_local_date(newest.get("published_at") or "")
            out.append(f"窗口内无版本；窗口外最近一条：{newest.get('tag_name')} · {d}")
    for tag, d, url, body in in_window:
        out.append(f"\n### {tag} · {d}\n{clip(body, RELEASE_CLIP)}\nURL: {url}")
    return "\n".join(out)


VERSION_HEAD = re.compile(r"^##\s+(.+?)\s*$")
DATED_VERSION = re.compile(r"^\[?(\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.-]+)?)\]?(?:\s*[-–]\s*(\d{4}-\d{2}-\d{2}))?$")


def changelog_sections(name, repo, path, dated, start, end, gaps):
    """dated=True：版本头自带日期（pi），按窗口确定化过滤；False：无日期（Claude Code），保留前 N 节 + commits 表。"""
    code, raw, got = http_get(
        f"https://raw.githubusercontent.com/{repo}/main/{path}",
        max_bytes=CHANGELOG_HEAD_BYTES, partial_ok=True,
    )
    if code not in (200, 206):
        gaps.append(f"{repo} {path} 抓取失败（HTTP {code}）")
        return ""
    lines = raw.split("\n")
    sections = []  # (title, date_str_or_None, body_lines)
    current = None
    for line in lines:
        m = VERSION_HEAD.match(line)
        if m:
            if current:
                sections.append(current)
            title = m.group(1).strip()
            if title == "[Unreleased]" or title == "Unreleased":
                current = ("Unreleased", None, [])
                continue
            dm = DATED_VERSION.match(title)
            if dm:
                current = (dm.group(1), dm.group(2), [])
            else:
                current = (title, None, [])
        elif current:
            current[2].append(line)
    if current:
        sections.append(current)

    out = [f"## {name}（{repo} · {path}）", f"仅读取文件头部 {got // 1024}KB（Range 请求），更早版本节可能缺失"]
    if dated:
        kept = []
        for title, d, body in sections:
            if d:
                try:
                    if datetime.strptime(d, "%Y-%m-%d").date() < start:
                        break  # 版本头倒序，窗口外即停
                except ValueError:
                    pass
            kept.append((title, d, body))
        out.append(f"解析到 {len(sections)} 个版本节 · 窗口内 {len(kept)} 个（版本头带日期，过滤确定化）")
        for title, d, body in kept[:CHANGELOG_MAX_SECTIONS]:
            date_str = d or "视作窗内"
            out.append(f"\n### {title} · {date_str}\n{clip('\n'.join(body).strip(), CHANGELOG_CLIP)}")
    else:
        kept = sections[:CHANGELOG_MAX_SECTIONS]
        out.append(f"版本节无日期，保留前 {len(kept)} 节 + commits 对照表（日期归因就近近似）")
        for i, (title, d, body) in enumerate(kept):
            out.append(f"\n### {title} · 日期≈commits 表第 {i + 1} 行\n{clip('\n'.join(body).strip(), CHANGELOG_CLIP)}")
        ccode, craw, _ = http_get(
            f"{API}/repos/{repo}/commits?path={path}&per_page=40", api=True
        )
        out.append("\n版本↔日期对照（该文件 commits，近 40 条，第 i 节 ≈ 第 i 行）：")
        if ccode != 200:
            out.append(f"commits 抓取失败（HTTP {ccode}），日期归因靠版本头正文自行判断")
        else:
            try:
                commits = json.loads(craw)
            except json.JSONDecodeError:
                commits = []
            for c in commits:
                d = to_local_date(c.get("commit", {}).get("committer", {}).get("date") or "")
                out.append(f"- {c.get('sha', '')[:7]} {d}")
    return "\n".join(out)


def main():
    if len(sys.argv) < 3 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0 if len(sys.argv) >= 3 else 2
    try:
        start = datetime.strptime(sys.argv[1], "%Y-%m-%d").date()
        end = datetime.strptime(sys.argv[2], "%Y-%m-%d").date()
    except ValueError:
        print("日期格式错误（应为 YYYY-MM-DD）", file=sys.stderr)
        return 2
    if start > end:
        print("窗口起点晚于终点", file=sys.stderr)
        return 2

    gaps = []
    parts = [
        f"# Harness 抓取摘要 · 窗口 {start} ～ {end}（本地时区）",
        f"> scripts/fetch-harness.py 生成于 {datetime.now():%Y-%m-%d %H:%M} · 正文已截断（release {RELEASE_CLIP} 字 / CHANGELOG {CHANGELOG_CLIP} 字）· 需全文按兜底 curl 补拉",
        "",
        releases_section("Hermes Agent", "NousResearch/hermes-agent", 30,
                         lambda r: not r.get("draft"), start, end, gaps),
        "",
        releases_section("OpenAI Codex", "openai/codex", 15,
                         lambda r: not r.get("prerelease") and not r.get("draft"), start, end, gaps),
        "",
        releases_section("DeepSeek Harness", "deepseek-ai/deepseek-harness", 30,
                         lambda r: not r.get("draft"), start, end, gaps),
        "",
        changelog_sections("pi", "earendil-works/pi", "packages/coding-agent/CHANGELOG.md",
                           dated=True, start=start, end=end, gaps=gaps),
        "",
        changelog_sections("Claude Code", "anthropics/claude-code", "CHANGELOG.md",
                           dated=False, start=start, end=end, gaps=gaps),
        "",
    ]
    if gaps:
        parts.append("## 缺口\n" + "\n".join(f"- {g}" for g in gaps))
    else:
        parts.append("## 缺口\n（无，五个渠道全部抓取成功）")

    digest = "\n".join(parts)
    print(digest)
    if len(sys.argv) >= 4 and sys.argv[3]:
        with open(sys.argv[3], "w", encoding="utf-8") as f:
            f.write(digest + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
