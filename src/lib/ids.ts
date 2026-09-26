import { z } from "zod";

const uuid = z.uuid();

/** Parâmetros de rota que viram UUID no banco: evita erro 500 com valores inválidos. */
export function isUuid(value: unknown): value is string {
  return uuid.safeParse(value).success;
}
