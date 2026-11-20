import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Entrada ao rolar com profundidade: sobe, cresce um pouco e sai do desfoque para o foco.
 * Ao terminar, remove o filtro (um filter ativo atrapalharia o efeito de vidro dos cards).
 * Respeita quem prefere menos animação.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36, scale: 0.97, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
