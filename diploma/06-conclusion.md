# Chapter 6 — Conclusion and Recommendations

*Contributes to **LO3 — P6** (drawing valid conclusions) **| M5**; final criteria mapping confirmed in Appendix I.*

## 6.1 Summary of the Project

This project set out to design, develop and evaluate **EduMetric**, a web-based, multi-dimensional
student performance analytics system intended to improve the transparency, accuracy and accessibility
of student evaluation, attendance management and early at-risk identification in educational
institutions. The work proceeded from a problem rooted in everyday institutional practice — that a
single grade-point average hides the dimensions that matter for timely support — to a working
full-stack artefact that replaces that single number with a transparent, configurable **composite
score** computed across seven weighted dimensions, alongside a **growth trend** and an **at-risk
detection** signal. The system was built as a three-tier **modular monolith**: a Next.js/React
frontend, a Java Spring Boot REST backend and a PostgreSQL database. The investigation was framed by a
pragmatist, design-science methodology (Hevner *et al.*, 2004; Peffers *et al.*, 2007) in which the
constructed system, its requirements-to-test traceability chain and its functional and
user-acceptance test results were the unit of inquiry. The central conclusion is that a transparent,
rule-based information system can deliver multi-dimensional student analytics that are both auditable
and locally deployable, derived rigorously from process models and requirements rather than asserted.

## 6.2 Achievement of Objectives

Each of the five objectives set in §1.4 was addressed, with its outcome and supporting evidence as
follows.

| # | Objective | Outcome | Evidence |
|---|---|---|---|
| 1 | Review the literature on learning analytics, educational information systems, multi-dimensional assessment, web architecture and data security (≥25 sources) | **Met** — six thematic strands synthesised from 32 sources, converging on the transparency gap | Chapter 2; References (≥25) |
| 2 | Analyse and specify the functional and non-functional requirements of a transparent multi-dimensional student-evaluation system | **Met** — requirements derived from the problem domain and the EduMetric product master document | §4.3.1 (Table 4.0); Chapter 4 |
| 3 | Design the architecture, the PostgreSQL data model, the six core process models and the role-secured REST API | **Met** — C4 architecture, ERD, six process models and the REST/RBAC design specified to industry standards | §4.3.2–§4.3.6 (Fig 4.1–4.15; Tables 4.1–4.7) |
| 4 | Develop a full-stack web prototype implementing the core modules | **Met** — authentication, attendance, evaluation (metrics engine), analytics, at-risk detection and admin monitoring implemented and traced to code | Chapter 4; Appendix J |
| 5 | Evaluate the system through functional and user-acceptance testing and a structured effectiveness assessment | **Partially met** — RQ1–RQ4 answered, 30 documented test cases and a RAG effectiveness assessment completed; evaluation is bounded to a single artefact-based study (§5.6) | §5.1, §5.5, §5.6; Appendix K |

Objectives 1–4 are fully met: the literature foundation, the requirements specification, the complete
set of design artefacts and the working implementation are all present and internally traceable.
Objective 5 is marked *partially met* because, while functional testing, the user-acceptance scenarios
and the RAG effectiveness assessment were all completed and the four research questions answered, the
evaluation is by design bounded to a single-system, artefact-based study without live institutional
trials or human-subject data (§1.7, §5.6); its external validity therefore remains for future work.
The implemented interface evidencing these outcomes is provided in Appendix J, and the functional and
validation evidence in Appendix K.

The objective related to system development was achieved through the implementation of the main
application modules. Evidence of the developed interface is shown in Appendix J, and evidence of
functional testing is provided in Appendix K.

## 6.3 Contribution to Knowledge and Practice

The project makes three complementary contributions. First, it delivers a **transparent, configurable
multi-dimensional student-analytics artefact**: EduMetric computes a composite score from seven
auditable, re-weightable dimensions rather than a black-box prediction, demonstrating that decisions
affecting a student's standing can be made explainable without sacrificing analytical depth (Slade and
Prinsloo, 2013). Second, it offers a **fully traceable, open-source reference implementation** — built
entirely on Next.js, Spring Boot and PostgreSQL and deployable as a single modular monolith — in which
every core process is traced through a fixed pathway from requirement to architecture module, database
entity, API endpoint and test evidence, giving institutions a worked, cost-effective pattern they can
adopt without commercial subscriptions. Third, it contributes the **design method** itself: a
disciplined, design-science process that combines process modelling (in BPMN 2.0), C4 architecture
diagrams, an ERD, UML sequence diagrams and a role-secured REST API specification into a coherent,
verifiable engineering chain. Together these address the gap identified in §2.5 — the path from process
intent to validated, transparent software is demonstrated end to end, not merely proposed.

## 6.4 Recommendations

### 6.4.1 For Practitioners and Industry

1. **Prefer transparent, configurable scoring over black-box prediction.** Institutions adopting
   analytics should favour a composite model whose dimensions and weights are visible and adjustable,
   so that staff, students and parents can understand and trust the basis of any decision, and so the
   model can be tuned to local pedagogy.
2. **Maintain a fixed traceability pathway in version control.** Small teams gain most of the project's
   engineering benefit at low cost by committing to a single, explicit process → requirement → module →
   entity → endpoint → test chain held alongside the code, so that divergence between design and
   implementation is surfaced early.
3. **Treat the modular monolith as a sensible default.** For a single institution, a well-structured
   three-tier modular monolith on open-source technologies delivers the required functionality and
   security without the operational cost of a distributed architecture.

### 6.4.2 For Future Researchers

1. **Test external validity** by deploying the system in live institutional settings and evaluating it
   with real users, extending the bounded, artefact-based evaluation of this study (§5.6).
2. **Validate the composite-score formula empirically** against longitudinal outcomes, calibrating the
   default weights and at-risk thresholds across different cohorts and disciplines.
3. **Investigate hybrid scoring**, comparing the transparent rule-based model against, or in
   combination with, predictive techniques to assess any trade-off between explainability and
   predictive accuracy.

## 6.5 Closing Remarks

EduMetric set out to replace a single opaque number with a transparent, multi-dimensional view of
student growth. This dissertation has shown that the same value of transparency applies to the
*engineering* of such a system: when requirements and processes are modelled deliberately and traced
into code, the relationship between what was intended, what was designed and what was built becomes
visible and auditable. The result is a working, locally deployable analytics platform whose every
score can be explained and whose every feature can be followed back to a requirement — evidence that a
fair, intelligible alternative to black-box student evaluation is not only desirable but practical to
build.
