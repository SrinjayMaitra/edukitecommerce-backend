import { Migration } from '@mikro-orm/migrations';

export class Migration20251106090225 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_subscription" alter column "cancelled_at" type timestamptz using ("cancelled_at"::timestamptz);`);
    this.addSql(`alter table if exists "customer_subscription" alter column "cancelled_at" drop not null;`);
    this.addSql(`alter table if exists "customer_subscription" alter column "stripe_subscription_id" type text using ("stripe_subscription_id"::text);`);
    this.addSql(`alter table if exists "customer_subscription" alter column "stripe_subscription_id" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "customer_subscription" alter column "cancelled_at" type timestamptz using ("cancelled_at"::timestamptz);`);
    this.addSql(`alter table if exists "customer_subscription" alter column "cancelled_at" set not null;`);
    this.addSql(`alter table if exists "customer_subscription" alter column "stripe_subscription_id" type text using ("stripe_subscription_id"::text);`);
    this.addSql(`alter table if exists "customer_subscription" alter column "stripe_subscription_id" set not null;`);
  }

}
