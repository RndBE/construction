import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Singleton pattern for connection pool
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

function getPool() {
  if (!globalForDb.pool) {
    globalForDb.pool = mysql.createPool({
      host: process.env.DATABASE_HOST || "localhost",
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "madiun2001",
      database: process.env.DATABASE_NAME || "konstruksi",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return globalForDb.pool;
}

export const pool = getPool();
export const db = drizzle(pool, { schema, mode: "default" });
