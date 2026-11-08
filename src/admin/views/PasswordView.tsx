import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError } from "../api";

export default function PasswordView({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk(false);
    if (next !== confirm) return setFields({ confirm: "As senhas não conferem." });
    setBusy(true);
    setFields({});
    try {
      await api("/password", { method: "POST", body: JSON.stringify({ current, next }) });
      setOk(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      setFields(err instanceof ApiError && err.fields ? err.fields : { next: err instanceof Error ? err.message : "Erro." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="pw-form" onSubmit={submit}>
      <p className="adm-muted">Use pelo menos 10 caracteres. Evite reutilizar senhas de outros serviços.</p>
      <label className="field"><span>Senha atual</span><input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />{fields.current && <span className="field__error">{fields.current}</span>}</label>
      <label className="field"><span>Nova senha</span><input type="password" autoComplete="new-password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} required />{fields.next && <span className="field__error">{fields.next}</span>}</label>
      <label className="field"><span>Confirmar nova senha</span><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />{fields.confirm && <span className="field__error">{fields.confirm}</span>}</label>
      <button className="btn btn--primary btn--sm" disabled={busy}>{busy ? <Loader2 size={15} className="spin" /> : "Alterar senha"}</button>
      {ok && <p className="ok-msg"><CheckCircle2 size={15} /> Senha alterada com sucesso.</p>}
    </form>
  );
}
