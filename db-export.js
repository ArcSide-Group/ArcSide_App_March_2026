import pg from 'pg';
import fs from 'fs';

async function exportDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is missing in environment variables!");
    return;
  }

  console.log("Connecting to database and reading tables...");
  const pool = new pg.Pool({ connectionString });

  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    let sqlOutput = "";

    for (const table of tables) {
      console.log(`Exporting data structure and rows for: ${table}`);
      sqlOutput += `\n-- Data for table ${table}\n`;

      const rowsRes = await pool.query(`SELECT * FROM "${table}"`);
      if (rowsRes.rows.length > 0) {
        for (const row of rowsRes.rows) {
          const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return `'${val}'`;
          }).join(', ');

          sqlOutput += `INSERT INTO "${table}" (${keys}) VALUES (${values});\n`;
        }
      }
    }

    fs.writeFileSync('real_production_dump.sql', sqlOutput);
    console.log("Success! 'real_production_dump.sql' has been created with your database records.");
  } catch (err) {
    console.error("Error during database export:", err);
  } finally {
    await pool.end();
  }
}

exportDatabase();