import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import options from "../shared/leadOptions.json";
import { SITE, waLink } from "../config/site";
import { getOrigin } from "../lib/tracking";
import Reveal from "./Reveal";

type Fields = {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  segment: string;
  service: string;
  message: string;
  consent: boolean;
  website: string; // honeypot (invisível)
};
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", company: "", whatsapp: "", email: "", segment: "", service: "", message: "", consent: false, website: "" };

/** (85) 98627-5389 / (85) 3456-7890 */
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 3 || !/\s/.test(f.name.trim())) e.name = "Informe seu nome completo.";
  if (f.company.trim().length < 2) e.company = "Informe o nome da empresa.";
  const d = f.whatsapp.replace(/\D/g, "");
  if (!/^\d{10,11}$/.test(d) || (d.length === 11 && d[2] !== "9")) e.whatsapp = "Informe um WhatsApp válido com DDD.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Informe um e-mail válido.";
  if (!f.segment) e.segment = "Selecione o segmento.";
  if (!f.service) e.service = "Selecione o que você precisa.";
  if (!f.consent) e.consent = "É necessário autorizar o contato para continuar.";
  return e;
}

export default function LeadForm() {
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState<{ service: string } | null>(null);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Momento em que o formulário apareceu (usado pela proteção anti-spam)
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Pré-preenchimento vindo dos cards de soluções
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { segment, service } = (e as CustomEvent<{ segment?: string; service?: string }>).detail ?? {};
      setF((prev) => ({ ...prev, segment: segment ?? prev.segment, service: service ?? prev.service }));
      setState((s) => (s === "done" ? "idle" : s));
    };
    window.addEventListener("raster:prefill", onPrefill);
    return () => window.removeEventListener("raster:prefill", onPrefill);
  }, []);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate(f);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setState("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, startedAt: startedAt.current, ...getOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Não foi possível enviar agora.");
      }
      setSent({ service: f.service });
      setState("done");
      setF(empty);
      startedAt.current = Date.now();
    } catch (err) {
      setServerError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Sem conexão com o servidor. Verifique sua internet ou fale conosco pelo WhatsApp.");
      setState("error");
    }
  }

  const serviceLabel = (v: string) => options.services.find((s) => s.value === v)?.label.toLowerCase();
  const err = (k: keyof Fields) =>
    errors[k] ? (
      <span className="field__error" id={`${k}-error`} role="alert">
        <AlertCircle size={13} /> {errors[k]}
      </span>
    ) : null;
  const aria = (k: keyof Fields) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <section id="proposta" className="section lead">
      <div className="shell lead__grid">
        <Reveal className="lead__intro">
          <p className="eyebrow"><span className="eyebrow__dot" /> Solicite uma proposta</p>
          <h2>Vamos descobrir como podemos <span className="grad">transformar seu negócio?</span></h2>
          <p>Conte um pouco sobre sua empresa. Vamos entender suas necessidades e apresentar uma solução adequada para você.</p>
          <ul className="lead__steps">
            <li><b>1</b> Você envia suas informações</li>
            <li><b>2</b> Entramos em contato pelo WhatsApp</li>
            <li><b>3</b> Você recebe uma proposta sob medida</li>
          </ul>
          <p className="lead__alt">
            Prefere conversar agora?{" "}
            <a href={waLink()} target="_blank" rel="noopener noreferrer">Chame no WhatsApp {SITE.whatsappDisplay}</a>
          </p>
        </Reveal>

        <Reveal className="lead__card" delay={0.08}>
          {state === "done" ? (
            <div className="lead__success" role="status" aria-live="polite">
              <CheckCircle2 size={48} strokeWidth={1.5} />
              <h3>Recebemos suas informações!</h3>
              <p>Obrigado pela confiança. Em breve entraremos em contato pelo WhatsApp para entender melhor o seu negócio.</p>
              <a className="btn btn--whatsapp" href={waLink(sent ? serviceLabel(sent.service) : undefined)} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> Quero agilizar pelo WhatsApp
              </a>
              <button className="link" onClick={() => setState("idle")}>Enviar outra solicitação</button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              <div className="form-grid">
                <label className="field">
                  <span>Nome completo</span>
                  <input name="name" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={120} {...aria("name")} />
                  {err("name")}
                </label>
                <label className="field">
                  <span>Nome da empresa</span>
                  <input name="company" autoComplete="organization" value={f.company} onChange={(e) => set("company", e.target.value)} maxLength={120} {...aria("company")} />
                  {err("company")}
                </label>
                <label className="field">
                  <span>WhatsApp</span>
                  <input name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(00) 00000-0000" value={f.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} {...aria("whatsapp")} />
                  {err("whatsapp")}
                </label>
                <label className="field">
                  <span>E-mail</span>
                  <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@empresa.com.br" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={190} {...aria("email")} />
                  {err("email")}
                </label>
                <label className="field">
                  <span>Segmento do negócio</span>
                  <select name="segment" value={f.segment} onChange={(e) => set("segment", e.target.value)} {...aria("segment")}>
                    <option value="" disabled>Selecione</option>
                    {options.segments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {err("segment")}
                </label>
                <label className="field">
                  <span>O que você precisa?</span>
                  <select name="service" value={f.service} onChange={(e) => set("service", e.target.value)} {...aria("service")}>
                    <option value="" disabled>Selecione</option>
                    {options.services.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {err("service")}
                </label>
                <label className="field field--full">
                  <span>Descreva brevemente o que gostaria de melhorar <i>(opcional)</i></span>
                  <textarea name="message" rows={4} maxLength={2000} placeholder="Ex.: Quero que meus clientes consigam fazer pedidos sem precisar me chamar no WhatsApp." value={f.message} onChange={(e) => set("message", e.target.value)} />
                </label>

                {/* Campo-armadilha para robôs: invisível para pessoas */}
                <label className="hp" aria-hidden="true">
                  Site <input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
                </label>

                <label className="consent field--full">
                  <input name="consent" type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} {...aria("consent")} />
                  <span>
                    Autorizo a Raster Digital a usar meus dados para entrar em contato e enviar uma proposta, conforme a{" "}
                    <a href="/privacidade" target="_blank" rel="noopener">Política de Privacidade</a> (LGPD).
                  </span>
                </label>
                {err("consent")}
              </div>

              {state === "error" && (
                <p className="form-alert" role="alert"><AlertCircle size={16} /> {serverError}</p>
              )}

              <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={state === "sending"}>
                {state === "sending" ? (<><Loader2 size={18} className="spin" /> Enviando...</>) : (<>Quero receber uma proposta <ArrowRight size={18} /></>)}
              </button>
              <p className="form-note">Sem compromisso. Seus dados não são compartilhados com terceiros.</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
