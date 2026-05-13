import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
  throw new Error(
    "Database credentials not found. Did you forget to provision a database?",
  );
}

const databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT || 5432}/${PGDATABASE}?sslmode=require`;

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });

const SEED_EMAILS = ["info@arcside.co.za", "caitywills16@gmail.com"];
const ADMIN_EMAILS = ["info@arcside.co.za", "arcside.group@gmail.com"];

export async function initializeWhitelist(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR NOT NULL UNIQUE,
        added_by VARCHAR,
        added_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (const email of SEED_EMAILS) {
      await client.query(
        `INSERT INTO whitelist (email, added_by) VALUES ($1, 'system') ON CONFLICT (email) DO NOTHING`,
        [email]
      );
    }

    console.log("[DB] Whitelist table ready.");
  } finally {
    client.release();
  }
}

/**
 * Idempotent schema patch — adds any columns that exist in the Drizzle schema
 * but may be missing from older database instances (dev or prod). Safe to run
 * on every startup; each ALTER TABLE is guarded by IF NOT EXISTS.
 */
export async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    // Add role column if missing (was added post-initial-deploy)
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user'
    `);

    // Seed known admins
    for (const email of ADMIN_EMAILS) {
      await client.query(
        `UPDATE users SET role = 'admin' WHERE email = $1 AND (role IS NULL OR role != 'admin')`,
        [email]
      );
    }

    console.log("[DB] Schema patch applied — role column ready.");
  } catch (err) {
    // Non-fatal: log but don't crash startup if users table doesn't exist yet
    console.warn("[DB] ensureSchema warning:", (err as Error).message);
  } finally {
    client.release();
  }
}
