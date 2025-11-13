import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

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

    // If user exists, delete it and recreate (for testing)
    if (existingUsersResult && existingUsersResult.data && existingUsersResult.data.length > 0) {
      const existingUserId = existingUsersResult.data[0].id
      console.log("User exists, deleting and recreating...")
      
      // Delete existing auth identities
      const authModule = req.scope.resolve(Modules.AUTH)
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
      const userModule = req.scope.resolve(Modules.USER)
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
    const userModule = req.scope.resolve(Modules.USER)
    const authModule = req.scope.resolve(Modules.AUTH)
    
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

    // IMPORTANT: Store password in PLAIN TEXT
    // Medusa's emailpass provider will hash it automatically during authentication
    // If we hash it ourselves, Medusa will hash it again, causing a mismatch
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
      
      // Wait a bit for provider_identity to be created (it might be async)
      console.log(`⏳ Waiting 3 seconds for provider_identity to be created...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Check provider_identity directly (this is what stores the password)
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
          console.log(`✅ Found provider_identity:`, JSON.stringify(providerIdentities.data[0], null, 2))
          const providerMeta = (providerIdentities.data[0] as any).provider_metadata
          if (providerMeta) {
            console.log(`   ✅ Provider metadata exists!`)
            console.log(`   Password in metadata:`, providerMeta.password ? `"${providerMeta.password.substring(0, 3)}..."` : "MISSING")
            if (!providerMeta.password) {
              console.error(`   ❌ PASSWORD IS MISSING FROM PROVIDER_METADATA!`)
            }
          } else {
            console.error(`   ❌ Provider metadata is null/undefined!`)
          }
        } else {
          console.error(`❌ Provider identity not found! This is why login fails!`)
          console.error(`   Auth identity was created but provider_identity was not created.`)
          console.error(`   This means the password is not stored anywhere.`)
        }
      } catch (queryError: any) {
        console.error(`❌ Could not query provider_identity:`, queryError?.message)
        console.error(`   Stack:`, queryError?.stack)
      }
      
      // Also verify auth identity was created
      const allAuthIdentities = await authModule.listAuthIdentities({})
      const createdAuthIdentity = allAuthIdentities?.find(
        (auth: any) => auth.entity_id === users[0].id
      )
      
      if (createdAuthIdentity) {
        console.log(`✅ Verified auth identity exists:`, (createdAuthIdentity as any).id)
      } else {
        console.error(`❌ Auth identity not found after creation!`)
      }
    } catch (authError: any) {
      console.error(`❌ Error creating auth identity:`, authError)
      console.error(`   Message:`, authError?.message)
      console.error(`   Stack:`, authError?.stack)
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

