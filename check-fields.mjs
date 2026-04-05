import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://cjyyloeimnemikmsvqjo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeXlsb2VpbW5lbWlrbXN2cWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYyNDM3NSwiZXhwIjoyMDkwMjAwMzc1fQ.6bRB78RFfwzp-3J7wnubpljfsECpgyMDD1jhHfz5goU"
);
const { data } = await supabase.from("brand_profiles").select("brand_name, archetypes, values, style_tags, price_tier, voice_tone, status_signal_type, communities").limit(3);
for (const b of data) {
  console.log(`\n${b.brand_name}:`);
  console.log(`  archetypes: ${JSON.stringify(b.archetypes)}`);
  console.log(`  values: ${JSON.stringify(b.values)}`);
  console.log(`  style_tags: ${JSON.stringify(b.style_tags)}`);
  console.log(`  price_tier: ${b.price_tier}`);
  console.log(`  voice_tone: ${b.voice_tone}`);
  console.log(`  status_signal_type: ${b.status_signal_type}`);
  console.log(`  communities: ${JSON.stringify(b.communities)}`);
}
