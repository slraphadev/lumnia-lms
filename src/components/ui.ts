// Classes provisórias. Os componentes do design system (Button, Input, Badge, Card) entram depois da v0.1.
export const button =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 h-10 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50";
export const buttonOutline =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 h-10 text-sm font-medium hover:border-ring hover:text-brand-text disabled:opacity-50";
export const buttonSmall =
  "inline-flex items-center justify-center rounded-md border border-line px-2.5 h-8 text-xs font-medium hover:border-ring hover:text-brand-text disabled:opacity-40";
export const buttonDanger =
  "inline-flex items-center justify-center rounded-md px-2.5 h-8 text-xs font-medium text-danger hover:bg-danger-soft disabled:opacity-40";
export const input =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm focus:border-ring focus:shadow-focus focus:outline-none";
export const textarea =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-ring focus:shadow-focus focus:outline-none";
export const label = "text-sm font-medium";
export const card = "rounded-xl border border-line bg-surface p-5";
export const errorText = "text-sm text-danger";
