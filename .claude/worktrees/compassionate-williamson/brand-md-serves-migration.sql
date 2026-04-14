-- ── brand_md_serves migration ─────────────────────────────────────────
-- Tracks every time an AI agent or crawler fetches a brand's brand.md
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ──────────────────────────────────────────────────────────────────────

-- 1. Create the brand_md_serves table
CREATE TABLE IF NOT EXISTS public.brand_md_serves (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  esina_token TEXT NOT NULL,
  served_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent  TEXT,
  referrer    TEXT,
  ip_hash     TEXT
);

-- 2. Indexes for efficient querying
CREATE INDEX IF NOT EXISTS brand_md_serves_brand_id_idx
  ON public.brand_md_serves (brand_id);

CREATE INDEX IF NOT EXISTS brand_md_serves_token_idx
  ON public.brand_md_serves (esina_token);

CREATE INDEX IF NOT EXISTS brand_md_serves_served_at_idx
  ON public.brand_md_serves (served_at DESC);

-- 3. Explicit GRANTs (required for SQL-created tables)
GRANT ALL ON public.brand_md_serves TO service_role;
GRANT SELECT, INSERT ON public.brand_md_serves TO authenticated;

-- 4. Row Level Security — matching the match_events pattern
ALTER TABLE public.brand_md_serves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.brand_md_serves
  FOR ALL TO service_role USING (true) WITH CHECK (true);
