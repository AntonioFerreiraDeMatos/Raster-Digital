// Cria ou redefine um usuário do painel de leads.
// Uso: ADMIN_NAME="Antonio Matos" ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_ROLE=admin|comercial] npm run admin:create
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { migrate } from "../config/migrate.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE = "admin" } = process.env;

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error("Use uma senha com pelo menos 10 caracteres.");
  process.exit(1);
}
if (!["admin", "comercial"].includes(ADMIN_ROLE)) {
  console.error("ADMIN_ROLE deve ser admin ou comercial.");
  process.exit(1);
}

await migrate();
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await pool.query(
  `INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role), active = 1`,
  [ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), hash, ADMIN_ROLE]
);
console.log(`Usuário ${ADMIN_EMAIL} pronto (${ADMIN_ROLE}).`);
await pool.end();
