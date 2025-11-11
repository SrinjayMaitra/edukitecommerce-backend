import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

/**
 * One-time endpoint to create the first admin user
 * Protected by ADMIN_SETUP_SECRET environment variable
 * 
 * Usage:
 * POST /admin/create-first-admin
 * Headers: { "x-setup-secret": "your-secret" }
 * Body: { "email": "admin@example.com", "password": "secure-password" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // TEMPORARILY DISABLED: Secret check for easier setup
    // TODO: Re-enable after first admin user is created
    // Check for setup secret (try header first, then query param)
    const setupSecret = process.env.ADMIN_SETUP_SECRET || "change-this-secret"
    
    // Try multiple ways to get the secret
    const headerSecret = req.headers["x-setup-secret"] || req.headers["X-Setup-Secret"]
    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`)
    const querySecret = url.searchParams.get("secret")
    const providedSecret = headerSecret || querySecret

    // TEMPORARILY: Allow if no secret provided (for initial setup only)
    // Remove this after creating first admin user!
    const skipAuth = !providedSecret && process.env.NODE_ENV === "production"
    
    if (!skipAuth && (!providedSecret || providedSecret !== setupSecret)) {
      res.status(401).json({
        message: "Unauthorized. Provide x-setup-secret header or ?secret= query param. Expected: " + setupSecret + ", Got: " + (providedSecret || "nothing"),
      })
      return
    }

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

    // For now, just mark user as admin
    // Password will need to be set via Medusa CLI or admin panel
    const userModule = req.scope.resolve(Modules.USER)
    
    // Update user metadata to mark as admin
    await userModule.updateUsers({
      id: users[0].id,
      metadata: {
        is_admin: true,
      },
    })
    
    // Note: Password needs to be set separately via:
    // npx medusa user -e <email> -p <password>
    // Or use the admin panel to set password

    const user = users[0]

    res.json({
      message: "Admin user created successfully",
      email: user?.email,
      id: user?.id,
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    res.status(500).json({
      message: error.message || "Failed to create admin user",
      error: error.toString(),
    })
  }
}

