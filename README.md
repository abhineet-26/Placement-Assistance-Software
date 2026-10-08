<!-- Placement Assistant Software README -->

<div align="center">

# 🎓 Placement Assistant Software

### A full-stack campus recruitment and placement workflow platform

**Connect students, recruiters, and the placement cell in one auditable workflow—from job requirements and eligibility matching to CV forwarding, interviews, offers, and feedback.**

<p>
  <a href="https://github.com/abhineet-26/Placement-Assistance-Software"><img src="https://img.shields.io/badge/Project-Placement%20Assistant-1E3A5F?style=for-the-badge&logo=github&logoColor=white" alt="Placement Assistant Software"></a>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Development-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p>
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-documentation">Documentation</a>
</p>

</div>

---

## 📌 Overview

**Placement Assistant Software** is a web-based platform for coordinating campus recruitment between students, recruiting companies, and university placement staff.

Traditional placement processes often rely on spreadsheets, email chains, and manual CV screening. This project brings the major steps into a single application, giving students better visibility into opportunities and application progress while providing recruiters and placement administrators with a structured workflow.

A key design principle is **human-supervised automation**: the system can evaluate eligibility and rank potential matches, but the placement administrator remains in control of sensitive actions such as approving companies and jobs and authorizing CV forwarding.

### 🎯 Project goals

- Give students one place to maintain their profile/CV, discover opportunities, apply, and track outcomes.
- Give companies a structured way to submit job requirements and review candidates approved for forwarding.
- Give the placement cell visibility into approvals, matching, interviews, offers, feedback, and audit activity.
- Reduce repetitive manual work without removing administrator oversight.
- Keep placement actions traceable through application states and audit records.

> **Project context:** Developed as a Software Engineering Lab project. Product requirements and design documents are available in the [docs directory](docs/).

## ✨ Features

### 👨‍🎓 Student portal

- Register and authenticate through the shared authentication flow.
- Maintain student and academic profile information.
- Create and update a structured CV.
- Discover published placement opportunities.
- Review eligibility and application status for opportunities.
- Apply to jobs with server-side checks for eligibility, CV availability, deadlines, and duplicate applications.
- Track applications and related interview/offer information.
- Receive in-app notifications and relevant email updates.
- Accept or decline offers where the workflow supports it.
- Submit feedback linked to a real placement interaction.

### 🏢 Company / recruiter portal

- Register a company account and wait for placement-admin approval.
- Maintain company information.
- Create job requirements with role details, eligibility criteria, skills, vacancies, and deadlines.
- Submit jobs for administrator review before publication.
- View company-owned job postings and their workflow states.
- Review CVs explicitly forwarded through the administrator-controlled process.
- Participate in interview, offer, and feedback workflows where authorized.

### 🛡️ Placement administrator console

- Review company registrations and approval requests.
- Review and publish or return job requirements.
- Inspect candidate matches and matching scores.
- Override match inclusion with a recorded reason where supported.
- Approve CV forwarding before a company receives candidate CVs.
- Manage placement-related interviews and offers.
- Moderate feedback.
- Review reports and audit activity.
- Monitor notifications and key placement workflows.

### ⚙️ Automation and safeguards

- Rule-based candidate matching using job criteria such as CGPA, branch, backlogs, and skill overlap.
- In-app notification records and email delivery through background tasks.
- Application and placement status updates driven by domain records.
- Role-based access checks and ownership-scoped data access.
- Audit records for important administrative actions.
- Database migrations managed through Alembic.

> Feature availability can vary by screen and workflow. For exact behavior, inspect the API and frontend source. Product requirements are documented in [PRD.md](docs/PRD.md) and [Implementation.md](docs/Implementation.md).

## 🧭 How the workflow works

~~~mermaid
flowchart TD
    A["Student / Company registration"] --> B{"Account type"}
    B -->|Student| C["Complete profile and CV"]
    B -->|Company| D["Admin reviews company"]
    D -->|Approved| E["Company creates job requirement"]
    E --> F["Admin reviews and publishes job"]
    F --> G["Student views opportunity"]
    C --> G
    G --> H["Student applies"]
    H --> I["Eligibility and matching checks"]
    I --> J["Admin reviews candidate matches"]
    J -->|Approved| K["CV forwarded to company"]
    K --> L["Interview workflow"]
    L --> M["Offer recorded"]
    M --> N["Student receives notification and responds"]
    N --> O["Feedback and audit trail"]
~~~

### 🔐 The CV-forwarding checkpoint

Matching is intended to assist the placement team—not to release candidate information automatically. A match or score is not, by itself, permission to disclose a student's CV to a company. The administrator-controlled forwarding step preserves that review checkpoint.

## 🏗️ Architecture

The application is split into a React single-page frontend, a FastAPI REST API, PostgreSQL persistence, and supporting background email/notification services. Docker Compose brings the local services together.

~~~mermaid
flowchart LR
    U["Students, Companies, Admins"] --> W["React + TypeScript<br/>Vite frontend"]
    W -->|"REST / JSON<br/>JWT-protected requests"| A["FastAPI<br/>/api/v1"]
    A --> O["SQLAlchemy ORM"]
    O --> P[("PostgreSQL")]
    A --> M["Matching service"]
    A --> N["Notification service"]
    N --> E["SMTP / MailHog"]
    D["Alembic migrations"] --> P
    R["NGINX reverse proxy<br/>(production compose)"] -. routes .-> W
    R -. routes .-> A
~~~

### 🧰 Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI and styling | Material UI (MUI), Tailwind CSS, custom CSS |
| Routing | React Router |
| Server-state management | TanStack React Query |
| HTTP client | Axios |
| Icons | Lucide React, MUI Icons |
| Backend API | Python, FastAPI, Uvicorn |
| Validation | Pydantic |
| ORM and persistence | SQLAlchemy 2.x, PostgreSQL |
| Schema migrations | Alembic |
| Authentication | JWT, Passlib/bcrypt |
| Email | aiosmtplib; MailHog for local email capture |
| Containers | Docker, Docker Compose |
| Production routing | NGINX |
| Backend testing | pytest, pytest-asyncio, HTTPX |
| Browser testing | Playwright |

## 🗂️ Repository structure

~~~text
Placement-Assistance-Software/
├── .github/
│   └── workflows/             # GitHub Actions workflows
├── api/
│   ├── app/
│   │   ├── api/endpoints/      # REST endpoint routers
│   │   ├── core/               # Configuration, auth, security
│   │   ├── db/                 # Database session and setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Matching, notifications, email, status logic
│   │   └── main.py              # FastAPI app and router registration
│   ├── alembic/                 # Database migration history
│   ├── scripts/                 # Backend utility scripts
│   ├── tests/                   # API tests
│   ├── uploads/                 # Local upload directory
│   ├── requirements.txt
│   ├── seed_script.py           # Demo-data seeder (destructive; see warning)
│   └── Dockerfile
├── web/
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # Frontend context/providers
│   │   ├── lib/                 # API and shared utilities
│   │   ├── pages/               # Auth, student, company, admin pages
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                   # Playwright browser tests
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docs/
│   ├── PRD.md                   # Product requirements
│   ├── TRD.md                   # Technical requirements and architecture
│   ├── Backend.md               # API/backend design
│   ├── Design.md                # UI/UX guidelines
│   ├── Flow.md                  # Role journeys and screen flow
│   ├── Phases.md                # Implementation phases
│   ├── Implementation.md        # Runtime and validation notes
│   ├── Placement_Assistant_SRS.docx
│   └── PlacementAssistantSoftware_DFD.mdj
├── nginx/
│   └── nginx.conf
├── docker-compose.yml           # Local development stack
├── docker-compose.prod.yml      # Production-oriented stack
└── README.md
~~~

## 🚀 Getting started

### Prerequisites

Install the following tools:

- [Git](https://git-scm.com/)
- [Docker Engine](https://docs.docker.com/engine/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)

Docker Compose is the recommended way to run the full local stack. Node.js and Python are only needed on the host if you choose to run the frontend or backend outside Docker.

### 1. Clone the repository

~~~bash
git clone https://github.com/abhineet-26/Placement-Assistance-Software.git
cd Placement-Assistance-Software
~~~

### 2. Build and start the services

~~~bash
docker compose up --build -d
~~~

This starts the development services defined in docker-compose.yml: PostgreSQL, the FastAPI API, the Vite frontend, and MailHog.

### 3. Apply database migrations

After the containers are running, apply the Alembic migrations:

~~~bash
docker compose exec api alembic upgrade head
~~~

If the API container is still starting, check its logs and retry:

~~~bash
docker compose ps
docker compose logs -f api
~~~

### 4. Open the application

| Service | Local URL | Purpose |
|---|---|---|
| Frontend | [http://localhost:5173](http://localhost:5173) | React web application |
| API documentation | [http://localhost:8080/docs](http://localhost:8080/docs) | Interactive Swagger UI |
| API health check | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) | API health endpoint |
| MailHog inbox | [http://localhost:8025](http://localhost:8025) | Inspect development emails |
| PostgreSQL | localhost:5432 | Local database connection |

### 5. Seed demo data (optional)

To create the demo admin, student, and company accounts, run:

~~~bash
docker compose exec api python seed_script.py
~~~

> **⚠️ Destructive operation:** the current seed script truncates several database tables with cascading deletes before creating demo accounts. Run it only against a disposable local development database. **Do not run it against production or any database containing data you need to keep.**

#### Demo credentials

The current seed script creates the following local demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | password |
| Student | student@demo.com | password |
| Company | techcorp@demo.com | password |
| Test admin | admin@placement.local | admin123 |

These credentials are for local demonstration only. Do not reuse them in a deployed environment.

### Stop the stack

~~~bash
docker compose down
~~~

To also remove the local PostgreSQL volume and its data:

~~~bash
docker compose down -v
~~~

> **Warning:** docker compose down -v permanently removes the Compose-managed database volume. Use it only when you intentionally want to reset local database state.

## 🧪 Development and testing

### Backend tests

The backend test dependencies are included in api/requirements.txt. Run the in-process API test suite from the API container:

~~~bash
docker compose exec api pytest -q --ignore=tests/test_feedback.py
~~~

The feedback test uses HTTP against a running API service; see [Implementation.md](docs/Implementation.md) for the repository's current test instructions and caveats.

### Frontend checks

~~~bash
cd web
npm ci
npm run build
npm run lint
~~~

The build script runs the TypeScript project build followed by the Vite production build. The lint script runs ESLint.

### Playwright browser tests

The repository includes Playwright configuration and browser-test files under web/tests/. Install the required Playwright browser if it is not already installed:

~~~bash
cd web
npx playwright install
npx playwright test
~~~

Browser tests may require the application and API to be running, depending on the test configuration.

## 🔌 API overview

The API is versioned under **/api/v1**. Swagger documentation at [http://localhost:8080/docs](http://localhost:8080/docs) is the source of truth for the running API schema.

| Route prefix | Responsibility |
|---|---|
| **/api/v1/auth** | Registration, login, and authentication |
| **/api/v1/students** | Student profile operations |
| **/api/v1/cv** | CV creation and access |
| **/api/v1/companies** | Company profile and approval operations |
| **/api/v1/jobs** | Job requirements and matching workflows |
| **/api/v1/applications** | Applications and application status |
| **/api/v1/notifications** | In-app notification operations |
| **/api/v1/interviews** | Interview records |
| **/api/v1/offers** | Placement offers and student decisions |
| **/api/v1/feedback** | Student/company feedback |
| **/api/v1/admin** | Administrative operations and reports |
| **/api/v1/health** | Health check |

## 🔒 Security and data handling

- Protected API routes use role-aware authorization; frontend route guards are not a substitute for backend authorization.
- Company access to candidate information must be scoped to the company's own jobs and explicitly forwarded CVs.
- CV forwarding is an administrator-controlled workflow.
- Passwords are hashed rather than stored as plaintext.
- Important administrative actions are intended to be auditable.
- Email sent during local development can be inspected in MailHog.

### Before deploying

The production Compose file expects environment-based configuration. Before using it for a real deployment:

1. Set strong, unique database credentials and a secure JWT signing secret.
2. Configure valid SMTP settings.
3. Never expose demo credentials or real student data.
4. Review upload storage, backup, retention, and access policies for CVs and personal information.
5. Configure HTTPS/TLS at the deployment boundary.
6. Review production Compose defaults and reverse-proxy configuration; do not rely on development defaults for production security.
7. Run migrations and tests in a controlled deployment process.

## 📚 Documentation

The docs directory contains the project's requirements and design artifacts.

| Document | Description |
|---|---|
| [PRD.md](docs/PRD.md) | Problem statement, goals, roles, features, and acceptance criteria |
| [TRD.md](docs/TRD.md) | Technology choices, architecture, module breakdown, and matching approach |
| [Backend.md](docs/Backend.md) | Backend/API design and endpoint contracts |
| [Design.md](docs/Design.md) | UI/UX direction, palette, components, and accessibility baseline |
| [Flow.md](docs/Flow.md) | Student, company, and admin user journeys |
| [Phases.md](docs/Phases.md) | Planned implementation phases |
| [Implementation.md](docs/Implementation.md) | Runtime instructions, workflow notes, and validation commands |
| [Placement_Assistant_SRS.docx](docs/Placement_Assistant_SRS.docx) | Software Requirements Specification |
| [PlacementAssistantSoftware_DFD.mdj](docs/PlacementAssistantSoftware_DFD.mdj) | Data Flow Diagram source |

## 🛣️ Scope and future improvements

Potential follow-up work includes:

- More comprehensive end-to-end tests for complete student/company/admin journeys.
- Stronger deployment configuration and automated release checks.
- Expanded reporting and analytics for placement outcomes.
- More robust email delivery monitoring and retry controls.
- Institutional identity or academic-record integration where APIs are available.
- A learned ranking model only after sufficient representative placement outcome data exists; the current explainable rule-based matching approach is a more appropriate baseline.

## 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a focused branch: **feat/your-change**.
3. Make the change and add or update relevant tests.
4. Run the applicable build, lint, and test commands.
5. Open a pull request with a clear summary and testing notes.

For significant changes, consult the product and technical requirements in docs/ first so that student, company, and administrator workflows remain consistent.

## 📄 License

No license file is currently present in this repository. Unless a license is added, assume the project is **not licensed for redistribution or reuse by others**. Add a suitable license file if you intend to grant permissions for reuse.

---

<div align="center">

**Built to make campus placement workflows clearer, more traceable, and easier to manage.**

<sub>Repository: <a href="https://github.com/abhineet-26/Placement-Assistance-Software">abhineet-26/Placement-Assistance-Software</a></sub>

</div>
