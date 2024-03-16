import { DubApiError } from "@/lib/api/errors";
import { withAuth } from "@/lib/auth";
import { parseJSONBody } from "@/lib/oauth";
import prisma from "@/lib/prisma";
import { appIdSchema, updateOAuthAppSchema } from "@/lib/zod/schemas/oauth";
import { NextResponse } from "next/server";

// GET /api/projects/[slug]/oauth-apps/[appId] – get a specific OAuth app
export const GET = withAuth(
  async ({ params, project }) => {
    const { appId } = appIdSchema.parse(params);

    try {
      const app = await prisma.oAuthApp.findUniqueOrThrow({
        where: {
          id: appId,
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
    } catch (error) {
      if (error.code === "P2025") {
        throw new DubApiError({
          code: "not_found",
          message: "OAuth app not found.",
        });
      }

      throw error;
    }
  },
  {
    requiredRole: ["owner"],
  },
);

// PATCH /api/projects/[slug]/oauth-apps/[appId] – update a specific OAuth app
export const PATCH = withAuth(
  async ({ req, params, project }) => {
    const json = await parseJSONBody(req);
    const { appId } = appIdSchema.parse(params);
    const { name, website, redirectUris } = updateOAuthAppSchema.parse(json);

    try {
      const app = await prisma.oAuthApp.update({
        where: {
          id: appId,
          projectId: project.id,
        },
        data: {
          name,
          website,
          redirectUris: redirectUris ? [redirectUris] : undefined,
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
    } catch (error) {
      if (error.code === "P2025") {
        throw new DubApiError({
          code: "not_found",
          message: "OAuth app not found.",
        });
      }

      throw error;
    }
  },
  {
    requiredRole: ["owner"],
  },
);

// DELETE /api/projects/[slug]/oauth-apps/[appId] – delete an OAuth app
export const DELETE = withAuth(
  async ({ params, project }) => {
    const { appId } = appIdSchema.parse(params);

    try {
      await prisma.oAuthApp.delete({
        where: {
          id: appId,
          projectId: project.id,
        },
      });
    } catch (error) {
      // TODO:
      // Move this logic to a middleware

      if (error.code === "P2025") {
        throw new DubApiError({
          code: "not_found",
          message: "OAuth app not found.",
        });
      }

      throw error;
    }

    // TODO:
    // Remove all related records (tokens, etc.)

    return new Response(undefined, {
      status: 204,
    });
  },
  {
    requiredRole: ["owner"],
  },
);
