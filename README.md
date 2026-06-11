# KrishiSense

Production-ready farmer soil analysis app with secure auth, Gemini multimodal soil photo classification, MongoDB persistence, Cloudinary image storage, and admin review dashboards.

## What It Does

- Farmers register/login with JWT authentication.
- Farmers upload soil photos plus crop/land details.
- Gemini analyzes uploaded photos and returns soil type, confidence, risk, nutrients, irrigation guidance, and recommendations.
- Cloudinary stores uploaded soil images permanently.
- MongoDB stores users, reports, statuses, AI results, and image metadata.
- Admins review reports, users, soil mix, and report status.

## Required Services

Create these before deploying:

- MongoDB Atlas database and connection string.
- Cloudinary account with cloud name, API key, API secret.
- Google AI Studio Gemini API key.
- Render or Vercel project connected to `xodi6/project1`.

## Environment

Copy `.env.example` to `.env` for local development and set real values:

```bash
cp .env.example .env
```

Required production variables:

```bash
NODE_ENV=production
CLIENT_ORIGIN=https://your-live-domain.com
JWT_SECRET=use_a_32_plus_character_random_secret
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=krishsense/soil-photos
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong_admin_password
ADMIN_NAME=KrishiSense Admin
```

Generate a JWT secret:

```bash
openssl rand -base64 48
```

## Run Locally

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.

For frontend-only Vite development:

```bash
npm run dev
```

Run the API separately:

```bash
npm run dev:api
```

## Deploy On Render

`render.yaml` is included.

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint** and select `xodi6/project1`.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. Set `CLIENT_ORIGIN` to your Render URL after the first deploy, then redeploy.

Render is the recommended option for this Express + MongoDB + Cloudinary app because it runs as a normal persistent Node web service.

## Deploy On Vercel

`vercel.json` and `api/index.js` are included.

1. Import `xodi6/project1` in Vercel.
2. Add all required environment variables.
3. Deploy.
4. Set `CLIENT_ORIGIN` to the final Vercel URL and redeploy.

## Push To GitHub

If this folder is not already connected to your repo:

```bash
git init
git branch -M main
git remote add origin https://github.com/xodi6/project1.git
git add .
git commit -m "Productionize KrishiSense soil analysis app"
git push -u origin main
```

If the repo already exists locally:

```bash
git add .
git commit -m "Productionize KrishiSense soil analysis app"
git push origin main
```

If GitHub asks for credentials, use GitHub Desktop, `gh auth login`, or a personal access token with repo access.
