// Cria o primeiro administrador a partir das variáveis ADMIN_* quando ainda não existe nenhum.
// Não altera usuários existentes. Depois do primeiro acesso, as variáveis podem ser removidas.
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

export async function bootstrapAdmin() {
  const { ADMIN_NAME = "Administrador", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (ADMIN_PASSWORD.length < 10) return console.warn("[admin] ADMIN_PASSWORD curta demais; usuário não criado.");
  const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM admin_users");
  if (Number(n) > 0) return;
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.query("INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [
    ADMIN_NAME,
    ADMIN_EMAIL.toLowerCase(),
    hash,
  ]);
  console.log(`[admin] administrador inicial criado: ${ADMIN_EMAIL}`);
}
