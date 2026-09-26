import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { course, courseModule, enrollment, lesson, lessonProgress, user } from "@/db/schema";

export type CourseOutline = NonNullable<Awaited<ReturnType<typeof getCourseOutline>>>;

/** Curso com módulos e aulas em ordem. */
export async function getCourseOutline(where: { slug: string } | { id: string }) {
  return db.query.course.findFirst({
    where: "slug" in where ? eq(course.slug, where.slug) : eq(course.id, where.id),
    with: {
      teacher: { columns: { id: true, name: true } },
      modules: {
        orderBy: [asc(courseModule.position)],
        with: { lessons: { orderBy: [asc(lesson.position)] } },
      },
    },
  });
}

export function flattenLessons(outline: CourseOutline) {
  return outline.modules.flatMap((m) => m.lessons);
}

export async function listPublishedCourses() {
  return db
    .select({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      teacherName: user.name,
      lessonCount: sql<number>`(
        select count(*)::int from ${lesson}
        join ${courseModule} on ${courseModule.id} = ${lesson.moduleId}
        where ${courseModule.courseId} = ${course.id}
      )`,
    })
    .from(course)
    .innerJoin(user, eq(user.id, course.teacherId))
    .where(eq(course.status, "published"))
    .orderBy(desc(course.createdAt));
}

export async function listTeacherCourses(teacherId: string) {
  return db
    .select({
      id: course.id,
      slug: course.slug,
      title: course.title,
      status: course.status,
      updatedAt: course.updatedAt,
      enrollmentCount: sql<number>`(
        select count(*)::int from ${enrollment} where ${enrollment.courseId} = ${course.id}
      )`,
    })
    .from(course)
    .where(eq(course.teacherId, teacherId))
    .orderBy(desc(course.updatedAt));
}

export async function isEnrolled(userId: string, courseId: string) {
  const row = await db.query.enrollment.findFirst({
    columns: { id: true },
    where: and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
  });
  return Boolean(row);
}

export async function getCompletedLessonIds(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));
  return new Set(rows.map((r) => r.lessonId));
}

/** Cursos em que o aluno está matriculado, com o progresso de cada um. */
export async function listEnrolledCourses(userId: string) {
  const courses = await db
    .select({ id: course.id, slug: course.slug, title: course.title, enrolledAt: enrollment.createdAt })
    .from(enrollment)
    .innerJoin(course, eq(course.id, enrollment.courseId))
    .where(eq(enrollment.userId, userId))
    .orderBy(desc(enrollment.createdAt));
  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const totals = await db
    .select({ courseId: courseModule.courseId, total: count(lesson.id) })
    .from(lesson)
    .innerJoin(courseModule, eq(courseModule.id, lesson.moduleId))
    .where(inArray(courseModule.courseId, courseIds))
    .groupBy(courseModule.courseId);
  const done = await db
    .select({ courseId: courseModule.courseId, done: count(lessonProgress.lessonId) })
    .from(lessonProgress)
    .innerJoin(lesson, eq(lesson.id, lessonProgress.lessonId))
    .innerJoin(courseModule, eq(courseModule.id, lesson.moduleId))
    .where(and(eq(lessonProgress.userId, userId), inArray(courseModule.courseId, courseIds)))
    .groupBy(courseModule.courseId);

  const totalBy = new Map(totals.map((t) => [t.courseId, t.total]));
  const doneBy = new Map(done.map((d) => [d.courseId, d.done]));
  return courses.map((c) => {
    const total = totalBy.get(c.id) ?? 0;
    const completed = doneBy.get(c.id) ?? 0;
    return { ...c, total, completed, percent: progressPercent(completed, total) };
  });
}

export function progressPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}
