
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("Backend URL:", API_URL);

export async function GET() {
  try {
    if (!API_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/moods`, {
      cache: "no-store",
    });

    const data: unknown = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to fetch moods" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!API_URL) {
      throw new Error("API URL is not configured");
    }

    const body: unknown = await request.json();

    const response = await fetch(`${API_URL}/moods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data: unknown = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to save mood" },
      { status: 502 }
    );
  }
}
