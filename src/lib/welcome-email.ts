
import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Welcome to SoulSync!",
    text: `Welcome to SoulSync!

We're happy to have you here.

Start your journey by tracking your mood, writing in your journal, and exploring SoulSync.

Thank you for joining us!

The SoulSync Team`,
  });

  if (error) {
    console.error("Welcome email failed:", error);
    throw new Error(error.message);
  }

  console.log("RESEND RESPONSE:", JSON.stringify({ data, error }, null, 2));

  return data;
}
