import Link from "next/link";
import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ROLE_LABELS, isRole } from "@/lib/roles";
import { getSession } from "@/lib/session";

export async function SiteHeader() {
  const session = await getSession();
  const role = session && isRole(session.user.role) ? session.user.role : null;

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="Página inicial">
          <Logo type="full" height={40} />
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-4 text-sm">
          <Link href="/cursos" className="hover:text-brand-text">
            Catálogo
          </Link>
          {role === "student" && (
            <Link href="/meus-cursos" className="hover:text-brand-text">
              Meus cursos
            </Link>
          )}
          {role === "teacher" && (
            <Link href="/professor" className="hover:text-brand-text">
              Painel do professor
            </Link>
          )}
        </nav>
        <ThemeSwitcher />
        {session ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-fg-2">
              {session.user.name}
              {role && ` · ${ROLE_LABELS[role]}`}
            </span>
            <form action={signOutAction}>
              <button className="underline hover:text-brand-text">Sair</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/entrar" className="hover:text-brand-text">
              Entrar
            </Link>
            <Link href="/cadastro" className="rounded-md bg-brand px-3 py-1.5 text-on-brand hover:bg-brand-hover">
              Criar conta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
