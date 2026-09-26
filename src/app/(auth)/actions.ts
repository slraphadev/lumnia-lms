"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { formError, type FormState } from "@/lib/form";
import { SIGNUP_ROLES } from "@/lib/roles";


const ERRORS: Record<string, string> = {
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Já existe uma conta com este e-mail.",
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  INVALID_EMAIL: "E-mail inválido.",
};

function authError(error: unknown, formData: FormData): FormState {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string } | undefined)?.code;
    const message = (code && ERRORS[code]) ?? "Não foi possível concluir. Tente novamente.";
    return formError(message, formData, ["password"]);
  }
  throw error;
}

/** Só aceita caminhos internos, para não virar um redirecionamento aberto. */
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(128),
  role: z.enum(SIGNUP_ROLES as ["student", "teacher"], { error: "Escolha um perfil." }),
});

export async function signUpAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return formError(parsed.error.issues[0].message, formData, ["password"]);

  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    return authError(error, formData);
  }
  redirect(safeNext(formData.get("next"), parsed.data.role === "teacher" ? "/professor" : "/cursos"));
}

const signInSchema = z.object({
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  password: z.string().min(1, "Informe a senha."),
});

export async function signInAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return formError(parsed.error.issues[0].message, formData, ["password"]);

  let role: unknown;
  try {
    const result = await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    role = (result.user as { role?: unknown }).role;
  } catch (error) {
    return authError(error, formData);
  }
  redirect(safeNext(formData.get("next"), role === "teacher" ? "/professor" : "/meus-cursos"));
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
