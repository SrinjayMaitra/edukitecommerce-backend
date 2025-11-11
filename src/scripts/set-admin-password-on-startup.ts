import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import * as bcrypt from "bcryptjs"

/**
 * Script to set admin password on startup
 * This runs automatically when the server starts
 * Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
 */
export default async function setAdminPasswordOnStartup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const email = process.env.ADMIN_EMAIL || "admin@medusa.com"
  const password = process.env.ADMIN_PASSWORD || "password1234"

  try {
    logger.info(`Attempting to set password for admin user: ${email}`)

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = container.resolve(Modules.AUTH)

    // Find the user
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (!existingUsersResult || !existingUsersResult.data || existingUsersResult.data.length === 0) {
      logger.warn(`User with email ${email} not found. Skipping password setup.`)
      return
    }

    const userId = existingUsersResult.data[0].id

    // Delete existing auth identity if it exists
    try {
      const allAuthIdentities = await authModule.listAuthIdentities({})
      if (allAuthIdentities && allAuthIdentities.length > 0) {
        const userAuthIdentity = allAuthIdentities.find(
          (auth: any) => auth.entity_id === userId && auth.provider === "emailpass"
        )
        if (userAuthIdentity) {
          await authModule.deleteAuthIdentities([userAuthIdentity.id])
          logger.info("Deleted existing auth identity")
        }
      }
    } catch (error: any) {
      logger.warn(`Could not delete existing auth identity: ${error?.message || error}`)
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    logger.info("Password hashed successfully")

    // Create new auth identity with hashed password
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

    logger.info(`✅ Admin password set successfully for ${email}`)
    logger.info(`You can now log in with email: ${email} and password: ${password}`)
  } catch (error: any) {
    logger.error(`Error setting admin password: ${error.message}`)
    // Don't throw - allow server to start even if password setup fails
  }
}

