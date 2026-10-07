# Implementation Notes

## Runtime

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT authentication.
- Frontend: React, TypeScript, Vite, React Query, Tailwind CSS.
- Local services: PostgreSQL on `5432`, API on `8080`, frontend on `5173`, MailHog on `8025`.
- API routes are prefixed with `/api/v1`.

Start the local stack with:

```bash
docker compose up --build
```

Apply migrations from the API environment with:

```bash
alembic upgrade head
```

The development admin seed creates `admin@placement.local` with password `admin123`.

## Implemented Workflow

1. Students and companies register through the shared JWT authentication flow.
2. Companies remain pending until an admin approves them.
3. Approved companies submit jobs for admin review and publication.
4. Students maintain a profile and versioned CV, then browse published jobs.
5. Server-side checks enforce CV presence, eligibility, deadline, and duplicate prevention.
6. Applications enqueue the matching service. Matching evaluates CGPA, branch, backlogs, and skill overlap.
7. Admins review matches and explicitly approve CV forwarding.
8. Interview and offer writes are admin-controlled and update application placement status.
9. Students can accept or decline extended offers through an ownership-checked endpoint.
10. Notifications are stored in-app, can be marked read, and email delivery runs in background tasks with retry logging.
11. Students and companies can submit interaction-validated feedback; admins can flag or unflag it.
12. Administrative actions write audit records.

## Frontend Zones

- Student: opportunities, applications, profile, CV, notifications, interview details, offer decisions.
- Company: dashboard, job creation, forwarded CVs, notifications.
- Admin: live dashboard, company approvals, job approvals, jobs/matches, feedback moderation, notifications.

## Validation

Backend in-process suite against a disposable PostgreSQL database:

```bash
DATABASE_URL="postgresql://placement_user:placement_password@localhost:5432/placement_test" \
SMTP_HOST=localhost SMTP_PORT=1025 pytest -q --ignore=tests/test_feedback.py
```

The in-process suite covers 17 tests. `tests/test_feedback.py` uses `urllib` against `http://localhost:8000` and must be run with the API service running.

Frontend checks:

```bash
npm run build
npm run lint
```

The build and the focused lint set for the implemented workflow pass. Repository-wide lint still reports legacy `any` usage in older screens and diagnostics.
