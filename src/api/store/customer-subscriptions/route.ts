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

  // Get customer from auth context
  // In MedusaJS v2, the customer ID is available in auth_context.actor_id
  const customerId = (req as any).auth_context?.actor_id || 
                     (req as any).auth?.actor_id ||
                     (req as any).auth_context?.actor?.id

  if (!customerId) {
    res.status(401).json({
      message: "Unauthorized - Please sign in to access your subscriptions",
    })
    return
  }

  const subscriptions = await subscriptionService.getSubscriptionsByCustomerId(
    customerId
  )

  res.json({
    customer_subscriptions: subscriptions,
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

    // Get customer from auth context
    const customerId = (req as any).auth_context?.actor_id || 
                       (req as any).auth?.actor_id ||
                       (req as any).auth_context?.actor?.id

    if (!customerId) {
      res.status(401).json({
        message: "Unauthorized - Please sign in to create a subscription",
      })
      return
    }

    const body = req.body as any

    console.log("Received subscription creation request:", {
      customerId,
      body,
    })

    // Convert ISO date strings to Date objects if needed
    const subscriptionData: any = {
      customer_id: customerId,
      subscription_plan_id: body.subscription_plan_id,
      status: body.status || "active",
      billing_period: body.billing_period,
      current_period_start: body.current_period_start ? new Date(body.current_period_start) : new Date(),
      current_period_end: body.current_period_end ? new Date(body.current_period_end) : new Date(),
      cancel_at_period_end: body.cancel_at_period_end !== undefined ? body.cancel_at_period_end : false,
      cancelled_at: body.cancelled_at ? new Date(body.cancelled_at) : null,
    }
    
    // Only include stripe_subscription_id if provided
    if (body.stripe_subscription_id) {
      subscriptionData.stripe_subscription_id = body.stripe_subscription_id
    }

    console.log("Prepared subscription data:", subscriptionData)

    // Validate required fields
    if (!subscriptionData.subscription_plan_id) {
      res.status(400).json({
        message: "subscription_plan_id is required",
      })
      return
    }

    if (!subscriptionData.billing_period) {
      res.status(400).json({
        message: "billing_period is required",
      })
      return
    }

    console.log("Calling createSubscription...")
    const subscription = await subscriptionService.createSubscription(subscriptionData)
    console.log("Subscription created successfully:", subscription)

    res.json({
      customer_subscription: subscription,
    })
  } catch (error: any) {
    console.error("Error creating customer subscription:", error)
    console.error("Error stack:", error?.stack)
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      cause: error?.cause,
    })
    
    const errorMessage = error?.message || error?.toString() || "Failed to create subscription"
    res.status(500).json({
      message: errorMessage,
      error: error?.toString(),
      details: process.env.NODE_ENV === "development" ? {
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
      } : undefined,
    })
  }
}

