import { scopes } from "@/lib/oauth/scopes";
import z from "@/lib/zod";

// TODO:
// Redirect uri must be an HTTPS/SSL URI (except for localhost)
// 255: Check what is the exact limit in the database
// Improve error message

export const appIdSchema = z.object({
  appId: z.string(),
});

export const createOAuthAppSchema = z.object({
  name: z.string().min(1).max(255),
  website: z.string().url().max(255),
  redirectUris: z
    .string()
    .url()
    .max(255)
    .refine(
      (uri) => {
        const url = new URL(uri);
        return url.protocol === "https:" || url.hostname === "localhost";
      },
      {
        message: "Redirect uri must be an HTTPS/SSL URI (except for localhost)",
      },
    ),
  scopes: z
    .array(z.string())
    .nonempty({
      message: "You must provide at least one scope",
    })
    // .refine(
    //   (s) => {
    //     return s.every((scope) => scopes.includes(scope));
    //   },
    //   {
    //     message: "Invalid scopes",
    //   },
    // ),
});

export const updateOAuthAppSchema = createOAuthAppSchema.partial();

export const authRequestSchema = z.object({
  client_id: z.string().min(1, "Missing client_id"),
  redirect_uri: z.string().url({ message: "redirect_uri must be a valid URL" }),
  response_type: z.string().refine((responseType) => responseType === "code", {
    message: "response_type must be 'code'",
  }),
  state: z.string().max(255).optional(),
});

export const codeExchangeSchema = z.object({
  client_id: z.string().min(1, "Missing client_id"),
  client_secret: z.string().min(1, "Missing client_secret"),
  code: z.string().min(1, "Missing code"),
  redirect_uri: z.string().url({ message: "redirect_uri must be a valid URL" }),
  grant_type: z
    .literal("authorization_code")
    .refine((grantType) => grantType === "authorization_code", {
      message: "grant_type must be 'authorization_code'",
    }),
});

export const tokenRefreshSchema = z.object({
  client_id: z.string().min(1, "Missing client_id"),
  client_secret: z.string().min(1, "Missing client_secret"),
  refresh_token: z.string().min(1, "Missing refresh_token"),
  grant_type: z
    .literal("refresh_token")
    .refine((grantType) => grantType === "refresh_token", {
      message: "grant_type must be 'refresh_token'",
    }),
});

export const authorizedRequestSchema = authRequestSchema.extend({
  workspaceId: z.string().min(1, "Missing workspaceId"),
});
