import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import "./theme.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
