#!/usr/bin/env python3
"""Post-process the built .docx:
  - visible borders + shaded, bold, repeating header rows on every table
  - page break before each chapter (H1) and each Appendix (H2)
  - centred figures and figure captions
"""
import pathlib
import docx
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

DOCX = pathlib.Path(__file__).resolve().parent.parent / "EduMetric_Dissertation.docx"

BORDER_COLOR = "8C8C8C"
HEADER_FILL = "D9E1EC"   # light blue-grey, matches the chart palette


def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def set_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")        # 0.5pt
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), BORDER_COLOR)
        borders.append(el)
    # drop any existing tblBorders then add ours
    for old in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(old)
    tblPr.append(borders)


def mark_header_repeat(row):
    trPr = row._tr.get_or_add_trPr()
    th = OxmlElement("w:tblHeader")
    th.set(qn("w:val"), "true")
    trPr.append(th)


def first_row_is_header(table):
    cells = table.rows[0].cells
    return any(c.text.strip() for c in cells)


def style_tables(doc):
    n = 0
    for t in doc.tables:
        set_table_borders(t)
        # light cell padding
        if first_row_is_header(t):
            hdr = t.rows[0]
            mark_header_repeat(hdr)
            for c in hdr.cells:
                set_cell_shading(c, HEADER_FILL)
                for p in c.paragraphs:
                    for run in p.runs:
                        run.font.bold = True
        n += 1
    return n


def has_drawing(paragraph):
    return paragraph._p.findall(qn("w:r") + "/" + qn("w:drawing")) or \
        ".//" and paragraph._p.xpath(".//w:drawing")


def add_page_break_before(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pb = OxmlElement("w:pageBreakBefore")
    pPr.append(pb)


def style_layout(doc):
    figs, breaks = 0, 0
    first_h1 = True
    for p in doc.paragraphs:
        style = p.style.name
        txt = p.text.strip()
        # page breaks before chapters and appendices
        if style == "Heading 1":
            if first_h1:
                first_h1 = False
            else:
                add_page_break_before(p); breaks += 1
        elif style == "Heading 2" and txt.startswith("Appendix "):
            add_page_break_before(p); breaks += 1
        # centre figure images
        if p._p.xpath(".//w:drawing"):
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            figs += 1
        # centre + shrink figure captions
        elif txt.startswith("Figure ") and "—" in txt and len(txt) < 220:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.size = Pt(9.5)
                run.font.color.rgb = RGBColor(0x40, 0x40, 0x40)
    return figs, breaks


def main():
    doc = docx.Document(str(DOCX))
    nt = style_tables(doc)
    nf, nb = style_layout(doc)
    doc.save(str(DOCX))
    print(f"styled {nt} tables, centred {nf} figures, {nb} page breaks added")


if __name__ == "__main__":
    main()
