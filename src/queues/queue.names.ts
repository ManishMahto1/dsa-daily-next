export const QUEUE_NAMES = {
  SCHEDULER: 'daily-dsa-scheduler', // repeatable job, fires at 8PM
  EMAIL: 'email-queue', // actual email send, with retries
} as const;
