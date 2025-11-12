import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"
import * as bcrypt from "bcryptjs"

/**
 * FORCE CREATE ADMIN - Call this endpoint to create admin user
 * This is a public endpoint that will create the admin user with password
 * 
 * Usage:
 * POST /custom/force-create-admin
 * Body: { "email": "admin@medusa.com", "password": "password1234" }
 * 
 * OR just visit: https://your-url.up.railway.app/custom/force-create-admin
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@medusa.com"
    const password = process.env.ADMIN_PASSWORD || "password1234"

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = req.scope.resolve(Modules.AUTH)
    const userModule = req.scope.resolve(Modules.USER)

    // Check if user exists
    const existingUsersResult = await query.graph({
      entity: "user",
      fields: ["id", "email"],
      filters: {
        email: email,
      },
    })

    let userId: string

    if (existingUsersResult && existingUsersResult.data && existingUsersResult.data.length > 0) {
      userId = existingUsersResult.data[0].id
      console.log(`User exists: ${email}, ID: ${userId}`)
    } else {
      // Create user
      console.log(`Creating user: ${email}`)
      const { result: users } = await createUsersWorkflow(req.scope).run({
        input: {
          users: [{ email }],
        },
      })
      userId = users[0].id
      console.log(`User created: ${email}, ID: ${userId}`)
    }

    // Mark as admin
    try {
      await userModule.updateUsers({
        id: userId,
        metadata: {
          is_admin: true,
        },
      })
      console.log(`User marked as admin`)
    } catch (error: any) {
      console.warn(`Could not update metadata: ${error?.message}`)
    }

    // Delete existing auth identities
    try {
      const allAuthIdentities = await authModule.listAuthIdentities({})
      if (allAuthIdentities && allAuthIdentities.length > 0) {
        const userAuthIdentity = allAuthIdentities.find(
          (auth: any) => auth.entity_id === userId
        )
        if (userAuthIdentity) {
          await authModule.deleteAuthIdentities([userAuthIdentity.id])
          console.log(`Deleted existing auth identity`)
        }
      }
    } catch (error: any) {
      console.warn(`Could not delete auth identity: ${error?.message}`)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(`Password hashed`)

    // Create auth identity with password
    await (authModule.createAuthIdentities as any)([
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

    console.log(`✅ Admin user created successfully!`)

    res.json({
      success: true,
      message: "Admin user created successfully!",
      email: email,
      password: password,
      userId: userId,
      instructions: [
        "1. Go to: /app",
        `2. Email: ${email}`,
        `3. Password: ${password}`,
        "4. You should now be able to log in!",
      ],
    })
  } catch (error: any) {
    console.error("Error creating admin:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create admin user",
      error: error.toString(),
      stack: error.stack,
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Same as GET
  return GET(req, res)
}

