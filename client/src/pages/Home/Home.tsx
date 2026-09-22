import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchResearchAreas, fetchPublications, fetchAwards } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowRight, BookOpen, FlaskConical, Trophy, Users } from 'lucide-react';

export default function Home() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, staleTime: Infinity });
  const { data: areas } = useQuery({ queryKey: ['research-areas'], queryFn: fetchResearchAreas, staleTime: Infinity });
  const { data: pubs } = useQuery({ queryKey: ['publications', { limit: 3, page: 1 }], queryFn: () => fetchPublications({ page: 1, limit: 3 }) });
  const { data: awards } = useQuery({ queryKey: ['awards'], queryFn: fetchAwards, staleTime: Infinity });

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <>
      <SEOHead
        title={profile ? undefined : 'Home'}
        description={profile?.shortBio}
        image={profile?.profilePhoto}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-primary-300 text-sm font-medium uppercase tracking-widest mb-3">
                {profile?.profileType || 'Academic Researcher'}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {profile?.displayName || 'Academic Profile'}
              </h1>
              <p className="text-primary-200 text-lg mb-2">
                {profile?.professionalTitle}
              </p>
              {profile?.institution && (
                <p className="text-primary-300 mb-6">{profile.institution}</p>
              )}
              {profile?.shortBio && (
                <p className="text-secondary-300 text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  {profile.shortBio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/about" className="btn-primary btn-lg">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/publications" className="btn btn-lg border border-primary-400 text-white hover:bg-primary-700/50">
                  Publications
                </Link>
                {profile?.cvUrl && (
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg border border-secondary-600 text-secondary-300 hover:bg-secondary-800/50">
                    Download CV
                  </a>
                )}
              </div>
            </div>

            {/* Photo */}
            {profile?.profilePhoto && (
              <div className="flex-shrink-0">
                <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-primary-500/30 shadow-2xl">
                  <img
                    src={profile.profilePhoto}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-secondary-100">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BookOpen, label: 'Publications', value: pubs?.pagination.total ?? '—', href: '/publications' },
              { icon: FlaskConical, label: 'Research Areas', value: areas?.length ?? '—', href: '/research' },
              { icon: Trophy, label: 'Awards', value: awards?.length ?? '—', href: '/awards' },
              { icon: Users, label: 'Students Supervised', value: '—', href: '/supervision' },
            ].map(({ icon: Icon, label, value, href }) => (
              <Link key={label} to={href} className="group">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-primary-50 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  <div className="text-3xl font-bold text-secondary-900 group-hover:text-primary-700 transition-colors">{value}</div>
                  <div className="text-sm text-secondary-500">{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      {areas && areas.length > 0 && (
        <section className="section bg-secondary-50">
          <div className="container-max">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Research Areas</h2>
                <div className="w-12 h-1 bg-primary-600 rounded-full mt-2" aria-hidden="true" />
              </div>
              <Link to="/research" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.slice(0, 6).map((area) => (
                <div key={area._id} className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                    <FlaskConical className="w-4 h-4 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-1">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm text-secondary-500 line-clamp-2">{area.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Publications */}
      {pubs && pubs.data.length > 0 && (
        <section className="section bg-white">
          <div className="container-max">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Recent Publications</h2>
                <div className="w-12 h-1 bg-primary-600 rounded-full mt-2" aria-hidden="true" />
              </div>
              <Link to="/publications" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {pubs.data.map((pub) => (
                <Link key={pub._id} to={`/publications/${pub.slug}`} className="card p-5 block hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-blue text-xs">{pub.publicationType}</span>
                        <span className="text-xs text-secondary-400">{pub.year}</span>
                      </div>
                      <h3 className="font-semibold text-secondary-900 hover:text-primary-700 transition-colors line-clamp-2">
                        {pub.title}
                      </h3>
                      {pub.authors.length > 0 && (
                        <p className="text-sm text-secondary-500 mt-1">
                          {pub.authors.slice(0, 3).map((a) => a.name).join(', ')}
                          {pub.authors.length > 3 && ' et al.'}
                        </p>
                      )}
                      {(pub.journal || pub.conference) && (
                        <p className="text-sm text-secondary-400 mt-0.5 italic">
                          {pub.journal || pub.conference}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary-400 shrink-0 mt-1" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-primary-700 text-white">
        <div className="container-max text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Interested in collaboration?</h2>
          <p className="text-primary-200 mb-8 max-w-xl mx-auto">
            I welcome collaboration opportunities in research, academic partnerships, and industry projects.
          </p>
          <Link to="/contact" className="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
