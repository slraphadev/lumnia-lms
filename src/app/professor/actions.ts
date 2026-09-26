"use server";

import { and, asc, count, desc, eq, gt, lt, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { course, courseModule, enrollment, lesson } from "@/db/schema";
import { formError, type FormState } from "@/lib/form";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { parseVideoUrl } from "@/lib/video";

type Direction = "up" | "down";
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Toda action revalida a autorização: server actions aceitam POST direto, sem passar pela UI.

async function requireTeacher() {
  return (await requireRole("teacher")).user;
}

async function ownedCourse(courseId: string, teacherId: string) {
  if (!isUuid(courseId)) throw new Error("Curso inválido.");
  const found = await db.query.course.findFirst({
    where: and(eq(course.id, courseId), eq(course.teacherId, teacherId)),
  });
  if (!found) throw new Error("Curso não encontrado.");
  return found;
}

async function ownedModule(moduleId: string, teacherId: string) {
  if (!isUuid(moduleId)) throw new Error("Módulo inválido.");
  const [row] = await db
    .select({ module: courseModule, course })
    .from(courseModule)
    .innerJoin(course, eq(course.id, courseModule.courseId))
    .where(and(eq(courseModule.id, moduleId), eq(course.teacherId, teacherId)));
  if (!row) throw new Error("Módulo não encontrado.");
  return row;
}

async function ownedLesson(lessonId: string, teacherId: string) {
  if (!isUuid(lessonId)) throw new Error("Aula inválida.");
  const [row] = await db
    .select({ lesson, course })
    .from(lesson)
    .innerJoin(courseModule, eq(courseModule.id, lesson.moduleId))
    .innerJoin(course, eq(course.id, courseModule.courseId))
    .where(and(eq(lesson.id, lessonId), eq(course.teacherId, teacherId)));
  if (!row) throw new Error("Aula não encontrada.");
  return row;
}

function revalidateCourse(target: { id: string; slug: string }) {
  revalidatePath(`/professor/cursos/${target.id}`);
  revalidatePath("/professor");
  revalidatePath(`/cursos/${target.slug}`, "layout");
  revalidatePath("/cursos");
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "curso";
  for (let i = 1; ; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const taken = await db.query.course.findFirst({ columns: { id: true }, where: eq(course.slug, candidate) });
    if (!taken) return candidate;
  }
}

/* Cursos */

const courseSchema = z.object({
  title: z.string().trim().min(3, "O título precisa ter pelo menos 3 caracteres.").max(120),
  description: z.string().trim().max(2000, "Descrição longa demais (máximo 2000 caracteres)."),
});

export async function createCourseAction(_: FormState, formData: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return formError(parsed.error.issues[0].message, formData);

  const [created] = await db
    .insert(course)
    .values({ ...parsed.data, slug: await uniqueSlug(parsed.data.title), teacherId: teacher.id })
    .returning({ id: course.id });
  revalidatePath("/professor");
  redirect(`/professor/cursos/${created.id}`);
}

export async function updateCourseAction(courseId: string, _: FormState, formData: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const target = await ownedCourse(courseId, teacher.id);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return formError(parsed.error.issues[0].message, formData);

  // O slug não muda ao renomear, para não quebrar links já compartilhados.
  await db.update(course).set(parsed.data).where(eq(course.id, target.id));
  revalidateCourse(target);
  return {};
}

export async function setCourseStatusAction(courseId: string, status: "draft" | "published") {
  const teacher = await requireTeacher();
  const target = await ownedCourse(courseId, teacher.id);
  if (status === "published") {
    const [{ total }] = await db
      .select({ total: count() })
      .from(lesson)
      .innerJoin(courseModule, eq(courseModule.id, lesson.moduleId))
      .where(eq(courseModule.courseId, target.id));
    if (total === 0) throw new Error("Adicione ao menos uma aula antes de publicar.");
  }
  await db.update(course).set({ status }).where(eq(course.id, target.id));
  revalidateCourse(target);
}

export async function deleteCourseAction(courseId: string) {
  const teacher = await requireTeacher();
  const target = await ownedCourse(courseId, teacher.id);
  const [{ total }] = await db.select({ total: count() }).from(enrollment).where(eq(enrollment.courseId, target.id));
  if (total > 0) throw new Error("Cursos com alunos matriculados não podem ser excluídos.");

  await db.delete(course).where(eq(course.id, target.id));
  revalidateCourse(target);
  redirect("/professor");
}

/* Módulos */

const titleSchema = z.string().trim().min(1, "Informe um título.").max(120, "Título longo demais.");

export async function createModuleAction(courseId: string, _: FormState, formData: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const target = await ownedCourse(courseId, teacher.id);
  const title = titleSchema.safeParse(formData.get("title"));
  if (!title.success) return formError(title.error.issues[0].message, formData);

  await db.transaction(async (tx) => {
    const [{ last }] = await tx
      .select({ last: max(courseModule.position) })
      .from(courseModule)
      .where(eq(courseModule.courseId, target.id));
    await tx.insert(courseModule).values({ courseId: target.id, title: title.data, position: (last ?? -1) + 1 });
  });
  revalidateCourse(target);
  return {};
}

export async function renameModuleAction(moduleId: string, formData: FormData) {
  const teacher = await requireTeacher();
  const { module, course: target } = await ownedModule(moduleId, teacher.id);
  const title = titleSchema.parse(formData.get("title"));
  await db.update(courseModule).set({ title }).where(eq(courseModule.id, module.id));
  revalidateCourse(target);
}

export async function deleteModuleAction(moduleId: string) {
  const teacher = await requireTeacher();
  const { module, course: target } = await ownedModule(moduleId, teacher.id);
  await db.delete(courseModule).where(eq(courseModule.id, module.id));
  revalidateCourse(target);
}

export async function moveModuleAction(moduleId: string, direction: Direction) {
  const teacher = await requireTeacher();
  const { module, course: target } = await ownedModule(moduleId, teacher.id);
  await db.transaction(async (tx) => {
    const [neighbor] = await tx
      .select()
      .from(courseModule)
      .where(
        and(
          eq(courseModule.courseId, target.id),
          direction === "up" ? lt(courseModule.position, module.position) : gt(courseModule.position, module.position),
        ),
      )
      .orderBy(direction === "up" ? desc(courseModule.position) : asc(courseModule.position))
      .limit(1);
    if (!neighbor) return;
    await swapPositions(tx, courseModule, module, neighbor);
  });
  revalidateCourse(target);
}

/* Aulas */

const lessonSchema = z.object({
  moduleId: z.uuid("Escolha um módulo."),
  title: titleSchema,
  content: z.string().trim().max(20000, "Texto longo demais."),
  videoUrl: z.string().trim().max(500),
});

export async function saveLessonAction(
  courseId: string,
  lessonId: string | null,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const teacher = await requireTeacher();
  const target = await ownedCourse(courseId, teacher.id);
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return formError(parsed.error.issues[0].message, formData);
  const { moduleId, title, content, videoUrl } = parsed.data;

  const { module } = await ownedModule(moduleId, teacher.id);
  if (module.courseId !== target.id) return formError("Módulo inválido.", formData);

  const video = videoUrl ? parseVideoUrl(videoUrl) : null;
  if (videoUrl && !video) return formError("Cole um link do YouTube ou do Vimeo.", formData);
  const values = {
    title,
    content,
    videoUrl: video ? videoUrl : null,
    videoProvider: video?.provider ?? null,
    videoId: video?.id ?? null,
  };

  if (lessonId) {
    const { lesson: existing } = await ownedLesson(lessonId, teacher.id);
    await db.transaction(async (tx) => {
      const moved = existing.moduleId !== moduleId;
      await tx
        .update(lesson)
        .set({ ...values, moduleId, ...(moved && { position: await nextLessonPosition(tx, moduleId) }) })
        .where(eq(lesson.id, existing.id));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(lesson).values({ ...values, moduleId, position: await nextLessonPosition(tx, moduleId) });
    });
  }
  revalidateCourse(target);
  redirect(`/professor/cursos/${target.id}`);
}

export async function deleteLessonAction(lessonId: string) {
  const teacher = await requireTeacher();
  const { lesson: existing, course: target } = await ownedLesson(lessonId, teacher.id);
  await db.delete(lesson).where(eq(lesson.id, existing.id));
  revalidateCourse(target);
}

export async function moveLessonAction(lessonId: string, direction: Direction) {
  const teacher = await requireTeacher();
  const { lesson: existing, course: target } = await ownedLesson(lessonId, teacher.id);
  await db.transaction(async (tx) => {
    const [neighbor] = await tx
      .select()
      .from(lesson)
      .where(
        and(
          eq(lesson.moduleId, existing.moduleId),
          direction === "up" ? lt(lesson.position, existing.position) : gt(lesson.position, existing.position),
        ),
      )
      .orderBy(direction === "up" ? desc(lesson.position) : asc(lesson.position))
      .limit(1);
    if (!neighbor) return;
    await swapPositions(tx, lesson, existing, neighbor);
  });
  revalidateCourse(target);
}

async function nextLessonPosition(tx: Tx, moduleId: string) {
  const [{ last }] = await tx.select({ last: max(lesson.position) }).from(lesson).where(eq(lesson.moduleId, moduleId));
  return (last ?? -1) + 1;
}

async function swapPositions(
  tx: Tx,
  table: typeof courseModule | typeof lesson,
  a: { id: string; position: number },
  b: { id: string; position: number },
) {
  await tx.update(table).set({ position: b.position }).where(eq(table.id, a.id));
  await tx.update(table).set({ position: a.position }).where(eq(table.id, b.id));
}
