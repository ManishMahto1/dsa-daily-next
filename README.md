# Daily DSA — Next.js + Gemini

Same system as the Express version, ported to Next.js, with **Gemini auto-generating each day's question** instead of a static seed bank. Single user, 8PM daily email, difficulty adapts to your streak.

**Stack:** Next.js (App Router) · MongoDB (Mongoose) · Redis · BullMQ · Gemini API · Resend

## Why there's a separate `worker/` process

Next.js API routes are request-scoped — they spin up, handle one request, and die. BullMQ's `Worker` needs a **long-lived process** listening to Redis. So:

- **Next.js app** (`npm run dev` / deployed to Vercel or anywhere) — serves the UI and the API routes (`/api/dsa/submit`, `/api/progress`, etc.) and can *enqueue* jobs.
- **Worker process** (`npm run worker`) — a plain Node process (run via `tsx`, no Next.js involved) that holds the BullMQ `Worker` instances and actually processes jobs: the 8PM scheduler and the email queue.

These run as two separate deployments/processes, sharing the same MongoDB and Redis.

## How it works

```
BullMQ repeatable job (8PM IST, cron via env, held by the worker process)
        │
        ▼
runDailyDsaJob()
  ├─ read Progress (currentLevel, solvedIds)
  ├─ look for an unseen question already in MongoDB at that level
  │     └─ if none found → ask Gemini to generate one → save it
  ├─ create a Delivery record (status: pending)
  └─ enqueue an email-send job ──▶ BullMQ email worker ──▶ Resend ──▶ your inbox
                                                                   │
                                                                   ▼
                                                   email links to /dsa/[deliveryId]
                                                   (a Next.js page, server-rendered)
                                                                   │
                                                   you click Solved/Couldn't solve,
                                                   client component POSTs
                                                   /api/dsa/submit
                                                                   │
                                                                   ▼
                                           progress.service.ts updates streak/level
                                           (difficulty.engine.ts decides next level)
```

The question bank **grows itself** — Gemini is only called when there's no unseen question left at the current difficulty, so early on you'll see a lot of generation, and it tapers off as the bank fills up.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — local `mongod` or Atlas free tier
- `REDIS_URL` — local `redis-server` or Upstash/Redis Cloud free tier
- `GEMINI_API_KEY` — from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- `RESEND_API_KEY`, `SENDER_EMAIL`, `RECIPIENT_EMAIL` — from [resend.com](https://resend.com)

## Running locally

Three things need to be running: MongoDB, Redis, and then these two processes in separate terminals:

```bash
# Terminal 1 — Next.js app (UI + API)
npm run dev

# Terminal 2 — worker (this is what actually generates + sends the 8PM email)
npm run worker
```

Visit `http://localhost:3000` for the dashboard.

To test without waiting for 8PM:

```bash
curl -X POST http://localhost:3000/api/dsa/trigger \
  -H "x-dev-secret: changeme"
```

This picks/generates the question and queues the email immediately — the worker process (Terminal 2) needs to be running to actually pick it up and send it.

## API Reference

| Method | Route                          | Purpose                                              |
|--------|---------------------------------|-------------------------------------------------------|
| GET    | `/api/dsa/today`               | latest delivery (today's question)                    |
| GET    | `/api/dsa/delivery/:id`        | fetch a specific delivery + populated question         |
| POST   | `/api/dsa/submit`              | `{ deliveryId, isCorrect }` — records your answer      |
| POST   | `/api/dsa/trigger`             | manually fires the daily job (needs `x-dev-secret`)    |
| GET    | `/api/progress`                | current level, streak, accuracy                        |

## Production deployment

The two halves deploy differently:

- **Next.js app** → Vercel, or any Node host. Standard `next build && next start`.
- **Worker** → needs an *always-on* process, so **not** Vercel serverless functions. Cheapest options: a small VPS (Railway, Render background worker, Fly.io, a $5 DigitalOcean droplet) running:
  ```bash
  npm run worker:build   # compiles src/worker + its deps to dist-worker/ (plain CJS)
  npm run worker:start   # node dist-worker/worker/index.js
  ```
  Wire it into pm2 or systemd for restarts, same as any long-running Node service.

Only one worker instance needs to hold the scheduler — BullMQ dedupes the repeatable job via the fixed `jobId: 'daily-dsa-8pm'`, so accidentally running two worker instances is harmless (you'd just have 2x email-processing capacity, not 2x emails).

## Tuning

- **Difficulty curve** — `src/modules/dsa/difficulty.engine.ts` (`PROMOTE_AFTER_STREAK`, `DEMOTE_AFTER_MISSES`)
- **Send time** — `DAILY_CRON` in `.env` (5-field cron, evaluated in `TIMEZONE`)
- **Gemini prompt / question style** — `src/modules/gemini/gemini.service.ts`
- **Gemini model** — `GEMINI_MODEL` in `.env`; check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) for the current fast/cheap model name, since these get renamed over time

## Notes on the Gemini integration

- Responses are requested as strict JSON (`responseMimeType: 'application/json'`) and validated before being saved — a malformed model response throws instead of silently writing garbage into Mongo.
- The last 30 question titles at that difficulty are sent back to Gemini as a "don't repeat these" list, to reduce duplicate questions over time.
- Every generated question is persisted, so you're not re-calling Gemini for a question you've already been sent but haven't gotten to yet — it becomes part of the reusable bank.
