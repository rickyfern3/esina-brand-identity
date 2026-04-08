/**
 * API key authentication + in-memory rate limiting.
 *
 * Rate limit: 100 requests per hour per API key.
 * The in-process store resets when the serverless function cold-starts,
 * which is fine for a simple 100 req/hr guard at this scale.
 * For production, swap the store for a Redis / Upstash KV.
 */

const RATE_LIMIT_MAX = 100;       // requests allowed
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

interface RateEntry {
  count: number;
  windowStart: number;
}

// Module-level store (persists within a single serverless instance)
const rateLimitStore = new Map<string, RateEntry>();

export interface AuthResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Validates the API key from the Authorization header and enforces rate limit.
 * Expected header: `Authorization: Bearer <key>`
 */
export function checkApiKey(request: Request): AuthResult {
  const validKey = process.env.ESINA_API_KEY;

  if (!validKey) {
    // Env var not configured — fail open in dev, fail closed in prod
    if (process.env.NODE_ENV === "production") {
      return { ok: false, status: 503, error: "API key not configured on server" };
    }
    return { ok: true }; // dev: allow through
  }

  // Same-origin requests from the ESINA UI are always allowed (no key needed)
  // They set x-esina-internal: 1 in the fetch call
  if (request.headers.get("x-esina-internal") === "1") {
    return { ok: true };
  }

  // Extract key from Authorization header
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, providedKey] = authHeader.split(" ");

  if (scheme !== "Bearer" || !providedKey) {
    return {
      ok: false,
      status: 401,
      error: "Missing or malformed Authorization header. Expected: Bearer <key>",
    };
  }

  if (providedKey !== validKey) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  // Rate limiting
  const now = Date.now();
  const entry = rateLimitStore.get(providedKey);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW) {
    // New window
    rateLimitStore.set(providedKey, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const resetInSec = Math.ceil(
      (RATE_LIMIT_WINDOW - (now - entry.windowStart)) / 1000
    );
    return {
      ok: false,
      status: 429,
      error: `Rate limit exceeded. ${RATE_LIMIT_MAX} requests per hour. Resets in ${resetInSec}s.`,
    };
  }

  entry.count += 1;
  return { ok: true };
}
