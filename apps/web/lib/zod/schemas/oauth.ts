import z from "@/lib/zod";

// TODO:
// Redirect uri must be an HTTPS/SSL URI (except for localhost)
// 255: Check what is the exact limit in the database
// Make the error messages more user-friendly

export const appIdSchema = z.object({
  appId: z.string(),
});

export const createOAuthAppSchema = z.object({
  name: z.string().min(1).max(255),
  website: z.string().url().max(255),
  redirectUris: z.string().url().max(255),
});

export const updateOAuthAppSchema = createOAuthAppSchema.partial();

export const authRequestSchema = z.object({
  client_id: z
    .string({ required_error: "Missing client_id" })
    .min(1, "Missing client_id"),
  redirect_uri: z
    .string({ required_error: "Missing redirect_uri" })
    .url({ message: "redirect_uri must be a valid URL" }),
  response_type: z
    .string({
      required_error: "Missing response_type",
    })
    .refine((responseType) => responseType === "code", {
      message: "response_type must be 'code'",
    }),
  state: z.string().max(255).optional(),
});

export const authorizedRequestSchema = authRequestSchema.extend({
  workspaceId: z
    .string({ required_error: "Missing workspaceId" })
    .min(1, "Missing workspaceId"),
});

export const tokenExchangeSchema = z.object({
  code: z.string({ required_error: "Missing code" }).min(1, "Missing code"),
  client_id: z
    .string({ required_error: "Missing client_id" })
    .min(1, "Missing client_id"),
  client_secret: z
    .string({ required_error: "Missing client_secret" })
    .min(1, "Missing client_secret"),
  redirect_uri: z
    .string({ required_error: "Missing redirect_uri" })
    .url({ message: "redirect_uri must be a valid URL" }),
  grant_type: z
    .string({
      required_error: "Missing grant_type",
    })
    .refine((grantType) => grantType === "authorization_code", {
      message: "grant_type must be 'authorization_code'",
    }),
});
