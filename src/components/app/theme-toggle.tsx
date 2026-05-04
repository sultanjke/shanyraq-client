"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

let transitionTimeout: number | undefined;

function syncTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem("shanyraq-theme", theme);
}

function applyTheme(theme: Theme, animate = false) {
  const root = document.documentElement;

  if (animate) {
    root.classList.add("theme-transitioning");
    window.clearTimeout(transitionTimeout);
    transitionTimeout = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 280);
  }

  syncTheme(theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("shanyraq-theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    syncTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme, true);
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="relative h-4 w-4">
        <Sun className="absolute inset-0 h-4 w-4 opacity-0 transition-opacity duration-200 dark:opacity-100" />
        <Moon className="absolute inset-0 h-4 w-4 opacity-100 transition-opacity duration-200 dark:opacity-0" />
      </span>
    </Button>
  );
}
