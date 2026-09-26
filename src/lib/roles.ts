export const ROLES = ["student", "teacher"] as const;
export type Role = (typeof ROLES)[number];

/** Perfis que qualquer pessoa pode escolher no cadastro. */
export const SIGNUP_ROLES: readonly Role[] = ["student", "teacher"];

export const ROLE_LABELS: Record<Role, string> = {
  student: "Aluno",
  teacher: "Professor",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
