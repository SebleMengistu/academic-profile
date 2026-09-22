# Academic Researcher Profile System

A full-stack MERN application for academic researcher profiles — publications, funded research, teaching, supervision, media, and a complete admin CMS.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, TipTap |
| Backend   | Node.js 22, Express, TypeScript, Mongoose |
| Database  | MongoDB / MongoDB Atlas |
| Storage   | Cloudinary (images, PDFs) |
| Auth      | JWT, HTTP-only cookies, refresh token rotation |
| Email     | Nodemailer (SMTP) |

---

## Project Structure

```
academic-profile/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── admin/           # Admin dashboard pages & layouts
│       ├── components/      # Shared UI components
│       ├── pages/           # Public-facing pages
│       ├── services/        # Axios API services
│       ├── store/           # Zustand auth store
│       ├── types/           # TypeScript types
│       └── utils/           # Formatters, helpers
│
├── server/                  # Express backend
│   └── src/
│       ├── config/          # DB connection, env config
│       ├── controllers/     # Route handlers
│       ├── middleware/       # Auth, upload, validate, error
│       ├── models/          # Mongoose models
│       ├── routes/          # Express routers
│       ├── services/        # Cloudinary, email, audit
│       ├── types/           # Shared TypeScript types
│       ├── utils/           # JWT, slug, pagination helpers
│       └── validators/      # Joi validation schemas
│
└── docs/
    ├── requirements.md
    ├── api.md
    └── database.md
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- MongoDB (local) or MongoDB Atlas URI
- Cloudinary account (optional — media upload)
- SMTP credentials (optional — email)

### 1. Clone & install

```bash
git clone <repo-url> academic-profile
cd academic-profile
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

Minimum required values:

```env
MONGO_URI=mongodb://localhost:27017/academic_profile
JWT_SECRET=your_long_random_secret
JWT_REFRESH_SECRET=another_long_random_secret
CLIENT_URL=http://localhost:5173
```

### 3. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api  
- Admin: http://localhost:5173/admin

### 4. Create first admin user

Start the server, then run:

```bash
cd server
node -e "
const mongoose = require('./dist/config/database');
// Or use ts-node:
// npx ts-node -e 'require(\"./src/scripts/seed\")'
"
```

Or POST directly (development only):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin@example.com","password":"Admin1234!","role":"SUPER_ADMIN"}'
```

> After creating the first admin, disable public registration.

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend concurrently |
| `npm run dev:server` | Run backend only |
| `npm run dev:client` | Run frontend only |
| `npm run build` | Build frontend |
| `npm run build:server` | Compile backend TypeScript |
| `npm run install:all` | Install all dependencies |

---

## Environment Variables

See `server/.env.example` for the full list.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `CLOUDINARY_*` | No | Media storage (images, PDFs) |
| `SMTP_*` | No | Email delivery |
| `ADMIN_EMAIL` | No | Receives contact form submissions |

---

## Public Website Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/about` | Biography, appointments |
| `/research` | Research areas, funded projects |
| `/publications` | Searchable publication list |
| `/publications/:slug` | Publication detail |
| `/funded-research/:slug` | Project detail |
| `/teaching` | Courses & supervision |
| `/service-leadership` | Service, memberships |
| `/education` | Academic qualifications |
| `/awards` | Awards & honours |
| `/media` | Videos, interviews, news |
| `/media/:slug` | Media detail |
| `/contact` | Contact form |

---

## Admin Routes

All routes under `/admin/*` require authentication.

| Path | Page |
|------|------|
| `/admin/login` | Login |
| `/admin` | Dashboard |
| `/admin/profile` | Profile editor |
| `/admin/publications` | Publications CMS |
| `/admin/research-areas` | Research areas |
| `/admin/funded-research` | Funded projects |
| `/admin/teaching` | Teaching records |
| `/admin/supervision` | Student supervision |
| `/admin/service` | Service & leadership |
| `/admin/awards` | Awards |
| `/admin/media` | Media library |
| `/admin/contact` | Contact messages |
| `/admin/users` | User management |
| `/admin/settings` | Site settings |
| `/admin/audit-logs` | Audit trail |

---

## User Roles

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full access including user management, settings, audit logs |
| `PROFILE_OWNER` | All content + settings, no user management |
| `EDITOR` | Create/edit/delete content, no users or settings |

---

## Deployment

### Frontend (Vercel / Netlify)

```bash
cd client
npm run build
# Deploy the dist/ folder
```

Set environment variable:
```
VITE_API_URL=https://your-api.onrender.com/api
```

### Backend (Render / Railway)

- Build command: `npm run build:server`
- Start command: `node dist/server.js`
- Set all environment variables from `.env.example`

### Database (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist your server IP
3. Set `MONGO_URI` to the Atlas connection string

---

## Security Notes

- All admin routes are JWT-protected with HTTP-only cookies
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting on auth endpoints (10 req / 15 min)
- MongoDB injection sanitised via `express-mongo-sanitize`
- HTML content sanitised with `xss` before storage
- Helmet sets security headers
- Never commit `.env` to version control

---

## License

MIT
