import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchExternalProfiles } from '../../services/public';
import { BookOpen, Mail, MapPin } from 'lucide-react';

const platformIcons: Record<string, string> = {
  ORCID: '🔬',
  'Google Scholar': '🎓',
  ResearchGate: '🔭',
  LinkedIn: '💼',
  GitHub: '💻',
  Scopus: '📊',
  'Web of Science': '📚',
  YouTube: '▶',
  'Twitter/X': '𝕏',
  'Personal Website': '🌐',
};

export default function Footer() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, staleTime: Infinity });
  const { data: extProfiles } = useQuery({ queryKey: ['external-profiles'], queryFn: fetchExternalProfiles, staleTime: Infinity });

  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-secondary-300 mt-auto">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-white">{profile?.displayName || 'Academic Profile'}</span>
            </div>
            {profile?.professionalTitle && (
              <p className="text-sm mb-1 text-secondary-400">{profile.professionalTitle}</p>
            )}
            {profile?.institution && (
              <p className="text-sm text-secondary-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {profile.institution}
              </p>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="mt-2 text-sm flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {profile.email}
              </a>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['About', '/about'], ['Research', '/research'],
                ['Publications', '/publications'], ['Funded Research', '/funded-research'],
                ['Teaching', '/teaching'], ['Contact', '/contact'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External profiles */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Profiles</h3>
            <ul className="space-y-2 text-sm">
              {extProfiles?.filter((p) => p.active).map((p) => (
                <li key={p._id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span aria-hidden="true">{platformIcons[p.platform] || '🔗'}</span>
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-secondary-500">
          <p>© {year} {profile?.displayName || 'Academic Profile'}. All rights reserved.</p>
          <p>Built with MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
