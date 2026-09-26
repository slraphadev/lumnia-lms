import type { CourseOutline } from "@/lib/courses";
import { isEnrolled } from "@/lib/courses";
import type { getSession } from "@/lib/session";

type Session = Awaited<ReturnType<typeof getSession>>;

export async function getCourseAccess(outline: CourseOutline, session: Session) {
  const isOwner = session?.user.id === outline.teacherId;
  const enrolled = session ? await isEnrolled(session.user.id, outline.id) : false;
  return {
    isOwner,
    enrolled,
    /** Rascunhos só aparecem para o dono e para quem já estava matriculado. */
    visible: outline.status === "published" || isOwner || enrolled,
    canLearn: isOwner || enrolled,
  };
}
