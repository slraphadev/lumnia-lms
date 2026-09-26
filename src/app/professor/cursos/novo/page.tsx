import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { createCourseAction } from "../../actions";
import { CourseForm } from "../../forms";

export const metadata: Metadata = { title: "Novo curso" };

export default async function NewCoursePage() {
  await requireRole("teacher", "/professor/cursos/novo");
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Novo curso</h1>
      <CourseForm action={createCourseAction} submitLabel="Criar curso" />
    </div>
  );
}
