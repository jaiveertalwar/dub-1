import { exchangeCodeForToken, refreshAccessToken } from "@/lib/oauth/request";
import z from "@/lib/zod";
import {
  codeExchangeSchema,
  tokenRefreshSchema,
} from "@/lib/zod/schemas/oauth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/oauth/token -> Exchange an authorization code for an access token
export async function POST(req: Request) {
  const formData = await req.formData();
  const rawFormData = Object.fromEntries(formData);

  const result = z
    .union([codeExchangeSchema, tokenRefreshSchema])
    .parse(rawFormData);

  const tokens =
    result.grant_type === "authorization_code"
      ? await exchangeCodeForToken(result)
      : await refreshAccessToken(result);

  return NextResponse.json(tokens);
}
