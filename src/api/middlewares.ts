import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

let adminSetupAttempted = false
let adminSetupComplete = false

async function ensureAdminUser(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Only run once, and only if not already complete
  if (adminSetupComplete || adminSetupAttempted) {
    return next()
  }

  adminSetupAttempted = true

  // Run in background - don't block the request
  setImmediate(async () => {
    const container = req.scope
    let logger: any
    try {
      logger = container.resolve(ContainerRegistrationKeys.LOGGER)
      const email = process.env.ADMIN_EMAIL || "admin@medusa.com"
      const password = process.env.ADMIN_PASSWORD || "password1234"

      logger.info(`🔧 [Middleware] Ensuring admin user exists: ${email}`)

      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const authModule = container.resolve(Modules.AUTH)
      const userModule = container.resolve(Modules.USER)

      // Check if user already exists
      const existingUsersResult = await query.graph({
        entity: "user",
        fields: ["id", "email"],
        filters: {
          email: email,
        },
      })

      let userId: string

      if (existingUsersResult && existingUsersResult.data && existingUsersResult.data.length > 0) {
        userId = existingUsersResult.data[0].id
        logger.info(`✅ [Middleware] User already exists: ${email}`)
      } else {
        // Create new user
        logger.info(`📝 [Middleware] Creating new admin user: ${email}`)
        const { result: users } = await createUsersWorkflow(container).run({
          input: {
            users: [
              {
                email,
              },
            ],
          },
        })
        userId = users[0].id
        logger.info(`✅ [Middleware] User created: ${email} (ID: ${userId})`)
      }

      // Mark user as admin
      try {
        await userModule.updateUsers({
          id: userId,
          metadata: {
            is_admin: true,
          },
        })
        logger.info(`✅ [Middleware] User marked as admin`)
      } catch (error: any) {
        logger.warn(`[Middleware] Could not update user metadata: ${error?.message || error}`)
      }

      // Delete existing auth identity if it exists
      try {
        const allAuthIdentities = await authModule.listAuthIdentities({})
        if (allAuthIdentities && allAuthIdentities.length > 0) {
          const userAuthIdentity = allAuthIdentities.find(
            (auth: any) => auth.entity_id === userId
          )
          if (userAuthIdentity) {
            await authModule.deleteAuthIdentities([userAuthIdentity.id])
            logger.info(`🗑️  [Middleware] Deleted existing auth identity`)
          }
        }
      } catch (error: any) {
        logger.warn(`[Middleware] Could not delete existing auth identity: ${error?.message || error}`)
      }

      // IMPORTANT: Store password in PLAIN TEXT
      // Medusa's emailpass provider will hash it automatically during authentication
      // If we hash it ourselves, Medusa will hash it again, causing a mismatch
      logger.info(`🔐 [Middleware] Creating auth identity with plain text password`)

      // Create auth identity with plain text password
      await (authModule.createAuthIdentities as any)([
        {
          entity_id: userId,
          provider: "emailpass",
          provider_metadata: {
            password: password, // Plain text - Medusa hashes it during auth
          },
          user_metadata: {
            is_admin: true,
          },
        },
      ])

      adminSetupComplete = true
      logger.info(`✅ [Middleware] Admin user ready!`)
      logger.info(`📧 [Middleware] Email: ${email}`)
      logger.info(`🔑 [Middleware] Password: ${password}`)
      logger.info(`🌐 [Middleware] Login at: /app`)
    } catch (error: any) {
      // Try to log error, but don't fail if logger isn't available
      try {
        if (!logger) {
          logger = container.resolve(ContainerRegistrationKeys.LOGGER)
        }
        logger.error(`❌ [Middleware] Error ensuring admin user: ${error.message}`)
        logger.error(error.stack)
      } catch {
        console.error(`❌ [Middleware] Error ensuring admin user: ${error.message}`)
        console.error(error.stack)
      }
      // Reset flag so it can try again on next request
      adminSetupAttempted = false
    }
  })

  // Continue with the request immediately
  next()
}

// Middleware to set cookie after successful auth
async function setAuthCookie(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Only intercept POST /auth/user/emailpass
  if (req.method === 'POST' && req.path === '/auth/user/emailpass') {
    // Store original json method
    const originalJson = res.json.bind(res)
    
    // Override json to intercept response
    res.json = function(body: any) {
      // If response contains a token, set it as a cookie
      if (body && body.token) {
        res.cookie("_medusa_jwt", body.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      }
      // Call original json method
      return originalJson(body)
    }
  }
  
  next()
}

export default defineMiddlewares({
  routes: [
    {
      // Run on any request to ensure admin is set up
      matcher: /.*/,
      middlewares: [ensureAdminUser],
    },
    {
      // Intercept auth endpoint to set cookie
      matcher: /^\/auth\/user\/emailpass$/,
      middlewares: [setAuthCookie],
    },
  ],
})

