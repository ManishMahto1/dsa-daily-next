import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().default(''),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),

  RESEND_API_KEY: z.string().default(''),
  SENDER_EMAIL: z.string().default('noreply@thericecitygondia.com'),
  RECIPIENT_EMAIL: z.string().default('you@example.com'),

  TIMEZONE: z.string().default('Asia/Kolkata'),
  DAILY_CRON: z.string().default('0 20 * * *'),

  FRONTEND_BASE_URL: z.string().default('http://localhost:3000'),
  DEV_TRIGGER_SECRET: z.string().default('changeme'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Warning: Environment variables incomplete at build time:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
