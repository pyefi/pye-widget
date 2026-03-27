# Pye Widget

Embeddable Solana staking widget that lets users sell future staking rewards for upfront SOL. Available as a React component or a drop-in CDN script.

## Monorepo Structure

```
pye-widget/
  packages/
    sdk/          # @pye/sdk — core SDK (stores, data fetching, tx execution)
    widget/       # @pye/widget — React widget component + CDN bundle
  examples/
    react-demo/   # React integration example
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

1. `@pye/sdk` — compiled with tsup to `packages/sdk/dist/`
2. `@pye/widget` — bundled with Vite to `packages/widget/dist/`
   - `pye-widget.es.js` — ES module for React imports
   - `pye-widget.iife.js` — self-contained CDN bundle

## Development

```bash
pnpm dev
```

Starts all packages in parallel via Turborepo:

| Package | What runs | Description |
|---------|-----------|-------------|
| `@pye/sdk` | `tsup --watch` | Rebuilds SDK on file changes |
| `@pye/widget` | `vite build --watch` | Rebuilds widget bundle on changes |
| `react-demo` | `vite` | Dev server at `http://localhost:5173` |

---

## Usage: React

### Install

```bash
npm install @pye/sdk @pye/widget
# or
pnpm add @pye/sdk @pye/widget
```

### Peer dependencies

The widget requires these peer dependencies in your project:

```bash
npm install react react-dom @solana/web3.js @solana/wallet-adapter-react
```

### Basic example

```tsx
import { PyeWidget } from "@pye/widget";

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

### Buffer polyfill

If your bundler doesn't provide a Node.js `Buffer` polyfill (common with Vite), add this at your app's entry point:

```ts
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
```

---

## Usage: CDN

Add a single `<script>` tag to any HTML page. No build step required.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pye Widget</title>
</head>
<body>
  <div id="pye-widget"></div>

  <script
    data-pye-widget
    data-rpc-url="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
    data-supabase-url="https://your-project.supabase.co"
    data-supabase-anon-key="your-supabase-anon-key"
    data-vote-account="he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk"
    data-theme="pye-dark"
    src="https://cdn.example.com/pye-widget.iife.js"
  ></script>
</body>
</html>
```

The script auto-mounts into `#pye-widget`. If the element doesn't exist, it creates one.

### Data attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-pye-widget` | Yes | — | Identifies the script tag (no value needed) |
| `data-rpc-url` | No | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint |
| `data-supabase-url` | Yes | — | Supabase project URL |
| `data-supabase-anon-key` | Yes | — | Supabase anonymous key |
| `data-vote-account` | No | — | Filter to a specific validator |
| `data-theme` | No | `"dark"` | Visual theme |

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

## SDK (`@pye/sdk`)

The SDK can be used independently for building custom UIs.

### Configuration

```ts
import { configurePyeSDK } from "@pye/sdk";

configurePyeSDK({
  rpcUrl: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-supabase-anon-key",
});
```

### React hooks

```tsx
import { PyeSDKProvider, useMarketStore, useBalanceStore, useWalletStore } from "@pye/sdk/react";

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
