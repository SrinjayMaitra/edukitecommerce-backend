import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SubscriptionModuleService from "../../../../../modules/subscription/service"
import { SUBSCRIPTION_MODULE } from "../../../../../modules/subscription"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { id } = req.params
  const { cancel_at_period_end = true } = req.body as { cancel_at_period_end?: boolean }

  const subscription = await subscriptionService.cancelSubscription(
    id,
    cancel_at_period_end
  )

  res.json({
    customer_subscription: subscription,
  })
}

