import { NextResponse } from "next/server";
// import { client } from "@/lib/auth/atproto";

export async function GET() {
  const clientMetadata = {};

  return NextResponse.json(clientMetadata, {
    headers: { "Content-Type": "application/json" },
  });
}
