# Post-Transaction Feedback & Support Card — Design

**Date:** 2026-06-04
**Ticket:** Add button in app post-transaction that routes feedback and support to Discord with link.

## Goal

Give users a clear way to share feedback and get support via Discord at the
moment a transaction completes. Both post-transaction screens should expose
these entry points.

## Context

The widget has two post-transaction (completion) screens:

- `StepComplete.tsx` — "Transaction confirmed" (after selling rewards). It
  already renders a "Learn more about Pye" card containing a docs link and
  Telegram + X icon buttons.
- `RedeemComplete.tsx` — "Redeem confirmed" (after redeeming). It has **no**
  social/support section today.

There is currently **no Discord link anywhere** in the repo. The docs/Telegram/X
URLs are hardcoded inline inside `StepComplete.tsx`.

## Decisions

- **Two buttons:** "Share feedback" and "Get support", matching the ticket
  wording. Each backed by its own constant so they can point at different
  channels/invites later.
- **Both screens:** Repurpose the existing card on `StepComplete` and add a
  matching card to `RedeemComplete`.
- **Placeholder URLs:** Real Discord invites are not ready. Both Discord
  constants point to a placeholder (`https://discord.gg/pyefi`) marked with a
  `TODO`. Swapping in the real invites is a one-line change.
- **Keep docs/Telegram/X:** The existing docs link and TG/X icon buttons are
  retained, restyled into the shared card.

## Components

### 1. `packages/widget/src/links.ts` (new)

Single source of truth for all external links. De-hardcodes the existing
docs/TG/X URLs and adds the Discord constants.

```ts
export const LINKS = {
  docs: "https://docs.pye.fi/how-pye-works",
  telegram: "https://t.me/pyefi",
  x: "https://x.com/pyefinance",
  // TODO: replace with real Discord invites when ready
  discordFeedback: "https://discord.gg/pyefi",
  discordSupport: "https://discord.gg/pyefi",
};
```

### 2. `SupportCard` shared component (new, in `Layout.tsx`)

One reusable card consumed by both completion screens — no duplication.

- Header: "Have feedback or need help?"
- "Read the docs ↗" link (`LINKS.docs`).
- Telegram + X icon buttons (existing styling, now sourced from `LINKS`).
- Two new Discord buttons — "Share feedback" (`LINKS.discordFeedback`) and
  "Get support" (`LINKS.discordSupport`) — with a Discord icon, styled to
  match the existing raised/inset card aesthetic.
- All links open in a new tab: `target="_blank" rel="noreferrer"`.

A Discord icon is added to `Icons.tsx` (or inlined in the card) following the
existing inline-SVG pattern used for TG/X.

### 3. Wiring

- `StepComplete.tsx`: replace the inline "Learn more about Pye" block with
  `<SupportCard />`.
- `RedeemComplete.tsx`: add `<SupportCard />` before the final CTA.

## Data Flow

None. This is a presentational change plus static link constants. No store,
fetcher, transaction, or SDK logic is touched.

## Error Handling

N/A — static external links. Anchors use `rel="noreferrer"` for safety.

## Testing

- Visual check on both completion screens: card renders, layout matches the
  existing aesthetic, buttons are present and labeled.
- Each link opens the correct URL in a new tab.
- No regression to the existing docs/TG/X behavior.

## Out of Scope

- Real Discord invite URLs (placeholders until provided).
- Any in-app feedback form or ticketing (links route to Discord only).
- Routing/store changes.
