// app/Providers.jsx
"use client";

import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ProjectProvider } from "./ProjectContext";

export default function Providers({ children }) {
  const path = usePathname() || "";
  // Works with/without basePath
  const isAuth = /\/components\/authentication\/(login|signup|Login12314)(\/|$)/i.test(path);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* Suspense wraps all pages so hooks like useSearchParams() are safe */}
      <Suspense fallback={null /* or a small spinner */}>
        {isAuth ? children : <ProjectProvider>{children}</ProjectProvider>}
      </Suspense>
    </ThemeProvider>
  );
}
