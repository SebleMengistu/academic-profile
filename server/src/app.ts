import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import config from './config';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  message: 'Too many login attempts' });
app.use(globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (config.isDevelopment) app.use(morgan('dev'));
else app.use(morgan('combined'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'academic-profile-api', env: config.env }));

app.use('/api/auth',  authLimiter, authRoutes);
app.use('/api',       publicRoutes);
app.use('/api/admin', adminRoutes);

// Serve built client in production
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1d' }));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

export default app;
