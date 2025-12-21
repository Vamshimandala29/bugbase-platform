# BugBase Implementation Plan

## 1. Architecture Overview

### Technology Stack
- **Frontend**: Angular 17+ (Standard, TypeScript, Material Design)
- **Backend**: Spring Boot 3.2+ (Java 21), Spring Security, Spring Data JPA
- **Database**: PostgreSQL 15+
- **Containerization**: Docker & Docker Compose
- **Migration**: Flyway
- **Deployment**: Render

### High-Level Architecture
[Angular SPA] --(HTTPS/JSON)--> [Spring Boot API] --(JDBC)--> [PostgreSQL]
                                        |
                                   [Actuator]

## 2. Database Schema (Phase 1 MVP)

### Tables

**1. users**
- `id` (UUID, PK)
- `email` (VARCHAR, Unique, Not Null)
- `password_hash` (VARCHAR, Not Null)
- `full_name` (VARCHAR)
- `role` (VARCHAR) - Values: 'ADMIN', 'MEMBER', 'VIEWER'
- `created_at` (TIMESTAMP)

**2. refresh_tokens**
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id)
- `token` (VARCHAR, Unique)
- `expiry_date` (TIMESTAMP)

**3. projects**
- `id` (UUID, PK)
- `name` (VARCHAR, Not Null)
- `description` (TEXT)
- `owner_id` (UUID, FK -> users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**4. issues**
- `id` (UUID, PK)
- `project_id` (UUID, FK -> projects.id)
- `title` (VARCHAR, Not Null)
- `description` (TEXT)
- `status` (VARCHAR) - 'TO_DO', 'IN_PROGRESS', 'DONE'
- `priority` (VARCHAR) - 'LOW', 'MEDIUM', 'HIGH'
- `reporter_id` (UUID, FK -> users.id)
- `assignee_id` (UUID, FK -> users.id, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**5. comments**
- `id` (UUID, PK)
- `issue_id` (UUID, FK -> issues.id)
- `author_id` (UUID, FK -> users.id)
- `content` (TEXT, Not Null)
- `created_at` (TIMESTAMP)

## 3. API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/register` (Register new user)
- `POST /api/auth/login` (Returns Access + Refresh Token)
- `POST /api/auth/refresh` (Rotates Refresh Token)
- `POST /api/auth/logout` (Revokes Refresh Token)

### Projects
- `GET /api/projects` (List all visible projects)
- `POST /api/projects` (Create new project - ADMIN/MEMBER)
- `GET /api/projects/{id}` (Get details)
- `PUT /api/projects/{id}` (Update details)
- `DELETE /api/projects/{id}` (Archive/Delete - ADMIN)

### Issues
- `GET /api/projects/{projectId}/issues` (List issues with filters)
- `POST /api/projects/{projectId}/issues` (Create issue)
- `GET /api/issues/{id}` (Get issue details)
- `PATCH /api/issues/{id}` (Update status/assignee)
- `POST /api/issues/{id}/comments` (Add comment)
- `GET /api/issues/{id}/comments` (List comments)

## 4. Folder Structure (Monorepo)
/bugbase-platform
  /backend (Spring Boot)
  /frontend (Angular)
  docker-compose.yml
  README.md

## 5. Implementation Roadmap (Phase 1)

**Step 1: Scaffolding**
- Initialize Spring Boot with dependencies (Web, JPA, Security, Flyway, Postgres, Lombok).
- Initialize Angular with Material.
- Setup Docker Compose for local Dev (Postgres).

**Step 2: Backend Core**
- Configure Flyway & DataSource.
- Create Entities & Repositories.
- Implement Security (JWT Filter, UserDetailsService).

**Step 3: Backend Features**
- Implement Project Service & Controller.
- Implement Issue Service & Controller.
- Add Actuator & Swagger (OpenAPI).

**Step 4: Frontend Core**
- Setup Angular Auth (Guards, Interceptors).
- Layout (Sidebar, Navbar using Material).

**Step 5: Frontend Features**
- Project List & Create Dialog.
- Issue Board/List.
- Issue Detail View.

**Step 6: Deployment**
- Create Dockerfiles.
- Configure Render.yaml.
