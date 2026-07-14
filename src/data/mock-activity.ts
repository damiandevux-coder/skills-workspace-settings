import {
  UserPlus,
  FileUp,
  MessageSquare,
  Bot,
  CheckCircle2,
  RotateCw,
  Wrench,
} from "lucide-react";

export interface ActivityEntry {
  id: string;
  icon: React.ElementType;
  /** Tinted icon color (hex). */
  color: string;
  /** Rich text: `strong` parts render emphasized. */
  parts: { text: string; strong?: boolean }[];
  timestamp: string;
}

/**
 * Per-workspace activity feed. Entries are hand-derived from the mock data's
 * own dates (invites, file uploads, session activity) so the story stays
 * coherent with what the rest of the app shows.
 */
const ACTIVITY: Record<string, ActivityEntry[]> = {
  "ws-marketing": [
    {
      id: "act-m1",
      icon: MessageSquare,
      color: "#4ade80",
      parts: [
        { text: "Campaign Analyst", strong: true },
        { text: " was active in " },
        { text: "Main Session", strong: true },
      ],
      timestamp: "2026-07-14T08:12:00Z",
    },
    {
      id: "act-m2",
      icon: MessageSquare,
      color: "#4ade80",
      parts: [
        { text: "Creative Performance Agent", strong: true },
        { text: " resumed " },
        { text: "Main Session", strong: true },
      ],
      timestamp: "2026-07-14T07:40:00Z",
    },
    {
      id: "act-m3",
      icon: CheckCircle2,
      color: "#4ade80",
      parts: [
        { text: "Campaign Analyst", strong: true },
        { text: " finished " },
        { text: "Q3 spend deep-dive", strong: true },
      ],
      timestamp: "2026-07-13T10:05:00Z",
    },
    {
      id: "act-m4",
      icon: Wrench,
      color: "#f5c45e",
      parts: [
        { text: "github", strong: true },
        { text: " skill confirmed Active on " },
        { text: "Campaign Analyst", strong: true },
      ],
      timestamp: "2026-07-11T09:20:00Z",
    },
    {
      id: "act-m5",
      icon: FileUp,
      color: "#60a5fa",
      parts: [
        { text: "Competitor Analysis.pdf", strong: true },
        { text: " uploaded to " },
        { text: "Campaign Research", strong: true },
      ],
      timestamp: "2026-07-07T15:30:00Z",
    },
    {
      id: "act-m6",
      icon: UserPlus,
      color: "#a78bfa",
      parts: [
        { text: "jessica@hypercli.com", strong: true },
        { text: " invited as " },
        { text: "Member", strong: true },
      ],
      timestamp: "2026-07-09T09:00:00Z",
    },
    {
      id: "act-m7",
      icon: RotateCw,
      color: "#f5c45e",
      parts: [
        { text: "Focus Group Notes.docx", strong: true },
        { text: " conversion failed — retry available" },
      ],
      timestamp: "2026-07-05T17:45:00Z",
    },
  ],
  "ws-tech": [
    {
      id: "act-t1",
      icon: MessageSquare,
      color: "#4ade80",
      parts: [
        { text: "Product Owner", strong: true },
        { text: " was active in " },
        { text: "Main Session", strong: true },
      ],
      timestamp: "2026-07-14T06:55:00Z",
    },
    {
      id: "act-t2",
      icon: CheckCircle2,
      color: "#4ade80",
      parts: [
        { text: "Code Reviewer", strong: true },
        { text: " completed a review pass in " },
        { text: "Main Session", strong: true },
      ],
      timestamp: "2026-07-13T18:20:00Z",
    },
    {
      id: "act-t3",
      icon: MessageSquare,
      color: "#4ade80",
      parts: [
        { text: "Product Owner", strong: true },
        { text: " drafted " },
        { text: "H2 roadmap draft", strong: true },
      ],
      timestamp: "2026-07-09T09:30:00Z",
    },
    {
      id: "act-t4",
      icon: UserPlus,
      color: "#a78bfa",
      parts: [
        { text: "dylan@hypercli.com", strong: true },
        { text: " invited as " },
        { text: "Viewer", strong: true },
      ],
      timestamp: "2026-07-08T16:00:00Z",
    },
    {
      id: "act-t5",
      icon: Bot,
      color: "#60a5fa",
      parts: [
        { text: "SRE Agent", strong: true },
        { text: " went offline after maintenance window" },
      ],
      timestamp: "2026-07-02T22:10:00Z",
    },
  ],
};

export function getWorkspaceActivity(workspaceId: string): ActivityEntry[] {
  return ACTIVITY[workspaceId] ?? [];
}
