import { allowedLockups, type Bond } from "./lockups";
import type { ValidatorId } from "./validators";
import type { MaturityId } from "./maturities";

export interface Token {
  name: string;
  symbol: string;
  coingecko_id: string;
  icon: string;
  address: string;
}

// @dev: add new token ids here
export type TokenId = "solana";

export const tokens: { [key in TokenId]: Token } = {
  // @dev: add new tokens here
  solana: {
    name: "Solana",
    symbol: "SOL",
    coingecko_id: "solana",
    icon: "/solana.svg",
    address: "So11111111111111111111111111111111111111112",
  },
};

export const tokenIdsArray: TokenId[] = Object.keys(tokens) as TokenId[];

// Returns all trackable token addresses: base tokens + PT/RT mints from allowed lockups
export function allTokenAddresses(): string[] {
  const addresses: string[] = Object.values(tokens).map((t) => t.address);
  const allowed = allowedLockups();

  for (const mats of Object.values(allowed)) {
    for (const bond of Object.values(mats!) as Bond[]) {
      addresses.push(bond.pt_address);
      addresses.push(bond.rt_address);
    }
  }

  return addresses;
}
