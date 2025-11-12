import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

let hasRun = false

/**
 * Subscriber to ensure admin user exists with password on server startup
 * This runs automatically when the server is ready
 * Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
 */
export default async function ensureAdminOnStartup({
  container,
}: SubscriberArgs) {
  // Only run once
  if (hasRun) {
    return
  }
  hasRun = true

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const email = process.env.ADMIN_EMAIL || "admin@medusa.com"
  const password = process.env.ADMIN_PASSWORD || "password1234"

  // Wait a bit for database to be fully ready
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    logger.info(`🔧 Ensuring admin user exists: ${email}`)

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
      // User exists, use existing ID
      userId = existingUsersResult.data[0].id
      logger.info(`✅ User already exists: ${email}`)
    } else {
      // Create new user
      logger.info(`📝 Creating new admin user: ${email}`)
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
      logger.info(`✅ User created: ${email} (ID: ${userId})`)
    }

    // Mark user as admin
    try {
      await userModule.updateUsers({
        id: userId,
        metadata: {
          is_admin: true,
        },
      })
      logger.info(`✅ User marked as admin`)
    } catch (error: any) {
      logger.warn(`Could not update user metadata: ${error?.message || error}`)
    }

    // Delete existing auth identity if it exists (to recreate with new password)
    try {
      const allAuthIdentities = await authModule.listAuthIdentities({})
      if (allAuthIdentities && allAuthIdentities.length > 0) {
        const userAuthIdentity = allAuthIdentities.find(
          (auth: any) => auth.entity_id === userId
        )
        if (userAuthIdentity) {
          await authModule.deleteAuthIdentities([userAuthIdentity.id])
          logger.info(`🗑️  Deleted existing auth identity`)
        }
      }
    } catch (error: any) {
      logger.warn(`Could not delete existing auth identity: ${error?.message || error}`)
    }

    // IMPORTANT: Store password in PLAIN TEXT
    // Medusa's emailpass provider will hash it automatically during authentication
    // If we hash it ourselves, Medusa will hash it again, causing a mismatch
    logger.info(`🔐 Creating auth identity with plain text password`)

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

    logger.info(`✅ Admin user ready!`)
    logger.info(`📧 Email: ${email}`)
    logger.info(`🔑 Password: ${password}`)
    logger.info(`🌐 Login at: /app`)
  } catch (error: any) {
    logger.error(`❌ Error ensuring admin user: ${error.message}`)
    logger.error(error.stack)
    // Don't throw - allow server to continue
  }
}

// Try multiple possible startup events
// This will run when the application is ready
export const config: SubscriberConfig = {
  event: "application.ready",
  // Fallback: if application.ready doesn't exist, we'll trigger manually on first request
}

