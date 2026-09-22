import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchAppointments, fetchEducation, fetchExternalProfiles } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateRange } from '../../utils/formatters';
import { MapPin, Mail, Phone, Building, ExternalLink } from 'lucide-react';

export default function About() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, staleTime: Infinity });
  const { data: appointments } = useQuery({ queryKey: ['appointments'], queryFn: fetchAppointments, staleTime: Infinity });
  const { data: extProfiles } = useQuery({ queryKey: ['external-profiles'], queryFn: fetchExternalProfiles, staleTime: Infinity });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!profile) return null;

  return (
    <>
      <SEOHead title="About" description={profile.shortBio} image={profile.profilePhoto} />

      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {profile.profilePhoto && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={profile.profilePhoto}
                alt={profile.displayName}
                className="w-40 h-40 rounded-2xl object-cover shadow-soft border-4 border-white"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-1">{profile.displayName}</h1>
            {profile.professionalTitle && (
              <p className="text-xl text-primary-700 font-medium mb-1">{profile.professionalTitle}</p>
            )}
            {profile.currentPosition && (
              <p className="text-secondary-600 mb-3">{profile.currentPosition}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
              {profile.institution && (
                <span className="flex items-center gap-1.5"><Building className="w-4 h-4" />{profile.institution}</span>
              )}
              {profile.address && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.address}</span>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                  <Mail className="w-4 h-4" />{profile.email}
                </a>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{profile.phone}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Biography */}
            {profile.biography && (
              <section aria-labelledby="bio-heading">
                <SectionHeader title="Biography" id="bio-heading" />
                <div
                  className="prose-academic text-secondary-700"
                  dangerouslySetInnerHTML={{ __html: profile.biography }}
                />
              </section>
            )}

            {/* Research Statement */}
            {profile.researchStatement && (
              <section aria-labelledby="research-stmt-heading">
                <SectionHeader title="Research Statement" id="research-stmt-heading" />
                <div
                  className="prose-academic text-secondary-700"
                  dangerouslySetInnerHTML={{ __html: profile.researchStatement }}
                />
              </section>
            )}

            {/* Academic Appointments */}
            {appointments && appointments.length > 0 && (
              <section aria-labelledby="appointments-heading">
                <SectionHeader title="Academic Appointments" id="appointments-heading" />
                <ol className="space-y-6">
                  {appointments.map((appt) => (
                    <li key={appt._id} className="timeline-item">
                      <div className="timeline-dot" aria-hidden="true" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-secondary-900">{appt.title}</h3>
                          {appt.isCurrent && <span className="badge-green">Current</span>}
                        </div>
                        <p className="text-primary-700 font-medium">{appt.institution}</p>
                        {(appt.faculty || appt.department) && (
                          <p className="text-sm text-secondary-500">
                            {[appt.faculty, appt.department].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="text-sm text-secondary-400 mt-0.5">
                          {formatDateRange(appt.startDate, appt.endDate, appt.isCurrent)}
                        </p>
                        {appt.description && <p className="text-sm text-secondary-600 mt-2">{appt.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact card */}
            <div className="card p-6">
              <h2 className="font-semibold text-secondary-900 mb-4">Contact</h2>
              <div className="space-y-3 text-sm">
                {profile.office && <p className="text-secondary-600"><span className="font-medium">Office:</span> {profile.office}</p>}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-primary-600 hover:underline">
                    <Mail className="w-4 h-4" />{profile.email}
                  </a>
                )}
                {profile.orcid && (
                  <a href={`https://orcid.org/${profile.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                    <ExternalLink className="w-4 h-4" />ORCID: {profile.orcid}
                  </a>
                )}
              </div>
            </div>

            {/* External profiles */}
            {extProfiles && extProfiles.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-secondary-900 mb-4">Academic Profiles</h2>
                <ul className="space-y-2">
                  {extProfiles.filter((p) => p.active).map((p) => (
                    <li key={p._id}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        {p.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
