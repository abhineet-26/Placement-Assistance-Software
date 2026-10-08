# Placement Assistant Software

A full-stack, comprehensive platform designed to streamline the campus placement process for universities, students, and recruiting companies.

## Features

- **Student Portal**: Students can build their professional profiles, upload CVs (integrated with a CV editor), discover job opportunities, and track their application statuses seamlessly.
- **Company/Recruiter Portal**: Companies can register, post job openings, manage candidates through a unified pipeline, and shortlist or offer positions to candidates directly.
- **Admin Operations Console**: University Placement Officers (Admins) have a bird's-eye view of all operations. They can approve student and company registrations, moderate jobs, manage job matching, and forward CVs to companies.
- **Role-based Access Control**: Secure, role-based routing and permissions ensure that students, companies, and admins only have access to data and actions relevant to their roles.
- **Premium User Interface**: Modern, responsive, and visually appealing UI utilizing Material UI, Tailwind CSS, and custom styling to emulate leading SaaS applications.

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Material UI (MUI) & Tailwind CSS
- **Routing**: React Router DOM v6
- **Build Tool**: Vite

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: NGINX

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation & Execution
To run the entire application stack (Database, Backend API, and Frontend web server) locally, simply use Docker Compose:

```bash
# Start the full stack in detached mode
docker compose up -d
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Docs (Swagger)**: `http://localhost:8080/docs`

### Seeding the Database
To populate the database with test data (dummy students, companies, and jobs) so you can test out workflows:

```bash
docker exec -it selab-api-1 python seed_script.py
```

## Test Accounts
Use the following pre-seeded credentials to explore the different perspectives of the platform:

| Role       | Email                   | Password  |
|------------|-------------------------|-----------|
| **Admin**  | `admin@demo.com`        | `password`|
| **Student**| `student@demo.com`      | `password`|
| **Company**| `techcorp@demo.com`     | `password`|
| **Admin** (Test)| `admin@placement.local` | `admin123`|

---

*Developed as part of the Software Engineering Lab.*
