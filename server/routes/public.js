import { Router } from "express";
import { pool } from "../config/db.js";
import { getPublicContent } from "../lib/content.js";

export const apiPublic = Router();

apiPublic.get("/content", async (_req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=60");
    res.json(await getPublicContent());
  } catch (err) {
    next(err);
  }
});

/** Imagens enviadas pelo painel (guardadas no banco para sobreviver aos deploys). */
export const media = Router();
media.get("/:id", async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) return res.status(404).end();
    const [[img]] = await pool.query("SELECT mime, data FROM images WHERE id = ?", [id]);
    if (!img) return res.status(404).end();
    res.set({ "Content-Type": img.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" });
    res.send(img.data);
  } catch (err) {
    next(err);
  }
});
