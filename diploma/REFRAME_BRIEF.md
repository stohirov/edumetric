# REFRAME_BRIEF.md — Locked spine for the reframed EduMetric diploma

> **Why this file exists.** The diploma was first drafted as a study *about BPMN notation* with
> EduMetric as a case study. The student has decided to **reframe it as a conventional
> "design, develop and evaluate the system" dissertation** — the same shape as the attached BTEC
> exemplar (Asadbek Abdinazarov, *Employee Management System / NexusHR*). **EduMetric itself is now the
> subject of the project; process modelling (BPMN) is just one of several design techniques used.**
>
> Every chapter rewrite obeys this file. Where a chapter file disagrees with this brief, fix the
> chapter — never this brief. The technical evidence base remains `FACTS.md` (unchanged, still true).

---

## A. New project identity (LOCKED — use verbatim)

| Field | Value |
|---|---|
| Project title | **EduMetric — A Web-Based Multi-Dimensional Student Performance Analytics System** |
| Subtitle | *Design, Development and Evaluation of a Transparent Composite-Score Platform for Educational Institutions* |
| Qualification | Pearson **BTEC Level 6** Diploma in Digital Technologies, **Unit 2 — Independent Project** (Code 70726U, 30 credits) |
| Institution | **PDP University**, Faculty of Business Information Technology, Tashkent |
| Project format | **Capstone-style** (a build-and-evaluate software project) |
| Methodology | **Pragmatist + design science** (Hevner *et al.*, 2004; Peffers *et al.*, 2007). **No human-subject data** — evidence = the built artefacts, the requirements-to-test traceability chain, and functional/UAT test results. |
| Target grade | **Distinction** — every analytical paragraph = *argument + evidence + engineering conclusion*. |

**Locked aim**
> To design, develop and evaluate a web-based, multi-dimensional student performance analytics system
> that improves the transparency, accuracy and accessibility of student evaluation, attendance
> management and early at-risk identification in educational institutions.

**Locked objectives (SMART)** — keep these five, in this order:
1. **Review** the literature on learning analytics, educational information systems, multi-dimensional
   assessment, web-application architecture and data security, synthesising ≥25 quality sources, to
   establish the theoretical foundation *(Chapter 2)*.
2. **Analyse and specify** the functional and non-functional requirements of a transparent
   multi-dimensional student-evaluation system, derived from the problem domain and the EduMetric
   product master document *(Chapter 4)*.
3. **Design** the system architecture (a three-tier modular monolith), the PostgreSQL data model
   (ERD), the six core process models and the role-secured REST API in line with industry best
   practice *(Chapter 4)*.
4. **Develop** a full-stack web prototype — Next.js/React/TypeScript frontend, Java Spring Boot
   backend, PostgreSQL — implementing the core modules: authentication, attendance, evaluation (the
   metrics engine), student analytics, at-risk detection and admin monitoring *(Chapter 4)*.
5. **Evaluate** the system through functional and user-acceptance testing and a structured
   effectiveness assessment, producing evidence-based recommendations *(Chapters 5–6, Appendix K)*.

**Locked research questions** — system-focused, NOT BPMN-focused:
- **RQ1** — What limitations in current student-evaluation and management processes can a web-based
  information system address?
- **RQ2** — What functional modules and data model are required for a transparent, multi-dimensional
  student performance analytics system?
- **RQ3** — How can a web-based system improve the transparency, accuracy and accessibility of student
  evaluation, attendance management and at-risk detection?
- **RQ4** — How should security, privacy and role-based access control be implemented to protect
  sensitive student data?

---

## B. Reframe principle (the no-contradiction rule)

1. **EduMetric is the subject.** The thesis is "we designed, built and evaluated EduMetric." It is
   **not** "we studied BPMN." Never make BPMN the end goal or the object of study.
2. **BPMN is one design technique among several.** Process models (drawn in BPMN 2.0) sit alongside
   **C4 architecture diagrams, an ERD, UML sequence diagrams and the REST API spec** as the system's
   design artefacts. Mention BPMN as "the notation chosen to model the six core processes," then move
   on. Do **not** spend paragraphs arguing BPMN's merits as a research topic.
3. **Keep all real technical content.** Every module, entity, endpoint, changeset, test ID, formula,
   weight and diagram in the existing chapters stays. Reuse the traceability matrices (Tables 4.1–4.7),
   the risk register (R01–R10, reworded per §G), the Gantt, and the test cases (TC-*) **exactly** —
   only the surrounding narrative changes.
4. **Honest evidence.** No surveys, interviews, usability n-counts or satisfaction scores. Evaluation
   = functional testing + UAT-style scenarios + a RAG effectiveness assessment + the artefact itself.
   Never fabricate human-subject data. Mark genuine personal/human input as `⟨STUDENT INPUT: …⟩`.
5. **Terminology is fixed** (§C). **British spelling in prose; code identifiers quoted verbatim**
   (package `behavior/`, entity `BehaviorRecord`, endpoint `POST /api/behavior` keep American spelling).

---

## C. Fixed terminology (do not rename between chapters)

*composite score* · *growth trend* · *at-risk detection* · *student analytics* · *attendance
management* · *metrics engine* · *modular monolith* · *three-tier architecture* · *transparent /
configurable scoring* · `student_metrics` · `metric_snapshots` · `formula_config`.

British spelling in prose: behaviour, optimise, modelling, analyse, programme, organisation. Code
identifiers verbatim. The seven scored dimensions are: **grades, attendance, practical, behaviour,
activity, growth bonus, consistency bonus**, default weights **0.25 / 0.15 / 0.25 / 0.10 / 0.10 /
0.10 / 0.05** (sum = 1.0).

---

## D. Master bibliography (cite ONLY from this list; Harvard author–date)

Every in-text citation must resolve to one of these. The references agent reproduces this list,
alphabetised, in `90-references.md`. Add a new source only if genuinely needed and clearly real.

1. Arnold, K.E. and Pistilli, M.D. (2012) 'Course Signals at Purdue: using learning analytics to increase student success', *Proceedings of the 2nd International Conference on Learning Analytics and Knowledge (LAK '12)*, pp. 267–270.
2. Bass, L., Clements, P. and Kazman, R. (2012) *Software Architecture in Practice*. 3rd edn. Upper Saddle River, NJ: Addison-Wesley.
3. Beck, K. *et al.* (2001) *Manifesto for Agile Software Development*. Available at: https://agilemanifesto.org/ (Accessed: 13 June 2026).
4. Bell, J. and Waters, S. (2018) *Doing Your Research Project: A Guide for First-Time Researchers*. 7th edn. London: Open University Press.
5. Connolly, T. and Begg, C. (2015) *Database Systems: A Practical Approach to Design, Implementation, and Management*. 6th edn. Harlow: Pearson Education.
6. Davis, F.D. (1989) 'Perceived usefulness, perceived ease of use, and user acceptance of information technology', *MIS Quarterly*, 13(3), pp. 319–340.
7. DeLone, W.H. and McLean, E.R. (2003) 'The DeLone and McLean model of information systems success: a ten-year update', *Journal of Management Information Systems*, 19(4), pp. 9–30.
8. Dumas, M., La Rosa, M., Mendling, J. and Reijers, H.A. (2018) *Fundamentals of Business Process Management*. 2nd edn. Berlin: Springer.
9. European Parliament and Council of the European Union (2016) *Regulation (EU) 2016/679 (General Data Protection Regulation)*. Official Journal of the European Union, L119, pp. 1–88.
10. Ferguson, R. (2012) 'Learning analytics: drivers, developments and challenges', *International Journal of Technology Enhanced Learning*, 4(5/6), pp. 304–317.
11. Fielding, R.T. (2000) *Architectural Styles and the Design of Network-based Software Architectures*. PhD thesis. University of California, Irvine.
12. Fowler, M. (2002) *Patterns of Enterprise Application Architecture*. Boston, MA: Addison-Wesley.
13. Gibbs, G. (1988) *Learning by Doing: A Guide to Teaching and Learning Methods*. Oxford: Further Education Unit, Oxford Polytechnic.
14. Hevner, A.R., March, S.T., Park, J. and Ram, S. (2004) 'Design science in information systems research', *MIS Quarterly*, 28(1), pp. 75–105.
15. Macfadyen, L.P. and Dawson, S. (2010) 'Mining LMS data to develop an "early warning system" for educators: a proof of concept', *Computers & Education*, 54(2), pp. 588–599.
16. Newman, S. (2015) *Building Microservices: Designing Fine-Grained Systems*. Sebastopol, CA: O'Reilly Media.
17. Oates, B.J. (2006) *Researching Information Systems and Computing*. London: Sage.
18. Object Management Group (2011) *Business Process Model and Notation (BPMN) Version 2.0*. Needham, MA: Object Management Group. Available at: https://www.omg.org/spec/BPMN/2.0/ (Accessed: 13 June 2026).
19. OpenAPI Initiative (2021) *OpenAPI Specification v3.1.0*. The Linux Foundation. Available at: https://spec.openapis.org/oas/v3.1.0 (Accessed: 13 June 2026).
20. Peffers, K., Tuunanen, T., Rothenberger, M.A. and Chatterjee, S. (2007) 'A design science research methodology for information systems research', *Journal of Management Information Systems*, 24(3), pp. 45–77.
21. Pohl, K. (2010) *Requirements Engineering: Fundamentals, Principles, and Techniques*. Berlin: Springer.
22. Richards, M. and Ford, N. (2020) *Fundamentals of Software Architecture: An Engineering Approach*. Sebastopol, CA: O'Reilly Media.
23. Richardson, L. and Amundsen, M. (2013) *RESTful Web APIs*. Sebastopol, CA: O'Reilly Media.
24. Romero, C. and Ventura, S. (2010) 'Educational data mining: a review of the state of the art', *IEEE Transactions on Systems, Man, and Cybernetics, Part C*, 40(6), pp. 601–618.
25. Sandhu, R.S., Coyne, E.J., Feinstein, H.L. and Youman, C.E. (1996) 'Role-based access control models', *IEEE Computer*, 29(2), pp. 38–47.
26. Saunders, M., Lewis, P. and Thornhill, A. (2019) *Research Methods for Business Students*. 8th edn. Harlow: Pearson Education.
27. Siemens, G. and Long, P. (2011) 'Penetrating the fog: analytics in learning and education', *EDUCAUSE Review*, 46(5), pp. 30–40.
28. Silberschatz, A., Korth, H.F. and Sudarshan, S. (2019) *Database System Concepts*. 7th edn. New York: McGraw-Hill.
29. Slade, S. and Prinsloo, P. (2013) 'Learning analytics: ethical issues and dilemmas', *American Behavioral Scientist*, 57(10), pp. 1510–1529.
30. Sommerville, I. (2016) *Software Engineering*. 10th edn. Harlow: Pearson Education.
31. Teorey, T.J., Lightstone, S., Nadeau, T. and Jagadish, H.V. (2011) *Database Modeling and Design: Logical Design*. 5th edn. Burlington, MA: Morgan Kaufmann.
32. Wiegers, K. and Beatty, J. (2013) *Software Requirements*. 3rd edn. Redmond, WA: Microsoft Press.

(Reuse the same in-text spellings, e.g. `(Hevner *et al.*, 2004)`, `(Siemens and Long, 2011)`.)

---

## E. Section outline & numbering (keep stable for cross-references)

- **Ch1 Introduction** — 1.1 Background and Context · 1.2 Problem Statement · 1.3 Project Aim ·
  1.4 Project Objectives · 1.5 Research Questions · 1.6 Significance · 1.7 Scope and Limitations ·
  1.8 Structure of the Report. *(LO1 — P1, P2 | M1 | D1)*
- **Ch2 Literature Review** — 2.1 Introduction and Search Strategy · 2.2 Theoretical Framework ·
  2.3 Thematic Review (six themes, §H) · 2.4 Industry / Practice Review · 2.5 Identification of the
  Gap · 2.6 Conceptual Framework (Fig 2.1) · 2.7 Summary. *(LO1 — M1 | D1)*
- **Ch3 Project Planning and Methodology** — 3.1 Research Philosophy and Approach · 3.2 Methodological
  Choice · 3.3 Project Management Methodology · 3.4 Project Plan (3.4.1 WBS = Fig 3.1, 3.4.2 Gantt =
  Fig 3.2, 3.4.3 Milestones = Table 3.1) · 3.5 Resource Planning (Table 3.2) · 3.6 Risk Register
  (Table 3.3 = R01–R10, Fig 3.3 heat-map) · 3.7 Ethical Considerations · 3.8 Project Tracking
  (Fig 3.4) · 3.9 Implementation of the Plan · 3.10 Critical Assessment. *(LO2 — P3, P4 | M2 | D2)*
- **Ch4 System Analysis, Design and Implementation** — 4.1 Method (artefact-driven) · 4.2 Analytical
  Techniques (requirements traceability) · 4.3 Findings: 4.3.1 Requirements & artefact inventory
  (Table 4.0) · 4.3.2 System architecture (Fig 4.1–4.4) · 4.3.3 Database design (Fig 4.5 ERD) ·
  4.3.4 The six core processes P1–P6 (Fig 4.6–4.11 + Tables 4.1–4.6) · 4.3.5 Security design
  (Fig 4.15) · 4.3.6 Key interactions (Fig 4.12–4.14) and BPMN→module map (Table 4.7) · 4.4 Comparison
  of Patterns (Fig 4.16–4.17). *(LO3 — P5, M3, M4)* — **NB: the chapter H1 may keep the template's
  "Chapter 4 — Data Collection and Analysis" title with this design-science reading; either H1 is
  acceptable, but keep section numbers as above.**
- **Ch5 Discussion** — 5.1 Interpretation (answer RQ1–RQ4) · 5.2 Comparison with the Literature ·
  5.3 Validity · 5.4 Reliability · 5.5 Project Effectiveness Evaluation (Table 5.1 RAG; Fig 5.1–5.4) ·
  5.6 Limitations · 5.7 Implications. *(LO3 — D3)*
- **Ch6 Conclusion and Recommendations** — 6.1 Summary · 6.2 Achievement of Objectives ·
  6.3 Contribution · 6.4 Recommendations (6.4.1 practitioners, 6.4.2 researchers) · 6.5 Closing.
- **Ch7 Reflective Evaluation** — 7.1 Reflective Model (Gibbs) · 7.2 Reflection through Gibbs ·
  7.3 SWOT · 7.4 Transferable Skills · 7.5 Future Development Plan. *(LO4 — P7 | D4)*

---

## F. Asset reframing (titles only — IDs unchanged)

Reuse every figure/table ID from `ASSET_REGISTRY.md`. Only retitle where "BPMN" was the subject:
- Fig 2.1 — *Conceptual framework: from process intent to a validated student-analytics system*
  (the bridge is now the whole design method, not BPMN specifically).
- Fig 4.6–4.11 — *Process model of P1…P6* (drawn in BPMN 2.0). Keep the BPMN placeholder + Mermaid.
- Fig 4.16 — *Process-complexity comparison across the six core workflows*.
- Fig 4.17 — *Requirement→artefact coverage per process*.
- All other titles stay. The Gantt/WBS/C4/ERD/sequence/security/RAG/radar/trend figures are unchanged.
- The List of Figures/Tables in `00-front-matter.md` must match these retitles.

---

## G. Risk register R01–R10 (reworded for the system project — keep IDs, scores, table shape)

| ID | Risk | Category | P | I | Score | Severity | Status |
|---|---|---|---|---|---|---|---|
| R01 | Limited literature directly comparable to a transparent, multi-dimensional composite-score model | Academic | 2 | 3 | 6 | Medium | Open |
| R02 | Scope creep — the feature set expands beyond the core six modules / MVP | Scope | 3 | 4 | 12 | High | Open |
| R03 | Divergence between the design artefacts (architecture, ERD, process models) and the implemented code | Technical | 3 | 5 | 15 | Critical | Open |
| R04 | Schedule delay from running academic writing and software development in parallel | Schedule | 3 | 4 | 12 | High | Open |
| R05 | The composite-score formula behaves incorrectly on edge cases / small samples, eroding trust | Technical | 2 | 3 | 6 | Medium | Open |
| R06 | EduMetric implementation incomplete at submission | Technical | 2 | 4 | 8 | Medium | Open |
| R07 | Traceability links break when the architecture or database schema changes | Technical | 2 | 4 | 8 | Medium | Open |
| R08 | Academic sources unavailable through the university library | Academic | 2 | 3 | 6 | Medium | Open |
| R09 | Reflective chapter lacks genuine critical depth (Ch 7) | Academic | 2 | 3 | 6 | Medium | Open |
| R10 | Artefact inconsistency across chapters (module names, endpoint paths, terminology) | Quality | 3 | 4 | 12 | High | Open |

Owner = Researcher (all). Mitigation/contingency columns belong in Appendix C / Table C.1.

---

## H. Six thematic strands for Chapter 2 (replace the BPMN themes)

1. **From single-number GPA to multi-dimensional assessment of learning** — why one number hides
   growth; rationale for weighted dimensions (Siemens and Long, 2011; Ferguson, 2012).
2. **Learning analytics and educational data** — using academic data to understand and support
   students (Romero and Ventura, 2010; Ferguson, 2012).
3. **Early-warning / at-risk detection systems** — Course Signals and LMS-mining early-warning work
   (Macfadyen and Dawson, 2010; Arnold and Pistilli, 2012).
4. **Transparency vs black-box prediction** — configurable, auditable scoring against opaque ML;
   ethics of algorithmic decisions on students (Slade and Prinsloo, 2013).
5. **Architecture of educational web information systems** — three-tier / modular monolith, REST APIs,
   relational data (Bass *et al.*, 2012; Richards and Ford, 2020; Fielding, 2000; Fowler, 2002;
   Newman, 2015 for contrast). Process modelling (BPMN) and requirements engineering belong here as
   design techniques (Dumas *et al.*, 2018; Sommerville, 2016; Wiegers and Beatty, 2013).
6. **Security, privacy and access control for student data** — RBAC, JWT, GDPR-aligned handling
   (Sandhu *et al.*, 1996; European Parliament and Council, 2016).

Evaluative lenses for §2.2 / §5.5: Technology Acceptance Model (Davis, 1989) and the IS Success Model
(DeLone and McLean, 2003), within an overarching design-science frame (Hevner *et al.*, 2004;
Peffers *et al.*, 2007). §2.5 must evaluate alternatives (single-number GPA, generic LMS gradebooks,
commercial SIS, black-box ML scoring) and converge on the gap EduMetric fills (D1). Fig 2.1 is the
conceptual framework.

---

## I. Global rules for every chapter rewrite

- **Read first**: `REFRAME_BRIEF.md` (this file), `FACTS.md`, your existing chapter file, and
  `01-introduction.md` (for voice). Preserve all grounded facts/tables/IDs; rewrite only the framing.
- Third person in the main body; first person only in Chapter 7.
- Caption format under each asset: `**Figure 4.1 — Title.** *(Source: author …)*`. Reference every
  figure/table in the prose before it appears.
- Keep BTEC LO/P/M/D tags under each chapter H1 (see §E).
- Keep the BPMN-placeholder and 📸-screenshot blocks verbatim where they already exist (the student
  supplies images). Keep all Mermaid diagrams.
- Cite only from §D. British spelling in prose. Mark human-only content `⟨STUDENT INPUT: …⟩`.
- Word targets: Ch1 1000–1500 · Ch2 2000–3000 · Ch3 2000–2500 · Ch4 2500–3500 · Ch5 1500–2000 ·
  Ch6 800–1000 · Ch7 1000–1500.
- Do **not** delete the per-process traceability matrices, the risk register, the Gantt, or the test
  tables. Do **not** introduce BPMN as the research subject. Do **not** invent survey data.
