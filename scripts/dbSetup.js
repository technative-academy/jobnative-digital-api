// File overview: Runs db/schema.sql to create or reset database tables.

require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

// Read db/schema.sql and apply it to the configured database.
async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not set.');
    console.error('Make sure you have a .env file with DATABASE_URL defined.');
    console.error('You can copy .env.example to .env to get started.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Loading SQL from a file keeps schema changes visible in version control.
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema applied.');
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  // Exit with a non-zero status so npm reports the script as failed.
  console.error(error.message);
  process.exit(1);
});
