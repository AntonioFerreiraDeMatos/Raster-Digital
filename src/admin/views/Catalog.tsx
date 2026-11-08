import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, ApiError, money } from "../api";
import { ImageField, LinesField, MoneyField, NumberField, SelectField, TextField, Toggle } from "../fields";

type WithId = { id: number; active: boolean; sort: number };

/** Lista + editor genérico para um recurso do painel. */
function useResource<T extends WithId>(path: string, onUnauthorized: () => void) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState("");
  const [key, setKey] = useState(0);
  const reload = useCallback(() => setKey((k) => k + 1), []);
  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    },
    [onUnauthorized]
  );
  useEffect(() => {
    let alive = true;
    api<{ items: T[] }>(path)
      .then((r) => alive && setItems(r.items))
      .catch((e) => alive && handle(e));
    return () => {
      alive = false;
    };
  }, [path, key, handle]);
  return { items, error, setError, reload, handle };
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel drawer__panel--wide">
        <header className="drawer__head">
          <h2>{title}</h2>
          <button className="drawer__close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>
        {children}
      </aside>
    </div>
  );
}

function Editor<T extends WithId>({
  title, path, initial, onClose, onSaved, onError, render,
}: {
  title: string; path: string; initial: T; onClose: () => void; onSaved: () => void; onError: (e: unknown) => void;
  render: (v: T, set: <K extends keyof T>(k: K, val: T[K]) => void, fields: Record<string, string>) => ReactNode;
}) {
  const [v, setV] = useState<T>(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const set = <K extends keyof T>(k: K, val: T[K]) => setV((p) => ({ ...p, [k]: val }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFields({});
    setMsg("");
    try {
      await api(v.id ? `${path}/${v.id}` : path, { method: v.id ? "PUT" : "POST", body: JSON.stringify(v) });
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFields(err.fields);
      setMsg(err instanceof Error ? err.message : "Erro ao salvar.");
      onError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="edit-form edit-grid" onSubmit={save}>
        {render(v, set, fields)}
        <div className="field--full row-2">
          <NumberField label="Ordem de exibição" value={v.sort} onChange={(n) => set("sort", n as T["sort"])} />
          <Toggle label="Exibir no site" checked={v.active} onChange={(c) => set("active", c as T["active"])} />
        </div>
        {msg && <p className="form-alert field--full" role="alert">{msg}</p>}
        <div className="drawer__actions field--full">
          <button className="btn btn--primary btn--sm" disabled={saving}>{saving ? <Loader2 size={15} className="spin" /> : "Salvar"}</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}

function ListView<T extends WithId>({
  path, canEdit, onUnauthorized, empty, newItem, itemTitle, columns, render, intro,
}: {
  path: string; canEdit: boolean; onUnauthorized: () => void; empty: T; newItem: string; intro: string;
  itemTitle: (t: T) => string;
  columns: (t: T) => ReactNode;
  render: (v: T, set: <K extends keyof T>(k: K, val: T[K]) => void, fields: Record<string, string>, onError: (e: unknown) => void) => ReactNode;
}) {
  const { items, error, setError, reload, handle } = useResource<T>(path, onUnauthorized);
  const [editing, setEditing] = useState<T | null>(null);

  async function toggleActive(t: T) {
    try {
      await api(`${path}/${t.id}`, { method: "PUT", body: JSON.stringify({ ...t, active: !t.active }) });
      reload();
    } catch (e) { handle(e); }
  }
  async function remove(t: T) {
    if (!confirm(`Excluir "${itemTitle(t)}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api(`${path}/${t.id}`, { method: "DELETE" });
      reload();
    } catch (e) { handle(e); }
  }

  return (
    <section>
      <div className="view-head">
        <p className="adm-muted">{intro}</p>
        {canEdit && <button className="btn btn--primary btn--sm" onClick={() => { setError(""); setEditing({ ...empty, sort: (items?.length ?? 0) }); }}><Plus size={15} /> {newItem}</button>}
      </div>
      {!canEdit && <p className="adm-note">Seu perfil pode apenas visualizar. Alterações exigem o perfil administrador.</p>}
      {error && <p className="form-alert" role="alert">{error}</p>}
      {!items ? <div className="adm-center adm-center--inline"><Loader2 className="spin" /></div> : (
        <ul className="cards-list">
          {items.map((t) => (
            <li key={t.id} className={`card-row ${t.active ? "" : "card-row--off"}`}>
              <div className="card-row__main">{columns(t)}</div>
              {canEdit && (
                <div className="card-row__actions">
                  <button className="icon-btn" onClick={() => toggleActive(t)} aria-label={t.active ? "Ocultar do site" : "Exibir no site"} title={t.active ? "Ocultar do site" : "Exibir no site"}>
                    {t.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button className="icon-btn" onClick={() => setEditing(t)} aria-label="Editar"><Pencil size={16} /></button>
                  <button className="icon-btn icon-btn--danger" onClick={() => remove(t)} aria-label="Excluir"><Trash2 size={16} /></button>
                </div>
              )}
            </li>
          ))}
          {items.length === 0 && <p className="adm-empty">Nada cadastrado ainda.</p>}
        </ul>
      )}
      {editing && (
        <Editor<T>
          title={editing.id ? `Editar: ${itemTitle(editing)}` : newItem}
          path={path}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
          onError={handle}
          render={(v, set, f) => render(v, set, f, handle)}
        />
      )}
    </section>
  );
}

/* ---------------- Serviços e preços ---------------- */
type ServiceRow = WithId & {
  slug: string; category: string; name: string; description: string; price_cents: number | null; price_from: boolean;
  hosting_cents: number | null; scope: string[]; highlight: boolean;
};
const CATS = [
  { value: "presenca", label: "Sites e presença digital" },
  { value: "comercial", label: "Lojas e sistemas comerciais" },
  { value: "profissional", label: "Sistemas profissionais" },
];
const catLabel = (c: string) => CATS.find((x) => x.value === c)?.label ?? c;

export function ServicesView({ canEdit, onUnauthorized }: { canEdit: boolean; onUnauthorized: () => void }) {
  return (
    <ListView<ServiceRow>
      path="/services"
      canEdit={canEdit}
      onUnauthorized={onUnauthorized}
      intro="Preços de desenvolvimento, renovação anual da hospedagem e o que cada plano inclui."
      newItem="Novo serviço"
      itemTitle={(s) => s.name}
      empty={{ id: 0, active: true, sort: 0, slug: "", category: "presenca", name: "", description: "", price_cents: 0, price_from: false, hosting_cents: null, scope: [], highlight: false }}
      columns={(s) => (
        <>
          <b>{s.name}{s.highlight && <span className="pill">Destaque</span>}</b>
          <small>{catLabel(s.category)} · {s.price_cents == null ? "Sob orçamento" : `${s.price_from ? "A partir de " : ""}${money(s.price_cents)}`} · renovação {s.hosting_cents == null ? "sob orçamento" : `${money(s.hosting_cents)}/ano`}</small>
        </>
      )}
      render={(v, set, f) => (
        <>
          <TextField label="Nome" value={v.name} onChange={(x) => set("name", x)} error={f.name} />
          <TextField label="Identificador (URL)" value={v.slug} onChange={(x) => set("slug", x.toLowerCase())} error={f.slug} hint="Ex.: loja-virtual" />
          <SelectField label="Categoria" value={v.category} onChange={(x) => set("category", x)} options={CATS} error={f.category} />
          <TextField label="Descrição curta" value={v.description} onChange={(x) => set("description", x)} error={f.description} />
          <MoneyField label="Preço de desenvolvimento" value={v.price_cents} onChange={(x) => set("price_cents", x)} allowEmpty error={f.price_cents} />
          <MoneyField label="Renovação anual da hospedagem" value={v.hosting_cents} onChange={(x) => set("hosting_cents", x)} allowEmpty error={f.hosting_cents} />
          <LinesField full label="O que está incluído (escopo e limites)" value={v.scope} onChange={(x) => set("scope", x)} rows={6} error={f.scope} />
          <div className="field--full row-2">
            <Toggle label='Mostrar "A partir de"' checked={v.price_from} onChange={(c) => set("price_from", c)} />
            <Toggle label='Destacar como "Mais procurado"' checked={v.highlight} onChange={(c) => set("highlight", c)} />
          </div>
        </>
      )}
    />
  );
}

/* ---------------- Projetos ---------------- */
type ProjectRow = WithId & {
  slug: string; client: string; title: string; segment: string; summary: string; url: string | null; features: string[];
  theme: string; logo_url: string | null; cover_url: string | null; mobile_url: string | null; gallery: string[]; video_url: string | null;
};
const THEMES = [
  { value: "padrao", label: "Padrão (azul Raster)" },
  { value: "beleza", label: "Beleza (rosa e dourado)" },
  { value: "industrial", label: "Industrial (grafite e amarelo)" },
];

export function ProjectsView({ canEdit, onUnauthorized }: { canEdit: boolean; onUnauthorized: () => void }) {
  return (
    <ListView<ProjectRow>
      path="/projects"
      canEdit={canEdit}
      onUnauthorized={onUnauthorized}
      intro="Projetos exibidos na seção “Projetos de sucesso”. Use apenas projetos reais e autorizados."
      newItem="Novo projeto"
      itemTitle={(p) => p.client}
      empty={{ id: 0, active: true, sort: 0, slug: "", client: "", title: "", segment: "", summary: "", url: null, features: [], theme: "padrao", logo_url: null, cover_url: null, mobile_url: null, gallery: [], video_url: null }}
      columns={(p) => (
        <div className="card-row__with-img">
          {p.cover_url && <img src={p.cover_url} alt="" />}
          <div><b>{p.client}</b><small>{p.title} · {p.segment}</small></div>
        </div>
      )}
      render={(v, set, f, onError) => (
        <>
          <TextField label="Cliente" value={v.client} onChange={(x) => set("client", x)} error={f.client} />
          <TextField label="Identificador (URL)" value={v.slug} onChange={(x) => set("slug", x.toLowerCase())} error={f.slug} hint="Ex.: amanda-cosmeticos" />
          <TextField label="Tipo de projeto" value={v.title} onChange={(x) => set("title", x)} error={f.title} hint="Ex.: Loja virtual" />
          <TextField label="Segmento" value={v.segment} onChange={(x) => set("segment", x)} error={f.segment} />
          <TextField full area label="Resumo" value={v.summary} onChange={(x) => set("summary", x)} error={f.summary} />
          <TextField label="Site do projeto" value={v.url ?? ""} onChange={(x) => set("url", x || null)} error={f.url} hint="https://..." />
          <SelectField label="Identidade visual do card" value={v.theme} onChange={(x) => set("theme", x)} options={THEMES} />
          <LinesField full label="Destaques (somente o que existe no projeto)" value={v.features} onChange={(x) => set("features", x)} error={f.features} />
          <ImageField label="Logotipo original" light value={v.logo_url} onChange={(x) => set("logo_url", x)} onError={onError} error={f.logo_url} />
          <ImageField label="Imagem no computador" value={v.cover_url} onChange={(x) => set("cover_url", x)} onError={onError} error={f.cover_url} />
          <ImageField label="Imagem no celular" value={v.mobile_url} onChange={(x) => set("mobile_url", x)} onError={onError} error={f.mobile_url} />
          <TextField label="Vídeo de depoimento (link de incorporação)" value={v.video_url ?? ""} onChange={(x) => set("video_url", x || null)} error={f.video_url} hint="https://www.youtube-nocookie.com/embed/..." />
        </>
      )}
    />
  );
}

/* ---------------- Marcas ---------------- */
type BrandRow = WithId & { name: string; logo_url: string; url: string | null; relation: string };

export function BrandsView({ canEdit, onUnauthorized }: { canEdit: boolean; onUnauthorized: () => void }) {
  return (
    <ListView<BrandRow>
      path="/brands"
      canEdit={canEdit}
      onUnauthorized={onUnauthorized}
      intro="Logotipos originais exibidos na faixa animada. Use somente marcas autorizadas."
      newItem="Nova marca"
      itemTitle={(b) => b.name}
      empty={{ id: 0, active: true, sort: 0, name: "", logo_url: "", url: null, relation: "Cliente" }}
      columns={(b) => (
        <div className="card-row__with-img">
          {b.logo_url && <img className="logo-thumb" src={b.logo_url} alt="" />}
          <div><b>{b.name}</b><small>{b.relation}</small></div>
        </div>
      )}
      render={(v, set, f, onError) => (
        <>
          <TextField label="Nome da marca" value={v.name} onChange={(x) => set("name", x)} error={f.name} />
          <TextField label="Relação" value={v.relation} onChange={(x) => set("relation", x)} hint="Ex.: Cliente · Loja virtual" />
          <TextField label="Site" value={v.url ?? ""} onChange={(x) => set("url", x || null)} error={f.url} />
          <ImageField full label="Logotipo original" light value={v.logo_url || null} onChange={(x) => set("logo_url", x ?? "")} onError={onError} error={f.logo_url} />
        </>
      )}
    />
  );
}
