# TRD.md — Technical Requirements Document

**Version:** 1.0
**Companion to:** `PRD.md`, `Backend.md`

---

## 1. Stack summary

| Layer | Choice | Why |
|---|---|---|
| Backend framework | **FastAPI** (Python 3.11+) | Matches existing skillset, async-native, auto-generates OpenAPI docs (useful for a multi-role frontend), Pydantic gives free request/response validation which this SRS's heavy validation requirements (R.1.2, R.2-E1, R.9-E1, R.10-E1...) lean on heavily |
| ORM / DB toolkit | **SQLAlchemy 2.0** + **Alembic** | Migrations are non-negotiable here — the schema will evolve across phases (see `Phases.md`) |
| Database | **PostgreSQL 15+** | Relational integrity matters a lot in this domain (an application must reference a real student, a real job, a real CV version; duplicate-application and duplicate-enrolment rules are DB-enforceable constraints, not just app logic) |
| Auth | **JWT (access + refresh)** via `python-jose` + `passlib[bcrypt]` | Three roles (student/company/admin) with different visibility — JWT claims carry role + user id, checked by a FastAPI dependency on every protected route |
| Background/async work | **FastAPI `BackgroundTasks`** for v1; upgrade path to **Celery + Redis** if matching/email volume grows past what in-process background tasks can handle | Matching and email-sending are the two operations that must never block the request/response cycle |
| Email | **SMTP via `aiosmtplib`**, institution or a dev SMTP relay (e.g. Mailhog locally, SendGrid/SES for a real deploy) | R.6/R.7/R.26/R.27 require reliable, retried, logged email delivery |
| Frontend | **React 18 + Vite** | Fast dev loop, matches existing frontend exposure (React listed in profile stack) |
| Frontend styling | **Tailwind CSS** | Fast to build 3 distinct role-based dashboards without hand-rolling a design system from scratch |
| Frontend data layer | **TanStack Query** + **Axios** | Handles caching/refetching of status-heavy views (application status, match queue) cleanly |
| Frontend routing | **React Router v6** | Role-gated route trees (`/student/*`, `/company/*`, `/admin/*`) |
| API contract | **OpenAPI (auto, via FastAPI)** | Frontend can codegen types or just hand-consume the schema |
| Testing (backend) | **pytest** + **httpx.AsyncClient** + a disposable test Postgres DB (or SQLite for pure unit tests) | Ties directly into `Phases.md`'s "each phase ships with tests" approach |
| Testing (frontend) | **Vitest** + **React Testing Library** | Component-level tests for the three dashboards |
| Containerization | **Docker Compose** (`api`, `db`, `web`, optional `mailhog`) | One-command local spin-up; also the easiest path to "deployable on an institution server" |
| CI | **GitHub Actions** — lint + test on every push | Not mandatory for a college project, but cheap insurance given the phase-by-phase build plan |

## 2. High-level architecture

```
                       ┌───────────────────────────┐
                       │        React SPA          │
                       │  /student  /company /admin │
                       └──────────────┬────────────┘
                                      │ HTTPS + JWT
                       ┌──────────────▼────────────┐
                       │        FastAPI API         │
                       │  routers: auth, students,  │
                       │  companies, jobs, apps,    │
                       │  cv, matching, interviews, │
                       │  offers, feedback, admin   │
                       └───┬──────────────┬─────────┘
                           │              │
            ┌──────────────▼───┐   ┌──────▼──────────────┐
            │   PostgreSQL      │   │  Background tasks    │
            │  (SQLAlchemy ORM) │   │  - matching engine    │
            └───────────────────┘   │  - email dispatcher   │
                                     └──────────┬────────────┘
                                                │
                                     ┌──────────▼────────────┐
                                     │   SMTP / Email service │
                                     └────────────────────────┘
```

This maps directly onto the DFD you already produced: `Placement Assistant Software` (Level 0) decomposes into the eight Level-1 processes (Student Management, CV Management, Placement Opportunity Management, Application Management, Matching Process, CV Forwarding, Notification Management, Feedback Management) — each becomes one FastAPI router + one service module, backed by its own table(s) in Postgres (mirroring your D1–D5 data stores).

## 3. Module breakdown (backend)

| Module | Responsibility | SRS trace |
|---|---|---|
| `auth` | Register/login for all 3 roles, JWT issuance, role-based dependency guards | R.1.2, R.9, §6.2 |
| `students` | Student profile CRUD, eligibility fields | R.1, R.1.1, R.1.3 |
| `cv` | CV create/update (overwrite semantics), retrieval | R.2 |
| `companies` | Company registration, admin approval workflow | R.9, R.14 |
| `jobs` | Job requirement CRUD, admin review/approve, publish, deadline handling | R.10, R.16 |
| `applications` | Apply, duplicate/eligibility checks, status tracking | R.4, R.28 |
| `matching` | Rule-based eligibility scoring engine, candidate shortlist generation | R.24, R.17 |
| `forwarding` | Admin-approved CV release to company, delivery logging | R.11, R.18, R.25 |
| `notifications` | In-app notification log + email dispatch + retry/failure logging | R.5, R.6, R.7, R.23, R.26, R.27 |
| `interviews` | Interview record CRUD → triggers notification | R.19, R.26 |
| `offers` | Offer record CRUD → triggers notification + status update | R.20, R.27, R.28 |
| `feedback` | Student/company feedback tied to a real interaction | R.8, R.12, R.21, R.22 |
| `admin` | Dashboards, approval queues, reports | R.13–R.22 |

## 4. Matching engine — approach

The SRS deliberately leaves the exact matching algorithm undefined ("Assumption: matching criteria defined by placement staff/institution" — R.24). Given Abhi's ML background, two tiers make sense:

- **v1 (MVP): deterministic rule-based scoring.** For a job requirement with criteria (min CGPA, allowed branches, max backlogs, required skills list), score each applied student:
  - Hard filters (must pass): branch match, CGPA ≥ cutoff, backlogs ≤ max. Fail any → excluded from shortlist entirely.
  - Soft score (ranks the rest): skill-overlap ratio between the job's required-skills list and the student's CV skills (simple set overlap / Jaccard to start).
  - Output: ranked candidate list with the score shown, so Admin can see *why* someone ranked where they did — this matters because Admin has to be able to justify adding/removing candidates (R.17).
- **v2 (stretch, post-MVP):** replace the soft-score step with a lightweight ML ranker (e.g. a small gradient-boosted model, consistent with the CatBoost/LightGBM/XGBoost background) trained on historical placement outcomes once enough data exists. Not attempted until there's real data to train on — a rule-based v1 that Admin trusts and can explain is more valuable than an opaque model on day one.

This keeps `R.24`'s accuracy requirement (§8.5 — every stated eligibility criterion evaluated without omission) satisfied by construction: the hard filters *are* the stated criteria, checked exhaustively.

## 5. Security & auth notes

- Passwords hashed with bcrypt (passlib), never stored/logged in plaintext.
- JWT access tokens short-lived (e.g. 30 min), refresh tokens longer-lived and revocable (stored server-side or rotated).
- Every route wrapped in a role dependency (`require_role("student")`, etc.) — no relying on the frontend to hide UI as a security boundary.
- Row-level scoping enforced in the query layer, not just the API layer: a company's endpoints only ever query applications/CVs tied to *that* company's job IDs; a student's endpoints only ever touch *that* student's rows.
- CV disclosure is gated behind a dedicated `forwarding` action that only Admin can trigger — never a side effect of matching alone. This is the single most important access-control rule in the whole system (SRS §8.6).
- All state-changing admin actions (approve company, approve job, approve CV forwarding, record offer) write an `audit_log` row: actor, action, target, timestamp.
- HTTPS/TLS termination assumed at the deploy layer (reverse proxy — e.g. Caddy/Nginx) even in a college-server deployment.

## 6. Non-functional targets (carried from SRS §6, scaled to a project context)

These aren't hard SLAs for a college build, but they're the design targets:

- Page interactions feel instant on a small dataset (hundreds, not tens-of-thousands, of students/jobs) — no explicit load testing required for v1.
- Matching for a single job requirement completes synchronously in practice (rule-based scoring over a few hundred applicants is fast); background-task wrapping is still used so a slow request never blocks the API worker.
- Email dispatch is fire-and-forget from the requester's point of view (BackgroundTasks), with failures logged to a `notification_log` table rather than silently dropped, and a manual "resend" action available to Admin.

## 7. Dev environment

- `docker-compose up` brings up `db` (Postgres), `api` (FastAPI + Uvicorn, hot reload), `web` (Vite dev server), `mailhog` (catch outgoing email locally so nothing accidentally emails a real student during dev).
- `.env` per service; secrets never committed.
- Alembic autogenerate for schema migrations, reviewed by hand before applying (autogenerate is a starting point, not a guarantee).
