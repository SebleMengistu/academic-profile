import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLayout from '../admin/layouts/AdminLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminLogin        = React.lazy(() => import('../admin/pages/Login'));
const AdminDashboard    = React.lazy(() => import('../admin/pages/Dashboard'));
const AdminProfile      = React.lazy(() => import('../admin/pages/Profile'));
const AdminAppointments = React.lazy(() => import('../admin/pages/Appointments'));
const AdminEducation    = React.lazy(() => import('../admin/pages/EducationAdmin'));
const AdminPublications = React.lazy(() => import('../admin/pages/Publications'));
const AdminPublicationForm = React.lazy(() => import('../admin/pages/PublicationForm'));
const AdminResearchAreas = React.lazy(() => import('../admin/pages/ResearchAreas'));
const AdminFundedResearch = React.lazy(() => import('../admin/pages/FundedResearchAdmin'));
const AdminTeaching     = React.lazy(() => import('../admin/pages/TeachingAdmin'));
const AdminSupervision  = React.lazy(() => import('../admin/pages/SupervisionAdmin'));
const AdminService      = React.lazy(() => import('../admin/pages/ServiceAdmin'));
const AdminAwards       = React.lazy(() => import('../admin/pages/AwardsAdmin'));
const AdminMedia        = React.lazy(() => import('../admin/pages/MediaAdmin'));
const AdminMemberships  = React.lazy(() => import('../admin/pages/MembershipsAdmin'));
const AdminExternalProfiles = React.lazy(() => import('../admin/pages/ExternalProfilesAdmin'));
const AdminContact      = React.lazy(() => import('../admin/pages/ContactAdmin'));
const AdminUsers        = React.lazy(() => import('../admin/pages/UsersAdmin'));
const AdminSettings     = React.lazy(() => import('../admin/pages/SettingsAdmin'));
const AdminAuditLogs    = React.lazy(() => import('../admin/pages/AuditLogs'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export const AdminRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullPage />}>
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index                    element={<AdminDashboard />} />
                <Route path="profile"           element={<AdminProfile />} />
                <Route path="appointments"      element={<AdminAppointments />} />
                <Route path="education"         element={<AdminEducation />} />
                <Route path="publications"      element={<AdminPublications />} />
                <Route path="publications/new"  element={<AdminPublicationForm />} />
                <Route path="publications/:id/edit" element={<AdminPublicationForm />} />
                <Route path="research-areas"    element={<AdminResearchAreas />} />
                <Route path="funded-research"   element={<AdminFundedResearch />} />
                <Route path="teaching"          element={<AdminTeaching />} />
                <Route path="supervision"       element={<AdminSupervision />} />
                <Route path="service"           element={<AdminService />} />
                <Route path="awards"            element={<AdminAwards />} />
                <Route path="media"             element={<AdminMedia />} />
                <Route path="memberships"       element={<AdminMemberships />} />
                <Route path="external-profiles" element={<AdminExternalProfiles />} />
                <Route path="contact"           element={<AdminContact />} />
                <Route path="users"             element={<AdminUsers />} />
                <Route path="settings"          element={<AdminSettings />} />
                <Route path="audit-logs"        element={<AdminAuditLogs />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);
