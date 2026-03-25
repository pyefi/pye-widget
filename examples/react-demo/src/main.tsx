import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { PyeWidget } from "@pye/widget";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            background: "#9a4dff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Open Widget
        </button>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <PyeWidget
            rpcUrl="https://mainnet.helius-rpc.com/?api-key=REDACTED"
            apiBaseUrl="https://app.pye.fi"
            supabaseUrl="https://tfrickmnrfyjkvjhmuik.supabase.co"
            supabaseAnonKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmlja21ucmZ5amt2amhtdWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDkyMDksImV4cCI6MjA1OTAyNTIwOX0.1wl2FWa5g0tkUn6yRcg1AyF6ixWN7SyoD89cFGxkQKM"
            validatorName="Helius"
            theme="pye-dark"
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
