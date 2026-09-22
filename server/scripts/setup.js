/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { supabase } = require('../src/lib/supabase');
const config = require('../src/config');

async function main() {
  console.log('[setup] Verifying Supabase credentials...');
  if (!config.supabaseUrl || !config.supabaseSecretKey) {
    console.error('[setup] SUPABASE_URL or SUPABASE_SECRET_KEY missing. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }

  // Verify database connectivity + schema presence
  const probe = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (probe.error && probe.error.code === '42P01') {
    console.error('');
    console.error('[setup] Database tables are missing.');
    console.error('[setup] >>> Open your Supabase dashboard -> SQL Editor and run server/db/schema.sql.');
    console.error('[setup] >>> Then re-run: npm run setup && npm run seed');
    process.exit(1);
  }
  if (probe.error) {
    console.error('[setup] Could not connect to Supabase:', probe.error.message);
    process.exit(1);
  }
  console.log('[setup] Database connection OK.');

  // Create public storage buckets
  const buckets = [config.buckets.media, config.buckets.profile, config.buckets.cv];
  for (const bucket of buckets) {
    const existing = await supabase.storage.getBucket(bucket);
    if (!existing.error) {
      console.log(`[setup] Bucket "${bucket}" already exists.`);
      continue;
    }
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && error.message && !/already exists/i.test(error.message)) {
      console.warn(`[setup] Could not create bucket "${bucket}":`, error.message);
    } else {
      console.log(`[setup] Created public bucket "${bucket}".`);
    }
  }

  console.log('[setup] Done. Next step: npm run seed');
}

main().catch((e) => {
  console.error('[setup] Failed:', e.message);
  process.exit(1);
});