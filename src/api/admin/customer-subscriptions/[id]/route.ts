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

  const subscription = await subscriptionService.getSubscription(id)

  if (!subscription) {
    res.status(404).json({
      message: `Customer subscription with id ${id} not found`,
    })
    return
  }

  res.json({
    customer_subscription: subscription,
  })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { id } = req.params

  const subscription = await subscriptionService.updateSubscription(id, req.body as any)

  res.json({
    customer_subscription: subscription,
  })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { id } = req.params

  await subscriptionService.deleteSubscription(id)

  res.status(200).json({
    id,
    deleted: true,
  })
}

