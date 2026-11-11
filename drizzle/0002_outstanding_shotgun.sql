CREATE TABLE "payment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" varchar(20) DEFAULT 'created' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "payment_orders_amount_positive" CHECK ("payment_orders"."amount" > 0),
	CONSTRAINT "payment_orders_currency_inr" CHECK ("payment_orders"."currency" = 'INR'),
	CONSTRAINT "payment_orders_status_valid" CHECK ("payment_orders"."status" IN ('created', 'paid', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "pro_entitlements" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan" varchar(20) DEFAULT 'pro' NOT NULL,
	"payment_order_id" uuid NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pro_entitlements_plan_valid" CHECK ("pro_entitlements"."plan" = 'pro')
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_entitlements" ADD CONSTRAINT "pro_entitlements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_entitlements" ADD CONSTRAINT "pro_entitlements_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_orders_razorpay_order_uidx" ON "payment_orders" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_orders_razorpay_payment_uidx" ON "payment_orders" USING btree ("razorpay_payment_id");