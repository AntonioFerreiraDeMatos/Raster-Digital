import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Mail, MessageCircle, Pencil, Trash2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  api, ApiError, OPTIONS, SEGMENT_LABEL, SERVICE_LABEL, STATUS_LABEL,
  formatDate, formatPhone, whatsappTo, estimateText, INVESTMENT_LABEL, type Lead, type LeadEvent, type Status,
} from "./api";

type Props = { id: number; canDelete: boolean; onClose: () => void; onChanged: () => void; onUnauthorized: () => void };

const EVENT_LABEL: Record<LeadEvent["type"], string> = {
  criado: "Lead cadastrado pelo site",
  reenvio: "Enviou o formulário novamente",
  status: "Situação alterada",
  observacao: "Observação",
  edicao: "Dados editados",
};

export default function LeadDrawer({ id, canDelete, onClose, onChanged, onUnauthorized }: Props) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    },
    [onUnauthorized]
  );

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    api<{ lead: Lead; events: LeadEvent[] }>(`/leads/${id}`)
      .then((r) => {
        if (!alive) return;
        setLead(r.lead);
        setEvents(r.events);
      })
      .catch((err) => alive && handle(err));
    return () => {
      alive = false;
    };
  }, [id, reloadKey, handle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      load();
      onChanged();
    } catch (err) {
      handle(err);
    } finally {
      setBusy(false);
    }
  }

  const changeStatus = (status: Status) => run(() => api(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }));

  const addNote = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    run(async () => {
      await api(`/leads/${id}/notes`, { method: "POST", body: JSON.stringify({ body: note }) });
      setNote("");
    });
  };

  async function remove() {
    if (!lead || !confirm(`Excluir definitivamente o lead de ${lead.name}? Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    try {
      await api(`/leads/${id}`, { method: "DELETE" });
      onChanged();
      onClose();
    } catch (err) {
      handle(err);
      setBusy(false);
    }
  }

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Detalhes do lead">
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel">
        <header className="drawer__head">
          <div>
            <h2>{lead?.name ?? "Carregando..."}</h2>
            {lead && <p>{lead.company}</p>}
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        {error && <p className="form-alert" role="alert">{error}</p>}
        {!lead ? (
          <div className="adm-center adm-center--inline"><Loader2 className="spin" /></div>
        ) : editing ? (
          <EditForm lead={lead} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); load(); onChanged(); }} onError={handle} />
        ) : (
          <>
            <div className="drawer__actions">
              <a className="btn btn--whatsapp btn--sm" href={whatsappTo(lead)} target="_blank" rel="noopener noreferrer"><FaWhatsapp size={16} /> Abrir WhatsApp</a>
              <a className="btn btn--ghost btn--sm" href={`mailto:${lead.email}`}><Mail size={15} /> E-mail</a>
              <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}><Pencil size={15} /> Editar</button>
              {canDelete && <button className="btn btn--danger btn--sm" onClick={remove} disabled={busy}><Trash2 size={15} /> Excluir</button>}
            </div>

            <label className="field">
              <span>Situação comercial</span>
              <select value={lead.status} disabled={busy} onChange={(e) => changeStatus(e.target.value as Status)}>
                {OPTIONS.statuses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>

            <dl className="info">
              <div><dt>WhatsApp</dt><dd>{formatPhone(lead.whatsapp)}</dd></div>
              <div><dt>E-mail</dt><dd>{lead.email}</dd></div>
              <div><dt>Segmento</dt><dd>{SEGMENT_LABEL[lead.segment]}</dd></div>
              <div><dt>Serviço desejado</dt><dd>{SERVICE_LABEL[lead.service] ?? lead.service}</dd></div>
              {lead.plan_slug && <div><dt>Plano escolhido</dt><dd>{lead.plan_slug}</dd></div>}
              <div><dt>Investimento informado</dt><dd>{lead.investment ? INVESTMENT_LABEL[lead.investment] : "Não informado"}</dd></div>
              <div><dt>Manutenção mensal</dt><dd>{lead.wants_maintenance == null ? "Não informou" : lead.wants_maintenance ? "Tem interesse" : "Não precisa"}</dd></div>
              {estimateText(lead) && <div className="info__full"><dt>Estimativa do simulador</dt><dd><b>{estimateText(lead)}</b>{lead.estimate_summary && <span className="pre est-sum">{lead.estimate_summary}</span>}</dd></div>}
              <div><dt>Cadastro</dt><dd>{formatDate(lead.created_at)}</dd></div>
              <div><dt>Origem</dt><dd>{lead.source}{lead.utm_campaign ? ` · campanha ${lead.utm_campaign}` : ""}{lead.utm_medium ? ` · ${lead.utm_medium}` : ""}</dd></div>
              {lead.referrer && <div className="info__full"><dt>Veio de</dt><dd className="break">{lead.referrer}</dd></div>}
              <div className="info__full"><dt>Necessidade descrita</dt><dd className="pre">{lead.message || "Não informada."}</dd></div>
              <div className="info__full"><dt>Consentimento LGPD</dt><dd>{formatDate(lead.consent_at)} · política {lead.privacy_version}</dd></div>
            </dl>

            <form className="note-form" onSubmit={addNote}>
              <label className="field">
                <span>Registrar observação comercial</span>
                <textarea rows={3} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Liguei, pediu proposta até sexta para cardápio digital." />
              </label>
              <button className="btn btn--primary btn--sm" disabled={busy || !note.trim()}><MessageCircle size={15} /> Salvar observação</button>
            </form>

            <h3 className="timeline__title">Histórico</h3>
            <ol className="timeline">
              {events.map((ev) => (
                <li key={ev.id} className={`timeline__item timeline__item--${ev.type}`}>
                  <div className="timeline__meta">
                    <b>{EVENT_LABEL[ev.type]}</b>
                    <small>{formatDate(ev.created_at)}{ev.author ? ` · ${ev.author}` : ""}</small>
                  </div>
                  {ev.type === "status" && (
                    <p>{STATUS_LABEL[ev.from_status as Status] ?? ev.from_status} → <b>{STATUS_LABEL[ev.to_status as Status] ?? ev.to_status}</b></p>
                  )}
                  {ev.body && <p className="pre">{ev.body}</p>}
                </li>
              ))}
            </ol>
          </>
        )}
      </aside>
    </div>
  );
}

function EditForm({ lead, onCancel, onSaved, onError }: { lead: Lead; onCancel: () => void; onSaved: () => void; onError: (e: unknown) => void }) {
  const [f, setF] = useState({
    name: lead.name, company: lead.company, whatsapp: formatPhone(lead.whatsapp), email: lead.email,
    segment: lead.segment, service: lead.service, message: lead.message ?? "",
  });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFields({});
    try {
      await api(`/leads/${lead.id}`, { method: "PATCH", body: JSON.stringify(f) });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFields(err.fields);
      onError(err);
    } finally {
      setSaving(false);
    }
  }

  const input = (k: "name" | "company" | "whatsapp" | "email", label: string) => (
    <label className="field">
      <span>{label}</span>
      <input value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!fields[k]} />
      {fields[k] && <span className="field__error">{fields[k]}</span>}
    </label>
  );

  return (
    <form className="edit-form" onSubmit={save}>
      {input("name", "Nome")}
      {input("company", "Empresa")}
      {input("whatsapp", "WhatsApp")}
      {input("email", "E-mail")}
      <label className="field">
        <span>Segmento</span>
        <select value={f.segment} onChange={(e) => set("segment", e.target.value)}>
          {OPTIONS.segments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Serviço</span>
        <select value={f.service} onChange={(e) => set("service", e.target.value)}>
          {OPTIONS.services.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Necessidade</span>
        <textarea rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} />
      </label>
      <div className="drawer__actions">
        <button className="btn btn--primary btn--sm" disabled={saving}>{saving ? <Loader2 size={15} className="spin" /> : "Salvar alterações"}</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
