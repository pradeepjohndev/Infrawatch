import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";

export default function Theme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2.5 border rounded-2xl">
      {theme === "light" ? (
        <span className="inline-flex items-center gap-1">
          <MoonIcon /> Dark theme
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <SunIcon /> Light theme
        </span>
      )}    </button>
  );
}
