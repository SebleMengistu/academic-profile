// Auto-maps Supabase table rows to TypeScript types.
// Extend as you add columns to your Supabase tables.

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: 'SUPER_ADMIN' | 'PROFILE_OWNER' | 'EDITOR';
  is_active: boolean;
  last_login: string | null;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  title: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  display_name: string;
  profile_photo: string | null;
  profile_photo_public_id: string | null;
  professional_title: string | null;
  current_position: string | null;
  department: string | null;
  faculty: string | null;
  institution: string | null;
  short_bio: string | null;
  biography: string | null;
  research_statement: string | null;
  career_summary: string | null;
  email: string | null;
  phone: string | null;
  office: string | null;
  address: string | null;
  country: string | null;
  orcid: string | null;
  profile_type: string | null;
  cv_url: string | null;
  cv_public_id: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  created_at: string;
  updated_at: string;
}

export interface AppointmentRow {
  id: string;
  title: string;
  institution: string;
  faculty: string | null;
  department: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationRow {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string | null;
  country: string | null;
  start_date: string | null;
  completion_date: string | null;
  thesis_title: string | null;
  thesis_url: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchAreaRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicationRow {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  publication_type: string;
  authors: unknown; // JSONB
  journal: string | null;
  conference: string | null;
  publisher: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  year: number;
  publication_date: string | null;
  doi: string | null;
  isbn: string | null;
  issn: string | null;
  keywords: string[];
  citation: string | null;
  pdf_url: string | null;
  pdf_public_id: string | null;
  external_url: string | null;
  research_area_ids: string[];
  featured: boolean;
  status: string;
  visibility: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface FundedResearchRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  funding_type: string;
  funder: string;
  funding_scheme: string | null;
  grant_number: string | null;
  amount: number | null;
  currency: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  principal_investigator: string;
  team_members: unknown; // JSONB
  research_area_ids: string[];
  external_url: string | null;
  featured: boolean;
  content_status: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface TeachingRow {
  id: string;
  course_name: string;
  course_code: string | null;
  institution: string;
  level: string;
  semester: string | null;
  year: number | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupervisionRow {
  id: string;
  student_name: string;
  degree: string;
  research_topic: string;
  role: string;
  start_date: string | null;
  completion_date: string | null;
  status: string;
  co_supervisors: string[];
  description: string | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceLeadershipRow {
  id: string;
  role: string;
  organization: string;
  type: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  external_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AwardRow {
  id: string;
  name: string;
  organization: string;
  date: string | null;
  category: string | null;
  description: string | null;
  certificate_url: string | null;
  certificate_public_id: string | null;
  external_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
  url: string | null;
  date: string | null;
  caption: string | null;
  credit: string | null;
  visibility: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipRow {
  id: string;
  organization: string;
  role: string | null;
  membership_type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  external_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExternalProfileRow {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: unknown | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SettingsRow {
  id: string;
  site_name: string;
  site_url: string | null;
  seo: unknown | null; // JSONB
  maintenance_mode: boolean;
  allow_contact_form: boolean;
  analytics_enabled: boolean;
  google_analytics_id: string | null;
  footer_text: string | null;
  created_at: string;
  updated_at: string;
}
