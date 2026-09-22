import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchResearchAreas, fetchFundedResearch } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import { FlaskConical, ExternalLink } from 'lucide-react';

const statusColor: Record<string, string> = {
  ACTIVE: 'badge-green',
  COMPLETED: 'badge-blue',
  PENDING: 'badge-yellow',
  CANCELLED: 'badge-red',
};

export default function Research() {
  const [page, setPage] = useState(1);
  const { data: areas, isLoading: areasLoading } = useQuery({ queryKey: ['research-areas'], queryFn: fetchResearchAreas, staleTime: Infinity });
  const { data: funded, isLoading: fundedLoading } = useQuery({
    queryKey: ['funded-research', { page }],
    queryFn: () => fetchFundedResearch({ page, limit: 8 }),
  });

  return (
    <>
      <SEOHead title="Research" description="Explore my research areas, funded projects, and research team." />

      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        {/* Research Areas */}
        <section className="mb-16" aria-labelledby="research-areas-heading">
          <SectionHeader title="Research Areas" subtitle="Core themes and disciplines driving my research" />
          {areasLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {areas?.map((area) => (
                <div key={area._id} className="card p-6 hover:shadow-card-hover transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <FlaskConical className="w-5 h-5 text-primary-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">{area.name}</h3>
                  {area.description && <p className="text-sm text-secondary-500 leading-relaxed">{area.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Funded Research */}
        <section aria-labelledby="funded-research-heading">
          <SectionHeader title="Funded Research" subtitle="Grants, fellowships, and collaborative research projects" />
          {fundedLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-5">
              {funded?.data.map((project) => (
                <article key={project._id} className="card p-6 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={statusColor[project.status] ?? 'badge-gray'}>{project.status}</span>
                        <span className="badge-orange text-xs">{project.fundingType}</span>
                      </div>
                      <Link to={`/funded-research/${project.slug}`}>
                        <h3 className="font-semibold text-secondary-900 hover:text-primary-700 transition-colors mb-1">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-secondary-500 mb-1">
                        <span className="font-medium">{project.funder}</span>
                        {project.grantNumber && ` · Grant #${project.grantNumber}`}
                      </p>
                      <p className="text-sm text-secondary-400">
                        PI: {project.principalInvestigator} ·{' '}
                        {formatDateRange(project.startDate, project.endDate, project.status === 'ACTIVE')}
                      </p>
                      {project.amount && (
                        <p className="text-sm text-secondary-500 mt-1">
                          {formatCurrency(project.amount, project.currency)}
                        </p>
                      )}
                    </div>
                    {project.externalUrl && (
                      <a href={project.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-ghost btn-icon shrink-0" aria-label="External link">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
              {funded?.pagination && (
                <Pagination pagination={funded.pagination} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
