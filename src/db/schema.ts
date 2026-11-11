import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  check,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { user } from "./auth-schema";






// Journal entries table
export const journals = pgTable("journals", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  title: varchar("title", { length: 200 }).notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

// Mood entries table
export const moods = pgTable("moods", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  mood: varchar("mood", { length: 30 }).notNull(),

  note: text("note"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});



export const userRoles = pgTable("user_roles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  role: varchar("role", {
    length: 20,
    enum: ["user", "admin"],
  })
    .notNull()
    .default("user"),
});





/* --------------------------------
   1. Payment Orders
-------------------------------- */

export const paymentOrders = pgTable(
  "payment_orders",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id),

    razorpayOrderId: varchar("razorpay_order_id", {
      length: 100,
    }),

    razorpayPaymentId: varchar("razorpay_payment_id", {
      length: 100,
    }),

    amount: integer("amount")
      .notNull(),

    currency: varchar("currency", {
      length: 3,
    })
      .notNull()
      .default("INR"),

    status: varchar("status", {
      length: 20,
    })
      .notNull()
      .default("created"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("payment_orders_razorpay_order_uidx")
      .on(table.razorpayOrderId),

    uniqueIndex("payment_orders_razorpay_payment_uidx")
      .on(table.razorpayPaymentId),

    check(
      "payment_orders_amount_positive",
      sql`${table.amount} > 0`
    ),

    check(
      "payment_orders_currency_inr",
      sql`${table.currency} = 'INR'`
    ),

    check(
      "payment_orders_status_valid",
      sql`${table.status} IN ('created', 'paid', 'failed')`
    ),
  ]
);

/* --------------------------------
   2. Processed Webhook Events
-------------------------------- */

export const webhookEvents = pgTable(
  "webhook_events",
  {
    eventId: text("event_id")
      .primaryKey(),

    eventType: varchar("event_type", {
      length: 100,
    })
      .notNull(),

    processedAt: timestamp("processed_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  }
);

/* --------------------------------
   3. Pro Entitlements
-------------------------------- */

export const proEntitlements = pgTable(
  "pro_entitlements",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    plan: varchar("plan", {
      length: 20,
    })
      .notNull()
      .default("pro"),

    paymentOrderId: uuid("payment_order_id")
      .notNull()
      .references(() => paymentOrders.id),

    activatedAt: timestamp("activated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "pro_entitlements_plan_valid",
      sql`${table.plan} = 'pro'`
    ),
  ]
);
