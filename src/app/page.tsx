import Link from "next/link";
import { button, buttonOutline } from "@/components/ui";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const panel =
    session?.user.role === "teacher"
      ? { href: "/professor", label: "Ir para o painel do professor" }
      : { href: "/meus-cursos", label: "Continuar meus cursos" };

  return (
    <section className="flex flex-col items-start gap-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Aprenda no seu ritmo.</h1>
      <p className="max-w-xl text-lg text-fg-2">
        Cursos organizados em módulos e aulas, com o seu progresso salvo a cada passo.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/cursos" className={button}>
          Ver catálogo
        </Link>
        {session ? (
          <Link href={panel.href} className={buttonOutline}>
            {panel.label}
          </Link>
        ) : (
          <Link href="/cadastro" className={buttonOutline}>
            Criar conta
          </Link>
        )}
      </div>
    </section>
  );
}
