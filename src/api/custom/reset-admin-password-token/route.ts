import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Generate a password reset token for admin user
 * This bypasses email and returns the token directly
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
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

    const { email } = req.body as { email?: string }

    if (!email) {
      res.status(400).json({
        message: "Email is required",
      })
      return
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = req.scope.resolve(Modules.AUTH)

    // Find the user
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

    // Generate password reset token using auth module
    // This should create a token we can use
    try {
      // Use the auth module to generate a reset token
      const tokenResult = await (authModule as any).generatePasswordResetToken({
        entity_id: userId,
        provider: "emailpass",
      })

      res.json({
        message: "Password reset token generated",
        email: email,
        token: tokenResult?.token || "Check database for token",
        note: "Use this token with /admin/users/reset-password endpoint",
      })
    } catch (error: any) {
      // If that doesn't work, try to get token from database
      console.error("Error generating token:", error)
      
      // Try to find token in database
      const tokenQuery = await query.graph({
        entity: "auth_provider_token",
        fields: ["*"],
        filters: {
          entity_id: userId,
        },
      })

      res.json({
        message: "Token generation failed, but here's what we found",
        email: email,
        error: error?.message,
        tokens: tokenQuery?.data || [],
      })
    }
  } catch (error: any) {
    console.error("Error:", error)
    res.status(500).json({
      message: error.message || "Failed to generate token",
      error: error.toString(),
    })
  }
}

