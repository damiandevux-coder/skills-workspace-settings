import { WorkspaceProvider } from "@/components/workspaces/WorkspaceProvider";
import { WorkspaceAppShell } from "@/components/workspaces/WorkspaceAppShell";

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceAppShell>{children}</WorkspaceAppShell>
    </WorkspaceProvider>
  );
}
