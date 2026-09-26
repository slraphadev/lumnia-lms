export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="rounded-full border border-success bg-success-soft px-3 py-0.5 text-xs font-medium text-success">
      Publicado
    </span>
  ) : (
    <span className="rounded-full border border-warn bg-warn-soft px-3 py-0.5 text-xs font-medium text-warn-foreground">
      Rascunho
    </span>
  );
}
