import { MedusaService } from "@medusajs/framework/utils"
import SubscriptionPlan from "./models/subscription-plan"
import CustomerSubscription from "./models/customer-subscription"

class SubscriptionModuleService extends MedusaService({
  SubscriptionPlan,
  CustomerSubscription,
}) {
  // Use the auto-generated methods from MedusaService
  // They are available as: listSubscriptionPlans, getSubscriptionPlans, createSubscriptionPlans, etc.
  // We'll add custom methods for convenience
  
  async listPlans(filters?: {
    class_level?: string
    is_active?: boolean
  }) {
    // Use the auto-generated listSubscriptionPlans method
    const plans = await this.listSubscriptionPlans()
    
    // Apply filters
    let filtered = plans
    
    if (filters?.class_level) {
      filtered = filtered.filter((plan: any) => plan.class_level === filters.class_level)
    }
    
    if (filters?.is_active !== undefined) {
      filtered = filtered.filter((plan: any) => plan.is_active === filters.is_active)
    }
    
    return filtered
  }

  async getPlan(id: string) {
    const plans = await this.listSubscriptionPlans()
    return plans.find((plan: any) => plan.id === id) || null
  }

  async createPlan(data: {
    name: string
    description?: string
    class_level?: string
    monthly_price: number
    yearly_price?: number
    currency_code?: string
    features?: string[]
    is_active?: boolean
  }) {
    const plans = await this.createSubscriptionPlans(data as any)
    return Array.isArray(plans) ? plans[0] : plans
  }

  async updatePlan(id: string, data: Partial<{
    name: string
    description: string
    class_level: string
    monthly_price: number
    yearly_price: number
    currency_code: string
    features: string[]
    is_active: boolean
  }>) {
    const plans = await this.updateSubscriptionPlans({ id }, data)
    return Array.isArray(plans) ? plans[0] : plans
  }

  async deletePlan(id: string) {
    await this.deleteSubscriptionPlans({ id })
  }

  // Customer Subscription Methods
  async listSubscriptions(filters?: {
    customer_id?: string
    status?: string
    subscription_plan_id?: string
  }) {
    const subscriptions = await this.listCustomerSubscriptions()
    
    // Apply filters
    let filtered = subscriptions
    
    if (filters?.customer_id) {
      filtered = filtered.filter((sub: any) => sub.customer_id === filters.customer_id)
    }
    
    if (filters?.status) {
      filtered = filtered.filter((sub: any) => sub.status === filters.status)
    }
    
    if (filters?.subscription_plan_id) {
      filtered = filtered.filter((sub: any) => sub.subscription_plan_id === filters.subscription_plan_id)
    }
    
    return filtered
  }

  async getSubscription(id: string) {
    const subscriptions = await this.listCustomerSubscriptions()
    return subscriptions.find((sub: any) => sub.id === id) || null
  }

  async getSubscriptionsByCustomerId(customer_id: string) {
    return await this.listSubscriptions({ customer_id })
  }

  async createSubscription(data: {
    customer_id: string
    subscription_plan_id: string
    status?: string
    billing_period: string
    current_period_start: Date
    current_period_end: Date
    cancel_at_period_end?: boolean
    stripe_subscription_id?: string
  }) {
    try {
      console.log("Service: Creating subscription with data:", data)
      const subscriptions = await this.createCustomerSubscriptions(data as any)
      console.log("Service: Subscription created, result:", subscriptions)
      return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions
    } catch (error: any) {
      console.error("Service: Error in createSubscription:", error)
      console.error("Service: Error details:", {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      })
      throw error
    }
  }

  async updateSubscription(id: string, data: Partial<{
    status: string
    current_period_start: Date
    current_period_end: Date
    cancel_at_period_end: boolean
    cancelled_at: Date
    stripe_subscription_id: string
  }>) {
    const subscriptions = await this.updateCustomerSubscriptions({ id }, data)
    return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions
  }

  async cancelSubscription(id: string, cancel_at_period_end: boolean = true) {
    const updateData: any = {
      cancel_at_period_end: cancel_at_period_end,
    }

    if (!cancel_at_period_end) {
      updateData.status = "cancelled"
      updateData.cancelled_at = new Date()
    }

    const subscriptions = await this.updateCustomerSubscriptions({ id }, updateData)
    return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions
  }

  async pauseSubscription(id: string) {
    const subscriptions = await this.updateCustomerSubscriptions(
      { id },
      { status: "paused" }
    )
    return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions
  }

  async resumeSubscription(id: string) {
    const subscriptions = await this.updateCustomerSubscriptions(
      { id },
      { status: "active" }
    )
    return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions
  }

  async deleteSubscription(id: string) {
    await this.deleteCustomerSubscriptions({ id })
  }
}

export default SubscriptionModuleService
