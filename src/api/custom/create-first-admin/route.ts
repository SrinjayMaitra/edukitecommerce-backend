import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"
import pg from "pg"

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

    // Create admin user using workflow
    const { result: users } = await createUsersWorkflow(req.scope).run({
      input: {
        users: [
          {
            email,
          },
        ],
      },
    })

    // Mark user as admin
    await userModule.updateUsers({
      id: users[0].id,
      metadata: {
        is_admin: true,
      },
    })

    // Delete existing auth identity if it exists
    try {
      const allAuthIdentities = await authModule.listAuthIdentities({})
      if (allAuthIdentities && allAuthIdentities.length > 0) {
        const userAuthIdentity = allAuthIdentities.find(
          (auth: any) => auth.entity_id === users[0].id
        )
        if (userAuthIdentity) {
          await authModule.deleteAuthIdentities([userAuthIdentity.id])
          console.log("Deleted existing auth identity")
        }
      }
    } catch (error) {
      console.warn("Could not delete auth identity:", error)
    }

    console.log(`🔐 Creating auth identity for user ${users[0].id} with password: ${password}`)
    
    let authIdentityResult
    try {
      authIdentityResult = await (authModule.createAuthIdentities as any)([
        {
          entity_id: users[0].id,
          provider: "emailpass",
          provider_metadata: {
            password: password, // Plain text - Medusa hashes it during auth
          },
          user_metadata: {
            is_admin: true,
          },
        },
      ])
      console.log(`✅ Auth identity created:`, JSON.stringify(authIdentityResult, null, 2))
      
      // Extract auth_identity ID from result
      const authIdentityId = Array.isArray(authIdentityResult) && authIdentityResult.length > 0 
        ? authIdentityResult[0].id 
        : (authIdentityResult as any)?.id
      
      if (!authIdentityId) {
        throw new Error("Could not get auth_identity ID from creation result")
      }
      
      console.log(`📋 Auth identity ID: ${authIdentityId}`)
      
      // Wait a bit for provider_identity to be created (it might be async)
      console.log(`⏳ Waiting 2 seconds for provider_identity to be created...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if provider_identity exists
      let providerIdentityExists = false
      try {
        const providerIdentities = await query.graph({
          entity: "provider_identity",
          fields: ["id", "provider", "provider_metadata", "entity_id", "auth_identity_id"],
          filters: {
            entity_id: users[0].id,
            provider: "emailpass",
          },
        })
        
        if (providerIdentities?.data && providerIdentities.data.length > 0) {
          providerIdentityExists = true
          console.log(`✅ Found provider_identity:`, JSON.stringify(providerIdentities.data[0], null, 2))
        }
      } catch (queryError: any) {
        console.error(`❌ Could not query provider_identity:`, queryError?.message)
      }
      
      // If provider_identity doesn't exist, create it manually
      if (!providerIdentityExists) {
        console.log(`🔧 Provider identity not found! Creating it manually...`)
        
        try {
          const databaseUrl = process.env.DATABASE_URL
          if (!databaseUrl) {
            throw new Error("DATABASE_URL environment variable is not set")
          }
          
          const client = new pg.Client({ connectionString: databaseUrl })
          await client.connect()
          
          const providerId = `providerid_${Math.random().toString(36).substring(2, 22)}`
          
          console.log(`📝 Storing password as PLAIN TEXT (Medusa hashes during login)`)
          
          const insertQuery = `
            INSERT INTO provider_identity (
              id,
              auth_identity_id,
              entity_id,
              provider,
              provider_metadata,
              user_metadata,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, $5::jsonb, $6::jsonb, NOW(), NOW()
            )
            ON CONFLICT (id) DO NOTHING
          `
          
          await client.query(insertQuery, [
            providerId,
            authIdentityId,
            users[0].id,
            "emailpass",
            JSON.stringify({ password: password }),
            JSON.stringify({ is_admin: true })
          ])
          
          await client.end()
          
          console.log(`✅ Manually created provider_identity: ${providerId}`)
        } catch (dbError: any) {
          console.error(`❌ Error manually creating provider_identity:`, dbError?.message)
        }
      } else {
        console.log(`✅ Provider identity already exists, no manual creation needed`)
      }
      
    } catch (authError: any) {
      console.error(`❌ Error creating auth identity:`, authError?.message)
      throw authError
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

