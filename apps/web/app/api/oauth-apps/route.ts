import { withAuth } from "@/lib/auth";
import { createClientId, createClientSecret, parseJSONBody } from "@/lib/oauth";
import prisma from "@/lib/prisma";
import { createOAuthAppSchema } from "@/lib/zod/schemas/oauth";
import { NextResponse } from "next/server";

// POST /api/projects/[slug]/oauth-apps – create a new OAuth app
export const POST = withAuth(
  async ({ req, project }) => {
    const json = await parseJSONBody(req);
    const { name, website, redirectUris } = createOAuthAppSchema.parse(json);

    const {
      secret,
      secretAlias: clientSecretAlias,
      secretHashed: clientSecretHashed,
    } = createClientSecret();

    const app = await prisma.oAuthApp.create({
      data: {
        projectId: project.id,
        clientId: createClientId(),
        clientSecretHashed,
        clientSecretAlias,
        name,
        website,
        redirectUris: [redirectUris],
      },
    });

    return NextResponse.json(
      {
        ...app,
        clientSecret: secret,
      },
      { status: 201 },
    );
  },
  {
    requiredRole: ["owner"],
  },
);

// GET /api/projects/[slug]/oauth-apps – get all OAuth apps for a specific project
export const GET = withAuth(async ({ project }) => {
  const app = await prisma.oAuthApp.findMany({
    where: {
      projectId: project.id,
    },
    select: {
      id: true,
      name: true,
      website: true,
      redirectUris: true,
      clientId: true,
      clientSecretAlias: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(app);
});
