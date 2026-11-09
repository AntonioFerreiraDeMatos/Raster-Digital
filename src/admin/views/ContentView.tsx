import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "../api";
import { LinesField, MoneyField, TextField } from "../fields";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const SECTIONS: { key: string; title: string; help: string }[] = [
  { key: "hero", title: "Primeira dobra", help: "Título e texto de abertura do site." },
  { key: "contact", title: "Contatos e redes", help: "WhatsApp (DDI+DDD+número), Instagram e demais links." },
  { key: "solutions", title: "Soluções", help: "Cards da seção Soluções. “service” liga o card a um serviço (identificador)." },
  { key: "maintenance", title: "Manutenção opcional", help: "Valor mensal e o que está incluído." },
  { key: "hosting", title: "Hospedagem", help: "O que está e o que não está incluído." },
  { key: "segments", title: "Soluções por segmento", help: "Possibilidades de desenvolvimento por tipo de negócio." },
  { key: "founder", title: "Fundador", help: "Sua apresentação profissional." },
  { key: "simulator", title: "Simulador", help: "Complexidade (fator multiplicador; vazio = sob análise) e adicionais." },
];

const LABELS: Record<string, string> = {
  eyebrow: "Chamada acima do título", title: "Título", highlight: "Destaque do título (em azul)", subtitle: "Texto de apoio",
  whatsapp: "WhatsApp (só números, com 55)", whatsappDisplay: "WhatsApp (como aparece no site)", instagram: "Instagram", linkedin: "LinkedIn",
  github: "GitHub", city: "Cidade", name: "Nome", text: "Texto", service: "Serviço ligado (identificador)", icon: "Ícone",
  price_cents: "Valor", items: "Itens", note: "Observação", headline: "Título", included: "Incluído", notIncluded: "Não incluído",
  role: "Cargo", highlights: "Destaques", complexity: "Complexidade", addons: "Adicionais", id: "Código", label: "Nome exibido", factor: "Fator (ex.: 1.3)", min_cents: "Valor mínimo",
};
const label = (k: string) => LABELS[k] ?? k;

function Value({ k, v, onChange }: { k: string; v: Json; onChange: (v: Json) => void }) {
  if (k.endsWith("_cents") && (typeof v === "number" || v === null)) {
    return <MoneyField label={label(k)} value={v} onChange={onChange} allowEmpty />;
  }
  if (k === "factor") {
    return <TextField label={label(k)} value={v == null ? "" : String(v)} onChange={(x) => onChange(x.trim() === "" ? null : Number(x.replace(",", ".")) || 1)} hint="Vazio = exige análise" />;
  }
  if (typeof v === "string" || v === null) {
    const long = (v ?? "").length > 70 || ["text", "subtitle", "note"].includes(k);
    return <TextField full={long} area={long} label={label(k)} value={v ?? ""} onChange={(x) => onChange(k === "service" && x === "" ? null : x)} />;
  }
  if (typeof v === "number") return <TextField label={label(k)} value={String(v)} onChange={(x) => onChange(Number(x) || 0)} />;
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
    return <LinesField full label={label(k)} value={v as string[]} onChange={onChange} />;
  }
  if (Array.isArray(v)) return <ObjList k={k} list={v as { [k: string]: Json }[]} onChange={onChange} />;
  if (typeof v === "object") return <Obj obj={v} onChange={onChange} />;
  return null;
}

function Obj({ obj, onChange }: { obj: { [k: string]: Json }; onChange: (v: Json) => void }) {
  return (
    <div className="edit-grid">
      {Object.entries(obj).map(([k, v]) => (
        <Value key={k} k={k} v={v} onChange={(nv) => onChange({ ...obj, [k]: nv })} />
      ))}
    </div>
  );
}

function blankLike(o: { [k: string]: Json }): { [k: string]: Json } {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? [] : typeof v === "number" ? 0 : v === null ? null : ""]));
}

function ObjList({ k, list, onChange }: { k: string; list: { [k: string]: Json }[]; onChange: (v: Json) => void }) {
  return (
    <div className="field--full obj-list">
      <span className="obj-list__title">{label(k)}</span>
      {list.map((item, i) => (
        <div className="obj-list__item" key={i}>
          <Obj obj={item} onChange={(nv) => onChange(list.map((x, j) => (j === i ? (nv as { [k: string]: Json }) : x)))} />
          <button type="button" className="icon-btn icon-btn--danger" aria-label="Remover item" onClick={() => onChange(list.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
        </div>
      ))}
      {list.length > 0 && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange([...list, blankLike(list[0])])}><Plus size={14} /> Adicionar</button>
      )}
    </div>
  );
}

function Section({ name, title, help, initial, canEdit, onError }: { name: string; title: string; help: string; initial: Json; canEdit: boolean; onError: (e: unknown) => void }) {
  const [v, setV] = useState<Json>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api(`/settings/${name}`, { method: "PUT", body: JSON.stringify({ value: v }) });
      setMsg({ ok: true, text: "Salvo! O site já mostra a alteração." });
    } catch (e) {
      const f = e instanceof ApiError && e.fields ? Object.values(e.fields).join(" ") : "";
      setMsg({ ok: false, text: f || (e instanceof Error ? e.message : "Erro ao salvar.") });
      onError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="content-sec">
      <summary><b>{title}</b><small>{help}</small></summary>
      <fieldset disabled={!canEdit} className="content-sec__body">
        <Value k={name} v={v} onChange={(nv) => { setV(nv); setMsg(null); }} />
        {canEdit && (
          <div className="drawer__actions">
            <button className="btn btn--primary btn--sm" onClick={save} disabled={saving}>{saving ? <Loader2 size={15} className="spin" /> : "Salvar seção"}</button>
            {msg && <span className={msg.ok ? "ok-msg" : "field__error"}>{msg.ok && <CheckCircle2 size={14} />} {msg.text}</span>}
          </div>
        )}
      </fieldset>
    </details>
  );
}

export default function ContentView({ canEdit, onUnauthorized }: { canEdit: boolean; onUnauthorized: () => void }) {
  const [settings, setSettings] = useState<Record<string, Json> | null>(null);
  const [error, setError] = useState("");
  const onError = (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) onUnauthorized();
  };
  useEffect(() => {
    api<{ settings: Record<string, Json> }>("/settings")
      .then((r) => setSettings(r.settings))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) return onUnauthorized();
        setError(e instanceof Error ? e.message : "Erro ao carregar.");
      });
  }, [onUnauthorized]);

  return (
    <section>
      <p className="adm-muted">Textos, contatos, preços de manutenção, hospedagem e simulador. Clique numa seção para editar.</p>
      {!canEdit && <p className="adm-note">Seu perfil pode apenas visualizar. Alterações exigem o perfil administrador.</p>}
      {error && <p className="form-alert">{error}</p>}
      {!settings ? <div className="adm-center adm-center--inline"><Loader2 className="spin" /></div> : (
        <div className="content-list">
          {SECTIONS.filter((s) => s.key in settings).map((s) => (
            <Section key={s.key} name={s.key} title={s.title} help={s.help} initial={settings[s.key]} canEdit={canEdit} onError={onError} />
          ))}
        </div>
      )}
    </section>
  );
}
