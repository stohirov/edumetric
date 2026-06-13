#!/usr/bin/env python3
"""Render the dissertation's CHART figures with matplotlib.

Clean, print-friendly grayscale style matching the reference document
(Asadbek Abdinazarov Independent Project.docx): white background, thin axes,
muted fills, captions carried by the .docx (not baked into the image).

Figures: 3.2 Gantt, 3.3 Risk heat-map, 4.16 complexity, 4.17 coverage,
5.1 RAG objectives, 5.2 test outcomes, 5.3 growth radar, 5.4 growth trend.
"""
import pathlib
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import datetime as dt

OUT = pathlib.Path(__file__).resolve().parent.parent / "_assets"
OUT.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": "#333333",
    "axes.linewidth": 0.8,
    "axes.grid": True,
    "grid.color": "#dddddd",
    "grid.linewidth": 0.6,
    "figure.dpi": 200,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
    "savefig.facecolor": "white",
})

INK = "#2f2f2f"
FILL = "#9aa7b4"      # muted blue-grey bars
FILL2 = "#c7cdd4"     # lighter grey
ACCENT = "#5a6b7b"    # darker grey-blue


def save(fig, name):
    p = OUT / name
    fig.savefig(p, facecolor="white")
    plt.close(fig)
    print(f"  wrote {name} ({p.stat().st_size//1024} KB)")


# ---------------------------------------------------------------- 3.2 Gantt
def gantt():
    # (phase, task, start_week, duration_weeks, is_milestone)
    tasks = [
        ("1", "Proposal & Approval", 1, 2, False),
        ("1", "Identify & Review Sources", 2, 3, False),
        ("1", "Literature Review — Draft Ch2", 3, 4, False),
        ("1", "Finalise Literature Review", 6, 0, True),
        ("2", "Research Philosophy & Approach", 4, 2, False),
        ("2", "Write Ch3 — Methodology", 5, 2, False),
        ("2", "Risk Register & Gantt", 5, 1, False),
        ("2", "Ethics Documentation", 5, 1, False),
        ("3", "Model P1 Auth & P2 Attendance", 7, 1, False),
        ("3", "Model P3 Eval & P4 Analytics", 8, 1, False),
        ("3", "Model P5 At-Risk & P6 Admin", 9, 1, False),
        ("3", "Process Modelling Complete", 10, 0, True),
        ("4", "C4 + Module Diagrams", 10, 2, False),
        ("4", "ERD & Schema", 11, 2, False),
        ("4", "API Endpoint Mapping", 12, 2, False),
        ("4", "Traceability Matrix (6)", 11, 3, False),
        ("4", "Architecture & Design Complete", 14, 0, True),
        ("5", "Write Ch4 — Analysis", 14, 3, False),
        ("5", "Write Ch5 — Discussion", 16, 3, False),
        ("5", "Write Ch6 — Conclusion", 18, 2, False),
        ("5", "Write Ch7 — Reflection", 19, 2, False),
        ("5", "Complete Ch1 — Introduction", 20, 1, False),
        ("5", "First Full Draft Complete", 21, 0, True),
        ("6", "Supervisor Review & Feedback", 21, 2, False),
        ("6", "Revision & Proofreading", 22, 2, False),
        ("6", "Appendices Finalised (A–K)", 22, 2, False),
        ("6", "Final Submission", 24, 0, True),
    ]
    phase_shade = {"1": "#b9c2cb", "2": "#a7b3bf", "3": "#94a3b2",
                   "4": "#8493a3", "5": "#9aa7b4", "6": "#aab4bf"}
    fig, ax = plt.subplots(figsize=(11, 7.5))
    y = len(tasks)
    yticks, ylabels = [], []
    for phase, name, start, dur, ms in tasks:
        y -= 1
        yticks.append(y); ylabels.append(name)
        if ms:
            ax.plot(start, y, marker="D", color=INK, markersize=9, zorder=5)
            ax.annotate("◆", (start, y))
        else:
            ax.barh(y, dur, left=start, height=0.6,
                    color=phase_shade[phase], edgecolor=ACCENT, linewidth=0.6, zorder=3)
            ax.text(start + dur / 2, y, f"{dur}w", va="center", ha="center",
                    fontsize=7.5, color="#1f1f1f")
    ax.set_yticks(yticks); ax.set_yticklabels(ylabels, fontsize=8.5)
    ax.set_xlim(0.5, 25.5)
    ax.set_xticks(range(1, 25, 1))
    ax.set_xlabel("Project week")
    ax.set_axisbelow(True)
    ax.grid(axis="y", visible=False)
    legend = [Patch(facecolor=phase_shade[p], edgecolor=ACCENT,
                    label=f"Phase {p}") for p in sorted(phase_shade)]
    legend.append(plt.Line2D([0], [0], marker="D", color="w",
                  markerfacecolor=INK, markersize=9, label="Milestone"))
    ax.legend(handles=legend, ncol=7, loc="upper center",
              bbox_to_anchor=(0.5, 1.06), frameon=False, fontsize=8.5)
    save(fig, "figure-3-2.png")


# ----------------------------------------------------------- 3.3 Risk heat-map
def risk_heatmap():
    # cells[impact][prob] = list of risk ids ; impact 1..5 (rows), prob 1..5 (cols)
    placements = {
        (5, 3): ["R03"],
        (4, 2): ["R06", "R07"], (4, 3): ["R02", "R04", "R10"],
        (3, 2): ["R01", "R05", "R08", "R09"],
    }
    fig, ax = plt.subplots(figsize=(8.5, 6.2))
    # background severity shading: score = P*I
    for p in range(1, 6):
        for i in range(1, 6):
            score = p * i
            if score >= 15:
                c = "#9e9e9e"
            elif score >= 9:
                c = "#c4c4c4"
            elif score >= 4:
                c = "#e2e2e2"
            else:
                c = "#f2f2f2"
            ax.add_patch(plt.Rectangle((p - 0.5, i - 0.5), 1, 1,
                         facecolor=c, edgecolor="white", linewidth=2))
    for (i, p), ids in placements.items():
        ax.text(p, i, "\n".join(ids), ha="center", va="center",
                fontsize=9, fontweight="bold", color="#1a1a1a")
    ax.set_xlim(0.5, 5.5); ax.set_ylim(0.5, 5.5)
    ax.set_xticks(range(1, 6)); ax.set_yticks(range(1, 6))
    ax.set_xlabel("Probability  (1 = rare  →  5 = almost certain)")
    ax.set_ylabel("Impact  (1 = negligible  →  5 = severe)")
    ax.set_aspect("equal")
    ax.grid(False)
    # legend
    sev = [("Low (1–3)", "#f2f2f2"), ("Moderate (4–8)", "#e2e2e2"),
           ("High (9–14)", "#c4c4c4"), ("Critical (15–25)", "#9e9e9e")]
    handles = [Patch(facecolor=c, edgecolor="#999", label=l) for l, c in sev]
    ax.legend(handles=handles, loc="upper left", bbox_to_anchor=(1.02, 1.0),
              frameon=False, fontsize=9, title="Severity")
    save(fig, "figure-3-3.png")


# --------------------------------------------------- 4.16 complexity (stacked)
def complexity():
    procs = ["P1\nAuth", "P2\nAttend", "P3\nEval", "P4\nAnalytics", "P5\nAt-Risk", "P6\nAdmin"]
    activities = [5, 6, 5, 6, 6, 6]
    gateways = [1, 3, 2, 2, 3, 2]
    exceptions = [1, 3, 2, 1, 1, 2]
    x = np.arange(len(procs))
    fig, ax = plt.subplots(figsize=(9, 5.2))
    b1 = ax.bar(x, activities, color="#8493a3", edgecolor=ACCENT, label="Activities")
    b2 = ax.bar(x, gateways, bottom=activities, color="#b3bcc6", edgecolor=ACCENT, label="Gateways")
    bottom2 = np.array(activities) + np.array(gateways)
    b3 = ax.bar(x, exceptions, bottom=bottom2, color="#d7dce1", edgecolor=ACCENT, label="Exception paths")
    totals = np.array(activities) + np.array(gateways) + np.array(exceptions)
    for xi, t in zip(x, totals):
        ax.text(xi, t + 0.2, str(int(t)), ha="center", fontsize=10, fontweight="bold")
    ax.set_xticks(x); ax.set_xticklabels(procs)
    ax.set_ylabel("BPMN element count")
    ax.set_ylim(0, 14)
    ax.grid(axis="x", visible=False)
    ax.set_axisbelow(True)
    ax.legend(frameon=False, ncol=3, loc="upper center", bbox_to_anchor=(0.5, 1.10))
    save(fig, "figure-4-16.png")


# ----------------------------------------------------- 4.17 coverage (stacked)
def coverage():
    procs = ["P1\nAuth", "P2\nAttend", "P3\nEval", "P4\nAnalytics", "P5\nAt-Risk", "P6\nAdmin"]
    modules = [3, 3, 6, 3, 3, 3]
    entities = [2, 3, 6, 2, 4, 5]
    endpoints = [4, 3, 4, 3, 4, 4]
    x = np.arange(len(procs))
    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.bar(x, modules, color="#8493a3", edgecolor=ACCENT, label="Modules")
    ax.bar(x, entities, bottom=modules, color="#b3bcc6", edgecolor=ACCENT, label="Entities")
    bottom2 = np.array(modules) + np.array(entities)
    ax.bar(x, endpoints, bottom=bottom2, color="#d7dce1", edgecolor=ACCENT, label="Endpoints")
    totals = np.array(modules) + np.array(entities) + np.array(endpoints)
    for xi, t in zip(x, totals):
        ax.text(xi, t + 0.25, str(int(t)), ha="center", fontsize=10, fontweight="bold")
    ax.set_xticks(x); ax.set_xticklabels(procs)
    ax.set_ylabel("Artefact count")
    ax.set_ylim(0, 20)
    ax.grid(axis="x", visible=False)
    ax.set_axisbelow(True)
    ax.legend(frameon=False, ncol=3, loc="upper center", bbox_to_anchor=(0.5, 1.10))
    save(fig, "figure-4-17.png")


# ------------------------------------------------------- 5.1 RAG objectives
def rag():
    objs = ["Obj 1\nLiterature", "Obj 2\nRequirements", "Obj 3\nDesign",
            "Obj 4\nDevelop", "Obj 5\nEvaluate"]
    pct = [100, 100, 100, 100, 95]
    fig, ax = plt.subplots(figsize=(8.5, 4.8))
    colors = ["#7e8c9a" if p == 100 else "#b3bcc6" for p in pct]
    bars = ax.bar(objs, pct, color=colors, edgecolor=ACCENT, width=0.6)
    for b, p in zip(bars, pct):
        ax.text(b.get_x() + b.get_width() / 2, p + 1.5, f"{p}%",
                ha="center", fontsize=10, fontweight="bold")
    ax.axhline(100, color="#cfcfcf", linewidth=0.8, linestyle="--")
    ax.set_ylim(0, 112)
    ax.set_ylabel("Percent complete")
    ax.set_yticks(range(0, 101, 20))
    ax.grid(axis="x", visible=False)
    ax.set_axisbelow(True)
    save(fig, "figure-5-1.png")


# ----------------------------------------------------- 5.2 test outcomes
def test_outcomes():
    procs = ["AUTH", "ATT", "EVAL", "ANA", "RISK", "ADMIN"]
    cases = [6, 5, 5, 4, 5, 5]
    fig, ax = plt.subplots(figsize=(8.5, 4.8))
    bars = ax.bar(procs, cases, color="#8493a3", edgecolor=ACCENT, width=0.6)
    for b, c in zip(bars, cases):
        ax.text(b.get_x() + b.get_width() / 2, c + 0.08, str(c),
                ha="center", fontsize=10, fontweight="bold")
    ax.set_ylim(0, 6.6)
    ax.set_ylabel("Test cases (all passing)")
    ax.set_yticks(range(0, 7))
    ax.grid(axis="x", visible=False)
    ax.set_axisbelow(True)
    ax.text(0.99, 0.96, f"Total: {sum(cases)} cases · 100% documented pass",
            transform=ax.transAxes, ha="right", va="top", fontsize=9,
            color="#444", style="italic")
    save(fig, "figure-5-2.png")


# ------------------------------------------------------------- 5.3 radar
def radar():
    dims = ["Grades", "Attendance", "Practical", "Behaviour", "Activity", "Growth"]
    vals = [82, 90, 75, 88, 70, 78]
    N = len(dims)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    vals_c = vals + vals[:1]
    angles_c = angles + angles[:1]
    fig, ax = plt.subplots(figsize=(6.8, 6.8), subplot_kw=dict(polar=True))
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    ax.plot(angles_c, vals_c, color=ACCENT, linewidth=2)
    ax.fill(angles_c, vals_c, color="#8493a3", alpha=0.35)
    ax.set_xticks(angles)
    ax.set_xticklabels(dims, fontsize=10)
    ax.set_ylim(0, 100)
    ax.set_yticks([20, 40, 60, 80, 100])
    ax.set_yticklabels(["20", "40", "60", "80", "100"], fontsize=8, color="#777")
    ax.grid(color="#cccccc", linewidth=0.6)
    for ang, v in zip(angles, vals):
        ax.text(ang, v + 5, str(v), ha="center", fontsize=9, fontweight="bold")
    save(fig, "figure-5-3.png")


# -------------------------------------------------------- 5.4 growth trend
def growth_trend():
    weeks = [f"W{i}" for i in range(1, 9)]
    scores = [68, 70, 69, 72, 75, 74, 78, 81]
    fig, ax = plt.subplots(figsize=(9, 4.8))
    ax.plot(weeks, scores, marker="o", color=ACCENT, linewidth=2,
            markersize=7, markerfacecolor="#8493a3", markeredgecolor=ACCENT)
    for x, y in zip(weeks, scores):
        ax.annotate(str(y), (x, y), textcoords="offset points",
                    xytext=(0, 8), ha="center", fontsize=9)
    ax.set_ylim(60, 90)
    ax.set_ylabel("Composite score")
    ax.set_xlabel("Weekly snapshot")
    ax.grid(axis="x", visible=False)
    ax.set_axisbelow(True)
    # trend line
    z = np.polyfit(range(len(scores)), scores, 1)
    ax.plot(weeks, np.poly1d(z)(range(len(scores))), color="#bbbbbb",
            linestyle="--", linewidth=1, label="Linear trend")
    ax.legend(frameon=False, loc="lower right", fontsize=9)
    save(fig, "figure-5-4.png")


if __name__ == "__main__":
    print("Rendering charts ...")
    gantt(); risk_heatmap(); complexity(); coverage()
    rag(); test_outcomes(); radar(); growth_trend()
    print("Charts done.")
