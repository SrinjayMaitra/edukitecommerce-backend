import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SubscriptionModuleService from "../../../../modules/subscription/service"
import { SUBSCRIPTION_MODULE } from "../../../../modules/subscription"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { id } = req.params
  const customerId = (req as any).auth_context?.actor_id || (req as any).auth?.actor_id

  if (!customerId) {
    res.status(401).json({
      message: "Unauthorized",
    })
    return
  }

  const subscription = await subscriptionService.getSubscription(id)

  if (!subscription) {
    res.status(404).json({
      message: `Customer subscription with id ${id} not found`,
    })
    return
  }

  // Verify the subscription belongs to the customer
  if (subscription.customer_id !== customerId) {
    res.status(403).json({
      message: "Forbidden",
    })
    return
  }

  res.json({
    customer_subscription: subscription,
  })
}

