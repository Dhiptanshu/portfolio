ALTER TABLE experiences ADD COLUMN tech_stack text[] DEFAULT '{}';
ALTER TABLE experiences ADD COLUMN media_gallery jsonb DEFAULT '[]'::jsonb;
