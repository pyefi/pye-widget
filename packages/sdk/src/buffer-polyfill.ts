// Side-effect import: makes Node's `Buffer` available as a browser global so
// transitive deps (@cks-systems/manifest-sdk, @solana/web3.js, etc.) that
// reference `Buffer` at module-evaluation time don't crash in browser apps
// that haven't set up their own polyfill.
import { Buffer as BufferShim } from "buffer";

const g = globalThis as unknown as { Buffer?: unknown };
if (typeof g.Buffer === "undefined") {
  g.Buffer = BufferShim;
}
