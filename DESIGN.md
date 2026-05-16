# 유아이볼 UI Design System

## Mission

Create implementation-ready, token-driven UI guidance for 유아이볼 that is optimized for consistency, accessibility, and fast delivery across content site.

---

## Context and Goals

- **Product / Brand:** 유아이볼
- **URL:** https://uibowl.io/name/%EC%9E%90%EA%BE%B8%EB%8B%A4%EA%BE%B8
- **Audience:** Readers and knowledge seekers
- **Product surface:** Content site
- **Visual style:** Clean, functional, implementation-oriented

---

## Design Tokens and Foundations

### Typography

| Token | Value |
|-------|-------|
| `font.family.primary` | `wanted sans` |
| `font.family.stack` | `wanted sans, Helvetica Neue, sf pro display, pretendard, Arial, sans-serif` |
| `font.size.base` | `14px` |
| `font.weight.base` | `400` |
| `font.lineHeight.base` | `14px` |

#### Type Scale

| Token | Value |
|-------|-------|
| `font.size.xs` | `12px` |
| `font.size.sm` | `13.33px` |
| `font.size.md` | `14px` |
| `font.size.lg` | `15px` |
| `font.size.xl` | `16px` |
| `font.size.2xl` | `20px` |
| `font.size.3xl` | `24px` |
| `font.size.4xl` | `28px` |

### Color

| Token | Value |
|-------|-------|
| `color.text.primary` | `#ffffff` |
| `color.surface.base` | `#000000` |
| `color.text.tertiary` | `#a3aab5` |
| `color.text.inverse` | `#99a1a6` |
| `color.surface.muted` | `#292b2d` |
| `color.surface.raised` | `#2a3037` |
| `color.surface.strong` | `#1f222a` |

### Spacing

| Token | Value |
|-------|-------|
| `space.1` | `1px` |
| `space.2` | `5px` |
| `space.3` | `6px` |
| `space.4` | `8px` |
| `space.5` | `10px` |
| `space.6` | `14px` |
| `space.7` | `16px` |
| `space.8` | `18px` |

### Radius

| Token | Value |
|-------|-------|
| `radius.xs` | `4px` |
| `radius.sm` | `5px` |
| `radius.md` | `6px` |
| `radius.lg` | `8px` |
| `radius.xl` | `16px` |
| `radius.2xl` | `40px` |
| `radius.step7` | `64px` |
| `radius.step8` | `99px` |

### Shadow

| Token | Value |
|-------|-------|
| `shadow.1` | `rgba(0, 0, 0, 0.1) 0px 0px 10px 0px` |

### Motion

| Token | Value |
|-------|-------|
| `motion.duration.instant` | `200ms` |
| `motion.duration.fast` | `300ms` |

---

## Component-Level Rules

### Component Density (Known Page)

| Component | Count |
|-----------|-------|
| Buttons | 70 |
| Inputs | 19 |
| Links | 14 |
| Lists | 7 |
| Navigation | 1 |

### State Requirements

Every interactive component **must** define all of the following states:

| State | Description |
|-------|-------------|
| `default` | Resting, no interaction |
| `hover` | Pointer over element |
| `focus-visible` | Keyboard focus (`:focus-visible`) |
| `active` | Pressed / mousedown |
| `disabled` | Non-interactive, visually dimmed |
| `loading` | Async in progress |
| `error` | Validation or system failure |

### Anatomy

Every component definition **must** include:

1. **Root element** — semantic HTML tag and role
2. **Typography token** — which `font.size.*` and `font.weight.*` apply
3. **Spacing token** — padding and gap using `space.*`
4. **Radius token** — using `radius.*`
5. **Color token** — surface, text, and border using `color.*`
6. **Motion token** — transition duration using `motion.duration.*`

### Interaction Behavior

#### Keyboard
- All interactive elements **must** be reachable via `Tab` / `Shift+Tab`.
- Buttons and links **must** activate on `Enter`.
- Buttons **must** also activate on `Space`.
- Modals and dropdowns **must** trap focus and close on `Escape`.
- Lists **must** support arrow key navigation where applicable.

#### Pointer
- Hit targets **must** be a minimum of `44×44px` (WCAG 2.5.5).
- Hover transitions **must** use `motion.duration.instant` (`200ms`).

#### Touch
- Touch targets **must** meet the same `44×44px` minimum.
- No hover-only affordances; all hover states **must** have a touch equivalent.

### Responsive Behavior

- Components **must** reflow without horizontal overflow at any viewport width.
- Typography **must** not scale below `font.size.xs` (`12px`) at any breakpoint.
- Overflow text **must** use `text-overflow: ellipsis` with a visible tooltip or `title` attribute.
- Empty states **must** render a placeholder, not a blank region.

---

## Accessibility Requirements

**Target:** WCAG 2.2 AA

### Contrast

- Body text (`color.text.primary` on `color.surface.base`) **must** meet 4.5:1 minimum contrast ratio.
- Large text (≥ `font.size.3xl` / `24px` bold) **must** meet 3:1 minimum.
- `color.text.tertiary` (`#a3aab5`) on `color.surface.base` (`#000000`) — verify passes 4.5:1 before use.
- `color.text.inverse` (`#99a1a6`) on dark surfaces — **must** be audited per usage context; do not use for body copy without contrast verification.

### Focus

- Focus indicators **must** be visible and **must** use `:focus-visible` (not `:focus`).
- Focus ring **must** have a minimum 2px outline with sufficient contrast against both the component surface and the page background.
- Hidden focus indicators are **prohibited**.

### Semantics

- All interactive elements **must** use native semantic HTML (`<button>`, `<a>`, `<input>`) or correct ARIA roles.
- Icon-only buttons **must** include `aria-label`.
- Form inputs **must** have associated `<label>` elements (visible or `sr-only`).
- Error messages **must** be associated via `aria-describedby`.
- Loading states **must** communicate status via `aria-live` or `aria-busy`.

### Testable Acceptance Criteria

| # | Criterion | Pass |
|---|-----------|------|
| A1 | All interactive elements reachable by keyboard only | Tab through all controls without mouse |
| A2 | Focus indicator visible on every focusable element | No element loses outline on `:focus-visible` |
| A3 | Text contrast ≥ 4.5:1 for body copy | Measured in browser DevTools or axe |
| A4 | Large text contrast ≥ 3:1 | Verified at `font.size.3xl`+ |
| A5 | All buttons activate on `Enter` and `Space` | Keyboard-only interaction test |
| A6 | Icon-only buttons announce label to screen reader | VoiceOver / NVDA reads `aria-label` |
| A7 | Error state reads to screen reader | `aria-describedby` verified with screen reader |
| A8 | Loading state announced | `aria-live="polite"` fires on async start and end |
| A9 | Touch targets ≥ 44×44px | Measured in DevTools device emulation |
| A10 | No content lost at 200% browser zoom | Visual check at 200% zoom |

---

## Content and Tone Standards

### Writing Tone

Concise, confident, implementation-focused.

### Labels and Actions

- Labels **must** be descriptive and unambiguous — no "Click here", "Submit", or "OK" without context.
- Action labels **must** describe the outcome: "Save changes", "Delete post", "Subscribe".
- Error messages **must** state what happened and what the user can do next.
- Empty states **must** include a headline and a single clear action.

### Examples

| Context | Prohibited | Required |
|---------|-----------|----------|
| Button | "Submit" | "Save changes" |
| Error | "Something went wrong" | "Failed to load posts. Retry or refresh the page." |
| Empty state | *(blank)* | "No results found. Try a different keyword." |
| Loading | *(spinner only)* | Spinner + `aria-label="Loading content"` |

---

## Anti-Patterns and Prohibited Implementations

| # | Anti-pattern | Reason |
|---|-------------|--------|
| P1 | Raw hex values in component code | Breaks token traceability; use semantic tokens |
| P2 | One-off spacing values outside `space.*` scale | Breaks layout consistency |
| P3 | Typography exceptions outside `font.size.*` scale | Breaks typographic rhythm |
| P4 | Low-contrast text combinations | Fails WCAG 2.2 AA |
| P5 | Hidden or suppressed focus rings | Fails keyboard accessibility |
| P6 | Ambiguous action labels ("OK", "Yes", "Submit") | Fails content standards |
| P7 | Hover-only affordances with no touch equivalent | Breaks touch usability |
| P8 | Components without all 7 required state definitions | Incomplete implementation spec |
| P9 | Icon-only interactive elements without `aria-label` | Screen reader inaccessible |
| P10 | Blank regions for empty states | Poor UX; must render placeholder |

---

## Guideline Authoring Workflow

When authoring new component guidance, follow this sequence:

1. **Restate design intent** in one sentence.
2. **Define foundations and semantic tokens** — list every token the component uses.
3. **Define component anatomy, variants, interactions, and state behavior** — all 7 states required.
4. **Add accessibility acceptance criteria** — every criterion must be testable with a pass/fail check.
5. **Add anti-patterns, migration notes, and edge-case handling.**
6. **End with a QA checklist.**

---

## QA Checklist

### Tokens
- [ ] All color values reference `color.*` tokens — no raw hex
- [ ] All spacing values reference `space.*` tokens
- [ ] All typography values reference `font.*` tokens
- [ ] All radius values reference `radius.*` tokens
- [ ] All transitions reference `motion.duration.*` tokens

### States
- [ ] `default` state defined
- [ ] `hover` state defined
- [ ] `focus-visible` state defined with visible ring
- [ ] `active` state defined
- [ ] `disabled` state defined (non-interactive, dimmed)
- [ ] `loading` state defined with `aria-busy` or `aria-live`
- [ ] `error` state defined with `aria-describedby`

### Accessibility
- [ ] Keyboard navigation verified (Tab, Enter, Space, Escape, Arrow keys)
- [ ] Focus indicator visible and contrast-sufficient
- [ ] Touch targets ≥ 44×44px
- [ ] Contrast ratios verified (4.5:1 body, 3:1 large text)
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] `aria-label` on all icon-only buttons
- [ ] No hover-only interactions

### Content
- [ ] All labels descriptive and unambiguous
- [ ] Error messages actionable
- [ ] Empty states include headline and action
- [ ] Loading states communicate status

### Responsive
- [ ] No horizontal overflow at any viewport width
- [ ] Text reflows correctly at 200% zoom
- [ ] Overflow text handled (ellipsis + tooltip)
- [ ] Empty states render placeholder, not blank
