# Subscription Module

This module provides subscription plan management for the EduKit e-commerce platform. It allows you to create subscription plans for different class levels and manage customer subscriptions.

## Features

- **Subscription Plans**: Create and manage subscription plans for different class levels (Class 4, Class 5, etc.)
- **Customer Subscriptions**: Track customer subscriptions with status management (active, paused, cancelled, expired)
- **Billing Periods**: Support for monthly and yearly billing cycles
- **Admin API**: Full CRUD operations for managing subscription plans and customer subscriptions
- **Store API**: Customer-facing endpoints to view plans and manage their subscriptions

## Database Models

### SubscriptionPlan
- `id`: Unique identifier
- `name`: Plan name
- `description`: Plan description
- `class_level`: Class level (e.g., "Class 4", "Class 5")
- `monthly_price`: Monthly price
- `yearly_price`: Yearly price (optional)
- `currency_code`: Currency code (default: "USD")
- `features`: JSON array of feature strings
- `is_active`: Whether the plan is active
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### CustomerSubscription
- `id`: Unique identifier
- `customer_id`: Customer ID
- `subscription_plan_id`: Reference to subscription plan
- `status`: Subscription status (active, paused, cancelled, expired)
- `billing_period`: Billing period (monthly, yearly)
- `current_period_start`: Start of current billing period
- `current_period_end`: End of current billing period
- `cancel_at_period_end`: Whether to cancel at period end
- `cancelled_at`: Cancellation timestamp
- `stripe_subscription_id`: Stripe subscription ID (if using Stripe)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Setup

1. **Generate and run migrations**:
   ```bash
   cd medusa-starter-default
   npx medusa db:generate subscription
   npx medusa db:migrate
   ```

2. **The module is already registered** in `medusa-config.ts`

## API Endpoints

### Admin Endpoints

#### Subscription Plans
- `GET /admin/subscription-plans` - List all subscription plans (with optional filters: `class_level`, `is_active`)
- `POST /admin/subscription-plans` - Create a new subscription plan
- `GET /admin/subscription-plans/[id]` - Get a specific subscription plan
- `POST /admin/subscription-plans/[id]` - Update a subscription plan
- `DELETE /admin/subscription-plans/[id]` - Delete a subscription plan

#### Customer Subscriptions
- `GET /admin/customer-subscriptions` - List all customer subscriptions (with optional filters: `customer_id`, `status`, `subscription_plan_id`)
- `POST /admin/customer-subscriptions` - Create a new customer subscription
- `GET /admin/customer-subscriptions/[id]` - Get a specific customer subscription
- `POST /admin/customer-subscriptions/[id]` - Update a customer subscription
- `DELETE /admin/customer-subscriptions/[id]` - Delete a customer subscription
- `POST /admin/customer-subscriptions/[id]/cancel` - Cancel a subscription
- `POST /admin/customer-subscriptions/[id]/pause` - Pause a subscription
- `POST /admin/customer-subscriptions/[id]/resume` - Resume a paused subscription

### Store Endpoints

#### Subscription Plans
- `GET /store/subscription-plans` - List active subscription plans (with optional filter: `class_level`)
- `GET /store/subscription-plans/[id]` - Get a specific active subscription plan

#### Customer Subscriptions
- `GET /store/customer-subscriptions` - Get current customer's subscriptions (requires authentication)
- `POST /store/customer-subscriptions` - Create a new subscription (requires authentication)
- `GET /store/customer-subscriptions/[id]` - Get a specific subscription (requires authentication, must belong to customer)
- `POST /store/customer-subscriptions/[id]/cancel` - Cancel own subscription (requires authentication)
- `POST /store/customer-subscriptions/[id]/pause` - Pause own subscription (requires authentication)
- `POST /store/customer-subscriptions/[id]/resume` - Resume own subscription (requires authentication)

## Usage Examples

### Creating a Subscription Plan (Admin)

```bash
POST /admin/subscription-plans
{
  "name": "Class 4 Monthly Plan",
  "description": "Monthly subscription for Class 4 students",
  "class_level": "Class 4",
  "monthly_price": 29.99,
  "yearly_price": 299.99,
  "currency_code": "USD",
  "features": [
    "Access to all Class 4 kits",
    "Monthly progress reports",
    "Certificate of completion"
  ],
  "is_active": true
}
```

### Creating a Customer Subscription (Store)

```bash
POST /store/customer-subscriptions
{
  "subscription_plan_id": "plan_123",
  "billing_period": "monthly",
  "current_period_start": "2025-01-01T00:00:00Z",
  "current_period_end": "2025-02-01T00:00:00Z",
  "status": "active"
}
```

### Cancelling a Subscription (Store)

```bash
POST /store/customer-subscriptions/[id]/cancel
{
  "cancel_at_period_end": true
}
```

## Integration with Payment Providers

This module includes a `stripe_subscription_id` field in the `CustomerSubscription` model to support integration with Stripe or other payment providers. You can:

1. Create the subscription in your payment provider
2. Store the payment provider subscription ID in the `stripe_subscription_id` field
3. Use webhooks from your payment provider to update subscription statuses

## Next Steps

1. Set up webhook handlers to sync subscription statuses from your payment provider
2. Create scheduled jobs to handle subscription renewals and period transitions
3. Integrate with your frontend to display subscription plans and manage subscriptions

