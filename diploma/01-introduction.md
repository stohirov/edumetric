# Chapter 1 — Introduction

*Addresses **LO1 — P1, P2 | M1 | D1***

## 1.1 Background and Context

The digitalisation of education across Uzbekistan and the wider Central Asian region has accelerated
sharply over the past decade, as universities and private IT academies adopt learning-management and
student-information systems to administer enrolment, attendance and assessment at scale. Yet the
majority of these systems remain *records of account*: they store grades, compute a single
grade-point average (GPA) and report it back. They capture what a student scored, but they say little
about *how that student is developing* — whether attendance is slipping, whether practical performance
is diverging from theory marks, or whether a learner who looks average today is in fact on a declining
trajectory. The institutional need is shifting from recording outcomes to **understanding student
growth**, a shift that the learning-analytics literature has framed as moving "from data to insight"
in the service of timely intervention (Siemens and Long, 2011; Ferguson, 2012).

This project responds to that shift by designing, building and evaluating **EduMetric**, a web-based,
multi-dimensional student performance analytics system. EduMetric replaces "GPA as a single number"
with a transparent **composite score** computed across several weighted dimensions — grades,
attendance, practical work, behaviour and activity, plus growth and consistency bonuses — and surfaces
a **growth trend** and an **at-risk detection** signal for each learner. The system is built as a
full-stack web application: a Next.js/React single-page frontend, a Java Spring Boot REST backend and
a PostgreSQL relational database, deployed as a single **modular monolith**. It deliberately rejects
black-box machine-learning scoring in favour of a configurable, auditable formula, on the principle
that decisions affecting a student's academic standing must be explainable (Slade and Prinsloo, 2013).

An education analytics platform of this kind sits at the intersection of web-application development,
relational database design, information security, user-experience design and process automation — all
core competencies of the Business Information Technology curriculum. EduMetric is therefore both a
practically useful artefact for institutions and an appropriate vehicle for demonstrating the
end-to-end software-engineering process this dissertation sets out to evidence.

## 1.2 Problem Statement

In many educational institutions, student evaluation, attendance monitoring and progress reporting
rely on disconnected spreadsheets, separate gradebooks and informal communication. This fragmented
approach produces a recurring set of problems, confirmed through preliminary domain analysis and the
EduMetric product master document:

1. **A single number hides growth.** A GPA averages away the dimensions that matter for early support;
   a student weak in practical work but strong in theory looks "average," and a declining attendance
   trend is invisible until results collapse (Macfadyen and Dawson, 2010).
2. **Data fragmentation.** Grades, attendance and behaviour live in separate files, causing version
   conflicts, duplication and slow, manual report compilation.
3. **Late at-risk identification.** Without continuous, multi-factor monitoring, teachers learn that a
   student is failing only after the fact, when intervention is least effective (Arnold and Pistilli, 2012).
4. **Opacity of scoring.** Where institutions do adopt analytics, the scoring is often a black box,
   undermining trust and the right of students to understand decisions made about them.
5. **Weak access control.** Sensitive academic records are frequently accessible beyond the staff who
   need them, with no role-based protection or audit trail.

The engineering problem this project addresses is therefore to turn these informally understood
processes — authentication, attendance management, student evaluation, analytics generation, at-risk
detection and administrative monitoring — into precise, verifiable software: an architecture, a data
model, a set of REST endpoints and a body of test evidence, derived rigorously from requirements so
that what was intended, what was designed and what was built do not diverge (Sommerville, 2016).

## 1.3 Project Aim

> To design, develop and evaluate a web-based, multi-dimensional student performance analytics system
> that improves the transparency, accuracy and accessibility of student evaluation, attendance
> management and early at-risk identification in educational institutions.

## 1.4 Project Objectives

The aim is delivered through five SMART objectives (the approved project proposal from which they
derive is provided in Appendix A):

1. **Review the literature** on learning analytics, educational information systems, multi-dimensional
   assessment, web-application architecture and data security, synthesising at least 25 quality
   sources into six thematic strands, to establish the theoretical foundation *(Chapter 2)*.
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
   effectiveness assessment, producing evidence-based recommendations for practitioners *(Chapters 5–6,
   Appendix K)*.

Each objective is specific and time-bound against the project plan (§3.4), measurable through a named
deliverable, and achievable within the scope defined in §1.7.

## 1.5 Research Questions

- **RQ1** — What limitations in current student-evaluation and management processes can a web-based
  information system address?
- **RQ2** — What functional modules and data model are required for a transparent, multi-dimensional
  student performance analytics system?
- **RQ3** — How can a web-based system improve the transparency, accuracy and accessibility of student
  evaluation, attendance management and at-risk detection?
- **RQ4** — How should security, privacy and role-based access control be implemented to protect
  sensitive student data?

## 1.6 Significance of the Project

**Academically**, the project contributes a concrete, fully traceable reference implementation of a
*transparent* multi-dimensional evaluation model. While learning analytics is a mature field, much of
it emphasises predictive, often opaque models (Romero and Ventura, 2010); comparatively little
demonstrates an end-to-end, auditable path from a configurable scoring formula through architecture,
schema and API to validating tests within a single non-trivial system. By using a real, multi-module
application as the object of study, this dissertation evidences an engineering method rather than a
purely conceptual proposal.

**For industry and practice**, EduMetric offers a worked pattern for cost-effective, locally
deployable education analytics. Built entirely on open-source technologies (Next.js, Spring Boot,
PostgreSQL) and deployable as a single modular monolith on one server, it shows how an institution can
centralise records, automate scoring and attendance, and gain early-warning dashboards without
expensive commercial subscriptions or black-box algorithms.

**Personally**, the project consolidates the author's software-engineering competence — requirements
analysis, process and architecture modelling, relational database design, secure REST API development
and software validation — into a single coherent body of evidence aligned with a future career in
systems development.

## 1.7 Scope and Limitations

The study is bounded to a **single system, EduMetric**, comprising the Spring Boot backend and the
Next.js frontend held in this repository. The system recognises three core roles — **Student, Teacher
and Admin**; a Parent role exists in the code as a later extension and is noted only where relevant to
scope, never as a fourth core role. The investigation is a **design-and-build study** evaluated through
its artefacts: it concentrates on requirements, design, implementation and validation of the six core
processes, not on production deployment, large-scale performance testing or live institutional trials.
Consequently, evaluation evidence (Chapter 5 and Appendix K) draws on the system's functional and
user-acceptance test suite and on synthetic/anonymised academic data rather than on data collected
from human participants, which keeps the project low-risk ethically (§3.7). As a single-system design,
the findings prioritise depth and internal traceability over statistical generalisability — a
limitation revisited in §5.6.

## 1.8 Structure of the Report

The remainder of this report proceeds as follows. **Chapter 2** reviews the literature thematically
and derives the conceptual framework that positions EduMetric within learning analytics and
information-systems design. **Chapter 3** sets out the research philosophy, the design-science
methodology, and the project plan, risk register and ethical considerations. **Chapter 4**, the core
engineering chapter, specifies the requirements and presents the system's architecture, data model and
six core process models, tracing each forward into modules, entities and API endpoints with supporting
test evidence. **Chapter 5** interprets these findings against the research questions and the
literature, and evaluates the project's effectiveness. **Chapter 6** draws conclusions and
recommendations, and **Chapter 7** offers a reflective evaluation of the author's learning. Supporting
material — the proposal, full project-management artefacts, ethics documentation, assessment-criteria
mapping, UI evidence and testing evidence — is provided in Appendices A–K.
