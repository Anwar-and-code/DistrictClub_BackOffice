/**
 * One-time migration runner — runs SQL directly against Supabase DB
 * Usage: node scripts/run-migration.mjs <DB_PASSWORD>
 *
 * Get your DB password from:
 * Supabase Dashboard → Project Settings → Database → Database password
 */

import { readFileSync } from "fs"
import { createConnection } from "net"

const PROJECT_REF = "vslisxnahktqaifdurcu"
const DB_HOST = `db.${PROJECT_REF}.supabase.co`
const DB_PORT = 5432
const DB_NAME = "postgres"
const DB_USER = "postgres"
const DB_PASSWORD = process.argv[2]

if (!DB_PASSWORD) {
  console.error("Usage: node scripts/run-migration.mjs <DB_PASSWORD>")
  console.error("Get your DB password from: Supabase Dashboard → Settings → Database")
  process.exit(1)
}

const sql = readFileSync(
  new URL("../supabase/migrations/20250225_ensure_payment_details_tables.sql", import.meta.url),
  "utf8"
)

// Use pg (node-postgres) if available, otherwise print instructions
let pg
try {
  pg = await import("pg")
} catch {
  console.error("Installing pg package...")
  const { execSync } = await import("child_process")
  execSync("npm install pg --no-save", { stdio: "inherit" })
  pg = await import("pg")
}

const { default: { Client } } = pg

const client = new Client({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

try {
  console.log(`Connecting to ${DB_HOST}...`)
  await client.connect()
  console.log("Connected. Running migration...")
  await client.query(sql)
  console.log("✓ Migration completed successfully!")
} catch (err) {
  console.error("✗ Migration failed:", err.message)
  process.exit(1)
} finally {
  await client.end()
}
