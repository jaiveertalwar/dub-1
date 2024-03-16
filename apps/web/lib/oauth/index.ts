import { hashToken } from "@/lib/auth";
import { nanoid } from "@dub/utils";
import { DubApiError } from "../api/errors";

export const createClientId = () => {
  return `dub_app_${nanoid(24)}`;
};

export const createClientSecret = () => {
  const secret = `dub_app_secret_${nanoid(48)}`;

  return {
    secret,
    secretAlias: `${secret.slice(0, 18)}...${secret.slice(-4)}`,
    secretHashed: hashToken(secret, {
      noSecret: true,
    }),
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
