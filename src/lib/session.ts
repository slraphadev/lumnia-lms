import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/roles";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Exige login. Sem sessão, manda para /entrar e volta para `returnTo` depois. */
export async function requireUser(returnTo?: string) {
  const session = await getSession();
  if (!session) {
    redirect(returnTo ? `/entrar?next=${encodeURIComponent(returnTo)}` : "/entrar");
  }
  return session;
}

export async function requireRole(role: Role, returnTo?: string) {
  const session = await requireUser(returnTo);
  if (session.user.role !== role) redirect("/");
  return session;
}
