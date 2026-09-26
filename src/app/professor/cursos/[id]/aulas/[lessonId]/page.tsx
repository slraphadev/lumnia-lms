import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { flattenLessons, getCourseOutline } from "@/lib/courses";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/session";
import { saveLessonAction } from "../../../../actions";
import { LessonForm } from "../../../../forms";

type Props = { params: Promise<{ id: string; lessonId: string }> };

export const metadata: Metadata = { title: "Editar aula" };

export default async function EditLessonPage({ params }: Props) {
  const { id, lessonId } = await params;
  if (!isUuid(id) || !isUuid(lessonId)) notFound();
  const session = await requireRole("teacher", `/professor/cursos/${id}`);
  const outline = await getCourseOutline({ id });
  if (!outline || outline.teacherId !== session.user.id) notFound();
  const current = flattenLessons(outline).find((l) => l.id === lessonId);
  if (!current) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href={`/professor/cursos/${id}`} className="text-sm text-fg-2 hover:text-brand-text">
        ← {outline.title}
      </Link>
      <h1 className="text-2xl font-semibold">Editar aula</h1>
      <LessonForm
        action={saveLessonAction.bind(null, id, lessonId)}
        modules={outline.modules}
        defaults={{
          moduleId: current.moduleId,
          title: current.title,
          content: current.content,
          videoUrl: current.videoUrl ?? "",
        }}
        submitLabel="Salvar aula"
      />
    </div>
  );
}
