import 'dotenv/config';

const requiredEnv = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'NODE_ENV', 'PORT'] as const;

type RequiredEnv = (typeof requiredEnv)[number];

const missing: RequiredEnv[] = requiredEnv.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
  },
};
