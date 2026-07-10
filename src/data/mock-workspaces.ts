import { Workspace } from "@/types/workspaces";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-marketing",
    name: "Marketing",
    emoji: "🟣",
    color: "#a78bfa",
    agents: [
      { id: "agent-copywriter", name: "Copywriter", status: "ready" },
      { id: "agent-brand-analyst", name: "Brand Analyst", status: "busy" },
    ],
    members: [
      { id: "mem-1", email: "sarah@hypercli.com", name: "Sarah Chen", role: "admin", status: "active", invitedAt: "2026-06-01T10:00:00Z", joinedAt: "2026-06-01T10:05:00Z" },
      { id: "mem-2", email: "mike@hypercli.com", name: "Mike Ross", role: "editor", status: "active", invitedAt: "2026-06-15T14:00:00Z", joinedAt: "2026-06-15T14:30:00Z" },
      { id: "mem-3", email: "jessica@hypercli.com", name: "Jessica Pearson", role: "member", status: "pending", invitedAt: "2026-07-09T09:00:00Z" },
    ],
    knowledgeBases: [
      {
        id: "kb-brand-assets",
        name: "Brand Assets",
        description: "Logos, color palettes, typography, and brand guidelines",
        emoji: "🎨",
        items: [
          { id: "mk-logo", name: "hyperclaw-logo.svg", type: "file", size: "12 KB", modified: "2026-05-15", status: "ready" },
          { id: "mk-colors", name: "Color Palette.md", type: "file", size: "8 KB", modified: "2026-05-15", status: "ready" },
          { id: "mk-typography", name: "Typography.md", type: "file", size: "15 KB", modified: "2026-05-20", status: "ready" },
        ],
        assignedAgents: ["Copywriter"],
      },
      {
        id: "kb-campaign-research",
        name: "Campaign Research",
        description: "Competitor analysis, focus groups, and Q3 campaign briefs",
        emoji: "📊",
        items: [
          { id: "mk-competitors", name: "Competitor Analysis.pdf", type: "file", size: "1.2 MB", modified: "2026-07-07", status: "processing" },
          {
            id: "mk-briefs",
            name: "Q3 Briefs",
            type: "folder",
            modified: "2026-07-08",
            children: [
              { id: "mk-brief-launch", name: "Launch Brief.docx", type: "file", size: "88 KB", modified: "2026-07-08", status: "queued" },
              { id: "mk-brief-social", name: "Social Campaign.md", type: "file", size: "24 KB", modified: "2026-07-06", status: "ready" },
            ],
          },
          { id: "mk-focus-group", name: "Focus Group Notes.docx", type: "file", size: "310 KB", modified: "2026-07-05", status: "failed" },
        ],
        assignedAgents: ["Copywriter", "Brand Analyst"],
      },
    ],
  },
  {
    id: "ws-tech",
    name: "Tech",
    emoji: "🔵",
    color: "#60a5fa",
    agents: [
      { id: "agent-product-owner", name: "Product Owner", status: "ready" },
      { id: "agent-code-reviewer", name: "Code Reviewer", status: "ready" },
      { id: "agent-sre", name: "SRE Agent", status: "offline" },
    ],
    members: [
      { id: "mem-4", email: "damian@hypercli.com", name: "Damian Medinas", role: "admin", status: "active", invitedAt: "2026-05-01T08:00:00Z", joinedAt: "2026-05-01T08:10:00Z" },
      { id: "mem-5", email: "francisco@hypercli.com", name: "Francisco Molina", role: "editor", status: "active", invitedAt: "2026-05-10T11:00:00Z", joinedAt: "2026-05-10T11:15:00Z" },
      { id: "mem-6", email: "dylan@hypercli.com", name: "Dylan Allynder", role: "viewer", status: "pending", invitedAt: "2026-07-08T16:00:00Z" },
    ],
    knowledgeBases: [
      {
        id: "kb-api-docs",
        name: "API Documentation",
        description: "Internal API references, endpoints, and integration guides",
        emoji: "🔌",
        items: [
          { id: "tk-openapi", name: "openapi.yaml", type: "file", size: "156 KB", modified: "2026-06-22", status: "ready" },
          {
            id: "tk-guides",
            name: "Integration Guides",
            type: "folder",
            modified: "2026-06-15",
            children: [
              { id: "tk-auth", name: "Authentication.md", type: "file", size: "22 KB", modified: "2026-06-15", status: "ready" },
              { id: "tk-limits", name: "Rate Limits.md", type: "file", size: "18 KB", modified: "2026-06-14", status: "ready" },
            ],
          },
        ],
        assignedAgents: ["Product Owner", "Code Reviewer"],
      },
      {
        id: "kb-runbooks",
        name: "Runbooks",
        description: "Operational procedures, incident response, and troubleshooting",
        emoji: "📋",
        items: [
          { id: "tk-incident", name: "Incident Response.md", type: "file", size: "67 KB", modified: "2026-06-01", status: "ready" },
          { id: "tk-deploy", name: "Deployment Procedures.md", type: "file", size: "54 KB", modified: "2026-05-28", status: "processing" },
        ],
        assignedAgents: ["SRE Agent"],
      },
    ],
  },
];
