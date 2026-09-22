import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMedia } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Play, Image as ImageIcon, Mic, Newspaper, Monitor } from 'lucide-react';
import { MediaType } from '../../types';

const TYPES: MediaType[] = ['Video', 'Image', 'Interview', 'Podcast', 'News', 'Presentation', 'Other'];

const typeIcon: Record<string, React.ReactNode> = {
  Video: <Play className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  Interview: <Mic className="w-4 h-4" />,
  Podcast: <Mic className="w-4 h-4" />,
  News: <Newspaper className="w-4 h-4" />,
  Presentation: <Monitor className="w-4 h-4" />,
};

export default function Media() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');

  const params = { page, limit: 12, ...(type && { type }) };
  const { data, isLoading } = useQuery({
    queryKey: ['media', params],
    queryFn: () => fetchMedia(params),
    placeholderData: (prev) => prev,
  });

  return (
    <>
      <SEOHead title="Media" description="Videos, interviews, news coverage, and presentations." />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Media" subtitle="Videos, interviews, news coverage, and presentations" />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => { setType(''); setPage(1); }}
            className={`badge px-3 py-1.5 cursor-pointer transition-colors ${!type ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'}`}>
            All
          </button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={`badge px-3 py-1.5 cursor-pointer transition-colors ${type === t ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        : !data?.data.length ? <EmptyState icon={Monitor} title="No media items found" />
        : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.data.map((item) => (
                <Link key={item._id} to={`/media/${item.slug}`} className="card-hover block overflow-hidden group">
                  <div className="aspect-video bg-secondary-100 relative overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-400">
                        {typeIcon[item.type] || <Monitor className="w-8 h-8" />}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="badge-blue text-xs">{item.type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary-900 text-sm line-clamp-2 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                    {item.date && <p className="text-xs text-secondary-400 mt-1">{formatDate(item.date)}</p>}
                  </div>
                </Link>
              ))}
            </div>
            {data.pagination && (
              <Pagination pagination={data.pagination} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </>
        )}
      </div>
    </>
  );
}
