
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { journals } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const journalSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
});

// UPDATE an existing journal
export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/journals/[id]">
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
        { error: "Invalid journal ID" },
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

    const validated = journalSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid journal data" },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(journals)
      .set({
        title: validated.data.title,
        content: validated.data.content,
      })
      .where(
        and(
          eq(journals.id, id),
          eq(journals.userId, session.user.id)
        )
      )
      .returning();

    if (!updated) {
      return Response.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Journal PATCH error:", error);

    return Response.json(
      { error: "Unable to update journal" },
      { status: 500 }
    );
  }
}

// DELETE an existing journal
export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/journals/[id]">
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
        { error: "Invalid journal ID" },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(journals)
      .where(
        and(
          eq(journals.id, id),
          eq(journals.userId, session.user.id)
        )
      )
      .returning({ id: journals.id });

    if (!deleted) {
      return Response.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Journal DELETE error:", error);

    return Response.json(
      { error: "Unable to delete journal" },
      { status: 500 }
    );
  }
}
