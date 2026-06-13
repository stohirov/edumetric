# EduMetric CRM

> A multidimensional student-growth evaluation platform. EduMetric replaces "GPA as a
> single number" with a transparent **composite score** across grades, attendance,
> practical work, behaviour, and activity — plus growth and consistency bonuses — that
> recalculates **live** the moment new data is entered.

Built for IT academies, university programmes, and PDP-style organisations. Three core
roles — **Admin**, **Teacher**, **Student** — with a **Parent** monitoring extension.

📖 See [`USER_MANUAL.md`](USER_MANUAL.md) for a full end-user guide to every page.

---

## Table of Contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start (local dev)](#quick-start-local-dev)
  - [1. Start PostgreSQL](#1-start-postgresql)
  - [2. Run the backend](#2-run-the-backend)
  - [3. Run the frontend](#3-run-the-frontend)
- [Environment variables](#environment-variables)
- [Running with Docker Compose](#running-with-docker-compose)
- [Build & test](#build--test)
- [API documentation](#api-documentation)
- [The composite score](#the-composite-score)
- [Troubleshooting](#troubleshooting)

---

## Architecture at a glance

```
                 BROWSER
                    │ HTTPS
                    ▼
        ┌────────────────────────┐
        │  NGINX (reverse proxy) │   /      → Next.js :3000
        └──────┬───────────┬─────┘   /api/* → Spring  :8080
               ▼           ▼
     ┌──────────────┐  ┌──────────────────────────┐
     │ Next.js (SSR)│  │  Spring Boot 4 API       │
     │ React 19     │  │  REST · JPA · Security    │
     │ Recharts     │  │  JWT · Metrics engine     │
     └──────────────┘  └────────────┬─────────────┘
                                     │ JDBC
                                     ▼
                        ┌──────────────────────────┐
                        │ PostgreSQL 16             │
                        │ + Redis (analytics cache) │
                        └──────────────────────────┘
```

- **Modular monolith** — one Spring Boot app, vertical-slice packages (one per feature).
- **Synchronous, in-transaction recompute** — saving attendance/grades re-scores the
  affected students immediately (the "live recompute" is a feature, not a bug).
- **Redis** is used **only** as a read-through cache for analytics dashboards; the
  per-student score "cache" is a denormalised Postgres row.

For the full design rationale see [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Recharts · Radix UI |
| Backend | Java 25 · Spring Boot 4.0.6 (Spring Framework 7) · Spring MVC · Spring Security 7 |
| Auth | JWT (HS256) — short-lived access token + rotating refresh tokens; BCrypt hashing |
| Data | PostgreSQL 16 · Spring Data JPA + Hibernate 6 · Liquibase migrations |
| Cache | Redis (analytics dashboards only; in-process fallback in dev/test) |
| File storage | MinIO (homework / document uploads) |
| Build | Maven (`./mvnw`) · npm |
| Docs | springdoc-openapi (Swagger UI) |

---

## Repository layout

```
friends/
├── backend/                 # Spring Boot API (Java 25, Maven)
│   ├── src/main/java/com/edumetric/backend/   # vertical-slice feature packages
│   ├── src/main/resources/
│   │   ├── application.yaml                    # base config
│   │   ├── application-dev.yaml                # dev profile
│   │   ├── application-prod.yaml               # prod profile
│   │   └── db/changelog/                       # Liquibase schema
│   ├── docker-compose.yml      # prod: postgres + backend
│   ├── docker-compose.dev.yml  # dev: postgres only
│   ├── Dockerfile
│   └── ARCHITECTURE.md
├── hackathon-front/         # Next.js frontend (TypeScript)
│   ├── src/app/             # routes: (auth), (dashboard)/{student,teacher,admin,parent}
│   ├── src/components/      # UI + feature components
│   ├── src/lib/             # api client, i18n, navigation, utils
│   └── .env.local.example
├── diploma/                 # BTEC dissertation (case study about this system)
├── USER_MANUAL.md           # end-user guide (also USER_MANUAL.docx)
└── README.md                # you are here
```

---

## Prerequisites

Install these before you start:

- **Java 25** (JDK) — e.g. [Eclipse Temurin 25](https://adoptium.net/)
- **Node.js 20+** and **npm**
- **Docker** + **Docker Compose** (for PostgreSQL, and optional full-stack run)
- **Maven** — not required globally; use the bundled wrapper `./mvnw`

> The backend talks to Postgres on `localhost:5432` in dev. Redis and MinIO are optional
> in dev (the app falls back to an in-process cache and only needs MinIO for file uploads).

---

## Quick start (local dev)

Three terminals: database, backend, frontend.

### 1. Start PostgreSQL

The simplest path is the dev compose file (Postgres only):

```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
```

This starts `postgres:16-alpine` on port **5432** with database `edumetric`, user
`postgres`, password `postgres`.

> ⚠️ The **dev profile** (`application-dev.yaml`) expects password **`root123`**. Either
> change the password in `application-dev.yaml` to `postgres`, or start Postgres with
> `-e POSTGRES_PASSWORD=root123`. Pick one and keep them consistent — see
> [Environment variables](#environment-variables).

Alternatively, a one-off container:

```bash
docker run --name edumetric-pg -e POSTGRES_PASSWORD=root123 \
  -e POSTGRES_DB=edumetric -p 5432:5432 -d postgres:16
```

### 2. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

- Runs on **http://localhost:8080** with the **dev** profile by default.
- Liquibase creates the schema and (in dev) seeds demo data — the `default,dev,demo`
  contexts load synthetic students, grades, attendance and 12 weeks of trend snapshots,
  so the dashboards have data on first launch.
- Health check: **http://localhost:8080/actuator/health**

### 3. Run the frontend

```bash
cd hackathon-front
cp .env.local.example .env.local   # sets NEXT_PUBLIC_API_URL=http://localhost:8080/api
npm install
npm run dev
```

Open **http://localhost:3000** and sign in. (Use the seeded demo accounts created by the
dev/demo Liquibase context, or create users via the Admin workspace.)

---

## Environment variables

### Frontend — `hackathon-front/.env.local`

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL of the backend REST API |

### Backend

The base config (`application.yaml`) reads these; defaults shown are dev-friendly. Set
real values via environment variables in production.

| Variable | Default | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Active profile (`dev` / `prod`) |
| `DB_URL` | *(prod)* | JDBC URL, e.g. `jdbc:postgresql://postgres:5432/edumetric` |
| `DB_USER` | *(prod)* | Database user |
| `DB_PASSWORD` | *(prod)* | Database password |
| `JWT_SECRET` | dev placeholder | HS256 signing key — **must be ≥ 32 bytes in prod** |
| `JWT_ACCESS_MINUTES` | `30` | Access-token lifetime |
| `JWT_REFRESH_DAYS` | `30` | Refresh-token lifetime |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `LIQUIBASE_CONTEXTS` | `default` | Migration contexts (use `default,dev,demo` to seed) |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | `localhost` / `6379` / *(empty)* | Analytics cache (prod) |
| `CACHE_REDIS_ENABLED` | `false` (dev) / `true` (prod) | Use Redis cache vs in-process |
| `MINIO_ENDPOINT` | `http://localhost:9000` | Object storage endpoint |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `minioadmin` / `minioadmin123` | MinIO credentials |
| `MINIO_BUCKET` | `edumetric-homework` | Upload bucket |

> **Dev note:** `application-dev.yaml` hard-codes the DB at
> `jdbc:postgresql://localhost:5432/edumetric` with user `postgres` / password `root123`.
> Adjust it to match your local Postgres.

---

## Running with Docker Compose

The production compose file builds the backend image and runs it alongside Postgres:

```bash
cd backend
export JWT_SECRET="a-strong-secret-of-at-least-32-bytes-please"
docker compose up -d --build
```

This starts:

- **postgres** on `5432`
- **backend** on `8080` (profile `prod`, waits for Postgres to be healthy)

`JWT_SECRET` is **required** — compose refuses to start without it. Other values
(`POSTGRES_*`, `BACKEND_PORT`, `CORS_ORIGIN`, …) can be overridden via env or a `.env`
file next to the compose file.

> The frontend is not in this compose file — run it with `npm run dev` / `npm run start`,
> or place both behind NGINX as shown in [Architecture](#architecture-at-a-glance).

---

## Build & test

### Backend

```bash
cd backend
./mvnw clean verify              # full build + tests
./mvnw test -Dtest=ClassName     # single test class
./mvnw spring-boot:build-image   # OCI image via buildpacks
```

### Frontend

```bash
cd hackathon-front
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

---

## API documentation

With the backend running, interactive API docs are available at:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

All endpoints are under the base path `/api`, return a JSON envelope
(`{ data, error, details }`), use camelCase, and ISO-8601 UTC timestamps. List endpoints
are paginated (default page size 20, max 100).

---

## The composite score

The platform's centrepiece. Each student's composite is a weighted sum of seven
components (default weights sum to 1.0):

| Component | Default weight |
|---|---|
| Grades | 0.25 |
| Attendance | 0.15 |
| Practical | 0.25 |
| Behaviour | 0.10 |
| Activity | 0.10 |
| Growth bonus | 0.10 |
| Consistency bonus | 0.05 |

Admins can edit the weights on the **Formula** page; activating a new formula re-scores
every student. The maths lives in a pure, fully unit-testable `MetricsEngine`; the
orchestrating `MetricsService` loads data, runs the engine, and upserts the result inside
one transaction. See [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) §6.

---

## Troubleshooting

**Backend won't start — Liquibase checksum / validation error**
Schema is owned by Liquibase (`ddl-auto: validate`). Never edit a deployed changeSet —
add a new one. If you intentionally changed seed data in dev, drop and recreate the DB.

**Backend can't connect to Postgres**
Confirm Postgres is up on `5432` and that the username/password in `application-dev.yaml`
(`postgres` / `root123`) match your container. See [Quick start](#1-start-postgresql).

**Frontend shows a spinner / API calls fail**
Check `NEXT_PUBLIC_API_URL` in `.env.local` points at the running backend
(`http://localhost:8080/api`) and that the backend health endpoint returns `UP`.

**CORS errors in the browser console**
Set `CORS_ORIGIN` to the frontend origin (default `http://localhost:3000`).

**Docker compose `up` fails immediately**
`JWT_SECRET` must be set and at least 32 bytes long.

**Dashboards are empty after first run**
Seed data only loads with the `dev`/`demo` Liquibase contexts. Run the backend with the
`dev` profile, or set `LIQUIBASE_CONTEXTS=default,dev,demo`.

---

*EduMetric CRM — see [`USER_MANUAL.md`](USER_MANUAL.md) for end-user instructions and
[`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) for system design.*
