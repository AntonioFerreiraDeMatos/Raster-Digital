import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <Reveal className={`head ${center ? "head--center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {sub && <p className="head__sub">{sub}</p>}
    </Reveal>
  );
}
