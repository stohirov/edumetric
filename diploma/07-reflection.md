# Chapter 7 — Reflective Evaluation

*Addresses **LO4 — P7 | D4***

## 7.1 Choice of Reflective Model

I have structured this reflection using **Gibbs' Reflective Cycle** (Gibbs, 1988), which moves through
six stages — description, feelings, evaluation, analysis, conclusion and action plan. I chose Gibbs over
a purely descriptive account because its later stages force a shift from *what happened* to *what I
learned and what I will change*, which is the level of critical depth this chapter requires. A simpler
diary-style account would have let me list activities without interrogating my decisions; Gibbs makes
analysis and an action plan compulsory, so it is harder to be superficial. To keep the reflection
specific rather than generic, I have anchored each stage in concrete events from designing and building
EduMetric rather than in abstractions about "the project" as a whole.

## 7.2 Reflection through Gibbs' Cycle

**7.2.1 Description.** Over roughly 24 weeks I designed, built and evaluated EduMetric, a web-based
multi-dimensional student performance analytics system, working across a Next.js/React frontend, a Java
Spring Boot backend and a PostgreSQL database. The defining technical episodes were: designing the
transparent **composite-score metrics engine** with its seven weighted dimensions and configurable
weights; deciding to make the metric **recompute synchronous and in-transaction** rather than deferred to
a background job; reconciling the PostgreSQL data model (the `student_metrics` and `metric_snapshots`
tables and the `formula_config`) with what the implementation actually persisted; and keeping a single,
locked terminology and a requirements-to-test traceability chain consistent across all seven chapters of
the dissertation while the code itself was still evolving. Modelling the six core processes in BPMN 2.0
was one design technique among several — alongside the architecture and ERD work — and it too had to be
validated against the running system.

**7.2.2 Feelings.** Early on I felt confident architecting the system on paper but uneasy about whether
the design would survive contact with real code, especially the scoring formula. ⟨STUDENT INPUT: add a
sentence on how you actually felt at the midpoint — for example, anxiety before the supervisor review, or
relief when the metrics engine first returned a believable composite score for a test student.⟩ When I
discovered that some endpoints and field names I had designed early had since drifted in the
implementation, my first reaction was deflation — it felt like an error — before I recognised it as
exactly what the traceability matrix existed to catch, which turned the feeling into something closer to
quiet satisfaction.

**7.2.3 Evaluation.** What went well was the discipline of building the system against a fixed
traceability pathway: once each requirement was tied to a module, an entity, an endpoint and a test, the
implementation had a clear target and the write-up flowed from the evidence rather than from memory.
Locking the terminology at the outset paid off — I never had to reconcile competing names for the
composite score, the growth trend or the metrics tables late in the project. What went less well was my
initial scheduling optimism: running the build and the academic writing in parallel meant the
implementation-heavy middle phases overran and ate into my buffer weeks, which is the realised form of
risk R04 in my register.

**7.2.4 Analysis.** Reflecting on *why*, the decision to make the metric recompute **synchronous and
in-transaction** taught me the most. I had first sketched it as a tidy, deferred background step, because
that is how many systems handle expensive recomputation. Building it forced the real trade-off into the
open: deferring the recompute would have let a teacher save a grade and then see a stale composite score,
undermining the very transparency the system exists to provide, whereas computing it inside the same
transaction guarantees that what a user reads is always consistent with what was just written, at the
cost of a slightly heavier write path. Choosing consistency over raw throughput was the right call for an
analytics tool whose credibility depends on users trusting the number — and it showed me that a single
line on a design diagram can conceal a genuine engineering decision with real performance and consistency
consequences.

A second analytical insight concerned *keeping the design honest*. When I reconciled the data model with
the implementation and found the endpoint and naming drift, I understood that a design artefact's value
is not in being drawn once but in being maintained against an evolving build — the difference between a
diagram as decoration and a diagram as engineering. The same lesson applied to terminology: the
discipline of fixing words like *composite score*, *at-risk detection* and `metric_snapshots` once and
never renaming them was what let the data model, the API and the prose agree with one another. I had
argued for this kind of consistency abstractly in my literature review, but I only understood it
concretely through the act of building, where an inconsistent name in one layer quietly breaks a query or
a test two layers away.

**7.2.5 Conclusion.** I conclude that my strongest growth was in *traceability thinking* — treating the
link between intent, design and implementation as a maintained artefact rather than a one-off document —
and in making and defending deliberate engineering trade-offs, of which the synchronous recompute is the
clearest example. My main weakness was front-loading too little schedule buffer before the most demanding
build phases. I also learned that admitting a discrepancy — reporting the implemented truth about the
drifted endpoints rather than hiding it — produced a more honest and ultimately stronger dissertation.
Equally, the discipline I initially resented, locking terminology and keeping the traceability chain
current, was exactly what made the final build coherent and the write-up fast, a lesson I expect to carry
into professional practice where systems outlive any single developer's memory of them.

**7.2.6 Action Plan.** In future projects I will (a) establish the traceability chain and locked
terminology *before* building, not alongside it; (b) reserve a larger buffer ahead of
implementation-intensive phases and resist running design, build and writing fully in parallel; and (c)
make explicit, recorded decisions about trade-offs such as synchronous versus deferred computation early,
rather than discovering them mid-build. ⟨STUDENT INPUT: add one personal action, for example a specific
tool or habit — such as keeping a decision log or writing tests before features — that you will adopt
next.⟩

## 7.3 SWOT of Personal Development

| Strengths | Weaknesses |
|---|---|
| Systematic traceability and documentation discipline across the build | Initial under-estimation of effort in the implementation-heavy phases |
| Ability to turn an abstract design into working, consistent code | Tendency to over-engineer a design before validating the simplest version |
| Comfort across the full stack (Spring Boot, PostgreSQL schema, REST, React) | ⟨STUDENT INPUT: a genuine personal weakness, for example difficulty asking for help early⟩ |

| Opportunities | Threats |
|---|---|
| Apply the design-build-evaluate method on industry placements | Framework and tooling churn (Spring, Next.js and library version changes) |
| Extend EduMetric with richer analytics or a deployment study | Time pressure when academic and software-development work overlap |

## 7.4 Transferable Skills

| Skill | Level | Evidence from this project |
|---|---|---|
| Software architecture reasoning | Proficient | Three-tier modular monolith; C4 + module decomposition (Fig 4.1–4.4) |
| Full-stack development (Spring Boot, React, PostgreSQL) | Proficient | Implemented authentication, attendance, the metrics engine, analytics and admin modules |
| Algorithm / metrics design | Competent | Transparent composite-score engine, seven weighted dimensions, synchronous in-transaction recompute |
| Database design | Competent | ERD reconciled with the live schema, including `student_metrics` and `metric_snapshots` (Fig 4.5) |
| Requirements traceability | Proficient | Tables 4.1–4.7, each link verified against the running system |
| API design (REST) | Competent | Role-secured endpoint inventory grounded in the modelled processes |
| Academic writing & referencing | Developing | This dissertation; 25+ Harvard sources |
| Project & risk management | Developing | Gantt, risk register and milestone delivery (Ch 3) |

## 7.5 Future Development Plan (D4)

| Goal | Action | Timeframe |
|---|---|---|
| Deepen architecture expertise | Complete a recognised software-architecture course and design a second multi-module system from scratch | 0–6 months |
| Strengthen evaluation and testing skills | Extend EduMetric's test suite and trial a small deployment / user-acceptance study with real workflows | 6–12 months |
| Build professional engineering practice | Contribute the traceability and locked-terminology approach in a placement or open-source project | 6–18 months |
| Improve planning discipline | Adopt buffer-first scheduling, an explicit decision log and continuous design-to-code validation as default habits | Ongoing |

⟨STUDENT INPUT: personalise the goals and timeframes to your own career intentions — for example a
specific role, employer or technology you want to move towards.⟩
