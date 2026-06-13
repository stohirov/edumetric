# ASSET_REGISTRY.md — Live index of every figure, table, diagram, chart & screenshot

> Single source for the List of Figures / List of Tables (built in Phase 12). Each phase updates the
> **Status** as it creates assets: `todo` → `drafted` (Mermaid/placeholder in chapter) →
> `final` (image exported to `_assets/` by the student, where applicable).
> Seeded in Phase 0 from `DOCUMENTATION.md` Part E.

Legend: **Status** = `todo` · `drafted` · `final` — **Owner** = author / `⟨STUDENT INPUT⟩` (image).

---

## Diagrams (Requirement 1)

| ID | Title | Type | Chapter | Status |
|---|---|---|---|---|
| Fig 2.1 | Conceptual framework: BPMN as a bridge from process intent to artefacts | Mermaid flowchart | 2 | drafted |
| Fig 3.1 | Work Breakdown Structure | Mermaid tree | 3 | drafted |
| Fig 4.1 | C4 Level 1 — System context | Mermaid | 4 | drafted |
| Fig 4.2 | C4 Level 2 — Container diagram | Mermaid | 4 | drafted |
| Fig 4.3 | Component / module map (bounded contexts) | Mermaid subgraphs | 4 | drafted |
| Fig 4.4 | Deployment diagram (docker-compose / VPS / nginx) | Mermaid | 4 | drafted |
| Fig 4.5 | ERD — core schema, clustered by sub-domain | Mermaid erDiagram | 4 | drafted |
| Fig 4.6 | BPMN — P1 User Authentication | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.7 | BPMN — P2 Attendance Management | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.8 | BPMN — P3 Student Evaluation | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.9 | BPMN — P4 Student Analytics Generation | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.10 | BPMN — P5 At-Risk Student Detection | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.11 | BPMN — P6 Admin Monitoring | BPMN placeholder + Mermaid | 4 | drafted |
| Fig 4.12 | Sequence — login & JWT issuance | Mermaid sequence | 4 | drafted |
| Fig 4.13 | Sequence — bulk attendance → synchronous recompute | Mermaid sequence | 4 | drafted |
| Fig 4.14 | Sequence — student dashboard composition (the "wow endpoint") | Mermaid sequence | 4 | drafted |
| Fig 4.15 | Security filter chain | Mermaid flowchart | 4 | drafted |

## Charts (Requirement 2)

| ID | Title | Chart type | Chapter | Status |
|---|---|---|---|---|
| Fig 3.2 | Project Gantt chart (24 weeks, 6 phases) | Mermaid `gantt` (mirror xlsx) | 3 | drafted |
| Fig 3.3 | Risk heat-map (Probability × Impact, R01–R10) | matrix/grid | 3 | drafted |
| Fig 4.16 | BPMN element / process-complexity comparison | bar chart | 4 | drafted |
| Fig 4.17 | Process → artefact coverage (modules/entities/endpoints per process) | stacked bar | 4 | drafted |
| Fig 5.1 | Project effectiveness — objectives RAG status | RAG bar | 5 | drafted |
| Fig 5.2 | Test outcomes — pass rate across the test suite | donut / bar | 5 | drafted |
| Fig 5.3 | Student growth profile — composite-score radar (6 dimensions) | radar | 5 | drafted (sample data; reproduce in app) |
| Fig 5.4 | Growth trend over snapshots (`metric_snapshots`) | line chart | 5 | drafted |

## Tables

| ID | Title | Source | Status |
|---|---|---|---|
| Table 3.1 | Milestones & critical path | template + Gantt | drafted |
| Table 3.2 | Resource plan | author | drafted |
| Table 3.3 | Risk register (R01–R10) | **xlsx — reuse exactly** | drafted |
| Table 4.0 | Artefact inventory of EduMetric CRM | author (source inspection) | drafted |
| Table 4.1 | P1 User Authentication — traceability matrix | xlsx + Chapter4_Revised (endpoints reconciled to code) | drafted |
| Table 4.2 | P2 Attendance Management — traceability matrix | xlsx + Chapter4_Revised (reconciled) | drafted |
| Table 4.3 | P3 Student Evaluation — traceability matrix | xlsx + Chapter4_Revised (reconciled) | drafted |
| Table 4.4 | P4 Student Analytics Generation — traceability matrix | xlsx + Chapter4_Revised (reconciled) | drafted |
| Table 4.5 | P5 At-Risk Student Detection — traceability matrix | xlsx + Chapter4_Revised (reconciled) | drafted |
| Table 4.6 | P6 Admin Monitoring — traceability matrix | xlsx + Chapter4_Revised (reconciled) | drafted |
| Table 4.7 | BPMN process → architecture module mapping | Chapter4_Revised (reconciled to package names) | drafted |
| Table 5.1 | Project effectiveness evaluation (RAG) | author | drafted |
| Table C.1 | Risk register (full, with owner & contingency) | xlsx | drafted |
| Table F.1 | Anonymised `student_metrics` extract | author (synthetic) | drafted |
| Table F.2 | Anonymised `metric_snapshots` extract | author (synthetic) | drafted |
| Table I.1 | BTEC assessment-criteria mapping | template Appendix I | drafted (filled) |
| Table K.1 | Test case results (TC-AUTH-01 … TC-ADMIN-05, 30 cases) | xlsx traceability test column | drafted |

## Screenshots (Requirement 3 — placeholders only; student supplies images)

| ID | Screen | Route | Status |
|---|---|---|---|
| Fig J.1 | Login / authentication | `/(auth)/login` | placeholder (⟨STUDENT INPUT⟩) |
| Fig J.2 | Student growth dashboard | `/student` | todo (⟨STUDENT INPUT⟩) |
| Fig J.3 | Student progress / growth detail | `/student/growth`, `/student/progress` | todo (⟨STUDENT INPUT⟩) |
| Fig J.4 | Teacher attendance (quick-mark) | `/teacher/attendance` | todo (⟨STUDENT INPUT⟩) |
| Fig J.5 | Teacher grades / gradebook | `/teacher/grades` | todo (⟨STUDENT INPUT⟩) |
| Fig J.6 | Admin formula configuration | `/admin/formula` | todo (⟨STUDENT INPUT⟩) |
| Fig J.7 | Admin org dashboard | `/admin` | todo (⟨STUDENT INPUT⟩) |
| Fig J.8 | At-risk students list | `/teacher/at-risk` (or `/admin/at-risk`) | todo (⟨STUDENT INPUT⟩) |
| Fig J.9 | Analytics dashboard | `/analytics` | todo (⟨STUDENT INPUT⟩) |
| Fig J.10 | Student transcript / certificates | `/student/transcript`, `/student/certificates` | todo (⟨STUDENT INPUT⟩) |
| Fig 3.4 | Project-tracking tool screenshot (§3.8) | external PM tool | todo (⟨STUDENT INPUT⟩) |
| App K | Test-result screenshots | test runner / Postman | todo (⟨STUDENT INPUT⟩) |
