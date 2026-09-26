import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { button, card } from "@/components/ui";
import { listEnrolledCourses } from "@/lib/courses";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Meus cursos" };

export default async function MyCoursesPage() {
  const session = await requireUser("/meus-cursos");
  const courses = await listEnrolledCourses(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Meus cursos</h1>
      {courses.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-fg-2">Você ainda não está matriculado em nenhum curso.</p>
          <Link href="/cursos" className={button}>
            Explorar o catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/cursos/${c.slug}`} className={`${card} flex h-full flex-col gap-4 hover:shadow-md`}>
                <h2 className="text-lg font-medium">{c.title}</h2>
                <p className="text-xs text-fg-2">
                  {c.completed} de {c.total} {c.total === 1 ? "aula concluída" : "aulas concluídas"}
                </p>
                <div className="mt-auto">
                  <ProgressBar percent={c.percent} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
