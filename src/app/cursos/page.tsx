import type { Metadata } from "next";
import Link from "next/link";
import { card } from "@/components/ui";
import { listPublishedCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Catálogo" };

export default async function CatalogPage() {
  const courses = await listPublishedCourses();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Catálogo de cursos</h1>
      {courses.length === 0 ? (
        <p className="text-fg-2">Nenhum curso publicado ainda.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/cursos/${c.slug}`} className={`${card} flex h-full flex-col gap-2 hover:shadow-md`}>
                <h2 className="text-lg font-medium">{c.title}</h2>
                {c.description && <p className="line-clamp-3 text-sm text-fg-2">{c.description}</p>}
                <p className="mt-auto text-xs text-fg-2">
                  {c.teacherName} · {c.lessonCount} {c.lessonCount === 1 ? "aula" : "aulas"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
