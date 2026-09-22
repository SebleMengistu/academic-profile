import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaBySlug } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { ExternalLink } from 'lucide-react';

export default function MediaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: item, isLoading } = useQuery({
    queryKey: ['media', slug],
    queryFn: () => fetchMediaBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!item) return <div className="container-max py-16 text-center text-secondary-500">Media item not found.</div>;

  return (
    <>
      <SEOHead title={item.title} description={item.description?.slice(0, 160)} image={item.thumbnailUrl} />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <Breadcrumb items={[{ label: 'Media', href: '/media' }, { label: item.title }]} />
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge-blue">{item.type}</span>
          {item.date && <span className="text-sm text-secondary-400">{formatDate(item.date)}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">{item.title}</h1>
        {item.thumbnailUrl && (
          <div className="rounded-xl overflow-hidden mb-6 border border-secondary-100">
            <img src={item.thumbnailUrl} alt={item.caption || item.title} className="w-full object-cover max-h-[500px]" />
            {item.caption && <p className="text-xs text-secondary-500 p-3 bg-secondary-50">{item.caption}{item.credit && ` — ${item.credit}`}</p>}
          </div>
        )}
        {item.url && (
          <div className="mb-6">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ExternalLink className="w-4 h-4" /> View Original
            </a>
          </div>
        )}
        {item.description && (
          <div className="prose-academic text-secondary-700" dangerouslySetInnerHTML={{ __html: item.description }} />
        )}
      </div>
    </>
  );
}
