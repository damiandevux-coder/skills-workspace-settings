import { SharedKnowledge } from "./skills";

export type WorkspaceMemberRole = "admin" | "editor" | "member" | "viewer";

export interface WorkspaceMember {
  id: string;
  email: string;
  name?: string;
  role: WorkspaceMemberRole;
  status: "pending" | "active";
  avatar?: string;
  invitedAt: string;
  joinedAt?: string;
}

export interface WorkspaceAgent {
  id: string;
  name: string;
  status: "ready" | "busy" | "offline";
}

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  color: string; // accent hex used to tint the switcher avatar
  defaultInviteRole?: WorkspaceMemberRole; // role preselected in the invite modal
  agents: WorkspaceAgent[];
  knowledgeBases: SharedKnowledge[];
  members: WorkspaceMember[];
}

export const WORKSPACE_EMOJI_OPTIONS = ["🟣", "🔵", "🟢", "🟠", "🎨", "🚀", "🧠", "📣"];

export const WORKSPACE_COLOR_OPTIONS = [
  "#a78bfa",
  "#60a5fa",
  "#4ade80",
  "#fb923c",
  "#f472b6",
  "#f5c45e",
];
