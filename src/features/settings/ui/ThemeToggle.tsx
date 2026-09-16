"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../model/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "فعال کردن حالت روشن" : "فعال کردن حالت تاریک"}
      className="btn btn-secondary !p-2.5"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
