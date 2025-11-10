import { model } from "@medusajs/framework/utils"

const SubscriptionPlan = model.define("subscription_plan", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text(),
  class_level: model.text(), // e.g., "Class 4", "Class 5"
  monthly_price: model.number(),
  yearly_price: model.number(),
  currency_code: model.text(),
  features: model.json(), // Array of feature strings
  is_active: model.boolean(),
})

export default SubscriptionPlan

