-- ── schema_candidates migration ──────────────────────────────────────
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Creates the schema_candidates table for storing emerging identity
-- dimensions detected by the schema evolution system.
-- ──────────────────────────────────────────────────────────────────────

-- 1. Create the schema_candidates table
CREATE TABLE IF NOT EXISTS public.schema_candidates (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was detected
  candidate_name     text NOT NULL,
  candidate_type     text NOT NULL
    CHECK (candidate_type IN ('archetype', 'value', 'style_tag', 'community')),
  definition         text,                          -- suggested definition / description

  -- Evidence
  evidence           jsonb NOT NULL DEFAULT '[]',   -- array of match_event IDs that support this
  confidence_score   numeric(4,2) NOT NULL DEFAULT 0,  -- 0.00 – 1.00
  sample_count       integer NOT NULL DEFAULT 0,    -- number of converted matches with this trait

  -- Lifecycle
  first_detected     timestamptz NOT NULL DEFAULT now(),
  last_updated       timestamptz NOT NULL DEFAULT now(),
  status             text NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'approved', 'rejected')),
  approved_at        timestamptz,
  approved_by        text                           -- optional: who approved it
);

-- 2. Indexes for common queries
CREATE INDEX IF NOT EXISTS schema_candidates_status_idx
  ON public.schema_candidates (status);

CREATE INDEX IF NOT EXISTS schema_candidates_type_status_idx
  ON public.schema_candidates (candidate_type, status);

CREATE UNIQUE INDEX IF NOT EXISTS schema_candidates_name_type_idx
  ON public.schema_candidates (candidate_name, candidate_type);

-- 3. Grants
GRANT ALL ON public.schema_candidates TO service_role;
GRANT SELECT ON public.schema_candidates TO authenticated;

-- 4. RLS
ALTER TABLE public.schema_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.schema_candidates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read" ON public.schema_candidates
  FOR SELECT TO authenticated USING (true);
