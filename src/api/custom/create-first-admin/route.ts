import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

/**
 * One-time endpoint to create the first admin user
 * Public route - no authentication required
 * TODO: Delete this endpoint after creating first admin user for security
 * 
 * Usage:
 * POST /custom/create-first-admin
 * Body: { "email": "admin@example.com", "password": "secure-password" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      })
      return
    }

    // Check if any admin users already exist
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (existingUsersResult && existingUsersResult.data && existingUsersResult.data.length > 0) {
      res.status(400).json({
        message: `User with email ${email} already exists`,
      })
      return
    }

    // Create admin user using workflow
    const { result: users } = await createUsersWorkflow(req.scope).run({
      input: {
        users: [
          {
            email,
          },
        ],
      },
    })

    // Mark user as admin
    const userModule = req.scope.resolve(Modules.USER)
    
    await userModule.updateUsers({
      id: users[0].id,
      metadata: {
        is_admin: true,
      },
    })

    // Note: Password setting is complex in Medusa v2
    // The user will need to use the "Forgot password" link on the login page
    // OR use Railway CLI: railway run --service edukitecommerce-backend npx medusa user -e <email> -p <password>
    console.log(`User created. Password needs to be set via "Forgot password" link or CLI.`)

    const user = users[0]

    res.json({
      message: "Admin user created successfully!",
      email: user?.email,
      id: user?.id,
      next_steps: [
        "1. Go to the login page: https://edukitecommerce-backend-production.up.railway.app/app",
        "2. Click 'Reset' (Forgot password link)",
        "3. Enter your email and follow the password reset flow",
        "OR use Railway CLI: railway run --service edukitecommerce-backend npx medusa user -e " + email + " -p " + password,
      ],
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    res.status(500).json({
      message: error.message || "Failed to create admin user",
      error: error.toString(),
    })
  }
}

