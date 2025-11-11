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

  if (!plan) {
    res.status(404).json({
      message: `Subscription plan with id ${id} not found`,
    })
    return
  }

  res.json({
    subscription_plan: plan,
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

    const { id } = req.params
    const body = req.body as any

    // Validate required fields if provided
    if (body.monthly_price !== undefined && isNaN(parseFloat(body.monthly_price))) {
      res.status(400).json({
        message: "Valid monthly price is required",
      })
      return
    }

    const plan = await subscriptionService.updatePlan(id, body)

    res.json({
      subscription_plan: plan,
    })
  } catch (error: any) {
    console.error("Error updating subscription plan:", error)
    res.status(500).json({
      message: error.message || "Failed to update subscription plan",
      error: error.toString(),
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const subscriptionService: SubscriptionModuleService = req.scope.resolve(
    SUBSCRIPTION_MODULE
  )

  const { id } = req.params

  await subscriptionService.deletePlan(id)

  res.status(200).json({
    id,
    deleted: true,
  })
}

