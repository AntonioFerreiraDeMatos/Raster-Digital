import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import options from "../shared/leadOptions.json";
import { money, useContent, waLink, type Prefill } from "../lib/content";
import { getOrigin } from "../lib/tracking";
import Reveal from "./Reveal";

type Fields = {
  name: string; company: string; whatsapp: string; email: string; segment: string; service: string;
  investment: string; message: string; maintenance: "" | "sim" | "nao"; consent: boolean; website: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", company: "", whatsapp: "", email: "", segment: "", service: "", investment: "", message: "", maintenance: "", consent: false, website: "" };

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
  if (!/^\d{10,11}$/.test(d) || (d.length === 11 && d[2] !== "9")) e.whatsapp = "WhatsApp com DDD.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "E-mail inválido.";
  if (!f.segment) e.segment = "Selecione o segmento.";
  if (!f.service) e.service = "Selecione a solução.";
  if (!f.consent) e.consent = "Autorize o contato para continuar.";
  return e;
}

export default function LeadForm() {
  const { settings } = useContent();
  const [f, setF] = useState<Fields>(empty);
  const [plan, setPlan] = useState<Prefill | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [sentText, setSentText] = useState("");
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const onPrefill = (e: Event) => {
      const p = (e as CustomEvent<Prefill>).detail ?? {};
      setF((prev) => ({
        ...prev,
        service: p.service ?? prev.service,
        segment: p.segment ?? prev.segment,
        maintenance: p.wants_maintenance === undefined ? prev.maintenance : p.wants_maintenance ? "sim" : "nao",
      }));
      setPlan(p.plan_slug ? p : null);
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
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    setState("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name, company: f.company, whatsapp: f.whatsapp, email: f.email, segment: f.segment, service: f.service,
          message: f.message, investment: f.investment || null,
          wants_maintenance: f.maintenance === "" ? null : f.maintenance === "sim",
          plan_slug: plan?.plan_slug ?? null, estimate: plan?.estimate ?? null,
          consent: f.consent, website: f.website, startedAt: startedAt.current, ...getOrigin(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Não foi possível enviar agora.");
      }
      const svc = options.services.find((s) => s.value === f.service)?.label;
      setSentText(
        `Olá! Acabei de enviar uma solicitação pelo site da Raster Digital (${f.company}).` +
          (plan?.plan_name ? ` Plano: ${plan.plan_name}.` : svc ? ` Interesse: ${svc}.` : "")
      );
      setState("done");
      setF(empty);
      setPlan(null);
      startedAt.current = Date.now();
    } catch (err) {
      setServerError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Sem conexão. Tente de novo ou fale pelo WhatsApp.");
      setState("error");
    }
  }

  const err = (k: keyof Fields) =>
    errors[k] ? <span className="field__error" id={`${k}-error`} role="alert"><AlertCircle size={13} /> {errors[k]}</span> : null;
  const aria = (k: keyof Fields) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <section id="contato" className="section lead">
      <div className="shell lead__grid">
        <Reveal className="lead__intro">
          <p className="eyebrow">Solicitar orçamento</p>
          <h2>Vamos tirar seu projeto <span className="grad">do papel?</span></h2>
          <p>Conte o que você precisa. Respondemos pelo WhatsApp com uma proposta sem compromisso.</p>
          <a className="btn btn--whatsapp" href={waLink(settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={18} /> Prefiro o WhatsApp
          </a>
        </Reveal>

        <Reveal className="lead__card" delay={0.06}>
          {state === "done" ? (
            <div className="lead__success" role="status" aria-live="polite">
              <CheckCircle2 size={46} strokeWidth={1.5} />
              <h3>Recebemos seu interesse!</h3>
              <p>Nossa equipe irá analisar sua necessidade para apresentar a melhor solução para seu negócio.</p>
              <a className="btn btn--whatsapp" href={waLink(settings.contact.whatsapp, sentText)} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={18} /> Continuar pelo WhatsApp
              </a>
              <button className="link" onClick={() => setState("idle")}>Enviar outra solicitação</button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              {plan && (
                <div className="plan-pill">
                  <div>
                    <small>{plan.estimate ? "Simulação" : "Plano escolhido"}</small>
                    <b>{plan.plan_name}</b>
                    {plan.estimate && (
                      <span>
                        {plan.estimate.max_cents ? `${money(plan.estimate.min_cents)} a ${money(plan.estimate.max_cents)}` : `A partir de ${money(plan.estimate.min_cents)}`}
                      </span>
                    )}
                  </div>
                  <button type="button" aria-label="Remover plano" onClick={() => setPlan(null)}><X size={16} /></button>
                </div>
              )}
              <div className="form-grid">
                <label className="field">
                  <span>Nome completo</span>
                  <input name="name" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={120} {...aria("name")} />
                  {err("name")}
                </label>
                <label className="field">
                  <span>Empresa ou estabelecimento</span>
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
                  <input name="email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={190} {...aria("email")} />
                  {err("email")}
                </label>
                <label className="field">
                  <span>Segmento</span>
                  <select name="segment" value={f.segment} onChange={(e) => set("segment", e.target.value)} {...aria("segment")}>
                    <option value="" disabled>Selecione</option>
                    {options.segments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {err("segment")}
                </label>
                <label className="field">
                  <span>Solução desejada</span>
                  <select name="service" value={f.service} onChange={(e) => set("service", e.target.value)} {...aria("service")}>
                    <option value="" disabled>Selecione</option>
                    {options.services.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {err("service")}
                </label>
                <label className="field">
                  <span>Investimento <i>(opcional)</i></span>
                  <select name="investment" value={f.investment} onChange={(e) => set("investment", e.target.value)}>
                    <option value="">Prefiro não informar</option>
                    {options.investments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Manutenção mensal? <i>(opcional)</i></span>
                  <select name="maintenance" value={f.maintenance} onChange={(e) => set("maintenance", e.target.value as Fields["maintenance"])}>
                    <option value="">Ainda não sei</option>
                    <option value="sim">Tenho interesse</option>
                    <option value="nao">Não preciso</option>
                  </select>
                </label>
                <label className="field field--full">
                  <span>O que você precisa? <i>(opcional)</i></span>
                  <textarea name="message" rows={3} maxLength={2000} placeholder="Ex.: quero receber pedidos pelo site." value={f.message} onChange={(e) => set("message", e.target.value)} />
                </label>
                <label className="hp" aria-hidden="true">
                  Site <input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
                </label>
                <label className="consent field--full">
                  <input name="consent" type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} {...aria("consent")} />
                  <span>Autorizo o contato da Raster Digital conforme a <a href="/privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.</span>
                </label>
                {err("consent")}
              </div>
              {state === "error" && <p className="form-alert" role="alert"><AlertCircle size={16} /> {serverError}</p>}
              <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={state === "sending"}>
                {state === "sending" ? <><Loader2 size={18} className="spin" /> Enviando...</> : <>Quero receber uma proposta <ArrowRight size={18} /></>}
              </button>
              <p className="form-note">Sem compromisso. Seus dados não são compartilhados.</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
