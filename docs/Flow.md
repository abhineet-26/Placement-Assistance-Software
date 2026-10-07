# Flow.md — App Flow Document

**Version:** 1.0
**Companion to:** `PRD.md`, `Design.md`

This maps the three role journeys and how screens connect. Three separate app "zones" share one login screen, then branch entirely by role.

---

## 1. Shared entry flow

```
Landing / Login
  ├─ "New student?" → Student Registration → (pending: none, auto-active) → Student Dashboard
  ├─ "New company?" → Company Registration → Pending-Approval screen → (email on approval) → Company Dashboard
  └─ Existing user → Login (email + password) → role-based redirect
                       │
                       ├─ role=student → /student/dashboard
                       ├─ role=company → /company/dashboard   (blocked with "pending approval" banner until admin approves)
                       └─ role=admin   → /admin/dashboard
```

Password reset is a basic flow (email link) — not detailed further, standard pattern.

---

## 2. Student journey

```
Student Dashboard
  │  (shows: profile completeness, open opportunities count, active applications, latest notifications)
  │
  ├─► My CV
  │     └─ CV Editor (sections: Summary, Academics, Skills, Projects, Certifications)
  │           └─ Save → validation → success toast / inline field errors
  │           (CV must exist before "Apply" is enabled anywhere)
  │
  ├─► Browse Opportunities
  │     └─ Opportunity List (filter: branch, role type, company, deadline)
  │           └─ Opportunity Detail
  │                 ├─ shows eligibility check result against MY profile (eligible / not eligible + why)
  │                 ├─ shows MY application status if already applied
  │                 └─ [Apply] button (disabled if: no CV / ineligible / already applied / deadline passed)
  │                       └─ Confirm Apply → Application recorded → status = "applied"
  │
  ├─► My Applications
  │     └─ list with live status: applied → shortlisted → CV forwarded → interview scheduled → offer received / not selected
  │           └─ Application Detail → shows related interview details (if any), offer details (if any)
  │
  ├─► Notifications
  │     └─ chronological feed: new matching job / interview scheduled / offer received / status change
  │           (each notification deep-links to the relevant Application Detail)
  │
  └─► Feedback
        └─ pick a past interaction (company/job/interview) → feedback form (text + optional rating) → submit
```

**Key gating rule shown throughout the UI:** the Apply button is only ever live when CV exists AND eligibility passes AND no prior application AND deadline hasn't passed. Every disabled state tells the student exactly why (per SRS §6.5 usability requirement).

---

## 3. Company journey

```
Company Dashboard
  │  (shows: account status banner if pending, open job postings, pending shortlists, recent CVs received)
  │
  ├─► Company Profile
  │     └─ edit contact/company info (re-triggers admin review if core details change)
  │
  ├─► Post Job Requirement
  │     └─ Job Form (title, description, eligibility criteria, required skills, vacancies, deadline)
  │           └─ Submit → status = "pending review" → (admin approves/returns)
  │
  ├─► My Job Postings
  │     └─ list (draft / pending review / published / closed)
  │           └─ Job Detail
  │                 ├─ application count, matched-candidate count
  │                 └─ [View Matched CVs] (only populated once Admin has approved forwarding)
  │
  ├─► Received CVs
  │     └─ per job: list of forwarded CVs (only ones Admin approved — never the raw applicant pool)
  │           └─ CV Detail → [Record Interview] / [Record Offer] shortcuts (these create records Admin also sees)
  │
  └─► Feedback
        └─ pick a candidate/interview → feedback form → submit
```

**Key gating rule:** "Received CVs" is empty until Admin has run and approved a forwarding action — a company never sees the raw applicant list or ineligible applicants, only what's explicitly released to them.

---

## 4. Admin journey

```
Admin Dashboard
  │  (shows: pending student issues, pending company approvals, pending job approvals, pending match reviews, reports summary)
  │
  ├─► Manage Students
  │     └─ list (active/suspended) → Student Detail → approve/suspend/correct data
  │
  ├─► Manage Companies
  │     └─ Pending Approvals queue → Company Detail → [Approve] / [Reject] / [Flag duplicate]
  │     └─ Active Companies list → suspend/reinstate
  │
  ├─► Manage Job Requirements
  │     └─ Pending Review queue → Job Detail → [Approve & Publish] / [Return with comments]
  │     └─ Published Jobs list → edit / extend deadline / close
  │
  ├─► Match Review
  │     └─ per published job with applicants → auto-generated ranked shortlist (scores visible)
  │           ├─ add/remove candidates (with reason)
  │           └─ [Approve Forwarding] → triggers CV release to company (the one mandatory checkpoint)
  │
  ├─► Interviews
  │     └─ create/edit/cancel interview record → auto-emails the student
  │
  ├─► Offers
  │     └─ record/update/withdraw offer → auto-emails student + updates placement status
  │
  ├─► Feedback Moderation
  │     └─ student feedback list / company feedback list → flag inappropriate → compile summaries
  │
  └─► Reports
        └─ applications per job, placement rate, pending-queue depth over time
```

**Key gating rule:** every list of "pending X" is a queue Admin works down — this is the human-intervention layer the original brief calls for, made explicit as its own dashboard rather than scattered across screens.

---

## 5. Cross-role event flow (what actually happens end-to-end)

This is the thread that ties all three journeys together, matching the UML communication diagram:

```
1. Student applies to a job
2. → Matching engine scores the applicant pool for that job (background task)
3. → Admin reviews the ranked shortlist, approves forwarding
4. → CVs auto-forward to the company; company notified
5. → Company reviews CVs, contacts Admin to schedule interviews (offline/manual step)
6. → Admin records the interview → student auto-emailed
7. → Company decides → Admin records the offer → student auto-emailed, placement status updates
8. → After the process, student leaves feedback on the company; company leaves feedback on the candidate
9. → Admin can view all feedback and compile summaries
```

Steps 5 (company deciding whom to interview) happens outside the system by design — the SRS treats interview *scheduling* as an Admin action (R.19), not something the system auto-decides.
