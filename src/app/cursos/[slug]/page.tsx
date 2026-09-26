import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { button, buttonOutline, card } from "@/components/ui";
import { getCourseAccess } from "@/lib/access";
import { flattenLessons, getCompletedLessonIds, getCourseOutline, progressPercent } from "@/lib/courses";
import { getSession } from "@/lib/session";
import { enrollAction } from "../actions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const outline = await getCourseOutline({ slug: (await params).slug });
  return { title: outline?.status === "published" ? outline.title : "Curso" };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const outline = await getCourseOutline({ slug });
  if (!outline) notFound();

  const session = await getSession();
  const access = await getCourseAccess(outline, session);
  if (!access.visible) notFound();

  const lessons = flattenLessons(outline);
  const completed = access.enrolled
    ? await getCompletedLessonIds(session!.user.id, lessons.map((l) => l.id))
    : new Set<string>();
  const nextLesson = lessons.find((l) => !completed.has(l.id)) ?? lessons[0];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        {outline.status === "draft" && (
          <span className="w-fit rounded-full bg-warn-soft px-3 py-0.5 text-xs font-medium text-warn-foreground">
            Rascunho
          </span>
        )}
        <h1 className="text-3xl font-semibold">{outline.title}</h1>
        <p className="text-sm text-fg-2">Professor: {outline.teacher.name}</p>
        {outline.description && <p className="max-w-2xl whitespace-pre-line">{outline.description}</p>}
      </header>

      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        {access.enrolled ? (
          <>
            <div className="flex-1">
              <ProgressBar percent={progressPercent(completed.size, lessons.length)} />
            </div>
            {nextLesson && (
              <Link href={`/cursos/${slug}/aulas/${nextLesson.id}`} className={button}>
                {completed.size === 0 ? "Começar" : "Continuar"}
              </Link>
            )}
          </>
        ) : access.isOwner ? (
          <>
            <p className="text-sm text-fg-2">Você é o professor deste curso.</p>
            <div className="flex gap-3">
              {lessons[0] && (
                <Link href={`/cursos/${slug}/aulas/${lessons[0].id}`} className={buttonOutline}>
                  Pré-visualizar
                </Link>
              )}
              <Link href={`/professor/cursos/${outline.id}`} className={button}>
                Editar curso
              </Link>
            </div>
          </>
        ) : !session ? (
          <>
            <p className="text-sm text-fg-2">Entre com sua conta de aluno para se matricular.</p>
            <Link href={`/entrar?next=/cursos/${slug}`} className={button}>
              Entrar para se matricular
            </Link>
          </>
        ) : session.user.role === "student" ? (
          <>
            <p className="text-sm text-fg-2">Matrícula gratuita, em um clique.</p>
            <form action={enrollAction.bind(null, outline.id)}>
              <button className={button}>Matricular-se</button>
            </form>
          </>
        ) : (
          <p className="text-sm text-fg-2">Apenas alunos podem se matricular em cursos.</p>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Conteúdo</h2>
        {outline.modules.length === 0 && <p className="text-fg-2">Nenhum módulo ainda.</p>}
        <ol className="flex flex-col gap-4">
          {outline.modules.map((m, i) => (
            <li key={m.id} className={card}>
              <h3 className="font-medium">
                Módulo {i + 1}. {m.title}
              </h3>
              <ol className="mt-3 flex flex-col gap-1 text-sm">
                {m.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <span aria-hidden className={completed.has(l.id) ? "text-success" : "text-fg-disabled"}>
                      {completed.has(l.id) ? "✓" : "○"}
                    </span>
                    {access.canLearn ? (
                      <Link href={`/cursos/${slug}/aulas/${l.id}`} className="hover:text-brand-text">
                        {l.title}
                      </Link>
                    ) : (
                      <span>{l.title}</span>
                    )}
                    {completed.has(l.id) && <span className="sr-only">(concluída)</span>}
                  </li>
                ))}
                {m.lessons.length === 0 && <li className="text-fg-2">Nenhuma aula neste módulo.</li>}
              </ol>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
