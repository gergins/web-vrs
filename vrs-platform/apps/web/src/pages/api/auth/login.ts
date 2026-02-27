import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const idp = process.env.OIDC_AUTH_URL || `${redirectUri}/?mock_auth=1`;

  if (idp.includes("mock_auth=1")) {
    return res.redirect(`${redirectUri}/?mock_auth=1`);
  }

  const target = `${idp}?client_id=${encodeURIComponent(process.env.OIDC_CLIENT_ID || "vrs-web")}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`;
  return res.redirect(target);
}
