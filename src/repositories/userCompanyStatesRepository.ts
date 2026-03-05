// File overview: Encapsulates user-company state data access for the personal dashboard.

import pool from '../db/pool';

export type DashboardColumn = 'todo' | 'contacted' | 'favourite';

export interface UserCompanyStateRow {
  userId: number;
  companyId: number;
  dashboardColumn: DashboardColumn;
  personalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpsertInput {
  userId: number;
  companyId: number;
  dashboardColumn: DashboardColumn;
  personalNotes: string | null;
}

const fields = `
  user_id AS "userId",
  company_id AS "companyId",
  dashboard_column AS "dashboardColumn",
  personal_notes AS "personalNotes",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

async function getByUserId(userId: number): Promise<UserCompanyStateRow[]> {
  const result = await pool.query<UserCompanyStateRow>(
    `
      SELECT ${fields}
      FROM user_company_states
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `,
    [userId]
  );
  return result.rows;
}

async function getByUserAndCompany(
  userId: number,
  companyId: number
): Promise<UserCompanyStateRow | null> {
  const result = await pool.query<UserCompanyStateRow>(
    `
      SELECT ${fields}
      FROM user_company_states
      WHERE user_id = $1 AND company_id = $2
    `,
    [userId, companyId]
  );
  return result.rows[0] ?? null;
}

async function upsert(input: UpsertInput): Promise<UserCompanyStateRow> {
  const result = await pool.query<UserCompanyStateRow>(
    `
      INSERT INTO user_company_states (user_id, company_id, dashboard_column, personal_notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, company_id)
      DO UPDATE SET
        dashboard_column = EXCLUDED.dashboard_column,
        personal_notes = EXCLUDED.personal_notes,
        updated_at = NOW()
      RETURNING ${fields}
    `,
    [input.userId, input.companyId, input.dashboardColumn, input.personalNotes]
  );
  return result.rows[0];
}

async function deleteByUserAndCompany(userId: number, companyId: number): Promise<boolean> {
  const result = await pool.query(
    `
      DELETE FROM user_company_states
      WHERE user_id = $1 AND company_id = $2
    `,
    [userId, companyId]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

export default {
  getByUserId,
  getByUserAndCompany,
  upsert,
  deleteByUserAndCompany
};
