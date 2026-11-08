import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/site.css";
import "./admin.css";
import AdminApp from "./AdminApp";

createRoot(document.getElementById("admin")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
