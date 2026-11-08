import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import App from "./App.tsx";
import { captureOrigin } from "./lib/tracking";

captureOrigin();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
