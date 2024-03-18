import { exchangeCodeForToken } from "@/lib/oauth/request";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/oauth/token -> Exchange an authorization code for an access token
export async function POST(req: Request) {
  const formData = await req.formData();
  const tokens = await exchangeCodeForToken(formData);

  return NextResponse.json(tokens);
}
