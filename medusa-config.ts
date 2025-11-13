import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL || process.env.REDISCLOUD_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // Explicitly configure cookie options for authentication
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true',
      sameSite: 'lax',
      httpOnly: true,
    },
  },
  modules: [
    {
      resolve: "./src/modules/subscription",
    },
  ],
})
