import { useQuery } from '@tanstack/react-query';
import { fetchTeaching, fetchSupervision } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateRange } from '../../utils/formatters';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function Teaching() {
  const { data: teaching, isLoading: tLoading } = useQuery({ queryKey: ['teaching'], queryFn: fetchTeaching, staleTime: Infinity });
  const { data: supervision, isLoading: sLoading } = useQuery({ queryKey: ['supervision'], queryFn: fetchSupervision, staleTime: Infinity });

  const groupedByYear: Record<string, typeof teaching> = {};
  teaching?.forEach((c) => {
    const yr = String(c.year || 'Ongoing');
    if (!groupedByYear[yr]) groupedByYear[yr] = [];
    groupedByYear[yr]!.push(c);
  });

  const currentSupervision = supervision?.filter((s) => s.status === 'Current') || [];
  const pastSupervision = supervision?.filter((s) => s.status !== 'Current') || [];

  return (
    <>
      <SEOHead title="Teaching" description="Courses taught and student supervision." />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">

        {/* Teaching */}
        <section className="mb-16" aria-labelledby="teaching-heading">
          <SectionHeader title="Teaching" subtitle="Courses and subjects taught across academic levels" />
          {tLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div>
          : !teaching?.length ? <EmptyState icon={BookOpen} title="No teaching records yet" />
          : (
            <div className="space-y-8">
              {Object.entries(groupedByYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, courses]) => (
                <div key={year}>
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">{year}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses?.map((c) => (
                      <div key={c._id} className="card p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-secondary-900">{c.courseName}</h4>
                            {c.courseCode && <p className="text-xs text-secondary-400 font-mono">{c.courseCode}</p>}
                          </div>
                          <span className="badge-blue text-xs shrink-0">{c.level}</span>
                        </div>
                        <p className="text-sm text-secondary-500 mb-1">{c.institution}</p>
                        {c.semester && <p className="text-xs text-secondary-400">{c.semester}</p>}
                        {c.description && <p className="text-sm text-secondary-600 mt-2 line-clamp-2">{c.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Supervision */}
        <section aria-labelledby="supervision-heading">
          <SectionHeader title="Student Supervision" subtitle="Current and completed research supervision" />
          {sLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div>
          : !supervision?.length ? <EmptyState icon={GraduationCap} title="No supervision records yet" />
          : (
            <div className="space-y-8">
              {currentSupervision.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">Current Students</h3>
                  <div className="space-y-3">
                    {currentSupervision.map((s) => (
                      <div key={s._id} className="card p-4 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-4 h-4 text-green-700" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-secondary-900">{s.studentName}</h4>
                          <p className="text-sm text-secondary-600">{s.degree} · {s.researchTopic}</p>
                          <p className="text-xs text-secondary-400">{s.role}{s.institution && ` · ${s.institution}`}</p>
                        </div>
                        <span className="badge-green ml-auto shrink-0">Current</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pastSupervision.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">Past Students</h3>
                  <div className="space-y-3">
                    {pastSupervision.map((s) => (
                      <div key={s._id} className="card p-4 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-4 h-4 text-secondary-400" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-secondary-900">{s.studentName}</h4>
                          <p className="text-sm text-secondary-600">{s.degree} · {s.researchTopic}</p>
                          <p className="text-xs text-secondary-400">
                            {s.role} · {formatDateRange(s.startDate, s.completionDate)}
                          </p>
                        </div>
                        <span className={`ml-auto shrink-0 ${s.status === 'Completed' ? 'badge-blue' : 'badge-red'}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
