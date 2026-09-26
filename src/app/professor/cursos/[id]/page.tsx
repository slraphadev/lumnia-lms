import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/status-badge";
import { button, buttonDanger, buttonOutline, buttonSmall, card, input } from "@/components/ui";
import { flattenLessons, getCourseOutline } from "@/lib/courses";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/session";
import {
  createModuleAction,
  deleteCourseAction,
  deleteLessonAction,
  deleteModuleAction,
  moveLessonAction,
  moveModuleAction,
  renameModuleAction,
  setCourseStatusAction,
  updateCourseAction,
} from "../../actions";
import { CourseForm, ModuleCreateForm } from "../../forms";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar curso" };

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const session = await requireRole("teacher", `/professor/cursos/${id}`);
  const outline = await getCourseOutline({ id });
  if (!outline || outline.teacherId !== session.user.id) notFound();

  const lessonCount = flattenLessons(outline).length;
  const published = outline.status === "published";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/professor" className="text-sm text-fg-2 hover:text-brand-text">
          ← Meus cursos
        </Link>
        <h1 className="w-full text-2xl font-semibold">{outline.title}</h1>
        <StatusBadge status={outline.status} />
        <Link href={`/cursos/${outline.slug}`} className="text-sm text-brand-text underline">
          Ver página do curso
        </Link>
      </header>

      <section className={`${card} flex flex-col gap-4`}>
        <h2 className="text-lg font-semibold">Publicação</h2>
        <p className="text-sm text-fg-2">
          {published
            ? "O curso aparece no catálogo e aceita matrículas."
            : lessonCount === 0
              ? "Adicione ao menos uma aula para poder publicar."
              : "O curso ainda é um rascunho, visível apenas para você."}
        </p>
        <div className="flex flex-wrap gap-3">
          <form action={setCourseStatusAction.bind(null, outline.id, published ? "draft" : "published")}>
            <button className={published ? buttonOutline : button} disabled={!published && lessonCount === 0}>
              {published ? "Voltar para rascunho" : "Publicar curso"}
            </button>
          </form>
          <form action={deleteCourseAction.bind(null, outline.id)}>
            <ConfirmButton message="Excluir este curso com todos os módulos e aulas?" className={`${buttonDanger} h-10`}>
              Excluir curso
            </ConfirmButton>
          </form>
        </div>
      </section>

      <section className={`${card} flex flex-col gap-4`}>
        <h2 className="text-lg font-semibold">Informações</h2>
        <CourseForm
          action={updateCourseAction.bind(null, outline.id)}
          defaults={{ title: outline.title, description: outline.description }}
          submitLabel="Salvar informações"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Módulos e aulas</h2>
        {outline.modules.map((m, mi) => (
          <div key={m.id} className={`${card} flex flex-col gap-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-fg-2">Módulo {mi + 1}</span>
              <form action={renameModuleAction.bind(null, m.id)} className="flex flex-1 gap-2">
                <input
                  name="title"
                  defaultValue={m.title}
                  className={input}
                  required
                  maxLength={120}
                  aria-label="Título do módulo"
                />
                <button className={`${buttonSmall} h-10`}>Renomear</button>
              </form>
              <form action={moveModuleAction.bind(null, m.id, "up")}>
                <button className={buttonSmall} disabled={mi === 0} aria-label="Mover módulo para cima">
                  ↑
                </button>
              </form>
              <form action={moveModuleAction.bind(null, m.id, "down")}>
                <button
                  className={buttonSmall}
                  disabled={mi === outline.modules.length - 1}
                  aria-label="Mover módulo para baixo"
                >
                  ↓
                </button>
              </form>
              <form action={deleteModuleAction.bind(null, m.id)}>
                <ConfirmButton message="Excluir este módulo e todas as suas aulas?" className={buttonDanger}>
                  Excluir
                </ConfirmButton>
              </form>
            </div>

            <ol className="flex flex-col divide-y divide-line">
              {m.lessons.map((l, li) => (
                <li key={l.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <span className="flex-1">
                    {li + 1}. {l.title}
                    {l.videoProvider && (
                      <span className="ml-2 text-xs text-fg-2">
                        ({l.videoProvider === "youtube" ? "YouTube" : "Vimeo"})
                      </span>
                    )}
                  </span>
                  <Link href={`/professor/cursos/${outline.id}/aulas/${l.id}`} className={buttonSmall}>
                    Editar
                  </Link>
                  <form action={moveLessonAction.bind(null, l.id, "up")}>
                    <button className={buttonSmall} disabled={li === 0} aria-label="Mover aula para cima">
                      ↑
                    </button>
                  </form>
                  <form action={moveLessonAction.bind(null, l.id, "down")}>
                    <button
                      className={buttonSmall}
                      disabled={li === m.lessons.length - 1}
                      aria-label="Mover aula para baixo"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteLessonAction.bind(null, l.id)}>
                    <ConfirmButton message="Excluir esta aula?" className={buttonDanger}>
                      Excluir
                    </ConfirmButton>
                  </form>
                </li>
              ))}
              {m.lessons.length === 0 && <li className="py-2 text-sm text-fg-2">Nenhuma aula neste módulo.</li>}
            </ol>
            <Link
              href={`/professor/cursos/${outline.id}/aulas/nova?modulo=${m.id}`}
              className={`${buttonOutline} self-start`}
            >
              Adicionar aula
            </Link>
          </div>
        ))}
        <ModuleCreateForm action={createModuleAction.bind(null, outline.id)} />
      </section>
    </div>
  );
}
