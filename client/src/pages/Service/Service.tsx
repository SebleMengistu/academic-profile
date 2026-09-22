import { useQuery } from '@tanstack/react-query';
import { fetchServiceLeadership, fetchMemberships } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateRange } from '../../utils/formatters';
import { ExternalLink, Shield } from 'lucide-react';

export default function Service() {
  const { data: services, isLoading } = useQuery({ queryKey: ['service-leadership'], queryFn: fetchServiceLeadership, staleTime: Infinity });
  const { data: memberships } = useQuery({ queryKey: ['memberships'], queryFn: fetchMemberships, staleTime: Infinity });

  const grouped: Record<string, typeof services> = {};
  services?.forEach((s) => {
    if (!grouped[s.type]) grouped[s.type] = [];
    grouped[s.type]!.push(s);
  });

  return (
    <>
      <SEOHead title="Service & Leadership" />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Service & Leadership" subtitle="Professional service, editorial roles, and community engagement" />

        {isLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> : (
          <div className="space-y-10 mb-16">
            {Object.entries(grouped).map(([type, items]) => (
              <section key={type} aria-labelledby={`type-${type}`}>
                <h3 id={`type-${type}`} className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">{type}</h3>
                <div className="space-y-3">
                  {items?.map((s) => (
                    <div key={s._id} className="card p-5 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-primary-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-secondary-900">{s.role}</h4>
                            <p className="text-sm text-secondary-600">{s.organization}</p>
                            <p className="text-xs text-secondary-400 mt-0.5">
                              {formatDateRange(s.startDate, s.endDate, s.isCurrent)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {s.isCurrent && <span className="badge-green">Current</span>}
                            {s.externalUrl && (
                              <a href={s.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-icon">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Memberships */}
        {memberships && memberships.length > 0 && (
          <section aria-labelledby="memberships-heading">
            <SectionHeader title="Professional Memberships" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberships.map((m) => (
                <div key={m._id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-secondary-900">{m.organization}</p>
                      {m.role && <p className="text-sm text-secondary-500">{m.role}</p>}
                      {m.membershipType && <p className="text-xs text-secondary-400">{m.membershipType}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.isCurrent && <span className="badge-green text-xs">Active</span>}
                      {m.externalUrl && (
                        <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-icon">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
