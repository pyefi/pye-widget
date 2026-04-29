# @pyefi/widget

Embeddable Solana yield-trading widget by [Pye Finance](https://pye.fi). Lets users sell future staking rewards for upfront SOL.

Available as a React component or a drop-in CDN script.

## Install

```bash
pnpm add @pyefi/widget @pyefi/sdk
# or
npm install @pyefi/widget @pyefi/sdk
```

You also need these peer dependencies in your app:

```bash
pnpm add react react-dom @solana/web3.js \
  @solana/wallet-adapter-base @solana/wallet-adapter-react \
  @solana/wallet-adapter-wallets
```

## Usage (React)

```tsx
import { useState } from "react";
import { PyeWidget } from "@pyefi/widget";

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Sell rewards</button>
      {open && (
        <PyeWidget
          rpcUrl="https://your-rpc-endpoint"
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
| `supabaseUrl` | `string` | Yes | — | Supabase project URL |
| `supabaseAnonKey` | `string` | Yes | — | Supabase anonymous key (safe for client) |
| `voteAccount` | `string` | No | — | Filter to a single validator's markets |
| `theme` | `WidgetTheme` | No | `"pye-dark"` | One of `pye-light`, `pye-dark`, `neutral-light`, `neutral-dark`, `midnight`, `rose`, `graphite`, `sand` |
| `onClose` | `() => void` | No | — | Called when the user closes the widget |

### Buffer polyfill

Some bundlers (notably Vite) don't ship a Node `Buffer` polyfill. Add this once at your app entry:

```ts
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
```

## Documentation

Full docs and architecture: [github.com/pyefi/pye-widget](https://github.com/pyefi/pye-widget).

## License

[MIT](./LICENSE)
