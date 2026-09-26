"use client";

import Link from "next/link";
import { useActionState } from "react";
import { button, errorText, input, label } from "@/components/ui";
import { signInAction, signUpAction } from "./actions";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="email" type="email" label="E-mail" autoComplete="email" defaultValue={state?.values?.email} />
      <Field name="password" type="password" label="Senha" autoComplete="current-password" />
      {state?.error && <p className={errorText} role="alert">{state.error}</p>}
      <button className={button} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-sm text-fg-2">
        Não tem conta?{" "}
        <Link href={next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"} className="text-brand-text underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field name="name" label="Nome" autoComplete="name" defaultValue={state?.values?.name} />
      <Field name="email" type="email" label="E-mail" autoComplete="email" defaultValue={state?.values?.email} />
      <Field name="password" type="password" label="Senha (mínimo 8 caracteres)" autoComplete="new-password" minLength={8} />
      <fieldset className="flex flex-col gap-2">
        <legend className={label}>Perfil</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="student" defaultChecked={state?.values?.role !== "teacher"} /> Aluno, quero fazer cursos
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="teacher" defaultChecked={state?.values?.role === "teacher"} /> Professor, quero criar cursos
        </label>
      </fieldset>
      {state?.error && <p className={errorText} role="alert">{state.error}</p>}
      <button className={button} disabled={pending}>
        {pending ? "Criando conta…" : "Criar conta"}
      </button>
      <p className="text-sm text-fg-2">
        Já tem conta?{" "}
        <Link href={next ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar"} className="text-brand-text underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

function Field(props: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { label: text, ...rest } = props;
  return (
    <label className="flex flex-col gap-2">
      <span className={label}>{text}</span>
      <input className={input} required {...rest} />
    </label>
  );
}
