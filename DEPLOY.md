# Deploying for Free (No Credit Card Needed)

This guide deploys the whole app using only free tiers that never ask for a
credit card:

| Piece | Service | Cost | Card required? |
| --- | --- | --- | --- |
| Frontend (React/Vite) | [Vercel Hobby](https://vercel.com/pricing) | $0 | No |
| Backend (Spring Boot) | [Render Free](https://render.com/docs/free) | $0 | No |
| Keycloak | Render Free (Docker image) | $0 | No |
| PostgreSQL | [Neon Free](https://neon.com/pricing) | $0 | No |
| Payments (Stripe test mode) | [Stripe](https://stripe.com) | $0 | No |

You already have the Neon database — see `.env.local` in the repo root.

> [!WARNING]
> Free tiers have trade-offs: both Render services **spin down after ~15
> minutes of inactivity**, so the first request afterwards takes 30–90 seconds
> (Keycloak on the 512 MB free instance can take a couple of minutes). Traffic
> wakes them up again automatically.

## 0. Prerequisites

1. Push this repo to your **GitHub** account (Render and Vercel both deploy
   from Git).
2. Have your Neon credentials handy (`.env.local` at the repo root):
   - `DATABASE_URL` (pooled) — used by the backend
   - `DATABASE_URL_UNPOOLED` (direct) — used by Keycloak

## 1. Neon: create a separate database for Keycloak

Keycloak stores its own tables and shouldn't share the app database.

1. Open [console.neon.tech](https://console.neon.tech) → your project.
2. Open the **SQL Editor** and run:
   ```sql
   CREATE DATABASE keycloak;
   ```
3. You'll reuse the same username/password from your existing connection
   strings — only the database name changes (`neondb` → `keycloak`).

## 2. Render: backend + Keycloak (Blueprint)

1. Sign up at [render.com](https://render.com) **with GitHub** — no card.
2. **New → Blueprint**, select this repo. Render reads `render.yaml` and
   creates two free web services:
   - `event-ticket-backend` (built from `backend/dockerfile`)
   - `event-ticket-keycloak` (official Keycloak 26.3 image)
3. Fill in the prompted values:
   - `SPRING_DATASOURCE_URL` — pooled Neon URL as JDBC, e.g.
     `jdbc:postgresql://ep-xxx-pooler.c-x.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` / `PASSWORD` — from `.env.local`
   - `KEYCLOAK_ISSUER_URI` — leave a placeholder for now
     (`https://placeholder/realms/event-ticket-platform`); set in step 3
   - `APP_CORS_ALLOWED_ORIGINS` — placeholder for now; set in step 5
   - `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — your Stripe **test** keys
     (`sk_test_...`, `pk_test_...`), already in `backend/.env`
   - `KC_DB_URL` — direct Neon URL for the new database, e.g.
     `jdbc:postgresql://ep-xxx.c-x.ap-southeast-1.aws.neon.tech/keycloak?sslmode=require`
   - `KC_DB_USERNAME` / `KC_DB_PASSWORD` — from `.env.local`
   - `KC_HOSTNAME` — placeholder for now; set in step 3
   - `KC_BOOTSTRAP_ADMIN_PASSWORD` — pick a strong password
4. **Apply** and wait for both deploys (backend's first Docker build takes
   ~10 min). Note the URLs Render assigns, e.g.
   `https://event-ticket-keycloak.onrender.com`.

### 3. Wire the Keycloak URLs

1. In Render → `event-ticket-keycloak` → **Environment**, set
   `KC_HOSTNAME=https://<your-keycloak-url>` (exactly as Render assigned it)
   and redeploy.
2. In `event-ticket-backend` → **Environment**, set
   `KEYCLOAK_ISSUER_URI=https://<your-keycloak-url>/realms/event-ticket-platform`
   and redeploy.

### 4. Keycloak: realm, client and roles

1. Open `https://<your-keycloak-url>` and log in as
   `admin` / your bootstrap password.
2. Repeat the same setup the build guide describes
   (docs/event-ticket-app-combined.md, "Setting up Keycloak"):
   - Create realm **`event-ticket-platform`**
   - Create client **`event-ticket-platform-app`** (public client / OIDC)
     - **Valid redirect URIs**: `http://localhost:5173/*` and
       `https://<your-vercel-app>.vercel.app/*` (add the Vercel one in step 5
       once the URL is known)
     - **Web origins**: `http://localhost:5173` and the Vercel URL (or `+`)
   - Create realm roles **`ROLE_ORGANIZER`**, **`ROLE_ATTENDEE`**,
     **`ROLE_STAFF`** (backend checks these names literally)
   - Create test users and assign roles as in the guide

> [!TIP]
> The free Keycloak instance sleeps when idle and a cold start can look like a
> failed login. Open the service URL first, wait for it to wake up, then log in.

### 5. Vercel: frontend

1. Sign up at [vercel.com](https://vercel.com) **with GitHub** — no card.
2. **Add New → Project** → import the repo.
3. Under **Root Directory**, enter `frontend` (framework auto-detects Vite).
4. Before deploying, add environment variables (Project → Settings →
   Environment Variables) — see `frontend/.env.example`:
   - `VITE_API_BASE_URL=https://<your-backend-url>`
   - `VITE_KEYCLOAK_AUTHORITY=https://<your-keycloak-url>/realms/event-ticket-platform`
   - `VITE_KEYCLOAK_CLIENT_ID=event-ticket-platform-app`
5. Deploy. Note the URL, e.g. `https://your-app.vercel.app`.
6. Go back and finish the cross-wiring:
   - Keycloak client → add `https://<vercel-url>/*` to redirect URIs / web origins
   - Backend → `APP_CORS_ALLOWED_ORIGINS=https://<vercel-url>` → redeploy

## 6. Verify

1. Open the Vercel URL — published events should load (public endpoints).
2. Log in via Keycloak with an organizer user → create an event → publish it.
3. Buy a ticket with an attendee user (Stripe test card `4242 4242 4242 4242`,
   any future expiry, any CVC).

## Keeping free services awake (optional)

Free Render services sleep after 15 idle minutes. If you want the demo always
warm, set up a free uptime pinger such as [cron-job.org](https://cron-job.org)
(no card) to GET the backend URL every 5 minutes. Beware that this burns
Render's free instance hours: a shared pool of **750 h/month** across all free
services (2 always-on services would need ~1,480 h, so pingers exceed it —
most people just accept the cold start).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Backend 401/`invalid issuer` | `KEYCLOAK_ISSUER_URI` doesn't match the realm URL exactly (https, host, realm name) |
| CORS errors in browser console | Set `APP_CORS_ALLOWED_ORIGINS` on the backend to the exact Vercel URL (no trailing slash) and redeploy |
| `redirect_uri mismatch` at login | Add the Vercel URL to the Keycloak client's redirect URIs |
| Login hangs forever | Keycloak is cold-starting — open its URL directly first |
| `prepared statement does not exist` in backend logs | Append `&prepareThreshold=0` to `SPRING_DATASOURCE_URL` (Neon pooler quirk) |
| Keycloak crashes on start | It OOMs on the 512 MB free instance — redeploy; `JAVA_OPTS_APPEND` in `render.yaml` keeps the heap at 55% |
