export type FormState = { error?: string; values?: Record<string, string> } | undefined;

/**
 * Resposta de erro de um formulário. Devolve o que foi enviado porque o React 19
 * reseta o formulário após a action: sem isso, o usuário perderia o que digitou.
 */
export function formError(error: string, formData: FormData, omit: string[] = []): FormState {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && !omit.includes(key)) values[key] = value;
  }
  return { error, values };
}
