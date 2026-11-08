import { useState, type ReactNode } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { uploadImage } from "./api";

type Base = { label: string; error?: string; hint?: string; full?: boolean };

function Wrap({ label, error, hint, full, children }: Base & { children: ReactNode }) {
  return (
    <label className={`field ${full ? "field--full" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

export function TextField({ value, onChange, area, rows = 3, ...b }: Base & { value: string; onChange: (v: string) => void; area?: boolean; rows?: number }) {
  return (
    <Wrap {...b}>
      {area ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!b.error} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!b.error} />
      )}
    </Wrap>
  );
}

/** Lista de textos, um por linha. */
export function LinesField({ value, onChange, rows = 4, ...b }: Base & { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <Wrap {...b} hint={b.hint ?? "Um item por linha."}>
      <textarea
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
        }}
        aria-invalid={!!b.error}
      />
    </Wrap>
  );
}

/** Valor em reais (guardado em centavos). Vazio = sob orçamento (null). */
export function MoneyField({ value, onChange, allowEmpty, ...b }: Base & { value: number | null; onChange: (v: number | null) => void; allowEmpty?: boolean }) {
  const [text, setText] = useState(value == null ? "" : (value / 100).toFixed(2).replace(".", ","));
  return (
    <Wrap {...b} hint={b.hint ?? (allowEmpty ? "Deixe vazio para \"sob orçamento\"." : undefined)}>
      <div className="money-input">
        <span>R$</span>
        <input
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d,.]/g, "");
            setText(t);
            if (t === "") return onChange(allowEmpty ? null : 0);
            const n = Number(t.replace(/\./g, "").replace(",", "."));
            if (Number.isFinite(n)) onChange(Math.round(n * 100));
          }}
          aria-invalid={!!b.error}
        />
      </div>
    </Wrap>
  );
}

export function NumberField({ value, onChange, ...b }: Base & { value: number; onChange: (v: number) => void }) {
  return (
    <Wrap {...b}>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </Wrap>
  );
}

export function SelectField({ value, onChange, options, ...b }: Base & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Wrap {...b}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!b.error}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/** Imagem: envia arquivo (guardado no banco) ou aceita um caminho/URL. */
export function ImageField({ value, onChange, onError, light, ...b }: Base & { value: string | null; onChange: (v: string | null) => void; onError: (e: unknown) => void; light?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className={`field img-field ${b.full ? "field--full" : ""}`}>
      <span>{b.label}</span>
      <div className="img-field__row">
        <div className={`img-field__preview ${light ? "img-field__preview--light" : ""}`}>
          {value ? <img src={value} alt="" /> : <small>Sem imagem</small>}
        </div>
        <div className="img-field__actions">
          <label className="btn btn--ghost btn--sm">
            {busy ? <Loader2 size={15} className="spin" /> : <ImageUp size={15} />} Enviar imagem
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                try {
                  onChange(await uploadImage(file));
                } catch (err) {
                  onError(err);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {value && <button type="button" className="link" onClick={() => onChange(null)}>Remover</button>}
        </div>
      </div>
      <input className="img-field__url" placeholder="/img/... ou https://..." value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} aria-label={`${b.label} — endereço`} />
      {b.error && <span className="field__error">{b.error}</span>}
    </div>
  );
}
