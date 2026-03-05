-- File overview: Inserts starter rows so the API has sample data on first run.

-- password_hash is bcrypt of 'password123' for all seed users
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Ada Lovelace', 'ada@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000000', 'admin'),
  ('Grace Hopper', 'grace@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000001', 'user'),
  ('Margaret Hamilton', 'margaret@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000002', 'user');

INSERT INTO companies (
  name,
  website,
  linkedin,
  industry,
  location,
  description,
  status,
  created_by_user_id,
  approved_by_user_id,
  approved_at
)
VALUES
  (
    'DabApps',
    'https://dabapps.com',
    'https://www.linkedin.com/company/dabapps/posts/?feedView=all',
    'Web and app agency',
    'Brighton',
    'Web and app agency.',
    'approved',
    1,
    2,
    NOW()
  ),
  (
    'StoryStream',
    'https://storystream.ai',
    'https://www.linkedin.com/company/storystream/about/',
    'Software Development',
    'London / Brighton',
    'Software development company.',
    'approved',
    1,
    2,
    NOW()
  ),
  (
    'Dapper Labs Limited',
    'https://wearechaperone.com',
    'https://www.linkedin.com/company/dapper-labs-ltd/',
    'Software Development',
    'Brighton',
    'Software development company.',
    'approved',
    2,
    1,
    NOW()
  );

INSERT INTO technologies (name, slug)
VALUES
  ('Python', 'python'),
  ('Django', 'django'),
  ('React', 'react'),
  ('AWS', 'aws'),
  ('Node.js', 'node.js'),
  ('TypeScript', 'typescript');

INSERT INTO company_technologies (company_id, technology_id)
VALUES
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'python')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'django')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'react')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'react')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'python')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'aws')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM technologies WHERE slug = 'node.js')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM technologies WHERE slug = 'typescript')
  );

INSERT INTO job_roles (name, slug)
VALUES
  ('Software Engineer', 'software-engineer'),
  ('Frontend Developer', 'frontend-developer'),
  ('Backend Developer', 'backend-developer'),
  ('Data Engineer', 'data-engineer'),
  ('Full Stack Developer', 'full-stack-developer');

INSERT INTO company_job_roles (company_id, job_role_id)
VALUES
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM job_roles WHERE slug = 'software-engineer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM job_roles WHERE slug = 'frontend-developer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM job_roles WHERE slug = 'backend-developer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM job_roles WHERE slug = 'data-engineer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM job_roles WHERE slug = 'full-stack-developer')
  );
