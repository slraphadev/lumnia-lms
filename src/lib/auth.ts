import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { SIGNUP_ROLES } from "@/lib/roles";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "student", input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // O endpoint de cadastro é público: só aceita os perfis abertos ao autocadastro.
        before: async (user) => {
          const role = (user as { role?: unknown }).role ?? "student";
          if (!SIGNUP_ROLES.includes(role as never)) {
            throw new APIError("BAD_REQUEST", { message: "Perfil inválido." });
          }
          return { data: { ...user, role } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
