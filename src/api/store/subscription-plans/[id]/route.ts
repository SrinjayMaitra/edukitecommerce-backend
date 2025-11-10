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

  const plan = await subscriptionService.getPlan(id)

  if (!plan || !plan.is_active) {
    res.status(404).json({
      message: `Subscription plan with id ${id} not found`,
    })
    return
  }

  res.json({
    subscription_plan: plan,
  })
}

