"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Target,
  Server,
  Shield,
  Workflow,
  BarChart3,
  Users,
  Scale,
  Code2,
  Bug,
  TrendingUp,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Puzzle,
  Lock,
} from "lucide-react";

interface Skill {
  name: string;
  description: string;
  requiredIntegration?: string;
}

interface Integration {
  name: string;
  required: boolean;
  description: string;
}

interface AgentSpecialty {
  id: string;
  role: string;
  tagline: string;
  description: string;
  color: string;
  icon: React.ElementType;
  tools: string[];
  conversationExamples: ConversationExample[];
  valueProps: string[];
  skills: Skill[];
  integrations: Integration[];
}

interface ConversationExample {
  title: string;
  subtitle: string;
  messages: Message[];
}

interface Message {
  from: "human" | "agent";
  text: string;
  time?: string;
}

const AGENT_SPECIALTIES: AgentSpecialty[] = [
  {
    id: "product-owner",
    role: "Product Owner",
    tagline: "Backlogs, roadmaps & PRDs",
    description: "Owns the product vision. Creates user stories, prioritizes backlogs, drafts PRDs, and tracks roadmap progress across sprints.",
    color: "#f5c45e",
    icon: Target,
    tools: ["Jira", "Linear", "Notion", "Figma"],
    valueProps: [
      "Writes PRDs from a 5-minute voice memo",
      "Prioritizes your backlog using RICE scoring",
      "Creates user stories with acceptance criteria",
      "Tracks sprint velocity and flags blockers",
    ],
    conversationExamples: [
      {
        title: "From voice memo to PRD",
        subtitle: "Describe it. They write it.",
        messages: [
          { from: "human", text: "@product-owner We need a feature that lets enterprise customers export compliance reports. SOC 2 auditors keep asking for them. Include CSV and PDF, let them pick date ranges.", time: "9:14 AM" },
          { from: "agent", text: "Got it. Drafting the PRD now.\n\n**Enterprise Compliance Export**\n- CSV + PDF export for audit trails\n- Date range picker (max 12 months)\n- Role-based access (Admin/Compliance Officer)\n- SOC 2 Type II aligned formatting\n\nI've created the Linear issues, added them to the current sprint, and linked the Figma spec. Ready for review.", time: "9:16 AM" },
        ],
      },
      {
        title: "Backlog triage",
        subtitle: "RICE scoring on autopilot",
        messages: [
          { from: "human", text: "@product-owner We have 47 un-triaged issues in Linear. Can you score and stack-rank them?", time: "2:30 PM" },
          { from: "agent", text: "Done. Scored all 47 using RICE:\n\n**Top 5 this quarter:**\n1. API rate limiting (RICE: 96)\n2. Dark mode support (RICE: 84)\n3. Webhook retries (RICE: 78)\n4. CSV import (RICE: 72)\n5. Mobile nav refactor (RICE: 68)\n\nI've updated priorities in Linear and added the top 10 to the roadmap board.", time: "2:34 PM" },
        ],
      },
    ],
    skills: [
      { name: "Backlog Management", description: "Organize, prioritize, and maintain your product backlog with automated scoring and categorization." },
      { name: "PRD Writer", description: "Draft comprehensive product requirement documents from voice memos, Slack threads, or brief descriptions." },
      { name: "Roadmap Tracker", description: "Visualize and track roadmap progress across quarters, flagging delays and resource conflicts." },
      { name: "Sprint Planner", description: "Plan sprints by capacity, velocity, and dependency analysis. Auto-suggests optimal team allocation." },
      { name: "User Story Creator", description: "Write user stories with acceptance criteria, edge cases, and test scenarios." },
      { name: "Competitor Analysis", description: "Monitor competitor releases, pricing changes, and feature gaps. Weekly battlecards delivered." },
      { name: "Release Notes", description: "Auto-generate release notes from merged PRs, Linear issues, and commit messages." },
      { name: "Stakeholder Updates", description: "Weekly executive summaries with roadmap progress, blockers, and upcoming milestones." },
      { name: "Metrics Dashboard", description: "Track DAU, retention, funnel conversion, and feature adoption with automated insights." },
    ],
    integrations: [
      { name: "Jira", required: false, description: "Create issues, update statuses, and sync sprint data" },
      { name: "Linear", required: false, description: "Full issue lifecycle management and roadmap sync" },
      { name: "Notion", required: false, description: "PRDs, docs, and knowledge base management" },
      { name: "Figma", required: false, description: "Link specs, comment on designs, track design handoff" },
      { name: "Slack", required: false, description: "Daily standups, alerts, and stakeholder notifications" },
    ],
  },
  {
    id: "systems-engineer",
    role: "Senior Systems Engineer",
    tagline: "Architecture, infra & scaling",
    description: "Designs distributed systems, manages cloud infrastructure, handles auto-scaling, and ensures high availability across services.",
    color: "#4ade80",
    icon: Server,
    tools: ["AWS", "Terraform", "Kubernetes", "Docker"],
    valueProps: [
      "Designs architecture from a Slack thread",
      "Writes Terraform modules with best practices",
      "Debugs production issues with root cause analysis",
      "Plans zero-downtime migrations",
    ],
    conversationExamples: [
      {
        title: "Architecture review",
        subtitle: "Design it in the chat",
        messages: [
          { from: "human", text: "@systems-engineer We're moving from monolith to microservices. Need a plan for splitting the billing service. Current stack: Node.js, PostgreSQL, Redis, deployed on ECS.", time: "10:00 AM" },
          { from: "agent", text: "Here's the migration plan:\n\n**Phase 1: Strangler Fig**\n- Deploy billing service as standalone container\n- Route traffic via API gateway (10% → 50% → 100%)\n- Keep monolith DB as read replica\n\n**Phase 2: Data Migration**\n- Set up billing-specific PostgreSQL cluster\n- Dual-write pattern for 2 weeks\n- Verify consistency with shadow reads\n\n**Phase 3: Cleanup**\n- Remove billing code from monolith\n- Archive old tables\n\nI've created the Terraform modules and opened a PR with the initial service scaffold.", time: "10:05 AM" },
        ],
      },
      {
        title: "Incident response",
        subtitle: "3 AM page? They handle it.",
        messages: [
          { from: "human", text: "@systems-engineer PagerDuty just fired — API latency spiked to 8s. Can you investigate?", time: "3:12 AM" },
          { from: "agent", text: "On it. Checking logs now...\n\n**Root cause found:**\nRedis connection pool exhausted. Connection leak in the auth middleware — not releasing clients on token validation failure.\n\n**Immediate fix:**\n- Restarted Redis with connection timeout of 30s\n- Deployed hotfix to auth service (PR #442)\n- Latency back to 120ms p99\n\n**Prevention:**\n- Added connection leak detector to CI\n- Created runbook for future incidents\n\nAll clear. I'm monitoring for 30 minutes.", time: "3:18 AM" },
        ],
      },
    ],
    skills: [
      { name: "Infrastructure Design", description: "Design distributed systems, microservices, and cloud architectures from requirements." },
      { name: "Terraform Modules", description: "Write reusable, production-grade Terraform modules with state management and drift detection." },
      { name: "Kubernetes Management", description: "Deploy, scale, and debug Kubernetes clusters. Helm charts, operators, and ingress config." },
      { name: "Incident Response", description: "Investigate alerts, find root causes, deploy hotfixes, and write post-mortems." },
      { name: "Performance Optimization", description: "Profile bottlenecks, optimize queries, tune caches, and reduce latency." },
      { name: "Cost Analysis", description: "Analyze cloud spend, identify waste, and right-size resources. Monthly savings reports." },
      { name: "Disaster Recovery", description: "Design backup strategies, run recovery drills, and maintain RTO/RPO documentation." },
    ],
    integrations: [
      { name: "AWS", required: false, description: "EC2, RDS, S3, CloudWatch, and IAM management" },
      { name: "Datadog", required: false, description: "Monitoring, alerting, and dashboards" },
      { name: "PagerDuty", required: false, description: "Incident alerting and on-call rotation" },
      { name: "GitHub", required: false, description: "PRs, issues, and infrastructure-as-code reviews" },
    ],
  },
  {
    id: "marketing",
    role: "Marketing Strategist",
    tagline: "Campaigns, content & growth",
    description: "Plans go-to-market strategy, writes campaign copy, analyzes funnel metrics, and manages content calendars across channels.",
    color: "#f472b6",
    icon: TrendingUp,
    tools: ["HubSpot", "Figma", "Google Analytics", "Notion"],
    valueProps: [
      "Writes launch copy from a product brief",
      "Builds campaign calendars with milestones",
      "Analyzes funnel drop-off and suggests fixes",
      "Creates competitor battlecards",
    ],
    conversationExamples: [
      {
        title: "Launch campaign",
        subtitle: "From brief to go-live",
        messages: [
          { from: "human", text: "@marketing We're launching our AI Agent Marketplace next Tuesday. Need the full campaign: email sequence, social posts, landing page copy, and a launch day timeline.", time: "11:00 AM" },
          { from: "agent", text: "Campaign ready. Here's what's in motion:\n\n**Email Sequence (5 emails):**\n- Teaser: 'Something big is coming' (Mon)\n- Announcement: Marketplace is live (Tue)\n- Deep dive: How to publish your first agent (Wed)\n- Social proof: Early adopter stories (Thu)\n- CTA: Limited early-bird pricing (Fri)\n\n**Social Posts:**\n- LinkedIn carousel: 10 slides\n- Twitter thread: 8 tweets\n- ProductHunt launch post drafted\n\n**Landing Page Copy:**\n- Headline, 3 value props, FAQ, CTA sections\n\nI've created the Notion project board and scheduled everything in HubSpot. Ready to review?", time: "11:08 AM" },
        ],
      },
      {
        title: "Funnel analysis",
        subtitle: "Find the leaks, fix the flow",
        messages: [
          { from: "human", text: "@marketing Our trial-to-paid conversion dropped from 18% to 12% this month. Can you figure out why?", time: "2:00 PM" },
          { from: "agent", text: "Found the issue.\n\n**Drop-off analysis:**\n- 34% leave at 'Connect Data Source' step\n- 21% abandon during onboarding (too many steps)\n- 12% churn after day 3 (no 'aha' moment)\n\n**Recommendations:**\n1. Add 'Skip for now' to data source step\n2. Reduce onboarding from 7 → 3 steps\n3. Add progress bar + celebration at first insight\n4. Trigger day-2 email with personalized use case\n\nI've mocked up the new onboarding flow in Figma and written the email copy. Want me to create the A/B test plan?", time: "2:06 PM" },
        ],
      },
    ],
    skills: [
      { name: "Campaign Planner", description: "Plan full campaigns from brief to go-live with timelines, assets, and channel strategy." },
      { name: "Content Calendar", description: "Manage editorial calendars across blog, social, email, and video with deadline tracking." },
      { name: "Funnel Analysis", description: "Analyze drop-off at each stage and suggest experiments to improve conversion." },
      { name: "Competitor Battlecards", description: "Monitor competitors and deliver weekly battlecards with positioning recommendations." },
      { name: "Launch Copywriter", description: "Write landing page copy, email sequences, and social posts from a product brief." },
      { name: "Social Media Scheduler", description: "Draft and schedule posts across LinkedIn, Twitter, and Instagram with optimal timing." },
    ],
    integrations: [
      { name: "HubSpot", required: false, description: "Email sequences, CRM, and campaign analytics" },
      { name: "Google Analytics", required: false, description: "Traffic, funnel, and conversion tracking" },
      { name: "Slack", required: false, description: "Campaign updates and team notifications" },
      { name: "Notion", required: false, description: "Project boards, content calendars, and docs" },
    ],
  },
  {
    id: "accounting",
    role: "Accounting Specialist",
    tagline: "Books, payroll & compliance",
    description: "Manages bookkeeping, reconciles accounts, processes payroll, and ensures tax compliance. Keeps your finances audit-ready.",
    color: "#2dd4bf",
    icon: Calculator,
    tools: ["QuickBooks", "Stripe", "Gusto", "Excel"],
    valueProps: [
      "Reconciles accounts weekly with zero errors",
      "Flags unusual transactions in real-time",
      "Prepares tax-ready P&L and balance sheets",
      "Processes payroll with compliance checks",
    ],
    conversationExamples: [
      {
        title: "Month-end close",
        subtitle: "Close the books in hours, not days",
        messages: [
          { from: "human", text: "@accounting It's month-end. Can you close the books for June? We had a lot of Stripe transactions and some contractor invoices.", time: "9:00 AM" },
          { from: "agent", text: "June books closed. Here's the summary:\n\n**Revenue:** $847,320 (+12% MoM)\n- Stripe: $802,100 (1,247 transactions)\n- Invoices: $45,220 (8 clients)\n\n**Expenses:** $612,400\n- Payroll: $320,000\n- AWS: $48,200\n- Contractors: $34,500\n- SaaS tools: $12,800\n\n**Reconciled:**\n- All 1,247 Stripe transactions matched\n- 3 discrepancies flagged (total: $1,240) — I've added notes\n- Contractor W-9s verified\n\nP&L, balance sheet, and cash flow statement are in QuickBooks. Ready for review.", time: "9:14 AM" },
        ],
      },
      {
        title: "Expense audit",
        subtitle: "Catch what humans miss",
        messages: [
          { from: "human", text: "@accounting Something feels off with last month's expenses. Can you audit for anomalies?", time: "4:30 PM" },
          { from: "agent", text: "Audit complete. Found 4 issues:\n\n**🚩 Anomalies:**\n1. $4,200 AWS charge — 3x normal. Root cause: Unused EBS volumes left running.\n2. $890 SaaS duplicate — Same tool billed twice (HubSpot + HubSpot for Startups).\n3. $2,400 'Consulting' — No invoice attached, no contract on file.\n4. $150/month recurring — Unknown vendor 'DataSync Pro', no owner.\n\n**Action taken:**\n- Terminated unused EBS volumes (saves $3,100/mo)\n- Filed duplicate charge dispute with HubSpot\n- Flagged consulting expense for approval\n- Sent owner-identification email for DataSync Pro\n\nPotential monthly savings: $3,400+", time: "4:38 PM" },
        ],
      },
    ],
    skills: [
      { name: "Bookkeeping", description: "Categorize transactions, reconcile accounts, and maintain clean general ledgers." },
      { name: "Payroll Processing", description: "Process payroll, calculate withholdings, and ensure compliance with local regulations." },
      { name: "Expense Audit", description: "Scan for anomalies, duplicates, and unauthorized expenses. Flag for review." },
      { name: "Tax Compliance", description: "Track deductions, prepare tax-ready reports, and maintain compliance documentation." },
      { name: "Financial Reporting", description: "Generate P&L, balance sheets, and cash flow statements on demand." },
    ],
    integrations: [
      { name: "QuickBooks", required: false, description: "Bookkeeping, invoicing, and financial reporting" },
      { name: "Stripe", required: false, description: "Revenue reconciliation and transaction tracking" },
      { name: "Gusto", required: false, description: "Payroll processing and benefits management" },
    ],
  },
];

function ConversationThread({ example }: { example: ConversationExample }) {
  return (
    <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
      <div className="border-b border-[#232323] px-5 py-3">
        <h3 className="text-sm font-medium text-[#fafafa]">{example.title}</h3>
        <p className="text-[11px] text-[#737373] mt-0.5">{example.subtitle}</p>
      </div>
      <div className="p-5 space-y-4">
        {example.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "human" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.from === "human"
                ? "bg-[#fafafa] text-[#111111] rounded-br-md"
                : "bg-[#151519] text-[#fafafa] border border-[#303036] rounded-bl-md"
            }`}>
              {msg.from === "agent" ? (
                <div className="text-[13px] leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                      ul: ({ children }) => <ul className="mb-2 list-disc space-y-0.5 pl-4 last:mb-0">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 list-decimal space-y-0.5 pl-4 last:mb-0">{children}</ol>,
                      li: ({ children }) => <li className="pl-0.5">{children}</li>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
              {msg.time && <span className="text-[10px] mt-1.5 block text-[#737373]">{msg.time}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = "overview" | "skills" | "integrations";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const agent = AGENT_SPECIALTIES.find((a) => a.id === agentId);

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#737373]">Agent not found</p>
          <button onClick={() => router.push("/workspaces")} className="mt-4 text-sm text-[#4ade80] hover:underline">
            ← Back to your workspace
          </button>
        </div>
      </div>
    );
  }

  const Icon = agent.icon;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skills" },
    { id: "integrations", label: "Integrations" },
  ];

  return (
    <div className="min-h-screen bg-[#070708]">
      {/* Hero Header */}
      <div className="border-b border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-8">
          <button
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/workspaces"))}
            className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#fafafa] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: agent.color + "18", border: `1px solid ${agent.color}35` }}
              >
                <Icon className="h-8 w-8" style={{ color: agent.color }} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#fafafa]">{agent.role}</h1>
                <p className="text-sm text-[#737373] mt-1">{agent.tagline}</p>
                <p className="text-[13px] text-[#a7a7ad] mt-3 max-w-xl">{agent.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {agent.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-[#303036] bg-[#151519] px-3 py-1 text-[11px] text-[#737373]">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hire CTA */}
            <button
              onClick={() => router.push(`/workspaces?newAgent=${agent.id}`)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: agent.color }}
            >
              Hire this Agent
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                  activeTab === tab.id ? "text-[#fafafa]" : "text-[#737373] hover:text-[#a7a7ad]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="agentTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                    style={{ backgroundColor: agent.color }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Value Props */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#737373] mb-5">
                  What they do
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.valueProps.map((prop, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: agent.color }} />
                      <p className="text-[13px] text-[#a7a7ad]">{prop}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation Examples */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#737373] mb-5">
                  See them in action
                </h2>
                <div className="space-y-6">
                  {agent.conversationExamples.map((example, i) => (
                    <ConversationThread key={i} example={example} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Pre-baked Skills
                </h2>
                <span className="text-[11px] text-[#737373]">{agent.skills.length} skills included</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agent.skills.map((skill, i) => (
                  <div key={i} className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-3.5 w-3.5" style={{ color: agent.color }} />
                      <h3 className="text-[13px] font-medium text-[#fafafa]">{skill.name}</h3>
                    </div>
                    <p className="text-[12px] text-[#737373] leading-relaxed">{skill.description}</p>
                    {skill.requiredIntegration && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Lock className="h-3 w-3 text-[#f5c45e]" />
                        <span className="text-[10px] text-[#f5c45e]">Requires {skill.requiredIntegration}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#737373] mt-5 text-center">
                You can modify these skills or create new ones after launching.
              </p>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Proposed Integrations
                </h2>
                <span className="text-[11px] text-[#737373]">{agent.integrations.length} available</span>
              </div>
              <div className="space-y-3">
                {agent.integrations.map((integration, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#151519] border border-[#232323]">
                      <Puzzle className="h-4 w-4 text-[#737373]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-medium text-[#fafafa]">{integration.name}</h3>
                        {integration.required ? (
                          <span className="rounded-full bg-[#f5c45e]/15 px-2 py-0.5 text-[10px] font-medium text-[#f5c45e]">Required</span>
                        ) : (
                          <span className="rounded-full bg-[#151519] border border-[#232323] px-2 py-0.5 text-[10px] text-[#737373]">Optional</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#737373] mt-1">{integration.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
                <p className="text-[12px] text-[#a7a7ad]">
                  <strong className="text-[#fafafa]">Good to know:</strong> None of these are required to launch. 
                  The agent works out of the box. Connect integrations to unlock additional capabilities. 
                  You can always add or remove integrations later.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-10 pt-6 border-t border-[#232323]">
          <button
            onClick={() => router.push(`/workspaces?newAgent=${agent.id}`)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
            style={{ backgroundColor: agent.color }}
          >
            Hire this Agent
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
