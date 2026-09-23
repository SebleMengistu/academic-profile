import app from './app';
import { connectDB, disconnectDB } from './config/database';
import config from './config';

const start = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Environment: ${config.env}`);
    console.log(`[Server] Client URL: ${config.clientUrl}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[Server] ${signal} — shutting down`);
    server.close(async () => {
      await disconnectDB();
      console.log('[Server] Closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (r) => console.error('[Unhandled Rejection]', r));
  process.on('uncaughtException',  (e) => { console.error('[Uncaught Exception]', e); process.exit(1); });
};

start();
