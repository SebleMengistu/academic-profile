// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'PROFILE_OWNER' | 'EDITOR';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface Profile {
  _id: string;
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  profilePhoto?: string;
  professionalTitle?: string;
  currentPosition?: string;
  department?: string;
  faculty?: string;
  institution?: string;
  shortBio?: string;
  biography?: string;
  researchStatement?: string;
  careerSummary?: string;
  email?: string;
  phone?: string;
  office?: string;
  address?: string;
  country?: string;
  orcid?: string;
  profileType?: string;
  cvUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  updatedAt: string;
}

// ── Academic Appointment ──────────────────────────────────────────────────────
export interface AcademicAppointment {
  _id: string;
  title: string;
  institution: string;
  faculty?: string;
  department?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  displayOrder: number;
}

// ── Education ─────────────────────────────────────────────────────────────────
export interface Education {
  _id: string;
  degree: string;
  field: string;
  institution: string;
  location?: string;
  country?: string;
  startDate?: string;
  completionDate?: string;
  thesisTitle?: string;
  thesisUrl?: string;
  description?: string;
  displayOrder: number;
}

// ── Research Area ─────────────────────────────────────────────────────────────
export interface ResearchArea {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
}

// ── Publication ───────────────────────────────────────────────────────────────
export type PublicationType =
  | 'Journal Article'
  | 'Conference Paper'
  | 'Book'
  | 'Book Chapter'
  | 'Technical Report'
  | 'Patent'
  | 'Dataset'
  | 'Software'
  | 'Thesis'
  | 'Poster'
  | 'Other';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface PublicationAuthor {
  name: string;
  affiliation?: string;
  orcid?: string;
  isCorresponding?: boolean;
  order: number;
}

export interface Publication {
  _id: string;
  title: string;
  slug: string;
  abstract?: string;
  publicationType: PublicationType;
  authors: PublicationAuthor[];
  journal?: string;
  conference?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year: number;
  publicationDate?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  keywords: string[];
  citation?: string;
  pdfUrl?: string;
  externalUrl?: string;
  researchAreas: ResearchArea[] | string[];
  featured: boolean;
  status: ContentStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ── Funded Research ───────────────────────────────────────────────────────────
export type FundingType =
  | 'Grant'
  | 'Contract Research'
  | 'Industry Funding'
  | 'Government Funding'
  | 'University Funding'
  | 'Fellowship'
  | 'Scholarship'
  | 'Other';

export interface TeamMember {
  name: string;
  role: string;
  affiliation?: string;
}

export interface FundedResearch {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  fundingType: FundingType;
  funder: string;
  fundingScheme?: string;
  grantNumber?: string;
  amount?: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  principalInvestigator: string;
  teamMembers: TeamMember[];
  researchAreas: ResearchArea[] | string[];
  externalUrl?: string;
  featured: boolean;
  contentStatus: ContentStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ── Teaching ──────────────────────────────────────────────────────────────────
export interface Teaching {
  _id: string;
  courseName: string;
  courseCode?: string;
  institution: string;
  level: string;
  semester?: string;
  year?: number;
  description?: string;
  displayOrder: number;
}

// ── Supervision ───────────────────────────────────────────────────────────────
export interface Supervision {
  _id: string;
  studentName: string;
  degree: string;
  researchTopic: string;
  role: string;
  startDate?: string;
  completionDate?: string;
  status: 'Current' | 'Completed' | 'Withdrawn';
  coSupervisors?: string[];
  description?: string;
  institution?: string;
}

// ── Service & Leadership ──────────────────────────────────────────────────────
export interface ServiceLeadership {
  _id: string;
  role: string;
  organization: string;
  type: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  externalUrl?: string;
  displayOrder: number;
}

// ── Award ─────────────────────────────────────────────────────────────────────
export interface Award {
  _id: string;
  name: string;
  organization: string;
  date?: string;
  category?: string;
  description?: string;
  certificateUrl?: string;
  externalUrl?: string;
  displayOrder: number;
}

// ── Media ─────────────────────────────────────────────────────────────────────
export type MediaType = 'Video' | 'Image' | 'Interview' | 'Podcast' | 'News' | 'Presentation' | 'Other';

export interface Media {
  _id: string;
  title: string;
  slug: string;
  type: MediaType;
  description?: string;
  thumbnailUrl?: string;
  url?: string;
  date?: string;
  caption?: string;
  credit?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  views: number;
  createdAt: string;
}

// ── Membership ────────────────────────────────────────────────────────────────
export interface Membership {
  _id: string;
  organization: string;
  role?: string;
  membershipType?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  externalUrl?: string;
  displayOrder: number;
}

// ── External Profile ──────────────────────────────────────────────────────────
export interface ExternalProfile {
  _id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
}

// ── Contact ───────────────────────────────────────────────────────────────────
export type ContactStatus = 'New' | 'Read' | 'Replied' | 'Archived' | 'Spam';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export interface AuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalPublications: number;
  fundedProjects: number;
  awards: number;
  teachingRecords: number;
  mediaItems: number;
  newMessages: number;
  totalUsers: number;
}

export interface ChartDataPoint {
  _id: string | number;
  count: number;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface Settings {
  siteName: string;
  siteUrl?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    twitterHandle?: string;
  };
  maintenanceMode: boolean;
  allowContactForm: boolean;
  analyticsEnabled: boolean;
  googleAnalyticsId?: string;
  footerText?: string;
}
