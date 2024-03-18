"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { authorizedRequestSchema } from "@/lib/zod/schemas/oauth";
import { nanoid } from "@dub/utils";
import { redirect } from "next/navigation";
import { DubApiError } from "../api/errors";

const codeExpiresIn = 1000 * 60 * 10; // 5 minutes

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
    redirect_uri: redirectUri,
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
      redirectUri,
      userId: session.user.id,
      projectId: workspaceId,
      expiresAt: new Date(Date.now() + codeExpiresIn),
    },
  });

  const params = new URLSearchParams({
    code,
    ...(state && { state }),
  });

  redirect(`${redirectUri}?${params.toString()}`);
};

export const requestDeclined = async (req: Request, res: Response) => {
  //
};
