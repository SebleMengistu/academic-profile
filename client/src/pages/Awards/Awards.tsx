import { useQuery } from '@tanstack/react-query';
import { fetchAwards } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Trophy, ExternalLink } from 'lucide-react';

export default function Awards() {
  const { data: awards, isLoading } = useQuery({ queryKey: ['awards'], queryFn: fetchAwards, staleTime: Infinity });

  return (
    <>
      <SEOHead title="Awards & Honours" />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Awards & Honours" subtitle="Recognition and achievements" />
        {isLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : !awards?.length ? (
          <EmptyState icon={Trophy} title="No awards yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {awards.map((award) => (
              <article key={award._id} className="card p-6 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">
                  <Trophy className="w-5 h-5 text-yellow-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1">{award.name}</h3>
                <p className="text-primary-700 text-sm font-medium">{award.organization}</p>
                {award.category && <p className="text-xs text-secondary-400 mt-0.5">{award.category}</p>}
                {award.date && <p className="text-xs text-secondary-400 mt-1">{formatDate(award.date, { year: 'numeric', month: 'long' })}</p>}
                {award.description && <p className="text-sm text-secondary-600 mt-2 line-clamp-3">{award.description}</p>}
                {award.externalUrl && (
                  <a href={award.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />More info
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
