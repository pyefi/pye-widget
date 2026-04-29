# Pye Widget

Embeddable Solana staking widget that lets users sell future staking rewards for upfront SOL. Available as a React component.

## Monorepo Structure

```
pye-widget/
  packages/
    sdk/          # @pyefi/sdk — core SDK (stores, data fetching, tx execution)
    widget/       # @pyefi/widget — React widget component
  examples/
    react-universal/         # Vite + React, all validators
    react-single-validator/  # Vite + React, scoped to one validator
    nextjs-universal/        # Next.js, all validators
    nextjs-single-validator/ # Next.js, scoped to one validator
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.15

## Installation

```bash
git clone <repo-url>
cd pye-widget
pnpm install
```

## Build

```bash
pnpm build
```

This builds all packages in dependency order:

1. `@pyefi/sdk` — compiled with tsup to `packages/sdk/dist/`
2. `@pyefi/widget` — bundled with Vite to `packages/widget/dist/pye-widget.es.js`

## Development

```bash
pnpm dev
```

Starts all packages in parallel via Turborepo:

| Package | What runs | Description |
|---------|-----------|-------------|
| `@pyefi/sdk` | `tsup --watch` | Rebuilds SDK on file changes |
| `@pyefi/widget` | `vite build --watch` | Rebuilds widget bundle on changes |
| examples | `vite` / `next dev` | Per-example dev servers |

---

## Usage: React

### Install

```bash
npm install @pyefi/widget
# or
pnpm add @pyefi/widget
```

`@pyefi/sdk` is installed transitively — only add it explicitly if you want to build a custom UI on top of the SDK.

### Peer dependencies

The widget requires these peer dependencies in your project:

```bash
npm install react react-dom @solana/web3.js \
  @solana/wallet-adapter-base @solana/wallet-adapter-react \
  @solana/wallet-adapter-wallets
```

### Basic example

```tsx
import { PyeWidget } from "@pyefi/widget";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Sell Rewards</button>

      {open && (
        <PyeWidget
          rpcUrl="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
          supabaseUrl="https://your-project.supabase.co"
          supabaseAnonKey="your-supabase-anon-key"
          voteAccount="he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk"
          theme="pye-dark"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `rpcUrl` | `string` | Yes | — | Solana RPC endpoint URL |
| `supabaseUrl` | `string` | Yes | — | Supabase project URL (for market data) |
| `supabaseAnonKey` | `string` | Yes | — | Supabase anonymous key |
| `voteAccount` | `string` | No | — | Filter to a specific validator vote account |
| `theme` | `WidgetTheme` | No | `"pye-dark"` | Visual theme |
| `onClose` | `() => void` | No | — | Callback when the user closes the widget |

### Themes

```
pye-light | pye-dark | neutral-light | neutral-dark | midnight | rose | graphite | sand
```

### Buffer polyfill (rare fallback)

The widget self-installs a `globalThis.Buffer` polyfill on import, so you usually don't need to do anything. If you hit `Cannot read properties of undefined (reading 'isBuffer')` on a fresh-scaffold Vite app, add this at your app entry as a fallback:

```ts
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
```

---

## Configuration

The widget requires three pieces of configuration:

### 1. Solana RPC URL

A Solana mainnet RPC endpoint. Public endpoints (`https://api.mainnet-beta.solana.com`) work but have rate limits. For production, use a dedicated provider like [Helius](https://helius.dev) or [Triton](https://triton.one).

### 2. Supabase credentials

The widget reads live market and order book data from Supabase. You'll need:
- **Project URL** — your Supabase project URL
- **Anon key** — the public anonymous key (safe to expose client-side)

### 3. Vote account (optional)

Pass a validator vote account to scope the widget to a single validator's markets. Omit it to show all available validators.

---

## SDK (`@pyefi/sdk`)

The SDK can be used independently for building custom UIs.

### Configuration

```ts
import { configurePyeSDK } from "@pyefi/sdk";

configurePyeSDK({
  rpcUrl: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-supabase-anon-key",
});
```

### React hooks

```tsx
import { PyeSDKProvider, useMarketStore, useBalanceStore, useWalletStore } from "@pyefi/sdk/react";

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
  // ...
}
```

### Key exports

| Export | Description |
|--------|-------------|
| `validators`, `maturities`, `allowedLockups` | Protocol constants |
| `fetchUserStakeAccounts()` | Fetch user's Solana stake accounts |
| `fetchManifestMarkets()` | Fetch order book data from Supabase |
| `checkSellLiquidity(bids, amount)` | Check if order book can fill an RT sell |
| `checkBuyLiquidity(asks, amount)` | Check if order book can fill a PT buy |
| `executeStakeDeposit()` | Deposit liquid SOL into bond (mint PT+RT) |
| `executeStakeAccountDeposit()` | Deposit existing stake account into bond |
| `executeRtSell()` | Sell RT tokens on Manifest for SOL |
| `executeSwap()` | Market order on Manifest |
| `executeLimitOrder()` | Place limit order on Manifest |
| `executeCancelOrder()` | Cancel open order |
| `executeRedeem()` | Redeem PT at maturity for SOL |

---

## Type checking

```bash
pnpm typecheck
```

Runs `tsc --noEmit` across all packages.

---

## Architecture

```
User connects wallet
  -> SelectPosition: pick stake account or liquid SOL
  -> ChooseAmount: enter SOL amount to lock
  -> ChooseDuration: pick maturity quarter (Q1-Q4 2026)
  -> ReviewQuote: see upfront SOL payout from RT sale
  -> Sign: 2-step transaction
      1. Deposit stake into bond -> receive PT + RT
      2. Sell RT on Manifest order book -> receive upfront SOL
  -> Complete: confirmation with Solscan link
```

**PT (Principal Token)** — redeemable 1:1 for staked SOL at maturity.
**RT (Reward Token)** — represents future staking rewards, sold immediately on the Manifest order book.
