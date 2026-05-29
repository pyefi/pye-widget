/* eslint-disable no-console */
/**
 * One-off backfill: add SysvarRent + StakeConfig to every already-deployed
 * validator ALT.
 *
 * The `solo_validator_deposit_stake` instruction gained two trailing accounts
 * (`rent`, `stake_config`) in bonds program PR #100. Existing ALTs were built
 * before that and don't contain them, so `executeDepositAndSell` would have to
 * carry both as raw static keys (+64B per tx). This script extends each ALT in
 * `validator_metadata_configs.alt_pubkey` with the two addresses, skipping any
 * that already have them. Idempotent — safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/extend-alts-rent-stakeconfig.ts \
 *     --keypair ~/.config/solana/id.json \
 *     --rpc https://api.mainnet-beta.solana.com \
 *     --supabase-url https://xxx.supabase.co \
 *     --supabase-key <SERVICE_KEY>
 *
 * The signer MUST be the ALT authority used at deploy time.
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const SYSVAR_RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const STAKE_CONFIG = new PublicKey("StakeConfig11111111111111111111111111111111");

// ─── Args ─────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    keypair: { type: "string" },
    rpc: { type: "string" },
    "supabase-url": { type: "string" },
    "supabase-key": { type: "string" },
  },
});

const required = ["keypair", "rpc", "supabase-url", "supabase-key"] as const;
for (const k of required) {
  if (!values[k]) {
    console.error(`Missing required arg: --${k}`);
    process.exit(1);
  }
}

const keypairPath = values.keypair!;
const rpcUrl = values.rpc!;
const supabaseUrl = values["supabase-url"]!;
const supabaseKey = values["supabase-key"]!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(readFileSync(path.replace(/^~/, process.env.HOME ?? ""), "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
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

  console.log(`Backfilling SysvarRent + StakeConfig into deployed ALTs`);
  console.log(`Signer: ${signer.publicKey.toBase58()}`);
  console.log(`RPC:    ${rpcUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: rows, error } = await supabase
    .from("validator_metadata_configs")
    .select("vote_pubkey, name, alt_pubkey")
    .not("alt_pubkey", "is", null);
  if (error) throw error;
  if (!rows?.length) {
    console.log("No validators with an alt_pubkey. Nothing to do.");
    return;
  }
  console.log(`Found ${rows.length} validator ALT(s)\n`);

  let extended = 0;
  let skipped = 0;
  for (const row of rows) {
    const label = `${row.name ?? row.vote_pubkey} (${row.alt_pubkey})`;
    const altPubkey = new PublicKey(row.alt_pubkey!);

    const res = await connection.getAddressLookupTable(altPubkey);
    const alt = res.value;
    if (!alt) {
      console.warn(`  ⚠ ${label}: ALT not found on-chain — skipping`);
      continue;
    }

    const present = new Set(alt.state.addresses.map((a) => a.toBase58()));
    const missing = [SYSVAR_RENT, STAKE_CONFIG].filter((pk) => !present.has(pk.toBase58()));
    if (missing.length === 0) {
      console.log(`  • ${label}: already has both — skip`);
      skipped += 1;
      continue;
    }

    if (!alt.state.authority?.equals(signer.publicKey)) {
      console.warn(
        `  ⚠ ${label}: signer is not the ALT authority ` +
        `(authority=${alt.state.authority?.toBase58() ?? "frozen"}) — skipping`,
      );
      continue;
    }

    const extendIx = AddressLookupTableProgram.extendLookupTable({
      lookupTable: altPubkey,
      authority: signer.publicKey,
      payer: signer.publicKey,
      addresses: missing,
    });
    await sendAndConfirm(
      connection,
      signer,
      [extendIx],
      `extend ${label} (+${missing.length})`,
    );
    extended += 1;
  }

  console.log(`\nDone. extended=${extended} skipped=${skipped} total=${rows.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
