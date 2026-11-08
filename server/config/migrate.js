// Migrations idempotentes: cada arquivo .sql roda uma única vez e fica registrado.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "./env.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations");

export async function migrate() {
  const conn = await mysql.createConnection({ ...env.db, multipleStatements: true, charset: "utf8mb4" });
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(190) PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const [rows] = await conn.query("SELECT name FROM schema_migrations");
    const done = new Set(rows.map((r) => r.name));
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await fs.readFile(path.join(dir, file), "utf8");
      await conn.query(sql);
      await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      console.log(`[migrate] aplicada: ${file}`);
    }
  } finally {
    await conn.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(() => console.log("[migrate] ok")).catch((e) => { console.error(e.message); process.exit(1); });
}
