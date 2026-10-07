# PRD.md — Placement Assistant Software

**Version:** 1.0
**Owner:** Abhi
**Status:** Draft for build

---

## 1. Problem Statement

College placement is currently run by hand — spreadsheets, WhatsApp groups, email chains, and a placement cell that manually matches CVs to job openings. This is slow, error-prone, and gives students almost no visibility into where they stand.

**Placement Assistant Software** replaces this with a single Intranet-based platform where:
- Students browse open placement opportunities, keep one living CV, and apply electronically.
- Companies enrol, post job requirements, and receive CVs of students who actually match their criteria.
- The Placement Admin/Cell keeps final control — every sensitive step (company approval, job approval, CV release, offer recording) passes through a human before it takes effect. Automation handles the repetitive work; the placement staff handle judgment calls.

This project is built from the original problem statement plus a full SRS (see `Placement_Assistant_SRS.docx`) and two supporting diagrams (DFD, UML communication diagram), already produced during research. This PRD translates those into a buildable product.

## 2. Goals

1. Give students a single place to discover, apply to, and track placements — no more "did they even see my CV?"
2. Give companies a clean intake for job requirements and a filtered, pre-qualified stream of candidates instead of a spreadsheet dump.
3. Give the placement cell a control tower: nothing leaves the system (a CV, an approval, an offer) without their sign-off, but nothing requires them to do manual data entry that the system can do itself.
4. Keep the whole loop — apply → match → forward → interview → offer → feedback — auditable and traceable.

### Non-goals (out of scope for v1)
- Payroll / post-joining HR processes.
- Alumni relationship management.
- Academic curriculum management (only pulled in for eligibility checks, e.g. CGPA/backlogs, if that data is available).
- Native mobile apps (responsive web only).
- SMS notifications (email + in-app only for v1; SMS listed as a Phase 2 stretch goal in the SRS's "Goals of Implementation").

## 3. Users

| Role | Who | What they need |
|---|---|---|
| **Student** | Placement-eligible student of the institution | Enrol, maintain one CV, browse/filter open opportunities, apply, see real-time application status, get interview/offer emails, leave feedback |
| **Company / Employer** | HR / recruiter from an enrolled company | Enrol (pending approval), post job requirements, receive only qualified matching CVs, record interview/offer outcomes, leave feedback on candidates |
| **Placement Admin / Staff** | College placement cell | Approve/reject student & company enrolments, review job requirements before publishing, review the auto-generated match list before any CV goes out, manage interviews & offers, monitor feedback, run reports |

Students only ever see their own data. Companies only ever see data tied to their own job requirements. Admin sees everything and is the only role that can release a CV externally.

## 4. Core Features (mapped to the 9 functionalities in the original brief)

Each feature below traces back to a requirement ID in the SRS (`R.x`) so nothing gets lost between docs.

### 4.1 Student-facing
- **Enroll Student** (`R.1`) — sign up with institutional roll number + email, basic academic details, credential creation. Duplicate roll numbers rejected.
- **Submit / Maintain CV** (`R.2`) — one structured online CV per student (summary, academics, skills, projects, certifications). Every update replaces the previous version; a bad update doesn't destroy the last valid CV.
- **View Placement Opportunities** (`R.3`) — browse/search/filter open, published job requirements; each listing is annotated with the student's own eligibility and application status.
- **Apply for Placement** (`R.4`) — one-click apply against a current CV; blocked if ineligible, blocked if already applied, blocked if no CV on file.
- **Notifications** (`R.5`, `R.6`, `R.7`) — in-app + email for new matching opportunities, interview scheduling, and offers.
- **Submit Feedback** (`R.8`) — feedback tied to a specific company/job/interview the student actually took part in.

### 4.2 Company-facing
- **Enroll Company** (`R.9`) — self-serve registration, but the account stays inactive until Admin approves it. Suspected duplicates are flagged for staff, not silently merged or rejected.
- **Post Job Requirement** (`R.10`) — title, description, eligibility criteria (CGPA cutoff, branch, backlog tolerance, etc.), required skills, vacancies, deadline. Goes to Admin for review before students ever see it.
- **Receive Matching CVs** (`R.11`) — the system auto-generates a ranked candidate list against the job's stated criteria; Admin reviews/adjusts it; only then are CVs released to the company.
- **Company Feedback** (`R.12`) — feedback on a candidate/interview tied to an actual interaction.

### 4.3 Admin-facing (the human-intervention layer, `R.13`–`R.22`)
- Approve/reject/suspend student and company accounts.
- Review and approve/return job requirements before publication.
- Review the auto-matched candidate list per job — add or remove candidates, with a reason, before CVs go out.
- Approve or withhold individual CVs at the forwarding step (this is the one mandatory human checkpoint in the whole pipeline).
- Create/update/cancel interview records (triggers student email automatically).
- Record/update/withdraw placement offers (triggers student email + updates placement status automatically).
- Monitor company and student feedback; flag anything inappropriate.
- Basic reporting dashboard: applications per job, placement rate, pending approvals queue.

### 4.4 System-automated (behind the scenes, `R.23`–`R.28`)
- Auto-notify students when a new job matches their profile, or their application status changes.
- Auto-match applied students against a job's eligibility criteria and produce a ranked shortlist for Admin review.
- Auto-forward CVs once Admin approves the match.
- Auto-email students on interview creation/update and on offer creation/update.
- Auto-derive each student's overall placement status (`not placed → applied → interview scheduled → offer received → placed`) from their live application/interview/offer records.

## 5. What "done" looks like for v1 (MVP acceptance)

- A student can register, build a CV, find an open job, apply, and see their status update live.
- A company can register, get approved, post a job, get it approved, and receive a CV list that Admin actually reviewed first.
- An interview or offer recorded by Admin reliably produces a real email to the right student within minutes.
- No CV ever reaches a company without an explicit Admin approval action on record.
- Every account/job/CV/offer state change is attributable to a specific actor and timestamp (audit trail).

## 6. Key product decisions worth flagging

- **Matching is assistive, not autonomous.** The system ranks/shortlists; it never auto-sends a CV. This mirrors the SRS's repeated emphasis on staff sign-off before external disclosure (`R.18`, `R.25`, privacy §8.6).
- **One CV per student, versioned by overwrite**, not a portfolio of multiple CVs — matches SRS `R.2` exactly and keeps the matching engine simple.
- **Intranet-flavored, not literally Intranet-only, for the build.** The SRS calls for institutional-Intranet-only deployment; for a project/demo build we'll implement it as a normal authenticated web app deployable on an institution server or a subnet, since a literal Intranet isn't available for development. This is called out explicitly so it isn't lost.
- **Email is the notification channel for v1**; SMS/push are explicitly future scope per the SRS's Section 9.

## 7. Success metrics (directional, for a college project — not contractual SLAs)

- % of student enrolments completed without staff help (target from SRS: ≥90% first-attempt completion).
- Median time from "job posted" to "first matched shortlist ready for Admin review."
- % of interview/offer emails delivered without manual staff intervention.
- Admin queue depth (pending approvals) over time — should trend down, not up, as automation kicks in.

## 8. Open assumptions carried over from the SRS

- No prior placement-automation system exists at the institution — this is greenfield.
- Exact DBMS/language/framework not mandated by the original brief — decided in `TRD.md`.
- Exact matching algorithm/weighting is left to us to define — see `TRD.md` §Matching Engine.
- Institutional authentication / academic-records integration is treated as **not available** for this build; student eligibility fields (CGPA, branch, backlogs) are self-reported at enrolment/CV time instead, with Admin able to correct them.
