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

    // Call Medusa's auth module directly
    const authModule = req.scope.resolve(Modules.AUTH)
    
    // Authenticate using Medusa's auth module
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

    // Generate token (Medusa should do this, but let's get it from the result)
    // Actually, we need to call the auth endpoint to get the token
    // Let's use the internal HTTP call approach but set cookie
    
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')
    const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost:9000'
    const baseUrl = `${protocol}://${host}`

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
  } catch (error: any) {
    console.error("Error in custom auth endpoint:", error)
    res.status(401).json({
      message: error.message || "Authentication failed",
      error: error.toString(),
    })
  }
}

