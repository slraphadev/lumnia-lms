"use client";

import { useActionState, useState } from "react";
import { button, errorText, input, label, textarea } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import { parseVideoUrl } from "@/lib/video";
import type { FormState } from "@/lib/form";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function CourseForm({
  action,
  defaults,
  submitLabel,
}: {
  action: Action;
  defaults?: { title: string; description: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={label}>Título</span>
        <input name="title" className={input} defaultValue={state?.values?.title ?? defaults?.title} required minLength={3} maxLength={120} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>Descrição</span>
        <textarea name="description" className={textarea} rows={4} defaultValue={state?.values?.description ?? defaults?.description} maxLength={2000} />
      </label>
      {state?.error && <p className={errorText} role="alert">{state.error}</p>}
      {state && !state.error && !pending && <p className="text-sm text-success">Alterações salvas.</p>}
      <button className={`${button} self-start`} disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}

export function ModuleCreateForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input name="title" className={input} defaultValue={state?.values?.title} placeholder="Título do novo módulo" required maxLength={120} aria-label="Título do novo módulo" />
        <button className={`${button} shrink-0`} disabled={pending}>
          Adicionar módulo
        </button>
      </div>
      {state?.error && <p className={errorText} role="alert">{state.error}</p>}
    </form>
  );
}

export function LessonForm({
  action,
  modules,
  defaults,
  submitLabel,
}: {
  action: Action;
  modules: { id: string; title: string }[];
  defaults: { moduleId?: string; title?: string; content?: string; videoUrl?: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [videoUrl, setVideoUrl] = useState(defaults.videoUrl ?? "");
  const video = videoUrl.trim() ? parseVideoUrl(videoUrl) : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={label}>Módulo</span>
        <select name="moduleId" className={input} defaultValue={state?.values?.moduleId ?? defaults.moduleId} required>
          {modules.map((m, i) => (
            <option key={m.id} value={m.id}>
              {i + 1}. {m.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>Título da aula</span>
        <input name="title" className={input} defaultValue={state?.values?.title ?? defaults.title} required maxLength={120} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>Link do vídeo (YouTube ou Vimeo, opcional)</span>
        <input
          name="videoUrl"
          className={input}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          inputMode="url"
        />
        {videoUrl.trim() && (
          <span className={`text-sm ${video ? "text-success" : "text-danger"}`} aria-live="polite">
            {video
              ? `Vídeo do ${video.provider === "youtube" ? "YouTube" : "Vimeo"} detectado.`
              : "Link não reconhecido. Use um link do YouTube ou do Vimeo."}
          </span>
        )}
      </label>
      {video && <VideoPlayer {...video} title="Pré-visualização do vídeo" />}
      <label className="flex flex-col gap-2">
        <span className={label}>Texto da aula (opcional)</span>
        <textarea name="content" className={textarea} rows={8} defaultValue={state?.values?.content ?? defaults.content} maxLength={20000} />
      </label>
      {state?.error && <p className={errorText} role="alert">{state.error}</p>}
      <button className={`${button} self-start`} disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}
