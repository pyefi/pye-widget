import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { allTokenAddresses } from "../constants/tokens";

const SOL_MINT = "So11111111111111111111111111111111111111112";

// Fetches native SOL + all PT/RT token balances for a wallet.
export async function fetchBalances(
  connection: Connection,
  owner: PublicKey,
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {};

  const mintAddresses = allTokenAddresses().filter((a) => a !== SOL_MINT);

  // allowOwnerOffCurve: true so PDA wallets (Squads vaults, etc.) don't
  // crash this read path on widget load.
  const atas = mintAddresses.map((mint) =>
    getAssociatedTokenAddressSync(
      new PublicKey(mint),
      owner,
      true,
      TOKEN_PROGRAM_ID,
    ),
  );

  const [lamports, accountInfos] = await Promise.all([
    connection.getBalance(owner),
    connection.getMultipleAccountsInfo(atas),
  ]);

  balances[SOL_MINT] = lamports;

  for (let i = 0; i < accountInfos.length; i++) {
    const info = accountInfos[i];
    if (info) {
      const data = AccountLayout.decode(info.data);
      balances[mintAddresses[i]] = Number(data.amount);
    }
  }

  return balances;
}

// Fetches SPL token balances for an arbitrary list of mint addresses.
export async function fetchBalancesForMints(
  connection: Connection,
  owner: PublicKey,
  mints: string[],
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {};
  for (const mint of mints) balances[mint] = 0;

  const atas = mints.map((mint) =>
    getAssociatedTokenAddressSync(
      new PublicKey(mint),
      owner,
      true,
      TOKEN_PROGRAM_ID,
    ),
  );

  const accountInfos = await connection.getMultipleAccountsInfo(atas);

  for (let i = 0; i < accountInfos.length; i++) {
    const info = accountInfos[i];
    if (info) {
      const data = AccountLayout.decode(info.data);
      balances[mints[i]] = Number(data.amount);
    }
  }

  return balances;
}
