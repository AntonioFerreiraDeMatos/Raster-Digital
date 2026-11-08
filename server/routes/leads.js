import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { validateLead, clip } from "../lib/validation.js";

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos ou fale conosco pelo WhatsApp." },
});

const MIN_FILL_MS = 3000; // humanos levam mais que 3s para preencher o formulário
const DUPLICATE_WINDOW_HOURS = 24;

router.post("/", limiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // Anti-spam: honeypot + tempo mínimo de preenchimento. Bots recebem "sucesso" silencioso.
    const startedAt = Number(body.startedAt);
    if (clip(body.website, 200) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
      return res.status(201).json({ ok: true });
    }

    const { data, errors } = validateLead(body);
    if (body.consent !== true) errors.consent = "É necessário autorizar o contato para continuar.";
    if (Object.keys(errors).length) {
      return res.status(422).json({ error: "Revise os campos destacados.", fields: errors });
    }

    const utmSource = clip(body.utm_source, 120);
    const referrer = clip(body.referrer, 500);
    const origin = {
      source: utmSource || (referrer ? safeHost(referrer) : "") || "site",
      utm_source: utmSource || null,
      utm_medium: clip(body.utm_medium, 120) || null,
      utm_campaign: clip(body.utm_campaign, 120) || null,
      landing_path: clip(body.landingPath, 255) || null,
      referrer: referrer || null,
    };

    // Evita duplicados: mesmo e-mail ou WhatsApp nas últimas 24h vira "reenvio" no lead existente.
    const [dups] = await pool.query(
      `SELECT id FROM leads
       WHERE (email = ? OR whatsapp = ?) AND created_at >= UTC_TIMESTAMP() - INTERVAL ? HOUR
       ORDER BY id DESC LIMIT 1`,
      [data.email, data.whatsapp, DUPLICATE_WINDOW_HOURS]
    );
    if (dups.length) {
      const id = dups[0].id;
      const note = `Novo envio do formulário (serviço: ${data.service}; segmento: ${data.segment})` +
        (data.message ? `\n\n${data.message}` : "");
      await pool.query("UPDATE leads SET submissions = submissions + 1 WHERE id = ?", [id]);
      await pool.query("INSERT INTO lead_events (lead_id, type, body) VALUES (?, 'reenvio', ?)", [id, note]);
      return res.status(200).json({ ok: true, duplicate: true });
    }

    const [r] = await pool.query(
      `INSERT INTO leads (name, company, whatsapp, email, segment, service, message, consent_at, privacy_version,
         source, utm_source, utm_medium, utm_campaign, landing_path, referrer, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, data.company, data.whatsapp, data.email, data.segment, data.service, data.message || null,
        env.privacyVersion, origin.source, origin.utm_source, origin.utm_medium, origin.utm_campaign,
        origin.landing_path, origin.referrer, (req.ip || "").slice(0, 45) || null,
        clip(req.get("user-agent"), 255) || null,
      ]
    );
    await pool.query("INSERT INTO lead_events (lead_id, type, to_status) VALUES (?, 'criado', 'novo')", [r.insertId]);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").slice(0, 120);
  } catch {
    return "";
  }
}

export default router;
