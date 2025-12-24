# BugBase Platform 🐛

BugBase is a full-stack bug tracking and project management platform designed for modern development teams. It features a sleek, dark-themed UI built with Angular and a robust RESTful API powered by Spring Boot.

## 🚀 Quick Start (Docker)

The easiest way to run BugBase is using Docker Compose. This starts the Frontend, Backend, and PostgreSQL database all at once.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### How to Run
1. Open your terminal in the project root directory.
2. Run the following command:
   ```bash
   docker-compose up --build -d
   ```
3. Once the containers are running, access the platform at:
   - **Frontend**: [http://localhost:4200](http://localhost:4200)
   - **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)

---

## 🛠 Tech Stack

- **Frontend**: Angular 18, TailwindCSS, Lucide Icons.
- **Backend**: Java 17, Spring Boot 3.3.0, Spring Security (JWT), Hibernate/JPA.
- **Database**: PostgreSQL 15.
- **DevOps**: Docker & Docker Compose.

---

## 🔑 Access Credentials

### Application Login (Debug Account)
*   **Email**: `debug@test.com`
*   **Password**: `password123`
*(You can also use the Register page to create your own account)*

### Database Connectivity (Direct Access)
If you want to connect to the database via DBeaver or pgAdmin:
- **Host**: `localhost`
- **Port**: `5433`
- **Username**: `postgres`
- **Password**: `postgres`
- **Database**: `bugbase`

---

## 🏗 Project Structure

- `/frontend`: Angular application (UI/UX).
- `/backend`: Spring Boot application (API/Business Logic).
- `/docker-compose.yml`: Orchestration for all services.
- `/render.yaml`: Configuration for cloud deployment (Render).

---

## 🔧 Troubleshooting

- **502 Bad Gateway**: Ensure the backend container is fully started before accessing the frontend. Check logs with `docker logs bugbase-backend`.
- **Port Conflict**: If port `8080` or `4200` is already in use, you can update the port mappings in `docker-compose.yml`.
- **Database Timeout**: Verify that you are using port **5433** if connecting from your host machine.
