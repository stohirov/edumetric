# DOCUMENTATION.md — Phased Build Prompt for the EduMetric Diploma

> **What this file is.** A self-contained, phase-by-phase instruction set that you feed to
> **Claude Code** to generate a complete, submission-ready BTEC Level 6 Independent Project
> (diploma) for the **EduMetric CRM** system. Each phase is runnable on its own. The output is a
> set of per-chapter Markdown files under `diploma/`, assembled into a final `.docx` that matches
> the BTEC template.
>
> **How to run it.** In a Claude Code session, say:
> *"Read `DOCUMENTATION.md`. Execute **Phase N**."* — running phases **in order, 0 → 13**.
> Do not skip the locked context in Part B; every phase must obey it.
>
> **Golden rule.** This is a **software-engineering dissertation about BPMN**, with EduMetric CRM
> as the case study. Everything written must be **grounded in the real code in this repo** and in
> the **existing draft artefacts** the student already produced (see Part D). Never invent a
> module, endpoint, entity, or test ID that does not exist — read the source and quote it.

---

## Table of Contents

- **Part A — Project identity & the deliverable**
- **Part B — Locked master context (must never be contradicted)**
- **Part C — Global conventions (apply in every phase)**
- **Part D — Evidence base (files every phase may read)**
- **Part E — Master asset registry (figures, tables, diagrams, charts, screenshots)**
- **Part F — The six BPMN process spine (pre-filled traceability)**
- **Part G — The phases (0 → 13)**
- **Part H — Final QA gate**

---

# Part A — Project identity & the deliverable

| Field | Value |
|---|---|
| Qualification | Pearson **BTEC Level 6** Diploma in Digital Technologies |
| Unit | **Unit 2 — Independent Project** (Unit Code 70726U, 30 credits) |
| Institution | **PDP University**, Faculty of Business Information Technology, Tashkent |
| Project format | Capstone / thesis-style |
| Working title | **BPMN Notation in the Development of Information Systems: A Software-Engineering Case Study of the EduMetric CRM** |
| Case study system | **EduMetric CRM** — a multidimensional student-growth evaluation platform (the code in this repo: `backend/` + `hackathon-front/`) |
| Language | **English only** (Harvard author–date referencing) |
| Target grade | **Distinction** — every section must give *argument + evidence + engineering conclusion*, not description |

**The deliverable produced by these phases:** a `diploma/` folder containing one Markdown file per
chapter (front matter, Chapters 1–7, References, Appendices A–K), plus a final assembled
`EduMetric_Dissertation.docx`. Diagrams are **Mermaid** (renderable) where they render well, and
**captioned placeholders** for formal BPMN 2.0 diagrams and UI screenshots the student supplies.

---

# Part B — Locked master context (must never be contradicted)

These statements are **frozen**. No phase, chapter, diagram, or caption may contradict them.

**Locked thesis statement**
> BPMN in this dissertation is treated as a **software-engineering bridge notation** that supports
> the transformation of process understanding into implementable system artefacts in EduMetric CRM.

**Locked aim**
> To investigate how BPMN notation supports the development of information systems and how BPMN
> models can be transformed into software-engineering artefacts during the design and
> implementation of EduMetric CRM.

**Locked research questions**
- **RQ1** — How can BPMN support the development of information systems?
- **RQ2** — How can BPMN models be transformed into software architecture and implementation artefacts?
- **RQ3** — What advantages does BPMN provide during software development?
- **RQ4** — How effective is BPMN in improving communication, system design and implementation quality?

**Locked scope**
- The system is **EduMetric CRM only**.
- Roles are exactly three: **Student, Teacher, Admin** (a Parent role exists in code as an extension — mention only as scope note, never as a 4th core role in the BPMN story).
- The stack is locked: **Next.js / React / TypeScript / Tailwind** frontend · **Java 21 / Spring Boot / JWT** backend · **PostgreSQL** · **modular monolith**.
- The six modelled processes are fixed (Part F).

**Framing rules (the "consistency rules")**
1. **Software-engineering perspective only.** BPMN is a design & communication artefact, never the end goal. Never drift into business-process-reengineering, financial optimisation, or managerial BI framing.
2. **Process-to-artefact traceability is mandatory.** Every major process maps to: requirement → BPMN diagram → architecture element → database artefact → API endpoint → test evidence.
3. **Terminology is fixed.** Always use: *composite score*, *growth trend*, *at-risk detection*, *student analytics*, *attendance management*, *metrics engine*, *modular monolith*, *student_metrics*, *metric_snapshots*, *formula_config*. Do not rename these between chapters.
4. **Diagram roles are fixed.** BPMN = process behaviour · Architecture/C4 = system structure · ERD = data relationships · Sequence = interaction order · UI screenshots = implementation evidence · Test tables = validation evidence.
5. **Evidence mapping is fixed.** Appendix J = UI/prototype evidence · Appendix K = testing/evaluation evidence · Appendix I = assessment-criteria mapping · Appendix G/H = logbook & supervisor meetings.
6. **No-contradiction rule.** Once adopted, no chapter may change scope, swap the stack, make BPMN the final deliverable, or convert the report into a process-optimisation study.

---

# Part C — Global conventions (apply in every phase)

### C.1 Output layout
Create and write into this structure (Phase 0 scaffolds it):

```
diploma/
├── 00-front-matter.md          # title page, declaration, acknowledgements, abstract, ToC, lists
├── 01-introduction.md          # Chapter 1
├── 02-literature-review.md     # Chapter 2
├── 03-methodology.md           # Chapter 3
├── 04-data-analysis.md         # Chapter 4 (artefact-driven analysis)
├── 05-discussion.md            # Chapter 5
├── 06-conclusion.md            # Chapter 6
├── 07-reflection.md            # Chapter 7
├── 90-references.md            # consolidated Harvard reference list
├── 91-appendices.md            # Appendices A–K
├── _assets/                    # exported diagram images, screenshots (student drops files here)
├── _diagrams/                  # source: *.mmd Mermaid files + *.bpmn placeholders
├── _sources/                   # copied input docs (master PDF, appendix docx, drafts, xlsx)
├── ASSET_REGISTRY.md           # the live figure/table/screenshot index (Part E)
├── STYLE_GUIDE.md              # frozen conventions (this Part C, distilled)
└── FACTS.md                    # evidence base extracted from the codebase (Phase 0)
```

### C.2 Figures & tables
- Number per chapter: `Figure 3.2`, `Table 4.1`. Appendix assets use the letter: `Figure J.2`, `Table K.1`.
- **Caption format (always directly under the asset):**
  `**Figure 4.1 — Composite-score breakdown by dimension.** *(Source: author, derived from `student_metrics`.)*`
- Every figure and table **must be referenced in the body text before it appears** ("…as shown in Figure 4.1…").
- Keep a running entry in `ASSET_REGISTRY.md` for each one so the List of Figures / List of Tables can be auto-built in Phase 12.

### C.3 Diagrams — Mermaid vs BPMN placeholders
Per the chosen approach: **Mermaid where it renders well, placeholders for formal BPMN.**

| Diagram | Produce as |
|---|---|
| 6 BPMN process models | **Placeholder block** (formal `.bpmn` to be drawn in bpmn.io / draw.io) **+ a Mermaid `flowchart` approximation** so the file is reviewable now |
| C4 context & container | Mermaid `flowchart` (or `C4Context` where supported) |
| Component / module diagram | Mermaid `flowchart` with subgraphs per bounded context |
| ERD | Mermaid `erDiagram` |
| Sequence diagrams | Mermaid `sequenceDiagram` |
| Deployment diagram | Mermaid `flowchart` |
| WBS | Mermaid `flowchart` (tree) or nested list |
| Gantt | Mermaid `gantt` |
| Conceptual framework | Mermaid `flowchart` |

**BPMN placeholder block format** (use verbatim shape):

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

### C.4 Screenshot placeholders
The student supplies screenshots. Wherever UI evidence is referenced, insert this block (do **not**
fabricate images):

```
> 📸 **[SCREENSHOT — Figure J.2]**
> **Capture from:** <route, e.g. /student> (`hackathon-front/src/app/(dashboard)/student/page.tsx`)
> **Must show:** <exact UI elements, e.g. composite-score gauge, 6/7-dimension radar, trend line, growth areas>
> **Save to:** `_assets/figure-J-2.png`
> **Caption:** *Figure J.2 — Student Growth Dashboard*
```

### C.5 Writing style
- Academic, third person in the main body (first person allowed only in Chapter 7 reflection).
- **Argument + evidence + engineering conclusion** in every analytical paragraph (Distinction bar).
- Harvard in-text citations `(Author, Year)`; every cited work appears in `90-references.md`. Aim for **25+ quality sources** (Part D lists the seed bibliography).
- Respect the per-chapter word-count targets in Part G.
- Tag BTEC criteria where the template does (e.g. *"Addresses LO2 — P3, P4 | M2 | D2"*).
- **British spelling** (behaviour, optimise, modelling) to match the template.

### C.6 Grounding & honesty
- Read the real code before describing it. Quote real file paths (e.g. `backend/.../MetricsService.java`), real endpoints, real entities, real Liquibase changesets.
- Where the existing draft artefacts (Part D) already define something — Tables 4.1–4.7, the R01–R10 risk register, the 24-week Gantt, the traceability matrix, test IDs like `TC-AUTH-01` — **reuse them exactly**. Do not renumber or rename.
- Mark anything that needs genuine human input (real survey data, supervisor dates, ethics signatures, personal feelings) with `⟨STUDENT INPUT: …⟩` rather than fabricating.

---

# Part D — Evidence base (files every phase may read)

**A. The real codebase (source of truth for all technical claims)**
- `backend/ARCHITECTURE.md` — system design, the metrics engine, formula, security model, DB tables, API inventory. **Primary technical source.**
- `backend/CLAUDE.md` — backend conventions.
- `backend/src/main/java/com/edumetric/backend/` — 45+ vertical-slice packages; 50+ controllers; 60 `@Entity` classes. Key slices for the BPMN story: `auth/`, `security/`, `attendance/`, `grades/`, `behavior/`, `metrics/`, `analytics/`, `students/`, `atrisk/`, `audit/`, `settings/`, `organization/`.
- `backend/src/main/resources/db/changelog/` — Liquibase schema, the **real ERD source** (`v1-core/*`, `v2-domain/*`, `v3-metrics/*`, `v4-audit/*`).
- `hackathon-front/src/app/(auth)` and `.../(dashboard)/{student,teacher,admin,parent}/…` — the real routes that back every Appendix J screenshot. `src/components/charts/` backs the analytics visuals.
- `backend/pom.xml`, `application*.yaml` — stack & config evidence.
- `TODO.md` — roadmap & scope evidence (what is built vs deferred).

**B. The student's existing diploma drafts (reuse, do not reinvent)** — copy into `diploma/_sources/` in Phase 0:
- `EduMetric_CRM_Master_Document.pdf` — the locked product master document.
- `EduMetric_Dissertation_Artefacts.xlsx` — **contains 3 finished artefacts: (1) the full Traceability Matrix** (all 6 processes → BPMN activity → requirement → module → entity/field → endpoint → method → roles → validation → test evidence), **(2) the Risk Register R01–R10**, **(3) the 24-week / 5-phase Gantt chart.** These are authoritative — mirror them.
- `Chapter4_Revised (1).docx` — an existing Chapter 4 draft defining **Tables 4.1–4.7** (per-process traceability + BPMN→module mapping). Reuse this numbering.
- `Черновик.docx` — broader working draft; mine for reusable prose.
- `BTEC_L6_Unit2_Independent_Project_Template (2).docx` — the official template (structure, guidance, BTEC criteria, Appendix I matrix). The `.docx` export in Phase 13 must match it.
- `BTEC_L6_Unit2_Template_UZ.docx` — Uzbek template (reference only; output is English).
- `иловалар билан ишлаш.docx` — appendix guidance & content (Appendices A–K worked example).
- `APPENDIX_ларни_асосий_матга_боглаш_керак.docx` — **the exact sentences** that link Appendix J & K into §3.9, §5.3, §5.4, §5.5, §6.2 (use these in Phase 11).

> Source docs currently live in `/Users/stohirov/Downloads/telegram/Дипломная работа/` (and its `cheat/` subfolder). Phase 0 copies the needed ones into `diploma/_sources/`.

**C. Seed bibliography (Harvard) — extend toward 25+**
BPMN/process modelling: *OMG BPMN 2.0 specification*; Weske (*BPM: Concepts, Methods, Technology*); Dumas et al. (*Fundamentals of Business Process Management*); van der Aalst (process mining/workflow); Silver (*BPMN Method and Style*); White & Miers (*BPMN Modeling and Reference Guide*).
Requirements engineering: Sommerville (*Software Engineering*); Wiegers & Beatty (*Software Requirements*); Pohl (*Requirements Engineering*); Robertson & Robertson (*Mastering the Requirements Process*).
Architecture: Bass, Clements & Kazman (*Software Architecture in Practice*); Fowler (*Patterns of Enterprise Application Architecture*); Richards & Ford (*Fundamentals of Software Architecture*); Newman (*Building Microservices* — for contrast).
Databases: Connolly & Begg; Silberschatz, Korth & Sudarshan; Teorey et al.
API/integration: Richardson & Amundsen (*RESTful Web APIs*); Fielding (REST dissertation); Spring/Spring Security docs; *OpenAPI Specification*.
Methodology: Saunders, Lewis & Thornhill; Oates, Griffiths & McLean; Bell & Waters.
Design science / evaluation: Hevner et al.; Peffers et al.

---

# Part E — Master asset registry (build in Phase 0, keep current)

`ASSET_REGISTRY.md` is the single index of every figure, table, diagram, chart and screenshot.
Each phase adds rows as it creates assets; Phase 12 builds the List of Figures/Tables from it.
The **required minimum** asset set (aligned to existing drafts) is below.

### E.1 Diagrams (Requirement 1)
| ID | Title | Type | Chapter |
|---|---|---|---|
| Fig 2.1 | Conceptual framework: BPMN as a bridge from process intent to artefacts | Mermaid flowchart | 2 |
| Fig 3.1 | Work Breakdown Structure | Mermaid tree | 3 |
| Fig 4.1 | C4 Level 1 — System context | Mermaid | 4 |
| Fig 4.2 | C4 Level 2 — Container diagram | Mermaid | 4 |
| Fig 4.3 | Component / module map (bounded contexts) | Mermaid subgraphs | 4 |
| Fig 4.4 | Deployment diagram (docker-compose / VPS / nginx) | Mermaid | 4 |
| Fig 4.5 | ERD — full schema (or 5 sub-domain ERDs 4.5a–e) | Mermaid erDiagram | 4 |
| Fig 4.6–4.11 | **BPMN models** of the 6 processes (Part F) | BPMN placeholder + Mermaid | 4 |
| Fig 4.12 | Sequence — login & JWT issuance | Mermaid sequence | 4 |
| Fig 4.13 | Sequence — bulk attendance → synchronous recompute | Mermaid sequence | 4 |
| Fig 4.14 | Sequence — student dashboard composition (the "wow endpoint") | Mermaid sequence | 4 |
| Fig 4.15 | Security filter chain | Mermaid flowchart | 4 |

### E.2 Charts (Requirement 2)
| ID | Title | Chart type | Chapter |
|---|---|---|---|
| Fig 3.2 | Project Gantt chart (24 weeks, 5 phases) | Mermaid `gantt` (mirror the xlsx) | 3 |
| Fig 3.3 | Risk heat-map (Probability × Impact, R01–R10) | matrix/scatter (Mermaid or table-grid) | 3 |
| Fig 4.16 | BPMN element / process-complexity comparison (activities, gateways, exceptions per process) | bar chart | 4 |
| Fig 4.17 | Process → artefact coverage (modules/entities/endpoints touched per process) | stacked bar | 4 |
| Fig 5.1 | Project effectiveness — objectives RAG status | RAG bar | 5 |
| Fig 5.2 | Test outcomes — pass rate across the test suite (from Appendix K) | donut / bar | 5 |
| Fig 5.3 | Student growth profile — composite-score radar (6 dimensions) | radar (Recharts in app; reproduce as figure) | 5 |
| Fig 5.4 | Growth trend over snapshots (`metric_snapshots`) | line chart | 5 |

### E.3 Tables
| ID | Title | Source |
|---|---|---|
| Table 3.1 | Milestones & critical path | template + Gantt |
| Table 3.2 | Resource plan | author |
| Table 3.3 | Risk register (R01–R10) | **xlsx — reuse exactly** |
| Table 4.1–4.6 | Per-process traceability matrices (6 processes) | **xlsx + Chapter4_Revised — reuse** |
| Table 4.7 | BPMN process → architecture module mapping | **Chapter4_Revised — reuse** |
| Table 5.1 | Project effectiveness evaluation (RAG) | author |
| Table I.1 | BTEC assessment-criteria mapping | template Appendix I |
| Table K.1 | Test case results (TC-AUTH-01 … etc.) | xlsx traceability test column |

### E.4 Screenshots (Requirement 3 — placeholders only; student supplies images)
Appendix J set, mapped to **real routes**:
| ID | Screen | Route |
|---|---|---|
| Fig J.1 | Login / authentication | `/(auth)/login` |
| Fig J.2 | Student growth dashboard | `/student` |
| Fig J.3 | Student progress / growth detail | `/student/growth`, `/student/progress` |
| Fig J.4 | Teacher attendance (quick-mark) | `/teacher/attendance` |
| Fig J.5 | Teacher grades / gradebook | `/teacher/grades` |
| Fig J.6 | Admin formula configuration | `/admin/formula` |
| Fig J.7 | Admin org dashboard | `/admin` |
| Fig J.8 | At-risk students list | `/teacher/at-risk` (or `/admin/at-risk`) |
| Fig J.9 | Analytics dashboard | `/analytics` |
| Fig J.10 | Student transcript / certificates | `/student/transcript`, `/student/certificates` |
Plus: **Fig 3.4** (project-tracking tool screenshot, §3.8) and **Appendix K** test-result screenshots.

---

# Part F — The six BPMN process spine (pre-filled traceability)

These six processes are the backbone of Chapter 4. The mappings below are **pre-derived from the
real code and the student's traceability matrix** — verify each against the source, then expand.
Each process produces: **BPMN diagram → requirement(s) → architecture module(s) → entity/entities →
endpoint(s) → test evidence.**

**P1 — User Authentication** *(Fig 4.6)*
- Flow: submit credentials → validate (BCrypt) → issue JWT (role claim) → role-based redirect → failure handling → logout.
- Modules: `security/` (`JwtAuthenticationFilter`, `JwtTokenProvider`, `CustomUserDetailsService`), `auth/` (`AuthController`, `AuthService`), `config/SecurityConfig`.
- Entities: `users`, `refresh_tokens`, `password_reset_tokens`, two-factor / login-security fields.
- Endpoints: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/refresh`.
- Tests: `TC-AUTH-01..06` (valid login, invalid password → 401, role claim, redirect, error body, logout invalidation).

**P2 — Attendance Management** *(Fig 4.7)*
- Flow: teacher selects lesson → load enrolled students → default all present → mark exceptions → save (unique per student+lesson) → **synchronous metric recompute**.
- Modules: `attendance/` (`AttendanceController`, `AttendanceService`), `lessons/`, `metrics/` (`MetricsService`); related `checkin/`, `justifications/`, `attendance` policy & reports.
- Entities: `lessons`, `attendance` (UNIQUE `student_id,lesson_id`), `student_metrics`.
- Endpoints: `GET /api/lessons?teacherId=`, `GET /api/lessons/{id}/students`, `POST /api/attendance/bulk`.
- Tests: `TC-ATT-01..05` (own lessons only, list matches enrolment, invalid status → 400, duplicate → 409, recompute fires).
- Engineering note: high-frequency flow → BPMN must surface where speed/synchronous-update matters.

**P3 — Student Evaluation** *(Fig 4.8)*
- Flow: input grade / behaviour / activity / practical → validate → apply weights → **recompute composite score**.
- Modules: `grades/`, `behavior/`, `gradebook/`, `gradecategories/`, `rubrics/`, `metrics/` (pure `MetricsEngine` + orchestrating `MetricsService`).
- Entities: `assignments`, `grades`, `behavior_records`, `activity_records`, `formula_config`, `student_metrics`.
- Endpoints: `POST /api/grades/bulk`, behaviour/activity create, `PUT /api/metrics/formula`, `POST /api/metrics/recompute/{studentId}`.
- Tests: `TC-EVAL-01..05` (grade >100 → 400, behaviour out of 1–5 → 400, unknown activity → 400, missing FK → 422, composite reflects new input same cycle).
- Engineering note: the heart of scoring logic & business rules; formula is transparent & configurable (weights sum 1.0).

**P4 — Student Analytics Generation** *(Fig 4.9)*
- Flow: read cached `student_metrics` → fetch trend snapshots → build radar profile → compose dashboard payload (single endpoint).
- Modules: `students/` (`StudentDashboardService` — the composed "wow endpoint"), `analytics/`, `metrics/`.
- Entities: `student_metrics` (denormalised cache), `metric_snapshots` (history).
- Endpoints: `GET /api/students/{id}/dashboard`, `GET /api/analytics/admin/dashboard`, `GET /api/metrics/formula`, trend/radar reads.
- Tests: `TC-ANA-01..04` (dimension scores returned, trend sorted by date, radar = 6 dimensions, dashboard payload composes composite+radar+trend+risk).
- Engineering note: read model + analytics logic; Redis short-TTL cache for cross-student dashboards.

**P5 — At-Risk Student Detection** *(Fig 4.10)*
- Flow: threshold checks → growth-decline detection → flag generation → teacher/admin notification → escalation.
- Modules: `atrisk/` (`AtRiskRulesController`, `AtRiskRules`), `analytics/`, `notifications/`, `reminders/`.
- Entities: `at_risk_rules`, `notifications`, `metric_snapshots`, `student_metrics`.
- Endpoints: `GET /api/analytics/at-risk` (role-scoped), at-risk-rules config.
- Tests: `TC-RISK-*` (at-risk list scoped by role, threshold breach flags, notification emitted).
- Engineering note: exception-driven analytical workflow → BPMN gateways & event triggers are the point.

**P6 — Admin Monitoring** *(Fig 4.11)*
- Flow: system-wide dashboard → user/group/course management → formula settings → audit perspective → monitor teacher activity.
- Modules: `analytics/`, `organization/`, `settings/`, `audit/`, `users/`, `groups/`, `courses/`, `departments/`.
- Entities: `institution_settings`, `formula_config`, `audit_log`, `departments`, `academic_terms`.
- Endpoints: `GET /api/analytics/admin/dashboard`, settings GET/PATCH, `PUT /api/metrics/formula`, user/group/course CRUD.
- Tests: `TC-ADMIN-*` (KPI aggregation, formula change → recomputeAll, audit entry written).
- Engineering note: governance & configuration process; formula change cascades to all metrics.

**BPMN modelling rules** (apply to every diagram): one diagram = one semantic process; pools for
roles (Student/Teacher/Admin/System) only where they participate; lanes only when they clarify
responsibility; gateways must be real decisions (not decorative); every exception path that affects
implementation must appear; split by bounded context rather than overloading one diagram; **every
diagram must map to at least one architecture or API section.**

---

# Part G — The phases

> Run **in order**. Each phase ends by updating `ASSET_REGISTRY.md` and noting open `⟨STUDENT INPUT⟩`
> items. If a phase is too large for one session, finish the sub-deliverables it lists, then resume.

---

### Phase 0 — Scaffold & evidence base
**Goal:** create the `diploma/` skeleton and a verified facts file so later phases never guess.
**Read:** Part B–F of this doc; `backend/ARCHITECTURE.md`; `backend/CLAUDE.md`; the Liquibase changelog dir; `hackathon-front/src/app` routes; `EduMetric_Dissertation_Artefacts.xlsx`; `Chapter4_Revised (1).docx`.
**Produce:**
1. The full `diploma/` tree from §C.1 (empty chapter files with their H1 headings and BTEC LO tags).
2. `diploma/_sources/` — copy in the master PDF, the artefacts xlsx, the two chapter drafts, the BTEC template, and the two appendix-guidance docx.
3. `diploma/STYLE_GUIDE.md` — distil Part C (layout, caption format, Mermaid/BPMN/screenshot conventions, citation style, British spelling, word counts).
4. `diploma/ASSET_REGISTRY.md` — seed it with every row from Part E (status = `todo`).
5. `diploma/FACTS.md` — the extracted evidence base: real module list, the 60 entity names, the endpoint inventory, the **exact composite-score formula and default weights** (from `ARCHITECTURE.md` §6: `0.25/0.15/0.25/0.10/0.10/0.10/0.05`), the recompute triggers, the security model, the Liquibase changeset list grouped by domain, and the frontend route map. Quote file paths.
**Done when:** the tree exists, sources are copied, and `FACTS.md` lets every later phase cite real artefacts without re-reading the whole codebase.
**Guardrail:** do not write chapter prose yet.

---

### Phase 1 — Front matter
**Goal:** `00-front-matter.md`.
**Produce (English, matching the BTEC template):** title page (fill Part A values; `⟨STUDENT INPUT: full name, student ID, group, supervisor, submission date⟩`); Declaration of Originality; Acknowledgements (short, professional, `⟨STUDENT INPUT⟩` for names); **Abstract placeholder** (a note: *"written last in Phase 13"*); auto-generated ToC stub; List of Figures / List of Tables (pull from `ASSET_REGISTRY.md`, may be stubs now); List of Abbreviations (seed: BPMN, CRM, JWT, REST, ERD, WBS, RAG, SMART, SWOT, API, DTO, ORM, RBAC, LO, P/M/D, GDPR — plus project terms).
**Done when:** front matter is complete except the abstract.

---

### Phase 2 — Chapter 1: Introduction *(LO1 — P1, P2 | M1 | D1)*
**Goal:** `01-introduction.md`, ~1,000–1,500 words, full prose.
**Sections:** 1.1 Background & Context (digitalisation of education in Uzbekistan/Central Asia; the gap between *recording* grades and *understanding student growth*; BPMN's role in IS development) · 1.2 Problem Statement (the engineering problem: turning abstract processes — authentication, attendance, evaluation, analytics, at-risk detection, admin monitoring — into concrete software artefacts, and the requirements-to-implementation handoff gap BPMN addresses) · 1.3 Project Aim (the **locked aim**) · 1.4 Objectives (3–5 SMART objectives that deliver the aim: review BPMN/SE literature; model the 6 processes in BPMN; transform models into architecture/DB/API artefacts; implement & validate in EduMetric CRM; evaluate BPMN's effectiveness) · 1.5 Research Questions (**RQ1–RQ4 locked**) · 1.6 Significance (academic = BPMN-to-artefact gap; industry = transparent education analytics; personal = SE career) · 1.7 Scope & Limitations (locked scope; design-and-artefact focus, not production deployment) · 1.8 Structure of the Report.
**Cross-refs:** §1.3/1.4 will be evidenced by **Appendix A** (proposal).
**Done when:** every locked statement appears verbatim and objectives are SMART.

---

### Phase 3 — Chapter 2: Literature Review *(LO1 — M1 | D1)*
**Goal:** `02-literature-review.md`, ~2,000–3,000 words, **thematic** (not author-by-author).
**Sections:** 2.1 Intro & search strategy (databases: Google Scholar, IEEE Xplore, ACM DL, ScienceDirect; keywords; inclusion criteria) · 2.2 Theoretical framework (BPMN 2.0 + design-science lens, Hevner et al.) · 2.3 Thematic review with the **six themes**: (1) BPMN as a requirements-engineering instrument; (2) BPMN → software-design translation; (3) BPMN → database design; (4) BPMN → API design; (5) BPMN in stakeholder communication; (6) BPMN limitations & alternatives (flowcharts, UML activity, user stories, textual SRS) · 2.4 Industry/practice review · 2.5 Identification of the gap + **D1 evaluation of alternative directions** · 2.6 Conceptual framework → **Fig 2.1** (Mermaid: process intent → BPMN → {requirements, architecture, DB, API} → implementation → validation) · 2.7 Summary.
**Output also:** append all cited works (≥25, Harvard) to `90-references.md`; start from the Part D seed list and expand.
**Done when:** the review converges on the locked thesis ("BPMN is most valuable as a bridge notation that translates business intent into software-design artefacts") and Fig 2.1 exists.

---

### Phase 4 — Chapter 3: Project Planning & Methodology *(LO2 — P3, P4 | M2 | D2)*
**Goal:** `03-methodology.md`, ~2,000–2,500 words.
**Read:** the xlsx **Risk Register** and **Gantt** sheets (reuse exactly).
**Sections:** 3.1 Research philosophy & approach (pragmatism + design science; Saunders "research onion") · 3.2 Methodological choice (qualitative/artefact-driven, justified vs survey-heavy) · 3.3 PM methodology (Agile/iterative, justified for a software capstone) · 3.4 Project plan → **3.4.1 WBS = Fig 3.1**, **3.4.2 Gantt = Fig 3.2** (Mermaid `gantt` mirroring the 24-week / 5-phase xlsx: Research Foundation, Methodology & Planning, BPMN Modelling, Architecture & Design, Analysis & Writing), **3.4.3 Milestones & critical path = Table 3.1** · 3.5 Resource planning = **Table 3.2** · 3.6 **Risk Register = Table 3.3 (R01–R10 verbatim from xlsx)** + **Fig 3.3 risk heat-map** · 3.7 Ethical considerations (low-risk: no human-subject data collection; system uses synthetic/anonymised student records; GDPR-aligned; **draw text from the appendix-guidance docx** — see Phase 10) · 3.8 Project tracking & documentation (**Fig 3.4 screenshot placeholder** of the tracking tool; reference Appendix G/H) · 3.9 Implementation of the plan (**insert the exact Appendix-J linking sentence from `APPENDIX_…docx` in Phase 11**) · 3.10 **D2** critical assessment of project management.
**Done when:** risk register and Gantt match the xlsx exactly; all four §3 figures registered.

---

### Phase 5 — Engineering artefact pack (the diagrams) — feeds Chapter 4
**Goal:** build every technical diagram once, as reusable `_diagrams/*.mmd` files + embeds, so Chapter 4 prose can reference them.
**Read:** `ARCHITECTURE.md` (topology §2, package layout §3, security §5, metrics engine §6, DB tables §7, API §8); the Liquibase changesets (for the ERD); Part F.
**Produce (register each in `ASSET_REGISTRY.md`):**
- **Fig 4.1 C4 context**, **Fig 4.2 C4 container**, **Fig 4.3 component/module map** (subgraphs per bounded context), **Fig 4.4 deployment** (browser → nginx → Next.js/Spring → Postgres + Redis + MinIO, one docker-compose).
- **Fig 4.5 ERD** — Mermaid `erDiagram` from the real schema, split into the 5 sub-domains (identity & access · academic structure · assessment records · analytics layer · audit/governance) or one master ERD with those clusters labelled.
- **Fig 4.6–4.11 — the 6 BPMN models** (Part F): each = a BPMN placeholder block (§C.3) **+** a Mermaid `flowchart` approximation with pools as subgraphs and real gateways/exceptions.
- **Fig 4.12 login sequence**, **Fig 4.13 bulk-attendance→synchronous-recompute sequence**, **Fig 4.14 dashboard-composition sequence**, **Fig 4.15 security filter chain**.
**Done when:** all 15+ Chapter-4 diagrams exist as Mermaid (renderable) with BPMN placeholders where formal notation is needed.

---

### Phase 6 — Chapter 4: Data Collection & Analysis (artefact-driven) *(LO3 — P5, M3, M4)*
**Goal:** `04-data-analysis.md`, ~2,000–3,000 words — the **core engineering chapter**. Treat "data" as **artefacts**, per the master context.
**Read:** `Chapter4_Revised (1).docx` (reuse its prose & Tables 4.1–4.7), the xlsx traceability matrix, Phase-5 diagrams.
**Sections:** 4.1 Data-collection methods = the artefact/derivation method (P5): how BPMN models were elicited from system behaviour and the code · 4.1.1 "Primary data" = the BPMN models & code artefacts; 4.1.2 "Secondary data" = architecture docs, schema; 4.1.3 sampling = the 6-process selection rationale · 4.2 Analytical techniques (M3): the **traceability method** (process step → requirement → design → entity/endpoint → test) · 4.3 Findings: 4.3.1 artefact inventory / "sample profile" (modules, 60 entities, endpoints — a summary table); 4.3.2–4.3.x **per process** P1–P6, each embedding its BPMN diagram (Fig 4.6–4.11), narrative, and **per-process traceability matrix Table 4.1–4.6 (reuse xlsx/Chapter4_Revised)**; then **Table 4.7 BPMN→module mapping**, the ERD (Fig 4.5), sequences (Fig 4.12–4.14) · 4.4 Comparison of patterns (M4): **Fig 4.16 process-complexity bar** + **Fig 4.17 process→artefact coverage** + reasoned conclusions about which processes most benefited from BPMN.
**Distinction hooks:** for each process give *requirement → design decision → why* (e.g. why synchronous recompute, why separate `student_metrics`/`metric_snapshots`, why REST grouped by bounded context).
**Done when:** all 6 processes are fully traced with diagram + matrix; Tables 4.1–4.7 present; M4 charts present.

---

### Phase 7 — Chapter 5: Discussion *(LO3 — D3)*
**Goal:** `05-discussion.md`, ~1,500–2,000 words.
**Sections:** 5.1 Interpretation of findings (answer RQ1–RQ4 in turn using Chapter-4 evidence) · 5.2 Comparison with the literature (agree/differ vs Chapter 2 themes) · 5.3 **Validity** (D3 — does the traceability actually demonstrate BPMN→artefact transformation? construct/internal/external; **reference Appendix K test evidence** — insert the exact §5.3 sentence in Phase 11) · 5.4 **Reliability** (repeatable derivation; consistent test outputs across sample users — §5.4 sentence) · 5.5 **Project effectiveness evaluation** = **Table 5.1 RAG** + **Fig 5.1 objectives RAG bar** + **Fig 5.2 test pass-rate** + **Fig 5.3 growth radar** + **Fig 5.4 trend line**; reference **Appendix J** UI evidence (§5.5 sentence) · 5.6 Limitations (BPMN verbosity, semantic gaps, single-case study) · 5.7 Implications for practice & future research.
**Done when:** every RQ is explicitly answered; validity/reliability cite Appendix J/K; all §5 charts present.

---

### Phase 8 — Chapter 6: Conclusion & Recommendations
**Goal:** `06-conclusion.md`, ~800–1,000 words, **no new findings or citations**.
**Sections:** 6.1 Summary of the project · 6.2 Achievement of objectives (map each Phase-2 objective → outcome; **insert §6.2 Appendix-J/K sentence** in Phase 11) · 6.3 Contribution to knowledge & practice (the BPMN-bridge method + a working transparent education-analytics artefact) · 6.4 Recommendations — 6.4.1 for practitioners/industry, 6.4.2 for future researchers · 6.5 Closing remarks.
**Done when:** every objective is explicitly marked met/partially met with a pointer to its evidence.

---

### Phase 9 — Chapter 7: Reflective Evaluation *(LO4 — P7 | D4)*
**Goal:** `07-reflection.md`, ~1,000–1,500 words, **first person**, full draft grounded in the real project journey, with `⟨STUDENT INPUT⟩` for genuinely personal specifics.
**Sections:** 7.1 Choice of reflective model (Gibbs' Reflective Cycle, cited) · 7.2 Reflection through Gibbs (7.2.1 Description → 7.2.6 Action Plan) — anchor each stage in concrete project events (e.g. modelling the synchronous-recompute gateway; reconciling BPMN with the real `MetricsService`; keeping terminology locked) · 7.3 SWOT of personal development (table) · 7.4 Transferable skills (table: skill / level / **evidence from this project**) · 7.5 **D4** future development plan (table: goal / action / timeframe).
**Done when:** the reflection is specific and evidence-backed, not generic; `⟨STUDENT INPUT⟩` marks only truly personal items.

---

### Phase 10 — Appendices A–K
**Goal:** `91-appendices.md`. Each appendix starts on a new page, is lettered & titled, and is referenced from the main text.
**This is where "text-only, appendix-sourced" content lives.** Read `иловалар билан ишлаш.docx` and `APPENDIX_…docx` and adapt their worked examples **from the fitness sample to EduMetric CRM**.
| Appendix | Content | How to build |
|---|---|---|
| **A — Project Proposal (approved)** | text | Adapt the proposal outline (topic, problem, aim, objectives, expected outcomes, system overview, users, technologies) to EduMetric CRM. Text only. |
| **B — Full Gantt Chart** | chart | Full-resolution version of Fig 3.2 (the 24-week xlsx). |
| **C — Risk Register (full)** | table | Full R01–R10 with contingency & owner columns (xlsx). |
| **D — Ethics Approval & Consent** | text | Adapt the ethics/consent text from the appendix docx to EduMetric (synthetic/anonymised academic data; GDPR-aligned; right to withdraw). Text only. `⟨STUDENT INPUT: signature/date⟩`. |
| **E — Data Collection Instruments** | text | The artefact-derivation instruments: BPMN modelling checklist, traceability template, the test-case template. Text only. |
| **F — Raw / Anonymised Data Extracts** | table | A small anonymised `student_metrics` / `metric_snapshots` extract (no identifiers) used to validate analytics — like the appendix's "User Code" table, adapted to EduMetric dimensions. |
| **G — Project Logbook / Reflective Journal** | text | Dated entries (decision → problem → resolution), mirroring the appendix's logbook table. `⟨STUDENT INPUT: real dates⟩`. |
| **H — Supervisor Meeting Records** | text | Meeting table (date / agenda / decisions / actions). `⟨STUDENT INPUT⟩`. |
| **I — Assessment-Criteria Mapping** | table | **Table I.1** — copy the BTEC P1–P7 / M1–M5 / D1–D4 matrix from the template, fill the "Evidenced in Section" column from this project. |
| **J — UI Screenshots / Prototype Screens** | screenshots | The 10 placeholder blocks (Fig J.1–J.10, §E.4) with real routes and required-elements. |
| **K — Testing Documents & Evaluation Evidence** | tables + screenshots | **Table K.1** test-case results (TC-AUTH/ATT/EVAL/ANA/RISK/ADMIN from the xlsx) + functional/UAT results + bug-fix evidence + test-result screenshot placeholders. |
**Done when:** A–K all present; text-only appendices fully written from the source docs; J/K placeholders precise.

---

### Phase 11 — Cross-linking & appendix integration
**Goal:** wire appendices into the main text using the **exact sentences** from `APPENDIX_…docx`.
**Insert verbatim (English) at:** §3.9 (Appendix J), §5.3 & §5.4 & §5.5 (Appendix K; J in 5.5), §6.2 (J & K). Add "see Appendix X" references for A (§1.3/1.4), B (§3.4.2), C (§3.6), D (§3.7), E (§4.1), F (§4.2/4.3), G (§3.8/Ch7), H (§3.8/Ch7), I (end).
**Also:** resolve every figure/table cross-reference so each asset is named in the body before it appears.
**Done when:** no orphan appendix and no unreferenced figure/table remain.

---

### Phase 12 — Lists, references & consistency pass
**Goal:** finalise the navigational & reference apparatus.
**Produce:** build **List of Figures** and **List of Tables** in `00-front-matter.md` from `ASSET_REGISTRY.md`; finalise List of Abbreviations; sort `90-references.md` alphabetically (Harvard, hanging indent) and verify every in-text citation resolves; run a **terminology audit** against Part B/§C.5 (fixed terms, British spelling, no scope drift) — this directly closes risks **R02** and **R10** from the register.
**Done when:** all lists are populated and the consistency audit passes.

---

### Phase 13 — Abstract, BTEC self-check & assembly to .docx
**Goal:** finish and export.
**Produce:**
1. **Abstract** (200–300 words, one page, no citations/figures): context & problem → aim → methodology → key findings → conclusion/contribution; + 4–6 keywords (e.g. *BPMN; software engineering; requirements traceability; information systems; education analytics; modular monolith*). Write it **now, last**.
2. **BTEC self-check:** complete the Appendix I matrix — confirm P1–P7, M1–M5, D1–D4 are each evidenced; list any gap. (Pass needs all P; Merit all P+M; Distinction all P+M+D.)
3. **Word-count check** per chapter against Part G targets.
4. **Assembly:** concatenate `00 → 91` in order and **convert to `EduMetric_Dissertation.docx`** matching `BTEC_L6_Unit2_Independent_Project_Template (2).docx` (headings, numbering, Harvard, page breaks before each appendix). Use the **`docx` skill** (or pandoc with the template as reference-doc). Leave the real `.bpmn`/screenshot image insertions as the captioned placeholders for the student to drop into `_assets/` and re-export.
**Done when:** `EduMetric_Dissertation.docx` exists, the BTEC matrix is fully ticked or gaps are listed, and the only open items are `⟨STUDENT INPUT⟩` placeholders (screenshots, signatures, personal dates).

---

# Part H — Final QA gate (run before treating the diploma as done)

- [ ] Every locked statement (thesis, aim, RQ1–RQ4) appears verbatim and is never contradicted.
- [ ] All 6 BPMN processes have: BPMN diagram + requirement + module + entity + endpoint + test evidence (full traceability).
- [ ] Diagrams present: conceptual framework, WBS, C4 ×2, component map, deployment, ERD, 6× BPMN, 4× sequence, security chain.
- [ ] Charts present: Gantt, risk heat-map, complexity bar, coverage bar, RAG, test pass-rate, growth radar, trend line.
- [ ] Screenshots: every Appendix J/K and §3.8/3.9 image is a precise placeholder with a real route — none fabricated.
- [ ] Appendices A–K complete; text-only appendices (A, D, E, G, H) written from the source docs.
- [ ] Appendix J/K linking sentences inserted verbatim at §3.9, §5.3, §5.4, §5.5, §6.2.
- [ ] References ≥25, Harvard, all in-text citations resolve; British spelling throughout.
- [ ] Terminology audit clean (fixed terms; no business-process-reengineering drift) — R02 & R10 closed.
- [ ] Tables 4.1–4.7 and risk register R01–R10 match the xlsx exactly.
- [ ] BTEC Appendix I matrix: all P/M/D criteria evidenced.
- [ ] `EduMetric_Dissertation.docx` assembled and matches the template.
- [ ] Only open items are `⟨STUDENT INPUT⟩` placeholders.

---

*This file is the build contract for the diploma. If a phase's output disagrees with Part B, fix the
output — never the locked context.*
