import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile();
} catch {
  // Sem .env: usa as variáveis já presentes no ambiente.
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  casing: "snake_case",
  strict: true,
});
