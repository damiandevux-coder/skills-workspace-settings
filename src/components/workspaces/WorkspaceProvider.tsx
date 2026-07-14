"use client";

import React, { createContext, useContext, useState } from "react";
import {
  AgentSession,
  Workspace,
  WorkspaceAgent,
  WorkspaceMember,
  WorkspaceMemberRole,
} from "@/types/workspaces";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { MOCK_WORKSPACES } from "@/data/mock-workspaces";

export interface NewAgentInput {
  name: string;
  role?: string;
  specialtyId?: string;
  features?: { desktop: boolean; memory: boolean };
}

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  /** The selected agent of the active workspace (remembered per workspace). */
  activeAgent: WorkspaceAgent | null;
  selectAgent: (agentId: string) => void;
  addSession: (agentId: string, data?: { title?: string; skillId?: string }) => AgentSession;
  renameSession: (agentId: string, sessionId: string, title: string) => void;
  switchWorkspace: (id: string) => void;
  createWorkspace: (data: { name: string; emoji: string; color: string }) => Workspace;
  addAgent: (input: NewAgentInput) => void;
  addKnowledgeBase: (data: {
    name: string;
    description: string;
    emoji: string;
    assignedAgents: string[];
  }) => void;
  retryFile: (knowledgeBaseId: string, fileId: string) => void;
  addFilesToKb: (knowledgeBaseId: string, files: { name: string; size?: string }[]) => void;
  addFolderToKb: (knowledgeBaseId: string, name: string) => void;
  renameKnowledgeItem: (knowledgeBaseId: string, itemId: string, name: string) => void;
  deleteKnowledgeItem: (knowledgeBaseId: string, itemId: string) => void;
  assignAgentToKb: (knowledgeBaseId: string, agentId: string) => void;
  unassignAgentFromKb: (knowledgeBaseId: string, agentId: string) => void;
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

/** Recursively map every item in a knowledge tree. */
function mapItems(
  items: KnowledgeItem[],
  fn: (item: KnowledgeItem) => KnowledgeItem
): KnowledgeItem[] {
  return items.map((item) => {
    const mapped = fn(item);
    if (mapped.children) return { ...mapped, children: mapItems(mapped.children, fn) };
    return mapped;
  });
}

/** Recursively drop an item (and its subtree) from a knowledge tree. */
function removeItem(items: KnowledgeItem[], itemId: string): KnowledgeItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) =>
      item.children ? { ...item, children: removeItem(item.children, itemId) } : item
    );
}

function setFileStatus(
  items: KnowledgeItem[],
  fileId: string,
  status: NonNullable<KnowledgeItem["status"]>
): KnowledgeItem[] {
  return mapItems(items, (item) =>
    item.id === fileId && item.type === "file" ? { ...item, status } : item
  );
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(MOCK_WORKSPACES[0].id);
  // workspaceId → selected agentId, so switching workspaces remembers your agent.
  const [activeAgentIds, setActiveAgentIds] = useState<Record<string, string>>({});

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  const activeAgent =
    activeWorkspace.agents.find((a) => a.id === activeAgentIds[activeWorkspace.id]) ??
    activeWorkspace.agents[0] ??
    null;

  const selectAgent = (agentId: string) =>
    setActiveAgentIds((prev) => ({ ...prev, [activeWorkspace.id]: agentId }));

  const addSession = (
    agentId: string,
    data?: { title?: string; skillId?: string }
  ): AgentSession => {
    const session: AgentSession = {
      id: `sess-${Date.now()}`,
      title: data?.title?.trim() || "New Session",
      skillId: data?.skillId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? {
              ...w,
              agents: w.agents.map((a) =>
                a.id === agentId ? { ...a, sessions: [session, ...a.sessions] } : a
              ),
            }
          : w
      )
    );
    return session;
  };

  const renameSession = (agentId: string, sessionId: string, title: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? {
              ...w,
              agents: w.agents.map((a) =>
                a.id === agentId
                  ? {
                      ...a,
                      sessions: a.sessions.map((s) =>
                        s.id === sessionId
                          ? { ...s, title, lastActiveAt: new Date().toISOString() }
                          : s
                      ),
                    }
                  : a
              ),
            }
          : w
      )
    );
  };

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

  const addAgent = (input: NewAgentInput) => {
    const agent: WorkspaceAgent = {
      id: `agent-${Date.now()}`,
      name: input.name,
      status: "ready",
      role: input.role,
      specialtyId: input.specialtyId,
      features: input.features,
      sessions: [
        {
          id: `sess-${Date.now()}`,
          title: "Main Session",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspace.id ? { ...w, agents: [...w.agents, agent] } : w))
    );
    setActiveAgentIds((prev) => ({ ...prev, [activeWorkspace.id]: agent.id }));
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

  /** Apply a transform to one knowledge base of the active workspace. */
  const updateKb = (knowledgeBaseId: string, fn: (kb: SharedKnowledge) => SharedKnowledge) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspace.id
          ? {
              ...w,
              knowledgeBases: w.knowledgeBases.map((kb) =>
                kb.id === knowledgeBaseId ? fn(kb) : kb
              ),
            }
          : w
      )
    );
  };

  const addFilesToKb = (knowledgeBaseId: string, files: { name: string; size?: string }[]) => {
    const stamp = Date.now();
    const newItems: KnowledgeItem[] = files.map((f, i) => ({
      id: `file-${stamp}-${i}`,
      name: f.name,
      type: "file",
      size: f.size,
      modified: new Date().toISOString().slice(0, 10),
      status: "queued",
    }));
    updateKb(knowledgeBaseId, (kb) => ({ ...kb, items: [...newItems, ...kb.items] }));
    // Mock conversion pipeline: queued → processing → ready, staggered per file.
    newItems.forEach((item, i) => {
      setTimeout(() => {
        updateKb(knowledgeBaseId, (kb) => ({
          ...kb,
          items: setFileStatus(kb.items, item.id, "processing"),
        }));
      }, 800 + i * 400);
      setTimeout(() => {
        updateKb(knowledgeBaseId, (kb) => ({
          ...kb,
          items: setFileStatus(kb.items, item.id, "ready"),
        }));
      }, 2400 + i * 700);
    });
  };

  const addFolderToKb = (knowledgeBaseId: string, name: string) => {
    const folder: KnowledgeItem = {
      id: `folder-${Date.now()}`,
      name,
      type: "folder",
      modified: new Date().toISOString().slice(0, 10),
      children: [],
    };
    updateKb(knowledgeBaseId, (kb) => ({ ...kb, items: [folder, ...kb.items] }));
  };

  const renameKnowledgeItem = (knowledgeBaseId: string, itemId: string, name: string) => {
    updateKb(knowledgeBaseId, (kb) => ({
      ...kb,
      items: mapItems(kb.items, (item) => (item.id === itemId ? { ...item, name } : item)),
    }));
  };

  const deleteKnowledgeItem = (knowledgeBaseId: string, itemId: string) => {
    updateKb(knowledgeBaseId, (kb) => ({ ...kb, items: removeItem(kb.items, itemId) }));
  };

  const assignAgentToKb = (knowledgeBaseId: string, agentId: string) => {
    updateKb(knowledgeBaseId, (kb) =>
      kb.assignedAgents.includes(agentId)
        ? kb
        : { ...kb, assignedAgents: [...kb.assignedAgents, agentId] }
    );
  };

  const unassignAgentFromKb = (knowledgeBaseId: string, agentId: string) => {
    updateKb(knowledgeBaseId, (kb) => ({
      ...kb,
      assignedAgents: kb.assignedAgents.filter((id) => id !== agentId),
    }));
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
        activeAgent,
        selectAgent,
        addSession,
        renameSession,
        switchWorkspace,
        createWorkspace,
        addAgent,
        addKnowledgeBase,
        retryFile,
        addFilesToKb,
        addFolderToKb,
        renameKnowledgeItem,
        deleteKnowledgeItem,
        assignAgentToKb,
        unassignAgentFromKb,
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
