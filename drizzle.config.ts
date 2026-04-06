import { defineConfig } from "drizzle-kit";

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

const url =
  DATABASE_URL ??
  (PGHOST && PGDATABASE && PGUSER && PGPASSWORD
    ? `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT || 5432}/${PGDATABASE}?sslmode=require`
    : null);

if (!url) {
  throw new Error(
    "Database credentials not found. Set DATABASE_URL or provision a database (PGHOST, PGDATABASE, PGUSER, PGPASSWORD).",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});
