export interface Validator {
  name: string;
  symbol: string;
  vote_account: string;
  pt_sol: string;
  rt_sol: string;
  is_allowed: boolean;
  type: "validator" | "lst";
}

export type ValidatorId =
  | "adrastea"
  | "alchemy"
  | "all-nodes"
  | "alpha-pro"
  | "anagram"
  | "anchorage-digital"
  | "anza"
  | "astralane"
  | "asymmetric"
  | "binance"
  | "bitwise"
  | "block-logic"
  | "blockdaemon"
  | "blockport"
  | "blocksize"
  | "bloxroute"
  | "blueshift"
  | "bonk"
  | "bybit"
  | "chainflow"
  | "chorus-one"
  | "coinbase"
  | "coyote-staking"
  | "dawnlabs"
  | "decentra"
  | "defi-dev-corp"
  | "drift"
  | "dsrv"
  | "edgevana"
  | "emory-blockchain"
  | "everstake"
  | "exo-tech"
  | "facilities"
  | "falconx"
  | "fd1"
  | "figment"
  | "forward-industries"
  | "galaxy"
  | "gate-omega"
  | "gemini"
  | "genco"
  | "global-stake"
  | "greed-academy"
  | "gripto"
  | "guardian"
  | "h2o-nodes"
  | "hashkey-cloud"
  | "haus"
  | "helius"
  | "hello-moon"
  | "hinode-tech"
  | "hubra"
  | "hylo"
  | "ice-staking"
  | "ily-validator"
  | "infinite-sol"
  | "jupiter"
  | "kairos-research"
  | "kiln"
  | "kraken"
  | "kumavalidator"
  | "laine"
  | "lakestake"
  | "lantern"
  | "ledger"
  | "luganodes"
  | "luminal"
  | "lumos-maxima"
  | "madlads"
  | "magic-eden"
  | "marginfi"
  | "meria"
  | "mesh-validator"
  | "monkedao"
  | "nansen"
  | "neodyme"
  | "nordic-staking"
  | "nova-consortium"
  | "okx-earn"
  | "omakase"
  | "orang3club"
  | "orangefin"
  | "ottersec"
  | "overclock"
  | "p-ops"
  | "p2p"
  | "parafi"
  | "phantom"
  | "phase-labs"
  | "pier-two"
  | "portals"
  | "project-catalyst"
  | "project-super"
  | "prostaking"
  | "pumpkins-pool"
  | "quicknode"
  | "radiants"
  | "rakurai"
  | "range"
  | "raposa"
  | "raydium"
  | "restake"
  | "rockaway-x"
  | "saga-dao"
  | "sec3"
  | "sendai"
  | "sensei-node"
  | "sentinel"
  | "shinobi"
  | "shiro"
  | "sol-rain-drops"
  | "sol-strategies"
  | "solana"
  | "solana-compass"
  | "solana-japan"
  | "solayer"
  | "solflare"
  | "solstack"
  | "solstice"
  | "solyrae"
  | "somos"
  | "squads-validator"
  | "stachenode"
  | "stakecraft"
  | "stakefish"
  | "stakely"
  | "stakin-the-tie"
  | "stakr-space"
  | "stardust"
  | "starke-finance"
  | "step-finance"
  | "stronghold"
  | "superfast"
  | "swyke"
  | "temporal"
  | "temporal-opal"
  | "the-vault"
  | "theia-capital"
  | "thw"
  | "tinydancer"
  | "triton-one"
  | "twinstake"
  | "txtx"
  | "unruggable"
  | "upbit-staking"
  | "valid-blocks"
  | "validation-cloud"
  | "valigator"
  | "vladika"
  | "vybe-network"
  | "watchtower"
  | "xandeum";

export const validators: { [key in ValidatorId]: Validator } = {
  adrastea: {
    name: "Adrastea",
    symbol: "ADRASTE",
    vote_account: "adraBKLNY3DL3pg6SJRDYiMA8BsznaWpUdE42X41gbP",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/adrastea_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/adrastea_ysol.png",
  },
  alchemy: {
    name: "Alchemy",
    symbol: "ALCHEMY",
    vote_account: "JEJzKYzyYJJjtn6Yb1P7r6YV75TdSNmmJT49sgDoHvmk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/alchemy_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/alchemy_ysol.png",
  },
  "all-nodes": {
    name: "All Nodes",
    symbol: "ALL",
    vote_account: "6F5xdRXh2W3B2vhte12VG79JVUkUSLYrHydGX1SAadfZ",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "alpha-pro": {
    name: "Alpha Pro",
    symbol: "ALPHA",
    vote_account: "7opSZGmevWhRDyLt5Wu38FZFjUyredGmMki4DNmxDnjd",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/alpha_pro_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/aplha_pro_rsol.png",
  },
  anagram: {
    name: "Anagram",
    symbol: "ANA",
    vote_account: "4AUED4uj6nSTuANzaAUnGBPJQRmhpDYDwoWJNkoUUBBW",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/reordertheblocks.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/reordertheblocks.png",
  },
  "anchorage-digital": {
    name: "Anchorage Digital",
    symbol: "ANCHOR",
    vote_account: "ANCVpxEySGWWLqqkVKw2xWYDE9UP4fmZWMCBr5t96jch",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/anchorage_digital_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/anchorage_digital_ysol.png",
  },
  anza: {
    name: "Anza",
    symbol: "ANZA",
    vote_account: "anza1Vgz2kcN9Qo6ECvf43v8RxBzQ7UpvxFoxJtLmGz",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/anza_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/anza_ysol.png",
  },
  astralane: {
    name: "Astralane",
    symbol: "ASTRA",
    vote_account: "sShosKd6uA5c1ZpVMxdsE6do13TLRWSMYsXbSMmNC77",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/astralane_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/astralane_ysol.png",
  },
  asymmetric: {
    name: "Asymmetric",
    symbol: "ASYM",
    vote_account: "CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/asymmetric_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/asymmetric_ysol.png",
  },
  binance: {
    name: "Binance",
    symbol: "BINANCE",
    vote_account: "3N7s9zXMZ4QqvHQR15t5GNHyqc89KduzMP7423eWiD5g",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  bitwise: {
    name: "Bitwise",
    symbol: "BITWISE",
    vote_account: "8GbwASqdpw4dVcwbWUxbHXMrjyQx2aKkoBR5H1GJF8iD",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/bitwise_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/bitwise_ysol.png",
  },
  "block-logic": {
    name: "Block Logic",
    symbol: "BLOCK",
    vote_account: "9GJmEHGom9eWo4np4L5vC6b6ri1Df2xN8KFoWixvD1Bs",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  blockdaemon: {
    name: "Blockdaemon",
    symbol: "DAEMON",
    vote_account: "FQwewNXahV7MiZcLpY6p1xhUs2acVGQ3U5Xxc7FzV571",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/blockdaemon_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/blockdaemon_rsol.png",
  },
  blockport: {
    name: "Blockport",
    symbol: "BLOCKP",
    vote_account: "FnAPJkzf19s87sm24Qhv6bHZMZvZ43gjNUBRgjwXpD4v",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  blocksize: {
    name: "Blocksize",
    symbol: "BLKSIZE",
    vote_account: "HMk1qny4fvMnajErxjXG5kT89JKV4cx1PKa9zhQBF9ib",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/blocksize_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/blocksize_ysol.png",
  },
  bloxroute: {
    name: "BloxRoute",
    symbol: "BLOX",
    vote_account: "bXr9MyoUAaGusQZ4gaUPmSZByHAV7RRGr1FhCW5tFh8",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/bloxroute_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/bloxroute_ysol.png",
  },
  blueshift: {
    name: "Blueshift",
    symbol: "BLUE",
    vote_account: "shft7Fry1js37Hm9wq4dfwcZSp2DyKszeWMvEpjYCQ1",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/blueshift_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/blueshift_ysol.png",
  },
  bonk: {
    name: "Bonk",
    symbol: "BONK",
    vote_account: "BoNKvwirX136zCjcnayEM4W82vn13RKkjm1Sy3UPBdim",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  bybit: {
    name: "Bybit",
    symbol: "BYBIT",
    vote_account: "8hPk5CbKDoM7dN9LssTdVkFhDykeq7A8CZurA5AQSFJH",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/bybit_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_rsol.png",
  },
  chainflow: {
    name: "Chainflow",
    symbol: "FLOW",
    vote_account: "CAf8jfgqhia5VNrEF4A7Y9VLD3numMq9DVSceq7cPhNY",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "chorus-one": {
    name: "Chorus One",
    symbol: "CHORUS",
    vote_account: "Chorus6Kis8tFHA7AowrPMcRJk3LbApHTYpgSNXzY5KE",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/chorus_one_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/chorus_one_ysol.png",
  },
  coinbase: {
    name: "Coinbase",
    symbol: "BASE",
    vote_account: "beefKGBWeSpHzYBHZXwp5So7wdQGX6mu4ZHCsH3uTar",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "strhttps://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "coyote-staking": {
    name: "Coyote Staking",
    symbol: "COYOTE",
    vote_account: "DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/coyote_staking_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/coyote_staking_ysol.png",
  },
  dawnlabs: {
    name: "DawnLabs",
    symbol: "DAWN",
    vote_account: "8zuMRTXThoPTTPLLvaiKiJshLLCqGMt9BdRjjCL19xBc",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  decentra: {
    name: "Decentra",
    symbol: "DECNTRA",
    vote_account: "dcntrKBwh8j5yL62Eg96Z5QjJWv3UXxMu4rqL82w6Cb",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/decentra_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/decentra_ysol.png",
  },
  "defi-dev-corp": {
    name: "DeFi Dev Corp",
    symbol: "DEFI",
    vote_account: "2iWXwF2Q5W6o7yntV2mkbxncB4rYHnX61y3NU8a8EFMJ",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  drift: {
    name: "Drift",
    symbol: "DRIFT",
    vote_account: "DriFTm3wM9ugxhCA1K3wVQMSdC4Dv4LNmyZMmZiuHRpp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/drift_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/drift_ysol.png",
  },
  dsrv: {
    name: "DSRV",
    symbol: "DSRV",
    vote_account: "2mxWiqtwdpE8zgkWxwFaJLn127dbuuHY4D32d8A6UnPL",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/dsrv_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/dsrv_ysol.png",
  },
  edgevana: {
    name: "Edgevana",
    symbol: "EDGE",
    vote_account: "EdGevanAjM8a6Gg9KxBVrmVdZAUGAZ9xaVd7t9R4H2x",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/edgevana_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/edgevana_ysol.png",
  },
  "emory-blockchain": {
    name: "Emory Blockchain",
    symbol: "EMORY",
    vote_account: "ySxF6XaSFSwU46iJbgyh2rAW5jagLbYULPtWvZCshrk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/emory_blockchain_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/emory_blockchain_ysol.png",
  },
  everstake: {
    name: "Everstake",
    symbol: "EVER",
    vote_account: "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/everstake_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/everstake_ysol.png",
  },
  "exo-tech": {
    name: "Exo Tech",
    symbol: "EXO",
    vote_account: "6q1VNp8Vy2Go12vb8CwbjUqqj2SXr2JYftJRWs71sW23",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/exo_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/exo_ysol.png",
  },
  facilities: {
    name: "Facilities",
    symbol: "FACIL",
    vote_account: "DumiCKHVqoCQKD8roLApzR5Fit8qGV5fVQsJV9sTZk4a",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
  },
  falconx: {
    name: "FalconX",
    symbol: "FALCON",
    vote_account: "AX6v1G9GH7FNcoX6ogNyoD2fZiLaNps7heL9RrGUYGC8",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/falconx_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/falconx_rsol.png",
  },
  fd1: {
    name: "FD1",
    symbol: "FD1",
    vote_account: "fdvtuDvWJZ89Z7TmeLjCwxgoLcmoEWNxruV48DvJtfm",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/fd1_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/fd1_ysol.png",
  },
  figment: {
    name: "Figment",
    symbol: "FIGMENT",
    vote_account: "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/figment_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/figment_ysol.png",
  },
  "forward-industries": {
    name: "Forward Industries",
    symbol: "FORWARD",
    vote_account: "3JD3jMmnR6g88qff2WZ3cMHJRjJMUk9yVZtmYTYeFrXf",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/forward_industries_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/forward_industries_rsol.png",
  },
  galaxy: {
    name: "Galaxy",
    symbol: "GALAXY",
    vote_account: "CvSb7wdQAFpHuSpTYTJnX5SYH4hCfQ9VuGnqrKaKwycB",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/galaxy_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/galaxy_ysol.png",
  },
  "gate-omega": {
    name: "Gate Omega",
    symbol: "OMEGA",
    vote_account: "9Gko8QZBbV5SrEvHKtQHcMrGGSfgFP3KJUozEGifu25x",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/gate_omega_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/gate_omega_ysol.png",
  },
  gemini: {
    name: "Gemini",
    symbol: "GEMINI",
    vote_account: "GEM1N1pCDGKiTa547eckcwuHWYMsUQeXgnXHfEZLDvpB",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/gemini_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/gemini_ysol.png",
  },
  genco: {
    name: "Genco",
    symbol: "GENCO",
    vote_account: "6yShbTX3KRMJLANDfo8Xo4aHYCjepjUbna9Y64mdQB1a",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "global-stake": {
    name: "Global Stake",
    symbol: "GLOBAL",
    vote_account: "FdGcvmbpebUwYA3vSywnagsaC3Tq3pAVmcR6VoxVcdV9",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/global_stake_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/global_stake_ysol.png",
  },
  "greed-academy": {
    name: "Greed Academy",
    symbol: "GREED",
    vote_account: "GREEDkpTvpKzcGvBu9qd36yk6BfjTWPShB67gLWuixMv",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/greed_academy_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/greed_academy_ysol.png",
  },
  gripto: {
    name: "Gripto",
    symbol: "GRIPTO",
    vote_account: "mnvkHm47ZmRKoSWuQZAfXLRiDPiKCq8PWkMWrp1Wwqe",
    pt_sol: "strhttps://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  guardian: {
    name: "Guardian",
    symbol: "GUARD",
    vote_account: "gVot34jauJpexBL2YUSPBKsmZ4V2ffmDcRk4yfSEnx8",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "h2o-nodes": {
    name: "H2O Nodes",
    symbol: "H2O",
    vote_account: "FCvNkHa4U3yh7AXWGGL2jWLWiSRouR8EtzY5WVTHKTHa",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/drift_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/drift_ysol.png",
  },
  "hashkey-cloud": {
    name: "Hashkey Cloud",
    symbol: "HASHKEY",
    vote_account: "Cat8oWQiFfrR3c7BcceTYcpnYCzSWfCPjMXT7mfHXvEP",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/hashkey_cloud_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/hashkey_cloud_ysol.png",
  },
  haus: {
    name: "Haus",
    symbol: "HAUS",
    vote_account: "HxRrsnbc6K8CdEo3LCTrSUkFaDDxv9BdJsTDzBKnUVWH",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/haus_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/haus_rsol.png",
  },
  helius: {
    name: "Helius",
    symbol: "HELIUS",
    vote_account: "he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/helius_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/helius_ysol.png",
  },
  "hello-moon": {
    name: "Hello Moon",
    symbol: "HMOON",
    vote_account: "HMV14UAuULSwqmZhsKHzaVkYAd94iWpEeURgbUegfQLc",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/hello_moon_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/hello_moon_ysol.png",
  },
  "hinode-tech": {
    name: "Hinode Tech",
    symbol: "HINODE",
    vote_account: "5DutFKQ8qPmbjFEmp31QH9JDYJXvwh9pma8ap5Phxk6H",
    pt_sol:
      "https://assets.pye.fi/ysol_psol_logos/hinode_technologies_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol:
      "https://assets.pye.fi/ysol_psol_logos/hinode_technologies_ysol.png",
  },
  hubra: {
    name: "Hubra",
    symbol: "HUBRA",
    vote_account: "7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECh",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  hylo: {
    name: "Hylo",
    symbol: "HYLO",
    vote_account: "hy1oJTV2kX9acsqpwk7hbteqXFw9VDbWvbxoamFEufW",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/hylo_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/hylo_ysol.png",
  },
  "ice-staking": {
    name: "Ice Staking",
    symbol: "ICE",
    vote_account: "votem3UdGx5xWFbY9EFbyZ1X2pBuswfR5yd2oB3JAaj",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/ice_staking_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/ice_staking_ysol.png",
  },
  "ily-validator": {
    name: "ILY Validator",
    symbol: "ILY",
    vote_account: "DG6fVEB2Qy1jntvHVPui3R12CMqcwNNnjYPYdsbQ9ACP",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/ily_validator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/ily_validator_ysol.png",
  },
  "infinite-sol": {
    name: "Infinite SOL",
    symbol: "INFSOL",
    vote_account: "26RGqX3mezgYDxJnGh94gnMM4L2k9grH1eWcTSCHnaxR",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/infinite_sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/infinite_sol_ysol.png",
  },
  jupiter: {
    name: "Jupiter",
    symbol: "JUPITER",
    vote_account: "CatzoSMUkTRidT5DwBxAC2pEtnwMBTpkCepHkFgZDiqb",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "kairos-research": {
    name: "Kairos Research",
    symbol: "KAIROS",
    vote_account: "Hx4UJCvf8amGeuW9fPFfTckRoznDHxPSYiU9HuUSZKLT",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/kairos_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/kairos_pysol.png",
  },
  kiln: {
    name: "Kiln",
    symbol: "Kiln",
    vote_account: "DdCNGDpP7qMgoAy6paFzhhak2EeyCZcgjH7ak5u5v28m",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/kiln_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/kiln_ysol.png",
  },
  kraken: {
    name: "Kraken",
    symbol: "KRAKEN",
    vote_account: "KRAKEnMdmT4EfM8ykTFH6yLoCd5vNLcQvJwF66Y2dag",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/kraken_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/kraken_rsol.png",
  },
  kumavalidator: {
    name: "kumavalidator",
    symbol: "KUMA",
    vote_account: "4m1PbxzwLdUnEwog3T9UKxgjktgriHgE1CfAhMqDw7Xx",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/kumavalidator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/kumavalidator_ysol.png",
  },
  laine: {
    name: "Laine",
    symbol: "LAINE",
    vote_account: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiL",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  lakestake: {
    name: "Lakestake.io",
    symbol: "LAKE",
    vote_account: "LAKEuKJQYVFpf4vyjX7iuf9ajHo3k9FiyewYKf6VxPV",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/lakestake_io_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/lakestake_io_ysol.png",
  },
  lantern: {
    name: "LANTERN",
    symbol: "LANTERN",
    vote_account: "FACqsS19VScz8oo2YhdMg35EsAy6xsCZ9Y58eJXGv8QJ",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/lantern_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/lantern_ysol.png",
  },
  ledger: {
    name: "Ledger",
    symbol: "LEDGER",
    vote_account: "CpfvLiiPALdzZTP3fUrALg2TXwEDSAknRh1sn5JCt9Sr",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/ledger_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/ledger_ysol.png",
  },
  luganodes: {
    name: "Luganodes",
    symbol: "LUGA",
    vote_account: "6aow5rTURdbhbeMDrFrbP2GR5vZjMEhktEy87iH1VGPs",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/luganodes_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/lugandoes_ysol.png",
  },
  luminal: {
    name: "Luminal",
    symbol: "LUMINAL",
    vote_account: "LunarE7WQyxpPwKo2hkEZZquu6UDWMNjvf3JyzGmdfp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/luminal_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/luminal_ysol.png",
  },
  "lumos-maxima": {
    name: "Lumos Maxima",
    symbol: "LUMOS",
    vote_account: "5daP6pZoPSak6UEKuRg2HHjvTPpqqwB113oNamGNKuuZ",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/lumos_maxima_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/lumos_maxima_ysol.png",
  },
  madlads: {
    name: "Madlads",
    symbol: "MADLADS",
    vote_account: "B6nDYYLc2iwYqY3zdmavMmU9GjUL2hf79MkufviM2bXv",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/madlads_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/madlads_ysol.png",
  },
  "magic-eden": {
    name: "Magic Eden",
    symbol: "MAGIC",
    vote_account: "magiCChVWbehZ1e3XqQfLh164yUfQ8LnRWgSP9i4oFp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/magic_eden_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/magic_eden_ysol.png",
  },
  marginfi: {
    name: "Marginfi",
    symbol: "MRGN",
    vote_account: "mrgn4t2JabSgvGnrCaHXMvz8ocr4F52scsxJnkQMQsQ",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/marginfi_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/marginfi_ysol.png",
  },
  meria: {
    name: "Meria",
    symbol: "MERIA",
    vote_account: "H2tJNyMHnRF6ahCQLQ1sSycM4FGchymuzyYzUqKEuydk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/meria_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/meria_ysol.png",
  },
  "mesh-validator": {
    name: "Mesh Validator",
    symbol: "MESH",
    vote_account: "mesh3Px7WMi7Dkxke4ZZBULoKHM6sp37wKtg4DwPqPY",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/mesh_validator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/mesh_validator_ysol.png",
  },
  monkedao: {
    name: "MonkeDAO",
    symbol: "MONKE",
    vote_account: "DfpdmTsSCBPxCDwZwgBMfjjV8mF8xHkGRcXP8dJBVmrq",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  nansen: {
    name: "Nansen",
    symbol: "NANSEN",
    vote_account: "2NxEEbhqqj1Qptq5LXLbDTP5tLa9f7PqkU8zNgxbGU9P",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/nansen_rsol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/nansen_ysol.png",
  },
  neodyme: {
    name: "Neodyme",
    symbol: "NEODYME",
    vote_account: "NeodymeDFipD7eA1ShrLJAZTBdHWcFsDB9YkoHshZNk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/neodyme_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/neodyme_ysol.png",
  },
  "nordic-staking": {
    name: "Nordic Staking",
    symbol: "NORDIC",
    vote_account: "B1w6SZcyvjyp6zEyStcc8u9AxXAh2AbYvNzMmP9rRKE9",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/nordic_staking_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/nordic_staking_ysol.png",
  },
  "nova-consortium": {
    name: "Nova Consortium",
    symbol: "NOVA",
    vote_account: "novaoLcuVHSudkW3Cphuhiv82vspN5qzinGCtEbwQxz",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/nova_consortium_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/nova_consortium_ysol.png",
  },
  "okx-earn": {
    name: "OKX earn",
    symbol: "OKX",
    vote_account: "2tucttroqFNXsrYeMBQ8LfzKNfgwT2rHBzAF6RzbbHEp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/okx_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/okx_ysol.png",
  },
  omakase: {
    name: "Omakase",
    symbol: "OMAKASE",
    vote_account: "GzjMbJQDVuBLFY69QwhhjDGDy2o5Q6nswXMuVTCWEFnp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/omakase_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/omakase_ysol.png",
  },
  orang3club: {
    name: "OranG3Club",
    symbol: "ORANG3",
    vote_account: "AY271jdvcyo5VzBiWsMGLEjpZFFrarq8FDydJHPmYgCG",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/orang3club_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/orang3club_ysol.png",
  },
  orangefin: {
    name: "OrangeFin",
    symbol: "ORANGE",
    vote_account: "oRAnGeU5h8h2UkvbfnE5cjXnnAa4rBoaxmS4kbFymSe",
    pt_sol:
      "https://assets.pye.fi/ysol_psol_logos/orangefin_by_sol_strategues_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol:
      "https://assets.pye.fi/ysol_psol_logos/orangefin_by_sol_strategues_rsol.png",
  },
  ottersec: {
    name: "OtterSec",
    symbol: "OTTER",
    vote_account: "23XqhxnRHt5gQWHowvyRHDX4Ky6BZyFdYxjTzxx2QEFr",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/ottersec_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/ottersec_ysol.png",
  },
  overclock: {
    name: "Overclock",
    symbol: "OVER",
    vote_account: "AS3nKBQfKs8fJ8ncyHrdvo4FDT6S8HMRhD75JjCcyr1t",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/overclock_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/overclock_rsol.png",
  },
  "p-ops": {
    name: "P-Ops",
    symbol: "POPS",
    vote_account: "HLM6hyDWrEca9QMS92nDBa2AreU1qDkppttPVuJ7E2CU",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/p_ops_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/p_ops_ysol.png",
  },
  p2p: {
    name: "P2P.org",
    symbol: "P2P",
    vote_account: "FKsC411dik9ktS6xPADxs4Fk2SCENvAiuccQHLAPndvk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/p2p_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/p2p_ysol.png",
  },
  parafi: {
    name: "Parafi.Tech",
    symbol: "PARAFI",
    vote_account: "pt1LsjkNwqCKdYYfc35ToDkqtEG9pswLTJNaMo8inft",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/parafi_tech_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/parafi_tech_ysol.png",
  },
  phantom: {
    name: "Phantom",
    symbol: "PHANTOM",
    vote_account: "J2nUHEAgZFRyuJbFjdqPrAa9gyWDuc7hErtDQHPhsYRp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/phantom_psol.png",
    // @dev: disable phantom for now (no lockups found)
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/phantom_ysol.png",
  },
  "phase-labs": {
    name: "Phase Labs",
    symbol: "PHASE",
    vote_account: "phz34EcgWRCT9otPzRS2JtSzVHxQJk4SovqJvV1TQk8",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/phase_labs_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/phase_labs_ysol.png",
  },
  "pier-two": {
    name: "PIER TWO",
    symbol: "PIERTWO",
    vote_account: "DierScgiTrz5AM7mddeJLHYNvafym3XhjjdM51AnKevU",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  portals: {
    name: "Portals",
    symbol: "PORTALS",
    vote_account: "prt1s9dMM15LdsUX9HugajzqPB5WVN8a2mw3frAiCfj",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/portals_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/portals_ysol.png",
  },
  "project-catalyst": {
    name: "Project Catalyst",
    symbol: "CATALYS",
    vote_account: "ErvMUdtMC7AX55zKdYSyy4DnWNCrTsWn5GwprSG7ocnx",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/project_catalyst_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/project_catalyst_ysol.png",
  },
  "project-super": {
    name: "Project Super",
    symbol: "PSUPER",
    vote_account: "EfnywDKqArxK6N6FS9ctsuzNdxfx3pzfXEQE5EevQ1SV",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/project_super_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/project_super_ysol.png",
  },
  prostaking: {
    name: "ProStaking",
    symbol: "PRO",
    vote_account: "juicQdAnksqZ5Yb8NQwCLjLWhykvXGktxnQCDvMe6Nx",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/prostaking_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/prostaking_ysol.png",
  },
  "pumpkins-pool": {
    name: "Pumpkins Pool",
    symbol: "PUMPKIN",
    vote_account: "DsiG71AvUHUEo9rMMHqM9NAWQ6ptguRAHyot6wGzLJjx",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/pumpkins_pool_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/pumpkins_pool_ysol.png",
  },
  quicknode: {
    name: "QuickNode",
    symbol: "QUICK",
    vote_account: "5s3vajJvaAbabQvxFdiMfg14y23b2jvK6K2Mw4PYcYK",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  radiants: {
    name: "Radiants",
    symbol: "RADIANT",
    vote_account: "radYEig9KGrMTMWbWRFV7LStotQbnLgPaEFHVDsudQz",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/radiants_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/radiants_ysol.png",
  },
  rakurai: {
    name: "Rakurai",
    symbol: "RAKURAI",
    vote_account: "4YykTGwg94GgHZEPSsQfbaMaEE9HHAHqSuXT65L6C6wf",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/rakurai_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/rakurai_ysol.png",
  },
  range: {
    name: "Range",
    symbol: "RANGE",
    vote_account: "21oUQzzytWh6y3G3SQ7ehktMh1RrbsJNA4R5pAMNyyrG",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/range_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/range_ysol.png",
  },
  raposa: {
    name: "Raposa",
    symbol: "RAPOSA",
    vote_account: "rapxbkwBSSvtqRFrsY83f51oUuZNuVXci74MuzYhiCy",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/raposa_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/raposa_ysol.png",
  },
  raydium: {
    name: "Raydium",
    symbol: "RAYDIUM",
    vote_account: "RaydiumJDX8X6om6Fg44xyqz5eukZ9KC3LX61SttLbH",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/raydium_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/raydium_ysol.png",
  },
  restake: {
    name: "Restake",
    symbol: "RESTAKE",
    vote_account: "CqSMzh8DWZeqYVa5M1V1rHU825T19NCjYipM3pkdHncm",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/restake_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/restake_ysol.png",
  },
  "rockaway-x": {
    name: "Rockaway X",
    symbol: "ROCKWAY",
    vote_account: "6XiVWAyRpG7wGUQPVRd2XrYdgQVQyoQamd2J8XAmate",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/rockaway_x_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/rockaway_x_ysol.png",
  },
  "saga-dao": {
    name: "Saga DAO",
    symbol: "SAGADAO",
    vote_account: "sagasJDjjAHND4hien3bbo5xXkzCT5Ss6nKjyUJ45aw",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  sec3: {
    name: "Sec3",
    symbol: "SEC3",
    vote_account: "EnRcbgr5r7EUS2P35szncy6TW6eWA9UQiU3yQRCDbh2P",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sec3_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sec3_ysol.png",
  },
  sendai: {
    name: "SendAI",
    symbol: "SENDAI",
    vote_account: "sENda1ZL5hoQUMpWbvRpReEfkrM4F35g9GBXPpYaZ9v",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sendai_inc_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sendai_inc_rsol_psol.png",
  },
  "sensei-node": {
    name: "Sensei Node",
    symbol: "SENSEI",
    vote_account: "5xk3gjstftRwZRqQdme4vTuZonpkgs2wsm734M68Bq1Y",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sensei_node_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sensei_node_ysol.png",
  },
  sentinel: {
    name: "Sentinel",
    symbol: "SENT",
    vote_account: "CiTYUYPAPHdcri5yEfsmqVcs54J6j8X1QaiFLgYqMVe",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  shinobi: {
    name: "Shinobi",
    symbol: "SHINO",
    vote_account: "HTz9TJBmyuT7YEFVYTGHdsnTgt4bzkgq1Gv2Zx688FP7",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/shinobi_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/shinobi_rsol.png",
  },
  shiro: {
    name: "Shiro",
    symbol: "SHIRO",
    vote_account: "7JZTyHRTmzHfmHH89uT9xKSKDVJ1VnNQ1FeTeM4iH3J2",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/shiro_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/shiro_ysol.png",
  },
  "sol-rain-drops": {
    name: "SOL Rain Drops",
    symbol: "SOLRAIN",
    vote_account: "4BVYjw1ztUzUPsxsaCheWWwThT2X4rjogZytGnuWPUGg",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_rain_drops_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_rain_drops_ysol.png",
  },
  "sol-strategies": {
    name: "Sol Strategies",
    symbol: "STRAT",
    vote_account: "punK4RDD3pFbcum79ACHatYPLLE1hr5UNnQVUGNfeyP",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    vote_account: "000dmTsSCBPxCDwZwgBMfjjV8mF8xHkGRcXP8dJBVmrq",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "solana-compass": {
    name: "Solana Compass",
    symbol: "COMPASS",
    vote_account: "EARNynHRWg6GfyJCmrrizcZxARB3HVzcaasvNa8kBS72",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solana_compass_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_rsol.png",
  },
  "solana-japan": {
    name: "Solana Japan",
    symbol: "SOLJPN",
    vote_account: "76DafWkJ6pGK2hoD41HjrM4xTBhfKqrDYDazv13n5ir1",
    pt_sol:
      "https://assets.pye.fi/ysol_psol_logos/solana_japan_validator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol:
      "https://assets.pye.fi/ysol_psol_logos/solana_japan_validator_ysol.png",
  },
  solayer: {
    name: "Solayer",
    symbol: "SOLAYER",
    vote_account: "SLaYv7tCwetrFGbPCRnqpHswG5qqKino78EYpbGF7xY",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solayer_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/solayer_ysol.png",
  },
  solflare: {
    name: "Solflare",
    symbol: "FLARE",
    vote_account: "EXhYxF25PJEHb3v5G1HY8Jn8Jm7bRjJtaxEghGrUuhQw",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solflare_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/solflare_ysol.png",
  },
  solstack: {
    name: "Solstack",
    symbol: "SOLSTK",
    vote_account: "soLStAckuvkHtNzHF1cwmeSRG1FzVxKxwsdWZ1yrHrz",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solstack_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/solstack_ysol.png",
  },
  solstice: {
    name: "Solstice",
    symbol: "SOLS",
    vote_account: "4vqwZsEEEsKtSqqEWbLyFAciWg66jGLP9zrbcZ1Hsrxb",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solstice_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/solstice_ysol.png",
  },
  solyrae: {
    name: "Solyrae",
    symbol: "SOLYRAE",
    vote_account: "DPhzpiNGU9C6576uLsNSHmdi2AxwxpjMsRdh2iVC4TPh",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/solyrae_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/solyrae_ysol.png",
  },
  somos: {
    name: "Somos",
    symbol: "SOMOS",
    vote_account: "axyQeKp44XqUnvC1jVHoeuAJ3j8wVnGeWtddeAcNYcF",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/somos_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/somos_ysol.png",
  },
  "squads-validator": {
    name: "Squads Validator",
    symbol: "SQUADS",
    vote_account: "SQDSVTDfE5HqL7D6RjZk1vvZhaheWoskrDdDHCki68w",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/squads_validator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/squads_validator_ysol.png",
  },
  stachenode: {
    name: "Stachenode",
    symbol: "STACHE",
    vote_account: "sTach38ebT8jnGH8i2D1g8NDAS6An19whVMnSSWPXt4",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/stachenode_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/stachenode_ysol.png",
  },
  stakecraft: {
    name: "StakeCraft",
    symbol: "CRAFT",
    vote_account: "BDn3HiXMTym7ZQofWFxDb7ZGQX6GomQzJYKfytTAqd5g",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sec3_psol.png",
    is_allowed: true,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sec3_ysol.png",
  },
  stakefish: {
    name: "StakeFish",
    symbol: "FISH",
    vote_account: "7VGU4ZwR1e1AFekqbqv2gvjeg47e1PwMPm4BfLt6rxNk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/stakefish_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_rsol.png",
  },
  stakely: {
    name: "Stakely",
    symbol: "STAKELY",
    vote_account: "BmMVRAVef2qmJ1tJpG3JwRUtnfEiTbvDw9ZeFEi4wE7D",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "stakin-the-tie": {
    name: "Stakin The Tie",
    symbol: "STAKIN",
    vote_account: "23SUe5fzmLws1M58AnGnvnUBRUKJmzCpnFQwv4M4b9Er",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/stakin_by_the_tie_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/stakin_by_the_tie_ysol.png",
  },
  "stakr-space": {
    name: "Stakr Space",
    symbol: "STAKR",
    vote_account: "3a2onvgTpGynakAQwx6gigtSeL7itZewNxqb5JiAvWeA",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  stardust: {
    name: "Stardust",
    symbol: "STAR",
    vote_account: "5iJDEVRi1nMLwKAWhYbEokZnvBAe15rgFaHGkggVEP9z",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/stardust_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/stardust_ysol.png",
  },
  "starke-finance": {
    name: "Starke Finance",
    symbol: "STARKE",
    vote_account: "D3QPJm7BDzzPeRG51YZSEz3LfV7GvFNu9NkcibzURxuj",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  "step-finance": {
    name: "Step Finance",
    symbol: "STEP",
    vote_account: "StepeLdhJ2znRjHcZdjwMWsC4nTRURNKQY8Nca82LJp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/step_finance_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/step_finance_rsol.png",
  },
  stronghold: {
    name: "Stronghold",
    symbol: "STRONG",
    vote_account: "Ac1beBKixfNdrTAac7GRaTsJTxLyvgGvJjvy4qQfvyfc",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/stronghold_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/stronghold_ysol.png",
  },
  superfast: {
    name: "Superfast",
    symbol: "SUPER",
    vote_account: "R1vAoSPFQdCc6wsAEMtxWXjqptSeN1YUiq2Zni1of21",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/superfast_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/superfast_ysol.png",
  },
  swyke: {
    name: "Swyke",
    symbol: "SWYKE",
    vote_account: "BARLL1NvF3jPHQ3zb82q1v5m6uewcpkgRBYVNufQMWjo",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  temporal: {
    name: "Temporal",
    symbol: "TEMP",
    vote_account: "RuBYsjLeJYtWXbabcxPbNcbbFXQvMLrJGutpcqVRomz",
    pt_sol: "strhttps://assets.pye.fi/ysol_psol_logos/temporal_opal_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/temporal_opal_ysol.png",
  },
  "temporal-opal": {
    name: "Temporal Opal",
    symbol: "TEMPO",
    vote_account: "oPaLTmyvoUhW26QCMwLA5JNUeBYy72PDpFoXQF8SeX4",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/temporal_opal_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/temporal_opal_rsol.png",
  },
  "the-vault": {
    name: "The Vault",
    symbol: "VAULT",
    vote_account: "FahWJg2PkphJaMUUCzdYhXkD5NngUuuFRFD3YCE3BSwb",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/the_vault_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/the_vault_ysol.png",
  },
  "theia-capital": {
    name: "Theia Capital",
    symbol: "THEIA",
    vote_account: "THEVb5dS9gHYnr8eu2FHCprjnyp3uqmHNofUXD8MCQp",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/theia_capital_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/theia_capital_ysol.png",
  },
  thw: {
    name: "THW",
    symbol: "THW",
    vote_account: "THWfRpcJSC7oDrNMSCcixTZmCHVBTEVQL4qnd1UTD1x",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/thw_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/thw_ysol.png",
  },
  tinydancer: {
    name: "Tinydancer",
    symbol: "TINY",
    vote_account: "2ZP7DPXW6gwMRSY9PSXQ75fZLrk4gKWKnT85pK5sVPa5",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/tinydancer_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/tinydancer_ysol.png",
  },
  "triton-one": {
    name: "Triton One",
    symbol: "TRITON",
    vote_account: "GNZ1PAAS33davY4Q1BMEpZEpVBtRtGvSpcTH5wYVkkVt",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/triton_one_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/triton_one_ysol.png",
  },
  twinstake: {
    name: "Twinstake",
    symbol: "TWIN",
    vote_account: "Ak5BJzQe2R8qFuyYmaAFPjXuD7XPux3ZNTv52D7rfiqR",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/twinstake_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/twinstake_ysol.png",
  },
  txtx: {
    name: "Txtx",
    symbol: "TXTX",
    vote_account: "TXTXAmsarrYrTobiCzq2r9NBqfChqRE8wEfJNsYZZ6F",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/txtx_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/txtx_ysol.png",
  },
  unruggable: {
    name: "UNruggable",
    symbol: "UNRUG",
    vote_account: "unRgBLTLNXdBmenHXNPAg3AMn3KWcV3Mk4eoZBmTrdk",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/unruggable_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/unruggable_ysol.png",
  },
  "upbit-staking": {
    name: "Upbit Staking",
    symbol: "UPBIT",
    vote_account: "GHViLgbrJdZDPb6sphRbeuPNM9cmjsFuGWzrTF1sKF5n",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/upbit_staking_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/upbit_staking_rsol.png",
  },
  "valid-blocks": {
    name: "Valid Blocks",
    symbol: "VALID",
    vote_account: "6hkfqeNAbURk7CmAQsP4Qm6WwHVF4LxHupEvQf7Tkrf1",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/valid_blocks_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/valid_blocks_ysol.png",
  },
  "validation-cloud": {
    name: "Validation Cloud",
    symbol: "CLOUD",
    vote_account: "Ec37CQZjwRgGnuMmUi3BnEBXS5Xa3siakAPxPkHtahSf",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/sol_ysol.png",
  },
  valigator: {
    name: "Valigator",
    symbol: "GATOR",
    vote_account: "gaToR246dheK1DGAMEqxMdBJZwU4qFyt7DzhSwAHFWF",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/valigator_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/valigator_ysol.png",
  },
  vladika: {
    name: "Vladika",
    symbol: "VLADIKA",
    vote_account: "53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/vladika_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/vladika_ysol.png",
  },
  "vybe-network": {
    name: "Vybe Network",
    symbol: "VYBE",
    vote_account: "6oscGUEkXE8fyWoC4czRKbM1cuLkJNtgRsX1Un6w88Vf",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/vybe_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/exo_ysol.png",
  },
  watchtower: {
    name: "Watchtower",
    symbol: "WATCH",
    vote_account: "9jYFwBfbjYmvasFbJyES9apLJDTkwtbgSDRWanHEvcRw",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/watchtower_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/watchtower_ysol.png",
  },
  xandeum: {
    name: "Xandeum",
    symbol: "XANDEUM",
    vote_account: "6hZL2FZim27WkQccMfygvvXH2eow5u3wR6XUJHbMoeWP",
    pt_sol: "https://assets.pye.fi/ysol_psol_logos/xandeum_psol.png",
    is_allowed: false,
    type: "validator",
    rt_sol: "https://assets.pye.fi/ysol_psol_logos/xandeum_ysol.png",
  },
};

export const ALLOWED_VALIDATORS = Object.entries(validators)
  .filter(([, v]) => v.is_allowed)
  .map(([id, v]) => ({ id: id as ValidatorId, ...v }));
