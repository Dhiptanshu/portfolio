-- 017_update_ai_skills.sql

-- Rename 'AI' category to 'AI/ML' if it exists
UPDATE skill_categories 
SET name = 'AI/ML' 
WHERE name = 'AI';

-- Alternatively, ensure 'AI/ML' exists just in case
INSERT INTO skill_categories (name, icon, display_order)
VALUES ('AI/ML', 'BrainCircuit', 5)
ON CONFLICT (name) DO NOTHING;

-- Remove 'AI Tooling'
DELETE FROM skills WHERE slug = 'ai-tooling';

-- Insert new AI/ML Skills
WITH category_ids AS (
  SELECT id, name FROM skill_categories
)
INSERT INTO skills (name, slug, category_id, is_visible)
VALUES
  ('Scikit-learn', 'scikit-learn', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('TensorFlow', 'tensorflow', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('Natural Language Processing', 'nlp', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('OpenCV', 'opencv', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('Feature Engineering', 'feature-engineering', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('TF-IDF & Cosine Similarity', 'tfidf-cosine', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('Generative AI', 'generative-ai', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true),
  ('LLM Integration', 'llm-integration', (SELECT id FROM category_ids WHERE name = 'AI/ML'), true)
ON CONFLICT (slug) DO UPDATE SET 
  category_id = EXCLUDED.category_id,
  is_visible = true;
