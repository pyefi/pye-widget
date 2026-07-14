# SIMD-0490 Deposit Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Speedstake widget users from building deposit transactions that fail under Solana's SIMD-0490 rule (minimum stake delegation raised from 1 lamport to 1 SOL, live on mainnet since 2026-06-18), and clearly inform the first depositor into an empty lockup that extra liquid SOL will be taken from their wallet.

**Architecture:** Validation logic lives in `@pyefi/sdk` as pure functions (testable, shared) plus small on-chain lookup helpers. The tx builders in the SDK gain defensive guards that throw descriptive errors. The widget's `ChooseAmount` screen surfaces amount-rule errors before the user proceeds, and `ReviewQuote` shows a first-depositor banner and blocks signing when the wallet can't cover initialization. Finally both packages are version-bumped and `pye-speedstake` updates its `@pyefi/widget` pin.

**Tech Stack:** TypeScript, `@solana/web3.js` ^1.90 (installed 1.98.4), React 18 widget (inline styles via `design-system.ts`), Zustand stores, pnpm + turbo monorepo, tsup (sdk build), vite (widget build), vitest (new, sdk tests only).

## Global Constraints

- **Never hardcode 1 SOL.** The minimum delegation MUST come from `connection.getStakeMinimumDelegation()` at runtime (returns `RpcResponseAndContext<number>`, lamports in `.value`). Verified live on mainnet: currently 1 SOL, but treat as dynamic.
- **All arithmetic in integer lamports.** Convert to SOL only for display.
- **Full-balance deposits must never be blocked by new validation.** Depositing the entire stake account performs no split, creates no new stake account, and is unaffected by SIMD-0490 regardless of size.
- The rules being enforced (derived from `StakeProgram.split` semantics under SIMD-0490 — a split creates a NEW stake account, and both the new piece and the remainder must each hold ≥ the minimum delegation):
  - Partial deposit piece: `amountLamports >= minDelegationLamports`
  - Partial deposit remainder: `stakeAccountLamports - rentExemptLamports - amountLamports >= minDelegationLamports` (the remainder account keeps its rent reserve; only its delegated stake shrinks)
- First-deposit rule (from the on-chain bonds program `solo_validator/deposit_stake.rs`): when the bond's stake account PDA (seeds `["stake", bond]`, program `PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx`) does not exist, the program pulls `minimumDelegation + rentExempt` liquid lamports from the depositor's wallet and credits them back as PT/YT.
- **Exact user-facing copy** (use verbatim, `{min}` / `{extra}` = SOL amounts formatted with up to 4 decimals):
  - Partial too small: `Partial deposits must be at least {min} SOL — Solana's new minimum stake. Use MAX to deposit the full balance instead.`
  - Remainder too small: `This would leave less than {min} SOL in your stake account, which Solana no longer allows. Use MAX to deposit the full balance, or lower the amount.`
  - First-depositor info banner: `You're the first depositor in this lockup. An extra {extra} SOL will be taken from your wallet to initialize it — you receive it back as PT/YT, so it counts toward your deposit.`
  - First-depositor insufficient balance: `Your wallet needs at least {extra} SOL (plus fees) to initialize this lockup.`
- No new runtime dependencies. `vitest` is added as a devDependency of `packages/sdk` only.
- Monorepo commands: `pnpm typecheck` (turbo, all packages), `pnpm build` (turbo). SDK tests: `pnpm --filter @pyefi/sdk test`.
- Repo: `/Users/serag/Documents/GitHub/pye-widget`, branch `feat/simd-490-deposit-validation` (already created from `origin/master`, packages at 0.1.10).
- Widget code style: inline styles using `c` / `font` from `../design-system`, shared atoms from `../shared/Layout` (`InlineError` renders `{ message?: string | null }`).
- The liquid-SOL deposit path in the widget is disabled (SelectPosition offers stake accounts only); validation targets the stake-account path. Keep the existing `isLiquidSol` checks intact.

---

### Task 1: Pure amount-validation module in the SDK (with vitest setup)

**Files:**
- Modify: `packages/sdk/package.json` (add vitest devDependency + test script)
- Create: `packages/sdk/src/lib/deposit-validation.ts`
- Test: `packages/sdk/src/lib/deposit-validation.test.ts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `validateStakeDepositAmount(params: ValidateStakeDepositAmountParams): StakeDepositAmountValidation` and types `ValidateStakeDepositAmountParams`, `StakeDepositAmountValidation`, `DepositValidationCode`. Later tasks import these from `../lib/deposit-validation` (SDK-internal) and from `@pyefi/sdk` (widget).

- [ ] **Step 1: Add vitest to the SDK package**

In `packages/sdk/package.json`, add to `devDependencies` (create alphabetically among existing devDeps):

```json
"vitest": "^3.0.0"
```

and add to `scripts`:

```json
"test": "vitest run"
```

Run: `pnpm install`
Expected: lockfile updates, vitest installed.

- [ ] **Step 2: Write the failing tests**

Create `packages/sdk/src/lib/deposit-validation.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateStakeDepositAmount } from "./deposit-validation";

const MIN = 1_000_000_000; // 1 SOL minimum delegation
const RENT = 2_282_880; // stake account rent-exempt reserve

function params(amountLamports: number, stakeAccountLamports: number) {
  return {
    amountLamports,
    stakeAccountLamports,
    minDelegationLamports: MIN,
    rentExemptLamports: RENT,
  };
}

describe("validateStakeDepositAmount", () => {
  it("rejects zero amount", () => {
    const v = validateStakeDepositAmount(params(0, 5_000_000_000));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe("AMOUNT_NOT_POSITIVE");
  });

  it("rejects negative amount", () => {
    const v = validateStakeDepositAmount(params(-1, 5_000_000_000));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe("AMOUNT_NOT_POSITIVE");
  });

  it("rejects amount above balance", () => {
    const v = validateStakeDepositAmount(params(5_000_000_001, 5_000_000_000));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe("EXCEEDS_BALANCE");
  });

  it("allows full-balance deposit of any size (no split, SIMD-0490 does not apply)", () => {
    const v = validateStakeDepositAmount(params(500_000_000, 500_000_000));
    expect(v).toEqual({ ok: true, isPartial: false });
  });

  it("allows a valid partial deposit", () => {
    // balance 5 SOL: piece 2 SOL, remainder stake 5 - rent - 2 ≈ 2.997 SOL — both ≥ 1 SOL
    const v = validateStakeDepositAmount(params(2_000_000_000, 5_000_000_000));
    expect(v).toEqual({ ok: true, isPartial: true });
  });

  it("rejects a partial piece below minimum delegation", () => {
    const v = validateStakeDepositAmount(params(999_999_999, 5_000_000_000));
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.code).toBe("PARTIAL_BELOW_MINIMUM");
      expect(v.message).toBe(
        "Partial deposits must be at least 1 SOL — Solana's new minimum stake. Use MAX to deposit the full balance instead.",
      );
    }
  });

  it("rejects a partial that leaves the remainder below minimum delegation", () => {
    // balance = rent + 2 SOL - 1 lamport → remainder stake after 1 SOL piece = 0.999999999 SOL
    const v = validateStakeDepositAmount(
      params(1_000_000_000, RENT + 2_000_000_000 - 1),
    );
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.code).toBe("REMAINDER_BELOW_MINIMUM");
      expect(v.message).toBe(
        "This would leave less than 1 SOL in your stake account, which Solana no longer allows. Use MAX to deposit the full balance, or lower the amount.",
      );
    }
  });

  it("accepts the exact boundary: piece == min and remainder == min", () => {
    // balance = rent + 2 SOL → piece 1 SOL, remainder stake exactly 1 SOL
    const v = validateStakeDepositAmount(
      params(1_000_000_000, RENT + 2_000_000_000),
    );
    expect(v).toEqual({ ok: true, isPartial: true });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @pyefi/sdk test`
Expected: FAIL — cannot resolve `./deposit-validation`.

- [ ] **Step 4: Write the implementation**

Create `packages/sdk/src/lib/deposit-validation.ts`:

```typescript
/**
 * Client-side validation for stake-account deposits under SIMD-0490
 * (minimum stake delegation raised to 1 SOL on mainnet, 2026-06-18).
 *
 * A partial deposit splits the user's stake account, which creates a NEW
 * stake account — both the split piece and the remainder must each keep at
 * least the network minimum delegation. Full-balance deposits perform no
 * split and are never blocked here.
 */

export const DEPOSIT_VALIDATION_CODES = {
  AMOUNT_NOT_POSITIVE: "AMOUNT_NOT_POSITIVE",
  EXCEEDS_BALANCE: "EXCEEDS_BALANCE",
  PARTIAL_BELOW_MINIMUM: "PARTIAL_BELOW_MINIMUM",
  REMAINDER_BELOW_MINIMUM: "REMAINDER_BELOW_MINIMUM",
} as const;

export type DepositValidationCode = keyof typeof DEPOSIT_VALIDATION_CODES;

export interface ValidateStakeDepositAmountParams {
  /** Lamports the user wants to deposit. */
  amountLamports: number;
  /** Total lamports held by the user's stake account (delegation + rent reserve). */
  stakeAccountLamports: number;
  /** Network minimum delegation in lamports (from getStakeMinimumDelegationLamports). */
  minDelegationLamports: number;
  /** Rent-exempt reserve for a stake account in lamports. */
  rentExemptLamports: number;
}

export type StakeDepositAmountValidation =
  | { ok: true; isPartial: boolean }
  | { ok: false; code: DepositValidationCode; message: string };

function formatSol(lamports: number): string {
  return (lamports / 1e9).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

export function validateStakeDepositAmount(
  p: ValidateStakeDepositAmountParams,
): StakeDepositAmountValidation {
  if (p.amountLamports <= 0) {
    return {
      ok: false,
      code: "AMOUNT_NOT_POSITIVE",
      message: "Amount must be greater than 0",
    };
  }
  if (p.amountLamports > p.stakeAccountLamports) {
    return {
      ok: false,
      code: "EXCEEDS_BALANCE",
      message: `Maximum available is ${formatSol(p.stakeAccountLamports)} SOL`,
    };
  }

  const isPartial = p.amountLamports < p.stakeAccountLamports;
  if (!isPartial) return { ok: true, isPartial: false };

  const min = formatSol(p.minDelegationLamports);
  if (p.amountLamports < p.minDelegationLamports) {
    return {
      ok: false,
      code: "PARTIAL_BELOW_MINIMUM",
      message: `Partial deposits must be at least ${min} SOL — Solana's new minimum stake. Use MAX to deposit the full balance instead.`,
    };
  }

  const remainderStake =
    p.stakeAccountLamports - p.rentExemptLamports - p.amountLamports;
  if (remainderStake < p.minDelegationLamports) {
    return {
      ok: false,
      code: "REMAINDER_BELOW_MINIMUM",
      message: `This would leave less than ${min} SOL in your stake account, which Solana no longer allows. Use MAX to deposit the full balance, or lower the amount.`,
    };
  }

  return { ok: true, isPartial: true };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @pyefi/sdk test`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/package.json pnpm-lock.yaml packages/sdk/src/lib/deposit-validation.ts packages/sdk/src/lib/deposit-validation.test.ts
git commit -m "feat(sdk): add SIMD-0490 stake deposit amount validation"
```

---

### Task 2: Shared PDA module

**Files:**
- Create: `packages/sdk/src/lib/pdas.ts`
- Test: `packages/sdk/src/lib/pdas.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `BONDS_PROGRAM_ID: PublicKey`, `deriveStakeAccount(bond: PublicKey): PublicKey`. Task 3 and Task 4 import from `./pdas`. (Existing private duplicates in `execute-stake-deposit.ts` / `execute-deposit-and-sell.ts` / `execute-redeem.ts` are refactored in Task 4 only where those files are already being modified.)

- [ ] **Step 1: Write the failing test**

Create `packages/sdk/src/lib/pdas.test.ts`. The expected PDA is a real mainnet pair: bond `9Ft2dw64aVsX62GTSeHuTMSHtq6BcoSj5xm4JbbE3bhJ` (a Decentra lockup) whose stake account (from the backend DB) is `5qobm2A5y1dvoEMmqj9bCPjaJyLz2MkGwFrYEJ5BP9jq`.

```typescript
import { describe, it, expect } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { BONDS_PROGRAM_ID, deriveStakeAccount } from "./pdas";

describe("pdas", () => {
  it("exposes the bonds program id", () => {
    expect(BONDS_PROGRAM_ID.toBase58()).toBe(
      "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
    );
  });

  it("derives the bond stake account PDA (verified against mainnet data)", () => {
    const bond = new PublicKey("9Ft2dw64aVsX62GTSeHuTMSHtq6BcoSj5xm4JbbE3bhJ");
    expect(deriveStakeAccount(bond).toBase58()).toBe(
      "5qobm2A5y1dvoEMmqj9bCPjaJyLz2MkGwFrYEJ5BP9jq",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pyefi/sdk test`
Expected: FAIL — cannot resolve `./pdas`.

- [ ] **Step 3: Write the implementation**

Create `packages/sdk/src/lib/pdas.ts` (extracted verbatim from `execute-stake-deposit.ts:18-20,70-76`):

```typescript
import { PublicKey } from "@solana/web3.js";

export const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

/** PDA holding a solo-validator lockup's stake, seeds ["stake", bond]. */
export function deriveStakeAccount(bond: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), bond.toBuffer()],
    BONDS_PROGRAM_ID,
  );
  return pda;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @pyefi/sdk test`
Expected: PASS (10 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/lib/pdas.ts packages/sdk/src/lib/pdas.test.ts
git commit -m "feat(sdk): extract shared bond stake-account PDA derivation"
```

---

### Task 3: On-chain requirement helpers

**Files:**
- Create: `packages/sdk/src/lib/stake-requirements.ts`
- Test: `packages/sdk/src/lib/stake-requirements.test.ts`

**Interfaces:**
- Consumes: `deriveStakeAccount` from `./pdas` (Task 2).
- Produces:
  - `getStakeMinimumDelegationLamports(connection: Connection): Promise<number>`
  - `getStakeRentExemptLamports(connection: Connection): Promise<number>`
  - `getFirstDepositRequirement(connection: Connection, bondPubkey: string | PublicKey): Promise<FirstDepositRequirement>`
  - `interface FirstDepositRequirement { isFirstDeposit: boolean; requiredExtraLamports: number }`

- [ ] **Step 1: Write the failing tests**

Create `packages/sdk/src/lib/stake-requirements.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type { Connection } from "@solana/web3.js";
import {
  getStakeMinimumDelegationLamports,
  getStakeRentExemptLamports,
  getFirstDepositRequirement,
} from "./stake-requirements";

const BOND = "9Ft2dw64aVsX62GTSeHuTMSHtq6BcoSj5xm4JbbE3bhJ";

function fakeConnection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    getStakeMinimumDelegation: async () => ({
      context: { slot: 1 },
      value: 1_000_000_000,
    }),
    getMinimumBalanceForRentExemption: async () => 2_282_880,
    getAccountInfo: async () => null,
    ...overrides,
  } as unknown as Connection;
}

describe("stake-requirements", () => {
  it("reads the minimum delegation from the RPC", async () => {
    expect(await getStakeMinimumDelegationLamports(fakeConnection())).toBe(
      1_000_000_000,
    );
  });

  it("reads the stake rent-exempt reserve from the RPC", async () => {
    expect(await getStakeRentExemptLamports(fakeConnection())).toBe(2_282_880);
  });

  it("flags a first deposit when the lockup stake account does not exist", async () => {
    const req = await getFirstDepositRequirement(fakeConnection(), BOND);
    expect(req).toEqual({
      isFirstDeposit: true,
      requiredExtraLamports: 1_002_282_880,
    });
  });

  it("returns zero extra when the lockup stake account exists", async () => {
    const conn = fakeConnection({
      getAccountInfo: async () => ({ lamports: 5, data: Buffer.alloc(0) }),
    });
    const req = await getFirstDepositRequirement(conn, BOND);
    expect(req).toEqual({ isFirstDeposit: false, requiredExtraLamports: 0 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @pyefi/sdk test`
Expected: FAIL — cannot resolve `./stake-requirements`.

- [ ] **Step 3: Write the implementation**

Create `packages/sdk/src/lib/stake-requirements.ts`:

```typescript
import { Connection, PublicKey, StakeProgram } from "@solana/web3.js";
import { deriveStakeAccount } from "./pdas";

/** Network minimum stake delegation in lamports (1 SOL since SIMD-0490). */
export async function getStakeMinimumDelegationLamports(
  connection: Connection,
): Promise<number> {
  const res = await connection.getStakeMinimumDelegation();
  return res.value;
}

/** Rent-exempt reserve for a stake account in lamports. */
export async function getStakeRentExemptLamports(
  connection: Connection,
): Promise<number> {
  return connection.getMinimumBalanceForRentExemption(StakeProgram.space);
}

export interface FirstDepositRequirement {
  /** True when the lockup's stake account PDA does not exist yet. */
  isFirstDeposit: boolean;
  /**
   * Extra liquid lamports the bonds program pulls from the depositor's
   * wallet to initialize the lockup stake account (credited back as PT/YT).
   * Zero when the lockup is already initialized.
   */
  requiredExtraLamports: number;
}

export async function getFirstDepositRequirement(
  connection: Connection,
  bondPubkey: string | PublicKey,
): Promise<FirstDepositRequirement> {
  const stakePda = deriveStakeAccount(new PublicKey(bondPubkey));
  const info = await connection.getAccountInfo(stakePda);
  if (info != null) return { isFirstDeposit: false, requiredExtraLamports: 0 };
  const [min, rent] = await Promise.all([
    getStakeMinimumDelegationLamports(connection),
    getStakeRentExemptLamports(connection),
  ]);
  return { isFirstDeposit: true, requiredExtraLamports: min + rent };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @pyefi/sdk test`
Expected: PASS (14 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/lib/stake-requirements.ts packages/sdk/src/lib/stake-requirements.test.ts
git commit -m "feat(sdk): add stake minimum-delegation and first-deposit requirement helpers"
```

---

### Task 4: Defensive guards in the SDK transaction builders

**Files:**
- Modify: `packages/sdk/src/lib/execute-stake-deposit.ts` (guard in `executeStakeAccountDeposit`, ~line 149-161; also replace its private `deriveStakeAccount`/`BONDS_PROGRAM_ID` with imports from `./pdas`)
- Modify: `packages/sdk/src/lib/execute-deposit-and-sell.ts` (guard in `buildDepositAndSellTx`, ~line 213; same PDA refactor)

**Interfaces:**
- Consumes: `validateStakeDepositAmount` (Task 1), `getStakeMinimumDelegationLamports` (Task 3), `BONDS_PROGRAM_ID`/`deriveStakeAccount` (Task 2).
- Produces: `executeStakeAccountDeposit` and `buildDepositAndSellTx` now throw `Error(validation.message)` before building an invalid transaction. Signatures unchanged.

- [ ] **Step 1: Refactor PDA duplicates in the two files**

In both `execute-stake-deposit.ts` and `execute-deposit-and-sell.ts`:
- Delete the local `const BONDS_PROGRAM_ID = new PublicKey("PYEQ...")` and the local `function deriveStakeAccount(...)`.
- Add: `import { BONDS_PROGRAM_ID, deriveStakeAccount } from "./pdas";`
- Leave `deriveGlobalSettings` and other locals untouched. Do NOT touch `execute-redeem.ts`.

Run: `pnpm --filter @pyefi/sdk typecheck`
Expected: clean.

- [ ] **Step 2: Add the guard to `executeStakeAccountDeposit`**

In `execute-stake-deposit.ts`, the function already fetches `rentExemptReserve` in a `Promise.all` (~line 149) and computes `amountLamports` / `totalLamports` / `isPartial` (~line 158-161). Extend the `Promise.all` with the minimum-delegation fetch and validate immediately after the lamports are computed:

```typescript
import { validateStakeDepositAmount } from "./deposit-validation";
import { getStakeMinimumDelegationLamports } from "./stake-requirements";
```

Extend the existing parallel fetch (keep existing entries and order, append one):

```typescript
const [protocolFeeWallet, transientStakeAccount, rentExemptReserve, latestBlockhash, minDelegationLamports] =
  await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    fetchTransientStakeAccount(connection, bond),
    connection.getMinimumBalanceForRentExemption(StakeProgram.space),
    connection.getLatestBlockhash("confirmed"),
    getStakeMinimumDelegationLamports(connection),
  ]);
```

Immediately after `const isPartial = amountLamports < totalLamports;`:

```typescript
const validation = validateStakeDepositAmount({
  amountLamports,
  stakeAccountLamports: totalLamports,
  minDelegationLamports,
  rentExemptLamports: rentExemptReserve,
});
if (!validation.ok) throw new Error(validation.message);
```

- [ ] **Step 3: Add the same guard to `buildDepositAndSellTx`**

In `execute-deposit-and-sell.ts`, locate where `amountLamports` / `totalLamports` / `isPartial` are computed (~line 213) and the rent-exempt fetch feeding the split. Apply the identical pattern: fetch `minDelegationLamports` via `getStakeMinimumDelegationLamports(connection)` alongside the function's existing parallel RPC fetches (or `await` it just before the lamports computation if there is no suitable `Promise.all`), then run `validateStakeDepositAmount` with the same argument mapping and `throw new Error(validation.message)` when not ok.

- [ ] **Step 4: Typecheck and test**

Run: `pnpm --filter @pyefi/sdk typecheck && pnpm --filter @pyefi/sdk test`
Expected: both clean/PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/lib/execute-stake-deposit.ts packages/sdk/src/lib/execute-deposit-and-sell.ts
git commit -m "feat(sdk): guard deposit builders against SIMD-0490-invalid splits"
```

---

### Task 5: Export the new SDK API

**Files:**
- Modify: `packages/sdk/src/index.ts` (near the existing deposit exports, ~line 91-93)

**Interfaces:**
- Produces (consumed by the widget in Tasks 6-7 via `@pyefi/sdk`): `validateStakeDepositAmount`, `ValidateStakeDepositAmountParams`, `StakeDepositAmountValidation`, `DepositValidationCode`, `getStakeMinimumDelegationLamports`, `getStakeRentExemptLamports`, `getFirstDepositRequirement`, `FirstDepositRequirement`, `deriveStakeAccount`, `BONDS_PROGRAM_ID`.

- [ ] **Step 1: Add exports**

In `packages/sdk/src/index.ts`, after the existing `execute-stake-deposit` export line:

```typescript
export {
  validateStakeDepositAmount,
  DEPOSIT_VALIDATION_CODES,
  type ValidateStakeDepositAmountParams,
  type StakeDepositAmountValidation,
  type DepositValidationCode,
} from "./lib/deposit-validation";
export {
  getStakeMinimumDelegationLamports,
  getStakeRentExemptLamports,
  getFirstDepositRequirement,
  type FirstDepositRequirement,
} from "./lib/stake-requirements";
export { deriveStakeAccount, BONDS_PROGRAM_ID } from "./lib/pdas";
```

- [ ] **Step 2: Build and typecheck the SDK**

Run: `pnpm --filter @pyefi/sdk build && pnpm --filter @pyefi/sdk typecheck`
Expected: clean build, `dist/index.js` + `dist/index.d.ts` regenerate.

- [ ] **Step 3: Commit**

```bash
git add packages/sdk/src/index.ts
git commit -m "feat(sdk): export SIMD-0490 deposit validation API"
```

---

### Task 6: ChooseAmount screen — enforce split minimums

**Files:**
- Modify: `packages/widget/src/components/screens/ChooseAmount.tsx` (imports ~line 1-4, component state ~line 55-63, validation block ~line 101-108)

**Interfaces:**
- Consumes: `validateStakeDepositAmount`, `getStakeMinimumDelegationLamports`, `getStakeRentExemptLamports` from `@pyefi/sdk`; `useConnection` from `@solana/wallet-adapter-react` (already an external dep — `ChooseDuration.tsx:2` uses the same import).
- Produces: the existing `error: string | null` gains the two SIMD messages; `isValid` (already `!!depositAmount && !error && parsed > 0`) automatically blocks the CTA. No prop/type changes.

- [ ] **Step 1: Add imports and requirement state**

At the top of `ChooseAmount.tsx`:

```typescript
import { useEffect, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  getStakeMinimumDelegationLamports,
  getStakeRentExemptLamports,
  validateStakeDepositAmount,
} from "@pyefi/sdk";
```

Inside the component, after the existing store selectors (~line 62):

```typescript
const { connection } = useConnection();
const [stakeMinLamports, setStakeMinLamports] = useState<number | null>(null);
const [rentExemptLamports, setRentExemptLamports] = useState<number | null>(null);

useEffect(() => {
  let cancelled = false;
  Promise.all([
    getStakeMinimumDelegationLamports(connection),
    getStakeRentExemptLamports(connection),
  ])
    .then(([min, rent]) => {
      if (cancelled) return;
      setStakeMinLamports(min);
      setRentExemptLamports(rent);
    })
    .catch(() => {
      // Leave null: screen falls back to legacy checks and the SDK
      // builder guard still rejects invalid splits at sign time.
    });
  return () => {
    cancelled = true;
  };
}, [connection]);
```

- [ ] **Step 2: Extend the validation block**

Replace the existing block at ~line 101-108 with (existing lines kept, one new check appended before `isValid`):

```typescript
let error: string | null = null;
let warning: string | null = null;
if (depositAmount && parsed <= 0) error = "Amount must be greater than 0";
if (depositAmount && parsed > available) error = `Maximum available is ${available} SOL`;
if (!error && isLiquidSol && parsed > 0 && parsed >= available - GAS_RESERVE)
  warning = "This leaves very little SOL for transaction fees";
if (
  !error &&
  !isLiquidSol &&
  parsed > 0 &&
  stakeMinLamports != null &&
  rentExemptLamports != null
) {
  const v = validateStakeDepositAmount({
    amountLamports: Math.round(parsed * 1e9),
    stakeAccountLamports: Math.round(available * 1e9),
    minDelegationLamports: stakeMinLamports,
    rentExemptLamports,
  });
  if (!v.ok) error = v.message;
}

const isValid = !!depositAmount && !error && parsed > 0;
```

Note: `available` is the full stake-account balance in SOL (set from `account.lamports / 1e9` in `SelectPosition.tsx`), so `Math.round(available * 1e9)` reconstructs the account lamports. The 100% pill / MAX produces `parsed === available` → full deposit → always valid, per Global Constraints.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @pyefi/widget typecheck`
Expected: clean. (Error rendering needs no change — the existing `InlineError`/error display consumes the `error` string.)

- [ ] **Step 4: Commit**

```bash
git add packages/widget/src/components/screens/ChooseAmount.tsx
git commit -m "feat(widget): enforce SIMD-0490 split minimums on deposit amount"
```

---

### Task 7: ReviewQuote screen — first-depositor banner and wallet-balance gate

**Files:**
- Modify: `packages/widget/src/components/screens/ReviewQuote.tsx` (imports ~line 1-10, state near `const { connection } = useConnection()` ~line 115, `canSign` ~line 367-372, render near the liquidity warning ~line 705-719)

**Interfaces:**
- Consumes: `getFirstDepositRequirement`, `FirstDepositRequirement` from `@pyefi/sdk`; the already-resolved `stakeBond` (bond row keyed `${voteAccount}:${maturityId}`, ~line 251-280); `useWalletStore((s) => s.balanceLamports)`.
- Produces: `canSign` additionally requires `!insufficientForInit`; two new UI blocks (info banner, blocking error).

- [ ] **Step 1: Add imports, state, and fetch effect**

```typescript
import { getFirstDepositRequirement, type FirstDepositRequirement } from "@pyefi/sdk";
```

Inside the component (after `stakeBond` is derived):

```typescript
const balanceLamports = useWalletStore((s) => s.balanceLamports);
const [firstDeposit, setFirstDeposit] = useState<FirstDepositRequirement | null>(null);

useEffect(() => {
  if (!stakeBond) {
    setFirstDeposit(null);
    return;
  }
  let cancelled = false;
  getFirstDepositRequirement(connection, stakeBond.pubkey)
    .then((r) => {
      if (!cancelled) setFirstDeposit(r);
    })
    .catch(() => {
      if (!cancelled) setFirstDeposit(null); // fail open: sim/send surfaces it
    });
  return () => {
    cancelled = true;
  };
}, [connection, stakeBond?.pubkey]);

/** Headroom for tx fees + ATA rent on top of the initialization amount. */
const FEE_BUFFER_LAMPORTS = 10_000_000; // 0.01 SOL

const insufficientForInit =
  firstDeposit?.isFirstDeposit === true &&
  balanceLamports != null &&
  balanceLamports < firstDeposit.requiredExtraLamports + FEE_BUFFER_LAMPORTS;

const extraSol = firstDeposit?.isFirstDeposit
  ? (firstDeposit.requiredExtraLamports / 1e9).toLocaleString("en-US", {
      maximumFractionDigits: 4,
    })
  : null;
```

(If `useState`/`useEffect` or `useWalletStore` are not yet imported in this file, add them to the existing import lines.)

- [ ] **Step 2: Gate signing**

Extend the existing `canSign` expression (~line 367) with one more conjunct:

```typescript
const canSign =
  !!selectedStakeAccountPubkey &&
  !!selectedMaturityId &&
  !isLoading &&
  hasLiquidity &&
  selectedStakeStillOwned &&
  !insufficientForInit;
```

- [ ] **Step 3: Render the banner and the blocking message**

Directly above the existing liquidity-warning block (~line 705), following the same inline-style conventions used by that block (`c` and `font` from the design system):

```tsx
{firstDeposit?.isFirstDeposit && !insufficientForInit && extraSol && (
  <div style={{ padding: 12, borderRadius: 8, background: c.shadow, marginBottom: 8 }}>
    <p style={{ ...font(13, c.text) }}>
      You're the first depositor in this lockup. An extra {extraSol} SOL will
      be taken from your wallet to initialize it — you receive it back as
      PT/YT, so it counts toward your deposit.
    </p>
  </div>
)}
{insufficientForInit && extraSol && (
  <div style={{ padding: 12, borderRadius: 8, background: c.shadow, marginBottom: 8 }}>
    <p style={{ ...font(13, c.red) }}>
      Your wallet needs at least {extraSol} SOL (plus fees) to initialize this
      lockup.
    </p>
  </div>
)}
```

Match the exact color/token names used by the adjacent liquidity-warning block in this file (agent implementing: read that block first and mirror its style props; `c.shadow`/`c.text`/`c.red` above are the expected tokens — adjust only if the neighboring block uses different ones).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @pyefi/widget typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/widget/src/components/screens/ReviewQuote.tsx
git commit -m "feat(widget): first-depositor initialization banner and wallet-balance gate"
```

---

### Task 8: Build, version bump, and full verification

**Files:**
- Modify: `packages/sdk/package.json` (version `0.1.10` → `0.1.11`)
- Modify: `packages/widget/package.json` (version `0.1.10` → `0.1.11`; if it pins `@pyefi/sdk` by version rather than `workspace:*`, bump that reference too)

- [ ] **Step 1: Bump versions**

Set `"version": "0.1.11"` in both package.json files.

- [ ] **Step 2: Full monorepo verification**

Run: `pnpm typecheck && pnpm build && pnpm --filter @pyefi/sdk test`
Expected: all green; `packages/widget/dist/pye-widget.es.js` and `packages/sdk/dist/` rebuilt.

- [ ] **Step 3: Manual smoke test with the example app**

Run: `pnpm dev` (turbo watch builds sdk + widget + example Next.js apps; note the port the `nextjs-universal` example prints). In a browser with a wallet holding at least one active mainnet stake account:
1. Open the example app, connect wallet, select a stake account.
2. On ChooseAmount, enter an amount below 1 SOL on an account larger than that amount → expect the exact "Partial deposits must be at least 1 SOL…" error and disabled CTA.
3. Enter an amount that leaves less than 1 SOL behind → expect the "This would leave less than 1 SOL…" error.
4. Press MAX → error clears, CTA enables.
5. Proceed to ReviewQuote against a validator whose lockup has zero deposits (e.g. Nodz or Decentra — verify current state first) → expect the first-depositor banner; with a wallet under ~1.01 liquid SOL expect the blocking message and disabled sign.
Do NOT send the transaction during the smoke test unless intentionally performing the production seed.

- [ ] **Step 4: Commit**

```bash
git add packages/sdk/package.json packages/widget/package.json
git commit -m "chore: release 0.1.11 — SIMD-0490 deposit validation"
```

---

### Task 9: Publish and integrate into pye-speedstake (partially human-gated)

**Files:**
- Modify: `/Users/serag/Documents/GitHub/pye-speedstake/package.json` (`"@pyefi/widget": "0.1.9"` → `"0.1.11"`)

- [ ] **Step 1 (HUMAN): Merge and publish**

Open a PR for `feat/simd-490-deposit-validation` → `master` in pye-widget. After merge, publish `@pyefi/sdk@0.1.11` then `@pyefi/widget@0.1.11` to npm (requires npm credentials — do not attempt from an agent; follow whatever release process produced `release/v0.1.10`).

- [ ] **Step 2: Bump the widget in pye-speedstake**

```bash
cd /Users/serag/Documents/GitHub/pye-speedstake
git checkout -b chore/widget-0.1.11 origin/main
# edit package.json: "@pyefi/widget": "0.1.11"
pnpm install
pnpm build
```

Expected: install resolves 0.1.11, Next.js build succeeds.

- [ ] **Step 3: Verify on the site**

Run: `pnpm dev` and walk the same smoke-test steps from Task 8 Step 3 on the local Speedstake site (`/` and a validator page such as `/decentra`).

- [ ] **Step 4: Commit and PR**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: bump @pyefi/widget to 0.1.11 (SIMD-0490 deposit validation)"
```

Open a PR to `main`.

---

## Out of Scope (follow-up plans)

- **pye-frontend-v2 (main app):** `src/components/lockupDetailPage/library/StakeDepositForm.tsx` + `src/lib/execute-stake-deposit.ts` have the same split logic and the same validation gap. Once the SDK is published, mirror Tasks 6-7 there (or migrate it to consume `@pyefi/sdk`). Separate plan.
- **Seeding the 138 open zero-deposit lockups** (operational, ~139 SOL via `deposit_sol` or ~277 SOL via stake accounts) — decided and executed by the team, not code.
- **Pye Status dashboard** zero-deposit visibility (separate repo/plan).
