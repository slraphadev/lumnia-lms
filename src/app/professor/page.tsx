import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { button, card } from "@/components/ui";
import { listTeacherCourses } from "@/lib/courses";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Painel do professor" };

export default async function TeacherDashboardPage() {
  const session = await requireRole("teacher", "/professor");
  const courses = await listTeacherCourses(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meus cursos</h1>
        <Link href="/professor/cursos/novo" className={button}>
          Novo curso
        </Link>
      </div>
      {courses.length === 0 ? (
        <p className="text-fg-2">Você ainda não criou nenhum curso.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/professor/cursos/${c.id}`} className={`${card} flex flex-wrap items-center gap-3 hover:shadow-md`}>
                <span className="flex-1 font-medium">{c.title}</span>
                <StatusBadge status={c.status} />
                <span className="text-xs text-fg-2">
                  {c.enrollmentCount} {c.enrollmentCount === 1 ? "aluno" : "alunos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
