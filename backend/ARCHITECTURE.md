# EduMetric Backend — Architecture

> System design for the EduMetric CRM backend. Source of truth for structural decisions. Operating conventions live in `CLAUDE.md`.

## 1. Architectural decisions

| Decision | Choice | Rationale |
|---|---|---|
| Deployment model | **Monolith** | One team, one VPS, 5-day hackathon. Microservices buy nothing here. |
| Database | **PostgreSQL 16 only** | No NoSQL. Relational is a perfect fit for the domain. |
| Cache | **Denormalized `student_metrics` table** for per-student reads; **Redis (read-through) for analytics dashboards** | The per-student "cache" is a Postgres row keyed by `student_id` — faster than a round-trip, survives restarts, no invalidation logic. The admin/teacher/cohort dashboards aggregate across *all* rows on every request, so they sit behind a short-TTL Spring Cache (Redis in prod, in-process fallback in dev/test). Evicted on full recompute / formula change; the live per-student recompute demo is never cached. See §6. |
| Message broker | **None** | One producer, one consumer, all in-process. Sync recompute is a feature, not a limitation — see §6. (Redis is used as a cache only, never as a broker.) |
| Auth | **JWT (HS256, 24h, stateless)** | No refresh tokens for MVP. Expired = re-login. |
| Real-time | **None** | No websockets. SWR polling every 5–10s on the frontend covers the "live recompute" demo moment. |
| Recompute strategy | **Synchronous, in-transaction** | Bulk attendance for 24 students ≈ 24 cheap recomputes in one tx. Demo trick: mark attendance → switch tab → score already changed. |
| Background work | **One `@Scheduled` weekly snapshot job** | Writes `metric_snapshots` row per student. That's the only async work in the system. |

The architecture is deliberately **debuggable over clever**. When humans depend on the result (a score that affects a student's standing), opacity is unacceptable.

## 2. High-level topology

```
                        BROWSER (User)
                              │ HTTPS
                              ▼
                  ┌────────────────────────────┐
                  │  NGINX (reverse proxy)     │
                  │   /        → Next.js :3000 │
                  │   /api/*   → Spring  :8080 │
                  └────────┬───────────┬───────┘
                           │           │
                           ▼           ▼
              ┌────────────────┐   ┌─────────────────────────┐
              │  Next.js (SSR) │   │  Spring Boot 4 API      │
              │  shadcn/ui     │   │  - REST controllers     │
              │  Recharts      │   │  - Services             │
              │  JWT in cookie │   │  - JPA repositories     │
              └────────────────┘   │  - Spring Security+JWT  │
                                   │  - Metrics engine       │
                                   └────────────┬────────────┘
                                                │ JDBC
                                                ▼
                                   ┌──────────────────────────┐
                                   │  PostgreSQL 16           │
                                   │  - core/domain tables    │
                                   │  - student_metrics cache │
                                   │  - metric_snapshots      │
                                   └──────────────────────────┘
```

All three runtimes (frontend, backend, postgres) live in one `docker-compose.yml` on a single VPS.

## 3. Package layout

Base package: `com.edumetric.backend`. Vertical slices — one package per feature.

```
com.edumetric.backend/
├── BackendApplication.java
├── config/
│   ├── SecurityConfig.java          ← filter chain, CORS, public paths
│   ├── JwtProperties.java           ← @ConfigurationProperties("app.jwt")
│   ├── OpenApiConfig.java           ← springdoc + Bearer auth
│   ├── JpaConfig.java               ← @EnableJpaAuditing
│   └── WebConfig.java               ← Jackson, ObjectMapper customization
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── CustomUserDetailsService.java
│   └── AuthenticatedUser.java       ← principal record
├── common/
│   ├── api/
│   │   ├── ApiResponse.java         ← record<T>(T data, String error, List<String> details)
│   │   └── PageResponse.java        ← record<T>(List<T> items, int page, int size, long total)
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   ├── BadRequestException.java
│   │   ├── ForbiddenException.java
│   │   ├── ConflictException.java
│   │   └── GlobalExceptionHandler.java   ← @RestControllerAdvice
│   └── audit/
│       └── AuditableEntity.java     ← @MappedSuperclass: createdAt, updatedAt, deletedAt
├── auth/                            ← login, me, logout
├── users/                           ← User (parent), Role enum
├── students/                        ← Student + StudentDashboardService (composes the wow endpoint)
├── teachers/
├── groups/
├── courses/
├── lessons/
├── attendance/                      ← high-frequency bulk upsert endpoint
├── grades/                          ← Grade, Assignment, AssignmentType
├── behavior/                        ← BehaviorRecord, ActivityRecord
├── metrics/
│   ├── domain/                      ← StudentMetrics, MetricSnapshot, FormulaConfig
│   ├── engine/
│   │   ├── MetricsEngine.java       ← pure compute, no Spring, no JPA, fully unit-testable
│   │   ├── normalizers/             ← GradesNormalizer, AttendanceNormalizer, ...
│   │   └── ScoreFormula.java        ← record holding weights + apply()
│   ├── MetricsService.java          ← orchestrates load → engine → save (in-tx)
│   ├── MetricsController.java
│   └── snapshot/SnapshotJob.java    ← @Scheduled weekly
├── analytics/                       ← admin dashboard composition, at-risk queries
└── audit/                           ← AuditLog entity + AuditLogService
```

**Rule:** never split horizontally (no `controllers/`, `services/`, `entities/` packages).

## 4. Layering

```
Controller  ← thin: parse, @Valid, delegate, map to DTO, return ResponseEntity<ApiResponse<T>>
    │
    ▼
 Service    ← business logic, @Transactional, calls engine / repos / other services
    │
    ▼
Repository  ← JpaRepository + @Query for hot paths
    │
    ▼
 Entity     ← Lombok-built, soft-deletable, owned by Liquibase (ddl-auto: validate)
```

- Controllers never call repositories.
- Services never return entities.
- DTOs are records, co-located with the feature.
- Mappers are plain static utility classes — no MapStruct (overkill for hackathon).

## 5. Security model

```
Request
   │
   ▼
JwtAuthenticationFilter (OncePerRequestFilter)
   ├─ reads Authorization: Bearer …  OR  httpOnly cookie "em_token"
   ├─ JwtTokenProvider.validate()    ← HS256, 24h, signing key from env
   ├─ loads UserDetails              ← CustomUserDetailsService
   └─ SecurityContextHolder.setAuthentication(...)
   │
   ▼
Controller — @PreAuthorize("hasRole('ADMIN')") etc.
   │
   ▼
Service — additional data-scoping (teacher → own groups, student → self)
```

- **Stateless session.** CSRF disabled (JWT covers it). CORS limited to frontend origin.
- **Role hierarchy** via `RoleHierarchyImpl`: `ADMIN > TEACHER > STUDENT`. Admin endpoints don't need explicit student exclusions.
- **Public endpoints:** `POST /api/auth/login`, `GET /api/health`, `/swagger-ui/**`, `/v3/api-docs/**`.
- **Method security** enabled via `@EnableMethodSecurity` for `@PreAuthorize`.
- **Password hashing:** BCrypt (strength 10).
- **Data-level auth** lives in service-layer query filters, NOT in `@PreAuthorize`. This is the single hardest correctness issue in a multi-role CRM — keep it in one place per feature.

## 6. The metrics engine — the centerpiece

Two-layer separation makes the math testable and the I/O transactional.

```
MetricsEngine (pure)
   Input:  ComputeContext record { grades, attendance, behavior, activity, snapshots, formula }
   Output: ComputedMetrics record { compositeScore, gradesNorm, attendanceNorm, ... }
   No Spring, no JPA, no time. 100% unit-testable.
        │
        ▼
MetricsService (orchestration)
   Loads data via repositories.
   Invokes MetricsEngine.
   Upserts into student_metrics.
   Writes audit_log entry.
   All inside one @Transactional.
```

### Formula (transparent, configurable)

```
composite = w_g  * grades_norm
          + w_a  * attendance_norm
          + w_p  * practical_norm
          + w_b  * behavior_norm
          + w_ac * activity_norm
          + w_gr * growth_bonus
          + w_c  * consistency_bonus
```

Default weights (sum = 1.0): `0.25 / 0.15 / 0.25 / 0.10 / 0.10 / 0.10 / 0.05`. Admin can edit; change triggers `recomputeAll()` paged at 1000 students/tx.

### Recompute triggers

| Event | Action |
|---|---|
| Attendance / Grade / Behavior / Activity write | Recompute each affected student in same tx |
| Formula weights change | Mark all metrics stale → batch-recompute (paged) |
| Dashboard open | Lazy recompute if stale relative to last data change |

### Why synchronous?

- **Bulk attendance (24 students) ≈ 200 ms total in one tx.** Within request budget.
- **Live recompute is a demo feature.** Doc §29.1 explicitly calls it out: mark attendance → switch tab → score reflects new value. A queue would *break* this.
- **One source of truth.** No "in-flight" recomputes diverging from DB state.

### Snapshot job

`@Scheduled(cron = "0 0 3 * * MON")` writes one row per student into `metric_snapshots`. Feeds the trend chart and growth-bonus calculation. In dev profile, a `CommandLineRunner` seeds 12 weeks of synthetic snapshots so trend charts have data on Day 1.

## 7. Database & migrations

Schema owned by **Liquibase**. `hibernate.ddl-auto: validate` — Hibernate never alters DDL.

### Changelog layout

```
src/main/resources/db/changelog/
├── db.changelog-master.yaml             ← entrypoint, includes only
├── v1-core/
│   ├── 001-users.yaml
│   ├── 002-teachers.yaml
│   ├── 003-students.yaml
│   ├── 004-courses.yaml
│   └── 005-groups.yaml
├── v2-domain/
│   ├── 001-lessons.yaml
│   ├── 002-attendance.yaml
│   ├── 003-assignments-grades.yaml
│   └── 004-behavior-activity.yaml
├── v3-metrics/
│   ├── 001-formula-config.yaml
│   ├── 002-student-metrics.yaml
│   └── 003-metric-snapshots.yaml
├── v4-audit/
│   └── 001-audit-log.yaml
└── seed/
    └── demo-data.yaml                   ← context: dev,demo (NOT prod)
```

### Tables (concise)

```
users           (id, email UNIQUE, password_hash, role CHECK IN (ADMIN,TEACHER,STUDENT),
                 full_name, timestamps, deleted_at)
students        (id, user_id FK UNIQUE, group_id FK, enrolled_at, timestamps, deleted_at)
teachers        (id, user_id FK UNIQUE, department, timestamps, deleted_at)
groups          (id, name, course_id FK, start_date, end_date, timestamps, deleted_at)
courses         (id, name, code UNIQUE, description, timestamps, deleted_at)

lessons         (id, group_id FK, course_id FK, teacher_id FK, topic, scheduled_at, timestamps)
attendance      (id, student_id FK, lesson_id FK, status CHECK (...),
                 marked_by_user_id FK, marked_at, comment,
                 UNIQUE(student_id, lesson_id))
assignments     (id, course_id FK, name, type CHECK IN (THEORY,PRACTICAL,PROJECT,EXAM),
                 max_value, weight, due_date, timestamps)
grades          (id, student_id FK, assignment_id FK, value, graded_by_user_id FK,
                 graded_at, comment, UNIQUE(student_id, assignment_id), CHECK(value >= 0))
behavior_records  (id, student_id FK, teacher_id FK, period_start, period_end,
                   value CHECK BETWEEN 1 AND 5, comment, created_at,
                   UNIQUE(student_id, teacher_id, period_start, period_end))
activity_records  (similar to behavior_records)

formula_config  (id, version UNIQUE, weight_grades, weight_attendance, weight_practical,
                 weight_behavior, weight_activity, weight_growth, weight_consistency,
                 is_active, created_at)
student_metrics (id, student_id FK UNIQUE, composite_score, *_norm columns,
                 growth_bonus, consistency_bonus, formula_version, sample_size, computed_at)
metric_snapshots (id, student_id FK, snapshot_date, composite_score, all *_norm columns,
                  UNIQUE(student_id, snapshot_date))
audit_log       (id, entity_type, entity_id, action, actor_user_id FK, payload JSONB, created_at)
```

### Integrity rules

- **FK constraints everywhere with `ON DELETE RESTRICT`** + soft-delete on top-level entities.
- **Soft delete on:** users, students, teachers, groups, courses (mutable lifecycle).
- **Hard delete on:** attendance, grades, behavior_records, activity_records — these are **immutable history**.
- **CHECK constraints** on enum-like columns and value ranges.
- **UNIQUE constraints** prevent duplicate attendance/grades.
- **Indexes** on all FK columns + composite indexes per doc §20.3.

### Liquibase rules

- One changeSet = one DDL action.
- Never edit a deployed changeSet (Liquibase verifies checksums, refuses to start otherwise) — always add new ones.
- Seed data uses `context: dev,demo` so prod stays clean.
- Tag at release boundaries (`<tagDatabase tag="v1.0-mvp"/>`).

## 8. API design

- Base path **`/api`**. No versioning yet (add `/v1` only when a real second consumer exists).
- All responses wrapped in **`ApiResponse<T>`**.
- **camelCase JSON.** ISO-8601 UTC timestamps. `JavaTimeModule`, `WRITE_DATES_AS_TIMESTAMPS=false`.
- Errors handled by `GlobalExceptionHandler` → `{ "error": "...", "details": [...] }` with proper HTTP status.
- **Pagination** default: `?page=0&size=20` (Spring `Pageable`).
- **One screen = one endpoint** (doc §18.5). The student dashboard fetches everything in a single `GET /api/students/{id}/dashboard` call — student info, current metrics, trend, breakdown, recent activity, growth areas.

### Endpoint inventory (abbreviated)

| Endpoint | Notes |
|---|---|
| `POST /api/auth/login` | Public. Returns `{ token, user }` + httpOnly cookie. |
| `GET  /api/auth/me` | Current user. |
| `GET  /api/students/{id}/dashboard` | **The wow endpoint** — composed response. |
| `POST /api/attendance/bulk` | **High-frequency.** Upsert all entries for a lesson in one tx + per-student recompute. |
| `POST /api/grades/bulk` | Same pattern for an assignment. |
| `GET  /api/metrics/formula` | Active formula config. |
| `PUT  /api/metrics/formula` | ADMIN. Updates weights → triggers `recomputeAll()`. |
| `POST /api/metrics/recompute/{studentId}` | ADMIN. Force single recompute. |
| `GET  /api/analytics/admin/dashboard` | Org-level KPIs, top groups, teacher activity. |
| `GET  /api/analytics/at-risk` | At-risk students scoped to caller's role. |

Full list: master doc §21.

## 9. Cross-cutting

### Exception handling
`GlobalExceptionHandler` with `@RestControllerAdvice` maps:
- `ResourceNotFoundException` → 404
- `BadRequestException` / `MethodArgumentNotValidException` → 400
- `ForbiddenException` / `AccessDeniedException` → 403
- `ConflictException` → 409
- Catch-all `Exception` → 500 with generic message (real cause logged)

### Auditing
- `@EnableJpaAuditing` on `JpaConfig`.
- `AuditableEntity` provides `createdAt`, `updatedAt`, `deletedAt`.
- High-value mutations (bulk attendance, formula change, user create/delete) write to `audit_log` from the service layer with a JSONB payload.

### Validation
- DTO records annotated with Jakarta Validation (`@NotNull`, `@Size`, `@Email`, `@Positive`, etc.).
- Controllers use `@Valid` on `@RequestBody`.
- Bean validation kicks in at the controller boundary; service layer can assume already-valid input.

### Threading
- `spring.threads.virtual.enabled: true` (Spring Boot 4 default-friendly). Tomcat serves each request on a virtual thread → cheap to block on JDBC, fits "sync recompute" perfectly.
- No `@Async` for now. The `@Scheduled` snapshot job runs on the default scheduler thread pool.

## 10. Build & runtime

### Maven layout
- `pom.xml` uses `spring-boot-starter-parent 4.0.6`.
- Profiles: `dev` (verbose logs, seed runner, H2 fallback optional), `prod` (env-driven config).
- `application.yaml` → defaults. `application-dev.yaml` / `application-prod.yaml` → overlays.

### Configuration (env-driven in prod)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.yaml
    contexts: ${LIQUIBASE_CONTEXTS:default}
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-minutes: 1440
  cors:
    allowed-origins: ${CORS_ORIGIN}
```

### Container
Multi-stage Dockerfile: Maven build stage → `eclipse-temurin:25-jre` runtime. JAR runs as non-root. Health endpoint: `/actuator/health` (mapped behind nginx as `/api/health`).

## 11. Risk-driven design notes

| Risk (master doc §31) | Architectural answer |
|---|---|
| #3 Metrics formula breaks on edge cases | `MetricsEngine` is pure & isolated → ≥10 unit tests on Day 2 |
| #5 Backend over-engineering | No MapStruct, no events, no CQRS, no Redis |
| #6 API contracts diverge | springdoc-openapi live from Day 1; DTOs co-located with controllers |
| #8 Git conflicts on shared files | Vertical packages → Dev 1 owns `auth/users/students/...`, Dev 2 owns `attendance/grades/metrics/...`. Minimal overlap. |
| #9 Performance on realistic data | Denormalized `student_metrics`, explicit indexes, `EntityGraph` on dashboard read, `EXPLAIN ANALYZE` audit on Day 4. |

## 12. What's deliberately out of scope

- ML / AI prediction of student outcomes (transparency philosophy — black-box decisions on humans are an ethical issue)
- Mobile native apps
- Multi-tenant SaaS billing
- LMS replacement (course content delivery)
- Chat / video / messaging
- Gamification (badges, leaderboards)
- Third-party integrations (Moodle, Canvas)

These items live on the post-hackathon roadmap and inform demo Q&A talking points, not current code.

---

*This document is the source of truth for system design. When it disagrees with code, fix one of them — never silently diverge.*
