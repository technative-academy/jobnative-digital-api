import request from 'supertest';
import app from '../src/app';
import pool from '../src/db/pool';

async function seedUserAndCompany() {
  const userRes = await pool.query<{ id: number }>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
    ['Test User', 'test@example.com', 'dummy_hash']
  );
  const companyRes = await pool.query<{ id: number }>(
    `INSERT INTO companies (name, website, created_by_user_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    ['Test Co', 'https://example.com', userRes.rows[0].id]
  );
  return { userId: userRes.rows[0].id, companyId: companyRes.rows[0].id };
}

beforeEach(async () => {
  // Keep tests isolated: wipe tables in dependency order
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM companies');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});

describe('comments endpoints', () => {
  test('GET /api/companies/:companyId/comments returns [] when none exist', async () => {
    const { companyId } = await seedUserAndCompany();
    const res = await request(app).get(`/api/companies/${companyId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('GET /api/companies/:companyId/comments returns seeded comments', async () => {
    const { userId, companyId } = await seedUserAndCompany();
    await pool.query(
      `INSERT INTO comments (company_id, user_id, body)
       VALUES ($1, $2, $3)`,
      [companyId, userId, 'First comment']
    );
    const res = await request(app).get(`/api/companies/${companyId}/comments`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      company_id: companyId,
      user_id: userId,
      body: 'First comment'
    });
  });

  test('POST /api/companies/:companyId/comments creates a comment', async () => {
    const { userId, companyId } = await seedUserAndCompany(); // ← destructure userId too
    const res = await request(app)
      .post(`/api/companies/${companyId}/comments`)
      .send({ body: 'Created from test', user_id: userId }); // ← add user_id
    expect(res.status).toBe(201);
    expect(res.body.body).toBe('Created from test');
    expect(res.body.company_id).toBe(companyId);
  });
});
