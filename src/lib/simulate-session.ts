import { WorkspaceSkill } from "@/types/skills";

export interface SkillReply {
  /** Short line shown in the tool-invocation chip while "running". */
  action: string;
  /** The agent's reply text, typed out in the UI. */
  text: string;
}

const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
  Platform: [
    "Check what needs my attention today",
    "Summarize the latest activity",
    "Anything urgent I should look at?",
  ],
  Lookups: [
    "Look something up for me",
    "What's the latest on this?",
    "Give me a quick status check",
  ],
  Authoring: [
    "Draft something for me using this skill",
    "Create a quick example",
    "Show me what you can produce",
  ],
  Productivity: [
    "Organize my latest items",
    "Create a new entry for today",
    "What's on my plate?",
  ],
  Media: ["Process my latest file", "Show me a preview", "Generate something visual"],
  System: ["Run a quick audit", "Check the current status", "Anything misconfigured?"],
  Hardware: ["Check the connected devices", "Capture a snapshot", "What's online right now?"],
  General: ["Show me how this skill works", "Run through a typical task", "Give it a try"],
};

const SPECIFIC_PROMPTS: Record<string, string[]> = {
  github: ["Check the failing CI on my latest PR", "List open PRs that need review", "Any new issues today?"],
  slack: ["Send a status update to the team channel", "What did I miss in #general?", "Pin the release notes message"],
  weather: ["Will it rain in Amsterdam tomorrow?", "What's the weather for my trip to Lisbon?", "Do I need a jacket today?"],
  notion: ["Create a meeting-notes page for today", "Find my roadmap database", "Add an item to my reading list"],
};

export function suggestedPrompts(skill: WorkspaceSkill): string[] {
  return (
    SPECIFIC_PROMPTS[skill.id] ??
    PROMPTS_BY_CATEGORY[skill.category] ??
    PROMPTS_BY_CATEGORY.General
  );
}

const REPLIES_BY_CATEGORY: Record<string, (skill: WorkspaceSkill, prompt: string) => SkillReply> = {
  Platform: (skill) => ({
    action: `Querying ${skill.name}`,
    text: `Done — I checked via the **${skill.name}** skill. Here's the picture:\n\n- 2 items need your attention (one flagged urgent)\n- 5 updates since yesterday, nothing blocking\n- I've noted the recurring pattern for follow-up\n\nWant me to dig into the urgent one?`,
  }),
  Lookups: (skill) => ({
    action: `Fetching data with ${skill.name}`,
    text: `Looked it up using **${skill.name}**:\n\n- Current status: all clear\n- Latest reading is within normal range\n- No changes expected in the next 24h\n\nAnything else you want me to check?`,
  }),
  Authoring: (skill) => ({
    action: `Drafting with ${skill.name}`,
    text: `Here's a first pass, produced with the **${skill.name}** skill:\n\n- Structure follows the standard template\n- I kept it minimal so you can shape the direction\n- Saved a draft copy to the workspace\n\nWant me to expand any section?`,
  }),
  System: (skill) => ({
    action: `Running ${skill.name} checks`,
    text: `Audit complete via **${skill.name}**:\n\n- 12 checks passed, 1 warning (non-critical)\n- No exposure or misconfiguration found\n- Full report saved to the workspace\n\nShall I fix the warning?`,
  }),
};

const SPECIFIC_REPLIES: Record<string, (prompt: string) => SkillReply> = {
  github: () => ({
    action: "Running gh pr checks",
    text: `Checked with the **GitHub** skill:\n\n- PR **#55** has 1 failing check — \`test (ubuntu-latest)\`, a flaky snapshot test\n- 2 PRs are waiting on your review\n- No new issues since yesterday\n\nI can re-run the failing job or open the log — which do you want?`,
  }),
  weather: () => ({
    action: "Fetching wttr.in forecast",
    text: `Via the **Weather** skill:\n\n- Tomorrow: light rain from ~14:00, 17°C\n- Morning stays dry — good window before noon\n- Wind mild, 12 km/h\n\nWant the 3-day outlook too?`,
  }),
  slack: () => ({
    action: "Calling Slack API",
    text: `Done via the **Slack** skill:\n\n- Posted the status update to the team channel\n- 3 unread threads in #general — one mentions you\n- Pinned the release notes as asked\n\nWant a summary of the thread that mentions you?`,
  }),
};

export function skillReply(skill: WorkspaceSkill, prompt: string): SkillReply {
  const specific = SPECIFIC_REPLIES[skill.id];
  if (specific) return specific(prompt);
  const byCategory = REPLIES_BY_CATEGORY[skill.category];
  if (byCategory) return byCategory(skill, prompt);
  return {
    action: `Invoking ${skill.name}`,
    text: `I ran that through the **${skill.name}** skill:\n\n- Followed the skill's instructions end to end\n- Completed without errors and captured the output\n- Logged the result in the workspace\n\nWant me to walk through what it did step by step?`,
  };
}
