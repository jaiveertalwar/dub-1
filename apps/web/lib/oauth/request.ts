"use server";

import { getSession, hashToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  authorizedRequestSchema,
  tokenExchangeSchema,
} from "@/lib/zod/schemas/oauth";
import { nanoid } from "@dub/utils";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { DubApiError } from "../api/errors";
import { createTokens, tokensExpiry } from "./credential";

const codeExpiresIn = 1000 * 60 * 10; // 5 minutes

// Handle the OAuth authorization request 
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

  const app = await prisma.oAuthApp.findUniqueOrThrow({
    where: {
      clientId,
    },
  });

  const redirectUris = (app.redirectUris || []) as Prisma.JsonArray;

  if (!redirectUris.includes(redirectUri)) {
    throw new Error("Invalid redirect uri");
  }

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

// Handle the OAuth authorization request declined
export const requestDeclined = async (req: Request, res: Response) => {
  //
};

// Exchange an authorization code for an access token
export const exchangeCodeForToken = async (formData: FormData) => {
  const rawFormData = Object.fromEntries(formData);
  const {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  } = tokenExchangeSchema.parse(rawFormData);

  const codeRecord = await prisma.oAuthCode.findUnique({
    where: {
      code,
      clientId,
    },
  });

  if (!codeRecord) {
    throw new Error("Invalid code");
  }

  if (codeRecord.redirectUri !== redirectUri) {
    throw new Error("Invalid redirect uri");
  }

  if (codeRecord.expiresAt < new Date()) {
    throw new Error("Code expired");
    // TODO: Delete the code record
  }

  // Client secret
  const app = await prisma.oAuthApp.findUnique({
    where: {
      clientId,
    },
  });

  if (!app) {
    throw new Error("Invalid client id");
  }

  const clientSecretHashed = hashToken(clientSecret, {
    noSecret: true,
  });

  if (app.clientSecretHashed !== clientSecretHashed) {
    throw new Error("Invalid client secret");
  }

  const { accessToken, refreshToken } = createTokens();

  await prisma.$transaction(async (tx) => {
    // 1. Create an access token
    const accessTokenRecord = await tx.oAuthAccessToken.create({
      data: {
        clientId: codeRecord.clientId,
        userId: codeRecord.userId,
        accessToken,
        expiresAt: new Date(Date.now() + tokensExpiry.accessToken),
      },
    });

    // 2. Create a refresh token
    await tx.oAuthRefreshToken.create({
      data: {
        refreshToken,
        accessTokenId: accessTokenRecord.id,
        expiresAt: new Date(Date.now() + tokensExpiry.refreshToken),
      },
    });

    // 3. Delete the code record
    await tx.oAuthCode.delete({
      where: {
        code,
      },
    });
  });

  return {
    token_type: "Bearer",
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: tokensExpiry.accessToken,
  };
};
