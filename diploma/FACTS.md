# FACTS.md — Verified evidence base (extracted from the real codebase)

> Ground truth for every technical claim in the dissertation. Extracted in Phase 0 by reading the
> repository directly. Later phases cite this file so they never re-read the whole codebase or guess.
> **Primary sources:** `backend/ARCHITECTURE.md`, `backend/CLAUDE.md`, the Liquibase changelog,
> `hackathon-front/src/app/`, `backend/pom.xml`. Where a fact restates one of these, the file path is given.

---

## 1. System identity & stack

- **EduMetric CRM** — a multi-dimensional student-evaluation analytics platform. Replaces "GPA as a
  single number" with a transparent **composite score** across Grades, Attendance, Practical,
  Behaviour, Activity (+ growth and consistency bonuses). *(Source: `backend/CLAUDE.md`.)*
- **Three core roles:** `ADMIN`, `TEACHER`, `STUDENT`. A **Parent** role exists in code as an
  extension (changeset `v1-core/018-parent-role.yaml`, package `parents/`, entity `ParentLink`,
  routes `/parent/*`) — treat only as a scope note, never as a 4th core role in the BPMN story.
- **Stack (locked, verified against `CLAUDE.md` + `pom.xml`):**
  - Language **Java 25 (LTS)**; framework **Spring Boot 4.0.6** (Spring Framework 7); build **Maven** (`./mvnw`).
    *(Dissertation prose says "Java 21+ / Spring Boot" per the locked stack; the shipped repo is on Java 25 / Boot 4 — state the locked phrasing, footnote the exact version if precision is needed.)*
  - DB **PostgreSQL 16**; migrations **Liquibase** (YAML); ORM **Spring Data JPA + Hibernate 6.6**.
  - Web layer **Spring MVC** (NOT WebFlux); security **Spring Security 7 + JWT (HS256)**.
  - Frontend **Next.js / React / TypeScript / Tailwind**, shadcn/ui, Recharts.
  - **Modular monolith**, one `docker-compose.yml` on a single VPS; nginx reverse proxy.
  - **Redis** = read-through cache for analytics dashboards **only** (`config/CacheConfig.java`),
    never a broker, never in the recompute path. **MinIO** = file storage for homework/materials.
- **Deliberately NOT used:** Kafka/RabbitMQ/any broker, WebFlux, MapStruct, Flyway, microservices,
  ML/AI prediction. *(Source: `ARCHITECTURE.md` §1, §12; `CLAUDE.md`.)*

---

## 2. Package layout — 48 vertical slices

Base package `com.edumetric.backend`. One package per feature; never split horizontally.
*(Source: `ARCHITECTURE.md` §3; verified by directory listing.)*

```
analytics  appeals  atrisk  attendance  audit  auth  behavior  bulkimport  catalog
certificates  checkin  common  config  content  courses  email  enrollment  feedback
gradebook  gradecategories  grades  groups  homework  invitations  justifications
lessons  library  messaging  metrics  notifications  organization  parents  peerreview
plagiarism  quizzes  reminders  reports  rubrics  security  seed  settings  students
submissions  syllabus  teachers  teaching  transcripts  users
```

**Layering (`ARCHITECTURE.md` §4):** Controller (thin: parse, `@Valid`, delegate, map DTO,
return `ResponseEntity<ApiResponse<T>>`) → Service (`@Transactional`, business logic) →
Repository (`JpaRepository` + `@Query`) → Entity (Lombok, soft-deletable, Liquibase-owned,
`ddl-auto: validate`). Controllers never call repositories; services never return entities; DTOs are records.

**Key slices for the BPMN spine:** `auth/`, `security/`, `attendance/`, `grades/`, `behavior/`,
`metrics/`, `analytics/`, `students/`, `atrisk/`, `audit/`, `settings/`, `organization/`.

---

## 3. Entities — 60 `@Entity` classes (grouped by domain)

*(Verified by `grep -rl "@Entity"`. `AuditableEntity` is a `@MappedSuperclass`, not a table.)*

- **Identity & access (7):** `User`, `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken`,
  `MfaBackupCode`, `Invitation`, `ParentLink`.
- **People & org (5):** `Student`, `Teacher`, `Department`, `AcademicTerm`, `InstitutionSettings`.
- **Academic structure (9):** `Course`, `Group`, `CourseModule`, `CourseMaterial`, `MaterialVersion`,
  `MaterialCompletion`, `Syllabus`, `CourseTeacher`, `CourseCompletion`.
- **Enrolment (2):** `Enrollment`, `EnrollmentRequest`.
- **Lessons & attendance (5):** `Lesson`, `Attendance`, `LessonCheckin`, `AbsenceJustification`,
  `AttendancePolicy`.
- **Assessment records (8):** `Assignment`, `Grade`, `GradeCategory`, `GradeAppeal`, `Rubric`,
  `RubricCriterion`, `RubricScore`, `TermGrade`.
- **Behaviour & activity (2):** `BehaviorRecord`, `ActivityRecord`.
- **Submissions & quality (5):** `HomeworkSubmission`, `Submission`, `SubmissionFeedback`,
  `PeerReview`, `PlagiarismReport`.
- **Quizzes (5):** `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAttemptAnswer`.
- **Metrics / analytics layer (3):** `FormulaConfig`, `StudentMetrics`, `MetricSnapshot`.
- **At-risk (1):** `AtRiskRules`.
- **Notifications & messaging (6):** `Notification`, `NotificationPreference`, `Announcement`,
  `Conversation`, `Message`, `ReminderLog`.
- **Audit (1):** `AuditLog`.

**Core ERD tables (concise, from `ARCHITECTURE.md` §7):** `users`, `students`, `teachers`, `groups`,
`courses`, `lessons`, `attendance` (UNIQUE `student_id,lesson_id`), `assignments`, `grades`
(UNIQUE `student_id,assignment_id`), `behavior_records`, `activity_records`, `formula_config`,
`student_metrics` (UNIQUE `student_id`), `metric_snapshots` (UNIQUE `student_id,snapshot_date`),
`audit_log` (JSONB payload).

**Integrity rules:** FK everywhere with `ON DELETE RESTRICT` + soft-delete (`users, students,
teachers, groups, courses`); **hard delete** on immutable history (`attendance, grades,
behavior_records, activity_records`); CHECK constraints on enum-like columns & value ranges; UNIQUE
constraints prevent duplicate attendance/grades.

---

## 4. The metrics engine & composite-score formula (the centrepiece)

*(Source: `ARCHITECTURE.md` §6.)* Two-layer separation:

- **`MetricsEngine`** (`metrics/engine/`) — pure compute: in = `ComputeContext` {grades, attendance,
  behavior, activity, snapshots, formula}, out = `ComputedMetrics` {compositeScore, gradesNorm, …}.
  No Spring, no JPA, no time → 100% unit-testable.
- **`MetricsService`** — orchestration: loads via repos → invokes engine → upserts `student_metrics`
  → writes `audit_log`, all in one `@Transactional`.

**Formula (transparent, configurable):**
```
composite = w_g·grades_norm + w_a·attendance_norm + w_p·practical_norm
          + w_b·behavior_norm + w_ac·activity_norm + w_gr·growth_bonus + w_c·consistency_bonus
```
**Default weights (sum = 1.0):** `0.25 / 0.15 / 0.25 / 0.10 / 0.10 / 0.10 / 0.05`
(grades / attendance / practical / behaviour / activity / growth / consistency).

**Recompute triggers:**
| Event | Action |
|---|---|
| Attendance / Grade / Behaviour / Activity write | Recompute each affected student **in the same tx** |
| Formula weights change (admin) | Mark all metrics stale → batch `recomputeAll()`, paged 1000 students/tx |
| Dashboard open | Lazy recompute if stale relative to last data change |

**Why synchronous:** bulk attendance for ~24 students ≈ 200 ms in one tx; live recompute is a
demo feature (mark attendance → switch tab → score already changed); one source of truth, no in-flight divergence.

**Snapshot job:** `@Scheduled(cron = "0 0 3 * * MON")` writes one `metric_snapshots` row per student
→ feeds the trend chart and growth-bonus. Dev profile seeds 12 weeks of synthetic snapshots.

---

## 5. Security model

*(Source: `ARCHITECTURE.md` §5; `CLAUDE.md`.)*

- **`JwtAuthenticationFilter`** (`OncePerRequestFilter`) reads `Authorization: Bearer …` or httpOnly
  cookie → **`JwtTokenProvider.validate()`** (HS256, signing key from env) → loads `UserDetails`
  via **`CustomUserDetailsService`** → sets `SecurityContextHolder`.
- Method security: `@PreAuthorize("hasRole('ADMIN')")` etc. (`@EnableMethodSecurity`).
- **Role hierarchy** `ADMIN > TEACHER > STUDENT` via `RoleHierarchyImpl`.
- Stateless session; CSRF disabled (JWT covers it); CORS limited to frontend origin.
- **Password hashing: BCrypt (strength 10).**
- **Public endpoints:** `POST /api/auth/login`, `GET /api/health`, `/swagger-ui/**`, `/v3/api-docs/**`.
- **Data-level authorisation lives in service-layer query filters** (teacher → own groups, student →
  self), NOT in `@PreAuthorize` — the single hardest correctness issue in a multi-role CRM, kept in one place per feature.
- **Token model (per `CLAUDE.md` + TODO §1):** short-lived access JWT + opaque rotating refresh
  tokens (DB-stored, SHA-256-hashed; `v1-core/010-refresh-tokens.yaml`). `POST /api/auth/refresh`
  rotates (single-use; reuse revokes the family). *(Note: `ARCHITECTURE.md` §1 still describes the
  earlier "JWT 24h, no refresh" MVP; the shipped code added refresh tokens — prefer the code.)*

---

## 6. The six-process BPMN spine (verified mappings)

Real endpoint paths confirmed by grepping `@*Mapping` in the controllers. **The draft xlsx matrix
idealised several paths/tables — §7 reconciles them. Prefer these real values in technical claims.**

**P1 — User Authentication** *(Fig 4.6)*
- Modules: `security/` (`JwtAuthenticationFilter`, `JwtTokenProvider`, `CustomUserDetailsService`),
  `auth/` (`AuthController`, `AuthService`), `config/SecurityConfig`.
- Entities: `users`, `refresh_tokens`, `password_reset_tokens`, email-verification / 2FA / login-security fields.
- **Real endpoints** (`auth/AuthController` → `/api/auth`): `POST /login`, `GET /me`, `POST /logout`,
  `POST /refresh`, `POST /forgot-password`, `POST /reset-password`, `POST /verify-email`,
  `POST /2fa/verify`, `GET /sessions`, `DELETE /sessions/{id}`.
- Tests: `TC-AUTH-01..06`.

**P2 — Attendance Management** *(Fig 4.7)*
- Modules: `attendance/` (`AttendanceController`, `AttendanceService`), `lessons/`, `metrics/`
  (`MetricsService`); related `checkin/`, `justifications/`, attendance policy & reports.
- Entities: `lessons`, `attendance` (UNIQUE `student_id,lesson_id`), `student_metrics`.
- **Real endpoints:** `GET /api/lessons` (query incl. teacher scope), `GET /api/lessons/{id}/attendance`,
  **`POST /api/attendance/bulk`**, `POST /api/attendance/lesson/{lessonId}/mark-all`.
- Tests: `TC-ATT-01..05`. Engineering note: high-frequency flow → **synchronous metric recompute** is the point.

**P3 — Student Evaluation** *(Fig 4.8)*
- Modules: `grades/`, `behavior/`, `gradebook/`, `gradecategories/`, `rubrics/`, `metrics/`
  (`MetricsEngine` + `MetricsService`).
- Entities: `assignments`, `grades`, `behavior_records`, `activity_records`, `formula_config`, `student_metrics`.
- **Real endpoints:** `POST /api/grades`, **`POST /api/grades/bulk`**, `PATCH /api/grades/{id}`;
  `POST /api/behavior`, `POST /api/behavior/bulk`, `POST /api/activity`;
  `PUT /api/metrics/formula`, `POST /api/metrics/recompute/{studentId}`.
- Tests: `TC-EVAL-01..05`. Engineering note: heart of scoring logic; weights sum to 1.0; transparent & configurable.

**P4 — Student Analytics Generation** *(Fig 4.9)*
- Modules: `students/` (`StudentDashboardService` — the composed "wow endpoint"), `analytics/`, `metrics/`.
- Entities: `student_metrics` (denormalised cache), `metric_snapshots` (history).
- **Real endpoints:** **`GET /api/students/{id}/dashboard`**, `GET /api/students/me/dashboard`,
  `GET /api/students/{id}/metrics`, `GET /api/students/{id}/metrics/trend`, `GET /api/metrics/formula`,
  `GET /api/analytics/admin/dashboard`.
- Tests: `TC-ANA-01..04`. Engineering note: read model + Redis short-TTL cache for cross-student dashboards.

**P5 — At-Risk Student Detection** *(Fig 4.10)*
- Modules: `atrisk/` (`AtRiskRulesController`, `AtRiskRules`), `analytics/`, `notifications/`, `reminders/`.
- Entities: `at_risk_rules`, `notifications`, `metric_snapshots`, `student_metrics`.
- **Real endpoints:** **`GET /api/analytics/at-risk`** (role-scoped), `GET /api/at-risk-rules`,
  `PATCH /api/at-risk-rules`.
- Tests: `TC-RISK-01..05`. Engineering note: exception-driven analytical workflow → BPMN gateways & event triggers are the point.

**P6 — Admin Monitoring** *(Fig 4.11)*
- Modules: `analytics/`, `organization/`, `settings/`, `audit/`, `users/`, `groups/`, `courses/`, `departments` (in `organization/`).
- Entities: `institution_settings`, `formula_config`, `audit_log`, `departments`, `academic_terms`.
- **Real endpoints:** `GET /api/analytics/admin/dashboard`, `GET /api/settings`, `PATCH /api/settings`,
  `PUT /api/metrics/formula`, `POST /api/metrics/recompute-all`, `GET/POST/PATCH/DELETE /api/users`,
  group/course CRUD.
- Tests: `TC-ADMIN-01..05`. Engineering note: governance & configuration; formula change cascades to all metrics.

**BPMN modelling rules:** one diagram = one process; pools for Student/Teacher/Admin/System only where
they participate; lanes only when they clarify responsibility; gateways must be real decisions; every
exception path that affects implementation must appear; every diagram maps to ≥1 architecture/API section.

---

## 7. Draft-artefact ↔ real-code reconciliation

The student's `EduMetric_Dissertation_Artefacts.xlsx` traceability matrix is authoritative for
**structure, requirements wording, role columns, validation rules, and test IDs** — reuse those exactly.
But some endpoint paths / table names in the matrix are idealised and differ from the shipped code.
In Chapter 4, present the **real** value and keep the matrix's test ID. Known differences:

| Draft matrix value | Real code value |
|---|---|
| `POST /api/attendance` | `POST /api/attendance/bulk` (and `…/lesson/{id}/mark-all`) |
| `GET /api/lessons/{id}/students` | `GET /api/lessons/{id}/attendance` |
| `POST /api/behaviour`, `/api/activity` | `POST /api/behavior`, `/api/behavior/bulk`, `/api/activity` (American spelling in code) |
| `GET /api/metrics/student/{id}` | `GET /api/students/{id}/metrics` |
| `…/analytics/student/{id}/trend`, `…/radar` | `GET /api/students/{id}/metrics/trend` (radar composed inside the dashboard payload) |
| `GET /api/dashboard/student/{id}` | `GET /api/students/{id}/dashboard` |
| `GET /api/alerts`, `GET /api/at-risk` | `GET /api/analytics/at-risk` (+ `/api/at-risk-rules` config) |
| `GET /api/admin/dashboard` | `GET /api/analytics/admin/dashboard` |
| `GET/POST/PATCH /api/admin/users` | `/api/users` (+ `/api/users/{id}/suspend`, `/reactivate`) |
| `GET/POST /api/admin/config` | `GET /api/settings`, `PATCH /api/settings` (+ `PUT /api/metrics/formula`) |
| `alert_records` table, `students.risk_level`, `formula_config.risk_threshold` | At-risk is rule-driven via `at_risk_rules` (`atrisk/`) + `notifications`; institution-level threshold lives in `institution_settings` (`settings/`). No `alert_records` table — flag generation surfaces through `notifications`. |

---

## 8. Liquibase changelog (the real ERD source)

Entrypoint `db.changelog-master.yaml`; `ddl-auto: validate` (Hibernate never alters DDL). One
changeSet = one DDL action; never edit a deployed changeSet. *(Source: `ARCHITECTURE.md` §7.)*
Grouped by domain (verified listing):

- **`v1-core/` (19):** 001-users, 002-teachers, 003-students, 004-courses, 005-groups,
  006-user-preferences, 007-institution-settings, 008-password-reset-tokens, 009-login-security,
  010-refresh-tokens, 011-session-metadata, 012-two-factor, 013-user-profile-fields,
  014-email-verification, 015-departments, 016-academic-terms, 017-user-account-fields,
  018-parent-role, 019-invitations.
- **`v2-domain/` (32, numbered to 032):** 001-lessons, 002-attendance, 003-assignments-grades,
  004-behavior-activity, 005-homework-submissions, 006-course-content, 007-quizzes, 008-notifications,
  009-enrollments, 010-course-teachers, 011-module-prerequisite, 012-syllabus,
  013-enrollment-requests, 014-material-versions, 015-course-completions, 016-grade-categories,
  017-rubrics, 018-submission-feedback, 019-grade-appeals, 020-term-grades, 021-plagiarism,
  022-peer-reviews, 023-lesson-checkins, 024-absence-justifications, 025-attendance-policy,
  027-at-risk-rules, 028-messaging, 029-notification-preferences, 030-reminder-log, 031-submissions,
  032-performance-indexes. *(026 not present — gap in numbering.)*
- **`v3-metrics/` (4):** 001-formula-config, 002-student-metrics, 003-metric-snapshots,
  004-student-metrics-confidence.
- **`v4-audit/` (1):** 001-audit-log.
- **`seed/`:** demo-data (`context: dev,demo`, never prod).

**Sub-domain clusters for the ERD (Fig 4.5):** identity & access (v1-core) · academic structure
(courses/groups/lessons/content) · assessment records (grades/behaviour/quizzes/submissions) ·
analytics layer (v3-metrics) · audit/governance (v4-audit + settings).

---

## 9. API conventions

*(Source: `ARCHITECTURE.md` §8.)* Base path **`/api`**, no versioning yet. All responses wrapped in
**`ApiResponse<T>`** (`record<T>(T data, String error, List<String> details)`). camelCase JSON,
ISO-8601 UTC timestamps. Errors via `GlobalExceptionHandler` (`@RestControllerAdvice`):
404 `ResourceNotFoundException` · 400 `BadRequestException`/`MethodArgumentNotValidException` ·
403 `ForbiddenException`/`AccessDeniedException` · 409 `ConflictException` · 500 catch-all.
Pagination `?page=0&size=20`. **One screen = one endpoint** (the student dashboard composes
student info + current metrics + trend + breakdown + recent activity + growth areas in a single
`GET /api/students/{id}/dashboard`). **52 `@RestController` classes** in total.

---

## 10. Frontend route map (backs Appendix J screenshots)

`hackathon-front/src/app/` — Next.js App Router, route groups `(auth)` and `(dashboard)`.

- **Auth `(auth)`:** `/login`, `/forgot-password`, `/reset-password`, `/change-password`,
  `/verify-email`, `/invite`.
- **Student `/student/*`:** `` (dashboard), `growth`, `progress`, `grades`, `attendance`, `homework`,
  `submissions`, `quizzes`, `transcript`, `certificates`, `catalog`, `content`, `library`, `syllabus`,
  `feedback`, `appeals`, `peer-reviews`, `justifications`, `checkin`, `messages`, `notifications`, `settings`.
- **Teacher `/teacher/*`:** `` (dashboard), `attendance`, `attendance-reports`, `grades`,
  `grade-categories`, `homework`, `submissions`, `rubrics`, `at-risk`, `students`, `groups`,
  `quizzes`, `content`, `library`, `syllabus`, `feedback`, `appeals`, `peer-reviews`, `plagiarism`,
  `reports`, `transcripts`, `checkin`, `announcements`, `justifications`, `messages`, `notifications`, `settings`.
- **Admin `/admin/*`:** `` (dashboard), `students`, `teachers`, `groups`, `cohorts`, `courses`,
  `departments`, `terms`, `formula`, `enrollment`, `enrollment-requests`, `imports`, `invitations`,
  `lessons`, `teaching`, `at-risk`, `at-risk-rules`, `attendance-policy`, `announcements`,
  `notifications`, `parents`, `settings`.
- **Shared:** `/analytics`, `/attendance`. **Parent `/parent/*`** (scope-note role): ``, `notifications`, `settings`.
- **Chart components:** `src/components/charts/` → `area-chart-card`, `bar-chart-card`,
  `donut-chart-card`, `chart-tooltip` (Recharts). Radar/trend visuals composed in the student/analytics pages.

---

## 11. Existing draft artefacts (reuse exactly — in `_sources/`)

- **`EduMetric_Dissertation_Artefacts.xlsx`** — 3 finished artefacts, mirrored in this repo's evidence:
  1. **Traceability Matrix** — 6 processes × {BPMN activity, requirement, module, entity/field,
     endpoint, method, roles, validation, test evidence, verified ✓}. All rows marked Verified ✓.
  2. **Risk Register R01–R10** (see §12).
  3. **Gantt** — 6 phases / 24 weeks (see §13).
- **`Chapter4_Revised (1).docx`** — Chapter 4 draft defining **Tables 4.1–4.7** (per-process
  traceability + BPMN→module mapping). Reuse its numbering and prose. *(Read in Phase 6.)*
- **`EduMetric_CRM_Master_Document.pdf`** — locked product master document.
- **`Черновик.docx`** — broader working draft (mine for reusable prose).
- **`BTEC_L6_Unit2_Independent_Project_Template (2).docx`** — official template (structure, BTEC
  criteria, Appendix I matrix); the Phase-13 `.docx` must match it.
- **`иловалар билан ишлаш.docx`** — appendix guidance & worked example (Appendices A–K).
- **`APPENDIX_ларни_асосий_матга_боглаш_керак.docx`** — the exact sentences linking Appendix J & K
  into §3.9, §5.3, §5.4, §5.5, §6.2 (use verbatim in Phase 11).

---

## 12. Risk Register R01–R10 (verbatim from xlsx — reuse exactly)

| ID | Risk | Category | P | I | Score | Severity | Status |
|---|---|---|---|---|---|---|---|
| R01 | Insufficient literature connecting BPMN to software-architecture artefacts | Academic | 2 | 3 | 6 | Medium | Open |
| R02 | Scope creep — BPMN discussion drifts into business process reengineering | Scope | 3 | 4 | 12 | High | Open |
| R03 | Inconsistency between BPMN models and implementation artefacts | Technical | 3 | 5 | 15 | Critical | Open |
| R04 | Project schedule delay due to parallel academic and technical tasks | Schedule | 3 | 4 | 12 | High | Open |
| R05 | BPMN diagrams become overly complex and reduce stakeholder readability | Technical | 2 | 3 | 6 | Medium | Open |
| R06 | EduMetric CRM implementation incomplete at submission | Technical | 2 | 4 | 8 | Medium | Open |
| R07 | Traceability links break when architecture or DB changes | Technical | 2 | 4 | 8 | Medium | Open |
| R08 | Academic sources unavailable through university library | Academic | 2 | 3 | 6 | Medium | Open |
| R09 | Reflective chapter lacks genuine critical depth (Ch 7) | Academic | 2 | 3 | 6 | Medium | Open |
| R10 | Artefact inconsistency across chapters (module names, endpoint paths) | Quality | 3 | 4 | 12 | High | Open |

Full mitigation/contingency/owner columns are in the xlsx (Appendix C / Table 3.3). Owner = Researcher for all.

---

## 13. Project Gantt — 6 phases / 24 weeks (from xlsx — mirror exactly)

| Phase | Tasks (★ = milestone) | Weeks |
|---|---|---|
| **1 Research Foundation** | ★ Proposal & Approval (W1–2); Identify/Review sources (W2–4); Lit-review draft Ch2 (W3–6); ★ Finalise Lit Review (W6) | W1–6 |
| **2 Methodology & Planning** | Research philosophy (W4–5); Write Ch3 (W5–6); Finalise Risk Register & Gantt (W5); Ethics docs (W5) | W4–6 |
| **3 BPMN Modelling** | Model P1 Auth & P2 Attendance (W7); P3 Evaluation & P4 Analytics (W8); P5 At-Risk & P6 Admin (W9); ★ BPMN Complete (W10) | W7–10 |
| **4 Architecture & Design** | C4 + Modules (W10–11); ERD & Schema (W11–12); API endpoint mapping (W12–13); Traceability matrix all 6 (W11–13); ★ Architecture Complete (W14) | W10–14 |
| **5 Analysis & Writing** | Write Ch4 (W14–16); Ch5 (W16–18); Ch6 (W18–19); Ch7 (W19–20); Ch1 (W20); ★ First Full Draft (W21) | W14–21 |
| **6 Review & Submission** | Supervisor review (W21–22); Revision & proofreading (W22–23); Appendices A–K (W22–23); ★ Final Submission (W24) | W21–24 |

*(Note: DOCUMENTATION.md Part F/G sometimes says "5 phases" — the xlsx has **6** phases. The 5 named
in §3.4 — Research Foundation, Methodology & Planning, BPMN Modelling, Architecture & Design,
Analysis & Writing — plus phase 6 Review & Submission. Use all 6 in Fig 3.2.)*

---

## 14. Open `⟨STUDENT INPUT⟩` items (carried forward)

- Title page: full name, student ID, group, supervisor, submission date.
- All 12 screenshots (Fig J.1–J.10, Fig 3.4, Appendix K test screenshots).
- Ethics signature/date (Appendix D); real logbook dates (Appendix G); supervisor meeting records (Appendix H).
- Any genuine survey/personal-feeling content in Chapter 7.
