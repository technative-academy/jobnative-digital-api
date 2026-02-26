// File overview: Encapsulates job role query logic used for company filter UIs.

import pool from '../db/pool';

export interface JobRoleRow {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  approvedCompanyCount: number;
}

interface UpdateJobRoleInput {
  name?: string;
  slug?: string;
}

const jobRoleFieldsSql = `
  SELECT
    jr.id,
    jr.name,
    jr.slug,
    jr.created_at AS "createdAt",
    COUNT(DISTINCT c.id)::int AS "approvedCompanyCount"
  FROM job_roles jr
  LEFT JOIN company_job_roles cjr ON cjr.job_role_id = jr.id
  LEFT JOIN companies c ON c.id = cjr.company_id AND c.status = 'approved'
`;

async function list(): Promise<JobRoleRow[]> {
  const result = await pool.query<JobRoleRow>(
    `
      ${jobRoleFieldsSql}
      GROUP BY jr.id
      ORDER BY jr.name ASC
    `
  );

  return result.rows;
}

async function getById(id: number): Promise<JobRoleRow | null> {
  const result = await pool.query<JobRoleRow>(
    `
      ${jobRoleFieldsSql}
      WHERE jr.id = $1
      GROUP BY jr.id
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function updateById(id: number, input: UpdateJobRoleInput): Promise<JobRoleRow | null> {
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
      UPDATE job_roles
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
      DELETE FROM job_roles
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
