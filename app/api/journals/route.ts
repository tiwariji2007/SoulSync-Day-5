
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function forwardRequest(
  method: "GET" | "POST",
  body?: unknown
) {
  if (!API_URL) {
    return NextResponse.json(
      { detail: "Backend URL is missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/journals`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { detail: "Backend returned an invalid response" },
        { status: 502 }
      );
    }

    const data: unknown = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: unknown) {
    console.error("Journal API request failed:", error);

    return NextResponse.json(
      { detail: "Cannot connect to backend" },
      { status: 502 }
    );
  }
}

export async function GET() {
  return forwardRequest("GET");
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    return forwardRequest("POST", body);
  } catch {
    return NextResponse.json(
      { detail: "Invalid JSON request body" },
      { status: 400 }
    );
  }
}
