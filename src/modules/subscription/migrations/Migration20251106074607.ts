import { Migration } from '@mikro-orm/migrations';

export class Migration20251106074607 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "customer_subscription" ("id" text not null, "customer_id" text not null, "subscription_plan_id" text not null, "status" text not null, "billing_period" text not null, "current_period_start" timestamptz not null, "current_period_end" timestamptz not null, "cancel_at_period_end" boolean not null, "cancelled_at" timestamptz not null, "stripe_subscription_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_subscription_deleted_at" ON "customer_subscription" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "subscription_plan" ("id" text not null, "name" text not null, "description" text not null, "class_level" text not null, "monthly_price" integer not null, "yearly_price" integer not null, "currency_code" text not null, "features" jsonb not null, "is_active" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "subscription_plan_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_plan_deleted_at" ON "subscription_plan" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_subscription" cascade;`);

    this.addSql(`drop table if exists "subscription_plan" cascade;`);
  }

}
