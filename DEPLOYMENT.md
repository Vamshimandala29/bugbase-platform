# BugBase Deployment Guide (Render)

## Prerequisites
- GitHub Account (Connected to repository)
- Render Account (https://render.com)

## 1. Database Setup (Render PostgreSQL)
1. Go to Render Dashboard -> **New +** -> **PostgreSQL**.
2. **Name**: `bugbase-db`
3. **Region**: Choose one close to you (e.g., Ohio, Frankfurt).
4. **Plan**: Free.
5. Click **Create Database**.
6. Once created, copy the **Internal Database URL** (for backend) and **External Database URL** (for local access if needed).

## 2. Backend Deployment (Web Service)
1. Go to Render Dashboard -> **New +** -> **Web Service**.
2. Connect your `bugbase-platform` repository.
3. **Name**: `bugbase-backend`
4. **Root Directory**: `backend`
5. **Runtime**: `Docker`
6. **Instance Type**: Free
7. **Environment Variables**:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<HOSTNAME>:5432/<DB_NAME>` 
     - *Replace with the internal hostname/dbname from Step 1. ex: jdbc:postgresql://dpg-xyz-a:5432/bugbase_db_123*
   - `SPRING_DATASOURCE_USERNAME`: `<User from DB>`
   - `SPRING_DATASOURCE_PASSWORD`: `<Password from DB>`
   - `BUGBASE_APP_JWTSECRET`: `GenerateGenericSecureRandomStringHereForTheSecretKey`
8. Click **Create Web Service**.

## 3. Frontend Deployment (Static Site or Web Service)
*Note: Since we use Nginx in Docker, we deploy as a Web Service. If you want free Static Site hosting, you'd need to change the build to just output files.*

**Option A: Web Service (Recommended for Docker parity)**
1. New + -> **Web Service**.
2. Connect repo.
3. **Name**: `bugbase-frontend`
4. **Root Directory**: `frontend`
5. **Runtime**: `Docker`
6. **Environment Variables**:
   - (None for generic build, but if you add API URL in Angular environments, you might need build args).
7. Click **Create Web Service**.

**Option B: Static Site (Simpler/Cheaper)**
1. New + -> **Static Site**.
2. **Root Directory**: `frontend`.
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist/frontend/browser`
5. **Rewrite Rules**:
   - Source: `/*` -> Destination: `/index.html` (for Angular routing)

## 4. Smoke Test
1. Open the Backend URL: `https://bugbase-backend.onrender.com/api/actuator/health` -> Should see `{"status":"UP"}`.
2. Open the Frontend URL.
3. Try to Register/Login. (Note: Frontend API calls need to point to the Backend URL. You might need to update `frontend/src/environments/environment.prod.ts` locally and push again).

## Local Development
- Run `docker-compose up --build`
- Backend: `http://localhost:8081`
- Frontend: `http://localhost:4200` (if running via ng serve) or `80` (via docker).
