// File overview: Runs db/seed.sql to insert starter rows into the database.

require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

// Read db/seed.sql and run it to insert starter data.
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
    // Loading SQL from a file keeps sample data updates easy to review.
    const seedPath = path.join(process.cwd(), 'db', 'seed.sql');
    const seedSql = await fs.readFile(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('Database seed applied.');
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  // Exit with a non-zero status so npm reports the script as failed.
  console.error(error.message);
  process.exit(1);
});
