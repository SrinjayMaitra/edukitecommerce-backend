import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as bcrypt from "bcryptjs"

/**
 * Public endpoint to set/update password for an existing admin user.
 * This is a temporary endpoint for initial setup.
 * TODO: Delete this endpoint after setting the first admin user's password for security.
 *
 * Usage:
 * POST /custom/set-admin-password
 * Headers: x-setup-secret: <your-secret> (or ?secret=<your-secret>)
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

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = req.scope.resolve(Modules.AUTH)

    // Find the user by email
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    if (!existingUsersResult || !existingUsersResult.data || existingUsersResult.data.length === 0) {
      res.status(404).json({
        message: `User with email ${email} not found`,
      })
      return
    }

    const userId = existingUsersResult.data[0].id

    // Check if an auth identity already exists for this user
    // Try to list all auth identities and find the one for this user
    let existingAuthIdentityId: string | null = null
    try {
      // List all auth identities and filter manually
      const allAuthIdentities = await authModule.listAuthIdentities({})
      if (allAuthIdentities && allAuthIdentities.length > 0) {
        const userAuthIdentity = allAuthIdentities.find(
          (auth: any) => auth.entity_id === userId && auth.provider === "emailpass"
        )
        if (userAuthIdentity) {
          existingAuthIdentityId = userAuthIdentity.id
        }
      }
    } catch (listError) {
      console.warn("Could not list auth identities:", listError)
      // Continue anyway - we'll try to create a new one
    }

    // Delete existing auth identity if it exists (we'll recreate it with new password)
    if (existingAuthIdentityId) {
      try {
        await authModule.deleteAuthIdentities([existingAuthIdentityId])
      } catch (deleteError) {
        console.warn("Could not delete existing auth identity:", deleteError)
      }
    }

    // Create new auth identity with password
    // The emailpass provider should hash the password automatically when provided in provider_metadata
    try {
      // Delete any existing auth identity first
      if (existingAuthIdentityId) {
        try {
          await authModule.deleteAuthIdentities([existingAuthIdentityId])
          console.log("Deleted existing auth identity")
        } catch (deleteError) {
          console.warn("Could not delete existing auth identity:", deleteError)
        }
      }

      // Hash the password manually using bcrypt
      // Medusa's emailpass provider expects the password to be hashed
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      console.log("Password hashed successfully")
      
      // Create auth identity with hashed password
      const createResult = await (authModule.createAuthIdentities as any)([
        {
          entity_id: userId,
          provider: "emailpass",
          provider_metadata: {
            password: hashedPassword,
          },
          user_metadata: {
            is_admin: true,
          },
        },
      ])
      console.log("Auth identity created with password:", createResult)
      
      // Verify the result structure
      if (createResult) {
        const resultArray = Array.isArray(createResult) ? createResult : [createResult]
        if (resultArray.length > 0 && resultArray[0].id) {
          console.log("Auth identity ID:", resultArray[0].id)
        }
      }
    } catch (createError: any) {
      // If creation fails, log the full error for debugging
      console.error("Error creating auth identity - Full error:", JSON.stringify(createError, null, 2))
      console.error("Error creating auth identity - Message:", createError?.message)
      console.error("Error creating auth identity - Stack:", createError?.stack)
      throw new Error(`Failed to set password: ${createError?.message || createError}`)
    }

    // Verify the auth identity was created
    try {
      const verifyAuth = await authModule.listAuthIdentities({})
      const userAuth = verifyAuth?.find((auth: any) => auth.entity_id === userId && auth.provider === "emailpass")
      console.log("Verification - Auth identity exists:", !!userAuth)
    } catch (verifyError) {
      console.warn("Could not verify auth identity:", verifyError)
    }

    res.json({
      message: "Admin password set successfully! You can now log in.",
      email: email,
      id: userId,
      note: "If login still fails, check Railway logs for errors.",
    })
  } catch (error: any) {
    console.error("Error setting admin password:", error)
    res.status(500).json({
      message: error.message || "Failed to set admin password",
      error: error.toString(),
    })
  }
}

