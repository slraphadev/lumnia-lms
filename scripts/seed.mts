// Dados de exemplo para desenvolvimento local. Idempotente: pode rodar mais de uma vez.
process.loadEnvFile();

const { eq } = await import("drizzle-orm");
const { db } = await import("@/db");
const { course, courseModule, lesson, user } = await import("@/db/schema");
const { auth } = await import("@/lib/auth");
const { parseVideoUrl } = await import("@/lib/video");

const PASSWORD = "lumnia-dev-123";

async function ensureUser(name: string, email: string, role: "student" | "teacher") {
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) return existing.id;
  const { user: created } = await auth.api.signUpEmail({ body: { name, email, password: PASSWORD, role } });
  return created.id;
}

const teacherId = await ensureUser("Professora Demo", "professor@lumnia.dev", "teacher");
await ensureUser("Aluno Demo", "aluno@lumnia.dev", "student");

const slug = "primeiros-passos-com-a-lumnia";
if (!(await db.query.course.findFirst({ where: eq(course.slug, slug) }))) {
  const [created] = await db
    .insert(course)
    .values({
      slug,
      title: "Primeiros passos com a Lumnia",
      description: "Curso de exemplo criado pelo seed de desenvolvimento.",
      status: "published",
      teacherId,
    })
    .returning();

  type SeedLesson = { title: string; videoUrl?: string; content?: string };
  const modules: { title: string; lessons: SeedLesson[] }[] = [
    {
      title: "Boas-vindas",
      lessons: [
        { title: "Como funciona a plataforma", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        { title: "Organizando seus estudos", content: "Reserve um horário fixo por dia e marque cada aula ao concluir." },
      ],
    },
    {
      title: "Na prática",
      lessons: [{ title: "Sua primeira aula em vídeo", videoUrl: "https://vimeo.com/76979871" }],
    },
  ];

  for (const [mi, m] of modules.entries()) {
    const [mod] = await db
      .insert(courseModule)
      .values({ courseId: created.id, title: m.title, position: mi })
      .returning();
    for (const [li, l] of m.lessons.entries()) {
      const video = l.videoUrl ? parseVideoUrl(l.videoUrl) : null;
      await db.insert(lesson).values({
        moduleId: mod.id,
        title: l.title,
        content: l.content ?? "",
        videoUrl: video ? l.videoUrl : null,
        videoProvider: video?.provider ?? null,
        videoId: video?.id ?? null,
        position: li,
      });
    }
  }
}

console.log(`Seed concluído. Contas: professor@lumnia.dev e aluno@lumnia.dev (senha ${PASSWORD}).`);
process.exit(0);
