// File overview: Encapsulates user data access so controllers/services stay focused on API behavior.

import pool from '../db/pool';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export type SafeUserRow = Omit<UserRow, 'passwordHash'>;

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

const safeFields = `id, name, email, role, created_at AS "createdAt", updated_at AS "updatedAt"`;
const allFields = `id, name, email, password_hash AS "passwordHash", role, created_at AS "createdAt", updated_at AS "updatedAt"`;

async function getAll(): Promise<SafeUserRow[]> {
  const result = await pool.query<SafeUserRow>(
    `SELECT ${safeFields} FROM users ORDER BY id ASC`
  );
  return result.rows;
}

async function getById(id: number): Promise<SafeUserRow | null> {
  const result = await pool.query<SafeUserRow>(
    `SELECT ${safeFields} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

async function getByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT ${allFields} FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

async function create({ name, email, passwordHash }: CreateUserInput): Promise<SafeUserRow> {
  const result = await pool.query<SafeUserRow>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING ${safeFields}`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

export default {
  getAll,
  getById,
  getByEmail,
  create
};
