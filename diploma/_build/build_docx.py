#!/usr/bin/env python3
"""Transform the dissertation markdown to embed rendered figures, then build the
.docx via pandoc. Tables are post-styled by style_docx.py.

- Inline ```mermaid``` fences -> embedded PNG (kroki / matplotlib renders).
- Diagram figures with no inline fence (4.3, 4.4, 4.12-4.15) -> image inserted.
- Chart placeholders -> matplotlib PNG.
- Screenshot placeholders (3.4, J.1-J.10) -> clean 'to be inserted' note.
- Meta instruction blockquotes (🟦 / Draw in: bpmn.io ...) stripped.
"""
import re, subprocess, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
MD = ROOT / "EduMetric_Dissertation.md"
BUILD_MD = ROOT / "_build" / "EduMetric_Dissertation.build.md"
ASSETS = ROOT / "_assets"
OUT_DOCX = ROOT / "EduMetric_Dissertation.docx"
# BTEC L6 Unit 2 template — supplies the document design (Calibri body, blue
# headings with gold rule, A4 1" margins, BTEC running header + page-x-of-y
# footer). pandoc adopts its styles/theme/headers/footers/page setup.
REFERENCE_DOCX = pathlib.Path(
    "/Users/stohirov/Downloads/diplom_work/"
    "BTEC_L6_Unit2_Independent_Project_Template (2).docx"
)

WMAX, HMAX, WFLOOR = 6.3, 7.3, 2.2


def width_for(fig_id: str) -> float:
    p = ASSETS / f"figure-{fig_id}.png"
    if not p.exists():
        return 6.0
    w, h = Image.open(p).size
    ar = w / h
    return round(max(min(WMAX, HMAX * ar), WFLOOR), 2)


def img_md(fig_id: str, asset_name: str = None) -> str:
    name = asset_name or f"figure-{fig_id}.png"
    width = width_for(fig_id)
    # empty alt -> pandoc keeps it inline (no auto-caption); our bold caption follows
    return f"![](_assets/{name}){{width={width}in}}"


def main():
    text = MD.read_text(encoding="utf-8")

    # ---- 1. Replace inline ```mermaid fences with images -------------------
    fence_re = re.compile(r"```mermaid\n.*?\n```", re.DOTALL)
    fig_re = re.compile(r"Figure (\d+)\.(\d+)")

    def replace_fence(m):
        before = text[:m.start()]
        figs = fig_re.findall(before)
        fid = f"{figs[-1][0]}-{figs[-1][1]}" if figs else None
        if fid is None:
            return m.group(0)
        return img_md(fid)

    text = fence_re.sub(replace_fence, text)

    # Figure 2.1 has no bold caption in the source -> add one after its image
    text = text.replace(
        img_md("2-1"),
        img_md("2-1") +
        "\n\n**Figure 2.1 — Conceptual framework: from process intent to a "
        "validated student-analytics system.** *(Source: author.)*",
        1,
    )

    # ---- 2. Insert images before the bold caption (no-inline-fence figs) ---
    insert_before = {
        "4-3": "**Figure 4.3 — Component / module map",
        "4-4": "**Figure 4.4 — Deployment diagram",
        "4-15": "**Figure 4.15 — Security filter chain",
        "3-3": "**Figure 3.3 — Risk heat-map",
        "5-3": "**Figure 5.3 — Student growth profile",
    }
    for fid, anchor in insert_before.items():
        assert anchor in text, f"anchor not found for {fid}: {anchor}"
        text = text.replace(anchor, img_md(fid) + "\n\n" + anchor, 1)

    # ---- 3. Sequence diagrams 4.12-4.14 (single placeholder blockquote) ----
    seq_block_re = re.compile(
        r"> 🟦 \*\*\[DIAGRAMS — Figures 4\.12.*?\*\(Source: author\.\)\*",
        re.DOTALL,
    )
    seq_replacement = "\n\n".join([
        img_md("4-12") + "\n\n**Figure 4.12 — Login & JWT issuance (sequence).** *(Source: author.)*",
        img_md("4-13") + "\n\n**Figure 4.13 — Bulk attendance → synchronous recompute (sequence).** *(Source: author.)*",
        img_md("4-14") + "\n\n**Figure 4.14 — Student dashboard composition (sequence).** *(Source: author.)*",
    ])
    text, n = seq_block_re.subn(seq_replacement, text)
    assert n == 1, f"sequence block matched {n} times"

    # ---- 4. Line pass: clean placeholder blockquotes -----------------------
    lines = text.splitlines()
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith(">"):
            # collect blockquote group
            grp = []
            while i < len(lines) and (lines[i].startswith(">") or
                                      (grp and lines[i].strip() == "")):
                # stop if blank line ends the quote (peek)
                if lines[i].strip() == "":
                    break
                grp.append(lines[i])
                i += 1
            content = "\n".join(grp)
            if "📸" in content:
                # screenshot placeholder -> clean note with caption
                cap = re.search(r"Caption:\s*(Figure [\w.]+ — [^.*]+)", content)
                figm = re.search(r"Figure ([\w.]+)", content)
                if cap:
                    title = cap.group(1).strip()
                elif figm:
                    title = f"Figure {figm.group(1)}"
                else:
                    title = "Figure"
                out.append(
                    f"> **[{title}]** — screenshot to be inserted from the "
                    f"running EduMetric application.")
            elif "Pools:" in content:
                # BPMN descriptor: keep the Pools line, drop the 🟦 marker line
                # and the trailing 'Draw in: bpmn.io ...' instruction
                body = re.sub(r"> 🟦[^\n]*\n?", "", content)
                body = re.sub(r"\s*·?\s*\*\*Draw in:\*\*.*$", "", body,
                              flags=re.DOTALL)
                body = body.replace("> ", "").replace(">", "").strip()
                out.append(body)
            elif "🟦" in content:
                # pure meta placeholder (image + caption already present) -> drop
                pass
            else:
                out.extend(grp)  # genuine blockquote, keep
            continue
        out.append(line)
        i += 1
    text = "\n".join(out)

    # tidy: collapse 3+ blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    BUILD_MD.write_text(text, encoding="utf-8")
    print(f"build markdown: {BUILD_MD} ({len(text)} chars)")

    # ---- 5. pandoc -> docx -------------------------------------------------
    cmd = [
        "pandoc", str(BUILD_MD),
        "-o", str(OUT_DOCX),
        "--from", "markdown+pipe_tables+implicit_figures",
        "--resource-path", str(ROOT),
    ]
    if REFERENCE_DOCX.exists():
        cmd += ["--reference-doc", str(REFERENCE_DOCX)]
        print("reference-doc:", REFERENCE_DOCX.name)
    else:
        print("WARNING: reference-doc not found, using pandoc default:",
              REFERENCE_DOCX)
    print("running:", " ".join(cmd))
    subprocess.run(cmd, check=True, cwd=ROOT)
    print("pandoc done ->", OUT_DOCX)


if __name__ == "__main__":
    main()
