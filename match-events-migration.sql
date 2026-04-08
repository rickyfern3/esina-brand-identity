-- ── match_events migration ───────────────────────────────────────────
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ──────────────────────────────────────────────────────────────────────

-- 1. Create the match_events table
CREATE TABLE IF NOT EXISTS public.match_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL DEFAULT (now() + interval '30 days'),

  -- Who was matched
  consumer_session   text,                        -- anonymous session ID or user ID
  preference_text    text,                        -- raw preference input

  -- What was matched
  brand_profile_id   uuid REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  brand_name         text,
  similarity_score   numeric(5,4),                -- 0.0000 – 1.0000

  -- Conversion tracking
  attribution_status text NOT NULL DEFAULT 'pending'  -- pending | converted | expired
    CHECK (attribution_status IN ('pending', 'converted', 'expired')),
  converted_at       timestamptz,
  conversion_type    text                         -- click | purchase | signup etc.
);

-- 2. Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS match_events_expires_at_status_idx
  ON public.match_events (expires_at, attribution_status);

-- 3. RLS: service role only (no public reads)
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.match_events
  FOR ALL TO service_role USING (true);

-- 4. Cleanup function — deletes pending rows past their expiry
--    Call this via the /api/cleanup-expired-matches route or pg_cron
CREATE OR REPLACE FUNCTION public.cleanup_expired_match_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.match_events
  WHERE expires_at < NOW()
    AND attribution_status = 'pending';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 5. (Optional) Schedule via pg_cron if enabled on your Supabase plan
--    Uncomment and run separately if pg_cron is available:
--
-- SELECT cron.schedule(
--   'cleanup-expired-match-events',
--   '0 3 * * *',   -- daily at 03:00 UTC
--   $$SELECT public.cleanup_expired_match_events()$$
-- );
