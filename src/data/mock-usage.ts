export interface AgentUsage {
  agentId: string;
  sessions: number;
  tokens: number;
}

export interface WorkspaceUsage {
  /** Last 14 days, oldest first; the final entry is today. */
  dailyTokens: number[];
  perAgent: AgentUsage[];
  monthTokens: number;
  planLimit: number;
  estSpend: string;
}

const USAGE: Record<string, WorkspaceUsage> = {
  "ws-marketing": {
    dailyTokens: [
      312_400, 588_100, 421_900, 702_300, 512_800, 148_200, 96_400, 634_500, 891_200, 745_600,
      403_100, 987_300, 662_800, 547_700,
    ],
    perAgent: [
      { agentId: "agent-campaign-analyst", sessions: 34, tokens: 6_120_000 },
      { agentId: "agent-creative-performance", sessions: 21, tokens: 5_480_000 },
      { agentId: "agent-launch-calendar", sessions: 12, tokens: 2_600_000 },
    ],
    monthTokens: 14_200_000,
    planLimit: 2_000_000_000,
    estSpend: "$12.40",
  },
  "ws-tech": {
    dailyTokens: [
      1_420_000, 980_500, 1_711_300, 1_204_800, 655_100, 210_900, 188_600, 1_530_200, 1_812_400,
      1_366_700, 1_940_800, 1_133_500, 875_200, 1_248_900,
    ],
    perAgent: [
      { agentId: "agent-product-owner", sessions: 58, tokens: 11_340_000 },
      { agentId: "agent-code-reviewer", sessions: 44, tokens: 8_910_000 },
      { agentId: "agent-sre", sessions: 9, tokens: 2_150_000 },
    ],
    monthTokens: 22_400_000,
    planLimit: 2_000_000_000,
    estSpend: "$19.85",
  },
};

const EMPTY_USAGE: WorkspaceUsage = {
  dailyTokens: Array(14).fill(0),
  perAgent: [],
  monthTokens: 0,
  planLimit: 2_000_000_000,
  estSpend: "$0.00",
};

/** Usage for a workspace; freshly created workspaces report zeros. */
export function getWorkspaceUsage(workspaceId: string): WorkspaceUsage {
  return USAGE[workspaceId] ?? EMPTY_USAGE;
}

/** 547700 → "547.7K", 14200000 → "14.2M", 2000000000 → "2B" */
export function formatTokens(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}K`;
  }
  return String(n);
}
