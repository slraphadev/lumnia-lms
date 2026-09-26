import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { button, buttonOutline } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import { getCourseAccess } from "@/lib/access";
import { flattenLessons, getCompletedLessonIds, getCourseOutline, progressPercent } from "@/lib/courses";
import { isUuid } from "@/lib/ids";
import { requireUser } from "@/lib/session";
import { parseVideoUrl } from "@/lib/video";
import { setLessonCompleteAction } from "../../../actions";

type Props = { params: Promise<{ slug: string; lessonId: string }> };

export const metadata: Metadata = { title: "Aula" };

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  if (!isUuid(lessonId)) notFound();
  const session = await requireUser(`/cursos/${slug}/aulas/${lessonId}`);

  const outline = await getCourseOutline({ slug });
  if (!outline) notFound();
  const access = await getCourseAccess(outline, session);
  if (!access.visible) notFound();
  if (!access.canLearn) redirect(`/cursos/${slug}`);

  const lessons = flattenLessons(outline);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const current = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  const completed = access.enrolled
    ? await getCompletedLessonIds(session.user.id, lessons.map((l) => l.id))
    : new Set<string>();
  const isDone = completed.has(current.id);
  const video = current.videoUrl ? parseVideoUrl(current.videoUrl) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <article className="flex min-w-0 flex-col gap-6">
        <nav className="text-sm text-fg-2">
          <Link href={`/cursos/${slug}`} className="hover:text-brand-text">
            {outline.title}
          </Link>
        </nav>
        {access.isOwner && !access.enrolled && (
          <p className="rounded-lg bg-brand-soft px-4 py-2 text-sm text-brand-text">
            Pré-visualização do professor. O progresso não é registrado.
          </p>
        )}
        <h1 className="text-2xl font-semibold">{current.title}</h1>
        {video && <VideoPlayer {...video} title={current.title} />}
        {current.content && <div className="whitespace-pre-line leading-relaxed">{current.content}</div>}

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          {access.enrolled && (
            <form action={setLessonCompleteAction.bind(null, current.id, !isDone)}>
              <button className={isDone ? buttonOutline : button}>
                {isDone ? "Marcar como não concluída" : "Marcar como concluída"}
              </button>
            </form>
          )}
          <div className="ml-auto flex gap-3">
            {prev && (
              <Link href={`/cursos/${slug}/aulas/${prev.id}`} className={buttonOutline}>
                ← Anterior
              </Link>
            )}
            {next && (
              <Link href={`/cursos/${slug}/aulas/${next.id}`} className={buttonOutline}>
                Próxima →
              </Link>
            )}
          </div>
        </div>
      </article>

      <aside className="flex flex-col gap-4">
        {access.enrolled && <ProgressBar percent={progressPercent(completed.size, lessons.length)} />}
        <ol className="flex flex-col gap-4 text-sm">
          {outline.modules.map((m, i) => (
            <li key={m.id}>
              <p className="mb-1 font-medium">
                {i + 1}. {m.title}
              </p>
              <ol className="flex flex-col gap-0.5">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/cursos/${slug}/aulas/${l.id}`}
                      aria-current={l.id === current.id ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-2 ${
                        l.id === current.id ? "bg-brand-soft text-brand-text" : ""
                      }`}
                    >
                      <span aria-hidden className={completed.has(l.id) ? "text-success" : "text-fg-disabled"}>
                        {completed.has(l.id) ? "✓" : "○"}
                      </span>
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
