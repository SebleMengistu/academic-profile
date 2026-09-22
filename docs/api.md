# API Reference

Base URL: `http://localhost:5000/api`

All admin endpoints require authentication via HTTP-only cookie (`accessToken`) or `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/login
Login and receive JWT tokens in HTTP-only cookies.

**Body:**
```json
{ "email": "admin@example.com", "password": "secret" }
```

**Response 200:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "firstName": "...", "email": "...", "role": "SUPER_ADMIN" }
}
```
Sets `accessToken` (15 min) and `refreshToken` (7 days) HTTP-only cookies.

---

### POST /auth/logout
Invalidates refresh token. Clears cookies.

**Auth required:** Yes

---

### POST /auth/refresh
Exchange refresh token for a new access token.

**Cookie required:** `refreshToken`

---

### GET /auth/me
Get currently authenticated user.

**Auth required:** Yes

---

### PUT /auth/change-password
**Auth required:** Yes

**Body:**
```json
{ "currentPassword": "...", "newPassword": "..." }
```

---

## Public Endpoints

No authentication required.

### Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Get public profile |
| GET | `/appointments` | List academic appointments |
| GET | `/education` | List education records |
| GET | `/external-profiles` | List external academic profiles |
| GET | `/memberships` | List memberships |

---

### Publications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/publications` | List published publications (paginated) |
| GET | `/publications/:slug` | Get publication by slug |

**Query params for GET /publications:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `q` | string | Full-text search |
| `year` | number | Filter by year |
| `type` | string | Filter by publication type |
| `area` | string | Filter by research area ID |

**Paginated response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "pages": 13
  }
}
```

---

### Research

| Method | Path | Description |
|--------|------|-------------|
| GET | `/research-areas` | List all research areas |
| GET | `/funded-research` | List published funded research (paginated) |
| GET | `/funded-research/:slug` | Get project by slug |

---

### Teaching

| Method | Path | Description |
|--------|------|-------------|
| GET | `/teaching` | List teaching records |
| GET | `/supervision` | List supervision records |

---

### Service & Awards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service-leadership` | List service & leadership roles |
| GET | `/awards` | List awards |

---

### Media

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media` | List public media (paginated) |
| GET | `/media/:slug` | Get media item by slug |

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `type` | string | Filter by media type |

---

### Contact

#### POST /contact
Submit a contact form message.

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Collaboration inquiry",
  "message": "Hello, I am interested in..."
}
```

**Response 201:**
```json
{ "message": "Your message has been sent. Thank you!", "id": "..." }
```

---

### Search

#### GET /search?q=robotics
Full-text search across publications, research, and media.

**Response:**
```json
{
  "data": {
    "publications": [...],
    "research": [...],
    "media": [...]
  }
}
```

---

## Admin Endpoints

All admin endpoints are prefixed with `/admin` and require authentication.

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Stats, charts, recent activity |

---

### Profile (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/profile` | Get profile |
| PUT | `/admin/profile` | Update profile (multipart: `photo` file) |

---

### Appointments (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/appointments` | List all |
| POST | `/admin/appointments` | Create |
| PUT | `/admin/appointments/:id` | Update |
| DELETE | `/admin/appointments/:id` | Delete |

---

### Education (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/education` | List all |
| POST | `/admin/education` | Create |
| PUT | `/admin/education/:id` | Update |
| DELETE | `/admin/education/:id` | Delete |

---

### Publications (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/publications` | List all (paginated) |
| GET | `/admin/publications/:id` | Get by ID |
| POST | `/admin/publications` | Create (multipart: `pdf` file) |
| PUT | `/admin/publications/:id` | Update (multipart: `pdf` file) |
| DELETE | `/admin/publications/:id` | Delete |
| PATCH | `/admin/publications/:id/publish` | Publish |

---

### Research Areas (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/research-areas` | List all |
| POST | `/admin/research-areas` | Create |
| PUT | `/admin/research-areas/:id` | Update |
| DELETE | `/admin/research-areas/:id` | Delete |

---

### Funded Research (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/funded-research` | List all (paginated) |
| POST | `/admin/funded-research` | Create |
| PUT | `/admin/funded-research/:id` | Update |
| DELETE | `/admin/funded-research/:id` | Delete |

---

### Teaching (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/teaching` | List all |
| POST | `/admin/teaching` | Create |
| PUT | `/admin/teaching/:id` | Update |
| DELETE | `/admin/teaching/:id` | Delete |

---

### Supervision (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/supervision` | List all |
| POST | `/admin/supervision` | Create |
| PUT | `/admin/supervision/:id` | Update |
| DELETE | `/admin/supervision/:id` | Delete |

---

### Service & Leadership (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/service-leadership` | List all |
| POST | `/admin/service-leadership` | Create |
| PUT | `/admin/service-leadership/:id` | Update |
| DELETE | `/admin/service-leadership/:id` | Delete |

---

### Awards (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/awards` | List all |
| POST | `/admin/awards` | Create |
| PUT | `/admin/awards/:id` | Update |
| DELETE | `/admin/awards/:id` | Delete |

---

### Media (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/media` | List all (paginated) |
| POST | `/admin/media` | Create (multipart: `thumbnail` file) |
| PUT | `/admin/media/:id` | Update (multipart: `thumbnail` file) |
| DELETE | `/admin/media/:id` | Delete |

---

### Memberships (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/memberships` | List all |
| POST | `/admin/memberships` | Create |
| PUT | `/admin/memberships/:id` | Update |
| DELETE | `/admin/memberships/:id` | Delete |

---

### External Profiles (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/external-profiles` | List all |
| POST | `/admin/external-profiles` | Create |
| PUT | `/admin/external-profiles/:id` | Update |
| DELETE | `/admin/external-profiles/:id` | Delete |

---

### Contact Messages (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/contact` | List messages (paginated) |
| GET | `/admin/contact/:id` | Get single message |
| PUT | `/admin/contact/:id` | Update status |
| DELETE | `/admin/contact/:id` | Delete |

**Status values:** `New`, `Read`, `Replied`, `Archived`, `Spam`

---

### Users (Admin — SUPER_ADMIN only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users (paginated) |
| POST | `/admin/users` | Create user |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |

---

### Audit Logs (Admin — SUPER_ADMIN only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/audit-logs` | List logs (paginated) |

**Query params:** `entity`, `action`

---

### Settings (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/settings` | Get settings |
| PUT | `/admin/settings` | Update settings (SUPER_ADMIN / PROFILE_OWNER) |

---

## Error Responses

All errors return:

```json
{ "message": "Human-readable error description" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / invalid input |
| 401 | Unauthenticated (missing or expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate slug/email) |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Validation error (422):

```json
{
  "message": "Validation error",
  "errors": "\"email\" must be a valid email; \"year\" is required"
}
```

### Token expired (401):

```json
{ "message": "Token expired", "code": "TOKEN_EXPIRED" }
```

The client should call `POST /auth/refresh` automatically (handled by the Axios interceptor).

---

## Rate Limiting

| Endpoint group | Limit |
|---------------|-------|
| `/api/auth/login` | 10 requests / 15 minutes per IP |
| All other API endpoints | 200 requests / 15 minutes per IP |
