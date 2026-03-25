import {
  MaturityId,
  maturities,
  maturityIdsArray,
  Maturity,
} from "./maturities";
import {
  ValidatorId,
  validators,
  ALLOWED_VALIDATORS,
  Validator,
} from "./validators";
import { STAKE_MARKETPLACE_FILTER } from "./stakeConfig";

export interface Bond {
  pubkey: string;
  pt_address: string;
  rt_address: string;
}

export interface Bond {
  pubkey: string;
  pt_address: string;
  rt_address: string;
}

// Generated from solo_validator_bonds on-chain data (Supabase: pye-backend-mainnet-prod)
// Structure: lockups[validatorId][maturityId] = { pubkey, pt_address, rt_address }
export const lockups: Partial<
  Record<ValidatorId, Partial<Record<MaturityId, Bond>>>
> = {
  alchemy: {
    q12026: {
      pubkey: "DAvM99bax26DbtQg8arjKCnGShc1D2DmEkrTrzjo83gG",
      pt_address: "399NjCZnuFbgHs2uCtvvEAGPPmsEpxxVmE8TV6wUhNVQ",
      rt_address: "5CNRw6qELjQuocgv1d44rXrCe12MkgzbkHb2tRKdWqG8",
    },
    q22026: {
      pubkey: "8k8EyRnaybKP9g9E9JNsWTXWMHdMoJttzShwq2994jDL",
      pt_address: "2toCKwQjihotbYZNNQtoXCjXkp669xoT5Ms4gWtJYvDr",
      rt_address: "2aPkXwCD4pbvaoenWcx9oKaeJ9rdyVeqkLNyJS5sRyfv",
    },
    q32026: {
      pubkey: "DY7Bm6nhrEKyXXnVwTDfrmwdFZrjqdM9jPvESWtGcpHv",
      pt_address: "GA8MAhp5mWew3VwdxJU8571rUKeEeU3yVsG8Ag7SU7Hs",
      rt_address: "EAbT1HvVdo7EtByZVifw3f6wJA4YqK1FaUQx41uAYe6X",
    },
    q42026: {
      pubkey: "UbzpFyhFVkRUQx3oGqFJ6Cjx86A9N4SgPKHhDPhmhfv",
      pt_address: "4TmjAh1FKbLkfRHRooJLMyxYSqaNfEvGu3KziJfHBsvq",
      rt_address: "CH3hjYys34LGP2b4YrBUwXP7JsakvjV3fjhXL33A9o9n",
    },
  },
  "all-nodes": {
    q12026: {
      pubkey: "6htH1Ln55SrsKrYjW57tC67wREYMGqZh4R6Yo6qdwd3o",
      pt_address: "CLCS1eTEgaPJVgGA2MwyE2mM1Tj5W6jqzMuGbDGcBJhB",
      rt_address: "3gCpipBKNxNzXNb2zh51ypvM9DYw2pLuNcgJEsDRWHEJ",
    },
    q22026: {
      pubkey: "HrngyrsCT5aatWn2FjMj5ENJUHU4D597LPN4m51PdhcU",
      pt_address: "CryX1SFRXJVC7CAqgXwDdSXq6jBFAAbFrhsed59VmvDh",
      rt_address: "8iwXT53XK1vAG6vDK2mGNCnaR7g3XktUcG31tezFesHL",
    },
    q32026: {
      pubkey: "BbgALNYxZhQDWqho6ghXWrTLLbGWtmBTAEQb8nLhXMqX",
      pt_address: "2dfoDUohWketwamzX9HfaMYT5Tmp8CNvmURLzCX5pUNH",
      rt_address: "5g5Cqqr8U6ipGW6LXU9ET7SwNfZG6PfF1NjWrs16myYC",
    },
    q42026: {
      pubkey: "Gtahjnmhh8ETimbxS7mJvxNT7JNtp7pGvRDJGk183Z5E",
      pt_address: "GUsvSsGaafBtQUXt4gck3rqdQsYVMh2unnweKge5GUo2",
      rt_address: "EYyNhVrpCdQPcKYyMdqNTZcKt1sSmumNA8TdWy6ZTc8Y",
    },
  },
  anagram: {
    q12026: {
      pubkey: "HutzKe4aghCvM7S2C3deMqZjzKjSYruAjVxDM7uZEUtX",
      pt_address: "9gj2CMWGRie5vXSSnU2LSMgHboJEU5hk9uRPRUXujAnC",
      rt_address: "MSYJj6f8wyy2dREvtvCSbtaprkpQunP9jNE5W4esQ2j",
    },
    q22026: {
      pubkey: "GoNxGu3j4XMK9ksFGEpKSx6e6K5kQHGweQ1PUpLM4Wa6",
      pt_address: "GBaveq2r7CbWm9J5mATPRoGeGKHz8gHt3LseFmqqKiBH",
      rt_address: "8hc6w58vDUoPBCnAnz113HMKvEXnQSEK4UhQA9LbtBF",
    },
    q32026: {
      pubkey: "5g3uyqr38GmRYEyxbg2uHvJdt15PZnLoQYVPBj7nWXM5",
      pt_address: "CmrZ2kgAvAzyvcXSiKgV1WnW5Q2o77woWop4CY563NkH",
      rt_address: "EAbi4cVJ3m3TcVkwvKw2QQcqbTDLvao7jgGZ1PP2EpYG",
    },
    q42026: {
      pubkey: "BAxrajzc9cCWygjUdAUUR8StNHMaWf65DkfLvQBa8Mzo",
      pt_address: "FRjpm6NkQhzjVeADeCzteAYF2rYV4QBtTVimf4kok7VE",
      rt_address: "GNcodp1AAoweBJcyKUpg57B8iydHnzAy5XZHvFrN7T6o",
    },
  },
  asymmetric: {
    q12026: {
      pubkey: "HemceeH8ogzqEYJ7m6d8142dHzinESw9JpbD49o1e2Xb",
      pt_address: "DFAooHHEKzBSbqLSd5rXaLugHjxdwBTE4DyaSAjipFoF",
      rt_address: "8WsLC5F3ucJYy7dkXt5vcKVSdnb5ZL1aoPixC6CYAuLy",
    },
    q22026: {
      pubkey: "Bbdutwsih7QaN9QXBiuf2eHrdMBKDfpBqmhucQidWcge",
      pt_address: "CGdgsqbki3EWjFoZPJVZmiy7RGjCHDwZtVEM6v9B1eTu",
      rt_address: "HeSpWK4WPzKHcZXuBxXGJMCzpuNBhGpdUY5b7QCtdh5m",
    },
    q32026: {
      pubkey: "6Hjbdo4ZV1eYHuMCa4AKTkAMXynJ2ywGy9Mp7rErKNKU",
      pt_address: "AqrXYZinerC8jwz8YfpmUg4aigyjvUdLyR4JZNX6Xs2C",
      rt_address: "21CepzUkmG4Ast6JiaU3kHmerPDLMeyKd2XpbVYqQ3Ws",
    },
    q42026: {
      pubkey: "4kk4KCXERNZeFTxn6vXodtUsZhwsnWo6kAgL53nDgxt9",
      pt_address: "DoigvB7ixa6VWYE2qUPBCRut19y5pgeJ3Fe4yTTD6dY9",
      rt_address: "2KEixPo7ri8779tWd6Nu3B8QVBfyurWia22gNpsc6peb",
    },
  },
  coinbase: {
    q12026: {
      pubkey: "2zCLdBYM7a76dtW9h8SBiihrgX5JL1onz7nn6bdLtRrn",
      pt_address: "FvHre9TtG6RykyuVi64gwGrDi2s1hnRKZmoBTyhGB4aK",
      rt_address: "G58njy1XzrJCqx83g7sJtMHcJbqFahMpYxAhWYmMvAjx",
    },
    q22026: {
      pubkey: "6Ge8ryxbBxGaVckT2A9KEYATnFCUvgDjEuuMN71kB4Kn",
      pt_address: "39Teyy2rFU1GSQ6RCWTtMERb8r5LTn5ELv8hi33BHNPJ",
      rt_address: "4tXCBepQmhHvdWCS9uT2sni7hqHnarZ2KsAtJdbfJkyb",
    },
    q32026: {
      pubkey: "3LGtSxfwhH7wngn6JSw6wVfBp18hrxELCUjTUnerR5Xi",
      pt_address: "FxbmCGDQ5TFs5dR15w2aVieepJpWY58W35pGEuDfTSrx",
      rt_address: "BgbKutokbSSGwk8RTe3umW72hSuReditE7bzK5XNeHPX",
    },
    q42026: {
      pubkey: "H65nqFUEZbSot7T4USsFR3Vh8SiTKuAwrQEt1gRxvjRd",
      pt_address: "7fqy3idXm9J8voLAoruSg2gfXwwRUMRCgQ714dVSxuW1",
      rt_address: "98d3ADhmLmTMKQMXcSEnnFb68Fi7V6caNkbP7Lvrq1Xv",
    },
  },
  blocksize: {
    q12026: {
      pubkey: "7WaEYBjn273XZNdEfTApQUYRKN8fjBe6hov6Tg5YMAVA",
      pt_address: "8PpPNMyoERpdFPcYikH19JZvgkuRCo11zHS15q3hgchh",
      rt_address: "DkrYtLmTdoUqxx23b6qWHZ59tXxeWJib8KA8XugKKAT8",
    },
    q22026: {
      pubkey: "HQCoDhVYMAyDxhASZZfkJXtcVpLDgDezJF1Pmfry31re",
      pt_address: "DnQXk5CTNHXDx6hRDyikKWLv3Pt8eq7Y4xPHYDT6s4Uk",
      rt_address: "CemtczMNaZ5eoXSJXfWnsUKMUKzMHAxXPbM2M3ECrTWR",
    },
    q32026: {
      pubkey: "ATuAaWqCoBT5HZ2TGWASnM4Tp581uYVmCtQX9Sdmxsu3",
      pt_address: "93DoJKSAdZSLTp12yNW6VnyPcMVsvuw1TYAecXDRfeG2",
      rt_address: "14D6SofJjbdSm4G3m2DXxJoV5vyk1CnoidXDSf2A8Yd7",
    },
    q42026: {
      pubkey: "5WNeC7CYKUi5NZmT9eJ2RWvAhXgmcHCFszbFvuJeK8D4",
      pt_address: "CHpVz6LWBLdcJV1rcxaFCu4AFcomkxjxGW1jKktAMSTA",
      rt_address: "HVMXzRsSb9D3e1b78z8xUGFo7hzZWxA5C9oDXuHmwWye",
    },
  },
  "block-logic": {
    q12026: {
      pubkey: "BCNcazCuXCRg7khiuVYcdKrqsjWczGRSkY1kHXjd3N1x",
      pt_address: "XB6CUr1p4dEBbCkiRXiZSKVXNvaux8JRhhhpWynw6Mp",
      rt_address: "89qsSesG28xi4gJ5c1ou8x45U1MFgfNDCdNEQpTgKLnC",
    },
    q22026: {
      pubkey: "EWb3aQpqodRZQXk1yvaFCkX6DSDy6ZbdV3hBeUFGJXyR",
      pt_address: "9qq5y5V6LeJMWbuCFf4HEik7WMxs2yzUvn2u1GHrrq86",
      rt_address: "GmkfKFyxisAigZ1WoUwsAS7eGe5FV54vF6gamt1AifG6",
    },
    q32026: {
      pubkey: "DzJLGgcw7d9h9SVnt7rdwkADYcJT9DfPyXXuPcEYshMF",
      pt_address: "HXF4Rgchfd6nFA1LRQuNV2c7GiTf3bbJCQQadub6jar8",
      rt_address: "CJDwYq9GTfNTa3kKoGtdPKN2GSfhTywBp353o7rpbGBB",
    },
    q42026: {
      pubkey: "8sXeSr3oufwCq1xskzWvJRRTywv5HbpPukpmwRzNMJCf",
      pt_address: "6Tq1wEsccSX1Zf7nsMpvbJKSXMDjUJChJFHNJ1a5vHPm",
      rt_address: "zz8kJzX3fKvG8nJBYqy8yDy8oz5dMwvAV48BxoHeiup",
    },
  },
  blockport: {
    q12026: {
      pubkey: "DZbDkAYBiCK5gbhcsKtP6vC9SbTENTBKv5AGXGAVyTFV",
      pt_address: "4X3a3FXKgoQqH4fkEJyoCLKs5Rq98w6P9x9qCyC7wAtj",
      rt_address: "7g2MyfmMPKG9hCGDseY33TtrDVkasYXrPXyphDmiz6SZ",
    },
    q22026: {
      pubkey: "HTWZAkVj3rj35vxTGVKTpq6eFBnuhJP5SQfZRHgBSB8N",
      pt_address: "Fsr2Df5YnZQ25Etr3aTV6nUXtidME4XFhWdBcKaAkdAN",
      rt_address: "C4jAft9zMLHKXLCbTSXaXdh4kH6enhPFdz3MdyFYX2pn",
    },
    q32026: {
      pubkey: "CyfEgbPEK78A9UMVYcz18Vu3iiz2v8u1pxTRe9EhR38m",
      pt_address: "4sKbstuDBms4HuvSGfNvyrxbbCwBbdv74gSZTihZNWLe",
      rt_address: "2WSiA3Xs9kLHZUeCqc1LLANnY6kRp2nJJmsq1Dw1dw24",
    },
    q42026: {
      pubkey: "8iDTyhFTWdXk9eagDofc46cj8aEoHTzLuUCd5SZyuZZW",
      pt_address: "HK4CArrwkayQ5PxUpzDzDLhsuPUnm9fWQCWpVLiAzTim",
      rt_address: "2ECGYw42byW7gj9vVR9FXdMExCTGyqcH2c4yLWC9Mbf7",
    },
  },
  bonk: {
    q12026: {
      pubkey: "Dq8PPWzsbq4FQCZHREQhUbjPGRPNEGCUMcSC4mfD3169",
      pt_address: "CCfKNXfMN2K12qaa5Qo8wkJ71esvrfhtyfNwz1NiUvy5",
      rt_address: "AtD2qYM6JJj5d42W1rbP2E2mDxRofzu7HvRud9av5yco",
    },
    q22026: {
      pubkey: "4uN3yvVjLQBNyYVnazdNeik9RaQpNnsQTkji4ht67ycQ",
      pt_address: "ATreP17v6E3nRy8wPUKUUP71ofZLGUKzPfzthirWWDDP",
      rt_address: "418wRPgkSzVBcHcidBVEa6wpwkGeGLLuBAr3wMervo9q",
    },
    q32026: {
      pubkey: "99Mt2xwjNbgJZyA1burfmHg96BgZptojQXZqxS4H6BSa",
      pt_address: "ADQuQM8U43xJGgNxHdUFroEheVZV1E63UQvGBzkJk1B1",
      rt_address: "5P4vHKNXzk79SkFvHeKJsMcmcHF4XVz8VyvpDYFTbWHo",
    },
    q42026: {
      pubkey: "GoqgSw6NAiiGD2ZgksAebdRWpqfJoctAsHBw2JtqSqtj",
      pt_address: "BUQLwUhze9n6EQU4dQkZ14aiymWsmDxgbNFDvwt1Ft2t",
      rt_address: "GBGKNdcEC1vqaaotiypd9ekB1qbhXxK64mZxJUJSPDQQ",
    },
  },
  bybit: {
    q12026: {
      pubkey: "9DJ4ScsH6u7Th2XgNxE5AhZmYXgVUnmvQ3WG2j2nQX2X",
      pt_address: "BRZdKq1ftrUr1BiFLaGWnChCe9nvDQUyTxhE9uA3UGxy",
      rt_address: "Ej1Ye7bxdwxfwWApHg2ZZUecmEwGTUMLZ1FGvoYtyAJg",
    },
    q22026: {
      pubkey: "E33MdzdkKnDjFjqsL3puM74Facw9Unoxs4tSWPRsr2N1",
      pt_address: "F4YVH2keLMMLhkkqVNGE4eJ2AkZTQRcb3oqJXhdEZqah",
      rt_address: "55SZiGpjAshdync7Guhtu3JppB3LAZSvZxCMKfdeeEfE",
    },
    q32026: {
      pubkey: "Es8WwtaDB5PwKfwTdgEQnR1NnBmfLgvC1pbqvME4Fmyp",
      pt_address: "62fhgf3yx4GjUf5KG9pV91oG1D2yXhczuzFx2RiG1byF",
      rt_address: "4QWCEgfSrF8ScEHARBpGrM3yJsZEDzVkVyfbAyRAo5e8",
    },
    q42026: {
      pubkey: "4sCddWYPuFMd1uHDF5RHMHpz78v2GwD663LJU7sm6Ysx",
      pt_address: "LnvKRxoxWX6DKZBusXo3zxBYwyURLyZ5Tz425ZoPCZw",
      rt_address: "GjZUp5FwymYcbqUYJufQkjHKxRkSbG7iqw1xV5bEN6ty",
    },
  },
  "chorus-one": {
    q12026: {
      pubkey: "2ASJRCVBvxuoVbeYTUdTaiQV4KGADwArj8dnhF31ecGJ",
      pt_address: "9ct4MwT7tvWhKbRJXaWgLh73X47qMuVX8CMjDiK1HB7v",
      rt_address: "GBWgdv4L9CoCy7c7XXfqoWVGnMnzaXpQ4MsXjuaY2KSS",
    },
    q22026: {
      pubkey: "3Mfe1D6FL5ZWG4evCUZ3vYpPPoCV97EiYVGk52FMv84T",
      pt_address: "CvMe2jY1ZmBf48bVTd5FHYF8CwWTUDS9sto8tCm3cLgd",
      rt_address: "X4KWCWiizSQTR6Gti7mYqN3TTFgf2TazNPwKSCkmjCy",
    },
    q32026: {
      pubkey: "9Nif871skt8u75PaTqhiSzGymsFhhEjb28PWVKULpFf2",
      pt_address: "21iWeEVPTtWosNvAfvENMTAxQbkizLxAQhtF3vrJUzEe",
      rt_address: "5m8ySHASsFPV6x7wQr7RDocw5VCBAn3iEmc8CALFvEAs",
    },
    q42026: {
      pubkey: "3qYNA2GRMsejog9HQ2K4rg1U7dQHrtCx1jphFYxe4fd7",
      pt_address: "C2sRbkTGKZstWYx7caSow2HRw12eoUZEN66ntvrppqoH",
      rt_address: "24Si2nj1wWpXfHH27uyMkbQ56pguu91Ag8aiXZu6ZSH5",
    },
  },
  "validation-cloud": {
    q12026: {
      pubkey: "EWETv5FnuWKkdYM6sPJaU2HoMqESo1JvNizfmXLixcZa",
      pt_address: "GzZp1RnTuggp7r5EH61u1u1SzLLCt85qFAr2WaL9czy5",
      rt_address: "BBUFcrpCEmz8nxVYY9JXinBU9zHfYkwk7wk7SpaAEfK6",
    },
    q22026: {
      pubkey: "E5F5CBP1JSWLVVuzjtoSmnMgiiFdNqAT4BvyTGZZ2ciB",
      pt_address: "HrgZu6eQAFGUa7R71KpCZyUtibAGNwag3478sZo4W2LF",
      rt_address: "93GjccSWhJravBCAJxQBokKnU1sJT3Sp6CRGaATz53De",
    },
    q32026: {
      pubkey: "H9aE3niyYeLrc9crKWVkX9yRuizvT95aiJN7QU5ChP62",
      pt_address: "AqA26xDipNdzgN142BiALbWPD9udjLhd2H2HrNMu3zNn",
      rt_address: "4DoZi3ur3VLgQhXbMyRf7dycSit8GdTZ5yAUANiUbNzS",
    },
    q42026: {
      pubkey: "DaeFvuRYN2fLF2E2n8XDKgxsrC2YSbM4iiqpSy5dkMed",
      pt_address: "3w2aZRmL2mtx2gMADrdH5ijH94VL4yoEPfFW1L2LfFR4",
      rt_address: "4TgzxRKiH7ZgywK7bcUHbwk6z8PVfyoiVscFF1R9LsxF",
    },
  },
  "solana-compass": {
    q12026: {
      pubkey: "7j6WMXcxCXXAkNLeedb29jvWaaLnvTxq9Dfp5wF2Q1pf",
      pt_address: "7z26RYyAwe4khH7b8oEMLmsjPXbM4CaTTqiNEK6FYxC3",
      rt_address: "4rmdLWDcndSDhTZ2LAcEXsvGRZZ9Upxc6P5aHhk21FXo",
    },
    q22026: {
      pubkey: "4wrn2x3ywSzUVy24VrcLeRuSJvLCfpKexgyZswhqXVjL",
      pt_address: "98ekYgAGTawK2p4Q18sX4ygadhP7nWjSrr4Pq9Ri81Yi",
      rt_address: "3xWWBRiTQQBuULWbf8QZB9sndobnsjLE287PBJJNZPZc",
    },
    q32026: {
      pubkey: "BewPU9mhAD7KNysbLtQEcvRkJrdheZuCigKTwKgH6LoM",
      pt_address: "94zd4xng6QmedY6Y14vaBKkMVjfyC32DqDiTXtcjQqy",
      rt_address: "GSWJtR1ScPqXvteuKXgqXNN52gK5hoAXSNaMvFesnoXM",
    },
    q42026: {
      pubkey: "9A1YQKXsn3Sbi9gtx6S2vMyim7NaErtvwALbaAXgpugx",
      pt_address: "FkGaBF2fzbqZctsu4ypu8Ssb7U5osDtyaAXhUUtyXhkH",
      rt_address: "EEpmALPWDEDGNDixwcE8bcRNUEWWMmKQfAFpscNzBUhX",
    },
  },
  stakecraft: {
    q12026: {
      pubkey: "7ivKjMe3g4D64RU4kgdoh38297nsz4rSAA7FmuP84LnW",
      pt_address: "Ct4FdNoTkiiRS9BCDZ8aqTy4wam5N9uT2fzvVfMb8Jtj",
      rt_address: "47UdBrsXcgAe4D84NkWkhsSG2r1cbxoEDpyJkwukLitX",
    },
    q22026: {
      pubkey: "3Yf1giKxr1YvwBZjyGggvCnEK5werC63hb7q1niAzVMN",
      pt_address: "BM2FuciSHTNRwQjY2haxG6AyUJLfUX9kLQmA49C6fzGz",
      rt_address: "GMZ2ZRC6oyhdz6hthYwNrdaXhGn97szbSAaGEzie7P5T",
    },
    q32026: {
      pubkey: "4nu6LDss9YPLZ6CQy353ojMSbaBd8MgRwGYF1WRK6Sr3",
      pt_address: "GZCtHrcFPBvyAtxKpDzoAKnAmpJ1XiPpwAshWmHkNtnL",
      rt_address: "5AnuBMeZLRstSDFgEcF1Mn7KqhvZg7ibGyDzF6T15stF",
    },
    q42026: {
      pubkey: "AzJGQPG8GX3RHsKBb8ToSTQWkazrqbs9kL5UbdLwQYFq",
      pt_address: "98ckTubm4ofNetzoC16dmSfHsnPoVo1K8Jx3LTZAe31v",
      rt_address: "4GdSYRqpbtRBAmApLBmqrwykqvfp8dHBfmGUBDyTCABS",
    },
  },
  blockdaemon: {
    q12026: {
      pubkey: "FuRaZYxMesUmrutjTJdJtCiLa9eKfwC8YT3Tzmxs8LE7",
      pt_address: "ZhJeRjWpTw3fokZpri4AT9VhfER2AVvgWsKd1Aka1bY",
      rt_address: "FGtQU5QQpCfCve1VKqJ9nQBBpiJ5uQ3bQe3PD8pTewH1",
    },
    q22026: {
      pubkey: "29nP6929TfDpdn1pLsC9EHstRSo4MWvEcw55FNt872bJ",
      pt_address: "CdZqsidKMHAHmS3GyFo75UT3cobVA1DL4FycyPwqUm5h",
      rt_address: "BSBR7SXki9c8SJhLas656JWzG2gVuseUkKWxZyeBgzRo",
    },
    q32026: {
      pubkey: "D1LHkSQhvkWdyqTgBDzXeNv2b8f2NPcXWhDP7tnaCaVc",
      pt_address: "C4PE6fpmANut4sfNZJqVemMAjoxF9DMZqszPPN6mDGcf",
      rt_address: "6THjgJ99GF9h9KEVSgqr1FbKCr41CZjcwdtKCGej4UAe",
    },
    q42026: {
      pubkey: "Dy1artCfKnEuZ7zvbAvdSDWrYV8hgbQaQFy5KV3DUrGU",
      pt_address: "238UbWB4pBTu7fU7EjWvbEqEstrLkaWR7SLjvtsoV5Th",
      rt_address: "83ptnmoWiwMnsr5xHCx5Kozwreqcj71Sx4ztqEoPkEht",
    },
  },
  dawnlabs: {
    q12026: {
      pubkey: "B6A5grbLJk7teche8bRWCjBY1dHriYWiXTMBDpP5Dk25",
      pt_address: "2QCoKt6QCnn4y5y7zY74Ka5Q6QuHkkQbGJvR5ReGrEt8",
      rt_address: "FKVzKAujJhYLSzYPu8ZNaPaamyYc8XXLmRwTU9ZTC8Ay",
    },
    q22026: {
      pubkey: "BXh3PZvXfKopXJMjFVHQf6uont7iW3wAm977vTJo5YXQ",
      pt_address: "HhKq5WRag4aRETDGCe7kHcjc6QmHNMuaYAYprFbPx1YR",
      rt_address: "9JJZ1ZAB9frT1ktHCXJEYHpaV6qqMd3o92HmfZeuwk55",
    },
    q32026: {
      pubkey: "DzPsERtGVSG13h9QWJohjBGGTwZE6ChviEAzt3F3iYUN",
      pt_address: "26BqQYTxdBLHgESNdaAvXetFvVtqH7WiFBggKh7F3y44",
      rt_address: "A3wrcx5uJM4JXpMqnMK4U1F4A7YQPaLu1mRPJfiKjVS5",
    },
    q42026: {
      pubkey: "9HRkvMKrN596UFwxBwKu4jZpVzfch98X19VvPGCSdvJF",
      pt_address: "9zaEBBwSsamCKYZtkWncQNau13Srn6nwtofdcZ6SdB8Y",
      rt_address: "5LF94WQVrhfebqnMAZnZkBHSuXE91NySekVeSyEaL4Rc",
    },
  },
  "defi-dev-corp": {
    q12026: {
      pubkey: "84aWo2LxsAxZW8JPFcApmTMH1aXM8PnF1r1Td4w4vzmZ",
      pt_address: "HWmkicjTQtmxAJpMze2emHy6tyG9UuiUNL1L3VuYGFzA",
      rt_address: "DZTWBfd1AmDcGNJk594vdxv5SwnErfb2u83ShyZvozVp",
    },
    q22026: {
      pubkey: "DMtwhEK2YMk8HWD2tdWJBPy6mm39jwpvPuJSPudmShMZ",
      pt_address: "4SimYekHiTZ3vaK4kwvFnEjqT18q9s5UnXGrku3kzRc9",
      rt_address: "3YJ7Zm8FeKjKBqWJjWDRaoCDBnK7SqxycGhRHmZfC3z2",
    },
    q32026: {
      pubkey: "EYfScC1jDLKhMEs7bwmXNAo4xoFSzFL6BagSNreGSxd2",
      pt_address: "GaUht3rUtjYsnst3Dg71sbLVJxsNE1bW6SFcmknt6xTu",
      rt_address: "HdvAkh3PtViRq9HPYaEwXiHqpK61CSbpFuWA4zFgbfVa",
    },
    q42026: {
      pubkey: "5HAxFevAxZPnWkHb8dJoAe8bM11Ppir5JiUdMz1YQ3jT",
      pt_address: "FdNmLyvzJiHS1cDNNMNDs9QVeMewbQALtM5BrdLX1JHT",
      rt_address: "46mmPY9TPort45cUDxWtXkCWoZFofo9YqQ2ys7ktV5kq",
    },
  },
  drift: {
    q12026: {
      pubkey: "JDwwSud1JFdREfbzfbNxm83Sa7cBsdGNkrSvXfE2S5qj",
      pt_address: "8WXYC8gNchUyFk5F71xWDRvmNpXox2oxc9C6omBHvRqA",
      rt_address: "Dp5S7kBs3K4X9wh8bftRVTD2jBkXAfPW5G8dp7T5XHZ3",
    },
    q22026: {
      pubkey: "EzHwGuutt4BNMJizdAtmPihC9bkZtiC3VGxRt1wk8fwG",
      pt_address: "9RboxKcR5oiJyDXXTcP67vNBhbHRNeHwuq7iA4HvqBwA",
      rt_address: "99VMdq5JdwJZzRSXpyhCDMa7m1yr4R6nH2qqpMBiAqGW",
    },
    q32026: {
      pubkey: "JDSB2m42tVs7MkZWsLM4hZB1EYoMQPUUKECUQfcQRJ4m",
      pt_address: "Fr8BtFQWFAzQyYizeRByMktfvy2S7FGhyeqtgWMxZTyH",
      rt_address: "6acEXLQnWqG3S78myEJpcu6AnN86sZRAh7k2ivhFWaxS",
    },
    q42026: {
      pubkey: "4qmMw4dzsee4cPgcxixJjxiTGABzjh9ZzuYtJhftH8Gw",
      pt_address: "9kfDiAxbkxJSrWy56kq5cABwCmsFHTQ5BG4gArBMGFUA",
      rt_address: "6i45Vd34E9ceFzRFrqnwb5MihbwHSoA6U9mP7Rum4Pmy",
    },
  },
  everstake: {
    q12026: {
      pubkey: "CdQrn848tdMU4UhSBXDoPjX3KMDcbZGTjPizQVVQynzV",
      pt_address: "CpuWa9T2AuwKjt6ZUyWNshNehKrCfXA5oG5yZYivg8Yb",
      rt_address: "5duHK99y4ZmfW3VqTcmASbE9z4USFrRVUHNEPEemupFB",
    },
    q22026: {
      pubkey: "4NMNphczpQ8cya96ngWMFFRAfjKEZFxYWqDs8Su6rLEY",
      pt_address: "2pcj9TUPLBq2rrrKff6vUxcnGqkaT3345fhjVqnuyg1W",
      rt_address: "2BUWoYytTr9dyY3XodvERKLGr8JUoZEskAKXV4Cit3PY",
    },
    q32026: {
      pubkey: "H4YQGjXWrNGk4BNQLJZr6qeM3Dz3ipDfm2oWDU88KmK1",
      pt_address: "6yu4Um2GXbwSihswxa9QGdTQCv69kR1GGJy6kEgueUME",
      rt_address: "BvqJ4URn5NKob8yYTt8fbji4MhBYVwe7zsir4b2ZJ1si",
    },
    q42026: {
      pubkey: "GCBFWGifMGtnd7EZZuaw9txzJsypU2eakoCaUHf6sRX5",
      pt_address: "FjzKynSENkp5E1r82wknzww4TJSVemwuTxyG2qJLey9u",
      rt_address: "9hU5r1aUxKuM1ynutVuw1wGXpdDzWKFF2rWYUdNCSbhx",
    },
  },
  "exo-tech": {
    q12026: {
      pubkey: "CyTBvu5CkLujVgETLpYFjhXgkeRHPqTBbMkNFfxj6pJW",
      pt_address: "w9VNqfsT7WkSkZaPzp5ZkCytE97b9GBn7M6xfTe9xFQ",
      rt_address: "GhAZcqqqo37mAmXtLKAyW36shVUq2Q7uk8JSrEAhMCSn",
    },
    q22026: {
      pubkey: "FCScnhLhJh7My72cesYXHHqfTTNWcYzoExQdEkmmNqWm",
      pt_address: "6nVoqJxjns8bcqmRhbehcPgm7CQhqqj4FN6hzcbHqLg4",
      rt_address: "FQUfzqcEjd9rLNisGtEhZDUnWG4U22W3aTTCFAaREPJm",
    },
    q32026: {
      pubkey: "CNVGQD9jiTiTJWpiv4eqVueQUdJtXDLi7zR2hDRBxgMG",
      pt_address: "DTs3D8mmXP9oDhwogaC1vxCuMS2ybbp5VmmCuwXzvUEF",
      rt_address: "6mVUjZxfFAvR2HKac6ec48kGa5CrR3pcgGXytEP34poM",
    },
    q42026: {
      pubkey: "6cSM6CRxKjfaN57t2vPFEiBgUrzkeap7v3b4y7MSpwhm",
      pt_address: "G6PnSFdTVK8BJbXjiRFe4VPdS8oMbZnPhx9dGc8bj4q9",
      rt_address: "5wYuWfMzssTKRDvyDrmf58DhhUYwkg2FMz3u7tCao9L1",
    },
  },
  facilities: {
    q12026: {
      pubkey: "FC8kHUWkHTX61fCcxEodLTcxUkRHZj8iCYeDKjNYmf4j",
      pt_address: "ChpQBVBLqHnD47nfJ8eHaHhMLtbDFtS6ox3zfb2KjEyA",
      rt_address: "4za7wmUGgfq1qRXWATEHXMtiy9caEMHE2q3C1oKcLoVT",
    },
    q22026: {
      pubkey: "DEwogPMHoQPChT9FZc8deBSgq9e9bmCYPQWXLwbC5wAg",
      pt_address: "B6hS8heyy71p3Vi3DVBXy8LSJ8aVKuVoJ4JLcqb97ykp",
      rt_address: "58kSsBfBSvLY251J9GXpXGy6YDfkutneFHijRFTBCYm",
    },
    q32026: {
      pubkey: "7DriD865CcdsGFgkzuff3m6LW1QEW5xiJWeMvrEAbeqN",
      pt_address: "7PnA8LquJecq49RjJUSUiEWPwYgGxeHNGRP7efymDsn",
      rt_address: "7V9SZJDEpBYm8MAd5EKFDusGBSrdhKZTnVdNcYCiPeX",
    },
    q42026: {
      pubkey: "9U5FuamdXCZCq4A7no1dzx6Y5Ch6VRf2qmbpZZ1PXvLk",
      pt_address: "3W3QFwYAgGoVY8UZ2TQMK6mdfnqRaWxkkq2wP9qQX485",
      rt_address: "DvehVQwQEjJPKorzdcGRejw52SDGC41QwKxuu6FAxJkt",
    },
  },
  falconx: {
    q12026: {
      pubkey: "Bw1qnmKKEdY2hvbMbagwuKFSCdBhbM33HETzihhF87Mv",
      pt_address: "3tfybWkfkhnRDntCU53MnET7VJPRssFraMG6RNGpS7Nr",
      rt_address: "4kVfvD8L4R6Rab6QgPmb2jgrarJv4HautaLCsS2LiVam",
    },
    q22026: {
      pubkey: "6sg3HVa3hCWKxkkh51LhyM4GQdApTmoNXaghkrdnDD1k",
      pt_address: "8n5yXCK5nEV4jUeFf7sLCaZ253KzaSA9jUHWVvn81zGu",
      rt_address: "7FsMDrczSjucUqcQnaWYc6YdrdiBS7Saj96QEhB6fir6",
    },
    q32026: {
      pubkey: "GM6NUbjgsXEqLSWS5uijQv9gt67KU1rsP2HbMc5Ba7et",
      pt_address: "cjywXsaHk31Em8xCnyYXMZTmEK97op1TY9vQVA8naGn",
      rt_address: "BZgALoKWFmmSxrfozaUfcDnGRjgQT2HzcLD2y6ngv9Rh",
    },
    q42026: {
      pubkey: "DCkybJWkkQSZZJg86CPWE2zf4PvVrW5qqJkXMpAPB98k",
      pt_address: "GKkSH1XRdG4EBzyxkdoiujWmDyAjZvphb6JZCgcCwbu6",
      rt_address: "GWUuGwvggmtUVzNydGunyVQG53aGia55YyAQNUVgBzhn",
    },
  },
  figment: {
    q12026: {
      pubkey: "25qer2TaoaKHW3ChdENDASSf2CVXabvkBKz5BCebV4oL",
      pt_address: "3euQQ8MecQJN6PDY4NCbqYLByNYhqcNb28K9M6GCRd1Y",
      rt_address: "BqWq2vEqXPioNNRhd1m66Py9P3JYNRFWUoG6HTZUgaA5",
    },
    q22026: {
      pubkey: "FY6Lv3x5WpTertEHSM3i62Vg5Dkx3e7P9MWEyDKpGfi2",
      pt_address: "Ht2K5CqmVutxA4Q7cdNfqV7dFJmyngTeySXM6inz8H6w",
      rt_address: "EjiQ1aCkzh3Y3VrJhbjh9SrcRzK9YCwJTS1orT8BUbJt",
    },
    q32026: {
      pubkey: "3DBC5wtCBjnkKm81ENLpdwFUd7QNVk34VFdMX72hvQPP",
      pt_address: "6wtRJHHZiYbENr6N8MvZnZd9tfk4FvXNzuLUMYnafMDt",
      rt_address: "AEzgw71QsC3CKvEj7XLE61kmft2SpYwT5NfXdd2gN9dV",
    },
    q42026: {
      pubkey: "8Fgxev5GwYY8fG4RkVZkZJa91ohjQnLt6HyqL896okLy",
      pt_address: "BPawHp6rw14rkDws7i2BzYPkrZhiNogXQ9zDyj8H6jNx",
      rt_address: "2HDBy9oGbTXTF9QhcaDKe4oQEM1S2RV2D4iYE4jiTHNy",
    },
  },
  stakefish: {
    q12026: {
      pubkey: "FDw33kDJtqRkQ5TXHjVvB4SW8tsBtMsZ7QuC5nTE2Gog",
      pt_address: "8MaqH2L5UZfqkByuUmRbPFaPsohdfppaBz8txZCUpbWT",
      rt_address: "BcoRr7zMNsD4pFNef9pN43aaei8PhbnxzomWHnBnAMeB",
    },
    q22026: {
      pubkey: "4nn6dtfjNrqZvWnvRh77bd7fiFKzuzDq3KHAbPyBoyRK",
      pt_address: "95J31GNPLZJXbUyWrXCztQukk6DptPtcm38bUkhS63Xf",
      rt_address: "DEqtoqPy5Xy4JoX3XGf8GumQKYffskkRMR2RfmUfCKcR",
    },
    q32026: {
      pubkey: "GZcYzaEgogZFZa2vJtyYAY1U3YPXfRp2RzfUGJc599Na",
      pt_address: "7UWbdgRyKabU28NMq4zs1Su1DuqAAMnmDrptdpxiJBgi",
      rt_address: "7k91TC91Aw1bPCPK1R6fsxRfDAEc8z22Zh89MySCqmDW",
    },
    q42026: {
      pubkey: "7id9jo6tugJgoCB9DvVgXkVLSWjiXobygApCYnrtPiQg",
      pt_address: "ABmeMjXQA6ZZCs82YHwFgz6e2AVdPQ8SeHnrEKMEGv2X",
      rt_address: "7fGMWmW9xMokZ1LNT7vjzF8NZVZjmysj8NW1HDtg6AD4",
    },
  },
  solflare: {
    q12026: {
      pubkey: "BtUiSmqn51jeEdrUKDu77juQYjAERpAj5ZDKBUX5vHjD",
      pt_address: "6sMCuFmQDnZz4zrkqZ5oKcWpi5Gz9TWh3f64EDVD1CuB",
      rt_address: "9sCqpLxKG82HzVoaaJhxpqHV4rb2JZG5EGjy1yVs2vcp",
    },
    q22026: {
      pubkey: "EgtbnmmkEQyNtacML8kn7hSKMDD7R12hKMS6etRtHuYW",
      pt_address: "1DJStxhYbnsMxXCnNG1uaWXjY2QYUTZuTxKhM1335R5",
      rt_address: "GXjMyciaDehda4JekhFmUtT6WZpZohYWY7823Vv5Ec77",
    },
    q32026: {
      pubkey: "Asa1HUbvrJroktxB8Kn458eC9FJq2ECxTKHGmGpXBGHd",
      pt_address: "Gb7w9LXNxdg8yd9oZBjJAvKFDFSeTq3nf7ExCwj3WuXP",
      rt_address: "CpSvPx9WQjpSTXNxef6MoaByJq8DDhRW2Lw8p3LHDvML",
    },
    q42026: {
      pubkey: "CwFpfFhLXb25YtUTAcdgL1orQQ2cVV52Rip3rYuuqN1E",
      pt_address: "tno1jbK5LfNtiXsW8EsjrsEh1G2nhhTN8BNE3EbdiqT",
      rt_address: "Bnkow3geXVgmLYXeJoA9mDCSoB28iNY8C3BzDgXsVUNK",
    },
  },
  chainflow: {
    q12026: {
      pubkey: "8WAwAhSXRjMDfaC8FbUm7knDwZqh4mKEn89bUZZGpD4A",
      pt_address: "FKvpNcG74LGSnv8o7a9JEjNhQarY3aNsaQtdxDTnpo1g",
      rt_address: "2PFHu32VQaCK6JrsugiZA11vQq7WCSgbjpMNQA7pdqe7",
    },
    q22026: {
      pubkey: "sHrLUTnLGyBdD6hMLzEwbHUWTfc9Dz6VSZKPCGfXyPT",
      pt_address: "3rxGuyFjx4cT6MZtdYBRQ2cDT99bTTsMYjirAm77znhA",
      rt_address: "46LuT46oXwp3RQgjxNG7jR2MJUz4VUEkZb5DqDFVnEEB",
    },
    q32026: {
      pubkey: "2aVfysx49uxLYY33kUqDBDbN6icwTqDc2btBw7JmqQNN",
      pt_address: "8jqofmS9XKzkddTRxCWUEwKtMvBjxe5hosxGMwUaGzPp",
      rt_address: "3LfPKN1jZYDV9pYDK4jnBXJF8GK6LyaGQMeTPSGKRMvD",
    },
    q42026: {
      pubkey: "BjKSnQwDh22jQ1UeMS832MkHcss17c5Aw1rz7SE7ocEh",
      pt_address: "EoezBgaUerFBmkNVQ7MQnJSECEqvTadzHipnSBnhj9Yf",
      rt_address: "G1wzWQyE8iTLDrB74xJFtyXWmpyaTGZ43q6gWkztpzJN",
    },
  },
  "forward-industries": {
    q12026: {
      pubkey: "HbFDqsr8MLe6pQsGTXkDH9dPFqvaEyGpNNE2GVrmQzSc",
      pt_address: "HCXpdzeKjeBbHD2t4CSxXN328U3B8SqdW5DYH2iw8o1j",
      rt_address: "2ykJKSCpRHEjQP3M2zdwioMWJ91PCRi2KG5md5g9xSno",
    },
    q22026: {
      pubkey: "4v2DDFBeFtyqr6YiSAg9Yp5FrGVuHd2YBCsMUj9RDD83",
      pt_address: "BZCC8Wtho367ZoDhaj2rt6zn9HwUDQoLvoTSkhBPALax",
      rt_address: "5tRespeN3Q6FeQ9CZ4KtWS568AwZg1F5KepH8TaSGt6p",
    },
    q32026: {
      pubkey: "BFZfb5nS4dgo2ooMNUsSWCXZYUa3Bp6c6GzQjeuwzJnb",
      pt_address: "92thdYpRm24ftkLp6Sn4oWGaixWMH3jgHekKfJxkxotp",
      rt_address: "8NGqLbe82jY7m4qHYsKXxwFY629y69M7uvsBoX9B7GX8",
    },
    q42026: {
      pubkey: "BBtC8Nq3HmUwSbHDhtPxyKy4xfKvbwYjtD7PEc984QeG",
      pt_address: "ALDP1FjYfh2XXX3hhtYaHBTzpdyq5ch8XLbyUAVKcevV",
      rt_address: "8hnvKn4BbxAWVoEkSt8U3gN9hNiaVNJcCbaBugdEM5p8",
    },
  },
  galaxy: {
    q12026: {
      pubkey: "D2GU4gY2wtm85iUjcYvm9CaX1ys7Y35HvJQdz17FFAHj",
      pt_address: "GctVsXR8snwEwZF4mZCo7pixZqaqQJQPbQThznFK9u63",
      rt_address: "Gs4Ph3RDCWiCT5ZVmLGWLiBQro7HHcp1dfUYf5qWLgtC",
    },
    q22026: {
      pubkey: "9vwjAqDkoyCqyQ8EFBtnMEA6yDTYKDbCu8HzYAnb6617",
      pt_address: "BrQoKRRY48xwJAKSNHLmuSqmdH67g7cp2J8KjSL6GpDh",
      rt_address: "4zu25Yu77p3AX3W2rAyww9cCbSZ69GraywHCPTAV2jnw",
    },
    q32026: {
      pubkey: "41XWqAP4ctWDj3BVPasVshv1oE7H2XPK3PoNYFVPkEAv",
      pt_address: "CSASXWttsfeJtykyjMt5sBZ2WF3dHNWFj6qcsZVgzT5T",
      rt_address: "EHSbzLJj85FYuR2zJwCZmoHLj2VAb8Ta2t131QdTz4nx",
    },
    q42026: {
      pubkey: "8ujEkRq1HHXVZa7bJTkk1rp7JYR4FpmCjAFeRUTiYMF",
      pt_address: "HmxB56N7qdcT6Y8RmuwxbovYJgyB5wjrKdGXmfV6NXTm",
      rt_address: "73UmSc7PWT2FoVCZvWZc8wNKnLqPWAyRttbHoyg4GT4w",
    },
  },
  valigator: {
    q12026: {
      pubkey: "3xXvcPhdyedepE8d7BKBgYqUcGZNCWnbMui2WEiw2G4L",
      pt_address: "ALn6TwBu72UU5hrToMVV74LYCex2mmCy4uHJZhkwYNnr",
      rt_address: "HWxKMroWwFwfERtShFR99uRakibbUvmSEUushFU4yzTR",
    },
    q22026: {
      pubkey: "7TfSjdTBkEQVwbRshvwqxYDvH7r1qWNmAxyEN9pd5rLQ",
      pt_address: "BBJg1YWNy1xSgRnHSk16uGPM666WHtK9xgzAY1WKxFkM",
      rt_address: "EsMc3JfGMVUJ3K1aiJH16cJnvaYCj3aMX1kACv1WZzXh",
    },
    q32026: {
      pubkey: "GpWE8XBKRrs96NZrqJwSsm3an3suBcfpSFnMjtXNoWT2",
      pt_address: "5kYRGWVsnyqAK7BS4KY41fdXwgoeFDqHXyRMypDYzGRa",
      rt_address: "J3usWUtzQ4y8TSGph4khUX7gEMNV2tyudn1oCSxPk4Tj",
    },
    q42026: {
      pubkey: "CKWk5KZfxDPhpDKd4ZDswb8sA1hbFpQSpWquH6KgQ1j2",
      pt_address: "E6szjTUuKE89RfYD3VUSKkpfFEGULzJ3piWCdymHnoj4",
      rt_address: "935CiAhoGE8Mo7KpX58emJSMWFLxTbrpLVPK7n6QVJhK",
    },
  },
  gripto: {
    q12026: {
      pubkey: "5dt8edywbyfRcemF8btE2sd6dQZew5SA2YHpWsbotRyT",
      pt_address: "Ah4oLNmwRrfcpt6QYtoDm2WyQNbDETYWnruEKUKGyKkT",
      rt_address: "2jHpKxSYgBrQKpqg9GGbMappWvreGPs2LCk6Rn77Vo9n",
    },
    q22026: {
      pubkey: "EUPJ8LLpyUrnHVszamE92hNVafQBV6hmDCMie5QMXdVt",
      pt_address: "BwZjsgecxewDEFL2Yxauc5SDLRjEBh3ixHBbjRHAVArx",
      rt_address: "FDrvNvZx37QGA6sL2esKDzXia1v9pQobxBJ2m4EvcYnd",
    },
    q32026: {
      pubkey: "AM19iBKLqStcZppPdLYZYto5gVXM7CjkB757SKdtUoEJ",
      pt_address: "GXacDwxcc65xMUQsUgmZzbLgs4XjMxmz3Yokmg6GfCF6",
      rt_address: "FxQWVg2az1bRDaPCYFEUPh3LVqnM3cc3M7ttKjmeuAy6",
    },
    q42026: {
      pubkey: "DCo9zqG5MjuWiRYyHmnmjhqwt9vbHz8EuY3iqoGYznKs",
      pt_address: "GGgHqw43Pk1z1gTCoPAwgA9xGfGfvVAbVAMYNs3eYWpj",
      rt_address: "6iTGMgF6vPXKVAi7vUDUCi8NTb2o9MXJZi4yzR8Wdy9z",
    },
  },
  "h2o-nodes": {
    q12026: {
      pubkey: "Db9bnNcKm43DnBMFXDYaueBvDSXcFMPEWGUKHYzHNsZD",
      pt_address: "2B4BmjPWw7KnR2EWtduxCvrAtG7MKaqz5BfF8GrP8Tek",
      rt_address: "2JPJ749RFBYP2L4SvUkJSu6v4C2fRsnnvMqishQUgJEa",
    },
    q22026: {
      pubkey: "1r1itBi46FhHrqM3tn8WZAQfUETtq7Cw9NxfftkzegH",
      pt_address: "EuizdBd81VnjiS38qnMVJeefoM6hZpu1L2AggtUmm5fi",
      rt_address: "pcS3RmMxDWZR8gE8GEKZrPmvQjkQQfdSsiwDJToEgKT",
    },
    q32026: {
      pubkey: "G5qjFSp9Bfscn1yoYrs29vsM8o12canRw1Jutsqv8iRG",
      pt_address: "LmKXwMAUPdPcaZjV9po2DGi2EKER4qh4fbLGexLWPzn",
      rt_address: "2qdoDk1eeVbArTd6k51m2rc79vLeQa2Lc9RhXV7jrbx4",
    },
    q42026: {
      pubkey: "8xcPt32Ln9Mq4eJDwasVfcfRaoGwHqbLjYXbcx89eMzS",
      pt_address: "6J2HsuqKxSMvrfHNwtN8qFFKHQBG7tQPUCxdK464w4ie",
      rt_address: "Bj1Fz67p9FHavUjV3EEuFeRYjjgKby8x2HLRhDgZxqCU",
    },
  },
  helius: {
    q12026: {
      pubkey: "UqCX9u1tcGedcenHVyh2AAK98B2MrYT8a28qNcCqRLo",
      pt_address: "3X1MsYzvYchr3oXZHJmNsRByouteSkHxpCcFmxLyGTrq",
      rt_address: "9V46xNRChEYseHF2uUhMuMD925WX7Ccc9qyjnacgVNWJ",
    },
    q22026: {
      pubkey: "CBoM7AaEGTTSLrUGjgnaj8KgeMyaX76AmRt33iz8PDsp",
      pt_address: "8M7PnbbAj59DZHACHZpfAmF78YsEsZyrrPuBhM4P8xwJ",
      rt_address: "Gfou83rrKxkVALBKdZUPYzqkhCsFBgTCPAmxiEe5navT",
    },
    q32026: {
      pubkey: "GE8cbZcBJqc2ftBXgfkyyaFZcDqZibHNFpsd1rPoR5zp",
      pt_address: "EyuispXoWQPXS7N8ieLwFCPQhZPsufQQTdeHBao36aL7",
      rt_address: "DDRBbX62PMf6qbCUfufDoudLfpXeN8XkWzUgU3hxuNsz",
    },
    q42026: {
      pubkey: "EpxJt1e5DcKrC4vA82d5HXEhCanz8yJA6e3Zv3GPdzp8",
      pt_address: "Fq148RgF4Er3bRB8LakVfLUFrFsr7aRAe4Hdeke8JR2v",
      rt_address: "UK2sFwdMMXv6mBbnFZFs6Q2frKbUQTaHAHM7AmriFmn",
    },
  },
  hubra: {
    q12026: {
      pubkey: "9o2MhRjtFPM4kMfR39Eq3s6EzHBWfewvbJTTNqS3iBSw",
      pt_address: "4hMYqHzjUWLfts6DYm4QuiPxMytrYUhDEAC33Wwt1tw2",
      rt_address: "tqmoMn2y1nfSpgP8nRU5gMYpyvkiC67javr8aceJhDz",
    },
    q22026: {
      pubkey: "ADtDK1hzwMpMjVvujmn8ngCRW6LDRRA47XnXYqwo5cYx",
      pt_address: "Gd1NNMzJqa1dpqgCN7UPviPhH24fwx9iD9JsnJtd2TSc",
      rt_address: "D9jbfmq4t8sE3McVfxAT67preCYtb1UtuxRiCw5ZTSv7",
    },
    q32026: {
      pubkey: "BjXsEqvv5Csw4Gev5XMQ8kVzwLj5CGYs9frJ3i8geoKV",
      pt_address: "TyZU3iZ7gxSmuVqt6Ab3diLLkJcNBYXd44tiUxD8YgQ",
      rt_address: "DpHYCdbySrYgaTs9D27f1ZvT9XudJDfZwBtyQxeYuS9F",
    },
    q42026: {
      pubkey: "32mNZcR2ssDFYAbjXup23GfHGjz8RBdEkDPT7FQ4PB9o",
      pt_address: "6wDvsfsZa17B7bXXsq2TMgHixoD7GDEXcmstLi3A3Dgn",
      rt_address: "561wJ5YnmaDK68op7skw47ob3Kbe9DA6VXo1ekRHjxZ5",
    },
  },
  hylo: {
    q12026: {
      pubkey: "2XRNfai2vgce2RB7Dkw5bK552Y8ZdWuF72kxZxcyLJQR",
      pt_address: "Enr4YMRddUneK5fhfiR1HjV2uUaPARKCVp4ooT698Gh",
      rt_address: "DhEDQhdNd7rfKhs8pDazgWPNUTSkCYCZUZE4Nz5qjR7i",
    },
    q22026: {
      pubkey: "6NAmn1NXrCo2zyUTBX75amV4mZ29uACzDgqBG1WzSs6z",
      pt_address: "FS3AEgwcMom95evGUz6HPo7DRa2yrQc8SavS1vbARdJc",
      rt_address: "Wd8cKG1SdNNcUaD3dEJADDLHfK7ZMwoVm8FqaCt2z1C",
    },
    q32026: {
      pubkey: "7c7A43mWJVMEAMEGCz1PkVDdHbJYz6haUkDHKwCnnFQq",
      pt_address: "2761Y465LxMpzgHzYgQFDmJQeT2Nv2wgdcTrRXxfH6uz",
      rt_address: "EaDna31yUtrYuomRmJHeATqg8wWaUX9TxJBGbAPPvSKM",
    },
    q42026: {
      pubkey: "9SZaPEWdtezZiwbCCQHw1KHMD5F7USYgTGCc6y9ZGxfJ",
      pt_address: "HGZQKziv3bnXezwmHeUdQR4xzqNejyA4234HU9ZGoDpc",
      rt_address: "EZJAo2BF7xXfPEDQWecWPPcCh9XnwbuhSrxApps2MDqb",
    },
  },
  jupiter: {
    q12026: {
      pubkey: "DPtL5sJDcP3e6TKaUsjPbCqXH7BFc8XZ1sf9VAvVA734",
      pt_address: "DwuNzFwU4yBepM5uRwC6rdLAmbG6Qe6fzAmkfcrMpkp4",
      rt_address: "GAbM1qHfpj8B7wWNw3ktAuVL74CoWEnKU6DFWzfiDDpr",
    },
    q22026: {
      pubkey: "Hrhns8Ec5v6PDgbS311Kojim7n3KWwVxPKPucwocYNuF",
      pt_address: "Cfj9aGHWM9zhDALa4C1Un6LiVNqXnfiGaG8AmqR2RGQ3",
      rt_address: "D8zKeVVa8q2q8z6ahxAbFQz82aK53yUgJ1nnaspwkN4C",
    },
    q32026: {
      pubkey: "BgnyobeHTkzFiottxUiTq1bH4qBq9GuEnAv9p9mSCFZX",
      pt_address: "BCgWNkqaVmikfoUTemnk8oWE6dAKS6wcwZJV2Hf6juh9",
      rt_address: "5NASsLokFkNQ5fjvpGmCJNHwrDRJWKfjZ9xnSz49eds",
    },
    q42026: {
      pubkey: "DqqHjNLb7iDvfsnZEcUBE92AoUiyJWqWLcHtSAF2NwW4",
      pt_address: "7uDbnULfr8sG8gbLPh6Vg7WrwpfCMbNjsvAXdjcTBY3R",
      rt_address: "9gq5tSd2F2ZMJoyTuS1UDFR8CXW7FyjF16996dQ1y29Z",
    },
  },
  "kairos-research": {
    q12026: {
      pubkey: "21XHobfZftF6LMJmQnPJnQppp5cTCP7dpb7TGW7uCbQW",
      pt_address: "jYdDurGDEtUw7rijRgKikB4dVNkxRuh9CAY8eZsNXoE",
      rt_address: "7kDkfrvxWFACWa8cFZaYwwmjqijWvijh73uEoDWvaGzK",
    },
    q22026: {
      pubkey: "GnPYARayDNbqatwn4NyJU8myqwdcertz7z5JYD2Z84Af",
      pt_address: "9L1Jszj3AfXTSxWWMvyrJZzHnB92122DmqEzCpAbQc6j",
      rt_address: "7qYt4HiqLt6rRqQiayKkeS9HBFSjmhdGrRfT9SCKudJb",
    },
    q32026: {
      pubkey: "8n6nLQLq6j6Uo5G3W71zXNz2nYMSjEQeMmMESx2w18mh",
      pt_address: "DXsT4yAJ1tNhNih3BCAYDJNHPH5tJLcDhWBwHUxkPkFK",
      rt_address: "65EfvBLDovPdF7yHQw1BaEA9fMMktbTVv3vPAUm83Xm4",
    },
    q42026: {
      pubkey: "GjfGcqNuGSqrksXm4bqi9i7wTAFxwmtBre6SNoS475hJ",
      pt_address: "DLAidetrarswftwMkQvUff9e7DMuQxsaUb9k9JzgNcXf",
      rt_address: "6kAxcPwYTb8GqRJwqBZXPB92FZ4NSMNRqJTVpJJHJ6o4",
    },
  },
  kiln: {
    q12026: {
      pubkey: "9Ez8wHNRvxeSDztR7kFChxJhkDxgtbhipMuohjr2vSJx",
      pt_address: "ENZhSVE5jzGNm5jYKwyyCj59pSsfAWV4RQFnsFZu6e3k",
      rt_address: "B7z4anxnDvNGfQ4TeHofUSDTDYy7JPyfQwfJPuPkGjJw",
    },
    q22026: {
      pubkey: "Fbd2n47V2QP8iFpyKZVgbeH2DkMBdJZt9UBCKEyKQSyy",
      pt_address: "CwyJAJCWnmZXP2ntZHUBndhcoLyWJpLfMwFSauFevuz8",
      rt_address: "GVuVASAoGoKgWD6xWoEFS2QwCcd6MG5EXXJ4aPJkABvf",
    },
    q32026: {
      pubkey: "8ecgtkNeDPD5v4U4N19p9KJBMBVYCivFmGu76w6GczUi",
      pt_address: "9gCoEbdU9MW67MbTHESoX3n3kaJMaFcbyezKNcDxY5w4",
      rt_address: "7APibp2kDAhbEMr158zZakrNMZefHm4H2dt6U9DicJNy",
    },
    q42026: {
      pubkey: "9BCUwHoFPdbvJReZa2HoVKRGby8L5vxB6JbBiYacDNQi",
      pt_address: "8PFWzpsqXahdemvK1kXPqQ3S365S57JdScdiwxx1N4FP",
      rt_address: "EswvyfG6zW2qPMUnX2JG5RRrR71FfXLd12AV8RTKiTK3",
    },
  },
  lantern: {
    q12026: {
      pubkey: "D56zYUx9SM49akp3dCJJurk3ARVSTvQmxPhA1jmxCpP1",
      pt_address: "6YCMnVRdBP8ytLf2jpDeGyXeRRPmqUQ5cmEkfC3QMgnk",
      rt_address: "2kqEAmRwTwLWr3RZM6Bx7Phf3nYQpvrwzf4hdUEuBSeB",
    },
    q22026: {
      pubkey: "B6cm6eSzCzFq2wLmtqq6zdFNPW99Eoafw4BoskRM25sM",
      pt_address: "4TdiNkhNJpMXTsmVq7x1HNacSj3NvpznfVjyUbKjnp19",
      rt_address: "AZoRdnaBGpeAL22v4hDWrNixpjnMqiR3pvswmiCgvEbB",
    },
    q32026: {
      pubkey: "7cbbuKq2DQ6d1no1Nc3U89nzTzsqNfjGkDby8wcc9Nz7",
      pt_address: "7VYVzncztzn1VNxvnLBPSPFYUY7XLZXXUXLksaihk3hg",
      rt_address: "2nk37MuvMaCmQojDKQsbhuhy1McDLfEfGRbUSG2n5shP",
    },
    q42026: {
      pubkey: "FP8NBzmWS6fneQRRUgBPgFwTeV3rMWF3qxvRZHYyGVzz",
      pt_address: "4ekWjpj2FRHzbN8VdP3i7JAyzgYBudTvMkekGw6zzhje",
      rt_address: "DyLa9WnoZmzCYKPwQAkxjpaUMDZZEqtyunMeDtfgZ6fw",
    },
  },
  luganodes: {
    q12026: {
      pubkey: "6khq3EmW5kBRSd6n4jaP3FFsHdazKFjF36kJcWQ18DmN",
      pt_address: "Dby3Ef9uzb7UsotGT5f4TsR3DfXhjoDHtQDi8MtUezZH",
      rt_address: "9c6bKpnjdNZN85GcdXQjiHkYpR1yF2FtgQA5bHh7RJX1",
    },
    q22026: {
      pubkey: "GUS3RkVX9LbujMRKBZkG5TMtn33Rrgqeub4kxH9tNzBC",
      pt_address: "EjzcXu37eUxGDyGJU4LNifMwa2AQ45AjTQYQtFyi8QzC",
      rt_address: "BtubcFcLZ6oENugP72H6T2QLZg2TfaBt3NhpZKDYSpHo",
    },
    q32026: {
      pubkey: "3vXycT3LYARa4NQPdsVdTLHH6aiJSANTG2eHm24kW9iW",
      pt_address: "1412HdNjogm8VUbVjPPmsKyYMjCjCghovRZpSqz3K8W6",
      rt_address: "AeJLywwHmXz8oYgNJMgAeWpiajtz9sWXkMZhgSSfKuLn",
    },
    q42026: {
      pubkey: "J8wafWnnTJPSR5JQ6mXhVX2YwTAgAvfwz7brKq62QegE",
      pt_address: "88Qn7hz6vWtZQ7T8M7rWoTQzzkkGPdKaUteooJygUxG",
      rt_address: "49VtaA7LCTjfYgaAELU7QbPhx9XKdgbrDECAsWHvtCPM",
    },
  },
  "lumos-maxima": {
    q12026: {
      pubkey: "BrDyH1tAqzRVQ2PvV8pyJ9BtweXNic6CUkADdSoTo1d",
      pt_address: "2g6d7beVNQXx8mJ7EA76bTTsCsKedUXCYkYAriZa6iet",
      rt_address: "BrdocPVacgmRTQLWBWs7DCti3bd2pFvhkT3tLvqLTSUX",
    },
    q22026: {
      pubkey: "Ccz4dPofKspJjh4WCkFYqASF1jCpdVXiV7CfhHD4VohC",
      pt_address: "GFu7NY68u2cTQspfPaGyKvLQaXUifU8ooPCu4q12FXRp",
      rt_address: "GNTHvEdPbDjMFCfB21cXMr6PJ5GPPAfBdnVb33ptjdyZ",
    },
    q32026: {
      pubkey: "Hm29stvJXwW7fUyhPsa2cebad4MPHnwF8hLJoCJit874",
      pt_address: "HDYBiuhq8Czm44or76grG9Rmgw1tDGwZRNXhg8RTzgyW",
      rt_address: "EapicD7c6v3neDYCjXnNn1Cn41s6A7PrWq9fa9cwFKTr",
    },
    q42026: {
      pubkey: "r7BzFLveBCkyRctxZYrpRc76kfdKUrXbWr7HzES9u3t",
      pt_address: "HGnDBdouSawuzTueLokWbbFfA5v4ELpMaHxrmoWVRYtz",
      rt_address: "9yL6UjE2uqo1DwhG1iW91DaSoRW8Cbx6BhTsFvyWhc4y",
    },
  },
  monkedao: {
    q12026: {
      pubkey: "9JrSRm9v3aWdrttodkArrczhMhfbSRpvsoKmPMiqrrfV",
      pt_address: "8AcczBEat8Uz9an6ExpEKkPBuEE1phWQMXA6ufGhCjET",
      rt_address: "3FEgZvU8vUY17DVvp931vQSTWucTukskdGiponhn3pFc",
    },
    q22026: {
      pubkey: "6Q6swaS3DYunx855tbHS3pdtV3PVostJcCfgftvKeM5v",
      pt_address: "J6Ro4KMJew1WpovMxKAkZoH8HNFyBLNau27YRh8AZj4t",
      rt_address: "GpobDw2Jk5zh3RSMHN5fiMvCYujMLGnbjK3hwcmxcFou",
    },
    q32026: {
      pubkey: "5HDU3go3hYNEHqLCuUxJn9Ny3bBvgf7Fg5Avhki2YFyp",
      pt_address: "EjHLLaVXi9ZojRA5xaFUMmFFSKm52LW5L2VvJCtSdeo4",
      rt_address: "G7jmEgX17hyEbtaZvF8H2oa4jCu6UsF2iGycxu1qrS88",
    },
    q42026: {
      pubkey: "BUf99qV9NxvJ2iJxxBY71TS1vLuK5WfKWUNEonQWcT3a",
      pt_address: "9QhuB5k9hv4zywMnyuWHMfzTshQYsh89CJhpHdakxCA9",
      rt_address: "B3CeN9CyfuVUKYkM4nfWbtZ27HMw6wtm64w2j6keoFJK",
    },
  },
  nansen: {
    q12026: {
      pubkey: "5Ry3LsFXhd6gZ5k83DGRJPx4ZmNkAGmrJPPgkgc2u1Rm",
      pt_address: "78yowBLHQi2mQa5n6xpz6N6VgoHTCQFpqd74bdz6d1p8",
      rt_address: "BWHMfetyXfDR3jFLx2GKnvTgCPtic4jyDXQ5a7yFAYLM",
    },
    q22026: {
      pubkey: "4Gi53Fr4FdGyRyD6fmzFTPjGCB73uwsZRQj5fzRPyHN6",
      pt_address: "8aPSEPMJqPZ76Q2f1XrMqh68QcynnQXuo7BfsTkkhyAn",
      rt_address: "BYyHt3kXKm4HNTXrYYZPtxB3obuhqkX7kqampjmgApAn",
    },
    q32026: {
      pubkey: "8oyNfTrBYZUHjTqbiWUiAHnHH8W7F9PFvEnVyRAc5X9x",
      pt_address: "BcxRfM2UPaCQnvBBDeJSWnVAYFz5S2VvniZMioxfMCT7",
      rt_address: "U8KMvMz5qphpLNLCTkFcj8eAw8WC55E4be5QWk6buLG",
    },
    q42026: {
      pubkey: "DKbP2vhreiZkgjEHD3XgKbB49pRMVZXp7ALzVHdR6DRp",
      pt_address: "Bxh5RgeRaQKcLXCVYroRzncQ2qK2aGVdKtPEJi6bUZno",
      rt_address: "6DgCCmL5m4E1dqXWTuGnZ6KDfWGWBt53rzpeAr9uLwWG",
    },
  },
  "okx-earn": {
    q12026: {
      pubkey: "DmNWgqUqv2oQ9sFt33CcJH9dLuvGSLrZWNmTYAcH88Ad",
      pt_address: "83hDN7hMQNT24BPWedcVTjje3sQ1cYN1rHnVt9y7jXbz",
      rt_address: "HQvHfMakUPkG72gMCmRFJ7itwnSemCvJAW7dEL2KXARX",
    },
    q22026: {
      pubkey: "4nE14WqLDMDCc3Ld8GmWHYVm44Tus8vv8zK4aUpYjtbz",
      pt_address: "8tAVieDX3gGmqtv9Wa2hJEcv8S8gC7oVquVT6AGmq9sM",
      rt_address: "73Esp2XxhMaFMGcuDNwZYcuZdDWz4R8J5MvT8SJ9HSqv",
    },
    q32026: {
      pubkey: "57CTuVr5R5DZHmcn3gN1kbQ2KtDQFyqi59upiD4G3va8",
      pt_address: "8eboREQ3i9TwGYrEDYLHPMCDkKShHGzwWzkvfuG95JdS",
      rt_address: "3CW4cPhQ56oTeQn3g5TUVmgjy94xjAYNtjV5wdZjeU3K",
    },
    q42026: {
      pubkey: "HpbecUNBRo1wy7NWDyfcbNnWqfzK7X2ihf4mPshd9o2Y",
      pt_address: "8kCBrLfQsSgqiKgAN7SeXGqFY7UCmkhy7fKJBAmhAyuZ",
      rt_address: "7sKdy1q5VkNFar9CmJaNzzSr3U851e39rZF1TosqpLBf",
    },
  },
  p2p: {
    q12026: {
      pubkey: "2Ufjzez7pDLJE7JPo82igEkG3FuiJkQ6xqN4ELmieAEz",
      pt_address: "5H1Ravb2hjxZ2KkDq6AXujXe71CG44SPZjsVgwCDfs7S",
      rt_address: "BU82BzAZ5qvKhWaBZ7SLgLWcGa2FXng1TxCmZpRQnSLB",
    },
    q22026: {
      pubkey: "C9VebtBGEeSXtomxt7LApqPFg36nr9ZdyeTmJbjzMJFS",
      pt_address: "Bzeg3kwyB7VgETTKTM1dYHr4HY6nSsiMHdBvdEQcADNo",
      rt_address: "Gvi8YmbScymZrZCH8wUVVX5kvxSniBTckjaa6AyYBpX3",
    },
    q32026: {
      pubkey: "CFkEq1Bzx55pxDuQgNqm87HXyyxtckmoSEbPiiEsF8Zp",
      pt_address: "8xLPDGhHis2MfTBu7bX7sfjdZhcHezJeLajYMLxvVHhD",
      rt_address: "AqdFvrZYbi1tpHcoefryTYM9YMs2rH2gXkUwLXojgZmd",
    },
    q42026: {
      pubkey: "7TjswMrEQKyMzWsTN42bfkV56BmUbXxFzdgovv8vvNy2",
      pt_address: "B3EEwQbrA6QBAtdB5fejbYjFmrQi6C2MbvYT4CwYa8Rw",
      rt_address: "4MXVDSCAvzWu3tTp1kXtdN7sLDu5tEMZjnNsvf1GKdR5",
    },
  },
  "phase-labs": {
    q12026: {
      pubkey: "9FCUdoZ7ypge9uPjfeYTfguXBWt6Bfmyry6UVGhSg9rU",
      pt_address: "61BtU6Dh9YftWiPhd2a2Hax4HhCEsGFwPMeKx5d9qQGc",
      rt_address: "95xVbDcccQsUS9ZZkTGEefswddFretwXzYaqtFFBJqFW",
    },
    q22026: {
      pubkey: "5a1BuMwce4o2w4JNHE9NBLsMzZZVEiFv4T9L2XqxF953",
      pt_address: "EYA4ddEs7oixDcGxqNcSiN6NjMtrciFWNz7UyhsMDKAT",
      rt_address: "6AbgYc6p1vHJbkpJHAjf1nk4CQnZPHeKAGHuGQsBCBvz",
    },
    q32026: {
      pubkey: "FPKRQNC5Dzo9Pv46GRcKFv2dWKAG8UWQZERHNKDxhC28",
      pt_address: "C6DeajXqve8d5oR7SEYtDpYp98uAZvxeMd6AczDGyJdc",
      rt_address: "DE8eC7xh9PQPqwRKS1tk5cHvsjKYpCkPokbS4iBJf4Ld",
    },
    q42026: {
      pubkey: "4PjmrRVakr8ZtqjdQEZMWPTAP62KMk8KkYL2Pi4gFfKg",
      pt_address: "5zUAbqh5xEppD5ppaoj9QnQU3E5iUPfuGEkMyf2z6TDP",
      rt_address: "8VyFVKo9ywUMejfwNnHcfbJ36JZ5jxCo7FHD49wwJ1S5",
    },
  },
  "pier-two": {
    q12026: {
      pubkey: "By9DRKM3KhZNtTEZkCWCxTSecpNCawSFu6tVhDRujHU3",
      pt_address: "BaJMiWvCKKDuCb79cSY5s71DHwQ6K4yEJaPmbKWh2qu1",
      rt_address: "GRLXXvU1MuL3a4j4LKCvQMiV3vzn55yiGxArGycZb9W",
    },
    q22026: {
      pubkey: "3MSdPHQg5i5QZJnZV7UY75dMDxu5nmQhfAx667qTEhnn",
      pt_address: "GwqCnnh6JhQh4n1TYSXcuUCAcMxXf4RmPQj1aArEL5rG",
      rt_address: "6yASHXVukHGTiK834XBpw9Mz6fPM8gzgcsoqxMJiS4XD",
    },
    q32026: {
      pubkey: "5Yfgr4j2gphVFEeXBu8RCqUQuH1NqFg4XeT8JV7UivQi",
      pt_address: "6H7wf8mryDHFSoZmvBK4uJcGfLLZMM9xZTHob4ganR24",
      rt_address: "7yxPmTr7yPUz1Ysj21pCmNnJJhbHWsekXU4BAyMXeTuU",
    },
    q42026: {
      pubkey: "CbmPKNwGawizDHovwzC9HBnmz9qD3jVeij2L3iZrNN6T",
      pt_address: "5PhgwLezLEgv35hHesMTAQT8TE3hHXr2e74YmE5KM3yg",
      rt_address: "9rRspT8RkvGxe9sKMDU9jmLzvRPinQu7Far8h9SekxDT",
    },
  },
  prostaking: {
    q12026: {
      pubkey: "Et5HKnBKgb5QWdSnDJyEQRBGTQmeEL2XTbqD3REVpD3y",
      pt_address: "5ubipQcpB8D7Kcndaib9k2RCepHRkShHBLZFXurM1MAZ",
      rt_address: "BjGNZuRxc2EykgAFbyifgqSsfEhfj99MniQrTXbwnLip",
    },
    q22026: {
      pubkey: "CEmQqUFj21uXd5GPNjExDsiAYEwdaGbG8zWtewApAoBi",
      pt_address: "2FWQc7utyEC8o49a8395jsVNN9WLJprSZUAJaahMa7Po",
      rt_address: "DxBajZwf6aeYkoCsLkA9aW925RyvSKiigoNXEFPH6Xdy",
    },
    q32026: {
      pubkey: "HBGzEsUnds4gQyBfZ8kK1wTW8ZGq9EUK33bM1bh8dig1",
      pt_address: "3Z7QgwYFUpcpePtsDsvFBDebLRFu4UN5riRrBcpizQrM",
      rt_address: "3ehj25TSRKJWDh7pTnupXZeibBT3Ee37p7ia2358VDNC",
    },
    q42026: {
      pubkey: "HWLhRqvf7unc2mJhRSgLGpJ3eaMa237hyWWd2Qc8s7G2",
      pt_address: "2LYtuCzjvE2zU8NbxZzJ2KN6E7Xq1syN8Ck1uGeZV3By",
      rt_address: "GD8om8MMRcWyVM64B4hQ2LTcZ6MVqpjhzDVfd7pbLH55",
    },
  },
  quicknode: {
    q12026: {
      pubkey: "EdecXE9aNHrSwRzzQhswYvXBJmcbaQ6NaZfAhbnxvd4k",
      pt_address: "9dqbip8ENYHiFNVprzpXL6S6PfFzQJMA2kBeiFzS9cxz",
      rt_address: "FJzk6rRrEQ9E897Bgt4VcZCqasaXX79mHwbsxPiVsRw",
    },
    q22026: {
      pubkey: "EiHEbrwD1NWRGU6Tcm7c1Q7B9n3g3mYGtDSaH6V8Tqqq",
      pt_address: "5JKf7fbvNtTeceokJkczc5bF8vksp7VAeRVPdDqGrBbt",
      rt_address: "3dkAqjhPkNH7fWLtcq3digh5X8JNvfWuCTbDKwbZQ1eC",
    },
    q32026: {
      pubkey: "GURHc8rFMVzsshonz5RfGsxuu5y6LfqEV5H9ZBeFAjJR",
      pt_address: "F9sRJvd4eCD46zg5kT1GLMPjufbdUFDdJdM5XijnEWdQ",
      rt_address: "EAdkDXmXRhMCdqKxh72VX2JMVWZ4mnqaWxjJz1EDi9PL",
    },
    q42026: {
      pubkey: "55CMChj9CR2DGbDuPKmgDJPLs6sQ958hjhwuXF8S15HV",
      pt_address: "8NYadL9n2DUxk2F7KPXgdthSGsc5ZZWvPNSFUZYbUQQi",
      rt_address: "DRuzvgXRfjKXUJ54xjGCLqd6Gxq3CLpKGWv2EVs3ApsJ",
    },
  },
  sec3: {
    q12026: {
      pubkey: "GZe5UCx29K9fda96MhSvaFXsLGdS78L6VTebTXSUXgM7",
      pt_address: "GuLxpNCmPdcdwAmfaZpfEKBn1NuxuUzkhaoYGpApUtyK",
      rt_address: "Em1umHUedyr5wKet4WtVmB8RWuToykxYbdGd773V8sxf",
    },
    q22026: {
      pubkey: "Ey1JshtttaMK7nNqjaD8nSzQ4pz5w3xr3nACB8CqF7VQ",
      pt_address: "CEn88XYXaPphrKM2isZ7NJz4ZENAnAuZUQX6ozUwE2KE",
      rt_address: "9x9bhJN2DrjSDtaSFMrXCpAECX2UFLHtFGfBj2ScGrEM",
    },
    q32026: {
      pubkey: "4cU13V8JwHjJ8bE3Qx5ZCUWfaSEVQcV9ZAXnja2LjEj1",
      pt_address: "A7qVFsxDZbPs6RTf72r9QYu1Jx56pwiVkX9VR13RBMhz",
      rt_address: "J8vEAqRZZRu3DPxnUG9443qnptKENXcTsf3DD16ibh5b",
    },
    q42026: {
      pubkey: "9AKyaiUqLBYbKK1moy648xALrRdWQrin2XCfK6onGcyL",
      pt_address: "73FYMKqtM3shhqC9Doz84H9v4ppHLkCpRQRdnvmoiNL",
      rt_address: "EVUP1CFHStt7dUiYjgUtbMACREtAeC6pNMjTfUkgE5C6",
    },
  },
  sendai: {
    q12026: {
      pubkey: "5eUdyJdLQNNXLT1z4UVKnnqAoYddv51WdgV1SmFEUaaN",
      pt_address: "E6dCWvmbew1gVf2YUzaCCSmrrdZC73SLUm3PRhCvYMmP",
      rt_address: "EeWCm5NTecqN83yiTzKrR6Z4FokTBhbD4eG3xS667X2Q",
    },
    q22026: {
      pubkey: "2FpGbFHL1g4sfYqA5y8E9xqeT1mZaNSfV2SardJPg9Af",
      pt_address: "3ZZbjL5bZZdhGQD7FTdGyTA5fnZ6PN7NHsm2mdoDfjH5",
      rt_address: "CeYQgrLwWqCC891wYoVXiaTtZAHEWKCfZQt7NtuSJfBf",
    },
    q32026: {
      pubkey: "3TnnzwzwxTd8K9FHZL7wLYNncbyp42inx7AifMA2jnGU",
      pt_address: "6LdfnA5vkGwT8UvJ5iSBQUFCtKXkgxCbWrxsGdPSgi6C",
      rt_address: "429nSsLXsbRQgjUHEb6B3FK1pKu753cEdm5GFUAkYZ7y",
    },
    q42026: {
      pubkey: "A75Se24tu3Z6yEEpBiDDdqZqXVyvgkEqgXjKv4SdVkox",
      pt_address: "C781R6EHC7AWqqHypocCsB3rVQDTJUsz2ARRe8pxw6jY",
      rt_address: "3kv6bgX8K1LYGKsYWV1FUvyyHKGxp1FPaDDoqaSTCFUf",
    },
  },
  solstice: {
    q12026: {
      pubkey: "HieSk2YzwFeWT6UAE3gT9q9mMU7dKHQKmefPCKBpNBJ7",
      pt_address: "AMu19ovqGEaPao6dV8d4AyDV1NKUx6ZGDzvY49nL5t3B",
      rt_address: "BE8WQhXLk6PJ6EUs3cA96Xjcho2ZCJGcpuJvgsUYBSYK",
    },
    q22026: {
      pubkey: "3rNGXWj7VdNxFMcBYh4v1YEhXxHWYWPcFxJZKMsttbfW",
      pt_address: "CG4RG2cP2HbZGEN1wXPbwBkMwZXtZsyymYsEKtpPMKAd",
      rt_address: "jbwszhqENoAcJa9vVjWSdHtaaqcBkZjHZemaboU56fG",
    },
    q32026: {
      pubkey: "4aDP3ncCjw1oBu98S7AGtnDXP5eKjcpQzrnR4SwqPBZ2",
      pt_address: "gW91rWS6dFuy5eaiE4WU9eNnAjJfevgKNHAWVUMinLR",
      rt_address: "7KkgENJjUav5XGj8j3xW82SVHWL2tMDjXZrx2V5aD4Xe",
    },
    q42026: {
      pubkey: "AhH91sjrZahpYpJafM2uXrGBa3Q4oGha9KgiwyJWeef7",
      pt_address: "8BpyjbRZEFPk588ertQjgF6khfoTTvPjBjNnXo2CmTrG",
      rt_address: "5oaCdAnc1etXE2NYeASAQVmdSszdhkPPbziXyCewqZtE",
    },
  },
  stakely: {
    q12026: {
      pubkey: "FrGBEonsMPaUBZkZMeXecFsCePSUDe6pQdFVf73dUFzQ",
      pt_address: "CDiXWQsMggfhGxnUvcUnw1WWUwG5sr9Eym1r1ZfcKGdT",
      rt_address: "ERG6oSp1Yg2SbuNWx5LFp3dwaKauxh7NmQVcyvoWH9Qt",
    },
    q22026: {
      pubkey: "3AQbZWmiRZ7ZqbhKSiMtsUvgRReyD14cVpLMtYLbmRvJ",
      pt_address: "CdbpLior5NxyzWZNvjviBpwKoq7inuCT4EBeJHq3SKu2",
      rt_address: "J59HdwCK4Mk4tTdRb5xB2edAQ6eaPPZgiW8YhpoC2dLK",
    },
    q32026: {
      pubkey: "9vLaTTvbvUA3cFq79U3cXorthy9MrxkeMJGsGEcF1tLo",
      pt_address: "4AwHJaY472hd3b9EVY18mv3ph87riwp1q3tCSHVpMUR6",
      rt_address: "C4N6oKtzfJ3wjoaAa2DtsvE9z4YZC4ZKqCJD3vtmQAoT",
    },
    q42026: {
      pubkey: "C7xgMEoJFqZR1jSK4rq1DetoAYSSS5peTZkm25ATWisK",
      pt_address: "Fg8knk6HrYyqnDtr8tLXAB9rpJ6FS8pUNsFx4SzvqcAj",
      rt_address: "FphgkMFE1dTCYzxSZKRbXatRb3nR9LwHLxXRBX3cZaTf",
    },
  },
  "stakr-space": {
    q12026: {
      pubkey: "FwuqaFRCyR84MrUGbLNJV93K55PyhG8U3ijd9FcJsxzr",
      pt_address: "H4Ht3tNRmQGqTwvpCDia188qjhBwdNnZ4hyT1ZwDZiWJ",
      rt_address: "DR8J5ZKcf5Fhuh5HvjbrgXDX5bG2mPWho8ourx1imQrQ",
    },
    q22026: {
      pubkey: "AnhbP84zeaSCai9spg3ypdoSK6bMxefL5kom8gTesqkz",
      pt_address: "3qbbvnXWEyt5vupGdcKKwxgoxQnPrZuP3Zsws8uikEBW",
      rt_address: "ANMeSYqpUqwhjiRx5NrzK1NJLMpAhiYdZ7jDKCiSHfEQ",
    },
    q32026: {
      pubkey: "JChYRnTsXfPr1Gavmi8XfV2hkVRzrhuMtMCxyDzamf9w",
      pt_address: "DVWtx2oF2PYNi5FgQ3nvrHzNVtkGNHSSRVtxRAwAwHxf",
      rt_address: "DRDyM314m1DGdcBLtcXHZMB9MTyigBLC21yiwsB2VmH1",
    },
    q42026: {
      pubkey: "HvTY41oyPD8zPCGd9GM6G1xaHEX2By8LennpkSGqhtMn",
      pt_address: "3imE7wXbYMBoMZ6rJ4yGYyJD9WWvYsAxFwFGedaS9HHT",
      rt_address: "31NE9aaDH9hXy2VeCSXah3Nr9xnv7zydrRviAgcAahgs",
    },
  },
  "starke-finance": {
    q12026: {
      pubkey: "6cTpdbDSGCLD8Uk5188ULprfEac8XMEQfM1H6eCX5afN",
      pt_address: "B1Bt81ogusoGf13GjH4fjJvL4doKPJ9idavRggNxWSP9",
      rt_address: "DwuW53h4SixLsqMFM7nCHGASYiYahrfacwmRNLE6XqqR",
    },
    q22026: {
      pubkey: "E4C9NXuGKW2M86QKCpuEXU6w54BBAqypcPL2gTPbqAqG",
      pt_address: "2ZhRE8LFvRCU3dirrKFGj2GzUJoihCs8ExkTXo8mQZyA",
      rt_address: "3ZLxw4Usm1T6xLYDVaCKX9NVnBTBuVWtcVQ7JnyxpZ8W",
    },
    q32026: {
      pubkey: "vMKdg5ChMHGHir3HKqKLh7fVKRE5q5hqCe6zG2FEzzB",
      pt_address: "EXSUvY5KsyaY8dUpBKXPexEbUG23QMWrPmzyB1D6Cmzh",
      rt_address: "AhiWFHwrSo5YZSS54VP4DYrnxZD7djz6Wa46f2RoVmQt",
    },
    q42026: {
      pubkey: "F8eotp6pEEAiQURr2oLs98ozqyHQoxtMudWvjUmVSSTL",
      pt_address: "DBu8kSniCiy5AAKXKZiVxPZRPyCi7ZLVd1tZo3z5ZnFQ",
      rt_address: "E3TCXYEbsm54pNwEsZvvB89UnKmvv5rREUBx45gu7Lrp",
    },
  },
  "sol-strategies": {
    q12026: {
      pubkey: "BnwkRyYw3RKSBfKy9YYeKFwK8qUZkMZ9ejYev8MPqgaz",
      pt_address: "3r64PxhY9EXCKG1MNxrGcpYcP5zyRfmPhT58uyCjHPUE",
      rt_address: "6cuWKYymyKMXEE4KxBiZEwHEUfYDTkg5GzHdHcg8G8LW",
    },
    q22026: {
      pubkey: "4C2JXMckMAX7nirbYk45LjBsY2F1QQbxjFV4YLCBoV1F",
      pt_address: "9rPfjFJCjGd8MAAqatM33uw7DE6aTxjXLvHznRT65Kh",
      rt_address: "uojnCj5i4HqQyJxfgGjEzYAbA1nCq7qFUkGXZTwnyNe",
    },
    q32026: {
      pubkey: "J3Q6YkbqQBybM6nwB5D6W2YcNzDAHMN6N2bWiQgNTGes",
      pt_address: "qijBQ5VGkz1Z3sk29qBCb37MPdnT1XjMxAWQZvNXZfu",
      rt_address: "DXooLmonnT4BoHYYg6utDiAoD3GndvxPnetRiGh287o8",
    },
    q42026: {
      pubkey: "32yLZAPpRV1fywyhfiKyzxV5BXzqQR2vNP934eajXhXj",
      pt_address: "3yMQuVZ1cdggrwL383WQocxFCiQwzPhTQaXAyYWw4gZe",
      rt_address: "2r1wbxndHbLVYM9JxfDfE4yh5QEivPWozxrLgjodhPv5",
    },
  },
  swyke: {
    q12026: {
      pubkey: "3HxGGBHvQvig4MXMAFT2fDMWC3BSRn2uBZHThszXwphx",
      pt_address: "E2s6cSSr1e2LBpna8yorvmikeNcSonAea4yKNdbB35os",
      rt_address: "CmNVCRzM8sKjKgMmUCD7m39cg7e5FP4vLNTdvZjc57uZ",
    },
    q22026: {
      pubkey: "EhmmYQdJMwt7yK7oLCbbPJiHKNy5P83ywDUwqESmo4dD",
      pt_address: "GzZTkQzySgx8gevhqX4pSXyBvZkPaBZ3P9QrEzGoWWQ",
      rt_address: "F4YawFZBtEoqqcT5MtuMXpk7Cu29WVN8sJ2Ua7pdF6RP",
    },
    q32026: {
      pubkey: "GsdbWASEPyoQrftXNc9pkbHhiLqUZuHM4FtB7ftkeGMF",
      pt_address: "FYYfU9wyw7wwenMJ2DHxMgGgk9ceUPte84nTbQxgPgCt",
      rt_address: "C3UJWjoMBLoEsWF1U4sMzP5RjzAoXawh5nwYNkBV4kzt",
    },
    q42026: {
      pubkey: "DD3wFv6R8yz1hBTWB1D3T12KjbHN6tuT1Mvh5oTU5wz4",
      pt_address: "7LQWKiXBQn6WiUJvxzYCiYs19RwkyQBKWvF6jDrA6kou",
      rt_address: "4wWTqnVfGFPNboMsG2ycDmRGYUuvEGaBfSLmo9SeUZt9",
    },
  },
  thw: {
    q12026: {
      pubkey: "4zxzL55FJUGM3q4UtyVzBA4zfAxKNJQV2EY6E6jqow8k",
      pt_address: "4ZArRXSN6srhMTM8n27GkdSZYMdMWz2scbxsrPznKeN5",
      rt_address: "FnsYqkF77JHAUoShZ1dc1RoMw7Co7p25zbH91U9vMa9k",
    },
    q22026: {
      pubkey: "4u6Bc2pMRD9JHaXVrR9QAALJibncggSaiRRMbr7zsWG1",
      pt_address: "FGYDT2RNoA1ENgNGH7on96FwkTSzw4Yu4kk355SBASHF",
      rt_address: "FPS76KcXCqYVG6CXTCn5H6Pnwb2mWAnFTrpNetqqfKkC",
    },
    q32026: {
      pubkey: "2EMRv1rNREa4Rnd5QCXQVLALHiJ3848XXpP5NM88JDW3",
      pt_address: "8jhYJzgp97QgvChwNkkfWLrcUMXoRx6WkTHH6xHe1spm",
      rt_address: "Ak85b8vKtG7LydRrgy4gD8zyiocf9TZ4X9YmyCJTQ9QD",
    },
    q42026: {
      pubkey: "GTDfvQvinW66stMbQFFUBhab7NRF44uzpJnr77bM3HQk",
      pt_address: "rTry7pVjg56NXfxsPVbtscnjJixeUazpNTXbMXepZcC",
      rt_address: "JEBeASPkZZnUf17VWT6Mc2PMfvk28qdGHQ1c2KNf1iUg",
    },
  },
  tinydancer: {
    q12026: {
      pubkey: "Afseq5hshFXF9adWBzdwoaNuyZrCbfYd8UBrZfr4ExVE",
      pt_address: "358qzSrMfUGG5suZ3Rh6L6FvvZ67aiRc2rFWdYUD7hnG",
      rt_address: "DRaQS3JjjY3G1Xy9bCPvH9tuATA9fU1V7zwBAE7WNk2D",
    },
    q22026: {
      pubkey: "DzqaoihfWScqR2zR2AdbK3cNAwrsx2wQ199U8UyTsLtW",
      pt_address: "4KDsRm1mbXbXBQ3gsnaJ5ExxENLEpji1nUfGmUyvPNZn",
      rt_address: "2VcjBXVcZJo7wi9VqVSTucw6645UyNs7qad3HkjPcUtS",
    },
    q32026: {
      pubkey: "2EDUsGYCjnMAGSwx5WHAt4FQ7e4UoTGFiGCrvGCWhtdE",
      pt_address: "4uwJDdW2KrZ6bWuvsRvEtM1vWC4Tvqd2jARQjTwHv2uF",
      rt_address: "C1zV6xkoYGhw7UvPAz24gxuYnQpYRH1rYQaatCJvjfRC",
    },
    q42026: {
      pubkey: "BunfkBszoUmBUdXsZT2PTr6sQAKSWJrs5DHkZ5QDVYme",
      pt_address: "GpeGUgbonyGXjFqhrMwxQhfsqpLEevJmirRdwMbmqqAH",
      rt_address: "BayKLPep4JUeULAuZGb4w4DBLT2nkuoqBn8osz1uQhcE",
    },
  },
  "vybe-network": {
    q12026: {
      pubkey: "AUHLqeiDG9nGoD1Sn6wAcHkvNraGZSHbkicAHHX8Z2j1",
      pt_address: "3wPJi4SAB7mTTD5y6fJo6TmvjbzjuSFNzw1Qyi1D1PbR",
      rt_address: "DjLSf7geHKYUYQHBZXqRg61CiTWN8iRqgWoUiDf8rXaX",
    },
    q22026: {
      pubkey: "7P5XhaBvGS4gcZjpEVpXK71GsSj1DCd5HDnoQUcNygm5",
      pt_address: "31V8jMsJvpwEcMysnGk4sh2JpLU7kCmbmpDrZJZnFQcA",
      rt_address: "3g9MGvd3F2GorDndVy21UnTQxCdkfpmGDMCXSH57bkAf",
    },
    q32026: {
      pubkey: "J3ny5oEGdCJb3WEuJdN8FUC9SFviiHBwdWYn1NU9eip1",
      pt_address: "C5Y1zJE9z5CvdaYBooZfUhoFNzK5rKZoUzYUPKAwKy7o",
      rt_address: "79LkjDVrsXDfTLdPbLd1qEWxiTmYoeZGdx2CQjRAztyp",
    },
    q42026: {
      pubkey: "7sQ6FVXtNthgTLuPbipMggPFBkwzRQAdNEoXahykWKRt",
      pt_address: "5tXkKvuFn7HzkyH7JS4s11c4aPFy3P6XXFUisFshhkdS",
      rt_address: "JBtqvpCyZHys726PB5VA5yATe8hRjyvMg761JqTYcAap",
    },
  },
  "valid-blocks": {
    q12026: {
      pubkey: "6CBJxUxiHzqXhW41UvqRzEPZjc1Es3ewUPNHkL5PNjJA",
      pt_address: "54E6QjzuBEuXcbaMj2A2UEfbyMP75Ly66vXoso3SUjU6",
      rt_address: "5VvLcNENWjCVvrjptkxvw3GySYjdq7oAEvnWaDQxYBJw",
    },
    q22026: {
      pubkey: "EivBkYkHHbeUPR7ifGgkyCcWvH3G9w7WRv37dfPojdMQ",
      pt_address: "EkFrBtyi6TB9qJL7jmcRt5gkM7922tzA3dcugtqfSU2k",
      rt_address: "3Gf3k3UbEFZwHwY3kU155xgTeTYTzuF6KwcCdTsGaswE",
    },
    q32026: {
      pubkey: "bxP6NK5cheRh7bHxE9LhmwfL6NTUCA5EB7aZ2PJAckC",
      pt_address: "Fa286p6HeAVJE3HdC8wDXWLCRjhmTpyiEaHad5b6Ye9w",
      rt_address: "66M4SCcH4U69ZKCJHtSTYhazsUEy9pz7HG31tF38w9C8",
    },
    q42026: {
      pubkey: "9F6tgbG7u6uVqHq5G6qJ6AH5mQffQhfbX1MASPx565tU",
      pt_address: "CMdsxYjRi6XrnP3YZ71XpHtYGUM3z3U7qdL4VxqcXsCk",
      rt_address: "76krb5WApn2Zh5Z4fCh37DNqDEEQjU7Xs9duuT5m3z8E",
    },
  },
  omakase: {
    q12026: {
      pubkey: "EWq7m4Jkfcfqrocm7f4XpRFU8ygaJ7p5fbtmmgcMYM8",
      pt_address: "8d8XRC8wUMXAqBqTQH7AniJwjmasgtbRBZY4ihdCTuPQ",
      rt_address: "FoQVJ3JPNw8nvtZrTzxbeqE4dbidEHFChsVTbv4iTtcy",
    },
    q22026: {
      pubkey: "DKX1ge82R5mYys5L8gYw6Ai7BSJDxHT51Xm2uUD8Sa2V",
      pt_address: "2HwUCNkE5GDdpWJZpAMTGvdG5FLPqb6JVbS62U57FnqM",
      rt_address: "Ewh9q4kd2fD2vcV2DH26ee5zmfUmnrf8dQZyAbAPTGUe",
    },
    q32026: {
      pubkey: "CeCMsq8WWZrAgNjDRiZVAcbh4GnPoBGQVAf5W4cerNPU",
      pt_address: "BW5Eoabamjhh3F3DTpXff33oDzzFRyJcS2k6Rg4ercBu",
      rt_address: "HvvnsvLxLNeNM6kWDmCVm9XdzCaHQXXDemVa2gn5iMLS",
    },
    q42026: {
      pubkey: "DKnzAxnTqHqkj5DPzm9prfKFsT3jXNQXGXVGu7B5kCQS",
      pt_address: "2UfaMvnA4czYL8xiGCvEhpeX4CkapmoE1eR8LW5Jjz87",
      rt_address: "5zRsAkMPssPbYGWP8QB7RH3mPok92vjQyXtd3yTAweeP",
    },
  },
  "nova-consortium": {
    q12026: {
      pubkey: "7J7e4qPekYWZrJv96BAg2CzJpZVEPnLKQZEK8XrcYUYb",
      pt_address: "BJ8RwhpsJWZfHWyGZVV1uuRYK8dsgPnvnR7w6Rh3Qcus",
      rt_address: "GQ1taX8Hp4Lrd6U2vH1WC8LfJE9tnUNARaLR3Fj1HdMD",
    },
    q22026: {
      pubkey: "3HrqyVa6epGWJvzxgbtVDAeZUVVD5s3vp6VbegJCj1zK",
      pt_address: "HEdjN5VyxWj4EPQkB75M9L2RSghvawrMDL1Bmb8VzBNP",
      rt_address: "7eq2xGg3fbQcLzDWhiSYosPJ8avvBD5R9nxUr63ixXcj",
    },
    q32026: {
      pubkey: "AXrGmkRAxRbHDyaabeUUZiRXvdwzzRuEuo3ZuhpBHbF4",
      pt_address: "9ot9gvnKGgVPub1vPs3BFm187Jjo7JM49WDX7esRK5Qf",
      rt_address: "3KaBJkw2cd4ZcB8KwjAYvTLVdgpSsMNAyUjwGRPpLiUJ",
    },
    q42026: {
      pubkey: "34oE8g7TJE92RJeHPcjfsw7SXE5PUiRkNTFe6zj8yuEU",
      pt_address: "BkBnam68tbXsqG8rhkuwxxuXV8sB5rADDDoDjWwY638c",
      rt_address: "FiVskuKkc7TeukCyPjCwG2JCy7Pcj45K46f44XuDKnd2",
    },
  },
};

// Returns lockups filtered to only ALLOWED_VALIDATORS (is_allowed validators)
export function allowedLockups(): Partial<
  Record<ValidatorId, Partial<Record<MaturityId, Bond>>>
> {
  const allowed = new Set(ALLOWED_VALIDATORS.map((v) => v.id));
  const result: Partial<
    Record<ValidatorId, Partial<Record<MaturityId, Bond>>>
  > = {};
  for (const [vid, mats] of Object.entries(lockups) as [
    ValidatorId,
    Partial<Record<MaturityId, Bond>>,
  ][]) {
    if (allowed.has(vid)) {
      result[vid] = mats;
    }
  }
  return result;
}

export interface MarketRow {
  id: ValidatorId | string;
  name: string;
  symbol: string;
  maturityId: MaturityId | string;
  maturityLabel: string;
  pt_sol: string;
  rt_sol: string;
  bond: Bond;
  validator: Validator;
  maturity: Maturity;
}

function buildMarketRows(): { pts: MarketRow[]; rts: MarketRow[] } {
  const pts: MarketRow[] = [];
  const rts: MarketRow[] = [];
  const allowed = allowedLockups();

  for (const [vid, mats] of Object.entries(allowed) as [
    ValidatorId,
    Partial<Record<MaturityId, Bond>>,
  ][]) {
    const validator = validators[vid];
    for (const maturityId of maturityIdsArray) {
      const bond = mats[maturityId];
      if (!bond) continue;
      const row: MarketRow = {
        id: vid,
        name: validator.name,
        symbol: validator.symbol,
        maturityId,
        maturityLabel: maturities[maturityId].human_readable,
        pt_sol: validator.pt_sol,
        rt_sol: validator.rt_sol,
        bond,
        maturity: maturities[maturityId],
        validator,
      };
      pts.push(row);
      rts.push(row);
    }
  }

  return { pts, rts };
}

const { pts: _pts, rts: _rts } = buildMarketRows();
export const pts = _pts;
export const rts = _rts;

export function buildLockupMarketRows(
  filter: { validatorId: ValidatorId; maturityId: MaturityId }[],
): MarketRow[] {
  const allowed = allowedLockups();
  const rows: MarketRow[] = [];
  for (const { validatorId, maturityId } of filter) {
    const bond = allowed[validatorId]?.[maturityId];
    if (!bond) continue;
    const validator = validators[validatorId];
    rows.push({
      id: validatorId,
      name: validator.name,
      symbol: validator.symbol,
      maturityId,
      maturityLabel: maturities[maturityId].human_readable,
      pt_sol: validator.pt_sol,
      rt_sol: validator.rt_sol,
      bond,
      maturity: maturities[maturityId],
      validator,
    });
  }
  return rows;
}

export function isMarketplaceValidator(id: string): boolean {
  return STAKE_MARKETPLACE_FILTER.some((entry) => entry.validatorId === id);
}

export function buildLockupRowsForValidator(
  validatorId: ValidatorId,
): MarketRow[] {
  return buildLockupMarketRows(
    STAKE_MARKETPLACE_FILTER.filter((e) => e.validatorId === validatorId),
  );
}

/** Find a known maturity by timestamp, or construct a dynamic one. */
export function findMaturityByTimestamp(
  maturityTs: number,
  issuanceTs: number,
  issuanceCloseTs: number,
): { maturityId: MaturityId | string; maturity: Maturity } {
  for (const [id, mat] of Object.entries(maturities) as [
    MaturityId,
    Maturity,
  ][]) {
    if (mat.maturity_timestamp === String(maturityTs)) {
      return { maturityId: id, maturity: mat };
    }
  }
  const d = new Date(maturityTs * 1000);
  return {
    maturityId: `custom_${maturityTs}`,
    maturity: {
      human_readable: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      month: d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase(),
      year: String(d.getFullYear()),
      issuance_start_timestamp: String(issuanceTs),
      issuance_close_timestamp: String(issuanceCloseTs),
      maturity_timestamp: String(maturityTs),
    },
  };
}

/** Build a MarketRow from raw Supabase data. */
export function buildMarketRowFromSupabase(
  bond: {
    pubkey: string;
    validator_vote_account: string;
    principal_token_mint: string;
    yield_token_mint: string;
    issuance_ts: number;
    issuance_close_ts: number;
    maturity_ts: number;
  },
  validatorMeta: {
    vote_pubkey: string;
    name: string;
    symbol: string;
    pt_image_url: string;
    yt_image_url: string;
  },
): MarketRow {
  const { maturityId, maturity } = findMaturityByTimestamp(
    bond.maturity_ts,
    bond.issuance_ts,
    bond.issuance_close_ts,
  );
  const validator: Validator = {
    name: validatorMeta.name,
    symbol: validatorMeta.symbol,
    vote_account: validatorMeta.vote_pubkey,
    pt_sol: validatorMeta.pt_image_url,
    rt_sol: validatorMeta.yt_image_url,
    is_allowed: true,
    type: "validator",
  };
  return {
    id: validatorMeta.symbol.toLowerCase(),
    name: validatorMeta.name,
    symbol: validatorMeta.symbol,
    maturityId,
    maturityLabel: maturity.human_readable,
    pt_sol: validatorMeta.pt_image_url,
    rt_sol: validatorMeta.yt_image_url,
    bond: {
      pubkey: bond.pubkey,
      pt_address: bond.principal_token_mint,
      rt_address: bond.yield_token_mint,
    },
    validator,
    maturity,
  };
}

/** Look up a bond (and its parent validator/maturity) by pubkey. */
export function findBondByPubkey(pubkey: string): MarketRow | null {
  for (const [vid, mats] of Object.entries(lockups) as [
    ValidatorId,
    Partial<Record<MaturityId, Bond>>,
  ][]) {
    const validator = validators[vid];
    for (const [mid, bond] of Object.entries(mats) as [MaturityId, Bond][]) {
      if (bond.pubkey === pubkey) {
        return {
          id: vid,
          name: validator.name,
          symbol: validator.symbol,
          maturityId: mid,
          maturityLabel: maturities[mid].human_readable,
          pt_sol: validator.pt_sol,
          rt_sol: validator.rt_sol,
          bond,
          validator,
          maturity: maturities[mid],
        };
      }
    }
  }
  return null;
}

export function formatMonths(ms: number): { label: string; months: number } {
  const totalMonths = Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
  const clamped = Math.max(totalMonths, 1);
  return {
    label: `${clamped} Month${clamped !== 1 ? "s" : ""}`,
    months: clamped,
  };
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}hr`;
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}hr ${minutes}m`;
}
