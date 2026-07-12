# MedicaLink HMS — Cloud Deployment Guide

> Complete step-by-step instructions to deploy MedicaLink HMS to the cloud using **free tiers only** — no credit card required.

---

## Architecture Overview

```
GitHub (push to main)
    │
    ├── GitHub Actions CI (auto build + lint check)
    │
    ├── Vercel Project 1: "medicalink-web"    → React Frontend
    └── Vercel Project 2: "medicalink-api"    → Express API (serverless)
                                                    │
                                         ┌──────────┴───────────┐
                                    MongoDB Atlas          Upstash Redis
                                    (Free M0)              (Free 10K/day)
```

---

## Prerequisites

- GitHub account with this repository pushed
- [Vercel](https://vercel.com) account (sign up with GitHub — free, no card)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free, no card)
- [Upstash](https://upstash.com) account (free, no card)

---

## Step 1 — Create MongoDB Atlas Cluster (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Try Free**
2. Sign up with Google or email
3. Click **Build a Database** → Select **M0 FREE** (Shared)
4. Choose a cloud provider region close to you (e.g., AWS / us-east-1)
5. Cluster name: `medicalink-cluster` → **Create Deployment**
6. **Database Access**: Create a database user
   - Username: `medicalink_admin`
   - Password: Generate a secure password → **copy it** (you'll need it)
   - Role: Atlas Admin
7. **Network Access**: Click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - This is required for Vercel serverless functions (they use dynamic IPs)
8. **Get Connection String**: Click **Connect** → **Drivers** → Copy the connection string
   - It looks like: `mongodb+srv://medicalink_admin:<password>@medicalink-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with the password you created

> **Your `MONGO_URI`**: `mongodb+srv://medicalink_admin:YOUR_PASSWORD@medicalink-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## Step 2 — Create Upstash Redis Database (Free)

1. Go to [upstash.com](https://upstash.com) → **Sign Up** (with GitHub)
2. Click **Create Database**
3. Name: `medicalink-redis`
4. Region: Select the closest to your MongoDB Atlas region
5. Type: **Regional** (free)
6. Click **Create**
7. In the database details page, find:
   - **UPSTASH_REDIS_REST_URL**: `https://xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXxxxx...`
   - Copy both values

---

## Step 3 — Deploy the API to Vercel

1. Go to [vercel.com](https://vercel.com) → **Log In** with GitHub
2. Click **Add New** → **Project**
3. **Import** your `MedicaLink-HMS` repository
4. Configure the project:
   - **Project Name**: `medicalink-api`
   - **Framework Preset**: Other
   - **Root Directory**: Click **Edit** → type `apps/api` → **Continue**
5. **Environment Variables** — Add all of these:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `MAIN_DB_NAME` | `medicalink_main` |
   | `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL from Step 2 |
   | `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token from Step 2 |
   | `JWT_ACCESS_SECRET` | Generate: a random 64-character string |
   | `JWT_REFRESH_SECRET` | Generate: a different random 64-character string |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` |
   | `ENCRYPTION_KEY` | Generate: a random 64-character string |
   | `CLIENT_URL` | `https://medicalink-web.vercel.app` (update after deploying frontend) |
   | `API_URL` | `https://medicalink-api.vercel.app` |

   > **Generating random strings**: Open your terminal and run:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```
   > Run it 3 times to get 3 different strings for JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and ENCRYPTION_KEY.

6. Click **Deploy**
7. After deployment, your API is live at: `https://medicalink-api.vercel.app`
8. Verify: Visit `https://medicalink-api.vercel.app/api/v1/health` — you should see:
   ```json
   { "success": true, "message": "MedicaLink HMS API is healthy" }
   ```

---

## Step 4 — Seed the Production Database

After the API is deployed, you need to seed the MongoDB Atlas database with demo data. Run this from your **local machine**:

1. Create a temporary `.env` file pointing to your Atlas cluster:
   ```bash
   # In apps/api/ directory, temporarily update .env:
   MONGO_URI=mongodb+srv://medicalink_admin:YOUR_PASSWORD@medicalink-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MAIN_DB_NAME=medicalink_main
   ```

2. Run the seed script:
   ```bash
   cd apps/api
   pnpm run seed:full
   ```

3. You should see: `🎉 ALL PHASES FULLY SEEDED SUCCESSFULLY!`

4. **Important**: Restore your local `.env` to use `localhost` MongoDB for local development.

---

## Step 5 — Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. **Import** the same `MedicaLink-HMS` repository again (Vercel supports multiple projects from one repo)
3. Configure the project:
   - **Project Name**: `medicalink-web`
   - **Framework Preset**: Vite
   - **Root Directory**: Click **Edit** → type `apps/web` → **Continue**
4. **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://medicalink-api.vercel.app/api/v1` |

5. Click **Deploy**
6. After deployment, your frontend is live at: `https://medicalink-web.vercel.app`

---

## Step 6 — Update the API's CLIENT_URL

Now that the frontend is deployed, update the API's environment variable:

1. Go to your `medicalink-api` project on Vercel
2. **Settings** → **Environment Variables**
3. Update `CLIENT_URL` to `https://medicalink-web.vercel.app`
4. Click **Redeploy** (from Deployments tab → three dots → Redeploy)

---

## Step 7 — Verify End-to-End

1. Open `https://medicalink-web.vercel.app` in your browser
2. Login with: `superadmin@medicalink.com` / `Password123!`
3. You should see the Super Admin dashboard with data
4. Try logging in as `admin@cityhospital.com` / `Password123!`
5. Navigate through Departments, Patients, Billing — all data should load

---

## Updating Your Deployment

After the initial setup, every push to `main` will:
1. Trigger GitHub Actions CI (build + lint check)
2. Auto-deploy to both Vercel projects

No manual steps needed — this is the CI/CD pipeline in action.

---

## Free Tier Limits to Know

| Service | Limit | Impact |
|---------|-------|--------|
| **Vercel** (Hobby) | 100 GB bandwidth/month, 10s function timeout | More than enough for portfolio demos |
| **MongoDB Atlas** (M0) | 512 MB storage, shared cluster | Plenty for demo data |
| **Upstash Redis** | 10,000 commands/day, 256 MB | Sufficient for demo traffic |
| **GitHub Actions** | 2,000 minutes/month | CI runs take ~2 min each |

---

## Troubleshooting

### API returns 500 or blank response
→ Check Vercel function logs: Project → **Deployments** → Click latest → **Functions** tab → Check logs

### Frontend can't reach the API (CORS error)
→ Verify `CLIENT_URL` in the API's Vercel environment variables matches the frontend URL exactly

### Database connection fails
→ Verify MongoDB Atlas **Network Access** is set to `0.0.0.0/0` (Allow from Anywhere)
→ Verify the `MONGO_URI` connection string has the correct password

### Login fails (seeded credentials don't work)
→ Make sure you ran `pnpm run seed:full` with the `MONGO_URI` pointing to your Atlas cluster

### Vercel build fails
→ Run `pnpm run build` locally first to check for TypeScript errors
→ Check the Vercel build logs for the specific error
