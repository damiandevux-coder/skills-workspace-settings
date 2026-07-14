# Workspace Settings Sidebar — Design

**Date:** 2026-07-14
**Source:** Figma "HyperCLI | Web App", node `2793-109677` ("Sidebar Workspace")
**Repo:** fork of `skills-workspace-members` → `skills-workspace-settings`

## Goal

Add a second, workspace-scoped sidebar rail to the far left of the app, implementing
the Figma design. The existing agent-scoped sidebar (classic `AppShell` sidebar and
`WorkspaceAppShell` sidebar) is **kept unchanged**, sitting immediately to the right
of the new rail: `[workspace rail] [agent sidebar] [main content]`.

## Component

`src/components/workspaces/WorkspaceSettingsSidebar.tsx` — a client component
rendered as the first child of the root flex row in both `AppShell` and
`WorkspaceAppShell`. Reads workspace state from the already-global
`WorkspaceProvider`.

### Structure (from Figma)

- **Rail**: 256px wide, `bg #ffffff05`, right border `#232323`, 8px outer padding.
- **Header**
  - HyperCLI wordmark (white SVG, `public/hypercli-wordmark.svg`) + 28px
    collapse toggle (lucide `panel-right`/`panel-left`).
  - Switcher card: 14px radius, border `#ffffff1a`, bg `#0a0a0a`, subtle shadow.
    - Row 1 — org: 24px blue (`#297eff`) 6px-radius tile with PlayStation glyph,
      "PlayStation" semibold 14, `chevron-down` at 50% opacity. Mock/no-op
      (prototype has no org concept).
    - Row 2 — workspace: elevated bordered trigger (10px radius), 24px bordered
      tile with `command` icon, active workspace name semibold 14,
      `chevrons-up-down`. Opens a popover to switch workspaces / create one
      (same behavior as the existing `WorkspaceSwitcher`, restyled to the new rail).
- **Home** — `house` icon → `/workspaces`.
- **Agents group** — label 12px medium `#737373` @70% opacity;
  "New Agent" (plus tile `#27272a`) opens `AgentCreationModal`; one row per
  `activeWorkspace.agents` (24px circular bordered tile, `command` 12px icon);
  "More" (ellipsis, 12px muted) reveals agents beyond the first three, hidden when
  there are three or fewer.
- **Administration group** — Members → `/workspaces/members`,
  Controls `#`, Activity `#`, Usage `#` (placeholders, same convention as existing
  sidebar's unimplemented items), Shared resources → `/workspaces/knowledge`,
  Settings `#`. Active item: pill `bg #ffffff0d`, medium text `#fafafa`.
- **Footer** — 32px avatar (`public/mock-avatar.png`), "John Smith" semibold 14 /
  "johnsmith@gmail.com" 12 `#737373` (mock user per design).

### Behavior

- Menu items are full-width pills (`rounded-full`), 24px-high buttons, 14px text,
  hover `bg #ffffff08`, framer-motion shared layout indicator not needed (design
  uses plain bg fill).
- Collapse toggle animates the rail to a 48px icon-only strip (toggle button only),
  framer-motion width animation. Design only specifies expanded; collapsed state is
  the minimal affordance to reopen without touching the agent sidebar.
- Typography: house font (Plus Jakarta Sans) instead of Figma's Geist — house style
  rule; sizes/weights/line-heights per design.

### Data changes

`mock-workspaces.ts`: Marketing workspace agents renamed/extended to the three
design names (Campaign Analyst, Creative Performance Agent, Launch Calendar Agent)
so the rail matches the Figma frame; existing Sessions lists render the same names.

### Out of scope

Org switching, Controls/Activity/Usage/Settings pages, phone-width responsiveness
(pre-existing known gap).

## Verification

Dev server + puppeteer-core screenshot of `/workspaces/members` (Members active
state as in the Figma frame), visual compare against the Figma screenshot; confirm
existing sidebar renders unchanged to the right and both shells (classic route `/`
and `/workspaces/*`) show the rail.
