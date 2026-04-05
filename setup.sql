-- Run this in Supabase SQL Editor BEFORE starting the app.
-- Creates the match_brands_by_embedding function that accepts
-- a raw embedding vector (for real-time matching from user input).

CREATE OR REPLACE FUNCTION match_brands_by_embedding(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.25,
  match_count INT DEFAULT 12,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  brand_id UUID,
  brand_name TEXT,
  category TEXT,
  similarity FLOAT,
  identity_text TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id AS brand_id,
    bp.brand_name,
    bp.category,
    (1 - (bp.identity_embedding <=> query_embedding))::FLOAT AS similarity,
    bp.identity_text
  FROM brand_profiles bp
  WHERE bp.identity_embedding IS NOT NULL
    AND (filter_category IS NULL OR bp.category = filter_category)
    AND (1 - (bp.identity_embedding <=> query_embedding)) > match_threshold
  ORDER BY bp.identity_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant access to the service role
GRANT EXECUTE ON FUNCTION match_brands_by_embedding TO service_role;
