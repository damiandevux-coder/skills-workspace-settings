import { Shield, Pencil, User, Eye } from "lucide-react";
import { WorkspaceMemberRole } from "@/types/workspaces";

export interface RoleConfig {
  id: WorkspaceMemberRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

/** Single source of truth for member-role presentation across pages and modals. */
export const ROLE_CONFIG: Record<WorkspaceMemberRole, RoleConfig> = {
  admin: {
    id: "admin",
    label: "Admin",
    description: "Full access. Can manage members, agents, and workspace settings.",
    icon: Shield,
    color: "#ef4444",
  },
  editor: {
    id: "editor",
    label: "Editor",
    description: "Can create and edit agents, manage knowledge bases, and run sessions.",
    icon: Pencil,
    color: "#60a5fa",
  },
  member: {
    id: "member",
    label: "Member",
    description: "Can use agents and access shared knowledge. Cannot create or delete.",
    icon: User,
    color: "#4ade80",
  },
  viewer: {
    id: "viewer",
    label: "Viewer",
    description: "Read-only access. Can view agents and knowledge but not interact.",
    icon: Eye,
    color: "#737373",
  },
};

export const ROLE_LIST: RoleConfig[] = Object.values(ROLE_CONFIG);
