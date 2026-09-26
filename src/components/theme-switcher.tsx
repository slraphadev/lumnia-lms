import { setThemeAction } from "@/app/theme-actions";
import { getTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Tema claro",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: "system",
    label: "Tema do sistema",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Tema escuro",
    icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  },
];

export async function ThemeSwitcher() {
  const current = await getTheme();
  return (
    <form action={setThemeAction} className="flex rounded-full border border-line p-0.5" aria-label="Tema">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          name="theme"
          value={option.value}
          aria-label={option.label}
          aria-pressed={current === option.value}
          title={option.label}
          className={`grid size-7 place-items-center rounded-full ${
            current === option.value ? "bg-brand-soft text-brand-text" : "text-fg-2 hover:text-fg"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {option.icon}
          </svg>
        </button>
      ))}
    </form>
  );
}
