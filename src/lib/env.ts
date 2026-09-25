import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),

  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  SENDER_EMAIL: z.string().min(1, 'SENDER_EMAIL is required'),
  RECIPIENT_EMAIL: z.string().email('RECIPIENT_EMAIL must be a valid email'),

  TIMEZONE: z.string().default('Asia/Kolkata'),
  DAILY_CRON: z.string().default('0 20 * * *'),

  FRONTEND_BASE_URL: z.string().default('http://localhost:3000'),
  DEV_TRIGGER_SECRET: z.string().default('changeme'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — check .env against .env.example');
}

export const env = parsed.data;
