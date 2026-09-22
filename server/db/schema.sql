-- ============================================================
--  Academic Profile — Supabase PostgreSQL Schema
--  Run this entire file in the Supabase SQL Editor
--  (Project → SQL Editor → New Query → paste → Run)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helper: auto-update updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'EDITOR'
                    CHECK (role IN ('SUPER_ADMIN','PROFILE_OWNER','EDITOR')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login      TIMESTAMPTZ,
  refresh_token   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- PROFILE  (single row)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT,
  first_name              TEXT NOT NULL,
  middle_name             TEXT,
  last_name               TEXT NOT NULL,
  display_name            TEXT NOT NULL,
  profile_photo           TEXT,
  profile_photo_public_id TEXT,
  professional_title      TEXT,
  current_position        TEXT,
  department              TEXT,
  faculty                 TEXT,
  institution             TEXT,
  short_bio               TEXT,
  biography               TEXT,
  research_statement      TEXT,
  career_summary          TEXT,
  email                   TEXT,
  phone                   TEXT,
  office                  TEXT,
  address                 TEXT,
  country                 TEXT,
  orcid                   TEXT,
  profile_type            TEXT DEFAULT 'Academic',
  cv_url                  TEXT,
  cv_public_id            TEXT,
  visibility              TEXT NOT NULL DEFAULT 'PUBLIC'
                            CHECK (visibility IN ('PUBLIC','PRIVATE')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ACADEMIC APPOINTMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  institution   TEXT NOT NULL,
  faculty       TEXT,
  department    TEXT,
  location      TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE,
  is_current    BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON academic_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_appointments_order ON academic_appointments(display_order);

-- ─────────────────────────────────────────────────────────────
-- EDUCATION
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree          TEXT NOT NULL,
  field           TEXT NOT NULL,
  institution     TEXT NOT NULL,
  location        TEXT,
  country         TEXT,
  start_date      DATE,
  completion_date DATE,
  thesis_title    TEXT,
  thesis_url      TEXT,
  description     TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_education_order ON education(display_order);

-- ─────────────────────────────────────────────────────────────
-- RESEARCH AREAS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_areas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER research_areas_updated_at
  BEFORE UPDATE ON research_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_research_areas_slug ON research_areas(slug);

-- ─────────────────────────────────────────────────────────────
-- PUBLICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  abstract         TEXT,
  publication_type TEXT NOT NULL,
  authors          JSONB NOT NULL DEFAULT '[]',
  journal          TEXT,
  conference       TEXT,
  publisher        TEXT,
  volume           TEXT,
  issue            TEXT,
  pages            TEXT,
  year             INT NOT NULL,
  publication_date DATE,
  doi              TEXT,
  isbn             TEXT,
  issn             TEXT,
  keywords         TEXT[] NOT NULL DEFAULT '{}',
  citation         TEXT,
  pdf_url          TEXT,
  pdf_public_id    TEXT,
  external_url     TEXT,
  research_area_ids UUID[] NOT NULL DEFAULT '{}',
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'DRAFT'
                     CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED','SCHEDULED')),
  visibility       TEXT NOT NULL DEFAULT 'PUBLIC'
                     CHECK (visibility IN ('PUBLIC','PRIVATE')),
  views            INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_publications_slug     ON publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_year     ON publications(year DESC);
CREATE INDEX IF NOT EXISTS idx_publications_type     ON publications(publication_type);
CREATE INDEX IF NOT EXISTS idx_publications_status   ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_featured ON publications(featured);
CREATE INDEX IF NOT EXISTS idx_publications_search   ON publications
  USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'')));

-- ─────────────────────────────────────────────────────────────
-- FUNDED RESEARCH
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS funded_research (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                  TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  description            TEXT,
  funding_type           TEXT NOT NULL,
  funder                 TEXT NOT NULL,
  funding_scheme         TEXT,
  grant_number           TEXT,
  amount                 NUMERIC,
  currency               TEXT DEFAULT 'USD',
  start_date             DATE NOT NULL,
  end_date               DATE,
  status                 TEXT NOT NULL DEFAULT 'ACTIVE'
                           CHECK (status IN ('ACTIVE','COMPLETED','PENDING','CANCELLED')),
  principal_investigator TEXT NOT NULL,
  team_members           JSONB NOT NULL DEFAULT '[]',
  research_area_ids      UUID[] NOT NULL DEFAULT '{}',
  external_url           TEXT,
  featured               BOOLEAN NOT NULL DEFAULT FALSE,
  content_status         TEXT NOT NULL DEFAULT 'DRAFT'
                           CHECK (content_status IN ('DRAFT','PUBLISHED','ARCHIVED','SCHEDULED')),
  views                  INT NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER funded_research_updated_at
  BEFORE UPDATE ON funded_research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_funded_research_slug   ON funded_research(slug);
CREATE INDEX IF NOT EXISTS idx_funded_research_status ON funded_research(status);
CREATE INDEX IF NOT EXISTS idx_funded_research_start  ON funded_research(start_date DESC);

-- ─────────────────────────────────────────────────────────────
-- TEACHING
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teaching (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_name   TEXT NOT NULL,
  course_code   TEXT,
  institution   TEXT NOT NULL,
  level         TEXT NOT NULL DEFAULT 'Undergraduate',
  semester      TEXT,
  year          INT,
  description   TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER teaching_updated_at
  BEFORE UPDATE ON teaching
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- SUPERVISION
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supervision (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name    TEXT NOT NULL,
  degree          TEXT NOT NULL,
  research_topic  TEXT NOT NULL,
  role            TEXT NOT NULL,
  start_date      DATE,
  completion_date DATE,
  status          TEXT NOT NULL DEFAULT 'Current'
                    CHECK (status IN ('Current','Completed','Withdrawn')),
  co_supervisors  TEXT[] NOT NULL DEFAULT '{}',
  description     TEXT,
  institution     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER supervision_updated_at
  BEFORE UPDATE ON supervision
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- SERVICE & LEADERSHIP
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_leadership (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role          TEXT NOT NULL,
  organization  TEXT NOT NULL,
  type          TEXT NOT NULL,
  description   TEXT,
  start_date    DATE,
  end_date      DATE,
  is_current    BOOLEAN NOT NULL DEFAULT FALSE,
  external_url  TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER service_updated_at
  BEFORE UPDATE ON service_leadership
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- AWARDS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS awards (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  organization          TEXT NOT NULL,
  date                  DATE,
  category              TEXT,
  description           TEXT,
  certificate_url       TEXT,
  certificate_public_id TEXT,
  external_url          TEXT,
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER awards_updated_at
  BEFORE UPDATE ON awards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- MEDIA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  type                TEXT NOT NULL,
  description         TEXT,
  thumbnail_url       TEXT,
  thumbnail_public_id TEXT,
  url                 TEXT,
  date                DATE,
  caption             TEXT,
  credit              TEXT,
  visibility          TEXT NOT NULL DEFAULT 'PUBLIC'
                        CHECK (visibility IN ('PUBLIC','PRIVATE')),
  views               INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_media_slug ON media(slug);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- ─────────────────────────────────────────────────────────────
-- MEMBERSHIPS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization    TEXT NOT NULL,
  role            TEXT,
  membership_type TEXT,
  start_date      DATE,
  end_date        DATE,
  is_current      BOOLEAN NOT NULL DEFAULT TRUE,
  external_url    TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- EXTERNAL PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS external_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform      TEXT NOT NULL,
  label         TEXT NOT NULL,
  url           TEXT NOT NULL,
  icon          TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER external_profiles_updated_at
  BEFORE UPDATE ON external_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- CONTACT MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'New'
                CHECK (status IN ('New','Read','Replied','Archived','Spam')),
  ip_address  TEXT,
  user_agent  TEXT,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_contact_status     ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email  TEXT,
  user_role   TEXT,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- SETTINGS  (single row)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name           TEXT NOT NULL DEFAULT 'Academic Profile',
  site_url            TEXT,
  seo                 JSONB,
  maintenance_mode    BOOLEAN NOT NULL DEFAULT FALSE,
  allow_contact_form  BOOLEAN NOT NULL DEFAULT TRUE,
  analytics_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  google_analytics_id TEXT,
  footer_text         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default settings row
INSERT INTO settings (site_name) VALUES ('Academic Profile')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- All tables are public-read via service key from the server.
-- The server uses the service key which bypasses RLS.
-- Disable RLS on all tables (server handles auth).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users               DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE education           DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas      DISABLE ROW LEVEL SECURITY;
ALTER TABLE publications        DISABLE ROW LEVEL SECURITY;
ALTER TABLE funded_research     DISABLE ROW LEVEL SECURITY;
ALTER TABLE teaching            DISABLE ROW LEVEL SECURITY;
ALTER TABLE supervision         DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_leadership  DISABLE ROW LEVEL SECURITY;
ALTER TABLE awards              DISABLE ROW LEVEL SECURITY;
ALTER TABLE media               DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships         DISABLE ROW LEVEL SECURITY;
ALTER TABLE external_profiles   DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages    DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings            DISABLE ROW LEVEL SECURITY;
