import { useState, useEffect, useCallback } from "react";

const palettes = {
  dark: {
    "--bg-main": "#0f172a",
    "--bg-card": "#1e293b",
    "--bg-sidebar": "#111827",
    "--border": "#334155",
    "--border-subtle": "#1e293b",
    "--text-primary": "#e2e8f0",
    "--text-heading": "#f8fafc",
    "--text-secondary": "#94a3b8",
    "--text-muted": "#cbd5e1",
    "--link": "#38bdf8",
    "--link-underline": "#38bdf844",
    "--shadow": "rgba(0,0,0,0.5)",
    "--grid-line": "#334155",
    "--grid-line-outer": "#475569",
    "--dot-stroke": "#0f172a",
  },
  light: {
    "--bg-main": "#f8fafc",
    "--bg-card": "#ffffff",
    "--bg-sidebar": "#f1f5f9",
    "--border": "#cbd5e1",
    "--border-subtle": "#e2e8f0",
    "--text-primary": "#1e293b",
    "--text-heading": "#0f172a",
    "--text-secondary": "#64748b",
    "--text-muted": "#475569",
    "--link": "#0284c7",
    "--link-underline": "#0284c744",
    "--shadow": "rgba(0,0,0,0.1)",
    "--grid-line": "#cbd5e1",
    "--grid-line-outer": "#94a3b8",
    "--dot-stroke": "#f8fafc",
  },
};

function applyPalette(theme) {
  const vars = palettes[theme];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    applyPalette(t);
  }, []);

  useEffect(() => {
    applyPalette(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return; // user made explicit choice, don't override
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const t = e.matches ? "dark" : "light";
      setThemeState(t);
      applyPalette(t);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { theme, setTheme, isDark: theme === "dark" };
}
