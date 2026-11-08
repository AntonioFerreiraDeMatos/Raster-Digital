import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const COOKIE = "raster_admin";

export function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

export function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, env.jwtSecret, { expiresIn: "8h" });
}

/** Exige sessão válida. Também exige cabeçalho X-Requested-With (proteção extra contra CSRF). */
export function requireAdmin(req, res, next) {
  if (req.get("x-requested-with") !== "raster-admin") return res.status(403).json({ error: "Requisição inválida." });
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
  try {
    const p = jwt.verify(token, env.jwtSecret);
    req.admin = { id: p.sub, role: p.role, name: p.name };
    next();
  } catch {
    res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
  }
}

export function requireRole(role) {
  return (req, res, next) => (req.admin?.role === role ? next() : res.status(403).json({ error: "Você não tem permissão para esta ação." }));
}
