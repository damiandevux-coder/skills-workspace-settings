import { WorkspaceAppShell } from "@/components/workspaces/WorkspaceAppShell";

// WorkspaceProvider is now hoisted to the root layout so the workspace selector
// and active-workspace state are shared across every route.
export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceAppShell>{children}</WorkspaceAppShell>;
}
