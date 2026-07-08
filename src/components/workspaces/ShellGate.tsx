"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";

/**
 * Routes under /workspaces bring their own shell (WorkspaceAppShell via their
 * layout); everything else keeps the classic AppShell. Keeps existing pages
 * byte-identical while letting the prototype own its chrome.
 */
export function ShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/workspaces")) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
