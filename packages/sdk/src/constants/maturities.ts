export interface Maturity {
  human_readable: string;
  month: string;
  year: string;
  issuance_start_timestamp: string;
  issuance_close_timestamp: string;
  maturity_timestamp: string;
}

// @dev: add new maturity ids here
export type MaturityId = "q12026" | "q22026" | "q32026" | "q42026";

export const maturities: { [key in MaturityId]: Maturity } = {
  // @dev: add new maturities here
  q12026: {
    human_readable: "Mar 31, 2026",
    month: "MAR",
    year: "2026",
    issuance_start_timestamp: "1770354000", //1770354000 found from supabase
    issuance_close_timestamp: "1774828740",
    maturity_timestamp: "1775001540",
  },
  q22026: {
    human_readable: "Jun 30, 2026",
    month: "JUN",
    year: "2026",
    issuance_start_timestamp: "1770354000",
    issuance_close_timestamp: "1782691140",
    maturity_timestamp: "1782863940",
  },
  q32026: {
    human_readable: "Sep 30, 2026",
    month: "SEP",
    year: "2026",
    issuance_start_timestamp: "1770354000",
    issuance_close_timestamp: "1790639940",
    maturity_timestamp: "1790812740",
  },
  q42026: {
    human_readable: "Dec 31, 2026",
    month: "DEC",
    year: "2026",
    issuance_start_timestamp: "1770354000",
    issuance_close_timestamp: "1798588740",
    maturity_timestamp: "1798761540",
  },
};

export const maturitiesArray: Maturity[] = Object.values(maturities);

export const maturityIdsArray: MaturityId[] = Object.keys(
  maturities,
) as MaturityId[];

export const getMaturity = (maturityId: MaturityId): Maturity =>
  maturities[maturityId];
