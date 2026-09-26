import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-6 text-sm text-fg-2">
        <Logo type="simple" height={28} className="text-fg-2" />
        <span>© {new Date().getFullYear()} Lumnia</span>
      </div>
    </footer>
  );
}
