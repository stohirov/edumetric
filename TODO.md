# EduMetric LMS — Roadmap to a Solid LMS

This document tracks everything needed to turn the current EduMetric prototype into a
production-grade Learning Management System.

**Stack:** Spring Boot (Java) backend · Next.js frontend · PostgreSQL + Liquibase · MinIO (file storage) · JWT auth.

**Current roles:** `ADMIN`, `TEACHER`, `STUDENT`.

Legend: `[ ]` not started · `[~]` partial / in progress · `[x]` done

---

## 0. Finish & Stabilize What Exists (do first)

These are started but incomplete — close them before building new things.

- [x] **Homework module** — student + teacher flows wired end-to-end (committed).
  - [x] MinIO client dependency present in `backend/pom.xml`; `StorageConfig`/`MinioProperties` registered via `@ConfigurationPropertiesScan`.
  - [x] File persistence wired and verified: lazy bucket creation, multipart upload, streaming download (`FileStorageService`) — live MinIO round-trip confirmed working.
  - [x] Teacher-side homework: `AssignmentController` (create/list/update/delete with due dates), teacher submission listing + file download, inline grading. New teacher page at `/teacher/homework`.
  - [x] Server-side file validation: 25 MB cap + blocked executable/script extensions (`HomeworkService.validateFile`).
  - [x] Late-submission + resubmission: `overdue` flag computed per assignment; resubmit upserts the single (student, assignment) row.
  - [x] Commit the new files (`homework/`, `grades/Assignment*`, `config/`, migration `005`, frontend `homework/` + `assignments` API).
- [x] **Settings module** — profile/password editing live for all roles.
  - [x] Profile + password change via `ProfileSettingsCard`. Now backed by a self-service `PATCH /api/profile` endpoint (`ProfileController`) so non-admins can edit their own account — the old path hit the ADMIN-only `UserController` and 403'd for students/teachers.
  - [x] Teacher settings page (`/teacher/settings`) + nav entry. `ProfileSettingsCard` is role-agnostic and reused across all three roles.
  - [x] Admin settings: institution name, branding (primary color + logo URL), grading scale (`PERCENT`/`LETTER`/`GPA_4`), at-risk threshold, default locale — `InstitutionSettingsCard` on `/admin/settings`.
  - [x] Notification prefs (email + in-app toggles) + language persistence — persisted on `users` (migration `006`) and surfaced in `/api/auth/me`, `/api/profile`; saving a language syncs the UI locale.
  - [x] Backend settings controller/service + persistence — `settings/` slice: `InstitutionSettings` (singleton, migration `007`), `SettingsService`, `SettingsController` (GET any auth, PATCH ADMIN).
- [x] Build + lint pass: backend `compile`/`test-compile` clean; frontend `tsc --noEmit` clean and all changed files lint-clean. _Pre-existing `react-hooks/set-state-in-effect` errors remain in untouched `add-*-dialog.tsx` / provider files — tracked separately under §12._

---

## 1. Authentication & Account Security

- [x] JWT login/logout exists, now with refresh tokens (see below).
- [x] **Refresh token / silent re-auth** so sessions don't hard-expire mid-use —
  short-lived access JWT (30 min) + opaque, rotating refresh tokens (30 days) stored
  SHA-256-hashed (migration `010-refresh-tokens`). `POST /api/auth/refresh` rotates the
  token (single-use; reuse of a revoked token revokes the whole family) and mints a new
  access token; `/logout` revokes it. `RefreshTokenService` also exposes `revokeAllForUser`
  for future logout-all/session management. Frontend client does single-flight silent
  refresh on any 401 and retries the original request once. Transport mirrors the existing
  Bearer-token-in-localStorage model (plus an httpOnly `em_refresh` cookie); the real wins
  are short access TTL + server-side revocation + reuse detection.
- [x] **Password reset flow** (token) — `POST /api/auth/forgot-password` issues a
  single-use SHA-256-hashed token (30 min TTL, prior tokens invalidated); `POST
  /api/auth/reset-password` consumes it. Public `/forgot-password` + `/reset-password`
  pages wired from the login screen. Email delivery not yet wired (TODO §7) — the raw
  token is logged server-side for dev delivery. Audit events: `PASSWORD_RESET_REQUEST`,
  `PASSWORD_RESET`. Migration `008-password-reset-tokens`.
- [x] **Forced password change on first login** for provisioned accounts —
  `must_change_password` flag (migration `009`) set on admin create/password-reset of
  another user, cleared when the owner picks their own password (self-service profile or
  reset-password). Surfaced on `UserDto` / `/api/auth/me`; frontend forces a standalone
  `/change-password` screen via `RouteGuard` + post-login redirect until cleared.
- [x] **Password policy** (min length, complexity) — `PasswordPolicy` validator (min 8,
  upper/lower/digit) enforced on admin user create/update, self-service profile change,
  and password reset. Breach check still optional/not wired.
- [x] **Account lockout / rate limiting** on login (brute-force protection) —
  `LoginAttemptService` tracks consecutive failures per account; 5 failures locks for 15
  min (`locked_until`, migration `009`), enforced via `AuthenticatedUser#isAccountNonLocked`
  → `LockedException` mapped to HTTP 423. Counter resets on success; an expired lock starts
  a fresh window. Login form surfaces the 423 message.
- [ ] **Email verification** for new accounts.
- [ ] **2FA / MFA** (TOTP) — at least for ADMIN.
- [ ] **Self-service profile** (name, avatar, contact info).
- [x] **Session management** — view/revoke active sessions; logout-all. Each
  refresh-token row is now a session carrying device metadata (User-Agent, IP,
  `last_used_at`) and a stable `created_at` preserved across rotation (migration
  `011-session-metadata`). `GET /api/auth/sessions` lists a user's active
  sessions and flags the caller's current one via the `em_refresh` cookie;
  `DELETE /api/auth/sessions/{id}` revokes one (ownership-scoped) and `POST
  /api/auth/sessions/revoke-others` is "log out everywhere else" (keeps the
  current token). Surfaced as a `SessionsCard` on all three role settings pages.
- [x] Audit log entries for auth events — `LOGIN`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`,
  `PASSWORD_CHANGE` (joining the existing `PASSWORD_RESET_REQUEST` / `PASSWORD_RESET`).

---

## 2. User & Enrollment Management

- [~] User/Student/Teacher CRUD exists with soft deletes.
- [ ] **Bulk import** users via CSV/Excel (students & teachers).
- [ ] **Self-registration / invite flow** (admin invites by email).
- [ ] **Parent/Guardian role** — read-only view of a linked student's progress.
- [ ] **Enrollment lifecycle** — enroll/unenroll/transfer students between groups with history.
- [ ] **Teacher ↔ group/course assignment UI** (assign multiple teachers/co-teachers).
- [ ] **User profile completeness** — phone, address, emergency contact, photo.
- [ ] **Deactivate vs. delete** distinction (suspend account, retain data).
- [ ] **Org structure** — departments/faculties, academic terms/semesters.

---

## 3. Course & Content Management (biggest LMS gap)

Currently courses are just metadata (code/name/description). A real LMS needs **content delivery**.

- [ ] **Course content / modules** — structured units, lessons with materials.
- [ ] **Learning materials** — upload/host documents, slides, PDFs, links, embedded video.
- [ ] **Lesson content pages** — rich text / markdown content per lesson, not just a scheduled slot.
- [ ] **Content sequencing & prerequisites** — unlock lessons in order, completion gating.
- [ ] **Resource library** — shared files per course/group.
- [ ] **Syllabus** — published course outline with objectives and schedule.
- [ ] **Course catalog & enrollment** — browse/request enrollment.
- [ ] **Versioning / drafts** for course content.
- [ ] **Quizzes / assessments engine** — auto-graded MCQ/short-answer, question bank, attempts, time limits.
- [ ] **Course completion / certificates**.

---

## 4. Assignments, Grading & Assessment

- [~] Assignments + grades + bulk grading exist; homework submission exists.
- [ ] **Unified assignment model** — reconcile `assignments`/`grades` with `homework_submissions` (currently parallel concepts).
- [ ] **Rubrics** — criteria-based grading.
- [ ] **Grade categories & weighting** per course; configurable grading scales (letter/percent/GPA).
- [ ] **Gradebook view** — full matrix (students × assignments) for teachers with export.
- [ ] **Feedback & annotations** on submissions (inline comments, returned files).
- [ ] **Plagiarism/similarity check** hook (optional).
- [ ] **Peer review** assignments (optional).
- [ ] **Grade appeals / regrade requests** workflow.
- [ ] **Final grade computation & transcripts** per term.

---

## 5. Attendance

- [~] Mark present/late/absent/excused per lesson exists.
- [ ] **Bulk/quick mark** whole group + default-present.
- [ ] **Attendance reports** per student/group/term with % and trends.
- [ ] **Self check-in** (QR/code) option.
- [ ] **Absence justification workflow** (student submits excuse → teacher/admin approves).
- [ ] **Configurable attendance policy** & automatic at-risk flag on threshold.
- [ ] **Notifications** to student/parent on absence.

---

## 6. Metrics, Analytics & Reporting

- [~] Composite-score engine (7 dimensions + bonuses), snapshots, at-risk detection, admin/teacher dashboards exist.
- [ ] **Async/queued recompute** — currently live/synchronous; will not scale. Move to background jobs.
- [ ] **Scheduled snapshot job** — guarantee daily snapshots (cron) rather than on-demand only.
- [ ] **Formula audit & preview** — simulate formula changes before activating; show impact.
- [ ] **Configurable at-risk rules** (multi-factor, not just composite threshold).
- [ ] **Report export** — PDF/CSV/Excel for dashboards, gradebooks, attendance.
- [ ] **Scheduled report delivery** (email weekly summary to teachers/parents).
- [ ] **Cohort comparison** & longitudinal term-over-term analytics.
- [ ] **Per-student progress report** (printable).
- [ ] **Data accuracy** — handle small sample sizes / missing data gracefully in scores.

---

## 7. Communication & Notifications

Entirely missing — a solid LMS needs this.

- [ ] **In-app notification center** (bell + feed).
- [ ] **Email notifications** (grades posted, homework due, absence, announcements).
- [ ] **Announcements** — admin → all, teacher → group.
- [ ] **Messaging** — teacher ↔ student/parent direct or group messaging.
- [ ] **Push / browser notifications** (optional).
- [ ] **Notification preferences** per user.
- [ ] **Reminders** — upcoming due dates, lessons.

---

## 8. Calendar & Scheduling

- [~] Lessons have scheduled datetimes.
- [ ] **Calendar view** — per student/teacher/group (day/week/month).
- [ ] **Timetable / recurring lessons** (weekly schedule generation).
- [ ] **Due-date calendar** for assignments/homework.
- [ ] **iCal/Google Calendar export/sync**.
- [ ] **Room/resource booking** (optional).
- [ ] **Conflict detection** (teacher double-booked).

---

## 9. Internationalization & Accessibility

- [~] i18n dictionaries exist (en/ru/uz).
- [ ] **Complete translation coverage** — audit for hardcoded strings; cover new features.
- [ ] **Locale-aware dates/numbers** throughout.
- [ ] **RTL support** if needed.
- [ ] **WCAG 2.1 AA accessibility** — keyboard nav, ARIA, contrast, screen-reader labels.
- [ ] **Timezone handling** — store UTC, display in user's timezone consistently.

---

## 10. Security, Privacy & Compliance

- [ ] **Authorization test coverage** — verify data scoping (teacher can't read other groups; student can't read others' data).
- [ ] **Input validation & sanitization** on all endpoints; XSS protection on rich content.
- [ ] **File upload security** — type/size validation, virus scan, no path traversal, signed download URLs.
- [ ] **Rate limiting / abuse protection** API-wide.
- [ ] **CORS, CSRF, security headers** review (CSP, HSTS).
- [ ] **Secrets management** — no secrets in config; use env/vault.
- [ ] **PII / data privacy** — GDPR-style data export & deletion (right to be forgotten); consent.
- [ ] **Audit log** — extend coverage, immutability, retention, admin viewer UI.
- [ ] **Backups & disaster recovery** for DB and file storage.
- [ ] **Dependency/vulnerability scanning** (Dependabot / OWASP).

---

## 11. Performance & Scalability

- [ ] **N+1 query audit** (JPA) across analytics/dashboard queries.
- [ ] **Pagination** on all list endpoints (users, students, grades, etc.).
- [ ] **Caching** for expensive analytics (Redis or in-memory with eviction).
- [ ] **Background job infrastructure** (metrics recompute, reports, emails) — queue/scheduler.
- [ ] **Database indexing review** for query hot paths.
- [ ] **Load/performance testing** of dashboards under realistic data volume.
- [ ] **API response envelopes** consistent + proper HTTP status codes (not 200-for-errors).

---

## 12. Testing & Quality

- [ ] **Backend unit tests** — services, metrics formula engine especially.
- [ ] **Backend integration tests** — Testcontainers (Postgres + MinIO), endpoint/auth tests.
- [ ] **Frontend unit/component tests** (Vitest/Jest + Testing Library).
- [ ] **E2E tests** (Playwright) for critical flows: login, mark attendance, submit homework, view metrics.
- [ ] **Contract/API tests** to keep frontend types in sync with backend DTOs.
- [ ] **Coverage targets & enforcement** in CI.
- [ ] **Seed/demo data** generator for testing and demos.

---

## 13. DevOps, Deployment & Observability

- [ ] **Dockerize** backend, frontend, and dependencies (Postgres, MinIO) via docker-compose.
- [ ] **CI pipeline** — build, test, lint on PR.
- [ ] **CD pipeline** — automated deploy to staging/prod.
- [ ] **Environment config** — dev/staging/prod profiles; documented env vars.
- [ ] **Health checks & readiness probes** (Spring Actuator).
- [ ] **Structured logging** + log aggregation.
- [ ] **Metrics & monitoring** (Prometheus/Grafana) + alerting.
- [ ] **Error tracking** (Sentry or similar) front + back.
- [ ] **Database migration strategy** for production (Liquibase already in place — add rollback plans).

---

## 14. Documentation & Developer Experience

- [ ] **API documentation** — OpenAPI/Swagger UI.
- [ ] **README** — setup, run, env vars, architecture overview.
- [ ] **CLAUDE.md / contributor guide** — conventions, module layout, how to add a feature.
- [ ] **User guides** per role (admin/teacher/student).
- [ ] **Architecture diagram & data model (ERD)** documentation.
- [ ] **Changelog / release notes** process.

---

## 15. Nice-to-Have / Future

- [ ] **Mobile app** or PWA.
- [ ] **LTI / SSO integration** (Google Workspace, Microsoft, SAML/OAuth) for institutions.
- [ ] **Discussion forums / Q&A** per course.
- [ ] **Live virtual classroom** integration (Zoom/Meet) + recordings.
- [ ] **Gamification** — badges, leaderboards (ties into existing metrics/activity).
- [ ] **AI study assistant / insights** (personalized recommendations from metrics).
- [ ] **Multi-tenancy** — support multiple institutions on one deployment.
- [ ] **Billing / payments** (if commercial).

---

## Suggested Priority Order

1. **Section 0** — finish homework + settings, get a clean build.
2. **Section 1** — auth hardening (password reset, refresh tokens, lockout).
3. **Section 3 & 4** — course content + unified assignment/grading (core LMS value).
4. **Section 7 & 8** — notifications + calendar (engagement essentials).
5. **Section 10 & 12** — security audit + test coverage (before any real users).
6. **Section 13** — Docker + CI/CD (deployability).
7. Remaining sections as the product matures.
