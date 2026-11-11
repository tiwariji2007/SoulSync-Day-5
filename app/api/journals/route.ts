import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { journals } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

// Validation rules for creating journals
const journalSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
});

// GET: Retrieve only the logged-in user's journals
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const myJournals = await db
      .select()
      .from(journals)
      .where(eq(journals.userId, session.user.id))
      .orderBy(desc(journals.createdAt));

    return Response.json(myJournals, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Journal GET error:", error);

    return Response.json(
      { error: "Unable to fetch journals" },
      { status: 500 }
    );
  }
}

// POST: Create a journal for the logged-in user
export async function POST(request: Request) {
  let session;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.error("Journal authentication error:", error);

    return Response.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }

  if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const validated = journalSchema.safeParse(body);

  if (!validated.success) {
    return Response.json(
      { error: "Title and content are required" },
      { status: 422 }
    );
  }

  try {
    const [createdJournal] = await db
      .insert(journals)
      .values({
        userId: session.user.id,
        title: validated.data.title,
        content: validated.data.content,
      })
      .returning();

    return Response.json(createdJournal, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Journal POST error:", error);

    return Response.json(
      { error: "Unable to save journal" },
      { status: 500 }
    );
  }
}