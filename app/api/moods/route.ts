
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { moods } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// Validation for creating a mood
const moodSchema = z.object({
  mood: z.string().trim().min(1).max(30),
  note: z.string().max(1000).nullable().optional(),
});

// GET: Retrieve moods belonging to the logged-in user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const myMoods = await db
      .select()
      .from(moods)
      .where(eq(moods.userId, session.user.id))
      .orderBy(desc(moods.createdAt));

    return Response.json(myMoods, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Mood GET error:", error);

    return Response.json(
      { error: "Unable to fetch moods" },
      { status: 500 }
    );
  }
}

// POST: Create a mood for the logged-in user
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

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

    const parsed = moodSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid mood data" },
        { status: 422 }
      );
    }

    const [createdMood] = await db
      .insert(moods)
      .values({
        userId: session.user.id,
        mood: parsed.data.mood,
        note: parsed.data.note ?? null,
      })
      .returning();

    return Response.json(createdMood, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Mood POST error:", error);

    return Response.json(
      { error: "Unable to save mood" },
      { status: 500 }
    );
  }
}
