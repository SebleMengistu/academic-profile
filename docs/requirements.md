# Requirements

## 1. Technology Stack

### Frontend
- React 19+
- TypeScript
- Vite
- React Router v7
- Tailwind CSS
- Axios
- TanStack Query v5
- Zustand (auth state)
- React Hook Form + Zod
- TipTap rich-text editor
- Lucide React icons
- React Helmet Async (SEO)

### Backend
- Node.js 22+
- Express.js
- TypeScript
- Mongoose (MongoDB ODM)
- JWT authentication + HTTP-only cookies
- Zod / Joi validation
- Multer for file uploads
- Sharp for image processing
- Nodemailer
- Helmet, CORS, express-rate-limit
- express-mongo-sanitize

### Database
- MongoDB (local dev)
- MongoDB Atlas (production)

### Storage
- Cloudinary for images and PDFs

### Deployment
- Frontend → Vercel / Netlify
- Backend → Render / Railway
- Database → MongoDB Atlas
- Media → Cloudinary

---

## 2. Functional Requirements

### Public Website

| ID | Requirement |
|----|-------------|
| PUB-01 | Display researcher profile with photo, title, institution, bio |
| PUB-02 | Show academic appointments timeline |
| PUB-03 | Show education history |
| PUB-04 | List research areas with descriptions |
| PUB-05 | List and search publications with filters (year, type, research area) |
| PUB-06 | Show individual publication detail with abstract, authors, DOI |
| PUB-07 | List funded research projects |
| PUB-08 | Show individual project detail with team members |
| PUB-09 | List teaching courses grouped by year |
| PUB-10 | List current and past student supervision |
| PUB-11 | List service & leadership roles |
| PUB-12 | List professional memberships |
| PUB-13 | List awards and honours |
| PUB-14 | Display media items (videos, images, interviews, news) |
| PUB-15 | Contact form with email notification |
| PUB-16 | Links to external academic profiles (ORCID, Google Scholar, etc.) |
| PUB-17 | API pagination (page + limit query params) |
| PUB-18 | Full-text search across publications, research, media |

### Admin CMS

| ID | Requirement |
|----|-------------|
| ADM-01 | Admin login with JWT + HTTP-only cookies |
| ADM-02 | Refresh token rotation |
| ADM-03 | Dashboard with statistics and charts |
| ADM-04 | CRUD for profile, biography, research statement |
| ADM-05 | CRUD for academic appointments |
| ADM-06 | CRUD for education |
| ADM-07 | CRUD for research areas |
| ADM-08 | CRUD for publications with rich text abstract, PDF upload |
| ADM-09 | CRUD for funded research projects |
| ADM-10 | CRUD for teaching records |
| ADM-11 | CRUD for student supervision |
| ADM-12 | CRUD for service & leadership |
| ADM-13 | CRUD for awards |
| ADM-14 | CRUD for media items with thumbnail upload |
| ADM-15 | CRUD for memberships |
| ADM-16 | CRUD for external profile links |
| ADM-17 | View and manage contact messages |
| ADM-18 | Draft / Publish / Archive workflow |
| ADM-19 | User management (SUPER_ADMIN only) |
| ADM-20 | Site settings (SEO, analytics, maintenance mode) |
| ADM-21 | Audit log (every create/update/delete recorded) |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Passwords hashed with bcrypt (12 rounds) |
| NFR-02 | Security | JWT access tokens expire in 15 minutes |
| NFR-03 | Security | Refresh tokens expire in 7 days; rotated on each use |
| NFR-04 | Security | HTTP-only secure cookies for tokens |
| NFR-05 | Security | Rate limiting on authentication endpoints |
| NFR-06 | Security | MongoDB injection sanitisation |
| NFR-07 | Security | XSS sanitisation on rich text content |
| NFR-08 | Security | Helmet security headers |
| NFR-09 | Performance | Lazy-loaded routes (code splitting) |
| NFR-10 | Performance | TanStack Query caching (5 min stale time) |
| NFR-11 | Performance | API pagination — never return all records at once |
| NFR-12 | Performance | MongoDB indexes on frequently queried fields |
| NFR-13 | Performance | Images processed through Sharp before Cloudinary upload |
| NFR-14 | Accessibility | WCAG 2.1 AA target |
| NFR-15 | Accessibility | Keyboard navigation and focus management |
| NFR-16 | Accessibility | Semantic HTML and ARIA labels |
| NFR-17 | Accessibility | Screen-reader support |
| NFR-18 | SEO | Meta tags, Open Graph, Twitter Card via React Helmet Async |
| NFR-19 | SEO | Canonical URLs |
| NFR-20 | Responsive | Supports 320px–1920px viewport widths |

---

## 4. User Roles & Permissions

| Permission | SUPER_ADMIN | PROFILE_OWNER | EDITOR |
|------------|:-----------:|:-------------:|:------:|
| Read all content | ✓ | ✓ | ✓ |
| Create/edit/delete content | ✓ | ✓ | ✓ |
| Publish / unpublish | ✓ | ✓ | ✓ |
| View contact messages | ✓ | ✓ | ✓ |
| Manage settings | ✓ | ✓ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| View audit logs | ✓ | ✗ | ✗ |

---

## 5. Content Status Workflow

```
DRAFT ──► PUBLISHED ──► ARCHIVED
  ▲                        │
  └────────────────────────┘ (restore)
```

All content items (publications, funded research) support:
- **Save Draft** — save without publishing
- **Publish** — make visible on public site
- **Unpublish** — revert to draft
- **Archive** — remove from public view, keep in CMS

---

## 6. Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile S | 320px |
| Mobile M | 375px |
| Mobile L | 430px |
| Tablet | 768px |
| Tablet L | 1024px |
| Desktop | 1280px |
| Desktop L | 1440px |
| Desktop XL | 1920px |
