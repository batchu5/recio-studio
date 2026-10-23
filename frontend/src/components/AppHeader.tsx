import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";

// Top bar for the signed-in app pages: logo, theme toggle and page-specific actions.
export default function AppHeader({ children }: { children?: React.ReactNode }) {
  const { isDark, toggle } = useTheme();
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link to="/" aria-label="Recio home"><Logo /></Link>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={toggle} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {children}
        </div>
      </div>
    </header>
  );
}
