# Deploying HydroShift AI to Render

This guide outlines how to deploy the **HydroShift AI** platform to [Render](https://render.com) using the included Infrastructure-as-Code Blueprint (`render.yaml`).

---

## Architecture on Render

```
  [ Users / Browser ]
          │
          ▼
  [ swot-khulna-web ]  (Next.js Web Frontend)
          │  REST / JSON
          ▼
  [ swot-khulna-api ]  (FastAPI Backend)
       │        │
       │        └──────────────┐
       ▼                       ▼
[ swot-khulna-db ]    [ swot-khulna-redis ]
 (PostgreSQL 16)      (Redis Cache / Queue)
                               ▲
                               │
                      [ swot-khulna-worker ]
                      (Celery Task Worker)
```

---

## Option A: 1-Click Blueprint Deployment (Recommended)

Render Blueprints read the `render.yaml` specification directly from your Git repository and automatically orchestrate all 5 components, including private networking and environment variables.

### Step 1: Push Code to GitHub / GitLab
Make sure your changes (including `render.yaml`, `infra/api.Dockerfile`, and `infra/web.Dockerfile`) are committed and pushed to your GitHub or GitLab repository:
```bash
git add .
git commit -m "feat: add Render Blueprint configuration"
git push origin master
```

### Step 2: Create a Blueprint Instance on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub/GitLab repository.
4. Render will parse `render.yaml` and list all services it will create:
   - **swot-khulna-db**: PostgreSQL database
   - **swot-khulna-redis**: Redis cache
   - **swot-khulna-api**: FastAPI Docker Web Service
   - **swot-khulna-worker**: Celery Docker Worker
   - **swot-khulna-web**: Next.js Docker Web Service
5. Give the Blueprint Instance a name (e.g. `swot-khulna-prod`).
6. Click **Apply**.

### Step 3: Monitor Initial Build & Database Seeding
The backend web service startup command automatically executes:
```bash
alembic upgrade head
python -m scripts.seed
python -m scripts.seed_crop_data
python -m scripts.ingest_ground_truth
python -m scripts.populate_database
uvicorn services.api.app.main:app --host 0.0.0.0 --port $PORT
```
Once all builds turn green:
- Open your frontend at: `https://swot-khulna-web.onrender.com`
- Test API docs at: `https://swot-khulna-api.onrender.com/docs`

---

## Option B: Deploying Step-by-Step Manually

If you prefer to configure each service manually in the Render UI:

### 1. Create the Database
- Click **New +** $\rightarrow$ **PostgreSQL**.
- Name: `swot-khulna-db`
- Database: `khulna_salt_intrusion`
- User: `swot_app`
- Copy the **Internal Database URL** once provisioned.

### 2. Create the Redis Instance
- Click **New +** $\rightarrow$ **Redis**.
- Name: `swot-khulna-redis`
- Copy the **Internal Redis URL** once provisioned.

### 3. Create the FastAPI Web Service
- Click **New +** $\rightarrow$ **Web Service**.
- Select your repository.
- Environment: **Docker**
- Dockerfile Path: `./infra/api.Dockerfile`
- Docker Context: `.`
- Start Command:
  ```bash
  sh -c "alembic upgrade head && python -m scripts.seed && python -m scripts.seed_crop_data && python -m scripts.ingest_ground_truth && python -m scripts.populate_database && uvicorn services.api.app.main:app --host 0.0.0.0 --port $PORT"
  ```
- Environment Variables:
  - `DATABASE_URL`: `[Internal Database URL]`
  - `REDIS_URL`: `[Internal Redis URL]`
  - `CELERY_BROKER_URL`: `[Internal Redis URL]`
  - `CELERY_RESULT_BACKEND`: `[Internal Redis URL]`
  - `PYTHONPATH`: `/app`
  - `ENVIRONMENT`: `production`
  - `CORS_ALLOWED_ORIGINS`: `*`

### 4. Create the Celery Worker
- Click **New +** $\rightarrow$ **Background Worker**.
- Environment: **Docker**
- Dockerfile Path: `./infra/api.Dockerfile`
- Docker Context: `.`
- Start Command: `celery -A services.worker.celery_app worker --loglevel=info`
- Set the same `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, and `PYTHONPATH=/app`.

### 5. Create the Next.js Web Frontend
- Click **New +** $\rightarrow$ **Web Service**.
- Environment: **Docker**
- Dockerfile Path: `./infra/web.Dockerfile`
- Docker Context: `.`
- Start Command: `sh -c "pnpm dev --hostname 0.0.0.0 --port $PORT"`
- Environment Variables:
  - `NEXT_PUBLIC_API_BASE_URL`: `https://[your-api-service].onrender.com`

---

## Free Tier vs Starter Plan Notes

| Service | Free Tier Compatibility | Recommendation |
| :--- | :--- | :--- |
| **PostgreSQL** | Free for 30 days | Use Free for hackathon demos; upgrade to Starter (\$7/mo) for persistent uptime. |
| **Redis** | Free tier available | Free tier is sufficient for demo tasks. |
| **FastAPI Backend** | Free tier available | Spins down after 15 min inactivity (takes ~30s on first load). |
| **Next.js Web** | Free tier available | Responsive and fast on free tier. |
| **Celery Worker** | Requires Starter (\$7/mo) | Render requires minimum Starter plan for persistent Background Workers. If on a strict \$0 budget, Celery can run as a background thread inside the API container. |

