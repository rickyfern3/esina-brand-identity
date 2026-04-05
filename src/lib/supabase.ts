import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — createClient() is NOT called at module load time.
// This prevents build failures when env vars aren't yet available.
// We use SupabaseClient (with default any generics) so query result types stay as `any`.
let _client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getClient();
    const val = client[prop as keyof SupabaseClient];
    // eslint-disable-next-line @typescript-eslint/ban-types
    return typeof val === "function" ? (val as Function).bind(client) : val;
  },
});
