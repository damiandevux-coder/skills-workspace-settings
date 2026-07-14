import { Workspace } from "@/types/workspaces";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-marketing",
    name: "Marketing",
    emoji: "🟣",
    color: "#a78bfa",
    agents: [
      {
        id: "agent-campaign-analyst",
        name: "Campaign Analyst",
        status: "ready",
        role: "Data Analyst",
        specialtyId: "data-analyst",
        sessions: [
          { id: "sess-ca-main", title: "Main Session", createdAt: "2026-07-01T09:00:00Z", lastActiveAt: "2026-07-14T08:12:00Z" },
          { id: "sess-ca-q3", title: "Q3 spend deep-dive", createdAt: "2026-07-12T14:30:00Z", lastActiveAt: "2026-07-13T10:05:00Z" },
        ],
      },
      {
        id: "agent-creative-performance",
        name: "Creative Performance Agent",
        status: "busy",
        role: "UX Researcher",
        specialtyId: "ux-researcher",
        sessions: [
          { id: "sess-cp-main", title: "Main Session", createdAt: "2026-06-20T11:00:00Z", lastActiveAt: "2026-07-14T07:40:00Z" },
          { id: "sess-cp-banners", title: "Banner A/B readout", createdAt: "2026-07-10T16:00:00Z" },
        ],
      },
      {
        id: "agent-launch-calendar",
        name: "Launch Calendar Agent",
        status: "ready",
        role: "Product Owner",
        specialtyId: "product-owner",
        sessions: [
          { id: "sess-lc-main", title: "Main Session", createdAt: "2026-07-05T08:00:00Z", lastActiveAt: "2026-07-11T15:22:00Z" },
        ],
      },
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
        assignedAgents: ["agent-campaign-analyst"],
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
        assignedAgents: ["agent-campaign-analyst", "agent-creative-performance"],
      },
    ],
  },
  {
    id: "ws-tech",
    name: "Tech",
    emoji: "🔵",
    color: "#60a5fa",
    agents: [
      {
        id: "agent-product-owner",
        name: "Product Owner",
        status: "ready",
        role: "Product Owner",
        specialtyId: "product-owner",
        sessions: [
          { id: "sess-po-main", title: "Main Session", createdAt: "2026-05-02T09:00:00Z", lastActiveAt: "2026-07-14T06:55:00Z" },
          { id: "sess-po-roadmap", title: "H2 roadmap draft", createdAt: "2026-07-08T13:00:00Z", lastActiveAt: "2026-07-09T09:30:00Z" },
        ],
      },
      {
        id: "agent-code-reviewer",
        name: "Code Reviewer",
        status: "ready",
        role: "Full-Stack Developer",
        specialtyId: "fullstack-dev",
        sessions: [
          { id: "sess-cr-main", title: "Main Session", createdAt: "2026-05-12T10:00:00Z", lastActiveAt: "2026-07-13T18:20:00Z" },
        ],
      },
      {
        id: "agent-sre",
        name: "SRE Agent",
        status: "offline",
        role: "DevOps Engineer",
        specialtyId: "devops-engineer",
        sessions: [
          { id: "sess-sre-main", title: "Main Session", createdAt: "2026-06-01T07:00:00Z", lastActiveAt: "2026-07-02T22:10:00Z" },
        ],
      },
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
        assignedAgents: ["agent-product-owner", "agent-code-reviewer"],
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
        assignedAgents: ["agent-sre"],
      },
    ],
  },
];
