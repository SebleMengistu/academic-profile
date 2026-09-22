import app from './app';
import { connectDB, disconnectDB } from './config/database';
import config from './config';

const PORT = config.port;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${config.env}`);
    console.log(`[Server] Client URL: ${config.clientUrl}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      console.log('[Server] Shutdown complete');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err);
    process.exit(1);
  });
};

start();
