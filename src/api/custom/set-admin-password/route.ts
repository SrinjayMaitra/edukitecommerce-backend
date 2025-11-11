import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Endpoint to set password for existing admin user
 * Public route - no authentication required
 * TODO: Delete this endpoint after setting password for security
 * 
 * Usage:
 * POST /custom/set-admin-password
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

    // Find the user
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const usersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (!usersResult || !usersResult.data || usersResult.data.length === 0) {
      res.status(404).json({
        message: `User with email ${email} not found`,
      })
      return
    }

    const userId = usersResult.data[0].id

    // Use auth module to create/update auth identity with password
    const authModule = req.scope.resolve(Modules.AUTH)
    
    // Try to find existing auth identity
    const authIdentities = await authModule.listAuthIdentities({
      entity_id: userId,
    })

    if (authIdentities && authIdentities.length > 0) {
      // Update existing auth identity
      await authModule.updateAuthIdentities({
        id: authIdentities[0].id,
        provider_metadata: {
          password: password,
        },
      })
    } else {
      // Create new auth identity
      await authModule.createAuthIdentities({
        entity_id: userId,
        provider: "emailpass",
        provider_metadata: {
          password: password,
        },
      })
    }

    res.json({
      message: "Password set successfully for user: " + email,
      email: email,
    })
  } catch (error: any) {
    console.error("Error setting password:", error)
    res.status(500).json({
      message: error.message || "Failed to set password",
      error: error.toString(),
    })
  }
}

