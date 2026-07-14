import {
  Target,
  Server,
  Shield,
  Workflow,
  BarChart3,
  Users,
  Scale,
  Code2,
  Bug,
  Upload,
} from "lucide-react";

export interface AgentSpecialty {
  id: string;
  role: string;
  tagline: string;
  description: string;
  tools: string[];
  color: string;
  icon: React.ElementType;
}

/** Specialty catalog shown in the New Agent flow. */
export const AGENT_SPECIALTIES: AgentSpecialty[] = [
  {
    id: "product-owner",
    role: "Product Owner",
    tagline: "Backlogs, roadmaps & PRDs",
    description:
      "Owns the product vision. Creates user stories, prioritizes backlogs, drafts PRDs, and tracks roadmap progress across sprints.",
    tools: ["Jira", "Linear", "Notion", "Figma"],
    color: "#f5c45e",
    icon: Target,
  },
  {
    id: "systems-engineer",
    role: "Systems Engineer",
    tagline: "Architecture, infra & scaling",
    description:
      "Designs distributed systems, manages cloud infrastructure, handles auto-scaling, and ensures high availability across services.",
    tools: ["AWS", "Terraform", "Kubernetes", "Docker"],
    color: "#4ade80",
    icon: Server,
  },
  {
    id: "security-engineer",
    role: "Security Engineer",
    tagline: "Audits, threats & compliance",
    description:
      "Performs security audits, threat modeling, compliance checks, and vulnerability assessments. Keeps your stack secure.",
    tools: ["OWASP", "Burp Suite", "Snyk", "Vault"],
    color: "#ef4444",
    icon: Shield,
  },
  {
    id: "devops-engineer",
    role: "DevOps Engineer",
    tagline: "CI/CD, deploys & monitoring",
    description:
      "Automates deployments, manages pipelines, monitors observability, and maintains infrastructure-as-code repositories.",
    tools: ["GitHub Actions", "ArgoCD", "Prometheus", "Grafana"],
    color: "#60a5fa",
    icon: Workflow,
  },
  {
    id: "data-analyst",
    role: "Data Analyst",
    tagline: "SQL, dashboards & pipelines",
    description:
      "Writes complex SQL, builds BI dashboards, designs ETL pipelines, and extracts actionable insights from raw data.",
    tools: ["dbt", "Snowflake", "BigQuery", "Metabase"],
    color: "#a78bfa",
    icon: BarChart3,
  },
  {
    id: "ux-researcher",
    role: "UX Researcher",
    tagline: "Interviews, maps & testing",
    description:
      "Conducts user interviews, builds journey maps, runs usability tests, and synthesizes qualitative feedback into design direction.",
    tools: ["Maze", "Lookback", "Figma", "Hotjar"],
    color: "#f472b6",
    icon: Users,
  },
  {
    id: "legal-specialist",
    role: "Legal Specialist",
    tagline: "Contracts, IP & regulatory",
    description:
      "Drafts and reviews contracts, checks regulatory compliance, manages IP filings, and flags legal risks in product decisions.",
    tools: ["Ironclad", "DocuSign", "LexisNexis", "Clio"],
    color: "#d4a574",
    icon: Scale,
  },
  {
    id: "fullstack-dev",
    role: "Full-Stack Developer",
    tagline: "Frontend, backend & APIs",
    description:
      "Ships features end-to-end. Builds React frontends, Node/Python backends, REST/GraphQL APIs, and manages databases.",
    tools: ["React", "Node.js", "PostgreSQL", "Prisma"],
    color: "#2dd4bf",
    icon: Code2,
  },
  {
    id: "qa-engineer",
    role: "QA Engineer",
    tagline: "Testing, automation & coverage",
    description:
      "Writes test plans, automates E2E suites, tracks bug lifecycles, and ensures releases meet quality gates before shipping.",
    tools: ["Playwright", "Cypress", "Jest", "Postman"],
    color: "#fb923c",
    icon: Bug,
  },
  {
    id: "custom",
    role: "Custom Agent",
    tagline: "Build your own specialist",
    description:
      "Define your own role, tools, and instructions. Perfect for niche domains not covered by the defaults.",
    tools: ["Any tools you configure"],
    color: "#737373",
    icon: Upload,
  },
];

/** Specialties that have a rich marketplace detail page at /agent/[id]. */
export const SPECIALTY_DETAIL_IDS = new Set([
  "product-owner",
  "systems-engineer",
  "marketing",
  "accounting",
]);
