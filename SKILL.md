---
name: design-system-
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# 유아이볼

## Mission
Deliver implementation-ready design-system guidance for 유아이볼 that can be applied consistently across content site interfaces.

## Brand
- Product/brand: 유아이볼
- URL: https://uibowl.io/name/%EC%9E%90%EA%BE%B8%EB%8B%A4%EA%BE%B8
- Audience: readers and knowledge seekers
- Product surface: content site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=wanted sans`, `font.family.stack=wanted sans, Helvetica Neue, sf pro display, pretendard, Arial, sans-serif`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=14px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=13.33px`, `font.size.md=14px`, `font.size.lg=15px`, `font.size.xl=16px`, `font.size.2xl=20px`, `font.size.3xl=24px`, `font.size.4xl=28px`
- Color palette: `color.text.primary=#ffffff`, `color.surface.base=#000000`, `color.text.tertiary=#a3aab5`, `color.text.inverse=#99a1a6`, `color.surface.muted=#292b2d`, `color.surface.raised=#2a3037`, `color.surface.strong=#1f222a`
- Spacing scale: `space.1=1px`, `space.2=5px`, `space.3=6px`, `space.4=8px`, `space.5=10px`, `space.6=14px`, `space.7=16px`, `space.8=18px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=5px`, `radius.md=6px`, `radius.lg=8px`, `radius.xl=16px`, `radius.2xl=40px`, `radius.step7=64px`, `radius.step8=99px` | `shadow.1=rgba(0, 0, 0, 0.1) 0px 0px 10px 0px` | `motion.duration.instant=200ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
