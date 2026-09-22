import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchFundedResearchBySlug } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import { ExternalLink, Users } from 'lucide-react';
import { ResearchArea } from '../../types';

export default function FundedResearchDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ['funded-research', slug],
    queryFn: () => fetchFundedResearchBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!project) return <div className="container-max py-16 text-center text-secondary-500">Project not found.</div>;

  return (
    <>
      <SEOHead title={project.title} description={project.description?.slice(0, 160)} />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: 'Research', href: '/research' }, { label: project.title }]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge-orange">{project.fundingType}</span>
                <span className="badge-green">{project.status}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">{project.title}</h1>
              <p className="text-secondary-600">{project.funder}</p>
            </div>

            {project.description && (
              <div className="prose-academic text-secondary-700 mb-8" dangerouslySetInnerHTML={{ __html: project.description }} />
            )}

            {/* Team */}
            {project.teamMembers.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" aria-hidden="true" /> Research Team
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.teamMembers.map((m, i) => (
                    <div key={i} className="bg-secondary-50 rounded-lg p-3">
                      <p className="font-medium text-secondary-900">{m.name}</p>
                      <p className="text-sm text-secondary-500">{m.role}</p>
                      {m.affiliation && <p className="text-xs text-secondary-400">{m.affiliation}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-secondary-900 mb-4">Project Details</h2>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-secondary-500 text-xs uppercase tracking-wider mb-0.5">Period</dt>
                  <dd className="text-secondary-700">{formatDateRange(project.startDate, project.endDate, project.status === 'ACTIVE')}</dd></div>
                {project.amount && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider mb-0.5">Amount</dt>
                  <dd className="text-secondary-700">{formatCurrency(project.amount, project.currency)}</dd></div>}
                {project.grantNumber && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider mb-0.5">Grant #</dt>
                  <dd className="text-secondary-700">{project.grantNumber}</dd></div>}
                {project.fundingScheme && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider mb-0.5">Scheme</dt>
                  <dd className="text-secondary-700">{project.fundingScheme}</dd></div>}
              </dl>
              {project.externalUrl && (
                <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full mt-4 text-sm">
                  <ExternalLink className="w-4 h-4" /> Project Website
                </a>
              )}
            </div>
            {(project.researchAreas as ResearchArea[]).length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-secondary-900 mb-3">Research Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {(project.researchAreas as ResearchArea[]).map((ra) => (
                    <span key={ra._id || String(ra)} className="badge-blue">{ra.name || String(ra)}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
