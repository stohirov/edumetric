<!--
The six BPMN process models (Fig 4.6–4.11).
Each entry = (1) a formal BPMN 2.0 placeholder block for the student to draw in bpmn.io and export,
and (2) a Mermaid flowchart approximation (pools as subgraphs, real gateways/exceptions) so the
process is reviewable now. Phase 6 embeds these blocks verbatim into Chapter 4.
Grounded in FACTS.md §6 and the real controllers/services.
-->

## Fig 4.6 — P1 User Authentication

> 🟦 **[BPMN DIAGRAM — Figure 4.6: User Authentication]**
> **Pools:** User (Student/Teacher/Admin) · System
> **Happy path:** submit credentials → validate (load active user, BCrypt compare) → issue JWT (role claim) + rotating refresh token → resolve role → redirect to role dashboard → (later) logout → revoke refresh token
> **Gateways (real decisions):** *Credentials valid & account active?* (no → 401 `AUTH_INVALID_CREDENTIALS`; yes → issue token)
> **Exception paths:** invalid password / inactive account → 401; expired/invalid token on later requests → 401 (re-auth via refresh)
> **Maps to:** `auth/` (`AuthController`, `AuthService`) · `security/` (`JwtAuthenticationFilter`, `JwtTokenProvider`, `CustomUserDetailsService`) · `config/SecurityConfig` — entities `users`, `refresh_tokens` — endpoints `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/refresh`
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-6.png`
> **Caption:** *Figure 4.6 — User Authentication (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph U["Pool: User (Student / Teacher / Admin)"]
        start((Start)) --> submit["Submit credentials"]
        redirect["Land on role dashboard"] --> done((End))
        logoutReq["Request logout"]
    end
    subgraph S["Pool: System"]
        submit --> validate["Validate email format,<br/>load active user, BCrypt compare"]
        validate --> gw1{Credentials valid<br/>& account active?}
        gw1 -->|no| err["Return 401<br/>AUTH_INVALID_CREDENTIALS"] --> end3((End))
        gw1 -->|yes| issue["Issue JWT (role claim)<br/>+ rotating refresh token"]
        issue --> route["Resolve role to redirect path"] --> redirect
        logoutReq --> revoke["Revoke refresh token"] --> end2((End))
    end
```

---

## Fig 4.7 — P2 Attendance Management

> 🟦 **[BPMN DIAGRAM — Figure 4.7: Attendance Management]**
> **Pools:** Teacher · System
> **Happy path:** select lesson from own schedule → load enrolled students, default all PRESENT → mark exceptions (absent/late) → save → upsert (unique per student+lesson) → **synchronous metric recompute in the same transaction**
> **Gateways (real decisions):** *Lesson belongs to teacher?* (no → 403) · *Status in PRESENT/ABSENT/LATE?* (no → 400) · *Duplicate (student_id, lesson_id)?* (yes → 409)
> **Exception paths:** invalid status → 400; duplicate record → 409; not-own-lesson → 403
> **Maps to:** `attendance/` (`AttendanceController`, `AttendanceService`) · `lessons/` · `metrics/` (`MetricsService`) — entities `lessons`, `attendance` (UNIQUE `student_id,lesson_id`), `student_metrics` — endpoints `GET /api/lessons`, `GET /api/lessons/{id}/attendance`, `POST /api/attendance/bulk`
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-7.png`
> **Caption:** *Figure 4.7 — Attendance Management (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph T["Pool: Teacher"]
        s((Start)) --> sel["Select lesson from own schedule"]
        mark["Mark exceptions (absent / late)"] --> save["Save attendance"]
    end
    subgraph S["Pool: System"]
        sel --> gwOwn{Lesson belongs<br/>to teacher?}
        gwOwn -->|no| f403["403 Forbidden"]
        gwOwn -->|yes| load["Load enrolled students,<br/>default all PRESENT"] --> mark
        save --> gwStatus{Status in<br/>PRESENT/ABSENT/LATE?}
        gwStatus -->|no| f400["400 Bad Request"]
        gwStatus -->|yes| gwDup{Duplicate<br/>student_id + lesson_id?}
        gwDup -->|yes| f409["409 Conflict"]
        gwDup -->|no| persist["Upsert attendance"]
        persist --> recompute["Synchronous metric recompute<br/>(same transaction)"] --> e((End))
    end
```

---

## Fig 4.8 — P3 Student Evaluation

> 🟦 **[BPMN DIAGRAM — Figure 4.8: Student Evaluation]**
> **Pools:** Teacher · System
> **Happy path:** enter grade / behaviour / activity / practical mark → field-level validation → persist → load active formula → recompute composite score (same cycle) → upsert `student_metrics` + audit
> **Gateways (real decisions):** *Field-level validation passes?* (range/type/enum) · *Foreign keys satisfied?*
> **Exception paths:** grade > 100 → 400; behaviour score outside 1–5 → 400; unknown activity type → 400; missing `student_id` / FK → 422
> **Maps to:** `grades/`, `behavior/`, `gradebook/`, `gradecategories/`, `rubrics/`, `metrics/` (`MetricsEngine`, `MetricsService`) — entities `assignments`, `grades`, `behavior_records`, `activity_records`, `formula_config`, `student_metrics` — endpoints `POST /api/grades`, `POST /api/grades/bulk`, `POST /api/behavior`, `POST /api/activity`
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-8.png`
> **Caption:** *Figure 4.8 — Student Evaluation (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph T["Pool: Teacher"]
        s((Start)) --> input["Enter grade / behaviour /<br/>activity / practical mark"]
    end
    subgraph S["Pool: System"]
        input --> gwVal{Field-level validation<br/>range / type / enum?}
        gwVal -->|fail| f400["400 Bad Request"]
        gwVal -->|missing FK| f422["422 Unprocessable Entity"]
        gwVal -->|pass| persist["Persist evaluation record"]
        persist --> weights["Load active formula_config<br/>(weights sum = 1.0)"]
        weights --> recompute["Recompute composite score<br/>(MetricsEngine, same cycle)"]
        recompute --> cache["Upsert student_metrics + audit_log"] --> e((End))
    end
```

---

## Fig 4.9 — P4 Student Analytics Generation

> 🟦 **[BPMN DIAGRAM — Figure 4.9: Student Analytics Generation]**
> **Pools:** Viewer (Student/Teacher/Admin) · System
> **Happy path:** open dashboard → check access → read cached `student_metrics` → fetch trend snapshots → build 6-dimension radar → compose single dashboard payload → render
> **Gateways (real decisions):** *Requester has access rights?* (no → 403) · *Metrics stale vs last data change?* (yes → lazy recompute)
> **Exception paths:** unauthorised viewer → 403; stale metrics → lazy recompute before read
> **Maps to:** `students/` (`StudentDashboardService` — the composed "wow endpoint"), `analytics/`, `metrics/` — entities `student_metrics` (denormalised cache), `metric_snapshots` (history) — endpoints `GET /api/students/{id}/dashboard`, `GET /api/students/{id}/metrics`, `GET /api/students/{id}/metrics/trend`
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-9.png`
> **Caption:** *Figure 4.9 — Student Analytics Generation (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph V["Pool: Viewer (Student / Teacher / Admin)"]
        s((Start)) --> open["Open dashboard"]
        render["View composite, radar,<br/>trend, growth areas"] --> e((End))
    end
    subgraph S["Pool: System"]
        open --> gwAcc{Requester has<br/>access rights?}
        gwAcc -->|no| f403["403 Forbidden"]
        gwAcc -->|yes| gwStale{Metrics stale vs<br/>last data change?}
        gwStale -->|yes| lazy["Lazy recompute"] --> readM
        gwStale -->|no| readM["Read cached student_metrics"]
        readM --> trend["Fetch metric_snapshots (trend)"]
        trend --> radar["Build 6-dimension radar"]
        radar --> compose["Compose single dashboard payload"] --> render
    end
```

---

## Fig 4.10 — P5 At-Risk Student Detection

> 🟦 **[BPMN DIAGRAM — Figure 4.10: At-Risk Student Detection]**
> **Pools:** System · Teacher/Admin
> **Happy path:** trigger (post-recompute / scheduled) → threshold check → growth-decline check → raise flag → classify severity → emit notification → teacher/admin views at-risk list → acknowledge/intervene
> **Gateways (real decisions):** *composite < at-risk threshold?* · *declining over last N snapshots?* · *severity level (LOW/MEDIUM/HIGH)?*
> **Exception paths:** declining trend even when above threshold → additional flag; no flag → end
> **Maps to:** `atrisk/` (`AtRiskRulesController`, `AtRiskRules`), `analytics/`, `notifications/`, `reminders/` — entities `at_risk_rules`, `notifications`, `metric_snapshots`, `student_metrics` (threshold in `institution_settings`) — endpoints `GET /api/analytics/at-risk`, `GET /api/at-risk-rules`, `PATCH /api/at-risk-rules`
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-10.png`
> **Caption:** *Figure 4.10 — At-Risk Student Detection (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph S["Pool: System"]
        s((Start)) --> trig["Trigger: post-recompute /<br/>scheduled evaluation"]
        trig --> gwThr{composite < at-risk<br/>threshold?}
        gwThr -->|yes| flag["Raise at-risk flag"]
        gwThr -->|no| gwTrend{Declining over<br/>last N snapshots?}
        gwTrend -->|yes| flag
        gwTrend -->|no| ok["No flag"] --> e1((End))
        flag --> level["Classify severity<br/>(LOW / MEDIUM / HIGH)"]
        level --> notify["Emit notification"]
    end
    subgraph TA["Pool: Teacher / Admin"]
        notify --> view["View at-risk list<br/>GET /api/analytics/at-risk"]
        view --> ack["Acknowledge / intervene"] --> e2((End))
    end
```

---

## Fig 4.11 — P6 Admin Monitoring

> 🟦 **[BPMN DIAGRAM — Figure 4.11: Admin Monitoring]**
> **Pools:** Admin · System
> **Happy path:** open org dashboard → aggregate KPIs & teacher activity → manage users/groups/courses or adjust formula weights → validate → persist settings/`formula_config` → cascade `recomputeAll()` → write audit entry
> **Gateways (real decisions):** *Role = ADMIN?* (no → 403) · *Formula weights sum to 1.0?* (no → 400)
> **Exception paths:** non-admin caller → 403; weights not summing to 1.0 → 400; every admin write → audit_log entry (old/new)
> **Maps to:** `analytics/`, `organization/`, `settings/`, `audit/`, `users/`, `groups/`, `courses/` — entities `institution_settings`, `formula_config`, `audit_log`, `departments`, `academic_terms` — endpoints `GET /api/analytics/admin/dashboard`, `GET/PATCH /api/settings`, `PUT /api/metrics/formula`, `POST /api/metrics/recompute-all`, `/api/users` CRUD
> **Draw in:** bpmn.io, export PNG to `_assets/figure-4-11.png`
> **Caption:** *Figure 4.11 — Admin Monitoring (BPMN 2.0)*

```mermaid
flowchart TB
    subgraph A["Pool: Admin"]
        s((Start)) --> dash["Open org dashboard"]
        manage["Manage users/groups/courses,<br/>adjust formula weights"]
    end
    subgraph S["Pool: System"]
        dash --> gwRole{Role = ADMIN?}
        gwRole -->|no| f403["403 Forbidden"]
        gwRole -->|yes| kpis["Aggregate org KPIs,<br/>teacher activity"] --> manage
        manage --> gwSum{Formula weights<br/>sum to 1.0?}
        gwSum -->|no| f400["400 Bad Request"]
        gwSum -->|yes| save["Persist settings / formula_config"]
        save --> cascade["recomputeAll() (paged 1000/tx)"]
        cascade --> audit["Write audit_log (old / new)"] --> e((End))
    end
```
