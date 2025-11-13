import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Endpoint to mark a user as admin
 * Public route - no authentication required
 * 
 * Usage:
 * POST /custom/mark-admin
 * Body: { "email": "admin@example.com" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email } = req.body as { email?: string }

    if (!email) {
      res.status(400).json({
        message: "Email is required",
      })
      return
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const userModule = req.scope.resolve(Modules.USER)

    // Find user by email
    const usersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (!usersResult?.data || usersResult.data.length === 0) {
      res.status(404).json({
        message: `User with email ${email} not found`,
      })
      return
    }

    const userId = usersResult.data[0].id

    // Mark user as admin
    await userModule.updateUsers({
      id: userId,
      metadata: {
        is_admin: true,
      },
    })

    console.log(`✅ User ${email} marked as admin`)

    res.json({
      success: true,
      message: `User ${email} marked as admin successfully!`,
      email: email,
      id: userId,
      instructions: [
        "1. Go to: /app",
        `2. Email: ${email}`,
        "3. Use the password you registered with",
        "4. You can now log in as admin!",
      ],
    })
  } catch (error: any) {
    console.error("Error marking user as admin:", error)
    res.status(500).json({
      message: error.message || "Failed to mark user as admin",
      error: error.toString(),
    })
  }
}

