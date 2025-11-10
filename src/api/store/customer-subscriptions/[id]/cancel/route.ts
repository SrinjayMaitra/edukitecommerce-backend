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
  const customerId = (req as any).auth_context?.actor_id || (req as any).auth?.actor_id
  const { cancel_at_period_end = true } = req.body as { cancel_at_period_end?: boolean }

  if (!customerId) {
    res.status(401).json({
      message: "Unauthorized",
    })
    return
  }

  // Verify the subscription belongs to the customer
  const subscription = await subscriptionService.getSubscription(id)

  if (!subscription) {
    res.status(404).json({
      message: `Customer subscription with id ${id} not found`,
    })
    return
  }

  if (subscription.customer_id !== customerId) {
    res.status(403).json({
      message: "Forbidden",
    })
    return
  }

  const updatedSubscription = await subscriptionService.cancelSubscription(
    id,
    cancel_at_period_end
  )

  res.json({
    customer_subscription: updatedSubscription,
  })
}

