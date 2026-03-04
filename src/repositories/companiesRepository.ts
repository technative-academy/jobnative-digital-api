// File overview: Encapsulates company data access and SQL queries for discovery, moderation, and editing.

import type { PoolClient } from 'pg';

import pool from '../db/pool';

export type CompanyStatus = 'pending' | 'approved' | 'rejected';
export type ModerationStatus = 'approved' | 'rejected';

export interface TechnologyRow {
  id: number;
  name: string;
  slug: string;
}

export interface JobRoleRow {
  id: number;
  name: string;
  slug: string;
}

export interface CompanyRow {
  id: number;
  name: string;
  website: string;
  linkedin: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  technologyStack: string[];
  jobRoles: string[];
  technologies: TechnologyRow[];
  jobRoleTags: JobRoleRow[];
  status: CompanyStatus;
  createdByUserId: number | null;
  createdAt: string;
  approvedByUserId: number | null;
  approvedAt: string | null;
}

export interface CompanyFilters {
  search: string;
  location: string;
  technologies: string[];
  jobRoles: string[];
}

export interface AdminCompanyFilters {
  status: CompanyStatus | null;
}

export interface TechnologyInput {
  name: string;
  slug: string;
}

export interface JobRoleInput {
  name: string;
  slug: string;
}

export interface CreateCompanyInput {
  name: string;
  website: string;
  linkedin: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  technologies: TechnologyInput[];
  jobRoles: JobRoleInput[];
  createdByUserId: number | null;
}

export interface UpdateCompanyInput {
  name?: string;
  website?: string;
  linkedin?: string | null;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
  technologies?: TechnologyInput[];
  jobRoles?: JobRoleInput[];
}

const companyFieldsSql = `
  SELECT
    c.id,
    c.name,
    c.website,
    c.linkedin,
    c.industry,
    c.location,
    c.description,
    COALESCE(technology_data."technologyStack", ARRAY[]::text[]) AS "technologyStack",
    COALESCE(role_data."jobRoles", ARRAY[]::text[]) AS "jobRoles",
    COALESCE(technology_data.technologies, '[]'::json) AS technologies,
    COALESCE(role_data."jobRoleTags", '[]'::json) AS "jobRoleTags",
    c.status,
    c.created_by_user_id AS "createdByUserId",
    c.created_at AS "createdAt",
    c.approved_by_user_id AS "approvedByUserId",
    c.approved_at AS "approvedAt"
  FROM companies c
  LEFT JOIN LATERAL (
    SELECT
      array_agg(t.slug ORDER BY t.slug) AS "technologyStack",
      json_agg(
        json_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        )
        ORDER BY t.slug
      ) AS technologies
    FROM company_technologies ct
    JOIN technologies t ON t.id = ct.technology_id
    WHERE ct.company_id = c.id
  ) AS technology_data ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      array_agg(jr.slug ORDER BY jr.slug) AS "jobRoles",
      json_agg(
        json_build_object(
          'id', jr.id,
          'name', jr.name,
          'slug', jr.slug
        )
        ORDER BY jr.slug
      ) AS "jobRoleTags"
    FROM company_job_roles cjr
    JOIN job_roles jr ON jr.id = cjr.job_role_id
    WHERE cjr.company_id = c.id
  ) AS role_data ON TRUE
`;

async function getByIdWithClient(client: PoolClient, id: number): Promise<CompanyRow | null> {
  const result = await client.query<CompanyRow>(
    `
      ${companyFieldsSql}
      WHERE c.id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function getApproved({
  search,
  location,
  technologies,
  jobRoles
}: CompanyFilters): Promise<CompanyRow[]> {
  const result = await pool.query<CompanyRow>(
    `
      ${companyFieldsSql}
      WHERE c.status = 'approved'
        AND ($1::text = '' OR c.name ILIKE '%' || $1 || '%')
        AND ($2::text = '' OR COALESCE(c.location, '') ILIKE '%' || $2 || '%')
        AND (
          cardinality($3::text[]) = 0
          OR EXISTS (
            SELECT 1
            FROM company_technologies ct
            JOIN technologies t ON t.id = ct.technology_id
            WHERE ct.company_id = c.id
              AND t.slug = ANY ($3::text[])
          )
        )
        AND (
          cardinality($4::text[]) = 0
          OR EXISTS (
            SELECT 1
            FROM company_job_roles cjr
            JOIN job_roles jr ON jr.id = cjr.job_role_id
            WHERE cjr.company_id = c.id
              AND jr.slug = ANY ($4::text[])
          )
        )
      ORDER BY c.name ASC
    `,
    [search, location, technologies, jobRoles]
  );

  return result.rows;
}

async function getAll({ status }: AdminCompanyFilters): Promise<CompanyRow[]> {
  const result = await pool.query<CompanyRow>(
    `
      ${companyFieldsSql}
      WHERE ($1::text IS NULL OR c.status = $1::text)
      ORDER BY c.created_at DESC
    `,
    [status]
  );

  return result.rows;
}

async function getById(id: number): Promise<CompanyRow | null> {
  const client = await pool.connect();

  try {
    return getByIdWithClient(client, id);
  } finally {
    client.release();
  }
}

async function getApprovedById(id: number): Promise<CompanyRow | null> {
  const result = await pool.query<CompanyRow>(
    `
      ${companyFieldsSql}
      WHERE c.id = $1
        AND c.status = 'approved'
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function upsertTechnology(client: PoolClient, technology: TechnologyInput): Promise<number> {
  const result = await client.query<{ id: number }>(
    `
      INSERT INTO technologies (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `,
    [technology.name, technology.slug]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Failed to upsert technology.');
  }

  return row.id;
}

async function upsertJobRole(client: PoolClient, jobRole: JobRoleInput): Promise<number> {
  const result = await client.query<{ id: number }>(
    `
      INSERT INTO job_roles (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `,
    [jobRole.name, jobRole.slug]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Failed to upsert job role.');
  }

  return row.id;
}

async function replaceCompanyTechnologies(
  client: PoolClient,
  companyId: number,
  technologies: TechnologyInput[]
) {
  await client.query(
    `
      DELETE FROM company_technologies
      WHERE company_id = $1
    `,
    [companyId]
  );

  if (technologies.length === 0) {
    return;
  }

  for (const technology of technologies) {
    const technologyId = await upsertTechnology(client, technology);
    await client.query(
      `
        INSERT INTO company_technologies (company_id, technology_id)
        VALUES ($1, $2)
        ON CONFLICT (company_id, technology_id) DO NOTHING
      `,
      [companyId, technologyId]
    );
  }
}

async function replaceCompanyJobRoles(
  client: PoolClient,
  companyId: number,
  jobRoles: JobRoleInput[]
) {
  await client.query(
    `
      DELETE FROM company_job_roles
      WHERE company_id = $1
    `,
    [companyId]
  );

  if (jobRoles.length === 0) {
    return;
  }

  for (const jobRole of jobRoles) {
    const jobRoleId = await upsertJobRole(client, jobRole);
    await client.query(
      `
        INSERT INTO company_job_roles (company_id, job_role_id)
        VALUES ($1, $2)
        ON CONFLICT (company_id, job_role_id) DO NOTHING
      `,
      [companyId, jobRoleId]
    );
  }
}

async function createPending(input: CreateCompanyInput): Promise<CompanyRow> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const createResult = await client.query<{ id: number }>(
      `
        INSERT INTO companies (
          name,
          website,
          linkedin,
          industry,
          location,
          description,
          status,
          created_by_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
        RETURNING id
      `,
      [
        input.name,
        input.website,
        input.linkedin,
        input.industry,
        input.location,
        input.description,
        input.createdByUserId
      ]
    );

    const createdCompanyId = createResult.rows[0]?.id;

    if (!createdCompanyId) {
      throw new Error('Failed to create company.');
    }

    await replaceCompanyTechnologies(client, createdCompanyId, input.technologies);
    await replaceCompanyJobRoles(client, createdCompanyId, input.jobRoles);

    const createdCompany = await getByIdWithClient(client, createdCompanyId);

    if (!createdCompany) {
      throw new Error('Failed to load created company.');
    }

    await client.query('COMMIT');
    return createdCompany;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getPending(): Promise<CompanyRow[]> {
  const result = await pool.query<CompanyRow>(
    `
      ${companyFieldsSql}
      WHERE c.status = 'pending'
      ORDER BY c.created_at ASC
    `
  );

  return result.rows;
}

async function updateStatus(
  id: number,
  status: ModerationStatus,
  approvedByUserId: number | null
): Promise<CompanyRow | null> {
  const nextApprovedByUserId = status === 'approved' ? approvedByUserId : null;
  const nextApprovedAt = status === 'approved' ? new Date().toISOString() : null;

  const result = await pool.query<{ id: number }>(
    `
      UPDATE companies
      SET
        status = $2,
        approved_by_user_id = $3,
        approved_at = $4
      WHERE id = $1
      RETURNING id
    `,
    [id, status, nextApprovedByUserId, nextApprovedAt]
  );

  const updatedId = result.rows[0]?.id;

  if (!updatedId) {
    return null;
  }

  return getById(updatedId);
}

async function updateById(id: number, input: UpdateCompanyInput): Promise<CompanyRow | null> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const setClauses: string[] = [];
    const values: Array<string | null> = [];

    type BaseUpdateField =
      | 'name'
      | 'website'
      | 'linkedin'
      | 'industry'
      | 'location'
      | 'description';

    const map: Array<[BaseUpdateField, string]> = [
      ['name', 'name'],
      ['website', 'website'],
      ['linkedin', 'linkedin'],
      ['industry', 'industry'],
      ['location', 'location'],
      ['description', 'description']
    ];

    for (const [inputKey, columnName] of map) {
      const value = input[inputKey];
      if (value !== undefined) {
        values.push(value);
        setClauses.push(`${columnName} = $${values.length}`);
      }
    }

    if (setClauses.length > 0) {
      values.push(String(id));
      await client.query(
        `
          UPDATE companies
          SET ${setClauses.join(', ')}
          WHERE id = $${values.length}
        `,
        values
      );
    }

    if (input.technologies !== undefined) {
      await replaceCompanyTechnologies(client, id, input.technologies);
    }

    if (input.jobRoles !== undefined) {
      await replaceCompanyJobRoles(client, id, input.jobRoles);
    }

    const updatedCompany = await getByIdWithClient(client, id);

    await client.query('COMMIT');
    return updatedCompany;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deleteById(id: number): Promise<boolean> {
  const result = await pool.query(
    `
      DELETE FROM companies
      WHERE id = $1
    `,
    [id]
  );

  return result.rowCount !== null && result.rowCount > 0;
}

export default {
  getApproved,
  getAll,
  getById,
  getApprovedById,
  createPending,
  getPending,
  updateStatus,
  updateById,
  deleteById
};
