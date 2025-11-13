import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Test endpoint to verify cookie setting works
 * GET /custom/test-cookie
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Try to set a test cookie
    res.cookie("test_cookie", "test_value", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    res.json({
      success: true,
      message: "Test cookie should be set",
      instructions: [
        "1. Check DevTools → Application → Cookies",
        "2. Look for 'test_cookie'",
        "3. If it appears, cookies work!",
        "4. If not, there's a cookie blocking issue",
      ],
      headers: {
        "Set-Cookie": res.getHeader("Set-Cookie"),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to set test cookie",
      error: error.toString(),
    })
  }
}

