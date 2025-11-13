import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Custom login endpoint that sets cookie after authentication
 * This wraps Medusa's auth endpoint and sets the cookie manually
 * 
 * Usage:
 * POST /custom/login-with-cookie
 * Body: { "email": "admin@medusa.com", "password": "test123" }
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

    // Call Medusa's auth endpoint internally
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')
    const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost:9000'
    const baseUrl = `${protocol}://${host}`

    try {
      // Use Node's http/https to call the auth endpoint
      const http = require('http')
      const https = require('https')
      const url = require('url')

      const authUrl = `${baseUrl}/auth/user/emailpass`
      const parsedUrl = new url.URL(authUrl)
      const isHttps = parsedUrl.protocol === 'https:'
      const client = isHttps ? https : http

      const postData = JSON.stringify({ email, password })

      const authResponse = await new Promise<any>((resolve, reject) => {
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }

        const httpReq = client.request(options, (res: any) => {
          let data = ''
          res.on('data', (chunk: any) => { data += chunk })
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data))
              } catch (e) {
                reject(new Error(`Failed to parse response: ${data}`))
              }
            } else {
              reject(new Error(`Auth failed: ${res.statusCode} - ${data}`))
            }
          })
        })

        httpReq.on('error', (e: any) => {
          reject(new Error(`Request failed: ${e.message}`))
        })

        httpReq.write(postData)
        httpReq.end()
      })

      const token = authResponse.token

      if (!token) {
        res.status(401).json({
          message: "Authentication failed - no token received",
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
        message: "Login successful and cookie set",
        token: token.substring(0, 20) + '...',
        cookieSet: true,
      })
    } catch (authError: any) {
      console.error("Auth error:", authError)
      res.status(401).json({
        message: authError.message || "Authentication failed",
        error: authError.toString(),
      })
    }
  } catch (error: any) {
    console.error("Error in login-with-cookie:", error)
    res.status(500).json({
      message: error.message || "Failed to process login",
      error: error.toString(),
    })
  }
}

