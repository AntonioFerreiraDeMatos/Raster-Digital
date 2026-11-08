import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  charset: "utf8mb4",
  timezone: "Z", // datas sempre em UTC no banco
  multipleStatements: false,
});
