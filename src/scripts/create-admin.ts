import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAuthUsersWorkflow } from "@medusajs/medusa/core-flows"

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Get email and password from environment variables or use defaults
  const email = process.env.ADMIN_EMAIL || "admin@edukit.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"

  try {
    logger.info(`Creating admin user with email: ${email}`)

    // Create admin user using Medusa workflow
    const { result } = await createAuthUsersWorkflow(container).run({
      input: {
        auth_users: [
          {
            email,
            password,
            provider_metadata: {
              is_admin: true,
            },
          },
        ],
      },
    })

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

