/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native modules used by mongoose/ioredis/bullmq should not be bundled
  // for the client — this keeps server-only code server-only.
  serverExternalPackages: ['mongoose', 'ioredis', 'bullmq'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
