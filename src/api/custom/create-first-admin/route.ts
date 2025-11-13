import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import https from "https"
import http from "http"

/**
 * One-time endpoint to create the first admin user
 * Public route - no authentication required
 * TODO: Delete this endpoint after creating first admin user for security
 * 
 * Usage:
 * POST /custom/create-first-admin
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

    // Check if any admin users already exist
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    // If user exists, delete it first
    const authModule = req.scope.resolve(Modules.AUTH)
    const userModule = req.scope.resolve(Modules.USER)
    
    if (existingUsersResult && existingUsersResult.data && existingUsersResult.data.length > 0) {
      const existingUserId = existingUsersResult.data[0].id
      console.log("User exists, deleting...")
      
      // Delete existing auth identities
      try {
        const allAuthIdentities = await authModule.listAuthIdentities({})
        const userAuthIdentity = allAuthIdentities?.find(
          (auth: any) => auth.entity_id === existingUserId
        )
        if (userAuthIdentity) {
          await authModule.deleteAuthIdentities([userAuthIdentity.id])
        }
      } catch (error) {
        console.warn("Could not delete auth identity:", error)
      }
      
      // Delete the user
      try {
        await userModule.deleteUsers([existingUserId])
      } catch (error) {
        console.warn("Could not delete user:", error)
      }
    }

    console.log(`🔐 Using Medusa's register endpoint to properly set up authentication...`)
    
    // Use Medusa's built-in register endpoint which properly creates BOTH user AND auth
    // Construct the URL from the request
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')
    const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost:9000'
    const baseUrl = `${protocol}://${host}`
    
    let users: any[]
    try {
      const registerUrl = `${baseUrl}/auth/user/emailpass/register`
      console.log(`📡 Calling register endpoint: ${registerUrl}`)
      
      // Use Node's http/https modules instead of fetch
      const registerData = await new Promise<any>((resolve, reject) => {
        const url = new URL(registerUrl)
        const isHttps = url.protocol === 'https:'
        const client = isHttps ? https : http
        
        const postData = JSON.stringify({ email, password })
        
        const options = {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }
        
        const httpReq = client.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data))
              } catch (e) {
                reject(new Error(`Failed to parse response: ${data}`))
              }
            } else {
              reject(new Error(`Register failed: ${res.statusCode} - ${data}`))
            }
          })
        })
        
        httpReq.on('error', (e) => {
          reject(new Error(`Request failed: ${e.message}`))
        })
        
        httpReq.write(postData)
        httpReq.end()
      })
      console.log(`✅ Registration successful! Token:`, registerData.token?.substring(0, 20) + '...')
      
      // Get the newly created user
      const allUsers = await query.graph({
        entity: "user",
        fields: ["id", "email"],
        filters: {
          email: email,
        },
      })
      
      if (!allUsers?.data || allUsers.data.length === 0) {
        throw new Error("User not found after registration")
      }
      
      users = allUsers.data
      console.log(`📋 User ID: ${users[0].id}`)
      
      // Mark user as admin
      await userModule.updateUsers({
        id: users[0].id,
        metadata: {
          is_admin: true,
        },
      })
      console.log(`✅ User marked as admin`)
      
      // Verify provider_identity was created by register endpoint
      const providerIdentities = await query.graph({
        entity: "provider_identity",
        fields: ["id", "provider", "entity_id", "auth_identity_id"],
        filters: {
          entity_id: users[0].id,
          provider: "emailpass",
        },
      })
      
      if (providerIdentities?.data && providerIdentities.data.length > 0) {
        console.log(`✅ Provider identity exists:`, providerIdentities.data[0].id)
      } else {
        console.error(`❌ Provider identity not found!`)
      }
      
    } catch (registerError: any) {
      console.error(`❌ Error during registration:`, registerError)
      console.error(`   Message:`, registerError?.message)
      console.error(`   Stack:`, registerError?.stack)
      throw registerError
    }

    console.log(`✅ Admin user created with password!`)

    const user = users[0]

    res.json({
      success: true,
      message: "Admin user created successfully with password!",
      email: user?.email,
      password: password,
      id: user?.id,
      instructions: [
        "1. Go to: /app",
        `2. Email: ${email}`,
        `3. Password: ${password}`,
        "4. You can now log in!",
      ],
    })
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    res.status(500).json({
      message: error.message || "Failed to create admin user",
      error: error.toString(),
    })
  }
}

