import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

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
    let users: any[]
    try {
      const registerResponse = await fetch(`${process.env.MEDUSA_ADMIN_BACKEND_URL || 'http://localhost:9000'}/auth/user/emailpass/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })
      
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}))
        throw new Error(`Register failed: ${JSON.stringify(errorData)}`)
      }
      
      const registerData = await registerResponse.json()
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

