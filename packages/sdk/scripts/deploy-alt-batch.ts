/* eslint-disable no-console */
/**
 * Deploy an Address Lookup Table for one validator using pre-computed data
 * from `validator-alt-data.json` (generated via MCP supabase). No Supabase
 * runtime dep — just takes a keypair, RPC, and vote-account.
 *
 * Usage:
 *   npx tsx scripts/deploy-alt-batch.ts \
 *     --keypair <base58-secret | ~/.config/solana/id.json> \
 *     --vote-account <VOTE_ACCOUNT_PUBKEY> \
 *     --rpc https://mainnet.helius-rpc.com/?api-key=XXX
 */
import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  AddressLookupTableProgram,
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
import {
  getVaultAddress,
  getGlobalAddress,
  getGlobalVaultAddress,
} from "@cks-systems/manifest-sdk";

// ─── Constants (mirror execute-deposit-and-sell.ts) ───────────────────────────

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);
const SYSVAR_CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STAKE_PROGRAM = new PublicKey("Stake11111111111111111111111111111111111111");
const SYSVAR_STAKE_HISTORY = new PublicKey(
  "SysvarStakeHistory1111111111111111111111111",
);
const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey(
  "ComputeBudget111111111111111111111111111111",
);
const EXTEND_CHUNK_SIZE = 20;

// ─── Data types ───────────────────────────────────────────────────────────────

interface BondEntry {
  pubkey: string;
  pt_mint: string;
  yt_mint: string;
}
interface ValidatorEntry {
  name: string;
  vote_account: string;
  bonds: BondEntry[];
  rt_markets: string[];
}
interface AltData {
  validators: ValidatorEntry[];
}

// ─── Args ─────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    keypair: { type: "string" },
    "vote-account": { type: "string" },
    rpc: { type: "string" },
    data: { type: "string" },
  },
});

for (const k of ["keypair", "vote-account", "rpc"] as const) {
  if (!values[k]) {
    console.error(`Missing required arg: --${k}`);
    process.exit(1);
  }
}

const keypairArg = values.keypair!;
const voteAccount = new PublicKey(values["vote-account"]!);
const rpcUrl = values.rpc!;
const dataPath =
  values.data ?? new URL("./validator-alt-data.json", import.meta.url).pathname;

// ─── Base58 decode (inline, no dep) ───────────────────────────────────────────

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Decode(s: string): Uint8Array {
  const map = new Map<string, number>();
  for (let i = 0; i < BASE58_ALPHABET.length; i++) map.set(BASE58_ALPHABET[i]!, i);
  let leadingZeros = 0;
  for (let i = 0; i < s.length && s[i] === "1"; i++) leadingZeros++;
  const bytes: number[] = [];
  for (const ch of s) {
    const val = map.get(ch);
    if (val === undefined) throw new Error(`Invalid base58 char: ${ch}`);
    let carry = val;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j]! * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(leadingZeros + bytes.length);
  for (let i = 0; i < bytes.length; i++) out[leadingZeros + i] = bytes[bytes.length - 1 - i]!;
  return out;
}

function loadKeypair(arg: string): Keypair {
  const expanded = arg.replace(/^~/, process.env.HOME ?? "");
  if (existsSync(expanded)) {
    const secret = JSON.parse(readFileSync(expanded, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }
  // Treat as base58 secret
  return Keypair.fromSecretKey(base58Decode(arg));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
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
  const data: AltData = JSON.parse(readFileSync(dataPath, "utf8"));
  const validator = data.validators.find(
    (v) => v.vote_account === voteAccount.toBase58(),
  );
  if (!validator) {
    throw new Error(
      `No entry for vote account ${voteAccount.toBase58()} in ${dataPath}`,
    );
  }

  const connection = new Connection(rpcUrl, "confirmed");
  const signer = loadKeypair(keypairArg);

  console.log(`Validator: ${validator.name} (${voteAccount.toBase58()})`);
  console.log(`Signer:    ${signer.publicKey.toBase58()}`);
  console.log(`Bonds:     ${validator.bonds.length}`);
  console.log(`Markets:   ${validator.rt_markets.length}\n`);

  const globalSettingsPda = deriveGlobalSettings();
  const protocolFeeWallet = await fetchProtocolFeeWallet(
    connection,
    globalSettingsPda,
  );

  const staticAccounts = new Set<string>();
  const add = (pk: PublicKey) => staticAccounts.add(pk.toBase58());

  // Protocol-wide
  add(BONDS_PROGRAM_ID);
  add(SYSVAR_CLOCK);
  add(STAKE_PROGRAM);
  add(SYSVAR_STAKE_HISTORY);
  add(ASSOCIATED_TOKEN_PROGRAM_ID);
  add(TOKEN_PROGRAM_ID);
  add(NATIVE_MINT);
  add(PublicKey.default);
  add(COMPUTE_BUDGET_PROGRAM_ID);
  add(SystemProgram.programId);
  add(StakeProgram.programId);
  add(globalSettingsPda);
  add(protocolFeeWallet);

  // Per-validator
  add(voteAccount);

  // Manifest globals (wSOL quote)
  add(getGlobalAddress(NATIVE_MINT));
  add(getGlobalVaultAddress(NATIVE_MINT));

  // Per-bond
  for (const bond of validator.bonds) {
    const bondPk = new PublicKey(bond.pubkey);
    const ptMint = new PublicKey(bond.pt_mint);
    const ytMint = new PublicKey(bond.yt_mint);

    const stakePda = deriveStakeAccount(bondPk);
    const transient = await fetchTransientStakeAccount(connection, bondPk);
    const feePt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
    const feeYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

    add(bondPk);
    add(ptMint);
    add(ytMint);
    add(stakePda);
    add(feePt);
    add(feeYt);
    if (!transient.equals(PublicKey.default)) add(transient);
  }

  // Per-market (all RT markets — multiple possible per yt_mint)
  for (const mkt of validator.rt_markets) {
    const market = new PublicKey(mkt);
    add(market);
    // Each market has a base vault per YT and a quote vault for wSOL.
    // Quote vault is derived from (market, NATIVE_MINT). Base vaults per YT
    // mint — add for every bond's YT since markets are cross-referenced.
    add(getVaultAddress(market, NATIVE_MINT));
    for (const bond of validator.bonds) {
      add(getVaultAddress(market, new PublicKey(bond.yt_mint)));
    }
  }

  const accountList = Array.from(staticAccounts).map((s) => new PublicKey(s));
  console.log(`Total unique accounts: ${accountList.length}`);
  if (accountList.length > 256) {
    throw new Error(`ALT supports max 256 entries (got ${accountList.length}).`);
  }

  // Create ALT
  const recentSlot = await connection.getSlot("finalized");
  const [createIx, altPubkey] = AddressLookupTableProgram.createLookupTable({
    authority: signer.publicKey,
    payer: signer.publicKey,
    recentSlot,
  });
  console.log(`\nALT pubkey: ${altPubkey.toBase58()}`);
  console.log("Creating ALT...");
  await sendAndConfirm(connection, signer, [createIx], "createLookupTable");

  // Extend in chunks
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

  console.log("\n✅ Done.");
  console.log(`\nRESULT ${validator.name} ${voteAccount.toBase58()} ${altPubkey.toBase58()}`);
  console.log(
    `\nUPDATE validator_metadata_configs SET alt_pubkey = '${altPubkey.toBase58()}' WHERE vote_pubkey = '${voteAccount.toBase58()}';`,
  );
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err);
  process.exit(1);
});
