import dotenv from "dotenv";

dotenv.config({ quiet: true });

const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  port: Number(process.env.PORT || 3000),
  db: {
    // Node deve usar 127.0.0.1: "localhost" pode resolver para IPv6 (::1)
    host: !process.env.DB_HOST || process.env.DB_HOST === "localhost" ? "127.0.0.1" : process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  },
  jwtSecret: process.env.JWT_SECRET,
  // Atrás do proxy da Hostinger, o IP real chega via X-Forwarded-For
  trustProxy: process.env.TRUST_PROXY ?? "1",
  privacyVersion: "2026-11",
  // Integração com o CRM do ERP (opcional: sem as duas variáveis, fica desligada)
  erp: {
    url: process.env.ERP_LEADS_URL || "",
    token: process.env.ERP_LEADS_TOKEN || "",
  },
};

export function assertEnv() {
  const missing = ["DB_USER", "DB_NAME", "JWT_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis de ambiente ausentes: ${missing.join(", ")}`);
  if (env.jwtSecret.length < 32) throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres");
}
