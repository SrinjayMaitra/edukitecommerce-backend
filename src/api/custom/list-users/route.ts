import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Endpoint to list all users (for debugging)
 * Public route - no authentication required
 * 
 * Usage:
 * GET /custom/list-users
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const usersResult = await query.graph({
      entity: "user",
      fields: ["id", "email", "metadata"],
    })

    const users = usersResult?.data || []

    res.json({
      success: true,
      count: users.length,
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        is_admin: u.metadata?.is_admin || false,
      })),
    })
  } catch (error: any) {
    console.error("Error listing users:", error)
    res.status(500).json({
      message: error.message || "Failed to list users",
      error: error.toString(),
    })
  }
}

