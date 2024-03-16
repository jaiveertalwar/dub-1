import z from "@/lib/zod";

// TODO:
// Redirect uri must be an HTTPS/SSL URI (except for localhost)
// 255: Check what is the exact limit in the database
// Make the error messages more user-friendly

// Move the /oauth-apps to separate route (outside of /projects)

export const appIdSchema = z.object({
  appId: z.string(),
});

export const createOAuthAppSchema = z.object({
  name: z.string().min(1).max(255),
  website: z.string().url().max(255),
  redirectUris: z.string().url().max(255),
});

export const updateOAuthAppSchema = createOAuthAppSchema.partial();
