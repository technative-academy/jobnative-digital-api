// File overview: Encapsulates comment data access so controllers/services stay focused on API behavior.

import pool from '../db/pool';

interface CommentRow {
  id: number;
  company_id: number;
  user_id: number;
  body: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateCommentInput {
  companyId: number;
  userId: number;
  body: string;
}

interface UpdateCommentInput {
  id: number;
  userId: number;
  body: string;
}

async function getByCompanyId(companyId: number): Promise<CommentRow[]> {
  const result = await pool.query<CommentRow>(
    `
    SELECT id, company_id, user_id, body, created_at, updated_at
    FROM comments
    WHERE company_id = $1
    ORDER BY created_at DESC
    `,
    [companyId]
  );

  return result.rows;
}

async function create({ companyId, userId, body }: CreateCommentInput): Promise<CommentRow> {
  const result = await pool.query<CommentRow>(
    `
    INSERT INTO comments (company_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING id, company_id, user_id, body, created_at, updated_at
    `,
    [companyId, userId, body]
  );

  return result.rows[0];
}

async function update({ id, userId, body }: UpdateCommentInput): Promise<CommentRow | null> {
  const result = await pool.query<CommentRow>(
    `
    UPDATE comments
    SET body = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, company_id, user_id, body, created_at, updated_at
    `,
    [body, id, userId]
  );

  return result.rows[0] ?? null;
}

async function remove(id: number, userId: number): Promise<void> {
  await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId]
  );
}

export default {
  getByCompanyId,
  create,
  update,
  remove
};