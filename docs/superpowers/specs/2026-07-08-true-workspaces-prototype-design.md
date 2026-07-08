# True Workspaces — UX Prototype Design

**Date:** 2026-07-08
**Repo:** skill-creation-prototype
**Status:** Approved by Damian (brainstorming session, 2026-07-08)

## Background

HyperCLI shipped "Workspaces" (surfaced in Claw as "Shared Knowledge") on 2026-07-08: a backend workspace is a shared folder of files with per-agent grants. Damian's product vision is bigger: a **workspace as an isolated context** — e.g. a *Marketing* workspace and a *Tech* workspace — each containing its own agents and shared knowledge, while skills, settings, and billing stay global. This prototype demonstrates that vision as clickable UX with mock data. No API calls.

Decisions made during brainstorming:

- **Concept:** true workspaces (vision), not the shipped knowledge-base model.
- **Scope of a workspace:** agents + shared knowledge. Chats follow agents. Everything else global.
- **Switcher pattern:** sidebar dropdown (Notion/Linear style) — chosen over Slack-style icon rail and a landing hub.
- **Creation flow:** instant — name + emoji/color modal, land in empty workspace with inviting empty states. Chosen over guided wizard and template-first.
- **Flows demonstrated:** switch workspace, create workspace, manage knowledge within a workspace. Agent management is out of scope (agents are visible context only).
- **Isolation:** the existing prototype stays exactly as-is; the new experience gets its own URL namespace.
- **Wiring:** React context provider (not route params, not prop drilling).

## Architecture

### Routing

New route namespace `/workspaces`, fully parallel to existing pages:

```
src/app/workspaces/
  layout.tsx        — wraps children in WorkspaceProvider + WorkspaceAppShell
  page.tsx          — workspace home (scoped agents/sessions overview + empty states)
  knowledge/
    page.tsx        — workspace-scoped Shared Knowledge
```

Existing routes (`/`, `/shared-knowledge`, `/skill/[id]`, `/agent/[id]`) and the existing `AppShell` are not modified. The knowledge page is a **copy** of `src/app/shared-knowledge/page.tsx` adapted to context — deliberately no shared code with the old page, so neither can break the other. (Prototype-appropriate duplication, accepted explicitly.)

Note: this repo's Next.js version has breaking changes vs. common conventions — read `node_modules/next/dist/docs/` before writing route/layout code (per AGENTS.md).

### Data model

`src/types/workspaces.ts`:

```ts
interface WorkspaceAgent {
  id: string;
  name: string;
  status: "ready" | "busy" | "offline";
}

interface Workspace {
  id: string;
  name: string;
  emoji: string;      // e.g. "🟣"
  color: string;      // accent hex, used for subtle theming of the switcher
  agents: WorkspaceAgent[];
  knowledgeBases: SharedKnowledge[];  // existing type from src/types/skills.ts
}
```

`KnowledgeItem` gains an optional `status?: "ready" | "processing" | "queued" | "failed"` (files only; absent means ready) — additive and optional so the existing page is unaffected.

### Mock data

`src/data/mock-workspaces.ts` seeds two workspaces so switching visibly changes everything scoped:

- **Marketing 🟣** — 2–3 agents (e.g. Copywriter ready, Analyst busy); knowledge bases reusing/adapting `MOCK_SHARED_KNOWLEDGE` content, with a mix of file statuses (mostly ready, a few processing/queued, one failed) to exercise the status UX.
- **Tech 🔵** — different agents (e.g. Product Owner, Code Reviewer); dev-flavored KBs (API docs, runbooks), different counts so the change of context is obvious at a glance.

### WorkspaceProvider

`src/components/workspaces/WorkspaceProvider.tsx` — client context:

- State: `workspaces: Workspace[]`, `activeWorkspaceId: string`.
- API: `activeWorkspace` (derived), `switchWorkspace(id)`, `createWorkspace({ name, emoji, color })` → creates a workspace with empty `agents`/`knowledgeBases`, switches to it, returns it. Knowledge mutations used by the knowledge page (create KB, add files to mock state) also live here so scoped data has one owner.
- In-memory only; refresh resets to mocks. Default active workspace: Marketing.

## Components

All new components under `src/components/workspaces/`; visual language copies the existing shell/pages (dark `#0b0b0c` surfaces, `#303036` borders, `#4ade80` accent, 13px nav type, framer-motion transitions).

### WorkspaceAppShell

Copy of `AppShell` with these changes:

- **Logo row → workspace switcher button:** emoji + workspace name + chevron. Click opens a dropdown panel: list of workspaces (emoji, name, agent/KB counts, checkmark on active) and a "＋ New workspace" row at the bottom. Closes on selection, outside click, and Escape.
- **Nav links** point to `/workspaces` (home) and `/workspaces/knowledge` (Shared Knowledge). Non-prototyped items (Files, Integrations, Scheduled) remain as inert links, as in the existing shell. Skills/settings/billing UI (Advanced, token usage, Upgrade) is unchanged — visibly global.
- **Sessions section** renders `activeWorkspace.agents` instead of hardcoded items.
- **Switch transition:** on workspace change, scoped sidebar sections and page content fade/slide briefly (~150–200ms, AnimatePresence keyed on `activeWorkspaceId`) so the context switch is felt, not just repainted.
- Header session label shows the active workspace name alongside the session status.

### NewWorkspaceModal

Small modal styled after `NewKnowledgeBaseModal`: name input (required, autofocused), emoji picker row (~8 curated emoji), accent color row (~6 swatches), Create button disabled until named. On create: `createWorkspace(...)`, close, land on `/workspaces` home of the new workspace.

### Workspace home (`/workspaces/page.tsx`)

Scoped overview for the active workspace:

- Header: workspace emoji + name + description line.
- **Agents card:** the workspace's agents with status dots. Empty state: "No agents in this workspace yet" + "＋ Add agent" button opening the existing `AgentCreationModal` (visual flow only; created agents append to the active workspace's mock list with `ready` status).
- **Knowledge card:** KB count + aggregate file status summary, linking to `/workspaces/knowledge`. Empty state: "No shared knowledge yet" + "＋ New knowledge base" linking to the knowledge page with its creation modal open (via `?new=1` query param the page reads on mount).

### Workspace knowledge page (`/workspaces/knowledge/page.tsx`)

Copy of the existing Shared Knowledge page, adapted:

- Reads `activeWorkspace.knowledgeBases` from context; creation via context so it persists across page switches within the session.
- Header: "Shared Knowledge" + a scope chip: `🟣 Marketing`.
- "Assign Agent" surfaces only the active workspace's agents.
- **File status chips** in the tree rows: ready ✓ (green), processing (amber, subtle pulse), queued (gray), failed (red with a retry affordance that flips the file to processing → ready after a mock delay). KB card header shows a summary ("12 files · 3 processing").
- Search and file preview behave as in the existing page.

## Error handling

Prototype-level: no network, so no real errors. The failed-file state + mock retry is the only error UX, demonstrating the lifecycle communication missing from the shipped feature. Creating a workspace with a duplicate name is allowed (ids are unique); empty name is prevented by the disabled button.

## Testing

Manual, flow-based (matching the repo's prototype conventions — no test infra exists):

1. `/workspaces` loads on Marketing; sidebar sessions + knowledge match Marketing mocks.
2. Switch to Tech via dropdown → agents, knowledge, header all change with transition.
3. Create "Design 🎨" workspace → lands on empty home; both empty states present; add agent and create KB from them.
4. Knowledge page scopes per workspace; status chips render; failed→retry→ready works.
5. Existing routes (`/`, `/shared-knowledge`) render exactly as before.
6. `npm run build` passes.

## Out of scope

- Any API/backend integration or persistence.
- Agent management beyond the existing creation modal (no move/remove between workspaces).
- Behavioral changes to existing prototype pages or components. Additive, backward-compatible changes are permitted where needed (the optional `status` field on `KnowledgeItem`; an optional `onCreated` callback prop on `AgentCreationModal` so the workspace home can append the created agent).
- Changes to the real hypercli/hyperclaw repos (read-only upstreams).
