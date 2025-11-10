import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SubscriptionModuleService from "../../../modules/subscription/service"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const subscriptionService: SubscriptionModuleService = req.scope.resolve(
      SUBSCRIPTION_MODULE
    )

    const { customer_id, status, subscription_plan_id } = req.query

    const filters: any = {}
    if (customer_id) {
      filters.customer_id = customer_id as string
    }
    if (status) {
      filters.status = status as string
    }
    if (subscription_plan_id) {
      filters.subscription_plan_id = subscription_plan_id as string
    }

    const subscriptions = await subscriptionService.listSubscriptions(filters)

    res.json({
      customer_subscriptions: subscriptions,
    })
  } catch (error: any) {
    console.error("Error fetching customer subscriptions:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch customer subscriptions",
      error: error.toString(),
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const subscription = await subscriptionService.createSubscription(req.body as any)

  res.json({
    customer_subscription: subscription,
  })
}

