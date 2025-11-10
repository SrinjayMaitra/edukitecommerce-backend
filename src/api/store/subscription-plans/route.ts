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

  const { class_level } = req.query

  const filters: any = {
    is_active: true, // Only show active plans to customers
  }
  
  if (class_level) {
    filters.class_level = class_level as string
  }

  const plans = await subscriptionService.listPlans(filters)

  res.json({
    subscription_plans: plans,
  })
}

