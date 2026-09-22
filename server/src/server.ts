import app from './app';
import config from './config';
import supabase from './lib/supabase';

const PORT = config.port;

const start = async () => {
  // Verify Supabase connection
  if (config.supabase.url && config.supabase.serviceKey) {
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) {
      console.error('[Supabase] Connection check failed:', error.message);
    } else {
      console.log('[Supabase] Connected successfully');
    }
  } else {
    console.warn('[Supabase] Credentials not set — running without database');
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${config.env}`);
    console.log(`[Server] Client URL: ${config.clientUrl}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[Server] ${signal} — shutting down`);
    server.close(() => { console.log('[Server] Closed'); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (r) => console.error('[Unhandled Rejection]', r));
  process.on('uncaughtException',  (e) => { console.error('[Uncaught Exception]', e); process.exit(1); });
};

start();
