# @pyefi/sdk

Core SDK for the [Pye Finance](https://pye.fi) Solana yield protocol — stores, data fetching, and transaction execution.

Use this package if you're building a custom UI on top of the Pye protocol. If you just want a drop-in widget, see [`@pyefi/widget`](https://www.npmjs.com/package/@pyefi/widget).

## Install

```bash
pnpm add @pyefi/sdk
```

Peer dependencies (install whichever you actually use):

```bash
pnpm add @solana/web3.js @solana/spl-token @solana/kit \
  @cks-systems/manifest-sdk @supabase/supabase-js \
  react @solana/wallet-adapter-react
```

`react`, `@solana/wallet-adapter-react`, and `@supabase/supabase-js` are optional peers — only required if you import from `@pyefi/sdk/react` or use the realtime market store.

## Configuration

```ts
import { configurePyeSDK } from "@pyefi/sdk";

configurePyeSDK({
  rpcUrl: "https://your-rpc-endpoint",
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-supabase-anon-key",
});
```

## React hooks

```tsx
import {
  PyeSDKProvider,
  useMarketStore,
  useBalanceStore,
  useWalletStore,
} from "@pyefi/sdk/react";

function App() {
  return (
    <PyeSDKProvider config={{ rpcUrl, supabaseUrl, supabaseAnonKey }}>
      <MyComponent />
    </PyeSDKProvider>
  );
}

function MyComponent() {
  const markets = useMarketStore((s) => s.markets);
  const stakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const walletStatus = useWalletStore((s) => s.status);
  return <div>{markets.length} markets</div>;
}
```

## Key exports

| Export | Description |
|--------|-------------|
| `validators`, `maturities`, `allowedLockups` | Protocol constants |
| `fetchUserStakeAccounts()` | Fetch a user's Solana stake accounts |
| `fetchManifestMarkets()` | Fetch order book data from Supabase |
| `checkSellLiquidity` / `checkBuyLiquidity` | Order book liquidity checks |
| `executeStakeDeposit()` | Deposit liquid SOL → mint PT + RT |
| `executeStakeAccountDeposit()` | Deposit existing stake account → mint PT + RT |
| `executeRtSell()` | Sell RT on Manifest for SOL |
| `executeSwap()` / `executeLimitOrder()` / `executeCancelOrder()` | Order management |
| `executeRedeem()` | Redeem PT at maturity for SOL |

## Documentation

Full docs and architecture: [github.com/pyefi/pye-widget](https://github.com/pyefi/pye-widget).

## License

[MIT](./LICENSE)
