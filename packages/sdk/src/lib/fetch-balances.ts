import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const MAX_ACCOUNTS_PER_REQUEST = 100;

/**
 * Fetches SPL token balances for a list of mints. Callers derive the mint list
 * from the already-synced lockup + validator stores (see
 * `selectTrackedTokenMints`) — no Supabase round-trip on the balance path.
 * Chunked at 100 since `getMultipleAccountsInfo` caps there and the universal
 * widget can track far more.
 */
export async function fetchBalancesForMints(
  connection: Connection,
  owner: PublicKey,
  mints: string[],
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {};
  for (const mint of mints) balances[mint] = 0;

  const atas = mints.map((mint) =>
    getAssociatedTokenAddressSync(new PublicKey(mint), owner, true, TOKEN_PROGRAM_ID),
  );

  for (let i = 0; i < atas.length; i += MAX_ACCOUNTS_PER_REQUEST) {
    const chunk = atas.slice(i, i + MAX_ACCOUNTS_PER_REQUEST);
    const infos = await connection.getMultipleAccountsInfo(chunk);
    for (let j = 0; j < infos.length; j++) {
      const info = infos[j];
      if (info) {
        const data = AccountLayout.decode(info.data);
        balances[mints[i + j]] = Number(data.amount);
      }
    }
  }

  return balances;
}
