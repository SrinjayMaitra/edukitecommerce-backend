import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

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
    // Check for setup secret (case-insensitive header check)
    const setupSecret = process.env.ADMIN_SETUP_SECRET || "change-this-secret"
    const providedSecret = (req.headers["x-setup-secret"] || req.headers["X-Setup-Secret"]) as string

    console.log("Setup secret check:", { 
      expected: setupSecret, 
      provided: providedSecret,
      headers: Object.keys(req.headers)
    })

    if (!providedSecret || providedSecret !== setupSecret) {
      res.status(401).json({
        message: "Unauthorized. Provide x-setup-secret header with value: " + setupSecret,
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
    const authModule = req.scope.resolve(Modules.AUTH)
    const existingUsers = await authModule.listAuthUsers({
      email,
    })

    if (existingUsers && existingUsers.length > 0) {
      res.status(400).json({
        message: `User with email ${email} already exists`,
      })
      return
    }

    // Create admin user
    const user = await authModule.createAuthUsers({
      email,
      password,
      provider_metadata: {
        is_admin: true,
      },
    })

    res.json({
      message: "Admin user created successfully",
      email: user[0]?.email,
      id: user[0]?.id,
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    res.status(500).json({
      message: error.message || "Failed to create admin user",
      error: error.toString(),
    })
  }
}

