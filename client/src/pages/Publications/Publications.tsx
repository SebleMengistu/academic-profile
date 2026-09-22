import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublications, fetchResearchAreas } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, BookOpen, ExternalLink, FileText } from 'lucide-react';
import { Publication } from '../../types';

const TYPES = ['Journal Article','Conference Paper','Book','Book Chapter','Technical Report','Patent','Dataset','Software','Thesis','Poster','Other'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function Publications() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [area, setArea] = useState('');

  const { data: areas } = useQuery({ queryKey: ['research-areas'], queryFn: fetchResearchAreas, staleTime: Infinity });

  const params = { page, limit: 10, ...(search && { q: search }), ...(year && { year }), ...(type && { type }), ...(area && { area }) };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['publications', params],
    queryFn: () => fetchPublications(params),
    placeholderData: (prev) => prev,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(q);
    setPage(1);
  };

  const handleFilterChange = () => setPage(1);

  return (
    <>
      <SEOHead title="Publications" description="Browse all academic publications including journal articles, conference papers, and books." />

      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Publications" subtitle="Peer-reviewed articles, books, and other scholarly works" />

        {/* Search & Filters */}
        <div className="card p-5 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search publications…"
                className="form-input pl-9"
                aria-label="Search publications"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); handleFilterChange(); }}
              className="form-select"
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={type}
              onChange={(e) => { setType(e.target.value); handleFilterChange(); }}
              className="form-select"
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={area}
              onChange={(e) => { setArea(e.target.value); handleFilterChange(); }}
              className="form-select"
              aria-label="Filter by research area"
            >
              <option value="">All Research Areas</option>
              {areas?.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : !data?.data.length ? (
          <EmptyState icon={BookOpen} title="No publications found" description="Try adjusting your search or filters." />
        ) : (
          <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
            {data.data.map((pub) => <PublicationCard key={pub._id} pub={pub} />)}
            {data.pagination && (
              <Pagination pagination={data.pagination} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <article className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-blue">{pub.publicationType}</span>
            <span className="text-xs text-secondary-400">{pub.year}</span>
            {pub.featured && <span className="badge-yellow">Featured</span>}
          </div>
          <Link to={`/publications/${pub.slug}`}>
            <h3 className="font-semibold text-secondary-900 hover:text-primary-700 transition-colors mb-1 leading-snug">
              {pub.title}
            </h3>
          </Link>
          {pub.authors.length > 0 && (
            <p className="text-sm text-secondary-600 mb-1">
              {pub.authors.slice(0, 5).map((a) => a.name).join(', ')}
              {pub.authors.length > 5 && ' et al.'}
            </p>
          )}
          {(pub.journal || pub.conference) && (
            <p className="text-sm text-secondary-400 italic mb-2">
              {pub.journal || pub.conference}
              {pub.volume && `, ${pub.volume}`}
              {pub.issue && `(${pub.issue})`}
              {pub.pages && `, pp. ${pub.pages}`}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {pub.doi && (
              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />DOI
              </a>
            )}
            {pub.pdfUrl && (
              <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <FileText className="w-3 h-3" />PDF
              </a>
            )}
            {pub.externalUrl && (
              <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />View
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
