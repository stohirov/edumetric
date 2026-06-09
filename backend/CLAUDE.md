# CLAUDE.md

Operating guide for working on the EduMetric CRM backend. Read this first before editing.

## What this project is

**EduMetric CRM** — a multi-dimensional student-evaluation analytics platform. Replaces "GPA as a single number" with a transparent composite score across Grades, Attendance, Practical, Behavior, Activity (+ growth and consistency bonuses).

Three roles: **Admin**, **Teacher**, **Student**. Built for IT academies, university programs, and PDP-style organizations.

Full product spec: `EduMetric_CRM_Master_Document.pdf` (in `~/Downloads`).
System design: `ARCHITECTURE.md` (next to this file).

## Stack — locked

| | |
|---|---|
| Language | **Java 25** (LTS) |
| Framework | **Spring Boot 4.0.6** (Spring Framework 7) |
| Build | **Maven** (wrapper: `./mvnw`) |
| Database | **PostgreSQL 16** |
| Migrations | **Liquibase** — YAML changelogs under `src/main/resources/db/changelog/` |
| ORM | **Spring Data JPA + Hibernate 6.6** |
| Web layer | **Spring MVC** (`spring-boot-starter-webmvc`) — NOT WebFlux |
| Security | **Spring Security 7 + JWT (HS256)** — short-lived access token + opaque rotating refresh tokens (DB-stored, hashed) |
| Boilerplate | **Lombok** on entities; **records** for DTOs |
| Observability | Actuator + Micrometer + `datasource-micrometer` |

**Deliberately not used:** Redis, Kafka/RabbitMQ, WebFlux, MapStruct, Flyway, microservices. See `ARCHITECTURE.md` §1 for the reasoning.

## Base package

```
com.edumetric.backend
```
All new packages go under this root. Application entrypoint: `BackendApplication.java`.

## Run / build / test

```bash
./mvnw clean verify              # full build + tests
./mvnw spring-boot:run           # dev run (needs Postgres on localhost:5432)
./mvnw test -Dtest=ClassName     # single test
./mvnw spring-boot:build-image   # OCI image via buildpacks
```

Local Postgres (suggested for dev):
```bash
docker run --name edumetric-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=edumetric -p 5432:5432 -d postgres:16
```

## Conventions — non-negotiable

### Package layout
Vertical slices, one feature per package:
```
com.edumetric.backend.<feature>/
  ├── <Feature>Controller.java
  ├── <Feature>Service.java
  ├── <Feature>Repository.java
  ├── domain/      ← @Entity classes
  ├── dto/         ← request/response records
  └── mapper/      ← static mapper (no MapStruct)
```
Never split horizontally (`controllers/`, `services/`, `entities/`).

### Entities (Lombok)
JPA entities **must** use this combination:
```java
@Entity
@Getter @Setter @Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
```
- Never `@Data`, `@ToString`, or unrestricted `@EqualsAndHashCode` on entities — they trigger lazy-loading and break Hibernate proxies.
- Mark the `@Id` field with `@EqualsAndHashCode.Include`.
- Soft-deletable entities (`users`, `students`, `teachers`, `groups`, `courses`) use `@SQLDelete` + `@SQLRestriction` (Hibernate 6).

### DTOs
Java records only. Co-located with the feature (`<feature>/dto/`). Never expose entities from controllers.

### Controllers
- Return `ResponseEntity<ApiResponse<T>>` (envelope defined in `common/api/`).
- Validate with `@Valid`.
- Authorization at method level: `@PreAuthorize("hasRole('ADMIN')")`.
- Thin — parse, delegate to service, map to DTO. No business logic.

### Services
- `@Transactional` on writes, `@Transactional(readOnly = true)` on read paths.
- Constructor injection via `@RequiredArgsConstructor` on `final` fields.
- Data-scoping (teacher only sees their groups, student only sees themselves) lives **in service queries**, not in `@PreAuthorize`.

### Repositories
- `JpaRepository<T, Long>` + `@Query` (JPQL) for hot paths.
- Native SQL only for histograms / heatmap aggregations.
- All list endpoints paginated (`Pageable`).

### Migrations
- **One changeSet = one DDL action.**
- **Never edit a deployed changeSet** — add a new one. Liquibase verifies checksums and will refuse to start otherwise.
- Author tag = developer's slug.
- Seed data → `context: dev,demo` so it never runs in prod.

### API
- Base path `/api`. No versioning yet.
- JSON in **camelCase**. Timestamps ISO-8601 UTC.
- Errors → `GlobalExceptionHandler` → `{ "error": "...", "details": [...] }`.

## What NOT to do

- ❌ Add Redis, Kafka, or any message broker (sync recompute is intentional — see `ARCHITECTURE.md` §6)
- ❌ Add async/queue-based recompute (the live recompute is a demo feature, not a bug)
- ❌ Add WebFlux/reactive code (we're on Spring MVC + virtual threads)
- ❌ Use `@Data` on entities (Hibernate proxy footgun)
- ❌ Edit existing Liquibase changeSets (add new ones)
- ❌ Set `hibernate.ddl-auto: update` — must stay `validate`. Liquibase owns the schema.
- ❌ Return entities from controllers — always DTOs
- ❌ Implement ML/AI predictions (out of scope — see master doc §3.3)

## Outstanding setup (not yet in pom)

The following are required by the architecture but not in `pom.xml` yet:

- [ ] `org.projectlombok:lombok` (`scope: provided`)
- [ ] `lombok.config` at project root (locks down dangerous defaults)
- [ ] JWT library: `io.jsonwebtoken:jjwt-api/impl/jackson` (0.12.x)
- [ ] `springdoc-openapi-starter-webmvc-ui` (2.7.x for Spring Boot 4)
- [ ] `org.testcontainers:postgresql` + `:junit-jupiter` (test scope)
- [ ] `spring-boot-starter-validation` (for `@Valid` on DTOs)

These are deliberately listed here so the next session adds them in one go.

## Useful references

- `ARCHITECTURE.md` — system design, package layout, metrics engine, security model
- `EduMetric_CRM_Master_Document.pdf` §18 (backend), §20 (DB), §21 (API), §22 (metrics), §23 (formula)
