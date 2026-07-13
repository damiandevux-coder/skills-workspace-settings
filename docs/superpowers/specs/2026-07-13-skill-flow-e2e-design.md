# Skill Flow End-to-End — Design

**Date:** 2026-07-13
**Goal:** The skill flow currently dead-ends at a toast: created and imported skills are never persisted, never appear in the grid, and can never be used. This design carries a skill from creation/import all the way to *being used by the agent in a session and explicitly confirmed applied* — mirroring the real product page, where "created and imported skills stay as local previews until backend support lands."

## Decisions (from brainstorm)

- **Skills are tied to the agent**, as in the real webapp (an agent-scoped skills page). One implicit current agent owns the grid. Workspace-level assignment is explicitly future work.
- **Finish line:** a new **session** with the agent where the skill is visibly invoked, ending in an explicit, effortless user confirmation ("set Active").
- **Auto-continue:** save/import flows straight into "Try it with the agent" (skippable at every step).
- **Minimal states:** created/imported skills are `preview` → `active` (on confirmation). Bundled mock skills keep their existing `disabled`-boolean rendering; no `needs-setup`/`disabled` status theatrics.

## Architecture

```
SkillsProvider (new, in layout under WorkspaceProvider)
  currentAgent (mock identity: "Nova")
  installedSkills / librarySkills  (seeded from mocks; runtime useState)
  addSkill(input) / confirmSkillUsed(id, proof) / toggleSkillDisabled(id)
        │
        ├── / (grid)            — reads provider; Preview filter; wired card buttons
        ├── SkillCreationModal  — save → addSkill → "saved" step → session CTA
        ├── ImportSkillModal    — parse md → addSkill → same CTA
        ├── /skill/[id]         — provider-aware detail; wired header button
        └── /session/new?skill= — chat page; simulated run; confirm banner
```

## Data model (`src/types/skills.ts`)

```ts
interface WorkspaceSkill {
  // …existing fields unchanged; `disabled` boolean stays…
  status?: "preview" | "active";   // only created/imported skills carry it
  origin?: "bundled" | "created" | "imported";
  instructions?: string;            // markdown body for created/imported skills
  confirmedUse?: { agent: string; prompt: string } | null;
}
```

Grid badges: `status === "preview"` → amber **Preview**; otherwise existing Active/Inactive from `disabled`. Detail page for skills without a `MOCK_SKILL_DETAILS` entry (created/imported/library) is synthesized from the `WorkspaceSkill` (+ `instructions` as overview) instead of "Skill not found".

## Components

1. **`SkillsProvider`** (`src/components/skills/SkillsProvider.tsx`) — `useState` store, same pattern as `WorkspaceProvider`. `addSkill` converts `SkillFormData`/import into a `WorkspaceSkill` (`status: "preview"`), prepends to installed. `confirmSkillUsed` flips to `active` + records `confirmedUse`. Uniqueness by skill id (kebab name).
2. **`SkillCreationModal`** — new `saved` mode after save: "✓ *name* saved as Preview — skills stay previews until proven in a session" with **[▶ Try it with Nova]** (→ `/session/new?skill=<id>`) and **[Done for now]**. Name-uniqueness validated inline at form Step 1 and defensively at save.
3. **`ImportSkillModal`** — reads the full file; derives name (frontmatter `name:` → first `# heading` → filename) and description (frontmatter → first paragraph). Underivable name → inline error, modal stays open. Success → same saved/CTA step.
4. **`/session/new` page** — client page (Suspense-wrapped for `useSearchParams`). Header: back, "Nova · ● Ready", "⚡ <skill> attached" chip. Suggested prompt chips from the skill's category. Reply renders a tool-invocation chip ("Using skill: <name>… ✓") + typed text. After the first skill-using reply for a `preview` skill: **sticky confirmation banner** — primary "✓ Looks good — set Active" (autofocused), secondary "Keep as preview". Confirm → `confirmSkillUsed` → banner becomes success note with "Back to Skills". Unknown/missing `?skill=` → inline empty state with back link.
5. **`simulate-session.ts`** (`src/lib/`) — pure helpers: `suggestedPrompts(skill)`, `skillReply(skill, userText)`; category-keyed canned content with generic fallback (same trick as `simulateAiGeneration`).
6. **Grid wiring** — Preview filter chip (with count); card footer buttons become real: preview → "Try it →", installed → "Configure" (→ detail), library → "Try with Nova" (→ session).
7. **Detail page wiring** — header button: preview skill → "Try it in a session"; otherwise Enable/Disable toggles `disabled` via provider. `confirmedUse` renders "✓ Confirmed in session — '<prompt>'" in the sidebar.

## Confirmation UX (two-click journey)

Save → **[Try it with Nova]** → click a **suggested chip** → watch skill invoked → **[✓ Looks good — set Active]**. The banner is sticky and persists until acted on; leaving without confirming keeps `preview` and every surface (grid card, detail button) keeps offering "Try it →". Confirm is idempotent; banner only appears for `preview` skills.

## Edge cases

| Case | Behavior |
|---|---|
| `/session/new` unknown/missing skill | Inline empty state + back link |
| User types own prompt | `skillReply` always invokes the skill → banner still reachable |
| Import: no derivable name | Inline modal error; nothing created |
| Create: duplicate name | Inline error at Step 1 (and at save) |
| Page refresh | In-memory reset — accepted prototype behavior |
| Re-test an active skill | Session works; no banner |

## Verification

No test infra in repo (lint only) — verification is: `npm run lint` + `npm run build` clean, then a manual E2E walkthrough on the dev server: create→saved→session→chip→confirm→grid Active ✓; import path; skip path; library "Try with Nova"; detail Enable toggle; all edge cases above.

## Out of scope

Workspace-level skill assignment, Configure/env-setup flow, `needs-setup` status, session persistence/history, backend anything.
