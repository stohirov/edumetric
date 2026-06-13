<!--
FRONT MATTER — reframed (system build/evaluate framing per REFRAME_BRIEF.md).
List of Figures / List of Tables mirror ASSET_REGISTRY.md (retitled per REFRAME_BRIEF §F).
Page breaks (one per section) are applied at .docx assembly.
-->

<div align="center">

**PDP UNIVERSITY**
Faculty of Business Information Technology
Tashkent, Uzbekistan

**INDEPENDENT PROJECT**
Pearson BTEC Level 6 Diploma in Digital Technologies
Unit 2 — Unit Code: 70726U — Credit Value: 30

---

# EduMetric
### A Web-Based Multi-Dimensional Student Performance Analytics System
*Design, Development and Evaluation of a Transparent Composite-Score Platform for Educational Institutions*

---

</div>

| | |
|---|---|
| **Student Name:** | ⟨STUDENT INPUT: Full Name⟩ |
| **Student ID:** | ⟨STUDENT INPUT: ID Number⟩ |
| **Programme / Group:** | ⟨STUDENT INPUT: BIT — Group Name⟩ |
| **Project Format:** | Thesis-style ☐    Capstone-style ☒ |
| **Supervisor:** | ⟨STUDENT INPUT: Supervisor Full Name⟩ |
| **Submission Date:** | ⟨STUDENT INPUT: Day Month Year⟩ |
| **Word Count:** | ⟨STUDENT INPUT: XXXX words⟩ |

<div align="center">

Submitted in partial fulfilment of the requirements for the
Bachelor's Degree in Business Information Technology
Academic Year ⟨STUDENT INPUT: 20XX–20XX⟩

</div>

<!-- PAGE BREAK -->

## Declaration of Originality

I hereby declare that this Independent Project, submitted in partial fulfilment of the requirements
for the Pearson BTEC Level 6 Diploma in Digital Technologies and the Bachelor's Degree in Business
Information Technology at PDP University, is the result of my own original work.

I confirm that:

- All sources of information, data and ideas drawn from other authors have been fully acknowledged
  through accurate in-text citations and a complete reference list using the Harvard (author–date)
  referencing system.
- This work has not been previously submitted, in whole or in part, for any other academic award at
  this or any other institution.
- All research activities involving human participants have been conducted in compliance with the
  institutional ethics procedures of PDP University and applicable data-protection regulations. This
  project did **not** collect data from human participants; it designs, builds and evaluates a software
  system using design artefacts, functional and user-acceptance testing, and synthetic/anonymised
  academic records (see §3.7 and Appendix D).
- I understand that any breach of academic integrity, including plagiarism, fabrication of data or
  unauthorised collaboration, may result in the withdrawal of this submission and disciplinary action.

| | |
|---|---|
| **Signature:** | ⟨STUDENT INPUT: signature⟩ |
| **Date:** | ⟨STUDENT INPUT: date⟩ |

<!-- PAGE BREAK -->

## Acknowledgements

I would like to express my sincere gratitude to my supervisor, ⟨STUDENT INPUT: Supervisor Name⟩, for
their continuous guidance, constructive feedback and encouragement throughout the duration of this
project. Their insistence on grounding every design decision in the real system kept the work honest
and focused.

I am also grateful to the Faculty of Business Information Technology at PDP University for providing
the academic foundation and resources that made this work possible, and to my peers on the EduMetric
development effort, whose questions about the metrics engine and the synchronous-recompute design
sharpened my understanding of how a requirement becomes working software.

Finally, I extend my heartfelt thanks to my family and friends, ⟨STUDENT INPUT: optional personal
names⟩, whose support has been instrumental during every stage of my Bachelor's studies.

<!-- PAGE BREAK -->

## Abstract

The digitalisation of education has produced systems that record grades but rarely explain how a
student is developing. Single grade-point averages collapse attendance, practical performance,
behaviour and engagement into one number, hiding declining trajectories until it is too late to
intervene. This project presents the design, development and evaluation of **EduMetric**, a web-based,
multi-dimensional student performance analytics system that replaces the single grade-point average
with a transparent **composite score** computed across grades, attendance, practical work, behaviour
and activity, complemented by growth and consistency bonuses, a **growth trend** and an **at-risk
detection** signal. A pragmatist, design-science methodology was adopted: functional and
non-functional requirements were elicited from the problem domain and a product master document; the
system architecture (a three-tier **modular monolith**), the PostgreSQL data model and a role-secured
REST API were designed; and a full-stack prototype was implemented using Next.js/React, Java Spring
Boot and PostgreSQL. Six core processes — authentication, attendance management, student evaluation,
analytics generation, at-risk detection and administrative monitoring — were modelled and traced
end-to-end into architecture modules, database entities, API endpoints and validation evidence, with
every link verified against the shipped codebase. Evaluation combined functional and user-acceptance
testing with a structured effectiveness assessment rather than human-subject data collection. The
system demonstrated that a transparent, configurable scoring model, synchronous recomputation and
strict role-based access control can deliver accurate, explainable and accessible student evaluation
without resorting to black-box prediction. The project concludes that a modular, role-aware analytics
platform meaningfully addresses the limitations of single-number grading, and contributes a fully
traceable, open-source reference implementation together with recommendations for practitioners and
future researchers.

**Keywords:** student analytics; learning analytics; composite score; transparent evaluation; web
information system; role-based access control; Spring Boot; PostgreSQL.

<!-- PAGE BREAK -->

## Table of Contents

> *Auto-generated at .docx assembly. Structure below mirrors the BTEC template and the chapter files
> in this folder. Page numbers populate on field update in Word.*

- Declaration of Originality
- Acknowledgements
- Abstract
- Table of Contents
- List of Figures
- List of Tables
- List of Abbreviations
- **Chapter 1 — Introduction**
  - 1.1 Background and Context · 1.2 Problem Statement · 1.3 Project Aim · 1.4 Project Objectives ·
    1.5 Research Questions · 1.6 Significance of the Project · 1.7 Scope and Limitations · 1.8 Structure of the Report
- **Chapter 2 — Literature Review**
  - 2.1 Introduction and Search Strategy · 2.2 Theoretical Framework · 2.3 Thematic Review ·
    2.4 Industry / Practice Review · 2.5 Identification of the Gap · 2.6 Conceptual Framework · 2.7 Summary
- **Chapter 3 — Project Planning and Methodology**
  - 3.1 Research Philosophy and Approach · 3.2 Methodological Choice · 3.3 Project Management Methodology ·
    3.4 Project Plan (WBS · Gantt · Milestones) · 3.5 Resource Planning · 3.6 Risk Register ·
    3.7 Ethical Considerations · 3.8 Project Tracking and Documentation · 3.9 Implementation of the Plan ·
    3.10 Critical Assessment of Project Management
- **Chapter 4 — System Analysis, Design and Implementation**
  - 4.1 Method · 4.2 Analytical Techniques · 4.3 Findings (requirements · architecture · data model ·
    six core processes P1–P6 · security · key interactions) · 4.4 Comparison of Patterns
- **Chapter 5 — Discussion**
  - 5.1 Interpretation of Findings · 5.2 Comparison with the Literature · 5.3 Validity · 5.4 Reliability ·
    5.5 Project Effectiveness Evaluation · 5.6 Limitations · 5.7 Implications
- **Chapter 6 — Conclusion and Recommendations**
  - 6.1 Summary · 6.2 Achievement of Objectives · 6.3 Contribution · 6.4 Recommendations · 6.5 Closing Remarks
- **Chapter 7 — Reflective Evaluation**
  - 7.1 Reflective Model · 7.2 Reflection through Gibbs · 7.3 SWOT · 7.4 Transferable Skills · 7.5 Future Development Plan
- References
- Appendices A–K

<!-- PAGE BREAK -->

## List of Figures

> *Page numbers populate at .docx assembly.*

| Figure | Title |
|---|---|
| 2.1 | Conceptual framework: from process intent to a validated student-analytics system |
| 3.1 | Work Breakdown Structure |
| 3.2 | Project Gantt chart (24 weeks, 6 phases) |
| 3.3 | Risk heat-map (Probability × Impact, R01–R10) |
| 3.4 | Project-tracking tool *(screenshot — student-supplied)* |
| 4.1–4.4 | C4 context · C4 container · component/module map · deployment |
| 4.5 | Entity-Relationship Diagram (full schema) |
| 4.6–4.11 | Process models — P1 Authentication · P2 Attendance · P3 Evaluation · P4 Analytics · P5 At-Risk · P6 Admin |
| 4.12–4.15 | Sequences — login · bulk-attendance recompute · dashboard composition · security filter chain |
| 4.16–4.17 | Process-complexity comparison · requirement→artefact coverage |
| 5.1–5.4 | Objectives RAG · test pass-rate · growth radar · growth trend |
| J.1–J.10 | UI screenshots *(student-supplied — see Appendix J)* |

<!-- PAGE BREAK -->

## List of Tables

> *Page numbers populate at .docx assembly.*

| Table | Title |
|---|---|
| 3.1 | Milestones and critical path |
| 3.2 | Resource plan |
| 3.3 | Risk register (R01–R10) |
| 4.0 | Artefact inventory of EduMetric |
| 4.1–4.6 | Per-process traceability matrices (P1–P6) |
| 4.7 | Process → architecture module mapping |
| 5.1 | Project effectiveness evaluation (RAG) |
| C.1 | Risk register (full, with owner and contingency) |
| F.1–F.2 | Anonymised `student_metrics` / `metric_snapshots` extracts |
| I.1 | BTEC assessment-criteria mapping |
| K.1 | Test-case results (TC-AUTH-01 … TC-ADMIN-05) |

<!-- PAGE BREAK -->

## List of Abbreviations

| Abbreviation | Expansion |
|---|---|
| API | Application Programming Interface |
| BCrypt | Blowfish-based password-hashing function |
| BPMN | Business Process Model and Notation |
| BTEC | Business and Technology Education Council |
| C4 | Context, Containers, Components, Code (architecture model) |
| CRM | Customer / Constituent Relationship Management |
| CRUD | Create, Read, Update, Delete |
| CSRF | Cross-Site Request Forgery |
| DTO | Data Transfer Object |
| ERD | Entity-Relationship Diagram |
| GDPR | General Data Protection Regulation |
| GPA | Grade-Point Average |
| HS256 | HMAC-SHA-256 (JWT signing algorithm) |
| HTTP | Hypertext Transfer Protocol |
| ISSM | Information Systems Success Model |
| JPA | Jakarta Persistence API |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| LMS | Learning Management System |
| LO | Learning Outcome (BTEC) |
| MFA | Multi-Factor Authentication |
| ORM | Object-Relational Mapping |
| P / M / D | Pass / Merit / Distinction (BTEC criteria) |
| RAG | Red–Amber–Green (status rating) |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RQ | Research Question |
| SIS | Student Information System |
| SMART | Specific, Measurable, Achievable, Relevant, Time-bound |
| SQL | Structured Query Language |
| SSR | Server-Side Rendering |
| SWOT | Strengths, Weaknesses, Opportunities, Threats |
| TAM | Technology Acceptance Model |
| TTL | Time To Live (cache) |
| UAT | User Acceptance Testing |
| UI / UX | User Interface / User Experience |
| UML | Unified Modeling Language |
| VPS | Virtual Private Server |
| WBS | Work Breakdown Structure |
