import { ValidatorId } from "./validators";
import { MaturityId } from "./maturities";

// Devs: add/remove entries to control which lockups appear in the Stake marketplace
export const STAKE_MARKETPLACE_FILTER: {
  validatorId: ValidatorId;
  maturityId: MaturityId;
}[] = [
  { validatorId: "stakecraft", maturityId: "q12026" },
  { validatorId: "exo-tech", maturityId: "q12026" },
  { validatorId: "figment", maturityId: "q12026" },
  { validatorId: "helius", maturityId: "q12026" },
  { validatorId: "chorus-one", maturityId: "q12026" },
  { validatorId: "hylo", maturityId: "q22026" },
  { validatorId: "helius", maturityId: "q42026" },
];
