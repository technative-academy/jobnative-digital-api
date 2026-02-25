// File overview: Encapsulates user data access so controllers/services stay focused on API behavior.

// Keep SQL statements in the repository so HTTP layers stay focused on requests
// and responses. This separation makes the code easier to test and maintain.
import pool from '../db/pool';

interface UserRow {
  id: number;
  name: string;
  email: string | null;
}

interface CreateUserInput {
  name: string;
  email: string | null;
}

async function getAll(): Promise<UserRow[]> {
  const result = await pool.query<UserRow>('SELECT id, name, email FROM users ORDER BY id ASC');
  return result.rows;
}

async function create({ name, email }: CreateUserInput): Promise<UserRow> {
  // Use parameter placeholders ($1, $2) so pg binds values safely.
  const result = await pool.query<UserRow>(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
    [name, email]
  );

  return result.rows[0];
}

export default {
  getAll,
  create
};

