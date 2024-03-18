import { hashToken } from "@/lib/auth";
import { nanoid } from "@dub/utils";
import { DubApiError } from "../api/errors";

const tokensLength = {
  clientId: 24,
  clientSecret: 48,
  accessToken: 64,
  refreshToken: 64,
};

export const tokensExpiry = {
  accessToken: 1000 * 60 * 60 * 24, // 24 hours
  refreshToken: 1000 * 60 * 60 * 24 * 30 * 6, // 6 months
};

export const createClientId = () => {
  return `dub_app_${nanoid(tokensLength.clientId)}`;
};

export const createClientSecret = () => {
  const secret = `dub_app_secret_${nanoid(tokensLength.clientSecret)}`;

  return {
    secret,
    secretAlias: `${secret.slice(0, 18)}...${secret.slice(-4)}`,
    secretHashed: hashToken(secret, {
      noSecret: true,
    }),
  };
};

export const createTokens = () => {
  return {
    accessToken: `dub_tkn_${nanoid(tokensLength.accessToken)}`,
    refreshToken: `dub_refresh_${nanoid(tokensLength.refreshToken)}`,
  };
};

// TODO:
// Move this to a common place
export const parseJSONBody = async (req: Request) => {
  try {
    return await req.json();
  } catch (e) {
    throw new DubApiError({
      code: "bad_request",
      message: "Invalid body – body must be a valid JSON.",
    });
  }
};
