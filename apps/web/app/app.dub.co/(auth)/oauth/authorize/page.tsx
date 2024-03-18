import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { authRequestSchema } from "@/lib/zod/schemas/oauth";
import { Consent } from "@/ui/oauth/consent";
import { Logo } from "@dub/ui";
import { notFound, redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function Page({
  searchParams,
}: {
  searchParams: z.infer<typeof authRequestSchema>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // TODO:
  // Move this logic to a lib

  const result = authRequestSchema.safeParse(searchParams);

  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }

  const { client_id: clientId, redirect_uri } = result.data;

  // TODO:
  // Check redirect_uri is allowed for this client_id

  const app = await prisma.oAuthApp.findUnique({
    where: {
      clientId,
    },
  });

  if (!app) {
    console.error(`[OAuth] - App with client_id ${clientId} not found`);
    notFound();
  }

  const workspaces = await prisma.project.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <Logo className="h-12 w-12" />
      <Consent workspaces={workspaces} app={app} requestParams={searchParams} />
    </div>
  );
}
