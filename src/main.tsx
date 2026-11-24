import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import App from "./App.tsx";
import { captureOrigin } from "./lib/tracking";

// Guarda a origem (UTM, site de referência) antes de qualquer redirecionamento, para não perdê-la.
captureOrigin();

// Links antigos da página inicial (compartilhados antes de existirem as páginas internas) continuam funcionando.
// O "#" não chega ao servidor, então o redirecionamento é feito aqui, antes de montar a página.
const MOVED: Record<string, string> = {
  "#precos": "/precos",
  "#manutencao": "/precos#manutencao",
  "#simulador": "/precos#simulador",
  "#duvidas": "/precos#duvidas",
  "#segmentos": "/sistemas-personalizados#segmentos",
  "#desafios": "/#solucoes",
};
const target = MOVED[location.hash] ?? (location.hash.startsWith("#plano-") ? `/precos${location.hash}` : null);

if (target && !target.startsWith("/#")) {
  const [path, hash] = target.split("#");
  location.replace(`${path}${location.search}${hash ? `#${hash}` : ""}`);
} else {
  if (target) history.replaceState(null, "", `${location.pathname}${location.search}${target.slice(1)}`);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
