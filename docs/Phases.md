# Phases.md — Implementation & Testing Plan

**Version:** 1.0

Each phase is scoped to be independently buildable and testable — don't start Phase N+1 until Phase N's acceptance checks pass. Every phase ends with a working, demoable slice, not just code.

---

## Phase 0 — Project scaffolding

**Goal:** empty-but-running skeleton, nothing functional yet.

- Set up monorepo: `/api` (FastAPI), `/web` (React+Vite), `docker-compose.yml` (api, db, web, mailhog).
- FastAPI: base app, health-check route (`GET /api/v1/health`), Alembic wired to Postgres.
- React: Vite scaffold, Tailwind configured, base router, base layout shell (empty sidebar/topbar from `Design.md`).
- CI: lint (ruff/black for Python, eslint/prettier for JS) + a placeholder test job.

**Acceptance:**
- `docker-compose up` brings up all services.
- `GET /health` returns 200.
- React app loads a blank shell at `localhost`.

---

## Phase 1 — Auth & role scaffolding

**Goal:** all three roles can register/login; routes are role-protected.

- `users`, `students`, `companies`, `admins` tables + Alembic migration.
- `/auth/register/student`, `/auth/register/company`, `/auth/login`, `/auth/refresh` endpoints.
- JWT issuance + `require_role()` FastAPI dependency.
- Seed script: create one admin account for local dev.
- Frontend: Login page, Student Registration page, Company Registration page, role-based redirect after login, protected route wrapper per role.

**Acceptance (tests):**
- Registering a duplicate student roll number is rejected (R.1-A1).
- A student JWT cannot access an admin-only route (403).
- A newly registered company cannot log into `/company/dashboard` functionality until `approval_status=approved` (banner shown instead).
- pytest: auth flow (register → login → access protected route) green for all 3 roles.

---

## Phase 2 — Student profile & CV

**Goal:** a student can fully manage their profile and CV.

- `cvs`, `cv_versions` tables + migration.
- `GET/PATCH /students/me`, `GET/PUT /cv/me`.
- Overwrite-on-update logic + version history write.
- Frontend: Student Dashboard shell, Profile page, CV Editor (all sections from `Flow.md`).

**Acceptance:**
- Saving an invalid CV (missing mandatory field) is rejected and the previous valid CV is untouched (R.2-E1).
- Saving a valid update increments `version` and appends to `cv_versions`.
- pytest: CV create → update → verify old version preserved in history, new version is current.

---

## Phase 3 — Company & job requirement lifecycle

**Goal:** a company can post a job; admin can approve/return it; students can see published jobs.

- `job_requirements` table + migration.
- `POST /jobs`, admin `PATCH /jobs/{id}/approve`, `PATCH /jobs/{id}/return`, `GET /jobs` (role-scoped views).
- Admin approval queue endpoints for companies (`/companies`, `/companies/{id}/approve`).
- Frontend: Company Dashboard shell, Post Job form, My Job Postings list, Admin's Pending Companies + Pending Jobs queues.

**Acceptance:**
- A job with missing mandatory fields is rejected before it reaches the review queue (R.10-E1).
- A job only appears in the student-facing list once `status=published`.
- An unapproved company cannot successfully call `POST /jobs` (403 or explicit "pending approval" error).
- pytest: full company approve → job submit → admin approve → job visible to students, chain.

---

## Phase 4 — Applications

**Goal:** eligible students can apply; duplicates/ineligibility are blocked.

- `applications` table + migration (with the `(student_id, job_id)` unique constraint).
- `POST /applications` with eligibility check (branch/CGPA/backlog hard filters against the job's criteria) + duplicate check.
- `GET /applications/me`, `PATCH /applications/{id}/withdraw`.
- Frontend: Opportunity List + Detail (with eligibility banner from `Design.md`), Apply flow, My Applications list.

**Acceptance:**
- Applying twice to the same job returns a clear duplicate error, no second row created (R.4-A1).
- Applying to a job you're ineligible for is rejected and names the specific unmet criterion (R.4-E1).
- Applying past the deadline is rejected.
- Applying without a CV on file is blocked client-side and server-side.
- pytest: eligible-and-applies (success), ineligible (blocked with reason), duplicate (blocked), past-deadline (blocked) — four explicit test cases.

---

## Phase 5 — Matching engine

**Goal:** given a job and its applicant pool, produce a ranked, explainable shortlist.

- `matches` table + migration.
- Matching service module: hard-filter pass + skill-overlap scoring (per `TRD.md` §4).
- `POST /jobs/{id}/run-matching` (also auto-triggered as a background task on new application).
- `GET /jobs/{id}/matches`.
- Frontend: Admin's Match Review screen (ranked list + score chips).

**Acceptance:**
- A student who fails a hard filter never appears with `included_in_shortlist=true` regardless of skill score.
- Two applicants with identical hard-filter pass but different skill overlap rank in the correct order.
- Re-running matching after a new application updates the shortlist without duplicating existing match rows for already-processed applications.
- pytest: constructed fixture of 5 applicants with known CGPA/branch/skills → assert exact expected ranking.

---

## Phase 6 — CV forwarding & company visibility

**Goal:** the one mandatory human checkpoint — CVs only leave the system via explicit admin approval.

- Admin override endpoint (`PATCH /matches/{id}/override`).
- `POST /jobs/{id}/matches/approve-forwarding` → sets `forwarding_status=sent`, timestamps, actor.
- `GET /companies/me/received-cvs` (scoped strictly to `forwarding_status=sent` for that company's jobs).
- `audit_log` writes on approve/override/forward actions.
- Frontend: Admin override controls on Match Review screen, Company's Received CVs screen, CV Preview Panel component (shared, per `Design.md`).

**Acceptance:**
- A company's `/received-cvs` call returns zero results for a job where forwarding hasn't been approved yet, even if matches exist.
- A company can never fetch a CV outside its own job requirements (403/empty, tested explicitly with a second company's credentials).
- Every forwarding approval produces exactly one `audit_log` row with the correct actor.
- pytest: attempt cross-company CV access → must fail; approve forwarding → CV now visible to the right company only.

---

## Phase 7 — Notifications (in-app + email)

**Goal:** the automated notification layer (R.5–R.7, R.23, R.26, R.27) actually fires and is retried/logged on failure.

- `notifications`, `notification_log` tables + migration.
- Email dispatcher service (aiosmtplib) wired to BackgroundTasks, retry-with-backoff on failure, logs every attempt.
- Trigger points wired in: job published → notify eligible students; forwarding approved → notify company; interview created → notify student; offer created → notify student; application status changes → notify student.
- Frontend: Notifications feed (both dashboards), unread badge in topbar.

**Acceptance:**
- Publishing a job that matches 3 eligible students produces exactly 3 `notifications` rows and 3 outbound emails (verified against Mailhog in dev).
- Simulating an SMTP failure results in a `notification_log.status=retrying` then eventually `failed` after max attempts, never a silent drop.
- Admin's manual resend endpoint successfully re-sends a previously failed notification.
- pytest: mock the SMTP client, assert retry count and final logged status on induced failure.

---

## Phase 8 — Interviews & offers

**Goal:** admin can run the back half of the pipeline; student status derives automatically.

- `interviews`, `offers` tables + migration.
- CRUD endpoints (admin-only writes), wired to the Phase 7 notification triggers.
- Placement-status derivation logic on `applications`/`students` (R.28) — a service function invoked on every application/interview/offer write, not a manually-set field.
- Frontend: Admin's Interviews and Offers management screens, student-facing Application Detail showing interview/offer info.

**Acceptance:**
- Creating an interview updates `applications.status` to `interview_scheduled` and the student's `placement_status` accordingly, automatically — no manual status edit needed anywhere.
- Recording an offer updates status to `offer_received`/`placed` per the defined status machine and fires the offer email.
- Withdrawing an offer correctly reverts/updates downstream status and notifies the student of the change.
- pytest: create interview → assert derived status; create offer → assert derived status; withdraw offer → assert re-derived status.

---

## Phase 9 — Feedback

**Goal:** students and companies can leave feedback tied to real interactions; admin can moderate.

- `feedback` table + migration.
- `POST /feedback` with interaction-validation (reject feedback that doesn't reference a real past interaction — R.8-E1/company equivalent).
- Admin moderation endpoints (`flag`), feedback list/summary views.
- Frontend: Feedback form (student + company), Admin's Feedback Moderation screen.

**Acceptance:**
- Feedback missing the mandatory text field is rejected.
- Feedback referencing an interaction the author never had (wrong job/company/student pairing) is rejected.
- pytest: valid feedback accepted; missing-text rejected; wrong-reference rejected.

---

## Phase 10 — Admin reporting & polish

**Goal:** the control-tower view is complete; the app feels finished, not just functional.

- `GET /admin/queues/summary`, `GET /admin/reports/placement-stats`, `GET /admin/audit-log`.
- Frontend: Admin Dashboard home (queue counts + report widgets), consistent empty states across all screens (per `Design.md` §4), loading/error states audited across every data-fetching screen.
- Full responsive pass against `Design.md` breakpoints for Student and Company zones.
- Accessibility pass: keyboard nav, contrast check, `aria-live` on form errors.

**Acceptance:**
- Dashboard queue counts match actual DB state (cross-checked against a seeded fixture).
- Every screen has a deliberate empty state (manual QA checklist, no blank screens found).
- Lighthouse/axe accessibility check on the three main dashboards clears baseline contrast/keyboard-nav checks.

---

## Phase 11 — End-to-end hardening & deployment

**Goal:** ship it.

- Full end-to-end test: seed a fresh DB → register student + company → post/approve job → apply → match → forward → interview → offer → feedback, scripted as one integration test.
- Docker production build (multi-stage for both `api` and `web`), reverse proxy config (Nginx/Caddy) with TLS.
- Environment-based config review (no dev secrets/Mailhog in the prod compose file).
- README with setup instructions, seed-data script for demoing.

**Acceptance:**
- The single end-to-end integration test passes against a clean database.
- `docker-compose -f docker-compose.prod.yml up` serves the full app behind HTTPS on a test server.
- A cold-start demo (empty DB, seed script run once) can walk through the entire pipeline live without manual DB edits.

---

## Testing philosophy across all phases

- **Every phase that touches the DB ships with at least one pytest module** exercising its acceptance checks above — no phase is "done" on manual testing alone.
- **Negative cases are not optional** — every SRS exception scenario (`R.x-E1`, `R.x-A1`) referenced in a phase gets an explicit test, not just the happy path.
- **Cross-role access tests are mandatory wherever data scoping matters** (company can't see another company's CVs, student can't see another student's application) — these are the tests most likely to be skipped and most damaging if skipped.
- Frontend gets component tests for the state-heavy pieces (Status Badge variants, Apply-button gating logic, Match Review override flow) rather than 100% coverage everywhere.
