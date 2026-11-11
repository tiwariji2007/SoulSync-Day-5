
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { moods } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Validate mood updates
const moodSchema = z.object({
  mood: z.string().trim().min(1).max(30),
  note: z.string().max(1000).nullable().optional(),
});

// PATCH: Update a mood
export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/moods/[id]">
) {
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

    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return Response.json(
        { error: "Invalid mood ID" },
        { status: 400 }
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

    const [updatedMood] = await db
      .update(moods)
      .set({
        mood: parsed.data.mood,
        note: parsed.data.note ?? null,
      })
      .where(
        and(
          eq(moods.id, id),
          eq(moods.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedMood) {
      return Response.json(
        { error: "Mood not found" },
        { status: 404 }
      );
    }

    return Response.json(updatedMood);
  } catch (error) {
    console.error("Mood PATCH error:", error);

    return Response.json(
      { error: "Unable to update mood" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a mood
export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/moods/[id]">
) {
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

    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return Response.json(
        { error: "Invalid mood ID" },
        { status: 400 }
      );
    }

    const [deletedMood] = await db
      .delete(moods)
      .where(
        and(
          eq(moods.id, id),
          eq(moods.userId, session.user.id)
        )
      )
      .returning({ id: moods.id });

    if (!deletedMood) {
      return Response.json(
        { error: "Mood not found" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Mood DELETE error:", error);

    return Response.json(
      { error: "Unable to delete mood" },
      { status: 500 }
    );
  }
}
