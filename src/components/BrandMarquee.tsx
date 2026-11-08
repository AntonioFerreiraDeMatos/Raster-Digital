import { useReducedMotion } from "framer-motion";
import { useContent } from "../lib/content";

// Faixa contínua com os logotipos originais dos clientes.
// A lista é repetida para preencher a tela; a trilha é duplicada para o loop não ter emenda.
// Com "reduzir movimento", mostra cada marca uma vez, parada.
export default function BrandMarquee() {
  const { brands } = useContent();
  const reduce = useReducedMotion();
  if (!brands.length) return null;

  const copies = reduce ? 1 : Math.max(3, Math.ceil(8 / brands.length));
  const row = Array.from({ length: copies }, () => brands).flat();
  const tracks = reduce ? [0] : [0, 1];

  return (
    <section className="marquee-section" aria-labelledby="marcas-titulo">
      <h2 id="marcas-titulo" className="marquee-title">Marcas que confiaram em nosso desenvolvimento.</h2>
      <div className={`marquee ${reduce ? "marquee--static" : ""}`}>
        {tracks.map((track) => (
          <ul className="marquee__track" key={track} aria-hidden={track === 1 || undefined}>
            {row.map((b, i) => (
              <li className="marquee__item" key={`${b.id}-${i}`}>
                <img
                  src={b.logo_url}
                  alt={track === 0 && i < brands.length ? `${b.name} — ${b.relation}` : ""}
                  loading="lazy"
                  height="72"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
