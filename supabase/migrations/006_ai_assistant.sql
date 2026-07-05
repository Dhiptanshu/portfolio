create extension if not exists vector;

create table portfolio_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null, -- 'entry', 'journey', 'skill', 'achievement', 'about', 'social'
  source_id uuid, -- Reference to the original entity, null if not applicable
  content text not null,
  metadata jsonb not null default '{}'::jsonb, -- Contains title, url, tags for citations
  embedding vector(768), -- Gemini text-embedding-004 default length
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- HNSW index for fast nearest neighbor search
create index on portfolio_documents using hnsw (embedding vector_cosine_ops);

create trigger portfolio_documents_updated_at before update on portfolio_documents for each row execute function set_updated_at();

alter table portfolio_documents enable row level security;

create policy "Admins can manage portfolio documents" on portfolio_documents for all using (public.is_admin()) with check (public.is_admin());
create policy "Public can read portfolio documents" on portfolio_documents for select using (true);

-- Function for similarity search used by the RAG backend
create or replace function match_portfolio_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    portfolio_documents.id,
    portfolio_documents.content,
    portfolio_documents.metadata,
    1 - (portfolio_documents.embedding <=> query_embedding) as similarity
  from portfolio_documents
  where 1 - (portfolio_documents.embedding <=> query_embedding) > match_threshold
  order by portfolio_documents.embedding <=> query_embedding
  limit match_count;
$$;
