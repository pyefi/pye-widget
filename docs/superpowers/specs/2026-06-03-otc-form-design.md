# Pye OTC Form — Design

**Date:** 2026-06-03
**Branch:** `release/v0.1.10`
**Status:** Approved (pending spec review)

## Summary

Recreate the existing "Pye OTC Form" (currently a Google Form) as a native, in-widget,
3-step form. It captures interest from holders who need liquidity outside the orderbook —
early principal redemption or OTC liquidity for staking-reward positions too large for the
orderbook to fill.

The form lives **inside `@pyefi/widget`**, reuses the existing screen machine, step header /
progress bar, `CTA`, design tokens, and inline-style idiom. Submission is **mocked** for this
release (UI only); the `onSubmit` handler is the single integration point for a future backend.

## Goals

- A 3-step, themed form rendered as a self-contained widget screen.
- Reuse existing components and styling; no new dependencies, no form library.
- Mocked submit + inline success message.
- Entry via a subtle link on the Welcome screen.

## Non-Goals

- No backend wiring / real submission this release (mocked).
- No persistence of form data in the widget store (data is local to the form component).
- No analytics/telemetry on form fields (out of scope).

## Fields (from the source Google Form)

| Field | Type | Required |
|-------|------|----------|
| Email | text (email format) | No — but validated if provided |
| Name | text | No |
| Name of Organization | text | No |
| How should we reach you? | text (helper: "If telegram put @name, or your email") | **Yes** |
| What best describes you | single-select: Validator / Existing User / Potential User / Other (free text) | No |
| Request Type | single-select: Early principal redemption / OTC liquidity for staking rewards (too large for orderbook) / Other (free text) | **Yes** |
| How much SOL are you looking to move? | text (helper about principal locked + duration) | No |
| Time frame — how soon do you need a resolution? | text | No |
| Current Validator | text (helper: "If LST, put that too") | No |

Required fields were intentionally reduced from the source form: only **"How should we reach
you?"** and **Request Type** are required. Email is optional but format-checked when present.

## Step grouping (3 themed steps)

| Step | Title | Fields | Gate to continue |
|------|-------|--------|------------------|
| 1/3 | Contact | Email, Name, Name of Organization, How should we reach you? | "How should we reach you?" non-empty; Email valid if provided |
| 2/3 | About you | What best describes you, Request Type | Request Type selected |
| 3/3 | Details | How much SOL, Time frame, Current Validator | none (Submit) |

## Architecture

### Screen registration
- Add a single member `"otc-form"` to the `WidgetScreen` union in `stores/widget-store.ts`.
- `WidgetShell.tsx` renders it following the `StepComplete` pattern:
  `if (screen === "otc-form") return <Widget><OtcForm /><Footer /></Widget>;`
  — `OtcForm` owns its own `StepHeader` + `Body`.
- Entry/exit uses the existing generic `navigate()` / `goBack()` / `screenHistory`. No new
  store actions are required beyond the union member.

### Internal step state
- The 3 steps live **inside `OtcForm`** as local `step` state (`0 | 1 | 2`), NOT as 3 separate
  widget screens. This keeps the global screen machine clean and the form self-contained.
- `StepHeader` progress bar reads `step+1` of `3`.
- The header back arrow:
  - steps 2–3: decrements internal `step`.
  - step 1: calls `goBack()` (returns to Welcome).

### Components

**`shared/FormControls.tsx` (new)** — reusable, inline-styled primitives matching the existing
token idiom (`c`, `font()`), kept out of the already-large `Layout.tsx` (406 lines):

- `TextField`
  - Props: `label`, `subtitle?` (helper text), `placeholder?`, `value`, `onChange`,
    `required?`, `error?`, `type?` ("text" | "email").
  - Renders label (with required marker), optional helper, a styled `<input>` (following the
    `ChooseAmount` input idiom), and `InlineError` for the error.
- `ChoiceGroup`
  - Props: `label`, `options: string[]`, `value`, `onChange`, `required?`,
    `allowOther?` (adds an "Other" row with an inline free-text field), `otherValue?`,
    `onOtherChange?`.
  - Single-select, built from the existing `pye-pill` / `SelectableRow` visual style.

**`screens/OtcForm.tsx` (new)** — orchestrates the 3 steps:
- Holds form state via `useState` (one `fields` object) + a local "Other" text value per
  choice group.
- Derives per-step validation errors (component-local, matching `ChooseAmount`).
- Renders `StepHeader` (progress + back), `Body` (current step's fields), and footer `CTA`:
  - steps 1–2: `Continue` (purple), disabled until the step's gate passes.
  - step 3: `Submit` (purple).
- On submit: sets a brief `submitting` flag, then `submitted = true` (mock — no network).
- On `submitted`: replaces the Body with an inline success state (green check +
  "Thanks — we'll be in touch") and a `Done` button that returns to Welcome.

### Entry point
- `screens/WelcomeScreen.tsx`: add a subtle text link **"Need liquidity outside the
  orderbook?"** near the bottom (above the `WalletSwitcher`) → `navigate("otc-form")`.

## Form state, validation, submit

- **State:** local `useState` in `OtcForm`. No widget-store slice — submit is mocked and no
  other screen reads the data. The `onSubmit` handler is the future backend integration point.
- **Validation:** component-local computed errors; footer `CTA` disabled until the current
  step's gate passes. Email validated via a simple regex when non-empty.
- **Submit (mocked):** `submitting` → `submitted`. No request is made.
- **Success:** inline (Body replaced), not a separate widget screen.

## Files touched

- `packages/widget/src/components/shared/FormControls.tsx` — new (`TextField`, `ChoiceGroup`).
- `packages/widget/src/components/screens/OtcForm.tsx` — new (3-step form + inline success).
- `packages/widget/src/stores/widget-store.ts` — add `"otc-form"` to `WidgetScreen`.
- `packages/widget/src/components/WidgetShell.tsx` — import + render branch.
- `packages/widget/src/components/screens/WelcomeScreen.tsx` — entry link.

## Testing / verification

- Confirm whether a unit-test harness exists in the widget package during planning; add focused
  tests for the validation helpers (email regex, required gating) if so.
- Typecheck + build the widget package.
- Run an example app (e.g. `examples/react-universal`) and click through: all 3 steps, the
  back behaviour, required-field gating, the "Other" free-text rows, mocked submit, and the
  inline success state.

## Open questions / decisions made

- **Entry-point placement:** Welcome screen (chosen default). Could additionally surface on the
  Redeem list later if desired.
- **Submission target:** deferred — mocked for this release.
