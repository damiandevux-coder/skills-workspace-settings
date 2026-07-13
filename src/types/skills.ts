export interface WorkspaceSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  requiresEnv: string[];
  requiresBins: string[];
  os: string[];
  installHints: string[];
  disabled: boolean;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
  /** Lifecycle for created/imported skills. Bundled skills carry no status. */
  status?: "preview" | "active";
  origin?: "bundled" | "created" | "imported";
  /** Markdown body for created/imported skills (used as detail overview). */
  instructions?: string;
  /** Proof recorded when the user confirms the skill worked in a session. */
  confirmedUse?: { agent: string; prompt: string } | null;
}

export interface SkillFormData {
  name: string;
  description: string;
  emoji: string;
  homepage: string;
  userInvocable: boolean;
  disableModelInvocation: boolean;
  instructions: string;
  requiresBins: string[];
  requiresEnv: string[];
  os: string[];
}

export const SKILL_CATEGORIES = [
  "Platform",
  "Media",
  "System",
  "Productivity",
  "Hardware",
  "Lookups",
  "Authoring",
  "General",
] as const;

export const EMOJI_OPTIONS = [
  "🔧", "⚙️", "📊", "💬", "🐙", "☔", "🧭", "🔍", "📁", "🎨",
  "🎵", "🎬", "📷", "🔐", "🌐", "📡", "⚡", "🛠️", "📋", "🤖",
];

export const OS_OPTIONS = [
  { value: "darwin", label: "macOS" },
  { value: "linux", label: "Linux" },
  { value: "win32", label: "Windows" },
];

export interface SkillFile {
  name: string;
  type: "script" | "reference" | "asset" | "skill";
  size?: string;
  content?: string;
}

export interface SkillDetail extends WorkspaceSkill {
  overview: string; // Markdown content from SKILL.md
  files: SkillFile[];
  relatedSkills: string[]; // IDs of related skills
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  emoji?: string;
  size?: string;
  modified?: string;
  children?: KnowledgeItem[];
  content?: string;
  /** Conversion lifecycle for files. Absent means ready. Folders never carry a status. */
  status?: "ready" | "processing" | "queued" | "failed";
}

export interface SharedKnowledge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  items: KnowledgeItem[];
  assignedAgents: string[];
}
