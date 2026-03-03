import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b border-border h-14 flex items-center justify-end px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ThemeToggle />
    </header>
  );
}