
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../db";
import * as authSchema from "../db/auth-schema";
import { sendWelcomeEmail } from "./welcome-email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendWelcomeEmail(user.email);
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }
        },
      },
    },
  },
});
