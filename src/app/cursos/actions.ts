"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { course, courseModule, enrollment, lesson, lessonProgress } from "@/db/schema";
import { isUuid } from "@/lib/ids";
import { isEnrolled } from "@/lib/courses";
import { requireUser } from "@/lib/session";

export async function enrollAction(courseId: string) {
  if (!isUuid(courseId)) throw new Error("Curso inválido.");
  const target = await db.query.course.findFirst({ where: eq(course.id, courseId) });
  if (!target) throw new Error("Curso não encontrado.");

  const session = await requireUser(`/cursos/${target.slug}`);
  if (session.user.role !== "student") throw new Error("Apenas alunos podem se matricular.");
  if (target.status !== "published") throw new Error("Este curso não está aberto para matrícula.");

  await db.insert(enrollment).values({ userId: session.user.id, courseId }).onConflictDoNothing();
  revalidatePath(`/cursos/${target.slug}`);
  revalidatePath("/meus-cursos");
  redirect(`/cursos/${target.slug}`);
}

export async function setLessonCompleteAction(lessonId: string, completed: boolean) {
  if (!isUuid(lessonId)) throw new Error("Aula inválida.");
  const session = await requireUser();

  const [row] = await db
    .select({ courseId: course.id, slug: course.slug })
    .from(lesson)
    .innerJoin(courseModule, eq(courseModule.id, lesson.moduleId))
    .innerJoin(course, eq(course.id, courseModule.courseId))
    .where(eq(lesson.id, lessonId));
  if (!row) throw new Error("Aula não encontrada.");
  if (!(await isEnrolled(session.user.id, row.courseId))) {
    throw new Error("Matricule-se no curso para registrar progresso.");
  }

  if (completed) {
    await db.insert(lessonProgress).values({ userId: session.user.id, lessonId }).onConflictDoNothing();
  } else {
    await db
      .delete(lessonProgress)
      .where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.lessonId, lessonId)));
  }
  revalidatePath(`/cursos/${row.slug}`, "layout");
  revalidatePath("/meus-cursos");
}
