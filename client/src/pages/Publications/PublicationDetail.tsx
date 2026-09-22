import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicationBySlug } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { ExternalLink, FileText, BookOpen } from 'lucide-react';
import { ResearchArea } from '../../types';

export default function PublicationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: pub, isLoading } = useQuery({
    queryKey: ['publication', slug],
    queryFn: () => fetchPublicationBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!pub) return <div className="container-max py-16 text-center text-secondary-500">Publication not found.</div>;

  return (
    <>
      <SEOHead title={pub.title} description={pub.abstract?.slice(0, 160)} />

      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: 'Publications', href: '/publications' }, { label: pub.title }]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge-blue">{pub.publicationType}</span>
                <span className="badge-gray">{pub.year}</span>
                {pub.featured && <span className="badge-yellow">Featured</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3 leading-tight">{pub.title}</h1>

              {/* Authors */}
              {pub.authors.length > 0 && (
                <div className="mb-3">
                  <p className="text-secondary-700">
                    {pub.authors.map((a, i) => (
                      <span key={i} className={a.isCorresponding ? 'font-medium' : ''}>
                        {a.name}{a.isCorresponding ? '*' : ''}{i < pub.authors.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              {/* Journal/Conference */}
              {(pub.journal || pub.conference) && (
                <p className="text-secondary-600 italic mb-2">
                  {pub.journal || pub.conference}
                  {pub.volume && `, Vol. ${pub.volume}`}
                  {pub.issue && `, No. ${pub.issue}`}
                  {pub.pages && `, pp. ${pub.pages}`}
                </p>
              )}
            </div>

            {/* Abstract */}
            {pub.abstract && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-secondary-900 mb-3">Abstract</h2>
                <div className="text-secondary-700 leading-relaxed bg-secondary-50 rounded-xl p-5 border border-secondary-100">
                  {pub.abstract}
                </div>
              </section>
            )}

            {/* Keywords */}
            {pub.keywords.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-2">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {pub.keywords.map((kw) => (
                    <span key={kw} className="badge-gray">{kw}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Citation */}
            {pub.citation && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-2">Citation</h2>
                <div className="bg-secondary-50 rounded-lg p-4 text-sm text-secondary-700 font-mono border border-secondary-200 select-all">
                  {pub.citation}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-secondary-900 mb-4">Publication Details</h2>
              <dl className="space-y-3 text-sm">
                {pub.doi && (
                  <div>
                    <dt className="text-secondary-500 text-xs uppercase tracking-wider">DOI</dt>
                    <dd><a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">{pub.doi}</a></dd>
                  </div>
                )}
                {pub.isbn && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider">ISBN</dt><dd className="text-secondary-700">{pub.isbn}</dd></div>}
                {pub.issn && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider">ISSN</dt><dd className="text-secondary-700">{pub.issn}</dd></div>}
                {pub.publisher && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider">Publisher</dt><dd className="text-secondary-700">{pub.publisher}</dd></div>}
                {pub.publicationDate && <div><dt className="text-secondary-500 text-xs uppercase tracking-wider">Published</dt><dd className="text-secondary-700">{formatDate(pub.publicationDate)}</dd></div>}
              </dl>
            </div>

            {/* Links */}
            <div className="card p-5 space-y-2">
              {pub.pdfUrl && (
                <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                  <FileText className="w-4 h-4" /> Download PDF
                </a>
              )}
              {pub.externalUrl && (
                <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                  <ExternalLink className="w-4 h-4" /> View Publication
                </a>
              )}
            </div>

            {/* Research Areas */}
            {(pub.researchAreas as ResearchArea[]).length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-secondary-900 mb-3">Research Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {(pub.researchAreas as ResearchArea[]).map((ra) => (
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
