import { redirect } from "next/navigation";

// TODO:
// See if we can do this with a redirect in middleware

// GET /api/oauth/authorize -> Redirect to /oauth/authorize
export async function GET(req: Request) {
  const redirectUrl = new URL(req.url);
  redirectUrl.pathname = "/oauth/authorize";

  redirect(redirectUrl.href);
}
