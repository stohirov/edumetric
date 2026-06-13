# STYLE_GUIDE.md — Frozen conventions for the EduMetric dissertation

> Distilled from `DOCUMENTATION.md` Parts B & C. Every phase obeys this. If output disagrees with
> this guide or with the locked context, fix the output — never the guide.

---

## 1. Locked context (never contradict)

**Thesis.** BPMN is treated as a **software-engineering bridge notation** that supports the
transformation of process understanding into implementable system artefacts in EduMetric CRM.

**Aim.** To investigate how BPMN notation supports the development of information systems and how
BPMN models can be transformed into software-engineering artefacts during the design and
implementation of EduMetric CRM.

**Research questions (verbatim):**
- **RQ1** — How can BPMN support the development of information systems?
- **RQ2** — How can BPMN models be transformed into software architecture and implementation artefacts?
- **RQ3** — What advantages does BPMN provide during software development?
- **RQ4** — How effective is BPMN in improving communication, system design and implementation quality?

**Scope.** EduMetric CRM only. Three core roles: **Student, Teacher, Admin** (Parent exists in code
as an extension — mention only as a scope note, never as a 4th core role in the BPMN story).
**Stack (locked):** Next.js / React / TypeScript / Tailwind · Java 21+ / Spring Boot / JWT ·
PostgreSQL · modular monolith. Six modelled processes are fixed (see `FACTS.md` §6 and Part F).

**Framing rules:** software-engineering perspective only (never BPR / financial / managerial BI);
process-to-artefact traceability is mandatory; terminology is fixed (§3 below); diagram roles are
fixed; evidence mapping is fixed (App J = UI, App K = testing, App I = criteria, App G/H = logbook).

---

## 2. Output layout

```
diploma/
├── 00-front-matter.md … 07-reflection.md   # front matter + Chapters 1–7
├── 90-references.md  91-appendices.md
├── _assets/       # exported diagram PNGs + screenshots (student drops files here)
├── _diagrams/     # source *.mmd Mermaid + *.bpmn placeholders
├── _sources/      # copied input docs (master PDF, xlsx, drafts, templates)
├── ASSET_REGISTRY.md   # live figure/table/screenshot index
├── STYLE_GUIDE.md      # this file
└── FACTS.md            # evidence base extracted from the codebase
```

---

## 3. Fixed terminology (do not rename between chapters)

*composite score* · *growth trend* · *at-risk detection* · *student analytics* ·
*attendance management* · *metrics engine* · *modular monolith* ·
`student_metrics` · `metric_snapshots` · `formula_config`.

Use **British spelling in prose** (behaviour, optimise, modelling, analyse, programme).
**Exception — code identifiers are quoted verbatim** as they appear in the repo, which uses
American spelling: package `behavior/`, entity `BehaviorRecord`, endpoint `POST /api/behavior`.
Never "correct" a real identifier to British spelling; never apply American spelling to prose.

---

## 4. Figures & tables

- Numbering: per chapter — `Figure 3.2`, `Table 4.1`. Appendix assets use the letter — `Figure J.2`, `Table K.1`.
- **Caption directly under the asset**, format:
  `**Figure 4.1 — Composite-score breakdown by dimension.** *(Source: author, derived from` `student_metrics``.)*`
- **Reference every figure/table in the body before it appears** ("…as shown in Figure 4.1…").
- Add a row to `ASSET_REGISTRY.md` for every asset the moment it is created.

---

## 5. Diagrams — Mermaid vs BPMN placeholders

Mermaid where it renders well; **captioned placeholders** for formal BPMN 2.0 and UI screenshots.

| Diagram | Produce as |
|---|---|
| 6 BPMN process models | BPMN placeholder block **+** Mermaid `flowchart` approximation |
| C4 context / container | Mermaid `flowchart` (or `C4Context`) |
| Component / module map | Mermaid `flowchart` with subgraphs per bounded context |
| ERD | Mermaid `erDiagram` |
| Sequence | Mermaid `sequenceDiagram` |
| Deployment | Mermaid `flowchart` |
| WBS | Mermaid tree / nested list |
| Gantt | Mermaid `gantt` |
| Conceptual framework | Mermaid `flowchart` |

**BPMN placeholder block (verbatim shape):**

```
> 🟦 **[BPMN DIAGRAM — Figure 4.2: <Process name>]**
> **Pools:** Student · Teacher · Admin · System (only those that participate)
> **Happy path:** <ordered activities>
> **Gateways (real decisions):** <gateway → branches>
> **Exception paths:** <exceptions that affect implementation>
> **Maps to:** <architecture module(s)> · <entity/entities> · <endpoint(s)>
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-2.png`
> **Caption:** *Figure 4.2 — <Process name> (BPMN 2.0)*
```
Follow each BPMN placeholder immediately with a Mermaid `flowchart` approximation of the same flow.

**Screenshot placeholder block (verbatim shape):**

```
> 📸 **[SCREENSHOT — Figure J.2]**
> **Capture from:** <route> (`<frontend file>`)
> **Must show:** <exact UI elements>
> **Save to:** `_assets/figure-J-2.png`
> **Caption:** *Figure J.2 — <screen name>*
```
Never fabricate an image; only ever produce the placeholder.

---

## 6. Writing style

- Academic, **third person** in the main body. First person allowed **only in Chapter 7**.
- Every analytical paragraph = **argument + evidence + engineering conclusion** (the Distinction bar).
- Harvard in-text `(Author, Year)`; every cited work appears in `90-references.md` (≥25 sources).
- Tag BTEC criteria where the template does (e.g. *"Addresses LO2 — P3, P4 | M2 | D2"*).
- Respect per-chapter word-count targets (see Part G of `DOCUMENTATION.md`).

## 7. Grounding & honesty

- Read the real code before describing it; quote real file paths / endpoints / entities / changesets
  (see `FACTS.md`). Never invent a module, endpoint, entity, or test ID.
- Reuse the student's existing artefacts **exactly**: Tables 4.1–4.7, Risk Register R01–R10, the
  24-week Gantt, the test IDs (`TC-AUTH-01`…). Do not renumber or rename.
- Where the draft artefacts idealised an endpoint/table that differs from the shipped code, prefer
  the **real code** in technical claims and note the reconciliation (see `FACTS.md` §7).
- Mark genuine human input with `⟨STUDENT INPUT: …⟩` — never fabricate survey data, dates,
  signatures, or personal feelings.
