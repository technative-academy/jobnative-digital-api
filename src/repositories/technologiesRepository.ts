// File overview: Encapsulates technology query logic used for company filter UIs.

import pool from '../db/pool';

export interface TechnologyRow {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  approvedCompanyCount: number;
}

interface UpdateTechnologyInput {
  name?: string;
  slug?: string;
}

const technologyFieldsSql = `
  SELECT
    t.id,
    t.name,
    t.slug,
    t.created_at AS "createdAt",
    COUNT(DISTINCT c.id)::int AS "approvedCompanyCount"
  FROM technologies t
  LEFT JOIN company_technologies ct ON ct.technology_id = t.id
  LEFT JOIN companies c ON c.id = ct.company_id AND c.status = 'approved'
`;

async function list(): Promise<TechnologyRow[]> {
  const result = await pool.query<TechnologyRow>(
    `
      ${technologyFieldsSql}
      GROUP BY t.id
      ORDER BY t.name ASC
    `
  );

  return result.rows;
}

async function getById(id: number): Promise<TechnologyRow | null> {
  const result = await pool.query<TechnologyRow>(
    `
      ${technologyFieldsSql}
      WHERE t.id = $1
      GROUP BY t.id
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function updateById(id: number, input: UpdateTechnologyInput): Promise<TechnologyRow | null> {
  const setClauses: string[] = [];
  const values: string[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    setClauses.push(`name = $${values.length}`);
  }

  if (input.slug !== undefined) {
    values.push(input.slug);
    setClauses.push(`slug = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return getById(id);
  }

  values.push(String(id));
  const result = await pool.query<{ id: number }>(
    `
      UPDATE technologies
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
      RETURNING id
    `,
    values
  );

  const updatedId = result.rows[0]?.id;
  if (!updatedId) {
    return null;
  }

  return getById(updatedId);
}

async function deleteById(id: number): Promise<boolean> {
  const result = await pool.query(
    `
      DELETE FROM technologies
      WHERE id = $1
    `,
    [id]
  );

  return result.rowCount !== null && result.rowCount > 0;
}

export default {
  list,
  getById,
  updateById,
  deleteById
};
