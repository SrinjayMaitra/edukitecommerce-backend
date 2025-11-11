import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Public endpoint to set/update password for an existing admin user.
 * This is a temporary endpoint for initial setup.
 * TODO: Delete this endpoint after setting the first admin user's password for security.
 *
 * Usage:
 * POST /custom/set-admin-password
 * Headers: x-setup-secret: <your-secret> (or ?secret=<your-secret>)
 * Body: { "email": "admin@example.com", "password": "secure-password" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Check for setup secret (optional but recommended for security)
    const setupSecret = process.env.ADMIN_SETUP_SECRET
    if (setupSecret) {
      const providedSecret = req.headers["x-setup-secret"] || req.query.secret
      if (providedSecret !== setupSecret) {
        res.status(401).json({
          message: "Unauthorized. Provide x-setup-secret header or secret query param.",
        })
        return
      }
    }

    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      })
      return
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = req.scope.resolve(Modules.AUTH)

    // Find the user by email
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (!existingUsersResult || !existingUsersResult.data || existingUsersResult.data.length === 0) {
      res.status(404).json({
        message: `User with email ${email} not found`,
      })
      return
    }

    const userId = existingUsersResult.data[0].id

    // Check if an auth identity already exists for this user
    const existingAuthIdentities = await query.graph({
      entity: "auth_identity",
      fields: ["id"],
      filters: {
        entity_id: userId,
        provider: "emailpass",
      },
    })

    if (existingAuthIdentities && existingAuthIdentities.data && existingAuthIdentities.data.length > 0) {
      // Update existing auth identity password
      // Note: Medusa v2 doesn't have a direct update method, so we'll delete and recreate
      const authIdentityId = existingAuthIdentities.data[0].id
      
      // Delete existing auth identity
      await authModule.deleteAuthIdentities([authIdentityId])
      
      // Create new auth identity with new password
      await authModule.createAuthIdentities([
        {
          entity_id: userId,
          provider: "emailpass",
          provider_metadata: {
            password: password,
          },
          user_metadata: {
            is_admin: true,
          },
        },
      ])
    } else {
      // Create new auth identity
      await authModule.createAuthIdentities([
        {
          entity_id: userId,
          provider: "emailpass",
          provider_metadata: {
            password: password,
          },
          user_metadata: {
            is_admin: true,
          },
        },
      ])
    }

    res.json({
      message: "Admin password set successfully! You can now log in.",
      email: email,
      id: userId,
    })
  } catch (error: any) {
    console.error("Error setting admin password:", error)
    res.status(500).json({
      message: error.message || "Failed to set admin password",
      error: error.toString(),
    })
  }
}

