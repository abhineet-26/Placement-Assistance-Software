# Design.md — UI/UX Design Brief

**Version:** 1.0
**Companion to:** `Flow.md`

---

## 1. Design intent

This is an institutional tool used by three very different audiences (students in a hurry, HR reps who don't work here every day, and placement staff who live in it all season). It should read as **calm, credible, and status-forward** — the single most important thing on almost every screen is "where does this stand right now," so status is never an afterthought.

Avoid: generic SaaS-dashboard blandness, playful/consumer styling, anything that looks like a college project (ironic, but the goal is looking like real placement-cell software, not a class assignment).

## 2. Color palette

A single palette shared across all three role zones, with role accent used only for subtle wayfinding (a colored strip/badge indicating "you're in the Company zone" etc.) — not full re-theming per role.

| Token | Hex | Use |
|---|---|---|
| `--color-primary` | `#1E3A5F` (deep navy) | Primary actions, headers, nav |
| `--color-primary-hover` | `#16283F` | Hover/active state of primary |
| `--color-accent` | `#2F8F7A` (muted teal) | Secondary actions, links, "positive/progress" states |
| `--color-warning` | `#C77D28` (amber) | Pending/needs-attention states (pending approval, pending review) |
| `--color-danger` | `#B3413A` (brick red) | Rejected, ineligible, errors |
| `--color-success` | `#2E7D4F` (green) | Approved, placed, offer received |
| `--color-bg` | `#F6F7F9` | App background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-border` | `#E2E5EA` | Dividers, card borders |
| `--color-text-primary` | `#1A1F29` | Body text |
| `--color-text-secondary` | `#5B6472` | Meta text, helper copy |
| Role accent — Student | `#2F8F7A` (teal, same as accent) | subtle nav strip |
| Role accent — Company | `#7A5FB3` (muted violet) | subtle nav strip |
| Role accent — Admin | `#1E3A5F` (navy, same as primary) | subtle nav strip |

Status colors (used consistently everywhere a status appears — application status, job status, account status):
- **Pending / in review** → amber
- **Approved / published / matched** → teal or green depending on finality
- **Rejected / ineligible / closed** → red
- **Placed / offer received** → green, slightly bolder weight

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Inter**, 600–700 weight | Clean, highly legible at small sizes for dense tables |
| Body | **Inter**, 400–500 weight | Same family as headings — one font, weight does the work |
| Monospace (IDs, roll numbers, timestamps in audit logs) | **JetBrains Mono** | Only for admin-facing technical detail views |

Scale (rem, base 16px): `12 / 14 / 16 / 18 / 22 / 28 / 36` — used consistently for `caption / body-sm / body / body-lg / h3 / h2 / h1`.

## 4. Layout rules

- **App shell:** persistent left sidebar nav (collapsible on mobile → bottom nav or hamburger) + top bar with role badge, notifications bell, user menu. Main content area is a single scrollable column with a max content width (~1200px) so tables don't stretch absurdly wide on large monitors.
- **Cards** for anything summarizable (a job posting, a student profile snippet, a pending-approval item) — 8px corner radius, 1px `--color-border`, subtle shadow only on hover/interactive cards.
- **Tables** for anything list-heavy and comparable (applications list, match shortlist, audit log) — sticky header row, zebra striping optional but status column always uses color+icon+text (never color alone, for accessibility).
- **Forms:** single-column, label-above-input, mandatory fields marked with a red asterisk *and* stated in helper text ("required"), inline validation on blur, not just on submit — this directly satisfies the SRS's usability requirement (§6.5: forms must clearly indicate mandatory fields and validation-failure reasons).
- **Empty states** are designed, not blank — every empty list (no applications yet, no matches yet, no feedback yet) gets a short explanatory line + a relevant CTA where one exists.
- **Spacing scale:** 4px base unit — 4/8/12/16/24/32/48 — applied consistently for padding/margins/gaps.

## 5. Key components

- **Status Badge** — pill-shaped, colored per §2, icon + label (e.g. ⏳ "Pending Review", ✓ "Approved", ✕ "Rejected"). Used identically across student/company/admin views so status language never drifts.
- **Eligibility Result Banner** — shown on an opportunity detail page for students: green "You're eligible" or red "Not eligible — [specific unmet criterion]", never a bare disabled button with no explanation.
- **Approval Queue Row** — used across all of Admin's pending-X lists: summary of the item + primary [Approve]/[Reject] actions + a "View details" expand, consistent pattern so Admin doesn't relearn UI per queue type.
- **Match Score Chip** — small numeric/percentage indicator next to a candidate in the shortlist view, so Admin can see *why* the system ranked someone where it did (directly supports the "matching must be explainable enough for staff to review" principle from `TRD.md`).
- **Notification Item** — icon by type (new opportunity / interview / offer / status change), timestamp, read/unread dot, click-through to the relevant record.
- **CV Preview Panel** — read-only rendered view of a student's CV (used by Admin during match review and by Company on the Received CVs screen) — same rendering everywhere so nobody wonders if they're looking at an outdated version.

## 6. Role-specific tone

- **Student zone:** encouraging, low-friction, mobile-first (students will check this on their phones between classes). Primary CTA is almost always "Apply" or "Complete your CV."
- **Company zone:** efficient and businesslike, desktop-first (HR reps working from a laptop). Density is fine here — a company reviewing 30 CVs wants a scannable list, not a slideshow.
- **Admin zone:** information-dense, queue-driven, optimized for someone processing many items per session during placement season. Bulk-friendly where sensible (e.g. approving several student enrolments), but CV-forwarding approval is always a deliberate, one-at-a-time action — never bulk-approved without visibility into each candidate, since that's the one irreversible external-disclosure step.

## 7. Responsive breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | < 640px | Single column, bottom nav, tables become stacked cards |
| `md` | 640–1024px | Collapsible sidebar, tables scroll horizontally if needed |
| `lg` | > 1024px | Full sidebar + content, tables render fully |

Student and Company zones must be fully usable at `sm`. Admin zone is optimized for `lg` (data-dense work), but should still be functionally usable at `md` for a staff member checking things on a tablet.

## 8. Accessibility baseline

- Color is never the only signal (status = icon + text + color).
- All interactive elements reachable/operable by keyboard; visible focus states using `--color-accent` outline.
- Minimum contrast ratio 4.5:1 for body text against its background (palette above was picked with this in mind).
- Form errors announced via `aria-live` region, not just visual red text.
