import { createClient } from "@supabase/supabase-js";

// Lazy singleton — createClient() is NOT called at module load time.
// This prevents build failures when env vars aren't yet available.
let _client: ReturnType<typeof createClient> | undefined;

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    const client = getClient();
    const value = client[prop as keyof typeof client];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
