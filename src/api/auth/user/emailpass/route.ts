import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Override Medusa's /auth/user/emailpass endpoint to set cookie
 * This ensures cookies are set after successful authentication
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

    // Use Medusa's internal auth flow
    // We need to authenticate and generate a token
    // Since we can't easily call Medusa's internal auth endpoint,
    // let's use a workaround: forward to Medusa but intercept response
    
    // Actually, let's just forward the request to Medusa's endpoint
    // but we'll set the cookie in the response
    // Since we're overriding the route, we need to manually handle auth
    
    // For now, let's use the internal HTTP approach but call a different internal endpoint
    // Or better: use Medusa's auth module to authenticate, then generate token ourselves
    
    const authModule = req.scope.resolve(Modules.AUTH)
    
    try {
      // Authenticate the user
      const authResult = await (authModule.authenticate as any)(
        "emailpass",
        {
          email,
          password,
        },
        {
          ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        }
      )

      if (!authResult || !authResult.authIdentity) {
        res.status(401).json({
          message: "Invalid email or password",
        })
        return
      }

      // Generate JWT token (we need to use Medusa's JWT secret)
      const jwt = require('jsonwebtoken')
      const jwtSecret = process.env.JWT_SECRET || "supersecret"
      
      const token = jwt.sign(
        {
          actor_id: authResult.authIdentity.entity_id,
          actor_type: "user",
          auth_identity_id: authResult.authIdentity.id,
          app_metadata: {},
          user_metadata: {},
        },
        jwtSecret,
        {
          expiresIn: "7d",
        }
      )

      if (!token) {
        res.status(401).json({
          message: "Authentication failed - no token received",
        })
        return
      }

      // Set the cookie
      res.cookie("_medusa_jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      // Return the same response as Medusa's endpoint
      res.json({
        token: token,
      })
    } catch (authError: any) {
      console.error("Error in custom auth endpoint:", authError)
      res.status(401).json({
        message: authError.message || "Authentication failed",
        error: authError.toString(),
      })
    }
  } catch (error: any) {
    console.error("Error in custom auth endpoint:", error)
    res.status(500).json({
      message: error.message || "Failed to process authentication",
      error: error.toString(),
    })
  }
}

