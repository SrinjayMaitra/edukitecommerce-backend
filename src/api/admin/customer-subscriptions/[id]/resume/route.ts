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

  const subscription = await subscriptionService.resumeSubscription(id)

  res.json({
    customer_subscription: subscription,
  })
}

