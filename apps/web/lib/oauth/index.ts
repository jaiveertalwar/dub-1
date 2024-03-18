"use server";

import { getSession, hashToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { authorizedRequestSchema } from "@/lib/zod/schemas/oauth";
import { nanoid } from "@dub/utils";
import { redirect } from "next/navigation";
import { DubApiError } from "../api/errors";

const codeExpiresIn = 1000 * 60 * 10; // 5 minutes

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

export const authorizeRequest = async (prevState: any, formData: FormData) => {
  const session = await getSession();

  if (!session) {
    throw new DubApiError({
      code: "unauthorized",
      message: "You must be logged in to authorize this request.",
    });
  }

  // TODO:
  // Display the error message in the UI

  const rawFormData = Object.fromEntries(formData);
  const {
    workspaceId,
    client_id: clientId,
    redirect_uri,
    state,
  } = authorizedRequestSchema.parse(rawFormData);

  await prisma.project.findUniqueOrThrow({
    where: {
      id: workspaceId,
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  // TODO:
  // Check redirect_uri is allowed for this client_id

  // Create oauth code
  const code = nanoid(32);

  await prisma.oAuthCode.create({
    data: {
      code,
      clientId,
      userId: session.user.id,
      projectId: workspaceId,
      expiresAt: new Date(Date.now() + codeExpiresIn),
    },
  });

  const params = new URLSearchParams({
    code,
    ...(state && { state }),
  });

  redirect(`${redirect_uri}?${params.toString()}`);
};

export const requestDeclined = async (req: Request, res: Response) => {
  //
};
