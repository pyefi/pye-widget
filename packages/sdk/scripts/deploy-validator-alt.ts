/* eslint-disable no-console */
/**
 * Deploy an Address Lookup Table for one validator, containing every static
 * account referenced by `executeDepositAndSell` across all maturities.
 *
 * Usage:
 *   npx tsx scripts/deploy-validator-alt.ts \
 *     --keypair ~/.config/solana/id.json \
 *     --vote-account <VOTE_ACCOUNT_PUBKEY> \
 *     --rpc https://api.mainnet-beta.solana.com \
 *     --supabase-url https://xxx.supabase.co \
 *     --supabase-key <ANON_KEY>
 *
 * Flow:
 *   1. Derive the full account set (protocol + validator + per-maturity).
 *   2. Create an empty ALT pointed at the signer as authority.
 *   3. Extend it in chunks (≤20 accounts/ix so each tx fits under 1232B).
 *   4. Print the ALT pubkey + a SQL snippet for validator_metadata_configs.
 *
 * Only lists addresses referenced at swap-time. Signer keys (owner, splitKeypair)
 * must stay in the static keys section of the transaction, so they're skipped.
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import {
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  StakeProgram,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { getVaultAddress, getGlobalAddress, getGlobalVaultAddress } from "@cks-systems/manifest-sdk";

// ─── Constants (mirror execute-deposit-and-sell.ts) ───────────────────────────

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);
const SYSVAR_CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STAKE_PROGRAM = new PublicKey("Stake11111111111111111111111111111111111111");
const SYSVAR_STAKE_HISTORY = new PublicKey(
  "SysvarStakeHistory1111111111111111111111111",
);

// Accounts per extend ix. Each extend ix carries 32 bytes per pubkey + a small
// header. 20 keeps us well under the 1232B tx limit with some slack.
const EXTEND_CHUNK_SIZE = 20;

// ─── Args ─────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    keypair: { type: "string" },
    "vote-account": { type: "string" },
    rpc: { type: "string" },
    "supabase-url": { type: "string" },
    "supabase-key": { type: "string" },
  },
});

const required = ["keypair", "vote-account", "rpc", "supabase-url", "supabase-key"] as const;
for (const k of required) {
  if (!values[k]) {
    console.error(`Missing required arg: --${k}`);
    process.exit(1);
  }
}

const keypairPath = values.keypair!;
const voteAccount = new PublicKey(values["vote-account"]!);
const rpcUrl = values.rpc!;
const supabaseUrl = values["supabase-url"]!;
const supabaseKey = values["supabase-key"]!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(readFileSync(path.replace(/^~/, process.env.HOME ?? ""), "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function deriveGlobalSettings(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_settings")],
    BONDS_PROGRAM_ID,
  );
  return pda;
}

function deriveStakeAccount(bond: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), bond.toBuffer()],
    BONDS_PROGRAM_ID,
  );
  return pda;
}

async function fetchProtocolFeeWallet(
  connection: Connection,
  globalSettingsPda: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(globalSettingsPda);
  if (!info?.data) throw new Error("GlobalSettings account not found");
  return new PublicKey(info.data.subarray(40, 72));
}

async function fetchTransientStakeAccount(
  connection: Connection,
  bond: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(bond);
  if (!info?.data) throw new Error(`Bond account ${bond.toBase58()} not found`);
  return new PublicKey(info.data.subarray(72, 104));
}

async function sendAndConfirm(
  connection: Connection,
  payer: Keypair,
  instructions: TransactionInstruction[],
  label: string,
): Promise<string> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  tx.sign([payer]);
  const sig = await connection.sendTransaction(tx);
  const conf = await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  if (conf.value.err) {
    throw new Error(`${label} failed: ${JSON.stringify(conf.value.err)}`);
  }
  console.log(`  ✓ ${label} — ${sig}`);
  return sig;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const connection = new Connection(rpcUrl, "confirmed");
  const signer = loadKeypair(keypairPath);

  console.log(`Deploying ALT for vote account ${voteAccount.toBase58()}`);
  console.log(`Signer:    ${signer.publicKey.toBase58()}`);
  console.log(`RPC:       ${rpcUrl}\n`);

  // ── 1. Fetch all bonds for this validator ───────────────────────────────────
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: bonds, error: bondsErr } = await supabase
    .from("solo_validator_bonds")
    .select("pubkey, principal_token_mint, yield_token_mint, maturity_ts")
    .eq("validator_vote_account", voteAccount.toBase58());
  if (bondsErr) throw bondsErr;
  if (!bonds?.length) {
    throw new Error(`No bonds found in Supabase for vote account ${voteAccount.toBase58()}`);
  }
  console.log(`Found ${bonds.length} bond(s) for this validator`);

  // ── 2. Fetch manifest markets for these mints ───────────────────────────────
  const baseMints = bonds.flatMap((b) => [b.principal_token_mint, b.yield_token_mint]);
  const { data: markets, error: marketsErr } = await supabase
    .from("manifest_markets")
    .select("pubkey, base_mint")
    .in("base_mint", baseMints);
  if (marketsErr) throw marketsErr;
  if (!markets?.length) throw new Error("No manifest markets found for this validator");
  console.log(`Found ${markets.length} market(s)\n`);

  const marketByMint = new Map(markets.map((m) => [m.base_mint, new PublicKey(m.pubkey)]));

  // ── 3. Derive global/protocol-wide accounts ─────────────────────────────────
  const globalSettingsPda = deriveGlobalSettings();
  const protocolFeeWallet = await fetchProtocolFeeWallet(connection, globalSettingsPda);

  const staticAccounts = new Set<string>();
  const add = (pk: PublicKey) => staticAccounts.add(pk.toBase58());

  // Protocol-wide (10)
  add(BONDS_PROGRAM_ID);
  add(SYSVAR_CLOCK);
  add(STAKE_PROGRAM);
  add(SYSVAR_STAKE_HISTORY);
  add(ASSOCIATED_TOKEN_PROGRAM_ID);
  add(TOKEN_PROGRAM_ID);
  add(NATIVE_MINT);
  add(PublicKey.default);
  add(ComputeBudgetProgram.programId);
  add(SystemProgram.programId);
  add(StakeProgram.programId); // same as STAKE_PROGRAM but ensure included
  add(globalSettingsPda);
  add(protocolFeeWallet);

  // Per-validator (1)
  add(voteAccount);

  // wSOL ATA for protocol fee wallet — referenced only if it's a quote fee in
  // future; currently fee wallet PT/YT ATAs are per-maturity. Skip.

  // ── 4. Per-maturity accounts (per bond) ─────────────────────────────────────
  for (const bond of bonds) {
    const bondPk = new PublicKey(bond.pubkey);
    const ptMint = new PublicKey(bond.principal_token_mint);
    const ytMint = new PublicKey(bond.yield_token_mint);

    const stakeAccountPda = deriveStakeAccount(bondPk);
    const transient = await fetchTransientStakeAccount(connection, bondPk);
    const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
    const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

    add(bondPk);
    add(ptMint);
    add(ytMint);
    add(stakeAccountPda);
    add(feeWalletPt);
    add(feeWalletYt);
    if (!transient.equals(PublicKey.default)) add(transient);

    // Manifest market: only the RT market is used in swap path (sells YT for SOL)
    const rtMarket = marketByMint.get(bond.yield_token_mint);
    if (!rtMarket) {
      console.warn(`  ⚠ No RT market found for ${bond.pubkey} (yt ${ytMint.toBase58()})`);
      continue;
    }
    const baseVault = getVaultAddress(rtMarket, ytMint);
    const quoteVault = getVaultAddress(rtMarket, NATIVE_MINT);
    const globalQuote = getGlobalAddress(NATIVE_MINT);
    const globalVaultQuote = getGlobalVaultAddress(NATIVE_MINT);
    add(rtMarket);
    add(baseVault);
    add(quoteVault);
    add(globalQuote);
    add(globalVaultQuote);
  }

  const accountList = Array.from(staticAccounts).map((s) => new PublicKey(s));
  console.log(`Total unique accounts to include: ${accountList.length}`);
  if (accountList.length > 256) {
    throw new Error(`ALT supports max 256 entries (got ${accountList.length}).`);
  }

  // ── 5. Create the ALT ───────────────────────────────────────────────────────
  const recentSlot = await connection.getSlot("finalized");
  const [createIx, altPubkey] = AddressLookupTableProgram.createLookupTable({
    authority: signer.publicKey,
    payer: signer.publicKey,
    recentSlot,
  });

  console.log(`\nALT pubkey: ${altPubkey.toBase58()}`);
  console.log("Creating ALT...");
  await sendAndConfirm(connection, signer, [createIx], "createLookupTable");

  // ── 6. Extend in chunks ─────────────────────────────────────────────────────
  for (let i = 0; i < accountList.length; i += EXTEND_CHUNK_SIZE) {
    const chunk = accountList.slice(i, i + EXTEND_CHUNK_SIZE);
    const extendIx = AddressLookupTableProgram.extendLookupTable({
      lookupTable: altPubkey,
      authority: signer.publicKey,
      payer: signer.publicKey,
      addresses: chunk,
    });
    await sendAndConfirm(
      connection,
      signer,
      [extendIx],
      `extend [${i}..${i + chunk.length}) (${chunk.length} accounts)`,
    );
  }

  // ── 7. Report ───────────────────────────────────────────────────────────────
  console.log("\n✅ Done.");
  console.log(`\nALT pubkey: ${altPubkey.toBase58()}`);
  console.log(`Entries:    ${accountList.length}`);
  console.log(`\nUpdate Supabase with:`);
  console.log(
    `UPDATE validator_metadata_configs SET alt_pubkey = '${altPubkey.toBase58()}' WHERE vote_pubkey = '${voteAccount.toBase58()}';`,
  );
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err);
  process.exit(1);
});
