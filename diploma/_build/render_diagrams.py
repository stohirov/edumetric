#!/usr/bin/env python3
"""Render Mermaid diagrams (kroki.io) to PNG for the dissertation .docx.

Diagram-type figures only. Chart figures (3.2, 3.3, 4.16, 4.17, 5.1-5.4) are
produced by render_charts.py with matplotlib (better quality, matches reference).
"""
import re, sys, time, urllib.request, urllib.error, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
MD = ROOT / "EduMetric_Dissertation.md"
DIAG = ROOT / "_diagrams"
OUT = ROOT / "_assets"
OUT.mkdir(exist_ok=True)

KROKI = "https://kroki.io/mermaid/png"

# Figure ids that are CHARTS -> handled by matplotlib, skip kroki for these
CHART_IDS = {"3-2", "3-3", "4-16", "4-17", "5-1", "5-2", "5-3", "5-4"}


def kroki_png(src: str) -> bytes:
    data = src.encode("utf-8")
    for attempt in range(4):
        try:
            req = urllib.request.Request(
                KROKI, data=data,
                headers={
                    "Content-Type": "text/plain",
                    "Accept": "image/png",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                                  "Chrome/124.0 Safari/537.36",
                },
                method="POST")
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:300]
            print(f"   HTTP {e.code}: {body}", file=sys.stderr)
            if e.code in (400, 422):
                raise
        except Exception as e:
            print(f"   attempt {attempt+1} failed: {e}", file=sys.stderr)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError("kroki render failed")


def extract_inline_blocks(md_text: str):
    """Return list of (fig_id, mermaid_src) for inline ```mermaid blocks,
    fig_id derived from the nearest preceding 'Figure X.Y' marker."""
    lines = md_text.splitlines()
    blocks = []
    i = 0
    last_fig = None
    fig_re = re.compile(r"Figure (\d+)\.(\d+)")
    while i < len(lines):
        m = fig_re.search(lines[i])
        if m:
            last_fig = f"{m.group(1)}-{m.group(2)}"
        if lines[i].strip().startswith("```mermaid"):
            j = i + 1
            buf = []
            while j < len(lines) and not lines[j].strip().startswith("```"):
                buf.append(lines[j]); j += 1
            blocks.append((last_fig, "\n".join(buf)))
            i = j + 1
            continue
        i += 1
    return blocks


def main():
    md = MD.read_text(encoding="utf-8")
    inline = extract_inline_blocks(md)
    print(f"Found {len(inline)} inline mermaid blocks")

    jobs = []  # (fig_id, source, outfile)
    for fig_id, src in inline:
        if fig_id in CHART_IDS:
            continue  # matplotlib handles charts
        jobs.append((fig_id, src, OUT / f"figure-{fig_id}.png"))

    # Standalone diagram files (no inline mermaid in the md body)
    standalone = {
        "4-3": "fig-4-3-component-map.mmd",
        "4-4": "fig-4-4-deployment.mmd",
        "4-12": "fig-4-12-seq-login.mmd",
        "4-13": "fig-4-13-seq-attendance-recompute.mmd",
        "4-14": "fig-4-14-seq-dashboard.mmd",
        "4-15": "fig-4-15-security-filter-chain.mmd",
    }
    for fig_id, fname in standalone.items():
        src = (DIAG / fname).read_text(encoding="utf-8")
        jobs.append((fig_id, src, OUT / f"figure-{fig_id}.png"))

    ok, fail = [], []
    for fig_id, src, outfile in jobs:
        print(f"-> Figure {fig_id} ...", end=" ", flush=True)
        try:
            png = kroki_png(src)
            outfile.write_bytes(png)
            print(f"OK ({len(png)//1024} KB)")
            ok.append(fig_id)
        except Exception as e:
            print(f"FAIL: {e}")
            fail.append(fig_id)
        time.sleep(0.4)

    print(f"\nDONE: {len(ok)} ok, {len(fail)} failed")
    if fail:
        print("FAILED:", ", ".join(fail))


if __name__ == "__main__":
    main()
