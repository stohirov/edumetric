# EduMetric Backend — TODO

> Project plan organized by phase. Tasks reflect the 5-day hackathon timeline (master doc §26) and the architecture in `ARCHITECTURE.md`. Update statuses as work progresses.

**Legend:** `[ ]` open · `[~]` in progress · `[x]` done · `[!]` blocked · `(P0/P1/P2)` priority from master doc

---

## 0. Project setup (do first — currently incomplete)

### `pom.xml` dependencies — required by architecture but not yet added
- [x] Add `org.projectlombok:lombok` (`scope: provided`) — pinned to 1.18.44 (1.18.46 has Java 25 issues)
- [x] Add `spring-boot-starter-validation` (for `@Valid` on DTOs)
- [x] Add `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.6)
- [x] Add `org.springdoc:springdoc-openapi-starter-webmvc-ui` (2.7.0)
- [x] Add `org.testcontainers:postgresql` + `:junit-jupiter` (test scope, via testcontainers-bom)
- [x] Verify `spring-boot-maven-plugin` excludes Lombok from the fat jar
- [x] (extra) Added `spring-boot-starter-jackson` — Boot 4 doesn't pull `ObjectMapper`/`JsonMapper` transitively from webmvc
- [x] (extra) Configured `maven-compiler-plugin` with explicit `annotationProcessorPaths` for Lombok

### Project skeleton
- [x] Create `lombok.config` at project root (locks down dangerous defaults — see `CLAUDE.md`)
- [x] Create `application-dev.yaml` (local Postgres connection, seed runner enabled)
- [x] Create `application-prod.yaml` (env-driven config — `${DB_URL}`, `${JWT_SECRET}`, `${CORS_ORIGIN}`)
- [x] Configure Jackson: `JavaTimeModule`, `WRITE_DATES_AS_TIMESTAMPS=false`, camelCase strategy — done via `WebConfig.jsonMapper()` bean (Boot 4 `spring.jackson.*` property shape changed; can't use the YAML form)
- [x] Set `spring.jpa.open-in-view: false`
- [x] Set `spring.threads.virtual.enabled: true`
- [x] Verify `hibernate.ddl-auto: validate` (NEVER `update`)

### Local Postgres
- [ ] `docker run` Postgres 16 locally OR document a `docker-compose.dev.yml`
- [ ] Verify connection from `./mvnw spring-boot:run`

---

## 1. Day 1 — Foundation (Backend Dev 1)

### Liquibase v1 — core schema
- [x] Create `src/main/resources/db/changelog/db.changelog-master.yaml`
- [x] `v1-core/001-users.yaml` — users (id, email UNIQUE, password_hash, role, full_name, timestamps, deleted_at) + role CHECK constraint
- [x] `v1-core/002-teachers.yaml` — teachers (id, user_id FK UNIQUE, department, ...)
- [x] `v1-core/003-students.yaml` — students (id, user_id FK UNIQUE, group_id FK, enrolled_at, ...) — group_id FK added in 005 to honor file ordering
- [x] `v1-core/004-courses.yaml` — courses (id, name, code UNIQUE, description, ...)
- [x] `v1-core/005-groups.yaml` — groups (id, name, course_id FK, start_date, end_date, ...)
- [x] Add indexes: all FK columns, `students.group_id WHERE deleted_at IS NULL`
- [ ] Verify migrations run cleanly on a fresh Postgres

### Common / config layer
- [x] `common/api/ApiResponse.java` — generic envelope record
- [x] `common/api/PageResponse.java` — pagination record
- [x] `common/exception/` — `ResourceNotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`
- [x] `common/exception/GlobalExceptionHandler.java` (`@RestControllerAdvice`)
- [x] `common/audit/AuditableEntity.java` (`@MappedSuperclass`: createdAt, updatedAt, deletedAt)
- [x] `config/JpaConfig.java` with `@EnableJpaAuditing`
- [x] `config/WebConfig.java` (CORS allowed origins, JSON config)
- [x] `config/OpenApiConfig.java` — springdoc setup + Bearer auth scheme

### Security layer (BLOCKS frontend protected routes — finish Day 1 EOD)
- [x] `security/JwtProperties.java` (`@ConfigurationProperties("app.jwt")`) — placed in `config/` package
- [x] `security/JwtTokenProvider.java` (HS256, 24h expiry, signing key from env)
- [x] `security/CustomUserDetailsService.java` (loads `User` by email)
- [x] `security/AuthenticatedUser.java` — principal record (id, email, role)
- [x] `security/JwtAuthenticationFilter.java` (`OncePerRequestFilter`) — supports both `Authorization: Bearer …` and `em_token` httpOnly cookie
- [x] `config/SecurityConfig.java` — `SecurityFilterChain`, stateless, CSRF off, role hierarchy `ADMIN > TEACHER > STUDENT`, public paths configured
- [x] BCrypt `PasswordEncoder` bean

### Users & auth feature
- [x] `users/domain/User.java` entity + `Role` enum
- [x] `users/UserRepository.java`
- [x] `auth/dto/LoginRequest.java`, `LoginResponse.java`, `UserDto.java` (records)
- [x] `auth/AuthService.java` — login (verify password, issue JWT)
- [x] `auth/AuthController.java` — `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- [ ] Smoke test: login returns token, `/me` works with Bearer (needs running Postgres)

### Health
- [x] Expose `/actuator/health` (already in actuator starter, exposure narrowed in prod profile)
- [ ] Verify it returns 200 for nginx healthcheck

---

## 2. Day 2 — CRUD + Domain entities (parallel: Dev 1 core CRUD, Dev 2 domain)

### Dev 1 — Core CRUD (P0/P1)
- [x] `students/` — entity, repository, service, controller (paged list, get by id, create ADMIN, patch, soft delete)
- [x] `teachers/` — same pattern
- [x] `groups/` — same pattern + `GET /api/groups/{id}/students`
- [x] `courses/` — same pattern
- [x] `users/` — admin-only `POST /api/users`, `GET /api/users?role=`
- [x] `audit/` — `AuditLog` entity, `AuditLogService.log(...)` helper (uses `Propagation.REQUIRES_NEW` so audit failures don't poison the outer tx; not yet called from mutation paths — Day 5 wiring)
- [x] All controllers return `ResponseEntity<ApiResponse<T>>`
- [x] All list endpoints paginated (`Pageable`)
- [x] All write methods `@Transactional`, reads `@Transactional(readOnly = true)`
- [x] `@PreAuthorize` on every endpoint

### Dev 2 — Liquibase v2 (domain)
- [x] `v2-domain/001-lessons.yaml` (id, group_id, course_id, teacher_id, topic, scheduled_at)
- [x] `v2-domain/002-attendance.yaml` (id, student_id, lesson_id, status, marked_by_user_id, marked_at, comment) — `UNIQUE(student_id, lesson_id)` + status CHECK
- [x] `v2-domain/003-assignments-grades.yaml` — assignments (id, course_id, name, type CHECK, max_value, weight, due_date), grades (id, student_id, assignment_id, value, ...) `UNIQUE(student_id, assignment_id)` + value≥0 CHECK
- [x] `v2-domain/004-behavior-activity.yaml` — behavior_records + activity_records (id, student_id, teacher_id, period_start, period_end, value 1-5 CHECK, comment) + UNIQUE window per teacher
- [x] Indexes per master doc §20.3 (lessons by teacher/scheduled, attendance/grades/behavior/activity by student)

### Dev 2 — Domain entities & basic endpoints
- [x] `lessons/` — entity, repository, `GET /api/lessons/today` (current teacher), `GET /api/lessons/{id}/attendance`
- [x] `attendance/` — entity, `AttendanceStatus` enum (PRESENT, LATE, ABSENT, EXCUSED)
- [x] `attendance/AttendanceService.java` + `POST /api/attendance/bulk` (returns `Set<Long>` affected student IDs — recompute hook will consume this on Day 3)
- [x] `grades/` — `Grade`, `Assignment`, `AssignmentType` enum (THEORY, PRACTICAL, PROJECT, EXAM)
- [x] `grades/` endpoints: `POST /api/grades`, `POST /api/grades/bulk`, PATCH, DELETE
- [x] `behavior/` — `BehaviorRecord` + `ActivityRecord` entities, `POST /api/behavior`, `POST /api/behavior/bulk`, `POST /api/activity`

### Critical dep checkpoint
- [x] **EOD Day 2: auth + attendance + grade endpoints functional → frontend can build teacher forms**

---

## 3. Day 3 — Metrics engine + dashboard (Dev 2 lead, the centerpiece)

### Liquibase v3 — metrics tables
- [x] `v3-metrics/001-formula-config.yaml` (id, version UNIQUE, weight_* columns, is_active, created_at)
- [x] `v3-metrics/002-student-metrics.yaml` (id, student_id UNIQUE, composite_score, *_norm columns, growth_bonus, consistency_bonus, formula_version, sample_size, computed_at)
- [x] `v3-metrics/003-metric-snapshots.yaml` (id, student_id, snapshot_date, composite_score, all *_norm columns, UNIQUE(student_id, snapshot_date))
- [x] Seed `formula_config` with default weights (0.25/0.15/0.25/0.10/0.10/0.10/0.05, sum=1.0)

### MetricsEngine (PURE — no Spring, no JPA)
- [x] `metrics/engine/ScoreFormula.java` — record with weights + `apply(normalized)` method
- [x] `metrics/engine/ComputeContext.java` — record holding all inputs
- [x] `metrics/engine/ComputedMetrics.java` — record holding all outputs
- [x] `metrics/engine/normalizers/GradesNormalizer.java` — weighted avg of value/max × 100, weighted by `assignment.weight`; empty → 50 neutral
- [x] `metrics/engine/normalizers/AttendanceNormalizer.java` — PRESENT=1.0, LATE=0.7, ABSENT=0.0, EXCUSED excluded from denominator
- [x] `metrics/engine/normalizers/PracticalNormalizer.java` — same as grades, filtered to PRACTICAL|PROJECT
- [x] `metrics/engine/normalizers/RatingNormalizer.java` — shared by behavior + activity: avg (1–5) → (avg-1)/4 × 100
- [x] `metrics/engine/GrowthBonus.java` — recent 4w avg − previous 4w avg, `clamp(50 + Δ×5, 0, 100)`, insufficient data → 50
- [x] `metrics/engine/ConsistencyBonus.java` — stddev of last 8 snapshots → `max(0, 100 − stddev×5)`, <3 snapshots → 50
- [x] `metrics/engine/MetricsEngine.java` — composes all normalizers, applies formula, clamps to [0,100]
- [x] **Unit tests: 13 cases — empty data, insufficient samples, all dimensions zero/full, EXCUSED behavior, weight clamping, growth+consistency edges**

### MetricsService (orchestration)
- [x] `metrics/MetricsService.recompute(studentId)` — loads data, calls engine, upserts `student_metrics`
- [x] `metrics/MetricsService.recomputeAll()` — paged (1000 students/tx), triggered by formula change
- [x] Insufficient-data floor: `<5 grades` → `student_metrics.composite_score = null`, DTO exposes `insufficientData: true`
- [x] `MetricsController` — `GET /api/students/{id}/metrics`, `GET /api/students/{id}/metrics/trend`, `POST /api/metrics/recompute/{studentId}`, `POST /api/metrics/recompute-all`, `GET /api/metrics/formula`, `PUT /api/metrics/formula`

### Recompute hooks (in-transaction, sync)
- [x] `AttendanceService.bulkUpsert` → `metricsService.recomputeAll(affectedStudentIds)` in same tx
- [x] `GradeService` write paths (create/bulk/update/delete) → recompute in same tx
- [x] `BehaviorService` createBehavior / createActivity → recompute in same tx
- [x] Formula change (`PUT /api/metrics/formula`) → `recomputeAll()` after persisting new config

### The wow endpoint — student dashboard
- [x] `students/StudentDashboardService.java` — composes student + metrics + trend + breakdown + recent grades/attendance + 3 growth areas (weakest dims vs group)
- [x] `students/dto/StudentDashboardDto.java` — single composed response record
- [x] `GET /api/students/{id}/dashboard` — one endpoint, full payload
- [ ] (deferred) EntityGraph optimization — current loads are 4 queries per dashboard, acceptable for demo data sizes
- [x] Group comparison query — student percentile within group via `StudentMetricsRepository.countInGroupBelow / countInGroup`

### Snapshot job + seed for demo
- [x] `metrics/snapshot/SnapshotJob.java` — `@Scheduled(cron = "0 0 3 * * MON")`, writes one row per student to `metric_snapshots`
- [x] `seed/DemoSeedRunner.java` — CommandLineRunner under `@Profile("dev")`: 12 weeks of synthetic snapshots so trend charts populate on Day 1
- [x] Hardcoded demo accounts: `admin@edumetric.io / Demo2026!`, `teacher@edumetric.io / Demo2026!`, `student@edumetric.io / Demo2026!` (BCrypt via `PasswordEncoder` bean)
- [x] Realistic names (Uzbek/Russian/English mix), 9 students with profile-based distributions covering strong/mid/at-risk
- [x] Idempotent — re-runs detect existing admin user and skip
- [x] Code-based seed instead of YAML (allows hashed passwords + correlated multi-table inserts)

### Critical dep checkpoint
- [x] **Dashboard endpoint returns full payload — frontend can integrate the wow page**

---

## 4. Day 4 — Analytics, at-risk, polish (parallel)

### Analytics endpoints
- [x] `analytics/AnalyticsService.java`
- [x] `GET /api/analytics/admin/dashboard` — KPIs (student/group/teacher count, avg score, at-risk count), 10-bucket score histogram, top groups, teacher list (activity counters are placeholder zero — wire to grade/attendance/behavior write timestamps in a follow-up)
- [x] `GET /api/analytics/groups/{id}` — group breakdown (composite + per-dimension averages, per-student scores)
- [x] `GET /api/analytics/at-risk` — at-risk students scoped to caller's role (admin = org, teacher = own groups via `LessonRepository.findGroupIdsForTeacherUser`, student = 403)
- [x] At-risk threshold: composite < 50 (primary reason picks attendance < 70 first, then low composite)
- [x] Each at-risk student returns a primary "reason" string

### Performance pass
- [ ] `EXPLAIN ANALYZE` on dashboard query, at-risk query, admin analytics query — pending real load
- [ ] Add missing indexes if any query > 100ms on seed data — pending profile
- [x] `student_metrics` denormalization is hit on reads (dashboard/analytics never re-invoke the engine)

### Polish
- [ ] Swagger UI fully usable — every endpoint documented with example responses (springdoc already mounted; example annotations pending)
- [x] `application-prod.yaml` Actuator endpoints exposure already narrowed
- [x] Error responses consistent — all controllers return `ResponseEntity<ApiResponse<T>>` and `GlobalExceptionHandler` handles exception types uniformly
- [ ] Log levels sensible: INFO in service entry points, DEBUG for engine internals (dev profile currently DEBUG-wide)

---

## 5. Day 5 — Liquibase v4 + deploy + demo prep

### Liquibase v4 — audit
- [x] `v4-audit/001-audit-log.yaml` — id, entity_type, entity_id, action, actor_user_id FK, payload JSONB, created_at (built early alongside `AuditLogService`)
- [x] Indexes: `(entity_type, entity_id)`, `actor_user_id`
- [x] Wire `AuditLogService` calls into high-value mutations: bulk attendance (`AttendanceService`), formula change + recompute (`MetricsController`), user create (`UserService.create`)
- [ ] (follow-up) Wire user delete + role change once those endpoints exist

### Pre-demo checklist (master doc §29.2)
- [ ] All seed accounts working, credentials tested
- [ ] Three browser profiles pre-logged-in (admin/teacher/student)
- [ ] 2–3 "good demo students" memorized for storytelling
- [ ] Backup video recorded
- [ ] Local laptop with running build standby
- [ ] Network tested at venue or tethered backup
- [ ] `pg_dump` taken right before demo — restore script tested

### Deployment safety nets
- [ ] Daily VPS snapshot enabled (DigitalOcean/Hetzner)
- [ ] Manual `pg_dump` archive (Risk #2)
- [ ] Backend dev has SSH access as backup
- [ ] Demo video recorded as ultimate fallback

---

## 6. Cross-cutting / nice-to-have

### Testing
- [ ] Testcontainers Postgres integration test for one full flow (login → bulk attendance → dashboard reflects new score)
- [ ] Integration test for formula change → `recomputeAll()` correctness
- [x] Unit tests on engine + normalizers (13 cases, boundary 0/100/empty/insufficient/volatile) — `MetricsEngineTest`

### Tech debt to NOT take on during hackathon
- [ ] (post-hackathon) MapStruct for mappers
- [ ] (post-hackathon) Async recompute via queue
- [ ] (post-hackathon) Redis cache for org-level aggregates
- [ ] (post-hackathon) API versioning (`/api/v1`)
- [ ] (post-hackathon) Per-group normalization (z-score within group) for teacher bias correction
- [ ] (post-hackathon) Refresh tokens (currently expired = re-login)
- [ ] (post-hackathon) Per-school multi-tenancy (partition by `school_id`)

---

## 7. Out of scope — DO NOT BUILD

From master doc §3.3:
- [x] AI/ML predictions (transparency-over-magic principle, ethical issue)
- [x] Mobile native apps
- [x] Multi-tenant SaaS billing
- [x] LMS replacement (course content delivery)
- [x] Chat, video, messaging
- [x] Gamification (badges, leaderboards)
- [x] Third-party integrations (Moodle, Canvas)

If asked during demo Q&A, frame as deliberate roadmap items, not gaps.

---

## Status tracking

Update this section as work progresses:

- **Day 1 (Setup + Auth):** done — pending live login → /me smoke test against running Postgres
- **Day 2 (Core CRUD + Domain):** done — all entities, repos, services, controllers in place; v2-domain + v4-audit Liquibase changelogs written
- **Day 3 (Metrics + Dashboard):** done — v3-metrics changelogs, pure MetricsEngine + normalizers (13 unit tests), MetricsService orchestration, recompute hooks wired into all write paths, `GET /api/students/{id}/dashboard`, `SnapshotJob`, `DemoSeedRunner` covering 9 students × 12 weeks of synthetic snapshots
- **Day 4 (Analytics + Polish):** core done — `AnalyticsService` + `AnalyticsController` (admin dashboard, group analytics, at-risk scoped by role); EXPLAIN ANALYZE / Swagger example annotations still pending
- **Day 5 (Deploy + Demo):** partial — v4-audit changelog in place; audit calls wired for bulk attendance, formula change, user create; demo prep + deployment still pending

**Current state:** `./mvnw verify` is green (14/14 tests pass; full app + DemoSeedRunner exercises against the live local Postgres because the dev profile is active in tests). Ready for frontend integration on the metrics, dashboard, and analytics endpoints.
