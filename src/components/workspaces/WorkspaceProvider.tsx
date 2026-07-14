"use client";

import React, { createContext, useContext, useState } from "react";
import { Workspace, WorkspaceAgent, WorkspaceMember, WorkspaceMemberRole } from "@/types/workspaces";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { MOCK_WORKSPACES } from "@/data/mock-workspaces";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  switchWorkspace: (id: string) => void;
  createWorkspace: (data: { name: string; emoji: string; color: string }) => Workspace;
  addAgent: (name: string) => void;
  addKnowledgeBase: (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => void;
  retryFile: (knowledgeBaseId: string, fileId: string) => void;
  inviteMember: (email: string, role: WorkspaceMemberRole) => void;
  removeMember: (memberId: string) => void;
  updateMemberRole: (memberId: string, role: WorkspaceMemberRole) => void;
  resendInvite: (memberId: string) => void;
  updateWorkspace: (
    patch: Partial<Pick<Workspace, "name" | "emoji" | "color" | "defaultInviteRole">>
  ) => void;
  deleteWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}

function setFileStatus(
  items: KnowledgeItem[],
  fileId: string,
  status: NonNullable<KnowledgeItem["status"]>
): KnowledgeItem[] {
  return items.map((item) => {
    if (item.id === fileId && item.type === "file") return { ...item, status };
    if (item.children) return { ...item, children: setFileStatus(item.children, fileId, status) };
    return item;
  });
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(MOCK_WORKSPACES[0].id);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  const switchWorkspace = (id: string) => setActiveWorkspaceId(id);

  const createWorkspace = (data: { name: string; emoji: string; color: string }): Workspace => {
    const ws: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      agents: [],
      knowledgeBases: [],
      members: [],
    };
    setWorkspaces((prev) => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    return ws;
  };

  const addAgent = (name: string) => {
    const agent: WorkspaceAgent = { id: `agent-${Date.now()}`, name, status: "ready" };
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspace.id ? { ...w, agents: [...w.agents, agent] } : w))
    );
  };

  const addKnowledgeBase = (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => {
    const kb: SharedKnowledge = { id: `kb-${Date.now()}`, ...data, items: [] };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id ? { ...w, knowledgeBases: [kb, ...w.knowledgeBases] } : w
      )
    );
  };

  const retryFile = (knowledgeBaseId: string, fileId: string) => {
    const workspaceId = activeWorkspace.id;
    const applyStatus = (status: NonNullable<KnowledgeItem["status"]>) =>
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                knowledgeBases: w.knowledgeBases.map((kb) =>
                  kb.id === knowledgeBaseId
                    ? { ...kb, items: setFileStatus(kb.items, fileId, status) }
                    : kb
                ),
              }
            : w
        )
      );
    applyStatus("processing");
    // Mock conversion: succeed after a short delay.
    setTimeout(() => applyStatus("ready"), 1500);
  };

  const inviteMember = (email: string, role: WorkspaceMemberRole) => {
    const member: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      email: email.trim(),
      role,
      status: "pending",
      invitedAt: new Date().toISOString(),
    };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id ? { ...w, members: [...w.members, member] } : w
      )
    );
  };

  const removeMember = (memberId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? { ...w, members: w.members.filter((m) => m.id !== memberId) }
          : w
      )
    );
  };

  const resendInvite = (memberId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? {
              ...w,
              members: w.members.map((m) =>
                m.id === memberId && m.status === "pending"
                  ? { ...m, invitedAt: new Date().toISOString() }
                  : m
              ),
            }
          : w
      )
    );
  };

  const updateWorkspace = (
    patch: Partial<Pick<Workspace, "name" | "emoji" | "color" | "defaultInviteRole">>
  ) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspace.id ? { ...w, ...patch } : w))
    );
  };

  const deleteWorkspace = () => {
    // Guard: never delete the last workspace.
    if (workspaces.length <= 1) return;
    const deletedId = activeWorkspace.id;
    const remaining = workspaces.filter((w) => w.id !== deletedId);
    setWorkspaces(remaining);
    setActiveWorkspaceId(remaining[0].id);
  };

  const updateMemberRole = (memberId: string, role: WorkspaceMemberRole) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? {
              ...w,
              members: w.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
            }
          : w
      )
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        addAgent,
        addKnowledgeBase,
        retryFile,
        inviteMember,
        removeMember,
        updateMemberRole,
        resendInvite,
        updateWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
