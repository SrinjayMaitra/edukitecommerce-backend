import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Get email and password from environment variables or use defaults
  const email = process.env.ADMIN_EMAIL || "admin@edukit.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"

  try {
    logger.info(`Creating admin user with email: ${email}`)

    // Create admin user using Medusa workflow
    const { result: users } = await createUsersWorkflow(container).run({
      input: {
        users: [
          {
            email,
          },
        ],
      },
    })

    // Set password and make admin using auth module
    const authModule = container.resolve(Modules.AUTH)
    const userModule = container.resolve(Modules.USER)
    
    // Create auth identity with password
    await authModule.createAuthIdentities({
      entity_id: users[0].id,
      provider_metadata: {
        password: password,
        is_admin: true,
      },
    })

    // Update user metadata to mark as admin
    await userModule.updateUsers({
      id: users[0].id,
      metadata: {
        is_admin: true,
      },
    })

    const result = users

    logger.info(`Admin user created successfully!`)
    logger.info(`Email: ${email}`)
    logger.info(`Password: ${password}`)
    logger.info(`User ID: ${result[0]?.id}`)

    return result
  } catch (error: any) {
    // If user already exists, that's okay
    if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
      logger.warn(`Admin user with email ${email} already exists. Skipping creation.`)
      return null
    }
    
    logger.error(`Error creating admin user: ${error.message}`)
    throw error
  }
}

