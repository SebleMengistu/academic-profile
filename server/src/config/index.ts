import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const optional = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),

  supabase: {
    url: optional('SUPABASE_URL'),
    anonKey: optional('SUPABASE_ANON_KEY'),
    serviceKey: optional('SUPABASE_SERVICE_KEY'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev_jwt_secret_change_in_production'),
    expiresIn: optional('JWT_EXPIRES_IN', '15m'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME'),
    apiKey: optional('CLOUDINARY_API_KEY'),
    apiSecret: optional('CLOUDINARY_API_SECRET'),
  },

  smtp: {
    host: optional('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    secure: optional('SMTP_SECURE', 'false') === 'true',
    user: optional('SMTP_USER'),
    password: optional('SMTP_PASSWORD'),
    from: optional('SMTP_FROM', 'noreply@example.com'),
  },

  adminEmail: optional('ADMIN_EMAIL', 'admin@example.com'),

  isProduction: optional('NODE_ENV', 'development') === 'production',
  isDevelopment: optional('NODE_ENV', 'development') === 'development',
};

export default config;
