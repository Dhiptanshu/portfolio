-- 018_populate_portfolio_data.sql

-- Massive data population script for Portfolio OS

-- 1. Insert Skills (Conflict on slug)
INSERT INTO skills (name, slug, xp, color_theme, node_x, node_y, is_visible) VALUES
('Python', 'python', 8500, '#3776AB', 0, 0, true),
('Java', 'java', 7200, '#007396', 150, 0, true),
('TypeScript', 'typescript', 9500, '#3178C6', -150, 0, true),
('React', 'react', 9100, '#61DAFB', -150, 100, true),
('Next.js', 'nextjs', 8800, '#000000', -150, 200, true),
('Flutter', 'flutter', 8200, '#02569B', 150, 100, true),
('AWS', 'aws', 7500, '#232F3E', 0, 150, true),
('Docker', 'docker', 7000, '#2496ED', 0, 250, true),
('Supabase', 'supabase', 8400, '#3ECF8E', -50, 300, true),
('PostgreSQL', 'postgresql', 8100, '#336791', -50, 200, true)
ON CONFLICT (slug) DO UPDATE SET 
  xp = EXCLUDED.xp, 
  color_theme = EXCLUDED.color_theme,
  is_visible = EXCLUDED.is_visible;

-- 2. Insert Skill Relationships using subqueries
INSERT INTO skill_relationships (parent_skill_id, child_skill_id)
SELECT p.id, c.id FROM skills p, skills c WHERE p.slug = 'typescript' AND c.slug = 'react'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (parent_skill_id, child_skill_id)
SELECT p.id, c.id FROM skills p, skills c WHERE p.slug = 'react' AND c.slug = 'nextjs'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (parent_skill_id, child_skill_id)
SELECT p.id, c.id FROM skills p, skills c WHERE p.slug = 'java' AND c.slug = 'flutter'
ON CONFLICT DO NOTHING;

INSERT INTO skill_relationships (parent_skill_id, child_skill_id)
SELECT p.id, c.id FROM skills p, skills c WHERE p.slug = 'postgresql' AND c.slug = 'supabase'
ON CONFLICT DO NOTHING;

-- 3. Insert Journeys (Timeline)
INSERT INTO journeys (title, slug, subtitle, description, content_markdown, start_date, end_date, category, tech_stack, is_featured, is_visible) VALUES
('BTech Computer Science', 'btech-cse', 'GLS University', 'Pursuing BTech in Computer Science and Engineering with a focus on full-stack development, cloud infrastructure, and AI.', 'Relevant coursework and foundational computer science concepts.', '2023-08-01', '2027-05-01', 'Education', ARRAY['C++', 'Java', 'Python'], true, true),
('Mobile App Developer Intern', 'intern-hellbooks', 'Meru Technosoft Pvt. Ltd.', 'Developed and maintained Android and iOS applications using Flutter and React Native. Integrated REST APIs and AI-powered features.', 'Designed and implemented user interfaces, performed testing and bug fixing, and contributed to production deployments on the Google Play Store and Apple App Store.', '2026-06-09', '2026-07-09', 'Internship', ARRAY['Flutter', 'React Native', 'Firebase', 'Java'], true, true),
('PIERC Pre-Incubation Program', 'pierc-incubation', 'Parul University - Cohort 9', 'Selected for Incubation and SSIP Grant for our startup idea. Completed intensive program covering Cap Tables, Legal Compliance, GTM Strategies, and Field Market Research.', 'Worked with Kavya Joshi to develop our startup vision. Received mentorship from industry experts and secured a grant.', '2026-03-02', '2026-03-14', 'Startup', ARRAY['Business', 'AgriTech', 'SSIP'], true, true),
('Smart India Hackathon 2025 Finale', 'sih-2025', 'Grand Finalist', 'Built VillageCraft, a web-based 3D city-building simulation game that integrates real-world GIS data.', 'VillageCraft allows users to plan and build a village economy within a 3D interface.', '2025-11-01', '2025-11-05', 'Hackathon', ARRAY['JavaScript', '3D', 'GIS'], true, true),
('Smart India Hackathon 2024 Finale', 'sih-2024', 'Grand Finalist', 'Reached the grand finale with an innovative software solution.', 'Two consecutive years representing GLS University at the SIH finals.', '2024-11-01', '2024-11-05', 'Hackathon', ARRAY['React', 'NodeJS'], true, true),
('CyberShadez 2026 Bug Bounty Organizer', 'cybershadez-2026', 'GLS FET TechFest', 'Hosted Bug Bounty workshop and competition for CyberShadez 2026. Made a gamified Bug Bounty platform (glsBB) hosted on Oracle Cloud.', 'Over 150 real-time players participated in the Capture-The-Flag events.', '2026-02-12', '2026-02-13', 'Event', ARRAY['Cybersecurity', 'CTF', 'Oracle Cloud'], true, true)
ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description;

-- 4. Insert Achievements
INSERT INTO achievements (title, slug, description, rarity, xp_reward, is_visible, is_secret) VALUES
('AWS Academy Graduate', 'aws-academy', 'Completed AWS Academy Cloud Foundations training and earned the official badge.', 'Rare', 500, true, false),
('SIH Double Finalist', 'sih-double', 'Represented GLS University at the Smart India Hackathon Grand Finale for two consecutive years (2024 & 2025).', 'Legendary', 2000, true, false),
('SSIP Grant Winner', 'ssip-grant', 'Secured SSIP Startup Grant and Incubation at PIERC Parul University Cohort 9.', 'Epic', 1500, true, false),
('First Publication', 'research-publication', 'Accepted for presentation: Machine Learning-Based Adaptive Digital Twin for Real-Time Threat Detection in Cloud Systems.', 'Epic', 1200, true, false)
ON CONFLICT (slug) DO UPDATE SET xp_reward = EXCLUDED.xp_reward;

-- 5. Insert Sections & Entries (Projects)
INSERT INTO sections (title, slug, type, display_order, is_visible) VALUES
('Projects', 'projects', 'projects', 1, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'glsBB CTF Platform', 'A secure, enterprise-grade Capture-The-Flag environment designed for internal security challenges. Hosted on Oracle Cloud and used by 150+ players.', 'https://github.com/Dhiptanshu/glsBB_CTF_Platform', true, 1 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'glsBB CTF Platform');

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'VillageCraft', 'A web-based 3D city-building simulation game that integrates real-world GIS data. Built for SIH 2025.', 'https://github.com/Dhiptanshu/VillageCraft', true, 2 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'VillageCraft');

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'CO2DigitalTwin', 'A 3D interactive dashboard for monitoring and simulating CO2 levels across India using CesiumJS. Built for SIH 2024.', 'https://github.com/Dhiptanshu/CO2DigitalTwin', true, 3 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'CO2DigitalTwin');

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'AI Spending Auditor', 'A web application that helps startups evaluate whether they are overspending on AI tooling.', 'https://github.com/Dhiptanshu/AI-Spending-Auditor', true, 4 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'AI Spending Auditor');

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'CheckMaster', 'A cross-platform inventory and task management application built with Flutter.', 'https://github.com/Dhiptanshu/CheckMaster', true, 5 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'CheckMaster');

INSERT INTO entries (section_id, title, short_description, github_url, is_visible, display_order)
SELECT id, 'DigiTwin Secure', 'An AI-driven cybersecurity framework engineered to detect and mitigate complex, covert cyber threats in real time.', 'https://github.com/Dhiptanshu/DigiTwin_Secure', true, 6 
FROM sections WHERE slug = 'projects'
AND NOT EXISTS (SELECT 1 FROM entries WHERE title = 'DigiTwin Secure');

-- 6. Insert Social Links (Assume name is unique if no slug exists)
INSERT INTO social_links (name, url, display_order, is_visible)
SELECT 'LinkedIn', 'https://www.linkedin.com/in/dhiptanshu', 1, true
WHERE NOT EXISTS (SELECT 1 FROM social_links WHERE name = 'LinkedIn');

INSERT INTO social_links (name, url, display_order, is_visible)
SELECT 'GitHub', 'https://github.com/Dhiptanshu', 2, true
WHERE NOT EXISTS (SELECT 1 FROM social_links WHERE name = 'GitHub');

-- 7. Associate Skills with Projects (skill_project_links)
-- 7.1 glsBB CTF Platform
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('oracle-cloud', 'docker', 'nodejs', 'expressjs') AND e.title = 'glsBB CTF Platform'
ON CONFLICT DO NOTHING;

-- 7.2 VillageCraft
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('javascript', 'typescript', 'react', 'nextjs', 'supabase') AND e.title = 'VillageCraft'
ON CONFLICT DO NOTHING;

-- 7.3 CO2DigitalTwin
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('javascript', 'react', 'nodejs', 'expressjs') AND e.title = 'CO2DigitalTwin'
ON CONFLICT DO NOTHING;

-- 7.4 AI Spending Auditor
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('python', 'fastapi', 'generative-ai', 'llm-integration', 'react') AND e.title = 'AI Spending Auditor'
ON CONFLICT DO NOTHING;

-- 7.5 CheckMaster
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('dart', 'flutter', 'firebase', 'android-studio') AND e.title = 'CheckMaster'
ON CONFLICT DO NOTHING;

-- 7.6 DigiTwin Secure
INSERT INTO skill_project_links (skill_id, entry_id)
SELECT s.id, e.id FROM skills s, entries e WHERE s.slug IN ('python', 'tensorflow', 'scikit-learn', 'feature-engineering', 'nlp') AND e.title = 'DigiTwin Secure'
ON CONFLICT DO NOTHING;
