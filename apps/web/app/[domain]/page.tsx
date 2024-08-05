import { prisma } from "@/lib/prisma";
import { Background } from "@dub/ui";
import { constructMetadata } from "@dub/utils";
import PlaceholderContent from "./placeholder";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}) {
  const title = `${params.domain.toUpperCase()} - A ${
    process.env.NEXT_PUBLIC_APP_NAME
  } Custom Domain`;
  const description = `${params.domain.toUpperCase()} is a custom domain on ${
    process.env.NEXT_PUBLIC_APP_NAME
  } - an open-source link management tool for modern marketing teams to create, share, and track short links.`;

  return constructMetadata({
    title,
    description,
  });
}

export async function generateStaticParams() {
  if (process.env.VERCEL_ENV != "production") {
    return [];
  }

  // Removed prisma.findMany logic

  return [];
}

export default function CustomDomainPage() {
  return (
    <>
      <Background />
      <PlaceholderContent />
    </>
  );
}
