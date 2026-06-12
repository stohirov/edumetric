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
- [x] **Email verification** for new accounts — `email_verified` flag on `users`
  (migration `014-email-verification`; existing accounts backfilled as verified so
  they aren't retroactively nagged). New accounts (admin user/student/teacher create)
  get a single-use SHA-256-hashed token (24 h TTL, prior tokens invalidated) issued
  on creation — mirrors the password-reset infra (`EmailVerificationService` +
  `email_verification_tokens` table). `POST /api/auth/verify-email` consumes a token;
  `POST /api/auth/resend-verification` re-issues (both public; always 200, never
  revealing account state). Email delivery not yet wired (TODO §7) — the raw token is
  logged server-side for dev. Verification is **non-blocking** (login still works
  unverified, since accounts are admin-provisioned and email isn't wired); state is
  surfaced on `UserDto`/`/me` as `emailVerified`. Public `/verify-email` page (auto-
  verifies from `?token=`, with a resend form) + an amber "verify your email" prompt
  with resend on `ProfileSettingsCard` (all roles). Audit: `EMAIL_VERIFICATION_REQUEST`,
  `EMAIL_VERIFIED`. Demo seed accounts are pre-verified.
- [x] **2FA / MFA** (TOTP) — opt-in for all roles (covers ADMIN). Self-implemented
  RFC 6238 TOTP + Base32 (`TotpService`, no new backend dep; verified against the
  RFC test vectors). Setup → QR (`otpauth://` URI, rendered client-side via
  `qrcode`) + manual key; `POST /api/auth/2fa/enable` verifies the first code,
  activates 2FA and returns 10 one-time backup codes (SHA-256-hashed,
  `mfa_backup_codes` table). Login is now two-step: a 2FA account gets `mfaRequired`
  + a 5-min `scope=MFA` challenge JWT (rejected everywhere except
  `/api/auth/2fa/verify`, which accepts a TOTP **or** backup code and issues the
  real tokens). `POST /api/auth/2fa/disable` re-verifies before clearing.
  Migration `012-two-factor` (users `totp_secret`/`totp_enabled` + backup-codes
  table); `twoFactorEnabled` on `UserDto`/`/me`. `TwoFactorCard` on all settings
  pages; login form shows the code step. Audit: `MFA_ENABLED`, `MFA_DISABLED`.
  _Mandatory enforcement for ADMIN left as a follow-up (currently opt-in)._
- [x] **Self-service profile** (name, avatar, contact info) — `users` gains `phone`,
  `address`, `avatar_key`, `avatar_content_type` (migration `013-user-profile-fields`).
  `PATCH /api/profile` now accepts `phone`/`address` (clearable — a blank value resets
  to null; phone validated for shape). Avatar handled out-of-band via multipart:
  `POST /api/profile/avatar` (image-only allowlist — JPEG/PNG/WebP/GIF, 5 MB cap —
  stored in MinIO under a stable per-user key so re-upload overwrites), `DELETE
  /api/profile/avatar`, and `GET /api/profile/avatar` (streams inline). `UserDto`/`/me`
  expose `phone`, `address`, and `avatarUrl` (relative path, null when unset).
  `ProfileSettingsCard` (reused across all three roles) gains an avatar uploader with
  initials fallback + live preview and phone/address fields. Audit: `AVATAR_UPDATE`,
  `AVATAR_REMOVE`. Reuses the homework `FileStorageService`.
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
- [x] **Bulk import** users via CSV — `bulkimport/` slice: `POST /api/admin/import/{students,teachers}`
  (multipart CSV, dependency-free parser) reuses `StudentService`/`TeacherService.create` per row,
  returns `BulkImportResultDto` (total/created/failed + per-row errors). Admin page `/admin/imports`.
- [x] **Self-registration / invite flow** — `invitations/` slice (migration `v1-core/019`): admin
  creates an `Invitation` (email + role + optional group), SHA-256-hashed single-use token (7-day TTL,
  raw token returned once / logged for dev). Public `GET /api/invitations/preview/{token}` +
  `POST /api/invitations/accept` (permitAll) let the invitee set their own password — provisions the
  User (+ Student/Teacher row), `emailVerified=true`. Admin page `/admin/invitations` (build link +
  copy) + public `/invite?token=` accept page. Audit: `INVITATION_CREATED/ACCEPTED/REVOKED`.
- [x] **Parent/Guardian role** — new `Role.PARENT` (+ role CHECK migration `v1-core/018`). `parent_links`
  table + `parents/` slice: admin links parent↔student (`/api/parent-links`); parent reads only their
  linked children (`GET /api/parents/me/children`, `/children/{id}/dashboard`, ownership-enforced).
  Full frontend parent experience at `/parent` (children + read-only child dashboard, settings,
  notifications), wired through `roleHomePath`/`RouteGuard`/navigation.
- [x] **Enrollment lifecycle** — `enrollment/` slice (migration `v2-domain/009`): `Enrollment` history
  rows (ACTIVE/WITHDRAWN/TRANSFERRED/COMPLETED). `POST /api/enrollments/{enroll,transfer,withdraw}`
  keep `students.group_id` in sync and append history; `GET /api/enrollments/student/{id}`. Admin page
  `/admin/enrollment` (enroll/transfer/withdraw + history timeline).
- [x] **Teacher ↔ course assignment** — `teaching/` slice (migration `v2-domain/010`): `course_teachers`
  (LEAD / CO_TEACHER) via `/api/course-teachers`. Admin page `/admin/teaching` (assign/unassign multiple
  teachers per course).
- [x] **User profile completeness** — phone/address/avatar (§1) plus `emergency_contact` and
  `department_id` on `users` (migration `v1-core/017`), surfaced on `UserDto` and editable via the
  admin user update.
- [x] **Deactivate vs. delete** distinction — `AccountStatus` (ACTIVE/SUSPENDED) on `users`
  (migration `v1-core/017`); `POST /api/users/{id}/suspend|reactivate` retains all data while
  `AuthenticatedUser#isEnabled` blocks a suspended account from authenticating. Audit:
  `USER_SUSPEND/REACTIVATE`.
- [x] **Org structure** — `organization/` slice (migrations `v1-core/015,016`): `Department` and
  `AcademicTerm` (single `current` term) CRUD via `/api/departments` + `/api/academic-terms`. Admin
  pages `/admin/departments` and `/admin/terms`.

---

## 3. Course & Content Management (biggest LMS gap)

Currently courses are just metadata (code/name/description). A real LMS needs **content delivery**.

- [x] **Course content / modules** — `content/` slice: `CourseModule` (course-scoped, ordered via
  `position`, draft/`published`) groups ordered `CourseMaterial`s (migration `v2-domain/006-course-content`).
  Teacher/admin authoring at `/teacher/content` (course selector → module + material CRUD, publish
  toggles), scoped via `TeacherScope.assertTeachesCourse`. Students read the published curriculum of
  their own course at `/student/content`.
- [x] **Learning materials** — `CourseMaterial` with four `MaterialType`s: `PAGE` (inline markdown),
  `FILE` (uploaded to MinIO via the shared `FileStorageService`; 50 MB cap + blocked-extension
  allowlist; `POST/GET /api/materials/{id}/file`), `LINK`, and `VIDEO` (embedded external URL).
- [x] **Lesson content pages** — rich-text/markdown authored inline as `PAGE` materials (the existing
  `lessons` table stays a scheduling concept; curriculum content is the new module/material tree).
- [x] **Content sequencing & prerequisites** — ordering (`position`) + draft/publish gating + per-student
  completion tracking, now with **hard prerequisite locking**: a module can reference a
  `prerequisite_module_id` (migration `v2-domain/011`); a student's module stays `locked` until they
  complete every published material of its prerequisite (`ContentService` computes lock state and
  blocks complete/download on locked modules). Teacher module form picks a prerequisite; student
  content greys out locked modules.
- [x] **Resource library** — `library/` slice: `GET /api/library` returns a flat cross-course list of all
  published FILE materials (student → own course, teacher/admin → all). Pages `/teacher/library` and
  `/student/library` (searchable, download via the existing material endpoints).
- [x] **Syllabus** — `syllabus/` slice (migration `v2-domain/012`): one `Syllabus` per course
  (objectives + outline, published flag). Teacher editor `/teacher/syllabus` (`PUT /api/syllabus`),
  students read the published syllabus of their course at `/student/syllabus` (`GET /api/syllabus/me`).
- [x] **Course catalog & enrollment** — `catalog/` slice (migration `v2-domain/013`): `GET /api/catalog`
  lists offerings (groups); students `POST /api/catalog/requests` to request enrollment; admins
  approve/reject (`/api/catalog/requests/{id}/approve|reject`) — approval calls `EnrollmentService.enroll`.
  Student page `/student/catalog`, admin page `/admin/enrollment-requests`.
- [x] **Versioning / drafts** for course content — draft/`published` flags plus full **version history**:
  every material edit snapshots the prior state into `material_versions` (migration `v2-domain/014`);
  `GET /api/materials/{id}/versions` + `POST /api/materials/{id}/versions/{versionId}/restore` (rollback,
  itself snapshotted). Teacher material editor exposes a history panel with restore.
- [x] **Quizzes / assessments engine** — `quizzes/` slice (migrations `v2-domain/007-quizzes`):
  `Quiz` → `QuizQuestion` → `QuizOption`, with `QuizAttempt` + `QuizAttemptAnswer`. Question types
  `SINGLE_CHOICE`/`MULTIPLE_CHOICE`/`TRUE_FALSE`/`SHORT_ANSWER`, all **auto-graded** on submit
  (`QuizAttemptService`: exact-set match for choices, case-insensitive accepted-answer match for short
  answer). Per-quiz options: time limit, max attempts (enforced), pass score (% pass/fail), shuffle,
  draft/publish. Teacher authoring at `/teacher/quizzes` (quiz settings + question builder via
  `PUT /api/quizzes/{id}/questions`, rejected once attempts exist); students take + see graded results
  at `/student/quizzes`. Take payloads never expose correct answers.
- [x] **Course completion / certificates** — `certificates/` slice (migration `v2-domain/015`): a student
  who has completed 100% of their course's published materials can `POST /api/certificates/claim` to mint
  a `CourseCompletion` with a unique `certificate_code`. `GET /api/certificates/me` lists them; public
  `GET /api/certificates/verify/{code}` (permitAll) verifies authenticity. Student page
  `/student/certificates` (claim + award cards) and a public `/verify` page.

---

## 4. Assignments, Grading & Assessment

- [~] Assignments + grades + bulk grading exist; homework submission exists.
- [~] **Unified assignment model** — reconcile `assignments`/`grades` with `homework_submissions`.
  The new `gradebook/` slice unifies the two ways a teacher produces marks: direct `Grade`s and
  graded homework submissions both hang off the same `Assignment`, and the gradebook surfaces a
  homework submission that is still awaiting a grade as a "submitted" cell. Writes still funnel
  through the single `POST /api/grades` upsert (the gradebook owns presentation, not mutation), so
  there's one course grade per student across all assignment types. _Quizzes remain a separate
  auto-graded surface; folding `quiz_attempts` into the same matrix and a true single submission
  table are still open._
- [x] **Rubrics** — `rubrics/` slice (migration `v2-domain/017`): a `Rubric` (per assignment) of
  ordered `RubricCriterion`s (label + max points). Teachers build/replace a rubric
  (`PUT /api/rubrics`), score a student per criterion (`POST /api/rubrics/score`, stored in
  `rubric_scores`) — the summed points are upserted as the assignment `Grade` via `GradeService`, so
  the gradebook reflects rubric grading. Teacher page `/teacher/rubrics` (builder + per-student scorer).
- [x] **Grade categories & weighting** — `gradecategories/` slice (migration `v2-domain/016`): named
  weighted `GradeCategory`s per course, and `assignments.category_id` so each assignment belongs to a
  category. Teacher page `/teacher/grade-categories` (CRUD + weight-sum hint). The institution
  `GradingScale` (`PERCENT`/`LETTER`/`GPA_4`) still renders every computed total via `GradeScale`.
  _(The live gradebook total remains per-assignment-weighted; a category-weighted rollup is the
  remaining refinement.)_
- [x] **Gradebook view** — full matrix (students × assignments) for teachers with export.
  `gradebook/` slice: `GET /api/gradebook?courseId=&groupId=` returns assignment columns × student
  rows with per-cell grade/submission state, per-column stats (graded/missing/avg), and a weighted
  per-student course grade rendered in the institution grading scale. Teacher page at `/teacher/grades`
  is now an editable matrix (click-a-cell inline grade entry → `/api/grades` upsert, optional group
  filter) with client-side CSV export. `GET /api/gradebook/me` powers a unified student course-grade
  view at `/student/grades` (course grade + per-assignment standing, no peer data exposed). Scoped via
  `TeacherScope.assertTeachesCourse`; read-only over existing tables (no migration).
- [x] **Feedback & annotations** on submissions — `feedback/` slice (migration `v2-domain/018`):
  teachers post written feedback per (assignment, student) via `POST /api/feedback`; students read
  their own (`GET /api/feedback/me?assignmentId=`). Teacher page `/teacher/feedback`, student page
  `/student/feedback`.
- [x] **Plagiarism/similarity check** hook — `plagiarism/` slice (migration `v2-domain/021`):
  `POST /api/plagiarism/check` runs a dependency-free Jaccard similarity over word 3-shingles of
  submitted texts and persists flagged pairs (≥30%) in `plagiarism_reports`. Teacher page
  `/teacher/plagiarism` (paste submissions → similarity matrix).
- [x] **Peer review** assignments — `peerreview/` slice (migration `v2-domain/022`): teachers assign
  reviewer→reviewee pairs per assignment (`POST /api/peer-reviews`); reviewers see their queue
  (`GET /api/peer-reviews/me`) and submit a score + comments (`/{id}/submit`, ownership-enforced).
  Teacher page `/teacher/peer-reviews`, student page `/student/peer-reviews`.
- [x] **Grade appeals / regrade requests** workflow — `appeals/` slice (migration `v2-domain/019`):
  a student opens an appeal on a graded assignment (`POST /api/appeals`); teachers/admins see pending
  appeals (course-scoped) and resolve (optionally writing a corrected grade via `GradeService`) or
  reject. Student page `/student/appeals`, teacher page `/teacher/appeals`.
- [x] **Final grade computation & transcripts** per term — `transcripts/` slice (migration
  `v2-domain/020`): `POST /api/transcripts/finalize` computes a weighted final percent per student
  (replicating the gradebook weighting), maps to letter (via `GradeScale`) + a 4.0 GPA, and upserts a
  `TermGrade` per (student, course, academic term). `GET /api/transcripts/me` is the student transcript;
  `/student/transcript` and teacher `/teacher/transcripts` (finalize + view).

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

The in-app foundation is in place (Section 7); email/messaging/push/reminders remain.

- [x] **In-app notification center** (bell + feed) — `notifications/` slice (migration
  `v2-domain/008-notifications`): per-user `Notification` rows with a reusable
  `NotificationService.notifyUser/notifyUsers` producer (honours the existing global
  `notifyInApp` pref) that other slices call. `GradeService` now raises `GRADE_POSTED`
  notifications on single + bulk grade entry, deep-linking to `/student/grades`.
  `GET /api/notifications` (top 50), `/unread-count`, `POST /{id}/read`, `/read-all`
  (all ownership-scoped). Frontend: a polling (30s) `NotificationBell` in the header
  (unread badge + dropdown feed, mark-read on click, mark-all-read) replacing the old
  static at-risk bell, plus a full `/notifications` feed page per role.
- [ ] **Email notifications** (grades posted, homework due, absence, announcements).
  _Blocked on email delivery still being unwired app-wide (TODO §1 / §7)._
- [x] **Announcements** — admin → all, teacher → group. `Announcement` entity +
  `AnnouncementService`/`AnnouncementController` (`POST/GET /api/announcements`).
  Admins target `ALL` (institution-wide) or any group; teachers may only target a group
  they teach (validated via `LessonRepository.findGroupIdsForTeacherUser`, else 403).
  Posting fans out `ANNOUNCEMENT` notifications to recipients (all users, or the group's
  students). Audit: `Announcement CREATED`. Teacher/admin composer pages at
  `/{teacher,admin}/announcements`; students see announcements inline in their feed.
- [ ] **Messaging** — teacher ↔ student/parent direct or group messaging.
- [ ] **Push / browser notifications** (optional).
- [~] **Notification preferences** per user — the global `notifyInApp`/`notifyEmail`
  toggles (settings) are honoured (in-app notifications are suppressed when a user opts
  out); per-event / per-channel granular prefs are not modelled yet.
- [ ] **Reminders** — upcoming due dates, lessons. _Needs a scheduler (see §11 background jobs)._

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
