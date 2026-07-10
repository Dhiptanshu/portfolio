-- Upsert Categories
INSERT INTO skill_categories (name, icon, display_order)
VALUES
  ('Programming', 'Code2', 0),
  ('Frameworks', 'Layers', 1),
  ('Databases', 'Database', 2),
  ('Cloud & DevOps', 'Cloud', 3),
  ('Tools', 'Wrench', 4)
ON CONFLICT (name) DO UPDATE SET display_order = EXCLUDED.display_order;

-- Insert or Update Skills
WITH category_ids AS (
  SELECT id, name FROM skill_categories
)
INSERT INTO skills (name, slug, category_id, is_visible)
VALUES
  -- Programming
  ('Python', 'python', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('Java', 'java', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('C++', 'cpp', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('C', 'c', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('Dart', 'dart', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('JavaScript', 'javascript', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('TypeScript', 'typescript', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  ('Solidity', 'solidity', (SELECT id FROM category_ids WHERE name = 'Programming'), true),
  
  -- Frameworks
  ('React', 'react', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Next.js', 'nextjs', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Node.js', 'nodejs', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Express.js', 'expressjs', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Flask', 'flask', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Django', 'django', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('FastAPI', 'fastapi', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('Flutter', 'flutter', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  ('React Native', 'react-native', (SELECT id FROM category_ids WHERE name = 'Frameworks'), true),
  
  -- Databases
  ('PostgreSQL', 'postgresql', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  ('MySQL', 'mysql', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  ('MongoDB', 'mongodb', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  ('SQLite', 'sqlite', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  ('Firebase', 'firebase', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  ('Supabase', 'supabase', (SELECT id FROM category_ids WHERE name = 'Databases'), true),
  
  -- Cloud & DevOps
  ('AWS', 'aws', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('Oracle Cloud', 'oracle-cloud', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('Docker', 'docker', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('Kubernetes', 'kubernetes', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('Git', 'git', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('Jenkins', 'jenkins', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  ('CI/CD', 'cicd', (SELECT id FROM category_ids WHERE name = 'Cloud & DevOps'), true),
  
  -- Tools
  ('Android Studio', 'android-studio', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('Xcode', 'xcode', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('VS Code', 'vs-code', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('Eclipse', 'eclipse', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('Postman', 'postman', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('Claude Code', 'claude-code', (SELECT id FROM category_ids WHERE name = 'Tools'), true),
  ('Cursor', 'cursor', (SELECT id FROM category_ids WHERE name = 'Tools'), true)
ON CONFLICT (slug) DO UPDATE SET 
  category_id = EXCLUDED.category_id,
  is_visible = true;
