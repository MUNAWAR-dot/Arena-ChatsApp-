# Chatsapp — Free-Tier Deployment Guide (Render + Neon + Netlify)

## Architecture

```
Netlify (frontend, free)  ──wss/socket.io──►  Render (Fastify+Socket.IO, free)
                                                     │
                                                     ▼
                                              Neon (Postgres, free)
```

## 1. Database — Neon (free)

1. Create a Neon project → copy the **connection string**
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/chatsapp?sslmode=require`
2. Keep it handy for the server env.

## 2. Server — Render (free)

**Option A — Blueprint (recommended):** push this repo to GitHub, then
Render → New → Blueprint → select the repo. It reads `render.yaml`.

**Option B — Manual web service:**
- Root directory: `server`
- Build: `npm ci && npx prisma generate && npm run build`
- Start: `npx prisma db push --accept-data-loss && node dist/index.js`
- Health check: `/health`

Environment variables:

| Var | Value |
| --- | --- |
| `DATABASE_URL` | your Neon string |
| `CORS_ORIGIN` | `https://your-app.netlify.app` |
| `SMS_SIMULATION_DELIVERY` | `0` |
| `GOOGLE_CLIENT_ID` | *(optional)* Google OAuth client ID |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | *(optional)* `npx web-push generate-vapid-keys` |

> Render free tier sleeps after 15 min idle — the first request after sleep
> takes a few seconds to wake. Free Neon pauses similarly.

## 3. Frontend — Netlify (free)

1. Netlify → Add new site → Import from Git → this repo
2. Build command: `npm run build` · Publish directory: `dist`
3. Environment variables:

| Var | Value |
| --- | --- |
| `VITE_SOCKET_URL` | `https://your-server.onrender.com` |
| `VITE_API_URL` | `https://your-server.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | *(optional)* same as server |
| `VITE_VAPID_PUBLIC_KEY` | *(optional)* same as server |

4. Deploy. The `netlify.toml` handles SPA fallback + caching.

## 4. SMS OTP in production

`SMS_SIMULATION_DELIVERY=0` disables returning the code. Wire a real gateway
(Twilio free trial, Vonage, etc.) inside `server/src/index.ts` →
`POST /auth/otp`, sending the 6-digit code via SMS instead of the debug return.

## 5. Web push (optional, free)

```bash
npx web-push generate-vapid-keys
```
Set the keys on server + `VITE_VAPID_PUBLIC_KEY` on the client. The server
sends a real push to all chat members on new messages.

## 6. Google OAuth (optional, free)

1. Google Cloud Console → Credentials → OAuth client ID (Web application)
2. Authorized JS origin: `https://your-app.netlify.app`
3. Authorized redirect URIs: `https://your-app.netlify.app`
4. Set `GOOGLE_CLIENT_ID` (server) + `VITE_GOOGLE_CLIENT_ID` (client)

## Local development

```bash
# server
cd server
cp .env.example .env       # set DATABASE_URL, SMS_SIMULATION_DELIVERY=1
npm ci
npx prisma migrate deploy
npm run dev                # :3001

# frontend
cp .env.example .env.local # set VITE_SOCKET_URL=http://localhost:3001
npm install
npm run dev                # :5173
```

## Performance notes (free tier)

- Media blobs are stored client-side (IndexedDB) until an object store (S3) is
  attached; `Media.url` is the swap point.
- Socket.IO uses `websocket` transport first with `polling` fallback — works
  through proxies and cold starts.
- Messages are encrypted (AES-GCM) before leaving the device; the DB only ever
  stores ciphertext envelopes.
