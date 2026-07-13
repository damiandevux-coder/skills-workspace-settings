import { WorkspaceSkill } from "@/types/skills";

const entry = (
  id: string,
  name: string,
  author: string,
  description: string,
  category: string,
  emoji: string,
  stars: number,
  downloads: number
): WorkspaceSkill => ({
  id,
  name,
  description,
  category,
  emoji,
  requiresEnv: [],
  requiresBins: [],
  os: [],
  installHints: [],
  disabled: false,
  hasScripts: false,
  hasReferences: false,
  hasAssets: false,
  origin: "bundled",
  author,
  stars,
  downloads,
  popularity: downloads,
});

/** Top ClawHub registry skills (real chart: names, authors, stars, downloads). */
export const CLAWHUB_LIBRARY: WorkspaceSkill[] = [
  entry("self-improving-agent", "Self-improving agent", "pskoett", "Captures learnings, errors, and corrections to enable continuous improvement.", "Agent", "🧠", 3900, 468000),
  entry("skill-vetter", "Skill Vetter", "spclaudehome", "Security-first skill vetting for AI agents. Use before installing any skill.", "Security", "🛡️", 1300, 264000),
  entry("self-improving-proactive", "Self-Improving + Proactive Agent", "ivangdavila", "Self-reflection + self-criticism + self-learning + self-organizing memory.", "Agent", "🚀", 1300, 204000),
  entry("clawhub-github", "Github", "steipete", "Interact with GitHub using the `gh` CLI. Use `gh issue`, `gh pr`, `gh run`.", "Dev Tools", "🐙", 651, 193000),
  entry("ontology", "ontology", "oswalpalash", "Typed knowledge graph for structured agent memory and composable skills.", "Data", "🕸️", 649, 193000),
  entry("clawhub-gog", "Gog", "steipete", "Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.", "Productivity", "📧", 940, 189000),
  entry("skillscan", "SkillScan", "tokauthai", "Security gate for skills. Every new skill MUST pass SkillScan before use.", "Security", "🔎", 39, 179000),
  entry("proactive-agent", "Proactive Agent", "halthelobster", "Transforms agents from task-followers into proactive partners.", "Agent", "⚡", 819, 172000),
  entry("clawhub-weather", "Weather", "steipete", "Current weather and forecasts (no API key required).", "Data", "☔", 422, 164000),
  entry("multi-search-engine", "Multi Search Engine", "gpyangyoujun", "Multi search integration with 16 engines (7 CN + 9 Global).", "Search", "🔍", 749, 157000),
];
