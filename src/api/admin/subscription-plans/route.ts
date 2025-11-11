import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SubscriptionModuleService from "../../../modules/subscription/service"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { class_level, is_active } = req.query

  const filters: any = {}
  if (class_level) {
    filters.class_level = class_level as string
  }
  if (is_active !== undefined) {
    filters.is_active = is_active === "true"
  }

  const plans = await subscriptionService.listPlans(filters)

  res.json({
    subscription_plans: plans,
  })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const subscriptionService: SubscriptionModuleService = req.scope.resolve(
      SUBSCRIPTION_MODULE
    )

    const body = req.body as any

    // Validate required fields
    if (!body.name) {
      res.status(400).json({
        message: "Plan name is required",
      })
      return
    }

    if (!body.monthly_price || isNaN(parseFloat(body.monthly_price))) {
      res.status(400).json({
        message: "Valid monthly price is required",
      })
      return
    }

    const plan = await subscriptionService.createPlan(body)

    res.json({
      subscription_plan: plan,
    })
  } catch (error: any) {
    console.error("Error creating subscription plan:", error)
    res.status(500).json({
      message: error.message || "Failed to create subscription plan",
      error: error.toString(),
    })
  }
}

