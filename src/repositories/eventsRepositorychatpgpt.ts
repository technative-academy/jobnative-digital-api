// File overview: Encapsulates events data access and SQL queries for discovery, moderation, and editing.

import type { PoolClient } from 'pg';

import pool from '../db/pool';

export type EventStatus = 'pending' | 'approved' | 'rejected';
export type ModerationStatus = 'approved' | 'rejected';

export interface TechnologyRow {
  id: number;
  name: string;
  slug: string;
}

export interface SponsorRow {
  id: number;
  name: string;
  website: string;
  linkedin: string | null;
}

export interface EventRow {
  id: number;
  name: string;
  companyId: number | null;
  website: string;
  location: string | null;
  startTime: string;
  endTime: string | null;
  description: string | null;
  technologyStack: string[];
  technologies: TechnologyRow[];
  sponsorNames: string[];
  sponsors: SponsorRow[];
  status: EventStatus;
  createdByUserId: number | null;
  createdAt: string;
  approvedByUserId: number | null;
  approvedAt: string | null;
}

export interface EventFilters {
  search: string;
  location: string;
  technologies: string[];
}

export interface AdminEventFilters {
  status: EventStatus | null;
}

export interface TechnologyInput {
  name: string;
  slug: string;
}

export interface CreateEventInput {
  name: string;
  companyId: number | null;
  website: string;
  location: string | null;
  startTime: string;
  endTime: string | null;
  description: string | null;
  technologies: TechnologyInput[];
  sponsorCompanyIds: number[];
  createdByUserId: number | null;
}

export interface UpdateEventInput {
  name?: string;
  companyId?: number | null;
  website?: string;
  location?: string | null;
  startTime?: string;
  endTime?: string | null;
  description?: string | null;
  technologies?: TechnologyInput[];
  sponsorCompanyIds?: number[];
}

const eventFieldsSql = `
  SELECT
    e.id,
    e.name,
    e.company_id AS "companyId",
    e.website,
    e.location,
    e.start_time AS "startTime",
    e.end_time AS "endTime",
    e.description,
    COALESCE(technology_data."technologyStack", ARRAY[]::text[]) AS "technologyStack",
    COALESCE(technology_data.technologies, '[]'::json) AS technologies,
    COALESCE(sponsor_data."sponsorNames", ARRAY[]::text[]) AS "sponsorNames",
    COALESCE(sponsor_data.sponsors, '[]'::json) AS sponsors,
    e.status,
    e.created_by_user_id AS "createdByUserId",
    e.created_at AS "createdAt",
    e.approved_by_user_id AS "approvedByUserId",
    e.approved_at AS "approvedAt"
  FROM events e
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
    FROM event_technologies et
    JOIN technologies t ON t.id = et.technology_id
    WHERE et.event_id = e.id
  ) AS technology_data ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      array_agg(c.name ORDER BY c.name) AS "sponsorNames",
      json_agg(
        json_build_object(
          'id', c.id,
          'name', c.name,
          'website', c.website,
          'linkedin', c.linkedin
        )
        ORDER BY c.name
      ) AS sponsors
    FROM event_sponsors es
    JOIN companies c ON c.id = es.company_id
    WHERE es.event_id = e.id
  ) AS sponsor_data ON TRUE
`;

async function getByIdWithClient(client: PoolClient, id: number): Promise<EventRow | null> {
  const result = await client.query<EventRow>(
    `
      ${eventFieldsSql}
      WHERE e.id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function getApproved({ search, location, technologies }: EventFilters): Promise<EventRow[]> {
  const result = await pool.query<EventRow>(
    `
      ${eventFieldsSql}
      WHERE e.status = 'approved'
        AND ($1::text = '' OR e.name ILIKE '%' || $1 || '%')
        AND ($2::text = '' OR COALESCE(e.location, '') ILIKE '%' || $2 || '%')
        AND (
          cardinality($3::text[]) = 0
          OR EXISTS (
            SELECT 1
            FROM event_technologies et
            JOIN technologies t ON t.id = et.technology_id
            WHERE et.event_id = e.id
              AND t.slug = ANY ($3::text[])
          )
        )
      ORDER BY e.start_time ASC
    `,
    [search, location, technologies]
  );

  return result.rows;
}

async function getAll({ status }: AdminEventFilters): Promise<EventRow[]> {
  const result = await pool.query<EventRow>(
    `
      ${eventFieldsSql}
      WHERE ($1::text IS NULL OR e.status = $1::text)
      ORDER BY e.created_at DESC
    `,
    [status]
  );

  return result.rows;
}

async function getById(id: number): Promise<EventRow | null> {
  const client = await pool.connect();

  try {
    return getByIdWithClient(client, id);
  } finally {
    client.release();
  }
}

async function getApprovedById(id: number): Promise<EventRow | null> {
  const result = await pool.query<EventRow>(
    `
      ${eventFieldsSql}
      WHERE e.id = $1
        AND e.status = 'approved'
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

async function replaceEventTechnologies(
  client: PoolClient,
  eventId: number,
  technologies: TechnologyInput[]
) {
  await client.query(
    `
      DELETE FROM event_technologies
      WHERE event_id = $1
    `,
    [eventId]
  );

  if (technologies.length === 0) {
    return;
  }

  for (const technology of technologies) {
    const technologyId = await upsertTechnology(client, technology);
    await client.query(
      `
        INSERT INTO event_technologies (event_id, technology_id)
        VALUES ($1, $2)
        ON CONFLICT (event_id, technology_id) DO NOTHING
      `,
      [eventId, technologyId]
    );
  }
}

async function replaceEventSponsors(
  client: PoolClient,
  eventId: number,
  sponsorCompanyIds: number[]
) {
  await client.query(
    `
      DELETE FROM event_sponsors
      WHERE event_id = $1
    `,
    [eventId]
  );

  if (sponsorCompanyIds.length === 0) {
    return;
  }

  for (const companyId of sponsorCompanyIds) {
    await client.query(
      `
        INSERT INTO event_sponsors (event_id, company_id)
        VALUES ($1, $2)
        ON CONFLICT (event_id, company_id) DO NOTHING
      `,
      [eventId, companyId]
    );
  }
}

async function createPending(input: CreateEventInput): Promise<EventRow> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const createResult = await client.query<{ id: number }>(
      `
        INSERT INTO events (
          name,
          company_id,
          website,
          location,
          start_time,
          end_time,
          description,
          status,
          created_by_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
        RETURNING id
      `,
      [
        input.name,
        input.companyId,
        input.website,
        input.location,
        input.startTime,
        input.endTime,
        input.description,
        input.createdByUserId
      ]
    );

    const createdEventId = createResult.rows[0]?.id;

    if (!createdEventId) {
      throw new Error('Failed to create event.');
    }

    await replaceEventTechnologies(client, createdEventId, input.technologies);
    await replaceEventSponsors(client, createdEventId, input.sponsorCompanyIds);

    const createdEvent = await getByIdWithClient(client, createdEventId);

    if (!createdEvent) {
      throw new Error('Failed to load created event.');
    }

    await client.query('COMMIT');
    return createdEvent;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getPending(): Promise<EventRow[]> {
  const result = await pool.query<EventRow>(
    `
      ${eventFieldsSql}
      WHERE e.status = 'pending'
      ORDER BY e.created_at ASC
    `
  );

  return result.rows;
}

async function updateStatus(
  id: number,
  status: ModerationStatus,
  approvedByUserId: number | null
): Promise<EventRow | null> {
  const nextApprovedByUserId = status === 'approved' ? approvedByUserId : null;
  const nextApprovedAt = status === 'approved' ? new Date().toISOString() : null;

  const result = await pool.query<{ id: number }>(
    `
      UPDATE events
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

async function updateById(id: number, input: UpdateEventInput): Promise<EventRow | null> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const setClauses: string[] = [];
    const values: Array<string | number | null> = [];

    type BaseUpdateField =
      | 'name'
      | 'companyId'
      | 'website'
      | 'location'
      | 'startTime'
      | 'endTime'
      | 'description';

    const map: Array<[BaseUpdateField, string]> = [
      ['name', 'name'],
      ['companyId', 'company_id'],
      ['website', 'website'],
      ['location', 'location'],
      ['startTime', 'start_time'],
      ['endTime', 'end_time'],
      ['description', 'description']
    ];

    for (const [inputKey, columnName] of map) {
      const value = input[inputKey];
      if (value !== undefined) {
        values.push(value ?? null);
        setClauses.push(`${columnName} = $${values.length}`);
      }
    }

    if (setClauses.length > 0) {
      values.push(id);
      await client.query(
        `
          UPDATE events
          SET ${setClauses.join(', ')}
          WHERE id = $${values.length}
        `,
        values
      );
    }

    if (input.technologies !== undefined) {
      await replaceEventTechnologies(client, id, input.technologies);
    }

    if (input.sponsorCompanyIds !== undefined) {
      await replaceEventSponsors(client, id, input.sponsorCompanyIds);
    }

    const updatedEvent = await getByIdWithClient(client, id);

    await client.query('COMMIT');
    return updatedEvent;
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
      DELETE FROM events
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