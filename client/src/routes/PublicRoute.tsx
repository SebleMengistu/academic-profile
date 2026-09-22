import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home         = React.lazy(() => import('../pages/Home/Home'));
const About        = React.lazy(() => import('../pages/About/About'));
const Research     = React.lazy(() => import('../pages/Research/Research'));
const Publications = React.lazy(() => import('../pages/Publications/Publications'));
const PublicationDetail = React.lazy(() => import('../pages/Publications/PublicationDetail'));
const FundedResearch    = React.lazy(() => import('../pages/FundedResearch/FundedResearch'));
const FundedResearchDetail = React.lazy(() => import('../pages/FundedResearch/FundedResearchDetail'));
const Teaching     = React.lazy(() => import('../pages/Teaching/Teaching'));
const Supervision  = React.lazy(() => import('../pages/Supervision/Supervision'));
const Service      = React.lazy(() => import('../pages/Service/Service'));
const Education    = React.lazy(() => import('../pages/Education/Education'));
const Awards       = React.lazy(() => import('../pages/Awards/Awards'));
const Media        = React.lazy(() => import('../pages/Media/Media'));
const MediaDetail  = React.lazy(() => import('../pages/Media/MediaDetail'));
const Contact      = React.lazy(() => import('../pages/Contact/Contact'));
const NotFound     = React.lazy(() => import('../pages/NotFound'));

export const PublicRoutes = () => (
  <PublicLayout>
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        <Route path="/"                         element={<Home />} />
        <Route path="/about"                    element={<About />} />
        <Route path="/research"                 element={<Research />} />
        <Route path="/publications"             element={<Publications />} />
        <Route path="/publications/:slug"       element={<PublicationDetail />} />
        <Route path="/funded-research"          element={<FundedResearch />} />
        <Route path="/funded-research/:slug"    element={<FundedResearchDetail />} />
        <Route path="/teaching"                 element={<Teaching />} />
        <Route path="/supervision"              element={<Supervision />} />
        <Route path="/service-leadership"       element={<Service />} />
        <Route path="/education"                element={<Education />} />
        <Route path="/awards"                   element={<Awards />} />
        <Route path="/media"                    element={<Media />} />
        <Route path="/media/:slug"              element={<MediaDetail />} />
        <Route path="/contact"                  element={<Contact />} />
        <Route path="*"                         element={<NotFound />} />
      </Routes>
    </Suspense>
  </PublicLayout>
);
