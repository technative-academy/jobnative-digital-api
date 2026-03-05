// File overview: Encapsulates refresh token data access for JWT auth token rotation.

import pool from '../db/pool';

export interface RefreshTokenRow {
  id: string;
  userId: number;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

interface CreateRefreshTokenInput {
  userId: number;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
}

const fields = `
  id,
  user_id AS "userId",
  token_hash AS "tokenHash",
  user_agent AS "userAgent",
  ip_address AS "ipAddress",
  expires_at AS "expiresAt",
  revoked_at AS "revokedAt",
  created_at AS "createdAt"
`;

async function create(input: CreateRefreshTokenInput): Promise<RefreshTokenRow> {
  const result = await pool.query<RefreshTokenRow>(
    `
      INSERT INTO auth_refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${fields}
    `,
    [input.userId, input.tokenHash, input.userAgent, input.ipAddress, input.expiresAt]
  );
  return result.rows[0];
}

async function findByTokenHash(tokenHash: string): Promise<RefreshTokenRow | null> {
  const result = await pool.query<RefreshTokenRow>(
    `
      SELECT ${fields}
      FROM auth_refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
    `,
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

async function revokeByTokenHash(tokenHash: string): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE auth_refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

async function revokeAllForUser(userId: number): Promise<void> {
  await pool.query(
    `
      UPDATE auth_refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
    `,
    [userId]
  );
}

async function deleteExpired(): Promise<number> {
  const result = await pool.query(
    `
      DELETE FROM auth_refresh_tokens
      WHERE expires_at < NOW()
    `
  );
  return result.rowCount ?? 0;
}

export default {
  create,
  findByTokenHash,
  revokeByTokenHash,
  revokeAllForUser,
  deleteExpired
};
