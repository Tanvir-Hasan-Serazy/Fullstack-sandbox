import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma/client.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
  },

  databaseHooks: {
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "SELF" },
        profilePhoto: {
          type: "string",
          required: false,
        },
        profilePhotoId: {
          type: "string",
          required: false,
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },

  // Logging
  logger: {
    disabled: process.env.NODE_ENV === "production",
  },

  // Security
  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: false, // Enable CSRF protection
    crossSubDomainCookies: false, // Strict cookie scope
  },
});
