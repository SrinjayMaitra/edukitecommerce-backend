import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow, createAuthIdentitiesWorkflow } from "@medusajs/medusa/core-flows"

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

    // Set password using createAuthIdentitiesWorkflow
    try {
      await createAuthIdentitiesWorkflow(req.scope).run({
        input: {
          auth_identities: [
            {
              entity_id: users[0].id,
              provider: "emailpass",
              provider_metadata: {
                password: password,
              },
              user_metadata: {
                is_admin: true,
              },
            },
          ],
        },
      })
      console.log("Password set successfully via workflow")
    } catch (authError: any) {
      console.warn("Could not set password automatically:", authError?.message || authError)
      // Continue anyway - user can use forgot password flow
    }

    const user = users[0]

    res.json({
      message: "Admin user created successfully! Try logging in now.",
      email: user?.email,
      id: user?.id,
      password_set: "Password should be set. If login fails, use 'Forgot password' link.",
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    res.status(500).json({
      message: error.message || "Failed to create admin user",
      error: error.toString(),
    })
  }
}

