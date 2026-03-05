-- File overview: Inserts starter rows so the API has sample data on first run.

INSERT INTO users (name, email)
VALUES
  ('Ada Lovelace', 'ada@example.com'),
  ('Grace Hopper', 'grace@example.com'),
  ('Margaret Hamilton', 'margaret@example.com');

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
VALUES
(
  'AI Innovation Summit',
  1,
  'https://ai-innovation-summit.com',
  'London, UK',
  '2026-06-10 09:00:00+00',
  '2026-06-10 17:00:00+00',
  'A conference exploring the latest developments in artificial intelligence.',
  'pending',
  1
),
(
  'Frontend Dev Conference',
  2,
  'https://frontend-devconf.com',
  'Manchester, UK',
  '2026-07-15 10:00:00+00',
  '2026-07-15 18:00:00+00',
  'A gathering of frontend developers discussing modern frameworks and tooling.',
  'approved',
  2
),
(
  'Cloud & DevOps Expo',
  3,
  'https://cloud-devops-expo.com',
  'Birmingham, UK',
  '2026-09-05 09:30:00+00',
  '2026-09-05 16:30:00+00',
  'An event focused on cloud infrastructure, DevOps practices, and scalability.',
  'pending',
  1
);

INSERT INTO event_technologies (event_id, technology_id)
VALUES
(1, 1),
(1, 3),
(2, 1),
(2, 2),
(3, 3);

INSERT INTO event_sponsors (event_id, company_id)
VALUES
(1, 2),
(2, 1),
(2, 3),
(3, 2);
