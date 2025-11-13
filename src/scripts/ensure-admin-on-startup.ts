import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"
import * as bcrypt from "bcryptjs"

/**
 * Script to ensure admin user exists with password on startup
 * This runs automatically when the server starts
 * Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
 */
export default async function ensureAdminOnStartup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const email = process.env.ADMIN_EMAIL || "admin@medusa.com"
  const password = process.env.ADMIN_PASSWORD || "password1234"

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

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    logger.info(`🔐 Password hashed successfully`)

    // Create auth identity with hashed password
    await (authModule.createAuthIdentities as any)([
      {
        entity_id: userId,
        provider: "emailpass",
        provider_metadata: {
          password: hashedPassword,
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
    // Don't throw - allow server to start even if admin setup fails
  }
}




