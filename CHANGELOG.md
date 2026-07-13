# Changelog

## 2026-07-13

### Skill flow, end to end (`9a9fa26`)

The skill lifecycle previously dead-ended at a toast — created and imported skills were never persisted and could never be used. It now runs the full journey: **create → save as Preview → test in a session → skill visibly invoked → user confirms → Active**.

- **`SkillsProvider`** — runtime in-memory skill store (`addSkill`, `confirmSkillUsed`, `toggleSkillDisabled`); created/imported skills actually land in the grid, born as **Preview**
- **Session page (`/session/new?skill=…`)** — new chat surface with the agent (Nova): suggested prompt chips, tool-invocation chip (`Used skill: …`), typing effect, and a sticky confirmation banner — **"✓ Looks good — set Active"** flips the skill to Active and records the proof (`confirmedUse`), shown on the grid and detail page
- **Creation modal** — new terminal *saved* step that auto-continues into the session ("Try it with Nova"), with name-uniqueness validation
- **Import modal** — genuinely parses name/description/instructions from the uploaded SKILL.md (frontmatter → heading → filename), with inline errors; same saved step
- **Detail page** — synthesized detail for skills without mock data (no more "Skill not found"), Preview badge, "Confirmed in session" proof card
- Design spec: `docs/superpowers/specs/2026-07-13-skill-flow-e2e-design.md` (`82427f5`)

### Cards as actions + guided setup (`63fc69d`)

Feedback round on the grid:

- **Card footer indicators removed** ("Instruction-only", tool icons, category chips) — the footer is now pure actions: **enable/disable toggle · ▷ Test · Configure**
- **Configure edits the SKILL.md** — new `EditSkillModal` (from cards and the detail page); edits re-render the detail Overview immediately
- **Test is always available** — and when a skill's requirements are missing (bins/env), the session starts with a requirements check: the agent explains what's missing, how to install it, and offers a **"✓ Done — try again now"** retry chip; only a real run triggers the confirm banner
- **Detail header** — Configure · Test in a session · Enable/Disable
- Fixed double bullets when chat lines combine `- ` with inline code

### Real bundled catalog, relevancy sort, category filter (`b9b0c3a`)

- **Installed tab seeds the actual 57 bundled OpenClaw skills** — frontmatter (names, descriptions, emoji, bin/env requirements) extracted from a live pod's `/app/skills`; requirements feed the guided-setup chat
- **Relevancy ordering** — grids sort by ClawHub-style popularity; real download counts where known (**github 193k → gog 189k → weather 164k**), estimates elsewhere
- **ClawHub-style category filter** — searchable multi-select dropdown with per-category counts, composing with search and status filters on both tabs
- **Library tab is a ClawHub registry view** — the real top-10 (Self-improving agent 468k ⬇, Skill Vetter 264k ⬇, ontology, Gog, SkillScan, …) with author handles, stars, and downloads

### Reinforced skill confirmation

- Creation and import now end in an explicit **Confirm Skill** step: **"✓ Confirm & activate"** (no test required), "Test it in a session first", or "Keep as preview" — confirmation no longer depends on running a session
- **Configure joins the flow**: saving SKILL.md edits returns the skill to Preview (its old session proof no longer applies) and the same Confirm Skill step appears in the modal
- **Skill overview** shows a standing confirmation banner for any Preview skill — "Confirm & activate" / "Test in a session" — so an unconfirmed skill is always one click from Active
- In sessions, the confirmation banner appears for preview skills after **any** agent reply (including setup guidance), with copy adapting to whether a real run happened
- Removed the Description Quality meter from the creation form

### Verification & deployment

- Every round verified by a scripted browser E2E (puppeteer-core + Chrome for Testing) driving the full journey — create, import, session, guided setup, confirm, toggle, Configure edit, unknown-skill guard — plus `npm run lint` / `npm run build`
- Merged fast-forward to `main`; live at <https://skill-creation-prototype.vercel.app>

### Known prototype behavior

- The store is in-memory: a hard refresh resets to the seeded catalog (by design, no backend)
- Workspace-level skill assignment, a real Configure/env-setup flow, and session persistence are explicitly out of scope (see the design spec)
