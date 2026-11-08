import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, LogOut, RefreshCw, Search } from "lucide-react";
import { api, ApiError, OPTIONS, SEGMENT_LABEL, SERVICE_LABEL, STATUS_LABEL, formatDate, formatPhone, type LeadSummary, type Status, type User } from "./api";
import LeadDrawer from "./LeadDrawer";

type Stats = { total: number; last7days: number; byStatus: Partial<Record<Status, number>> };
type List = { items: LeadSummary[]; total: number; page: number; pageSize: number };

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api<{ user: User }>("/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="adm-center"><Loader2 className="spin" /></div>;
  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await api<{ user: User }>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
      onLogin(r.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-center">
      <form className="adm-login" onSubmit={submit}>
        <img src="/img/logo.png" alt="Raster Digital" width="160" height="51" />
        <h1>Painel de leads</h1>
        <label className="field">
          <span>E-mail</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-alert" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const KPIS: { key: "total" | Status; label: string }[] = [
  { key: "total", label: "Total de interessados" },
  { key: "novo", label: "Novos leads" },
  { key: "negociacao", label: "Em negociação" },
  { key: "proposta_enviada", label: "Propostas enviadas" },
  { key: "convertido", label: "Clientes convertidos" },
];

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [status, setStatus] = useState("");
  const [segment, setSegment] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");

  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (segment) params.set("segment", segment);
  if (query) params.set("q", query);
  const requestKey = `${params}#${reloadKey}`;
  const loading = loadedKey !== requestKey;
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    const qs = requestKey.split("#")[0];
    Promise.all([api<Stats>("/stats"), api<List>(`/leads?${qs}`)])
      .then(([s, l]) => {
        if (!alive) return;
        setStats(s);
        setList(l);
        setError("");
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) return onLogout();
        setError(err instanceof Error ? err.message : "Erro ao carregar.");
      })
      .finally(() => alive && setLoadedKey(requestKey));
    return () => {
      alive = false;
    };
  }, [requestKey, onLogout]);

  async function logout() {
    await api("/logout", { method: "POST" }).catch(() => {});
    onLogout();
  }

  const pages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;

  return (
    <div className="adm">
      <header className="adm-top">
        <img src="/img/logo.png" alt="Raster Digital" width="130" height="41" />
        <span className="adm-top__title">Painel de leads</span>
        <span className="adm-top__user">{user.name} · {user.role === "admin" ? "Administrador" : "Comercial"}</span>
        <button className="btn btn--ghost btn--sm" onClick={logout}><LogOut size={15} /> Sair</button>
      </header>

      <main className="adm-main">
        <section className="kpis" aria-label="Indicadores">
          {KPIS.map((k) => (
            <button
              key={k.key}
              className={`kpi ${(k.key === "total" ? !status : status === k.key) ? "kpi--active" : ""}`}
              onClick={() => { setStatus(k.key === "total" ? "" : k.key); setPage(1); }}
            >
              <span>{k.label}</span>
              <b>{stats ? (k.key === "total" ? stats.total : stats.byStatus[k.key] ?? 0) : "—"}</b>
            </button>
          ))}
        </section>
        {stats && <p className="adm-muted">{stats.last7days} novo(s) interessado(s) nos últimos 7 dias.</p>}

        <form className="filters" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); setPage(1); }}>
          <label className="field filters__search">
            <span className="sr-only">Buscar</span>
            <Search size={16} />
            <input placeholder="Buscar por nome, empresa, e-mail ou WhatsApp" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="field">
            <span className="sr-only">Situação</span>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">Todas as situações</option>
              {OPTIONS.statuses.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="sr-only">Segmento</span>
            <select value={segment} onChange={(e) => { setSegment(e.target.value); setPage(1); }}>
              <option value="">Todos os segmentos</option>
              {OPTIONS.segments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <button className="btn btn--outline" type="submit">Buscar</button>
          <button className="btn btn--ghost" type="button" onClick={load} aria-label="Atualizar"><RefreshCw size={16} className={loading ? "spin" : ""} /></button>
        </form>

        {error && <p className="form-alert" role="alert">{error}</p>}

        <div className="leads-table" role="table" aria-label="Leads">
          <div className="leads-row leads-row--head" role="row">
            <span role="columnheader">Interessado</span>
            <span role="columnheader">Segmento / serviço</span>
            <span role="columnheader">WhatsApp</span>
            <span role="columnheader">Origem</span>
            <span role="columnheader">Cadastro</span>
            <span role="columnheader">Situação</span>
          </div>
          {list?.items.map((l) => (
            <button key={l.id} className="leads-row" role="row" onClick={() => setOpenId(l.id)}>
              <span role="cell" className="leads-row__name">
                <b>{l.name}</b>
                <small>{l.company} · {l.email}</small>
              </span>
              <span role="cell"><b className="m-label">Segmento: </b>{SEGMENT_LABEL[l.segment]}<small>{SERVICE_LABEL[l.service]}</small></span>
              <span role="cell"><b className="m-label">WhatsApp: </b>{formatPhone(l.whatsapp)}</span>
              <span role="cell"><b className="m-label">Origem: </b>{l.source}{l.submissions > 1 && <small>{l.submissions} envios</small>}</span>
              <span role="cell"><b className="m-label">Cadastro: </b>{formatDate(l.created_at)}</span>
              <span role="cell"><span className={`status status--${l.status}`}>{STATUS_LABEL[l.status]}</span></span>
            </button>
          ))}
          {list && list.items.length === 0 && <p className="adm-empty">Nenhum lead encontrado com esses filtros.</p>}
        </div>

        {list && pages > 1 && (
          <nav className="pager" aria-label="Paginação">
            <button className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
            <span>Página {page} de {pages}</span>
            <button className="btn btn--ghost btn--sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
          </nav>
        )}
      </main>

      {openId !== null && (
        <LeadDrawer
          id={openId}
          canDelete={user.role === "admin"}
          onClose={() => setOpenId(null)}
          onChanged={load}
          onUnauthorized={onLogout}
        />
      )}
    </div>
  );
}
