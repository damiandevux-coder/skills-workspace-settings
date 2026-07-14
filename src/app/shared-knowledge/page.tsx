import { redirect } from "next/navigation";

/** Legacy route — shared knowledge is workspace-scoped now. */
export default function SharedKnowledgeRedirect() {
  redirect("/workspaces/knowledge");
}
