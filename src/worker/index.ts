/**
 * Standalone worker entrypoint. Run as its own process — NOT part of
 * the Next.js server — because BullMQ Workers need a long-lived Node
 * process, and Next.js API routes are request-scoped (and unusable
 * for this on serverless platforms like Vercel).
 *
 * Dev:        npm run worker         (tsx, auto-restarts on change)
 * Production: npm run worker:build && npm run worker:start
 *             (or run the same two steps under pm2 / systemd / a
 *             separate Docker service / a small always-on VPS)
 */
import 'dotenv/config';
import { connectDB } from '../lib/db';
import { registerDailySchedule } from '../queues/scheduler.queue';
import './scheduler.worker';
import './email.worker';

async function main() {
  await connectDB();
  await registerDailySchedule();
  console.log('Worker process started — waiting for the daily 8PM job and email queue...');
}

main().catch((err) => {
  console.error('Failed to start worker:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});
