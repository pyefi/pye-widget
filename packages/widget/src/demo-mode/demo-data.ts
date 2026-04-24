/**
 * Demo-mode fixtures — used when the widget is mounted with demo={true}.
 *
 * Validator ids and vote accounts are real so SDK lookups resolve, but
 * balances, stake accounts, and transaction signatures are synthetic.
 */
import {
  allowedLockups,
  validators,
  type ValidatorId,
  type MaturityId,
  type UserStakeAccount,
  type Balances,
} from "@pye/sdk";

// Valid base58, decodes to a 32-byte pubkey (one short of all-1s, so not the
// system program). Not owned by anyone — purely synthetic for the demo flow.
const FAKE_WALLET_ADDRESS = "1nc1nerator11111111111111111111111111111111";
const FAKE_WALLET_DISPLAY = "1nc1...1111";

export const demoWallet = {
  publicKey: FAKE_WALLET_ADDRESS,
  displayAddress: FAKE_WALLET_DISPLAY,
  balanceLamports: 42 * 1_000_000_000, // 42 SOL
};

function pickDemoValidators(): ValidatorId[] {
  const allowed = allowedLockups();
  const ids: ValidatorId[] = [];
  for (const [id, mats] of Object.entries(allowed) as [ValidatorId, (typeof allowed)[ValidatorId]][]) {
    if (!mats) continue;
    if (mats.q32026 && validators[id]) {
      ids.push(id);
      if (ids.length === 2) break;
    }
  }
  return ids;
}

// Two valid base58 addresses, each decoding to exactly 32 bytes. Purely
// synthetic — just filler for the demo stake account list.
const DEMO_STAKE_PUBKEYS = [
  "Stake11111111111111111111111111111111111112",
  "Stake11111111111111111111111111111111111113",
];

export function buildDemoStakeAccounts(): UserStakeAccount[] {
  const ids = pickDemoValidators();
  const sizes = [50, 12]; // SOL
  const accounts: UserStakeAccount[] = [];
  ids.forEach((id, i) => {
    const v = validators[id];
    if (!v) return;
    accounts.push({
      pubkey: DEMO_STAKE_PUBKEYS[i]!,
      validatorVoteAccount: v.vote_account,
      validatorName: v.name,
      validatorIcon: "",
      validatorLogo: null,
      validatorAltPubkey: null,
      lamports: sizes[i]! * 1_000_000_000,
      state: "active",
    } as UserStakeAccount);
  });
  return accounts;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Fake PT balances for the first demo validator across a mix of maturities.
 * Using real PT mint addresses from `allowedLockups` so the widget's PT
 * lookup resolves them and renders them on the Welcome / Redeem screens.
 *
 * - q12026 (Mar 31, 2026) → matured, eligible to redeem now.
 * - q22026 (Jun 30, 2026) → still locked.
 * - q32026 (Sep 30, 2026) → still locked.
 */
export function buildDemoWalletBalances(): Balances {
  const [firstValidator] = pickDemoValidators();
  if (!firstValidator) return {};
  const lockups = allowedLockups()[firstValidator];
  if (!lockups) return {};

  const allocations: Partial<Record<MaturityId, number>> = {
    q12026: 8,   // matured — appears as redeemable
    q22026: 4,
    q32026: 12,
  };

  const balances: Balances = {};
  for (const [mat, sol] of Object.entries(allocations) as [MaturityId, number][]) {
    const bond = lockups[mat];
    if (!bond) continue;
    balances[bond.pt_address] = sol * LAMPORTS_PER_SOL;
  }
  return balances;
}

export function fakeTxSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
