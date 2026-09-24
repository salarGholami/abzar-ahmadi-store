"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const isDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);

    setDark(isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;

    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);

    localStorage.setItem("theme", next ? "dark" : "light");

    setDark(next);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="تغییر تم"
        className="btn btn-secondary !p-2.5"
      >
        <Moon size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={dark ? "فعال کردن حالت روشن" : "فعال کردن حالت تاریک"}
      onClick={toggle}
      className="btn btn-secondary !p-2.5"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
