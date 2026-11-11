
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      success: true,
      message: "PostgreSQL database connected successfully",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
