import { useQuery } from '@tanstack/react-query';
import { fetchEducation } from '../../services/public';
import SEOHead from '../../components/common/SEOHead';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateRange } from '../../utils/formatters';
import { GraduationCap, ExternalLink } from 'lucide-react';

export default function Education() {
  const { data: education, isLoading } = useQuery({ queryKey: ['education'], queryFn: fetchEducation, staleTime: Infinity });

  return (
    <>
      <SEOHead title="Education" />
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Education" subtitle="Academic qualifications and degrees" />
        {isLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> : (
          <ol className="space-y-6">
            {education?.map((edu) => (
              <li key={edu._id} className="timeline-item">
                <div className="timeline-dot" aria-hidden="true" />
                <div className="card p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-primary-700" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900 text-lg">{edu.degree}</h3>
                      <p className="text-secondary-600 font-medium">{edu.field}</p>
                      <p className="text-primary-700">{edu.institution}</p>
                      {(edu.location || edu.country) && (
                        <p className="text-sm text-secondary-400">{[edu.location, edu.country].filter(Boolean).join(', ')}</p>
                      )}
                      <p className="text-sm text-secondary-400 mt-1">
                        {formatDateRange(edu.startDate, edu.completionDate)}
                      </p>
                      {edu.thesisTitle && (
                        <div className="mt-3">
                          <p className="text-sm text-secondary-500">
                            <span className="font-medium">Thesis:</span> {edu.thesisTitle}
                          </p>
                          {edu.thesisUrl && (
                            <a href={edu.thesisUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                              <ExternalLink className="w-3 h-3" />View Thesis
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
