import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Endpoint to set auth cookie from token
 * This is a workaround for Medusa v2 not setting cookies automatically
 * 
 * Usage:
 * POST /custom/set-auth-cookie
 * Body: { "token": "jwt-token-here" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { token } = req.body as { token?: string }

    if (!token) {
      res.status(400).json({
        message: "Token is required",
      })
      return
    }

    // Set the cookie manually
    res.cookie("_medusa_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    res.json({
      success: true,
      message: "Auth cookie set successfully",
      cookieSet: true,
    })
  } catch (error: any) {
    console.error("Error setting auth cookie:", error)
    res.status(500).json({
      message: error.message || "Failed to set auth cookie",
      error: error.toString(),
    })
  }
}

