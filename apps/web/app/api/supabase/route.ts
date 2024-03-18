//117ae5f1-defb-47f0-a385-1f7d0857cee5
//sba_704dca750aeae54bcc02e8dc27c2d50854c61739

import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  // {
  //   "client_id": "117ae5f1-defb-47f0-a385-1f7d0857cee5",
  //   "client_secret": "sba_704dca750aeae54bcc02e8dc27c2d50854c61739",
  //   "grant_type": "refresh_token",
  //   "refresh_token": "lpLFaEbyvgIhCwOily"
  // }

  const clientId = "117ae5f1-defb-47f0-a385-1f7d0857cee5";
  const clientSecret = "sba_704dca750aeae54bcc02e8dc27c2d50854c61739";

  // Refresh access token
  const response = await fetch("https://api.supabase.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      client_id: "117ae5f1-defb-47f0-a385-1f7d0857cee5",
      client_secret: "sba_704dca750aeae54bcc02e8dc27c2d50854c61739",
      grant_type: "refresh_token",
      refresh_token: "yGIfrsMEIrWgYswFEA",
    }),
  });

  const data = await response.json();
  
  console.log(data);

  // {"access_token":"sbp_oauth_414660d576c6351eec2e13648cf6611011458fec","refresh_token":"lpLFaEbyvgIhCwOily","expires_in":86400,"token_type":"Bearer"}

  // {"access_token":"sbp_oauth_de8dd75efac9a21f0c4ebf2de7c3934408e9f0ff","refresh_token":"yGIfrsMEIrWgYswFEA","expires_in":86400,"token_type":"Bearer"}

  return NextResponse.json(data);
};

//https://app.planetscale.com/oauth/authorize?client_id=pscale_app_4f9211ee8f9e34b17501fe718118607c&redirect_uri=http://localhost:8888/api/supabase&response_type=code

// Access token expiry: 24 hours
// Refresh token expiry: 1 year
// Refresh can only used once or (This refresh token is long-lived and won't expire automatically) or Keep a long ex

// https://api.supabase.com/v1/oauth/authorize