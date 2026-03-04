// File overview: Basic endpoint tests that verify the API responds with expected status codes and payloads.

// Supertest sends HTTP requests directly to the Express app instance.
// This keeps tests fast and isolated because no network port is opened.
import request from 'supertest';

import app from '../src/app';
import pool from '../src/db/pool';

afterAll(async () => {
  await pool.end();
});

describe('API', () => {
  let pendingCompanyId: number | null = null;
  let approvedCompanyId: number | null = null;
  let rejectedCompanyId: number | null = null;
  let typoTechnologyId: number | null = null;
  let typoJobRoleId: number | null = null;

  test('GET / returns API info', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('API is running');
    expect(response.body.endpoints).toBeDefined();
  });

  test('GET /health returns { ok: true }', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('GET /api/users returns an array', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/users with missing name returns 400', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test('GET /api/companies returns an array', async () => {
    const response = await request(app).get('/api/companies');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/companies with missing website returns 400', async () => {
    const response = await request(app).post('/api/companies').send({ name: 'Missing Website Inc.' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test('POST /api/companies creates a pending company with technology stack and roles', async () => {
    const uniqueName = `dabapps ${Date.now()}`;
    const uniqueWebsite = `https://dabapps-${Date.now()}.example.com`;
    const response = await request(app).post('/api/companies').send({
      name: uniqueName,
      website: uniqueWebsite,
      location: 'Remote',
      description: 'A company submitted during integration tests.',
      technologyStack: ['Node.js', 'react', 'node.js'],
      jobRoles: ['Full Stack Developer']
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');
    expect(response.body.technologyStack).toEqual(['node.js', 'react']);
    expect(response.body.jobRoles).toEqual(['full-stack-developer']);
    expect(response.body.website).toBe(uniqueWebsite);

    pendingCompanyId = response.body.id;
  });

  test('PATCH /api/companies/:id edits company details and taxonomy links', async () => {
    const response = await request(app)
      .patch(`/api/companies/${pendingCompanyId}`)
      .send({
        location: 'Remote UK',
        technologyStack: ['TypeScript', 'Node.js', 'React'],
        jobRoles: ['Backend Developer']
      });

    expect(response.status).toBe(200);
    expect(response.body.location).toBe('Remote UK');
    expect(response.body.technologyStack).toEqual(['node.js', 'react', 'typescript']);
    expect(response.body.jobRoles).toEqual(['backend-developer']);
  });

  test('GET /api/admin/companies/pending includes the newly submitted company', async () => {
    const response = await request(app).get('/api/admin/companies/pending');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((company: { id: number }) => company.id === pendingCompanyId)).toBe(true);
  });

  test('GET /api/admin/companies returns all companies and supports status filter', async () => {
    const allResponse = await request(app).get('/api/admin/companies');

    expect(allResponse.status).toBe(200);
    expect(Array.isArray(allResponse.body)).toBe(true);
    expect(allResponse.body.some((company: { id: number }) => company.id === pendingCompanyId)).toBe(true);

    const pendingOnlyResponse = await request(app)
      .get('/api/admin/companies')
      .query({ status: 'pending' });

    expect(pendingOnlyResponse.status).toBe(200);
    expect(Array.isArray(pendingOnlyResponse.body)).toBe(true);
    expect(
      pendingOnlyResponse.body.every(
        (company: { status: string }) => company.status === 'pending'
      )
    ).toBe(true);
    expect(
      pendingOnlyResponse.body.some((company: { id: number }) => company.id === pendingCompanyId)
    ).toBe(true);
  });

  test('GET /api/admin/companies with invalid status returns 400', async () => {
    const response = await request(app).get('/api/admin/companies').query({ status: 'unknown' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test('PATCH /api/admin/companies/:id/approve changes status to approved', async () => {
    const response = await request(app)
      .patch(`/api/admin/companies/${pendingCompanyId}/approve`)
      .send({ approvedByUserId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('approved');
    expect(response.body.approvedByUserId).toBe(1);

    approvedCompanyId = response.body.id;
  });

  test('GET /api/companies/:id returns the approved company', async () => {
    const response = await request(app).get(`/api/companies/${approvedCompanyId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(approvedCompanyId);
    expect(response.body.status).toBe('approved');
  });

  test('GET /api/companies supports search, location, technology, and role filters', async () => {
    const response = await request(app).get('/api/companies').query({
      search: 'dabapps',
      location: 'remote uk',
      tech: 'react',
      role: 'backend developer'
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((company: { id: number }) => company.id === approvedCompanyId)).toBe(true);
  });

  test('GET /api/technologies returns technology options', async () => {
    const response = await request(app).get('/api/technologies');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((tag: { slug: string }) => tag.slug === 'react')).toBe(true);
  });

  test('GET /api/job-roles returns job role options', async () => {
    const response = await request(app).get('/api/job-roles');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((role: { slug: string }) => role.slug === 'backend-developer')).toBe(true);
  });

  test('PATCH/DELETE /api/technologies supports typo cleanup', async () => {
    const token = Date.now();
    const typoTechnologyName = `Reatc ${token}`;
    const typoRoleName = `Sofware Enginer ${token}`;
    const createResponse = await request(app).post('/api/companies').send({
      name: `Typo Cleanup Co ${token}`,
      website: `https://typo-cleanup-${token}.example.com`,
      technologyStack: [typoTechnologyName],
      jobRoles: [typoRoleName]
    });

    expect(createResponse.status).toBe(201);

    const typoTechnologySlug = `reatc-${token}`;
    const technologiesResponse = await request(app).get('/api/technologies');
    const typoTechnology = technologiesResponse.body.find(
      (technology: { id: number; slug: string }) => technology.slug === typoTechnologySlug
    );

    expect(technologiesResponse.status).toBe(200);
    expect(typoTechnology).toBeDefined();
    typoTechnologyId = typoTechnology?.id ?? null;

    const updateTechnologyResponse = await request(app)
      .patch(`/api/technologies/${typoTechnologyId}`)
      .send({ name: `React ${token}` });

    expect(updateTechnologyResponse.status).toBe(200);
    expect(updateTechnologyResponse.body.slug).toBe(`react-${token}`);

    const deleteTechnologyResponse = await request(app).delete(
      `/api/technologies/${typoTechnologyId}`
    );

    expect(deleteTechnologyResponse.status).toBe(204);

    const technologiesAfterDelete = await request(app).get('/api/technologies');
    expect(
      technologiesAfterDelete.body.some(
        (technology: { id: number }) => technology.id === typoTechnologyId
      )
    ).toBe(false);
  });

  test('PATCH/DELETE /api/job-roles supports typo cleanup', async () => {
    const jobRolesResponse = await request(app).get('/api/job-roles');
    const typoJobRole = jobRolesResponse.body.find(
      (role: { id: number; slug: string }) => role.slug.includes('sofware-enginer-')
    );

    expect(jobRolesResponse.status).toBe(200);
    expect(typoJobRole).toBeDefined();
    typoJobRoleId = typoJobRole?.id ?? null;
    const updatedJobRoleName = `Software Engineer Temp ${typoJobRoleId}`;

    const updateJobRoleResponse = await request(app)
      .patch(`/api/job-roles/${typoJobRoleId}`)
      .send({ name: updatedJobRoleName });

    expect(updateJobRoleResponse.status).toBe(200);
    expect(updateJobRoleResponse.body.slug).toBe(
      `software-engineer-temp-${typoJobRoleId}`
    );

    const deleteJobRoleResponse = await request(app).delete(`/api/job-roles/${typoJobRoleId}`);

    expect(deleteJobRoleResponse.status).toBe(204);

    const jobRolesAfterDelete = await request(app).get('/api/job-roles');
    expect(
      jobRolesAfterDelete.body.some((role: { id: number }) => role.id === typoJobRoleId)
    ).toBe(false);
  });

  test('DELETE /api/companies/:id removes the approved company', async () => {
    const response = await request(app).delete(`/api/companies/${approvedCompanyId}`);

    expect(response.status).toBe(204);
  });

  test('GET /api/companies/:id returns 404 for deleted companies', async () => {
    const response = await request(app).get(`/api/companies/${approvedCompanyId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBeDefined();
  });

  test('PATCH /api/admin/companies/:id/reject updates company status to rejected', async () => {
    const uniqueName = `Rejected Co ${Date.now()}`;
    const uniqueWebsite = `https://rejected-${Date.now()}.example.com`;
    const createResponse = await request(app).post('/api/companies').send({
      name: uniqueName,
      website: uniqueWebsite
    });

    expect(createResponse.status).toBe(201);
    rejectedCompanyId = createResponse.body.id;

    const rejectResponse = await request(app).patch(`/api/admin/companies/${rejectedCompanyId}/reject`);

    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body.status).toBe('rejected');
  });

  test('GET /api/companies/:id returns 404 for rejected companies', async () => {
    const response = await request(app).get(`/api/companies/${rejectedCompanyId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBeDefined();
  });
});
