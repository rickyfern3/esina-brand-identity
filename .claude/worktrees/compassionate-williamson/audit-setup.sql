-- Run this in Supabase SQL Editor BEFORE running audits.
-- Grants service_role access to perception_audits table.

-- Grant full access to service_role
GRANT ALL ON perception_audits TO service_role;

-- Also ensure the table exists (should already from initial schema)
-- If not, uncomment and run:
/*
CREATE TABLE IF NOT EXISTS perception_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_model_used TEXT NOT NULL,
  query_category TEXT NOT NULL,
  raw_ai_response TEXT,
  perceived_archetypes TEXT[],
  perceived_values TEXT[],
  perceived_style_tags TEXT[],
  perceived_price_tier TEXT,
  perceived_target_demographic TEXT,
  perceived_communities TEXT[],
  perceived_status_signal TEXT,
  perceived_voice_tone TEXT,
  perceived_strengths TEXT[],
  perceived_weaknesses TEXT[],
  identity_alignment_score FLOAT,
  aligned_dimensions TEXT[],
  gap_dimensions TEXT[],
  gap_details JSONB,
  recommendations TEXT[]
);
*/
