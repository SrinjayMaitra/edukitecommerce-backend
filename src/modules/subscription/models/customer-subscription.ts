import { model } from "@medusajs/framework/utils"

const CustomerSubscription = model.define("customer_subscription", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  subscription_plan_id: model.text(),
  status: model.text(), // active, paused, cancelled, expired
  billing_period: model.text(), // monthly, yearly
  current_period_start: model.dateTime(),
  current_period_end: model.dateTime(),
  cancel_at_period_end: model.boolean(),
  cancelled_at: model.dateTime().nullable(),
  stripe_subscription_id: model.text().nullable(), // If using Stripe
})

export default CustomerSubscription

