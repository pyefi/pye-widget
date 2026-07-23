# Pye Widget

Embeddable Solana staking widget: users sell future staking rewards for upfront SOL.
A pnpm + Turbo monorepo publishing two npm packages (`@pyefi/sdk`, `@pyefi/widget`).

## Commands
- Install: `pnpm install` (pnpm@9.15.0 — pinned in root `package.json`)
- Dev: `pnpm dev` (watch-builds sdk + widget, runs the two Next.js examples)
- Build: `pnpm build` (Turbo; builds `@pyefi/sdk` before `@pyefi/widget`)
- Typecheck: `pnpm typecheck` (runs `tsc --noEmit` per package)
- Lint: **none configured** — no ESLint/Biome/Prettier, no lint script. Don't invent one.

No automated test suite. Verify on-chain behavior by simulating against mainnet (see below).

## Stack
TypeScript, React 18/19, Vite 6 (widget) + tsup (SDK), Zustand 5 + Immer, `@solana/web3.js` + wallet-adapter + `@cks-systems/manifest-sdk`, Supabase (read-only data). pnpm + Turbo. No CI.

## Structure
- `packages/sdk/` — `@pyefi/sdk`, framework-free core. Entry: `src/index.ts` (barrel) + `src/react.ts` (`@pyefi/sdk/react` hooks/providers).
  - `src/lib/` — data fetch (`fetch-*.ts`), tx flows (`execute-*.ts`), validation, caches (`*-cache.ts`).
  - `src/stores/` — Zustand vanilla stores (`*-store.ts`). `src/constants/`, `src/react/` (syncers/providers).
- `packages/widget/` — `@pyefi/widget`. Entries: `src/index.ts` (React), `src/cdn-entry.ts` (IIFE/CDN), `src/PyeWidget.tsx` (root, wires Solana + SDK providers).
  - `src/components/screens/` — one file per flow step. `src/components/shared/Layout.tsx` — shared UI atoms. `src/stores/widget-store.ts` — flow/nav state.
- `examples/` — react/nextjs/cdn integration demos (single-validator & universal).
- Widget consumes the SDK via `workspace:*`; the SDK build must exist before the widget typechecks.

## Conventions
- **Styling is inline-only.** Use `c` (color tokens) and `font()`/`displayFont()` from `components/design-system.ts`; interactive states come from the `THEME_CSS` class string. No CSS files, no Tailwind.
- **Reuse shared atoms** from `components/shared/Layout.tsx` (`StepTitle`, `CTA`, `InlineError`, `SelectableRow`, `RecapRow`, `Spacer`…) — never re-implement a second copy.
- **SDK stays framework-free.** Lib functions take a `Connection` + params and return/throw. Keep tx builders (`buildX`) separate from signing wrappers (`executeX`) — see `execute-deposit-and-sell.ts` — so simulation and signing share one builder.
- **State split:** domain state in SDK Zustand stores (consumed via `@pyefi/sdk/react` hooks); widget flow/nav state in `widget-store.ts` (React-context store).
- **Money math is integer lamports.** Convert once with `solToLamports()` (`sdk/src/lib/deposit-validation.ts`); SOL is display-only via `truncateAmount`/`exactAmountString` (`design-system.ts`). Never do amount arithmetic in floats.
- **Errors:** SDK throws `DepositValidationError` (typed `.code` + user-facing `.message`); widget catches and shows `.message`.
- **File naming:** `execute-*` (tx), `fetch-*` (reads), `*-store`, `*-cache`.

## Gotchas
- **Build before typecheck on a fresh clone.** `typecheck` depends on `^build` (`turbo.json`); `@pyefi/sdk/react` won't resolve until the SDK's `dist/` exists. Run `pnpm build` first.
- **Never reorder the polyfill imports.** `import "./manifest-parser"` (side-effect, top of `execute-deposit-and-sell.ts`) and `buffer-polyfill` patch `Buffer` BigInt methods the Manifest SDK needs at module-eval time. Moving them breaks in-browser parsing.
- **Config comes from env vars** (`NEXT_PUBLIC_RPC_URL`, Supabase URL + anon key — see `examples/*/.env.local.example`). `.env*.local` is gitignored. NEVER hardcode or commit RPC/Supabase keys.
- **Lamport-precision trap (SIMD-0490).** Solana requires ≥1 SOL delegation on both sides of a stake split. A display-truncated "MAX" leaves sub-minimum dust and fails on-chain (`InstructionError [.., Custom:12]`). A full deposit must pass the *exact* balance via `exactAmountString`, never a 4-dp floor. See `AMOUNT_DUST_LAMPORTS` in `design-system.ts`.
- **`stakeBalanceSol` means DELEGATED stake, not account total** (excludes the rent reserve). Source it from `delegation.stake` — see the comments in the SDK deposit builders.
- **Deprecated bundled constants:** don't use the `validators` / `lockups` exports (`sdk/src/index.ts`) — use `createValidatorStore()` / `createLockupStore()`. They're removed in v1.0.
- **Versioning is lockstep:** `@pyefi/sdk` and `@pyefi/widget` share the same version — bump both together.

---

## How to work in this repo

**Think before you code.** If the request is ambiguous, state your assumptions and ask before building. If you see a simpler approach or a problem with the plan, say so first.

**Keep it simple.** Write the minimum code that solves the stated problem. No speculative abstractions, no unrequested features.

**Make surgical changes.** Touch only what the task requires. No drive-by refactors, no reformatting untouched code. Every changed line should trace to the request.

**Work to verifiable goals.** On-chain behavior is verifiable by simulating against mainnet (`connection.simulateTransaction`) — do that before claiming a tx fix works.

## Hard rules
- After any change: run `pnpm typecheck` and `pnpm build`. (There is no lint or test step.)
- Confirm scope before editing more than ~5 files, and call it out when a change spans both `packages/sdk` and `packages/widget`.
- Before adding code, check whether a shared atom (`shared/Layout.tsx`), SDK helper, or `design-system` util already does it — reuse over re-implement.
- **This is the client, not the chain.** On-chain program logic lives in the separate `pye-program-library` repo — you CANNOT fix a program bug here; client code only mirrors and validates against on-chain rules. Never edit `pye-program-library` from this repo.
- NEVER post to GitHub (PR comments, reviews, issues) or publish to npm without explicit permission.
- NEVER commit secrets or expose RPC/Supabase keys.

## Core user journeys
1. Sell rewards: connect wallet → select a stake position → choose amount → choose duration → review → sign **one** bundled transaction that deposits the stake and sells the resulting yield token for upfront SOL.
2. Redeem: view redeemable PT positions and redeem for SOL at/after maturity.
3. Integration parity: the widget must keep working as both an npm React import (`src/index.ts`) and a CDN `<script>` IIFE (`src/cdn-entry.ts`) — don't break either entry point.
