# Backend.md — Backend Schema Document

**Version:** 1.0
**Stack:** FastAPI + SQLAlchemy 2.0 + PostgreSQL (see `TRD.md`)

---

## 1. Entity-relationship overview

```
users (base auth identity)
  ├─1:1─ students
  ├─1:1─ companies
  └─1:1─ admins

students ──1:1── cvs (current CV, overwritten on update; cv_versions keeps history)
students ──1:N── applications
students ──1:N── notifications
students ──1:N── feedback (as author, target_type=company)

companies ──1:N── job_requirements
companies ──1:N── feedback (as author, target_type=student)

job_requirements ──1:N── applications
job_requirements ──1:N── matches

applications ──1:1── matches (a match record is generated per application, per job's matching run)
applications ──0:1── interviews
applications ──0:1── offers

audit_log ── references any entity via (entity_type, entity_id)
notification_log ── references notifications, tracks email delivery attempts
```

## 2. Tables

### `users`
Base identity for all three roles — single login table, role discriminates the rest.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `email` | text, unique, not null | login identifier |
| `password_hash` | text, not null | bcrypt |
| `role` | enum(`student`,`company`,`admin`) | not null |
| `is_active` | boolean, default true | admin can deactivate |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `students`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users.id, unique | |
| `roll_number` | text, unique, not null | dedupe key (R.1-A1) |
| `full_name` | text, not null | |
| `phone` | text | |
| `programme` | text | |
| `branch` | text | used in eligibility matching |
| `batch_year` | int | |
| `cgpa` | numeric(3,2) | self-reported, admin-correctable |
| `backlogs` | int, default 0 | self-reported, admin-correctable |
| `enrollment_status` | enum(`pending`,`active`,`suspended`) | default `active` per R.1 (no approval gate stated for students, unlike companies) |
| `placement_status` | enum(`not_placed`,`applied`,`interview_scheduled`,`offer_received`,`placed`) | derived/updated automatically (R.28) |
| `created_at` / `updated_at` | timestamptz | |

### `cvs`
One current CV per student — overwrite semantics (R.2, R.2-A1).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students.id, unique | one current CV per student |
| `summary` | text | |
| `academic_record` | jsonb | flexible: degree, institution, scores |
| `skills` | text[] | used directly by the matching engine |
| `projects` | jsonb | list of {title, description, tech} |
| `certifications` | jsonb | list of {name, issuer, date} |
| `version` | int, default 1 | incremented on every save |
| `is_valid` | boolean, default true | false only mid-failed-validation, never persisted invalid |
| `updated_at` | timestamptz | |

### `cv_versions` (history, append-only)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK | |
| `snapshot` | jsonb | full CV payload at that version |
| `version` | int | |
| `created_at` | timestamptz | |

### `companies`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users.id, unique | |
| `company_name` | text, not null | |
| `contact_person` | text | |
| `contact_phone` | text | |
| `about` | text | |
| `approval_status` | enum(`pending`,`approved`,`rejected`,`suspended`) | default `pending` (R.9) |
| `flagged_duplicate_of` | UUID FK → companies.id, nullable | set when Admin flags a suspected duplicate (R.9-A1) |
| `created_at` / `updated_at` | timestamptz | |

### `job_requirements`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `company_id` | UUID FK → companies.id | |
| `title` | text, not null | |
| `description` | text, not null | |
| `required_skills` | text[] | matched against `cvs.skills` |
| `min_cgpa` | numeric(3,2), nullable | hard filter |
| `allowed_branches` | text[], nullable | hard filter |
| `max_backlogs` | int, nullable | hard filter |
| `vacancies` | int, not null | |
| `application_deadline` | timestamptz, not null | |
| `status` | enum(`draft`,`pending_review`,`published`,`returned`,`closed`) | default `draft` (R.10, R.16) |
| `review_comment` | text, nullable | set when Admin returns it for changes |
| `reviewed_by` | UUID FK → admins.id, nullable | |
| `created_at` / `updated_at` | timestamptz | |

### `applications`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `student_id` | UUID FK → students.id | |
| `job_id` | UUID FK → job_requirements.id | |
| `cv_version` | int | snapshot reference — which CV version this application used |
| `status` | enum(`applied`,`shortlisted`,`cv_forwarded`,`interview_scheduled`,`offer_received`,`rejected`,`withdrawn`) | drives R.28 |
| `applied_at` | timestamptz | |
| unique constraint | `(student_id, job_id)` | enforces R.4-A1 (no duplicate applications) at the DB level, not just app logic |

### `matches`
One row per (job, applicant) produced by a matching run — this is the "candidate match list" of R.24/R.17.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `job_id` | UUID FK → job_requirements.id | |
| `application_id` | UUID FK → applications.id | |
| `passed_hard_filters` | boolean | branch/CGPA/backlog check result |
| `score` | numeric(5,2) | soft skill-overlap score, shown to Admin |
| `included_in_shortlist` | boolean, default = `passed_hard_filters` | Admin can override (add/remove) |
| `admin_override_reason` | text, nullable | required if Admin manually adds/removes someone against the auto result |
| `forwarding_status` | enum(`not_forwarded`,`approved`,`withheld`,`sent`,`failed`) | default `not_forwarded` (R.18, R.25) |
| `forwarded_by` | UUID FK → admins.id, nullable | |
| `forwarded_at` | timestamptz, nullable | |
| `generated_at` | timestamptz | when this match row was produced |

### `interviews`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `application_id` | UUID FK → applications.id | |
| `scheduled_at` | timestamptz | |
| `location_or_mode` | text | e.g. "Room 204" / "Google Meet link" |
| `status` | enum(`scheduled`,`rescheduled`,`completed`,`cancelled`) | |
| `created_by` | UUID FK → admins.id | R.19 is an Admin action |
| `created_at` / `updated_at` | timestamptz | |

### `offers`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `application_id` | UUID FK → applications.id, unique | |
| `offer_details` | jsonb | role, CTC/stipend if disclosed, joining date, etc. |
| `status` | enum(`extended`,`accepted`,`declined`,`withdrawn`) | |
| `created_by` | UUID FK → admins.id | R.20 is an Admin action |
| `created_at` / `updated_at` | timestamptz | |

### `feedback`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `author_type` | enum(`student`,`company`) | |
| `author_id` | UUID | polymorphic — student_id or company_id |
| `target_type` | enum(`company`,`student`,`interview`,`job`) | what the feedback is about |
| `target_id` | UUID | |
| `content` | text, not null | mandatory (R.8-E1) |
| `rating` | int, nullable | 1–5, optional |
| `flagged` | boolean, default false | Admin moderation (R.21, R.22) |
| `created_at` | timestamptz | |

### `notifications`
In-app notification feed per student (or company).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `recipient_user_id` | UUID FK → users.id | |
| `type` | enum(`new_opportunity`,`interview_scheduled`,`offer_received`,`status_change`,`company_approved`,`job_returned`, ...) | |
| `payload` | jsonb | context (job_id, application_id, etc.) |
| `read_at` | timestamptz, nullable | |
| `created_at` | timestamptz | |

### `notification_log`
Tracks the actual email send attempt (separate from the in-app notification above — R.6-E1/R.25-E1 retry/failure requirements).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `notification_id` | UUID FK → notifications.id, nullable | |
| `channel` | enum(`email`) | extensible later (`sms`, `push`) |
| `recipient_email` | text | |
| `status` | enum(`queued`,`sent`,`failed`,`retrying`) | |
| `attempt_count` | int, default 0 | |
| `last_error` | text, nullable | |
| `sent_at` | timestamptz, nullable | |

### `audit_log`
Every sensitive state change (SRS §6.2: security-relevant actions shall be audit-logged).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `actor_user_id` | UUID FK → users.id | |
| `action` | text | e.g. `company.approve`, `match.forward`, `offer.create` |
| `entity_type` | text | |
| `entity_id` | UUID | |
| `metadata` | jsonb, nullable | |
| `created_at` | timestamptz | |

### `admins`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users.id, unique | |
| `full_name` | text | |
| `created_at` | timestamptz | |

---

## 3. API routes

All routes prefixed `/api/v1`. Auth via `Authorization: Bearer <jwt>`. `[role]` marks required role.

### Auth
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/auth/register/student` | public | R.1 |
| POST | `/auth/register/company` | public | R.9 — creates `approval_status=pending` |
| POST | `/auth/login` | public | returns access + refresh token |
| POST | `/auth/refresh` | public (valid refresh token) | |
| POST | `/auth/logout` | any | revokes refresh token |

### Students
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/students/me` | student | |
| PATCH | `/students/me` | student | edit profile fields |
| GET | `/students` | admin | list/search |
| PATCH | `/students/{id}/status` | admin | approve/suspend/reinstate (R.13) |

### CV
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/cv/me` | student | current CV |
| PUT | `/cv/me` | student | overwrite semantics (R.2) — validates, saves, appends to `cv_versions` |
| GET | `/cv/{student_id}` | admin, or company (only if a match/forward record grants access) | scoped read |

### Companies
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/companies/me` | company | |
| PATCH | `/companies/me` | company | |
| GET | `/companies` | admin | filter by `approval_status` |
| PATCH | `/companies/{id}/approve` | admin | R.14 |
| PATCH | `/companies/{id}/reject` | admin | |
| PATCH | `/companies/{id}/flag-duplicate` | admin | R.9-A1 |

### Job requirements
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/jobs` | company (approved only) | creates `status=pending_review` (R.10) |
| GET | `/jobs` | student | published + open only, filterable; annotated with student's own eligibility + application status |
| GET | `/jobs` | company | own postings, any status |
| GET | `/jobs` | admin | any status, filterable by `pending_review` |
| GET | `/jobs/{id}` | role-scoped | |
| PATCH | `/jobs/{id}` | company | only while `draft`/`returned` |
| PATCH | `/jobs/{id}/approve` | admin | → `published`, triggers student notification fan-out (R.23) |
| PATCH | `/jobs/{id}/return` | admin | requires `review_comment` |
| PATCH | `/jobs/{id}/close` | admin or company | |

### Applications
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/applications` | student | body: `job_id`; server checks eligibility + duplicate (R.4) |
| GET | `/applications/me` | student | |
| GET | `/applications` | admin | filter by job/status |
| GET | `/applications?job_id=` | company | only for own job, only rows with `status >= cv_forwarded` |
| PATCH | `/applications/{id}/withdraw` | student | |

### Matching / forwarding
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/jobs/{id}/run-matching` | admin (or auto-triggered on new application) | generates/refreshes `matches` rows (R.24) |
| GET | `/jobs/{id}/matches` | admin | ranked shortlist with scores (R.17) |
| PATCH | `/matches/{id}/override` | admin | include/exclude + `admin_override_reason` |
| POST | `/jobs/{id}/matches/approve-forwarding` | admin | approves selected matches → triggers CV send (R.18, R.25) |
| GET | `/companies/me/received-cvs` | company | only `forwarding_status=sent` rows for own jobs |

### Interviews
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/interviews` | admin | body: `application_id`, schedule details (R.19) → triggers email (R.26) |
| PATCH | `/interviews/{id}` | admin | reschedule/cancel → re-notifies |
| GET | `/interviews` | admin, or scoped to student/company | |

### Offers
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/offers` | admin | body: `application_id`, offer details (R.20) → triggers email (R.27), updates `applications.status`/`students.placement_status` (R.28) |
| PATCH | `/offers/{id}` | admin | update/withdraw → re-notifies |
| GET | `/offers` | admin, or scoped to student/company | |

### Feedback
| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/feedback` | student, company | validates the referenced interaction actually happened before accepting |
| GET | `/feedback` | admin | filter by type/flagged |
| PATCH | `/feedback/{id}/flag` | admin | R.21/R.22 |

### Notifications
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/notifications/me` | student, company | |
| PATCH | `/notifications/{id}/read` | student, company | |
| POST | `/admin/notifications/{id}/resend` | admin | manual resend on delivery failure |

### Admin / reporting
| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/admin/queues/summary` | admin | counts: pending companies / pending jobs / pending matches |
| GET | `/admin/reports/placement-stats` | admin | applications per job, placement rate |
| GET | `/admin/audit-log` | admin | filterable audit trail |

---

## 4. Enum reference (single source of truth for the codebase)

- `role`: `student` · `company` · `admin`
- `student.enrollment_status`: `pending` · `active` · `suspended`
- `student.placement_status`: `not_placed` · `applied` · `interview_scheduled` · `offer_received` · `placed`
- `company.approval_status`: `pending` · `approved` · `rejected` · `suspended`
- `job.status`: `draft` · `pending_review` · `published` · `returned` · `closed`
- `application.status`: `applied` · `shortlisted` · `cv_forwarded` · `interview_scheduled` · `offer_received` · `rejected` · `withdrawn`
- `match.forwarding_status`: `not_forwarded` · `approved` · `withheld` · `sent` · `failed`
- `interview.status`: `scheduled` · `rescheduled` · `completed` · `cancelled`
- `offer.status`: `extended` · `accepted` · `declined` · `withdrawn`
