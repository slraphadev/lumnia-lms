import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseOutline } from "@/lib/courses";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/session";
import { saveLessonAction } from "../../../../actions";
import { LessonForm } from "../../../../forms";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ modulo?: string }> };

export const metadata: Metadata = { title: "Nova aula" };

export default async function NewLessonPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { modulo } = await searchParams;
  if (!isUuid(id)) notFound();
  const session = await requireRole("teacher", `/professor/cursos/${id}`);
  const outline = await getCourseOutline({ id });
  if (!outline || outline.teacherId !== session.user.id) notFound();
  if (outline.modules.length === 0) redirect(`/professor/cursos/${id}`);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href={`/professor/cursos/${id}`} className="text-sm text-fg-2 hover:text-brand-text">
        ← {outline.title}
      </Link>
      <h1 className="text-2xl font-semibold">Nova aula</h1>
      <LessonForm
        action={saveLessonAction.bind(null, id, null)}
        modules={outline.modules}
        defaults={{ moduleId: outline.modules.find((m) => m.id === modulo)?.id }}
        submitLabel="Criar aula"
      />
    </div>
  );
}
